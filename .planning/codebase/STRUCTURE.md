# Codebase Structure

**Analysis Date:** 2026-07-27

## Directory Layout

```
nim-kaleb/
├── app/                              # Frontend Next.js application
│   ├── page.tsx                      # Root SPA entry point (hash-routed multi-section terminal)
│   ├── layout.tsx                    # HTML layout with metadata, font loading
│   ├── globals.css                   # Global styles (Tailwind, CSS variables, KNI design tokens)
│   ├── components/                   # React components
│   │   ├── Terminal.tsx              # Terminal window wrapper (frame + children)
│   │   ├── TerminalHeader.tsx        # macOS title bar with traffic light dots
│   │   ├── TerminalContent.tsx       # Scrollable content area
│   │   ├── Starfield.tsx             # Canvas-based animated starfield background
│   │   ├── HomePage.tsx              # Home section with identity, quick-bar, directory
│   │   ├── WorkPage.tsx              # Work experience section
│   │   ├── MeetupsPage.tsx           # SYAI Meetups section
│   │   ├── MeetupDetail.tsx          # Meetup detail modal
│   │   ├── HackathonsPage.tsx        # Hackathons section
│   │   ├── HackathonLinksPage.tsx    # Hackathon detail sub-route
│   │   ├── ProductsPage.tsx          # Products section
│   │   ├── ProductDetail.tsx         # Product detail sub-route
│   │   ├── StubSectionPage.tsx       # Generic section page (Hobbies, Links)
│   │   ├── NotFoundPage.tsx          # 404 page for unmatched routes
│   │   ├── FloatingMic.tsx           # Floating microphone button (top-right corner)
│   │   ├── VoiceOverlay.tsx          # Full-screen voice interaction overlay
│   │   ├── VoiceInterface.tsx        # Voice chat display (transcripts + response)
│   │   ├── VoiceCTA.tsx              # Voice call-to-action button on home page
│   │   ├── Directory.tsx             # Section directory grid/list component
│   │   ├── PageHeader.tsx            # Section header with title and count chip
│   │   ├── TypewriterLine.tsx        # Character-by-character text reveal (legacy)
│   │   ├── CognitiveStatus.tsx       # Two-column status dashboard (legacy)
│   │   ├── CommandInput.tsx          # Hidden input field (legacy terminal interaction)
│   │   ├── MobileVoiceButton.tsx     # Mobile-specific voice button
│   │   ├── WorkLogoChip.tsx          # Work item logo component
│   │   ├── MeetupCard.tsx            # Meetup list item component
│   │   ├── MeetupGridCard.tsx        # Meetup grid card variant
│   │   ├── MeetupImage.tsx           # Meetup image viewer with fallback
│   │   ├── MeetupLightbox.tsx        # Meetup image lightbox/modal
│   │   ├── MeetupRibbon.tsx          # Meetup metadata ribbon
│   │   ├── SpeakersBlock.tsx         # Speakers profile display
│   │   ├── HackathonRow.tsx          # Hackathon table row component
│   │   ├── ProductCard.tsx           # Product grid card
│   │   └── *.module.css              # Component-scoped CSS modules
│   ├── hooks/                        # Custom React hooks
│   │   ├── useRealtimeVoice.ts       # WebSocket connection, audio I/O, voice pipeline
│   │   ├── useHashRoute.ts           # Hash-based URL routing (#/section-id)
│   │   ├── useTypewriter.ts          # Character reveal animation (legacy)
│   │   └── useTerminalState.ts       # Terminal lifecycle state (legacy)
│   ├── lib/                          # App-level utilities (not to be confused with root /lib)
│   │   ├── sections.ts               # Section definitions: SECTIONS[], LINKS[], HACK_ITEMS[], etc.
│   │   ├── hackathons.ts             # Hackathon data imported from JSON
│   │   └── workStatus.ts             # Work status utilities
│   ├── data/                         # Static data files (if any)
│   └── api/                          # Next.js API routes
│       └── analytics/
│           ├── session/
│           │   └── route.ts          # Analytics: start/end session lifecycle
│           └── transcript/
│               └── route.ts          # Analytics: log user/assistant turns
├── ws-server/                        # Bun WebSocket server for voice pipeline
│   ├── package.json                  # Bun runtime, OpenAI SDK
│   ├── tsconfig.json                 # TypeScript config
│   ├── src/
│   │   ├── index.ts                  # HTTP fetch handler + WebSocket server entry point
│   │   ├── session.ts                # Session class: orchestrates ASR→LLM→TTS pipeline
│   │   ├── types.ts                  # Message type definitions and guards
│   │   ├── logger.ts                 # File-based logging (session transcripts + latency)
│   │   └── dashscope/                # DashScope API clients
│   │       ├── asr.ts                # Qwen3-ASR realtime WebSocket client
│   │       ├── llm.ts                # qwen-plus REST client (compatible-mode API)
│   │       └── tts.ts                # Qwen3-TTS-VC realtime WebSocket client with voice cloning
│   └── dist/                         # Build output (excluded from git)
├── lib/                              # Root-level utilities (shared between app/ and ws-server/)
│   ├── db.ts                         # Neon Postgres + Drizzle ORM initialization
│   ├── schema.ts                     # Drizzle schema definitions (sessions, transcripts tables)
│   └── memory.ts                     # Memory utilities (if used)
├── public/                           # Static assets
│   ├── meetups/                      # Meetup event images
│   ├── products/                     # Product showcase images
│   ├── work-logos/                   # Company/org logos for work section
│   ├── hackathons/                   # Hackathon images and assets
│   └── readme/                       # README documentation images
├── prompts/                          # AI prompt templates
│   └── system-prompt.md              # LLM system prompt (Kaleb's biography/context)
├── scripts/                          # Utility scripts
│   └── sync-context.ts               # Script to sync context/state (e.g., between services)
├── tests/                            # Playwright E2E tests
│   └── *.test.ts                     # Test files
├── .claude/                          # Claude Code configuration
│   ├── CLAUDE.md                     # Project-specific instructions for Claude
│   └── skills/                       # Project-specific skills (if any)
├── .planning/                        # Planning and research documents
│   ├── codebase/                     # Codebase analysis documents (ARCHITECTURE.md, STRUCTURE.md, etc.)
│   ├── phases/                       # GSD phase documentation
│   ├── milestones/                   # Milestone tracking
│   ├── research/                     # Design research and specs
│   └── quick/                        # Quick task documentation
├── .vercel/                          # Vercel deployment configuration
├── tts-server/                       # Python TTS server (archived/legacy)
│   ├── main.py                       # Old TTS service entry point
│   ├── pyproject.toml                # Python dependencies
│   └── .venv/                        # Python virtual environment
├── memory/                           # Obsidian/memory files (session notes)
│   └── raw/                          # Raw session transcripts
├── next.config.ts                    # Next.js configuration
├── tsconfig.json                     # TypeScript compiler options (strict mode)
├── postcss.config.mjs                # PostCSS + Tailwind 4 configuration
├── eslint.config.mjs                 # ESLint configuration (Next.js, core web vitals, TypeScript)
├── playwright.config.ts              # Playwright test runner configuration
├── drizzle.config.ts                 # Drizzle ORM configuration for migrations
├── package.json                      # Root dependencies (Next.js, React, Tailwind, etc.)
├── bun.lock                          # Bun package lock file
├── .gitignore                        # Git ignore patterns
├── .vercelignore                     # Vercel build ignore patterns
├── CLAUDE.md                         # Project instructions (codebase overview, tech stack, conventions)
├── README.md                         # Project description and architecture diagrams
└── .env.local                        # Environment variables (DASHSCOPE_API_KEY, DATABASE_URL, etc.) — NOT COMMITTED
```

