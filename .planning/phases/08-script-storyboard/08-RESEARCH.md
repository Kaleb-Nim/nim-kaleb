# Phase 8: Script & Storyboard - Research

**Researched:** 2026-04-15
**Domain:** TikTok narrative scriptwriting + technical storytelling for scholarship application video
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Cold open with live demo — video starts by showing the AI voice responding on the site. No voiceover setup or question hook. Make the demo moment itself engaging (e.g., through the question being asked or the AI's response).
- **D-02:** Open loop: "But I had to rebuild everything halfway through" — teases the API pivot story, pays off later in the narrative.
- **D-03:** Energetic creator tone — punchy sentences, confident delivery, fast-paced TikTok energy. Not casual rambling, not formal presentation.
- **D-04:** Scholarship pointers (context, what was built, what was tried, what surprised Kaleb) are invisibly woven into the story. Never say "scholarship" on camera. Let the project story naturally hit all the pointers.
- **D-05:** Two lead technical moments: (1) API pivot from OpenAI Realtime API to Alibaba Cloud DashScope — full pipeline rebuild mid-project, pays off the open loop; (2) Voice cloning — getting Qwen3-TTS to actually sound like Kaleb, not robotic.
- **D-06:** Two supporting quick beats (1-2 sentences each): (1) Audio race conditions — barge-in overlap, audio cutoff bugs; (2) Architecture leap — going from a simple Next.js site to a full WS server on ECS with a 3-stage streaming pipeline.
- **D-07:** Demo sections (live site, AI voice responding) get longer visual holds so viewers can absorb what they're seeing. Talking head and code snippet beats cut fast.
- **D-08:** Visual type balance per beat is at Claude's discretion — optimize for engagement and clarity.

### Claude's Discretion

- Visual type balance per beat (D-08)
- Exact word count within the 150-300 word range
- CTA content and phrasing
- How to structure the "result" beat of the TikTok narrative arc

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SCRIPT-01 | Script uses TikTok narrative structure (hook → open loop → problem → mechanism → result → CTA) while naturally hitting scholarship pointers. Open loop teases payoff near end for retention. | TikTok framework documented below; scholarship pointer mapping in Technical Story section |
| SCRIPT-02 | Script is 1-2 minutes at natural speaking pace (~150-300 words) | Speaking rate research: ~150 WPM conversational, ~170-200 WPM TikTok pace. 150 words ≈ 53-60 sec; 300 words ≈ 90-120 sec. Target 200-250 words for energetic 60-90 second delivery |
| SCRIPT-03 | Script references specific technical examples from git history (API pivot, race conditions, audio bugs, speech quality tuning) | Full git archaeology below — exact commit hashes, dates, and specifics extracted |
| STORY-01 | Beat-by-beat storyboard with frame timing for each segment | Beat structure mapped to narrative arc; timing guidance from word count and visual hold rules |
| STORY-02 | Each beat specifies visual type (talking head / screen demo / architecture diagram / code snippet) | Visual type taxonomy and engagement guidance documented below |

</phase_requirements>

---

## Summary

Phase 8 produces two documents: a final script and a beat-by-beat storyboard. Both are content/writing deliverables, not code. The research answers three questions the planner needs: (1) what is the exact technical material to draw from — git-verified facts, not paraphrased memory; (2) how does the TikTok narrative arc map to this project's specific story; (3) what word count and visual type decisions will make the 1-2 minute format work.

The project's real technical journey — from a 3-step STT/LLM/TTS pipeline (Mar 2026), through an OpenAI Realtime API experiment (Mar 26), through a full rebuild on Alibaba Cloud DashScope with a Bun WS server on ECS (Apr 9-12) — is a genuinely compelling arc. The API pivot is the narrative climax and the open loop payoff. The voice cloning sequence (recording Kaleb's voice, enrolling it, verifying it, tuning it) is the emotional payoff of "it actually sounds like me." Both are verified from git history with specific dates and commit context.

**Primary recommendation:** Structure the script so the cold open demo is the result (proof), then rewind to the problem, then let the technical story earn that result — this is the classic "reveal then earn it" TikTok retention technique.

