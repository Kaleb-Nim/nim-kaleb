'use client';

import type { MeetupItem } from '@/app/lib/sections';
import styles from './MeetupsPage.module.css';

interface MeetupGridCardProps {
  event: MeetupItem;
  index: number;
  featured?: boolean;
  onClick: () => void;
}

export default function MeetupGridCard({
  event,
  index,
  featured,
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

  const cardClass = featured
    ? `${styles.gridCard} ${styles.featuredCard}`
    : styles.gridCard;

  return (
    <article
      className={cardClass}
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
      <div className={featured ? styles.featuredOverlay : styles.cardOverlay}>
        {featured && <span className={styles.featuredBadge}>▶ LATEST</span>}
        <span className={styles.cardNum}>{numLabel}</span>
        <div className={featured ? styles.featuredTitle : styles.cardTitle}>{event.title}</div>
        <div className={styles.cardDate}>{event.date}</div>
      </div>
    </article>
  );
}
