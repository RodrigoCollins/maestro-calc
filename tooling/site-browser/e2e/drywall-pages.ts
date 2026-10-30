import { enCommon } from '../../../packages/i18n/src/catalogs/en/common.ts';
import { enDrywall } from '../../../packages/i18n/src/catalogs/en/drywall.ts';
import { enSite } from '../../../packages/i18n/src/catalogs/en/site.ts';
import { esCommon } from '../../../packages/i18n/src/catalogs/es/common.ts';
import { esDrywall } from '../../../packages/i18n/src/catalogs/es/drywall.ts';
import { esSite } from '../../../packages/i18n/src/catalogs/es/site.ts';
import type { E2eSpec } from './calculator-pages.ts';

/** The figures of a state: square feet, square meters, sheets. */
type Figures = readonly [string, string, string];

/*
 * The hand-verified cases of calc-drywall (a door 20 ft², a window 15 ft², sheets of 32 or 48 ft²,
 * 1 ft² = 0.09290304 m², exact). Default: 384 ft² of walls − 50 ft² + 144 ft² of ceiling = 478 ft²
 * = 44.41 m²; × 1.1 ÷ 32 = 16.4, so 17 sheets.
 */
const DEFAULTS: Figures = ['478.00', '44.41', '17'];
const SHEET_4X12: Figures = ['478.00', '44.41', '11'];
const WALLS: Figures = ['334.00', '31.03', '12'];
const NO_EXTRA: Figures = ['478.00', '44.41', '15'];
const LARGE: Figures = ['880.00', '81.75', '31'];
const HALL: Figures = ['3,640.00', '338.17', '126'];
/** 20 ft by 12 ft: 512 − 50 + 240 = 702 ft², × 1.1 ÷ 32 = 24.1, so 25 sheets. */
const LENGTH_20: Figures = ['702.00', '65.22', '25'];
/** 4 m by 3 m with 2.5 m walls, typed as bare numbers: 455.90 ft² = 42.35 m², 16 sheets. */
const METRIC_BARE: Figures = ['455.90', '42.35', '16'];

const ANSWER_DEFAULT = {
  en: 'A 12 ft by 12 ft room with 8 ft walls has 478.00 ft² of walls and ceiling to cover. Sheets of 4 × 8 ft: 17.',
  es: 'Un cuarto de 12 ft por 12 ft con paredes de 8 ft tiene 478.00 ft² de paredes y techo para cubrir. Placas de 4 × 8 ft: 17.',
} as const;

/**
 * The record of the drywall page (site-quality › [SQ37]): the strings, states and sentences the
 * generic suites drive. The page has an answer, three shopping lines, a price and a drawing.
 */
