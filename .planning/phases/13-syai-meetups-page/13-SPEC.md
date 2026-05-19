# Phase 13: SYAI Meetups Page — SPEC

**Phase:** 13 — SYAI Meetups Page
**Milestone:** v3.0 Directory Home & Work Experience
**Locked:** 2026-05-19
**Ambiguity score:** 0.16 (gate ≤ 0.20)

---

## Goal

Replace the Phase 10 stub at `#/syai-meetups` with a rich, real-data meetups page sourced from the new design kit (Anthropic design `UtNCPto_o8734VnTbs853w` → `ui_kits/terminal/Meetups.jsx`). The page renders all ~11 real SYAI meetups with hero images, speaker rows, gallery thumbnails, and a click-to-open lightbox overlay — replacing the current fictional `SYAI_ITEMS` placeholder data with verified meetup records.

**Why now:** Phase 11 established the per-section component pattern (PageHeader + FooterMeta + route-dispatcher swap). Phase 13 is the first content-rich application of that pattern. It also accommodates the user-supplied event copy for the March 22 2025 SYAI × CYS "Networking & Resume Roasting" meetup.

---

## Boundaries

### In scope

- New `MeetupsPage` (or `MeetupsPageV2`) TSX component ported from the design kit's `Meetups.jsx`, rendered for `section.id === 'syai-meetups'`.
- Layout **B** (default per the kit): hero image LEFT, text + speakers RIGHT, gallery thumbs BELOW.
- Hero image per meetup with styled placeholder when the source is missing.
- Gallery thumbnail strip per meetup.
- Click-to-open / tap-to-open lightbox overlay (Esc + backdrop close).
- Speaker rows under each meetup (name + role/affiliation).
- All ~11 real meetups in `SYAI_ITEMS` (replace the entire fictional list).
- Verbatim copy from the March 22 2025 Resume Roasting meetup (date, title, host, sign-up note) included as one of the entries.
- Meetup images served from `public/meetups/` (or equivalent public path) after the user drops `portfolio_info/` into the repo.
- `app/page.tsx` dispatcher updated: swap `<StubSectionPage>` for the new meetups component when slug matches.
- `MeetupItem` type extended in `app/lib/sections.ts` to support the richer fields (hero, gallery, speakers).

### Out of scope (explicit non-goals)

- **Layout cycler / Tweaks panel (A / C / D variants).** Layout B is the only shipped layout. — Reason: adds dev surface without user benefit; matches Phase 11's "no toggles" stance.
- **Filter / search across meetups.** No year filter, no tag filter, no full-text search. — Reason: the list is bounded (~11 items) and chronological; filtering is not a user need at this scale.
- **Backlink to SYAI signup / community / Eventbrite page.** No external CTA on this page. — Reason: page is content-only; community CTAs belong on home or a future Phase.
- **Replacing other section stubs** (`#/hackathons`, `#/sidequests`, `#/hobbies`, `#/links`). Those remain Phase 10 stubs. — Reason: each is its own future phase.
- **New routes** (e.g. `#/syai-meetups/{slug}` per-meetup detail pages). — Reason: lightbox handles drill-in; no need to add routing complexity.

### Claude's discretion (not user-decided, fill during discuss-phase)

- Whether `Meetups.jsx` is ported into the kit's `pages.jsx` `MeetupsPage` slot or kept as a standalone component file (kit references it via `window.MeetupsPageV2`).
- Specific image dimensions, formats (jpg/webp), and optimization approach for `public/meetups/`.
- Lightbox keyboard navigation (arrow keys between gallery items) — nice-to-have, not in success criteria.

---

## Requirements

### REQ SYAI-01: MeetupsPage component renders for #/syai-meetups

- **Current state:** `#/syai-meetups` renders `<StubSectionPage>` ("this section is being finalised — check back soon").
- **Target state:** `#/syai-meetups` renders a new `<MeetupsPage section={section} />` component ported from the design kit's `Meetups.jsx`, using Layout B (hero LEFT, text + speakers RIGHT, gallery BELOW).
- **Acceptance:** `app/page.tsx` contains a dispatcher branch matching `section.id === 'syai-meetups'` that renders the new component. `grep -q "MeetupsPage" app/page.tsx` succeeds. Visual confirmation that the stub copy is no longer rendered on this route.

### REQ SYAI-02: All ~11 real meetups replace the fictional placeholder list

