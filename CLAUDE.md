# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Next.js 16 (App Router)** project recreating the markokraemer.com terminal-themed portfolio site. The site is a single-page React application that simulates a macOS-style terminal window floating on a starfield background, presenting a "Kortix Neural Interface" - a sci-fi themed personal portfolio.

**Tech Stack:**
- Next.js 16 with App Router
- React 19.2
- TypeScript
- Tailwind CSS 4
- Google Fonts: Anonymous Pro (monospace terminal font)

**Design Reference:** `markokraemer-ui-design-spec.html` contains the complete UI specification with exact measurements, colors, animations, and implementation guidance.

## Development Commands

```bash
# Development server (preferred: bun)
bun dev              # Runs on http://localhost:3000

# Production build
bun run build
bun start

# Linting
bun run lint
```

## Architecture & Key Concepts

### Visual Structure
The site has two primary layers:
1. **Starfield Background** (z-index: 0): Full viewport animated star field on `#010810` dark space
2. **Terminal Window** (z-index: 1): Centered floating terminal (`~860px` max-width, `~442px` height) with macOS-style chrome

### Terminal State Machine
The application follows a linear state progression:
```
BOOTING → STATUS → MENU → PROCESSING → CONNECTING → VOICE_IDLE → VOICE_ACTIVE
```

Each state triggers specific animations and user interactions. The typewriter effect is central to the experience.

### Component Architecture (Recommended)
```
app/
├── page.tsx                      # Root page - renders Starfield + Terminal
├── components/
│   ├── Starfield.tsx             # Canvas-based star background with twinkling
│   ├── Terminal.tsx              # Main terminal window frame
│   ├── TerminalHeader.tsx        # macOS title bar with traffic light dots
│   ├── TerminalContent.tsx       # Scrollable content area
│   ├── TypeWriter.tsx            # Character-by-character text reveal
│   ├── CognitiveStatus.tsx       # Two-column status dashboard
│   ├── CommandInput.tsx          # Hidden input + blinking cursor
│   └── VoiceInterface.tsx        # Post-connection voice UI
└── hooks/
    ├── useTypewriter.ts          # Typewriter animation logic
    └── useTerminalState.ts       # State machine for terminal phases
```

## Critical Design Requirements

### Color System (Strict Palette)
- **Page Background**: `#010810` (deep space)
- **Terminal Background**: `#000000` (pure black)
- **Terminal Header**: `#333333` (dark gray)
- **Primary Text**: `#00FF00` (phosphor green with glow)
- **Highlights/Links**: `#FFD700` (gold yellow)
- **Input Text**: `#FFFFFF` (white)
- **macOS Dots**: Red `#FF5F56`, Yellow `#FFBD2E`, Green `#27C93F`

### Typography
- **Font**: `Anonymous Pro` (Google Fonts, monospace)
- **Size**: `~0.82rem` (`~13px`) for terminal text
- **Line Height**: `1.8` (generous for readability)
- **Critical**: Text must use `#00FF00` with phosphor glow effect:
  ```css
  text-shadow: 0 0 4px rgba(0, 255, 0, 0.4),
               0 0 8px rgba(0, 255, 0, 0.2),
               0 0 16px rgba(0, 255, 0, 0.1);
  ```

### Monospace Alignment
The "Cognitive Status" dashboard uses precise character-width alignment:
- Left column labels: padded to 22 characters
- Values start at character 23
- Right column starts around character 40
- Use `white-space: pre` or exact `&nbsp;` counting

### Animation Sequence
1. **0ms**: Starfield renders
2. **~200ms**: Terminal fades in (opacity 0→1, 400ms ease-out)
3. **~600ms**: Welcome text typewriter starts (~20-40ms per character)
4. **~2s**: Cognitive Status dashboard types row-by-row
5. **~4s**: Menu appears, cursor blinks, input enabled
6. **User Input**: "1" + Enter triggers "Connecting..." with animated ellipsis

### Cursor Implementation
- Block cursor: `█` (U+2588)
- Blinking: `1s` step-end infinite animation
- Color: `#FFFFFF` (white)

