import { describe, expectTypeOf, it } from 'vitest';
import { RESERVE_PROPERTIES, reserveCss, type Reserve, type ReserveCss } from './reserve.ts';

describe('the reserve CSS type (calculator-page › [CP65], design K6)', () => {
  // the head `<style>` takes only what the builder wrote, never any string
  it('is returned by reserveCss and refuses a plain string', () => {
    expectTypeOf(reserveCss).returns.toEqualTypeOf<ReserveCss | undefined>();
    // @ts-expect-error a plain string is not reserve CSS
    const plain: ReserveCss = '.calculator{}';
    expectTypeOf(plain).toExtend<string>();
  });

  // a key of `Reserve` without its custom property would be dropped from the CSS silently
  it('gives every key of a reserve its custom property', () => {
    expectTypeOf<(typeof RESERVE_PROPERTIES)[number][0]>().toEqualTypeOf<keyof Reserve>();
  });
});
