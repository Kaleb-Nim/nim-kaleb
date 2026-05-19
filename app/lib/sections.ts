// app/lib/sections.ts — typed port of LINKS, SECTIONS, and the six item arrays
// from .planning/research/v3-design-kit/index-data.jsx.
//
// Per CONTEXT.md decision (v3.0): the `id` field for each Section MUST equal
// its `path` value (so hash routes are `#/work-experience`, `#/syai-meetups`,
// etc.). The source-of-truth `id` ('work', 'meetups') is intentionally NOT
// used as the route slug.
//
// Counts must match user spec: Work (4), SYAI Meetups (11), Hackathons (15),
// Sidequests (30+), Hobbies (5), Links (5).

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

export interface HackItem {
  date: string;
  title: string;
  note?: string;
  tag?: string;
  link?: ItemLink;
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
    | HackItem[]
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
    num: 11, date: 'Nov 2025',
    title: 'AI Learning Journey with Alibaba Cloud (SYAI x YouthTechSG)',
    desc: `🚀 Thank you for joining us at the November AI Monthly Meetup!

Thank you to everyone who joined us on 1 November 2025 at for our Monthly AI Meetup, organised in collaboration with YouthTechSG. The afternoon was filled with insightful conversations, hands-on learning and meaningful connections around AI and cloud technologies.

🙏 A special thank you to Dr Ferdin Joe John Joseph from Alibaba Cloud for leading the workshop "AI Learning Journey with Alibaba Cloud" and sharing practical guidance on building AI skills, navigating cloud tools and starting a career in tech.
We would also like to thank *SCAPE SG for the venue and YouthTechSG.sg for partnering with us to empower youth in AI.

🧾 What Went Down:
• Workshop: Introduction to AI, Alibaba Cloud's AI ecosystem and real-world applications
• Focus Group Discussion: "How to start your AI/tech journey"
• Networking: Students and young professionals connected over shared interests in AI
• Certification: Participants received a micro-credential from Alibaba Cloud

📸 Photos & Highlights:
Moments from the workshop, group sharing and discussions are featured above.

📍 Next Meetup:
Stay tuned for details on our upcoming AI Monthly Meetup!

💭 Tell Us What You Thought:
What was your biggest takeaway from this session? Share your reflections with us and help shape future meetups.

Till next time, keep learning, keep building and see you at the next AIMM.`,
    speakers: [
      { name: 'Dr Ferdin Joe John Joseph', role: 'Alibaba Cloud — Workshop Lead', linkedin: '' },
    ],
    hero: '/meetups/2025-11-alibaba-cloud/hero.jpg',
    gallery: [null, null, null],
  },
  {
    num: 10, date: 'Sep 2025',
    title: 'AI in Job Markets: Building Future-Ready Skills (Fireside)',
    desc: `🚀 THANK YOU for Joining Us at the September AI Meetup! 💡✨

Thank you to everyone who joined us for the 9th Monthly AI Meetup on 20 September 2025 at SCAPE Orchard. The afternoon was filled with thought-provoking insights, interactive conversations, and meaningful networking around the future of AI in education and youth employability.

🙏🏻 A special thank you to Assel MT, EdTech entrepreneur and founder of EDUTech Future, for leading our Fireside Chat and sharing her invaluable perspectives on AI's role in transforming education and preparing youth for the future job market.
🚀We also thank *SCAPE SG for the collaborative space for collaboration with YouthTechSG

🎧 What Went Down:
🔥 Fireside Chat - " AI in Job Markets: Building Future-Ready Skills" with Assel Mussagaliyeva Tang
❓ Interactive Q&A - Participants asked engaging questions on bridging academia and industry
🤝 Networking - Students, educators, and innovators connected over shared interests in AI and EdTech

From aspiring students to experienced educators, the community came together to explore how AI is shaping learning and future careers.

📸 Photos and Highlights:
Snapshots from the Fireside Chat and group photo will be shared soon on our socials!

📅 Next Meetup:
Stay tuned for the upcoming AI Meetup at google HQ!

💬 Tell Us What You Thought:
What was your key takeaway from the Fireside Chat? Share your reflections and help us shape future meetups.

Till next time, keep learning, keep building, and we'll see you at the next AI Monthly Meetup! 💡🌍`,
    speakers: [
      { name: 'Assel Mussagaliyeva Tang', role: 'Founder, EDUTech Future', linkedin: '' },
    ],
    hero: '/meetups/2025-09-fireside/hero.jpg',
    gallery: [null, null],
  },
  {
    num: 9, date: 'Aug 2025',
    title: 'AI Startup Pitching (SMU Greenhouse)',
    desc: `🚀 THANK YOU for Joining Us at the August AI Meetup! 💡✨

Thank you to everyone who joined us for the 8th Monthly AI Meetup on 30 August 2025 at SMU Greenhouse. The afternoon was filled with inspiring startup pitches, exciting live demos, and valuable connections across the community.

🙏🏻 A special thank you to SMU Artificial Intelligence Club for hosting us and providing such a supportive space for collaboration with YouthTechSG
🚀 We also want to thank all the startups and student founders who pitched and demoed their projects. Your innovation and energy made this edition unforgettable.
Hyperpod AI | 'Sup | AkitaVault | Nudge | Rehabify | OpenMentor

🎧 What Went Down:
🚀 AI Startup Pitching – Youth-led founders and innovators presented their bold ideas and projects
💻 Live Demos and Insights – Attendees explored real SaaS products and heard the stories behind their development
🤝 Networking and Collaboration – Builders, creators, and young professionals connected to share ideas and spark opportunities

From students to professionals, the community came together to celebrate the future of youth-driven AI innovation.

📸 Photos and Highlights:
Our August group photo captured the collaborative spirit of the day. More snapshots and special demo moments will be shared soon on our socials.

📅 Next Meetup: 20 September 2025
Mark your calendars for the September AI Meetup. We will be back with more interactive sessions and fresh AI content. Stay tuned for the full details.

💬 Tell Us What You Thought:
Did you enjoy the startup pitches or a particular demo that stood out? Share your feedback and help us shape future meetups.

Till next time, stay curious, stay creative, and we'll see you at the next AI Monthly Meetup! 💡🌍`,
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
    gallery: [null, null, null, null],
  },
  {
    num: 8, date: 'Jul 2025',
    title: 'SG60 Edition — Multilingual Voice AI',
    desc: `🇸🇬 THANK YOU for Celebrating SG60 with Us at the July AI Meetup! 🎙️🔊

What a National Day edition! A massive thank you to everyone who joined our July Monthly AI Meetup. The vibes were patriotic, the conversations were deep, and the tech was next-level. ❤️🤍✨

🎧 What Went Down:
🗣️ A*STAR's MERaLiON team shared their journey building multilingual voice models in Singlish, Mandarin, Malay, Tamil, and more
🧠 A deep dive into ElevenLabs V3 and how to spin up your own conversational AI with text-to-speech
📱 A special preview of MerMurs, our broken-telephone-style voice game powered by multilingual AI
💬 Open discussions on the future of local voice tech and language diversity in AI

From curious first-timers to experienced builders, everyone came together to learn, question, and celebrate Singapore's unique voice 🗣️ in the world of AI. The energy in the room was unforgettable.

📸 Photos & Highlights
Our SG60 group photo captured the spirit of the day. More snapshots and special moments are coming soon on our socials!

🙏 Special Thanks
Huge thanks to Tarun Kumar from A*STAR - Agency for Science, Technology and Research and Thorsten Schaeff from ElevenLabs for sharing expertise and elevating the session.

💬 Tell Us What You Thought
Loved the voice tech content or the MerMurs sneak peek? Drop your feedback and help us shape future meetups.

Till next time, stay curious, stay creative, and we'll see you at the next AI Monthly Meetup! 💡🌍`,
    speakers: [
      { name: 'Tarun Kumar',      role: 'A*STAR — MERaLiON team', linkedin: '' },
      { name: 'Thorsten Schaeff', role: 'ElevenLabs',              linkedin: '' },
    ],
    hero: '/meetups/2025-07-sg60-multilingual/hero.jpg',
    gallery: [null, null, null],
  },
  {
    num: 7, date: 'Jun 2025',
    title: 'Vibe Coding with Claude Code (MicroSaaS in 45 min)',
    desc: `🌈 THANK YOU for Vibing with Us at the June AI Meetup! 💻🎶

What a session! A huge shoutout to everyone who vibed with us at our June Monthly AI Meetup. The energy was electric, and the vibes were immaculate. ✨

🎧 What Went Down:
💻 Vibe Coding with Claude Code to build MicroSaaS projects in just 45 minutes
🧠 Live demos of AI-assisted coding that blended chill and productivity
🌐 New friends, cool tech, and great conversations all in one space

From first-time coders to seasoned hackers, it was inspiring to see everyone dive in and create together. The rhythm of keystrokes, laughs, and learning made this meetup something special. 🎵⚙️

📅 Next Meetup: 26 July 2025
Get ready for a National Day Edition. We're diving into multilingual AI and voice synthesis. 🇸🇬🗣 Stay tuned!

Huge shoutout to everyone who stepped up and shared their builds. You made it awesome. 😝😝

💬 Got thoughts? Let us know what you loved or what we can improve. We're building this with you.

🔥 6 more AI meetups coming in 2025. Let's keep growing this together.`,
    speakers: [
      { name: 'Kaleb Nim', role: 'Host — SYAI', linkedin: 'https://www.linkedin.com/in/kaleb-nim/' },
    ],
    hero: '/meetups/2025-06-vibe-coding/hero.jpg',
    gallery: [null, null],
  },
  {
    num: 6, date: 'Apr 2025',
    title: 'AI Meets Ambition — Youth Startup Pitches',
    desc: `⚡️ AI Meets Ambition, April AI Meetup Recap! 💡🚀

That's a wrap on our April AI Monthly Meetup with Singapore Youth AI at *SCAPE and it was such a vibe. From bold startup pitches to live demos, the whole place was buzzing with ideas and energy.

⚡️ What went down:
👀 Youth-led AI products live in action, from health tools to smart productivity hacks
🎙️ Honest and unfiltered stories about the startup journey
🤝 Chill convos, unexpected collabs, and new friends made (hello, LinkedIn requests 👋)

Whether you were pitching, supporting a friend, or just came to explore the scene, we hope you left inspired and maybe with a few new ideas of your own.

Huge shoutout to everyone who stepped up and shared their builds. You made it awesome.

💬 Got thoughts? Let us know what you loved or what we can improve. We're building this with you.

🔥 8 more AI meetups coming in 2025. Let's keep growing this together.`,
    speakers: [
      { name: 'TBD', role: 'Youth founders — pitch lineup', linkedin: '' },
    ],
    hero: '/meetups/2025-04-pitches/hero.jpg',
    gallery: [null, null],
  },
  {
    num: 5, date: 'Mar 2025',
    title: 'Networking & Resume Roasting (SYAI x CYS)',
    desc: `🚀 Calling all AI enthusiasts!

After an exciting February session, we're back with another Monthly AI Meetup, jointly organised by Cyber Youth Singapore (CYS) and SGYouthAI (SYAI)! This time, we're diving into Networking & Resume "Roasting" — perfect for those looking to refine their resumes and make meaningful career connections!

📅 Date: 22 March 2025, Saturday
⏰ Time: 2:00 PM - 5:00 PM
📍 Location: *SCAPE, 2 Orchard Link, Singapore 237978

✨ What's in Store?
 • 💼 Live Resume Roasting – Get honest, constructive feedback from Lim Mei Yu, Founder of Get Ahead and a seasoned talent acquisition professional (Meta, Google, etc.), helping you stand out in the job market.
 • 📢 Open Resume Review Session – Willing attendees can submit their resumes for a live critique on the projector, allowing everyone to learn from real-world examples.
 • 🤝 Networking with a Twist – Your resume isn't just a job application — it's a conversation starter. Meet peers, exchange insights, and potentially connect with your next career opportunity!
 • 💬 Career & Hiring Q&A – Learn what recruiters really look for, how to position yourself for AI & tech roles, and gain insider hiring tips.

🎯 Who Should Attend?
✔️ University & Polytechnic students
✔️ Young professionals exploring AI & tech careers
✔️ Anyone looking to refine their resume & expand their network

🌟 Why Attend?
✅ Honest, actionable resume feedback from an industry recruiter
✅ Learn from real-world resume critiques in a supportive environment
✅ Expand your network within the AI & tech community

🧋 Bring a Friend, Get Bubble Tea!
Good things are better when shared! Bring a friend along to the meetup, and both of you will enjoy a FREE Bubble Tea on us! Just make sure your friend signs up and attends — you'll receive your BBT during the event!

🔗 Sign up here: https://forms.gle/FpKePiMijNLDtudV6
(Successful registrants will receive a confirmation email before the event.)

📩 Want to have your RESUME REVIEWED? Indicate it in the registration form!

🤝 Network • Learn • Grow`,
    speakers: [
      { name: 'Lim Mei Yu', role: 'Founder, Get Ahead (ex-Meta, ex-Google)', linkedin: '' },
      { name: 'CYS Rep',    role: 'Cyber Youth Singapore',                   linkedin: '' },
    ],
    hero: '/meetups/2025-03-resume-roasting/hero.jpg',
    gallery: [null, null, null],
    signup: 'https://forms.gle/FpKePiMijNLDtudV6',
  },
  {
    num: 4, date: 'Feb 2025',
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
    num: 3, date: 'Jan 2025',
    title: 'Fireside Chat with Dr Mukundan A P (SYAI x CYS)',
    desc: `I had the absolute pleasure of moderating the fireside chat at the Monthly AI Meetup, a collaborative event organized by Cyber Youth Singapore and Singapore Youth AI.

A special thank you to Mukundan A P for taking the time to share your invaluable insights regarding AI and engage with our community.

I love that these meetups foster important conversations in Singapore's growing AI ecosystem, bringing together young passionate minds and creating opportunities for knowledge exchange.
Looking forward to more enriching sessions ahead!

---

🌟 Empowering the Next Generation with AI 🌟 — by Dr. Mukundan A P (1st)

This weekend, I had the incredible opportunity to be the speaker at the #AI #Monthly #Meetup 2025 – Session 1 on 26th Jan 25 at Hilliview CC, #Singapore, hosted by #SGYouthAI x #CyberYouthSingapore. The #fireside chat was all about preparing young professionals and students to collaborate with AI and leverage its power for their careers and businesses.

💡 Key Discussion Highlights:
🔹 AI's role in software engineering & data science – how it's shaping industries.
🔹 AI & Productivity – automating tasks to let humans focus on creativity & strategy.
🔹 Champion Group's transformation – using AI to streamline workflows.
🔹 AI & SDLC Automation – integrating AI to optimize deployment, monitoring, security, compliance, and creating self-healing software.
🔹 Funding & Business Strategy for AI startups – taking ideas to market with impact.

🔹 The most important takeaway?

➡️ Even if you are a great person, your product must add value!
The energy in the room was inspiring – from students exploring AI careers to entrepreneurs discussing how AI can revolutionize business and software development. Seeing young minds question, challenge, and innovate reinforces the importance of mentorship and community-driven learning.
A huge thank you to the organizers, participants, and fellow AI enthusiasts for making this session a success! 🙌 Excited to continue these discussions and see how AI evolves in 2025.

📢 How do you see AI transforming your industry? Let's discuss in the comments!`,
    speakers: [
      { name: 'Dr Mukundan A P', role: 'Champion Group — Fireside Speaker', linkedin: '' },
      { name: 'Kaleb Nim',       role: 'Moderator — SYAI',                  linkedin: 'https://www.linkedin.com/in/kaleb-nim/' },
    ],
    hero: '/meetups/2025-01-fireside/hero.jpg',
    gallery: [null, null],
  },
  {
    num: 2, date: 'Dec 2024',
    title: 'Claude Code Workshop (SYAI x YouthTechSG)',
    desc: `I thought I knew Claude Code. Then I had to teach it to 60 people.

Yesterday's workshop, co-organised by Singapore Youth AI and YouthTechSG was a reminder that "I use this every day" and "I can explain this to a beginner" are completely different skill levels.

We covered the fundamentals of how Claude Skills, hooks, and subagents actually work. Each one looked simple on my screen at home. Each one required 3x more clarity when 60 people needed to follow along.

Some mishaps at the workshop:
→ Simply distributing API keys to 60 people is a workflow nobody documents
→ Claude Code setup on Windows was pure debugging hell
→ Content taught might have been too technical for participants who just started using Claude code

Big shout-out to my good friends Jesse Sng, Javerine Tan, Darwin Ho, Moiz Khambhati, Hu Bowen and many more for stepping in as mentors and unblocking participants throughout the session — the workshop wouldn't have run half as smoothly without you.

Sharing the full workshop slides here for anyone who wants to dive in or run their own session: https://lnkd.in/g_GVUYxE
Slides: https://syai-claude-workshop.vercel.app/1

Round 2 is already on my mind — I want to rework the content and make the next workshop even more value-packed for participants. If you're curious about Claude Code, or you're an organisation/community keen to co-host the next one, let's talk.`,
    speakers: [
      { name: 'Kaleb Nim',       role: 'Workshop Lead — SYAI', linkedin: 'https://www.linkedin.com/in/kaleb-nim/' },
      { name: 'Jesse Sng',       role: 'Mentor',               linkedin: '' },
      { name: 'Javerine Tan',    role: 'Mentor',               linkedin: '' },
      { name: 'Darwin Ho',       role: 'Mentor',               linkedin: '' },
      { name: 'Moiz Khambhati',  role: 'Mentor',               linkedin: '' },
      { name: 'Hu Bowen',        role: 'Mentor',               linkedin: '' },
    ],
    hero: '/meetups/2024-12-claude-code/hero.jpg',
    gallery: [null, null, null],
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

// ── HACKATHONS (15) ────────────────────────────────────────────────────────

export const HACK_ITEMS: HackItem[] = [
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
    desc: 'workshops I hosted at Singapore Youth AI',
    title: './syai-meetups — talks I hosted at SYAI',
    intro:
      'Singapore Youth AI — a community I co-run for high-schoolers + early-uni students. Each meetup is a hands-on session.',
    items: SYAI_ITEMS,
    footer: '[11 sessions] · ~80 avg attendance · open to all',
  },
  {
    id: 'hackathons',
    path: 'hackathons',
    count: 15,
    aliases: ['hacks', 'hackathon'],
    desc: 'weekends I traded for shipping demos',
    title: './hackathons — 15 weekends, 15 demos',
    intro: 'Things I built between Friday night and Sunday afternoon. Most still work.',
    items: HACK_ITEMS,
    footer: '[15 entries] · 1 win · 1 finalist · 0 regrets',
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
