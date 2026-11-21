# CLAUDE.md

Guidance for Claude Code working in this repository.

## Project

Kaleb's personal portfolio, aimed at AI engineering internships. Visitors can read about his work or talk out loud to a **voice clone** that answers as Kaleb in his cloned voice. Read [GLOSSARY.md](GLOSSARY.md) for the project's vocabulary and [docs/architecture.md](docs/architecture.md) before changing the voice path.

**Where the site is going:** the wayfinder map, [issue #5](https://github.com/Kaleb-Nim/nim-kaleb/issues/5). It replaces the old design spec as the reference for what to build. `markokraemer-ui-design-spec.html` describes the original terminal look and is historical only.

### Constraints

- **Stack stays:** Next.js on Vercel for the site; the Bun ws-server on Alibaba Cloud ECS (`wss://ws.kalebnim.dev`) for voice.
- **The voice clone must sound conversational, not robotic.**
- **Secrets stay server-side.** DashScope keys and the voice ID never reach the browser.
- **Bun, not npm/node. uv, not pip.**
- Lifted: the voice pipeline no longer has to be Alibaba-only, and the terminal UI no longer has to stay intact (typographic remnants of it are welcome).

## Commands

```bash
bun dev                 # Next.js dev server, http://localhost:3000
bun run build           # production build
bun run lint            # ESLint (currently fails on vendored/dist files, see docs/known-issues.md)
bun test                # Playwright suite (bunx playwright test)
bun test <file>         # a single bun:test unit file, e.g. app/lib/hackathonLinks.test.ts
bun run sync-context    # memory/raw/information.txt -> memory/context.json
cd ws-server && bun src/index.ts   # ws-server locally on :8080
```

## Layout

- `app/`: Next.js app. `components/` (with co-located `*.module.css`), `hooks/`, `lib/` (pure data and helpers; site content in `lib/sections.ts`), `data/hackathons.json`, `api/analytics/*`.
- `ws-server/src/`: Bun WebSocket server. `session.ts` orchestrates a voice session; `dashscope/{asr,llm,tts}.ts` wrap the providers; `logger.ts` writes per-turn latency NDJSON.
- `prompts/system-prompt.md`: everything the voice clone knows.
- `lib/schema.ts`, `lib/db.ts`: Drizzle schema and Neon client for optional analytics.
- `tests/`: Playwright E2E and ws-pipeline tests. `scripts/`: one-off tooling (voice enrolment, scrapers, context sync).
- `tts-server/`: Python TTS experiments (uv). Not deployed.

## Conventions

- Components are PascalCase `.tsx` with a default export. Hooks are `useX.ts` with named exports. Types and utilities use named exports. Import with the `@/*` alias (repo root).
- `'use client'` on interactive components. Styles live in CSS Modules; Tailwind is available but not used for bespoke component styling.
- Every `useEffect` that subscribes or opens something returns a cleanup. Keep refs (`wsRef`, `audioCtxRef`) for mutable non-render state.
- Narrow errors with `instanceof` and surface them into state. Only fire-and-forget calls (analytics) may swallow errors with `.catch(() => {})`.
- Server logs use bracket prefixes: `[ws]`, `[session]`, `[asr]`, `[llm]`, `[tts]`. Production browser code doesn't log.
- Comments explain why, not what. Use `// ── ` as a section divider in long functions.

## Agent skills

### Issue tracker

Work is tracked in GitHub Issues on `Kaleb-Nim/nim-kaleb`, planned through a wayfinder map with native sub-issues and dependencies. See `docs/agents/issue-tracker.md`.

### Domain docs

Single-context: `GLOSSARY.md` at the root, durable notes in `docs/`, ADRs in `docs/adr/` when they arise. See `docs/agents/domain.md`.

### Project skills

| Skill | Use for |
| --- | --- |
| `playwright-cli` (`.claude/skills/playwright-cli/`) | Driving a browser: navigation, forms, screenshots, tests. |
| `scqa-writing-framework` (`.claude/skills/scqa-writing-framework/`) | Structuring threads, articles and reports. |
