import { describe, expect, it } from 'vitest';
import { SITE } from './site.config.ts';

describe('Cuánto Le Cobro site constants', () => {
  // the owner flips `indexable` and fills `gaId` at launch; until then the site is closed and silent
  it('names the site and its canonical origin, Spanish first, open to search engines, no analytics yet', () => {
    expect(SITE).toEqual({
      name: 'Cuánto Le Cobro',
      origin: 'https://cuantolecobro.com',
      locales: ['es', 'en'],
      indexable: true,
      gaId: '',
      indexNowKey: 'c2f2efa5e91639c7b2ff3d985576590b',
    });
  });
});
