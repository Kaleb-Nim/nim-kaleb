'use client';

import { ReactNode } from 'react';
import styles from './Terminal.module.css';

interface TerminalProps {
  children: ReactNode;
}

export default function Terminal({ children }: TerminalProps) {
  return (
    <div className="flex items-start justify-center min-h-screen relative z-10" style={{ padding: '4rem 1rem 1rem' }}>
      <div className={styles.terminal}>
        {children}
      </div>
    </div>
  );
}
