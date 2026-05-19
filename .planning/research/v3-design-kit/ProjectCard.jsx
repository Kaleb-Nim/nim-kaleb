// ProjectCard.jsx — 3 visual variations, all terminal-native
// Variation controlled via props.variant: 'ascii-frame' | 'split' | 'log-entry'

const pcStyles = {
  goldLink: {
    color: '#FFD700', textDecoration: 'none',
    textShadow: '0 0 4px rgba(255,215,0,0.4), 0 0 8px rgba(255,215,0,0.2)',
    whiteSpace: 'nowrap',
  },
  meta: { opacity: 0.7, fontSize: '0.75rem', whiteSpace: 'nowrap' },
  hint: { opacity: 0.45, fontSize: '0.72rem', whiteSpace: 'nowrap' },
  dashedTop: {
    borderTop: '1px dashed rgba(0,255,0,0.55)',
    boxShadow: '0 -1px 6px rgba(0,255,0,0.15)',
    height: 0, margin: 0,
  },
  dashedBot: {
    borderBottom: '1px dashed rgba(0,255,0,0.55)',
    boxShadow: '0 1px 6px rgba(0,255,0,0.15)',
    height: 0, margin: 0,
  },
};

// ── Shared: image carousel (2–4 images, auto-advance + manual dots) ─────────
function ImageCarousel({ images, aspect = '16 / 9' }) {
  const [idx, setIdx] = React.useState(0);
  React.useEffect(() => {
    if (images.length <= 1) return;
    const t = setInterval(() => setIdx(i => (i + 1) % images.length), 2800);
    return () => clearInterval(t);
  }, [images.length]);

  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: aspect, background: '#010810', overflow: 'hidden' }}>
      {images.map((img, i) => (
        <div key={i} style={{
          position: 'absolute', inset: 0,
          opacity: i === idx ? 1 : 0,
          transition: 'opacity 400ms ease-out',
          background: img.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(0,255,0,0.55)', fontFamily: '"Anonymous Pro", monospace',
          fontSize: '0.7rem', letterSpacing: '0.05em',
          boxShadow: 'inset 0 0 80px rgba(0,255,0,0.08), inset 0 0 0 1px rgba(0,255,0,0.15)',
        }}>
          <span style={{ textShadow: '0 0 6px rgba(0,255,0,0.4)', whiteSpace: 'nowrap' }}>{img.label}</span>
        </div>
      ))}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,255,0,0.035) 0px, rgba(0,255,0,0.035) 1px, transparent 1px, transparent 3px)',
      }}></div>
      {images.length > 1 && (
        <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
          {images.map((_, i) => (
            <button key={i} onClick={(e) => { e.stopPropagation(); setIdx(i); }}
              style={{
                width: 18, height: 4, border: 'none', padding: 0, cursor: 'pointer',
                background: i === idx ? '#00FF00' : 'rgba(0,255,0,0.25)',
                boxShadow: i === idx ? '0 0 6px rgba(0,255,0,0.6)' : 'none',
              }} aria-label={`Image ${i+1}`} />
          ))}
        </div>
      )}
      <div style={{ position: 'absolute', top: 6, right: 8, color: 'rgba(0,255,0,0.6)', fontFamily: '"Anonymous Pro", monospace', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>
        [{idx + 1}/{images.length}]
      </div>
    </div>
  );
}

function LinkRow({ links }) {
  return (
    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: '0.78rem' }}>
      {links.map((l, i) => (
        <a key={i} href={l.href} onClick={e => e.stopPropagation()} style={pcStyles.goldLink}
           className="kni-gold-link">
          [{l.label}]
        </a>
      ))}
    </div>
  );
}

