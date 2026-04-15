# Stack Research

**Domain:** Real-time voice AI pipeline — Alibaba Cloud / Qwen (STT + LLM + TTS with voice cloning)
**Researched:** 2026-04-09 (v1.0) · Updated 2026-04-13 (v1.1 additions)
**Confidence:** MEDIUM (DashScope REST APIs verified via official docs; WebSocket auth with temporary tokens unconfirmed for WS-specific usage; no official JS/TS SDK exists)

---

## Context: What's Being Replaced

The existing hook (`app/hooks/useRealtimeVoice.ts`) opens a browser-side WebSocket directly to OpenAI using a short-lived ephemeral token fetched from a Next.js API route. The pattern works because OpenAI provides a `/v1/realtime/sessions` endpoint that returns a 60-second client token.

The replacement must replicate this pattern with DashScope: **browser WebSocket -> DashScope ASR, server API route -> LLM (Qwen), server WebSocket relay or client WebSocket -> DashScope TTS**, plus a one-time voice cloning enrollment.

---

## Critical Architecture Constraint

**Vercel serverless functions cannot proxy WebSockets.** Functions time out and have no persistent connection support. This is confirmed behavior, not a configuration issue.

**Implications:**
- The LLM call (Qwen via DashScope OpenAI-compatible API) can stay in a Next.js API route — it's HTTP, not WebSocket.
- The ASR and TTS WebSocket connections must be opened **from the browser directly** to DashScope, or you add a WebSocket-capable server.
- DashScope does support temporary tokens (up to 1,800s TTL) that can be used as Bearer tokens. These are the mechanism for client-side direct WebSocket connections without exposing permanent keys. **Confirm via testing that these tokens work in WebSocket Authorization headers** — documentation covers HTTP but not explicitly WebSocket.

