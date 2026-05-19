---
id: 260519-s01
slug: classify-github-repos
status: in-progress
created: 2026-05-19
---

# Classify 101 GitHub repos and extract hackathon candidates

## Goal
Scrape metadata for all 101 repos under `Kaleb-Nim`, classify them, and produce
a merge-ready list of hackathon candidates that aren't yet in
`.planning/research/hackathons/hackathons.json` (currently 22 devpost-sourced
projects).

## Categories
- `hackathon` — built for a hackathon/competition
- `side-project` — personal side projects / experiments shipped seriously
- `learning` — tutorials, courses, study material, sandbox repos
- `fork-or-clone` — forks or clones of someone else's work
- `work-or-collab` — internship / job / org-affiliated work
- `archive-candidate` — abandoned, empty, README-only, or otherwise prune-worthy
- `portfolio-infra` — the portfolio site itself + supporting infra
- `other` — anything that doesn't fit

## Heuristics for `hackathon`
- repo name matches known hackathon slugs (Beacons-*, foodr*, arcademy*, etc.)
- description / topics mention: `hackathon`, `devpost`, event name
- created within a short burst (< 5 days commit range) by multiple collaborators
- README references prizes / event / submission
- author is part of a team of 2+ (collaborators)

## Outputs (in this dir)
- `repos-raw.json` — raw `gh repo list` dump
- `repos-classified.json` — every repo with `category`, `confidence`, `reason`
- `hackathon-candidates.json` — merge-ready entries (existing schema)
- `SUMMARY.md` — final report
