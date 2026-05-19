---
id: syai-meetups-page-from-design-kit
title: Build syai-meetups page from new design kit
area: frontend
status: pending
created: 2026-05-19
captured_from: in-session
---

# Build syai-meetups page from new design kit

## Source

Fetch the design kit and read its README, then implement the relevant aspects:

- **URL:** https://api.anthropic.com/v1/design/h/UtNCPto_o8734VnTbs853w?open_file=ui_kits%2Fterminal%2Findex.html
- **Target file in kit:** `ui_kits/terminal/index.html`
- **Asset location (local):** `portfolio_info/` (contains images for past meetups)

## Scope

Replace the Phase 10 stub at `#/syai-meetups` with the real meetups page. Follow the Phase 11 pattern:

1. Pull WorkPage/Meetups-equivalent JSX from the fetched kit (`ui_kits/terminal/pages.jsx` → `MeetupsPage`, or the dedicated `Meetups.jsx` if the new kit splits it).
2. Update `SYAI_ITEMS` in `app/lib/sections.ts` with the real meetup roster — the existing placeholder list is fictional.
3. Copy meetup images from `portfolio_info/` into `public/meetups/` (or whichever convention the new kit uses).
4. Wire `<MeetupsPage section={section} />` into the route dispatcher in `app/page.tsx` when `section.id === 'syai-meetups'`.
5. Verify build + visual at 360px and 1024px+.

## Captured copy (March 2025 entry seed)

User pasted full event description for the **March 22 2025** SYAI × CYS meetup at *SCAPE — "Networking & Resume Roasting" with Lim Mei Yu (Get Ahead, ex-Meta/Google). Includes live resume critique, networking, Q&A, "bring-a-friend free bubble tea" promo. Sign-up: https://forms.gle/FpKePiMijNLDtudV6

When the page lands, this should be one of the real entries (replace the current placeholder "Meetup #5 — Local LLMs on Consumer Hardware" or insert as its own entry depending on numbering). Full verbatim copy is preserved in this todo for ingestion when planning.

## Pre-reqs

- Phase 11 complete (PageHeader / FooterMeta / route dispatcher pattern established) ✓
- Decide whether this becomes its own phase (likely Phase 13+) or a quick task

## Suggested next step

`/gsd-add-phase` or `/gsd-spec-phase` to scope this as a proper phase once Phase 12 (preview env) lands.