### Responsive Behavior
- **Desktop (>1024px)**: Fixed `~860px` terminal, centered
- **Tablet (768-1024px)**: `~90vw` terminal width
- **Mobile (<768px)**: `~95vw`, consider horizontal scroll or single-column fallback for two-column data

## Important Implementation Notes

1. **Avoid Tailwind for Terminal Styles**: The terminal component has too many custom CSS properties (text-shadow, precise spacing). Use CSS Modules or styled-components.

2. **Font Loading**: Preload Anonymous Pro via `<link rel="preload">` to prevent FOUT on the typewriter effect.

3. **Performance**:
   - Starfield: Use `requestAnimationFrame`, cap at 30fps
   - Typewriter: Batch DOM updates to avoid per-character reflows
   - Target bundle: <80KB gzipped

4. **Accessibility**:
   - Hidden input needs `aria-label="Terminal command input"`
   - Respect `prefers-reduced-motion` - disable typewriter, show text instantly
   - Green on black passes WCAG AA contrast

5. **Window Chrome Dots**: The macOS traffic light dots are decorative only (no click handlers by default). Consider adding hover effects for polish.

6. **Voice Interface**: The "Activate Voice Interface" option connects to an actual AI voice service (Kortix). The connection state may involve real API calls.

## Terminal Content Text

The exact welcome message and status dashboard content is specified in the design doc. Key narrative elements:
- **Operating Model**: `marko-kraemer-400b-0706`
- **OS Version**: `Kortix 10.24 (Elaborate Mind Edition)`
- **Management URL**: `https://app.kortix.ai`

## Path Aliases
Use `@/*` for imports (e.g., `@/components/Terminal`).

## Current Project State
This is a fresh Next.js installation with default template files. The layout currently uses Geist fonts - these need to be replaced with Anonymous Pro per the design spec.

<!-- GSD:project-start source:PROJECT.md -->

## Project

**Kaleb's AI Voice Portfolio**

A terminal-themed personal portfolio website where visitors interact with an AI voice clone of Kaleb. Instead of reading a static resume, visitors have a real-time voice conversation with an AI that speaks in Kaleb's cloned voice, answering questions about his achievements, experience, and projects as if Kaleb himself is talking. Built on Next.js with a sci-fi "Kortix Neural Interface" terminal UI.

**Core Value:** Visitors can have a natural, human-sounding voice conversation with an AI clone of Kaleb that authentically represents his experience and personality.

### Constraints

- **Provider**: Alibaba Cloud for entire voice pipeline (STT + LLM + TTS)
- **TTS Model**: Qwen3-TTS with voice cloning capability
- **Speech Quality**: Must sound conversational, not robotic
- **Backward Compatibility**: Terminal UI and state machine must remain intact
- **Runtime**: Bun (not npm/node)

<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->

## Technology Stack

## Languages

- TypeScript 5 - All source code, type-safe application development
- JavaScript - Build configuration and tooling
- CSS - Styling via Tailwind CSS 4
- HTML - Template structure in Next.js

## Runtime

- Bun - JavaScript/TypeScript runtime and package manager (primary for development and ws-server)
- Node.js 20+ - Compatible (via Vercel hosting environment for Next.js frontend)
- Bun (primary)
- Lockfile: `bun.lock` (present, 105KB)

## Frameworks

- Next.js 16.0.10 (App Router) - Full-stack React framework with API routes, deployed to Vercel
- React 19.2.0 - UI component library
- React DOM 19.2.0 - React rendering for DOM
- Tailwind CSS 4 - Utility-first CSS framework
- PostCSS 4 - CSS processing pipeline (`@tailwindcss/postcss`)
- Playwright 1.58.2 - E2E testing framework
- `@playwright/test` - Test runner and assertions
- ESLint 9 - Code linting (flat config format)
- ESLint Config Next 16.0.1 - Next.js-specific linting rules
- TypeScript 5 - Type checking and compilation
- Bun - HTTP server + WebSocket runtime for `ws-server/` (deployed to ECS)

