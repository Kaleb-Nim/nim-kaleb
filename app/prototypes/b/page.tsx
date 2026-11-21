// PROTOTYPE (issue #9), direction B: product-dense, closest to the Jensen reference.
// Every project opens with one people-phrased stat, then a real screenshot, then facts.

import { Schibsted_Grotesk } from 'next/font/google';
import { PROFILE, ROLES, PROJECTS, HACK_INTRO, HACK_HIGHLIGHTS, COMMUNITY_INTRO, LINKS } from '@/app/lib/sections';
import Switcher from '../_shared/Switcher';
import s from './b.module.css';

const grotesk = Schibsted_Grotesk({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--b-sans' });

export const metadata = { title: 'Prototype B: product-dense' };

const MEETUP_PHOTO = '/meetups/2026-05-claude-code/hero.jpg';

export default function DirectionB() {
  const withPhoto = HACK_HIGHLIGHTS.filter((h) => h.photo);
  const without = HACK_HIGHLIGHTS.filter((h) => !h.photo);
  return (
    <div className={`${grotesk.variable} ${s.page}`}>
      <style>{`body{background:#FFFFFF;color:#16181B}`}</style>

      <header className={s.bar}>
        <a href="#top" className={s.wordmark}>Kaleb Nim</a>
        <nav className={s.nav}>
          <a href="#projects">Projects</a>
          <a href="#work">Work</a>
          <a href="#hackathons">Hackathons</a>
          <a href="/kaleb-cv.pdf">CV</a>
        </nav>
      </header>

      <section id="top" className={s.hero}>
        <div>
          <p className={s.kicker}>Kaleb Nim, {PROFILE.location}</p>
          <h1 className={s.h1}>{PROFILE.line}</h1>
          <p className={s.sub}>{PROFILE.seeking}</p>
        </div>
        <div className={s.callout}>
          <p className={s.calloutHead}>Skip the reading. Ask me.</p>
          <p className={s.calloutText}>A voice clone of me answers questions about this page out loud, in my voice.</p>
          <button type="button" className={s.cta}>
            <span className={s.mic} aria-hidden />
            Talk to my AI voice clone
          </button>
          <p className={s.try}>Try: &ldquo;What did you build at RAiD?&rdquo;</p>
        </div>
      </section>

      <section id="projects" className={s.section}>
        {PROJECTS.map((p) => (
          <article key={p.slug} className={s.project}>
            <p className={s.kicker}>{p.name} <span>{p.kind}</span></p>
            <h2 className={s.stat}>{p.headline}</h2>
            {p.aside && <p className={s.aside}>{p.aside}</p>}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={s.shot} src={p.hero} alt={`${p.name} screenshot`} />
            <div className={s.projectBody}>
              <p className={s.summary}>{p.summary}</p>
              <table className={s.facts}>
                <tbody>
                  {p.facts.map((f) => (
                    <tr key={f.label}><th>{f.label}</th><td>{f.value}</td></tr>
                  ))}
                  <tr><th>Stack</th><td>{p.stack.join(', ')}</td></tr>
                </tbody>
              </table>
            </div>
            <p className={s.linkRow}>
              {p.links.map((l) => <a key={l.href} href={l.href} className={s.pill}>{l.label.charAt(0) + l.label.slice(1).toLowerCase()}</a>)}
            </p>
          </article>
        ))}
      </section>

      <section id="work" className={s.section}>
        <h2 className={s.sectionTitle}>Work</h2>
        <ol className={s.timeline}>
          {ROLES.map((r) => (
            <li key={r.org + r.start} className={s.role}>
              <div className={s.logo} style={{ background: r.logoBg }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.logo} alt={r.org} />
              </div>
              <div>
                <p className={s.roleTop}>
                  <strong>{r.org}</strong>
                  <span>{r.title}, {r.start} to {r.end ?? 'now'}</span>
                </p>
                {r.aside && <p className={s.quote}>&ldquo;{r.aside}&rdquo;</p>}
                {r.headline && <p className={s.roleHead}>{r.headline}</p>}
                <ul className={s.bullets}>
                  {r.bullets.map((b) => <li key={b}>{b}</li>)}
                </ul>
                {r.links && <p className={s.linkRow}>{r.links.map((l) => <a key={l.href} href={l.href}>{l.label === 'ARXIV' ? 'Read the paper on arXiv' : l.label.toLowerCase()}</a>)}</p>}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section id="hackathons" className={s.section}>
        <h2 className={s.stat}>{HACK_INTRO.headline}</h2>
        <p className={s.aside}>{HACK_INTRO.aside}</p>
        <div className={s.wins}>
          {withPhoto.map((h) => (
            <figure key={h.slug} className={s.win}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={h.photo!} alt={`${h.event} win`} />
              <figcaption>
                <strong>{h.event}</strong>
                <span>{h.result}</span>
                <em>{h.headline}</em>
              </figcaption>
            </figure>
          ))}
        </div>
        <ul className={s.moreWins}>
          {without.map((h) => (
            <li key={h.slug}><strong>{h.event}</strong> {h.result}. {h.headline}{h.aside ? ` ${h.aside}` : ''}</li>
          ))}
        </ul>
      </section>

      <section className={`${s.section} ${s.community}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={s.shot} src={MEETUP_PHOTO} alt="Singapore Youth AI meetup on Claude Code" />
        <div>
          <h2 className={s.statSmall}>{COMMUNITY_INTRO.headline}</h2>
          <p className={s.aside}>{COMMUNITY_INTRO.aside}</p>
          <p className={s.summary}>{COMMUNITY_INTRO.summary}</p>
        </div>
      </section>

      <section className={s.contact}>
        <h2 className={s.contactHead}>Hiring from January 2027? Say hi.</h2>
        <div className={s.contactLinks}>
          {LINKS.map((l) => (
            <a key={l.href} href={l.href}><span>{l.dest}</span>{l.value}</a>
          ))}
        </div>
      </section>
      <Switcher />
    </div>
  );
}
