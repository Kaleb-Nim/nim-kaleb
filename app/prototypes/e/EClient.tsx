'use client';
// PROTOTYPE (issue #9, round 3), direction E "Cutting room", full page.
// Every section of the live site is here (Products, Work experience, Hackathons,
// AI community events, Hobbies, Links), each mapped to a clip on the bottom timeline.

import { useEffect, useRef, useState } from 'react';
import { PROFILE, PROJECTS, ROLES, HACK_INTRO, HACK_HIGHLIGHTS, COMMUNITY_INTRO, HOBBIES } from '@/app/lib/content';
import { LINKS, SYAI_ITEMS } from '@/app/lib/sections';
import { HACK_ITEMS } from '@/app/lib/hackathons';
import { gsap, ScrollTrigger, useLenis, prefersReducedMotion, refreshInDocumentOrder } from '../_shared/scroll';
import OverlayChapter from '../_shared/OverlayChapter';
import Switcher from '../_shared/Switcher';
import { CUTS } from '../_shared/housecutMedia';
import s from './e.module.css';

const HC = PROJECTS.find((p) => p.slug === 'housecut')!;
const FPS = 24;

// Top-level segments: the nav, the timeline clips and the page sections all use this list.
const SEGMENTS = [
  { id: 'hero', label: 'Slate' },
  { id: 'products', label: 'Products' },
  { id: 'work-experience', label: 'Work experience' },
  { id: 'hackathons', label: 'Hackathons' },
  { id: 'ai-community-events', label: 'AI community events' },
  { id: 'hobbies', label: 'Hobbies' },
  { id: 'links', label: 'Links' },
];

// Housecut numbers are Kaleb's to supply (round 3 brief, point 4). Never invent them.
const HOUSECUT_METRICS: Array<{ value: number | null; prefix?: string; suffix: string; label: string }> = [
  { value: null, suffix: ' agents', label: 'TODO(Kaleb): real estate agents who have ordered a Housecut' },
  { value: null, suffix: ' listings', label: 'TODO(Kaleb): listings edited and delivered' },
  { value: 3, suffix: ' cuts', label: 'per listing: a slow tour, a beat cut and a hook-first teaser' },
  { value: 24, prefix: 'In ', suffix: ' hours', label: 'from upload to three finished cuts' },
];

// sections.ts copy still carries em dashes; the portfolio's copy rules drop them.
const clean = (t: string) => t.replace(/\s—\s/g, ': ').replace(/—/g, ', ').replace(/https?:\/\/\S+/g, '').replace(/Full slides at\s*\.?/, '').trim();

function Razor({ text, as: Tag = 'h2', className }: { text: string; as?: 'h1' | 'h2'; className?: string }) {
  return (
    <Tag className={`${s.razor} ${className ?? ''}`} aria-label={text}>
      <span className={s.razorGhost} aria-hidden>{text}</span>
      {[0, 1, 2].map((i) => <span key={i} className={s.slice} data-slice={i} aria-hidden>{text}</span>)}
      <span className={s.blade} aria-hidden />
    </Tag>
  );
}

/** Section label drawn as a clip on a track: a name and the timecode it starts at. */
function ClipLabel({ children, at }: { children: React.ReactNode; at: number }) {
  return (
    <p className={s.clipLabel}><span className={s.clipName}>{children}</span><span className={s.clipTc}>{tc(at * FPS)}</span></p>
  );
}

function RecButton({ big }: { big?: boolean }) {
  return (
    <button type="button" className={`${s.rec} ${big ? s.recBig : ''}`}>
      <span className={s.recDot} aria-hidden />
      Talk to my AI voice clone
    </button>
  );
}

