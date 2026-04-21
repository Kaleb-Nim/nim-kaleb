---
quick_id: 260421-l3f
name: Web Analytics — Vercel Analytics + Neon session/transcript logging
status: awaiting-human-verification
completed_tasks: 2
total_tasks: 3
requirements_completed: [L3F-01, L3F-02, L3F-03, L3F-04]
key_files:
  created:
    - lib/db.ts
    - app/api/analytics/session/route.ts
    - app/api/analytics/transcript/route.ts
    - .planning/quick/260421-l3f-create-web-analytics-i-want-to-view-numb/schema.sql
  modified:
    - app/layout.tsx
    - app/hooks/useRealtimeVoice.ts
    - package.json
    - bun.lock
dependencies_added:
  - "@vercel/analytics@2.0.1"
  - "@neondatabase/serverless@1.1.0"
commits:
  - 788ae28 # Task 1: backend + SDK wiring
  - 71af08f # Task 2: useRealtimeVoice analytics taps
---

# Quick Task 260421-l3f: Web Analytics Summary

Vercel Web Analytics (pageviews/visitors) mounted in the root layout, and a Neon-Postgres-backed pipeline for voice session lifecycle + ASR/assistant transcripts. Silent logging, no consent UI. Fully graceful no-op when `DATABASE_URL` is absent so deploys don't break before Neon is provisioned.

## What Was Built

### Task 1 — Backend + SDK wiring (commit `788ae28`)

1. Installed `@vercel/analytics@2.0.1` and `@neondatabase/serverless@1.1.0` via `bun add`.
2. Created `lib/db.ts`: exports `sql` (Neon tagged-template) and `isDbConfigured` boolean. Uses a `Proxy` wrapper so importing the module when `DATABASE_URL` is unset does NOT throw — only calling `sql` does. Route handlers gate on `isDbConfigured` and return 503 before ever touching `sql`.
3. Created `POST /api/analytics/session` (`runtime = 'nodejs'`):
   - `{event:'start'}` inserts a row (user_agent truncated to 512 chars), returns `{sessionId}`.
   - `{event:'end', sessionId, durationMs, status, errorCode?, errorMessage?}` updates the row where `ended_at is null`. `status` validated against `'active'|'ended'|'error'|'abandoned'`. `errorMessage` truncated to 1024 chars.
   - Returns 503 when `!isDbConfigured`, 400 for bad input, 500 on DB error (wrapped in try/catch).
4. Created `POST /api/analytics/transcript` (`runtime = 'nodejs'`): validates `sessionId` string, `role ∈ {user,assistant}`, `text` string; truncates text to 8000 chars; inserts into `transcripts` table. Same 503 / 400 / 500 error semantics.
5. Mounted `<Analytics />` from `@vercel/analytics/next` as last child of `<body>` in `app/layout.tsx`.
6. Authored idempotent `schema.sql` — `sessions` + `transcripts` tables per RESEARCH spec. Deliberately skipped `ip_hash` (Open Question 2 in RESEARCH).

### Task 2 — `useRealtimeVoice.ts` integration (commit `71af08f`)

Seven integration points, none of which refactor existing audio/WS logic — additive only.

| # | Location | Behavior |
|---|----------|----------|
| 1 | `ws.onopen` (after `session.start`) | Fire `/api/analytics/session` `{event:'start'}` **only if `sessionIdRef.current === null`** — prevents auto-reconnect from creating a second session row (Pitfall 4). |
| 2 | `case 'transcript.final'` | `postAnalytics('/api/analytics/transcript', { role:'user', text, turnIndex: turnIndexRef++ })`. |
| 3 | `case 'response.text.delta'` | Mirrors deltas into `assistantBufferRef` alongside the existing `setStatus` — gives us a closure-safe snapshot before `response.done` clears `responseText` (Pitfall 3). |
| 4 | `case 'response.done'` (top of case) | Reads `isImmediate` and `buffered` from ref, clears `assistantBufferRef` atomically, logs **only when `!isImmediate`** (skips barge-in fragments — Pitfall 2). |
| 5 | `useEffect` before `return` | `visibilitychange → hidden` and `pagehide` listeners call `navigator.sendBeacon` with `Blob({type:'application/json'})` (Pitfall 6). Marks status `'abandoned'`. |
| 6 | `disconnect()` | Fires end event with `status:'ended'` via `keepalive` fetch, clears `sessionIdRef`. |
| 7 | `case 'error'` | Fires end event with `status:'error'`, `errorCode:'server_error'`, clears `sessionIdRef`. No duplicate on `ws.onerror` — we let the natural `onclose` / auto-reconnect path handle transient failures, and only log a terminal error on the explicit server `error` frame. |

A helper `postAnalytics(path, body)` at module scope wraps `fetch` with `keepalive:true` and `.catch(() => {})` so analytics can never reject into React.

Added `useEffect` import alongside existing React hook imports.

## How to Query Transcripts (Neon SQL Console)

