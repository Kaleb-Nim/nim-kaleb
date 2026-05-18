'use client';

import type { Section } from '@/app/lib/sections';
import PageHeader, { FooterMeta } from './PageHeader';

export default function StubSectionPage({ section }: { section: Section }) {
  return (
    <div className="kni-page">
      <PageHeader section={section} />
      <div style={{
        color: 'rgba(0,255,0,0.78)',
        fontSize: 'clamp(0.82rem, 2vw, 0.9rem)',
        lineHeight: 1.7,
        textShadow: '0 0 4px rgba(0,255,0,0.3), 0 0 8px rgba(0,255,0,0.15)',
        padding: '12px 0',
      }}>
        {'> '}this section is being finalised — check back soon.
      </div>
      <div style={{
        color: 'rgba(0,255,0,0.55)',
        fontSize: '0.78rem',
        textShadow: 'none',
        marginTop: 4,
      }}>
        {'  '}in the meantime, ask the voice clone about{' '}
        <span style={{ color: '#FFD700', textShadow: '0 0 4px rgba(255,215,0,0.4)' }}>{section.path}</span>
        {' '}or tap{' '}
        <a href="#/" style={{ color: '#FFD700', textShadow: '0 0 4px rgba(255,215,0,0.4)', textDecoration: 'underline' }}>~/kaleb</a>
        {' '}to head home.
      </div>
      <FooterMeta section={section} />
    </div>
  );
}
