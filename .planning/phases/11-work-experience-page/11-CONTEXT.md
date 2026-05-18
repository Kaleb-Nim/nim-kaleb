# Phase 11: Work Experience Page — Context

**Gathered:** 2026-05-18
**Status:** Ready for planning
**Source:** User-supplied design kit (fetched from Anthropic design system, `ui_kits/terminal/`) + Phase 10 routing shell

<domain>
## Phase Boundary

Replace the `#/work-experience` stub (Phase 10 placeholder) with a pixel-faithful port of the design kit's `WorkPage` component. After this phase:

- `#/work-experience` renders the `PageHeader` (breadcrumb · title · intro · gold `[4 entries]` chip) followed by a vertical phosphor-rail timeline of 4 roles, ending in `FooterMeta` (`[4 entries] · most recent first · ‹ tap ~/kaleb to return home`).
- Each entry shows: status node on rail (◉ ACTIVE / ● SHIPPED / ○ ARCHIVED), square logo chip (white/cream BG, green border + halo), date, title, status chip, org, description note.
- 4 roles in this order (most-recent first): RAiD (ACTIVE), Tensorplex Labs (SHIPPED), ARTC AI Engineer (SHIPPED), ARTC Dev Sci Intern (ARCHIVED).
- Logo assets ship from `public/work-logos/` (`raid.png`, `tensorplex.png`, `artc.png` — already in repo).
- Holds 360px (logo chip + content stack readable, no horizontal scroll) and 1024px+ (rail aligned to title baseline).
- No new routes, no new global state, no changes to the floating mic, overlay, home, or stubs.

</domain>

<decisions>
## Implementation Decisions (LOCKED)

### Design source-of-truth

- `.planning/research/v3-design-kit/pages.jsx` → `WorkPage` and `WorkLogoChip` are the pixel-faithful contract. Port verbatim, JSX → TSX, inline styles preserved.
- The `workStatusOf(tag)` helper (or its inline equivalent in pages.jsx) maps `ACTIVE/SHIPPED/ARCHIVED/WIP/MILESTONE` → `{ color, glow, sym }`. Phase 11 only uses ACTIVE/SHIPPED/ARCHIVED; keep the full table so future tags (WIP, MILESTONE) work without changes.
- `PageHeader` and `FooterMeta` already shipped in Phase 10 (`app/components/PageHeader.tsx`) — reuse, do not duplicate.
- KNI tokens (`--kni-green`, `--kni-gold`, `--kni-glow-green`, `--kni-bg`) already live in `app/globals.css` from Phase 10. Reference via `var(--…)` or the existing hex constants used elsewhere in the codebase — match what `app/components/Directory.tsx` and `PageHeader.tsx` chose for consistency.

### Component layout

| New file | Source in design kit | Notes |
|---|---|---|
| `app/components/WorkPage.tsx` | `pages.jsx` → `WorkPage` | Receives `section: Section` prop (matching the `Section` type already in `app/lib/sections.ts`). Renders `PageHeader` + rail + entries + `FooterMeta`. |
| `app/components/WorkLogoChip.tsx` | `pages.jsx` → `WorkLogoChip` | Standalone for reusability + testability; exported default. Props: `{ src: string; bg?: string; alt: string }`. |
| `app/lib/workStatus.ts` | `pages.jsx` → `workStatusOf` + `STATUS_META` | Small pure module: exports `STATUS_META` record and `workStatusOf(tag)` function. Easier to unit-test and share if a future page reuses status tags. |

### Route wiring

- Update `app/page.tsx` route dispatcher: when `section.id === 'work-experience'`, render `<WorkPage section={section} />` instead of `<StubSectionPage section={section} />`. Keep stub for all other sections.
- `useHashRoute` hook is unchanged — already returns the correct slug.
- `app/lib/sections.ts` already defines the `work-experience` section with `items: WORK_ITEMS`. Type the items as `WorkItem` (already exported).

### Logo path migration (REQUIRED)

The `WORK_ITEMS` entries in `app/lib/sections.ts` currently point at `'../../assets/logos/raid.png'` (kit-relative path inherited from the JSX prototype). These DO NOT resolve in Next.js. Update each entry to the public path:

| Role | Current (broken) | New (correct) |
|---|---|---|
| RAiD | `'../../assets/logos/raid.png'` | `'/work-logos/raid.png'` |
| Tensorplex | `'../../assets/logos/tensorplex.png'` | `'/work-logos/tensorplex.png'` |
| ARTC (×2) | `'../../assets/logos/artc.png'` | `'/work-logos/artc.png'` |

Files already exist at `public/work-logos/{raid,tensorplex,artc}.png` (verified). Confirm WORK-05 by curling each path on the dev server.

### Logo rendering strategy

Use a plain `<img>` element (not `next/image`). Reasons:
- The design kit's `onError` fallback (`e.currentTarget.style.display = 'none'`) needs the raw DOM element. `next/image` makes this brittle.
- These are 3 small PNGs served from `/public/` — no measurable benefit from optimization.
- Matches the existing pattern in Phase 10 components (`Directory.tsx` etc.) where the team chose plain DOM over Next.js wrappers for prototype fidelity.

Missing-logo behaviour (WORK-04 "gracefully hides"): preserve the `onError` swap (`display: 'none'`). If `it.logo` is falsy in data, skip the chip entirely (matches `pages.jsx`).

