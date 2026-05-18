---
phase: 10-directory-home-routing-shell
plan: 01
subsystem: design-tokens
tags: [css, design-system, kni, foundations]
requires: []
provides:
  - "KNI design tokens (--kni-*) globally available"
  - "7 KNI keyframes globally available"
  - ".kni-page and .kni-blink utility classes"
affects:
  - "All Wave 2+ components that reference var(--kni-*) or animation: kni*"
tech-stack:
  added: []
  patterns: ["CSS custom properties as design tokens", "Global keyframes for shared animations"]
key-files:
  created: []
  modified:
    - app/globals.css
decisions:
  - "Append new --kni-* tokens alongside existing --green-primary/--bg-deep tokens (do not replace) to preserve Terminal/VoiceInterface CSS modules"
  - "Place keyframes at file scope so existing prefers-reduced-motion * selector neutralises them automatically"
metrics:
  tasks_completed: 1
  duration: "~3 min"
  completed_date: "2026-05-18"
requirements: [MIG-03]
---

# Phase 10 Plan 01: KNI Global Tokens & Keyframes Summary

Ported the Kebab Neural Interface design tokens (`--kni-*`) and the seven shared keyframes from the v3 design kit into `app/globals.css` so Wave 2+ components can consume them globally.

## What Was Built

- Added a `--kni-*` block to `:root` containing the full KNI palette (green/gold/red/white), foreground muted/faint tokens, glow text-shadow tokens (green, green-strong, gold, red), and `--kni-ease-out`.
- Added seven file-scope `@keyframes`: `kniFadeIn`, `kniBlink`, `kniBars`, `kniPanelOpen`, `kniPageIn`, `kniRecordPulse`, `kniFloatPulse` — values copied verbatim from `.planning/research/v3-design-kit/index.html` lines 17-38.
- Added utility classes `.kni-page` (220ms `kniPageIn` ease-out on mount) and `.kni-blink` (1s step-end cursor blink).
- Preserved all existing tokens (`--bg-deep`, `--green-primary`, `--yellow-accent`, dot colors) and the `body { overflow: hidden }` rule.

## Verification

- `grep "--kni-green:" app/globals.css` → 1 hit, value `#00FF00`.
- `grep "@keyframes kni*"` → 7 hits (one per keyframe).
- `grep ".kni-page"` → 1 hit.
- `bun run build` → succeeds, all routes prerender as before (`/`, `/api/*`).
- `bun run lint` → no new errors introduced (9 pre-existing errors live in `ws-server/src/session.ts`, unrelated to this plan).

## Commits

| Task | Hash    | Message                                              |
| ---- | ------- | ---------------------------------------------------- |
| 1    | dfe80a2 | feat(10-01): add KNI design tokens and global keyframes |

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- FOUND: `app/globals.css` (modified, contains all required tokens & keyframes)
- FOUND: commit `dfe80a2` in `git log`
- FOUND: `.planning/phases/10-directory-home-routing-shell/10-01-SUMMARY.md` (this file)
