'use client';
// PROTOTYPE (issue #9, round 4), direction E "Cutting room", full page.
// Fewer words, more motion: every top-level segment opens with a full-screen,
// scroll-scrubbed interstitial from the same cutting-room system, and the hero is
// Kaleb's live voice clone.

import { useEffect, useRef, useState } from 'react';
import { PROFILE, PROJECTS, ROLES, HACK_HIGHLIGHTS, COMMUNITY_INTRO, HOBBIES } from '@/app/lib/content';
import { LINKS, SYAI_ITEMS } from '@/app/lib/sections';
import { HACK_ITEMS } from '@/app/lib/hackathons';
import { gsap, ScrollTrigger, useLenis, prefersReducedMotion, refreshInDocumentOrder } from '../_shared/scroll';
import OverlayChapter from '../_shared/OverlayChapter';
import Switcher from '../_shared/Switcher';
import { CUTS } from '../_shared/housecutMedia';
import VoiceHero, { type PortraitMode } from './VoiceHero';
import s from './e.module.css';

const HC = PROJECTS.find((p) => p.slug === 'housecut')!;
const FPS = 24;

const SEGMENTS = [
  { id: 'hero', label: 'Slate' },
  { id: 'products', label: 'Products' },
  { id: 'work-experience', label: 'Work' },
  { id: 'hackathons', label: 'Hackathons' },
  { id: 'ai-community-events', label: 'Community' },
  { id: 'hobbies', label: 'Hobbies' },
  { id: 'links', label: 'Links' },
];

// Housecut numbers are Kaleb's to supply. Never invent them.
const HOUSECUT_METRICS: Array<{ value: number | null; prefix?: string; suffix: string; label: string }> = [
  { value: null, suffix: ' agents', label: 'TODO(Kaleb)' },
  { value: null, suffix: ' listings', label: 'TODO(Kaleb)' },
  { value: 3, suffix: ' cuts', label: 'per listing' },
  { value: 24, prefix: 'In ', suffix: ' hours', label: 'upload to delivery' },
];

const clean = (t: string) => t.replace(/\s—\s/g, ': ').replace(/—/g, ', ');

