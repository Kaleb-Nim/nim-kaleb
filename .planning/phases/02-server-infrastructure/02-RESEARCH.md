# Phase 2: Server Infrastructure + Full Pipeline - Research

**Researched:** 2026-04-09
**Domain:** Bun WebSocket orchestrator, DashScope STT+LLM+TTS cascaded pipeline, Railway/Fly.io deployment
**Confidence:** MEDIUM-HIGH (DashScope WebSocket message formats verified via official docs; Railway Bun deployment verified; latency budget confirmed from industry data)

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PIPE-01 | Alibaba Cloud STT (Qwen3-ASR) replaces OpenAI STT via WebSocket streaming | ASR WebSocket endpoint confirmed; `session.update` format documented; PCM 16kHz mono required |
| PIPE-02 | Alibaba Cloud Qwen LLM replaces OpenAI LLM via DashScope OpenAI-compatible endpoint | OpenAI-compatible base URL confirmed; `qwen-plus` recommended for <300ms TTFT; streaming supported |
| PIPE-03 | Alibaba Cloud Qwen3-TTS replaces OpenAI TTS with Kaleb's cloned voice ID | TTS WebSocket message format documented; `voice_id` goes in `session.voice`; model = `qwen3-tts-vc-realtime-2026-01-15` |
| PIPE-04 | Total voice round-trip latency under 800ms | Budget: STT 150ms + LLM 200ms TTFT + streaming overlap + TTS first-chunk 97ms; feasible with streaming overlap |
| PIPE-05 | Server-side WebSocket orchestrator on Bun/Fly.io/Railway | Bun.serve() WebSocket API documented; Railway Bun deployment zero-config; Fly.io also viable |
| PIPE-06 | Secure token exchange — server generates temporary DashScope tokens, browser connects via orchestrator | DashScope temporary token API documented; `st-****` format; TTL 1-1800s; all DashScope calls server-side |
| CONV-03 | Graceful error handling and automatic reconnect on WebSocket drops | Browser-side reconnect pattern: exponential backoff; Bun WS has `onclose` hook; session resume via new WS + re-auth |
</phase_requirements>

---

## Project Constraints (from CLAUDE.md)

| Directive | Constraint |
|-----------|------------|
| Provider lock | Alibaba Cloud (DashScope) for entire voice pipeline — no mixing with OpenAI STT/TTS |
| TTS model | `qwen3-tts-vc-realtime-2026-01-15` with `DASHSCOPE_VOICE_ID` from Phase 1 |
| Runtime | Bun — use `bun`/`bunx`, not `npm`/`npx`/`node` for the WS server |
| Secret security | DashScope API key must NEVER reach the browser or Next.js client bundle |
| Backward compatibility | Terminal UI and state machine (`useRealtimeVoice` interface) must remain intact |
| Speech quality | Conversational, not robotic — system prompt from Phase 1 (`prompts/system-prompt.md`) |
| Deployment | Frontend stays on Vercel; WS orchestrator on Railway or Fly.io (Vercel cannot proxy WebSockets) |
| Voice ID | `DASHSCOPE_VOICE_ID=qwen-tts-vc-kaleb-voice-20260409131147531-d171` (from Phase 1 enrollment) |

---

## Summary

Phase 2 builds the server-side WebSocket orchestrator that replaces the current `useRealtimeVoice.ts` hook's direct connection to OpenAI Realtime. The architecture is a Bun process deployed on Railway (or Fly.io) that the browser connects to via WebSocket. The server holds the DashScope API key and proxies three sequential API calls: (1) DashScope ASR WebSocket for speech-to-text, (2) DashScope OpenAI-compatible endpoint for LLM generation, and (3) DashScope TTS WebSocket for speech synthesis. The browser sends PCM audio chunks to the Bun server and receives base64 PCM audio chunks back — the same data shapes the existing hook already handles.

The critical architecture decision is that **all three DashScope connections live on the server**. The browser never opens a WebSocket to DashScope directly. The Bun server acts as a full-duplex relay: it holds open an ASR WebSocket to receive transcripts, calls the LLM with streaming, and pipes LLM token chunks into a TTS WebSocket session in server_commit mode. This approach eliminates PIPE-06 (key exposure) entirely without needing the DashScope temporary token mechanism.

The 800ms latency target (PIPE-04) is achievable via streaming overlap: TTS synthesis begins as LLM tokens arrive, so the total wall-clock time is STT latency + LLM time-to-first-audio-chunk, not STT + LLM-full-response + TTS. The industry standard cascaded pipeline targeting 800ms total round-trip is well-documented and feasible with this approach given DashScope's published first-chunk latency of ~97ms for Qwen3-TTS.

