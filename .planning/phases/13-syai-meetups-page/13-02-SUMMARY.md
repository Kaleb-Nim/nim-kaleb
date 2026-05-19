---
phase: 13-syai-meetups-page
plan: 02
subsystem: ui-components
tags: [react, nextjs, typescript, terminal-ui, syai-meetups, components]
requires:
  - .planning/phases/13-syai-meetups-page/13-SPEC.md
  - .planning/phases/13-syai-meetups-page/13-01-SUMMARY.md
  - .planning/research/v3-design-kit/Meetups.jsx
provides:
  - "MeetupsPage<{section}> entry component (ready for dispatcher swap)"
  - "MeetupCard, MeetupImage, MeetupRibbon, SpeakersBlock, MeetupLightbox leaf components"
  - "LightboxOpen type re-exportable for future plans"
affects:
  - app/components/MeetupImage.tsx
  - app/components/MeetupRibbon.tsx
  - app/components/SpeakersBlock.tsx
  - app/components/MeetupCard.tsx
  - app/components/MeetupLightbox.tsx
  - app/components/MeetupsPage.tsx
tech-stack:
  added: []
  patterns: ["inline-style TSX port", "per-file mpColors palette inline", "flat-list lightbox navigation"]
key-files:
  created:
    - app/components/MeetupImage.tsx
    - app/components/MeetupRibbon.tsx
    - app/components/SpeakersBlock.tsx
    - app/components/MeetupCard.tsx
    - app/components/MeetupLightbox.tsx
    - app/components/MeetupsPage.tsx
  modified: []
decisions:
  - "SpeakersBlock hides the LinkedIn 'in ↗' chip when speaker.linkedin is empty OR equals the placeholder base URL 'https://www.linkedin.com/in/' (matches Plan 01 deferred-content note + scope_deferred block in this plan)"
  - "Per-event SIGN UP chip is the only render path for MeetupItem.signup — unset = chip omitted"
  - "Lightbox flat-list build uses [ev.hero, ...ev.gallery] inline (no ev.images field on MeetupItem); imgIdx 0 = hero, 1+ = gallery"
  - "mpColors palette inlined per component file (no shared constants module) — matches Phase 11 inline-style port pattern"
metrics:
  duration_minutes: 3
  completed_date: 2026-05-19
  tasks_completed: 3
  files_modified: 6
---

# Phase 13 Plan 02: SYAI Meetups Components Summary

Six new TSX components form the entire visual surface of the SYAI Meetups page, ported verbatim from `Meetups.jsx` Layout B path; not yet reachable in the browser — the route-dispatcher swap is Plan 03.

## Files Created

| File | Default Export | Purpose |
|------|----------------|---------|
| `app/components/MeetupImage.tsx` | `MeetupImage` | Filled `<img>` or `[ no media ]` placeholder tile; optional click handler with gold `⛶ ZOOM` badge when interactive |
| `app/components/MeetupRibbon.tsx` | `MeetupRibbon` | `#NN` gold chip + date + title row with dashed-green underline |
| `app/components/SpeakersBlock.tsx` | `SpeakersBlock` | Header `SPEAKERS [N]` + stacked rows (name │ role) with optional `in ↗` LinkedIn chip |
| `app/components/MeetupCard.tsx` | `MeetupCard` | Layout B: ribbon → 2-col (hero L / desc R) → speakers → gallery thumbs → optional `SIGN UP ↗` |
| `app/components/MeetupLightbox.tsx` | `MeetupLightbox` (+ named `LightboxOpen` type export) | Fullscreen overlay with prev/next/close, Esc + ← → keyboard, inner-image `stopPropagation` |
| `app/components/MeetupsPage.tsx` | `MeetupsPage` | Page entry — composes PageHeader, MeetupCard list, FooterMeta, single MeetupLightbox |

## Re-exportable Types

```typescript
// MeetupLightbox.tsx
export type LightboxOpen = { cardIdx: number; imgIdx: number } | null;
```

Plan 03 / future phases can `import { type LightboxOpen } from '@/app/components/MeetupLightbox'` if they need to drive the overlay externally.

## Layout B Faithful Port — Structural Equivalence

