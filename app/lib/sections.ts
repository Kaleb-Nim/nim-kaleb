// app/lib/sections.ts — typed port of LINKS, SECTIONS, and the six item arrays
// from .planning/research/v3-design-kit/index-data.jsx.
//
// Per CONTEXT.md decision (v3.0): the `id` field for each Section MUST equal
// its `path` value (so hash routes are `#/work-experience`, `#/syai-meetups`,
// etc.). The source-of-truth `id` ('work', 'meetups') is intentionally NOT
// used as the route slug.
//
// Counts must match user spec: Work (4), SYAI Meetups (11),
// Hackathons (data-derived from .planning/research/hackathons/hackathons.json),
// Sidequests (30+), Hobbies (5), Links (5).

import { HACK_ITEMS, HACK_STATS, type HackathonItem } from './hackathons';

// Re-export from the JSON-backed module so consumers can keep importing
// HACK_ITEMS / HackathonItem from '@/app/lib/sections' if they prefer.
export type {
  HackathonItem,
  HackathonTeamMember,
  HackStats,
} from './hackathons';
export { HACK_ITEMS, HACK_STATS } from './hackathons';

// ── Types ──────────────────────────────────────────────────────────────────

export interface Link {
  label: string;
  value: string;
  href: string;
}

export interface ItemLink {
  label: string;
  href: string;
}

export interface WorkItem {
  date: string;
  title: string;
  org: string;
  logo: string;
  logoBg: string;
  note: string;
  tag: 'ACTIVE' | 'SHIPPED' | 'ARCHIVED';
  tagLabel?: string;
}

export interface Speaker {
  name: string;
  role: string;
  linkedin: string;
}

export interface MeetupItem {
  num: number;
  date: string;
  title: string;
  desc: string;
  speakers: Speaker[];
  hero: string | null;
  gallery: Array<string | null>;
  signup?: string;
}

export interface SideItem {
  date: string;
  title: string;
  note?: string;
  link?: ItemLink;
}

export interface HobbyItem {
  title: string;
  note: string;
}

export interface LinkPageItem {
  title: string;
  note: string;
  link: ItemLink;
}

export interface Section {
  id: string;          // hash slug (== path for v3.0)
  path: string;        // breadcrumb/URL display (same as id in v3.0)
  count: number | string;
  aliases: string[];
  desc: string;
  title: string;
  intro: string;
  items:
    | WorkItem[]
    | MeetupItem[]
    | HackathonItem[]
    | SideItem[]
    | HobbyItem[]
    | LinkPageItem[];
  dense?: boolean;
  footer?: string;
}

// ── LINKS (5) ──────────────────────────────────────────────────────────────

export const LINKS: Link[] = [
  { label: 'github',   value: 'Kaleb-Nim',         href: 'https://github.com/Kaleb-Nim' },
  { label: 'linkedin', value: 'kaleb-nim',         href: 'https://www.linkedin.com/in/kaleb-nim/' },
  { label: 'email',    value: 'kaleb.nim@gmail',   href: 'mailto:kaleb.nim@gmail.com' },
  { label: 'cv',       value: 'download [PDF]',    href: '#' },
  { label: 'site',     value: 'nim-kaleb.vercel',  href: 'https://nim-kaleb.vercel.app' },
];

// ── WORK EXPERIENCE (4) ────────────────────────────────────────────────────

