---
phase: 12-create-dev-branch-for-live-preview-environment-separate-from
plan: 01
subsystem: devops
tags: [devops, vercel, deployment, preview-environment, dev-branch]
requirements_completed: [DEV-01, DEV-02, DEV-03]
dependency-graph:
  requires: []
  provides:
    - "Long-lived `dev` branch on origin"
    - "Stable Vercel Preview alias for in-progress work"
    - "Vercel Preview env scope mirroring production runtime vars"
  affects:
    - ".git/refs/remotes/origin/dev"
    - "Vercel project env scope (Preview)"
tech-stack:
  added: []
  patterns:
    - "Vercel git-branch alias for stable preview URL (no SHA-pinning)"
    - "Per-scope env mirroring via `bunx vercel env pull` + `bunx vercel env add`"
key-files:
  created:
    - ".planning/phases/12-create-dev-branch-for-live-preview-environment-separate-from/12-01-SUMMARY.md"
    - ".planning/phases/12-create-dev-branch-for-live-preview-environment-separate-from/deferred-items.md"
  modified: []
decisions:
  - "Reused existing Vercel Preview env entries (all 3 target vars already present, mirrored 28 days ago) rather than re-adding"
  - "Captured stable git-branch alias URL `nim-kaleb-git-dev-kaleb-nims-projects.vercel.app` for downstream README"
  - "Treated OpenAI Realtime Beta deprecation (400 on /api/realtime/session) as out-of-scope deferred item — pre-existing, affects production identically"
metrics:
  duration: "~10 minutes (Tasks 2 + 3 only; Task 1 completed in prior run; Task 4 human-verify approved)"
  tasks_completed: 4
  files_changed: 2
  completed: "2026-05-19"
---

# Phase 12 Plan 01: Create Dev Branch for Live Preview Environment Summary

**One-liner:** Established a long-lived `dev` branch with a stable Vercel Preview alias and Preview-scoped runtime env vars, enabling shareable in-progress deploys isolated from production.

PREVIEW_URL: nim-kaleb-git-dev-kaleb-nims-projects.vercel.app

## What Was Built

1. **Long-lived `dev` branch** (Task 1, completed in prior run)
   - Branched from `main` at SHA `213c499`
   - Pushed to `origin/dev` with upstream tracking
   - Vercel Production Branch unchanged (still `main`)

2. **Vercel Preview env scope verified/mirrored** (Task 2)
   - Confirmed all three required runtime vars already present in Preview scope:
     `OPENAI_API_KEY`, `NEXT_PUBLIC_WS_SERVER_URL`, `DATABASE_URL` (created 28 days ago — no new add needed)
   - Pulled production env to `.env.production.local` to validate values exist; immediately deleted after verification
   - Confirmed `.env.production.local` is gitignored before pull; no secrets committed
   - Codebase scan (`grep -rn 'process.env\.' app/`) confirms only `OPENAI_API_KEY` and
     `NEXT_PUBLIC_WS_SERVER_URL` are read by app code — `DATABASE_URL` is wired but unused in
     current app routes (kept in Preview for future server actions)

4. **Human verification (Task 4)** — User opened the stable alias, authenticated via Vercel SSO,
   and confirmed the dev preview renders the terminal UI correctly. User explicitly **accepted**
   the deviation that `POST /api/realtime/session` returns 400 (OpenAI Realtime Beta deprecated)
   as out-of-scope; tracked as **D-1** in `deferred-items.md` for a future migration plan.

