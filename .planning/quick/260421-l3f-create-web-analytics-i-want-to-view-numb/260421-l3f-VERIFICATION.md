---
phase: 260421-l3f-create-web-analytics
verified: 2026-04-21T00:00:00Z
status: human_needed
score: 7/7 code-verifiable truths verified (human-only items pending)
overrides_applied: 0
human_verification:
  - test: "Provision Neon Postgres via Vercel Marketplace Integrations"
    expected: "DATABASE_URL auto-injected into Vercel env vars; bunx vercel env pull populates .env.local"
    why_human: "One-time external provisioning in Vercel dashboard; cannot be automated from this repo"
  - test: "Apply schema.sql to Neon (SQL Console or psql)"
    expected: "sessions and transcripts tables created; SELECT count(*) returns 0 on both"
    why_human: "Requires credentialed access to the Neon project"
  - test: "Enable Vercel Web Analytics in project dashboard"
    expected: "Analytics tab shows pageview ingestion active; pageviews appear within ~1-2 min of prod deploy"
    why_human: "Toggle lives in Vercel dashboard, not in repo"
  - test: "Local end-to-end without DATABASE_URL (Part A)"
    expected: "bun dev; click Connect; /api/analytics/* returns 503; voice conversation still completes normally with no UI errors"
    why_human: "Requires running server + real microphone + real WS backend"
  - test: "Local end-to-end with DATABASE_URL configured (Part E)"
    expected: "After a full Connect-speak-listen-Disconnect cycle: 1 row in sessions with status='ended' and non-null duration_ms; ≥1 transcripts row with role='user'; ≥1 transcripts row with role='assistant'; monotonic turn_index"
    why_human: "Requires real audio input, WS backend, and Neon connection"
  - test: "Production pageview + voice session verification (Part F, non-blocking)"
    expected: "Pageview visible in Vercel Analytics; session + transcript rows appear in prod Neon for a real voice interaction"
    why_human: "Requires production deploy and real user traffic"
---

# Quick 260421-l3f: Web Analytics — Verification Report

**Task Goal:** Vercel Web Analytics for pageviews + Neon Postgres for voice session lifecycle and transcripts. Silent logging, no admin UI, graceful no-op when DATABASE_URL is unset.
**Verified:** 2026-04-21
**Status:** human_needed
**Re-verification:** No — initial verification.

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Vercel Web Analytics renders on every page (pageviews tracked in prod) | VERIFIED (code) / human_needed (dashboard confirmation) | `app/layout.tsx:3,29` imports from `@vercel/analytics/next` and mounts `<Analytics />` inside `<body>`. Dashboard enablement + prod pageview visibility is a Part D/F human-verify. |
| 2 | Clicking Connect inserts a row into `sessions` with server-generated UUID + `started_at` | VERIFIED (code) | `app/hooks/useRealtimeVoice.ts:367-380` POSTs `{event:'start'}` once per user-initiated connect (gated on `sessionIdRef.current === null` to prevent auto-reconnect duplicates). Route handler `app/api/analytics/session/route.ts:26-34` inserts with `gen_random_uuid()` default and returns the id. |
| 3 | Final user ASR utterance inserted into `transcripts` with role='user' | VERIFIED (code) | `useRealtimeVoice.ts:202-214` fires `/api/analytics/transcript` on `case 'transcript.final'`, passes role='user' and incremented turnIndex. Server validates role in `{user,assistant}` at `route.ts:27`. |
| 4 | Assistant response inserted into `transcripts` with role='assistant' on non-barge-in completion | VERIFIED (code) | `useRealtimeVoice.ts:237-248` reads `assistantBufferRef` snapshot, clears it atomically, and only POSTs when `!isImmediate && sessionIdRef.current && buffered` — barge-in fragments are correctly skipped. Buffer is fed in `case 'response.text.delta'` at lines 228-234. |
| 5 | Session row updated with `ended_at`, `duration_ms`, `status` on disconnect / tab close | VERIFIED (code) | Three paths cover this: `disconnect()` (lines 504-521) posts `status:'ended'`; `useEffect` at lines 546-576 uses `navigator.sendBeacon` for visibilitychange/pagehide with `status:'abandoned'`; `case 'error'` (lines 291-309) posts `status:'error'`. Route handler's `UPDATE … where id = … and ended_at is null` makes writes idempotent. |
| 6 | If DATABASE_URL is unset, routes return 503 and client silently swallows the error | VERIFIED (code) | `lib/db.ts:3,10-19`: `isDbConfigured` gate + Proxy defers failure to call-site. `route.ts` (both) short-circuit with 503 before touching sql at line 17-19. Client `postAnalytics` uses `.catch(() => {})` at `useRealtimeVoice.ts:78` and `connect`'s fetch chain uses the same pattern at line 379. |
| 7 | No consent/disclosure UI rendered anywhere | VERIFIED | `app/layout.tsx` and `app/components/` contain no consent banner, cookie notice, or disclosure modal. Only additions are the `<Analytics />` component (silent). |

