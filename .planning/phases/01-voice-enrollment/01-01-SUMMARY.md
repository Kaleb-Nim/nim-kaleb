---
phase: 01-voice-enrollment
plan: 01
subsystem: voice
tags: [dashscope, qwen3-tts, voice-cloning, enrollment, whisper, ffmpeg]

requires: []
provides:
  - DASHSCOPE_VOICE_ID for all downstream TTS calls
  - Enrollment script for re-enrollment if needed
affects: [02-realtime-voice-pipeline, voice-verification]

tech-stack:
  added: [dashscope-api, whisper, ffmpeg, sox]
  patterns: [env-var-secrets, gitignored-media-assets, skip-record-rerun]

key-files:
  created:
    - scripts/enroll-voice.sh
    - assets/reference-audio/.gitkeep
  modified:
    - .gitignore
    - .env.local

key-decisions:
  - "Used file-based jq payload to avoid macOS ARG_MAX on large base64 audio"
  - "SKIP_RECORD=1 flag for re-enrollment without re-recording"
  - "500ms trailing silence padding to prevent phoneme bleed"

patterns-established:
  - "Secrets in .env.local, never committed"
  - "Media assets gitignored with .gitkeep placeholder"

requirements-completed: [VOICE-01]

duration: 12min
completed: 2026-04-09
---

# Plan 01-01: Voice Enrollment Summary

**DashScope voice clone enrolled from 15s reference audio with Whisper transcript, producing persistent voice_id for all TTS calls**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-04-09
- **Completed:** 2026-04-09
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Enrollment script created with full automation: record, convert, pad silence, transcribe, enroll
- Kaleb's voice enrolled with DashScope as `qwen-tts-vc-kaleb-voice-20260409131147531-d171`
- DASHSCOPE_VOICE_ID stored in .env.local for downstream TTS
- Fixed ARG_MAX issue with file-based JSON payload for large base64 audio

## Task Commits

1. **Task 1: Create enrollment script and directory structure** - `45ede85` (feat)
2. **Task 2: Execute voice enrollment** - `afe8025` (fix: ARG_MAX payload fix + successful enrollment)

## Files Created/Modified
- `scripts/enroll-voice.sh` - One-time voice enrollment automation with DashScope
- `assets/reference-audio/.gitkeep` - Directory placeholder for gitignored audio files
- `.gitignore` - Added reference-audio WAV/TXT exclusions
- `.env.local` - Added DASHSCOPE_VOICE_ID

## Decisions Made
- Used `--rawfile` + temp file instead of `--arg` for jq to handle large base64 payloads (macOS ARG_MAX limit)
- Kept SKIP_RECORD=1 mode for re-enrollment flexibility

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] ARG_MAX overflow on base64 audio payload**
- **Found during:** Task 2 (Execute voice enrollment)
- **Issue:** jq `--arg` passes entire base64 string as shell argument, exceeding macOS ARG_MAX for large WAV files
- **Fix:** Switched to `--rawfile` with process substitution and temp file for JSON payload
- **Files modified:** scripts/enroll-voice.sh
- **Verification:** Enrollment succeeded on retry
- **Committed in:** afe8025

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Fix was essential for enrollment to work on macOS. No scope creep.

## Issues Encountered
None beyond the ARG_MAX fix above.

## User Setup Required
- DASHSCOPE_API_KEY added to .env.local (done)
- DASHSCOPE_VOICE_ID added to .env.local (done)

## Next Phase Readiness
- voice_id ready for Phase 2 TTS pipeline integration
- Enrollment script available for re-enrollment if voice quality needs iteration

---
*Phase: 01-voice-enrollment*
*Completed: 2026-04-09*
