'use client';
// PROTOTYPE (issue #9, round 2), direction D client: all motion lives here.

import { useCallback, useEffect, useRef, useState } from 'react';
import { PROFILE, PROJECTS, ROLES, HACK_INTRO, HACK_HIGHLIGHTS } from '@/app/lib/content';
import { LINKS } from '@/app/lib/sections';
import { gsap, ScrollTrigger, useLenis, prefersReducedMotion, refreshInDocumentOrder } from '../_shared/scroll';
import OverlayChapter from '../_shared/OverlayChapter';
import Switcher from '../_shared/Switcher';
import { CUTS } from '../_shared/housecutMedia';
import HousecutCylinder, { type CylinderHandle } from './HousecutCylinder';
import HarnessD from './HarnessD';
import s from './d.module.css';

const HC = PROJECTS.find((p) => p.slug === 'housecut')!;
const HOUSECUT_ROLE = ROLES[0];

const CHAPTERS = [
  { id: 'hero', label: 'Intro', glow: ['#FFB38A', '#9CCBFF', '#FFE08A'] },
  { id: 'housecut', label: 'Housecut', glow: ['#7FE0C0', '#FFC36B', '#9CCBFF'] },
  { id: 'harness', label: 'How it edits', glow: ['#6FD6FF', '#FF9A7A', '#B8F28C'] },
  { id: 'overlay', label: 'Overlay Notes', glow: ['#C9BDFF', '#FFD36B', '#FF9A9A'] },
  { id: 'work', label: 'Work', glow: ['#FFC9A8', '#A8E6D8', '#D9E2EC'] },
  { id: 'contact', label: 'Your turn', glow: ['#FF7A45', '#FFB38A', '#9CCBFF'] },
];

function Words({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className}>
      {text.split(' ').map((w, i) => (
        <span key={i} className={s.w}>{w}{' '}</span>
      ))}
    </span>
  );
}

// A deterministic "speech" waveform path for the dividers.
function wavePath(seed: number, w = 1200, h = 80, n = 160) {
  let d = `M0,${h / 2}`;
  for (let i = 1; i <= n; i++) {
    const x = (i / n) * w;
    const env = Math.sin((i / n) * Math.PI) ** 0.6;
    const y = h / 2 + env * (Math.sin(i * 0.9 + seed) * 0.6 + Math.sin(i * 0.23 + seed * 3) * 0.4) * (h / 2 - 4) * (0.35 + 0.65 * Math.abs(Math.sin(i * 0.07 + seed)));
    d += ` L${x.toFixed(1)},${y.toFixed(1)}`;
  }
  return d;
}

function Divider({ seed, stamp }: { seed: number; stamp: string }) {
  return (
    <div className={s.divider} data-divider>
      <span className={s.stamp}>{stamp}</span>
      <svg viewBox="0 0 1200 80" preserveAspectRatio="none" aria-hidden><path d={wavePath(seed)} /></svg>
    </div>
  );
}

function MicButton({ big }: { big?: boolean }) {
  return (
    <button type="button" className={`${s.mic} ${big ? s.micBig : ''}`} data-mic>
      <span className={s.micDot} aria-hidden />
      <span>Talk to my AI voice clone</span>
    </button>
  );
}

/** The live oscilloscope under the hero. Idle it murmurs; hover the mic and it talks. */
function Scope() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!; const g = c.getContext('2d')!;
    let raf = 0; let amp = 0.25; let target = 0.25;
    const onOver = (e: Event) => { if ((e.target as HTMLElement).closest('[data-mic]')) target = 1; };
    const onOut = (e: Event) => { if ((e.target as HTMLElement).closest('[data-mic]')) target = 0.25; };
    document.addEventListener('pointerover', onOver); document.addEventListener('pointerout', onOut);
    const reduce = prefersReducedMotion();
    const draw = (t: number) => {
      const w = (c.width = c.clientWidth * devicePixelRatio), h = (c.height = c.clientHeight * devicePixelRatio);
      amp += (target - amp) * 0.06;
      g.clearRect(0, 0, w, h);
      for (let k = 0; k < 3; k++) {
        g.beginPath();
        g.lineWidth = (k === 0 ? 3 : 1.5) * devicePixelRatio;
        g.strokeStyle = k === 0 ? '#FF5B1F' : `rgba(14,16,19,${0.22 - k * 0.06})`;
        for (let x = 0; x <= w; x += 4) {
          const u = x / w;
          const env = Math.sin(u * Math.PI);
          const syll = 0.5 + 0.5 * Math.sin(u * 9 - t / 380 + k);
          const y = h / 2 + env * syll * amp * (h * 0.42) * (Math.sin(u * 60 + t / (120 + k * 40)) * 0.7 + Math.sin(u * 23 - t / 260) * 0.3);
          if (x === 0) g.moveTo(x, y); else g.lineTo(x, y);
        }
        g.stroke();
      }
      if (!reduce) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); document.removeEventListener('pointerover', onOver); document.removeEventListener('pointerout', onOut); };
  }, []);
  return <canvas ref={ref} className={s.scope} aria-hidden />;
}

