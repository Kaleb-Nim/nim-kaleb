# Codebase Concerns

**Analysis Date:** 2026-04-09

## Tech Debt

**Deprecated Web Audio API in voice hook:**
- Issue: Use of `createScriptProcessor()` which is deprecated in favor of `AudioWorklet`
- Files: `app/hooks/useRealtimeVoice.ts:259`
- Impact: While still functional, this API is deprecated and may be removed from browsers in future versions. Performance may degrade in some contexts
- Fix approach: Replace `createScriptProcessor` with `AudioWorkletNode` for better performance isolation and future compatibility. Requires creating a separate `.js` worker file for audio processing

**Inconsistent hardcoded strings across components:**
- Issue: Hardcoded "Kebab" neural interface branding used inconsistently instead of "Kaleb"
- Files: `app/page.tsx:78,82,94,114` (welcome text, status dashboard, management URL)
- Impact: Portfolio branding is inconsistent (project name is "Kaleb Neural Interface" per design spec, but renders as "Kebab")
- Fix approach: Replace all "Kebab" references with "Kaleb" or extract to a centralized constants file

**Hardcoded API model version:**
- Issue: OpenAI Realtime API model version baked into code
- Files: `app/hooks/useRealtimeVoice.ts:266`, `app/api/realtime/session/route.ts:16`
- Impact: When OpenAI releases new model versions, code requires changes. Model version may become deprecated
- Fix approach: Move model identifier to environment variable `NEXT_PUBLIC_OPENAI_REALTIME_MODEL` or server-side config

**Downsampling algorithm uses naive nearest-neighbor interpolation:**
- Issue: Downsampling from source sample rate to 24kHz uses simple index flooring
- Files: `app/hooks/useRealtimeVoice.ts:54-62`
- Impact: Audio quality loss, especially at high frequencies. May cause aliasing artifacts
- Fix approach: Implement proper resampling (e.g., linear interpolation or polyphase filter)

## Known Bugs

**WebSocket connection state not fully cleaned up on error:**
- Symptoms: If WebSocket connection fails, reference may be retained causing memory leak
- Files: `app/hooks/useRealtimeVoice.ts:276-288`
- Trigger: WebSocket error during active connection, then rapid reconnection attempts
- Workaround: Refresh page to reset state

**Timer refs in page.tsx not properly checked:**
- Symptoms: Processing timer may fire after component unmount
- Files: `app/page.tsx:30-59`
- Trigger: Navigate away during PROCESSING state
- Workaround: Rapid navigation away doesn't cause issues in practice since user stays on page

**Floating point precision in PCM conversion:**
- Symptoms: Audio distortion at extreme values
- Files: `app/hooks/useRealtimeVoice.ts:30-35`
- Trigger: Loud audio input near clipping threshold
- Cause: Linear conversion uses fixed values (32768/32767) which can clip

## Security Considerations

**API key exposure in WebSocket URL:**
- Risk: Ephemeral token sent in WebSocket URL (though short-lived), visible in browser DevTools
- Files: `app/hooks/useRealtimeVoice.ts:265-271`
- Current mitigation: OpenAI provides short-lived ephemeral tokens (expires ~1 minute)
- Recommendations: 
  - Add Content Security Policy headers to prevent token exfiltration
  - Log token generation for audit trail
  - Consider implementing rate limiting on `/api/realtime/session` endpoint

**No input validation on session endpoint:**
- Risk: Endpoint accepts POST with no validation, could be called repeatedly
- Files: `app/api/realtime/session/route.ts`
- Current mitigation: Rate limiting by IP not implemented
- Recommendations:
  - Add request validation (method, headers)
  - Implement rate limiting per IP/user
  - Add authentication check if deployed with auth system

**User microphone permission not explicitly requested:**
- Risk: Silent failure if user denies mic permission creates confusion
- Files: `app/hooks/useRealtimeVoice.ts:243`
- Current mitigation: Error message shown but generic
- Recommendations:
  - Check `navigator.permissions.query()` before connecting
  - Provide explicit user-facing guidance when permission is denied

