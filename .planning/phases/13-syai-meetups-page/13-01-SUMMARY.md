---
phase: 13-syai-meetups-page
plan: 01
subsystem: data-layer
tags: [react, nextjs, typescript, terminal-ui, syai-meetups, data, requirements]
requires:
  - .planning/phases/13-syai-meetups-page/13-SPEC.md
  - .planning/research/v3-design-kit/index-data-v2.jsx
  - .planning/todos/pending/syai-meetups-page-from-design-kit.md
provides:
  - "MeetupItem type with num/desc/speakers/hero/gallery/signup fields"
  - "Speaker type (name/role/linkedin)"
  - "SYAI_ITEMS array (11 real entries, most-recent first)"
  - "SYAI-01..09 canonical requirement IDs"
affects:
  - app/lib/sections.ts
  - .planning/REQUIREMENTS.md
tech-stack:
  added: []
  patterns: ["typed data layer port", "placeholder-null hero/gallery convention"]
key-files:
  created: []
  modified:
    - app/lib/sections.ts
    - .planning/REQUIREMENTS.md
decisions:
  - "hero + gallery split (instead of single images[] array) so MeetupsPage component doesn't repeatedly destructure images[0] / images.slice(1)"
  - "null entries in gallery represent missing assets — render via [no media] placeholder per Plan 02"
  - "speakers entries seeded with placeholder names (except Lim Mei Yu, Kaleb Nim) — real speaker data deferred to Phase 14 content-population pass"
  - "short one-line desc strings used; verbatim long-form copy deferred to Phase 14"
metrics:
  duration_minutes: 2
  completed_date: 2026-05-19
  tasks_completed: 2
  files_modified: 2
---

# Phase 13 Plan 01: SYAI Meetups Data Layer Summary

Extended `MeetupItem` (added `num`, `desc`, `speakers`, `hero`, `gallery`, optional `signup`) plus new `Speaker` type, replaced placeholder `SYAI_ITEMS` with 11 real meetups (most-recent first) including the March 22 2025 SYAI x CYS Resume Roasting entry with Lim Mei Yu and the verbatim `forms.gle/FpKePiMijNLDtudV6` sign-up URL, and canonicalised SYAI-01..09 in REQUIREMENTS.md.

## Types Exported from sections.ts

```typescript
export interface Speaker {
  name: string;
  role: string;
  linkedin: string;
}

export interface MeetupItem {
  num: number;                          // 1..11 — drives [#NN] gold chip
  date: string;                         // 'Mar 2025', 'Apr 2026'
  title: string;                        // topic only
  desc: string;                         // 1-3 sentence description
  speakers: Speaker[];                  // >= 1
  hero: string | null;                  // '/meetups/<slug>-hero.jpg' or null
  gallery: Array<string | null>;        // remaining photos; null entries placeholder
  signup?: string;                      // external sign-up URL (March 2025 only)
}
```

Plan 02 can `import type { MeetupItem, Speaker } from '@/app/lib/sections'`.

## All 11 SYAI_ITEMS Entries (num | title | slug stem)

| num | date | title | slug stem |
|----:|------|-------|-----------|
| 11 | Apr 2026 | Agentic Workflows in Production | agentic-workflows |
| 10 | Feb 2026 | Eval Harnesses for LLM Apps | eval-harnesses |
| 9  | Dec 2025 | Voice Agents End-to-End | voice-agents |
| 8  | Oct 2025 | Multimodal Models in the Wild | multimodal |
| 7  | Aug 2025 | RAG: What Actually Ships | rag-ships |
| 6  | Jun 2025 | Fine-tuning vs Prompting | finetune-vs-prompt |
| 5  | Mar 2025 | Networking & Resume Roasting (SYAI x CYS) | resume-roasting-2025 |
| 4  | Feb 2025 | Prompt Engineering for Junior Devs | prompt-eng-juniors |
| 3  | Dec 2024 | Building Your First Agent | first-agent-workshop |
| 2  | Oct 2024 | Vector DBs Explained | vector-dbs |
| 1  | Aug 2024 | Kickoff — LLMs from Scratch | llms-from-scratch |

Entry #5 (March 2025) carries `signup: 'https://forms.gle/FpKePiMijNLDtudV6'` and speaker `Lim Mei Yu` — only entry with a sign-up URL.

## /meetups/* Asset Paths Referenced