export default function DClient() {
  useLenis();
  const root = useRef<HTMLDivElement>(null);
  const cyl = useRef<CylinderHandle | null>(null);
  const [front, setFront] = useState(0);
  const [active, setActive] = useState(0);
  const onFront = useCallback((i: number) => setFront(i), []);

  useEffect(() => {
    const el = root.current!;
    const reduce = prefersReducedMotion();
    const ctx = gsap.context(() => {
      // ── Load: the hero transcribes itself (the one orchestrated page-load moment) ──
      const intro = gsap.timeline({ delay: 0.2 });
      intro.from(`.${s.name} .${s.w}`, { yPercent: 40, opacity: 0, filter: 'blur(14px)', duration: 0.9, stagger: 0.12, ease: 'power3.out' });
      el.querySelectorAll<HTMLElement>(`.${s.line}`).forEach((line, i) => {
        intro.from(line.querySelector(`.${s.who}`), { opacity: 0, x: -10, duration: 0.3 }, i === 0 ? '-=0.2' : '+=0.15');
        intro.from(line.querySelectorAll(`.${s.w}`), { opacity: 0, filter: 'blur(8px)', duration: 0.3, stagger: 0.035, ease: 'none' }, '<0.1');
      });
      intro.from(`.${s.heroMic}`, { scale: 0.85, opacity: 0, duration: 0.6, ease: 'back.out(2)' }, '-=0.2');

      // ── Ambient glows re-colour per chapter ──
      const blobs = gsap.utils.toArray<HTMLElement>(`.${s.blob}`);
      CHAPTERS.forEach((ch, i) => {
        const node = el.querySelector(`[data-chapter="${ch.id}"]`);
        if (!node) return;
        ScrollTrigger.create({
          trigger: node, start: 'top 55%', end: 'bottom 45%',
          onToggle: (st) => {
            if (!st.isActive) return;
            setActive(i);
            blobs.forEach((b, k) => gsap.to(b, { backgroundColor: ch.glow[k], duration: 1.2, ease: 'power2.out' }));
          },
        });
      });
      if (!reduce) blobs.forEach((b, k) => gsap.to(b, { xPercent: k % 2 ? -18 : 22, yPercent: k ? 14 : -10, duration: 9 + k * 3, yoyo: true, repeat: -1, ease: 'sine.inOut' }));

      if (reduce) return;

      // ── Waveform dividers draw as they cross the screen ──
      gsap.utils.toArray<HTMLElement>('[data-divider]').forEach((d) => {
        gsap.fromTo(d.querySelector('path'), { drawSVG: '0%' }, { drawSVG: '100%', ease: 'none', scrollTrigger: { trigger: d, start: 'top 90%', end: 'bottom 40%', scrub: true } });
      });

      // ── Housecut: headline transcribes (scrubbed), docks, then the ring of real Cuts turns ──
      const hc = el.querySelector(`.${s.hcPin}`)!;
      const hcTl = gsap.timeline({ scrollTrigger: { trigger: hc, start: 'top top', end: '+=360%', pin: true, scrub: 0.8 } });
      hcTl.from(hc.querySelectorAll(`.${s.giant} .${s.w}`), { opacity: 0.08, filter: 'blur(16px)', y: 30, stagger: 0.25, duration: 1 })
        .to(hc.querySelector(`.${s.caret}`), { opacity: 0, duration: 0.2 })
        .to(hc.querySelector(`.${s.giantWrap}`), { scale: () => (window.innerWidth < 860 ? 0.55 : 0.4), y: () => { const w = hc.querySelector<HTMLElement>(`.${s.giantWrap}`)!; return -(w.offsetTop - w.offsetHeight / 2 - 72); }, transformOrigin: '0% 0%', duration: 1.2, ease: 'power2.inOut' }, '+=0.3')
        .from(hc.querySelector(`.${s.stageCyl}`), { opacity: 0, scale: 0.9, duration: 1 }, '<0.4')
        .from(hc.querySelectorAll(`.${s.hcSide} > *`), { opacity: 0, x: 40, stagger: 0.2, duration: 0.6 }, '<0.3')
        .to({ p: 0 }, { p: 1, duration: 5, ease: 'none', onUpdate() { cyl.current?.setProgress(this.targets()[0].p); } });
      const price = { v: 0 }; const pEl = hc.querySelector(`.${s.price}`)!;
      hcTl.to(price, { v: 45, duration: 1, snap: { v: 1 }, onUpdate: () => { pEl.textContent = `S$${price.v}`; } }, 3.2);

      // ── Harness: draws itself, the three cut lanes fill, the loop closes ──
      const hn = el.querySelector(`.${s.harnessPin}`)!;
      const steps = (n: number) => hn.querySelectorAll(`[data-step="${n}"]`);
      gsap.set(hn.querySelectorAll('.hd-edge'), { drawSVG: '0%', opacity: 0 });
      gsap.set(hn.querySelectorAll('.hd-node'), { opacity: 0, y: 14 });
      gsap.set(hn.querySelectorAll('.hd-fill'), { scaleX: 0, transformOrigin: '0% 50%' });
      const hTl = gsap.timeline({ scrollTrigger: { trigger: hn, start: 'top top', end: '+=260%', pin: true, scrub: 0.6 } });
      hTl.from(hn.querySelectorAll(`.${s.giant2} .${s.w}`), { opacity: 0.08, filter: 'blur(12px)', stagger: 0.15, duration: 0.6 });
      hTl.to(steps(0), { opacity: 1, y: 0, duration: 0.5 });
      hTl.from(hn.querySelectorAll('.hd-clip'), { x: -60, opacity: 0, stagger: 0.06, duration: 0.4 }, '<');
      for (let n = 1; n <= 6; n++) {
        const edges = [...steps(n)].filter((e) => e.classList.contains('hd-edge'));
        const nodes = [...steps(n)].filter((e) => e.classList.contains('hd-node'));
        if (edges.length) hTl.to(edges, { drawSVG: '100%', opacity: 1, duration: 0.6, stagger: 0.08 });
        if (nodes.length) hTl.to(nodes, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 }, '<0.3');
        if (n === 3) hTl.to(hn.querySelectorAll('.hd-fill'), { scaleX: 1, duration: 1.6, stagger: { each: 0.12, from: 'random' }, ease: 'power1.inOut' });
      }
      // On a phone the diagram is wider than the screen, so the camera pans along it as it draws.
      if (window.innerWidth < 860) {
        const svg = hn.querySelector<SVGElement>('.harness')!;
        hTl.to(svg, { x: () => -(svg.getBoundingClientRect().width - window.innerWidth + 40), ease: 'none', duration: hTl.duration() - 0.6 }, 0.6);
      }
    }, el);
    const t = setTimeout(() => refreshInDocumentOrder(), 600);
    return () => { clearTimeout(t); ctx.revert(); };
  }, []);

  return (
    <div ref={root} className={s.page}>
      <div className={s.ambient} aria-hidden><i className={s.blob} /><i className={s.blob} /><i className={s.blob} /><span className={s.grain} /></div>

      <nav className={s.rail} aria-label="Chapters">
        {CHAPTERS.map((c, i) => (
          <a key={c.id} href={`#${c.id}`} className={i === active ? s.on : ''}><span>{c.label}</span></a>
        ))}
      </nav>

      {/* ── Hero ── */}
      <section className={s.hero} id="hero" data-chapter="hero">
        <p className={s.rec}><span className={s.recDot} /> Recording. Everything below is me, talking.</p>
        <h1 className={s.name}><Words text="Kaleb Nim" /></h1>
        <div className={s.transcript}>
          <p className={s.line}><span className={s.who}>[00:01] Kaleb</span><Words text={PROFILE.line} /></p>
          <p className={s.line}><span className={s.who}>[00:06] Kaleb</span><Words text={PROFILE.seeking} /></p>
          <p className={`${s.line} ${s.you}`}><span className={s.who}>[00:09] You</span><span className={s.w}>Ask me something. Out loud.</span><span className={s.blink} aria-hidden /></p>
        </div>
        <div className={s.heroMic}>
          <MicButton big />
          <p className={s.micNote}>It answers in my voice, from everything on this page. It has read the whole thing, which is more than most people do.</p>
        </div>
        <Scope />
      </section>

      <Divider seed={1.3} stamp="[01:12] Now building" />

      {/* ── Housecut chapter ── */}
      <section className={s.chapter} id="housecut" data-chapter="housecut">
        <div className={s.hcPin}>
          <div className={s.giantWrap}>
            <p className={s.chLabel}><span className={s.who}>[01:12] Kaleb</span> Housecut, since {HC.since}</p>
            <h2 className={s.giant}><Words text={HC.headline} /><span className={s.caret} aria-hidden /></h2>
          </div>
          <div className={s.stageCyl}>
            <HousecutCylinder onFront={onFront} handleRef={cyl} />
            <p className={s.cutName}><span>Now playing</span>{CUTS[front].name}</p>
          </div>
          <aside className={s.hcSide}>
            <p className={s.quote}>&ldquo;{HOUSECUT_ROLE.aside}&rdquo;</p>
            <p className={s.bigFact}><b className={s.price}>S$45</b> a listing. Three cuts back within 24 hours.</p>
            <p className={s.small}>Every video on this ring is a real cut Housecut delivered, made from an agent&rsquo;s phone clips.</p>
            <a className={s.link} href={HC.links[0].href}>housecut.app</a>
          </aside>
        </div>
      </section>

      <section className={s.chapter} id="harness" data-chapter="harness">
        <div className={s.harnessPin}>
          <p className={s.chLabel}><span className={s.who}>[02:30] Kaleb</span> What happens after you hit upload</p>
          <h2 className={s.giant2}><Words text="My part: the pipeline, the dispatcher and the review loop." /></h2>
          <div className={s.harnessWrap}><HarnessD /></div>
        </div>
      </section>

      <Divider seed={4.1} stamp="[03:40] Shipped" />

      <div data-chapter="overlay">
        <OverlayChapter label={<span className={s.chLabelOnPaper}>[03:40] Kaleb · Overlay Notes</span>} />
      </div>

      <Divider seed={7.7} stamp="[05:02] The day jobs" />

      {/* ── Work, rough ── */}
      <section className={s.work} id="work" data-chapter="work">
        {ROLES.map((r) => (
          <article key={r.org + r.start} className={s.role}>
            <p className={s.when}>{r.start} to {r.end ?? 'now'}</p>
            <div>
              <h3>{r.org} <span>{r.title}</span></h3>
              {r.headline && <p className={s.roleHead}>{r.headline}</p>}
              {r.aside && <p className={s.roleAside}>&ldquo;{r.aside}&rdquo;</p>}
            </div>
          </article>
        ))}
        <article className={s.role}>
          <p className={s.when}>2021 to now</p>
          <div>
            <h3>{HACK_INTRO.headline}</h3>
            <p className={s.roleAside}>&ldquo;{HACK_INTRO.aside}&rdquo;</p>
            <p className={s.small}>{HACK_HIGHLIGHTS.map((h) => h.event).join(', ')}.</p>
          </div>
        </article>
      </section>

      {/* ── Contact ── */}
      <section className={s.contact} id="contact" data-chapter="contact">
        <p className={s.chLabel}><span className={s.who}>[06:00] You</span></p>
        <h2 className={s.giant}>Your turn.</h2>
        <MicButton big />
        <p className={s.links}>{LINKS.map((l) => <a key={l.href} href={l.href}>{l.dest}</a>)}</p>
      </section>
      <Switcher />
    </div>
  );
}
