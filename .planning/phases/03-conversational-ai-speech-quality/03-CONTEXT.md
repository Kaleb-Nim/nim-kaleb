# Phase 3: Conversational AI + Speech Quality - Context

**Gathered:** 2026-04-09
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase makes conversation feel natural. It adds VAD-based continuous conversation (no push-to-talk after initial connect), rolling session memory, natural speech behaviors (filler words, adaptive length, personality), barge-in refinement, and an accessibility transcript toggle. The terminal UI and existing waveform visualization are preserved.

</domain>

<decisions>
## Implementation Decisions

### Speech Naturalness
- **D-01:** All speech naturalness achieved via LLM system prompt instructions only — no SSML, no post-processing. Filler words ("erm", "uh"), micro-pauses, and varied sentence length are prompted, not coded.
- **D-02:** Follow-up questions appear naturally, roughly 1 in 3 responses — not every response. System prompt instructs "occasionally end with a follow-up question when it feels natural."
- **D-03:** Response length is adaptive based on question complexity — short (1-2 sentences) for simple factual questions, longer (3-5 sentences) for complex/narrative questions. System prompt provides length guidance per question type.
- **D-04:** Energetic, casual persona tone. Greetings use phrases like "hey what'sup", "hi hi", "waddup bro". Overall tone is upbeat and approachable, not formal.

### Barge-in Refinement
- **D-05:** Barge-in uses transcript length filter — only triggers when ASR transcript contains 3+ words. Filler speech ("ahh", "I see", "hmm") is ignored during AI playback. Server-side check in session.ts before `cancelCurrentResponse()`.
- **D-06:** On valid barge-in, AI briefly acknowledges the interruption ("Oh sure—") before pivoting to the new question. The interrupted partial response is discarded from conversation history, but the acknowledgment prefix is added to the new response context.

### VAD Strategy
- **D-07:** VAD runs server-side on the Bun WS server. No client-side VAD library (@ricky0123/vad-web is not used). Browser streams all audio continuously; server detects speech boundaries.
- **D-08:** Silence timeout of ~1 second before system considers user "done speaking" and triggers LLM. Standard conversational pause — responsive without cutting off mid-thought.
- **D-09:** After pressing Connect once, mic stays open continuously. No mute toggle. Waveform canvas provides visual state feedback — green when user speaks, amber when AI responds (existing behavior preserved).

### Claude's Discretion
- Server-side VAD implementation approach (Silero VAD via ONNX, energy-based detection, or DashScope ASR's built-in silence detection — Claude picks the best fit for Bun runtime)
- Exact word count threshold for barge-in filter (3 words recommended, but can be tuned)
- Transcript toggle UI placement and styling within the terminal aesthetic

### Folded Todos
None.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Voice Pipeline
- `ws-server/src/session.ts` — Current STT→LLM→TTS cascade, barge-in via cancelCurrentResponse(), conversation history management
- `ws-server/src/dashscope/asr.ts` — DashScope ASR WebSocket integration (speech-to-text)
- `ws-server/src/dashscope/llm.ts` — LLM streaming with system prompt and conversation history
- `ws-server/src/dashscope/tts.ts` — Qwen3-TTS voice clone synthesis

### Browser Voice Hook
- `app/hooks/useRealtimeVoice.ts` — WebSocket connection, mic capture (ScriptProcessor at 16kHz), audio playback scheduling (24kHz), auto-reconnect logic

### UI Components
- `app/components/VoiceInterface.tsx` — Voice UI with waveform canvas, connect/disconnect button, transcript/response display
- `app/components/VoiceInterface.module.css` — Voice interface styles (terminal aesthetic)

### Architecture
- `.planning/codebase/ARCHITECTURE.md` — Full system architecture and data flow documentation

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Session.conversationHistory` — Already implements 20-turn rolling memory (MAX_HISTORY_ENTRIES = 20). CONV-02 is partially satisfied.
- `Session.cancelCurrentResponse()` — Barge-in abort mechanism exists. Needs the 3+ word filter added before calling it.
- `VoiceInterface` waveform canvas — Already renders frequency bars with color-coded phases (green for listening, amber for responding). CONV-04 is largely satisfied.
- `useRealtimeVoice` auto-reconnect — Exponential backoff with 5 retries already implemented. CONV-03 done.

### Established Patterns
- Server messages follow `{ type: string, ...payload }` protocol (see `ws-server/src/types.ts`)
- Audio flows as base64-encoded PCM16 over WebSocket
- State transitions via `setPhase()` + `transitionTo()` callback pattern

### Integration Points
- `session.ts:onTranscriptFinal` — Where barge-in filter logic should be added (before cancelCurrentResponse)
- `ws-server/src/dashscope/llm.ts` — Where system prompt speech quality instructions get updated
- `VoiceInterface.tsx` — Where transcript toggle UI gets added
- `ws-server/src/index.ts` — Where server-side VAD would integrate into the audio pipeline

</code_context>

<specifics>
## Specific Ideas

- Greetings should be casual and energetic: "hey what'sup", "hi hi", "waddup bro" — not formal or robotic
- Barge-in acknowledgment should be brief and natural: "Oh sure—" style prefix before answering the new question
- Waveform already color-codes listening vs responding — preserve this, no additional UI controls needed

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-conversational-ai-speech-quality*
*Context gathered: 2026-04-09*
