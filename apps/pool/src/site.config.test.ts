import { describe, expect, it } from 'vitest';
import { SITE } from './site.config.ts';

describe('Pool Figures site constants', () => {
  it('names the site and its canonical origin, English only, open to search engines', () => {
    expect(SITE).toEqual({
      name: 'Pool Figures',
      origin: 'https://poolfigures.com',
      locales: ['en'],
      indexable: true,
      indexNowKey: 'af8fd289898ace62cd0e8bd5094b3195',
    });
  });
});
