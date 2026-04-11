# Kaleb's AI Voice Portfolio

## What This Is

A terminal-themed personal portfolio website where visitors interact with an AI voice clone of Kaleb. Instead of reading a static resume, visitors have a real-time voice conversation with an AI that speaks in Kaleb's cloned voice, answering questions about his achievements, experience, and projects as if Kaleb himself is talking. Built on Next.js with a sci-fi "Kortix Neural Interface" terminal UI.

## Core Value

Visitors can have a natural, human-sounding voice conversation with an AI clone of Kaleb that authentically represents his experience and personality.

## Requirements

### Validated

- ✓ Terminal-themed UI with macOS chrome, starfield background, typewriter animations — existing
- ✓ Linear state machine (BOOTING → STATUS → MENU → PROCESSING → CONNECTING → VOICE) — existing
- ✓ Canvas-based starfield with twinkling animation — existing
- ✓ Cognitive Status dashboard with monospace alignment — existing
- ✓ Voice interface with push-to-talk and waveform visualization — existing
- ✓ Server-side API proxy for secure key handling — existing
- ✓ Responsive layout (desktop/tablet/mobile) — existing
- ✓ Playwright e2e test infrastructure — existing

### Active

- ✓ Replace OpenAI Realtime API with Alibaba Cloud full pipeline (STT + LLM + TTS) — Validated in Phase 2: Bun WS server with DashScope ASR + qwen-plus LLM + Qwen3-TTS pipeline
- ✓ Clone Kaleb's voice using Qwen3-TTS for personalized speech synthesis — Validated in Phase 1+2: voice enrolled, end-to-end pipeline confirmed with cloned voice
- ✓ Human-like speech control instructions (filler words: "erm", "uh", natural pauses) — Validated in Phase 3: system prompt tuned with D-01 through D-04 speech quality guidance
- ✓ Conversational follow-up questions at end of responses when appropriate — Validated in Phase 3: 1-in-3 follow-up frequency configured in system prompt
- ✓ Resume/docs-fed context so the LLM answers as Kaleb with accurate information — Validated in Phase 1: System prompt populated with full work history, projects, skills
- ✓ Maintain current terminal UI + voice interface experience — Validated in Phase 2: hook interface unchanged, VoiceInterface.tsx only needed label updates

### Out of Scope

- Full UI redesign — terminal aesthetic stays, only voice pipeline changes
- RAG/vector database system — simple document context is sufficient for portfolio scope
- Multi-language support — English only for v1
- User authentication — public portfolio, no login needed
- Mobile app — web-only

## Context

- **Existing codebase**: Next.js 16, React 19, TypeScript, Tailwind CSS 4, Bun runtime
- **Voice pipeline**: Bun WS server (ws-server/) with DashScope ASR (qwen3-asr-flash-realtime) + LLM (qwen-plus) + TTS (qwen3-tts-vc with Kaleb's cloned voice). Browser connects via WebSocket, server holds all API keys.
- **Voice clone**: Enrolled with DashScope (Phase 1 complete) — voice_id stored in .env.local
- **Context source**: Resume/bio documents fed into LLM system prompt
- **Hosting**: Vercel (existing)
- **Key files**: `app/hooks/useRealtimeVoice.ts` (browser voice hook), `ws-server/src/session.ts` (server pipeline orchestration)
- **Barge-in**: Sub-3-word utterances filtered, valid barge-in gets "Oh sure —" acknowledgment prefix
- **Proactive greeting**: AI speaks first on connect with varied casual openers
- **TTS pipeline**: Fixed onopen race condition (Promise-based), server_commit intermediate response.done gating, browser audio drain before teardown

## Constraints

- **Provider**: Alibaba Cloud for entire voice pipeline (STT + LLM + TTS)
- **TTS Model**: Qwen3-TTS with voice cloning capability
- **Speech Quality**: Must sound conversational, not robotic — filler words, natural rhythm, follow-up questions
- **Backward Compatibility**: Terminal UI and state machine must remain intact
- **Runtime**: Bun (not npm/node)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Alibaba Cloud over OpenAI Realtime | Full pipeline control, voice cloning via Qwen3-TTS | ✓ Phase 2 |
| Document-based context over RAG | Portfolio scope doesn't need dynamic retrieval | — Pending |
| Keep terminal UI unchanged | Strong existing design, focus effort on voice pipeline | — Pending |
| TTS server_commit gating | DashScope sends response.done per segment; only forward after session.finish | ✓ Phase 3 |
| AI greets first on connect | Better UX — visitor hears Kaleb immediately, no awkward silence | ✓ Phase 3 |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-11 after Phase 3 completion*
