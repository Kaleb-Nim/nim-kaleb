# Architecture Research

**Domain:** AI voice portfolio v1.1 — conversation analytics, E2E audio testing, TTS playback bug fixes
**Researched:** 2026-04-13
**Confidence:** HIGH (based on direct codebase analysis; no speculative claims)

---

## Context: Existing Architecture (v1.0 — Do Not Change)

```
Browser (Vercel/Next.js 16)         Alibaba Cloud ECS (Bun)           DashScope APIs
┌──────────────────────────┐        ┌────────────────────────┐        ┌─────────────┐
│ useRealtimeVoice hook    │◄─wss──►│ index.ts (Bun.serve)   │◄──ws──►│ ASR WS      │
│  AudioContext 16kHz      │        │ Session class           │◄─http─►│ LLM HTTP    │
│  ScriptProcessorNode     │        │   ├─ asrWs              │◄──ws──►│ TTS WS      │
│  AudioContext 24kHz      │        │   ├─ ttsHandle          │        └─────────────┘
│  Terminal state machine  │        │   ├─ conversationHist   │
└──────────────────────────┘        │   └─ responseAbort      │
                                    │ dashscope/asr.ts         │
                                    │ dashscope/llm.ts         │
                                    │ dashscope/tts.ts         │
                                    └────────────────────────┘

Message protocol (types.ts):
  Browser→Server: session.start | audio.append | audio.end
  Server→Browser: session.ready | transcript.partial | transcript.final
                  response.audio.delta | response.text.delta
                  response.done (immediate?) | error
```

### Existing Turn Data Flow

```
1. Mic PCM16 chunks  →  audio.append  →  forwardAudioToAsr()  →  ASR WS
2. ASR fires onTranscriptFinal        →  Session.startResponse(text)
3. createTtsSession() opens TTS WS
4. streamLlmResponse() streams tokens →  appendTextToTts() per sentence boundary
5. finishTtsSession() sets handle.finishing = true  →  session.finish to TTS
6. TTS response.done (finishing=true) →  onDone callback
7. response.audio.delta chunks        →  scheduleAudioChunk()  →  AudioBufferSourceNode
```

---

## New Components Required for v1.1

### 1. Session Analytics Collector (NEW — ws-server/src/analytics.ts)

**What it is:** A class instantiated once per `Session` that records conversation events and timing on the server. Flushes a complete session record when `Session.cleanup()` is called.

**Why server-side only:** The server already has all data needed — `transcript.final` fires server-side, the server generates `response.audio.delta` and `response.done`. No browser instrumentation needed, no new WS protocol messages required.

**Integration points in session.ts (5 hooks, no structural changes):**

| Existing location | New analytics call |
|-------------------|--------------------|
| `startPipeline()` after ASR opens | `analytics.sessionStart()` |
| `onTranscriptFinal` callback | `analytics.recordUtterance(text, timestamp)` |
| `startResponse()` entry | `analytics.startTurn()` |
| `streamLlmResponse()` onDone | `analytics.endTurn(assistantResponse)` |
| `cleanup()` | `analytics.flush(sessionId)` |

**Storage:** Append-line JSON to `/var/log/portfolio/sessions.ndjson` on ECS. Simplest path — zero extra dependencies, same Bun process. Upgrade path to `bun:sqlite` (same process, same server) if query support is needed later.

**Session record schema:**
```typescript
interface SessionRecord {
  sessionId: string;
  startedAt: string;       // ISO timestamp
  endedAt: string;
  durationMs: number;
  turnCount: number;
  turns: Array<{
    index: number;
    userText: string;
    assistantText: string;
    ttfaMs: number;        // time-to-first-audio after transcript.final
    totalMs: number;       // transcript.final → response.done
    classification: string; // career | project | technical | personality | other
  }>;
}
```

**Question classification:** A pure function `classifyQuestion(text: string): string` using keyword/regex rules — no LLM call. Runs inside `analytics.recordUtterance()`. Portfolio categories are narrow enough for keyword matching.

---

### 2. TTS Playback Bug Fixes (MODIFY — two files)

The v1.0 bugs are architectural, not cosmetic. Each fix is isolated to a specific mechanism.

#### Bug 1: Overlapping audio on barge-in (useRealtimeVoice.ts)

**Root cause:** When `response.done { immediate: true }` arrives, the code calls `ctx.close()` and creates a new `AudioContext`. But `AudioBufferSourceNode` instances scheduled on the old context are already decoded into the browser's audio graph — closing the context does not stop them immediately; they may play for another 50-200ms.

**Fix:** Maintain `activeSourcesRef: useRef<Set<AudioBufferSourceNode>>(new Set())`. In `scheduleAudioChunk()`, add each new source to the set and remove it in its `onended` handler. On barge-in, call `source.stop(0)` on every entry in the set before closing the context.

