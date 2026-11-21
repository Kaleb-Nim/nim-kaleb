# Round 4: less text, motion interstitials, a live hero (issue #9)

Brief: [ROUND4.md](../ROUND4.md). Route: `/prototypes/e` (portrait variant A) and `/prototypes/e?portrait=poses` (variant B).

## Point by point

1. **Words cut.** Each segment is now an interstitial title, then visuals with one line at most: wins show name and prize only, community cards show photo, title and date, and Work shows one role at a time. The Housecut problem line is now "Raw phone clips in. Three edited listing videos out."
2. **Interstitials.** Six full-screen, pinned, scroll-scrubbed title cards, one move each from the same cutting-room system: NOW BUILDING (razor slices, then a zoom through the letters), WORK (a playhead wipe), 40+ HACKATHONS (a count-up over a flip-book of 19 real project frames), COMMUNITY (letterbox bars), OFF THE CLOCK (a clapperboard that claps on scroll), THAT'S A WRAP (an end-credits roll). The clip-chip labels are gone.
3. **Tagline**, verbatim, set across four lines. `content.ts` `PROFILE.line` now carries it, `sections.ts` says 4 years, and `bun run voice-facts` regenerated the prompt's facts block. The deployed clone still runs the old prompt until ws-server is redeployed.
4. **Live hero.** The production `useRealtimeVoice` hook talks to `wss://ws.kalebnim.dev` (set in `.env.local`, not committed). One additive change to the hook: a `playbackAnalyserRef` so visuals can follow the clone's voice; the home page ignores it.
   - The portrait light, the A1 waveform and the captions follow the real audio: the mic while you talk, the clone while it answers. "Speaking" tracks what you can hear, not the server's turn state (the server finishes a turn seconds before the audio does). Captions are paced to the speech and stripped of the model's markdown.
   - **A, grade** (default): IMG_0654 cut out and graded into the room; it brightens and gains an amber rim light with the voice.
   - **B, poses** (`?portrait=poses`): stop-motion from the 12-frame shoot, every frame aligned on Kaleb's face (OpenCV face boxes) so it reads as one person. Engaged poses swap on the clone's syllable peaks; hand-on-chin and hand-on-head poses while you talk; scrolling flips through the shoot when idle.
   - This answers #10 (Direct voice entry flow): the entry is the hero itself, one button, no overlay.
5. **Fixes.** The Housecut wall is now a tunnel: 24 phones on a spiral around the camera path, so the frame is never half empty. Work is a scrubbable timeline: the playhead runs across role clips with logos while a "program monitor" above shows the current role.
6. Housecut metrics are still red `TODO(Kaleb)` placeholders.

## Checks

- Krebs's scorer: 1/14 (perma dark, deliberate). No icon cards, shadcn or em dashes. Interstitial titles and product names are in caps by design.
- 390px: no horizontal scroll.
- Real voice exchanges recorded with a synthetic question through a fake mic, the clone's real audio captured from the page and muxed back in.

## Not in git

`public/prototype-media/` (gitignored): Housecut cuts, Kaleb's portraits and cutouts (`portrait/cut/*.webp`, made locally with rembg isnet-general-use), and all recordings.
