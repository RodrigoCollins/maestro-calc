import { describe, expect, it } from 'vitest';
import * as core from './index.ts';

describe('core public API (design: Public API)', () => {
  // design: Public API — Rational, parseDecimal, Result helpers and CoreError
  it('exports the exact-number toolkit', () => {
    expect(Object.keys(core).sort()).toEqual([
      'CoreError',
      'DECIMAL_PARSE_CODES',
      'RATIONAL_PARSE_CODES',
      'Rational',
      'abs',
      'add',
      'cm',
      'cm2',
      'cm3',
      'compare',
      'divide',
      'divideScalar',
      'equals',
      'err',
      'findUnit',
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
      'quantity',
      'ratio',
      'scale',
      'sign',
      'sub',
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

  it('wires the exports to working implementations', () => {
    const parsed = core.parseDecimal('0.5');
    expect(parsed).toEqual(core.ok(core.Rational.of(1, 2)));
    expect(core.err('X')).toEqual({ ok: false, errors: ['X'] });
    expect(new core.CoreError('X').code).toBe('X');
  });
});
