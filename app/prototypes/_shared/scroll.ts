'use client';
// PROTOTYPE (issue #9, round 2). Lenis smooth scroll wired into GSAP's ticker,
// so ScrollTrigger and Lenis agree on every frame.

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);

export { gsap, ScrollTrigger };

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Smooth scroll for the whole page. Returns nothing; cleans up on unmount. */
export function useLenis() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.9 });
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const raf = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);
}

/**
 * Refresh ScrollTriggers top to bottom, whichever component created them. Pins push
 * everything below them down, so a trigger must be measured after every pin above it.
 * Triggers without an element (whole-page ones) go last.
 */
export function refreshInDocumentOrder() {
  const all = ScrollTrigger.getAll();
  const withEl = all.filter((st) => st.trigger instanceof Element);
  withEl.sort((a, b) => ((a.trigger as Element).compareDocumentPosition(b.trigger as Element) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
  withEl.forEach((st, i) => { (st.vars as { refreshPriority?: number }).refreshPriority = withEl.length - i; });
  all.filter((st) => !(st.trigger instanceof Element)).forEach((st) => { (st.vars as { refreshPriority?: number }).refreshPriority = -1; });
  ScrollTrigger.sort();
  ScrollTrigger.refresh();
}
