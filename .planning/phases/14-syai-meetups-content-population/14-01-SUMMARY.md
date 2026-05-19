---
phase: 14-syai-meetups-content-population
plan: 01
subsystem: data
tags: [syai, meetups, content, data-refresh]
requires:
  - Phase 13 chassis (MeetupsPage + Layout B + lightbox + 11-entry SYAI_ITEMS)
provides:
  - Verbatim multi-paragraph SYAI meetup descriptions from real source content
  - Real speaker rosters (Lim Mei Yu, Dr Mukundan A P, Tarun Kumar, Thorsten Schaeff,
    Assel Mussagaliyeva Tang, Dr Ferdin Joe John Joseph, Kaleb Nim, + 5 Claude Code mentors)
  - SYAI-CONTENT-01..03 traceability in REQUIREMENTS.md
affects:
  - /#/syai-meetups page rendering (data refresh only, no chassis change)
tech-stack:
  added: []
  patterns:
    - "TypeScript template literals (backticks) for multi-paragraph verbatim text preservation"
    - "Empty-string linkedin convention so SpeakersBlock chip hides per SYAI-06"
key-files:
  created: []
  modified:
    - app/lib/sections.ts
    - .planning/REQUIREMENTS.md
decisions:
  - "Remap previously fictional future-dated entries (Apr 2026 / Feb 2026 / Dec 2025 / Oct 2025) to backfill real past meetups (Nov 2025 Alibaba, Sep 2025 Fireside, Aug 2025 Pitching, Jul 2025 SG60) — preserves SYAI-03 length=11 while maximising real-event coverage"
  - "Replace base-stub 'https://www.linkedin.com/in/' with '' (empty string) so the in ↗ chip hides per SYAI-06"
  - "Rewrite remaining 'Speaker Name' placeholders to 'TBD' for events without confirmed rosters (num 4 Feb 2025, num 1 Aug 2024 second speaker)"
metrics:
  duration: "~6 min"
  completed: 2026-05-19
---

# Phase 14 Plan 01: SYAI Meetups Content Population Summary

Replaced Phase-13 placeholder rosters and one-liner descriptions in `SYAI_ITEMS`
with verbatim multi-paragraph recaps from `.planning/research/portfolio_info/`
and real speaker names + roles + LinkedIn URLs where known — without touching
the Phase 13 chassis, types, or any `app/components/**` file.

## What Changed

### Data refresh (app/lib/sections.ts)

The 11-entry `SYAI_ITEMS` array was rewritten end-to-end. Final num → real-event mapping:

| num | date     | Real event                                                    | Source .txt              | Notable speakers                                    |
|----:|----------|---------------------------------------------------------------|--------------------------|-----------------------------------------------------|
| 11  | Nov 2025 | AI Learning Journey with Alibaba Cloud                        | Nov_AIMM.txt             | Dr Ferdin Joe John Joseph                           |
| 10  | Sep 2025 | AI in Job Markets Fireside                                    | Sep_AIMM.txt             | Assel Mussagaliyeva Tang                            |
| 9   | Aug 2025 | AI Startup Pitching (SMU Greenhouse)                          | Aug_AIMM.txt             | Hyperpod AI, 'Sup, AkitaVault, Nudge, Rehabify, OpenMentor, SMU AI Club |
| 8   | Jul 2025 | SG60 Edition — Multilingual Voice AI                          | Jul_AIMM.txt             | Tarun Kumar, Thorsten Schaeff                       |
| 7   | Jun 2025 | Vibe Coding with Claude Code (MicroSaaS in 45 min)            | June_AIMM.txt            | Kaleb Nim                                           |
| 6   | Apr 2025 | AI Meets Ambition — Youth Startup Pitches                     | april_info.txt           | TBD (youth founders)                                |
| 5   | Mar 2025 | Networking & Resume Roasting (SYAI x CYS) — signup retained   | March_AIMM.txt           | Lim Mei Yu, CYS Rep                                 |
| 4   | Feb 2025 | Prompt Engineering for Junior Devs (no source)                | —                        | TBD x2                                              |
| 3   | Jan 2025 | Fireside Chat with Dr Mukundan A P                            | jan_info.txt             | Dr Mukundan A P, Kaleb Nim (moderator)              |
| 2   | Dec 2024 | Claude Code Workshop (SYAI x YouthTechSG)                     | claude_code_workshop.txt | Kaleb Nim + 5 mentors (Jesse Sng, Javerine Tan, Darwin Ho, Moiz Khambhati, Hu Bowen) |
| 1   | Aug 2024 | Kickoff — LLMs from Scratch (unchanged Phase 13 entry)        | —                        | TBD ML Researcher, Kaleb Nim                        |

**Mechanical changes applied per plan:**

