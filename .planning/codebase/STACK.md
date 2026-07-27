# Technology Stack

**Analysis Date:** 2026-07-27

## Languages

**Primary:**
- TypeScript 5 - All source code, type-safe application development
- JavaScript - Build configuration and tooling

**Secondary:**
- CSS - Styling via Tailwind CSS 4
- HTML - Template structure in Next.js

## Runtime

**Environment:**
- Bun - JavaScript/TypeScript runtime and package manager (primary for development and ws-server)
- Node.js 20+ - Compatible (via Vercel hosting environment for Next.js frontend)

**Package Manager:**
- Bun (primary)
- Lockfile: `bun.lock` (present, 105KB)

## Frameworks

**Core (Frontend):**
- Next.js 16.0.10 (App Router) - Full-stack React framework with API routes, deployed to Vercel
- React 19.2.0 - UI component library
- React DOM 19.2.0 - React rendering for DOM

**Styling:**
- Tailwind CSS 4 - Utility-first CSS framework
- PostCSS 4 - CSS processing pipeline (`@tailwindcss/postcss`)

**Testing:**
- Playwright 1.58.2 - E2E testing framework
- `@playwright/test` - Test runner and assertions

**Build/Development:**
- ESLint 9 - Code linting (flat config format)
- ESLint Config Next 16.0.1 - Next.js-specific linting rules
- TypeScript 5 - Type checking and compilation

**Core (Backend/WebSocket Server):**
- Bun - HTTP server + WebSocket runtime for `ws-server/` (deployed to ECS)

## Key Dependencies

**Critical:**
- openai 6.32.0 - OpenAI-compatible SDK client pointed at DashScope LLM (`ws-server/src/dashscope/llm.ts`)
- @neondatabase/serverless 1.1.0 - PostgreSQL serverless connection (Neon)
- drizzle-orm 0.45.2 - Type-safe database ORM
- drizzle-kit 0.31.10 - Database migration and schema management tools

**Infrastructure & Analytics:**
- @vercel/analytics 2.0.1 - Vercel analytics SDK for frontend monitoring
- @anthropic-ai/sdk 0.78.0 - Anthropic Claude SDK (installed but not currently used)

**Type Definitions:**
- @types/node 20 - Node.js type definitions
- @types/react 19 - React type definitions
- @types/react-dom 19 - React DOM type definitions
- @types/bun 1.3.14 - Bun runtime type definitions
- baseline-browser-mapping 2.10.16 - Browser compatibility mappings

## Configuration

**TypeScript:**
- `tsconfig.json` - Strict mode enabled, ES2017 target, bundler module resolution, path aliases (`@/*`)
- `tsconfig.tsbuildinfo` - Incremental build cache

**Next.js:**
- `next.config.ts` - Next.js configuration, microphone permission headers, NEXT_PUBLIC_LAST_SYNC env injection

**Build/Lint:**
- `eslint.config.mjs` - ESLint flat config extending Next.js core-web-vitals and TypeScript rules
- `postcss.config.mjs` - PostCSS configuration with Tailwind plugin

**Testing:**
- `playwright.config.ts` - Playwright test runner (30s timeout, local server at http://localhost:3000)

**Database:**
- `drizzle.config.ts` - Schema location (`lib/schema.ts`), PostgreSQL dialect, DATABASE_URL connection

**Deployment:**
- `.vercel/project.json` - Vercel project metadata (projectId, orgId)
- `.vercelignore` - Excludes ws-server, tts-server, tests, assets, .planning/ from Vercel builds

**Environment:**
- `.env.local` file present (contains secrets - DASHSCOPE_API_KEY, DASHSCOPE_VOICE_ID, DATABASE_URL, NEXT_PUBLIC_WS_SERVER_URL, OPENAI_API_KEY)
- No explicit Node/Bun version pinning in package.json

## Platform Requirements

**Development:**
- Bun runtime environment
- macOS/Linux/Windows with Node.js-compatible shell
- TypeScript compiler (via devDependencies)
- Playwright Chromium binary (installed via `bunx playwright install chromium`)

**Production:**
- Vercel hosting platform (Next.js frontend: nim-kaleb.vercel.app)
- Amazon ECS (Bun ws-server: wss://ws.kalebnim.dev)
- Neon PostgreSQL serverless database
- Alibaba Cloud DashScope API access (STT, LLM, TTS)

## Scripts

**Development:**
- `bun dev` - Run Next.js dev server on http://localhost:3000
- `bun run sync-context` - Sync context (custom build script)

**Production:**
- `bun run build` - Build Next.js production bundle
- `bun start` - Start Next.js production server

**Testing:**
- `bun test` - Run Playwright tests
- `bun test:headed` - Run Playwright tests with browser UI

**Linting:**
- `bun run lint` - Run ESLint on codebase

**Database:**
- `drizzle-kit push` - Push schema changes to database
- `drizzle-kit generate` - Generate migration files

## Path Aliases

- `@/*` maps to project root (e.g., `@/app`, `@/components`, `@/hooks`, `@/lib`)

---

*Stack analysis: 2026-07-27*
