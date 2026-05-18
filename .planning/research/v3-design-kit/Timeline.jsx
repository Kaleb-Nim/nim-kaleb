// Timeline.jsx — 3 variations, all terminal-native
// variant: 'vertical-rail' | 'ascii-tree' | 'commit-log'

const tlStyles = {
  goldLink: {
    color: '#FFD700', textDecoration: 'none',
    textShadow: '0 0 4px rgba(255,215,0,0.4), 0 0 8px rgba(255,215,0,0.2)',
    whiteSpace: 'nowrap',
  },
  dim: { color: 'rgba(0,255,0,0.55)', textShadow: 'none' },
  hint: { color: 'rgba(0,255,0,0.45)', fontSize: '0.72rem', textShadow: 'none' },
};

// Status → color + symbol
const STATUS_META = {
  SHIPPED:  { color: '#00FF00', glow: 'rgba(0,255,0,0.6)',   sym: '●' },
  ACTIVE:   { color: '#00FF00', glow: 'rgba(0,255,0,0.7)',   sym: '◉' },
  WIP:      { color: '#FFD700', glow: 'rgba(255,215,0,0.6)', sym: '◐' },
  ARCHIVED: { color: 'rgba(0,255,0,0.45)', glow: 'rgba(0,255,0,0.2)', sym: '○' },
  MILESTONE:{ color: '#FFD700', glow: 'rgba(255,215,0,0.7)', sym: '★' },
};

function statusOf(s) { return STATUS_META[s] || STATUS_META.SHIPPED; }

