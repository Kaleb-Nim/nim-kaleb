---
id: 260519-s01
slug: classify-github-repos
status: complete
created: 2026-05-19
completed: 2026-05-19
---

# Classify 101 GitHub repos — Summary

## Outcome

Scraped metadata for all 101 repos on `Kaleb-Nim/*`, classified each into 8
categories, and produced merge-ready hackathon entries for
`.planning/research/hackathons/hackathons.json`.

## Category breakdown

| Category            | Count | Notes |
|---------------------|------:|-------|
| archive-candidate   | 21 | Empty, ≤5KB, playgrounds, test repos — safe to delete |
| fork-or-clone       | 21 | Forks of others' work — keep only if actively used |
| work-or-collab      | 21 | Work / internship / org-affiliated (ARTC, Mirxes, AES, etc.) — keep private |
| learning            | 16 | School coursework, course modules, learning logs |
| **hackathon**       | **11** | **5 already represented in hackathons.json, 6 new candidates** |
| portfolio-infra     |  4 | `nim-kaleb`, `nim-clone`, `CV`, `Front_end_Personal_website` |
| other               |  4 | Unclassified — `Discord-convo-extractor`, `form-versation-vh`, `poker`, `sound-cents` |
| side-project        |  3 | `syai-claude-workshop`, `video-production`, `voice-assistant` |
| **Total**           |**101**| |

## Hackathon repos (the focus)

### 6 NEW candidates → merge into `hackathons.json`

Stub entries ready in `hackathon-candidates-enriched.json`. Schema matches
existing entries.

| Repo | Event | Status | Source quality |
|------|-------|--------|----------------|
| `jtac-trainer` | AIE Open Canvas Hackathon | submission | Rich README ✓ |
| `hackomania_contextguard` | HackOMania 2026 | **Winner 🏆** | Rich README ✓ |
| `SingLife-Polyfintech2023` | PolyFinTech Hackathon 2023 | submission | Decent README ✓ |
| `st_llms_arena` | Streamlit LLMs Hackathon Sep 2023 | submission | Light README (forked starter) |
| `ntuHackathon2023` | NTU Hackathon 2023 | unknown | **No README — needs manual lookup** |
| `lifehack2023` | LifeHack 2023 | unknown | **Empty repo — likely delete** |

### 5 repos that link into EXISTING devpost entries

| Repo | Merges into | Action |
|------|-------------|--------|
| `art-tificial-failure-hackandroll` | `art-ificial-failure` | append to `extra_links` |
| `Art-ificialFailure-backend` | `art-ificial-failure` | append to `extra_links` |
| `art-ificialfailure-hackroll-beta` | `art-ificial-failure` | append to `extra_links` |
| `foodr-smu-dot-hack` | `foodr-ihad3c` | **VERIFY first** — could be a separate 2025 SMU .Hack entry |
| `smu-hack-food-tinder` | `foodr-ihad3c` | **VERIFY first** — could be a separate 2025 SMU .Hack entry |

> Note: 22 existing devpost entries cover Beacons-only projects (no public repo)
> and the 2 main repo-backed ones above. The 6 new candidates are entirely
> additive — they don't overlap with anything currently in `hackathons.json`.

## Archive-candidate list (21)

Safe-to-delete on GitHub if you want to shrink the org:

```
Back-End-Dev-Project, CA1-2B02-2100829-Kaleb, DevOps-Lab4,
Handwritten-Charater-Recognition, Kaleb-Nim (profile readme repo — KEEP),
LDR, MirXes-Dataprocessing, SUTD-RAD_neRF, SUTD_RAD-neRF, UFA-sim,
aes-bot, customized_chatGPT, devopsdaaa_-ca2-daaa2b02-p2100829-kaleb,
discord-testing, form-versation, nextjs-boilerplate,
playing-with-excalidraw, qwenimage, test_html, web-annotator, webScraping
```

**Exception:** `Kaleb-Nim` is your profile README repo — keep that one. Auto-flagged
as ≤5KB but it's intentional.

## Files in this task

- `repos-raw.json` — raw `gh repo list` dump (all 101 with full metadata)
- `repos-classified.json` — every repo with category, confidence, reason
- `hackathon-candidates.json` — auto-generated stubs from classifier
- **`hackathon-candidates-enriched.json`** ← merge source for `hackathons.json`
- `readmes/*.md` — fetched READMEs for the 6 new candidates
- `classify.py` — the classifier script (re-runnable)

## Suggested next steps

1. Verify the `ntuHackathon2023` repo manually — fetch project name/team from elsewhere.
2. Verify SMU .Hack vs .HACKathon — decide whether `foodr-smu-dot-hack` is a separate entry.
3. Merge `hackathon-candidates-enriched.json` `new_candidates[]` into `hackathons.json` (preserve schema, regenerate `count`).
4. Optional: bulk-archive or delete the 21 archive-candidate repos.
