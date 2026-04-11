/**
 * Cross-viewport UI preservation smoke tests.
 *
 * Verifies the terminal state machine progression and visual layout
 * are intact across desktop, tablet, and mobile viewports.
 */

import { test, expect } from '@playwright/test';

const VIEWPORTS = {
  desktop: { width: 1280, height: 720 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 },
};

// ── Desktop ─────────────────────────────────────────────────────────────────

test.describe('Desktop viewport', () => {
  test.use({ viewport: VIEWPORTS.desktop });
  test.setTimeout(30_000);

  test('terminal renders with starfield background', async ({ page }) => {
    await page.goto('http://localhost:3000');
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    console.log('[ui] starfield canvas visible (desktop)');

    // Terminal container should be visible
    const terminal = page.locator('[class*="terminal"]').first();
    await expect(terminal).toBeVisible();
    console.log('[ui] terminal container visible (desktop)');
  });

  test('state machine progresses BOOTING -> STATUS -> MENU', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Wait for STATUS state — CognitiveStatus dashboard text
    await expect(page.getByText(/Cognitive Status as of/i))
      .toBeVisible({ timeout: 15_000 });
    console.log('[ui] STATUS state reached (desktop)');

    // Wait for MENU state — command input appears
    const input = page.getByLabel('Terminal command input');
    await expect(input).toBeVisible({ timeout: 15_000 });
    await expect(input).toBeEnabled();
    console.log('[ui] MENU state reached — input visible and enabled (desktop)');
  });

  test('typing 1 + Enter progresses to voice interface', async ({ page }) => {
    await page.goto('http://localhost:3000');

    const input = page.getByLabel('Terminal command input');
    await expect(input).toBeVisible({ timeout: 15_000 });

    await input.fill('1');
    await input.press('Enter');
    console.log('[ui] sent command "1" (desktop)');

    // Wait for Connect button in voice interface
    const connectBtn = page.getByRole('button', { name: /connect/i });
    await expect(connectBtn).toBeVisible({ timeout: 10_000 });
    console.log('[ui] voice interface Connect button visible (desktop)');
  });

  test('terminal has correct max-width for viewport', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Wait for terminal to render
    const terminal = page.locator('[class*="terminal"]').first();
    await expect(terminal).toBeVisible({ timeout: 10_000 });

    const box = await terminal.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeLessThanOrEqual(860);
    console.log(`[ui] terminal width: ${box!.width}px (max 860px)`);
  });
});

// ── Tablet ──────────────────────────────────────────────────────────────────

test.describe('Tablet viewport', () => {
  test.use({ viewport: VIEWPORTS.tablet });
  test.setTimeout(30_000);

  test('terminal renders with starfield background', async ({ page }) => {
    await page.goto('http://localhost:3000');
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    console.log('[ui] starfield canvas visible (tablet)');

    const terminal = page.locator('[class*="terminal"]').first();
    await expect(terminal).toBeVisible();
    console.log('[ui] terminal container visible (tablet)');
  });

  test('state machine progresses BOOTING -> STATUS -> MENU', async ({ page }) => {
    await page.goto('http://localhost:3000');

    await expect(page.getByText(/Cognitive Status as of/i))
      .toBeVisible({ timeout: 15_000 });
    console.log('[ui] STATUS state reached (tablet)');

    const input = page.getByLabel('Terminal command input');
    await expect(input).toBeVisible({ timeout: 15_000 });
    await expect(input).toBeEnabled();
    console.log('[ui] MENU state reached (tablet)');
  });

  test('typing 1 + Enter progresses to voice interface', async ({ page }) => {
    await page.goto('http://localhost:3000');

    const input = page.getByLabel('Terminal command input');
    await expect(input).toBeVisible({ timeout: 15_000 });

    await input.fill('1');
    await input.press('Enter');

    const connectBtn = page.getByRole('button', { name: /connect/i });
    await expect(connectBtn).toBeVisible({ timeout: 10_000 });
    console.log('[ui] voice interface reached (tablet)');
  });
});

// ── Mobile ──────────────────────────────────────────────────────────────────

test.describe('Mobile viewport', () => {
  test.use({ viewport: VIEWPORTS.mobile });
  test.setTimeout(30_000);

  test('terminal renders with starfield background', async ({ page }) => {
    await page.goto('http://localhost:3000');
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    console.log('[ui] starfield canvas visible (mobile)');

    const terminal = page.locator('[class*="terminal"]').first();
    await expect(terminal).toBeVisible();
    console.log('[ui] terminal container visible (mobile)');
  });

  test('state machine progresses BOOTING -> STATUS -> MENU', async ({ page }) => {
    await page.goto('http://localhost:3000');

    await expect(page.getByText(/Cognitive Status as of/i))
      .toBeVisible({ timeout: 15_000 });
    console.log('[ui] STATUS state reached (mobile)');

    const input = page.getByLabel('Terminal command input');
    await expect(input).toBeVisible({ timeout: 15_000 });
    await expect(input).toBeEnabled();
    console.log('[ui] MENU state reached (mobile)');
  });

  test('typing 1 + Enter progresses to voice interface', async ({ page }) => {
    await page.goto('http://localhost:3000');

    const input = page.getByLabel('Terminal command input');
    await expect(input).toBeVisible({ timeout: 15_000 });

    await input.fill('1');
    await input.press('Enter');

    const connectBtn = page.getByRole('button', { name: /connect/i });
    await expect(connectBtn).toBeVisible({ timeout: 10_000 });
    console.log('[ui] voice interface reached (mobile)');
  });

  test('terminal uses ~95vw on mobile', async ({ page }) => {
    await page.goto('http://localhost:3000');

    const terminal = page.locator('[class*="terminal"]').first();
    await expect(terminal).toBeVisible({ timeout: 10_000 });

    const box = await terminal.boundingBox();
    expect(box).not.toBeNull();
    // 95vw of 375px = 356.25px, allow 10px tolerance
    const expected95vw = 375 * 0.95;
    expect(box!.width).toBeGreaterThan(expected95vw - 10);
    expect(box!.width).toBeLessThanOrEqual(375);
    console.log(`[ui] terminal width: ${box!.width}px (~95vw of 375px = ${expected95vw}px)`);
  });
});
