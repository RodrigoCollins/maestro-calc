import { describe, expect, it } from 'vitest';
import { RELEASED } from '../__testing__/released-snapshot.ts';
import { compareReleased, type ReleasedCalculator } from '../url/released-harness.ts';
import { rectangleArea } from './rectangle-area/index.ts';

/** Every calculator of core that has been released; the web registry is checked in `apps/web`. */
const REGISTRY: readonly ReleasedCalculator[] = [rectangleArea];

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
      RELEASED.map(({ calculatorId, key, urlKey, default: text }) => [
        calculatorId,
        key,
        urlKey,
        text,
      ]),
    ).toEqual([
      ['rectangle-area', 'length', 'l', '120'],
      ['rectangle-area', 'width', 'w', '120'],
    ]);
    expect(rectangleArea.inputs.map(({ key, urlKey }) => [key, urlKey])).toEqual([
      ['length', 'l'],
      ['width', 'w'],
    ]);
  });
});
