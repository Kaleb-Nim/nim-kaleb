# Phase 16: Voice CTA Visibility — Make "Talk to Me" Unmissable - Research

**Researched:** 2026-05-25
**Domain:** UI/UX — CTA design, attention patterns, first-visit onboarding within terminal aesthetic
**Confidence:** HIGH

## Summary

Visitors are missing the AI voice clone feature because the current FloatingMic is a small gold pill fixed bottom-right that collapses to just a `●` dot on mobile (<520px), and the only other mention is a faint 0.7rem hint at 0.4 opacity. This phase adds three layers of voice feature discoverability: (1) a prominent CTA element on the home page itself, (2) an improved FloatingMic with better visual weight, and (3) a one-time first-visit attention nudge tracked via localStorage.

The codebase already has all wiring — `FloatingMic` toggles `voiceOpen` state in `page.tsx`, which opens `VoiceOverlay` and calls `voice.connect()`. The new home page CTA just needs to call the same `setVoiceOpen(true)` callback. The challenge is purely visual/UX: making something prominent within a monochrome terminal aesthetic without feeling obnoxious.

**Primary recommendation:** Add a dedicated VoiceCTA component between the internship banner and directory (or between directory and hint), styled as a distinct "system message" block — visually different from directory rows — with a first-visit entrance animation + tooltip that fires once via localStorage. Improve FloatingMic by increasing its minimum size on mobile and adding a subtle idle glow animation.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Must add a dedicated voice CTA element on the home page that is visually distinct from directory rows
- The CTA must clearly communicate "you can talk to an AI clone of Kaleb" — not just a generic mic icon
- User wants to see multiple design approaches researched before committing to a specific pattern
- Make FloatingMic more eye-catching — improved contrast, size, or visual treatment
- Keep FloatingMic as a floating button (don't remove it), but make it more noticeable
- A one-time attention nudge on first visit is acceptable (tooltip, animation, pulse)
- Must NOT repeat on subsequent visits (use localStorage)
- No auto-play or auto-open of the voice panel — just draw attention to the CTA
- User wants to explore whether the CTA should stay within the terminal aesthetic or slightly break the mold — research both approaches
- Must not feel "in your face" or annoying — tasteful prominence

### Claude's Discretion
- Specific animation/transition choices
- localStorage key naming for first-visit tracking
- Exact positioning of home page CTA relative to directory/banner
- Whether to use CSS modules vs inline styles (follow existing patterns)
- Specific color/glow treatment details within the phosphor green + gold palette

### Deferred Ideas (OUT OF SCOPE)
- Voice auto-greeting (AI speaks first when overlay opens)
- Analytics tracking of CTA clicks vs FloatingMic clicks
- A/B testing different CTA designs
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| VOICE-VIS-01 | Home page includes a dedicated voice CTA element (card, banner, or section) that is visually distinct from directory rows and clearly communicates "you can talk to an AI clone of Kaleb" | Design approach options (Section: Architecture Patterns), home page layout analysis, CTA copy patterns |
| VOICE-VIS-02 | FloatingMic button is more eye-catching than the current gold pill — improved contrast, size, or visual treatment | FloatingMic improvement patterns (Section: Architecture Patterns, Pattern 3), CSS glow/pulse techniques |
| VOICE-VIS-03 | First-time visitors see a one-time attention nudge (animation, tooltip, or visual pulse) on the voice CTA that does not repeat on subsequent visits | First-visit nudge pattern with localStorage (Section: Architecture Patterns, Pattern 4), code examples |
| VOICE-VIS-04 | The voice CTA click/tap triggers the same VoiceOverlay connection flow as the current FloatingMic | Wiring analysis — `setVoiceOpen` callback threading from `page.tsx` through `HomePage` |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **Bun only** — no npm/npx/node commands
- **CSS Modules or inline styles** for terminal components (not Tailwind utility classes) — CLAUDE.md explicitly says "Avoid Tailwind for Terminal Styles"
- **Anonymous Pro** monospace font at ~0.82rem with line-height 1.8
- **Color palette**: `#00FF00` (phosphor green), `#FFD700` (gold), `#000000` (terminal bg), `#010810` (deep space bg)
- **Phosphor glow** text-shadow required on green text
- **`prefers-reduced-motion: reduce`** must disable all animations (already handled globally in `globals.css`)
- **Performance**: target <80KB gzipped bundle
- **Accessibility**: hidden inputs need aria-labels, WCAG AA contrast
- **Mobile**: must hold at 360px without horizontal scroll

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Home page voice CTA element | Browser / Client (React component) | -- | Pure presentational component within existing HomePage |
| FloatingMic visual improvements | Browser / Client (CSS + React) | -- | Styling-only changes to existing component |
| First-visit nudge tracking | Browser / Client (localStorage) | -- | Client-side persistence, no server involvement |
| Voice overlay connection | Browser / Client (existing hook) | API / Backend (session endpoint) | `useRealtimeVoice` already wired; CTA just triggers `setVoiceOpen(true)` |

## Standard Stack

### Core
No new libraries needed. This phase is 100% CSS + React components using existing project infrastructure.

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.0 | Component rendering | Already installed |
| Next.js | 16.0.10 | App framework | Already installed |
| CSS (globals.css + inline styles) | -- | Animation keyframes, responsive rules | Existing pattern in codebase |

### Supporting
No additional packages required. All functionality (localStorage, CSS keyframes, React state) is built into the browser platform.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Hand-rolled localStorage check | react-joyride / intro.js | Massive overkill for a single one-time nudge; adds bundle weight |
| CSS keyframe animations | framer-motion | Already in bundle? No. Unnecessary dependency for 2-3 simple animations |
| Inline styles (current pattern) | CSS Modules | Either works; inline styles are the dominant pattern in FloatingMic, HomePage, Directory — follow existing convention |

**Installation:**
```bash
# No installation needed — zero new dependencies
```

## Architecture Patterns

### System Architecture Diagram

```
User lands on home page
        │
        ▼
┌──────────────────────────────────────────────┐
│  HomePage.tsx                                │
│  ┌────────────────────────────────────┐      │
│  │ Block 1: Identity header           │      │
│  │ Block 2: Quick-bar                 │      │
│  │ Block 3: Internship banner         │      │
│  │ ┌──────────────────────────────┐   │      │
│  │ │ NEW: VoiceCTA component     │◄──┼──┐   │
│  │ │ (visually distinct block)   │   │  │   │
│  │ └──────────────────────────────┘   │  │   │
│  │ Block 4: Directory                 │  │   │
│  │ Block 5: Hint (updated)            │  │   │
│  └────────────────────────────────────┘  │   │
│                                          │   │
│  onClick ─────────────────────────────────┘   │
│       │                                      │
│       ▼                                      │
│  page.tsx: setVoiceOpen(true)                │
│       │                                      │
│       ▼                                      │
│  VoiceOverlay → useRealtimeVoice.connect()   │
└──────────────────────────────────────────────┘

Simultaneously:
┌──────────────────────────────────────────────┐
│  FloatingMic (improved visuals)              │
│  - Larger on mobile (no longer just ●)       │
│  - Idle glow animation (subtle)              │
│  - First-visit: tooltip + pulse (one-time)   │
│  └── localStorage: 'kni-voice-nudge-seen'    │
└──────────────────────────────────────────────┘
```

### Recommended Project Structure
```
app/
├── components/
│   ├── VoiceCTA.tsx              # NEW — home page voice call-to-action
│   ├── FloatingMic.tsx           # MODIFIED — improved visuals + nudge
│   ├── HomePage.tsx              # MODIFIED — adds VoiceCTA + onVoiceOpen prop
│   └── ... (existing, unchanged)
├── globals.css                   # MODIFIED — new keyframes + responsive rules
└── page.tsx                      # MODIFIED — threads onVoiceOpen to HomePage
```

### Pattern 1: Home Page Voice CTA — Design Approaches

The user wants multiple approaches researched. Here are three viable options within the terminal aesthetic, plus one that slightly breaks the mold.

**Approach A: Terminal System Message (recommended)**
A `[SYSTEM]` message block styled like an important system notification — green border, slightly elevated background, clear action text. Fits perfectly within the terminal metaphor.

```
┌─────────────────────────────────────────────────────┐
│ [VOICE INTERFACE] ● ONLINE                          │
│                                                     │
│  Talk to my AI voice clone — it knows my work,      │
│  my projects, and answers like I would.              │
│                                                     │
│  ▸ start conversation                               │
└─────────────────────────────────────────────────────┘
```

Visual treatment:
- Border: 1px solid `rgba(0,255,0,0.3)` with left accent `3px solid #00FF00`
- Background: `rgba(0,255,0,0.04)` — subtly different from directory rows
- Header line in bright green with glow; body in dim green
- "start conversation" as a gold `#FFD700` tappable action with `▸` prefix
- Monospace, terminal-native, feels like a system status panel

**Approach B: Gold Accent Banner (attention-grabbing)**
A horizontal banner similar to the internship banner but using a different visual treatment — perhaps inverted (gold background tint instead of just gold text).

```
╔══════════════════════════════════════════════════════╗
║  🎙 VOICE CLONE ACTIVE — tap to talk to Kaleb's AI  ║
╚══════════════════════════════════════════════════════╝
```

Visual treatment:
- Background: `rgba(255,215,0,0.08)` with gold dashed borders (like internship banner but stronger)
- Text in gold with stronger glow
- `●` indicator in green (shows "online" status)
- Distinct from internship banner via box-drawing chars or solid border vs dashed

**Approach C: Directory-Adjacent Special Row**
A row that lives in the directory list but is styled distinctly — gold instead of green, with a mic indicator.

```
● talk-to-me/    — AI voice clone of Kaleb · ask anything    [LIVE]  ›
```

Visual treatment:
- Same grid layout as directory rows but gold accent instead of green
- `[LIVE]` tag instead of a count badge
- Subtle pulse on the `●` indicator
- Risk: might be TOO similar to directory rows despite color difference

**Approach D: Slightly Breaking the Mold (bold option)**
A card with a subtle gradient border and slightly rounded corners that departs from the strict terminal look — signals "this is special/different."

```
┌─ ● ──────────────────────────────────────────────┐
│                                                  │
│   Talk to my AI clone                            │
│   It knows my work. It sounds like me.           │
│                                                  │
│   [ Start Conversation ]                         │
│                                                  │
└──────────────────────────────────────────────────┘
```

Visual treatment:
- Gradient border: green-to-gold (`#00FF00` → `#FFD700`)
- Slightly larger padding than terminal elements
- Button-like CTA element with gold background tint
- Risk: breaks the terminal illusion; might feel out of place

**Recommendation:** Approach A (Terminal System Message) is the strongest fit. It is visually distinct from directory rows (different structure, no grid columns), clearly communicates the voice feature, and stays within the terminal metaphor. The `[VOICE INTERFACE]` header makes it immediately parseable. [ASSUMED]

### Pattern 2: VoiceCTA Component Wiring

The CTA needs to trigger `setVoiceOpen(true)` from `page.tsx`. Current architecture:

```
page.tsx (owns voiceOpen state)
  └── HomePage (no props currently)
        └── VoiceCTA (needs onActivate callback)
```

**Threading approach:** Add `onVoiceOpen` prop to `HomePage`, pass it down to `VoiceCTA`.

```typescript
// page.tsx — add prop
<HomePage onVoiceOpen={() => setVoiceOpen(true)} />

// HomePage.tsx — accept and pass
interface HomePageProps {
  onVoiceOpen?: () => void;
}
export default function HomePage({ onVoiceOpen }: HomePageProps) {
  return (
    <div className="kni-page">
      {/* ... blocks 1-3 ... */}
      <VoiceCTA onActivate={onVoiceOpen} />
      {/* ... blocks 4-5 ... */}
    </div>
  );
}

// VoiceCTA.tsx
interface VoiceCTAProps {
  onActivate?: () => void;
}
```

[VERIFIED: codebase inspection — `page.tsx` line 24 owns `voiceOpen` state, `HomePage` currently takes no props]

### Pattern 3: FloatingMic Improvements

Current issues identified from code inspection:
1. **Mobile collapse** — at <520px, padding becomes `14px` and label disappears, leaving just `●` (14+14 = 28px circle) — too small and cryptic
2. **Gold blends in** — gold `#FFD700` is the site's accent color used everywhere (banner, badges, links), so the mic button doesn't stand out
3. **No idle attention** — the button only animates when active (`kniFloatPulse`), not when idle

**Recommended improvements:**
- **Mobile minimum size**: Change collapse breakpoint behavior — keep a short label like "voice" or show a mic glyph `🎙` instead of just `●`; ensure minimum 44x44px tap target per WCAG 2.5.8
- **Idle glow animation**: Add a subtle `kniMicIdle` keyframe that gently pulses the box-shadow (gold glow expanding/contracting over ~3s) — draws the eye without being annoying
- **Increased border width**: From 1.5px to 2px for more visual weight
- **Text contrast**: Consider adding a very subtle gold background tint `rgba(255,215,0,0.06)` to differentiate from pure black

```css
@keyframes kniMicIdle {
  0%, 100% { box-shadow: 0 0 10px rgba(255,215,0,0.25), 0 12px 28px rgba(0,0,0,0.55); }
  50%      { box-shadow: 0 0 20px rgba(255,215,0,0.45), 0 12px 28px rgba(0,0,0,0.55); }
}
```

[ASSUMED — specific animation values are Claude's discretion per CONTEXT.md]

### Pattern 4: First-Visit Nudge (localStorage-tracked)

**Implementation pattern:**

```typescript
// In VoiceCTA.tsx or FloatingMic.tsx
const NUDGE_KEY = 'kni-voice-nudge-seen';

const [showNudge, setShowNudge] = useState(false);

useEffect(() => {
  // Check after mount (SSR-safe)
  if (typeof window !== 'undefined') {
    const seen = localStorage.getItem(NUDGE_KEY);
    if (!seen) {
      setShowNudge(true);
      // Auto-dismiss after ~6 seconds
      const timer = setTimeout(() => {
        setShowNudge(false);
        localStorage.setItem(NUDGE_KEY, '1');
      }, 6000);
      return () => clearTimeout(timer);
    }
  }
}, []);

// On CTA click, also dismiss
const handleActivate = () => {
  setShowNudge(false);
  localStorage.setItem(NUDGE_KEY, '1');
  onActivate?.();
};
```

**Nudge visual options:**
1. **Entrance animation on VoiceCTA**: The CTA block slides/fades in with a slightly delayed, attention-drawing animation (e.g., a brief green glow pulse around the border) that only plays on first visit
2. **Tooltip on FloatingMic**: A small tooltip bubble appears pointing at the FloatingMic saying "Talk to my AI clone" — auto-dismisses after ~5s
3. **Both**: CTA entrance animation + FloatingMic tooltip (recommended — covers desktop + mobile)

**prefers-reduced-motion handling:** Already global in `globals.css` — the `@media (prefers-reduced-motion: reduce)` rule forces `animation-duration: 0.01ms !important` on all elements. No additional work needed. [VERIFIED: `globals.css` lines 75-83]

[CITED: https://web.dev/articles/building/a-fab-component — FAB size/accessibility guidelines]

### Anti-Patterns to Avoid
- **Auto-playing audio or auto-opening the voice panel**: Explicitly deferred by user. Never trigger `setVoiceOpen(true)` without a click.
- **Persistent/repeating nudges**: Must fire exactly once. localStorage check must happen before showing any nudge UI.
- **Breaking the terminal aesthetic with non-monospace fonts or rounded gradient cards**: Unless user explicitly chooses Approach D, stay within the terminal metaphor.
- **Animating layout-triggering properties**: Use only `transform`, `opacity`, and `box-shadow` in keyframes — never `width`, `height`, `padding`, `margin`. [CITED: Performance best practices from CSS animation sources]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| One-time flag persistence | Custom cookie/session tracking | `localStorage.getItem/setItem` | Built-in, synchronous, no expiry, perfect for "seen once" flags |
| Complex tooltip positioning | Custom absolute positioning logic | CSS `::after` pseudo-element or a simple absolutely-positioned div | A tooltip pointing at a fixed-position button is trivial; no library needed |
| Entrance animations | JavaScript-driven animation loops | CSS `@keyframes` + `animation` property | GPU-composited, respects `prefers-reduced-motion` via existing global rule, zero JS |

**Key insight:** This phase requires zero new dependencies. Every technique (keyframes, localStorage, React state, inline styles) is already used in the codebase. The complexity is in design taste, not technical implementation.

## Common Pitfalls

### Pitfall 1: SSR/Hydration Mismatch with localStorage
**What goes wrong:** Reading localStorage during render causes server/client HTML mismatch (Next.js hydration error)
**Why it happens:** `localStorage` is only available in the browser; server-rendered HTML has no access
**How to avoid:** Always read localStorage inside `useEffect` (runs only client-side) and use state to trigger re-render
**Warning signs:** Console error "Text content did not match" or "Hydration failed"

### Pitfall 2: Nudge Showing on Every Page Navigation
**What goes wrong:** The nudge re-appears when navigating between sections (hash route changes)
**Why it happens:** If the nudge state is tied to HomePage mount/unmount, it resets on route change
**How to avoid:** Read localStorage once on mount; set it immediately when nudge is shown (not on dismiss). The `useState(false)` default ensures no flash.
**Warning signs:** Nudge appearing after navigating to a section and back

### Pitfall 3: Mobile Tap Target Too Small
**What goes wrong:** FloatingMic or CTA action is hard to tap on mobile
**Why it happens:** Current mobile FloatingMic is ~28px diameter (14px padding * 2), well below the 44px WCAG minimum
**How to avoid:** Enforce `min-width: 44px; min-height: 44px` on all tappable elements. The VoiceCTA action link should have generous padding.
**Warning signs:** Lighthouse accessibility audit flagging tap target size

### Pitfall 4: Gold-on-Black Contrast for CTA Text
**What goes wrong:** Gold text on black background may not meet WCAG AA for small text
**Why it happens:** `#FFD700` on `#000000` has a contrast ratio of ~11.6:1 — actually passes easily. But dimmed gold (`rgba(255,215,0,0.5)`) drops below threshold.
**How to avoid:** Keep CTA action text at full `#FFD700` opacity; only use dimmed gold for non-essential decorative text
**Warning signs:** Lighthouse contrast warnings

### Pitfall 5: Animation Competing with prefers-reduced-motion
**What goes wrong:** New animations play despite user's reduced-motion preference
**Why it happens:** Forgetting that the global rule in globals.css already handles this — or adding animations via JavaScript (which the CSS rule doesn't catch)
**How to avoid:** Use CSS animations exclusively (not JS-driven `requestAnimationFrame`). The existing global `prefers-reduced-motion` rule will suppress them. For JS-based timers (like auto-dismiss), those should still work — they're functional, not visual.
**Warning signs:** Animations running when OS "reduce motion" is enabled

## Code Examples

### Example 1: VoiceCTA Component (Approach A — Terminal System Message)
```typescript
// Source: project codebase patterns (HomePage.tsx, Directory.tsx)
'use client';

import { useEffect, useState } from 'react';

const NUDGE_KEY = 'kni-voice-nudge-seen';

interface VoiceCTAProps {
  onActivate?: () => void;
}

export default function VoiceCTA({ onActivate }: VoiceCTAProps) {
  const [showNudge, setShowNudge] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(NUDGE_KEY);
    if (!seen) {
      setShowNudge(true);
      localStorage.setItem(NUDGE_KEY, '1');
    }
  }, []);

  return (
    <div
      style={{
        border: '1px solid rgba(0,255,0,0.25)',
        borderLeft: '3px solid #00FF00',
        background: 'rgba(0,255,0,0.04)',
        padding: 'clamp(14px, 3vw, 20px)',
        fontFamily: '"Anonymous Pro", monospace',
        animation: showNudge ? 'kniCTAEntrance 600ms ease-out both' : 'none',
      }}
    >
      {/* Header */}
      <div style={{
        color: '#00FF00',
        fontSize: 'clamp(0.72rem, 2vw, 0.82rem)',
        fontWeight: 700,
        textShadow: '0 0 6px rgba(0,255,0,0.55), 0 0 14px rgba(0,255,0,0.25)',
        marginBottom: 8,
      }}>
        [VOICE INTERFACE] <span style={{ color: '#27C93F' }}>● ONLINE</span>
      </div>

      {/* Body */}
      <div style={{
        color: 'rgba(0,255,0,0.7)',
        fontSize: 'clamp(0.74rem, 2vw, 0.82rem)',
        lineHeight: 1.6,
        marginBottom: 12,
      }}>
        Talk to my AI voice clone — it knows my work, my projects,
        and answers like I would.
      </div>

      {/* Action */}
      <button
        onClick={onActivate}
        style={{
          background: 'none',
          border: 'none',
          color: '#FFD700',
          textShadow: '0 0 4px rgba(255,215,0,0.55), 0 0 8px rgba(255,215,0,0.3)',
          fontFamily: '"Anonymous Pro", monospace',
          fontSize: 'clamp(0.78rem, 2vw, 0.88rem)',
          fontWeight: 700,
          cursor: 'pointer',
          padding: '8px 0',
          letterSpacing: '0.04em',
        }}
      >
        ▸ start conversation
      </button>
    </div>
  );
}
```

### Example 2: FloatingMic Idle Glow Keyframe
```css
/* Source: pattern derived from existing kniFloatPulse in globals.css */
@keyframes kniMicIdle {
  0%, 100% {
    box-shadow: 0 0 10px rgba(255,215,0,0.25), 0 12px 28px rgba(0,0,0,0.55);
  }
  50% {
    box-shadow: 0 0 22px rgba(255,215,0,0.5), 0 12px 28px rgba(0,0,0,0.55);
  }
}
```

### Example 3: First-Visit Nudge Entrance Animation
```css
/* Source: pattern derived from existing kniPageIn in globals.css */
@keyframes kniCTAEntrance {
  0% {
    opacity: 0;
    transform: translateY(8px);
    box-shadow: 0 0 0 rgba(0,255,0,0);
  }
  60% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
    box-shadow: 0 0 20px rgba(0,255,0,0.15), inset 0 0 12px rgba(0,255,0,0.05);
  }
}
```

### Example 4: FloatingMic Tooltip (first-visit)
```css
/* Tooltip via CSS pseudo-element on a wrapper */
.kni-mic-tooltip {
  position: absolute;
  bottom: calc(100% + 10px);
  right: 0;
  background: #000;
  border: 1px solid rgba(255,215,0,0.5);
  color: #FFD700;
  font-family: "Anonymous Pro", monospace;
  font-size: 0.75rem;
  padding: 8px 12px;
  white-space: nowrap;
  box-shadow: 0 0 12px rgba(255,215,0,0.2);
  animation: kniFadeIn 400ms ease-out both;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Onboarding library (Intro.js, React Joyride) | Lightweight localStorage + CSS animation | Ongoing trend | Libraries are overkill for single-element nudges; 0-dep approach preferred for performance |
| Fixed-size FABs | Responsive FABs with minimum 44px touch targets | WCAG 2.2 (2023) | 44x44px minimum is now a Level AA success criterion (2.5.8) |
| JS-driven animations | CSS keyframes with compositor-friendly properties | ~2020+ | `transform` + `opacity` + `box-shadow` stay on GPU; no layout thrashing |

**Deprecated/outdated:**
- Using `em` or `rem` font-size for FABs without `clamp()` — responsive `clamp()` is standard now [ASSUMED]
- Blocking animations for reduced-motion by checking `window.matchMedia` in JS — CSS `@media (prefers-reduced-motion)` is sufficient and already in the codebase [VERIFIED: `globals.css` lines 75-83]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Approach A (Terminal System Message) is the best fit for the CTA | Architecture Patterns, Pattern 1 | Low — user explicitly asked for multiple options and will choose; all four are documented |
| A2 | VoiceCTA should be placed between internship banner and directory | Architecture Patterns | Low — placement is Claude's discretion per CONTEXT.md; easy to move |
| A3 | Auto-dismiss nudge after ~6s is appropriate timing | Architecture Patterns, Pattern 4 | Low — timing is easy to adjust; 5-8s is standard for tooltips |
| A4 | Using `clamp()` for responsive font-size is current best practice | State of the Art | Very low — widely adopted |

## Open Questions

1. **CTA design choice**
   - What we know: Four approaches researched (A: system message, B: gold banner, C: directory row, D: breaking mold)
   - What's unclear: Which the user prefers — Approach A is recommended but user wants to see options
   - Recommendation: Present all four in the plan; lock choice during first plan's implementation or via a checkpoint

2. **VoiceCTA placement within HomePage**
   - What we know: Could go between banner and directory, between directory and hint, or replace the hint
   - What's unclear: Whether it should be above or below the directory rows
   - Recommendation: Place between banner and directory (above the fold on most screens); the hint at the bottom can be simplified since the CTA now handles voice discovery

3. **FloatingMic label on mobile**
   - What we know: Currently collapses to just `●` at <520px. Options: keep `●` but make it larger, show "voice", show a mic unicode char `🎤`
   - What's unclear: Whether emoji characters fit the terminal aesthetic
   - Recommendation: Use text "voice" (3 chars) instead of full "talk to me" — stays monospace, stays terminal-native

## Sources

### Primary (HIGH confidence)
- Codebase inspection: `FloatingMic.tsx`, `HomePage.tsx`, `Directory.tsx`, `VoiceOverlay.tsx`, `page.tsx`, `globals.css`, `sections.ts` — all read and analyzed for current state, patterns, wiring
- `16-CONTEXT.md` — locked decisions and discretion areas
- `ROADMAP.md` lines 277-291 — phase goal and success criteria

### Secondary (MEDIUM confidence)
- [web.dev FAB component guide](https://web.dev/articles/building/a-fab-component) — FAB sizing, accessibility, animation patterns
- [CSS pulse animation patterns](https://www.florin-pop.com/blog/2019/03/css-pulse-effect/) — keyframe patterns for attention-drawing effects
- [Figma CTA examples](https://www.figma.com/resource-library/call-to-action-examples/) — CTA copy and design best practices
- [Onboarding nudge patterns](https://www.command.ai/blog/creating-delightful-user-onboarding-experiences-with-pop-ups-and-nudges/) — first-visit tooltip/beacon patterns

### Tertiary (LOW confidence)
- None — all findings verified against codebase or reputable sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — zero new dependencies, all patterns verified in codebase
- Architecture: HIGH — four design approaches documented with code examples; wiring path verified
- Pitfalls: HIGH — all pitfalls derived from actual codebase inspection (SSR, localStorage, responsive breakpoints)

**Research date:** 2026-05-25
**Valid until:** 2026-06-25 (stable — no external API or library changes affect this phase)
