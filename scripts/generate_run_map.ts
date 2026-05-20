#!/usr/bin/env bun
// Generate a randomized variant of a workout-details screenshot via OpenAI GPT Image edit.
// Usage:
//   bun scripts/generate_run_map.ts [base-image-path] [--seed=<n>] [--out-dir=<path>]

import OpenAI, { toFile } from 'openai';
import { createReadStream, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { randomBytes } from 'node:crypto';

const DEFAULT_BASE_IMAGE =
  '/Users/kalebnim/Pictures/Photos Library.photoslibrary/resources/derivatives/3/3C868997-E990-49D3-AB20-9069C2073147_1_105_c.jpeg';
const DEFAULT_OUT_DIR = 'assets/generated/run-maps';

// ── arg parsing ─────────────────────────────────────────────
const positional: string[] = [];
let seedArg: number | null = null;
let outDirArg: string | null = null;
for (const a of process.argv.slice(2)) {
  if (a.startsWith('--seed=')) seedArg = Number(a.slice(7));
  else if (a.startsWith('--out-dir=')) outDirArg = a.slice(10);
  else positional.push(a);
}
const basePath = positional[0] ?? DEFAULT_BASE_IMAGE;
const outDir = outDirArg ?? DEFAULT_OUT_DIR;

// ── seedable RNG (mulberry32) ──────────────────────────────
function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = seedArg != null ? mulberry32(seedArg) : Math.random;
const randInt = (min: number, max: number) => Math.floor(rng() * (max - min + 1)) + min;
const randFloat = (min: number, max: number) => rng() * (max - min) + min;
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

// ── value generation ───────────────────────────────────────
type Values = ReturnType<typeof pickValues>;

function pickValues() {
  // Time-of-day (screenshot status bar)
  const hFrom = randInt(5, 22);
  const mFrom = randInt(0, 59);
  const bumpMin = randInt(1, 5);
  const totalMinTo = (hFrom * 60 + mFrom + bumpMin) % (24 * 60);
  const hTo = Math.floor(totalMinTo / 60);
  const mTo = totalMinTo % 60;

  const battery = randInt(25, 65);

  // Workout: distance × pace = elapsed (math constraint enforced)
  const distance_to_km = Math.round(randFloat(2.5, 5.0) * 10) / 10;
  const pace_to_sec = randInt(330, 690);
  const timing_to_sec = Math.round(distance_to_km * pace_to_sec);

  const distFromRaw = distance_to_km + (rng() < 0.5 ? -1 : 1) * randFloat(0.4, 1.2);
  const distance_from_km = Math.round(clamp(distFromRaw, 2.5, 5.0) * 10) / 10;
  const paceFromRaw = pace_to_sec + (rng() < 0.5 ? -1 : 1) * randInt(60, 240);
  const pace_from_sec = clamp(paceFromRaw, 330, 690);
  const timing_from_sec = Math.round(distance_from_km * pace_from_sec);

  // Elevation
  const elevation_from_m = randInt(2, 5);
  let elevation_to_m = randInt(2, 5);
  while (elevation_to_m === elevation_from_m) elevation_to_m = randInt(2, 5);

  // Cadence
  const cadence_from_spm = randInt(80, 130);
  const cadence_to_spm = randInt(140, 200);

  // Marker pixel shifts
  const green_marker_px = randInt(20, 200);
  const red_marker_px = randInt(20, 100);

  return {
    screenshot_time_from: { h: hFrom, m: mFrom },
    screenshot_time_to: { h: hTo, m: mTo },
    battery_pct: battery,
    distance_from_km,
    distance_to_km,
    pace_from_sec_per_km: pace_from_sec,
    pace_to_sec_per_km: pace_to_sec,
    timing_from_sec,
    timing_to_sec,
    elevation_from_m,
    elevation_to_m,
    cadence_from_spm,
    cadence_to_spm,
    green_marker_px,
    red_marker_px,
  };
}

// ── formatters ─────────────────────────────────────────────
const pad2 = (n: number) => n.toString().padStart(2, '0');
const formatHHMM = (t: { h: number; m: number }) => `${t.h}:${pad2(t.m)}`;
const formatClock = (sec: number) => {
  if (sec >= 3600) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h}:${pad2(m)}:${pad2(s)}`;
  }
  return `${pad2(Math.floor(sec / 60))}:${pad2(sec % 60)}`;
};
const formatPace = (sec: number) => `${pad2(Math.floor(sec / 60))}'${pad2(sec % 60)}"`;

// ── prompt template ────────────────────────────────────────
function buildPrompt(v: Values): string {
  return [
    `change screenshot time from ${formatHHMM(v.screenshot_time_from)} to ${formatHHMM(v.screenshot_time_to)},`,
    `battery percentage to ${v.battery_pct}%,`,
    `Distance covered from ${v.distance_from_km}km to ${v.distance_to_km}km,`,
    `timing from ${formatClock(v.timing_from_sec)} to ${formatClock(v.timing_to_sec)}.`,
    `Move the green circle slightly back. Do not change the aspect ratio for the image. add black padding to compensate.`,
    `Move the green circular start/position marker ${v.green_marker_px}px along the blue route.`,
    `Move the red circular end marker back ${v.red_marker_px}px along the blue route, blue route should end at the new red marker position.`,
    `Elevation gain ${v.elevation_from_m}m to ${v.elevation_to_m}m`,
    `Pace average from ${formatPace(v.pace_from_sec_per_km)} to ${formatPace(v.pace_to_sec_per_km)}`,
    `Cadence average from ${v.cadence_from_spm}spm to ${v.cadence_to_spm}spm`,
    `fill the green and blue bars empty gaps, add variance in height equally at the same timings for pace and cadence blue bars.`,
  ].join(' ');
}

// ── main ──────────────────────────────────────────────────
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('OPENAI_API_KEY missing — set it in .env.local');
  process.exit(1);
}

