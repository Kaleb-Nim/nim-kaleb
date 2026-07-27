# Coding Conventions

**Analysis Date:** 2026-07-27

## Naming Patterns

**Files:**
- Components: PascalCase with `.tsx` extension (e.g., `Terminal.tsx`, `CommandInput.tsx`, `CognitiveStatus.tsx`)
- Hooks: camelCase with `use` prefix and `.ts` extension (e.g., `useHashRoute.ts`, `useRealtimeVoice.ts`, `useTypewriter.ts`)
- CSS Modules: Component name + `.module.css` (e.g., `CommandInput.module.css`, `CognitiveStatus.module.css`)
- Utility/library files: camelCase (e.g., `hackathonLinks.ts`, `sections.ts`, `workStatus.ts`)
- Test files: same as source + `.test.ts` or `.spec.ts` (e.g., `hackathonLinks.test.ts`, `ws-pipeline.spec.ts`)
- API routes: nested directories matching route structure (e.g., `app/api/analytics/route.ts`)

**Functions:**
- React components: PascalCase (e.g., `CommandInput`, `CognitiveStatus`, `FloatingMic`)
- Hooks: camelCase with `use` prefix (e.g., `useHashRoute`, `useRealtimeVoice`, `useTerminalState`)
- Regular functions: camelCase (e.g., `parseHash`, `dedupeKey`, `classifyHost`)
- Event handlers: `handle{EventName}` pattern (e.g., `handleKeyDown`, `handleContainerClick`, `handleCommand`)
- Helper functions: camelCase with descriptive action verbs (e.g., `navigateTo`, `classifyHackathonLinks`, `glyphFor`)

**Variables:**
- React state: camelCase (e.g., `inputValue`, `visibleRows`, `isDesktop`)
- Refs: camelCase with `Ref` suffix (e.g., `wsRef`, `audioCtxRef`, `processorRef`, `playGenRef`)
- Booleans: `is{Property}` or `has{Property}` prefix (e.g., `isDesktop`, `isComplete`, `intentionalCloseRef`)
- Constants: UPPER_SNAKE_CASE when truly constant (e.g., `MIC_SAMPLE_RATE`, `PLAYBACK_SAMPLE_RATE`, `WS_SERVER_URL`)
- Audio conversion functions: descriptive patterns like `pcm16ToFloat32`, `float32ToPcm16Base64`

**Types & Interfaces:**
- Interfaces: PascalCase, `Props` suffix for component props (e.g., `CommandInputProps`, `CognitiveStatusProps`, `RealtimeStatus`)
- Type aliases: PascalCase (e.g., `TerminalState`, `RealtimePhase`, `HackathonLinkLabel`)
- Discriminated union types: Use `type` for union literals (e.g., `type RealtimePhase = 'idle' | 'connecting' | 'listening' | 'responding' | 'error'`)

## Code Style

**Formatting:**
- Indentation: 2 spaces (standard Next.js)
- No Prettier in use (rely on ESLint rules for enforcement)
- Line length: No strict limit enforced
- Semicolons: Always included (ESLint enforces)

