import { describe, expect, it } from 'vitest';
import { SITE } from './site.config.ts';

describe('Lawn Figures site constants', () => {
  it('names the site and its planned origin, English only, closed to search engines until launch', () => {
    expect(SITE).toEqual({
      name: 'Lawn Figures',
      origin: 'https://lawnfigures.com',
      locales: ['en'],
      indexable: false,
      gaId: 'G-L7CC69GZMG',
      indexNowKey: '5d1c7e0b9a3f4c28b6e1a7d4f09c3b52',
    });
  });
});
