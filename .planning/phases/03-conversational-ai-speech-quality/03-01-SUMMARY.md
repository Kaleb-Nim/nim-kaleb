---
phase: 03-conversational-ai-speech-quality
plan: 01
subsystem: api
tags: [dashscope, asr, llm, tts, voice, conversation, system-prompt, barge-in, vad]

# Dependency graph
requires:
  - phase: 02-server-infrastructure
    provides: Bun WS server with DashScope ASR+LLM+TTS pipeline, session.ts orchestration, barge-in via cancelCurrentResponse()

provides:
  - System prompt with D-01 through D-04 speech quality guidance integrated into "How I Speak" section
  - VAD silence timeout at 1000ms (was 400ms) — users are no longer cut off mid-sentence
  - Barge-in word-count filter — sub-3-word utterances ignored during AI playback
  - Barge-in acknowledgment prefix "Oh sure — " injected into LLM messages array (not history)

affects:
  - 03-02-transcript-toggle (browser UI — no server changes needed)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "bargeInPrefix injected as one-time assistant message before user turn — never stored in conversationHistory"
    - "wasResponding flag detected before cancelCurrentResponse() to conditionally inject barge-in prefix"
    - "Word-count filter using split(/\\s+/).filter(Boolean).length before any pipeline trigger"

key-files:
  created: []
  modified:
    - prompts/system-prompt.md
    - ws-server/src/dashscope/asr.ts
    - ws-server/src/session.ts
    - ws-server/src/dashscope/llm.ts

key-decisions:
  - "bargeInPrefix passed as optional last param to streamLlmResponse — injected as assistant message before user turn, not stored in conversationHistory (avoids Pitfall 4)"
  - "wasResponding captured before cancelCurrentResponse() call so flag is accurate"
  - "VAD timeout increase from 400ms to 1000ms is server-side only — no client changes needed"

patterns-established:
  - "One-time LLM injection pattern: pass optional assistant prefix via function param, spread into messages array conditionally"
  - "Barge-in gate: check wordCount < 3 before cancelCurrentResponse() to avoid false triggers on filler speech"

requirements-completed: [SPCH-01, SPCH-02, SPCH-03, CONV-01, CONV-02]

# Metrics
duration: 8min
completed: 2026-04-10
---

# Phase 03 Plan 01: Conversational Speech Quality Summary

**System prompt tuned for natural speech (filler words, adaptive length, casual greetings, 1-in-3 follow-ups), VAD silence at 1000ms, barge-in ignores sub-3-word utterances, valid barge-in gets "Oh sure —" prefix injected into LLM messages**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-04-10T02:00:00Z
- **Completed:** 2026-04-10T02:08:40Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Updated system prompt with all D-01 through D-04 speech quality guidance: casual energetic greetings, filler word cadence without stacking, adaptive response length by question type, and 1-in-3 follow-up question rule
- Increased ASR VAD silence threshold from 400ms to 1000ms so users finish their thought before the pipeline triggers
- Added 3-word barge-in filter in session.ts — filler utterances like "ahh i see" no longer abort AI responses
- Added D-06 barge-in acknowledgment: "Oh sure — " injected as one-time LLM assistant message when interrupting an in-flight response

## Task Commits

Each task was committed atomically:

1. **Task 1: Update system prompt with speech quality instructions** - `60dce87` (feat)
2. **Task 2: Tune VAD silence timeout and add barge-in word filter with acknowledgment** - `53200e5` (feat)

## Files Created/Modified

- `prompts/system-prompt.md` - Added D-01 filler word cadence, D-02 follow-up frequency (1 in 3), D-03 adaptive response length, D-04 casual energetic greetings
- `ws-server/src/dashscope/asr.ts` - Changed silence_duration_ms from 400 to 1000
- `ws-server/src/session.ts` - Added empty/short transcript guards, wasResponding detection, bargeInPrefix construction, passed prefix to streamLlmResponse
- `ws-server/src/dashscope/llm.ts` - Added bargeInPrefix optional param; conditionally spreads assistant prefix message before user turn in messages array

## Decisions Made

- `bargeInPrefix` is NOT pushed to `conversationHistory` — it is injected as a one-time assistant message directly into the LLM `messages` array for a single call only. The full assistant response (which naturally begins "Oh sure —") is stored in history via the existing `onDone` callback. This avoids accumulating synthetic history entries (Pitfall 4 from RESEARCH.md).
- `wasResponding` is captured before `cancelCurrentResponse()` so the flag accurately reflects whether a response was in-flight at the moment of interruption.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Known Stubs

None — all changes are fully wired. System prompt changes take effect immediately at LLM call time (prompt is read once at module init). VAD change is live in ASR session config. Barge-in filter and prefix are active in the session pipeline.

## Next Phase Readiness

- Server-side speech quality improvements are complete and ready for 03-02 (transcript toggle UI)
- No server changes needed for 03-02 — that plan is browser-side only
- Build confirmed clean: `bun run build` in ws-server/ completes without errors

## Self-Check: PASSED

- `prompts/system-prompt.md` exists and contains "waddup bro", "1-2 sentences", "1 in 3", "stack multiple fillers"
- `ws-server/src/dashscope/asr.ts` contains `silence_duration_ms: 1000`
- `ws-server/src/session.ts` contains `wordCount < 3`, `wasResponding`, `Oh sure`
- `ws-server/src/dashscope/llm.ts` contains `bargeInPrefix?: string` and conditional spread
- Commits `60dce87` and `53200e5` exist in git log

---
*Phase: 03-conversational-ai-speech-quality*
*Completed: 2026-04-10*
