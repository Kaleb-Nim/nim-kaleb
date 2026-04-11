'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './VoiceInterface.module.css';
import type { TerminalState, TerminalStateMetadata } from '@/app/hooks/useTerminalState';
import { useRealtimeVoice } from '@/app/hooks/useRealtimeVoice';

interface VoiceInterfaceProps {
  terminalState?: TerminalState;
  transitionTo: (state: TerminalState, meta?: TerminalStateMetadata) => void;
}

const PHASE_LABELS: Record<string, string> = {
  idle: 'Click connect to start voice chat.',
  connecting: 'Connecting to Bun WS server…',
  listening: 'Listening… (speak naturally)',
  responding: 'Responding…',
  error: 'Connection error.',
};

export default function VoiceInterface({
  terminalState,
  transitionTo,
}: VoiceInterfaceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  const { status, analyserRef, connect, disconnect, isConnected } =
    useRealtimeVoice({ transitionTo });

  const [showTranscript, setShowTranscript] = useState(true);

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
      const color = status.phase === 'listening' ? '#00ff00' : '#ffaa00';

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
  }, [analyserRef, status.phase]);

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

      {/* Connect / Disconnect button */}
      <button
        className={`${styles.micButton} ${isConnected ? styles.recording : ''}`}
        onClick={isConnected ? disconnect : connect}
        disabled={status.phase === 'connecting'}
        aria-label={isConnected ? 'Disconnect voice' : 'Connect voice'}
      >
        <span>{isConnected ? '■' : '●'}</span>
        <span>{isConnected ? 'Disconnect' : 'Connect'}</span>
      </button>

      {/* User transcript */}
      {status.transcript && (
        <div className={styles.transcriptBlock}>
          <span className={styles.transcriptLabel}>you: </span>
          {status.transcript}
        </div>
      )}

      {/* AI response transcript toggle */}
      {status.responseText && (
        <>
          <button
            className={styles.transcriptToggle}
            aria-expanded={showTranscript}
            aria-controls="ai-transcript"
            onClick={() => setShowTranscript(p => !p)}
          >
            {showTranscript ? '[hide transcript]' : '[show transcript]'}
          </button>
          {showTranscript && (
            <div id="ai-transcript" role="region" aria-label="AI response transcript"
                 className={styles.responseBlock}>
              <div className={styles.responseSentence}>
                {'  '}{status.responseText}
              </div>
            </div>
          )}
        </>
      )}

      {/* Error */}
      {status.error && (
        <div className={styles.errorLine}>{'  '}[ERROR] {status.error}</div>
      )}

      <div className={styles.hint}>
        {'  '}[bun ws server — dashscope asr + llm + tts pipeline]
      </div>
    </div>
  );
}
