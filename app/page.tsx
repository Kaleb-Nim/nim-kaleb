'use client';

import { useState, useEffect } from 'react';
import Starfield from './components/Starfield';
import Terminal from './components/Terminal';
import TerminalHeader from './components/TerminalHeader';
import TerminalContent from './components/TerminalContent';
import TypewriterLine from './components/TypewriterLine';
import CognitiveStatus from './components/CognitiveStatus';
import CommandInput from './components/CommandInput';
import { useTerminalState } from './hooks/useTerminalState';

export default function Home() {
  const { state, transitionTo } = useTerminalState();
  const [welcomeComplete, setWelcomeComplete] = useState(false);
  const [statusComplete, setStatusComplete] = useState(false);

  // Animation sequence timing
  useEffect(() => {
    // After welcome text completes, show status
    if (welcomeComplete && state === 'BOOTING') {
      const timer = setTimeout(() => transitionTo('STATUS'), 300);
      return () => clearTimeout(timer);
    }
  }, [welcomeComplete, state, transitionTo]);

  useEffect(() => {
    // After status completes, show menu
    if (statusComplete && state === 'STATUS') {
      const timer = setTimeout(() => transitionTo('MENU'), 300);
      return () => clearTimeout(timer);
    }
  }, [statusComplete, state, transitionTo]);

  const handleCommand = (command: string) => {
    // Placeholder for future command handling
    console.log('Command entered:', command);
  };

  return (
    <>
      <Starfield />
      <Terminal>
        <TerminalHeader />
        <TerminalContent>
          {/* Welcome text - always shown */}
          <TypewriterLine
            text="Welcome to the Kebab Neural Interface (Operating Model: kaleb-nim-400b-0706)"
            speed={30}
          />
          <TypewriterLine
            text="Powered by Kebab 10.24 (Elaborate Mind Edition)"
            speed={30}
            onComplete={() => setWelcomeComplete(true)}
          />
          <br />

          {/* Cognitive management link - shown after welcome */}
          {welcomeComplete && (
            <>
              <div>
                {'  '}* Cognitive Management:     <span style={{ color: 'var(--yellow-accent)' }}>https://app.kebab.ai</span>
              </div>
              <br />
            </>
          )}

          {/* Status dashboard - shown in STATUS state */}
          {state !== 'BOOTING' && (
            <>
              <div>{'  '}Cognitive Status as of Thu Feb 13 {new Date().toLocaleTimeString('en-US', { hour12: false })} UTC 2026</div>
              <br />
              <CognitiveStatus onComplete={() => setStatusComplete(true)} />
              <br />
              <div style={{ opacity: 0.7 }}>
                Last sync: Thu Feb 13 {new Date().toLocaleTimeString('en-US', { hour12: false })} 2026 via Kebab Cloud
              </div>
              <br />
            </>
          )}

          {/* Menu - shown in MENU state */}
          {state === 'MENU' && (
            <>
              <TypewriterLine text="Select an option:" speed={30} />
              <TypewriterLine text="1. Activate Voice Interface" speed={30} />
              <br />
              <div>---</div>
              <br />
              <CommandInput onCommand={handleCommand} />
            </>
          )}
        </TerminalContent>
      </Terminal>
    </>
  );
}
