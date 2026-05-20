---
phase: 15-build-hackathon-page-with-hackathon-json-data-images-smart-u
plan: 02
subsystem: hackathons-routing
tags: [typescript, tdd, url-classifier, bun-test, hackathons]

requires:
  - phase: 15
    plan: 01
    provides: HackathonItem type from app/lib/hackathons.ts
provides:
  - classifyHackathonLinks(project) — pure URL classifier returning ordered/deduped [{label, href}]
  - hackathonLinkCount(project) — convenience helper for Plan 03's 0/1/2+ row-click branch
  - HackathonLink + HackathonLinkLabel types ('DEVPOST' | 'GITHUB' | 'LINKEDIN' | 'LIVE DEMO')
  - 12-case bun:test suite anchoring the classifier contract (HACK-URL-01)
affects: [phase-15 plan-03 (HackathonsPage row click), phase-15 plan-04 (chooser sub-route render)]

tech-stack:
  added:
    - "@types/bun (devDependency) — enables type-checking of bun:test imports under bunx tsc --noEmit"
  patterns:
    - "Pure utility module: zero React/DOM deps, safe for both server and client import"
    - "Canonical dedupe key: scheme + lowercased host + path-without-trailing-slash; query string discarded"
    - "Label-order stable sort via Array.prototype.sort (stable in modern engines incl. Bun)"
    - "Defensive URL parsing: malformed entries skipped silently, never throw"

key-files:
  created:
    - app/lib/hackathonLinks.ts
    - app/lib/hackathonLinks.test.ts
  modified:
    - package.json
    - bun.lock

key-decisions:
  - "Did NOT change package.json scripts.test (already wired to `bunx playwright test` for the project's existing e2e suite); bun's native test runner is invoked directly via `bun test <file>` and does not require a scripts entry"
  - "Added @types/bun devDep instead of suppressing the tsc error or excluding the test file from tsconfig — keeps the test under strict-mode coverage like all other source files"
  - "Sort by LABEL_ORDER.indexOf — O(n·k) for k=4 labels is fine for our scale (≤5 links per project); avoids a custom comparator table"

requirements-completed: [HACK-URL-01]

duration: 4min
completed: 2026-05-20
---

# Phase 15 Plan 02: URL Classifier Utility Summary

**Shipped a pure, deterministic URL classifier (`classifyHackathonLinks` + `hackathonLinkCount`) for the Phase 15 hackathons page smart-routing decision — TDD-built, zero React deps, 12 / 12 unit tests pass, and all 22 real `hackathons.json` projects classify to ≥1 link.**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-05-20T04:51:30Z
- **Completed:** 2026-05-20T04:55:30Z
- **Tasks:** 2 (RED + GREEN; no REFACTOR needed)
- **Files modified:** 4 (2 created, 2 modified)

## TDD Gate Compliance

- RED gate: `6d4f674` — `test(15-02): add failing tests for classifyHackathonLinks utility` (12 tests fail with `Cannot find module './hackathonLinks'`)
- GREEN gate: `d624cf7` — `feat(15-02): implement classifyHackathonLinks + hackathonLinkCount` (all 12 tests pass)
- REFACTOR gate: skipped — implementation is ~50 LOC, no smells.

## Accomplishments

- Built `app/lib/hackathonLinks.ts` — 70-LOC pure module exporting `HackathonLink`, `HackathonLinkLabel`, `classifyHackathonLinks`, `hackathonLinkCount`.
- Built `app/lib/hackathonLinks.test.ts` — 12 bun:test cases covering all `<classification_rules>` from the plan (host classification, canonical dedupe, stable ordering, null/empty/malformed edges, case-insensitive hostnames).
- Integration smoke against all 22 `hackathons.json` projects: every project yields ≥1 link; distribution is **18 single-link / 4 two-link / 0 three-link** projects (the 4 two-link projects are ARcademy, A Brilliant Cobra Duel, DR GO, and one additional `LIVE DEMO`-bearing entry — exactly matches the patterns the Plan 03 chooser will need to surface).
- Added `@types/bun` so the `bun:test` import type-checks cleanly under `bunx tsc --noEmit` (see Deviations below).

## Task Commits

1. **RED — failing tests** → `6d4f674` (test)
2. **GREEN — implementation + @types/bun** → `d624cf7` (feat)

## Files Created/Modified

- `app/lib/hackathonLinks.ts` (new) — pure URL classifier
- `app/lib/hackathonLinks.test.ts` (new) — bun:test suite (12 cases)
- `package.json` (modified) — added `@types/bun` devDep
- `bun.lock` (modified) — lockfile updated

## API Surface (locked)

```typescript
export type HackathonLinkLabel = 'DEVPOST' | 'GITHUB' | 'LINKEDIN' | 'LIVE DEMO';
export interface HackathonLink { label: HackathonLinkLabel; href: string }

export function classifyHackathonLinks(project: {
  project_url: string;
  extra_links: string[] | null | undefined;
}): HackathonLink[];

export function hackathonLinkCount(project: {
  project_url: string;
  extra_links: string[] | null | undefined;
}): number;
```

