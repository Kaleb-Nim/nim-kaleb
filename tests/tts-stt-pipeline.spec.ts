/**
 * E2E tests for TTS and STT API endpoints.
 *
 * Tests:
 *   1. POST /api/tts — returns WAV audio bytes
 *   2. POST /api/stt — returns transcript from audio (Groq Whisper)
 *   3. Round-trip: TTS output fed to STT, verifying intelligible speech
 */

import { test, expect } from '@playwright/test';

// ─── TTS tests ──────────────────────────────────────────────────────────────

test.describe('TTS endpoint', () => {
  test('POST /api/tts returns WAV audio', async ({ request }) => {
    const res = await request.post('/api/tts', {
      data: { text: 'Hello, this is a test.', speaker: 'default' },
      headers: { 'Content-Type': 'application/json' },
      timeout: 60_000, // cold start may take time
    });

    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('audio/wav');

    const body = await res.body();
    // WAV files start with "RIFF" magic bytes
    const magic = body.slice(0, 4).toString();
    expect(magic).toBe('RIFF');
    // Should be a reasonable size (at least 1KB for a short utterance)
    expect(body.length).toBeGreaterThan(1024);
  });

  test('POST /api/tts rejects empty text', async ({ request }) => {
    const res = await request.post('/api/tts', {
      data: { text: '', speaker: 'default' },
      headers: { 'Content-Type': 'application/json' },
      timeout: 60_000,
    });

    // Should return 400 or 500 with error
    expect(res.status()).toBeGreaterThanOrEqual(400);
  });
});

// ─── STT tests (requires GROQ_API_KEY or running STT server) ───────────────

test.describe('STT endpoint', () => {
  test('POST /api/stt transcribes a WAV file', async ({ request }) => {
    // First generate audio via TTS
    const ttsRes = await request.post('/api/tts', {
      data: { text: 'The quick brown fox jumps over the lazy dog.', speaker: 'default' },
      headers: { 'Content-Type': 'application/json' },
      timeout: 60_000,
    });
    expect(ttsRes.status()).toBe(200);

    const wavBuffer = await ttsRes.body();

    // Send the WAV to STT via multipart form
    // Override Content-Type to let multipart boundary be set automatically
    const sttRes = await request.post('/api/stt', {
      multipart: {
        audio: {
          name: 'audio.wav',
          mimeType: 'audio/wav',
          buffer: wavBuffer,
        },
      },
      timeout: 30_000,
    });

    if (sttRes.status() !== 200) {
      console.log('[stt error]', await sttRes.text());
    }
    expect(sttRes.status()).toBe(200);
    const json = await sttRes.json();
    expect(json.transcript).toBeDefined();
    expect(typeof json.transcript).toBe('string');
    expect(json.transcript.length).toBeGreaterThan(0);

    console.log('[stt transcript]', json.transcript);

    // The transcript should contain some recognizable words from the input
    const transcript = json.transcript.toLowerCase();
    const hasRecognizedWords =
      /fox|quick|brown|jumps|lazy|dog/i.test(transcript);
    expect(hasRecognizedWords).toBe(true);
  });
});

// ─── Round-trip test ────────────────────────────────────────────────────────

test.describe('TTS → STT round-trip', () => {
  test('synthesized speech is transcribed back accurately', async ({ request }) => {
    const inputText = 'My name is Kaleb and I am a software engineer.';

    // TTS
    const ttsRes = await request.post('/api/tts', {
      data: { text: inputText, speaker: 'default' },
      headers: { 'Content-Type': 'application/json' },
      timeout: 60_000,
    });
    expect(ttsRes.status()).toBe(200);
    const wavBuffer = await ttsRes.body();

    // STT — override Content-Type to let multipart boundary be set automatically
    const sttRes = await request.post('/api/stt', {
      multipart: {
        audio: {
          name: 'audio.wav',
          mimeType: 'audio/wav',
          buffer: wavBuffer,
        },
      },
      timeout: 30_000,
    });
    expect(sttRes.status()).toBe(200);

    const json = await sttRes.json();
    const transcript = json.transcript.toLowerCase();
    console.log('[round-trip]', `"${inputText}" → "${json.transcript}"`);

    // Should capture key words from the input
    expect(transcript).toMatch(/kaleb|software|engineer/i);
  });
});
