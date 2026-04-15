# Project Research Summary

**Project:** Kaleb's AI Voice Portfolio — v1.1 Observability, Testing & TTS Bug Fixes
**Domain:** AI voice clone portfolio — cascaded STT/LLM/TTS pipeline on Alibaba Cloud / Qwen
**Researched:** 2026-04-13
**Confidence:** HIGH (architecture and pitfalls based on direct codebase analysis; stack verified against official docs)

## Executive Summary

v1.1 is an engineering hardening sprint, not a feature expansion. The existing voice pipeline (browser WebSocket to Bun WS server on ECS to DashScope ASR/LLM/TTS) is functional but has a confirmed TTS audio cutoff bug, no observability, and no CI-safe audio test coverage. This milestone fixes known breakage, adds structured session logging with question classification, and closes the audio testing gap.

The recommended approach is strictly layered: fix the TTS playback bugs first (most visitor-visible issue, makes test assertions unreliable), then add server-side analytics (zero browser changes, five hooks into existing session.ts), then build test infrastructure. The bug fixes are architectural — `AudioBufferSourceNode` lifecycle management in the browser hook and server-side barge-in teardown sequencing. No new dependencies beyond `pino` for structured logging.

Primary risks: (1) E2E audio test architecture decision must be made before writing any audio tests — Playwright cannot test real mic in CI; inject audio at WebSocket level; (2) analytics logging must be metadata-only by default for GDPR and disk growth; (3) question classification must run fire-and-forget to avoid 300-500ms latency in the hot path.

## Key Findings

### Recommended Stack

No new framework additions required. The existing stack handles all v1.1 needs.

**Core technologies:**
- `pino@10.x` on Bun WS server: structured JSON logging — fastest Node-compatible logger; works in Bun un-bundled (HIGH confidence)
- `bun test` (built-in): backend unit/integration tests — Jest-compatible, TypeScript native, no install (HIGH confidence)
- `@playwright/test@1.58.2` with Chromium fake audio flags: E2E audio tests (HIGH confidence)
- NDJSON file logging on ECS: zero-cost analytics at portfolio scale (HIGH confidence)

**No new dependencies for:**
- TTS bug fixes — architectural changes to existing `useRealtimeVoice.ts` and `session.ts`
- Component health tests — extend existing `openWs()` helper in `ws-pipeline.spec.ts`
- Question classification — keyword heuristics, no ML classifier justified

### Expected Features

**Must have (table stakes):**
- TTS audio cutoff fix — `AudioBufferSourceNode.onended`-based drain replaces naive `setTimeout`
- Barge-in race fix — `nextPlayTimeRef` reset to `ctx.currentTime` not `0`; generation counter on `TtsHandle`
- Structured session logging — NDJSON append on ECS; per-turn schema with latency fields
- Per-turn latency instrumentation — ASR/LLM/TTS boundary timestamps
- WS server + DashScope component health tests — nothing currently tests WS connectivity or ASR/TTS synthesis
- E2E audio pipeline test with fake microphone — closes most critical coverage gap

**Should have (differentiators):**
- Question topic classification — keyword heuristics, fire-and-forget
- Barge-in quality test — asserts audio suppression < 200ms

**Defer:**
- Real-time analytics dashboard, MOS/WER scoring, multi-server log aggregation, OpenTelemetry, load testing

### Architecture Approach

All v1.1 changes are strictly additive or targeted fixes. No protocol changes and minimal browser involvement for analytics.

**Modified components:**
1. `ws-server/src/session.ts` — 5 analytics hook callsites + barge-in teardown fix
2. `app/hooks/useRealtimeVoice.ts` — `activeSourcesRef` + `onended`-based drain + `nextPlayTimeRef` fix

**New components:**
3. `ws-server/src/analytics.ts` — session collector, per-turn timing, NDJSON flush, keyword classifier
4. `tests/component-health.spec.ts` — latency assertions + PCM byte sanity checks
5. `tests/e2e-audio.spec.ts` — full round-trip test with audio injection

### Critical Pitfalls

1. **Wrong E2E audio test architecture** — Playwright cannot use real mic in CI; sine tone doesn't trigger DashScope VAD. Inject audio at WebSocket level.
2. **`setTimeout`-based audio drain is broken** — Estimating remaining playback fails under CPU load. Use `AudioBufferSourceNode.onended` on last scheduled source.
3. **Analytics in the hot path adds 300-500ms latency** — Never `await` classification inside `onTranscriptFinal`. Fire-and-forget only.
4. **Raw transcript logging creates GDPR liability and disk growth** — Metadata-only by default; gate full transcripts behind `LOG_FULL_TRANSCRIPTS=true`.
5. **WS server not starting in CI** — `playwright.config.ts` has one `webServer` entry. Add second for WS server. First task in testing phase.
6. **`TtsHandle` race conditions on rapid barge-in** — Stale `nextPlayTimeRef` and `finishing` flag cause double `response.done`. Fix with generation counter.

## Implications for Roadmap

Suggested 5 phases, strictly ordered by dependencies:

### Phase 5: TTS Playback Bug Fixes
Fix production regression affecting every visitor. Must be stable before analytics captures baseline and tests make timing assertions.
- Files: `app/hooks/useRealtimeVoice.ts`, `ws-server/src/session.ts`
- Effort: 0.5-1 day

### Phase 6: Test Infrastructure Setup
CI environment must be correct before new tests. Add WS server to Playwright `webServer`, decide on audio test architecture.
- Files: `playwright.config.ts`
- Effort: 0.5 day

### Phase 7: WS Server + Component Health Tests
Extends existing helpers, runs without browser or mic. Fills critical coverage gap at low complexity.
- Files: `tests/component-health.spec.ts` (new)
- Effort: 1-1.5 days

### Phase 8: E2E Audio Pipeline Test
Depends on stable audio (Phase 5) and CI infrastructure (Phase 6). Most complex test layer.
- Files: `tests/e2e-audio.spec.ts` (new), WAV fixtures
- Effort: 2 days

### Phase 9: Session Analytics & Logging
Last because requires stable audio for meaningful metrics. Async-only design enforced from start.
- Files: `ws-server/src/analytics.ts` (new), `ws-server/src/session.ts` (5 hooks)
- Effort: 1.5 days

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | pino on Bun verified; bun test stable; Playwright fake audio documented |
| Features | HIGH | TTS root cause confirmed in debug file; scope bounded from codebase analysis |
| Architecture | HIGH | All from first-party codebase inspection; integration points specific and concrete |
| Pitfalls | HIGH | All from direct code analysis; no speculative claims |

**Overall confidence:** HIGH

### Gaps to Address

- **`MediaStreamTrackGenerator` in Playwright Chromium:** Write minimal POC before architecting E2E tests around it; fallback is WS-level PCM injection
- **`ScriptProcessorNode` migration timing:** If deferred, suppress in Playwright config and document as known debt
- **Latency baseline:** Measure transcript-to-first-audio-delta in production before adding analytics

---
*Research completed: 2026-04-13*
*Ready for roadmap: yes*