// ── Variation A: Dashed-frame card (was ascii-frame) ────────────────────────
function ProjectCardAsciiFrame({ p, onClose }) {
  return (
    <div className="kni-project-card kni-card-ascii" onClick={() => window.open(p.caseStudy, '_blank')}>
      <div style={pcStyles.dashedTop}></div>
      <div style={{ padding: '14px 16px 6px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, minWidth: 0 }}>
          <div style={{
            fontSize: '1rem', fontWeight: 700, color: '#00FF00',
            textShadow: '0 0 4px rgba(0,255,0,0.5), 0 0 10px rgba(0,255,0,0.25)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0, flex: '1 1 auto',
          }}>
            ./{p.slug}
          </div>
          <div style={{ ...pcStyles.meta, flex: '0 0 auto' }}>{p.dateRange}</div>
        </div>
        <div style={{ ...pcStyles.hint, marginTop: 2 }}>[PROJECT] · [{p.status}]</div>
      </div>
      <div style={{ padding: '6px 16px' }}>
        <ImageCarousel images={p.images} />
      </div>
      <div style={{ padding: '12px 16px 8px', color: '#00FF00', fontSize: '0.82rem', textShadow: '0 0 4px rgba(0,255,0,0.4), 0 0 8px rgba(0,255,0,0.2)' }}>
        {p.description}
      </div>
      <div style={{ padding: '4px 16px 14px' }}>
        <LinkRow links={p.links} />
      </div>
      <div style={pcStyles.dashedBot}></div>
      {onClose && <CloseButton onClose={onClose} />}
    </div>
  );
}

// ── Variation B: Split — image left, text right ─────────────────────────────
function ProjectCardSplit({ p, onClose }) {
  return (
    <div className="kni-project-card kni-card-split" onClick={() => window.open(p.caseStudy, '_blank')}>
      <div style={{ display: 'grid', gridTemplateColumns: '260px minmax(0, 1fr)', gap: 18, padding: 18, alignItems: 'stretch' }}>
        <div style={{ minHeight: 160 }}>
          <ImageCarousel images={p.images} aspect="1 / 1" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
          <div style={pcStyles.hint}>[PROJECT_{String(p.id).padStart(3,'0')}] · [{p.status}]</div>
          <div style={{
            fontSize: '1.1rem', fontWeight: 700, color: '#00FF00',
            textShadow: '0 0 6px rgba(0,255,0,0.6), 0 0 14px rgba(0,255,0,0.3)',
            lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {p.title}
          </div>
          <div style={pcStyles.meta}>{p.dateRange}</div>
          <div style={{ color: '#00FF00', fontSize: '0.8rem', textShadow: '0 0 4px rgba(0,255,0,0.4), 0 0 8px rgba(0,255,0,0.2)', lineHeight: 1.7, marginTop: 4 }}>
            {p.description}
          </div>
          <div style={{ marginTop: 'auto', paddingTop: 10 }}>
            <LinkRow links={p.links} />
          </div>
        </div>
      </div>
      {onClose && <CloseButton onClose={onClose} />}
    </div>
  );
}

// ── Variation C: Terminal log entry ─────────────────────────────────────────
function ProjectCardLogEntry({ p, onClose }) {
  return (
    <div className="kni-project-card kni-card-log" onClick={() => window.open(p.caseStudy, '_blank')}>
      <div style={{
        padding: '14px 18px 4px', color: '#00FF00', fontSize: '0.78rem',
        textShadow: '0 0 4px rgba(0,255,0,0.4), 0 0 8px rgba(0,255,0,0.2)',
        fontFamily: '"Anonymous Pro", monospace',
        display: 'flex', gap: 16, alignItems: 'baseline', flexWrap: 'wrap',
      }}>
        <span style={{ color: 'rgba(0,255,0,0.55)', whiteSpace: 'nowrap' }}>{p.dateRange}</span>
        <span style={{ color: '#FFD700', textShadow: '0 0 4px rgba(255,215,0,0.4)', whiteSpace: 'nowrap' }}>[{p.status}]</span>
        <span style={pcStyles.hint}>PROJECT_{String(p.id).padStart(3,'0')}</span>
      </div>
      <div style={{ padding: '4px 18px 0' }}>
        <div style={{
          fontSize: '1.05rem', fontWeight: 700, color: '#00FF00',
          textShadow: '0 0 6px rgba(0,255,0,0.55), 0 0 14px rgba(0,255,0,0.28)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          &gt; {p.title}
        </div>
      </div>
      <div style={{ padding: '10px 18px 6px' }}>
        <ImageCarousel images={p.images} aspect="21 / 9" />
      </div>
      <div style={{ padding: '2px 18px 16px', color: '#00FF00', fontSize: '0.82rem', textShadow: '0 0 4px rgba(0,255,0,0.4), 0 0 8px rgba(0,255,0,0.2)', lineHeight: 1.75 }}>
        {p.description}
      </div>
      <div style={{ padding: '0 18px 14px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <span style={pcStyles.hint}>$</span>
        <LinkRow links={p.links} />
      </div>
      {onClose && <CloseButton onClose={onClose} />}
    </div>
  );
}

function CloseButton({ onClose }) {
  return (
    <button onClick={(e) => { e.stopPropagation(); onClose(); }}
      aria-label="Close card"
      style={{
        position: 'absolute', top: 10, right: 12,
        background: 'transparent', border: 'none',
        color: 'rgba(0,255,0,0.55)', cursor: 'pointer',
        fontFamily: '"Anonymous Pro", monospace', fontSize: '0.85rem',
        textShadow: '0 0 4px rgba(0,255,0,0.4)',
      }}>[x]</button>
  );
}

function ProjectCard({ p, variant = 'ascii-frame', onClose }) {
  if (variant === 'split') return <ProjectCardSplit p={p} onClose={onClose} />;
  if (variant === 'log-entry') return <ProjectCardLogEntry p={p} onClose={onClose} />;
  return <ProjectCardAsciiFrame p={p} onClose={onClose} />;
}

window.ProjectCard = ProjectCard;
window.ImageCarousel = ImageCarousel;
