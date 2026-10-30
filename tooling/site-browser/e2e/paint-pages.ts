import { enCommon } from '../../../packages/i18n/src/catalogs/en/common.ts';
import { enPaint } from '../../../packages/i18n/src/catalogs/en/paint.ts';
import { enSite } from '../../../packages/i18n/src/catalogs/en/site.ts';
import { esCommon } from '../../../packages/i18n/src/catalogs/es/common.ts';
import { esPaint } from '../../../packages/i18n/src/catalogs/es/paint.ts';
import { esSite } from '../../../packages/i18n/src/catalogs/es/site.ts';
import type { E2eSpec } from './calculator-pages.ts';

/** The figures of a state: gallons, liters, gallon cans. */
type Figures = readonly [string, string, string];

/*
 * The hand-verified cases of calc-paint (350 ft² a gallon per coat, a door 20 ft², a window
 * 15 ft², 1 gal = 3.785411784 L, exact). Default: 2 × (12 + 12) × 8 = 384 ft², less 50 ft² of
 * openings = 334 ft², × 2 coats ÷ 350 = 1.91 gal = 7.22 L, so 2 cans.
 */
const DEFAULTS: Figures = ['1.91', '7.22', '2'];
const THREE_COATS: Figures = ['2.86', '10.84', '3'];
const ONE_COAT: Figures = ['0.95', '3.61', '1'];
const NO_OPENINGS: Figures = ['2.19', '8.31', '3'];
const LARGE: Figures = ['3.31', '12.55', '4'];
const HALL: Figures = ['9.37', '35.47', '10'];
/** 20 ft by 12 ft: 512 ft² of walls, 462 ft² to paint, 924 ÷ 350 = 2.64 gal, 3 cans. */
const LENGTH_20: Figures = ['2.64', '9.99', '3'];
/** 4 m by 3 m with 2.5 m walls, typed as bare numbers: 35 m² = 376.74 ft², 326.74 to paint. */
const METRIC_BARE: Figures = ['1.87', '7.07', '2'];

/**
 * The record of the paint page (site-quality › [SQ37]): the strings, states and sentences the
 * generic suites drive. The page has an answer, a can line, a price and a drawing.
 */
export const PAINT: E2eSpec = {
  locales: {
    en: { catalog: enPaint, site: enSite, common: enCommon },
    es: { catalog: esPaint, site: esSite, common: esCommon },
  },
  ready: 'length',
  inputs: 7,
  numeric: ['doors', 'windows', 'coats'],
  figures: ['gallons', 'liters', 'shopping:0'],
  defaults: DEFAULTS,
  primary: { en: '1.91 gallons', es: '1.91 galones' },
  controls: 10,
  typed: {
    key: 'length',
    text: '20',
    param: 'l=240',
    shown: '20 ft',
    back: '12',
    figures: LENGTH_20,
  },
  states: [
    {
      name: 'default 12 ft by 12 ft, 8 ft walls, 1 door, 2 windows, 2 coats',
      query: '?v=1',
      figures: DEFAULTS,
    },
    { name: 'three coats', query: '?v=1&c=3', figures: THREE_COATS },
    { name: 'one coat', query: '?v=1&c=1', figures: ONE_COAT },
    { name: 'no doors or windows', query: '?v=1&dr=0&wn=0', figures: NO_OPENINGS },
    { name: '20 ft by 15 ft, 9 ft walls', query: '?v=1&l=240&w=180&h=108', figures: LARGE },
    { name: '50 ft by 40 ft hall', query: '?v=1&l=600&w=480&h=120&dr=2&wn=8', figures: HALL },
  ],
  metric: {
    query: '?v=1&u=m',
    shown: { length: '3.6576 m', width: '3.6576 m', height: '2.4384 m' },
    back: { length: '12 ft', width: '12 ft', height: '8 ft' },
    primary: '7.22',
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
    '#calc-coats',
    '#calc-gallonPrice',
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
      input: 'gallonPrice',
      text: '40',
      output: 'cost',
      value: '$80.00',
      hinted: true,
      afterTyped: '$120.00',
    },
  ],
  // The hand-verified cases in both unit systems: the sentences whose length the answer reserve is
  // measured on (calculator-page › [CP60]).
  layoutQueries: [
    '?v=1',
    '?v=1&c=3',
    '?v=1&l=240&w=180&h=108',
    '?v=1&l=600&w=480&h=120&dr=2&wn=8',
    '?v=1&u=m',
    '?v=1&u=m&c=3',
    '?v=1&u=m&l=240&w=180&h=108',
    '?v=1&u=m&l=600&w=480&h=120&dr=2&wn=8',
  ],
  answer: {
    default: {
      en: 'A 12 ft by 12 ft room with 8 ft walls needs 1.91 gallons of paint. Coats: 2. Gallon cans to buy: 2.',
      es: 'Un cuarto de 12 ft por 12 ft con paredes de 8 ft lleva 1.91 galones de pintura. Manos: 2. Latas de un galón a comprar: 2.',
    },
    typed: {
      en: 'A 20 ft by 12 ft room with 8 ft walls needs 2.64 gallons of paint. Coats: 2. Gallon cans to buy: 3.',
      es: 'Un cuarto de 20 ft por 12 ft con paredes de 8 ft lleva 2.64 galones de pintura. Manos: 2. Latas de un galón a comprar: 3.',
    },
    metric: {
      en: 'A 3.66 m by 3.66 m room with 2.44 m walls needs 7.22 liters of paint. Coats: 2. Gallon cans to buy: 2.',
      es: 'Un cuarto de 3.66 m por 3.66 m con paredes de 2.44 m lleva 7.22 litros de pintura. Manos: 2. Latas de un galón a comprar: 2.',
    },
  },
  // The floor plan of blueprint-drawing with the wall height note; the name is the answer sentence.
  drawing: {
    labels: { en: ['12 ft', '12 ft', '8 ft walls'], es: ['12 ft', '12 ft', 'paredes de 8 ft'] },
    name: {
      en: 'A 12 ft by 12 ft room with 8 ft walls needs 1.91 gallons of paint. Coats: 2. Gallon cans to buy: 2.',
      es: 'Un cuarto de 12 ft por 12 ft con paredes de 8 ft lleva 1.91 galones de pintura. Manos: 2. Latas de un galón a comprar: 2.',
    },
    typed: {
      key: 'length',
      text: '36',
      labels: {
        en: ['36 ft', '12 ft', '8 ft walls'],
        es: ['36 ft', '12 ft', 'paredes de 8 ft'],
      },
      name: {
        en: 'A 36 ft by 12 ft room with 8 ft walls needs 4.10 gallons of paint. Coats: 2. Gallon cans to buy: 5.',
        es: 'Un cuarto de 36 ft por 12 ft con paredes de 8 ft lleva 4.10 galones de pintura. Manos: 2. Latas de un galón a comprar: 5.',
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
