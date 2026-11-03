import { usd } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { noTaxOnTips } from './no-tax-on-tips.ts';

// Schedule 1-A (Form 1040), Part II: qualified tips capped at $25,000 on every return (joint
// included), less $100 per whole $1,000 of MAGI over $150,000 ($300,000 joint).
const outputsOf = (raw: Readonly<Record<string, unknown>>): Record<string, unknown> => {
  const ran = noTaxOnTips.run(raw);
  if (!ran.ok) throw new Error(JSON.stringify(ran.errors));
  return Object.fromEntries(ran.value.outputs.map(({ key, value }) => [key, value]));
};

describe('no tax on tips', () => {
  it('deducts $8,000 of tips, about $960 at 12%', () => {
    expect(outputsOf({})).toEqual({ deduction: usd(8000), reduction: usd(0), savings: usd(960) });
  });

  it('caps $30,000 of tips at $25,000 and phases it out: MAGI $160,000 leaves $24,000', () => {
    const out = outputsOf({ tips: '30000', magi: '160000', bracket: '22' });
    expect(out['reduction']).toEqual(usd(1000));
    expect(out['deduction']).toEqual(usd(24000));
    expect(out['savings']).toEqual(usd(5280));
  });

  it('keeps the $25,000 cap on a joint return: $30,000 at MAGI $305,500 is $24,500', () => {
    const out = outputsOf({ tips: '30000', filing: 'joint', magi: '305500' });
    expect(out['deduction']).toEqual(usd(24500));
  });

  it('does not phase out a single filer at MAGI $150,999', () => {
    expect(outputsOf({ tips: '10000', magi: '150999' })['deduction']).toEqual(usd(10000));
  });
});
