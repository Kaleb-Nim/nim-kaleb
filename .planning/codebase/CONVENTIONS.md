# Coding Conventions

**Analysis Date:** 2026-04-09

## Naming Patterns

**Files:**
- Components: PascalCase with `.tsx` extension (e.g., `Terminal.tsx`, `CommandInput.tsx`, `VoiceInterface.tsx`)
- Hooks: camelCase with `use` prefix and `.ts` extension (e.g., `useTerminalState.ts`, `useRealtimeVoice.ts`, `useTypewriter.ts`)
- CSS Modules: Component name + `.module.css` (e.g., `Terminal.module.css`, `VoiceInterface.module.css`)
- API routes: Nested directories matching route structure (e.g., `app/api/realtime/session/route.ts`)
- Utility files: camelCase (e.g., `memory.ts`)

**Functions:**
- React components: PascalCase (e.g., `Home`, `Terminal`, `VoiceInterface`)
- Hooks: camelCase with `use` prefix (e.g., `useTerminalState`, `useRealtimeVoice`, `useTypewriter`)
- Regular functions: camelCase (e.g., `connect`, `disconnect`, `handleMessage`, `downsampling`, `pcm16ToFloat32`)
- Helper functions in components: camelCase (e.g., `handleCommand`, `handleKeyDown`, `scheduleAudioChunk`)
- Event handlers: `handle{EventName}` pattern (e.g., `handleCommand`, `handleKeyDown`, `handleContainerClick`, `handleMessage`)

**Variables:**
- React state: camelCase (e.g., `inputValue`, `displayedText`, `isComplete`, `status`)
- Refs: camelCase with `Ref` suffix (e.g., `canvasRef`, `inputRef`, `wsRef`, `audioCtxRef`, `micStreamRef`)
- Constants: UPPER_SNAKE_CASE when truly constant (e.g., `SAMPLE_RATE`, `PHASE_LABELS`)
- Booleans: `is{Property}` or `has{Property}` prefix (e.g., `isDesktop`, `isComplete`, `isConnected`, `hasGreenTint`)
- Abbreviations in conversions: descriptive patterns like `pcm16ToFloat32`, `float32ToPcm16Base64`

**Types:**
- Interfaces: PascalCase, `Props` suffix for component props (e.g., `CommandInputProps`, `VoiceInterfaceProps`, `TypewriterOptions`)
- Type aliases: PascalCase (e.g., `TerminalState`, `RealtimePhase`, `RealtimeStatus`, `Star`)
- Discriminated union types: Use `type` for union literals (e.g., `type RealtimePhase = 'idle' | 'connecting' | 'listening' | 'responding' | 'error'`)
- Exported types: Consistent with domain (e.g., `type TerminalState`, `export interface RealtimeStatus`)

## Code Style

**Formatting:**
- ESLint: Next.js 16 core web vitals + TypeScript rules (`eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`)
- Config file: `eslint.config.mjs` (flat config format, ESLint 9)
- No Prettier in use (rely on ESLint rules)
- Indentation: 2 spaces (standard Next.js)

**Linting:**
- ESLint configuration: Extends Next.js defaults (core web vitals and TypeScript)
- Global ignores: `.next/**`, `out/**`, `build/**`, `next-env.d.ts`
- Strict TypeScript mode enabled in `tsconfig.json`

## Import Organization

**Order:**
1. React/Next.js imports (`import { ... } from 'react'`, `import { NextResponse } from 'next/server'`)
2. Local imports using path aliases (`import { ... } from '@/...'`)
3. Type imports separated with `import type` when importing only types

**Path Aliases:**
- `@/*` maps to project root (e.g., `@/app/hooks/useTerminalState`, `@/app/components/Terminal`)
- Used consistently across all files for relative imports above same-directory level

**Example from codebase:**
```typescript
'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './CommandInput.module.css';

interface CommandInputProps {
  onCommand?: (command: string) => void;
}
```

## Error Handling

**Patterns:**
- Try-catch blocks wrap async operations and JSON parsing (e.g., in `useRealtimeVoice.ts`)
- Error messages propagated to state for UI display (`setStatus(prev => ({ ...prev, phase: 'error', error: msg }})`)
- Specific error handling for known error cases: JSON parse failures, network errors, file operations
- Error recovery includes cleanup of resources (closing WebSocket, stopping audio tracks, clearing refs)
- Type narrowing for error objects: `err instanceof Error ? err.message : String(err)`