```
response.done { immediate: true }:
  1. activeSourcesRef.current.forEach(s => { try { s.stop(0) } catch {} })
  2. activeSourcesRef.current.clear()
  3. ctx.close()  [existing]
  4. new AudioContext()  [existing]
  5. nextPlayTimeRef.current = 0  [existing]
```

#### Bug 2: Audio cut-offs at end of response (useRealtimeVoice.ts)

**Root cause:** `remaining * 1000 + 200ms` drain timeout underestimates actual decode + render time, especially on first load when the AudioContext has not warmed up. The timeout fires while the last buffer is still playing.

**Fix:** Track the last scheduled `AudioBufferSourceNode`. When `response.done` (non-immediate) arrives, set a `waitingForLastChunk` flag. The last source's `onended` event fires the cleanup (clear responseText, close/recreate AudioContext) instead of a `setTimeout`. This is exact — no estimation.

Implementation sketch:
```
scheduleAudioChunk():
  source.onended = () => {
    activeSourcesRef.current.delete(source)
    if (isLastSourceRef.current === source) {
      // Drain complete — clean up
      resetPlayback()
    }
  }
  activeSourcesRef.current.add(source)

response.done (non-immediate):
  isLastSourceRef.current = lastScheduledSource  // set before ctx might be replaced
```

#### Bug 3: Server-side barge-in race (session.ts)

**Root cause:** `cancelCurrentResponse()` calls `ttsHandle.ws.close()` immediately. In-flight audio delta messages from TTS already in the WS receive buffer get dropped before they can be forwarded to the browser, causing the barge-in audio to cut with a pop.

**Fix:** On barge-in, send `session.finish` to TTS instead of closing the WS. Let TTS drain its buffer (it will emit any queued deltas then `response.done`). Only close the WS in the `onDone` callback. The existing `response.done { immediate: true }` signal already tells the browser to discard the audio — so clean drain on the server side is safe.

**No new protocol messages needed.** The existing `response.done { immediate: true }` is the correct primitive.

---

### 3. E2E Audio Test Infrastructure (NEW — tests/)

The existing `tests/ws-pipeline.spec.ts` covers DashScope connectivity and WS handshake at the protocol level. v1.1 adds two more layers:

#### Layer A: Component Health Tests (tests/component-health.spec.ts)

Extends the existing `openWs()` helper from `ws-pipeline.spec.ts`. Adds latency assertions and PCM sanity checks not currently tested:

| Test | New assertion |
|------|--------------|
| TTS first audio latency | First `response.audio.delta` within 3s of `input_text_buffer.append` |
| ASR transcript latency | `transcript.final` within 3s of sending 2s of PCM fixture audio |
| LLM first-token latency | First chunk within 2s (already tested; add `Date.now()` timing) |
| TTS PCM sanity | Decode base64 chunk, verify byte length matches 24kHz rate (48000 bytes/s ± 20%) |

No new infrastructure — these run in the same Playwright Node.js context as existing backend tests.

#### Layer B: E2E Audio Round-Trip Tests (tests/e2e-audio.spec.ts)

**What it tests:** Full pipeline Browser → WS → DashScope → Browser with real audio content, including barge-in.

**The microphone problem:** Playwright's Chromium blocks `getUserMedia` in CI (no mic hardware). Real microphone input is also non-deterministic. Solution: inject a synthetic `MediaStream` from a pre-recorded PCM fixture file via `page.evaluate()`.

**Synthetic audio injection approach:**
1. Pre-record two fixtures (WAV, 16kHz mono PCM16):
   - `tests/fixtures/utterance-experience.wav` — "Tell me about your experience" (~3s)
   - `tests/fixtures/utterance-bargein.wav` — "Wait, actually" (~1.5s)
2. In the test, load fixture bytes into a browser `ArrayBuffer` via `page.evaluate()`
3. Use `MediaStreamTrackGenerator` (Insertable Streams API, available in Chromium 102+) to create a fake `MediaStreamTrack` and feed PCM chunks into it
4. Override `navigator.mediaDevices.getUserMedia` to return the fake stream before the hook calls it

**What to assert in e2e-audio.spec.ts:**
- `session.ready` arrives within 15s of `session.start`
- `transcript.final` text fuzzy-matches fixture content (ASR variance — use `includes` not exact match)
- `response.audio.delta` arrives within 5s of `transcript.final`
- Barge-in: inject `utterance-bargein.wav` during active TTS playback → `response.done { immediate: true }` arrives within 2s → new `session.ready` or response stream starts

**Barge-in test sequence:**
```
1. Connect, send utterance-experience.wav
2. Wait for response.audio.delta to start (TTS responding)
3. While responding, send utterance-bargein.wav chunks
4. Assert: response.done { immediate: true } received
5. Assert: new response begins (response.audio.delta again within 5s)
```

