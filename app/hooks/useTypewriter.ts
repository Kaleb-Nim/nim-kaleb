'use client';

import { useState, useEffect } from 'react';

interface TypewriterOptions {
  text: string;
  speed?: number; // ms per character (default 30)
  onComplete?: () => void;
}

export function useTypewriter({ text, speed = 30, onComplete }: TypewriterOptions) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!text) {
      setIsComplete(true);
      onComplete?.();
      return;
    }

    let currentIndex = 0;
    setDisplayedText('');
    setIsComplete(false);

    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsComplete(true);
        clearInterval(interval);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  return { displayedText, isComplete };
}
