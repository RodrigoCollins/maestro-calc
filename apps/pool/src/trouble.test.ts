import { poolChlorine } from '@maestro-calc/pool-core/pool-chlorine';
import { describe, expect, it } from 'vitest';
import { figure } from './__testing__/figure.ts';
import { outputText } from './format.ts';
import { CHEMISTRY_CHART } from './chemistry.ts';
import { CALCIUM, CHLORINE, PH, PUMP } from './doses.ts';
import { GUIDES, SHOCK_GUIDE, type GuideSource, type GuideTable, type StepGuide } from './guide.ts';
import { CLOUDY_GUIDE, GREEN_GUIDE, SHOCK_OFTEN_GUIDE } from './trouble.ts';
import { VOLUME_TEXTS } from './volume/texts.ts';

const GUIDES_HERE = [GREEN_GUIDE, CLOUDY_GUIDE, SHOCK_OFTEN_GUIDE] as const;

const stepsOf = (guide: StepGuide): string => guide.steps.map(({ text }) => text).join(' ');
const linksOf = (guide: StepGuide): string[] =>
  guide.steps.flatMap(({ link }) => (link === undefined ? [] : [link.href]));
const cellsOf = (guide: StepGuide): string => (guide.table?.rows ?? []).flat().join(' ');

/** The first two sentences of a lead: what a search answer quotes. */
const opening = (lead: string): string =>
  lead
    .split(/(?<=[.:]) (?=[A-Z])/)
    .slice(0, 2)
    .join(' ');

/** The chlorine calculator's dose for `gallons`, from `current` to `target` ppm of `product`. */
const chlorine = (gallons: string, current: string, target: string, product: string): string =>
  figure(
    CHLORINE.path,
    { gallons, current, target, product },
    product.startsWith('liquid') ? 'liquid' : 'dry',
  );

/** The table of a guide; a guide of this module without one is a failed test. */
const tableOf = (guide: StepGuide): GuideTable => {
  if (guide.table === undefined) throw new Error(`${guide.path} has no table`);
  return guide.table;
};

describe.each(GUIDES_HERE.map((guide): readonly [string, StepGuide] => [guide.path, guide]))(
  'the %s guide',
  (_path, guide) => {
    it('opens with a table under its lead, every row as wide as its head', () => {
      const table = tableOf(guide);
      expect(table.head.length).toBeGreaterThanOrEqual(3);
      expect(table.rows.length).toBeGreaterThanOrEqual(4);
      for (const row of table.rows) expect(row).toHaveLength(table.head.length);
    });

    it('cites under its table only the sources its steps cite', () => {
      const cited = new Set(guide.steps.flatMap(({ sources }) => sources ?? []));
      expect(tableOf(guide).sources.length).toBeGreaterThan(0);
      for (const key of tableOf(guide).sources) expect(cited, key).toContain(key);
    });

    it('starts from the gallons and sends the dose to the chlorine calculator', () => {
      expect(guide.steps[0]?.link?.href).toBe(VOLUME_TEXTS.path);
      expect(linksOf(guide)).toContain(CHLORINE.path);
    });

    it('keeps the never-mix rule of the labels', () => {
      expect(stepsOf(guide)).toContain('explosion');
      expect(stepsOf(guide)).toMatch(/never mix/i);
    });

    it('lets nobody swim above the reentry reading of the labels', () => {
      expect(stepsOf(guide)).toContain('4 ppm');
    });

    it('is titled for search', () => {
      expect(guide.title.endsWith(' | Pool Figures')).toBe(true);
      expect(guide.title.length).toBeLessThanOrEqual(65);
      expect(guide.card.title.length).toBeLessThanOrEqual(30);
      expect(guide.card.summary.length).toBeLessThanOrEqual(90);
    });
  },
);