## Directory Purposes

**`app/`:** Frontend Next.js application with App Router. Contains all React components, hooks, pages, and API routes.

**`app/components/`:** React components organized by feature/page type. Mix of active (HomePage, WorkPage, VoiceOverlay) and legacy (TypewriterLine, CognitiveStatus) components.

**`app/hooks/`:** Custom React hooks encapsulating business logic (voice connection, routing, animation).

**`app/lib/`:** Application-level utilities: section definitions (SECTIONS, LINKS, HACK_ITEMS arrays) and related helpers. Not confused with root `/lib/`.

**`app/api/`:** Next.js API routes. Analytics endpoints for session tracking and transcript logging.

**`ws-server/`:** Standalone Bun WebSocket server handling real-time voice pipeline. Connects to DashScope (ASR, LLM, TTS), not committed to main app deployment.

**`ws-server/src/`:** TypeScript source for WebSocket server. Entry point is `index.ts` (Bun HTTP server). Session orchestration in `session.ts`. DashScope clients abstracted in `dashscope/` subdirectory.

**`lib/`:** Root-level utilities shared between frontend and backend (if needed). Currently holds database (Drizzle ORM + Neon Postgres) and optional memory utilities.

**`public/`:** Static assets served by Next.js. Organized by section (meetups, products, hackathons) or purpose (work-logos).

