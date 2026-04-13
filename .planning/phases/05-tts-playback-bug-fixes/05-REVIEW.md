---
phase: 05-tts-playback-bug-fixes
reviewed: 2026-04-13T00:00:00Z
depth: standard
files_reviewed: 2
files_reviewed_list:
  - app/hooks/useRealtimeVoice.ts
  - ws-server/src/session.ts
findings:
  critical: 0
  warning: 5
  info: 3
  total: 8
status: issues_found
---

# Phase 05: Code Review Report

**Reviewed:** 2026-04-13
**Depth:** standard
**Files Reviewed:** 2
**Status:** issues_found

## Summary

Both files implement the real-time voice pipeline: `useRealtimeVoice.ts` drives the browser-side WebSocket, mic capture, and audio scheduling; `session.ts` orchestrates the server-side ASR → LLM → TTS pipeline with barge-in and conversation history. The code is generally well-structured. No critical security or data-loss issues were found. Five warnings were identified covering race conditions, resource leaks, and logic gaps that could cause silent audio failures or state corruption during normal use; three info items cover dead code and minor style concerns.

---

## Warnings

### WR-01: `response.done` drain callback fires on wrong context after rapid barge-in

**File:** `app/hooks/useRealtimeVoice.ts:216`

**Issue:** The `drain` closure captures `ctx` (the old `AudioContext`) and `gen`. The guard `playbackCtxRef.current === ctx` is intended to prevent the callback from firing after a subsequent barge-in, but `lastSource.onended` is a DOM event callback — it fires asynchronously on the audio thread after the buffer plays out. Between scheduling `drain` and it firing, the user can trigger a second barge-in that closes the old context (making `ctx.state === 'closed'`) and creates a new one. When the old `onended` fires, the `playbackCtxRef.current` will already be the new context, so the guard succeeds and `ctx.close()` is called again on an already-closed `AudioContext`, throwing an unhandled `InvalidStateError`. More critically, `playbackCtxRef.current = newCtx` executes again, silently overwriting the current live context ref with a newly created — and immediately redundant — second context that is never cleaned up (resource leak).

**Fix:**
```typescript
// In the drain() callback, add a closed-state guard before acting:
const drain = () => {
  if (
    playbackCtxRef.current === ctx &&
    playGenRef.current === gen &&
    ctx.state !== 'closed'          // <-- add this guard
  ) {
    setStatus(prev => ({ ...prev, responseText: '' }));
    ctx.close();
    const newCtx = new AudioContext({ sampleRate: PLAYBACK_SAMPLE_RATE });
    playbackCtxRef.current = newCtx;
    nextPlayTimeRef.current = newCtx.currentTime;
  }
};
```

---

### WR-02: Reconnect loop does not reset `connectingRef` on failure, permanently locking connection

**File:** `app/hooks/useRealtimeVoice.ts:335-341`

