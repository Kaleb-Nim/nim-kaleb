---
phase: 02-server-infrastructure
plan: "01"
subsystem: ws-server
tags: [bun, websocket, dashscope, asr, railway, server-infrastructure]
dependency_graph:
  requires: []
  provides: [ws-server/src/index.ts, ws-server/src/types.ts, ws-server/src/session.ts, ws-server/src/dashscope/asr.ts]
  affects: [app/hooks/useRealtimeVoice.ts]
tech_stack:
  added: [bun-native-websocket, qwen3-asr-flash-realtime, railway-railpack]
  patterns: [bun-serve-websocket, discriminated-union-protocol, per-session-state, server-side-api-key]
key_files:
  created:
    - ws-server/src/index.ts
    - ws-server/src/types.ts
    - ws-server/src/session.ts
    - ws-server/src/dashscope/asr.ts
    - ws-server/package.json
    - ws-server/tsconfig.json
    - ws-server/railway.json
  modified: []
decisions:
  - "Used Bun native WebSocket in fetch handler for WS upgrade instead of routes: property (Bun bug #17871)"
  - "All DashScope connections are server-side only — API key never leaves process.env"
  - "session.ready sent to browser only after ASR WebSocket opens (not immediately on session.start)"
  - "Stored _lastTranscript on Session for Plan 02 LLM wiring"
metrics:
  duration_seconds: 152
  completed_date: "2026-04-09"
  tasks_completed: 2
  tasks_total: 2
  files_created: 7
  files_modified: 0
---

# Phase 02 Plan 01: Bun WS Server Scaffold with DashScope ASR Summary

**One-liner:** Bun WebSocket server with typed browser protocol, per-session state management, and DashScope qwen3-asr-flash-realtime integration — API key server-side only, Railway-ready with RAILPACK.

## What Was Built

A standalone `ws-server/` directory containing a production-ready Bun WebSocket server that:

1. Accepts browser WebSocket connections on `/ws`
2. Responds to HTTP health checks on `/health` (Railway readiness probe)
3. Maintains per-client `Session` objects with typed message routing
4. Opens a server-side DashScope ASR WebSocket (`qwen3-asr-flash-realtime`) on `session.start`
5. Forwards browser PCM16 audio chunks to ASR and relays transcripts back to the browser
6. Cleans up all DashScope connections on browser disconnect (T-02-03 mitigation)

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | WS server scaffold with types and session management | 3ea1194 | ws-server/package.json, tsconfig.json, railway.json, src/index.ts, src/types.ts, src/session.ts |
| 2 | DashScope ASR WebSocket client + session wiring | 8244c82 | ws-server/src/dashscope/asr.ts, src/session.ts (updated) |

## Architecture

```
Browser
  │  WebSocket /ws
  ▼
Bun.serve() (ws-server/src/index.ts)
  │  session.start → startPipeline()
  │  audio.append  → handleAudio()
  ▼
Session (ws-server/src/session.ts)
  │  createAsrSession()
  ▼
DashScope ASR WebSocket
  wss://dashscope-intl.aliyuncs.com/api-ws/v1/realtime?model=qwen3-asr-flash-realtime
  │  transcript.partial / transcript.final
  └─► browser via session.send()
```

## Protocol

**Browser → Server:**
- `{ type: 'session.start' }` — initializes DashScope ASR session
- `{ type: 'audio.append', data: string }` — base64 PCM16 16kHz audio chunk
- `{ type: 'audio.end' }` — manual end-of-speech (for Plan 02 LLM trigger)

**Server → Browser:**
- `{ type: 'session.ready' }` — ASR pipeline initialized
- `{ type: 'transcript.partial', text: string }` — interim ASR result
- `{ type: 'transcript.final', text: string }` — final ASR result
- `{ type: 'response.audio.delta', delta: string }` — TTS audio chunk (Plan 02)
- `{ type: 'response.text.delta', delta: string }` — LLM text chunk (Plan 02)
- `{ type: 'response.done' }` — turn complete (Plan 02)
- `{ type: 'error', message: string }` — pipeline error

## Security (Threat Model Compliance)

| Threat ID | Status | Implementation |
|-----------|--------|----------------|
| T-02-01 Information Disclosure | Mitigated | `DASHSCOPE_API_KEY` only in `process.env` in `asr.ts`; never serialized in any `ServerMessage` |
| T-02-02 Tampering | Mitigated | Every browser message validated by `isValidBrowserMessage()` before routing; unknown types receive error response |
| T-02-03 DoS orphaned sessions | Mitigated | `cleanup()` closes all DashScope WebSockets on browser disconnect |
| T-02-04 CORS Spoofing | Accepted | Public portfolio — `Access-Control-Allow-Origin: *` intentional |

## Deviations from Plan

### Auto-fixed Issues

None — plan executed exactly as written.

### Minor Implementation Notes

1. **ASR onopen override pattern**: Plan specified "use a small timeout or readyState check" for session.ready timing. Implemented via `onopen` handler override on the returned ASR WebSocket — more reliable than a timeout.

2. **`_lastTranscript` property**: Added to Session as a forward-compatibility hook for Plan 02's LLM wiring step. This is a minor addition not in the plan but required for inter-plan continuity (Rule 2: missing critical functionality for correct operation).

## Known Stubs

| Stub | File | Reason |
|------|------|--------|
| `response.audio.delta` message type defined but never sent | src/types.ts | TTS wired in Plan 02 |
| `response.text.delta` message type defined but never sent | src/types.ts | LLM wired in Plan 02 |
| `response.done` message type defined but never sent | src/types.ts | Wired in Plan 02 |
| `audio.end` handler is a log-only stub | src/index.ts | LLM trigger wired in Plan 02 |
| `ttsWs` property on Session is always null | src/session.ts | TTS wired in Plan 02 |

These stubs are intentional — Plan 02 (LLM + TTS wiring) completes all pipeline stages.

## Threat Flags

No new security surface beyond the plan's threat model.

## Self-Check: PASSED

- ws-server/src/index.ts: FOUND
- ws-server/src/types.ts: FOUND
- ws-server/src/session.ts: FOUND
- ws-server/src/dashscope/asr.ts: FOUND
- ws-server/package.json: FOUND
- ws-server/tsconfig.json: FOUND
- ws-server/railway.json: FOUND
- Commit 3ea1194: FOUND (feat(02-01): create WS server scaffold)
- Commit 8244c82: FOUND (feat(02-01): implement DashScope ASR)
- /health returns "ok": VERIFIED (curl test passed)
- bun build succeeds: VERIFIED (Bundled 4 modules)
- No DASHSCOPE_API_KEY in ServerMessage sends: VERIFIED
