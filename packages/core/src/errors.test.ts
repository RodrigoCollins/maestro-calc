import { describe, expect, it } from 'vitest';
import { CoreError } from './errors.ts';

describe('CoreError (exact-rational › Failure conventions)', () => {
  // spec: exact-rational › Failure conventions [ER-conv]
  it('is an Error named CoreError that exposes its code', () => {
    const error = new CoreError('DIVISION_BY_ZERO');
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('CoreError');
    expect(error.code).toBe('DIVISION_BY_ZERO');
    expect(error.message).toBe('DIVISION_BY_ZERO');
  });

  // spec: exact-rational › Failure conventions [ER-conv]
  it('has no reason property unless one is given', () => {
    expect('reason' in new CoreError('NOT_AN_INTEGER')).toBe(false);
  });

  // spec: exact-rational › Failure conventions [ER-conv]
  it('keeps the reason it was given', () => {
    const error = new CoreError('INVALID_DEFINITION', 'duplicate key');
    expect(error.reason).toBe('duplicate key');
    expect(error.code).toBe('INVALID_DEFINITION');
  });

  it('keeps the cause it was given and has none otherwise', () => {
    const cause = { id: 'box' };
    expect(new CoreError('INVALID_DEFINITION', 'NO_INPUTS', { cause }).cause).toBe(cause);
    expect('cause' in new CoreError('INVALID_DEFINITION', 'NO_INPUTS')).toBe(false);
  });
});
