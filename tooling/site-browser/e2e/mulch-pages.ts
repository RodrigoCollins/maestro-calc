import { enCommon } from '../../../packages/i18n/src/catalogs/en/common.ts';
import { enMulch } from '../../../packages/i18n/src/catalogs/en/mulch.ts';
import { enSite } from '../../../packages/i18n/src/catalogs/en/site.ts';
import { esCommon } from '../../../packages/i18n/src/catalogs/es/common.ts';
import { esMulch } from '../../../packages/i18n/src/catalogs/es/mulch.ts';
import { esSite } from '../../../packages/i18n/src/catalogs/es/site.ts';
import type { E2eSpec } from './calculator-pages.ts';

/** The figures of a state: cubic yards, cubic meters, bags. */
type Figures = readonly [string, string, string];

/*
 * The hand-verified cases of calc-mulch (a bag holds its label, 1 yd³ = 27 ft³, 1 ft = 0.3048 m,
 * exact). Default: 20 ft × 4 ft × 3 in = 20 ft³, with 5 % extra 21 ft³ = 0.78 yd³ = 0.59 m³,
 * 21 ÷ 2 = 10.5, so 11 bags of 2 cu ft (7 of 3 cu ft).
 */
const DEFAULTS: Figures = ['0.78', '0.59', '11'];
const BAG_3: Figures = ['0.78', '0.59', '7'];
const NO_EXTRA: Figures = ['0.74', '0.57', '10'];
const SQUARE: Figures = ['1.30', '0.99', '18'];
const PATH: Figures = ['0.58', '0.45', '8'];
/** 30 ft by 4 ft: 30 ft³, × 1.05 = 31.5 ft³ = 1.17 yd³, 15.75 bags, so 16. */
const LENGTH_30: Figures = ['1.17', '0.89', '16'];
/** 4 m by 2 m by 10 cm, typed as bare numbers in the metric system: 0.84 m³ = 29.66 ft³, 15 bags. */
const METRIC_BARE: Figures = ['1.10', '0.84', '15'];

/**
 * The record of the mulch page (site-quality › [SQ37]): the strings, states and sentences the
 * generic suites drive. The page has an answer, a bag line, two prices and a drawing.
 */
