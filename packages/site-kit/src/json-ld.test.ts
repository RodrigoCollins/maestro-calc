import { describe, expect, it } from 'vitest';
import {
  articleLd,
  breadcrumbListLd,
  graphLd,
  organizationLd,
  serializeJsonLd,
  webApplicationLd,
  webSiteLd,
  withBreadcrumb,
} from './json-ld.ts';

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

  it('gives the day the page was last reviewed only when it carries one', () => {
    const app = {
      name: 'Pool Salt Calculator',
      description: 'Pounds of salt.',
      url: 'https://x.test/salt',
      inLanguage: 'en-US',
      applicationCategory: 'UtilitiesApplication',
    };
    expect(webApplicationLd({ ...app, dateModified: '2026-11-10' })).toMatchObject({
      dateModified: '2026-11-10',
    });
    expect(webApplicationLd(app)).not.toHaveProperty('dateModified');
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

  // opt-in: a site that names its organization's address and editorial policy, and the day the
  // page was last reviewed, gets them; a site that passes only a name (Cuenta Horas) keeps the above
  it('names the organization as author and publisher, with its policy, and the day it changed', () => {
    const team = {
      name: 'Pool Figures',
      url: 'https://x.test/',
      publishingPrinciples: 'https://x.test/editorial-policy',
    };
    expect(
      articleLd({
        headline: 'Opening your pool',
        description: 'Step by step.',
        url: 'https://x.test/open',
        inLanguage: 'en-US',
        publisher: team,
        author: team,
        dateModified: '2026-11-05',
      }),
    ).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Opening your pool',
      description: 'Step by step.',
      url: 'https://x.test/open',
      inLanguage: 'en-US',
      author: { '@type': 'Organization', ...team },
      publisher: { '@type': 'Organization', ...team },
      dateModified: '2026-11-05',
    });
  });
});

describe('withBreadcrumb', () => {
  const article = articleLd({
    headline: 'Opening your pool',
    description: 'Step by step.',
    url: 'https://x.test/open',
    inLanguage: 'en-US',
    publisher: 'Pool Figures',
  });

  it('puts the page and its trail from the home in one graph, the page first', () => {
    const trail = [
      { name: 'Pool Figures', url: 'https://x.test/' },
      { name: 'Opening your pool', url: 'https://x.test/open' },
    ];
    expect(withBreadcrumb(article, trail)).toEqual({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Article',
          headline: 'Opening your pool',
          description: 'Step by step.',
          url: 'https://x.test/open',
          inLanguage: 'en-US',
          publisher: { '@type': 'Organization', name: 'Pool Figures' },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Pool Figures', item: 'https://x.test/' },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Opening your pool',
              item: 'https://x.test/open',
            },
          ],
        },
      ],
    });
  });
});

describe('breadcrumbListLd', () => {
  it('lists the trail from the home to the page, each item at its position', () => {
    expect(
      breadcrumbListLd([
        { name: 'Pool Figures', url: 'https://x.test/' },
        { name: 'Pool salt calculator', url: 'https://x.test/salt' },
      ]),
    ).toEqual({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Pool Figures', item: 'https://x.test/' },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Pool salt calculator',
          item: 'https://x.test/salt',
        },
      ],
    });
  });
});

describe('graphLd', () => {
  it('is the graph of its nodes without their own contexts', () => {
    expect(graphLd({ '@context': 'https://schema.org', '@type': 'Thing' })).toEqual({
      '@context': 'https://schema.org',
      '@graph': [{ '@type': 'Thing' }],
    });
  });

  it('joins nodes into one document with one @context', () => {
    const page = { url: 'https://x.test/', inLanguage: 'en-US' };
    expect(graphLd(webSiteLd({ name: 'X', ...page }), breadcrumbListLd([]))).toEqual({
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'WebSite', name: 'X', ...page },
        { '@type': 'BreadcrumbList', itemListElement: [] },
      ],
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

describe('organizationLd', () => {
  it('gives a name alone, or the name with its home and its policy', () => {
    expect(organizationLd('Lawn Figures')).toEqual({
      '@type': 'Organization',
      name: 'Lawn Figures',
    });
    expect(
      organizationLd({
        name: 'Lawn Figures',
        url: 'https://x.test/',
        publishingPrinciples: 'https://x.test/policy',
      }),
    ).toEqual({
      '@type': 'Organization',
      name: 'Lawn Figures',
      url: 'https://x.test/',
      publishingPrinciples: 'https://x.test/policy',
    });
  });
});
