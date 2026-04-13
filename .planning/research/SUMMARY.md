# Project Research Summary

**Project:** nim-kaleb — AI Voice Clone Conversational Portfolio
**Domain:** Real-time cascaded voice AI pipeline (STT + LLM + TTS with voice cloning)
**Researched:** 2026-04-09
**Confidence:** MEDIUM (WebSocket auth with temporary tokens unconfirmed for DashScope WS; all other major areas verified via official docs)

## Executive Summary

This project migrates an existing terminal-themed portfolio site's voice feature from the OpenAI Realtime API to an Alibaba Cloud (DashScope) pipeline built from Qwen3-ASR (STT), Qwen LLM, and Qwen3-TTS with voice cloning. The core shift is from a single-WebSocket speech-to-speech model (where OpenAI handled everything) to a three-stage cascaded pipeline that must stream at every boundary to stay within the 800ms latency budget visitors need for a conversational experience. The critical differentiator is Qwen3-TTS voice cloning that makes the AI sound like Kaleb, not a generic synthesizer.

The recommended architecture routes all DashScope communication through a server-side WebSocket orchestrator because Vercel serverless functions cannot maintain persistent connections. This is the highest-impact architectural decision: the orchestrator must run as a standalone long-running process (Fly.io or Railway), with the Next.js frontend on Vercel pointing to it via NEXT_PUBLIC_VOICE_WS_URL. The existing useRealtimeVoice.ts hook changes minimally — only the WebSocket URL target changes; all browser-side audio encoding/decoding logic is compatible.

The top risks are infrastructure (Vercel WebSocket incompatibility is a hard constraint requiring a separate deployment), voice quality (wrong Qwen3-TTS model variant, missing reference audio transcript, or reference audio outside the 10-15 second window silently degrade the cloned voice), and latency (a waterfall pipeline without streaming at every stage produces 2-5 second round-trips). All three risks are avoidable with upfront design discipline. Build order is non-negotiable: voice enrollment must complete first because the voice_id it returns is required by every downstream component.

## Key Findings

### Recommended Stack

The existing openai npm package (v6.x) handles Qwen LLM with no new dependency — just a baseURL change to dashscope-intl.aliyuncs.com/compatible-mode/v1. Browser-native WebSocket handles client-side audio transport, unchanged from the current implementation. The only potential new dependencies are ws (^8.x) for the server-side WebSocket orchestrator and @ricky0123/vad-web for Silero VAD to replace naive silence detection. No official TypeScript/JavaScript SDK exists for DashScope — all integration is via raw WebSocket and fetch with documented message protocols.

**Core technologies:**
- `openai@6.x` (already installed): Qwen LLM chat completions — change baseURL and apiKey, zero new SDK
- Browser native `WebSocket`: ASR and TTS real-time audio transport — same pattern as existing OpenAI WS code
- `ws@8.x` (new): Server-side WS orchestrator connecting to DashScope STT and TTS
- `@ricky0123/vad-web` (new): Silero VAD in the browser — replaces naive silence-based end-of-utterance detection
- DashScope Singapore endpoint (`dashscope-intl.aliyuncs.com`): International API access — match to Vercel deployment region

**Audio format changes required:**
- ASR input: change downsample target from 24,000 Hz (OpenAI) to 16,000 Hz (DashScope STT)
- TTS output: 24,000 Hz PCM — playback code unchanged
- Replace ScriptProcessorNode (deprecated) with AudioWorkletNode

### Expected Features

**Must have (table stakes — launch blockers):**
- Kaleb's cloned voice via Qwen3-TTS ICL mode — core product premise
- Sub-800ms total round-trip (STT + LLM + TTS TTFA) — above threshold, conversation feels broken
- Resume and bio in LLM system prompt yielding accurate factual answers — wrong facts destroy credibility
- Natural prosody via LLM prompt engineering (filler words at sentence start, varied sentence length)
- Session conversation memory (rolling 20-turn window) — stateless Q&A feels like a chatbot
- Contextual follow-up questions (one per response where natural) — converts passive demo into active conversation

**Should have (add post-validation):**
- Emotional intonation per topic (Qwen3-TTS natural-language emotion instructions)
- Thoughtful silence / artificial thinking delay (500-800ms) before complex answers
- Accessibility transcript toggle

