import { describe, expect, it } from 'vitest';
import { dogChocolate } from './dog-chocolate.ts';

// The URL keys are a public contract: a shared link must reopen the same numbers forever.
describe('dog-chocolate contract', () => {
  it('keys every input', () => {
    expect(dogChocolate.inputs.map(({ key, urlKey }) => [key, urlKey])).toEqual([
      ['weight', 'w'],
      ['weightUnit', 'wu'],
      ['type', 't'],
      ['amount', 'a'],
      ['amountUnit', 'au'],
    ]);
  });

  it('offers the six kinds of chocolate and the two units of the amount', () => {
    const options = (key: string) => {
      const input = dogChocolate.inputs.find((candidate) => candidate.key === key);
      return input?.kind === 'select' ? input.options : undefined;
    };
    expect(options('type')).toEqual(['white', 'milk', 'dark', 'baking', 'cocoa-powder', 'hulls']);
    expect(options('amountUnit')).toEqual(['oz', 'g']);
    expect(options('weightUnit')).toEqual(['lb', 'kg']);
  });

  it('leads with its primary output', () => {
    expect(dogChocolate.outputs.map(({ key, role }) => [key, role])).toEqual([
      ['dose', 'primary'],
      ['totalMg', 'secondary'],
      ['band', 'secondary'],
      ['reach20', 'secondary'],
      ['reach40', 'secondary'],
      ['reach60', 'secondary'],
    ]);
  });
});
