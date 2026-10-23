import { describe, expect, it } from 'vitest';
import { RESERVED_URL_KEYS, UNIT_KEY, VERSION_KEY } from './reserved-keys.ts';

describe('reserved url keys (url-state-codec › Key stability rules, rule 7)', () => {
  it('reserves v for the format version and u for the unit system', () => {
    expect(VERSION_KEY).toBe('v');
    expect(UNIT_KEY).toBe('u');
    expect(RESERVED_URL_KEYS).toEqual([VERSION_KEY, UNIT_KEY]);
  });

  it('cannot be changed by a consumer', () => {
    expect(Object.isFrozen(RESERVED_URL_KEYS)).toBe(true);
  });
});
