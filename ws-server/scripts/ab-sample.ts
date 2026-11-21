// Old-vs-new listening pair: synthesise the same lines through the real DashScope
// and Fish clients (the exact code paths session.ts uses) and write 24 kHz WAVs.
//
//   cd ws-server && bun run fish:ab [outDir]
//
// Needs DASHSCOPE_API_KEY + DASHSCOPE_VOICE_ID and FISH_API_KEY + FISH_VOICE_ID.
// Text is streamed in small chunks like LLM output, so it exercises flush/resample too.

import { mkdir } from 'node:fs/promises';
import { getTtsClient, type TtsProvider } from '../src/tts';

// Neutral lines (no biographical claims) so the pair judges voice only.
const LINES = [
  "Hey! Thanks for stopping by. Ask me anything you'd like to know.",
  "Honestly, the fun part is the latency work. Getting a reply to start in under a second is harder than it sounds.",
  "Hmm, good question. Let me think about that for a second, because there are a couple of ways to answer it.",
];

const outDir = process.argv[2] ?? `${import.meta.dir}/../ab-samples`;

function wav(pcm: Uint8Array, rate = 24000): Uint8Array {
  const h = new DataView(new ArrayBuffer(44));
  const str = (o: number, s: string) => [...s].forEach((c, i) => h.setUint8(o + i, c.charCodeAt(0)));
  str(0, 'RIFF'); h.setUint32(4, 36 + pcm.length, true); str(8, 'WAVE');
  str(12, 'fmt '); h.setUint32(16, 16, true); h.setUint16(20, 1, true); h.setUint16(22, 1, true);
  h.setUint32(24, rate, true); h.setUint32(28, rate * 2, true); h.setUint16(32, 2, true); h.setUint16(34, 16, true);
  str(36, 'data'); h.setUint32(40, pcm.length, true);
  const out = new Uint8Array(44 + pcm.length);
  out.set(new Uint8Array(h.buffer)); out.set(pcm, 44);
  return out;
}

async function synth(provider: TtsProvider, text: string): Promise<{ pcm: Uint8Array; ttfaMs: number | null }> {
  const tts = getTtsClient(provider);
  const chunks: Uint8Array[] = [];
  let ttfaMs: number | null = null;
  const t0 = performance.now();
  await new Promise<void>((resolve, reject) => {
    tts.createTtsSession({
      onAudioDelta: (b64) => {
        if (ttfaMs === null) ttfaMs = Math.round(performance.now() - t0);
        chunks.push(new Uint8Array(Buffer.from(b64, 'base64')));
      },
      onDone: () => resolve(),
      onError: (m) => reject(new Error(`${provider}: ${m}`)),
    }).then((handle) => {
      // ~3-word chunks, like streamed LLM deltas
      const words = text.split(/(?<=\s)/);
      for (let i = 0; i < words.length; i += 3) tts.appendTextToTts(handle, words.slice(i, i + 3).join(''));
      tts.finishTtsSession(handle);
    }, reject);
  });
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const pcm = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) { pcm.set(c, off); off += c.length; }
  return { pcm, ttfaMs };
}

await mkdir(outDir, { recursive: true });
for (const provider of ['dashscope', 'fish'] as const) {
  const parts: Uint8Array[] = [];
  const gap = new Uint8Array(24000); // 0.5 s silence between lines
  for (const line of LINES) {
    const { pcm, ttfaMs } = await synth(provider, line);
    console.log(`[${provider}] ${(pcm.length / 48000).toFixed(1)} s, first audio ${ttfaMs} ms`);
    parts.push(pcm, gap);
  }
  const all = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let off = 0;
  for (const p of parts) { all.set(p, off); off += p.length; }
  const path = `${outDir}/${provider === 'dashscope' ? 'A-old-dashscope' : 'B-new-fish'}.wav`;
  await Bun.write(path, wav(all));
  console.log(`wrote ${path}`);
}