The existing `useRealtimeVoice.ts` hook already handles PCM audio capture, downsampling, base64 encoding, and audio scheduling — these can all be preserved. The hook only needs its WebSocket URL and message protocol updated to speak to the Bun server instead of OpenAI.

**Primary recommendation:** Deploy a standalone Bun WebSocket server on Railway with Railpack builder (zero-config Bun detection). Use `server_commit` mode for TTS to enable streaming LLM-to-TTS overlap. Keep all DashScope connections server-side. Re-use the existing PCM audio pipeline in the browser hook.

---

## Pre-Existing Artifacts from Phase 1

| Artifact | Location | Used In Phase 2 |
|----------|----------|-----------------|
| Voice ID | `DASHSCOPE_VOICE_ID` env var (`.env.local` + Vercel) | `session.voice` param in TTS WebSocket |
| System prompt | `prompts/system-prompt.md` (167 lines, ~2500 tokens) | LLM system message in chat completions call |
| Local TTS/STT server | `tts-server/` (FastAPI + local Qwen3-TTS) | NOT used in Phase 2 — DashScope API replaces it |
| Enrollment script | `scripts/enroll-voice.sh` | Not used — one-time already run |

**Note on tts-server/:** The `tts-server/` directory runs a local FastAPI Python server using the locally downloaded Qwen3-TTS model. Phase 2 does NOT use this for production — it uses DashScope's hosted API (`qwen3-tts-vc-realtime-2026-01-15`). The local server may be useful for local development fallback but is not part of the deployment pipeline. The `TTS_SERVER_URL` and `STT_SERVER_URL` env vars in `.env.local` point to it but will be superseded by the Bun WS server URL.

---

## Standard Stack

### Core

| Library/Service | Version | Purpose | Why Standard |
|-----------------|---------|---------|--------------|
| Bun runtime | 1.3.5 (installed) | WS server runtime + TypeScript execution | Project mandate; built-in WS support via Bun.serve() |
| Bun.serve() WS | native | WebSocket server without extra deps | No `ws` or `socket.io` needed; native Bun API |
| DashScope ASR | `qwen3-asr-flash-realtime` | Browser audio → transcript | Mandated provider; WebSocket streaming; VAD built-in |
| DashScope LLM | `qwen-plus` | Transcript → response text | Best latency/quality for voice (<300ms TTFT on Alibaba infra) |
| DashScope TTS | `qwen3-tts-vc-realtime-2026-01-15` | Response text → audio in Kaleb's voice | Mandated model; matches Phase 1 enrollment target_model |
| Railway | current | Host Bun WS server | Zero-config Bun detection via Railpack; usage-based pricing; WebSocket support confirmed |

### Supporting

| Library/Service | Version | Purpose | When to Use |
|-----------------|---------|---------|-------------|
| `openai` npm package | 6.32.0 (already installed) | DashScope OpenAI-compatible LLM calls | Can reuse existing SDK by changing baseURL; no new install |
| DashScope temp token API | REST | Generate short-lived tokens | Alternative to server-side-only architecture if browser-direct TTS is needed later |
| Fly.io | — | Alternative host for Bun WS server | If Railway cold starts are unacceptable; min_machines_running=1 available |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Railway | Fly.io | Fly.io: per-machine billing even when idle; requires flyctl CLI; more control over regions. Railway: usage-based, sleep after 10min idle, easier DX. For a portfolio WS server, Railway is simpler and cheaper. |
| `qwen-plus` LLM | `qwen-flash` | Flash has higher throughput but fewer parameters — lower quality for nuanced persona questions. Plus has sub-300ms TTFT on Alibaba infra which meets the 800ms budget. |
| Server-side DashScope WS relay | Browser-direct to DashScope with temp tokens | Temp tokens solve PIPE-06 but add a round-trip for token fetch; browser-direct is architecturally simpler but exposes more surface area. Server-side relay is cleaner for security. |
| Bun native WS | Hono + WS | Hono adds routing conveniences but is an extra dependency. Bun.serve() is sufficient for a single-purpose WS server. |

### Installation

```bash
# In the new ws-server/ directory
bun init -y
# No additional WS library needed — Bun has native WebSocket support
# The openai package is already installed in the main project for LLM calls
bun add openai
```

---

## Architecture Patterns

### Recommended Project Structure

