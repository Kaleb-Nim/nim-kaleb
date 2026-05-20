---
phase: 15-build-hackathon-page-with-hackathon-json-data-images-smart-u
plan: 01
subsystem: data
tags: [typescript, json-import, hackathons, data-loader, requirements]

requires:
  - phase: 10
    provides: SECTIONS array + Section type + hash-route directory
  - phase: 13
    provides: pattern of co-locating typed item arrays in app/lib/sections.ts (SYAI_ITEMS)
provides:
  - HackathonItem + HackathonTeamMember + HackStats type model
  - HACK_ITEMS sourced from .planning/research/hackathons/hackathons.json (22 projects, sorted most-recent-first)
  - HACK_STATS aggregator (total, wins, prizes) driving the hackathons Section count/title/footer
  - HACK-DATA-01..03, HACK-URL-01..02, HACK-UI-01..04 requirement IDs reserved for Phase 15 follow-on plans
affects: [phase-15 plan-02 (smart-routing utility), phase-15 plan-03 (HackathonsPage component), phase-15 plan-04 (chooser sub-route)]

tech-stack:
  added: []
  patterns:
    - "JSON-as-data-source: TypeScript imports JSON via resolveJsonModule, casts to typed array, layers helper stats on top"
    - "Data-derived Section fields: count/title/footer computed from HACK_STATS rather than hardcoded literals"

key-files:
  created:
    - app/lib/hackathons.ts
  modified:
    - app/lib/sections.ts
    - .planning/REQUIREMENTS.md

key-decisions:
  - "Source HACK_ITEMS from hackathons.json (zero-runtime-transform cast) instead of hand-curating per CONTEXT.md locked decision"
  - "Sort items by date_iso descending, with null-date_iso (beacons-only) entries appended at the end preserving JSON order"
  - "Type event_name as string | null to match JSON reality — some beacons-* entries have event_name: null (deviation from the plan's interface spec which had event_name: string)"
  - "CV reconciliation Case C: do NOT patch hackathons.json. CV's '4 winnings' (POLYFINTECH 2023, Hack&Roll 2024, Hack&Roll 2025, HackOmania 2026) only partially overlap JSON winners (ARcademy, Hack&Roll 2024, Hack&Roll 2025) — JSON winners list is canonical for the page; 2 CV wins (POLYFINTECH, HackOmania) are non-Devpost projects and out of scope for this dataset"
  - "Delete legacy HackItem type + 15-item HACK_ITEMS placeholder outright (per CONTEXT.md Claude's-discretion clause) rather than keeping as fallback — duplicate would invite drift"

patterns-established:
  - "JSON loader module pattern: dedicated app/lib/<domain>.ts file imports the source JSON, declares the typed interface, re-exports from sections.ts so callers can use either import path"
  - "HackStats summary pattern: aggregate counts computed once at module load, fed into Section literal so future JSON updates flow through automatically"

requirements-completed: [HACK-DATA-01, HACK-DATA-02, HACK-DATA-03]

duration: 6min
completed: 2026-05-20
---

# Phase 15 Plan 01: Hackathons Data Refresh Summary

**Replaced the 15-item hand-curated HACK_ITEMS placeholder with a JSON-backed `HackathonItem[]` loader (22 projects from hackathons.json) and reserved nine Phase-15 requirement IDs (HACK-DATA/URL/UI) in REQUIREMENTS.md.**

## Performance

- **Duration:** ~6 min
- **Started:** 2026-05-20T04:41:05Z
- **Completed:** 2026-05-20T04:47:12Z
- **Tasks:** 3
- **Files modified:** 3 (1 created, 2 modified)

## Accomplishments

