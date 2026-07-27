# External Integrations

**Analysis Date:** 2026-07-27

## APIs & External Services

**Alibaba Cloud DashScope (Voice Pipeline):**
- Speech-to-Text (ASR): `qwen3-asr-flash-realtime` model
  - WebSocket: `wss://dashscope-intl.aliyuncs.com/api-ws/v1/realtime?model=qwen3-asr-flash-realtime`
  - SDK/Client: WebSocket (native, Bun server-side)
  - Auth: `DASHSCOPE_API_KEY` (server-side secret, never exposed to browser)
  - Input: PCM16 16kHz mono audio
  - Output: Real-time transcription with server VAD
  - Implementation: `ws-server/src/dashscope/asr.ts`

- Large Language Model (LLM): `qwen-plus` model via OpenAI-compatible API
  - Endpoint: `https://dashscope-intl.aliyuncs.com/compatible-mode/v1` (OpenAI-compatible)
  - SDK/Client: `openai` npm package (configured with DashScope base URL)
  - Auth: `DASHSCOPE_API_KEY` (server-side secret)
  - Input: Chat completion messages with system prompt + conversation history
  - Output: Streaming text responses with sentence-level chunking
  - Implementation: `ws-server/src/dashscope/llm.ts`
  - System Prompt: Loaded from `prompts/system-prompt.md`

