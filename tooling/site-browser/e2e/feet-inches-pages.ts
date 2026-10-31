import { enCommon } from '../../../packages/i18n/src/catalogs/en/common.ts';
import { enFeetInches } from '../../../packages/i18n/src/catalogs/en/feet-inches.ts';
import { enSite } from '../../../packages/i18n/src/catalogs/en/site.ts';
import { esCommon } from '../../../packages/i18n/src/catalogs/es/common.ts';
import { esFeetInches } from '../../../packages/i18n/src/catalogs/es/feet-inches.ts';
import { esSite } from '../../../packages/i18n/src/catalogs/es/site.ts';
import type { E2eSpec } from './calculator-pages.ts';

/** The figures of a state: feet and inches, inches, meters. */
type Figures = readonly [string, string, string];

/*
 * The hand-verified cases of calc-feet-inches (exact; 1 in = 0.0254 m; the feet-and-inches figure to
 * the nearest 1/16 in). Default: 150 + 44.25 = 194.25 in = 16 ft 2 1/4 in = 4.934 m.
 */
const DEFAULTS: Figures = ['16 ft 2 1/4 in', '194.25', '4.934'];
const SUBTRACT: Figures = ['8 ft 9 3/4 in', '105.75', '2.686'];
const LONGER: Figures = ['2 ft 6 in', '30.00', '0.762'];
const MULTIPLY: Figures = ['25 ft', '300.00', '7.620'];
const DIVIDE_7: Figures = ['1 ft 9 7/16 in', '21.43', '0.544'];
/** 20 ft + 3 ft 8 1/4 in = 284.25 in = 23 ft 8 1/4 in = 7.220 m. */
const FIRST_20: Figures = ['23 ft 8 1/4 in', '284.25', '7.220'];
/** 2 m + 1.5 m typed as bare numbers: 3.5 m = 137.80 in = 11 ft 5 13/16 in. */
const METRIC_BARE: Figures = ['11 ft 5 13/16 in', '137.80', '3.500'];

const ANSWER_DEFAULT = {
  en: '12 ft 6 in plus 3 ft 8 1/4 in is 16 ft 2 1/4 in.',
  es: '12 ft 6 in más 3 ft 8 1/4 in da 16 ft 2 1/4 in.',
} as const;

/**
 * The record of the feet and inches page (site-quality › [SQ37]): the strings, states and sentences
 * the generic suites drive. The page has an answer, an operation choice and the bars drawing; no
 * shopping or price.
 */
export const FEET_INCHES: E2eSpec = {
  locales: {
    en: { catalog: enFeetInches, site: enSite, common: enCommon },
    es: { catalog: esFeetInches, site: esSite, common: esCommon },
  },
  ready: 'first',
  inputs: 3,
  numeric: ['factor'],
  figures: ['result', 'resultIn', 'resultM'],
  defaults: DEFAULTS,
  primary: { en: '16 ft 2 1/4 in', es: '16 ft 2 1/4 in' },
  controls: 10,
  typed: {
    key: 'first',
    text: '20',
    param: 'a=240',
    shown: '20 ft',
    back: '12 ft 6 in',
    figures: FIRST_20,
  },
  states: [
    { name: 'default sum', query: '?v=1', figures: DEFAULTS },
    { name: 'subtraction', query: '?v=1&o=subtract', figures: SUBTRACT },
    { name: 'second length longer', query: '?v=1&o=subtract&a=120&b=150', figures: LONGER },
    { name: 'multiplication', query: '?v=1&o=multiply', figures: MULTIPLY },
    { name: 'division into 7', query: '?v=1&o=divide&n=7', figures: DIVIDE_7 },
  ],
  metric: {
    query: '?v=1&u=m',
    shown: { first: '3.81 m', second: '1.12395 m' },
    back: { first: '12 ft 6 in', second: '3 ft 8 1/4 in' },
    primary: '4.934',
    hint: { key: 'first', site: 'site.calculator.hintM' },
    bare: {
      texts: { first: '2', second: '1.5' },
      query: '?v=1&u=m&a=10000/127&b=7500/127',
      figures: METRIC_BARE,
      back: { key: 'first', shown: '10000/127 in', param: 'a=10000/127' },
    },
  },
  tabOrder: [
    '[data-unit="imperial"]',
    '[data-unit="metric"]',
    '#calc-first',
    '[data-choice="operation"] [value="add"]',
    '[data-choice="operation"] [value="subtract"]',
    '[data-choice="operation"] [value="multiply"]',
    '[data-choice="operation"] [value="divide"]',
    '#calc-second',
    '.calc-result a',
    '[data-copy]',
    '[data-share]',
  ],
  // calculator-page › [CP79]: 15 ft is 180 in, written as a=180
  share: { change: { key: 'first', text: '15 ft' }, query: '?v=1&a=180' },
  bounds: [
    { key: 'first', text: '1001 ft', code: 'ABOVE_MAX', bound: '1,000 ft', restore: '12 ft 6 in' },
  ],
  // The longest sentences of each case of the answer in both unit systems (calculator-page › [CP60]).
  layoutQueries: [
    '?v=1',
    '?v=1&o=subtract&a=120&b=150',
    '?v=1&o=divide&n=7',
    '?v=1&a=767999/64&b=767999/64',
    '?v=1&u=m',
    '?v=1&u=m&o=subtract&a=120&b=150',
    '?v=1&u=m&o=divide&n=7',
    '?v=1&u=m&a=767999/64&b=767999/64',
  ],
  answer: {
    default: ANSWER_DEFAULT,
    typed: {
      en: '20 ft plus 3 ft 8 1/4 in is 23 ft 8 1/4 in.',
      es: '20 ft más 3 ft 8 1/4 in da 23 ft 8 1/4 in.',
    },
    metric: {
      en: '3.81 m plus 1.12 m is 4.934 m.',
      es: '3.81 m más 1.12 m da 4.934 m.',
    },
  },
  // The bars of blueprint-drawing: both lengths and the result to scale, each text above its bar;
  // every label is a length, so the texts are the same in both languages.
  drawing: {
    labels: ['12 ft 6 in', '3 ft 8 1/4 in', '16 ft 2 1/4 in'],
    name: ANSWER_DEFAULT,
    typed: {
      key: 'first',
      text: '20',
      labels: ['20 ft', '3 ft 8 1/4 in', '23 ft 8 1/4 in'],
      name: {
        en: '20 ft plus 3 ft 8 1/4 in is 23 ft 8 1/4 in.',
        es: '20 ft más 3 ft 8 1/4 in da 23 ft 8 1/4 in.',
      },
      // the first bar: 240 / 284.25 × 288 = 243.2 long, 16 tall
      ratio: 243.2 / 16,
    },
    kept: {
      key: 'first',
      text: '15 ft',
      labels: ['15 ft', '3 ft 8 1/4 in', '18 ft 8 1/4 in'],
    },
    metric: ['3.81 m', '1.12 m', '4.934 m'],
    toggles: ['?v=1&o=subtract&a=120&b=150', '?v=1&o=divide&n=7'],
    // the longest labels the fields accept, and a bar far shorter than the other
    longest: [
      '?v=1&a=767999/64&b=767999/64',
      '?v=1&u=m&a=767999/64&b=767999/64',
      '?v=1&a=1&b=767999/64',
    ],
    queries: ['?v=1&o=multiply', '?v=1&o=divide&n=7'],
  },
  hints: [
    { key: 'first', site: 'site.calculator.hintFt', describedBy: 'calc-first-hint' },
    { key: 'second', site: 'site.calculator.hintFt', describedBy: 'calc-second-hint' },
  ],
};