```
ws-server/               # New standalone Bun WS orchestrator
├── src/
│   ├── index.ts         # Bun.serve() entry point — WS upgrade handler
│   ├── session.ts       # Per-client session state (ASR WS, LLM stream, TTS WS)
│   ├── dashscope/
│   │   ├── asr.ts       # DashScope ASR WebSocket client (server → DashScope)
│   │   ├── llm.ts       # DashScope OpenAI-compat LLM streaming
│   │   └── tts.ts       # DashScope TTS WebSocket client (server → DashScope)
│   └── types.ts         # Shared message types (browser ↔ server protocol)
├── package.json         # Bun project — "start": "bun src/index.ts"
├── railway.json         # { "build": { "builder": "RAILPACK" } }
├── Dockerfile           # Optional — Railway auto-generates if absent
└── tsconfig.json        # Strict TypeScript
app/
├── hooks/
│   └── useRealtimeVoice.ts  # REPLACE WS URL + message protocol (keep PCM pipeline)
└── api/
    └── voice/
        └── route.ts         # Optional: Next.js proxy if CORS needed (see pitfalls)
```

### Pattern 1: Bun.serve() WebSocket Upgrade

**What:** A single `Bun.serve()` call handles both HTTP (for health checks) and WebSocket upgrades.
**When to use:** Always — this is Bun's native WS pattern.

```typescript
// Source: bun.com/docs/runtime/http/websockets
type SessionData = { sessionId: string; }

Bun.serve<SessionData>({
  port: process.env.PORT ?? 8080,
  fetch(req, server) {
    const url = new URL(req.url);
    if (url.pathname === '/health') {
      return new Response('ok');
    }
    if (url.pathname === '/ws') {
      const upgraded = server.upgrade(req, {
        data: { sessionId: crypto.randomUUID() }
      });
      if (upgraded) return; // success
    }
    return new Response('Not found', { status: 404 });
  },
  websocket: {
    async open(ws) {
      // Initialize per-client DashScope session
    },
    async message(ws, msg) {
      // Route browser messages to DashScope APIs
    },
    close(ws) {
      // Cleanup DashScope connections
    }
  }
});
```

### Pattern 2: Browser → Server Protocol (Message Types)

**What:** Define a typed protocol between the browser hook and the Bun server. The browser sends audio and receives audio — mirroring the OpenAI Realtime protocol shape the existing hook already handles.

```typescript
// Source: [ASSUMED] — mirrors existing useRealtimeVoice.ts message shapes

// Browser → Server
type BrowserMessage =
  | { type: 'audio.append'; data: string }      // base64 PCM16 16kHz
  | { type: 'audio.end' }                        // VAD manual end signal

// Server → Browser
type ServerMessage =
  | { type: 'session.ready' }                    // server ready for audio
  | { type: 'transcript.partial'; text: string } // interim ASR result
  | { type: 'transcript.final'; text: string }   // final ASR result
  | { type: 'response.audio.delta'; delta: string } // base64 PCM24kHz chunk
  | { type: 'response.done' }                    // TTS finished
  | { type: 'error'; message: string }           // error from any DashScope API
```

### Pattern 3: STT→LLM→TTS Streaming Overlap

**What:** Start TTS as LLM tokens arrive — do not wait for LLM to finish before starting TTS. This is the key to achieving 800ms P95.

**How:**
1. ASR WebSocket returns `conversation.item.input_audio_transcription.completed` → kick off LLM streaming
2. LLM returns `stream: true` chunks → open TTS WebSocket in `server_commit` mode
3. As LLM tokens arrive in sentence-boundary chunks, append to TTS via `input_text_buffer.append`
4. TTS returns `response.audio.delta` → forward base64 audio to browser WebSocket immediately
5. Browser's existing `scheduleAudioChunk` handles playback scheduling

**Latency budget (wall clock):**
- ASR processing: ~150ms (after VAD end-of-speech detection)
- LLM time-to-first-token: ~200-300ms (qwen-plus on Alibaba infra)
- TTS first audio chunk: ~97ms after first text chunk
- **Total to first audio in browser: ~450-550ms** — well within 800ms
- Network adds ~20-50ms Singapore→user [ASSUMED]

### Pattern 4: DashScope ASR WebSocket Session

```typescript
// Source: alibabacloud.com/help/en/model-studio/qwen-real-time-speech-recognition [CITED]

// 1. Open WS with API key in header (server-side only)
const asrWs = new WebSocket(
  'wss://dashscope-intl.aliyuncs.com/api-ws/v1/realtime?model=qwen3-asr-flash-realtime',
  { headers: { Authorization: `Bearer ${process.env.DASHSCOPE_API_KEY}` } }
);

// 2. Configure on open
asrWs.onopen = () => {
  asrWs.send(JSON.stringify({
    type: 'session.update',
    event_id: `event_${Date.now()}`,
    session: {
      modalities: ['text'],
      input_audio_format: 'pcm',
      sample_rate: 16000,
      input_audio_transcription: { language: 'en' },
      turn_detection: {
        type: 'server_vad',
        threshold: 0.0,
        silence_duration_ms: 400
      }
    }
  }));
};

// 3. Relay browser audio to ASR
function forwardAudio(base64Audio: string) {
  asrWs.send(JSON.stringify({
    type: 'input_audio_buffer.append',
    event_id: `event_${Date.now()}`,
    audio: base64Audio
  }));
}

// 4. Receive transcripts
asrWs.onmessage = (e) => {
  const msg = JSON.parse(e.data);
  if (msg.type === 'conversation.item.input_audio_transcription.completed') {
    startLLMStream(msg.transcript);
  }
};
```

