import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { figure } from './__testing__/figure.ts';
import { CHEMISTRY_CHART } from './chemistry.ts';
import { CHLORINE, FILL_TIME, HEATER, PUMP } from './doses.ts';
import { CLOSING_GUIDE, GUIDES, OPENING_GUIDE, PUMP_RUN_GUIDE, type GuideSource } from './guide.ts';
import { VOLUME_TEXTS } from './volume/texts.ts';

const pages = readdirSync(fileURLToPath(new URL('pages/', import.meta.url)))
  .filter((name) => name.endsWith('.astro'))
  .map((name) => `/${name.replace(/\.astro$/, '').replace(/^index$/, '')}`);
const layout = readFileSync(
  fileURLToPath(new URL('components/Layout.astro', import.meta.url)),
  'utf8',
);
const footer = /<footer[\s\S]*<\/footer>/.exec(layout)?.[0] ?? '';

const textOf = (
  guide: typeof OPENING_GUIDE | typeof CLOSING_GUIDE | typeof PUMP_RUN_GUIDE,
): string => guide.steps.map(({ text }) => text).join(' ');

describe.each([
  ['spring opening', OPENING_GUIDE],
  ['winter closing', CLOSING_GUIDE],
  ['pump run time', PUMP_RUN_GUIDE],
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

describe('the pump run time guide', () => {
  const text = textOf(PUMP_RUN_GUIDE);

  // the figures come from the sources as published; a changed one must be checked against them again
  it('gives the standard, the manual, DOE and ENERGY STAR figures exactly as they publish them', () => {
    expect(text).toContain('6-hour turnover or 36 gpm, whichever is greater');
    expect(text).toContain('8 ft per second in the return and 6 in the suction');
    expect(text).toContain('at least once every 24 hours');
    expect(text).toContain('6 hours a day');
    expect(text).toContain('half-hour');
    expect(text).toContain('less than 3 hours a day');
    expect(text).toContain('60%');
    expect(text).toContain('one-eighth');
    expect(text).toContain('75%');
    expect(text).toContain('in half');
  });

  it('calls 8 hours what it is: an informal trade figure, in no source it cites', () => {
    expect(text).toContain('informal trade figure');
  });

  // a figure a calculator works out is the calculator's own, to the digit
  it('works out the flows as the pump size calculator does', () => {
    expect(text).toContain(`${figure(PUMP.path, { gallons: '20000' }, 'flow')} gpm`);
    expect(text).toContain(`${figure(PUMP.path, { gallons: '20000' }, 'eightHour')} gpm`);
    expect(text).toContain(`${figure(PUMP.path, { gallons: '10000' }, 'flow')} gpm`);
  });

  it('works out one turnover at a slower flow as gallons ÷ gallons a minute', () => {
    expect(figure(FILL_TIME.path, { gallons: '20000', flow: '40' }, 'time')).toBe('8 h 20 min');
    expect(text).toContain('20,000 ÷ 40 = 500 minutes, 8 h 20 min');
  });

  it('links the volume, the pump size and the heater calculators', () => {
    const links = PUMP_RUN_GUIDE.steps.flatMap(({ link }) =>
      link === undefined ? [] : [link.href],
    );
    expect(links).toEqual([VOLUME_TEXTS.path, PUMP.path, HEATER.path]);
  });
});

describe('the guides', () => {
  it('lists every guide once, each with a short card', () => {
    expect(GUIDES.map(({ path }) => path)).toEqual([
      OPENING_GUIDE.path,
      CLOSING_GUIDE.path,
      CHEMISTRY_CHART.path,
      PUMP_RUN_GUIDE.path,
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
