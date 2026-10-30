import { enCommon } from '../../../packages/i18n/src/catalogs/en/common.ts';
import { enRoofing } from '../../../packages/i18n/src/catalogs/en/roofing.ts';
import { enSite } from '../../../packages/i18n/src/catalogs/en/site.ts';
import { esCommon } from '../../../packages/i18n/src/catalogs/es/common.ts';
import { esRoofing } from '../../../packages/i18n/src/catalogs/es/roofing.ts';
import { esSite } from '../../../packages/i18n/src/catalogs/es/site.ts';
import type { E2eSpec } from './calculator-pages.ts';

/** The figures of a state: squares, square feet, bundles, rolls. */
type Figures = readonly [string, string, string, string];

/*
 * The hand-verified cases of calc-roofing (exact fractions; the slope factor √(1 + (p/12)²) to
 * twenty decimals; a bundle 100/3 ft²; a roll (3,000 − 4) in × (48 − 2) in = 957.06 ft² in one
 * layer, half below 4 in 12). Default: 40 ft by 30 ft at 6 in 12 = 1,200 × 1.1180… = 1,341.64 ft²
 * = 13.42 squares; × 1.1 ÷ 33⅓ = 44.3, so 45 bundles; ÷ 957.06 = 1.5, so 2 rolls.
 */
const DEFAULTS: Figures = ['13.42', '1,341.64', '45', '2'];
const PITCH_3: Figures = ['12.37', '1,236.93', '41', '3'];
const FLAT: Figures = ['12.00', '1,200.00', '40', '3'];
const PITCH_12: Figures = ['16.97', '1,697.06', '57', '2'];
const NO_EXTRA: Figures = ['13.42', '1,341.64', '41', '2'];
const LARGE: Figures = ['28.84', '2,884.44', '100', '4'];
/** 50 ft by 30 ft: 1,500 × 1.1180… = 1,677.05 ft², × 1.1 ÷ 33⅓ = 55.3, so 56 bundles; 2 rolls. */
const LENGTH_50: Figures = ['16.77', '1,677.05', '56', '2'];
/** 12 m by 9 m typed as bare numbers: 108 m² × 1.1180… = 120.75 m² = 1,299.72 ft², 43 bundles. */
const METRIC_BARE: Figures = ['13.00', '1,299.72', '43', '2'];

const ANSWER_DEFAULT = {
  en: 'A 40 ft by 30 ft footprint at 6 in 12 has 13.42 squares of roof. Bundles of shingles: 45. Rolls of underlayment: 2.',
  es: 'Una planta de 40 ft por 30 ft con pendiente de 6 en 12 tiene 13.42 cuadrados de techo. Paquetes de tejas: 45. Rollos de fieltro: 2.',
} as const;

/**
 * The record of the roofing page (site-quality › [SQ37]): the strings, states and sentences the
 * generic suites drive. The page has an answer with the IRC check, two shopping lines, two prices
 * and a drawing.
 */
