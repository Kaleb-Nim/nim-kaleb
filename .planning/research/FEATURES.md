# Feature Landscape

**Domain:** AI Voice Clone Portfolio — Observability, Testing, and TTS Bug Fixes (v1.1)
**Researched:** 2026-04-13
**Confidence:** HIGH (testing patterns, TTS root cause) / MEDIUM (analytics schema, health check approach)

> This file covers NEW features for the v1.1 milestone only.
> v1.0 voice pipeline features are documented in `.planning/research/FEATURES.md` (archived history).
> Existing baseline: 1 UI smoke test + 9 backend/WS pipeline tests (Playwright), no analytics, known TTS cutoff bug.

---

## Table Stakes

Features this milestone must deliver. Missing these leaves the product in a degraded, hard-to-maintain state.

### 1. TTS Playback Bug Fix — Audio Cutoff on Multi-Sentence Responses

| Attribute | Detail |
|-----------|--------|
| Why required | Root cause confirmed (debug file): `response.done` from server triggers immediate AudioContext close/recreate, destroying all pre-scheduled `AudioBufferSourceNode`s before they play. Multi-sentence responses cut off after the first segment. This is a regression from v1.0 production. |
| Complexity | Low-Medium |
| Dependencies | `app/hooks/useRealtimeVoice.ts` response.done handler |

**Fix pattern:** Drain scheduled audio before context teardown. Calculate remaining playback duration as `nextPlayTimeRef.current - audioCtx.currentTime`. Schedule context close via `setTimeout(delay)` instead of synchronous close. All audio chunks already scheduled will play to completion before the context is recreated.

**Barge-in variant:** When user interrupts, the drain delay must be skipped (immediate stop is correct). The handler needs to distinguish between barge-in-triggered `response.done` and natural completion `response.done`.

### 2. Structured Session Logging

| Attribute | Detail |
|-----------|--------|
| Why required | Without logs, there is no way to know what visitors are asking, where conversations fail, or whether the voice pipeline is degrading in production. Table stakes for any production service. |
| Complexity | Medium |
| Dependencies | WS server (`ws-server/`), persistent storage (file or external) |

Per-session log schema (minimum viable):

```json
{
  "session_id": "uuid",
  "started_at": "ISO8601",
  "ended_at": "ISO8601",
  "duration_seconds": 42,
  "turn_count": 6,
  "turns": [
    {
      "turn_index": 0,
      "user_transcript": "What projects have you built?",
      "ai_response_text": "Great question — I built...",
      "asr_latency_ms": 210,
      "llm_latency_ms": 380,
      "tts_first_chunk_ms": 120,
      "total_latency_ms": 710,
      "barge_in_detected": false,
      "tts_completed": true
    }
  ],
  "question_topics": ["projects", "skills"],
  "outcome": "completed"
}
```

**Storage:** Append-only NDJSON log file on ECS server (simple, zero dependencies). Rotate daily. This is sufficient for a single-server portfolio with low traffic.

**Why not a database:** Over-engineering for a personal portfolio. File logs are readable, portable, and trivially backed up. Upgrade to SQLite or Postgres only if analytics queries become complex.

### 3. Per-Turn Latency Instrumentation

| Attribute | Detail |
|-----------|--------|
| Why required | Diagnosing voice pipeline slowdowns requires component-level timing, not just total round-trip. Industry standard is to track ASR, LLM, and TTS latency separately. |
| Complexity | Low |
| Dependencies | WS server pipeline orchestration, timestamps at each stage transition |

Capture timestamps at: ASR start → ASR final transcript → LLM first token → LLM completion → TTS first audio chunk → TTS last chunk. Emit per-turn object to session log.

**Key metrics to track:**
- `asr_latency_ms` — user stops speaking to final transcript
- `llm_ttft_ms` — LLM time to first token
- `tts_ttfa_ms` — LLM first token to first audio chunk (TTS first audio)
- `total_latency_ms` — user silence to first audio heard

Target thresholds (based on industry research, P95): ASR < 300ms, LLM TTFT < 400ms, TTS TTFA < 200ms, total < 800ms.

### 4. WS Server + DashScope Component Health Tests

| Attribute | Detail |
|-----------|--------|
| Why required | The existing 9 tests cover HTTP endpoints. Nothing tests WS server connectivity, ASR connection, or TTS synthesis in CI. Component failures would only be discovered when a visitor reports a broken session. |
| Complexity | Medium |
| Dependencies | Running WS server (`wss://ws.kalebnim.dev`), DashScope API key |

Test coverage needed:

| Test | What It Verifies | Approach |
|------|-----------------|----------|
| WS server accepts connections | `wss://ws.kalebnim.dev` responds to WebSocket handshake | Playwright `page.routeWebSocket()` or raw `WebSocket` in test |
| ASR pipeline produces a transcript | Send a short WAV utterance, receive transcript within 5s | Extend existing `tts-stt-pipeline.spec.ts` pattern |
| TTS synthesis returns valid PCM audio | Send a short text string, receive WAV bytes with correct RIFF header | Existing test pattern already covers this |
| WS message protocol round-trip | Client sends audio frames, server echoes back correct message types | New WS integration test |
| Barge-in: server cancels in-flight TTS | Inject speech during active TTS, verify cancellation message sent | New test — high complexity |

