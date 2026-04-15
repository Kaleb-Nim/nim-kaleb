# Quick Task 260415-l3w: Add important links to terminal page - Context

**Gathered:** 2026-04-15
**Status:** Ready for planning

<domain>
## Task Boundary

Replace some rows in the CognitiveStatus dashboard with real contact/link info while keeping the terminal aesthetic and some joke rows.

</domain>

<decisions>
## Implementation Decisions

### Link placement
- Replace rows in the existing CognitiveStatus component (app/components/CognitiveStatus.tsx)
- Keep the two-column monospace dashboard format
- Do NOT add a new section — links live inside the existing status grid

### Row content
- Row 1: LinkedIn (left) + GitHub (right) — real links
- Row 2: Email (left) + Resume/CV (right) — real links
- Row 3: Coffee Consumed (left, joke) + Side Projects (right, joke) — keep as-is
- Row 4: Prod Incidents (left, joke) + Emotion Index (right, joke) — keep as-is
- Remove the 5th row (Neural Activity / Model) — cut from 5 to 4 rows

### CV delivery
- Copy /Users/kalebnim/Downloads/Kaleb CV.pdf to public/kaleb-cv.pdf
- Served as static file at /kaleb-cv.pdf
- No external hosting dependency

### Link interaction
- Value portion of link rows is a clickable `<a>` tag
- Styled in gold (#FFD700) to match the existing highlight color
- LinkedIn + GitHub + Resume: open in new tab (target="_blank")
- Email: mailto: link
- Label portion stays green (#00FF00) like normal status rows

### Terminal theme compliance
- Keep monospace pre-formatted alignment (padEnd pattern)
- Keep row-by-row typewriter animation
- Keep responsive single-column fallback for mobile
- Links should have subtle hover state (underline or brightness) but nothing that breaks the terminal feel

</decisions>

<specifics>
## Specific Ideas

- LinkedIn: https://www.linkedin.com/in/kaleb-nim/
- GitHub: https://github.com/Kaleb-Nim
- Email: kaleb.nim@gmail.com
- CV PDF source: /Users/kalebnim/Downloads/Kaleb CV.pdf → public/kaleb-cv.pdf
- Display text for resume value: "Download CV [PDF]" or similar terminal-style label

</specifics>
