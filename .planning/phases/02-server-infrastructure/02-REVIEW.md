---
phase: 02-server-infrastructure
reviewed: 2026-04-09T00:00:00Z
depth: standard
files_reviewed: 8
files_reviewed_list:
  - app/components/VoiceInterface.tsx
  - app/hooks/useRealtimeVoice.ts
  - ws-server/src/dashscope/asr.ts
  - ws-server/src/dashscope/llm.ts
  - ws-server/src/dashscope/tts.ts
  - ws-server/src/index.ts
  - ws-server/src/session.ts
  - ws-server/src/types.ts
findings:
  critical: 3
  warning: 5
  info: 4
  total: 12
status: issues_found
---

# Phase 02: Code Review Report

**Reviewed:** 2026-04-09T00:00:00Z
**Depth:** standard
**Files Reviewed:** 8
**Status:** issues_found

## Summary

This phase adds a Bun WebSocket server (`ws-server/`) as a secure proxy for the DashScope ASR → LLM → TTS pipeline, and wires the browser-side `useRealtimeVoice` hook to connect to it instead of OpenAI's Realtime API directly. The overall architecture is sound: API keys stay server-side, the pipeline stages are well separated, and conversation history is capped. Several correctness and security issues were found that need attention before deployment.

---

## Critical Issues

### CR-01: CORS wildcard on WebSocket upgrade endpoint exposes server to cross-origin connections

