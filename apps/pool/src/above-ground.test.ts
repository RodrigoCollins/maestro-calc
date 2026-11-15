import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { ABOVE_GROUND_GUIDE } from './above-ground.ts';
import { DOSING_CHART } from './dosing.ts';
import { CHLORINE, FILL_TIME, SALT } from './doses.ts';
import { GALLONS_GUIDE } from './gallons.ts';
import { LITRES_GUIDE } from './litres.ts';
import { VOLUME_CHART } from './volume/chart.ts';

const guide = ABOVE_GROUND_GUIDE;
const text = [guide.lead, ...guide.steps.map(({ text: step }) => step)].join(' ');
const pages = readdirSync(fileURLToPath(new URL('pages/', import.meta.url)));

/** The first two sentences of a lead: what a search answer quotes. */
const opening = (lead: string): string =>
  lead
    .split(/(?<=[.:]) (?=[A-Z])/)
    .slice(0, 2)
    .join(' ');

describe('the above ground pool gallons guide', () => {
  it('lives at the address of the question, titled with it', () => {
    expect(guide.path).toBe('/how-many-gallons-in-an-above-ground-pool');
    expect(pages).toContain('how-many-gallons-in-an-above-ground-pool.astro');
    expect(guide.title.startsWith('How Many Gallons in an Above Ground Pool?')).toBe(true);
    expect(guide.title.endsWith(' | Pool Figures')).toBe(true);
    expect(guide.title.length).toBeLessThanOrEqual(65);
    expect(guide.description.length).toBeGreaterThan(50);
    expect(guide.description.length).toBeLessThanOrEqual(160);
  });

  // π × 6² × 4 × 1728 ÷ 231 = 3,383.7; 18 ft 7,614.3; 24 ft 13,536.4; 33 ft 25,591.8
  it('answers in its opening with the formula and the range of round sizes at 4 ft', () => {
    const answer = opening(guide.lead);
    expect(answer).toContain('5.9');
    for (const figure of ['3,384', '7,614', '13,536', '25,592']) expect(answer).toContain(figure);
  });

  // π × 12² × (1/12 ft) × 7.4805 = 282.0 gallons; 18 ft: 158.6; 33 ft: 533.2; 12 ft: 70.5
  it('tables the gallons of each inch of water, the gallons and the litres at 4 ft', () => {
    const rows = guide.table.rows;
    const row = (label: string) => rows.find(([first]) => first === label);
    expect(row('24 ft round')).toEqual(['24 ft round', '282', '13,536', '51,241']);
    expect(row('18 ft round')?.slice(1, 3)).toEqual(['159', '7,614']);
    expect(row('33 ft round')?.slice(1, 3)).toEqual(['533', '25,592']);
    // π × 15 × 30 ÷ 4 × 4 × 7.4805 = 10,575.5
    expect(row('15 x 30 ft oval')?.[2]).toBe('10,575');
    expect(rows.map(([first]) => first)).toEqual([
      '12 ft round',
      '15 ft round',
      '18 ft round',
      '21 ft round',
      '24 ft round',
      '27 ft round',
      '30 ft round',
      '33 ft round',
      '12 x 24 ft oval',
      '15 x 30 ft oval',
      '16 x 32 ft oval',
      '18 x 33 ft oval',
    ]);
  });

  // π × 9² = 254.5 sq ft × 4 = 1,017.9 cubic feet; 15 x 15 ft × 4 = 900 cu ft = 6,732.5 + 5,287.6 = 12,020
  it('works out its own pools: an 18 ft round by hand and a straight-sided oval', () => {
    expect(text).toContain('254.5');
    expect(text).toContain('1,017.9');
    expect(text).toContain('12,020');
    expect(text).toContain('1,445');
  });

  // 13,536 gal from 0 to 10 ppm of 65% cal-hypo: 27.8 oz; salt from 0 to 3,200 ppm: 361.2 lb
  it('sizes the first shock and the salt of a 24 ft round, citing the labels', () => {
    expect(text).toContain('27.8 oz');
    expect(text).toContain('361.2 lb');
    expect(guide.sources.calHypo).toEqual(DOSING_CHART.sources.calHypo);
    expect(guide.sources.manual).toEqual(DOSING_CHART.sources.hayward);
    expect(guide.sources.nist).toEqual(VOLUME_CHART.source);
  });

  it('links the calculators, the size pages, the litres guide and the formula guide', () => {
    const links = guide.steps.flatMap(({ link }) => (link === undefined ? [] : [link.href]));
    expect(links).toEqual(
      expect.arrayContaining([
        CHLORINE.path,
        SALT.path,
        FILL_TIME.path,
        LITRES_GUIDE.path,
        GALLONS_GUIDE.path,
        '/24-ft-round-pool-gallons',
      ]),
    );
  });

  it('cites every source it names, and names every source it cites', () => {
    const cited = new Set([
      ...guide.steps.flatMap(({ sources }) => sources ?? []),
      ...guide.table.sources,
    ]);
    expect([...cited].sort()).toEqual(Object.keys(guide.sources).sort());
  });
});
