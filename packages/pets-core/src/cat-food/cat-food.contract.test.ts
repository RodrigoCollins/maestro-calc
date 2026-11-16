import { describe, expect, it } from 'vitest';
import { catFood } from './cat-food.ts';

// The URL keys are a public contract: a shared link must reopen the same numbers forever.
describe('cat-food contract', () => {
  it('keys every input', () => {
    expect(catFood.inputs.map(({ key, urlKey }) => [key, urlKey])).toEqual([
      ['weight', 'w'],
      ['unit', 'wu'],
      ['status', 's'],
      ['dryKcal', 'd'],
      ['wetKcal', 'c'],
      ['wetShare', 'ws'],
      ['dryBasis', 'db'],
    ]);
  });

  it('offers the cat statuses', () => {
    const status = catFood.inputs.find(({ key }) => key === 'status');
    expect(status?.kind === 'select' && status.options).toEqual([
      'neutered',
      'intact',
      'inactive',
      'weight-loss',
      'kitten',
    ]);
  });

  it('leads with its primary output', () => {
    expect(catFood.outputs.map(({ key, role }) => [key, role])).toEqual([
      ['cups', 'primary'],
      ['cans', 'secondary'],
      ['cupsWithTreats', 'secondary'],
      ['cansWithTreats', 'secondary'],
      ['mer', 'secondary'],
      ['rer', 'secondary'],
      ['low', 'secondary'],
      ['high', 'secondary'],
      ['treats', 'secondary'],
      ['grams', 'secondary'],
      ['gramsWithTreats', 'secondary'],
    ]);
  });

  it('reads the dry label per cup or per kilogram, by the cup unless a link says otherwise', () => {
    const basis = catFood.inputs.find(({ key }) => key === 'dryBasis');
    expect(basis?.kind === 'select' && basis.options).toEqual(['cup', 'kg']);
    expect(basis?.kind === 'select' && basis.default).toBe('cup');
  });
});
