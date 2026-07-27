---
phase: 260727-pco
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - app/api/realtime/session/route.ts
  - tests/realtime-voice.spec.ts
  - README.md
autonomous: true
requirements: [QUICK-260727-pco]
quick_task: true

must_haves:
  truths:
    - "The OpenAI ephemeral-token endpoint no longer exists in the app; nothing in app/ or tests/ references it"
    - "The DashScope voice pipeline is untouched — the browser hook still connects only to NEXT_PUBLIC_WS_SERVER_URL"
    - "bun run lint, bunx tsc --noEmit, and bun run build all succeed after the deletion"
    - "Playwright still collects the 4 remaining specs with zero import/collection errors"
    - "README's env-var table accurately names the surviving OPENAI_API_KEY consumer"
  artifacts:
    - "app/api/realtime/ — REMOVED (directory gone, it contained only session/route.ts)"
    - "tests/realtime-voice.spec.ts — REMOVED"
    - "package.json — UNCHANGED (openai dependency retained, see key_links)"
    - "README.md — OPENAI_API_KEY row corrected"
  key_links:
    - "ws-server/src/dashscope/llm.ts:5 imports OpenAI (DashScope OpenAI-compatible client) → root+ws-server openai dep MUST stay"
    - "scripts/generate_run_map.ts:6 and scripts/sync-context.ts:12 import OpenAI → root openai dep MUST stay"
    - "scripts/generate_run_map.ts:132 reads process.env.OPENAI_API_KEY → the env var MUST stay documented"
    - "tests/ui-preservation.spec.ts already duplicates the deleted spec's UI coverage → zero coverage loss"
---

<objective>
Delete the dead OpenAI Realtime session route (`app/api/realtime/session/route.ts`) and its
only caller (`tests/realtime-voice.spec.ts`), then prove the app still builds, lints, and
collects tests with no dangling references.

Purpose: The live voice pipeline is 100% Alibaba DashScope in `ws-server/`. The route is a
leftover from the pre-Alibaba implementation — it mints `gpt-4o-realtime-preview-2024-12-17`
ephemeral tokens that nothing in the browser ever requests. Keeping it means shipping a
publicly-reachable, unauthenticated, unrate-limited endpoint that spends an API key on behalf
of any caller. Deleting it removes real attack surface, not just clutter.

Output: Two files deleted, one README row corrected, green lint/typecheck/build.
</objective>

<execution_context>
@$HOME/.claude/gsd-core/workflows/execute-plan.md
@$HOME/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md

@app/api/realtime/session/route.ts
@tests/realtime-voice.spec.ts
@tests/ui-preservation.spec.ts
</context>

<investigation_findings>
Established by the orchestrator and re-verified by grep during planning. The executor should
NOT re-litigate these — they are inputs, not open questions.

**1. The route is dead.**
`app/api/realtime/session/route.ts` is referenced by exactly one file in the codebase:
`tests/realtime-voice.spec.ts`. The browser hook `app/hooks/useRealtimeVoice.ts:19` reads
only `NEXT_PUBLIC_WS_SERVER_URL` and opens `WS_SERVER_URL + '/ws'` (line 352). Its only
`fetch` calls target `/api/analytics/transcript` and `/api/analytics/session`. It never
touches the realtime session route.

**2. The spec loses zero unique coverage.** It has three blocks, all dead or duplicated:
- *Session endpoint block* — tests the route being deleted. Dies with it.
- *"Old endpoints are removed"* — asserts `/api/chat`, `/api/tts`, `/api/stt` return 404.
  Verified: none of those directories exist. Next.js 404s any unmatched path by default, so
  these assert framework behavior, not project behavior.
- *"Voice interface UI"* — the `1 ⏎` → Connect-button flow. `tests/ui-preservation.spec.ts`
  already asserts this exact flow (goto → wait for `Terminal command input` → fill `1` →
  Enter → expect Connect button visible), plus starfield/terminal/STATUS assertions the
  deleted spec lacks. It is a strict superset.

**3. The `openai` npm dependency MUST NOT be removed.** The task brief flagged this as a
possible follow-up "only if grep confirms zero remaining imports." Grep confirms the
opposite — three live importers:
- `ws-server/src/dashscope/llm.ts:5` — the DashScope LLM client uses the OpenAI SDK against
  an OpenAI-compatible endpoint. This is the live production pipeline.
- `scripts/generate_run_map.ts:6`
- `scripts/sync-context.ts:12`
The follow-up is therefore **resolved as "do not remove."** Do not touch `package.json` or
`ws-server/package.json`.

**4. `OPENAI_API_KEY` MUST stay, but its README row is now wrong.** After this deletion the
only consumer is `scripts/generate_run_map.ts:132` — a local dev script, not a Vercel
runtime route. The README row currently claims it powers a Vercel route that will no longer
exist. Correct the row; do not delete it.

