import { describe, expect, it } from 'vitest';
import { grassSeed } from './grass-seed.ts';
import { SEED_SOURCES, SEED_SPECIES } from './rates.ts';

// The URL keys are a public contract: a shared link must reopen the same numbers forever.
describe('grass-seed contract', () => {
  it('keys every input', () => {
    expect(grassSeed.inputs.map(({ key, urlKey }) => [key, urlKey])).toEqual([
      ['area', 'a'],
      ['species', 's'],
      ['source', 'r'],
      ['bag', 'b'],
    ]);
  });

  it('leads with its primary output', () => {
    expect(grassSeed.outputs.map(({ key, role }) => [key, role])).toEqual([
      ['lowPounds', 'primary'],
      ['highPounds', 'secondary'],
      ['lowPerPass', 'secondary'],
      ['highPerPass', 'secondary'],
      ['lowBags', 'secondary'],
      ['highBags', 'secondary'],
    ]);
  });

  it('keeps the option ids that shared links carry', () => {
    expect(SEED_SPECIES).toEqual([
      'kentucky-bluegrass',
      'tall-fescue',
      'fine-fescue',
      'perennial-ryegrass',
      'bermudagrass-hulled',
      'bermudagrass-unhulled',
      'zoysiagrass',
    ]);
    expect(SEED_SOURCES).toEqual(['virginia-tech', 'tennessee']);
  });
});