function tc(frames: number) {
  const f = Math.floor(frames);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(Math.floor(f / (FPS * 3600)))}:${pad(Math.floor(f / (FPS * 60)) % 60)}:${pad(Math.floor(f / FPS) % 60)}:${pad(f % FPS)}`;
}

const BARS = Array.from({ length: 140 }, (_, i) => Math.round((0.15 + 0.85 * Math.abs(Math.sin(i * 0.37) * Math.sin(i * 0.11 + 1) + 0.25 * Math.sin(i * 1.7))) * 1000) / 1000);

const PIPELINE = [
  { label: 'Raw clips', clips: [[0, 7], [7.5, 13], [13.5, 18], [18.5, 24], [24.5, 30], [30.5, 34], [34.5, 40]].map(([a, b], i) => ({ a, b, t: ['IMG_1795', 'IMG_1797', 'IMG_1799', 'IMG_1800', 'IMG_1803', 'IMG_1804', 'IMG_1809'][i] })) },
  { label: 'Brief', clips: [{ a: 8, b: 30, t: 'Brief + payment' }] },
  { label: 'Dispatcher', clips: [{ a: 31, b: 42, t: 'Picks up the job within a minute' }] },
  { label: 'Cut A', clips: [{ a: 43, b: 78, t: 'Slow tour' }] },
  { label: 'Cut B', clips: [{ a: 43, b: 74, t: 'Beat cut' }] },
  { label: 'Cut C', clips: [{ a: 43, b: 70, t: 'Hook-first teaser' }] },
  { label: 'Review', clips: [{ a: 80, b: 90, t: 'Delivered: email + WhatsApp' }, { a: 90.5, b: 100, t: 'Feedback → revision round' }] },
];

// ── Career timeline: Jan 2023 to Dec 2026, one track per role ──
const MONTHS: Record<string, number> = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
const monthIndex = (m: string | null) => { if (!m) return 3 * 12 + 10; const [mon, yr] = m.split(' '); return (Number(yr) - 2023) * 12 + MONTHS[mon]; };
const SPAN = 48;

const WINS = HACK_HIGHLIGHTS.map((h) => ({
  ...h,
  img: h.photo ?? (HACK_ITEMS.find((x) => x.slug === h.slug)?.thumbnail_local || null),
}));
const REST = HACK_ITEMS.filter((h) => h.thumbnail_local && !HACK_HIGHLIGHTS.some((w) => w.slug === h.slug));

const GRADES: Record<string, [string, string]> = {
  hero: ['#3B2A1A', '#1E2C2E'],
  housecut: ['#0F4A47', '#5A3A12'],
  pipeline: ['#1D3550', '#4A1F2A'],
  overlay: ['#3A3214', '#1F2A22'],
  'work-experience': ['#3A2418', '#1A2A33'],
  hackathons: ['#14324A', '#4A2A12'],
  'ai-community-events': ['#4A1F24', '#123A33'],
  hobbies: ['#2E3A1A', '#3A2A1A'],
  links: ['#5A1A14', '#2A1A10'],
};

export default function EClient() {
  useLenis();
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [leaderDone, setLeaderDone] = useState(false);

  const jump = (id: string) => {
    const l = (window as unknown as { __lenis?: { scrollTo: (t: string, o?: object) => void } }).__lenis;
    if (l) l.scrollTo(`#${id}`, { duration: 1.6 }); else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const el = root.current!;
    const reduce = prefersReducedMotion();
    const ctx = gsap.context(() => {
      // ── Load: a film leader counts down, then a hard cut to the slate ──
      if (reduce) setLeaderDone(true);
      else {
        const L = el.querySelector(`.${s.leader}`)!;
        const nums = L.querySelectorAll(`.${s.leaderNum}`);
        const lt = gsap.timeline({ onComplete: () => setLeaderDone(true) });
        nums.forEach((n) => {
          lt.set(nums, { opacity: 0 }).set(n, { opacity: 1 })
            .fromTo(L.querySelector(`.${s.sweep}`), { '--a': '0deg' }, { '--a': '360deg', duration: 0.62, ease: 'none' })
            .to({}, { duration: 0.04 });
        });
        lt.to(L, { opacity: 0, duration: 0.01 })
          .from(`.${s.heroInner} > *`, { opacity: 0, duration: 0.01, stagger: 0.09 })
          .from(`.${s.voiceTrack} i`, { scaleY: 0, duration: 0.5, stagger: 0.004, ease: 'power2.out' }, '<');
      }

      // ── Timeline bar: playhead and timecode follow the whole scroll ──
      const head = el.querySelector<HTMLElement>(`.${s.playhead}`)!;
      const tcEl = el.querySelector(`.${s.tc}`)!;
      ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (st) => { head.style.left = `${st.progress * 100}%`; tcEl.textContent = tc(st.progress * FPS * 60 * 6); } });

      // ── Which segment is on screen ──
      SEGMENTS.forEach((seg, i) => {
        const node = el.querySelector(`#${seg.id}`);
        if (node) ScrollTrigger.create({ trigger: node, start: 'top 50%', end: 'bottom 50%', onToggle: (st) => st.isActive && setActive(i) });
      });

      // ── Grade lights cross-fade between chapters (no hard edges between sections) ──
      const g1 = el.querySelector(`.${s.g1}`), g2 = el.querySelector(`.${s.g2}`);
      el.querySelectorAll<HTMLElement>('[data-grade]').forEach((node) => {
        const [a, b] = GRADES[node.dataset.grade!];
        ScrollTrigger.create({
          trigger: node, start: 'top 60%', end: 'bottom 40%',
          onToggle: (st) => { if (st.isActive) { gsap.to(g1, { backgroundColor: a, duration: 1.6, ease: 'sine.inOut' }); gsap.to(g2, { backgroundColor: b, duration: 1.6, ease: 'sine.inOut' }); } },
        });
      });

      // ── Count-ups ──
      el.querySelectorAll<HTMLElement>(`.${s.metric} b[data-count]`).forEach((b) => {
        const n = { v: 0 }; const to = +b.dataset.count!; const pre = b.dataset.prefix ?? ''; const post = b.dataset.suffix ?? '';
        gsap.fromTo(n, { v: 0 }, { v: to, duration: 1.4, ease: 'power3.out', snap: { v: 1 }, onUpdate: () => { b.textContent = `${pre}${n.v}${post}`; }, scrollTrigger: { trigger: b, start: 'top 88%' } });
      });
      if (reduce) return;

      // ── Razor-cut headlines (scrubbed) ──
      gsap.utils.toArray<HTMLElement>(`.${s.razor}:not(.${s.noScrub})`).forEach((r) => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: r, start: 'top 92%', end: 'top 45%', scrub: 0.5 } });
        tl.fromTo(r.querySelectorAll(`.${s.slice}`), { xPercent: (i) => (i % 2 ? 50 : -50), opacity: 0 }, { xPercent: 0, opacity: 1, ease: 'power3.out', stagger: 0.08 })
          .fromTo(r.querySelector(`.${s.blade}`), { scaleX: 0, opacity: 1 }, { scaleX: 1, opacity: 0, ease: 'power1.in', duration: 0.4 }, '-=0.2');
      });

      // ── Housecut: fly the camera through a depth-stacked wall of real Cuts ──
      const hc = el.querySelector(`.${s.hcPin}`)!;
      const wall = hc.querySelector(`.${s.wall}`)!;
      const hcTl = gsap.timeline({ scrollTrigger: { trigger: hc, start: 'top top', end: '+=420%', pin: true, scrub: 0.7 } });
      hcTl.fromTo(wall, { '--z': '-400px', '--ry': '-12deg' }, { '--z': '6000px', '--ry': '8deg', ease: 'none', duration: 10 }, 0);
      hcTl.fromTo(hc.querySelectorAll(`.${s.hcTitle} .${s.slice}`), { xPercent: (i) => (i % 2 ? 60 : -60), opacity: 0 }, { xPercent: 0, opacity: 1, stagger: 0.15, duration: 1, ease: 'power3.out' }, 0.1);
      hcTl.from(hc.querySelectorAll(`.${s.hcCopy} > :not(.${s.hcTitle})`), { opacity: 0, y: 24, stagger: 0.25, duration: 0.8 }, 0.5);
      hcTl.to(hc.querySelector(`.${s.hcCopy}`), { opacity: 0, y: -40, duration: 1 }, 4.2);
      hcTl.fromTo(hc.querySelector(`.${s.hcMetrics}`), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1 }, 4.8);
      hcTl.to(hc.querySelector(`.${s.hcMetrics}`), { opacity: 0, y: -40, duration: 0.8 }, 8.4);
      gsap.utils.toArray<HTMLElement>(`.${s.phone}`, wall).forEach((c) => {
        const v = c.querySelector('video');
        ScrollTrigger.create({ trigger: hc, start: 'top bottom', end: 'bottom top', onToggle: (st) => { if (v) { if (st.isActive) v.play().catch(() => {}); else v.pause(); } } });
      });

      // ── How Housecut works: a playhead sweeps the tracks, clips render as it passes ──
      const ed = el.querySelector(`.${s.editPin}`)!;
      const clips = gsap.utils.toArray<HTMLElement>(`.${s.clip}`, ed);
      gsap.set(clips, { clipPath: 'inset(0 100% 0 0)' });
      const eTl = gsap.timeline({ scrollTrigger: { trigger: ed, start: 'top top', end: '+=260%', pin: true, scrub: 0.6 } });
      eTl.fromTo(ed.querySelector(`.${s.editHead}`), { left: '0%' }, { left: '100%', ease: 'none', duration: 10 }, 0);
      clips.forEach((c) => { const a = +c.dataset.a! / 10, b = +c.dataset.b! / 10; eTl.to(c, { clipPath: 'inset(0 0% 0 0)', ease: 'none', duration: b - a }, a); });
      eTl.fromTo(ed.querySelector(`.${s.loopArrow} path`), { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.8 }, 9);
      eTl.from(ed.querySelector(`.${s.editJoke}`), { opacity: 0, y: 20, duration: 0.6 }, 9.3);

      // ── Career: role clips render along the years as you scroll ──
      const career = el.querySelector(`.${s.career}`)!;
      gsap.fromTo(career.querySelectorAll(`.${s.roleClip}`), { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', stagger: 0.15, ease: 'none', scrollTrigger: { trigger: career, start: 'top 80%', end: 'top 30%', scrub: 0.5 } });
      gsap.fromTo(career.querySelector(`.${s.careerHead}`), { left: '0%' }, { left: '100%', ease: 'none', scrollTrigger: { trigger: career, start: 'top 80%', end: 'top 30%', scrub: 0.5 } });
      gsap.utils.toArray<HTMLElement>(`.${s.credit}`).forEach((c) => gsap.from(c, { opacity: 0, y: 30, duration: 0.6, scrollTrigger: { trigger: c, start: 'top 88%' } }));

      // ── Hackathons: win frames develop in; the rest run past on a film strip ──
      gsap.from(el.querySelectorAll(`.${s.win}`), { opacity: 0, y: 60, rotate: (i) => (i % 2 ? 3 : -3), stagger: 0.12, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: el.querySelector(`.${s.wins}`), start: 'top 80%' } });
      const strip = el.querySelector<HTMLElement>(`.${s.filmTrack}`)!;
      gsap.fromTo(strip, { x: 0 }, { x: () => -(strip.scrollWidth - window.innerWidth * 0.9), ease: 'none', scrollTrigger: { trigger: el.querySelector(`.${s.film}`), start: 'top bottom', end: 'bottom top', scrub: 0.4, invalidateOnRefresh: true } });

      // ── AI community: a pinned reel of the sessions, scrolled sideways ──
      const reel = el.querySelector<HTMLElement>(`.${s.reelPin}`)!;
      const track = reel.querySelector<HTMLElement>(`.${s.reelTrack}`)!;
      gsap.to(track, { x: () => -(track.scrollWidth - window.innerWidth + 40), ease: 'none', scrollTrigger: { trigger: reel, start: 'top top', end: () => `+=${track.scrollWidth}`, pin: true, scrub: 0.6, invalidateOnRefresh: true } });

      // ── Hobbies: slates clap shut as they arrive ──
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

      {/* ── Slate ── */}
      <section className={s.hero} id="hero" data-grade="hero">
        <div className={s.heroInner}>
          <p className={s.slateMeta}><span>Scene 1</span><span>Take 1</span><span>{PROFILE.location}</span></p>
          <div className={s.monitor}>
            <span className={s.corner} /><span className={s.corner} /><span className={s.corner} /><span className={s.corner} />
            <h1 className={s.name}>Kaleb Nim</h1>
            <p className={s.lede}>{PROFILE.line}</p>
            <p className={s.lede2}>{PROFILE.seeking}</p>
          </div>
          <div className={s.trackRow}>
            <span className={s.trackName}>A1</span>
            <div className={s.voiceTrack} aria-hidden>{BARS.map((h, i) => <i key={i} style={{ transform: `scaleY(${h})` }} />)}</div>
            <span className={s.trackFile}>kaleb_voice_clone.wav</span>
          </div>
          <div className={s.heroCta}>
            <RecButton big />
            <p className={s.note}>That waveform is a clone of my voice. Press record and ask it anything on this page. It doesn&rsquo;t do retakes.</p>
          </div>
        </div>
      </section>

      {/* ── Products: Housecut ── */}
      <section id="products" className={s.chapter}>
        <div className={s.hcPin} data-grade="housecut">
          <div className={s.stage3d}>
            <div className={s.wall}>
              {CUTS.concat(CUTS).map((c, i) => (
                <figure key={i} className={s.phone} style={{ '--x': `${((i * 37) % 9) - 4}`, '--y': `${((i * 23) % 5) - 2}`, '--d': `${i}` } as React.CSSProperties}>
                  <video src={c.src} poster={c.poster} muted loop playsInline preload="metadata" />
                  <figcaption><span>{tc(i * 173 + 41)}</span>{c.name}</figcaption>
                </figure>
              ))}
            </div>
          </div>
          <div className={s.hcCopy}>
            <ClipLabel at={72}>Products I&rsquo;ve built · now building</ClipLabel>
            <Razor text="Housecut" className={`${s.noScrub} ${s.hcTitle} ${s.productName}`} />
            <p className={s.hcSub}>{HC.headline}</p>
            <p className={s.hcProblem}>Agents film viewings on their phones, and the clips sit in the camera roll. Most agents have no editor, and a videographer is slow and expensive for one listing. Housecut turns those clips into three finished listing videos.</p>
            <p className={s.hcAside}>&ldquo;{ROLES[0].aside}&rdquo;</p>
          </div>
          <div className={s.hcMetrics}>
            <ul className={s.metricList}>
              {HOUSECUT_METRICS.map((m) => (
                <li key={m.label} className={`${s.metric} ${m.value === null ? s.todo : ''}`}>
                  {m.value === null
                    ? <b>TODO{m.suffix}</b>
                    : <b data-count={m.value} data-prefix={m.prefix ?? ''} data-suffix={m.suffix}>{m.prefix ?? ''}{m.value}{m.suffix}</b>}
                  <span>{m.label}</span>
                </li>
              ))}
            </ul>
            <p className={s.hcFoot}>Every phone flying past is a real cut Housecut delivered. <a className={s.link} href={HC.links[0].href}>housecut.app</a></p>
          </div>
        </div>

        <div className={s.editPin} data-grade="pipeline">
          <ClipLabel at={140}>Housecut, under the hood</ClipLabel>
          <Razor text="How Housecut works" className={s.editTitle} />
          <div className={s.nle}>
            <div className={s.ruler} aria-hidden>{Array.from({ length: 11 }, (_, i) => <span key={i}>{tc(i * 24 * 60 * 2.4)}</span>)}</div>
            {PIPELINE.map((t, i) => (
              <div key={i} className={s.track}>
                <span className={s.tName}>{t.label}</span>
                <div className={s.lane}>
                  {t.clips.map((c, k) => <span key={k} className={`${s.clip} ${s['c' + i]}`} data-a={c.a} data-b={c.b} style={{ left: `${c.a}%`, width: `${c.b - c.a}%` }}>{c.t}</span>)}
                </div>
              </div>
            ))}
            <span className={s.editHead} aria-hidden />
            <svg className={s.loopArrow} viewBox="0 0 1000 60" preserveAspectRatio="none" aria-hidden><path d="M950,4 C950,52 900,52 600,52 L360,52 C330,52 320,40 320,10" /></svg>
          </div>
          <p className={s.editNote}>A Claude Code worker edits each listing into three cuts, rendered with HyperFrames. An automation on my machine dispatches the job, delivers the cuts and loops the customer&rsquo;s feedback back in.</p>
          <p className={s.editJoke}>There is no approve button. A customer approves a cut by downloading it and going quiet.</p>
        </div>

        <div data-grade="overlay">
          <OverlayChapter variant="suite" label={<ClipLabel at={260}>Products I&rsquo;ve built · shipped</ClipLabel>} />
        </div>
      </section>

      {/* ── Work experience ── */}
      <section className={s.section} id="work-experience" data-grade="work-experience">
        <ClipLabel at={360}>Work experience</ClipLabel>
        <Razor text="Three years, five roles." />
        <div className={s.career} aria-label="Roles on a timeline from 2023 to 2026">
          <div className={s.years}>{[2023, 2024, 2025, 2026].map((y) => <span key={y}>{y}</span>)}</div>
          {ROLES.slice().reverse().map((r) => {
            const a = monthIndex(r.start), b = monthIndex(r.end);
            return (
              <div key={r.org + r.start} className={s.careerTrack}>
                <span className={s.roleClip} style={{ left: `${(a / SPAN) * 100}%`, width: `${(Math.max(1, b - a) / SPAN) * 100}%` }}>{r.org.replace(/ \(.*\)/, '')}</span>
              </div>
            );
          })}
          <span className={s.careerHead} aria-hidden />
        </div>
        <div className={s.credits}>
          {ROLES.map((r) => (
            <article key={r.org + r.start} className={s.credit}>
              <div className={s.logo} style={{ background: r.logoBg }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.logo} alt="" />
              </div>
              <div>
                <p className={s.role}>{r.title} · {r.kind} · {r.start} to {r.end ?? 'now'}</p>
                <h3>{r.org}</h3>
                {r.headline && <p className={s.roleHead}>{r.headline}</p>}
                {r.aside && <p className={s.aside}>&ldquo;{r.aside}&rdquo;</p>}
                <ul className={s.bullets}>{r.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
                {r.links?.map((l) => <a key={l.href} className={s.link} href={l.href}>{l.label === 'ARXIV' ? 'Read the paper on arXiv' : l.label.toLowerCase()}</a>)}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── Hackathons ── */}
      <section className={s.section} id="hackathons" data-grade="hackathons">
        <ClipLabel at={470}>Hackathons</ClipLabel>
        <Razor text={HACK_INTRO.headline} />
        <p className={s.sectionAside}>{HACK_INTRO.aside}</p>
        <div className={s.wins}>
          {WINS.map((w) => (
            <figure key={w.slug} className={s.win}>
              <div className={s.frame}>
                {w.img
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={w.img} alt={`${w.event}`} />
                  : <span className={s.noPhoto}>{w.event}</span>}
              </div>
              <figcaption>
                <strong>{w.event}</strong>
                <span className={s.prize}>{w.result}</span>
                <em>{w.headline}</em>
                {w.photoCredit && <small>Photo: {w.photoCredit}</small>}
              </figcaption>
            </figure>
          ))}
        </div>
        <div className={s.film}>
          <p className={s.filmLabel}>The other {REST.length} I have pictures of, from 2021 on</p>
          <div className={s.filmTrack}>
            {REST.map((h) => (
              <figure key={h.slug} className={s.filmFrame}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={h.thumbnail_local} alt="" loading="lazy" />
                <figcaption>{h.title.replace(/\s*\[.*\]/, '')}<span>{h.date && h.date !== 'null' ? h.date : ''}</span></figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI community events ── */}
      <section className={s.sectionFlush} id="ai-community-events" data-grade="ai-community-events">
        <div className={s.communityIntro}>
          <ClipLabel at={590}>AI community events</ClipLabel>
          <Razor text={COMMUNITY_INTRO.headline} />
          <p className={s.sectionAside}>&ldquo;{COMMUNITY_INTRO.aside}&rdquo;</p>
          <div className={s.communityCols}>
            <p>{COMMUNITY_INTRO.summary}</p>
            <ul>{PROFILE.community.slice(0, 2).map((c) => <li key={c}>{c}</li>)}</ul>
          </div>
        </div>
        <div className={s.reelPin}>
          <div className={s.reelTrack}>
            <article className={`${s.session} ${s.sessionFeatured}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={featured.hero!} alt={featured.title} />
              <div>
                <p className={s.sessionMeta}>#{featured.num} · {featured.date}</p>
                <h3>{clean(featured.title)}</h3>
                <p>{clean(featured.desc)}</p>
                <div className={s.sessionThumbs}>{featured.gallery.filter(Boolean).map((g) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={g!} src={g!} alt="" />
                ))}</div>
              </div>
            </article>
            {others.map((m) => (
              <article key={m.num} className={s.session}>
                {m.hero
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={m.hero} alt={m.title} loading="lazy" />
                  : <span className={s.noPhoto}>{m.title}</span>}
                <p className={s.sessionMeta}>#{m.num} · {m.date}</p>
                <h3>{clean(m.title)}</h3>
                <p>{clean(m.desc)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Hobbies ── */}
      <section className={s.section} id="hobbies" data-grade="hobbies">
        <ClipLabel at={760}>Hobbies</ClipLabel>
        <Razor text="Off the clock." />
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
      </section>

      {/* ── Links ── */}
      <section className={s.contact} id="links" data-grade="links">
        <ClipLabel at={830}>Links</ClipLabel>
        <Razor text="That's a wrap. Your turn." />
        <RecButton big />
        <ul className={s.linkList}>
          {LINKS.map((l) => <li key={l.href}><a href={l.href}><span>{l.dest}</span>{l.value}</a></li>)}
        </ul>
      </section>

      {/* ── Persistent timeline: one clip per section, click to jump ── */}
      <div className={s.timeline}>
        <span className={s.tc} aria-hidden>00:00:00:00</span>
        <div className={s.strip}>
          {SEGMENTS.map((seg, i) => (
            <button type="button" key={seg.id} className={`${s.seg} ${i === active ? s.segOn : ''}`} onClick={() => jump(seg.id)}>{seg.label}</button>
          ))}
          <span className={s.playhead} aria-hidden />
        </div>
      </div>
      <Switcher />
    </div>
  );
}
