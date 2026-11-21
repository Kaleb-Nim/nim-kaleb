# Round 3: direction E as a full page (issue #9)

Kaleb picked E ("Cutting room") from round 2 and asked for the fixes in [ROUND3.md](../ROUND3.md). Route: `/prototypes/e`. Round-2 E is in git history (commit 0adb165); D is kept for reference and is off the table.

## The round 3 list, point by point

1. **One palette.** The Overlay Notes chapter keeps its motifs (hand-lettered name, a squiggle that draws itself, the pinned browser with Kaleb's real notes drawing themselves, the taped screenshot) but renders in E's palette (`OverlayChapter variant="suite"`). Marks on the white lecture page use a dark amber, not violet.
2. **Soft transitions.** No section borders or colour blocks. The two grade lights cross-fade over 1.6 s as each chapter crosses the middle of the screen. Section labels are clip chips: an amber in-point, the name and a timecode.
3. **Product names are the headlines.** HOUSECUT and OVERLAY NOTES, with the tagline as a subhead and "Products I've built · now building / shipped" as the label.
4. **Metrics, not price.** Each product shows its numbers as count-ups. Overlay Notes: 600 installs, version 1.2.0, Top 20 of 65. Housecut: 3 cuts per listing and 24 hours turnaround are real; agents served and listings delivered are **TODO(Kaleb)** placeholders, drawn in outlined red so they can't ship by accident. The problem statement leads the Housecut copy.
5. **"My part" is gone.** The editor-tracks animation is now "How Housecut works".
6. **Full page.** Products, Work experience, Hackathons, AI community events, Hobbies and Links are all top-level sections, in the top nav and as clickable clips on the bottom timeline (Slate + the six). Each has its own treatment: a career timeline whose role clips render as you scroll; film-frame win photos plus a scrolling film strip of the other 19 projects; a pinned sideways reel of the Singapore Youth AI sessions with the Claude Code workshop featured; clapperboard slates for hobbies; and a wrap card with the voice clone and links.
7. **Privacy.** The three Cuts that ended on an agent's name and phone number (v1–v3) are trimmed to stop before that end card; every frame was checked. The other five never showed either. The agent's face still appears in v1–v3. The media stays in the gitignored `public/prototype-media/` until Kaleb decides.
8. **Hero.** The voice-clone audio track and record button are kept; "It doesn't do retakes." is still pending Kaleb's sign-off.

## Checks

- Krebs's scorer (design-slop-cop): 1/14, Perma dark (deliberate). Gradients was tripping on CSS-drawn sprocket holes, clapper stripes and scanlines; those are now SVG patterns, so the count reflects real decoration only.
- Extra checks: no icon cards, no shadcn, no em dashes. HOUSECUT and OVERLAY NOTES are set in caps per the brief, which the all-caps check counts.
- 390px: no horizontal scroll; the Overlay demo browser stays on screen.
- Copy: meetup text from `sections.ts` has its em dashes swapped for colons at render time (`clean()` in EClient); the source file is unchanged.
