# Roadmap: Kaleb's AI Voice Portfolio

## Overview

This roadmap migrates an existing terminal-themed portfolio's voice feature from OpenAI Realtime API to an Alibaba Cloud (DashScope) cascaded pipeline — Qwen3-ASR for STT, Qwen LLM for language, and Qwen3-TTS for voice — while preserving the full existing UI experience. Build order is hard-constrained: voice enrollment first (it produces the voice_id every downstream component requires), then a server-side WebSocket orchestrator (Vercel cannot proxy WebSockets), then the conversational AI layer, and finally UI wiring and launch readiness.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Voice Enrollment** - Record Kaleb's reference audio, enroll with Qwen3-TTS, and store a validated voice_id that all subsequent phases depend on
- [ ] **Phase 2: Server Infrastructure + Full Pipeline** - Deploy a Bun WebSocket orchestrator outside Vercel and wire the complete STT→LLM→TTS cascade with streaming overlap
- [ ] **Phase 3: Conversational AI + Speech Quality** - Add VAD-based continuous conversation, rolling session memory, natural speech behaviors, and transcript accessibility
- [ ] **Phase 4: UI Preservation + Launch Readiness** - Wire the new pipeline into the existing terminal UI, confirm all state machine transitions are intact, and verify nothing broke

## Phase Details

### Phase 1: Voice Enrollment
**Goal**: Kaleb's cloned voice exists in DashScope and is verified to sound like him
**Depends on**: Nothing (first phase)
**Requirements**: VOICE-01, VOICE-02, VOICE-03, VOICE-04, VOICE-05
**Success Criteria** (what must be TRUE):
  1. A DASHSCOPE_VOICE_ID exists in Vercel environment variables and is non-placeholder
  2. Calling Qwen3-TTS with that voice_id produces audio that a listener recognizes as Kaleb's voice
  3. The LLM system prompt contains Kaleb's resume, bio, and project descriptions — a visitor question about any listed role or project returns an accurate answer
  4. Responses maintain Kaleb's vocabulary and tone across at least three distinct topic areas (technical, career, personal projects)
  5. Emotional intonation varies observably between an achievement response and a challenge response
**Plans:** 3 plans
Plans:
- [x] 01-01-PLAN.md — Create enrollment script, record audio, enroll voice with DashScope
- [x] 01-02-PLAN.md — Author LLM system prompt with persona, knowledge base, and style constraints
- [x] 01-03-PLAN.md — Verify voice quality and emotional intonation variation

### Phase 2: Server Infrastructure + Full Pipeline
**Goal**: Visitors can speak to the site and hear Kaleb's AI clone respond, end-to-end, under 800ms round-trip
**Depends on**: Phase 1
**Requirements**: PIPE-01, PIPE-02, PIPE-03, PIPE-04, PIPE-05, PIPE-06, CONV-03
**Success Criteria** (what must be TRUE):
  1. A Bun WebSocket server is deployed on Fly.io or Railway and the browser connects to it successfully (not to Vercel)
  2. Speaking a question produces a response in Kaleb's cloned voice within 800ms (P95 measured in production)
  3. DashScope API keys are never present in any browser-visible request, network tab, or JavaScript bundle
  4. A WebSocket drop triggers automatic reconnect and the session resumes without a page reload
**Plans:** 3 plans
Plans:
- [x] 02-01-PLAN.md — Create Bun WS server scaffold with DashScope ASR integration
- [x] 02-02-PLAN.md — Wire LLM and TTS streaming pipeline with sentence-boundary overlap
- [x] 02-03-PLAN.md — Refactor browser hook for new protocol and add auto-reconnect

### Phase 3: Conversational AI + Speech Quality
**Goal**: Conversation feels natural — VAD activates automatically, the AI remembers context, and speech sounds human
**Depends on**: Phase 2
**Requirements**: SPCH-01, SPCH-02, SPCH-03, CONV-01, CONV-02, CONV-04, CONV-05
**Success Criteria** (what must be TRUE):
  1. After pressing the activation button once, conversation flows without any push-to-talk — speaking starts a response automatically
  2. A follow-up question referencing something said 5 turns earlier receives a contextually correct answer
  3. AI responses include filler words or natural pauses that make the speech sound conversational rather than synthesized
  4. A visitor sees the audio waveform animate in sync with the AI speaking
  5. Toggling the transcript shows readable text of the AI's last response
**Plans**: TBD
**UI hint**: yes

### Phase 4: UI Preservation + Launch Readiness
**Goal**: The terminal experience is exactly as designed and the site is ready for recruiters to visit
**Depends on**: Phase 3
**Requirements**: UI-01, UI-02, UI-03, UI-04
**Success Criteria** (what must be TRUE):
  1. The terminal window, macOS chrome, phosphor green text, and starfield background are visually identical to the design spec
  2. The typewriter boot sequence and Cognitive Status dashboard animate exactly as before
  3. The state machine progresses BOOTING → STATUS → MENU → VOICE without regressions on desktop, tablet, and mobile viewports
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Voice Enrollment | 0/3 | Planning complete | - |
| 2. Server Infrastructure + Full Pipeline | 0/3 | Planning complete | - |
| 3. Conversational AI + Speech Quality | 0/? | Not started | - |
| 4. UI Preservation + Launch Readiness | 0/? | Not started | - |
