import { describe, expect, it } from 'vitest';
import { sod } from './sod.ts';

// The URL keys are a public contract: a shared link must reopen the same numbers forever.
describe('sod contract', () => {
  it('keys every input', () => {
    expect(sod.inputs.map(({ key, urlKey }) => [key, urlKey])).toEqual([
      ['area', 'a'],
      ['waste', 'w'],
      ['pallet', 'p'],
    ]);
  });

  it('leads with its primary output', () => {
    expect(sod.outputs.map(({ key, role }) => [key, role])).toEqual([
      ['order', 'primary'],
      ['extra', 'secondary'],
      ['pallets', 'secondary'],
      ['slabs', 'secondary'],
    ]);
  });
});
