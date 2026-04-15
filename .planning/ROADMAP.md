# Roadmap: Kaleb's AI Voice Portfolio

## Milestones

- ✅ **v1.0** — Phases 1-4 (shipped 2026-04-12)
- 🚧 **v1.1 Observability, Testing & Bug Fixes** — Phases 5-7 (in progress)
- 📋 **v2.0 Scholarship Video Production** — Phases 8-9 (planned)

## Phases

<details>
<summary>✅ v1.0 — Full Voice Pipeline (Phases 1-4, shipped 2026-04-12)</summary>

See full archive: [milestones/v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md)

### Phase 1: Voice Enrollment
**Goal**: Kaleb's cloned voice exists in DashScope and is verified to sound like him
**Depends on**: Nothing (first phase)
**Requirements**: VOICE-01, VOICE-02, VOICE-03, VOICE-04, VOICE-05
**Plans**: 3 plans

Plans:
- [x] 01-01: Create enrollment script, record audio, enroll voice with DashScope
- [x] 01-02: Author LLM system prompt with persona, knowledge base, and style constraints
- [x] 01-03: Verify voice quality and emotional intonation variation

### Phase 2: Server Infrastructure + Full Pipeline
**Goal**: Visitors can speak to the site and hear Kaleb's AI clone respond, end-to-end
**Depends on**: Phase 1
**Requirements**: PIPE-01, PIPE-02, PIPE-03, PIPE-04, PIPE-05, PIPE-06, CONV-03
**Plans**: 3 plans

Plans:
- [x] 02-01: Create Bun WS server scaffold with DashScope ASR integration
- [x] 02-02: Wire LLM and TTS streaming pipeline with sentence-boundary overlap
- [x] 02-03: Refactor browser hook for new protocol and add auto-reconnect

### Phase 3: Conversational AI + Speech Quality
**Goal**: Conversation feels natural — VAD activates automatically, the AI remembers context, and speech sounds human
**Depends on**: Phase 2
**Requirements**: SPCH-01, SPCH-02, SPCH-03, CONV-01, CONV-02, CONV-04, CONV-05
**Plans**: 2 plans

Plans:
- [x] 03-01: Update system prompt for speech quality and tune VAD + barge-in filter on server
- [x] 03-02: Add accessible transcript toggle and fix responseText lifecycle on client

### Phase 4: UI Preservation + Launch Readiness
**Goal**: The terminal experience is exactly as designed and the site is ready for recruiters to visit
**Depends on**: Phase 3
**Requirements**: UI-01, UI-02, UI-03, UI-04
**Plans**: 3 plans

Plans:
- [x] 04-01: Fix CSS spec gaps (line-height, overflow) and re-apply accessible transcript toggle
- [x] 04-02: Cross-viewport Playwright smoke tests and human visual verification
- [x] 04-03: Production launch: Alibaba Cloud ECS WS deploy, Vercel env vars, end-to-end smoke test

</details>

### v1.1 Observability, Testing & Bug Fixes (In Progress)

**Milestone Goal:** Fix known TTS playback regressions, add structured session analytics, and close the automated test coverage gap with component health checks and a full E2E audio pipeline test.

#### Phase 5: TTS Playback Bug Fixes
**Goal**: Every visitor hears complete, non-overlapping responses and barge-in stops audio cleanly
**Depends on**: Phase 4
**Requirements**: BUG-01, BUG-02, BUG-03
**Success Criteria** (what must be TRUE):
  1. Visitor hears the AI's full response without audio cutting off mid-sentence
  2. Interrupting the AI (barge-in) stops playback immediately with no audio overlap on the next response
  3. Barge-in teardown produces no audio pop or artifact (clean silence after interrupt)
**Plans**: 1 plan

Plans:
- [x] 05-01-PLAN.md — Fix audio cutoff (onended drain), barge-in overlap (generation counter), and audio pop (graceful TTS teardown)

#### Phase 6: Session Analytics & Logging
**Goal**: Every conversation turn is durably logged on the ECS server with latency breakdowns for each pipeline component
**Depends on**: Phase 5
**Requirements**: LOG-01, LOG-02
**Success Criteria** (what must be TRUE):
  1. A completed conversation produces an NDJSON log file on the ECS server with one entry per turn containing session ID, role, transcript text, and timestamp
  2. Each log entry includes measured latency for ASR duration, LLM time-to-first-token, TTS time-to-first-audio, and total round-trip
  3. Log writes do not add perceptible delay to the voice response (analytics is fire-and-forget, not in the hot path)
