// app/lib/hackathonLinks.ts — pure URL classifier for the Phase 15
// "smart routing" decision. Zero React / DOM dependencies; safe to import
// from both server and client modules. See `15-CONTEXT.md` Smart URL
// routing decisions block for the locked rules.

export type HackathonLinkLabel = 'DEVPOST' | 'GITHUB' | 'LINKEDIN' | 'LIVE DEMO';

export interface HackathonLink {
  label: HackathonLinkLabel;
  href: string;
}

interface ProjectLinkSubset {
  project_url: string;
  extra_links: string[] | null | undefined;
}

const LABEL_ORDER: HackathonLinkLabel[] = ['DEVPOST', 'GITHUB', 'LINKEDIN', 'LIVE DEMO'];

function classifyHost(hostname: string): HackathonLinkLabel {
  const h = hostname.toLowerCase();
  if (h.includes('devpost.com'))   return 'DEVPOST';
  if (h.includes('github.com'))    return 'GITHUB';
  if (h.includes('linkedin.com'))  return 'LINKEDIN';
  return 'LIVE DEMO';
}

function dedupeKey(href: string): string | null {
  try {
    const u = new URL(href);
    const path = u.pathname.replace(/\/+$/, ''); // strip trailing slash(es)
    return `${u.protocol}//${u.hostname.toLowerCase()}${path}`;
  } catch {
    return null;
  }
}

export function classifyHackathonLinks(project: ProjectLinkSubset): HackathonLink[] {
  const raw = [project.project_url, ...(project.extra_links ?? [])].filter(
    (u): u is string => typeof u === 'string' && u.length > 0
  );

  const seen = new Set<string>();
  const classified: HackathonLink[] = [];

  for (const href of raw) {
    const key = dedupeKey(href);
    if (key === null) continue;       // malformed URL — skip silently
    if (seen.has(key)) continue;       // already kept an earlier occurrence
    seen.add(key);

    let hostname: string;
    try {
      hostname = new URL(href).hostname;
    } catch {
      continue;
    }
    classified.push({ label: classifyHost(hostname), href });
  }

  // Stable sort by label order. JS Array.prototype.sort is stable in modern
  // engines (including Bun), so input-order is preserved within each label.
  return classified.sort(
    (a, b) => LABEL_ORDER.indexOf(a.label) - LABEL_ORDER.indexOf(b.label)
  );
}

export function hackathonLinkCount(project: ProjectLinkSubset): number {
  return classifyHackathonLinks(project).length;
}
