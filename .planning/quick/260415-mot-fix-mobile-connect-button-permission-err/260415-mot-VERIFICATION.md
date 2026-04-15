---
phase: quick-260415-mot
verified: 2026-04-15T00:00:00Z
status: gaps_found
score: 5/6 must-haves verified
gaps:
  - truth: "AudioContext.resume() is called after creation on both mic and playback contexts"
    status: partial
    reason: >
      Initial mic and playback AudioContext instances in connectInternal() correctly call
      await ctx.resume(). However, replacement playback AudioContext instances created in
      the response.done handler (lines 224 and 236 of useRealtimeVoice.ts) do NOT call
      .resume(). On mobile, AudioContext created outside a user gesture starts in suspended
      state. After the first TTS response completes, the recycled playback context is never
      resumed — this will silently drop audio on iOS Safari and mobile Chrome for all
      subsequent responses.
    artifacts:
      - path: "app/hooks/useRealtimeVoice.ts"
        issue: >
          Lines 224-228 (barge-in path) and 236-239 (drain path) create new AudioContext
          instances without calling .resume(). Both sites replace playbackCtxRef.current
          but the new context may start suspended on mobile.
    missing:
      - "Add await newCtx.resume() immediately after line 224 (new AudioContext in barge-in path)"
      - "Add await newCtx.resume() immediately after line 236 (new AudioContext in drain path)"
human_verification:
  - test: "Tap Connect on an iOS Safari or mobile Chrome browser"
    expected: "Browser mic permission prompt appears immediately on the tap"
    why_human: "Gesture-activation-window behavior cannot be verified statically; requires live device test"
  - test: "Have a full voice exchange (speak, hear response, speak again)"
    expected: "TTS audio plays for the second response, not just the first"
    why_human: "Verifies that recycled playback AudioContext is not suspended; requires live device + audio"
---

# Quick Task 260415-mot: Fix Mobile Connect Button Permission Error — Verification Report

**Task Goal:** Fix mobile Connect button permission error - getUserMedia not allowed by user agent
**Verified:** 2026-04-15
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | getUserMedia is the first async call after user tap, before any setState | VERIFIED | `connect()` lines 407-418: `navigator.mediaDevices.getUserMedia` called before `setPhase('connecting')`. setStatus only appears inside the catch (error path). |
| 2 | Mobile browsers show mic permission prompt on Connect tap | HUMAN NEEDED | Code structure supports it — getUserMedia precedes setState — but actual permission prompt requires live device verification. |
| 3 | AudioContext.resume() is called after creation on both mic and playback contexts | PARTIAL | `connectInternal` lines 272, 277: initial mic and playback contexts call `await ctx.resume()`. Lines 224 and 236: replacement playback contexts created in `response.done` handler do NOT call `.resume()` — mobile silent audio risk on second+ response. |
| 4 | Auto-reconnect reuses existing mic stream instead of calling getUserMedia without gesture | VERIFIED | `ws.onclose` lines 332-360: selective cleanup preserves `micStreamRef.current`, checks `tracks.readyState === 'live'`, calls `connectInternal(existingStream)` to reuse. Falls back to error + "Tap Connect to reconnect" if stream is dead. |
| 5 | Permissions-Policy header explicitly allows microphone on all routes | VERIFIED | `next.config.ts` lines 17-29: `source: '/(.*)'`, `key: 'Permissions-Policy'`, `value: 'microphone=(self)'`. |
| 6 | NotAllowedError and NotFoundError produce user-friendly inline error messages | VERIFIED | `getUserMediaErrorMessage` function lines 72-86 maps both error names to human-readable strings. `connect()` catch calls this helper and passes result to `setStatus({ error: msg })`. `VoiceInterface.tsx` line 137 renders `status.error` inside `errorLine` div. |

**Score:** 5/6 truths verified (1 partial gap, 1 human-needed)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `app/hooks/useRealtimeVoice.ts` | Restructured connect flow with getUserMedia-first | VERIFIED | getUserMedia first in connect(), connectInternal accepts MediaStream param, getUserMediaErrorMessage helper present, stream-reuse reconnect logic present |
| `next.config.ts` | Permissions-Policy header on all routes | VERIFIED | async headers() returns microphone=(self) for source /(.*) |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `connect()` | `navigator.mediaDevices.getUserMedia` | first await in function body | WIRED | Line 413: call before any setState on success path |
| `getUserMedia catch` | `getUserMediaErrorMessage` helper | try/catch at lines 414-416 | WIRED | Error passed through helper, result set to status.error |
| `status.error` | VoiceInterface error div | `{status.error && <div className={styles.errorLine}>}` | WIRED | VoiceInterface.tsx line 137-138 |
| `ws.onclose` reconnect | existing mic stream | `connectInternal(existingStream)` at line 348 | WIRED | Selective cleanup preserves micStreamRef; track liveness checked |
| `connectInternal` | `AudioContext.resume()` | lines 272, 277 (initial) | PARTIAL | Initial contexts: wired. Replacement contexts in response.done (lines 224, 236): missing .resume() |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `app/hooks/useRealtimeVoice.ts` | 224 | `new AudioContext(...)` without `.resume()` | Blocker | Playback context may start suspended on mobile; TTS audio silenced after first response on iOS/Android |
| `app/hooks/useRealtimeVoice.ts` | 236 | `new AudioContext(...)` without `.resume()` | Blocker | Same issue on normal (non-barge-in) response end path |

### Human Verification Required

#### 1. Mic Permission Prompt on Mobile Tap

**Test:** On an iOS Safari or mobile Chrome device, navigate to the site and tap the Connect button.
**Expected:** The browser's native microphone permission dialog appears immediately on the tap, without any "NotAllowedError" or silent failure.
**Why human:** User gesture activation window behavior is a browser runtime property — static code analysis can verify the structure (getUserMedia before setState) but not actual browser behavior.

#### 2. TTS Audio Plays on Second Response

**Test:** Complete a full voice exchange: tap Connect, allow mic, speak a question, hear the AI response, then speak a second question.
**Expected:** TTS audio plays for the second response, not just the first.
**Why human:** Verifies whether the replacement `AudioContext` created in `response.done` is suspended on mobile. This is the core risk introduced by the missing `.resume()` calls — it cannot be caught by static analysis.

### Gaps Summary

One gap is blocking full goal achievement: the replacement `AudioContext` instances created in the `response.done` message handler (both barge-in and normal paths) do not call `.resume()`. On mobile browsers, a newly created `AudioContext` outside a user gesture starts in `suspended` state. The initial connect path is correctly fixed — both contexts call `await ctx.resume()`. However, every time a TTS response finishes and a new playback context is created (to reset timing), the new context is never resumed. The result is that the first response may play audio correctly, but the second and all subsequent responses will be silent on iOS Safari and mobile Chrome.

Fix is minimal: add `await newCtx.resume()` at lines 225 and 237 immediately after each `new AudioContext(...)` call.

---

_Verified: 2026-04-15_
_Verifier: Claude (gsd-verifier)_
