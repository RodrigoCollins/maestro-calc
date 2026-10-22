import { describe, expect, it } from 'vitest';
import * as core from './index.ts';

describe('core public API (design: Public API)', () => {
  // design: Public API — Rational, parseDecimal, Result helpers and CoreError
  it('exports the exact-number toolkit', () => {
    expect(Object.keys(core).sort()).toEqual([
      'CoreError',
      'Rational',
      'err',
      'ok',
      'parseDecimal',
    ]);
  });

  it('wires the exports to working implementations', () => {
    const parsed = core.parseDecimal('0.5');
    expect(parsed).toEqual(core.ok(core.Rational.of(1, 2)));
    expect(core.err('X')).toEqual({ ok: false, errors: ['X'] });
    expect(new core.CoreError('X').code).toBe('X');
  });
});
