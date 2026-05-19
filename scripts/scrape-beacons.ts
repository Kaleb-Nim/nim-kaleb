#!/usr/bin/env bun
// @ts-nocheck — playwright + Bun globals; @types/bun not installed.
// Scrape beacons.ai/kaleb_nim project cards via headless Chromium (Cloudflare gates curl).
//
// Extracts each project: aria-label (title), href (URL), background image, description.
// Then merges into .planning/research/hackathons/hackathons.json:
//   - matched by normalized title → adds extra_links/extra_images to existing project
//   - unmatched → appended as new project with source=beacons
// Thumbnails (when distinct from Devpost) downloaded to public/hackathons/.
//
// Re-runnable. Will overwrite the merged hackathons.json (preserves original Devpost entries).

import { chromium } from 'playwright';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';

const BEACONS_URL = 'https://beacons.ai/kaleb_nim';
const ROOT = process.cwd();
const RESEARCH_DIR = join(ROOT, '.planning/research/hackathons');
const IMG_DIR = join(ROOT, 'public/hackathons');
const JSON_PATH = join(RESEARCH_DIR, 'hackathons.json');

type BeaconsCard = {
  title: string;
  href: string;
  image_url: string | null;
  description: string | null;
};

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/\(.*?\)/g, '')         // strip parenthetical
    .replace(/[^a-z0-9 ]+/g, ' ')    // punctuation → space
    .replace(/\b(the|a|an)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Heuristic match: normalized substring either way, or significant token overlap, or
// nospace equality ("DrGo" ≡ "DR GO").
function titlesMatch(a: string, b: string): boolean {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (na.replace(/ /g, '') === nb.replace(/ /g, '')) return true;
  if (na.includes(nb) || nb.includes(na)) return true;
  const ta = new Set(na.split(' ').filter((t) => t.length >= 4));
  const tb = new Set(nb.split(' ').filter((t) => t.length >= 4));
  let overlap = 0;
  for (const t of ta) if (tb.has(t)) overlap++;
  return overlap >= 2;
}

// Match by URL: if beacons href is a devpost.com/software/<slug> URL, the slug must
// match an existing project's slug (deterministic, beats fuzzy title matching).
function urlMatch(href: string, projectUrl: string): boolean {
  const m1 = href.match(/devpost\.com\/software\/([a-z0-9-]+)/i);
  const m2 = projectUrl.match(/devpost\.com\/software\/([a-z0-9-]+)/i);
  return !!(m1 && m2 && m1[1] === m2[1]);
}

async function fetchBeaconsCards(): Promise<BeaconsCard[]> {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
    viewport: { width: 1280, height: 900 },
  });
  const page = await ctx.newPage();
  console.log('navigating beacons...');
  await page.goto(BEACONS_URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(6000);
  // scroll to force lazy images
  for (let y = 0; y < 6000; y += 500) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(150);
  }
  await page.waitForTimeout(1500);

  const cards: BeaconsCard[] = await page.evaluate(() => {
    const SKIP = new Set(['Resume', 'home', 'profile page', 'launch share profile dialog']);
    const out: BeaconsCard[] = [];
    const anchors = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[aria-label]'));
    for (const a of anchors) {
      const title = a.getAttribute('aria-label')?.trim() ?? '';
      const href = a.href ?? '';
      if (!title || !href) continue;
      if (SKIP.has(title)) continue;
      if (title.toLowerCase().includes('linkedin') || title.toLowerCase().includes('github.com/') || title.toLowerCase().includes('instagram')) continue;
      // skip beacons internal nav / signup / footer
      if (href.includes('beacons.ai/signup') || href.includes('account.beacons.ai')) continue;
      // look for background-image on this anchor or ancestor up to 3 levels
      let img: string | null = null;
      let el: HTMLElement | null = a;
      for (let i = 0; i < 4 && el; i++) {
        const bg = getComputedStyle(el).backgroundImage;
        const m = bg && bg.match(/url\("?(https?:[^")]+)"?\)/);
        if (m) {
          img = m[1];
          break;
        }
        // also check nested <img> or <span style="background-image:...">
        const imgEl = el.querySelector('img');
        if (imgEl?.src) {
          img = imgEl.src;
          break;
        }
        const styled = el.querySelector<HTMLElement>('[style*="background-image"]');
        if (styled) {
          const m2 = styled.style.backgroundImage.match(/url\("?(https?:[^")]+)"?\)/);
          if (m2) {
            img = m2[1];
            break;
          }
        }
        el = el.parentElement;
      }
      // description: nearest sibling/descendant with class containing 'description' or aria-label about description
      let desc: string | null = null;
      const descEl = a.querySelector('[aria-label="text description container"]');
      if (descEl) desc = (descEl as HTMLElement).innerText.trim();
      out.push({ title, href, image_url: img, description: desc });
    }
    return out;
  });

  await browser.close();
  return cards;
}