export const ROOFING: E2eSpec = {
  locales: {
    en: { catalog: enRoofing, site: enSite, common: enCommon },
    es: { catalog: esRoofing, site: esSite, common: esCommon },
  },
  ready: 'length',
  inputs: 6,
  numeric: ['pitch'],
  figures: ['squares', 'areaFt2', 'shopping:0', 'shopping:1'],
  defaults: DEFAULTS,
  primary: { en: '13.42 squares', es: '13.42 cuadrados' },
  controls: 9,
  typed: {
    key: 'length',
    text: '50',
    param: 'l=600',
    shown: '50 ft',
    back: '40',
    figures: LENGTH_50,
  },
  states: [
    { name: 'default 40 ft by 30 ft at 6 in 12', query: '?v=1', figures: DEFAULTS },
    { name: '3 in 12, two layers of underlayment', query: '?v=1&p=3', figures: PITCH_3 },
    { name: 'flat', query: '?v=1&p=0', figures: FLAT },
    { name: '12 in 12', query: '?v=1&p=12', figures: PITCH_12 },
    { name: 'no extra', query: '?v=1&ws=0', figures: NO_EXTRA },
    {
      name: '60 ft by 40 ft at 8 in 12, 15 % extra',
      query: '?v=1&l=720&w=480&p=8&ws=15',
      figures: LARGE,
    },
  ],
  metric: {
    query: '?v=1&u=m',
    shown: { length: '12.192 m', width: '9.144 m' },
    back: { length: '40 ft', width: '30 ft' },
    primary: '124.64',
    hint: { key: 'length', site: 'site.calculator.hintM' },
    bare: {
      texts: { length: '12', width: '9' },
      query: '?v=1&u=m&l=60000/127&w=45000/127',
      figures: METRIC_BARE,
      back: { key: 'length', shown: '60000/127 in', param: 'l=60000/127' },
    },
  },
  tabOrder: [
    '[data-unit="imperial"]',
    '[data-unit="metric"]',
    '#calc-length',
    '#calc-width',
    '#calc-pitch',
    '#calc-waste',
    '#calc-bundlePrice',
    '#calc-rollPrice',
    '.calc-result a',
    '[data-copy]',
    '[data-share]',
  ],
  // calculator-page › [CP79]: 15 ft is 180 in, written as l=180
  share: { change: { key: 'length', text: '15 ft' }, query: '?v=1&l=180' },
  bounds: [
    { key: 'length', text: '1001 ft', code: 'ABOVE_MAX', bound: '1,000 ft', restore: '40' },
    { key: 'width', text: '1001 ft', code: 'ABOVE_MAX', bound: '1,000 ft', restore: '30' },
  ],
  prices: [
    {
      input: 'bundlePrice',
      text: '35',
      output: 'shinglesCost',
      value: '$1,575.00',
      hinted: true,
      afterTyped: '$1,960.00',
    },
    {
      input: 'rollPrice',
      text: '90',
      output: 'underlaymentCost',
      value: '$180.00',
      hinted: true,
      afterTyped: '$180.00',
    },
  ],
  // The hand-verified cases in both unit systems and each case of the answer (one layer, two layers,
  // below the minimum): the sentences whose length the answer reserve is measured on
  // (calculator-page › [CP60]).
  layoutQueries: [
    '?v=1',
    '?v=1&p=3',
    '?v=1&p=1',
    '?v=1&l=720&w=480&p=3',
    '?v=1&u=m',
    '?v=1&u=m&p=3',
    '?v=1&u=m&p=1',
    '?v=1&u=m&l=720&w=480&p=3',
  ],
  answer: {
    default: ANSWER_DEFAULT,
    typed: {
      en: 'A 50 ft by 30 ft footprint at 6 in 12 has 16.77 squares of roof. Bundles of shingles: 56. Rolls of underlayment: 2.',
      es: 'Una planta de 50 ft por 30 ft con pendiente de 6 en 12 tiene 16.77 cuadrados de techo. Paquetes de tejas: 56. Rollos de fieltro: 2.',
    },
    metric: {
      en: 'A 12.19 m by 9.14 m footprint at 6 in 12 has 124.64 m² of roof. Bundles of shingles: 45. Rolls of underlayment: 2.',
      es: 'Una planta de 12.19 m por 9.14 m con pendiente de 6 en 12 tiene 124.64 m² de techo. Paquetes de tejas: 45. Rollos de fieltro: 2.',
    },
  },
  // The footprint plan of blueprint-drawing with the pitch note; the name is the answer sentence.
  drawing: {
    labels: {
      en: ['40 ft', '30 ft', '6 in 12 pitch'],
      es: ['40 ft', '30 ft', 'pendiente de 6 en 12'],
    },
    name: ANSWER_DEFAULT,
    typed: {
      key: 'length',
      text: '90',
      labels: {
        en: ['90 ft', '30 ft', '6 in 12 pitch'],
        es: ['90 ft', '30 ft', 'pendiente de 6 en 12'],
      },
      name: {
        en: 'A 90 ft by 30 ft footprint at 6 in 12 has 30.19 squares of roof. Bundles of shingles: 100. Rolls of underlayment: 4.',
        es: 'Una planta de 90 ft por 30 ft con pendiente de 6 en 12 tiene 30.19 cuadrados de techo. Paquetes de tejas: 100. Rollos de fieltro: 4.',
      },
      ratio: 3,
    },
    kept: {
      key: 'length',
      text: '45 ft',
      labels: {
        en: ['45 ft', '30 ft', '6 in 12 pitch'],
        es: ['45 ft', '30 ft', 'pendiente de 6 en 12'],
      },
    },
    metric: {
      en: ['12.19 m', '9.14 m', '6 in 12 pitch'],
      es: ['12.19 m', '9.14 m', 'pendiente de 6 en 12'],
    },
    toggles: ['?v=1&l=384&w=384', '?v=1&l=300&w=480'],
    // the longest labels the fields accept (999 ft 11 63/64 in, 304.80 m) and both ratio clamps
    longest: [
      '?v=1&l=767999/64&w=767999/64',
      '?v=1&u=m&l=767999/64&w=767999/64',
      '?v=1&l=1200&w=12',
      '?v=1&l=12&w=1200',
    ],
    queries: ['?v=1&l=720&w=480&p=8&ws=15', '?v=1&l=1200&w=12'],
  },
  hints: [
    { key: 'length', site: 'site.calculator.hintFt', describedBy: 'calc-length-hint' },
    { key: 'width', site: 'site.calculator.hintFt', describedBy: 'calc-width-hint' },
  ],
};
