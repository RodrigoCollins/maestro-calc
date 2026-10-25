import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { CONCRETE_YIELDS } from '../../__testing__/concrete-yields.ts';
import { concreteStateArb } from '../../__testing__/concrete-arbitraries.ts';
import { numRuns } from '../../__testing__/property-runs.ts';
import type { ShoppingLine } from '../../calculator/descriptors.ts';
import { Rational } from '../../rational/rational.ts';
import { ft3, in3, inch, yd3 } from '../../units/catalog.ts';
import { isQuantityOf, quantity, valueIn } from '../../units/quantity.ts';
import type { Unit } from '../../units/unit.ts';
import { createConcrete } from './index.ts';

const concrete = createConcrete(CONCRETE_YIELDS);

/** The state `compute` takes: a validated record of the 17 inputs. */
type State = Parameters<typeof concrete.compute>[0];

const volumeIn = (value: unknown, unit: Unit<'volume'>): Rational => {
  if (!isQuantityOf(value, 'volume')) throw new Error('not a volume');
  return valueIn(value, unit);
};

const qtyOf = (shopping: readonly ShoppingLine[]): bigint => {
  const [line] = shopping;
  if (line === undefined) throw new Error('no shopping line');
  return line.qty;
};

const run = (state: State) => {
  const result = concrete.compute(state);
  return {
    result,
    net: volumeIn(result.outputs.netVolume, ft3),
    total: volumeIn(result.outputs.volumeFt3, ft3),
    qty: qtyOf(result.shopping),
  };
};

/** The dimension fields each shape reads; every other dimension field is unused by it. */
const USED = {
  slab: ['length', 'width', 'thickness'],
  footing: ['length', 'footingWidth', 'footingDepth', 'count'],
  column: ['diameter', 'height', 'count'],
  steps: ['stepWidth', 'rise', 'run', 'stepCount'],
} as const;
const DIMENSION_FIELDS = [
  'length',
  'width',
  'thickness',
  'footingWidth',
  'footingDepth',
  'diameter',
  'height',
  'stepWidth',
  'rise',
  'run',
  'stepCount',
  'count',
] as const;

