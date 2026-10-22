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
      'err',
      'ok',
      'parseDecimal',
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

  it('wires the exports to working implementations', () => {
    const parsed = core.parseDecimal('0.5');
    expect(parsed).toEqual(core.ok(core.Rational.of(1, 2)));
    expect(core.err('X')).toEqual({ ok: false, errors: ['X'] });
    expect(new core.CoreError('X').code).toBe('X');
  });
});
