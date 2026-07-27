# Codebase Concerns

**Analysis Date:** 2026-07-27

## Tech Debt

**ESLint Configuration Ignores Gap:**
- Issue: `bun run lint` exits with code 1, reporting ~492 problems, but most are false positives from vendored/research files
- Files: `eslint.config.mjs` (missing ignores), `.planning/research/portfolio_info/**` (minified files), `ws-server/dist/index.js` (committed build output)
- Impact: Continuous integration fails even when codebase is clean. Developers cannot trust lint output. Makes it impossible to enforce real linting rules.
- Fix approach: Add global ignores to `eslint.config.mjs`:
  ```javascript
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".planning/research/**",  // Add this
    "ws-server/dist/**",       // Add this
  ]),
  ```

**Committed Build Artifacts:**
- Issue: `ws-server/dist/index.js` (235KB minified) is committed to git repository
- Files: `ws-server/dist/index.js`
- Impact: Inflates repository size, makes diffs harder to review, violates CI/CD best practice (build outputs should be generated, not versioned)
- Fix approach: Add `ws-server/dist/` to `.gitignore` and regenerate via `bun run build` in CI/ECS deployment pipeline

**Stale Architecture Diagram:**
- Issue: `.planning/diagrams/openai-realtime-architecture.mmd` describes the removed OpenAI Realtime API design from March 2026, but system now uses Alibaba DashScope
- Files: `.planning/diagrams/openai-realtime-architecture.mmd`
- Impact: Misleads new team members about system architecture. Token-minting endpoint (`/api/realtime/session`) mentioned in diagram was deleted; no longer relevant.
- Fix approach: Either delete diagram or update to show current DashScope three-service architecture (ASR → LLM → TTS via WebSocket)

## Security Considerations

**Unauthenticated Public WebSocket with Cost Exposure:**
- Risk: `ws-server` on `wss://ws.kalebnim.dev/ws` has zero authentication and zero rate limiting. Any browser can open unlimited WebSocket connections and trigger ASR/LLM/TTS calls on Alibaba DashScope, incurring per-token costs. No protection against automated abuse (bots, scraping, cost attacks).
- Files: `ws-server/src/index.ts` (WebSocket upgrade handler has no auth check), `ws-server/src/session.ts` (no rate limiting per session)
- Current mitigation: Relies on trust (public portfolio, assumes no malicious actors). ECS service runs behind ALB, but no WAF rules.
- Recommendations:
  1. **Implement rate limiting** per IP/session (e.g., max 5 concurrent sessions per IP, max 100 LLM tokens per minute per session)
  2. **Add optional authentication** (JWT, API key prefix in URL) for production variant if traffic grows
  3. **Cost monitoring** - Set up DashScope quota alerts; consider implementing token budget per session or daily spend limits
  4. **Connection throttling** - Close idle WebSocket connections after 5 minutes
  5. **Request validation** - Validate audio chunk sizes and transcript lengths to prevent memory exhaustion attacks

**Permissive CORS Configuration:**
- Risk: `ws-server` sends `Access-Control-Allow-Origin: *` and `Access-Control-Allow-Headers: *` on all HTTP endpoints. While WebSocket upgrade itself doesn't strictly require CORS headers, this opens the health check endpoint to any origin.
- Files: `ws-server/src/index.ts` (lines 17-26)
- Current mitigation: Health check endpoint is read-only, low risk
- Recommendations: Restrict to known origins if deploying behind API gateway; at minimum, remove wildcard headers:
  ```typescript
  'Access-Control-Allow-Origin': 'https://nim-kaleb.vercel.app',
  'Access-Control-Allow-Headers': 'Content-Type',
  ```

**Conversation History Stored Per-Session in Memory:**
- Risk: Conversation history is retained in `Session.conversationHistory` (capped at 20 entries via `MAX_HISTORY_ENTRIES = 20`). If multiple concurrent sessions run, memory usage scales with active sessions. No garbage collection for idle sessions.
- Files: `ws-server/src/session.ts` (lines 25, 85-89, 155-159)
- Current mitigation: History is cleared on session cleanup. Sessions are closed when browser disconnects.
- Recommendations:
  1. Add idle session timeout (close WebSocket after 5 minutes with no activity)
  2. Monitor WebSocket connection count and memory usage in ECS CloudWatch
  3. Consider persisting history to PostgreSQL if you want to add conversation replay feature

