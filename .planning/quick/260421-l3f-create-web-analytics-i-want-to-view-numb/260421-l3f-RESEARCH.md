# Quick Task 260421-l3f: Web Analytics — Research

**Researched:** 2026-04-21
**Domain:** Web analytics + structured event logging (Next.js 16, Vercel, Neon Postgres, custom Bun WS voice pipeline)
**Confidence:** HIGH

## Summary

Two orthogonal systems wired together:

1. **Traffic** → Vercel Web Analytics. Zero-config `<Analytics />` component in `app/layout.tsx`. Dashboard in Vercel.
2. **Voice session + transcripts** → Neon Postgres via `@neondatabase/serverless`. Two thin Next.js route handlers (`POST /api/analytics/session`, `POST /api/analytics/transcript`) accept events from the client. Client hooks `useRealtimeVoice` at the lifecycle boundaries.

**Critical finding that changes assumptions:** this project does **not** use the OpenAI Realtime API. It talks to a custom Bun WS server (`wss://ws.kalebnim.dev`) that already emits `transcript.final`, `response.text.delta`, and `response.done` events (see `app/hooks/useRealtimeVoice.ts:186,204,212`). The CONTEXT.md's suggested OpenAI event names (`conversation.item.input_audio_transcription.completed`, `response.audio_transcript.done`) are **not applicable** — use the server's existing events instead. This eliminates a whole category of mismatch risk.

**Primary recommendation:** POST from `useRealtimeVoice` handlers directly into `/api/analytics/*`. Use the assistant-side turn assembled from `response.text.delta` buffered in `status.responseText`, flushed on `response.done`. Use user-side turn from `transcript.final`. Use `navigator.sendBeacon` inside a `visibilitychange → hidden` listener for best-effort session-end on tab close.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Storage:** Vercel Marketplace → Neon Postgres. Driver: `@neondatabase/serverless`.
- **Page analytics:** Vercel Web Analytics via `@vercel/analytics/next`, mounted in `app/layout.tsx`.
- **No in-app dashboard.** View traffic in Vercel UI; view session/transcript data via Neon SQL console / `psql`.
- **Captured:** session connect, disconnect, duration, error code/message; ASR user transcripts; AI response transcripts.
- **Not captured:** menu/command input, click tracking.
- **Privacy:** silent logging — no consent UI, no opt-out (user explicitly accepted tradeoff).
- **Transport:** client → small `POST /api/analytics/*` proxy. Never expose DB creds client-side.

### Claude's Discretion
- Postgres schema design (sessions + transcripts).
- Where to hook transcript capture inside `useRealtimeVoice.ts`.
- Rate limiting / abuse protection — minimal (length caps OK).

### Deferred Ideas (OUT OF SCOPE)
- Admin dashboard UI.
- Menu/UI click tracking.
- Consent flow.
- Analytics-driven product features.
</user_constraints>

---

## Project Constraints (from CLAUDE.md)

- **Runtime:** Bun (not npm/node). Install via `bun add`.
- **Path alias:** `@/*` for imports.
- **Avoid Tailwind for terminal styles** — not relevant here (no UI work).
- **API routes:** follow `app/api/*/route.ts` pattern (see `app/api/realtime/session/route.ts`).
- **Naming:** camelCase functions, PascalCase components, interfaces `{Name}Props`.
- **Error handling:** try-catch + state-based error surfacing; type-narrow `err instanceof Error`.
- **`'use client'`** directive at top of interactive components (not needed in route handlers).

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard | Provenance |
|---------|---------|---------|--------------|------------|
| `@vercel/analytics` | `2.0.1` | Pageviews, visitors, device/route breakdown | Native to Vercel hosting, zero-config, privacy-friendly | [VERIFIED: `bun pm view`] |
| `@neondatabase/serverless` | `1.1.0` | Postgres driver optimized for short-lived serverless functions | Neon's official driver; HTTP fetch transport means no connection pool management in route handlers | [VERIFIED: `bun pm view`] |

### Install

```bash
bun add @vercel/analytics @neondatabase/serverless
```

### Alternatives Considered

