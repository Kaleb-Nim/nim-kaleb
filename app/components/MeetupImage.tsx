'use client';

import type { SyntheticEvent } from 'react';

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

interface MeetupImageProps {
  src: string | null;
  aspect?: string;
  alt?: string;
  onClick?: () => void;
  label?: string;
  dim?: boolean;
  fit?: 'cover' | 'contain';
}

export default function MeetupImage({ src, aspect, alt, onClick, label, dim, fit = 'cover' }: MeetupImageProps) {
  const ratio = aspect || '16 / 10';
  const isPlaceholder = !src;
  const interactive = !!onClick && !isPlaceholder;
  return (
    <div
      onClick={interactive ? onClick : undefined}
      className={interactive ? 'kni-meetup-img' : ''}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: ratio,
        background: '#000',
        border: '1px solid #00FF00',
        boxShadow: '0 0 0 1px rgba(0,255,0,0.18) inset, 0 0 14px rgba(0,255,0,0.18), 0 4px 14px rgba(0,0,0,0.55)',
        overflow: 'hidden',
        cursor: interactive ? 'pointer' : 'default',
        opacity: dim ? 0.85 : 1,
        WebkitTapHighlightColor: 'transparent',
      }}>
      {!isPlaceholder ? (
        <img src={src as string} alt={alt || ''}
          style={{
            width: '100%', height: '100%',
            objectFit: fit, display: 'block',
            filter: 'saturate(0.95) contrast(1.02)',
          }}
          onError={(e: SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.display = 'none'; }}
        />
      ) : (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 6, padding: 12,
          color: mpColors.greenFaint,
          textShadow: 'none',
          backgroundImage:
            'linear-gradient(rgba(0,255,0,0.05) 1px, transparent 1px), ' +
            'linear-gradient(90deg, rgba(0,255,0,0.05) 1px, transparent 1px)',
          backgroundSize: '14px 14px',
        }}>
          <div aria-hidden="true" style={{
            color: mpColors.greenMute,
            fontSize: 'clamp(1rem, 3vw, 1.4rem)',
            textShadow: mpColors.glow,
            lineHeight: 1,
          }}>[ no media ]</div>
          {label && (
            <div style={{
              color: mpColors.greenFaint,
              fontSize: '0.66rem',
              letterSpacing: '0.06em',
              textAlign: 'center',
            }}>{label}</div>
          )}
        </div>
      )}

      {interactive && (
        <div style={{
          position: 'absolute', top: 6, right: 6,
          color: mpColors.gold, textShadow: mpColors.goldGlow,
          fontSize: '0.62rem', letterSpacing: '0.08em', fontWeight: 700,
          padding: '2px 6px',
          background: 'rgba(0,0,0,0.55)',
          border: '1px solid rgba(255,215,0,0.5)',
          pointerEvents: 'none',
        }}>⛶ ZOOM</div>
      )}
    </div>
  );
}
