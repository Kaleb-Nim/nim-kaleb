# Stack Research

**Domain:** Real-time voice AI pipeline — Alibaba Cloud / Qwen (STT + LLM + TTS with voice cloning)
**Researched:** 2026-04-09
**Confidence:** MEDIUM (DashScope REST APIs verified via official docs; WebSocket auth with temporary tokens unconfirmed for WS-specific usage; no official JS/TS SDK exists)

---

## Context: What's Being Replaced

The existing hook (`app/hooks/useRealtimeVoice.ts`) opens a browser-side WebSocket directly to OpenAI using a short-lived ephemeral token fetched from a Next.js API route. The pattern works because OpenAI provides a `/v1/realtime/sessions` endpoint that returns a 60-second client token.

The replacement must replicate this pattern with DashScope: **browser WebSocket -> DashScope ASR, server API route -> LLM (Qwen), server WebSocket relay or client WebSocket -> DashScope TTS**, plus a one-time voice cloning enrollment.

---

## Critical Architecture Constraint

**Vercel serverless functions cannot proxy WebSockets.** Functions time out and have no persistent connection support. This is confirmed behavior, not a configuration issue.

**Implications:**
- The LLM call (Qwen via DashScope OpenAI-compatible API) can stay in a Next.js API route — it's HTTP, not WebSocket.
- The ASR and TTS WebSocket connections must be opened **from the browser directly** to DashScope, or you add a WebSocket-capable server.
- DashScope does support temporary tokens (up to 1,800s TTL) that can be used as Bearer tokens. These are the mechanism for client-side direct WebSocket connections without exposing permanent keys. **Confirm via testing that these tokens work in WebSocket Authorization headers** — documentation covers HTTP but not explicitly WebSocket.

**Recommended approach:** Keep the existing ephemeral-token pattern. Add a Next.js API route that generates a DashScope temporary token (POST `/api/v1/tokens`). Browser uses that token to open WebSockets to DashScope directly. This matches what the codebase already does for OpenAI.

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `openai` npm package | 6.x (already installed) | Qwen LLM chat completions via OpenAI-compat API | DashScope exposes an OpenAI-compatible endpoint at `dashscope-intl.aliyuncs.com/compatible-mode/v1`. Zero new SDK needed — just change `baseURL` and `apiKey`. HIGH confidence. |
| Browser native `WebSocket` | — | ASR and TTS real-time connections to DashScope | Same pattern as existing OpenAI WS code. DashScope ASR/TTS use identical event-driven WebSocket protocol. No new library needed client-side. |
| `ws` npm package | ^8.x | Server-side WebSocket if building a relay layer | Only needed if you can't connect directly from browser. Standard, minimal, used in DashScope's own Node.js examples. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@ai-sdk/alibaba` | latest | Optional Vercel AI SDK adapter for Qwen LLM | Use only if you want streaming `streamText()` through a Next.js API route with the Vercel AI SDK pattern. Not required — the `openai` package already works. |
| Native `fetch` + `ReadableStream` | — | Stream TTS audio from server API route to browser | If you route TTS through the server (non-WebSocket) for simpler architecture. Adds latency vs direct WS. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| `bun` | Runtime + package manager | Already in use; fully compatible with `ws` and `openai` packages |
| DashScope console (Singapore region) | API key + voice enrollment management | Use Singapore endpoint (`dashscope-intl.aliyuncs.com`) for international access. Beijing endpoint requires China account. |

---

## Installation

```bash
# No new core packages needed — openai is already installed
# Only add if building a server-side WebSocket relay:
bun add ws
bun add -D @types/ws

# Optional: Vercel AI SDK Alibaba adapter
bun add @ai-sdk/alibaba ai
```

---

## DashScope API Endpoints (Singapore/International)

| Service | Endpoint |
|---------|----------|
| Temporary token | `POST https://dashscope-intl.aliyuncs.com/api/v1/tokens?expire_in_seconds=1800` |
| LLM (OpenAI-compat) | `https://dashscope-intl.aliyuncs.com/compatible-mode/v1` |
| Voice enrollment (clone) | `POST https://dashscope-intl.aliyuncs.com/api/v1/services/audio/tts/customization` |
| ASR real-time WebSocket | `wss://dashscope-intl.aliyuncs.com/api-ws/v1/realtime` |
| TTS real-time WebSocket | (see TTS realtime docs — same subdomain pattern) |

---

## Service-by-Service Stack Decisions

### STT (Speech-to-Text): Qwen3-ASR-Flash-Realtime

