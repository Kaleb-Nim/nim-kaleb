import { describe, expect, test } from 'bun:test';
import { encode, decode } from '@msgpack/msgpack';
import { Pcm16StreamResampler, endsSentence } from './pcm';
import {
  appendTextToTts,
  buildStartEvent,
  finishTtsSession,
  handleFishMessage,
  readFishConfig,
  type FishHandle,
} from './tts';
import { resolveTtsProvider, getTtsClient } from '../tts';
import * as dashscope from '../dashscope/tts';
import * as fish from './tts';

function pcm(samples: number[]): Uint8Array {
  const out = new Uint8Array(samples.length * 2);
  const v = new DataView(out.buffer);
  samples.forEach((s, i) => v.setInt16(i * 2, s, true));
  return out;
}
function samples(bytes: Uint8Array): number[] {
  const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.length);
  return Array.from({ length: bytes.length / 2 }, (_, i) => v.getInt16(i * 2, true));
}

class FakeWs {
  readyState: number = WebSocket.OPEN;
  sent: unknown[] = [];
  send(data: Uint8Array) { this.sent.push(decode(data)); }
  close() { this.readyState = WebSocket.CLOSED; }
}

function fakeHandle(srcRate = 24000): { handle: FishHandle; ws: FakeWs } {
  const ws = new FakeWs();
  const handle: FishHandle = {
    ws: ws as unknown as WebSocket,
    finishing: false,
    done: false,
    resampler: new Pcm16StreamResampler(srcRate, 24000),
  };
  return { handle, ws };
}

function recorder() {
  const audio: string[] = [];
  const errors: string[] = [];
  let done = 0;
  return {
    audio, errors, get done() { return done; },
    cb: { onAudioDelta: (a: string) => audio.push(a), onDone: () => { done++; }, onError: (e: string) => errors.push(e) },
  };
}

describe('provider switch', () => {
  test('defaults to dashscope', () => {
    expect(resolveTtsProvider(undefined)).toBe('dashscope');
    expect(resolveTtsProvider('')).toBe('dashscope');
    expect(resolveTtsProvider('DashScope')).toBe('dashscope');
  });
  test('selects fish', () => {
    expect(resolveTtsProvider('fish')).toBe('fish');
    expect(getTtsClient('fish').createTtsSession).toBe(fish.createTtsSession);
    expect(getTtsClient('dashscope').createTtsSession).toBe(dashscope.createTtsSession);
  });
  test('unknown value falls back to dashscope', () => {
    expect(resolveTtsProvider('elevenlabs')).toBe('dashscope');
  });
});

describe('readFishConfig', () => {
  test('requires key and voice', () => {
    expect(readFishConfig({})).toBe('FISH_API_KEY is not set');
    expect(readFishConfig({ FISH_API_KEY: 'k' })).toBe('FISH_VOICE_ID is not set');
  });
  test('defaults: s2.1-pro, 24 kHz, balanced', () => {
    expect(readFishConfig({ FISH_API_KEY: 'k', FISH_VOICE_ID: 'v' })).toEqual({
      apiKey: 'k', voiceId: 'v', model: 's2.1-pro', sampleRate: 24000, latency: 'balanced',
    });
  });
  test('rejects bad sample rate and latency', () => {
    expect(readFishConfig({ FISH_API_KEY: 'k', FISH_VOICE_ID: 'v', FISH_SAMPLE_RATE: 'x' })).toContain('FISH_SAMPLE_RATE');
    expect(readFishConfig({ FISH_API_KEY: 'k', FISH_VOICE_ID: 'v', FISH_LATENCY: 'fast' })).toContain('FISH_LATENCY');
  });
  test('createTtsSession rejects without a key and reports the error', async () => {
    const saved = process.env.FISH_API_KEY;
    delete process.env.FISH_API_KEY;
    const r = recorder();
    await expect(fish.createTtsSession(r.cb)).rejects.toThrow('FISH_API_KEY is not set');
    expect(r.errors).toEqual(['FISH_API_KEY is not set']);
    if (saved !== undefined) process.env.FISH_API_KEY = saved;
  });
});

