import type { Locale } from '@maestro-calc/i18n';
import type { CalculatorPageId } from '../../routing/templates.ts';
import type { ShownFigures } from './shown-figures.ts';

/*
 * The methodology contract as a table by calculator id (trust-pages › Methodology page, design K4).
 * A routed id without a row is a type error, so a go-live without its section does not compile.
 * Test support only: it sits outside the coverage and the generic-code scans.
 */

/** One published case: the query that loads it (empty for the page's starting values) and its figures. */
export interface PublishedCase {
  readonly query: string;
  readonly figures: readonly string[];
}

/** What the methodology page must hold for one calculator. */
export interface MethodologyRow {
  /** The id of the `h2` that opens the section, by locale. */
  readonly anchor: Readonly<Record<Locale, string>>;
  /** The Markdown link to the calculator page that the section carries, by locale. */
  readonly pageLink: Readonly<Record<Locale, string>>;
  /** The formulas, as written in the section. */
  readonly formulas: Readonly<Record<Locale, readonly string[]>>;
  /** Patterns the section must match: the rule of thumb, the rounding, the word "approximately". */
  readonly honesty: Readonly<Record<Locale, readonly RegExp[]>>;
  /** The names of the figure columns after the query cell, in table order. */
  readonly columns: readonly string[];
  /** The displayed figures in the order of `columns`, read from what the page shows. */
  figuresOf(shown: ShownFigures): readonly string[];
  /** The hand-verified rows of the table, identical in both locales. */
  readonly published: readonly PublishedCase[];
}

const figure = (shown: ShownFigures, key: string): string => shown.figures[key] ?? '';

export const METHODOLOGY_ROWS = {
  concrete: {
    anchor: { en: 'concrete', es: 'concreto' },
    pageLink: {
      en: '[concrete calculator](/concrete-calculator)',
      es: '[calculadora de concreto](/es/calculadora-de-concreto)',
    },
    formulas: {
      en: [
        'length × width × thickness',
        'length × width × depth × pieces',
        'π × (diameter / 2)² × height × pieces',
        'step width × run × rise × N(N+1)/2',
      ],
      es: [
        'largo × ancho × espesor',
        'largo × ancho × profundidad × piezas',
        'π × (diámetro / 2)² × altura × piezas',
        'ancho de los escalones × profundidad (run) × altura (rise) × N(N+1)/2',
      ],
    },
    honesty: {
      en: [
        /extra for waste is added to the volume before the bags are counted/i,
        /rounded up/i,
        /rule of thumb/i,
        /approximately/i,
      ],
      es: [
        /extra por desperdicio se suma al volumen antes de contar las bolsas/i,
        /hacia arriba/i,
        /regla general/i,
        /aproximadamente/i,
      ],
    },
    columns: ['net', 'total', 'yards', 'bags'],
    figuresOf: (shown) => [
      figure(shown, 'netVolume'),
      figure(shown, 'volumeFt3'),
      figure(shown, 'volumeYd3'),
      shown.shopping[0] ?? '',
    ],
    published: [
      { query: '', figures: ['40.00', '44.00', '1.63', '74'] },
      { query: '?v=1&sh=footing&l=216&n=3', figures: ['48.00', '52.80', '1.96', '88'] },
      { query: '?v=1&sh=column', figures: ['6.28', '6.91', '0.26', '12'] },
      { query: '?v=1&sh=steps', figures: ['12.83', '14.12', '0.52', '24'] },
    ],
  },
  'rectangle-area': {
    anchor: { en: 'square-footage', es: 'pies-cuadrados' },
    pageLink: {
      en: '[square footage calculator](/square-footage-calculator)',
      es: '[calculadora de pies cuadrados](/es/calculadora-de-pies-cuadrados)',
    },
    formulas: {
      en: ['length × width', 'area in square feet ÷ 9', 'area in square feet × 0.09290304'],
      es: ['largo × ancho', 'área en pies cuadrados ÷ 9', 'área en pies cuadrados × 0.09290304'],
    },
    honesty: {
      en: [
        /one square foot is exactly 1\/9 of a square yard/,
        /one square foot is exactly 0\.09290304 square meters/,
        /0\.3048 meters \(NIST SP 811, Appendix B\)/,
        /constants are exact/i,
        /rounded to two decimals only when they are shown/,
      ],
      es: [
        /un pie cuadrado es exactamente 1\/9 de yarda cuadrada/,
        /un pie cuadrado es exactamente 0\.09290304 metros cuadrados/,
        /0\.3048 metros \(NIST SP 811, apéndice B\)/,
        /constantes son exactas/i,
        /se redondean a dos decimales solo cuando/,
      ],
    },
    columns: ['ft2', 'yd2', 'm2'],
    figuresOf: (shown) => [
      figure(shown, 'areaFt2'),
      figure(shown, 'areaYd2'),
      figure(shown, 'areaM2'),
    ],
    published: [
      { query: '?v=1&l=144', figures: ['120.00', '13.33', '11.15'] },
      { query: '', figures: ['100.00', '11.11', '9.29'] },
      { query: '?v=1&l=150', figures: ['125.00', '13.89', '11.61'] },
      { query: '?v=1&l=240&w=180', figures: ['300.00', '33.33', '27.87'] },
    ],
  },
} as const satisfies Readonly<Record<CalculatorPageId, MethodologyRow>>;
