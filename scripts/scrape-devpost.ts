#!/usr/bin/env bun
// @ts-nocheck — Bun globals (Bun.spawn) used; @types/bun not installed in this project.
// Scrape devpost.com/kaleb-nim → structured JSON of hackathon projects.
// Writes .planning/research/hackathons/hackathons.json and downloads thumbnails
// to public/hackathons/<slug>.<ext>.

import { mkdir, writeFile } from 'node:fs/promises';
import { join, extname } from 'node:path';

const PROFILE = 'https://devpost.com/kaleb-nim';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const ROOT = process.cwd();
const RESEARCH_DIR = join(ROOT, '.planning/research/hackathons');
const IMG_DIR = join(ROOT, 'public/hackathons');

type TeamMember = { name: string; devpost_url: string };
type Project = {
  slug: string;
  project_url: string;
  title: string;
  tagline: string;
  thumbnail_url: string;
  thumbnail_local: string | null;
  event_name: string | null;
  event_url: string | null;
  organizer: string | null; // derived: usually the hackathon host (best-effort from event name)
  prizes: string[];
  team: TeamMember[];
  built_with: string[];
  description_md: string;
  gallery: string[];
  is_winner: boolean;
};

async function fetchText(url: string): Promise<string> {
  // Devpost gates non-browser UAs through AWS WAF (returns 202 challenge page on `fetch()`).
  // Curl with HTTP/2 and gzip support passes the WAF, so shell out to it.
  const proc = Bun.spawn(['curl', '-sL', '--compressed', '-A', UA, url], {
    stdout: 'pipe',
    stderr: 'pipe',
  });
  const text = await new Response(proc.stdout).text();
  const code = await proc.exited;
  if (code !== 0) throw new Error(`curl exit ${code} ${url}`);
  if (!text || text.length < 500) throw new Error(`empty response ${url}`);
  return text;
}

function decode(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function stripTags(s: string): string {
  return decode(s.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
}

function match1(html: string, re: RegExp): string | null {
  const m = html.match(re);
  return m ? m[1] : null;
}

function matchAll(html: string, re: RegExp): string[] {
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) out.push(m[1]);
  return out;
}

// ── Profile page ───────────────────────────────────────────────────────────
function extractProjectUrls(profileHtml: string): string[] {
  const re = /<a class="block-wrapper-link fade link-to-software" href="(https:\/\/devpost\.com\/software\/[^"]+)"/g;
  const out = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(profileHtml)) !== null) out.add(m[1]);
  return [...out];
}

// ── Project page extractors ────────────────────────────────────────────────
function extractTitle(h: string): string {
  return stripTags(match1(h, /<h1 id="app-title">([\s\S]*?)<\/h1>/) ?? '');
}

function extractTagline(h: string): string {
  // <p class="large"> right after #app-title
  const m = h.match(/<h1 id="app-title">[\s\S]*?<p class="large">([\s\S]*?)<\/p>/);
  return m ? stripTags(m[1]) : '';
}

function extractThumbnail(h: string): string {
  return match1(h, /<meta property="og:image" content="([^"]+)"/) ?? '';
}

function extractEvent(h: string): { name: string | null; url: string | null } {
  // Submitted to → first <li> in software-list-with-thumbnail
  const block = h.match(/<div id="submissions"[\s\S]*?<ul class="software-list-with-thumbnail">([\s\S]*?)<\/ul>/);
  if (!block) return { name: null, url: null };
  const inner = block[1];
  const link = inner.match(/<div class="software-list-content">\s*<p>\s*<a href="([^"]+)">([\s\S]*?)<\/a>/);
  if (!link) return { name: null, url: null };
  return { name: stripTags(link[2]), url: link[1] };
}

function extractPrizes(h: string): string[] {
  // Look inside submissions for "winner label" entries.
  const block = h.match(/<div id="submissions"[\s\S]*?<\/div>\s*<\/div>/);
  const scope = block ? block[0] : h;
  const re = /<span class="winner label[^"]*">\s*Winner\s*<\/span>([\s\S]*?)<\/li>/g;
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(scope)) !== null) {
    const txt = stripTags(m[1]);
    if (txt) out.push(`Winner — ${txt}`);
    else out.push('Winner');
  }
  return out;
}

function extractTeam(h: string): TeamMember[] {
  const sec = h.match(/<section id="app-team">([\s\S]*?)<\/section>/);
  if (!sec) return [];
  const re = /<a class="user-profile-link" href="(https:\/\/devpost\.com\/[^"]+)">([^<]+)<\/a>\s*<span class="follow-button-wrapper"/g;
  const out: TeamMember[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(sec[1])) !== null) {
    out.push({ devpost_url: m[1], name: stripTags(m[2]) });
  }
  return out;
}

