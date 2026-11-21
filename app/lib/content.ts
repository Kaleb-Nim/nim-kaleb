// app/lib/content.ts — the facts and copy for the portfolio, in one place.
//
// Single source of truth (issue #8, map #5). `sections.ts` derives the page
// data from these exports, and `scripts/build-voice-facts.ts` renders them into
// the generated block of `prompts/system-prompt.md`, so the site and the voice
// clone always say the same thing. Edit facts here, then run
// `bun run voice-facts`.
//
// Copy rules (docs/research/portfolio-not-vibe-coded.md): one people-phrased
// stat or tagline per project as its headline, asides only where Kaleb has said
// them himself (LinkedIn posts), no generic claims, no em dashes. Every number below comes from a source named next to it.

// ── Types ──────────────────────────────────────────────────────────────────

export interface Fact {
  label: string;
  value: string;
}

export interface ContentLink {
  label: string;
  href: string;
}

export interface Profile {
  name: string;
  /** One line under the name. */
  line: string;
  /** What Kaleb is looking for, shown near the top and said by the voice clone. */
  seeking: string;
  location: string;
  aside?: string;
  education: Array<{ school: string; credential: string; dates: string; note?: string }>;
  community: string[];
  skills: Record<string, string[]>;
}

export interface Role {
  org: string;
  title: string;
  /** e.g. "Jan 2025". */
  start: string;
  /** null while the role is current. */
  end: string | null;
  kind: string;
  logo: string;
  logoBg: string;
  /** The people-phrased stat for this role, or null when there isn't a public one. */
  headline: string | null;
  /** Only asides Kaleb has actually said (LinkedIn posts); omit otherwise. */
  aside?: string;
  bullets: string[];
  links?: ContentLink[];
}

export interface Project {
  slug: string;
  name: string;
  kind: string;
  status: 'LIVE' | 'MAINTAINED' | 'ARCHIVED';
  since: string;
  /** The one people-phrased stat that opens the project. */
  headline: string;
  aside?: string;
  summary: string;
  facts: Fact[];
  stack: string[];
  hero: string;
  gallery: string[];
  links: ContentLink[];
  version?: string;
  installs?: number;
  installsAsOf?: string;
}

export interface HackHighlight {
  /** Matches a `slug` in app/data/hackathons.json. */
  slug: string;
  event: string;
  year: number;
  result: string;
  headline: string;
  aside?: string;
  /** Photo of the win, sourced from Kaleb's LinkedIn posts. null = still to come. */
  photo: string | null;
  photoCredit?: string;
}

export interface Hobby {
  title: string;
  note: string;
  /** Kaleb is sending photos; null until then. */
  photo: string | null;
}

// ── Profile ────────────────────────────────────────────────────────────────

export const PROFILE: Profile = {
  name: 'Kaleb Nim',
  line: 'AI engineer with three years of shipped work. First year of Business AI Systems at NUS.',
  seeking: 'Looking for AI engineering or software engineering roles from January 2027.',
  location: 'Singapore',
  education: [
    {
      school: 'National University of Singapore',
      credential: 'BSc Business AI Systems',
      dates: 'Aug 2026 – May 2030',
    },
    {
      school: 'Singapore Polytechnic',
      credential: 'Diploma in Applied AI and Analytics',
      dates: 'Apr 2021 – Mar 2024',
      note: 'CGPA 3.86',
    },
  ],
  community: [
    'One of the four founding members of Singapore Youth AI, and its Head of Community. The National Youth Council funded the programme with S$50,000.',
    'Moderated panels at AI Singapore’s AI Student Developer Conference in 2025 and 2026.',
    'Vice-President of SP Guitarist at Singapore Polytechnic: 40 members, weekly training, concerts.',
  ],
  skills: {
    'AI/ML': ['LLM apps and agents', 'RAG', 'speech: diarisation, STT, TTS, voice cloning', 'evals', 'digital twins'],
    Backend: ['TypeScript', 'Python', 'Bun', 'WebSockets', 'Postgres'],
    Frontend: ['Next.js', 'React'],
    Infra: ['Vercel', 'AWS ECS', 'Cloudflare D1/R2', 'Alibaba Cloud DashScope'],
  },
};

// ── Work (most recent first) ───────────────────────────────────────────────