export const WORK_ITEMS: WorkItem[] = [
  {
    date: 'Jan 2025 – Jul 2026',
    title: 'AI Engineer',
    org: 'RAiD — RSAF Agile innovation Digital',
    logo: '/work-logos/raid.png',
    logoBg: '#FFFFFF',
    note: 'Building AI Air Traffic Controller Training Simulator: Real-time speech diarisation + transcription for ATC controllers; augmenting simulator-pilots’ console ops with digital-twin + agentic solutions + evaluation.',
    tag: 'ACTIVE',
    tagLabel: 'Full-time (NS)',
  },
  {
    date: 'Apr 2024 – Aug 2024',
    title: 'AI Engineer',
    org: 'Tensorplex Labs (Crypto AI Startup)',
    logo: '/work-logos/tensorplex.png',
    logoBg: '#F4F1EB',
    note: 'LLM-powered community + helpdesk chatbot — auto-answers questions, moderates discussion, runs tickets across 4 Web3 Discord servers serving 10,000+ members.',
    tag: 'SHIPPED',
    tagLabel: 'Intern',
  },
  {
    date: 'Jan 2024 – Apr 2024',
    title: 'AI Engineer',
    org: 'A*STAR — Advanced Remanufacturing & Technology Centre (ARTC)',
    logo: '/work-logos/artc.png',
    logoBg: '#FFFFFF',
    note: 'Led AI-driven supply-chain risk research with a Fortune 50 medical client — early-warning system leveraging LLMs.',
    tag: 'SHIPPED',
    tagLabel: 'Contract',
  },
  {
    date: 'Mar 2023 – Jan 2024',
    title: 'Development Scientist Intern',
    org: 'A*STAR — Advanced Remanufacturing & Technology Centre (ARTC)',
    logo: '/work-logos/artc.png',
    logoBg: '#FFFFFF',
    note: 'Q&A LLM agent surfacing what-if insights for hydrogen-supply-chain optimisation; custom knowledge-base RAG with analytical visualisations.',
    tag: 'ARCHIVED',
    tagLabel: 'Intern',
  },
];

// ── SYAI MEETUPS (11) ──────────────────────────────────────────────────────

