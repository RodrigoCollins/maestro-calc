import { enCommon } from '../../../packages/i18n/src/catalogs/en/common.ts';
import { enFence } from '../../../packages/i18n/src/catalogs/en/fence.ts';
import { enSite } from '../../../packages/i18n/src/catalogs/en/site.ts';
import { esCommon } from '../../../packages/i18n/src/catalogs/es/common.ts';
import { esFence } from '../../../packages/i18n/src/catalogs/es/fence.ts';
import { esSite } from '../../../packages/i18n/src/catalogs/es/site.ts';
import type { E2eSpec } from './calculator-pages.ts';

/**
 * The figures of a state: concrete and gravel (cubic feet), the hole width and depth, then the
 * boards, posts, rails and 80 lb bags of the shopping list. The boards come first among the lines:
 * both the typed length and a style press change them, which the CSP suite waits on.
 */
type Figures = readonly [string, string, string, string, string, string, string, string];

const fill = (
  concrete: string,
  gravel: string,
  depth: string,
  [posts, rails, boards, bags]: readonly [string, string, string, string],
): Figures => [concrete, gravel, '10 1/2 in', depth, boards, posts, rails, bags];

/*
 * The hand-verified cases of calc-fence (Quikrete: a hole 3 times the post, a third of the post in
 * the ground plus 6 in of gravel; 0.60 ft³ per 80 lb bag). Default: 100 ft with posts every 8 ft is
 * 13 sections, 14 posts and 39 rails; board-on-board, 2 × 1,200 ÷ 9.5 = 252.6, so 253 boards;
 * 14 × (π × 5.25² − 3.5²) × 36 in³ = 21.68 ft³, 37 bags; the gravel 14 × π × 5.25² × 6 in³ = 4.21 ft³.
 */
const DEFAULTS = fill('21.68', '4.21', '42 in', ['14', '39', '253', '37']);
const FIFTY = fill('12.39', '2.41', '42 in', ['8', '21', '127', '21']);
const TWO_HUNDRED = fill('40.27', '7.82', '42 in', ['26', '75', '506', '68']);
const SIX_FT = fill('27.88', '5.41', '42 in', ['18', '51', '253', '47']);
const TWO_GATES = fill('24.78', '4.81', '42 in', ['16', '39', '253', '42']);
const PICKET_4 = fill('14.46', '4.21', '30 in', ['14', '39', '150', '25']);
const RAIL_4 = fill('14.46', '4.21', '30 in', ['14', '26', '0', '25']);
/** 30 m long, 2 m high, posts every 2.5 m, typed as bare numbers: 12 sections, 13 posts. */
const METRIC_BARE = [
  '22.02',
  '3.91',
  '10 1/2 in',
  '45 3/8 in',
  '249',
  '13',
  '36',
  '37',
] as const satisfies Figures;

const ANSWER_DEFAULT = {
  en: 'Privacy fence 100 ft long and 6 ft high, posts every 8 ft: 14 posts, 39 rails, 253 boards and 37 bags of 80 lb concrete.',
  es: 'Cerca de privacidad de 100 ft y 6 ft de alto, postes cada 8 ft: 14 postes, 39 travesaños, 253 tablas y 37 bolsas de 80 lb.',
} as const;

/** The board fields each style shows, in the order of the form. */
const STYLE_FIELDS = {
  privacy: ['boardWidth', 'boardSpace'],
  picket: ['boardWidth', 'gap'],
  rail: [],
} as const;

/**
 * The record of the fence page (site-quality › [SQ37]): the strings, states and sentences the
 * generic suites drive. The page has an answer per style, a style choice that drives the board
 * fields, four shopping lines, four prices and a drawing of the face of the run.
 */
