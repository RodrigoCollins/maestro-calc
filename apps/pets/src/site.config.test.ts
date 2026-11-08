import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SITE } from './site.config.ts';

describe('Bowl Figures site constants', () => {
  it('names the site and its planned origin, in English, closed to search engines until launch', () => {
    expect(SITE).toEqual({
      name: 'Bowl Figures',
      origin: 'https://bowlfigures.com',
      locales: ['en'],
      indexable: false,
      gaId: '',
      indexNowKey: 'e479169234dd94a0442e50568c49b81b',
    });
  });

  it('serves the IndexNow key as a file named by it', () => {
    const file = resolve(import.meta.dirname, `../public/${SITE.indexNowKey}.txt`);
    expect(readFileSync(file, 'utf8')).toBe(SITE.indexNowKey);
  });
});
