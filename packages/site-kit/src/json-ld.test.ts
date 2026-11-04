import { describe, expect, it } from 'vitest';
import { articleLd, serializeJsonLd, webApplicationLd, webSiteLd } from './json-ld.ts';

describe('webSiteLd', () => {
  it('describes the home as the web site in its language', () => {
    expect(
      webSiteLd({ name: 'Pool Figures', url: 'https://x.test/', inLanguage: 'en-US' }),
    ).toEqual({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Pool Figures',
      url: 'https://x.test/',
      inLanguage: 'en-US',
    });
  });
});

describe('webApplicationLd', () => {
  it('describes a calculator as a free web application of its category', () => {
    expect(
      webApplicationLd({
        name: 'Pool Salt Calculator',
        description: 'Pounds of salt.',
        url: 'https://x.test/salt',
        inLanguage: 'en-US',
        applicationCategory: 'UtilitiesApplication',
      }),
    ).toEqual({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Pool Salt Calculator',
      description: 'Pounds of salt.',
      url: 'https://x.test/salt',
      inLanguage: 'en-US',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    });
  });
});

describe('articleLd', () => {
  it('describes a guide as an article its site publishes', () => {
    expect(
      articleLd({
        headline: 'Opening your pool',
        description: 'Step by step.',
        url: 'https://x.test/open',
        inLanguage: 'en-US',
        publisher: 'Pool Figures',
      }),
    ).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Opening your pool',
      description: 'Step by step.',
      url: 'https://x.test/open',
      inLanguage: 'en-US',
      publisher: { '@type': 'Organization', name: 'Pool Figures' },
    });
  });
});

describe('serializeJsonLd', () => {
  it('cannot break out of its script element, and parses back to the same value', () => {
    const value = { headline: '</script><!-- a & b -->' };
    const text = serializeJsonLd(value);
    expect(text).not.toMatch(/[<>&]/);
    expect(JSON.parse(text)).toEqual(value);
  });
});
