"""Text-to-speech module using the local Qwen3-TTS package.

Uses generate_voice_clone() with x_vector_only_mode=True for fast,
reference-free synthesis against the 1.7B-Base model.

Device priority: mps → cuda → cpu
"""

import io
import os
import sys

import numpy as np
import soundfile as sf

# ── inject local qwen_tts package ────────────────────────────────────────────

_QWEN_TTS_REPO = os.environ.get(
    "QWEN_TTS_REPO", "/Users/kalebnim/Documents/GitHub/Qwen3-TTS"
)
if _QWEN_TTS_REPO not in sys.path:
    sys.path.insert(0, _QWEN_TTS_REPO)

from qwen_tts import Qwen3TTSModel  # type: ignore
from qwen_tts.core.device_utils import (  # type: ignore
    get_attention_implementation,
    get_model_path,
    get_optimal_device,
)
import torch

# ── device ───────────────────────────────────────────────────────────────────

DEVICE = get_optimal_device()

# ── model singleton ──────────────────────────────────────────────────────────

_model: Qwen3TTSModel | None = None

# A short reference WAV bundled with the repo — used in x_vector_only_mode so
# only the speaker timbre is extracted, not transcribed content.
_REF_AUDIO = os.path.join(_QWEN_TTS_REPO, "finetuning", "data_v3", "ref.wav")
_REF_TEXT = "Good one. Okay, fine, I'm just gonna leave this sock monkey here. Goodbye."

_GEN_KWARGS = dict(
    max_new_tokens=2048,
    do_sample=True,
    top_k=50,
    top_p=1.0,
    temperature=0.9,
    repetition_penalty=1.05,
    subtalker_dosample=True,
    subtalker_top_k=50,
    subtalker_top_p=1.0,
    subtalker_temperature=0.9,
)


def _load_models():
    global _model
    if _model is not None:
        return

    model_path = get_model_path(
        "Qwen/Qwen3-TTS-12Hz-1.7B-Base",
        local_models_dir=os.path.join(_QWEN_TTS_REPO, "models"),
    )
    attn_impl = get_attention_implementation(DEVICE)

    print(f"[tts] Loading Qwen3-TTS-1.7B-Base from {model_path} on {DEVICE}…")
    _model = Qwen3TTSModel.from_pretrained(
        model_path,
        device_map=DEVICE,
        dtype=torch.bfloat16,
        attn_implementation=attn_impl,
    )
    print(f"[tts] Model ready.")


# ── public API ───────────────────────────────────────────────────────────────

def synthesize(text: str, speaker: str = "default") -> bytes:
    """Return synthesized speech as WAV bytes (24kHz mono)."""
    _load_models()

    wavs, sr = _model.generate_voice_clone(  # type: ignore[union-attr]
        text=text,
        language="Auto",
        ref_audio=_REF_AUDIO,
        ref_text=_REF_TEXT,
        x_vector_only_mode=True,
        **_GEN_KWARGS,
    )

    audio = wavs[0]
    if isinstance(audio, torch.Tensor):
        audio = audio.cpu().float().numpy()

    return _to_wav_bytes(audio, sample_rate=sr)


def _to_wav_bytes(audio: np.ndarray, sample_rate: int = 24000) -> bytes:
    buf = io.BytesIO()
    sf.write(buf, audio, samplerate=sample_rate, format="WAV", subtype="PCM_16")
    buf.seek(0)
    return buf.read()
