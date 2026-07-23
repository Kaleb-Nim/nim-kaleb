---
quick_id: 260723-vbf
slug: rename-sidequests-section-to-products-wi
description: Replace the sidequests section with a products section (grid → detail), first entry Overlay Notes
date: 2026-07-23
status: planned
---

# Quick Task 260723-vbf — `sidequests` → `products` (Overlay Notes)

## Problem

`app/lib/sections.ts` ships a `sidequests` Section backed by `SIDE_ITEMS` — 32
placeholder talks/events that are **never rendered** (`app/page.tsx:71` falls
through to `StubSectionPage`). The slot is dead weight.

Replace it with a real `products` section: a compilation of products Kaleb built
that are **still current and actively serving users**. First (and currently only)
entry: the **Overlay Notes** Chrome extension.

All design decisions are locked in `CONTEXT.md` (D1–D4). Do not re-litigate them.

## Verified reconnaissance (do not re-run these searches)

Repo-wide grep for `sidequest` / `side quest` / `SIDE_ITEMS` / `SideItem`:

| Location | Verdict |
|----------|---------|
| `app/lib/sections.ts` (11 hits, lines 11, 66, 96, 301, 304, 397, 398, 400, 402, 405, 407) | **The only live-code references.** All in scope. |
| `.planning/**` (ROADMAP, STATE, REQUIREMENTS, PROJECT, phase plans, research kit) | Historical planning artifacts — **do NOT edit**. They record what shipped at the time. |
| `prompts/system-prompt.md` | **Zero** references. The voice-clone prompt never mentions sidequests. No change needed. |
| `memory/raw/*.txt`, `memory/context.json` | **Zero** references. No change needed. |
| `tests/*.spec.ts` | **Zero** route/section references. No test updates needed. |

Additional finding that changes the shape of the work:

- **`Section.aliases` is declared but never consumed.** `app/page.tsx:53` does
  `SECTIONS.find((s) => s.id === route)`. So D2's requirement that `#/sidequests`
  keeps resolving is **not** satisfied by adding the alias alone — a resolver has
  to be built. Task 2 + Task 6 cover this.
- `Directory.tsx` renders `./{row.path}` linked to `#/{row.id}` straight off
  `SECTIONS` — the home directory picks up the rename with **zero** component
  changes.
- `PageHeader` hardcodes the chip as `[{section.count} entries]`, which would
  render `[1 entries]` for a one-product section. Task 6 adds an optional
  `countLabel` override — purely additive, other five sections unchanged.

## Baselines measured before planning (gates are calibrated to these)

| Command | Baseline today | Usable as a gate? |
|---------|----------------|-------------------|
| `bunx tsc --noEmit` | clean, 0 output | **Yes** — must stay clean |
| `bun run build` | succeeds, 7 static pages | **Yes** — must keep succeeding |
| `bun run lint` (whole repo) | **32 errors / 456 warnings**, all in `ws-server/` + vendored bundles | **No** — pre-broken, do not gate on it |
| `bunx eslint app/` | 6 errors (all pre-existing in `useRealtimeVoice.ts`) | **No** — too broad |
| `bunx eslint app/lib/sections.ts app/page.tsx app/components/PageHeader.tsx` | **0 problems** | **Yes** — scoped gate, see below |

`@next/next/no-img-element` fires as a **warning** on every `<img>` in
`MeetupDetail.tsx` today. The new product components use `<img>` the same way,
so warnings of that rule are expected and accepted. **Errors** are not.

## Locked decisions being implemented

- **D1** — `#/products` = grid; `#/products/overlay-notes` = detail page, modelled
  on the meetups grid/detail/lightbox visual language.
- **D2** — delete `SIDE_ITEMS` + `SideItem`; new section `id`/`path` = `products`;
  `aliases: ['product', 'sidequests', 'side-quests', 'events', 'apps', 'extensions']`.
- **D3** — status line carries status + version + install count + publish date, with
  the 47-install figure qualified "as of Jul 2026". `installs` / `installsAsOf` are
  **optional** fields so future products can omit them.