**Recommended approach:** Keep the existing ephemeral-token pattern. Add a Next.js API route that generates a DashScope temporary token (POST `/api/v1/tokens`). Browser uses that token to open WebSockets to DashScope directly. This matches what the codebase already does for OpenAI.

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `openai` npm package | 6.x (already installed) | Qwen LLM chat completions via OpenAI-compat API | DashScope exposes an OpenAI-compatible endpoint at `dashscope-intl.aliyuncs.com/compatible-mode/v1`. Zero new SDK needed — just change `baseURL` and `apiKey`. HIGH confidence. |
| Browser native `WebSocket` | — | ASR and TTS real-time connections to DashScope | Same pattern as existing OpenAI WS code. DashScope ASR/TTS use identical event-driven WebSocket protocol. No new library needed client-side. |
| `ws` npm package | ^8.x | Server-side WebSocket if building a relay layer | Only needed if you can't connect directly from browser. Standard, minimal, used in DashScope's own Node.js examples. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@ai-sdk/alibaba` | latest | Optional Vercel AI SDK adapter for Qwen LLM | Use only if you want streaming `streamText()` through a Next.js API route with the Vercel AI SDK pattern. Not required — the `openai` package already works. |
| Native `fetch` + `ReadableStream` | — | Stream TTS audio from server API route to browser | If you route TTS through the server (non-WebSocket) for simpler architecture. Adds latency vs direct WS. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| `bun` | Runtime + package manager | Already in use; fully compatible with `ws` and `openai` packages |
| DashScope console (Singapore region) | API key + voice enrollment management | Use Singapore endpoint (`dashscope-intl.aliyuncs.com`) for international access. Beijing endpoint requires China account. |

---

## v1.1 Stack Additions: Observability, Testing & Bug Fixes

### 1. Conversation Analytics & Logging

**Decision: `pino` v10 (server-side, WS server) + structured JSON append (per-session log files)**

Pino is the correct choice for the Bun WS server because it outputs newline-delimited JSON by default, is the fastest Node-compatible logger available, and works in Bun with no extra configuration. The `bun-plugin-pino` plugin exists for bundled Bun deploys but is not needed since the WS server runs un-bundled via `bun src/index.ts`.

**What to log per conversation session:**
- Session ID (already exists as `crypto.randomUUID()`)
- Session start time, end time, duration
- Each turn: `{ timestamp, role, text, latency_ms }` — user transcript from ASR + assistant text from LLM
- Turn count, total tokens (from LLM streaming response)
- Barge-in events (cancel + restart)
- TTS chunk delivery times (first chunk latency)

**Log destination:** For a single-ECS deployment, append to `/var/log/kaleb-voice/sessions/YYYY-MM-DD.ndjson` — one file per day, one JSON line per completed turn. This is sufficient for analysis via `jq` or import into any analytics tool. No database needed.

**Analytics data shape (per line):**

```jsonc
{
  "ts": "2026-04-13T12:34:56.789Z",
  "sessionId": "uuid",
  "event": "turn.complete",
  "turn": 2,
  "role": "user",
  "text": "Tell me about your work at Nvidia",
  "latency_ms": 1240,
  "tts_first_chunk_ms": 380
}
```

**Question classification:** Keep it simple — pattern-match question intents in the WS server using keyword rules (`experience`, `project`, `contact`, `skills`, `education`). Do not add an ML classifier — portfolio scope doesn't justify it.

**Installation (WS server):**

```bash
cd ws-server && bun add pino
# No transport needed for file append in production
# pino-pretty for local dev only:
bun add -D pino-pretty
```

**Integration point:** Add a `Logger` class in `ws-server/src/logger.ts` that wraps `pino`. Each `Session` instance holds a `logger.child({ sessionId })` instance. Use `logger.info(...)` for each loggable event. In production, pipe stdout to a file: `bun src/index.ts >> /var/log/kaleb-voice/sessions/$(date +%F).ndjson 2>&1`.

**What NOT to do for analytics:**
- Do not add a database (Postgres, SQLite) — overkill for a portfolio
- Do not use OpenTelemetry — heavyweight for this use case
- Do not log from the Next.js frontend — only the WS server has the full picture
- Do not use Winston — slower than Pino, more config, no benefit here

---

### 2. Playwright E2E Audio Testing (Fake Microphone Injection)

**Decision: Playwright 1.58.2 (already installed) + Chromium fake audio capture flags + WAV test fixture**

Playwright's Chromium supports fake media device injection via Chrome command-line flags. This is the correct approach for E2E audio tests — no additional library is needed.

**Required Chromium flags:**

```typescript
// In playwright.config.ts — add a new project for audio tests
{
  name: 'chromium-audio',
  use: {
    ...devices['Desktop Chrome'],
    permissions: ['microphone'],
    launchOptions: {
      args: [
        '--use-fake-ui-for-media-stream',        // auto-grant mic permission
        '--use-fake-device-for-media-stream',    // replace mic with fake device
        `--use-file-for-fake-audio-capture=${path.resolve('./tests/fixtures/hello-kaleb.wav')}%noloop`,
        '--autoplay-policy=no-user-gesture-required', // allow AudioContext autoplay
      ],
    },
  },
}
```

**WAV fixture requirements:** 1 channel (mono), 48 kHz sample rate (Chromium fake device requirement), 16-bit PCM, at least 3 seconds of speech content (can be synthesized with `sox` or `ffmpeg`).

Generate test fixture with `ffmpeg` (available on ECS and macOS):

```bash
# Generate 3s of 1kHz sine wave as a placeholder
ffmpeg -f lavfi -i "sine=frequency=1000:duration=3" -ar 48000 -ac 1 tests/fixtures/sine-3s.wav