function extractBuiltWith(h: string): string[] {
  const sec = h.match(/<div id="built-with"[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/);
  if (!sec) return [];
  return matchAll(sec[1], /<span class="cp-tag[^"]*">([\s\S]*?)<\/span>/g).map(stripTags).filter(Boolean);
}

function extractGallery(h: string): string[] {
  const sec = h.match(/<div id="gallery">([\s\S]*?)<\/article>/);
  if (!sec) return [];
  // capture original-size photo links (data-lightbox anchors)
  const urls = matchAll(sec[1], /<a data-lightbox="[^"]*"[^>]*href="([^"]+)"/g);
  return urls;
}

function extractDescription(h: string): string {
  // Description body is the <div> containing the <h2> sections between gallery and built-with.
  // Simpler: take everything between </ul> after gallery close and <div id="built-with">.
  const m = h.match(/<\/div>\s*<\/div>\s*<div>\s*<h2>([\s\S]*?)<div id="built-with"/);
  if (!m) {
    // Fallback: grab from first <h2> after id="app-details" up to built-with.
    const m2 = h.match(/<article id="app-details"[\s\S]*?(<h2>[\s\S]*?)<div id="built-with"/);
    if (!m2) return '';
    return htmlToMarkdown('<h2>' + m2[1]);
  }
  return htmlToMarkdown('<h2>' + m[1]);
}

function htmlToMarkdown(s: string): string {
  // Very small HTML → markdown converter sufficient for devpost description bodies.
  let out = s;
  out = out.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/g, (_m, t) => `\n\n## ${stripTags(t)}\n\n`);
  out = out.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/g, (_m, t) => `\n\n### ${stripTags(t)}\n\n`);
  out = out.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/g, (_m, t) => `**${stripTags(t)}**`);
  out = out.replace(/<b[^>]*>([\s\S]*?)<\/b>/g, (_m, t) => `**${stripTags(t)}**`);
  out = out.replace(/<em[^>]*>([\s\S]*?)<\/em>/g, (_m, t) => `*${stripTags(t)}*`);
  out = out.replace(/<i[^>]*>([\s\S]*?)<\/i>/g, (_m, t) => `*${stripTags(t)}*`);
  out = out.replace(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g, (_m, href, t) => `[${stripTags(t)}](${href})`);
  out = out.replace(/<li[^>]*>([\s\S]*?)<\/li>/g, (_m, t) => `- ${stripTags(t)}\n`);
  out = out.replace(/<\/(ul|ol)>/g, '\n');
  out = out.replace(/<(ul|ol)[^>]*>/g, '');
  out = out.replace(/<p[^>]*>([\s\S]*?)<\/p>/g, (_m, t) => `\n${stripTags(t)}\n`);
  out = out.replace(/<br\s*\/?>/g, '\n');
  out = out.replace(/<[^>]+>/g, '');
  out = decode(out);
  out = out.replace(/\n{3,}/g, '\n\n').trim();
  return out;
}

// ── Image download ─────────────────────────────────────────────────────────
async function downloadImage(url: string, slug: string): Promise<string | null> {
  try {
    const proc = Bun.spawn(['curl', '-sL', '--compressed', '-A', UA, url], { stdout: 'pipe', stderr: 'pipe' });
    const buf = Buffer.from(await new Response(proc.stdout).arrayBuffer());
    const code = await proc.exited;
    if (code !== 0 || buf.length < 100) return null;
    const urlPath = new URL(url).pathname;
    const ext = (extname(urlPath) || '.png').toLowerCase();
    const filename = `${slug}${ext}`;
    const filePath = join(IMG_DIR, filename);
    await writeFile(filePath, buf);
    return `/hackathons/${filename}`;
  } catch (err) {
    console.error(`  ! image fail ${slug}: ${(err as Error).message}`);
    return null;
  }
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  await mkdir(RESEARCH_DIR, { recursive: true });
  await mkdir(IMG_DIR, { recursive: true });

  console.log(`Fetching profile: ${PROFILE}`);
  const profileHtml = await fetchText(PROFILE);
  const projectUrls = extractProjectUrls(profileHtml);
  console.log(`Found ${projectUrls.length} projects`);

  const projects: Project[] = [];
  for (const url of projectUrls) {
    const slug = url.split('/').pop()!;
    process.stdout.write(`  ▶ ${slug} ... `);
    try {
      const h = await fetchText(url);
      const title = extractTitle(h);
      const tagline = extractTagline(h);
      const thumbnail_url = extractThumbnail(h);
      const event = extractEvent(h);
      const prizes = extractPrizes(h);
      const team = extractTeam(h);
      const built_with = extractBuiltWith(h);
      const description_md = extractDescription(h);
      const gallery = extractGallery(h);
      const is_winner = prizes.length > 0;
      const thumbnail_local = thumbnail_url ? await downloadImage(thumbnail_url, slug) : null;

      projects.push({
        slug,
        project_url: url,
        title,
        tagline,
        thumbnail_url,
        thumbnail_local,
        event_name: event.name,
        event_url: event.url,
        organizer: event.name, // best-effort; devpost rarely separates host from event
        prizes,
        team,
        built_with,
        description_md,
        gallery,
        is_winner,
      });
      console.log('ok');
    } catch (err) {
      console.log(`FAIL ${(err as Error).message}`);
    }
    // small delay to be polite
    await new Promise((r) => setTimeout(r, 250));
  }

  const out = {
    source: PROFILE,
    scraped_at: new Date().toISOString(),
    count: projects.length,
    projects,
  };
  const outPath = join(RESEARCH_DIR, 'hackathons.json');
  await writeFile(outPath, JSON.stringify(out, null, 2));
  console.log(`\nWrote ${outPath} (${projects.length} projects)`);
  console.log(`Thumbnails → ${IMG_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
