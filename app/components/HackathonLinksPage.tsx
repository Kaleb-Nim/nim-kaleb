'use client';

import { useHashSubRoute } from '@/app/hooks/useHashRoute';
import { HACK_ITEMS } from '@/app/lib/hackathons';
import { classifyHackathonLinks } from '@/app/lib/hackathonLinks';
import NotFoundPage from './NotFoundPage';
import styles from './HackathonsPage.module.css';

function hostOf(href: string): string {
  try {
    const u = new URL(href);
    return `${u.host}${u.pathname.replace(/\/$/, '')}`;
  } catch {
    return href;
  }
}

export default function HackathonLinksPage() {
  const slug = useHashSubRoute();
  const project = HACK_ITEMS.find((p) => p.slug === slug);

  if (!project) {
    return <NotFoundPage />;
  }

  const links = classifyHackathonLinks(project);

  return (
    <div style={{ fontFamily: '"Anonymous Pro", monospace' }}>
      {/* Breadcrumb back-link */}
      <div style={{ marginBottom: 14 }}>
        <a
          href="#/hackathons"
          className={styles.chooserBack}
          aria-label="Back to hackathons list"
        >
          ← ~/kaleb / hackathons
        </a>
      </div>

      {/* Title */}
      <div
        style={{
          color: '#00FF00',
          fontSize: 'clamp(1.05rem, 3.6vw, 1.35rem)',
          fontWeight: 700,
          textShadow: '0 0 6px rgba(0,255,0,0.55), 0 0 12px rgba(0,255,0,0.25)',
          marginBottom: 4,
        }}
      >
        {project.title}
      </div>

      {/* Event line */}
      <div
        style={{
          color: 'rgba(0,255,0,0.6)',
          fontSize: '0.74rem',
          letterSpacing: '0.04em',
          marginBottom: 10,
        }}
      >
        {project.event_name ? `${project.event_name} · ${project.date}` : project.date}
      </div>

      {/* Prize block (gold) for winners */}
      {project.is_winner && project.prizes.length > 0 && (
        <div
          style={{
            color: '#FFD700',
            fontSize: '0.82rem',
            fontWeight: 700,
            textShadow: '0 0 4px rgba(255,215,0,0.45)',
            marginBottom: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {project.prizes.map((p) => (
            <div key={p}>{p}</div>
          ))}
        </div>
      )}

      {/* Tagline */}
      {project.tagline && (
        <div
          style={{
            color: 'rgba(0,255,0,0.78)',
            fontSize: '0.84rem',
            lineHeight: 1.55,
            marginBottom: 20,
            maxWidth: 620,
          }}
        >
          {project.tagline}
        </div>
      )}

      {/* Link chip list */}
      <div className={styles.chooserList}>
        {links.map((link) => (
          <a
            key={link.href}
            className={styles.chooserRow}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${link.label} for ${project.title} in new tab`}
          >
            <span className={styles.chooserRowLabel}>[ {link.label} ↗ ]</span>
            <span className={styles.chooserRowHost}>{hostOf(link.href)}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
