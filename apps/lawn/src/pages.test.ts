import { describe, expect, it } from 'vitest';
import { ABOUT } from './about.ts';
import { BYLINE_PAGES, bylinePageOf } from './bylines.ts';
import { CALCULATORS, calculatorAt, MAESTRO } from './calculators.ts';
import { bylineOf, checkedText, citedSources, EDITORIAL } from './editorial.ts';
import { FROST_PAGES } from './frost.ts';
import { frostCopyOf, FROST_TEXT } from './frost-copy.ts';
import { ALL_GUIDES, GUIDES, guideAt, guidesOf } from './guide.ts';
import { HOME, HOME_TOOLS, navOf } from './home.ts';
import { footerLinks } from './layout.ts';
import { llmsTxt } from './llms.ts';
import { METHOD_PAGE } from './methodology.ts';
import { CONTACT_EMAIL, PRIVACY } from './privacy.ts';
import { ROUTES } from './routes.ts';
import { ENGINES } from './view.ts';

/** Every title and description of the site, by address. */
const HEADS: readonly (readonly [string, string, string])[] = [
  ['/', HOME.title, HOME.description],
  ...CALCULATORS.map(({ path, title, description }) => [path, title, description] as const),
  ['/frost-dates', FROST_TEXT.index.title, FROST_TEXT.index.description],
  ...ALL_GUIDES.map(({ path, title, description }) => [path, title, description] as const),
  ['/methodology', METHOD_PAGE.title, METHOD_PAGE.description],
  ['/about', ABOUT.title, ABOUT.description],
  ['/editorial-policy', EDITORIAL.title, EDITORIAL.description],
  ['/privacy', PRIVACY.title, PRIVACY.description],
  ...FROST_PAGES.map((page) => {
    const { title, description } = frostCopyOf(page);
    return [page.path, title, description] as const;
  }),
];

describe('page heads', () => {
  it('has a head for every route', () => {
    expect(HEADS.map(([path]) => path).sort()).toEqual(ROUTES.map(({ path }) => path).sort());
  });

  it('keeps every title within 65 characters and every description within 50 to 160', () => {
    for (const [path, title, description] of HEADS) {
      expect(title.length, `${path} title`).toBeLessThanOrEqual(65);
      expect(description.length, `${path} description`).toBeGreaterThanOrEqual(50);
      expect(description.length, `${path} description`).toBeLessThanOrEqual(160);
      expect(title, path).toContain('Lawn Figures');
    }
  });

  it('gives every page its own title and description', () => {
    expect(new Set(HEADS.map(([, title]) => title)).size).toBe(HEADS.length);
    expect(new Set(HEADS.map(([, , description]) => description)).size).toBe(HEADS.length);
  });
});