**Score:** 7/7 code-verifiable truths verified. 3 human-verification items remain (provisioning + live end-to-end).

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `lib/db.ts` | Neon `sql` + `isDbConfigured`, no-throw at import | VERIFIED | Exports present (lines 3,10); Proxy has both `apply` and `get` traps (lines 13-18) per REVIEW WR-05 fix |
| `app/api/analytics/session/route.ts` | POST start/end, 503 gate, UUID validation | VERIFIED | `runtime='nodejs'` (line 4); UUID_RE regex validation (lines 6, 39); generic error responses (line 73); all error fields bounded |
| `app/api/analytics/transcript/route.ts` | POST insert, role validation, 8000 char cap, UUID guard | VERIFIED | UUID_RE guard (lines 7, 26); role check (line 27); text slice 8000 (line 33); generic error response (line 45) |
| `app/layout.tsx` | `<Analytics />` from `@vercel/analytics/next` | VERIFIED | Correct import path at line 3 (NOT `/react`); mounted as last body child at line 29 |
| `app/hooks/useRealtimeVoice.ts` | Seven analytics taps | VERIFIED | start (367-380), user transcript (205-212), assistant buffering (228-234), assistant transcript (237-248), error-end (291-309), disconnect-end (504-521), visibility/pagehide beacon (546-576) |
| `schema.sql` | Idempotent DDL for sessions + transcripts | VERIFIED | `create table if not exists`, `create index if not exists`, `pgcrypto` extension, FK cascade, status check constraint all present |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| `app/layout.tsx` | `@vercel/analytics/next` | `<Analytics />` component | WIRED | Line 3 import + line 29 mount |
| `app/api/analytics/session/route.ts` | `lib/db.ts` | `import { sql, isDbConfigured } from '@/lib/db'` | WIRED | Line 2; both symbols used |
| `app/api/analytics/transcript/route.ts` | `lib/db.ts` | `import { sql, isDbConfigured } from '@/lib/db'` | WIRED | Line 2; both symbols used |
| `useRealtimeVoice.ts` | `/api/analytics/session` | `fetch()` + `sendBeacon()` | WIRED | fetch at line 371 (start); postAnalytics at 299, 515; sendBeacon at 557 |
| `useRealtimeVoice.ts` | `/api/analytics/transcript` | `postAnalytics()` calls | WIRED | lines 206 (user), 242 (assistant) |
| `package.json` | `@vercel/analytics@2.0.1` + `@neondatabase/serverless@1.1.0` | declared deps | WIRED | Both present at expected versions |

### Post-Review Hardening Fixes

All five requested REVIEW fixes confirmed landed:

| Fix | File | Status | Evidence |
|-----|------|--------|----------|
| UUID regex validation on both POST routes | `session/route.ts:6,39`, `transcript/route.ts:7,26` | PASS | `UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i` guards session end + transcript insert |
| Error responses generic (no `err.message` passthrough) | `session/route.ts:71-74`, `transcript/route.ts:43-46` | PASS | Both catch blocks log server-side and return `'internal error'` literal |
| `sessionIdRef.current = null` BEFORE `postAnalytics` in disconnect() and error case | `useRealtimeVoice.ts:297, 512-513` | PASS | Error case: `sessionIdRef.current = null;` at line 297 before the `postAnalytics` at 299. Disconnect: `sessionIdRef.current = null;` at 513 before `postAnalytics` at 515 |
| `intentionalCloseRef.current = true` inside `case 'error'` | `useRealtimeVoice.ts:295` | PASS | Set immediately on entry to error case, before the analytics POST, to suppress auto-reconnect spawning a replacement session (REVIEW WR-04 fix) |
| Proxy in `lib/db.ts` has both `apply` and `get` traps | `lib/db.ts:12-18` | PASS | Both traps throw `'DATABASE_URL not configured'` — handles `sql\`\`` tagged template and any `sql.query`/`sql.transaction` property access |

### Anti-Patterns Found

None. Code review WR-02 (no rate limit / origin check) was flagged in REVIEW but not in the re-verification scope — noted as accepted risk per threat model T-l3f-04.

### Requirements Coverage

| Requirement | Description | Status | Evidence |
|-------------|-------------|--------|----------|
| L3F-01 | Vercel Web Analytics traffic tracking | SATISFIED (code) / human_needed (dashboard enable) | `<Analytics />` mounted in layout; Part D human task to toggle in dashboard |
| L3F-02 | Voice session lifecycle events (connect/disconnect/duration/error) in Neon | SATISFIED | 7 integration points in `useRealtimeVoice.ts` + session route handler |
| L3F-03 | ASR user transcripts + AI assistant transcripts in Neon | SATISFIED | `transcript.final` (user) + `response.done` non-barge-in (assistant) taps |
| L3F-04 | Silent logging, graceful no-op if DATABASE_URL missing | SATISFIED | No consent UI; `isDbConfigured` gate → 503; client `.catch(() => {})` |

### Human Verification Required

1. **Provision Neon via Vercel Marketplace** — Vercel dashboard → Integrations → Neon (by Vercel) → Add to project. Run `bunx vercel env pull .env.local`.
2. **Apply schema.sql** — Neon SQL Console or `psql "$DATABASE_URL" -f schema.sql`. Verify `select count(*) from sessions` returns 0.
3. **Enable Vercel Web Analytics** — Dashboard → Analytics → Enable.
4. **Part A (503 fallback)** — `bun dev` without DATABASE_URL; click Connect; confirm Network tab shows 503 and voice conversation still works.
5. **Part E (end-to-end with DB)** — `bun dev` with DATABASE_URL; full Connect-speak-Disconnect; verify session row has `status='ended'` + `duration_ms`; verify paired user+assistant transcript rows with monotonic `turn_index`.
6. **Part F (prod, non-blocking)** — Post-merge: confirm pageview in Vercel Analytics dashboard + prod Neon rows for a real voice session.

### Gaps Summary

No code gaps. All must_haves (truths, artifacts, key_links) pass static verification. Task 3 is explicitly a `checkpoint:human-verify` gate requiring external service provisioning and end-to-end runtime verification that cannot be executed programmatically from this repo. Overall status is `human_needed` (not `passed`) because live end-to-end behavior (503 fallback, Neon row insertion, pageview ingestion) has not yet been observed.

---

_Verified: 2026-04-21_
_Verifier: Claude (gsd-verifier)_
