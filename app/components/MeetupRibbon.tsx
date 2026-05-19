'use client';

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

interface MeetupRibbonProps {
  num: number;
  date: string;
  title: string;
}

export default function MeetupRibbon({ num, date, title }: MeetupRibbonProps) {
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', gap: 'clamp(8px, 2vw, 14px)',
      flexWrap: 'wrap',
      paddingBottom: 8, marginBottom: 12,
      borderBottom: '1px dashed rgba(0,255,0,0.25)',
    }}>
      <span style={{
        color: mpColors.gold, textShadow: mpColors.goldGlow,
        fontWeight: 700, fontSize: 'clamp(0.96rem, 2.8vw, 1.15rem)',
        border: '1px solid rgba(255,215,0,0.45)',
        padding: '2px 8px', whiteSpace: 'nowrap',
      }}>#{String(num).padStart(2, '0')}</span>
      <span style={{
        color: mpColors.greenMute, fontSize: '0.74rem',
        whiteSpace: 'nowrap', letterSpacing: '0.06em',
        textShadow: 'none',
      }}>{date}</span>
      <span style={{
        color: mpColors.green, textShadow: mpColors.glowStrong,
        fontWeight: 700, fontSize: 'clamp(1rem, 3vw, 1.2rem)',
        lineHeight: 1.25, flex: '1 1 200px', minWidth: 0,
      }}>{title}</span>
    </div>
  );
}
