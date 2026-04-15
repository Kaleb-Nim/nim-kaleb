# Visual Briefs: Remotion Segments

**Phase:** 09-visual-production-demo-plan
**Source:** STORYBOARD.md Frame Descriptions + SCRIPT.md Visual Annotations
**Status:** Production-ready specs for all 3 Remotion segments

These briefs are standalone specs. A Remotion developer should be able to implement each segment without asking questions.

---

## Segment 1: Architecture Diagram -- Before/After Pipeline Comparison

### Metadata

| Field | Value |
|-------|-------|
| Beat reference | Beat 4 (Mechanism / Pivots) |
| Timecode | 0:32 -- 0:40 |
| Duration | 8 seconds |
| Entry transition | Hard cut from talking head (no fade, no slide -- instant cut per TikTok pacing) |
| Exit transition | Hard cut to code snippet (Segment 2) |

### Voiceover

> "Three WebSocket streams -- speech recognition, language model, text-to-speech -- all orchestrated on a Bun server in Singapore."

*(Voiceover continues over the diagram from the talking head beat that ends at 0:32. Full beat voiceover starts at 0:22 but only the last portion plays over this diagram.)*

### Layout

Two-panel horizontal split, 50/50 width, separated by a thin vertical divider (1px, color #333).

**LEFT panel -- "Before" (March 2026):**
- Panel header: "March 2026" in white (#ffffff), font-weight 600, ~18px
- Panel subtitle: "3 separate APIs, 3+ seconds latency" in gray (#888888), ~13px, monospace
- Body: 3 vertically stacked boxes connected by downward arrows:
  1. "Groq STT"
  2. "Claude Chat"
  3. "Qwen3-TTS Local"
- Each box: ~200px wide x 60px tall, rounded corners (4px), dark gray fill (#2a2a2a), white text (#ffffff), 1px border (#444444), monospace font
- Arrows between boxes: downward-pointing, color #ff4444 (red), ~2px stroke
- Red X overlay: semi-transparent red rectangle or SVG X centered over the entire left panel body area, opacity 0.6, color #ff4444

**RIGHT panel -- "After" (April 2026):**
- Panel header: "April 2026" in white (#ffffff), font-weight 600, ~18px
- Panel subtitle: "single WebSocket, sub-second streaming" in gray (#888888), ~13px, monospace
- Body layout (horizontal flow):
  - "Browser" box (left, ~120px x 60px)
  - Arrow labeled "wss://" pointing right (~80px, color #00FF00)
  - "Bun WS Server" box (center, ~180px x 80px) with subtitle "Alibaba Cloud ECS Singapore" in gray (#888), ~11px, optional Singapore flag emoji (🇸🇬) at end of subtitle
  - Three arrows pointing right from server to DashScope cluster (color #00FF00)
  - DashScope cluster: 3 small boxes stacked vertically -- "ASR", "LLM", "TTS" (~120px x 40px each, same box style as left panel)
- Green checkmark overlay: SVG checkmark centered over right panel body, color #00FF00, opacity 0.8, ~48px

### Color Treatment

- **Canvas background:** #0a0a0a (near-black)
- **Box fills:** #2a2a2a (dark gray)
- **Box borders:** #444444 (left panel), #00FF00 (right panel boxes)
- **Left panel arrows:** #ff4444 (red, suggesting the broken state)
- **Right panel arrows:** #00FF00 (green, suggesting health)
- **Text:** #ffffff (white) for labels, #888888 (gray) for subtitles
- **Divider:** #333333 (thin, 1px)
- **Left panel X overlay:** #ff4444 at 0.6 opacity
- **Right panel checkmark:** #00FF00 at 0.8 opacity

### Animation Intent

1. **0.0s -- 0.5s:** LEFT panel fades in (opacity 0 to 1, ease-out)
2. **0.5s -- 1.0s:** RIGHT panel slides in from the right edge (translateX(+100%) to translateX(0), ease-out)
3. **1.0s -- 1.3s:** Red X on left panel pops in (scale 0 to 1, ease-back overshoot)
4. **1.0s -- 1.3s:** Green checkmark on right panel pops in (scale 0 to 1, ease-back overshoot, 100ms delay after X)
5. **1.3s -- 8.0s:** Hold steady, all elements visible

Both panels contain header/subtitle text that appears simultaneously with the panel fade/slide (not sequenced separately).

### Mobile Considerations

- **Min font size:** 11px for subtitle text; labels inside boxes at minimum 12px
- **Simplified layout (< 480px wide):** Stack panels vertically instead of side-by-side. TOP = LEFT (March 2026 before), BOTTOM = RIGHT (April 2026 after). Divider becomes horizontal. Each panel takes ~45% of height.
- **Box sizes on mobile:** Reduce box widths proportionally, allow text wrapping inside boxes. Minimum box height remains 50px.
- **Arrow labels:** "wss://" label may be omitted on mobile if it causes overflow; use the arrow alone.
- **Verify at:** 375px (iPhone SE), 390px (iPhone 14), 428px (iPhone 14 Pro Max) viewport widths.

---

## Segment 2: Code Snippet Overlay -- connectingRef Lock

### Metadata

| Field | Value |
|-------|-------|
| Beat reference | Beat 5a (Support Beats -- first half) |
| Timecode | 0:40 -- 0:48 |
| Duration | 8 seconds |
| Entry transition | Hard cut from talking head (instant cut) |
| Exit transition | Hard cut to architecture comparison (Segment 3) |

### Voiceover

> "Then the bugs hit. Audio cutting off mid-sentence. Barge-in triggering on filler words. Two WebSocket connections racing each other."

*(Full voiceover plays over this 8-second code snippet segment.)*

### Layout

Full-screen centered display. No panels, no borders. The code is the entire frame.

- **File path label:** `app/hooks/useRealtimeVoice.ts` -- top-left aligned (or center-top), gray (#888888), monospace font, ~12px, no decoration
- **Vertical centering:** Code block centered vertically in the frame, slight upper-center bias (55% from top feels natural for code)
- **Code block:** 3 lines only. No surrounding context. No line numbers. No sidebar. Just the code.

```
if (connectingRef.current) return;
connectingRef.current = true;
// ... teardown before fresh start
```

- **Desktop font size:** ~28px (large enough for comfortable reading in a TikTok video at full-screen)
- **Mobile font size:** ~20px (minimum to remain readable when viewed on a phone screen)
- **Line height:** 1.6 (generous spacing between lines)
- **Font family:** Monospace (match site: Anonymous Pro, JetBrains Mono, or Fira Code -- any clean monospace)

### Syntax Highlighting

| Code element | Color |
|---|---|
| `if` keyword | #00FF00 (green) |
| `return` keyword | #00FF00 (green) |
| `true` keyword | #00FF00 (green) |
| `connectingRef.current` (both lines) | #ffffff (white) |
| `.` property access punctuation | #ffffff (white) |
| `(` `)` `;` punctuation | #ffffff (white) |
| `//` comment prefix | #666666 (dark gray) |
| `// ... teardown before fresh start` (full comment) | #666666 (dark gray) |

### Color Treatment

- **Background:** #000000 (terminal black) or #1e1e1e (VS Code dark) -- either works; #000000 is more consistent with the site aesthetic
- **No border, no card, no shadow** on the code block itself
- **Phosphor glow effect** on all green (#00FF00) text:
  ```
  text-shadow: 0 0 4px rgba(0, 255, 0, 0.4),
               0 0 8px rgba(0, 255, 0, 0.2),
               0 0 16px rgba(0, 255, 0, 0.1);
  ```
- **No glow** on white or gray text elements

### Animation Intent

1. **Line 1 appears:** Typewriter character-by-character reveal, ~0.5 seconds total for the line. Start from 0.0s.
2. **Line 2 appears:** Same typewriter effect, begins after Line 1 completes (~0.5s after start). Duration: ~0.5s.
3. **Line 3 appears:** Same typewriter effect, begins after Line 2 completes (~1.0s after start). Duration: ~0.5s.
4. **Scale animation:** Each line also scales from 95% to 100% as it enters (ease-out, 0.3s). This is subtle -- not a dramatic zoom, just a slight settle.
5. **1.5s -- 8.0s:** All 3 lines visible, static hold. The glow effect can have a subtle pulse (opacity 0.4 to 0.6 over 2s, ease-in-out infinite) for visual interest during the hold.
6. **File path label:** Appears instantly at 0.0s (no animation -- it's context, not focus).

### Mobile Considerations

- **Font size at 375px:** 18px minimum. At 20px lines may wrap -- use `white-space: nowrap` and allow horizontal scroll, OR reduce to 16px if wrapping is worse than small text.
- **File path label:** May truncate to `useRealtimeVoice.ts` (drop the directory path) on very narrow screens.
- **Glow effect:** Reduce intensity on mobile to avoid blurry text on lower-DPI screens. Use only the first shadow layer: `text-shadow: 0 0 4px rgba(0, 255, 0, 0.4)`.
- **Vertical centering:** Center at ~50% on mobile (the additional content above/below makes strict centering more natural).

---

## Segment 3: Architecture Comparison -- API Routes vs ECS Server

### Metadata

| Field | Value |
|-------|-------|
| Beat reference | Beat 5b (Support Beats -- second half) |
| Timecode | 0:48 -- 0:55 |
| Duration | 7 seconds |
| Entry transition | Hard cut from code snippet (Segment 2) |
| Exit transition | Hard cut to screen demo (Beat 6 Result) |

### Voiceover

> "What started as three API routes in a Next.js app became a full WebSocket server on ECS. Two complete rebuilds in three months."

*(Full voiceover plays over this 7-second architecture comparison segment.)*

### Layout

Two-panel horizontal split with a large arrow between them. The focus is on the leap in complexity, not individual API names.

**LEFT panel -- "v0.1" (Before):**
- Version label "v0.1" in top-left corner of the panel, gray (#888888), ~12px, monospace
- Container box with dashed border (#444444, dashed), label "Vercel" inside top of the container or as a title above
- 3 small stacked boxes inside the container:
  1. `/api/stt`
  2. `/api/chat`
  3. `/api/tts`
- Each small box: ~140px wide x 36px tall, dark gray fill (#2a2a2a), gray text (#aaaaaa), 1px solid border (#555555), small rounded corners (3px), monospace font ~12px
- Layout intent: Boxes look cramped, close together, suggesting fragility and limitation

**CENTER -- Transition arrow:**
- Large right-pointing arrow (>>, or thick SVG arrow) between the two panels
- Arrow color: #ffffff (white)
- Arrow width: ~40px, substantial presence
- Label below arrow: "Two complete rebuilds" in white (#ffffff), ~13px, monospace, centered under the arrow

**RIGHT panel -- "v1.0" (After):**
- Version label "v1.0" in top-left corner of the panel, color #00FF00 (green), ~12px, monospace
- Container box with solid border (#00FF00, 2px), label "Alibaba Cloud ECS" as title above or inside top of container
- Inside the container: "Pipeline Orchestrator" box (~160px x 60px, green border #00FF00, fill #0a1a0a, monospace text)
- Left arrow from "Pipeline Orchestrator" pointing left out of the container to a "Browser" box (outside/left of container, ~80px x 40px)
- Right arrows from "Pipeline Orchestrator" pointing right to a "DashScope" cluster of 3 small services stacked: "ASR", "LLM", "TTS" (~80px x 30px each, green-tinged fill #0a1a0a, green border #00FF00)
- Arrow colors in right panel: #00FF00
- Layout intent: Clean, organized, suggests robustness and scalability

### Color Treatment

- **Canvas background:** #0a0a0a (same as Segment 1, consistent palette)
- **Left panel:** Muted colors only. Gray fills, gray borders, gray/dark text. No green. Suggests "past" and "insufficient."
- **Right panel:** Accent green (#00FF00) for container border, version label, arrows, and service box borders. Fill colors use dark-green tint (#0a1a0a) for boxes that belong to the ECS architecture.
- **Center arrow:** #ffffff (neutral white -- it's a transition, not good or bad)
- **Label text:** #ffffff for "Two complete rebuilds"
- **v0.1 label color:** #888888 (gray -- muted, past)
- **v1.0 label color:** #00FF00 (green -- active, present)

### Animation Intent

1. **0.0s:** LEFT panel visible immediately (no animation -- it represents the past, it was already there)
2. **0.0s -- 0.5s:** RIGHT panel slides in from the right edge (translateX(+100%) to translateX(0), ease-out). Center arrow is hidden during this phase.
3. **0.5s -- 1.0s:** Center arrow draws itself left-to-right (SVG stroke-dashoffset animation, or a growing width from 0 to full). The arrow appears to "connect" the two panels.
4. **1.0s -- 1.3s:** "Two complete rebuilds" label fades in (opacity 0 to 1, ease-out) below the center arrow.
5. **1.3s -- 7.0s:** Hold steady, all elements visible.

### Mobile Considerations

- **Min font size:** 11px for service box labels (/api/stt etc.), 12px for panel headers and "Two complete rebuilds" label
- **Simplified layout (< 480px wide):** Stack panels vertically (v0.1 on top, v1.0 on bottom). Center arrow becomes a downward-pointing arrow. "Two complete rebuilds" label appears to the right of or below the arrow.
- **DashScope cluster on mobile:** Reduce to a single "DashScope (ASR + LLM + TTS)" box rather than 3 separate boxes to avoid overflow.
- **Container box sizing:** Reduce padding and box sizes by 30% on mobile while maintaining readability.
- **Version labels:** Keep visible at all sizes -- they are the key semantic difference between panels.
