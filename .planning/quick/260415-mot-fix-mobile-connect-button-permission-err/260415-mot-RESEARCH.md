# Quick Task: Fix Mobile Connect Button Permission Error - Research

**Researched:** 2026-04-15
**Domain:** Mobile browser getUserMedia / user gesture propagation
**Confidence:** HIGH

## Summary

The `getUserMedia` call fails on mobile browsers because the user gesture context is lost before the browser reaches the actual `getUserMedia` invocation. The call chain from button tap to `getUserMedia` passes through two `useCallback` wrappers and a `setState` call (`setPhase('connecting')`) before reaching `navigator.mediaDevices.getUserMedia()`. On iOS Safari and mobile Chrome, this breaks the "user activation" requirement for sensitive APIs.

Verified: No `Permissions-Policy` header is set on either `nim-kaleb.vercel.app` or `kalebnim.dev` -- the server is not blocking microphone access. The site is served over HTTPS (secure context requirement met). The root cause is purely client-side gesture propagation.

**Primary recommendation:** Move `getUserMedia` to execute immediately within the `connect` function (the direct click handler callback), before any state updates or other async work.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Implementation Decisions
- Error affects multiple mobile browsers (iOS Safari, iOS Chrome, Android Chrome) -- not browser-specific
- Error fires immediately on tap with no mic permission prompt appearing
- Show inline error message in terminal with clear guidance (e.g. "Enable microphone in browser settings")
- Do NOT add text chat fallback -- just fix the bug and improve error messaging

### Claude's Discretion
- Implementation approach for fixing root cause (Permissions-Policy, AudioContext resume, gesture propagation)
- Specific error message wording

</user_constraints>

## Root Cause Analysis

### The Problem: User Gesture Activation Lost

Mobile browsers require `getUserMedia` to be called within the "user activation" window of a user gesture (tap/click). The current call chain:

```
Button onClick → connect() [useCallback]
  → setPhase('connecting')     // <-- STATE UPDATE: may break gesture chain
  → await connectInternal()    // <-- ANOTHER useCallback layer
    → getUserMedia({ audio: true })  // <-- TOO LATE, gesture expired
```

**Why this breaks on mobile but works on desktop:** [VERIFIED: WebKit bug tracker, MDN docs]
- Desktop browsers (Chrome, Firefox, Safari) have a more lenient user activation window that survives async hops and React state updates
- iOS Safari is strict: user activation is consumed or expires after a state update + microtask boundary
- Mobile Chrome is similarly strict, though slightly more lenient than Safari

### Verified: NOT a Server Header Issue

```
$ curl -sI https://nim-kaleb.vercel.app/ | grep -i permissions-policy
(empty -- no header set)

$ curl -sI https://kalebnim.dev/ | grep -i permissions-policy
(empty -- no header set)
```

Neither Vercel nor the Next.js config sets a restrictive `Permissions-Policy` header. [VERIFIED: curl against production]

### Verified: HTTPS Is Correct

Both domains serve over HTTPS with HSTS. Secure context requirement is met. [VERIFIED: curl against production]

## Fix Pattern

### Recommended Fix: getUserMedia First, Then Setup

Move `getUserMedia` to be the FIRST async call in `connect()`, directly in the click handler's call chain, before any `setState`:

```typescript
// In useRealtimeVoice.ts — connect function
const connect = useCallback(async () => {
  if (connectingRef.current) return;
  
  // Tear down existing connection...
  // (existing cleanup code stays here)

  // CRITICAL: getUserMedia MUST be called FIRST, before any setState
  // Mobile browsers require this to be in the direct user gesture chain
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    setStatus({ phase: 'error', transcript: '', responseText: '', error: msg });
    return;
  }

  // NOW set phase and continue setup with the already-acquired stream
  setPhase('connecting');
  await connectInternal(stream);  // Pass stream as argument
}, [connectInternal, setPhase, cleanupAudio]);
```

Then update `connectInternal` to accept the stream as a parameter instead of calling `getUserMedia` itself:

```typescript
const connectInternal = useCallback(async (stream: MediaStream) => {
  if (connectingRef.current) return;
  connectingRef.current = true;
  try {
    micStreamRef.current = stream;
    // ... rest of setup (AudioContext, WebSocket, etc.) unchanged
```

