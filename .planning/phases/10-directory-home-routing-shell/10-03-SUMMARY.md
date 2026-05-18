---
phase: 10-directory-home-routing-shell
plan: 03
subsystem: ui
tags: [next.js, react, typescript, hash-routing, components]

# Dependency graph
requires:
  - phase: 10-directory-home-routing-shell
    provides: "Typed Section + SECTIONS from app/lib/sections.ts (Plan 10-02)"
provides:
  - "<Directory rows={SECTIONS} onNav={fn} /> default export"
  - "<DirRow row={...} onNav={fn} /> named export"
  - "Hash-anchor row pattern (<a href='#/{id}'> + preventDefault + onNav)"
affects: [10-06, 10-08]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Inline styles for terminal components (per CLAUDE.md: avoid Tailwind for phosphor text-shadow + precise spacing)"
    - "Hash-anchor pattern: <a href='#/...'> preserves middle/right-click semantics; left-click intercepted via preventDefault → onNav"

key-files:
  created:
    - app/components/Directory.tsx
  modified: []

key-decisions:
  - "Inline styles ported verbatim from Directory.jsx — no extraction to CSS module (per plan + design fidelity)"
  - "Render <a href='#/{id}'> NOT next/link — design depends on raw anchor for middle/right-click + hashchange"
  - "minHeight 60 (vs design comment's 56) per plan spec — touch-target floor for HOME-04"

patterns-established:
  - "Component-local style objects (dirStyles const) for shared color/glow tokens"
  - "Optional onNav callback (`onNav?: (id: string) => void`) — component is pure renderer, navigation injected by parent"

requirements-completed: [HOME-04]

# Metrics
duration: 1min
completed: 2026-05-18
---

# Phase 10 Plan 03: Directory + DirRow Components Summary

**Ported `Directory.jsx` from the v3 design kit to a strict-TS React 19 client component — six tappable rows (`<a href="#/{id}">`) wired through optional `onNav` callback for HomePage consumption.**

## Performance

- **Duration:** ~1 min
- **Started:** 2026-05-18T05:57:49Z
- **Completed:** 2026-05-18T05:58:40Z
- **Tasks:** 1
- **Files modified:** 1 (new)

## Accomplishments

- Created `app/components/Directory.tsx` (166 lines) as a 1:1 TSX port of `.planning/research/v3-design-kit/Directory.jsx` with `'use client'`, strict TS, and proper typed React event signatures.
- Preserved every inline style literal verbatim: grid template, `clamp()` responsive padding/font sizes, pressed-state ternaries (background, borderLeft, boxShadow, transform, chevron color/translateX), and the `dirStyles` color/glow token map.
- Wired the hash-anchor pattern: each row is an `<a href="#/{row.id}">`; left-click is `preventDefault()`'d and routed through optional `onNav?.(row.id)`; middle/right-click fall through to the browser so "open in new tab" + `hashchange` continue to work.
- Imported `Section` type from `@/app/lib/sections` (Plan 10-02 primitive) — Plan 10-06 HomePage will pass `SECTIONS` directly.
- `minHeight: 60` honored per plan (HOME-04 mobile tap target).

## Task Commits

1. **Task 1: Port Directory.jsx → app/components/Directory.tsx** — `29bbbd4` (feat)

**Plan metadata:** _committed below as a separate docs commit_

## Files Created/Modified

- `app/components/Directory.tsx` — Default `Directory({ rows, onNav })` + named `DirRow({ row, onNav })`. No other files touched (per plan scope boundary).

## Decisions Made

- **Inline styles, not CSS module** — plan explicitly mandates verbatim port of design-kit style objects; extraction would have created drift risk before Plan 10-08 visual smoke check.
- **Raw `<a>` over `next/link`** — `next/link` would intercept clicks and prefetch; the hash-routing strategy (CONTEXT.md + Plan 10-02 `useHashRoute`) depends on native anchor semantics for middle/right-click and `hashchange` firing on back/forward.
- **`onNav` is optional** — keeps the component testable and lets sandbox/preview pages render it without injecting a router. HomePage (10-06) always supplies it.

## Deviations from Plan

None — plan executed exactly as written. All seven grep verification gates pass; `bunx tsc --noEmit` produces zero errors mentioning `Directory.tsx`.

## Issues Encountered

None.

## User Setup Required

None.

## Next Phase Readiness

- Plan 10-06 (HomePage) can now `import Directory from '@/app/components/Directory'` and render `<Directory rows={SECTIONS} onNav={navigateTo} />`.
- Plan 10-08 will mount HomePage at `/` and provide the visual smoke verification.
- No blockers.

## Self-Check: PASSED

- `app/components/Directory.tsx` exists — FOUND
- Commit `29bbbd4` (Task 1) — FOUND in `git log`
- `bunx tsc --noEmit` — zero errors involving Directory.tsx
- All 7 grep verification gates returned `1`

---
*Phase: 10-directory-home-routing-shell*
*Completed: 2026-05-18*