**Defer to v2+:**
- Barge-in / interruption handling — 2+ weeks complexity; push-to-talk covers most cases
- Multi-language voice clone — quality degrades in non-primary languages
- Persistent cross-session conversation history — adds auth/storage out of scope

### Architecture Approach

The architecture replaces a single OpenAI WebSocket session with a three-service cascade: browser audio flows to a server-side WS Orchestrator (Bun/Fly.io), which fans out to DashScope STT (WebSocket), Qwen LLM (HTTP SSE), and DashScope TTS (WebSocket). The orchestrator pipelines all three in parallel — forwarding sentence-sized LLM token chunks to TTS as they arrive, not waiting for full LLM response. All DashScope credentials stay server-side; the browser only connects to the orchestrator.

**Major components:**
1. `useRealtimeVoice.ts` (browser hook) — capture PCM16 mic audio, send to orchestrator WS, receive TTS audio chunks, drive UI state; minimal changes from current implementation
2. WS Orchestrator (Bun server, Fly.io/Railway) — sequence STT/LLM/TTS; own all DashScope credentials; maintain three simultaneous WebSocket connections per session
3. `app/lib/dashscope/` (stt.ts, tts.ts, llm.ts, types.ts) — isolate each DashScope service behind its own module
4. `/api/voice/session` (Next.js route handler) — return voice_id and config to browser; replaces /api/realtime/session
5. Voice Clone Enrollment (one-time offline step) — run once; store DASHSCOPE_VOICE_ID in Vercel env

### Critical Pitfalls

1. **Wrong Qwen3-TTS model variant** — "CustomVoice" does not clone; use qwen3-tts-vc-realtime-* (VC variants). Wrong model produces a generic preset voice with no error message.

2. **Vercel WebSocket incompatibility** — serverless functions terminate after 10-30s; a voice session lasts 1-10 minutes. The WS orchestrator must run as a persistent Bun process outside Vercel. Highest recovery-cost mistake if caught late.

3. **Missing reference audio transcript** — the text parameter during voice enrollment is optional but critical; omitting it drops speaker similarity from ~0.89 to ~0.75. Run Whisper on the reference audio and pass the transcript.

4. **Waterfall pipeline (no streaming)** — waiting for full STT then full LLM then full TTS produces 2-5s latency. Stream at every boundary: LLM tokens forwarded to TTS sentence-by-sentence; TTS audio forwarded to browser before TTS finishes.

5. **Model version mismatch between enrollment and synthesis** — the target_model in voice creation must exactly match the synthesis model. Lock both in environment variables; re-enroll on any model upgrade.

## Implications for Roadmap

Based on research, the build order is strictly constrained by hard dependencies. Voice enrollment must complete before any integration can be tested. The WS Orchestrator architecture must be decided before writing client code. Streaming must be a design constraint from Phase 1, not a later optimization.

### Phase 1: Voice Identity Setup (Pre-Integration, Offline)

**Rationale:** Voice enrollment is the single blocking dependency for every downstream phase. No voice_id = no TTS integration = no pipeline testing. This phase has no code risk — it is configuration and audio recording — but unblocks everything else.

**Delivers:** DASHSCOPE_VOICE_ID in Vercel environment; validated Kaleb cloned voice; DashScope account provisioned in Singapore region

**Addresses:** Cloned voice identity (table stakes P1), reference audio transcript requirement

**Avoids:** Wrong model variant pitfall (use qwen3-tts-vc-realtime-* from day one), missing transcript pitfall (run Whisper on reference audio before enrollment), reference audio duration pitfall (record exactly 10-15 seconds)

### Phase 2: Infrastructure and WS Orchestrator Skeleton

**Rationale:** The Vercel WebSocket incompatibility is a hard architectural constraint. Deployment model for the WS orchestrator must be chosen before writing any pipeline code; wrong choice requires full refactor.

**Delivers:** Bun WS server deployed to Fly.io or Railway; NEXT_PUBLIC_VOICE_WS_URL configured; browser WebSocket connects to orchestrator; DashScope STT and TTS WebSocket connections open on session start; app/lib/dashscope/ module structure in place

**Uses:** ws@8.x, Bun runtime, DashScope Singapore endpoint

