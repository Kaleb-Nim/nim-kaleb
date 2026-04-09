# Codebase Structure

**Analysis Date:** 2026-04-09

## Directory Layout

```
nim-kaleb/
├── app/                          # Next.js app directory (App Router)
│   ├── layout.tsx                # Root layout with font loading
│   ├── page.tsx                  # Entry point, terminal orchestration
│   ├── globals.css               # CSS custom properties (design tokens)
│   ├── components/               # React UI components
│   │   ├── Starfield.tsx         # Canvas-based starfield background
│   │   ├── Terminal.tsx          # Terminal container wrapper
│   │   ├── TerminalHeader.tsx    # macOS title bar with traffic light dots
│   │   ├── TerminalContent.tsx   # Scrollable content area
│   │   ├── TypewriterLine.tsx    # Character-by-character text reveal
│   │   ├── CognitiveStatus.tsx   # Two-column status dashboard
│   │   ├── CommandInput.tsx      # Hidden input + visible prompt/cursor
│   │   ├── VoiceInterface.tsx    # Voice UI (connect button, waveform, transcripts)
│   │   ├── *.module.css          # Component-scoped styles
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useTerminalState.ts   # Terminal state machine
│   │   ├── useTypewriter.ts      # Typewriter animation logic
│   │   ├── useRealtimeVoice.ts   # OpenAI Realtime WebSocket/Audio logic
│   │
│   ├── api/                      # Next.js API route handlers
│   │   └── realtime/
│   │       └── session/
│   │           └── route.ts      # POST /api/realtime/session (token exchange)
│
├── lib/                          # Utility modules (not in app tree)
│   ├── memory.ts                 # Load context.json, build system prompt
│
├── public/                       # Static assets (SVGs, favicons)
│   ├── *.svg
│
├── memory/                       # Non-code context data
│   ├── context.json              # Kaleb's identity, skills, work history
│
├── package.json                  # Dependencies (next, react, openai, etc.)
├── tsconfig.json                 # TypeScript config with @/* path alias
├── next.config.ts                # Next.js config (minimal)
├── postcss.config.mjs            # PostCSS for Tailwind 4
├── eslint.config.mjs             # ESLint rules
├── playwright.config.ts          # Playwright e2e test config
│
├── .planning/                    # Documentation (generated)
│   └── codebase/
│       ├── ARCHITECTURE.md
│       ├── STRUCTURE.md
│
└── tests/                        # Playwright e2e tests
    └── *.spec.ts
```

## Directory Purposes