- **Current state:** `SYAI_ITEMS` in `app/lib/sections.ts` contains 11 fictional entries (e.g., "Meetup #11 — Agentic Workflows in Production" from Apr 2026).
- **Target state:** `SYAI_ITEMS` contains all real SYAI meetup entries (~11), each with verified date, title, host, speakers, hero image reference, and gallery image references. No fictional/placeholder entries remain.
- **Acceptance:** Manual diff confirms every entry in `SYAI_ITEMS` corresponds to a real past or upcoming SYAI meetup. The Apr 2026 / Feb 2026 fictional entries are gone unless those events actually happened.

### REQ SYAI-03: March 22 2025 Resume Roasting meetup is present with verbatim copy

- **Current state:** No entry for the March 22 2025 SYAI × CYS "Networking & Resume Roasting" meetup exists.
- **Target state:** `SYAI_ITEMS` includes an entry dated `Mar 2025` (or `22 Mar 2025`) with title containing "Resume Roasting" or "Networking", host/speaker entry for Lim Mei Yu (Get Ahead, ex-Meta/Google), and the verbatim event description as the note/body.
- **Acceptance:** `grep -i "resume roasting" app/lib/sections.ts` returns at least one match. The Lim Mei Yu speaker entry is rendered when the page is viewed.

### REQ SYAI-04: Hero image per meetup with graceful missing-image fallback

- **Current state:** No hero image rendering exists on the stub page.
- **Target state:** Each `MeetupItem` accepts an optional `hero: string` field. When present, a hero image renders LEFT of the text in Layout B. When absent OR when the image fails to load (`onError`), a styled placeholder tile renders instead — **never a broken-image icon**.
- **Acceptance:** Viewing the page with a deliberately broken image path renders a placeholder tile, not the default browser broken-image icon. DOM contains no `<img>` element with `naturalWidth === 0` and no fallback-replacement applied.

### REQ SYAI-05: Gallery thumbnails + click/tap lightbox overlay

- **Current state:** No gallery or lightbox on the stub page.
- **Target state:** Each `MeetupItem` accepts an optional `gallery: string[]` field. When present and non-empty, thumbnails render below the meetup text. Tapping (mobile) or clicking (desktop) any thumbnail opens a full-viewport lightbox overlay showing the enlarged image. The lightbox closes via the `Esc` key OR by clicking/tapping the backdrop.
- **Acceptance:** Manual test on desktop (click) + a mobile viewport (touch event) both open the lightbox. Esc key handler removes the overlay. Backdrop click removes the overlay. Inner image click does NOT close it.

### REQ SYAI-06: Speaker rows render for every meetup

- **Current state:** No speaker concept exists in `MeetupItem`.
- **Target state:** `MeetupItem` accepts a `speakers: { name: string; role?: string }[]` field. Speaker block renders to the RIGHT of the hero image (Layout B). All ~11 meetups have at least one speaker entry (user confirmed speaker data exists for every meetup).
- **Acceptance:** Every meetup entry in `SYAI_ITEMS` has a non-empty `speakers` array. The rendered page shows a speaker name under each meetup.

### REQ SYAI-07: Meetup assets ship from public/meetups/

- **Current state:** No `public/meetups/` directory exists.
- **Target state:** All hero + gallery images live under `public/meetups/` (e.g. `public/meetups/2025-03-resume-roasting/hero.jpg`) and are referenced by absolute path (e.g. `/meetups/2025-03-resume-roasting/hero.jpg`) in `SYAI_ITEMS`. Source assets come from the user-supplied `portfolio_info/` folder, dropped into the repo before execution begins.
- **Acceptance:** Every `hero` and `gallery` path in `SYAI_ITEMS` starts with `/meetups/`. `curl -I http://localhost:3000/meetups/<path>` returns `200` for every referenced image. `grep -c "/meetups/" app/lib/sections.ts` returns at least 22 (≥ 11 hero + ≥ 11 gallery), modulo speaker-less or gallery-less entries.

### REQ SYAI-08: No regression to other routes, voice overlay, or floating mic

- **Current state:** Phase 10 stubs render correctly for `hackathons`, `sidequests`, `hobbies`, `links`. Home, NotFound, FloatingMic, VoiceOverlay all work.
- **Target state:** Unchanged. The Phase 13 work only touches the `syai-meetups` slug and adds `public/meetups/` assets.
- **Acceptance:** Visiting `#/hackathons`, `#/sidequests`, `#/hobbies`, `#/links` after Phase 13 ships still renders the Phase 10 `<StubSectionPage>`. Home (`#/`) renders the directory. `#/does-not-exist` renders `<NotFoundPage>`. Floating mic opens / closes the voice overlay without console errors.

### REQ SYAI-09: Build + responsive sanity checks

