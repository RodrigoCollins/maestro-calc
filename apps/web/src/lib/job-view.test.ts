import { decode } from '@maestro-calc/core';
import { concreteMix } from '@maestro-calc/data';
import { boardFeet } from '@maestro-calc/core/calculators/board-feet';
import { feetInches } from '@maestro-calc/core/calculators/feet-inches';
import { mulch } from '@maestro-calc/core/calculators/mulch';
import { rectangleArea } from '@maestro-calc/core/calculators/rectangle-area';
import { roofPitch } from '@maestro-calc/core/calculators/roof-pitch';
import { topsoil } from '@maestro-calc/core/calculators/topsoil';
import { describe, expect, it } from 'vitest';
import { METHODOLOGY_ROWS } from '../contract/__testing__/methodology-rows.ts';
import {
  isQuestionJob,
  JOB_IDS,
  JOBS,
  jobsOf,
  type Job,
  type JobCase,
  type JobId,
} from '../routing/jobs.ts';
import { LOCALES, pathOf, urlOf } from '../routing/routes.ts';
import { calendarDay } from './calendar-day.ts';
import { IRC_R905, roofPitchChartBasis, roofPitchReverse } from './roof-pitch-chart.ts';
import {
  decimalFeetChartBasis,
  decimalFeetChartTable,
  decimalFeetReverse,
  NIST_SP_811,
} from './decimal-feet-chart.ts';
import {
  NIST_SP_811_AREA,
  squareMetersChartBasis,
  squareMetersChartTable,
  squareMetersReverse,
} from './square-meters-chart.ts';
import { concrete } from './concrete.ts';
import { drywall } from './drywall.ts';
import { gravel } from './gravel.ts';
import { paint } from './paint.ts';
import { roofing } from './roofing.ts';
import { jobView, METHODOLOGY_ANCHOR } from './job-view.ts';
import { siteText } from './site-text.ts';

const PAIRS = JOB_IDS.flatMap((id) => LOCALES.map((locale) => [id, locale] as const));

/** The state the URL of a row carries is the state its engine makes of the case. */
const expectRoundTrip = (calculator: Job['calculator'], raw: JobCase, query: string): void => {
  if (calculator === 'concrete') {
    const state = concrete.validate(raw);
    expect(state.ok && decode(concrete, query).state).toEqual(state.ok && state.value);
    return;
  }
  if (calculator === 'roof-pitch') {
    const state = roofPitch.validate(raw);
    expect(state.ok && decode(roofPitch, query).state).toEqual(state.ok && state.value);
    return;
  }
  if (calculator === 'mulch') {
    const state = mulch.validate(raw);
    expect(state.ok && decode(mulch, query).state).toEqual(state.ok && state.value);
    return;
  }
  if (calculator === 'gravel') {
    const state = gravel.validate(raw);
    expect(state.ok && decode(gravel, query).state).toEqual(state.ok && state.value);
    return;
  }
  if (calculator === 'paint') {
    const state = paint.validate(raw);
    expect(state.ok && decode(paint, query).state).toEqual(state.ok && state.value);
    return;
  }
  if (calculator === 'drywall') {
    const state = drywall.validate(raw);
    expect(state.ok && decode(drywall, query).state).toEqual(state.ok && state.value);
    return;
  }
  if (calculator === 'topsoil') {
    const state = topsoil.validate(raw);
    expect(state.ok && decode(topsoil, query).state).toEqual(state.ok && state.value);
    return;
  }
  if (calculator === 'roofing') {
    const state = roofing.validate(raw);
    expect(state.ok && decode(roofing, query).state).toEqual(state.ok && state.value);
    return;
  }
  if (calculator === 'board-feet') {
    const state = boardFeet.validate(raw);
    expect(state.ok && decode(boardFeet, query).state).toEqual(state.ok && state.value);
    return;
  }
  if (calculator === 'feet-inches') {
    const state = feetInches.validate(raw);
    expect(state.ok && decode(feetInches, query).state).toEqual(state.ok && state.value);
    return;
  }
  const state = rectangleArea.validate(raw);
  expect(state.ok && decode(rectangleArea, query).state).toEqual(state.ok && state.value);
};