**5. Generated docs are deliberately out of scope.** `.planning/codebase/*.md` and the
lower auto-synced sections of `CLAUDE.md` (lines ~196, 218, 232, 330, 360) also mention the
route. Those sections are regenerated from `.planning/codebase/` by `scripts/sync-context.ts`
— hand-editing them gets clobbered on the next sync. Leave them; they refresh via
`/gsd-map-codebase`. This is recorded as a follow-up in the SUMMARY, not a task here.
</investigation_findings>

<tasks>

<task type="auto">
  <name>Task 1: Delete the dead route and its only caller</name>
  <files>app/api/realtime/session/route.ts, tests/realtime-voice.spec.ts</files>
  <read_first>
    Before deleting, capture a build baseline so Task 3 can distinguish a regression this
    change caused from a failure that already existed:
    `bun run lint > /tmp/pco-lint-before.txt 2>&1; echo "lint exit: $?"`
    Record that exit code in the SUMMARY.
  </read_first>
  <action>
    Remove the route file, then remove its now-empty parent directories. `session/` contained
    only `route.ts`, and `app/api/realtime/` contained only `session/`, so the whole
    `app/api/realtime` subtree goes. Use `rm -rf app/api/realtime`.

    Sibling API routes `app/api/analytics/transcript/route.ts` and
    `app/api/analytics/session/route.ts` are live and MUST survive — scope the delete to the
    `realtime` subtree only, never to `app/api`.

    Then delete `tests/realtime-voice.spec.ts` with `rm`. Playwright discovers specs by
    globbing `testDir: './tests'` (playwright.config.ts) — there is no per-file registration,
    so no config edit is needed.

    Do not modify `app/hooks/useRealtimeVoice.ts`. Despite the similar name it is the live
    DashScope client and is unrelated to the deleted route.
  </action>
  <verify>
    <automated>test ! -e app/api/realtime &amp;&amp; test ! -e tests/realtime-voice.spec.ts &amp;&amp; test -f app/api/analytics/session/route.ts &amp;&amp; test -f app/api/analytics/transcript/route.ts &amp;&amp; ! grep -rq "realtime/session" app/ tests/ &amp;&amp; echo DELETE_OK</automated>
  </verify>
  <done>
    `app/api/realtime/` and `tests/realtime-voice.spec.ts` no longer exist; both
    `app/api/analytics/*` routes still exist; no file under `app/` or `tests/` contains the
    string `realtime/session`; the gate prints DELETE_OK.
  </done>
</task>

<task type="auto">
  <name>Task 2: Correct the README env-var row for OPENAI_API_KEY</name>
  <files>README.md</files>
  <read_first>
    README.md "## Environment variables" table, ~line 176. Current row:
    `| OPENAI_API_KEY | Vercel | Legacy Realtime session route (app/api/realtime/session) |`
  </read_first>
  <action>
    Edit that single table row in place. The variable stays — `scripts/generate_run_map.ts`
    still reads it — but both the "Where" and "Purpose" cells are now false.

    Change "Where" from `Vercel` to `local dev`, and rewrite "Purpose" to name the surviving
    consumer: the `generate_run_map.ts` helper script. Do not mention the deleted route path
    in the replacement text, and do not describe it as legacy or deprecated — it is a current,
    correct dependency of a dev script.

    Preserve the markdown table's column-pipe structure so the table still renders. Do not add
    or remove rows. Do not touch any other README section.
  </action>
  <verify>
    <automated>grep -q "OPENAI_API_KEY" README.md &amp;&amp; grep -q "generate_run_map" README.md &amp;&amp; ! grep -q "app/api/realtime" README.md &amp;&amp; echo README_OK</automated>
  </verify>
  <done>
    README still documents `OPENAI_API_KEY`, its row now names `generate_run_map`, the string
    `app/api/realtime` appears nowhere in README.md, the table renders correctly, and the gate
    prints README_OK.
  </done>
</task>

