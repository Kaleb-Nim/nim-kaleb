# Demo Recording Plan

**Phase:** 09-visual-production-demo-plan
**Source:** STORYBOARD.md Production Notes + SCRIPT.md Beat 1 & Beat 6
**Status:** Production-ready plan for 2 screen capture sessions

This plan is a complete spec for filming day. Kaleb should be able to execute every step here without making any decisions.

---

## Overview

2 demo recordings are needed for the TikTok scholarship video:

| Recording | Beat | Timecode | Duration | Question |
|-----------|------|----------|----------|----------|
| Cold Open Demo | Beat 1 (Hook) | 0:00 -- 0:05 | 5 seconds | "Hey, who are you?" |
| Result Demo | Beat 6 (Result) | 0:55 -- 1:03 | 6-8 seconds | "Tell me about a project you're proud of" |

**Target site:** nim-kaleb.vercel.app
**WS server:** ws.kalebnim.dev (must be running and responsive before recording)

---

## Pre-Recording Setup

Complete all steps below before starting either recording session.

### 1. Browser Configuration

- Use Chrome (latest stable) or Arc
- Set window to **1920x1080** (preferred) or 2560x1440
- Zoom level: **100%** (Command+0 to reset)
- Hide bookmarks bar: Command+Shift+B (toggle off)
- Hide extensions: right-click on any extension icon → "Hide in toolbar" for all visible extensions
- URL bar: clear browsing history/suggestions (Settings → Clear browsing data → Browsing history, minimum last hour)
- OS-level: enable Do Not Disturb so no notifications appear on screen

### 2. Site State Check

