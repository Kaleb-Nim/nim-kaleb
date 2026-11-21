#!/usr/bin/env bun
/**
 * build-voice-facts.ts
 * Renders the portfolio content (app/lib/content.ts + the meetups in
 * app/lib/sections.ts + app/data/hackathons.json) into the generated block of
 * prompts/system-prompt.md, so the voice clone says what the site says.
 *
 * Usage:
 *   bun run voice-facts          # rewrite the block
 *   bun run voice-facts --check  # exit 1 if the block is stale (for CI)
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import {
  PROFILE,
  ROLES,
  PROJECTS,
  HACK_INTRO,
  HACK_HIGHLIGHTS,
  COMMUNITY_INTRO,
  HOBBIES,
  SYAI_ITEMS,
  HACK_ITEMS,
  HACK_STATS,
} from '../app/lib/sections';

const PROMPT_PATH = join(import.meta.dir, '..', 'prompts', 'system-prompt.md');
const BEGIN = '<!-- BEGIN:content (generated from app/lib/content.ts by `bun run voice-facts`; do not edit by hand) -->';
const END = '<!-- END:content -->';

function render(): string {
  const out: string[] = [];
  const line = (s = '') => out.push(s);

  // Fail loudly if a highlight points at a hackathon that isn't in the data.
  for (const h of HACK_HIGHLIGHTS) {
    if (!HACK_ITEMS.some((p) => p.slug === h.slug)) {
      throw new Error(`HACK_HIGHLIGHTS slug "${h.slug}" not found in app/data/hackathons.json`);
    }
  }

  line('## Background');
  line();
  line(`${PROFILE.line} Based in ${PROFILE.location}. ${PROFILE.seeking}`);
  if (PROFILE.aside) line(`Aside you can use: ${PROFILE.aside}`);
  line();

  line('### Work Experience');
  line();
  for (const r of ROLES) {
    line(`**${r.title} at ${r.org}** (${r.start} – ${r.end ?? 'present'}, ${r.kind})`);
    if (r.headline) line(`- Headline: ${r.headline}`);
    for (const b of r.bullets) line(`- ${b}`);
    if (r.aside) line(`- Aside: ${r.aside}`);
    line();
  }

  line('### Projects');
  line();
  for (const p of PROJECTS) {
    line(`**${p.name}** (${p.kind}, ${p.status.toLowerCase()} since ${p.since})`);
    line(`- Headline: ${p.headline}`);
    line(`- What it is: ${p.summary}`);
    for (const f of p.facts) line(`- ${f.label}: ${f.value}`);
    line(`- Stack: ${p.stack.join(', ')}`);
    if (p.aside) line(`- Aside: ${p.aside}`);
    line(`- Links: ${p.links.map((l) => l.href).join(', ')}`);
    line();
  }

  line('### Hackathons');
  line();
  line(`${HACK_INTRO.headline} ${HACK_INTRO.aside} (${HACK_STATS.total} are listed on the site, ${HACK_STATS.wins} of them wins.)`);
  line();
  for (const h of HACK_HIGHLIGHTS) {
    line(`- **${h.event}:** ${h.result}. ${h.headline}${h.aside ? ` Aside: ${h.aside}` : ''}`);
  }
  line();

  line('### Education');
  line();
  for (const e of PROFILE.education) {
    line(`- **${e.credential}, ${e.school}** (${e.dates})${e.note ? `. ${e.note}` : ''}`);
  }
  line();

  line('### Community & Leadership');
  line();
  line(`${COMMUNITY_INTRO.headline} ${COMMUNITY_INTRO.summary}`);
  line(`Aside: ${COMMUNITY_INTRO.aside}`);
  for (const c of PROFILE.community) line(`- ${c}`);
  line();
  line(`${COMMUNITY_INTRO.total} meetups so far. The ones on the site, most recent first:`);
  for (const m of SYAI_ITEMS) {
    line(`- #${m.num}, ${m.date}: ${m.title}`);
  }
  line();

  line('### Technical Skills');
  line();
  for (const [k, v] of Object.entries(PROFILE.skills)) line(`- **${k}:** ${v.join(', ')}`);
  line();

  line('### Personal');
  line();
  for (const h of HOBBIES) line(h.note ? `- ${h.title}: ${h.note}` : `- ${h.title}`);
  line();

  return `${BEGIN}\n${out.join('\n').trimEnd()}\n${END}`;
}

const prompt = readFileSync(PROMPT_PATH, 'utf-8');
const a = prompt.indexOf(BEGIN);
const b = prompt.indexOf(END);
if (a < 0 || b < 0) {
  console.error(`Markers not found in ${PROMPT_PATH}. Add ${BEGIN} … ${END} around the facts block.`);
  process.exit(1);
}
const next = prompt.slice(0, a) + render() + prompt.slice(b + END.length);

if (process.argv.includes('--check')) {
  if (next !== prompt) {
    console.error('prompts/system-prompt.md is stale. Run `bun run voice-facts`.');
    process.exit(1);
  }
  console.log('voice facts up to date');
} else {
  writeFileSync(PROMPT_PATH, next, 'utf-8');
  console.log(`wrote generated facts block to ${PROMPT_PATH}`);
}
