import { decode } from '@maestro-calc/core';
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
  const state = roofPitch.validate(raw);
  expect(state.ok && decode(roofPitch, query).state).toEqual(state.ok && state.value);
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
    expect(jobView('roof-pitch-4-12', locale).methodology).toMatch(
      new RegExp(`#${METHODOLOGY_ANCHOR['roof-pitch'][locale]}$`),
    );
  });
});
