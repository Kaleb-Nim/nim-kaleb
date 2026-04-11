---
phase: 04-ui-preservation-launch-readiness
plan: 02
status: completed
started: 2026-04-11
completed: 2026-04-11
tasks_completed: 2
tasks_total: 2
deviations: 1
---

# Plan 04-02 Summary: Cross-Viewport Playwright Smoke Tests

## What Was Built

Created 11 Playwright tests across 3 viewports (desktop 1280x720, tablet 768x1024, mobile 375x667) verifying terminal state machine progression and layout.

### Task 1: Playwright Test Suite
- 3 viewport describe blocks with shared test patterns
- Tests: starfield renders, state machine BOOTING->STATUS->MENU, command "1"+Enter reaches voice interface
- Desktop-specific: terminal max-width <= 860px
- Mobile-specific: terminal width ~95vw (356px)
- All 11 tests pass

### Task 2: Human Visual Verification
User requested three changes during visual review:
1. **Disable scrolling** — reverted overflow-y/max-height, terminal fits to screen
2. **Transcript default shown** — changed `useState(false)` to `useState(true)`
3. **Last sync timing** — replaced hardcoded date with build-time env var (`NEXT_PUBLIC_LAST_SYNC`) sourced from latest `git log main` commit timestamp

## Deviation

- Plan 04-01 originally added `overflow-y: auto` and `max-height: 400px`. User feedback during visual verification requested this be reverted — terminal should fit to screen without scrolling.

## Key Files

| File | Change |
|------|--------|
| `tests/ui-preservation.spec.ts` | New: 11 cross-viewport smoke tests |
| `app/components/TerminalContent.module.css` | Reverted to overflow: hidden (no scroll) |
| `app/components/VoiceInterface.tsx` | Transcript defaults to shown |
| `next.config.ts` | Build-time NEXT_PUBLIC_LAST_SYNC from git log main |
| `app/page.tsx` | Last sync uses env var timestamp |

## Commits

| Hash | Message |
|------|---------|
| 9c5f10c | test(04-02): add cross-viewport Playwright UI preservation smoke tests |
| 6019af4 | fix(04-02): apply visual verification feedback |

## Verification

- [x] All 11 Playwright tests pass
- [x] Human visual verification completed with feedback applied
- [x] `bun run build` exits 0
