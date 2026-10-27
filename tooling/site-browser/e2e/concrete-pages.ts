import { enCommon } from '../../../packages/i18n/src/catalogs/en/common.ts';
import { enConcrete } from '../../../packages/i18n/src/catalogs/en/concrete.ts';
import { enSite } from '../../../packages/i18n/src/catalogs/en/site.ts';
import { esCommon } from '../../../packages/i18n/src/catalogs/es/common.ts';
import { esConcrete } from '../../../packages/i18n/src/catalogs/es/concrete.ts';
import { esSite } from '../../../packages/i18n/src/catalogs/es/site.ts';
import type { E2eSpec } from './calculator-pages.ts';

/** The figures of a state: cubic yards, cubic feet, cubic meters, before the extra, bags. */
export type Figures = readonly [string, string, string, string, string];

/** The hand-verified states of calculator-page › Live recalculation, and their links. */
export const STATES: readonly { name: string; query: string; figures: Figures }[] = [
  { name: 'default', query: '', figures: ['1.63', '44.00', '1.25', '40.00', '74'] },
  { name: 'length 20 ft', query: '?v=1&l=240', figures: ['2.72', '73.33', '2.08', '66.67', '123'] },
  { name: 'bag 60 lb', query: '?v=1&bg=60', figures: ['1.63', '44.00', '1.25', '40.00', '98'] },
  { name: 'bag 40 lb', query: '?v=1&bg=40', figures: ['1.63', '44.00', '1.25', '40.00', '147'] },
  { name: 'waste 0', query: '?v=1&ws=0', figures: ['1.48', '40.00', '1.13', '40.00', '67'] },
  { name: 'waste 15', query: '?v=1&ws=15', figures: ['1.70', '46.00', '1.30', '40.00', '77'] },
  {
    name: 'footing defaults',
    query: '?v=1&sh=footing',
    figures: ['0.43', '11.73', '0.33', '10.67', '20'],
  },
  {
    name: 'footing F1',
    query: '?v=1&sh=footing&l=216&n=3',
    figures: ['1.96', '52.80', '1.50', '48.00', '88'],
  },
  {
    name: 'column defaults',
    query: '?v=1&sh=column',
    figures: ['0.26', '6.91', '0.20', '6.28', '12'],
  },
  {
    name: 'column C2',
    query: '?v=1&sh=column&n=4',
    figures: ['1.02', '27.65', '0.78', '25.13', '47'],
  },
  {
    name: 'steps defaults',
    query: '?v=1&sh=steps',
    figures: ['0.52', '14.12', '0.40', '12.83', '24'],
  },
  {
    name: 'metric S3',
    query: '?v=1&u=m&l=20000/127&w=15000/127&t=500/127',
    figures: ['1.73', '46.62', '1.32', '42.38', '78'],
  },
];

/** The shapes and their visible dimension fields, in the order of the form (calculator-page › [CP11]). */
export const SHAPE_FIELDS: Record<string, readonly string[]> = {
  slab: ['length', 'width', 'thickness'],
  footing: ['length', 'footingWidth', 'footingDepth', 'count'],
  column: ['diameter', 'height', 'count'],
  steps: ['stepWidth', 'rise', 'run', 'stepCount'],
};

const FOOTING: Figures = ['0.43', '11.73', '0.33', '10.67', '20'];
const COLUMN: Figures = ['0.26', '6.91', '0.20', '6.28', '12'];
const STEPS: Figures = ['0.52', '14.12', '0.40', '12.83', '24'];
const SLAB_20: Figures = ['2.72', '73.33', '2.08', '66.67', '123'];
const FOOTING_F1: Figures = ['1.96', '52.80', '1.50', '48.00', '88'];
const DEFAULTS: Figures = ['1.63', '44.00', '1.25', '40.00', '74'];

