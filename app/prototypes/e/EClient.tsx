'use client';
// PROTOTYPE (issue #9, round 2), direction E client: all motion lives here.

import { useEffect, useRef, useState } from 'react';
import { PROFILE, PROJECTS, ROLES, HACK_INTRO } from '@/app/lib/content';
import { LINKS } from '@/app/lib/sections';
import { gsap, ScrollTrigger, useLenis, prefersReducedMotion } from '../_shared/scroll';
import OverlayChapter from '../_shared/OverlayChapter';
import Switcher from '../_shared/Switcher';
import { CUTS } from '../_shared/housecutMedia';
import s from './e.module.css';

const HC = PROJECTS.find((p) => p.slug === 'housecut')!;
const FPS = 24;

const CHAPTERS = [
  { id: 'hero', label: 'Slate', grade: ['#3B2A1A', '#1E2C2E'] },
  { id: 'housecut', label: 'Housecut', grade: ['#0F4A47', '#5A3A12'] },
  { id: 'harness', label: 'The edit', grade: ['#1D3550', '#4A1F2A'] },
  { id: 'overlay', label: 'Overlay Notes', grade: ['#2B2B2B', '#2B2B2B'] },
  { id: 'work', label: 'Credits', grade: ['#3A2418', '#1A2A33'] },
  { id: 'contact', label: 'Final cut', grade: ['#5A1A14', '#2A1A10'] },
];

