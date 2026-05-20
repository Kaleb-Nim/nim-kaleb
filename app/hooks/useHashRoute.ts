'use client';

import { useState, useEffect } from 'react';

function parseHashSegments(): string[] {
  if (typeof window === 'undefined') return [];
  const h = (window.location.hash || '#/').replace(/^#\/?/, '');
  return h.split('/').filter(Boolean);
}

function parseHash(): string {
  return parseHashSegments()[0] || '';
}

function parseHashSub(): string {
  return parseHashSegments()[1] || '';
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
 * useHashSubRoute — returns the SECOND path segment or ''.
 *
 * Examples:
 *   '#/hackathons/arcademy-at32jn' → 'arcademy-at32jn'
 *   '#/hackathons'                  → ''
 *   '#/'                            → ''
 *
 * Additive — does NOT affect existing single-segment callers. Does NOT
 * scroll on hashchange; scroll behaviour belongs to the primary route hook.
 */
export function useHashSubRoute(): string {
  const [sub, setSub] = useState<string>('');

  useEffect(() => {
    setSub(parseHashSub());
    const handler = () => setSub(parseHashSub());
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  return sub;
}

/**
 * navigateTo — imperative hash navigation helper.
 * `navigateTo('')` returns home (`#/`); any other id becomes `#/<id>`.
 */
export function navigateTo(routeId: string): void {
  if (typeof window === 'undefined') return;
  window.location.hash = routeId ? `#/${routeId}` : '#/';
}
