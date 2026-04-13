# Phase 3: Conversational AI + Speech Quality — Research

**Researched:** 2026-04-09
**Domain:** Server-side VAD, LLM system prompt tuning, barge-in filtering, transcript UI toggle
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** All speech naturalness achieved via LLM system prompt instructions only — no SSML, no post-processing. Filler words ("erm", "uh"), micro-pauses, and varied sentence length are prompted, not coded.
- **D-02:** Follow-up questions appear naturally, roughly 1 in 3 responses — not every response. System prompt instructs "occasionally end with a follow-up question when it feels natural."
- **D-03:** Response length is adaptive based on question complexity — short (1-2 sentences) for simple factual questions, longer (3-5 sentences) for complex/narrative questions. System prompt provides length guidance per question type.
- **D-04:** Energetic, casual persona tone. Greetings use phrases like "hey what'sup", "hi hi", "waddup bro". Overall tone is upbeat and approachable, not formal.
- **D-05:** Barge-in uses transcript length filter — only triggers when ASR transcript contains 3+ words. Filler speech ("ahh", "I see", "hmm") is ignored during AI playback. Server-side check in session.ts before `cancelCurrentResponse()`.
- **D-06:** On valid barge-in, AI briefly acknowledges the interruption ("Oh sure—") before pivoting to the new question. The interrupted partial response is discarded from conversation history, but the acknowledgment prefix is added to the new response context.
- **D-07:** VAD runs server-side on the Bun WS server. No client-side VAD library (@ricky0123/vad-web is not used). Browser streams all audio continuously; server detects speech boundaries.
- **D-08:** Silence timeout of ~1 second before system considers user "done speaking" and triggers LLM. Standard conversational pause — responsive without cutting off mid-thought.
- **D-09:** After pressing Connect once, mic stays open continuously. No mute toggle. Waveform canvas provides visual state feedback — green when user speaks, amber when AI responds (existing behavior preserved).

### Claude's Discretion

