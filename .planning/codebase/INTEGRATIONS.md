# External Integrations

**Analysis Date:** 2025-04-09

## APIs & External Services

**OpenAI Realtime API:**
- Service: OpenAI GPT-4 Realtime API for bidirectional voice communication
- What it's used for: Real-time speech-to-text transcription, LLM responses, and text-to-speech audio generation via voice interface
- SDK/Client: `openai` package (v6.32.0)
- Auth: `OPENAI_API_KEY` environment variable (required)
- Model: `gpt-4o-realtime-preview-2024-12-17`
- Voice: `alloy`
- Endpoints:
  - Session creation: `https://api.openai.com/v1/realtime/sessions` (POST) → returns ephemeral token
  - WebSocket connection: `wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17`
  - Protocols: Realtime WebSocket with audio codecs (PCM16 format)

**Anthropic Claude API:**
- SDK: `@anthropic-ai/sdk` package (v0.78.0) installed
- Auth: Reads from `ANTHROPIC_API_KEY` environment variable (optional - SDK supports this)
- Status: SDK installed but not currently integrated into application logic
- Potential use case: Could be used for alternative LLM inference

**Google Fonts API:**
- Service: Anonymous Pro monospace font delivery
- What it's used for: Terminal UI typography (13px monospace font for authenticity)
- Implementation: `next/font/google` loader in `app/layout.tsx`
- Font: Anonymous Pro with weights 400 and 700
- CSS Variable: `--font-anonymous-pro` (used in root layout body className)
- Display strategy: `swap` (prevents FOUT during initial load)

## Data Storage

**File Storage:**
- Local filesystem only
- `memory/context.json` - Application memory/context data loaded at runtime
- Loaded via `lib/memory.ts` functions: `loadContext()`, `buildSystemPrompt()`

**Databases:**
- None configured (stateless application)

**Caching:**
- None explicit (Next.js build-time caching)

## Authentication & Identity

**Auth Provider:**
- Custom: No external auth provider
- Application: All users access the same interface (personal portfolio)
- OpenAI: API key-based authentication for Realtime API
- WebSocket Authentication: Uses ephemeral tokens from session endpoint

**Session Management:**
- Ephemeral tokens: 24-hour limited-use tokens from OpenAI session endpoint
- Token flow: 
  1. Client calls `POST /api/realtime/session`
  2. Server exchanges `OPENAI_API_KEY` for ephemeral `client_secret.value`
  3. Client uses token in WebSocket connection header as `openai-insecure-api-key.{token}`

## Monitoring & Observability

**Error Tracking:**
- None detected (no Sentry, DataDog, or similar)

**Logs:**
- Console-based only (browser console for client-side)
- No centralized logging service

**Analytics:**
- None detected

## CI/CD & Deployment

**Hosting:**
- Vercel - Serverless platform for Next.js
- Project ID: `prj_26Zk2jxE6tNDTX1lDwmoGCr0qY4c`
- Organization ID: `team_4iQmmqqTVw6sdJ6eJrGYrWej`
- Project Name: `nim-kaleb`
- Config location: `.vercel/project.json`

**CI Pipeline:**
- GitHub (inferred from git history in prompt)
- No explicit CI configuration files detected (no GitHub Actions workflows)
- Build command: `bun run build`
- Start command: `bun start`
- Environment variables configured in Vercel dashboard

## Environment Configuration

**Required env vars:**
- `OPENAI_API_KEY` - OpenAI API key for Realtime API access (required at runtime)
- `ANTHROPIC_API_KEY` - Anthropic API key (optional, SDK supports but not currently used)

**Development:**
- `.env.local` file present (contains sensitive credentials)
- Must never be committed (should be in `.gitignore`)

**Production:**
- Environment variables configured in Vercel project dashboard
- Secrets are injected at deployment time
- Never exposed in built bundle

## Webhooks & Callbacks

**Incoming:**
- None (stateless application)

**Outgoing:**
- OpenAI Realtime WebSocket events: Application listens for and responds to OpenAI WebSocket messages
  - `session.created` - Connection established
  - `input_audio_buffer.speech_started` - User speaking detected
  - `conversation.item.input_audio_transcription.completed` - Transcript available
  - `response.created` - LLM generating response
  - `response.audio.delta` - Audio chunk from LLM (streamed)
  - `response.audio_transcript.delta` - LLM response text (streamed)
  - `response.audio.done` - Audio generation complete
  - `error` - Error event from OpenAI

## Audio Pipeline

**Client-side Audio Processing:**
- Input: Web Audio API with `getUserMedia()` microphone capture
- Sample Rate: 24000 Hz (downsampled from device capture rate)
- Format: PCM16 (signed 16-bit samples)
- Encoding: Base64 for transmission over WebSocket
- Output: Web Audio API `AudioContext` for speaker playback
- Buffer Management: `ScriptProcessorNode` for real-time audio capture, `BufferSource` for playback with timing scheduling

**Audio Conversion Functions:**
- `pcm16ToFloat32()` - Decode PCM16 bytes to float samples
- `float32ToPcm16Base64()` - Encode float samples to PCM16 Base64
- `downsample()` - Resample from device rate to 24000 Hz
- `base64ToArrayBuffer()` - Decode Base64 to binary buffer

---

*Integration audit: 2025-04-09*
