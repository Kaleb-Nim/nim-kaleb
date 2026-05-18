---
phase: 10-directory-home-routing-shell
plan: 02
subsystem: ui
tags: [next.js, react, typescript, hash-routing, data-model]

# Dependency graph
requires:
  - phase: 10-directory-home-routing-shell
    provides: "v3 design kit (LINKS, SECTIONS, item arrays) + useHashRoute reference"
provides:
  - Typed `LINKS` + `SECTIONS` modules (6 sections, id === path slug)
  - `WORK_ITEMS`, `SYAI_ITEMS`, `HACK_ITEMS`, `SIDE_ITEMS`, `HOBBIES_ITEMS`, `LINK_ITEMS` data arrays
  - `Section`, `Link`, `WorkItem`, `MeetupItem`, `HackItem`, `SideItem`, `HobbyItem`, `LinkPageItem`, `ItemLink` types
  - `useHashRoute()` SSR-safe client hook
  - `navigateTo(routeId)` imperative navigation helper
affects: [10-03, 10-04, 10-05, 10-06, 10-07, 10-08, 11-work-experience]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Pure TS data modules under app/lib/ (no React imports)"
    - "SSR-safe hooks: typeof window guard + lazy initial state via useEffect"
    - "Hash-route slug == Section.id == Section.path (v3.0 convention)"

key-files:
  created:
    - app/lib/sections.ts
    - app/hooks/useHashRoute.ts
  modified: []

key-decisions:
  - "Section.id MUST equal Section.path (so #/work-experience routes, not #/work) per CONTEXT.md"
  - "useHashRoute initial state is '' on server; first useEffect syncs from window.location.hash to avoid React 19 hydration mismatch"
  - "Use scrollTo behavior 'auto' (not 'instant') — Next 16 lib.dom.d.ts still flags 'instant' as invalid"

patterns-established:
  - "Pure-TS data layer (app/lib/) — importable from both client and server components"
  - "Named-only exports for hooks (matches existing useTerminalState pattern)"

requirements-completed: [ROUTE-02]

# Metrics
duration: 3min
completed: 2026-05-18
---

# Phase 10 Plan 02: Sections Data + Hash Route Primitives Summary

**Typed `LINKS`/`SECTIONS` data module (6 sections, id===path) plus SSR-safe `useHashRoute` + `navigateTo` client hook — foundation every Wave 2/3/4 plan in Phase 10 consumes.**

## Performance

- **Duration:** 3 min
- **Started:** 2026-05-18T05:52:49Z
- **Completed:** 2026-05-18T05:55:15Z
- **Tasks:** 2
- **Files modified:** 2 (both new)

## Accomplishments

- Ported `LINKS` (5 entries) + `SECTIONS` (6 entries) + all six item arrays from the v3 design kit JSX prototype to strict TypeScript (`app/lib/sections.ts`, 303 lines).
- Applied the locked CONTEXT.md decision: every `Section.id` equals its `path` value (so `#/work-experience` routes, not `#/work`).
- Defined typed interfaces (`Section`, `Link`, `WorkItem`, `MeetupItem`, `HackItem`, `SideItem`, `HobbyItem`, `LinkPageItem`, `ItemLink`) so downstream components get full IntelliSense / strict-mode safety.
- Built `useHashRoute()` + `navigateTo()` (`app/hooks/useHashRoute.ts`) with SSR guards, hashchange listener registration + cleanup, and scroll-to-top on every route change.

## Task Commits

1. **Task 1: Create app/lib/sections.ts** — `00efe83` (feat)
2. **Task 2: Create app/hooks/useHashRoute.ts** — `333cf64` (feat)

**Plan metadata:** _committed below as a separate docs commit_

## Files Created/Modified

- `app/lib/sections.ts` — Typed `LINKS`, `SECTIONS`, six item arrays, and 9 interfaces. No React, no `window.X` mutations, no default export.
- `app/hooks/useHashRoute.ts` — `'use client'` hook returning first hash segment after `#/`. SSR-safe; cleans up its `hashchange` listener.

## Decisions Made

- **`Section.id === Section.path`** — locked in CONTEXT.md before planning. Source-of-truth `id` values (`'work'`, `'meetups'`) were intentionally replaced with their `path` counterparts (`'work-experience'`, `'syai-meetups'`) so the upcoming Plan 10-08 route dispatch can use a single field for matching, breadcrumbs, and URL display.
- **`scrollTo({ behavior: 'auto' })`** — `'instant'` is still missing from Next 16's bundled `lib.dom.d.ts`. `'auto'` produces the same UX (synchronous jump) and compiles cleanly under strict TS.
- **Initial route state `''`** — keeps SSR markup and first client paint in agreement (Next.js can't see the URL fragment server-side anyway); the first `useEffect` sync handles the hash-present case without a hydration mismatch.

## Deviations from Plan

None — plan executed exactly as written. Both `bunx tsc --noEmit` and the grep-based verification gates pass for the two new files. (Project-wide `bun run lint` reports pre-existing errors in `ws-server/src/*` that are out of scope for this plan.)

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Plan 10-03 (Directory + DirRow components), Plan 10-04 (HomePage), Plans 10-05/06 (stub/404 pages), and Plan 10-08 (route dispatch in `app/page.tsx`) can now `import { SECTIONS, LINKS, navigateTo, useHashRoute } from '@/app/lib/sections'` / `'@/app/hooks/useHashRoute'`.
- No blockers.

## Self-Check: PASSED

- `app/lib/sections.ts` exists — FOUND
- `app/hooks/useHashRoute.ts` exists — FOUND
- Commit `00efe83` (Task 1) — FOUND in `git log`
- Commit `333cf64` (Task 2) — FOUND in `git log`
- `bunx tsc --noEmit` — no errors involving the two new files

---
*Phase: 10-directory-home-routing-shell*
*Completed: 2026-05-18*
