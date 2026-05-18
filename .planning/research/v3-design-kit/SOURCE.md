# v3.0 Design Kit — Source Reference

**Origin:** Anthropic design system `pz0qDtAzozp6fFUWVhYlTg`
**Fetched:** 2026-05-18 via `/v1/design/h/...` (gzipped tarball)
**User instruction:** "Fetch this design file, read its readme, and implement the relevant aspects of the design. Implement: `ui_kits/terminal/index.html`. Only do work experience and the initial index.html file. I'm still finalizing the UI designs for the meetups, hackathons, sidequests, hobbies, and links."

## What's in this folder

Pristine copies of the JSX prototype files — do **not** edit them. They are the design contract for Phase 10 (home) and Phase 11 (work experience). Implementation lives under `app/` and translates these from `text/babel` JSX into Next.js client components.

| File | Used by | Notes |
|------|---------|-------|
| `README.md` | both phases | Original kit README |
| `index.html` | Phase 10 | Hash router, HomePage, VoiceOverlay, NotFoundPage |
| `index-data.jsx` | Phase 10 + 11 | Source-of-truth for LINKS, WORK_ITEMS, SECTIONS |
| `Directory.jsx` | Phase 10 | DirRow tap-target rows |
| `pages.jsx` | Phase 11 (WorkPage + PageHeader + FooterMeta) | Other page components are reference-only — sections beyond `work` ship as stubs in v3.0 |
| `FloatingMic.jsx` | Phase 10 | Bottom-anchored mic button |
| `VoicePanel.jsx` | Phase 10 | Overlay content — needs to be wired to existing `useRealtimeVoice` instead of the prototype's canned flow |
| `Starfield.jsx`, `Terminal.jsx`, `TerminalBody.jsx` | reference only | We already have functional equivalents under `app/components/` — port styling, not the components |
| `colors_and_type.css` | both phases | Token reference for phosphor green / gold / spacing / glow |

## What we ship in v3.0

- Phase 10: home + routing shell + floating voice overlay + stub pages for other 5 sections
- Phase 11: `#/work-experience` only

## What we don't ship in v3.0

- `MeetupsPage`, `HackathonsPage`, `SidequestsPage`, `HobbiesPage`, `LinksPage` — render `coming soon` stubs that link back to home. Their final UI is still being finalised by Kaleb.
