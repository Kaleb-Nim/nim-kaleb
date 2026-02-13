'use client';

import { ReactNode } from 'react';
import styles from './TerminalContent.module.css';

interface TerminalContentProps {
  children: ReactNode;
}

export default function TerminalContent({ children }: TerminalContentProps) {
  return (
    <div className={styles.content}>
      {children}
    </div>
  );
}