describe('protocol', () => {
  test('start event asks for raw pcm with the cloned voice', () => {
    const ev = buildStartEvent({ apiKey: 'k', voiceId: 'voice-123', model: 's2.1-pro', sampleRate: 24000, latency: 'balanced' });
    expect(ev).toMatchObject({ event: 'start', request: { text: '', reference_id: 'voice-123', format: 'pcm', sample_rate: 24000, latency: 'balanced' } });
    expect(JSON.stringify(ev)).not.toContain('"k"'); // api key never in the payload
  });

  test('text is sent, with flush at sentence ends; stop on finish', () => {
    const { handle, ws } = fakeHandle();
    appendTextToTts(handle, 'Hey there');
    appendTextToTts(handle, ', I am Kaleb.');
    finishTtsSession(handle);
    expect(ws.sent).toEqual([
      { event: 'text', text: 'Hey there' },
      { event: 'text', text: ', I am Kaleb.' },
      { event: 'flush' },
      { event: 'stop' },
    ]);
    expect(handle.finishing).toBe(true);
  });

  test('audio frames become base64 PCM deltas', () => {
    const { handle } = fakeHandle();
    const r = recorder();
    handleFishMessage(handle, r.cb, encode({ event: 'audio', audio: pcm([1, -2, 300]) }));
    expect(r.audio).toHaveLength(1);
    expect(samples(new Uint8Array(Buffer.from(r.audio[0], 'base64')))).toEqual([1, -2, 300]);
  });

  test('finish only counts as done after stop was sent, and only once', () => {
    const { handle } = fakeHandle();
    const r = recorder();
    handle.finishing = true;
    handleFishMessage(handle, r.cb, encode({ event: 'finish', reason: 'stop' }));
    handleFishMessage(handle, r.cb, encode({ event: 'finish', reason: 'stop' }));
    expect(r.done).toBe(1);
  });

  test('finish with error reason reports an error', () => {
    const { handle } = fakeHandle();
    const r = recorder();
    handleFishMessage(handle, r.cb, encode({ event: 'finish', reason: 'error' }));
    expect(r.errors).toEqual(['TTS error']);
    expect(r.done).toBe(0);
  });

  test('garbage frames report a decode error', () => {
    const { handle } = fakeHandle();
    const r = recorder();
    handleFishMessage(handle, r.cb, new Uint8Array([0xc1]));
    handleFishMessage(handle, r.cb, 'text frame');
    expect(r.errors).toHaveLength(2);
  });
});

describe('Pcm16StreamResampler', () => {
  test('passthrough keeps odd bytes across chunks', () => {
    const rs = new Pcm16StreamResampler(24000, 24000);
    const all = pcm([1000, -1000, 32767]);
    const a = rs.push(all.subarray(0, 3));
    const b = rs.push(all.subarray(3));
    expect(samples(a)).toEqual([1000]);
    expect(samples(b)).toEqual([-1000, 32767]);
  });

  test('44.1 kHz → 24 kHz yields the right sample count across chunks', () => {
    const rs = new Pcm16StreamResampler(44100, 24000);
    const total = 44100; // 1 s
    const src = Array.from({ length: total }, (_, i) => Math.round(10000 * Math.sin(i / 20)));
    let out: number[] = [];
    for (let i = 0; i < total; i += 1001) out = out.concat(samples(rs.push(pcm(src.slice(i, i + 1001)))));
    expect(Math.abs(out.length - 24000)).toBeLessThanOrEqual(1);
  });

  test('chunked output equals one-shot output', () => {
    const src = Array.from({ length: 5000 }, (_, i) => (i * 37) % 2000 - 1000);
    const one = samples(new Pcm16StreamResampler(44100, 24000).push(pcm(src)));
    const rs = new Pcm16StreamResampler(44100, 24000);
    let chunked: number[] = [];
    for (let i = 0; i < src.length; i += 333) chunked = chunked.concat(samples(rs.push(pcm(src.slice(i, i + 333)))));
    expect(chunked).toEqual(one);
  });

  test('upsampling 16 kHz → 24 kHz interpolates', () => {
    const out = samples(new Pcm16StreamResampler(16000, 24000).push(pcm([0, 300, 600, 900])));
    expect(out.slice(0, 4)).toEqual([0, 200, 400, 600]);
  });
});

describe('endsSentence', () => {
  test.each([
    ['Hello.', true], ['Really?', true], ['Wow!"', true], ['one; ', true], ['line\n', true],
    ['Hello', false], ['3.5', false], ['e.g', false],
  ])('%p → %p', (text, expected) => {
    expect(endsSentence(text)).toBe(expected);
  });
});
