---
phase: quick-260415-mot
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - app/hooks/useRealtimeVoice.ts
  - next.config.ts
autonomous: true
requirements: []

must_haves:
  truths:
    - "getUserMedia is the first async call after user tap, before any setState"
    - "Mobile browsers (iOS Safari, iOS Chrome, Android Chrome) show mic permission prompt on Connect tap"
    - "AudioContext.resume() is called after creation on both mic and playback contexts"
    - "Auto-reconnect reuses existing mic stream instead of calling getUserMedia without gesture"
    - "Permissions-Policy header explicitly allows microphone on all routes"
    - "NotAllowedError and NotFoundError produce user-friendly inline error messages"
  artifacts:
    - path: "app/hooks/useRealtimeVoice.ts"
      provides: "Gesture-safe getUserMedia, AudioContext resume, reconnect stream reuse, error messaging"
    - path: "next.config.ts"
      provides: "Permissions-Policy: microphone=(self) header"
  key_links:
    - from: "VoiceInterface connect button onClick"
      to: "useRealtimeVoice connect()"
      via: "getUserMedia called first in connect(), before setPhase"
      pattern: "getUserMedia.*audio.*true"
    - from: "connect()"
      to: "connectInternal(stream)"
      via: "stream passed as parameter"
      pattern: "connectInternal\\(stream\\)"
---

<objective>
Fix the mobile "Connect" button failing with a NotAllowedError by restructuring the getUserMedia call chain so it executes within the user gesture activation window.

Purpose: Mobile browsers (iOS Safari, iOS Chrome, Android Chrome) require getUserMedia to be the first async operation after a user tap. The current code calls setPhase('connecting') before getUserMedia, which breaks the gesture chain on mobile.

Output: Updated useRealtimeVoice.ts with gesture-safe connect flow, improved error messages, and Permissions-Policy header in next.config.ts.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@app/hooks/useRealtimeVoice.ts
@app/components/VoiceInterface.tsx
@next.config.ts
@.planning/quick/260415-mot-fix-mobile-connect-button-permission-err/260415-mot-RESEARCH.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Restructure connect flow for mobile gesture safety and improve error messages</name>
  <files>app/hooks/useRealtimeVoice.ts</files>
  <action>
Three changes to useRealtimeVoice.ts:

**Change A: Move getUserMedia into connect(), before any setState (CRITICAL)**

In the `connect` function (line ~344), restructure so getUserMedia is called FIRST, before `setPhase('connecting')`:

```typescript
const connect = useCallback(async () => {
  if (connectingRef.current) return;
  // Tear down existing connection before starting fresh
  if (wsRef.current) {
    intentionalCloseRef.current = true;
    wsRef.current.close();
    wsRef.current = null;
    cleanupAudio();
  }
  // Reset reconnect state
  intentionalCloseRef.current = false;
  retriesRef.current = 0;
  if (reconnectTimerRef.current) {
    clearTimeout(reconnectTimerRef.current);
    reconnectTimerRef.current = null;
  }

  // CRITICAL: getUserMedia MUST be called FIRST, before any setState.
  // Mobile browsers (iOS Safari, mobile Chrome) require this to be in the
  // direct user gesture chain — calling setPhase() before getUserMedia
  // breaks the user activation window on mobile.
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (err) {
    const msg = getUserMediaErrorMessage(err);
    setStatus({ phase: 'error', transcript: '', responseText: '', error: msg });
    return;
  }

  // NOW safe to update phase — stream is already acquired
  setPhase('connecting');
  await connectInternal(stream);
}, [connectInternal, setPhase, cleanupAudio]);
```

**Change B: Update connectInternal to accept a MediaStream parameter**

Change `connectInternal` signature from `async ()` to `async (stream: MediaStream)`. Remove the `getUserMedia` call inside it (line 250). Use the passed `stream` directly:

```typescript
const connectInternal = useCallback(async (stream: MediaStream) => {
  if (connectingRef.current) return;
  connectingRef.current = true;
  try {
    micStreamRef.current = stream;

    // Mic capture AudioContext at 16kHz for ASR
    const ctx = new AudioContext({ sampleRate: MIC_SAMPLE_RATE });
    await ctx.resume(); // Ensure not suspended on mobile
    audioCtxRef.current = ctx;

    // Separate playback AudioContext at 24kHz for TTS
    const playbackCtx = new AudioContext({ sampleRate: PLAYBACK_SAMPLE_RATE });
    await playbackCtx.resume(); // Ensure not suspended on mobile
    playbackCtxRef.current = playbackCtx;
    nextPlayTimeRef.current = playbackCtx.currentTime;

    // ... rest of connectInternal unchanged from line 262 onwards
```

Also update the auto-reconnect in `ws.onclose` (line ~303-317): Instead of calling bare `connectInternal()`, check if the existing mic stream is still active. If tracks are live, reuse the stream. If not, transition to error state asking user to tap Connect again:

