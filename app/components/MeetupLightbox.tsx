'use client';

import { useEffect, useMemo, useState } from 'react';
import type { MeetupItem } from '@/app/lib/sections';

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

export type LightboxOpen = { cardIdx: number; imgIdx: number } | null;

interface MeetupLightboxProps {
  items: MeetupItem[];
  open: LightboxOpen;
  onClose: () => void;
}

interface FlatEntry { ci: number; ii: number; src: string; event: MeetupItem; }

export default function MeetupLightbox({ items, open, onClose }: MeetupLightboxProps) {
  const [cur, setCur] = useState<LightboxOpen>(open);
  useEffect(() => { setCur(open); }, [open]);

  const flat = useMemo<FlatEntry[]>(() => {
    const out: FlatEntry[] = [];
    items.forEach((ev, ci) => {
      const all: Array<string | null> = [ev.hero, ...(ev.gallery || [])];
      all.forEach((src, ii) => {
        if (src) out.push({ ci, ii, src, event: ev });
      });
    });
    return out;
  }, [items]);

  const flatIdx = useMemo(() => {
    if (!cur) return -1;
    return flat.findIndex(f => f.ci === cur.cardIdx && f.ii === cur.imgIdx);
  }, [cur, flat]);

  useEffect(() => {
    if (!cur) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight' && flat.length > 0) {
        const next = flat[(Math.max(flatIdx, 0) + 1) % flat.length];
        setCur({ cardIdx: next.ci, imgIdx: next.ii });
      } else if (e.key === 'ArrowLeft' && flat.length > 0) {
        const prev = flat[(Math.max(flatIdx, 0) - 1 + flat.length) % flat.length];
        setCur({ cardIdx: prev.ci, imgIdx: prev.ii });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cur, flat, flatIdx, onClose]);

  if (!cur) return null;
  const f = flatIdx >= 0 ? flat[flatIdx] : null;
  if (!f) return null;

  const go = (delta: number) => {
    if (flat.length === 0) return;
    const next = flat[(flatIdx + delta + flat.length) % flat.length];
    setCur({ cardIdx: next.ci, imgIdx: next.ii });
  };

  return (
    <div onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        background: 'rgba(1,8,16,0.92)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(20px, 4vw, 56px)',
        animation: 'kniPanelOpen 200ms ease-out both',
      }}>
      {/* Caption */}
      <div style={{
        position: 'absolute', top: 16, left: 16, right: 16,
        display: 'flex', justifyContent: 'space-between',
        gap: 12, flexWrap: 'wrap',
        fontFamily: '"Anonymous Pro", monospace',
      }}>
        <div style={{
          color: mpColors.green, textShadow: mpColors.glow,
          fontSize: '0.84rem', fontWeight: 700,
        }}>
          <span style={{ color: mpColors.gold, textShadow: mpColors.goldGlow }}>
            #{String(f.event.num).padStart(2, '0')}
          </span>
          {' · '}
          <span>{f.event.title}</span>
          <span style={{ color: mpColors.greenMute, fontWeight: 400, marginLeft: 8 }}>
            ({f.event.date})
          </span>
        </div>
        <div style={{
          color: mpColors.greenFaint, fontSize: '0.74rem',
          textShadow: 'none', letterSpacing: '0.06em',
        }}>
          {flatIdx + 1} / {flat.length} · ← → to navigate · Esc to close
        </div>
      </div>

      {/* Close */}
      <button onClick={(e) => { e.stopPropagation(); onClose(); }}
        aria-label="Close lightbox"
        style={{
          position: 'absolute', top: 12, right: 12,
          background: 'transparent', border: '1px solid rgba(255,215,0,0.55)',
          color: mpColors.gold, textShadow: mpColors.goldGlow,
          fontFamily: '"Anonymous Pro", monospace',
          fontSize: '0.9rem', fontWeight: 700,
          padding: '2px 10px', cursor: 'pointer',
        }}>✕</button>

      {/* Prev */}
      <button onClick={(e) => { e.stopPropagation(); go(-1); }}
        aria-label="Previous"
        style={{
          position: 'absolute', left: 'clamp(8px, 2vw, 24px)', top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(0,255,0,0.45)',
          color: mpColors.green, textShadow: mpColors.glow,
          fontFamily: '"Anonymous Pro", monospace',
          fontSize: '1.2rem', fontWeight: 700,
          padding: '8px 14px', cursor: 'pointer',
        }}>‹</button>

      {/* Image */}
      <div onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 'min(1100px, 92vw)',
          maxHeight: '84vh',
          background: '#000',
          border: '1px solid rgba(0,255,0,0.55)',
          boxShadow: '0 0 30px rgba(0,255,0,0.25), 0 25px 60px rgba(0,0,0,0.7)',
          padding: 4,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
        <img src={f.src} alt=""
          style={{
            maxWidth: '100%', maxHeight: '80vh',
            display: 'block',
            filter: 'saturate(0.95) contrast(1.02)',
          }} />
      </div>

      {/* Next */}
      <button onClick={(e) => { e.stopPropagation(); go(1); }}
        aria-label="Next"
        style={{
          position: 'absolute', right: 'clamp(8px, 2vw, 24px)', top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(0,255,0,0.45)',
          color: mpColors.green, textShadow: mpColors.glow,
          fontFamily: '"Anonymous Pro", monospace',
          fontSize: '1.2rem', fontWeight: 700,
          padding: '8px 14px', cursor: 'pointer',
        }}>›</button>
    </div>
  );
}
