"""Speech-to-text module.

Platform detection:
  - arm64 Darwin  → mlx-whisper (MPS-accelerated via MLX)
  - Linux / CUDA  → faster-whisper (CTranslate2)
  - fallback      → openai-whisper CPU
"""

import io
import platform
import sys
from typing import IO

import numpy as np
import soundfile as sf

_ARCH = platform.machine()
_SYSTEM = platform.system()

# ── model singleton ─────────────────────────────────────────────────────────

_mlx_model = None
_fw_model = None


def _load_mlx():
    global _mlx_model
    if _mlx_model is None:
        import mlx_whisper  # type: ignore
        _mlx_model = mlx_whisper  # module-level API, no explicit load needed
    return _mlx_model


def _load_faster_whisper():
    global _fw_model
    if _fw_model is None:
        from faster_whisper import WhisperModel  # type: ignore
        device = "cuda" if _is_cuda_available() else "cpu"
        compute = "float16" if device == "cuda" else "int8"
        _fw_model = WhisperModel("base.en", device=device, compute_type=compute)
    return _fw_model


def _is_cuda_available() -> bool:
    try:
        import torch
        return torch.cuda.is_available()
    except ImportError:
        return False


def _use_mlx() -> bool:
    return _ARCH == "arm64" and _SYSTEM == "Darwin"


# ── public API ───────────────────────────────────────────────────────────────

def transcribe_bytes(audio_bytes: bytes, mime_type: str = "audio/webm") -> str:
    """Transcribe raw audio bytes. Returns the transcript string."""
    audio_array, sample_rate = _decode_audio(audio_bytes)

    if _use_mlx():
        return _transcribe_mlx(audio_array, sample_rate)
    else:
        return _transcribe_faster_whisper(audio_array, sample_rate)


def _decode_audio(audio_bytes: bytes) -> tuple[np.ndarray, int]:
    """Decode audio bytes to float32 mono numpy array."""
    buf = io.BytesIO(audio_bytes)
    try:
        data, sr = sf.read(buf, dtype="float32", always_2d=True)
        mono = data.mean(axis=1)
        return mono, sr
    except Exception:
        # Fallback: try reading via soundfile with explicit format hints
        buf.seek(0)
        data, sr = sf.read(buf, dtype="float32")
        if data.ndim > 1:
            data = data.mean(axis=1)
        return data, sr


def _transcribe_mlx(audio: np.ndarray, sr: int) -> str:
    import mlx_whisper  # type: ignore

    # mlx_whisper expects float32 at 16kHz
    if sr != 16000:
        audio = _resample(audio, sr, 16000)

    result = mlx_whisper.transcribe(
        audio,
        path_or_hf_repo="mlx-community/whisper-base.en-mlx",
        verbose=False,
    )
    return result.get("text", "").strip()


def _transcribe_faster_whisper(audio: np.ndarray, sr: int) -> str:
    model = _load_faster_whisper()

    if sr != 16000:
        audio = _resample(audio, sr, 16000)

    segments, _ = model.transcribe(audio, beam_size=5)
    return " ".join(s.text for s in segments).strip()


def _resample(audio: np.ndarray, orig_sr: int, target_sr: int) -> np.ndarray:
    try:
        import resampy  # type: ignore
        return resampy.resample(audio, orig_sr, target_sr)
    except ImportError:
        pass
    # Simple linear interpolation fallback
    ratio = target_sr / orig_sr
    new_len = int(len(audio) * ratio)
    return np.interp(
        np.linspace(0, len(audio) - 1, new_len),
        np.arange(len(audio)),
        audio,
    ).astype(np.float32)
