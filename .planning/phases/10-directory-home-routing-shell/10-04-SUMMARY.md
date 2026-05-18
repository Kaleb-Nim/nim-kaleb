---
phase: 10-directory-home-routing-shell
plan: 04
subsystem: ui-components
tags: [voice-cta, responsive, design-kit, css]
requirements_completed: [VOICE-01]
dependency_graph:
  requires: [10-01]
  provides:
    - "FloatingMic component (default export from app/components/FloatingMic.tsx)"
    - "Responsive collapse rules for .kni-floating-mic at <520px"
    - "Hover-only KNI affordances (.kni-dir-row, .kni-tappable, .kni-crumb-home)"
    - "Utility classes: .kni-gold-link, .kni-banner-row, .quick-bar a"
  affects:
    - "Plan 10-08 (mounts <FloatingMic active={voiceOpen} onToggle={...} />)"
    - "Plan 10-05/06/07 (HomePage uses .kni-banner-row and .quick-bar a)"
tech_stack:
  added: []
  patterns:
    - "Inline style object on button (matches design kit 1:1)"
    - "Class hook (.kni-floating-mic / .kni-floating-mic-label) for responsive override via globals.css"
key_files:
  created:
    - "app/components/FloatingMic.tsx"
  modified:
    - "app/globals.css"
decisions:
  - "Used double-quoted JSX string for aria-label to avoid HTML-entity dance around the apostrophe in Kaleb's"
  - "Bundled non-floating-mic CSS (banner row, gold-link utility, hover block) into this plan's globals.css append since they're sibling design-kit primitives needed by Plans 10-05/06/07"
metrics:
  duration: "~5min"
  tasks_completed: 2
  files_touched: 2
  completed_date: "2026-05-18"
---

# Phase 10 Plan 04: FloatingMic Component Summary

**One-liner:** Ported the design-kit floating voice CTA to a typed TSX client component with idle/active visual states, and bundled the responsive collapse + hover/utility CSS into `app/globals.css`.

## What Was Built

### Task 1 — `app/components/FloatingMic.tsx` (commit `d7cc4fa`)

Default-exported `FloatingMic({ active, onToggle })` button:

- Fixed bottom-right with `env(safe-area-inset-*)` for iOS notch handling.
- Idle: gold `#FFD700` border + text + glow + `● talk to me` label.
- Active: red `#FF4444` border + text + glow + `■ voice live` label + `kniFloatPulse` animation.
- `aria-label` toggles: `"Open voice — talk to Kaleb's AI clone"` ↔ `"Close voice panel"`.
- Two child spans: icon (`aria-hidden`) and label (with `.kni-floating-mic-label` class so CSS can hide it at narrow widths).
- Inline style object matches `.planning/research/v3-design-kit/FloatingMic.jsx` lines 18-46 exactly.

### Task 2 — `app/globals.css` append (commit `9f23a72`)

Four blocks added after the `prefers-reduced-motion` rule:

1. **Utilities** — `.kni-gold-link`, `.quick-bar a`, `.kni-banner-row`.
2. **Hover-only affordances** — `@media (hover: hover)` block for `.kni-dir-row`, `.kni-tappable`, `.kni-crumb-home`, `.kni-floating-mic:hover { transform: translateY(-2px); }`.
3. **<480px** — hide `.quick-bar .quick-label`.
4. **<520px** — collapse `.kni-floating-mic` to circle (`padding: 14px`, `border-radius: 999px`) and hide `.kni-floating-mic-label`.

`bun run build` succeeds.

## Commits

| Hash      | Task | Message                                                      |
| --------- | ---- | ------------------------------------------------------------ |
| `d7cc4fa` | 1    | feat(10-04): port FloatingMic component to TSX               |
| `9f23a72` | 2    | feat(10-04): add KNI v3 responsive collapse and utility CSS  |

## Verification

- [x] `bunx tsc --noEmit` clean for FloatingMic.tsx (no errors reported)
- [x] `bun run build` succeeds with new globals.css rules
- [x] grep confirms `.kni-floating-mic`, `.kni-floating-mic-label`, `.kni-banner-row`, `.quick-label`, `.kni-gold-link` all defined in globals.css
- [x] `@media (hover: hover)` and `max-width: 520px` blocks present

## Deviations from Plan

None — plan executed exactly as written. Both tasks completed cleanly, no Rule 1/2/3 fixes required, no auth gates encountered.

## Integration Notes for Downstream Plans

- **Plan 10-08** mounts `<FloatingMic active={voiceOpen} onToggle={() => setVoiceOpen(v => !v)} />` at root layer (z-index 30 — above terminal chrome).
- **Plan 10-05/06/07** can use `.kni-banner-row` and `.quick-bar a` directly without additional CSS.
- **Plan 10-02** (Directory rows) benefits from the new hover block — `.kni-dir-row:hover` now lights up in phosphor green automatically.

## Self-Check: PASSED

- FOUND: `app/components/FloatingMic.tsx`
- FOUND: commit `d7cc4fa`
- FOUND: commit `9f23a72`
- FOUND: `.kni-floating-mic-label`, `.kni-banner-row`, `kni-gold-link`, `max-width: 520px` rules in `app/globals.css`