function tc(frames: number) {
  const f = Math.floor(frames);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(Math.floor(f / (FPS * 3600)))}:${pad(Math.floor(f / (FPS * 60)) % 60)}:${pad(Math.floor(f / FPS) % 60)}:${pad(f % FPS)}`;
}

function Slices({ text, className }: { text: string; className?: string }) {
  return (
    <span className={`${s.razor} ${className ?? ''}`}>
      <span className={s.razorGhost} aria-hidden>{text}</span>
      {[0, 1, 2].map((i) => <span key={i} className={s.slice} data-slice={i} aria-hidden>{text}</span>)}
      <span className={s.blade} aria-hidden />
    </span>
  );
}

/** A full-screen title card between segments. `kind` picks its move; the timeline is built in the page effect. */
function Interstitial({ kind, title, sub, children }: { kind: 'zoom' | 'wipe' | 'count' | 'letterbox' | 'clapper' | 'credits'; title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <div className={`${s.inter} ${s['k_' + kind]}`} data-inter={kind}>
      {children}
      <h2 className={s.interTitle} aria-label={title}><Slices text={title} /></h2>
      {sub && <p className={s.interSub}>{sub}</p>}
      {kind === 'wipe' && <span className={s.interHead} aria-hidden />}
      {kind === 'letterbox' && <><span className={`${s.bar} ${s.barTop}`} aria-hidden /><span className={`${s.bar} ${s.barBot}`} aria-hidden /></>}
    </div>
  );
}

const BARS_PIPE = [
  { label: 'Raw clips', clips: [[0, 7], [7.5, 13], [13.5, 18], [18.5, 24], [24.5, 30], [30.5, 34], [34.5, 40]].map(([a, b], i) => ({ a, b, t: ['IMG_1795', 'IMG_1797', 'IMG_1799', 'IMG_1800', 'IMG_1803', 'IMG_1804', 'IMG_1809'][i] })) },
  { label: 'Brief', clips: [{ a: 8, b: 30, t: 'Brief + payment' }] },
  { label: 'Dispatcher', clips: [{ a: 31, b: 42, t: 'Picks it up' }] },
  { label: 'Cut A', clips: [{ a: 43, b: 78, t: 'Slow tour' }] },
  { label: 'Cut B', clips: [{ a: 43, b: 74, t: 'Beat cut' }] },
  { label: 'Cut C', clips: [{ a: 43, b: 70, t: 'Hook-first teaser' }] },
  { label: 'Review', clips: [{ a: 80, b: 90, t: 'Delivered' }, { a: 90.5, b: 100, t: 'Revision round' }] },
];

// Career: Jan 2023 to Dec 2026.
const MONTHS: Record<string, number> = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
const monthIndex = (m: string | null) => { if (!m) return 3 * 12 + 11; const [mon, yr] = m.split(' '); return (Number(yr) - 2023) * 12 + MONTHS[mon]; };
const SPAN = 48;
const CAREER = ROLES.slice().reverse().map((r) => ({ ...r, a: monthIndex(r.start), b: monthIndex(r.end) }));

const WINS = HACK_HIGHLIGHTS.map((h) => ({ ...h, img: h.photo ?? (HACK_ITEMS.find((x) => x.slug === h.slug)?.thumbnail_local || null) }));
const PRIZE = (r: string) => r.split(',')[0].replace(/, out of.*/, '');
const REST = HACK_ITEMS.filter((h) => h.thumbnail_local && !HACK_HIGHLIGHTS.some((w) => w.slug === h.slug));

const GRADES: Record<string, [string, string]> = {
  hero: ['#3B2A1A', '#1E2C2E'], housecut: ['#0F4A47', '#5A3A12'], pipeline: ['#1D3550', '#4A1F2A'], overlay: ['#3A3214', '#1F2A22'],
  'work-experience': ['#3A2418', '#1A2A33'], hackathons: ['#14324A', '#4A2A12'], 'ai-community-events': ['#4A1F24', '#123A33'],
  hobbies: ['#2E3A1A', '#3A2A1A'], links: ['#5A1A14', '#2A1A10'],
};

export default function EClient() {
  useLenis();
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [leaderDone, setLeaderDone] = useState(false);
  // ?portrait=poses picks the stop-motion variant of the hero portrait.
  const [portraitMode, setPortraitMode] = useState<PortraitMode>('grade');
  useEffect(() => { if (new URLSearchParams(window.location.search).get('portrait') === 'poses') setPortraitMode('poses'); }, []);

  const jump = (id: string) => {
    const l = (window as unknown as { __lenis?: { scrollTo: (t: string, o?: object) => void } }).__lenis;
    if (l) l.scrollTo(`#${id}`, { duration: 1.6 }); else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const el = root.current!;
    const reduce = prefersReducedMotion();
    const ctx = gsap.context(() => {
      // ── Load: film leader, then a hard cut to the slate ──
      if (reduce) setLeaderDone(true);
      else {
        const L = el.querySelector(`.${s.leader}`)!;
        const nums = L.querySelectorAll(`.${s.leaderNum}`);
        const lt = gsap.timeline({ onComplete: () => setLeaderDone(true) });
        nums.forEach((n) => {
          lt.set(nums, { opacity: 0 }).set(n, { opacity: 1 })
            .fromTo(L.querySelector(`.${s.sweep}`), { '--a': '0deg' }, { '--a': '360deg', duration: 0.5, ease: 'none' })
            .to({}, { duration: 0.03 });
        });
        lt.to(L, { opacity: 0, duration: 0.01 })
          .from(`.${s.heroCopy} > *`, { opacity: 0, y: 24, filter: 'blur(10px)', duration: 0.7, stagger: 0.12, ease: 'power3.out' })
          .from(`.${s.portraitWrap}`, { opacity: 0, scale: 0.96, duration: 0.8, ease: 'power3.out' }, '<0.2');
      }

      // ── Timeline bar ──
      const head = el.querySelector<HTMLElement>(`.${s.playhead}`)!;
      const tcEl = el.querySelector(`.${s.tc}`)!;
      ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (st) => { head.style.left = `${st.progress * 100}%`; tcEl.textContent = tc(st.progress * FPS * 60 * 6); } });
      SEGMENTS.forEach((seg, i) => {
        const node = el.querySelector(`#${seg.id}`);
        if (node) ScrollTrigger.create({ trigger: node, start: 'top 50%', end: 'bottom 50%', onToggle: (st) => st.isActive && setActive(i) });
      });

      // ── Grade lights ──
      const g1 = el.querySelector(`.${s.g1}`), g2 = el.querySelector(`.${s.g2}`);
      el.querySelectorAll<HTMLElement>('[data-grade]').forEach((node) => {
        const [a, b] = GRADES[node.dataset.grade!];
        ScrollTrigger.create({ trigger: node, start: 'top 60%', end: 'bottom 40%', onToggle: (st) => { if (st.isActive) { gsap.to(g1, { backgroundColor: a, duration: 1.6, ease: 'sine.inOut' }); gsap.to(g2, { backgroundColor: b, duration: 1.6, ease: 'sine.inOut' }); } } });
      });

      // ── Count-ups ──
      el.querySelectorAll<HTMLElement>('b[data-count]').forEach((b) => {
        const n = { v: 0 }; const to = +b.dataset.count!; const pre = b.dataset.prefix ?? ''; const post = b.dataset.suffix ?? '';
        gsap.fromTo(n, { v: 0 }, { v: to, duration: 1.4, ease: 'power3.out', snap: { v: 1 }, onUpdate: () => { b.textContent = `${pre}${n.v}${post}`; }, scrollTrigger: { trigger: b, start: 'top 88%' } });
      });
      if (reduce) return;

      // ── Interstitials: one move each, all scrubbed, all pinned ──
      el.querySelectorAll<HTMLElement>('[data-inter]').forEach((it) => {
        const kind = it.dataset.inter!;
        const slices = it.querySelectorAll(`.${s.slice}`);
        const title = it.querySelector(`.${s.interTitle}`)!;
        const sub = it.querySelector(`.${s.interSub}`);
        const tl = gsap.timeline({ scrollTrigger: { trigger: it, start: 'top top', end: '+=160%', pin: true, scrub: 0.6 } });
        if (kind === 'zoom') {
          tl.fromTo(slices, { xPercent: (i) => (i % 2 ? 110 : -110) }, { xPercent: 0, stagger: 0.12, duration: 1, ease: 'power4.out' })
            .fromTo(it.querySelector(`.${s.blade}`), { scaleX: 0, opacity: 1 }, { scaleX: 1, opacity: 0, duration: 0.5 }, '-=0.3')
            .from(sub, { opacity: 0, y: 20, duration: 0.5 }, '<')
            .to(title, { scale: 14, opacity: 0, duration: 2, ease: 'power2.in', transformOrigin: '38% 50%' }, '+=0.4')
            .to(sub, { opacity: 0, duration: 0.4 }, '<');
        } else if (kind === 'wipe') {
          const wipeHead = it.querySelector(`.${s.interHead}`);
          tl.set(slices, { xPercent: 0 })
            .fromTo(title, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1.6, ease: 'none' })
            .fromTo(wipeHead, { left: '0%' }, { left: '100%', duration: 1.6, ease: 'none' }, '<')
            .from(sub, { opacity: 0, duration: 0.5 })
            .to([title, sub], { yPercent: -60, opacity: 0, duration: 1.2, ease: 'power2.in' }, '+=0.5');
        } else if (kind === 'count') {
          const num = it.querySelector<HTMLElement>(`.${s.bigNum}`)!; const n = { v: 0 };
          const frames = it.querySelectorAll<HTMLElement>(`.${s.flip} img`);
          tl.to(n, { v: 40, duration: 2, ease: 'power1.in', onUpdate: () => { num.textContent = String(Math.round(n.v)); const k = Math.min(frames.length - 1, Math.floor(n.v / 40 * frames.length)); frames.forEach((f, j) => { f.style.opacity = j === k ? '1' : '0'; }); } })
            .fromTo(slices, { xPercent: (i) => (i % 2 ? 80 : -80), opacity: 0 }, { xPercent: 0, opacity: 1, stagger: 0.1, duration: 0.8, ease: 'power3.out' }, '-=0.6')
            .to(it.querySelector(`.${s.countWrap}`), { scale: 0.8, opacity: 0, duration: 1, ease: 'power2.in' }, '+=0.6');
        } else if (kind === 'letterbox') {
          tl.fromTo(it.querySelectorAll(`.${s.bar}`), { height: '50%' }, { height: '16%', duration: 1.2, ease: 'power2.out' })
            .fromTo(title, { scale: 1.4, opacity: 0, filter: 'blur(20px)' }, { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 1.2 }, '<0.2')
            .set(slices, { xPercent: 0 }, 0)
            .from(sub, { opacity: 0, y: 16, duration: 0.6 })
            .to(it.querySelectorAll(`.${s.bar}`), { height: '0%', duration: 1, ease: 'power2.in' }, '+=0.6')
            .to([title, sub], { opacity: 0, duration: 0.8 }, '<');
        } else if (kind === 'clapper') {
          tl.set(slices, { xPercent: 0 }, 0)
            .from(it.querySelector(`.${s.bigSlate}`), { yPercent: 40, opacity: 0, duration: 1 })
            .fromTo(it.querySelector(`.${s.bigStick}`), { rotate: -32 }, { rotate: 0, duration: 0.25, ease: 'power4.in' }, '+=0.4')
            .to(it.querySelector(`.${s.bigSlate}`), { x: 6, duration: 0.05, yoyo: true, repeat: 3 })
            .to(it.querySelector(`.${s.bigSlate}`), { yPercent: -30, opacity: 0, duration: 1, ease: 'power2.in' }, '+=0.6');
        } else if (kind === 'credits') {
          tl.set(slices, { xPercent: 0 }, 0)
            .fromTo(it.querySelector(`.${s.roll}`), { yPercent: 60 }, { yPercent: -120, duration: 3, ease: 'none' })
            .fromTo(title, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.8 }, 1.4);
        }
      });

      // ── Housecut: fly the camera down a tunnel of real Cuts ──
      const hc = el.querySelector(`.${s.hcPin}`)!;
      const wall = hc.querySelector(`.${s.wall}`)!;
      const hcTl = gsap.timeline({ scrollTrigger: { trigger: hc, start: 'top top', end: '+=420%', pin: true, scrub: 0.7 } });
      hcTl.fromTo(wall, { '--z': '0px', '--rz': '0deg' }, { '--z': '7400px', '--rz': '40deg', ease: 'none', duration: 10 }, 0);
      hcTl.fromTo(hc.querySelectorAll(`.${s.hcTitle} .${s.slice}`), { xPercent: (i) => (i % 2 ? 60 : -60), opacity: 0 }, { xPercent: 0, opacity: 1, stagger: 0.15, duration: 1, ease: 'power3.out' }, 0.1);
      hcTl.from(hc.querySelectorAll(`.${s.hcCopy} > :not(.${s.hcTitle})`), { opacity: 0, y: 24, stagger: 0.25, duration: 0.8 }, 0.5);
      hcTl.to(hc.querySelector(`.${s.hcCopy}`), { opacity: 0, y: -40, duration: 1 }, 4.2);
      hcTl.fromTo(hc.querySelector(`.${s.hcMetrics}`), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1 }, 4.8);
      hcTl.to(hc.querySelector(`.${s.hcMetrics}`), { opacity: 0, y: -40, duration: 0.8 }, 8.6);
      hc.querySelectorAll('video').forEach((v) => {
        ScrollTrigger.create({ trigger: hc, start: 'top bottom', end: 'bottom top', onToggle: (st) => { if (st.isActive) v.play().catch(() => {}); else v.pause(); } });
      });

      // ── How Housecut works ──
      const ed = el.querySelector(`.${s.editPin}`)!;
      const clips = gsap.utils.toArray<HTMLElement>(`.${s.clip}`, ed);
      gsap.set(clips, { clipPath: 'inset(0 100% 0 0)' });
      const eTl = gsap.timeline({ scrollTrigger: { trigger: ed, start: 'top top', end: '+=240%', pin: true, scrub: 0.6 } });
      eTl.fromTo(ed.querySelector(`.${s.editHead}`), { left: '0%' }, { left: '100%', ease: 'none', duration: 10 }, 0);
      clips.forEach((c) => { const a = +c.dataset.a! / 10, b = +c.dataset.b! / 10; eTl.to(c, { clipPath: 'inset(0 0% 0 0)', ease: 'none', duration: b - a }, a); });
      eTl.fromTo(ed.querySelector(`.${s.loopArrow} path`), { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.8 }, 9);
      eTl.from(ed.querySelector(`.${s.editJoke}`), { opacity: 0, y: 20, duration: 0.6 }, 9.3);

      // ── Work: scrub the career like footage; the monitor shows the role under the playhead ──
      const wk = el.querySelector(`.${s.workPin}`)!;
      const wHead = wk.querySelector<HTMLElement>(`.${s.workHead}`)!;
      const panels = wk.querySelectorAll<HTMLElement>(`.${s.rolePanel}`);
      const clipsW = wk.querySelectorAll<HTMLElement>(`.${s.workClip}`);
      let shown = -1;
      const show = (m: number) => {
        let k = CAREER.findIndex((r) => m >= r.a && m <= r.b);
        if (k < 0) k = CAREER.reduce((best, r, i) => (r.a <= m ? i : best), 0);
        if (k === shown) return; shown = k;
        panels.forEach((p, i) => p.classList.toggle(s.panelOn, i === k));
        clipsW.forEach((c, i) => c.classList.toggle(s.clipOn, i === k));
      };
      show(CAREER[0].a);
      const p = { m: CAREER[0].a };
      gsap.timeline({ scrollTrigger: { trigger: wk, start: 'top top', end: '+=300%', pin: true, scrub: 0.5 } })
        .fromTo(p, { m: CAREER[0].a }, { m: SPAN - 1, ease: 'none', duration: 1, onUpdate: () => { wHead.style.left = `${(p.m / SPAN) * 100}%`; show(p.m); } });

      // ── Hackathons ──
      gsap.from(el.querySelectorAll(`.${s.win}`), { opacity: 0, y: 60, rotate: (i) => (i % 2 ? 3 : -3), stagger: 0.12, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: el.querySelector(`.${s.wins}`), start: 'top 80%' } });
      const strip = el.querySelector<HTMLElement>(`.${s.filmTrack}`)!;
      gsap.fromTo(strip, { x: 0 }, { x: () => -(strip.scrollWidth - window.innerWidth * 0.9), ease: 'none', scrollTrigger: { trigger: el.querySelector(`.${s.film}`), start: 'top bottom', end: 'bottom top', scrub: 0.4, invalidateOnRefresh: true } });

      // ── Community reel ──
      const reel = el.querySelector<HTMLElement>(`.${s.reelPin}`)!;
      const track = reel.querySelector<HTMLElement>(`.${s.reelTrack}`)!;
      gsap.to(track, { x: () => -(track.scrollWidth - window.innerWidth + 40), ease: 'none', scrollTrigger: { trigger: reel, start: 'top top', end: () => `+=${track.scrollWidth * 0.8}`, pin: true, scrub: 0.6, invalidateOnRefresh: true } });

      // ── Hobbies ──
      gsap.utils.toArray<HTMLElement>(`.${s.slate}`).forEach((sl, i) => {
        gsap.fromTo(sl.querySelector(`.${s.clapper}`), { rotate: -24 }, { rotate: 0, duration: 0.35, ease: 'power4.in', delay: i * 0.12, scrollTrigger: { trigger: sl, start: 'top 85%' } });
      });
    }, el);
    const t = setTimeout(() => refreshInDocumentOrder(), 700);
    return () => { clearTimeout(t); ctx.revert(); };
  }, []);

  const featured = SYAI_ITEMS.find((m) => m.featured)!;
  const others = SYAI_ITEMS.filter((m) => !m.featured);

  return (
    <div ref={root} className={s.page}>
      <div className={s.room} aria-hidden><i className={s.g1} /><i className={s.g2} /><span className={s.scan} /></div>

      {!leaderDone && (
        <div className={s.leader} aria-hidden>
          <span className={s.sweep} /><span className={s.cross} />
          {[3, 2, 1].map((n) => <b key={n} className={s.leaderNum}>{n}</b>)}
        </div>
      )}

      <header className={s.topbar}>
        <button type="button" className={s.wordmark} onClick={() => jump('hero')}>Kaleb Nim</button>
        <nav className={s.nav} aria-label="Sections">
          {SEGMENTS.slice(1).map((seg, i) => (
            <a key={seg.id} href={`#${seg.id}`} className={active === i + 1 ? s.navOn : ''} onClick={(e) => { e.preventDefault(); jump(seg.id); }}>{seg.label}</a>
          ))}
        </nav>
      </header>

      {/* ── Hero: Kaleb + his live voice clone ── */}
      <section className={s.hero} id="hero" data-grade="hero">
        <VoiceHero
          key={portraitMode}
          mode={portraitMode}
          tagline={
            <>
              <h1 className={s.name}>Kaleb Nim</h1>
              {/* Kaleb's words, verbatim; only the line breaks and weights are ours. */}
              <p className={s.tag1}><b>4 years</b> AI Engineer experience,</p>
              <p className={s.tag2}>casual hackathon hopper <b>40+ hackathons.</b></p>
              <p className={s.tag3}>Startups | Side quests and token maxxing.</p>
              <p className={s.tag4}>NUS</p>
            </>
          }
        />
      </section>

      {/* ── Products ── */}
      <section id="products" className={s.chapter}>
        <Interstitial kind="zoom" title="Now building" sub="Products I'm shipping" />

        <div className={s.hcPin} data-grade="housecut">
          <div className={s.stage3d}>
            <div className={s.wall}>
              {[...CUTS, ...CUTS, ...CUTS].map((c, i) => {
                const a = i * 2.39996; const r = 1 + (i % 3) * 0.18;
                return (
                  <figure key={i} className={s.phone} style={{ '--x': `${(Math.cos(a) * r).toFixed(3)}`, '--y': `${(Math.sin(a) * r).toFixed(3)}`, '--d': `${i}` } as React.CSSProperties}>
                    <video src={c.src} poster={c.poster} muted loop playsInline preload="metadata" />
                  </figure>
                );
              })}
            </div>
          </div>
          <div className={s.hcCopy}>
            <h3 className={s.hcTitle}><Slices text="Housecut" className={s.productName} /></h3>
            <p className={s.hcSub}>Raw phone clips in. Three edited listing videos out.</p>
            <p className={s.hcAside}>&ldquo;{ROLES[0].aside}&rdquo;</p>
          </div>
          <div className={s.hcMetrics}>
            <ul className={s.metricList}>
              {HOUSECUT_METRICS.map((m, i) => (
                <li key={i} className={`${s.metric} ${m.value === null ? s.todo : ''}`}>
                  {m.value === null ? <b>TODO{m.suffix}</b> : <b data-count={m.value} data-prefix={m.prefix ?? ''} data-suffix={m.suffix}>{m.prefix ?? ''}{m.value}{m.suffix}</b>}
                  <span>{m.label}</span>
                </li>
              ))}
            </ul>
            <a className={s.link} href={HC.links[0].href}>housecut.app</a>
          </div>
        </div>

        <div className={s.editPin} data-grade="pipeline">
          <h3 className={s.editTitle}><Slices text="How it works" /></h3>
          <div className={s.nle}>
            {BARS_PIPE.map((t, i) => (
              <div key={i} className={s.track}>
                <span className={s.tName}>{t.label}</span>
                <div className={s.lane}>{t.clips.map((c, k) => <span key={k} className={`${s.clip} ${s['c' + i]}`} data-a={c.a} data-b={c.b} style={{ left: `${c.a}%`, width: `${c.b - c.a}%` }}>{c.t}</span>)}</div>
              </div>
            ))}
            <span className={s.editHead} aria-hidden />
            <svg className={s.loopArrow} viewBox="0 0 1000 60" preserveAspectRatio="none" aria-hidden><path d="M950,4 C950,52 900,52 600,52 L360,52 C330,52 320,40 320,10" /></svg>
          </div>
          <p className={s.editJoke}>There is no approve button. You approve a cut by downloading it.</p>
        </div>

        <div data-grade="overlay"><OverlayChapter variant="suite" /></div>
      </section>

      {/* ── Work ── */}
      <section id="work-experience" data-grade="work-experience">
        <Interstitial kind="wipe" title="Work" sub="2023 → now" />
        <div className={s.workPin}>
          <div className={s.workMonitor}>
            {CAREER.map((r) => (
              <article key={r.org + r.start} className={s.rolePanel}>
                <div className={s.bigLogo} style={{ background: r.logoBg }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={r.logo} alt="" />
                </div>
                <div>
                  <p className={s.roleMeta}>{r.title} · {r.start} – {r.end ?? 'now'}</p>
                  <h3>{r.org.replace(/ \(.*\)/, '')}</h3>
                  {r.headline && <p className={s.roleHead}>{r.headline}</p>}
                  {r.aside && <p className={s.aside}>&ldquo;{r.aside}&rdquo;</p>}
                </div>
              </article>
            ))}
          </div>
          <div className={s.workTimeline}>
            <div className={s.years}>{[2023, 2024, 2025, 2026].map((y) => <span key={y}>{y}</span>)}</div>
            <div className={s.workTrack}>
              {CAREER.map((r) => (
                <span key={r.org + r.start} className={s.workClip} style={{ left: `${(r.a / SPAN) * 100}%`, width: `${(Math.max(1, r.b - r.a) / SPAN) * 100}%` }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={r.logo} alt="" style={{ background: r.logoBg }} />
                </span>
              ))}
            </div>
            <span className={s.workHead} aria-hidden />
          </div>
        </div>
      </section>

      {/* ── Hackathons ── */}
      <section id="hackathons" data-grade="hackathons">
        <Interstitial kind="count" title="Hackathons">
          <div className={s.flip} aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {HACK_ITEMS.filter((h) => h.thumbnail_local).map((h) => <img key={h.slug} src={h.thumbnail_local} alt="" />)}
          </div>
          <p className={s.countWrap}><b className={s.bigNum}>0</b><span>+</span></p>
        </Interstitial>
        <div className={s.section}>
          <div className={s.wins}>
            {WINS.map((w) => (
              <figure key={w.slug} className={s.win}>
                <div className={s.frame}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {w.img ? <img src={w.img} alt={w.event} /> : <span className={s.noPhoto}>{w.event}</span>}
                </div>
                <figcaption><strong>{w.event}</strong><span className={s.prize}>{PRIZE(w.result)}</span></figcaption>
              </figure>
            ))}
          </div>
          <div className={s.film}>
            <div className={s.filmTrack}>
              {REST.map((h) => (
                <figure key={h.slug} className={s.filmFrame}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={h.thumbnail_local} alt="" loading="lazy" />
                  <figcaption>{h.title.replace(/\s*\[.*\]/, '').replace(/^\(.*\)\s*/, '')}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Community ── */}
      <section id="ai-community-events" data-grade="ai-community-events">
        <Interstitial kind="letterbox" title="Community" sub={`${COMMUNITY_INTRO.total} AI meetups. 500+ youths. Singapore Youth AI.`} />
        <div className={s.reelPin}>
          <div className={s.reelTrack}>
            <article className={`${s.session} ${s.sessionFeatured}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={featured.hero!} alt={featured.title} />
              <div>
                <p className={s.sessionMeta}>{featured.date}</p>
                <h3>Claude Code workshop</h3>
                <p>I taught it to 60 people.</p>
                <p className={s.aside}>&ldquo;{COMMUNITY_INTRO.aside}&rdquo;</p>
              </div>
            </article>
            {others.map((m) => (
              <article key={m.num} className={s.session}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {m.hero ? <img src={m.hero} alt={m.title} loading="lazy" /> : <span className={s.noPhoto}>{m.title}</span>}
                <p className={s.sessionMeta}>{m.date}</p>
                <h3>{clean(m.title).replace(/\s*\(.*\)\s*$/, '')}</h3>
              </article>
            ))}
            <article className={`${s.session} ${s.sessionNote}`}>
              <h3>Founding member and Head of Community</h3>
              <p>Panels moderated at AI Singapore&rsquo;s AI Student Developer Conference, 2025 and 2026.</p>
            </article>
          </div>
        </div>
      </section>

      {/* ── Hobbies ── */}
      <section id="hobbies" data-grade="hobbies">
        <Interstitial kind="clapper" title="Off the clock">
          <div className={s.bigSlate} aria-hidden><span className={s.bigStick} /></div>
        </Interstitial>
        <div className={s.section}>
          <div className={s.slates}>
            {HOBBIES.map((h, i) => (
              <article key={h.title} className={s.slate}>
                <span className={s.clapper} aria-hidden />
                <p className={s.slateRow}><span>Scene</span><span>{i + 2}</span></p>
                <h3>{h.title}</h3>
                {h.note && <p>{h.note}</p>}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Links ── */}
      <section id="links" data-grade="links">
        <Interstitial kind="credits" title="That's a wrap">
          <div className={s.roll} aria-hidden>
            <p><span>Written, built and shipped by</span>Kaleb Nim</p>
            <p><span>Edits</span>Housecut</p>
            <p><span>Margin notes</span>Overlay Notes</p>
            <p><span>Voice</span>A clone of Kaleb</p>
          </div>
        </Interstitial>
        <div className={s.contact}>
          <p className={s.seeking}>{PROFILE.seeking}</p>
          <ul className={s.linkList}>{LINKS.map((l) => <li key={l.href}><a href={l.href}><span>{l.dest}</span>{l.value}</a></li>)}</ul>
        </div>
      </section>

      <div className={s.timeline}>
        <span className={s.tc} aria-hidden>00:00:00:00</span>
        <div className={s.strip}>
          {SEGMENTS.map((seg, i) => <button type="button" key={seg.id} className={`${s.seg} ${i === active ? s.segOn : ''}`} onClick={() => jump(seg.id)}>{seg.label}</button>)}
          <span className={s.playhead} aria-hidden />
        </div>
      </div>
      <Switcher />
    </div>
  );
}
