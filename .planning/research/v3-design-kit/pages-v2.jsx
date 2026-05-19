// pages.jsx — six tailored section page components
// Each receives the full section object from SECTIONS and renders an
// appropriate layout. Mobile-first; clickability is always explicit
// (chevrons, buttons, gold underlines).

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

// ── Shared: PageHeader ──────────────────────────────────────────────────────
function PageHeader({ section }) {
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
          {section.intro}
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

      <div style={{
        height: 1, margin: '16px 0',
        background: 'linear-gradient(90deg, rgba(0,255,0,0.45), rgba(0,255,0,0.05))',
      }} />
    </div>
  );
}

// ── 1. WORK — vertical timeline rail with company logo chips ───────────────
const WORK_STATUS_META = {
  SHIPPED:  { color: '#00FF00', glow: 'rgba(0,255,0,0.6)',   sym: '●' },
  ACTIVE:   { color: '#00FF00', glow: 'rgba(0,255,0,0.7)',   sym: '◉' },
  ARCHIVED: { color: 'rgba(0,255,0,0.45)', glow: 'rgba(0,255,0,0.2)', sym: '○' },
};
function workStatusOf(s) { return WORK_STATUS_META[s] || WORK_STATUS_META.SHIPPED; }

function WorkLogoChip({ src, bg, alt }) {
  return (
    <div style={{
      flex: '0 0 auto',
      width: 'clamp(56px, 14vw, 76px)',
      height: 'clamp(56px, 14vw, 76px)',
      background: bg || '#FFFFFF',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 8,
      border: '1px solid rgba(0,255,0,0.35)',
      boxShadow: '0 0 0 1px rgba(0,255,0,0.15) inset, 0 0 14px rgba(0,255,0,0.18), 0 4px 14px rgba(0,0,0,0.55)',
    }}>
      <img src={src} alt={alt}
        style={{
          maxWidth: '100%', maxHeight: '100%',
          objectFit: 'contain',
          // Slight desaturation so the logos feel embedded in the CRT, not pasted on
          filter: 'saturate(0.92) contrast(1.02)',
        }}
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />
    </div>
  );
}

