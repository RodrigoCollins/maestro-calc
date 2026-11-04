import { decode } from '@maestro-calc/core';
import { rectangleArea } from '@maestro-calc/core/calculators/rectangle-area';
import { roofPitch } from '@maestro-calc/core/calculators/roof-pitch';
import { describe, expect, it } from 'vitest';
import { METHODOLOGY_ROWS } from '../contract/__testing__/methodology-rows.ts';
import { JOB_IDS, JOBS, jobsOf, type Job, type JobCase } from '../routing/jobs.ts';
import { LOCALES } from '../routing/routes.ts';
import { concrete } from './concrete.ts';
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
    expect(jobView('roof-pitch-4-12', locale).methodology).toMatch(
      new RegExp(`#${METHODOLOGY_ANCHOR['roof-pitch'][locale]}$`),
    );
  });
});
