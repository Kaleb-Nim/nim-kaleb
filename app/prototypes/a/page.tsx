// PROTOTYPE (issue #9), direction A: editorial / typographic.
// One serif carries the page; asides live in the margin like sidenotes.

import { Newsreader, IBM_Plex_Sans } from 'next/font/google';
import { PROFILE, ROLES, PROJECTS, HACK_INTRO, HACK_HIGHLIGHTS, COMMUNITY_INTRO, LINKS } from '@/app/lib/sections';
import Switcher from '../_shared/Switcher';
import s from './a.module.css';

const serif = Newsreader({ subsets: ['latin'], style: ['normal', 'italic'], variable: '--a-serif', axes: ['opsz'] });
const sans = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '500'], variable: '--a-sans' });

export const metadata = { title: 'Prototype A: editorial' };

const range = (start: string, end: string | null) => `${start} to ${end ?? 'now'}`;

export default function DirectionA() {
  return (
    <div className={`${serif.variable} ${sans.variable} ${s.page}`}>
      <style>{`body{background:#F3F4F0;color:#1C1F1D}`}</style>

      <header className={s.masthead}>
        <span className={s.meta}>{PROFILE.location}</span>
        <nav className={s.meta}>
          <a href="#built">Built</a>
          <a href="#worked">Worked</a>
          <a href="#won">Won</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <section className={s.hero}>
        <h1 className={s.name}>Kaleb Nim</h1>
        <div className={s.lede}>
          <p>{PROFILE.line}</p>
          <p className={s.seeking}>{PROFILE.seeking}</p>
        </div>
        <aside className={s.voice}>
          <button type="button" className={s.voiceBtn}>
            <span className={s.wave} aria-hidden>
              <i /><i /><i /><i /><i />
            </span>
            Talk to my AI voice clone
          </button>
          <p className={s.note}>It answers out loud, in my voice, from what&rsquo;s on this page.</p>
        </aside>
      </section>

      <section id="built" className={s.section}>
        <h2 className={s.sectionHead}>Things I&rsquo;ve built</h2>
        {PROJECTS.map((p) => (
          <article key={p.slug} className={s.entry}>
            <div className={s.margin}>
              <span className={s.meta}>{p.name}</span>
              <span className={s.metaDim}>since {p.since}</span>
            </div>
            <div className={s.body}>
              <h3 className={s.headline}>{p.headline}</h3>
              <p>{p.summary}</p>
              <figure className={s.figure}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.hero} alt={`${p.name} screenshot`} />
                <figcaption>{p.name}, {p.kind.toLowerCase()}. Built with {p.stack.join(', ')}.</figcaption>
              </figure>
              <dl className={s.facts}>
                {p.facts.map((f) => (
                  <div key={f.label}>
                    <dt>{f.label}</dt>
                    <dd>{f.value}</dd>
                  </div>
                ))}
              </dl>
              <p className={s.links}>
                {p.links.map((l) => (
                  <a key={l.href} href={l.href}>{l.label.toLowerCase()}</a>
                ))}
              </p>
            </div>
            {p.aside && <p className={s.sidenote}>{p.aside}</p>}
          </article>
        ))}
      </section>

      <section id="worked" className={s.section}>
        <h2 className={s.sectionHead}>Where I&rsquo;ve worked</h2>
        {ROLES.map((r) => (
          <article key={r.org + r.start} className={s.entry}>
            <div className={s.margin}>
              <span className={s.meta}>{range(r.start, r.end)}</span>
              <span className={s.metaDim}>{r.kind}</span>
            </div>
            <div className={s.body}>
              <h3 className={s.role}>
                {r.title}, <span className={s.org}>{r.org}</span>
              </h3>
              {r.headline && <p className={s.roleHead}>{r.headline}</p>}
              {r.bullets.map((b) => (
                <p key={b} className={s.roleText}>{b}</p>
              ))}
            </div>
            {r.aside && <p className={s.sidenote}>&ldquo;{r.aside}&rdquo;</p>}
          </article>
        ))}
      </section>

      <section id="won" className={s.section}>
        <h2 className={s.sectionHead}>{HACK_INTRO.headline}</h2>
        <div className={s.entry}>
          <div className={s.margin} />
          <ol className={s.wins}>
            {HACK_HIGHLIGHTS.map((h) => (
              <li key={h.slug}>
                <span className={s.meta}>{h.year}</span>
                <div>
                  <p className={s.winHead}>{h.headline}</p>
                  <p className={s.winMeta}>{h.event}. {h.result}.</p>
                </div>
              </li>
            ))}
          </ol>
          <p className={s.sidenote}>{HACK_INTRO.aside}</p>
        </div>
        <figure className={`${s.figure} ${s.wide}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/hackathons/wins/hackomania-2026.jpg" alt="HackOmania 2026 winners on stage" />
          <figcaption>HackOmania 2026, first place out of 320+. Photo: GeeksHacking.</figcaption>
        </figure>
      </section>

      <section className={s.section}>
        <h2 className={s.sectionHead}>{COMMUNITY_INTRO.headline}</h2>
        <div className={s.entry}>
          <div className={s.margin}><span className={s.meta}>Singapore Youth AI</span></div>
          <div className={s.body}>
            <p>{COMMUNITY_INTRO.summary}</p>
            {PROFILE.community.slice(1).map((c) => <p key={c}>{c}</p>)}
          </div>
          <p className={s.sidenote}>{COMMUNITY_INTRO.aside}</p>
        </div>
      </section>

      <section id="contact" className={`${s.section} ${s.contact}`}>
        <h2 className={s.closing}>If you&rsquo;re hiring for January 2027, I&rsquo;d like to hear from you.</h2>
        <p className={s.contactLinks}>
          {LINKS.map((l) => (
            <a key={l.href} href={l.href}>{l.dest}</a>
          ))}
        </p>
      </section>

      <footer className={s.footer}>
        <span className={s.metaDim}>Kaleb Nim, {PROFILE.location}. Set in Newsreader and IBM Plex Sans.</span>
      </footer>
      <Switcher />
    </div>
  );
}
