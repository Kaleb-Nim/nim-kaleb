# Phase 3: Conversational AI + Speech Quality - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-09
**Phase:** 03-conversational-ai-speech-quality
**Areas discussed:** Speech naturalness, Barge-in refinement, VAD strategy

---

## Speech Naturalness

| Option | Description | Selected |
|--------|-------------|----------|
| System prompt only | Add instructions to the LLM system prompt for filler words, varied sentence length. No code changes to TTS. | ✓ |
| System prompt + SSML markup | LLM generates SSML tags for explicit pauses. Requires checking Qwen3-TTS SSML support. | |
| System prompt + post-processing | LLM generates clean text, post-processing injects filler words before TTS. | |

**User's choice:** System prompt only
**Notes:** Simplest approach — all naturalness comes from what the LLM generates.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Sometimes, naturally (~1 in 3) | Occasionally end with a follow-up question when natural. | ✓ |
| Always ask a follow-up | Every response ends with a question. | |
| Never — let visitor lead | AI only answers what's asked. | |

**User's choice:** Sometimes, naturally (~1 in 3)
**Notes:** Keeps conversation flowing without feeling interrogative.

---

| Option | Description | Selected |
|--------|-------------|----------|
| 2-4 sentences | Short enough for conversation, long enough to inform. | |
| 1-2 sentences, very brief | Ultra-concise. | |
| Adaptive based on question | Short for simple, longer for complex questions. | ✓ |

**User's choice:** Adaptive based on question
**Notes:** Response length varies by question complexity.

---

| Option | Description | Selected |
|--------|-------------|----------|
| You decide | Claude has discretion for speech patterns. | |
| I have specifics | User describes particular speech patterns. | ✓ |

**User's choice:** I have specifics
**Notes:** Energetic tone. Casual greetings: "hey what'sup", "hi hi", "waddup bro". Upbeat and approachable.

---

## Barge-in Refinement

| Option | Description | Selected |
|--------|-------------|----------|
| Transcript length filter | Only trigger barge-in on 3+ word transcripts. Filters filler speech. | ✓ |
| Keyword allowlist | Maintain list of filler words to ignore during playback. | |
| Disable barge-in entirely | User must wait for AI to finish speaking. | |

**User's choice:** Transcript length filter
**Notes:** Simple server-side check in session.ts before cancelCurrentResponse().

---

| Option | Description | Selected |
|--------|-------------|----------|
| Drop and respond fresh | Cancel current response entirely, process new question from scratch. | |
| Acknowledge then respond | Brief acknowledgment ("Oh sure—") before answering new question. | ✓ |
| Queue and finish | Let current response finish, then process interruption. | |

**User's choice:** Acknowledge then respond
**Notes:** Adds personality — AI briefly acknowledges interruption before pivoting.

---

## VAD Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Client-side VAD | @ricky0123/vad-web in browser. Reduces bandwidth. AudioWorklet compatibility concern. | |
| Server-side VAD | Send all audio to Bun WS server, detect speech boundaries there. | ✓ |
| Use ASR silence as VAD | DashScope ASR's transcript.final as implicit VAD. No separate library. | |

**User's choice:** Server-side VAD
**Notes:** Simpler browser code. Server handles speech boundary detection.

---

| Option | Description | Selected |
|--------|-------------|----------|
| ~1 second | Natural conversational pause. Standard for voice assistants. | ✓ |
| ~500ms, very responsive | May cut off users mid-thought. | |
| ~2 seconds, patient | Slower but avoids premature responses. | |
| You decide | Claude picks default, makes configurable. | |

**User's choice:** ~1 second
**Notes:** Responsive without cutting off mid-thought.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Always listening, waveform shows state | Mic stays open. Waveform green for user, amber for AI. No extra buttons. | ✓ |
| Listening indicator + mute toggle | Add mute/unmute button alongside waveform. | |
| You decide | Claude picks UX approach. | |

**User's choice:** Always listening, waveform shows state
**Notes:** Existing waveform behavior preserved. No additional controls needed.

---

## Claude's Discretion

- Server-side VAD implementation approach
- Exact barge-in word count threshold
- Transcript toggle UI placement

## Deferred Ideas

None