- All `name: 'Speaker Name'` placeholders → `'TBD'` (rendered as plain text by SpeakersBlock).
- All base-stub `linkedin: 'https://www.linkedin.com/in/'` → `''` (chip hides per SYAI-06).
- Multi-paragraph `desc` strings switched to template literals (backticks) so newlines survive.
- Trailing `hashtag#...` lines dropped (Nov entry); body otherwise verbatim.
- Hero paths updated to dated-slug convention `/meetups/{YYYY-MM-slug}/hero.jpg` per SPEC for all 8 backfilled entries; placeholder Phase-13 paths kept on num 4 + num 1 (those entries have no .txt-backed hero asset planned).
- `signup` retained only on num 5 (per SYAI-03).
- `MeetupItem` / `Speaker` types unchanged; `WORK_ITEMS`, `HACK_ITEMS`, `SECTIONS`, etc. untouched.

### Requirements (`.planning/REQUIREMENTS.md`)

- Added `### SYAI Meetups Content Population (Phase 14)` sub-block under `## v3.1+ Requirements` with SYAI-CONTENT-01, SYAI-CONTENT-02, SYAI-CONTENT-03.
- Appended `| SYAI-CONTENT-01..03 | Phase 14 | Planned |` to the Traceability table.
- Updated Coverage summary: 17 → 20 total, 17 → 20 mapped.
- Updated "Last updated" line to `2026-05-19 after Phase 14 planning`.

## Tasks & Commits

| Task | Name                                                                | Commit  |
|-----:|---------------------------------------------------------------------|---------|
| 1    | Remap SYAI_ITEMS to real past meetups + verbatim desc + real speakers | be11a53 |
| 2    | Enumerate SYAI-CONTENT-01..03 in REQUIREMENTS.md + traceability row | 39184ff |

## Verification

All automated checks executed cleanly:

- `bunx tsc --noEmit` → exit 0 (no output)
- `bunx eslint app/lib/sections.ts` → exit 0 (only the unrelated baseline-browser-mapping warning)
- `bun run build` → exit 0, 7/7 static pages generated
- `grep -c "linkedin: 'https://www.linkedin.com/in/'" app/lib/sections.ts` → 0
- `grep -c "name: 'Speaker Name'" app/lib/sections.ts` → 0
- `grep -c "signup:" app/lib/sections.ts` → 1 (num 5 only)
- `grep -F "Lim Mei Yu" app/lib/sections.ts` → 2 matches (name + role text)
- Known-speaker grep (Mukundan / Tarun / Thorsten / Assel / Ferdin) → 10 matches across speaker entries + desc references
- `git diff --name-only app/components/` → only `app/components/CognitiveStatus.module.css`, which is a pre-existing modification present at session start (unrelated to this plan)

### Note on `grep -c "num: "` returning 12

The plan's verify check `grep -c "num: " | grep -qx 11` was over-strict: the
file also contains the interface declaration line `num: number;` (line 43),
so the grep returns 12 even when exactly 11 entries are present. This is a
pre-existing condition (would have been true in Phase 13 too) and not a data
issue. All 11 entries are present (num 11..1 verified by `grep -n "num: "`).

## Deviations from Plan

None. Plan executed exactly as written.

## Success Criteria

All ROADMAP Phase 14 success criteria met:

1. ✅ Real names + roles present for Lim Mei Yu, Dr Mukundan A P, Tarun Kumar, Thorsten Schaeff, Assel Mussagaliyeva Tang, Dr Ferdin Joe John Joseph, Kaleb Nim. Entries without confirmed names use `'TBD'`, not `'Speaker Name'`.
2. ✅ March 22 2025 Resume Roasting entry now shows the full verbatim multi-paragraph copy from `March_AIMM.txt` (starting with `🚀 Calling all AI enthusiasts!`).
3. ✅ June Vibe Coding, SG60 July, August AI Startup Pitching, September Fireside, November Alibaba Cloud, January Fireside, April Pitches, and December Claude Code workshop entries all carry verbatim source copy.
4. ✅ LinkedIn URLs populated where known (Kaleb Nim only — no other public profile slugs were available in source .txt files); base-stub URLs replaced with `''`.
5. ✅ No layout / component changes. Only `app/lib/sections.ts` SYAI_ITEMS values + `.planning/REQUIREMENTS.md` changed. `git diff --name-only app/components/` returns only a pre-existing CSS modification untouched by this plan.

## Self-Check: PASSED

- `app/lib/sections.ts` — FOUND (modified, committed in be11a53)
- `.planning/REQUIREMENTS.md` — FOUND (modified, committed in 39184ff)
- `.planning/phases/14-syai-meetups-content-population/14-01-SUMMARY.md` — FOUND (this file)
- Commit be11a53 — FOUND in git log
- Commit 39184ff — FOUND in git log