- Open nim-kaleb.vercel.app in a **fresh incognito window** (Command+Shift+N)
- Let the boot sequence complete -- watch the typewriter text finish (~5 seconds)
- Verify the terminal is in MENU state: cursor blinking at command input, menu options visible
- Verify green monospace text (#00FF00) is rendering correctly with phosphor glow visible
- Verify the macOS-style title bar (red/yellow/green dots) is visible at the top of the terminal modal

### 3. Screen Capture Tool Setup

Option A (recommended): **OBS Studio**
- Scene: single source = "Window Capture" → select Chrome/Arc browser window
- Resolution: match browser window (1920x1080)
- FPS: 30 or 60
- Audio: Add "Audio Output Capture" (captures system audio including AI voice). Label it "System Audio."
- Do NOT add microphone source -- talking head audio is recorded separately

Option B (backup): **macOS Screen Recording** (Command+Shift+5)
- Select "Record Selected Portion" → drag to cover the browser window exactly
- "Options" → check "Microphone: None"
- System audio capture requires BlackHole or Loopback (see step 4)

### 4. Audio Routing

The AI voice plays through the browser. It must be captured in the screen recording.

**OBS (Option A):** "Audio Output Capture" source captures system audio automatically. Test: record 5 seconds while playing any system sound. Play back. Confirm AI voice would be audible.

**macOS Screen Recording (Option B):** Requires BlackHole (free) or Loopback (paid) virtual audio device:
1. Install BlackHole 2ch: `brew install blackhole-2ch` (or download from existential.audio)
2. macOS System Settings → Sound → Output: set to "BlackHole 2ch"
3. In Audio MIDI Setup: create a Multi-Output Device with both "BlackHole 2ch" and your speakers/headphones (so you can still hear it)
4. macOS Screen Recording → Options → check the BlackHole microphone source (this captures the virtual output)
5. Test: record 5 seconds with a YouTube video playing. Play back. Confirm audio is captured.

**Verification:** Before recording any take, do a 10-second test recording with the site open and a test question. Play it back. The AI voice must be audible. Do not start real takes until audio is confirmed.

### 5. WS Server Check

Before recording, confirm ws.kalebnim.dev is alive:
1. Open nim-kaleb.vercel.app in incognito
2. Complete boot sequence
3. Type "1" and press Enter to select "Activate Voice Interface"
4. Open browser DevTools → Network tab → WS filter
5. Confirm a WebSocket connection to ws.kalebnim.dev appears with status 101 (switching protocols)
6. Ask a short test question and confirm the AI responds
7. If connection fails or response never comes: do not start recording -- see Fallback Strategy below

### 6. Fallback Strategy

If ws.kalebnim.dev is down, unresponsive, or latency is too high (>3 seconds to first word):
1. SSH into the ECS server and restart the Bun WS server process
2. Wait 30 seconds and re-run the WS server check (step 5)
3. If still failing: **do not record on this session**. Reschedule.
4. Pre-recorded backups: at least 1 day before the filming session, record backup takes of both demos under ideal conditions. Store as `demo-cold-open-backup.mov` and `demo-result-backup.mov`. These are insurance, not first-choice.

---

## Demo Recording 1: Cold Open Demo

**Purpose:** 5-second hook showing the site working. Visitor asks a question, AI responds in Kaleb's cloned voice. The voice quality itself is the hook -- no voiceover, no music.

**Beat:** Beat 1 (Hook), 0:00 -- 0:05

### Setup Steps (in order)

1. Open nim-kaleb.vercel.app in incognito Chrome at 1920x1080 (new window, no prior state)
2. Let boot sequence complete -- wait for the typewriter text to finish and cursor to blink at command input (~5 seconds)
3. Type "1" and press Enter to select "Activate Voice Interface"
4. Wait for "Connecting..." state and then for the voice interface to be fully ready (waveform area visible, cursor at voice input)
5. Position cursor outside the browser window so it's not visible in frame
6. **Start screen recording**
7. Type or speak the question: **"Hey, who are you?"** (exact wording per D-01)
8. Let the AI respond for at least **10 seconds** without interruption
9. **Stop recording**

### Capture Requirements

- **Recorded duration:** At least 10 seconds (trim to best 5 seconds in post)
- **Frame:** Full browser window, terminal modal centered on starfield background, macOS title bar visible
- **Audio:** AI clone voice must be clearly audible, no background noise, no wind hum, no echo
- **Visual elements that must be visible:**
  - Green monospace text (#00FF00) with phosphor glow effect
  - Audio waveform indicator pulsing in the voice interface area
  - Command input showing the question text "Hey, who are you?"
  - Terminal modal on starfield background (#010810)
- **End frame goal:** The AI should be mid-sentence at the 5-second mark. This creates intrigue. A response that finishes in 3 seconds is less compelling than one still unspooling at 5 seconds.

### Takes

Record **3-5 takes**. AI responses vary each time.

Pick the take where:
- Voice sounds most natural and conversational (not rushed, not robotic)
- Response content is interesting or engaging (not a generic greeting like "Hi, I'm an AI assistant...")
- Green text typing is clearly visible and readable on screen
- The AI is still speaking/typing at the 5-second mark (response has length and substance)

### Output

Label each take: `demo-cold-open-take-1.mov`, `demo-cold-open-take-2.mov`, etc.

---

## Demo Recording 2: Result Demo

**Purpose:** 6-8 second demo showing voice quality and conversational depth. This is the payoff after 50 seconds of story about voice cloning -- the viewer is now listening specifically for whether the voice sounds like a real person.

**Beat:** Beat 6 (Result), 0:55 -- 1:03

### Setup Steps (in order)

1. Open nim-kaleb.vercel.app in a **fresh incognito window** (do not reuse the cold open session -- new session, new state)
2. Let boot sequence complete, activate voice interface (type "1" + Enter), wait for voice ready state
3. Position cursor outside the browser window
4. **Start screen recording**
5. Ask the primary question: **"Tell me about a project you're proud of"**
6. Let the AI respond for at least **15 seconds** without interruption
7. **Stop recording**

### Alternative Questions

If the primary question does not produce a good response across multiple takes, use these alternatives. Vary the question across takes to find the best result:

- "What's the hardest bug you've ever fixed?"
- "What makes you different from other engineers?"
- "Tell me about something you built that surprised you"
- "Walk me through how your voice portfolio actually works"

### Capture Requirements

- **Recorded duration:** At least 15 seconds (trim to best 6-8 seconds in post)
- **Frame:** Same as cold open -- full browser, terminal modal centered on starfield
- **Audio:** Voice quality is the primary focus. The response must sound natural, conversational, with personality. Not robotic, not overly formal, not a bullet-point list.
- **Key difference from cold open:** Hook demo proves the site works. Result demo proves the voice sounds human. Viewer has been primed -- they will be listening closely.
- **Desired end frame:** AI should be mid-answer, showing depth and continued thought (not wrapping up, not trailing off)

### Takes

Record **5 or more takes** (more than cold open because voice quality selection is more subjective).

Pick the take where:
- Voice has the most natural cadence, intonation, and rhythm
- Response shows depth and personality (not a surface-level one-liner)
- AI sounds like it's thinking and speaking naturally (fillers, pauses, follow-up elaboration)
- No audio glitches, cuts, or unnatural silences mid-sentence
- The first 6-8 seconds contain the most compelling content (edit window)

### Output

Label each take: `demo-result-take-1.mov`, `demo-result-take-2.mov`, etc.

---

## Post-Recording Checklist

Review all recordings before ending the session. Re-record immediately if any item fails.

- [ ] Cold Open Demo: at least 3 takes recorded
- [ ] Result Demo: at least 5 takes recorded
- [ ] Cold Open: AI voice is clearly audible in playback
- [ ] Result Demo: AI voice is clearly audible in playback
- [ ] Cold Open: green text (#00FF00) is readable at 1080p full screen
- [ ] Result Demo: green text (#00FF00) is readable at 1080p full screen
- [ ] Both demos: no browser notifications or pop-up banners visible in any take
- [ ] Both demos: no system cursor visible in the browser frame area
- [ ] Both demos: no browser extensions visible in the toolbar
- [ ] Both demos: terminal modal is centered and fully visible (not clipped)
- [ ] Both demos: starfield background (#010810) is visible around the terminal
- [ ] Backup demos recorded (cold open + result) if using fallback strategy
- [ ] All take files labeled with take numbers (demo-cold-open-take-N.mov, demo-result-take-N.mov)
- [ ] Files stored in a known, backed-up location (not just Downloads folder)

---

## Recording Order

Execute recordings in this order to minimize setup overhead:

1. **Complete all pre-recording setup** (all 6 steps above) before recording any take
2. **Record all cold open takes** (3-5 takes) -- same question ("Hey, who are you?") each time
3. **Clear browser state:** close the incognito window, open a new one
4. **Record all result demo takes** (5+ takes) -- can vary the question across takes
5. **Immediately review all takes** -- play back each take and make a preliminary selection
6. **Re-record immediately if needed:** if no cold open take is good, re-record 2-3 more cold open takes before tearing down setup. Same for result demo.
7. **Do not end the session** until you have at least 1 acceptable take of each demo.