export const SYAI_ITEMS: MeetupItem[] = [
  {
    num: 11, date: 'May 2026',
    title: 'Claude Code Workshop (SYAI x YouthTechSG)',
    desc: "I taught Claude Code to 60 people — Skills, hooks, and subagents from the ground up, co-organised with YouthTechSG. The hard lesson: 'I use this every day' and 'I can teach it' are completely different skill levels. Full slides at https://syai-claude-workshop.vercel.app/1.",
    speakers: [
      { name: 'Kaleb Nim',       role: 'Workshop Lead — SYAI', linkedin: 'https://www.linkedin.com/in/kaleb-nim/' },
      { name: 'Jesse Sng',       role: 'Mentor',               linkedin: 'https://www.linkedin.com/in/jesse-sng-05ab7944/' },
      { name: 'Javerine Tan',    role: 'Mentor',               linkedin: 'https://sg.linkedin.com/in/javerine-tan-a79231242' },
      { name: 'Darwin Ho',       role: 'Mentor',               linkedin: 'https://www.linkedin.com/in/hoshengxiandarwin/' },
      { name: 'Moiz Khambhati',  role: 'Mentor',               linkedin: 'https://in.linkedin.com/in/moiz-khambhati-57a5b2118' },
      { name: 'Hu Bowen',        role: 'Mentor',               linkedin: 'https://www.linkedin.com/in/hubowen/' },
    ],
    hero: '/meetups/2026-05-claude-code/hero.jpg',
    gallery: [
      '/meetups/2026-05-claude-code/g1.jpg',
      '/meetups/2026-05-claude-code/g2.jpg',
    ],
  },
  {
    num: 10, date: 'Nov 2025',
    title: 'AI Learning Journey with Alibaba Cloud (SYAI x YouthTechSG)',
    desc: "Workshop with Dr Ferdin Joe John Joseph (Alibaba Cloud) on building AI skills with the Alibaba Cloud ecosystem — practical tooling, a focus-group discussion on starting an AI career, and an Alibaba Cloud micro-credential for participants. Co-organised with YouthTechSG at *SCAPE.",
    speakers: [
      { name: 'Dr Ferdin Joe John Joseph', role: 'Alibaba Cloud — Workshop Lead', linkedin: 'https://www.linkedin.com/in/ferdinjoe/' },
    ],
    hero: '/meetups/2025-11-alibaba-cloud/hero.jpg',
    gallery: [
      '/meetups/2025-11-alibaba-cloud/g1.jpg',
      '/meetups/2025-11-alibaba-cloud/g2.jpg',
      '/meetups/2025-11-alibaba-cloud/g3.jpg',
    ],
  },
  {
    num: 9, date: 'Sep 2025',
    title: 'AI in Job Markets: Building Future-Ready Skills (Fireside)',
    desc: "Fireside chat with Assel Mussagaliyeva Tang (Founder, EDUTech Future) on how AI is reshaping education and what 'future-ready' actually means for students entering the job market. 9th edition of the monthly meetup, held at *SCAPE Orchard.",
    speakers: [
      { name: 'Assel Mussagaliyeva Tang', role: 'Founder, EDUTech Future', linkedin: 'https://www.linkedin.com/in/asselmussa' },
    ],
    hero: '/meetups/2025-09-fireside/hero.jpg',
    gallery: [
      '/meetups/2025-09-fireside/g1.jpg',
      '/meetups/2025-09-fireside/g2.jpg',
    ],
  },
  {
    num: 8, date: 'Aug 2025',
    title: 'AI Startup Pitching (SMU Greenhouse)',
    desc: "Six youth-founded AI startups pitched and demoed at SMU Greenhouse — Hyperpod AI, 'Sup, AkitaVault, Nudge, Rehabify, and OpenMentor. Hosted by SMU Artificial Intelligence Club. Live SaaS demos plus Q&A with the founders behind them.",
    speakers: [
      { name: 'Hyperpod AI', role: 'Founder / Demo', linkedin: '' },
      { name: "'Sup",        role: 'Founder / Demo', linkedin: '' },
      { name: 'AkitaVault',  role: 'Founder / Demo', linkedin: '' },
      { name: 'Nudge',       role: 'Founder / Demo', linkedin: '' },
      { name: 'Rehabify',    role: 'Founder / Demo', linkedin: '' },
      { name: 'OpenMentor',  role: 'Founder / Demo', linkedin: '' },
      { name: 'SMU AI Club', role: 'Host — SMU Greenhouse', linkedin: '' },
    ],
    hero: '/meetups/2025-08-startup-pitching/hero.jpg',
    gallery: [
      '/meetups/2025-08-startup-pitching/g1.jpg',
      '/meetups/2025-08-startup-pitching/g2.jpg',
      '/meetups/2025-08-startup-pitching/g3.jpg',
      '/meetups/2025-08-startup-pitching/g4.jpg',
    ],
  },
  {
    num: 7, date: 'Jul 2025',
    title: 'SG60 Edition — Multilingual Voice AI',
    desc: "SG60 National Day edition. Tarun Kumar (A*STAR MERaLiON) on building multilingual voice models for Singlish, Mandarin, Malay, and Tamil; Thorsten Schaeff (ElevenLabs) on V3 and conversational TTS. We also previewed MerMurs — our broken-telephone voice game built on multilingual AI.",
    speakers: [
      { name: 'Tarun Kumar',      role: 'A*STAR — MERaLiON team', linkedin: 'https://sg.linkedin.com/in/tarunkv' },
      { name: 'Thorsten Schaeff', role: 'ElevenLabs',              linkedin: 'https://www.linkedin.com/in/thorwebdev/' },
    ],
    hero: '/meetups/2025-07-sg60-multilingual/hero.jpg',
    gallery: [
      '/meetups/2025-07-sg60-multilingual/g1.jpg',
      '/meetups/2025-07-sg60-multilingual/g2.jpg',
      '/meetups/2025-07-sg60-multilingual/g3.jpg',
    ],
  },
  {
    num: 6, date: 'Jun 2025',
    title: 'Vibe Coding with Claude Code (MicroSaaS in 45 min)',
    desc: "I ran a live 'vibe coding' session — building a MicroSaaS end-to-end with Claude Code in 45 minutes, then opening the floor for attendees to ship their own. Mix of first-time coders and seasoned hackers, all walking out with something built.",
    speakers: [
      { name: 'Kaleb Nim', role: 'Host — SYAI', linkedin: 'https://www.linkedin.com/in/kaleb-nim/' },
    ],
    hero: '/meetups/2025-06-vibe-coding/hero.jpg',
    gallery: [
      '/meetups/2025-06-vibe-coding/g1.jpg',
    ],
  },
  {
    num: 5, date: 'Apr 2025',
    title: 'AI Meets Ambition — Youth Startup Pitches',
    desc: "Youth-led AI startup pitches at *SCAPE — health tools, productivity products, and unfiltered stories from the founder journey. The room skewed toward first-time pitchers, which made the honest Q&A the best part of the afternoon.",
    speakers: [
      { name: 'TBD', role: 'Youth founders — pitch lineup', linkedin: '' },
    ],
    hero: '/meetups/2025-04-pitches/hero.jpg',
    gallery: [
      '/meetups/2025-04-pitches/g1.jpg',
      '/meetups/2025-04-pitches/g2.jpg',
    ],
  },
  {
    num: 4, date: 'Mar 2025',
    title: 'Networking & Resume Roasting (SYAI x CYS)',
    desc: "Live resume 'roasting' with Lim Mei Yu (Founder, Get Ahead; ex-Meta, ex-Google) — attendees submitted their CVs for on-projector critique, plus a recruiter Q&A on positioning for AI/tech roles. Co-organised with Cyber Youth Singapore at *SCAPE.",
    speakers: [
      { name: 'Lim Mei Yu', role: 'Founder, Get Ahead (ex-Meta, ex-Google)', linkedin: 'https://sg.linkedin.com/in/limmeiyu' },
      { name: 'CYS Rep',    role: 'Cyber Youth Singapore',                   linkedin: '' },
    ],
    hero: '/meetups/2025-03-resume-roasting/hero.jpg',
    gallery: [null, null, null],
  },
  {
    num: 3, date: 'Feb 2025',
    title: 'Prompt Engineering for Junior Devs',
    desc: "A practitioner-led session on what actually works when you're 6 months into your career and the senior dev keeps saying \"just prompt it better\". ~120 attendees, mostly poly + uni students.",
    speakers: [
      { name: 'TBD', role: 'Senior AI Eng @ Company',      linkedin: '' },
      { name: 'TBD', role: 'Developer Advocate @ Company', linkedin: '' },
    ],
    hero: '/meetups/prompt-eng-juniors-hero.jpg',
    gallery: [null, null, null, null],
  },
  {
    num: 2, date: 'Jan 2025',
    title: 'Fireside Chat with Dr Mukundan A P (SYAI x CYS)',
    desc: "I moderated the fireside with Dr Mukundan A P (Champion Group) on practical AI in the SDLC — automation across deployment, monitoring, and security, plus how funded startups actually take AI products to market. Session 1 of the 2025 series, co-organised with Cyber Youth Singapore at Hillview CC.",
    speakers: [
      { name: 'Dr Mukundan A P', role: 'Champion Group — Fireside Speaker', linkedin: 'https://www.linkedin.com/in/mukundanap/' },
      { name: 'Kaleb Nim',       role: 'Moderator — SYAI',                  linkedin: 'https://www.linkedin.com/in/kaleb-nim/' },
    ],
    hero: '/meetups/2025-01-fireside/hero.jpg',
    gallery: [],
  },
  {
    num: 1, date: 'Aug 2024',
    title: 'Kickoff — LLMs from Scratch',
    desc: "The inaugural SYAI meetup. Whiteboard walkthrough of how transformers actually work, then a community brainstorm on what people wanted SYAI to become. We've kept that doc alive.",
    speakers: [
      { name: 'TBD',       role: 'ML Researcher @ Lab',          linkedin: '' },
      { name: 'Kaleb Nim', role: 'Head of Community, SYAI',      linkedin: 'https://www.linkedin.com/in/kaleb-nim/' },
    ],
    hero: '/meetups/llms-from-scratch-hero.jpg',
    gallery: [null, null, null],
  },
];