describe('the green pool guide', () => {
  const text = stepsOf(GREEN_GUIDE);

  // the figures come from the sources as published; a changed one must be checked against them again
  it('gives Taylor’s trouble chart for algae and metals as it publishes it', () => {
    expect(GREEN_GUIDE.lead).toContain('30 ppm');
    expect(cellsOf(GREEN_GUIDE)).toContain('Copper');
    expect(cellsOf(GREEN_GUIDE)).toContain('Iron');
    expect(text).toContain('2.0 to 4.0 ppm');
    expect(text).toContain('7.2 to 7.8');
    expect(text).toContain('stainless steel');
    expect(text).toContain('soft nylon');
    expect(text).toContain('Seek expert advice');
  });

  it('gives the labels’ shock and algae directions as they publish them', () => {
    expect(text).toContain('10 to 20 oz per 10,000 gallons');
    expect(text).toContain('52 to 104 fl oz per 10,000 gallons');
    expect(text).toContain('as close as possible to any algae');
    expect(text).toContain('brushing surface of algae growth, vacuum and cycle through filter');
    expect(GREEN_GUIDE.sources.calHypo.url).toContain('069681-00006');
    expect(GREEN_GUIDE.sources.liquid.url).toContain('055487-20001');
  });

  // 20,000 gal × 3.785411784 L × 30 mg/L = 2,271.2 g of chlorine: ÷ 0.65 = 3,494 g = 123.3 oz of
  // cal-hypo; ÷ 0.125 = 18,170 mL = 614.4 fl oz of 12.5% liquid, 4.8 gallons
  it('answers in its opening with the 30 ppm dose of 20,000 gallons, as the calculator gives it', () => {
    expect(opening(GREEN_GUIDE.lead)).toContain('algae');
    expect(GREEN_GUIDE.lead).toContain(`${chlorine('20000', '0', '30', 'liquid-12-5')} fl oz (`);
    expect(GREEN_GUIDE.lead).toContain('614.4 fl oz');
    expect(GREEN_GUIDE.lead).toContain(`${chlorine('20000', '0', '30', 'cal-hypo-65')} oz`);
    expect(GREEN_GUIDE.lead).toContain('123.3 oz');
  });

  it('works out the 30 ppm dose of 10,000 to 30,000 gallons with the calculator', () => {
    for (const gallons of ['10000', '15000', '20000', '30000']) {
      expect(text, gallons).toContain(`${chlorine(gallons, '0', '30', 'liquid-12-5')} fl oz`);
      expect(text, gallons).toContain(`${chlorine(gallons, '0', '30', 'cal-hypo-65')} oz`);
    }
    // 10,000 gal: 307.2 fl oz = 2.4 gallons; 61.6 oz = 3.9 lb
    expect(text).toContain('307.2 fl oz');
    expect(text).toContain('61.6 oz');
  });

  // the same 30 ppm shock for the pools that are measured in litres (Australia, the UK, Spain)
  it('tables the 30 ppm shock of 20,000 to 80,000 litres, each cell the metric calculator’s', () => {
    const [metric] = GREEN_GUIDE.moreTables;
    expect(metric.head).toEqual(['Pool', '12.5% liquid chlorine', '65% cal-hypo']);
    expect(metric.sources).toEqual(['taylor']);
    const sizes = ['20000', '30000', '40000', '50000', '60000', '80000'];
    expect(metric.rows).toEqual(
      sizes.map((litres) => {
        const raw = { gallons: litres, current: '0', target: '30', units: 'metric' };
        const ran = poolChlorine.run({ ...raw, product: 'liquid-12-5' });
        const dry = poolChlorine.run({ ...raw, product: 'cal-hypo-65' });
        if (!ran.ok || !dry.ok) throw new Error('run failed');
        return [
          `${Number(litres).toLocaleString('en-US')} L`,
          `${outputText('liquid', ran.value.outputs[0]?.value, 'metric')} L`,
          `${outputText('dry', dry.value.outputs[1]?.value, 'metric')} g`,
        ];
      }),
    );
    // 50,000 L x 30 mg = 1,500 g of chlorine: 12 L of 12.5% liquid, 2,308 g of 65% cal-hypo
    expect(metric.rows[3]).toEqual(['50,000 L', '12.00 L', '2,308 g']);
  });

  it('links the pH calculator, the chart, the swim guide and the shock schedule', () => {
    expect(linksOf(GREEN_GUIDE)).toEqual(
      expect.arrayContaining([
        PH.path,
        CHEMISTRY_CHART.path,
        '/how-long-after-adding-chemicals-can-you-swim',
        SHOCK_OFTEN_GUIDE.path,
      ]),
    );
  });

  it('holds a public pool to the clarity rule of the CDC’s code', () => {
    expect(text).toContain('5.7.6.1');
    expect(GREEN_GUIDE.sources.mahc.url).toContain('MAHC');
  });
});

