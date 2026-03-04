'use client';

import { useCallback, useRef, useState } from 'react';
import { useAudioQueue } from './useAudioQueue';
import type { TerminalState, TerminalStateMetadata } from './useTerminalState';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface PipelineStatus {
  phase: 'idle' | 'recording' | 'transcribing' | 'thinking' | 'speaking';
  transcript: string;
  responseSentences: string[];
  error: string | null;
}

interface UseVoicePipelineOptions {
  transitionTo: (state: TerminalState, meta?: TerminalStateMetadata) => void;
}

export function useVoicePipeline({ transitionTo }: UseVoicePipelineOptions) {
  const [status, setStatus] = useState<PipelineStatus>({
    phase: 'idle',
    transcript: '',
    responseSentences: [],
    error: null,
  });

  const conversationRef = useRef<Message[]>([]);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const { enqueue, stop: stopAudio } = useAudioQueue({
    onStateChange: (s) => {
      if (s === 'idle') {
        setStatus((prev) =>
          prev.phase === 'speaking' ? { ...prev, phase: 'idle' } : prev
        );
        transitionTo('VOICE_IDLE');
      }
    },
  });

  // ── TTS per sentence ───────────────────────────────────────────────────────

  const synthesizeSentence = async (sentence: string) => {
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sentence }),
      });
      if (!res.ok) throw new Error(`TTS ${res.status}`);
      const buf = await res.arrayBuffer();
      await enqueue(buf);
    } catch (err) {
      console.error('[VoicePipeline] TTS error:', err);
    }
  };

  // ── Chat streaming ─────────────────────────────────────────────────────────

  const streamChat = async (userText: string) => {
    conversationRef.current = [
      ...conversationRef.current,
      { role: 'user', content: userText },
    ];

    setStatus((prev) => ({
      ...prev,
      phase: 'thinking',
      responseSentences: [],
    }));
    transitionTo('VOICE_ACTIVE');

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: conversationRef.current }),
    });

    if (!res.ok || !res.body) {
      throw new Error(`Chat ${res.status}`);
    }

    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let fullResponse = '';

    setStatus((prev) => ({ ...prev, phase: 'speaking' }));

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const lines = dec.decode(value, { stream: true }).split('\n');
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const parsed = JSON.parse(line) as {
            sentence?: string;
            final?: boolean;
            error?: string;
          };

          if (parsed.error) throw new Error(parsed.error);

          if (parsed.sentence) {
            fullResponse += (fullResponse ? ' ' : '') + parsed.sentence;
            setStatus((prev) => ({
              ...prev,
              responseSentences: [...prev.responseSentences, parsed.sentence!],
            }));
            // Fire TTS without awaiting — gapless queue handles scheduling
            synthesizeSentence(parsed.sentence);
          }
        } catch (e) {
          if (e instanceof SyntaxError) continue;
          throw e;
        }
      }
    }

    if (fullResponse) {
      conversationRef.current = [
        ...conversationRef.current,
        { role: 'assistant', content: fullResponse },
      ];
    }
  };

  // ── Recording ──────────────────────────────────────────────────────────────

  const startRecording = useCallback(async () => {
    stopAudio();
    chunksRef.current = [];

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setStatus((prev) => ({
        ...prev,
        error: 'Microphone access denied.',
        phase: 'idle',
      }));
      return;
    }

    // Set up analyser for waveform visualisation
    audioCtxRef.current = new AudioContext();
    const source = audioCtxRef.current.createMediaStreamSource(stream);
    analyserRef.current = audioCtxRef.current.createAnalyser();
    analyserRef.current.fftSize = 256;
    source.connect(analyserRef.current);

    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/webm';

    recorderRef.current = new MediaRecorder(stream, { mimeType });
    recorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorderRef.current.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      audioCtxRef.current?.close();
      analyserRef.current = null;

      const blob = new Blob(chunksRef.current, { type: mimeType });
      await runPipeline(blob);
    };

    recorderRef.current.start();
    setStatus((prev) => ({ ...prev, phase: 'recording', error: null, transcript: '', responseSentences: [] }));
    transitionTo('VOICE_ACTIVE');
  }, [stopAudio, transitionTo]);

  const stopRecording = useCallback(() => {
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop();
    }
  }, []);

  // ── Full pipeline ──────────────────────────────────────────────────────────

  const runPipeline = async (blob: Blob) => {
    try {
      // 1. STT
      setStatus((prev) => ({ ...prev, phase: 'transcribing' }));
      const fd = new FormData();
      fd.append('audio', blob, 'recording.webm');
      const sttRes = await fetch('/api/stt', { method: 'POST', body: fd });
      if (!sttRes.ok) throw new Error(`STT ${sttRes.status}`);
      const { transcript } = await sttRes.json();

      if (!transcript?.trim()) {
        setStatus((prev) => ({ ...prev, phase: 'idle', transcript: '' }));
        transitionTo('VOICE_IDLE');
        return;
      }

      setStatus((prev) => ({ ...prev, transcript }));
      transitionTo('VOICE_ACTIVE', { lastTranscript: transcript });

      // 2. Chat + TTS (concurrent via sentence streaming)
      await streamChat(transcript);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatus((prev) => ({ ...prev, phase: 'idle', error: msg }));
      transitionTo('VOICE_IDLE', { errorMessage: msg });
    }
  };

  return {
    status,
    analyserRef,
    startRecording,
    stopRecording,
    clearHistory: () => {
      conversationRef.current = [];
    },
  };
}
