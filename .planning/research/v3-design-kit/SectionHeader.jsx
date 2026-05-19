// SectionHeader.jsx — header strips for portfolio sections
// Each header is a unique flavor matching the section's content.

const shStyles = {
  green: '#00FF00',
  greenDim: 'rgba(0,255,0,0.6)',
  greenFaint: 'rgba(0,255,0,0.35)',
  gold: '#FFD700',
  goldGlow: '0 0 4px rgba(255,215,0,0.4), 0 0 8px rgba(255,215,0,0.2)',
  greenGlow: '0 0 4px rgba(0,255,0,0.5), 0 0 10px rgba(0,255,0,0.25)',
};

// Shared: ascii rule generator
function dashRow(char = '═', len = 60) { return char.repeat(len); }

// ── 1. WORK / EXPERIENCE — manpages-style banner ────────────────────────────
// Vibe: "WORK(1) — User Commands"; serious recruiter mode dressed in monospace.
function HeaderWork({ count = 7, totalYears = '3+ yrs' }) {
  return (
    <div style={{ fontFamily: '"Anonymous Pro", monospace', color: shStyles.green, textShadow: shStyles.greenGlow, padding: '4px 0' }}>
      {/* manpage-style header line */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: '0.72rem', color: shStyles.greenDim, textShadow: 'none',
        letterSpacing: '0.06em', whiteSpace: 'nowrap',
      }}>
        <span>WORK(1)</span>
        <span>USER COMMANDS</span>
        <span>WORK(1)</span>
      </div>
      <div style={{ height: 8 }}></div>
      {/* NAME line */}
      <div style={{ fontSize: '0.78rem', color: shStyles.greenDim, textShadow: 'none' }}>
        <span style={{ color: shStyles.gold, textShadow: shStyles.goldGlow }}>NAME</span>
      </div>
      <div style={{
        fontSize: '1.6rem', fontWeight: 700, marginTop: 6,
        textShadow: '0 0 6px rgba(0,255,0,0.6), 0 0 14px rgba(0,255,0,0.3)',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        ./work — full-time &amp; internships
      </div>
      <div style={{ fontSize: '0.82rem', color: shStyles.greenDim, marginTop: 4, textShadow: 'none' }}>
        Operator's log of paid hours spent shipping AI systems.
      </div>
      <div style={{ display: 'flex', gap: 18, marginTop: 8, fontSize: '0.74rem', color: shStyles.greenDim, textShadow: 'none', flexWrap: 'wrap' }}>
        <span style={{ whiteSpace: 'nowrap' }}>[<span style={{ color: shStyles.gold, textShadow: shStyles.goldGlow }}>{count}</span> roles]</span>
        <span style={{ whiteSpace: 'nowrap' }}>[<span style={{ color: shStyles.gold, textShadow: shStyles.goldGlow }}>{totalYears}</span> total]</span>
        <span style={{ whiteSpace: 'nowrap' }}>sorted: most-recent-first</span>
      </div>
      <pre style={{ margin: '10px 0 0', color: shStyles.greenFaint, textShadow: 'none', fontSize: '0.7rem', whiteSpace: 'pre', overflow: 'hidden' }}>
{dashRow('─', 70)}
      </pre>
    </div>
  );
}

// ── 2. VOLUNTEERING / WORKSHOPS — chalkboard / workshop-poster vibe ─────────
// Vibe: classroom roll-call. ASCII tag, "WORKSHOP_LOG" stamp, attendee count.
function HeaderVolunteering({ count = 10, org = 'Singapore Youth AI', taught = '500+ students' }) {
  return (
    <div style={{ fontFamily: '"Anonymous Pro", monospace', color: shStyles.green, textShadow: shStyles.greenGlow, padding: '4px 0' }}>
      {/* Stamp */}
      <div style={{
        display: 'inline-block',
        border: '1px dashed rgba(255,215,0,0.6)',
        padding: '4px 10px',
        color: shStyles.gold, textShadow: shStyles.goldGlow,
        fontSize: '0.72rem', letterSpacing: '0.12em',
        transform: 'rotate(-1.5deg)',
      }}>
        ▮ WORKSHOP_LOG ▮
      </div>
      <div style={{
        fontSize: '1.6rem', fontWeight: 700, marginTop: 12,
        textShadow: '0 0 6px rgba(0,255,0,0.6), 0 0 14px rgba(0,255,0,0.3)',
      }}>
        ./teaching — {org}
      </div>
      <div style={{ fontSize: '0.82rem', color: shStyles.greenDim, marginTop: 4, textShadow: 'none' }}>
        Workshops I ran for kids who hadn't met an LLM yet.
      </div>
      <div style={{
        display: 'flex', gap: 0, marginTop: 12, alignItems: 'stretch',
        border: '1px solid rgba(0,255,0,0.3)',
        boxShadow: 'inset 0 0 12px rgba(0,255,0,0.08)',
      }}>
        <div style={{ flex: 1, padding: '8px 12px', borderRight: '1px solid rgba(0,255,0,0.3)' }}>
          <div style={{ fontSize: '0.68rem', color: shStyles.greenDim, textShadow: 'none', letterSpacing: '0.08em' }}>SESSIONS</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: shStyles.gold, textShadow: shStyles.goldGlow }}>{String(count).padStart(2, '0')}</div>
        </div>
        <div style={{ flex: 1, padding: '8px 12px', borderRight: '1px solid rgba(0,255,0,0.3)' }}>
          <div style={{ fontSize: '0.68rem', color: shStyles.greenDim, textShadow: 'none', letterSpacing: '0.08em' }}>STUDENTS</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: shStyles.green, textShadow: '0 0 6px rgba(0,255,0,0.5)' }}>{taught}</div>
        </div>
        <div style={{ flex: 1, padding: '8px 12px' }}>
          <div style={{ fontSize: '0.68rem', color: shStyles.greenDim, textShadow: 'none', letterSpacing: '0.08em' }}>TOPIC</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: shStyles.green, textShadow: '0 0 6px rgba(0,255,0,0.5)', marginTop: 6 }}>AI / ML literacy</div>
        </div>
      </div>
    </div>
  );
}