11 hero paths referenced in SYAI_ITEMS. Gallery entries are all `null` placeholders in this plan (assets land in `public/meetups/` in Plan 03 if/when available).

Hero paths needing assets in `public/meetups/`:

- `/meetups/agentic-workflows-hero.jpg`
- `/meetups/eval-harnesses-hero.jpg`
- `/meetups/voice-agents-hero.jpg`
- `/meetups/multimodal-hero.jpg`
- `/meetups/rag-ships-hero.jpg`
- `/meetups/finetune-vs-prompt-hero.jpg`
- `/meetups/resume-roasting-2025-hero.jpg`
- `/meetups/prompt-eng-juniors-hero.jpg`
- `/meetups/first-agent-workshop-hero.jpg`
- `/meetups/vector-dbs-hero.jpg`
- `/meetups/llms-from-scratch-hero.jpg`

Total gallery `null` slots across all entries: 31. Plan 03's checklist can either (a) leave them all `null` (placeholders render via `[ no media ]`), or (b) populate real gallery paths once assets land.

## Requirements Canonicalised in REQUIREMENTS.md

- SYAI-01: `#/syai-meetups` renders real MeetupsPage (other routes unchanged)
- SYAI-02: MeetupItem + Speaker type shape
- SYAI-03: 11 real SYAI_ITEMS, March 2025 Resume Roasting + Lim Mei Yu + sign-up URL
- SYAI-04: Layout B card (hero L, desc R, speakers + gallery below) with `[ no media ]` placeholder
- SYAI-05: Lightbox with Esc / backdrop close + arrow-key navigation
- SYAI-06: Speakers block per meetup
- SYAI-07: Assets under `public/meetups/` — HTTP 200 when present
- SYAI-08: Responsive (360px / 1024px+), build clean, no Tweaks panel / filters / signup CTA
- SYAI-09: No regression to other routes / mic / overlay

Traceability row appended: `| SYAI-01..09 | Phase 13 | Planned |`. Obsolete `MEET-01` placeholder removed.

## Deviations from Plan

None — plan executed exactly as written. All verification commands passed:

- `bunx tsc --noEmit` exits 0
- `bunx eslint app/lib/sections.ts` exits 0 (no warnings related to changes)
- `grep -c "num: [0-9]" app/lib/sections.ts` returns 11
- `grep -c "/meetups/" app/lib/sections.ts` returns 11
- `grep -c "SYAI-0[1-9]" .planning/REQUIREMENTS.md` returns 10 (one per requirement + traceability row)
- `grep -c "HACK-01\|SIDE-01\|HOB-01\|LINK-01" .planning/REQUIREMENTS.md` returns 4 (other v3.1 placeholders intact)
- syai-meetups section count: 11 (unchanged)
- No old `title: 'Meetup #` placeholder rows remain

## Known Stubs / Deferred

Per `<scope_deferred>` block in PLAN, the following are intentionally placeholder and deferred to a follow-up phase (likely Phase 14):

- **Speaker rosters**: Most entries use `'Speaker Name'` placeholders for `name` and generic role strings; LinkedIn URLs are all the base `https://www.linkedin.com/in/` (no profile slug). Only Lim Mei Yu (March 2025) and Kaleb Nim (#1 inaugural) have real names. Phase 14 will replace placeholders with real speaker data.
- **Long-form descriptions**: `desc` strings are short (~1-3 sentences). Verbatim multi-paragraph event recaps from `.planning/research/portfolio_info/*.txt` (full Resume Roasting writeup, SG60 multilingual AI recap, August startup-pitch list) are deferred to Phase 14.
- **Gallery assets**: All `gallery` arrays are `[null, null, ...]` — placeholder slots only. Real `/meetups/*` image files land in Plan 03 / Phase 14 depending on asset availability.

These stubs do NOT prevent the plan goal (typed contract + 11 real entries for Plan 02 to render). The MeetupsPage chassis renders the `[ no media ]` placeholder cleanly for null slots.

## Commits

- `3fb6477` feat(13-01): extend MeetupItem type and replace SYAI_ITEMS with 11 real entries
- `f6a1f64` docs(13-01): canonicalize SYAI-01..09 requirements for Phase 13

## Self-Check: PASSED

- FOUND: app/lib/sections.ts (modified)
- FOUND: .planning/REQUIREMENTS.md (modified)
- FOUND commit: 3fb6477
- FOUND commit: f6a1f64
