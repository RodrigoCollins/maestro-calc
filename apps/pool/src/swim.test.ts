import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { figure } from './__testing__/figure.ts';
import { CHEMISTRY_CHART } from './chemistry.ts';
import { DOSING_CHART } from './dosing.ts';
import { ALKALINITY, CALCIUM, CHLORINE, PH, SALT, STABILIZER } from './doses.ts';
import { CALCIUM_GUIDE, GUIDES, PH_GUIDE, SHOCK_GUIDE } from './guide.ts';
import { SWIM_GUIDE } from './swim.ts';

const pages = readdirSync(fileURLToPath(new URL('pages/', import.meta.url)))
  .filter((name) => name.endsWith('.astro'))
  .map((name) => `/${name.replace(/\.astro$/, '').replace(/^index$/, '')}`);

const row = (id: string) => {
  const found = SWIM_GUIDE.rows.find((candidate) => candidate.id === id);
  if (found === undefined) throw new Error(`no row ${id}`);
  return found;
};
const textOf = (id: string): string => {
  const { when, time, text } = row(id);
  return `${when} ${time} ${text}`;
};

// A search answer quotes the opening: its first two sentences carry the rule.
const opening = (lead: string): string =>
  lead
    .split(/(?<=[.:]) (?=[A-Z])/)
    .slice(0, 2)
    .join(' ');

