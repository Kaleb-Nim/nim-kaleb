---
quick_id: 260502-r2r
description: Mobile-first link affordance — persistent underline, trailing arrow glyphs, full-row tap targets, mobile voice activation button
status: complete
date: 2026-05-02
---

# Quick Task 260502-r2r — Summary

## Goal

70% of visitors are on mobile. Live feedback: clickable links (CV, LinkedIn, GitHub, YouTube) are not obvious. Apply four targeted UI fixes.

## Changes Shipped

### 1. Persistent underline on links — `CognitiveStatus.module.css:22-31`
- `.goldLink` now has `text-decoration: underline` at all times (1px, 3px offset)
- Hover state retained: `filter: brightness(1.2)` for subtle feedback
- Affordance signal is now visible on first paint instead of hover-only

### 2. Trailing arrow glyphs — `CognitiveStatus.tsx:42-48`
- New `glyphFor(cell)` helper:
  - `↗` for external links (LinkedIn, GitHub, YouTube)
  - `⬇` for `.pdf` downloads (CV)
  - `null` for `mailto:` (Email) and non-links
- Glyph rendered inside the `<a>` so it inherits the underline
- Two-column ASCII alignment preserved by shrinking `padEnd` width by 1 when a glyph is present (`effectivePad` logic on line 83)

### 3. Full-row tap targets on mobile — `CognitiveStatus.tsx:115-134` + `CognitiveStatus.module.css:42-62`
- New `.goldLinkBlock` modifier scoped to `.singleColumn` (mobile only)
- Wraps the entire row (label + value + glyph) in the `<a>`, with `display: block`, `padding: 12px 0`, `min-height: 48px` — meets WCAG 2.5.5 / Apple HIG ≥48px tap target
- `.rowLabel` span keeps the label phosphor-green (`#00FF00`) inside the gold link wrapper
- `:active { background: rgba(255,215,0,0.15) }` provides press feedback (no hover on touch)
- Desktop two-column layout untouched — `.goldLinkBlock` only applies under `.singleColumn` parent

### 4. Mobile voice activation button — `MobileVoiceButton.tsx` (new) + `page.tsx:30-46,134-144`
- New `MobileVoiceButton` component renders `[ ▶ ACTIVATE VOICE INTERFACE ]` ASCII-styled button
- Detected via `window.matchMedia('(pointer: coarse)')` — captures touch capability across phones, tablets, hybrids (more idiomatic than viewport width)
- Full-width, ≥48px tall, green phosphor border with pulsing box-shadow (2.4s loop)
- `:active { transform: scale(0.99); background: rgba(0,255,0,0.15) }` for tactile feedback
- `prefers-reduced-motion: reduce` disables the pulse animation
- **State machine untouched** — button calls `handleCommand('1')`, the same handler the keyboard path uses, so `MENU → PROCESSING → CONNECTING` flows identically
- Desktop keeps the existing `CommandInput` + "Type 1 and press Enter" hint

## Files

| File | Change |
|------|--------|
| `app/components/CognitiveStatus.tsx` | +43/-20 — `glyphFor()`, `goldLinkBlock` mobile wrapper |
| `app/components/CognitiveStatus.module.css` | +32/-2 — persistent underline, mobile block layout, `.rowLabel`, `.externalGlyph` |
| `app/components/MobileVoiceButton.tsx` | +20 — new component |
| `app/components/MobileVoiceButton.module.css` | +50 — pulsing phosphor button, reduced-motion guard |
| `app/page.tsx` | +24/-4 — coarse-pointer detection, conditional render |

## Commits

- `6d05886` feat(260502-r2r): persistent link underline, glyphs, and mobile full-row tap targets
- `e066f2f` feat(260502-r2r): add MobileVoiceButton with coarse-pointer responsive wiring
- `<merge>` chore: merge quick task worktree (260502-r2r)

## Verification

- ✅ `bunx tsc --noEmit` — clean (no errors)
- ✅ Pre-existing lint errors in `ws-server/` and Drizzle generated files are unchanged (not introduced by this task)
- ⚠ **Needs human visual verification on mobile device** — request live retest on iOS Safari + Android Chrome:
  - Confirm links are visibly underlined on first paint
  - Confirm `↗` and `⬇` glyphs render in Anonymous Pro (fallback to system mono if Google Font misses them)
  - Confirm tapping anywhere on a row navigates (not just the value text)
  - Confirm the activate button is visible at MENU phase and triggers voice connection
  - Confirm desktop two-column ASCII alignment is unchanged at ≥768px

## Notes

- The `(pointer: coarse)` media query is the right detection — it captures *touch capability*, not just narrow viewports. A user on a touchscreen laptop will get the button (correct); a user on a narrow window of a desktop browser will get the keyboard path (correct).
- `CommandInput` is still rendered into the React tree on desktop — no bundle regression.
- The internship banner remains gold but is non-clickable — consider follow-up to differentiate gold-as-link from gold-as-highlight (was raised in original UX consult, deferred from this task).