# Or use actual speech recorded at 48kHz mono for real transcript test
```

**What to verify in audio E2E tests:**

| Test | How to Verify |
|------|---------------|
| Microphone capture starts after Connect | `page.evaluate(() => navigator.mediaDevices.getUserMedia(...))` resolves without error |
| Audio reaches WS server | WS server receives `audio.append` messages (verify via WS server log or mock) |
| TTS audio plays back | `page.evaluate(() => document.querySelector('.waveform-canvas'))` has non-zero width; OR check `AudioContext.state === 'running'` via `page.evaluate` |
| Barge-in: speaking during AI response | Send WAV early; verify `response.done` + new greeting cycle begins |
| Session turn count increments | Intercept WS messages via `page.on('websocket', ...)` and count `turn.complete` events |

**Playwright `page.on('websocket', ...)` for WS message interception:**

```typescript
const messages: unknown[] = [];
page.on('websocket', ws => {
  ws.on('framereceived', frame => {
    try { messages.push(JSON.parse(frame.payload)); } catch { /* binary */ }
  });
});
```

This is built into Playwright — no extra library needed.

**Key limitation:** Playwright cannot directly capture browser audio output (the `recordVideo` API does not include audio output from `AudioContext`). The correct proxy is: verify the WS server sends `tts.audio` messages AND verify the page's `AudioContext` is in `'running'` state and has active source nodes. This is achievable via `page.evaluate`.

**Interrupt/barge-in test strategy:** Start the WAV fake audio immediately on connect. The WS server should emit a `response.done` for its greeting, then detect VAD speech onset from the fake mic audio, trigger barge-in (`cancelCurrentResponse`), and begin a new response. Verify by counting WS `session.ready` → `response.done` cycles.

**What NOT to add for audio E2E:**
- Do not add `puppeteer` — redundant with Playwright
- Do not add `jest-websocket-mock` — you are testing the real WS server, not mocking it
- Do not add `webrtc-adapter` — not relevant to this architecture

---

### 3. Unit & Integration Tests: WS Server, ASR, TTS Component Health

**Decision: `bun test` (built-in) — no new test framework needed**

Bun 1.3.x ships a Jest-compatible test runner (`bun test`) that supports TypeScript natively, lifecycle hooks, mocks, and concurrent execution. It runs 10–30x faster than Jest. No installation needed — it is part of the Bun runtime.

**Scope of component health tests:**

| Component | Test Type | What to Test |
|-----------|-----------|--------------|
| WS server — health endpoint | Integration | `GET /health` returns 200 `ok` (already exists in Playwright suite — migrate to bun test) |
| WS server — session lifecycle | Integration | Connect → `session.start` → `session.ready` → `session.finish` → disconnect |
| WS server — barge-in | Integration | Send `session.start`, wait for TTS audio events, send `audio.append` mid-stream, verify `response.done` with `immediate: true` |
| WS server — memory cap | Unit | Mock 11 conversation turns; verify history length stays ≤ 20 entries |
| ASR adapter | Integration | Real DashScope call: connect, `session.update`, send silence PCM, verify ack (already tested in Playwright — migrate) |
| TTS adapter | Integration | Real DashScope call: connect, send text, verify PCM chunks received (already tested in Playwright — migrate) |
| Logger | Unit | `Logger.child({ sessionId })` emits correct JSON fields, `turn.complete` event shape matches schema |

**Why migrate from Playwright to `bun test` for backend tests:**

The existing `ws-pipeline.spec.ts` runs backend/WS tests via Playwright, which spins up a full browser and a Next.js dev server unnecessarily. These tests are pure WebSocket/HTTP integration tests — they do not need a browser. Moving them to `bun test` removes the 5–10s startup overhead and makes them runnable independently of the frontend.

**Location for `bun test` files:**

```
ws-server/
└── tests/
    ├── session.test.ts      # unit tests for Session class logic
    ├── logger.test.ts       # unit tests for Logger
    ├── ws-health.test.ts    # integration: health + session lifecycle
    └── dashscope.test.ts    # integration: ASR + TTS real API calls
```

**Running:**

```bash
cd ws-server && bun test                     # all tests
cd ws-server && bun test tests/session.test.ts  # single file
cd ws-server && bun test --watch             # watch mode
```

**Mocking in `bun test`:**

For unit tests that should not hit real DashScope APIs, use `bun:test` mocks:

```typescript
import { mock } from 'bun:test';
const mockWs = { send: mock(() => {}), close: mock(() => {}), readyState: 1 };
```

Bun's `mock()` is API-compatible with `jest.fn()`. Use `mock.module()` to mock entire modules for dependency injection.

**What NOT to add for unit testing:**
- Do not add `jest` or `vitest` — Bun's built-in runner is faster and already installed
- Do not add `ts-jest` — Bun handles TypeScript natively
- Do not add `sinon` — Bun's `mock()` covers the same ground
- Do not add `supertest` — use native `fetch` to test the HTTP health endpoint

---

## TTS Playback Bug Fix: No New Libraries

The known v1.0 TTS issues (overlapping audio, cut-offs, inconsistent barge-in) are architectural, not library gaps. The fixes are:

1. **Overlapping audio:** The `scheduleAudioChunk` function in `useRealtimeVoice.ts` tracks `nextPlayTimeRef`. Ensure the ref is reset to `audioCtx.currentTime` on barge-in, not left at the previous stream's tail. No new library.

2. **Cut-offs:** The WS server uses `session.finish` to gate TTS forwarding. Verify `response.done` is received from DashScope before the browser closes the TTS stream. Add a `flush` delay (50ms) before sending `response.done` to browser. No new library.

3. **Inconsistent barge-in:** The browser should stop playing audio immediately on `response.done { immediate: true }`. Use `audioCtx.suspend()` + `audioCtx.resume()` rather than disconnecting sources. No new library.

The root cause is sequencing logic, not missing tooling. Investigate and fix in the existing hook before adding instrumentation.

---

## Installation Summary (v1.1 Additions)

```bash
# WS server — structured logging
cd ws-server
bun add pino
bun add -D pino-pretty

# Frontend — nothing new needed
# Playwright — already installed at 1.58.2

# bun test — built into bun 1.3.5, no install needed

