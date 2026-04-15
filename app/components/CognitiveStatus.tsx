'use client';

import { useState, useEffect } from 'react';
import styles from './CognitiveStatus.module.css';

interface StatusCell {
  label: string;
  value: string;
  href?: string;
  external?: boolean;
}

interface StatusRow {
  left: StatusCell;
  right: StatusCell;
}

const statusData: StatusRow[] = [
  {
    left:  { label: "LinkedIn", value: "LinkedIn", href: "https://www.linkedin.com/in/kaleb-nim/", external: true },
    right: { label: "GitHub", value: "GitHub", href: "https://github.com/Kaleb-Nim", external: true },
  },
  {
    left:  { label: "Email", value: "kaleb.nim@gmail.com", href: "mailto:kaleb.nim@gmail.com" },
    right: { label: "Resume", value: "Download CV [PDF]", href: "/kaleb-cv.pdf", external: true },
  },
  {
    left:  { label: "Coffee Consumed", value: "4.2L today" },
    right: { label: "Side Projects", value: "\u221E (unfinished)" },
  },
  {
    left:  { label: "Prod Incidents", value: "definitely 0" },
    right: { label: "Emotion Index", value: "Stable" },
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

  const renderCell = (cell: StatusCell, padWidth: number, isLeft: boolean) => {
    const displayValue = isLeft ? cell.value.padEnd(padWidth, ' ') : cell.value;
    if (cell.href) {
      return (
        <a
          href={cell.href}
          className={styles.goldLink}
          target={cell.external ? "_blank" : undefined}
          rel={cell.external ? "noopener noreferrer" : undefined}
        >
          {displayValue}
        </a>
      );
    }
    return displayValue;
  };

  const renderTwoColumn = (row: StatusRow): React.ReactNode => {
    const leftLabel = `  ${row.left.label.padEnd(22, ' ')}: `;
    const rightLabel = `${row.right.label.padEnd(25, ' ')}: `;

    return (
      <>
        {leftLabel}
        {renderCell(row.left, 22, true)}
        {rightLabel}
        {renderCell(row.right, 0, false)}
      </>
    );
  };

  const renderSingleColumn = (cell: StatusCell): React.ReactNode => {
    if (cell.href) {
      return (
        <>
          {`  ${cell.label}: `}
          <a
            href={cell.href}
            className={styles.goldLink}
            target={cell.external ? "_blank" : undefined}
            rel={cell.external ? "noopener noreferrer" : undefined}
          >
            {cell.value}
          </a>
        </>
      );
    }
    return `  ${cell.label}: ${cell.value}`;
  };

  return (
    <div className={isDesktop ? styles.twoColumn : styles.singleColumn}>
      {statusData.slice(0, visibleRows).map((row, i) => (
        <div key={i} className={styles.statusRow}>
          {isDesktop ? (
            <pre className={styles.statusLine}>{renderTwoColumn(row)}</pre>
          ) : (
            <>
              <div className={styles.statusLine}>{renderSingleColumn(row.left)}</div>
              <div className={styles.statusLine}>{renderSingleColumn(row.right)}</div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