- **D4** — 3 store screenshots copied into `public/products/overlay-notes/`. No video.

## Planner discretion (documented, within D1–D4)

1. **Screenshot filenames.** CONTEXT names sources but not destinations. Renaming to
   the repo's existing media convention (`hero.png` / `g1.png` / `g2.png`, mirroring
   `public/meetups/<slug>/hero.jpg`, `g1.jpg`) rather than carrying
   `01-mdn-array-map.png` through.
2. **Detail is a real route, not a modal.** `MeetupDetail` is a modal overlay driven
   by component state. D1 asks for `#/products/overlay-notes`, so `ProductDetail`
   follows the `HackathonLinksPage` sub-route shape (reads `useHashSubRoute()`,
   renders a full page, 404s on unknown slug) while borrowing the meetups *visuals*.
3. **Lightbox is local to `ProductsPage.module.css`.** `MeetupLightbox` is typed to
   `MeetupItem[]` and cannot be reused. The inline lightbox in `MeetupDetail.tsx:104-142`
   is the pattern to mirror. **Do not modify any meetups file** — CONTEXT puts them
   out of scope.
4. **Lightbox set = `[hero, ...gallery]`**, matching `MeetupLightbox`'s flattening
   (`MeetupLightbox.tsx:35`), so the hero is zoomable too.
5. **Alias resolution renders in place, no hash rewrite.** `#/sidequests` renders the
   products page at that URL. No redirect — avoids a `hashchange` loop for one
   cosmetic gain.
6. **Tap targets.** Grid cards and outbound link chips get `min-height: 60px` per the
   mobile-first constraint. The breadcrumb back-link mirrors the existing
   `.chooserBack` chip (`HackathonsPage.module.css:107`) at `min-height: 44px` — a
   60px-tall inline breadcrumb would break the terminal line rhythm.

## Tasks

Seven atomic, independently-committable tasks. Each leaves the tree compiling.

---

### Task 1 — Copy the three store screenshots into `public/`

- **files:** `public/products/overlay-notes/hero.png`, `public/products/overlay-notes/g1.png`, `public/products/overlay-notes/g2.png`
- **action:**
  Create `public/products/overlay-notes/` and copy from
  `/Users/kalebnim/Documents/GitHub/overlay-notes/store/screenshots/` per D4:
  `01-mdn-array-map.png` → `hero.png` (grid thumbnail + detail hero),
  `02-blog-useeffect.png` → `g1.png`, `03-mdn-functions-guide.png` → `g2.png`.
  Use `cp` — do not symlink, do not move the sources. Per D4 do **not** copy
  `store/video/overlay-notes-launch.mp4`; there is no video player and the 8 MB
  payload is deliberately excluded. Total added weight is ~527 KB, no image
  optimisation pass required.
- **verify:**
  ```
  test -f public/products/overlay-notes/hero.png && \
  test -f public/products/overlay-notes/g1.png && \
  test -f public/products/overlay-notes/g2.png && \
  test "$(ls public/products/overlay-notes | wc -l | tr -d ' ')" = "3"
  ```
- **done:** Three PNGs live under `public/products/overlay-notes/`, no `.mp4` anywhere under `public/products/`.
- **commit:** `chore(260723-vbf): add overlay-notes store screenshots`

---

### Task 2 — Data layer: `ProductItem` + `PRODUCT_ITEMS`, remove the old array