The parameter type is a structural `Pick<>`-style subset rather than the full `HackathonItem` — this keeps the classifier decoupled from `app/lib/hackathons.ts` and means Plan 03 can pass a `HackathonItem` directly (TypeScript structural typing accepts the wider type).

## Canonical Fixture Results

| Slug | Expected | Actual | ✓ |
|---|---|---|---|
| `foodr-ihad3c` | `[DEVPOST]`, count = 1 | `[DEVPOST]`, count = 1 | ✓ |
| `arcademy-at32jn` | `[DEVPOST, GITHUB]`, count = 2 | `[DEVPOST, GITHUB]`, count = 2 | ✓ |
| `a-brilliant-cobra-duel` | `[DEVPOST, LIVE DEMO]`, count = 2 | `[DEVPOST, LIVE DEMO]`, count = 2 | ✓ |
| `sofri-025` (dedupe ?ref_content) | `[DEVPOST]`, count = 1 | `[DEVPOST]`, count = 1 | ✓ |
| `dr-go-61fybu` | `[DEVPOST, LIVE DEMO]`, count = 2 | `[DEVPOST, LIVE DEMO]`, count = 2 | ✓ |

## Decisions Made

See `key-decisions` in frontmatter. Most consequential:

1. **Left `package.json` `scripts.test` untouched.** It points at `bunx playwright test` for the project's e2e suite. Bun's native test runner runs the new file directly via `bun test app/lib/hackathonLinks.test.ts` (it doesn't read the scripts block). Adding `"test": "bun test"` would have shadowed playwright — a regression for unrelated callers. Plan said the script change is "optional"; we opted out.
2. **Added `@types/bun` instead of excluding the test file.** Keeps strict-mode type coverage uniform across all source files (per existing tsconfig include glob `**/*.ts`).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added `@types/bun` devDependency to satisfy `bunx tsc --noEmit`**
- **Found during:** Verification (`bunx tsc --noEmit` after GREEN)
- **Issue:** Test file imports `from 'bun:test'`, which TypeScript can't resolve without `@types/bun`. Without it, `bunx tsc --noEmit` exits non-zero — a contract check this plan must satisfy.
- **Fix:** `bun add -d @types/bun` (resolved to `^1.3.14`). No tsconfig changes needed — Bun's types are auto-loaded via the package's `typesVersions` map.
- **Files modified:** `package.json`, `bun.lock`
- **Verification:** `bunx tsc --noEmit` exits 0; `bun run build` exits 0.
- **Committed in:** `d624cf7` (folded into GREEN commit — same logical change)

---

**Total deviations:** 1 auto-fixed (1 missing-toolchain-type blocker)
**Impact on plan:** None. Plan explicitly allows `package.json` modification (`files_modified` lists it). The `@types/bun` add is a smaller change than the `"test": "bun test"` script edit the plan suggested as optional.

## Issues Encountered

- **Pre-existing `_beacons-fetch.ts` Bun-global typing error remains** — out of scope per executor instructions; not touched.
- **`bun run lint`** — not re-run (per Plan 15-01 SUMMARY, lint is broken on unrelated files and not part of this plan's success criteria). `bunx tsc --noEmit` and `bun run build` both exit 0, satisfying the plan's contract checks.

## User Setup Required

None — purely a code/test/devDep addition. No new env vars, no external services, no migrations.

## Next Phase Readiness

- **Plan 15-03 (HackathonsPage)** can now import:
  ```ts
  import { classifyHackathonLinks, hackathonLinkCount, type HackathonLink } from '@/app/lib/hackathonLinks';
  ```
  Use `hackathonLinkCount(item)` for the 0 / 1 / 2+ row-click branch decision; use `classifyHackathonLinks(item)` to feed the chooser sub-page list.
- **Plan 15-04 (chooser sub-route)** inherits the same module; renders `classifyHackathonLinks(item).map(...)` as gold chips.
- **Distribution insight for Plan 03 UI design:** 18 / 22 projects (82%) hit the single-link redirect branch; 4 / 22 (18%) hit the chooser branch. No project hits the 0-link non-interactive branch (every project has at least a `project_url`). Plan 03 can deprioritise the 0-link visual treatment.

## Self-Check: PASSED

Files verified:
- `app/lib/hackathonLinks.ts` — FOUND
- `app/lib/hackathonLinks.test.ts` — FOUND

Commits verified:
- `6d4f674` — test(15-02): add failing tests for classifyHackathonLinks utility — FOUND
- `d624cf7` — feat(15-02): implement classifyHackathonLinks + hackathonLinkCount — FOUND

Contract checks:
- `bun test app/lib/hackathonLinks.test.ts` → 12 pass, 0 fail
- `bunx tsc --noEmit` → exit 0
- `bun run build` → exit 0 (compiled successfully)
- Integration smoke (22 / 22 projects classify with ≥1 link) → PASS

---
*Phase: 15-build-hackathon-page-with-hackathon-json-data-images-smart-u*
*Completed: 2026-05-20*