export const ROLES: Role[] = [
  {
    org: 'Housecut',
    title: 'Co-founder, engineering',
    start: 'Oct 2026',
    end: null,
    kind: 'Co-founder',
    logo: '/work-logos/housecut.svg',
    logoBg: '#FFFFFF',
    headline: 'Agentic video editing for real estate agents.',
    aside: 'Hong Yu and I won Best Pre-University Hack at Hack&Roll twice. This time someone pays us.',
    bullets: [
      'Co-founded with Soh Hong Yu. I build the pipeline that turns an agent’s phone clips into three edited 9:16 listing videos.',
    ],
    links: [{ label: 'HOUSECUT.APP', href: 'https://housecut.app' }],
  },
  {
    org: 'RAiD (RSAF Agile Innovation Digital)',
    title: 'AI Engineer',
    start: 'Jan 2025',
    end: 'Aug 2026',
    kind: 'Full-time (National Service)',
    logo: '/work-logos/raid.png',
    logoBg: '#FFFFFF',
    headline: 'ASTRA, the air traffic controller training simulator I worked on, is on arXiv.',
    aside: 'Did my National Service writing a paper. Thirteen co-authors carried me.',
    bullets: [
      'Real-time speech diarisation and transcription for air traffic controllers, trialled in Exercise Wallaby.',
      'Autonomous sim-pilots for ASTRA: a digital twin plus agents that fly the console so a human trainer doesn’t have to.',
      'Poster at the AI for Air Transportation workshop at AAAI 2026. Demoed to senior RSAF leadership.',
    ],
    links: [{ label: 'ARXIV', href: 'https://arxiv.org/abs/2606.18319' }],
  },
  {
    org: 'Tensorplex Labs',
    title: 'AI Engineer',
    start: 'Apr 2024',
    end: 'Aug 2024',
    kind: 'Intern',
    logo: '/work-logos/tensorplex.png',
    logoBg: '#F4F1EB',
    headline: '10,000+ members across four crypto Discord servers got answers from my bot.',
    bullets: [
      'LLM helpdesk and moderation bot: answered questions, moderated threads and ran support tickets.',
    ],
  },
  {
    org: 'A*STAR',
    title: 'AI Engineer',
    start: 'Jan 2024',
    end: 'Apr 2024',
    kind: 'Contract',
    logo: '/work-logos/artc.png',
    logoBg: '#FFFFFF',
    headline: null,
    bullets: [
      'Led supply-chain risk research with a Fortune 50 medical company: an LLM early-warning system for disruptions.',
    ],
  },
  {
    org: 'A*STAR',
    title: 'Development Scientist Intern',
    start: 'Mar 2023',
    end: 'Jan 2024',
    kind: 'Intern',
    logo: '/work-logos/artc.png',
    logoBg: '#FFFFFF',
    headline: null,
    bullets: [
      'Q&A agent over a hydrogen supply-chain model that answers “what if” questions with charts, on a custom RAG knowledge base.',
    ],
  },
];

// ── Projects ───────────────────────────────────────────────────────────────

export const PROJECTS: Project[] = [
  {
    slug: 'housecut',
    name: 'Housecut',
    kind: 'AI video editor for real estate agents',
    status: 'LIVE',
    since: 'Oct 2026',
    headline: 'Agentic video editing for real estate agents.',
    summary:
      'An agent uploads the raw phone clips from a viewing. Within 24 hours they get three cuts back: a slow tour, a beat cut and a hook-first teaser, each with music, captions, their name and the price on screen.',
    facts: [
      { label: 'Price', value: 'S$45 a listing' },
      { label: 'Turnaround', value: '3 cuts within 24 hours' },
      { label: 'Team', value: 'Co-founded with Soh Hong Yu' },
      { label: 'My part', value: 'Pipeline, dispatcher and review loop' },
    ],
    stack: ['Next.js', 'Cloudflare D1 + R2', 'Stripe', 'Claude Code agent workers', 'HyperFrames'],
    hero: '/products/housecut/hero.jpg',
    gallery: ['/products/housecut/g1.jpg'],
    links: [{ label: 'HOUSECUT.APP', href: 'https://housecut.app' }],
  },
  {
    slug: 'overlay-notes',
    name: 'Overlay Notes',
    kind: 'Chrome extension',
    status: 'LIVE',
    since: 'Jul 2026',
    version: '1.2.0',
    installs: 600,
    installsAsOf: 'Nov 2026',
    headline: 'Chrome extension for students to annotate notes directly on web pages. About 600 installs.',
    aside: 'Built instead of studying for CS2030. To study for CS2030.',
    summary:
      'Excalidraw on top of any page. Circle a claim, draw an arrow between two paragraphs, and the drawing stays pinned to the content as you scroll. Saved per page, no account, works offline.',
    facts: [
      { label: 'Installs', value: '~600 (Nov 2026)' },
      { label: 'Version', value: '1.2.0 on the Chrome Web Store' },
      { label: 'Hackathon', value: 'Top 20 of 65 at the Acacia AI Symposium Launchpad' },
      { label: 'Source', value: 'Open source' },
    ],
    stack: ['WXT', 'TypeScript', 'React 19', 'Excalidraw', 'Dexie (IndexedDB)'],
    hero: '/products/overlay-notes/hero.jpg',
    gallery: ['/products/overlay-notes/g1.jpg'],
    links: [
      { label: 'SITE', href: 'https://overlay-notes.kalebnim.dev' },
      {
        label: 'CHROME STORE',
        href: 'https://chromewebstore.google.com/detail/overlay-notes/ogekdbffoapphpabjphfgeppildcleck',
      },
      { label: 'GITHUB', href: 'https://github.com/Kaleb-Nim/overlay-notes' },
    ],
  },
];

