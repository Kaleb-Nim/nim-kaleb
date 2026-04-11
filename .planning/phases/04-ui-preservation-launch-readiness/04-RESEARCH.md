# Phase 4: UI Preservation + Launch Readiness - Research

**Researched:** 2026-04-11
**Domain:** Next.js App Router UI audit, CSS/animation verification, deployment readiness, accessibility
**Confidence:** HIGH

---

## Summary

Phase 4 is a verification-and-patch phase, not a greenfield build. All core UI components were built before Phase 1 began and have remained largely intact across Phases 1-3. The terminal window, macOS chrome, phosphor green text, starfield background, typewriter boot sequence, CognitiveStatus dashboard, and state machine (BOOTING → STATUS → MENU → PROCESSING → CONNECTING → VOICE_IDLE → VOICE_ACTIVE) are all present and the build passes clean.

Three concrete gaps exist between the current implementation and the design specification. First, `TerminalContent.module.css` sets `line-height: 1.4` where the design spec mandates `1.8`. Second, the content area uses `overflow: hidden` rather than `overflow-y: auto` — meaning once the VoiceInterface renders and the terminal content grows beyond its initial size, content clips instead of scrolling. Third, the `useTypewriter` hook does not implement `prefers-reduced-motion` — the design spec explicitly requires text to appear instantly when the user has reduced-motion enabled. These three items are the only divergences found between spec and implementation.

The transcript toggle (CONV-05) committed in Phase 03-02 (commit 99d56df) is **not present** in the current working branch (`feat/openai-realtime`). The SUMMARY document records the implementation, but that commit is absent from this branch's git history — it was executed in a separate worktree or on a different branch. VoiceInterface.tsx on this branch does not contain `showTranscript`, `aria-expanded`, or `.transcriptToggle`. This is a Phase 4 implementation gap, not a visual regression.

The Bun WS server (`ws-server/`) is configured for Railway deployment but `NEXT_PUBLIC_WS_SERVER_URL` in `.env.local` still points to `ws://localhost:8080`. The Vercel deployment needs this env var set to the production Railway URL before recruiters can use the site. This is the single launch-blocking item.

**Primary recommendation:** Fix the three CSS spec gaps, re-apply the transcript toggle (CONV-05), set the production WS URL on Vercel, then do a cross-viewport visual smoke check.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| UI-01 | Terminal-themed UI with macOS chrome preserved unchanged | All chrome components (TerminalHeader, Terminal.module.css, dots, fadeIn animation) are intact and match spec exactly. No changes needed unless line-height fix visually alters chrome height. |
| UI-02 | Starfield background and typewriter animations preserved | Starfield.tsx at 30fps cap with twinkling is correct. TypewriterLine + useTypewriter chain is intact. Gap: `prefers-reduced-motion` not implemented in useTypewriter. |
| UI-03 | State machine progression (BOOTING → STATUS → MENU → VOICE) preserved | Full state machine is in page.tsx with all transitions. No regressions detected. |
| UI-04 | Responsive layout (desktop/tablet/mobile) preserved | Terminal.module.css has 90vw → 95vw at 768px. CognitiveStatus.tsx has two-column → single-column at 768px. Both are correct. TerminalContent mobile font-size (0.75rem at <768px) is present. |
</phase_requirements>

---

## Current Implementation Audit

### What Exists and Matches the Design Spec [VERIFIED: codebase grep]

