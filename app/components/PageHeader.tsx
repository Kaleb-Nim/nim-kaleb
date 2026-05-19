'use client';

import type { Section } from '@/app/lib/sections';

const pgStyles = {
  green:      '#00FF00',
  greenDim:   'rgba(0,255,0,0.78)',
  greenMute:  'rgba(0,255,0,0.55)',
  greenFaint: 'rgba(0,255,0,0.38)',
  gold:       '#FFD700',
  red:        '#FF4444',
  glow:       '0 0 4px rgba(0,255,0,0.4), 0 0 8px rgba(0,255,0,0.2)',
  goldGlow:   '0 0 4px rgba(255,215,0,0.45), 0 0 8px rgba(255,215,0,0.22)',
};

// Parses `[label](href)` inline markdown links — used only for the intro line.
function renderIntroWithLinks(text: string) {
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  const out: Array<string | React.ReactElement> = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const [, label, href] = m;
    out.push(
      <a
        key={`${href}-${m.index}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: pgStyles.gold,
          textShadow: pgStyles.goldGlow,
          textDecoration: 'underline',
          fontWeight: 700,
        }}
      >
        {label}
      </a>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export default function PageHeader({ section }: { section: Section }) {
  return (
    <div style={{ fontFamily: '"Anonymous Pro", monospace' }}>
      {/* Breadcrumb */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 'clamp(0.74rem, 1.8vw, 0.8rem)',
        color: pgStyles.greenFaint, textShadow: 'none',
        marginBottom: 14, flexWrap: 'wrap',
      }}>
        <a href="#/" className="kni-crumb-home" style={{
          color: pgStyles.gold,
          textShadow: pgStyles.goldGlow,
          textDecoration: 'none',
          fontWeight: 700,
          padding: '4px 8px',
          border: '1px solid rgba(255,215,0,0.45)',
          borderRadius: 4,
        }}>
          ← ~/kaleb
        </a>
        <span style={{ color: pgStyles.greenFaint }}>/</span>
        <span style={{ color: pgStyles.green, textShadow: pgStyles.glow, fontWeight: 700 }}>
          {section.path}
        </span>
      </div>

      {/* Title block */}
      <div style={{
        color: pgStyles.green,
        fontSize: 'clamp(1.15rem, 4vw, 1.5rem)',
        fontWeight: 700,
        textShadow: '0 0 6px rgba(0,255,0,0.6), 0 0 14px rgba(0,255,0,0.3)',
        lineHeight: 1.25,
      }}>
        {section.title}
      </div>
      {section.intro && (
        <div style={{
          color: pgStyles.greenDim,
          fontSize: 'clamp(0.78rem, 2vw, 0.86rem)',
          textShadow: 'none',
          marginTop: 6,
          lineHeight: 1.55,
          maxWidth: 620,
        }}>
          {renderIntroWithLinks(section.intro)}
        </div>
      )}

      {/* Count chip */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        marginTop: 12,
        color: pgStyles.gold, textShadow: pgStyles.goldGlow,
        fontSize: '0.76rem', fontWeight: 700, letterSpacing: '0.06em',
        border: '1px solid rgba(255,215,0,0.4)',
        padding: '3px 10px',
      }}>
        [{section.count} entries]
      </div>

      {/* Divider */}
      <div style={{
        height: 1, margin: '16px 0',
        background: 'linear-gradient(90deg, rgba(0,255,0,0.45), rgba(0,255,0,0.05))',
      }} />
    </div>
  );
}

export function FooterMeta({ section }: { section: Section }) {
  return (
    <div style={{
      fontFamily: '"Anonymous Pro", monospace',
      color: pgStyles.greenFaint, textShadow: 'none',
      fontSize: '0.72rem', marginTop: 18, letterSpacing: '0.04em',
    }}>
      {section.footer || `[${section.count} entries]`} · ‹ tap{' '}
      <a href="#/" style={{ color: pgStyles.gold, textShadow: pgStyles.goldGlow, textDecoration: 'underline' }}>~/kaleb</a> to return home
    </div>
  );
}
