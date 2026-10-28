import { describe, expectTypeOf, it } from 'vitest';
import type { CalculatorPageId } from '../routing/templates.ts';
import type { CalculatorFrontmatter, ExampleId, WORKED_EXAMPLES, WorkedExample } from './schema.ts';

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

  // the union is derived from the table: a new row is a new member, with its own example
  it('selects the frontmatter by every id of the table and no other', () => {
    expectTypeOf<CalculatorFrontmatter['id']>().toEqualTypeOf<ExampleId>();
  });

  it('keeps each id with its own worked example', () => {
    expectTypeOf<
      Extract<CalculatorFrontmatter, { id: 'concrete' }>['workedExample']
    >().toEqualTypeOf<WorkedExample<'concrete'>>();
    expectTypeOf<
      Extract<CalculatorFrontmatter, { id: 'rectangle-area' }>['workedExample']
    >().toEqualTypeOf<WorkedExample<'rectangle-area'>>();
  });
});
