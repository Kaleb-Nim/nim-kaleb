---
phase: 260415-mot-fix-mobile-connect-button-permission-err
reviewed: 2026-04-15T08:33:09Z
depth: quick
files_reviewed: 2
files_reviewed_list:
  - app/hooks/useRealtimeVoice.ts
  - next.config.ts
findings:
  critical: 1
  warning: 2
  info: 1
  total: 4
status: issues_found
---

# Code Review Report

**Reviewed:** 2026-04-15T08:33:09Z
**Depth:** quick
**Files Reviewed:** 2
**Status:** issues_found

## Summary

Two source files reviewed via pattern-matching. `next.config.ts` is minimal and clean. `app/hooks/useRealtimeVoice.ts` contains the mobile permission fix work and is generally well-structured, but has one critical bug that will silently break auto-reconnect on mobile, one warning around an intentional-close race, and one informational item.

---

## Critical Issues

### CR-01: `intentionalCloseRef` reset order causes reconnect to trigger on ws.close() within connect()

**File:** `app/hooks/useRealtimeVoice.ts:393-400`

**Issue:** When `connect()` tears down an existing connection (lines 393-397), it sets `intentionalCloseRef.current = true` then calls `wsRef.current.close()`. The `onclose` handler fires asynchronously and sees `intentionalClose = true`, so it correctly skips reconnect. However, line 400 immediately resets `intentionalCloseRef.current = false` **synchronously** before the microtask/event loop that delivers the `onclose` event. If the WebSocket `onclose` fires before the microtask queue is drained (which can happen on mobile WebKit where close events are delivered synchronously or in the same task), `intentionalCloseRef` is already `false` and the auto-reconnect path at line 325 fires — starting a second parallel connection attempt with stale state.

**Fix:** Null-out `wsRef.current` before flipping `intentionalCloseRef` back to `false`, and delay the reset until `connectInternal` actually starts. The simplest safe pattern is to reset only inside `connectInternal` at successful open, or to set a `isReconnectingRef` flag that `onclose` checks first:

```ts
// connect() teardown block — keep intentionalClose true until connectInternal runs
if (wsRef.current) {
  intentionalCloseRef.current = true;
  const old = wsRef.current;
  wsRef.current = null;   // null BEFORE close so onclose skips reconnect branch
  old.close();
  cleanupAudio();
}
// Reset intentionalClose only just before calling connectInternal, not here
// intentionalCloseRef.current = false;  <-- remove this line from here

// ...getUserMedia...

intentionalCloseRef.current = false;  // set just before connecting
setPhase('connecting');
await connectInternal(stream);
```

---

## Warnings

### WR-01: `execSync('git log ...')` in `next.config.ts` runs at build time on every cold Vercel build — no fallback for shallow clones

**File:** `next.config.ts:6`

**Issue:** `execSync("git log main -1 --format=%cI")` will throw on Vercel's build environment when the repo is checked out as a shallow clone (depth 1 with no `main` branch ref available, which is the default for Vercel CI). The `catch` block silently falls back to `new Date().toISOString()`, making `NEXT_PUBLIC_LAST_SYNC` show the build time rather than the last commit date — a silent lie that could mislead debugging. Additionally, if `git` is unavailable (rare but possible in some serverless build images), the process will throw `ENOENT` before the `try/catch` can catch it, causing the entire build to fail since `execSync` with no `stdio: 'inherit'` will still throw.

**Fix:** Use `HEAD` instead of `main` (works in shallow clones) and add `stdio: 'pipe'` to suppress stderr noise:

```ts
const date = execSync("git log -1 --format=%cI HEAD", {
  encoding: "utf-8",
  stdio: ['pipe', 'pipe', 'pipe'],  // suppress stderr
}).trim();
```

### WR-02: `connectingRef` is never reset to `false` before the `getUserMedia` call in `connect()`

**File:** `app/hooks/useRealtimeVoice.ts:390-391`

**Issue:** `connect()` guards against double-invocation with `if (connectingRef.current) return` at line 391, but `connectingRef.current` is only set to `true` inside `connectInternal` at line 266. Between the guard check (line 391) and when `connectInternal` sets the flag (line 266), there is a ~async gap spanning the `getUserMedia` await (line 413) and `setPhase` call (line 421). If the user taps the connect button twice rapidly on mobile before `getUserMedia` resolves, two concurrent calls will both pass the guard, both call `getUserMedia`, and both call `connectInternal`, resulting in two WebSocket connections being opened simultaneously and duplicate mic streams.

**Fix:** Set `connectingRef.current = true` immediately at the top of `connect()`, before the `getUserMedia` call, and reset it to `false` in the error path:

```ts
const connect = useCallback(async () => {
  if (connectingRef.current) return;
  connectingRef.current = true;  // lock immediately

  // ...teardown...

  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (err) {
    const msg = getUserMediaErrorMessage(err);
    connectingRef.current = false;  // release on error
    setStatus({ phase: 'error', transcript: '', responseText: '', error: msg });
    return;
  }

  setPhase('connecting');
  await connectInternal(stream);
}, [connectInternal, setPhase, cleanupAudio]);
```

---

## Info

### IN-01: Leftover `console.log` in production reconnect path

**File:** `app/hooks/useRealtimeVoice.ts:328`

**Issue:** `console.log(`[ws] reconnecting in ${delay}ms...`)` logs on every auto-reconnect attempt in production. This is noise in user-facing production builds and exposes internal retry state to anyone with DevTools open.

**Fix:** Remove or gate behind a `process.env.NODE_ENV === 'development'` check:

```ts
if (process.env.NODE_ENV === 'development') {
  console.log(`[ws] reconnecting in ${delay}ms (attempt ${retriesRef.current + 1}/5)`);
}
```

---

_Reviewed: 2026-04-15T08:33:09Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: quick_
