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
  gravel: {
    anchor: { en: 'gravel', es: 'grava' },
    pageLink: {
      en: '[gravel calculator](/gravel-calculator)',
      es: '[calculadora de grava](/es/calculadora-de-grava)',
    },
    formulas: {
      en: [
        'length × width × depth',
        'volume in place × (1 + extra ÷ 100)',
        'total volume × tons per cubic yard as placed',
        'weight ÷ tons per cubic yard loose',
      ],
      es: [
        'largo × ancho × profundidad',
        'volumen colocado × (1 + extra ÷ 100)',
        'volumen total × toneladas por yarda cúbica según se coloca',
        'peso ÷ toneladas por yarda cúbica suelta',
      ],
    },
    honesty: {
      en: [
        /approximately 1\.83 tons per cubic yard/,
        /approximately 1\.29 tons per cubic yard/,
        /WisDOT WHRP G22-05, Table E2/,
        /rounded to two decimals only when they are shown/,
      ],
      es: [
        /aproximadamente 1\.83 toneladas por yarda cúbica/,
        /aproximadamente 1\.29 toneladas por yarda cúbica/,
        /WisDOT WHRP G22-05, tabla E2/,
        /se redondean a dos decimales solo cuando/,
      ],
    },
    columns: ['tons', 'tonnes', 'orderYd3'],
    figuresOf: (shown) => [
      figure(shown, 'tons'),
      figure(shown, 'tonnes'),
      figure(shown, 'orderYd3'),
    ],
    published: [
      { query: '', figures: ['4.74', '4.30', '3.68'] },
      { query: '?v=1&ws=0', figures: ['4.52', '4.10', '3.50'] },
      { query: '?v=1&l=360&w=144&d=6', figures: ['12.81', '11.62', '9.93'] },
      { query: '?v=1&l=120&w=120&d=3&pl=loose', figures: ['1.25', '1.14', '0.97'] },
    ],
  },
  mulch: {
    anchor: { en: 'mulch', es: 'mulch' },
    pageLink: {
      en: '[mulch calculator](/mulch-calculator)',
      es: '[calculadora de mulch](/es/calculadora-de-mulch)',
    },
    formulas: {
      en: [
        'length × width × depth',
        'volume × (1 + extra ÷ 100)',
        'total volume ÷ 27',
        'total volume ÷ bag size, rounded up to a whole bag',
      ],
      es: [
        'largo × ancho × profundidad',
        'volumen × (1 + extra ÷ 100)',
        'volumen total ÷ 27',
        'volumen total ÷ tamaño de la bolsa, redondeado hacia arriba a una bolsa entera',
      ],
    },
    honesty: {
      en: [
        /a bag holds the volume printed on it/,
        /one cubic yard is exactly 27 cubic feet/,
        /0\.3048 meters \(NIST SP 811, Appendix B\)/,
        /rounded to two decimals only when they are shown/,
      ],
      es: [
        /una bolsa contiene el volumen impreso en ella/,
        /una yarda cúbica es exactamente 27 pies cúbicos/,
        /0\.3048 metros \(NIST SP 811, apéndice B\)/,
        /se redondean a dos decimales solo cuando/,
      ],
    },
    columns: ['yd3', 'm3', 'bags'],
    figuresOf: (shown) => [
      figure(shown, 'volumeYd3'),
      figure(shown, 'volumeM3'),
      shown.shopping[0] ?? '',
    ],
    published: [
      { query: '', figures: ['0.78', '0.59', '11'] },
      { query: '?v=1&bg=3', figures: ['0.78', '0.59', '7'] },
      { query: '?v=1&ws=0', figures: ['0.74', '0.57', '10'] },
      { query: '?v=1&l=120&w=120&d=4', figures: ['1.30', '0.99', '18'] },
      { query: '?v=1&l=360&w=36&d=2', figures: ['0.58', '0.45', '8'] },
    ],
  },
  topsoil: {
    anchor: { en: 'topsoil', es: 'tierra-para-jardin' },
    pageLink: {
      en: '[topsoil calculator](/topsoil-calculator)',
      es: '[calculadora de tierra para jardín](/es/calculadora-de-tierra-para-jardin)',
    },
    formulas: {
      en: [
        'length × width × depth',
        'volume × (1 + extra ÷ 100)',
        'total volume ÷ 27',
        'total volume ÷ bag size, rounded up to a whole bag',
      ],
      es: [
        'largo × ancho × profundidad',
        'volumen × (1 + extra ÷ 100)',
        'volumen total ÷ 27',
        'volumen total ÷ tamaño de la bolsa, redondeado hacia arriba a una bolsa entera',
      ],
    },
    honesty: {
      en: [
        /a bag holds the volume printed on it/,
        /one cubic yard is exactly 27 cubic feet/,
        /10 percent extra is a rule of thumb/,
        /0\.3048 meters \(NIST SP 811, Appendix B\)/,
        /rounded to two decimals only when they are shown/,
      ],
      es: [
        /una bolsa contiene el volumen impreso en ella/,
        /una yarda cúbica es exactamente 27 pies cúbicos/,
        /10 por ciento de extra es una regla general/,
        /0\.3048 metros \(NIST SP 811, apéndice B\)/,
        /se redondean a dos decimales solo cuando/,
      ],
    },
    columns: ['yd3', 'm3', 'bags'],
    figuresOf: (shown) => [
      figure(shown, 'volumeYd3'),
      figure(shown, 'volumeM3'),
      shown.shopping[0] ?? '',
    ],
    published: [
      { query: '', figures: ['1.36', '1.04', '49'] },
      { query: '?v=1&bg=1-5', figures: ['1.36', '1.04', '25'] },
      { query: '?v=1&ws=0', figures: ['1.23', '0.94', '45'] },
      { query: '?v=1&l=240&w=120&d=6', figures: ['4.07', '3.11', '147'] },
      { query: '?v=1&l=600&w=480&d=1', figures: ['6.79', '5.19', '245'] },
    ],
  },
  paint: {
    anchor: { en: 'paint', es: 'pintura' },
    pageLink: {
      en: '[paint calculator](/paint-calculator)',
      es: '[calculadora de pintura](/es/calculadora-de-pintura)',
    },
    formulas: {
      en: [
        '2 × (length + width) × height',
        'wall area − 20 square feet per door − 15 square feet per window',
        'area to paint × coats ÷ coverage per gallon',
        'gallons, rounded up to a whole gallon',
      ],
      es: [
        '2 × (largo + ancho) × altura',
        'área de paredes − 20 pies cuadrados por puerta − 15 pies cuadrados por ventana',
        'área a pintar × manos ÷ rendimiento por galón',
        'galones, redondeados hacia arriba a un galón entero',
      ],
    },
    honesty: {
      en: [
        /approximately 350 square feet per gallon/,
        /Sherwin-Williams Quali-Kote Interior Latex/,
        /approximate allowances/,
        /exactly 231 cubic inches/,
        /rounded to two decimals only when they are shown/,
      ],
      es: [
        /aproximadamente 350 pies cuadrados por galón/,
        /Sherwin-Williams Quali-Kote Interior Latex/,
        /descuentos aproximados/,
        /exactamente 231 pulgadas cúbicas/,
        /se redondean a dos decimales solo cuando/,
      ],
    },
    columns: ['gallons', 'liters', 'cans'],
    figuresOf: (shown) => [
      figure(shown, 'gallons'),
      figure(shown, 'liters'),
      shown.shopping[0] ?? '',
    ],
    published: [
      { query: '', figures: ['1.91', '7.22', '2'] },
      { query: '?v=1&c=3', figures: ['2.86', '10.84', '3'] },
      { query: '?v=1&dr=0&wn=0', figures: ['2.19', '8.31', '3'] },
      { query: '?v=1&l=240&w=180&h=108', figures: ['3.31', '12.55', '4'] },
      { query: '?v=1&l=600&w=480&h=120&dr=2&wn=8', figures: ['9.37', '35.47', '10'] },
    ],
  },
  drywall: {
    anchor: { en: 'drywall', es: 'drywall' },
    pageLink: {
      en: '[drywall calculator](/drywall-calculator)',
      es: '[calculadora de drywall](/es/calculadora-de-drywall)',
    },
    formulas: {
      en: [
        '2 × (length + width) × height, less 20 square feet per door and 15 square feet per window',
        'area × (1 + extra ÷ 100) ÷ the area of one sheet',
        'area × 9 gallons per 1,000 square feet',
        'area × 370 feet per 1,000 square feet',
      ],
      es: [
        '2 × (largo + ancho) × altura, menos 20 pies cuadrados por puerta y 15 pies cuadrados por ventana',
        'área × (1 + extra ÷ 100) ÷ el área de una placa',
        'área × 9 galones por cada 1,000 pies cuadrados',
        'área × 370 pies por cada 1,000 pies cuadrados',
      ],
    },
    honesty: {
      en: [
        /approximately 9 gallons/,
        /approximately 370 feet/,
        /approximate allowances/,
        /does not count screws/,
        /rounded to two decimals only when they are shown/,
      ],
      es: [
        /aproximadamente 9 galones/,
        /aproximadamente 370 pies/,
        /descuentos aproximados/,
        /no cuenta tornillos/,
        /se redondean a dos decimales solo cuando/,
      ],
    },
    columns: ['areaFt2', 'sheets', 'pails', 'rolls'],
    figuresOf: (shown) => [
      figure(shown, 'areaFt2'),
      shown.shopping[0] ?? '',
      shown.shopping[1] ?? '',
      shown.shopping[2] ?? '',
    ],
    published: [
      { query: '', figures: ['478.00', '17', '1', '1'] },
      { query: '?v=1&sz=4x12', figures: ['478.00', '11', '1', '1'] },
      { query: '?v=1&sf=walls', figures: ['334.00', '12', '1', '1'] },
      { query: '?v=1&l=240&w=180&h=108', figures: ['880.00', '31', '2', '1'] },
      { query: '?v=1&l=600&w=480&h=120&dr=2&wn=8', figures: ['3,640.00', '126', '8', '3'] },
    ],
  },
  'roof-pitch': {
    anchor: { en: 'roof-pitch', es: 'pendiente-de-techo' },
    pageLink: {
      en: '[roof pitch calculator](/roof-pitch-calculator)',
      es: '[calculadora de pendiente de techo](/es/calculadora-de-pendiente-de-techo)',
    },
    formulas: {
      en: [
        'rise ÷ run',
        'slope × 12',
        'arctangent of the slope, in degrees',
        '(rafter run + overhang) × √(1 + slope²)',
      ],
      es: [
        'subida ÷ recorrido',
        'inclinación × 12',
        'arcotangente de la inclinación, en grados',
        '(recorrido del cabio + alero) × √(1 + inclinación²)',
      ],
    },
    honesty: {
      en: [
        /2021 International Residential Code/,
        /R905\.2\.2/,
        /twenty decimals/,
        /rounded to two decimals only when they are shown/,
      ],
      es: [
        /International Residential Code de 2021/,
        /R905\.2\.2/,
        /veinte decimales/,
        /se redondean a dos decimales solo cuando/,
      ],
    },
    columns: ['pitch', 'angle', 'rafter'],
    figuresOf: (shown) => [figure(shown, 'pitch'), figure(shown, 'angle'), figure(shown, 'rafter')],
    published: [
      { query: '', figures: ['6.00', '26.57', '14.53'] },
      { query: '?v=1&r=3', figures: ['3.00', '14.04', '13.40'] },
      { query: '?v=1&r=4', figures: ['4.00', '18.43', '13.70'] },
      { query: '?v=1&r=9', figures: ['9.00', '36.87', '16.25'] },
      { query: '?v=1&r=12', figures: ['12.00', '45.00', '18.38'] },
    ],
  },
  roofing: {
    anchor: { en: 'roofing', es: 'tejas' },
    pageLink: {
      en: '[roofing calculator](/roofing-calculator)',
      es: '[calculadora de tejas para techo](/es/calculadora-de-tejas)',
    },
    formulas: {
      en: [
        'length × width × √(1 + (pitch ÷ 12)²)',
        'roof area ÷ 100',
        'roof area × (1 + extra ÷ 100) ÷ 33⅓ square feet',
        '(250 ft − 4 in) × (48 − 2) in',
      ],
      es: [
        'largo × ancho × √(1 + (pendiente ÷ 12)²)',
        'área del techo ÷ 100',
        'área del techo × (1 + extra ÷ 100) ÷ 33⅓ pies cuadrados',
        '(250 ft − 4 in) × (48 − 2) in',
      ],
    },
    honesty: {
      en: [
        /twenty decimals/,
        /approximately 33⅓ square feet/,
        /Table R905\.1\.1\(2\)/,
        /R905\.2\.2/,
        /does not count nails/,
        /rounded to two decimals only when they are shown/,
      ],
      es: [
        /veinte decimales/,
        /aproximadamente 33⅓ pies cuadrados/,
        /Tabla R905\.1\.1\(2\)/,
        /R905\.2\.2/,
        /no cuenta clavos/,
        /se redondean a dos decimales solo cuando/,
      ],
    },
    columns: ['squares', 'areaFt2', 'bundles', 'rolls'],
    figuresOf: (shown) => [
      figure(shown, 'squares'),
      figure(shown, 'areaFt2'),
      shown.shopping[0] ?? '',
      shown.shopping[1] ?? '',
    ],
    published: [
      { query: '', figures: ['13.42', '1,341.64', '45', '2'] },
      { query: '?v=1&p=3', figures: ['12.37', '1,236.93', '41', '3'] },
      { query: '?v=1&p=0', figures: ['12.00', '1,200.00', '40', '3'] },
      { query: '?v=1&p=12', figures: ['16.97', '1,697.06', '57', '2'] },
      { query: '?v=1&l=720&w=480&p=8&ws=15', figures: ['28.84', '2,884.44', '100', '4'] },
    ],
  },
  'feet-inches': {
    anchor: { en: 'feet-and-inches', es: 'pies-y-pulgadas' },
    pageLink: {
      en: '[feet and inches calculator](/feet-and-inches-calculator)',
      es: '[calculadora de pies y pulgadas](/es/calculadora-de-pies-y-pulgadas)',
    },
    formulas: {
      en: ['first + second', 'first − second', 'first × number', 'first ÷ number'],
      es: ['primera + segunda', 'primera − segunda', 'primera × número', 'primera ÷ número'],
    },
    honesty: {
      en: [/nearest 1\/16 of an inch/, /exactly 0\.0254 meters/],
      es: [/1\/16 de pulgada más cercano/, /exactamente 0\.0254 metros/],
    },
    columns: ['result', 'resultIn', 'resultM'],
    figuresOf: (shown) => [
      figure(shown, 'result'),
      figure(shown, 'resultIn'),
      figure(shown, 'resultM'),
    ],
    published: [
      { query: '', figures: ['16 ft 2 1/4 in', '194.25', '4.934'] },
      { query: '?v=1&o=subtract', figures: ['8 ft 9 3/4 in', '105.75', '2.686'] },
      { query: '?v=1&o=subtract&a=120&b=150', figures: ['2 ft 6 in', '30.00', '0.762'] },
      { query: '?v=1&o=multiply', figures: ['25 ft', '300.00', '7.620'] },
      { query: '?v=1&o=divide&n=7', figures: ['1 ft 9 7/16 in', '21.43', '0.544'] },
    ],
  },
} as const satisfies Readonly<Record<CalculatorPageId, MethodologyRow>>;
