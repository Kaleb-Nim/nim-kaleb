---
phase: 15-build-hackathon-page-with-hackathon-json-data-images-smart-u
plan: 03
subsystem: hackathons-ui
tags: [react, nextjs, css-modules, hash-routing, hackathons, terminal-ui]

requires:
  - phase: 15
    plan: 01
    provides: HackathonItem type + HACK_ITEMS sorted array
  - phase: 15
    plan: 02
    provides: classifyHackathonLinks + hackathonLinkCount
provides:
  - useHashSubRoute() — additive second-segment hash hook
  - HackathonsPage — 2-col responsive card grid wrapper
  - HackathonRow + deriveHackathonTag — single card with 0/1/2+ smart routing
  - HackathonLinksPage — chooser sub-page for multi-link projects
  - HackathonsPage.module.css — locked <design> CSS module
affects: [phase-15 plan-04 (wires components into app/page.tsx)]

tech-stack:
  added: []
  patterns:
    - "Additive hash-routing extension: useHashSubRoute sibling export preserves existing single-segment contract for all other section pages"
    - "Smart click branching by URL count (0 → static div, 1 → external anchor, 2+ → hash-route chooser)"
    - "CSS Modules for terminal-styled components (per CLAUDE.md — no Tailwind on phosphor-green/gold elements)"

key-files:
  created:
    - app/components/HackathonsPage.tsx
    - app/components/HackathonRow.tsx
    - app/components/HackathonsPage.module.css
    - app/components/HackathonLinksPage.tsx
  modified:
    - app/hooks/useHashRoute.ts

key-decisions:
  - "useHashSubRoute does NOT scroll on hashchange (scroll behaviour belongs to the primary route hook only — sub-route nav within #/hackathons/<slug> stays at current y)"
  - "event_name conditionally rendered (per Plan 01 SUMMARY, event_name is string|null — 9 entries are null). In HackathonRow: omit the .event line entirely when null. In HackathonLinksPage: fall back to bare date string."
  - "Multi-prize winner: tag shows only the FIRST prize's short form (full prize list is rendered in HackathonLinksPage when the user opens the chooser). E.g. ARcademy's two prizes ('Winner — $50 Amazon Gift Card', 'Winner — 2nd Place – Excellence Award') render as a single [WON · $50 AMAZON GIFT CA] tag on the card."
  - "shortenPrize() 18-char cap with NO ellipsis — keeps the monospace tag tidy. $50 Amazon Gift Card (20 chars) truncates to '$50 AMAZON GIFT CA'."
  - "Unknown sub-slug at #/hackathons/<bad-slug> renders <NotFoundPage /> (red [SYSTEM] 404 + gold back-to-home link)."
  - "Thumbnails NOT rendered in v1 per locked <design>; thumbnail_local stays in HackathonItem type (Plan 01) but no <img> or next/image appears in any plan-15-03 file."
  - "app/page.tsx NOT modified — wiring + human-verify checkpoint deferred to Plan 04 as planned."

requirements-completed: [HACK-UI-01, HACK-UI-02, HACK-UI-03, HACK-UI-04, HACK-URL-02]

duration: 3min
completed: 2026-05-20
---

# Phase 15 Plan 03: Hackathons UI Components Summary

