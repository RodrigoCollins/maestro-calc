import { describe, expect, it } from 'vitest';
import { err, ok } from './result.ts';

describe('Result (exact-rational › Failure conventions)', () => {
  // spec: exact-rational › Failure conventions [ER-conv]
  it('wraps a value in the success shape', () => {
    expect(ok(1)).toEqual({ ok: true, value: 1 });
    expect(ok('text')).toEqual({ ok: true, value: 'text' });
  });

  // spec: exact-rational › Failure conventions [ER-conv]
  it('wraps a single error in the failure shape with a non-empty error list', () => {
    expect(err('X')).toEqual({ ok: false, errors: ['X'] });
    expect(err({ code: 'MALFORMED' })).toEqual({ ok: false, errors: [{ code: 'MALFORMED' }] });
  });
});