**API Key in Environment Variables Without Secrets Rotation:**
- Risk: `DASHSCOPE_API_KEY` and `DASHSCOPE_VOICE_ID` are passed via ECS task environment variables. No key rotation mechanism. If key is exposed, requires manual update and redeployment.
- Files: `ws-server/src/dashscope/asr.ts` (line 22), `ws-server/src/dashscope/llm.ts` (line 10), `ws-server/src/dashscope/tts.ts` (lines 37-38)
- Current mitigation: Keys are server-side only (never sent to browser). AWS Secrets Manager could be used for storage.
- Recommendations:
  1. Store `DASHSCOPE_API_KEY` in AWS Secrets Manager instead of ECS task environment variables
  2. Add automatic key rotation policy (e.g., rotate every 90 days)
  3. Audit DashScope API logs for unauthorized usage

## Performance Bottlenecks

**Audio Downsampling Using Simple Nearest-Neighbor:**
- Problem: Browser microphone audio (typically 48kHz) is downsampled to 16kHz using simple nearest-neighbor sampling, not linear interpolation or better filters
- Files: `app/hooks/useRealtimeVoice.ts` (lines 60-69)
- Cause: Fast but lossy; may introduce aliasing artifacts or clicks between 48→16kHz boundary
- Improvement path: Replace with windowed sinc or polyphase filter (more CPU cost, better quality). For now, acceptable for speech recognition, but not ideal for audio archive/playback.

**ScriptProcessorNode Deprecated (Browser Audio API):**
- Problem: `useRealtimeVoice.ts` (line 346) uses deprecated `createScriptProcessor`. Modern Web Audio API recommends `AudioWorklet` for real-time audio processing, but Chromium still supports ScriptProcessor for compatibility.
- Files: `app/hooks/useRealtimeVoice.ts` (line 346)
- Cause: Lower priority than other tasks; ScriptProcessor is synchronous and blocks during processing
- Improvement path: Migrate to `AudioWorklet` (requires more complex setup but runs in separate thread, prevents main-thread blocking). Not urgent for MVP.

**System Prompt Loaded Synchronously from Filesystem:**
- Problem: `ws-server/src/dashscope/llm.ts` uses `readFileSync()` to load system prompt at module initialization. If file is large or filesystem slow, blocks server startup.
- Files: `ws-server/src/dashscope/llm.ts` (lines 15-18)
- Cause: Simpler code, avoids async init complexity
- Improvement path: Cache prompt in memory at startup (current approach is acceptable). If system prompt changes frequently, consider loading from database or environment variable instead.

**Fire-and-Forget Analytics Logging:**
- Problem: `useRealtimeVoice.ts` (lines 72-78) and `ws-server/src/logger.ts` (lines 23-30) use fire-and-forget Promise patterns for analytics POST and file I/O. If network or filesystem fails, errors are silently swallowed.
- Files: `app/hooks/useRealtimeVoice.ts` (line 72-78), `ws-server/src/logger.ts` (line 24-30)
- Cause: Prevents logging from blocking real-time voice pipeline
- Improvement path: Add retry logic and logging to error handler; monitor failed analytics in CloudWatch metrics

## Fragile Areas

