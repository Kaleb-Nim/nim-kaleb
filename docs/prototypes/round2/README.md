# Round 2: two directions with motion (issue #9)

Round 1 (`/prototypes/a`, `/b`, `/c`) was rejected as flat. Round 2 follows [MOTION-STANDARD.md](../MOTION-STANDARD.md) and builds two vertical slices (hero, Housecut, Overlay Notes at full fidelity; work and contact rough).

| | D, "Transcript" (`/prototypes/d`) | E, "Cutting room" (`/prototypes/e`) |
|---|---|---|
| Signature concept | The page is a live transcript of Kaleb talking: speaker labels and timestamps, words resolving from blur like speech-to-text, a live oscilloscope, waveform dividers. The voice clone is where the transcript says "You". | The page is an edit: film-leader countdown on load, a timeline bar with playhead and running timecode, headlines arriving as razor cuts, a voice-clone audio track with a record button. |
| Housecut | three.js ring of 8 real Cuts playing, scroll turns the ring and dollies the camera, a floor reflection, a "Now playing" readout. Then the pipeline diagram draws itself. | A camera flies through a depth-stacked CSS-3D wall of 16 phones playing real Cuts. Then the pipeline is an NLE: a playhead sweeps tracks and clips render as it passes. |
| Overlay Notes | Shared chapter in the overlay-notes.kalebnim.dev look: a pinned browser whose lecture page scrolls under Kaleb's real handwritten notes, which draw themselves; then the real screenshot, taped. | Same chapter, entered as "reel 2". |
| Background | Three drifting glows re-colour per chapter, plus grain. | Two grade lights re-colour per chapter, plus scanlines. Designed dark. |
| Motion | GSAP + ScrollTrigger + Lenis, `prefers-reduced-motion` respected. | Same. |
| Krebs scorer (design-slop-cop, 14) | 0/14 | 1/14 (Perma dark, deliberate: the edit suite) |
| Extra checks (caps, icon cards, shadcn, em dashes) | 0 | 0 |
| 390px | no horizontal scroll; the diagram pans as it draws | no horizontal scroll; the NLE compresses |

## Not in the repo on purpose

- The Housecut Cuts are customers' listings and show an agent's name and phone number on screen. They live in `public/prototype-media/` (gitignored), transcoded from `housecut-sequence/handoffs/*/output/`. If the folder is missing, re-create it with ffmpeg (360x640, 7 s, muted).
- Scroll recordings for review are in `public/prototype-media/recordings/` for the same reason.

## Facts checked while building

- Housecut's harness is drawn as one Palmier worker (Claude Code) producing three Cuts, not three parallel workers: `housecut-sequence/docs/dispatcher.md` and `round-dispatch.md` describe one worker per Round.
- "There is no approve button" is from the housecut-sequence GLOSSARY (Approval).
- New jokes not from Kaleb (for his voice check): "It has read the whole thing, which is more than most people do." (D), "It doesn't do retakes." (E).