**Audio format note:** Browser sends 24kHz PCM from existing hook. Downsampling is needed from 24kHz to 16kHz before forwarding to ASR. The existing `downsample()` function in `useRealtimeVoice.ts` does exactly this — it can be called server-side or the browser can be reconfigured to send at 16kHz directly. [ASSUMED — simpler to configure browser at 16kHz for ASR, keep 24kHz for TTS playback]

### Pattern 5: DashScope TTS WebSocket Session (server_commit mode)

```typescript
// Source: alibabacloud.com/help/en/model-studio/qwen-tts-realtime [CITED]

const ttsWs = new WebSocket(
  'wss://dashscope-intl.aliyuncs.com/api-ws/v1/realtime?model=qwen3-tts-vc-realtime-2026-01-15',
  { headers: { Authorization: `Bearer ${process.env.DASHSCOPE_API_KEY}` } }
);

ttsWs.onopen = () => {
  ttsWs.send(JSON.stringify({
    type: 'session.update',
    event_id: `event_${Date.now()}`,
    session: {
      mode: 'server_commit',            // server decides when to flush text chunks
      voice: process.env.DASHSCOPE_VOICE_ID, // Kaleb's cloned voice
      language_type: 'Auto',
      response_format: 'pcm',
      sample_rate: 24000
    }
  }));
};

// Called per sentence chunk from LLM stream
function appendText(text: string) {
  ttsWs.send(JSON.stringify({
    type: 'input_text_buffer.append',
    event_id: `event_${Date.now()}`,
    text
  }));
}

// Forward TTS audio to browser
ttsWs.onmessage = (e) => {
  const msg = JSON.parse(e.data);
  if (msg.type === 'response.audio.delta') {
    browserWs.send(JSON.stringify({
      type: 'response.audio.delta',
      delta: msg.delta  // already base64 PCM24kHz
    }));
  }
  if (msg.type === 'response.done') {
    browserWs.send(JSON.stringify({ type: 'response.done' }));
  }
};
```

### Pattern 6: DashScope LLM Streaming (OpenAI SDK, server-side)

```typescript
// Source: alibabacloud.com/help/en/model-studio/compatibility-of-openai-with-dashscope [CITED]
// The existing `openai` package (v6.32.0) supports baseURL override

import OpenAI from 'openai';
import { readFileSync } from 'fs';

const client = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY,
  baseURL: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1'
});

const systemPrompt = readFileSync('./prompts/system-prompt.md', 'utf-8');

async function streamLLMToTTS(transcript: string, ttsWs: WebSocket) {
  const stream = await client.chat.completions.create({
    model: 'qwen-plus',
    stream: true,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: transcript }
    ]
  });

  let buffer = '';
  for await (const chunk of stream) {
    const token = chunk.choices[0]?.delta?.content ?? '';
    buffer += token;
    // Flush on sentence boundaries to minimize TTS latency
    if (/[.!?]\s/.test(buffer) || buffer.length > 80) {
      appendTextToTTS(ttsWs, buffer);
      buffer = '';
    }
  }
  if (buffer) appendTextToTTS(ttsWs, buffer);
  ttsWs.send(JSON.stringify({ type: 'session.finish' }));
}
```

### Pattern 7: Browser Auto-Reconnect

**What:** Browser-side exponential backoff reconnect when the WS server drops.
**When to use:** Implement in `useRealtimeVoice.ts` to meet CONV-03.

```typescript
// Source: [ASSUMED] — standard pattern; no library needed

function connectWithRetry(url: string, maxRetries = 5) {
  let retries = 0;
  function attempt() {
    const ws = new WebSocket(url);
    ws.onclose = (e) => {
      if (!e.wasClean && retries < maxRetries) {
        const delay = Math.min(1000 * 2 ** retries, 30000);
        retries++;
        setTimeout(attempt, delay);
      }
    };
    ws.onopen = () => { retries = 0; };
    return ws;
  }
  return attempt();
}
```

### Anti-Patterns to Avoid

