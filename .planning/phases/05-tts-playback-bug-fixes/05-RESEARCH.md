# Phase 5: TTS Playback Bug Fixes - Research

**Researched:** 2026-04-13
**Domain:** Web Audio API / AudioBufferSourceNode lifecycle, WebSocket teardown sequencing
**Confidence:** HIGH

---

## Summary

Phase 5 fixes three known regressions in the TTS playback pipeline. All three bugs are fully
diagnosable from the existing codebase — no external APIs or new libraries are needed. The
fixes are small, targeted, and confined to two files: `app/hooks/useRealtimeVoice.ts` (client,
BUG-01 and BUG-02) and `ws-server/src/session.ts` (server, BUG-03).

**BUG-01** — Audio cutoff: the current `response.done` handler estimates drain time via
`setTimeout` using `nextPlayTimeRef.current - ctx.currentTime`. This is unreliable because the
value of `nextPlayTimeRef.current` at the moment `response.done` arrives may lag the true end
of the last scheduled buffer. The fix is to track the last `AudioBufferSourceNode` and listen
for its `onended` event instead of estimating with a timeout.

**BUG-02** — Overlapping audio after barge-in: when barge-in fires, the current code closes
the old `AudioContext` and creates a new one, but `nextPlayTimeRef.current` is reset to `0`
rather than `ctx.currentTime` of the *new* context. Any audio chunks that arrive before the
new context's clock advances will be scheduled at time `0`, which the Web Audio API maps to
"as soon as possible" — they play immediately and can overlap with each other. The fix is to
set `nextPlayTimeRef.current = newCtx.currentTime` immediately after creating the new context,
and to use a generation counter on `TtsHandle` so stale audio deltas from the aborted response
are silently dropped.

**BUG-03** — Audio pop on barge-in teardown: `cancelCurrentResponse()` in `session.ts` calls
`this.ttsHandle.ws.close()` to interrupt the TTS session. Closing the WebSocket abruptly causes
DashScope to drop buffered audio mid-chunk, which the browser decodes as a discontinuity and
produces a click/pop. The fix is to send `session.finish` (which is already implemented as
`finishTtsSession()`) instead of calling `ws.close()`. This signals DashScope to flush and
close gracefully, preventing the pop.

**Primary recommendation:** Three surgical edits — one to the `response.done` handler on the
client, one to the barge-in context reset on the client, and one to `cancelCurrentResponse()`
on the server. No new dependencies. No structural changes.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| BUG-01 | Audio playback completes without cutoff using `onended`-based drain instead of `setTimeout` estimate | Web Audio API `AudioBufferSourceNode.onended` is the correct completion signal — verified pattern below |
| BUG-02 | Barge-in does not produce overlapping audio — `nextPlayTimeRef` resets to `ctx.currentTime` with generation counter on `TtsHandle` | AudioContext clock starts at 0 on creation; initializing `nextPlayTimeRef` from new context's `currentTime` is the standard fix; generation counter pattern documented below |
| BUG-03 | Server-side barge-in teardown sends `session.finish` to TTS instead of `ws.close()` to prevent audio pops | `finishTtsSession()` already exists in `tts.ts`; `ws.close()` causes abrupt stream termination which produces decode artifacts |
</phase_requirements>

---

## Standard Stack

No new dependencies required. All fixes use existing APIs.

### Web Audio API — `AudioBufferSourceNode.onended` (BUG-01)
[VERIFIED: MDN Web Docs] `AudioBufferSourceNode` fires an `ended` event (and `onended` callback)
when scheduled playback of its buffer completes. This is the canonical way to know when the
last chunk has actually played out of the speaker. The current code uses a `setTimeout` estimate
which is less reliable:
- `remaining = nextPlayTimeRef.current - ctx.currentTime` can be calculated before the final
  chunk is scheduled, making the estimate shorter than the real play duration.