// ── HACKATHONS ─────────────────────────────────────────────────────────────
// HACK_ITEMS + HACK_STATS now live in ./hackathons (sourced from
// .planning/research/hackathons/hackathons.json) and are re-exported at the
// top of this file. The legacy 15-item hand-curated placeholder array has been
// removed in favour of the JSON-backed dataset.

// ── SIDEQUESTS (30+) ───────────────────────────────────────────────────────
// Talks, meetups attended, conferences, IRL things. Render dense.

export const SIDE_ITEMS: SideItem[] = [
  { date: 'May 2026', title: 'GovTech AI Summit',           note: 'attendee · panel notes' },
  { date: 'Apr 2026', title: 'Anthropic Builder Day SG',    note: 'workshop participant' },
  { date: 'Mar 2026', title: 'Voice-Agent Open Mic',        note: 'lightning talk on TTS pipelines', link: { label: 'SLIDES', href: '#' } },
  { date: 'Feb 2026', title: 'Singapore AI Trustathon',     note: 'red-team panellist' },
  { date: 'Jan 2026', title: 'AAAI 2026 — Philadelphia',    note: 'co-author poster · ASTRA',        link: { label: 'POSTER', href: '#' } },
  { date: 'Dec 2025', title: 'NeurIPS 2025 — Vancouver',    note: 'attended workshops' },
  { date: 'Nov 2025', title: 'SG AI Week 2025',             note: 'speaker — voice cloning ethics' },
  { date: 'Oct 2025', title: 'PyCon SG 2025',               note: 'lightning talk · agent eval' },
  { date: 'Sep 2025', title: 'AI Tinkerers Build Night',    note: 'demo: AI portfolio voice clone' },
  { date: 'Aug 2025', title: 'SUTD AI Symposium',           note: 'student speaker' },
  { date: 'Jul 2025', title: 'GitHub Universe Watch Party', note: 'organised local watch party' },
  { date: 'Jun 2025', title: 'Bun + Vercel meetup',         note: 'lightning · ws server patterns' },
  { date: 'May 2025', title: 'Modular MAX SG meetup',       note: 'attendee · perf notes' },
  { date: 'Apr 2025', title: 'NUS AI Career Panel',         note: 'panellist — internships' },
  { date: 'Mar 2025', title: 'Open-source Friday',          note: 'maintainer office hours' },
  { date: 'Feb 2025', title: 'SG AI Tinkerers Demo Night',  note: 'demo · ATC simulator slice' },
  { date: 'Jan 2025', title: 'AAAI 2025 — Vancouver',       note: 'student volunteer' },
  { date: 'Dec 2024', title: 'EMNLP 2024 — Miami',          note: 'attended · paper trail' },
  { date: 'Nov 2024', title: 'Anthropic Singapore Office Visit', note: 'student visit' },
  { date: 'Oct 2024', title: 'NUS Computing Open Day',      note: 'student mentor' },
  { date: 'Sep 2024', title: 'GovTech LLM Bootcamp',        note: 'completed · cert' },
  { date: 'Aug 2024', title: 'AI Tinkerers SG Launch',      note: 'co-organiser' },
  { date: 'Jul 2024', title: 'Tensorplex Community AMA',    note: 'co-host' },
  { date: 'Jun 2024', title: 'PyTorch SG meetup',           note: 'attended' },
  { date: 'May 2024', title: 'JuniorDevSG Mentor Night',    note: 'mentor' },
  { date: 'Apr 2024', title: 'NUS NES Career Fair',         note: 'representing Tensorplex' },
  { date: 'Mar 2024', title: 'GovTech STACK preview',       note: 'visitor' },
  { date: 'Feb 2024', title: 'BuildClub Demo Night',        note: 'demo · LLM-coded snake game' },
  { date: 'Jan 2024', title: 'NUS Hack&Roll prize night',   note: 'attended' },
  { date: 'Dec 2023', title: 'A*STAR Year-end Showcase',    note: 'presented intern project' },
  { date: 'Nov 2023', title: 'AI Singapore Tech Talk',      note: 'attended' },
  { date: '2022 – 2023', title: 'Misc. uni guest lectures', note: '5+ over the year' },
];

