---
phase: 01-voice-enrollment
plan: 02
subsystem: voice
tags: [llm-system-prompt, persona, voice-style, guardrails, qwen]

requires: []
provides:
  - LLM system prompt defining Kaleb's persona, knowledge base, and speaking style
  - Conversation style variants for TTS emotional prosody
affects: [02-realtime-voice-pipeline]

tech-stack:
  added: []
  patterns: [first-person-persona, topic-based-style-switching, prompt-injection-defense]

key-files:
  created:
    - prompts/system-prompt.md
  modified: []

key-decisions:
  - "First-person identity anchoring ('You ARE Kaleb') not third-person assistant framing"
  - "3-4 sentence max constraint for conversational TTS pacing"
  - "Six distinct conversation styles for emotional variation in TTS prosody"
  - "Template approach with KALEB: markers for user to fill in, then populated with real data"

patterns-established:
  - "System prompts stored in prompts/ directory as markdown"
  - "Topic-specific speaking styles to drive TTS emotional variation"

requirements-completed: [VOICE-03, VOICE-04, VOICE-05]

duration: 10min
completed: 2026-04-09
---

# Plan 01-02: System Prompt Summary

**First-person persona prompt with Kaleb's full work history, 6 topic-specific conversation styles for TTS prosody, and prompt injection guardrails**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-04-09
- **Completed:** 2026-04-09
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- System prompt authored with complete 5-section structure: Identity, Background, How I Speak, Conversation Style, Guardrails
- Populated with Kaleb's actual experience: RAID, Tensorplex, A*STAR roles, hackathon wins, SYAI community work
- Six distinct conversation style sections for TTS emotional variation (technical, career, challenges, casual, unknown, meta)
- Guardrails against prompt injection, off-topic diversion, and private information disclosure

## Task Commits

1. **Task 1: Author system prompt template** - `f8bd07e` (feat)
2. **Task 2: Populate with Kaleb's actual profile** - `b6371ac` (content)

## Files Created/Modified
- `prompts/system-prompt.md` - Complete LLM persona definition (167 lines) with knowledge base, style constraints, and guardrails

## Decisions Made
- Included hackathons and community leadership sections beyond the template minimum (adds conversational depth)
- Added personal interests section (solo travel, bouldering, skiing, diving) for casual conversation topics
- Included "This portfolio site itself" as a 6th conversation style (meta-awareness for visitor engagement)

## Deviations from Plan
None - plan executed as specified. Template created by executor agent, then populated with real data from information.txt.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- System prompt ready to be loaded as system message in Qwen LLM calls (Phase 2)
- File at `prompts/system-prompt.md` — Phase 2 will wire this into the voice API route

---
*Phase: 01-voice-enrollment*
*Completed: 2026-04-09*
