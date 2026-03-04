'use client';

import { useEffect, useRef } from 'react';
import styles from './VoiceInterface.module.css';
import type { TerminalState, TerminalStateMetadata } from '@/app/hooks/useTerminalState';
import { useVoicePipeline } from '@/app/hooks/useVoicePipeline';

interface VoiceInterfaceProps {
  terminalState: TerminalState;
  transitionTo: (state: TerminalState, meta?: TerminalStateMetadata) => void;
}

const PHASE_LABELS: Record<string, string> = {
  idle: 'Ready. Click mic to speak.',
  recording: 'Recording… click to stop.',
  transcribing: 'Transcribing audio…',
  thinking: 'Processing query…',
  speaking: 'Synthesizing response…',
};

export default function VoiceInterface({
  terminalState,
  transitionTo,
}: VoiceInterfaceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  const { status, analyserRef, startRecording, stopRecording } =
    useVoicePipeline({ transitionTo });

  const isRecording = status.phase === 'recording';
  const isBusy = ['transcribing', 'thinking', 'speaking'].includes(status.phase);

  // ── Waveform visualiser ────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      const analyser = analyserRef.current;

      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      if (!analyser) {
        // Draw flat baseline
        ctx.strokeStyle = 'rgba(0,255,0,0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, H / 2);
        ctx.lineTo(W, H / 2);
        ctx.stroke();
        return;
      }

      const bufLen = analyser.frequencyBinCount;
      const dataArr = new Uint8Array(bufLen);
      analyser.getByteFrequencyData(dataArr);

      const barW = (W / bufLen) * 2.5;
      const color = isRecording ? '#ff4444' : '#00ff00';

      ctx.fillStyle = color;
      let x = 0;
      for (let i = 0; i < bufLen; i++) {
        const barH = (dataArr[i] / 255) * H;
        ctx.globalAlpha = 0.7;
        ctx.fillRect(x, H - barH, barW, barH);
        x += barW + 1;
      }
      ctx.globalAlpha = 1;
    };

    draw();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [analyserRef, isRecording]);

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else if (!isBusy) {
      startRecording();
    }
  };

  return (
    <div className={styles.container}>
      {/* Status */}
      <div className={styles.statusLine}>
        {'  '}{PHASE_LABELS[status.phase] ?? 'Ready.'}
      </div>

      {/* Waveform */}
      <canvas
        ref={canvasRef}
        className={styles.waveformCanvas}
        width={400}
        height={32}
      />

      {/* Mic button */}
      <button
        className={`${styles.micButton} ${isRecording ? styles.recording : ''}`}
        onClick={handleMicClick}
        disabled={isBusy}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
      >
        <span>{isRecording ? '■' : '●'}</span>
        <span>{isRecording ? 'Stop' : 'Speak'}</span>
      </button>

      {/* Transcript */}
      {status.transcript && (
        <div className={styles.transcriptBlock}>
          <span className={styles.transcriptLabel}>you: </span>
          {status.transcript}
        </div>
      )}

      {/* Streamed response sentences */}
      {status.responseSentences.length > 0 && (
        <div className={styles.responseBlock}>
          {status.responseSentences.map((s, i) => (
            <div key={i} className={styles.responseSentence}>
              {i === 0 ? '  ' : '  '}
              {s}
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {status.error && (
        <div className={styles.errorLine}>{'  '}[ERROR] {status.error}</div>
      )}

      <div className={styles.hint}>
        {'  '}[speak naturally — multi-turn context enabled]
      </div>
    </div>
  );
}