# Test fixture (macOS — ffmpeg via Homebrew or pre-installed)
ffmpeg -f lavfi -i "sine=frequency=1000:duration=3" -ar 48000 -ac 1 tests/fixtures/sine-3s.wav
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Direct browser WebSocket to DashScope | Server-side WebSocket relay | If temporary token auth for WS proves unreliable; adds latency and requires a persistent server outside Vercel (e.g., Railway, Fly.io) |
| `openai` SDK with DashScope `baseURL` | `@ai-sdk/alibaba` | If you want `streamText()` and built-in streaming UI helpers from Vercel AI SDK; more abstraction, less control |
| Qwen3-TTS-VC-Realtime WebSocket | Qwen3-TTS-VC REST (non-streaming) | For batch/non-interactive synthesis; not suitable for conversational voice — latency is too high |
| DashScope hosted API | Self-hosted Qwen3-TTS open-source model | If voice cloning API cost is prohibitive or data privacy is required; requires GPU server (not trivial on M4 Max without CUDA) |
| Qwen3-ASR-Flash-Realtime | Paraformer-realtime-v2 | If Qwen3 ASR latency is too high; Paraformer is the older production-grade model, well-tested |
| `pino` for WS server logging | `winston` | Winston is 3–5x slower; more configuration; no benefit for this use case |
| `bun test` for backend unit tests | `vitest` or `jest` | If test suite needs DOM environment (jsdom) or browser-specific globals — but those belong in Playwright, not backend tests |
| Playwright fake media flags for audio E2E | External audio testing service | Use external service only if testing across multiple browsers is required; this project targets Chrome-based interactions |
| File-based NDJSON logs | Postgres / SQLite analytics DB | Use a DB if you need cross-session queries, dashboards, or > 10k sessions/month — portfolio scale doesn't warrant it |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `dashscope` Python SDK | Python-only, irrelevant to this TypeScript/Next.js project | Raw WebSocket with `ws` or browser WebSocket API |
| OpenAI Realtime API (`gpt-4o-realtime-preview`) | Being replaced — no voice cloning, higher cost, no control over voice | DashScope Qwen pipeline |
| Server-side WebSocket proxy on Vercel | Vercel serverless functions do not support persistent connections; they timeout | Direct browser WebSocket + temporary DashScope token |
| `ScriptProcessorNode` (deprecated) | Being removed from browsers; already causing deprecation warnings | `AudioWorkletNode` — drop-in replacement with better performance and no main thread blocking |
| Hardcoded permanent API key in client code | Security risk — key exposed in browser | DashScope temporary token endpoint (60s–1800s TTL) fetched from server-side API route |
| `jest-websocket-mock` | Mocks the WS server — you need to test the real server, not a mock | Real WS integration test using `bun test` + actual server started in `beforeAll` |
| `supertest` | Node.js HTTP test library, not Bun-native | Native `fetch` — works identically in Bun and is already available |
| `OpenTelemetry` | Heavy distributed tracing SDK designed for microservices at scale | `pino` JSON logs — sufficient for a single-server portfolio |

---

## Audio Format Changes vs Current Implementation

| Parameter | Current (OpenAI) | New (DashScope ASR) | New (DashScope TTS) |
|-----------|------------------|---------------------|---------------------|
| Sample rate | 24,000 Hz | 16,000 Hz | 24,000 Hz output |
| Format | PCM16 Base64 | PCM Base64 | PCM Base64 |
| Channels | Mono | Mono | Mono |
| Chunk size | 4,096 samples (ScriptProcessor) | ~3,200 bytes (0.1s at 16kHz) | N/A (output, not input) |

The `downsample()` function in `useRealtimeVoice.ts` targets `SAMPLE_RATE = 24000`. Change to 16,000 for ASR input. TTS output arrives at 24,000 Hz — playback code stays the same.

---

## New Environment Variables Required

| Variable | Purpose | Source |
|----------|---------|--------|
| `DASHSCOPE_API_KEY` | Permanent DashScope API key for server-side calls | Alibaba Cloud Model Studio console (Singapore) |
| `DASHSCOPE_VOICE_ID` | Kaleb's cloned voice ID from enrollment | Run enrollment script once, store result |

