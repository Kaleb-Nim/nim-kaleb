// VoicePanel.jsx — inline voice interface that mounts within the terminal body
// when the user clicks the [VOICE] row. Not gated behind a command — opens
// instantly on click, can be dismissed.

const vpStyles = {
  green:      '#00FF00',
  greenDim:   'rgba(0,255,0,0.7)',
  greenFaint: 'rgba(0,255,0,0.35)',
  gold:       '#FFD700',
  red:        '#FF4444',
  glow:       '0 0 4px rgba(0,255,0,0.4), 0 0 8px rgba(0,255,0,0.2)',
  goldGlow:   '0 0 4px rgba(255,215,0,0.4), 0 0 8px rgba(255,215,0,0.2)',
};

// Reactive ellipsis cycling 1→2→3 dots
function VPellipsis() {
  const [dots, setDots] = React.useState(1);
  React.useEffect(() => {
    const id = setInterval(() => setDots(d => (d % 3) + 1), 400);
    return () => clearInterval(id);
  }, []);
  return <span>{'.'.repeat(dots)}</span>;
}

// Bars-style "listening" visualizer (purely decorative, CSS keyframes)
function VPBars({ active }) {
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 18 }}>
      {[0, 1, 2, 3, 4, 5, 6].map(i => (
        <span key={i} style={{
          width: 3, height: '100%',
          background: active ? vpStyles.green : 'rgba(0,255,0,0.25)',
          boxShadow: active ? '0 0 6px rgba(0,255,0,0.5)' : 'none',
          animation: active ? `kniBars 1s ease-in-out ${i * 0.08}s infinite` : 'none',
          transformOrigin: 'bottom',
        }} />
      ))}
    </div>
  );
}

const FAKE_RESPONSES = [
  "Yeah, so — this whole portfolio is running a clone of my voice through Qwen3-TTS. Wild that it works. What do you want to dig into?",
  "Good question. The hardest thing I've built? Probably ASTRA — autonomous sim-pilots for ATC training. Real-time speech, multi-agent. Took months.",
  "Honestly, I just like building. SYAI started as a meetup for kids who hadn't met an LLM yet — now we've run eleven sessions.",
];

