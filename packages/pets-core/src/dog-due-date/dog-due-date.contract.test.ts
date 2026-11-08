import { describe, expect, it } from 'vitest';
import { dogDueDate } from './dog-due-date.ts';

// The URL keys are a public contract: a shared link must reopen the same numbers forever.
describe('dog-due-date contract', () => {
  it('keys every input', () => {
    expect(dogDueDate.inputs.map(({ key, urlKey }) => [key, urlKey])).toEqual([
      ['method', 'm'],
      ['year', 'y'],
      ['month', 'mo'],
      ['day', 'd'],
    ]);
  });

  it('offers the three starting points of Merck', () => {
    const method = dogDueDate.inputs.find(({ key }) => key === 'method');
    expect(method?.kind === 'select' && method.options).toEqual(['breeding', 'lh', 'diestrus']);
  });

  it('leads with its primary output and names its one warning', () => {
    expect(dogDueDate.outputs.map(({ key, role }) => [key, role])).toEqual([
      ['earliest', 'primary'],
      ['latest', 'secondary'],
      ['from', 'secondary'],
      ['minDays', 'secondary'],
      ['maxDays', 'secondary'],
    ]);
    expect(dogDueDate.warnings).toEqual(['dayMovedBack']);
  });
});
