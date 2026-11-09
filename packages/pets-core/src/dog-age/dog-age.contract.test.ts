import { describe, expect, it } from 'vitest';
import { dogAge } from './dog-age.ts';

// The URL keys are a public contract: a shared link must reopen the same numbers forever.
describe('dog-age contract', () => {
  it('keys every input', () => {
    expect(dogAge.inputs.map(({ key, urlKey }) => [key, urlKey])).toEqual([
      ['from', 'f'],
      ['age', 'a'],
      ['size', 's'],
    ]);
  });

  it('works either way, for the four sizes', () => {
    const options = (key: string) => {
      const input = dogAge.inputs.find((candidate) => candidate.key === key);
      return input?.kind === 'select' ? input.options : undefined;
    };
    expect(options('from')).toEqual(['dog', 'human']);
    expect(options('size')).toEqual(['small', 'medium', 'large', 'giant']);
  });

  it('leads with its primary output and names its two warnings', () => {
    expect(dogAge.outputs.map(({ key, role }) => [key, role])).toEqual([
      ['answer', 'primary'],
      ['dogAge', 'secondary'],
      ['humanAge', 'secondary'],
      ['wang', 'secondary'],
      ['seven', 'secondary'],
      ['stage', 'secondary'],
      ['seniorAt', 'secondary'],
    ]);
    expect(dogAge.warnings).toEqual(['outside', 'wangOutside']);
  });
});
