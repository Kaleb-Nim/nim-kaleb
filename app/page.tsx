'use client';

import { useEffect, useState } from 'react';
import Starfield from './components/Starfield';
import Terminal from './components/Terminal';
import TerminalHeader from './components/TerminalHeader';
import TerminalContent from './components/TerminalContent';
import HomePage from './components/HomePage';
import StubSectionPage from './components/StubSectionPage';
import NotFoundPage from './components/NotFoundPage';
import FloatingMic from './components/FloatingMic';
import VoiceOverlay from './components/VoiceOverlay';
import { SECTIONS } from './lib/sections';
import { useHashRoute } from './hooks/useHashRoute';

export default function Home() {
  const route = useHashRoute();
  const [voiceOpen, setVoiceOpen] = useState(false);

  // Esc closes the overlay (owned at root so it works regardless of focus)
  useEffect(() => {
    if (!voiceOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setVoiceOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [voiceOpen]);

  const isHome = route === '';
  const section = isHome ? null : SECTIONS.find((s) => s.id === route);

  return (
    <>
      <Starfield />
      <Terminal>
        <TerminalHeader />
        <TerminalContent>
          {isHome ? (
            <HomePage />
          ) : section ? (
            <StubSectionPage section={section} />
          ) : (
            <NotFoundPage />
          )}
        </TerminalContent>
      </Terminal>

      <FloatingMic
        active={voiceOpen}
        onToggle={() => setVoiceOpen((v) => !v)}
      />

      {voiceOpen && <VoiceOverlay onClose={() => setVoiceOpen(false)} />}
    </>
  );
}
