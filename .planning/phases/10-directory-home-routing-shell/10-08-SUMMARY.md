---
phase: 10-directory-home-routing-shell
plan: 08
subsystem: ui
tags: [routing, hash-router, voice-overlay, page-shell, migration]
requires:
  - phase: 10-directory-home-routing-shell
    provides: useHashRoute hook, SECTIONS table, HomePage, StubSectionPage, NotFoundPage, FloatingMic, VoiceOverlay, Terminal chrome
provides:
  - Hash-routed app/page.tsx that mounts HomePage / StubSectionPage / NotFoundPage based on route
  - Floating mic + VoiceOverlay wiring with Esc/backdrop close
  - Retirement of BOOTING → STATUS → MENU state machine from the page root
  - Body overflow rule that allows long section pages to scroll
affects:
  - Phase 11 (Work Experience page) — slots into the hash route shell at #/work-experience
tech-stack:
  added: []
  patterns:
    - "Hash route dispatch via useHashRoute + SECTIONS.find pattern at app root"
    - "Voice overlay toggled by useState at root, with global Esc keydown listener owned by page.tsx"
    - "Body overflow split: overflow-x hidden (suppress iOS rubber-band) + overflow-y auto (allow tall sections to scroll)"
key-files:
  created: []
  modified:
    - app/page.tsx
    - app/globals.css
    - app/components/VoiceInterface.tsx
key-decisions:
  - "Kept legacy state-machine files (CognitiveStatus, CommandInput, MobileVoiceButton, TypewriterLine, useTerminalState) on disk per CONTEXT.md; only retired the imports — future cleanup task"
  - "Esc key listener lives at app/page.tsx root (not VoiceOverlay) so it works regardless of focus or mount timing"
  - "Body overflow switched from `hidden` to `overflow-x: hidden + overflow-y: auto` so tall pages like sidequests (32 rows) become reachable while still suppressing horizontal rubber-band on iOS"
  - "Dropped unused terminalState/transitionTo props from VoiceInterface call site as a Wave 3 cleanup — page.tsx no longer drives those signals"
patterns-established:
  - "Pattern: app/page.tsx is a thin shell — Starfield + Terminal chrome + route dispatch + overlay state, nothing else"
  - "Pattern: voice overlay is mounted conditionally and tears itself down on unmount (no audio overlap on reopen)"
requirements-completed: [MIG-01, MIG-02, ROUTE-01, ROUTE-02, ROUTE-03, VOICE-02, VOICE-03]
human_verification:
  - "Visit http://localhost:3000 — home renders immediately (no BOOTING typewriter): identity header, 5-link quick-bar, gold internship banner, 6 directory rows, affordance hint"
  - "Click ./work-experience/ — URL becomes #/work-experience and page transitions to stub with breadcrumb + back-home FooterMeta link"
  - "Repeat for ./syai-meetups/, ./hackathons/, ./sidequests/, ./hobbies/, ./links/ — all resolve to stub pages"
  - "Visit http://localhost:3000/#/garbage — confirm red [SYSTEM] 404 — directory not found with gold back-home link"
  - "Use browser back/forward — state restores correctly across hash routes"
  - "Resize to 360px (DevTools mobile) — quick-bar labels collapse, floating mic collapses to circle, directory rows stay ≥60px tall"
  - "Click floating ● talk to me mic — overlay opens with gold border, voice connects, AI greets, barge-in still works"
  - "Press Esc — overlay closes, mic regains focus, reopen has no audio overlap with prior session"
  - "Click backdrop (outside gold-bordered panel) — overlay closes"
  - "Enable macOS Reduce Motion, reload — confirm no fade/page-in animations play but content still renders"
metrics:
  duration: ~15 min
  completed: 2026-05-18
---

# Phase 10 Plan 08: Wire Hash-Routed Page Shell + Voice Overlay Summary

**Rewrote `app/page.tsx` as a thin hash-routed client root that mounts `HomePage`/`StubSectionPage`/`NotFoundPage` inside the Starfield+Terminal chrome and toggles `VoiceOverlay` via a floating mic — retiring the BOOTING → STATUS → MENU state machine.**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-05-18T06:17:01Z (commit ea311d2)
- **Completed:** 2026-05-18T06:18:00Z (commit c58765a)
- **Tasks:** 2 executed + 1 deferred Wave 3 cleanup (Task 3 was a human-verify checkpoint, approved)
- **Files modified:** 3

