'use client';

import type { Speaker } from '@/app/lib/sections';

const mpColors = {
  green:      '#00FF00',
  greenDim:   'rgba(0,255,0,0.78)',
  greenMute:  'rgba(0,255,0,0.55)',
  greenFaint: 'rgba(0,255,0,0.38)',
  gold:       '#FFD700',
  red:        '#FF4444',
  glow:       '0 0 4px rgba(0,255,0,0.4), 0 0 8px rgba(0,255,0,0.2)',
  glowStrong: '0 0 6px rgba(0,255,0,0.55), 0 0 14px rgba(0,255,0,0.25)',
  goldGlow:   '0 0 4px rgba(255,215,0,0.45), 0 0 8px rgba(255,215,0,0.22)',
};

interface SpeakersBlockProps {
  speakers: Speaker[];
}

export default function SpeakersBlock({ speakers }: SpeakersBlockProps) {
  if (!speakers || speakers.length === 0) return null;
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{
        color: mpColors.greenFaint,
        fontSize: '0.7rem', letterSpacing: '0.1em',
        textShadow: 'none', marginBottom: 6,
      }}>
        SPEAKERS [{speakers.length}]
      </div>
      <div style={{
        display: 'flex', flexDirection: 'column',
        background: '#000',
        border: '1px solid rgba(0,255,0,0.22)',
      }}>
        {speakers.map((sp, i) => {
          const last = i === speakers.length - 1;
          const hasLinkedin = !!sp.linkedin && sp.linkedin.trim() !== '' && sp.linkedin !== 'https://www.linkedin.com/in/';
          return (
            <div key={i} style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) auto',
              columnGap: 'clamp(8px, 2vw, 14px)',
              alignItems: 'center',
              padding: '8px clamp(8px, 2vw, 12px)',
              borderBottom: last ? 'none' : '1px dashed rgba(0,255,0,0.12)',
              fontSize: 'clamp(0.74rem, 1.9vw, 0.82rem)',
            }}>
              <div style={{ minWidth: 0, lineHeight: 1.45 }}>
                <span style={{
                  color: mpColors.green, textShadow: mpColors.glow,
                  fontWeight: 700, whiteSpace: 'nowrap',
                }}>{sp.name}</span>
                <span style={{
                  color: mpColors.greenFaint, textShadow: 'none',
                  margin: '0 8px',
                }}>│</span>
                <span style={{
                  color: mpColors.greenDim, textShadow: 'none',
                }}>{sp.role}</span>
              </div>
              {hasLinkedin && (
                <a href={sp.linkedin} target="_blank" rel="noreferrer"
                  className="kni-tappable"
                  style={{
                    color: mpColors.gold, textShadow: mpColors.goldGlow,
                    textDecoration: 'none',
                    fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em',
                    border: '1px solid rgba(255,215,0,0.45)',
                    padding: '3px 8px', whiteSpace: 'nowrap',
                  }}>in ↗</a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