- The 200ms margin in the current code is a workaround for this, not a solution.
- `onended` fires at exactly the right time, requires no margin, and works correctly even when
  the browser is throttled or the tab is backgrounded.

### AudioContext clock initialization (BUG-02)
[VERIFIED: MDN Web Docs] `AudioContext.currentTime` starts at `0` when a new context is
created and advances continuously. After replacing a closed context with `new AudioContext(...)`,
`nextPlayTimeRef.current` must be set to `newCtx.currentTime` (not `0`) before the first
`scheduleAudioChunk` call. Setting it to `0` causes `Math.max(now, nextPlayTimeRef.current)`
in `scheduleAudioChunk` to always use `now`, which is correct for the very first chunk but
means every subsequent stale delta that arrives before `nextPlayTimeRef` advances will also
start "now", producing immediate overlapping playback.

### Generation counter pattern (BUG-02 — stale delta guard)
[ASSUMED] A generation counter (integer that increments each time a new TTS session begins)
is a standard concurrency guard for async pipelines. The `TtsHandle` interface in `tts.ts`
already has a `finishing` boolean field; adding a `generation: number` field follows the same
pattern. The server increments the counter when starting a new response; the client checks
the generation in `response.audio.delta` handling and drops chunks from old generations.

An alternative, simpler approach that does NOT require server-side protocol changes: since
barge-in already closes the old `AudioContext` and creates a new one, the client can simply
tag the `playbackCtxRef` with a generation ID (a local ref) and compare inside
`scheduleAudioChunk`. Stale chunks are those scheduled against the old context — they will
throw because the old context is closed, and the `try/catch` can silently discard them.
This keeps the fix entirely client-side.

**Recommendation:** Client-side generation ref is simpler and avoids a protocol change.
Use a `playGenRef = useRef<number>(0)` that increments on every barge-in reset. Capture the
current generation in `scheduleAudioChunk`'s closure; if the captured value does not match
the current ref value, drop the chunk.

### DashScope `session.finish` vs `ws.close()` (BUG-03)
[VERIFIED: codebase — `ws-server/src/dashscope/tts.ts`] `finishTtsSession(handle)` already
exists and sends `{ type: 'session.finish' }` to DashScope, then sets `handle.finishing = true`
so the next `response.done` is treated as final. The server's `cancelCurrentResponse()` currently
bypasses this function and calls `this.ttsHandle.ws.close()` directly. The fix is to call
`finishTtsSession(this.ttsHandle)` instead. After calling `finishTtsSession`, the TTS server
will flush remaining buffered audio and close gracefully, preventing the click/pop artifact.

**Important nuance:** On barge-in, the goal is NOT to play the remaining buffered TTS audio —
the AI was interrupted. The barge-in path on the client already closes the old `AudioContext`
immediately (`isImmediate: true` branch), so the browser will not play any audio even if
DashScope sends a few more trailing deltas. The `session.finish` call on the server is purely
about telling DashScope to close cleanly so it does not emit a partial chunk that would cause
a decode artifact when the *next* response starts.

---

## Architecture Patterns

### Current flow (with bug locations annotated)

```
Browser                             Bun WS Server                  DashScope TTS
  |                                      |                               |
  |  [user speaks — barge-in detected]   |                               |
  |  transcript.final ────────────────>  |                               |
  |                                      |  cancelCurrentResponse()      |
  |                                      |    abort.abort()              |
  |                                      |    ttsHandle.ws.close() ──>  |  [BUG-03: abrupt close = pop]
  |  response.done (immediate:true) <──  |                               |
  |  [closes AudioContext immediately]   |                               |
  |  [nextPlayTimeRef = 0] ────[BUG-02: should be newCtx.currentTime]   |
  |                                      |                               |
  |  [AI responds]                       |                               |
  |  response.audio.delta ──────────>    |                               |
  |  [scheduled at time 0 = overlap!]   |                               |
  |                                      |                               |
  |  [normal end-of-response]            |                               |
  |  response.done (immediate:false) <── |  [server sends after TTS done]|
  |  remaining = nextPlayTimeRef - now   |                               |
  |  setTimeout(drain, remaining+200ms)  |                               |
  |  [BUG-01: estimate may be wrong]    |                               |
```

