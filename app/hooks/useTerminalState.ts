'use client';

import { useState } from 'react';

export type TerminalState =
  | 'BOOTING'
  | 'STATUS'
  | 'MENU'
  | 'PROCESSING'
  | 'CONNECTING'
  | 'VOICE_IDLE'
  | 'VOICE_ACTIVE';

export interface TerminalStateMetadata {
  errorMessage?: string;
  lastTranscript?: string;
}

export function useTerminalState() {
  const [state, setState] = useState<TerminalState>('BOOTING');
  const [metadata, setMetadata] = useState<TerminalStateMetadata>({});

  const transitionTo = (
    newState: TerminalState,
    meta?: TerminalStateMetadata
  ) => {
    setState(newState);
    if (meta) setMetadata((prev) => ({ ...prev, ...meta }));
  };

  return { state, metadata, transitionTo };
}
