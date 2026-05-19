# Requirements: Kaleb's AI Voice Portfolio

**Defined:** 2026-04-15
**Core Value:** Visitors can have a natural, human-sounding voice conversation with an AI clone of Kaleb that authentically represents his experience and personality.

## v2.0 Requirements

Requirements for milestone v2.0: Scholarship Video Production.
`
### Script & Narrative

- [x] **SCRIPT-01**: Script uses TikTok narrative structure (hook → open loop → problem → mechanism → result → CTA) while naturally hitting scholarship pointers (context, what you built, what you tried, what surprised you). Open loop teases payoff near end for retention.
- [x] **SCRIPT-02**: Script is 1-2 minutes at natural speaking pace (~150-300 words)
- [x] **SCRIPT-03**: Script references specific technical examples from git history (API pivot, race conditions, audio bugs, speech quality tuning)

### Storyboard & Visuals

- [x] **STORY-01**: Beat-by-beat storyboard with frame timing for each segment
- [x] **STORY-02**: Each beat specifies visual type (talking head / screen demo / architecture diagram / code snippet)
- [x] **STORY-03**: Visual briefs exist for all Remotion-produced segments (overlays, diagrams, text cards)

### Production Assets

- [x] **PROD-01**: Demo recording plan specifying which parts of the live site to capture and in what order
- [x] **PROD-02**: Shot list and production checklist for filming day

## v2.1+ Requirements

Deferred to future release. Tracked but not in current roadmap.

### Post-Production

- **POST-01**: Voiceover generation via OpenAI TTS (video-production /gen-voiceover)
- **POST-02**: Caption generation and overlay via Remotion CaptionOverlay
- **POST-03**: Final Remotion composition render

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Remotion rendering/export | Production happens in video-production repo, not here |
| Multiple video versions | One strong cut is the goal; iterate after filming |
| Professional editing software | Remotion + talking head is the production pipeline |
| Music/soundtrack production | Simple SFX if any; no original music needed |

## v3.0 Requirements

Requirements for milestone v3.0: Directory Home & Work Experience.

**Source design:** `kebab-neural-interface-design-system/project/ui_kits/terminal/` (design kit `pz0qDtAzozp6fFUWVhYlTg`).

### Home Page (`#/`)

- [x] **HOME-01**: Identity header renders "Kaleb Nim @ kebab-neural-interface" with blinking cursor, sub-line "AI engineer · Singapore · Operating Model kaleb-nim-400b-0706"
- [x] **HOME-02**: Quick-status bar with 5 links — github (Kaleb-Nim), linkedin (kaleb-nim), email (kaleb.nim@gmail), cv (PDF download), site (nim-kaleb.vercel) — labels collapse below 480px
- [x] **HOME-03**: Gold internship banner "LOOKING FOR AI ENGINEERING INTERNSHIPS — STARTING AUG 2026" (visible on home only)
- [x] **HOME-04**: Section directory lists 6 entries (work, syai-meetups, hackathons, sidequests, hobbies, links) with path · description · count badge · chevron; each row is a ≥60px tap target with pressed-state border + transform
- [x] **HOME-05**: Mobile affordance hint line "‹ tap any row above to open a section · tap ● talk to me to chat with my voice clone ›" renders below the directory

### Routing

- [x] **ROUTE-01**: Hash router resolves `#/` → home, `#/work-experience` → work page, unknown paths → 404 page (red "[SYSTEM] 404 — directory not found")
- [x] **ROUTE-02**: Section directory rows navigate via `#/<path>`; browser back/forward and direct URL load both render correctly; scroll resets to top on navigation
- [x] **ROUTE-03**: Unfinished sections (meetups, hackathons, sidequests, hobbies, links) render a "coming soon" stub page rather than 404, so the directory entries remain clickable without dead-ending

### Work Experience Page (`#/work-experience`)

- [ ] **WORK-01**: PageHeader renders breadcrumb (← ~/kaleb / work-experience), title "./work-experience — paid AI engineering", intro line, and "[4 entries]" gold chip
- [ ] **WORK-02**: Vertical phosphor-green timeline rail with 4 status nodes (◉ ACTIVE, ● SHIPPED, ○ ARCHIVED) positioned at each role's top edge
- [ ] **WORK-03**: 4 work entries (RAiD active, Tensorplex Labs shipped, ARTC AI Engineer shipped, ARTC Dev Sci Intern archived) each show date, title, status tag, org, and description note
- [ ] **WORK-04**: Each entry shows a square logo chip (≈56–76px responsive) on a white/light-cream background with green border + halo; missing logo gracefully hides
- [ ] **WORK-05**: Logo assets (raid.png, tensorplex.png, artc.png) ship from `public/work-logos/` and load via stable URLs
- [ ] **WORK-06**: FooterMeta shows "[4 entries] · most recent first · ‹ tap ~/kaleb to return home"

### Floating Voice ("● talk to me")

- [x] **VOICE-01**: Floating mic button anchored bottom-centre, visible on every route, shrinks to circular icon below 520px
- [x] **VOICE-02**: Tapping the mic opens a modal overlay containing the existing voice pipeline (VoiceInterface) — overlay dismisses on backdrop click or `Esc`
- [x] **VOICE-03**: Existing DashScope ASR → LLM → TTS pipeline continues to function inside the overlay without regression (greeting, barge-in, 20-turn memory)

### Compatibility & Migration

- [x] **MIG-01**: BOOTING → STATUS → MENU state machine is retired; users no longer have to type `1 ⏎` to reach voice
- [x] **MIG-02**: Starfield + Terminal window chrome (860px max, 10px radius, macOS dots) are reused from the existing implementation
- [x] **MIG-03**: `prefers-reduced-motion` disables typewriter / fade-in animations site-wide

