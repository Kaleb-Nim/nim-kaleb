/**
 * Essential UI smoke tests — single desktop viewport.
 * Verifies terminal state machine and voice interface reachability.
 */

import { test, expect } from '@playwright/test';

test.describe('Terminal UI', () => {
  test.setTimeout(30_000);

  test('state machine progresses BOOTING -> STATUS -> MENU -> VOICE_IDLE', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Starfield + terminal render
    await expect(page.locator('canvas')).toBeVisible();
    await expect(page.locator('[class*="terminal"]').first()).toBeVisible();

    // STATUS reached
    await expect(page.getByText(/Cognitive Status as of/i))
      .toBeVisible({ timeout: 15_000 });
    console.log('[ui] STATUS reached');

    // MENU reached — input appears
    const input = page.getByLabel('Terminal command input');
    await expect(input).toBeVisible({ timeout: 15_000 });
    await expect(input).toBeEnabled();
    console.log('[ui] MENU reached');

    // Command "1" -> voice interface
    await input.fill('1');
    await input.press('Enter');
    const connectBtn = page.getByRole('button', { name: /connect/i });
    await expect(connectBtn).toBeVisible({ timeout: 10_000 });
    console.log('[ui] VOICE_IDLE reached — Connect button visible');
  });
});
