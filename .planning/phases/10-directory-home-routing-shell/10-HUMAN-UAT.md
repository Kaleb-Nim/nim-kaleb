---
status: partial
phase: 10-directory-home-routing-shell
source: [10-VERIFICATION.md]
started: 2026-05-18T00:00:00Z
updated: 2026-05-18T00:00:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Home renders without typewriter
expected: All five home blocks (identity header w/ blinking cursor, 5-link quick-bar, gold internship banner, 6 directory rows, affordance hint) visible immediately on first paint of `/`; the legacy BOOTING → STATUS → MENU typewriter sequence never plays
result: [pending]

### 2. Hash routing — back/forward, direct URL, unknown → 404
expected: Tapping each of the 6 directory rows navigates to its `#/<path>`; browser Back/Forward restore the right view; reloading directly on `#/hackathons` works; typing `#/garbage` shows the red `[SYSTEM] 404 — directory not found` page
result: [pending]

### 3. Voice overlay DashScope round-trip + no audio overlap on reopen (VOICE-03)
expected: Tapping the floating mic opens the gold-bordered overlay; ASR → LLM → TTS streams over DashScope; the proactive greeting fires; pressing Esc tears the session down cleanly; reopening starts a fresh session with no leftover playback from the previous one
result: [pending]
related: WR-04 (no abort signal on useRealtimeVoice.connect — escalate to blocker if overlap observed)

### 4. 360px responsive collapse
expected: At a 360px viewport, the floating mic collapses to a circle (label hidden), the home quick-bar labels hide, and all 6 directory rows remain ≥60px tall and tappable
result: [pending]

### 5. prefers-reduced-motion honoured
expected: With macOS "Reduce motion" enabled, reloading `/` shows no fade-in, no `kniPageIn` animation, no pulses — content renders statically
result: [pending]

## Summary

total: 5
passed: 0
issues: 0
pending: 5
skipped: 0
blocked: 0

## Gaps
