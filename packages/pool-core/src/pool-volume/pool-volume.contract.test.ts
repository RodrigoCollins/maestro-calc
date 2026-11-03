import { describe, expect, it } from 'vitest';
import { poolVolume } from './pool-volume.ts';

// The URL keys are a public contract: a shared link must reopen the same numbers forever.
describe('pool-volume contract', () => {
  it('keys every input', () => {
    expect(poolVolume.inputs.map(({ key, urlKey }) => [key, urlKey])).toEqual([
      ['shape', 's'],
      ['length', 'l'],
      ['width', 'w'],
      ['shallow', 'sh'],
      ['deep', 'd'],
    ]);
  });

  it('leads with its primary output', () => {
    expect(poolVolume.outputs.map(({ key, role }) => [key, role])).toEqual([
      ['gallons', 'primary'],
      ['liters', 'secondary'],
      ['cubicFeet', 'secondary'],
    ]);
  });
});