`MeetupCard` is byte-equivalent to `Meetups.jsx` lines 258-281 (Layout B arm) modulo:

- `mode`, `compact` props dropped (Layout B only, no compact mode per locked SPEC)
- Inlined the standalone `MeetupDesc` helper (lines 191-204) directly into the RIGHT column
- Inlined the standalone `GalleryRow` helper (lines 207-227) directly below the speakers block
- Added optional per-event `SIGN UP ↗` chip rendering for `event.signup` (in-scope per locked SPEC: per-event signup IS allowed; page-level CTA is NOT)

`MeetupLightbox` matches `Meetups.jsx` lines 364-508 with one adaptation: the flat-list build iterates `[ev.hero, ...ev.gallery]` because Plan 01 split the source kit's `ev.images` field into `hero + gallery`. Only non-null sources are pushed (placeholder cells are not navigable). All keyboard handlers, `stopPropagation` calls, and visual styling preserved verbatim.

## Deviations from Plan

**1. [Rule 2 — missing critical functionality] SpeakersBlock hides LinkedIn chip when URL is empty/placeholder**
- **Found during:** Task 1
- **Issue:** Plan 01 seeded 9 of 11 meetups with placeholder LinkedIn URLs (`https://www.linkedin.com/in/` with no profile slug). Rendering the `in ↗` chip for those would create dead links → 9 placeholder chips on the live page.
- **Fix:** `SpeakersBlock.tsx` guards the chip render with `hasLinkedin = !!sp.linkedin && sp.linkedin.trim() !== '' && sp.linkedin !== 'https://www.linkedin.com/in/'`. Chip only renders for real profile URLs (currently only Kaleb Nim, entry #1).
- **Files modified:** `app/components/SpeakersBlock.tsx`
- **Commit:** `ed85c09`
- **Justification:** Plan's `<scope_deferred>` block explicitly mandates this behaviour: *"Missing `linkedin` URL on a speaker (per Plan 13-01's deferred-content note) — hide the `in ↗` chip when the URL is absent or empty."* The placeholder base URL counts as "absent" in spirit since it points nowhere.

No other deviations. All three task verification blocks (tsc + grep set) passed unchanged.

## Verification Results

- `bunx tsc --noEmit` → exit 0 (after each task and after final task)
- `bunx eslint app/components/Meetup*.tsx app/components/SpeakersBlock.tsx` → 0 errors, 2 warnings
  - Both warnings are `@next/next/no-img-element` (`<img>` instead of `next/image`) — intentional per design-kit fidelity and consistent with existing `WorkLogoChip` pattern; out of scope for this plan
- All grep checks for required strings PASSED
- All grep checks for prohibited strings (`useTweaks`, `TweaksPanel`, `layoutMode`, `EDITMODE-BEGIN`, `compact`, `mode === 'A'|'C'|'D'`) → none found

## Commits

- `ed85c09` feat(13-02): add MeetupImage, MeetupRibbon, SpeakersBlock leaf components
- `543c6b7` feat(13-02): add MeetupCard (Layout B) and MeetupLightbox
- `85f6a96` feat(13-02): add MeetupsPage entry composing card list + lightbox

## Known Stubs / Deferred

Inherited from Plan 01 (not introduced by this plan):

- Speaker rosters mostly placeholder names (`'Speaker Name'`) and placeholder LinkedIn URLs — SpeakersBlock renders them as plain rows without the LinkedIn chip
- Long-form descriptions deferred; current `desc` strings render correctly without truncation
- All gallery slots are `null` — MeetupCard renders the `[ no media ]` placeholder tile per slot but they are not interactive (correct per spec — only non-null sources are zoomable)

These stubs do NOT prevent the plan's goal (chassis ready for Plan 03 dispatcher swap). Content population is scoped to Phase 14.

## Self-Check: PASSED

- FOUND: app/components/MeetupImage.tsx
- FOUND: app/components/MeetupRibbon.tsx
- FOUND: app/components/SpeakersBlock.tsx
- FOUND: app/components/MeetupCard.tsx
- FOUND: app/components/MeetupLightbox.tsx
- FOUND: app/components/MeetupsPage.tsx
- FOUND commit: ed85c09
- FOUND commit: 543c6b7
- FOUND commit: 85f6a96