**Model:** `qwen3-asr-flash-realtime` (or `paraformer-realtime-v2`)
**Protocol:** WebSocket from browser, Bearer token auth
**Audio format:** PCM, 16 kHz, mono, Base64-encoded chunks (~3,200 bytes per 0.1s)
**Message protocol:** OpenAI-compatible event structure
  - Client sends: `session.update`, `input_audio_buffer.append`, `session.finish`
  - Server sends: `conversation.item.input_audio_transcription.completed`, VAD events
**Confidence:** MEDIUM — Node.js WebSocket example exists in official docs (using `ws` library), but no TypeScript/Next.js-specific example

**Note on sample rate mismatch:** Existing code captures at device rate and downsamples to 24,000 Hz for OpenAI. DashScope ASR requires 16,000 Hz. The `downsample()` function in `useRealtimeVoice.ts` must be updated to target 16,000 Hz.

### LLM: Qwen (via OpenAI-compatible API)

**Model options:** `qwen3-max` (best quality), `qwen-plus` (balanced), `qwen-turbo` (fast)
**Protocol:** HTTP POST, streaming via SSE — handled by existing `openai` SDK
**How:** Change `baseURL` to `https://dashscope-intl.aliyuncs.com/compatible-mode/v1` and swap API key
**Confidence:** HIGH — explicitly documented as OpenAI-compatible, same SDK works

```typescript
import OpenAI from 'openai';
const qwen = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY,
  baseURL: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',
});
```

**Architecture note:** Since the existing pipeline is speech-to-speech (OpenAI Realtime handles STT+LLM+TTS in one WebSocket), the replacement splits into three separate calls. The LLM step becomes a server-side Next.js API route: ASR transcript -> Qwen LLM -> text response -> TTS.

### TTS: Qwen3-TTS-VC-Realtime (Voice Clone)

**Model:** `qwen3-tts-vc-realtime-2026-01-15`
**Protocol:** WebSocket, Bearer token auth
**Audio output format:** PCM at 24,000 Hz, 16-bit mono (`PCM_24000HZ_MONO_16BIT`)
**Message protocol:**
  - Client sends: `input_text_buffer.append`, `input_text_buffer.commit`
  - Server sends: `response.audio.delta` (Base64 PCM chunks), `response.done`
  - Modes: `server_commit` (server decides segmentation) or `commit` (client controls)
**Confidence:** MEDIUM — official docs show the protocol clearly but only Python/Java SDK examples; WebSocket message format is documented

**Voice cloning model constraint:** The `target_model` set during enrollment MUST match the synthesis model. Once you enroll a voice against `qwen3-tts-vc-realtime-2026-01-15`, you must use that exact model for synthesis. Changing synthesis model requires re-enrollment.

### Voice Cloning Enrollment (One-Time Setup)

**Model:** `qwen-voice-enrollment` (fixed, not modifiable)
**Audio requirements:** WAV/MP3/M4A, 16-bit, ≥24 kHz, mono, 10–20 seconds, clear speech, <10MB
**Cost:** $0.01 per enrollment; 1,000 free attempts in first 90 days
**Returns:** A `voice` identifier string (e.g., `qwen-tts-vc-kaleb-voice-20260409-xxxx`)
**This voice ID is persistent** — enroll once, store the ID, reuse in all subsequent TTS calls

**Recommended flow:**
1. Record 15–20s of clean Kaleb speech audio
2. Call enrollment endpoint once (can be a script, not part of app)
3. Store returned `voice` ID in env var (`DASHSCOPE_VOICE_ID`)
4. TTS synthesis always uses this stored voice ID

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Direct browser WebSocket to DashScope | Server-side WebSocket relay | If temporary token auth for WS proves unreliable; adds latency and requires a persistent server outside Vercel (e.g., Railway, Fly.io) |
| `openai` SDK with DashScope `baseURL` | `@ai-sdk/alibaba` | If you want `streamText()` and built-in streaming UI helpers from Vercel AI SDK; more abstraction, less control |
| Qwen3-TTS-VC-Realtime WebSocket | Qwen3-TTS-VC REST (non-streaming) | For batch/non-interactive synthesis; not suitable for conversational voice — latency is too high |
| DashScope hosted API | Self-hosted Qwen3-TTS open-source model | If voice cloning API cost is prohibitive or data privacy is required; requires GPU server (not trivial on M4 Max without CUDA) |
| Qwen3-ASR-Flash-Realtime | Paraformer-realtime-v2 | If Qwen3 ASR latency is too high; Paraformer is the older production-grade model, well-tested |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `dashscope` Python SDK | Python-only, irrelevant to this TypeScript/Next.js project | Raw WebSocket with `ws` or browser WebSocket API |
| OpenAI Realtime API (`gpt-4o-realtime-preview`) | Being replaced — no voice cloning, higher cost, no control over voice | DashScope Qwen pipeline |
| Server-side WebSocket proxy on Vercel | Vercel serverless functions do not support persistent connections; they timeout | Direct browser WebSocket + temporary DashScope token |
| `ScriptProcessorNode` (deprecated) | Being removed from browsers; already causing deprecation warnings | `AudioWorkletNode` — drop-in replacement with better performance and no main thread blocking |
| Hardcoded permanent API key in client code | Security risk — key exposed in browser | DashScope temporary token endpoint (60s–1800s TTL) fetched from server-side API route |

