import { enCommon } from '../../../packages/i18n/src/catalogs/en/common.ts';
import { enConcrete } from '../../../packages/i18n/src/catalogs/en/concrete.ts';
import { enSite } from '../../../packages/i18n/src/catalogs/en/site.ts';
import { esCommon } from '../../../packages/i18n/src/catalogs/es/common.ts';
import { esConcrete } from '../../../packages/i18n/src/catalogs/es/concrete.ts';
import { esSite } from '../../../packages/i18n/src/catalogs/es/site.ts';

/** What differs between the two calculator pages: the paths and the words (taken from the catalogs). */
export interface ConcretePage {
  readonly locale: 'en' | 'es';
  readonly path: string;
  readonly other: string;
  readonly concrete: Record<string, string>;
  readonly site: Record<string, string>;
  readonly common: Record<string, string>;
  /** The short answer of the slab at 20 ft x 10 ft x 4 in. */
  readonly slab20: string;
  /** The short answer of the default slab in the metric system. */
  readonly metric: string;
  /** The start of the short answer of each shape. */
  readonly starts: Record<string, string>;
  /** The end of the short answer for a bag size. */
  readonly bagEnd: (lb: number, bags: number) => string;
  readonly yieldLine: (value: string) => string;
}

export const CONCRETE_PAGES: readonly ConcretePage[] = [
  {
    locale: 'en',
    path: '/concrete-calculator',
    other: '/es/calculadora-de-concreto',
    concrete: enConcrete,
    site: enSite,
    common: enCommon,
    slab20:
      'Slab (20 ft × 10 ft, 4 in thick): 2.72 cubic yards with 10% extra. Bags of 80 lb: 123.',
    metric:
      'Slab (3.66 m × 3.05 m, 10.16 cm thick): 1.25 cubic meters with 10% extra. Bags of 80 lb: 74.',
    starts: { slab: 'Slab (', footing: 'Footing (', column: 'Column (', steps: 'Steps (' },
    bagEnd: (lb, bags) => `Bags of ${String(lb)} lb: ${String(bags)}.`,
    yieldLine: (value) => `About ${value} cubic feet per bag`,
  },
  {
    locale: 'es',
    path: '/es/calculadora-de-concreto',
    other: '/concrete-calculator',
    concrete: esConcrete,
    site: esSite,
    common: esCommon,
    slab20:
      'Losa (20 ft × 10 ft, 4 in de espesor): 2.72 yardas cúbicas con 10% de extra. Bolsas de 80 lb: 123.',
    metric:
      'Losa (3.66 m × 3.05 m, 10.16 cm de espesor): 1.25 metros cúbicos con 10% de extra. Bolsas de 80 lb: 74.',
    starts: { slab: 'Losa (', footing: 'Zapata (', column: 'Columna (', steps: 'Escalones (' },
    bagEnd: (lb, bags) => `Bolsas de ${String(lb)} lb: ${String(bags)}.`,
    yieldLine: (value) => `Unos ${value} pies cúbicos por bolsa`,
  },
];

/** The figures of a state: cubic yards, cubic feet, cubic meters, before the extra, bags. */
export type Figures = readonly [string, string, string, string, string];

/** The hand-verified states of calculator-page › Live recalculation, and their links. */
export const STATES: readonly { name: string; query: string; figures: Figures }[] = [
  { name: 'default', query: '', figures: ['1.63', '44.00', '1.25', '40.00', '74'] },
  { name: 'length 20 ft', query: '?v=1&l=240', figures: ['2.72', '73.33', '2.08', '66.67', '123'] },
  { name: 'bag 60 lb', query: '?v=1&bg=60', figures: ['1.63', '44.00', '1.25', '40.00', '98'] },
  { name: 'bag 40 lb', query: '?v=1&bg=40', figures: ['1.63', '44.00', '1.25', '40.00', '147'] },
  { name: 'waste 0', query: '?v=1&ws=0', figures: ['1.48', '40.00', '1.13', '40.00', '67'] },
  { name: 'waste 15', query: '?v=1&ws=15', figures: ['1.70', '46.00', '1.30', '40.00', '77'] },
  {
    name: 'footing defaults',
    query: '?v=1&sh=footing',
    figures: ['0.43', '11.73', '0.33', '10.67', '20'],
  },
  {
    name: 'footing F1',
    query: '?v=1&sh=footing&l=216&n=3',
    figures: ['1.96', '52.80', '1.50', '48.00', '88'],
  },
  {
    name: 'column defaults',
    query: '?v=1&sh=column',
    figures: ['0.26', '6.91', '0.20', '6.28', '12'],
  },
  {
    name: 'column C2',
    query: '?v=1&sh=column&n=4',
    figures: ['1.02', '27.65', '0.78', '25.13', '47'],
  },
  {
    name: 'steps defaults',
    query: '?v=1&sh=steps',
    figures: ['0.52', '14.12', '0.40', '12.83', '24'],
  },
  {
    name: 'metric S3',
    query: '?v=1&u=m&l=20000/127&w=15000/127&t=500/127',
    figures: ['1.73', '46.62', '1.32', '42.38', '78'],
  },
];

/** The shapes and their visible dimension fields, in the order of the form (calculator-page › [CP11]). */
export const SHAPE_FIELDS: Record<string, readonly string[]> = {
  slab: ['length', 'width', 'thickness'],
  footing: ['length', 'footingWidth', 'footingDepth', 'count'],
  column: ['diameter', 'height', 'count'],
  steps: ['stepWidth', 'rise', 'run', 'stepCount'],
};
