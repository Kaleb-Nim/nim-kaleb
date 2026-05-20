'use client';

import { useEffect, useState } from 'react';
import Starfield from './components/Starfield';
import Terminal from './components/Terminal';
import TerminalHeader from './components/TerminalHeader';
import TerminalContent from './components/TerminalContent';
import HomePage from './components/HomePage';
import StubSectionPage from './components/StubSectionPage';
import WorkPage from './components/WorkPage';
import MeetupsPage from './components/MeetupsPage';
import HackathonsPage from './components/HackathonsPage';
import HackathonLinksPage from './components/HackathonLinksPage';
import NotFoundPage from './components/NotFoundPage';
import FloatingMic from './components/FloatingMic';
import VoiceOverlay from './components/VoiceOverlay';
import { SECTIONS } from './lib/sections';
import { useHashRoute, useHashSubRoute } from './hooks/useHashRoute';
import { useRealtimeVoice } from './hooks/useRealtimeVoice';

export default function Home() {
  const route = useHashRoute();
  const subRoute = useHashSubRoute();
  const [voiceOpen, setVoiceOpen] = useState(false);

  // Single persistent voice hook — survives overlay open/close cycles so we
  // never race a fresh connect() against a previous instance's async teardown.
  const voice = useRealtimeVoice({ transitionTo: () => {} });

  // Drive connect/disconnect from the overlay toggle.
  useEffect(() => {
    if (voiceOpen) {
      voice.connect();
    } else {
      voice.disconnect();
    }
    // voice.connect / voice.disconnect identities can change between renders;
    // only the toggle should re-fire this effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceOpen]);

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
            section.id === 'work-experience' ? (
              <WorkPage section={section} />
            ) : section.id === 'syai-meetups' ? (
              <MeetupsPage section={section} />
            ) : section.id === 'hackathons' ? (
              subRoute ? <HackathonLinksPage /> : <HackathonsPage section={section} />
            ) : (
              <StubSectionPage section={section} />
            )
          ) : (
            <NotFoundPage />
          )}
        </TerminalContent>
      </Terminal>

      <FloatingMic
        active={voiceOpen}
        onToggle={() => setVoiceOpen((v) => !v)}
      />

      {voiceOpen && (
        <VoiceOverlay voice={voice} onClose={() => setVoiceOpen(false)} />
      )}
    </>
  );
}