**File:** `ws-server/src/index.ts:18-22`
**Issue:** The CORS preflight handler returns `Access-Control-Allow-Origin: *`, but the `/ws` WebSocket upgrade path has no origin validation at all. Any website can connect to this server from a browser, send `session.start`, and consume DASHSCOPE_API_KEY quota (and receive Kaleb's cloned voice). WebSocket upgrades bypass `fetch()` CORS checks — the browser sends the `Origin` header but the server must validate it explicitly.
**Fix:**
```typescript
// In the fetch handler, validate Origin before upgrading
if (url.pathname === '/ws') {
  const origin = req.headers.get('origin') ?? '';
  const allowed = process.env.ALLOWED_ORIGIN ?? 'http://localhost:3000';
  if (origin && origin !== allowed) {
    return new Response('Forbidden', { status: 403 });
  }
  // ... rest of upgrade logic
}
```
Add `ALLOWED_ORIGIN=https://your-production-domain.com` to the server's environment.

---

### CR-02: Dummy WebSocket connects to `wss://localhost:0` on missing API key — uncaught connection error floods logs

**File:** `ws-server/src/dashscope/asr.ts:25-27`, `ws-server/src/dashscope/tts.ts:27-29`
**Issue:** When `DASHSCOPE_API_KEY` is absent the error callback is fired, then `new WebSocket('wss://localhost:0')` is created and immediately `.close()`d. In Bun's runtime this attempt to connect to `localhost:0` is not guaranteed to be a no-op — it may fire an `onerror` event before the `close()` call takes effect, triggering a second error path that reaches the session error handler, which sends a second `error` message to the browser. The dummy stub is also returned and stored as `this.asrWs` / `this.ttsWs` in `session.ts`, so subsequent `handleAudio` calls will attempt `forwardAudioToAsr` on it.
**Fix:**
```typescript
// Return a proper null-safe stub without connecting
if (!apiKey) {
  callbacks.onError('DASHSCOPE_API_KEY is not set');
  // Return an already-closed stub by subclassing or using EventTarget
  // Simplest: just return null and update callers to handle null
  return null as unknown as WebSocket;
}
// In session.ts: check asrWs !== null before forwardAudioToAsr
```
Or alternatively throw synchronously and let `startPipeline` catch and call `send({ type: 'error', ... })`.

---

### CR-03: `isValidBrowserMessage` only checks `type` field — `audio.append` with no `data` field passes validation then crashes

**File:** `ws-server/src/types.ts:17-21`, `ws-server/src/session.ts:180`
**Issue:** `isValidBrowserMessage` returns `true` for `{ type: 'audio.append' }` (missing `data`). In `session.handleAudio(parsed.data)`, `parsed.data` will be `undefined`. `forwardAudioToAsr` receives `undefined` as `base64Audio` and passes it to `JSON.stringify`, producing `"audio":null` in the DashScope payload — which may cause a DashScope API error that propagates back as an error event but with confusing diagnostics.
**Fix:**
```typescript
export function isValidBrowserMessage(msg: unknown): msg is BrowserMessage {
  if (typeof msg !== 'object' || msg === null || !('type' in msg)) return false;
  const m = msg as { type: string; data?: unknown };
  if (m.type === 'audio.append') {
    return typeof m.data === 'string' && m.data.length > 0;
  }
  return ['audio.end', 'session.start'].includes(m.type);
}
```

---

## Warnings

### WR-01: Race condition in `startPipeline` — `session.ready` sent before `session.update` is processed by ASR

**File:** `ws-server/src/session.ts:163-171`
**Issue:** `startPipeline` wraps `asrWs.onopen` to send `session.ready` to the browser. However, `createAsrSession` already sets `ws.onopen` (inside `asr.ts:37`) to send `session.update`. The wrapper in `session.ts:164-168` reads `originalOnOpen = asrWs.onopen` after `createAsrSession` returns, so `originalOnOpen` is correctly the `session.update` sender. This part is fine. But `session.ready` is sent immediately after `originalOnOpen` fires — meaning the browser receives `session.ready` and starts streaming audio before the DashScope ASR server has sent back a `session.updated` acknowledgment. If DashScope rejects the `session.update` (e.g. bad model name), audio is being sent to an uninitialized session.
**Fix:** Listen for the `session.created` or `session.updated` event from DashScope in `asr.ts` and only then resolve readiness. Add a handler in the `default` branch of `ws.onmessage` for `session.updated` and pass a callback to `createAsrSession`.

---

### WR-02: Conversation history capping can corrupt turn pairs — `shift()` called twice unconditionally

**File:** `ws-server/src/session.ts:85-88`, `ws-server/src/session.ts:140-144`
**Issue:** The capping loop does `shift()` twice to remove a "pair", but the `while` condition only checks `length > MAX_HISTORY_ENTRIES`. If the history has an odd number of entries (e.g. a user turn was added but the assistant turn was never appended due to LLM error), the double-shift will remove one entry from the next pair, misaligning roles. A user message could be followed by the wrong assistant message in context.
**Fix:**
```typescript
// Cap to MAX_HISTORY_ENTRIES by removing oldest entries two at a time, but
// only if we have at least 2 entries to remove
while (session.conversationHistory.length > MAX_HISTORY_ENTRIES) {
  if (session.conversationHistory.length >= 2) {
    session.conversationHistory.splice(0, 2);
  } else {
    session.conversationHistory.shift();
  }
}
```
Additionally consider only adding the user turn after a successful LLM response, not before.

---

### WR-03: `response.done` sent twice on a new transcript — browser resets audio prematurely

**File:** `ws-server/src/session.ts:74`
**Issue:** In `onTranscriptFinal`, `cancelCurrentResponse()` is called first, which may close the TTS WebSocket. Then `session.send({ type: 'response.done' })` is sent immediately to the browser. Later, when TTS for the new turn finishes, `onDone` fires and sends another `response.done`. In `useRealtimeVoice.ts:188-199`, each `response.done` closes and recreates the `playbackCtxRef` AudioContext. The first premature `response.done` will destroy the playback context mid-speech if the user barges in, but then the new AudioContext is created. The second `response.done` will then close a valid context mid-response.
**Fix:** Send `response.done` only from `onDone` in the TTS callback. For barge-in, send a separate `response.interrupted` event type, and handle it in `useRealtimeVoice` to stop playback without resetting the playback context.

---

### WR-04: `connectInternal` in `useRealtimeVoice` can be called recursively without bounded stack depth during reconnect

**File:** `app/hooks/useRealtimeVoice.ts:280-282`
**Issue:** The `ws.onclose` handler calls `setTimeout(() => { retriesRef.current++; connectInternal(); }, delay)`. `connectInternal` itself captures `handleMessage` and `cleanupAudio` via `useCallback`. If `connectInternal` is recreated (due to React re-render invalidating the callback) between the timeout firing and execution, the closure in the timeout still holds the old `connectInternal` reference, meaning reconnect may call a stale version. Additionally, `connectingRef.current` is only set to `false` in `ws.onopen` and in the catch block — if the connection attempt fails before `onopen` fires (immediate TCP refusal), `connectingRef.current` stays `true` permanently, blocking all future reconnects.
**Fix:**
```typescript
ws.onerror = () => {
  connectingRef.current = false; // reset lock on error too
  setStatus(prev => ({ ...prev, phase: 'error', error: 'WebSocket error' }));
};
```

---

### WR-05: `systemPrompt` loaded with `readFileSync` at module init — server crashes if file is missing

**File:** `ws-server/src/dashscope/llm.ts:15-18`
**Issue:** `readFileSync` is called at module initialization time with no error handling. If `prompts/system-prompt.md` is missing (e.g. first deploy, CI, or cloned repo without the file), the entire server process crashes on startup with an unhandled exception rather than a clear error message.
**Fix:**
```typescript
let systemPrompt: string;
try {
  systemPrompt = readFileSync(
    resolve(import.meta.dir, '../../../prompts/system-prompt.md'),
    'utf-8'
  );
} catch {
  console.error('[llm] FATAL: prompts/system-prompt.md not found. Server cannot start.');
  process.exit(1);
}
```
This at least produces a meaningful error and exits cleanly instead of an `ENOENT` stack trace.

---

## Info

### IN-01: `_lastTranscript` property is declared but never used

**File:** `ws-server/src/session.ts:184`
**Issue:** `_lastTranscript: string = ''` is declared as a class property but is never read or written anywhere in the codebase. Dead code.
**Fix:** Remove the property.

---

### IN-02: `audio.end` message type is handled with only a `console.log` — plan comment suggests future work but it is undocumented debt

**File:** `ws-server/src/index.ts:84-86`
**Issue:** The `audio.end` branch logs `"audio.end received"` with a comment "Plan 02 will handle this fully". The plan has been completed (Plans 01-03 summarized), so this is leftover TODO debt. If users ever need manual end-of-speech signaling, this silently no-ops.
**Fix:** Either implement the behavior (commit buffer to ASR) or remove the `audio.end` type from `BrowserMessage` and `isValidBrowserMessage` until it is intentionally supported.

---

### IN-03: `downsample` in `useRealtimeVoice.ts` uses nearest-neighbor (point) resampling — alias artifacts at 44.1kHz → 16kHz

**File:** `app/hooks/useRealtimeVoice.ts:60-69`
**Issue:** The downsample function picks samples by floored index with no anti-aliasing filter. On browsers where `AudioContext` reports `sampleRate` of 44100 or 48000 Hz (most desktop Chrome/Firefox), resampling at ratio ~2.75–3x with no lowpass filter introduces aliasing noise into the ASR input. This degrades transcription quality. (Note: not flagged as a warning/critical because the `AudioContext` is created with `sampleRate: MIC_SAMPLE_RATE = 16000` at line 220, which causes the browser to resample natively before the `onaudioprocess` callback fires — so the downsample function at line 263 may actually receive already-16kHz data. Worth verifying this assumption, but the function itself is a latent bug if `ctx.sampleRate` ever differs.)
**Fix:** Add a comment clarifying the assumption, or add an assertion: `console.assert(ctx.sampleRate === MIC_SAMPLE_RATE, ...)`.

---

### IN-04: Magic number `0.0` for VAD threshold in ASR session config may silently accept all audio frames

**File:** `ws-server/src/dashscope/asr.ts:50`
**Issue:** `threshold: 0.0` in the `turn_detection` config means the VAD will trigger on any audio level, including background noise and silence. This may cause the ASR to fire `conversation.item.input_audio_transcription.completed` repeatedly with empty or noise transcripts, triggering unnecessary LLM+TTS pipeline runs.
**Fix:** Use a more conservative threshold (e.g. `0.5`) or remove the field to use the DashScope default. Add a comment explaining the chosen value.

---

_Reviewed: 2026-04-09T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
