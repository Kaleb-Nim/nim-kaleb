---
quick_id: 260723-vbf
slug: rename-sidequests-section-to-products-wi
description: Replaced the legacy placeholder section with a real products section (grid → detail), first entry Overlay Notes
date: 2026-07-23
status: complete
tasks_completed: 7
tasks_total: 8
checkpoint_pending: Task 8 (human verification)
---

# Quick Task 260723-vbf — Summary

Replaced the dead placeholder section (32 never-rendered items routed to
`StubSectionPage`) with a live `products` section: `#/products` renders a card
grid, `#/products/overlay-notes` renders a full detail page with hero, status
line, origin story, feature list, stack chips, a lightbox gallery, and three
outbound link chips. The old slug still resolves through the new alias resolver.

## Commits

| Task | Commit | Message |
|------|--------|---------|
| 1 | `624cbb6` | `chore(260723-vbf): add overlay-notes store screenshots` |
| 2 | `87fccf2` | `feat(260723-vbf): add ProductItem data layer, drop legacy section data` |
| 3 | `05d1b66` | `style(260723-vbf): add ProductsPage CSS module` |
| 4 | `b2176ea` | `feat(260723-vbf): add products grid page and card` |
| 5 | `13c3fc2` | `feat(260723-vbf): add product detail page with gallery lightbox` |
| 6 | `b37a0de` | `feat(260723-vbf): route #/products and #/products/:slug` |
| 7 | — | verification only, no fix required |

## What changed

**Data layer** (`app/lib/sections.ts`)
- `ProductItem` interface replaces the deleted legacy item type; `installs` /
  `installsAsOf` / `version` are optional so future products can omit them (D3).
- `formatProductStatus()` joins only the present segments → `LIVE · v1.1.1 · 47 installs`.
- `PRODUCT_ITEMS` holds one record — Overlay Notes, every value sourced from
  CONTEXT (v1.1.1, 47 installs as of Jul 2026, CS2030 origin story, WXT/React 19/
  Excalidraw 0.18.1/Dexie stack, three links).
- The 32-entry placeholder array, its interface, and its Section entry are gone.
  No tombstone comments — git history is the record.
- `Section` gains optional `countLabel`; `items` union swaps in `ProductItem[]`.
- New `resolveSection(route)` — matches `id` first, then `aliases`. This is what
  makes the alias promise real: `aliases` had no consumer before this task.

**Components**
- `ProductsPage.module.css` (new) — grid/card, detail, hero+gallery, link chips,
  and lightbox, mirroring `MeetupsPage.module.css` tokens and breakpoints without
  importing from it. 60px tap-target floor on cards and link chips; reduced-motion
  block zeroes transitions, transforms, and the backdrop animation.
- `ProductsPage.tsx` / `ProductCard.tsx` (new) — header + grid + footer. Each card
  is a real `<a href="#/products/<slug>">` so middle-click, open-in-new-tab, and
  back/forward all work. No stats hero (one product would read as filler).
- `ProductDetail.tsx` (new) — sub-route page in the `HackathonLinksPage` shape:
  reads `useHashSubRoute()`, 404s on an unknown slug. Lightbox set is
  `[hero, ...gallery]`; Escape / ArrowLeft / ArrowRight bound with cleanup.
  The install figure carries an explicit point-in-time qualifier line and
  disappears entirely when `installs` is absent.

**Routing**
- `app/page.tsx` swaps the direct id lookup for `resolveSection`, and adds the
  products branch (detail on sub-route, grid otherwise) before the
  `StubSectionPage` fallback, which stays for hobbies and links.
- `PageHeader.tsx` count chip prefers `section.countLabel` → `[1 product]`.
  The other five sections set no `countLabel` and render identically.

**Assets** — `public/products/overlay-notes/{hero,g1,g2}.png` (~524 KB total).
No video, per D4.

## Verification

| Gate | Result |
|------|--------|
| `bunx tsc --noEmit` | clean |
| `bun run build` | succeeds, 7 static pages |
| scoped `bunx eslint` over the 6 touched TS files | **0 errors**, 4 `no-img-element` warnings (accepted — matches the `MeetupDetail.tsx` baseline) |
| `grep -rn 'SIDE_ITEMS\|SideItem' app/` | 0 hits |
| `grep -rn 'sidequest' app/ \| grep -v 'aliases:'` | 0 hits — the old slug survives only as an alias value |
| `id: 'products'` occurrences in `sections.ts` | exactly 1 |
| asset paths in `PRODUCT_ITEMS` resolve on disk | all 3 |
| `git diff --stat` scope | exactly the 10 expected files; no `Meetup*`, `Hackathon*`, `Work*`, `.planning/**`, `prompts/**`, `memory/**`, or `tests/**` |

`bun run lint` (whole repo) was **not** used as a gate — it is pre-broken with
32 errors in `ws-server/` and vendored bundles, outside this task's scope.

## Deviations

**1. [Rule 3 — Blocking] `useCallback` in `ProductDetail` tripped a lint error**
- **Found during:** Task 5
- **Issue:** The plan directed porting `MeetupDetail.tsx`'s
  `const closeLightbox = useCallback(() => setLightboxIdx(null), [])`. In a new
  file that raises `react-hooks/preserve-manual-memoization` as an **error**
  (React Compiler: inferred dep `setLightboxIdx` not in the source deps), which
  would have failed the 0-errors gate. `MeetupDetail.tsx` carries the same
  pattern today — it is part of the pre-existing error baseline in `app/`.
- **Fix:** Dropped `useCallback` (React Compiler memoizes automatically), used a
  plain `closeLightbox` handler, and had the keyboard effect call
  `setLightboxIdx(null)` directly with a hoisted `imageCount` dep so the effect
  does not re-register every render. Behaviour is identical.
- **Files:** `app/components/ProductDetail.tsx` · **Commit:** `13c3fc2`
- No meetups file was touched.

**2. [Plan gate command artifact — no code change] Task 7 gate C is unsatisfiable as written**
- **Issue:** `test "$(grep -rc "id: 'products'" app/lib/sections.ts | tr -d ' ')" = "1"`
  always fails. BSD `grep -r` prefixes the filename even for an explicit file
  path, so the command yields `app/lib/sections.ts:1`, never `1`.
- **Resolution:** Verified the gate's *intent* with the equivalent non-recursive
  form — `grep -c "id: 'products'" app/lib/sections.ts` returns `1`. This is the
  exact form the Task 2 gate uses, which passed. No source change, no widened
  filter. The two dangling-reference gates that use plain `grep -rn ... | wc -l`
  are unaffected and both passed as written.

## Side effect worth knowing

Routing through `resolveSection` activates the aliases already declared on the
other five sections, so `#/work`, `#/experience`, `#/roles`, `#/meetups`,
`#/syai`, `#/hacks`, `#/hackathon`, `#/life`, `#/offline`, `#/contact`, and
`#/cv` are now live routes rendering their owning section in place (no
redirect). The plan calls this out as intentional. Verified safe: every alias is
unique across `SECTIONS` and none collides with an existing `id`, and id
matching runs first so no route can be shadowed.

## Not done — Task 8 (human verification)

Blocking checkpoint, deliberately left for the user. See the checklist in
`PLAN.md` Task 8.