### Styling

Continue Phase 10's pattern: inline `style={{…}}` objects ported from `pages.jsx`. No new CSS module. Reduced-motion is already honoured globally via the `.kni` class.

### Accessibility

- Logo `<img>` requires meaningful `alt` — use `it.org` (e.g., `alt="RAiD — RSAF Agile innovation Digital"`).
- Status chip `[ACTIVE]` is decorative text already; sufficient for screen readers when read alongside the title.
- The rail itself is decorative — render in a `<div aria-hidden="true">` or accept the default since it has no semantic text.
- Entries are rendered as a flat sequence; no `<ol>`/`<ul>` needed (matches kit). If desired, wrap entries in a `<ol>` for screen-reader cohesion — non-blocking judgement call for planner/executor.

### Out-of-scope (do NOT change in this phase)

- Section list, home, floating mic, voice overlay, starfield, terminal chrome, stubs — all untouched.
- No new dependencies. No CSS modules. No animation tweaks beyond what `pages.jsx` already specifies.
- Phase 12+ pages (Meetups, Hackathons, Sidequests, Hobbies, Links) — still stubs.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design contract (pristine, pixel-faithful — DO NOT EDIT)

- `.planning/research/v3-design-kit/pages.jsx` — Contains `WorkPage`, `WorkLogoChip`, and `workStatusOf` (search for "function WorkPage"). Source of truth for layout, spacing, colours, status node SVG-less rendering.
- `.planning/research/v3-design-kit/index-data.jsx` — Canonical `WORK_ITEMS` array (4 entries with verbatim copy: dates, titles, orgs, notes, tags, `logoBg`).
- `.planning/research/v3-design-kit/Timeline.jsx` — Reference for the `STATUS_META` table (covers ACTIVE/SHIPPED/ARCHIVED/WIP/MILESTONE).
- `.planning/research/v3-design-kit/index.html` — Router + overall page chrome reference.
- `.planning/research/v3-design-kit/colors_and_type.css` — Token reference (already merged into `app/globals.css` in Phase 10).
- `.planning/research/v3-design-kit/README.md` + `README-latest.md` — Kit overview.

### Project context

- `.planning/REQUIREMENTS.md` — `WORK-01..06` (lines defining requirement IDs).
- `.planning/ROADMAP.md` — Phase 11 goal + success criteria.
- `.planning/phases/10-directory-home-routing-shell/10-CONTEXT.md` — Phase 10 routing decisions (locked: hash-route slug, `Section` type, `PageHeader`/`FooterMeta` pattern).
- `app/page.tsx` — Hash-route dispatcher; swap `StubSectionPage` for `WorkPage` here when slug is `work-experience`.
- `app/lib/sections.ts` — `WORK_ITEMS` definition + `Section`/`WorkItem` types. Logo path migration happens here.
- `app/components/StubSectionPage.tsx` — Pattern reference for the page shell (PageHeader + body + FooterMeta).
- `app/components/PageHeader.tsx` — Reuse as-is for header + `FooterMeta` export.
- `public/work-logos/{raid,tensorplex,artc}.png` — Already present, ready to serve.
- `CLAUDE.md` — Project guidelines (Bun > npm, Anonymous Pro, inline styles for terminal UI).

</canonical_refs>

<specifics>
## Specific Ideas

- The kit's logo paths (`../../assets/logos/...`) are NOT Next.js public paths. They MUST be rewritten to `/work-logos/...` in `app/lib/sections.ts`. This is the single data fix required to make WORK-05 pass.
- Status nodes use Unicode glyphs, not images: `◉` (ACTIVE), `●` (SHIPPED), `○` (ARCHIVED). Inline in the node `<div>` via `{s.sym}`, sized at `0.58rem`.
- Logo chip dimensions: `clamp(56px, 14vw, 76px)` square; padding `8px`; bg from `it.logoBg` (`#FFFFFF` for raid/artc, `#F4F1EB` for tensorplex); green border `rgba(0,255,0,0.35)` + inner+outer halo.
- The rail is positioned with `paddingLeft: 32` on the container; the absolute rail line lives at `left: 10`; nodes are offset at `left: -27` relative to the entry. Preserve exactly to keep rail-to-title alignment.
- FooterMeta text comes from `section.footer` in `index-data.jsx`: `'[4 entries] · most recent first'`. The "‹ tap ~/kaleb to return home" link is rendered by `FooterMeta` itself (Phase 10) — don't duplicate.

</specifics>

<deferred>
## Deferred Ideas

- Timeline variations (`ascii-tree`, `commit-log`) from `Timeline.jsx` — interesting future "view toggle" but out of scope.
- Real CV/resume PDF link in the home directory — not this phase.
- Meetups/Hackathons/Sidequests/Hobbies/Links real pages — Phase 12+.
- Playwright regression test covering home → work-experience navigation + visual snapshot — slated for the v3.0 testing sweep after Phase 11 ships.
- Animation polish (entry stagger, rail draw-in) — not in WORK-0x success criteria; skip unless explicitly requested.

</deferred>

---

*Phase: 11-work-experience-page*
*Context gathered: 2026-05-18 via plan-phase user override (design kit fetched from Anthropic design system)*