/** Headline split into three horizontal slices that arrive from alternating sides: a razor cut. */
function Razor({ text, as: Tag = 'h2', className }: { text: string; as?: 'h1' | 'h2'; className?: string }) {
  return (
    <Tag className={`${s.razor} ${className ?? ''}`} aria-label={text}>
      <span className={s.razorGhost} aria-hidden>{text}</span>
      {[0, 1, 2].map((i) => (
        <span key={i} className={s.slice} data-slice={i} aria-hidden>{text}</span>
      ))}
      <span className={s.blade} aria-hidden />
    </Tag>
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

const tc = (frames: number) => {
  const f = Math.floor(frames);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(Math.floor(f / (FPS * 3600)))}:${pad(Math.floor(f / (FPS * 60)) % 60)}:${pad(Math.floor(f / FPS) % 60)}:${pad(f % FPS)}`;
};

// Deterministic bars for the voice track.
const BARS = Array.from({ length: 140 }, (_, i) => Math.round((0.15 + 0.85 * Math.abs(Math.sin(i * 0.37) * Math.sin(i * 0.11 + 1) + 0.25 * Math.sin(i * 1.7))) * 1000) / 1000);

const TRACKS = [
  { name: 'V1', label: 'Raw clips', clips: [[0, 7], [7.5, 13], [13.5, 18], [18.5, 24], [24.5, 30], [30.5, 34], [34.5, 40]].map(([a, b], i) => ({ a, b, t: ['IMG_1795', 'IMG_1797', 'IMG_1799', 'IMG_1800', 'IMG_1803', 'IMG_1804', 'IMG_1809'][i] })) },
  { name: 'B', label: 'Brief', clips: [{ a: 8, b: 30, t: 'Brief + S$45, Stripe' }] },
  { name: 'D', label: 'Dispatcher', clips: [{ a: 31, b: 42, t: 'Orca automation, every minute' }] },
  { name: 'A', label: 'Cut A', clips: [{ a: 43, b: 78, t: 'Slow tour' }] },
  { name: 'B', label: 'Cut B', clips: [{ a: 43, b: 74, t: 'Beat cut' }] },
  { name: 'C', label: 'Cut C', clips: [{ a: 43, b: 70, t: 'Hook-first teaser' }] },
  { name: 'R', label: 'Review', clips: [{ a: 80, b: 90, t: 'Delivered: email + WhatsApp' }, { a: 90.5, b: 100, t: 'Feedback → revision round' }] },
];

export default function EClient() {
  useLenis();
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [leaderDone, setLeaderDone] = useState(false);

  useEffect(() => {
    const el = root.current!;
    const reduce = prefersReducedMotion();
    const ctx = gsap.context(() => {
      // ── Load: a film leader counts down, then a hard cut to the slate ──
      if (reduce) { setLeaderDone(true); } else {
        const L = el.querySelector(`.${s.leader}`)!;
        const nums = L.querySelectorAll(`.${s.leaderNum}`);
        const lt = gsap.timeline({ onComplete: () => setLeaderDone(true) });
        nums.forEach((n, i) => {
          lt.set(nums, { opacity: 0 }).set(n, { opacity: 1 })
            .fromTo(L.querySelector(`.${s.sweep}`), { '--a': '0deg' }, { '--a': '360deg', duration: 0.62, ease: 'none' })
            .to({}, { duration: 0.04 });
          void i;
        });
        lt.to(L, { opacity: 0, duration: 0.01 })
          .from(`.${s.heroInner} > *`, { opacity: 0, duration: 0.01, stagger: 0.09 })
          .from(`.${s.voiceTrack} i`, { scaleY: 0, duration: 0.5, stagger: 0.004, ease: 'power2.out' }, '<');
      }

      // ── The timeline bar: playhead and timecode follow the whole scroll ──
      const head = el.querySelector<HTMLElement>(`.${s.playhead}`)!;
      const tcEl = el.querySelector(`.${s.tc}`)!;
      ScrollTrigger.create({
        start: 0, end: 'max',
        onUpdate: (st) => {
          head.style.left = `${st.progress * 100}%`;
          tcEl.textContent = tc(st.progress * FPS * 60 * 6);
        },
      });

      // ── Grades re-colour the room per chapter ──
      const g1 = el.querySelector(`.${s.g1}`), g2 = el.querySelector(`.${s.g2}`);
      CHAPTERS.forEach((ch, i) => {
        const node = el.querySelector(`[data-chapter="${ch.id}"]`);
        if (!node) return;
        ScrollTrigger.create({
          trigger: node, start: 'top 55%', end: 'bottom 45%',
          onToggle: (st) => { if (!st.isActive) return; setActive(i); gsap.to(g1, { backgroundColor: ch.grade[0], duration: 1 }); gsap.to(g2, { backgroundColor: ch.grade[1], duration: 1 }); },
        });
      });
      if (reduce) return;

      // ── Razor-cut headlines (scrubbed): three slices slide in from alternate sides ──
      gsap.utils.toArray<HTMLElement>(`.${s.razor}:not(.${s.noScrub})`).forEach((r) => {
        const sl = r.querySelectorAll(`.${s.slice}`);
        const tl = gsap.timeline({ scrollTrigger: { trigger: r, start: 'top 92%', end: 'top 45%', scrub: 0.5 } });
        tl.fromTo(sl, { xPercent: (i) => (i % 2 ? 60 : -60), opacity: 0 }, { xPercent: 0, opacity: 1, ease: 'power3.out', stagger: 0.08 })
          .fromTo(r.querySelector(`.${s.blade}`), { scaleX: 0, opacity: 1 }, { scaleX: 1, opacity: 0, ease: 'power1.in', duration: 0.4 }, '-=0.2');
      });

      // ── Housecut: fly the camera through a depth-stacked wall of real Cuts ──
      const wall = el.querySelector(`.${s.wall}`)!;
      const cards = gsap.utils.toArray<HTMLElement>(`.${s.phone}`, wall);
      const hcTl = gsap.timeline({ scrollTrigger: { trigger: el.querySelector(`.${s.hcPin}`), start: 'top top', end: '+=380%', pin: true, scrub: 0.7 } });
      hcTl.fromTo(wall, { '--z': '-400px', '--ry': '-12deg' }, { '--z': '6000px', '--ry': '8deg', ease: 'none', duration: 10 }, 0);
      hcTl.fromTo(el.querySelectorAll(`.${s.hcCopy} .${s.slice}`), { xPercent: (i) => (i % 2 ? 60 : -60), opacity: 0 }, { xPercent: 0, opacity: 1, stagger: 0.15, duration: 1, ease: 'power3.out' }, 0.2);
      hcTl.from(el.querySelectorAll(`.${s.hcCopy} > *`), { opacity: 0, y: 30, stagger: 0.4, duration: 1 }, 0.3);
      hcTl.to(el.querySelector(`.${s.hcCopy}`), { opacity: 0, y: -40, duration: 1 }, 7.5);
      hcTl.fromTo(el.querySelector(`.${s.hcOut}`), { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 1 }, 8.6);
      cards.forEach((c) => {
        const v = c.querySelector('video');
        ScrollTrigger.create({ trigger: c, start: 'top bottom', end: 'bottom top', onToggle: (st) => { if (v) { if (st.isActive) v.play().catch(() => {}); else v.pause(); } } });
      });

      // ── The edit: a playhead sweeps the tracks, clips render as it passes ──
      const ed = el.querySelector(`.${s.editPin}`)!;
      const sweep = ed.querySelector<HTMLElement>(`.${s.editHead}`)!;
      const clips = gsap.utils.toArray<HTMLElement>(`.${s.clip}`, ed);
      gsap.set(clips, { clipPath: 'inset(0 100% 0 0)' });
      const eTl = gsap.timeline({ scrollTrigger: { trigger: ed, start: 'top top', end: '+=280%', pin: true, scrub: 0.6 } });
      eTl.fromTo(sweep, { left: '0%' }, { left: '100%', ease: 'none', duration: 10 }, 0);
      clips.forEach((c) => {
        const a = +c.dataset.a! / 10, b = +c.dataset.b! / 10;
        eTl.to(c, { clipPath: 'inset(0 0% 0 0)', ease: 'none', duration: b - a }, a);
      });
      eTl.fromTo(ed.querySelector(`.${s.loopArrow} path`), { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.8 }, 9);
      eTl.from(ed.querySelector(`.${s.editJoke}`), { opacity: 0, y: 20, duration: 0.6 }, 9.3);
    }, el);
    const t = setTimeout(() => ScrollTrigger.refresh(), 600);
    return () => { clearTimeout(t); ctx.revert(); };
  }, []);

  return (
    <div ref={root} className={s.page}>
      <div className={s.room} aria-hidden><i className={s.g1} /><i className={s.g2} /><span className={s.scan} /></div>

      {!leaderDone && (
        <div className={s.leader} aria-hidden>
          <span className={s.sweep} />
          <span className={s.cross} />
          {[3, 2, 1].map((n) => <b key={n} className={s.leaderNum}>{n}</b>)}
        </div>
      )}

      {/* ── Slate ── */}
      <section className={s.hero} id="hero" data-chapter="hero">
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

      {/* ── Housecut ── */}
      <section id="housecut" data-chapter="housecut" className={s.chapter}>
        <div className={s.hcPin}>
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
            <p className={s.chLabel}>Now building · Housecut, since {HC.since}</p>
            <Razor text="Agentic video editing for real estate agents." className={s.noScrub} />
            <p className={s.hcLine}>An agent films a viewing on their phone. Housecut sends back three edited cuts within 24 hours, for S$45.</p>
            <p className={s.hcAside}>&ldquo;{ROLES[0].aside}&rdquo;</p>
          </div>
          <div className={s.hcOut}>
            <p className={s.big}>Every phone you just flew past is a real cut Housecut delivered.</p>
            <a className={s.link} href={HC.links[0].href}>housecut.app</a>
          </div>
        </div>
      </section>

      {/* ── The edit (agent harness) ── */}
      <section id="harness" data-chapter="harness" className={s.chapter}>
        <div className={s.editPin}>
          <p className={s.chLabel}>How a listing gets cut</p>
          <Razor text="My part: the pipeline, the dispatcher and the review loop." className={s.editTitle} />
          <div className={s.nle}>
            <div className={s.ruler} aria-hidden>{Array.from({ length: 11 }, (_, i) => <span key={i}>{tc(i * 24 * 60 * 2.4)}</span>)}</div>
            {TRACKS.map((t, i) => (
              <div key={i} className={s.track}>
                <span className={s.tName}>{t.label}</span>
                <div className={s.lane}>
                  {t.clips.map((c, k) => (
                    <span key={k} className={`${s.clip} ${s['c' + i]}`} data-a={c.a} data-b={c.b} style={{ left: `${c.a}%`, width: `${c.b - c.a}%` }}>{c.t}</span>
                  ))}
                </div>
              </div>
            ))}
            <span className={s.editHead} aria-hidden />
            <svg className={s.loopArrow} viewBox="0 0 1000 60" preserveAspectRatio="none" aria-hidden><path d="M950,4 C950,52 900,52 600,52 L360,52 C330,52 320,40 320,10" /></svg>
          </div>
          <p className={s.editJoke}>There is no approve button. A customer approves a cut by downloading it and going quiet.</p>
        </div>
      </section>

      <div data-chapter="overlay">
        <OverlayChapter label={<span className={s.chLabelPaper}>Shipped · reel 2</span>} />
      </div>

      {/* ── Credits (rough) ── */}
      <section className={s.credits} id="work" data-chapter="work">
        <Razor text="Credits" />
        {ROLES.map((r, i) => (
          <article key={r.org + r.start} className={s.credit}>
            <span className={s.edl}>{String(i + 1).padStart(3, '0')}</span>
            <div>
              <p className={s.role}>{r.title}</p>
              <h3>{r.org}</h3>
              {r.headline && <p className={s.roleHead}>{r.headline}</p>}
              {r.aside && <p className={s.aside}>&ldquo;{r.aside}&rdquo;</p>}
            </div>
            <span className={s.when}>{r.start} – {r.end ?? 'now'}</span>
          </article>
        ))}
        <article className={s.credit}>
          <span className={s.edl}>006</span>
          <div><h3>{HACK_INTRO.headline}</h3><p className={s.aside}>&ldquo;{HACK_INTRO.aside}&rdquo;</p></div>
          <span className={s.when}>2021 – now</span>
        </article>
      </section>

      <section className={s.contact} id="contact" data-chapter="contact">
        <Razor text="That's a wrap. Your turn." />
        <RecButton big />
        <p className={s.links}>{LINKS.map((l) => <a key={l.href} href={l.href}>{l.dest}</a>)}</p>
      </section>

      {/* ── Persistent timeline ── */}
      <div className={s.timeline} aria-hidden>
        <span className={s.tc}>00:00:00:00</span>
        <div className={s.strip}>
          {CHAPTERS.map((c, i) => <span key={c.id} className={`${s.seg} ${i === active ? s.segOn : ''}`}>{c.label}</span>)}
          <span className={s.playhead} />
        </div>
      </div>
      <Switcher />
    </div>
  );
}
