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

- [ ] **HOME-01**: Identity header renders "Kaleb Nim @ kebab-neural-interface" with blinking cursor, sub-line "AI engineer · Singapore · Operating Model kaleb-nim-400b-0706"
- [ ] **HOME-02**: Quick-status bar with 5 links — github (Kaleb-Nim), linkedin (kaleb-nim), email (kaleb.nim@gmail), cv (PDF download), site (nim-kaleb.vercel) — labels collapse below 480px
- [ ] **HOME-03**: Gold internship banner "LOOKING FOR AI ENGINEERING INTERNSHIPS — STARTING AUG 2026" (visible on home only)
- [ ] **HOME-04**: Section directory lists 6 entries (work, syai-meetups, hackathons, sidequests, hobbies, links) with path · description · count badge · chevron; each row is a ≥60px tap target with pressed-state border + transform
- [ ] **HOME-05**: Mobile affordance hint line "‹ tap any row above to open a section · tap ● talk to me to chat with my voice clone ›" renders below the directory

### Routing

- [ ] **ROUTE-01**: Hash router resolves `#/` → home, `#/work-experience` → work page, unknown paths → 404 page (red "[SYSTEM] 404 — directory not found")
- [ ] **ROUTE-02**: Section directory rows navigate via `#/<path>`; browser back/forward and direct URL load both render correctly; scroll resets to top on navigation
- [ ] **ROUTE-03**: Unfinished sections (meetups, hackathons, sidequests, hobbies, links) render a "coming soon" stub page rather than 404, so the directory entries remain clickable without dead-ending

### Work Experience Page (`#/work-experience`)

- [ ] **WORK-01**: PageHeader renders breadcrumb (← ~/kaleb / work-experience), title "./work-experience — paid AI engineering", intro line, and "[4 entries]" gold chip
- [ ] **WORK-02**: Vertical phosphor-green timeline rail with 4 status nodes (◉ ACTIVE, ● SHIPPED, ○ ARCHIVED) positioned at each role's top edge
- [ ] **WORK-03**: 4 work entries (RAiD active, Tensorplex Labs shipped, ARTC AI Engineer shipped, ARTC Dev Sci Intern archived) each show date, title, status tag, org, and description note
- [ ] **WORK-04**: Each entry shows a square logo chip (≈56–76px responsive) on a white/light-cream background with green border + halo; missing logo gracefully hides
- [ ] **WORK-05**: Logo assets (raid.png, tensorplex.png, artc.png) ship from `public/work-logos/` and load via stable URLs
- [ ] **WORK-06**: FooterMeta shows "[4 entries] · most recent first · ‹ tap ~/kaleb to return home"

### Floating Voice ("● talk to me")

- [ ] **VOICE-01**: Floating mic button anchored bottom-centre, visible on every route, shrinks to circular icon below 520px
- [ ] **VOICE-02**: Tapping the mic opens a modal overlay containing the existing voice pipeline (VoiceInterface) — overlay dismisses on backdrop click or `Esc`
- [ ] **VOICE-03**: Existing DashScope ASR → LLM → TTS pipeline continues to function inside the overlay without regression (greeting, barge-in, 20-turn memory)

### Compatibility & Migration

- [ ] **MIG-01**: BOOTING → STATUS → MENU state machine is retired; users no longer have to type `1 ⏎` to reach voice
- [ ] **MIG-02**: Starfield + Terminal window chrome (860px max, 10px radius, macOS dots) are reused from the existing implementation
- [ ] **MIG-03**: `prefers-reduced-motion` disables typewriter / fade-in animations site-wide

## v3.1+ Requirements

Deferred to future release.

### Remaining Section Pages

- **MEET-01**: SYAI meetups page (numbered card stack)
- **HACK-01**: Hackathons grid with WON/FINALIST gold cards
- **SIDE-01**: Sidequests dense log with role inference
- **HOB-01**: Hobbies expressive blocks
- **LINK-01**: Links big-button page

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

**Coverage (v3.0):**
- Requirements: 17 total
- Mapped to phases: 17
- Unmapped: 0

---
*Requirements defined: 2026-04-15 (v2.0), 2026-05-18 (v3.0)*
*Last updated: 2026-05-18 after v3.0 milestone start*