**`prompts/`:** AI prompt templates. `system-prompt.md` contains Kaleb's biography and context fed to the LLM on every request.

**`tests/`:** Playwright E2E tests for the frontend. Tests can be run headed or headless.

**`.planning/`:** GSD phase documentation, design research, and codebase analysis artifacts.

**`tts-server/`:** Legacy Python-based TTS service (archived). No longer used; kept for reference. Not deployed.

## Key File Locations

**Entry Points:**
- `app/page.tsx` — Frontend SPA entry point (hash-routed, multi-section terminal)
- `ws-server/src/index.ts` — WebSocket server entry point (Bun.serve on port 8080)
- `app/layout.tsx` — HTML root layout (metadata, font loading)

**Configuration:**
- `next.config.ts` — Next.js build and runtime configuration
- `tsconfig.json` — TypeScript strict mode, ES2017 target
- `postcss.config.mjs` — Tailwind 4 CSS pipeline
- `eslint.config.mjs` — ESLint rules (Next.js, core web vitals, TypeScript)
- `ws-server/tsconfig.json` — WebSocket server TypeScript config
- `drizzle.config.ts` — Database migration tool configuration
- `.vercel/` — Vercel deployment metadata

**Core Logic:**
- `app/hooks/useRealtimeVoice.ts` — Voice connection, WebSocket lifecycle, audio I/O (22KB, complex)
- `ws-server/src/session.ts` — Session orchestration, ASR→LLM→TTS pipeline, state management
- `ws-server/src/dashscope/asr.ts` — Qwen3-ASR client (16kHz mono PCM input)
- `ws-server/src/dashscope/llm.ts` — qwen-plus streaming client (system prompt + history)
- `ws-server/src/dashscope/tts.ts` — Qwen3-TTS-VC client (24kHz voice-cloned output)
- `app/lib/sections.ts` — Section definitions, aliases, item arrays (SECTIONS, LINKS, HACK_ITEMS, etc.)
- `lib/db.ts` — Neon Postgres + Drizzle ORM initialization
- `lib/schema.ts` — Database schema (sessions, transcripts tables)

**Styling:**
- `app/globals.css` — Global styles, Tailwind imports, KNI design tokens (CSS variables)
- `app/components/*.module.css` — Component-scoped styles (Terminal, etc.)

**Testing:**
- `playwright.config.ts` — Playwright configuration (Chromium, test environment)
- `tests/*.test.ts` — E2E test files

**Analytics & Logging:**
- `app/api/analytics/session/route.ts` — Session lifecycle API (start/end events)
- `app/api/analytics/transcript/route.ts` — Transcript logging API (user/assistant turns)
- `ws-server/src/logger.ts` — File-based logging (latency metrics, turn logs)