function WorkPage({ section }) {
  const items = section.items;
  return (
    <div>
      <PageHeader section={section} />
      <div style={{ position: 'relative', paddingLeft: 32 }}>
        {/* Vertical rail */}
        <div style={{
          position: 'absolute', left: 10, top: 6, bottom: 6, width: 1,
          background: 'linear-gradient(180deg, rgba(0,255,0,0.55) 0%, rgba(0,255,0,0.25) 100%)',
          boxShadow: '0 0 6px rgba(0,255,0,0.35)',
        }} />
        {items.map((it, i) => {
          const s = workStatusOf(it.tag || 'SHIPPED');
          const isLast = i === items.length - 1;
          return (
            <div key={i} style={{ position: 'relative', paddingBottom: isLast ? 0 : 26 }}>
              {/* Status node on rail */}
              <div style={{
                position: 'absolute', left: -27, top: 6,
                width: 14, height: 14, borderRadius: '50%',
                background: '#010810',
                boxShadow: `inset 0 0 0 1.5px ${s.color}, 0 0 10px ${s.glow}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: s.color, fontSize: '0.58rem', textShadow: `0 0 4px ${s.glow}`,
              }}>{s.sym}</div>

              {/* Row: logo + content */}
              <div style={{
                display: 'flex', gap: 'clamp(10px, 2.5vw, 16px)',
                alignItems: 'flex-start',
              }}>
                {it.logo && (
                  <WorkLogoChip src={it.logo} bg={it.logoBg} alt={it.org} />
                )}
                <div style={{ minWidth: 0, flex: 1 }}>
                  {/* Date */}
                  <div style={{
                    color: 'rgba(0,255,0,0.6)', fontSize: '0.72rem',
                    letterSpacing: '0.04em', whiteSpace: 'nowrap', textShadow: 'none',
                  }}>
                    {it.date}
                  </div>
                  {/* Title + status chip */}
                  <div style={{
                    display: 'flex', alignItems: 'baseline', gap: 10,
                    flexWrap: 'wrap', marginTop: 2, minWidth: 0,
                  }}>
                    <span style={{
                      color: '#00FF00', fontSize: 'clamp(0.95rem, 2.6vw, 1.05rem)', fontWeight: 700,
                      textShadow: '0 0 4px rgba(0,255,0,0.55), 0 0 10px rgba(0,255,0,0.25)',
                    }}>{it.title}</span>
                    <span style={{
                      color: s.color, fontSize: '0.7rem', letterSpacing: '0.08em',
                      textShadow: `0 0 4px ${s.glow}`, whiteSpace: 'nowrap',
                    }}>[{it.tag || 'SHIPPED'}]</span>
                  </div>
                  {/* Org */}
                  {it.org && (
                    <div style={{
                      color: 'rgba(0,255,0,0.78)', fontSize: 'clamp(0.78rem, 2vw, 0.82rem)',
                      marginTop: 2, textShadow: '0 0 4px rgba(0,255,0,0.3)',
                    }}>
                      {it.org}
                    </div>
                  )}
                  {/* Description */}
                  {it.note && (
                    <div style={{
                      color: '#00FF00', fontSize: 'clamp(0.78rem, 2vw, 0.84rem)',
                      lineHeight: 1.7, marginTop: 8,
                      textShadow: '0 0 4px rgba(0,255,0,0.3), 0 0 8px rgba(0,255,0,0.15)',
                    }}>
                      {it.note}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <FooterMeta section={section} />
    </div>
  );
}

// ── 2. MEETUPS — delegated to Meetups.jsx (window.MeetupsPageV2) ───────────
function MeetupsPage({ section }) {
  if (typeof window !== 'undefined' && window.MeetupsPageV2) {
    return React.createElement(window.MeetupsPageV2, { section });
  }
  return <div style={{ color: '#FFD700' }}>Loading meetups…</div>;
}

// ── 3. HACKATHONS — compact project-card grid ──────────────────────────────
function HackathonsPage({ section }) {
  return (
    <div>
      <PageHeader section={section} />
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 12,
      }}>
        {section.items.map((it, i) => {
          const isWin = it.tag && (it.tag.includes('WON') || it.tag.includes('FINALIST'));
          const isWip = it.tag === 'WIP';
          const tagColor = isWin ? pgStyles.gold : (isWip ? pgStyles.gold : pgStyles.green);
          const tagGlow = isWin || isWip ? pgStyles.goldGlow : pgStyles.glow;
          const hasLink = !!it.link;
          return (
            <div key={i} style={{
              background: '#000',
              border: `1px solid ${isWin ? 'rgba(255,215,0,0.5)' : 'rgba(0,255,0,0.25)'}`,
              padding: 'clamp(12px, 2.5vw, 14px)',
              display: 'flex', flexDirection: 'column', gap: 6,
              boxShadow: isWin ? '0 0 14px rgba(255,215,0,0.18)' : 'inset 0 0 12px rgba(0,255,0,0.04)',
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'baseline', gap: 10, flexWrap: 'wrap',
              }}>
                <span style={{
                  color: pgStyles.greenMute, fontSize: '0.7rem',
                  textShadow: 'none', letterSpacing: '0.04em',
                }}>
                  {it.date}
                </span>
                {it.tag && (
                  <span style={{
                    color: tagColor, textShadow: tagGlow,
                    fontSize: '0.66rem', fontWeight: 700,
                    letterSpacing: '0.08em',
                    border: `1px solid ${tagColor}`,
                    padding: '1px 6px',
                    whiteSpace: 'nowrap',
                  }}>
                    [{it.tag}]
                  </span>
                )}
              </div>
              <div style={{
                color: pgStyles.green,
                textShadow: pgStyles.glow,
                fontWeight: 700,
                fontSize: 'clamp(0.92rem, 2.4vw, 1rem)',
                lineHeight: 1.3,
              }}>
                {it.title}
              </div>
              {it.note && (
                <div style={{
                  color: pgStyles.greenDim, textShadow: 'none',
                  fontSize: 'clamp(0.74rem, 1.8vw, 0.8rem)',
                  lineHeight: 1.55,
                }}>
                  {it.note}
                </div>
              )}
              {hasLink && (
                <div style={{ marginTop: 'auto', paddingTop: 6 }}>
                  <a href={it.link.href} target="_blank" rel="noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      color: pgStyles.gold, textShadow: pgStyles.goldGlow,
                      textDecoration: 'none',
                      fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.04em',
                      border: '1px solid rgba(255,215,0,0.45)',
                      padding: '4px 10px',
                    }}>
                    {it.link.label} ↗
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <FooterMeta section={section} />
    </div>
  );
}

// ── 4. SIDEQUESTS — dense log rows ──────────────────────────────────────────
function SidequestsPage({ section }) {
  return (
    <div>
      <PageHeader section={section} />
      <div style={{
        fontFamily: '"Anonymous Pro", monospace',
        background: '#000', border: '1px solid rgba(0,255,0,0.18)',
      }}>
        {/* Column header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(110px, auto) 1fr auto',
          columnGap: 'clamp(8px, 2vw, 16px)',
          padding: '8px clamp(10px, 2.5vw, 14px)',
          color: pgStyles.greenFaint, fontSize: '0.7rem',
          textShadow: 'none', letterSpacing: '0.08em',
          borderBottom: '1px solid rgba(0,255,0,0.18)',
          background: 'rgba(0,255,0,0.025)',
          whiteSpace: 'nowrap',
        }}>
          <span>DATE</span>
          <span>EVENT</span>
          <span style={{ justifySelf: 'end' }}>ROLE</span>
        </div>
        {section.items.map((it, i) => {
          const role = roleOf(it.note);
          const hasLink = !!it.link;
          const Wrap = hasLink ? 'a' : 'div';
          const wrapProps = hasLink
            ? { href: it.link.href, target: '_blank', rel: 'noreferrer' }
            : {};
          return (
            <Wrap key={i} {...wrapProps}
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(110px, auto) 1fr auto',
                columnGap: 'clamp(8px, 2vw, 16px)',
                padding: '10px clamp(10px, 2.5vw, 14px)',
                borderBottom: i === section.items.length - 1 ? 'none' : '1px dashed rgba(0,255,0,0.10)',
                fontSize: 'clamp(0.74rem, 1.8vw, 0.8rem)',
                textDecoration: 'none', color: 'inherit',
                alignItems: 'baseline',
                background: hasLink ? 'rgba(255,215,0,0.02)' : 'transparent',
              }}>
              <span style={{
                color: pgStyles.greenMute, textShadow: 'none',
                fontSize: '0.72rem', whiteSpace: 'nowrap',
              }}>
                {it.date}
              </span>
              <span style={{ minWidth: 0, overflow: 'hidden' }}>
                <span style={{
                  color: pgStyles.green, textShadow: pgStyles.glow,
                  fontWeight: 700,
                }}>{it.title}</span>
                {it.note && (
                  <span style={{ color: pgStyles.greenDim, textShadow: 'none' }}>
                    {' · '}{it.note}
                  </span>
                )}
                {hasLink && (
                  <span style={{
                    color: pgStyles.gold, textShadow: pgStyles.goldGlow,
                    marginLeft: 8, fontSize: '0.7rem',
                  }}>[{it.link.label}↗]</span>
                )}
              </span>
              <span style={{
                color: roleColor(role).color, textShadow: roleColor(role).glow,
                fontSize: '0.68rem', letterSpacing: '0.06em',
                justifySelf: 'end', whiteSpace: 'nowrap',
              }}>
                {role}
              </span>
            </Wrap>
          );
        })}
      </div>
      <FooterMeta section={section} />
    </div>
  );
}
function roleOf(note) {
  if (!note) return 'ATTENDED';
  const n = note.toLowerCase();
  if (n.includes('speaker') || n.includes('talk') || n.includes('lightning')) return 'SPOKE';
  if (n.includes('panel')) return 'PANELLED';
  if (n.includes('host') || n.includes('organis')) return 'HOSTED';
  if (n.includes('demo')) return 'DEMOED';
  if (n.includes('mentor')) return 'MENTORED';
  if (n.includes('volunteer')) return 'VOLUNTEERED';
  if (n.includes('representing')) return 'REPRESENTED';
  if (n.includes('co-author') || n.includes('poster')) return 'AUTHORED';
  return 'ATTENDED';
}
function roleColor(r) {
  if (r === 'SPOKE' || r === 'PANELLED' || r === 'HOSTED' || r === 'DEMOED' || r === 'AUTHORED') {
    return { color: pgStyles.gold, glow: pgStyles.goldGlow };
  }
  return { color: pgStyles.greenMute, glow: 'none' };
}

// ── 5. HOBBIES — 5 expressive blocks ───────────────────────────────────────
function HobbiesPage({ section }) {
  // Curated ASCII glyphs per hobby — match by title keyword
  const glyphFor = (title) => {
    const t = title.toLowerCase();
    if (t.includes('cook'))      return '⌬';
    if (t.includes('boulder') || t.includes('climb')) return '⏶';
    if (t.includes('keyboard'))  return '▤';
    if (t.includes('read') || t.includes('sci-fi') || t.includes('book')) return '❍';
    if (t.includes('walk') || t.includes('lo-fi') || t.includes('music')) return '∿';
    return '◇';
  };
  return (
    <div>
      <PageHeader section={section} />
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 12,
      }}>
        {section.items.map((it, i) => (
          <div key={i} style={{
            background: '#000',
            border: '1px solid rgba(0,255,0,0.22)',
            padding: 'clamp(14px, 3vw, 18px)',
            display: 'flex', flexDirection: 'column', gap: 8,
            boxShadow: 'inset 0 0 16px rgba(0,255,0,0.04)',
            minHeight: 120,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span aria-hidden="true" style={{
                color: pgStyles.green, textShadow: pgStyles.glow,
                fontSize: '1.4rem', lineHeight: 1,
              }}>
                {glyphFor(it.title)}
              </span>
              <span style={{
                color: pgStyles.green, textShadow: pgStyles.glow,
                fontWeight: 700, fontSize: 'clamp(0.92rem, 2.4vw, 1rem)',
              }}>
                {it.title}
              </span>
            </div>
            <div style={{
              color: pgStyles.greenDim, textShadow: 'none',
              fontSize: 'clamp(0.76rem, 1.8vw, 0.82rem)',
              lineHeight: 1.55,
            }}>
              {it.note}
            </div>
          </div>
        ))}
      </div>
      <FooterMeta section={section} />
    </div>
  );
}

// ── 6. LINKS — 5 big buttons ───────────────────────────────────────────────
function LinksPage({ section }) {
  return (
    <div>
      <PageHeader section={section} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {section.items.map((it, i) => (
          <a key={i} href={it.link.href}
            target={it.link.href.startsWith('mailto:') ? undefined : '_blank'}
            rel="noreferrer"
            className="kni-tappable"
            style={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr auto auto',
              gap: 'clamp(10px, 2vw, 16px)',
              alignItems: 'center',
              padding: 'clamp(14px, 3vw, 18px)',
              background: 'rgba(255,215,0,0.04)',
              border: '1px solid rgba(255,215,0,0.4)',
              borderLeft: '3px solid #FFD700',
              textDecoration: 'none', color: 'inherit',
              minHeight: 64,
              boxShadow: '0 0 10px rgba(255,215,0,0.1)',
              WebkitTapHighlightColor: 'transparent',
            }}>
            <span aria-hidden="true" style={{
              color: pgStyles.gold, textShadow: pgStyles.goldGlow,
              fontSize: 'clamp(1.1rem, 3vw, 1.3rem)', lineHeight: 1,
            }}>
              {linkGlyphFor(it.title)}
            </span>
            <div style={{ minWidth: 0 }}>
              <div style={{
                color: pgStyles.gold, textShadow: pgStyles.goldGlow,
                fontWeight: 700, fontSize: 'clamp(0.92rem, 2.4vw, 1.05rem)',
              }}>
                {it.title}
              </div>
              <div style={{
                color: pgStyles.greenDim, textShadow: 'none',
                fontSize: 'clamp(0.74rem, 1.8vw, 0.82rem)',
                marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {it.note}
              </div>
            </div>
            <span style={{
              color: pgStyles.gold, textShadow: pgStyles.goldGlow,
              fontSize: 'clamp(0.7rem, 1.8vw, 0.78rem)',
              fontWeight: 700, letterSpacing: '0.06em',
              border: '1px solid rgba(255,215,0,0.55)',
              padding: '4px 10px', whiteSpace: 'nowrap',
            }}>
              {it.link.label}
            </span>
            <span aria-hidden="true" style={{
              color: pgStyles.gold, textShadow: pgStyles.goldGlow,
              fontSize: '1.1rem', fontWeight: 700, lineHeight: 1,
            }}>↗</span>
          </a>
        ))}
      </div>
      <FooterMeta section={section} />
    </div>
  );
}
function linkGlyphFor(title) {
  const t = title.toLowerCase();
  if (t.includes('github'))   return '◇';
  if (t.includes('linkedin')) return '◈';
  if (t.includes('email'))    return '✉';
  if (t.includes('resume') || t.includes('cv')) return '⎙';
  if (t.includes('site'))     return '⌘';
  return '›';
}

// ── Shared: FooterMeta (entry count etc.) ──────────────────────────────────
function FooterMeta({ section }) {
  return (
    <div style={{
      fontFamily: '"Anonymous Pro", monospace',
      color: pgStyles.greenFaint, textShadow: 'none',
      fontSize: '0.72rem', marginTop: 18, letterSpacing: '0.04em',
    }}>
      {section.footer || `[${section.count} entries]`} · ‹ tap{' '}
      <a href="#/" style={{
        color: pgStyles.gold, textShadow: pgStyles.goldGlow,
        textDecoration: 'underline',
      }}>~/kaleb</a> to return home
    </div>
  );
}

// ── Page dispatcher ────────────────────────────────────────────────────────
function SectionPage({ section }) {
  if (section.id === 'work')       return <WorkPage section={section} />;
  if (section.id === 'meetups')    return <MeetupsPage section={section} />;
  if (section.id === 'hackathons') return <HackathonsPage section={section} />;
  if (section.id === 'sidequests') return <SidequestsPage section={section} />;
  if (section.id === 'hobbies')    return <HobbiesPage section={section} />;
  if (section.id === 'links')      return <LinksPage section={section} />;
  return null;
}

window.SectionPage = SectionPage;
window.PageHeader = PageHeader;
window.FooterMeta = FooterMeta;
