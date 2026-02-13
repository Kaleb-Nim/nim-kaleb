# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Next.js 16 (App Router)** project recreating the markokraemer.com terminal-themed portfolio site. The site is a single-page React application that simulates a macOS-style terminal window floating on a starfield background, presenting a "Kortix Neural Interface" - a sci-fi themed personal portfolio.

**Tech Stack:**
- Next.js 16 with App Router
- React 19.2
- TypeScript
- Tailwind CSS 4
- Google Fonts: Anonymous Pro (monospace terminal font)

**Design Reference:** `markokraemer-ui-design-spec.html` contains the complete UI specification with exact measurements, colors, animations, and implementation guidance.

## Development Commands

```bash
# Development server (preferred: bun)
bun dev              # Runs on http://localhost:3000

# Production build
bun run build
bun start

# Linting
bun run lint
```

## Architecture & Key Concepts

### Visual Structure
The site has two primary layers:
1. **Starfield Background** (z-index: 0): Full viewport animated star field on `#010810` dark space
2. **Terminal Window** (z-index: 1): Centered floating terminal (`~860px` max-width, `~442px` height) with macOS-style chrome

### Terminal State Machine
The application follows a linear state progression:
```
BOOTING → STATUS → MENU → PROCESSING → CONNECTING → VOICE_IDLE → VOICE_ACTIVE
```

Each state triggers specific animations and user interactions. The typewriter effect is central to the experience.

### Component Architecture (Recommended)
```
app/
├── page.tsx                      # Root page - renders Starfield + Terminal
├── components/
│   ├── Starfield.tsx             # Canvas-based star background with twinkling
│   ├── Terminal.tsx              # Main terminal window frame
│   ├── TerminalHeader.tsx        # macOS title bar with traffic light dots
│   ├── TerminalContent.tsx       # Scrollable content area
│   ├── TypeWriter.tsx            # Character-by-character text reveal
│   ├── CognitiveStatus.tsx       # Two-column status dashboard
│   ├── CommandInput.tsx          # Hidden input + blinking cursor
│   └── VoiceInterface.tsx        # Post-connection voice UI
└── hooks/
    ├── useTypewriter.ts          # Typewriter animation logic
    └── useTerminalState.ts       # State machine for terminal phases
```

## Critical Design Requirements

### Color System (Strict Palette)
- **Page Background**: `#010810` (deep space)
- **Terminal Background**: `#000000` (pure black)
- **Terminal Header**: `#333333` (dark gray)
- **Primary Text**: `#00FF00` (phosphor green with glow)
- **Highlights/Links**: `#FFD700` (gold yellow)
- **Input Text**: `#FFFFFF` (white)
- **macOS Dots**: Red `#FF5F56`, Yellow `#FFBD2E`, Green `#27C93F`

### Typography
- **Font**: `Anonymous Pro` (Google Fonts, monospace)
- **Size**: `~0.82rem` (`~13px`) for terminal text
- **Line Height**: `1.8` (generous for readability)
- **Critical**: Text must use `#00FF00` with phosphor glow effect:
  ```css
  text-shadow: 0 0 4px rgba(0, 255, 0, 0.4),
               0 0 8px rgba(0, 255, 0, 0.2),
               0 0 16px rgba(0, 255, 0, 0.1);
  ```

### Monospace Alignment
The "Cognitive Status" dashboard uses precise character-width alignment:
- Left column labels: padded to 22 characters
- Values start at character 23
- Right column starts around character 40
- Use `white-space: pre` or exact `&nbsp;` counting

### Animation Sequence
1. **0ms**: Starfield renders
2. **~200ms**: Terminal fades in (opacity 0→1, 400ms ease-out)
3. **~600ms**: Welcome text typewriter starts (~20-40ms per character)
4. **~2s**: Cognitive Status dashboard types row-by-row
5. **~4s**: Menu appears, cursor blinks, input enabled
6. **User Input**: "1" + Enter triggers "Connecting..." with animated ellipsis

### Cursor Implementation
- Block cursor: `█` (U+2588)
- Blinking: `1s` step-end infinite animation
- Color: `#FFFFFF` (white)

### Responsive Behavior
- **Desktop (>1024px)**: Fixed `~860px` terminal, centered
- **Tablet (768-1024px)**: `~90vw` terminal width
- **Mobile (<768px)**: `~95vw`, consider horizontal scroll or single-column fallback for two-column data

## Important Implementation Notes

1. **Avoid Tailwind for Terminal Styles**: The terminal component has too many custom CSS properties (text-shadow, precise spacing). Use CSS Modules or styled-components.

2. **Font Loading**: Preload Anonymous Pro via `<link rel="preload">` to prevent FOUT on the typewriter effect.

3. **Performance**:
   - Starfield: Use `requestAnimationFrame`, cap at 30fps
   - Typewriter: Batch DOM updates to avoid per-character reflows
   - Target bundle: <80KB gzipped

4. **Accessibility**:
   - Hidden input needs `aria-label="Terminal command input"`
   - Respect `prefers-reduced-motion` - disable typewriter, show text instantly
   - Green on black passes WCAG AA contrast

5. **Window Chrome Dots**: The macOS traffic light dots are decorative only (no click handlers by default). Consider adding hover effects for polish.

6. **Voice Interface**: The "Activate Voice Interface" option connects to an actual AI voice service (Kortix). The connection state may involve real API calls.

## Terminal Content Text

The exact welcome message and status dashboard content is specified in the design doc. Key narrative elements:
- **Operating Model**: `marko-kraemer-400b-0706`
- **OS Version**: `Kortix 10.24 (Elaborate Mind Edition)`
- **Management URL**: `https://app.kortix.ai`

## Path Aliases
Use `@/*` for imports (e.g., `@/components/Terminal`).

## Current Project State
This is a fresh Next.js installation with default template files. The layout currently uses Geist fonts - these need to be replaced with Anonymous Pro per the design spec.
