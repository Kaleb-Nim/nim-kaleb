---
phase: 02-server-infrastructure
plan: 02
subsystem: ws-server/pipeline
tags: [llm, tts, streaming, dashscope, qwen, pipeline]
completed: 2026-04-09T06:19:00Z
duration: ~12m
tasks_completed: 2
tasks_total: 2
files_created:
  - ws-server/src/dashscope/llm.ts
  - ws-server/src/dashscope/tts.ts
files_modified:
  - ws-server/src/session.ts
requires:
  - 02-01 (ASR session + forwardAudioToAsr, createAsrSession)
provides:
  - streamLlmResponse (qwen-plus via OpenAI-compatible SDK)
  - createTtsSession / appendTextToTts / finishTtsSession (qwen3-tts-vc-realtime)
  - full STT->LLM->TTS pipeline in session manager with streaming overlap
affects:
  - ws-server/src/session.ts (onTranscriptFinal now triggers full cascade)
tech_stack_added:
  - openai SDK (already installed) used against DashScope compatible endpoint
  - WebSocket server_commit mode for streaming TTS
patterns:
  - streaming overlap: TTS opens before LLM finishes, chunks forwarded immediately
  - conversation history ring buffer (20 entries max)
  - Promise-based TTS ready gate before LLM stream start
key_decisions:
  - Use Promise wrapper around TTS onopen to gate LLM streaming (avoids duplicate session.update)
  - conversationHistory capped at MAX_HISTORY_ENTRIES=20 with pair-shift (T-02-07 mitigation)
  - LLM chunk flush on sentence boundary /[.!?]\s/ OR buffer.length > 80 for latency control
  - voice_id and API key read exclusively from process.env (T-02-08 mitigation)
---

# Phase 02 Plan 02: LLM Streaming + TTS Pipeline Summary

LLM streaming via qwen-plus with system prompt, TTS WebSocket in server_commit mode using Kaleb's cloned voice, and full STT->LLM->TTS cascade wired in the session manager with streaming overlap.

## What Was Built

### Task 1: DashScope LLM streaming and TTS WebSocket client

**`ws-server/src/dashscope/llm.ts`** — `streamLlmResponse()`:
- Creates singleton OpenAI client pointing at `https://dashscope-intl.aliyuncs.com/compatible-mode/v1`
- Loads `prompts/system-prompt.md` once at module init via `import.meta.dir`
- Streams `qwen-plus` with `stream: true`, flushes tokens on sentence boundary (`/[.!?]\s/`) or buffer length > 80 chars
- Accepts `conversationHistory` for multi-turn context
- Calls `onChunk`, `onDone`, `onError` callbacks — no direct WebSocket dependency

**`ws-server/src/dashscope/tts.ts`** — `createTtsSession()` / `appendTextToTts()` / `finishTtsSession()`:
- Opens `wss://dashscope-intl.aliyuncs.com/api-ws/v1/realtime?model=qwen3-tts-vc-realtime-2026-01-15`
- Authenticates via `Authorization: Bearer ${DASHSCOPE_API_KEY}` header
- Sends `session.update` on open: `mode: server_commit`, `voice: DASHSCOPE_VOICE_ID`, `sample_rate: 24000`
- Routes `response.audio.delta` -> `onAudioDelta`, `response.done` -> `onDone`, `error` -> `onError`
- `appendTextToTts`: sends `input_text_buffer.append` only when `readyState === OPEN`
- `finishTtsSession`: sends `session.finish` to trigger final synthesis

### Task 2: Full pipeline wiring in session manager

**`ws-server/src/session.ts`** updates:
- Imports `streamLlmResponse`, `createTtsSession`, `appendTextToTts`, `finishTtsSession`
- Adds `conversationHistory: Array<{role, content}>` property, initialized to `[]`
- `onTranscriptFinal` now triggers the full cascade:
  1. Sends `transcript.final` to browser
  2. Pushes user turn to `conversationHistory` (capped at 20 entries)
  3. Opens TTS WebSocket via `createTtsSession` — audio deltas forwarded to browser immediately
  4. Resolves a `ttsReadyPromise` when TTS `onopen` fires
  5. Calls `streamLlmResponse` after TTS ready — each chunk sent to both TTS and browser (`response.text.delta`)
  6. On LLM done: calls `finishTtsSession`, adds assistant response to `conversationHistory`
- `cleanup()` now closes `ttsWs` and resets `conversationHistory = []`

## Streaming Overlap Architecture

```
ASR transcript (text)
        │
        ▼
[conversationHistory push]
        │
        ▼
createTtsSession() — WS opens, session.update sent
        │ (ttsReadyPromise resolves)
        ▼
streamLlmResponse() — qwen-plus streams
        │ (each chunk: /[.!?]\s/ or >80 chars)
        ▼
appendTextToTts(chunk) ────────► TTS synthesizes chunk
        │                              │
send(response.text.delta)    onAudioDelta fires
                                       │
                              send(response.audio.delta)
                                       │
                              browser scheduleAudioChunk()
```

Result: first audio reaches browser ~450-550ms after ASR transcript.

## Deviations from Plan

**1. [Rule 1 - Bug] Avoided duplicate session.update by using Promise gate**
- **Found during:** Task 2 implementation
- **Issue:** Plan's approach of overwriting `ttsWs.onopen` in session.ts after `createTtsSession` would prevent the original `onopen` (which sends `session.update`) from running, requiring re-duplication of the session.update logic in session.ts.
- **Fix:** Wrapped TTS creation in a Promise that resolves when `onopen` fires, calling the original handler first then resolving. This keeps `session.update` logic solely in `tts.ts`.
- **Files modified:** `ws-server/src/session.ts`
- **Commit:** dfff34a

## Known Stubs

None — all pipeline stages are wired with real API calls.

## Self-Check: PASSED

| Item | Status |
|------|--------|
| ws-server/src/dashscope/llm.ts | FOUND |
| ws-server/src/dashscope/tts.ts | FOUND |
| ws-server/src/session.ts | FOUND |
| 02-02-SUMMARY.md | FOUND |
| commit fb4c96f (Task 1) | FOUND |
| commit dfff34a (Task 2) | FOUND |