## v3.0.1 Requirements — Dev Preview Environment (Phase 12)

- [ ] **DEV-01**: Long-lived `dev` branch exists on `origin`, branched from `main`
- [ ] **DEV-02**: Pushes to `dev` deploy to a stable Vercel preview URL (custom subdomain `dev.kalebnim.dev` if attainable, otherwise the Vercel `git-dev` branch alias) — production deploys from `main` are unaffected
- [ ] **DEV-03**: Vercel Preview environment has the runtime env vars needed for the deployed site to function (at minimum `OPENAI_API_KEY`); no secrets are committed to the repo
- [ ] **DEV-04**: README documents the three-tier branching/deploy model (`main` = production, `dev` = stable preview, feature branches = ephemeral PR previews) and lists the dev preview URL

## v3.1+ Requirements

Deferred to future release.

### Remaining Section Pages

- **HACK-01**: Hackathons grid with WON/FINALIST gold cards
- **SIDE-01**: Sidequests dense log with role inference
- **HOB-01**: Hobbies expressive blocks
- **LINK-01**: Links big-button page

### SYAI Meetups Page (Phase 13)

- [x] **SYAI-01**: `#/syai-meetups` route renders the real `MeetupsPage` component (no longer the Phase 10 stub); other section routes (`hackathons`, `sidequests`, `hobbies`, `links`) still render the Phase 10 stub — no regression
- [x] **SYAI-02**: `MeetupItem` type in `app/lib/sections.ts` carries `num`, `date`, `title`, `desc`, `speakers: Speaker[]`, `hero: string | null`, `gallery: Array<string | null>`, and optional `signup` URL; a `Speaker` type with `name`, `role`, `linkedin` is exported
- [x] **SYAI-03**: `SYAI_ITEMS` contains exactly 11 real meetup entries (numbered 1..11, most-recent first), including the March 22 2025 SYAI x CYS Resume Roasting entry with speaker Lim Mei Yu and the verbatim sign-up URL `https://forms.gle/FpKePiMijNLDtudV6`
- [x] **SYAI-04**: Each meetup card uses Layout B — hero image LEFT, description RIGHT (2-col), speakers full-width below, gallery thumbs below speakers; missing hero/gallery images render the styled `[ no media ]` placeholder (no broken-image icon)
- [x] **SYAI-05**: Tapping a hero or gallery thumb opens a fullscreen lightbox overlay; lightbox closes on Esc or backdrop click but NOT on click of the inner image; ArrowLeft/ArrowRight navigate across all images in the flat list
- [x] **SYAI-06**: Each meetup with `speakers.length >= 1` renders the Speakers block (name + role + LinkedIn `in ↗` chip per speaker)
- [x] **SYAI-07**: Meetup image assets are served from `public/meetups/` (paths starting with `/meetups/`) — when present they return HTTP 200; when absent the placeholder renders without console errors
- [x] **SYAI-08**: Page holds at 360px (no horizontal scroll) and 1024px+ (kit-faithful layout); `bun run build` exits 0; no Layout A / C / D code, no Tweaks panel, no filter / search UI, no SYAI signup CTA, no new routes
- [x] **SYAI-09**: Home page, floating mic button, voice overlay, and all other section routes (work-experience and the four remaining stubs) continue to function with no regression

### SYAI Meetups Content Population (Phase 14)

- [ ] **SYAI-CONTENT-01**: Every meetup in `SYAI_ITEMS` whose source recap exists in `.planning/research/portfolio_info/*.txt` carries the full verbatim multi-paragraph description from that source (no Phase-13 one-liner remains for entries backed by a source file)
- [ ] **SYAI-CONTENT-02**: Every speaker for whom a real name is known (at minimum: Lim Mei Yu, Dr Mukundan A P, Tarun Kumar, Thorsten Schaeff, Assel Mussagaliyeva Tang, Dr Ferdin Joe John Joseph, Kaleb Nim) replaces the Phase-13 `'Speaker Name'` placeholder; LinkedIn URLs are populated when a real profile is known and left as `''` otherwise so the `in ↗` chip hides per SYAI-06
- [ ] **SYAI-CONTENT-03**: No file under `app/components/**` is modified, the `MeetupItem` / `Speaker` type shape is unchanged, the SECTIONS `syai-meetups` count remains 11, and `bun run build` exits 0 (purely a `SYAI_ITEMS` data refresh)

## Out of Scope (v3.0)

| Feature | Reason |
|---------|--------|
| Meetups / Hackathons / Sidequests / Hobbies / Links pages | UI designs still being finalised by Kaleb |
| Full Next.js App Router migration to per-section routes | Hash router preserves the single-page terminal illusion; deeper SEO can wait |
| Server-rendered work content (CMS / MDX) | Static `index-data` is enough for 4 entries |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SCRIPT-01..03, STORY-01..03, PROD-01..02 | Phases 8–9 | Complete (v2.0) |
| HOME-01..05 | Phase 10 | Planned |
| ROUTE-01..03 | Phase 10 | Planned |
| VOICE-01..03 | Phase 10 | Planned |
| MIG-01..03 | Phase 10 | Planned |
| WORK-01..06 | Phase 11 | Planned |
| SYAI-01..09 | Phase 13 | Complete (2026-05-19) |
| SYAI-CONTENT-01..03 | Phase 14 | Planned |

**Coverage (v3.0):**
- Requirements: 20 total
- Mapped to phases: 20
- Unmapped: 0

---
*Requirements defined: 2026-04-15 (v2.0), 2026-05-18 (v3.0)*
*Last updated: 2026-05-19 after Phase 14 planning*
