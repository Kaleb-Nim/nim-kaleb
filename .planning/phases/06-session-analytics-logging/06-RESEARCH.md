# Phase 6: Session Analytics & Logging — Research

**Researched:** 2026-04-13
**Domain:** Structured logging, latency instrumentation, Bun file I/O
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| LOG-01 | Each conversation turn logged as NDJSON on ECS with session ID, role, transcript text, and timestamp | `appendFileSync` from `node:fs` writes NDJSON atomically per line. Session-scoped files (`/logs/{sessionId}.ndjson`) isolate per-conversation data. |
| LOG-02 | Each turn log includes ASR duration, LLM TTFT, TTS TTFA, and total round-trip latency | `performance.now()` is available in Bun 1.3.5 for sub-millisecond wall-clock timestamps. All four measurement points are instrumentable in `session.ts` without touching the DashScope adapters. |
</phase_requirements>

---

## Summary

Phase 6 adds durable per-turn logging with latency breakdowns to the existing Bun WebSocket server. The implementation is self-contained to `ws-server/src/` — no new libraries are needed. Bun 1.3.5 ships with Node.js-compatible `fs` APIs (`appendFileSync`, `mkdirSync`) that write NDJSON safely. `performance.now()` provides sub-millisecond wall-clock measurement for all four latency metrics.

The critical constraint from the project decisions is that analytics must be fire-and-forget — `logTurn()` must never be awaited in the response hot path. All writes go to a background promise chain (`Promise.resolve().then(() => appendFileSync(...)).catch(...)`) so the browser response pipeline is not stalled.

All instrumentation hooks belong in `session.ts` `startResponse()`. The four latency breakpoints map cleanly to existing code structure: ASR `onTranscriptFinal` fires when ASR is done; the first `onChunk` from `streamLlmResponse` marks LLM TTFT; the first `onAudioDelta` from `createTtsSession` marks TTS TTFA; and `onDone` (final `response.done`) marks round-trip end.

**Primary recommendation:** Create a `ws-server/src/logger.ts` module with a `logTurn()` function that writes a single NDJSON line. Call it fire-and-forget at the end of each turn from `session.ts`. No external logging libraries. No streaming log infrastructure. Plain files on the ECS filesystem.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `node:fs` (built-in) | Bun 1.3.5 | `appendFileSync`, `mkdirSync` | Already available in Bun runtime, zero dependency cost, synchronous append is safe for low-frequency fire-and-forget writes [VERIFIED: local Bun 1.3.5] |
| `performance.now()` (global) | Bun 1.3.5 | Sub-ms wall-clock timestamps | Available as global in Bun, same API as browsers and Node.js [VERIFIED: local Bun 1.3.5] |
| `Date.now()` (global) | Bun 1.3.5 | ISO timestamp for log entries | Standard epoch-ms for log `ts` field [VERIFIED: local Bun 1.3.5] |

### No New Dependencies Required

All APIs needed for this phase are available in Bun's built-in Node.js compatibility layer. [VERIFIED: local Bun 1.3.5]

**Installation:** None needed.

---

## Architecture Patterns

### Recommended Project Structure

```
ws-server/src/
├── logger.ts          # NEW — logTurn() function, NDJSON writes, log dir init
├── session.ts         # MODIFIED — add latency tracking, call logTurn()
├── dashscope/
│   ├── asr.ts         # NO CHANGE — timing captured in session.ts callbacks
│   ├── llm.ts         # NO CHANGE — TTFT captured via first onChunk callback
│   └── tts.ts         # NO CHANGE — TTFA captured via first onAudioDelta callback
└── index.ts           # NO CHANGE (or minimal: ensure log dir exists on startup)
```

Log files on ECS:
```
/var/log/kaleb-voice/
└── {sessionId}.ndjson   # one file per session, one JSON line per turn
```

### Pattern 1: NDJSON Per-Session Log File

**What:** One `.ndjson` file per session ID, one JSON object per line, one line per conversation turn.

**When to use:** Single-process server with low conversation volume (portfolio site). No need for centralized log aggregation. Files are queryable with `cat`, `jq`, standard unix tools.

