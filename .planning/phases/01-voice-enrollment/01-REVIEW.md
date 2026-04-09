---
phase: 01-voice-enrollment
reviewed: 2026-04-09T00:00:00Z
depth: standard
files_reviewed: 3
files_reviewed_list:
  - scripts/enroll-voice.sh
  - scripts/verify-voice.sh
  - prompts/system-prompt.md
findings:
  critical: 0
  warning: 3
  info: 2
  total: 5
status: issues_found
---

# Phase 1: Code Review Report

**Reviewed:** 2026-04-09
**Depth:** standard
**Files Reviewed:** 3
**Status:** issues_found

## Summary

Reviewed the voice enrollment scripts (`enroll-voice.sh`, `verify-voice.sh`) and the system prompt (`system-prompt.md`). Both shell scripts are well-structured with proper `set -euo pipefail`, preflight checks, and clear step-by-step flow. The system prompt is thorough with good guardrails.

The main concerns are: (1) a potential ARG_MAX issue in `enroll-voice.sh` where a large base64 string is still passed through shell variable expansion despite the comment claiming to avoid this, (2) a temp file leak on error due to `set -e` exiting before cleanup, and (3) dead code from an unused variable.

## Warnings

### WR-01: ARG_MAX Still Reachable via Process Substitution

**File:** `scripts/enroll-voice.sh:106`
**Issue:** Line 101 comments "Build JSON payload via file to avoid ARG_MAX limits on large base64 audio," but line 106 uses `--rawfile audio_b64 <(echo -n "$AUDIO_B64")` which expands the full base64 string as an argument to `echo`. For a 15-second 24kHz 16-bit mono WAV, the base64 is approximately 960KB -- close to macOS's ~1MB `ARG_MAX`. Longer recordings or higher sample rates will exceed the limit and cause a silent failure.
**Fix:** Write the base64 to a temp file and use `--rawfile` on that file directly:
```bash
AUDIO_B64_FILE=$(mktemp)
base64 -i "$PADDED_FILE" | tr -d '\n' > "$AUDIO_B64_FILE"
jq -n \
  --arg target_model "$TARGET_MODEL" \
  --arg transcript "$TRANSCRIPT" \
  --rawfile audio_b64 "$AUDIO_B64_FILE" \
  '{ ... }' > "$PAYLOAD_FILE"
rm -f "$AUDIO_B64_FILE"
```

### WR-02: Temp File Not Cleaned Up on Error

**File:** `scripts/enroll-voice.sh:102-124`
**Issue:** `PAYLOAD_FILE` is created via `mktemp` on line 102 but only removed on line 124. Because `set -e` is active, if `jq` (line 103) or `curl` (line 119) fails, the script exits immediately and `rm -f "$PAYLOAD_FILE"` on line 124 never runs, leaving a temp file containing the full API key in the Authorization header (via the payload file containing the audio data, though not the key itself -- but the temp file still leaks audio data).
**Fix:** Add a trap at the top of the script or just before the temp file creation:
```bash
PAYLOAD_FILE=$(mktemp)
trap 'rm -f "$PAYLOAD_FILE"' EXIT
```

### WR-03: Fragile HTTP Status Code Parsing

**File:** `scripts/verify-voice.sh:58-59`
**Issue:** The HTTP status code is extracted via `tail -1` from `curl -w "\n%{http_code}"` output. If the API response body ends with trailing newlines, or if `jq` processing on line 63 encounters issues, the parsed HTTP code could be wrong. This is a known fragile pattern.
**Fix:** Use a separate file or variable for the HTTP code to avoid mixing it with the response body:
```bash
HTTP_CODE_FILE=$(mktemp)
BODY=$(curl -s -o - -w "%{http_code}" -X POST "$ENDPOINT" \
  -H "Authorization: Bearer $DASHSCOPE_API_KEY" \
  -H "Content-Type: application/json" \
  -d "$(jq -n ...)" 2>"$HTTP_CODE_FILE")
```
Or more simply, use `--write-out` to a separate stderr stream:
```bash
BODY=$(curl -s -X POST "$ENDPOINT" ... -d "$(jq -n ...)")
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$ENDPOINT" ... -d "$(jq -n ...)")
```
Though the double-request approach has its own downsides. The current approach works in practice for most JSON APIs that return clean response bodies -- consider adding a regex validation: `[[ "$HTTP_CODE" =~ ^[0-9]{3}$ ]]`.

## Info

### IN-01: Unused Variable AUDIO_DATA_URI

**File:** `scripts/enroll-voice.sh:98`
**Issue:** `AUDIO_DATA_URI` is constructed on line 98 (`"data:audio/wav;base64,$AUDIO_B64"`) but never referenced. The data URI is instead constructed inline within the `jq` expression on line 113. This is dead code.
**Fix:** Remove line 98:
```bash
# Delete this line:
AUDIO_DATA_URI="data:audio/wav;base64,$AUDIO_B64"
```

### IN-02: Verify Script Writes Planning Artifacts

**File:** `scripts/verify-voice.sh:79-98`
**Issue:** The verification script creates a planning markdown file (`DEFERRED-VOICE-VERIFY.md`) in `.planning/phases/02-server-infrastructure/` when cross-model incompatibility is detected. This mixes operational scripting with project management concerns. If the `.planning/` directory structure changes, this script will silently create orphaned files.
**Fix:** Instead of writing the file, print the deferred verification instructions to stdout and let the developer handle planning artifacts manually. This keeps the script focused on its single responsibility (voice verification).

---

_Reviewed: 2026-04-09_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