**No HTTPS enforcement verification:**
- Risk: Code calls `navigator.mediaDevices.getUserMedia()` which requires HTTPS; will silently fail on HTTP
- Files: `app/hooks/useRealtimeVoice.ts:243`
- Current mitigation: Vercel deployment enforces HTTPS
- Recommendations:
  - Add development-time check or warning if not running on localhost/https

## Performance Bottlenecks

**Audio encoding/decoding in main thread:**
- Problem: PCM16↔Float32 conversions and Base64 encoding happen in WebSocket handler
- Files: `app/hooks/useRealtimeVoice.ts:30-51, 111-230`
- Cause: Browser's Web Worker API not used; all processing blocks React updates during heavy audio
- Improvement path: Move audio codec operations to `AudioWorklet` or Web Worker

**Canvas rendering at 30fps with no frame skipping:**
- Problem: Starfield redraws even if user tabs away
- Files: `app/components/Starfield.tsx:46-54`
- Cause: `requestAnimationFrame` respects 30fps cap but doesn't check `document.hidden`
- Improvement path: Pause animation when tab is not visible using `document.visibilitychange` event

**Waveform visualizer updates on every message:**
- Problem: Canvas redraws at full rate without throttling
- Files: `app/components/VoiceInterface.tsx:38-76`
- Cause: No frame rate cap, tied to `requestAnimationFrame` only
- Improvement path: Add `document.hidden` check and target 30fps to match Starfield

**Status dashboard rows animate with setTimeout:**
- Problem: Each row triggers React re-render with state update
- Files: `app/components/CognitiveStatus.tsx:53-64`
- Cause: 150ms per row × 5 rows = unnecessary state churn
- Improvement path: Use CSS animations with staggered delays instead of JavaScript state

**Typewriter effect causes per-character React updates:**
- Problem: Each character triggers re-render
- Files: `app/hooks/useTypewriter.ts:26-35`
- Cause: `setDisplayedText` called for every character at 30ms intervals
- Improvement path: Consider batch updates or use `flushSync` for large text blocks

## Fragile Areas

**Audio context initialization in `useRealtimeVoice` is tightly coupled:**
- Files: `app/hooks/useRealtimeVoice.ts:232-311`
- Why fragile: 
  - Multiple stateful refs (wsRef, audioCtxRef, micStreamRef, processorRef, analyserRef)
  - Cleanup logic spread across `disconnect()`, error handler, and `onclose` handler
  - No shared cleanup utility
- Safe modification: 
  - Create higher-order hook `useAudioContext` to encapsulate initialization
  - Use `useEffect` with proper cleanup for each resource (WebSocket, streams, nodes)
  - Test disconnect after each state transition
- Test coverage: No unit tests for voice hook; only e2e tests via Playwright

**Terminal state machine lacks validation:**
- Files: `app/hooks/useTerminalState.ts:19-31`
- Why fragile: 
  - `transitionTo()` accepts any state without validation
  - No guard against invalid state transitions (e.g., VOICE_ACTIVE → BOOTING)
  - Metadata merges unconditionally, could create stale data
- Safe modification:
  - Add transition validation function
  - Create state machine graph to enforce valid transitions
  - Clear metadata on certain transitions (e.g., reset when disconnecting)
- Test coverage: No tests; relies on page.tsx logic

**Page component manages multiple state machines:**
- Files: `app/page.tsx:27-59`
- Why fragile:
  - Four separate useEffect hooks coordinating state transitions
  - Timer refs manually managed; unclear what cleans up what
  - Component becomes MENU state and stays there; no clean path back to BOOTING
- Safe modification:
  - Extract state machine logic to `useTerminalState` (move page effects there)
  - Simplify by centralizing timer cleanup
  - Add explicit reset handler for reconnection flows
- Test coverage: e2e Playwright tests exist but don't cover all state paths

