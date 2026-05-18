---
phase: 11-work-experience-page
plan: 01
subsystem: work-experience-page
tags: [react, nextjs, typescript, terminal-ui, work-experience, port]
requires:
  - app/lib/sections.ts (WorkItem, Section types + WORK_ITEMS array)
  - app/components/PageHeader.tsx (default + FooterMeta named export)
  - public/work-logos/{raid,tensorplex,artc}.png (Phase 10 assets, pre-existing)
provides:
  - app/lib/workStatus.ts: STATUS_META record, WorkStatusTag/WorkStatusMeta types, workStatusOf(tag) helper
  - app/components/WorkLogoChip.tsx: default export WorkLogoChip (square chip w/ green halo)
  - app/components/WorkPage.tsx: default export WorkPage (vertical phosphor-rail timeline for #/work-experience)
affects:
  - app/lib/sections.ts (4 logo path strings rewritten from ../../assets/logos/*.png → /work-logos/*.png)
tech-stack:
  added: []
  patterns:
    - Inline-style port of design-kit pages.jsx (no CSS modules, matches Phase 10 Directory.tsx pattern)
    - Status meta lookup with safe fallback to SHIPPED for unknown tags
    - <img onError={...}> graceful hide (matches design-kit; intentional non-use of next/image)
key-files:
  created:
    - app/lib/workStatus.ts
    - app/components/WorkLogoChip.tsx
    - app/components/WorkPage.tsx
  modified:
    - app/lib/sections.ts (4 WORK_ITEMS logo paths)
decisions:
  - "Kept full STATUS_META table including WIP + MILESTONE so future tags work without code changes (per CONTEXT.md D-Implementation Decisions, 'Design source-of-truth')"
  - "WIP/MILESTONE rows copied verbatim from Timeline.jsx STATUS_META (sym '◐' for WIP, '★' for MILESTONE) — not the fallback values listed in the plan, since Timeline.jsx is canonical"
  - "WorkLogoChip uses plain <img> (not next/image) — verbatim port from pages.jsx; next/image would alter rendering and require width/height props"
metrics:
  duration: "~6 min"
  completed: 2026-05-18
requirements: [WORK-01, WORK-02, WORK-03, WORK-04, WORK-05]
---

# Phase 11 Plan 01: WorkPage + WorkLogoChip Port Summary

One-liner: Verbatim TSX port of the design-kit `WorkPage` + `WorkLogoChip` plus a typed `workStatus` helper module, and a four-string logo-path migration in `sections.ts` so Next.js can serve them from `/public/work-logos/`.

## What Was Built

### `app/lib/workStatus.ts` (new, pure data module)
- `WorkStatusTag` union: `'ACTIVE' | 'SHIPPED' | 'ARCHIVED' | 'WIP' | 'MILESTONE'`
- `WorkStatusMeta` interface: `{ color, glow, sym }`
- `STATUS_META: Record<WorkStatusTag, WorkStatusMeta>` — all 5 entries
  - ACTIVE/SHIPPED/ARCHIVED rows verbatim from `pages.jsx` lines 89-92
  - WIP/MILESTONE rows verbatim from `Timeline.jsx` lines 15-21 (WIP sym `◐`, MILESTONE sym `★`)
- `workStatusOf(tag): WorkStatusMeta` — own-property lookup, falls back to `STATUS_META.SHIPPED`

### `app/components/WorkLogoChip.tsx` (new, `'use client'`)
- Default export `WorkLogoChip({ src, bg, alt })`
- Square chip `clamp(56px, 14vw, 76px)`, `bg || '#FFFFFF'`, padding 8, border `rgba(0,255,0,0.35)`
- Triple-layer boxShadow string preserved exactly: `'0 0 0 1px rgba(0,255,0,0.15) inset, 0 0 14px rgba(0,255,0,0.18), 0 4px 14px rgba(0,0,0,0.55)'`
- Inner `<img>` with `objectFit: 'contain'`, `filter: 'saturate(0.92) contrast(1.02)'`, `onError` hides

### `app/components/WorkPage.tsx` (new, `'use client'`)
- Default export `WorkPage({ section: Section })`
- Imports `PageHeader` (default) + `FooterMeta` (named) from `./PageHeader`
- Imports `WorkLogoChip` (default) and `workStatusOf` (named)
- Casts `section.items as WorkItem[]`
- Container `paddingLeft: 32`, rail `left: 10` w/ gradient + glow, nodes `left: -27` w/ status colour
- Pixel-faithful row layout: date → title+`[tag]` chip → org → note, with the chip rendered only when `it.logo` is truthy
- Ends with `<FooterMeta section={section} />`

### `app/lib/sections.ts` (modified)
Four `logo:` strings rewritten — all other fields untouched:

| Entry | Before | After |
|---|---|---|
| RAiD | `'../../assets/logos/raid.png'` | `'/work-logos/raid.png'` |
| Tensorplex | `'../../assets/logos/tensorplex.png'` | `'/work-logos/tensorplex.png'` |
| ARTC AI Engineer | `'../../assets/logos/artc.png'` | `'/work-logos/artc.png'` |
| ARTC Dev Sci Intern | `'../../assets/logos/artc.png'` | `'/work-logos/artc.png'` |

Verified: `grep -c "/work-logos/" app/lib/sections.ts` → 4, `grep -c "assets/logos/" app/lib/sections.ts` → 0. Target PNGs already present in `public/work-logos/`.

## Public Exports (for Plan 02 to wire in)

```typescript
// app/lib/workStatus.ts
export type WorkStatusTag;
export interface WorkStatusMeta;
export const STATUS_META: Record<WorkStatusTag, WorkStatusMeta>;
export function workStatusOf(tag: string | undefined): WorkStatusMeta;

// app/components/WorkLogoChip.tsx
export default function WorkLogoChip(props: { src: string; bg?: string; alt: string }): JSX.Element;

// app/components/WorkPage.tsx
export default function WorkPage(props: { section: Section }): JSX.Element;
```

Plan 02 should import `WorkPage` and dispatch on `section.id === 'work-experience'` in whichever page-router component currently renders `StubSectionPage`.

## Verification

- `bunx tsc --noEmit` → exits 0
- `bunx eslint app/components/WorkPage.tsx app/components/WorkLogoChip.tsx app/lib/workStatus.ts app/lib/sections.ts` → exits 0 (1 warning, 0 errors)
- All grep markers from the plan's `<automated>` blocks present:
  - `export function workStatusOf` ✓
  - 5 status tags ACTIVE/SHIPPED/ARCHIVED/WIP/MILESTONE ✓
  - `rgba(0,255,0,0.35)` (chip border) ✓
  - `paddingLeft: 32` and `left: -27` (rail alignment markers) ✓
  - `/work-logos/` count == 4, `assets/logos/` count == 0 ✓

## Deviations from `pages.jsx` Verbatim Port

**Zero functional deviations.** Only the required TypeScript/React-typing changes:

1. `onError` handler typed as `(e: React.SyntheticEvent<HTMLImageElement>) => void` (required by TS).
2. Added explicit `WorkLogoChipProps` interface (required by TS, no behavior change).
3. Added `section.items as WorkItem[]` cast (required because `Section.items` is a union; matches plan instruction).

## Known Stubs

None.

## ESLint Note

`@next/next/no-img-element` warning on `WorkLogoChip.tsx` line 28. This is intentional: the plan mandates a verbatim port and `next/image` would require `width`/`height` props and change rendering. Logged here so Plan 02 reviewers know it is not an oversight.

## Self-Check: PASSED

Files created exist:
- `app/lib/workStatus.ts` FOUND
- `app/components/WorkLogoChip.tsx` FOUND
- `app/components/WorkPage.tsx` FOUND
- `app/lib/sections.ts` modified

Verification commands all pass (tsc, eslint, grep markers).