---

## Audio Format Changes vs Current Implementation

| Parameter | Current (OpenAI) | New (DashScope ASR) | New (DashScope TTS) |
|-----------|------------------|---------------------|---------------------|
| Sample rate | 24,000 Hz | 16,000 Hz | 24,000 Hz output |
| Format | PCM16 Base64 | PCM Base64 | PCM Base64 |
| Channels | Mono | Mono | Mono |
| Chunk size | 4,096 samples (ScriptProcessor) | ~3,200 bytes (0.1s at 16kHz) | N/A (output, not input) |

The `downsample()` function in `useRealtimeVoice.ts` targets `SAMPLE_RATE = 24000`. Change to 16,000 for ASR input. TTS output arrives at 24,000 Hz — playback code stays the same.

---

## New Environment Variables Required

| Variable | Purpose | Source |
|----------|---------|--------|
| `DASHSCOPE_API_KEY` | Permanent DashScope API key for server-side calls | Alibaba Cloud Model Studio console (Singapore) |
| `DASHSCOPE_VOICE_ID` | Kaleb's cloned voice ID from enrollment | Run enrollment script once, store result |

Remove (or keep for rollback): `OPENAI_API_KEY`

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| `openai@6.x` | DashScope OpenAI-compat endpoint | Requires `baseURL` override and `dangerouslyAllowBrowser: false` for server-side use |
| `ws@8.x` | Bun runtime | Confirmed Bun-compatible; use for any server-side WebSocket relay if needed |
| Next.js 16 App Router | DashScope REST API routes | Standard `fetch` in Route Handlers works; no special config needed |

---

## Confidence Assessment by Area

| Area | Confidence | Basis |
|------|------------|-------|
| LLM (Qwen via OpenAI-compat) | HIGH | Official Alibaba docs confirm OpenAI SDK compatibility; `baseURL` swap is the entire change |
| Voice cloning enrollment API | HIGH | Full request/response schema documented in official docs with curl examples |
| TTS WebSocket protocol | MEDIUM | Event types documented; no JavaScript example in official docs; Python SDK examples available |
| ASR WebSocket protocol | MEDIUM | Node.js `ws` example exists in official docs; message format confirmed |
| Temporary token for WebSocket auth | LOW | Token endpoint documented for HTTP; WebSocket compatibility is not explicitly confirmed in docs |
| `@ai-sdk/alibaba` package | LOW | Exists on ai-sdk.dev; version/stability not independently verified; TTS not in scope for this SDK |

---

## Sources

- [Qwen Voice Cloning API Reference](https://www.alibabacloud.com/help/en/model-studio/qwen-tts-voice-cloning) — enrollment endpoint, audio requirements, voice ID response format
- [Qwen Real-Time TTS WebSocket](https://www.alibabacloud.com/help/en/model-studio/qwen-tts-realtime) — protocol, message types, audio formats
- [Qwen Real-Time ASR WebSocket](https://www.alibabacloud.com/help/en/model-studio/qwen-real-time-speech-recognition) — Node.js ws example, session.update format, audio chunk format
- [DashScope Temporary API Key](https://www.alibabacloud.com/help/en/model-studio/generate-temporary-api-key) — token endpoint, 60s default / 1800s max TTL
- [DashScope OpenAI-Compatible API](https://www.alibabacloud.com/help/en/model-studio/compatibility-of-openai-with-dashscope) — baseURL, authentication, streaming support
- [Vercel WebSocket Limitation](https://vercel.com/kb/guide/do-vercel-serverless-functions-support-websocket-connections) — confirmed: serverless functions do not support WebSocket
- [Qwen3-TTS GitHub Repository](https://github.com/QwenLM/Qwen3-TTS) — open-source model details, voice cloning capabilities
- [AI SDK Alibaba Provider](https://ai-sdk.dev/providers/ai-sdk-providers/alibaba) — `@ai-sdk/alibaba` package existence and capabilities

---

*Stack research for: Alibaba Cloud / Qwen real-time voice AI pipeline*
*Researched: 2026-04-09*