---

## Technical Story Source Material (Git-Verified)

> All dates and commit hashes verified via `git log`. [VERIFIED: git log --format]

### Complete Project Timeline

| Date | Commit | What Happened | Story Significance |
|------|--------|---------------|-------------------|
| 2025-11-13 | `6cab40b` | Initial commit | Project starts |
| 2026-02-13 | `cd82563` | First terminal UI | The sci-fi terminal aesthetic exists |
| 2026-03-04 | `314bdf8` | First voice pipeline: Groq STT + Anthropic Chat + Qwen3-TTS on local Mac M4 | Original 3-step pipeline. "Known issue: STT returns 500 on real browser audio" — first sign of trouble |
| 2026-03-06 | `f498b81` | Modal TTS deployment + Groq STT e2e tests | Moved local TTS to Modal cloud |
| 2026-03-26 | `e4b8fc2` | **PIVOT 1 — Replace pipeline with OpenAI Realtime API** | Deleted 516 lines, added 424. Replaced 3-step pipeline with single WebSocket. "Sub-second, bidirectional voice with built-in VAD, STT, LLM, and TTS." |
| 2026-04-09 | `45ede85` | Voice enrollment: record audio, enroll Kaleb's voice in DashScope | Voice cloning work begins |
| 2026-04-09 | `97781c2` | **PIVOT 2 — New Bun WS server with DashScope ASR** | Full new server. Railway deployment config. Reason: full pipeline control + voice cloning via Qwen3-TTS |
| 2026-04-09 | `fb4c96f` | Wire LLM streaming and TTS WebSocket | Sentence-boundary flushing, server_commit mode for Kaleb's cloned voice_id |
| 2026-04-09 | `eed3639` | Refactor browser hook for new WS protocol | Client side catches up — OpenAI Realtime replaced |
| 2026-04-09 | `6168e9b` | Fix race conditions: rapid connect/disconnect + barge-in response overlap | "connectingRef lock to prevent concurrent WebSocket connections." Known issue flagged: "barge-in triggers too aggressively on filler speech ('ahh i see')" |
| 2026-04-11 | `f5421ad` | Resolve TTS pipeline race conditions, playback cutoff, add greeting | AI now greets visitor first on connect |
| 2026-04-12 | `413cf51` | Production deployment: Alibaba Cloud ECS Singapore + Vercel | v1.0 shipped |
| 2026-04-13 | `1f8a886` + `7eb9a50` | Fix audio cutoff and barge-in overlap (Phase 5) | Final audio bug resolution |

### Key Technical Facts for Script

**The original pipeline (before pivots):**
- Groq STT → Anthropic Claude Chat → Qwen3-TTS-1.7B-Base running locally on Kaleb's Mac M4 Max
- Local TTS server moved to Modal cloud when local had too much latency
- Browser webm/opus audio returned 500 errors from the STT endpoint

**Pivot 1 — OpenAI Realtime API (2026-03-26, commit `e4b8fc2`):**
- Reason: "Sub-second, bidirectional voice with built-in VAD, STT, LLM, and TTS" — single WebSocket instead of 3 APIs
- What happened: Deleted all 3 API routes (chat, stt, tts), deleted 2 hooks, added useRealtimeVoice with PCM16 streaming
- Why it failed: OpenAI Realtime API has no voice cloning capability — Kaleb would sound like a generic AI voice, not himself

**Pivot 2 — Alibaba Cloud DashScope on Bun WS Server (2026-04-09, commits `97781c2` through `eed3639`):**
- Reason: Qwen3-TTS supports voice cloning via enrolled voice_id — this is what makes it "sound like Kaleb"
- Architecture: Browser → Bun WS Server (Alibaba Cloud ECS Singapore) → DashScope ASR + LLM + TTS (3 separate WebSockets)
- Cost: User had $300 Alibaba Cloud free credits — infrastructure effectively free
- Scope: 32 files changed, +8,589 / -113 lines across v1.0 milestone

