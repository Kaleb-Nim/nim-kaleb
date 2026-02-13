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
    right: { label: "Cognitive Processes", value: "102" }
  },
  {
    left: { label: "Synapse Utilization", value: "45%" },
    right: { label: "Conscious Entities", value: "1" }
  },
  {
    left: { label: "Memory Usage", value: "27.1% of 100TB" },
    right: { label: "IPv4 address for mind0", value: "192.168.100.1" }
  },
  {
    left: { label: "Dream Cache", value: "20%" },
    right: { label: "Model", value: "kaleb-nim-400b-0706" }
  },
  {
    left: { label: "Emotion Index", value: "Stable" },
    right: { label: "Mood Updates", value: "0 pending" }
  },
  {
    left: { label: "Neuron Connections", value: "98% optimal" },
    right: { label: "Creativity Boosters", value: "Activated" }
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
    }, 200); // 200ms per row

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
