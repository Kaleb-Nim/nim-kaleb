// Terminal.jsx — outer window + chrome bar
// Mirrors nim-kaleb/app/components/Terminal.module.css + TerminalHeader.module.css

const terminalStyles = {
  wrap: {
    position: 'relative',
    zIndex: 1,
    background: '#000000',
    borderRadius: 10,
    boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
    maxWidth: 860,
    width: '90vw',
    margin: '0 auto',
    overflow: 'hidden',
    animation: 'kniFadeIn 400ms ease-out 200ms forwards',
    opacity: 0,
  },
  header: {
    background: '#333333',
    height: 30,
    padding: '8px 12px',
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    borderRadius: '10px 10px 0 0',
    boxSizing: 'border-box',
  },
  dots: { display: 'flex', gap: 8, alignItems: 'center' },
  dot: { width: 12, height: 12, borderRadius: '50%', display: 'block' },
  title: {
    position: 'absolute', left: '50%', transform: 'translateX(-50%)',
    color: '#CCCCCC', fontSize: '0.8rem',
    fontFamily: '"Anonymous Pro", monospace',
    whiteSpace: 'nowrap',
  },
};

function TerminalHeader() {
  return (
    <div style={terminalStyles.header}>
      <div style={terminalStyles.dots}>
        <span style={{...terminalStyles.dot, background:'#FF5F56'}}></span>
        <span style={{...terminalStyles.dot, background:'#FFBD2E'}}></span>
        <span style={{...terminalStyles.dot, background:'#27C93F'}}></span>
      </div>
      <div style={terminalStyles.title}>root@kaleb-nim-400b-0706 ~ %</div>
    </div>
  );
}

function Terminal({ children }) {
  return (
    <div style={terminalStyles.wrap} data-screen-label="Terminal Window">
      <TerminalHeader />
      {children}
    </div>
  );
}

window.Terminal = Terminal;
window.TerminalHeader = TerminalHeader;
