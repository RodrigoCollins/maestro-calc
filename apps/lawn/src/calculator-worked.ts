import { type MethodCase, type MethodSource, PSU_LIME } from './methodology.ts';

/** A worked example of one calculator page: hand-worked cases the engine must match, and what to know. */
export interface CalculatorWorked {
  readonly heading: string;
  readonly intro: string;
  readonly cases: readonly MethodCase[];
  readonly knowHeading: string;
  readonly know: readonly string[];
  readonly sources: readonly MethodSource[];
}

const SOD_YARD = { area: '1850', waste: '10', pallet: '450' } as const;
const LIME_LAWN = { area: '8000', rate: '50', cce: '85', bag: '40' } as const;

/** The pages that carry a worked example below the calculator, by calculator id. */
export const WORKED = {
  sod: {
    heading: 'Worked example: a sod order',
    intro:
      'A back yard of two rectangles, 50 × 25 ft and 30 × 20 ft, is 1,250 + 600 = 1,850 sq ft. The sod farm advises 10% waste for the cuts along the beds and sells pallets of 450 sq ft.',
    cases: [
      {
        text: 'Square feet to order: 1,850 × 1.10 =',
        raw: SOD_YARD,
        v: 'order',
        result: '2,035',
        unit: 'sq ft',
      },
      {
        text: 'Pallets of 450 sq ft: 2,035 ÷ 450 = 4.52, rounded up to',
        raw: SOD_YARD,
        v: 'pallets',
        result: '5',
        unit: 'pallets',
      },
      {
        text: 'Or loose slabs of 2.67 sq ft: 2,035 ÷ 2.67 = 763.1, rounded up to',
        raw: SOD_YARD,
        v: 'slabs',
        result: '764',
        unit: 'slabs',
      },
      {
        text: 'The same order from a farm with 400 sq ft pallets: 2,035 ÷ 400 = 5.09, rounded up to',
        raw: { ...SOD_YARD, pallet: '400' },
        v: 'pallets',
        result: '6',
        unit: 'pallets',
      },
    ],
    knowHeading: 'Before you order',
    know: [
      'Split an odd lawn into rectangles and triangles, measure each one and add them up; leave out the house, the drive, the patio and the planting beds.',
      'Waste covers the pieces trimmed off along curves, walks and beds, so a lawn with many edges needs more than a plain square. The page assumes none until you type it.',
      'The pallet size decides the count: the same 2,035 sq ft is 5 pallets of 450 but 6 of 400, so ask the farm before you compare prices per pallet.',
      'A partial pallet is often sold as loose slabs, which is why the slab count is shown beside the pallets.',
    ],
    sources: [],
  },
  'lawn-lime': {
    heading: 'Worked example: liming a lawn',
    intro:
      'A soil lab report recommends 50 lb of lime per 1,000 sq ft, as calcium carbonate equivalent, for an 8,000 sq ft lawn. The bag at the store weighs 40 lb and its label gives a CCE of 85%.',
    cases: [
      {
        text: 'Product per 1,000 sq ft: 50 × 100 ÷ 85 =',
        raw: LIME_LAWN,
        v: 'perThousand',
        result: '58.8',
        unit: 'lb',
      },
      {
        text: 'For the whole lawn: 58.82 × 8,000 ÷ 1,000 =',
        raw: LIME_LAWN,
        v: 'pounds',
        result: '470.6',
        unit: 'lb',
      },
      {
        text: 'Bags of 40 lb: 470.6 ÷ 40 = 11.8, rounded up to',
        raw: LIME_LAWN,
        v: 'bags',
        result: '12',
        unit: 'bags',
      },
      {
        text: 'With a lime of 100% CCE the same report needs 50 × 8 =',
        raw: { ...LIME_LAWN, cce: '100' },
        v: 'pounds',
        result: '400.0',
        unit: 'lb',
      },
    ],
    knowHeading: 'Reading the report and the bag',
    know: [
      'Penn State’s soil lab writes its turf lime recommendations in pounds of calcium carbonate equivalent per 1,000 sq ft, and says to adjust the rate when the limestone is well away from 100% CCE.',
      'A lower CCE means each pound neutralizes less acidity, so it takes more pounds of product: 85% CCE needs about 18% more than pure calcium carbonate.',
      'The bag weight changes how many bags you buy, never the pounds the lawn needs.',
      'If your report gives the rate per acre, divide it by 43.56 to get pounds per 1,000 sq ft before you type it.',
    ],
    sources: [PSU_LIME],
  },
} as const satisfies Readonly<Record<string, CalculatorWorked>>;

/** The worked example of a calculator page, or `undefined` for a page without one. */
export const workedOf = (id: string): CalculatorWorked | undefined =>
  (WORKED as Readonly<Record<string, CalculatorWorked>>)[id];