**Example:**
```typescript
// Source: verified appendFileSync in Bun 1.3.5
import { appendFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const LOG_DIR = process.env.LOG_DIR ?? '/var/log/kaleb-voice';

export function initLogDir(): void {
  mkdirSync(LOG_DIR, { recursive: true });
}

export interface TurnLog {
  ts: number;            // Date.now() — epoch ms at turn completion
  sessionId: string;
  role: 'user' | 'assistant';
  text: string;
  latency: {
    asrMs: number | null;    // time from first audio chunk to onTranscriptFinal
    llmTtftMs: number | null; // time from LLM call start to first onChunk
    ttsTtfaMs: number | null; // time from TTS session open to first onAudioDelta
    totalMs: number | null;   // time from ASR done to response.done
  };
}

export function logTurn(entry: TurnLog): void {
  // Fire-and-forget: never called with await
  Promise.resolve()
    .then(() => {
      const path = join(LOG_DIR, `${entry.sessionId}.ndjson`);
      appendFileSync(path, JSON.stringify(entry) + '\n');
    })
    .catch((err) => {
      console.error('[logger] write failed:', err);
    });
}
```

### Pattern 2: Latency Measurement via `performance.now()` Closures

**What:** Capture `performance.now()` at the start of each stage, compute delta inside the callback. Store deltas in a turn-scoped object that lives in `startResponse()` closure.

**When to use:** All four latency metrics are naturally measured at existing callback boundaries — no modification of DashScope adapters needed.

**Latency measurement points in `session.ts`:**

```typescript
// Source: verified performance.now() in Bun 1.3.5
function startResponse(userText: string, opts?: { isGreeting?: boolean; bargeInPrefix?: string }): void {
  // ── Latency tracking ──────────────────────────────────────────────────────
  const turnStart = performance.now();   // start of LLM pipeline (after ASR done)
  let llmStart: number | null = null;
  let ttsOpenTime: number | null = null;
  let llmTtftMs: number | null = null;
  let ttsTtfaMs: number | null = null;
  let firstChunk = true;
  let firstAudio = true;

  // ASR duration is measured externally (onTranscriptFinal fires after ASR done)
  // Pass asrDurationMs into startResponse from the caller

  // Inside streamLlmResponse onChunk:
  llmStart = performance.now(); // set before calling streamLlmResponse
  // first onChunk: llmTtftMs = performance.now() - llmStart

  // Inside createTtsSession onAudioDelta:
  // first delta: ttsTtfaMs = performance.now() - ttsOpenTime

  // Inside onDone:
  // totalMs = performance.now() - turnStart
  // logTurn({ ... latency: { asrMs, llmTtftMs, ttsTtfaMs, totalMs } })
}
```

**ASR duration measurement** — captured at `onTranscriptFinal` call site in `startPipeline()`:

```typescript
// In createAsrSession callbacks:
let asrSpeechStart: number | null = null;

// input_audio_buffer.speech_started message → set asrSpeechStart = performance.now()
// onTranscriptFinal fires → asrDurationMs = performance.now() - asrSpeechStart

onTranscriptFinal: (text) => {
  const asrDurationMs = asrSpeechStart !== null
    ? Math.round(performance.now() - asrSpeechStart)
    : null;
  session.startResponse(text, { asrDurationMs });
}
```

Note: ASR currently does NOT forward `input_audio_buffer.speech_started` to `onTranscriptPartial` or any callback — only logs it. The `speech_started` event is already handled in `asr.ts` line 73. To measure ASR duration, two options exist:

- **Option A**: Add `onSpeechStarted` callback to `AsrCallbacks` — cleanly tracks start in ASR module
- **Option B**: Approximate ASR start time by recording `performance.now()` at `session.handleAudio()` first call — simpler but less precise

Option A is recommended: single-purpose, matches existing callback pattern.

### Pattern 3: Fire-and-Forget Write (Critical for Hot Path)

**What:** `logTurn()` schedules a microtask via `Promise.resolve().then()` that does the synchronous `appendFileSync`. The calling code sees no async cost.

**Why `appendFileSync` (not async write):** For the portfolio's traffic volume (1 turn per response), synchronous append in a background microtask is negligible. Avoids the complexity of async file handles or write queues. `appendFileSync` with a '\n'-terminated line is also atomically safe for single-process writes.

**Why not async `fs.appendFile`:** Would require awaiting, adding it to the hot path, or managing a promise chain. `appendFileSync` in a fire-and-forget `.then()` is simpler.

```typescript
// Verified pattern — logTurn() is always called WITHOUT await
// Source: verified in Bun 1.3.5 local test
logTurn(entry);  // returns void, sync call, no blocking
// voice pipeline continues immediately
```

### Anti-Patterns to Avoid

