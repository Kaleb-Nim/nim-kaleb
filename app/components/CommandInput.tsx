'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './CommandInput.module.css';

interface CommandInputProps {
  onCommand?: (command: string) => void;
}

export default function CommandInput({ onCommand }: CommandInputProps) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      onCommand?.(inputValue.trim());
      setInputValue('');
    }
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div className={styles.container} onClick={handleContainerClick}>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className={styles.hiddenInput}
        aria-label="Terminal command input"
        maxLength={10}
      />
      <div className={styles.prompt}>
        <span className={styles.promptSymbol}>&gt; </span>
        <span className={styles.inputText}>{inputValue}</span>
        <span className={styles.cursor}>█</span>
      </div>
    </div>
  );
}
