'use client';

import { useState, useEffect } from 'react';

function parseHash(): string {
  if (typeof window === 'undefined') return '';
  const h = (window.location.hash || '#/').replace(/^#\/?/, '');
  return h.split('/')[0] || '';
}

/**
 * useHashRoute — returns the first path segment after `#/`.
 *
 * - `''` for home (`#/` or no hash)
 * - `'work-experience'` for `#/work-experience` (and `#/work-experience/...`)
 *
 * SSR-safe: initial state is `''` on the server; the first client effect
 * syncs to the actual hash. This avoids React 19 hydration mismatches when
 * the URL contains a hash on first paint.
 *
 * On every `hashchange`, scrolls window to top so each route lands at y=0.
 */
export function useHashRoute(): string {
  const [route, setRoute] = useState<string>('');

  useEffect(() => {
    // Initialise from current hash on mount (avoids hydration mismatch)
    setRoute(parseHash());
    const handler = () => {
      setRoute(parseHash());
      window.scrollTo({ top: 0, behavior: 'auto' });
    };
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  return route;
}

/**
 * navigateTo — imperative hash navigation helper.
 * `navigateTo('')` returns home (`#/`); any other id becomes `#/<id>`.
 */
export function navigateTo(routeId: string): void {
  if (typeof window === 'undefined') return;
  window.location.hash = routeId ? `#/${routeId}` : '#/';
}
