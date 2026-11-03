import { describe, expect, it } from 'vitest';
import { noTaxOnOvertime } from './no-tax-on-overtime.ts';

// The URL keys are a public contract: a shared link must reopen the same estimate forever.
describe('no tax on overtime contract', () => {
  it('keys every input', () => {
    expect(noTaxOnOvertime.inputs.map(({ key, urlKey }) => [key, urlKey])).toEqual([
      ['source', 's'],
      ['rate', 'r'],
      ['overtimeHours', 'o'],
      ['premium', 'q'],
      ['filing', 'f'],
      ['magi', 'm'],
      ['bracket', 'b'],
    ]);
  });

  it('offers the two sources, the two filings and the seven brackets', () => {
    const [source, , , , filing, , bracket] = noTaxOnOvertime.inputs;
    expect(source.options).toEqual(['hours', 'amount']);
    expect(filing.options).toEqual(['single', 'joint']);
    expect(bracket.options).toEqual(['10', '12', '22', '24', '32', '35', '37']);
  });

  it('leads with the deduction', () => {
    expect(noTaxOnOvertime.outputs.map(({ key, role }) => [key, role])).toEqual([
      ['deduction', 'primary'],
      ['premium', 'secondary'],
      ['reduction', 'secondary'],
      ['savings', 'secondary'],
    ]);
  });
});