```typescript
ws.onclose = () => {
  wsRef.current = null;

  if (!intentionalCloseRef.current && retriesRef.current < 5) {
    const delay = Math.min(1000 * 2 ** retriesRef.current, 30000);
    console.log(`[ws] reconnecting in ${delay}ms (attempt ${retriesRef.current + 1}/5)`);

    // Clean up audio contexts but check mic stream viability
    processorRef.current?.disconnect();
    processorRef.current = null;
    analyserRef.current?.disconnect();
    analyserRef.current = null;
    audioCtxRef.current?.close();
    audioCtxRef.current = null;
    playbackCtxRef.current?.close();
    playbackCtxRef.current = null;
    lastSourceRef.current = null;

    reconnectTimerRef.current = setTimeout(() => {
      retriesRef.current++;
      const existingStream = micStreamRef.current;
      const tracksLive = existingStream?.getTracks().some(t => t.readyState === 'live');
      if (existingStream && tracksLive) {
        connectInternal(existingStream);
      } else {
        // No live mic stream and no user gesture — cannot call getUserMedia
        micStreamRef.current?.getTracks().forEach(t => t.stop());
        micStreamRef.current = null;
        connectingRef.current = false;
        setStatus(prev => ({
          ...prev,
          phase: 'error',
          error: 'Connection lost. Tap Connect to reconnect.',
        }));
        transitionTo('VOICE_IDLE');
      }
    }, delay);
  } else if (!intentionalCloseRef.current) {
    // Max retries exhausted
    cleanupAudio();
    setStatus(prev => ({
      ...prev,
      phase: 'error',
      error: 'Connection lost. Max reconnect attempts reached.',
    }));
    transitionTo('VOICE_IDLE');
  } else {
    // Intentional close
    cleanupAudio();
    setStatus(prev => ({
      ...prev,
      phase: prev.phase === 'error' ? 'error' : 'idle',
    }));
    transitionTo('VOICE_IDLE');
  }
};
```

**Change C: Add getUserMediaErrorMessage helper function**

Add a helper function above the hook export (near line 70) that maps getUserMedia errors to user-friendly messages:

```typescript
function getUserMediaErrorMessage(err: unknown): string {
  if (err instanceof DOMException) {
    switch (err.name) {
      case 'NotAllowedError':
        return 'Microphone blocked. Tap the lock icon in your browser address bar to allow microphone access, then try again.';
      case 'NotFoundError':
        return 'No microphone found. Please connect a microphone and try again.';
      case 'NotReadableError':
        return 'Microphone is in use by another application. Close other apps using the mic and try again.';
      default:
        return `Microphone error: ${err.message}`;
    }
  }
  return `Microphone error: ${err instanceof Error ? err.message : String(err)}`;
}
```

Update the `useCallback` dependency array for `connectInternal` — remove `handleMessage` dependency if it was only there for the old flow. The new signature is `async (stream: MediaStream)` and dependencies should be: `[handleMessage, cleanupAudio, transitionTo]` (cleanupAudio is still used in onclose for intentional/max-retry cases, but the reconnect path now does manual cleanup to preserve the mic stream).

Wait — actually, keep cleanupAudio in the dependency array. The reconnect path does its own selective cleanup (contexts and processors but not mic), while intentional close and max-retry paths use full cleanupAudio.
  </action>
  <verify>
    <automated>cd /Users/kalebnim/Documents/GitHub/nim-kaleb && bun run build 2>&1 | tail -20</automated>
  </verify>
  <done>
- getUserMedia is the FIRST await in connect(), before any setPhase call
- connectInternal accepts MediaStream as parameter, no longer calls getUserMedia
- AudioContext.resume() called on both mic and playback contexts after creation
- Auto-reconnect reuses live mic stream or shows "Tap Connect to reconnect" error
- getUserMediaErrorMessage maps NotAllowedError, NotFoundError, NotReadableError to user-friendly messages
- Build passes with no TypeScript errors
  </done>
</task>

<task type="auto">
  <name>Task 2: Add Permissions-Policy header allowing microphone</name>
  <files>next.config.ts</files>
  <action>
Add an async `headers()` function to the Next.js config that sets `Permissions-Policy: microphone=(self)` on all routes. This is defense-in-depth — not the root cause, but prevents future breakage if Vercel changes header defaults.

Update next.config.ts to:

```typescript
import type { NextConfig } from "next";
import { execSync } from "child_process";

function getLastMainCommitDate(): string {
  try {
    const date = execSync("git log main -1 --format=%cI", { encoding: "utf-8" }).trim();
    return date;
  } catch {
    return new Date().toISOString();
  }
}

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_LAST_SYNC: getLastMainCommitDate(),
  },
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
};

export default nextConfig;
```
  </action>
  <verify>
    <automated>cd /Users/kalebnim/Documents/GitHub/nim-kaleb && bun run build 2>&1 | tail -5</automated>
  </verify>
  <done>
- next.config.ts contains async headers() returning Permissions-Policy: microphone=(self) on all routes
- Build passes successfully
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Browser mic API | getUserMedia requires user gesture and permission |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-mot-01 | Spoofing | getUserMedia | accept | Browser enforces permission prompt; no app-level spoofing vector |
| T-mot-02 | Denial of Service | AudioContext | mitigate | resume() after creation prevents permanently suspended contexts on mobile |
</threat_model>

<verification>
1. `bun run build` completes without errors
2. On mobile browser (iOS Safari preferred): tap Connect, mic permission prompt appears, voice flow works
3. Verify `curl -sI https://nim-kaleb.vercel.app/ | grep -i permissions-policy` returns `microphone=(self)` after deploy
</verification>

<success_criteria>
- Mobile Connect button triggers mic permission prompt instead of immediate NotAllowedError
- getUserMedia executes before any React state update in the click handler chain
- Auto-reconnect reuses existing mic stream or gracefully asks user to tap Connect again
- User-friendly error messages for NotAllowedError, NotFoundError, NotReadableError
- Permissions-Policy header set on all routes
</success_criteria>

<output>
After completion, create `.planning/quick/260415-mot-fix-mobile-connect-button-permission-err/260415-mot-SUMMARY.md`
</output>
