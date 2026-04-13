# Technology Stack

**Analysis Date:** 2025-04-09

## Languages

**Primary:**
- TypeScript 5 - All source code, type-safe application development
- JavaScript - Build configuration and tooling

**Secondary:**
- CSS - Styling via Tailwind CSS 4
- HTML - Template structure in Next.js

## Runtime

**Environment:**
- Bun - JavaScript/TypeScript runtime and package manager (primary)
- Node.js compatible (via Next.js compatibility layer)

**Package Manager:**
- Bun - Primary package manager for this project
- Lockfile: `bun.lock` (present, 105KB)

## Frameworks

**Core:**
- Next.js 16.0.10 (App Router) - Full-stack React framework with API routes
- React 19.2.0 - UI component library
- React DOM 19.2.0 - React rendering for DOM

**Styling:**
- Tailwind CSS 4 - Utility-first CSS framework
- PostCSS 4 - CSS processing pipeline (`@tailwindcss/postcss`)
- Anonymous Pro (Google Fonts) - Monospace terminal font (preloaded in layout)

**Testing:**
- Playwright 1.58.2 - E2E testing framework
- `@playwright/test` - Test runner and assertions

**Development:**
- ESLint 9 - Code linting
- ESLint Config Next 16.0.1 - Next.js-specific linting rules
- ESLint Config (core-web-vitals, TypeScript) - Web Vitals and type checking

## Key Dependencies

**Critical:**
- openai 6.32.0 - OpenAI API SDK for GPT-4 Realtime API access
- @anthropic-ai/sdk 0.78.0 - Anthropic Claude API SDK (installed but not currently used)

**Infrastructure:**
- @types/node 20 - Node.js type definitions
- @types/react 19 - React type definitions
- @types/react-dom 19 - React DOM type definitions
- baseline-browser-mapping 2.10.16 - Browser compatibility mapping

## Configuration

**Environment:**
- `.env.local` file present (contains secrets - OPENAI_API_KEY required)
- No explicit node/bun version pinning in package.json
- TypeScript strict mode enabled
- ES2017 target compilation

**Build:**
- `tsconfig.json` - TypeScript compiler configuration with strict mode
- `next.config.ts` - Minimal Next.js configuration
- `postcss.config.mjs` - PostCSS configuration for Tailwind
- `eslint.config.mjs` - ESLint configuration
- `playwright.config.ts` - Playwright test runner configuration

**Development Server:**
- Command: `bun dev`
- URL: http://localhost:3000
- Next.js hot module replacement enabled
- Test server uses `reuseExistingServer: true`

**Production Build:**
- Command: `bun run build`
- Command: `bun start`
- Deployed to Vercel (see `.vercel/project.json`)

## Platform Requirements

**Development:**
- Bun runtime environment
- macOS/Linux/Windows with Node.js-compatible shell (project uses `bunx` commands)
- TypeScript compiler (via devDependencies)
- Playwright Chromium binary (installed via `bunx playwright install chromium`)

**Production:**
- Vercel hosting platform (configured)
- OpenAI API key (`OPENAI_API_KEY` env var)
- Node.js 20+ runtime (via Vercel Node.js environment)

## Scripts

```bash
bun dev              # Start development server on http://localhost:3000
bun run build        # Build for production
bun start            # Start production server
bun run lint         # Run ESLint
bun run sync-context # Run scripts/sync-context.ts
bunx playwright test # Run headless E2E tests
bunx playwright test --headed # Run E2E tests with browser visible
```

## Path Aliases

- `@/*` maps to project root (e.g., `@/app`, `@/components`, `@/hooks`)

---

*Stack analysis: 2025-04-09*