| Instead of | Could Use | Why we picked default |
|------------|-----------|-----------------------|
| `@neondatabase/serverless` (HTTP) | `pg` (node-postgres) with Fluid Compute pooling | HTTP driver is simpler for short route-handler writes; no pool lifecycle to manage. Vercel KB recommends `pg` + pool only when query latency in a *single function* matters or for transactions. Our writes are fire-and-forget — HTTP wins. [CITED: https://vercel.com/kb/guide/efficiently-manage-database-connection-pools-with-fluid-compute] |
| Next.js route handlers | Server Actions | Route handlers match existing project style (`app/api/realtime/session/route.ts`) and make `sendBeacon` trivial. |

---

## Architecture

### Data Flow

```
Browser (useRealtimeVoice)
  ├── connect() success       ──► POST /api/analytics/session  { event: 'start', sessionId, userAgent }
  ├── transcript.final event  ──► POST /api/analytics/transcript { sessionId, role: 'user', text, turnIndex }
  ├── response.done event     ──► POST /api/analytics/transcript { sessionId, role: 'assistant', text: status.responseText, turnIndex }
  └── disconnect/error/hidden ──► navigator.sendBeacon('/api/analytics/session', { event: 'end', sessionId, durationMs, status, errorCode?, errorMessage? })

Next.js route handler (Node runtime on Vercel Fluid Compute)
  └── @neondatabase/serverless (HTTP)  ──►  Neon Postgres
```

### Recommended Schema

```sql
-- sessions.sql
create extension if not exists "pgcrypto";

create table if not exists sessions (
  id            uuid primary key default gen_random_uuid(),
  started_at    timestamptz not null default now(),
  ended_at      timestamptz,
  duration_ms   integer,
  status        text not null default 'active'
                  check (status in ('active','ended','error','abandoned')),
  error_code    text,
  error_message text,
  user_agent    text,
  ip_hash       text  -- sha256(ip + daily_salt), never raw ip
);
create index if not exists sessions_started_at_idx on sessions(started_at desc);

create table if not exists transcripts (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references sessions(id) on delete cascade,
  turn_index  integer not null,
  role        text not null check (role in ('user','assistant')),
  text        text not null,
  created_at  timestamptz not null default now()
);
create index if not exists transcripts_session_created_idx
  on transcripts(session_id, created_at);
```

Schema rationale:
- `sessions.id` generated server-side, returned to client for subsequent POSTs. Client **does not** generate the UUID — that way the DB row exists before any transcript row can reference it.
- `status = 'abandoned'` is used when no explicit end event arrives within some grace window (future cleanup job; not required now).
- `ip_hash` is optional — cheap privacy gesture (daily-rotating salt) if IP is used at all. Vercel forwards client IP via `x-forwarded-for` / `request.headers.get('x-real-ip')`. Could also store nothing here and rely purely on `user_agent`.

---

## Code Examples

### 1. Vercel Analytics mount (`app/layout.tsx`)

```tsx
import { Analytics } from '@vercel/analytics/next';
// ... existing imports

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${anonymousPro.variable} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

Notes:
- Import from `@vercel/analytics/next` (framework-specific subpath), **not** `@vercel/analytics/react`. [CITED: https://vercel.com/docs/analytics/package]
- Must also **enable Analytics in Vercel dashboard** (Project → Analytics → Enable). Install alone is not sufficient.
- Does not track in `next dev` — expected and documented.

### 2. Neon client helper (`lib/db.ts` — new file)

```ts
import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

// Tagged-template style: one HTTP round-trip per query, no pool.
export const sql = neon(process.env.DATABASE_URL);
```

Usage:
```ts
const [row] = await sql`
  insert into sessions (user_agent, ip_hash)
  values (${userAgent}, ${ipHash})
  returning id, started_at
`;
```

[CITED: https://neon.com/docs/serverless/serverless-driver]

### 3. Session route handler (`app/api/analytics/session/route.ts`)

```ts
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const runtime = 'nodejs'; // HTTP driver works on node; keep it simple

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const event = body.event as 'start' | 'end' | undefined;

  if (event === 'start') {
    const userAgent = (req.headers.get('user-agent') ?? '').slice(0, 512);
    const [row] = await sql<{ id: string }[]>`
      insert into sessions (user_agent)
      values (${userAgent})
      returning id
    `;
    return NextResponse.json({ sessionId: row.id });
  }

  if (event === 'end') {
    const { sessionId, durationMs, status, errorCode, errorMessage } = body;
    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
    }
    await sql`
      update sessions
      set ended_at    = now(),
          duration_ms = ${durationMs ?? null},
          status      = ${status ?? 'ended'},
          error_code  = ${errorCode ?? null},
          error_message = ${errorMessage ? String(errorMessage).slice(0, 1024) : null}
      where id = ${sessionId} and ended_at is null
    `;
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'unknown event' }, { status: 400 });
}
```

### 4. Transcript route handler (`app/api/analytics/transcript/route.ts`)

```ts
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const runtime = 'nodejs';