3. **First dev preview deploy + stable alias captured** (Task 3)
   - Vercel auto-deployed on Task 1's `git push origin dev` (no manual trigger needed)
   - Latest dev deployment: `nim-kaleb-7kbnm7avr-kaleb-nims-projects.vercel.app` (● Ready)
   - **Stable git-branch alias:** `nim-kaleb-git-dev-kaleb-nims-projects.vercel.app`
   - Smoke tests (via `bunx vercel curl` — Vercel SSO Deployment Protection is enabled on Preview):
     - `GET /` → **200** ✓
     - `POST /api/realtime/session` → **400** (NOT 500 — proves OPENAI_API_KEY is wired; 400 body
       is OpenAI's "Realtime Beta API deprecated" — pre-existing app bug, see Deferred Issues)
     - Home HTML contains expected markers (Kortix / terminal / kaleb)
   - **Production isolation verified:** `nim-kaleb.vercel.app` and `kalebnim.dev` still point
     to deployment `dpl_FduqDBCzHZiPefygxZtRt67dva8X` (target `production`, alias
     `nim-kaleb-git-main-kaleb-nims-projects.vercel.app`) — 12-day-old build from `main`,
     untouched by the dev branch push.

## Commits

No source commits made in this plan — all work was Vercel state mutations and verification.
A docs commit will follow at the end of the orchestrator (SUMMARY + STATE updates).

## Deviations from Plan

### Auto-resolved (Rule 1/2/3)

**1. [Rule 3 - Resolution] Task 2 env vars already present in Preview scope**
- **Found during:** Task 2 step 2 (`bunx vercel env ls preview`)
- **Issue:** Plan assumed `OPENAI_API_KEY` and `NEXT_PUBLIC_WS_SERVER_URL` needed to be added
  to Preview; in fact all three (incl. `DATABASE_URL`) had already been created 28 days ago.
- **Fix:** Skipped the `bunx vercel env add` steps; instead pulled production env locally to
  verify values exist and matched what's needed, then deleted the temp file. Acceptance
  criteria still met (Preview lists all three required vars).
- **Files modified:** none
- **Commit:** none

**2. [Rule 3 - Resolution] Task 3 smoke test required authenticated client**
- **Found during:** Task 3 step 6 (unauthenticated `curl https://<PREVIEW_URL>/` returned `401`)
- **Issue:** Vercel SSO Deployment Protection is enabled on Preview deployments by default,
  blocking anonymous curl. Plan assumed public access.
- **Fix:** Used `bunx vercel curl --deployment <alias> <path>` which auto-generates a protection
  bypass token via the authenticated CLI session. All smoke tests then ran successfully behind
  the protection wall (which is the correct security posture — preview URL is shareable only
  with authenticated team members or via the dashboard).
- **Files modified:** none
- **Commit:** none
- **Note for verifier:** When opening the preview URL in a browser, you'll be prompted to
  authenticate via Vercel SSO. This is expected and matches Vercel's default Preview protection.
  If you want a publicly accessible preview, disable Deployment Protection in
  Vercel Dashboard → Settings → Deployment Protection → switch Preview to "Only Production".

## Authentication Gates

- **Task 2** required `vercel` CLI auth — already authenticated as `kaleb-nim` at start, no
  gate triggered.
- **Task 3** required `vercel` CLI auth to use `vercel curl` for bypass-token generation —
  same session, no gate.

## Deferred Issues

See `deferred-items.md` in this phase directory:
- **D-1:** OpenAI Realtime Beta API deprecated (pre-existing, affects production too) — surfaced
  by the 400 on `/api/realtime/session`. Phase 12 cleanly proves env-wiring is correct; the
  upstream API migration is a separate plan.
- **D-2:** `DASHSCOPE_*` keys present in Vercel Preview scope but unused by app code — pre-existing
  hygiene issue.

## Self-Check: PASSED

- FOUND: `.planning/phases/12-create-dev-branch-for-live-preview-environment-separate-from/12-01-SUMMARY.md`
- FOUND: `.planning/phases/12-create-dev-branch-for-live-preview-environment-separate-from/deferred-items.md`
- FOUND: `origin/dev` ref → `git ls-remote --heads origin dev` succeeds with SHA `213c499`
- FOUND: Vercel Preview env has all 3 target vars (`bunx vercel env ls preview`)
- FOUND: Stable alias `nim-kaleb-git-dev-kaleb-nims-projects.vercel.app` resolves and serves home page (HTTP 200 authenticated)
- FOUND: Production alias `nim-kaleb.vercel.app` still on `main` deployment (isolation verified)
- FOUND: Grep-able `PREVIEW_URL:` line present in this SUMMARY (line above) for Plan 12-02 consumption
