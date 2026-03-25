'use client';

import { useCallback, useRef, useState } from 'react';
import type { TerminalState, TerminalStateMetadata } from '@/app/hooks/useTerminalState';

export type RealtimePhase = 'idle' | 'connecting' | 'listening' | 'responding' | 'error';

export interface RealtimeStatus {
  phase: RealtimePhase;
  transcript: string;
  responseText: string;
  error: string | null;
}

interface UseRealtimeVoiceOptions {
  transitionTo: (state: TerminalState, meta?: TerminalStateMetadata) => void;
}

const SAMPLE_RATE = 24000;

function pcm16ToFloat32(pcm: ArrayBuffer): Float32Array<ArrayBuffer> {
  const int16 = new Int16Array(pcm);
  const float32 = new Float32Array(int16.length) as Float32Array<ArrayBuffer>;
  for (let i = 0; i < int16.length; i++) {
    float32[i] = int16[i] / 32768;
  }
  return float32;
}

function float32ToPcm16Base64(float32: Float32Array): string {
  const int16 = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    int16[i] = s < 0 ? s * 32768 : s * 32767;
  }
  const bytes = new Uint8Array(int16.buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Downsample from srcRate to SAMPLE_RATE
function downsample(float32: Float32Array, srcRate: number): Float32Array {
  if (srcRate === SAMPLE_RATE) return float32;
  const ratio = srcRate / SAMPLE_RATE;
  const outLen = Math.floor(float32.length / ratio);
  const out = new Float32Array(outLen);
  for (let i = 0; i < outLen; i++) {
    out[i] = float32[Math.floor(i * ratio)];
  }
  return out;
}

export function useRealtimeVoice({ transitionTo }: UseRealtimeVoiceOptions) {
  const [status, setStatus] = useState<RealtimeStatus>({
    phase: 'idle',
    transcript: '',
    responseText: '',
    error: null,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  // Accumulated PCM16 audio chunks for current response
  const audioChunksRef = useRef<ArrayBuffer[]>([]);
  // Next scheduled playback time
  const nextPlayTimeRef = useRef<number>(0);

  const setPhase = useCallback((phase: RealtimePhase, extra?: Partial<RealtimeStatus>) => {
    setStatus(prev => ({ ...prev, phase, error: null, ...extra }));
  }, []);

  const sendEvent = useCallback((event: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(event));
    }
  }, []);

  const scheduleAudioChunk = useCallback((pcm: ArrayBuffer) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const float32 = pcm16ToFloat32(pcm);
    const buffer = ctx.createBuffer(1, float32.length, SAMPLE_RATE);
    buffer.copyToChannel(float32, 0);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    const now = ctx.currentTime;
    const startAt = Math.max(now, nextPlayTimeRef.current);
    source.start(startAt);
    nextPlayTimeRef.current = startAt + buffer.duration;
  }, []);

  const handleMessage = useCallback((raw: string) => {
    let event: { type: string; [key: string]: unknown };
    try {
      event = JSON.parse(raw);
    } catch {
      return;
    }

    switch (event.type) {
      case 'session.created': {
        sendEvent({
          type: 'session.update',
          session: {
            modalities: ['audio', 'text'],
            voice: 'alloy',
            input_audio_format: 'pcm16',
            output_audio_format: 'pcm16',
            turn_detection: { type: 'server_vad', silence_duration_ms: 500 },
            instructions:
              "You are Kaleb's personal AI assistant. Be concise and conversational.",
          },
        });
        setPhase('listening');
        transitionTo('VOICE_ACTIVE');
        break;
      }

      case 'input_audio_buffer.speech_started': {
        // Clear previous transcript when user starts speaking
        setStatus(prev => ({ ...prev, transcript: '', responseText: '' }));
        break;
      }

      case 'conversation.item.input_audio_transcription.completed': {
        const t = (event.transcript as string | undefined) ?? '';
        setStatus(prev => ({ ...prev, transcript: t }));
        break;
      }

      case 'response.created': {
        audioChunksRef.current = [];
        setPhase('responding');
        break;
      }

      case 'response.audio.delta': {
        const delta = event.delta as string | undefined;
        if (delta) {
          const pcm = base64ToArrayBuffer(delta);
          scheduleAudioChunk(pcm);
        }
        break;
      }

      case 'response.audio_transcript.delta': {
        const delta = event.delta as string | undefined;
        if (delta) {
          setStatus(prev => ({ ...prev, responseText: prev.responseText + delta }));
        }
        break;
      }

      case 'response.audio.done': {
        setPhase('listening');
        break;
      }

      case 'error': {
        const err = event.error as { message?: string } | undefined;
        const msg = err?.message ?? 'Unknown error from OpenAI Realtime';
        setStatus(prev => ({ ...prev, phase: 'error', error: msg }));
        break;
      }
    }
  }, [sendEvent, setPhase, scheduleAudioChunk, transitionTo]);

  const connect = useCallback(async () => {
    if (wsRef.current) return;
    setPhase('connecting');

    try {
      // 1. Get ephemeral token from server
      const res = await fetch('/api/realtime/session', { method: 'POST' });
      if (!res.ok) throw new Error(`Session endpoint error: ${res.status}`);
      const { token } = await res.json();

      // 2. Set up AudioContext + mic
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const ctx = new AudioContext({ sampleRate: SAMPLE_RATE });
      audioCtxRef.current = ctx;
      nextPlayTimeRef.current = ctx.currentTime;

      const source = ctx.createMediaStreamSource(stream);

      // Analyser for waveform
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      // ScriptProcessor to capture PCM and send to OpenAI
      const processor = ctx.createScriptProcessor(4096, 1, 1);
      source.connect(processor);
      processor.connect(ctx.destination);
      processorRef.current = processor;

      // 3. Open WebSocket to OpenAI Realtime
      const ws = new WebSocket(
        `wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17`,
        [
          'realtime',
          `openai-insecure-api-key.${token}`,
          'openai-beta.realtime-v1',
        ]
      );
      wsRef.current = ws;

      ws.onmessage = (e) => handleMessage(e.data);
      ws.onerror = () => {
        setStatus(prev => ({ ...prev, phase: 'error', error: 'WebSocket error' }));
      };
      ws.onclose = () => {
        if (wsRef.current) {
          // Closed unexpectedly
          setStatus(prev => ({
            ...prev,
            phase: prev.phase === 'error' ? 'error' : 'idle',
          }));
          wsRef.current = null;
          transitionTo('VOICE_IDLE');
        }
      };

      // Wire up audio processor after WS is open
      ws.onopen = () => {
        processor.onaudioprocess = (e) => {
          if (ws.readyState !== WebSocket.OPEN) return;
          const input = e.inputBuffer.getChannelData(0);
          const downsampled = downsample(input, ctx.sampleRate);
          const b64 = float32ToPcm16Base64(downsampled);
          ws.send(JSON.stringify({ type: 'input_audio_buffer.append', audio: b64 }));
        };
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatus({ phase: 'error', transcript: '', responseText: '', error: msg });
      // Clean up on error
      micStreamRef.current?.getTracks().forEach(t => t.stop());
      micStreamRef.current = null;
      audioCtxRef.current?.close();
      audioCtxRef.current = null;
      wsRef.current = null;
    }
  }, [handleMessage, setPhase, transitionTo]);

  const disconnect = useCallback(() => {
    const ws = wsRef.current;
    wsRef.current = null;

    processorRef.current?.disconnect();
    processorRef.current = null;

    analyserRef.current?.disconnect();
    analyserRef.current = null;

    micStreamRef.current?.getTracks().forEach(t => t.stop());
    micStreamRef.current = null;

    audioCtxRef.current?.close();
    audioCtxRef.current = null;

    ws?.close();

    setStatus({ phase: 'idle', transcript: '', responseText: '', error: null });
    transitionTo('VOICE_IDLE');
  }, [transitionTo]);

  const isConnected = status.phase !== 'idle' && status.phase !== 'error' && status.phase !== 'connecting';

  return { status, analyserRef, connect, disconnect, isConnected };
}
