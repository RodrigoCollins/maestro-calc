import { describe, expectTypeOf, it } from 'vitest';
import { FOOTER_PAGES, HEADER_PAGES, linksFor } from './links.ts';

describe('link lists keep the id literals (site-shell › [SS12, SS13])', () => {
  it('returns the candidate ids as a literal union, so catalog keys need no cast', () => {
    const header = linksFor(HEADER_PAGES, 'en');
    expectTypeOf(header[0]?.id).toEqualTypeOf<'methodology' | 'about' | undefined>();
    const footer = linksFor(FOOTER_PAGES, 'en');
    expectTypeOf(footer[0]?.id).toEqualTypeOf<
      'embed-calculators' | 'privacy' | 'terms' | 'contact' | undefined
    >();
  });
});