async function downloadImage(url: string, slug: string): Promise<string | null> {
  try {
    const proc = Bun.spawn(['curl', '-sL', '--compressed', url], { stdout: 'pipe', stderr: 'pipe' });
    const buf = Buffer.from(await new Response(proc.stdout).arrayBuffer());
    if (buf.length < 100) return null;
    const urlPath = new URL(url).pathname;
    let ext = (extname(urlPath) || '').toLowerCase();
    if (!ext || ext.length > 5) ext = '.jpg';
    const filename = `${slug}${ext}`;
    await writeFile(join(IMG_DIR, filename), buf);
    return `/hackathons/${filename}`;
  } catch (err) {
    console.error(`  ! image fail ${slug}: ${(err as Error).message}`);
    return null;
  }
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

async function main() {
  await mkdir(IMG_DIR, { recursive: true });
  const json = JSON.parse(await readFile(JSON_PATH, 'utf-8'));
  const projects = json.projects as Array<Record<string, unknown>>;

  const cards = await fetchBeaconsCards();
  console.log(`Beacons cards: ${cards.length}`);

  let mergedCount = 0;
  let newCount = 0;
  const beaconsAdded: BeaconsCard[] = [];
  const newEntries: Array<Record<string, unknown>> = [];

  for (const card of cards) {
    // 1) deterministic URL match (best signal), 2) title fuzzy match
    const match =
      projects.find((p) => urlMatch(card.href, String(p.project_url))) ??
      projects.find((p) => titlesMatch(card.title, String(p.title)));
    if (match) {
      const extraLinks = (match.extra_links as string[] | undefined) ?? [];
      const extraImages = (match.extra_images as string[] | undefined) ?? [];
      let changed = false;
      if (card.href && card.href !== match.project_url && !extraLinks.includes(card.href)) {
        extraLinks.push(card.href);
        changed = true;
      }
      if (card.image_url && card.image_url !== match.thumbnail_url && !extraImages.includes(card.image_url)) {
        extraImages.push(card.image_url);
        changed = true;
      }
      if (changed) {
        match.extra_links = extraLinks;
        match.extra_images = extraImages;
        match.sources = Array.from(new Set([...(match.sources as string[] ?? ['devpost']), 'beacons']));
        mergedCount++;
        console.log(`  ⤴  merge → ${match.slug} (+${card.href ? 1 : 0} link, +${card.image_url ? 1 : 0} img)`);
      }
    } else {
      const slug = `beacons-${slugify(card.title)}`;
      let localImg: string | null = null;
      if (card.image_url) {
        localImg = await downloadImage(card.image_url, slug);
      }
      const entry = {
        slug,
        project_url: card.href,
        title: card.title,
        tagline: '',
        thumbnail_url: card.image_url ?? '',
        thumbnail_local: localImg,
        date: null,
        date_iso: null,
        event_name: null,
        event_url: null,
        organizer: null,
        prizes: [],
        team: [],
        built_with: [],
        description_md: card.description ?? '',
        gallery: [],
        is_winner: false,
        sources: ['beacons'],
        extra_links: [],
        extra_images: [],
      };
      newEntries.push(entry);
      beaconsAdded.push(card);
      newCount++;
      console.log(`  ＋  new → ${slug}`);
    }
  }

  for (const p of projects) {
    if (!('sources' in p)) p.sources = ['devpost'];
  }
  projects.push(...newEntries);

  json.beacons_source = BEACONS_URL;
  json.merged_at = new Date().toISOString();
  json.count = projects.length;

  await writeFile(JSON_PATH, JSON.stringify(json, null, 2));
  console.log(`\nMerged ${mergedCount} cards into existing Devpost entries`);
  console.log(`Added ${newCount} new entries from Beacons`);
  console.log(`Total projects: ${projects.length}`);
  console.log(`Wrote ${JSON_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
