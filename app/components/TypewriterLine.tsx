'use client';

import { useTypewriter } from '../hooks/useTypewriter';

interface TypewriterLineProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

export default function TypewriterLine({ text, speed = 30, onComplete }: TypewriterLineProps) {
  const { displayedText } = useTypewriter({ text, speed, onComplete });

  return <div>{displayedText}</div>;
}
