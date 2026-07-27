---
phase: 260727-pco
plan: 01
subsystem: security-cleanup
tags: [security, dead-code, api-routes, openai]
dependency-graph:
  requires: []
  provides: []
  affects: [app/api, tests/, README.md]
tech-stack:
  added: []
  patterns: []
key-files:
  created: []
  modified:
    - README.md
  deleted:
    - app/api/realtime/session/route.ts
    - tests/realtime-voice.spec.ts
decisions:
  - "openai npm dependency retained — three live importers (ws-server/src/dashscope/llm.ts, scripts/generate_run_map.ts, scripts/sync-context.ts); the task brief's optional removal follow-up is closed as not-applicable"
metrics:
  duration: "~10min"
  completed: 2026-07-27
status: complete
---

# Phase 260727-pco Plan 01: Delete Dead OpenAI Realtime Session Route Summary

Removed the unauthenticated, unrate-limited `POST /api/realtime/session` endpoint (minted
`gpt-4o-realtime-preview-2024-12-17` ephemeral OpenAI tokens for any anonymous caller) and its
only test caller, since the live voice pipeline is 100% Alibaba DashScope in `ws-server/` and
nothing in the browser ever requested this route.

## What Was Built

- **Task 1:** Deleted `app/api/realtime/session/route.ts` and its parent `app/api/realtime/`
  subtree (contained only this one route), plus its sole caller `tests/realtime-voice.spec.ts`.
  Sibling routes `app/api/analytics/session/route.ts` and `app/api/analytics/transcript/route.ts`
  verified intact. `app/hooks/useRealtimeVoice.ts` (the live DashScope client) untouched.
- **Task 2:** Corrected the README `OPENAI_API_KEY` environment-variable table row. It previously
  claimed the variable powered "Legacy Realtime session route" on Vercel — now false. Corrected
  to name the actual surviving consumer: the `generate_run_map.ts` local dev helper script
  (`Where` changed from `Vercel` to `local dev`).
- **Task 3:** Ran the full verification gate (lint, typecheck, build, Playwright collection) and
  confirmed no regression from the deletion.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking issue] Stale `.next/` type-check cache referenced the deleted route**
- **Found during:** Task 3, first `bunx tsc --noEmit` run
- **Issue:** `bunx tsc --noEmit` failed with `TS2307: Cannot find module '../../../app/api/realtime/session/route.js'` from two files under `.next/dev/types/validator.ts` and `.next/types/validator.ts`. These are Next.js's auto-generated route-type validator files, gitignored build output, stale from before the deletion.
- **Fix:** `rm -rf .next` (safe — it's a gitignored, fully regenerable build artifact, not source). Re-ran `bunx tsc --noEmit` — exit 0, clean.
- **Files modified:** none (build cache only, not tracked by git)
- **Commit:** n/a (no source change; not staged/committed)

No other deviations. Plan executed as written otherwise.

## Verification Results (Task 3 gate, run in order)

1. **`bun run lint`** — exit 1, **492 problems (32 errors, 460 warnings)**, all located in
   `ws-server/dist/index.js`, `ws-server/src/session.ts` (`@typescript-eslint/no-this-alias`,
   `no-unused-vars`, `no-unused-expressions`), and a `.planning/research/portfolio_info/...`
   static bundled JS file. **Confirmed pre-existing and unrelated to this task**: a lint run
   captured *before* any deletion (`/tmp/pco-lint-before.txt`, via the plan's `read_first` step)
   produced **byte-identical output** (`diff` returned no differences) to the post-deletion run.
   `eslint.config.mjs` does not exclude `ws-server/dist/**` or `.planning/research/**` from
   globbing, which is why third-party/generated content triggers project lint rules — a
   pre-existing config gap, out of scope per the deviation rules' scope boundary (issues not
   caused by this task's changes). No files this task touched appear anywhere in the lint output.
2. **`bunx tsc --noEmit`** — exit 0 after clearing the stale `.next/` cache (see deviation above).
3. **`bun run build`** — exit 0. No `DATABASE_URL`-related failure occurred (the plan's
   contingency for a possible pre-existing build failure was not needed — build succeeded
   cleanly on the first attempt after the cache clear). No `git stash` comparison was required.
4. **`bunx playwright test --list`** — exit 0. Listed exactly 4 spec files (24 tests total):
   `context-pipeline.spec.ts`, `tts-stt-pipeline.spec.ts`, `ui-preservation.spec.ts`,
   `ws-pipeline.spec.ts`. No `realtime-voice` entry present.

All plan `<verification>` checks confirmed:
- `app/api/realtime/` and `tests/realtime-voice.spec.ts` both gone.
- `grep -rq "realtime/session" app/ tests/` — no match.
- `git diff --stat package.json ws-server/package.json` — empty (openai dependency untouched).
- `grep -q "NEXT_PUBLIC_WS_SERVER_URL" app/hooks/useRealtimeVoice.ts` — still matches (DashScope
  pipeline untouched).

## Dependency Decision (recorded per plan's `<output>` requirement)

The `openai` npm dependency was evaluated for removal and **deliberately retained**. Three live
importers remain:
- `ws-server/src/dashscope/llm.ts:5` — DashScope LLM client uses the OpenAI SDK against an
  OpenAI-compatible endpoint (live production pipeline).
- `scripts/generate_run_map.ts:6`
- `scripts/sync-context.ts:12`

The task brief's optional "remove `openai` dep only if grep confirms zero remaining imports"
follow-up is **closed as not-applicable** — grep confirmed the opposite.

## Follow-ups (not done here, out of scope per plan)

- `.planning/codebase/*.md` and the auto-synced sections of `CLAUDE.md` (Architecture, Stack,
  Conventions sections around lines ~196, 218, 232, 330, 360) still describe the deleted route
  as if it exists. These regenerate via `/gsd-map-codebase` + `bun run sync-context` — hand-edits
  would be overwritten by the next sync.
- `.planning/diagrams/openai-realtime-architecture.mmd` is also stale and describes the now-
  deleted route.
- The pre-existing `eslint.config.mjs` gap (does not exclude `ws-server/dist/**` or
  `.planning/research/**`) causes 492 lint problems on every run, unrelated to this or most
  other tasks. Flagged here for awareness; not fixed — out of scope per the deviation rules'
  scope boundary (not caused by this task).

## Known Stubs

None introduced by this plan.

## Threat Flags

None — this plan is pure removal of attack surface (see `<threat_model>` in the plan: T-pco-01
Elevation of Privilege and T-pco-02 Denial of Service both resolved by deletion; T-pco-03
Tampering risk of over-broad delete verified not to have occurred via the Task 1 gate).

## Self-Check: PASSED

**Files:**
- `app/api/realtime/session/route.ts` — MISSING (expected, deleted) ✓
- `tests/realtime-voice.spec.ts` — MISSING (expected, deleted) ✓
- `app/api/analytics/session/route.ts` — FOUND ✓
- `app/api/analytics/transcript/route.ts` — FOUND ✓
- `README.md` — FOUND, contains `generate_run_map`, no longer contains `app/api/realtime` ✓

**Commits:**
- `e04cb7e` — FOUND in `git log --oneline --all` ✓
- `4c72619` — FOUND in `git log --oneline --all` ✓

No missing items.
