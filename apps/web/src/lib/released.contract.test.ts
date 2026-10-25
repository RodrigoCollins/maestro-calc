import type { ReleasedField } from '@maestro-calc/core/testing/released-harness';
import { RELEASED } from '@maestro-calc/core/testing/released-snapshot';
import { describe, expect, it } from 'vitest';
import { completenessProblems } from '../contract/released.ts';
import { calculators } from './calculators.ts';

describe('released url snapshot (url-state-codec › Key stability rules, completeness)', () => {
  // spec: url-state-codec › Key stability rules (rule 8); PR 11 review REL-4 and RES-2 (released
  // snapshot completeness): the registry is the real one, not a copy kept beside the snapshot
  it('holds one tuple per input of every calculator in the registry, and they all hold', () => {
    expect(calculators.length).toBeGreaterThan(0);
    expect(completenessProblems(RELEASED, calculators)).toEqual([]);
  });

  describe('completenessProblems', () => {
    const [rectangleArea] = calculators;
    // the fixtures below reshape one calculator; the tuples of the others are not their business
    const tuples = RELEASED.filter(({ calculatorId }) => calculatorId === 'rectangle-area');
    const length = tuples[0];

    it('fails a calculator that ships without any tuple', () => {
      expect(completenessProblems([], [rectangleArea])).toEqual([
        'rectangle-area: no released tuple, add its inputs to RELEASED',
      ]);
    });

    it('fails an input that has no tuple, one per missing input', () => {
      expect(completenessProblems(length === undefined ? [] : [length], [rectangleArea])).toEqual([
        'rectangle-area.width: input has no released tuple',
      ]);
    });

    // PR 11 review REL-1: a retired tuple belongs to no input, so it must not hide a new one
    it('does not count a retired tuple as the tuple of the input at its position', () => {
      const [lengthInput] = rectangleArea.inputs;
      const breadth = { ...lengthInput, key: 'breadth', urlKey: 'b' };
      const reshaped = {
        id: rectangleArea.id,
        inputs: [lengthInput, breadth],
        retiredUrlKeys: ['w'],
      };
      const retired: ReleasedField[] = tuples.map((tuple) =>
        tuple.key === 'width' ? { ...tuple, retired: true } : tuple,
      );
      expect(completenessProblems(retired, [reshaped])).toEqual([
        'rectangle-area.breadth: input has no released tuple',
      ]);
      // with the new input recorded as a live tuple the same calculator is complete
      const breadthTuple: ReleasedField = {
        calculatorId: 'rectangle-area',
        key: 'breadth',
        urlKey: 'b',
        kind: 'length',
        default: '120',
      };
      const recorded: ReleasedField[] = [...retired, breadthTuple];
      expect(completenessProblems(recorded, [reshaped])).toEqual([]);
    });

    it('fails a released calculator that left the registry, and a tuple that was changed', () => {
      expect(completenessProblems(tuples, [])).toEqual([
        'rectangle-area: released calculator is missing from the registry',
      ]);
      const retuned = tuples.map((tuple) => ({ ...tuple, default: '144' }));
      expect(completenessProblems(retuned, [rectangleArea])).toEqual([
        'rectangle-area.length: default changed from "144" to "120"',
        'rectangle-area.width: default changed from "144" to "120"',
      ]);
    });
  });
});
