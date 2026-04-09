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

- [ ] Replace OpenAI Realtime API with Alibaba Cloud full pipeline (STT + LLM + TTS)
- [ ] Clone Kaleb's voice using Qwen3-TTS for personalized speech synthesis
- [ ] Human-like speech control instructions (filler words: "erm", "uh", natural pauses)
- [ ] Conversational follow-up questions at end of responses when appropriate
- [ ] Resume/docs-fed context so the LLM answers as Kaleb with accurate information
- [ ] Maintain current terminal UI + voice interface experience

### Out of Scope

- Full UI redesign — terminal aesthetic stays, only voice pipeline changes
- RAG/vector database system — simple document context is sufficient for portfolio scope
- Multi-language support — English only for v1
- User authentication — public portfolio, no login needed
- Mobile app — web-only

## Context

- **Existing codebase**: Next.js 16, React 19, TypeScript, Tailwind CSS 4, Bun runtime
- **Current voice pipeline**: OpenAI Realtime API (gpt-4o-realtime-preview) handles STT + LLM + TTS via WebSocket with ephemeral tokens
- **Target pipeline**: Alibaba Cloud services replacing all three pieces (STT, LLM via Qwen, TTS via Qwen3-TTS with voice cloning)
- **Voice clone**: Needs to be created — Kaleb's voice model doesn't exist yet
- **Context source**: Resume/bio documents fed into LLM system prompt
- **Hosting**: Vercel (existing)
- **Key file**: `app/hooks/useRealtimeVoice.ts` — current OpenAI WebSocket voice hook (modified, uncommitted)

## Constraints

- **Provider**: Alibaba Cloud for entire voice pipeline (STT + LLM + TTS)
- **TTS Model**: Qwen3-TTS with voice cloning capability
- **Speech Quality**: Must sound conversational, not robotic — filler words, natural rhythm, follow-up questions
- **Backward Compatibility**: Terminal UI and state machine must remain intact
- **Runtime**: Bun (not npm/node)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Alibaba Cloud over OpenAI Realtime | Full pipeline control, voice cloning via Qwen3-TTS | — Pending |
| Document-based context over RAG | Portfolio scope doesn't need dynamic retrieval | — Pending |
| Keep terminal UI unchanged | Strong existing design, focus effort on voice pipeline | — Pending |

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
*Last updated: 2026-04-09 after initialization*
