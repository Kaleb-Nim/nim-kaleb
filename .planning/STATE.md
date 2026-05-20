---
gsd_state_version: 1.0
milestone: v3.0
milestone_name: Directory Home & Work Experience
status: executing
stopped_at: Completed 15-01-PLAN.md (hackathons data layer + Phase 15 requirements enumerated)
last_updated: "2026-05-20T04:47:12Z"
last_activity: 2026-05-20 -- Phase 15 Plan 01 complete
progress:
  total_phases: 6
  completed_phases: 5
  total_plans: 20
  completed_plans: 17
  percent: 85
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-18)

**Core value:** Visitors can have a natural, human-sounding voice conversation with an AI clone of Kaleb that authentically represents his experience and personality.
**Current focus:** Phase 15 — build-hackathon-page-with-hackathon-json-data-images-smart-u

## Current Position

Phase: 15 (build-hackathon-page-with-hackathon-json-data-images-smart-u) — EXECUTING
Plan: 2 of 4 (15-01 complete; ready for 15-02 URL classifier)
Status: Executing Phase 15
Last activity: 2026-05-20 -- Phase 15 Plan 01 complete (hackathons data + requirements)

Progress: [████████▌─] 85%

## Performance Metrics

**Velocity:**

- Total plans completed: 8 (v3.0 milestone)
- Average duration: —
- Total execution time: —

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 10 | 8 | - | - |

**Recent Trend:** No data yet
| Phase 10 P02 | 3min | 2 tasks | 2 files |
| Phase 10 P03 | 1min | 1 tasks | 1 files |
| Phase 10 P04 | 5min | 2 tasks | 2 files |
| Phase 10 P05 | 4min | 3 tasks | 3 files |
| Phase 10 P07 | 10min | 2 tasks | 2 files |
| Phase 10 P08 | 15min | 2 tasks | 3 files |
| Phase 13 P01 | 2min | 2 tasks tasks | 2 files files |
| Phase 13 P02 | 3min | 3 tasks | 6 files |
| Phase 13 P03 | 1min | 2 tasks | 2 files |
| Phase 14 P01 | 6min | 2 tasks | 2 files |
| Phase 15 P01 | 6min | 3 tasks | 3 files |

## Accumulated Context

### Roadmap Evolution

- Phase 12 added: Create dev branch for live preview environment separate from production kalebnim.dev
- Phase 15 added: Build hackathon page with hackathon.json data, images, smart URL routing, and prize money display for winning hackathons

### Decisions (carried)

- [v2.0]: All video deliverables (script, storyboard, visuals) live in nim-kaleb repo
- [v1.0]: Keep terminal aesthetic — phosphor green + gold + monospace remains canonical

### Decisions (v3.0)

- [v3.0]: Adopt Kebab Neural Interface design kit (Anthropic design `pz0qDtAzozp6fFUWVhYlTg`) as new home UX
- [v3.0]: Voice clone becomes a floating overlay ("● talk to me") instead of being gated behind a `1 ⏎` boot sequence — voice still ships, just demoted from hero
- [v3.0]: Hash router (`#/`, `#/work-experience`) over Next.js App Router routes — keeps the single-page terminal illusion intact
- [v3.0]: This milestone only ships home + work-experience pages; meetups / hackathons / sidequests / hobbies / links stay stubbed (UI being finalised)
- [Phase 15 P01]: Source HACK_ITEMS from `.planning/research/hackathons/hackathons.json` (22 projects) as a zero-cost cast; drive hackathons Section count/title/footer from HACK_STATS aggregator
- [Phase 15 P01]: CV-vs-JSON winner reconciliation = Case C (no JSON patch). CV's 4 wins (POLYFINTECH 2023, Hack&Roll 2024, Hack&Roll 2025, HackOmania 2026) only partially overlap JSON's 3 winners (ARcademy, Hack&Roll 2024, Hack&Roll 2025); 2 CV wins are non-Devpost and out of scope for this dataset

### Pending Todos

None.

### Blockers/Concerns

None at milestone start.

### Quick Tasks Completed

| # | Description | Date | Commit | Status | Directory |
|---|-------------|------|--------|--------|-----------|
| 260415-h6s | Add domain routing for kalebnim.dev | 2026-04-15 | 56bcec2 | Done | [260415-h6s](./quick/260415-h6s-add-domain-routing-for-kalebnim-dev/) |
| 260415-l3w | Add links to terminal page (LinkedIn, GitHub, email, CV) | 2026-04-15 | fd793de | Verified | [260415-l3w](./quick/260415-l3w-add-important-links-to-terminal-page-lin/) |
| 260415-mot | Fix mobile Connect button permission error | 2026-04-15 | a13b8d0 | Needs Review | [260415-mot-fix-mobile-connect-button-permission-err](./quick/260415-mot-fix-mobile-connect-button-permission-err/) |
| 260421-l3f | Web analytics (Vercel Analytics + Neon transcripts) | 2026-04-21 | 4f0cdf4 | Needs Review | [260421-l3f](./quick/260421-l3f-create-web-analytics-i-want-to-view-numb/) |
| 260502-r2r | Mobile-first link affordance | 2026-05-02 | d9c873a | Needs Review | [260502-r2r](./quick/260502-r2r-mobile-first-link-affordance-persistent-/) |
| 260519-re1 | Scrape Devpost → hackathons staging JSON + thumbnails | 2026-05-19 | 0f66a70 | Done | [260519-re1](./quick/260519-re1-scrape-devpost-com-kaleb-nim-for-hackath/) |
| 260519-s01 | Classify 101 GitHub repos + extract 6 new hackathon candidates | 2026-05-19 | 94cf3e5 | Done | [260519-s01](./quick/260519-s01-classify-github-repos/) |

## Session Continuity

Last session: 2026-05-20T04:47:12Z
Stopped at: Completed 15-01-PLAN.md (Phase 15 data layer + requirements enumerated)
Resume file: None
