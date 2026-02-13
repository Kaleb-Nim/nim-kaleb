'use client';

import { ReactNode } from 'react';
import styles from './Terminal.module.css';

interface TerminalProps {
  children: ReactNode;
}

export default function Terminal({ children }: TerminalProps) {
  return (
    <div className="flex items-center justify-center min-h-screen relative z-10 p-4">
      <div className={styles.terminal}>
        {children}
      </div>
    </div>
  );
}