**Linting:**
- Tool: ESLint 9 with flat config format
- Config file: `eslint.config.mjs` (root level)
- Extends: `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Key rules enforced:
  - TypeScript strict mode enabled via `tsconfig.json`
  - No unused variables (with selective disables for legitimate cases)
  - React hooks rules and exhaustive dependency arrays
  - Web Vitals optimizations
- **Known issue:** ESLint currently exits with code 1 (~492 problems). Root causes:
  - `.planning/research/**` (vendored minified files) scanned but should be ignored
  - `ws-server/dist/**` (build output) scanned but should be ignored
  - `ws-server/src/session.ts` contains 3 legitimate `no-this-alias` errors that need fixing
  - Config gap: globalIgnores does not include these directories

## Import Organization

**Order (observed pattern):**
1. React imports and React DOM (`import { useState } from 'react'`)
2. Type imports from React (`import type { ReactNode } from 'react'`)
3. Next.js imports (`import { useRouter } from 'next/navigation'`)
4. Third-party imports (e.g., `import { test, expect } from '@playwright/test'`)
5. Local path alias imports (`import Terminal from '@/app/components/Terminal'`)
6. Local relative imports (rare; mostly use path aliases)
7. Side-effect imports (e.g., CSS modules)

**Path Aliases:**
- `@/*` maps to project root: `@/app`, `@/components`, `@/hooks`, `@/lib`
- Used consistently across all files for imports above same-directory level
- Example: `import { useHashRoute } from '@/app/hooks/useHashRoute'`

## Error Handling

**Patterns:**
- Try-catch blocks wrap async operations and JSON parsing (e.g., in `useRealtimeVoice.ts`, `ws-pipeline.spec.ts`)
- Error messages propagated to component state for UI display: `setStatus(prev => ({ ...prev, error: msg }))`
- Type narrowing for error objects: `err instanceof DOMException ? err.name : err instanceof Error ? err.message : String(err)`
- Specific error handling for known error cases:
  - `DOMException` names in getUserMedia (maps to user-friendly messages)
  - JSON parse failures (wrapped in try-catch with fallback)
  - Network errors in fetch calls (caught, state updated, cleanup occurs)
- Error recovery includes cleanup of resources:
  - WebSocket: close and set to null
  - Audio: context.close(), disconnect nodes, getTracks().stop()
  - Timers: clearTimeout()
  - Event listeners: removeEventListener()
- Silent failures acceptable only for fire-and-forget operations (e.g., analytics posts): `.catch(() => {})`

## Logging

**Framework:** Browser `console` object (no centralized logger in app; ws-server has `logger.ts`)

**Patterns:**
- Labeled logs with metadata prefixes in brackets for context: `[ws]`, `[session]`, `[stt]`, `[ui]`, `[location]`
- Example: `console.log('[ws] session ${sessionId} connected')`
- Used primarily in test files for visibility of test execution: `console.log('[ui] STATUS reached')`
- ws-server logging: uses same bracket pattern in main module, plus structured logging in `logger.ts` for turn analysis
- Debug info logged only in tests; production code avoids verbose logging

**App (Next.js):**
- Console logs in test files only, not in production components
- Exception: internal helper logs in hooks (minimal, bracket-prefixed)

**ws-server:**
- Logger module: `ws-server/src/logger.ts` provides `logTurn()` for structured NDJSON logging of conversation turns
- Session latency tracking: captures ASR time, LLM TTFT, TTS TTFA, total turn time
- Console logs with bracket prefixes in `index.ts` and `session.ts` for WebSocket lifecycle events

## Comments

**When to Comment:**
- Complex algorithmic sections (e.g., audio processing in `useRealtimeVoice.ts`)
- State machine transitions and logic flow
- Non-obvious setup requirements (e.g., platform-specific gotchas)
- Deviations from standard patterns (e.g., why a rule is disabled)

**JSDoc/TSDoc:**
- Function-level JSDoc blocks for exported hooks and utilities
- Example from `useHashRoute.ts`:
  ```typescript
  /**
   * useHashRoute — returns the first path segment after `#/`.
   *
   * - `''` for home (`#/` or no hash)
   * - `'work-experience'` for `#/work-experience` (and `#/work-experience/...`)
   *
   * SSR-safe: initial state is `''` on the server; the first client effect
   * syncs to the actual hash.
   */
  ```
- Type documentation in interfaces for complex fields
- Comments for non-obvious parameter behavior

**Style:**
- Inline comments for sections use `── ` separator (visual clarity in longer functions)
- Comments explain "why" not "what" (code is what; comments are context)
- Keep comments concise; rarely exceed 1-2 sentences

## Function Design

**Size:**
- Custom hooks: typically 50-350 lines including complex logic (`useRealtimeVoice.ts` = 338 lines with full audio pipeline)
- Components: typically 50-150 lines (e.g., `CommandInput.tsx` = 50 lines, `CognitiveStatus.tsx` = 80+ lines)
- Utility functions: 10-50 lines for pure logic (e.g., `classifyHackathonLinks` = 29 lines)

**Parameters:**
- Props passed via object interfaces rather than multiple parameters
- Optional callbacks passed via interface: `onComplete?: () => void`
- Options objects for hook configuration: `{ transitionTo, ... }` passed to hooks

**Return Values:**
- Hooks return objects with multiple named properties for clarity: `{ status, isConnected, connect, disconnect }`
- Component functions return JSX (implicit React.ReactElement)
- Pure functions return typed data structures: `Float32Array<ArrayBuffer>`, `HackathonLink[]`
- Event handlers return `void`

## Module Design

**Exports:**
- React components use default export: `export default function Terminal(...)`
- Hooks use named export: `export function useHashRoute(): string`
- Types use named export: `export type RealtimePhase = ...`, `export interface RealtimeStatus { ... }`
- Pure utility functions use named export: `export function classifyHackathonLinks(...)`
- Single default export per component file; additional types/interfaces co-located in same file

**Barrel Files:**
- Not used in this codebase; components imported directly from their files

## Async Patterns

**State Updates:**
- Async state updates wrapped in `setStatus(prev => ({ ...prev, ... }))` for immutability
- Avoid updating state during async operations without checking mounted state

**Dependencies:**
- Callback dependencies properly tracked in `useEffect` and `useCallback`
- Dependency arrays always include all captured variables (enforced by ESLint)

**Cleanup:**
- Cleanup functions always returned from `useEffect` (prevents memory leaks)
- Examples: clearTimeout, removeEventListener, WebSocket.close()

## React-Specific Patterns

**Client Components:**
- `'use client'` directive at top of all interactive components
- Consistent use of `useState`, `useRef`, `useEffect`, `useCallback`
- Interfaces define all component props with optional props using `?`

**Children:**
- Children components use `ReactNode` type
- Rarely used; component composition favors explicit props

**Hooks:**
- `useCallback` for event handlers to prevent unnecessary re-renders
- `useRef` for mutable state that doesn't trigger re-renders (DOM refs, WebSocket refs, timers)
- `useEffect` with proper cleanup for side effects
- Dependency arrays always specified (ESLint enforces)

**Type Safety:**
- TypeScript strict mode enabled
- Explicit return types on exported functions and hooks
- Type narrowing for error handling (instanceof checks)

## Directory Structure Conventions

**App Structure:**
- Components live in `app/components/` — all interactive UI
- Hooks live in `app/hooks/` — all custom hooks
- Utilities live in `app/lib/` — pure functions, data, types
- CSS Modules co-located with components: `ComponentName.tsx` + `ComponentName.module.css`
- API routes in `app/api/` following Next.js route structure

**ws-server Structure:**
- Source in `ws-server/src/` — TypeScript entry point at `index.ts`
- DashScope integration in `ws-server/src/dashscope/`
- Build output ignored at `ws-server/dist/` (never commit)
- Logger and types co-located with main module
- Separate conventions from Next.js app: more imperative, Bun-native

---

*Convention analysis: 2026-07-27*
