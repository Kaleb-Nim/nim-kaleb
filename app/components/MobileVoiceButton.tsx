'use client';

import styles from './MobileVoiceButton.module.css';

interface MobileVoiceButtonProps {
  onActivate: () => void;
}

export default function MobileVoiceButton({ onActivate }: MobileVoiceButtonProps) {
  return (
    <button
      type="button"
      className={styles.button}
      onClick={onActivate}
      aria-label="Activate voice interface"
    >
      [ ▶ ACTIVATE VOICE INTERFACE ]
    </button>
  );
}
