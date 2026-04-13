---
phase: 02-server-infrastructure
plan: 03
subsystem: browser-voice-hook
tags: [websocket, audio, refactor, auto-reconnect, dashscope]
dependency_graph:
  requires: [02-02]
  provides: [browser-ws-client, auto-reconnect]
  affects: [app/hooks/useRealtimeVoice.ts, app/components/VoiceInterface.tsx]
tech_stack:
  patterns: [exponential-backoff-reconnect, dual-audio-context, pcm16-streaming]
key_files:
  modified:
    - app/hooks/useRealtimeVoice.ts
    - app/components/VoiceInterface.tsx
decisions:
  - "Dual AudioContext: separate 16kHz mic capture context and 24kHz playback context"
  - "Auto-reconnect uses intentionalCloseRef flag to distinguish deliberate disconnect from drops"
  - "connectInternal extracted as separate function so reconnect timer can call it without re-entering connect()"
  - "VoiceInterface.tsx updated from useVoicePipeline to useRealtimeVoice to align with Bun WS protocol"
metrics:
  completed_date: "2026-04-09"
  tasks_completed: 1
  tasks_pending: 1
  files_modified: 2
---

# Phase 2 Plan 3: Browser Hook Refactor — Bun WS Server Protocol Summary

**One-liner:** useRealtimeVoice refactored to target Bun WS server with dual 16kHz/24kHz AudioContexts, new DashScope message protocol, and exponential backoff auto-reconnect.

## Status

| Task | Name | Status | Commit |
|------|------|--------|--------|
| 1 | Refactor useRealtimeVoice.ts for Bun WS server protocol with auto-reconnect | COMPLETE | 3e20f01 |
| 2 | Verify end-to-end voice pipeline | PENDING — awaiting human verification | — |

**Task 2 is a `checkpoint:human-verify` gate.** It requires manually running the WS server and Next.js dev server, then confirming the voice pipeline works end-to-end with Kaleb's cloned voice. See verification steps below.

## What Was Built (Task 1)

### useRealtimeVoice.ts
Complete refactor replacing the OpenAI Realtime WebSocket connection with the Bun WS server protocol.

**Key changes:**
- `WS_SERVER_URL` from `NEXT_PUBLIC_WS_SERVER_URL` env var (default: `ws://localhost:8080`)
- Connection: `new WebSocket(WS_SERVER_URL + '/ws')` — no subprotocol headers
- No token fetch — browser connects directly to Bun server (no `/api/realtime/session`)
- `MIC_SAMPLE_RATE = 16000` (ASR requirement), `PLAYBACK_SAMPLE_RATE = 24000` (TTS output)
- Two separate AudioContexts: `audioCtxRef` (16kHz mic) and `playbackCtxRef` (24kHz playback)
- On WS open: sends `{ type: 'session.start' }` to initialize DashScope sessions
- Audio send: `{ type: 'audio.append', data: b64 }` (was `input_audio_buffer.append`)
- Handlers: `session.ready`, `transcript.partial`, `transcript.final`, `response.audio.delta`, `response.text.delta`, `response.done`, `error`
- Auto-reconnect: exponential backoff `Math.min(1000 * 2 ** retries, 30000)`, max 5 retries
- `intentionalCloseRef` prevents reconnect on user-initiated disconnect
- External interface unchanged: `{ status, analyserRef, connect, disconnect, isConnected }`

**Audio functions retained (unchanged):**
- `pcm16ToFloat32()`, `base64ToArrayBuffer()`, `scheduleAudioChunk()`, `float32ToPcm16Base64()`, `downsample()`

### VoiceInterface.tsx
Updated to import and use `useRealtimeVoice` instead of `useVoicePipeline`. Interface pattern is `connect`/`disconnect`/`isConnected` (WebSocket-style), replacing the old `startRecording`/`stopRecording` (push-to-talk style).

## Files Modified

| File | Change |
|------|--------|
| `app/hooks/useRealtimeVoice.ts` | Full refactor — new protocol, dual AudioContext, auto-reconnect |
| `app/components/VoiceInterface.tsx` | Switch from useVoicePipeline to useRealtimeVoice |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing critical update] VoiceInterface.tsx updated to match hook interface**
- **Found during:** Task 1
- **Issue:** The worktree's `VoiceInterface.tsx` imported `useVoicePipeline` (old push-to-talk hook) rather than `useRealtimeVoice`. The plan's context showed the target state already using `useRealtimeVoice`, but the worktree branch diverged from main and had the old implementation.
- **Fix:** Rewrote `VoiceInterface.tsx` to use `useRealtimeVoice` with `connect`/`disconnect`/`isConnected` pattern, matching the plan's intended interface.
- **Files modified:** `app/components/VoiceInterface.tsx`
- **Commit:** 3e20f01

## Task 2: Pending Human Verification

**What to verify:**

1. Start WS server:
   ```bash
   cd /Users/kalebnim/Documents/GitHub/nim-kaleb/ws-server
   DASHSCOPE_API_KEY=sk-689ad643166e4986b26b6a34bfbb5297 \
   DASHSCOPE_VOICE_ID=qwen-tts-vc-kaleb-voice-20260409131147531-d171 \
   bun run dev
   ```

2. Start Next.js (in the worktree or main repo):
   ```bash
   cd /Users/kalebnim/Documents/GitHub/nim-kaleb/.claude/worktrees/agent-a44699b8
   bun dev
   ```

3. Open http://localhost:3000, complete terminal boot (type "1" + Enter), grant mic access.

4. Speak a question: "Tell me about your experience at RAID" — verify response arrives in Kaleb's voice within ~1-2 seconds.

5. Test auto-reconnect: kill the WS server (Ctrl+C), wait 2 seconds, restart. Browser should reconnect without page reload.

6. Test deferred voice verification (intonation variation):
   - Achievement topic: "What's your proudest hackathon win?" — voice should sound proud/energetic
   - Challenge topic: "What's been the hardest part of your career?" — voice should sound more reflective

**Resume signal:** Type "approved" if voice works end-to-end and sounds like Kaleb, or describe issues.

## Self-Check

### Created/Modified Files Exist
- [x] `app/hooks/useRealtimeVoice.ts` — created at commit 3e20f01
- [x] `app/components/VoiceInterface.tsx` — modified at commit 3e20f01

### Commits Exist
- [x] `3e20f01` — refactor(02-03): replace OpenAI Realtime with Bun WS server protocol

### Build
- [x] `bun run build` passes — compiled successfully with no TypeScript errors

## Self-Check: PASSED
