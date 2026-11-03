import { describe, expect, it } from 'vitest';
import { noTaxOnTips } from './no-tax-on-tips.ts';

// The URL keys are a public contract: a shared link must reopen the same estimate forever.
describe('no tax on tips contract', () => {
  it('keys every input', () => {
    expect(noTaxOnTips.inputs.map(({ key, urlKey }) => [key, urlKey])).toEqual([
      ['tips', 't'],
      ['filing', 'f'],
      ['magi', 'm'],
      ['bracket', 'b'],
    ]);
  });

  it('leads with the deduction', () => {
    expect(noTaxOnTips.outputs.map(({ key, role }) => [key, role])).toEqual([
      ['deduction', 'primary'],
      ['reduction', 'secondary'],
      ['savings', 'secondary'],
    ]);
  });
});
