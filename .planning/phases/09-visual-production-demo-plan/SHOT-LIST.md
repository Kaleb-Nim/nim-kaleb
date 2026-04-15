# Shot List and Production Checklist

**Phase:** 09-visual-production-demo-plan
**Video:** AI Voice Portfolio -- TikTok Scholarship Video
**Source documents:** SCRIPT.md, STORYBOARD.md, VISUAL-BRIEFS.md, DEMO-RECORDING-PLAN.md
**Status:** Ready for filming day

---

## Video Summary

| Field | Value |
|-------|-------|
| Total duration | ~90 seconds |
| Beats | 7 |
| Talking head segments | 4 (Beats 2, 3, 4a, 7) -- ~32s total (per D-06) |
| Screen demo segments | 2 (Beats 1, 6) -- ~13s total (per D-05) |
| Remotion segments | 3 (Beats 4b, 5a, 5b) -- recorded separately, composited in post (per D-04) |
| Production URL | nim-kaleb.vercel.app |
| WS server | ws.kalebnim.dev |

---

## Shot List

| Shot # | Beat | Type | Timecode | Duration | Description | Script Excerpt (first 8 words) | Takes | Notes |
|--------|------|------|----------|----------|-------------|-------------------------------|-------|-------|
| 1 | Beat 1 (Hook) | Screen demo | 0:00 -- 0:05 | 5s | nim-kaleb.vercel.app in browser; visitor types "Hey, who are you?" (per D-01); AI responds in cloned voice; green text types in terminal; audio waveform pulses | *(No voiceover. Demo plays.)* | 3-5 takes | Reference DEMO-RECORDING-PLAN.md. Record at least 10 seconds; trim to best 5. AI should be mid-sentence at 5s mark. File: demo-cold-open-take-N.mov |
| 2 | Beat 2 (Open Loop) | Talking head | 0:05 -- 0:10 | 5s | Direct to camera, upper body, neutral background, energetic delivery; fast cut on "rebuild" | "I built an AI clone of myself..." | 3 takes | High energy. This is the hook-to-context bridge. Punch "built" and "rebuild." No pauses. |
| 3 | Beat 3 (Problem / Context) | Talking head | 0:10 -- 0:22 | 12s | Direct to camera, confident delivery; slight head shake on "kind of"; hand gesture counting off pipeline steps (hold up one finger per service: Groq, Claude, Qwen) | "I'm not a software dev, I'm an..." | 3 takes | The head shake on "kind of" is key -- it signals honest self-assessment. The finger-count gesture (3 fingers) visualizes the complexity of the old pipeline. |
| 4a | Beat 4 first half (Mechanism / Pivots) | Talking head | 0:22 -- 0:32 | 10s | Direct to camera, animated delivery; hands animate "swap" gesture; direct eye contact and slight pause on "wasn't mine" | "So I swapped the whole pipeline for..." | 3 takes | The phrase "But OpenAI's voice wasn't mine" is the emotional turn -- slow slightly and hold eye contact. Leads directly into the architecture diagram hard cut at 0:32. |
| 4b | Beat 4 second half (Architecture Diagram) | Remotion | 0:32 -- 0:40 | 8s | Full-screen before/after architecture diagram; LEFT: Groq/Claude/Qwen3-TTS with red X; RIGHT: ECS/DashScope with green checkmark; voiceover continues over diagram | *(Voiceover continues over diagram)* | 0 takes | Composited in post. Reference VISUAL-BRIEFS.md Segment 1 for exact layout, colors, and animation specs. Voiceover recorded in Block 3. |
| 5a | Beat 5a (Support Beats -- code snippet) | Remotion | 0:40 -- 0:48 | 8s | Full-screen code extract from useRealtimeVoice.ts; 3-line connectingRef lock pattern; dark background; green syntax highlighting with phosphor glow | *(No voiceover from camera)* | 0 takes | Composited in post. Reference VISUAL-BRIEFS.md Segment 2. Voiceover "Then the bugs hit..." recorded in Block 3. Hard cut in, hard cut out. |
| 5b | Beat 5b (Support Beats -- architecture comparison) | Remotion | 0:48 -- 0:55 | 7s | Side-by-side v0.1 vs v1.0; LEFT: 3 Next.js API routes inside Vercel container; RIGHT: ECS Pipeline Orchestrator with DashScope services; center arrow labeled "Two complete rebuilds" | *(No voiceover from camera)* | 0 takes | Composited in post. Reference VISUAL-BRIEFS.md Segment 3. Voiceover "What started as three API routes..." recorded in Block 3. |
| 6 | Beat 6 (Result) | Screen demo | 0:55 -- 1:03 | 8s (6s demo + 2s voiceover over demo) | Same terminal UI as Shot 1 but different question; "Tell me about a project you're proud of"; AI responds naturally; voice quality noticeably conversational; 6s demo hold then 2s voiceover overlay | *(Demo plays.)* "It shipped. And it..." | 5+ takes | Reference DEMO-RECORDING-PLAN.md. Record at least 15 seconds; trim to best 6-8 seconds. Pick take where voice sounds most natural and conversational. Voiceover "It shipped. And it actually sounds like me." is added in post. File: demo-result-take-N.mov |
| 7 | Beat 7 (CTA) | Talking head | 1:03 -- 1:10 | 7s | Direct to camera, confident smile; pointing gesture toward camera on "yourself"; energy matches opening; clean end frame for TikTok end card | "Go talk to my AI clone yourself..." | 3 takes | CTA exact wording per D-02: "Go talk to my AI clone yourself. please don't ask it something weird." The lowercase "please" is intentional -- keep it. The pointing gesture lands on "yourself." End on a smile, not a fade. |