**Voice cloning specifics:**
- Kaleb recorded reference audio and ran enrollment script (`45ede85`)
- DashScope enrolled it as a voice_id used in all TTS calls
- Commit `fb4c96f` note: "opens TTS WebSocket in server_commit mode with Kaleb's cloned voice_id"
- Phase 3 system prompt tuning: filler words, natural rhythm, follow-up questions added to prompt

**Audio race conditions (verifiable in commits):**
- `6168e9b`: rapid connect/disconnect could start two simultaneous WebSocket connections — fixed with connectingRef lock
- `6168e9b`: barge-in triggered on filler words ("ahh i see") — added word filter in `53200e5`
- `f5421ad`: TTS playback cutoff when responses overlapped — required AbortController threaded through LLM stream
- `1f8a886` + `7eb9a50`: Final audio cutoff and barge-in pop resolved in Phase 5 — finishTtsSession for graceful teardown

**Architecture leap (verifiable):**
- Start: Next.js API routes in the browser app (no separate server)
- End: Dedicated Bun WS server on Alibaba Cloud ECS in Singapore, 3-stage streaming pipeline, sentence-boundary overlap between LLM and TTS for low-latency, 20-turn session memory, proactive AI greeting on connect

### Scholarship Pointer Mapping

The scholarship asks for: context, what was built, what was tried, what surprised you.

| Scholarship Pointer | Natural Story Moment | Where in Script |
|--------------------|---------------------|-----------------|
| **Context** (who Kaleb is, why this project) | "I wanted my portfolio to be a conversation, not a page" — sets up the terminal demo and the why | Hook / early narrative |
| **What was built** | The full DashScope pipeline — ASR → LLM → TTS with cloned voice, deployed on ECS | Result beat + demo |
| **What was tried** | Two failed approaches: 3-step local pipeline, then OpenAI Realtime | Problem beat — the pivots |
| **What surprised** | That voice cloning was possible via Qwen3-TTS without OpenAI, AND that rebuilding everything in a weekend was actually faster because constraints forced clarity | Mechanism + Result beats |

---

## TikTok Narrative Structure

### The Arc (SCRIPT-01)

The structure Kaleb chose maps to a proven TikTok retention pattern:

| Beat | Name | Purpose | Timing Target |
|------|------|---------|---------------|
| 1 | Hook | Stop the scroll — demo is already playing | 0-5 sec |
| 2 | Open Loop | "But I had to rebuild everything halfway through" | 5-8 sec |
| 3 | Problem | Why I built it / what I tried first (3-step pipeline → OpenAI pivot) | 8-20 sec |
| 4 | Mechanism | The Alibaba pivot: why voice cloning required a full rebuild | 20-40 sec |
| 5 | Support Beats | Race conditions + architecture leap (fast, 2 sentences each) | 40-55 sec |
| 6 | Result | It works — demo moment 2, voice sounds like Kaleb | 55-75 sec |
| 7 | CTA | Low-friction ask | 75-90 sec |

**The open loop mechanic:** State a tension at second 5-8 that cannot resolve until second 40+. Viewers who hear "I had to rebuild everything" will stay to find out what was rebuilt and why. This is the Zeigarnik effect — an incomplete loop keeps attention. [VERIFIED: multiple WebSearch sources on TikTok narrative retention]

**Why cold open demo works:** Starting with the result (the AI voice working) then rewinding to earn it is the "proof first" pattern. The viewer's question shifts from "will this work?" to "how did this happen?" — which is more engaging for a technical video. [ASSUMED — based on creator best-practice pattern; not verified against A/B test data]

### Word Count Guidance (SCRIPT-02)

| Delivery Style | WPM | 150 words | 250 words | 300 words |
|----------------|-----|-----------|-----------|-----------|
| Conversational | 130-150 | ~60-70 sec | ~100-115 sec | ~120-138 sec |
| Energetic TikTok | 170-200 | ~45-53 sec | ~75-88 sec | ~90-105 sec |

