import { describe, expectTypeOf, it } from 'vitest';
import { createTranslator, type ParamsOf } from './translate.ts';

const t = createTranslator({
  'calc.rectangle-area.title': 'Rectangle Area',
  'errors.BELOW_MIN': 'The value must be at least {min}.',
  'test.range': 'From {low} to {high}',
} as const);

describe('createTranslator types (i18n-catalog › Message resolution)', () => {
  // spec: Compile-time keys [IN5]
  it('accepts only keys of the catalog', () => {
    expectTypeOf(t)
      .parameter(0)
      .toEqualTypeOf<'calc.rectangle-area.title' | 'errors.BELOW_MIN' | 'test.range'>();
    // @ts-expect-error the key is not in the catalog
    t('calc.rectangle-area.nope');
  });

  // spec: Compile-time keys [IN5]: params are typed from the placeholders
  it('requires exactly the placeholders of the message', () => {
    t('calc.rectangle-area.title');
    t('errors.BELOW_MIN', { min: '5 ft' });
    t('test.range', { low: 1, high: '9' });
    // @ts-expect-error `min` is required
    t('errors.BELOW_MIN');
    // @ts-expect-error `min` is required
    t('errors.BELOW_MIN', {});
    // @ts-expect-error `high` is missing
    t('test.range', { low: 1 });
    // @ts-expect-error a message with no placeholder takes no params
    t('calc.rectangle-area.title', { min: '1' });
  });

  it('derives the params of a message with ParamsOf', () => {
    expectTypeOf<ParamsOf<'From {low} to {high}'>>().toEqualTypeOf<{
      readonly low: string | number;
      readonly high: string | number;
    }>();
    expectTypeOf<ParamsOf<'Max {max}'>>().toEqualTypeOf<{ readonly max: string | number }>();
  });
});