DashScope does not expose a dedicated health check endpoint (verified via search). Component health must be inferred from a minimal round-trip: send → expect response type within timeout.

### 5. E2E Audio Pipeline Test (Fake Microphone)

| Attribute | Detail |
|-----------|--------|
| Why required | No current test verifies the full browser → WS → DashScope → browser audio pipeline. A test that sends fake audio and confirms audio output closes the most critical gap. |
| Complexity | High |
| Dependencies | Playwright Chromium with `--use-fake-device-for-media-stream`, WAV fixture file |

**Playwright setup pattern** (HIGH confidence — official Playwright docs + community verification):

```typescript
// playwright.config.ts — add to chromium project
projects: [{
  name: 'chromium',
  use: {
    ...devices['Desktop Chrome'],
    launchOptions: {
      args: [
        '--use-fake-ui-for-media-stream',       // Auto-grant mic permission
        '--use-fake-device-for-media-stream',    // Use fake mic instead of real hardware
        '--use-file-for-fake-audio-capture=tests/fixtures/test-utterance.wav',
      ],
    },
  },
}]
```

**Test flow:**
1. Navigate to app, reach VOICE_IDLE state
2. Click Connect — WS connection established
3. Fake mic plays WAV fixture (e.g., "What projects have you built?")
4. Assert: audio element plays or `analyserRef` reports non-zero audio data within 15s
5. Assert: transcript element shows AI response text (if transcript toggle is accessible)

**Limitation:** Playwright cannot assert on actual audio playback quality — only that audio output is happening (non-silent analyser data). Full perceptual quality testing requires human evaluation or MOS scoring tools (out of scope for v1.1).

**Firefox / WebKit:** Firefox supports fake media via `media.navigator.streams.fake` preference. WebKit has no documented workaround — test Chromium only for audio tests.

---

## Differentiators

Features that go beyond what most voice portfolio apps instrument. High value, but not blocking release.

### 6. Question Topic Classification

| Attribute | Detail |
|-----------|--------|
| Value | Understand what recruiters actually care about. Topic buckets: `projects`, `skills`, `experience`, `education`, `personality`, `availability`, `off-topic`. |
| Complexity | Low-Medium |
| Approach | Use LLM (same Qwen model, small prompt) to classify each user transcript into a topic bucket post-turn. Add `question_topic` field to turn log. Alternatively, use keyword heuristics (fast, zero-cost, good enough for a portfolio). |
| Dependency | Session logging must exist first |

Keyword heuristic coverage for portfolio domain:
- `projects` — "built", "project", "github", "portfolio"
- `skills` — "know", "experience with", "familiar", "tech stack"
- `experience` — "worked at", "company", "job", "role", "years"
- `education` — "degree", "university", "study", "course"
- `availability` — "hire", "open to", "looking for", "relocate"

LLM classification is more accurate but adds latency and cost per turn. Keyword heuristics are sufficient for a personal portfolio and can be upgraded later.

### 7. Session Outcome Tracking

| Attribute | Detail |
|-----------|--------|
| Value | Know whether visitors completed a full conversation or dropped off. Useful for identifying where the experience breaks. |
| Complexity | Low |
| Approach | Track: `session_start`, `first_user_turn` (did they actually speak?), `turn_count`, `outcome` (completed / dropped / error). Add `disconnect_reason` (user_initiated / timeout / error). |
| Dependency | Session logging |

### 8. Barge-In Quality Test

| Attribute | Detail |
|-----------|--------|
| Value | Barge-in is a known quality issue. A test that verifies the server sends cancellation and the client stops audio within 200ms would validate any fix. |
| Complexity | High |
| Approach | Playwright test: start AI response playback (wait for audio analyser activity), then inject barge-in WAV while AI is speaking. Measure time between barge-in detection and audio silence. Target: < 200ms suppression latency. |
| Dependency | E2E audio test (Feature 5) must exist first |

---

## Anti-Features

