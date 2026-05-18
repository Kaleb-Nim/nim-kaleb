# Phase 10: Directory Home & Routing Shell — Context

**Gathered:** 2026-05-18
**Status:** Ready for planning
**Source:** User-supplied design kit + REQUIREMENTS.md (no /gsd-discuss-phase run)

<domain>
## Phase Boundary

Replace the linear BOOTING → STATUS → MENU → VOICE state machine in `app/page.tsx` with a hash-routed directory home that matches the Kebab Neural Interface design kit. After this phase:

- `/` renders the new home: identity header, quick-status link bar, internship banner, six tappable section rows, mobile affordance hint.
- Hash routing resolves `#/` → home, `#/work-experience` → (Phase 11 placeholder, stub OK), other section paths → "coming soon" stub page, anything else → 404.
- A floating "● talk to me" mic button is fixed bottom-right on every route and opens an overlay containing the existing `VoiceInterface` wired to the existing DashScope ASR → LLM → TTS pipeline (no regressions).
- The old typewriter boot, `CognitiveStatus`, and `CommandInput` flows are retired from the hero path. Voice access is one tap, not `1 ⏎`.

The work-experience page itself ships in **Phase 11**. Phase 10 only needs the route to resolve without error (a stub page is fine).

</domain>

<decisions>
## Implementation Decisions (LOCKED)

### Design source-of-truth

- The pristine JSX prototype at `.planning/research/v3-design-kit/` is the visual + behavioural contract. Port styles inline (the prototype already uses inline style objects) — no need to refactor to CSS modules unless an existing module already covers it.
- Reuse `colors_and_type.css` tokens (`--kni-green`, `--kni-gold`, `--kni-glow-green`, etc.) by porting the `:root` block into the project's global stylesheet. The existing `app/globals.css` is the right home.
- Phosphor green `#00FF00`, gold `#FFD700`, red `#FF4444`, bg `#010810`/`#000000`, Anonymous Pro font — all already in the project.

### Component layout

New components live under `app/components/`. Translate JSX → TSX, switch `window.X = ...` exports to ES module `export default` / named exports.

