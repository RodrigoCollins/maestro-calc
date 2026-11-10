import { enBoardFeet } from '../../../packages/i18n/src/catalogs/en/board-feet.ts';
import { enCommon } from '../../../packages/i18n/src/catalogs/en/common.ts';
import { enSite } from '../../../packages/i18n/src/catalogs/en/site.ts';
import { esBoardFeet } from '../../../packages/i18n/src/catalogs/es/board-feet.ts';
import { esCommon } from '../../../packages/i18n/src/catalogs/es/common.ts';
import { esSite } from '../../../packages/i18n/src/catalogs/es/site.ts';
import type { E2eSpec } from './calculator-pages.ts';

/** The figures of a state: board feet of every piece, of one piece, and cubic feet. */
type Figures = readonly [string, string, string];

/*
 * The hand-verified cases of calc-board-feet (DOC PS 20-20, 2.2 Board measure: thickness in × width
 * in × length ft ÷ 12; a board foot is 144 in³, 1/12 ft³). Default: a 2x4x8 is 2 × 4 × 8 ÷ 12 =
 * 5.33 board feet, 5.33 ÷ 12 = 0.44 ft³.
 */
const DEFAULTS: Figures = ['5.33', '5.33', '0.44'];
const TWO_BY_SIX_10: Figures = ['10.00', '10.00', '0.83'];
const FOUR_BY_FOUR_8: Figures = ['10.67', '10.67', '0.89'];
const ONE_BY_SIX_8: Figures = ['4.00', '4.00', '0.33'];
const TWO_BY_TWELVE_12: Figures = ['24.00', '24.00', '2.00'];
const TEN: Figures = ['53.33', '5.33', '4.44'];
/** A 2x4 10 ft long: 2 × 4 × 10 ÷ 12 = 6.67 board feet, 0.56 ft³. */
const LENGTH_10: Figures = ['6.67', '6.67', '0.56'];
/** 5 cm by 10 cm by 2 m typed as bare numbers: 10,000 cm³ = 610.24 in³ = 4.24 board feet, 0.35 ft³. */
const METRIC_BARE: Figures = ['4.24', '4.24', '0.35'];

const ANSWER_DEFAULT = {
  en: 'A 2 in by 4 in board 8 ft long is 5.33 board feet.',
  es: 'Una pieza de 2 in por 4 in y 8 ft de largo tiene 5.33 pies tablares.',
} as const;

/**
 * The record of the board feet page (site-quality › [SQ37]): the strings, states and sentences the
 * generic suites drive. The page has an answer in two cases (one piece, several), one price and a
 * drawing of the face of the board.
 */
