import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SITE } from './site.config.ts';

describe('Bowl Figures site constants', () => {
  it('names the site and its origin, in English (open), German and French (closed for now)', () => {
    expect(SITE).toEqual({
      name: 'Bowl Figures',
      origin: 'https://bowlfigures.com',
      locales: ['en', 'de', 'fr'],
      indexable: true,
      // closed until the owner gives the details of the Impressum (src/de/impressum.ts)
      deIndexable: false,
      // closed until the owner gives the details of the mentions légales (src/fr/mentions-legales.ts)
      frIndexable: false,
      gaId: 'G-3NTFC4MK3R',
      indexNowKey: 'e479169234dd94a0442e50568c49b81b',
    });
  });

  it('serves the IndexNow key as a file named by it', () => {
    const file = resolve(import.meta.dirname, `../public/${SITE.indexNowKey}.txt`);
    expect(readFileSync(file, 'utf8')).toBe(SITE.indexNowKey);
  });
});