- **files:** `app/lib/sections.ts`
- **action:**

  **2a. Add the `ProductItem` interface** near the other item interfaces. Fields:
  `slug: string`, `name: string`, `kind: string`, `status: 'LIVE' | 'MAINTAINED' | 'ARCHIVED'`,
  `version?: string`, `installs?: number`, `installsAsOf?: string`, `published: string`,
  `tagline: string`, `narrative: string`, `features: string[]`, `stack: string[]`,
  `hero: string`, `gallery: string[]`, `links: ItemLink[]`.
  `installs` and `installsAsOf` are optional per D3 so future products can omit a
  usage figure. Reuse the existing `ItemLink` interface for `links` — do not define
  a second link shape.

  **2b. Add `formatProductStatus(p: ProductItem): string`** — an exported pure helper
  that joins the present parts with ` · `: status, then `v${version}` when a version
  exists, then `${installs} installs` when the count is a number. For the Overlay
  Notes record it returns `LIVE · v1.1.1 · 47 installs`, matching D3's status line.
  Omitting a field must silently drop that segment.

  **2c. Add `PRODUCT_ITEMS: ProductItem[]`** with the single Overlay Notes record.
  Every value below is verified in CONTEXT — do not embellish, do not invent metrics:
  - `slug: 'overlay-notes'`, `name: 'Overlay Notes'`, `kind: 'Chrome Extension'`
  - `status: 'LIVE'`, `version: '1.1.1'`, `installs: 47`, `installsAsOf: 'Jul 2026'`, `published: 'Jul 2026'`
  - `tagline`: the ≤132-char store summary — sketch freehand Excalidraw-style notes
    over any webpage, anchored to the content, saved per page, 100% local.
  - `narrative`: the origin story — started while studying for NUS CS2030, course
    material in the browser and notes in Apple Notes off to the side, constant
    context-switching; already used Excalidraw for mind-mapping so the idea was to put
    that canvas directly on the page; first published Chrome extension.
  - `features`: full Excalidraw toolset (pen, shapes, arrows, hand-drawn text); works
    on strict-CSP sites like GitHub; annotate ↔ browse click-through modes toggled
    with `Alt+Shift+E`; scroll-anchored drawings; autosave per normalized URL into the
    extension's own IndexedDB; auto-restore across SPA navigations; badge + popup;
    local-first, no account, fully offline.
  - `stack`: WXT, TypeScript, React 19, `@excalidraw/excalidraw` 0.18.1, Dexie
    (IndexedDB), Playwright validation CLI.
  - `hero: '/products/overlay-notes/hero.png'`,
    `gallery: ['/products/overlay-notes/g1.png', '/products/overlay-notes/g2.png']`
  - `links`: three entries in CONTEXT's order — `CHROME STORE` →
    `https://chromewebstore.google.com/detail/overlay-notes/ogekdbffoapphpabjphfgeppildcleck`,
    `GITHUB` → `https://github.com/Kaleb-Nim/overlay-notes`, `LINKEDIN` →
    `https://www.linkedin.com/posts/kaleb-nim_chromeextension-buildinpublic-ugcPost-7484554047480328192-ghZg/`.

  **2d. Delete the old data.** Remove the `SideItem` interface (currently lines 66-71),
  the 32-entry array it types (currently lines 301-337 including its banner comment),
  and drop `SideItem[]` from the `Section.items` union — replacing it with
  `ProductItem[]`. Update the stale file-header inventory comment (line 11) so it names
  Products instead of the old section.
  <!-- planner-discipline-allow: SIDE_ITEMS -->
  <!-- planner-discipline-allow: SideItem -->
  **Leave no tombstone.** Do not write a comment that names the deleted array, the
  deleted interface, or the old section slug anywhere in the file — a "removed X"
  breadcrumb comment will trip the Task 7 grep gates. The git history is the record.

  **2e. Replace the Section entry in place** (keep it 4th, between hackathons and
  hobbies, so the home directory order is unchanged):
  `id: 'products'`, `path: 'products'`, `count: PRODUCT_ITEMS.length`,
  `countLabel: \`${PRODUCT_ITEMS.length} product${PRODUCT_ITEMS.length === 1 ? '' : 's'}\``,
  `aliases` exactly as D2 specifies (`product`, `sidequests`, `side-quests`, `events`,
  `apps`, `extensions` — note this intentionally drops the old singular and `talks`
  aliases), `desc: 'products I built that people actually use'`,
  `title: './products — things I shipped that are still running'`,
  `intro`: products built and still maintained — live, installable, serving real
  users; not demos, not hackathon weekends. `items: PRODUCT_ITEMS`, and a footer
  derived from length in the style of the hackathons entry (line 394), reading
  `[1 product] · live · more shipping soon`. Do **not** set `dense`.

  **2f. Add `countLabel?: string` to the `Section` interface** (optional, additive —
  the other five entries omit it and render exactly as they do today).

  **2g. Add the alias resolver** at the bottom of the file:
  `export function resolveSection(route: string): Section | undefined` — returns
  `undefined` for an empty route, otherwise matches `s.id === route` first and falls
  back to `s.aliases.includes(route)`. This is what makes D2's promise real; the
  aliases field has no other consumer today.

  Touch nothing else: `LINKS`, `WORK_ITEMS`, `SYAI_ITEMS`, `HOBBIES_ITEMS`,
  `LINK_ITEMS`, the hackathons re-exports, and the other five Section entries stay
  byte-identical.

