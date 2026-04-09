# Testing Patterns

**Analysis Date:** 2026-04-09

## Test Framework

**Runner:**
- Playwright 1.58.2 (`@playwright/test`)
- Config: `playwright.config.ts`

**Assertion Library:**
- Playwright's built-in assertions (`expect()`)

**Run Commands:**
```bash
bun test              # Run all tests with Playwright
bun test:headed       # Run tests in headed mode (browser visible)
```

## Test File Organization

**Location:**
- Tests co-located in `tests/` directory at project root
- Separate from source code (`app/`, `lib/`, `scripts/`)

**Naming:**
- Pattern: `{feature}.spec.ts`
- Examples: `realtime-voice.spec.ts`, `tts-stt-pipeline.spec.ts`, `context-pipeline.spec.ts`

**Structure:**
```
tests/
├── realtime-voice.spec.ts          # OpenAI Realtime API & UI tests
├── tts-stt-pipeline.spec.ts        # Text-to-speech and speech-to-text tests
└── context-pipeline.spec.ts        # Context schema and chat API tests
```

## Test Structure

**Suite Organization:**
All tests use `test.describe()` blocks to group related tests:

```typescript
test.describe('POST /api/realtime/session', () => {
  test('returns an ephemeral token', async ({ request }) => {
    const res = await request.post('/api/realtime/session', { timeout: 15_000 });
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.token).toBeDefined();
  });
});
```

**Patterns:**
- Setup: Use fixtures provided by Playwright (`{ request }`, `{ page }`)
- Test isolation: Each test is independent; no shared state between tests
- Assertions: Direct `.toBe()`, `.toBeGreaterThan()`, `.toMatch()` patterns
- Cleanup: Playwright handles automatic cleanup after each test

## Mocking

**Framework:** No external mocking library
- Playwright tests interact with real running server (via `webServer` in config)
- Server defined in `playwright.config.ts`:
  ```typescript
  webServer: {
    command: 'bun dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 30_000,
  }
  ```

**Patterns:**
- Full HTTP request/response testing: `request.post()`, `request.get()`
- Browser interactions: `page.goto()`, `page.fill()`, `page.getByRole()`, `page.waitForSelector()`
- No mocking of API responses — tests verify actual behavior

**What to Mock:**
- External APIs are mocked at the source level (e.g., OpenAI API key verified but not mocked in tests)
- Browser capabilities (audio, microphone) abstracted through actual MediaDevices API

**What NOT to Mock:**
- Database queries (in-memory data)
- File system operations (actual file reading in context pipeline)
- HTTP responses (real server responses)

## Fixtures and Factories

**Test Data:**
No dedicated fixture files; data is generated per-test or read from source:

From `context-pipeline.spec.ts`:
```typescript
function loadContext() {
  return JSON.parse(readFileSync(CONTEXT_PATH, 'utf-8'));
}

async function chatQuery(request: APIRequestContext, question: string): Promise<string> {
  const res = await request.post('/api/chat', {
    data: { messages: [{ role: 'user', content: question }] },
    headers: { 'Content-Type': 'application/json' },
    timeout: 25_000,
  });
  // ...parse NDJSON response
  return sentences.join(' ').trim();
}
```

**Location:**
- Helpers defined inline in test files (e.g., `loadContext()`, `chatQuery()`)
- Reusable across multiple test blocks in same file
- No separate fixtures directory

## Coverage

**Requirements:** Not enforced (no coverage report configuration in `playwright.config.ts`)

**View Coverage:** Not applicable — coverage measurement not configured

## Test Types

**API Tests (E2E):**
- Location: `tests/realtime-voice.spec.ts`, `tests/tts-stt-pipeline.spec.ts`
- Scope: Test HTTP endpoints by making actual requests
- Approach: Use `request` fixture to POST/GET, verify status codes and response schemas

Example from `realtime-voice.spec.ts`:
```typescript
test('POST /api/realtime/session returns an ephemeral token', async ({ request }) => {
  const res = await request.post('/api/realtime/session', { timeout: 15_000 });
  expect(res.status()).toBe(200);
  const json = await res.json();
  expect(json.token).toBeDefined();
  expect(typeof json.token).toBe('string');
  expect(json.token.length).toBeGreaterThan(10);
});
```

**UI Tests (E2E):**
- Location: `tests/realtime-voice.spec.ts` (Voice interface UI block)
- Scope: Test browser interactions and component visibility
- Approach: Use `page` fixture to navigate, fill inputs, check visibility

