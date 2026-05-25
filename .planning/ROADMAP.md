# Roadmap: Kaleb's AI Voice Portfolio

## Milestones

- ✅ **v1.0** — Phases 1-4 (shipped 2026-04-12)
- 🚧 **v1.1 Observability, Testing & Bug Fixes** — Phases 5-7 (in progress)
- ✅ **v2.0 Scholarship Video Production** — Phases 8-9 (complete)
- 📋 **v3.0 Directory Home & Work Experience** — Phases 10-11 (planning)

## Phases

<details>
<summary>✅ v1.0 — Full Voice Pipeline (Phases 1-4, shipped 2026-04-12)</summary>

See full archive: [milestones/v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md)

### Phase 1: Voice Enrollment
**Goal**: Kaleb's cloned voice exists in DashScope and is verified to sound like him
**Depends on**: Nothing (first phase)
**Requirements**: VOICE-01, VOICE-02, VOICE-03, VOICE-04, VOICE-05
**Plans**: 3 plans

Plans:
- [x] 01-01: Create enrollment script, record audio, enroll voice with DashScope
- [x] 01-02: Author LLM system prompt with persona, knowledge base, and style constraints
- [x] 01-03: Verify voice quality and emotional intonation variation

### Phase 2: Server Infrastructure + Full Pipeline
**Goal**: Visitors can speak to the site and hear Kaleb's AI clone respond, end-to-end
**Depends on**: Phase 1
**Requirements**: PIPE-01, PIPE-02, PIPE-03, PIPE-04, PIPE-05, PIPE-06, CONV-03
**Plans**: 3 plans

Plans:
- [x] 02-01: Create Bun WS server scaffold with DashScope ASR integration
- [x] 02-02: Wire LLM and TTS streaming pipeline with sentence-boundary overlap
- [x] 02-03: Refactor browser hook for new protocol and add auto-reconnect

### Phase 3: Conversational AI + Speech Quality
**Goal**: Conversation feels natural — VAD activates automatically, the AI remembers context, and speech sounds human
**Depends on**: Phase 2
**Requirements**: SPCH-01, SPCH-02, SPCH-03, CONV-01, CONV-02, CONV-04, CONV-05
**Plans**: 2 plans

Plans:
- [x] 03-01: Update system prompt for speech quality and tune VAD + barge-in filter on server
- [x] 03-02: Add accessible transcript toggle and fix responseText lifecycle on client

### Phase 4: UI Preservation + Launch Readiness
**Goal**: The terminal experience is exactly as designed and the site is ready for recruiters to visit
**Depends on**: Phase 3
**Requirements**: UI-01, UI-02, UI-03, UI-04
**Plans**: 3 plans

Plans:
- [x] 04-01: Fix CSS spec gaps (line-height, overflow) and re-apply accessible transcript toggle
- [x] 04-02: Cross-viewport Playwright smoke tests and human visual verification
- [x] 04-03: Production launch: Alibaba Cloud ECS WS deploy, Vercel env vars, end-to-end smoke test

</details>

### v1.1 Observability, Testing & Bug Fixes (In Progress)

**Milestone Goal:** Fix known TTS playback regressions, add structured session analytics, and close the automated test coverage gap with component health checks and a full E2E audio pipeline test.

#### Phase 5: TTS Playback Bug Fixes
**Goal**: Every visitor hears complete, non-overlapping responses and barge-in stops audio cleanly
**Depends on**: Phase 4
**Requirements**: BUG-01, BUG-02, BUG-03
**Success Criteria** (what must be TRUE):
  1. Visitor hears the AI's full response without audio cutting off mid-sentence
  2. Interrupting the AI (barge-in) stops playback immediately with no audio overlap on the next response
  3. Barge-in teardown produces no audio pop or artifact (clean silence after interrupt)
**Plans**: 1 plan

Plans:
- [x] 05-01-PLAN.md — Fix audio cutoff (onended drain), barge-in overlap (generation counter), and audio pop (graceful TTS teardown)

#### Phase 6: Session Analytics & Logging
**Goal**: Every conversation turn is durably logged on the ECS server with latency breakdowns for each pipeline component
**Depends on**: Phase 5
**Requirements**: LOG-01, LOG-02
**Success Criteria** (what must be TRUE):
  1. A completed conversation produces an NDJSON log file on the ECS server with one entry per turn containing session ID, role, transcript text, and timestamp
  2. Each log entry includes measured latency for ASR duration, LLM time-to-first-token, TTS time-to-first-audio, and total round-trip
  3. Log writes do not add perceptible delay to the voice response (analytics is fire-and-forget, not in the hot path)
