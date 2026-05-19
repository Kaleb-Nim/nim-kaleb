// Meetups.jsx — SYAI meetups page with hero-image layout, speaker rows,
// gallery thumbs, lightbox overlay, and tweakable layout/compact modes.
//
// Layouts (cycle via Tweaks):
//   B (default) — hero image LEFT, text + speakers RIGHT, thumbs BELOW
//   A           — image strip TOP, then title/desc/speakers
//   C           — FULL-WIDTH hero on top, text below, thumbs at the bottom
//   D           — banner row (date + title), gallery row, then desc + speakers
//
// Compact toggle — hides description + gallery, keeps hero + title + speakers.

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

// ── Image tile (filled or placeholder) ─────────────────────────────────────
function MeetupImage({ src, aspect, alt, onClick, label, dim }) {
  const ratio = aspect || '16 / 10';
  const isPlaceholder = !src;
  const interactive = !!onClick && !isPlaceholder;
  return (
    <div
      onClick={interactive ? onClick : undefined}
      className={interactive ? 'kni-meetup-img' : ''}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: ratio,
        background: '#000',
        border: '1px solid #00FF00',
        boxShadow: '0 0 0 1px rgba(0,255,0,0.18) inset, 0 0 14px rgba(0,255,0,0.18), 0 4px 14px rgba(0,0,0,0.55)',
        overflow: 'hidden',
        cursor: interactive ? 'pointer' : 'default',
        opacity: dim ? 0.85 : 1,
        WebkitTapHighlightColor: 'transparent',
      }}>
      {!isPlaceholder ? (
        <img src={src} alt={alt || ''}
          style={{
            width: '100%', height: '100%',
            objectFit: 'cover', display: 'block',
            filter: 'saturate(0.95) contrast(1.02)',
          }}
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      ) : (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 6, padding: 12,
          color: mpColors.greenFaint,
          textShadow: 'none',
          backgroundImage:
            'linear-gradient(rgba(0,255,0,0.05) 1px, transparent 1px), ' +
            'linear-gradient(90deg, rgba(0,255,0,0.05) 1px, transparent 1px)',
          backgroundSize: '14px 14px',
        }}>
          <div aria-hidden="true" style={{
            color: mpColors.greenMute,
            fontSize: 'clamp(1rem, 3vw, 1.4rem)',
            textShadow: mpColors.glow,
            lineHeight: 1,
          }}>[ no media ]</div>
          {label && (
            <div style={{
              color: mpColors.greenFaint,
              fontSize: '0.66rem',
              letterSpacing: '0.06em',
              textAlign: 'center',
            }}>{label}</div>
          )}
        </div>
      )}

      {/* Click hint badge (only on filled, interactive) */}
      {interactive && (
        <div style={{
          position: 'absolute', top: 6, right: 6,
          color: mpColors.gold, textShadow: mpColors.goldGlow,
          fontSize: '0.62rem', letterSpacing: '0.08em', fontWeight: 700,
          padding: '2px 6px',
          background: 'rgba(0,0,0,0.55)',
          border: '1px solid rgba(255,215,0,0.5)',
          pointerEvents: 'none',
        }}>⛶ ZOOM</div>
      )}
    </div>
  );
}

// ── Section ribbon: # + date + title ────────────────────────────────────────
function MeetupRibbon({ num, date, title, compact }) {
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
        fontWeight: 700, fontSize: compact ? 'clamp(0.92rem, 2.6vw, 1.05rem)' : 'clamp(1rem, 3vw, 1.2rem)',
        lineHeight: 1.25, flex: '1 1 200px', minWidth: 0,
      }}>{title}</span>
    </div>
  );
}