// ── 3. HACKATHONS — leaderboard / scoreboard vibe ───────────────────────────
// Vibe: arcade hi-score. "HACK //" prefix, blinking cursor, win count
function HeaderHackathons({ count = 6, wins = 2 }) {
  return (
    <div style={{ fontFamily: '"Anonymous Pro", monospace', color: shStyles.green, textShadow: shStyles.greenGlow, padding: '4px 0' }}>
      {/* Top: HACK // tag + warning blink */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <div style={{
          fontSize: '0.74rem', letterSpacing: '0.18em',
          color: shStyles.gold, textShadow: shStyles.goldGlow,
          border: '1px solid rgba(255,215,0,0.5)',
          padding: '3px 10px',
          whiteSpace: 'nowrap',
        }}>
          HACK&nbsp;//
        </div>
        <div style={{ color: '#FF4444', fontSize: '0.72rem', letterSpacing: '0.1em', textShadow: '0 0 4px rgba(255,68,68,0.5)', whiteSpace: 'nowrap' }}>
          ● <span className="kni-blink">REC</span> · build window: 24–48hr
        </div>
      </div>
      <div style={{
        fontSize: '1.8rem', fontWeight: 700, marginTop: 10, lineHeight: 1.1,
        textShadow: '0 0 8px rgba(0,255,0,0.7), 0 0 18px rgba(0,255,0,0.35)',
      }}>
        ./hackathons<span className="kni-blink" style={{ color: shStyles.green }}>_</span>
      </div>
      <div style={{ fontSize: '0.82rem', color: shStyles.greenDim, marginTop: 4, textShadow: 'none', maxWidth: 540, marginBottom: 14 }}>
        Things I built between Friday night and Sunday afternoon. Most still work.
      </div>
      {/* Scoreboard strip */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
        fontSize: '0.78rem',
      }}>
        <span style={{ color: shStyles.greenDim, textShadow: 'none' }}>SCORE: </span>
        <span style={{ color: shStyles.gold, textShadow: shStyles.goldGlow, fontWeight: 700 }}>{count} BUILT</span>
        <span style={{ color: shStyles.greenFaint, textShadow: 'none' }}> · </span>
        <span style={{ color: shStyles.gold, textShadow: shStyles.goldGlow, fontWeight: 700 }}>{wins} WON</span>
        <span style={{ color: shStyles.greenFaint, textShadow: 'none' }}> · </span>
        <span style={{ color: shStyles.greenDim, textShadow: 'none' }}>0 REGRETS</span>
      </div>
      <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          {Array.from({length: 10}).map((_, i) => (
            <span key={i} style={{
              display: 'inline-block', width: 14, height: 6,
              background: i < 7 ? shStyles.green : 'rgba(0,255,0,0.18)',
              boxShadow: i < 7 ? '0 0 6px rgba(0,255,0,0.5)' : 'none',
            }} />
          ))}
        </div>
        <span style={{ color: shStyles.greenFaint, textShadow: 'none', fontSize: '0.7rem', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>BUILD QUEUE</span>
      </div>
    </div>
  );
}

// ── 4. EVENTS — passport-stamp / radar-ping vibe ────────────────────────────
// Vibe: roaming, attended, observed. ".log" file name, location pings.
function HeaderEvents({ count = 12, lastSeen = 'NeurIPS 2025 · Vancouver' }) {
  return (
    <div style={{ fontFamily: '"Anonymous Pro", monospace', color: shStyles.green, textShadow: shStyles.greenGlow, padding: '4px 0' }}>
      {/* Marquee top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
        fontSize: '0.7rem', color: shStyles.greenDim, textShadow: 'none',
        letterSpacing: '0.12em',
      }}>
        <span style={{ color: shStyles.gold, textShadow: shStyles.goldGlow, whiteSpace: 'nowrap' }}>◯ EVENTS.LOG</span>
        <span>›</span>
        <span style={{ whiteSpace: 'nowrap' }}>read&#8209;only</span>
        <span>›</span>
        <span style={{ whiteSpace: 'nowrap' }}>tail&nbsp;&#8209;f</span>
      </div>
      <div style={{
        fontSize: '1.6rem', fontWeight: 700, marginTop: 8,
        textShadow: '0 0 6px rgba(0,255,0,0.6), 0 0 14px rgba(0,255,0,0.3)',
      }}>
        ./events — talks, meetups, conferences
      </div>
      <div style={{ fontSize: '0.82rem', color: shStyles.greenDim, marginTop: 4, textShadow: 'none' }}>
        Where I've shown up to listen, network, and steal sandwiches.
      </div>
      {/* Radar / ping line */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, marginTop: 12,
        fontSize: '0.78rem', flexWrap: 'wrap',
      }}>
        <span style={{ color: shStyles.greenDim, textShadow: 'none', whiteSpace: 'nowrap' }}>[<span style={{ color: shStyles.gold, textShadow: shStyles.goldGlow }}>{count}</span> stamps]</span>
        <span style={{ color: shStyles.greenFaint, textShadow: 'none' }}>·</span>
        <span style={{ color: shStyles.green, textShadow: '0 0 6px rgba(0,255,0,0.5)', whiteSpace: 'nowrap' }}>
          <span className="kni-blink">●</span> last ping: {lastSeen}
        </span>
      </div>
      {/* Ping rings (decorative) */}
      <div style={{ position: 'relative', height: 18, marginTop: 4, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', left: 0, top: 8, height: 1, width: '100%',
          background: 'repeating-linear-gradient(90deg, rgba(0,255,0,0.4) 0, rgba(0,255,0,0.4) 4px, transparent 4px, transparent 9px)',
        }}></div>
        <div style={{
          position: 'absolute', left: '14%', top: 4, width: 8, height: 8, borderRadius: '50%',
          background: shStyles.green, boxShadow: '0 0 8px rgba(0,255,0,0.7)',
        }}></div>
        <div style={{
          position: 'absolute', left: '38%', top: 4, width: 8, height: 8, borderRadius: '50%',
          background: 'rgba(0,255,0,0.4)',
        }}></div>
        <div style={{
          position: 'absolute', left: '62%', top: 4, width: 8, height: 8, borderRadius: '50%',
          background: shStyles.gold, boxShadow: '0 0 8px rgba(255,215,0,0.7)',
        }}></div>
        <div style={{
          position: 'absolute', left: '85%', top: 4, width: 8, height: 8, borderRadius: '50%',
          background: 'rgba(0,255,0,0.5)',
        }}></div>
      </div>
    </div>
  );
}

function SectionHeader({ kind, ...props }) {
  if (kind === 'volunteering') return <HeaderVolunteering {...props} />;
  if (kind === 'hackathons')   return <HeaderHackathons {...props} />;
  if (kind === 'events')       return <HeaderEvents {...props} />;
  return <HeaderWork {...props} />;
}

window.SectionHeader = SectionHeader;
window.HeaderWork = HeaderWork;
window.HeaderVolunteering = HeaderVolunteering;
window.HeaderHackathons = HeaderHackathons;
window.HeaderEvents = HeaderEvents;
