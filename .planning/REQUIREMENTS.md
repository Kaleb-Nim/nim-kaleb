# Requirements: Kaleb's AI Voice Portfolio

**Defined:** 2026-04-09
**Core Value:** Visitors can have a natural, human-sounding voice conversation with an AI clone of Kaleb that authentically represents his experience and personality.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Voice Identity

- [ ] **VOICE-01**: Kaleb's voice is cloned using Qwen3-TTS ICL mode with 10-15s clean reference audio and transcript
- [ ] **VOICE-02**: AI responds in Kaleb's cloned voice for all TTS output
- [ ] **VOICE-03**: LLM system prompt contains full resume, bio, project descriptions for accurate factual answers
- [ ] **VOICE-04**: AI maintains consistent persona (vocabulary, tone, communication style) across all topics
- [ ] **VOICE-05**: AI uses topic-appropriate emotional intonation (proud for achievements, focused for technical, candid for challenges)

### Pipeline

- [ ] **PIPE-01**: Alibaba Cloud STT (Qwen3-ASR) replaces OpenAI STT via WebSocket streaming
- [ ] **PIPE-02**: Alibaba Cloud Qwen LLM replaces OpenAI LLM via DashScope OpenAI-compatible endpoint
- [ ] **PIPE-03**: Alibaba Cloud Qwen3-TTS replaces OpenAI TTS with Kaleb's cloned voice ID
- [ ] **PIPE-04**: Total voice round-trip latency is under 800ms (STT + LLM + TTS streaming)
- [ ] **PIPE-05**: Server-side WebSocket orchestrator handles STT→LLM→TTS pipeline (Bun on Fly.io/Railway)
- [ ] **PIPE-06**: Secure token exchange — server generates temporary DashScope tokens, browser connects directly

### Speech Quality

- [ ] **SPCH-01**: LLM generates natural speech with filler words ("erm", "uh"), micro-pauses, and varied sentence length
- [ ] **SPCH-02**: AI asks contextual follow-up questions at end of responses when natural (not every response)
- [ ] **SPCH-03**: Responses are conversational length (3-4 sentences max) to maintain natural dialogue flow

### Conversation

- [ ] **CONV-01**: VAD-based continuous conversation flow after single button activation (not push-to-talk)
- [ ] **CONV-02**: Rolling session memory (up to 20 turns) enabling contextual follow-ups
- [ ] **CONV-03**: Graceful error handling and automatic reconnect on WebSocket drops
- [ ] **CONV-04**: Waveform visual feedback during AI speech (existing, must be preserved)
- [ ] **CONV-05**: Accessibility transcript toggle showing text of AI responses

### UI Preservation

- [ ] **UI-01**: Terminal-themed UI with macOS chrome preserved unchanged
- [ ] **UI-02**: Starfield background and typewriter animations preserved
- [ ] **UI-03**: State machine progression (BOOTING → STATUS → MENU → VOICE) preserved
- [ ] **UI-04**: Responsive layout (desktop/tablet/mobile) preserved

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Polish

- **POL-01**: Thoughtful silence / thinking delay (500-800ms) before complex answers
- **POL-02**: Barge-in / interruption handling during AI speech
- **POL-03**: Multi-language voice clone support

### Analytics

- **ANLY-01**: Conversation history persistence for analyzing recruiter questions
- **ANLY-02**: Usage analytics (session count, avg duration, common questions)

## Out of Scope

| Feature | Reason |
|---------|--------|
| RAG / vector database | Portfolio scope doesn't require dynamic retrieval; system prompt sufficient |
| Avatar / lip-sync video | Doubles infra complexity; terminal waveform is intentional aesthetic |
| Emotion detection from visitor speech | Requires separate sentiment model, adds latency, unreliable on short queries |
| Mobile app | Web-only portfolio |
| User authentication | Public portfolio, no login needed |
| Cross-session conversation persistence | Adds auth/storage; portfolio visitors rarely return |
| Full UI redesign | Terminal aesthetic stays; only voice pipeline changes |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| VOICE-01 | Phase 1 | Pending |
| VOICE-02 | Phase 1 | Pending |
| VOICE-03 | Phase 1 | Pending |
| VOICE-04 | Phase 1 | Pending |
| VOICE-05 | Phase 1 | Pending |
| PIPE-01 | Phase 2 | Pending |
| PIPE-02 | Phase 2 | Pending |
| PIPE-03 | Phase 2 | Pending |
| PIPE-04 | Phase 2 | Pending |
| PIPE-05 | Phase 2 | Pending |
| PIPE-06 | Phase 2 | Pending |
| CONV-03 | Phase 2 | Pending |
| SPCH-01 | Phase 3 | Pending |
| SPCH-02 | Phase 3 | Pending |
| SPCH-03 | Phase 3 | Pending |
| CONV-01 | Phase 3 | Pending |
| CONV-02 | Phase 3 | Pending |
| CONV-04 | Phase 3 | Pending |
| CONV-05 | Phase 3 | Pending |
| UI-01 | Phase 4 | Pending |
| UI-02 | Phase 4 | Pending |
| UI-03 | Phase 4 | Pending |
| UI-04 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 23 total
- Mapped to phases: 23
- Unmapped: 0

---
*Requirements defined: 2026-04-09*
*Last updated: 2026-04-09 after roadmap creation*
