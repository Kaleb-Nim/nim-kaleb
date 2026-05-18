// FloatingMic.jsx — persistent voice CTA bottom-right on every page
// Clicking opens an overlay voice panel. Has clear idle / active visual states.
// Mobile: circular button, 56px. Desktop: pill with label.

const fmStyles = {
  green:      '#00FF00',
  greenFaint: 'rgba(0,255,0,0.5)',
  gold:       '#FFD700',
  red:        '#FF4444',
  bg:         '#000',
};

function FloatingMic({ active, onToggle }) {
  return (
    <button
      onClick={onToggle}
      aria-label={active ? 'Close voice panel' : 'Open voice — talk to Kaleb\'s AI clone'}
      className="kni-floating-mic"
      style={{
        position: 'fixed',
        bottom: 'max(18px, env(safe-area-inset-bottom, 18px))',
        right: 'max(18px, env(safe-area-inset-right, 18px))',
        zIndex: 30,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 18px',
        background: fmStyles.bg,
        border: `1.5px solid ${active ? fmStyles.red : fmStyles.gold}`,
        borderRadius: 999,
        color: active ? fmStyles.red : fmStyles.gold,
        textShadow: active
          ? '0 0 6px rgba(255,68,68,0.7)'
          : '0 0 4px rgba(255,215,0,0.55), 0 0 8px rgba(255,215,0,0.3)',
        boxShadow: active
          ? '0 0 16px rgba(255,68,68,0.45), 0 12px 28px rgba(0,0,0,0.55)'
          : '0 0 14px rgba(255,215,0,0.35), 0 12px 28px rgba(0,0,0,0.55)',
        cursor: 'pointer',
        fontFamily: '"Anonymous Pro", monospace',
        fontSize: '0.82rem',
        fontWeight: 700,
        letterSpacing: '0.04em',
        animation: active ? 'kniFloatPulse 1.4s ease-in-out infinite' : 'none',
        transition: 'transform 120ms ease-out, border-color 120ms ease-out',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <span aria-hidden="true" style={{ fontSize: '1.05rem', lineHeight: 1 }}>
        {active ? '■' : '●'}
      </span>
      <span className="kni-floating-mic-label">
        {active ? 'voice live' : 'talk to me'}
      </span>
    </button>
  );
}

window.FloatingMic = FloatingMic;
