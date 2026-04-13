# Architecture Research

**Domain:** Real-time voice AI pipeline — cascading STT + LLM + TTS with voice cloning on Alibaba Cloud / DashScope
**Researched:** 2026-04-09
**Confidence:** MEDIUM-HIGH (DashScope WebSocket APIs verified via official docs; Vercel WebSocket constraint verified; latency patterns from multiple authoritative sources)

---

## Standard Architecture

### System Overview

The target system replaces a single OpenAI WebSocket session (which handled STT + LLM + TTS together) with three coordinated Alibaba Cloud services orchestrated server-side:

```
┌─────────────────────────────────────────────────────────────────────┐
│  BROWSER (Client)                                                   │
│                                                                     │
│  ┌─────────────┐   PCM16 audio   ┌──────────────────────────────┐  │
│  │  Microphone  │ ──────────────► │  useRealtimeVoice (hook)     │  │
│  │  (Web Audio) │                 │  - AudioContext              │  │
│  └─────────────┘                 │  - ScriptProcessorNode (VAD) │  │
│                                  │  - WebSocket client          │  │
│  ┌─────────────┐   base64 PCM16  └────────────┬─────────────────┘  │
│  │  Waveform   │ ◄─ audio chunks               │ WebSocket           │
│  │  Visualizer │    (playback)                  │ to Next.js server  │
│  └─────────────┘                               │                    │
└───────────────────────────────────────────────►│◄───────────────────┘
                                                  │
┌─────────────────────────────────────────────────▼───────────────────┐
│  NEXT.JS SERVER (Vercel — Custom Server or Separate Node process)   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  WebSocket Bridge / Orchestrator  (app/api/voice/ws)         │  │
│  │                                                              │  │
│  │  1. Receive PCM16 audio chunks from client                   │  │
│  │  2. Stream to DashScope STT WebSocket (Paraformer)           │  │
│  │  3. Receive transcript → call Qwen LLM (HTTP stream)        │  │
│  │  4. Stream LLM tokens → DashScope TTS WebSocket             │  │
│  │  5. Stream TTS audio chunks back to client                   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────────┐ │
│  │  /api/voice/ │  │  /api/voice/ │  │  /api/voice/clone         │ │
│  │  ws          │  │  session     │  │  (one-time setup)          │ │
│  │  (main loop) │  │  (init info) │  │  enrolls voice profile     │ │
│  └──────────────┘  └──────────────┘  └───────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                          │                │               │
          ┌───────────────┘    ┌───────────┘   ┌──────────┘
          ▼                    ▼               ▼
┌──────────────────┐  ┌────────────────┐  ┌────────────────────────┐
│  DashScope STT   │  │  Qwen LLM      │  │  DashScope TTS         │
│  (Paraformer-    │  │  (qwen-max or  │  │  (qwen3-tts-vc-        │
│  realtime-v2)    │  │  qwen-plus)    │  │  realtime-* model)     │
│                  │  │                │  │                         │
│  WebSocket:      │  │  HTTP SSE:     │  │  WebSocket:            │
│  wss://dash-     │  │  /compatible/  │  │  wss://dashscope-intl  │
│  scope-intl...   │  │  chat/         │  │  .aliyuncs.com/        │
│  /api-ws/v1/     │  │  completions   │  │  api-ws/v1/realtime    │
│  realtime        │  │  (stream:true) │  │                         │
└──────────────────┘  └────────────────┘  └────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Boundary |
|-----------|----------------|----------|
| `useRealtimeVoice` (browser hook) | Capture mic audio, encode PCM16, send to server WS; receive TTS audio chunks, schedule playback via AudioContext; drive UI phase state | Owns all browser-side audio I/O |
| Next.js WS Orchestrator (`/api/voice/ws`) | Bridge: forward audio to STT, handle transcript events, call LLM, forward tokens to TTS, return audio to client | Owns all DashScope credential use and pipeline sequencing |
| DashScope STT (Paraformer-realtime-v2) | Bidirectional WebSocket: receives PCM16 binary frames, returns JSON transcript events with VAD detection | External service — WebSocket persistent connection |
| Qwen LLM (qwen-max / qwen-plus) | HTTP streaming chat completions: receives full transcript + system prompt, returns token stream | External service — standard OpenAI-compatible API |
| DashScope TTS (qwen3-tts-vc-realtime) | Bidirectional WebSocket: receives text chunks, returns base64 PCM16 audio delta events | External service — WebSocket persistent connection |
| Voice Clone Enrollment (one-time) | Registers Kaleb's voice sample against `qwen-voice-enrollment` model, receives voice ID | One-time setup, result stored in env var |
| `/api/voice/session` | Returns session metadata (voice ID, system prompt hash) to browser on connect | Thin init endpoint, replaces current `/api/realtime/session` |
| `/api/voice/clone` | Admin-only endpoint to trigger voice enrollment from a reference audio URL | One-time setup utility |

---

## Recommended Project Structure

```
app/
├── api/
│   ├── voice/
│   │   ├── session/
│   │   │   └── route.ts          # Returns voice_id + config to client (replaces /api/realtime/session)
│   │   ├── ws/
│   │   │   └── route.ts          # WebSocket orchestrator — STT/LLM/TTS bridge (main change)
│   │   └── clone/
│   │       └── route.ts          # Admin: trigger voice enrollment (one-time)
│   └── realtime/                 # Existing OpenAI endpoint — delete after migration
│       └── session/
│           └── route.ts
├── hooks/
│   └── useRealtimeVoice.ts       # Modify: point WS at /api/voice/ws instead of OpenAI
├── lib/
│   └── dashscope/
│       ├── stt.ts                # DashScope STT WebSocket client wrapper
│       ├── tts.ts                # DashScope TTS WebSocket client wrapper
│       ├── llm.ts                # Qwen chat completion HTTP client
│       └── types.ts              # Shared event types
└── components/                   # No changes needed
```

### Structure Rationale

- **`app/lib/dashscope/`**: Isolate each DashScope service behind its own module. The STT and TTS modules each manage a WebSocket lifecycle. The LLM module is a thin HTTP fetch wrapper. This makes the three services independently replaceable and testable.
- **`app/api/voice/ws/`**: Single orchestrator that has access to all three lib modules. All secrets live here — browser never touches DashScope credentials.
- **`useRealtimeVoice.ts`**: Minimal change — replace the OpenAI WS URL with `/api/voice/ws`. The browser-side audio encode/decode logic stays identical since DashScope also uses PCM16 base64.

---

## Architectural Patterns

### Pattern 1: Server-Side Cascade with Streaming Overlap

**What:** The Next.js WS Orchestrator opens persistent WebSocket connections to both DashScope STT and DashScope TTS simultaneously when a client session starts. When STT emits a `conversation.item.input_audio_transcription.completed` event, the orchestrator immediately begins an HTTP streaming call to Qwen LLM. As LLM tokens arrive, they are forwarded sentence-by-sentence to the TTS WebSocket using `input_text_buffer.append`. TTS begins returning audio delta events before the LLM response is complete.

**When to use:** Always — this is the primary runtime pattern for the pipeline.

**Trade-offs:**
- Adds ~200-400ms vs OpenAI Realtime (which has a single-hop architecture)
- Gains: full control of each stage, voice cloning capability, independent model swapping
- LLM response quality is higher (Qwen-max vs. GPT-4o-realtime's baked-in audio model)

**Sequence:**
```
Client speaks
  → Browser sends PCM16 chunks to /api/voice/ws
  → Orchestrator forwards binary frames to STT WebSocket
  → STT emits speech_started / speech_stopped (VAD)
  → STT emits transcript.completed ("Tell me about your experience")
  → Orchestrator calls Qwen LLM with transcript + system prompt (stream: true)
  → LLM token stream arrives ("I've been...")
  → Orchestrator sends first sentence to TTS WebSocket
  → TTS emits response.audio.delta (base64 PCM16)
  → Orchestrator forwards audio chunks to client WebSocket
  → Browser decodes and schedules audio playback