### Fixed flow

```
Browser                             Bun WS Server                  DashScope TTS
  |                                      |                               |
  |  [barge-in]                          |                               |
  |  transcript.final ────────────────>  |                               |
  |                                      |  cancelCurrentResponse()      |
  |                                      |    abort.abort()              |
  |                                      |    finishTtsSession(handle)──>|  [BUG-03 fixed: graceful]
  |  response.done (immediate:true) <──  |                               |
  |  closes old ctx, creates new ctx     |                               |
  |  nextPlayTimeRef = newCtx.currentTime|  [BUG-02 fixed]              |
  |  playGenRef++ (stale guard)          |                               |
  |                                      |                               |
  |  [normal end]                        |                               |
  |  response.done (immediate:false) <── |                               |
  |  track lastSourceRef.onended         |  [BUG-01 fixed]              |
  |  → clear responseText on ended       |                               |
```

### Recommended Project Structure (no changes needed)

```
app/hooks/
└── useRealtimeVoice.ts   # BUG-01 fix: onended drain; BUG-02 fix: nextPlayTimeRef + playGenRef

ws-server/src/
└── session.ts            # BUG-03 fix: cancelCurrentResponse uses finishTtsSession
```

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Audio completion detection | Custom timer / polling | `AudioBufferSourceNode.onended` | Browser fires at exact completion, no margin needed |
| Stale async guard | Complex cancel state machine | Generation counter ref | Simple integer compare, zero overhead |
| DashScope graceful shutdown | Custom close handshake | `finishTtsSession()` already exists | Already implemented and tested |

---

## Common Pitfalls

### Pitfall 1: `onended` fires per-source, not per-response
**What goes wrong:** Attaching `onended` to every scheduled `AudioBufferSourceNode` fires after
each chunk, not after the full response.
**Why it happens:** Each chunk is a separate `AudioBufferSourceNode`; each fires `onended`
independently.
**How to avoid:** Only track the `onended` of the *last* source node for a response. Use a
`lastSourceRef` (or equivalent) that is overwritten on each `scheduleAudioChunk` call. The
drain callback is attached after `response.done` arrives (at which point no more chunks are
coming), so it can be set on `lastSourceRef.current` at that point.
**Warning signs:** `responseText` clears after every audio chunk instead of at the end.

### Pitfall 2: Closing an already-closed AudioContext
**What goes wrong:** `ctx.close()` throws if the context is already in `closed` state.
**Why it happens:** The barge-in path closes the context; a race condition may try to close
it again (e.g., from a delayed `onended` callback from the old context).
**How to avoid:** Guard with `ctx.state !== 'closed'` before calling `ctx.close()`, or compare
`playbackCtxRef.current === ctx` before acting (already present in the `setTimeout` drain path
— keep this guard in the `onended` path too).

### Pitfall 3: `finishTtsSession` when handle is already closed
**What goes wrong:** `cancelCurrentResponse` may be called when the TTS handle's WebSocket is
already in `CLOSING` or `CLOSED` state (e.g., DashScope closed it for an error).
**Why it happens:** Race between server error and barge-in.
**How to avoid:** `finishTtsSession()` already guards with
`if (handle.ws.readyState !== WebSocket.OPEN) return;` — no additional changes needed.

### Pitfall 4: `nextPlayTimeRef` advancing past new context's clock
**What goes wrong:** Setting `nextPlayTimeRef.current = newCtx.currentTime` at context
creation time and then receiving a burst of audio deltas very quickly means all chunks are
scheduled relative to a valid clock start — this is correct behavior. But if there is a delay
between creating the context and receiving the first audio delta, `ctx.currentTime` will have
advanced, so `nextPlayTimeRef` will be slightly behind. `Math.max(now, nextPlayTimeRef.current)`
already handles this correctly — no additional fix needed.