- Text-to-Speech (TTS): `qwen3-tts-vc-realtime-2026-01-15` model with voice cloning
  - WebSocket: `wss://dashscope-intl.aliyuncs.com/api-ws/v1/realtime?model=qwen3-tts-vc-realtime-2026-01-15`
  - SDK/Client: WebSocket (native, Bun server-side)
  - Auth: `DASHSCOPE_API_KEY` (server-side secret)
  - Voice: `DASHSCOPE_VOICE_ID` (server-side secret, Kaleb's cloned voice)
  - Input: Text chunks for synthesis
  - Output: PCM audio at 24kHz sample rate (base64-encoded)
  - Mode: `server_commit` (auto-commits segments for low-latency playback)
  - Implementation: `ws-server/src/dashscope/tts.ts`

## Data Storage

**Databases:**
- PostgreSQL (Neon serverless)
  - Connection: `DATABASE_URL` env var (server-side secret)
  - Client: `@neondatabase/serverless` (HTTP-based connection)
  - ORM: drizzle-orm with TypeScript schema
  - Tables:
    - `sessions` - User session metadata (startedAt, endedAt, durationMs, status, errorCode, errorMessage, userAgent)
    - `transcripts` - Conversation turns (sessionId, turnIndex, role, text, createdAt)
  - Indexes: `sessions_started_at_idx` (for analytics queries), `transcripts_session_created_idx` (for conversation replay)
  - Schema: `lib/schema.ts`
  - Migrations: Auto-managed by drizzle-kit, stored in `drizzle/` directory

**File Storage:**
- Local filesystem only (no cloud file storage)
  - Server logs: `~/.local/share/kaleb-voice/logs/` (configurable via `LOG_DIR` env var)

**Caching:**
- None (stateless microservice architecture)

## Authentication & Identity

**Auth Provider:**
- Custom (none) - This is a public portfolio with no user authentication
- Session tracking: UUID-based session IDs generated server-side
- Browser-to-server: Anonymous WebSocket connections via `NEXT_PUBLIC_WS_SERVER_URL`
- Server-to-DashScope: API key-based authentication (`DASHSCOPE_API_KEY`)

## Monitoring & Observability

**Error Tracking:**
- None (no external error tracking service)

**Logs:**
- Server logs: Console output to stdout (captured by ECS/Kubernetes container runtime)
- Session logs: Structured JSON files written to `~/.local/share/kaleb-voice/logs/` for debugging
  - Implementation: `ws-server/src/logger.ts`
- Analytics database: Transcript and session events stored in PostgreSQL for analysis

## CI/CD & Deployment

**Hosting:**
- Frontend: Vercel (nim-kaleb.vercel.app)
  - Deployment: Next.js App Router with Node.js runtime
  - Analytics: Vercel Web Analytics SDK integration
  - Environment: Managed by Vercel dashboard

- WebSocket Server: Amazon ECS (Bun runtime)
  - Hostname: wss://ws.kalebnim.dev (production)
  - Default development: ws://localhost:8080
  - Runtime: Bun compiled binary
  - Build: `bun build --target=bun src/index.ts --outdir=dist`
  - Health check endpoint: GET /health

**CI Pipeline:**
- Not detected (manual deployment or git-hook based)

## Environment Configuration

**Required env vars (Frontend - Next.js):**
- `NEXT_PUBLIC_WS_SERVER_URL` - WebSocket server URL (browser connects here)
  - Development default: `ws://localhost:8080`
  - Production: `wss://ws.kalebnim.dev`
- `DATABASE_URL` - Neon PostgreSQL connection string (optional, analytics disabled if unset)
- `OPENAI_API_KEY` - Unused (legacy, can be removed)

**Required env vars (Backend - ws-server):**
- `DASHSCOPE_API_KEY` - Alibaba Cloud API key for DashScope (ASR, LLM, TTS)
- `DASHSCOPE_VOICE_ID` - Voice ID for Kaleb's cloned voice (TTS)
- `PORT` - Server port (default: 8080)
- `LOG_DIR` - Server log directory (default: `~/.local/share/kaleb-voice/logs/`)
- `HOME` - Home directory for log path resolution

**Secrets location:**
- Frontend: Vercel environment variables (managed in dashboard)
- Backend: AWS Secrets Manager or ECS task definition (managed via infrastructure)
- Development: `.env.local` file (git-ignored)

## Webhooks & Callbacks

**Incoming:**
- None (this is a synchronous voice conversation system, not event-driven)

**Outgoing:**
- POST `/api/analytics/session` - Frontend fires when session starts/ends
  - Body: `{ event: 'start' | 'end', sessionId?, durationMs?, status?, errorCode?, errorMessage? }`
  - Response: `{ sessionId: string }` on start, `{ ok: true }` on end
- POST `/api/analytics/transcript` - Frontend fires on each conversation turn
  - Body: `{ sessionId: string, role: 'user' | 'assistant', text: string, turnIndex: number }`
  - Response: `{ ok: true }`

## WebSocket Communication Protocol

**Browser ↔ ws-server (WebSocket):**
- Endpoint: `NEXT_PUBLIC_WS_SERVER_URL/ws` (upgraded via HTTP POST)
- Session ID: Generated server-side, included in URL query or WebSocket data

**Message Types (Browser → Server):**
- `{ type: 'session.start' }` - Initialize the three-way DashScope pipeline
- `{ type: 'audio.append', data: string }` - Base64-encoded PCM16 audio chunk
- `{ type: 'audio.end' }` - Signal end-of-speech (triggers VAD finalization)

**Message Types (Server → Browser):**
- `{ type: 'transcript.partial', text: string }` - Interim ASR transcription
- `{ type: 'transcript.final', text: string }` - Final ASR transcription
- `{ type: 'response.audio.delta', data: string }` - Base64-encoded TTS audio chunk
- `{ type: 'response.text.delta', text: string }` - LLM response text (streamed)
- `{ type: 'response.done' }` - Signal end of LLM response
- `{ type: 'error', message: string }` - Error notification

## Audio Formats

**Microphone Input:**
- Sample rate: 16000 Hz (16 kHz)
- Encoding: PCM16 (16-bit signed)
- Channels: Mono
- Frame size: Variable (chunks sent as received)
- Encoding transport: Base64-encoded JSON messages over WebSocket

**TTS Output:**
- Sample rate: 24000 Hz (24 kHz)
- Encoding: PCM16 (16-bit signed)
- Channels: Mono
- Encoding transport: Base64-encoded in `response.audio.delta` messages

---

*Integration audit: 2026-07-27*
