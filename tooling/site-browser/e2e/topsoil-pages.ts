import { enCommon } from '../../../packages/i18n/src/catalogs/en/common.ts';
import { enSite } from '../../../packages/i18n/src/catalogs/en/site.ts';
import { enTopsoil } from '../../../packages/i18n/src/catalogs/en/topsoil.ts';
import { esCommon } from '../../../packages/i18n/src/catalogs/es/common.ts';
import { esSite } from '../../../packages/i18n/src/catalogs/es/site.ts';
import { esTopsoil } from '../../../packages/i18n/src/catalogs/es/topsoil.ts';
import type { E2eSpec } from './calculator-pages.ts';

/** The figures of a state: cubic yards, cubic meters, bags. */
type Figures = readonly [string, string, string];

/*
 * The hand-verified cases of calc-topsoil (a bag holds its label, 1 yd³ = 27 ft³, 1 ft = 0.3048 m,
 * exact). Default: 10 ft × 10 ft × 4 in = 33.33 ft³, with 10 % extra 36.67 ft³ = 1.36 yd³ =
 * 1.04 m³, 36.67 ÷ 0.75 = 48.9, so 49 bags of 0.75 cu ft (37 of 1 cu ft, 25 of 1.5 cu ft).
 */
const DEFAULTS: Figures = ['1.36', '1.04', '49'];
const BAG_1: Figures = ['1.36', '1.04', '37'];
const BAG_1_5: Figures = ['1.36', '1.04', '25'];
const NO_EXTRA: Figures = ['1.23', '0.94', '45'];
const DEEP: Figures = ['4.07', '3.11', '147'];
const THIN: Figures = ['6.79', '5.19', '245'];
/** 20 ft by 10 ft: 66.67 ft³, × 1.1 = 73.33 ft³ = 2.72 yd³, 97.8 bags, so 98. */
const LENGTH_20: Figures = ['2.72', '2.08', '98'];
/** 4 m by 2 m by 10 cm, typed as bare numbers in the metric system: 0.88 m³ = 31.08 ft³, 42 bags. */
const METRIC_BARE: Figures = ['1.15', '0.88', '42'];

/**
 * The record of the topsoil page (site-quality › [SQ37]): the strings, states and sentences the
 * generic suites drive. The page has an answer, a bag line, two prices and a drawing.
 */