/** Concrete's record: the strings, states and shape fields the generic suites drive. */
export const CONCRETE: E2eSpec = {
  locales: {
    en: {
      catalog: enConcrete,
      site: enSite,
      common: enCommon,
      typedAnswer:
        'Slab (20 ft × 10 ft, 4 in thick): 2.72 cubic yards with 10% extra. Bags of 80 lb: 123.',
      metricAnswer:
        'Slab (3.66 m × 3.05 m, 10.16 cm thick): 1.25 cubic meters with 10% extra. Bags of 80 lb: 74.',
    },
    es: {
      catalog: esConcrete,
      site: esSite,
      common: esCommon,
      typedAnswer:
        'Losa (20 ft × 10 ft, 4 in de espesor): 2.72 yardas cúbicas con 10% de extra. Bolsas de 80 lb: 123.',
      metricAnswer:
        'Losa (3.66 m × 3.05 m, 10.16 cm de espesor): 1.25 metros cúbicos con 10% de extra. Bolsas de 80 lb: 74.',
    },
  },
  ready: 'length',
  inputs: 15,
  numeric: ['count', 'stepCount'],
  figures: ['volumeYd3', 'volumeFt3', 'volumeM3', 'netVolume', 'shopping:0'],
  defaults: DEFAULTS,
  typed: {
    key: 'length',
    text: '20',
    param: 'l=240',
    shown: '20 ft',
    back: '12',
    figures: SLAB_20,
  },
  states: STATES,
  metric: {
    query: '?v=1&u=m',
    shown: { length: '3.6576 m', width: '3.048 m', thickness: '10.16 cm' },
    back: { length: '12 ft', width: '10 ft', thickness: '4 in' },
    primary: '1.25',
    hint: { key: 'length', site: 'site.calculator.hintM' },
    bare: {
      texts: { length: '4', width: '3', thickness: '10' },
      query: '?v=1&u=m&l=20000/127&w=15000/127&t=500/127',
      figures: ['1.73', '46.62', '1.32', '42.38', '78'],
      back: { key: 'length', shown: '20000/127 in', param: 'l=20000/127' },
    },
  },
  tabOrder: [
    '[data-unit="imperial"]',
    '[data-unit="metric"]',
    '[data-choice="shape"] [value="slab"]',
    '[data-choice="shape"] [value="footing"]',
    '[data-choice="shape"] [value="column"]',
    '[data-choice="shape"] [value="steps"]',
    '#calc-length',
    '#calc-width',
    '#calc-thickness',
    '#calc-waste',
    '[data-step="waste"] [value="less"]',
    '[data-step="waste"] [value="more"]',
    '[data-choice="bag"] [value="40"]',
    '[data-choice="bag"] [value="60"]',
    '[data-choice="bag"] [value="80"]',
    '#calc-bagPrice',
    '#calc-readyMixPrice',
    '[data-copy]',
  ],
  bounds: [
    { key: 'length', text: '1001 ft', code: 'ABOVE_MAX', bound: '1,000 ft', restore: '12' },
    { key: 'waste', text: '51', code: 'ABOVE_MAX', bound: '50%', restore: '10' },
    {
      key: 'count',
      text: '1001',
      code: 'ABOVE_MAX',
      bound: '1,000',
      press: { hook: 'choice', key: 'shape', value: 'footing' },
    },
    { key: 'count', text: '0', code: 'BELOW_MIN', bound: '1' },
  ],
  // The states whose sentences are the longest in use: each shape at its defaults and at the
  // hand-verified link values, in US and metric units. The reserved block holds five lines (10.75rem),
  // the most any of them needs at 320 px; a value typed with every field at its maximum can add a line
  // (calculator-page › Layout stability, record JD-4).
  layoutQueries: [
    '?v=1',
    '?v=1&sh=footing',
    '?v=1&sh=footing&l=216&n=3',
    '?v=1&sh=column',
    '?v=1&sh=column&n=4',
    '?v=1&sh=steps',
    '?v=1&u=m',
    '?v=1&u=m&sh=footing&l=216&n=3',
    '?v=1&u=m&sh=steps',
  ],
  choices: [
    {
      key: 'shape',
      initial: 'slab',
      options: [
        {
          value: 'slab',
          fields: SHAPE_FIELDS['slab'] ?? [],
          starts: { en: 'Slab (', es: 'Losa (' },
        },
        {
          value: 'footing',
          param: 'sh=footing',
          fields: SHAPE_FIELDS['footing'] ?? [],
          figures: FOOTING,
          starts: { en: 'Footing (', es: 'Zapata (' },
        },
        {
          value: 'column',
          param: 'sh=column',
          fields: SHAPE_FIELDS['column'] ?? [],
          figures: COLUMN,
          starts: { en: 'Column (', es: 'Columna (' },
        },
        {
          value: 'steps',
          param: 'sh=steps',
          fields: SHAPE_FIELDS['steps'] ?? [],
          figures: STEPS,
          starts: { en: 'Steps (', es: 'Escalones (' },
        },
      ],
    },
  ],
  steppers: [
    {
      key: 'waste',
      min: '0',
      max: '50',
      base: '10',
      up: '15',
      minFigures: ['1.48', '40.00', '1.13', '40.00', '67'],
      upFigures: ['1.70', '46.00', '1.30', '40.00', '77'],
      upQuery: '?v=1&ws=15',
    },
  ],
  shopping: [
    {
      sizes: {
        key: 'bag',
        options: [
          {
            value: '60',
            figures: ['1.63', '44.00', '1.25', '40.00', '98'],
            note: { en: 'About 0.45 cubic feet per bag', es: 'Unos 0.45 pies cúbicos por bolsa' },
            end: { en: 'Bags of 60 lb: 98.', es: 'Bolsas de 60 lb: 98.' },
          },
          {
            value: '40',
            figures: ['1.63', '44.00', '1.25', '40.00', '147'],
            note: { en: 'About 0.30 cubic feet per bag', es: 'Unos 0.30 pies cúbicos por bolsa' },
            end: { en: 'Bags of 40 lb: 147.', es: 'Bolsas de 40 lb: 147.' },
          },
        ],
      },
    },
  ],
  prices: [
    {
      input: 'bagPrice',
      text: '6.50',
      output: 'bagCost',
      value: '$481.00',
      hinted: true,
    },
    {
      input: 'readyMixPrice',
      text: '150',
      output: 'readyMixCost',
      value: '$244.44',
      afterTyped: '$407.41',
    },
  ],
  rejects: [
    { key: 'thickness', text: '1,5', code: 'DECIMAL_COMMA' },
    { key: 'thickness', text: '5 furlongs', code: 'UNKNOWN_UNIT' },
  ],
  invalidLink: '?v=1&sh=Slab&bg=50&ws=51',
  restored: {
    query: '?v=1&sh=footing&l=216&n=3',
    pressed: { key: 'shape', value: 'footing' },
    values: { length: '18 ft', count: '3' },
    figures: FOOTING_F1,
  },
  variant: {
    press: { hook: 'choice', key: 'bag', value: '60' },
    suffix: '&bg=60',
    price: {
      input: 'bagPrice',
      text: '6.50',
      suffix: '&bp=13/2',
      output: 'bagCost',
      value: '$1,059.50',
    },
  },
  hints: [
    { key: 'length', site: 'site.calculator.hintFt', describedBy: 'calc-length-hint' },
    { key: 'thickness', site: 'site.calculator.hintIn', describedBy: 'calc-thickness-hint' },
    { key: 'waste', describedBy: 'calc-waste-help' },
  ],
};
