---
phase: 10-directory-home-routing-shell
reviewed: 2026-05-18T00:00:00Z
depth: standard
files_reviewed: 12
files_reviewed_list:
  - app/components/Directory.tsx
  - app/components/FloatingMic.tsx
  - app/components/HomePage.tsx
  - app/components/NotFoundPage.tsx
  - app/components/PageHeader.tsx
  - app/components/StubSectionPage.tsx
  - app/components/VoiceInterface.tsx
  - app/components/VoiceOverlay.tsx
  - app/globals.css
  - app/hooks/useHashRoute.ts
  - app/lib/sections.ts
  - app/page.tsx
findings:
  critical: 0
  warning: 6
  info: 7
  total: 13
status: issues
---

# Phase 10: Code Review Report

**Reviewed:** 2026-05-18
**Depth:** standard
**Files Reviewed:** 12
**Status:** issues_found

## Summary

Phase 10 introduces a hash-routed directory shell, a floating-mic CTA, and a voice overlay that wraps the existing `VoiceInterface`. The implementation is generally clean, mobile-first, and stays faithful to the design kit. No security defects or data-loss risks were observed.

However, there are several behavioural defects worth blocking on:

1. The route slug parser does not handle URL-encoded hashes or query-style suffixes, and silently ignores `aliases` from `SECTIONS` (so e.g. `#/work`, `#/meetups`, `#/cv` route to the 404 page even though aliases exist in the data model).
2. `VoiceOverlay` and `VoiceInterface` both call `disconnect()`/`onClose` on the same Escape key (page.tsx adds a global listener), creating a race where the overlay teardown effect runs while the parent has already unmounted it — see WR-04.
3. `useHashRoute` always calls `window.scrollTo` on `hashchange`, which fights browser back/forward scroll restoration and breaks anchor links (`#/work-experience#some-anchor`).
4. The home → section transition does NOT trigger the `kniPageIn` animation on initial home render because the home route bypasses the hashchange listener (initial mount only `setRoute`s, no scroll, no key change), and the `<HomePage>` always renders inside the same `<TerminalContent>` so React reuses the DOM — the page-in animation never restarts on navigation (no `key` prop on the page wrapper).

Stylistic concerns include inline-style proliferation that defeats the `globals.css` token system, missing keyboard-trap in the dialog, and a duplicated `:root` color block.

## Warnings

### WR-01: Hash router ignores section `aliases`

**File:** `app/hooks/useHashRoute.ts:5-9`, `app/page.tsx:31`
**Issue:** `SECTIONS` declares `aliases: ['work', 'experience', 'roles']`, `['meetups', 'syai']`, `['hacks', 'hackathon']`, etc., suggesting intentional alternate slugs. The router resolves only by `s.id === route`, so `#/work`, `#/meetups`, `#/hacks`, `#/cv` all fall through to `NotFoundPage` despite the data model promising they resolve. Either wire aliases in the lookup or delete the `aliases` field as dead schema.
**Fix:**
```ts
// app/page.tsx
const section = isHome
  ? null
  : SECTIONS.find((s) => s.id === route || s.aliases.includes(route));
```

### WR-02: `useHashRoute` clobbers in-page anchor + back/forward scroll restoration

**File:** `app/hooks/useHashRoute.ts:29-32`
**Issue:** Every `hashchange` calls `window.scrollTo({ top: 0, behavior: 'auto' })`. This (a) overrides the browser's native back/forward scroll restoration, (b) defeats deep links of the form `#/work-experience#role-id` if added later (the hook also throws away the second segment), and (c) fires even when the user clicks the same route they're already on (no diff guard).
**Fix:** Only scroll on a true route change, and skip when the hash carries a sub-anchor:
```ts
const handler = () => {
  const next = parseHash();
  setRoute((prev) => {
    if (prev !== next) window.scrollTo({ top: 0, behavior: 'auto' });
    return next;
  });
};
```

### WR-03: Hash parsing fails on URL-encoded or query-style segments

**File:** `app/hooks/useHashRoute.ts:5-9`
**Issue:** `parseHash` does no `decodeURIComponent`, so `#/work%2Dexperience` (some clipboard tools encode hyphens) routes to 404. It also does not strip query params (`#/work-experience?ref=foo`) — the `?` becomes part of the slug. Low-likelihood inputs, but trivial to harden.
**Fix:**
```ts
function parseHash(): string {
  if (typeof window === 'undefined') return '';
  const raw = (window.location.hash || '#/').replace(/^#\/?/, '');
  const seg = raw.split(/[/?#]/)[0] || '';
  try { return decodeURIComponent(seg); } catch { return seg; }
}
```

### WR-04: Double-teardown race between `VoiceOverlay` and global Escape handler

**File:** `app/page.tsx:21-28`, `app/components/VoiceOverlay.tsx:11-22`, `app/components/VoiceInterface.tsx:80-85`
**Issue:** When the user presses Esc:
1. The window-level listener in `Home` calls `setVoiceOpen(false)` → `<VoiceOverlay>` unmounts.
2. `VoiceOverlay`'s cleanup effect calls `previouslyFocusedRef.current?.focus?.()`, but the previously-focused element may be the `FloatingMic` button which has already re-rendered with `active=false` (label changes from `voice live` to `talk to me`) — focus restoration works, but the screen-reader announcement is now stale.
3. `VoiceInterface`'s `mode==='overlay'` effect runs cleanup → `disconnect()` while the overlay is unmounting.

