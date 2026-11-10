import { describe, expect, it } from 'vitest';
import { puppyWeight } from './puppy-weight.ts';

// The URL keys are a public contract: a shared link must reopen the same numbers forever.
describe('puppy-weight contract', () => {
  it('keys every input', () => {
    expect(puppyWeight.inputs.map(({ key, urlKey }) => [key, urlKey])).toEqual([
      ['weight', 'w'],
      ['unit', 'wu'],
      ['age', 'a'],
      ['size', 's'],
    ]);
  });

  it('weighs in pounds or kilograms, on the three size classes of the table', () => {
    const options = (key: string) => {
      const input = puppyWeight.inputs.find((candidate) => candidate.key === key);
      return input?.kind === 'select' ? input.options : undefined;
    };
    expect(options('unit')).toEqual(['lb', 'kg']);
    expect(options('size')).toEqual(['small', 'large', 'giant']);
  });

  it('leads with its primary output and names its three warnings', () => {
    expect(puppyWeight.outputs.map(({ key, role }) => [key, role])).toEqual([
      ['adult', 'primary'],
      ['low', 'secondary'],
      ['high', 'secondary'],
      ['share', 'secondary'],
      ['months', 'secondary'],
      ['adultOther', 'secondary'],
      ['grownBy', 'secondary'],
    ]);
    expect(puppyWeight.warnings).toEqual(['early', 'grown', 'outsideClass']);
  });
});
