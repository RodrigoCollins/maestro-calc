import { enCommon } from '../../../packages/i18n/src/catalogs/en/common.ts';
import { enRoofPitch } from '../../../packages/i18n/src/catalogs/en/roof-pitch.ts';
import { enSite } from '../../../packages/i18n/src/catalogs/en/site.ts';
import { esCommon } from '../../../packages/i18n/src/catalogs/es/common.ts';
import { esRoofPitch } from '../../../packages/i18n/src/catalogs/es/roof-pitch.ts';
import { esSite } from '../../../packages/i18n/src/catalogs/es/site.ts';
import type { E2eSpec } from './calculator-pages.ts';

/** The figures of a state: pitch in 12, degrees, rafter in feet. */
type Figures = readonly [string, string, string];

/*
 * The hand-verified cases of calc-roof-pitch, with a 12 ft rafter run and a 12 in overhang (156 in
 * of run): 6 in 12 is atan(1/2) = 26.57°, rafter 156 in × √1.25 = 14.53 ft; 9 in 12 is
 * 156 × 1.25 = 195 in = 16.25 ft exactly.
 */
const DEFAULTS: Figures = ['6.00', '26.57', '14.53'];
const LOW: Figures = ['3.00', '14.04', '13.40'];
const FOUR: Figures = ['4.00', '18.43', '13.70'];
const NINE: Figures = ['9.00', '36.87', '16.25'];
const TWELVE: Figures = ['12.00', '45.00', '18.38'];
/** 10 cm over 40 cm, a 4 m rafter run and a 30 cm overhang: 4.3 m × √1.0625 = 14.54 ft. */
const METRIC_BARE: Figures = ['3.00', '14.04', '14.54'];

const COVERINGS = ['asphalt', 'tile', 'metal', 'roll', 'slate', 'wood'] as const;

/**
 * The record of the roof pitch page (site-quality › [SQ37]). The page has an answer whose case
 * carries the IRC check, and no drawing yet (the roof triangle is a tracked follow-up).
 */
export const ROOF_PITCH: E2eSpec = {
  locales: {
    en: { catalog: enRoofPitch, site: enSite, common: enCommon },
    es: { catalog: esRoofPitch, site: esSite, common: esCommon },
  },
  ready: 'rise',
  inputs: 4,
  numeric: [],
  figures: ['pitch', 'angle', 'rafter'],
  defaults: DEFAULTS,
  primary: { en: '6.00 in 12', es: '6.00 en 12' },
  controls: 13,
  // a 20 ft rafter run: 252 in of run × √1.25 = 281.74 in = 23.48 ft
  typed: {
    key: 'rafterRun',
    text: '20',
    param: 'rr=240',
    shown: '20 ft',
    back: '12',
    figures: ['6.00', '26.57', '23.48'],
  },
  states: [
    { name: 'default 6 in 12', query: '?v=1', figures: DEFAULTS },
    { name: '3 in 12', query: '?v=1&r=3', figures: LOW },
    { name: '4 in 12', query: '?v=1&r=4', figures: FOUR },
    { name: '9 in 12', query: '?v=1&r=9', figures: NINE },
    { name: '12 in 12', query: '?v=1&r=12', figures: TWELVE },
  ],
  metric: {
    query: '?v=1&u=m',
    shown: { rise: '15.24 cm', run: '30.48 cm', rafterRun: '3.6576 m', overhang: '30.48 cm' },
    back: { rise: '6 in', run: '12 in', rafterRun: '12 ft', overhang: '12 in' },
    primary: '26.57',
    hint: { key: 'rafterRun', site: 'site.calculator.hintM' },
    bare: {
      texts: { rise: '10', run: '40', rafterRun: '4', overhang: '30' },
      query: '?v=1&u=m&r=500/127&n=2000/127&rr=20000/127&oh=1500/127',
      figures: METRIC_BARE,
      back: { key: 'rafterRun', shown: '20000/127 in', param: 'rr=20000/127' },
    },
  },
  tabOrder: [
    '[data-unit="imperial"]',
    '[data-unit="metric"]',
    '#calc-rise',
    '#calc-run',
    '#calc-rafterRun',
    '#calc-overhang',
    ...COVERINGS.map((covering) => `[data-choice="covering"] [value="${covering}"]`),
    '.calc-result a',
    '[data-copy]',
    '[data-share]',
  ],
  share: { change: { key: 'rise', text: '9' }, query: '?v=1&r=9' },
  bounds: [{ key: 'overhang', text: '11 ft', code: 'ABOVE_MAX', bound: '120 in', restore: '12' }],
  // the three cases of the answer in both unit systems: the sentences whose length the answer
  // reserve is measured on (calculator-page › [CP60])
  layoutQueries: [
    '?v=1',
    '?v=1&r=3',
    '?v=1&r=1',
    '?v=1&r=3&c=slate',
    '?v=1&u=m',
    '?v=1&u=m&r=3',
    '?v=1&u=m&r=1',
    '?v=1&u=m&r=3&c=slate',
  ],
  answer: {
    default: {
      en: 'A rise of 6 in over a run of 1 ft gives a pitch of 6.00 in 12, 26.57°. It meets the IRC minimum slope for the chosen covering.',
      es: 'Una subida de 6 in sobre un recorrido de 1 ft es una pendiente de 6.00 en 12, 26.57°. Cumple la pendiente mínima del IRC para la cubierta elegida.',
    },
    // the answer does not name the rafter, so the typed rafter run keeps the default sentence
    typed: {
      en: 'A rise of 6 in over a run of 1 ft gives a pitch of 6.00 in 12, 26.57°. It meets the IRC minimum slope for the chosen covering.',
      es: 'Una subida de 6 in sobre un recorrido de 1 ft es una pendiente de 6.00 en 12, 26.57°. Cumple la pendiente mínima del IRC para la cubierta elegida.',
    },
    metric: {
      en: 'A rise of 15.24 cm over a run of 30.48 cm gives a pitch of 6.00 in 12, 26.57°. It meets the IRC minimum slope for the chosen covering.',
      es: 'Una subida de 15.24 cm sobre un recorrido de 30.48 cm es una pendiente de 6.00 en 12, 26.57°. Cumple la pendiente mínima del IRC para la cubierta elegida.',
    },
  },
  hints: [
    { key: 'rise', site: 'site.calculator.hintIn', describedBy: 'calc-rise-hint' },
    { key: 'run', site: 'site.calculator.hintIn', describedBy: 'calc-run-hint' },
    { key: 'rafterRun', site: 'site.calculator.hintFt', describedBy: 'calc-rafterRun-hint' },
    { key: 'overhang', site: 'site.calculator.hintIn', describedBy: 'calc-overhang-hint' },
  ],
};