Features to explicitly NOT build in v1.1.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| External analytics service (Mixpanel, Amplitude, PostHog) | Over-engineering for a personal portfolio with <100 visitors/month. Adds third-party dependency, privacy concerns, and cost. | Append-only NDJSON on ECS. Simple, private, zero cost. |
| Real-time analytics dashboard | No operational need during v1.1. Adds significant frontend + backend work. | Read raw NDJSON logs manually or with `jq`. Build a dashboard if pattern analysis becomes a recurring need. |
| MOS (Mean Opinion Score) automated scoring | MOS requires either human raters or a trained perceptual model. Neither fits a solo developer workflow. | Manual listening check after each deploy. |
| Load testing / stress testing | Single-user portfolio doesn't need to handle concurrent sessions. | Skip. ECS resources are adequate for the expected traffic pattern. |
| OpenTelemetry / distributed tracing | Full OTEL setup (spans, exporters, collectors) is appropriate at team scale. Heavyweight for one server. | Structured JSON logging with manual correlation via `session_id`. |
| Test coverage enforcement | Coverage tooling for Playwright E2E is not standard and adds friction. | Focus on test quality (what's covered) not metric (% coverage). |
| Regression test suite for voice quality | Voice quality regression (WER, MOS) requires a labeled dataset and model infrastructure. | Manual smoke test after deploy: listen to 3 test questions. |

---

## Feature Dependencies

```
[TTS Playback Bug Fix]
    — independent, fix immediately

[Structured Session Logging]
    └──required by──> [Question Topic Classification]
    └──required by──> [Session Outcome Tracking]
    └──required by──> [Per-Turn Latency Instrumentation]

[Per-Turn Latency Instrumentation]
    └──requires──> [Timestamps at WS server pipeline stages]

[E2E Audio Pipeline Test]
    └──requires──> [Playwright fake audio config]
    └──required by──> [Barge-In Quality Test]

[WS + DashScope Health Tests]
    └──requires──> [Live WS server reachable from CI]
```

**Critical dependency note:** The E2E audio test (Feature 5) requires the Playwright Chromium launch args to be added to `playwright.config.ts`. This change affects ALL existing tests — verify no regressions before merging.

**WS server tests against production:** Tests targeting `wss://ws.kalebnim.dev` will fail if the ECS server is down. These are integration tests against live infrastructure, not unit tests. They should be tagged separately from the fast local tests and run on demand, not in every CI run.

---

## MVP Definition for v1.1

### Must Ship

1. **TTS audio cutoff fix** — `setTimeout` drain in `response.done` handler. Blocks all audio quality confidence. Ship first.
2. **Session logging (NDJSON, per-turn)** — Append-only log file on ECS. Captures transcripts, latency, barge-in events.
3. **Per-turn latency instrumentation** — Timestamps at ASR/LLM/TTS boundaries. Written to session log.
4. **Playwright: fake audio E2E test** — Verifies full browser → WS → DashScope → browser pipeline.
5. **Playwright: WS + ASR + TTS component health tests** — Fills gap left by v1.0 test suite.

### Add After Core Works

6. **Question topic classification** (keyword heuristics) — Post-turn classification added to session log.
7. **Barge-in quality test** — Depends on E2E audio test infrastructure.

### Defer

8. **Real-time analytics dashboard** — Manual log reading is sufficient at current scale.
9. **MOS scoring** — Manual listening check is sufficient.
10. **Multi-server log aggregation** — Only one ECS server; no aggregation needed.

---

## Implementation Complexity Summary

| Feature | Effort | Blocks | Blocked By |
|---------|--------|--------|------------|
| TTS audio cutoff fix | 0.5 day | Nothing | Nothing |
| Per-turn latency instrumentation | 1 day | Session logging | Nothing |
| Structured session logging | 1 day | Topic classification, outcome tracking | Per-turn latency |
| WS + component health tests | 1.5 days | Barge-in test | Live WS server |
| E2E audio pipeline test | 2 days | Barge-in test | Playwright config change |
| Question topic classification | 0.5 day | — | Session logging |
| Barge-in quality test | 2 days | — | E2E audio test |

Estimated total: ~8.5 developer-days for full scope. ~4 days for must-ship MVP.

---

## Sources

- [Hamming AI: Voice Agent Observability](https://hamming.ai/blog/voice-agent-observability-voice-observability) — Turn-level logging as table stakes, differentiators for LLM-as-judge
- [Hamming AI: Voice Agent QA Guide](https://hamming.ai/resources/guide-to-ai-voice-agents-quality-assurance) — Barge-in testing methodology, latency thresholds (P95 < 800ms)
- [TruFoundry: Specialized Observability for Voice AI](https://www.truefoundry.com/blog/beyond-the-log-file-why-specialized-observability-is-non-negotiable-for-production-voice-ai) — ASR/LLM/TTS separate latency tracking
- [Playwright: Fake Audio Setup (Omar El-Baz)](https://omarelb.substack.com/p/til-2-set-up-playwright-with-fake) — `--use-fake-device-for-media-stream` args pattern
- [Playwright: Mock APIs](https://playwright.dev/docs/mock) — WebSocket mocking via `page.routeWebSocket()`
- [MarkTechPost: Voice Agent Evaluation 2025](https://www.marktechpost.com/2025/10/05/how-to-evaluate-voice-agents-in-2025-beyond-automatic-speech-recognition-asr-and-word-error-rate-wer-to-task-success-barge-in-and-hallucination-under-noise/) — Barge-in metrics: suppression latency, true/false positive rate
- [SparkCo: Barge-In Detection](https://sparkco.ai/blog/optimizing-voice-agent-barge-in-detection-for-2025) — Sub-100ms detection standard, 2025
- Internal: `.planning/debug/tts-cutoff-mid-stream.md` — Root cause confirmed: AudioContext close destroys pre-scheduled chunks

---
*Research scope: v1.1 Observability, Testing & Bug Fixes*
*Researched: 2026-04-13*