Example from `realtime-voice.spec.ts`:
```typescript
test('Connect button is visible after navigating to voice state', async ({ page }) => {
  await page.goto('/');
  // Wait for terminal to boot and reach MENU state
  await page.waitForSelector('input[aria-label="Terminal command input"]', { timeout: 15_000 });
  
  // Trigger connection flow
  await page.fill('input[aria-label="Terminal command input"]', '1');
  await page.keyboard.press('Enter');
  
  // Verify Connect button visible
  const connectBtn = page.getByRole('button', { name: /connect/i });
  await expect(connectBtn).toBeVisible({ timeout: 10_000 });
});
```

**Schema Validation Tests:**
- Location: `tests/context-pipeline.spec.ts`
- Scope: Validate JSON structure and required fields
- Approach: Load and inspect file contents with assertions

Example from `context-pipeline.spec.ts`:
```typescript
test('has work_history with at least 3 entries', () => {
  const ctx = loadContext();
  expect(Array.isArray(ctx.work_history)).toBe(true);
  expect(ctx.work_history.length).toBeGreaterThanOrEqual(3);
  for (const entry of ctx.work_history) {
    expect(typeof entry.role === 'string' || typeof entry.company === 'string').toBe(true);
  }
});
```

**Round-trip/Integration Tests:**
- Location: `tests/tts-stt-pipeline.spec.ts`
- Scope: Test end-to-end functionality with multiple services
- Approach: Call TTS endpoint, capture output, feed to STT endpoint, verify result

Example from `tts-stt-pipeline.spec.ts`:
```typescript
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
  
  // STT
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
  expect(json.transcript).toMatch(/kaleb|software|engineer/i);
});
```

## Common Patterns

**Async Testing:**
All tests are async by default (`async ({ fixture }) => { ... }`)
- Await HTTP requests: `await request.post(...)`
- Wait for UI elements: `await page.waitForSelector(...)`
- No special async handling needed — Playwright waits automatically

Example:
```typescript
test('returns an ephemeral token', async ({ request }) => {
  const res = await request.post('/api/realtime/session', { timeout: 15_000 });
  expect(res.status()).toBe(200);
  const json = await res.json();  // Automatic await
  expect(json.token).toBeDefined();
});
```

**Error Handling / Negative Tests:**
Test both success and failure paths:

From `tts-stt-pipeline.spec.ts`:
```typescript
test('POST /api/tts rejects empty text', async ({ request }) => {
  const res = await request.post('/api/tts', {
    data: { text: '', speaker: 'default' },
    headers: { 'Content-Type': 'application/json' },
    timeout: 60_000,
  });
  // Should return 400 or 500 with error
  expect(res.status()).toBeGreaterThanOrEqual(400);
});
```

**Timeouts and Retries:**
- Default test timeout: 30 seconds (`timeout: 30_000` in `playwright.config.ts`)
- Request-specific timeouts: `{ timeout: 15_000 }` for fast API tests, `{ timeout: 60_000 }` for TTS (cold start)
- Selector waits: `{ timeout: 15_000 }` for initial load, `{ timeout: 10_000 }` for state transitions
- Retries: Set to 0 in config (`retries: 0`) — tests fail fast for debugging

**Data Parsing Patterns:**
```typescript
// JSON parsing with error handling
const json = await res.json();
expect(json.token).toBeDefined();

// NDJSON parsing (newline-delimited JSON)
const raw = await res.text();
const lines = raw.trim().split('\n').filter(Boolean);
const sentences = lines.map((line) => {
  const parsed = JSON.parse(line);
  if (parsed.error) throw new Error(`API error: ${parsed.error}`);
  return parsed.sentence ?? '';
});

// Binary response parsing
const body = await res.body();
const magic = body.slice(0, 4).toString();
expect(magic).toBe('RIFF');  // WAV file magic bytes
```

**Logging in Tests:**
Console logging for debugging:
```typescript
console.log('[session] token prefix:', json.token.slice(0, 20) + '…');
console.log('[stt transcript]', json.transcript);
console.log('[round-trip]', `"${inputText}" → "${json.transcript}"`);
```

## Configuration Details

**playwright.config.ts:**
- `testDir: './tests'` — tests discovered in tests/ directory
- `timeout: 30_000` — default 30 second test timeout
- `retries: 0` — no automatic retries
- `reporter: 'list'` — simple list output
- `baseURL: 'http://localhost:3000'` — default base URL for requests
- `webServer.command: 'bun dev'` — start dev server before tests
- `webServer.reuseExistingServer: true` — reuse if already running

**Important Note:**
```typescript
use: {
  baseURL: 'http://localhost:3000',
  // Don't set global Content-Type — it breaks multipart form uploads
  // Individual tests set Content-Type as needed
},
```

---

*Testing analysis: 2026-04-09*