describe('the cloudy pool guide', () => {
  const text = stepsOf(CLOUDY_GUIDE);

  it('gives the four causes of Taylor’s trouble chart, and the ranges as Taylor publishes them', () => {
    const cells = cellsOf(CLOUDY_GUIDE);
    for (const cause of [
      'Early algae growth',
      'Poor filtration',
      'High pH',
      'High total alkalinity',
    ])
      expect(cells, cause).toContain(cause);
    expect(text).toContain('80 to 120 ppm');
    expect(text).toContain('7.2 to 7.8');
    expect(text).toContain('Check filter for proper operation');
    expect(text).toContain('cloudy water');
  });

  it('gives the filter, calcium and clarity rules as their sources publish them', () => {
    expect(text).toContain('at least once every 24 hours');
    expect(text).toContain('backwash or clean');
    expect(text).toContain('12 hours apart');
    expect(text).toContain('30 feet');
    expect(text).toContain('5.7.6.1');
  });

  // 10,000 gal from 1 to 10 ppm: 9 ppm × 37.854 g = 340.7 g, ÷ 0.125 = 2,725 mL = 92.2 fl oz;
  // ÷ 0.65 = 524 g = 18.5 oz of cal-hypo
  it('works out the shock from a low reading with the calculator', () => {
    for (const gallons of ['10000', '20000']) {
      expect(text, gallons).toContain(`${chlorine(gallons, '1', '10', 'liquid-12-5')} fl oz`);
      expect(text, gallons).toContain(`${chlorine(gallons, '1', '10', 'cal-hypo-65')} oz`);
    }
    expect(text).toContain('92.2 fl oz');
  });

  it('works out the acid of a high pH with the pH calculator', () => {
    const acid = figure(
      PH.path,
      { gallons: '10000', product: 'muriatic-31-45', drops: '1' },
      'liquid',
    );
    expect(text).toContain(`${acid} fl oz`);
  });

  it('links the pH, pump and calcium calculators, the pump guide and the green pool guide', () => {
    expect(linksOf(CLOUDY_GUIDE)).toEqual(
      expect.arrayContaining([
        PH.path,
        PUMP.path,
        CALCIUM.path,
        '/how-long-to-run-pool-pump',
        GREEN_GUIDE.path,
      ]),
    );
  });
});

describe('the how often to shock guide', () => {
  const text = stepsOf(SHOCK_OFTEN_GUIDE);

  it('gives the schedule of each label as it publishes it', () => {
    expect(SHOCK_OFTEN_GUIDE.lead).toContain('every 7 days');
    expect(text).toContain('every 7 days or as necessary');
    expect(text).toContain('rain and heavy winds');
    expect(text).toContain('every week in hot weather');
    expect(text).toContain('less often in cool weather');
    expect(text).toContain('eye irritation');
    expect(text).toContain('3 ppm');
  });

  it('gives Taylor’s breakpoint rule and the code’s combined chlorine limit', () => {
    expect(text).toContain('10 times the amount of combined chlorine');
    expect(text).toContain('0.4 ppm');
    expect(text).toContain('daily, or as bather load demands');
  });

  // a reading of 2 ppm and 0.5 ppm combined: 10 × 0.5 = 5 ppm, so 2 to 7 ppm in 20,000 gallons
  it('works out the breakpoint dose with the calculator', () => {
    expect(text).toContain(`${chlorine('20000', '2', '7', 'liquid-12-5')} fl oz`);
    expect(text).toContain('102.4 fl oz');
  });

  // 10,000 gal: 1 ppm = 3,785 mg ÷ 0.65 = 5.8 g = 2.05 oz, the label's "2 oz per 10,000 gallons"
  it('tables one shock of 10,000 to 30,000 gallons, each cell the calculator’s', () => {
    const { rows } = SHOCK_OFTEN_GUIDE.table;
    expect(rows.map((row) => row[0])).toEqual([
      '10,000 gallons',
      '15,000 gallons',
      '20,000 gallons',
      '30,000 gallons',
    ]);
    rows.forEach((row, index) => {
      const gallons = ['10000', '15000', '20000', '30000'][index] ?? '';
      expect(row[1]).toContain(`${chlorine(gallons, '0', '10', 'liquid-12-5')} fl oz`);
      expect(row[2]).toContain(`${chlorine(gallons, '0', '10', 'cal-hypo-65')} oz`);
      expect(row[3]).toContain(`${chlorine(gallons, '0', '10', 'dichlor-56')} oz`);
    });
    expect(rows[0]?.[2]).toContain('20.5 oz');
    expect(text).toContain('2 oz per 10,000 gallons');
  });

  it('is not the how to shock guide, and links it', () => {
    expect(SHOCK_OFTEN_GUIDE.path).not.toBe(SHOCK_GUIDE.path);
    expect(linksOf(SHOCK_OFTEN_GUIDE)).toContain(SHOCK_GUIDE.path);
    expect(linksOf(SHOCK_OFTEN_GUIDE)).toContain(GREEN_GUIDE.path);
  });
});

describe('the three guides', () => {
  it('are listed with the guides, after the how to shock guide', () => {
    const paths = GUIDES.map(({ path }) => path);
    const shock = paths.indexOf(SHOCK_GUIDE.path);
    expect(paths.slice(shock + 1, shock + 4)).toEqual([
      SHOCK_OFTEN_GUIDE.path,
      GREEN_GUIDE.path,
      CLOUDY_GUIDE.path,
    ]);
  });

  it('cite each source under one name and one address', () => {
    const all = GUIDES_HERE.flatMap(({ sources }) => Object.values<GuideSource>(sources));
    const byUrl = new Map(all.map(({ name, url }) => [url, name]));
    for (const { name, url } of all) expect(byUrl.get(url), url).toBe(name);
  });
});