export const MULCH: E2eSpec = {
  locales: {
    en: { catalog: enMulch, site: enSite, common: enCommon },
    es: { catalog: esMulch, site: esSite, common: esCommon },
  },
  ready: 'length',
  inputs: 6,
  numeric: [],
  figures: ['volumeYd3', 'volumeM3', 'shopping:0'],
  defaults: DEFAULTS,
  primary: { en: '0.78 cubic yards', es: '0.78 yardas cúbicas' },
  controls: 11,
  typed: {
    key: 'length',
    text: '30',
    param: 'l=360',
    shown: '30 ft',
    back: '20',
    figures: LENGTH_30,
  },
  states: [
    { name: 'default 20 ft by 4 ft by 3 in, 2 cu ft bags', query: '?v=1', figures: DEFAULTS },
    { name: '3 cu ft bags', query: '?v=1&bg=3', figures: BAG_3 },
    { name: 'no extra', query: '?v=1&ws=0', figures: NO_EXTRA },
    { name: '10 ft by 10 ft by 4 in', query: '?v=1&l=120&w=120&d=4', figures: SQUARE },
    { name: '30 ft by 3 ft by 2 in', query: '?v=1&l=360&w=36&d=2', figures: PATH },
  ],
  metric: {
    query: '?v=1&u=m',
    shown: { length: '6.096 m', width: '1.2192 m', depth: '7.62 cm' },
    back: { length: '20 ft', width: '4 ft', depth: '3 in' },
    primary: '0.59',
    hint: { key: 'length', site: 'site.calculator.hintM' },
    bare: {
      texts: { length: '4', width: '2', depth: '10' },
      query: '?v=1&u=m&l=20000/127&w=10000/127&d=500/127',
      figures: METRIC_BARE,
      back: { key: 'length', shown: '20000/127 in', param: 'l=20000/127' },
    },
  },
  tabOrder: [
    '[data-unit="imperial"]',
    '[data-unit="metric"]',
    '#calc-length',
    '#calc-width',
    '#calc-depth',
    '#calc-waste',
    '[data-choice="bag"] [value="2"]',
    '[data-choice="bag"] [value="3"]',
    '#calc-bagPrice',
    '#calc-yardPrice',
    '.calc-result a',
    '[data-copy]',
    '[data-share]',
  ],
  // calculator-page › [CP79]: 15 ft is 180 in, written as l=180
  share: { change: { key: 'length', text: '15 ft' }, query: '?v=1&l=180' },
  bounds: [
    { key: 'length', text: '1001 ft', code: 'ABOVE_MAX', bound: '1,000 ft', restore: '20' },
    { key: 'depth', text: '3 ft', code: 'ABOVE_MAX', bound: '24 in', restore: '3' },
  ],
  prices: [
    {
      input: 'bagPrice',
      text: '5',
      output: 'bagCost',
      value: '$55.00',
      hinted: true,
      afterTyped: '$80.00',
    },
    {
      input: 'yardPrice',
      text: '36',
      output: 'bulkCost',
      value: '$28.00',
      hinted: true,
      afterTyped: '$42.00',
    },
  ],
  variant: {
    press: { hook: 'choice', key: 'bag', value: '3' },
    suffix: '&bg=3',
    price: { input: 'bagPrice', text: '5', suffix: '&bp=5', output: 'bagCost', value: '$55.00' },
  },
  // The hand-verified cases in both unit systems and both bag sizes: the sentences whose length the
  // answer reserve is measured on (calculator-page › [CP60]).
  layoutQueries: [
    '?v=1',
    '?v=1&bg=3',
    '?v=1&l=120&w=120&d=4',
    '?v=1&l=360&w=36&d=2',
    '?v=1&u=m',
    '?v=1&u=m&bg=3',
    '?v=1&u=m&l=120&w=120&d=4',
    '?v=1&u=m&l=360&w=36&d=2',
  ],
  answer: {
    default: {
      en: 'A 20 ft by 4 ft bed, 3 in deep, needs 0.78 cubic yards of mulch: 11 bags of 2 cu ft.',
      es: 'Un área de 20 ft por 4 ft, de 3 in de profundidad, lleva 0.78 yardas cúbicas de mulch: 11 bolsas de 2 cu ft.',
    },
    typed: {
      en: 'A 30 ft by 4 ft bed, 3 in deep, needs 1.17 cubic yards of mulch: 16 bags of 2 cu ft.',
      es: 'Un área de 30 ft por 4 ft, de 3 in de profundidad, lleva 1.17 yardas cúbicas de mulch: 16 bolsas de 2 cu ft.',
    },
    metric: {
      en: 'A 6.10 m by 1.22 m bed, 7.62 cm deep, needs 0.59 cubic meters of mulch: 11 bags of 2 cu ft.',
      es: 'Un área de 6.10 m por 1.22 m, de 7.62 cm de profundidad, lleva 0.59 metros cúbicos de mulch: 11 bolsas de 2 cu ft.',
    },
  },
  // The rectangle plan of blueprint-drawing with the depth note; the name is the answer sentence.
  // The default bed is 5:1, drawn at the 4:1 clamp; the typed one is 3:1.
  drawing: {
    labels: { en: ['20 ft', '4 ft', '3 in deep'], es: ['20 ft', '4 ft', '3 in de profundidad'] },
    name: {
      en: 'A 20 ft by 4 ft bed, 3 in deep, needs 0.78 cubic yards of mulch: 11 bags of 2 cu ft.',
      es: 'Un área de 20 ft por 4 ft, de 3 in de profundidad, lleva 0.78 yardas cúbicas de mulch: 11 bolsas de 2 cu ft.',
    },
    typed: {
      key: 'length',
      text: '12',
      labels: {
        en: ['12 ft', '4 ft', '3 in deep'],
        es: ['12 ft', '4 ft', '3 in de profundidad'],
      },
      name: {
        en: 'A 12 ft by 4 ft bed, 3 in deep, needs 0.47 cubic yards of mulch: 7 bags of 2 cu ft.',
        es: 'Un área de 12 ft por 4 ft, de 3 in de profundidad, lleva 0.47 yardas cúbicas de mulch: 7 bolsas de 2 cu ft.',
      },
      ratio: 3,
    },
    kept: {
      key: 'length',
      text: '15 ft',
      labels: {
        en: ['15 ft', '4 ft', '3 in deep'],
        es: ['15 ft', '4 ft', '3 in de profundidad'],
      },
    },
    metric: {
      en: ['6.10 m', '1.22 m', '7.62 cm deep'],
      es: ['6.10 m', '1.22 m', '7.62 cm de profundidad'],
    },
    toggles: ['?v=1&l=384&w=384', '?v=1&l=300&w=480'],
    // the longest labels the fields accept (999 ft 11 63/64 in, 304.80 m) and both ratio clamps
    longest: [
      '?v=1&l=767999/64&w=767999/64',
      '?v=1&u=m&l=767999/64&w=767999/64',
      '?v=1&l=1200&w=12',
      '?v=1&l=12&w=1200',
    ],
    queries: ['?v=1&l=360&w=36&d=2', '?v=1&l=1200&w=12'],
  },
  hints: [
    { key: 'length', site: 'site.calculator.hintFt', describedBy: 'calc-length-hint' },
    { key: 'width', site: 'site.calculator.hintFt', describedBy: 'calc-width-hint' },
    { key: 'depth', site: 'site.calculator.hintIn', describedBy: 'calc-depth-hint' },
  ],
};
