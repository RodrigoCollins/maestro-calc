import { describe, expectTypeOf, it } from 'vitest';
import type { CalculatorPageId } from '../routing/templates.ts';
import type { WORKED_EXAMPLES } from './schema.ts';

describe('the worked-example table (calculator-page › [CP6])', () => {
  // a routed page id without a worked-example row is a type error
  it('has a row for every calculator page id', () => {
    expectTypeOf<CalculatorPageId>().toExtend<keyof typeof WORKED_EXAMPLES>();
  });

  it('has no row for an id outside the table', () => {
    // @ts-expect-error 'asphalt' is not a key of the table
    expectTypeOf<'asphalt'>().toExtend<keyof typeof WORKED_EXAMPLES>();
    expectTypeOf<'rectangle-area'>().toExtend<keyof typeof WORKED_EXAMPLES>();
  });
});