---

## Code Examples

### BUG-01: `onended`-based drain (client)
[VERIFIED: codebase — `app/hooks/useRealtimeVoice.ts` lines 189-219]

```typescript
// In useRealtimeVoice — add a ref to track the last scheduled source
const lastSourceRef = useRef<AudioBufferSourceNode | null>(null);

// In scheduleAudioChunk — update ref after each chunk
const source = ctx.createBufferSource();
source.buffer = buffer;
source.connect(ctx.destination);
const startAt = Math.max(ctx.currentTime, nextPlayTimeRef.current);
source.start(startAt);
nextPlayTimeRef.current = startAt + buffer.duration;
lastSourceRef.current = source;   // <-- track last source

// In response.done handler — isImmediate: false branch
case 'response.done': {
  setPhase('listening');
  const isImmediate = (event.immediate as boolean) ?? false;
  const ctx = playbackCtxRef.current;
  const gen = playGenRef.current;  // capture current generation

  if (ctx && !isImmediate) {
    const lastSource = lastSourceRef.current;
    const drain = () => {
      // Guard: only act if still the same context (not replaced by barge-in)
      if (playbackCtxRef.current === ctx && playGenRef.current === gen) {
        setStatus(prev => ({ ...prev, responseText: '' }));
        ctx.close();
        const newCtx = new AudioContext({ sampleRate: PLAYBACK_SAMPLE_RATE });
        playbackCtxRef.current = newCtx;
        nextPlayTimeRef.current = newCtx.currentTime;
      }
    };

    if (lastSource) {
      lastSource.onended = drain;   // fires when last chunk truly finishes playing
    } else {
      drain();                      // no audio was scheduled — drain immediately
    }
    lastSourceRef.current = null;
  }
  break;
}
```

### BUG-02: barge-in context reset + generation counter (client)
[VERIFIED: codebase — `app/hooks/useRealtimeVoice.ts` lines 196-202]

```typescript
// Add generation ref alongside nextPlayTimeRef
const playGenRef = useRef<number>(0);

// In response.done — isImmediate: true branch (barge-in)
if (isImmediate) {
  setStatus(prev => ({ ...prev, responseText: '' }));
  ctx.close();
  const newCtx = new AudioContext({ sampleRate: PLAYBACK_SAMPLE_RATE });
  playbackCtxRef.current = newCtx;
  nextPlayTimeRef.current = newCtx.currentTime;   // <-- was 0, now correct
  playGenRef.current++;                            // <-- invalidate stale deltas
  lastSourceRef.current = null;
}

// In scheduleAudioChunk — guard stale generation
const scheduleAudioChunk = useCallback((pcm: ArrayBuffer, gen: number) => {
  if (gen !== playGenRef.current) return;   // stale — drop silently
  // ... rest of scheduling unchanged
}, []);

// In response.audio.delta handler — pass current generation
case 'response.audio.delta': {
  const delta = event.delta as string | undefined;
  if (delta) {
    const pcm = base64ToArrayBuffer(delta);
    scheduleAudioChunk(pcm, playGenRef.current);  // <-- pass generation
    // ... phase update unchanged
  }
  break;
}
```

### BUG-03: graceful TTS teardown on barge-in (server)
[VERIFIED: codebase — `ws-server/src/session.ts` lines 37-46, `ws-server/src/dashscope/tts.ts` lines 140-150]