**Avoids:** Vercel WebSocket pitfall, API key exposure pitfall (server-side only, never in NEXT_PUBLIC_*)

### Phase 3: STT Integration and VAD

**Rationale:** STT produces the transcript that drives the LLM; it must work and produce clean transcripts before LLM integration begins. VAD configuration must be validated with natural speech patterns before connecting to LLM, or partial transcripts will produce incoherent LLM responses.

**Delivers:** app/lib/dashscope/stt.ts module; Silero VAD configured with 600-800ms post-speech threshold; transcript events flowing to orchestrator; visual listening/processing state in terminal UI

**Uses:** qwen3-asr-flash-realtime or paraformer-realtime-v2; PCM16 at 16,000 Hz (updated from current 24,000 Hz)

**Avoids:** VAD cutoff pitfall (Silero VAD + conservative threshold)

### Phase 4: LLM Integration and System Prompt

**Rationale:** LLM integration is straightforward (OpenAI-compatible API) but system prompt content — resume, bio, personality, filler word instructions — is high-value and must be complete before end-to-end pipeline testing.

**Delivers:** app/lib/dashscope/llm.ts module; complete system prompt with resume, bio, personality, filler word instructions, and follow-up question directives; rolling 20-turn conversation history; streaming SSE token output feeding TTS

**Uses:** openai@6.x with baseURL override; qwen3-max or qwen-plus

**Avoids:** Prompt injection pitfall (explicit anti-injection instructions in system prompt), partial STT streaming to LLM anti-pattern (wait for completed transcript event)

### Phase 5: TTS Integration and Full Pipeline

**Rationale:** TTS is the final pipeline stage and requires both voice_id (Phase 1) and LLM token stream (Phase 4). This is where streaming overlap is wired: LLM tokens forwarded sentence-by-sentence to TTS before LLM response is complete; TTS audio forwarded to browser before TTS finishes.

**Delivers:** app/lib/dashscope/tts.ts module; full STT-LLM-TTS pipeline with streaming overlap; audio playback via AudioContext with AudioWorklet; waveform visualization connected to TTS output; P95 latency under 800ms measured in production

**Uses:** qwen3-tts-vc-realtime-2026-01-15 (must match enrollment target_model); sentence-boundary chunking for LLM-to-TTS forwarding

**Avoids:** Waterfall pipeline anti-pattern, model mismatch pitfall, filler word rendering issues (validated in isolation before full integration)

### Phase 6: Polish, Latency Tuning, and Security Hardening

**Rationale:** Polish features and security hardening should not block the core pipeline but must complete before public launch.

**Delivers:** Emotional intonation per-topic; thoughtful silence delay; adversarial prompt injection test suite; IP-based rate limiting on token generation endpoint; P95 latency baseline measured against Singapore DashScope endpoint from production Vercel region

**Avoids:** DashScope geographic latency pitfall, prompt injection security risk, filler word over-application (A/B tested before shipping)

### Phase Ordering Rationale

- Phase 1 before everything: voice_id is a hard dependency for TTS; no shortcuts
- Phase 2 before Phases 3-5: architecture decision determines where all pipeline code lives; wrong choice = full refactor
- Phase 3 before Phase 4: clean transcripts required before LLM integration; noisy STT wastes LLM testing effort
- Phase 4 before Phase 5: LLM token stream is TTS input; TTS cannot be tested with real content until LLM works
- Phase 6 last: polish and hardening require stable core pipeline

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3 (STT + VAD):** @ricky0123/vad-web integration with AudioWorklet in Next.js App Router — sparse documentation for this specific combination; verify before writing code
- **Phase 2 (WS Orchestrator):** Bun WebSocket server on Fly.io deployment configuration — not a standard documented combination; test deployment mechanics early