---

## Filming Order

Group by setup type to minimize camera and lighting changes.

### Block 1: Demo Recordings (Screen capture, no camera needed)

**What:** Both screen demo shots (Shots 1 and 6)
**Equipment needed:** Computer, OBS Studio or macOS Screen Recording, incognito Chrome, system audio routing configured (per DEMO-RECORDING-PLAN.md)
**Estimated time:** 30-45 minutes

Steps:
1. Complete all pre-recording setup from DEMO-RECORDING-PLAN.md (all 6 steps) before starting any take
2. Confirm ws.kalebnim.dev WebSocket connects successfully (DevTools → Network → WS filter, status 101)
3. Confirm AI voice responds to a test question and is audible in a test recording
4. Record all cold open takes (3-5 takes) -- question: "Hey, who are you?"
   - Each take: fresh incognito window, let boot sequence complete, activate voice interface, start recording, ask question, let AI respond 10+ seconds, stop recording
   - Label: `demo-cold-open-take-1.mov`, `demo-cold-open-take-2.mov`, etc.
5. Clear browser state: close incognito window, open a new one
6. Record all result demo takes (5+ takes) -- question: "Tell me about a project you're proud of" (vary question across takes per DEMO-RECORDING-PLAN.md alternatives if needed)
   - Label: `demo-result-take-1.mov`, `demo-result-take-2.mov`, etc.
7. Immediately review all takes -- confirm at least 1 acceptable take of each demo before tearing down
8. Re-record immediately if no take passes quality review (do not skip to Block 2)

### Block 2: Talking Head Segments (Camera + lighting setup needed)

**What:** All 4 talking head shots (Shots 2, 3, 4a, 7)
**Equipment needed:** iPhone or dedicated camera on tripod, ring light or desk lamp, lapel mic or AirPods Pro
**Estimated time:** 45-60 minutes

Steps:
1. Set up camera on tripod at eye level, ~3 feet from face, portrait orientation (1080x1920, 9:16 for TikTok)
2. Set up lighting: primary light directly in front, slightly above eye level; eliminate window backlight
3. Test audio: record 5-second clip, play back, confirm voice is clear with no echo or hum
4. Put on wardrobe (solid-colored shirt, dark color preferred)
5. Run through the full script once as a dry run without recording to warm up
6. Record Shot 2 -- Beat 2 (Open Loop): 3 takes
   - Key: high energy, punch "built" and "rebuild," no slow moments