export const BOARD_FEET: E2eSpec = {
  locales: {
    en: { catalog: enBoardFeet, site: enSite, common: enCommon },
    es: { catalog: esBoardFeet, site: esSite, common: esCommon },
  },
  ready: 'thickness',
  inputs: 5,
  numeric: ['pieces'],
  figures: ['boardFeet', 'boardFeetEach', 'volumeFt3'],
  defaults: DEFAULTS,
  primary: { en: '5.33 board feet', es: '5.33 pies tablares' },
  controls: 8,
  typed: {
    key: 'length',
    text: '10',
    param: 'l=120',
    shown: '10 ft',
    back: '8',
    figures: LENGTH_10,
  },
  states: [
    { name: 'default 2x4x8', query: '?v=1', figures: DEFAULTS },
    { name: '2x6, 10 ft long', query: '?v=1&w=6&l=120', figures: TWO_BY_SIX_10 },
    { name: '4x4x8', query: '?v=1&t=4', figures: FOUR_BY_FOUR_8 },
    { name: '1x6x8', query: '?v=1&t=1&w=6', figures: ONE_BY_SIX_8 },
    { name: '2x12, 12 ft long', query: '?v=1&w=12&l=144', figures: TWO_BY_TWELVE_12 },
    { name: 'ten 2x4x8', query: '?v=1&n=10', figures: TEN },
  ],
  metric: {
    query: '?v=1&u=m',
    shown: { thickness: '5.08 cm', width: '10.16 cm', length: '2.4384 m' },
    back: { thickness: '2 in', width: '4 in', length: '8 ft' },
    primary: '5.33',
    hint: { key: 'length', site: 'site.calculator.hintM' },
    bare: {
      texts: { thickness: '5', width: '10', length: '2' },
      query: '?v=1&u=m&t=250/127&w=500/127&l=10000/127',
      figures: METRIC_BARE,
      back: { key: 'length', shown: '10000/127 in', param: 'l=10000/127' },
    },
  },
  tabOrder: [
    '[data-unit="imperial"]',
    '[data-unit="metric"]',
    '#calc-thickness',
    '#calc-width',
    '#calc-length',
    '#calc-pieces',
    '#calc-price',
    '.calc-result a',
    '[data-copy]',
    '[data-print]',
    '[data-share]',
  ],
  // calculator-page › [CP79]: 12 ft is 144 in, written as l=144
  share: { change: { key: 'length', text: '12 ft' }, query: '?v=1&l=144' },
  bounds: [
    { key: 'length', text: '101 ft', code: 'ABOVE_MAX', bound: '100 ft', restore: '8' },
    { key: 'thickness', text: '25 in', code: 'ABOVE_MAX', bound: '24 in', restore: '2' },
  ],
  prices: [
    {
      input: 'price',
      text: '1.50',
      output: 'cost',
      value: '$8.00',
      hinted: true,
      afterTyped: '$10.00',
    },
  ],
  // The hand-verified cases in both unit systems and both cases of the answer, with the longest
  // sentence the fields allow (10,000 pieces of 1 1/2 by 11 1/4 in, 16 ft long): the sentences
  // whose length the answer reserve is measured on (calculator-page › [CP60]).
  layoutQueries: [
    '?v=1',
    '?v=1&n=10',
    '?v=1&w=12&l=144',
    '?v=1&n=10000&t=3/2&w=45/4&l=192',
    '?v=1&u=m',
    '?v=1&u=m&n=10',
    '?v=1&u=m&w=12&l=144',
    '?v=1&u=m&n=10000&t=3/2&w=45/4&l=192',
  ],
  answer: {
    default: ANSWER_DEFAULT,
    typed: {
      en: 'A 2 in by 4 in board 10 ft long is 6.67 board feet.',
      es: 'Una pieza de 2 in por 4 in y 10 ft de largo tiene 6.67 pies tablares.',
    },
    metric: {
      en: 'A 5.08 cm by 10.16 cm board 2.44 m long is 5.33 board feet.',
      es: 'Una pieza de 5.08 cm por 10.16 cm y 2.44 m de largo tiene 5.33 pies tablares.',
    },
  },
  // The face of the board, its length by its width, with the thickness note; the name is the
  // answer sentence. The default 96 in by 4 in is 24:1, drawn at the 4:1 clamp; the typed 1 ft by
  // 4 in is 3:1.
  drawing: {
    labels: { en: ['8 ft', '4 in', '2 in thick'], es: ['8 ft', '4 in', '2 in de grosor'] },
    name: ANSWER_DEFAULT,
    typed: {
      key: 'length',
      text: '1',
      labels: {
        en: ['1 ft', '4 in', '2 in thick'],
        es: ['1 ft', '4 in', '2 in de grosor'],
      },
      name: {
        en: 'A 2 in by 4 in board 1 ft long is 0.67 board feet.',
        es: 'Una pieza de 2 in por 4 in y 1 ft de largo tiene 0.67 pies tablares.',
      },
      ratio: 3,
    },
    kept: {
      key: 'length',
      text: '10 ft',
      labels: {
        en: ['10 ft', '4 in', '2 in thick'],
        es: ['10 ft', '4 in', '2 in de grosor'],
      },
    },
    metric: {
      en: ['2.44 m', '10.16 cm', '5.08 cm thick'],
      es: ['2.44 m', '10.16 cm', '5.08 cm de grosor'],
    },
    toggles: ['?v=1&l=48&w=48', '?v=1&l=30&w=48'],
    // the longest labels the fields accept (99 ft 11 63/64 in by 47 63/64 in) and both ratio clamps
    longest: [
      '?v=1&l=76799/64&w=3071/64',
      '?v=1&u=m&l=76799/64&w=3071/64',
      '?v=1&l=1200&w=12',
      '?v=1&l=12&w=48',
    ],
    queries: ['?v=1&n=10', '?v=1&l=1200&w=12'],
  },
  hints: [
    { key: 'thickness', site: 'site.calculator.hintIn', describedBy: 'calc-thickness-hint' },
    { key: 'width', site: 'site.calculator.hintIn', describedBy: 'calc-width-hint' },
    { key: 'length', site: 'site.calculator.hintFt', describedBy: 'calc-length-hint' },
  ],
};
