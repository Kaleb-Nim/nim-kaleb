'use client';

// FloatingMic.tsx — persistent voice CTA bottom-right on every route.
// Idle: gold border + idle glow + "● talk to me". Active: red border + "■ voice live" + pulse.
// <520px: shows short label "voice"/"live" via matchMedia hook.
// First visit: tooltip above button auto-dismisses after 6s (shares key with VoiceCTA).

import { useEffect, useState, useCallback } from 'react';

const NUDGE_KEY = 'kni-voice-nudge-seen';

const fmStyles = {
  gold: '#FFD700',
  red: '#FF4444',
  bg: '#000',
} as const;

interface FloatingMicProps {
  active: boolean;
  onToggle: () => void;
}

export default function FloatingMic({ active, onToggle }: FloatingMicProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);

  // ── First-visit tooltip (shares localStorage key with VoiceCTA) ──
  useEffect(() => {
    const seen = localStorage.getItem(NUDGE_KEY);
    if (!seen) {
      setShowTooltip(true);
      const timer = setTimeout(() => {
        setShowTooltip(false);
        localStorage.setItem(NUDGE_KEY, '1');
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, []);

  // ── Responsive label: short on narrow screens ──
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 520px)');
    setIsNarrow(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsNarrow(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  // ── Dismiss tooltip on click ──
  const handleClick = useCallback(() => {
    if (showTooltip) {
      setShowTooltip(false);
      localStorage.setItem(NUDGE_KEY, '1');
    }
    onToggle();
  }, [showTooltip, onToggle]);

  // ── Label text based on viewport width ──
  const labelText = active
    ? (isNarrow ? 'live' : 'voice live')
    : (isNarrow ? 'voice' : 'talk to me');

  return (
    <>
      {/* First-visit tooltip */}
      {showTooltip && !active && (
        <div
          style={{
            position: 'fixed',
            bottom: 'calc(max(18px, env(safe-area-inset-bottom, 18px)) + 58px)',
            right: 'max(18px, env(safe-area-inset-right, 18px))',
            zIndex: 31,
            background: '#000',
            border: '1px solid rgba(255,215,0,0.5)',
            color: '#FFD700',
            fontFamily: '"Anonymous Pro", monospace',
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '8px 12px',
            whiteSpace: 'nowrap' as const,
            boxShadow: '0 0 12px rgba(255,215,0,0.2)',
            animation: 'kniFadeIn 400ms ease-out both',
            opacity: 0,
            borderRadius: 6,
            letterSpacing: '0.03em',
            textShadow: '0 0 4px rgba(255,215,0,0.4)',
          }}
        >
          Talk to my AI clone
        </div>
      )}

      <button
        onClick={handleClick}
        aria-label={active ? 'Close voice panel' : "Open voice — talk to Kaleb's AI clone"}
        className="kni-floating-mic"
        style={{
          position: 'fixed',
          bottom: 'max(18px, env(safe-area-inset-bottom, 18px))',
          right: 'max(18px, env(safe-area-inset-right, 18px))',
          zIndex: 30,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 18px',
          background: active ? fmStyles.bg : 'rgba(255,215,0,0.06)',
          border: `2px solid ${active ? fmStyles.red : fmStyles.gold}`,
          borderRadius: 999,
          color: active ? fmStyles.red : fmStyles.gold,
          textShadow: active
            ? '0 0 6px rgba(255,68,68,0.7)'
            : '0 0 4px rgba(255,215,0,0.55), 0 0 8px rgba(255,215,0,0.3)',
          boxShadow: active
            ? '0 0 16px rgba(255,68,68,0.45), 0 12px 28px rgba(0,0,0,0.55)'
            : '0 0 14px rgba(255,215,0,0.35), 0 12px 28px rgba(0,0,0,0.55)',
          cursor: 'pointer',
          fontFamily: '"Anonymous Pro", monospace',
          fontSize: '0.82rem',
          fontWeight: 700,
          letterSpacing: '0.04em',
          animation: active
            ? 'kniFloatPulse 1.4s ease-in-out infinite'
            : 'kniMicIdle 3s ease-in-out infinite',
          transition: 'transform 120ms ease-out, border-color 120ms ease-out',
          WebkitTapHighlightColor: 'transparent',
          minWidth: 44,
          minHeight: 44,
        }}
      >
        <span aria-hidden="true" style={{ fontSize: '1.05rem', lineHeight: 1 }}>
          {active ? '■' : '●'}
        </span>
        <span className="kni-floating-mic-label">
          {labelText}
        </span>
      </button>
    </>
  );
}
