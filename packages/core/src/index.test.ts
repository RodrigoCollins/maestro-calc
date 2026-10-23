import { describe, expect, it } from 'vitest';
import * as core from './index.ts';

describe('core public API (design: Public API)', () => {
  // design: Public API — Rational, parseDecimal, Result helpers and CoreError
  it('exports the exact-number toolkit', () => {
    expect(Object.keys(core).sort()).toEqual([
      'CoreError',
      'DECIMAL_PARSE_CODES',
      'LENGTH_PARSE_CODES',
      'RATIONAL_PARSE_CODES',
      'Rational',
      'abs',
      'add',
      'ceilToPurchaseUnits',
      'cm',
      'cm2',
      'cm3',
      'compare',
      'divide',
      'divideScalar',
      'equals',
      'err',
      'findUnit',
      'formatFeetInches',
      'ft',
      'ft2',
      'ft3',
      'in2',
      'in3',
      'inch',
      'isZero',
      'kg',
      'kgM3',
      'lb',
      'lbFt3',
      'lbIn3',
      'lbYd3',
      'm',
      'm2',
      'm3',
      'mm',
      'mm2',
      'mm3',
      'multiply',
      'negate',
      'ok',
      'oz',
      'parseDecimal',
      'parseLength',
      'quantity',
      'ratio',
      'roundToFraction',
      'scale',
      'sign',
      'sub',
      'toDecimalParts',
      'ton',
      'tonYd3',
      'tonne',
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

  it('wires the exports to working implementations', () => {
    const parsed = core.parseDecimal('0.5');
    expect(parsed).toEqual(core.ok(core.Rational.of(1, 2)));
    expect(core.err('X')).toEqual({ ok: false, errors: ['X'] });
    expect(new core.CoreError('X').code).toBe('X');
  });
});