const values = pickValues();
const prompt = buildPrompt(values);

const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14); // YYYYMMDDHHMMSS
const tag = seedArg != null ? `seed${seedArg}` : randomBytes(3).toString('hex');
const outPng = resolve(outDir, `run-map-${stamp}-${tag}.png`);
const outJson = resolve(outDir, `run-map-${stamp}-${tag}.json`);
mkdirSync(dirname(outPng), { recursive: true });

console.log(`[generate_run_map] base:  ${basePath}`);
console.log(`[generate_run_map] seed:  ${seedArg ?? '(random)'}`);
console.log(`[generate_run_map] out:   ${outPng}`);
console.log(`[generate_run_map] prompt:\n${prompt}\n`);

const client = new OpenAI({ apiKey });

const imageFile = await toFile(createReadStream(basePath), 'base.jpg', { type: 'image/jpeg' });

console.log('[generate_run_map] calling images.edit (gpt-image-2)...');
const t0 = Date.now();
const response = await client.images.edit({
  // SDK v6.32.0 type literal does not include 'gpt-image-2' yet; the API accepts it.
  model: 'gpt-image-2' as never,
  image: imageFile,
  prompt,
  size: '1024x1536',
  quality: 'high' as never,
  // input_fidelity preserves UI structure on edits — only available on gpt-image-1/1.5/2
  input_fidelity: 'high' as never,
  output_format: 'png' as never,
  n: 1,
});
const elapsedMs = Date.now() - t0;

const b64 = response.data?.[0]?.b64_json;
if (!b64) {
  console.error('No b64_json in response:', JSON.stringify(response, null, 2));
  process.exit(1);
}

const pngBuf = Buffer.from(b64, 'base64');
writeFileSync(outPng, pngBuf);

const sidecar = {
  created_at: new Date().toISOString(),
  seed: seedArg,
  base_image: resolve(basePath),
  model: 'gpt-image-2',
  size: '1024x1536',
  elapsed_ms: elapsedMs,
  values: {
    ...values,
    formatted: {
      screenshot_time_from: formatHHMM(values.screenshot_time_from),
      screenshot_time_to: formatHHMM(values.screenshot_time_to),
      timing_from: formatClock(values.timing_from_sec),
      timing_to: formatClock(values.timing_to_sec),
      pace_from: formatPace(values.pace_from_sec_per_km),
      pace_to: formatPace(values.pace_to_sec_per_km),
    },
    math_check: {
      to_residual: Math.abs(values.distance_to_km * values.pace_to_sec_per_km - values.timing_to_sec),
      from_residual: Math.abs(values.distance_from_km * values.pace_from_sec_per_km - values.timing_from_sec),
    },
  },
  prompt,
};
writeFileSync(outJson, JSON.stringify(sidecar, null, 2));

console.log(
  `[generate_run_map] done in ${(elapsedMs / 1000).toFixed(1)}s · ${outPng} (${(pngBuf.byteLength / 1024).toFixed(0)} KB)`,
);
console.log(`[generate_run_map] sidecar: ${outJson}`);
