'use client';
// PROTOTYPE (issue #9, round 2). The Overlay Notes chapter, shared by every direction.
// It borrows the overlay-notes.kalebnim.dev look on purpose (ruled paper, Shantell Sans,
// violet marker, red handwriting) and demos the core feature: the page scrolls, the
// notes stay pinned to the words they annotate, and each note draws itself.

import { useEffect, useRef } from 'react';
import { Shantell_Sans, Public_Sans } from 'next/font/google';
import { PROJECTS } from '@/app/lib/content';
import { gsap, ScrollTrigger, prefersReducedMotion, refreshInDocumentOrder } from './scroll';
import s from './overlay.module.css';

const hand = Shantell_Sans({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--on-hand' });
const sans = Public_Sans({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--on-sans' });

const ON = PROJECTS.find((p) => p.slug === 'overlay-notes')!;

type MarkKind = 'underline' | 'circle' | 'box';
function Mark({ kind, children, note, side = 'right', color = 'violet', id }: {
  kind: MarkKind; children: React.ReactNode; note?: React.ReactNode; side?: 'right' | 'below' | 'left'; color?: 'violet' | 'orange' | 'ink'; id: string;
}) {
  // The note is a sibling, absolutely placed in the doc's right margin at its line's height.
  return (
    <>
      <span className={`${s.mark} ${s[color]}`} data-mark={id}>
        {children}
        <svg className={s[`k_${kind}`]} viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden>
          {kind === 'underline' && <path className="ink" d="M2,24 C25,20 50,28 98,22" />}
          {kind === 'circle' && <path className="ink" d="M50,2 C85,1 99,9 98,16 C97,25 70,29 45,28 C15,27 1,22 2,14 C3,6 25,2 58,3" />}
          {kind === 'box' && <path className="ink" d="M3,3 L97,2 L98,27 L2,28 Z" />}
        </svg>
      </span>
      {note && (
        <span className={`${s.note} ${s[color]} ${side === 'below' ? s.lower : ''}`} data-note={id}>
          <svg className={s.arrowSvg} viewBox="0 0 60 30" aria-hidden><path className="ink" d="M58,6 C40,2 18,8 4,24 M4,24 L6,12 M4,24 L16,22" /></svg>
          <span className={s.noteText}>{note}</span>
        </span>
      )}
    </>
  );
}

export default function OverlayChapter({ label, variant = 'paper' }: { label?: React.ReactNode; variant?: 'paper' | 'suite' }) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current!;
    const ctx = gsap.context(() => {
      const reduce = prefersReducedMotion();
      const doc = el.querySelector<HTMLElement>(`.${s.doc}`)!;
      const viewport = el.querySelector<HTMLElement>(`.${s.viewport}`)!;
      const marks = gsap.utils.toArray<HTMLElement>('[data-mark]', el);

      // Headline squiggle and count-up, once, when the chapter arrives.
      gsap.from(el.querySelectorAll(`.${s.squiggle} path`), { drawSVG: '0%', duration: 1.1, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 60%' } });
      el.querySelectorAll<HTMLElement>('[data-count]').forEach((counter) => {
        const n = { v: 0 };
        const to = Number(counter.dataset.count);
        const pre = counter.dataset.prefix ?? '', post = counter.dataset.suffix ?? '';
        gsap.fromTo(n, { v: 0 }, { v: to, duration: 1.6, ease: 'power3.out', snap: { v: 1 }, onUpdate: () => { counter.textContent = `${pre}${n.v}${post}`; }, scrollTrigger: { trigger: counter, start: 'top 85%' } });
      });

      if (reduce) return;
      // Hide every stroke and note; they draw as the page scrolls past them.
      marks.forEach((m) => {
        const note = el.querySelector(`[data-note="${m.dataset.mark}"]`);
        gsap.set([...m.querySelectorAll('.ink'), ...(note ? note.querySelectorAll('.ink') : [])], { drawSVG: '0%' });
        if (note) gsap.set(note.querySelectorAll(`.${s.noteText}`), { clipPath: 'inset(0 100% 0 0)' });
      });

      const travel = () => Math.max(0, doc.scrollHeight - viewport.clientHeight + 40);
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el.querySelector(`.${s.stage}`), start: 'top top', end: () => `+=${travel() * 2.2 + 600}`, pin: true, scrub: 0.6, invalidateOnRefresh: true },
      });
      tl.to(doc, { y: () => -travel(), ease: 'none', duration: 10 }, 0);
      // Each mark draws when it reaches the upper-middle of the viewport.
      marks.forEach((m) => {
        const at = () => Math.max(0, Math.min(9, ((m.offsetTop - viewport.clientHeight * 0.55) / Math.max(1, travel())) * 10));
        const pos = at();
        const note = el.querySelector(`[data-note="${m.dataset.mark}"]`);
        tl.to(m.querySelectorAll('.ink'), { drawSVG: '100%', duration: 0.6, ease: 'power1.inOut' }, pos);
        if (note) {
          tl.to(note.querySelectorAll('.ink'), { drawSVG: '100%', duration: 0.4 }, pos + 0.4);
          tl.to(note.querySelectorAll(`.${s.noteText}`), { clipPath: 'inset(0 0% 0 0)', duration: 0.8, ease: 'none' }, pos + 0.6);
        }
      });
      // The real screenshot below drops in at a tilt, then its own notes draw.
      gsap.from(el.querySelector(`.${s.polaroid}`), { rotate: 9, y: 120, opacity: 0, duration: 1, ease: 'back.out(1.4)', scrollTrigger: { trigger: el.querySelector(`.${s.proof}`), start: 'top 75%' } });
      gsap.from(el.querySelectorAll(`.${s.proof} .ink`), { drawSVG: '0%', duration: 0.9, stagger: 0.2, delay: 0.5, scrollTrigger: { trigger: el.querySelector(`.${s.proof}`), start: 'top 70%' } });
    }, el);
    const t = setTimeout(() => refreshInDocumentOrder(), 400);
    return () => { clearTimeout(t); ctx.revert(); };
  }, []);

  return (
    <section ref={root} className={`${hand.variable} ${sans.variable} ${s.chapter} ${variant === 'suite' ? s.suite : ''}`} id="overlay-notes" data-chapter="overlay">
      <div className={s.stage}>
        {variant === 'suite' ? (
          <div className={s.copy}>
            {label && <div className={s.label}>{label}</div>}
            <h2 className={s.productName}>Overlay Notes</h2>
            <svg className={s.squiggle} viewBox="0 0 320 22" aria-hidden><path d="M4,14 C50,4 80,20 130,11 S220,2 260,13 S310,7 316,12" /></svg>
            <p className={s.sub}>A Chrome extension for drawing and annotating notes right on top of any web page.</p>
            <ul className={s.metrics}>
              <li><b className={s.count} data-count={ON.installs ?? 600} data-suffix=" installs">{ON.installs ?? 600} installs</b><span>on the Chrome Web Store, {ON.installsAsOf}</span></li>
              <li><b>Version {ON.version}</b><span>live and still maintained</span></li>
              <li><b className={s.count} data-count={20} data-prefix="Top " data-suffix=" of 65">Top 20 of 65</b><span>at the Acacia AI Symposium Launchpad</span></li>
            </ul>
            <p className={s.aside}>{ON.aside}</p>
          </div>
        ) : (
        <div className={s.copy}>
          {label && <div className={s.label}>{label}</div>}
          <p className={s.kicker}>Chrome extension, since {ON.since} ↴</p>
          <h2 className={s.h2}>Draw &amp; annotate notes on <span>any webpage</span></h2>
          <svg className={s.squiggle} viewBox="0 0 320 22" aria-hidden><path d="M4,14 C50,4 80,20 130,11 S220,2 260,13 S310,7 316,12" /></svg>
          <p className={s.aside}>{ON.aside}</p>
          <p className={s.stat}><b className={s.count} data-count={ON.installs ?? 600}>0</b> students drawing on the web.<br /><span>Version {ON.version} on the Chrome Web Store.</span></p>
          <p className={s.how}>Keep scrolling. The page on the right scrolls, my notes stay stuck to the words. That&rsquo;s the whole product.</p>
        </div>
        )}
        <div className={s.browser}>
          <div className={s.chrome}><i /><i /><i /><span>127.0.0.1:8000/2526-s2/02-type.html</span></div>
          <div className={s.toolbar} aria-hidden><b>✎ Annotate</b><span className={s.swatch} /><span className={`${s.swatch} ${s.sw2}`} /><span className={`${s.swatch} ${s.sw3}`} /></div>
          <div className={s.viewport}>
            <article className={s.doc}>
              <h3>Unit 2: Variable and Type</h3>
              <div className={s.box}>
                <p className={s.boxHead}>Learning Objectives</p>
                <p>After this unit, students should be able to:</p>
                <ul>
                  <li>explain how variables and types act as <Mark id="m1" kind="underline">abstractions</Mark> over memory and data, and why they are necessary for writing meaningful programs.</li>
                  <li>distinguish between static vs. dynamic typing and <Mark id="m2" kind="underline" color="ink" note="strong vs weak idk actly">strong vs. weak</Mark> typing, and reason about their consequences for error detection and program safety.</li>
                  <li>identify and apply Java&rsquo;s <Mark id="m3" kind="box" color="ink" note="Arrays with int?" side="below">primitive types</Mark>, including their sizes, literal forms, and value semantics.</li>
                  <li>apply the widening conversion rule (S &lt;: T) to predict and explain <Mark id="m4" kind="underline" color="orange">compile-time type</Mark> errors in Java programs.</li>
                </ul>
              </div>
              <div className={s.box}>
                <p className={s.boxHead}>Overview</p>
                <p>As programs grow in size and complexity, programmers must manage an increasing number of data values and the operations performed on them. Writing correct programs is not just about syntax: it is about ensuring that operations on data are meaningful and safe.</p>
              </div>
              <h4>2.1 Dynamic vs. static type</h4>
              <p>In a <Mark id="m5" kind="circle" note={<>So IMO: dynamic var can change,<br />static can&rsquo;t after it&rsquo;s assigned</>}>statically typed</Mark> language, the type of a variable is fixed when it is declared. A dynamically typed variable can hold values of different types over its lifetime.</p>
              <p>Java is statically typed. The compiler checks every assignment against the declared type before the program ever runs.</p>
              <h4>2.2 Subtypes of primitive types</h4>
              <p>A type S is a subtype of T, written S &lt;: T, if a piece of code written for T can safely use a value of S instead.</p>
              <p>For primitive types: byte &lt;: short &lt;: int &lt;: long &lt;: float &lt;: double, and char &lt;: int. The <Mark id="m6" kind="underline" color="violet" note="Never seen this, prob the typing venn diagram" side="below">widening conversion</Mark> rule lets Java assign a value of a subtype to a variable of its supertype.</p>
              <p>Narrowing the other way needs an explicit cast, and the compiler will not let you forget it.</p>
              <h4>2.3 Strong vs. weak typing</h4>
              <p>A strongly typed language enforces type rules and rejects code that breaks them. A weakly typed language is more permissive and may convert between types quietly.</p>
            </article>
          </div>
        </div>
      </div>

      <div className={s.proof}>
        <figure className={s.polaroid}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/prototypes/overlay/annotate-hero.png" alt="Real Overlay Notes session: handwritten notes and arrows over CS2030 lecture notes" />
          <span className={s.tape} aria-hidden />
        </figure>
        <div className={s.proofNotes}>
          <p className={s.redNote}>the real thing, from my<br />actual CS2030 notes ↙</p>
          <svg className={s.bigArrow} viewBox="0 0 90 60" aria-hidden><path className="ink" d="M84,8 C50,4 20,26 10,52" /><path className="ink" d="M4,40 L9,54 L22,48" /></svg>
          <dl className={s.facts}>
            {ON.facts.map((f) => <div key={f.label}><dt>{f.label}</dt><dd>{f.value}</dd></div>)}
          </dl>
          <div className={s.ctas}>
            <a className={s.btnPrimary} href={ON.links[1].href}>+ Add to Chrome</a>
            <a className={s.btnDashed} href={ON.links[2].href}>Read the source</a>
          </div>
        </div>
      </div>
    </section>
  );
}
