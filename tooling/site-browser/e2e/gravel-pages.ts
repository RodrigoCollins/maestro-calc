import { enCommon } from '../../../packages/i18n/src/catalogs/en/common.ts';
import { enGravel } from '../../../packages/i18n/src/catalogs/en/gravel.ts';
import { enSite } from '../../../packages/i18n/src/catalogs/en/site.ts';
import { esCommon } from '../../../packages/i18n/src/catalogs/es/common.ts';
import { esGravel } from '../../../packages/i18n/src/catalogs/es/gravel.ts';
import { esSite } from '../../../packages/i18n/src/catalogs/es/site.ts';
import type { E2eSpec } from './calculator-pages.ts';

/** The figures of a state: short tons, metric tonnes, loose cubic yards to order. */
type Figures = readonly [string, string, string];

/*
 * The hand-verified cases of calc-gravel (compacted 1.83 t/yd³, loose 1.29 t/yd³, WisDOT WHRP
 * G22-05 Table E2; 1 short ton = 0.90718474 t, exact). Default: 20 ft × 10 ft × 4 in = 66.67 ft³
 * = 2.47 yd³, with 5 % extra 2.59 yd³, × 1.83 = 4.74 t, ÷ 1.29 = 3.68 yd³.
 */
const DEFAULTS: Figures = ['4.74', '4.30', '3.68'];
const NO_EXTRA: Figures = ['4.52', '4.10', '3.50'];
const LARGE: Figures = ['12.81', '11.62', '9.93'];
const LOOSE: Figures = ['1.25', '1.14', '0.97'];
/** 30 ft by 10 ft: 100 ft³ = 3.70 yd³, × 1.05 × 1.83 = 7.12 t. */
const LENGTH_30: Figures = ['7.12', '6.46', '5.52'];
/** 4 m by 2 m by 10 cm, typed as bare numbers in the metric system. */
const METRIC_BARE: Figures = ['2.01', '1.82', '1.56'];

/**
 * The record of the gravel page (site-quality › [SQ37]): the strings, states and sentences the
 * generic suites drive. The page has an answer and a drawing, and nothing else of the optional
 * groups.
 */
