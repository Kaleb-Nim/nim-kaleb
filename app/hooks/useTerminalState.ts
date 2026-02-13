'use client';

import { useState } from 'react';

type TerminalState = 'BOOTING' | 'STATUS' | 'MENU';

export function useTerminalState() {
  const [state, setState] = useState<TerminalState>('BOOTING');

  const transitionTo = (newState: TerminalState) => {
    setState(newState);
  };

  return { state, transitionTo };
}