- **verify:**
  ```
  bunx tsc --noEmit && \
  bunx eslint app/lib/sections.ts && \
  grep -c "id: 'products'" app/lib/sections.ts | grep -qx 1 && \
  grep -c "export function resolveSection" app/lib/sections.ts | grep -qx 1
  ```
- **done:** `tsc` clean, `eslint` reports 0 problems for the file, `PRODUCT_ITEMS`
  holds exactly one record, the old array and interface are gone, `resolveSection`
  is exported.
- **commit:** `feat(260723-vbf): add ProductItem data layer, drop legacy section data`

---

### Task 3 — `ProductsPage.module.css`

- **files:** `app/components/ProductsPage.module.css`
- **action:**
  New CSS module written in the house style — read `MeetupsPage.module.css` first
  and mirror its structure, tokens, and breakpoints. Use the `globals.css` custom
  properties (`--kni-green`, `--kni-gold`, `--kni-fg-muted`, `--kni-glow-green`,
  `--kni-glow-gold`) rather than re-typing hex values where a token exists, matching
  how `MeetupsPage.module.css` does it. `font-family: "Anonymous Pro", monospace`
  on every text rule. No Tailwind.

  Classes to define:
  - **Grid:** `.grid` — `repeat(auto-fill, minmax(260px, 1fr))`, collapsing to a
    single column at 480px, same as the meetups grid (lines 54-72).
  - **Card:** `.card` (thumbnail + overlay, `aspect-ratio: 4 / 3` → `16 / 10` at
    480px, `min-height: 60px`, 1px `rgba(0,255,0,0.25)` border, lifting to
    `rgba(0,255,0,0.7)` + green glow on `:hover`/`:focus-visible`, gold
    `outline` on `:focus-visible`), `.cardImg`, `.cardOverlay` (bottom gradient
    scrim), `.cardTitle` (green, glow), `.cardKind` (muted), `.cardStatus` (gold,
    gold glow — carries the `formatProductStatus` string).
  - **Detail:** `.back` (gold chip breadcrumb copied in spirit from
    `HackathonsPage.module.css` `.chooserBack`, plus `min-height: 44px` and
    `display: inline-flex; align-items: center`), `.title`, `.statusRow`,
    `.statusChip` (gold, bordered), `.metaLine` (muted — kind · published),
    `.installsNote` (faint, small — carries the point-in-time qualifier),
    `.tagline`, `.narrative`, `.sectionLabel` (uppercase, letter-spaced, gold),
    `.featureList` + `.featureItem` (each prefixed via a `::before` glyph, green),
    `.stackRow` + `.stackChip` (faint bordered pills).
  - **Hero + gallery:** `.hero` (clickable, `max-height: 400px`, bordered),
    `.gallery` (`repeat(auto-fill, minmax(220px, 1fr))`), `.thumb`
    (`aspect-ratio: 4 / 3`, `cursor: pointer`, border brightens on hover).
  - **Link chips:** `.linkList` (column, 12px gap), `.linkChip` (gold border,
    **`min-height: 60px`**, `display: flex; flex-direction: column; justify-content: center`,
    background tint + 2px `translateX` on hover/focus), `.linkLabel` (gold, bold,
    letter-spaced), `.linkHost` (green-muted, `word-break: break-all`).
  - **Lightbox:** `.lightboxBackdrop`, `.lightboxInner`, `.lightboxImg`,
    `.lightboxNav` + `.lightboxPrev` / `.lightboxNext`, `.lightboxClose`,
    `.lightboxCounter` — port the geometry from `MeetupsPage.module.css:404-503`
    including the `max-width: 768px` block that pulls the nav arrows inside the
    viewport on mobile.
  - **`@keyframes kniPanelOpen`** (opacity 0 → 1) for the lightbox backdrop, and a
    closing `@media (prefers-reduced-motion: reduce)` block zeroing the transitions,
    transforms, and animation on `.card`, `.thumb`, `.linkChip`, and
    `.lightboxBackdrop`.
