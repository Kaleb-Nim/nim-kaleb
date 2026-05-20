'use client';

import type { Section } from '@/app/lib/sections';
import { HACK_ITEMS } from '@/app/lib/hackathons';
import PageHeader, { FooterMeta } from './PageHeader';
import HackathonRow from './HackathonRow';
import styles from './HackathonsPage.module.css';

export default function HackathonsPage({ section }: { section: Section }) {
  return (
    <div>
      <PageHeader section={section} />
      <div className={styles.grid}>
        {HACK_ITEMS.map((project) => (
          <HackathonRow key={project.slug} project={project} />
        ))}
      </div>
      <FooterMeta section={section} />
    </div>
  );
}
