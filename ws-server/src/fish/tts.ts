// Fish Audio TTS WebSocket client (wss://api.fish.audio/v1/tts/live).
// Same interface as dashscope/tts.ts so session.ts can switch on TTS_PROVIDER.
// FISH_API_KEY and the voice (FISH_VOICE_ID = a trained Fish voice model, the default;
// FISH_REFERENCE_AUDIO + FISH_REFERENCE_TEXT = inline zero-shot fallback) are read from process.env only and are never
// configurable via browser messages (same rule as T-02-08).
//
// Protocol (MessagePack frames): client sends start → text* → flush* → stop;
// server sends audio* → finish { reason: 'stop' | 'error' } and then closes.

import { readFileSync } from 'node:fs';
import { encode, decode } from '@msgpack/msgpack';
import type { TtsCallbacks, TtsHandle } from '../tts/types';
import { OUTPUT_SAMPLE_RATE } from '../tts/types';
import { Pcm16StreamResampler, endsSentence } from './pcm';

export const FISH_TTS_WS_URL = 'wss://api.fish.audio/v1/tts/live';
export const DEFAULT_FISH_MODEL = 's2.1-pro';

export type FishLatency = 'low' | 'balanced' | 'normal';

/** A stored Fish voice model, or an inline reference clip cloned zero-shot per session. */
export type FishVoice =
  | { kind: 'model'; referenceId: string }
  | { kind: 'inline'; audio: Uint8Array; text: string };

export interface FishConfig {
  apiKey: string;
  voice: FishVoice;
  model: string;
  /** Rate requested from Fish; resampled to 24 kHz if different */
  sampleRate: number;
  latency: FishLatency;
}

type FileReader = (path: string) => Uint8Array;

// Inline reference clips are read once per process, not per turn.
const fileCache = new Map<string, Uint8Array>();
const readCached: FileReader = (path) => {
  let data = fileCache.get(path);
  if (!data) {
    data = new Uint8Array(readFileSync(path));
    fileCache.set(path, data);
  }
  return data;
};

/** Read Fish settings from env. Returns an error string instead of throwing. */
export function readFishConfig(
  env: Record<string, string | undefined> = process.env,
  readFile: FileReader = readCached
): FishConfig | string {
  const apiKey = env.FISH_API_KEY;
  if (!apiKey) return 'FISH_API_KEY is not set';

  let voice: FishVoice;
  if (env.FISH_VOICE_ID) {
    voice = { kind: 'model', referenceId: env.FISH_VOICE_ID };
  } else if (env.FISH_REFERENCE_AUDIO && env.FISH_REFERENCE_TEXT) {
    try {
      const audio = readFile(env.FISH_REFERENCE_AUDIO);
      const text = new TextDecoder().decode(readFile(env.FISH_REFERENCE_TEXT)).trim();
      if (!text) return 'FISH_REFERENCE_TEXT is empty';
      voice = { kind: 'inline', audio, text };
    } catch {
      return 'FISH_REFERENCE_AUDIO or FISH_REFERENCE_TEXT could not be read';
    }
  } else {
    return 'Set FISH_VOICE_ID, or FISH_REFERENCE_AUDIO + FISH_REFERENCE_TEXT';
  }

  const sampleRate = Number(env.FISH_SAMPLE_RATE ?? OUTPUT_SAMPLE_RATE);
  if (!Number.isInteger(sampleRate) || sampleRate <= 0) return 'FISH_SAMPLE_RATE must be a positive integer';
  const latency = (env.FISH_LATENCY ?? 'balanced') as FishLatency;
  if (!['low', 'balanced', 'normal'].includes(latency)) return 'FISH_LATENCY must be low, balanced or normal';
  return { apiKey, voice, model: env.FISH_MODEL || DEFAULT_FISH_MODEL, sampleRate, latency };
}

export function buildStartEvent(cfg: FishConfig): Record<string, unknown> {
  const voice =
    cfg.voice.kind === 'model'
      ? { reference_id: cfg.voice.referenceId }
      : { references: [{ audio: cfg.voice.audio, text: cfg.voice.text }] };
  return {
    event: 'start',
    request: {
      text: '',
      ...voice,
      format: 'pcm',
      sample_rate: cfg.sampleRate,
      latency: cfg.latency,
      normalize: true,
    },
  };
}

export interface FishHandle extends TtsHandle {
  resampler: Pcm16StreamResampler;
  done: boolean;
}

function toUint8(data: unknown): Uint8Array | null {
  if (data instanceof Uint8Array) return data;
  if (data instanceof ArrayBuffer) return new Uint8Array(data);
  if (ArrayBuffer.isView(data)) return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  return null;
}

