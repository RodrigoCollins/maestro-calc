import { describe, expect, it } from 'vitest';
import { CONCRETE_YIELDS } from '../__testing__/concrete-yields.ts';
import { RELEASED } from '../__testing__/released-snapshot.ts';
import { compareReleased, type ReleasedCalculator } from '../url/released-harness.ts';
import { createConcrete } from './concrete/index.ts';
import { rectangleArea } from './rectangle-area/index.ts';

/** Every calculator of core that has been released; the web registry is checked in `apps/web`. */
const REGISTRY: readonly ReleasedCalculator[] = [rectangleArea, createConcrete(CONCRETE_YIELDS)];

// The released snapshot is checked here, in the `calculators` mutation shard, and the harness that
// does the checking is tested in `url/released-harness.test.ts` with hand-built calculators: the
// `url` shard imports neither a calculator nor the snapshot, so a new calculator never colds it.
describe('released url keys of the calculators (url-state-codec › Key stability rules)', () => {
  it('holds for every released calculator', () => {
    expect(compareReleased(RELEASED, REGISTRY)).toEqual([]);
  });

  // spec: calc-rectangle-area › Descriptor: exactly the keys and defaults l and w, default 120
  it('records rectangle-area with one tuple per input, in order', () => {
    expect(
      RELEASED.filter(({ calculatorId }) => calculatorId === 'rectangle-area').map(
        ({ calculatorId, key, urlKey, default: text }) => [calculatorId, key, urlKey, text],
      ),
    ).toEqual([
      ['rectangle-area', 'length', 'l', '120'],
      ['rectangle-area', 'width', 'w', '120'],
    ]);
    expect(rectangleArea.inputs.map(({ key, urlKey }) => [key, urlKey])).toEqual([
      ['length', 'l'],
      ['width', 'w'],
    ]);
  });

  // spec: calc-concrete › [CC2] Released snapshot
  it('records the 17 inputs of concrete in the order of the spec', () => {
    const tuples = RELEASED.filter(({ calculatorId }) => calculatorId === 'concrete');
    expect(tuples.map(({ urlKey, key, kind, default: text }) => [urlKey, key, kind, text])).toEqual(
      [
        ['sh', 'shape', 'select', 'slab'],
        ['l', 'length', 'length', '144'],
        ['w', 'width', 'length', '120'],
        ['t', 'thickness', 'length', '4'],
        ['fw', 'footingWidth', 'length', '16'],
        ['fd', 'footingDepth', 'length', '8'],
        ['d', 'diameter', 'length', '12'],
        ['h', 'height', 'length', '96'],
        ['sw', 'stepWidth', 'length', '48'],
        ['rs', 'rise', 'length', '7'],
        ['rn', 'run', 'length', '11'],
        ['ns', 'stepCount', 'count', '3'],
        ['n', 'count', 'count', '1'],
        ['ws', 'waste', 'percent', '10'],
        ['bg', 'bag', 'select', '80'],
        ['bp', 'bagPrice', 'money', '0'],
        ['rp', 'readyMixPrice', 'money', '0'],
      ],
    );
    expect(tuples.find(({ urlKey }) => urlKey === 'sh')?.options).toEqual([
      'slab',
      'footing',
      'column',
      'steps',
    ]);
    expect(tuples.find(({ urlKey }) => urlKey === 'bg')?.options).toEqual(['40', '60', '80']);
  });
});