- **verify:** `bun run build` succeeds (Next compiles and hashes the CSS module) and
  `grep -c "min-height: 60px" app/components/ProductsPage.module.css` returns at
  least `2`.
- **done:** Module compiles, defines every class Tasks 4 and 5 consume, honours the
  60px tap-target floor and the reduced-motion escape hatch.
- **commit:** `style(260723-vbf): add ProductsPage CSS module`

---

### Task 4 — `ProductsPage` grid + `ProductCard`

- **files:** `app/components/ProductsPage.tsx`, `app/components/ProductCard.tsx`
- **action:**
  `ProductsPage` takes `{ section }: { section: Section }` exactly like
  `HackathonsPage.tsx:9`. `'use client'` at the top of both files. Cast
  `section.items as ProductItem[]`. Render `<PageHeader section={section} />`, then
  `<div className={styles.grid}>` mapping to `<ProductCard>` keyed by `slug`, then
  `<FooterMeta section={section} />`. No stats hero — with one product the meetups
  three-stat block reads as filler; the header chip plus the card status already
  carry the numbers.

  `ProductCard` takes `{ product }: { product: ProductItem }` and renders an
  `<a href={\`#/products/${product.slug}\`}>` wrapping the card — an anchor, not a
  `role="button"` div, so middle-click and open-in-new-tab work and `hashchange`
  fires for back/forward (the rationale documented at `Directory.tsx:5-10`). Inside:
  `<img src={product.hero} alt="" loading="lazy" className={styles.cardImg} />` and
  an overlay carrying `product.name`, `product.kind`, and
  `formatProductStatus(product)` wrapped in square brackets. Give the anchor an
  `aria-label` naming the product so the link text is not just an image.

  Import `formatProductStatus` and the `ProductItem` type from `@/app/lib/sections`
  (the `@/*` alias, matching every sibling component). Do not touch any `Meetup*`
  file.
- **verify:**
  ```
  bunx tsc --noEmit && \
  bunx eslint app/components/ProductsPage.tsx app/components/ProductCard.tsx
  ```
  0 errors. `@next/next/no-img-element` warnings are expected and accepted here.
- **done:** Both components compile and typecheck; each card is an anchor to its own
  sub-route showing thumbnail + title + status.
- **commit:** `feat(260723-vbf): add products grid page and card`

---

### Task 5 — `ProductDetail` sub-route page