export const TOPSOIL: E2eSpec = {
  locales: {
    en: { catalog: enTopsoil, site: enSite, common: enCommon },
    es: { catalog: esTopsoil, site: esSite, common: esCommon },
  },
  ready: 'length',
  inputs: 6,
  numeric: [],
  figures: ['volumeYd3', 'volumeM3', 'shopping:0'],
  defaults: DEFAULTS,
  primary: { en: '1.36 cubic yards', es: '1.36 yardas cúbicas' },
  controls: 12,
  typed: {
    key: 'length',
    text: '20',
    param: 'l=240',
    shown: '20 ft',
    back: '10',
    figures: LENGTH_20,
  },
  states: [
    { name: 'default 10 ft by 10 ft by 4 in, 0.75 cu ft bags', query: '?v=1', figures: DEFAULTS },
    { name: '1 cu ft bags', query: '?v=1&bg=1', figures: BAG_1 },
    { name: '1.5 cu ft bags', query: '?v=1&bg=1-5', figures: BAG_1_5 },
    { name: 'no extra', query: '?v=1&ws=0', figures: NO_EXTRA },
    { name: '20 ft by 10 ft by 6 in', query: '?v=1&l=240&w=120&d=6', figures: DEEP },
    { name: '50 ft by 40 ft by 1 in', query: '?v=1&l=600&w=480&d=1', figures: THIN },
  ],
  metric: {
    query: '?v=1&u=m',
    shown: { length: '3.048 m', width: '3.048 m', depth: '10.16 cm' },
    back: { length: '10 ft', width: '10 ft', depth: '4 in' },
    primary: '1.04',
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
    '[data-choice="bag"] [value="0-75"]',
    '[data-choice="bag"] [value="1"]',
    '[data-choice="bag"] [value="1-5"]',
    '#calc-bagPrice',
    '#calc-yardPrice',
    '.calc-result a',
    '[data-copy]',
    '[data-share]',
  ],
  // calculator-page › [CP79]: 15 ft is 180 in, written as l=180
  share: { change: { key: 'length', text: '15 ft' }, query: '?v=1&l=180' },
  bounds: [
    { key: 'length', text: '1001 ft', code: 'ABOVE_MAX', bound: '1,000 ft', restore: '10' },
    { key: 'depth', text: '3 ft', code: 'ABOVE_MAX', bound: '24 in', restore: '4' },
  ],
  prices: [
    {
      input: 'bagPrice',
      text: '3',
      output: 'bagCost',
      value: '$147.00',
      hinted: true,
      afterTyped: '$294.00',
    },
    {
      input: 'yardPrice',
      text: '45',
      output: 'bulkCost',
      value: '$61.11',
      hinted: true,
      afterTyped: '$122.22',
    },
  ],
  variant: {
    press: { hook: 'choice', key: 'bag', value: '1-5' },
    suffix: '&bg=1-5',
    price: { input: 'bagPrice', text: '3', suffix: '&bp=3', output: 'bagCost', value: '$147.00' },
  },
  // The hand-verified cases in both unit systems, with the longest bag size: the sentences whose
  // length the answer reserve is measured on (calculator-page › [CP60]).
  layoutQueries: [
    '?v=1',
    '?v=1&bg=1-5',
    '?v=1&l=240&w=120&d=6',
    '?v=1&l=600&w=480&d=1',
    '?v=1&u=m',
    '?v=1&u=m&bg=1-5',
    '?v=1&u=m&l=240&w=120&d=6',
    '?v=1&u=m&l=600&w=480&d=1',
  ],
  answer: {
    default: {
      en: 'A 10 ft by 10 ft area, 4 in deep, needs 1.36 cubic yards of topsoil: 49 bags of 0.75 cu ft.',
      es: 'Un área de 10 ft por 10 ft, de 4 in de profundidad, lleva 1.36 yardas cúbicas de tierra: 49 bolsas de 0.75 cu ft.',
    },
    typed: {
      en: 'A 20 ft by 10 ft area, 4 in deep, needs 2.72 cubic yards of topsoil: 98 bags of 0.75 cu ft.',
      es: 'Un área de 20 ft por 10 ft, de 4 in de profundidad, lleva 2.72 yardas cúbicas de tierra: 98 bolsas de 0.75 cu ft.',
    },
    metric: {
      en: 'A 3.05 m by 3.05 m area, 10.16 cm deep, needs 1.04 cubic meters of topsoil: 49 bags of 0.75 cu ft.',
      es: 'Un área de 3.05 m por 3.05 m, de 10.16 cm de profundidad, lleva 1.04 metros cúbicos de tierra: 49 bolsas de 0.75 cu ft.',
    },
  },
  // The rectangle plan of blueprint-drawing with the depth note; the name is the answer sentence.
  drawing: {
    labels: { en: ['10 ft', '10 ft', '4 in deep'], es: ['10 ft', '10 ft', '4 in de profundidad'] },
    name: {
      en: 'A 10 ft by 10 ft area, 4 in deep, needs 1.36 cubic yards of topsoil: 49 bags of 0.75 cu ft.',
      es: 'Un área de 10 ft por 10 ft, de 4 in de profundidad, lleva 1.36 yardas cúbicas de tierra: 49 bolsas de 0.75 cu ft.',
    },
    typed: {
      key: 'length',
      text: '30',
      labels: {
        en: ['30 ft', '10 ft', '4 in deep'],
        es: ['30 ft', '10 ft', '4 in de profundidad'],
      },
      name: {
        en: 'A 30 ft by 10 ft area, 4 in deep, needs 4.07 cubic yards of topsoil: 147 bags of 0.75 cu ft.',
        es: 'Un área de 30 ft por 10 ft, de 4 in de profundidad, lleva 4.07 yardas cúbicas de tierra: 147 bolsas de 0.75 cu ft.',
      },
      ratio: 3,
    },
    kept: {
      key: 'length',
      text: '15 ft',
      labels: {
        en: ['15 ft', '10 ft', '4 in deep'],
        es: ['15 ft', '10 ft', '4 in de profundidad'],
      },
    },
    metric: {
      en: ['3.05 m', '3.05 m', '10.16 cm deep'],
      es: ['3.05 m', '3.05 m', '10.16 cm de profundidad'],
    },
    toggles: ['?v=1&l=384&w=384', '?v=1&l=300&w=480'],
    // the longest labels the fields accept (999 ft 11 63/64 in, 304.80 m) and both ratio clamps
    longest: [
      '?v=1&l=767999/64&w=767999/64',
      '?v=1&u=m&l=767999/64&w=767999/64',
      '?v=1&l=1200&w=12',
      '?v=1&l=12&w=1200',
    ],
    queries: ['?v=1&l=240&w=120&d=6', '?v=1&l=1200&w=12'],
  },
  hints: [
    { key: 'length', site: 'site.calculator.hintFt', describedBy: 'calc-length-hint' },
    { key: 'width', site: 'site.calculator.hintFt', describedBy: 'calc-width-hint' },
    { key: 'depth', site: 'site.calculator.hintIn', describedBy: 'calc-depth-hint' },
  ],
};
