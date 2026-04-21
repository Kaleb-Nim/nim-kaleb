---
name: Quick Task 260421-l3f Context
quick_id: 260421-l3f
status: ready-for-planning
gathered: 2026-04-21
---

# Quick Task 260421-l3f: Web Analytics — Context

<domain>
## Task Boundary

Add web analytics to the portfolio site covering:
1. **Traffic**: visitor/session/pageview counts
2. **Voice session lifecycle**: connect, disconnect, duration, errors
3. **Transcripts**: ASR (user speech → text) and AI responses (assistant text output)

Out of scope: admin dashboard UI, menu/UI interaction tracking, consent flow, analytics-driven product features.

</domain>

<decisions>
## Implementation Decisions

### Storage
- **Vercel Marketplace → Neon Postgres** for structured event storage (sessions, transcripts). Chosen over Blob/Redis because transcripts need to be queryable by session and time.
- Plan must include Neon provisioning instructions (run `/vercel:marketplace` or provision via dashboard; `vercel env pull` to sync `DATABASE_URL`).

### Page Analytics
- **Vercel Web Analytics** (`@vercel/analytics`) for visitors/pageviews/device breakdown. Zero-config, privacy-friendly, native to Vercel.
- Installed via `bun add @vercel/analytics`, mounted in `app/layout.tsx`.

### Dashboard / Viewing
- **No in-app dashboard.** View data via:
  - Vercel Web Analytics UI (traffic)
  - Neon SQL console / `psql` for transcripts and session events
- No `/admin` route, no API viewing endpoint — keep surface area small for this iteration.

### Captured Voice-Session Data
- Session lifecycle events: `connect`, `disconnect`, duration, error (with code/message)
- ASR user transcripts (each finalized user utterance)
- AI response transcripts (each finalized assistant text turn)
- **Not captured:** menu/command input events, click tracking

### Privacy
- **Silent logging** — no disclosure notice in the UI. User explicitly accepted this tradeoff.
- No consent checkbox, no opt-out.

### Claude's Discretion
- Schema design for Postgres tables (sessions, transcripts) — pick a clean schema that supports future admin UI without locking in today.
- Where in the voice pipeline to hook transcript capture (prefer `app/hooks/useRealtimeVoice.ts` events already streamed from Realtime API).
- Logging transport from browser → server: prefer a small `POST /api/analytics/event` proxy over exposing DB creds client-side.
- Rate limiting / abuse protection: minimal — basic input length caps are fine; skip auth.

</decisions>

<specifics>
## Specific Ideas

- Vercel Web Analytics: `<Analytics />` component from `@vercel/analytics/next` mounted in `app/layout.tsx`.
- Neon Postgres driver: `@neondatabase/serverless` (works on Vercel Functions / Fluid Compute).
- Proposed tables:
  - `sessions(id uuid pk, started_at, ended_at, duration_ms, status, error_code, error_message, user_agent, ip_hash)`
  - `transcripts(id uuid pk, session_id fk, turn_index, role ('user'|'assistant'), text, created_at)`
- Server endpoints: `POST /api/analytics/session` (start/end), `POST /api/analytics/transcript` (append turn).
- Client hook tap points (existing code in `app/hooks/useRealtimeVoice.ts`):
  - `connect()` success → POST session start
  - `disconnect()` / error → POST session end
  - Realtime API `response.audio_transcript.done` / `conversation.item.input_audio_transcription.completed` → POST transcript turn

</specifics>

<canonical_refs>
## Canonical References

- `@/CLAUDE.md` — project conventions (Bun, CSS modules, ESLint rules)
- Vercel AI SDK and Marketplace docs — fetch via Context7 during research/planning
- Existing file: `app/hooks/useRealtimeVoice.ts` — canonical integration point for transcripts
- Existing file: `app/api/realtime/session/route.ts` — reference for server-side API route pattern

</canonical_refs>
