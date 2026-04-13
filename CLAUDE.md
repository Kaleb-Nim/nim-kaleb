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
- **Speech Quality**: Must sound conversational, not robotic — filler words, natural rhythm, follow-up questions
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
- Bun - JavaScript/TypeScript runtime and package manager (primary)
- Node.js compatible (via Next.js compatibility layer)
- Bun - Primary package manager for this project
- Lockfile: `bun.lock` (present, 105KB)
## Frameworks
- Next.js 16.0.10 (App Router) - Full-stack React framework with API routes
- React 19.2.0 - UI component library
- React DOM 19.2.0 - React rendering for DOM
- Tailwind CSS 4 - Utility-first CSS framework
- PostCSS 4 - CSS processing pipeline (`@tailwindcss/postcss`)
- Anonymous Pro (Google Fonts) - Monospace terminal font (preloaded in layout)
- Playwright 1.58.2 - E2E testing framework
- `@playwright/test` - Test runner and assertions
- ESLint 9 - Code linting
- ESLint Config Next 16.0.1 - Next.js-specific linting rules
- ESLint Config (core-web-vitals, TypeScript) - Web Vitals and type checking
## Key Dependencies
- openai 6.32.0 - OpenAI API SDK for GPT-4 Realtime API access
- @anthropic-ai/sdk 0.78.0 - Anthropic Claude API SDK (installed but not currently used)
- @types/node 20 - Node.js type definitions
- @types/react 19 - React type definitions
- @types/react-dom 19 - React DOM type definitions
- baseline-browser-mapping 2.10.16 - Browser compatibility mapping
## Configuration
- `.env.local` file present (contains secrets - OPENAI_API_KEY required)
- No explicit node/bun version pinning in package.json
- TypeScript strict mode enabled
- ES2017 target compilation
- `tsconfig.json` - TypeScript compiler configuration with strict mode
- `next.config.ts` - Minimal Next.js configuration
- `postcss.config.mjs` - PostCSS configuration for Tailwind
- `eslint.config.mjs` - ESLint configuration
- `playwright.config.ts` - Playwright test runner configuration
- Command: `bun dev`
- URL: http://localhost:3000
- Next.js hot module replacement enabled
- Test server uses `reuseExistingServer: true`
- Command: `bun run build`
- Command: `bun start`
- Deployed to Vercel (see `.vercel/project.json`)
## Platform Requirements
- Bun runtime environment
- macOS/Linux/Windows with Node.js-compatible shell (project uses `bunx` commands)
- TypeScript compiler (via devDependencies)
- Playwright Chromium binary (installed via `bunx playwright install chromium`)
- Vercel hosting platform (configured)
- OpenAI API key (`OPENAI_API_KEY` env var)
- Node.js 20+ runtime (via Vercel Node.js environment)
## Scripts
## Path Aliases
- `@/*` maps to project root (e.g., `@/app`, `@/components`, `@/hooks`)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- Components: PascalCase with `.tsx` extension (e.g., `Terminal.tsx`, `CommandInput.tsx`, `VoiceInterface.tsx`)
- Hooks: camelCase with `use` prefix and `.ts` extension (e.g., `useTerminalState.ts`, `useRealtimeVoice.ts`, `useTypewriter.ts`)
- CSS Modules: Component name + `.module.css` (e.g., `Terminal.module.css`, `VoiceInterface.module.css`)
- API routes: Nested directories matching route structure (e.g., `app/api/realtime/session/route.ts`)
- Utility files: camelCase (e.g., `memory.ts`)
- React components: PascalCase (e.g., `Home`, `Terminal`, `VoiceInterface`)
- Hooks: camelCase with `use` prefix (e.g., `useTerminalState`, `useRealtimeVoice`, `useTypewriter`)
- Regular functions: camelCase (e.g., `connect`, `disconnect`, `handleMessage`, `downsampling`, `pcm16ToFloat32`)
- Helper functions in components: camelCase (e.g., `handleCommand`, `handleKeyDown`, `scheduleAudioChunk`)
- Event handlers: `handle{EventName}` pattern (e.g., `handleCommand`, `handleKeyDown`, `handleContainerClick`, `handleMessage`)
- React state: camelCase (e.g., `inputValue`, `displayedText`, `isComplete`, `status`)
- Refs: camelCase with `Ref` suffix (e.g., `canvasRef`, `inputRef`, `wsRef`, `audioCtxRef`, `micStreamRef`)
- Constants: UPPER_SNAKE_CASE when truly constant (e.g., `SAMPLE_RATE`, `PHASE_LABELS`)
- Booleans: `is{Property}` or `has{Property}` prefix (e.g., `isDesktop`, `isComplete`, `isConnected`, `hasGreenTint`)
- Abbreviations in conversions: descriptive patterns like `pcm16ToFloat32`, `float32ToPcm16Base64`
- Interfaces: PascalCase, `Props` suffix for component props (e.g., `CommandInputProps`, `VoiceInterfaceProps`, `TypewriterOptions`)
- Type aliases: PascalCase (e.g., `TerminalState`, `RealtimePhase`, `RealtimeStatus`, `Star`)
- Discriminated union types: Use `type` for union literals (e.g., `type RealtimePhase = 'idle' | 'connecting' | 'listening' | 'responding' | 'error'`)
- Exported types: Consistent with domain (e.g., `type TerminalState`, `export interface RealtimeStatus`)
## Code Style
- ESLint: Next.js 16 core web vitals + TypeScript rules (`eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`)
- Config file: `eslint.config.mjs` (flat config format, ESLint 9)
- No Prettier in use (rely on ESLint rules)
- Indentation: 2 spaces (standard Next.js)
- ESLint configuration: Extends Next.js defaults (core web vitals and TypeScript)
- Global ignores: `.next/**`, `out/**`, `build/**`, `next-env.d.ts`
- Strict TypeScript mode enabled in `tsconfig.json`
## Import Organization
- `@/*` maps to project root (e.g., `@/app/hooks/useTerminalState`, `@/app/components/Terminal`)
- Used consistently across all files for relative imports above same-directory level
## Error Handling
- Try-catch blocks wrap async operations and JSON parsing (e.g., in `useRealtimeVoice.ts`)
- Error messages propagated to state for UI display (`setStatus(prev => ({ ...prev, phase: 'error', error: msg }})`)
- Specific error handling for known error cases: JSON parse failures, network errors, file operations
- Error recovery includes cleanup of resources (closing WebSocket, stopping audio tracks, clearing refs)
- Type narrowing for error objects: `err instanceof Error ? err.message : String(err)`
## Logging
- Browser console output in test files for debugging: `console.log('[session] token prefix:', json.token.slice(0, 20) + '…')`
- Labeled logs with metadata prefixes in brackets: `[session]`, `[stt]`, `[round-trip]`, `[ui]`, `[location]`
- Used primarily in Playwright tests for test result visibility
## Comments
- Complex algorithmic sections (e.g., audio processing in `useRealtimeVoice.ts`)
- State machine transitions and logic flow (e.g., section comments in `app/page.tsx`)
- Non-obvious setup requirements (e.g., "Don't set global Content-Type — it breaks multipart form uploads" in `playwright.config.ts`)
- Function-level JSDoc blocks for exported hooks and utilities:
- Inline comments for sections with `── ` separator (visual clarity in longer functions)
- Type documentation in interfaces for complex fields
## Function Design
- Custom hooks under 300 lines including complex logic (`useRealtimeVoice.ts` = 338 lines with full audio pipeline)
- Components typically 50-150 lines
- Event handlers: single-line arrow functions when simple, multi-statement for complex logic
- Props passed via object interfaces rather than multiple parameters
- Optional callbacks passed via interface: `onComplete?: () => void`
- Options objects for hook configuration: `{ transitionTo, ... }` passed to hooks
- Hooks return objects with multiple properties: `{ status, analyserRef, connect, disconnect, isConnected }`
- Component functions return JSX (implicit React.ReactElement)
- Type definitions explicit: `Float32Array<ArrayBuffer>` for typed array returns
- Event handlers return `void`
## Module Design
- Default exports for React components: `export default function Terminal(...)`
- Named exports for hooks: `export function useTerminalState(...)`
- Named exports for types: `export type RealtimePhase = ...`, `export interface RealtimeStatus { ... }`
- Single default export per component file, additional types/interfaces co-located
- Components imported directly from their files
- Hooks imported from individual hook files in `app/hooks/`
## Async Patterns
- Async state updates wrapped in `setStatus(prev => ({ ...prev, ... }))`
- Callback dependencies properly tracked in useEffect and useCallback
- Cleanup functions return from useEffect (memory leak prevention in animation loops, event listeners)
## React-Specific Patterns
- `'use client'` directive at top of all interactive components
- Consistent use of `useState`, `useRef`, `useEffect`, `useCallback`
- Interfaces define all component props
- Optional props use `?` (e.g., `onComplete?: () => void`)
- Children components use `ReactNode` type
- Return objects with named properties for clarity
- Use `useCallback` for event handlers to prevent unnecessary re-renders
- Proper dependency arrays on all useEffect and useCallback
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
- Linear state progression through terminal lifecycle phases
- Client-side React components with server-side API proxies
- OpenAI Realtime API integration for bidirectional voice
- Canvas-based visual rendering (starfield, waveform)
- Strict CSS-in-modules for terminal styling (not Tailwind)
## Layers
- Purpose: Render terminal UI with animations and state-driven visibility
- Location: `app/components/`
- Contains: TSX components for terminal chrome, content, voice interface
- Depends on: Hooks (state management, typewriter, voice), CSS modules
- Used by: Root page component
- Purpose: Encapsulate terminal state machine, typewriter animation, voice connection logic
- Location: `app/hooks/`
- Contains: `useTerminalState.ts`, `useTypewriter.ts`, `useRealtimeVoice.ts`
- Depends on: React hooks, OpenAI SDK, Web Audio API
- Used by: Components and page component
- Purpose: Proxy OpenAI Realtime session creation with server-side secret handling
- Location: `app/api/realtime/session/route.ts`
- Contains: POST endpoint that exchanges server API key for client-safe ephemeral token
- Depends on: OpenAI API, environment variables
- Used by: `useRealtimeVoice` hook (browser fetch call)
- Purpose: App initialization and entry point
- Location: `app/layout.tsx`, `app/page.tsx`
- Contains: Font loading, metadata, terminal state orchestration
- Depends on: All components and hooks
- Used by: Next.js router
## Data Flow
- Terminal state held in component state via `useTerminalState()` custom hook
- Metadata (error messages, transcripts) stored alongside state
- Transitions triggered by:
## Key Abstractions
- Purpose: Encapsulate valid state transitions
- Examples: `BOOTING`, `STATUS`, `MENU`, `PROCESSING`, `CONNECTING`, `VOICE_IDLE`, `VOICE_ACTIVE`
- Pattern: Centralized type definition in `useTerminalState.ts` used throughout codebase
- Purpose: Character-by-character text reveal with completion callback
- Examples: `useTypewriter` hook, `TypewriterLine` component
- Pattern: Character index incremented on interval, completion triggers state transition
- Purpose: Manage OpenAI WebSocket connection lifecycle
- Examples: `useRealtimeVoice` hook, session token endpoint
- Pattern: Setup → async connect → message handlers → cleanup on disconnect
- Purpose: Seamless sequential playback of incoming PCM16 audio chunks
- Examples: `scheduleAudioChunk` in `useRealtimeVoice`
- Pattern: Track `nextPlayTimeRef` to schedule each source at end of previous duration
## Entry Points
- Location: `app/page.tsx`
- Triggers: Next.js router / app initialization
- Responsibilities:
- Location: `app/api/realtime/session/route.ts`
- Triggers: Fetch call from `useRealtimeVoice.connect()`
- Responsibilities:
## Error Handling
- WebSocket error → `setStatus({ phase: 'error', error: msg })` → conditional `<div className={styles.errorLine}>` renders
- Fetch error in connect → caught in try-catch → mic/audio cleanup → error state
- Missing API key → 500 response → caught by hook → error message displayed
- User denial of mic access → getUserMedia throws → caught → error state
## Cross-Cutting Concerns
- console via `console` (not implemented in current codebase, could be added)
- No centralized logging service
- Input validation: CommandInput limits to 10 characters via `maxLength`
- API response validation: assumes OpenAI response shape (no schema validation)
- Stateless token-based: server issues ephemeral tokens
- OpenAI Realtime WebSocket authenticated via ephemeral token in protocol header
- No user authentication (public portfolio)
- React useEffect cleanup functions for timers and animation frames
- WebSocket cleanup on disconnect (wsRef = null)
- Audio context cleanup (close, disconnect, getTracks.stop)
- Event listener cleanup (window resize, etc.)
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.github/skills/` with a `SKILL.md` index file.
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