/**
 * Route one decoded server frame to callbacks. Exported for tests.
 */
export function handleFishMessage(handle: FishHandle, callbacks: TtsCallbacks, raw: unknown): void {
  const bytes = toUint8(raw);
  if (!bytes) {
    callbacks.onError('TTS: unexpected non-binary frame');
    return;
  }
  let msg: { event?: string; audio?: unknown; reason?: string; message?: string };
  try {
    msg = decode(bytes) as typeof msg;
  } catch {
    callbacks.onError('TTS: failed to decode message');
    return;
  }

  switch (msg.event) {
    case 'audio': {
      const audio = toUint8(msg.audio);
      if (!audio || audio.length === 0) return;
      const pcm = handle.resampler.push(audio);
      if (pcm.length > 0) callbacks.onAudioDelta(Buffer.from(pcm).toString('base64'));
      break;
    }
    case 'finish':
      if (handle.done) return;
      handle.done = true;
      if (msg.reason === 'error') {
        callbacks.onError(msg.message ?? 'TTS error');
      } else if (handle.finishing) {
        callbacks.onDone();
      }
      // Fish doesn't always close after finish; close it ourselves so sockets don't
      // pile up against the account's concurrency limit.
      if (handle.ws.readyState === WebSocket.OPEN) handle.ws.close(1000, 'finished');
      break;
    default:
      // Unknown/informational events — ignore
      break;
  }
}

/**
 * Open a Fish Audio TTS session. Resolves once the socket is open and the
 * start event has been sent. onDone fires once, after finishTtsSession() and
 * the server's finish event.
 */
export function createTtsSession(callbacks: TtsCallbacks): Promise<TtsHandle> {
  const cfg = readFishConfig();
  if (typeof cfg === 'string') {
    callbacks.onError(cfg);
    return Promise.reject(new Error(cfg));
  }

  return new Promise<TtsHandle>((resolve, reject) => {
    const ws = new WebSocket(FISH_TTS_WS_URL, {
      // @ts-expect-error — Bun's WebSocket constructor accepts headers as second arg
      headers: {
        Authorization: 'Bearer ' + cfg.apiKey,
        model: cfg.model,
      },
    });
    ws.binaryType = 'arraybuffer';

    const handle: FishHandle = {
      ws,
      finishing: false,
      done: false,
      resampler: new Pcm16StreamResampler(cfg.sampleRate, OUTPUT_SAMPLE_RATE),
    };
    let opened = false;

    ws.onopen = () => {
      opened = true;
      ws.send(encode(buildStartEvent(cfg)));
      resolve(handle);
    };

    ws.onmessage = (event) => handleFishMessage(handle, callbacks, event.data);

    ws.onclose = (event) => {
      console.log(`[tts:fish] WebSocket closed (${event.code})`);
      // Server closed without a finish event after we asked to stop: treat as done
      // so the browser isn't left waiting. Aborted sessions have done=true already.
      if (!handle.done && handle.finishing && event.code === 1000) {
        handle.done = true;
        callbacks.onDone();
      } else if (!handle.done && opened && event.code !== 1000) {
        handle.done = true;
        callbacks.onError(`TTS connection closed (${event.code}${event.reason ? ': ' + event.reason : ''})`);
      }
    };

    ws.onerror = () => {
      if (!opened) {
        handle.done = true;
        callbacks.onError('TTS WebSocket connection error');
        reject(new Error('TTS WebSocket connection error'));
      }
    };
  });
}

/** Append LLM text; flush at sentence boundaries so synthesis starts promptly. */
export function appendTextToTts(handle: TtsHandle, text: string): void {
  if (handle.ws.readyState !== WebSocket.OPEN || !text) return;
  handle.ws.send(encode({ event: 'text', text }));
  if (endsSentence(text)) handle.ws.send(encode({ event: 'flush' }));
}

/** Signal that all text has been sent; the server finishes and sends `finish`. */
export function finishTtsSession(handle: TtsHandle): void {
  if (handle.ws.readyState !== WebSocket.OPEN) return;
  handle.finishing = true;
  handle.ws.send(encode({ event: 'stop' }));
}

/** Barge-in: drop the session immediately without waiting for buffered audio. */
export function abortTtsSession(handle: TtsHandle): void {
  (handle as FishHandle).done = true;
  if (handle.ws.readyState === WebSocket.OPEN || handle.ws.readyState === WebSocket.CONNECTING) {
    handle.ws.close(1000, 'barge-in');
  }
}
