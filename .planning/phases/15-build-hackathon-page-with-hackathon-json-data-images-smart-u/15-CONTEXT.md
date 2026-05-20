# Phase 15: Hackathons Page - Context

**Gathered:** 2026-05-19
**Status:** Ready for planning
**Source:** Inline user context during /gsd-plan-phase

<domain>
## Phase Boundary

Build the real `#/hackathons` page that replaces the current Phase-10 `StubSectionPage`.
The page renders from `.planning/research/hackathons/hackathons.json` (22 scraped Devpost projects, already enriched with local image paths under `public/hackathons/*`), and surfaces "smart URL routing" when a visitor clicks a hackathon row:

- If exactly **1 external URL** is available for the project → redirect (open in new tab) straight to that URL.
- If **multiple URLs** are available → render an option list (sub-route or inline expansion) labelling each link source (DevPost, GitHub, Live Demo, etc.; LinkedIn slot reserved for future team-link enrichment).
- If the hackathon is a **winner** (`is_winner: true`) → display both the **prize text** (from `prizes[]`) and the project title on the row.

Scope is the hackathons section only. Voice interface, terminal chrome, and all other sections (`work-experience`, `syai-meetups`, `sidequests`, `hobbies`, `links`) remain untouched.

</domain>

<decisions>
## Implementation Decisions

### Data source (LOCKED)
- Single source of truth: `.planning/research/hackathons/hackathons.json` (22 projects).
- Images already mirrored under `public/hackathons/*` and referenced by each project's `thumbnail_local`.
- Project data must be imported into `app/lib/sections.ts` (or a sibling typed module) so the existing `Section.items` contract continues to work. The legacy hand-curated `HACK_ITEMS` placeholder array is **replaced** by data sourced from the JSON.
- The placeholder `count: 15` on the hackathons Section must be updated to match the real count from the JSON (currently 22).

### Type model (LOCKED — extend, do not break)
- Extend `HackItem` in `app/lib/sections.ts` (or introduce a new `HackathonItem` type that supersedes it) with the fields the JSON provides:
  - `slug`, `title`, `tagline`, `date`, `date_iso`, `event_name`, `event_url`, `thumbnail_local`, `prizes: string[]`, `is_winner: boolean`, `extra_links: string[] | null`, `project_url`, `team: Array<{ name, devpost_url, linkedin?, github? }>`, `built_with: string[]`, `gallery: string[]`, `description_md`, `sources: string[]`.
- Preserve `Section.items` type union so other pages compile unchanged.

### Smart URL routing (LOCKED)
- Each project's outbound link set is derived from `project_url` + `extra_links[]`, classified by URL host:
  - `devpost.com` → label `DEVPOST`
  - `github.com` → label `GITHUB`
  - `linkedin.com` → label `LINKEDIN` (reserved, no data today)
  - anything else → label `LIVE DEMO` (fallback to host name if multiple non-classified URLs).
- De-duplicate URLs before counting.
- 0 URLs → row is non-interactive (or shows muted "no link" hint); 1 URL → row click opens that URL in new tab (`target="_blank"`, `rel="noopener noreferrer"`); 2+ URLs → click reveals an option list.
- Option list UX: implementer's choice — either (a) a sub-route `#/hackathons/<slug>` rendering a small chooser page, or (b) an inline expanded panel under the row. Recommended: sub-route (matches the existing `useHashRoute` pattern and keeps the terminal aesthetic; back-link returns to `#/hackathons`).

### Prize / winner display (LOCKED)
- For `is_winner: true` rows, render the full `prizes[]` text alongside the title (visually distinct — e.g. gold `#FFD700` for prize text per CLAUDE.md palette).
- Surface aggregated stats in the existing `footer` string (replace `"[15 entries] · 1 win · 1 finalist · 0 regrets"` with counts derived from data: total entries, total wins, total prizes).
- CV reconciliation gap: user mentions "4 hackathon winnings" in `public/kaleb-cv.pdf` but the JSON has only 3 `is_winner: true` projects (ARcademy, Art-ificial Failure, A Brilliant Cobra Duel). Plan must include a step to either (a) verify with CV and patch the JSON if a fourth winner is missing, or (b) document the discrepancy. **Do not silently invent prize data.**

