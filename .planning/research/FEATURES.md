# Feature Research

**Domain:** AI Voice Clone Conversational Portfolio
**Researched:** 2026-04-09
**Confidence:** HIGH (stack-specific Qwen3-TTS) / MEDIUM (UX patterns from analogous products)

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete or broken.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Cloned voice sounds like the real person | The entire product premise — if the voice is clearly synthetic, the experience collapses | HIGH | Qwen3-TTS requires 10-15 sec of clean reference audio with transcript (ICL mode) for 0.89 speaker similarity; monotone reference = monotone clone |
| Sub-800ms total voice round-trip (STT + LLM + TTS) | Above 800ms, conversation feels like a phone call to the moon — unacceptable lag | HIGH | Target: STT ~150-300ms, LLM ~200-300ms, TTS TTFA ~97-250ms. Qwen3-TTS dual-track streaming achieves 97ms TTFA. WebSocket required; REST adds ~50ms overhead per turn |
| Accurate factual answers about Kaleb | Visitors are evaluating him — wrong or vague answers destroy credibility | MEDIUM | LLM system prompt must contain full resume, project descriptions, education, skills. Document-based context (not RAG) is sufficient for portfolio scope |
| Push-to-talk or VAD-triggered recording | User needs a clear signal for when to speak and when to listen | LOW | Existing UI has push-to-talk; Voice Activity Detection (VAD) with 300-500ms silence threshold is the standard pattern |
| Graceful error / retry on network failure | WebSocket drops happen; silent failure makes users think the product is broken | MEDIUM | Show reconnect state in terminal UI; expose errors through existing state machine |
| Audio playback without user interaction blocker | Browsers block autoplay; user must initiate before audio plays | LOW | Push-to-talk naturally satisfies this; ensure first TTS response only plays after user input |
| Waveform or visual feedback during AI speech | Without visual cue, users don't know if AI is still speaking or frozen | LOW | Existing waveform visualization covers this |

### Differentiators (Competitive Advantage)

Features that set this product apart from static resumes, text chatbots, and generic voice demos.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Natural prosody: filler words, micro-pauses, breath rhythms | Crosses the uncanny valley — Sesame research shows even high-quality TTS fails with human judges when conversational context is included; fillers are what make it convincingly Kaleb | MEDIUM | Instruct LLM via system prompt to produce natural speech artifacts ("erm", "uh", brief hesitation before answering). Qwen3-TTS reproduces these from text if they appear in generation input; cannot inject post-hoc |
| Follow-up questions at end of responses | Keeps conversation alive; mimics how Kaleb would actually engage a recruiter — "What kind of projects are you hiring for?" | LOW | System prompt instruction: end relevant answers with a contextual question. High signal-to-noise ratio — only when natural, not every response |
| Persona consistency across topics | Visitors should feel they are talking to one coherent person, not an LLM | MEDIUM | System prompt establishes personality traits, communication style, vocabulary preferences. Include example phrasings Kaleb actually uses |
| Emotional intonation matching topic | Technical topics sound focused; achievements sound proud; setbacks sound candid | MEDIUM | Qwen3-TTS supports natural-language emotion instructions per generation ("Speak with quiet confidence"). LLM can prepend emotion cues in generation text or via system prompt guidance |
| Terminal UI narrative continuity | Voice experience is framed as "activating the neural interface" — reinforces sci-fi persona rather than breaking the frame | LOW | Existing state machine and terminal chrome handles this; TTS voice must feel consistent with the "Kortix Neural Interface" branding |
| Conversation memory within session | Remembering what was asked earlier enables follow-up depth: "Earlier you mentioned X — can you expand?" | MEDIUM | Maintain rolling conversation history in LLM messages array; cap at ~20 turns to manage token cost |
| Thoughtful silence handling | Natural 1-2 second thinking pause before answering complex questions sounds human; immediate 50ms responses feel robotic | LOW | Introduce a brief artificial delay (500-800ms) before TTS playback on first chunk for complex questions; stream remaining audio immediately |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems in this context.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| RAG / vector database for resume | "More scalable" knowledge retrieval | Portfolio scope doesn't require it; adds infra complexity, latency, and a new failure point. A well-structured system prompt handles everything Kaleb needs to represent | Paste full resume + bio as system prompt context. Refresh manually when resume changes |
| Multi-language support | Visitors from non-English countries | Voice cloning quality degrades significantly in non-primary languages; Qwen3-TTS rates Chinese highest, English second — mixing produces accent artifacts. Kaleb's professional brand is English | Ship English-only. Document multilingual as v2 if evidence of non-English recruiter traffic emerges |
| Interruption / barge-in mid-response | "More natural" conversation | Requires real-time VAD on output stream, cancel-in-flight TTS, and LLM context recovery — adds ~2 weeks of complexity. Portfolio visitors are not in a hurry; push-to-talk naturally handles most cases | Push-to-talk UX plus short TTS responses (3-4 sentences max) minimize the need for barge-in |
| Conversation history persistence across sessions | "Personalized" return visits | Adds auth/storage requirements out of scope; risks visitors seeing each other's data if implemented naively; portfolio visitors rarely return | In-session memory only; no cross-session persistence |
| Emotion detection from visitor speech | Adapt tone based on how visitor sounds | Requires separate sentiment model, adds latency, unreliable on short portfolio queries | Maintain consistent warm-professional tone throughout |
| Avatar / lip-sync video | Visual representation of Kaleb speaking | Doubles infrastructure complexity (video rendering pipeline), adds latency, looks uncanny unless extremely well-done | Terminal waveform visualization is intentional aesthetic; it is a feature not a gap |
| Real-time transcription display | Show what AI is saying as text | Useful for accessibility but often distracts from voice experience; doubles perceived complexity of terminal UI | Include static transcript toggle as accessibility feature after core voice works |