- **Awaiting `logTurn()` in the response pipeline**: Blocks TTS audio delivery to browser. `logTurn()` must return `void` and be called without `await`.
- **Writing one file per log line**: Creates file descriptor churn. Session-scoped files reuse the same path for the entire session.
- **Global mutable timing state on the `Session` class**: Turn-scoped timing variables belong inside the `startResponse()` closure, not as class fields. A new `startResponse()` call per barge-in would otherwise corrupt timing from the previous turn.
- **Modifying DashScope adapter files**: All timing hooks can be implemented via the existing callback interfaces. No changes needed to `asr.ts`, `llm.ts`, or `tts.ts` (except optionally adding `onSpeechStarted` to ASR callbacks for accurate ASR duration).
- **Logging the greeting turn as a user message**: The greeting (isGreeting=true) has no user text. Treat it as `role: 'assistant'` with `text: '[greeting]'` or skip logging it entirely.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| High-resolution timing | Custom Date.now() diff wrapper | `performance.now()` | Sub-ms precision, monotonic clock, already global in Bun [VERIFIED] |
| Log rotation | Custom file rotation logic | N/A (out of scope) | Portfolio scale doesn't need rotation — files stay small |
| Log aggregation | Structured log shipper | N/A (out of scope) | REQUIREMENTS.md explicitly out-of-scope: no OpenTelemetry, no external analytics |
| Async write queue | Custom producer/consumer queue | `Promise.resolve().then(() => appendFileSync(...))` | Fire-and-forget microtask is sufficient for this traffic volume |

**Key insight:** This is a portfolio site with one concurrent user. Over-engineering the logging pipeline (streams, queues, external sinks) is explicitly out of scope per REQUIREMENTS.md.

---

## Runtime State Inventory

Step 2.5: SKIPPED — this is not a rename/refactor/migration phase. Greenfield module addition.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Bun runtime | `appendFileSync`, `performance.now()` | Yes | 1.3.5 | — |
| `node:fs` (built-in) | NDJSON file writes | Yes | Bun 1.3.5 built-in | — |
| `/var/log/kaleb-voice/` directory | Log file storage on ECS | Not verified — created at runtime | — | `mkdirSync({ recursive: true })` creates it |
| `LOG_DIR` env var | Configurable log path | Not set (optional) | — | Falls back to `/var/log/kaleb-voice` |

**Missing dependencies with no fallback:** None. All APIs are built into Bun.

**Log directory note:** The ECS server runs as a Bun process. `/var/log/kaleb-voice/` will be created by `initLogDir()` called from `index.ts` at server startup. If the process lacks write permission to `/var/log/`, a `LOG_DIR` environment variable pointing to a writable path (e.g., `/home/ubuntu/logs`) is the fallback. [ASSUMED: ECS user has write access to /var/log/]

---

## Common Pitfalls

### Pitfall 1: Turn Timing Closure Gets Overwritten by Barge-In

**What goes wrong:** If `startResponse()` is called again (barge-in) while a previous call's timing variables are still in scope, the new call's closures close over fresh variables. The old turn's `onDone` may still fire later, calling `logTurn` with stale timing.

**Why it happens:** `cancelCurrentResponse()` aborts the LLM stream but the TTS `onDone` callback could still fire if `finishTtsSession` was already sent. The old `onDone` closure references the old turn's timing variables.

**How to avoid:** Check `abort.signal.aborted` before calling `logTurn()` in `onDone`, same pattern already used for `finishTtsSession`. Aborted turns produce incomplete timing data — skip logging them or log with `aborted: true`.

```typescript
onDone: () => {
  if (abort.signal.aborted) return; // don't log aborted turns
  logTurn({ ... });
  session.send({ type: 'response.done' });
}
```

### Pitfall 2: ASR Duration Has No `speech_started` Timestamp

**What goes wrong:** `asr.ts` currently handles `input_audio_buffer.speech_started` with a `console.log` only (line 73-74). There is no callback to surface the speech start time to `session.ts`.

**Why it happens:** The callback interface `AsrCallbacks` was defined before logging requirements existed.

**How to avoid:** Add an optional `onSpeechStarted?: () => void` to `AsrCallbacks`. Call it in the `speech_started` switch case. In `session.ts`, capture `performance.now()` inside that callback and pass `asrDurationMs` to `startResponse()`.

### Pitfall 3: LLM TTFT Confusion — `streamLlmResponse` vs First Token

**What goes wrong:** Measuring `llmTtftMs` from the `streamLlmResponse` *call* rather than from when `client.chat.completions.create` actually starts streaming.

**Why it happens:** `streamLlmResponse` is async — there's latency between the call and when the OpenAI-compatible SDK establishes the stream. The true TTFT is the time from stream start to `onChunk` first firing.

**How to avoid:** Record `llmStart = performance.now()` just before calling `streamLlmResponse()` inside `startResponse()` (after TTS is ready). This measures end-to-end LLM + network latency, which is the meaningful metric for debugging.