- **files:** `app/components/ProductDetail.tsx`
- **action:**
  `'use client'`. Follow the `HackathonLinksPage.tsx` shape: read the slug with
  `useHashSubRoute()` from `@/app/hooks/useHashRoute`, look it up with
  `PRODUCT_ITEMS.find((p) => p.slug === slug)`, and `return <NotFoundPage />` when
  there is no match — so `#/products/nope` 404s instead of rendering an empty shell.
  Takes no props.

  Layout top to bottom:
  1. Breadcrumb back-link `<a href="#/products" className={styles.back}>` reading
     `← ~/kaleb / products`, with an `aria-label`. It always points at the canonical
     path even when the visitor arrived through an alias.
  2. Title (`product.name`) + a status row: the `formatProductStatus(product)` chip,
     then a meta line `{product.kind} · published {product.published}`, then — only
     when `installsAsOf` is set — the qualifier line noting the install count is a
     figure as of that date, per D3. It must read as point-in-time, never as a live
     counter. When `installs` is absent the chip and the qualifier both silently
     disappear.
  3. Tagline, then the narrative paragraph.
  4. Hero `<img>` — clickable, opens the lightbox at index 0.
  5. A labelled feature list from `product.features`, then a stack chip row from
     `product.stack`.
  6. Gallery grid of `product.gallery` thumbnails, `loading="lazy"`, each opening the
     lightbox at its own index.
  7. Outbound link chips from `product.links` — every entry rendered, all three, each
     `target="_blank" rel="noopener noreferrer"` with an `aria-label` naming the
     destination and the product. Show the label in brackets with a `↗` glyph plus
     the host, mirroring `HackathonLinksPage.tsx:112-113`; derive the host with a
     `URL`-parsing helper guarded by try/catch that falls back to the raw href, the
     same as `hostOf` at `HackathonLinksPage.tsx:9-16`.

  **Lightbox:** build the image array as `[product.hero, ...product.gallery]` so the
  hero is zoomable, matching how `MeetupLightbox.tsx:35` flattens. Hold
  `lightboxIdx: number | null` in state. Port the keyboard effect from
  `MeetupDetail.tsx:40-51` — `Escape` closes, `ArrowLeft` / `ArrowRight` step within
  bounds — and register/remove the listener in the effect cleanup. Render prev/next
  arrows only when a neighbour exists, plus a close button and an `n / total`
  counter. Backdrop click closes; clicks inside the image wrapper call
  `stopPropagation`. Give every control an `aria-label`.

  Import types, data, and `formatProductStatus` from `@/app/lib/sections`; styles
  from `./ProductsPage.module.css`. **Do not import from, or edit, any `Meetup*`
  component** — mirror the pattern, do not couple to it.
- **verify:**
  ```
  bunx tsc --noEmit && bunx eslint app/components/ProductDetail.tsx
  ```
  0 errors. Confirm `grep -c 'href' app/components/ProductDetail.tsx` shows the
  three outbound chips plus the back-link are all wired.
- **done:** Component compiles, 404s on an unknown slug, renders hero + status +
  narrative + features + stack + gallery-with-lightbox + all three link chips.
- **commit:** `feat(260723-vbf): add product detail page with gallery lightbox`

---

### Task 6 — Wire the routes and the count chip

- **files:** `app/page.tsx`, `app/components/PageHeader.tsx`
- **action:**

  **6a. `app/page.tsx`** — swap the direct id lookup at line 53 for the new resolver:
  import `resolveSection` alongside `SECTIONS` from `./lib/sections` and use it for
  the non-home branch, so an aliased first segment resolves to its Section. This is
  what keeps `#/sidequests` alive under D2 — and it additionally activates the
  aliases already declared on the other five entries (`#/work`, `#/meetups`,
  `#/hacks`, `#/life`, `#/contact` …). That widening is intentional and safe: every
  alias is unique across `SECTIONS`, and no existing id is shadowed because id
  matching runs first. If `SECTIONS` still imports cleanly but is now unused after
  the swap, drop the dead import.

  Add the products branch to the dispatch chain using the existing `subRoute`
  pattern from the hackathons branch (line 69): when the resolved section id is
  `products`, render `ProductDetail` if `subRoute` is non-empty and `ProductsPage`
  otherwise. Place it immediately after the hackathons branch, before the
  `StubSectionPage` fallback — which must stay in place for hobbies and links.
  Import both new components at the top with the other component imports.

  **6b. `app/components/PageHeader.tsx`** — the count chip at line 106 hardcodes the
  noun. Change it to prefer `section.countLabel` when present and fall back to the
  existing `{count} entries` string otherwise. Three lines; the other five sections
  set no `countLabel` and render byte-identically.

  Do not modify `useHashRoute.ts` — `useHashSubRoute` already returns the second
  segment and needs no change.