export const DRYWALL: E2eSpec = {
  locales: {
    en: { catalog: enDrywall, site: enSite, common: enCommon },
    es: { catalog: esDrywall, site: esSite, common: esCommon },
  },
  ready: 'length',
  inputs: 7,
  numeric: ['doors', 'windows'],
  figures: ['areaFt2', 'areaM2', 'shopping:0'],
  defaults: DEFAULTS,
  primary: { en: '478.00 ft²', es: '478.00 ft²' },
  controls: 14,
  typed: {
    key: 'length',
    text: '20',
    param: 'l=240',
    shown: '20 ft',
    back: '12',
    figures: LENGTH_20,
  },
  states: [
    { name: 'default 12 ft by 12 ft, walls and ceiling, 4 by 8', query: '?v=1', figures: DEFAULTS },
    { name: '4 by 12 sheets', query: '?v=1&sz=4x12', figures: SHEET_4X12 },
    { name: 'walls only', query: '?v=1&sf=walls', figures: WALLS },
    { name: 'no extra', query: '?v=1&ws=0', figures: NO_EXTRA },
    { name: '20 ft by 15 ft, 9 ft walls', query: '?v=1&l=240&w=180&h=108', figures: LARGE },
    { name: '50 ft by 40 ft hall', query: '?v=1&l=600&w=480&h=120&dr=2&wn=8', figures: HALL },
  ],
  metric: {
    query: '?v=1&u=m',
    shown: { length: '3.6576 m', width: '3.6576 m', height: '2.4384 m' },
    back: { length: '12 ft', width: '12 ft', height: '8 ft' },
    primary: '44.41',
    hint: { key: 'length', site: 'site.calculator.hintM' },
    bare: {
      texts: { length: '4', width: '3', height: '2.5' },
      query: '?v=1&u=m&l=20000/127&w=15000/127&h=12500/127',
      figures: METRIC_BARE,
      back: { key: 'length', shown: '20000/127 in', param: 'l=20000/127' },
    },
  },
  tabOrder: [
    '[data-unit="imperial"]',
    '[data-unit="metric"]',
    '#calc-length',
    '#calc-width',
    '#calc-height',
    '#calc-doors',
    '#calc-windows',
    '[data-choice="surfaces"] [value="walls-ceiling"]',
    '[data-choice="surfaces"] [value="walls"]',
    '[data-choice="sheet"] [value="4x8"]',
    '[data-choice="sheet"] [value="4x12"]',
    '#calc-waste',
    '#calc-sheetPrice',
    '.calc-result a',
    '[data-copy]',
    '[data-share]',
  ],
  // calculator-page › [CP79]: 15 ft is 180 in, written as l=180
  share: { change: { key: 'length', text: '15 ft' }, query: '?v=1&l=180' },
  bounds: [
    { key: 'length', text: '1001 ft', code: 'ABOVE_MAX', bound: '1,000 ft', restore: '12' },
    { key: 'height', text: '51 ft', code: 'ABOVE_MAX', bound: '50 ft', restore: '8' },
  ],
  prices: [
    {
      input: 'sheetPrice',
      text: '12',
      output: 'cost',
      value: '$204.00',
      hinted: true,
      afterTyped: '$300.00',
    },
  ],
  variant: {
    press: { hook: 'choice', key: 'sheet', value: '4x12' },
    suffix: '&sz=4x12',
    price: { input: 'sheetPrice', text: '12', suffix: '&sp=12', output: 'cost', value: '$204.00' },
  },
  // The hand-verified cases in both unit systems, with the longest sheet text: the sentences whose
  // length the answer reserve is measured on (calculator-page › [CP60]).
  layoutQueries: [
    '?v=1',
    '?v=1&sf=walls&sz=4x12',
    '?v=1&l=240&w=180&h=108',
    '?v=1&l=600&w=480&h=120&dr=2&wn=8&sz=4x12',
    '?v=1&u=m',
    '?v=1&u=m&sf=walls&sz=4x12',
    '?v=1&u=m&l=240&w=180&h=108',
    '?v=1&u=m&l=600&w=480&h=120&dr=2&wn=8&sz=4x12',
  ],
  answer: {
    default: ANSWER_DEFAULT,
    typed: {
      en: 'A 20 ft by 12 ft room with 8 ft walls has 702.00 ft² of walls and ceiling to cover. Sheets of 4 × 8 ft: 25.',
      es: 'Un cuarto de 20 ft por 12 ft con paredes de 8 ft tiene 702.00 ft² de paredes y techo para cubrir. Placas de 4 × 8 ft: 25.',
    },
    metric: {
      en: 'A 3.66 m by 3.66 m room with 2.44 m walls has 44.41 m² of walls and ceiling to cover. Sheets of 4 × 8 ft: 17.',
      es: 'Un cuarto de 3.66 m por 3.66 m con paredes de 2.44 m tiene 44.41 m² de paredes y techo para cubrir. Placas de 4 × 8 ft: 17.',
    },
  },
  // The floor plan of blueprint-drawing with the wall height note; the name is the answer sentence.
  drawing: {
    labels: { en: ['12 ft', '12 ft', '8 ft walls'], es: ['12 ft', '12 ft', 'paredes de 8 ft'] },
    name: ANSWER_DEFAULT,
    typed: {
      key: 'length',
      text: '36',
      labels: {
        en: ['36 ft', '12 ft', '8 ft walls'],
        es: ['36 ft', '12 ft', 'paredes de 8 ft'],
      },
      name: {
        en: 'A 36 ft by 12 ft room with 8 ft walls has 1,150.00 ft² of walls and ceiling to cover. Sheets of 4 × 8 ft: 40.',
        es: 'Un cuarto de 36 ft por 12 ft con paredes de 8 ft tiene 1,150.00 ft² de paredes y techo para cubrir. Placas de 4 × 8 ft: 40.',
      },
      ratio: 3,
    },
    kept: {
      key: 'length',
      text: '15 ft',
      labels: {
        en: ['15 ft', '12 ft', '8 ft walls'],
        es: ['15 ft', '12 ft', 'paredes de 8 ft'],
      },
    },
    metric: {
      en: ['3.66 m', '3.66 m', '2.44 m walls'],
      es: ['3.66 m', '3.66 m', 'paredes de 2.44 m'],
    },
    toggles: ['?v=1&l=384&w=384', '?v=1&l=300&w=480'],
    // the longest labels the fields accept (999 ft 11 63/64 in, 304.80 m) and both ratio clamps
    longest: [
      '?v=1&l=767999/64&w=767999/64',
      '?v=1&u=m&l=767999/64&w=767999/64',
      '?v=1&l=1200&w=12',
      '?v=1&l=12&w=1200',
    ],
    queries: ['?v=1&l=240&w=180&h=108', '?v=1&l=1200&w=12'],
  },
  hints: [
    { key: 'length', site: 'site.calculator.hintFt', describedBy: 'calc-length-hint' },
    { key: 'width', site: 'site.calculator.hintFt', describedBy: 'calc-width-hint' },
    { key: 'height', site: 'site.calculator.hintFt', describedBy: 'calc-height-hint' },
  ],
};
