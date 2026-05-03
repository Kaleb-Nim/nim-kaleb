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
    left:  { label: "Build Walkthrough", value: "Watch [YouTube]", href: "https://youtu.be/WHKIfOb0V7Q", external: true },
    right: { label: "Side Projects", value: "∞ (unfinished)" },
  },
  {
    left:  { label: "Email", value: "kaleb.nim@gmail.com", href: "mailto:kaleb.nim@gmail.com" },
    right: { label: "Resume", value: "Download CV [PDF]", href: "/kaleb-cv.pdf", external: true },
  },
  {
    left:  { label: "Prod Incidents", value: "definitely 0" },
    right: { label: "Emotion Index", value: "Stable" },
  },
];

interface CognitiveStatusProps {
  onComplete?: () => void;
}

// Determine the trailing glyph for a cell (↗ external, ⬇ download, none for email/non-link)
function glyphFor(cell: StatusCell): string | null {
  if (!cell.href) return null;
  if (cell.href.startsWith('mailto:')) return null;
  if (cell.href.endsWith('.pdf')) return '⬇'; // ⬇ download
  if (cell.external) return '↗'; // ↗ external
  return null;
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
    const glyph = glyphFor(cell);
    // When a glyph will be appended, shrink the textual padding by 1 so total
    // visual width (padded value + glyph) matches the original column width.
    // Right column has no padding (padWidth=0), so no adjustment needed there.
    const effectivePad = isLeft && glyph && padWidth > 0 ? padWidth - 1 : padWidth;
    const displayValue = isLeft ? cell.value.padEnd(effectivePad, ' ') : cell.value;
    if (cell.href) {
      return (
        <a
          href={cell.href}
          className={styles.goldLink}
          target={cell.external ? "_blank" : undefined}
          rel={cell.external ? "noopener noreferrer" : undefined}
        >
          {displayValue}
          {glyph && <span className={styles.externalGlyph}>{glyph}</span>}
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
    const glyph = glyphFor(cell);
    if (cell.href) {
      // Wrap the entire row in <a> for full-row tap target on mobile.
      // Label uses inner span styled phosphor-green to override link gold.
      return (
        <a
          href={cell.href}
          className={`${styles.goldLink} ${styles.goldLinkBlock}`}
          target={cell.external ? "_blank" : undefined}
          rel={cell.external ? "noopener noreferrer" : undefined}
        >
          <span className={styles.rowLabel}>{`  ${cell.label}: `}</span>
          <span>{cell.value}</span>
          {glyph && <span className={styles.externalGlyph}>{glyph}</span>}
        </a>
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
      {visibleRows >= statusData.length && (
        <div className={styles.internshipBanner}>
          LOOKING FOR AI ENGINEERING INTERNSHIPS — STARTING AUG 2026
        </div>
      )}
    </div>
  );
}
