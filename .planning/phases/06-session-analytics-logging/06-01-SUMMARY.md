---
phase: 06-session-analytics-logging
plan: 01
subsystem: ws-server/logging
tags: [logging, analytics, latency, ndjson, observability]
dependency_graph:
  requires: []
  provides: [turn-logging, latency-instrumentation, log-directory-init]
  affects: [ws-server/src/session.ts, ws-server/src/dashscope/asr.ts, ws-server/src/index.ts]
tech_stack:
  added: []
  patterns: [fire-and-forget logging, closure-scoped latency tracking, NDJSON append]
key_files:
  created:
    - ws-server/src/logger.ts
  modified:
    - ws-server/src/session.ts
    - ws-server/src/dashscope/asr.ts
    - ws-server/src/index.ts
decisions:
  - Used appendFileSync in fire-and-forget Promise.resolve().then() to avoid blocking voice pipeline
  - Latency tracking uses closure-scoped variables per turn rather than class-level state
  - User turns logged with ASR duration only; assistant turns logged with all four latency metrics
key_decisions:
  - Fire-and-forget logging via Promise.resolve().then(appendFileSync) keeps voice latency unaffected
  - Closure-scoped timing per startResponse() call avoids state leaks between concurrent turns
metrics:
  duration: 144s
  completed: 2026-04-13T03:21:19Z
  tasks_completed: 2
  tasks_total: 2
  files_created: 1
  files_modified: 3
---

# Phase 06 Plan 01: Per-Turn NDJSON Logging with Latency Breakdowns Summary

Structured NDJSON per-turn logging with four-component latency breakdown (ASR, LLM TTFT, TTS TTFA, total) using fire-and-forget writes to avoid impacting voice response times.

## What Was Built

### Logger Module (`ws-server/src/logger.ts`)
- `TurnLog` interface with sessionId, role, text, ts, and latency object (asrMs, llmTtftMs, ttsTtfaMs, totalMs)
- `initLogDir()` creates LOG_DIR (default `/var/log/kaleb-voice`) at server startup
- `logTurn()` writes NDJSON lines via `Promise.resolve().then(() => appendFileSync(...))` -- never awaited

### ASR Callback Extension (`ws-server/src/dashscope/asr.ts`)
- Added optional `onSpeechStarted` callback to `AsrCallbacks` interface
- `input_audio_buffer.speech_started` case now invokes `callbacks.onSpeechStarted?.()`

### Session Instrumentation (`ws-server/src/session.ts`)
- `startResponse()` now accepts `asrDurationMs` in opts for end-to-end ASR timing
- Closure-scoped latency variables per turn: `turnStart`, `llmTtftMs`, `ttsTtfaMs`, `ttsOpenTime`, `firstLlmChunk`, `firstTtsAudio`
- LLM TTFT captured on first chunk in `onChunk` callback
- TTS TTFA captured on first audio delta in `onAudioDelta` callback
- Assistant turn logged in `onDone` with abort guard (barge-in turns skipped)
- Greeting turns logged with `text: '[greeting]'`
- User turns logged in `onTranscriptFinal` with ASR duration
- `asrSpeechStart` tracked via `onSpeechStarted` callback in `startPipeline()`

### Server Startup (`ws-server/src/index.ts`)
- `initLogDir()` called before `Bun.serve()` to ensure log directory exists

## Commits

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Create logger module and extend ASR callbacks | f62f246 | ws-server/src/logger.ts, ws-server/src/dashscope/asr.ts, ws-server/src/index.ts |
| 2 | Instrument session.ts with latency tracking and logTurn calls | bb5d2b3 | ws-server/src/session.ts |

## Deviations from Plan

None -- plan executed exactly as written.

## Known Stubs

None -- all data paths are wired to real logging output.

## Self-Check: PASSED

All 4 files verified on disk. Both commit hashes (f62f246, bb5d2b3) confirmed in git log.