**Data & Prompts:**
- `prompts/system-prompt.md` — LLM system prompt (Kaleb's biography)
- `app/lib/hackathons.ts` — Hackathon data (may be imported from JSON)
- `app/data/` — Static data files (if used)

## Naming Conventions

**Files:**
- React components: `PascalCase.tsx` (e.g., `HomePage.tsx`, `FloatingMic.tsx`)
- Hooks: `camelCase.ts` with `use` prefix (e.g., `useRealtimeVoice.ts`, `useHashRoute.ts`)
- API routes: `route.ts` in `app/api/<path>/` directories
- CSS modules: `ComponentName.module.css` (e.g., `Terminal.module.css`)
- Utility files: `camelCase.ts` (e.g., `sections.ts`, `db.ts`, `logger.ts`)
- Prompt files: `kebab-case.md` (e.g., `system-prompt.md`)

**Directories:**
- Components: `PascalCase` (e.g., `app/components/`)
- Features: lowercase or `kebab-case` (e.g., `app/api/analytics/`, `ws-server/src/dashscope/`)
- Aliases: `@/` maps to project root (e.g., `@/app/hooks/useRealtimeVoice`)

## Where to Add New Code

**New Feature (Multi-part changes):**
- Frontend component: `app/components/FeatureName.tsx`
- Frontend logic: `app/hooks/useFeature.ts`
- Backend handling: `ws-server/src/feature.ts` or `ws-server/src/dashscope/integration.ts`
- Tests: `tests/feature.test.ts`

**New Page/Section:**
- Component: `app/components/SectionNamePage.tsx`
- Section definition: Add entry to SECTIONS array in `app/lib/sections.ts`
- Route alias: Add to section.aliases if needed for deep linking
- API routes: `app/api/section/` if backend required

**New Component/Module:**
- Implementation: `app/components/ComponentName.tsx` for UI, `app/hooks/useHook.ts` for logic
- Styles: `app/components/ComponentName.module.css` for scoped CSS
- Export from parent if part of a feature

**Utilities:**
- Shared helpers: `lib/utility.ts` (root level if used by ws-server too)
- App-specific: `app/lib/utility.ts`
- WebSocket server: `ws-server/src/utility.ts`

**DashScope Integrations:**
- New integrations: `ws-server/src/dashscope/service.ts`
- Callback-based interface matching existing pattern (createSessionFn, callbacks object)

**Analytics:**
- New session event: Add handler in `app/api/analytics/session/route.ts`
- New transcript event: Custom POST to `app/api/analytics/transcript/route.ts` (no schema changes needed if optional)
- Database changes: Update `lib/schema.ts` with Drizzle schema, create migration

**Tests:**
- E2E tests: `tests/feature.test.ts` using Playwright
- Run with `bun test` or `bun test:headed`

## Special Directories

**`public/`:**
- Purpose: Static assets served by Next.js (images, documents)
- Generated: No (manually added/curated)
- Committed: Yes

**`.next/`:**
- Purpose: Next.js build cache and compiled output
- Generated: Yes (by `bun run build`)
- Committed: No (in .gitignore)

**`ws-server/dist/`:**
- Purpose: WebSocket server compiled bundle
- Generated: Yes (by `bun build` in ws-server/)
- Committed: No (in .gitignore)

**`.planning/`:**
- Purpose: Project planning documents (GSD phases, research, analysis)
- Generated: Yes (by GSD tools, manually created)
- Committed: Yes

**`memory/`:**
- Purpose: Session memory and notes (Obsidian vault integration)
- Generated: Yes (by session hooks)
- Committed: No (in .gitignore)

**`.env.local`:**
- Purpose: Environment configuration (DASHSCOPE_API_KEY, DATABASE_URL, etc.)
- Generated: No (manually created)
- Committed: No (in .gitignore) — **NEVER commit secrets**

**`tts-server/`:**
- Purpose: Legacy Python TTS service (archived reference)
- Generated: No (historical code)
- Committed: Yes (for reference only)

---

*Structure analysis: 2026-07-27*