```

### Pattern 2: Browser-Direct Audio with Server Bridge

**What:** The browser captures raw microphone audio and processes it via ScriptProcessorNode (or AudioWorklet), exactly as the current OpenAI implementation. The only change is the WebSocket endpoint target. All DashScope communication remains server-side.

**When to use:** Required — DashScope's API key cannot be exposed client-side; and DashScope's WebSocket connection requires server authentication that can't be done from a browser.

**Trade-offs:**
- Audio travels browser → server → DashScope → server → browser (two extra hops)
- Added latency ~50-100ms for round-trip to server compared to browser-direct
- Necessary for security and API credential management

### Pattern 3: Voice ID Pre-enrollment (Offline)

**What:** Voice cloning is a one-time offline step, not part of the real-time conversation loop. A reference audio file (10-20 seconds of clean Kaleb speech) is uploaded via the `/api/voice/clone` admin endpoint, which calls `qwen-voice-enrollment` against the `qwen3-tts-vc-realtime-*` model. The returned `voice_id` is stored as a Vercel environment variable (`DASHSCOPE_VOICE_ID`). All subsequent TTS calls reference this ID at connection time.

**When to use:** Build this first, before wiring the real-time pipeline. The `voice_id` must be known and stable before TTS is wired up.

**Critical constraint:** The `target_model` specified during enrollment must exactly match the model used in TTS synthesis calls. Mismatch causes synthesis failure.

---

## Data Flow

### Voice Interaction Loop (VOICE_ACTIVE state)

```
User speaks
  ↓
