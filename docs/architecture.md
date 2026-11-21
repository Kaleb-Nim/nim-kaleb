# Architecture

Durable notes on how the system fits together. Salvaged from the GSD codebase map (`.planning/codebase/`, last refreshed 2026-07-27) when planning moved to GitHub Issues. The full original map is at git tag `pre-wayfinder`. Terms follow [GLOSSARY.md](../GLOSSARY.md).

## Shape

Two deployables and three managed services:

```text
Browser ──https──▶ Next.js app (Vercel)          ──POST──▶ /api/analytics/* ──▶ Neon Postgres
   │
   └──wss──▶ ws-server (Bun, Alibaba Cloud ECS, Singapore)
                 ├─ws──▶ DashScope ASR   (qwen3-asr-flash-realtime, 16 kHz PCM in)
                 ├─http▶ DashScope LLM   (qwen-plus, OpenAI-compatible mode, streamed)
                 └─ws──▶ DashScope TTS   (qwen3-tts-vc-realtime, 24 kHz PCM out, cloned voice)
```

- **Frontend**: Next.js 16 App Router, React 19, TypeScript, Tailwind 4. Production at `nim-kaleb.vercel.app` / `kalebnim.dev`. It is a single page; sections are switched with a hash router (`app/hooks/useHashRoute.ts`), not App Router routes.
- **ws-server** (`ws-server/src/`): one `Session` per WebSocket connection, stored in Bun's `ws.data`. No state is shared across sessions. Endpoints: `/ws` (upgrade) and `/health`. Production at `wss://ws.kalebnim.dev`; local default `ws://localhost:8080`.
- **Analytics**: optional. `lib/schema.ts` (Drizzle) defines `sessions` and `transcripts` in Neon. If `DATABASE_URL` is unset the endpoints return 503 and the browser ignores the failure.
- `.vercelignore` keeps `ws-server/`, `tts-server/`, tests and scripts out of the Vercel build.

## Voice turn, end to end

1. `app/hooks/useRealtimeVoice.ts` captures the mic, downsamples to 16 kHz mono PCM16 and sends base64 `audio.append` frames.
2. `Session` forwards audio to the ASR socket. Server VAD (about 1 s of silence) ends the utterance and yields `transcript.final`.
3. `startResponse()` streams the LLM reply with the system prompt and history. Text is flushed to TTS on sentence boundaries or every 80 characters.
4. TTS runs in `server_commit` mode and returns 24 kHz PCM deltas, which go to the browser as `response.audio.delta`.
5. The browser schedules each chunk back to back on a separate 24 kHz playback `AudioContext` (`nextPlayTimeRef`).
6. Latency per turn (ASR time, LLM TTFT, TTS time to first audio, total) is written as NDJSON by `ws-server/src/logger.ts` to `LOG_DIR` (default `~/.local/share/kaleb-voice/logs/`).

On connect the server speaks the greeting first. On barge-in it aborts the in-flight LLM and TTS work through an `AbortController` and sends `response.done` with `immediate: true`. The browser then bumps `playGenRef` so stale deltas are ignored.

## WebSocket protocol

Messages are a type-discriminated JSON union, validated by `isValidBrowserMessage()` in `ws-server/src/types.ts`.

- Browser → server: `session.start`, `audio.append {data}`, `audio.end` (received, but not acted on yet; server VAD decides end of speech).
- Server → browser: `session.ready`, `transcript.partial`, `transcript.final`, `response.text.delta`, `response.audio.delta`, `response.done`, `error`.

## Invariants worth keeping

- **Secrets stay server-side.** `DASHSCOPE_API_KEY` and `DASHSCOPE_VOICE_ID` live only in the ws-server environment, never in `NEXT_PUBLIC_*`.
- **Sample rates are fixed by the providers:** 16 kHz in (ASR), 24 kHz out (TTS). That is why the browser uses two AudioContexts.
- **History is bounded** at 20 entries per session, and the oldest pair is evicted first.
- **Analytics never blocks voice.** Every analytics write is fire-and-forget.
- **Only the final TTS `response.done` counts.** In `server_commit` mode DashScope emits `response.done` after every auto-committed segment; the session forwards it only after `session.finish` has been sent (the `finishing` flag in `ws-server/src/dashscope/tts.ts`).
- **Let queued audio drain.** The browser must wait for scheduled audio to finish playing before it tears down the playback context on `response.done`. Closing the context straight away cut replies off mid-sentence (see [known issues](known-issues.md)).

## Where the voice clone's knowledge comes from

The LLM's only knowledge source is `prompts/system-prompt.md`, read once at ws-server startup. `bun run sync-context` (`scripts/sync-context.ts`) extracts structured fields from `memory/raw/information.txt` into `memory/context.json`; nothing in the ws-server reads that file today. Site content in `app/lib/sections.ts` and `app/data/hackathons.json` is not wired into the prompt automatically.

## Decisions that still hold

| Decision | Why |
| --- | --- |
| Cascade (ASR → LLM → TTS) over the OpenAI Realtime API | Full control of each stage, and voice cloning through Qwen3-TTS. The OpenAI route was deleted in July 2026. |
| A document in the prompt instead of RAG | A portfolio is small enough to fit in context. |
| Hash router over App Router routes | Keeps the site a single page while giving every section a deep link. |
| Greet first on connect | The visitor hears Kaleb straight away instead of facing a silent mic. |
| ws-server on Alibaba Cloud ECS, not Vercel | It needs long-lived sockets near DashScope (Singapore). |

The constraints "Alibaba only for the voice pipeline" and "terminal UI must stay intact" were lifted by the portfolio-revamp map (#5).
