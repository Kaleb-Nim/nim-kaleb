# Script: AI Voice Portfolio -- TikTok Scholarship Video

**Word count:** 218 words
**Estimated duration:** 218 / 170 = ~77 sec spoken + ~13 sec demo holds = ~90 sec total
**Tone:** Energetic, punchy, first-person (per D-03)
**Target:** 200-240 spoken words at 170 WPM = 70-85 sec spoken + demo holds = 80-100 sec total

---

### Hook -- 0:00-0:05

*(No voiceover. Demo plays.)*

*(The site nim-kaleb.vercel.app is visible. A visitor types: "What's the hardest bug you've ever fixed?" The AI responds in Kaleb's cloned voice, green text appearing in the terminal, audio waveform pulsing.)*

[VISUAL: Screen demo | nim-kaleb.vercel.app in browser, terminal modal centered on starfield, visitor question in command input, AI response typing in green monospace (#00FF00), audio waveform indicator active | 5s hold]

---

### Open Loop -- 0:05-0:10

I built an AI clone of myself that visitors can actually talk to. But I had to rebuild everything halfway through.

[VISUAL: Talking head | Direct to camera, upper body, neutral background, fast cut, energetic delivery]
[SCHOLARSHIP: context]

---

### Problem / Context -- 0:10-0:22

I wanted my portfolio to be a conversation, not a page. So back in March 2026, I wired up Groq for speech-to-text, Claude for the brain, and Qwen running on my Mac for voice. It worked -- kind of. The STT kept crashing on real browser audio. Every request, 500 error.

[VISUAL: Talking head | Direct to camera, confident delivery, slight head shake on "kind of"]
[SCHOLARSHIP: context, what was tried]

---

### Mechanism / Pivots -- 0:22-0:40

So I swapped the whole pipeline for OpenAI's Realtime API. One WebSocket, deleted 500 lines. But OpenAI's voice wasn't mine. It sounded like a generic AI reading my resume.

Then I found Alibaba Cloud's Qwen3-TTS -- it supports voice cloning. I recorded my voice, enrolled it, and rebuilt the entire server on Alibaba Cloud ECS. Three WebSocket streams -- speech recognition, language model, text-to-speech -- all orchestrated on a Bun server in Singapore.

[VISUAL: Talking head transitioning to architecture diagram | First half: direct to camera; second half: before/after pipeline diagram -- LEFT: 3 boxes (Groq STT -> Claude -> Qwen3-TTS local) with red X; RIGHT: ECS architecture (Browser <-> Bun WS Server <-> DashScope ASR/LLM/TTS) with green checkmark]
[SCHOLARSHIP: what was built, what was tried]

---

### Support Beats -- 0:40-0:55

Then the bugs hit. Audio cutting off mid-sentence. Barge-in triggering on filler words. Two WebSocket connections racing each other.

What started as three API routes in a Next.js app became a full WebSocket server on ECS. Two complete rebuilds in three months.

[VISUAL: Code snippet flash + architecture diagram | First: zoomed 3-line extract from useRealtimeVoice.ts showing connectingRef lock pattern, dark terminal theme, green syntax highlighting; Second: side-by-side Next.js API routes vs ECS server diagram]
[SCHOLARSHIP: what surprised]

---

### Result -- 0:55-1:03

*(Demo plays. The site responds to a new question. AI voice is natural, conversational, unmistakably Kaleb's.)*

It shipped. And it actually sounds like me.

[VISUAL: Screen demo | nim-kaleb.vercel.app in browser, different question than hook, AI responding naturally in Kaleb's cloned voice, terminal text appearing, waveform active, viewer hears the voice quality | 6s hold]
[SCHOLARSHIP: what was built]

---

### CTA -- 1:03-1:15

**Variation A:**
Talk to my AI clone yourself. Link's in the bio.

**Variation B:**
The site's live right now. Go ask it something weird.

[VISUAL: Talking head | Direct to camera, confident smile, pointing gesture on "link" or "site"]

---

## Script Metadata

**Scholarship Pointer Coverage:**
| Pointer | Beat(s) |
|---------|---------|
| Context (who Kaleb is, why this project) | Beat 2 (Open Loop), Beat 3 (Problem) |
| What was built | Beat 4 (Mechanism), Beat 6 (Result) |
| What was tried | Beat 3 (Problem), Beat 4 (Mechanism) |
| What surprised | Beat 5 (Support Beats) |

**Technical References (from git history):**
- API pivot: commit e4b8fc2 (2026-03-26) -- OpenAI Realtime API
- Voice enrollment: commit 45ede85 (2026-04-09) -- DashScope voice cloning
- Race condition fix: commit 6168e9b (2026-04-09) -- connectingRef lock
- Production deploy: commit 413cf51 (2026-04-12) -- v1.0 shipped

**Open Questions for Kaleb:**
1. Which CTA variation? (a) or (b)?
2. Demo question for cold open -- confirm "What's the hardest bug you've ever fixed?" or suggest alternative
3. Optional: before/after voice comparison in Result beat if OpenAI default voice recording is available