**Plans**: 1 plan

Plans:
- [x] 06-01-PLAN.md — Create logger module, extend ASR callbacks, instrument session.ts with per-turn NDJSON logging and latency tracking

#### Phase 7: Automated Testing
**Goal**: The test suite verifies WS server connectivity, each DashScope component, and the full audio pipeline end-to-end — and all tests pass in CI
**Depends on**: Phase 5
**Requirements**: TEST-01, TEST-02, TEST-03, TEST-04
**Success Criteria** (what must be TRUE):
  1. `bun test` (or equivalent) passes a health check confirming the WS server accepts a WebSocket handshake
  2. An automated test sends audio to DashScope ASR and asserts a non-empty transcript is returned within the latency target
  3. An automated test sends text to DashScope TTS and asserts PCM audio bytes are returned with a byte-level sanity check
  4. An automated E2E test exercises the full round-trip (audio input → ASR transcript → LLM response → TTS audio output) and asserts the pipeline completes successfully
  5. All tests run in CI without requiring a real microphone (audio injected at the WebSocket level)
**Plans**: TBD

Plans: TBD

### 📋 v2.0 Scholarship Video Production (Planned)

**Milestone Goal:** Create a punchy 1-2 minute TikTok-first scholarship application video showcasing the AI Voice Portfolio — what was built, the context, what was tried, and what surprised Kaleb — producing all narrative, storyboard, and production assets needed for filming day.

#### Phase 8: Script & Storyboard
**Goal**: A complete, approved script and beat-by-beat storyboard exist that tell the AI Voice Portfolio story in TikTok narrative structure
**Depends on**: Nothing (video production milestone, independent of Phases 1-7)
**Requirements**: SCRIPT-01, SCRIPT-02, SCRIPT-03, STORY-01, STORY-02
**Success Criteria** (what must be TRUE):
  1. A written script exists that follows hook → open loop → problem → mechanism → result → CTA structure and fits within 1-2 minutes at natural speaking pace
  2. The script references at least two specific technical examples drawn from the project's git history (e.g., API pivot, race conditions, audio bugs, or speech quality tuning)
  3. Scholarship pointers (context, what was built, what was tried, what surprised Kaleb) are woven into the narrative without feeling like a checklist
  4. A storyboard document exists with a row per beat: beat name, timing, spoken words, and visual type (talking head / screen demo / architecture diagram / code snippet)
**Plans**: 1 plan

Plans:
- [x] 08-01-PLAN.md — Write TikTok narrative script and beat-by-beat storyboard

#### Phase 9: Visual Production & Demo Plan
**Goal**: All production assets are ready for filming day — visual briefs for every Remotion segment and a concrete shot list so no decisions need to be made on the day
**Depends on**: Phase 8
**Requirements**: STORY-03, PROD-01, PROD-02
**Success Criteria** (what must be TRUE):
  1. A visual brief exists for every Remotion-produced segment identified in the storyboard, specifying layout, text content, color treatment, and animation intent
  2. A demo recording plan lists each section of the live site to capture, the order of capture, and any setup steps needed (e.g., clearing session state, triggering voice connection)
  3. A shot list and production checklist exist covering camera setup, lighting, wardrobe, takes required, and a pre-filming system check — so filming can start without any open decisions
**Plans**: TBD

Plans: TBD

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Voice Enrollment | v1.0 | 3/3 | Complete | 2026-04-10 |
| 2. Server Infrastructure + Full Pipeline | v1.0 | 3/3 | Complete | 2026-04-11 |
| 3. Conversational AI + Speech Quality | v1.0 | 2/2 | Complete | 2026-04-11 |
| 4. UI Preservation + Launch Readiness | v1.0 | 3/3 | Complete | 2026-04-12 |
| 5. TTS Playback Bug Fixes | v1.1 | 0/1 | Not started | - |
| 6. Session Analytics & Logging | v1.1 | 0/1 | Not started | - |
| 7. Automated Testing | v1.1 | 0/TBD | Not started | - |
| 8. Script & Storyboard | v2.0 | 1/1 | Complete   | 2026-04-15 |
| 9. Visual Production & Demo Plan | v2.0 | 0/TBD | Not started | - |
