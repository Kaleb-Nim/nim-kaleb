'use client';

import { useState } from 'react';
import type { Section, MeetupItem } from '@/app/lib/sections';
import PageHeader, { FooterMeta } from './PageHeader';
import MeetupCard from './MeetupCard';
import MeetupLightbox, { type LightboxOpen } from './MeetupLightbox';

export default function MeetupsPage({ section }: { section: Section }) {
  const items = section.items as MeetupItem[];
  const [open, setOpen] = useState<LightboxOpen>(null);
  const openLightbox = (cardIdx: number, imgIdx: number) =>
    setOpen({ cardIdx, imgIdx });
  const closeLightbox = () => setOpen(null);

  return (
    <div>
      <PageHeader section={section} />
      {items.map((ev, i) => (
        <MeetupCard
          key={ev.num}
          event={ev}
          cardIndex={i}
          openLightbox={openLightbox}
        />
      ))}
      <FooterMeta section={section} />
      <MeetupLightbox items={items} open={open} onClose={closeLightbox} />
    </div>
  );
}