const MAX_TEXT = 8000; // hard cap per turn

export async function POST(req: Request) {
  const { sessionId, role, text, turnIndex } = await req.json();
  if (!sessionId || (role !== 'user' && role !== 'assistant') || typeof text !== 'string') {
    return NextResponse.json({ error: 'bad request' }, { status: 400 });
  }
  const clean = text.slice(0, MAX_TEXT);
  await sql`
    insert into transcripts (session_id, role, text, turn_index)
    values (${sessionId}, ${role}, ${clean}, ${turnIndex ?? 0})
  `;
  return NextResponse.json({ ok: true });
}
```

### 5. Client wiring (inside `useRealtimeVoice.ts`)

Sketch — actual integration belongs in plan:

```ts
const sessionIdRef = useRef<string | null>(null);
const startedAtRef = useRef<number>(0);
const turnIndexRef = useRef(0);

// After ws.onopen success (existing spot around line 307):
startedAtRef.current = Date.now();
fetch('/api/analytics/session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ event: 'start' }),
  keepalive: true,
})
  .then(r => r.json())
  .then(j => { sessionIdRef.current = j.sessionId; })
  .catch(() => { /* swallow — analytics must never break UX */ });

// In handleMessage, case 'transcript.final' — after setStatus:
if (sessionIdRef.current && text) {
  fetch('/api/analytics/transcript', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: sessionIdRef.current,
      role: 'user',
      text,
      turnIndex: turnIndexRef.current++,
    }),
    keepalive: true,
  }).catch(() => {});
}

// In case 'response.done' — BEFORE clearing responseText, snapshot the text:
const assistantText = /* read latest via ref, NOT stale closure */ '';
if (sessionIdRef.current && assistantText) {
  fetch('/api/analytics/transcript', { /* role: 'assistant', text: assistantText, ... */ });
}