---

## Modified Data Flow (v1.1 with new components)

```
Session.startPipeline()
  ├─ createAsrSession()               [existing]
  ├─ analytics.sessionStart()         [NEW]
  └─ startResponse('', {isGreeting})  [existing]

onTranscriptFinal(text)
  ├─ analytics.recordUtterance(text)  [NEW — includes classification]
  └─ startResponse(text)             [existing]
      ├─ analytics.startTurn()        [NEW]
      ├─ cancelCurrentResponse()      [MODIFIED — send session.finish instead of ws.close]
      ├─ createTtsSession()           [existing]
      └─ streamLlmResponse()
          ├─ appendTextToTts()        [existing]
          └─ onDone:
              ├─ finishTtsSession()   [existing]
              └─ analytics.endTurn()  [NEW]

Session.cleanup()
  ├─ analytics.flush() → NDJSON      [NEW]
  └─ [existing cleanup]

Browser: scheduleAudioChunk(pcm)
  ├─ source.onended removes from activeSourcesRef  [NEW]
  └─ tracks isLastSourceRef                        [NEW]

Browser: response.done { immediate: true }
  ├─ activeSourcesRef.forEach(s.stop(0))  [NEW — replaces naive ctx.close]
  ├─ activeSourcesRef.clear()             [NEW]
  └─ [existing: new AudioContext, reset nextPlayTimeRef]

Browser: response.done (normal end)
  └─ isLastSourceRef.onended fires resetPlayback()  [NEW — replaces setTimeout]
```

---

## Component Boundaries After v1.1

| Component | File | Responsibility | Change |
|-----------|------|----------------|--------|
| WS Server entry | `ws-server/src/index.ts` | HTTP + WS lifecycle | None |
| Session orchestrator | `ws-server/src/session.ts` | Pipeline coordination, barge-in | MODIFIED — analytics hooks + barge-in teardown fix |
| Analytics collector | `ws-server/src/analytics.ts` | Session logging, turn timing, classification | NEW |
| ASR client | `ws-server/src/dashscope/asr.ts` | DashScope ASR WS | None |
| LLM client | `ws-server/src/dashscope/llm.ts` | DashScope LLM HTTP | None |
| TTS client | `ws-server/src/dashscope/tts.ts` | DashScope TTS WS | None |
| Voice hook | `app/hooks/useRealtimeVoice.ts` | Browser audio + WS client | MODIFIED — activeSourcesRef + onended-based drain |
| Terminal UI | `app/components/*` | UI state machine | None |
| WS + DashScope tests | `tests/ws-pipeline.spec.ts` | Protocol + API connectivity | None (unchanged) |
| Component health tests | `tests/component-health.spec.ts` | Latency + PCM assertions | NEW |
| E2E audio tests | `tests/e2e-audio.spec.ts` | Full round-trip + barge-in | NEW |
| PCM fixtures | `tests/fixtures/*.wav` | Deterministic test audio | NEW |

---

## Recommended Build Order

Dependencies flow strictly: fix the audio bugs first (stable playback makes e2e tests reliable), then add analytics (server-only, no browser changes), then tests (can assert against stable behavior).

**Step 1: TTS playback bug fixes (useRealtimeVoice.ts + session.ts)**
- No dependencies on analytics or new tests
- Immediately improves visitor experience in production
- Adds `activeSourcesRef`, `isLastSourceRef`, and `onended`-based drain to browser hook
- Fixes server-side barge-in teardown in `cancelCurrentResponse()`
- Validation: manual test session in browser + run existing `ws-pipeline.spec.ts`

**Step 2: Session analytics collector (analytics.ts + session.ts)**
- No browser changes required
- Create `analytics.ts`, wire 5 hooks into `Session`
- Validate by watching NDJSON output during a live session on ECS
- Enables data collection immediately; no test infrastructure needed

**Step 3: Component health tests (component-health.spec.ts)**
- No new infrastructure — extends existing Playwright Node.js test runner
- Adds PCM latency assertions and byte-level sanity checks
- Can run in CI without microphone or browser window
- Run against local WS server + live DashScope (same as existing ws-pipeline.spec.ts)

**Step 4: E2E audio tests (e2e-audio.spec.ts)**
- Depends on Step 1 being stable — flaky audio makes timing assertions unreliable
- Create `tests/fixtures/` WAV files first (can record locally)
- Implement synthetic MediaStream injection via `page.evaluate()`
- Most complex test layer; runs as integration gate in CI

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Browser-Side Analytics via WS Protocol

**What people do:** Add new WS message types (e.g., `analytics.playback_start`) sent from browser to server to capture perceived latency.

