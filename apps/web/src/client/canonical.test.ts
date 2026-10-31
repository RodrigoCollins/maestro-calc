import { describe, expect, it } from 'vitest';
import { linkPathOf } from './canonical.ts';

describe('the path of copied links (embed › Links lead to the real page)', () => {
  it('is the path of the canonical when the page has one', () => {
    expect(
      linkPathOf('https://maestrocalc.com/concrete-calculator', '/embed/concrete-calculator'),
    ).toBe('/concrete-calculator');
    expect(linkPathOf('https://maestrocalc.com/', '/')).toBe('/');
  });

  it('is the page path without a canonical, or with one that is not a URL', () => {
    expect(linkPathOf(null, '/concrete-calculator')).toBe('/concrete-calculator');
    expect(linkPathOf('', '/concrete-calculator')).toBe('/concrete-calculator');
    expect(linkPathOf('::', '/concrete-calculator')).toBe('/concrete-calculator');
  });
});
