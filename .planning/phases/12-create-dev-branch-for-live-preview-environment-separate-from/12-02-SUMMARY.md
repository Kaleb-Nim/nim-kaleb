---
phase: 12-create-dev-branch-for-live-preview-environment-separate-from
plan: 02
subsystem: docs
tags: [docs, readme, deployment, branching]
requirements_completed: [DEV-04]
dependency-graph:
  requires:
    - "Plan 12-01 captured PREVIEW_URL in 12-01-SUMMARY.md"
  provides:
    - "README section documenting three-tier branching/deploy model"
    - "Embedded stable dev preview URL discoverable from project root"
  affects:
    - "README.md"
tech-stack:
  added: []
  patterns:
    - "Markdown table mapping git branches to Vercel deploy targets"
key-files:
  created:
    - ".planning/phases/12-create-dev-branch-for-live-preview-environment-separate-from/12-02-SUMMARY.md"
  modified:
    - "README.md (lines 131-149, new ## Branching & deployment section)"
decisions:
  - "Inserted new section between Services table and Tech stack — keeps deploy-topology and env-var sections flowing in operational order"
  - "Used Markdown table with 4 columns (Branch | Deploys to | URL | Notes) per plan template"
  - "Linked anchor [Environment variables](#environment-variables) so reader can jump from branching context to env scope details"
metrics:
  duration: "~3 minutes"
  tasks_completed: 1
  files_changed: 1
  completed: "2026-05-19"
---

# Phase 12 Plan 02: README Branching & Deployment Section Summary

**One-liner:** Documented the three-tier git workflow (main → production, dev → stable preview, feat/* → ephemeral PR previews) in README.md with the captured Plan 12-01 preview URL embedded.

PREVIEW_URL: nim-kaleb-git-dev-kaleb-nims-projects.vercel.app

## What Was Built

1. **New `## Branching & deployment` section in `README.md`** (Task 1)
   - Inserted between the `## Services` table and the `## Tech stack` section
   - Contains:
     - Short prose intro describing the three-tier model
     - 4-column Markdown table: Branch | Deploys to | URL | Notes
     - Rows for `main` (production), `dev` (stable preview), and `feat/*`/`fix/*` (ephemeral PR previews)
     - "Working flow" bulleted list summarizing when to use each tier
     - Forward-reference link to the existing `Environment variables` section explaining per-scope env separation
   - PREVIEW_URL `nim-kaleb-git-dev-kaleb-nims-projects.vercel.app` (extracted via `grep '^PREVIEW_URL:' 12-01-SUMMARY.md`) embedded as `https://nim-kaleb-git-dev-kaleb-nims-projects.vercel.app` in the `dev` row.

## Commits

- `96130c7` — docs(12-02): document three-tier branching & deployment in README

## Acceptance Criteria Verification

- `grep -c "^## Branching & deployment$" README.md` → **1** ✓
- `grep -c "| \`main\`" README.md` → **1** ✓
- `grep -c "| \`dev\`" README.md` → **1** ✓
- `grep "feat/\*\|feature branch\|PR preview" README.md` → **3 matches** ✓
- PREVIEW_URL appears in README.md → **1 occurrence** ✓
- `grep -c "kalebnim.dev" README.md` → **5** (≥ 2) ✓
- `git diff README.md` → **19 insertions, 0 deletions** — only additions ✓
- Markdown table has consistent 4 cells per row ✓

## Deviations from Plan

None — plan executed exactly as written. The plan template was substituted with the extracted PREVIEW_URL and inserted verbatim at the specified location.

## Authentication Gates

None.

## Self-Check: PASSED

- FOUND: `.planning/phases/12-create-dev-branch-for-live-preview-environment-separate-from/12-02-SUMMARY.md`
- FOUND: commit `96130c7` in `git log` (README docs commit)
- FOUND: README.md contains `## Branching & deployment` header
- FOUND: README.md contains `nim-kaleb-git-dev-kaleb-nims-projects.vercel.app`
- FOUND: README.md contains rows for `main`, `dev`, and `feat/*` branches
- VERIFIED: `git diff` on README shows only additions, no deletions of existing content