**Plans**: 1 plan

Plans:
- [x] 06-01-PLAN.md — Create logger module, extend ASR callbacks, instrument session.ts with per-turn NDJSON logging and latency tracking

#### Phase 7: Automated Testing
**Goal**: The test suite verifies WS server connectivity, each DashScope component, and the full audio pipeline end-to-end — and all tests pass in CI
**Depends on**: Phase 5
**Requirements**: TEST-01, TEST-02, TEST-03, TEST-04
**Success Criteria** (what must be TRUE):
  1. `bun test` (or equivalent) passes a health check confirming the WS server accepts a WebSocket handshake
  2. An automated test sends audio to DashScope ASR and asserts a non-empty transcript is returned within the latency target
  3. An automated test sends text to DashScope TTS and asserts PCM audio bytes are returned with a byte-level sanity check
  4. An automated E2E test exercises the full round-trip (audio input → ASR transcript → LLM response → TTS audio output) and asserts the pipeline completes successfully
  5. All tests run in CI without requiring a real microphone (audio injected at the WebSocket level)
**Plans**: 2 plans

Plans:
**Wave 1**
- [x] 17-01-PLAN.md — Create MeetupsPage.module.css (stats hero, grid, card overlay, detail overlay, responsive breakpoints) + MeetupGridCard component (photo-forward image card with gradient overlay text)

**Wave 2** *(blocked on Wave 1 — needs CSS Module + MeetupGridCard)*
- [x] 17-02-PLAN.md — Create MeetupDetail overlay, rewrite MeetupsPage (stats hero + grid + detail + no speakers), human-verify checkpoint at 360px + 1024px

### v2.0 Scholarship Video Production (Planned)

**Milestone Goal:** Create a punchy 1-2 minute TikTok-first scholarship application video showcasing the AI Voice Portfolio — what was built, the context, what was tried, and what surprised Kaleb — producing all narrative, storyboard, and production assets needed for filming day.

#### Phase 8: Script & Storyboard
**Goal**: A complete, approved script and beat-by-beat storyboard exist that tell the AI Voice Portfolio story in TikTok narrative structure
**Depends on**: Nothing (video production milestone, independent of Phases 1-7)
**Requirements**: SCRIPT-01, SCRIPT-02, SCRIPT-03, STORY-01, STORY-02
**Success Criteria** (what must be TRUE):
  1. A written script exists that follows hook -> open loop -> problem -> mechanism -> result -> CTA structure and fits within 1-2 minutes at natural speaking pace
  2. The script references at least two specific technical examples drawn from the project's git history (e.g., API pivot, race conditions, audio bugs, or speech quality tuning)
  3. Scholarship pointers (context, what was built, what was tried, what surprised Kaleb) are woven into the narrative without feeling like a checklist
  4. A storyboard document exists with a row per beat: beat name, timing, spoken words, and visual type (talking head / screen demo / architecture diagram / code snippet)
**Plans**: 1 plan

Plans:
- [x] 08-01-PLAN.md — Write TikTok narrative script and beat-by-beat storyboard

#### Phase 9: Visual Production & Demo Plan
**Goal**: All production assets are ready for filming day — visual briefs for every Remotion segment and a concrete shot list so no decisions need to be made on the day
**Depends on**: Phase 8
**Requirements**: STORY-03, PROD-01, PROD-02
**Success Criteria** (what must be TRUE):
  1. A visual brief exists for every Remotion-produced segment identified in the storyboard, specifying layout, text content, color treatment, and animation intent
  2. A demo recording plan lists each section of the live site to capture, the order of capture, and any setup steps needed (e.g., clearing session state, triggering voice connection)
  3. A shot list and production checklist exist covering camera setup, lighting, wardrobe, takes required, and a pre-filming system check — so filming can start without any open decisions
**Plans**: 2 plans

Plans:
- [x] 09-01-PLAN.md — Create visual briefs for Remotion segments and demo recording plan
- [x] 09-02-PLAN.md — Create shot list and production checklist for filming day

### v3.0 Directory Home & Work Experience (Planning)

**Milestone Goal:** Re-skin the portfolio from a linear terminal boot sequence into a hash-routed directory home (Kebab Neural Interface design kit) with a dedicated work-experience timeline page, while keeping the voice clone as a floating overlay.

