---
phase: 05-tts-playback-bug-fixes
plan: 01
subsystem: audio
tags: [web-audio-api, tts, barge-in, audiobuffernode, dashscope]

requires:
  - phase: 02-server-infrastructure
    provides: DashScope TTS pipeline with session.ts and tts.ts
provides:
  - onended-based audio drain (no setTimeout cutoff)
  - Generation counter for stale audio delta rejection
  - Graceful TTS teardown via finishTtsSession on barge-in
affects: []

tech-stack:
  added: []
  patterns:
    - "lastSourceRef tracks final AudioBufferSourceNode for onended drain"
    - "playGenRef generation counter invalidates stale audio deltas on barge-in"

key-files:
  created: []
  modified:
    - app/hooks/useRealtimeVoice.ts
    - ws-server/src/session.ts

key-decisions:
  - "Used onended callback instead of setTimeout for audio drain — event-driven, no timing guesswork"
  - "Reset nextPlayTimeRef to newCtx.currentTime instead of 0 — avoids scheduling audio in the past"
  - "Generation counter approach for stale delta rejection — lightweight, no extra state machine"

patterns-established:
  - "Audio drain via lastSourceRef.onended: wait for last scheduled chunk to finish before closing context"
  - "Generation counter guard in scheduleAudioChunk: drop deltas from aborted responses"

requirements-completed: [BUG-01, BUG-02, BUG-03]

duration: 5min
completed: 2026-04-13
---

# Phase 5 Plan 01: TTS Playback Bug Fixes Summary

**Fixed audio cutoff (onended drain), barge-in overlap (generation counter + correct time reset), and barge-in pop (finishTtsSession graceful teardown)**

## Performance

- **Duration:** 5 min
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- BUG-01: Audio now plays to completion — drain waits for onended callback instead of estimating with setTimeout
- BUG-02: Barge-in produces no overlapping audio — playGenRef generation counter drops stale deltas, nextPlayTimeRef resets to newCtx.currentTime (not 0)
- BUG-03: Barge-in teardown sends session.finish to DashScope instead of ws.close(), preventing audio pop

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix audio cutoff and barge-in overlap on client (BUG-01 + BUG-02)** - `1f8a886` (fix)
2. **Task 2: Fix audio pop on barge-in teardown on server (BUG-03)** - `7eb9a50` (fix)

## Files Created/Modified
- `app/hooks/useRealtimeVoice.ts` - Added lastSourceRef/playGenRef refs, generation guard in scheduleAudioChunk, onended drain in response.done, correct time reset on barge-in
- `ws-server/src/session.ts` - Replaced ws.close() with finishTtsSession() in cancelCurrentResponse

## Decisions Made
- Used onended callback instead of setTimeout for audio drain — event-driven, no timing guesswork
- Reset nextPlayTimeRef to newCtx.currentTime instead of 0 — avoids scheduling audio in the past
- Generation counter for stale delta rejection — lightweight, no extra state machine needed

## Deviations from Plan
None - plan executed exactly as written

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All three TTS playback bugs resolved
- Manual testing recommended: connect to voice interface, let AI respond fully (verify no cutoff), interrupt mid-response (verify no overlap or pop)

---
*Phase: 05-tts-playback-bug-fixes*
*Completed: 2026-04-13*
