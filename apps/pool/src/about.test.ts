import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { ABOUT, NAMED_SOURCES } from './about.ts';
import { CHEMISTRY_CHART } from './chemistry.ts';
import {
  CLOSING_GUIDE,
  OPENING_GUIDE,
  PUMP_RUN_GUIDE,
  SALT_VS_CHLORINE_GUIDE,
  SHOCK_GUIDE,
  type GuideSource,
} from './guide.ts';
import { METHOD_SECTIONS } from './methodology.ts';
import { CONTACT_EMAIL } from './privacy.ts';
import { pageKindOf } from './seo/json-ld.ts';

const pages = readdirSync(fileURLToPath(new URL('pages/', import.meta.url)));
const layout = readFileSync(
  fileURLToPath(new URL('components/Layout.astro', import.meta.url)),
  'utf8',
);
const text = [ABOUT.lead, ...ABOUT.sections.flatMap(({ paragraphs }) => paragraphs)].join('\n');
const cited = [
  ...METHOD_SECTIONS.flatMap(({ sources }) => sources.map(({ name }) => name)),
  ...[
    OPENING_GUIDE,
    CLOSING_GUIDE,
    CHEMISTRY_CHART,
    PUMP_RUN_GUIDE,
    SALT_VS_CHLORINE_GUIDE,
    SHOCK_GUIDE,
  ].flatMap(({ sources }) => Object.values<GuideSource>(sources).map(({ name }) => name)),
];

describe('the about page', () => {
  it('lives at /about as an article, linked from the footer of every page', () => {
    expect(pages).toContain('about.astro');
    expect(pageKindOf('/about')).toBe('article');
    expect(/<footer[\s\S]*href="\/about"[\s\S]*<\/footer>/.test(layout)).toBe(true);
  });

  it('is titled for the site, with a description search engines can show whole', () => {
    expect(ABOUT.title).toBe('About | Pool Figures');
    expect(ABOUT.description.length).toBeGreaterThan(50);
    expect(ABOUT.description.length).toBeLessThanOrEqual(160);
  });

  it('gives each section a unique id and at least one paragraph', () => {
    const ids = ABOUT.sections.map(({ id }) => id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const { paragraphs } of ABOUT.sections) expect(paragraphs.length).toBeGreaterThan(0);
  });

  it('links the methodology and the privacy page', () => {
    const links = ABOUT.sections.flatMap(({ link }) => (link === undefined ? [] : [link.href]));
    expect(links).toEqual(expect.arrayContaining(['/methodology', '/privacy']));
    for (const href of links) expect(pages).toContain(`${href.slice(1)}.astro`);
  });

  it('says what the guides cover', () => {
    expect(text).toContain('closing it for winter');
    expect(text).toContain('water chemistry chart');
    expect(text).toContain('how long to run the pump');
    expect(text).toContain('a salt water pool with a chlorine one');
    expect(text).toContain('how to shock the pool');
  });

  it('gives the address readers write to', () => {
    expect(text).toContain(CONTACT_EMAIL);
  });

  // The page claims only the sources the site cites: each one it names is cited somewhere, and
  // every cited source is one of them.
  it('names exactly the kinds of source the methodology and the guides cite', () => {
    for (const name of NAMED_SOURCES) {
      expect(text, name).toContain(name);
      expect(
        cited.some((source) => source.includes(name)),
        name,
      ).toBe(true);
    }
    for (const source of cited) {
      expect(
        NAMED_SOURCES.some((name) => source.includes(name)),
        source,
      ).toBe(true);
    }
  });

  it('says the figures are estimates, that there are no accounts and that no data is sold', () => {
    expect(text).toContain('estimates');
    expect(text).toContain('no accounts');
    expect(text).toContain('We do not sell');
  });
});