7. Record Shot 3 -- Beat 3 (Problem / Context): 3 takes
   - Key: head shake on "kind of," finger-count gesture for Groq/Claude/Qwen
8. Record Shot 4a -- Beat 4 first half (Mechanism): 3 takes
   - Key: "swap" gesture, slow and hold eye contact on "wasn't mine"
9. Record Shot 7 -- Beat 7 (CTA): 3 takes
   - Key: exact CTA wording per D-02, pointing gesture on "yourself," end on a smile
10. Review all takes -- identify at least 1 acceptable take per shot
11. Re-record any shots where no take passes quality review before breaking down setup

### Block 3: Voiceover for Remotion Segments (Audio only, camera setup from Block 2 can be reused)

**What:** Voice-only audio tracks for Shots 4b, 5a, 5b
**Equipment needed:** Same microphone setup from Block 2 (lapel mic or AirPods Pro)
**Estimated time:** 15-20 minutes

Steps:
1. Keep the same audio setup from Block 2 (do not change mic position or settings)
2. Record voiceover for Shot 4b -- Beat 4 architecture diagram (~8 seconds of speech, 3 takes):
   > "Three WebSocket streams -- speech recognition, language model, text-to-speech -- all orchestrated on a Bun server in Singapore."
3. Record voiceover for Shot 5a -- Beat 5a code snippet (~8 seconds of speech, 3 takes):
   > "Then the bugs hit. Audio cutting off mid-sentence. Barge-in triggering on filler words. Two WebSocket connections racing each other."
4. Record voiceover for Shot 5b -- Beat 5b architecture comparison (~7 seconds of speech, 3 takes):
   > "What started as three API routes in a Next.js app became a full WebSocket server on ECS. Two complete rebuilds in three months."
5. Review all voiceover takes -- confirm at least 1 clean take per segment with no stumbling or background noise

**Total filming day estimate: 1.5-2 hours**

---

## Camera Setup

| Setting | Value |
|---------|-------|
| Device | iPhone (rear camera preferred) or dedicated camera |
| Talking head resolution | 1080x1920 (9:16 portrait for TikTok) |
| Screen demo resolution | 1920x1080 (16:9 landscape, captured via screen recording) |
| Frame rate | 30fps |
| Orientation | Portrait (vertical) for talking head; landscape for screen demos |
| Stabilization | Tripod or phone mount at eye level -- no handheld |
| Subject distance | ~3 feet from face for upper body framing |
| Framing | Upper body (head and shoulders), eyes on upper third line (rule of thirds) |
| Eye line | Direct to camera lens, not to screen |
| Background | Neutral, non-distracting -- solid wall, simple desk, or blurred background; no posters, windows, clutter |

---

## Lighting

| Element | Guidance |
|---------|----------|
| Primary light | Ring light or desk lamp positioned directly in front, slightly above eye level |
| Fill light | Window light from side if available, or second lamp to reduce shadows on one side |
| Avoid | Overhead fluorescent (creates harsh under-eye shadows); window behind subject (silhouette effect) |
| Test method | Record a 5-second test clip and play back -- face should be evenly lit, no dark shadow on either side, no hot spots |
| Energy level | Keep lights on for all of Block 2 and Block 3 -- do not change the setup between beats |

---

## Audio

| Element | Guidance |
|---------|----------|
| Preferred mic | Lapel mic (clip to shirt collar, ~8 inches from mouth) or AirPods Pro (in-ear, close to mouth) |
| Backup | Phone mic placed within 2 feet of face (propped on tripod arm or desk) |
| Test method | Record a 5-second clip, play back -- voice should be clear, no room echo, no background hum, no breathing noise |
| Environment | Turn off fans and AC, close windows, silence all device notifications before starting Block 2 |
| Screen demos (Block 1) | AI voice captured via system audio routing (OBS "Audio Output Capture" or BlackHole virtual device -- see DEMO-RECORDING-PLAN.md section 4) |
| Voiceover (Block 3) | Same audio setup as Block 2; aim for minimal room reverb; closet or small room preferred over open space |