function VoicePanel({ onClose }) {
  // PHASES: IDLE -> CONNECTING -> LISTENING -> RESPONDING -> IDLE
  const [phase, setPhase] = React.useState('IDLE');
  const [transcript, setTranscript] = React.useState('');
  const [response, setResponse] = React.useState('');
  const respIdxRef = React.useRef(0);

  const connect = () => {
    setPhase('CONNECTING');
    setTranscript(''); setResponse('');
    setTimeout(() => setPhase('LISTENING'), 1200);
    // Simulated voice cycle
    setTimeout(() => setTranscript("what's the hardest thing you've built?"), 2700);
    setTimeout(() => {
      const t = FAKE_RESPONSES[respIdxRef.current % FAKE_RESPONSES.length];
      respIdxRef.current++;
      setPhase('RESPONDING'); setResponse(t);
    }, 4200);
  };

  const disconnect = () => {
    setPhase('IDLE');
    setTranscript(''); setResponse('');
  };

  React.useEffect(() => {
    // Auto-connect when panel mounts — visitor clicked the CTA already
    connect();
  }, []);

  const active = phase === 'LISTENING' || phase === 'RESPONDING';
  const phaseLabel = {
    CONNECTING: <>Connecting to bun ws server<VPellipsis /></>,
    LISTENING:  'Listening (speak naturally)',
    RESPONDING: 'Responding',
    IDLE:       'Voice idle',
  }[phase];

  return (
    <div className="kni-voice-panel"
         data-screen-label="VoicePanel"
         style={{
           padding: '12px 14px 14px',
           background: 'rgba(255,215,0,0.025)',
           borderLeft: `2px solid ${vpStyles.gold}`,
           boxShadow: 'inset 0 0 18px rgba(255,215,0,0.04), 0 0 18px rgba(255,215,0,0.06)',
           fontFamily: '"Anonymous Pro", monospace',
           animation: 'kniPanelOpen 280ms cubic-bezier(0.22, 1, 0.36, 1) both',
         }}>
      {/* Header line */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
        <span style={{ color: vpStyles.greenFaint, fontSize: '0.72rem' }}>$ ./voice --activate</span>
        <button
          onClick={(e) => { e.stopPropagation(); onClose && onClose(); }}
          style={{
            background: 'transparent', border: 'none',
            color: vpStyles.greenFaint, cursor: 'pointer',
            fontFamily: 'inherit', fontSize: '0.72rem',
            textShadow: '0 0 4px rgba(0,255,0,0.3)',
            padding: 0,
          }}
          aria-label="Close voice panel"
        >
          [x]
        </button>
      </div>

      <div style={{
        color: vpStyles.green, fontSize: '0.98rem', fontWeight: 700,
        textShadow: '0 0 6px rgba(0,255,0,0.55), 0 0 14px rgba(0,255,0,0.25)',
        marginTop: 4,
      }}>
        Talk to Kaleb's AI clone
      </div>
      <div style={{ color: vpStyles.greenDim, fontSize: '0.78rem', textShadow: 'none', marginTop: 2 }}>
        Real-time voice — ASR → LLM → TTS pipeline with my cloned voice.
      </div>

      {/* Status line + bars */}
      <div style={{
        marginTop: 14, display: 'flex', alignItems: 'center', gap: 14,
        flexWrap: 'wrap',
      }}>
        <VPBars active={active} />
        <span style={{
          color: phase === 'RESPONDING' ? vpStyles.gold : vpStyles.green,
          textShadow: phase === 'RESPONDING' ? vpStyles.goldGlow : vpStyles.glow,
          fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.04em',
        }}>
          {phaseLabel}
        </span>
        <span style={{ color: vpStyles.greenFaint, fontSize: '0.72rem' }}>
          phase: {phase.toLowerCase()}
        </span>
      </div>

      {/* Transcript + Response */}
      {transcript && (
        <div style={{ marginTop: 12, fontSize: '0.82rem' }}>
          <span style={{ color: vpStyles.gold, textShadow: vpStyles.goldGlow }}>you: </span>
          <span style={{ color: vpStyles.green, textShadow: vpStyles.glow }}>{transcript}</span>
        </div>
      )}
      {response && (
        <div style={{ marginTop: 8, fontSize: '0.82rem' }}>
          <span style={{ color: vpStyles.greenFaint }}>kaleb: </span>
          <span style={{ color: vpStyles.green, textShadow: vpStyles.glow }}>{response}</span>
        </div>
      )}

      {/* Action row */}
      <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        {phase === 'IDLE' ? (
          <button onClick={connect} className="kni-mic-btn" style={micBtnStyle(false)}>
            <span>●</span><span>Connect</span>
          </button>
        ) : (
          <button onClick={disconnect} className="kni-mic-btn" style={micBtnStyle(true)}>
            <span>■</span><span>Disconnect</span>
          </button>
        )}
        <span style={{ color: vpStyles.greenFaint, fontSize: '0.7rem', letterSpacing: '0.04em' }}>
          [bun ws server — dashscope asr + llm + tts pipeline]
        </span>
      </div>
    </div>
  );
}

function micBtnStyle(recording) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 10,
    background: 'transparent', fontFamily: '"Anonymous Pro", monospace',
    fontSize: '0.82rem', padding: '6px 16px', cursor: 'pointer',
    transition: 'box-shadow 0.2s, border-color 0.2s',
  };
  if (recording) return {
    ...base,
    border: `1px solid ${vpStyles.red}`,
    color: vpStyles.red,
    textShadow: '0 0 6px rgba(255,68,68,0.6)',
    boxShadow: '0 0 12px rgba(255,68,68,0.4)',
    animation: 'kniRecordPulse 1.2s ease-in-out infinite',
  };
  return {
    ...base,
    border: `1px solid ${vpStyles.green}`,
    color: vpStyles.green,
    textShadow: vpStyles.glow,
    boxShadow: '0 0 6px rgba(0,255,0,0.15)',
  };
}

window.VoicePanel = VoicePanel;
