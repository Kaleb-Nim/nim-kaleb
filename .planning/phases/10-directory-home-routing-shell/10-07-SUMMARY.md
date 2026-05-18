---
phase: 10-directory-home-routing-shell
plan: 07
subsystem: voice-overlay
tags: [voice, overlay, modal, a11y]
requires:
  - app/components/VoiceInterface.tsx (existing)
  - app/hooks/useRealtimeVoice.ts
provides:
  - app/components/VoiceOverlay.tsx (new)
  - VoiceInterface overlay mode (auto-connect + close button)
affects:
  - Plan 10-08 (floating mic toggle will mount VoiceOverlay)
tech-stack:
  added: []
  patterns:
    - "Modal pattern: backdrop click → onClose, inner stopPropagation"
    - "Focus management: capture document.activeElement on mount, restore on unmount"
    - "data-* attribute as a focus handle so parent overlay doesn't need refs into child"
key-files:
  created:
    - app/components/VoiceOverlay.tsx
  modified:
    - app/components/VoiceInterface.tsx
decisions:
  - "Made transitionTo optional (with noop fallback) instead of forking VoiceInterface into two components — keeps inline call site unchanged"
  - "Esc key handler deliberately NOT in VoiceOverlay; lives at app/page.tsx root (Plan 10-08) so it works regardless of mount timing"
  - "data-overlay-close attribute is the contract between VoiceInterface and VoiceOverlay — no ref drilling"
metrics:
  duration: ~10 min
  completed: 2026-05-18
requirements: [VOICE-02, VOICE-03]
---

# Phase 10 Plan 07: Voice Overlay Shell Summary

Extended `VoiceInterface` with a `mode='overlay'` prop (auto-connects on mount, renders a close button) and created `VoiceOverlay.tsx` — a gold-bordered modal that wraps `VoiceInterface` for use by the upcoming floating mic toggle (Plan 10-08).

## Tasks Completed

| Task | Name                                    | Commit  | Files                                   |
| ---- | --------------------------------------- | ------- | --------------------------------------- |
| 1    | Add overlay mode to VoiceInterface      | a28fa4d | app/components/VoiceInterface.tsx       |
| 2    | Create VoiceOverlay modal shell         | 2a56300 | app/components/VoiceOverlay.tsx (new)   |

## Implementation Notes

### VoiceInterface changes
- `transitionTo` and `terminalState` are now optional (props interface). Inline callers continue to pass them; overlay callers omit them.
- `safeTransitionTo = transitionTo ?? (() => {})` ensures `useRealtimeVoice` always receives a callable.
- New `useEffect` (placed AFTER the waveform effect, per plan) auto-connects when `mode === 'overlay'` and tears down on unmount — guarantees no overlapping audio when the overlay is reopened.
- Close button only renders when `mode === 'overlay' && onClose`. Carries `data-overlay-close=""` so `VoiceOverlay` can `querySelector` it for focus management.

### VoiceOverlay
- Fixed full-viewport backdrop at `rgba(1,8,16,0.78)`, z-index 25, bottom-anchored panel.
- Panel: black bg, 1px gold border, gold glow + dark drop shadow, max-width 720px, rounded 6px, padded 18px.
- Backdrop `onClick={onClose}`; inner panel `e.stopPropagation()` so clicks inside don't dismiss.
- Focus management: stash `document.activeElement` on mount → `requestAnimationFrame` → focus `[data-overlay-close]` → restore opener on unmount.
- Animation: `kniPanelOpen 200ms ease-out both` (keyframes live in global stylesheet from earlier plans).

## Backward Compatibility

The existing inline call site (current `app/page.tsx`) is unaffected because:
- `mode` defaults to `'inline'` → no auto-connect, no close button.
- `transitionTo` was promoted from required to optional but the caller still passes it, so the runtime path is identical.

## Verification

- `bunx tsc --noEmit` → clean.
- `bunx eslint` on both files → 0 errors. One pre-existing warning (`terminalState defined but never used`) is unrelated to this plan and predates the changes.
- All inline grep checks in plan `<verify>` blocks pass.

## Deviations from Plan

None — plan executed exactly as written.

## Deferred Issues

- Pre-existing ESLint warning: `terminalState` destructured but unused in `VoiceInterface`. The prop is retained for backward compatibility with the inline call site and may be removed once Plan 10-08 retires the old terminal state machine.

## Self-Check: PASSED

- `app/components/VoiceInterface.tsx` — FOUND (modified)
- `app/components/VoiceOverlay.tsx` — FOUND (new)
- Commit a28fa4d — FOUND
- Commit 2a56300 — FOUND