// End-of-session: prefer sendBeacon via visibilitychange
useEffect(() => {
  const onHide = () => {
    if (document.visibilityState !== 'hidden') return;
    if (!sessionIdRef.current) return;
    const payload = JSON.stringify({
      event: 'end',
      sessionId: sessionIdRef.current,
      durationMs: Date.now() - startedAtRef.current,
      status: 'ended',
    });
    navigator.sendBeacon(
      '/api/analytics/session',
      new Blob([payload], { type: 'application/json' }),
    );
  };
  document.addEventListener('visibilitychange', onHide);
  window.addEventListener('pagehide', onHide); // bfcache-safe fallback
  return () => {
    document.removeEventListener('visibilitychange', onHide);
    window.removeEventListener('pagehide', onHide);
  };
}, []);
```

**Important:** capture `responseText` via ref (or the event handler's closure of the accumulated string) before `response.done` wipes it in the existing drain logic (lines 221–250 of `useRealtimeVoice.ts`). Simplest approach: maintain `const assistantBufferRef = useRef('')` that accumulates `response.text.delta` chunks, flush + clear on `response.done`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| Pageview / device tracking | Custom beacon + DB pipeline | `@vercel/analytics` |
| Postgres driver for serverless | `pg` with manual pool or raw fetch to Neon SQL over HTTP | `@neondatabase/serverless` (tagged-template) |
| UUID generation for session IDs | Client-side `crypto.randomUUID()` + trust | Server-generated via `gen_random_uuid()` (pgcrypto) — client never fabricates IDs |
| Tab-close detection | `beforeunload` / `unload` listeners | `visibilitychange === 'hidden'` + `pagehide` fallback, both with `navigator.sendBeacon` |

---

## Common Pitfalls

### 1. Mismatched Realtime API event names
**What goes wrong:** Plan references `conversation.item.input_audio_transcription.completed` from OpenAI Realtime API docs.
**Why it happens:** CONTEXT.md specifics were written from generic Realtime API knowledge.
**Reality:** our WS server emits `transcript.final` (user) and `response.text.delta` + `response.done` (assistant). See `app/hooks/useRealtimeVoice.ts:186,204,212`.
**How to avoid:** use the existing switch-cases in `handleMessage` as the tap points. Do not add new event types.

### 2. Double-counting assistant turns
**What goes wrong:** `response.done` also fires on barge-in (`event.immediate === true`, line 215) with an incomplete `responseText`. Logging on every `response.done` records mid-utterance fragments.
**How to avoid:** Record the assistant turn only when `isImmediate === false`. On barge-in, either (a) don't log, or (b) log with a `was_barged_in` boolean (schema addition) — start simple: skip.

### 3. Losing the last bit of `responseText` before flush
**What goes wrong:** Existing `response.done` handler clears `responseText` inside the `drain()` / immediate paths (lines 222, 235). If you read via `setStatus(prev => ...)` after, it's already empty.
**How to avoid:** Mirror deltas into `assistantBufferRef` (plain ref, no React timing). Flush + clear the ref atomically inside `case 'response.done'`, before the existing drain code runs.

### 4. WS auto-reconnect creates session sprawl
**What goes wrong:** The hook already auto-reconnects up to 5 times (line 327). Each `ws.onopen` could POST a new `/session` start row.
**How to avoid:** Only POST `session` start once per user-initiated `connect()`. Track via `sessionIdRef.current === null` as the gate. Reconnects don't create new analytics sessions.

### 5. Neon connection leak under Fluid Compute
**What goes wrong:** If you switch to `pg` + pool, forgetting `client.release()` leaks connections across warm invocations.
**How to avoid:** We're using the HTTP driver (`neon()` tagged template) — no pool, no leaks. If future needs push us to `pg`, follow [CITED: https://vercel.com/kb/guide/efficiently-manage-database-connection-pools-with-fluid-compute].

### 6. `sendBeacon` content-type pitfall
**What goes wrong:** `navigator.sendBeacon(url, JSON.stringify(obj))` sends as `text/plain`; Next.js `req.json()` still works but some frameworks don't.
**How to avoid:** Wrap in `new Blob([payload], { type: 'application/json' })` — preserves content-type. [CITED: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon]

### 7. Analytics failure breaking UX
**What goes wrong:** DB offline → fetch rejects → unhandled promise in voice hook → React error boundary.
**How to avoid:** every analytics fetch ends in `.catch(() => {})`. Analytics is observational; it must **never** interfere with the voice session.

---

## Vercel Marketplace → Neon Provisioning

1. Vercel dashboard → Integrations → **Neon (by Vercel)** → Add to project.
2. Integration injects env vars automatically into Production, Preview, Development:
   - `DATABASE_URL` (pooled — use this for route handlers)
   - `DATABASE_URL_UNPOOLED` (direct — use for migrations, long-running tasks)
   - Legacy: `POSTGRES_URL`, `POSTGRES_URL_NON_POOLING`, `PGHOST`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`
3. Locally: `bunx vercel link` (one-time) → `bunx vercel env pull .env.local` → vars appear in `.env.local`.
4. For schema: run the DDL once via Neon SQL console (dashboard) or `psql "$DATABASE_URL" -f schema.sql`. No migration framework needed for a two-table schema.