Remove (or keep for rollback): `OPENAI_API_KEY`

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| `openai@6.x` | DashScope OpenAI-compat endpoint | Requires `baseURL` override and `dangerouslyAllowBrowser: false` for server-side use |
| `ws@8.x` | Bun runtime | Confirmed Bun-compatible; use for any server-side WebSocket relay if needed |
| Next.js 16 App Router | DashScope REST API routes | Standard `fetch` in Route Handlers works; no special config needed |
| `pino@10.x` | Bun 1.3.x | Compatible without `bun-plugin-pino` when running un-bundled; `bun-plugin-pino` only needed for `bun build` output |
| `@playwright/test@1.58.2` | Chromium fake audio capture flags | `--use-file-for-fake-audio-capture` confirmed working in Playwright Chromium; WAV must be 48kHz mono |
| `bun test` (Bun 1.3.5) | Jest-compatible API | Covers `describe`, `test`, `expect`, `mock`, `beforeAll`/`afterAll`; async and concurrent tests supported |

---

## Confidence Assessment by Area

| Area | Confidence | Basis |
|------|------------|-------|
| LLM (Qwen via OpenAI-compat) | HIGH | Official Alibaba docs confirm OpenAI SDK compatibility; `baseURL` swap is the entire change |
| Voice cloning enrollment API | HIGH | Full request/response schema documented in official docs with curl examples |
| TTS WebSocket protocol | MEDIUM | Event types documented; no JavaScript example in official docs; Python SDK examples available |
| ASR WebSocket protocol | MEDIUM | Node.js `ws` example exists in official docs; message format confirmed |
| Temporary token for WebSocket auth | LOW | Token endpoint documented for HTTP; WebSocket compatibility is not explicitly confirmed in docs |
| `@ai-sdk/alibaba` package | LOW | Exists on ai-sdk.dev; version/stability not independently verified; TTS not in scope for this SDK |
| `pino` on Bun (un-bundled) | HIGH | Confirmed working in multiple community reports; no special config needed for `bun src/index.ts` usage |
| Playwright fake audio (Chromium flags) | HIGH | Chrome `--use-file-for-fake-audio-capture` is a long-standing Chrome feature; confirmed working in Playwright config |
| `bun test` for WS integration tests | HIGH | Bun 1.3.x built-in runner is stable; `bun test` supports async tests and native WebSocket |
| NDJSON file-based logging | HIGH | Standard pattern; `pino` default output is NDJSON; no extra library needed |

---

## Sources

- [Qwen Voice Cloning API Reference](https://www.alibabacloud.com/help/en/model-studio/qwen-tts-voice-cloning) — enrollment endpoint, audio requirements, voice ID response format
- [Qwen Real-Time TTS WebSocket](https://www.alibabacloud.com/help/en/model-studio/qwen-tts-realtime) — protocol, message types, audio formats
- [Qwen Real-Time ASR WebSocket](https://www.alibabacloud.com/help/en/model-studio/qwen-real-time-speech-recognition) — Node.js ws example, session.update format, audio chunk format
- [DashScope Temporary API Key](https://www.alibabacloud.com/help/en/model-studio/generate-temporary-api-key) — token endpoint, 60s default / 1800s max TTL
- [DashScope OpenAI-Compatible API](https://www.alibabacloud.com/help/en/model-studio/compatibility-of-openai-with-dashscope) — baseURL, authentication, streaming support
- [Vercel WebSocket Limitation](https://vercel.com/kb/guide/do-vercel-serverless-functions-support-websocket-connections) — confirmed: serverless functions do not support WebSocket
- [Qwen3-TTS GitHub Repository](https://github.com/QwenLM/Qwen3-TTS) — open-source model details, voice cloning capabilities
- [AI SDK Alibaba Provider](https://ai-sdk.dev/providers/ai-sdk-providers/alibaba) — `@ai-sdk/alibaba` package existence and capabilities
- [Bun Test Runner Docs](https://bun.com/docs/test) — Jest-compatible API, mock, lifecycle hooks, concurrent tests (HIGH confidence)
- [Playwright Fake Media Issue #27436](https://github.com/microsoft/playwright/issues/27436) — fake audio capture configuration patterns (MEDIUM confidence — community issue thread)
- [TIL: Playwright Fake Audio](https://omarelb.substack.com/p/til-2-set-up-playwright-with-fake) — `--use-file-for-fake-audio-capture` WAV requirements (MEDIUM confidence)
- [Pino + Bun guide](https://medium.com/@yashbatra11111/10x-your-backend-logging-with-bun-and-pino-http-4de174a08fe2) — confirmed Bun compatibility (MEDIUM confidence — community post)
- [Pino npm](https://www.npmjs.com/package/pino) — v10.3.1 latest as of research date (HIGH confidence)

---

*Stack research for: Alibaba Cloud / Qwen real-time voice AI pipeline + v1.1 observability and testing additions*
*Researched: 2026-04-09 (v1.0) · Updated 2026-04-13 (v1.1)*
