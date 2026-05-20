#!/usr/bin/env bun
// Generate a one-off TTS sample via the Qwen3 realtime TTS WebSocket.
// Usage: bun run scripts/tts-sample.ts "text to speak" [output.wav]

import { createTtsSession, appendTextToTts, finishTtsSession } from '../ws-server/src/dashscope/tts';
import { writeFileSync } from 'fs';

const text = process.argv[2] ?? "hey there, I'm kaleb an AI Engineer from singapore";
const outPath = process.argv[3] ?? 'assets/reference-audio/samples/kaleb-intro.wav';

const SAMPLE_RATE = 24000;

function pcm16ToWav(pcm: Uint8Array, sampleRate: number): Uint8Array {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcm.byteLength;

  const buf = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buf);
  const writeStr = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeStr(36, 'data');
  view.setUint32(40, dataSize, true);

  const out = new Uint8Array(buf);
  out.set(pcm, 44);
  return out;
}

const chunks: Uint8Array[] = [];

const handle = await createTtsSession({
  onAudioDelta: (b64) => {
    chunks.push(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)));
  },
  onDone: () => {
    const total = chunks.reduce((n, c) => n + c.byteLength, 0);
    const merged = new Uint8Array(total);
    let off = 0;
    for (const c of chunks) { merged.set(c, off); off += c.byteLength; }
    const wav = pcm16ToWav(merged, SAMPLE_RATE);
    writeFileSync(outPath, wav);
    console.log(`Wrote ${outPath} (${(wav.byteLength / 1024).toFixed(1)} KB, ${(total / 2 / SAMPLE_RATE).toFixed(2)}s)`);
    process.exit(0);
  },
  onError: (msg) => {
    console.error('TTS error:', msg);
    process.exit(1);
  },
});

appendTextToTts(handle, text);
finishTtsSession(handle);

setTimeout(() => {
  console.error('Timeout: no response.done within 30s');
  process.exit(1);
}, 30000);