| Component | File | Spec Match |
|-----------|------|-----------|
| Terminal window | `Terminal.module.css` | max-width: 860px, width: 90vw, border-radius: 10px, black background, fadeIn 400ms ease-out at 200ms — all match |
| macOS header | `TerminalHeader.module.css` | height: 30px (30px via padding+height), dots 12px at correct colors (#FF5F56, #FFBD2E, #27C93F), centered title, Anonymous Pro font |
| Phosphor green text | `TerminalContent.module.css` | color: #00FF00, text-shadow with 4px/8px/16px green glow layers — matches spec exactly |
| Color system | `globals.css` | All 7 CSS variables match spec values verbatim |
| Font loading | `layout.tsx` | Anonymous Pro loaded via next/font/google with `--font-anonymous-pro` CSS variable, swap display |
| Starfield | `Starfield.tsx` | 30fps cap, 70 stars, twinkling via sin, 30% green tint, `#010810` background, resize handler |
| State machine | `page.tsx` + `useTerminalState.ts` | All 7 states typed; transitions BOOTING→STATUS→MENU→PROCESSING→CONNECTING→VOICE_IDLE→VOICE_ACTIVE wired via setTimeout chains |
| Typewriter | `TypewriterLine.tsx` + `useTypewriter.ts` | Character-by-character reveal at configurable speed, onComplete callback |
| CognitiveStatus | `CognitiveStatus.tsx` | Row-by-row 150ms animation, `white-space: pre` two-column alignment, 22-char left label padding, single-column fallback at <768px |
| Block cursor | `CommandInput.module.css` | █ cursor, `blink 1s step-end infinite`, `prefers-reduced-motion: reduce` disables animation |
| Responsive breakpoints | `Terminal.module.css`, `TerminalContent.module.css`, `CognitiveStatus.tsx` | 768px breakpoint for terminal width and status layout |
| Mobile font | `TerminalContent.module.css` | 0.75rem at <768px |

### Gaps Found (Implementation vs Design Spec) [VERIFIED: codebase grep]

| Gap | File | Current | Spec | Impact |
|-----|------|---------|------|--------|
| Line height | `TerminalContent.module.css` line 5 | `line-height: 1.4` | `1.8` | Text appears more compressed than designed; breaks the "generous for readability" intent |
| Scrollable content | `TerminalContent.module.css` line 11 | `overflow: hidden` | `overflow-y: auto` (scrollable area) | When VoiceInterface renders with transcript/response blocks, content clips instead of scrolling |
| Reduced motion | `useTypewriter.ts` | No `prefers-reduced-motion` check | Show text instantly | Fails accessibility requirement from spec; also the CLAUDE.md `globals.css` has the CSS rule for animations, but the JS interval fires regardless |
| CognitiveStatus line-height | `CognitiveStatus.module.css` line 15 | `line-height: 1.4` | `1.8` (inherited from content area) | Rows appear tighter than spec — this will auto-fix when TerminalContent line-height is corrected, since `statusLine` inherits |
| Transcript toggle | `VoiceInterface.tsx` | Not present | CONV-05 requires accessible toggle | The 03-02 plan says it was done, but the commit (99d56df) is not in this branch's history |

### Launch Blockers [VERIFIED: codebase grep + .env.local]

| Item | Current State | Required for Launch |
|------|--------------|---------------------|
| `NEXT_PUBLIC_WS_SERVER_URL` | `ws://localhost:8080` in .env.local | Must be `wss://[railway-url]` in Vercel environment variables |
| WS server deployed to Railway | `ws-server/` has `railway.json` and built `dist/index.js` | Must be actually deployed and accessible |
| DASHSCOPE_API_KEY on Railway | Unknown — not in .env.local | WS server needs DashScope credentials at runtime |

---

## Architecture Patterns

### Terminal State Machine (current, verified)
```
BOOTING → (welcomeComplete) → STATUS
STATUS   → (statusComplete)  → MENU
MENU     → (command === '1') → PROCESSING
PROCESSING → (800ms)         → CONNECTING
CONNECTING → (1400ms)        → VOICE_IDLE
VOICE_IDLE ↔ VOICE_ACTIVE    (managed by useRealtimeVoice via session.ready / disconnect)
```

The transitions are implemented as three separate `useEffect` hooks in `page.tsx` with `setTimeout` chains. No regression detected.

### Component Rendering Model (current, verified)

```
page.tsx (Home)
├── Starfield           — always rendered (z-index 0)
└── Terminal (z-index 1)
    ├── TerminalHeader  — always shown
    └── TerminalContent
        ├── TypewriterLine × 2       — always (welcome text)
        ├── [welcomeComplete] block  — cognitive management link
        ├── [state !== BOOTING]      — CognitiveStatus dashboard
        ├── [state === MENU]         — menu TypewriterLines + CommandInput
        ├── [state === PROCESSING]   — initiating message
        ├── [state === CONNECTING]   — ConnectingEllipsis
        └── [isVoiceState]           — VoiceInterface
```

### Responsive Layout (verified vs spec)

| Viewport | Terminal Width | Content Font | Status Layout |
|----------|---------------|--------------|---------------|
| Desktop > 1024px | 860px max-width | 0.82rem | Two-column (22-char padded labels) |
| Tablet 768-1024px | 90vw | 0.82rem | Two-column |
| Mobile < 768px | 95vw | 0.75rem | Single-column |

The 768px breakpoint implements correctly in both Terminal.module.css (width change) and CognitiveStatus.tsx (window resize handler with `setIsDesktop(window.innerWidth >= 768)`).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Google Fonts loading | Custom font-face declarations | `next/font/google` (already used) | Next.js handles preload, FOUT prevention, CSS variable injection |
| Reduced motion detection | Manual `matchMedia` in every component | `@media (prefers-reduced-motion: reduce)` CSS + single JS check in `useTypewriter` | CSS handles component animations (cursor blink already done); only the JS interval needs the JS check |
| Transcript toggle ARIA | Custom role management | Standard `aria-expanded` + `aria-controls` + `role="region"` pattern (was implemented in 03-02, needs re-apply) | Already designed and tested in the 03-02 work |
| Cross-viewport testing | Manual browser resize | Playwright `viewport` option per test | Existing playwright.config.ts is already set up |

---

## Common Pitfalls

### Pitfall 1: useTypewriter reduced-motion — JS vs CSS gap
**What goes wrong:** The cursor blink has `prefers-reduced-motion: reduce` in CSS and it works. But the typewriter runs a JS `setInterval` — CSS rules cannot stop JS timers. A visitor with reduced-motion enabled still gets the character-by-character reveal.
**Why it happens:** Developers handle CSS animations correctly but forget the JS path.
**How to avoid:** Add a `window.matchMedia('(prefers-reduced-motion: reduce)').matches` check at the start of the `useEffect` in `useTypewriter.ts`. If true, skip the interval and immediately set `displayedText = text` then fire `onComplete`.
**Warning signs:** If `globals.css` has the media query but it's purely targeting CSS `animation-duration` — which it does — the JS interval is unaffected.

### Pitfall 2: TerminalContent overflow-hidden clips VoiceInterface
**What goes wrong:** After VOICE_IDLE state renders VoiceInterface, the content grows: status line, waveform canvas (32px), connect button, transcript block, response block, hint line. With `overflow: hidden`, any content below the terminal's visual bottom is silently clipped.
**Why it happens:** During BOOTING/STATUS/MENU the terminal content is short enough that overflow doesn't matter. VoiceInterface is the first state where height becomes a real constraint.
**How to avoid:** Change `TerminalContent.module.css` to `overflow-y: auto` with a `max-height` set to allow the terminal's natural ~442px height while scrolling when content overflows.
**Warning signs:** Connect button or hint text invisible on small screens after connection.

### Pitfall 3: Line-height change cascades to two-column alignment
**What goes wrong:** Changing `line-height` from 1.4 to 1.8 in TerminalContent may cause CognitiveStatus rows to space differently. The `white-space: pre` formatting uses character widths, not line heights — but visual rhythm changes.
**Why it happens:** `line-height` is inherited and affects all child elements.
**How to avoid:** After fixing line-height, visually verify CognitiveStatus alignment still holds on desktop (characters still aligned at columns 23 and 40). The `pre` text itself will not shift horizontally but vertical spacing between rows will increase.

### Pitfall 4: NEXT_PUBLIC_WS_SERVER_URL must be set at build time
**What goes wrong:** `NEXT_PUBLIC_*` variables are inlined at Next.js build time, not at runtime. If Vercel builds without the variable set, the fallback `ws://localhost:8080` is baked in — and it's an unencrypted `ws://` URL that browsers will block on HTTPS pages (mixed content).
**Why it happens:** `NEXT_PUBLIC_` naming makes developers assume they're runtime variables because they're "public". They're still build-time.
**How to avoid:** Set `NEXT_PUBLIC_WS_SERVER_URL` in Vercel project settings (not just .env.local) before triggering the production build. Use `wss://` (TLS) not `ws://`.
**Warning signs:** Browser console shows "Mixed Content: The page at 'https://...' attempted to connect to 'ws://'" — this kills the entire voice feature silently.

### Pitfall 5: Transcript toggle missing from current branch
**What goes wrong:** The 03-02-SUMMARY.md documents the transcript toggle as complete, but commit 99d56df is not in `feat/openai-realtime` branch history. Current `VoiceInterface.tsx` (131 lines) has no `showTranscript` state, no `aria-expanded`, no `.transcriptToggle` CSS class.
**Why it happens:** The work was done in a worktree or on a different branch and never merged into this branch.
**How to avoid:** Re-apply the transcript toggle to `VoiceInterface.tsx` and `VoiceInterface.module.css` in this phase. The 03-02-SUMMARY documents exactly what to add — it is a known-good, tested implementation.

---

## Code Examples

Verified patterns from codebase:

### Fix: prefers-reduced-motion in useTypewriter
```typescript
// Source: useTypewriter.ts (current), plus globals.css prefers-reduced-motion pattern
export function useTypewriter({ text, speed = 30, onComplete }: TypewriterOptions) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!text) {
      setIsComplete(true);
      onComplete?.();
      return;
    }

    // Respect reduced motion — show text instantly
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setDisplayedText(text);
      setIsComplete(true);
      onComplete?.();
      return;
    }

    let currentIndex = 0;
    setDisplayedText('');
    setIsComplete(false);

    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsComplete(true);
        clearInterval(interval);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  return { displayedText, isComplete };
}
```

### Fix: TerminalContent overflow and line-height
```css
/* TerminalContent.module.css */
.content {
  padding: 24px;
  font-family: var(--font-anonymous-pro), monospace;
  font-size: 0.82rem;
  line-height: 1.8;          /* was 1.4 — spec requires 1.8 */
  color: var(--green-primary);
  text-shadow:
    0 0 4px rgba(0, 255, 0, 0.4),
    0 0 8px rgba(0, 255, 0, 0.2),
    0 0 16px rgba(0, 255, 0, 0.1);
  overflow-y: auto;           /* was hidden — allow scrolling when VoiceInterface grows content */
  max-height: 400px;          /* keeps terminal at ~442px total (30px header + 12px padding) */
}
```

### Transcript Toggle Pattern (from 03-02-SUMMARY)
```typescript
// Add to VoiceInterface.tsx — state
const [showTranscript, setShowTranscript] = useState(false);

// Replace always-visible response block with:
{status.responseText && (
  <>
    <button
      className={styles.transcriptToggle}
      aria-expanded={showTranscript}
      aria-controls="ai-transcript"
      onClick={() => setShowTranscript(p => !p)}
    >
      {showTranscript ? '[hide transcript]' : '[show transcript]'}
    </button>
    {showTranscript && (
      <div id="ai-transcript" role="region" aria-label="AI response transcript"
           className={styles.responseBlock}>
        <div className={styles.responseSentence}>
          {'  '}{status.responseText}
        </div>
      </div>
    )}
  </>
)}
```

---

## State of the Art

| Old Approach | Current Approach | Notes |
|--------------|------------------|-------|
| OpenAI Realtime API (pre-Phase 2) | Bun WS + DashScope ASR/LLM/TTS | This branch uses Bun WS; `main` branch uses a different HTTP-based approach |
| `useRealtimeVoice` using OpenAI WS | `useRealtimeVoice` using Bun WS | Current hook in this branch retains the name but implements DashScope pipeline |

**Architecture note:** Two architectures exist across branches. This branch (`feat/openai-realtime`, despite the misleading name) is the DashScope/Bun WS implementation that all Phase 1-3 work targets. The `main` branch contains a different HTTP-based voice pipeline (Groq STT + Modal TTS). Phase 4 work should stay on `feat/openai-realtime`.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Bun | Build and dev server | Yes | (runtime env) | — |
| Next.js 16 | Frontend framework | Yes | 16.0.10 | — |
| Playwright | Viewport smoke tests | Yes | 1.58.2 | — |
| Vercel CLI / project | Production deploy | Yes | project linked (.vercel/project.json) | — |
| Railway | Bun WS server hosting | Unknown — railway.json present, deployment status unverified | — | Must be verified before launch |
| DashScope API key on Railway | WS server runtime | Unknown — not in any checked env file | — | Must be set on Railway before launch |
| NEXT_PUBLIC_WS_SERVER_URL (Vercel) | Browser WS connection | Not set (localhost fallback only) | — | Blocks voice feature in production |

**Missing dependencies with no fallback:**
- `NEXT_PUBLIC_WS_SERVER_URL` on Vercel — voice feature dead in production without this
- Railway WS server deployment — voice feature dead if server is not live
- DashScope credentials on Railway — WS server crashes on first connection without these

---

## Open Questions

1. **Is the Bun WS server deployed to Railway?**
   - What we know: `ws-server/railway.json` exists and `dist/index.js` is built
   - What's unclear: Whether it has been deployed and is reachable at a Railway URL
   - Recommendation: Phase 4 must include a task to verify or deploy the Railway service and get the `wss://` URL

2. **What is the max-height for TerminalContent when VoiceInterface is visible?**
   - What we know: Design spec says ~442px total terminal height (variable). Header is 30px + 8px padding = ~46px. Content gets ~396px.
   - What's unclear: Whether the VoiceInterface content (status + canvas + button + transcript + hint) fits within 396px or needs to scroll
   - Recommendation: Set `max-height: 400px` with `overflow-y: auto` — the native scrollbar will appear only if content overflows, which is the correct UX

3. **Should the branch be merged to main before Vercel deployment?**
   - What we know: Vercel is linked to the project (`prj_26Zk2jxE6tNDTX1lDwmoGCr0qY4c`). The `main` branch has a different architecture.
   - What's unclear: Whether the recruiter-facing URL deploys from `main` or a specific branch
   - Recommendation: Treat this as a human decision — surface it explicitly in the launch checklist task

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Design spec `~442px` terminal height means `max-height: 400px` for content area (accounting for 30px header + padding) | Code Examples | If wrong, scrollbar appears too aggressively or content clips |
| A2 | Railway deployment needs DASHSCOPE_API_KEY env var (not a different name) | Environment Availability | If the ws-server uses a different env var name, the server silently fails |

---

## Sources

### Primary (HIGH confidence)
- `[VERIFIED: codebase]` — All component files read directly: Terminal.tsx, Terminal.module.css, TerminalContent.module.css, TerminalHeader.module.css, CognitiveStatus.tsx, CognitiveStatus.module.css, CommandInput.tsx, CommandInput.module.css, VoiceInterface.tsx, VoiceInterface.module.css, Starfield.tsx, TypewriterLine.tsx, useTypewriter.ts, useTerminalState.ts, useRealtimeVoice.ts, page.tsx, layout.tsx, globals.css
- `[VERIFIED: codebase]` — markokraemer-ui-design-spec.html inspected for spec values (line-height: 1.8, overflow: scrollable, 860px max-width, 442px height, breakpoints, prefers-reduced-motion requirement)
- `[VERIFIED: git log]` — Branch history confirmed: commit 99d56df (transcript toggle) absent from `feat/openai-realtime`; 03-02-SUMMARY was added at a0ba15f (docs only, no code commit)
- `[VERIFIED: codebase]` — .env.local confirms NEXT_PUBLIC_WS_SERVER_URL is localhost; railway.json confirms Railway target

### Secondary (MEDIUM confidence)
- `[ASSUMED]` — Railway deployment status (ws-server/railway.json exists, no external check performed on live URL)

---

## Metadata

**Confidence breakdown:**
- UI gap identification: HIGH — read every CSS file and component directly against the spec
- State machine correctness: HIGH — read all transitions in page.tsx and useTerminalState.ts
- Transcript toggle absence: HIGH — verified via git log, grep, and file inspection
- Launch blocker identification: HIGH — .env.local and railway.json read directly; NEXT_PUBLIC issue is a well-known Next.js behavior
- Railway live status: LOW — cannot verify without hitting the URL

**Research date:** 2026-04-11
**Valid until:** 2026-05-11 (stable stack, low churn expected)
