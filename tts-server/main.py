"""FastAPI server exposing /stt and /tts endpoints."""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, StreamingResponse
from pydantic import BaseModel

import stt
import tts


# ── lifespan: load models once at startup ────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    print("[startup] Pre-loading TTS model…")
    try:
        tts._load_models()
    except Exception as e:
        print(f"[startup] TTS model load failed: {e}. Will retry on first request.")

    print("[startup] Pre-loading STT model…")
    try:
        if stt._use_mlx():
            stt._load_mlx()
        else:
            stt._load_faster_whisper()
    except Exception as e:
        print(f"[startup] STT model load failed: {e}. Will retry on first request.")

    yield  # server runs here


# ── app ──────────────────────────────────────────────────────────────────────

app = FastAPI(title="Kebab Neural Interface — TTS/STT Server", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["POST"],
    allow_headers=["*"],
)


# ── STT ──────────────────────────────────────────────────────────────────────

@app.post("/stt")
async def speech_to_text(audio: UploadFile = File(...)):
    """Accept audio upload, return JSON: {transcript: string}"""
    raw_bytes = await audio.read()
    if not raw_bytes:
        raise HTTPException(status_code=400, detail="Empty audio file")

    try:
        transcript = stt.transcribe_bytes(raw_bytes, mime_type=audio.content_type or "audio/webm")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"STT error: {e}") from e

    return {"transcript": transcript}


# ── TTS ──────────────────────────────────────────────────────────────────────

class TTSRequest(BaseModel):
    text: str
    speaker: str = "default"


@app.post("/tts")
async def text_to_speech(req: TTSRequest):
    """Accept JSON {text, speaker?}, return WAV audio bytes."""
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Empty text")

    try:
        wav_bytes = tts.synthesize(req.text, speaker=req.speaker)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS error: {e}") from e

    return Response(content=wav_bytes, media_type="audio/wav")


# ── health ────────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok", "device": tts.DEVICE}
