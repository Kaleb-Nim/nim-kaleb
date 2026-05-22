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

export interface HackathonWinnerTag {
  /** Full prize text(s), joined when multiple. Rendered after a "WON · " prefix. */
  prizeText: string;
}

/**
 * Derive a winner tag from a hackathon item.
 *
 * Design (post-checkpoint revision):
 * - Winners (`is_winner: true`) → gold tag containing the FULL prize text from
 *   `prizes[]` (joined with " · " when there are multiple). The truncated
 *   `<PRIZE-SHORT>` code is no longer used — the actual prize description is
 *   the primary content on the card.
 * - Non-winners → no tag (returns `null`).
 *
 * Caveat: non-Devpost CV wins (HackOmania, Batey, POLYFINTECH) are not in
 * `hackathons.json` and intentionally do not surface here. This grid only
 * shows Devpost-tracked wins.
 */
export function deriveHackathonTag(
  item: Pick<HackathonItem, 'is_winner' | 'prizes'>,
): HackathonWinnerTag | null {
  if (!item.is_winner) return null;
  const prizes = item.prizes.map((p) => cleanPrize(p)).filter(Boolean);
  if (prizes.length === 0) {
    return { prizeText: '' };
  }
  return { prizeText: prizes.join(' · ') };
}

/**
 * Normalize a verbose prize string for display next to the WON prefix.
 * Strips a leading "Winner — " / "Winner - " / "Winner: " prefix if present
 * and collapses whitespace. Preserves original casing (no uppercasing) so
 * full prize descriptions read naturally.
 */
function cleanPrize(prize: string): string {
  return prize.replace(/^Winner\s*[—\-:]\s*/i, '').replace(/\s+/g, ' ').trim();
}

export default function HackathonRow({ project }: Props) {
  const linkCount = hackathonLinkCount(project);
  const tag = deriveHackathonTag(project);
  const headline = project.event_name ?? project.title;

  // 0 links → static (non-interactive) card
  if (linkCount === 0) {
    return (
      <div className={`${styles.card} ${styles.cardStatic}`}>
        <CardBody project={project} tag={tag} />
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
        aria-label={`${headline} — open ${only.label.toLowerCase()} in new tab`}
      >
        <CardBody project={project} tag={tag} />
      </a>
    );
  }

  // 2+ links → chooser sub-route
  return (
    <a
      className={styles.card}
      href={`#/hackathons/${project.slug}`}
      aria-label={`${headline} — ${linkCount} links, open chooser`}
    >
      <CardBody project={project} tag={tag} />
    </a>
  );
}

function CardBody({
  project,
  tag,
}: {
  project: HackathonItem;
  tag: HackathonWinnerTag | null;
}) {
  const headline = project.event_name ?? project.title;
  const showProduct =
    project.event_name != null && project.title !== project.event_name;
  return (
    <>
      <div className={styles.topRow}>
        <span className={styles.date}>{project.date}</span>
        {tag && (
          <span className={`${styles.tag} ${styles.tagGold}`}>
            {tag.prizeText ? `[WON · ${tag.prizeText}]` : '[WON]'}
          </span>
        )}
      </div>
      <div className={styles.title}>{headline}</div>
      {showProduct && <div className={styles.product}>{project.title}</div>}
      {project.tagline && <div className={styles.tagline}>{project.tagline}</div>}
    </>
  );
}