**app/**
- Purpose: Next.js 16 App Router tree (all pages, layouts, API routes, components)
- Contains: TSX/TS files for pages, components, routes, hooks
- Key files: `page.tsx` (entry), `layout.tsx` (root wrapper)

**app/components/**
- Purpose: Reusable React UI components for terminal UI
- Contains: Terminal chrome (header, content area), animations (typewriter), voice UI
- Key files: `Terminal.tsx` (container), `TerminalContent.tsx` (scrollable area), `VoiceInterface.tsx` (voice chat)

**app/hooks/**
- Purpose: Custom hooks encapsulating state logic, animations, external APIs
- Contains: Terminal state machine, typewriter timing, OpenAI Realtime integration
- Key files: `useTerminalState.ts` (state definition + transitions), `useRealtimeVoice.ts` (WebSocket + audio)

**app/api/**
- Purpose: Server-side Next.js route handlers
- Contains: API endpoints that require server secrets (OPENAI_API_KEY)
- Key files: `realtime/session/route.ts` (token exchange endpoint)

**lib/**
- Purpose: Non-component utility modules
- Contains: Context loading, system prompt building
- Key files: `memory.ts` (loads context.json and builds AI instructions)

**public/**
- Purpose: Static files served at root (SVGs, icons)
- Contains: Decorative SVG assets only
- Note: No custom fonts here (loaded via Next.js font API in layout.tsx)

**memory/**
- Purpose: Non-code context data for the AI voice system
- Contains: `context.json` with Kaleb's identity, work history, skills
- Note: Loaded by `lib/memory.ts` at runtime

## Key File Locations

**Entry Points:**
- `app/page.tsx`: React component that orchestrates terminal state machine and renders all UI
- `app/layout.tsx`: Root layout that loads Anonymous Pro font and sets metadata

**Configuration:**
- `tsconfig.json`: TypeScript compiler options, `@/*` path alias definition
- `next.config.ts`: Next.js configuration (currently minimal)
- `postcss.config.mjs`: PostCSS pipeline (Tailwind 4)
- `eslint.config.mjs`: Lint rules

**Core Logic:**
- `app/hooks/useTerminalState.ts`: State type definitions + custom hook
- `app/hooks/useRealtimeVoice.ts`: WebSocket connection, audio capture/playback, event handling
- `app/api/realtime/session/route.ts`: Server-side token exchange for OpenAI API

**Styling:**
- `app/globals.css`: CSS custom properties (colors, fonts), Tailwind import, utility classes
- `app/components/*.module.css`: Component-scoped styles (Terminal, Header, Input, Voice, Status)

**Testing:**
- `playwright.config.ts`: Playwright configuration
- `tests/`: Directory for e2e tests (Playwright spec files)

## Naming Conventions

**Files:**
- Components: PascalCase (e.g., `Terminal.tsx`, `TerminalHeader.tsx`)
- Hooks: camelCase, `use` prefix (e.g., `useTerminalState.ts`)
- Styles: `.module.css` suffix for component scopes (e.g., `Terminal.module.css`)
- API routes: `route.ts` in Next.js directory tree (e.g., `api/realtime/session/route.ts`)
- Config: lowercase with extensions (e.g., `tsconfig.json`, `next.config.ts`)

**Directories:**
- App tree: lowercase plural (e.g., `components/`, `hooks/`, `api/`)
- Feature-based API routes: lowercase (e.g., `realtime/`, `session/`)

**Functions:**
- Hooks: camelCase with `use` prefix (e.g., `useTerminalState`, `useTypewriter`)
- Components: PascalCase (e.g., `Terminal`, `CommandInput`)
- Event handlers: `handle` + action (e.g., `handleCommand`, `handleKeyDown`)
- Lifecycle/setup: `setup`, `cleanup`, `connect`, `disconnect`

**Variables:**
- Boolean state: `is` prefix (e.g., `isConnected`, `isDesktop`, `isComplete`)
- Refs: `Ref` suffix (e.g., `wsRef`, `canvasRef`, `processorRef`)
- DOM references: `Ref` suffix (e.g., `inputRef`, `animationFrameRef`)
- Constants: UPPERCASE_SNAKE_CASE (e.g., `SAMPLE_RATE`, `PHASE_LABELS`)

**Types:**
- Interfaces: PascalCase, `Props` suffix for component props (e.g., `TerminalProps`, `VoiceInterfaceProps`)
- Type unions: PascalCase (e.g., `TerminalState`, `RealtimePhase`)
- Objects/records: lowercase (e.g., `statusData`, `PHASE_LABELS`)

## Where to Add New Code

**New Feature (e.g., new terminal state or command):**
- Primary code: `app/page.tsx` (add state case) + new `app/components/` component if needed
- Hooks: `app/hooks/useTerminalState.ts` (add state variant)
- Tests: `tests/feature-name.spec.ts`
- Styling: `app/components/FeatureName.module.css`

**New Component/Module:**
- Implementation: `app/components/ComponentName.tsx` (if UI) or `lib/module-name.ts` (if utility)
- Scoped style: `app/components/ComponentName.module.css` (for components)
- Export: From component file directly (no barrel exports currently)

**New API Endpoint:**
- Create: `app/api/[feature]/[sub-path]/route.ts` following Next.js pattern
- Secrets: Use `process.env.VARIABLE_NAME` (loaded from `.env` at build time)
- Response: Use `NextResponse.json({ ... })`

**New Hook:**
- Create: `app/hooks/useFeatureName.ts`
- Export: Named export (no default)
- Use: Import in components or page: `import { useFeatureName } from '@/app/hooks/useFeatureName'`

**Utilities:**
- Shared helpers: `lib/util-name.ts` (if not part of hook)
- Context/data: `memory/` directory (non-code JSON or data files)

**Tests:**
- Location: `tests/` directory
- Format: `*.spec.ts` Playwright test files
- Pattern: Run with `bun test` (Playwright)

## Special Directories

**app/api/**
- Purpose: Next.js API routes that need server-side secrets
- Generated: No
- Committed: Yes (only non-secret code)
- Note: `route.ts` files are auto-registered as handlers by Next.js

**.planning/codebase/**
- Purpose: Generated documentation (ARCHITECTURE.md, STRUCTURE.md, etc.)
- Generated: Yes (by Claude Code gsd-map-codebase)
- Committed: Yes (part of repo)
- Note: Consumed by `/gsd-plan-phase` and `/gsd-execute-phase` commands

**memory/**
- Purpose: Non-code context (JSON, config, or reference data)
- Generated: No (manually curated)
- Committed: Yes
- Note: Loaded at runtime by `lib/memory.ts` and used to build AI instructions

**.next/**
- Purpose: Next.js build output (dev server cache, production build)
- Generated: Yes (by `bun dev` or `bun run build`)
- Committed: No (in .gitignore)

**node_modules/**
- Purpose: Installed dependencies
- Generated: Yes (by `bun install`)
- Committed: No (in .gitignore)

---

*Structure analysis: 2026-04-09*