Also: clicking the in-overlay `[ESC] close ✕` button calls `onClose` directly, which closes the overlay, but `VoiceInterface` is already inside the unmounted tree by the time its own cleanup fires — `disconnect` works but any pending `connect()` async chain may still resolve after teardown, with no abort signal.
**Fix:** Track an `abortController` inside `useRealtimeVoice.connect` and bail on every async checkpoint after disconnect. At minimum, guard `setStatus` calls with an `isMountedRef`.

### WR-05: Backdrop-click handler swallows clicks on transparent overlay padding

**File:** `app/components/VoiceOverlay.tsx:24-37`
**Issue:** The outer `<div role="dialog">` carries `onClick={onClose}`. If a screen reader user activates anywhere inside the dialog's padding region (`padding: '20px 16px calc(100px + safe-area)'`), it dismisses the dialog. More importantly, focusable elements inside the inner panel that bubble click to the backdrop (e.g. a future `<label>` clicked at its edge) will close the modal. Standard pattern is to put `onClick` on a sibling backdrop, not on the dialog container.
**Fix:** Split backdrop and dialog:
```tsx
<div style={{ position: 'fixed', inset: 0, zIndex: 25 }}>
  <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(1,8,16,0.78)' }} />
  <div role="dialog" aria-modal="true" ref={panelRef} style={{ position: 'relative', /* panel styles */ }}>
    <VoiceInterface mode="overlay" onClose={onClose} />
  </div>
</div>
```
Also: the dialog has no keyboard focus trap. Tab will move focus to the underlying `FloatingMic` button.

### WR-06: `kniPageIn` animation does not replay on route change

**File:** `app/page.tsx:39-46`, `app/globals.css:70`
**Issue:** Each page sets `className="kni-page"` with `animation: kniPageIn 220ms ... both`. Because React reuses the same DOM node when swapping `HomePage` → `StubSectionPage` (both occupy the same slot under `<TerminalContent>`), the CSS animation never restarts on navigation. The intended "type-in" feel only fires on first mount.
**Fix:** Add a `key` to force remount:
```tsx
<TerminalContent>
  <div key={route || 'home'}>
    {isHome ? <HomePage /> : section ? <StubSectionPage section={section} /> : <NotFoundPage />}
  </div>
</TerminalContent>
```

## Info

### IN-01: Duplicated `:root` color tokens

**File:** `app/globals.css:3-31`
**Issue:** Two parallel token sets (`--bg-deep` / `--kni-bg-deep`, `--green-primary` / `--kni-green`, etc.) declare the same hex values. Drift risk over time. Consolidate or alias one to the other.

### IN-02: Inline styles defeat the token system

**File:** `app/components/Directory.tsx`, `app/components/HomePage.tsx`, `app/components/PageHeader.tsx`, `app/components/StubSectionPage.tsx`, `app/components/NotFoundPage.tsx`, `app/components/FloatingMic.tsx`, `app/components/VoiceOverlay.tsx`
**Issue:** The CONTEXT.md decision was to port inline styles verbatim, so this is by design — but the project just installed `--kni-*` tokens in `globals.css` that are never referenced from these files. Hex colors and shadow strings are duplicated across 7 files. Suggest moving repeated values (`#00FF00`, the green glow, etc.) to `var(--kni-green)` / `var(--kni-glow-green)` so future palette tweaks are one-file changes.

### IN-03: `LINKS.map((l, i) => <span key={i} …>)` uses array index as key

**File:** `app/components/HomePage.tsx:48-53`
**Issue:** Index keys are fine here because the list is static, but using `l.label` is safer and more idiomatic.
**Fix:** `LINKS.map((l) => (<span key={l.label} …>`

### IN-04: External `<a>` quick-bar links missing `noopener`

**File:** `app/components/HomePage.tsx:51`
**Issue:** `rel="noreferrer"` implies `noopener` in modern browsers, but explicit `noopener` is the conventional pair. Low risk on this static site, but worth adding for defense-in-depth.
**Fix:** `rel="noopener noreferrer"`

### IN-05: Unused `Section.dense` and `Section.footer` on home directory

**File:** `app/lib/sections.ts:83-85`, `app/components/Directory.tsx`
**Issue:** `dense` is declared on Section but never read by any Phase 10 component (intended for Phase 11+). Fine to keep, but add a `// Phase 11+` comment or move to a `WorkSection` subtype to make the deferral explicit.

### IN-06: `WorkItem.logo` paths use relative `../../assets/...`

**File:** `app/lib/sections.ts:104, 113, 122, 131`
**Issue:** `'../../assets/logos/raid.png'` resolves relative to the file consuming it, which is unpredictable in Next.js — these strings will not work as `<img src=…>` from inside `app/components/`. Phase 10 doesn't render them yet, so this is latent until Phase 11. Use `/logos/raid.png` from `public/` instead.

### IN-07: `useRealtimeVoice` is passed a no-op `transitionTo`

**File:** `app/components/VoiceInterface.tsx:27-28`
**Issue:** `transitionTo: () => {}` is the "Option 2" wrap from the context doc, not the preferred Option 1 (proper `mode` plumbing in the hook). This works today but means any state-machine call inside `useRealtimeVoice` becomes a silent no-op — easy to miss when debugging. Add a `// TODO(phase-11): replace with mode-aware hook` comment so it shows up in greps.

---

_Reviewed: 2026-05-18_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
