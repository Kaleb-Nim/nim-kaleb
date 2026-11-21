# Voice upgrade options

Research for [#12](https://github.com/Kaleb-Nim/nim-kaleb/issues/12) (child of #5). Researched 2026-11-21. Prices and model names change often, so re-check the linked pages before you build.

**Question:** What's the lowest-effort way to get a voice clone that sounds better and responds faster, without re-recording? Option (a) is Fish Audio as the TTS in the existing STT → LLM → TTS cascade. Option (b) is a speech-to-speech (realtime) model that supports cloned voices.

**Answer:** Replace `ws-server/src/dashscope/tts.ts` with Fish Audio **S2.1 Pro** (hosted) behind a provider flag, and keep ASR, `qwen-plus` and `prompts/system-prompt.md` as they are. Clone the voice from the existing ~2 min of reference audio. Separately, lower the ASR VAD silence window, which is currently 1000 ms. Effort: about 1–1.5 days. Qwen3.8-Omni-Flash-Realtime with a cloned voice is the best speech-to-speech follow-up for latency. Treat it as a second spike, not the first move.

---

## 1. The audio that exists (nothing was moved or deleted)

Durations come from `afinfo`.

| File | Duration | Notes |
|---|---|---|
| `assets/reference-audio/kaleb-reference.wav` (main checkout) | 21.5 s | Has `kaleb-transcript.txt`. It is gitignored, so worktrees don't get it. Also present: `kaleb-raw.wav`, `kaleb-reference-padded.wav` |
| `assets/reference-audio/samples/kaleb-intro.wav` | 6.8 s | |
| `~/Documents/GitHub/fish-speech/references/owner/sample.wav` | 21.5 s | Same length as `kaleb-reference.wav`, so it is very likely the same clip. Has `sample.lab` |
| `~/Documents/GitHub/voice-assistant/recordings/training_1_raw.wav` (+ `.m4a`) | 36.8 s | |
| `~/Documents/GitHub/voice-assistant/recordings/training_2_raw.wav` (+ `.m4a`) | 46.8 s | A copy of the `.m4a` is also in `Qwen3-TTS/finetuning/recordings/` |
| `~/Documents/GitHub/voice-assistant/voice_prompts/training_{1,2}_prepared.wav` | 34.1 s / 43.7 s | Cleaned versions of the two above |
| `~/Documents/GitHub/Qwen3-TTS/finetuning/data_v3/clips/clip_01_000{1..4}.wav` | 9.98 + 7.94 + 7.08 + 14.44 = 39.4 s | Plus `data_v3/ref.wav` (7.1 s) |

**The "~15 min of training audio" was not found.** `Qwen3-TTS/finetuning/data_v3/train_raw_all.jsonl` lists **101 clips** with 1,890 transcribed words, which is roughly **12–13 min** of speech at a conversational pace. That is probably the set Kaleb remembers. The clips point to `./data/clips/` (5) and `./data/batch2/clips/` (92), and `finetuning/data/` no longer exists. Only the 4 clips in `data_v3/clips/` remain. These searches turned up nothing:

- `mdfind` for the clip names
- `find` for any `batch2` directory under `~` (depth 6)
- `~/Documents`, `~/Downloads`, `~/Desktop` and `~/.Trash`

The W&B run in `finetuning/wandb/latest-run` logged 152 steps over 3 epochs. At batch size 2, that matches training on all ~101 clips (March 2026). The fine-tuned weights are also gone. Each `output_v3/checkpoint-epoch-*` folder holds only `speech_tokenizer/model.safetensors` (682 MB, the stock tokenizer) and config files, with no fine-tuned talker weights. The only surviving outputs of that fine-tune are `Qwen3-TTS/example_output/finetuned_test_{1,2}.wav` (75.4 s and 14.1 s), which are useful for listening comparisons.

**Usable now:** about **2.4 min** of distinct clean speech (21.5 + 36.8 + 46.8 + 39.4 s), all with transcripts or easy to transcribe.

**Would 12–15 min change the answer?** No. Every hosted option below clones zero-shot from 10 s to 2 min of audio. The paths that actually train on more data need more than 15 min, or a self-hosted GPU:

- ElevenLabs PVC needs ≥30 min.
- Cartesia PVC is a paid training step.
- Fish S2 Pro and Qwen3-TTS fine-tuning both need a self-hosted GPU.

## 2. Today's baseline (for comparison)

- ASR: `qwen3-asr-flash-realtime`, server VAD `silence_duration_ms: 1000` (`ws-server/src/dashscope/asr.ts:50`). The 1000 ms silence window is added to every turn before the LLM starts. The repo's own target is <800 ms total (`.planning/research/FEATURES.md:84`).
- LLM: `qwen-plus`, streaming, with `prompts/system-prompt.md` as the system message (`ws-server/src/dashscope/llm.ts:15-49`).
- TTS: `qwen3-tts-vc-realtime-2026-01-15`, `server_commit` mode, 24 kHz PCM, cloned voice ID from env (`ws-server/src/dashscope/tts.ts`).
- Prices (Singapore/intl):
  - ASR: $0.00009/s ([Model Studio pricing](https://www.alibabacloud.com/help/en/model-studio/model-pricing))
  - `qwen-plus`: $0.4 / $1.2 per 1M input/output tokens (same page)
  - `qwen3-tts-vc-realtime`: $0.13 per 10k characters ([pricing](https://www.alibabacloud.com/help/en/model-studio/model-pricing))

**Cost model used throughout:** one conversation-minute has ~30 s of user speech, ~30 s of assistant speech (~75 words ≈ 450 characters), ~4 turns, and a ~4k-token system prompt re-sent on each turn. On that model the baseline costs about **$0.018/min**: ASR ≈ $0.005, LLM ≈ $0.007, TTS ≈ $0.006.

## 3. Option (a): Fish Audio as the TTS in the cascade

### Hosted API

- **Models:**
  - `s2.1-pro` is the current production model, at $15 per 1M UTF-8 bytes.
  - `s2-pro` costs the same.
  - `s2.1-pro-free` costs $0 under a Fair Use Policy, with no SLA.
  - `s1` (OpenAudio S1) is **deprecated and retires 2026-12-31**. After that date it is served as `s2.1-pro`. Don't build on S1.

  ([Fish pricing](https://docs.fish.audio/developer-platform/models-pricing/pricing-and-rate-limits))
- **Concurrency:** 5 concurrent requests on the Starter tier (<$100 paid) and 15 at ≥$100. ASR requests count toward the same limit (same page). Five is enough for a portfolio.
- **Latency:**
  - The `s2.1-pro-free` launch post claims "~70ms TTFA at single request" and "~90ms TTFA on the standard API" ([blog](https://fish.audio/blog/s2-1-pro-free-api/)).
  - The docs put `balanced` latency mode at ~300 ms and `normal` at ~500 ms ([real-time streaming guide](https://docs.fish.audio/developer-guide/best-practices/real-time-streaming)).
  - These are vendor figures and don't include the network hop from ECS. Measure them before you commit.
- **Cloning:** an instant clone takes a clean 10–30 s sample plus an exact transcript. A persistent voice model (`/model`, `train_mode: "fast"`) accepts several clips, and the docs say more clips "capture more range" ([voice cloning](https://docs.fish.audio/features/voice-cloning), [instant cloning cookbook](https://docs.fish.audio/developer-guide/sdk-guide/cookbook/instant-voice-cloning)). That suits the ~2.4 min of clips we have: pass `kaleb-reference.wav`, both training recordings and the `data_v3` clips as separate references. Hosted Fish has no fine-tuning tier, so more audio only helps up to the reference-set limit.
- **Protocol:**
  - Endpoint: `wss://api.fish.audio/v1/tts/live`, with a Bearer token and a `model` header. Messages are MessagePack.
  - Events: `start` (with `reference_id`, `format: "pcm"`, `sample_rate`, `latency`), repeated `text`, `flush`, and `stop`. The server sends `audio` and `finish` ([WebSocket TTS](https://docs.fish.audio/api-reference/endpoint/websocket/tts-live)).
  - This is the same shape as today's DashScope TTS: `session.update` → `input_text_buffer.append` → `session.finish`.
  - Caveat: the default sample rate is 44.1 kHz. The docs don't list allowed values, so either confirm that `sample_rate: 24000` is accepted, or resample in ws-server, or change the browser `PLAYBACK_SAMPLE_RATE`.
- **Cost:** 450 bytes/min × $15/M ≈ **$0.007/min** for TTS, which is about the same as today. Total is ≈ $0.019/min, or ≈ $0.012/min on `s2.1-pro-free`.
- **Integration effort:** low.
  - Write a new `ws-server/src/fish/tts.ts` that exports the same `createTtsSession` / `appendTextToTts` / `finishTtsSession` interface.
  - Add `@msgpack/msgpack` with `bun add`.
  - Add a `TTS_PROVIDER` env switch and a `FISH_API_KEY` / `FISH_VOICE_ID` pair.
  - Make a one-off script that creates the voice model from the clips.
  - `session.ts` barely changes: send `flush` at sentence boundaries, and close the socket on barge-in.
- **Knowledge source:** unchanged. `qwen-plus` still reads `prompts/system-prompt.md`.

### Self-hosted (local `~/Documents/GitHub/fish-speech`)

- The open-weights model is **S2 Pro**: 5B parameters (4B slow AR + 400M fast AR). Fish quotes RTF 0.195 and ~100 ms TTFA on **one H200** using its SGLang engine. Fine-tuning code is included ([HF card](https://huggingface.co/fishaudio/s2-pro), [tech report](https://arxiv.org/abs/2603.08823)). S2.1 Pro weights are not open (blog above).
- License: Fish Audio Research License. Non-commercial use is free, and commercial use needs a separate licence ([HF card](https://huggingface.co/fishaudio/s2-pro)).
- The local clone already has MPS fixes and a zero-shot reference wired up (`fish-speech/.planning/phases/01-mps-fixes-zero-shot-baseline/01-SUMMARY.md`). That makes the M4 Max a good place to A/B clone quality and try fine-tuning offline. Apple Silicon will not reach the H200 latency numbers, though, and the ECS ws-server has no GPU.
- **Verdict:** not low-effort. Serving it live means renting a datacenter GPU (always on, or with cold starts), and that costs far more than $0.007/min at portfolio traffic. Use it only as a local quality experiment.

## 4. Option (b): speech-to-speech / realtime models with cloned voices

| Option | Clone input | More audio helps? | Latency (vendor) | Cost / conv-min (est.) | Effort vs `ws-server/` | Knowledge single-sourced? |
|---|---|---|---|---|---|---|
| **Alibaba Qwen3.8-Omni-Flash-Realtime** (+ `qwen-voice-enrollment`) | 10–20 s recommended, 60 s max, ≥24 kHz mono ([guide](https://www.alibabacloud.com/help/en/model-studio/qwen-omni-voice-cloning-user-guide)) | No. Zero-shot only, one clip per voice | No figure published | Audio in $0.93/M, out $1.87/M, text in $0.23/M ([model page](https://www.alibabacloud.com/help/en/model-studio/qwen3-8-omni-flash-realtime)). ≈ **$0.01/min** if Omni audio is ~25 tokens/s (assumption; not confirmed on the page). Enrollment costs $0.01/voice | Medium. Same DashScope key and region. Replace the ASR+LLM+TTS hops in `session.ts` with one realtime socket (`session.update` with `instructions`, `voice`, `turn_detection: semantic_vad_ec`) ([client events](https://www.alibabacloud.com/help/en/model-studio/client-events)). ~2–3 days | Yes. `instructions` = contents of `system-prompt.md`. But the reasoning is now Omni-Flash, not `qwen-plus`, and audio history is capped at 100 turns / 600 s |
| **OpenAI `gpt-realtime-2.1-mini`** custom voice | 10–60 s sample plus a **consent recording** reading a fixed phrase ([custom voices](https://developers.openai.com/api/docs/guides/custom-voices)) | No | No figure | Audio $10/M in, $20/M out ([model page](https://developers.openai.com/api/docs/models/gpt-realtime-2.1-mini)). ≈ $0.04–0.06/min | Medium, and **gated**: recording-based voices are "limited to eligible customers" (contact sales). The consent recording breaks the no-re-record rule | Yes, via `instructions` |
| **ElevenLabs Agents** with an Instant Voice Clone | IVC: 1–2 min recommended; "more than 2–3 minutes … little improvement" ([IVC](https://elevenlabs.io/docs/eleven-creative/voices/voice-cloning/instant-voice-cloning)) | Only via PVC, which needs ≥30 min (2–3 h recommended) ([PVC](https://elevenlabs.io/docs/eleven-creative/voices/voice-cloning/professional-voice-cloning)). 12–15 min is not enough | No figure on the pricing page | $0.08/min plus LLM at cost ([agents pricing](https://elevenlabs.io/pricing/agents)) | High. The browser talks to ElevenLabs' agent socket, so most of `ws-server/` and `useRealtimeVoice.ts` gets replaced | Yes, if you use **Custom LLM**: point it at an OpenAI-compatible SSE endpoint ([custom LLM](https://elevenlabs.io/docs/eleven-agents/customization/llm/custom-llm)), which ws-server could proxy to `qwen-plus` + `system-prompt.md` |
| **Hume EVI 3 / EVI 4 mini** | ~30 s clone ([EVI 3 launch](https://www.hume.ai/blog/announcing-evi-3-api)) | No | No figure | Official EVI 3 overage $0.04–0.07/min by plan. The EVI 4 mini rates of ~$0.02–0.035/min come from a third-party tracker only | High. Same shape as ElevenLabs | Yes, via a custom/supplemental LLM ([language model config](https://dev.hume.ai/voice/docs/speech-to-speech-evi/configuration/language-model)). The speech model only sees the first 7,000 prompt characters |
| **Cartesia Sonic 3.6** (TTS only, plus a managed-agents option) | Instant clone ~10 s; PVC is a paid training step (third-party sources; the [official pricing doc](https://docs.cartesia.ai/pricing.md) gives only ~1 credit/char) | Only via PVC | Sub-90 ms model latency claimed for Sonic 3.6 (Cartesia, via search) | Pro plan $5 for 100k credits ≈ $0.02/min TTS. Managed agents $0.03/min + LLM ([pricing doc](https://docs.cartesia.ai/pricing.md)) | Low as a TTS swap (a sibling of option a) | Yes as a TTS swap |
| **Google Gemini Live** (`gemini-3.8-live`) | Vertex docs say you can "replicate a custom voice per session" ([Live API](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/live-api)), but give no creation flow. A developer forum report says custom voice IDs don't work with `gemini-3.8-live` ([forum](https://discuss.ai.google.dev/t/gemini-3-8-live-support-for-voice-design-custom-voices/184651)) | Unknown | No figure | Not checked | Unknown | Yes, via system instruction |
| **Sesame CSM-1B** | Open weights (Apache 2.0) only. Hosted access (DeepInfra via OpenRouter) offers preset voices, with no official cloning API ([GitHub](https://github.com/SesameAILabs/csm)) | Self-host only | — | — | Self-host only | — |

Notes:

- Speech-to-speech removes the 1 s VAD wait and two network hops. That is where the big latency win comes from. In exchange, you give up `qwen-plus` reasoning and the per-turn control in `session.ts` (analytics logging, barge-in handling, word counts).
- None of the speech-to-speech options use more audio than the ~2.4 min we already have. "More audio helps" only applies to ElevenLabs PVC (≥30 min), Cartesia PVC, and self-hosted fine-tunes.
- Voice quality from 20–45 s isn't benchmarked consistently across vendors. Everything in this doc is the vendors' own claims. No listening test was run.

## 5. Recommendation

**Swap the TTS to hosted Fish Audio S2.1 Pro behind a `TTS_PROVIDER` flag, and run an A/B against the current Qwen3-TTS-VC voice.** Then lower the ASR `silence_duration_ms` from 1000 to ~500–600 ms.

Why:

- It answers "better-sounding" directly. S2.x is Fish's flagship cloning model, and a persistent voice model can use all ~2.4 min of existing clips instead of a single 21 s reference.
- It touches one ~150-line module, with an interface the rest of `session.ts` already depends on.
- Cost stays at or below today's level.
- The knowledge path doesn't change: `prompts/system-prompt.md` stays the only source, read by `qwen-plus`.
- No re-recording and no consent clip are needed.
- The VAD change is a one-line latency win that applies to any option.

**Rough effort:** 1–1.5 days.

- ~2 h: voice-model creation script plus env vars.
- ~4–6 h: `fish/tts.ts` with MessagePack, the sample-rate fix, and flush on sentence boundaries.
- ~2 h: provider flag, VAD tuning, and turn-latency checks with the existing `logger.ts` (TTS TTFA, total).
- ~2 h: blind A/B with a few people, plus a check against `Qwen3-TTS/example_output/finetuned_test_*.wav`.

**If latency is still the complaint afterwards,** spike Qwen3.8-Omni-Flash-Realtime with a `qwen-voice-enrollment` clone (~2–3 days). It's the cheapest speech-to-speech option, uses the same DashScope account and region, and takes `system-prompt.md` as `instructions`. Check whether Omni-Flash answers as accurately as `qwen-plus` before switching.

**Not recommended now:**

- Self-hosting Fish S2 Pro: GPU cost, plus the non-commercial license.
- OpenAI custom voices: gated access, and the consent recording breaks no-re-record.
- ElevenLabs or Hume agents: they replace the whole server, for no clone-quality gain from the audio we have.
- Gemini Live: custom-voice support is unverified.
- Sesame: there is no hosted cloning.
