'use client';

import type { HackathonItem } from '@/app/lib/hackathons';
import {
  classifyHackathonLinks,
  hackathonLinkCount,
} from '@/app/lib/hackathonLinks';
import styles from './HackathonsPage.module.css';

interface Props {
  project: HackathonItem;
}

export type HackathonTagTone = 'green' | 'gold';

export interface HackathonTag {
  label: string;
  tone: HackathonTagTone;
}

/**
 * Derive a status tag from a hackathon item.
 *
 * - Winners (`is_winner: true`) → gold `WON · <PRIZE-SHORT>` (or bare `WON`
 *   when no prize text is present).
 * - Non-winners → green `BUILT`.
 *
 * Reserved values 'WIP' and 'FINALIST' belong to the green-tone label space
 * but the JSON does not currently express them. Future enrichment may set
 * them; today we default to 'BUILT'.
 */
export function deriveHackathonTag(
  item: Pick<HackathonItem, 'is_winner' | 'prizes'>,
): HackathonTag {
  if (!item.is_winner) {
    return { label: 'BUILT', tone: 'green' };
  }
  const first = item.prizes[0];
  if (!first) {
    return { label: 'WON', tone: 'gold' };
  }
  return { label: `WON · ${shortenPrize(first)}`, tone: 'gold' };
}

/**
 * Compress a verbose prize string like "Winner — Best Pre-University Hack"
 * into a short uppercase tag suffix like "BEST PRE-U".
 *
 * Rules:
 * - Strip a leading "Winner — " / "Winner - " / "Winner: " prefix if present.
 * - Convert "Pre-University" → "Pre-U" and drop trailing " Hack".
 * - Collapse whitespace, uppercase, cap at 18 chars (no ellipsis — keeps the
 *   monospace tag tidy).
 */
function shortenPrize(prize: string): string {
  let s = prize.replace(/^Winner\s*[—\-:]\s*/i, '').trim();
  s = s.replace(/\bPre-University\b/gi, 'Pre-U');
  s = s.replace(/\s+Hack$/i, '');
  s = s.replace(/\s+/g, ' ').toUpperCase();
  if (s.length > 18) s = s.slice(0, 18).trimEnd();
  return s;
}

export default function HackathonRow({ project }: Props) {
  const linkCount = hackathonLinkCount(project);
  const tag = deriveHackathonTag(project);

  // 0 links → static (non-interactive) card
  if (linkCount === 0) {
    return (
      <div className={`${styles.card} ${styles.cardStatic}`}>
        <CardBody project={project} tag={tag} chip={null} />
      </div>
    );
  }

  // 1 link → direct outbound anchor
  if (linkCount === 1) {
    const only = classifyHackathonLinks(project)[0];
    return (
      <a
        className={styles.card}
        href={only.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${project.title} — open ${only.label.toLowerCase()} in new tab`}
      >
        <CardBody project={project} tag={tag} chip={`[ ${only.label} ↗ ]`} />
      </a>
    );
  }

  // 2+ links → chooser sub-route
  return (
    <a
      className={styles.card}
      href={`#/hackathons/${project.slug}`}
      aria-label={`${project.title} — ${linkCount} links, open chooser`}
    >
      <CardBody project={project} tag={tag} chip={`[ LINKS (${linkCount}) ↗ ]`} />
    </a>
  );
}

function CardBody({
  project,
  tag,
  chip,
}: {
  project: HackathonItem;
  tag: HackathonTag;
  chip: string | null;
}) {
  const tagClass = `${styles.tag} ${tag.tone === 'gold' ? styles.tagGold : styles.tagGreen}`;
  return (
    <>
      <div className={styles.topRow}>
        <span className={styles.date}>{project.date}</span>
        <span className={tagClass}>[{tag.label}]</span>
      </div>
      <div className={styles.title}>{project.title}</div>
      {project.tagline && <div className={styles.tagline}>{project.tagline}</div>}
      {project.event_name && <div className={styles.event}>{project.event_name}</div>}
      {chip && <div className={styles.linkChip}>{chip}</div>}
    </>
  );
}
