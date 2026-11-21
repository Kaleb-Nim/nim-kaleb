// TTS provider switch. TTS_PROVIDER=dashscope (default) | fish.
// Read per call so a misconfigured env fails loudly at session time, not at import.

import * as dashscope from '../dashscope/tts';
import * as fish from '../fish/tts';
import type { TtsCallbacks, TtsHandle } from './types';

export type { TtsCallbacks, TtsHandle } from './types';

export type TtsProvider = 'dashscope' | 'fish';

interface TtsClient {
  createTtsSession(callbacks: TtsCallbacks): Promise<TtsHandle>;
  appendTextToTts(handle: TtsHandle, text: string): void;
  finishTtsSession(handle: TtsHandle): void;
  abortTtsSession(handle: TtsHandle): void;
}

const CLIENTS: Record<TtsProvider, TtsClient> = { dashscope, fish };

export function resolveTtsProvider(value: string | undefined = process.env.TTS_PROVIDER): TtsProvider {
  const v = (value ?? '').trim().toLowerCase();
  if (v === '' || v === 'dashscope') return 'dashscope';
  if (v === 'fish') return 'fish';
  console.warn(`[tts] unknown TTS_PROVIDER "${value}", falling back to dashscope`);
  return 'dashscope';
}

/** Picks the client once per session so a handle always goes back to the client that made it. */
export function getTtsClient(provider: TtsProvider = resolveTtsProvider()): TtsClient {
  return CLIENTS[provider];
}