**Why it's wrong:** Complicates the protocol, adds round-trip ambiguity, and the server already has all timing data. `transcript.final` fires server-side; `response.audio.delta` is server-generated. The server knows exact pipeline latency without browser involvement.

**Do this instead:** Instrument analytics entirely in `session.ts`. Zero new WS messages.

### Anti-Pattern 2: External Analytics Database

**What people do:** Send session records to Postgres, Redis, or a third-party analytics SaaS.

**Why it's wrong:** This is a portfolio project with ~10 concurrent visitors at peak. External services add cost, network latency on flush, and operational burden for data that rarely needs to be queried.

**Do this instead:** NDJSON file on the ECS instance. One `fs.appendFileSync()` call at session end. Upgrade to `bun:sqlite` (same process, zero added infra) if query support is needed.

### Anti-Pattern 3: Real Microphone in Playwright Tests

**What people do:** Grant Playwright microphone permissions and expect `getUserMedia` to work in CI with a real capture device.

**Why it's wrong:** CI runners have no microphone hardware. Even locally, real mic input is non-deterministic — ASR results vary, making transcript assertions fragile.

**Do this instead:** Pre-record PCM WAV fixtures. Inject a synthetic `MediaStream` via `MediaStreamTrackGenerator` in `page.evaluate()` before the hook initializes. Deterministic, CI-safe, reproducible.

### Anti-Pattern 4: setTimeout-Based Audio Drain

**What people do:** Calculate `remaining = nextPlayTimeRef - ctx.currentTime` and add a fixed margin (e.g., 200ms) to decide when playback has finished.

**Why it's wrong:** The estimate fails under CPU load, slow decode, or uneven chunk arrival. The 200ms margin is simultaneously too short (causes cut-offs on slow hardware) and too long (delays UI reset).

**Do this instead:** Use `AudioBufferSourceNode.onended` on the last scheduled source. This event fires at the exact moment playback completes — no estimation.

### Anti-Pattern 5: Closing TTS WebSocket on Barge-In

**What people do:** Call `ttsHandle.ws.close()` immediately in `cancelCurrentResponse()` to stop TTS output.

**Why it's wrong:** Audio deltas already queued in the WS receive buffer get dropped, causing a pop/glitch on the browser side. The server-side close races with the browser-side `response.done { immediate }` handler.

**Do this instead:** Send `session.finish` to TTS. Let TTS drain its buffer and emit its final `response.done`. The browser already discards queued audio on `{ immediate: true }` — a clean server drain is safe and eliminates the pop.

---

## Integration Points Summary

| Feature | Where It Hooks In | What Changes |
|---------|------------------|--------------|
| Analytics collection | `Session.onTranscriptFinal`, `startResponse`, `streamLlmResponse onDone`, `cleanup` | 5 new method calls in session.ts |
| Analytics storage | End of `Session.cleanup()` | `analytics.flush()` → append NDJSON |
| Question classification | Inside `analytics.recordUtterance()` | Pure keyword-match function, no external calls |
| Barge-in audio fix | `useRealtimeVoice: response.done { immediate }` handler | Replace `ctx.close()` with `activeSourcesRef.forEach(s.stop)` |
| Drain fix | `useRealtimeVoice: scheduleAudioChunk` + `response.done` handler | Track last source, use `onended` callback |
| Server barge-in fix | `Session.cancelCurrentResponse()` | Send `session.finish` instead of `ws.close()` |
| Component health tests | `tests/component-health.spec.ts` | New file, extends existing `openWs()` helper |
| E2E audio tests | `tests/e2e-audio.spec.ts` | New file + `tests/fixtures/*.wav` |

---

## Sources

- Direct codebase analysis: `ws-server/src/session.ts`, `ws-server/src/dashscope/tts.ts`, `ws-server/src/dashscope/asr.ts`, `ws-server/src/dashscope/llm.ts`, `app/hooks/useRealtimeVoice.ts`, `ws-server/src/types.ts`, `tests/ws-pipeline.spec.ts` — HIGH confidence (first-party)
- Web Audio API `AudioScheduledSourceNode.onended`: https://developer.mozilla.org/en-US/docs/Web/API/AudioScheduledSourceNode/onended — HIGH confidence
- `MediaStreamTrackGenerator` (Insertable Streams): https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrackGenerator — MEDIUM confidence (Chromium-only, matches Playwright's Chromium target)
- Playwright microphone permissions: https://playwright.dev/docs/api/class-browsercontext#browser-context-grant-permissions — HIGH confidence
- Bun SQLite: https://bun.sh/docs/api/sqlite — HIGH confidence

---

*Architecture research for: AI voice portfolio v1.1 observability + testing + TTS bug fixes*
*Researched: 2026-04-13*