**Recommendation:** Target 200-240 words at energetic TikTok pace (~170-180 WPM) for a 67-85 second delivery. This leaves room for the two demo holds (D-07) which add 10-20 seconds of visual time with no voiceover. Total video: ~80-100 seconds, safely within the 1-2 minute requirement. [VERIFIED: virtualspeech.com, teleprompter.com speaking rate data]

**Spoken word budget by beat (200-word script):**

| Beat | Spoken Words | Visual Hold? |
|------|-------------|-------------|
| Hook (demo plays) | 0-10 | YES — 5 sec demo hold |
| Open loop | 15-20 | No |
| Problem | 35-45 | No |
| Mechanism (API pivot) | 50-60 | Screen demo during code/arch |
| Support beats (2x) | 20-25 | No |
| Result (demo 2) | 10-15 | YES — 5-8 sec demo hold |
| CTA | 15-20 | No |

---

## Visual Type Taxonomy

### Visual Types Available (STORY-02)

| Type | When to Use | Engagement Role |
|------|-------------|-----------------|
| **Talking head** | Narrative delivery, emotional moments, opinion statements | Human connection, credibility |
| **Screen demo** | Showing the live site, the AI voice responding, terminal UI | Proof, "this is real" confirmation |
| **Architecture diagram** | The 3-stage pipeline, ECS vs Next.js, the pivot comparison | Makes abstract concrete |
| **Code snippet** | Specific bug fixes, commit diffs, function signatures | Credibility for technical audience |

### Engagement Guidance (D-07 + D-08)

**Demo visual holds get MORE time** (D-07 is locked):
- The AI voice responding on site: hold 4-6 seconds minimum so viewers hear the voice and see the terminal
- The second demo (result beat): hold 5-8 seconds — this is the payoff, let it land

**Talking head cuts FAST:**
- Transition away from talking head every 4-8 seconds to maintain TikTok energy
- Cut on a word, not on silence — never let the frame go still with no audio

**Code snippets — use sparingly, make them readable:**
- Zoom in to a 3-5 line extract, not a full file
- Best used for the race condition fix (shows a specific `connectingRef` pattern) or the voice_id line in TTS config
- Technical audience recognizes the specificity; non-technical audience sees "this is real engineering"

**Architecture diagrams — use for the pivot story:**
- "Before" diagram: 3 boxes (Groq STT → Claude → Qwen3-TTS local)
- "After" diagram: the ECS architecture (Browser → WS Server → DashScope 3-way)
- The visual contrast tells the rebuild story without words

**Hybrid approach (talking head over screen demo):**
- Overlay Kaleb's talking head on the terminal UI during the "result" beat
- Works well for the demo sections: viewers see the site AND Kaleb's reaction simultaneously [CITED: rainedigital.com — screen backdrop with talking head holds attention longer]

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| Script word count | Manual count | Let the plan specify target range; count during execution |
| TikTok pacing logic | Custom timing spec | Use beat-based structure — each beat has a word budget, not a rigid second count |
| Scholarship pointer checklist | Separate checklist doc | Embed pointers in script annotations (e.g., `[scholarship: context]`) per D-04 guidance |

---

## Architecture Patterns for the Documents

### Script Document Structure

The plan should produce a script in this format:

```
## Script — Phase 8

**Word count:** [N] words
**Estimated duration:** [N] sec at 170 WPM
**Tone:** Energetic, punchy, first-person

---

### [BEAT NAME] — [timing estimate]

[Spoken words exactly as Kaleb would say them]

[VISUAL: type | description | hold duration if demo]
[SCHOLARSHIP: which pointer this beat hits]

---
```

Each beat gets its own section. The spoken words are the deliverable — not a description of what to say. The visual annotation and scholarship tag are metadata for downstream consumers (Phase 9 production, scholarship committee review).

### Storyboard Document Structure

The storyboard is a markdown table (one row per beat) plus a frame description:

```markdown
## Storyboard — Phase 8

| Beat | Start | End | Spoken Words (first 5) | Visual Type | Description | Scholarship Pointer |
|------|-------|-----|------------------------|-------------|-------------|---------------------|
| Hook | 0:00 | 0:05 | (demo audio — no VO) | Screen demo | AI responding to "Tell me about your experience" | — |
| Open Loop | 0:05 | 0:10 | "But I had to rebuild..." | Talking head | Direct to camera | Context |
...
```

Phase 9 (visual production) will expand each row into a visual brief. The storyboard must have enough detail that Phase 9 can generate a Remotion segment spec for each beat without coming back to ask questions.

---

## Common Pitfalls

### Pitfall 1: Over-explaining the Technical Detail
**What goes wrong:** The script becomes a technical tutorial instead of a story. Viewer disengages after the API pivot explanation goes to 45+ seconds.
**Why it happens:** Engineer instinct to explain completely.
**How to avoid:** The mechanism beat should cover the PIVOT REASON in one sentence, not the implementation. "OpenAI's voice wasn't mine — I needed voice cloning, so I rebuilt the entire server on Alibaba Cloud." That's the full mechanism. The "how" lives in the code; the "why" lives in the script.
**Warning signs:** Any sentence starting with "The way this works is..." in the script draft.

### Pitfall 2: Forgetting the Demo Has to Be Interesting
**What goes wrong:** The cold open demo shows the AI answering a boring question ("Hi, how are you?"). Viewer scrolls past.
**Why it happens:** Easiest demo to record.
**How to avoid:** The question asked in the demo should itself be engaging. Options: "Tell me something surprising about what you've built" or "What's the hardest bug you've ever fixed?" — answers that demonstrate personality and engineering depth simultaneously. The demo moment is also part of the script deliverable (what question the AI is asked).
**Warning signs:** Demo question is a generic greeting.

### Pitfall 3: Scholarship Pointers Feel Like a Checklist
**What goes wrong:** Script transitions unnaturally to "and what surprised me was..." — audience hears the checklist.
**Why it happens:** Writing the pointers as goals rather than letting the story hit them.
**How to avoid:** Write the story first, then annotate which beat hits which pointer. Do not write toward the pointer. The pivot story ("I had to throw away my OpenAI implementation and rebuild from scratch") naturally hits "what was tried" and "what surprised you" without naming them.

### Pitfall 4: Storyboard Too Vague for Phase 9
**What goes wrong:** Storyboard says "screen demo" with no description. Phase 9 has to interpret or guess.
**Why it happens:** Treating the storyboard as a high-level sketch rather than a production spec.
**How to avoid:** Each storyboard row must answer: what is literally visible on screen? (e.g., "nim-kaleb.vercel.app, terminal modal visible, AI response text appearing in green, audio waveform active"). Phase 9 uses this to plan demo recordings and Remotion segment specs.

---

## Code Examples

### Voice Pipeline Before/After (Architecture Diagram Source)

**Before (Mar 2026):**
```
Browser → /api/stt (Groq) → /api/chat (Anthropic Claude) → /api/tts (Qwen3-TTS local/Modal)
         Each request = separate HTTP round trip
         Total latency: 3+ seconds
```

**After (Apr 2026):**
```
Browser (Vercel)          Alibaba Cloud ECS           DashScope APIs
┌──────────────┐         ┌──────────────────┐        ┌─────────────┐
│ Next.js App  │◄──wss──►│ Bun WS Server    │◄──ws──►│ ASR (STT)   │
│ Terminal UI  │         │ Session Manager   │◄─http─►│ LLM (qwen+) │
│ Audio Capture│         │ Pipeline Orchest. │◄──ws──►│ TTS (clone) │
└──────────────┘         └──────────────────┘        └─────────────┘
```
Source: `.planning/PROJECT.md` architecture diagram [VERIFIED: codebase read]

### Race Condition Code Snippet (for "audio bugs" beat)

From commit `6168e9b` — the connectingRef lock:
```typescript
// connectingRef lock to prevent concurrent WebSocket connections
if (connectingRef.current) return;
connectingRef.current = true;
// ... connect/disconnect teardown before fresh start
```
Source: `app/hooks/useRealtimeVoice.ts` [VERIFIED: git show 6168e9b]