**Why this works:** [CITED: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia]
- `getUserMedia` is the first await after the user tap
- No state updates happen before it
- The user activation is still valid when `getUserMedia` is called
- Once the stream is acquired, subsequent async work does not need user activation

### AudioContext.resume() Consideration

On iOS Safari, `AudioContext` may start in a "suspended" state even after user gesture. After moving `getUserMedia` first, also add explicit `resume()` calls:

```typescript
const ctx = new AudioContext({ sampleRate: MIC_SAMPLE_RATE });
await ctx.resume();  // Ensure not suspended on mobile
audioCtxRef.current = ctx;

const playbackCtx = new AudioContext({ sampleRate: PLAYBACK_SAMPLE_RATE });
await playbackCtx.resume();  // Same for playback context
playbackCtxRef.current = playbackCtx;
```

[ASSUMED] This is a defense-in-depth measure; the primary fix is the getUserMedia reordering.

### Permissions-Policy Header (Defense-in-Depth)

While not the root cause, adding an explicit `Permissions-Policy` header that ALLOWS microphone is good practice and prevents future breakage if Vercel changes defaults:

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'microphone=(self)',
          },
        ],
      },
    ];
  },
  // ... existing config
};
```

[CITED: https://nextjs.org/docs/pages/api-reference/config/next-config-js/headers]

## Error Messaging

When `getUserMedia` fails, the error message should distinguish between:

| Error Type | Detection | User Message |
|-----------|-----------|-------------|
| Permission denied | `err.name === 'NotAllowedError'` | "Microphone blocked. Tap the lock icon in your browser address bar to allow microphone access, then try again." |
| No microphone | `err.name === 'NotFoundError'` | "No microphone found. Please connect a microphone and try again." |
| Other | fallback | "Microphone error: {message}" |

[VERIFIED: MDN getUserMedia error types]

## Common Pitfalls

### Pitfall 1: Creating AudioContext Before getUserMedia
**What goes wrong:** AudioContext created before getUserMedia can be permanently suspended on iOS
**How to avoid:** Always call getUserMedia first, then create AudioContext

### Pitfall 2: Calling setState Before getUserMedia  
**What goes wrong:** React setState (even with hooks) causes a microtask boundary that can expire the user gesture on mobile
**How to avoid:** getUserMedia must be the first async operation after the click event fires

### Pitfall 3: Auto-reconnect Calling getUserMedia Without Gesture
**What goes wrong:** The existing auto-reconnect logic in `ws.onclose` calls `connectInternal()` which currently calls `getUserMedia` -- this will fail on mobile since there is no user gesture
**How to avoid:** On reconnect, reuse the existing `micStreamRef.current` stream if tracks are still live, or transition to error state asking user to tap Connect again

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | AudioContext.resume() is needed as defense-in-depth on mobile | Fix Pattern | Low -- worst case it's a no-op |
| A2 | Auto-reconnect will also fail getUserMedia without gesture | Pitfall 3 | Medium -- could cause reconnect failures |

## Sources

### Primary (HIGH confidence)
- [MDN getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia) - Error types, user gesture requirements
- [MDN Permissions-Policy: microphone](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Permissions-Policy/microphone) - Header syntax and defaults
- [Next.js headers config](https://nextjs.org/docs/pages/api-reference/config/next-config-js/headers) - How to set custom headers
- Production curl verification - No Permissions-Policy header present on either domain

### Secondary (MEDIUM confidence)
- [WebKit bug 198040](https://bugs.webkit.org/show_bug.cgi?id=198040) - User gesture lost through promises in WebKit
- [Vercel Next.js Discussion #35528](https://github.com/vercel/next.js/discussions/35528) - NotAllowedError on Chrome for iOS
- [Apple Developer Forums](https://developer.apple.com/forums/thread/92713) - getUserMedia on iOS requirements
- [ElevenLabs React issue #663](https://github.com/elevenlabs/packages/issues/663) - Same pattern: state broken on iOS Safari 18+

### Tertiary (LOW confidence)
- [Corbado Safari WebAuthn blog](https://www.corbado.com/blog/safari-webauthn-user-activated-events) - User gesture requirements (WebAuthn, analogous to getUserMedia)
