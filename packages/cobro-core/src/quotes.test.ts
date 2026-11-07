import { decode, encode, Rational } from '@maestro-calc/core';
import { createConcrete } from '@maestro-calc/core/calculators/concrete';
import { createDrywall } from '@maestro-calc/core/calculators/drywall';
import { mulch } from '@maestro-calc/core/calculators/mulch';
import { createPaint } from '@maestro-calc/core/calculators/paint';
import { CONCRETE_YIELDS } from '@maestro-calc/core/testing/concrete-yields';
import { DRYWALL_FINISHING } from '@maestro-calc/core/testing/drywall-yields';
import { PAINT_COVERAGE } from '@maestro-calc/core/testing/paint-yields';
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { exactOf, outputsOf, type Any } from './__testing__/figures.ts';
import { cleaningQuote } from './cleaning/cleaning.ts';
import { createConcreteQuote } from './concrete/concrete.ts';
import { createDrywallQuote } from './drywall/drywall.ts';
import { createLandscapingQuote } from './landscaping/landscaping.ts';
import { createPaintingQuote } from './painting/painting.ts';

const CALCULATORS: readonly Any[] = [
  cleaningQuote,
  createPaintingQuote(createPaint(PAINT_COVERAGE)),
  createDrywallQuote(createDrywall(DRYWALL_FINISHING)),
  createConcreteQuote(createConcrete(CONCRETE_YIELDS)),
  createLandscapingQuote(mulch),
] as const;

const cents = (value: unknown): Rational => (value as { amount: Rational }).amount;

// A raw form a person could type: hours, a crew, the rates and the two percentages.
const form = fc.record({
  laborBy: fc.constantFrom('hour', 'area'),
  hours: fc.integer({ min: 0, max: 20_000 }).map((n) => String(n / 100)),
  crew: fc.integer({ min: 1, max: 12 }).map(String),
  rate: fc.integer({ min: 0, max: 50_000 }).map((n) => String(n / 100)),
  areaRate: fc.integer({ min: 0, max: 5_000 }).map((n) => String(n / 100)),
  overhead: fc.integer({ min: 0, max: 5_000 }).map((n) => String(n / 100)),
  profit: fc.integer({ min: 0, max: 5_000 }).map((n) => String(n / 100)),
});

describe.each(CALCULATORS.map((calculator) => [calculator.id, calculator] as const))(
  '%s',
  (_id, calculator) => {
    it('reads its own defaults and runs at them', () => {
      expect(calculator.validate({}).ok).toBe(true);
      expect(calculator.run({}).ok).toBe(true);
    });

    it('leads with the total and lists the lines of the receipt in order', () => {
      expect(calculator.outputs.map(({ key, role }) => [key, role])).toEqual([
        ['total', 'primary'],
        ['labor', 'secondary'],
        ['materials', 'secondary'],
        ['subtotal', 'secondary'],
        ['overhead', 'secondary'],
        ['profit', 'secondary'],
        ['units', 'secondary'],
        ['area', 'secondary'],
      ]);
    });

    it('adds up: the lines of the receipt are the total, to the cent', () => {
      fc.assert(
        fc.property(form, (raw) => {
          const out = outputsOf(calculator, raw);
          const [labor, materials, subtotal, overhead, profit, total] = [
            'labor',
            'materials',
            'subtotal',
            'overhead',
            'profit',
            'total',
          ].map((key) => cents(out[key]));
          const sum = (a: Rational | undefined, b: Rational | undefined) =>
            (a ?? Rational.ZERO).add(b ?? Rational.ZERO);
          expect(subtotal?.equals(sum(labor, materials))).toBe(true);
          expect(total?.equals(sum(sum(subtotal, overhead), profit))).toBe(true);
          // every line is a whole number of cents
          for (const line of [labor, materials, overhead, profit, total])
            expect((line ?? Rational.ZERO).mul(Rational.of(100)).isInteger()).toBe(true);
        }),
      );
    });

    it('never quotes less than the subtotal, and exactly the subtotal with no markup', () => {
      fc.assert(
        fc.property(form, (raw) => {
          const out = outputsOf(calculator, raw);
          const bare = outputsOf(calculator, { ...raw, overhead: '0', profit: '0' });
          expect(cents(out['total']).compare(cents(out['subtotal']))).toBeGreaterThanOrEqual(0);
          expect(cents(bare['total']).equals(cents(bare['subtotal']))).toBe(true);
        }),
      );
    });

    it('charges more when the hourly rate rises', () => {
      fc.assert(
        fc.property(form, fc.integer({ min: 1, max: 400 }), (raw, more) => {
          const base = cents(outputsOf(calculator, { ...raw, laborBy: 'hour' })['total']);
          const raised = cents(
            outputsOf(calculator, {
              ...raw,
              laborBy: 'hour',
              rate: Rational.fromString(raw.rate).ok
                ? Rational.of(Number(raw.rate) * 100 + more * 100, 100).toString()
                : raw.rate,
            })['total'],
          );
          expect(raised.compare(base)).toBeGreaterThanOrEqual(0);
        }),
      );
    });

    it('keeps its numbers in the URL: what the link holds reopens the same state', () => {
      fc.assert(
        fc.property(form, (raw) => {
          const validated = calculator.validate(raw);
          if (!validated.ok) return;
          const query = encode(calculator, validated.value);
          expect(decode(calculator, query).state).toEqual(validated.value);
        }),
      );
    });

    it('prices the area by the square foot of the user, whatever the hours say', () => {
      const raw = { laborBy: 'area', areaRate: '2', overhead: '0', profit: '0' };
      const area = exactOf(calculator, raw, 'area');
      const labor = cents(outputsOf(calculator, raw)['labor']);
      expect(labor.equals(area.mul(Rational.of(2)))).toBe(true);
    });
  },
);

// The URL keys are a public contract once a link is shared: they never change.
describe('url keys', () => {
  const keys = (id: string) =>
    CALCULATORS.find((calculator) => calculator.id === id)?.inputs.map(({ urlKey }) => urlKey);
  const tail = ['lb', 'hr', 'cr', 'r', 'ar', 'ov', 'pf'];

  it('keys the cleaning quote', () => {
    expect(keys('cleaning-quote')).toEqual(['a', ...tail.slice(0, 5), 's', 'ov', 'pf']);
  });

  it('keys the painting quote', () => {
    expect(keys('painting-quote')).toEqual(['l', 'w', 'h', 'dr', 'wn', 'c', 'gp', ...tail]);
  });

  it('keys the drywall quote', () => {
    expect(keys('drywall-quote')).toEqual([
      'l',
      'w',
      'h',
      'dr',
      'wn',
      'sf',
      'sz',
      'ws',
      'sp',
      ...tail,
    ]);
  });

  it('keys the concrete quote', () => {
    expect(keys('concrete-quote')).toEqual(['l', 'w', 't', 'ws', 'bg', 'bp', ...tail]);
  });

  it('keys the landscaping quote', () => {
    expect(keys('landscaping-quote')).toEqual(['l', 'w', 'd', 'ws', 'bg', 'bp', ...tail]);
  });
});