- Built `app/lib/hackathons.ts` — typed loader that imports `.planning/research/hackathons/hackathons.json`, exports `HackathonItem` + `HackathonTeamMember` + `HackStats` + `HACK_ITEMS` (sorted most-recent-first) + `HACK_STATS` (total/wins/prizes aggregator).
- Refactored `app/lib/sections.ts`: deleted legacy `HackItem` type + 15-item placeholder array, re-exported new types/constants, switched `Section.items` union to `HackathonItem[]`, drove the hackathons Section `count`/`title`/`footer` from `HACK_STATS` so future JSON updates propagate automatically.
- Enumerated 9 Phase-15 requirements in REQUIREMENTS.md (HACK-DATA-01..03 + HACK-URL-01..02 + HACK-UI-01..04), added Phase 15 traceability row, bumped coverage 20 → 29.
- Documented CV-vs-JSON winner reconciliation (Case C: no JSON patch — see "CV Reconciliation" below).

## Task Commits

1. **Task 1: CV reconciliation** — no commit (no file change; reconciliation note staged at `/tmp/hack-cv-reconciliation.md` and folded into this SUMMARY below)
2. **Task 2: HackathonItem type + JSON loader + sections.ts refresh** — `20302e1` (feat)
3. **Task 3: REQUIREMENTS.md Phase 15 enumeration** — `c172206` (docs)

## Files Created/Modified

- `app/lib/hackathons.ts` (new) — typed loader for hackathons.json + HACK_ITEMS + HACK_STATS
- `app/lib/sections.ts` (modified) — legacy HackItem/HACK_ITEMS removed, re-exports + data-derived hackathons Section entry
- `.planning/REQUIREMENTS.md` (modified) — Phase 15 sub-block + traceability row + coverage 20 → 29

## CV Reconciliation

Source: `public/kaleb-cv.pdf` "Activities (Hackathons) 35+ Total".

**CV winnings (4 total):**

| # | Event | Year | Prize text (verbatim) |
|---|---|---|---|
| 1 | POLYFINTECH 100 API HACKATHON 2023 | Jul 2023 | Champion team $2500 |
| 2 | NUS HACK&ROLL 2024 | Jan 2024 | Best Pre-University Hack |
| 3 | NUS HACK&ROLL 2025 | Jan 2025 | Best Pre-University Hack |
| 4 | HackOmania 2026 | Mar 2026 | 1st place. $1000 + $2100 AI Credits |

**JSON winners (3 distinct projects, 4 prize-award strings):**

| Slug | Event | Year | Prizes |
|---|---|---|---|
| arcademy-at32jn | LearnHacks | Oct 2023 | "Winner — $50 Amazon Gift Card"; "Winner — 2nd Place – Excellence Award" |
| a-brilliant-cobra-duel | Hack&Roll 2024 | Jan 2024 | "Winner — Best Pre-University Hack" |
| art-ificial-failure | Hack&Roll 2025 | Jan 2025 | "Winner — Best Pre-University Hack" |

**Overlap:** Hack&Roll 2024 + Hack&Roll 2025 (matches JSON `a-brilliant-cobra-duel` and `art-ificial-failure`).

**Mismatch:**
- POLYFINTECH 100 (2023) → NOT in hackathons.json (not a Devpost project that was scraped)
- HackOmania 2026 → NOT in hackathons.json (not a Devpost project that was scraped, or post-dates scrape)
- ARcademy / LearnHacks 2023 → IN hackathons.json as winner, but NOT mentioned in CV

**Decision: Case C — no JSON patch.** Per plan rule "If the JSON does not contain the 4th-win project at all, DO NOT add a synthetic entry." The hackathons page (this phase) renders from the JSON and will reflect 3 winning projects with 4 prize-award strings total. The CV's "4 hackathon winnings" claim is reconciled as 4 *distinct winning hackathons across Kaleb's career*, of which 2 are absent from the Devpost-scraped dataset.

**Follow-up (out of scope for 15-01):** If a future phase wants to surface POLYFINTECH 2023 + HackOmania 2026 on the page, add them as first-class entries in hackathons.json with `sources: ["cv"]` — do NOT flip `is_winner` on an unrelated project.

