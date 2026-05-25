---
phase: 16-voice-cta-visibility-make-talk-to-me-unmissable
plan: 01
subsystem: ui
tags: [react, css-keyframes, localstorage, cta, voice-discovery]

# Dependency graph
requires:
  - phase: 10
    provides: HomePage, FloatingMic, page.tsx voiceOpen state, globals.css keyframes
provides:
  - VoiceCTA component with terminal system message design and first-visit nudge
  - onVoiceOpen prop threading from page.tsx through HomePage to VoiceCTA
  - kniCTAEntrance and kniMicIdle keyframes in globals.css
  - VOICE-VIS-01..04 requirements enumerated in REQUIREMENTS.md
affects: [16-02 FloatingMic improvements]

# Tech tracking
tech-stack:
  added: []
  patterns: [localStorage first-visit tracking, CSS entrance animation on component mount]

key-files:
  created: [app/components/VoiceCTA.tsx]
  modified: [app/components/HomePage.tsx, app/page.tsx, app/globals.css, .planning/REQUIREMENTS.md]

key-decisions:
  - "VoiceCTA uses inline styles (matches HomePage, FloatingMic, Directory convention)"
  - "localStorage key set immediately on first mount (not on dismiss) to prevent re-fire on route navigation"

patterns-established:
  - "First-visit nudge: useState(false) default + useEffect localStorage check + CSS animation toggle"
  - "Callback threading: page.tsx owns state, passes setter as prop through intermediary components"

requirements-completed: [VOICE-VIS-01, VOICE-VIS-03, VOICE-VIS-04]

# Metrics
duration: 2min
completed: 2026-05-25
---

# Phase 16 Plan 01: Voice CTA Visibility Summary

**Terminal system message VoiceCTA with first-visit entrance animation, wired to VoiceOverlay via onVoiceOpen prop chain**

## Performance

- **Duration:** 2 min
- **Started:** 2026-05-25T09:08:19Z
- **Completed:** 2026-05-25T09:10:03Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments
- Created VoiceCTA component styled as a terminal system message with green left-accent border, distinct from directory rows
- First-visit entrance animation (kniCTAEntrance) plays once via localStorage tracking, never repeats
- CTA click triggers the same VoiceOverlay connection flow as FloatingMic (setVoiceOpen(true))
- Added kniMicIdle keyframe for Plan 02 FloatingMic improvements

## Task Commits

Each task was committed atomically:

1. **Task 1: Add keyframes and VOICE-VIS requirements** - `464b3b9` (chore)
2. **Task 2: Create VoiceCTA component** - `2b0ebba` (feat)
3. **Task 3: Wire VoiceCTA into HomePage and page.tsx** - `ac4cf7b` (feat)

## Files Created/Modified
- `app/components/VoiceCTA.tsx` - New voice CTA component with terminal system message design
- `app/components/HomePage.tsx` - Added VoiceCTA import, HomePageProps interface, onVoiceOpen prop
- `app/page.tsx` - Passes onVoiceOpen={() => setVoiceOpen(true)} to HomePage
- `app/globals.css` - Added kniCTAEntrance and kniMicIdle keyframes
- `.planning/REQUIREMENTS.md` - Added VOICE-VIS-01..04 requirements and traceability

## Decisions Made
- Used inline styles (not CSS modules) to match existing HomePage/FloatingMic/Directory convention
- localStorage key set on mount (not on dismiss/click) to prevent nudge re-fire on hash route navigation
- No auto-dismiss timer for entrance animation -- animation plays once and holds via CSS `both` fill mode

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- VoiceCTA renders on home page between internship banner and directory
- kniMicIdle keyframe ready for Plan 02 FloatingMic improvements
- Build passes cleanly with zero TypeScript errors

---
*Phase: 16-voice-cta-visibility-make-talk-to-me-unmissable*
*Completed: 2026-05-25*
