---
phase: quick-260415-mot
plan: "01"
subsystem: voice
tags: [mobile, getUserMedia, audio, permissions, bug-fix]
dependency_graph:
  requires: []
  provides: [gesture-safe-mic-connect, permissions-policy-header]
  affects: [app/hooks/useRealtimeVoice.ts, next.config.ts]
tech_stack:
  added: []
  patterns: [getUserMedia-before-setState, AudioContext-resume, stream-reuse-reconnect]
key_files:
  created: []
  modified:
    - app/hooks/useRealtimeVoice.ts
    - next.config.ts
decisions:
  - getUserMedia moved before setPhase() in connect() to preserve user gesture activation window
  - connectInternal refactored to accept MediaStream param; stream acquired outside
  - Auto-reconnect reuses live mic stream tracks instead of re-calling getUserMedia
  - Permissions-Policy header added as defense-in-depth, not root cause fix
metrics:
  duration_minutes: 15
  completed_date: "2026-04-15"
  tasks_completed: 2
  files_modified: 2
---

# Quick Task 260415-mot: Fix Mobile Connect Button Permission Error

**One-liner:** Moved getUserMedia before any React setState in connect() to keep it within the iOS/Android gesture activation window, added stream-reuse reconnect and user-friendly error messages.

## What Was Done

### Task 1: Restructure connect flow for mobile gesture safety (`785d698`)

Three changes to `app/hooks/useRealtimeVoice.ts`:

**Change A: getUserMedia first in connect()**

`connect()` now calls `navigator.mediaDevices.getUserMedia({ audio: true })` as the very first async operation, before `setPhase('connecting')`. On mobile browsers (iOS Safari, mobile Chrome), any React state update before `getUserMedia` breaks the user gesture activation window and causes `NotAllowedError`. The stream is then passed into `connectInternal(stream)` after the phase update.

**Change B: connectInternal accepts MediaStream parameter**

`connectInternal` signature changed from `async ()` to `async (stream: MediaStream)`. It no longer calls `getUserMedia` internally. Both `AudioContext` instances now call `await ctx.resume()` after creation to prevent permanently suspended contexts on mobile.

The `ws.onclose` reconnect path now does selective cleanup (preserves `micStreamRef.current`) and checks if the existing stream's tracks are still live before reusing. If tracks are dead and no gesture is available, it transitions to error with "Tap Connect to reconnect."

**Change C: getUserMediaErrorMessage helper**

Added a module-level helper that maps `DOMException` names to user-friendly strings:
- `NotAllowedError` → lock icon instructions
- `NotFoundError` → no microphone found message
- `NotReadableError` → mic in use by another app message

### Task 2: Add Permissions-Policy header (`a13b8d0`)

Added `async headers()` to `next.config.ts` returning `Permissions-Policy: microphone=(self)` on all routes (`/(.*)`). Defense-in-depth against Vercel header defaults changing.

## Commits

| Task | Commit | Message |
|------|--------|---------|
| 1 | `785d698` | fix(260415-mot-01): restructure connect flow for mobile gesture safety |
| 2 | `a13b8d0` | chore(260415-mot-01): add Permissions-Policy microphone header to all routes |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Threat Flags

None — changes reduce attack surface (no new endpoints or auth paths introduced).

## Verification

1. `bun run build` — passed, no TypeScript errors
2. Mobile browser verification: tap Connect, mic permission prompt should now appear (requires live device test post-deploy)
3. After deploy: `curl -sI https://nim-kaleb.vercel.app/ | grep -i permissions-policy` should return `microphone=(self)`

## Self-Check: PASSED

- `app/hooks/useRealtimeVoice.ts` — modified (getUserMedia restructure confirmed)
- `next.config.ts` — modified (headers() confirmed)
- Commit `785d698` — exists
- Commit `a13b8d0` — exists
