import { describe, expect, it } from 'vitest';
import { SITE } from './site.config.ts';

describe('Pool Figures site constants', () => {
  it('names the site and its canonical origin, English only, not indexable before launch', () => {
    expect(SITE).toEqual({
      name: 'Pool Figures',
      origin: 'https://poolfigures.com',
      locales: ['en'],
      indexable: false,
    });
  });
});
