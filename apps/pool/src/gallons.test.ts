import { describe, expect, it } from 'vitest';
import { GALLONS_GUIDE, OLYMPIC_GUIDE } from './gallons.ts';
import { GUIDES } from './guide.ts';
import { guideJobLinksOf, JOB_PAGES } from './jobs.ts';
import { VOLUME_CHART } from './volume/chart.ts';
import { VOLUME_TEXTS } from './volume/texts.ts';

const textOf = (guide: typeof GALLONS_GUIDE | typeof OLYMPIC_GUIDE): string =>
  [guide.lead, ...guide.steps.map(({ text }) => text)].join(' ');

/** The first two sentences of a lead: what a search answer quotes. */
const opening = (lead: string): string =>
  lead
    .split(/(?<=[.:]) (?=[A-Z])/)
    .slice(0, 2)
    .join(' ');

describe('the Olympic pool guide', () => {
  const text = textOf(OLYMPIC_GUIDE);

  // the rule as World Aquatics publishes it (Swimming Pool Certification, in force 1 April 2026)
  it('gives the World Aquatics length, width and depth with their rule numbers', () => {
    expect(text).toContain('50.000 metres');
    expect(text).toContain('25.000 metres');
    expect(text).toContain('26.000 metres');
    expect(text).toContain('2.5 metres');
    for (const rule of ['15.1.1.1', '15.3.1', '15.4.1', '15.4.2', '15.4.3'])
      expect(text, rule).toContain(rule);
    expect(OLYMPIC_GUIDE.sources.worldAquatics.url).toContain('resources.fina.org');
    expect(OLYMPIC_GUIDE.sources.worldAquatics.name).toContain('1 April 2026');
  });

  // worked by hand: 50 × 25 × 2.5 = 3,125 m³ = 3,125,000 L, ÷ 3.785411784 = 825,537.7 gallons
  it('answers in its opening with the gallons and liters of the current minimum, as by hand', () => {
    expect(opening(OLYMPIC_GUIDE.lead)).toContain('825,538 US gallons');
    expect(opening(OLYMPIC_GUIDE.lead)).toContain('3,125,000 liters');
    expect(OLYMPIC_GUIDE.title).toContain('825,000');
  });

  // 2 m: 2,500 m³ = 660,430.1 gallons; 3 m: 3,750 m³ = 990,645.2; each 10 cm: 125 m³ = 33,021.5
  it('works out why the figure varies with the depth, from the older FINA minimum', () => {
    expect(text).toContain('660,430');
    expect(text).toContain('990,645');
    expect(text).toContain('33,022');
    expect(text).toContain('FR 3.3');
    expect(OLYMPIC_GUIDE.sources.fina.name).toContain('2017');
  });

  // 50 × 26 × 2.5 = 3,250 m³ = 858,559.2 gallons; 3,125 m³ ÷ 0.028316846592 = 110,358.3 ft³
  it('works out the temporary pool and the cubic feet', () => {
    expect(text).toContain('858,559');
    expect(text).toContain('110,358');
  });

  // 16 × 32 ft × 5.75 ft = 2,944 ft³ = 22,022.6 gallons; 825,537.7 ÷ 22,022.6 = 37.5
  it('compares it with a common backyard pool', () => {
    expect(text).toContain('22,023');
    expect(text).toContain('37');
  });
});

describe('the how many gallons guide', () => {
  const text = textOf(GALLONS_GUIDE);

  // a 16 x 32 ft pool 3 ft 6 in to 8 ft deep: 22,023 gallons; a 24 ft round at 4 ft: 13,536
  it('answers in its opening with the formula and two worked pools', () => {
    expect(opening(GALLONS_GUIDE.lead)).toContain('7.48');
    expect(GALLONS_GUIDE.lead).toContain('22,023 gallons');
    expect(GALLONS_GUIDE.lead).toContain('13,536 gallons');
  });

  // π × 12² ÷ 4 × 4 × 7.4805 = 3,384; 15 ft 5,288; 18 ft 7,614; 21 ft 10,364; 24 ft 13,536;
  // 27 ft 17,132; 30 ft 21,151; 33 ft 25,592; 6 more inches on a 24 ft round: 1,692
  it('works out every round size the site has at 4 ft, and what 6 inches add', () => {
    for (const figure of [
      '3,384',
      '5,288',
      '7,614',
      '10,364',
      '13,536',
      '17,132',
      '21,151',
      '25,592',
      '1,692',
    ])
      expect(text, figure).toContain(figure);
  });

  // a 15 x 30 ft oval at 4 ft: π × 15 × 30 ÷ 4 × 4 × 7.4805 = 10,575; 22,022.6 gal × 3.785 = 83,365 L
  it('works out an oval and the liters', () => {
    expect(text).toContain('10,575');
    expect(text).toContain('83,365');
  });

  it('links the calculator, the volume chart and the Olympic guide', () => {
    const links = GALLONS_GUIDE.steps.flatMap(({ link }) =>
      link === undefined ? [] : [link.href],
    );
    expect(links).toEqual(
      expect.arrayContaining([VOLUME_TEXTS.path, VOLUME_CHART.path, OLYMPIC_GUIDE.path]),
    );
  });

  it('lists every pool size page, each linking the guide back', () => {
    const sizes = JOB_PAGES.filter(({ kind }) => kind === 'volume');
    expect(sizes.length).toBeGreaterThan(20);
    expect(guideJobLinksOf(GALLONS_GUIDE.path)).toEqual(
      sizes.map(({ path, h1 }) => ({ href: path, label: h1 })),
    );
    for (const page of sizes)
      expect(page.guide).toEqual({ href: GALLONS_GUIDE.path, label: GALLONS_GUIDE.card.title });
  });
});

describe('the gallons guides', () => {
  it('are listed with the guides, after the volume chart', () => {
    const paths = GUIDES.map(({ path }) => path);
    const chart = paths.indexOf(VOLUME_CHART.path);
    expect(paths.slice(chart + 1, chart + 3)).toEqual([GALLONS_GUIDE.path, OLYMPIC_GUIDE.path]);
  });

  it.each([GALLONS_GUIDE, OLYMPIC_GUIDE])('$path is titled for search', (guide) => {
    expect(guide.title.endsWith(' | Pool Figures')).toBe(true);
    expect(guide.title.length).toBeLessThanOrEqual(65);
    expect(guide.description.length).toBeGreaterThan(50);
    expect(guide.description.length).toBeLessThanOrEqual(160);
  });
});
