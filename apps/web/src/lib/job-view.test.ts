import { decode } from '@maestro-calc/core';
import { mulch } from '@maestro-calc/core/calculators/mulch';
import { rectangleArea } from '@maestro-calc/core/calculators/rectangle-area';
import { roofPitch } from '@maestro-calc/core/calculators/roof-pitch';
import { describe, expect, it } from 'vitest';
import { METHODOLOGY_ROWS } from '../contract/__testing__/methodology-rows.ts';
import { JOB_IDS, JOBS, jobsOf, type Job, type JobCase } from '../routing/jobs.ts';
import { LOCALES } from '../routing/routes.ts';
import { concrete } from './concrete.ts';
import { drywall } from './drywall.ts';
import { gravel } from './gravel.ts';
import { paint } from './paint.ts';
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
  const state = rectangleArea.validate(raw);
  expect(state.ok && decode(rectangleArea, query).state).toEqual(state.ok && state.value);
};

describe('job page view (growth plan › lever 1: figures from the engine)', () => {
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

  // hand-verified: 20 × 20 × 1/3 ft = 133.33 ft³, + 10% = 146.67 ft³ = 5.43 yd³;
  // bags of 0.60, 0.45 and 0.30 ft³: 244.4, 325.9 and 488.9, rounded up
  it('works the 20 × 20 slab, 4 in thick, out as the calculator does', () => {
    const [first] = jobView('concrete-slab-20x20', 'en').rows;
    expect(first).toMatchObject({
      label: '20 ft × 20 ft × 4 in',
      cells: ['5.43', '245', '326', '489'],
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
      expect(jobView('paint-room-12x12', locale).note).toContain('350');
      expect(defaultOf(drywall.inputs, 'waste')).toBe('10');
      expect(defaultOf(drywall.inputs, 'surfaces')).toBe('walls-ceiling');
      expect(defaultOf(drywall.inputs, 'doors')).toBe('1');
      expect(defaultOf(drywall.inputs, 'windows')).toBe('2');
      expect(jobView('drywall-room-12x12', locale).note).toContain('10%');
      for (const id of [...jobsOf('gravel'), ...jobsOf('paint'), ...jobsOf('drywall')]) {
        expect(jobView(id, locale).intro, id).toMatch(/\S/);
      }
    },
  );

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
    expect(jobView('concrete-slab-10x10', locale).intro).toBeUndefined();
    expect(jobView('concrete-slab-1000-sq-ft', locale).intro).toMatch(/\S/);
    expect(jobView('mulch-bags-per-yard', locale).intro).toMatch(/\S/);
    expect(jobView('square-feet-12x14', locale).note).toContain('0.09290304');
  });

  it.each(PAIRS)('links every row of %s in %s to the calculator in that case', (id, locale) => {
    const view = jobView(id, locale);
    expect(view.rows).toHaveLength(JOBS[id].cases.length);
    view.rows.forEach((row, index) => {
      const [path, query = ''] = row.href.split('?');
      expect(path).toBe(view.cta.split('?')[0]);
      expectRoundTrip(JOBS[id].calculator, JOBS[id].cases[index] ?? {}, query);
    });
    expect(view.cta).toBe(view.rows[0].href);
  });

  it.each(PAIRS)('names a column for every cell of %s in %s', (id, locale) => {
    const view = jobView(id, locale);
    for (const row of view.rows) expect(row.cells).toHaveLength(view.columns.length - 1);
    expect(view.facts.length).toBeGreaterThan(0);
    expect(view.answer).not.toBe('');
  });

  it.each(PAIRS)('lists the other jobs of its calculator from %s in %s', (id, locale) => {
    const others = jobView(id, locale).others;
    expect(others).toHaveLength(jobsOf(JOBS[id].calculator).length - 1);
    expect(others.map(({ title }) => title)).not.toContain(jobView(id, locale).heading);
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
    expect(jobView('roof-pitch-4-12', locale).methodology).toMatch(
      new RegExp(`#${METHODOLOGY_ANCHOR['roof-pitch'][locale]}$`),
    );
  });
});