### Voice Cloning Enrollment (for "it actually sounds like me" beat)

From commit `fb4c96f`:
```typescript
// opens TTS WebSocket in server_commit mode with Kaleb's cloned voice_id
// tts.ts: routes response.audio.delta, response.done, error to callbacks
```
Kaleb recorded reference audio → enrolled as DashScope voice_id → every TTS call uses that ID.
Source: git show `fb4c96f` [VERIFIED: git show fb4c96f]

---

## Narrative Throughline (Planning Aid)

The planner can use this as the skeleton for the script task:

```
[0:00] COLD OPEN DEMO
  - Site is live: nim-kaleb.vercel.app
  - Visitor asks: "[engaging question about Kaleb's work]"
  - AI responds in Kaleb's cloned voice — terminal shows text, waveform active
  - No voiceover — let it run 4-5 seconds

[0:05] OPEN LOOP (talking head, fast cut)
  - "I built an AI clone of myself that visitors can actually talk to."
  - "But I had to rebuild everything halfway through."

[0:10] CONTEXT + PROBLEM (talking head)
  - "I wanted my portfolio to be a conversation — not a page."
  - "First try: Groq for speech-to-text, Claude for the brain, Qwen on my Mac for voice."
  - "It worked. Kind of. Except STT kept 500-ing on real browser audio."
  - [scholarship: context, what was tried]

[0:20] PIVOT 1 (talking head + code flash)
  - "So I swapped the whole thing for OpenAI's Realtime API. One WebSocket, bidirectional voice."
  - "Deleted 500 lines. Rewrote everything."
  - "Problem: OpenAI's voice wasn't mine. It sounded like a robot named Kaleb."

[0:30] MECHANISM — THE REAL PIVOT (talking head → architecture diagram)
  - "I found out Alibaba Cloud's Qwen3-TTS supports voice cloning."
  - "I recorded my voice, enrolled it, and rebuilt the server from scratch."
  - "Three WebSocket streams — ASR, LLM, TTS — orchestrated on a Bun server in Singapore."
  - [scholarship: what was built, what was tried]

[0:45] SUPPORT BEAT 1: RACE CONDITIONS (code snippet, 2 sentences)
  - "Then the bugs hit — audio cutoff, barge-in triggering on 'uhh', two WebSocket connections racing."
  - "Fixed each one. ConnectingRef lock. AbortController through the LLM stream. Graceful TTS teardown."

[0:52] SUPPORT BEAT 2: ARCHITECTURE LEAP (architecture diagram, 2 sentences)
  - "What started as three API routes in a Next.js app became a full WebSocket server on ECS."
  - "Three months of iteration, two complete rebuilds."
  - [scholarship: what surprised]

[1:00] RESULT (screen demo hold — 6 seconds)
  - Demo: same question, AI responds naturally, sounds like Kaleb
  - Voiceover: "It shipped. And it actually sounds like me."
  - [scholarship: what was built, result]

[1:08] CTA (talking head)
  - "[Low-friction ask — Claude's discretion]"
```

Total spoken words in this skeleton: ~230 words at ~170 WPM ≈ 81 seconds + demo holds ≈ 90-95 seconds total. [ASSUMED — word count estimate from skeleton draft above]

---

## Environment Availability

Step 2.6: SKIPPED — Phase 8 produces document files only (script.md, storyboard.md). No external tools, APIs, runtimes, or services required. Git is available and was used for archaeology above.

---

## Validation Architecture

Step 4: SKIPPED — Phase 8 deliverables are documents (script, storyboard), not code. No automated test framework applies. Validation is human review against the acceptance criteria in REQUIREMENTS.md:

| Requirement | Validation Method |
|-------------|------------------|
| SCRIPT-01 | Human reads script against hook→open loop→problem→mechanism→result→CTA checklist |
| SCRIPT-02 | Word count tool or manual count; reading aloud with timer |
| SCRIPT-03 | Human verifies at least 2 specific git references (commit hash or date) appear in script or script annotations |
| STORY-01 | Human verifies storyboard has a row per beat with timing column |
| STORY-02 | Human verifies each row has a visual type column with one of: talking head / screen demo / architecture diagram / code snippet |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Cold open "proof first" pattern increases retention for technical TikTok videos | Narrative Structure | Low — even if wrong, the demo hook is locked in D-01 |
| A2 | ~230-word script at 170 WPM = ~81 seconds + demo holds ≈ 90-95 sec total | Narrative Throughline | Low — actual timing verified by reading aloud during script execution |
| A3 | "What surprised Kaleb" scholarship pointer is best served by the pivot story | Scholarship Pointer Mapping | Low — planner can adjust pointer mapping during script task |

---

## Open Questions

1. **What question does the AI answer in the cold open demo?**
   - What we know: D-01 says the question or AI response must be engaging on its own
   - What's unclear: Whether the demo is pre-recorded or shown live; what the specific question is
   - Recommendation: Script task should specify the demo question as part of the deliverable, not leave it to Phase 9. Suggested option: "What's the hardest part of building this?" or "Tell me about a time you had to start over."

2. **CTA: what is Kaleb asking viewers to do?**
   - What we know: CTA is Claude's discretion per D-08
   - What's unclear: Is this a scholarship application CTA ("link in bio for full project"), a portfolio CTA ("visit the site and talk to me"), or both?
   - Recommendation: Write two CTA variations; let Kaleb choose. Both should be low-friction and specific.

3. **"Voice cloning" demo — before vs. after audio?**
   - What we know: D-05 says voice cloning story should emphasize the gap between "robotic TTS" and "sounds like me"
   - What's unclear: Whether Phase 9 can produce a "before" audio clip (OpenAI default voice) for contrast
   - Recommendation: Script should note this as an optional A/B audio beat. If before-audio is available, include it. If not, the script works without it — the word "robotic" does the work.

---

## Sources

### Primary (HIGH confidence)
- Git log archaeology — all commit hashes, dates, and descriptions verified via `git log` and `git show` in this session
- `.planning/PROJECT.md` — architecture diagram, key decisions table, current state
- `.planning/milestones/v1.0-ROADMAP.md` — full phase breakdown with goals and plan summaries
- `.planning/REQUIREMENTS.md` — SCRIPT-01 through STORY-02 acceptance criteria
- `.planning/phases/08-script-storyboard/08-CONTEXT.md` — all locked decisions

### Secondary (MEDIUM confidence)
- [virtualspeech.com — Average Speaking Rate](https://virtualspeech.com/blog/average-speaking-rate-words-per-minute) — WPM data for natural vs. TikTok pace
- [teleprompter.com — Speaking Speed Calculator](https://www.teleprompter.com/tools/speaking-speed-calculator) — WPM conversion reference
- [scriptstorm.ai — TikTok Script Templates](https://scriptstorm.ai/blog/tiktok-script-templates-guarantee-engagement) — Hook-body-CTA framework with open loop pattern
- [rainedigital.com — Mastering Talking Head Videos](https://rainedigital.com/2024/01/14/mastering-talking-head-videos-for-tiktok-reels-and-stories/) — Talking head over screen backdrop engagement data

### Tertiary (LOW confidence)
- [purplestardust.space — 7-Second Hook](https://purplestardust.space/the-7-second-hook-what-tiktok-teaches-brands-about-storytelling-in-2026/) — 2026 TikTok hook guidance (single source)

---

## Metadata

**Confidence breakdown:**
- Technical story (git archaeology): HIGH — all claims verified from git log and git show in this session
- Narrative arc structure: HIGH — consistent across multiple sources; SCRIPT-01 acceptance criteria are specific
- Word count / pacing: MEDIUM — WPM data from authoritative sources; actual script timing must be verified by reading aloud
- TikTok engagement patterns (visual type guidance): MEDIUM — consistent directional advice from multiple sources, not backed by A/B data

**Research date:** 2026-04-15
**Valid until:** 2026-05-15 (stable domain — TikTok narrative patterns don't shift quickly; git history is fixed)