<task type="auto">
  <name>Task 3: Prove the app still lints, typechecks, builds, and collects tests</name>
  <files>(no file changes — verification only)</files>
  <action>
    Run the full gate in order and record each result in the SUMMARY:

    1. `bun run lint`
    2. `bunx tsc --noEmit`
    3. `bun run build`
    4. `bunx playwright test --list`

    Step 4 must list exactly 4 spec files — `context-pipeline.spec.ts`,
    `tts-stt-pipeline.spec.ts`, `ui-preservation.spec.ts`, `ws-pipeline.spec.ts` — and must
    exit 0. A collection error here would mean a surviving spec imported the deleted one.
    `--list` does not start the dev server, so no server needs to be running.

    If step 3 fails: `bun run build` compiles the live `app/api/analytics/*` routes, which
    reach for `DATABASE_URL`. A missing-env failure there is pre-existing and unrelated to
    this deletion. Prove which it is before reporting — stash the change, re-run the failing
    command, then restore:
    `git stash -u && bun run build; git stash pop`
    If it fails identically with the change stashed, the failure predates this task: record it
    in the SUMMARY as pre-existing and let the gate pass on lint + typecheck + test collection.
    If it only fails with the change applied, this deletion caused it — stop and report.

    Make no code edits in this task. If a real regression appears, halt and report rather than
    patching around it.
  </action>
  <verify>
    <automated>bun run lint &amp;&amp; bunx tsc --noEmit &amp;&amp; bunx playwright test --list 2>&amp;1 | tee /tmp/pco-list.txt &amp;&amp; test "$(grep -c 'spec\.ts' /tmp/pco-list.txt)" -ge 4 &amp;&amp; ! grep -q "realtime-voice" /tmp/pco-list.txt &amp;&amp; echo GATE_OK</automated>
  </verify>
  <done>
    `bun run lint` exits 0; `bunx tsc --noEmit` exits 0; `bun run build` exits 0 (or its
    failure is demonstrated pre-existing via the stash comparison and recorded as such);
    `bunx playwright test --list` exits 0, lists the 4 surviving specs, and shows no
    `realtime-voice` entry; the gate prints GATE_OK.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| public internet → Vercel route handler | Any anonymous caller could POST to the route being deleted |
| ws-server → DashScope | Untouched by this change |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-pco-01 | Elevation of Privilege | `app/api/realtime/session` (unauthenticated POST mints an OpenAI ephemeral token for any caller) | high | mitigate | Task 1 deletes the endpoint outright — attack surface removed, not merely gated |
| T-pco-02 | Denial of Service | Same route: no rate limit, each POST spends the account's OpenAI quota | medium | mitigate | Resolved by the same deletion |
| T-pco-03 | Tampering | Over-broad delete removing live sibling routes `app/api/analytics/*` | medium | mitigate | Task 1 verify gate asserts both analytics route files still exist |
| T-pco-04 | Information Disclosure | `OPENAI_API_KEY` value | low | accept | No secret is read, logged, or moved; only a README description of the variable changes |

No package-manager installs occur in this plan, so no supply-chain legitimacy checkpoint is required.
</threat_model>

<verification>
1. `test ! -e app/api/realtime && test ! -e tests/realtime-voice.spec.ts` → both gone
2. `grep -rq "realtime/session" app/ tests/` → no match (exit 1)
3. `bun run lint && bunx tsc --noEmit && bun run build` → all exit 0 (build failure only
   acceptable if proven pre-existing via `git stash -u` comparison)
4. `bunx playwright test --list` → exits 0, lists 4 specs, no `realtime-voice` entry
5. `git diff --stat package.json ws-server/package.json` → empty (openai dep untouched)
6. `grep -q "NEXT_PUBLIC_WS_SERVER_URL" app/hooks/useRealtimeVoice.ts` → still matches
   (DashScope pipeline untouched)
</verification>

<success_criteria>
- [ ] `app/api/realtime/` directory deleted in full
- [ ] `tests/realtime-voice.spec.ts` deleted
- [ ] `app/api/analytics/session/route.ts` and `app/api/analytics/transcript/route.ts` intact
- [ ] Zero references to `realtime/session` remain under `app/` or `tests/`
- [ ] README documents `OPENAI_API_KEY` with its true consumer and no stale route path
- [ ] `package.json` and `ws-server/package.json` unmodified — `openai` dependency retained
- [ ] `app/hooks/useRealtimeVoice.ts` unmodified — DashScope pipeline untouched
- [ ] lint + typecheck + build green; Playwright collects 4 specs cleanly
- [ ] SUMMARY records the `openai`-dependency decision and the generated-docs follow-up
</success_criteria>

<output>
Create `.planning/quick/260727-pco-delete-dead-openai-realtime-session-rout/260727-pco-SUMMARY.md` when done.

The SUMMARY must record:
- The `openai` dependency was evaluated and deliberately **retained** — three live importers
  (`ws-server/src/dashscope/llm.ts`, `scripts/generate_run_map.ts`, `scripts/sync-context.ts`).
  The task brief's optional removal follow-up is **closed as not-applicable**.
- Follow-up (not done here): `.planning/codebase/*.md` and the auto-synced sections of
  `CLAUDE.md` still describe the deleted route. These regenerate via `/gsd-map-codebase` +
  `bun run sync-context`; hand-edits would be overwritten. Also stale:
  `.planning/diagrams/openai-realtime-architecture.mmd`.
- The `bun run build` result, and if it failed, the stash-comparison evidence showing whether
  the failure was pre-existing.
</output>
