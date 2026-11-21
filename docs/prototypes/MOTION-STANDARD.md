# Visual + motion standard (round 2 of "Three visual directions")

Round 1 was rejected by Kaleb: "flat — no scroll animation, no 3D, no background, only cropped screenshots, no personality, no wow factor, no motion graphics." Not-vibe-coded is a floor, not the bar. The bar is the reference site **as it moves**.

## What the reference actually does (recorded 1440x900 slow scroll of https://cs.jensenhshoots.com/, 44 s, analysed frame by frame on 2026-11-22)

Stack probe: Next.js, no GSAP/Lenis/three.js, transforms everywhere (framer-motion style), 5 sticky elements, dark plum body `rgb(21,16,26)`, fonts Archivo (wide/expanded caps for display), Tilt Neon (signs), system mono.

1. **One signature concept, executed hard.** Everything is a neon sign: glass panels with 4 chrome screws, a power cable running to a little switch box with an LED. On load the signs are dead grey tubes, then flicker and power on pink/violet over ~3 s. An "OPEN — for collaborations" sign does the CTA. The concept recurs: each product name is its own neon sign; hackathon project names are scattered neon signs; the contact is a "come say hi" sign.
2. **Each product is a full-screen chapter, one at a time.** Section label ("Now building", "Shipped") → a huge ALL-CAPS wide headline with glow that is *revealed by scroll*: words come in blurred and pull into focus left-to-right, a box/bracket outline draws around a key word ("GET THE [DIAGRAM]"), then the headline shrinks and docks top-left while the product content rises underneath.
3. **Per-project motion metaphor.** CoconutSplit: the counter ticks 9,996 → 10,000 and the word "SPLIT" is literally sliced horizontally. MirrorlessBooth: camera viewfinder corner brackets frame the headline and it does a focus-pull from blur. The motion *is about the product*.
4. **Ambient background that changes per chapter.** Large soft radial glows drift and re-colour as you scroll (violet → magenta → purple → pink), over a faint grid. The page never sits on a flat fill.
5. **Real media, uncropped and framed.** Full product screenshots in device/browser frames with soft shadows; three phone screens side by side; event photos with funny captions ("The Minister of Health stopped by.", "Razer posted my dog in 2017. I joined in 2025.").
6. **Chapter progress rail** on the right edge (dashes; the active one is lit in the chapter's colour).
7. **Copy has jokes.** "Not @Nvidia CEO.", quoted asides per job ("gas masks are cool"), "20x doomscroll engineer".
8. Quieter sections (work rows, school, agent-skill install commands with Copy buttons) give rhythm between the loud chapters.

## The standard for Kaleb's page

- **A signature concept of his own**, carried through hero, chapters and contact (Jensen = neon signage). It must come from Kaleb's story: e.g. the voice clone / live waveform, the terminal heritage of the old site, film/video editing (Housecut), hand-drawn annotation (Overlay Notes). Each direction picks a different concept.
- **Scroll-driven motion everywhere**: GSAP + ScrollTrigger (+ Lenis smooth scroll) allowed and expected; pinned chapters, scrubbed reveals, blur-to-focus type, count-ups, draw-on SVG lines. three.js / React Three Fiber allowed where 3D earns its place. Respect `prefers-reduced-motion` with a static fallback.
- **Non-flat backgrounds**: ambient gradients/noise/grid/shader that shift per chapter. High-contrast palettes are fine; dark is allowed IF the concept justifies it (Krebs's "permanent dark mode" tell is about default dark, not designed dark).
- **No cropped thumbnails.** Media is shown whole, framed (device/browser frames, paper, film strips), at size.
- **Personality in copy**: at least one joke per chapter, asides on jobs, captions on photos.

## Kaleb's specific requirements (verbatim intent)

- **Products are chapters, one by one, not cards.** Housecut and Overlay Notes are his two big products and each gets a full, distinct, pinned chapter. No "card + text" layouts anywhere.
- **Overlay Notes chapter adopts the Overlay Notes landing page's own look** (https://overlay-notes.kalebnim.dev, source in `~/Documents/GitHub/overlay-notes-landing`): ruled-paper background, chunky rounded hand-lettered display type with a violet accent word underlined by a hand-drawn squiggle, the real screenshot tilted with a strip of tape, hand-written red annotations with arrows ("scrolls with the page →", "your real notes, saved here"), hand-drawn-border buttons. Animate it: annotations and arrows draw themselves on scroll (SVG stroke), the page "scrolls" under pinned notes to demo the core feature.
- **Housecut chapter: NOT a screenshot.** A 3D gallery of the real 9:16 listing videos Housecut produced (find them: `~/Documents/GitHub/housecut-sequence`, `~/Documents/GitHub/housecut-walkthrough-video`, public assets of housecut.app; transcode to small muted looping web MP4/WebM + poster frames), e.g. a rotating cylinder/carousel or depth-stacked wall of phones playing videos, with scroll-driven camera. Plus an animated explainer of the **agent harness**: raw phone clips → brief → parallel Claude Code worker lanes / Palmier dispatcher → review loop → render → three variants (slow tour, beat cut, hook teaser), drawing itself as you scroll. Use real facts from `app/lib/content.ts` and the housecut-sequence repo.
- **Voice clone** stays the hero's standout entry (big, unmissable; it's the one thing no other portfolio has).

## Process

- Build **vertical slices**, not full pages: for each direction, the hero + Housecut chapter + Overlay Notes chapter at full fidelity; remaining sections may be rough. Two strong directions beat three weak ones; three only if all three hit the bar.
- **Self-review by video before showing Kaleb**: record each direction scrolling (Playwright `recordVideo`, 1440x900, slow wheel scroll), watch it frame by frame (claude-video-vision `video_watch`), and compare against the reference recording at `/private/tmp/claude-501/-Users-kalebnim-Documents-GitHub-nim-kaleb/849afe03-f2b6-42ce-b3cf-d3c89e998304/scratchpad/ref/video/` . Iterate until each direction has: a signature concept, at least 4 distinct scroll-driven motions, a changing background, uncropped framed media, and jokes. Also check 390px.
- Ship the scroll videos with the ask so Kaleb can see motion, not stills.
