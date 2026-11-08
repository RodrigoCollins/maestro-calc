import { describe, expect, it } from 'vitest';
import { lawnFertilizer } from './lawn-fertilizer.ts';

// The URL keys are a public contract: a shared link must reopen the same numbers forever.
describe('lawn-fertilizer contract', () => {
  it('keys every input', () => {
    expect(lawnFertilizer.inputs.map(({ key, urlKey }) => [key, urlKey])).toEqual([
      ['area', 'a'],
      ['nitrogen', 'n'],
      ['phosphate', 'p'],
      ['potash', 'k'],
      ['target', 't'],
      ['bag', 'b'],
    ]);
  });

  it('leads with its primary output', () => {
    expect(lawnFertilizer.outputs.map(({ key, role }) => [key, role])).toEqual([
      ['pounds', 'primary'],
      ['perThousand', 'secondary'],
      ['bagCoverage', 'secondary'],
      ['nitrogenPounds', 'secondary'],
      ['phosphatePounds', 'secondary'],
      ['potashPounds', 'secondary'],
    ]);
  });
});