## Decisions Made

See `key-decisions` in frontmatter for the full list. Most consequential:

1. **JSON cast over runtime parser** — match field names 1:1 between JSON and `HackathonItem` so the import is a zero-cost cast (no validation overhead, no transform code). The type system is the test.
2. **`event_name: string | null`** — deviation from plan's interface spec because beacons-* entries have null event_name; strict mode would fail otherwise (Rule 1 - bug fix).
3. **Case C reconciliation** — JSON is canonical for what the page renders; CV's broader winning history is documented but not synthesised into the dataset.
4. **Delete legacy placeholder outright** — chosen over "keep as fallback for build-time safety" per CONTEXT.md Claude's-discretion clause; keeping a stale duplicate would invite drift.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Typed `event_name` as `string | null` instead of `string`**
- **Found during:** Task 2 (HackathonItem type definition)
- **Issue:** Plan's `<json_to_type_map>` typed `event_name: string`, but the JSON contains `null` for 9 entries (aivy, a-unicorn-s-treasure, beacons-* projects). Strict mode would have failed.
- **Fix:** Widened to `string | null` in `HackathonItem` interface (and in this SUMMARY's spec). All downstream consumers handle `null` naturally — the Section type doesn't constrain item field shapes.
- **Files modified:** `app/lib/hackathons.ts`
- **Verification:** `bunx tsc --noEmit` exit 0; `bun run build` exit 0.
- **Committed in:** `20302e1` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug fix to match JSON reality)
**Impact on plan:** Type-level correctness fix only. No scope change, no follow-on plan impact (downstream phases that render `event_name` will need to handle the null branch — same handling required regardless of where the null shows up).

## Issues Encountered

- **`bun run lint` reports 28 errors / 452 warnings** — all pre-existing in unrelated files (research artefacts under `.planning/research/`, `app/components/MeetupImage.tsx`, `app/hooks/useRealtimeVoice.ts`, `scripts/`, `tts-server/`). Per scope-boundary rule, out of scope for this plan. `bunx tsc --noEmit` and `bun run build` both exit 0, which are the contract checks.
- **PDF extraction**: poppler is not installed; used Python + PyPDF2 (auto-installed via pip --quiet) to extract the CV. Reproducible via `python3 -m pip install PyPDF2 && python3 -c "..."`.

## User Setup Required

None — purely a data/type/docs refresh. No new env vars, no external services.

## Next Phase Readiness

- Plan 15-02 (smart URL routing utility — HACK-URL-01..02) can now import `HACK_ITEMS` + `HackathonItem` from `@/app/lib/hackathons` and build the URL classifier on top.
- Plan 15-03 (HackathonsPage component — HACK-UI-01..03) has a stable typed dataset to render.
- Plan 15-04 (chooser sub-route — HACK-UI-04) inherits the same data layer.
- **Blocker for any plan that wants to render `event_name`:** must handle the `null` branch (9 entries). Recommendation: fall back to `title` or `organizer` when event_name is null.

## Self-Check: PASSED

Files verified:
- `app/lib/hackathons.ts` — exists
- `app/lib/sections.ts` — modified (legacy HackItem removed; HackathonItem[] in union)
- `.planning/REQUIREMENTS.md` — Phase 15 sub-block + traceability row present

Commits verified:
- `20302e1` — feat(15-01): replace HACK_ITEMS placeholder with JSON-backed loader
- `c172206` — docs(15-01): enumerate HACK-DATA/URL/UI requirements + Phase 15 traceability

Contract checks:
- `bunx tsc --noEmit` → exit 0
- `bun run build` → exit 0 (compiled successfully)
- `jq` invariants on hackathons.json: count=22, projects=22, winners=3 ✓

---
*Phase: 15-build-hackathon-page-with-hackathon-json-data-images-smart-u*
*Completed: 2026-05-20*
