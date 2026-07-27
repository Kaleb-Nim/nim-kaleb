# Testing Patterns

**Analysis Date:** 2026-07-27

## Test Framework

**Primary: Playwright (E2E/Integration)**
- Framework: `@playwright/test` 1.58.2
- Config: `playwright.config.ts` (root level)
- Test directory: `tests/` (all files with `.spec.ts` extension)

**Secondary: Bun Test (Unit)**
- Framework: Native `bun:test` built into Bun runtime
- Test location: `app/lib/*.test.ts` (co-located with source)

**Assertion Library:**
- Playwright: built-in `expect()` function
- Bun: built-in `expect()` function (compatible)

**Run Commands:**
```bash
bun run test              # Run all tests via Playwright
bun run test:headed       # Run with visible browser window
bunx playwright test      # Direct Playwright invocation
bun test                  # Run Bun tests only
```

## Test File Organization

**Location & Naming:**
- Playwright tests: `tests/*.spec.ts`
- Unit tests: `app/lib/*.test.ts` (co-located next to source)
- Currently existing test files:
  - `tests/tts-stt-pipeline.spec.ts` — TTS/STT API endpoints
  - `tests/ws-pipeline.spec.ts` — WebSocket backend and DashScope integration
  - `tests/context-pipeline.spec.ts` — Personal context schema and chat API
  - `tests/ui-preservation.spec.ts` — Terminal UI state machine
  - `app/lib/hackathonLinks.test.ts` — URL classification logic

**File Structure:**
- Each Playwright spec file opens with JSDoc describing scope and requirements
- Example from `ws-pipeline.spec.ts`:
  ```typescript
  /**
   * Backend/WebSocket pipeline tests for the Bun WS server and DashScope APIs.
   *
   * Tests:
   *   1. WS server health endpoint
   *   2. WebSocket upgrade and session.start handshake
   *   3. DashScope TTS WebSocket connection
   *   ...
   *
   * Requires:
   *   - WS server running on localhost:8080
   *   - DASHSCOPE_API_KEY set in ws-server/.env.local
   */
  ```

## Test Structure

**Playwright Suite Organization:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Group', () => {
  test.setTimeout(30_000);  // Global timeout for suite
  
  test('should do something', async ({ page, request }) => {
    // Arrange
    const response = await request.post('/api/endpoint', {
      data: { ... },
      headers: { 'Content-Type': 'application/json' },
      timeout: 60_000,
    });
    
    // Assert
    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(json.field).toBeDefined();
  });
});
```

**Bun Test Suite Organization:**
```typescript
import { describe, expect, test } from 'bun:test';

