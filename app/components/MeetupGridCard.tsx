'use client';

import type { MeetupItem } from '@/app/lib/sections';
import styles from './MeetupsPage.module.css';

interface MeetupGridCardProps {
  event: MeetupItem;
  index: number;
  onClick: () => void;
}

export default function MeetupGridCard({
  event,
  index,
  onClick,
}: MeetupGridCardProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  const numLabel = `#${String(event.num).padStart(2, '0')}`;

  if (event.hero === null) {
    return (
      <article
        className={styles.gridCardPlaceholder}
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={handleKeyDown}
      >
        <div className={styles.cardOverlay}>
          <span className={styles.cardNum}>{numLabel}</span>
          <div className={styles.cardTitle}>{event.title}</div>
          <div className={styles.cardDate}>{event.date}</div>
        </div>
      </article>
    );
  }

  return (
    <article
      className={styles.gridCard}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      <img
        src={event.hero}
        alt=""
        loading={index >= 3 ? 'lazy' : 'eager'}
      />
      <div className={styles.cardOverlay}>
        <span className={styles.cardNum}>{numLabel}</span>
        <div className={styles.cardTitle}>{event.title}</div>
        <div className={styles.cardDate}>{event.date}</div>
      </div>
    </article>
  );
}