// ── HOBBIES (5) ────────────────────────────────────────────────────────────

export const HOBBIES_ITEMS: HobbyItem[] = [
  { title: 'Cooking',              note: 'optimising one-pot recipes; lab notebook style' },
  { title: 'Bouldering',           note: 'V4 problems on a good day' },
  { title: 'Mechanical keyboards', note: 'currently typing on a Bauer Lite, holy panda v2' },
  { title: 'Reading sci-fi',       note: 'Stanisław Lem, Ted Chiang, Liu Cixin' },
  { title: 'Long walks + lo-fi',   note: 'best debugging tool i own' },
];

// ── LINK ITEMS (5) ─────────────────────────────────────────────────────────

export const LINK_ITEMS: LinkPageItem[] = [
  { title: 'GitHub',   note: 'github.com/Kaleb-Nim',                    link: { label: 'OPEN', href: 'https://github.com/Kaleb-Nim' } },
  { title: 'LinkedIn', note: 'linkedin.com/in/kaleb-nim',               link: { label: 'OPEN', href: 'https://www.linkedin.com/in/kaleb-nim/' } },
  { title: 'Email',    note: 'kaleb.nim@gmail.com',                     link: { label: 'COPY', href: 'mailto:kaleb.nim@gmail.com' } },
  { title: 'Resume',   note: 'one-pager — updated quarterly',           link: { label: 'PDF',  href: '#' } },
  { title: 'Site',     note: 'nim-kaleb.vercel.app (production build)', link: { label: 'OPEN', href: 'https://nim-kaleb.vercel.app' } },
];

