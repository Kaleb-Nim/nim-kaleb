'use client';

import { useState } from 'react';
import type { Section, MeetupItem } from '@/app/lib/sections';
import PageHeader, { FooterMeta } from './PageHeader';
import MeetupGridCard from './MeetupGridCard';
import MeetupDetail from './MeetupDetail';
import styles from './MeetupsPage.module.css';

export default function MeetupsPage({ section }: { section: Section }) {
  const items = section.items as MeetupItem[];
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const selectedEvent = selectedIdx !== null ? items[selectedIdx] : null;

  // Stats computation
  const eventsCount = items.length;
  const uniqueMonths = new Set(items.map((i) => i.date)).size;
  const monthsStr = `${uniqueMonths}+`;

  const stats = [
    { value: eventsCount, label: 'EVENTS' },
    { value: '500+', label: 'ATTENDEES' },
    { value: monthsStr, label: 'ACTIVE MONTHS' },
  ];

  return (
    <div>
      <PageHeader section={section} />

      {/* Stats Hero */}
      <div className={styles.statsHero}>
        {stats.map((s) => (
          <div key={s.label} className={styles.statBlock}>
            <div className={styles.statValue}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>
      <div className={styles.statsTagline}>
        I organized {eventsCount} AI meetups for 500+ youth across Singapore
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          margin: '16px 0',
          background:
            'linear-gradient(90deg, rgba(0,255,0,0.45), rgba(0,255,0,0.05))',
        }}
      />

      {/* Grid */}
      <div className={styles.grid}>
        {items.map((ev, i) => (
          <MeetupGridCard
            key={ev.num}
            event={ev}
            index={i}
            onClick={() => setSelectedIdx(i)}
          />
        ))}
      </div>

      <FooterMeta section={section} />
      <MeetupDetail
        event={selectedEvent}
        onClose={() => setSelectedIdx(null)}
      />
    </div>
  );
}