- **verify:**
  ```
  bunx tsc --noEmit && \
  bunx eslint app/page.tsx app/components/PageHeader.tsx && \
  bun run build
  ```
  All three green. `bunx eslint` on those two files must report **0 problems**
  (that is their measured baseline).
- **done:** `#/products` renders the grid, `#/products/overlay-notes` renders the
  detail, `#/sidequests` resolves through the alias to the products grid,
  `#/hobbies` and `#/links` still render `StubSectionPage`, and the header chip
  reads `[1 product]`.
- **commit:** `feat(260723-vbf): route #/products and #/products/:slug`

---

### Task 7 — Verification sweep

- **files:** none (read-only; fix-forward in the owning task if a gate fails)
- **action:**
  Run the full gate set. Every command must pass before the task is considered done.

  **Toolchain gates** — `bunx tsc --noEmit` (clean), `bun run build` (succeeds), and
  the scoped lint over exactly the files this task touched:
  ```
  bunx eslint app/lib/sections.ts app/page.tsx app/components/PageHeader.tsx \
    app/components/ProductsPage.tsx app/components/ProductCard.tsx \
    app/components/ProductDetail.tsx
  ```
  0 errors required. `@next/next/no-img-element` warnings are accepted (they match
  the existing `MeetupDetail.tsx` baseline). **Do not** run bare `bun run lint` as a
  pass/fail gate — it is pre-broken with 32 errors in `ws-server/` and vendored
  bundles that are outside this task's scope. Never invoke `npm` or `npx`.

  **Dangling-reference gates.** The deleted symbols must be gone from `app/`, and the
  old slug must survive in exactly one place — the alias array:
  ```
  test "$(grep -rn 'SIDE_ITEMS\|SideItem' app/ | wc -l | tr -d ' ')" = "0"
  test "$(grep -rn 'sidequest' app/ | grep -v 'aliases:' | wc -l | tr -d ' ')" = "0"
  test "$(grep -rc "id: 'products'" app/lib/sections.ts | tr -d ' ')" = "1"
  ```
  <!-- planner-discipline-allow: SIDE_ITEMS -->
  <!-- planner-discipline-allow: SideItem -->
  The second gate is deliberately region-scoped: the old slug is a legitimate alias
  value on the `aliases:` line and must stay. Any *other* occurrence — a leftover
  comment, a stale route string, a tombstone breadcrumb — fails the gate. Fix by
  deleting the stray text, never by widening the filter.

  **Scope gate.** `git diff --stat` against the pre-task tree must list only:
  `app/lib/sections.ts`, `app/page.tsx`, `app/components/PageHeader.tsx`, the three
  new `Product*` files, the new CSS module, and the three PNGs. Any `Meetup*`,
  `Hackathon*`, `Work*`, `.planning/**`, `prompts/**`, `memory/**`, or `tests/**`
  file appearing in that list is out of scope per CONTEXT and must be reverted.

  **Asset-reference gate.** Every path in `PRODUCT_ITEMS` resolves on disk:
  ```
  for f in hero g1 g2; do test -f "public/products/overlay-notes/$f.png" || exit 1; done
  ```
- **verify:** every command above exits 0.
- **done:** Toolchain green, zero dangling references, diff confined to scope, all
  three image paths resolve.
- **commit:** none (verification only) — or `chore(260723-vbf): verification sweep`
  if a stray fix was required.

---

### Task 8 — Human verification