- **Direct browser-to-DashScope WebSocket:** Exposes API key in network tab. All DashScope connections must be server-side.
- **Waiting for full LLM response before starting TTS:** Kills latency. Use streaming + sentence-boundary flushing.
- **Re-creating TTS WebSocket per sentence:** One TTS WS session per user turn. Append text chunks to the same session.
- **Using the local `tts-server/` FastAPI server in production:** The local server uses the local model, not DashScope VC realtime. Cannot produce Kaleb's cloned voice from the API. Only use for local dev experimentation.
- **Deploying the WS server on Vercel:** Vercel serverless functions have a max 30s timeout and cannot hold long-lived WebSocket connections. Must be a standalone server.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Audio sample rate conversion (24kHz→16kHz) | Custom resampler | The existing `downsample()` in `useRealtimeVoice.ts` | Already tested, handles edge cases; just move or reuse |
| PCM↔base64 conversion | Custom encoding | Browser-native `btoa()`/`atob()` (existing) | Already in the hook; no change needed |
| WebSocket reconnect logic | Complex state machine | Simple exponential backoff (15 lines) | Pattern is well-established; no library needed |
| LLM streaming | Custom SSE parser | OpenAI SDK `stream: true` (already installed) | SDK handles SSE, error recovery, typing |
| TTS session management | Custom state | DashScope `server_commit` mode handles it | Server knows when to flush; don't build flush logic |
| CORS for WS upgrade | Custom middleware | `fetch` handler returns CORS headers before upgrade | Bun.serve() fetch handler covers pre-flight |

**Key insight:** The most valuable reuse is the entire audio pipeline in `useRealtimeVoice.ts`. The `scheduleAudioChunk`, `pcm16ToFloat32`, `base64ToArrayBuffer`, and `downsample` functions are all reusable. Only the WS URL and the session handshake message need changing.

---

## Common Pitfalls

### Pitfall 1: Audio Sample Rate Mismatch
**What goes wrong:** ASR requires 16kHz mono PCM. TTS returns 24kHz PCM. The browser currently captures at `SAMPLE_RATE = 24000` and the existing hook downsamples to 24kHz for OpenAI. Sending 24kHz audio to DashScope ASR will produce garbled transcripts or errors.
**Why it happens:** The two DashScope services use different sample rates.
**How to avoid:** Configure the browser `AudioContext` at 16kHz for the ASR path, OR downsample on the server before forwarding to ASR. Keeping 16kHz in browser simplifies the server. TTS playback uses a separate `AudioContext` that can run at 24kHz.
**Warning signs:** Transcripts are empty, garbled, or the ASR WS returns errors immediately after sending audio.

### Pitfall 2: TTS Model / Voice ID Cross-Model Incompatibility
**What goes wrong:** Voice ID enrolled against `qwen3-tts-vc-realtime-2026-01-15` fails if used with a different model (e.g., `qwen3-tts-flash-realtime`). This was confirmed in Phase 1 VERIFICATION.md.
**Why it happens:** DashScope voice enrollment binds to a specific `target_model`.
**How to avoid:** Always use `model=qwen3-tts-vc-realtime-2026-01-15` in the TTS WebSocket URL. Document this clearly.
**Warning signs:** TTS WebSocket connects but returns no audio or an error on `session.update`.

### Pitfall 3: DashScope WebSocket Authorization Header in Browser WS
**What goes wrong:** Browser `new WebSocket(url)` does not support custom headers. If the architecture requires the browser to open a DashScope WS directly, the API key cannot be sent.
**Why it happens:** Browser WebSocket API limitation.
**How to avoid:** Keep all DashScope WebSockets on the Bun server side. Browser connects to the Bun server only.
**Warning signs:** CORS errors or 401s when testing browser-direct DashScope connections.

### Pitfall 4: Railway Sleep on Zero Traffic (Cold Start)
**What goes wrong:** Railway's usage-based model sleeps the service after 10 minutes of no traffic. A recruiter visiting after idle will experience a 2-5 second cold start before the WS connects.
**Why it happens:** Railway's default `sleep on inactivity` behavior.
**How to avoid:** Evaluate tradeoff: keep Railway with a cron-based keepalive ping (e.g., Vercel cron hitting the `/health` endpoint every 5 minutes), OR use Fly.io with `min_machines_running = 1` for true always-on. Both approaches cost <$5/month for a small instance.
**Warning signs:** First connection after idle takes >3 seconds.

