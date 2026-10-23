import { describe, expect, it } from 'vitest';
import { homeJsonLd, serializeJsonLd } from './json-ld.ts';

const organization = {
  '@type': 'Organization',
  '@id': 'https://maestrocalc.com/#organization',
  name: 'Maestro Calc',
  url: 'https://maestrocalc.com',
};

describe('structured data (site-seo › Structured data)', () => {
  // spec: site-seo › [SE6, SE7]
  it('describes the organization and the English website', () => {
    expect(homeJsonLd('en')).toEqual({
      '@context': 'https://schema.org',
      '@graph': [
        organization,
        {
          '@type': 'WebSite',
          name: 'Maestro Calc',
          url: 'https://maestrocalc.com/',
          inLanguage: 'en-US',
          publisher: { '@id': 'https://maestrocalc.com/#organization' },
        },
      ],
    });
  });

  it('points the Spanish website at /es with es-US and the same organization', () => {
    const [org, site] = homeJsonLd('es')['@graph'];
    expect(org).toEqual(organization);
    expect(site).toEqual({
      '@type': 'WebSite',
      name: 'Maestro Calc',
      url: 'https://maestrocalc.com/es',
      inLanguage: 'es-US',
      publisher: { '@id': 'https://maestrocalc.com/#organization' },
    });
  });

  it('has no logo or image anywhere', () => {
    expect(JSON.stringify(homeJsonLd('en'))).not.toMatch(/"(logo|image)"/);
  });

  it('serializes without <, > or & and parses back to the same value', () => {
    const value = { a: '</script><b>&', list: ['x > y', 'a & b'] };
    const text = serializeJsonLd(value);
    expect(text).not.toMatch(/[<>&]/);
    expect(text).toContain('\\u003c/script\\u003e');
    expect(text).toContain('\\u0026');
    expect(JSON.parse(text)).toEqual(value);
  });

  it('leaves text without those characters as plain JSON', () => {
    expect(serializeJsonLd({ n: 1, s: 'ok' })).toBe('{"n":1,"s":"ok"}');
  });
});