**Source design:** `kebab-neural-interface-design-system/project/ui_kits/terminal/` (design kit `pz0qDtAzozp6fFUWVhYlTg`).

**Scope note:** Only the home directory and the work-experience page ship in v3.0. The other five sections (syai-meetups, hackathons, sidequests, hobbies, links) intentionally route to a "coming soon" stub while Kaleb finalises their UIs.

#### Phase 10: Directory Home & Routing Shell
**Goal**: Visiting `/` renders the Kebab Neural Interface home (identity, quick links, internship banner, 6 directory rows, floating "● talk to me" mic) and hash routing is in place so every section row has somewhere to land.
**Depends on**: Phase 4 (UI preservation — reuse Starfield + Terminal chrome)
**Requirements**: HOME-01, HOME-02, HOME-03, HOME-04, HOME-05, ROUTE-01, ROUTE-02, ROUTE-03, VOICE-01, VOICE-02, VOICE-03, MIG-01, MIG-02, MIG-03
**Success Criteria** (what must be TRUE):
  1. Loading `/` shows the identity header, quick-links bar, gold internship banner, six tappable directory rows, and the affordance hint — without ever running the BOOTING → STATUS → MENU typewriter sequence
  2. Tapping any directory row navigates via hash (e.g. `#/work-experience`); back/forward and direct URL loads restore the correct view; unknown hashes render the red 404 page
  3. Tapping the floating mic opens an overlay that connects to the existing DashScope voice pipeline; closing it (backdrop click or Esc) tears the session down cleanly with no audio overlap on next open
  4. Site is functional on a 360px-wide phone: mic button collapses to a circle, quick-bar labels hide, directory rows stay ≥60px tall
  5. `prefers-reduced-motion: reduce` disables fade-in / typewriter animations across the new shell
**Plans**: TBD (drafted via `/gsd-plan-phase 10`)

#### Phase 11: Work Experience Page
**Goal**: `#/work-experience` renders the 4-role vertical timeline with company logos, status nodes, and descriptions matching the design kit pixel-faithfully.
**Depends on**: Phase 10 (routing shell + PageHeader pattern must exist)
**Requirements**: WORK-01, WORK-02, WORK-03, WORK-04, WORK-05, WORK-06
**Success Criteria** (what must be TRUE):
  1. Page header shows the breadcrumb, title "./work-experience — paid AI engineering", intro line, and gold "[4 entries]" chip
  2. The vertical phosphor rail renders with 4 status nodes in the correct symbol/colour (◉ green ACTIVE for RAiD, ● green SHIPPED for Tensorplex + ARTC AI Engineer, ○ dim ARCHIVED for ARTC intern)
  3. Each entry shows date, title, status tag, org, and the description note exactly as authored in `index-data.jsx`
  4. Each entry shows a square logo chip with the correct image (raid.png, tensorplex.png, artc.png) on a white/light-cream chip with green border + halo
  5. FooterMeta shows "[4 entries] · most recent first" and the "‹ tap ~/kaleb to return home" link works
  6. Layout holds at 360px (logo chip + content stack readable, no horizontal scroll) and 1024px+ (rail aligned to text baseline)
**Plans**: 2 plans
Plans:
**Wave 1**
- [x] 11-01-PLAN.md — Port WorkPage + WorkLogoChip components, extract workStatus helper, migrate WORK_ITEMS logo paths

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 11-02-PLAN.md — Wire WorkPage into hash-route dispatcher + human visual verification

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Voice Enrollment | v1.0 | 3/3 | Complete | 2026-04-10 |
| 2. Server Infrastructure + Full Pipeline | v1.0 | 3/3 | Complete | 2026-04-11 |
| 3. Conversational AI + Speech Quality | v1.0 | 2/2 | Complete | 2026-04-11 |
| 4. UI Preservation + Launch Readiness | v1.0 | 3/3 | Complete | 2026-04-12 |
| 5. TTS Playback Bug Fixes | v1.1 | 0/1 | Not started | - |
| 6. Session Analytics & Logging | v1.1 | 0/1 | Not started | - |
| 7. Automated Testing | v1.1 | 0/TBD | Not started | - |
| 8. Script & Storyboard | v2.0 | 1/1 | Complete   | 2026-04-15 |
| 9. Visual Production & Demo Plan | v2.0 | 2/3 | In Progress|  |
| 10. Directory Home & Routing Shell | v3.0 | 8/8 | Complete    | 2026-05-18 |
| 11. Work Experience Page | v3.0 | 2/2 | Complete   | 2026-05-18 |
| 12. Dev Branch / Live Preview Env | v3.0 | 0/2 | Not started | - |
| 13. SYAI Meetups Page | v3.0 | 3/3 | Complete   | 2026-05-19 |
| 14. SYAI Meetups — Content Population | v3.0 | 1/1 | Complete   | 2026-05-19 |
| 15. Hackathons Page | v3.0 | 3/4 | In Progress | - |
| 16. Voice CTA Visibility | v3.0 | 2/2 | Checkpoint pending | - |
| 17. Meetups Page UX Redesign | v3.0 | 2/2 | Checkpoint pending | - |