[Browser] ScriptProcessorNode → PCM16 (24kHz, mono)
  ↓ base64 encoded, JSON wrapped
[Browser → Server] WebSocket frame: { type: 'input_audio', audio: '...' }
  ↓
[Server Orchestrator] receives → strips envelope
  ↓ binary frame
[Server → STT WS] DashScope Paraformer: audio binary frame
  ↓
[STT → Server] event: { type: 'conversation.item.input_audio_transcription.completed', transcript: '...' }
  ↓
[Server] transcript received → construct Qwen chat message
  ↓ HTTP POST, stream: true
[Server → Qwen LLM] qwen-max: { messages: [system_prompt, history, { role: 'user', content: transcript }] }
  ↓ token stream (SSE)
[LLM → Server] token chunks arrive
  ↓ accumulate sentence boundary
[Server → TTS WS] { type: 'input_text_buffer.append', text: 'I built...' }
  ↓
[TTS → Server] event: { type: 'response.audio.delta', audio: '<base64 PCM16>' }
  ↓
[Server → Browser] WebSocket: { type: 'response.audio.delta', audio: '...' }
  ↓
[Browser] base64 decode → ArrayBuffer → AudioContext.scheduleAudioChunk()
  ↓
User hears Kaleb's cloned voice
```

### Session Initialization Flow

```
User clicks Connect
  ↓
[Browser] fetch POST /api/voice/session
  ↓
[Server] return { voice_id: process.env.DASHSCOPE_VOICE_ID }
  ↓
[Browser] open WebSocket to /api/voice/ws
  ↓
[Server] open STT WebSocket to DashScope (auth: DASHSCOPE_API_KEY)
[Server] open TTS WebSocket to DashScope (model: qwen3-tts-vc-realtime, voice: voice_id)
  ↓
[Server → Browser] { type: 'session.created' }
  ↓
[Browser] transition to VOICE_ACTIVE, begin mic capture
```

### Key State Transitions (unchanged from current architecture)

```
VOICE_IDLE
  → user clicks Connect → fetch /api/voice/session → open WS
  → CONNECTING
  → server sends session.created → VOICE_ACTIVE
    → user speaks → STT transcribes → LLM responds → TTS plays
    → back to listening
  → user disconnects / error → VOICE_IDLE
```

---

## Vercel Deployment Constraint — Critical

**Problem:** Vercel Serverless Functions do not support persistent WebSocket connections. The orchestrator must maintain three simultaneous WebSocket connections (client ↔ orchestrator, orchestrator ↔ STT, orchestrator ↔ TTS) for the duration of a session.

**Implication:** The WebSocket orchestrator cannot run as a Vercel Serverless Function. Two viable paths:

| Option | Description | Tradeoff |
|--------|-------------|----------|
| **Option A: Separate Node.js/Bun server** | Deploy a small standalone Bun WS server (e.g., Fly.io, Railway, Render) alongside Vercel. Next.js frontend points its WS at this external host. | Adds infra complexity; cleanest separation; scales independently |
| **Option B: Vercel Edge Functions with Durable Objects** | Use Cloudflare Workers (requires platform migration) or Vercel's experimental streaming support | Not recommended — requires significant platform change |
| **Option C: Next.js Custom Server** | Run Next.js with a custom Bun server (`server.ts`) that co-hosts both the HTTP routes and the WS endpoint | Breaks Vercel's serverless model entirely — must self-host |

**Recommended for this project:** Option A — keep Vercel for the Next.js UI and deploy a minimal Bun WS orchestrator to Fly.io or Railway. The browser connects to the Bun server's WebSocket URL stored in an env var (`NEXT_PUBLIC_VOICE_WS_URL`). Total added infra cost is minimal for a portfolio project.

**Note:** Current OpenAI implementation works on Vercel because the browser opens the WebSocket directly to `wss://api.openai.com`. With Alibaba Cloud, API keys cannot be browser-exposed, so the server must proxy — which is incompatible with Vercel's serverless functions.

