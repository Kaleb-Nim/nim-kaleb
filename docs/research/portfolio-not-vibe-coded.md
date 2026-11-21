# What makes a dev portfolio not look vibe-coded

Research for issue #7 (child of map #5). Researched 2026-11-21. Every URL below returned HTTP 200 on that date unless noted.

**Question:** Which developer portfolios are widely admired right now, and what concrete patterns make a site read as hand-made rather than as an AI template? The answer has to work as a checklist for the prototype ticket.

**Short answer:** "Vibe-coded" is now a measurable look, not just a feeling. Adrian Krebs scored 1,590 Show HN landing pages against 18 deterministic CSS/DOM checks and found 22% hit four or more ([adriankrebs.ch/blog/design-slop](https://www.adriankrebs.ch/blog/design-slop/), 2026-04-20). The admired portfolios avoid those defaults. They also have something a model can't make up: specific facts, real artifacts and a voice of their own. Of those three, specificity matters most. A plain HTML page with real numbers and jokes (karpathy.ai) reads as more hand-made than a polished generic hero.

---

## 1. Exemplars

| # | URL | Why it works (one line) |
|---|-----|-------------------------|
| 1 | https://cs.jensenhshoots.com/ | **The reference.** Single scroll. Each project opens with one big specific stat ("10,000 people split bills here", "Three hackathons. Two prizes.") and then a fact list (users, money moved, commits, stack). The work timeline has a witty one-line aside per role ("Razer posted my dog in 2017. I joined in 2025."). Screenshots are real, with sensitive data blurred, and photo captions carry jokes. |
| 2 | https://karpathy.ai | "0 frameworks were used to make this simple responsive website." Two static files and a plain reverse-chronological timeline with logos. The self-deprecating copy ("I have three blogs 🤦‍♂️") makes up for having no visual design at all. |
| 3 | https://eugeneyan.com | Applied-ML engineer whose portfolio *is* his writing. The page leads with a one-line thesis ("bridge the field and the frontier") and then a dense list of titled essays and talks. A good model for an AI-engineering candidate. |
| 4 | https://hamel.dev | AI-evals practitioner. Credibility comes from concrete numbers ("20+ years", "over 5,000 students from 500+ companies") and blunt post titles ("'It's Hard to Eval' Is a Product Smell"), not from visuals. |
| 5 | https://jxnl.co | Jason Liu (Instructor). The site is a plain MkDocs theme, and it still doesn't read as a template because the copy is so specific: Instructor was cited by OpenAI as inspiration for structured outputs, and he names real clients and students. |
| 6 | https://rauno.me | Interaction designer. The homepage is mostly links, and the craft lives on dedicated pages. Voice is terse and rhythmic ("Make it fast. / Make it beautiful. / … / Make it soulful. / Make it."). His essay [Invisible Details of Interaction Design](https://rauno.me/craft/interaction-design) is the canonical write-up on craft. |
| 7 | https://emilkowal.ski | Design engineer (Sonner, Vaul). Short, understated homepage. His craft shows in shipped OSS components and essays like [You Don't Need Animations](https://emilkowal.ski/ui/you-dont-need-animations). |
| 8 | https://jakub.kr | Design engineer. Projects are tools for other builders ("A guide to OKLCH colors"), and writing titles name specific techniques ("Drag gestures on the web"). Specific topics read as earned expertise. |
| 9 | https://leerob.com | Bio in prose rather than a résumé grid. Dated blog list, a light personal touch ("my much cooler wife"). Proof that a minimal site works when the content is real. |
| 10 | https://shud.in | Shu Ding (Next.js, v0). Typography and whitespace only, no images. Restraint done on purpose rather than as a default. |
| 11 | https://www.joshwcomeau.com | Whimsy as a signature: hidden UI details, sound effects, playful copy ("pretty friggin' cool!"). Shows that motion and delight can be a voice when they're consistent and authored. |
| 12 | https://bruno-simon.com | The extreme end: the portfolio is a Three.js driving game ("Please drive around to learn more about me"). Unmistakably hand-made, but it's a creative-dev flex, not an internship-screening format. |
| 13 | https://dimden.dev | Deliberately Web 1.0: 88x31 buttons, webring, GIFs, "I hate the Sun." The opposite of the AI median. Useful as a reminder that weirdness reads as human. |
| 14 | https://maggieappleton.com | Digital garden with hand-drawn illustrations. Imagery no model or template ships with. |
| 15 | https://ciechanow.ski | Interactive explainers built from scratch. The ceiling for "show, don't tell" with custom visuals. |
| ⚠ | https://brittanychiang.com | **Cautionary.** The site is admired, but her v4 repo ([bchiang7/v4](https://github.com/bchiang7/v4)) has **4,186 forks / 8,299 stars** (GitHub API, 2026-11-21). Its navy + `#64ffda` two-column sticky-sidebar layout is now one of the most recognisable cloned-portfolio looks. Being admired doesn't stop a design from turning into a template. |

The most useful models for Kaleb are 1 (structure), 2, 3 and 4 (credibility through specifics for an AI-engineering audience), and 6 and 7 (restraint plus one authored detail).

---

## 2. Tells of a vibe-coded site (avoid)

**Primary source:** Krebs's 18 checks ([design-slop](https://www.adriankrebs.ch/blog/design-slop/)), quoted below. Corroborated by Anthropic's own frontend-aesthetics guidance ([cookbook, 2025-10-21](https://platform.claude.com/cookbook/coding-prompting-for-frontend-aesthetics); [skills blog](https://claude.com/blog/improving-frontend-design-through-skills)), the HN thread [Ask HN: How can you tell a site/app is vibe coded?](https://news.ycombinator.com/item?id=49290499), [prg.sh](https://prg.sh/ramblings/Why-Your-AI-Keeps-Building-the-Same-Purple-Gradient-Website) (2025-10-26) and [Robots on Payroll](https://robotsonpayroll.substack.com/p/how-to-avoid-that-vibe-coded-look) (2026-07-21).

### Type
- [ ] "Inter used for everything, but especially the centered hero headlines" (Krebs). Anthropic: "Never use: Inter, Roboto, Open Sans, Lato, default system fonts."
- [ ] The *second-wave* slop fonts: "Space Grotesk, Instrument Serif and Geist" (Krebs). HN commenters add Syne and Fraunces. Anthropic admits models "still tend to converge on common choices (Space Grotesk, for example)." So swapping Inter for Space Grotesk doesn't fix it.
- [ ] "Serif italic for one accent word in an otherwise-Inter hero" (Krebs).
- [ ] All-caps headings and section labels (Krebs).

### Colour
- [ ] "VibeCode Purple" / indigo accents and blue-to-purple gradients. Common explanation: Tailwind UI's `bg-indigo-500` default filled the training data (prg.sh; Adam Wathan's Aug 2025 apology tweet, per secondary coverage).
- [ ] "Purple gradients on white backgrounds" (Anthropic).
- [ ] "Perma dark mode with medium-grey body text" and "barely passing body-text contrast in dark themes" (Krebs). HN commenters also flag beige/brown-on-dark and a "somewhat hard to read console-ish font" as a Claude default ([HN discussion of Krebs](https://hn.nuxt.dev/item/47864393)).
- [ ] "Gradient everything", "large colored glows and colored box-shadows" (Krebs), and "zero-offset dark glows on text" (HN).
- [ ] Navy-blue "techy" schemes (HN).

### Layout and components
- [ ] "Centered hero set in a generic sans", with a "badge right above the hero H1" (Krebs).
- [ ] "Identical feature cards, each with an icon on top", usually three in a row with rounded corners, soft shadow and thin line icons ([925studios](https://www.925studios.co/blog/ai-slop-design-tells); prg.sh).
- [ ] "Colored borders on cards, on the top or left edge", described as "almost as reliable a sign of AI-generated design as em-dashes for text" (Krebs, quoted by Robots on Payroll).
- [ ] "Numbered '1, 2, 3' step sequences" (Krebs).
- [ ] **"Stat banner rows"** (Krebs): a strip of `10k+ users · 99% uptime · 50+ projects`. See the note in section 4.
- [ ] "Sidebar or nav with emoji icons" (Krebs) and emoji as large header icons (HN).
- [ ] shadcn/ui defaults and glassmorphism (Krebs). Lucide icons everywhere (HN).
- [ ] Rounded corners on everything, shadows at exactly 0.1 opacity (prg.sh).
- [ ] The Brittany Chiang v4 clone layout (see exemplars).

### Copy
- [ ] "Weightless headline copy" such as "Build faster. Ship smarter." and a gradient "Get Started" button (925studios).
- [ ] Em dashes all through the text (HN's most-cited tell).
- [ ] UI elements that over-explain what they do, leftover LLM commentary (HN).
- [ ] Generic self-descriptions ("passionate developer who loves building scalable solutions") and README openers like "This project is a [type] built with [stack]" ([dev.to, portfolio strategy 2026](https://dev.to/pickuma/portfolio-strategy-for-2026-surviving-the-ai-generated-noise-filter-4oj3); secondary).

### Imagery
- [ ] Interchangeable thin line icons "that could illustrate any product" (925studios).
- [ ] No real screenshots: abstract blobs, mock device frames, stock or generated illustrations.

### Motion
- [ ] Scattered micro-interactions and fade-up on every block. Anthropic says "one well-orchestrated page load with staggered reveals … creates more delight than scattered micro-interactions."
- [ ] Animating frequent or keyboard-triggered actions (Emil Kowalski: keyboard actions "should never be animated").

---

## 3. Signals of craft (do)

### Layout
- [ ] **One strong structural idea, held for the whole page.** Jensen's is single scroll, stat headline then facts then links, repeated for every project. Consistency reads as authored.
- [ ] **Reverse-chronological timeline with an aside per entry** (Jensen, Karpathy). Date range, org, role, then one line of personality and two or three outcome bullets.
- [ ] Left-aligned, asymmetric or editorial layouts rather than a centered hero (implied by Krebs's centered-hero check; Anthropic: "make unexpected choices that feel genuinely designed for the context").
- [ ] Anthony Hobday's [safe visual design rules](https://anthonyhobday.com/sideprojects/saferules/) as a QA pass: "Everything in your design should be deliberate", "Everything should be aligned with something else", "Measurements should be mathematically related", "Use a line length around 70 characters", "Use two typefaces at most", "Nest corners properly", "Don't use shadows in dark interfaces".

### Type
- [ ] A typeface you chose for a reason, not the model's pick. Anthropic's examples include the IBM Plex family, JetBrains Mono, Newsreader and Bricolage Grotesque, but check the pick against Krebs's list. Don't use any font that appears there.
- [ ] Hobday: "Lower letter spacing and line height with larger text. Raise them with smaller text"; body ≥ 16px.
- [ ] Mono used for data and code only (install commands, stats, stack), not as the body font. Jensen does this with a copy button on install commands.

### Colour
- [ ] "Dominant colors with sharp accents outperform timid, evenly-distributed palettes" (Anthropic). Define them as CSS variables.
- [ ] Near-black and near-white rather than `#000` and `#fff`; saturated neutrals, either warm or cool but not both (Hobday).
- [ ] If dark: body text at real contrast, not medium grey (inverse of Krebs).

### Motion
- [ ] One orchestrated moment rather than animation everywhere (Anthropic). UI motion under 300ms, and none on frequent or keyboard actions ([Kowalski](https://emilkowal.ski/ui/you-dont-need-animations)).
- [ ] Interaction details that respond to intent: interruptible, immediate feedback, behaviour from the physical world ([Rauno](https://rauno.me/craft/interaction-design)).
- [ ] At most one signature delight that's yours (Josh Comeau's sound and hidden details; Bruno Simon's car), and respect `prefers-reduced-motion`.

### Copy
- [ ] **Specific numbers with units and context**: "10,000 people split bills here", "5,000 students from 500+ companies" (Jensen, Hamel). A model can't invent your real numbers.
- [ ] **Named proof**: orgs, prizes, who cited you (jxnl: Instructor cited by OpenAI). Proper nouns beat adjectives.
- [ ] **Self-aware asides and jokes**: "Jensen Huang, not the Nvidia one", "Razer posted my dog in 2017. I joined in 2025.", "I have three blogs 🤦‍♂️". Emoji used as a punchline is fine. Emoji as bullets or nav icons is the tell.
- [ ] Blunt, opinionated titles for writing (Hamel's "Stop Saying RAG Is Dead").
- [ ] No em dashes, no "passionate", no "seamless", no "Build faster. Ship smarter."

### Imagery
- [ ] **Real screenshots of the real product**, with sensitive data blurred (Jensen).
- [ ] Real photos of people and events, with captions that carry voice (Jensen's hackathon and team photos; Karpathy's portrait and talk thumbnails).
- [ ] Hand-made artefacts if you have them: diagrams, sketches, interactive demos (Maggie Appleton, ciechanow.ski).

### Process check
- [ ] **Reverse squint test**: screenshot the page and ask a fresh LLM chat "which AI builder made this?" If it can guess, visitors can too ([Robots on Payroll](https://robotsonpayroll.substack.com/p/how-to-avoid-that-vibe-coded-look)).
- [ ] **Run Krebs's 18 checks** against the prototype. The target is 0 or 1, his "Low" bucket. Every check is "a deterministic CSS or DOM check", so this can be scripted.
- [ ] Write checkable rules into a `design.md` ("buttons are pill-shaped with a hard black shadow", not "generous padding") and re-read it when the agent drifts (Robots on Payroll).

---

## 4. Notes specific to this repo

1. **Stat headline ≠ stat banner.** Krebs flags "stat banner rows" as slop. Jensen's big stats aren't that. Each is *one* number per project, phrased as a sentence about people ("10,000 people split bills here"), used as that project's headline and backed by a fact list. Copy that, and don't add a `3 hackathons · 10k users · 5 internships` strip under the hero.
2. **The current terminal theme sits close to a known tell.** Krebs's "perma dark mode" and the HN comments on "console-ish fonts" and dark/terminal convergence describe the current Kortix green-on-black look. The terminal stays a defensible choice *because* it's tied to a real feature (the voice clone) and carries a narrative. As a generic dark-mono skin on a new single-scroll page, it would count against you. If it stays, keep it to the voice-interface moment and give the scroll page its own type and palette.
3. **The AI-engineering audience rewards substance over visuals** (Eugene Yan, Hamel, jxnl, Karpathy). They all have minimal designs, and their credibility comes from writing, numbers and named outcomes. Spend the effort budget on copy and real screenshots first, then on one signature interaction.

## Sources

Primary:
- Adrian Krebs, "Show HN submissions tripled and now mostly share the same vibe-coded look", https://www.adriankrebs.ch/blog/design-slop/ (2026-04-20). HN discussion: https://hn.nuxt.dev/item/47864393
- Anthropic, Prompting for frontend aesthetics, https://platform.claude.com/cookbook/coding-prompting-for-frontend-aesthetics (2025-10-21); https://claude.com/blog/improving-frontend-design-through-skills
- Ask HN: How can you tell a site/app is vibe coded?, https://news.ycombinator.com/item?id=49290499
- Shin et al., "Interrogating Design Homogenization in Web Vibe Coding", arXiv:2603.13036 (2026-03-13), https://arxiv.org/abs/2603.13036. Argues that frictionless generation makes homogenisation worse and proposes "productive friction".
- Anthony Hobday, Visual design rules you can safely follow every time, https://anthonyhobday.com/sideprojects/saferules/
- Rauno Freiberg, Invisible Details of Interaction Design, https://rauno.me/craft/interaction-design
- Emil Kowalski, You Don't Need Animations, https://emilkowal.ski/ui/you-dont-need-animations
- bchiang7/v4 README and GitHub API counts, https://github.com/bchiang7/v4
- The exemplar sites themselves (table above).

Secondary (used only for corroboration):
- prg.sh, Why Your AI Keeps Building the Same Purple Gradient Website (2025-10-26)
- Robots on Payroll, how to avoid that "vibe coded" look (2026-07-21)
- 925studios, AI Slop Fonts and Gradients (2026)
- Adam Wathan's `bg-indigo-500` apology (X, Aug 2025). Known only through secondary coverage such as https://dev.to/alanwest/why-every-ai-built-website-looks-the-same-blame-tailwinds-indigo-500-3h2p. Exact wording not verified.

Not verified: https://uxdesign.cc/ai-design-isnt-ugly-it-s-fluent-and-that-s-the-problem-131b2f4eb78c returned 403 and wasn't used.
