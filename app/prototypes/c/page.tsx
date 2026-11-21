// PROTOTYPE (issue #9), direction C: terminal remnant.
// A light, modern page in Hanken Grotesk. Anonymous Pro (the old site's face)
// only appears as prompts, dates and the cursor. The voice panel leans all the way in.

import { Hanken_Grotesk, Anonymous_Pro } from 'next/font/google';
import { PROFILE, ROLES, PROJECTS, HACK_INTRO, HACK_HIGHLIGHTS, COMMUNITY_INTRO, LINKS } from '@/app/lib/sections';
import Switcher from '../_shared/Switcher';
import s from './c.module.css';

const sans = Hanken_Grotesk({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--c-sans' });
const mono = Anonymous_Pro({ subsets: ['latin'], weight: ['400', '700'], variable: '--c-mono' });

export const metadata = { title: 'Prototype C: terminal remnant' };

function Prompt({ cmd }: { cmd: string }) {
  return (
    <p className={s.prompt}>
      <span className={s.ps1}>kaleb@nim:~$</span> {cmd}
    </p>
  );
}

export default function DirectionC() {
  return (
    <div className={`${sans.variable} ${mono.variable} ${s.page}`}>
      <style>{`body{background:#EDEFF1;color:#11151A}`}</style>

      <section className={s.hero}>
        <div className={s.intro}>
          <h1 className={s.name}>Kaleb Nim<span className={s.cursor} aria-hidden /></h1>
          <p className={s.line}>{PROFILE.line}</p>
          <p className={s.seeking}>{PROFILE.seeking}</p>
          <p className={s.heroLinks}>
            {LINKS.slice(0, 4).map((l) => <a key={l.href} href={l.href}>{l.dest}</a>)}
          </p>
        </div>

        <div className={s.term} role="region" aria-label="Voice clone">
          <div className={s.termBar}><span /><span /><span /><em>voice-clone</em></div>
          <div className={s.termBody}>
            <p><span className={s.termPs1}>$</span> talk --to kaleb</p>
            <p className={s.termDim}>connecting to wss://ws.kalebnim.dev ... ready</p>
            <p className={s.termDim}>A clone of my voice will answer anything on this page, out loud.</p>
            <button type="button" className={s.talk}>
              <span className={s.bars} aria-hidden><i /><i /><i /><i /></span>
              Talk to my AI voice clone
            </button>
            <p className={s.termDim}>try: &quot;what was ASTRA?&quot;</p>
          </div>
        </div>
      </section>

      <section className={s.section}>
        <Prompt cmd="ls ~/projects" />
        {PROJECTS.map((p, i) => (
          <article key={p.slug} className={`${s.project} ${i % 2 ? s.flip : ''}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={s.shot} src={p.hero} alt={`${p.name} screenshot`} />
            <div>
              <p className={s.tag}>{p.name.toLowerCase().replace(/\s/g, '-')} <span>{p.status.toLowerCase()} since {p.since}</span></p>
              <h2 className={s.headline}>{p.headline}</h2>
              {p.aside && <p className={s.comment}># {p.aside}</p>}
              <p className={s.text}>{p.summary}</p>
              <dl className={s.facts}>
                {p.facts.map((f) => (
                  <div key={f.label}><dt>{f.label}</dt><dd>{f.value}</dd></div>
                ))}
              </dl>
              <p className={s.links}>{p.links.map((l) => <a key={l.href} href={l.href}>{l.label.toLowerCase()}</a>)}</p>
            </div>
          </article>
        ))}
      </section>

      <section className={s.section}>
        <Prompt cmd="git log --author=kaleb" />
        <ol className={s.log}>
          {ROLES.map((r) => (
            <li key={r.org + r.start}>
              <p className={s.when}>{r.start} to {r.end ?? 'now'}</p>
              <div>
                <h3 className={s.role}>{r.org} <span>{r.title}</span></h3>
                {r.aside && <p className={s.comment}># {r.aside}</p>}
                {r.headline && <p className={s.roleHead}>{r.headline}</p>}
                {r.bullets.map((b) => <p key={b} className={s.text}>{b}</p>)}
                {r.links && <p className={s.links}>{r.links.map((l) => <a key={l.href} href={l.href}>{l.label.toLowerCase()}</a>)}</p>}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className={s.section}>
        <Prompt cmd="grep -c hackathon ~/life" />
        <h2 className={s.big}>{HACK_INTRO.headline}</h2>
        <p className={s.comment}># {HACK_INTRO.aside}</p>
        <div className={s.hackGrid}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={s.shot} src="/hackathons/wins/polyfintech-2023.jpg" alt="PolyFinTech 100 API Hackathon 2023 champions" />
          <ul className={s.wins}>
            {HACK_HIGHLIGHTS.map((h) => (
              <li key={h.slug}>
                <span className={s.when}>{h.year}</span>
                <div>
                  <strong>{h.event}</strong>
                  <p>{h.result}</p>
                  <p className={s.winHead}>{h.headline}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={s.section}>
        <Prompt cmd="cat ~/community.md" />
        <h2 className={s.big}>{COMMUNITY_INTRO.headline}</h2>
        <p className={s.comment}># {COMMUNITY_INTRO.aside}</p>
        <p className={`${s.text} ${s.narrow}`}>{COMMUNITY_INTRO.summary}</p>
      </section>

      <section className={`${s.section} ${s.contact}`}>
        <Prompt cmd="mail kaleb" />
        <a className={s.mail} href="mailto:kaleb.nim@gmail.com">kaleb.nim@gmail.com</a>
        <p className={s.heroLinks}>
          {LINKS.map((l) => <a key={l.href} href={l.href}>{l.dest}</a>)}
        </p>
      </section>
      <Switcher />
    </div>
  );
}
