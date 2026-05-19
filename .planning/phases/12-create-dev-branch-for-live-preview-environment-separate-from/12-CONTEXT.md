# Phase 12: Dev Branch + Live Preview Environment — Context

**Gathered:** 2026-05-19
**Status:** Ready for planning
**Source:** Inferred from phase title + project infra memory (no /gsd-discuss-phase run)

<domain>
## Phase Boundary

This phase sets up a **long-lived `dev` branch** wired to a **stable, shareable Vercel preview URL**, separated from the production deployment that serves `kalebnim.dev` from `main`. It is purely a DevOps / deployment-workflow phase — no application code changes are required beyond docs.

In scope:
- Create `dev` branch from `main` on `origin`
- Configure Vercel project so `dev` produces a deterministic preview URL (custom subdomain preferred, alias URL acceptable)
- Mirror required environment variables into Vercel's Preview environment
- Document the branching/deploy model in the README
- Smoke-test the dev URL

Out of scope:
- Refactoring application code
- Changing the production deployment pipeline beyond what is required to keep it isolated from `dev`
- Setting up a third "staging" environment
- CI test pipelines (separate concern)

</domain>

<decisions>
## Implementation Decisions

### Branching Model
- `main` → production (`kalebnim.dev` + `nim-kaleb.vercel.app`) — unchanged
- `dev` → stable preview (long-lived branch, auto-deploy on push)
- feature branches → ephemeral PR previews (default Vercel behaviour)

### Vercel Configuration
- Use Vercel's **Git integration** (already linked: project `nim-kaleb`, org `kaleb-nims-projects`)
- Production branch stays `main` (do NOT change Production Branch setting)
- `dev` deploys as a Preview deployment — Vercel automatically aliases `nim-kaleb-git-dev-kaleb-nims-projects.vercel.app` (or similar) so the URL is stable across commits
- Preferred (if domain config straightforward): attach `dev.kalebnim.dev` to the `dev` git-branch alias for a clean shareable URL

### Environment Variables
- Mirror production env vars into Preview scope for keys the app needs at runtime
- At minimum: `OPENAI_API_KEY` (required for `/api/realtime/session` to function — the dev preview will be broken without it)
- Any other secrets in `.env.local` that the deployed app reads server-side
- Use `vercel env add <KEY> preview` or the dashboard — do NOT commit secrets

### Documentation
- Add a "Deployment" section (or extend existing) to README.md describing the three-tier model: `main` / `dev` / feature branches
- Note the dev URL for contributors

### Claude's Discretion
- Exact CLI commands vs. dashboard steps for Vercel configuration — choose CLI where reliable, dashboard where CLI is awkward (domain assignment is fine via dashboard)
- Whether to assign a custom subdomain (`dev.kalebnim.dev`) now or defer to a follow-up — prefer custom subdomain if DNS for `kalebnim.dev` is already managed
- Whether to include a `vercel.json` change — likely NOT needed, Git integration handles branch routing

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project state
- `.planning/ROADMAP.md` — Phase 12 goal + success criteria (just updated)
- `.vercel/project.json` — Vercel project linkage (projectId, orgId, projectName)
- `next.config.ts` — current Next.js config; note it shells out to `git log main` at build time (relevant: builds on the `dev` branch will still query `main`, which exists in the Vercel build container's checkout — verify this works in preview builds)
- `README.md` — destination for deployment docs

### Vercel reference (fetch via `vercel:vercel-cli` / `vercel:deployments-cicd` skills as needed)
- Vercel "Preview Deployments" and "Git Branch URL" docs
- `vercel env` CLI reference
- Vercel custom domains / branch-domain assignment docs

### Infra memory (point-in-time, verify before relying on)
- Production frontend: `nim-kaleb.vercel.app`, custom domain `kalebnim.dev`
- WS server: `wss://ws.kalebnim.dev` (Alibaba ECS) — independent of Vercel, no change needed for this phase
- API keys live in `.env.local` (uncommitted)

</canonical_refs>

<specifics>
## Specific Ideas

- Use `git checkout -b dev && git push -u origin dev` to create the branch
- Use `bunx vercel env pull` to inspect what env vars production currently has, then `bunx vercel env add <KEY> preview` for each one needed
- After first push to `dev`, the alias URL pattern Vercel uses is `<project>-git-<branch>-<team>.vercel.app` — capture the actual URL and put it in the README
- Smoke test: hit `/` (home directory), `#/work-experience`, and confirm no console errors; if voice path is exercised, confirm the WS server URL is the prod one (no separate dev WS server in scope)
- The `next.config.ts` `getLastMainCommitDate()` shells out to `git log main` — confirm Vercel preview builds for `dev` include `main` in the checkout (default Vercel git integration does a full clone, so this should be fine; verify after first deploy)

</specifics>

<deferred>
## Deferred Ideas

- Separate dev WS server (current setup uses prod WS server at `ws.kalebnim.dev` for both envs — acceptable for now)
- Per-environment feature flags
- Automated promotion `dev` → `main` via PR template
- A third "staging" tier

</deferred>

---

*Phase: 12-create-dev-branch-for-live-preview-environment-separate-from*
*Context inferred from phase title — no /gsd-discuss-phase was run (autonomous mode)*
