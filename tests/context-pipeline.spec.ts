/**
 * E2E tests for the personal-info context pipeline.
 *
 * Two test groups:
 *   1. Schema validation — assert context.json contains the expected merged fields
 *   2. API response validation — POST to /api/chat and assert the LLM reply
 *      surfaces data from the new context sections (personal_info, work_history,
 *      hobbies, contact).
 *
 * The chat route streams NDJSON: one JSON object per line, each shaped as
 *   { sentence: string; final: boolean }
 * We accumulate all sentences into a full response string before asserting.
 */

import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { join } from 'path';

// ─── helpers ────────────────────────────────────────────────────────────────

const ROOT = join(__dirname, '..');
const CONTEXT_PATH = join(ROOT, 'memory', 'context.json');

function loadContext() {
  return JSON.parse(readFileSync(CONTEXT_PATH, 'utf-8'));
}

/**
 * POST a single-turn message to /api/chat and return the fully accumulated
 * response text (all sentences joined).
 */
async function chatQuery(request: import('@playwright/test').APIRequestContext, question: string): Promise<string> {
  const res = await request.post('/api/chat', {
    data: { messages: [{ role: 'user', content: question }] },
    headers: { 'Content-Type': 'application/json' },
    timeout: 25_000,
  });

  expect(res.status()).toBe(200);

  const raw = await res.text();
  const lines = raw.trim().split('\n').filter(Boolean);

  const sentences = lines.map((line) => {
    const parsed = JSON.parse(line) as { sentence?: string; final?: boolean; error?: string };
    if (parsed.error) throw new Error(`Chat API error: ${parsed.error}`);
    return parsed.sentence ?? '';
  });

  return sentences.join(' ').trim();
}

// ─── 1. Schema validation ────────────────────────────────────────────────────

test.describe('context.json schema', () => {
  test('has personal_info with location and education', () => {
    const ctx = loadContext();
    expect(ctx.personal_info).toBeDefined();
    expect(typeof ctx.personal_info.location).toBe('string');
    expect(ctx.personal_info.location.length).toBeGreaterThan(0);
    expect(typeof ctx.personal_info.education).toBe('string');
    expect(ctx.personal_info.education.length).toBeGreaterThan(0);
  });

  test('has work_history with at least 3 entries', () => {
    const ctx = loadContext();
    expect(Array.isArray(ctx.work_history)).toBe(true);
    expect(ctx.work_history.length).toBeGreaterThanOrEqual(3);
    for (const entry of ctx.work_history) {
      expect(typeof entry.role === 'string' || typeof entry.company === 'string').toBe(true);
    }
  });

  test('has hobbies array with at least 2 items', () => {
    const ctx = loadContext();
    expect(Array.isArray(ctx.hobbies)).toBe(true);
    expect(ctx.hobbies.length).toBeGreaterThanOrEqual(2);
  });

  test('has contact with email and github', () => {
    const ctx = loadContext();
    expect(ctx.contact).toBeDefined();
    expect(typeof ctx.contact.email).toBe('string');
    expect(ctx.contact.email).toContain('@');
    expect(typeof ctx.contact.github).toBe('string');
    expect(ctx.contact.github).toContain('github');
  });

  test('existing identity/skills/projects fields are preserved', () => {
    const ctx = loadContext();
    expect(ctx.identity?.name).toBeTruthy();
    expect(Array.isArray(ctx.skills?.primary)).toBe(true);
    expect(Array.isArray(ctx.projects)).toBe(true);
  });
});

// ─── 2. API response validation ─────────────────────────────────────────────

test.describe('chat API — personal context responses', () => {
  test('returns location when asked where Kaleb is based', async ({ request }) => {
    const answer = await chatQuery(request, 'Where are you based?');
    console.log('[location]', answer);
    expect(answer.toLowerCase()).toMatch(/singapore/i);
  });

  test('returns work experience when asked about background', async ({ request }) => {
    const answer = await chatQuery(request, "What's your professional experience?");
    console.log('[work_history]', answer);
    // Expect at least one known employer to appear
    const hasEmployer =
      /raid|rsaf|a\*star|artc|tensorplex/i.test(answer);
    expect(hasEmployer).toBe(true);
  });

  test('returns a hobby when asked about interests', async ({ request }) => {
    const answer = await chatQuery(request, 'What do you do for fun?');
    console.log('[hobbies]', answer);
    const hasHobby =
      /ski|guitar|music|youtube|content|app/i.test(answer);
    expect(hasHobby).toBe(true);
  });

  test('returns contact info when asked how to reach Kaleb', async ({ request }) => {
    const answer = await chatQuery(request, 'How can I contact you?');
    console.log('[contact]', answer);
    const hasContact =
      /kaleb\.nim@gmail\.com|github\.com\/kaleb/i.test(answer);
    expect(hasContact).toBe(true);
  });

  test('response stays in-character and does not fabricate', async ({ request }) => {
    const answer = await chatQuery(request, 'What is your PhD topic?');
    console.log('[unknown]', answer);
    // Should not invent a PhD — must hedge or admit no data
    const hedges = /don't have|not loaded|no detail|i don't|unknown|not in context|no information/i;
    // Alternatively it may just correctly state he doesn't have a PhD
    const denies = /don'?t have a phd|no phd|diploma|polytechnic|not a phd/i;
    expect(hedges.test(answer) || denies.test(answer)).toBe(true);
  });
});
