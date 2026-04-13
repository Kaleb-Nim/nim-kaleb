# Architecture

**Analysis Date:** 2026-04-09

## Pattern Overview

**Overall:** Component-driven state machine with real-time WebSocket voice streaming

**Key Characteristics:**
- Linear state progression through terminal lifecycle phases
- Client-side React components with server-side API proxies
- OpenAI Realtime API integration for bidirectional voice
- Canvas-based visual rendering (starfield, waveform)
- Strict CSS-in-modules for terminal styling (not Tailwind)

## Layers

**Presentation (React Components):**
- Purpose: Render terminal UI with animations and state-driven visibility
- Location: `app/components/`
- Contains: TSX components for terminal chrome, content, voice interface
- Depends on: Hooks (state management, typewriter, voice), CSS modules
- Used by: Root page component

**State Management (Custom Hooks):**
- Purpose: Encapsulate terminal state machine, typewriter animation, voice connection logic
- Location: `app/hooks/`
- Contains: `useTerminalState.ts`, `useTypewriter.ts`, `useRealtimeVoice.ts`
- Depends on: React hooks, OpenAI SDK, Web Audio API
- Used by: Components and page component

**Server API (Next.js Route Handlers):**
- Purpose: Proxy OpenAI Realtime session creation with server-side secret handling
- Location: `app/api/realtime/session/route.ts`
- Contains: POST endpoint that exchanges server API key for client-safe ephemeral token
- Depends on: OpenAI API, environment variables
- Used by: `useRealtimeVoice` hook (browser fetch call)

**Root Layout & Page:**
- Purpose: App initialization and entry point
- Location: `app/layout.tsx`, `app/page.tsx`
- Contains: Font loading, metadata, terminal state orchestration
- Depends on: All components and hooks
- Used by: Next.js router

## Data Flow

**App Initialization:**
1. `app/layout.tsx` loads Anonymous Pro font, sets metadata
2. `app/page.tsx` mounts as 'use client', initializes `useTerminalState()`
3. Starfield canvas renders immediately (z-index: 0)
4. Terminal container fades in (z-index: 1)

**Terminal State Progression:**

1. **BOOTING** → **STATUS** (300ms after welcome text completes)
   - `TypewriterLine` components reveal welcome message character-by-character
   - `CognitiveStatus` animates rows appearing (150ms per row)
   - `onComplete` callbacks trigger state transitions

2. **STATUS** → **MENU** (300ms after status dashboard completes)
   - Menu options render with typewriter effect
   - `CommandInput` component displays hidden input + prompt
   - User can enter command "1"

3. **MENU** → **PROCESSING** (user enters "1")
   - `handleCommand` in page.tsx calls `transitionTo('PROCESSING')`
   - "Initiating voice protocol..." text appears with typewriter

4. **PROCESSING** → **CONNECTING** (800ms delay)
   - Connecting message with animated ellipsis (400ms intervals)

5. **CONNECTING** → **VOICE_IDLE** (1400ms delay)
   - `useRealtimeVoice` hook is active but not yet connected
   - `VoiceInterface` component renders with Connect button

6. **VOICE_IDLE** → **VOICE_ACTIVE** (when WebSocket opens)
   - User clicks Connect button → `useRealtimeVoice.connect()` fires
   - Fetches ephemeral token from `/api/realtime/session`
   - Opens WebSocket to OpenAI Realtime API
   - Audio context and mic stream initialized
   - On successful session creation, transitions to VOICE_ACTIVE

7. **VOICE_ACTIVE** → back to **VOICE_IDLE** (on disconnect)
   - `useRealtimeVoice.disconnect()` cleans up WebSocket, audio context, mic stream

**Voice Interaction Loop (when VOICE_ACTIVE):**
1. User speaks → `ScriptProcessor` captures PCM16 audio in 4096-sample chunks
2. Audio downsampled from native sample rate to 24kHz
3. Chunks encoded as base64 and sent via WebSocket: `{ type: 'input_audio_buffer.append', audio: '...' }`
4. OpenAI transcribes speech → `conversation.item.input_audio_transcription.completed` event
5. LLM generates response → `response.created` event triggers audio playback scheduling
6. Audio chunks arrive as base64 PCM16 → decoded and scheduled on `AudioContext` with sequential timing
7. User sees: transcript + AI response text + waveform visualization

**State Management:**
- Terminal state held in component state via `useTerminalState()` custom hook
- Metadata (error messages, transcripts) stored alongside state
- Transitions triggered by:
  - Component lifecycle events (onComplete callbacks)
  - User input (CommandInput)
  - WebSocket events (OpenAI Realtime)
  - Timer callbacks (processing delays)

## Key Abstractions

**TerminalState Enum:**
- Purpose: Encapsulate valid state transitions
- Examples: `BOOTING`, `STATUS`, `MENU`, `PROCESSING`, `CONNECTING`, `VOICE_IDLE`, `VOICE_ACTIVE`
- Pattern: Centralized type definition in `useTerminalState.ts` used throughout codebase

**Typewriter Effect:**
- Purpose: Character-by-character text reveal with completion callback
- Examples: `useTypewriter` hook, `TypewriterLine` component
- Pattern: Character index incremented on interval, completion triggers state transition

**Realtime Voice Session:**
- Purpose: Manage OpenAI WebSocket connection lifecycle
- Examples: `useRealtimeVoice` hook, session token endpoint
- Pattern: Setup → async connect → message handlers → cleanup on disconnect

**AudioContext Scheduling:**
- Purpose: Seamless sequential playback of incoming PCM16 audio chunks
- Examples: `scheduleAudioChunk` in `useRealtimeVoice`
- Pattern: Track `nextPlayTimeRef` to schedule each source at end of previous duration

## Entry Points

**Root Page:**
- Location: `app/page.tsx`
- Triggers: Next.js router / app initialization
- Responsibilities:
  - Initialize terminal state machine
  - Render Starfield + Terminal container
  - Orchestrate state transitions via useEffect
  - Handle command input
  - Conditionally render content based on state

**API Endpoint (Token Exchange):**
- Location: `app/api/realtime/session/route.ts`
- Triggers: Fetch call from `useRealtimeVoice.connect()`
- Responsibilities:
  - Accept POST request (no body required)
  - Call OpenAI `/v1/realtime/sessions` with server API key
  - Return ephemeral token to client
  - Handle error cases (missing OPENAI_API_KEY, OpenAI API errors)

## Error Handling

**Strategy:** Try-catch in async functions, error state in hook status, conditional rendering in UI

**Patterns:**
- WebSocket error → `setStatus({ phase: 'error', error: msg })` → conditional `<div className={styles.errorLine}>` renders
- Fetch error in connect → caught in try-catch → mic/audio cleanup → error state
- Missing API key → 500 response → caught by hook → error message displayed
- User denial of mic access → getUserMedia throws → caught → error state

## Cross-Cutting Concerns

**Logging:** 
- console via `console` (not implemented in current codebase, could be added)
- No centralized logging service

**Validation:** 
- Input validation: CommandInput limits to 10 characters via `maxLength`
- API response validation: assumes OpenAI response shape (no schema validation)

**Authentication:** 
- Stateless token-based: server issues ephemeral tokens
- OpenAI Realtime WebSocket authenticated via ephemeral token in protocol header
- No user authentication (public portfolio)

**Cleanup:**
- React useEffect cleanup functions for timers and animation frames
- WebSocket cleanup on disconnect (wsRef = null)
- Audio context cleanup (close, disconnect, getTracks.stop)
- Event listener cleanup (window resize, etc.)

---

*Architecture analysis: 2026-04-09*
