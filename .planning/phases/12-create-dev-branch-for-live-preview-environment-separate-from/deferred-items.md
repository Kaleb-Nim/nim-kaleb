# Deferred Items — Phase 12

Out-of-scope discoveries surfaced during Phase 12 execution. Tracked for follow-up plans;
NOT fixed in this phase per executor scope-boundary rules.

## D-1: OpenAI Realtime Beta API deprecated

- **Surfaced by:** Task 3 smoke test (POST `/api/realtime/session`)
- **Status:** Pre-existing, also affects production
- **Symptom:** Endpoint returns `400`, body:
  `{"error":{"message":"The Realtime Beta API is no longer supported. Please use /v1/realtime for the GA API.","type":"invalid_request_error","code":"beta_api_shape_disabled"}}`
- **Root cause:** `app/api/realtime/session/route.ts` calls `https://api.openai.com/v1/realtime/sessions`
  with the deprecated Beta request shape (`{ model, voice }`). OpenAI moved to GA at `/v1/realtime`
  with a new payload shape.
- **Impact on Phase 12:** None. The Beta deprecation affects production identically. The 400
  response (not 500) PROVES `OPENAI_API_KEY` is wired into Vercel Preview scope — which is
  the actual phase requirement (DEV-03).
- **Recommended next step:** New plan to migrate `/api/realtime/session` to the GA `/v1/realtime`
  shape, plus client-side updates in `app/hooks/useRealtimeVoice.ts` to match the new GA token
  exchange flow.

## D-2: DASHSCOPE_* keys present in Vercel Preview scope

- **Surfaced by:** Task 2 `bunx vercel env ls preview`
- **Status:** Pre-existing (created 28 days ago)
- **Symptom:** `DASHSCOPE_API_KEY` and `DASHSCOPE_VOICE_ID` are scoped to `Preview` in Vercel,
  contrary to README's Vercel-vs-ECS env split which states DashScope keys belong only on ECS.
- **Impact on Phase 12:** None — these keys are not read by any code path in `app/` (verified
  via `grep -rn "process.env\." app/`). They are inert in the Vercel runtime.
- **Recommended next step:** Audit and remove `DASHSCOPE_*` from all Vercel env scopes (Production,
  Preview) in a small follow-up plan, leaving them only on ECS.