---

## Feature Dependencies

```
[Voice Clone Identity]
    └──requires──> [Reference Audio Recording (10-15 sec clean audio + transcript)]
                       └──requires──> [Kaleb records reference sample before any TTS works]

[Natural Prosody (filler words, pauses)]
    └──requires──> [LLM system prompt engineering producing artifact-laden text]
                       └──enhances──> [Voice Clone Identity]

[Follow-Up Questions]
    └──requires──> [Accurate Factual Answers]
                       └──requires──> [Resume/Bio in System Prompt]

[Sub-800ms Round-Trip]
    └──requires──> [WebSocket persistent connection]
    └──requires──> [Qwen3-TTS streaming (dual-track)]
    └──requires──> [Alibaba Cloud STT streaming]

[Session Conversation Memory]
    └──enhances──> [Follow-Up Questions]
    └──enhances──> [Accurate Factual Answers]

[Persona Consistency]
    └──requires──> [System Prompt Personality Definition]
    └──enhances──> [Natural Prosody]
    └──enhances──> [Follow-Up Questions]
```

### Dependency Notes

- **Voice Clone Identity requires Reference Audio:** Qwen3-TTS ICL mode needs the recording before any integration can be tested. This is a blocking dependency — no reference audio = no voice clone. Record this first.
- **Natural Prosody requires LLM text engineering:** Qwen3-TTS faithfully reproduces text content including hesitations. The LLM must be prompted to write "erm, that's a good question — I think..." rather than clean paragraphs. Post-processing cannot inject these organically.
- **Sub-800ms requires streaming architecture throughout:** Each stage (STT, LLM, TTS) must stream; any synchronous call breaks the latency budget. Alibaba Cloud APIs must all expose streaming endpoints — verify before integration.
- **Follow-Up Questions conflict with Barge-In:** If follow-up questions are appended to responses and the visitor tries to interrupt, barge-in handling becomes necessary. Mitigated by keeping responses short and not implementing barge-in (anti-feature).

---

## MVP Definition

### Launch With (v1)

Minimum viable product — validates the voice clone portfolio concept.

- [ ] Kaleb's cloned voice (Qwen3-TTS ICL with clean reference audio) — core identity; without this it is just another TTS
- [ ] Sub-800ms round-trip via Alibaba Cloud STT + Qwen LLM + Qwen3-TTS streaming — below this threshold the conversation feels broken
- [ ] Resume/bio in system prompt yielding accurate factual answers — credibility requirement; a voice clone that gets facts wrong is worse than a static page
- [ ] Natural prosody via system prompt: filler words, pauses, varied sentence length — minimum bar to avoid the uncanny valley
- [ ] Contextual follow-up questions (1 per response where natural) — differentiator that converts passive demo into active conversation
- [ ] Session conversation memory (rolling 20-turn window) — enables depth; stateless Q&A feels like a chatbot, not a conversation
- [ ] Existing terminal UI and state machine preserved — non-negotiable; UI redesign is out of scope

### Add After Validation (v1.x)

Features to add once core voice pipeline is working and receiving recruiter traffic.

- [ ] Emotional intonation per topic — add once baseline voice quality is confirmed; requires additional Qwen3-TTS prompt engineering and testing
- [ ] Thoughtful silence / thinking delay — polish feature; add after measuring actual perceived latency in production
- [ ] Accessibility transcript toggle — add when real users report accessibility need or if deployed in context where it is expected

