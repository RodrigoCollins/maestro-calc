import { describe, expect, it } from 'vitest';
import { CONCRETE_YIELDS } from '../../__testing__/concrete-yields.ts';
import { Rational } from '../../rational/rational.ts';
import { ft3, in3 } from '../../units/catalog.ts';
import { isQuantityOf, valueIn } from '../../units/quantity.ts';
import { createConcrete } from './index.ts';

const concrete = createConcrete(CONCRETE_YIELDS);

/** The field, the code and the bound parameter of every error of a rejected run. */
const rejected = (raw: Readonly<Record<string, unknown>>) => {
  const result = concrete.run(raw);
  if (result.ok) throw new Error(`expected a rejection for ${JSON.stringify(raw)}`);
  return result.errors.map(({ field, code, params }) => ({ field, code, ...params }));
};

describe('concrete validation (calc-concrete › Validation)', () => {
  // spec: calc-concrete › [CC22] Rejected inputs
  it.each([
    [{ length: 'abc' }, { field: 'length', code: 'MALFORMED' }],
    [{ length: '1001ft' }, { field: 'length', code: 'ABOVE_MAX', max: '12000' }],
    [{ thickness: '1,5' }, { field: 'thickness', code: 'DECIMAL_COMMA' }],
    [{ count: '0' }, { field: 'count', code: 'BELOW_MIN', min: '1' }],
    [{ count: '1001' }, { field: 'count', code: 'ABOVE_MAX', max: '1000' }],
    [{ stepCount: '51' }, { field: 'stepCount', code: 'ABOVE_MAX', max: '50' }],
    [{ waste: '51' }, { field: 'waste', code: 'ABOVE_MAX', max: '50' }],
    [{ waste: '-1' }, { field: 'waste', code: 'BELOW_MIN', min: '0' }],
    [{ shape: 'pool' }, { field: 'shape', code: 'UNKNOWN_OPTION' }],
    [{ shape: 'Slab' }, { field: 'shape', code: 'UNKNOWN_OPTION' }],
    [{ bag: '50' }, { field: 'bag', code: 'UNKNOWN_OPTION' }],
    [{ bagPrice: '-1' }, { field: 'bagPrice', code: 'MALFORMED' }],
    [{ bagPrice: '10000.01' }, { field: 'bagPrice', code: 'ABOVE_MAX', max: '10000' }],
    [{ readyMixPrice: '1,50' }, { field: 'readyMixPrice', code: 'DECIMAL_COMMA' }],
    [{ diameter: '' }, { field: 'diameter', code: 'EMPTY' }],
  ])('rejects %j with exactly one error', (raw, expected) => {
    expect(rejected(raw)).toEqual([expected]);
  });

  // spec: calc-concrete › [CC23] Hidden fields are validated too
  it('validates a field the chosen shape does not use', () => {
    expect(rejected({ shape: 'slab', diameter: 'abc' })).toEqual([
      { field: 'diameter', code: 'MALFORMED' },
    ]);
  });

  // spec: calc-concrete › [CC24] Inputs accept feet-inch-fraction and metric
  it.each([[`12' 6"`], ['3.81 m']])('reads the length %s as 150 in', (length) => {
    const result = concrete.run({ length });
    if (!result.ok) throw new Error('run failed');
    const net = result.value.outputs.find(({ key }) => key === 'netVolume')?.value;
    if (!isQuantityOf(net, 'volume')) throw new Error('netVolume is not a volume');
    expect(valueIn(net, ft3)).toEqual(Rational.of(125, 3));
    expect(valueIn(net, in3)).toEqual(Rational.of(72000));
  });
});