describe('concrete properties (calc-concrete › Consistency properties)', () => {
  // spec: calc-concrete › [CC25] P1 waste is applied to the net volume
  it('P1: the total is the net volume times 1 plus waste over 100', () => {
    fc.assert(
      fc.property(concreteStateArb, (state) => {
        const { net, total } = run(state);
        expect(total).toEqual(net.mul(Rational.ONE.add(state.waste.div(Rational.of(100)))));
      }),
      { numRuns },
    );
  });

  // spec: calc-concrete › [CC25] P2 27 cubic feet to the cubic yard
  it('P2: cubic yards times 27 is cubic feet', () => {
    fc.assert(
      fc.property(concreteStateArb, (state) => {
        const { result, total } = run(state);
        expect(volumeIn(result.outputs.volumeYd3, yd3).mul(Rational.of(27))).toEqual(total);
      }),
      { numRuns },
    );
  });

  // spec: calc-concrete › [CC25] P3 the bag count is the smallest that covers the volume
  it('P3: the bags cover the volume and one fewer would not', () => {
    fc.assert(
      fc.property(concreteStateArb, (state) => {
        const { total, qty } = run(state);
        const bagYield = volumeIn(CONCRETE_YIELDS[`bag-${state.bag}`], ft3);
        expect(Rational.of(qty).mul(bagYield).compare(total)).not.toBe(-1);
        if (qty > 0n) {
          expect(
            Rational.of(qty - 1n)
              .mul(bagYield)
              .compare(total),
          ).toBe(-1);
        }
      }),
      { numRuns },
    );
  });

  // spec: calc-concrete › [CC25] P4 more waste never buys fewer bags; a bigger bag never more
  it('P4: bags never decrease with waste and never increase with the bag size', () => {
    fc.assert(
      fc.property(concreteStateArb, fc.integer({ min: 0, max: 500 }), (state, tenths) => {
        const more = { ...state, waste: state.waste.add(Rational.of(tenths, 10)) };
        fc.pre(more.waste.compare(Rational.of(50)) !== 1);
        expect(run(more).qty).toBeGreaterThanOrEqual(run(state).qty);
        const qty = (bag: State['bag']) => run({ ...state, bag }).qty;
        expect(qty('40')).toBeGreaterThanOrEqual(qty('60'));
        expect(qty('60')).toBeGreaterThanOrEqual(qty('80'));
      }),
      { numRuns },
    );
  });

  // spec: calc-concrete › [CC25] P5 count is linear for footings and columns
  it('P5: k times m pieces is k times the volume of m pieces', () => {
    fc.assert(
      fc.property(
        concreteStateArb,
        fc.constantFrom('footing', 'column'),
        fc.integer({ min: 1, max: 30 }),
        fc.integer({ min: 1, max: 30 }),
        (state, shape, k, m) => {
          const many = run({ ...state, shape, count: k * m }).net;
          const few = run({ ...state, shape, count: m }).net;
          expect(many).toEqual(few.mul(Rational.of(k)));
        },
      ),
      { numRuns },
    );
  });

  // spec: calc-concrete › [CC25] P6 a slab is symmetric in length and width
  it('P6: swapping the length and the width of a slab changes no output', () => {
    fc.assert(
      fc.property(concreteStateArb, (state) => {
        const slab = { ...state, shape: 'slab' } as const;
        const swapped = { ...slab, length: slab.width, width: slab.length };
        expect(concrete.compute(swapped)).toEqual(concrete.compute(slab));
      }),
      { numRuns },
    );
  });

  // spec: calc-concrete › [CC25] P7 the steps are the sum of full-height blocks
  it('P7: the steps volume is the sum of the blocks of k times the rise', () => {
    fc.assert(
      fc.property(concreteStateArb, (state) => {
        const steps = { ...state, shape: 'steps' } as const;
        const blocks = Array.from({ length: steps.stepCount }, (_, index) =>
          steps.stepWidth.canonical
            .mul(steps.run.canonical)
            .mul(steps.rise.canonical.mul(Rational.of(index + 1))),
        ).reduce((sum, block) => sum.add(block), Rational.ZERO);
        expect(volumeIn(concrete.compute(steps).outputs.netVolume, in3)).toEqual(blocks);
      }),
      { numRuns },
    );
  });

  // spec: calc-concrete › [CC25] P8 the fields a shape does not use do not matter
  it('P8: replacing the unused fields changes no output', () => {
    fc.assert(
      fc.property(concreteStateArb, concreteStateArb, (state, other) => {
        const used: readonly string[] = USED[state.shape];
        const swapped: State = { ...state };
        for (const field of DIMENSION_FIELDS) {
          if (!used.includes(field)) Object.assign(swapped, { [field]: other[field] });
        }
        expect(concrete.compute(swapped)).toEqual(concrete.compute(state));
      }),
      { numRuns },
    );
  });

  // spec: calc-concrete › [CC25] P9 nothing is negative
  it('P9: volumes and costs are never negative', () => {
    fc.assert(
      fc.property(concreteStateArb, (state) => {
        const { outputs } = concrete.compute(state);
        for (const volume of [outputs.volumeYd3, outputs.volumeFt3, outputs.volumeM3]) {
          expect(volume.canonical.sign()).not.toBe(-1);
        }
        expect(outputs.netVolume.canonical.sign()).not.toBe(-1);
        expect(outputs.bagCost.amount.sign()).not.toBe(-1);
        expect(outputs.readyMixCost.amount.sign()).not.toBe(-1);
      }),
      { numRuns },
    );
  });

  // spec: calc-concrete › [CC25] P10 the ready-mix cost is the price per cubic yard times the cubic yards
  it('P10: the ready-mix cost is the price times the cubic yards', () => {
    fc.assert(
      fc.property(concreteStateArb, (state) => {
        const { outputs } = concrete.compute(state);
        expect(outputs.readyMixCost.amount).toEqual(
          state.readyMixPrice.amount.mul(volumeIn(outputs.volumeYd3, yd3)),
        );
      }),
      { numRuns },
    );
  });

  it('P11: the bag cost is the bag price times the bags', () => {
    fc.assert(
      fc.property(concreteStateArb, (state) => {
        const { result, qty } = run(state);
        expect(result.outputs.bagCost.amount).toEqual(state.bagPrice.amount.mul(Rational.of(qty)));
      }),
      { numRuns },
    );
  });

  // JD-3 (concrete group 1): the properties above restate the implementation with `Rational`; this
  // one shares nothing with it. The oracle is plain `bigint` arithmetic on a slab measured in
  // eighths of an inch, a waste in tenths of a percent and the bag yields written out in cubic
  // inches (0.30, 0.45 and 0.60 ft3 times 1,728 in3 per ft3 are 2592/5, 3888/5 and 5184/5).
  describe('P12: an independent bigint oracle for the slab', () => {
    const YIELD_FIFTHS = { '40': 2592n, '60': 3888n, '80': 5184n } as const;
    const ceilDiv = (numerator: bigint, denominator: bigint): bigint =>
      (numerator + denominator - 1n) / denominator;

    it('agrees with the calculator on the total volume and the bags of any slab', () => {
      fc.assert(
        fc.property(
          concreteStateArb,
          fc.bigInt({ min: 0n, max: 96_000n }),
          fc.bigInt({ min: 0n, max: 96_000n }),
          fc.bigInt({ min: 0n, max: 960n }),
          fc.bigInt({ min: 0n, max: 500n }),
          fc.constantFrom('40', '60', '80'),
          (base, length8, width8, thickness8, wasteTenths, bag) => {
            const eighths = (value: bigint) => quantity(Rational.of(value, 8n), inch);
            const state: State = {
              ...base,
              shape: 'slab',
              length: eighths(length8),
              width: eighths(width8),
              thickness: eighths(thickness8),
              waste: Rational.of(wasteTenths, 10n),
              bag,
            };
            // cubic inches = (L8 x W8 x T8 / 8^3) x (1000 + tenths) / 1000
            const totalNum = length8 * width8 * thickness8 * (1000n + wasteTenths);
            const totalDen = 512n * 1000n;
            const bags = ceilDiv(totalNum * 5n, totalDen * YIELD_FIFTHS[bag]);

            const { result, qty } = run(state);
            const total = volumeIn(result.outputs.volumeFt3, in3);
            expect(total.num * totalDen).toBe(totalNum * total.den);
            expect(qty).toBe(bags);
          },
        ),
        { numRuns },
      );
    });
  });
});
