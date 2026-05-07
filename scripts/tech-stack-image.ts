import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const OUT_DIR = resolve(process.cwd(), 'public/readme');

type Logo = { name: string; slug?: string; svg?: string; color?: string };

const drizzleSvg = `
<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <rect x="2"  y="9"  width="6" height="3" rx="1.2" transform="rotate(20 5 10.5)" fill="#C5F74F"/>
  <rect x="9"  y="9"  width="6" height="3" rx="1.2" transform="rotate(20 12 10.5)" fill="#C5F74F"/>
  <rect x="2"  y="15" width="6" height="3" rx="1.2" transform="rotate(20 5 16.5)" fill="#C5F74F"/>
  <rect x="9"  y="15" width="6" height="3" rx="1.2" transform="rotate(20 12 16.5)" fill="#C5F74F"/>
</svg>`;

const qwenSvg = `
<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#615CED">
  <circle cx="12" cy="12" r="10" fill="#615CED"/>
  <text x="12" y="15.5" font-family="Inter, sans-serif" font-size="8.5" font-weight="700" text-anchor="middle" fill="white">Q3</text>
</svg>`;

const groups: { title: string; items: Logo[] }[] = [
  {
    title: 'Frontend',
    items: [
      { name: 'Next.js 16', slug: 'nextdotjs', color: 'ffffff' },
      { name: 'React 19', slug: 'react', color: '61DAFB' },
      { name: 'TypeScript', slug: 'typescript', color: '3178C6' },
      { name: 'Tailwind 4', slug: 'tailwindcss', color: '06B6D4' },
    ],
  },
  {
    title: 'Edge / Server',
    items: [
      { name: 'Bun', slug: 'bun', color: 'FBF0DF' },
      { name: 'WebSocket', slug: 'socketdotio', color: 'ffffff' },
      { name: 'Nginx', slug: 'nginx', color: '009639' },
      { name: "Let's Encrypt", slug: 'letsencrypt', color: '003A70' },
    ],
  },
  {
    title: 'AI Pipeline · Alibaba DashScope',
    items: [
      { name: 'Qwen3-ASR', svg: qwenSvg },
      { name: 'qwen-plus LLM', svg: qwenSvg },
      { name: 'Qwen3-TTS-VC', svg: qwenSvg },
    ],
  },
  {
    title: 'Data',
    items: [
      { name: 'Neon Postgres', slug: 'neon', color: '00E599' },
      { name: 'Drizzle ORM', svg: drizzleSvg },
    ],
  },
  {
    title: 'Infrastructure',
    items: [
      { name: 'Vercel', slug: 'vercel', color: 'ffffff' },
      { name: 'Alibaba Cloud ECS', slug: 'alibabacloud', color: 'FF6A00' },
    ],
  },
  {
    title: 'Tooling',
    items: [
      { name: 'Playwright', slug: 'playwright', color: '2EAD33' },
      { name: 'ESLint', slug: 'eslint', color: '4B32C3' },
    ],
  },
];

function logoHtml(item: Logo): string {
  const inner = item.svg
    ? item.svg
    : `<img src="https://cdn.simpleicons.org/${item.slug}/${item.color ?? 'ffffff'}" alt="${item.name}" />`;
  return `
    <div class="logo">
      <div class="icon">${inner}</div>
      <div class="label">${item.name}</div>
    </div>`;
}

const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  :root {
    --bg: #010810;
    --panel: #0a1118;
    --green: #00FF00;
    --gold: #FFD700;
    --text: #E6F4EA;
    --muted: #6B7C8A;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: var(--bg); }
  body {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    color: var(--text);
    padding: 56px 64px;
    width: 1400px;
  }
  .header {
    display: flex; align-items: baseline; justify-content: space-between;
    border-bottom: 1px solid rgba(0, 255, 0, 0.25);
    padding-bottom: 18px; margin-bottom: 36px;
  }
  .title {
    font-family: 'Anonymous Pro', ui-monospace, monospace;
    font-size: 30px; font-weight: 700;
    color: var(--green);
    text-shadow: 0 0 8px rgba(0, 255, 0, 0.45), 0 0 16px rgba(0, 255, 0, 0.2);
    letter-spacing: 0.02em;
  }
  .subtitle {
    font-family: 'Anonymous Pro', ui-monospace, monospace;
    font-size: 14px; color: var(--gold); letter-spacing: 0.06em;
  }
  .group { margin-bottom: 28px; }
  .group-title {
    font-family: 'Anonymous Pro', ui-monospace, monospace;
    font-size: 13px; letter-spacing: 0.18em; text-transform: uppercase;
    color: var(--muted); margin-bottom: 14px;
  }
  .row {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
  }
  .logo {
    background: var(--panel);
    border: 1px solid rgba(0, 255, 0, 0.12);
    border-radius: 10px;
    padding: 18px 16px;
    display: flex; align-items: center; gap: 14px;
    min-height: 72px;
  }
  .icon { width: 36px; height: 36px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
  .icon img, .icon svg { width: 100%; height: 100%; object-fit: contain; }
  .label {
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 15px; font-weight: 500; color: var(--text);
  }
  .footer {
    margin-top: 24px; padding-top: 18px;
    border-top: 1px solid rgba(0, 255, 0, 0.15);
    font-family: 'Anonymous Pro', ui-monospace, monospace;
    font-size: 12px; color: var(--muted);
    display: flex; justify-content: space-between;
  }
</style>
</head>
<body>
  <div class="header">
    <div class="title">KEBAB NEURAL INTERFACE — TECH STACK</div>
    <div class="subtitle">nim-kaleb.vercel.app</div>
  </div>
  ${groups
    .map(
      (g) => `
    <div class="group">
      <div class="group-title">▸ ${g.title}</div>
      <div class="row">${g.items.map(logoHtml).join('')}</div>
    </div>`,
    )
    .join('')}
  <div class="footer">
    <span>voice · ai · realtime</span>
    <span>© Kaleb Nim</span>
  </div>
</body>
</html>`;

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1400, height: 1200 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  const body = page.locator('body');
  const outPath = resolve(OUT_DIR, 'tech-stack.png');
  await body.screenshot({ path: outPath, omitBackground: false });
  console.log(`[tech-stack] wrote ${outPath}`);

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
