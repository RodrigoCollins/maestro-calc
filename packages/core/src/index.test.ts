import { describe, expect, it } from 'vitest';
import { fixtureBox } from './__testing__/fixture-box.ts';
import * as core from './index.ts';

describe('core public API (design: Public API)', () => {
  // design: Public API — Rational, parseDecimal, Result helpers and CoreError
  it('exports the exact-number toolkit', () => {
    expect(Object.keys(core).sort()).toEqual([
      'ALL_ERROR_CODES',
      'ATAN_PLACES',
      'CoreError',
      'DECIMAL_PARSE_CODES',
      'DEFINITION_REASONS',
      'FIELD_ERROR_CODES',
      'LENGTH_PARSE_CODES',
      'MAX_TEXT_LENGTH',
      'MONEY_PARSE_CODES',
      'PI',
      'RATIONAL_PARSE_CODES',
      'RESERVED_URL_KEYS',
      'RESULT_REASONS',
      'Rational',
      'SQRT_PLACES',
      'URL_ISSUE_CODES',
      'abs',
      'add',
      'addMoney',
      'arctangentDegrees',
      'ceilToPurchaseUnits',
      'circleArea',
      'cm',
      'cm2',
      'cm3',
      'compare',
      'compareMoney',
      'costOf',
      'decode',
      'defineCalculator',
      'deg',
      'divide',
      'divideScalar',
      'encode',
      'equals',
      'equalsMoney',
      'err',
      'findUnit',
      'formatFeetInches',
      'ft',
      'ft2',
      'ft3',
      'gal',
      'in2',
      'in3',
      'inch',
      'isQuantity',
      'isZero',
      'kg',
      'kgM3',
      'lb',
      'lbFt3',
      'lbIn3',
      'lbYd3',
      'liter',
      'm',
      'm2',
      'm3',
      'messageKeysOf',
      'mm',
      'mm2',
      'mm3',
      'multiply',
      'multiplyCount',
      'negate',
      'ok',
      'oz',
      'parseDecimal',
      'parseLength',
      'parseMoney',
      'quantity',
      'ratio',
      'roundToFraction',
      'scale',
      'scaleMoney',
      'sign',
      'squareRoot',
      'sub',
      'subMoney',
      'toCents',
      'toDecimalParts',
      'ton',
      'tonYd3',
      'tonne',
      'unitPrice',
      'usd',
      'valueIn',
      'yd',
      'yd2',
      'yd3',
    ]);
  });

  // design: Result and error codes — each module exports its code array; DECIMAL_COMMA belongs to
  // parseDecimal only, so fromString never reports it
  it('exports the parser code arrays', () => {
    expect(core.DECIMAL_PARSE_CODES).toEqual(['MALFORMED', 'DECIMAL_COMMA']);
    expect(core.RATIONAL_PARSE_CODES).toEqual(['MALFORMED', 'ZERO_DENOMINATOR']);
    expect(core.Rational.fromString('1,5')).toEqual(core.err({ code: 'MALFORMED' }));
    expect(core.parseDecimal('1,5')).toEqual(core.err({ code: 'DECIMAL_COMMA' }));
  });

  // spec: units-quantities › the API is free functions over immutable values (no Quantity class)
  it('wires the units API to working implementations', () => {
    const feet = core.quantity(core.Rational.of(1, 3), core.ft);
    expect(core.valueIn(feet, core.inch)).toEqual(core.Rational.of(4));
    expect(core.findUnit('mass', 'kg')).toBe(core.kg);
    const area = core.multiply(core.quantity(120, core.inch), core.quantity(150, core.inch));
    expect(core.valueIn(area, core.ft2)).toEqual(core.Rational.of(125));
  });

  // spec: fraction-format › rounding, decimal display, purchase ceiling and feet-inch formatting
  it('wires the fraction-format API to working implementations', () => {
    expect(core.roundToFraction(core.Rational.of(1, 128), 64, 'nearest')).toBe(1n);
    expect(core.toDecimalParts(core.Rational.of(-1, 8), 2, 'down').fraction).toBe('13');
    expect(core.ceilToPurchaseUnits(core.Rational.of(7, 2))).toBe(4n);
    expect(
      core.formatFeetInches(core.quantity(core.Rational.of(127, 2), core.inch), { denominator: 16 })
        .text,
    ).toBe(`5' 3 1/2"`);
  });

  // spec: fraction-format › Length text grammar and Format/parse round trip
  it('wires parseLength to a working implementation', () => {
    expect(core.LENGTH_PARSE_CODES).toContain('UNKNOWN_UNIT');
    const parsed = core.parseLength(`5' 3 1/2"`);
    expect(parsed.ok && core.valueIn(parsed.value, core.inch)).toEqual(core.Rational.of(127, 2));
    const metric = core.parseLength('2.54', { defaultUnit: core.cm });
    expect(metric.ok && core.valueIn(metric.value, core.inch)).toEqual(core.Rational.ONE);
    expect(core.parseLength('5 furlongs')).toEqual(core.err({ code: 'UNKNOWN_UNIT', offset: 2 }));
  });

  // spec: core-geometry › Rational pi, Circle area
  it('wires the geometry API to working implementations', () => {
    expect(
      core.PI.equals(core.Rational.of(314159265358979323846264338327950288n, 10n ** 35n)),
    ).toBe(true);
    const area = core.circleArea(core.quantity(6, core.inch));
    expect(core.valueIn(area, core.ft2)).toEqual(core.PI.div(core.Rational.of(4)));
  });

  // spec: money › Exact money value, Unit prices, Display rounding to cents, Money text grammar
  it('wires the money API to working implementations', () => {
    expect(core.MONEY_PARSE_CODES).toContain('DECIMAL_COMMA');
    expect(core.parseMoney('1,5')).toEqual(core.err({ code: 'DECIMAL_COMMA' }));
    const price = core.parseMoney('$0.37');
    expect(price.ok).toBe(true);
    const area = core.quantity(core.Rational.of(25, 2), core.ft2);
    const cost = price.ok && core.costOf(core.unitPrice(price.value, core.ft2), area);
    expect(cost && core.toCents(cost)).toEqual({ negative: false, integer: 4n, fraction: '63' });
    const total = core.multiplyCount(core.usd(core.Rational.of(249, 50)), 4n);
    expect(core.addMoney(total, core.usd(1)).amount).toEqual(core.Rational.of(523, 25));
    expect(core.subMoney(total, total).amount.isZero()).toBe(true);
    expect(core.scaleMoney(total, core.Rational.of(1, 2)).amount).toEqual(
      core.Rational.of(249, 25),
    );
    expect(core.compareMoney(core.usd(1), total)).toBe(-1);
    expect(core.equalsMoney(total, core.usd(core.Rational.of(498, 25)))).toBe(true);
  });

  // spec: calculator-contract › Field kinds and descriptors, Total validation
  it('wires the calculator contract to working implementations', () => {
    expect(core.FIELD_ERROR_CODES).toHaveLength(10);
    expect(core.DEFINITION_REASONS).toContain('DUPLICATE_URL_KEY');
    const boxes = core.defineCalculator({
      id: 'boxes',
      inputs: [{ kind: 'count', key: 'cnt', urlKey: 'a', default: 2, max: 9 }],
      outputs: [{ key: 'cost', measure: 'money', role: 'primary' }],
      compute: (inputs) => ({
        outputs: { cost: core.multiplyCount(core.usd(core.Rational.of(249, 50)), inputs.cnt) },
        shopping: [],
        warnings: [],
      }),
    });
    expect(boxes.validate({ cnt: '10' })).toEqual({
      ok: false,
      errors: [{ field: 'cnt', code: 'ABOVE_MAX', params: { max: '9' } }],
    });
    // the longest raw string a field reads: one more character is TOO_LONG
    expect(core.MAX_TEXT_LENGTH).toBe(128);
    expect(boxes.validate({ cnt: '1'.repeat(core.MAX_TEXT_LENGTH + 1) })).toEqual({
      ok: false,
      errors: [{ field: 'cnt', code: 'TOO_LONG' }],
    });
    const valid = boxes.validate({ cnt: '3' });
    expect(valid).toEqual(core.ok({ cnt: 3 }));
    // 3 x $4.98 = 747/50
    expect(valid.ok && boxes.compute(valid.value).outputs.cost.amount).toEqual(
      core.Rational.of(747, 50),
    );
    // run: validate then compute, with the outputs as a list; messageKeysOf names the i18n keys
    expect(boxes.run({ cnt: '3' })).toEqual(
      core.ok({
        outputs: [{ key: 'cost', role: 'primary', value: core.usd(core.Rational.of(747, 50)) }],
        shopping: [],
        warnings: [],
      }),
    );
    expect(core.messageKeysOf(boxes)).toEqual([
      'calc.boxes.title',
      'calc.boxes.inputs.cnt',
      'calc.boxes.outputs.cost',
    ]);
  });

  it('wires the exports to working implementations', () => {
    const parsed = core.parseDecimal('0.5');
    expect(parsed).toEqual(core.ok(core.Rational.of(1, 2)));
    expect(core.err('X')).toEqual({ ok: false, errors: ['X'] });
    expect(new core.CoreError('X').code).toBe('X');
  });

  // spec: url-state-codec › Encoding and Decoding; design: codec and ALL_ERROR_CODES
  it('wires the url codec and the user-facing error codes', () => {
    const state = core.decode(fixtureBox, 'v=1&b=7&u=m');
    expect(core.encode(fixtureBox, state.state, { unitSystem: state.unitSystem })).toBe(
      'v=1&u=m&b=7',
    );
    expect(core.RESERVED_URL_KEYS).toEqual(['v', 'u']);
    expect(core.URL_ISSUE_CODES).toEqual(['INVALID_VALUE', 'UNSUPPORTED_VERSION']);
    expect(core.ALL_ERROR_CODES).toHaveLength(12);
    expect(core.ALL_ERROR_CODES).toEqual([...core.FIELD_ERROR_CODES, ...core.URL_ISSUE_CODES]);
  });

  // spec: calc-rectangle-area; design: Package Layout (the barrel never re-exports calculators)
  it('does not re-export any calculator', () => {
    expect(core).not.toHaveProperty('rectangleArea');
    // a calculator is the only export with a `compute` function
    const exported: unknown[] = Object.values(core);
    const calculators = exported.filter(
      (value) => typeof value === 'object' && value !== null && 'compute' in value,
    );
    expect(calculators).toEqual([]);
  });
});