**CommandInput component has hidden input with maxLength:**
- Files: `app/components/CommandInput.tsx:40`
- Why fragile:
  - Only command "1" is handled; numeric validation not explicit
  - maxLength=10 could cause silent truncation of future commands
  - input value not validated before onCommand callback
- Safe modification:
  - Add explicit command validation and enumeration
  - Remove or justify maxLength constraint
  - Validate and sanitize input before callback
- Test coverage: No unit tests; only integration tests

## Scaling Limits

**Single canvas for entire starfield:**
- Current capacity: 70 stars at 30fps on typical device
- Limit: Performance degrades with high star counts (>500) on lower-end devices
- Scaling path: Implement spatial partitioning or use OffscreenCanvas for parallel rendering

**Audio buffer accumulation:**
- Current capacity: Unbounded accumulation of audio chunks in `audioChunksRef`
- Limit: Long sessions (>1 hour) could accumulate large arrays
- Scaling path: Implement circular buffer or stream-based approach

**State metadata merging has no size limit:**
- Current capacity: Metadata object grows unbounded with each `transitionTo` call
- Limit: Long sessions could accumulate stale metadata
- Scaling path: Implement metadata reset logic or versioning

## Dependencies at Risk

**@anthropic-ai/sdk included but unused:**
- Risk: Listed in package.json but not imported anywhere in codebase
- Impact: Adds ~200KB to bundle; unnecessary dependency
- Migration plan: Remove from package.json and bun.lock if Anthropic integration not planned

**OpenAI SDK version tight coupling:**
- Risk: Realtime API is in beta; SDK changes may break integration
- Impact: Version bump could require code refactor
- Migration plan: Monitor OpenAI SDK changelog; consider feature detection for API responses

**Next.js 16 adoption:**
- Risk: Recent major version; potential breaking changes in minor updates
- Impact: Vercel deployments may force upgrades
- Migration plan: Regular testing against next versions via `npm outdated`

## Missing Critical Features

**No input error recovery:**
- Problem: If voice input fails once, user must manually reconnect
- Blocks: Seamless conversation continuation; poor UX on network hiccups

**No session persistence:**
- Problem: Voice conversation history not saved; page refresh loses chat
- Blocks: Creating persistent portfolio narrative or asynchronous interaction

**No offline mode:**
- Problem: All voice features require OpenAI API; no fallback
- Blocks: Local demo or testing without API keys

**No user feedback on microphone status:**
- Problem: User can't see if microphone is capturing audio before sending
- Blocks: Confidence that voice is working correctly

## Test Coverage Gaps

**useRealtimeVoice hook:**
- What's not tested: WebSocket event handling, audio codec conversions, error states, reconnection logic
- Files: `app/hooks/useRealtimeVoice.ts`
- Risk: Changes to audio pipeline or WebSocket handling could introduce silent failures
- Priority: High (core feature)

**useTypewriter hook:**
- What's not tested: Speed variations, text truncation, onComplete callback timing
- Files: `app/hooks/useTypewriter.ts`
- Risk: Animation timing regressions could go unnoticed
- Priority: Medium

**Terminal state machine:**
- What's not tested: Invalid state transitions, metadata accumulation, effect cleanup
- Files: `app/hooks/useTerminalState.ts`, `app/page.tsx`
- Risk: State corruption or memory leaks during long user sessions
- Priority: Medium (but fragile)

**API endpoint (session token):**
- What's not tested: Error handling, token expiry, rate limiting, concurrent requests
- Files: `app/api/realtime/session/route.ts`
- Risk: Could leak tokens or fail gracefully under load
- Priority: High (security-relevant)

**VoiceInterface component:**
- What's not tested: Waveform canvas rendering, button state transitions, error display
- Files: `app/components/VoiceInterface.tsx`
- Risk: Visual bugs or accessibility regressions
- Priority: Low (mostly UI)

---

*Concerns audit: 2026-04-09*
