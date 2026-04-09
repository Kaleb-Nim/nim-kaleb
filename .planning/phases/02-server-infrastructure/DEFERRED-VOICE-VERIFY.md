# Deferred Voice Verification — Phase 2 Scope Note

**Created by:** Phase 1, Plan 03 (verify-voice.sh deferred path)
**Reason:** Non-streaming model `qwen3-tts-vc-2026-01-22` cannot synthesize with a voice_id enrolled against `qwen3-tts-vc-realtime-2026-01-15` (cross-model incompatibility confirmed).

## Required in Phase 2

1. **VOICE-02 listen verification**: After the realtime WebSocket TTS pipeline is working, synthesize at least one test sentence and confirm the voice sounds like Kaleb.
2. **VOICE-05 intonation check**: Synthesize achievement vs. challenge sentences via the realtime pipeline and confirm observable prosody variation.

## Acceptance

- [ ] At least one audio sample generated via the realtime TTS model sounds recognizably like Kaleb
- [ ] Achievement and challenge sentences have distinguishable intonation

This note should be consumed by Phase 2 planning and deleted once verification is complete.
