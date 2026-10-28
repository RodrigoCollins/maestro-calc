import { enCommon } from '../../../packages/i18n/src/catalogs/en/common.ts';
import { enRectangleArea } from '../../../packages/i18n/src/catalogs/en/rectangle-area.ts';
import { enSite } from '../../../packages/i18n/src/catalogs/en/site.ts';
import { esCommon } from '../../../packages/i18n/src/catalogs/es/common.ts';
import { esRectangleArea } from '../../../packages/i18n/src/catalogs/es/rectangle-area.ts';
import { esSite } from '../../../packages/i18n/src/catalogs/es/site.ts';
import type { E2eSpec } from './calculator-pages.ts';

/** The figures of a state: square feet, square yards, square meters. */
type Figures = readonly [string, string, string];

/** The hand-verified cases of calc-rectangle-area (1 ft² = 1/9 yd² = 0.09290304 m², exact). */
const DEFAULTS: Figures = ['100.00', '11.11', '9.29'];
const WORKED: Figures = ['120.00', '13.33', '11.15'];
const FEET_INCHES: Figures = ['125.00', '13.89', '11.61'];
const LARGE: Figures = ['300.00', '33.33', '27.87'];
const LENGTH_20: Figures = ['200.00', '22.22', '18.58'];
/** 4 m by 3 m, typed as bare numbers in the metric system. */
const METRIC_BARE: Figures = ['129.17', '14.35', '12.00'];

/**
 * The record of the square footage page (site-quality › [SQ37]): the strings, states and sentences
 * the generic suites drive. The page has an answer and a drawing, and nothing else of the optional
 * groups.
 */
export const RECTANGLE_AREA: E2eSpec = {
  locales: {
    en: { catalog: enRectangleArea, site: enSite, common: enCommon },
    es: { catalog: esRectangleArea, site: esSite, common: esCommon },
  },
  ready: 'length',
  inputs: 2,
  numeric: [],
  figures: ['areaFt2', 'areaYd2', 'areaM2'],
  defaults: DEFAULTS,
  primary: { en: '100.00 square feet', es: '100.00 pies cuadrados' },
  controls: 5,
  typed: {
    key: 'length',
    text: '20',
    param: 'l=240',
    shown: '20 ft',
    back: '10',
    figures: LENGTH_20,
  },
  states: [
    { name: 'worked example 12 ft by 10 ft', query: '?v=1&l=144', figures: WORKED },
    { name: 'default 10 ft by 10 ft', query: '?v=1', figures: DEFAULTS },
    { name: '12 ft 6 in by 10 ft', query: '?v=1&l=150', figures: FEET_INCHES },
    { name: '20 ft by 15 ft', query: '?v=1&l=240&w=180', figures: LARGE },
  ],
  metric: {
    query: '?v=1&u=m',
    shown: { length: '3.048 m', width: '3.048 m' },
    back: { length: '10 ft', width: '10 ft' },
    primary: '9.29',
    hint: { key: 'length', site: 'site.calculator.hintM' },
    bare: {
      texts: { length: '4', width: '3' },
      query: '?v=1&u=m&l=20000/127&w=15000/127',
      figures: METRIC_BARE,
      back: { key: 'length', shown: '20000/127 in', param: 'l=20000/127' },
    },
  },
  tabOrder: [
    '[data-unit="imperial"]',
    '[data-unit="metric"]',
    '#calc-length',
    '#calc-width',
    '[data-copy]',
  ],
  bounds: [
    { key: 'length', text: '100001 ft', code: 'ABOVE_MAX', bound: '100,000 ft', restore: '10' },
    { key: 'width', text: '100001 ft', code: 'ABOVE_MAX', bound: '100,000 ft', restore: '10' },
  ],
  // The four hand-verified cases in both unit systems: the sentences whose length the reserve is
  // measured on (calculator-page › [CP73]).
  layoutQueries: [
    '?v=1',
    '?v=1&l=144',
    '?v=1&l=150',
    '?v=1&l=240&w=180',
    '?v=1&u=m',
    '?v=1&u=m&l=144',
    '?v=1&u=m&l=150',
    '?v=1&u=m&l=240&w=180',
  ],
  answer: {
    default: {
      en: 'A 10 ft by 10 ft area is 100.00 square feet.',
      es: 'Un área de 10 ft por 10 ft mide 100.00 pies cuadrados.',
    },
    typed: {
      en: 'A 20 ft by 10 ft area is 200.00 square feet.',
      es: 'Un área de 20 ft por 10 ft mide 200.00 pies cuadrados.',
    },
    metric: {
      en: 'A 3.05 m by 3.05 m area is 9.29 square meters.',
      es: 'Un área de 3.05 m por 3.05 m mide 9.29 metros cuadrados.',
    },
  },
  // The plan of blueprint-drawing: the labels are language-free (`dimensionText` and the panel
  // figure with its symbol), the name is the page message of each language.
  drawing: {
    labels: ['10 ft', '10 ft', '100.00 ft²'],
    name: {
      en: 'Plan: 10 ft by 10 ft, 100.00 ft²',
      es: 'Plano: 10 ft por 10 ft, 100.00 ft²',
    },
    typed: {
      key: 'length',
      text: '12\' 6"',
      labels: ['12 ft 6 in', '10 ft', '125.00 ft²'],
      name: {
        en: 'Plan: 12 ft 6 in by 10 ft, 125.00 ft²',
        es: 'Plano: 12 ft 6 in por 10 ft, 125.00 ft²',
      },
      ratio: 1.25,
    },
    kept: { key: 'length', text: '20 ft', labels: ['20 ft', '10 ft', '200.00 ft²'] },
    metric: ['3.05 m', '3.05 m', '9.29 m²'],
    // 32 ft square: 1,024.00 ft² goes below, 95.13 m² alone would fit inside; 25 ft by 40 ft
    toggles: ['?v=1&l=384&w=384', '?v=1&l=300&w=480'],
    // the longest labels the fields accept (99,999 ft 11 63/64 in, 30,479.97 m) and both clamps
    longest: [
      '?v=1&l=76799999/64&w=76799999/64',
      '?v=1&u=m&l=1199999&w=1199999',
      '?v=1&l=1200&w=12',
      '?v=1&l=12&w=1200',
    ],
    queries: ['?v=1&l=240&w=180', '?v=1&l=1200&w=12'],
  },
  hints: [
    { key: 'length', site: 'site.calculator.hintFt', describedBy: 'calc-length-hint' },
    { key: 'width', site: 'site.calculator.hintFt', describedBy: 'calc-width-hint' },
  ],
};
