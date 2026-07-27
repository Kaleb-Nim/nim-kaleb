<!-- refreshed: 2026-07-27 -->
# Architecture

**Analysis Date:** 2026-07-27

## System Overview

```text
┌─────────────────────────────────────────────────────────────┐
│              Browser Client (Vercel)                         │
│  Next.js 16 + React 19 + Tailwind 4                          │
│  - Terminal UI frame with multi-section pages                │
│  - Hash-based routing (#/section-id)                         │
│  - FloatingMic + VoiceOverlay for voice activation           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ WebSocket connection to
                       │ NEXT_PUBLIC_WS_SERVER_URL
                       │
┌──────────────────────▼──────────────────────────────────────┐
│          WebSocket Server (Alibaba ECS, Singapore)           │
│  Bun Runtime + OpenAI SDK                                    │
│  - Receives audio.append (16kHz PCM from browser mic)        │
│  - Orchestrates voice pipeline (ASR → LLM → TTS)            │
│  - Sends back transcripts + response audio deltas            │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
   Qwen3-ASR    qwen-plus LLM   Qwen3-TTS-VC
   (DashScope)  (DashScope)   (DashScope)
   Real-time    REST API      Real-time with
   WebSocket    streaming     voice cloning
   (16kHz in)   (text)        (24kHz out)

        │              │              │
        └──────────────┼──────────────┘
                       │
                       ▼
           Response relayed to browser
           (transcripts + audio deltas)
           Analytics posted to Next.js API
           (app/api/analytics/*)
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Frontend App | Multi-section terminal UI, hash routing, voice overlay control | `app/page.tsx` |
| Voice Connection | WebSocket management, audio I/O, session lifecycle | `app/hooks/useRealtimeVoice.ts` |
| Hash Router | URL-to-section mapping, navigation state | `app/hooks/useHashRoute.ts` |
| WebSocket Server | Session orchestration, DashScope pipeline coordination | `ws-server/src/index.ts`, `ws-server/src/session.ts` |
| ASR Integration | Speech-to-text via DashScope Qwen3 | `ws-server/src/dashscope/asr.ts` |
| LLM Integration | Conversational reasoning via qwen-plus | `ws-server/src/dashscope/llm.ts` |
| TTS Integration | Voice synthesis with Kaleb's voice clone | `ws-server/src/dashscope/tts.ts` |
| Analytics API | Session tracking and transcript logging | `app/api/analytics/session/route.ts`, `app/api/analytics/transcript/route.ts` |

## Pattern Overview

**Overall:** Two-service distributed architecture with async voice pipeline orchestration.

**Key Characteristics:**
- WebSocket-based real-time bidirectional communication (browser ↔ ws-server)
- Server-side secrets management (DashScope API keys never reach browser)
- Streaming audio/text for low-latency voice interactions
- Optional analytics persistence (graceful degradation if DATABASE_URL unset)
- Hash-based SPA routing for multi-section navigation
- Canvas-based starfield visual layer with React terminal UI overlay

## Layers

**Browser Client Layer:**
- Purpose: Render multi-section terminal UI, capture user input, manage voice overlay
- Location: `app/`
- Contains: React components, hooks, Next.js pages and API routes
- Depends on: WebSocket server, Web Audio API, Neon database (optional)
- Used by: Web browsers via Vercel CDN

**WebSocket Server Layer:**
- Purpose: Coordinate DashScope voice pipeline, maintain session state, route audio/text
- Location: `ws-server/src/`
- Contains: Bun HTTP/WebSocket server, DashScope client libraries, session manager
- Depends on: OpenAI SDK (for DashScope compatible-mode API), DashScope cloud service
- Used by: Browser clients via `NEXT_PUBLIC_WS_SERVER_URL`

**DashScope Integration Layer:**
- Purpose: Abstract DashScope ASR, LLM, and TTS APIs behind unified interfaces
- Location: `ws-server/src/dashscope/`
- Contains: Three WebSocket clients (ASR, TTS) and one REST client (LLM compatible-mode)
- Depends on: Alibaba Cloud DashScope services, OpenAI SDK
- Used by: Session orchestrator in ws-server

**Data Persistence Layer:**
- Purpose: Store analytics events (session lifecycle, conversation transcripts)
- Location: `lib/db.ts`, `lib/schema.ts`, `app/api/analytics/`
- Contains: Drizzle ORM, Neon Postgres schema, analytics endpoints
- Depends on: Neon Postgres (optional, fire-and-forget if unavailable)
- Used by: Browser client and ws-server for async logging

## Data Flow

### Primary Voice Interaction Path

1. **User Speech Capture** (`app/components/FloatingMic.tsx` → `app/hooks/useRealtimeVoice.ts`)
   - `getUserMedia()` requests microphone access (16kHz mono PCM)
   - Audio captured via ScriptProcessorNode
   - Frames downsampled if necessary and base64-encoded

2. **Audio Transmission** (`app/hooks/useRealtimeVoice.ts` → `ws-server/src/index.ts`)
   - Browser sends `audio.append` messages with PCM16 chunks to WebSocket
   - Server receives message at `/ws` endpoint

3. **Session Handling** (`ws-server/src/session.ts`)
   - Session.handleAudio() routes audio to active ASR WebSocket
   - ASR processes audio and emits transcript events

4. **Transcript Handling** (`ws-server/src/session.ts` → `ws-server/src/dashscope/llm.ts`)
   - On `transcript.final`, session triggers startResponse()
   - LLM streaming begins with conversation history context

5. **LLM Streaming** (`ws-server/src/dashscope/llm.ts`)
   - Queries qwen-plus with system prompt + conversation history
   - Streams response text in chunks, flushed on sentence boundaries or 80 chars

6. **TTS Synthesis** (`ws-server/src/dashscope/tts.ts`)
   - Each LLM text chunk fed to TTS WebSocket in server_commit mode
   - TTS returns 24kHz PCM audio deltas
   - Server relays audio back to browser via `response.audio.delta` messages

7. **Audio Playback** (`app/hooks/useRealtimeVoice.ts`)
   - Browser receives audio deltas, converts from base64 to PCM16
   - Schedules playback via Web Audio API using nextPlayTimeRef for gapless playback
   - User hears Kaleb's voice in real-time as LLM streams

8. **Analytics Logging** (`app/hooks/useRealtimeVoice.ts` → `app/api/analytics/*`)
   - Browser fire-and-forget POSTs transcripts to analytics API
   - Websocket server logs latency metrics (ASR, LLM TTFT, TTS TTFA) to logger
   - Optional: endpoints return 503 if DATABASE_URL not configured

### Multi-Turn Conversation State

- `Session.conversationHistory` capped at 20 entries (10 user, 10 assistant turns)
- History maintained across voice session lifetime
- On new transcript, prior context passed to LLM for coherent responses
- Barge-in triggers `AbortController` to cancel in-flight LLM+TTS and restart

### Navigation and Page Rendering

1. **Hash Change Detection** (`app/hooks/useHashRoute.ts`)
   - Window `hashchange` event fires when URL hash changes
   - `useHashRoute()` extracts first segment (e.g., `#/work-experience` → `'work-experience'`)
   - `useHashSubRoute()` extracts second segment for detail views

2. **Section Resolution** (`app/lib/sections.ts`)
   - `resolveSection(route)` matches route against SECTIONS array by `id` or `aliases`
   - Returns matched section object with title, items, metadata

3. **Page Component Selection** (`app/page.tsx`)
   - HomePage for empty route
   - WorkPage, MeetupsPage, HackathonsPage, ProductsPage, StubSectionPage, etc. based on section
   - Detail views (HackathonLinksPage, ProductDetail) render if subRoute present

**State Management:**
- Voice connection state: `useRealtimeVoice()` hook manages status (idle, connecting, listening, responding, error)
- Navigation state: `useHashRoute()` hook manages current section from URL hash
- Voice overlay visibility: `voiceOpen` state in root `app/page.tsx`
- Typewriter animation: `useTypewriter()` hook for character-by-character reveals (legacy, less used in multi-page views)

## Key Abstractions

**WebSocket Message Protocol:**
- Purpose: Encapsulate bidirectional communication between browser and ws-server
- Examples:
  - Browser → Server: `{ type: 'session.start' }`, `{ type: 'audio.append', data: '...' }`, `{ type: 'audio.end' }`
  - Server → Browser: `{ type: 'session.ready' }`, `{ type: 'transcript.partial', text: '...' }`, `{ type: 'response.audio.delta', delta: '...' }`, `{ type: 'response.text.delta', delta: '...' }`, `{ type: 'error', message: '...' }`
- Pattern: Type-discriminated union for all messages

**Voice Pipeline Orchestration:**
- Purpose: Coordinate three separate WebSocket clients (ASR, TTS) and one REST client (LLM) as a cohesive voice interaction
- Examples: Session.startResponse(), scheduleAudioChunk()
- Pattern: Callback-driven event emission and AbortController for cancellation

**DashScope Service Clients:**
- Purpose: Hide implementation details of three separate DashScope APIs behind callback-based interfaces
- Examples: `createAsrSession()`, `streamLlmResponse()`, `createTtsSession()`
- Pattern: Factory functions returning promises or WebSocket handles

**Hash-Based SPA Routing:**
- Purpose: Enable deep-linkable section navigation without full page reloads
- Examples: `navigateTo('products')` → `#/products`, `#/hackathons/arcademy-xyz` → detail view
- Pattern: URL fragment parsing and React state synchronization

## Entry Points

**Frontend Entry Point:**
- Location: `app/page.tsx`
- Triggers: Next.js router on page load or navigation to `/`
- Responsibilities:
  - Render Starfield + Terminal components
  - Initialize voice hook and attach to FloatingMic/VoiceOverlay
  - Manage hash routing and page section selection
  - Coordinate voice overlay visibility with WebSocket connection lifecycle

**WebSocket Server Entry Point:**
- Location: `ws-server/src/index.ts`
- Triggers: HTTP request to `wss://ws.kalebnim.dev/ws` (or configured `NEXT_PUBLIC_WS_SERVER_URL`)
- Responsibilities:
  - Accept WebSocket upgrade from browser client
  - Create Session instance for each connection
  - Route incoming messages to session handler
  - Clean up resources on disconnect
  - Health check endpoint at `/health`

**Analytics API Routes:**
- Location: `app/api/analytics/session/route.ts`, `app/api/analytics/transcript/route.ts`
- Triggers: POST from browser or ws-server with analytics events
- Responsibilities:
  - Insert session start events → create UUID
  - Update session end events with duration, status, errors
  - Insert turn-level transcripts (role, text, timestamp)
  - Return 503 if DATABASE_URL not configured

## Architectural Constraints

- **Threading:** Bun event loop (single-threaded async). Audio processing via Web Audio API (separate from JS thread). Multiple concurrent WebSocket sessions handled via Bun's per-connection data slots.
- **Global state:** Session instances stored in Bun WebSocket `ws.data` slot (one per connection). DashScope clients instantiated per session. No shared global state across sessions (isolation).
- **Circular imports:** None detected. Module dependency graph is acyclic.
- **Audio sample rates:** Browser mic captured at 16kHz (ASR requirement), downsampled if system default differs. TTS output at 24kHz (DashScope TTS requirement), playback via separate AudioContext.
- **Message size:** PCM16 audio chunks base64-encoded and sent as JSON. Browser receives ~40KB chunks per 250ms at 16kHz (base64 expands by 33%).
- **Connection lifecycle:** Barge-in (new user utterance during assistant response) cancels in-flight LLM+TTS, cleans up audio, sends immediate `response.done`.

## Anti-Patterns

### WebSocket Reconnection Without Cleanup

**What happens:** If browser closes overlay while connect() is still awaiting async operations, old WebSocket and AudioContext may leak.
**Why it's wrong:** Multiple concurrent voice sessions would drain system resources and interfere with audio capture.
**Do this instead:** `cancelledRef` flag in `useRealtimeVoice` checked after each await; disconnect() sets flag to cancel in-flight connect() chains. Overlay toggle drives explicit connect/disconnect (lines 33-42 in `app/page.tsx`).

### Raw Microphone Stream Forwarding

**What happens:** If audio frames sent without proper sample rate matching or base64 encoding, ASR server rejects or misinterprets.
**Why it's wrong:** ASR expects exactly 16kHz mono PCM16; browser captures at system default (often 48kHz).
**Do this instead:** Downsample() function in `useRealtimeVoice` ensures 16kHz output; float32ToPcm16Base64() encodes properly for JSON transmission.

### Unbounded Conversation History

**What happens:** LLM context window grows indefinitely, LLM latency increases, token costs explode.
**Why it's wrong:** Multi-turn conversations can become very long; context bloat degrades UX.
**Do this instead:** Session.conversationHistory capped at 20 entries (line 17 in `ws-server/src/session.ts`); oldest turns evicted when limit exceeded.

### Skipping Analytics Gracefully

**What happens:** If DATABASE_URL unset, analytics endpoints crash the request with an error.
**Why it's wrong:** Analytics should never block voice interaction; feature should degrade silently.
**Do this instead:** isDbConfigured flag gates all database access; endpoints return 503 before touching sql if unset. Browser hook wraps analytics POSTs in `.catch(() => {})` (line 79 in `useRealtimeVoice`).

## Error Handling

**Strategy:** Try-catch at boundaries; state transitions to error phase; user-facing error messages propagated via WebSocket.

**Patterns:**
- Microphone access denial → getUserMediaErrorMessage() maps DOMException names to friendly UI text
- WebSocket connection failure → connect() catches and sets phase: 'error'
- DashScope API errors → ASR/LLM/TTS callbacks emit onError → session sends error message to browser
- JSON parsing failures → Session.handleMessage() catches and ignores (no cascade)
- Fetch failures in analytics → postAnalytics() wraps in `.catch(() => {})` to prevent crashes
- Abort signals → streamLlmResponse() checks signal.aborted after each await; barge-in AbortController short-circuits in-flight operations

## Cross-Cutting Concerns

**Logging:** Browser uses labeled console.log in test files (e.g., `[session]`, `[stt]`, `[round-trip]`). Websocket server uses console.log with `[ws]`, `[asr]`, `[llm]`, `[tts]` prefixes. Latency metrics logged via logTurn() to `logger.ts`.

**Validation:** 
- WebSocket messages validated via isValidBrowserMessage() type guard (discriminates on `type` field)
- Analytics endpoints validate UUIDs against UUID_RE regex before database operations
- Analytics text fields trimmed to MAX_TEXT (8000 chars for transcripts, 1024 for error messages)
- Microphone error names checked against known DOMException cases

**Authentication:** 
- DashScope API key stored server-side in `process.env.DASHSCOPE_API_KEY` (never sent to browser)
- TTS voice_id stored server-side in `process.env.DASHSCOPE_VOICE_ID` (immutable, security: T-02-08)
- Browser clients identified by session UUID from ws-server; analytics keyed by sessionId

**Resource Cleanup:**
- useEffect cleanup functions remove window event listeners
- WebSocket cleanup on disconnect: wsRef.current = null, audio contexts closed, mic tracks stopped
- TTS session finishTtsSession() sends explicit session.finish to DashScope before closing
- AbortController signals prevent callbacks after resource cleanup

---

*Architecture analysis: 2026-07-27*
