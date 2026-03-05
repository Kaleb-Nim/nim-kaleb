'use client';

import { useState, useEffect } from 'react';
import styles from './CognitiveStatus.module.css';

interface StatusRow {
  left: { label: string; value: string };
  right: { label: string; value: string };
}

const statusData: StatusRow[] = [
  {
    left: { label: "Neural Activity", value: "Elevated" },
    right: { label: "Model", value: "kaleb-nim-400b-0706" }
  },
  {
    left: { label: "Memory Usage", value: "27.1% of 100TB" },
    right: { label: "Coffee Consumed", value: "4.2L today" }
  },
  {
    left: { label: "Training Loss", value: "NaN (it's fine)" },
    right: { label: "Side Projects", value: "∞ (unfinished)" }
  },
  {
    left: { label: "GitHub Commits", value: "3am (mostly)" },
    right: { label: "Prod Incidents", value: "definitely 0" }
  },
  {
    left: { label: "Emotion Index", value: "Stable" },
    right: { label: "Mood Updates", value: "0 pending" }
  },
];

interface CognitiveStatusProps {
  onComplete?: () => void;
}

export default function CognitiveStatus({ onComplete }: CognitiveStatusProps) {
  const [visibleRows, setVisibleRows] = useState(0);
  const [isDesktop, setIsDesktop] = useState(true);

  // Check screen size
  useEffect(() => {
    const checkSize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  // Animate rows appearing one by one
  useEffect(() => {
    if (visibleRows >= statusData.length) {
      onComplete?.();
      return;
    }

    const timer = setTimeout(() => {
      setVisibleRows((prev) => prev + 1);
    }, 150); // 150ms per row

    return () => clearTimeout(timer);
  }, [visibleRows, onComplete]);

  const formatTwoColumn = (row: StatusRow): string => {
    const leftLabel = row.left.label.padEnd(22, ' ');
    const rightLabel = row.right.label.padEnd(25, ' ');
    return `  ${leftLabel}: ${row.left.value.padEnd(18, ' ')}${rightLabel}: ${row.right.value}`;
  };

  const formatSingleColumn = (item: { label: string; value: string }): string => {
    return `  ${item.label}: ${item.value}`;
  };

  return (
    <div className={isDesktop ? styles.twoColumn : styles.singleColumn}>
      {statusData.slice(0, visibleRows).map((row, i) => (
        <div key={i} className={styles.statusRow}>
          {isDesktop ? (
            <pre className={styles.statusLine}>{formatTwoColumn(row)}</pre>
          ) : (
            <>
              <div className={styles.statusLine}>{formatSingleColumn(row.left)}</div>
              <div className={styles.statusLine}>{formatSingleColumn(row.right)}</div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