### Pitfall 5: Missing `system-prompt.md` on the Server
**What goes wrong:** The Bun WS server is deployed without `prompts/system-prompt.md`. LLM calls use no system prompt or a placeholder.
**Why it happens:** The prompts directory is in the Next.js project root, not in the new `ws-server/` directory.
**How to avoid:** Either (a) include the system prompt as a string constant compiled into the server bundle, (b) read it from a shared path via environment variable, or (c) store it as a `SYSTEM_PROMPT` environment variable in Railway.
**Warning signs:** AI gives generic responses, doesn't speak in first person, or doesn't know Kaleb's history.

### Pitfall 6: Bun WebSocket and Routes Conflict
**What goes wrong:** Bun.serve() has a known issue where `routes` and `websocket` cannot be specified together in some versions.
**Why it happens:** Bun API limitation (GitHub issue #17871 confirmed).
**How to avoid:** Use `fetch` handler for HTTP routes and keep `websocket` as a separate top-level config key (this is the correct pattern shown in Bun docs). Do NOT use the `routes` shorthand if also using WebSockets.
**Warning signs:** TypeScript type errors or runtime errors when adding WebSocket config alongside route config.

### Pitfall 7: CONV-03 — Session Not Resuming After Reconnect
**What goes wrong:** Auto-reconnect opens a new WS but the server has discarded the DashScope ASR/TTS sessions. The browser thinks it's resumed but the server starts fresh with no audio context.
**Why it happens:** WebSocket connections are stateful; server-side DashScope sessions close with the WS.
**How to avoid:** Design reconnect as a full session restart: the browser sends a `session.start` message on new connection, and the server opens fresh DashScope sessions. Do not attempt to resume mid-turn audio.
**Warning signs:** Reconnect succeeds but first phrase after reconnect is dropped or produces no audio.

---

## Code Examples

### Railway Deployment Configuration

```json
// ws-server/railway.json
// Source: bun.com/docs/guides/deployment/railway [CITED]
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": {
    "builder": "RAILPACK"
  }
}
```

```json
// ws-server/package.json (minimum required by Railway)
{
  "name": "kaleb-voice-ws-server",
  "scripts": {
    "start": "bun src/index.ts"
  }
}
```

### Fly.io Alternative (fly.toml)

```toml
# ws-server/fly.toml — use if Railway cold starts are unacceptable
# Source: fly.io/docs/launch/autostop-autostart/ [CITED]
app = "kaleb-voice-ws"
primary_region = "sin"  # Singapore — closest to DashScope infra

[[services]]
  internal_port = 8080
  protocol = "tcp"
  auto_stop_machines = "stop"
  auto_start_machines = true
  min_machines_running = 1  # prevents cold start

  [[services.ports]]
    port = 80
    handlers = ["http"]
  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]
```

### DashScope Temporary Token (PIPE-06 alternative)

```typescript
// Source: alibabacloud.com/help/en/model-studio/generate-temporary-api-key [CITED]
// Use only if browser-direct DashScope connections become necessary in a later phase

async function getDashScopeToken(ttlSeconds = 300): Promise<string> {
  const res = await fetch(
    `https://dashscope-intl.aliyuncs.com/api/v1/tokens?expire_in_seconds=${ttlSeconds}`,
    { method: 'POST', headers: { Authorization: `Bearer ${process.env.DASHSCOPE_API_KEY}` } }
  );
  const { token } = await res.json();
  return token; // "st-****" format
}
```

---

## Runtime State Inventory

> Phase 2 is not a rename/refactor phase. No runtime state migration needed.

Phase 2 adds new infrastructure; it does not rename or migrate existing state. The only state-adjacent concern is that `DASHSCOPE_VOICE_ID` and `DASHSCOPE_API_KEY` env vars already exist in `.env.local` and need to also be added to the Railway/Fly.io deployment environment. This is a new deployment configuration task, not a data migration.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| OpenAI Realtime API (single WS) | DashScope cascaded: ASR→LLM→TTS (3 WSs, server-side) | Phase 2 | More moving parts but full control; no vendor lock-in to OpenAI for voice |
| Browser-direct OpenAI WS (ephemeral token) | Browser→Bun WS (server holds all keys) | Phase 2 | Stronger security; DashScope key never reaches browser |
| OpenAI STT via Realtime | Qwen3-ASR-Flash-Realtime WebSocket | Phase 2 | PCM format unchanged; VAD built into service |
| OpenAI TTS (alloy voice) | Qwen3-TTS-VC-Realtime (Kaleb's voice) | Phase 2 | ICL cloned voice; model pinned to enrollment target |
| Vercel API route for session token | Standalone Bun WS server | Phase 2 | Vercel cannot hold long-lived WebSockets; separate deployment needed |

**Deprecated in Phase 2:**
- `app/api/realtime/session/route.ts`: OpenAI session endpoint — can be deleted or left orphaned
- `useRealtimeVoice.ts` OpenAI WS URL + protocol: replaced with Bun server URL + new message types
- `OPENAI_API_KEY` env var: no longer needed if no other code uses it

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `qwen-plus` TTFT is ~200-300ms on DashScope infra from Singapore | Architecture Patterns (latency budget) | If TTFT is >400ms, total pipeline may exceed 800ms P95; mitigation: test early and switch to qwen-flash if needed |
| A2 | DashScope TTS `server_commit` mode accepts mid-stream text appends fast enough for LLM streaming overlap | Architecture Patterns (Pattern 3) | If server_commit buffers aggressively, LLM-to-TTS overlap doesn't work; may need `commit` mode with manual sentence flushing |
| A3 | Bun `new WebSocket(url, { headers: {...} })` works in Bun 1.3.5 server-side for DashScope connections | Standard Stack | If Bun's WS client has issues, fallback is `ws` npm package or native Node http.request upgrade |
| A4 | Railway sleep (10min idle) can be prevented by a lightweight keepalive ping from Vercel cron | Common Pitfalls | If keepalive doesn't prevent sleep, Fly.io with min_machines_running=1 is the alternative |
| A5 | Browser's existing PCM audio capture and downsampling can run at 16kHz for ASR without quality degradation | Architecture Patterns (Pattern 4) | If 16kHz capture causes mic issues, server-side downsampling is the fallback but adds latency |
| A6 | DashScope WebSocket connections from Singapore Railway region to DashScope-intl endpoint add <50ms network latency | Architecture Patterns (latency budget) | If network adds >100ms, total pipeline may struggle to hit 800ms; Singapore region minimizes this |
| A7 | The `system-prompt.md` (~2500 tokens) fits within qwen-plus context without token overflow | Code Examples (LLM streaming) | System prompt is well within Qwen's 32k+ context window; extremely low risk |

---

## Open Questions

1. **Does DashScope provide TTFT metrics for qwen-plus via the compatible-mode endpoint?**
   - What we know: Third-party benchmarks show 2.29s TTFT for Qwen3.6 Plus on Alibaba Cloud (different model/region)
   - What's unclear: TTFT for qwen-plus via dashscope-intl.aliyuncs.com from Singapore specifically
   - Recommendation: Add a latency probe in Wave 1 — time LLM first-token before TTS WebSocket is opened; if >300ms, switch to qwen-flash

2. **Can the existing `useRealtimeVoice.ts` hook be refactored in place, or should a new `useDashScopeVoice.ts` be created?**
   - What we know: The hook has 339 lines; ~80% of the audio processing code is reusable; only WS URL and session handshake change
   - What's unclear: Whether the planner prefers an in-place refactor (smaller diff) or a clean rename (easier to audit)
   - Recommendation: In-place refactor — removes risk of forgetting to update VoiceInterface.tsx imports; add a comment block explaining the migration

3. **Should the `ws-server/` live in the same repo as the Next.js app, or as a separate repository?**
   - What we know: The CLAUDE.md has no guidance; Railway can deploy from a subdirectory
   - What's unclear: Whether a monorepo or polyrepo approach is preferred
   - Recommendation: Monorepo — a `ws-server/` subdirectory in the same repo simplifies shared type definitions and reduces repo management overhead; Railway supports `Root Directory` setting in project config

4. **DEFERRED-VOICE-VERIFY.md: Voice recognition and intonation checks are due in Phase 2**
   - What we know: The DEFERRED-VOICE-VERIFY.md in this directory requires human listening verification once the realtime TTS pipeline is working
   - Recommendation: Include a Wave at the end of Phase 2 with explicit TTS voice quality spot-check before the phase closes

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Bun runtime | WS server | ✓ | 1.3.5 | — |
| `DASHSCOPE_API_KEY` | All DashScope API calls | ✓ | n/a (set in .env.local) | — |
| `DASHSCOPE_VOICE_ID` | TTS voice cloning | ✓ | `qwen-tts-vc-kaleb-voice-*` | — |
| flyctl | Fly.io deployment | ✗ | — | Use Railway instead (no CLI needed) |
| railway CLI | Railway deployment | ✗ | — | Railway dashboard deployment |
| DashScope-intl endpoint | All API calls | ✓ (assumed) | n/a | Beijing endpoint as fallback |
| Node.js WebSocket client in Bun | Server→DashScope WS connections | ✓ (built-in) | Bun 1.3.5 | `ws` npm package |

**Missing dependencies with no fallback:**
- None blocking. Railway and Fly.io do not require local CLI for initial deployment (both support GitHub-connected dashboard deployment).

**Missing dependencies with fallback:**
- Railway CLI: dashboard deployment covers initial setup; CLI optional for advanced use.

---

## Validation Architecture

> `workflow.nyquist_validation` is `false` in `.planning/config.json` — skipping this section.

---

## Security Domain

> `security_enforcement` not set in config.json — defaulting to enabled.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | No user auth (public portfolio) |
| V3 Session Management | yes | Server-side session tied to WS connection lifecycle; no persistent tokens stored |
| V4 Access Control | no | Public portfolio; no ACL needed |
| V5 Input Validation | yes | Validate `type` field of every browser message before routing; reject unknown types |
| V6 Cryptography | no | All secrets in env vars; never logged or serialized |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| API key exposure in network tab | Information Disclosure | All DashScope connections server-side; browser connects to Bun server only |
| WebSocket message injection | Tampering | Validate `type` field; never eval or JSON.parse without catch; use typed discriminated union |
| DashScope key in Railway env | Information Disclosure | Use Railway's encrypted environment variable store; never commit to git |
| Unlimited concurrent sessions | Denial of Service | Track open DashScope sessions per WS connection; close all on WS disconnect; Bun cleanup in `close()` handler |
| Cold start race condition | DoS | Browser retry with exponential backoff prevents hammering on cold start |

**Critical security invariant:** `DASHSCOPE_API_KEY` must appear ONLY in: `.env.local` (gitignored), Railway/Fly.io environment variables, and the Bun server's `process.env`. It must NEVER be read in Next.js client components, API routes that return it to the browser, or logged.

---

## Sources

### Primary (HIGH confidence)
- [Alibaba Cloud: Qwen TTS Realtime Docs](https://www.alibabacloud.com/help/en/model-studio/qwen-tts-realtime) — WebSocket message format, session.update, voice parameter, response.audio.delta
- [Alibaba Cloud: Qwen ASR Realtime](https://www.alibabacloud.com/help/en/model-studio/qwen-real-time-speech-recognition) — session.update format, PCM 16kHz, VAD mode, model name
- [Alibaba Cloud: ASR Interaction Flow](https://www.alibabacloud.com/help/en/model-studio/qwen-asr-realtime-interaction-process) — full message sequence for VAD mode
- [Alibaba Cloud: OpenAI-Compatible API](https://www.alibabacloud.com/help/en/model-studio/compatibility-of-openai-with-dashscope) — base URL, model names, streaming support
- [Alibaba Cloud: Temporary Token API](https://www.alibabacloud.com/help/en/model-studio/generate-temporary-api-key) — `st-****` format, TTL 1-1800s, POST endpoint
- [Bun WebSocket Docs](https://bun.com/docs/runtime/http/websockets) — Bun.serve() WS pattern, TypeScript types, send/receive API
- [Bun Deploy on Railway](https://bun.com/docs/guides/deployment/railway) — railway.json, Railpack builder configuration
- [Fly.io Autostop/Autostart Docs](https://fly.io/docs/launch/autostop-autostart/) — min_machines_running, fly.toml configuration
- [Railway vs Fly.io](https://docs.railway.com/platform/compare-to-fly) — pricing model comparison, cold start behavior

### Secondary (MEDIUM confidence)
- [Railway Bun WebSocket Game Server template](https://railway.com/deploy/bun-websocket-game-server) — confirms Railway supports Bun WS deployments
- [Qwen3-TTS Technical Report](https://arxiv.org/html/2601.15621v1) — 97ms first-chunk latency confirmed
- [Voice AI Latency Budget breakdown](https://www.channel.tel/blog/voice-ai-pipeline-stt-tts-latency-budget) — STT+LLM+TTS latency component analysis

### Tertiary (LOW confidence)
- [mikuh/dashscope-realtime](https://github.com/mikuh/dashscope-realtime) — Python SDK confirms WebSocket message shapes (not authoritative for TypeScript)
- [Qwen3.6 Plus TTFT 2.29s](https://artificialanalysis.ai/models/qwen3-6-plus/providers) — different model than qwen-plus; used as rough upper bound only

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Bun docs and DashScope official docs verified; Railway Bun deployment confirmed
- Architecture patterns: MEDIUM-HIGH — WebSocket message formats verified from official docs; streaming overlap pattern is ASSUMED from DashScope docs implying server_commit supports it
- Pitfalls: HIGH — based on Phase 1 verified findings (cross-model incompatibility confirmed), Bun known issues (GitHub issues), and industry-standard WS pitfalls
- Latency budget: MEDIUM — component latencies verified individually; overlap timing is ASSUMED

**Research date:** 2026-04-09
**Valid until:** 2026-05-09 (DashScope API stable; Bun deployment patterns stable; Qwen model names unlikely to change within 30 days)
