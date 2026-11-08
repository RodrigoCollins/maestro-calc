import { describe, expect, it } from 'vitest';
import { lawnLime } from './lawn-lime.ts';

// The URL keys are a public contract: a shared link must reopen the same numbers forever.
describe('lawn-lime contract', () => {
  it('keys every input', () => {
    expect(lawnLime.inputs.map(({ key, urlKey }) => [key, urlKey])).toEqual([
      ['area', 'a'],
      ['rate', 'r'],
      ['cce', 'c'],
      ['bag', 'b'],
    ]);
  });

  it('leads with its primary output', () => {
    expect(lawnLime.outputs.map(({ key, role }) => [key, role])).toEqual([
      ['pounds', 'primary'],
      ['perThousand', 'secondary'],
    ]);
  });
});
