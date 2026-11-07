import { describe, expect, it } from 'vitest';
import { dogFood } from './dog-food.ts';

// The URL keys are a public contract: a shared link must reopen the same numbers forever.
describe('dog-food contract', () => {
  it('keys every input', () => {
    expect(dogFood.inputs.map(({ key, urlKey }) => [key, urlKey])).toEqual([
      ['weight', 'w'],
      ['unit', 'wu'],
      ['status', 's'],
      ['basis', 'b'],
      ['kcal', 'k'],
    ]);
  });

  it('offers the dog statuses and the three label bases', () => {
    const options = (key: string) => {
      const input = dogFood.inputs.find((candidate) => candidate.key === key);
      return input?.kind === 'select' ? input.options : undefined;
    };
    expect(options('unit')).toEqual(['lb', 'kg']);
    expect(options('basis')).toEqual(['cup', 'kg', 'can']);
    expect(options('status')).toEqual([
      'neutered',
      'intact',
      'inactive',
      'weight-loss',
      'puppy-young',
      'puppy-older',
    ]);
  });

  it('leads with its primary output', () => {
    expect(dogFood.outputs.map(({ key, role }) => [key, role])).toEqual([
      ['portion', 'primary'],
      ['portionWithTreats', 'secondary'],
      ['mer', 'secondary'],
      ['rer', 'secondary'],
      ['low', 'secondary'],
      ['high', 'secondary'],
      ['treats', 'secondary'],
    ]);
  });
});
