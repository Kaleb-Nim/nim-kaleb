# Requirements: Kaleb's AI Voice Portfolio

**Defined:** 2026-04-13
**Core Value:** Visitors can have a natural, human-sounding voice conversation with an AI clone of Kaleb that authentically represents his experience and personality.

## v1.1 Requirements

Requirements for milestone v1.1: Observability, Testing & Bug Fixes.

### Bug Fixes (TTS Playback)

- [ ] **BUG-01**: Audio playback completes without cutoff using `onended`-based drain instead of `setTimeout` estimate
- [ ] **BUG-02**: Barge-in does not produce overlapping audio — `nextPlayTimeRef` resets to `ctx.currentTime` with generation counter on `TtsHandle`
- [ ] **BUG-03**: Server-side barge-in teardown sends `session.finish` to TTS instead of `ws.close()` to prevent audio pops

### Analytics & Logging

- [ ] **LOG-01**: Each conversation turn is logged as structured NDJSON on the ECS server with session ID, role, transcript text, and timestamp
- [ ] **LOG-02**: Each turn log includes per-component latency measurements (ASR duration, LLM TTFT, TTS TTFA, total round-trip)

### Testing — Component Health

- [ ] **TEST-01**: Automated test verifies WS server accepts WebSocket handshake and responds to health check
- [ ] **TEST-02**: Automated test sends audio to ASR and asserts transcript is returned within latency target
- [ ] **TEST-03**: Automated test sends text to TTS and asserts PCM audio is returned with byte-level sanity check

### Testing — E2E Audio

- [ ] **TEST-04**: Automated test exercises full pipeline round-trip: audio input → ASR transcript → LLM response → TTS audio output

## v1.2+ Requirements

Deferred to future release. Tracked but not in current roadmap.

### Analytics

- **LOG-03**: Question topic classification via keyword heuristics (fire-and-forget)
- **LOG-04**: Session summary metrics (duration, turn count, topics)

### Testing

- **TEST-05**: Barge-in quality test asserting audio suppression < 200ms on interrupt

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Real-time analytics dashboard | Over-engineering for solo portfolio |
| MOS/WER automated scoring | No baseline to compare against |
| OpenTelemetry integration | Portfolio scale doesn't justify complexity |
| Load testing | Single-user portfolio, not multi-tenant |
| Coverage enforcement | Small codebase, not needed |
| External analytics services (Mixpanel/PostHog) | Unnecessary cost and complexity for personal site |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| BUG-01 | — | Pending |
| BUG-02 | — | Pending |
| BUG-03 | — | Pending |
| LOG-01 | — | Pending |
| LOG-02 | — | Pending |
| TEST-01 | — | Pending |
| TEST-02 | — | Pending |
| TEST-03 | — | Pending |
| TEST-04 | — | Pending |

**Coverage:**
- v1.1 requirements: 9 total
- Mapped to phases: 0
- Unmapped: 9

---
*Requirements defined: 2026-04-13*
*Last updated: 2026-04-13 after initial definition*
