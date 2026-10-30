import { describe, expect, it } from 'vitest';
import { CONCRETE_YIELDS } from '../__testing__/concrete-yields.ts';
import { DRYWALL_FINISHING } from '../__testing__/drywall-yields.ts';
import { GRAVEL_DENSITIES } from '../__testing__/gravel-yields.ts';
import { PAINT_COVERAGE } from '../__testing__/paint-yields.ts';
import { RELEASED } from '../__testing__/released-snapshot.ts';
import { compareReleased, type ReleasedCalculator } from '../url/released-harness.ts';
import { createConcrete } from './concrete/index.ts';
import { createDrywall } from './drywall/index.ts';
import { createGravel } from './gravel/index.ts';
import { mulch } from './mulch/index.ts';
import { createPaint } from './paint/index.ts';
import { topsoil } from './topsoil/index.ts';
import { rectangleArea } from './rectangle-area/index.ts';

/** Every calculator of core that has been released; the web registry is checked in `apps/web`. */
const REGISTRY: readonly ReleasedCalculator[] = [
  rectangleArea,
  createConcrete(CONCRETE_YIELDS),
  createGravel(GRAVEL_DENSITIES),
  mulch,
  topsoil,
  createPaint(PAINT_COVERAGE),
  createDrywall(DRYWALL_FINISHING),
];

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

  // spec: calc-gravel › [GR6] the six inputs of gravel, appended in the order of the spec
  it('records the 6 inputs of gravel in the order of the spec', () => {
    const tuples = RELEASED.filter(({ calculatorId }) => calculatorId === 'gravel');
    expect(tuples.map(({ urlKey, key, kind, default: text }) => [urlKey, key, kind, text])).toEqual(
      [
        ['l', 'length', 'length', '240'],
        ['w', 'width', 'length', '120'],
        ['d', 'depth', 'length', '4'],
        ['pl', 'placement', 'select', 'compacted'],
        ['ws', 'waste', 'percent', '5'],
        ['tp', 'tonPrice', 'money', '0'],
      ],
    );
    expect(tuples.find(({ urlKey }) => urlKey === 'pl')?.options).toEqual(['compacted', 'loose']);
  });

  // spec: calc-mulch › [MU4] the seven inputs of mulch, appended in the order of the spec
  it('records the 7 inputs of mulch in the order of the spec', () => {
    const tuples = RELEASED.filter(({ calculatorId }) => calculatorId === 'mulch');
    expect(tuples.map(({ urlKey, key, kind, default: text }) => [urlKey, key, kind, text])).toEqual(
      [
        ['l', 'length', 'length', '240'],
        ['w', 'width', 'length', '48'],
        ['d', 'depth', 'length', '3'],
        ['ws', 'waste', 'percent', '5'],
        ['bg', 'bag', 'select', '2'],
        ['bp', 'bagPrice', 'money', '0'],
        ['yp', 'yardPrice', 'money', '0'],
      ],
    );
  });

  // spec: calc-topsoil › [TS4] the seven inputs of topsoil, appended in the order of the spec
  it('records the 7 inputs of topsoil in the order of the spec', () => {
    const tuples = RELEASED.filter(({ calculatorId }) => calculatorId === 'topsoil');
    expect(tuples.map(({ urlKey, key, kind, default: text }) => [urlKey, key, kind, text])).toEqual(
      [
        ['l', 'length', 'length', '120'],
        ['w', 'width', 'length', '120'],
        ['d', 'depth', 'length', '4'],
        ['ws', 'waste', 'percent', '10'],
        ['bg', 'bag', 'select', '0-75'],
        ['bp', 'bagPrice', 'money', '0'],
        ['yp', 'yardPrice', 'money', '0'],
      ],
    );
  });

  // spec: calc-paint › [PA7] the seven inputs of paint, appended in the order of the spec
  it('records the 7 inputs of paint in the order of the spec', () => {
    const tuples = RELEASED.filter(({ calculatorId }) => calculatorId === 'paint');
    expect(tuples.map(({ urlKey, key, kind, default: text }) => [urlKey, key, kind, text])).toEqual(
      [
        ['l', 'length', 'length', '144'],
        ['w', 'width', 'length', '144'],
        ['h', 'height', 'length', '96'],
        ['dr', 'doors', 'count', '1'],
        ['wn', 'windows', 'count', '2'],
        ['c', 'coats', 'count', '2'],
        ['gp', 'gallonPrice', 'money', '0'],
      ],
    );
  });

  // spec: calc-drywall › [DW8] the nine inputs of drywall, appended in the order of the spec
  it('records the 9 inputs of drywall in the order of the spec', () => {
    const tuples = RELEASED.filter(({ calculatorId }) => calculatorId === 'drywall');
    expect(tuples.map(({ urlKey, key, kind, default: text }) => [urlKey, key, kind, text])).toEqual(
      [
        ['l', 'length', 'length', '144'],
        ['w', 'width', 'length', '144'],
        ['h', 'height', 'length', '96'],
        ['dr', 'doors', 'count', '1'],
        ['wn', 'windows', 'count', '2'],
        ['sf', 'surfaces', 'select', 'walls-ceiling'],
        ['sz', 'sheet', 'select', '4x8'],
        ['ws', 'waste', 'percent', '10'],
        ['sp', 'sheetPrice', 'money', '0'],
      ],
    );
  });
});
