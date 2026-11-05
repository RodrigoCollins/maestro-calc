import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { CHEMISTRY_CHART } from './chemistry.ts';
import { CHLORINE } from './doses.ts';
import { CLOSING_GUIDE, GUIDES, OPENING_GUIDE, type GuideSource } from './guide.ts';
import { VOLUME_TEXTS } from './volume/texts.ts';

const pages = readdirSync(fileURLToPath(new URL('pages/', import.meta.url)))
  .filter((name) => name.endsWith('.astro'))
  .map((name) => `/${name.replace(/\.astro$/, '').replace(/^index$/, '')}`);
const layout = readFileSync(
  fileURLToPath(new URL('components/Layout.astro', import.meta.url)),
  'utf8',
);
const footer = /<footer[\s\S]*<\/footer>/.exec(layout)?.[0] ?? '';

const textOf = (guide: typeof OPENING_GUIDE | typeof CLOSING_GUIDE): string =>
  guide.steps.map(({ text }) => text).join(' ');

describe.each([
  ['spring opening', OPENING_GUIDE],
  ['winter closing', CLOSING_GUIDE],
] as const)('the %s guide', (_name, guide) => {
  it('lives at its own page, with a description search engines can show whole', () => {
    expect(pages).toContain(guide.path);
    expect(guide.description.length).toBeGreaterThan(50);
    expect(guide.description.length).toBeLessThanOrEqual(160);
  });

  it('numbers its steps from one, each with a title and a text', () => {
    expect(guide.steps.length).toBeGreaterThan(4);
    for (const { title, text } of guide.steps) {
      expect(title.length).toBeGreaterThan(0);
      expect(text.length).toBeGreaterThan(0);
    }
  });

  it('sends each dose to a calculator page that exists', () => {
    const links = guide.steps.flatMap(({ link }) => (link === undefined ? [] : [link.href]));
    expect(links.length).toBeGreaterThan(0);
    for (const href of links) expect(pages, href).toContain(href);
  });

  it('cites every source it names on https, and names every source it cites', () => {
    const cited = new Set(guide.steps.flatMap(({ sources }) => sources ?? []));
    expect([...cited].sort()).toEqual(Object.keys(guide.sources).sort());
    for (const { url } of Object.values<GuideSource>(guide.sources))
      expect(url.startsWith('https://')).toBe(true);
  });
});

describe('the guide figures', () => {
  // the figures come from the sources as published; a changed one must be checked against them again
  it('gives the opening water targets exactly as CDC and Hayward publish them', () => {
    const text = textOf(OPENING_GUIDE);
    expect(text).toContain('at least 1 ppm');
    expect(text).toContain('at least 2 ppm');
    expect(text).toContain('pH 7.0 to 7.8');
    expect(text).toContain('7.2 to 7.8');
    expect(text).toContain('1 to 3 ppm');
  });

  it('gives the closing figures exactly as Hayward’s closing guide publishes them', () => {
    const text = textOf(CLOSING_GUIDE);
    expect(text).toContain('pH to 7.2 to 7.8');
    expect(text).toContain('24 to 48 hours');
    expect(text).toContain('below the skimmer');
    expect(text).toContain('in half');
    expect(text).toContain('1.0 to 3.0 ppm');
  });

  it('sizes the closing doses with the volume and chlorine calculators, and points to the chart', () => {
    const links = CLOSING_GUIDE.steps.flatMap(({ link }) =>
      link === undefined ? [] : [link.href],
    );
    expect(links).toEqual(
      expect.arrayContaining([VOLUME_TEXTS.path, CHLORINE.path, CHEMISTRY_CHART.path]),
    );
  });
});

describe('the guides', () => {
  it('lists every guide once, each with a short card', () => {
    expect(GUIDES.map(({ path }) => path)).toEqual([
      OPENING_GUIDE.path,
      CLOSING_GUIDE.path,
      CHEMISTRY_CHART.path,
    ]);
    for (const { card } of GUIDES) {
      expect(card.title.length).toBeGreaterThan(0);
      expect(card.title.length).toBeLessThanOrEqual(30);
      expect(card.summary.length).toBeLessThanOrEqual(90);
    }
  });

  it('links every guide from the footer of every page', () => {
    for (const { path } of GUIDES) expect(footer, path).toContain(`href="${path}"`);
  });
});