### Pitfall 4: `appendFileSync` in Hot Path

**What goes wrong:** Accidentally calling `appendFileSync` synchronously (not inside `.then()`) adds disk I/O to the voice response latency. On an ECS server with slow disk, this could add 2-10ms per turn.

**Why it happens:** `logTurn()` is easy to call synchronously if its implementation is simple enough to inline.

**How to avoid:** `logTurn()` must return `void` and always schedule the write in a `Promise.resolve().then()`. The type signature enforces this (not `async`, not returning `Promise`).

### Pitfall 5: Missing `initLogDir()` Call

**What goes wrong:** First `appendFileSync` call throws `ENOENT` if `/var/log/kaleb-voice/` doesn't exist on the ECS filesystem.

**Why it happens:** Log directory is not created by deployment scripts.

**How to avoid:** Call `initLogDir()` once at server startup in `index.ts`, before `Bun.serve()`. Uses `mkdirSync({ recursive: true })` which is a no-op if the directory already exists.

---

## Code Examples

Verified patterns from official sources and local testing:

### NDJSON Append (fire-and-forget)

```typescript
// Source: verified appendFileSync in Bun 1.3.5
import { appendFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const LOG_DIR = process.env.LOG_DIR ?? '/var/log/kaleb-voice';

export function initLogDir(): void {
  mkdirSync(LOG_DIR, { recursive: true });
}

export function logTurn(entry: TurnLog): void {
  Promise.resolve()
    .then(() => {
      appendFileSync(join(LOG_DIR, `${entry.sessionId}.ndjson`), JSON.stringify(entry) + '\n');
    })
    .catch((err) => {
      console.error('[logger] write failed:', err);
    });
}
```

### Latency Timing in `startResponse()` (session.ts)

```typescript
// Timing variables scoped to this response turn (closure-safe across barge-ins)
const turnStart = performance.now();
const llmStart = performance.now(); // set before ttsReadyPromise.then() calls streamLlmResponse
let llmTtftMs: number | null = null;
let ttsOpenMs: number | null = null;
let ttsTtfaMs: number | null = null;
let firstLlmChunk = true;
let firstTtsAudio = true;

// In createTtsSession callbacks:
onAudioDelta: (delta) => {
  if (firstTtsAudio) {
    ttsTtfaMs = Math.round(performance.now() - (ttsOpenMs ?? turnStart));
    firstTtsAudio = false;
  }
  session.send({ type: 'response.audio.delta', delta });
},
onDone: () => {
  if (abort.signal.aborted) return;
  const totalMs = Math.round(performance.now() - turnStart);
  logTurn({
    ts: Date.now(),
    sessionId: session.sessionId,
    role: 'assistant',
    text: assistantResponse,
    latency: {
      asrMs: opts?.asrDurationMs ?? null,
      llmTtftMs,
      ttsTtfaMs,
      totalMs,
    },
  });
  session.send({ type: 'response.done' });
  session.ttsHandle = null;
},

// In ttsReadyPromise.then():
ttsOpenMs = performance.now();

// In streamLlmResponse onChunk:
(chunk) => {
  if (firstLlmChunk) {
    llmTtftMs = Math.round(performance.now() - llmStart);
    firstLlmChunk = false;
  }
  // ... existing chunk handling
}
```

### ASR Duration Measurement (asr.ts callback extension)

```typescript
// Add to AsrCallbacks interface:
export interface AsrCallbacks {
  onTranscriptPartial: (text: string) => void;
  onTranscriptFinal: (text: string) => void;
  onSpeechStarted?: () => void;   // NEW — optional for backward compatibility
  onError: (message: string) => void;
}

// In asr.ts switch:
case 'input_audio_buffer.speech_started':
  console.log('[asr] speech started');
  callbacks.onSpeechStarted?.();   // NEW
  break;
```

### Updated `startPipeline()` signature (session.ts)

```typescript
// Pass asrDurationMs into startResponse via ASR callback:
let asrSpeechStart: number | null = null;

createAsrSession({
  // ...
  onSpeechStarted: () => {
    asrSpeechStart = performance.now();
  },
  onTranscriptFinal: (text) => {
    const asrDurationMs = asrSpeechStart !== null
      ? Math.round(performance.now() - asrSpeechStart)
      : null;
    asrSpeechStart = null; // reset for next turn
    session.send({ type: 'transcript.final', text });
    // ... existing guard logic ...
    session.startResponse(text, { asrDurationMs });
  },
})
```

### Sample Log Entry (NDJSON)