| New file | Source in design kit | Notes |
|---|---|---|
| `app/components/Directory.tsx` | `Directory.jsx` | DirRow component; uses `Link`-equivalent (hash anchor) |
| `app/components/FloatingMic.tsx` | `FloatingMic.jsx` | Bottom-fixed button |
| `app/components/VoiceOverlay.tsx` | `VoiceOverlay` in `index.html` | Wraps existing `VoiceInterface` — NOT the kit's fake `VoicePanel` |
| `app/components/HomePage.tsx` | `HomePage` in `index.html` | Identity header + quick-bar + banner + Directory + hint |
| `app/components/StubSectionPage.tsx` | new — coming-soon stub | Renders PageHeader-style header + "this section is being finalised" |
| `app/components/NotFoundPage.tsx` | `NotFoundPage` in `index.html` | Red SYSTEM 404 line |
| `app/components/PageHeader.tsx` | `pages.jsx` → `PageHeader` | Reused by stubs (and Phase 11's WorkPage) |
| `app/lib/sections.ts` | `index-data.jsx` → `LINKS`, `SECTIONS` | TS module, no `window.X` |
| `app/hooks/useHashRoute.ts` | `useHashRoute` in `index.html` | Returns the slug after `#/` |

### Existing components — reuse, do NOT delete in this phase

- `app/components/Starfield.tsx` — keep, render once at root
- `app/components/Terminal.tsx` + `TerminalHeader.tsx` + `TerminalContent.tsx` — keep, used as the outer chrome
- `app/components/VoiceInterface.tsx` + `app/hooks/useRealtimeVoice.ts` — keep, mount inside `VoiceOverlay`

### Files to retire from the home flow (but keep on disk)

- `app/components/CognitiveStatus.tsx` + `.module.css`
- `app/components/CommandInput.tsx` + `.module.css`
- `app/components/MobileVoiceButton.tsx` + `.module.css`
- `app/components/TypewriterLine.tsx`
- `app/hooks/useTerminalState.ts`
- `app/hooks/useTypewriter.ts`

These remain in the tree (do not delete) in case Phase 11 or future sections want them, but `app/page.tsx` no longer imports or renders them. Deletion can happen in a later cleanup quick task.

### Routing model

- Client-side hash routing. No Next.js App Router segments for sections in v3.0 — keeps the single-page terminal illusion and matches the kit prototype 1:1. `app/page.tsx` becomes the root that decides which inner component to render based on the hash.
- `useHashRoute()` hook listens to `hashchange`, parses the first segment, scrolls to top on change.
- Route map (Phase 10): `''` → `<HomePage />`, `'work-experience'` → `<StubSectionPage section={WORK_SECTION} />` (Phase 11 replaces this with `<WorkPage />`), `'syai-meetups' | 'hackathons' | 'sidequests' | 'hobbies' | 'links'` → `<StubSectionPage section={section} />`, anything else → `<NotFoundPage />`.
- Section IDs and paths come from `SECTIONS` in `index-data.jsx` — DO NOT rename them. The `id` field is the hash slug; `path` is what's shown in the URL/breadcrumb (`./work-experience`, `./syai-meetups`, etc.). `id === path` for all sections except `work` (id) vs `work-experience` (path). **Convention for v3.0:** use the `path` value as the hash slug (so `#/work-experience`, not `#/work`) to match `WORK-01` and the design kit's URL display. Update `SECTIONS` accordingly when porting.

### Voice overlay wiring

The kit's `VoicePanel.jsx` is a fake — its phases are simulated with `setTimeout`. **Do not port it.** Instead, `VoiceOverlay.tsx` wraps the existing `<VoiceInterface />` component (which already speaks to `useRealtimeVoice`) inside the same gold-bordered modal shell shown in `index.html`'s `VoiceOverlay` (`background: rgba(1,8,16,0.78)`, gold border, bottom-anchored).

`VoiceInterface` currently relies on a `terminalState` + `transitionTo` API tied to the retired state machine. Two options:

1. **Preferred:** Add an `overlay` mode to `VoiceInterface` that bypasses the state-machine props (use defaults: auto-connect on mount, allow disconnect via close button, fire `onClose` from parent). Driven by a new optional prop `mode: 'inline' | 'overlay'`.
2. Wrap: keep `VoiceInterface` untouched and pass synthetic `terminalState='VOICE_IDLE'` + a no-op `transitionTo`. This is acceptable if option 1 turns out to be invasive.

Either approach must preserve: proactive greeting, 20-turn memory, barge-in, ESC/backdrop close, no audio overlap when overlay opens twice.

### Reduced motion

Honor `prefers-reduced-motion: reduce` globally — disable `kniFadeIn`, `kniPanelOpen`, `kniPageIn`, `kniRecordPulse`, and `kniFloatPulse`. Already baked into the design kit's `.kni` block; just preserve it when porting tokens to `globals.css`.

### Accessibility

- Floating mic: `aria-label` toggles between "Open voice — talk to Kaleb's AI clone" and "Close voice panel".
- Directory rows: `<a href="#/...">` with native focus styling preserved.
- Overlay: dismiss via `Esc` key + backdrop click; focus moves to the close button on open; focus returns to the mic button on close.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design contract (pristine, do not edit)

- `.planning/research/v3-design-kit/SOURCE.md` — Index + scope notes
- `.planning/research/v3-design-kit/README.md` — Kit README
- `.planning/research/v3-design-kit/index.html` — Home page + router + overlay + 404
- `.planning/research/v3-design-kit/index-data.jsx` — `LINKS` (5 entries), `SECTIONS` (6 entries), `WORK_ITEMS` (4 entries)
- `.planning/research/v3-design-kit/Directory.jsx` — DirRow style + interactions
- `.planning/research/v3-design-kit/FloatingMic.jsx` — Floating CTA button
- `.planning/research/v3-design-kit/VoicePanel.jsx` — Visual shell only; voice wiring comes from existing `VoiceInterface`
- `.planning/research/v3-design-kit/Terminal.jsx` + `TerminalBody.jsx` + `Starfield.jsx` — reference only; existing project equivalents are kept
- `.planning/research/v3-design-kit/pages.jsx` — `PageHeader` + `FooterMeta` used by stubs (full `WorkPage` is Phase 11)
- `.planning/research/v3-design-kit/colors_and_type.css` — Token set to merge into `app/globals.css`

### Project context

- `.planning/REQUIREMENTS.md` — REQ-IDs HOME-01..05, ROUTE-01..03, VOICE-01..03, MIG-01..03
- `.planning/ROADMAP.md` — Phase 10 success criteria
- `CLAUDE.md` — project guidelines (Bun > npm, Tailwind 4, App Router, Anonymous Pro)
- `app/page.tsx` — current entry; will be largely rewritten in this phase
- `app/components/VoiceInterface.tsx` + `app/hooks/useRealtimeVoice.ts` — voice pipeline to reuse
- `app/components/Terminal.tsx` + `TerminalHeader.tsx` + `TerminalContent.tsx` — chrome to reuse
- `app/components/Starfield.tsx` — background to reuse
- `app/globals.css` — destination for the KNI token block

</canonical_refs>

<specifics>
## Specific Ideas

- Use the exact LINKS array from `index-data.jsx` (github, linkedin, email, cv, site) — `cv` href stays `'#'` until a real PDF is wired (a TODO comment is acceptable; not blocking this phase).
- Use the exact SECTIONS array from `index-data.jsx`. For the four "id !== path" sections, keep both fields — the design kit uses `path` in breadcrumbs/URLs and `id` for route matching. Decision above resolves this by using `path` as the hash slug.
- Internship banner copy is verbatim: "LOOKING FOR AI ENGINEERING INTERNSHIPS — STARTING AUG 2026". Only render on home (`route === ''`).
- Mobile affordance hint copy is verbatim: "‹ tap any row above to open a section · tap ● talk to me to chat with my voice clone ›".
- Stub section page should render `PageHeader` (so it feels first-class) + a short "this section is being finalised — check back soon" message + FooterMeta. Stay on-brand (phosphor green, gold accents). Direct visitors back to home.
- `app/page.tsx` becomes a thin `'use client'` root: starfield, terminal chrome, route dispatch, floating mic, overlay state. Heavy logic moves into the new components.

</specifics>

<deferred>
## Deferred Ideas

- Real implementations of `MeetupsPage`, `HackathonsPage`, `SidequestsPage`, `HobbiesPage`, `LinksPage` — v3.1+ (UIs still being finalised by Kaleb).
- `WorkPage` itself — Phase 11.
- Deleting retired components (`CognitiveStatus`, `CommandInput`, `MobileVoiceButton`, `TypewriterLine`, `useTerminalState`, `useTypewriter`) — kept in tree for now.
- Real CV PDF link wiring.
- Playwright tests for the new shell — happens after Phase 11 when the work page exists.

</deferred>

---

*Phase: 10-directory-home-routing-shell*
*Context gathered: 2026-05-18 (synthesized from user-supplied design kit, no /gsd-discuss-phase run per user "no clarifying questions" directive)*