### Future Consideration (v2+)

Features to defer until evidence warrants investment.

- [ ] Barge-in / interruption handling — defer; only needed if user research shows push-to-talk causes friction
- [ ] Multi-language voice clone — defer; only if non-English recruiter traffic is significant
- [ ] Conversation history persistence — defer; only if Kaleb wants to analyze what recruiters are asking

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Cloned voice identity | HIGH | HIGH | P1 |
| Sub-800ms latency via streaming | HIGH | HIGH | P1 |
| Accurate factual answers (resume in prompt) | HIGH | LOW | P1 |
| Natural prosody / filler words | HIGH | MEDIUM | P1 |
| Follow-up questions | MEDIUM | LOW | P1 |
| Session conversation memory | MEDIUM | LOW | P1 |
| Emotional intonation per topic | MEDIUM | MEDIUM | P2 |
| Thoughtful silence delay | LOW | LOW | P2 |
| Accessibility transcript toggle | LOW | MEDIUM | P2 |
| Barge-in handling | LOW | HIGH | P3 |
| Persistent conversation history | LOW | HIGH | P3 |
| Multi-language | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

---

## Competitor Feature Analysis

| Feature | ElevenLabs Conversational AI | OpenAI Realtime API (current) | Our Qwen3-TTS Approach |
|---------|------------------------------|-------------------------------|------------------------|
| Voice cloning | Instant clone from 1 min audio; closed model | No voice cloning; pre-made voices only | Zero-shot ICL from 10-15 sec with transcript; open weights |
| Latency | Sub-300ms typical | Sub-300ms (WebSocket native) | 97ms TTFA (dual-track streaming); total ~800ms realistic |
| Filler words / prosody | Supported via emotion tags | Controlled via system prompt; voice quality high | Controlled via text content in prompt; reproduces faithfully |
| Hallucination rate | ~5% | ~10% (per Inworld benchmarks) | Depends on Qwen3 LLM; verify empirically |
| Streaming | Yes | Yes (native WebSocket) | Yes (dual-track streaming API) |
| Cost model | Per-character TTS + subscription | Per-minute usage | Alibaba Cloud API pricing; verify token costs |
| Open source | No | No | Yes (Qwen3-TTS weights on HuggingFace); can self-host |

---

## Sources

- [Sesame Research: Crossing the Uncanny Valley of Voice](https://www.sesame.com/research/crossing_the_uncanny_valley_of_voice) — conversational dynamics, turn-taking gap
- [Qwen3-TTS Voice Cloning Guide 2026 (ocdevel)](https://ocdevel.com/blog/20260302-qwen-tts-voice-cloning) — ICL mode, optimal reference audio specs, generation parameters
- [Qwen3-TTS Technical Report (arXiv)](https://arxiv.org/html/2601.15621v1) — WER 1.835%, speaker similarity 0.789, 12Hz tokenizer architecture
- [GitHub: QwenLM/Qwen3-TTS](https://github.com/QwenLM/Qwen3-TTS) — official capabilities: voice design, streaming, cloning
- [AssemblyAI: The 300ms Rule for Voice AI](https://www.assemblyai.com/blog/low-latency-voice-ai) — latency thresholds and conversational flow breakdown points
- [Inworld: Best TTS APIs for Real-Time Voice Agents 2026](https://inworld.ai/resources/best-voice-ai-tts-apis-for-real-time-voice-agents-2026-benchmarks) — TTFA benchmarks, streaming requirements, quality metrics
- [Softcery: Real-Time vs Turn-Based Voice Agent Architecture](https://softcery.com/lab/ai-voice-agents-real-time-vs-turn-based-tts-stt-architecture) — WebSocket vs REST tradeoffs
- [SparkCo: Optimizing Voice Agent Barge-In Detection 2025](https://sparkco.ai/blog/optimizing-voice-agent-barge-in-detection-for-2025) — barge-in complexity and VAD requirements
- [ElevenLabs: Voice Agents and Conversational AI Developer Trends](https://elevenlabs.io/blog/voice-agents-and-conversational-ai-new-developer-trends-2025) — persona design, follow-up pattern best practices
- [Murf AI: Neural Text to Speech](https://murf.ai/blog/neural-text-to-speech) — prosody, emphasis, natural pause handling

---
*Feature research for: AI Voice Clone Conversational Portfolio (Alibaba Cloud / Qwen3-TTS pipeline)*
*Researched: 2026-04-09*