describe('calculator pages', () => {
  it('has a field for every input of its engine, and a warning text for every warning code', () => {
    for (const page of CALCULATORS) {
      const engine = ENGINES[page.id];
      expect(Object.keys(page.fields), page.id).toEqual(engine.inputs.map(({ key }) => key));
      expect(Object.keys(page.warnings), page.id).toEqual([...engine.warnings]);
      expect(engine.id).toBe(page.id);
    }
  });

  it('gives every select field an option for each of its engine options', () => {
    for (const page of CALCULATORS) {
      for (const input of ENGINES[page.id].inputs) {
        if (input.kind !== 'select') continue;
        expect(
          Object.keys(page.fields[input.key]?.options ?? {}),
          `${page.id}.${input.key}`,
        ).toEqual([...input.options]);
      }
    }
  });

  it('links guides and Maestro Calc pages that exist', () => {
    for (const page of CALCULATORS) {
      for (const id of page.guides) expect(ROUTES.some((route) => route.id === id)).toBe(true);
      for (const id of page.maestro) expect(MAESTRO.pages[id].path).toMatch(/^\//);
      expect(calculatorAt(page.path)).toBe(page);
    }
    expect(() => calculatorAt('/nope')).toThrow('no calculator at /nope');
  });

  it('lists the calculators in the home cards and the navigation, then the frost dates', () => {
    expect(HOME_TOOLS.map(({ href }) => href)).toEqual(CALCULATORS.map(({ path }) => path));
    expect(HOME_TOOLS.every(({ summary }) => summary !== '')).toBe(true);
    expect(navOf().at(-1)).toEqual({ href: '/frost-dates', title: 'Frost dates' });
  });
});

describe('guides', () => {
  it('links each guide from the calculators it explains and back', () => {
    for (const guide of GUIDES) {
      for (const path of guide.calculators) {
        expect(guidesOf(path)).toContain(guide);
        expect(calculatorAt(path).guides).toContain(guide.id);
      }
      expect(guideAt(guide.path)).toBe(guide);
    }
    expect(() => guideAt('/nope')).toThrow('no guide at /nope');
  });

  it('answers every question in the page text, with a cited source', () => {
    for (const guide of ALL_GUIDES) {
      expect(guideAt(guide.path)).toBe(guide);
      expect(guide.questions.length).toBeGreaterThan(0);
      expect(Object.keys(guide.sources).length).toBeGreaterThan(0);
      for (const { url } of Object.values(guide.sources)) expect(url).toMatch(/^https:\/\//);
    }
  });
});

describe('bylines', () => {
  it('gives the guides and every frost page a byline with the NOAA or the guide sources', () => {
    expect(BYLINE_PAGES).toHaveLength(ALL_GUIDES.length + 1 + FROST_PAGES.length);
    for (const page of BYLINE_PAGES) {
      expect(page.checked).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(page.sources.length).toBeGreaterThan(0);
    }
    expect(() => bylinePageOf('/privacy')).toThrow('/privacy has no byline');
    expect(bylinePageOf('/frost-dates').sources.length).toBeGreaterThanOrEqual(5);
  });

  it('writes the team, the review day and the sources link', () => {
    expect(bylineOf({ checked: '2026-11-07', sources: true })).toEqual({
      by: 'By',
      team: { href: '/editorial-policy', label: 'the Lawn Figures editorial team' },
      reviewed: { label: 'Reviewed', datetime: '2026-11-07', text: 'November 7, 2026' },
      sources: { href: '#sources', label: 'Sources' },
    });
    expect(bylineOf({})).toEqual({
      by: 'By',
      team: { href: '/editorial-policy', label: 'the Lawn Figures editorial team' },
    });
    expect(checkedText('2026-01-05')).toBe('January 5, 2026');
  });
});

describe('policy pages', () => {
  it('cites every source with an address, once', () => {
    const urls = citedSources().map(({ url }) => url);
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls.length).toBeGreaterThan(8);
  });

  it('takes error reports at the site domain, in the privacy and the policy', () => {
    expect(CONTACT_EMAIL).toBe('hello@lawnfigures.com');
    expect(JSON.stringify(EDITORIAL)).toContain(CONTACT_EMAIL);
    expect(JSON.stringify(PRIVACY)).toContain(CONTACT_EMAIL);
  });

  it('links the footer to the methodology, the frost dates, the guides and the policies', () => {
    const hrefs = footerLinks().map(({ href }) => href);
    expect(hrefs).toEqual([
      '/methodology',
      '/frost-dates',
      ...GUIDES.map(({ path }) => path),
      '/privacy',
      '/about',
      '/editorial-policy',
    ]);
  });
});

describe('llms.txt', () => {
  const text = llmsTxt();

  it('names the site, summarizes it and lists every page but the home', () => {
    expect(text.startsWith('# Lawn Figures\n\n> ')).toBe(true);
    const urls = [...text.matchAll(/\]\((https:\/\/[^)]+)\)/g)].map(([, url = '']) => url);
    expect(urls).toHaveLength(ROUTES.length - 1);
    expect(urls).not.toContain('https://lawnfigures.com/');
    expect(urls).toContain('https://lawnfigures.com/frost-dates/texas/3');
  });
});