[CITED: https://neon.com/docs/guides/vercel-managed-integration]

---

## Environment Availability

| Dependency | Required By | Available | Notes |
|------------|------------|-----------|-------|
| Vercel hosting | `@vercel/analytics` data ingestion | ✓ | Already deployed (nim-kaleb.vercel.app) |
| Neon Postgres | transcript/session storage | ✗ (must provision) | One-click via Vercel Marketplace |
| `DATABASE_URL` env var | Route handlers at runtime | ✗ (must pull) | `bunx vercel env pull .env.local` after provisioning |
| `bunx vercel` CLI | env sync | Unknown — verify in plan | Install via `bun add -g vercel` if missing |
| `psql` (local, optional) | Viewing transcripts | Unknown | Not strictly required — Neon SQL console works in browser |

**Blocking missing:** none once Neon is provisioned.
**Non-blocking:** `psql` — Neon's web SQL editor is a fine substitute.

---

## State of the Art

| Old | Current |
|-----|---------|
| `beforeunload` / `unload` for exit analytics | `visibilitychange === 'hidden'` + `pagehide` + `sendBeacon`. `unload` breaks bfcache on Firefox. |
| `@vercel/analytics/react` import | `@vercel/analytics/next` for App Router (framework-aware route tracking) |
| `pg` Pool on serverless | HTTP driver (`@neondatabase/serverless`) for short-lived function writes; `pg` + Fluid pool only when latency or transactions demand |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Route handlers run on Vercel Node runtime (not Edge) by default in Next.js 16 for this project | Code ex. 3 | HTTP driver works on both; setting `runtime='nodejs'` explicitly eliminates the risk. |
| A2 | `response.text.delta` accumulates the full assistant message before `response.done` fires with `immediate: false` | Pitfall 2, Code ex. 5 | If server batches or omits deltas, we'd miss assistant text. Verified partially from `useRealtimeVoice.ts:204-210` — hook treats deltas as concatenation; verify against WS server code in plan phase if possible. |
| A3 | Bun WS server already sends `transcript.final` as one final utterance per user turn | Code ex. 5 | If it also sends partials we handle (line 180), we only log finals, so no dup risk. |

---

## Open Questions

1. **Should failed analytics writes be retried?**
   - What we know: analytics is observational; UX is sacrosanct.
   - Recommendation: no retries. One fetch attempt, swallow error. If this becomes a reliability issue, add a background queue later.

2. **IP hashing — include or skip?**
   - What we know: user wants silent logging but no consent UI exists.
   - Recommendation: skip `ip_hash` entirely for v1. `user_agent` + timestamp is enough for sanity. Reduces privacy surface.

3. **Do we log `session.start` failures?**
   - What we know: if the `/session` POST fails, we have no `sessionId` so subsequent transcript POSTs silently skip.
   - Recommendation: accept the gap. The same session's Vercel Analytics pageview still captures the visit; we lose only the voice-session detail.

---

## Sources

### Primary (HIGH)
- https://vercel.com/docs/analytics/package — @vercel/analytics setup for Next.js App Router
- https://vercel.com/docs/analytics/quickstart — dashboard enable flow
- https://neon.com/docs/serverless/serverless-driver — driver API, tagged template usage
- https://neon.com/docs/guides/vercel-managed-integration — marketplace env var injection
- https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon — current MDN guidance
- `app/hooks/useRealtimeVoice.ts` (this repo) — actual event names from the WS server
- `bun pm view @vercel/analytics version` → `2.0.1` (verified 2026-04-21)
- `bun pm view @neondatabase/serverless version` → `1.1.0` (verified 2026-04-21)

### Secondary (MEDIUM)
- https://vercel.com/kb/guide/efficiently-manage-database-connection-pools-with-fluid-compute — `pg` + pool tradeoffs for Fluid
- https://github.com/neondatabase/serverless — driver README, HTTP vs WS transport

## Metadata

**Confidence breakdown:**
- Library versions + install: HIGH (verified against bun pm view today)
- Neon integration + env vars: HIGH (official docs + Vercel KB)
- Voice-pipeline hook points: HIGH (read directly from source in this repo)
- Schema design: MEDIUM (Claude's discretion — unopinionated choice, easily reversible)
- `sendBeacon` + visibilitychange pattern: HIGH (MDN current best-practice)

**Research date:** 2026-04-21
**Valid until:** 2026-05-21 (stable stack; Neon/Vercel release cadence is slow enough)
