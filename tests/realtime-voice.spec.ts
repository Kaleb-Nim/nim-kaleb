/**
 * E2E tests for the OpenAI Realtime voice interface.
 *
 * Tests:
 *   1. POST /api/realtime/session — returns a valid ephemeral token
 *   2. UI — voice interface renders with Connect button in VOICE_IDLE state
 *   3. Old endpoints (tts/stt/chat) are gone (return 404)
 */

import { test, expect } from '@playwright/test';

// ── Session endpoint ─────────────────────────────────────────────────────────

test.describe('POST /api/realtime/session', () => {
  test('returns an ephemeral token', async ({ request }) => {
    const res = await request.post('/api/realtime/session', { timeout: 15_000 });

    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.token).toBeDefined();
    expect(typeof json.token).toBe('string');
    expect(json.token.length).toBeGreaterThan(10);
    console.log('[session] token prefix:', json.token.slice(0, 20) + '…');
  });
});

// ── Old endpoints are removed ─────────────────────────────────────────────────

test.describe('Old voice pipeline routes are removed', () => {
  test('POST /api/chat returns 404', async ({ request }) => {
    const res = await request.post('/api/chat', {
      data: { messages: [{ role: 'user', content: 'hello' }] },
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status()).toBe(404);
  });

  test('POST /api/tts returns 404', async ({ request }) => {
    const res = await request.post('/api/tts', {
      data: { text: 'hello' },
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status()).toBe(404);
  });

  test('POST /api/stt returns 404', async ({ request }) => {
    const res = await request.post('/api/stt');
    expect(res.status()).toBe(404);
  });
});

// ── Voice UI ──────────────────────────────────────────────────────────────────

test.describe('Voice interface UI', () => {
  test('Connect button is visible after navigating to voice state', async ({ page }) => {
    await page.goto('/');

    // Wait for terminal to boot and reach MENU state (typewriter finishes)
    await page.waitForSelector('input[aria-label="Terminal command input"]', { timeout: 15_000 });

    // Type "1" and press Enter to trigger connection flow
    await page.fill('input[aria-label="Terminal command input"]', '1');
    await page.keyboard.press('Enter');

    // Wait for VoiceInterface to mount (Connect button should appear)
    const connectBtn = page.getByRole('button', { name: /connect/i });
    await expect(connectBtn).toBeVisible({ timeout: 10_000 });

    // Should show idle status label
    await expect(page.getByText(/click connect to start voice chat/i)).toBeVisible();

    console.log('[ui] Connect button visible ✓');
  });
});