**Barge-In (User Interruption) State Machine:**
- Files: `ws-server/src/session.ts` (lines 38-48, 65-69, 224-228), `app/hooks/useRealtimeVoice.ts` (lines 241-291)
- Why fragile: Barge-in logic coordinates:
  1. Server cancels in-flight LLM+TTS response via `AbortController.abort()`
  2. Stops TTS output immediately via `response.done` with `immediate: true`
  3. Browser clears audio context and resets playback timing
  4. Browser invalidates stale audio deltas via `playGenRef.current++`
  - If any of these steps fails (e.g., abort doesn't propagate, TTS WebSocket doesn't close, audio context doesn't reset), the user hears overlapped audio or garbled output
  - Multiple concurrent responses could interleave if cancellation doesn't work
- Safe modification: Add comprehensive tests for barge-in scenarios; verify abort signal propagates through entire LLM streaming chain; ensure TTS `finishTtsSession()` is called before response abort

**Audio Scheduling and Context Switching:**
- Files: `app/hooks/useRealtimeVoice.ts` (lines 145-163, 241-291)
- Why fragile: Audio playback uses two separate `AudioContext` instances (one for mic capture at 16kHz, one for playback at 24kHz). On `response.done`, contexts are closed and recreated. If timing is off or `nextPlayTimeRef` is not correctly updated, audio glitches or silence occurs.
  - Comments reference "BUG-01 fix" and "BUG-02 fix" (lines 267-268), suggesting previous issues with playback timing
  - `lastSourceRef.onended` callback may not fire reliably on all browsers
- Safe modification: Add audiocontext state machine tests; mock Web Audio API in tests to verify start times and context closures; log all context transitions for debugging

**TTS Server-Commit Mode Segment Handling:**
- Files: `ws-server/src/dashscope/tts.ts` (lines 86-97)
- Why fragile: In `server_commit` mode, DashScope sends `response.done` after each auto-committed segment (not just at the end). Callback only fires "truly done" after `session.finish()` is sent (see line 94). If timing is wrong or callback logic inverted, playback cuts short prematurely.
- Safe modification: Add detailed logging of all TTS message types received; test with real DashScope to verify `response.done` semantics; consider moving to `client_commit` mode if more control is needed

**Conversation History Management:**
- Files: `ws-server/src/session.ts` (lines 85-89, 155-159)
- Why fragile: History is truncated by removing pairs of entries (user + assistant) when exceeding `MAX_HISTORY_ENTRIES = 20`. If a turn is incomplete (e.g., assistant response never arrives), removing from history could lose important context. No safeguards against malformed messages.
- Safe modification: Add validation that user and assistant turns are always balanced before truncating; log warnings if history becomes corrupted

## Test Coverage Gaps

**WebSocket Message Protocol Validation:**
- What's not tested: Browser-to-server message validation (`audio.append`, `audio.end`, `session.start`), server-to-browser message ordering and completeness
- Files: `ws-server/src/types.ts` (validation logic), `ws-server/src/index.ts` (message dispatch)
- Risk: Malformed messages could crash session or leak state
- Priority: High

**DashScope Connection Failure Scenarios:**
- What's not tested: ASR/LLM/TTS connection timeouts, mid-stream disconnections, partial message corruption, DashScope API 5xx errors
- Files: `ws-server/src/dashscope/asr.ts`, `ws-server/src/dashscope/llm.ts`, `ws-server/src/dashscope/tts.ts`
- Risk: Sessions may hang, leak WebSocket connections, or send incomplete responses to browser
- Priority: High

**Audio Context Lifecycle on Mobile:**
- What's not tested: iOS Safari and Android Chrome behavior with separate 16kHz mic + 24kHz playback contexts; `context.resume()` on user gesture; context suspension during audio playback interruption (e.g., incoming call)
- Files: `app/hooks/useRealtimeVoice.ts` (lines 327-335)
- Risk: Audio may not work on mobile or may break mid-conversation
- Priority: Medium (only blocks if shipping mobile app; website usage is desktop-first)

**Analytics Endpoint Rate Limiting:**
- What's not tested: Rapid POST requests to `/api/analytics/session` and `/api/analytics/transcript` (e.g., 100 requests/sec); database insertion failures; duplicate session IDs
- Files: `app/api/analytics/session/route.ts`, `app/api/analytics/transcript/route.ts`
- Risk: Database could be overwhelmed; transactions could fail silently; analytics data could be incomplete
- Priority: Medium

**Graceful Degradation When Analytics Disabled:**
- What's not tested: Behavior when `DATABASE_URL` is unset (analytics disabled); POST endpoints should return 503, but browser may retry or log confusing errors
- Files: `app/api/analytics/session/route.ts`, `app/api/analytics/transcript/route.ts`, `app/hooks/useRealtimeVoice.ts`
- Risk: Error messages may confuse users; analytics may silently fail on production if database connection is lost
- Priority: Low (handled gracefully with 503 responses, but no explicit tests)

## Known Bugs

**Missing End-of-Speech Signaling Implementation:**
- Symptoms: `audio.end` message from browser is received by server but not processed
- Files: `ws-server/src/index.ts` (line 87-89, stub comment says "Plan 02 will handle this fully")
- Trigger: User manually ends speech before server VAD timeout, or ASR needs explicit EOF marker
- Workaround: Relies entirely on server-side VAD (Voice Activity Detection) with 1000ms silence threshold; manual end-of-speech not yet functional

**BUG-01 and BUG-02 Fixes in Audio Scheduling:**
- Symptoms: Previous audio playback glitches/silence; incorrect timing on barge-in
- Files: `app/hooks/useRealtimeVoice.ts` (lines 267-268, comments reference fixes)
- Trigger: Specific sequence of rapid user interruptions
- Current status: Fixed but fragile (see "Fragile Areas" above)

## Scaling Limits

**WebSocket Connection Per-Server Limit:**
- Current capacity: ~1000 concurrent connections per ECS instance (depends on memory and CPU; rough estimate based on 2 `AudioContext` per session + conversation history)
- Limit: At 2GB memory (typical ECS task), approximately 500-1000 sessions before OOM
- Scaling path: Deploy multiple ws-server instances behind load balancer; use sticky sessions to route same browser to same server (for session affinity); consider sharded session store (Redis) if needed to handle 10k+ concurrent users

**DashScope API Rate Limits:**
- Current capacity: Alibaba Cloud DashScope has per-user rate limits (not documented in code; assumed 100+ req/sec for qwen-plus LLM)
- Limit: If traffic spikes beyond account limits, all new LLM calls fail with 429/503 errors
- Scaling path: Contact Alibaba sales to increase quota; implement client-side queuing for LLM requests; consider caching common responses

**PostgreSQL Database Connections:**
- Current capacity: Neon serverless has connection pool limits (depends on plan; free tier ~20 concurrent)
- Limit: Analytics endpoints will timeout or fail if connection pool exhausted
- Scaling path: Upgrade Neon plan for more connections; batch analytics writes; consider async event queue (e.g., Kafka) if analytics throughput grows

**Browser Audio Context CPU Usage:**
- Current capacity: Separate 16kHz mic capture + 24kHz playback contexts on a single browser tab
- Limit: On low-end devices (old mobile, Chromebook), multiple tabs with active voice may max out CPU
- Scaling path: Recommend single-tab usage; optimize ScriptProcessor to AudioWorklet (see Performance section)

## Missing Critical Features

**No Input Validation on Audio Chunks:**
- Problem: Browser sends base64-encoded audio via WebSocket, but server doesn't validate chunk size, format, or frequency. A malicious client could send gigabytes of invalid data.
- Blocks: Abuse protection; scalability to public deployment
- Recommended fix: Add max chunk size check (e.g., 16KB per audio.append)

**No Session Persistence Across Reconnects:**
- Problem: If browser loses connection and reconnects, a new session is created; conversation history is lost
- Blocks: Improving UX on spotty connections (mobile, WiFi)
- Recommended fix: Store session ID in browser localStorage; on reconnect, resume existing session instead of creating new one

**No Conversation Replay / History Viewing:**
- Problem: Past conversations are logged to PostgreSQL but not exposed via UI or API
- Blocks: Analytics dashboard, user ability to review past interactions
- Recommended fix: Add `/api/analytics/sessions/{id}` endpoint to fetch session and transcript history

**No Manual Session Timeout / Keepalive Ping:**
- Problem: Long idle sessions may be disconnected by ALB/firewall; no heartbeat to keep WebSocket alive
- Blocks: Long-form conversations (users having sustained chats)
- Recommended fix: Browser sends `{ type: 'ping' }` every 30 seconds; server responds with `{ type: 'pong' }`

## Dependencies at Risk

**OpenAI SDK Used for DashScope, Not OpenAI:**
- Risk: `openai` package (v6.32.0) is installed and used ONLY for DashScope compatibility mode (line 10 of `ws-server/src/dashscope/llm.ts`). If OpenAI SDK updates break DashScope compatibility or introduces new required fields, could cause silent API failures.
- Impact: LLM responses may stop working after `npm update`
- Migration plan: Consider forking a minimal OpenAI-compatible client or using a generic HTTP client (e.g., `fetch`) to reduce coupling

**No Pinned Versions in Bun Workspaces:**
- Risk: `package.json` uses caret ranges (`^6.32.0`, `^1.1.0`), allowing minor/patch updates. Bun lockfile (`bun.lock`) locks versions, but if lockfile is deleted or updated carelessly, could introduce breaking changes.
- Impact: CI/CD may break silently if lockfile is regenerated
- Migration plan: Use exact versions (`6.32.0` not `^6.32.0`) for critical dependencies (openai, drizzle-orm, next); accept ranges only for dev tools

**Deprecated Web Audio API (ScriptProcessorNode):**
- Risk: `createScriptProcessor()` is deprecated in Web Audio API spec. Browsers may remove support (though unlikely in near term).
- Impact: Microphone input processing will break on future browser versions
- Migration plan: Migrate to `AudioWorklet` before deprecation (see Performance section)

---

*Concerns audit: 2026-07-27*