---

## Wardrobe

| Element | Guidance |
|---------|----------|
| Shirt | Solid-colored -- no patterns, no logos, no stripes (patterns cause moire effect on camera) |
| Color | Dark preferred -- matches the dark terminal theme of nim-kaleb.vercel.app |
| Accessories | No jewelry that makes noise or catches light distractingly |
| Consistency | Wear the same outfit for Block 2 and Block 3 -- all talking head shots must match in post |

---

## Production Checklist (Print This)

### Day Before Filming

- [ ] Charge phone/camera battery to 100%
- [ ] Clear phone/camera storage -- need at least 5GB free for all takes
- [ ] Install or update OBS Studio (preferred screen capture tool) and test audio capture
- [ ] Install BlackHole 2ch virtual audio device if using macOS Screen Recording instead of OBS
- [ ] Open nim-kaleb.vercel.app -- confirm it loads correctly in fresh incognito Chrome
- [ ] Activate voice interface (type "1" + Enter) and confirm AI responds with voice
- [ ] Open browser DevTools → Network → WS filter -- confirm ws.kalebnim.dev shows status 101
- [ ] Record backup demos under ideal conditions today as insurance:
  - [ ] `demo-cold-open-backup.mov` (question: "Hey, who are you?")
  - [ ] `demo-result-backup.mov` (question: "Tell me about a project you're proud of")
- [ ] Store backup demos in a known, backed-up location (not just Downloads)
- [ ] Load SCRIPT.md on second device or print it -- must be accessible during filming without opening laptop
- [ ] Scout filming location: clear the background of clutter, position tripod, test framing
- [ ] Test lighting in filming location: record 5-second test clip, confirm even lighting on face
- [ ] Select wardrobe (solid dark shirt) and set it out

### Filming Day -- Pre-Shoot Check (15 minutes before recording)

- [ ] Phone/camera charged and mounted on tripod, portrait orientation, ~3 feet from face
- [ ] Lighting powered on and positioned (ring light or desk lamp, slightly above eye level, in front)
- [ ] Audio recording test passed: record 5 seconds, play back, voice clear and clean
- [ ] nim-kaleb.vercel.app loads correctly in fresh incognito Chrome (new window, no prior state)
- [ ] Voice interface activates (type "1" + Enter, wait for ready state)
- [ ] ws.kalebnim.dev WebSocket connects (DevTools → Network → WS → status 101)
- [ ] AI voice responds to a test question and is audible in a 10-second test recording
- [ ] All device notifications silenced (phone, computer, tablet)
- [ ] Do Not Disturb mode enabled on all devices
- [ ] Filming location quiet: fans off, AC off, windows closed, no background noise sources
- [ ] Wardrobe check: solid-colored shirt, no distracting patterns, no noisy jewelry
- [ ] Script loaded on second device or printed and within reach
- [ ] Screen capture tool (OBS or macOS) configured and tested with audio routing confirmed

### During Filming