describe('job page view (growth plan › lever 1: figures from the engine)', () => {
  // hand-verified (PS 20-20, 2.2 and Table 3): a 2x4x8 is 64 ÷ 12 = 5.33 board feet, 42 ÷ 12 =
  // 3.50 at 1 1/2 by 3 1/2 in, 0.44 ft³ and 0.013 m³; 16 ft long, 128 ÷ 12 = 10.67 and 84 ÷ 12 = 7.00
  it('works the 2x4x8 out by its nominal and its dressed size, at every stock length', () => {
    const view = jobView('board-feet-2x4x8', 'en');
    expect(view.rows.map(({ label, cells }) => [label, ...cells])).toEqual([
      ['8 ft', '5.33', '3.50', '0.44'],
      ['10 ft', '6.67', '4.38', '0.56'],
      ['12 ft', '8.00', '5.25', '0.67'],
      ['14 ft', '9.33', '6.13', '0.78'],
      ['16 ft', '10.67', '7.00', '0.89'],
    ]);
    expect(view.rows[0].href).toBe('/board-feet-calculator?v=1');
    expect(view.lead).toBe('Thickness: 2 in, Width: 4 in, Length: 8 ft');
    expect(view.answer).toBe('5.33 board feet');
    expect(view.facts.map(({ value }) => value)).toEqual([
      '1 1/2 in × 3 1/2 in',
      '3.50',
      '0.44',
      '0.013',
    ]);
  });

  // hand-verified: a 2x12 12 ft long is 288 ÷ 12 = 24 board feet, 1 1/2 × 11 1/4 × 12 = 202.5,
  // ÷ 12 = 16.875, shown 16.88; a 1x6x8 is 48 ÷ 12 = 4, 3/4 × 5 1/2 × 8 = 33, ÷ 12 = 2.75
  it('works the 2x12x12 and the 1x6x8 out the same way', () => {
    expect(jobView('board-feet-2x12x12', 'es').rows[0].cells).toEqual(['24.00', '16.88', '2.00']);
    expect(jobView('board-feet-1x6x8', 'en').rows[0].cells).toEqual(['4.00', '2.75', '0.33']);
    expect(jobView('board-feet-1x6x8', 'en').facts[0]?.value).toBe('3/4 in × 5 1/2 in');
  });

  // hand-verified: 10 × 10 × 1/3 ft = 33.33 ft³, + 10% = 36.67 ft³ = 1.36 yd³;
  // bags of 0.60, 0.45 and 0.30 ft³: 61.1, 81.5 and 122.2, rounded up
  it('works the 10 × 10 slab out as the calculator does', () => {
    const view = jobView('concrete-slab-10x10', 'en');
    expect(view.rows[0]).toEqual({
      label: '10 ft × 10 ft × 4 in',
      // the width and the thickness are the calculator's defaults, so the link leaves them out
      href: '/concrete-calculator?v=1&l=120',
      cells: ['1.36', '62', '82', '123'],
    });
    expect(view.lead).toBe('Length × Width × Thickness: 10 ft × 10 ft × 4 in');
    expect(view.answer).toBe('1.36 cubic yards');
    expect(view.facts.map(({ value }) => value)).toEqual(['62', '82', '123']);
    expect(view.columns).toHaveLength(5);
  });

  // hand-verified in slab-cost.test.ts: installed $4.00 (This Old House) to $10.50 (Concrete
  // Network) a square foot; ready-mix $160.18 to $201.90 a cubic yard (Eagle Materials and Knife
  // River, third quarter 2026); 1 sq ft at 4 in with 10% extra is 0.01358 yd³, $2.18 to $2.74;
  // 20 × 20 ft = 400 sq ft × $4.00 to $10.50 = $1,600 to $4,200
  it.each(LOCALES)(
    'answers what a concrete slab costs with the published prices in %s',
    (locale) => {
      const view = jobView('concrete-slab-cost', locale);
      expect(view.answer).toContain('$4.00–$10.50');
      expect(view.facts.map(({ value }) => value)).toEqual([
        '$160.18–$201.90',
        '$2.18–$2.74',
        '$1,600–$4,200',
      ]);
      expect(view.columns).toHaveLength(5);
      expect(view.rows[0]).toEqual({
        label: '10 ft × 10 ft × 4 in',
        href: `${pathOf('concrete', locale)}?v=1&l=120`,
        cells: ['1.36', '$218–$274', '$400–$800', '$650–$1,050'],
      });
      expect(view.rows.map(({ label }) => label)).toEqual([
        '10 ft × 10 ft × 4 in',
        '12 ft × 12 ft × 4 in',
        '20 ft × 20 ft × 4 in',
        '24 ft × 24 ft × 4 in',
        '30 ft × 30 ft × 4 in',
        '30 ft × 40 ft × 4 in',
        '40 ft × 60 ft × 4 in',
      ]);
      expect(view.rows[4]?.cells).toEqual([
        '12.22',
        '$1,958–$2,468',
        '$3,600–$7,200',
        '$5,850–$9,450',
      ]);
      expect(view.rows[6]?.cells).toEqual([
        '32.59',
        '$5,221–$6,580',
        '$9,600–$19,200',
        '$15,600–$25,200',
      ]);
      expect(view.calculatorName).not.toBe('');
    },
  );

  // hand-verified: 4 × 4 × 1/3 ft = 5.33 ft³, + 10% = 5.87 ft³ = 0.22 yd³ (9.8, 13.0 and 19.6
  // bags); 30 × 30 × 1/2 ft = 450 ft³, + 10% = 495 ft³ = 18.33 yd³: 825, 1,100 and 1,650 bags
  it.each(LOCALES)('charts every slab with its source and its citation in %s', (locale) => {
    const view = jobView('concrete-slab-chart', locale);
    expect(view.rows).toHaveLength(JOBS['concrete-slab-chart'].cases.length);
    expect(view.rows[0]).toMatchObject({
      label: '4 ft × 4 ft × 4 in',
      cells: ['0.22', '10', '14', '20'],
    });
    expect(view.rows.at(-1)).toMatchObject({
      label: '30 ft × 30 ft × 6 in',
      cells: ['18.33', '825', '1,100', '1,650'],
    });
    const { chart } = view;
    expect(chart?.sources).toEqual([
      { label: siteText(locale)('page.concrete-slab-chart.source'), source: concreteMix.source },
    ]);
    expect(chart?.facts.map(({ value }) => value)).toEqual(['0.60 ft³', '0.45 ft³', '0.30 ft³']);
    expect(chart?.facts.map(({ label }) => label)).toEqual(view.columns.slice(2));
    expect(chart?.reverse).toBeUndefined();
    const url = urlOf(pathOf('concrete-slab-chart', locale));
    expect(chart?.url).toBe(url);
    expect(chart?.citation).toBe(
      `Maestro Calc, “${view.heading}”, ${calendarDay(JOBS['concrete-slab-chart'].updated, locale)}, ${url}`,
    );
    expect(view.intro).toMatch(/\S/);
  });

  // hand-verified: atan(6/12) = 26.565°, 6/12 = 50%; atan(1) = 45°; 12 × tan 60° = 20.785
  it.each(LOCALES)(
    'charts every roof pitch with the IRC source and its citation in %s',
    (locale) => {
      const view = jobView('roof-pitch-chart', locale);
      const { cases, updated } = JOBS['roof-pitch-chart'];
      expect(view.rows).toHaveLength(cases.length);
      expect(view.rows.find(({ label }) => label === '6/12')?.cells.slice(0, 3)).toEqual([
        '26.57°',
        '50.00%',
        '1.118',
      ]);
      const { chart } = view;
      expect(chart?.sources).toEqual([
        { label: siteText(locale)('page.roof-pitch-chart.source'), source: IRC_R905 },
      ]);
      expect(chart?.facts).toEqual(roofPitchChartBasis(cases, locale));
      expect(chart?.reverse).toEqual(roofPitchReverse(locale));
      expect(view.note).toBe(siteText(locale)('page.roof-pitch-chart.note'));
      const url = urlOf(pathOf('roof-pitch-chart', locale));
      expect(chart?.citation).toBe(
        `Maestro Calc, “${view.heading}”, ${calendarDay(updated, locale)}, ${url}`,
      );
      // the opening names the figures of two rows of the table, as the engine works them out
      const angleOf = (label: string) =>
        view.rows.find((row) => row.label === label)?.cells[0] ?? 'missing';
      expect(view.intro).toContain(`6/12`);
      expect(view.intro).toContain(angleOf('6/12'));
      expect(view.intro).toContain(`${angleOf('12/12').replace('.00°', '')}°`);
    },
  );

  it.each(LOCALES)(
    'charts decimal feet in feet and inches with the NIST source and its citation in %s',
    (locale) => {
      const view = jobView('decimal-feet-chart', locale);
      const { cases, updated } = JOBS['decimal-feet-chart'];
      expect(view.rows).toEqual(decimalFeetChartTable(cases, locale).rows);
      const { chart } = view;
      expect(chart?.sources).toEqual([
        { label: siteText(locale)('page.decimal-feet-chart.source'), source: NIST_SP_811 },
      ]);
      expect(chart?.facts).toEqual(decimalFeetChartBasis(locale));
      expect(chart?.reverse).toEqual(decimalFeetReverse(locale));
      expect(view.note).toBe(siteText(locale)('page.decimal-feet-chart.note'));
      const url = urlOf(pathOf('decimal-feet-chart', locale));
      expect(chart?.citation).toBe(
        `Maestro Calc, “${view.heading}”, ${calendarDay(updated, locale)}, ${url}`,
      );
      expect(view.cta).toBe(pathOf('feet-inches', locale));
    },
  );

  it.each(LOCALES)(
    'charts square feet in square meters with the NIST source and its citation in %s',
    (locale) => {
      const id = 'square-feet-to-square-meters-chart';
      const view = jobView(id, locale);
      const { cases, updated } = JOBS[id];
      expect(view.rows).toEqual(squareMetersChartTable(cases, locale).rows);
      const { chart } = view;
      expect(chart?.sources).toEqual([
        { label: siteText(locale)(`page.${id}.source`), source: NIST_SP_811_AREA },
      ]);
      expect(chart?.facts).toEqual(squareMetersChartBasis(locale));
      expect(chart?.reverse).toEqual(squareMetersReverse(locale));
      expect(view.note).toBe(siteText(locale)(`page.${id}.note`));
      const url = urlOf(pathOf(id, locale));
      expect(chart?.citation).toBe(
        `Maestro Calc, “${view.heading}”, ${calendarDay(updated, locale)}, ${url}`,
      );
      expect(view.cta).toBe(pathOf('rectangle-area', locale));
    },
  );

  it.each(LOCALES)('gives no chart block to a job of one size in %s', (locale) => {
    expect(jobView('concrete-slab-10x10', locale).chart).toBeUndefined();
  });

  // hand-verified: 20 × 20 × 1/3 ft = 133.33 ft³, + 10% = 146.67 ft³ = 5.43 yd³;
  // bags of 0.60, 0.45 and 0.30 ft³: 244.4, 325.9 and 488.9, rounded up
  it('works the 20 × 20 slab, 4 in thick, out as the calculator does', () => {
    const [first] = jobView('concrete-slab-20x20', 'en').rows;
    expect(first).toMatchObject({
      label: '20 ft × 20 ft × 4 in',
      cells: ['5.43', '245', '326', '489'],
    });
  });

  // hand-verified: 10 × 20 × 1/3 ft = 66.67 ft³, + 10% = 73.33 ft³ = 2.72 yd³;
  // bags of 0.60, 0.45 and 0.30 ft³: 122.2, 163.0 and 244.4, rounded up
  it('works the 10 × 20 slab, 4 in thick, out as the calculator does', () => {
    const [first] = jobView('concrete-slab-10x20', 'en').rows;
    expect(first).toEqual({
      label: '10 ft × 20 ft × 4 in',
      href: '/concrete-calculator?v=1&l=120&w=240',
      cells: ['2.72', '123', '163', '245'],
    });
  });

  // hand-verified: a footing 20 ft long, 16 in wide and 8 in deep is 20 × 4/3 × 2/3 = 17.78 ft³,
  // + 10% = 19.56 ft³ = 0.72 yd³; bags of 0.60, 0.45 and 0.30 ft³: 32.6, 43.5 and 65.2, rounded
  // up. 100 ft of 20 × 10 in is 100 × 5/3 × 5/6 = 138.89 ft³, + 10% = 152.78 ft³ = 5.66 yd³,
  // bags 254.6, 339.5, 509.3
  it('works the footings out as the calculator does, the length first', () => {
    const view = jobView('concrete-footing-16x8', 'en');
    expect(view.rows[0]).toEqual({
      label: '20 ft × 16 in × 8 in',
      // the width and the depth of the footing are the calculator's defaults
      href: '/concrete-calculator?v=1&sh=footing&l=240',
      cells: ['0.72', '33', '44', '66'],
    });
    expect(view.lead).toBe('Length × Footing width × Footing depth: 20 ft × 16 in × 8 in');
    expect(view.answer).toBe('0.72 cubic yards');
    expect(jobView('concrete-footing-20x10', 'es').rows.at(-1)).toMatchObject({
      label: '100 ft × 20 in × 10 in',
      cells: ['5.66', '255', '340', '510'],
    });
  });

  // hand-verified: 650 ft² as 26 × 25 ft, × 1/3 ft = 216.67 ft³ (8.02 yd³), + 10% = 238.33 ft³ =
  // 8.83 yd³; bags of 0.60, 0.45 and 0.30 ft³: 397.2, 529.6 and 794.4, rounded up. At 5 in,
  // 270.83 ft³ + 10% = 297.92 ft³ = 11.03 yd³; at 6 in, 325 ft³ + 10% = 357.5 ft³ = 13.24 yd³
  it('works the 650 sq ft slab out as a 26 × 25 ft slab', () => {
    const view = jobView('concrete-slab-650-sq-ft', 'en');
    expect(view.rows[0]).toEqual({
      label: '26 ft × 25 ft × 4 in',
      href: '/concrete-calculator?v=1&l=312&w=300',
      cells: ['8.83', '398', '530', '795'],
    });
    expect(view.rows.map(({ cells }) => cells[0])).toEqual(['8.83', '11.03', '13.24']);
    expect(view.lead).toBe('Length × Width × Thickness: 26 ft × 25 ft × 4 in');
    expect(view.answer).toBe('8.83 cubic yards');
    expect(view.intro).toContain('650');
    expect(view.intro).toContain('26 by 25 ft');
  });

  // hand-verified: 500 ft² (25 × 20 ft) × 1/3 ft = 166.67 ft³ (6.17 yd³), + 10% = 183.33 ft³ =
  // 6.79 yd³, bags 305.6, 407.4, 611.1; 1000 ft² (40 × 25 ft) = 333.33 ft³ (12.35 yd³), + 10% =
  // 366.67 ft³ = 13.58 yd³, bags 611.1, 814.8, 1222.2
  it('works the 500 and the 1000 sq ft slabs out in both languages', () => {
    for (const locale of LOCALES) {
      expect(jobView('concrete-slab-500-sq-ft', locale).rows[0]).toMatchObject({
        label: '25 ft × 20 ft × 4 in',
        cells: ['6.79', '306', '408', '612'],
      });
      expect(jobView('concrete-slab-1000-sq-ft', locale).rows[0]).toMatchObject({
        label: '40 ft × 25 ft × 4 in',
        cells: ['13.58', '612', '815', '1,223'],
      });
    }
    expect(jobView('concrete-slab-650-sq-ft', 'es').intro).toContain('26 por 25 ft');
  });

  // hand-verified: 9 × 9 ft × 1/3 ft = 27 ft³ = 1 yd³, no extra; 27 ÷ 1.5 = 18, 27 ÷ 2 = 13.5 so 14,
  // 27 ÷ 3 = 9; two yards (8 in deep) 36, 27, 18; three yards (12 in deep) 54, 40.5 so 41, 27
  it('works the bags of mulch in a cubic yard out as the mulch calculator does', () => {
    const view = jobView('mulch-bags-per-yard', 'en');
    expect(view.lead).toBe('Length × Width × Depth: 9 ft × 9 ft × 4 in');
    expect(view.answer).toBe('27.00 cubic feet');
    expect(view.facts).toEqual([
      { label: 'Mulch, 1.5 cu ft bags', value: '18' },
      { label: 'Mulch, 2 cu ft bags', value: '14' },
      { label: 'Mulch, 3 cu ft bags', value: '9' },
    ]);
    expect(view.columns).toEqual([
      'Bag size',
      'Bags for 1 yd³',
      'Bags for 2 yd³',
      'Bags for 3 yd³',
    ]);
    expect(view.rows).toEqual([
      {
        label: '1.5 cu ft',
        href: '/mulch-calculator?v=1&l=108&w=108&d=4&ws=0&bg=1-5',
        cells: ['18', '36', '54'],
      },
      {
        label: '2 cu ft',
        href: '/mulch-calculator?v=1&l=108&w=108&d=4&ws=0',
        cells: ['14', '27', '41'],
      },
      {
        label: '3 cu ft',
        href: '/mulch-calculator?v=1&l=108&w=108&d=4&ws=0&bg=3',
        cells: ['9', '18', '27'],
      },
    ]);
    expect(view.calculatorName).toBe('Mulch Calculator');
    expect(view.methodology).toBe('/methodology#mulch');
    const es = jobView('mulch-bags-per-yard', 'es');
    expect(es.answer).toBe('27.00 pies cúbicos');
    expect(es.columns[1]).toBe('Bolsas para 1 yd³');
  });

  it.each(LOCALES)('says the mulch figures of the engine in the copy of %s', (locale) => {
    const view = jobView('mulch-bags-per-yard', locale);
    // the intro and the note restate the bag counts: they must be the engine's
    for (const { value } of view.facts) expect(view.intro).toContain(` ${value} `);
    expect(view.note).toContain('27');
    expect(view.note).toContain('13.5');
    expect(view.note).toContain(view.facts[1]?.value ?? '');
  });

  // hand-verified: 10 × 20 × 1/3 ft = 66.67 ft³ = 2.47 yd³, + 5% = 2.59 yd³; compacted at
  // 3,660 lb/yd³ = 9,489 lb = 4.74 tons (4.30 t); the yard sells loose at 2,580 lb/yd³: 3.68 yd³.
  // At 6 in: 7.12 tons, 5.52 yd³; at 8 in: 9.49 tons, 7.36 yd³
  it('works the gravel for a 10 × 20 ft driveway out as the gravel calculator does', () => {
    const view = jobView('gravel-driveway-10x20', 'en');
    expect(view.lead).toBe('Length × Width × Depth: 10 ft × 20 ft × 4 in');
    expect(view.answer).toBe('4.74 tons');
    expect(view.facts).toEqual([
      { label: 'Volume to order (cubic yards)', value: '3.68' },
      { label: 'Gravel needed (metric tonnes)', value: '4.30' },
    ]);
    expect(view.columns).toEqual([
      'Length × Width × Depth',
      'Gravel needed (tons)',
      'Volume to order (cubic yards)',
      'Gravel needed (metric tonnes)',
    ]);
    expect(view.rows).toEqual([
      {
        label: '10 ft × 20 ft × 4 in',
        href: '/gravel-calculator?v=1&l=120&w=240',
        cells: ['4.74', '3.68', '4.30'],
      },
      {
        label: '10 ft × 20 ft × 6 in',
        href: '/gravel-calculator?v=1&l=120&w=240&d=6',
        cells: ['7.12', '5.52', '6.46'],
      },
      {
        label: '10 ft × 20 ft × 8 in',
        href: '/gravel-calculator?v=1&l=120&w=240&d=8',
        cells: ['9.49', '7.36', '8.61'],
      },
    ]);
    expect(view.calculatorName).toBe('Gravel Calculator');
    expect(view.methodology).toBe('/methodology#gravel');
    // hand-verified: 12 × 50 × 1/3 ft = 200 ft³ = 7.41 yd³, + 5% = 7.78 yd³ = 14.23 tons, 11.03 yd³
    const long = jobView('gravel-driveway-12x50', 'es');
    expect(long.answer).toBe('14.23 toneladas');
    expect(long.rows[0].cells).toEqual(['14.23', '11.03', '12.91']);
    expect(long.methodology).toBe('/es/metodologia#grava');
  });

  // hand-verified: walls 2 × (12 + 12) × 8 = 384 ft², less a 20 ft² door and two 15 ft² windows =
  // 334 ft²; two coats at 350 ft² a gallon: 668 ÷ 350 = 1.91 gal, 2 cans. At 9 ft: 382 ft², 2.18
  // gal, 3 cans; at 10 ft: 430 ft², 2.46 gal, 3 cans
  it('works the paint for a 12 × 12 ft room out as the paint calculator does', () => {
    const view = jobView('paint-room-12x12', 'en');
    expect(view.lead).toBe('Room length × Room width × Wall height: 12 ft × 12 ft × 8 ft');
    expect(view.answer).toBe('1.91 gallons');
    expect(view.facts).toEqual([
      { label: 'Paint, gallon cans', value: '2' },
      { label: 'Area to paint (square feet)', value: '334.00' },
    ]);
    expect(view.columns).toEqual([
      'Room length × Room width × Wall height',
      'Paint needed (gallons)',
      'Paint, gallon cans',
      'Area to paint (square feet)',
    ]);
    expect(view.rows.map(({ label, cells }) => [label, ...cells])).toEqual([
      ['12 ft × 12 ft × 8 ft', '1.91', '2', '334.00'],
      ['12 ft × 12 ft × 9 ft', '2.18', '3', '382.00'],
      ['12 ft × 12 ft × 10 ft', '2.46', '3', '430.00'],
    ]);
    // the length, the width and the height of 8 ft are the calculator's defaults
    expect(view.rows[0].href).toBe('/paint-calculator?v=1');
    expect(view.methodology).toBe('/methodology#paint');
    // hand-verified: 2 × 20 × 8 = 320 ft² − 50 = 270 ft², × 2 ÷ 350 = 1.54 gal; 2 × 22 × 8 = 352 −
    // 50 = 302 ft², 1.73 gal
    expect(jobView('paint-room-10x10', 'es').answer).toBe('1.54 galones');
    expect(jobView('paint-room-10x12', 'en').rows[0].cells).toEqual(['1.73', '2', '302.00']);
  });

  // hand-verified: walls 384 − 50 = 334 ft² + a 144 ft² ceiling = 478 ft²; + 10% = 525.8 ft²:
  // 16.4 sheets of 32 ft², so 17, and 10.95 of 48 ft², so 11; 4.30 gal of compound (1 pail of
  // 4.5 gal) and 176.86 ft of tape (1 roll of 500 ft)
  it('works the drywall for a 12 × 12 ft room out as the drywall calculator does', () => {
    const view = jobView('drywall-room-12x12', 'en');
    expect(view.lead).toBe('Room length × Room width × Wall height: 12 ft × 12 ft × 8 ft');
    expect(view.answer).toBe('17 sheets of 4 × 8 ft');
    expect(view.facts).toEqual([
      { label: 'Drywall, 4 × 12 ft sheets', value: '11' },
      { label: 'Area to cover (square feet)', value: '478.00' },
      { label: 'Joint compound, 4.5 gal pails', value: '1' },
      { label: 'Paper joint tape, 500 ft rolls', value: '1' },
    ]);
    expect(view.columns).toEqual([
      'Room length × Room width × Wall height',
      'Area to cover (square feet)',
      'Drywall, 4 × 8 ft sheets',
      'Drywall, 4 × 12 ft sheets',
    ]);
    expect(view.rows.map(({ label, cells }) => [label, ...cells])).toEqual([
      ['12 ft × 12 ft × 8 ft', '478.00', '17', '11'],
      ['12 ft × 12 ft × 9 ft', '526.00', '19', '13'],
      ['12 ft × 12 ft × 10 ft', '574.00', '20', '14'],
    ]);
    expect(view.rows[0].href).toBe('/drywall-calculator?v=1');
    expect(view.methodology).toBe('/methodology#drywall');
    // hand-verified: 10 × 10: 320 − 50 + 100 = 370 ft², + 10% = 407 ft²: 12.7 so 13 and 8.5 so 9;
    // 10 × 12: 352 − 50 + 120 = 422 ft², + 10% = 464.2 ft²: 14.5 so 15 and 9.7 so 10
    const small = jobView('drywall-room-10x10', 'es');
    expect(small.answer).toBe('13 placas de 4 × 8 ft');
    expect(small.rows[0].cells).toEqual(['370.00', '13', '9']);
    expect(jobView('drywall-room-10x12', 'en').rows[0].cells).toEqual(['422.00', '15', '10']);
  });

  // content audit 2026-11-10: four drywall intros closed on the same sentence about long sheets,
  // which the tips now say with the room's own count; the intro gives that count instead
  it.each(LOCALES)('opens the drywall rooms with the sheets of the engine in %s', (locale) => {
    const rooms = [
      'drywall-room-10x10',
      'drywall-room-10x12',
      'drywall-room-12x12',
      'drywall-room-12x16',
    ] as const;
    for (const id of rooms) {
      const view = jobView(id, locale);
      const [, small, large] = view.rows[0].cells;
      expect(view.intro, id).toMatch(
        new RegExp(` ${String(small)} (sheets of|placas de) 4 × 8 ft`),
      );
      expect(view.intro, id).toContain(` ${String(large)} `);
      expect(view.intro, id).toContain('8 ft');
    }
    // hand-verified: 12 × 16: 448 − 50 + 192 = 590 ft², + 10% = 649 ft²: 20.3 so 21 and 13.5 so 14
    expect(jobView('drywall-room-12x16', 'en').intro).toContain('21 sheets of 4 × 8 ft, or 14');
  });

  // the notes restate the defaults of the engines: they must be the engine's
  it.each(LOCALES)(
    'states the defaults of the gravel, paint and drywall engines in %s',
    (locale) => {
      const defaultOf = (inputs: readonly { key: string; default: unknown }[], key: string) =>
        String(inputs.find((input) => input.key === key)?.default);
      expect(defaultOf(gravel.inputs, 'waste')).toBe('5');
      expect(defaultOf(gravel.inputs, 'placement')).toBe('compacted');
      expect(jobView('gravel-driveway-10x20', locale).note).toContain('5%');
      expect(defaultOf(paint.inputs, 'doors')).toBe('1');
      expect(defaultOf(paint.inputs, 'windows')).toBe('2');
      expect(defaultOf(paint.inputs, 'coats')).toBe('2');
      expect(defaultOf(drywall.inputs, 'waste')).toBe('10');
      expect(defaultOf(drywall.inputs, 'surfaces')).toBe('walls-ceiling');
      expect(defaultOf(drywall.inputs, 'doors')).toBe('1');
      expect(defaultOf(drywall.inputs, 'windows')).toBe('2');
      // a room page states the 350 sq ft per gallon and the 10% in its worked steps instead
      // (content audit 2026-11-10, `job-room.test.ts`)
      for (const id of [...jobsOf('gravel'), ...jobsOf('paint'), ...jobsOf('drywall')]) {
        expect(jobView(id, locale).intro, id).toMatch(/\S/);
      }
    },
  );

  // hand-verified: 4 × 8 × 1 ft = 32 ft³, + 10% for settling = 35.2 ft³ = 1.30 yd³; 35.2 ÷ 0.75 =
  // 46.9 so 47 bags, ÷ 1.5 = 23.5 so 24. At 18 in: 52.8 ft³ = 1.96 yd³, 70.4 so 71, 35.2 so 36; at
  // 24 in: 70.4 ft³ = 2.61 yd³, 93.9 so 94, 46.9 so 47
  it('works the soil for a 4 × 8 ft raised bed out as the topsoil calculator does', () => {
    const view = jobView('topsoil-raised-bed-4x8', 'en');
    expect(view.lead).toBe('Length × Width × Depth: 4 ft × 8 ft × 12 in');
    expect(view.answer).toBe('1.30 cubic yards');
    expect(view.facts).toEqual([
      { label: 'Topsoil needed (cubic feet)', value: '35.20' },
      { label: 'Topsoil, 0.75 cu ft bags', value: '47' },
      { label: 'Topsoil, 1.5 cu ft bags', value: '24' },
    ]);
    expect(view.columns).toEqual([
      'Length × Width × Depth',
      'Topsoil needed (cubic yards)',
      'Topsoil needed (cubic feet)',
      'Topsoil, 0.75 cu ft bags',
      'Topsoil, 1.5 cu ft bags',
    ]);
    expect(view.rows.map(({ label, cells }) => [label, ...cells])).toEqual([
      ['4 ft × 8 ft × 12 in', '1.30', '35.20', '47', '24'],
      ['4 ft × 8 ft × 18 in', '1.96', '52.80', '71', '36'],
      ['4 ft × 8 ft × 24 in', '2.61', '70.40', '94', '47'],
    ]);
    expect(view.rows[0].href).toBe('/topsoil-calculator?v=1&l=48&w=96&d=12');
    expect(view.calculatorName).toBe('Topsoil Calculator');
    expect(view.methodology).toBe('/methodology#topsoil');
    // hand-verified: 4 × 4 × 1 = 16 ft³ + 10% = 17.6 ft³ = 0.65 yd³, 23.5 so 24 and 11.7 so 12
    const small = jobView('topsoil-raised-bed-4x4', 'es');
    expect(small.answer).toBe('0.65 yardas cúbicas');
    expect(small.rows[0].cells).toEqual(['0.65', '17.60', '24', '12']);
    expect(small.methodology).toBe('/es/metodologia#tierra-para-jardin');
    // hand-verified: 10 × 10 × 1/3 ft = 33.33 ft³ + 10% = 36.67 ft³ = 1.36 yd³, 48.9 so 49 and
    // 24.4 so 25; 20 × 20 at 8 in: 266.67 ft³ + 10% = 293.33 ft³ = 10.86 yd³, 391.1 so 392, 195.6
    // so 196
    expect(jobView('topsoil-10x10', 'en').rows[0].cells).toEqual(['1.36', '36.67', '49', '25']);
    expect(jobView('topsoil-10x10', 'en').rows[0].href).toBe('/topsoil-calculator?v=1');
    expect(jobView('topsoil-20x20', 'en').rows.at(-1)?.cells).toEqual([
      '10.86',
      '293.33',
      '392',
      '196',
    ]);
  });

  // hand-verified: 24 × 24 = 576 ft² × √(1 + (6/12)²) = 576 × 1.11803 = 643.99 ft² = 6.44 squares;
  // + 10% = 708.39 ft² ÷ 33.33 = 21.3 so 22 bundles; a roll covers (250 ft − 4 in) × (48 − 2 in) =
  // 957.06 ft², so 1 roll. At 8 in 12: × 1.20185 = 692.27 ft², 6.92 squares, 22.8 so 23 bundles; at
  // 10 in 12: × 1.30171 = 749.78 ft², 7.50 squares, 24.7 so 25 bundles
  it('works the shingles for a 24 × 24 ft roof out as the roofing calculator does', () => {
    const view = jobView('roofing-24x24', 'en');
    expect(view.lead).toBe(
      'Length (with overhangs): 24 ft, Width (with overhangs): 24 ft, Pitch (rise in 12): 6',
    );
    expect(view.answer).toBe('6.44 squares');
    expect(view.facts).toEqual([
      { label: 'Asphalt shingles, bundles (3 a square)', value: '22' },
      { label: 'Synthetic underlayment, 10-square rolls', value: '1' },
      { label: 'Roof area (square feet)', value: '643.99' },
    ]);
    expect(view.columns).toEqual([
      'Pitch (rise in 12)',
      'Roof area (squares)',
      'Roof area (square feet)',
      'Asphalt shingles, bundles (3 a square)',
      'Synthetic underlayment, 10-square rolls',
    ]);
    expect(view.rows.map(({ label, cells }) => [label, ...cells])).toEqual([
      ['6 in 12 pitch', '6.44', '643.99', '22', '1'],
      ['8 in 12 pitch', '6.92', '692.27', '23', '1'],
      ['10 in 12 pitch', '7.50', '749.78', '25', '1'],
    ]);
    // the pitch of 6 in 12 is the calculator's default
    expect(view.rows[0].href).toBe('/roofing-calculator?v=1&l=288&w=288');
    expect(view.calculatorName).toBe('Roofing Calculator');
    expect(view.methodology).toBe('/methodology#roofing');
    // hand-verified: 30 × 40 at 6 in 12 = 1,341.64 ft², 13.42 squares, 45 bundles, 1.54 so 2 rolls
    // (the calculator's own example); 30 × 50 at 10 in 12 = 1,952.56 ft², 19.53 squares, 64.4 so 65
    // bundles, 2.24 so 3 rolls
    const house = jobView('roofing-30x40', 'es');
    expect(house.answer).toBe('13.42 cuadrados');
    expect(house.rows[0].label).toBe('pendiente de 6 en 12');
    expect(house.rows[0].cells).toEqual(['13.42', '1,341.64', '45', '2']);
    expect(house.methodology).toBe('/es/metodologia#tejas');
    expect(jobView('roofing-30x50', 'en').rows.at(-1)?.cells).toEqual([
      '19.53',
      '1,952.56',
      '65',
      '3',
    ]);
  });

  // hand-verified: 29 1/4 in = 29.25 in; ÷ 2 = 14.625 in = 14 5/8 in = 1 ft 2 5/8 in, 14.63 in to
  // two places, × 0.0254 = 0.371475 m; ÷ 3 = 9.75 in = 9 3/4 in, 0.24765 m; ÷ 4 = 7.3125 in =
  // 7 5/16 in, 7.31 in, 0.185738 m
  it('works 29 1/4 in divided by 2 out as the feet and inches calculator does', () => {
    const view = jobView('divide-29-1-4-in-by-2', 'en');
    expect(view.lead).toBe('First length: 29 1/4 in ÷ 2');
    expect(view.answer).toBe('29 1/4 in divided into 2 equal parts is 14 5/8 in each.');
    expect(view.facts).toEqual([
      { label: 'Result (feet and inches)', value: '1 ft 2 5/8 in' },
      { label: 'Result (inches)', value: '14.63' },
      { label: 'Result (meters)', value: '0.371' },
    ]);
    expect(view.columns).toEqual([
      'Number',
      'On the tape (inches, to 1/16)',
      'Result (feet and inches)',
      'Result (inches)',
      'Result (meters)',
    ]);
    expect(view.rows.map(({ label, cells }) => [label, ...cells])).toEqual([
      ['÷ 2', '14 5/8 in', '1 ft 2 5/8 in', '14.63', '0.371'],
      ['÷ 3', '9 3/4 in', '9 3/4 in', '9.75', '0.248'],
      ['÷ 4', '7 5/16 in', '7 5/16 in', '7.31', '0.186'],
    ]);
    expect(view.rows[0].href?.split('?')[0]).toBe('/feet-and-inches-calculator');
    expect(view.calculatorName).toBe('Feet and Inches Calculator');
    expect(view.methodology).toBe('/methodology#feet-and-inches');
    expect(view.intro).toContain('29 1/4 in');
  });

  // hand-verified: 9 ft 6 in = 114 in; ÷ 2 = 57 in = 4 ft 9 in, × 0.0254 = 1.4478 m; ÷ 3 = 38 in =
  // 3 ft 2 in; ÷ 4 = 28.5 in = 2 ft 4 1/2 in. 22 in ÷ 10 = 2.2 in, 35.2 sixteenths so 2 3/16 in,
  // 0.05588 m. 23 5/8 in ÷ 2 = 11.8125 in = 11 13/16 in. 35.5 in ÷ 2 = 17.75 in = 17 3/4 in.
  // 3 ft 9 in = 45 in; ÷ 2 = 22.5 in = 1 ft 10 1/2 in, 0.5715 m
  it('answers a length in feet in feet and inches, and a length in inches on the tape', () => {
    const feet = jobView('divide-9-ft-6-in-by-2', 'es');
    expect(feet.answer).toBe('9 ft 6 in dividido en 2 partes iguales da 4 ft 9 in cada una.');
    expect(feet.facts.map(({ value }) => value)).toEqual(['57 in', '57.00', '1.448']);
    expect(feet.facts[0]?.label).toBe('En la cinta (pulgadas, a 1/16)');
    expect(feet.rows.map(({ cells }) => cells[1])).toEqual([
      '4 ft 9 in',
      '3 ft 2 in',
      '2 ft 4 1/2 in',
    ]);
    expect(feet.methodology).toBe('/es/metodologia#pies-y-pulgadas');
    const tenth = jobView('divide-22-in-by-10', 'en');
    expect(tenth.answer).toBe('22 in divided into 10 equal parts is 2 3/16 in each.');
    expect(tenth.rows.map(({ label }) => label)).toEqual(['÷ 10', '÷ 2', '÷ 3', '÷ 4']);
    expect(tenth.rows[0].cells).toEqual(['2 3/16 in', '2 3/16 in', '2.20', '0.056']);
    expect(jobView('divide-23-5-8-in-by-2', 'en').answer).toBe(
      '23 5/8 in divided into 2 equal parts is 11 13/16 in each.',
    );
    expect(jobView('divide-35-5-in-by-2', 'en').answer).toBe(
      '35.5 in divided into 2 equal parts is 17 3/4 in each.',
    );
    expect(jobView('divide-3-ft-9-in-by-2', 'en').facts.map(({ value }) => value)).toEqual([
      '22 1/2 in',
      '22.50',
      '0.572',
    ]);
  });

  // hand-verified: 7.5 in over 12 in is t = 0.625, atan(0.625) = 32.005°; √(1 + 0.390625) = 1.17925;
  // a 12 ft run is 14.151 ft of rafter, × 0.3048 = 4.313 m
  it('works the 7.5/12 pitch out as the roof pitch calculator does', () => {
    const view = jobView('roof-pitch-7-5-12', 'en');
    expect(view.answer).toBe('32.01°');
    expect(view.lead).toBe('Rise: 7.5 in, Run: 12 in');
    expect(view.facts.map(({ value }) => value)).toEqual(['7.50 in 12', '1.179']);
    expect(view.rows.find(({ label }) => label === '12 ft')?.cells).toEqual(['14.15', '4.31']);
  });

  it.each(LOCALES)('states the defaults of the topsoil and roofing engines in %s', (locale) => {
    const defaultOf = (inputs: readonly { key: string; default: unknown }[], key: string) =>
      String(inputs.find((input) => input.key === key)?.default);
    expect(defaultOf(topsoil.inputs, 'waste')).toBe('10');
    expect(jobView('topsoil-10x10', locale).note).toContain('10%');
    expect(defaultOf(roofing.inputs, 'waste')).toBe('10');
    expect(jobView('roofing-24x24', locale).note).toContain('10%');
    // content audit 2026-11-10: the bundles to a square and the rounding are in the worked steps
    expect(jobView('roofing-24x24', locale).note).not.toMatch(
      /(three to a square|tres por cuadrado)/,
    );
    for (const id of [...jobsOf('topsoil'), ...jobsOf('roofing')]) {
      expect(jobView(id, locale).intro, id).toMatch(/\S/);
    }
  });

  // hand-verified: π × (0.5 ft)² × 4 ft = 3.14 ft³, + 10% = 3.46 ft³ = 0.13 yd³; 5.8, 7.7, 11.5 bags
  it('works a 12 in tube, 48 in deep, out as the calculator does', () => {
    const rows = jobView('concrete-tube-12', 'es').rows;
    expect(rows.at(-1)).toEqual({
      label: '12 in × 48 in',
      href: '/es/calculadora-de-concreto?v=1&sh=column&h=48',
      cells: ['0.13', '6', '8', '12'],
    });
  });

  // hand-verified: 6 in over 12 in is t = 1/2, atan(1/2) = 26.565°; √(1 + 1/4) = 1.11803;
  // a 12 ft run is 12 × 1.11803 = 13.416 ft of rafter, × 0.3048 = 4.089 m
  it('works the 6/12 pitch out as the roof pitch calculator does', () => {
    const view = jobView('roof-pitch-6-12', 'en');
    expect(view.answer).toBe('26.57°');
    expect(view.lead).toBe('Rise: 6 in, Run: 12 in');
    expect(view.facts).toEqual([
      { label: 'Pitch (rise in inches per 12 in of run)', value: '6.00 in 12' },
      { label: 'Rafter multiplier (feet of rafter per foot of run)', value: '1.118' },
    ]);
    expect(view.columns).toEqual([
      'Rafter run (half the span)',
      'Rafter length (feet)',
      'Rafter length (meters)',
    ]);
    expect(view.rows.find(({ label }) => label === '12 ft')).toEqual({
      label: '12 ft',
      // the rise, the run and the rafter run are the calculator's defaults: only the overhang is set
      href: '/roof-pitch-calculator?v=1&oh=0',
      cells: ['13.42', '4.09'],
    });
    expect(view.calculatorName).toBe('Roof Pitch Calculator');
  });

  // hand-verified: 12 in 12 is t = 1, atan(1) = 45°, √2 = 1.414
  it('works the 12/12 pitch out in Spanish', () => {
    const view = jobView('roof-pitch-12-12', 'es');
    expect(view.answer).toBe('45.00°');
    expect(view.facts.map(({ value }) => value)).toEqual(['12.00 en 12', '1.414']);
  });

  // hand-verified: atan(9/12) = 36.870°, atan(10/12) = 39.806°, atan(3/12) = 14.036°,
  // atan(5/12) = 22.620°, atan(7/12) = 30.256°
  it.each([
    ['roof-pitch-3-12', '14.04°'],
    ['roof-pitch-5-12', '22.62°'],
    ['roof-pitch-7-12', '30.26°'],
    ['roof-pitch-9-12', '36.87°'],
    ['roof-pitch-10-12', '39.81°'],
  ] as const)('works the angle of %s out as %s in both languages', (id, angle) => {
    for (const locale of LOCALES) expect(jobView(id, locale).answer).toBe(angle);
  });

  // hand-verified: 12 × 14 = 168 ft²; × 0.09290304 = 15.6077 m²; ÷ 9 = 18.667 yd²;
  // 12 × 15 = 180 ft² and 12 × 16 = 192 ft²
  it('works the 12 × 14 area out as the square footage calculator does', () => {
    const view = jobView('square-feet-12x14', 'en');
    expect(view.lead).toBe('Area = Length × Width = 12 ft × 14 ft');
    expect(view.answer).toBe('168.00 square feet');
    expect(view.facts).toEqual([
      { label: 'Area (square meters)', value: '15.61' },
      { label: 'Area (square yards)', value: '18.67' },
    ]);
    expect(view.columns).toEqual([
      'Length × Width',
      'Area (square feet)',
      'Area (square meters)',
      'Area (square yards)',
    ]);
    expect(view.rows[0]).toEqual({
      label: '12 ft × 14 ft',
      href: '/square-footage-calculator?v=1&l=144&w=168',
      cells: ['168.00', '15.61', '18.67'],
    });
    expect(view.rows.map(({ label }) => label)).toEqual([
      '12 ft × 14 ft',
      '12 ft × 15 ft',
      '12 ft × 16 ft',
    ]);
    expect(view.rows.map(({ cells }) => cells[0])).toEqual(['168.00', '180.00', '192.00']);
    expect(view.calculatorName).toBe('Square Footage Calculator');
    expect(view.methodology).toBe('/methodology#square-footage');
  });

  // hand-verified: 5 × 5 = 25 ft² = 2.32 m² = 2.78 yd²; 30 × 12 = 360 ft² = 33.45 m² = 40 yd²
  it('works the 5 × 5 and the 12 × 30 areas out in Spanish', () => {
    const small = jobView('square-feet-5x5', 'es');
    expect(small.answer).toBe('25.00 pies cuadrados');
    expect(small.lead).toBe('Área = Largo × Ancho = 5 ft × 5 ft');
    expect(small.facts.map(({ value }) => value)).toEqual(['2.32', '2.78']);
    expect(small.rows[0].href).toMatch(/^\/es\/calculadora-de-pies-cuadrados\?/);
    const long = jobView('square-feet-12x30', 'es');
    expect(long.rows[0].cells).toEqual(['360.00', '33.45', '40.00']);
  });

  it.each(LOCALES)('opens each square footage job with its own lead sentence in %s', (locale) => {
    const intros = jobsOf('rectangle-area').map((id) => jobView(id, locale).intro);
    for (const intro of intros) expect(intro).toMatch(/\S/);
    expect(new Set(intros).size).toBe(intros.length);
    expect(jobView('concrete-slab-10x10', locale).intro).toContain('10 ');
    expect(jobView('concrete-slab-1000-sq-ft', locale).intro).toMatch(/\S/);
    expect(jobView('mulch-bags-per-yard', locale).intro).toMatch(/\S/);
    expect(jobView('square-feet-12x14', locale).note).toContain('0.09290304');
  });

  // the cubic yard weight chart has a row per material, the decimal feet chart links only its
  // lengths of a foot or more and the square meters chart links none (their own tests say so)
  it.each(
    PAIRS.filter(
      ([id]) =>
        id !== 'cubic-yard-weight-chart' &&
        id !== 'decimal-feet-chart' &&
        id !== 'square-feet-to-square-meters-chart',
    ),
  )('links every row of %s in %s to the calculator in that case', (id, locale) => {
    const view = jobView(id, locale);
    expect(view.rows).toHaveLength(JOBS[id].cases.length);
    view.rows.forEach((row, index) => {
      const [path, query = ''] = (row.href ?? '').split('?');
      expect(path).toBe(view.cta.split('?')[0]);
      expectRoundTrip(JOBS[id].calculator, JOBS[id].cases[index] ?? {}, query);
    });
    expect(view.cta).toBe(view.rows[0].href);
  });

  it.each(PAIRS)('names a column for every cell of %s in %s', (id, locale) => {
    const view = jobView(id, locale);
    for (const row of view.rows) expect(row.cells).toHaveLength(view.columns.length - 1);
    // a chart shows its table and its basis, not the facts of one case
    if (view.chart === undefined) expect(view.facts.length).toBeGreaterThan(0);
    expect(view.answer).not.toBe('');
  });

  // content audit 2026-11-08: a size job lists its sibling jobs, not the question pages (the hub
  // and the calculator link those), and a question page lists the other question pages, so neither
  // copies the list of the other
  // content audit 2026-11-10: the full list of siblings was the largest block a slab page shared
  // with every other concrete page, so a job page lists its four nearest siblings in table order
  // (two before and two after, filled from the other side at an end); the hub and the calculator
  // page still list them all
  it.each(PAIRS)('lists the nearest other jobs of its calculator from %s in %s', (id, locale) => {
    const others = jobView(id, locale).others;
    const group: readonly JobId[] = isQuestionJob(id)
      ? JOB_IDS.filter((each) => isQuestionJob(each))
      : jobsOf(JOBS[id].calculator).filter((each) => !isQuestionJob(each));
    const at = group.indexOf(id);
    const nearest = group
      .map((each, index) => ({ each, index, away: Math.abs(index - at) }))
      .filter(({ away }) => away > 0)
      .toSorted((x, y) => x.away - y.away || x.index - y.index)
      .slice(0, 4)
      .toSorted((x, y) => x.index - y.index)
      .map(({ each }) => pathOf(each, locale));
    expect(others.map(({ href }) => href)).toEqual(nearest);
    expect(others.length).toBe(Math.min(4, group.length - 1));
    expect(others.map(({ title }) => title)).not.toContain(jobView(id, locale).heading);
  });

  it('lists the two siblings on each side of a slab in the middle of its table', () => {
    const others = jobView('concrete-slab-12x20', 'en').others.map(({ href }) => href);
    expect(others).toEqual([
      '/concrete/10x20-slab',
      '/concrete/12x12-slab',
      '/concrete/12x24-slab',
      '/concrete/20x20-slab',
    ]);
  });

  // the note states the extra the figures carry: the engine's default
  it.each(LOCALES)('states the default extra for waste of the engine in %s', (locale) => {
    const waste = concrete.inputs.find(({ key }) => key === 'waste');
    expect(waste?.kind === 'percent' && waste.default.toString()).toBe('10');
    expect(jobView('concrete-slab-10x10', locale).note).toContain('10%');
    expect(siteText(locale)('site.job.note.concrete')).toContain('10%');
  });

  it.each(LOCALES)('links the section of its calculator in the methodology in %s', (locale) => {
    expect(METHODOLOGY_ANCHOR.concrete[locale]).toBe(METHODOLOGY_ROWS.concrete.anchor[locale]);
    expect(METHODOLOGY_ANCHOR['roof-pitch'][locale]).toBe(
      METHODOLOGY_ROWS['roof-pitch'].anchor[locale],
    );
    expect(METHODOLOGY_ANCHOR['rectangle-area'][locale]).toBe(
      METHODOLOGY_ROWS['rectangle-area'].anchor[locale],
    );
    expect(METHODOLOGY_ANCHOR.mulch[locale]).toBe(METHODOLOGY_ROWS.mulch.anchor[locale]);
    expect(METHODOLOGY_ANCHOR.gravel[locale]).toBe(METHODOLOGY_ROWS.gravel.anchor[locale]);
    expect(METHODOLOGY_ANCHOR.paint[locale]).toBe(METHODOLOGY_ROWS.paint.anchor[locale]);
    expect(METHODOLOGY_ANCHOR.drywall[locale]).toBe(METHODOLOGY_ROWS.drywall.anchor[locale]);
    expect(METHODOLOGY_ANCHOR.topsoil[locale]).toBe(METHODOLOGY_ROWS.topsoil.anchor[locale]);
    expect(METHODOLOGY_ANCHOR.roofing[locale]).toBe(METHODOLOGY_ROWS.roofing.anchor[locale]);
    expect(METHODOLOGY_ANCHOR['feet-inches'][locale]).toBe(
      METHODOLOGY_ROWS['feet-inches'].anchor[locale],
    );
    expect(jobView('roof-pitch-4-12', locale).methodology).toMatch(
      new RegExp(`#${METHODOLOGY_ANCHOR['roof-pitch'][locale]}$`),
    );
  });
});