export const FENCE: E2eSpec = {
  locales: {
    en: { catalog: enFence, site: enSite, common: enCommon },
    es: { catalog: esFence, site: esSite, common: esCommon },
  },
  ready: 'length',
  inputs: 13,
  numeric: ['rails', 'gates'],
  figures: [
    'concreteFt3',
    'gravelFt3',
    'holeDiameter',
    'holeDepth',
    'shopping:2',
    'shopping:0',
    'shopping:1',
    'shopping:3',
  ],
  defaults: DEFAULTS,
  primary: { en: '14 posts', es: '14 postes' },
  controls: 19,
  typed: {
    key: 'length',
    text: '50',
    param: 'l=600',
    shown: '50 ft',
    back: '100',
    figures: FIFTY,
  },
  states: [
    { name: 'default 100 ft privacy fence, 6 ft high', query: '?v=1', figures: DEFAULTS },
    { name: '50 ft', query: '?v=1&l=600', figures: FIFTY },
    { name: '200 ft', query: '?v=1&l=2400', figures: TWO_HUNDRED },
    { name: 'posts every 6 ft', query: '?v=1&sp=72', figures: SIX_FT },
    { name: 'two gates', query: '?v=1&g=2', figures: TWO_GATES },
    { name: '4 ft picket fence', query: '?v=1&h=48&s=picket', figures: PICKET_4 },
    { name: '4 ft rail fence, two rails', query: '?v=1&h=48&s=rail&r=2', figures: RAIL_4 },
  ],
  metric: {
    query: '?v=1&u=m',
    shown: {
      length: '30.48 m',
      height: '1.8288 m',
      spacing: '2.4384 m',
      boardWidth: '13.97 cm',
      postWidth: '8.89 cm',
    },
    back: {
      length: '100 ft',
      height: '6 ft',
      spacing: '8 ft',
      boardWidth: '5 1/2 in',
      postWidth: '3 1/2 in',
    },
    primary: '14',
    hint: { key: 'length', site: 'site.calculator.hintM' },
    bare: {
      texts: { length: '30', height: '2', spacing: '2.5' },
      query: '?v=1&u=m&l=150000/127&h=10000/127&sp=12500/127',
      figures: METRIC_BARE,
      back: { key: 'length', shown: '150000/127 in', param: 'l=150000/127' },
    },
  },
  tabOrder: [
    '[data-unit="imperial"]',
    '[data-unit="metric"]',
    '#calc-length',
    '#calc-height',
    '#calc-spacing',
    '[data-choice="style"] [value="privacy"]',
    '[data-choice="style"] [value="picket"]',
    '[data-choice="style"] [value="rail"]',
    '#calc-boardWidth',
    '#calc-boardSpace',
    '#calc-rails',
    '#calc-gates',
    '#calc-postWidth',
    '#calc-postPrice',
    '#calc-railPrice',
    '#calc-boardPrice',
    '#calc-bagPrice',
    '.calc-result a',
    '[data-copy]',
    '[data-print]',
    '[data-share]',
  ],
  // calculator-page › [CP79]: 50 ft is 600 in, written as l=600
  share: { change: { key: 'length', text: '50 ft' }, query: '?v=1&l=600' },
  bounds: [
    { key: 'length', text: '5001 ft', code: 'ABOVE_MAX', bound: '5,000 ft', restore: '100' },
    { key: 'height', text: '13 ft', code: 'ABOVE_MAX', bound: '12 ft', restore: '6' },
  ],
  choices: [
    {
      key: 'style',
      initial: 'privacy',
      options: [
        {
          value: 'privacy',
          fields: STYLE_FIELDS.privacy,
          starts: { en: 'Privacy fence', es: 'Cerca de privacidad' },
        },
        {
          value: 'picket',
          param: 's=picket',
          fields: STYLE_FIELDS.picket,
          figures: fill('21.68', '4.21', '42 in', ['14', '39', '150', '37']),
          starts: { en: 'Picket fence', es: 'Cerca de estacas' },
        },
        {
          value: 'rail',
          param: 's=rail',
          fields: STYLE_FIELDS.rail,
          figures: fill('21.68', '4.21', '42 in', ['14', '39', '0', '37']),
          starts: { en: 'Rail fence', es: 'Cerca de travesaños' },
        },
      ],
    },
  ],
  prices: [
    {
      input: 'postPrice',
      text: '20',
      output: 'postCost',
      value: '$280.00',
      hinted: true,
      afterTyped: '$160.00',
    },
    {
      input: 'railPrice',
      text: '8',
      output: 'railCost',
      value: '$312.00',
      hinted: true,
      afterTyped: '$168.00',
    },
    {
      input: 'boardPrice',
      text: '3',
      output: 'boardCost',
      value: '$759.00',
      hinted: true,
      afterTyped: '$381.00',
    },
    {
      input: 'bagPrice',
      text: '6',
      output: 'bagCost',
      value: '$222.00',
      hinted: true,
      afterTyped: '$126.00',
    },
  ],
  variant: {
    press: { hook: 'choice', key: 'style', value: 'picket' },
    suffix: '&s=picket',
    price: {
      input: 'postPrice',
      text: '20',
      suffix: '&pp=20',
      output: 'postCost',
      value: '$160.00',
    },
  },
  // The hand-verified cases in both unit systems and every style, with the longest sentence the
  // fields allow (5,000 ft of pickets 1 in wide, posts every foot, 50 gates): the sentences whose
  // length the answer reserve is measured on (calculator-page › [CP60]).
  layoutQueries: [
    '?v=1',
    '?v=1&h=48&s=picket',
    '?v=1&h=48&s=rail&r=2',
    '?v=1&l=60000&h=144&sp=12&g=50&s=picket&gp=0&bw=1',
    '?v=1&u=m',
    '?v=1&u=m&h=48&s=picket',
    '?v=1&u=m&h=48&s=rail&r=2',
    '?v=1&u=m&l=60000&h=144&sp=12&g=50&s=picket&gp=0&bw=1',
  ],
  answer: {
    default: ANSWER_DEFAULT,
    typed: {
      en: 'Privacy fence 50 ft long and 6 ft high, posts every 8 ft: 8 posts, 21 rails, 127 boards and 21 bags of 80 lb concrete.',
      es: 'Cerca de privacidad de 50 ft y 6 ft de alto, postes cada 8 ft: 8 postes, 21 travesaños, 127 tablas y 21 bolsas de 80 lb.',
    },
    metric: {
      en: 'Privacy fence 30.48 m long and 1.83 m high, posts every 2.44 m: 14 posts, 39 rails, 253 boards and 37 bags of 80 lb concrete.',
      es: 'Cerca de privacidad de 30.48 m y 1.83 m de alto, postes cada 2.44 m: 14 postes, 39 travesaños, 253 tablas y 37 bolsas de 80 lb.',
    },
  },
  // The face of the run, its length by its height, with the post spacing note; the name is the
  // answer sentence. The default 100 ft by 6 ft is drawn at the ratio clamp; 18 ft by 6 ft is 3:1.
  drawing: {
    labels: {
      en: ['100 ft', '6 ft', 'Posts every 8 ft'],
      es: ['100 ft', '6 ft', 'Postes cada 8 ft'],
    },
    name: ANSWER_DEFAULT,
    typed: {
      key: 'length',
      text: '18',
      labels: {
        en: ['18 ft', '6 ft', 'Posts every 8 ft'],
        es: ['18 ft', '6 ft', 'Postes cada 8 ft'],
      },
      name: {
        en: 'Privacy fence 18 ft long and 6 ft high, posts every 8 ft: 4 posts, 9 rails, 46 boards and 11 bags of 80 lb concrete.',
        es: 'Cerca de privacidad de 18 ft y 6 ft de alto, postes cada 8 ft: 4 postes, 9 travesaños, 46 tablas y 11 bolsas de 80 lb.',
      },
      ratio: 3,
    },
    kept: {
      key: 'length',
      text: '50 ft',
      labels: {
        en: ['50 ft', '6 ft', 'Posts every 8 ft'],
        es: ['50 ft', '6 ft', 'Postes cada 8 ft'],
      },
    },
    metric: {
      en: ['30.48 m', '1.83 m', 'Posts every 2.44 m'],
      es: ['30.48 m', '1.83 m', 'Postes cada 2.44 m'],
    },
    toggles: ['?v=1&l=384&h=72', '?v=1&l=300&h=144'],
    // the longest labels the fields accept (4,999 ft 11 63/64 in by 11 ft 11 63/64 in) and both ratio clamps
    longest: [
      '?v=1&l=3839999/64&h=9215/64',
      '?v=1&u=m&l=3839999/64&h=9215/64',
      '?v=1&l=1200&h=12',
      '?v=1&l=12&h=144',
    ],
    queries: ['?v=1&l=600', '?v=1&l=1200&h=12'],
  },
  hints: [
    { key: 'length', site: 'site.calculator.hintFt', describedBy: 'calc-length-hint' },
    { key: 'height', site: 'site.calculator.hintFt', describedBy: 'calc-height-hint' },
    { key: 'spacing', site: 'site.calculator.hintFt', describedBy: 'calc-spacing-hint' },
    { key: 'boardWidth', site: 'site.calculator.hintIn', describedBy: 'calc-boardWidth-hint' },
    { key: 'postWidth', site: 'site.calculator.hintIn', describedBy: 'calc-postWidth-hint' },
  ],
};