Phases with standard patterns (research-phase likely skippable):
- **Phase 4 (LLM):** OpenAI-compatible API with existing SDK — highest confidence area; straightforward baseURL swap with well-documented streaming
- **Phase 1 (Voice Enrollment):** REST API with curl examples in official docs — one-time HTTP call; no architectural complexity

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM | LLM via OpenAI-compat is HIGH; TTS and ASR WebSocket protocols are MEDIUM (docs exist, no TypeScript examples); temporary token for WebSocket auth is LOW (HTTP examples only) |
| Features | HIGH | Latency requirements and voice clone quality thresholds backed by multiple independent benchmark sources |
| Architecture | MEDIUM-HIGH | Vercel constraint confirmed (official docs); DashScope WebSocket protocols verified; streaming overlap pattern from multiple architecture analyses |
| Pitfalls | MEDIUM-HIGH | Critical pitfalls backed by official docs and practitioner reports; filler word TTS behavior is MEDIUM (community-reported, not officially documented) |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

- **Temporary token WebSocket auth:** DashScope temporary token endpoint documented for HTTP only. Whether tokens work in WebSocket Authorization headers is inferred, not confirmed. Verify as first integration test in Phase 2; backup is keeping all WebSocket connections server-side.

- **Qwen3-max hallucination rate on factual recall:** Hallucination rate against specific resume content is unknown. Validate empirically in Phase 4 before launch with 20+ factual questions.

- **Filler word rendering quality in Qwen3-TTS:** Whether "uh", "erm", and ellipses synthesize with natural prosody is community-reported but not officially documented. A/B test in Phase 5; have a rollback plan (disable fillers) if quality is poor.

- **Accent preservation for Kaleb's specific voice:** Qwen3-TTS has documented accent drift issues. Validate in Phase 1 with a listen test from someone who knows Kaleb's voice; adjust reference audio if drift is detected.

- **Bun WS server on Fly.io cold start:** Portfolio traffic is bursty; cold-started instance adds latency on first recruiter visit. Test minimum instance count vs. cost for portfolio budget.

## Sources

### Primary (HIGH confidence — official documentation)
- [DashScope Real-Time STT WebSocket API](https://www.alibabacloud.com/help/en/model-studio/websocket-for-paraformer-real-time-service)
- [Qwen Voice Cloning API Reference](https://www.alibabacloud.com/help/en/model-studio/qwen-tts-voice-cloning)
- [Qwen TTS Real-Time WebSocket API](https://www.alibabacloud.com/help/en/model-studio/qwen-tts-realtime)
- [DashScope OpenAI-Compatible API](https://www.alibabacloud.com/help/en/model-studio/compatibility-of-openai-with-dashscope)
- [DashScope Temporary API Key](https://www.alibabacloud.com/help/en/model-studio/generate-temporary-api-key)
- [Vercel WebSocket Limitation](https://vercel.com/kb/guide/do-vercel-serverless-functions-support-websocket-connections)
- [VAD for the browser — ricky0123/vad](https://www.vad.ricky0123.com/)
- [OWASP LLM01:2025 Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/)

### Secondary (MEDIUM confidence — practitioner analysis)
- [Qwen3-TTS Voice Cloning Guide 2026 — ocdevel.com](https://ocdevel.com/blog/20260302-qwen-tts-voice-cloning) — empirical findings on reference audio, model variants, similarity scores
- [Qwen3-TTS Technical Report (arXiv)](https://arxiv.org/html/2601.15621v1) — WER, speaker similarity benchmarks
- [AssemblyAI: The 300ms Rule for Voice AI](https://www.assemblyai.com/blog/low-latency-voice-ai) — latency thresholds
- [Inworld: Best TTS APIs for Real-Time Voice Agents 2026](https://inworld.ai/resources/best-voice-ai-tts-apis-for-real-time-voice-agents-2026-benchmarks) — TTFA benchmarks
- [Real-Time vs Turn-Based Voice Agent Architecture — Softcery](https://softcery.com/lab/ai-voice-agents-real-time-vs-turn-based-tts-stt-architecture)
- [Sesame Research: Crossing the Uncanny Valley of Voice](https://www.sesame.com/research/crossing_the_uncanny_valley_of_voice)
- [GitHub: QwenLM/Qwen3-TTS Issues](https://github.com/QwenLM/Qwen3-TTS/issues) — community-reported bugs

### Tertiary (LOW confidence — needs validation)
- @ai-sdk/alibaba package — exists on ai-sdk.dev; version/stability unverified; not recommended for this project
- DashScope temporary token in WebSocket Authorization header — documented for HTTP only; WebSocket compatibility inferred, not confirmed

---
*Research completed: 2026-04-09*
*Ready for roadmap: yes*