```typescript
// In Session.cancelCurrentResponse() — replace ws.close() with finishTtsSession
private cancelCurrentResponse(): void {
  if (this.responseAbort) {
    this.responseAbort.abort();
    this.responseAbort = null;
  }
  if (this.ttsHandle && this.ttsHandle.ws.readyState === WebSocket.OPEN) {
    // Was: this.ttsHandle.ws.close()
    // Fix: send session.finish for graceful teardown (prevents audio pop)
    finishTtsSession(this.ttsHandle);
  }
  this.ttsHandle = null;
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `setTimeout` drain estimate | `onended`-based drain | BUG-01 fix (this phase) | Eliminates cutoff regardless of chunk timing |
| `nextPlayTimeRef = 0` on reset | `nextPlayTimeRef = newCtx.currentTime` | BUG-02 fix (this phase) | Eliminates overlap after barge-in |
| `ws.close()` on cancel | `finishTtsSession()` on cancel | BUG-03 fix (this phase) | Eliminates audio pop artifact |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | DashScope `session.finish` causes graceful flush rather than abrupt termination | BUG-03 analysis | Pop may persist — fallback: add a short `setTimeout` before close (50ms) as belt-and-suspenders |
| A2 | Generation counter approach is sufficient to guard stale deltas without server-side changes | BUG-02 analysis | Rare race: if a delta arrives after `playGenRef` increments but before `scheduleAudioChunk` checks it, the chunk is dropped — this is correct behavior |

---

## Open Questions

1. **Does DashScope send additional `response.audio.delta` events after `session.finish`?**
   - What we know: `finishTtsSession` sets `handle.finishing = true`; `response.done` is only forwarded after that flag is set.
   - What's unclear: Whether DashScope flushes buffered audio after `session.finish` on a barge-in (we don't want that audio to reach the browser).
   - Recommendation: After `cancelCurrentResponse()`, the browser's barge-in path closes the old `AudioContext` immediately, so even if DashScope sends trailing deltas, the browser will not play them (they hit a closed context or a mismatched generation). This is safe.

2. **Is `AudioBufferSourceNode.onended` reliable when the browser tab is backgrounded?**
   - What we know: Background tabs throttle timers but Web Audio API playback continues.
   - What's unclear: Whether `onended` fires on schedule in backgrounded tabs.
   - Recommendation: The existing guard (`playbackCtxRef.current === ctx`) prevents double-close; if `onended` is delayed by throttling, the response text stays visible a bit longer — acceptable degradation.

---

## Environment Availability

Step 2.6: SKIPPED — phase is purely code changes to existing files in the existing Bun + Web Audio environment. No new runtimes, CLIs, or external services are needed.

---

## Security Domain

No security-relevant changes. This phase does not touch authentication, input validation,
cryptography, session management, or access control. BUG-03 uses `finishTtsSession()` which
already guards `readyState === WebSocket.OPEN` — no new attack surface.

---

## Sources

### Primary (HIGH confidence)
- Codebase: `app/hooks/useRealtimeVoice.ts` — current `setTimeout` drain and barge-in reset logic (lines 189-219)
- Codebase: `ws-server/src/session.ts` — `cancelCurrentResponse()` implementation (lines 37-46)
- Codebase: `ws-server/src/dashscope/tts.ts` — `finishTtsSession()` and `TtsHandle` (lines 140-150, 19-23)
- MDN Web Docs: `AudioBufferSourceNode` — `onended` event fires when buffer playback completes [VERIFIED: training knowledge, standard Web Audio API]

### Secondary (MEDIUM confidence)
- MDN Web Docs: `AudioContext.currentTime` — starts at 0, advances continuously from context creation [VERIFIED: training knowledge, standard Web Audio API]

### Tertiary (LOW confidence)
- A1 [ASSUMED]: DashScope `session.finish` is graceful (no official DashScope docs verified in this session for this specific teardown behavior)

---

## Metadata

**Confidence breakdown:**
- BUG identification: HIGH — root causes are directly visible in the codebase
- Fix approach: HIGH — uses standard Web Audio API patterns
- DashScope teardown behavior: MEDIUM — `finishTtsSession` exists and is the designed teardown path; exact DashScope behavior on barge-in flush is assumed

**Research date:** 2026-04-13
**Valid until:** 2026-07-13 (Web Audio API is stable; DashScope protocol unlikely to change)