```json
{"ts":1744609200000,"sessionId":"c4e7f3a0-1234-4567-abcd-ef0123456789","role":"assistant","text":"Hey there! Great to meet you. I'm Kaleb's AI voice clone — I can answer anything about my experience, projects, or background. What are you curious about?","latency":{"asrMs":420,"llmTtftMs":810,"ttsTtfaMs":1240,"totalMs":4100}}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `console.log` only | Structured NDJSON file | This phase | Machine-readable latency data for debugging |
| No timing instrumentation | `performance.now()` closures | This phase | Per-component latency visible in log |

**Not applicable — this is a greenfield addition, no migration needed.**

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | ECS process has write permission to `/var/log/` | Environment Availability | `appendFileSync` throws ENOENT/EACCES; mitigated by `LOG_DIR` env var fallback |
| A2 | The TTS `onDone` callback fires reliably after Phase 5 bug fixes (BUG-03 fix makes teardown clean) | Code Examples | If `onDone` never fires on some turns, that turn's log entry is never written; workaround is to also log on `abort.signal` fire for barge-ins |
| A3 | Single-process Bun server on ECS (no clustering) | Architecture | If clustered, concurrent `appendFileSync` calls could interleave NDJSON lines; not a current concern for this portfolio |

---

## Open Questions

1. **Log directory on ECS — writable path**
   - What we know: ECS server runs as a Bun process; deployment uses Railway (`railway.json` present)
   - What's unclear: Railway uses containers — `/var/log/` may be ephemeral or restricted. Container restarts would lose logs.
   - Recommendation: Set `LOG_DIR=/data/logs` or similar persistent volume path in Railway env vars. Alternatively, stream logs to stdout and let Railway capture them. For this phase, file-based NDJSON is simplest; add a note to the plan to configure `LOG_DIR` in Railway dashboard.

2. **Should barge-in (aborted) turns be partially logged?**
   - What we know: Aborted turns have incomplete `assistantResponse` and some latency values (TTFT may be captured, total is not meaningful).
   - What's unclear: Whether partial data is useful for debugging barge-in latency.
   - Recommendation: Skip logging aborted turns in this phase. The `if (abort.signal.aborted) return;` guard in `onDone` already exists for other purposes — extend it to skip `logTurn`.

3. **Greeting turn logging**
   - What we know: The greeting (`isGreeting: true`) has no user text; `startResponse` is called with empty string.
   - What's unclear: Whether greeting latency data is useful.
   - Recommendation: Log greeting turns with `role: 'assistant'` and `text: '[greeting]'`. Greeting TTFA is a useful data point for perceived connection quality.

---

## Validation Architecture

nyquist_validation is `false` in config.json — this section is skipped.

---

## Security Domain

This phase writes log files containing:
- Session IDs (UUID, no PII linkable to visitor identity)
- Conversation transcripts (contains visitor speech-to-text)
- No authentication tokens, API keys, or secrets

**Considerations:**
- Transcript text is PII-adjacent (visitor utterances). Files live on ECS/Railway server filesystem. Access is restricted to SSH/container console access.
- No new network endpoints are created. No data leaves the server to external services.
- `LOG_DIR` should not be in a path served by any HTTP handler. The `/health` endpoint in `index.ts` does not serve static files.
- ASVS V5 (input validation): Log entries only contain data that has already been processed by DashScope — no unsanitized user input is written. `JSON.stringify()` handles escaping.

---

## Sources

### Primary (HIGH confidence)
- Bun 1.3.5 local runtime — verified `appendFileSync`, `mkdirSync`, `performance.now()`, fire-and-forget pattern
- `ws-server/src/session.ts` — direct codebase reading, all callback points identified
- `ws-server/src/dashscope/asr.ts` — identified `speech_started` event and missing `onSpeechStarted` callback
- `ws-server/src/dashscope/tts.ts` — identified `onAudioDelta` as TTFA measurement point
- `ws-server/src/dashscope/llm.ts` — identified `onChunk` as TTFT measurement point
- `.planning/REQUIREMENTS.md` — LOG-01, LOG-02 exact specification

### Secondary (MEDIUM confidence)
- N/A — no external research required for this phase

### Tertiary (LOW confidence)
- A1: Railway container filesystem write access to `/var/log/` — [ASSUMED], not verified

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all APIs verified in local Bun 1.3.5 runtime
- Architecture: HIGH — based on direct codebase reading, all instrumentation points mapped
- Pitfalls: HIGH — derived from code analysis of existing callback structure and timing closure patterns

**Research date:** 2026-04-13
**Valid until:** 2026-07-13 (stable APIs, no version-sensitive dependencies)
