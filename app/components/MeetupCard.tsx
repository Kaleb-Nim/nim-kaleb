'use client';

import type { MeetupItem } from '@/app/lib/sections';
import MeetupImage from './MeetupImage';
import MeetupRibbon from './MeetupRibbon';
import SpeakersBlock from './SpeakersBlock';

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

const cardWrap = {
  background: 'rgba(0,255,0,0.025)',
  border: '1px solid rgba(0,255,0,0.22)',
  borderLeft: '3px solid rgba(0,255,0,0.55)',
  padding: 'clamp(14px, 3vw, 20px)',
  marginBottom: 18,
} as const;

interface MeetupCardProps {
  event: MeetupItem;
  cardIndex: number;
  openLightbox: (cardIdx: number, imgIdx: number) => void;
}

export default function MeetupCard({ event, cardIndex, openLightbox }: MeetupCardProps) {
  const gallery = event.gallery || [];
  return (
    <article style={cardWrap}>
      <MeetupRibbon num={event.num} date={event.date} title={event.title} />
      <div
        className="kni-meetup-2col"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.05fr)',
          gap: 'clamp(12px, 3vw, 20px)',
          alignItems: 'flex-start',
        }}>
        <MeetupImage
          src={event.hero}
          aspect="4 / 3"
          fit="contain"
          onClick={event.hero ? () => openLightbox(cardIndex, 0) : undefined}
          label="hero photo"
        />
        <div style={{ minWidth: 0 }}>
          {event.desc && (
            <div style={{
              color: mpColors.green,
              fontSize: 'clamp(0.78rem, 2vw, 0.86rem)',
              lineHeight: 1.65,
              textShadow: '0 0 4px rgba(0,255,0,0.25), 0 0 8px rgba(0,255,0,0.1)',
              marginTop: 4,
            }}>
              {event.desc}
            </div>
          )}
        </div>
      </div>
      <SpeakersBlock speakers={event.speakers} />
      {gallery.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gallery.length}, 1fr)`,
          gap: 8,
          marginTop: 12,
        }}>
          {gallery.map((src, i) => (
            <MeetupImage
              key={i}
              src={src}
              aspect="1 / 1"
              onClick={src ? () => openLightbox(cardIndex, i + 1) : undefined}
              label={`thumb ${i + 1}`}
              dim
            />
          ))}
        </div>
      )}
      {event.signup && (
        <a
          href={event.signup}
          target="_blank"
          rel="noreferrer"
          style={{
            marginTop: 10,
            display: 'inline-block',
            color: mpColors.gold,
            textShadow: mpColors.goldGlow,
            border: '1px solid rgba(255,215,0,0.45)',
            padding: '4px 10px',
            fontSize: '0.74rem',
            letterSpacing: '0.06em',
            fontWeight: 700,
            textDecoration: 'none',
          }}>SIGN UP ↗</a>
      )}
    </article>
  );
}