**Example from `useRealtimeVoice.ts`:**
```typescript
catch (err) {
  const msg = err instanceof Error ? err.message : String(err);
  setStatus({ phase: 'error', transcript: '', responseText: '', error: msg });
  // Clean up on error
  micStreamRef.current?.getTracks().forEach(t => t.stop());
  micStreamRef.current = null;
  audioCtxRef.current?.close();
  audioCtxRef.current = null;
  wsRef.current = null;
}
```

## Logging

**Framework:** `console` object (no external logging library)

**Patterns:**
- Browser console output in test files for debugging: `console.log('[session] token prefix:', json.token.slice(0, 20) + '…')`
- Labeled logs with metadata prefixes in brackets: `[session]`, `[stt]`, `[round-trip]`, `[ui]`, `[location]`
- Used primarily in Playwright tests for test result visibility

## Comments

**When to Comment:**
- Complex algorithmic sections (e.g., audio processing in `useRealtimeVoice.ts`)
- State machine transitions and logic flow (e.g., section comments in `app/page.tsx`)
- Non-obvious setup requirements (e.g., "Don't set global Content-Type — it breaks multipart form uploads" in `playwright.config.ts`)

**JSDoc/TSDoc:**
- Function-level JSDoc blocks for exported hooks and utilities:
  ```typescript
  /**
   * E2E tests for the OpenAI Realtime voice interface.
   *
   * Tests:
   *   1. POST /api/realtime/session — returns a valid ephemeral token
   *   2. UI — voice interface renders with Connect button in VOICE_IDLE state
   *   3. Old endpoints (tts/stt/chat) are gone (return 404)
   */
  ```
- Inline comments for sections with `── ` separator (visual clarity in longer functions)
- Type documentation in interfaces for complex fields

## Function Design

**Size:** Functions kept focused and concise
- Custom hooks under 300 lines including complex logic (`useRealtimeVoice.ts` = 338 lines with full audio pipeline)
- Components typically 50-150 lines
- Event handlers: single-line arrow functions when simple, multi-statement for complex logic

**Parameters:**
- Props passed via object interfaces rather than multiple parameters
- Optional callbacks passed via interface: `onComplete?: () => void`
- Options objects for hook configuration: `{ transitionTo, ... }` passed to hooks

**Return Values:**
- Hooks return objects with multiple properties: `{ status, analyserRef, connect, disconnect, isConnected }`
- Component functions return JSX (implicit React.ReactElement)
- Type definitions explicit: `Float32Array<ArrayBuffer>` for typed array returns
- Event handlers return `void`

## Module Design

**Exports:**
- Default exports for React components: `export default function Terminal(...)`
- Named exports for hooks: `export function useTerminalState(...)`
- Named exports for types: `export type RealtimePhase = ...`, `export interface RealtimeStatus { ... }`
- Single default export per component file, additional types/interfaces co-located

**Barrel Files:** Not used in this codebase
- Components imported directly from their files
- Hooks imported from individual hook files in `app/hooks/`

## Async Patterns

**State Updates:**
- Async state updates wrapped in `setStatus(prev => ({ ...prev, ... }))`
- Callback dependencies properly tracked in useEffect and useCallback
- Cleanup functions return from useEffect (memory leak prevention in animation loops, event listeners)

**Example from `CognitiveStatus.tsx`:**
```typescript
useEffect(() => {
  if (visibleRows >= statusData.length) {
    onComplete?.();
    return;
  }

  const timer = setTimeout(() => {
    setVisibleRows((prev) => prev + 1);
  }, 150);

  return () => clearTimeout(timer);
}, [visibleRows, onComplete]);
```

## React-Specific Patterns

**Client Components:**
- `'use client'` directive at top of all interactive components
- Consistent use of `useState`, `useRef`, `useEffect`, `useCallback`

**Props:**
- Interfaces define all component props
- Optional props use `?` (e.g., `onComplete?: () => void`)
- Children components use `ReactNode` type

**Custom Hooks:**
- Return objects with named properties for clarity
- Use `useCallback` for event handlers to prevent unnecessary re-renders
- Proper dependency arrays on all useEffect and useCallback

---

*Convention analysis: 2026-04-09*
