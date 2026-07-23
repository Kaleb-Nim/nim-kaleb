# CONTEXT — Rename `sidequests` → `products`, add Overlay Notes

**Quick ID:** 260723-vbf
**Date:** 2026-07-23
**Mode:** quick --discuss

---

## Task

Replace the `sidequests` section with a `products` section: a compilation of
products Kaleb has built that are **still current and actively serving users**.
First (and currently only) entry: the **Overlay Notes** Chrome extension.

---

## Current state (verified)

- `app/lib/sections.ts:397-408` defines the `sidequests` Section.
- `app/lib/sections.ts:304-337` defines `SIDE_ITEMS` — 32 placeholder
  talks/events/conferences. **These are never rendered.** `app/page.tsx:71`
  routes `sidequests` to `StubSectionPage` ("this section is being finalised").
- `SideItem` interface at `app/lib/sections.ts:66-71`.
- Reference patterns to follow:
  - Grid → detail routing: `MeetupsPage.tsx` / `MeetupDetail.tsx` /
    `MeetupGridCard.tsx` / `MeetupLightbox.tsx`, styles in
    `MeetupsPage.module.css`.
  - Sub-route dispatch already exists in `app/page.tsx` (see `subRoute` handling
    for `hackathons` → `HackathonLinksPage`).

---

## Locked design decisions (user-confirmed, do not re-litigate)

### D1 — Page layout: **grid → detail page**, modelled on `/meetups`

- `#/products` renders a grid of product cards (thumbnail + title + status).
- `#/products/overlay-notes` renders a detail view: hero screenshot, status tag,
  narrative, feature list, gallery (lightbox), and outbound link chips.
- Reuse the existing meetups grid/detail/lightbox components and CSS module
  patterns rather than inventing a new visual language.

### D2 — Old content: **delete `SIDE_ITEMS`, alias the old route**

- Delete the 32-item `SIDE_ITEMS` array and the `SideItem` interface (unused
  elsewhere — verify with grep before removal).
- New section: `id: 'products'`, `path: 'products'`.
- `aliases: ['product', 'sidequests', 'side-quests', 'events', 'apps', 'extensions']`
  so `#/sidequests` and existing voice-clone references still resolve.

### D3 — Status line: **status + version + install count + publish date**

Card/detail show a real, non-fabricated figure supplied by the user:

```
Overlay Notes     [LIVE · v1.1.1 · 47 installs]
Chrome Extension · published Jul 2026
(install count as of Jul 2026)
```

- Install count `47` must carry an "as of Jul 2026" qualifier so it reads as a
  point-in-time figure, not a live counter.
- Model the item type with an optional `users`/`installs` field so future
  products can omit it.

### D4 — Media: **3 store screenshots, no video**

Copy from `/Users/kalebnim/Documents/GitHub/overlay-notes/store/screenshots/`
into `public/products/overlay-notes/`:

| Source                      | Role                          |
|-----------------------------|-------------------------------|
| `01-mdn-array-map.png`      | grid thumbnail + detail hero  |
| `02-blog-useeffect.png`     | gallery                       |
| `03-mdn-functions-guide.png`| gallery                       |

- Do **not** copy `store/video/overlay-notes-launch.mp4` (8 MB) — no video
  player, keep the bundle light.
- Gallery images open in the existing meetup lightbox pattern.

---

## Overlay Notes — source facts (verified from the repo)

Repo: `/Users/kalebnim/Documents/GitHub/overlay-notes` (public:
`https://github.com/Kaleb-Nim/overlay-notes`)

- **Name:** Overlay Notes — Sketch on any page
- **Version:** 1.1.1 (`package.json`)
- **Type:** Chrome (Manifest V3) extension
- **Published:** Jul 2026 (LinkedIn launch post dated 2026-07-19; repo first
  commit 2026-06-25)
- **Installs:** 47 (as of Jul 2026, user-supplied)
- **Store summary (≤132 chars, from `store/STORE-LISTING.md`):**
  "Sketch freehand Excalidraw-style notes over any webpage. Anchored to the
  content, saved per page, 100% local."
- **Origin story (from README "Why I built this"):** started while studying for
  NUS CS2030 — course material in the browser, notes in Apple Notes off to the
  side, constant context-switching. Already used Excalidraw for mind-mapping, so
  the idea was to put that canvas directly on the page. First published Chrome
  extension.
- **Key features:** full Excalidraw toolset (pen, shapes, arrows, hand-drawn
  text); works on strict-CSP sites like GitHub; annotate ↔ browse (click-through)
  modes toggled with `Alt+Shift+E`; scroll-anchored drawings; autosave per
  normalized URL to the extension's own IndexedDB; auto-restore across SPA
  navigations; badge + popup; local-first, no account, fully offline.
- **Tech stack:** WXT, TypeScript, React 19, `@excalidraw/excalidraw` 0.18.1,
  Dexie (IndexedDB), Playwright validation CLI.

### Links (all three shown as chips)

| Label        | href |
|--------------|------|
| CHROME STORE | https://chromewebstore.google.com/detail/overlay-notes/ogekdbffoapphpabjphfgeppildcleck |
| GITHUB       | https://github.com/Kaleb-Nim/overlay-notes |
| LINKEDIN     | https://www.linkedin.com/posts/kaleb-nim_chromeextension-buildinpublic-ugcPost-7484554047480328192-ghZg/ |

---

## Section copy (starting point — planner may refine tone to match siblings)

- `desc` (directory row): `products I built that people actually use`
- `title`: `./products — things I shipped that are still running`
- `intro`: something along the lines of "Products I built and still maintain —
  live, installable, serving real users. Not demos, not hackathon weekends."
- `count`: `1`
- `footer`: `[1 product] · live · more shipping soon`

---

## Constraints

- Terminal aesthetic is non-negotiable: `#00FF00` phosphor green, `#FFD700`
  gold for links/highlights, Anonymous Pro monospace, existing glow treatments.
- Follow the repo's CSS-module convention for terminal styling (not Tailwind).
- Do not fabricate metrics beyond the 47 installs figure given above.
- Bun only (`bun run build`, `bun run lint`) — never npm/npx.
- Mobile-first: tap targets ≥60px, no hover-only affordances (see `Directory.tsx`).

## Out of scope

- Adding any second product entry.
- Embedding the launch video.
- Touching the hackathons, meetups, work, hobbies, or links sections beyond what
  the rename mechanically requires.