// ── Hackathons: the five with a photo of the win ───────────────────────────

export const HACK_INTRO = {
  headline: '40+ hackathons. These five ended with a cheque or a trophy.',
  aside: 'NUS LifeHack: entered every year since 2021, won zero times.',
};

export const HACK_HIGHLIGHTS: HackHighlight[] = [
  {
    slug: 'hackomania-2026',
    event: 'HackOmania 2026',
    year: 2026,
    result: '1st place, $1,000 cash + $2,100 in AI credits, 320+ participants',
    headline: 'Predicts which rumours Singapore will fall for before they spread.',
    photo: '/hackathons/wins/hackomania-2026.jpg',
    photoCredit: 'GeeksHacking',
  },
  {
    slug: 'art-ificial-failure',
    event: 'NUS Hack&Roll 2025',
    year: 2025,
    result: 'Best Pre-University Hack, out of 747 participants',
    headline: 'A drawing game you win by sketching what humans get and AI doesn’t.',
    aside: 'Second year running for the same award.',
    photo: null,
  },
  {
    slug: 'a-brilliant-cobra-duel',
    event: 'NUS Hack&Roll 2024',
    year: 2024,
    result: 'Best Pre-University Hack, out of ~650 participants',
    headline: '1v1 Snake where your prompts are the weapons.',
    photo: '/hackathons/wins/hack-and-roll-2024.jpg',
  },
  {
    slug: 'polyfintech-100-2023',
    event: 'PolyFinTech 100 API Hackathon 2023',
    year: 2023,
    result: 'Champion, S$2,500',
    headline: 'Generates a personalised 30 to 45 second infomercial from an LLM script.',
    photo: '/hackathons/wins/polyfintech-2023.jpg',
  },
  {
    slug: 'batey-2022',
    event: 'Batey Hackathon 2022',
    year: 2022,
    result: 'Gold, $2,000',
    headline: 'A food recommender built on TensorFlow Recommenders.',
    photo: null,
  },
];

// ── Community ──────────────────────────────────────────────────────────────

export const COMMUNITY_INTRO = {
  headline: 'Organizing 10 AI meetups for 500+ youths in Singapore.',
  aside: '“I use this every day” and “I can teach this” turned out to be different skill levels.',
  summary:
    'Singapore Youth AI runs a monthly meetup for students from polytechnics, JCs and universities: workshops, founder pitches and fireside chats, 30 to 60 people each time. I’m one of the four founding members and I run the programme.',
  featuredMeetup: 11,
  /** True count per Kaleb; two early meetups are missing from SYAI_ITEMS. */
  total: 10,
};

// ── Hobbies ────────────────────────────────────────────────────────────────

export const HOBBIES: Hobby[] = [
  { title: 'Bouldering', note: '', photo: null },
  { title: 'Solo travel', note: 'Thailand, China, Indonesia, Taiwan and Vietnam since 2024.', photo: null },
  { title: 'Guitar', note: 'Vice-President of SP Guitarist.', photo: null },
  { title: 'Skiing', note: 'Hakuba, then Yabuli.', photo: null },
];
