// index-data.jsx — section + item content for the directory home page
// Counts must match user spec: Work (4), SYAI Meetups (11), Hackathons (15),
// Sidequests (30+), Hobbies (5), Links (5).

const LINKS = [
  { label: 'github',   value: 'Kaleb-Nim',         href: 'https://github.com/Kaleb-Nim' },
  { label: 'linkedin', value: 'kaleb-nim',         href: 'https://www.linkedin.com/in/kaleb-nim/' },
  { label: 'email',    value: 'kaleb.nim@gmail',   href: 'mailto:kaleb.nim@gmail.com' },
  { label: 'cv',       value: 'download [PDF]',    href: '#' },
  { label: 'site',     value: 'nim-kaleb.vercel',  href: 'https://nim-kaleb.vercel.app' },
];

// ── WORK EXPERIENCE (4) ────────────────────────────────────────────────────
// Sourced from CV (Kaleb Nim — kaleb.nim@gmail.com). Logos sit on a light chip
// because every brand-mark in here is dark-on-light.
const WORK_ITEMS = [
  {
    date: 'Jan 2025 – Jul 2026',
    title: 'AI Engineer',
    org: 'RAiD — RSAF Agile innovation Digital',
    logo: '../../assets/logos/raid.png',
    logoBg: '#FFFFFF',
    note: 'Real-time speech diarisation + transcription for ATC controllers; augmenting sim-pilots\u2019 console ops with digital-twin + agentic solutions.',
    tag: 'ACTIVE',
  },
  {
    date: 'Apr 2024 – Aug 2024',
    title: 'AI Engineer',
    org: 'Tensorplex Labs (Crypto AI Startup)',
    logo: '../../assets/logos/tensorplex.png',
    logoBg: '#F4F1EB',
    note: 'LLM-powered community + helpdesk chatbot — auto-answers questions, moderates discussion, runs tickets across 4 Web3 Discord servers serving 10,000+ members.',
    tag: 'SHIPPED',
  },
  {
    date: 'Jan 2024 – Apr 2024',
    title: 'AI Engineer',
    org: 'A*STAR — Advanced Remanufacturing & Technology Centre (ARTC)',
    logo: '../../assets/logos/artc.png',
    logoBg: '#FFFFFF',
    note: 'Led AI-driven supply-chain risk research with a Fortune 50 medical client — early-warning system leveraging LLMs.',
    tag: 'SHIPPED',
  },
  {
    date: 'Mar 2023 – Jan 2024',
    title: 'Development Scientist Intern',
    org: 'A*STAR — Advanced Remanufacturing & Technology Centre (ARTC)',
    logo: '../../assets/logos/artc.png',
    logoBg: '#FFFFFF',
    note: 'Q&A LLM agent surfacing what-if insights for hydrogen-supply-chain optimisation; custom knowledge-base RAG with analytical visualisations.',
    tag: 'ARCHIVED',
  },
];

// ── SYAI MEETUPS (11) ──────────────────────────────────────────────────────
const SYAI_ITEMS = [
  { date: 'Apr 2026', title: 'Meetup #11 — Agentic Workflows in Production',                    note: '~80 attendees', link: { label: 'RECAP', href: '#' } },
  { date: 'Feb 2026', title: 'Meetup #10 — Eval Harnesses for LLM Apps',                        note: 'panel + lightning talks' },
  { date: 'Dec 2025', title: 'Meetup #9 — Voice Agents End-to-End',                             note: 'demo: live voice clone' },
  { date: 'Oct 2025', title: 'Meetup #8 — Multimodal Models in the Wild',                       note: '6 demos' },
  { date: 'Aug 2025', title: 'Meetup #7 — RAG: What Actually Ships',                            note: 'guest: ex-Anthropic' },
  { date: 'Jun 2025', title: 'Meetup #6 — Fine-tuning vs Prompting',                            note: 'debate format' },
  { date: 'Apr 2025', title: 'Meetup #5 — Local LLMs on Consumer Hardware',                     note: 'llama.cpp deep dive' },
  { date: 'Feb 2025', title: 'Meetup #4 — Prompt Engineering for Junior Devs',                  note: '~120 attendees' },
  { date: 'Dec 2024', title: 'Meetup #3 — Building Your First Agent',                           note: 'hands-on workshop' },
  { date: 'Oct 2024', title: 'Meetup #2 — Vector DBs Explained',                                note: 'qdrant / pgvector / weaviate' },
  { date: 'Aug 2024', title: 'Meetup #1 — Kickoff: LLMs from Scratch',                          note: 'inaugural session' },
];

