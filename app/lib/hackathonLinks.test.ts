import { describe, expect, test } from 'bun:test';
import {
  classifyHackathonLinks,
  hackathonLinkCount,
} from './hackathonLinks';

const make = (project_url: string, extra_links: string[] | null = null) => ({
  project_url,
  extra_links,
});

describe('classifyHackathonLinks', () => {
  test('1. devpost-only single URL (Foodr)', () => {
    const out = classifyHackathonLinks(make('https://devpost.com/software/foodr-ihad3c'));
    expect(out).toEqual([
      { label: 'DEVPOST', href: 'https://devpost.com/software/foodr-ihad3c' },
    ]);
    expect(hackathonLinkCount(make('https://devpost.com/software/foodr-ihad3c'))).toBe(1);
  });

  test('2. devpost + github (ARcademy)', () => {
    const p = make('https://devpost.com/software/arcademy-at32jn', [
      'https://github.com/UltraRaptorYT/ARcademy',
    ]);
    const out = classifyHackathonLinks(p);
    expect(out.map((l) => l.label)).toEqual(['DEVPOST', 'GITHUB']);
    expect(out[1].href).toBe('https://github.com/UltraRaptorYT/ARcademy');
    expect(hackathonLinkCount(p)).toBe(2);
  });

  test('3. devpost + live-demo (A Brilliant Cobra Duel — vercel.app)', () => {
    const p = make('https://devpost.com/software/a-brilliant-cobra-duel', [
      'https://a-brilliant-cobra-duel.vercel.app/',
    ]);
    expect(classifyHackathonLinks(p).map((l) => l.label)).toEqual(['DEVPOST', 'LIVE DEMO']);
  });

  test('4. devpost + devpost ?ref_content dedupes to single DEVPOST (sofri-025)', () => {
    const p = make('https://devpost.com/software/sofri-025', [
      'https://devpost.com/software/sofri-025?ref_content=my-projects-tab&ref_feature=my_projects',
    ]);
    const out = classifyHackathonLinks(p);
    expect(out.length).toBe(1);
    expect(out[0].label).toBe('DEVPOST');
    expect(hackathonLinkCount(p)).toBe(1);
  });

  test('5. devpost + onrender = LIVE DEMO (DR GO)', () => {
    const p = make('https://devpost.com/software/dr-go-61fybu', [
      'https://drgo.onrender.com/',
    ]);
    expect(classifyHackathonLinks(p).map((l) => l.label)).toEqual(['DEVPOST', 'LIVE DEMO']);
  });

  test('6. extra_links null treated as empty', () => {
    expect(hackathonLinkCount(make('https://devpost.com/x', null))).toBe(1);
  });

  test('7. extra_links empty array', () => {
    expect(hackathonLinkCount(make('https://devpost.com/x', []))).toBe(1);
  });

  test('8. empty project_url + null extra_links → zero links', () => {
    expect(classifyHackathonLinks(make('', null))).toEqual([]);
    expect(hackathonLinkCount(make('', null))).toBe(0);
  });

  test('9. malformed URL is silently skipped', () => {
    const p = make('https://devpost.com/x', ['not-a-url']);
    const out = classifyHackathonLinks(p);
    expect(out.length).toBe(1);
    expect(out[0].label).toBe('DEVPOST');
  });

  test('10. trailing slash dedupe', () => {
    const p = make('https://devpost.com/software/x', ['https://devpost.com/software/x/']);
    expect(classifyHackathonLinks(p).length).toBe(1);
  });

  test('11. case-insensitive hostname classification', () => {
    const p = make('https://devpost.com/x', ['https://GitHub.COM/foo/bar']);
    const labels = classifyHackathonLinks(p).map((l) => l.label);
    expect(labels).toContain('GITHUB');
  });

  test('12. ordering: DEVPOST → GITHUB → LINKEDIN → LIVE DEMO regardless of input order', () => {
    const p = make('https://devpost.com/x', [
      'https://example.com/live',
      'https://github.com/foo/bar',
      'https://linkedin.com/in/x',
    ]);
    expect(classifyHackathonLinks(p).map((l) => l.label)).toEqual([
      'DEVPOST', 'GITHUB', 'LINKEDIN', 'LIVE DEMO',
    ]);
  });
});
