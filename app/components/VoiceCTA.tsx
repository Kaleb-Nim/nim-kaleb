'use client';

import { useEffect, useState } from 'react';

interface VoiceCTAProps {
  onActivate?: () => void;
}

export default function VoiceCTA({ onActivate }: VoiceCTAProps) {
  const [showNudge, setShowNudge] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('kni-voice-nudge-seen');
    if (!seen) {
      setShowNudge(true);
      localStorage.setItem('kni-voice-nudge-seen', '1');
    }
  }, []);

  const handleActivate = () => {
    setShowNudge(false);
    onActivate?.();
  };

  return (
    <div
      style={{
        border: '1px solid rgba(0,255,0,0.25)',
        borderLeft: '3px solid #00FF00',
        background: 'rgba(0,255,0,0.04)',
        padding: 'clamp(14px, 3vw, 20px)',
        fontFamily: '"Anonymous Pro", monospace',
        margin: '14px 0 18px',
        animation: showNudge ? 'kniCTAEntrance 600ms ease-out both' : 'none',
      }}
    >
      {/* Header */}
      <div style={{
        color: '#00FF00',
        fontSize: 'clamp(0.72rem, 2vw, 0.82rem)',
        fontWeight: 700,
        textShadow: '0 0 6px rgba(0,255,0,0.55), 0 0 14px rgba(0,255,0,0.25)',
        marginBottom: 8,
      }}>
        [VOICE INTERFACE] <span style={{ color: '#27C93F' }}>● ONLINE</span>
      </div>

      {/* Body */}
      <div style={{
        color: 'rgba(0,255,0,0.7)',
        fontSize: 'clamp(0.74rem, 2vw, 0.82rem)',
        lineHeight: 1.6,
        marginBottom: 12,
      }}>
        Talk to my AI voice clone — it knows my work, my projects, and answers like I would.
      </div>

      {/* Action */}
      <button
        onClick={handleActivate}
        style={{
          background: 'none',
          border: 'none',
          color: '#FFD700',
          textShadow: '0 0 4px rgba(255,215,0,0.55), 0 0 8px rgba(255,215,0,0.3)',
          fontFamily: '"Anonymous Pro", monospace',
          fontSize: 'clamp(0.78rem, 2vw, 0.88rem)',
          fontWeight: 700,
          cursor: 'pointer',
          padding: '8px 0',
          letterSpacing: '0.04em',
        }}
      >
        ▸ start conversation
      </button>
    </div>
  );
}
