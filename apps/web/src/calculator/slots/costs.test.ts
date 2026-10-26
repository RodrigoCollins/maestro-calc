import { describe, expect, it } from 'vitest';
import { pageModuleErrorOf, unwrap } from '../../__testing__/page-fixtures.ts';
import { concrete } from '../../lib/concrete.ts';
import { costSlot } from './costs.ts';

const rows = [
  { output: 'bagCost', price: 'bagPrice' },
  { output: 'readyMixCost', price: 'readyMixPrice' },
] as const;
const copy = { hint: 'priceHint', note: 'readyMixNote' };
const valid = (raw: Readonly<Record<string, unknown>>) => unwrap(concrete.validate(raw));

describe('costSlot (calculator-page › [CP16])', () => {
  const slot = costSlot(concrete, rows, copy);

  it('carries its rows and its page-key suffixes', () => {
    expect(slot.rows).toEqual(rows);
    expect(slot.hint).toBe('priceHint');
    expect(slot.note).toBe('readyMixNote');
  });

  // spec: calculator-page › [CP16] a row shows only once its price is above zero
  it.each([
    ['both prices zero', {}, { bagCost: false, readyMixCost: false }],
    ['a bag price', { bagPrice: '6.50' }, { bagCost: true, readyMixCost: false }],
    [
      'both prices',
      { bagPrice: '6.50', readyMixPrice: '150' },
      { bagCost: true, readyMixCost: true },
    ],
  ])('is %s: %j', (_what, raw, expected) => {
    expect(slot.visible(valid(raw))).toEqual(expected);
  });

  it('may have no note', () => {
    expect(costSlot(concrete, rows, { hint: 'priceHint' }).note).toBeUndefined();
  });

  it.each([
    ['an output that is not money', [{ output: 'volumeYd3', price: 'bagPrice' }]],
    ['a price that is not money', [{ output: 'bagCost', price: 'waste' }]],
    ['an unknown output', [{ output: 'nope', price: 'bagPrice' }]],
    ['an unknown price', [{ output: 'bagCost', price: 'nope' }]],
  ])('throws COST_KINDS for %s', (_what, bad) => {
    const error = pageModuleErrorOf(() => costSlot(concrete, bad as never, copy));
    expect(error.code).toBe('COST_KINDS');
    expect(error.cause).toEqual({ id: 'concrete', ...bad[0] });
  });
});
