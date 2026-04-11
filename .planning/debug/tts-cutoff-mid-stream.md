---
status: awaiting_human_verify
trigger: "TTS audio stops playing mid-response (3-10 seconds in) even without user interruption. Audio stops and then response.done fires prematurely."
created: 2026-04-10T00:00:00Z
updated: 2026-04-10T00:00:00Z
---

## Current Focus

hypothesis: The `response.done` cutoff is caused by a barge-in path sending response.done to browser BEFORE the new TTS session is ready, which hits the browser-side handler that closes and recreates the playback AudioContext, killing all already-scheduled audio. The second root cause is that `cancelCurrentResponse()` does NOT send response.done — only `startResponse()` does — but the browser's response.done handler destroys ALL scheduled audio (close+recreate playbackCtx), so if response.done fires even slightly early the queued chunks are destroyed.
test: Trace the exact ordering in startResponse() — cancelCurrentResponse() is called first (closes old TTS WS), then response.done is sent to browser, then new TTS session is created. The browser receives response.done and nukes playbackCtx. Any audio chunks already scheduled before that response.done are destroyed. But those came from the PREVIOUS response — so this should be OK. However: on fresh greeting, there is no barge-in, so response.done is not sent... unless the greeting itself gets barged in while still playing.
expecting: Root cause confirmed or disconfirmed by examining timing and ordering of message sends vs audio scheduling
next_action: CONFIRMED — root cause is in browser response.done handler: it closes and recreates the AudioContext unconditionally, which destroys ALL scheduled future audio including chunks that haven't played yet. For a multi-sentence response with many pre-scheduled chunks, if response.done fires even 1ms before the last scheduled chunk plays, all those chunks are silently dropped.

## Symptoms

expected: TTS should play the full AI response to completion
actual: Audio stops after 3-10 seconds (varies), then response.done fires to the browser, cutting off playback
errors: No explicit errors — it appears as a normal response.done, just too early
reproduction: Ask any question that produces a multi-sentence response. TTS plays the first segment then stops.
timeline: Ongoing issue. Recent fix attempted (TtsHandle.finishing flag) but may not fully resolve it.

## Eliminated

- hypothesis: dist/index.js doesn't have the finishing flag fix
  evidence: grep of dist/index.js shows finishing flag logic at lines 6069, 6104-6105, 6136 — fix is deployed
  timestamp: 2026-04-10

- hypothesis: There's an unguarded code path sending response.done from tts.ts without checking finishing
  evidence: tts.ts line 91-96 in source (and dist line 6103-6105) correctly gates on handle.finishing
  timestamp: 2026-04-10

## Evidence

- timestamp: 2026-04-10
  checked: ws-server/dist/index.js for all response.done sends
  found: Two places send response.done to browser: (1) dist line 6178 — in startResponse(), on barge-in only (!isGreeting branch); (2) dist line 6195 — onDone callback from createTtsSession(), only fires when handle.finishing === true
  implication: Server-side logic is correct. response.done only fires from onDone (after finishing=true) or from barge-in. No accidental early fires from server side.

- timestamp: 2026-04-10
  checked: app/hooks/useRealtimeVoice.ts lines 189-200 — browser response.done handler
  found: On response.done, the browser: (1) sets phase to 'listening', (2) clears responseText, (3) CLOSES playbackCtxRef.current and RECREATES it as new AudioContext, (4) resets nextPlayTimeRef to 0. This destroys ALL pending audio buffer sources.
  implication: If response.done arrives while audio chunks are still scheduled but not yet played (i.e., there is buffered-ahead audio in the queue), all of that audio is silently dropped. The AudioBufferSourceNodes connected to the old closed context will never fire.

- timestamp: 2026-04-10
  checked: scheduleAudioChunk() and the relationship between chunk arrival time and playback time
  found: Chunks are scheduled into the future using nextPlayTimeRef. For a long response, hundreds of chunks may be pre-scheduled seconds into the future. The playback context dutifully plays them in sequence. BUT: if response.done arrives from the server before ALL chunks have physically played through the speaker, closing the context kills all future-scheduled sources instantly.
  implication: This is the root cause. The `finishing` flag fix correctly prevents intermediate response.done events from firing, but when the FINAL response.done fires (after session.finish), there may still be audio chunks in the playback queue that haven't played yet. The browser receives response.done and destroys the playback context, cutting off the tail end of the audio.

- timestamp: 2026-04-10
  checked: timing of server-side events — when does finishTtsSession() get called vs when does onDone fire?
  found: finishTtsSession() is called by LLM's onDone callback — immediately when the LAST text token is sent to TTS. Then TTS synthesizes that last chunk, sends it as response.audio.delta, then sends response.done. The server receives TTS response.done and immediately forwards it to browser. But the browser may not have finished playing all the audio chunks by then.
  implication: The server sends response.done as soon as DashScope finishes synthesizing. DashScope doesn't know/wait for the browser to finish playing. There is a latency gap: chunks are in-flight over WebSocket, being decoded, being scheduled in AudioContext — all of this takes time. response.done races against the audio playback queue.

## Resolution

root_cause: The browser's `response.done` handler in `useRealtimeVoice.ts` (lines 193-198) immediately closes and recreates the `playbackCtxRef`, which destroys all AudioBufferSourceNodes that were scheduled but not yet played. Since the server sends `response.done` as soon as DashScope acknowledges synthesis completion — not after actual audio playback — there is a timing gap where pre-scheduled audio chunks are destroyed before playing.

fix: In the browser response.done handler, instead of immediately closing the playback context, drain the remaining audio first. Calculate how much audio is still scheduled (nextPlayTimeRef.current - playbackCtx.currentTime) and delay the context teardown until that time passes. Use setTimeout to close/recreate the context only after the last scheduled audio chunk has finished playing.
verification: empty
files_changed: [app/hooks/useRealtimeVoice.ts]
