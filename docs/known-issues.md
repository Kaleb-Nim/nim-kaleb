# Known issues and fragile areas

Salvaged from the GSD concerns audit (2026-07-27) and its debug logs. Each item is still true of the code as of the `pre-wayfinder` tag. When one is fixed, delete it here and close the issue that tracked it.

## Fragile: change with care

- **Barge-in teardown** (`ws-server/src/session.ts`, `app/hooks/useRealtimeVoice.ts`). Four steps must all happen: abort the LLM and TTS work, send `response.done {immediate: true}`, reset browser playback, and bump `playGenRef`. If any one fails, the visitor hears overlapping or garbled audio. Barge-in has no tests.
- **End-of-reply drain** (`useRealtimeVoice.ts`, the `response.done` handler). The server sends `response.done` once DashScope finishes synthesising, which can be seconds before the browser finishes playing the queued chunks. An earlier version closed the playback `AudioContext` straight away and cut replies off 3–10 s in. The fix waits for the last source's `onended` before teardown. Don't revert it to an immediate close or a fixed `setTimeout`.
- **TTS `server_commit` segments** (`ws-server/src/dashscope/tts.ts`). DashScope sends `response.done` after every auto-committed segment. Only the one that follows `session.finish` is final, which is what the `finishing` flag gates.
- **History eviction** removes user/assistant pairs. An unanswered turn can leave the pairs unbalanced.

## Security and cost

- `/ws` is **unauthenticated and not rate-limited**. Anyone can open sessions that spend DashScope credit. There are no per-IP caps, idle timeouts or chunk-size limits.
- `ws-server/src/index.ts` sends `Access-Control-Allow-Origin: *` on HTTP endpoints. The risk is low because `/health` is read-only.
- DashScope keys sit in the server's environment, and there is no rotation.

## Tech debt

- `bun run lint` fails with about 490 problems, mostly from vendored files and `ws-server/dist/`. The ignore list in `eslint.config.mjs` needs `ws-server/dist/**`.
- `ws-server/dist/index.js` (a minified build) is committed.
- The mic path uses the deprecated `createScriptProcessor`; `AudioWorklet` is the replacement. Downsampling from 48 kHz to 16 kHz is nearest-neighbour.
- The browser sends `audio.end`, but the server only logs it, so end of speech relies on server VAD alone.
- The `openai` SDK is used only as a DashScope-compatible client, so an SDK update could break the LLM stage silently.
- There's no CI pipeline. Deploys are manual.

## Test gaps

Nothing tests WebSocket message validation, DashScope failure paths (timeouts, mid-stream drops, 5xx), mobile AudioContext behaviour (iOS Safari resume, interruptions) or the analytics 503 path.

## Resolved, kept as lessons

- **ws-server crashed on start on macOS** because `LOG_DIR` defaulted to `/var/log/kaleb-voice`. The default is now `~/.local/share/kaleb-voice/logs/`. Keep defaults writable without root.
