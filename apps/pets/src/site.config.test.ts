import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SITE } from './site.config.ts';

describe('Bowl Figures site constants', () => {
  it('names the site and its canonical origin, in English, open to search engines', () => {
    expect(SITE).toEqual({
      name: 'Bowl Figures',
      origin: 'https://bowlfigures.com',
      locales: ['en'],
      indexable: true,
      gaId: '',
      indexNowKey: 'e479169234dd94a0442e50568c49b81b',
    });
  });

  it('serves the IndexNow key as a file named by it', () => {
    const file = resolve(import.meta.dirname, `../public/${SITE.indexNowKey}.txt`);
    expect(readFileSync(file, 'utf8')).toBe(SITE.indexNowKey);
  });
});