## Key Dependencies

- openai 6.32.0 - OpenAI-compatible SDK client pointed at DashScope LLM (`ws-server/src/dashscope/llm.ts`)
- @neondatabase/serverless 1.1.0 - PostgreSQL serverless connection (Neon)
- drizzle-orm 0.45.2 - Type-safe database ORM
- drizzle-kit 0.31.10 - Database migration and schema management tools
- @vercel/analytics 2.0.1 - Vercel analytics SDK for frontend monitoring
- @anthropic-ai/sdk 0.78.0 - Anthropic Claude SDK (installed but not currently used)
- @types/node 20 - Node.js type definitions
- @types/react 19 - React type definitions
- @types/react-dom 19 - React DOM type definitions
- @types/bun 1.3.14 - Bun runtime type definitions
- baseline-browser-mapping 2.10.16 - Browser compatibility mappings

## Configuration

- `tsconfig.json` - Strict mode enabled, ES2017 target, bundler module resolution, path aliases (`@/*`)
- `tsconfig.tsbuildinfo` - Incremental build cache
- `next.config.ts` - Next.js configuration, microphone permission headers, NEXT_PUBLIC_LAST_SYNC env injection
- `eslint.config.mjs` - ESLint flat config extending Next.js core-web-vitals and TypeScript rules
- `postcss.config.mjs` - PostCSS configuration with Tailwind plugin
- `playwright.config.ts` - Playwright test runner (30s timeout, local server at http://localhost:3000)
- `drizzle.config.ts` - Schema location (`lib/schema.ts`), PostgreSQL dialect, DATABASE_URL connection
- `.vercel/project.json` - Vercel project metadata (projectId, orgId)
- `.vercelignore` - Excludes ws-server, tts-server, tests, assets, .planning/ from Vercel builds
- `.env.local` file present (contains secrets - DASHSCOPE_API_KEY, DASHSCOPE_VOICE_ID, DATABASE_URL, NEXT_PUBLIC_WS_SERVER_URL, OPENAI_API_KEY)
- No explicit Node/Bun version pinning in package.json

## Platform Requirements

- Bun runtime environment
- macOS/Linux/Windows with Node.js-compatible shell
- TypeScript compiler (via devDependencies)
- Playwright Chromium binary (installed via `bunx playwright install chromium`)
- Vercel hosting platform (Next.js frontend: nim-kaleb.vercel.app)
- Amazon ECS (Bun ws-server: wss://ws.kalebnim.dev)
- Neon PostgreSQL serverless database
- Alibaba Cloud DashScope API access (STT, LLM, TTS)

## Scripts

- `bun dev` - Run Next.js dev server on http://localhost:3000
- `bun run sync-context` - Sync context (custom build script)
- `bun run build` - Build Next.js production bundle
- `bun start` - Start Next.js production server
- `bun test` - Run Playwright tests
- `bun test:headed` - Run Playwright tests with browser UI
- `bun run lint` - Run ESLint on codebase
- `drizzle-kit push` - Push schema changes to database
- `drizzle-kit generate` - Generate migration files

## Path Aliases

- `@/*` maps to project root (e.g., `@/app`, `@/components`, `@/hooks`, `@/lib`)

<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

## Naming Patterns

- Components: PascalCase with `.tsx` extension (e.g., `Terminal.tsx`, `CommandInput.tsx`, `CognitiveStatus.tsx`)
- Hooks: camelCase with `use` prefix and `.ts` extension (e.g., `useHashRoute.ts`, `useRealtimeVoice.ts`, `useTypewriter.ts`)
- CSS Modules: Component name + `.module.css` (e.g., `CommandInput.module.css`, `CognitiveStatus.module.css`)
- Utility/library files: camelCase (e.g., `hackathonLinks.ts`, `sections.ts`, `workStatus.ts`)
- Test files: same as source + `.test.ts` or `.spec.ts` (e.g., `hackathonLinks.test.ts`, `ws-pipeline.spec.ts`)
- API routes: nested directories matching route structure (e.g., `app/api/analytics/route.ts`)
- React components: PascalCase (e.g., `CommandInput`, `CognitiveStatus`, `FloatingMic`)
- Hooks: camelCase with `use` prefix (e.g., `useHashRoute`, `useRealtimeVoice`, `useTerminalState`)
- Regular functions: camelCase (e.g., `parseHash`, `dedupeKey`, `classifyHost`)
- Event handlers: `handle{EventName}` pattern (e.g., `handleKeyDown`, `handleContainerClick`, `handleCommand`)
- Helper functions: camelCase with descriptive action verbs (e.g., `navigateTo`, `classifyHackathonLinks`, `glyphFor`)
- React state: camelCase (e.g., `inputValue`, `visibleRows`, `isDesktop`)
- Refs: camelCase with `Ref` suffix (e.g., `wsRef`, `audioCtxRef`, `processorRef`, `playGenRef`)
- Booleans: `is{Property}` or `has{Property}` prefix (e.g., `isDesktop`, `isComplete`, `intentionalCloseRef`)
- Constants: UPPER_SNAKE_CASE when truly constant (e.g., `MIC_SAMPLE_RATE`, `PLAYBACK_SAMPLE_RATE`, `WS_SERVER_URL`)
- Audio conversion functions: descriptive patterns like `pcm16ToFloat32`, `float32ToPcm16Base64`
- Interfaces: PascalCase, `Props` suffix for component props (e.g., `CommandInputProps`, `CognitiveStatusProps`, `RealtimeStatus`)
- Type aliases: PascalCase (e.g., `TerminalState`, `RealtimePhase`, `HackathonLinkLabel`)
- Discriminated union types: Use `type` for union literals (e.g., `type RealtimePhase = 'idle' | 'connecting' | 'listening' | 'responding' | 'error'`)

## Code Style

- Indentation: 2 spaces (standard Next.js)
- No Prettier in use (rely on ESLint rules for enforcement)
- Line length: No strict limit enforced
- Semicolons: Always included (ESLint enforces)
- Tool: ESLint 9 with flat config format
- Config file: `eslint.config.mjs` (root level)
- Extends: `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Key rules enforced:
- **Known issue:** ESLint currently exits with code 1 (~492 problems). Root causes:

## Import Organization

- `@/*` maps to project root: `@/app`, `@/components`, `@/hooks`, `@/lib`
- Used consistently across all files for imports above same-directory level
- Example: `import { useHashRoute } from '@/app/hooks/useHashRoute'`

## Error Handling

- Try-catch blocks wrap async operations and JSON parsing (e.g., in `useRealtimeVoice.ts`, `ws-pipeline.spec.ts`)
- Error messages propagated to component state for UI display: `setStatus(prev => ({ ...prev, error: msg }))`
- Type narrowing for error objects: `err instanceof DOMException ? err.name : err instanceof Error ? err.message : String(err)`
- Specific error handling for known error cases:
- Error recovery includes cleanup of resources:
- Silent failures acceptable only for fire-and-forget operations (e.g., analytics posts): `.catch(() => {})`

## Logging

- Labeled logs with metadata prefixes in brackets for context: `[ws]`, `[session]`, `[stt]`, `[ui]`, `[location]`
- Example: `console.log('[ws] session ${sessionId} connected')`
- Used primarily in test files for visibility of test execution: `console.log('[ui] STATUS reached')`
- ws-server logging: uses same bracket pattern in main module, plus structured logging in `logger.ts` for turn analysis
- Debug info logged only in tests; production code avoids verbose logging
- Console logs in test files only, not in production components
- Exception: internal helper logs in hooks (minimal, bracket-prefixed)
- Logger module: `ws-server/src/logger.ts` provides `logTurn()` for structured NDJSON logging of conversation turns
- Session latency tracking: captures ASR time, LLM TTFT, TTS TTFA, total turn time
- Console logs with bracket prefixes in `index.ts` and `session.ts` for WebSocket lifecycle events

## Comments

- Complex algorithmic sections (e.g., audio processing in `useRealtimeVoice.ts`)
- State machine transitions and logic flow
- Non-obvious setup requirements (e.g., platform-specific gotchas)
- Deviations from standard patterns (e.g., why a rule is disabled)
- Function-level JSDoc blocks for exported hooks and utilities
- Example from `useHashRoute.ts`:
- Type documentation in interfaces for complex fields
- Comments for non-obvious parameter behavior
- Inline comments for sections use `── ` separator (visual clarity in longer functions)
- Comments explain "why" not "what" (code is what; comments are context)
- Keep comments concise; rarely exceed 1-2 sentences

## Function Design

- Custom hooks: typically 50-350 lines including complex logic (`useRealtimeVoice.ts` = 338 lines with full audio pipeline)
- Components: typically 50-150 lines (e.g., `CommandInput.tsx` = 50 lines, `CognitiveStatus.tsx` = 80+ lines)
- Utility functions: 10-50 lines for pure logic (e.g., `classifyHackathonLinks` = 29 lines)
- Props passed via object interfaces rather than multiple parameters
- Optional callbacks passed via interface: `onComplete?: () => void`
- Options objects for hook configuration: `{ transitionTo, ... }` passed to hooks
- Hooks return objects with multiple named properties for clarity: `{ status, isConnected, connect, disconnect }`
- Component functions return JSX (implicit React.ReactElement)
- Pure functions return typed data structures: `Float32Array<ArrayBuffer>`, `HackathonLink[]`
- Event handlers return `void`

## Module Design

- React components use default export: `export default function Terminal(...)`
- Hooks use named export: `export function useHashRoute(): string`
- Types use named export: `export type RealtimePhase = ...`, `export interface RealtimeStatus { ... }`
- Pure utility functions use named export: `export function classifyHackathonLinks(...)`
- Single default export per component file; additional types/interfaces co-located in same file
- Not used in this codebase; components imported directly from their files

## Async Patterns

- Async state updates wrapped in `setStatus(prev => ({ ...prev, ... }))` for immutability
- Avoid updating state during async operations without checking mounted state
- Callback dependencies properly tracked in `useEffect` and `useCallback`
- Dependency arrays always include all captured variables (enforced by ESLint)
- Cleanup functions always returned from `useEffect` (prevents memory leaks)
- Examples: clearTimeout, removeEventListener, WebSocket.close()

## React-Specific Patterns

- `'use client'` directive at top of all interactive components
- Consistent use of `useState`, `useRef`, `useEffect`, `useCallback`
- Interfaces define all component props with optional props using `?`
- Children components use `ReactNode` type
- Rarely used; component composition favors explicit props
- `useCallback` for event handlers to prevent unnecessary re-renders
- `useRef` for mutable state that doesn't trigger re-renders (DOM refs, WebSocket refs, timers)
- `useEffect` with proper cleanup for side effects
- Dependency arrays always specified (ESLint enforces)
- TypeScript strict mode enabled
- Explicit return types on exported functions and hooks
- Type narrowing for error handling (instanceof checks)

## Directory Structure Conventions

- Components live in `app/components/` — all interactive UI
- Hooks live in `app/hooks/` — all custom hooks
- Utilities live in `app/lib/` — pure functions, data, types
- CSS Modules co-located with components: `ComponentName.tsx` + `ComponentName.module.css`
- API routes in `app/api/` following Next.js route structure
- Source in `ws-server/src/` — TypeScript entry point at `index.ts`
- DashScope integration in `ws-server/src/dashscope/`
- Build output ignored at `ws-server/dist/` (never commit)
- Logger and types co-located with main module
- Separate conventions from Next.js app: more imperative, Bun-native

<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

## System Overview

```text

```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Frontend App | Multi-section terminal UI, hash routing, voice overlay control | `app/page.tsx` |
| Voice Connection | WebSocket management, audio I/O, session lifecycle | `app/hooks/useRealtimeVoice.ts` |
| Hash Router | URL-to-section mapping, navigation state | `app/hooks/useHashRoute.ts` |
| WebSocket Server | Session orchestration, DashScope pipeline coordination | `ws-server/src/index.ts`, `ws-server/src/session.ts` |
| ASR Integration | Speech-to-text via DashScope Qwen3 | `ws-server/src/dashscope/asr.ts` |
| LLM Integration | Conversational reasoning via qwen-plus | `ws-server/src/dashscope/llm.ts` |
| TTS Integration | Voice synthesis with Kaleb's voice clone | `ws-server/src/dashscope/tts.ts` |
| Analytics API | Session tracking and transcript logging | `app/api/analytics/session/route.ts`, `app/api/analytics/transcript/route.ts` |

## Pattern Overview

- WebSocket-based real-time bidirectional communication (browser ↔ ws-server)
- Server-side secrets management (DashScope API keys never reach browser)
- Streaming audio/text for low-latency voice interactions
- Optional analytics persistence (graceful degradation if DATABASE_URL unset)
- Hash-based SPA routing for multi-section navigation
- Canvas-based starfield visual layer with React terminal UI overlay

## Layers

- Purpose: Render multi-section terminal UI, capture user input, manage voice overlay
- Location: `app/`
- Contains: React components, hooks, Next.js pages and API routes
- Depends on: WebSocket server, Web Audio API, Neon database (optional)
- Used by: Web browsers via Vercel CDN
- Purpose: Coordinate DashScope voice pipeline, maintain session state, route audio/text
- Location: `ws-server/src/`
- Contains: Bun HTTP/WebSocket server, DashScope client libraries, session manager
- Depends on: OpenAI SDK (for DashScope compatible-mode API), DashScope cloud service
- Used by: Browser clients via `NEXT_PUBLIC_WS_SERVER_URL`
- Purpose: Abstract DashScope ASR, LLM, and TTS APIs behind unified interfaces
- Location: `ws-server/src/dashscope/`
- Contains: Three WebSocket clients (ASR, TTS) and one REST client (LLM compatible-mode)
- Depends on: Alibaba Cloud DashScope services, OpenAI SDK
- Used by: Session orchestrator in ws-server
- Purpose: Store analytics events (session lifecycle, conversation transcripts)
- Location: `lib/db.ts`, `lib/schema.ts`, `app/api/analytics/`
- Contains: Drizzle ORM, Neon Postgres schema, analytics endpoints
- Depends on: Neon Postgres (optional, fire-and-forget if unavailable)
- Used by: Browser client and ws-server for async logging

## Data Flow

### Primary Voice Interaction Path

### Multi-Turn Conversation State

- `Session.conversationHistory` capped at 20 entries (10 user, 10 assistant turns)
- History maintained across voice session lifetime
- On new transcript, prior context passed to LLM for coherent responses
- Barge-in triggers `AbortController` to cancel in-flight LLM+TTS and restart

### Navigation and Page Rendering

- Voice connection state: `useRealtimeVoice()` hook manages status (idle, connecting, listening, responding, error)
- Navigation state: `useHashRoute()` hook manages current section from URL hash
- Voice overlay visibility: `voiceOpen` state in root `app/page.tsx`
- Typewriter animation: `useTypewriter()` hook for character-by-character reveals (legacy, less used in multi-page views)

## Key Abstractions

- Purpose: Encapsulate bidirectional communication between browser and ws-server
- Examples:
- Pattern: Type-discriminated union for all messages
- Purpose: Coordinate three separate WebSocket clients (ASR, TTS) and one REST client (LLM) as a cohesive voice interaction
- Examples: Session.startResponse(), scheduleAudioChunk()
- Pattern: Callback-driven event emission and AbortController for cancellation
- Purpose: Hide implementation details of three separate DashScope APIs behind callback-based interfaces
- Examples: `createAsrSession()`, `streamLlmResponse()`, `createTtsSession()`
- Pattern: Factory functions returning promises or WebSocket handles
- Purpose: Enable deep-linkable section navigation without full page reloads
- Examples: `navigateTo('products')` → `#/products`, `#/hackathons/arcademy-xyz` → detail view
- Pattern: URL fragment parsing and React state synchronization

## Entry Points

- Location: `app/page.tsx`
- Triggers: Next.js router on page load or navigation to `/`
- Responsibilities:
- Location: `ws-server/src/index.ts`
- Triggers: HTTP request to `wss://ws.kalebnim.dev/ws` (or configured `NEXT_PUBLIC_WS_SERVER_URL`)
- Responsibilities:
- Location: `app/api/analytics/session/route.ts`, `app/api/analytics/transcript/route.ts`
- Triggers: POST from browser or ws-server with analytics events
- Responsibilities:

## Architectural Constraints

- **Threading:** Bun event loop (single-threaded async). Audio processing via Web Audio API (separate from JS thread). Multiple concurrent WebSocket sessions handled via Bun's per-connection data slots.
- **Global state:** Session instances stored in Bun WebSocket `ws.data` slot (one per connection). DashScope clients instantiated per session. No shared global state across sessions (isolation).
- **Circular imports:** None detected. Module dependency graph is acyclic.
- **Audio sample rates:** Browser mic captured at 16kHz (ASR requirement), downsampled if system default differs. TTS output at 24kHz (DashScope TTS requirement), playback via separate AudioContext.
- **Message size:** PCM16 audio chunks base64-encoded and sent as JSON. Browser receives ~40KB chunks per 250ms at 16kHz (base64 expands by 33%).
- **Connection lifecycle:** Barge-in (new user utterance during assistant response) cancels in-flight LLM+TTS, cleans up audio, sends immediate `response.done`.

## Anti-Patterns

### WebSocket Reconnection Without Cleanup

### Raw Microphone Stream Forwarding

### Unbounded Conversation History

### Skipping Analytics Gracefully

## Error Handling

- Microphone access denial → getUserMediaErrorMessage() maps DOMException names to friendly UI text
- WebSocket connection failure → connect() catches and sets phase: 'error'
- DashScope API errors → ASR/LLM/TTS callbacks emit onError → session sends error message to browser
- JSON parsing failures → Session.handleMessage() catches and ignores (no cascade)
- Fetch failures in analytics → postAnalytics() wraps in `.catch(() => {})` to prevent crashes
- Abort signals → streamLlmResponse() checks signal.aborted after each await; barge-in AbortController short-circuits in-flight operations

## Cross-Cutting Concerns

- WebSocket messages validated via isValidBrowserMessage() type guard (discriminates on `type` field)
- Analytics endpoints validate UUIDs against UUID_RE regex before database operations
- Analytics text fields trimmed to MAX_TEXT (8000 chars for transcripts, 1024 for error messages)
- Microphone error names checked against known DOMException cases
- DashScope API key stored server-side in `process.env.DASHSCOPE_API_KEY` (never sent to browser)
- TTS voice_id stored server-side in `process.env.DASHSCOPE_VOICE_ID` (immutable, security: T-02-08)
- Browser clients identified by session UUID from ws-server; analytics keyed by sessionId
- useEffect cleanup functions remove window event listeners
- WebSocket cleanup on disconnect: wsRef.current = null, audio contexts closed, mic tracks stopped
- TTS session finishTtsSession() sends explicit session.finish to DashScope before closing
- AbortController signals prevent callbacks after resource cleanup

<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

| Skill | Description | Path |
|-------|-------------|------|
| playwright-cli | Automates browser interactions for web testing, form filling, screenshots, and data extraction. Use when the user needs to navigate websites, interact with web pages, fill forms, take screenshots, test web applications, or extract information from web pages. | `.claude/skills/playwright-cli/SKILL.md` |
| scqa-writing-framework | Structures content using the Situation, Complication, Question, Answer framework for clear, logical, and engaging narratives suitable for threads, articles, and reports. | `.claude/skills/scqa-writing-framework/SKILL.md` |
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