// ── HACKATHONS (15) ────────────────────────────────────────────────────────
const HACK_ITEMS = [
  { date: 'Apr 2026', title: 'NUS Lifehack 2026',         note: 'agentic event-planner',           tag: 'WIP' },
  { date: 'Feb 2026', title: 'AI Tinkerers SG Hackday',   note: '24h voice-clone toolkit',         tag: 'BUILT' },
  { date: 'Nov 2025', title: 'TikTok TechJam',            note: 'multimodal moderation pipeline',  tag: 'BUILT' },
  { date: 'Sep 2025', title: 'Govtech STACK 2025',        note: 'gov-services Q&A bot',            tag: 'BUILT' },
  { date: 'Jul 2025', title: 'NUS Orbital Apollo',        note: 'AI tutor for primary-school math',tag: 'BUILT' },
  { date: 'May 2025', title: 'BuildClub SG Hackathon',    note: 'browser-agent for clinical notes',tag: 'BUILT' },
  { date: 'Mar 2025', title: 'AngelHack SG',              note: 'LLM-powered grant matcher',       tag: 'BUILT' },
  { date: 'Jan 2025', title: 'NUS Hack&Roll 2025',        note: 'real-time karaoke transcriber',   tag: 'BUILT' },
  { date: 'Nov 2024', title: 'SUTD What The Hack',        note: 'agentic D&D dungeon master',      tag: 'BUILT' },
  { date: 'Sep 2024', title: 'BrainHack TIL-AI',          note: 'speech ASR + diarisation',        link: { label: 'WRITEUP', href: '#' } },
  { date: 'Jul 2024', title: 'Junction Asia',             note: 'whatsapp-native LLM helpdesk',    tag: 'BUILT' },
  { date: 'May 2024', title: 'NTU iNTUition v9',          note: 'AI essay-rubric grader',          tag: 'BUILT' },
  { date: 'Mar 2024', title: 'SMU Ellipsis',              note: 'meal-plan optimiser w/ LLM',      tag: 'BUILT' },
  { date: 'Jan 2024', title: 'NUS Hack&Roll 2024',        note: '"A Brilliant Cobra Duel"',        tag: 'WON · BEST PRE-U' },
  { date: 'Aug 2023', title: 'Code::XtremeApps',          note: 'first hackathon — finalist',      tag: 'FINALIST' },
];

// ── SIDEQUESTS (30+) ───────────────────────────────────────────────────────
// Talks, meetups attended, conferences, IRL things. Render dense.
const SIDE_ITEMS = [
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
const HOBBIES_ITEMS = [
  { title: 'Cooking',           note: 'optimising one-pot recipes; lab notebook style' },
  { title: 'Bouldering',        note: 'V4 problems on a good day' },
  { title: 'Mechanical keyboards', note: 'currently typing on a Bauer Lite, holy panda v2' },
  { title: 'Reading sci-fi',    note: 'Stanisław Lem, Ted Chiang, Liu Cixin' },
  { title: 'Long walks + lo-fi',note: 'best debugging tool i own' },
];

// ── LINKS (5) ──────────────────────────────────────────────────────────────
const LINK_ITEMS = [
  { title: 'GitHub',   note: 'github.com/Kaleb-Nim',                    link: { label: 'OPEN', href: 'https://github.com/Kaleb-Nim' } },
  { title: 'LinkedIn', note: 'linkedin.com/in/kaleb-nim',               link: { label: 'OPEN', href: 'https://www.linkedin.com/in/kaleb-nim/' } },
  { title: 'Email',    note: 'kaleb.nim@gmail.com',                     link: { label: 'COPY', href: 'mailto:kaleb.nim@gmail.com' } },
  { title: 'Resume',   note: 'one-pager — updated quarterly',           link: { label: 'PDF',  href: '#' } },
  { title: 'Site',     note: 'nim-kaleb.vercel.app (production build)', link: { label: 'OPEN', href: 'https://nim-kaleb.vercel.app' } },
];

// ── SECTIONS ───────────────────────────────────────────────────────────────
const SECTIONS = [
  {
    id: 'work', path: 'work-experience', count: 4,
    aliases: ['work', 'experience', 'roles'],
    desc: 'Internships and full-time roles',
    title: './work-experience — paid AI engineering',
    intro: "Roles where someone gave me money to ship AI systems. Newest first.",
    items: WORK_ITEMS,
    footer: '[4 entries] · most recent first',
  },
  {
    id: 'meetups', path: 'syai-meetups', count: 11,
    aliases: ['meetups', 'syai'],
    desc: "workshops I hosted at Singapore Youth AI",
    title: './syai-meetups — talks I hosted at SYAI',
    intro: "Singapore Youth AI — a community I co-run for high-schoolers + early-uni students. Each meetup is a hands-on session.",
    items: SYAI_ITEMS,
    footer: '[11 sessions] · ~80 avg attendance · open to all',
  },
  {
    id: 'hackathons', path: 'hackathons', count: 15,
    aliases: ['hacks', 'hackathon'],
    desc: 'weekends I traded for shipping demos',
    title: './hackathons — 15 weekends, 15 demos',
    intro: "Things I built between Friday night and Sunday afternoon. Most still work.",
    items: HACK_ITEMS,
    footer: '[15 entries] · 1 win · 1 finalist · 0 regrets',
  },
  {
    id: 'sidequests', path: 'sidequests', count: '30+',
    aliases: ['events', 'sidequest', 'side-quests', 'talks'],
    desc: 'talks, conferences, demo nights, IRL pings',
    title: './sidequests — where I showed up',
    intro: "Talks attended, given, organised. Demo nights, panels, office visits — anything not a job and not a hackathon.",
    items: SIDE_ITEMS,
    dense: true,
    footer: `[${SIDE_ITEMS.length}+ entries] · log truncated · tail -f for more`,
  },
  {
    id: 'hobbies', path: 'hobbies', count: 5,
    aliases: ['life', 'offline'],
    desc: 'what I do when the laptop is closed',
    title: './hobbies — what I do offline',
    intro: "Things that keep me from becoming the model.",
    items: HOBBIES_ITEMS,
  },
  {
    id: 'links', path: 'links', count: 5,
    aliases: ['contact', 'cv'],
    desc: 'github · linkedin · email · cv · prod site',
    title: './links — where to find me',
    intro: "The five ways to reach me or read more.",
    items: LINK_ITEMS,
  },
];

window.SECTIONS = SECTIONS;
window.LINKS = LINKS;