// ── Speakers — terminal-style compact rows ──────────────────────────────────
function SpeakersBlock({ speakers, compact }) {
  if (!speakers || speakers.length === 0) return null;
  return (
    <div style={{ marginTop: compact ? 6 : 10 }}>
      <div style={{
        color: mpColors.greenFaint,
        fontSize: '0.7rem', letterSpacing: '0.1em',
        textShadow: 'none', marginBottom: 6,
      }}>
        SPEAKERS [{speakers.length}]
      </div>
      <div style={{
        display: 'flex', flexDirection: 'column',
        background: '#000',
        border: '1px solid rgba(0,255,0,0.22)',
      }}>
        {speakers.map((sp, i) => {
          const last = i === speakers.length - 1;
          return (
            <div key={i} style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) auto',
              columnGap: 'clamp(8px, 2vw, 14px)',
              alignItems: 'center',
              padding: '8px clamp(8px, 2vw, 12px)',
              borderBottom: last ? 'none' : '1px dashed rgba(0,255,0,0.12)',
              fontSize: 'clamp(0.74rem, 1.9vw, 0.82rem)',
            }}>
              <div style={{ minWidth: 0, lineHeight: 1.45 }}>
                <span style={{
                  color: mpColors.green, textShadow: mpColors.glow,
                  fontWeight: 700, whiteSpace: 'nowrap',
                }}>{sp.name}</span>
                <span style={{
                  color: mpColors.greenFaint, textShadow: 'none',
                  margin: '0 8px',
                }}>│</span>
                <span style={{
                  color: mpColors.greenDim, textShadow: 'none',
                }}>{sp.role}</span>
              </div>
              <a href={sp.linkedin} target="_blank" rel="noreferrer"
                className="kni-tappable"
                style={{
                  color: mpColors.gold, textShadow: mpColors.goldGlow,
                  textDecoration: 'none',
                  fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em',
                  border: '1px solid rgba(255,215,0,0.45)',
                  padding: '3px 8px', whiteSpace: 'nowrap',
                }}>in ↗</a>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Description ─────────────────────────────────────────────────────────────
function MeetupDesc({ desc }) {
  if (!desc) return null;
  return (
    <div style={{
      color: mpColors.green,
      fontSize: 'clamp(0.78rem, 2vw, 0.86rem)',
      lineHeight: 1.65,
      textShadow: '0 0 4px rgba(0,255,0,0.25), 0 0 8px rgba(0,255,0,0.1)',
      marginTop: 4,
    }}>
      {desc}
    </div>
  );
}

// ── Gallery thumb row ───────────────────────────────────────────────────────
function GalleryRow({ images, openLightbox, startIndex }) {
  if (!images || images.length === 0) return null;
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${images.length}, 1fr)`,
      gap: 8,
      marginTop: 12,
    }}>
      {images.map((src, i) => (
        <MeetupImage key={i}
          src={src}
          aspect="1 / 1"
          onClick={src ? () => openLightbox(startIndex + i) : null}
          label={`thumb ${i + 1}`}
          dim
        />
      ))}
    </div>
  );
}

// ── One meetup card — switches layout based on mode ────────────────────────
function MeetupCard({ event, mode, compact, openLightbox, cardIndex }) {
  const heroSrc = event.images[0];
  const restImgs = event.images.slice(1);
  // shared "open lightbox" wrapper that maps in-card index → global
  const openAt = (localIdx) => openLightbox(cardIndex, localIdx);

  // Compact mode trumps layout choices.
  if (compact) {
    return (
      <article style={cardWrap}>
        <MeetupRibbon num={event.num} date={event.date} title={event.title} compact />
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(110px, 28%) 1fr',
          gap: 'clamp(10px, 2.5vw, 16px)',
          alignItems: 'flex-start',
        }}>
          <MeetupImage src={heroSrc} aspect="4 / 3"
            onClick={heroSrc ? () => openAt(0) : null}
            label="hero" />
          <SpeakersBlock speakers={event.speakers} compact />
        </div>
      </article>
    );
  }

  // Layout B — Hero LEFT + Description RIGHT (share 2-col row);
  //            Speakers full-width BELOW; gallery thumbs at the bottom.
  if (mode === 'B') {
    return (
      <article style={cardWrap}>
        <MeetupRibbon num={event.num} date={event.date} title={event.title} />
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.05fr)',
          gap: 'clamp(12px, 3vw, 20px)',
          alignItems: 'flex-start',
        }} className="kni-meetup-2col">
          <MeetupImage src={heroSrc} aspect="4 / 3"
            onClick={heroSrc ? () => openAt(0) : null}
            label="hero photo" />
          <div style={{ minWidth: 0 }}>
            <MeetupDesc desc={event.desc} />
          </div>
        </div>
        <SpeakersBlock speakers={event.speakers} />
        {restImgs.length > 0 && (
          <GalleryRow images={restImgs} openLightbox={openAt} startIndex={1} />
        )}
      </article>
    );
  }

  // Layout A — Image strip TOP, then title/desc/speakers (title already in ribbon)
  if (mode === 'A') {
    return (
      <article style={cardWrap}>
        <MeetupRibbon num={event.num} date={event.date} title={event.title} />
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${event.images.length}, 1fr)`,
          gap: 8,
          marginBottom: 12,
        }}>
          {event.images.map((src, i) => (
            <MeetupImage key={i} src={src} aspect="4 / 3"
              onClick={src ? () => openAt(i) : null}
              label={i === 0 ? 'hero' : `photo ${i + 1}`}
              dim={i !== 0}
            />
          ))}
        </div>
        <MeetupDesc desc={event.desc} />
        <SpeakersBlock speakers={event.speakers} />
      </article>
    );
  }

  // Layout C — full-width hero on top, text below, thumbs at bottom
  if (mode === 'C') {
    return (
      <article style={cardWrap}>
        <MeetupRibbon num={event.num} date={event.date} title={event.title} />
        <MeetupImage src={heroSrc} aspect="21 / 9"
          onClick={heroSrc ? () => openAt(0) : null}
          label="hero photo" />
        <div style={{ marginTop: 12 }}>
          <MeetupDesc desc={event.desc} />
          <SpeakersBlock speakers={event.speakers} />
        </div>
        {restImgs.length > 0 && (
          <GalleryRow images={restImgs} openLightbox={openAt} startIndex={1} />
        )}
      </article>
    );
  }

  // Layout D — banner, gallery row, then description + speakers
  if (mode === 'D') {
    return (
      <article style={cardWrap}>
        <MeetupRibbon num={event.num} date={event.date} title={event.title} />
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${event.images.length}, 1fr)`,
          gap: 8,
          marginBottom: 12,
        }}>
          {event.images.map((src, i) => (
            <MeetupImage key={i} src={src} aspect="1 / 1"
              onClick={src ? () => openAt(i) : null}
              label={`photo ${i + 1}`}
              dim={i !== 0}
            />
          ))}
        </div>
        <MeetupDesc desc={event.desc} />
        <SpeakersBlock speakers={event.speakers} />
      </article>
    );
  }

  return null;
}

const cardWrap = {
  background: 'rgba(0,255,0,0.025)',
  border: '1px solid rgba(0,255,0,0.22)',
  borderLeft: '3px solid rgba(0,255,0,0.55)',
  padding: 'clamp(14px, 3vw, 20px)',
  marginBottom: 18,
};

// ── Lightbox overlay ────────────────────────────────────────────────────────
function MeetupLightbox({ items, open, onClose }) {
  // open = { cardIdx, imgIdx } | null
  const [cur, setCur] = React.useState(open);
  React.useEffect(() => { setCur(open); }, [open]);

  // Build flat list of all (event, imgIdx, src) so prev/next can hop across events
  const flat = React.useMemo(() => {
    const out = [];
    items.forEach((ev, ci) => {
      ev.images.forEach((src, ii) => {
        if (src) out.push({ ci, ii, src, event: ev });
      });
    });
    return out;
  }, [items]);

  // Index in flat for current cur
  const flatIdx = React.useMemo(() => {
    if (!cur) return -1;
    return flat.findIndex(f => f.ci === cur.cardIdx && f.ii === cur.imgIdx);
  }, [cur, flat]);

  React.useEffect(() => {
    if (!cur) return;
    const onKey = (e) => {
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

  const go = (delta) => {
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

      {/* Close X */}
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

// ── Page-level Tweaks panel (uses tweaks-panel.jsx primitives) ──────────────
function MeetupsTweaks({ tweaks, setTweak }) {
  if (typeof TweaksPanel === 'undefined') return null;
  return (
    <TweaksPanel title="Tweaks · syai-meetups">
      <TweakSection label="Layout">
        <TweakRadio
          label="Per-event layout"
          value={tweaks.layoutMode}
          options={[
            { value: 'B', label: 'Hero ← Text' },
            { value: 'A', label: 'Strip top' },
            { value: 'C', label: 'Full hero' },
            { value: 'D', label: 'Banner+gal' },
          ]}
          onChange={(v) => setTweak('layoutMode', v)}
        />
      </TweakSection>
      <TweakSection label="Density">
        <TweakToggle
          label="Compact view"
          value={tweaks.compact}
          onChange={(v) => setTweak('compact', v)}
        />
      </TweakSection>
    </TweaksPanel>
  );
}

// ── Page entry ──────────────────────────────────────────────────────────────
function MeetupsPage({ section }) {
  const defaults = /*EDITMODE-BEGIN*/{
    "layoutMode": "B",
    "compact": false
  }/*EDITMODE-END*/;
  const [tweaks, setTweak] = (typeof useTweaks !== 'undefined')
    ? useTweaks(defaults)
    : [defaults, () => {}];

  const [open, setOpen] = React.useState(null); // {cardIdx, imgIdx} | null
  const openLightbox = (cardIdx, imgIdx) => setOpen({ cardIdx, imgIdx });
  const closeLightbox = () => setOpen(null);

  return (
    <div>
      <PageHeader section={section} />

      {section.items.map((ev, i) => (
        <MeetupCard
          key={ev.num}
          event={ev}
          cardIndex={i}
          mode={tweaks.layoutMode}
          compact={tweaks.compact}
          openLightbox={openLightbox}
        />
      ))}

      <FooterMeta section={section} />

      <MeetupLightbox items={section.items} open={open} onClose={closeLightbox} />
      <MeetupsTweaks tweaks={tweaks} setTweak={setTweak} />
    </div>
  );
}

window.MeetupsPageV2 = MeetupsPage;
