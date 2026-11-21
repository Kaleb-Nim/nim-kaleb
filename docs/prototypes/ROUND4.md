# Round 4: less text, more motion, a real hero

Kaleb on round 3: "decently better", but still text-heavy and cluttered with words, the intro is weak, and the section labels are tags nobody needs to see.

1. **Cut words by ~60% everywhere.** Headlines are short punches, visuals carry the rest. E.g. Hackathons headline is just **40+ HACKATHONS** (drop "These five ended with a cheque or a trophy"), then the wins as visuals with only name + prize. Every paragraph must justify itself; prefer one line. No section should read like a CV.
2. **Replace the small clip-chip labels with full-screen motion-graphic interstitials between segments.** As you scroll into a segment, a pinned, scrubbed motion graphic announces it (e.g. NOW BUILDING slamming in as a razor cut / title card / timeline zoom, then dissolving into the product). The user must *feel* "this segment is the products I'm currently building" without reading a tag. One interstitial per top-level segment (Now building, Work, Hackathons, Community, Off the clock, Links), each a variation of the same cutting-room system.
3. **New hero tagline, verbatim from Kaleb** (fix any content.ts that says "three years"):
   > 4 years AI Engineer experience, casual hackathon hopper 40+ hackathons. Startups | Side quests and token maxxing. NUS
   (You may set it typographically across lines/weights, but keep his words.)
4. **Hero = Kaleb + his voice clone, and visitors actually talk to it.** Kaleb is sending a photo of himself (I'll forward the path). Build the hero around the portrait with the voice clone as the interaction: big record/talk button, the portrait reacts while the clone speaks (audio-reactive light/grade, waveform, live captions of what it says). Wire it to the REAL server so it works in the prototype: reuse `app/hooks/useRealtimeVoice.ts` against `wss://ws.kalebnim.dev` (production, Fish voice; read-only use, don't change ws-server). Localhost allows the mic. If feasible, also prototype a second variant where the portrait itself appears to talk (e.g. subtle mouth/face-region animation or a short pre-generated idle/talking loop), and say which you recommend. This covers the "Direct voice entry flow" ticket's question too; note that in the report.
5. Carry over from my review of round 3: the empty half-screen in the Products phone wall (fill or tighten the camera path), and Work experience is the plainest segment (give it a stronger visual system, e.g. role clips on the timeline with logos, minimal text).
6. Housecut metrics still pending from Kaleb (keep red TODO placeholders).

Same loop: record 1440 + 390 scroll videos plus a short screen recording of a real voice exchange in the hero, self-review against the reference and this list, then ask me.
