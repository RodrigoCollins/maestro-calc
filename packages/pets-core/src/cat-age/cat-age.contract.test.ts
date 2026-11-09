import { describe, expect, it } from 'vitest';
import { catAge } from './cat-age.ts';

// The URL keys are a public contract: a shared link must reopen the same numbers forever.
describe('cat-age contract', () => {
  it('keys every input', () => {
    expect(catAge.inputs.map(({ key, urlKey }) => [key, urlKey])).toEqual([
      ['from', 'f'],
      ['age', 'a'],
    ]);
  });

  it('works either way', () => {
    const from = catAge.inputs.find((candidate) => candidate.key === 'from');
    expect(from?.kind === 'select' ? from.options : undefined).toEqual(['cat', 'human']);
  });

  it('leads with its primary output and names its two warnings', () => {
    expect(catAge.outputs.map(({ key, role }) => [key, role])).toEqual([
      ['answer', 'primary'],
      ['catAge', 'secondary'],
      ['humanAge', 'secondary'],
      ['cornell', 'secondary'],
      ['seven', 'secondary'],
      ['stage', 'secondary'],
      ['careStage', 'secondary'],
      ['visits', 'secondary'],
    ]);
    expect(catAge.warnings).toEqual(['outside', 'cornellOutside']);
  });
});