export const GRAVEL: E2eSpec = {
  locales: {
    en: { catalog: enGravel, site: enSite, common: enCommon },
    es: { catalog: esGravel, site: esSite, common: esCommon },
  },
  ready: 'length',
  inputs: 5,
  numeric: [],
  figures: ['tons', 'tonnes', 'orderYd3'],
  defaults: DEFAULTS,
  primary: { en: '4.74 tons', es: '4.74 toneladas' },
  controls: 10,
  typed: {
    key: 'length',
    text: '30',
    param: 'l=360',
    shown: '30 ft',
    back: '20',
    figures: LENGTH_30,
  },
  states: [
    { name: 'default 20 ft by 10 ft by 4 in, compacted', query: '?v=1', figures: DEFAULTS },
    { name: 'no extra', query: '?v=1&ws=0', figures: NO_EXTRA },
    { name: '30 ft by 12 ft by 6 in', query: '?v=1&l=360&w=144&d=6', figures: LARGE },
    {
      name: '10 ft by 10 ft by 3 in, loose',
      query: '?v=1&l=120&w=120&d=3&pl=loose',
      figures: LOOSE,
    },
  ],
  metric: {
    query: '?v=1&u=m',
    shown: { length: '6.096 m', width: '3.048 m', depth: '10.16 cm' },
    back: { length: '20 ft', width: '10 ft', depth: '4 in' },
    primary: '4.30',
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
    '[data-choice="placement"] [value="compacted"]',
    '[data-choice="placement"] [value="loose"]',
    '#calc-waste',
    '#calc-tonPrice',
    '.calc-result a',
    '[data-copy]',
    '[data-share]',
  ],
  // calculator-page › [CP79]: 15 ft is 180 in, written as l=180
  share: { change: { key: 'length', text: '15 ft' }, query: '?v=1&l=180' },
  bounds: [
    { key: 'length', text: '1001 ft', code: 'ABOVE_MAX', bound: '1,000 ft', restore: '20' },
    { key: 'depth', text: '11 ft', code: 'ABOVE_MAX', bound: '120 in', restore: '4' },
  ],
  // The hand-verified cases in both unit systems and both placements: the sentences whose length the
  // answer reserve is measured on (calculator-page › [CP60]).
  layoutQueries: [
    '?v=1',
    '?v=1&pl=loose',
    '?v=1&l=360&w=144&d=6',
    '?v=1&l=120&w=120&d=3&pl=loose',
    '?v=1&u=m',
    '?v=1&u=m&pl=loose',
    '?v=1&u=m&l=360&w=144&d=6',
    '?v=1&u=m&l=120&w=120&d=3&pl=loose',
  ],
  answer: {
    default: {
      en: 'A 20 ft by 10 ft area, 4 in deep and compacted, needs 4.74 tons of gravel.',
      es: 'Un área de 20 ft por 10 ft, de 4 in de profundidad y compactada, lleva 4.74 toneladas de grava.',
    },
    typed: {
      en: 'A 30 ft by 10 ft area, 4 in deep and compacted, needs 7.12 tons of gravel.',
      es: 'Un área de 30 ft por 10 ft, de 4 in de profundidad y compactada, lleva 7.12 toneladas de grava.',
    },
    metric: {
      en: 'A 6.10 m by 3.05 m area, 10.16 cm deep and compacted, needs 4.30 metric tonnes of gravel.',
      es: 'Un área de 6.10 m por 3.05 m, de 10.16 cm de profundidad y compactada, lleva 4.30 toneladas métricas de grava.',
    },
  },
  // The slab plan of blueprint-drawing with the depth note; the name is the answer sentence.
  drawing: {
    labels: { en: ['20 ft', '10 ft', '4 in deep'], es: ['20 ft', '10 ft', '4 in de profundidad'] },
    name: {
      en: 'A 20 ft by 10 ft area, 4 in deep and compacted, needs 4.74 tons of gravel.',
      es: 'Un área de 20 ft por 10 ft, de 4 in de profundidad y compactada, lleva 4.74 toneladas de grava.',
    },
    typed: {
      key: 'length',
      text: '30',
      labels: {
        en: ['30 ft', '10 ft', '4 in deep'],
        es: ['30 ft', '10 ft', '4 in de profundidad'],
      },
      name: {
        en: 'A 30 ft by 10 ft area, 4 in deep and compacted, needs 7.12 tons of gravel.',
        es: 'Un área de 30 ft por 10 ft, de 4 in de profundidad y compactada, lleva 7.12 toneladas de grava.',
      },
      ratio: 3,
    },
    kept: {
      key: 'length',
      text: '25 ft',
      labels: {
        en: ['25 ft', '10 ft', '4 in deep'],
        es: ['25 ft', '10 ft', '4 in de profundidad'],
      },
    },
    metric: {
      en: ['6.10 m', '3.05 m', '10.16 cm deep'],
      es: ['6.10 m', '3.05 m', '10.16 cm de profundidad'],
    },
    toggles: ['?v=1&l=384&w=384', '?v=1&l=300&w=480'],
    // the longest labels the fields accept (999 ft 11 63/64 in, 304.80 m) and both ratio clamps
    longest: [
      '?v=1&l=767999/64&w=767999/64',
      '?v=1&u=m&l=767999/64&w=767999/64',
      '?v=1&l=1200&w=12',
      '?v=1&l=12&w=1200',
    ],
    queries: ['?v=1&l=360&w=144&d=6', '?v=1&l=1200&w=12'],
  },
  hints: [
    { key: 'length', site: 'site.calculator.hintFt', describedBy: 'calc-length-hint' },
    { key: 'width', site: 'site.calculator.hintFt', describedBy: 'calc-width-hint' },
    { key: 'depth', site: 'site.calculator.hintIn', describedBy: 'calc-depth-hint' },
  ],
};
