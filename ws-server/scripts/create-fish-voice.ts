// One-off: create Kaleb's Fish Audio voice model from local reference clips.
// Prints the model id to put in ws-server/.env as FISH_VOICE_ID.
//
//   cd ws-server && bun run fish:create-voice                     # default clip
//   bun scripts/create-fish-voice.ts a.wav:a.txt b.wav            # explicit clips
// Bun auto-loads ws-server/.env and .env.local.
//
// Each arg is `audio[:transcript]`. Without a transcript Fish runs ASR on the clip.
// Default: assets/reference-audio/kaleb-reference.wav + kaleb-transcript.txt from the
// main checkout — the cleanest clip (noise floor -75 dBFS vs -51/-53 dBFS for the
// voice-assistant training_{1,2}_prepared.wav recordings). Clips are read, never moved.
// Each run creates one new private voice model on the Fish account.

import { basename } from 'node:path';

const MAIN_CHECKOUT_REF = '/Users/kalebnim/Documents/GitHub/nim-kaleb/assets/reference-audio';
const DEFAULT_CLIPS = [`${MAIN_CHECKOUT_REF}/kaleb-reference.wav:${MAIN_CHECKOUT_REF}/kaleb-transcript.txt`];

const apiKey = process.env.FISH_API_KEY;
if (!apiKey) {
  console.error('FISH_API_KEY is not set (put it in ws-server/.env)');
  process.exit(1);
}

const specs = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_CLIPS;
const form = new FormData();
form.append('title', process.env.FISH_VOICE_TITLE ?? 'Kaleb (portfolio clone)');
form.append('visibility', 'private');
form.append('type', 'tts');
form.append('train_mode', 'fast');
form.append('enhance_audio_quality', 'false');

for (const spec of specs) {
  const [audioPath, textPath] = spec.split(':');
  const audio = Bun.file(audioPath);
  if (!(await audio.exists())) {
    console.error(`missing clip: ${audioPath}`);
    process.exit(1);
  }
  form.append('voices', new File([await audio.arrayBuffer()], basename(audioPath), { type: 'audio/wav' }));
  if (textPath) form.append('texts', (await Bun.file(textPath).text()).trim());
  console.log(`+ ${basename(audioPath)}${textPath ? ' (with transcript)' : ''}`);
}

const res = await fetch('https://api.fish.audio/model', {
  method: 'POST',
  headers: { Authorization: `Bearer ${apiKey}` },
  body: form,
});
const body = await res.text();
if (!res.ok) {
  console.error(`Fish /model failed: ${res.status} ${body.slice(0, 500)}`);
  process.exit(1);
}
const model = JSON.parse(body) as { _id?: string; id?: string; state?: string };
console.log(`FISH_VOICE_ID=${model._id ?? model.id}  (state: ${model.state ?? 'unknown'})`);
