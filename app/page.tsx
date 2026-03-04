'use client';

import { useState, useEffect, useRef } from 'react';
import Starfield from './components/Starfield';
import Terminal from './components/Terminal';
import TerminalHeader from './components/TerminalHeader';
import TerminalContent from './components/TerminalContent';
import TypewriterLine from './components/TypewriterLine';
import CognitiveStatus from './components/CognitiveStatus';
import CommandInput from './components/CommandInput';
import VoiceInterface from './components/VoiceInterface';
import { useTerminalState } from './hooks/useTerminalState';

// ── ConnectingEllipsis: animated "..." at 400ms intervals ──────────────────
function ConnectingEllipsis() {
  const [dots, setDots] = useState(1);
  useEffect(() => {
    const id = setInterval(() => setDots((d) => (d % 3) + 1), 400);
    return () => clearInterval(id);
  }, []);
  return (
    <div>{'  '}Connecting{'.'.repeat(dots)}</div>
  );
}

export default function Home() {
  const { state, metadata, transitionTo } = useTerminalState();
  const [welcomeComplete, setWelcomeComplete] = useState(false);
  const [statusComplete, setStatusComplete] = useState(false);
  const processingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // BOOTING → STATUS
  useEffect(() => {
    if (welcomeComplete && state === 'BOOTING') {
      const t = setTimeout(() => transitionTo('STATUS'), 300);
      return () => clearTimeout(t);
    }
  }, [welcomeComplete, state, transitionTo]);

  // STATUS → MENU
  useEffect(() => {
    if (statusComplete && state === 'STATUS') {
      const t = setTimeout(() => transitionTo('MENU'), 300);
      return () => clearTimeout(t);
    }
  }, [statusComplete, state, transitionTo]);

  // PROCESSING → CONNECTING → VOICE_IDLE
  useEffect(() => {
    if (state === 'PROCESSING') {
      processingTimerRef.current = setTimeout(() => {
        transitionTo('CONNECTING');
        setTimeout(() => transitionTo('VOICE_IDLE'), 1400);
      }, 800);
      return () => {
        if (processingTimerRef.current) clearTimeout(processingTimerRef.current);
      };
    }
  }, [state, transitionTo]);

  const handleCommand = (command: string) => {
    if (command === '1' && state === 'MENU') {
      transitionTo('PROCESSING');
    }
  };

  const isVoiceState =
    state === 'VOICE_IDLE' || state === 'VOICE_ACTIVE';

  return (
    <>
      <Starfield />
      <Terminal>
        <TerminalHeader />
        <TerminalContent>
          {/* Welcome text — always shown */}
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

          {/* Cognitive management link */}
          {welcomeComplete && (
            <>
              <div>
                {'  '}* Cognitive Management:{' '}
                <span style={{ color: 'var(--yellow-accent)' }}>
                  https://app.kebab.ai
                </span>
              </div>
              <br />
            </>
          )}

          {/* Status dashboard */}
          {state !== 'BOOTING' && (
            <>
              <div>
                {'  '}Cognitive Status as of Thu Feb 13{' '}
                {new Date().toLocaleTimeString('en-US', { hour12: false })} UTC 2026
              </div>
              <br />
              <CognitiveStatus onComplete={() => setStatusComplete(true)} />
              <br />
              <div style={{ opacity: 0.7 }}>
                Last sync: Thu Feb 13{' '}
                {new Date().toLocaleTimeString('en-US', { hour12: false })} 2026
                via Kebab Cloud
              </div>
              <br />
            </>
          )}

          {/* Menu */}
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

          {/* PROCESSING */}
          {state === 'PROCESSING' && (
            <TypewriterLine
              text="> Initiating voice protocol..."
              speed={25}
            />
          )}

          {/* CONNECTING */}
          {state === 'CONNECTING' && (
            <>
              <div>{'  '}{'>'} Initiating voice protocol...</div>
              <ConnectingEllipsis />
            </>
          )}

          {/* VOICE_IDLE / VOICE_ACTIVE */}
          {isVoiceState && (
            <>
              <div>{'  '}{'>'} Initiating voice protocol...</div>
              <div>{'  '}Connection established.</div>
              <br />
              <VoiceInterface
                terminalState={state}
                transitionTo={transitionTo}
              />
            </>
          )}

          {/* Error display */}
          {metadata.errorMessage && isVoiceState && (
            <div style={{ color: '#ff4444', marginTop: 8 }}>
              {'  '}[SYSTEM] {metadata.errorMessage}
            </div>
          )}
        </TerminalContent>
      </Terminal>
    </>
  );
}