describe('Feature Group', () => {
  test('1. single test case name', () => {
    const result = functionUnderTest(input);
    expect(result).toEqual(expected);
  });
  
  test('2. numbered naming for sequential logic', () => {
    // ...
  });
});
```

**Patterns:**
- Test names are descriptive; numbered when order matters (`test('1. first case', ...)`)
- Setup: helper functions defined above or in shared test utilities
- Teardown: implicit via Playwright test context cleanup or explicit `afterEach()`
- Assertions: inline, no assertion helper wrappers

## Mocking

**Framework:** No formal mocking library; uses native patterns

**Patterns Observed:**

**Playwright:**
- Mock API responses via `request.post()` directly to real endpoint (integration test style)
- Intercept responses with `page.route()` if needed (not yet used in test suite)
- Environment variables for configuration (DASHSCOPE_API_KEY, DASHSCOPE_VOICE_ID)

**Bun Test:**
- No mocks; tests call pure functions directly
- Example from `hackathonLinks.test.ts`:
  ```typescript
  const make = (project_url: string, extra_links: string[] | null = null) => ({
    project_url,
    extra_links,
  });
  
  test('devpost-only single URL', () => {
    const out = classifyHackathonLinks(make('https://devpost.com/software/foodr-ihad3c'));
    expect(out).toEqual([{ label: 'DEVPOST', href: '...' }]);
  });
  ```

**What to Mock:**
- External API calls in E2E tests: mock via environment variables (e.g., test API keys) or skip if unavailable
- DashScope: requires real keys for ws-pipeline tests (tests fail gracefully if DASHSCOPE_API_KEY not set)

**What NOT to Mock:**
- Pure functions: test with real inputs and outputs
- HTTP endpoints: test integration with real server (Playwright starts `bun dev` via webServer config)
- WebSocket connections: test with real WS server when possible

## Fixtures and Factories

**Test Data Patterns:**

**Playwright:**
- Fixtures: None currently used; tests construct data inline or via helper functions
- Helper functions: defined at module level before test.describe()
  ```typescript
  function openWs(url: string, protocols?: string[]): Promise<{ ws, messages, waitForMessage, close }> {
    // Helper to open raw WebSocket and collect messages
  }
  
  async function chatQuery(request, question: string): Promise<string> {
    // Helper to POST to /api/chat and accumulate NDJSON response
  }
  ```

**Bun Test:**
- Factory pattern: `make()` helper creates test objects
  ```typescript
  const make = (project_url: string, extra_links: string[] | null = null) => ({
    project_url,
    extra_links,
  });
  ```
- No fixture library; data is hardcoded or factory-generated

**Location:**
- Helpers defined in test file itself (small, self-contained)
- No shared fixtures directory yet

## Coverage

**Requirements:** Not enforced; no coverage target configured

**View Coverage:**
- Run: `bun run test --coverage` (if supported by Playwright version)
- Currently: no coverage reports generated

**Known Gaps:**
- `app/components/` not tested (E2E tests cover UI indirectly)
- `ws-server/src/dashscope/` partially tested via ws-pipeline.spec.ts
- Error paths not fully exercised in ws-pipeline tests

## Test Types

**Unit Tests:**
- Scope: Pure functions, data transformations
- Approach: Direct function calls, hardcoded inputs, assertion on output
- Example: `app/lib/hackathonLinks.test.ts` — tests URL classification logic with 12 cases
- Framework: Bun test
- Speed: <1ms per test

**Integration Tests:**
- Scope: API endpoints (Next.js routes), WebSocket connections, context schema
- Approach: HTTP requests to running dev server, WebSocket handshakes, JSON schema validation
- Examples:
  - `tests/tts-stt-pipeline.spec.ts` — tests `/api/tts` and `/api/stt` endpoints with real audio
  - `tests/context-pipeline.spec.ts` — validates `memory/context.json` structure and `/api/chat` responses
  - `tests/ws-pipeline.spec.ts` — tests WebSocket server upgrade, DashScope connections
- Framework: Playwright
- Speed: 5-60s per test (API latency, audio generation)

**E2E Tests:**
- Scope: Full user journey, terminal UI state machine
- Approach: Browser navigation, element visibility assertions, user interaction simulation
- Example: `tests/ui-preservation.spec.ts` — verifies BOOTING → STATUS → MENU → VOICE_IDLE progression
- Framework: Playwright with headless browser
- Speed: 15-30s per test

## Common Patterns

**Async Testing (Playwright):**
```typescript
test('does something async', async ({ page, request }) => {
  // Await promises
  const res = await request.post('/api/endpoint', { ... });
  const json = await res.json();
  
  // Explicit timeouts for slow operations
  await expect(page.getByText(/some text/i)).toBeVisible({ timeout: 15_000 });
});
```

**Async Testing (Bun):**
- Bun test automatically handles async functions; no special wrapper needed
- Use `await` naturally in test body

**Error Testing (Playwright):**
```typescript
test('rejects invalid input', async ({ request }) => {
  const res = await request.post('/api/tts', {
    data: { text: '', speaker: 'default' },
  });
  
  // Assert error status
  expect(res.status()).toBeGreaterThanOrEqual(400);
});
```

**Error Testing (Bun):**
```typescript
test('invalid URL is silently skipped', () => {
  const p = make('https://devpost.com/x', ['not-a-url']);
  const out = classifyHackathonLinks(p);
  expect(out.length).toBe(1);
});
```

**Test Helpers (WebSocket):**
```typescript
function openWs(url: string, protocols?: string[]): Promise<{
  ws: WebSocket;
  messages: string[];
  waitForMessage: (predicate: (msg: unknown) => boolean, timeoutMs?: number) => Promise<unknown>;
  close: () => void;
}> {
  // Opens WebSocket, buffers messages, provides waitForMessage() helper
  // Returns promise that resolves when WS opens
}