- [ ] Block 1 started: screen capture tool and browser configured per DEMO-RECORDING-PLAN.md
- [ ] Block 1 -- cold open demo: at least 3 takes recorded (`demo-cold-open-take-N.mov`)
- [ ] Block 1 -- cold open demo: at least 1 take reviewed and confirmed acceptable (AI voice audible, green text visible, AI mid-sentence at 5s)
- [ ] Block 1 -- result demo: at least 5 takes recorded (`demo-result-take-N.mov`)
- [ ] Block 1 -- result demo: at least 1 take reviewed and confirmed acceptable (voice sounds natural, response shows depth)
- [ ] Block 1 complete
- [ ] Block 2 started: camera on tripod, lighting on, audio test passed, wardrobe on
- [ ] Block 2 -- Shot 2 (Beat 2, Open Loop): 3 takes recorded, 1 confirmed acceptable
- [ ] Block 2 -- Shot 3 (Beat 3, Problem / Context): 3 takes recorded, 1 confirmed acceptable
- [ ] Block 2 -- Shot 4a (Beat 4 first half, Mechanism): 3 takes recorded, 1 confirmed acceptable
- [ ] Block 2 -- Shot 7 (Beat 7, CTA): 3 takes recorded, 1 confirmed acceptable
- [ ] Block 2 complete
- [ ] Block 3 started: same audio setup as Block 2
- [ ] Block 3 -- Shot 4b voiceover (architecture diagram, ~8s): 3 takes, 1 confirmed clean
- [ ] Block 3 -- Shot 5a voiceover (code snippet, ~8s): 3 takes, 1 confirmed clean
- [ ] Block 3 -- Shot 5b voiceover (architecture comparison, ~7s): 3 takes, 1 confirmed clean
- [ ] Block 3 complete

### Post-Filming

- [ ] All recording files transferred to computer
- [ ] Files organized in a folder by block and shot number:
  - `block-1-demos/demo-cold-open-take-N.mov`
  - `block-1-demos/demo-result-take-N.mov`
  - `block-2-talking-head/beat-2-open-loop-take-N.mov`
  - `block-2-talking-head/beat-3-problem-take-N.mov`
  - `block-2-talking-head/beat-4a-mechanism-take-N.mov`
  - `block-2-talking-head/beat-7-cta-take-N.mov`
  - `block-3-voiceover/beat-4b-architecture-vo-take-N.m4a`
  - `block-3-voiceover/beat-5a-code-vo-take-N.m4a`
  - `block-3-voiceover/beat-5b-comparison-vo-take-N.m4a`
- [ ] Best take selected and labeled for each shot (e.g., rename or star in Finder)
- [ ] Raw footage backed up to cloud storage (iCloud, Google Drive, or similar) before any editing
- [ ] Remotion segments can begin production -- forward VISUAL-BRIEFS.md to Remotion developer with selected voiceover audio files

---

## Asset Inventory After Filming

When Block 1-3 are complete and files are organized, the following assets should exist and be ready for post-production:

| Asset | Source | Format | Used In |
|-------|--------|--------|---------|
| demo-cold-open (best take) | Block 1 screen recording | .mov | Shot 1, Beat 1, 0:00-0:05 |
| demo-result (best take) | Block 1 screen recording | .mov | Shot 6, Beat 6, 0:55-1:01 |
| beat-2-open-loop (best take) | Block 2 talking head | .mov | Shot 2, Beat 2, 0:05-0:10 |
| beat-3-problem (best take) | Block 2 talking head | .mov | Shot 3, Beat 3, 0:10-0:22 |
| beat-4a-mechanism (best take) | Block 2 talking head | .mov | Shot 4a, Beat 4 first 10s, 0:22-0:32 |
| beat-7-cta (best take) | Block 2 talking head | .mov | Shot 7, Beat 7, 1:03-1:10 |
| beat-4b-architecture-vo (best take) | Block 3 voiceover | .m4a | Shot 4b, Beat 4 last 8s, 0:32-0:40 |
| beat-5a-code-vo (best take) | Block 3 voiceover | .m4a | Shot 5a, Beat 5a, 0:40-0:48 |
| beat-5b-comparison-vo (best take) | Block 3 voiceover | .m4a | Shot 5b, Beat 5b, 0:48-0:55 |
| Segment 1: architecture diagram | Remotion (composited) | .mp4 | Shot 4b, 0:32-0:40 |
| Segment 2: code snippet | Remotion (composited) | .mp4 | Shot 5a, 0:40-0:48 |
| Segment 3: architecture comparison | Remotion (composited) | .mp4 | Shot 5b, 0:48-0:55 |