describe('the swim after chemicals guide', () => {
  it('lives at its own page, with a title and a description search engines can show whole', () => {
    expect(pages).toContain(SWIM_GUIDE.path);
    expect(SWIM_GUIDE.title.endsWith(' | Pool Figures')).toBe(true);
    expect(SWIM_GUIDE.title.length).toBeLessThanOrEqual(65);
    expect(SWIM_GUIDE.description.length).toBeGreaterThan(50);
    expect(SWIM_GUIDE.description.length).toBeLessThanOrEqual(160);
  });

  it('opens with the rule: a test reading, never a clock time', () => {
    const lead = opening(SWIM_GUIDE.lead);
    expect(lead).toContain('not after a set number of hours');
    expect(lead).toContain('4 ppm for 65% cal-hypo and 12.5% liquid chlorine');
    expect(lead).toContain('3 ppm for dichlor');
    expect(lead).toContain('pH 7.0 to 7.8');
    expect(lead).toContain('2 ppm with stabilizer');
  });

  it('gives one row per chemical, in the order of the question', () => {
    expect(SWIM_GUIDE.rows.map(({ id }) => id)).toEqual([
      'cal-hypo',
      'dichlor',
      'liquid-chlorine',
      'muriatic-acid',
      'soda-ash',
      'baking-soda',
      'salt',
      'calcium',
      'stabilizer',
    ]);
    for (const { chemical, when, time, text } of SWIM_GUIDE.rows)
      for (const value of [chemical, when, time, text]) expect(value.length).toBeGreaterThan(0);
  });

  // No wait time the source does not give: a row whose source gives no swim time says so.
  it('says where the source gives no time before swimming, and never invents one', () => {
    for (const id of ['muriatic-acid', 'soda-ash', 'baking-soda', 'salt', 'calcium', 'stabilizer'])
      expect(row(id).time, id).toContain('no time before swimming');
    for (const id of ['cal-hypo', 'dichlor', 'liquid-chlorine'])
      expect(row(id).time, id).toContain('no hours');
    const all = SWIM_GUIDE.rows.map(({ when, time, text }) => `${when} ${time} ${text}`).join(' ');
    expect(all).not.toMatch(/\b(?:15|20|30) minutes\b|\bwait (?:\d|an?|one|two)/i);
  });

  // the figures come from the labels as published; a changed one must be checked against them again
  it('gives the reentry level of each chlorine label exactly as it is published', () => {
    expect(textOf('cal-hypo')).toContain('prohibits reentry above 4 ppm');
    expect(textOf('dichlor')).toContain('prohibits reentry above 3 ppm');
    expect(textOf('liquid-chlorine')).toContain(
      'Do not enter treated pool above 4 ppm chlorine level due to risk of bodily harm',
    );
    expect(textOf('liquid-chlorine')).toContain('52 to 104 fl. oz.');
    expect(textOf('liquid-chlorine')).toContain('5 to 10 ppm');
  });

  // a figure a calculator works out is the calculator's own, to the digit
  it('works out the liquid chlorine label’s shock as the chlorine calculator does', () => {
    const liquid = (target: string): string =>
      figure(
        CHLORINE.path,
        { gallons: '10000', current: '0', target, product: 'liquid-12-5' },
        'liquid',
      );
    expect(textOf('liquid-chlorine')).toContain(
      `from 0 ppm, the calculator gives ${liquid('5')} fl oz for 5 ppm and ${liquid('10')} fl oz for 10`,
    );
  });

  it('gives the times of the balancers exactly as their directions publish them', () => {
    expect(textOf('muriatic-acid')).toContain('for at least one (1) hour after the addition');
    expect(textOf('muriatic-acid')).toContain('7.2-7.6');
    expect(textOf('soda-ash')).toContain('recirculate two to three hours, recheck pH');
    expect(textOf('baking-soda')).toContain('during evening hours while filter is running');
    expect(textOf('baking-soda')).toContain('Sodium Bicarbonate');
    expect(textOf('salt')).toContain('Run the filter pump for 24 hours');
    expect(textOf('salt')).toContain('do not allow salt to pile up on the bottom of the pool');
    expect(textOf('calcium')).toContain('at least 12 hours apart');
    expect(textOf('calcium')).toContain('avoid clouding');
    expect(textOf('stabilizer')).toContain('recirculate water continuously for 24 hours');
    expect(textOf('stabilizer')).toContain('90 ppm');
  });

  it('links each row to the calculator that sizes the dose, and the guide where there is one', () => {
    expect(SWIM_GUIDE.rows.map(({ link }) => link.href)).toEqual([
      CHLORINE.path,
      CHLORINE.path,
      CHLORINE.path,
      PH.path,
      PH.path,
      ALKALINITY.path,
      SALT.path,
      CALCIUM.path,
      STABILIZER.path,
    ]);
    expect(row('cal-hypo').guide?.href).toBe(SHOCK_GUIDE.path);
    expect(row('dichlor').guide?.href).toBe(SHOCK_GUIDE.path);
    expect(row('muriatic-acid').guide?.href).toBe(PH_GUIDE.path);
    expect(row('soda-ash').guide?.href).toBe(PH_GUIDE.path);
    expect(row('calcium').guide?.href).toBe(CALCIUM_GUIDE.path);
    for (const { link, guide } of SWIM_GUIDE.rows) {
      expect(pages, link.href).toContain(link.href);
      if (guide !== undefined) expect(pages, guide.href).toContain(guide.href);
    }
  });

  it('links the dosing chart and the water chemistry chart', () => {
    expect(SWIM_GUIDE.charts.map(({ href }) => href)).toEqual([
      DOSING_CHART.path,
      CHEMISTRY_CHART.path,
    ]);
  });

  it('cites every source it names on https, and names every source it cites', () => {
    const cited = new Set([
      ...SWIM_GUIDE.rules.sources,
      ...SWIM_GUIDE.rows.flatMap(({ sources }) => sources),
    ]);
    expect([...cited].sort()).toEqual(Object.keys(SWIM_GUIDE.sources).sort());
    for (const { url } of Object.values(SWIM_GUIDE.sources))
      expect(url.startsWith('https://')).toBe(true);
  });

  it('cites the labels the other guides and the dosing chart cite, as they cite them', () => {
    expect(SWIM_GUIDE.sources.calHypo).toEqual(SHOCK_GUIDE.sources.calHypo);
    expect(SWIM_GUIDE.sources.dichlor).toEqual(SHOCK_GUIDE.sources.dichlor);
    expect(SWIM_GUIDE.sources.hasa).toEqual(PH_GUIDE.sources.hasa);
    expect(SWIM_GUIDE.sources.sodaAsh).toEqual(PH_GUIDE.sources.sodaAsh);
    expect(SWIM_GUIDE.sources.calcium).toEqual(CALCIUM_GUIDE.sources.label);
    expect(SWIM_GUIDE.sources.cdc).toEqual(CHEMISTRY_CHART.sources.cdc);
    expect(SWIM_GUIDE.sources.mahc).toEqual(CHEMISTRY_CHART.sources.mahc);
  });

  it('is a guide of the home and the footer, after the others', () => {
    expect(GUIDES.at(-1)?.path).toBe(SWIM_GUIDE.path);
    expect(GUIDES.at(-1)?.card).toEqual(SWIM_GUIDE.card);
  });
});
