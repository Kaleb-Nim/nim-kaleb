---
phase: 08-script-storyboard
plan: 01
subsystem: documentation
tags: [script, storyboard, tiktok, video, scholarship]
dependency_graph:
  requires: []
  provides: [SCRIPT.md, STORYBOARD.md]
  affects: [phase-09-visual-production]
tech_stack:
  added: []
  patterns: [7-beat-tiktok-narrative, beat-by-beat-storyboard]
key_files:
  created:
    - .planning/phases/08-script-storyboard/SCRIPT.md
    - .planning/phases/08-script-storyboard/STORYBOARD.md
  modified: []
decisions:
  - "Demo question for cold open: 'What's the hardest bug you've ever fixed?' -- produces personality-revealing AI response"
  - "Architecture diagram uses before/after split layout with date labels (March 2026 / April 2026)"
  - "Result demo uses different question than hook to show range of AI responses"
  - "CTA presented as two variations for Kaleb to choose: bio link vs 'ask it something weird'"
metrics:
  duration: 235s
  completed: 2026-04-15
---

# Phase 8 Plan 01: Script & Storyboard Summary

TikTok narrative script (218 spoken words, 7 beats, ~90s total) and production-ready storyboard with frame descriptions for all visual beats, covering the full project arc from Groq/Claude/Qwen pipeline through two pivots to shipped voice-cloning portfolio on Alibaba Cloud ECS.

## What Was Done

### Task 1: TikTok Narrative Script (SCRIPT.md)

Created complete 7-beat script following TikTok retention structure:

1. **Hook (0:00-0:05):** Silent cold open demo -- nim-kaleb.vercel.app with AI responding to "What's the hardest bug you've ever fixed?" in Kaleb's cloned voice. 5-second hold, no voiceover.
2. **Open Loop (0:05-0:10):** "I built an AI clone of myself that visitors can actually talk to. But I had to rebuild everything halfway through."
3. **Problem/Context (0:10-0:22):** Establishes why (portfolio as conversation), first pipeline attempt (Groq + Claude + Qwen local), STT 500 errors.
4. **Mechanism/Pivots (0:22-0:40):** Two pivots compressed -- OpenAI Realtime API (deleted 500 lines but no voice cloning), then Alibaba Cloud DashScope with Qwen3-TTS voice cloning on Bun server in Singapore.
5. **Support Beats (0:40-0:55):** Race conditions (connectingRef lock, barge-in, audio cutoff) and architecture leap (3 API routes to full ECS WebSocket server, two complete rebuilds).
6. **Result (0:55-1:03):** Second demo hold (6s) showing voice quality, then "It shipped. And it actually sounds like me."
7. **CTA (1:03-1:10):** Two variations for Kaleb to choose.

Script metadata includes scholarship pointer coverage table, 4 git commit references, and 3 open questions for Kaleb.

### Task 2: Beat-by-Beat Storyboard (STORYBOARD.md)

Created production-ready storyboard with:

- **7-row table** with columns: Beat, Start, End, Duration, Spoken Words preview, Visual Type, Visual Description, Scholarship Pointer
- **4 detailed frame descriptions** for complex visual beats (Hook demo, Mechanism architecture transition, Support code snippet, Result second demo)
- **Production notes** for Phase 9 listing:
  - 2 demo recordings needed (cold open + result, different questions)
  - 3 Remotion segments needed (before/after architecture, connectingRef code snippet, API routes vs ECS comparison)
  - Talking head segment requirements (~32 seconds total)
  - Timing verification (77s spoken + 13s holds = ~90s total)

## Verification Results

| Check | Result |
|-------|--------|
| SCRIPT.md exists | PASS |
| 7 beat headings | PASS (7) |
| Word count 200-240 | PASS (218) |
| VISUAL annotations | PASS (7 beats) |
| SCHOLARSHIP annotations | PASS (5 beats) |
| "rebuild/rebuilt" present | PASS |
| Git commit references >= 2 | PASS (4: e4b8fc2, 45ede85, 6168e9b, 413cf51) |
| No "scholarship" in spoken text | PASS |
| Two CTA variations | PASS |
| Hook specifies demo question | PASS |
| STORYBOARD.md exists | PASS |
| 7 storyboard rows | PASS |
| Frame Descriptions section | PASS |
| Production Notes section | PASS |
| Demo holds 5+ seconds | PASS (Hook: 5s, Result: 8s) |
| Beat names match between docs | PASS |

## Decisions Made

1. **Demo question:** "What's the hardest bug you've ever fixed?" -- chosen because it produces a personality-revealing, technically interesting AI response that doubles as proof the system works.
2. **Architecture diagram layout:** Before/after split with date labels and color-coded overlays (red X / green checkmark) for immediate visual comprehension.
3. **Result demo differentiation:** Uses a different question ("Tell me about a project you're proud of") to show the AI's range and conversational depth, not just repeat the hook.
4. **CTA as choice:** Two variations presented rather than one -- Kaleb picks the one matching his style.

## Deviations from Plan

None -- plan executed exactly as written.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1 | f5c1e38 | Write TikTok narrative script with 7-beat structure |
| Task 2 | bc8ec80 | Create beat-by-beat storyboard with frame descriptions |

## Self-Check: PASSED

All files found. All commits found.