---

## Integration Points

### External Services

| Service | Endpoint | Auth | Protocol | Key Details |
|---------|----------|------|----------|-------------|
| DashScope STT (Paraformer-realtime-v2) | `wss://dashscope-intl.aliyuncs.com/api-ws/v1/realtime?model=paraformer-realtime-v2` | `Authorization: bearer <DASHSCOPE_API_KEY>` | WebSocket (persistent) | VAD mode; PCM/WAV/MP3 audio; returns JSON events |
| Qwen LLM (qwen-max) | `https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions` | `Authorization: Bearer <DASHSCOPE_API_KEY>` | HTTP POST, SSE stream | OpenAI-compatible interface; `stream: true` |
| DashScope TTS (qwen3-tts-vc-realtime) | `wss://dashscope-intl.aliyuncs.com/api-ws/v1/realtime?model=qwen3-tts-vc-realtime-*` | `Authorization: bearer <DASHSCOPE_API_KEY>` | WebSocket (persistent) | Server commit mode preferred; audio: base64 PCM16 delta events |
| Voice Enrollment (one-time) | `POST /api/voice/clone` → calls DashScope `qwen-voice-enrollment` | Same API key | HTTP REST | Returns `voice_id`; run once; store result in Vercel env |

### Internal Boundaries

| Boundary | Communication | Protocol | Notes |
|----------|---------------|----------|-------|
| Browser ↔ WS Orchestrator | Client sends audio; server sends audio + text events | WebSocket (JSON + binary) | Same event shape as current OpenAI WS — minimize browser changes |
| WS Orchestrator ↔ STT | Server forwards binary audio frames | WebSocket (JSON + binary) | Must send `run-task` first, then audio; `finish-task` on user stops speaking |
| WS Orchestrator ↔ LLM | Single HTTP request per turn | HTTP SSE | Block on full transcript; do not stream partial STT to LLM (too noisy) |
| WS Orchestrator ↔ TTS | Server sends text chunks as tokens arrive | WebSocket (JSON) | Use server commit mode; send text in sentence-sized chunks for lower latency |

---

## Anti-Patterns

### Anti-Pattern 1: Client-Direct DashScope WebSocket

**What people try:** Open the DashScope WebSocket from the browser, passing the API key via `Authorization` header.

**Why it's wrong:** Browsers cannot set arbitrary WebSocket headers (the `Authorization` header is not allowed in browser WebSocket upgrades by the spec). More importantly, exposing the DashScope API key client-side grants full API access to anyone who inspects DevTools.

**Do this instead:** All DashScope calls go through the server-side WS Orchestrator. Browser only connects to `/api/voice/ws` on your own server.

### Anti-Pattern 2: Waiting for Full LLM Response Before Starting TTS

**What people try:** Collect the entire LLM response as a string, then send the full text to TTS.

**Why it's wrong:** Adds 500-2000ms of avoidable latency. The LLM might generate 200 tokens before TTS even starts, when TTS could have begun on token 15 (first sentence boundary).

**Do this instead:** Accumulate LLM tokens until a sentence boundary (`.`, `?`, `!`, or ~80 characters). Forward that chunk to TTS immediately via `input_text_buffer.append`. Continue accumulating next sentence in parallel.

### Anti-Pattern 3: Streaming Partial STT to LLM

**What people try:** Forward interim (partial) STT transcripts to the LLM as they arrive to start LLM response earlier.

**Why it's wrong:** Partial transcripts are noisy and incomplete. The LLM may generate a response to "Tell me about your" before the full intent "Tell me about your experience at RAID" is known, wasting tokens and causing incoherent responses.

**Do this instead:** Wait for `conversation.item.input_audio_transcription.completed` (the final transcript event). STT's VAD already handles sentence detection — trust it.

### Anti-Pattern 4: Deploying the WS Orchestrator as a Vercel Serverless Function

**What people try:** Put the WebSocket bridge in `app/api/voice/ws/route.ts` and deploy on Vercel expecting it to work.

**Why it's wrong:** Vercel Serverless Functions time out at 10-30 seconds and cannot maintain persistent connections. A voice conversation lasts 1-10 minutes — the function will terminate mid-session.

