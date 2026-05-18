'use client';

import { useEffect, useRef } from 'react';
import VoiceInterface from './VoiceInterface';

export default function VoiceOverlay({ onClose }: { onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // Capture opener + move focus to close button on open; restore on close.
  useEffect(() => {
    previouslyFocusedRef.current = (document.activeElement as HTMLElement) ?? null;
    // Defer to next frame so the inner button is mounted.
    const id = requestAnimationFrame(() => {
      const closeBtn = panelRef.current?.querySelector<HTMLButtonElement>('[data-overlay-close]');
      closeBtn?.focus();
    });
    return () => {
      cancelAnimationFrame(id);
      previouslyFocusedRef.current?.focus?.();
    };
  }, []);

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Voice conversation with Kaleb's AI clone"
      style={{
        position: 'fixed', inset: 0, zIndex: 25,
        background: 'rgba(1,8,16,0.78)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        padding: '20px 16px calc(100px + env(safe-area-inset-bottom, 0px))',
        animation: 'kniPanelOpen 200ms ease-out both',
      }}
    >
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#000',
          maxWidth: 720,
          width: '100%',
          border: '1px solid rgba(255,215,0,0.4)',
          boxShadow: '0 0 24px rgba(255,215,0,0.18), 0 25px 60px rgba(0,0,0,0.7)',
          borderRadius: 6,
          padding: 18,
        }}
      >
        <VoiceInterface mode="overlay" onClose={onClose} />
      </div>
    </div>
  );
}