```xml
<task type="checkpoint:human-verify" gate="blocking">
  <what-built>
    The sidequests section is replaced by a products section. #/products renders a
    card grid; #/products/overlay-notes renders a detail page with hero, status,
    origin story, feature list, stack chips, a 2-image gallery with lightbox, and
    three outbound link chips. #/sidequests still resolves via the alias.
  </what-built>
  <how-to-verify>
    1. Run `bun dev` and open http://localhost:3000.
    2. Home directory: the 4th row reads `./products/ — products I built that people
       actually use  [1]`. Phosphor green text, gold count badge, chevron present.
    3. Tap that row. The grid page loads at `#/products`. Header chip reads
       `[1 product]` — not `[1 entries]`. One card: Overlay Notes screenshot
       thumbnail, title, `Chrome Extension`, and `[LIVE · v1.1.1 · 47 installs]`.
    4. Tap the card → `#/products/overlay-notes`. Confirm: hero screenshot renders
       (not a broken image); the status chip matches step 3; the line below reads
       `Chrome Extension · published Jul 2026`; a qualifier notes the install count
       is as of Jul 2026 and does not read like a live counter.
    5. Scroll: the CS2030 origin story, the feature list, and the stack chips are
       all legible in Anonymous Pro at #00FF00 with the glow intact. Gold is used
       only for links, chips, and highlights.
    6. Click the hero → lightbox opens at image 1 of 3. Press ArrowRight twice, then
       ArrowLeft. Press Escape — it closes. Click a gallery thumbnail → lightbox
       opens on that image.
    7. All three link chips open in a new tab: Chrome Web Store listing, the GitHub
       repo, the LinkedIn launch post. Each chip is comfortably thumb-sized.
    8. Tap the `← ~/kaleb / products` back-link → returns to the grid.
    9. Type `#/sidequests` in the address bar and reload → the products grid renders
       (does not 404).
    10. Regression: `#/work-experience`, `#/syai-meetups`, `#/hackathons`,
        `#/hobbies`, `#/links` all render exactly as before. `#/does-not-exist` and
        `#/products/does-not-exist` both render the 404 page.
    11. DevTools at 375px width: the grid is single-column, the card and all three
        link chips are at least 60px tall, nothing overflows horizontally, and the
        lightbox arrows sit inside the viewport.
  </how-to-verify>
  <resume-signal>Type "approved" or describe what looks wrong</resume-signal>
</task>
```

## must_haves

- **truths:**
  - `#/products` renders a grid; `#/products/overlay-notes` renders the detail page
  - `#/sidequests` still resolves (via alias) instead of 404ing — D2
  - The Overlay Notes card and detail both show `LIVE · v1.1.1 · 47 installs`, with
    the install count explicitly qualified "as of Jul 2026" — D3
  - All three outbound links (Chrome Store, GitHub, LinkedIn) are present and open
    in a new tab — D4/CONTEXT link table
  - Hero + 2 gallery images render from `public/products/overlay-notes/`; no video
  - `#/hobbies` and `#/links` still render `StubSectionPage` — no regression
  - `bunx tsc --noEmit` clean and `bun run build` succeeds
  - Zero references to the deleted array/interface remain in `app/`; the old slug
    survives only as an alias value

- **artifacts:**
  - `public/products/overlay-notes/{hero,g1,g2}.png`
  - `app/lib/sections.ts` — `ProductItem`, `PRODUCT_ITEMS`, `formatProductStatus`,
    `resolveSection`, `Section.countLabel`, products Section entry
  - `app/components/ProductsPage.module.css`
  - `app/components/ProductsPage.tsx`, `app/components/ProductCard.tsx`
  - `app/components/ProductDetail.tsx`
  - `app/page.tsx` (resolver + products dispatch), `app/components/PageHeader.tsx`
    (countLabel)

- **key_links:**
  - `app/page.tsx:53` — id lookup → `resolveSection`, the single point that makes
    every alias (including the old slug) routable
  - `app/page.tsx:68-71` — `subRoute` dispatch chain; products branch slots in
    before the `StubSectionPage` fallback
  - `app/lib/sections.ts:92-98` — `Section.items` union must swap the old item type
    for `ProductItem[]` or nothing typechecks
  - `app/components/Directory.tsx:41,86` — home rows read `#/{id}` and `./{path}`
    straight from `SECTIONS`; the rename propagates with no component edit
  - `app/components/PageHeader.tsx:106` — count chip; without `countLabel` it
    renders `[1 entries]`
  - `app/components/MeetupDetail.tsx:104-142` — the inline lightbox to mirror
    (mirror, do not import or edit)
</content>
