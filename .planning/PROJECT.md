# Kaleb's AI Voice Portfolio

## What This Is

A terminal-themed personal portfolio website where visitors interact with an AI voice clone of Kaleb. Instead of reading a static resume, visitors have a real-time voice conversation with an AI that speaks in Kaleb's cloned voice, answering questions about his achievements, experience, and projects as if Kaleb himself is talking. Built on Next.js with a sci-fi "Kortix Neural Interface" terminal UI.

## Core Value

Visitors can have a natural, human-sounding voice conversation with an AI clone of Kaleb that authentically represents his experience and personality.

## Current State (v1.0 shipped 2026-04-12)

- **Production**: https://nim-kaleb.vercel.app
- **WS Server**: wss://ws.kalebnim.dev (Alibaba Cloud ECS, Singapore)
- **Voice Pipeline**: DashScope ASR (qwen3-asr-flash-realtime) → LLM (qwen-plus) → TTS (qwen3-tts-vc with Kaleb's cloned voice)
- **Browser**: Next.js 16 + React 19 + TypeScript, terminal-themed UI with state machine
- **Server**: Bun WS server with full streaming pipeline, proactive greeting, 20-turn memory, barge-in handling
- **Tests**: 1 UI smoke test + 9 backend/WS pipeline tests (Playwright)
- **Known Issue**: TTS playback quality (overlapping audio, cut-offs, inconsistent barge-in)

## Architecture

```
Browser (Vercel)          Alibaba Cloud ECS           DashScope APIs
┌──────────────┐         ┌──────────────────┐        ┌─────────────┐
│ Next.js App  │◄──wss──►│ Bun WS Server    │◄──ws──►│ ASR (STT)   │
│ Terminal UI  │         │ Session Manager   │◄─http─►│ LLM (qwen+) │
│ Audio Capture│         │ Pipeline Orchest. │◄──ws──►│ TTS (clone) │
└──────────────┘         └──────────────────┘        └─────────────┘
```

## Constraints

- **Provider**: Alibaba Cloud for entire voice pipeline (STT + LLM + TTS)
- **TTS Model**: Qwen3-TTS with voice cloning capability
- **Speech Quality**: Must sound conversational, not robotic
- **Backward Compatibility**: Terminal UI and state machine must remain intact
- **Runtime**: Bun (not npm/node)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Alibaba Cloud over OpenAI Realtime | Full pipeline control, voice cloning via Qwen3-TTS | v1.0 |
| Document-based context over RAG | Portfolio scope doesn't need dynamic retrieval | v1.0 |
| Keep terminal UI unchanged | Strong existing design, focus effort on voice pipeline | v1.0 |
| TTS server_commit gating | DashScope sends response.done per segment; only forward after session.finish | v1.0 |
| AI greets first on connect | Better UX — visitor hears Kaleb immediately | v1.0 |
| Alibaba Cloud ECS over Railway | User has $300 free credits, keeps infra on 2 providers | v1.0 |

## Current Milestone: v1.1 Observability, Testing & Bug Fixes

**Goal:** Add conversation analytics/logging, comprehensive automated testing (E2E audio + component health), and fix known v1.0 TTS playback issues.

**Target features:**
- Analytics & logging of conversation transcripts, question classification, session metrics
- Playwright E2E audio tests including interrupt/barge-in behavior
- Unit/integration tests for WS server, ASR, and TTS component health
- Fix TTS playback quality (overlapping audio, cut-offs, inconsistent barge-in)

## Evolution

This document evolves at phase transitions and milestone boundaries.

---
*Last updated: 2026-04-13 after v1.1 milestone start*