- **Current state:** `bun run build` exits 0.
- **Target state:** Unchanged. New components compile, page renders without horizontal scroll at 360px, layout matches the kit at 1024px+.
- **Acceptance:** `bun run build` exits 0. Manual verification at 360px (no horizontal scroll) and 1024px+ (hero+text+gallery layout matches the kit) passes.

---

## Acceptance Criteria (pass / fail checklist)

- [ ] `#/syai-meetups` no longer renders the Phase 10 stub copy ("this section is being finalised")
- [ ] All entries in `SYAI_ITEMS` are real meetups (≥ 11, no fictional placeholders)
- [ ] March 22 2025 Resume Roasting meetup is present with verbatim event copy + Lim Mei Yu speaker
- [ ] Every meetup has at least one speaker entry rendered on the page
- [ ] Every meetup has a hero image OR renders a styled placeholder (never a browser broken-image icon)
- [ ] Every meetup has at least one gallery thumbnail OR the gallery section is omitted gracefully
- [ ] Tapping a gallery thumbnail on mobile (touch) opens the lightbox
- [ ] Clicking a gallery thumbnail on desktop opens the lightbox
- [ ] `Esc` key closes the lightbox
- [ ] Clicking the lightbox backdrop closes the lightbox
- [ ] Clicking the lightbox image itself does NOT close it
- [ ] No layout cycler / Tweaks panel exists in the shipped code
- [ ] No filter / search UI exists for the meetups list
- [ ] No external "Sign up for SYAI" CTA exists on the meetups page
- [ ] `public/meetups/<paths>` all return HTTP 200 on the dev server
- [ ] `bun run build` exits 0
- [ ] No horizontal scroll at 360px viewport
- [ ] Other section routes (`hackathons`, `sidequests`, `hobbies`, `links`) still render their Phase 10 stub
- [ ] Floating mic + VoiceOverlay open/close without console errors

---

## Canonical References

### Design contract

- `.planning/research/v3-design-kit/` (existing kit from Phase 10/11 — Layout B reference)
- New design kit URL: `https://api.anthropic.com/v1/design/h/UtNCPto_o8734VnTbs853w?open_file=ui_kits/terminal/index.html` — to be fetched and synced into `.planning/research/` during discuss-phase
- `.planning/research/v3-design-kit/pages.jsx` → `MeetupsPage` shell (delegates to `window.MeetupsPageV2`)
- Newer `Meetups.jsx` (from the prior bundle download at `/tmp/design-kit/.../ui_kits/terminal/Meetups.jsx`) — 4-layout reference implementation

### Project context

- `.planning/REQUIREMENTS.md` — add SYAI-01..09 IDs after this SPEC is approved
- `.planning/ROADMAP.md` — Phase 13 entry
- `.planning/phases/11-work-experience-page/11-CONTEXT.md` — pattern reference (PageHeader / FooterMeta / route dispatcher / inline-style port)
- `.planning/phases/10-directory-home-routing-shell/10-CONTEXT.md` — routing model + Section type
- `.planning/todos/pending/syai-meetups-page-from-design-kit.md` — source todo + verbatim March 2025 copy
- `app/lib/sections.ts` — `MeetupItem` + `SYAI_ITEMS` (extend types, replace data)
- `app/components/PageHeader.tsx` — reuse PageHeader + FooterMeta
- `app/page.tsx` — route dispatcher (add `syai-meetups` branch)
- User-supplied `portfolio_info/` folder (to be placed in repo before execution)

---

## Ambiguity Report

| Dimension | Score | Min | Status |
|---|---|---|---|
| Goal Clarity | 0.85 | 0.75 | ✓ |
| Boundary Clarity | 0.90 | 0.70 | ✓ |
| Constraint Clarity | 0.75 | 0.65 | ✓ |
| Acceptance Criteria | 0.85 | 0.70 | ✓ |

**Final ambiguity: 0.16** (gate ≤ 0.20)

Two rounds of Socratic interview applied. No dimensions below minimum. SPEC.md ready for discuss-phase.

---

## Open assumptions for discuss-phase to confirm

1. The newer design kit (`UtNCPto_o8734VnTbs853w`) supersedes the existing `.planning/research/v3-design-kit/` for the meetups page only. Other pages keep using the older kit.
2. `MeetupItem` will be extended (breaking the current shape) rather than introducing a parallel type. Existing fictional entries are deleted entirely; no migration needed.
3. Lightbox is a new top-level overlay (similar pattern to `VoiceOverlay`) but reuses no voice-overlay code.
4. Reduced-motion compliance is inherited from Phase 10 global tokens; no per-component motion overrides needed.

---

*Spec gathered: 2026-05-19 via /gsd-spec-phase 13*