Most recent 5 sessions with duration + status:
```sql
select id, started_at, ended_at, duration_ms, status, error_code, left(error_message, 80) as err
from sessions
order by started_at desc
limit 5;
```

All transcripts for a given session, in turn order:
```sql
select turn_index, role, text, created_at
from transcripts
where session_id = '<paste-session-id>'
order by turn_index asc;
```

Last 20 user utterances across all sessions:
```sql
select t.created_at, left(t.text, 120) as utterance
from transcripts t
where t.role = 'user'
order by t.created_at desc
limit 20;
```

Daily pageview-analog (sessions that got at least one user turn):
```sql
select date_trunc('day', s.started_at) as day,
       count(distinct s.id) as sessions,
       count(t.id) filter (where t.role='user') as user_turns,
       count(t.id) filter (where t.role='assistant') as ai_turns
from sessions s
left join transcripts t on t.session_id = s.id
group by 1
order by 1 desc;
```

## Schema Applied

From `.planning/quick/260421-l3f-create-web-analytics-i-want-to-view-numb/schema.sql`:

- `create extension if not exists "pgcrypto";`
- `sessions(id uuid pk, started_at, ended_at, duration_ms, status, error_code, error_message, user_agent)` + desc index on `started_at`.
- `transcripts(id uuid pk, session_id fk cascade, turn_index, role, text, created_at)` + composite index on `(session_id, created_at)`.

Neon project name / region: **TBD — provisioned during Task 3 human verification**.

## Deviations from Plan

- **None in behavior.** One minor ordering tweak inside `case 'response.done'`: the analytics assistant-transcript POST was added **before** the existing `setPhase('listening')` call so the `assistantBufferRef` snapshot-and-clear happens at the top of the handler, before any state-update scheduling races with subsequent messages. The plan allowed for this ordering (explicitly says "FIRST thing inside `case 'response.done'`").
- **Task 3 not executed.** By plan design, Task 3 is a `checkpoint:human-verify` gate — the user must manually provision Neon via the Vercel Marketplace, pull `DATABASE_URL` with `bunx vercel env pull`, apply `schema.sql` via Neon SQL Console, enable Vercel Web Analytics in the dashboard, and run end-to-end verification (Parts A–E of the plan). Code is ready and compiles clean; it awaits real credentials.

## Graceful No-Op Verification

When `DATABASE_URL` is unset:
- `lib/db.ts` does NOT throw at import time (Proxy defers failure to call).
- `POST /api/analytics/session` and `POST /api/analytics/transcript` short-circuit with HTTP 503 before touching `sql`.
- Client-side `fetch().catch(() => {})` swallows the error — the voice UI is never blocked and no React error boundary fires.

## Automated Verification

- `bunx tsc --noEmit` → clean (no errors).
- `grep -c "postAnalytics\|/api/analytics" app/hooks/useRealtimeVoice.ts` → 7 (≥5 required).
- `grep "sessionIdRef.current === null"` → present (reconnect gate).
- `grep "isImmediate"` → present (barge-in skip).
- `grep "sendBeacon"` → present.
- `grep "visibilitychange"` → present.
- `grep "@vercel/analytics/next"` in `app/layout.tsx` → present.
- `grep "runtime = 'nodejs'"` in both route handlers → present.
- `grep "create table if not exists sessions"` in `schema.sql` → present.

## Awaiting (Task 3 — Human Verification)

Before marking this quick task Verified, the user should complete Parts A–E of Task 3 in the PLAN:

- **Part A** — Confirm 503 fallback works with `DATABASE_URL` unset (local `bun dev`, click Connect, verify Network tab shows 503 and voice still works).
- **Part B** — Provision Neon via Vercel Marketplace → Integrations → Neon (by Vercel). Run `bunx vercel env pull .env.local`.
- **Part C** — Apply `schema.sql` via Neon SQL Console or `psql "$DATABASE_URL" -f schema.sql`. Confirm empty row counts.
- **Part D** — Enable Vercel Web Analytics in the project dashboard.
- **Part E** — End-to-end local test: `bun dev`, Connect, speak, Disconnect. Query `sessions` and `transcripts` to verify row insertion, `duration_ms` populated, `status='ended'`, one row per role per turn, monotonic `turn_index`.
- **Part F** (non-blocking) — Post-deploy production verification: pageview in Vercel Analytics dashboard + prod voice session rows in Neon.

## Self-Check: PASSED

- `lib/db.ts` — FOUND
- `app/api/analytics/session/route.ts` — FOUND
- `app/api/analytics/transcript/route.ts` — FOUND
- `.planning/quick/260421-l3f-create-web-analytics-i-want-to-view-numb/schema.sql` — FOUND
- `@vercel/analytics/next` import in `app/layout.tsx` — FOUND
- Commit `788ae28` (Task 1) — FOUND
- Commit `71af08f` (Task 2) — FOUND
- `bunx tsc --noEmit` — clean
