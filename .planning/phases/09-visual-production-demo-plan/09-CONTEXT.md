# Phase 9: Visual Production & Demo Plan - Context

**Gathered:** 2026-04-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Create all production assets needed for filming day: visual briefs for every Remotion-produced segment, a demo recording plan for the live site captures, and a shot list/production checklist so filming can start without open decisions.

</domain>

<decisions>
## Implementation Decisions

All creative decisions were locked in Phase 8 (SCRIPT.md + STORYBOARD.md). Phase 9 translates those documents into actionable production specs.

### From Phase 8 (locked)
- **D-01:** Cold open demo question: "Hey, who are you?"
- **D-02:** CTA: "Go talk to my AI clone yourself. please don't ask it something weird."
- **D-03:** Demo holds: 5s hook (Beat 1), 6-8s result (Beat 6)
- **D-04:** 3 Remotion segments: architecture before/after (Beat 4), code snippet connectingRef lock (Beat 5a), architecture comparison API routes vs ECS (Beat 5b)
- **D-05:** 2 demo recordings: cold open + result demo
- **D-06:** Talking head segments: Beats 2, 3, 4 (first 10s), 7 — ~32s total

### Claude's Discretion
- Filming setup details (camera, lighting, background, wardrobe)
- Demo recording methodology (screen capture tool, browser setup, fallback strategy)
- Remotion segment visual style (color scheme, animation approach, level of polish)
- Production day workflow and order of operations
- Number of takes per segment

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 8 Deliverables (primary input)
- `.planning/phases/08-script-storyboard/SCRIPT.md` — Complete 7-beat TikTok script with spoken words, visual annotations, and scholarship pointers
- `.planning/phases/08-script-storyboard/STORYBOARD.md` — Beat-by-beat storyboard with timing, visual types, frame descriptions, and production notes for Phase 9

### Project Context
- `.planning/PROJECT.md` — Architecture diagram, production URL (nim-kaleb.vercel.app), WS server details
- `.planning/REQUIREMENTS.md` — STORY-03, PROD-01, PROD-02 acceptance criteria

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None directly — Phase 9 produces documents (visual briefs, shot list), not code

### Established Patterns
- STORYBOARD.md "Production Notes for Phase 9" section already enumerates all assets needed
- Frame Descriptions in STORYBOARD.md provide detailed visual specs for complex beats

### Integration Points
- Visual briefs feed into Remotion segment production (separate video-production repo)
- Demo recording plan references the live site at nim-kaleb.vercel.app and WS server at ws.kalebnim.dev

</code_context>

<specifics>
## Specific Ideas

- STORYBOARD.md Frame Descriptions already contain detailed breakdowns for Beats 1, 4, 5a, 5b, and 6
- The architecture diagrams should match the style in PROJECT.md (box-and-arrow format)
- Code snippet (Beat 5a) uses terminal-themed styling consistent with the site (#00FF00 on dark background)

</specifics>

<deferred>
## Deferred Ideas

None — Phase 9 is the final phase in v2.0

</deferred>

---

*Phase: 09-visual-production-demo-plan*
*Context gathered: 2026-04-15*
