'use client';

export default function NotFoundPage() {
  return (
    <div className="kni-page">
      <div style={{
        color: '#FF4444',
        textShadow: '0 0 6px rgba(255,68,68,0.6)',
        fontWeight: 700,
        fontSize: '1.1rem',
      }}>
        [SYSTEM] 404 — directory not found
      </div>
      <div style={{
        color: 'rgba(0,255,0,0.7)',
        marginTop: 6,
        fontSize: '0.82rem',
      }}>
        That path doesn&apos;t exist.{' '}
        <a href="#/" style={{
          color: '#FFD700',
          textShadow: '0 0 4px rgba(255,215,0,0.4)',
          textDecoration: 'underline',
        }}>← back to ~/kaleb</a>
      </div>
    </div>
  );
}