### Component architecture (LOCKED)
- New `app/components/HackathonsPage.tsx` modelled on `MeetupsPage.tsx` and `WorkPage.tsx`. Render via `PageHeader` + per-row component + `FooterMeta`, consistent with the terminal aesthetic and Phase 10/11 patterns.
- Wire it into `app/page.tsx` next to `WorkPage` / `MeetupsPage`:
  ```ts
  section.id === 'hackathons' ? <HackathonsPage section={section} /> : ...
  ```
- Multi-link chooser, if implemented as a sub-route, lives in a sibling component (e.g. `HackathonLinksPage.tsx`) and reads the second hash segment via a small extension of `useHashRoute` (keep change additive — don't break the single-segment contract used elsewhere).

### Styling (LOCKED)
- CSS Module file `HackathonsPage.module.css` (no Tailwind for terminal styles, per CLAUDE.md).
- Reuse phosphor-green glow, Anonymous Pro font, monospace-aligned columns. Prize text uses `#FFD700`.
- Row pressed-state border + transform consistent with HOME-04 directory pattern.

### Routing & accessibility (LOCKED)
- All outbound link clicks: `target="_blank"`, `rel="noopener noreferrer"`.
- Each row is a ≥44px tap target with visible focus state.
- Sub-route (if used) must update the browser hash so back-button returns to `#/hackathons`.

### Claude's Discretion
- Choice of sub-route vs inline expansion for multi-link chooser (recommendation above stands but planner may pick either).
- Thumbnails: **deferred** per design pass (text-only cards in v1). `thumbnail_local` stays in the type model but is not rendered. Revisit in a follow-up phase if the design evolves.
- Sort order (recommend most-recent-first by `date_iso`).
- Whether `HACK_ITEMS` is deleted outright or kept as a fallback for build-time safety.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Data & assets
- `.planning/research/hackathons/hackathons.json` — 22 scraped Devpost projects, source of truth for this phase
- `public/hackathons/` — local image mirrors referenced by each project's `thumbnail_local`
- `public/kaleb-cv.pdf` — CV containing 4 hackathon winnings (reconcile against JSON)

### Existing app code (closest analogs)
- `app/page.tsx` — top-level routing switch where the new `HackathonsPage` must be wired in
- `app/hooks/useHashRoute.ts` — hash routing primitive
- `app/lib/sections.ts` — `Section`, `HackItem`, `HACK_ITEMS`, hackathons Section entry (must be updated)
- `app/components/MeetupsPage.tsx` + `MeetupCard.tsx` + `MeetupLightbox.tsx` — closest visual + structural analog
- `app/components/WorkPage.tsx` + `WorkLogoChip.tsx` — secondary analog for compact list rendering
- `app/components/PageHeader.tsx` + `FooterMeta` — header/footer pattern reused by every section page
- `app/components/StubSectionPage.tsx` — what the new page replaces for the `hackathons` slug

### Design + brand
- `markokraemer-ui-design-spec.html` — overall UI spec (palette, glow, monospace alignment)
- `CLAUDE.md` — color palette, typography, performance budgets, accessibility expectations

</canonical_refs>

<design>
## Visual Design (LOCKED — from Claude design session screenshot 2026-05-19)

Source: Claude design session `NqOSwKdrf930TqKD1n8QEQ` (terminal UI kit). User-shared screenshot is the canonical reference.

### Page-level layout

- **Breadcrumb header** (top-left): green-bordered pill button `← ~/kaleb` (clickable, navigates to `#/`) followed by ` / hackathons` in plain green text. Same component as other section pages (`PageHeader.tsx`).
- **Page title** (h1): `./hackathons — 22 weekends, 22 demos` (count derived from data) in large Anonymous Pro, phosphor-green `#00FF00` with glow.
- **Intro line**: `Things I built between Friday night and Sunday afternoon. Most still work.` in standard green text, slightly muted.
- **Entries count badge**: `[ 22 entries]` rendered as a small gold/yellow `#FFD700` bordered box, sits below intro line.
- **Horizontal divider**: subtle green hairline below the badge, full-width.
- **Card grid**: two-column responsive grid on desktop (≥768px); single column on mobile. Each card is a hackathon entry.

### Card structure (per hackathon)

```
┌──────────────────────────────────────────────┐
│ <Date>                              [<TAG>]  │
│                                              │
│ <Title>                                      │
│                                              │
│ <note / tagline>                             │
│                                              │
│ [ <LINK_LABEL> ↗ ]   ← optional chip         │
└──────────────────────────────────────────────┘
```

- **Card border**: 1px solid green (low-opacity, e.g. `rgba(0,255,0,0.25)`), no fill, subtle inner padding (~16–20px).
- **Top row**:
  - Left: date label (e.g. `Apr 2026`) in muted gold `#FFD700` or amber tone, small caps mono.
  - Right: status tag in a small bordered box. Tag values observed:
    - `[BUILT]` — green border + green text (default for shipped projects)
    - `[WIP]` — green border + green text (in progress)
    - `[FINALIST]` — green border + green text (finalist but not winner)
    - `[WON · BEST PRE-U]` — gold/yellow `#FFD700` border + gold text (winning hackathons)
  - **Tag derivation from JSON**: derive the tag from `is_winner` + `prizes[]` content. If `is_winner: true`, use gold `[WON · <prize-short>]` (e.g. extract "Best Pre-U Hack" → `BEST PRE-U`). Otherwise default to `[BUILT]`. Reserve `[WIP]` and `[FINALIST]` for cases the JSON doesn't currently express — leave room in the type model for these but render `[BUILT]` for now.
- **Title** (h2/h3): hackathon event name (e.g. `NUS Lifehack 2026`, `AI Tinkerers SG Hackday`). Phosphor-green with glow, bold, ~18–20px.
- **Note line**: short tagline / description in muted green, ~14px. Source from JSON `tagline` (preferred) or first sentence of `description_md`.
- **Optional link chip** (bottom, left-aligned):
  - Rendered as a gold/yellow bordered button: `[ <LABEL> ↗ ]` with right-arrow glyph.
  - Example from screenshot: `[ WRITEUP ↗ ]` on BrainHack TIL-AI.
  - **Label = primary link's classification** from the URL classifier (Plan 02): `DEVPOST`, `GITHUB`, `LIVE DEMO`, `WRITEUP`, etc.
  - Hover/focus: subtle inverted background or brighter glow.

### Smart URL routing visual (decision)

The screenshot shows **at most one link chip per card**. To reconcile with the locked smart-routing decision (0 / 1 / 2+ URLs):

- **0 URLs** → no chip rendered. Whole card is non-interactive (or only the title links to `project_url` if present; spec defaults below).
- **1 URL** → single gold chip showing that URL's classified label. Click opens URL in a new tab (`target="_blank" rel="noopener noreferrer"`).
- **2+ URLs** → single gold chip labelled `[ LINKS ({n}) ↗ ]` (or the primary link's label with a small `+{n}` suffix, e.g. `[ DEVPOST +2 ↗ ]`). Click navigates to the sub-route `#/hackathons/<slug>` which renders the chooser page.
  - **Recommendation**: use `[ LINKS ({n}) ↗ ]` — simplest to read, explicit count, no label-collision ambiguity. Planner / executor may pick the `+{n}` variant if it tests better visually.

### Chooser sub-page (`#/hackathons/<slug>`)

Not shown in the screenshot. Inferred from terminal aesthetic + existing patterns:

- Reuses `PageHeader` with breadcrumb `← ~/kaleb / hackathons / <project-title>`.
- Single-column list of gold link chips, one per classified URL, stacked vertically with ~12px gap.
- Each chip renders as `[ <LABEL> ↗ ]` with the URL host shown beneath in muted text.
- Below the chip list: project metadata block (date, event name, prize text if winner — same gold `#FFD700` treatment as the card tag).
- Back-link returns to `#/hackathons`.

### Color & typography spec (consolidated)

| Element                  | Token / Value                             |
|--------------------------|-------------------------------------------|
| Page background          | `#000000` (within terminal frame)         |
| Phosphor green (primary) | `#00FF00` + glow per CLAUDE.md text-shadow |
| Gold accent              | `#FFD700`                                  |
| Muted green              | `rgba(0,255,0,0.7)` or similar             |
| Card border              | `rgba(0,255,0,0.25)`                       |
| Tag border (default)     | matches surrounding text colour (green or gold) |
| Font                     | Anonymous Pro (already loaded)             |
| Title size               | ~18–20px                                   |
| Body size                | ~13–14px                                   |
| Tag / chip size          | ~12–13px, padded ~6–8px                    |

### Animations / interactions

- No card-entrance animation required in this phase — keep parity with existing `MeetupsPage` / `WorkPage` (no stagger). Respect `prefers-reduced-motion`.
- Card hover: brighten border to `rgba(0,255,0,0.5)`. Optional 1px transform-Y nudge on press (mirror HOME-04 pressed-state).
- Chip hover: invert background to gold-fill with black text, or brighten glow — implementer's pick, must match the existing voice/mic button visual language.

### Notes & gaps from this design pass

- Screenshot title says `15 weekends, 15 demos` (matches current placeholder `HACK_ITEMS` count). When wired to JSON, this becomes `22 weekends, 22 demos` (or whatever the data shows). The count must be data-driven (already locked in main decisions block).
- Screenshot shows only the `Code::XtremeApps` `[FINALIST]` row using a different tag colour treatment from `[BUILT]` (both green in screenshot — finalist tag is gold-tinted only when also a winner). Treat `[FINALIST]` as green in v1; flip to gold only when `is_winner: true`.
- Design does not specify thumbnails. **Decision: defer thumbnails to a follow-up**. Phase 15 ships the text-only card layout shown in the screenshot. The `thumbnail_local` field stays in the type model but is not rendered. (This overrides the "thumbnails recommended" line in the earlier locked decisions — updated below.)
- Design has no explicit "no links available" state. Render the card with no chip; do not show a placeholder.

</design>

<specifics>
## Specific Ideas

- 22 projects in JSON. 3 currently flagged `is_winner: true`. Resolve the 4th winner before shipping.
- Two projects ship live-demo URLs in `extra_links` (`a-brilliant-cobra-duel.vercel.app`, `drgo.onrender.com`, `sustainabite.onrender.com`); these should render as "LIVE DEMO" buttons in the chooser.
- ARcademy has both a Devpost project URL and a GitHub repo URL → first natural test case for the 2+ URL chooser path.
- Foodr (and many others) have only `project_url` (Devpost) → first natural test case for the 1-URL direct-redirect path.
- Footer string in the Section entry must be regenerated from data, not hardcoded.

</specifics>

<deferred>
## Deferred Ideas

- LinkedIn enrichment for teammates (JSON only has Devpost URLs for team members today).
- Pulling richer per-project pages (gallery lightbox like meetups) — out of scope for v3.0 hackathons page; chooser sub-route is the only sub-page in scope.
- Backfilling team-member LinkedIn / GitHub onto `team[]` — out of scope.
- Filtering / search UI for hackathons — out of scope.

</deferred>

---

*Phase: 15-build-hackathon-page-with-hackathon-json-data-images-smart-u*
*Context gathered: 2026-05-19 via inline user input during /gsd-plan-phase*
