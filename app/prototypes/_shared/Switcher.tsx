'use client';

// PROTOTYPE (issue #9). Throwaway direction switcher for /prototypes/{d,e} (round 2).
// Hidden in production builds and when the URL carries ?clean (screenshots).

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const DIRS = [
  { key: 'd', name: 'Transcript' },
  { key: 'e', name: 'Cutting room' },
];
// Round 1 (a, b, c) was rejected as flat; those routes still exist but are off the switcher.

export default function Switcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [hidden, setHidden] = useState(true);
  const idx = Math.max(0, DIRS.findIndex((d) => pathname.endsWith(`/${d.key}`)));

  useEffect(() => {
    setHidden(process.env.NODE_ENV === 'production' || new URLSearchParams(window.location.search).has('clean'));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest('input, textarea, [contenteditable]')) return;
      if (e.key === 'ArrowRight') router.replace(`/prototypes/${DIRS[(idx + 1) % DIRS.length].key}`);
      if (e.key === 'ArrowLeft') router.replace(`/prototypes/${DIRS[(idx + DIRS.length - 1) % DIRS.length].key}`);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [idx, router]);

  if (hidden) return null;
  const go = (d: number) => router.replace(`/prototypes/${DIRS[(idx + d + DIRS.length) % DIRS.length].key}`);
  const btn: React.CSSProperties = { background: 'none', border: 0, color: 'inherit', font: 'inherit', cursor: 'pointer', padding: '4px 10px' };
  return (
    <div
      style={{
        position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 9999,
        background: '#ff0', color: '#000', border: '2px solid #000', borderRadius: 999,
        font: '600 13px/1 system-ui, sans-serif', display: 'flex', alignItems: 'center', padding: 4,
      }}
    >
      <button style={btn} onClick={() => go(-1)} aria-label="Previous direction">◀</button>
      <span>{DIRS[idx].key.toUpperCase()} ({DIRS[idx].name})</span>
      <button style={btn} onClick={() => go(1)} aria-label="Next direction">▶</button>
    </div>
  );
}
