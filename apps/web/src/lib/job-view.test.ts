import { decode } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { METHODOLOGY_ROWS } from '../contract/__testing__/methodology-rows.ts';
import { JOB_IDS, JOBS } from '../routing/jobs.ts';
import { LOCALES } from '../routing/routes.ts';
import { concrete } from './concrete.ts';
import { jobView, METHODOLOGY_ANCHOR } from './job-view.ts';
import { siteText } from './site-text.ts';

const PAIRS = JOB_IDS.flatMap((id) => LOCALES.map((locale) => [id, locale] as const));

describe('job page view (growth plan › lever 1: figures from the engine)', () => {
  // hand-verified: 10 × 10 × 1/3 ft = 33.33 ft³, + 10% = 36.67 ft³ = 1.36 yd³;
  // bags of 0.60, 0.45 and 0.30 ft³: 61.1, 81.5 and 122.2, rounded up
  it('works the 10 × 10 slab out as the calculator does', () => {
    const [first] = jobView('concrete-slab-10x10', 'en').rows;
    expect(first).toEqual({
      label: '10 ft × 10 ft × 4 in',
      // the width and the thickness are the calculator's defaults, so the link leaves them out
      href: '/concrete-calculator?v=1&l=120',
      yards: '1.36',
      bags: ['62', '82', '123'],
    });
  });

  // hand-verified: 20 × 20 × 1/3 ft = 133.33 ft³, + 10% = 146.67 ft³ = 5.43 yd³;
  // bags of 0.60, 0.45 and 0.30 ft³: 244.4, 325.9 and 488.9, rounded up
  it('works the 20 × 20 slab, 4 in thick, out as the calculator does', () => {
    const [first] = jobView('concrete-slab-20x20', 'en').rows;
    expect(first).toMatchObject({
      label: '20 ft × 20 ft × 4 in',
      yards: '5.43',
      bags: ['245', '326', '489'],
    });
  });

  // hand-verified: π × (0.5 ft)² × 4 ft = 3.14 ft³, + 10% = 3.46 ft³ = 0.13 yd³; 5.8, 7.7, 11.5 bags
  it('works a 12 in tube, 48 in deep, out as the calculator does', () => {
    const rows = jobView('concrete-tube-12', 'es').rows;
    expect(rows.at(-1)).toEqual({
      label: '12 in × 48 in',
      href: '/es/calculadora-de-concreto?v=1&sh=column&h=48',
      yards: '0.13',
      bags: ['6', '8', '12'],
    });
  });

  it.each(PAIRS)('links every row of %s in %s to the calculator in that case', (id, locale) => {
    const view = jobView(id, locale);
    expect(view.rows).toHaveLength(JOBS[id].cases.length);
    view.rows.forEach((row, index) => {
      const [, query = ''] = row.href.split('?');
      const state = concrete.validate(JOBS[id].cases[index] ?? {});
      expect(state.ok && decode(concrete, query).state).toEqual(state.ok && state.value);
    });
    expect(view.cta).toBe(view.rows[0]?.href);
  });

  it.each(PAIRS)('names the columns of %s in %s from the calculator catalog', (id, locale) => {
    const view = jobView(id, locale);
    expect(view.bagLabels).toHaveLength(3);
    expect(view.sizeLabel.split(' × ').length).toBe(view.rows[0]?.label.split(' × ').length);
    expect(view.answer).toContain(view.rows[0]?.yards);
  });

  it.each(PAIRS)('lists the other jobs from %s in %s, never itself', (id, locale) => {
    const others = jobView(id, locale).others;
    expect(others).toHaveLength(JOB_IDS.length - 1);
    expect(others.map(({ title }) => title)).not.toContain(jobView(id, locale).heading);
  });

  // the note states the extra the figures carry: the engine's default
  it.each(LOCALES)('states the default extra for waste of the engine in %s', (locale) => {
    const waste = concrete.inputs.find(({ key }) => key === 'waste');
    expect(waste?.kind === 'percent' && waste.default.toString()).toBe('10');
    expect(siteText(locale)('site.job.note')).toContain('10%');
  });

  it.each(LOCALES)('links the concrete section of the methodology in %s', (locale) => {
    expect(METHODOLOGY_ANCHOR[locale]).toBe(METHODOLOGY_ROWS.concrete.anchor[locale]);
  });
});