**Issue:** In the `catch` block inside `connectInternal`, `connectingRef.current = false` is correctly reset (line 339). However, in the `ws.onclose` handler that schedules a reconnect (line 314-317), `connectInternal()` is called recursively via `setTimeout`. If the recursive `connectInternal` call reaches its own `catch` (e.g., `getUserMedia` denied on retry), it sets `connectingRef.current = false` — that is correct. But if the connection opens and then closes again immediately before `ws.onopen` fires (a timing edge case with Bun's WebSocket), `connectingRef.current` is never reset from the value set at line 247 (`connectingRef.current = true`) because `onopen` sets it to `false` at line 289, but `onclose` fires before `onopen` completes if the connection is torn down synchronously. In that scenario `connectingRef` stays `true` indefinitely, and all subsequent `connect()` or reconnect calls are silently dropped at line 245.

**Fix:**
```typescript
ws.onclose = () => {
  wsRef.current = null;
  connectingRef.current = false; // <-- reset here unconditionally before branching
  if (!intentionalCloseRef.current && retriesRef.current < 5) {
    // ... rest of reconnect logic
  }
```

---

### WR-03: `ScriptProcessorNode` continues sending audio after WebSocket enters `CLOSING` state

**File:** `app/hooks/useRealtimeVoice.ts:295`

**Issue:** The `onaudioprocess` handler guards with `ws.readyState !== WebSocket.OPEN`, which correctly skips sends when the socket is already `CLOSED`. However, `WebSocket.CLOSING` (readyState `2`) is not `OPEN` (`1`), so this guard is technically correct. The real problem is that `processor` is not disconnected in `cleanupAudio` in a way that stops `onaudioprocess` from being called; `processorRef.current?.disconnect()` (line 130) removes the node from the graph but in some browsers (and Bun's Web API polyfills) an already-firing `onaudioprocess` callback queue can still deliver a final event after disconnect. This is minor but can cause a send on a closing socket resulting in a console error. More significantly: `processor` is captured via closure inside `ws.onopen` and is not cleared when `cleanupAudio` sets `processorRef.current = null`, so the old processor retains a reference to the closed WebSocket forever via the closure — a memory leak if reconnects accumulate.

**Fix:**
```typescript
ws.onopen = () => {
  retriesRef.current = 0;
  connectingRef.current = false;
  ws.send(JSON.stringify({ type: 'session.start' }));

  processor.onaudioprocess = (e) => {
    // Use ref to allow nulling on cleanup, not closure-captured ws
    if (wsRef.current?.readyState !== WebSocket.OPEN) return;
    const input = e.inputBuffer.getChannelData(0);
    const downsampled = downsample(input, ctx.sampleRate);
    const b64 = float32ToPcm16Base64(downsampled);
    wsRef.current.send(JSON.stringify({ type: 'audio.append', data: b64 }));
  };
};
```

---

### WR-04: `ttsReadyPromise` resolved twice per barge-in — double `ttsHandle` assignment

**File:** `ws-server/src/session.ts:100-103`

**Issue:** `ttsReadyPromise.then(...)` is called twice in `startResponse`: once at line 100 to store the handle (`session.ttsHandle = handle`), and once at line 103 to start the LLM stream. Both `.then` callbacks fire independently after the same promise resolves. If `cancelCurrentResponse()` is called between the two `.then` callbacks firing (a JavaScript microtask boundary), the first `.then` sets `session.ttsHandle = handle` to the new session's handle, but `cancelCurrentResponse()` (called at the top of the next `startResponse`) then calls `finishTtsSession(this.ttsHandle)` on a handle whose `finishing` flag is `false` — incorrectly sending `session.finish` to the TTS WebSocket before any text has been appended, causing the TTS session to close prematurely and silence the response.

**Fix:** Merge the two `.then` chains into one and assign the handle atomically before starting the LLM stream:
```typescript
ttsReadyPromise.then((handle) => {
  session.ttsHandle = handle;  // assign before LLM starts

  const prompt = isGreeting
    ? '[GREETING] The visitor just activated the voice interface. Greet them.'
    : userText;

  streamLlmResponse(
    prompt,
    session.conversationHistory.slice(),
    // ... callbacks unchanged
    abort.signal,
    opts?.bargeInPrefix
  );
}).catch((err) => {
  console.error('[session] TTS failed to open:', err);
});
```

---

### WR-05: Conversation history trimming removes pairs from the wrong end on overflow

**File:** `ws-server/src/session.ts:76-79` and `123-126`

**Issue:** When `conversationHistory` exceeds `MAX_HISTORY_ENTRIES`, the code calls `shift()` twice to evict a user+assistant pair from the front. However the first shift at line 77 removes the oldest user message, and the second shift at line 78 removes what is now the oldest remaining entry — which is the assistant reply for that removed user message. This is only correct if history always alternates user/assistant perfectly. If `startResponse` is called twice in rapid succession (two final transcripts before either assistant reply is appended), two user entries are pushed without intervening assistant entries. A subsequent overflow trim will remove one user message and one assistant message that belong to different turns, breaking the interleaving invariant expected by the LLM's conversation context and potentially sending malformed role sequences to the model.

**Fix:** Trim to `MAX_HISTORY_ENTRIES` by slicing rather than double-shifting:
```typescript
// After pushing user turn:
if (session.conversationHistory.length > MAX_HISTORY_ENTRIES) {
  session.conversationHistory = session.conversationHistory.slice(
    session.conversationHistory.length - MAX_HISTORY_ENTRIES
  );
}

// After pushing assistant turn (same pattern):
if (session.conversationHistory.length > MAX_HISTORY_ENTRIES) {
  session.conversationHistory = session.conversationHistory.slice(
    session.conversationHistory.length - MAX_HISTORY_ENTRIES
  );
}
```

---

## Info

### IN-01: `downsample` uses nearest-neighbor — produces aliasing at high frequencies

**File:** `app/hooks/useRealtimeVoice.ts:60-69`

**Issue:** The downsampler selects samples by truncating the index (`Math.floor(i * ratio)`) without any anti-aliasing filter. For microphone capture this causes frequency aliasing above the Nyquist frequency of the output (8kHz), which can degrade ASR accuracy on high-pitched voices. This is a quality issue, not a crash. Noted here as a known limitation.

**Fix:** Replace with simple averaging (box filter) over the source window for each output sample:
```typescript
function downsample(float32: Float32Array, srcRate: number): Float32Array {
  if (srcRate === MIC_SAMPLE_RATE) return float32;
  const ratio = srcRate / MIC_SAMPLE_RATE;
  const outLen = Math.floor(float32.length / ratio);
  const out = new Float32Array(outLen);
  for (let i = 0; i < outLen; i++) {
    const start = Math.floor(i * ratio);
    const end = Math.min(Math.floor((i + 1) * ratio), float32.length);
    let sum = 0;
    for (let j = start; j < end; j++) sum += float32[j];
    out[i] = sum / (end - start);
  }
  return out;
}
```

---

### IN-02: `lastSourceRef` not tracked per-chunk — only the final scheduled source is retained

**File:** `app/hooks/useRealtimeVoice.ts:125`

**Issue:** `lastSourceRef.current = source` is overwritten on every call to `scheduleAudioChunk`. This is intentional (only the last source is needed for `onended`), but the previous source nodes are never explicitly cleaned up and their `onended` callbacks are never set, so they hold references to their `AudioBuffer` until garbage collected. For long responses with many chunks this can accumulate significant memory before GC runs. Not a crash, but worth noting.

**Fix:** Either add `source.onended = () => { /* allow GC */ }` on intermediate sources or switch to a queue-drain pattern using a single concatenated buffer per response turn.

---

### IN-03: `isValidBrowserMessage` in `types.ts` does not validate `data` field on `audio.append`

**File:** `ws-server/src/types.ts:17-21`

**Issue:** `isValidBrowserMessage` only checks `msg.type` is in the allowed set. For `audio.append` it does not verify that `data` is a non-empty string. The server's `handleAudio` path calls `forwardAudioToAsr(this.asrWs, base64)` with whatever `data` is, and `JSON.stringify` would serialize `undefined` as the string `"undefined"` — which base64-decodes to garbage bytes and silently poisons the ASR session. This is a robustness gap, not an exploitable injection vector (the data is forwarded to DashScope, not executed).

**Fix:**
```typescript
export function isValidBrowserMessage(msg: unknown): msg is BrowserMessage {
  if (typeof msg !== 'object' || msg === null || !('type' in msg)) return false;
  const m = msg as { type: string; data?: unknown };
  if (!['audio.append', 'audio.end', 'session.start'].includes(m.type)) return false;
  if (m.type === 'audio.append' && typeof m.data !== 'string') return false;
  return true;
}
```

---

_Reviewed: 2026-04-13_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
