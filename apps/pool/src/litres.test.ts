import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { DOSING_CHART } from './dosing.ts';
import { CHLORINE, FILL_TIME } from './doses.ts';
import { GALLONS_GUIDE } from './gallons.ts';
import { LITRES_GUIDE } from './litres.ts';
import { SALT_AMOUNT_GUIDE } from './salt-amount.ts';
import { VOLUME_CHART } from './volume/chart.ts';
import { VOLUME_TEXTS } from './volume/texts.ts';

const guide = LITRES_GUIDE;
const text = [guide.lead, ...guide.steps.map(({ text: step }) => step)].join(' ');
const pages = readdirSync(fileURLToPath(new URL('pages/', import.meta.url)));

/** The first two sentences of a lead: what a search answer quotes. */
const opening = (lead: string): string =>
  lead
    .split(/(?<=[.:]) (?=[A-Z])/)
    .slice(0, 2)
    .join(' ');

describe('the how many litres guide', () => {
  it('lives at the address of the question, titled with it', () => {
    expect(guide.path).toBe('/how-many-litres-is-my-pool');
    expect(pages).toContain('how-many-litres-is-my-pool.astro');
    expect(guide.title.startsWith('How Many Litres Is My Pool?')).toBe(true);
    expect(guide.title.endsWith(' | Pool Figures')).toBe(true);
    expect(guide.title.length).toBeLessThanOrEqual(65);
    expect(guide.description.length).toBeGreaterThan(50);
    expect(guide.description.length).toBeLessThanOrEqual(160);
  });

  // 8 × 4 × (1 + 2) ÷ 2 = 48 m³ = 48,000 L; π ÷ 4 × 4.5² × 1.2 = 19.085 m³ = 19,085 L
  it('answers in its opening with the formula in metres and two worked pools', () => {
    const answer = opening(guide.lead);
    expect(answer).toContain('1,000');
    expect(answer).toContain('48,000 litres');
    expect(guide.lead).toContain('785');
    expect(guide.lead).toContain('19,085 litres');
  });

  // 8 × 4 × 0.01 = 0.32 m³ = 320 L; π ÷ 4 × 4.5² × 0.01 = 0.159 m³ = 159 L; π ÷ 4 × 6 × 3.6 × 1.2 = 20,358 L
  it('works out an oval and the litres of each centimetre of water', () => {
    expect(text).toContain('20,358');
    expect(text).toContain('320 litres');
    expect(text).toContain('159 litres');
  });

  // 48,000 ÷ 4.54609 = 10,558.6 imperial gallons; 48,000 ÷ 3.785411784 = 12,680.3 US gallons
  it('turns the litres into UK and Canadian gallons and into US gallons, citing NIST', () => {
    expect(text).toContain('4.54609');
    expect(text).toContain('10,559');
    expect(text).toContain('12,680');
    expect(guide.sources.nistSi.url).toContain('nist.gov');
    expect(guide.sources.nistSi.name).toContain('B.9');
  });

  // 48,000 L from 0 to 10 ppm of 65% cal-hypo: 738 g; from 0 to 4,000 ppm of salt: 192.0 kg
  it('sizes a shock and the salt of the 8 x 4 m pool, citing the labels', () => {
    expect(text).toContain('738 g');
    expect(text).toContain('192.0 kg');
    expect(guide.sources.calHypo).toEqual(DOSING_CHART.sources.calHypo);
    expect(guide.sources.astral).toEqual(SALT_AMOUNT_GUIDE.sources.astral);
  });

  it('tables the pools in metres: litres, litres per centimetre and both gallons', () => {
    const row = guide.table.rows.find(([first]) => first === '8 x 4 m');
    expect(row).toEqual(['8 x 4 m', '1 to 2 m', '48,000', '320', '10,559', '12,680']);
    const round = guide.table.rows.find(([first]) => first === '4.5 m round');
    expect(round?.slice(1, 4)).toEqual(['1.2 m', '19,085', '159']);
    expect(guide.table.rows.map(([first]) => first)).toEqual([
      '3.6 m round',
      '4.5 m round',
      '5.5 m round',
      '6 x 3 m',
      '8 x 4 m',
      '10 x 5 m',
      '12 x 6 m',
    ]);
  });

  it('links the calculators, the salt guide, the volume chart and the gallons guide', () => {
    const links = guide.steps.flatMap(({ link }) => (link === undefined ? [] : [link.href]));
    expect(links).toEqual(
      expect.arrayContaining([
        VOLUME_TEXTS.path,
        CHLORINE.path,
        FILL_TIME.path,
        SALT_AMOUNT_GUIDE.path,
        VOLUME_CHART.path,
        GALLONS_GUIDE.path,
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