### Phase 12: Create dev branch for live preview environment separate from production kalebnim.dev

**Goal:** Establish a long-lived `dev` branch that auto-deploys to a stable Vercel preview URL (e.g. `dev.kalebnim.dev` or `nim-kaleb-dev.vercel.app`) so in-progress work can be shared and tested without affecting the production deployment served at `kalebnim.dev` / `nim-kaleb.vercel.app` (which continues to deploy from `main`).
**Requirements**: DEV-01, DEV-02, DEV-03, DEV-04
**Depends on:** Phase 11
**Success Criteria** (what must be TRUE):
  1. A `dev` branch exists on `origin` and is set as the "preview branch" for stable preview deployments (Vercel auto-deploys every push to `dev`)
  2. Pushing to `dev` produces a deployment that is reachable at a predictable, stable URL (custom subdomain like `dev.kalebnim.dev` OR Vercel's git-branch alias `nim-kaleb-git-dev-*.vercel.app`) — NOT a one-off SHA URL
  3. Production deployment behaviour from `main` is unchanged: pushes to `main` still deploy to `kalebnim.dev` and `nim-kaleb.vercel.app`
  4. Environment variables for the Preview environment are populated (at minimum `OPENAI_API_KEY` and any Realtime/voice keys mirror what production needs to function); secrets are NOT committed
  5. README / contributor docs document the branching model: `main` → production, `dev` → preview, feature branches → PR previews (one-off URLs)
  6. The dev preview loads the home directory page and `/work-experience` route without console errors when smoke-tested in a browser
**Plans**: 2 plans

Plans:
**Wave 1**
- [ ] 12-01-PLAN.md — Create dev branch + mirror env vars to Vercel Preview scope + trigger first dev deploy + capture stable preview URL (covers DEV-01, DEV-02, DEV-03)

**Wave 2** *(blocked on Wave 1 completion — needs captured PREVIEW_URL)*
- [ ] 12-02-PLAN.md — Add "Branching & deployment" section to README.md with three-tier model + captured preview URL (covers DEV-04)

### Phase 13: SYAI Meetups Page

**Goal:** Replace the Phase 10 stub at `#/syai-meetups` with the real meetups page sourced from the new design kit (Anthropic design `UtNCPto_o8734VnTbs853w` → `ui_kits/terminal/index.html` / `Meetups.jsx`). Seed `SYAI_ITEMS` with real meetup data (including the March 22 2025 SYAI × CYS Resume Roasting event), copy meetup assets from the local `portfolio_info/` folder into `public/meetups/`, and wire the page into the hash-route dispatcher following the Phase 11 pattern.
**Requirements**: SYAI-01, SYAI-02, SYAI-03, SYAI-04, SYAI-05, SYAI-06, SYAI-07, SYAI-08, SYAI-09
**Depends on:** Phase 11 (PageHeader / FooterMeta / route dispatcher pattern), Phase 12 (preview environment for safer iteration on stub-replacement pages)
**Success Criteria** (what must be TRUE):
  1. `#/syai-meetups` route renders the real `MeetupsPage` component (no longer the Phase 10 stub)
  2. `SYAI_ITEMS` in `app/lib/sections.ts` contains real meetup entries — at minimum the March 22 2025 Resume Roasting meetup is present with verbatim copy + sign-up link
  3. Meetup images from `portfolio_info/` are served from `public/meetups/` (or equivalent public path) and load with HTTP 200
  4. Page holds at 360px (no horizontal scroll) and 1024px+ (kit-faithful layout)
  5. Other section routes (`hackathons`, `sidequests`, `hobbies`, `links`) still render the Phase 10 stub — no regression
  6. `bun run build` exits 0
**Source todo:** `.planning/todos/pending/syai-meetups-page-from-design-kit.md`
**Plans:** 3/3 plans executed ✅

Plans:
**Wave 1**
- [x] 13-01-PLAN.md — Extend MeetupItem + Speaker types, replace SYAI_ITEMS with 11 real entries (incl. March 2025 Resume Roasting), append SYAI-01..09 to REQUIREMENTS.md

**Wave 2** *(blocked on Wave 1 — consumes new MeetupItem + Speaker types)*
- [x] 13-02-PLAN.md — Port Meetups.jsx Layout B into 6 typed components (MeetupImage / MeetupRibbon / SpeakersBlock / MeetupCard / MeetupLightbox / MeetupsPage)

**Wave 3** *(blocked on Waves 1 + 2 — wires the page into the dispatcher)*
- [x] 13-03-PLAN.md — Add syai-meetups branch to app/page.tsx dispatcher, create public/meetups/ directory, blocking human-verify checkpoint (APPROVED 2026-05-19)

### Phase 14: SYAI Meetups — Content Population

**Goal:** Replace the placeholder speaker entries (`TBD`) and short one-line descriptions seeded in Phase 13 with the full content from `.planning/research/portfolio_info/*.txt`. Each meetup gets its verbatim long-form description, real speaker rosters with names + roles + LinkedIn URLs (where known), and any additional curation discovered during Phase 13's visual review.
**Requirements**: SYAI-CONTENT-01..03 (to be enumerated)
**Depends on:** Phase 13
**Success Criteria** (what must be TRUE):
  1. Every meetup with a known speaker shows their real name + role (no `TBD` placeholders remain for events with confirmed speaker data)
  2. The March 22 2025 Resume Roasting entry shows the full verbatim event description (multi-paragraph copy from `March_AIMM.txt`) — not the short one-liner from Phase 13
  3. Other meetups (June Vibe Coding, SG60 July, August AI Startup Pitching, September Fireside, November Alibaba Cloud workshop, etc.) get their real descriptions populated from the `_AIMM.txt` files
  4. LinkedIn URLs are added for speakers whose profile we have (Lim Mei Yu, Assel MT, Dr Ferdin Joe John Joseph, etc.); `in ↗` chip hides when URL is absent
  5. No layout / component changes — purely a `SYAI_ITEMS` data refresh
**Source:** `.planning/research/portfolio_info/` text files + curation pass
**Plans:** 1 plan

Plans:
- [x] 14-01-PLAN.md — Remap SYAI_ITEMS to real past meetups + verbatim desc + real speakers; enumerate SYAI-CONTENT-01..03 in REQUIREMENTS.md

### Phase 15: Build hackathon page with hackathon.json data, images, smart URL routing (single→redirect, multiple→option list with LinkedIn/GitHub/DevPost), and prize money display for winning hackathons

**Goal:** Replace the Phase 10 stub at `#/hackathons` with the real hackathons page sourced from `.planning/research/hackathons/hackathons.json` (22 Devpost projects, 3+ winners). Surface smart URL routing on row click (1 URL → redirect, multiple URLs → chooser sub-route `#/hackathons/<slug>` with DEVPOST / GITHUB / LINKEDIN / LIVE DEMO labels), display prize text in gold for `is_winner: true` projects, and derive the Section count + footer from data so future JSON updates flow through automatically.
**Requirements**: HACK-DATA-01, HACK-DATA-02, HACK-DATA-03, HACK-URL-01, HACK-URL-02, HACK-UI-01, HACK-UI-02, HACK-UI-03, HACK-UI-04
**Depends on:** Phase 14
**Plans:** 3/4 plans executed

Plans:
**Wave 1** *(parallel — no file conflicts)*
- [x] 15-01-PLAN.md — Add `HackathonItem` type + JSON-backed `HACK_ITEMS` loader (`app/lib/hackathons.ts`), refresh hackathons Section (count + footer from `HACK_STATS`), reconcile CV "4 winnings" gap, enumerate HACK-* requirements
- [x] 15-02-PLAN.md — Pure URL classifier utility (`app/lib/hackathonLinks.ts`) with `classifyHackathonLinks` + `hackathonLinkCount` + 12 unit tests covering dedupe, host classification, and ordering

**Wave 2** *(blocked on Waves 1 — consumes HACK_ITEMS + classifier)*
- [x] 15-03-PLAN.md — Extend `useHashRoute` with additive `useHashSubRoute`, build `HackathonsPage` + `HackathonRow` + `HackathonsPage.module.css` (smart row click 0/1/2+ branches, gold prize text for winners, ≥44px tap targets) + `HackathonLinksPage` chooser

**Wave 3** *(blocked on Wave 2 — wires the dispatcher)*
- [ ] 15-04-PLAN.md — Add `hackathons` branch to `app/page.tsx` (delegates to `HackathonLinksPage` when sub-route present, else `HackathonsPage`) + blocking human-verify checkpoint

### Phase 16: Voice CTA Visibility — Make "Talk to Me" Unmissable

**Goal:** Visitors who land on the home page notice and understand the voice clone feature within their first 10 seconds — through a prominent home page CTA element plus an improved floating mic button with a first-visit attention nudge — without feeling intrusive or breaking the terminal aesthetic.
**Depends on:** Phase 10 (FloatingMic + HomePage + VoiceOverlay exist)
**UI hint:** yes
**Requirements**: VOICE-VIS-01, VOICE-VIS-02, VOICE-VIS-03, VOICE-VIS-04
**Success Criteria** (what must be TRUE):
  1. Home page includes a dedicated voice CTA element (card, banner, or section) that is visually distinct from directory rows and clearly communicates "you can talk to an AI clone of Kaleb"
  2. FloatingMic button is more eye-catching than the current gold pill — improved contrast, size, or visual treatment
  3. First-time visitors see a one-time attention nudge (animation, tooltip, or visual pulse) on the voice CTA that does not repeat on subsequent visits
  4. The voice CTA click/tap triggers the same VoiceOverlay connection flow as the current FloatingMic
  5. All changes hold at 360px mobile and 1024px+ desktop without horizontal scroll
  6. `prefers-reduced-motion: reduce` disables any attention animations
  7. `bun run build` exits 0
**Plans**: 2 plans

Plans:
**Wave 1**
- [x] 16-01-PLAN.md — VoiceCTA component (terminal system message), HomePage wiring, page.tsx callback threading, globals.css keyframes, VOICE-VIS requirements

**Wave 2** *(unblocked — Wave 1 complete)*
- [x] 16-02-PLAN.md — FloatingMic visual improvements (idle glow, 2px border, gold tint, mobile label, 44px tap target) + first-visit tooltip + human-verify checkpoint

### Phase 17: Meetups Page UX Redesign — Photo-Forward Stats Grid

**Goal:** Redesign the `#/syai-meetups` page from a long scrollable card list into a photo-forward stats hero + compact image grid that immediately communicates "Kaleb organized 11 AI events for 500+ youth" within the first 3 seconds — without requiring scrolling to understand his role.
**Depends on:** Phase 14 (SYAI_ITEMS data fully populated)
**UI hint:** yes
**Requirements**: MEETUP-UX-01, MEETUP-UX-02, MEETUP-UX-03, MEETUP-UX-04, MEETUP-UX-05
**Success Criteria** (what must be TRUE):
  1. Page opens with a stats hero section showing aggregate impact numbers (events count, total attendees, active months) and a one-liner establishing Kaleb as the organizer — visible without scrolling
  2. Events are displayed in a 2-3 column photo grid (responsive) where hero images are the dominant visual, with event title and date overlaid on the image
  3. Speaker information is removed from the default grid view (only visible on expand/detail interaction if at all)
  4. Clicking a grid card opens an expanded view (inline expand or lightbox) showing description and gallery photos — photo-forward, minimal text
  5. Layout holds at 360px mobile (1-2 col grid) and 1024px+ desktop (3 col grid) without horizontal scroll
  6. Terminal aesthetic (phosphor green, Anonymous Pro, dark background) is preserved throughout
  7. `bun run build` exits 0
**Plans**: 2 plans

Plans:
**Wave 1**
- [x] 17-01-PLAN.md — Create MeetupsPage.module.css (stats hero, grid, card overlay, detail overlay, responsive breakpoints) + MeetupGridCard component (photo-forward image card with gradient overlay text)

**Wave 2** *(blocked on Wave 1 — needs CSS Module + MeetupGridCard)*
- [x] 17-02-PLAN.md — Create MeetupDetail overlay, rewrite MeetupsPage (stats hero + grid + detail + no speakers), human-verify checkpoint at 360px + 1024px