- Server-side VAD implementation approach (Silero VAD via ONNX, energy-based detection, or DashScope ASR's built-in silence detection — Claude picks the best fit for Bun runtime)
- Exact word count threshold for barge-in filter (3 words recommended, but can be tuned)
- Transcript toggle UI placement and styling within the terminal aesthetic

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SPCH-01 | LLM generates natural speech with filler words ("erm", "uh"), micro-pauses, and varied sentence length | System prompt already exists in `prompts/system-prompt.md` with some naturalness guidance — needs targeted additions for filler words and sentence rhythm |
| SPCH-02 | AI asks contextual follow-up questions at end of responses when natural (not every response) | System prompt already has "occasionally ask a follow-up" instruction — needs strengthening with the 1-in-3 frequency intent and specific examples |
| SPCH-03 | Responses are conversational length (3-4 sentences max) to maintain natural dialogue flow | System prompt has "3-4 sentences max" guideline — needs per-question-type length guidance (D-03) |
| CONV-01 | VAD-based continuous conversation flow after single button activation (not push-to-talk) | DashScope ASR `server_vad` with `silence_duration_ms: 1000` already wired in `asr.ts` — currently set to 400ms, needs tuning to ~1000ms per D-08 |
| CONV-02 | Rolling session memory (up to 20 turns) enabling contextual follow-ups | `Session.conversationHistory` with `MAX_HISTORY_ENTRIES = 20` already implemented in `session.ts` — DONE, no code changes needed |
| CONV-04 | Waveform visual feedback during AI speech (existing, must be preserved) | Canvas waveform fully implemented in `VoiceInterface.tsx` with green/amber phase coloring — DONE, no code changes needed |
| CONV-05 | Accessibility transcript toggle showing text of AI responses | `status.responseText` already accumulated in `useRealtimeVoice.ts` and rendered in `VoiceInterface.tsx` — needs a toggle button + collapsible panel with `aria-expanded` |
</phase_requirements>

---

## Summary

Phase 3 is primarily a **configuration and refinement phase**, not a greenfield build. The entire pipeline (ASR → LLM → TTS) is operational from Phase 2. The five work areas are:

1. **VAD silence threshold adjustment** — change `silence_duration_ms` from 400ms to ~1000ms in `asr.ts`. DashScope's `server_vad` already handles speech boundary detection; VAD is already running. The only gap is the timeout is too short for natural speech.

2. **Barge-in word count filter** — add a word-count check in `session.ts:onTranscriptFinal` before calling `cancelCurrentResponse()`. If the transcript has fewer than 3 words, skip the LLM cascade; the user was just making filler sounds. D-06 adds acknowledgment prefix behavior ("Oh sure—") when a valid barge-in is detected.

3. **System prompt additions** — `prompts/system-prompt.md` already has strong persona guidance. Add explicit filler-word frequency guidance, adaptive length rules (D-03), and casual greeting examples (D-04). No code changes — prompt file only.

4. **Transcript toggle UI** — `status.responseText` is already accumulated in the hook and displayed always-visible in `VoiceInterface.tsx`. Add a toggle button (`[show transcript]` / `[hide transcript]`) with `aria-expanded` and a collapsible `<div>`. Plain CSS Module addition, no new dependencies.

5. **CONV-02 is already done** — `Session.conversationHistory` with `MAX_HISTORY_ENTRIES = 20` is fully implemented. No work needed.

**Primary recommendation:** Make targeted surgical changes to three files — `asr.ts` (VAD timeout), `session.ts` (barge-in filter + D-06 acknowledgment), `prompts/system-prompt.md` (speech quality guidance) — plus a small UI addition in `VoiceInterface.tsx` for the transcript toggle.

---

## Standard Stack

### Core (no new packages — all existing)

| Component | File | Current State | Change Needed |
|-----------|------|---------------|---------------|
| DashScope ASR VAD | `ws-server/src/dashscope/asr.ts` | `server_vad`, `silence_duration_ms: 400` | Change to 1000ms |
| Barge-in cancel | `ws-server/src/session.ts` | `cancelCurrentResponse()` always fires on transcript | Add 3-word filter + D-06 prefix |
| LLM streaming | `ws-server/src/dashscope/llm.ts` | System prompt loaded from file | No code change; prompt file updated |
| System prompt | `prompts/system-prompt.md` | Has persona, guardrails, style-by-topic | Add filler word, length, greeting guidance |
| Transcript display | `app/components/VoiceInterface.tsx` | Always renders `status.responseText` | Add toggle button + aria-expanded |
| Transcript styles | `app/components/VoiceInterface.module.css` | `.responseBlock` styles exist | Add `.transcriptToggle` + visibility rules |

**No new npm/bun packages required for this phase.** [VERIFIED: codebase inspection]

---

## Architecture Patterns

### VAD is Already Wired — Threshold Only

The DashScope ASR WebSocket already uses `server_vad`. The browser already streams audio continuously from `processor.onaudioprocess` in `useRealtimeVoice.ts`. VAD fires automatically when the server detects speech boundaries.

Current config in `asr.ts`:
```typescript
// Source: ws-server/src/dashscope/asr.ts lines 47-53
turn_detection: {
  type: 'server_vad',
  threshold: 0.0,
  silence_duration_ms: 400,  // TOO SHORT — produces premature cutoffs mid-sentence
},
```

Change to:
```typescript
turn_detection: {
  type: 'server_vad',
  threshold: 0.0,
  silence_duration_ms: 1000,  // D-08: ~1 second silence before triggering LLM
},
```

[VERIFIED: DashScope Qwen-Omni-Realtime docs show 800ms example; CITED: alibabacloud.com/help/en/model-studio/realtime]
[ASSUMED: 1000ms is valid for qwen3-asr-flash-realtime — mirroring the Qwen-Omni docs; the ASR-specific docs did not show explicit range limits]

### Barge-in Word Count Filter Pattern

The filter belongs in `session.ts` inside the `onTranscriptFinal` callback, before `cancelCurrentResponse()`. Currently there is no guard:

```typescript
// Current (session.ts line 73):
session.cancelCurrentResponse();
session.send({ type: 'response.done' });

// Proposed pattern (D-05 + D-06):
const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
if (wordCount < 3) {
  // Filler utterance — ignore, do not interrupt AI response
  return;
}
// Valid barge-in: acknowledge interruption then pivot
session.cancelCurrentResponse();
session.send({ type: 'response.done' });
// D-06: prepend acknowledgment to new response context
const bargeInPrefix = 'Oh sure — ';
// Pass bargeInPrefix to the LLM cascade as initial assistant message or inject into system prompt context
```

**D-06 acknowledgment implementation detail:** The cleanest approach is to pass a `bargeInContext` flag to `streamLlmResponse` and inject "Oh sure — " as a one-line prefix in the user message or as a system instruction for this turn. Two options:

- **Option A (recommended):** Inject as an assistant prefix via the conversation history before the new user turn: push `{ role: 'assistant', content: 'Oh sure — ' }` temporarily. The LLM will naturally continue from that prefix.
- **Option B:** Add a conditional instruction to the system message content for this invocation only: "The user interrupted you mid-response. Start your reply with 'Oh sure—' then answer their question."

Option A is simpler and fits the existing `conversationHistory` pattern. [ASSUMED: LLM will naturally continue "Oh sure — " and not re-emit the prefix; this depends on model behavior — validate during implementation]

### Transcript Toggle UI Pattern

Current `VoiceInterface.tsx` always renders `status.responseText` when non-empty. The toggle converts this to a user-controlled visibility:

```typescript
// Add state to VoiceInterface.tsx:
const [showTranscript, setShowTranscript] = useState(false);

// Replace always-visible block with:
{status.responseText && (
  <>
    <button
      className={styles.transcriptToggle}
      aria-expanded={showTranscript}
      aria-controls="ai-transcript"
      onClick={() => setShowTranscript(v => !v)}
    >
      {showTranscript ? '[hide transcript]' : '[show transcript]'}
    </button>
    {showTranscript && (
      <div id="ai-transcript" className={styles.responseBlock}>
        <div className={styles.responseSentence}>
          {'  '}{status.responseText}
        </div>
      </div>
    )}
  </>
)}
```

[VERIFIED: `aria-expanded` + `aria-controls` is the WCAG-conformant pattern for collapsible content — cited accessibility docs]

The toggle should also persist the last AI response text after `response.done` resets `responseText` to `''`. Currently `useRealtimeVoice.ts` clears `responseText` on `response.done` (line 191). For transcript to be viewable after the AI finishes speaking, the hook needs to keep the last complete response:

```typescript
// In useRealtimeVoice.ts, on response.done:
case 'response.done': {
  setPhase('listening');
  // DON'T clear responseText — preserve last AI utterance for transcript toggle
  // setStatus(prev => ({ ...prev, responseText: '' }));  // REMOVE this line
  nextPlayTimeRef.current = 0;
  // ... rest of audio context reset
}
```

This means the transcript panel shows the previous AI response while the user is speaking, which is the desired behavior.

### System Prompt Additions

The existing `prompts/system-prompt.md` already has strong naturalness guidance in the "How I Speak" section. The additions for Phase 3 are:

**Filler words (SPCH-01):** The existing prompt already says "I use filler words naturally: 'erm', 'like', 'you know' — but sparingly, not every sentence." This already covers SPCH-01 at a basic level. Add explicit instruction to occasionally use "uh" and brief pauses at sentence starts for TTS prosody.

**Follow-up questions (SPCH-02):** Existing prompt: "I occasionally ask a follow-up question when it feels natural". Strengthen to specify 1-in-3 frequency and add greeting examples from D-04.

**Adaptive length (SPCH-03, D-03):** Existing prompt: "3-4 sentences max per response". Add per-type guidance:
- Simple factual → 1-2 sentences
- Complex/narrative → up to 5 sentences
- Casual/personal → 2-3 sentences

**Casual greetings (D-04):** Add to the "How I Speak" opening examples: "hey what'sup", "hi hi", "waddup bro" specifically for the first greeting when user connects.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Server-side VAD | Custom energy/Silero ONNX detection | DashScope ASR `server_vad` built-in | Already running; just tune `silence_duration_ms` |
| Word-count tokenizer | Complex NLP library | `text.trim().split(/\s+/).filter(Boolean).length` | 3-word check needs no library; 3 words = 10-15 chars minimum |
| Transcript persistence | State management library | Existing `useState` in VoiceInterface | Simple toggle state; no external library needed |
| SSML speech control | SSML tags in TTS input | System prompt instructions to LLM | D-01 locks this; Qwen3-TTS infers prosody from text semantics |

**Key insight:** DashScope ASR's `server_vad` is the correct VAD solution. The codebase STATE.md concern about `@ricky0123/vad-web` is a non-issue — D-07 locks VAD to server-side, and the server already has it. The only open question was which _server-side_ approach to use: the answer is the ASR's own built-in VAD (already running), not an additional library.

---

## Common Pitfalls

### Pitfall 1: `silence_duration_ms: 400` causes premature cutoff
**What goes wrong:** Current value of 400ms causes ASR to trigger `transcription.completed` mid-sentence when the speaker pauses briefly between clauses. The LLM cascade fires on an incomplete utterance.
**Why it happens:** 400ms is shorter than a natural conversational pause between breath groups.
**How to avoid:** Set `silence_duration_ms: 1000` per D-08.
**Warning signs:** Visitor asks a long question; AI interrupts them mid-clause with a response.

### Pitfall 2: Barge-in filter resets `responseText` before transcript is read
**What goes wrong:** `cancelCurrentResponse()` → `response.done` → `responseText = ''` fires before the visitor can see the AI's last partial response in the transcript.
**Why it happens:** The browser hook clears `responseText` on `response.done`. A valid barge-in triggers `response.done` immediately.
**How to avoid:** Do not clear `responseText` on `response.done`. Instead, preserve last full response for transcript display. Clear it only on `session.start` (fresh session).

### Pitfall 3: Empty transcript fires barge-in
**What goes wrong:** ASR occasionally sends empty or whitespace-only final transcripts (e.g., background noise classification). These currently trigger the full LLM cascade.
**Why it happens:** `onTranscriptFinal` fires for any final result, including empty strings.
**How to avoid:** The 3-word filter naturally handles this — an empty transcript has 0 words. Add `if (!text.trim()) return;` as the first guard.

### Pitfall 4: D-06 acknowledgment prefix leaks into next turn's history
**What goes wrong:** If `{ role: 'assistant', content: 'Oh sure — ' }` is pushed to `conversationHistory` permanently, it pollutes the history with orphan assistant turns.
**Why it happens:** Naive push to `conversationHistory` without marking it as transient.
**How to avoid:** Do NOT push the barge-in prefix to `conversationHistory`. Instead inject it as context in the `streamLlmResponse` messages array for that single invocation only (pass it as an initial `messages` override, not as a history entry). The resulting full response will be stored normally when `onDone` fires.

### Pitfall 5: Transcript toggle shows stale previous response during new response
**What goes wrong:** `responseText` accumulates the new response while the user reads the old one. Display becomes confusing.
**Why it happens:** `responseText` is accumulated by `response.text.delta` events continuously.
**How to avoid:** Reset `responseText` at the START of a new response (when `transcript.final` fires, before LLM cascade begins) rather than at the end. In `useRealtimeVoice.ts`, clear `responseText` when `transcript.final` arrives.

### Pitfall 6: System prompt additions break TTS naturalness
**What goes wrong:** Over-specifying filler word behavior in the prompt causes the LLM to insert "erm" on every sentence, making TTS sound worse.
**Why it happens:** LLMs follow explicit instructions literally; "use filler words" without "sparingly" becomes robotic.
**How to avoid:** Existing prompt already says "sparingly, not every sentence". Reinforce this rather than adding new filler frequency instructions. Trust the existing guidance.

---

## Code Examples

### VAD Threshold Change
```typescript
// Source: ws-server/src/dashscope/asr.ts — session.update payload
turn_detection: {
  type: 'server_vad',
  threshold: 0.0,
  silence_duration_ms: 1000,  // Changed from 400 per D-08
},
```

### Barge-in Filter (session.ts onTranscriptFinal)
```typescript
// Source: ws-server/src/session.ts — onTranscriptFinal handler
onTranscriptFinal: (text) => {
  session.send({ type: 'transcript.final', text });
  console.log(`[session] ${session.sessionId} transcript: ${text}`);

  // Guard: empty or filler utterance — do not trigger LLM
  if (!text.trim()) return;
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount < 3) {
    console.log(`[session] ignoring short transcript (${wordCount} words): "${text}"`);
    return;
  }

  // Valid barge-in: cancel in-flight response
  const wasResponding = session.responseAbort !== null;
  session.cancelCurrentResponse();
  session.send({ type: 'response.done' });

  const abort = new AbortController();
  session.responseAbort = abort;

  // D-06: if barge-in happened, inject acknowledgment as one-time assistant prefix
  const bargeInPrefix = wasResponding ? 'Oh sure — ' : '';

  // ... rest of cascade (unchanged)
  // In messages array for this turn only:
  // if (bargeInPrefix) messages.push({ role: 'assistant', content: bargeInPrefix })
  // before the new user turn
```

### Transcript Toggle UI (VoiceInterface.tsx)
```tsx
// Source: app/components/VoiceInterface.tsx — add useState import, toggle state
const [showTranscript, setShowTranscript] = useState(false);

// Replace existing responseText block:
{status.responseText && (
  <>
    <button
      className={styles.transcriptToggle}
      aria-expanded={showTranscript}
      aria-controls="ai-transcript"
      onClick={() => setShowTranscript(v => !v)}
    >
      {showTranscript ? '[hide transcript]' : '[show transcript]'}
    </button>
    {showTranscript && (
      <div id="ai-transcript" className={styles.responseBlock} role="region" aria-label="AI response transcript">
        <div className={styles.responseSentence}>
          {'  '}{status.responseText}
        </div>
      </div>
    )}
  </>
)}
```

### Transcript Toggle CSS (VoiceInterface.module.css)
```css
.transcriptToggle {
  display: inline-block;
  background: transparent;
  border: none;
  color: var(--green-primary);
  font-family: var(--font-anonymous-pro), monospace;
  font-size: 0.78rem;
  cursor: pointer;
  padding: 0;
  opacity: 0.7;
  text-shadow: 0 0 4px rgba(0, 255, 0, 0.3);
  margin-top: 6px;
}

.transcriptToggle:hover {
  opacity: 1;
}

.transcriptToggle:focus-visible {
  outline: 1px solid var(--green-primary);
  outline-offset: 2px;
}
```

### responseText Lifecycle Fix (useRealtimeVoice.ts)
```typescript
// Clear responseText at START of new turn (transcript.final), not on response.done
case 'transcript.final': {
  const text = (event.text as string | undefined) ?? '';
  setStatus(prev => ({ ...prev, transcript: text, responseText: '' }));  // clear old AI text
  break;
}

// On response.done — preserve responseText (do NOT clear it)
case 'response.done': {
  setPhase('listening');
  // Removed: setStatus(prev => ({ ...prev, responseText: '' }));
  if (playbackCtxRef.current) {
    playbackCtxRef.current.close();
    playbackCtxRef.current = new AudioContext({ sampleRate: PLAYBACK_SAMPLE_RATE });
  }
  nextPlayTimeRef.current = 0;
  break;
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Client-side VAD (vad-web, WebRTC) | DashScope `server_vad` in ASR WebSocket | D-07 locked in discuss phase | Simpler — no AudioWorklet, no wasm, no Next.js App Router compatibility issues |
| Push-to-talk (audio.end messages) | Continuous streaming + server-side silence detection | Phase 3 | No UX interaction needed after initial connect |
| Always-visible transcript | Collapsible toggle | CONV-05 | Reduces visual clutter; user controls when to see text |
| SSML prosody tags | LLM prompt-driven naturalness | D-01 locked | Zero TTS integration complexity; Qwen3-TTS infers prosody from semantics |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `silence_duration_ms: 1000` is a valid value for qwen3-asr-flash-realtime (not just qwen-omni-realtime) | Standard Stack / VAD | If range is capped lower (e.g., max 800ms), use 800ms — behavioral difference is minor |
| A2 | DashScope ASR `conversation.item.input_audio_transcription.completed` fires once per VAD turn (not per partial segment) | Architecture Patterns | If it fires multiple times per turn, barge-in filter needs deduplication |
| A3 | Injecting `{ role: 'assistant', content: 'Oh sure — ' }` as a one-time message (not history entry) produces natural continuation from the LLM | Code Examples / D-06 | If LLM re-emits the prefix literally, use Option B (system message injection instead) |
| A4 | Not clearing `responseText` on `response.done` does not cause memory or rendering issues | Architecture Patterns | Accumulated text from 20 turns could grow large — if so, clear after a threshold length |

---

## Open Questions

1. **`silence_duration_ms` exact range for `qwen3-asr-flash-realtime`**
   - What we know: DashScope Qwen-Omni-Realtime docs show 800ms example; qwen-real-time-speech-recognition docs show 400ms in examples
   - What's unclear: Whether the ASR-specific model accepts higher values (1000ms) without error
   - Recommendation: Start with 1000ms; if ASR rejects it silently or produces unexpected behavior, fall back to 800ms

2. **D-06 barge-in acknowledgment UX**
   - What we know: "Oh sure — " prefix is specified; LLM must continue naturally from it
   - What's unclear: Whether Qwen3-TTS synthesizes "Oh sure — " followed by the continuation correctly (no audio gap or pitch discontinuity)
   - Recommendation: Test during execution with two approaches (Option A: assistant prefix, Option B: system instruction) and pick whichever sounds better

---

## Environment Availability

Step 2.6: SKIPPED — this phase involves changes to existing files only (asr.ts, session.ts, system-prompt.md, VoiceInterface.tsx, useRealtimeVoice.ts, VoiceInterface.module.css). No new external tools or services are introduced. All dependencies already installed and verified in Phase 2.

---

## Validation Architecture

Step 4: SKIPPED — `workflow.nyquist_validation` is explicitly set to `false` in `.planning/config.json`.

---

## Security Domain

This phase makes no changes to authentication, session management, API key handling, or input validation. The barge-in word filter adds a guard that reduces surface area (prevents LLM invocation on empty/noise transcripts). No new threat vectors introduced.

---

## Sources

### Primary (HIGH confidence)
- `ws-server/src/dashscope/asr.ts` — verified current VAD config (`silence_duration_ms: 400`, `server_vad`)
- `ws-server/src/session.ts` — verified `cancelCurrentResponse()` location, `conversationHistory` implementation, `MAX_HISTORY_ENTRIES = 20`
- `ws-server/src/dashscope/llm.ts` — verified system prompt loading, streaming pattern, abort signal handling
- `app/hooks/useRealtimeVoice.ts` — verified `responseText` lifecycle (cleared on `response.done`), continuous audio streaming
- `app/components/VoiceInterface.tsx` — verified always-visible transcript pattern
- `prompts/system-prompt.md` — verified existing naturalness instructions, filler word guidance, length guidance

### Secondary (MEDIUM confidence)
- [CITED: alibabacloud.com/help/en/model-studio/realtime] — DashScope Qwen-Omni-Realtime docs: `silence_duration_ms: 800` example, `server_vad` mode description, `input_audio_buffer.speech_started/stopped` events
- [CITED: alibabacloud.com/help/en/model-studio/qwen-real-time-speech-recognition] — confirmed `server_vad` type, `silence_duration_ms` parameter exists
- [CITED: accessibility.huit.harvard.edu technique-expandable-sections] — `aria-expanded` + `aria-controls` pattern for collapsible transcript

### Tertiary (LOW confidence)
- [ASSUMED: A1] 1000ms is valid for qwen3-asr-flash-realtime — inferred from Qwen-Omni docs, not confirmed for this specific model

---

## Metadata

**Confidence breakdown:**
- VAD threshold change: HIGH — DashScope ASR already using server_vad; only parameter value changes
- Barge-in filter: HIGH — pure TypeScript logic, pattern is straightforward
- System prompt additions: HIGH — understood fully from codebase reading
- CONV-02 (rolling history): HIGH — already implemented, zero work
- Transcript toggle UI: HIGH — React pattern with existing hook data
- D-06 acknowledgment behavior: MEDIUM — LLM continuation from prefix is model-dependent

**Research date:** 2026-04-09
**Valid until:** 2026-05-09 (DashScope API parameters may shift; re-verify if > 30 days)
