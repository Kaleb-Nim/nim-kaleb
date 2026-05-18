# Plan 11-02 Summary — Wire WorkPage into hash-route dispatcher

**Phase:** 11 — Work Experience Page
**Plan:** 11-02
**Status:** Complete (human-verified)
**Wave:** 2

## Changes

### Task 1: Dispatcher wire-up (commit `98d0be9`)

- `app/page.tsx`: added `import WorkPage from './components/WorkPage';`
- Replaced the `<StubSectionPage section={section} />` branch with a conditional:
  ```tsx
  section.id === 'work-experience' ? (
    <WorkPage section={section} />
  ) : (
    <StubSectionPage section={section} />
  )
  ```
- All other section slugs (`syai-meetups`, `hackathons`, `sidequests`, `hobbies`, `links`) still render the Phase 10 stub.

### Task 2: Human verification

User confirmed the page renders pixel-faithfully at desktop and mobile breakpoints. Approved.

## In-checkpoint copy + UX tweaks (committed during verify)

User-requested adjustments captured during visual review and committed as part of Phase 11:

| Commit | Change |
|---|---|
| `0d04ab2` | Added optional `tagLabel` field to `WorkItem`. Status node colour/symbol still keyed off `tag`; chip text now reads role-type label instead of pipeline status. |
| `6f7847e` | Renamed page title from `./work-experience — paid AI engineering` to `./work-experience — 3 years in AI Engineering Space`. |
| `817671c` | Intro CTA: appended `→ currently looking for freelance AI Engineering work`. Expanded RAiD note to "Building AI Air Traffic Controller Training Simulator: …" with sim-pilots → simulator-pilots wording. |

### Final tag labels

| Role | `tag` (drives node) | `tagLabel` (displayed chip) |
|---|---|---|
| RAiD | ACTIVE (◉ green) | `Full-time (NS)` |
| Tensorplex Labs | SHIPPED (● green) | `Intern` |
| ARTC AI Engineer | SHIPPED (● green) | `Contract` |
| ARTC Dev Sci Intern | ARCHIVED (○ dim) | `Intern` |

## Verification

- `bunx tsc --noEmit` exits 0
- `bun run build` exits 0
- `#/work-experience` renders the 4-role timeline (human-confirmed)
- All 3 logo PNGs return HTTP 200 from `/work-logos/`
- Other section routes still render Phase 10 stubs (no regression)
- Floating mic + VoiceOverlay flow intact

## Requirements satisfied

- WORK-06: FooterMeta + back-to-home link working
- WORK-01..05: visually confirmed live (already wired by Plan 11-01)

## Files modified

- `app/page.tsx` (dispatcher swap)
- `app/lib/sections.ts` (tagLabel additions, title + intro copy, RAiD note expansion)
- `app/components/WorkPage.tsx` (chip renders `tagLabel || tag`)

## Follow-ups (deferred)

- If the CTA should be a visually distinct gold chip rather than appended intro text, add a dedicated `cta?: string` field to `Section` and render in `PageHeader`. Not blocking — punted to a future copy/polish phase.
