// SectionPanel.jsx — expanded content for a single directory entry
// Renders a list of items (date / title / org / meta / links) in monospace
// terminal style. Used for Work, Meetups, Hackathons, Sidequests, Hobbies, Links.

const spStyles = {
  green:      '#00FF00',
  greenDim:   'rgba(0,255,0,0.7)',
  greenMute:  'rgba(0,255,0,0.55)',
  greenFaint: 'rgba(0,255,0,0.35)',
  gold:       '#FFD700',
  glow:       '0 0 4px rgba(0,255,0,0.4), 0 0 8px rgba(0,255,0,0.2)',
  goldGlow:   '0 0 4px rgba(255,215,0,0.4), 0 0 8px rgba(255,215,0,0.2)',
};

function ItemRow({ item, idx, dense }) {
  const padDate = dense ? 14 : 18;
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `auto ${padDate}ch 1fr auto`,
      columnGap: 10,
      alignItems: 'baseline',
      padding: dense ? '4px 0' : '6px 0',
      borderBottom: '1px dashed rgba(0,255,0,0.08)',
      fontSize: dense ? '0.78rem' : '0.82rem',
      whiteSpace: 'nowrap',
      minWidth: 0,
    }}>
      <span style={{ color: spStyles.greenFaint, textShadow: 'none', fontSize: '0.72rem', fontFamily: '"Anonymous Pro", monospace' }}>
        {String(idx + 1).padStart(2, '0')}
      </span>
      <span style={{ color: spStyles.greenMute, textShadow: 'none', fontSize: '0.74rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {item.date || ''}
      </span>
      <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
        <span style={{ color: spStyles.green, textShadow: spStyles.glow, fontWeight: 700 }}>
          {item.title}
        </span>
        {item.org && (
          <span style={{ color: spStyles.greenDim, textShadow: 'none' }}>
            {' · '}{item.org}
          </span>
        )}
        {item.note && (
          <span style={{ color: spStyles.greenFaint, textShadow: 'none' }}>
            {' — '}{item.note}
          </span>
        )}
      </span>
      {item.link ? (
        <a href={item.link.href} target="_blank" rel="noreferrer"
           onClick={(e) => e.stopPropagation()}
           style={{
             color: spStyles.gold, textDecoration: 'none',
             textShadow: spStyles.goldGlow, fontSize: '0.74rem',
             justifySelf: 'end',
           }}
           className="kni-gold-link">
          [{item.link.label}]
        </a>
      ) : item.tag ? (
        <span style={{
          color: spStyles.greenFaint, textShadow: 'none',
          fontSize: '0.7rem', letterSpacing: '0.06em', justifySelf: 'end',
        }}>
          [{item.tag}]
        </span>
      ) : <span />}
    </div>
  );
}

function SectionPanel({ section }) {
  // section: { id, path, title, intro, items, footer, dense, accent }
  const items = section.items || [];
  return (
    <div className="kni-section-panel"
         data-screen-label={section.id}
         style={{
           padding: '10px 14px 14px',
           background: 'rgba(0,255,0,0.015)',
           borderLeft: '2px solid rgba(0,255,0,0.35)',
           boxShadow: 'inset 0 0 18px rgba(0,255,0,0.04)',
           fontFamily: '"Anonymous Pro", monospace',
           animation: 'kniPanelOpen 280ms cubic-bezier(0.22, 1, 0.36, 1) both',
           overflow: 'hidden',
         }}>
      {/* Path + title */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ color: spStyles.greenFaint, fontSize: '0.72rem' }}>$ cd ./{section.path} &amp;&amp; ls</span>
      </div>
      <div style={{
        color: spStyles.green, fontSize: '1.05rem', fontWeight: 700,
        textShadow: '0 0 6px rgba(0,255,0,0.55), 0 0 14px rgba(0,255,0,0.25)',
        marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {section.title}
      </div>
      {section.intro && (
        <div style={{
          color: spStyles.greenDim, fontSize: '0.78rem', textShadow: 'none',
          marginTop: 2, lineHeight: 1.55,
        }}>
          {section.intro}
        </div>
      )}

      {/* Items */}
      <div style={{ marginTop: 10 }}>
        {items.length === 0 && (
          <div style={{ color: spStyles.greenFaint, fontSize: '0.78rem' }}>
            (no entries yet — check back soon)
          </div>
        )}
        {items.map((it, i) => (
          <ItemRow key={i} item={it} idx={i} dense={section.dense} />
        ))}
      </div>

      {section.footer && (
        <div style={{
          color: spStyles.greenFaint, fontSize: '0.72rem', textShadow: 'none',
          marginTop: 10,
        }}>
          {section.footer}
        </div>
      )}
    </div>
  );
}

window.SectionPanel = SectionPanel;
window.ItemRow = ItemRow;
