import type { CalculatorPageId } from '../../../apps/web/src/routing/templates.ts';
import { E2E } from './calculator-pages.ts';
import type { E2eSpec } from './calculator-pages.ts';
import { RECTANGLE_AREA } from './rectangle-area-pages.ts';

// spec: site-quality › [SQ29] a calculator page with no record is a type error naming the id
// @ts-expect-error -- the record has no row for 'concrete'
export const missing = {} as const satisfies Record<CalculatorPageId, E2eSpec>;

// spec: site-quality › [SQ37] the record of the staged calculator is a complete spec before its E2E row exists
export const staged: E2eSpec = RECTANGLE_AREA;

/** The record table is complete: one spec per calculator page id. */
export const complete: Record<CalculatorPageId, E2eSpec> = E2E;

const words = { catalog: {}, site: {}, common: {} };

// spec: site-quality › [SQ30] a spec with no choice group, stepper, shopping line or price compiles
export const minimal = {
  locales: { en: words, es: words },
  ready: 'length',
  inputs: 2,
  numeric: [],
  figures: ['area'],
  defaults: ['100.00'],
  typed: {
    key: 'length',
    text: '20',
    param: 'l=240',
    shown: '20 ft',
    back: '10',
    figures: ['200.00'],
  },
  states: [{ name: 'default', query: '', figures: ['100.00'] }],
  metric: {
    query: '?v=1&u=m',
    shown: { length: '3.048 m' },
    back: { length: '10 ft' },
    primary: '9.29',
    hint: { key: 'length', site: 'site.calculator.hintM' },
    bare: {
      texts: { length: '3' },
      query: '?v=1&u=m&l=3',
      figures: ['9.00'],
      back: { key: 'length', shown: '3 in', param: 'l=3' },
    },
  },
  tabOrder: ['[data-unit="imperial"]', '#calc-length'],
  bounds: [{ key: 'length', text: '1001 ft', code: 'ABOVE_MAX', bound: '1,000 ft', restore: '10' }],
  layoutQueries: ['?v=1'],
} as const satisfies E2eSpec;