// ── SECTIONS ───────────────────────────────────────────────────────────────
// id === path for v3.0 (so #/work-experience matches the route, not #/work).

export const SECTIONS: Section[] = [
  {
    id: 'work-experience',
    path: 'work-experience',
    count: 4,
    aliases: ['work', 'experience', 'roles'],
    desc: 'Internships and full-time roles',
    title: './work-experience — 3 years in AI Engineering Space',
    intro: 'Roles where someone gave me money to ship AI systems. → currently looking for freelance AI Engineering work.',
    items: WORK_ITEMS,
    footer: '[4 entries] · most recent first',
  },
  {
    id: 'syai-meetups',
    path: 'syai-meetups',
    count: 11,
    aliases: ['meetups', 'syai'],
    desc: 'AIMM — the monthly AI meetup I head at Singapore Youth AI',
    title: './syai-meetups — running SYAI\'s monthly AI meetup',
    intro:
      "I head AIMM — [SYAI](https://sgyouthai.org)'s monthly AI meetup — end-to-end: content strategy, speaker outreach, venue, publicity, structure. 11 events to date, each drawing 30–60 students from polytechnics, universities, and JCs. Format mixes hands-on workshops, fireside chats with industry leaders, and open networking.",
    items: SYAI_ITEMS,
    footer: '[11 sessions] · 30–60 attendees per event · open to all',
  },
  {
    id: 'hackathons',
    path: 'hackathons',
    count: HACK_STATS.total,
    aliases: ['hacks', 'hackathon'],
    desc: 'weekends I traded for shipping demos',
    title: `./hackathons — ${HACK_STATS.total} weekends, ${HACK_STATS.total} demos`,
    intro: 'Things I built between Friday night and Sunday afternoon. Most still work.',
    items: HACK_ITEMS,
    footer: `[${HACK_STATS.total} entries] · ${HACK_STATS.wins} win${HACK_STATS.wins === 1 ? '' : 's'} · ${HACK_STATS.prizes} prize${HACK_STATS.prizes === 1 ? '' : 's'}`,
  },
  {
    id: 'sidequests',
    path: 'sidequests',
    count: '30+',
    aliases: ['events', 'sidequest', 'side-quests', 'talks'],
    desc: 'talks, conferences, demo nights, IRL pings',
    title: './sidequests — where I showed up',
    intro:
      'Talks attended, given, organised. Demo nights, panels, office visits — anything not a job and not a hackathon.',
    items: SIDE_ITEMS,
    dense: true,
    footer: `[${SIDE_ITEMS.length}+ entries] · log truncated · tail -f for more`,
  },
  {
    id: 'hobbies',
    path: 'hobbies',
    count: 5,
    aliases: ['life', 'offline'],
    desc: 'what I do when the laptop is closed',
    title: './hobbies — what I do offline',
    intro: 'Things that keep me from becoming the model.',
    items: HOBBIES_ITEMS,
  },
  {
    id: 'links',
    path: 'links',
    count: 5,
    aliases: ['contact', 'cv'],
    desc: 'github · linkedin · email · cv · prod site',
    title: './links — where to find me',
    intro: 'The five ways to reach me or read more.',
    items: LINK_ITEMS,
  },
];