// Usage:
const { ws, waitForMessage, close } = await openWs('ws://localhost:8080');
const response = await waitForMessage((m) => m.type === 'session.start', 5_000);
close();
```

**Labeled Logging (Test Debugging):**
```typescript
console.log('[ui] STATUS reached');
console.log('[stt error]', await sttRes.text());
console.log('[ws-server] health check passed');
```
- Bracket prefixes indicate context for easy parsing
- Used to trace test execution flow in CI logs

**Multipart Form Uploads (Playwright):**
```typescript
// Critical: DON't set global Content-Type — it breaks multipart boundaries
// playwright.config.ts ensures this:
use: {
  baseURL: 'http://localhost:3000',
  // Don't set global Content-Type — it breaks multipart form uploads
  // Individual tests set Content-Type as needed
}

// In test: let Playwright set multipart boundary automatically
const res = await request.post('/api/stt', {
  multipart: {
    audio: {
      name: 'audio.wav',
      mimeType: 'audio/wav',
      buffer: wavBuffer,
    },
  },
});
```

**NDJSON Parsing (Playwright):**
```typescript
const raw = await res.text();
const lines = raw.trim().split('\n').filter(Boolean);
const data = lines.map((line) => {
  const parsed = JSON.parse(line) as { sentence?: string; final?: boolean; error?: string };
  if (parsed.error) throw new Error(`API error: ${parsed.error}`);
  return parsed.sentence ?? '';
});
```
- Used in context-pipeline tests to accumulate streaming responses

## Playwright Configuration

**File:** `playwright.config.ts`

**Key Settings:**
```typescript
{
  testDir: './tests',
  timeout: 30_000,              // 30s per test
  retries: 0,                   // No retry on failure (fail fast in CI)
  reporter: 'list',             // Terminal output
  use: {
    baseURL: 'http://localhost:3000',
    // Note: no global Content-Type to avoid breaking multipart uploads
  },
  webServer: {
    command: 'bun dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,  // Reuse running dev server if available
    timeout: 30_000,            // Wait up to 30s for server to start
  },
}
```

## Linting & Code Quality

**ESLint Status:**
- Tool: ESLint 9 with Next.js config (flat config format in `eslint.config.mjs`)
- Command: `bun run lint`
- **Current status: FAILS** with exit code 1
- Problems reported: ~492 total (32 errors, 460 warnings)

**Root Causes (Not in Source Code):**
1. `.planning/research/**` — vendored minified files trigger `no-unused-expressions` warnings (~300+ warnings in single minified JS file)
2. `ws-server/dist/**` — build output scanned but should be ignored
3. Config gap: `eslint.config.mjs` overrides default ignores but does NOT include `ws-server/dist/**` or `.planning/research/**`

**Actual Source Issues (Need Fixing):**
1. `ws-server/src/session.ts` — 3 `no-this-alias` errors (lines 8, 62, 182)
2. `ws-server/src/session.ts` — 1 `no-unused-vars` error (TurnLog import)
3. Total source errors: ~5-10 (rest are warnings in dependencies)

**Fix Approach:**
1. Update `eslint.config.mjs` to add missing ignore patterns:
   ```javascript
   globalIgnores([
     ".next/**",
     "out/**",
     "build/**",
     "next-env.d.ts",
     "ws-server/dist/**",
     ".planning/research/**",
   ])
   ```
2. Fix `no-this-alias` errors in `ws-server/src/session.ts` by refactoring to arrow functions or removing the alias
3. Remove unused `TurnLog` import if not needed

## Testing Strategy (Observed)

**Layers Tested:**
1. **Unit:** Pure utility functions (`app/lib/hackathonLinks.test.ts`)
2. **Integration:** API endpoints and schema validation (`tests/context-pipeline.spec.ts`, `tests/tts-stt-pipeline.spec.ts`)
3. **Backend Subsystem:** WebSocket server, DashScope pipeline (`tests/ws-pipeline.spec.ts`)
4. **E2E UI:** Terminal state machine, user interaction (`tests/ui-preservation.spec.ts`)

**Not Tested:**
- React components (no snapshot or component tests; E2E covers UI)
- Individual hooks (e.g., `useRealtimeVoice` tested via E2E UI test)
- Error boundaries (no E2E test for React error states)

**Why This Works:**
- E2E tests exercise full stack; component tests add little value
- Pure functions tested in isolation (fast feedback)
- Integration tests verify API contracts
- Real WebSocket and DashScope connections tested to catch configuration issues early

---

*Testing analysis: 2026-07-27*