// ─── Variation A: Vertical rail ─────────────────────────────────────────────
// Left-side vertical phosphor line with nodes; right side: date · title · meta · description.
function TimelineVerticalRail({ items }) {
  return (
    <div style={{ position: 'relative', paddingLeft: 32 }}>
      {/* The rail */}
      <div style={{
        position: 'absolute', left: 10, top: 6, bottom: 6, width: 1,
        background: 'linear-gradient(180deg, rgba(0,255,0,0.55) 0%, rgba(0,255,0,0.25) 100%)',
        boxShadow: '0 0 6px rgba(0,255,0,0.35)',
      }}></div>
      {items.map((it, i) => {
        const s = statusOf(it.status);
        return (
          <div key={i} style={{ position: 'relative', paddingBottom: i === items.length - 1 ? 0 : 22 }}>
            {/* Node */}
            <div style={{
              position: 'absolute', left: -27, top: 4,
              width: 14, height: 14, borderRadius: '50%',
              background: '#010810',
              boxShadow: `inset 0 0 0 1.5px ${s.color}, 0 0 10px ${s.glow}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: s.color, fontSize: '0.58rem', textShadow: `0 0 4px ${s.glow}`,
            }}>{s.sym}</div>
            {/* Date */}
            <div style={{ color: 'rgba(0,255,0,0.6)', fontSize: '0.72rem', letterSpacing: '0.04em', whiteSpace: 'nowrap', textShadow: 'none' }}>
              {it.date}
            </div>
            {/* Title + status chip */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap', marginTop: 2, minWidth: 0 }}>
              <span style={{
                color: '#00FF00', fontSize: '0.95rem', fontWeight: 700,
                textShadow: '0 0 4px rgba(0,255,0,0.55), 0 0 10px rgba(0,255,0,0.25)',
              }}>{it.title}</span>
              <span style={{
                color: s.color, fontSize: '0.7rem', letterSpacing: '0.08em',
                textShadow: `0 0 4px ${s.glow}`, whiteSpace: 'nowrap',
              }}>[{it.status}]</span>
            </div>
            {/* Org / meta */}
            {it.org && (
              <div style={{ color: 'rgba(0,255,0,0.7)', fontSize: '0.78rem', marginTop: 1, textShadow: '0 0 4px rgba(0,255,0,0.3)' }}>
                {it.org}
              </div>
            )}
            {/* Description */}
            {it.description && (
              <div style={{
                color: '#00FF00', fontSize: '0.8rem', lineHeight: 1.7, marginTop: 6,
                textShadow: '0 0 4px rgba(0,255,0,0.3), 0 0 8px rgba(0,255,0,0.15)',
              }}>
                {it.description}
              </div>
            )}
            {/* Tags */}
            {it.tags && it.tags.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                {it.tags.map((t, j) => (
                  <span key={j} style={{
                    color: 'rgba(0,255,0,0.6)', fontSize: '0.7rem', whiteSpace: 'nowrap',
                    textShadow: 'none',
                  }}>#{t}</span>
                ))}
              </div>
            )}
            {/* Links */}
            {it.links && it.links.length > 0 && (
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 6, fontSize: '0.75rem' }}>
                {it.links.map((l, j) => (
                  <a key={j} href={l.href} style={tlStyles.goldLink} className="kni-gold-link">[{l.label}]</a>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Variation B: ASCII tree ────────────────────────────────────────────────
// Mimics `git log --graph` / `tree` output. Monospace grid, no real borders.
function TimelineAsciiTree({ items }) {
  return (
    <pre style={{
      margin: 0, fontFamily: '"Anonymous Pro", monospace', fontSize: '0.82rem',
      lineHeight: 1.8, color: '#00FF00',
      textShadow: '0 0 4px rgba(0,255,0,0.4), 0 0 8px rgba(0,255,0,0.2)',
      whiteSpace: 'pre-wrap', wordBreak: 'break-word',
    }}>
      {items.map((it, i) => {
        const last = i === items.length - 1;
        const s = statusOf(it.status);
        const branch = last ? '└──' : '├──';
        const cont = last ? '   ' : '│  ';
        return (
          <React.Fragment key={i}>
            <div style={{ whiteSpace: 'nowrap' }}>
              <span style={{ color: 'rgba(0,255,0,0.55)', textShadow: 'none' }}>{branch} </span>
              <span style={{ color: s.color, textShadow: `0 0 4px ${s.glow}` }}>{s.sym}</span>
              <span> </span>
              <span style={{ color: 'rgba(0,255,0,0.6)', fontSize: '0.78rem', textShadow: 'none' }}>{it.date.padEnd(18, ' ')}</span>
              <span style={{ color: '#00FF00', fontWeight: 700, textShadow: '0 0 4px rgba(0,255,0,0.55)' }}>{it.title}</span>
              <span style={{ color: s.color, marginLeft: 10, fontSize: '0.72rem', textShadow: `0 0 4px ${s.glow}` }}>[{it.status}]</span>
            </div>
            {it.org && (
              <div>
                <span style={{ color: 'rgba(0,255,0,0.55)', textShadow: 'none' }}>{cont}</span>
                <span style={{ color: 'rgba(0,255,0,0.75)', marginLeft: 6 }}>└─ {it.org}</span>
              </div>
            )}
            {it.description && (
              <div>
                <span style={{ color: 'rgba(0,255,0,0.55)', textShadow: 'none' }}>{cont}</span>
                <span style={{ color: '#00FF00', marginLeft: 6, fontSize: '0.8rem' }}>{it.description}</span>
              </div>
            )}
            {it.tags && (
              <div>
                <span style={{ color: 'rgba(0,255,0,0.55)', textShadow: 'none' }}>{cont}</span>
                <span style={{ color: 'rgba(0,255,0,0.55)', marginLeft: 6, fontSize: '0.72rem', textShadow: 'none' }}>
                  tags: {it.tags.map(t => '#' + t).join(' ')}
                </span>
              </div>
            )}
            {!last && (
              <div><span style={{ color: 'rgba(0,255,0,0.4)', textShadow: 'none' }}>│</span></div>
            )}
          </React.Fragment>
        );
      })}
    </pre>
  );
}

// ─── Variation C: Commit log ────────────────────────────────────────────────
// Mimics `git log --oneline --decorate` — each entry is a block with sha, date, author, message.
function TimelineCommitLog({ items }) {
  const sha = (i) => {
    // Deterministic 7-char hex based on index + title — terminal prop realism
    const seed = (items[i].title || '') + i;
    let h = 0;
    for (let k = 0; k < seed.length; k++) h = (h * 31 + seed.charCodeAt(k)) >>> 0;
    return h.toString(16).padStart(7, '0').slice(-7);
  };
  return (
    <div style={{
      fontFamily: '"Anonymous Pro", monospace', fontSize: '0.82rem',
      color: '#00FF00', lineHeight: 1.7,
      textShadow: '0 0 4px rgba(0,255,0,0.3), 0 0 8px rgba(0,255,0,0.15)',
    }}>
      {items.map((it, i) => {
        const s = statusOf(it.status);
        return (
          <div key={i} style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap', minWidth: 0 }}>
              <span style={{ color: '#FFD700', textShadow: '0 0 4px rgba(255,215,0,0.4)', whiteSpace: 'nowrap' }}>
                commit {sha(i)}
              </span>
              <span style={{ color: s.color, fontSize: '0.72rem', textShadow: `0 0 4px ${s.glow}`, whiteSpace: 'nowrap' }}>
                (HEAD → {it.status.toLowerCase()})
              </span>
            </div>
            <div style={{ color: 'rgba(0,255,0,0.7)', fontSize: '0.78rem', textShadow: 'none' }}>
              Author: {it.org || 'kaleb'} &lt;kaleb.nim@gmail.com&gt;
            </div>
            <div style={{ color: 'rgba(0,255,0,0.7)', fontSize: '0.78rem', textShadow: 'none' }}>
              Date:   {it.date}
            </div>
            <div style={{ marginTop: 8, marginLeft: 22, color: '#00FF00', fontWeight: 700, textShadow: '0 0 4px rgba(0,255,0,0.55)' }}>
              {it.title}
            </div>
            {it.description && (
              <div style={{ marginTop: 4, marginLeft: 22, color: '#00FF00', fontSize: '0.8rem', lineHeight: 1.7 }}>
                {it.description}
              </div>
            )}
            {it.tags && it.tags.length > 0 && (
              <div style={{ marginLeft: 22, marginTop: 4, color: 'rgba(0,255,0,0.55)', fontSize: '0.72rem', textShadow: 'none' }}>
                refs: {it.tags.map(t => t).join(', ')}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Timeline({ items, variant = 'vertical-rail' }) {
  if (variant === 'ascii-tree') return <TimelineAsciiTree items={items} />;
  if (variant === 'commit-log')  return <TimelineCommitLog items={items} />;
  return <TimelineVerticalRail items={items} />;
}

window.Timeline = Timeline;
