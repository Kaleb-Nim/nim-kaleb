// TerminalBody.jsx — padded content area with phosphor glow
const bodyStyles = {
  content: {
    padding: 24,
    fontFamily: '"Anonymous Pro", monospace',
    fontSize: '0.82rem',
    lineHeight: 1.8,
    color: '#00FF00',
    textShadow: '0 0 4px rgba(0,255,0,0.4), 0 0 8px rgba(0,255,0,0.2), 0 0 16px rgba(0,255,0,0.1)',
    overflow: 'hidden',
    minHeight: 420,
  },
};

function TerminalBody({ children }) {
  return <div style={bodyStyles.content}>{children}</div>;
}

window.TerminalBody = TerminalBody;
