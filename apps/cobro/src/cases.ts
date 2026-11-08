import type { Lang, TradeId } from './routes.ts';

/**
 * The hand-verified cases the methodology publishes: the form as typed, and each figure of the
 * quote worked out by hand from the formulas (the arithmetic is in the comment of the matching
 * test in `packages/cobro-core`). `src/cases.test.ts` runs every case through the engine and
 * compares every figure, so the page cannot drift from the calculator.
 */
export interface QuoteCase {
  readonly trade: TradeId;
  readonly name: Readonly<Record<Lang, string>>;
  /** What is typed over the starting values. */
  readonly raw: Readonly<Record<string, string>>;
  readonly labor: string;
  readonly materials: string;
  /** Whole purchase units of the main material (0 when the trade has none). */
  readonly units: number;
  readonly total: string;
}

export const CASES: readonly QuoteCase[] = [
  {
    trade: 'cleaning',
    name: {
      es: 'Limpieza, valores de arranque: 8 h, 1 persona a $25, $20 de productos, 10 % y 15 %',
      en: 'Cleaning, starting values: 8 h, 1 person at $25, $20 of supplies, 10% and 15%',
    },
    raw: {},
    labor: '200.00',
    materials: '20.00',
    units: 0,
    total: '278.30',
  },
  {
    trade: 'cleaning',
    name: {
      es: 'Limpieza, 3.5 h, 2 personas a $18, $14.50 de productos, sin recargos',
      en: 'Cleaning, 3.5 h, 2 people at $18, $14.50 of supplies, no markup',
    },
    raw: { hours: '3.5', crew: '2', rate: '18', supplies: '14.50', overhead: '0', profit: '0' },
    labor: '126.00',
    materials: '14.50',
    units: 0,
    total: '140.50',
  },
  {
    trade: 'painting',
    name: {
      es: 'Pintura, cuarto de 12 × 12 pies, paredes de 8 pies, 1 puerta, 2 ventanas, 2 manos, $40 el galón (valores de arranque)',
      en: 'Painting, 12 × 12 ft room, 8 ft walls, 1 door, 2 windows, 2 coats, $40 a gallon (starting values)',
    },
    raw: {},
    labor: '200.00',
    materials: '80.00',
    units: 2,
    total: '354.20',
  },
  {
    trade: 'painting',
    name: {
      es: 'Pintura, 3 manos a $38.50 el galón',
      en: 'Painting, 3 coats at $38.50 a gallon',
    },
    raw: { coats: '3', gallonPrice: '38.50' },
    labor: '200.00',
    materials: '115.50',
    units: 3,
    total: '399.11',
  },
  {
    trade: 'drywall',
    name: {
      es: 'Drywall, cuarto de 12 × 12 pies, paredes y techo, hojas de 4 × 8, 10 % de desperdicio, $15 la hoja (valores de arranque)',
      en: 'Drywall, 12 × 12 ft room, walls and ceiling, 4 × 8 sheets, 10% waste, $15 a sheet (starting values)',
    },
    raw: {},
    labor: '200.00',
    materials: '255.00',
    units: 17,
    total: '575.58',
  },
  {
    trade: 'drywall',
    name: { es: 'Drywall, solo paredes', en: 'Drywall, walls only' },
    raw: { surfaces: 'walls' },
    labor: '200.00',
    materials: '180.00',
    units: 12,
    total: '480.70',
  },
  {
    trade: 'concrete',
    name: {
      es: 'Concreto, losa de 12 × 10 pies × 4 pulgadas, 10 % de desperdicio, bolsas de 80 lb a $6 (valores de arranque)',
      en: 'Concrete, 12 × 10 ft slab × 4 in, 10% waste, 80 lb bags at $6 (starting values)',
    },
    raw: {},
    labor: '200.00',
    materials: '444.00',
    units: 74,
    total: '814.66',
  },
  {
    trade: 'concrete',
    name: {
      es: 'Concreto, bolsas de 60 lb a $4.80',
      en: 'Concrete, 60 lb bags at $4.80',
    },
    raw: { bag: '60', bagPrice: '4.80' },
    labor: '200.00',
    materials: '470.40',
    units: 98,
    total: '848.06',
  },
  {
    trade: 'landscaping',
    name: {
      es: 'Jardín, área de 20 × 4 pies, 3 pulgadas de mantillo, 5 % de desperdicio, bolsas de 2 pies³ a $5 (valores de arranque)',
      en: 'Landscaping, 20 × 4 ft bed, 3 in of mulch, 5% waste, 2 cu ft bags at $5 (starting values)',
    },
    raw: {},
    labor: '200.00',
    materials: '55.00',
    units: 11,
    total: '322.58',
  },
  {
    trade: 'landscaping',
    name: {
      es: 'Jardín, bolsas de 3 pies³ a $7.25',
      en: 'Landscaping, 3 cu ft bags at $7.25',
    },
    raw: { bag: '3', bagPrice: '7.25' },
    labor: '200.00',
    materials: '50.75',
    units: 7,
    total: '317.20',
  },
];
