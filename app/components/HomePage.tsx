'use client';

// HomePage.tsx — content rendered for the home route (route === '').
// Ported verbatim from .planning/research/v3-design-kit/index.html (lines 127-186).
//
// Composition:
//   Block 1 — Identity header (name @ handle + Operating Model line)
//   Block 2 — Quick-bar (LINKS) — labels collapse <481px via .quick-label rule
//   Block 3 — Internship banner (verbatim string)
//   Block 4 — <Directory rows={SECTIONS} onNav={navigateTo} />
//   Block 5 — Affordance hint

import Directory from './Directory';
import VoiceCTA from './VoiceCTA';
import { LINKS, SECTIONS } from '@/app/lib/sections';
import { navigateTo } from '@/app/hooks/useHashRoute';

interface HomePageProps {
  onVoiceOpen?: () => void;
}

export default function HomePage({ onVoiceOpen }: HomePageProps) {
  return (
    <div className="kni-page">
      {/* Block 1 — Identity */}
      <div>
        <div style={{
          color: '#00FF00', fontSize: 'clamp(1.05rem, 3.5vw, 1.2rem)', fontWeight: 700,
          textShadow: '0 0 6px rgba(0,255,0,0.55), 0 0 14px rgba(0,255,0,0.25)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          Kaleb Nim
          <span style={{ color: 'rgba(0,255,0,0.55)', fontWeight: 400 }}> @ </span>
          <span style={{ color: 'rgba(0,255,0,0.85)', fontWeight: 400 }}>kebab-neural-interface</span>
          <span className="kni-blink" style={{ color: '#FFFFFF', marginLeft: 4 }}>█</span>
        </div>
        <div style={{
          color: 'rgba(0,255,0,0.7)', fontSize: 'clamp(0.74rem, 2vw, 0.82rem)',
          textShadow: 'none', marginTop: 4,
        }}>
          AI engineer · Singapore · Operating Model{' '}
          <span style={{ color: '#FFD700', textShadow: '0 0 4px rgba(255,215,0,0.4)' }}>kaleb-nim-400b-0706</span>
        </div>
      </div>

      {/* Block 2 — Quick-bar */}
      <div className="quick-bar" style={{
        display: 'flex', flexWrap: 'wrap', gap: '2px 12px',
        fontSize: 'clamp(0.72rem, 1.8vw, 0.8rem)',
        color: 'rgba(0,255,0,0.7)',
        padding: '12px 0 0',
      }}>
        {LINKS.map((l, i) => {
          const glyph = l.href.startsWith('mailto:') ? ''
            : l.href.endsWith('.pdf') ? ' ⬇'
            : ' ↗';
          return (
            <span key={i} style={{ whiteSpace: 'nowrap' }}>
              <span className="quick-label" style={{ color: 'rgba(0,255,0,0.5)' }}>{l.label}: </span>
              <a href={l.href} target={l.href.startsWith('mailto:') ? undefined : '_blank'} rel="noreferrer">
                [{l.value}]{glyph && <span className="quick-glyph">{glyph}</span>}
              </a>
            </span>
          );
        })}
      </div>

      {/* Block 3 — Internship banner */}
      <div className="kni-banner-row">
        LOOKING FOR AI ENGINEERING INTERNSHIPS — STARTING AUG 2026
      </div>

      {/* Block 3.5 — Voice CTA */}
      <VoiceCTA onActivate={onVoiceOpen} />

      {/* Block 4 — Directory */}
      <Directory rows={SECTIONS} onNav={navigateTo} />

      {/* Block 5 — Affordance hint */}
      <div style={{
        marginTop: 14,
        color: 'rgba(0,255,0,0.4)', fontSize: '0.7rem',
        textShadow: 'none', letterSpacing: '0.04em',
        textAlign: 'center',
      }}>
        ‹ tap any row above to open a section ·
        tap <span style={{ color: '#FFD700', textShadow: '0 0 4px rgba(255,215,0,0.4)' }}>● talk to me</span> to chat with my voice clone ›
      </div>
    </div>
  );
}