**Do this instead:** Deploy the WS Orchestrator as a standalone long-running Bun process on Fly.io or Railway. Reference it from Next.js via `NEXT_PUBLIC_VOICE_WS_URL`.

### Anti-Pattern 5: Mismatched Voice Enrollment Model and Synthesis Model

**What people try:** Enroll the voice against `qwen3-tts` and then call `qwen3-tts-vc-realtime-2026-01-15` for synthesis.

**Why it's wrong:** Alibaba's voice enrollment requires the `target_model` field to exactly match the model used for synthesis. Mismatch causes synthesis to fail at runtime with a non-obvious error.

**Do this instead:** Decide the synthesis model first (e.g., `qwen3-tts-vc-realtime-2026-01-15`). Use that exact string as `target_model` during enrollment. Hardcode it as `DASHSCOPE_TTS_MODEL` environment variable used in both enrollment and synthesis.

---

## Scaling Considerations

| Scale | Concern | Approach |
|-------|---------|----------|
| 1-10 concurrent sessions | WS Orchestrator memory | Single Bun process handles comfortably; each session ~3 open WS connections |
| 10-100 concurrent | DashScope rate limits | Check DashScope account quotas; voice ID has 1,000 voice slots max per account |
| 100+ concurrent | Server memory / connection limits | Add horizontal scaling to Bun WS server; stateless sessions mean easy horizontal scale |

For a portfolio project, 1-10 concurrent users is the realistic ceiling. A single Fly.io instance (256MB RAM) is sufficient.

---

## Build Order (Phase Dependencies)

The components have hard sequential dependencies:

```
1. Voice Enrollment (offline)          ← No dependencies
   ↓ produces: DASHSCOPE_VOICE_ID
2. DashScope TTS module                ← Needs DASHSCOPE_VOICE_ID
   ↓ validates: audio output format matches browser expectations
3. DashScope STT module                ← No service dependency (parallel with TTS module)
   ↓ validates: transcript event shape
4. Qwen LLM module                     ← No service dependency (parallel)
   ↓ validates: streaming token format
5. WS Orchestrator                     ← Needs STT + LLM + TTS modules
   ↓ integrates all three
6. useRealtimeVoice hook update        ← Needs WS Orchestrator running
   ↓ points browser at new WS endpoint
7. System prompt / context injection   ← Needs LLM module
   ↓ embeds resume content in Qwen prompt
8. Filler words + natural speech       ← Needs TTS + LLM working end-to-end
   ↓ prompting and TTS control instructions
```

**Critical path:** Voice enrollment must happen first. Every downstream component depends on the stable `voice_id`.

---

## Sources

- [DashScope Real-Time STT WebSocket API](https://www.alibabacloud.com/help/en/model-studio/websocket-for-paraformer-real-time-service) — official docs, HIGH confidence
- [Qwen-ASR-Realtime Interaction Flow](https://www.alibabacloud.com/help/en/model-studio/qwen-asr-realtime-interaction-process) — official docs, HIGH confidence
- [Qwen Voice Cloning API Reference](https://www.alibabacloud.com/help/en/model-studio/qwen-tts-voice-cloning) — official docs, HIGH confidence
- [Qwen TTS Real-Time WebSocket API](https://www.alibabacloud.com/help/en/model-studio/qwen-tts-realtime) — official docs, HIGH confidence
- [Qwen-TTS Speech Synthesis (non-realtime)](https://www.alibabacloud.com/help/en/model-studio/qwen-tts) — official docs, HIGH confidence
- [Qwen3-TTS GitHub Repository](https://github.com/QwenLM/Qwen3-TTS) — official, HIGH confidence
- [Vercel WebSocket Serverless Limitation](https://vercel.com/kb/guide/do-vercel-serverless-functions-support-websocket-connections) — official Vercel docs, HIGH confidence
- [Voice Agent STT/LLM/TTS Pipeline Architecture — LiveKit](https://livekit.com/blog/voice-agent-architecture-stt-llm-tts-pipelines-explained) — MEDIUM confidence
- [Real-Time vs Cascading Architecture](https://softcery.com/lab/ai-voice-agents-real-time-vs-turn-based-tts-stt-architecture) — MEDIUM confidence
- [Voice AI Pipeline Latency — Chanl](https://www.channel.tel/blog/voice-ai-pipeline-stt-tts-latency-budget) — MEDIUM confidence

---

*Architecture research for: Alibaba Cloud voice pipeline (STT + LLM + TTS) replacing OpenAI Realtime API*
*Researched: 2026-04-09*