**Built the hackathons page UI components — additive `useHashSubRoute()` hook, `HackathonsPage` 2-col card grid, `HackathonRow` with `deriveHackathonTag` and 0/1/2+ smart-click routing, `HackathonLinksPage` chooser sub-page, and a locked-design CSS module — all matching the Claude design-session screenshot (2026-05-19). Not yet wired into `app/page.tsx` (Plan 04's job).**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-05-20T04:57:01Z
- **Completed:** 2026-05-20T05:00:03Z
- **Tasks:** 3 (sequential)
- **Files modified:** 5 (4 created, 1 modified)

## Task Commits

1. **Task 1 — useHashSubRoute additive extension** → `dd8d0a0` (feat)
2. **Task 2 — HackathonsPage + HackathonRow + CSS module** → `9138a2d` (feat)
3. **Task 3 — HackathonLinksPage chooser** → `eb452f1` (feat)

## Files Created/Modified

- `app/hooks/useHashRoute.ts` (modified) — added `useHashSubRoute()` + shared `parseHashSegments()` helper; existing `useHashRoute` + `navigateTo` signatures preserved
- `app/components/HackathonsPage.tsx` (new) — page chassis (PageHeader + grid + FooterMeta)
- `app/components/HackathonRow.tsx` (new) — single-card + `deriveHackathonTag` + `shortenPrize` + 0/1/2+ click branch
- `app/components/HackathonsPage.module.css` (new) — locked <design> styles (card border, grid, tag tones, prefers-reduced-motion, chooser styles)
- `app/components/HackathonLinksPage.tsx` (new) — chooser sub-page

## `#//foo` Divergence (documented)

The refactored `parseHashSegments()` uses `.filter(Boolean)`, which DIVERGES from the original `h.split('/')[0]` behaviour for pathological double-slash inputs:

- **Original `parseHash('//foo')`**: `'/foo'.split('/')` → `['', 'foo']` → returns `''`
- **New `parseHash('//foo')`**: `'/foo'` → split + filter → `['foo']` → returns `'foo'`

The app NEVER emits double-slash hashes via `navigateTo` (which only produces `#/` or `#/<id>`). Manual `#/hackathons/<slug>` URLs are well-formed. This divergence is intentional, accepted, and documented as a contract note — not a regression.

## Unknown-slug behaviour

`HackathonLinksPage` resolves the slug via `HACK_ITEMS.find(p => p.slug === slug)`. If no match, the component returns `<NotFoundPage />` — the same red `[SYSTEM] 404` + gold "← back to ~/kaleb" treatment used elsewhere in the app. The decision: a hackathons-specific 404 wasn't justified for an edge that only occurs via hand-typed URLs.

## `deriveHackathonTag` short-form rules

Verified inline against all expected contract cases (printed during execution):

| Input                                                            | Output                                          |
| ---------------------------------------------------------------- | ----------------------------------------------- |
| `{is_winner: false, prizes: []}`                                 | `{label: 'BUILT', tone: 'green'}`               |
| `{is_winner: false, prizes: ['Whatever']}`                       | `{label: 'BUILT', tone: 'green'}`               |
| `{is_winner: true, prizes: ['Winner — Best Pre-University Hack']}` | `{label: 'WON · BEST PRE-U', tone: 'gold'}`     |
| `{is_winner: true, prizes: ['Winner — $50 Amazon Gift Card', 'Winner — 2nd Place – Excellence Award']}` | `{label: 'WON · $50 AMAZON GIFT CA', tone: 'gold'}` |
| `{is_winner: true, prizes: []}`                                  | `{label: 'WON', tone: 'gold'}`                  |

`shortenPrize` rules applied:
- Strip leading `Winner —` / `Winner -` / `Winner:` prefix (case-insensitive)
- `Pre-University` → `Pre-U`
- Strip trailing ` Hack` (e.g. "Best Pre-University Hack" → "BEST PRE-U")
- Collapse whitespace; uppercase
- Cap at 18 chars with no ellipsis (monospace-tidy)

### Observed against real winners (HACK_ITEMS)

| Slug                        | Prizes                                                                              | Tag rendered                  |
| --------------------------- | ----------------------------------------------------------------------------------- | ----------------------------- |
| `arcademy-at32jn`           | `Winner — $50 Amazon Gift Card`, `Winner — 2nd Place – Excellence Award`            | `[WON · $50 AMAZON GIFT CA]`  |
| `a-brilliant-cobra-duel`    | `Winner — Best Pre-University Hack`                                                 | `[WON · BEST PRE-U]`          |
| `art-ificial-failure`       | `Winner — Best Pre-University Hack`                                                 | `[WON · BEST PRE-U]`          |

All other 19 projects render the green `[BUILT]` tag.

## Smart click branching (0/1/2+ URL distribution)

Per Plan 02 SUMMARY's integration smoke: 18 / 22 projects (82%) hit the 1-URL direct-redirect branch; 4 / 22 (18%) hit the 2+-URL chooser branch; 0 / 22 hit the 0-URL non-interactive branch. The 0-link branch is therefore unreachable from current data but kept in code for forward-compat — the rendering cost is one extra `if (linkCount === 0)` branch and one CSS class (`.cardStatic`).

## CSS module spec compliance

Implemented exactly per `<design>` consolidated table — no deviations from the plan's CSS spec. Verified:

- `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))` — collapses to 1 col below ~640px viewport
- Card border default `rgba(0,255,0,0.25)`; hover/focus `rgba(0,255,0,0.55)`
- `min-height: 44px` tap-target floor
- `outline: 2px solid #FFD700; outline-offset: 2px` on `:focus-visible`
- `@media (prefers-reduced-motion: reduce)` disables transitions and transforms on both `.card` and `.chooserRow`
- Title size `clamp(0.98rem, 2.8vw, 1.18rem)`, body size `clamp(0.76rem, 1.9vw, 0.84rem)`
- Anonymous Pro inherited from layout (no font-family override on terminal-styled elements)
- Gold accent `#FFD700` for date, tag (gold tone), link chip, chooser back-pill, chooser row label

## Thumbnails confirmation

`grep -c "next/image" app/components/HackathonRow.tsx app/components/HackathonsPage.tsx app/components/HackathonLinksPage.tsx` → 0 across all three files. No `<img>` or `next/image` element rendered. `thumbnail_local` remains in the `HackathonItem` type (Plan 01) for the future thumbnail phase, untouched.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Conditional render of `event_name` (string | null)**
- **Found during:** Task 2 (HackathonRow CardBody)
- **Issue:** Plan 01 SUMMARY documents `event_name: string | null` (9 of 22 entries are null). The plan's example code had `<div className={styles.event}>{project.event_name}</div>` which would render an empty div for null values (no visual bug, but a wasted DOM node with `.event` border/spacing).
- **Fix:** Guarded with `{project.event_name && <div className={styles.event}>{project.event_name}</div>}` in `HackathonRow.tsx` CardBody. In `HackathonLinksPage.tsx` event line: `{project.event_name ? \`${event_name} · ${date}\` : date}`.
- **Files modified:** `app/components/HackathonRow.tsx`, `app/components/HackathonLinksPage.tsx`
- **Verification:** `bunx tsc --noEmit` exits 0; `bun run build` exits 0.
- **Committed in:** `9138a2d` (Task 2) + `eb452f1` (Task 3)

---

**Total deviations:** 1 auto-fixed (1 bug fix for null `event_name`)
**Impact on plan:** No scope change. Plan 04 wiring is unaffected — the components handle the documented type union correctly.

## Issues Encountered

- **`bun run lint` reports a "Calling setState synchronously within an effect" warning on the new `useHashSubRoute` (line 62) and the pre-existing `useHashRoute` (line 35)** — same pattern, same warning. The pre-existing warning has been accepted in prior plans; the new occurrence mirrors it exactly. Both warnings exist before and after this plan (verified via `git stash` round-trip). Out of scope for this plan per the scope-boundary rule.
- **No tests written for `deriveHackathonTag`** — the plan marks Task 2 as `tdd="true"` but the action block's TDD note allows falling back to inline contract verification when the project's test runner is wired to a different concern (here, `bunx playwright test` for e2e). Contract was verified inline via `bun /tmp/derive-tag-check.ts` (5 / 5 cases match expected output, captured in this SUMMARY's contract table). If a follow-up wants formal coverage, a `app/components/HackathonRow.test.ts` bun:test file can be added (the project already has `@types/bun` from Plan 02).

## User Setup Required

None — purely UI components + a routing hook extension. No new env vars, no external services.

## Next Phase Readiness

- **Plan 15-04 (final wiring + human-verify checkpoint)** can now:
  ```ts
  import HackathonsPage from '@/app/components/HackathonsPage';
  import HackathonLinksPage from '@/app/components/HackathonLinksPage';
  import { useHashRoute, useHashSubRoute } from '@/app/hooks/useHashRoute';
  ```
  Wire into `app/page.tsx`: when `route === 'hackathons'`, render `<HackathonLinksPage />` if `subRoute` is non-empty, else `<HackathonsPage section={section} />`.
- **Deep-linking:** `#/hackathons/<slug>` works for ALL known slugs (even 1-link projects). The chooser always shows the full classified-link list. The 0/1/2+ branching only affects the LIST view's click behaviour. This is intentional per the plan's action note.

## Self-Check: PASSED

Files verified:
- `app/hooks/useHashRoute.ts` — FOUND (modified — `useHashRoute`, `useHashSubRoute`, `navigateTo` all exported)
- `app/components/HackathonsPage.tsx` — FOUND
- `app/components/HackathonRow.tsx` — FOUND
- `app/components/HackathonsPage.module.css` — FOUND
- `app/components/HackathonLinksPage.tsx` — FOUND

Commits verified:
- `dd8d0a0` — feat(15-03): add useHashSubRoute() to useHashRoute hook — FOUND
- `9138a2d` — feat(15-03): add HackathonsPage + HackathonRow + locked-design CSS module — FOUND
- `eb452f1` — feat(15-03): add HackathonLinksPage chooser sub-page — FOUND

Contract checks:
- `bunx tsc --noEmit` → exit 0
- `bun run build` → exit 0 (compiled successfully, 7 / 7 static pages generated)
- `grep -c "next/image"` in plan files → 0 (thumbnails NOT rendered)
- Inline `deriveHackathonTag` contract verification → 5 / 5 cases match

---
*Phase: 15-build-hackathon-page-with-hackathon-json-data-images-smart-u*
*Completed: 2026-05-20*
