# Phase 8: Script & Storyboard - Context

**Gathered:** 2026-04-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Create a complete, approved script and beat-by-beat storyboard for a 1-2 minute TikTok-first scholarship application video showcasing the AI Voice Portfolio project. Deliverables are the written script and storyboard document only — visual production assets, demo recordings, and shot lists belong in Phase 9.

</domain>

<decisions>
## Implementation Decisions

### Hook & Open Loop
- **D-01:** Cold open with live demo — video starts by showing the AI voice responding on the site. No voiceover setup or question hook. Make the demo moment itself engaging (e.g., through the question being asked or the AI's response).
- **D-02:** Open loop: "But I had to rebuild everything halfway through" — teases the API pivot story, pays off later in the narrative.

### Narrative Voice & Tone
- **D-03:** Energetic creator tone — punchy sentences, confident delivery, fast-paced TikTok energy. Not casual rambling, not formal presentation.
- **D-04:** Scholarship pointers (context, what was built, what was tried, what surprised Kaleb) are invisibly woven into the story. Never say "scholarship" on camera. Let the project story naturally hit all the pointers.

### Technical Story Selection
- **D-05:** Two lead technical moments: (1) API pivot from OpenAI Realtime API to Alibaba Cloud DashScope — full pipeline rebuild mid-project, pays off the open loop; (2) Voice cloning — getting Qwen3-TTS to actually sound like Kaleb, not robotic.
- **D-06:** Two supporting quick beats (1-2 sentences each): (1) Audio race conditions — barge-in overlap, audio cutoff bugs; (2) Architecture leap — going from a simple Next.js site to a full WS server on ECS with a 3-stage streaming pipeline.

### Visual Pacing & Beat Balance
- **D-07:** Demo sections (live site, AI voice responding) get longer visual holds so viewers can absorb what they're seeing. Talking head and code snippet beats cut fast.
- **D-08:** Visual type balance (ratio of talking head vs screen demo vs diagrams vs code) is at Claude's discretion per beat — optimize for engagement and clarity.

### Claude's Discretion
- Visual type balance per beat (D-08)
- Exact word count within the 150-300 word range
- CTA content and phrasing
- How to structure the "result" beat of the TikTok narrative arc

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Full project overview, architecture diagram, key decisions (especially API pivot rationale)
- `.planning/REQUIREMENTS.md` — SCRIPT-01 through STORY-02 requirements with acceptance criteria

### Technical Story Source Material
- Git history (`git log --oneline`) — Source for specific technical examples; API pivot commits, audio bug fix commits, voice cloning work
- `.planning/milestones/v1.0-ROADMAP.md` — Full v1.0 phase breakdown showing the project's technical journey

### Narrative Structure
- REQUIREMENTS.md SCRIPT-01 — Defines the TikTok narrative structure: hook → open loop → problem → mechanism → result → CTA

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None directly — Phase 8 produces documents (script, storyboard), not code

### Established Patterns
- Project uses GSD planning artifacts (PLAN.md, SUMMARY.md) — script and storyboard should follow structured document patterns for downstream consumption by Phase 9

### Integration Points
- Storyboard beat-by-beat document feeds directly into Phase 9's visual briefs and demo recording plan
- Script timing annotations will drive Phase 9's Remotion segment planning

</code_context>

<specifics>
## Specific Ideas

- The open loop "But I had to rebuild everything halfway through" directly sets up the API pivot from OpenAI to Alibaba as the narrative climax
- The cold open should show an engaging interaction with the AI clone — the question asked or the AI's response should be interesting enough to hook the viewer without any setup
- Voice cloning story should emphasize the gap between "robotic TTS" and "sounds like me" — the before/after contrast
- Audio race conditions and architecture leap are quick "and then THIS happened" beats, not deep dives

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 08-script-storyboard*
*Context gathered: 2026-04-15*
