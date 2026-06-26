---
quick_id: 260627-4tk
slug: mobile-quick-bar-link-brand-icons
date: 2026-06-27
status: complete
---

# Quick Task 260627-4tk — Summary

## What changed

On the home quick-bar, mobile (≤480px) now shows the **literal destination
word** in place of the handle, so visitors can tell where each link goes:

| Link     | Desktop (>480px)        | Mobile (≤480px) |
|----------|-------------------------|-----------------|
| github   | `github: [Kaleb-Nim] ↗` | `[GitHub] ↗`    |
| linkedin | `linkedin: [kaleb-nim] ↗` | `[LinkedIn] ↗` |
| email    | `email: [kaleb.nim@gmail]` | `[Email]`     |
| cv       | `cv: [download] ⬇`      | `[Resume] ⬇`    |
| youtube  | `youtube: [how I built this] ↗` | `[YouTube] ↗` |

Desktop is unchanged. No icons/SVGs were added — per the user's clarification,
the fix was to swap the displayed text to the destination word on mobile.

## How it works

- `app/lib/sections.ts` — added `dest: string` to the `Link` interface and a
  capitalized destination word to each `LINKS` entry.
- `app/components/HomePage.tsx` — each quick-bar `<a>` now renders both
  `<span class="quick-value">` (handle) and `<span class="quick-dest">`
  (destination word) inside the brackets.
- `app/globals.css` — `.quick-dest` is hidden by default; inside the existing
  `@media (max-width: 480px)` block, `.quick-value` is hidden and `.quick-dest`
  is shown (alongside the already-hidden `.quick-label`). Pure CSS swap, no JS.

## Verification

- `bunx tsc --noEmit` → passes (exit 0).
- `bunx eslint` on changed files → clean (pre-existing repo lint errors are all
  in `ws-server/` and vendored bundles, untouched here).
- Playwright at 375px → `["[GitHub] ↗","[LinkedIn] ↗","[Email]","[Resume] ⬇","[YouTube] ↗"]`
- Playwright at 1280px → handles unchanged: `["[Kaleb-Nim] ↗", …]`

## Notes / follow-ups

- The destination words for the non-GitHub/LinkedIn links use sensible defaults
  (Email, Resume, YouTube). Easy to relabel via the `dest` field in
  `app/lib/sections.ts` if you'd prefer e.g. `CV` instead of `Resume`.
