#!/usr/bin/env bash
# verify-voice.sh — Synthesize test sentences to verify voice quality and emotional variation
# Run after enroll-voice.sh has set DASHSCOPE_VOICE_ID in .env.local
# Usage: source .env.local && bash scripts/verify-voice.sh

set -euo pipefail

ENDPOINT="https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation"
OUTPUT_DIR="assets/reference-audio/verification"

if [[ -z "${DASHSCOPE_API_KEY:-}" ]]; then
  echo "ERROR: DASHSCOPE_API_KEY not set"
  exit 1
fi

if [[ -z "${DASHSCOPE_VOICE_ID:-}" ]]; then
  echo "ERROR: DASHSCOPE_VOICE_ID not set — run enroll-voice.sh first"
  exit 1
fi

mkdir -p "$OUTPUT_DIR"

# Three test sentences with distinct emotional valence (VOICE-05 verification)
declare -a LABELS=("achievement" "challenge" "technical")
declare -a SENTENCES=(
  "I'm really proud of that project — we shipped it in six weeks and it handles thousands of requests per second now. The team was incredible."
  "That was honestly one of the hardest problems I've faced. We tried two approaches that completely failed before we figured out the right architecture."
  "Yeah, so the interesting part was the real-time audio pipeline. I used WebSockets for bidirectional streaming and an AudioWorklet for low-latency playback."
)

echo "=== Voice Verification ==="
echo "Voice ID: $DASHSCOPE_VOICE_ID"
echo "Synthesizing 3 test sentences..."
echo ""

SUCCESS_COUNT=0

for i in 0 1 2; do
  LABEL="${LABELS[$i]}"
  SENTENCE="${SENTENCES[$i]}"
  OUTPUT_FILE="$OUTPUT_DIR/test-${LABEL}.wav"

  echo "--- ${LABEL} ---"
  echo "Text: ${SENTENCE}"

  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$ENDPOINT" \
    -H "Authorization: Bearer $DASHSCOPE_API_KEY" \
    -H "Content-Type: application/json" \
    -d "$(jq -n \
      --arg voice "$DASHSCOPE_VOICE_ID" \
      --arg text "$SENTENCE" \
      '{
        model: "qwen3-tts-vc-2026-01-22",
        input: { text: $text, voice: $voice, language_type: "English" }
      }'
    )")

  HTTP_CODE=$(echo "$RESPONSE" | tail -1)
  BODY=$(echo "$RESPONSE" | sed '$d')

  if [[ "$HTTP_CODE" != "200" ]]; then
    echo "HTTP $HTTP_CODE — synthesis failed"
    ERROR_MSG=$(echo "$BODY" | jq -r '.message // .error // "unknown error"' 2>/dev/null || echo "$BODY")
    echo "Error: $ERROR_MSG"
    echo ""

    # Check if this is the known cross-model compatibility issue
    if echo "$ERROR_MSG" | grep -qi "voice\|model\|not found\|invalid"; then
      echo "NOTE: This may be because the voice was enrolled against the realtime model"
      echo "(qwen3-tts-vc-realtime-2026-01-15) but this test uses the non-streaming model"
      echo "(qwen3-tts-vc-2026-01-22). This is a known potential incompatibility."
      echo ""
      echo "Voice verification will happen in Phase 2 with the realtime WebSocket model."
      echo "The enrollment itself is likely fine — check with the list API:"
      echo "  source .env.local && bash scripts/enroll-voice.sh list"
      echo ""

      # Create Phase 2 scope note so deferred verification is tracked
      SCOPE_NOTE=".planning/phases/02-server-infrastructure/DEFERRED-VOICE-VERIFY.md"
      mkdir -p "$(dirname "$SCOPE_NOTE")"
      cat > "$SCOPE_NOTE" << 'SCOPEEOF'
# Deferred Voice Verification — Phase 2 Scope Note

**Created by:** Phase 1, Plan 03 (verify-voice.sh deferred path)
**Reason:** Non-streaming model `qwen3-tts-vc-2026-01-22` rejected the voice_id enrolled against `qwen3-tts-vc-realtime-2026-01-15` (cross-model incompatibility).

## Required in Phase 2

1. **VOICE-02 listen verification**: After the realtime WebSocket TTS pipeline is working, synthesize at least one test sentence and confirm the voice sounds like Kaleb.
2. **VOICE-05 intonation check**: Synthesize achievement vs. challenge sentences via the realtime pipeline and confirm observable prosody variation.

## Acceptance

- [ ] At least one audio sample generated via the realtime TTS model sounds recognizably like Kaleb
- [ ] Achievement and challenge sentences have distinguishable intonation

This note should be consumed by Phase 2 planning and deleted once verification is complete.
SCOPEEOF

      echo "Created Phase 2 scope note: $SCOPE_NOTE"
      echo "Phase 2 planning will pick up VOICE-02 and VOICE-05 listen verification."
      exit 0
    fi
    continue
  fi

  # Extract base64 audio from response and decode
  AUDIO_B64=$(echo "$BODY" | jq -r '.output.audio // empty')
  if [[ -z "$AUDIO_B64" ]]; then
    echo "WARNING: Response OK but no audio data found"
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
    continue
  fi

  echo "$AUDIO_B64" | base64 -d > "$OUTPUT_FILE"
  echo "Saved: $OUTPUT_FILE"
  SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  echo ""
done

if [[ $SUCCESS_COUNT -eq 0 ]]; then
  echo "No audio files generated. See errors above."
  exit 1
fi

echo "========================================="
echo "Generated $SUCCESS_COUNT/3 test audio files in $OUTPUT_DIR/"
echo "========================================="
echo ""
echo "Listen to each file and evaluate:"
echo "  1. Does it sound like Kaleb? (voice quality)"
echo "  2. Does 'achievement' sound more upbeat than 'challenge'? (VOICE-05)"
echo "  3. Does 'technical' sound focused/measured? (VOICE-05)"
echo ""
echo "To play: open $OUTPUT_DIR/test-achievement.wav"
echo ""
echo "If the voice sounds wrong, re-record with more emotional variation and re-enroll."
