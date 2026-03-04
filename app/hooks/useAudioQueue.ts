'use client';

import { useCallback, useRef } from 'react';

type QueueState = 'idle' | 'playing';

interface UseAudioQueueOptions {
  onStateChange?: (state: QueueState) => void;
}

export function useAudioQueue({ onStateChange }: UseAudioQueueOptions = {}) {
  const ctxRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeCountRef = useRef<number>(0);

  const getCtx = (): AudioContext => {
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new AudioContext();
      nextStartTimeRef.current = 0;
    }
    return ctxRef.current;
  };

  const enqueue = useCallback(
    async (wavArrayBuffer: ArrayBuffer) => {
      const ctx = getCtx();

      let audioBuffer: AudioBuffer;
      try {
        audioBuffer = await ctx.decodeAudioData(wavArrayBuffer);
      } catch (err) {
        console.error('[AudioQueue] decode error:', err);
        return;
      }

      const now = ctx.currentTime;
      // Schedule 50ms ahead minimum to avoid glitches
      const startAt = Math.max(nextStartTimeRef.current, now + 0.05);
      nextStartTimeRef.current = startAt + audioBuffer.duration;

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);

      activeCountRef.current += 1;
      onStateChange?.('playing');

      source.onended = () => {
        activeCountRef.current = Math.max(0, activeCountRef.current - 1);
        if (activeCountRef.current === 0) {
          onStateChange?.('idle');
        }
      };

      source.start(startAt);
    },
    [onStateChange]
  );

  const stop = useCallback(() => {
    if (ctxRef.current) {
      ctxRef.current.close();
      ctxRef.current = null;
    }
    nextStartTimeRef.current = 0;
    activeCountRef.current = 0;
    onStateChange?.('idle');
  }, [onStateChange]);

  return { enqueue, stop };
}
