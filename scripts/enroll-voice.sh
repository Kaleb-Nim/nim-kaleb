#!/usr/bin/env bash
# enroll-voice.sh — One-time voice enrollment with DashScope Qwen3-TTS
# Produces DASHSCOPE_VOICE_ID for use in all subsequent TTS calls.
# Usage: DASHSCOPE_API_KEY=xxx bash scripts/enroll-voice.sh
#
# Set SKIP_RECORD=1 to skip the recording step and reuse existing audio:
#   SKIP_RECORD=1 DASHSCOPE_API_KEY=xxx bash scripts/enroll-voice.sh

set -euo pipefail

# ── Constants (locked — do NOT change target_model) ──────────────────
TARGET_MODEL="qwen3-tts-vc-realtime-2026-01-15"
ENDPOINT="https://dashscope-intl.aliyuncs.com/api/v1/services/audio/tts/customization"
AUDIO_DIR="assets/reference-audio"
RAW_FILE="$AUDIO_DIR/kaleb-raw.wav"
CONVERTED_FILE="$AUDIO_DIR/kaleb-reference.wav"
PADDED_FILE="$AUDIO_DIR/kaleb-reference-padded.wav"
TRANSCRIPT_FILE="$AUDIO_DIR/kaleb-transcript.txt"

# ── Preflight checks ────────────────────────────────────────────────
if [[ -z "${DASHSCOPE_API_KEY:-}" ]]; then
  echo "ERROR: DASHSCOPE_API_KEY environment variable not set"
  echo "Get your key from: https://www.alibabacloud.com/en -> Model Studio -> API Keys (Singapore region)"
  exit 1
fi

command -v ffmpeg >/dev/null 2>&1 || { echo "ERROR: ffmpeg not found"; exit 1; }
command -v jq >/dev/null 2>&1 || { echo "ERROR: jq not found (install: brew install jq)"; exit 1; }

mkdir -p "$AUDIO_DIR"

# ── Step 1: Record reference audio (12-15 seconds) ──────────────────
if [[ "${SKIP_RECORD:-0}" == "1" ]]; then
  echo "=== Step 1: SKIPPED (SKIP_RECORD=1) ==="
  if [[ ! -f "$RAW_FILE" && ! -f "$PADDED_FILE" ]]; then
    echo "ERROR: SKIP_RECORD=1 but no existing audio found at $RAW_FILE or $PADDED_FILE"
    exit 1
  fi
  echo "Using existing audio file."
else
  echo "=== Step 1: Recording reference audio ==="
  echo "Speak naturally for 12-15 seconds. Describe a project you're excited about."
  echo "Include emotional variation — enthusiasm, thoughtfulness, confidence."
  echo "Press Ctrl+C to stop recording early."
  echo ""
  echo "Recording starts in 3 seconds..."
  sleep 3

  if command -v rec >/dev/null 2>&1; then
    rec -r 44100 -c 1 "$RAW_FILE" trim 0 15
  else
    echo "ERROR: rec (sox) not found. Record audio manually and save as $RAW_FILE"
    echo "Then re-run this script with SKIP_RECORD=1"
    exit 1
  fi
fi

# ── Step 2: Convert to required format ───────────────────────────────
echo ""
echo "=== Step 2: Converting audio format ==="
if [[ "${SKIP_RECORD:-0}" == "1" && -f "$PADDED_FILE" ]]; then
  echo "Padded file already exists, skipping conversion."
else
  ffmpeg -y -i "$RAW_FILE" -ar 24000 -ac 1 -sample_fmt s16 "$CONVERTED_FILE"

  # ── Step 3: Append 500ms silence (prevents phoneme bleed) ───────────
  echo ""
  echo "=== Step 3: Adding trailing silence ==="
  ffmpeg -y -i "$CONVERTED_FILE" -af "apad=pad_dur=0.5" "$PADDED_FILE"
fi

# ── Step 4: Generate transcript with Whisper ─────────────────────────
echo ""
echo "=== Step 4: Generating transcript ==="
if [[ "${SKIP_RECORD:-0}" == "1" && -f "$TRANSCRIPT_FILE" ]]; then
  echo "Transcript already exists, skipping Whisper."
else
  if command -v whisper >/dev/null 2>&1; then
    whisper "$PADDED_FILE" --language English --output_format txt --output_dir "$AUDIO_DIR"
    # Whisper outputs to <filename>.txt — rename to our expected name
    mv "$AUDIO_DIR/kaleb-reference-padded.txt" "$TRANSCRIPT_FILE" 2>/dev/null || true
  else
    echo "WARNING: whisper not found. Install with: uv tool install openai-whisper"
    echo "Or manually create $TRANSCRIPT_FILE with the exact words you spoke."
    echo "Transcript is critical — raises speaker similarity from 0.75 to 0.89."
    exit 1
  fi
fi

echo ""
echo "Transcript content:"
cat "$TRANSCRIPT_FILE"
echo ""

# ── Step 5: Enroll with DashScope ────────────────────────────────────
echo "=== Step 5: Enrolling voice with DashScope ==="
AUDIO_B64=$(base64 -i "$PADDED_FILE" | tr -d '\n')
AUDIO_DATA_URI="data:audio/wav;base64,$AUDIO_B64"
TRANSCRIPT=$(cat "$TRANSCRIPT_FILE")

# Build JSON payload via file to avoid ARG_MAX limits on large base64 audio
PAYLOAD_FILE=$(mktemp)
jq -n \
  --arg target_model "$TARGET_MODEL" \
  --arg transcript "$TRANSCRIPT" \
  --rawfile audio_b64 <(echo -n "$AUDIO_B64") \
  '{
    model: "qwen-voice-enrollment",
    input: {
      action: "create",
      target_model: $target_model,
      preferred_name: "kaleb",
      audio: { data: ("data:audio/wav;base64," + $audio_b64) },
      text: $transcript,
      language: "en"
    }
  }' > "$PAYLOAD_FILE"

RESPONSE=$(curl -s -X POST "$ENDPOINT" \
  -H "Authorization: Bearer $DASHSCOPE_API_KEY" \
  -H "Content-Type: application/json" \
  -d @"$PAYLOAD_FILE")

rm -f "$PAYLOAD_FILE"

echo "API Response:"
echo "$RESPONSE" | jq .

VOICE_ID=$(echo "$RESPONSE" | jq -r '.output.voice // empty')

if [[ -z "$VOICE_ID" ]]; then
  echo ""
  echo "ERROR: Enrollment failed. Check the response above for error details."
  exit 1
fi

echo ""
echo "========================================="
echo "SUCCESS! Voice enrolled."
echo "========================================="
echo ""
echo "DASHSCOPE_VOICE_ID=$VOICE_ID"
echo ""
echo "Next steps:"
echo "  1. Add to .env.local:  DASHSCOPE_VOICE_ID=$VOICE_ID"
echo "  2. Add to Vercel env:  vercel env add DASHSCOPE_VOICE_ID"
echo ""
