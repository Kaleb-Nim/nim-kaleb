"""Modal deployment for Qwen3-TTS inference.

Deploy:  modal deploy modal_tts.py
Dev:     modal serve modal_tts.py

Exposes:
  POST /tts   - JSON {text, speaker?} -> WAV audio bytes
  GET  /health - Health check
"""

import modal

app = modal.App("kebab-tts")

image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("ffmpeg", "libsndfile1", "sox", "git")
    .pip_install(
        "torch==2.7.0",
        "torchaudio==2.7.0",
        "transformers==4.57.3",
        "accelerate==1.12.0",
        "soundfile>=0.12.1",
        "numpy>=1.26.0",
        "librosa",
        "onnxruntime",
        "einops",
        "peft>=0.13.0",
        "fastapi[standard]",
    )
    .pip_install("qwen-tts @ git+https://github.com/QwenLM/Qwen3-TTS.git")
    .env({"HF_HOME": "/cache/huggingface"})
    .add_local_file(
        "/Users/kalebnim/Documents/GitHub/Qwen3-TTS/finetuning/data_v3/ref.wav",
        remote_path="/assets/ref_voice.wav",
    )
)

# ── ASGI app (handles /tts and /health) ─────────────────────────────────────

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel

web_app = FastAPI(title="Kebab TTS")
web_app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://nim-kaleb.vercel.app",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


class TTSRequest(BaseModel):
    text: str
    speaker: str = "default"


@app.function(
    gpu="T4",
    image=image,
    scaledown_window=300,
    volumes={"/cache": modal.Volume.from_name("hf-cache", create_if_missing=True)},
)
@modal.asgi_app()
def tts_app():
    import io
    import numpy as np
    import soundfile as sf
    import torch
    from qwen_tts import Qwen3TTSModel

    # Detect flash-attn for optimal attention on CUDA
    try:
        import flash_attn  # noqa: F401
        attn_impl = "flash_attention_2"
    except ImportError:
        attn_impl = None

    print("[tts] Loading Qwen3-TTS-12Hz-1.7B-Base on CUDA...")
    model = Qwen3TTSModel.from_pretrained(
        "Qwen/Qwen3-TTS-12Hz-1.7B-Base",
        device_map="cuda",
        dtype=torch.bfloat16,
        attn_implementation=attn_impl,
    )
    print("[tts] Model ready.")

    ref_audio = "/assets/ref_voice.wav"
    ref_text = "Good one. Okay, fine, I'm just gonna leave this sock monkey here. Goodbye."
    gen_kwargs = dict(
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

    @web_app.post("/tts")
    async def synthesize(req: TTSRequest):
        if not req.text.strip():
            raise HTTPException(status_code=400, detail="Empty text")

        wavs, sr = model.generate_voice_clone(
            text=req.text,
            language="Auto",
            ref_audio=ref_audio,
            ref_text=ref_text,
            x_vector_only_mode=True,
            **gen_kwargs,
        )

        audio = wavs[0]
        if isinstance(audio, torch.Tensor):
            audio = audio.cpu().float().numpy()

        buf = io.BytesIO()
        sf.write(buf, audio, samplerate=sr, format="WAV", subtype="PCM_16")
        buf.seek(0)
        return Response(content=buf.read(), media_type="audio/wav")

    @web_app.get("/health")
    def health():
        return {"status": "ok", "device": "cuda", "model": "Qwen3-TTS-12Hz-1.7B-Base"}

    return web_app
