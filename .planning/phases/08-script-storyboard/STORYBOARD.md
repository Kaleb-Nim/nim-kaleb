# Storyboard: AI Voice Portfolio -- TikTok Scholarship Video

**Total duration:** ~90 seconds (77 sec spoken + 13 sec demo holds)
**Beats:** 7
**Visual types used:** Talking head, Screen demo, Architecture diagram, Code snippet

**Phase 9 usage:** Each row below becomes a visual brief in Phase 9. The "Visual Description" column must contain enough detail for Phase 9 to plan a Remotion segment or demo recording without asking questions.

---

## Storyboard

| Beat | Start | End | Duration | Spoken Words (first 8 words + "...") | Visual Type | Visual Description | Scholarship Pointer |
|------|-------|-----|----------|--------------------------------------|-------------|-------------------|---------------------|
| Hook | 0:00 | 0:05 | 5s | *(No voiceover. Demo plays.)* | Screen demo | nim-kaleb.vercel.app in browser, terminal modal centered on starfield background (#010810), visitor question "Hey, who are you?" appears in white command input, AI response types in green monospace (#00FF00) with phosphor glow, audio waveform indicator pulses, AI clone voice audible | -- |
| Open Loop | 0:05 | 0:10 | 5s | "I built an AI clone of myself..." | Talking head | Direct to camera, upper body, neutral background, energetic delivery, fast cut on "rebuild" | Context |
| Problem / Context | 0:10 | 0:22 | 12s | "I wanted my portfolio to be a..." | Talking head | Direct to camera, confident delivery, slight head shake on "kind of", hand gesture counting off pipeline steps (Groq, Claude, Qwen) | Context, What was tried |
| Mechanism / Pivots | 0:22 | 0:40 | 18s | "So I swapped the whole pipeline for..." | Talking head + Architecture diagram | First 10s: direct to camera, animated delivery describing OpenAI pivot; Last 8s: full-screen architecture diagram -- LEFT side: 3 boxes (Groq STT -> Claude -> Qwen3-TTS local) connected by arrows with red X overlay and "March 2026" label; RIGHT side: ECS architecture (Browser <-> Bun WS Server <-> DashScope ASR/LLM/TTS) with green checkmark and "April 2026" label, Singapore flag icon on server box | What was built, What was tried |
| Support Beats | 0:40 | 0:55 | 15s | "Then the bugs hit. Audio cutting off..." | Code snippet + Architecture diagram | First 8s: zoomed code extract from useRealtimeVoice.ts showing 3 lines of connectingRef lock pattern: `if (connectingRef.current) return; connectingRef.current = true;` -- dark terminal background, green syntax highlighting, file path label visible; Last 7s: side-by-side comparison diagram -- LEFT: "Before" with 3 Next.js API route boxes (/api/stt, /api/chat, /api/tts); RIGHT: "After" with single ECS server box containing pipeline orchestrator connected to 3 DashScope streams | What surprised |
| Result | 0:55 | 1:03 | 8s | *(Demo plays.)* "It shipped. And it..." | Screen demo | nim-kaleb.vercel.app in browser, different question than hook (e.g., "Tell me about a project you're proud of"), AI responding naturally in Kaleb's cloned voice, terminal text appearing character-by-character in green, waveform active, voice quality noticeably natural and conversational; 6s demo hold then 2s voiceover over the demo | What was built |
| CTA | 1:03 | 1:10 | 7s | "Go talk to my AI clone yourself..." | Talking head | Direct to camera, confident smile, pointing gesture toward camera/link area, energy matches opening, clean end frame suitable for TikTok end card | -- |

---

## Frame Descriptions

### Beat 1: Hook -- Screen Demo Detail

Frame-by-frame breakdown of the 5-second cold open demo hold:

- **0:00-0:01:** Browser window fills frame. URL bar shows nim-kaleb.vercel.app. Terminal modal centered on dark starfield background (#010810). macOS-style title bar with red/yellow/green traffic light dots visible. Terminal shows boot sequence text already complete, cursor blinking at command input.
- **0:01-0:02:** Visitor's question "Hey, who are you?" appears in the white command input field. Cursor blinks after the question mark.
- **0:02-0:03:** Terminal processes -- brief "Connecting..." text with animated ellipsis appears.
- **0:03-0:05:** AI response begins typing in green monospace text (#00FF00 with phosphor glow). Audio waveform indicator activates in the voice interface area. AI clone voice is audible speaking the response. Response should be mid-sentence by 0:05 to create intrigue.
- **Audio:** AI clone voice responding (no music, no voiceover, no background sound). The voice quality itself is the hook.

### Beat 4: Mechanism -- Architecture Transition

How the visual transitions from talking head to architecture diagram:

- **0:22-0:32:** Kaleb talking to camera. Fast, confident delivery. "So I swapped the whole pipeline..." -- hands animate the swap gesture. "But OpenAI's voice wasn't mine" -- slight pause, direct eye contact.
- **0:32-0:33:** Hard cut to full-screen architecture diagram. No fade, no slide -- instant cut matches TikTok pacing.
- **0:33-0:40:** Architecture diagram visible. LEFT panel: "Before" -- three boxes vertically stacked (Groq STT, Claude Chat, Qwen3-TTS Local) connected by downward arrows. Red X overlay. Label: "March 2026 -- 3 separate APIs, 3+ seconds latency." RIGHT panel: "After" -- Browser box on left connected via "wss://" label to central Bun WS Server box (labeled "Alibaba Cloud ECS Singapore"), which connects to three DashScope API boxes (ASR, LLM, TTS) via WebSocket arrows. Green checkmark. Label: "April 2026 -- single WebSocket, sub-second streaming."
- **Voiceover continues** over the diagram: "Three WebSocket streams -- speech recognition, language model, text-to-speech -- all orchestrated on a Bun server in Singapore."

### Beat 5a: Support Beat -- Code Snippet Detail

Exact code lines shown during the race conditions beat:

- **0:40-0:48:** Full-screen code snippet. Dark background (#1e1e1e or terminal black). File path label at top: `app/hooks/useRealtimeVoice.ts`. Three lines of code, large font (readable on mobile):
  ```
  if (connectingRef.current) return;
  connectingRef.current = true;
  // ... teardown before fresh start
  ```
  Green syntax highlighting (#00FF00) for keywords. Comment in gray. No surrounding code -- just these lines, zoomed in.
- **Voiceover:** "Then the bugs hit. Audio cutting off mid-sentence. Barge-in triggering on filler words. Two WebSocket connections racing each other."
- **Transition:** Hard cut to architecture comparison diagram at 0:48.

### Beat 5b: Support Beat -- Architecture Leap

- **0:48-0:55:** Side-by-side architecture comparison. LEFT: "v0.1" label, three small boxes representing Next.js API routes (/api/stt, /api/chat, /api/tts) inside a "Vercel" container. RIGHT: "v1.0" label, dedicated ECS server box with pipeline orchestrator, connected to Browser and DashScope services. Arrow from left to right labeled "Two complete rebuilds."
- **Voiceover:** "What started as three API routes in a Next.js app became a full WebSocket server on ECS. Two complete rebuilds in three months."

### Beat 6: Result -- Second Demo Detail

What plays during the 6-second demo hold and how it differs from the hook:

- **0:55-0:56:** Hard cut to browser showing nim-kaleb.vercel.app. Same terminal UI as hook but with a different question visible.
- **0:56-1:01:** AI responding to "Tell me about a project you're proud of" (or similar open-ended question). Green text typing in terminal. Voice is audible -- viewer can now compare the voice quality to the hook and hear it's natural, conversational, with personality. The AI should be mid-answer showing depth (not a one-liner).
- **1:01-1:03:** Voiceover begins over the still-playing demo: "It shipped. And it actually sounds like me." Demo audio fades under voiceover.
- **Key difference from hook:** Hook demo shows the site works. Result demo shows the voice quality -- viewer's ear has been primed by 50 seconds of story about voice cloning, so now they're listening for it.

---

## Production Notes for Phase 9

**Demo recordings needed:**
1. **Cold open demo (Beat 1):** Record nim-kaleb.vercel.app with AI responding to "Hey, who are you?" -- need 5 seconds of clean interaction. Start recording with terminal in ready state (post-boot, cursor blinking). Audio must capture the AI clone voice clearly. Browser chrome should be minimal or hidden.
2. **Result demo (Beat 6):** Record same site with "Tell me about a project you're proud of" or similar open-ended question -- need 6-8 seconds showing natural voice quality and conversational depth. This demo emphasizes voice naturalness; the hook demo emphasizes "wow it works."

**Remotion segments needed:**
1. **Architecture diagram -- before/after pipeline comparison (Beat 4):** Two-panel layout. Left: 3-step pipeline (Groq/Claude/Qwen3-TTS) with red X. Right: ECS architecture with DashScope 3-way streaming and green checkmark. Include date labels (March 2026 / April 2026). Style: dark background, clean boxes, colored connection arrows.
2. **Code snippet overlay -- connectingRef lock from useRealtimeVoice.ts (Beat 5a):** 3 lines of code, large readable font, dark background, green syntax highlighting. File path label. No surrounding context.
3. **Architecture comparison -- API routes vs ECS server (Beat 5b):** Side-by-side "v0.1" vs "v1.0" with arrow labeled "Two complete rebuilds." Simpler than the Beat 4 diagram -- focuses on the leap in complexity, not the specific APIs.

**Talking head segments:**
- Beats 2, 3, 4 (first 10s), 7
- Total talking head time: ~32 seconds
- All need consistent framing: upper body, neutral background (no distracting elements), good audio (lapel mic or close phone mic), natural lighting, energetic delivery matching D-03 tone

**Timing verification:**
- Total spoken time: ~77 seconds (218 words at 170 WPM)
- Total demo hold time: ~13 seconds (5s hook + 6s result + 2s overlap)
- Total video duration: ~90 seconds
- Within target range: 80-100 seconds
