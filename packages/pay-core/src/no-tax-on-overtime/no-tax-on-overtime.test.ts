import { usd } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { noTaxOnOvertime } from './no-tax-on-overtime.ts';

// Schedule 1-A (Form 1040), Part III: the "half" of time and a half that the FLSA requires, capped
// at $12,500 ($25,000 joint), less $100 per whole $1,000 of MAGI over $150,000 ($300,000 joint).
// The savings are the deduction times the bracket the filer picks: an estimate, never a tax return.
const outputsOf = (raw: Readonly<Record<string, unknown>>): Record<string, unknown> => {
  const ran = noTaxOnOvertime.run(raw);
  if (!ran.ok) throw new Error(JSON.stringify(ran.errors));
  return Object.fromEntries(ran.value.outputs.map(({ key, value }) => [key, value]));
};

describe('no tax on overtime', () => {
  it('deducts the half of 300 overtime hours at $22: $3,300, about $396 at 12%', () => {
    expect(outputsOf({})).toEqual({
      deduction: usd(3300),
      premium: usd(3300),
      reduction: usd(0),
      savings: usd(396),
    });
  });

  it('caps 1,000 hours at $30 ($15,000 premium) at $12,500 for a single filer', () => {
    const out = outputsOf({ rate: '30', overtimeHours: '1000', magi: '100000', bracket: '22' });
    expect(out['premium']).toEqual(usd(15000));
    expect(out['deduction']).toEqual(usd(12500));
    expect(out['savings']).toEqual(usd(2750));
  });

  it('takes the premium from the W-2 and phases it out: $20,000 at MAGI $165,500 is $11,000', () => {
    const out = outputsOf({ source: 'amount', premium: '20000', magi: '165500', bracket: '24' });
    expect(out['reduction']).toEqual(usd(1500));
    expect(out['deduction']).toEqual(usd(11000));
    expect(out['savings']).toEqual(usd(2640));
  });

  it('gives a joint return $25,000 and $300,000: $30,000 at MAGI $310,999 is $24,000', () => {
    const out = outputsOf({
      source: 'amount',
      premium: '30000',
      filing: 'joint',
      magi: '310999',
      bracket: '22',
    });
    expect(out['deduction']).toEqual(usd(24000));
    expect(out['savings']).toEqual(usd(5280));
  });

  it('phases out to zero at MAGI $275,000 for a single filer', () => {
    const out = outputsOf({ source: 'amount', premium: '12500', magi: '275000' });
    expect(out['deduction']).toEqual(usd(0));
    expect(out['savings']).toEqual(usd(0));
  });

  it('ignores the hours when the premium comes from the W-2, and the W-2 when from hours', () => {
    expect(
      outputsOf({ source: 'amount', premium: '1000', overtimeHours: '900' })['premium'],
    ).toEqual(usd(1000));
    expect(outputsOf({ source: 'hours', premium: '99999' })['premium']).toEqual(usd(3300));
  });
});
