'use client';

import type { Section } from '@/app/lib/sections';
import { HACK_ITEMS } from '@/app/lib/hackathons';
import PageHeader, { FooterMeta } from './PageHeader';
import HackathonRow from './HackathonRow';
import styles from './HackathonsPage.module.css';

export default function HackathonsPage({ section }: { section: Section }) {
  // Winners first, then by date descending (most recent first within each group).
  // Null date_iso sorts to the end of its group.
  const sortedItems = [...HACK_ITEMS].sort(
    (a, b) =>
      Number(b.is_winner) - Number(a.is_winner) ||
      (b.date_iso ?? '').localeCompare(a.date_iso ?? ''),
  );

  return (
    <div>
      <PageHeader section={section} />
      <div className={styles.grid}>
        {sortedItems.map((project) => (
          <HackathonRow key={project.slug} project={project} />
        ))}
      </div>
      <FooterMeta section={section} />
    </div>
  );
}
