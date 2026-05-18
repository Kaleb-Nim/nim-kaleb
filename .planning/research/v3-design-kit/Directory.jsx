// Directory.jsx — clickable section list for the index
// Mobile-first: tap-target rows (≥56px), persistent chevron, subtle fill,
// no hover-dependent affordances. Each row navigates to a hash route.

const dirStyles = {
  green:      '#00FF00',
  greenDim:   'rgba(0,255,0,0.78)',
  greenMute:  'rgba(0,255,0,0.55)',
  greenFaint: 'rgba(0,255,0,0.38)',
  gold:       '#FFD700',
  red:        '#FF4444',
  glow:       '0 0 4px rgba(0,255,0,0.45), 0 0 8px rgba(0,255,0,0.22)',
  goldGlow:   '0 0 4px rgba(255,215,0,0.45), 0 0 8px rgba(255,215,0,0.22)',
};

function DirRow({ row, onNav }) {
  const [pressed, setPressed] = React.useState(false);

  const handleClick = (e) => {
    e.preventDefault();
    onNav(row.id);
  };

  return (
    <a
      href={`#/${row.id}`}
      onClick={handleClick}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      className="kni-dir-row"
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto auto',
        columnGap: 'clamp(8px, 2vw, 14px)',
        alignItems: 'center',
        textDecoration: 'none',
        color: 'inherit',
        padding: '14px clamp(12px, 3vw, 18px)',
        minHeight: 60,
        background: pressed
          ? 'rgba(0,255,0,0.10)'
          : 'rgba(0,255,0,0.035)',
        borderTop: '1px solid rgba(0,255,0,0.18)',
        borderLeft: `3px solid ${pressed ? dirStyles.green : 'rgba(0,255,0,0.45)'}`,
        boxShadow: pressed
          ? 'inset 0 0 18px rgba(0,255,0,0.12), 0 0 16px rgba(0,255,0,0.18)'
          : 'inset 0 0 12px rgba(0,255,0,0.04)',
        transition: 'background 120ms ease-out, border-color 120ms ease-out, box-shadow 120ms ease-out, transform 80ms',
        transform: pressed ? 'translateX(2px)' : 'translateX(0)',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
        fontFamily: '"Anonymous Pro", monospace',
      }}
    >
      {/* Leading marker — opens directory style */}
      <span style={{
        color: dirStyles.greenMute,
        fontSize: 'clamp(0.75rem, 2vw, 0.82rem)',
        letterSpacing: '0.04em',
        textShadow: 'none',
        whiteSpace: 'nowrap',
      }}>
        <span className="kni-dir-icon" style={{
          color: dirStyles.greenFaint, textShadow: 'none', marginRight: 6,
        }}>▸</span>
        <span style={{
          color: dirStyles.green,
          textShadow: dirStyles.glow,
          fontWeight: 700,
        }}>./{row.path}</span>
        <span style={{ color: dirStyles.greenFaint, fontWeight: 400 }}>/</span>
      </span>

      {/* Description — wraps on mobile, hidden under medium width if needed */}
      <span className="kni-dir-desc" style={{
        color: dirStyles.greenDim,
        fontSize: 'clamp(0.74rem, 1.8vw, 0.82rem)',
        textShadow: 'none',
        lineHeight: 1.4,
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        — {row.desc}
      </span>

      {/* Count badge */}
      <span style={{
        color: dirStyles.gold,
        textShadow: dirStyles.goldGlow,
        fontSize: 'clamp(0.78rem, 1.8vw, 0.88rem)',
        fontWeight: 700,
        letterSpacing: '0.04em',
        whiteSpace: 'nowrap',
      }}>
        [{row.count}]
      </span>

      {/* Right chevron — primary affordance for "tappable" */}
      <span aria-hidden="true" style={{
        color: pressed ? dirStyles.green : dirStyles.greenMute,
        textShadow: pressed ? dirStyles.glow : '0 0 4px rgba(0,255,0,0.3)',
        fontSize: '1.1rem',
        fontWeight: 700,
        lineHeight: 1,
        transition: 'color 120ms ease-out, transform 120ms ease-out',
        transform: pressed ? 'translateX(4px)' : 'translateX(0)',
      }}>
        ›
      </span>
    </a>
  );
}

function Directory({ rows, onNav }) {
  return (
    <div style={{ fontFamily: '"Anonymous Pro", monospace' }}>
      {/* ls header line */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        padding: '0 4px 8px',
        color: dirStyles.greenFaint, fontSize: '0.74rem',
        textShadow: 'none', letterSpacing: '0.08em',
        whiteSpace: 'nowrap',
      }}>
        <span>$ ls ~/kaleb</span>
        <span>{rows.length} dirs · tap any to open</span>
      </div>

      <div className="kni-dir-list" style={{
        borderBottom: '1px solid rgba(0,255,0,0.18)',
        background: '#000',
      }}>
        {rows.map((row) => (
          <DirRow key={row.id} row={row} onNav={onNav} />
        ))}
      </div>
    </div>
  );
}

window.Directory = Directory;
window.DirRow = DirRow;
