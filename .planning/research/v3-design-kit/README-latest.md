# Kebab Neural Interface — Terminal UI Kit

Pixel-faithful React/JSX recreation of the `nim-kaleb` portfolio terminal. Built from the source at `nim-kaleb/app/`.

## Files
- `index.html` — click-through prototype. Boot → status → menu → `1 ⏎` → voice → connect → listening → response.
- `Terminal.jsx` — outer window (860px, 10px radius, drop-shadow) + chrome bar (30px, three dots, title).
- `TerminalBody.jsx` — content padding + phosphor text-shadow.
- `CognitiveStatus.jsx` — 4-row key/value grid + gold internship banner.
- `CommandInput.jsx` — `> ` prompt + hidden input + blinking `█`.
- `MicButton.jsx` — bordered green button with three states (idle/hover/recording-red-pulse).
- `Starfield.jsx` — 70-star canvas, 30fps, 30% green-tinted twinkle.
- `TypewriterLine.jsx` — per-character text reveal.

## Usage
Open `index.html` in a browser. Everything is fake — no real WS, no real voice — interactions simulate the real flow (typing `1` advances state, Connect → Listening → canned response).