## Accomplishments

- `app/page.tsx` is now a 33-line client root: Starfield + Terminal chrome + `useHashRoute` dispatch + `voiceOpen` state + Esc handler — 166 lines removed
- Hash routes resolve correctly: `#/` → HomePage, `#/<known-section>` → StubSectionPage, anything else → NotFoundPage
- FloatingMic toggles VoiceOverlay; Esc + backdrop close work; voice pipeline unaffected
- Body overflow rule now lets long section pages scroll while still suppressing iOS horizontal rubber-band
- Dropped 2 unused VoiceInterface props (`terminalState`, `transitionTo`) — resolves the Wave 3 deferred ESLint diagnostic

## Task Commits

Each task was committed atomically:

1. **Task 1: Rewrite app/page.tsx as hash-routed client root** — `ea311d2` (feat)
2. **Task 2: Relax body overflow for long section pages** — `f771ad7` (fix)
3. **Deferred Wave 3 cleanup: Drop unused terminalState/transitionTo props from VoiceInterface** — `c58765a` (refactor)
4. **Task 3 (checkpoint:human-verify)** — Approved by user. Manual visual verification will be surfaced separately by the phase verifier as HUMAN-UAT.md (see `human_verification:` frontmatter list).

## Files Created/Modified

- `app/page.tsx` — Rewritten as thin hash-routed client root (199 → 33 lines)
- `app/globals.css` — Body overflow split into `overflow-x: hidden` + `overflow-y: auto`
- `app/components/VoiceInterface.tsx` — Removed unused `terminalState`/`transitionTo` props (Wave 3 cleanup)

## Decisions Made

See `key-decisions` frontmatter. Highlights:

- Legacy state-machine files (CognitiveStatus, CommandInput, MobileVoiceButton, TypewriterLine, useTerminalState) intentionally left on disk per CONTEXT.md — they are no longer imported by `page.tsx` and can be deleted in a future cleanup pass.
- Esc handler owned by `app/page.tsx`, not VoiceOverlay — robust against focus loss and unmount timing.
- Body overflow split preserves the original iOS rubber-band fix while unlocking vertical scroll for tall section pages.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking diagnostic cleanup] Dropped unused VoiceInterface props**
- **Found during:** Post-Task-1 type/lint check (Wave 3 deferred diagnostic from earlier plans)
- **Issue:** VoiceInterface still received `terminalState` and `transitionTo` from the legacy inline call site; once `page.tsx` no longer drove the state machine, these became dead props triggering pre-existing ESLint warnings
- **Fix:** Removed both props from the call site; `useRealtimeVoice` internally references the legacy states but they no longer affect UI
- **Files modified:** app/components/VoiceInterface.tsx
- **Verification:** `bunx tsc --noEmit` clean, ESLint warning gone
- **Committed in:** c58765a

---

**Total deviations:** 1 auto-fixed (1 blocking diagnostic cleanup carried over from Wave 3)
**Impact on plan:** Closes a pre-existing diagnostic that the plan itself enabled by removing the upstream caller. No scope creep.

## Issues Encountered

None — both planned tasks executed cleanly. The Wave 3 prop cleanup was a natural consequence of Task 1.

## Verification

- `bunx tsc --noEmit` — clean across the whole repo
- `bun run build` — succeeds
- `bun dev` — `/` and `/#/work-experience` return HTTP 200
- grep checks on `app/page.tsx` confirm all retired identifiers absent (useTerminalState, TypewriterLine, CognitiveStatus, CommandInput, MobileVoiceButton all count=0)
- Manual visual verification: approved by user; detailed steps captured as `human_verification:` frontmatter items for the phase verifier to promote into HUMAN-UAT.md

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Phase 11 (Work Experience Page) can now build `#/work-experience` as a full page; the hash route already dispatches to it via SECTIONS.
- Legacy state-machine files remain on disk and can be deleted in a future cleanup pass without affecting current behavior.

## Self-Check: PASSED

- `app/page.tsx` — FOUND (modified)
- `app/globals.css` — FOUND (modified)
- `app/components/VoiceInterface.tsx` — FOUND (modified)
- Commit ea311d2 — FOUND
- Commit f771ad7 — FOUND
- Commit c58765a — FOUND

---
*Phase: 10-directory-home-routing-shell*
*Completed: 2026-05-18*
