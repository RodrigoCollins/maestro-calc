import { describe, expect, it } from 'vitest';
import { dataCards } from '../data/pages.ts';
import { statesIndexOf } from '../states/pages.ts';
import { jsonLdOf } from './json-ld.ts';

const page = { title: 'Time Card Calculator | Cuenta Horas', description: 'Add up your hours.' };
const ORIGIN = 'https://cuentahoras.com';

describe('jsonLdOf', () => {
  it('describes a calculator as a free web application in its language, under its home', () => {
    const route = {
      id: 'time-card',
      kind: 'calculator',
      en: '/time-card-calculator',
      es: '/es/x',
    } as const;
    expect(JSON.parse(jsonLdOf(route, 'es', page, ORIGIN))).toEqual({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebApplication',
          name: 'Time Card Calculator',
          description: 'Add up your hours.',
          url: 'https://cuentahoras.com/es/x',
          inLanguage: 'es-US',
          applicationCategory: 'FinanceApplication',
          operatingSystem: 'Any',
          isAccessibleForFree: true,
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Cuenta Horas',
              item: 'https://cuentahoras.com/es',
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Time Card Calculator',
              item: 'https://cuentahoras.com/es/x',
            },
          ],
        },
      ],
    });
  });

  it('describes the data index as a CollectionPage of every table it lists, under its home', () => {
    const route = { id: 'data', kind: 'collection', en: '/data', es: '/es/datos' } as const;
    const index = { title: 'Pay Data | Cuenta Horas', description: 'Every table.' };
    const [collection, breadcrumb] = (
      JSON.parse(jsonLdOf(route, 'es', index, ORIGIN)) as { '@graph': Record<string, unknown>[] }
    )['@graph'];
    expect(collection).toEqual({
      '@type': 'CollectionPage',
      name: 'Pay Data',
      description: 'Every table.',
      url: 'https://cuentahoras.com/es/datos',
      inLanguage: 'es-US',
      publisher: { '@type': 'Organization', name: 'Cuenta Horas' },
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: dataCards('es').map(({ title, href }, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: title,
          url: `https://cuentahoras.com${href}`,
        })),
      },
    });
    expect(breadcrumb?.['@type']).toBe('BreadcrumbList');
  });

  it('describes the state index as a CollectionPage of every state page, by name', () => {
    const index = statesIndexOf('es');
    const route = { id: 'states', kind: 'collection', ...index.paths } as const;
    const [collection] = (
      JSON.parse(jsonLdOf(route, 'es', index, ORIGIN)) as { '@graph': Record<string, unknown>[] }
    )['@graph'];
    expect(collection?.['mainEntity']).toEqual({
      '@type': 'ItemList',
      itemListElement: index.items.map(({ name, href }, at) => ({
        '@type': 'ListItem',
        position: at + 1,
        name,
        url: `https://cuentahoras.com${href}`,
      })),
    });
  });

  it('refuses a collection it has no list for', () => {
    const route = { id: 'nothing', kind: 'collection', en: '/n', es: '/es/n' } as const;
    expect(() => jsonLdOf(route, 'en', page, ORIGIN)).toThrow(/no list/);
  });

  it('describes the home as the web site, with no breadcrumb', () => {
    const route = { id: 'home', kind: 'home', en: '/', es: '/es' } as const;
    expect(JSON.parse(jsonLdOf(route, 'en', page, ORIGIN))).toEqual({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Cuenta Horas',
      url: 'https://cuentahoras.com/',
      inLanguage: 'en-US',
    });
  });

  it('describes the methodology as an article', () => {
    const route = {
      id: 'methodology',
      kind: 'article',
      en: '/methodology',
      es: '/es/metodologia',
    } as const;
    expect(JSON.parse(jsonLdOf(route, 'en', page, ORIGIN))).toMatchObject({
      '@graph': [
        {
          '@type': 'Article',
          headline: 'Time Card Calculator',
          url: 'https://cuentahoras.com/methodology',
        },
        { '@type': 'BreadcrumbList' },
      ],
    });
  });

  // E-E-A-T: the organization, never a person, writes and publishes every article, and names the
  // English editorial policy as its publishing principles
  it('names the Cuenta Horas organization as author and publisher, with its editorial policy', () => {
    const team = {
      '@type': 'Organization',
      name: 'Cuenta Horas',
      url: 'https://cuentahoras.com/',
      publishingPrinciples: 'https://cuentahoras.com/editorial-policy',
    };
    const route = { id: 'pto-guide', kind: 'article', en: '/guides/x', es: '/es/guias/x' } as const;
    for (const lang of ['en', 'es'] as const) {
      const [article] = (
        JSON.parse(jsonLdOf(route, lang, page, ORIGIN)) as { '@graph': Record<string, unknown>[] }
      )['@graph'];
      expect(article?.['author'], lang).toEqual(team);
      expect(article?.['publisher'], lang).toEqual(team);
    }
  });

  it('gives an article the day it was last reviewed only when the page carries one', () => {
    const route = { id: 'pto-guide', kind: 'article', en: '/guides/x', es: '/es/guias/x' } as const;
    const graphOf = (text: string) => (JSON.parse(text) as { '@graph': object[] })['@graph'][0];
    expect(
      graphOf(jsonLdOf(route, 'en', { ...page, modified: '2026-11-05' }, ORIGIN)),
    ).toMatchObject({ dateModified: '2026-11-05' });
    expect(graphOf(jsonLdOf(route, 'en', page, ORIGIN))).not.toHaveProperty('dateModified');
  });

  it('names a long-tail page under the calculator it answers for, short of its subtitle', () => {
    const route = {
      id: 'pay-15-an-hour',
      kind: 'article',
      en: '/pay/15-an-hour-is-how-much-a-year',
      es: '/es/pago/15-la-hora-cuanto-es-al-ano',
    } as const;
    const text = {
      title: '$15 an hour is how much a year? $31,200 | Cuenta Horas',
      description: 'D',
    };
    const parent = {
      title: 'Hourly to Salary Calculator: Yearly, Monthly, Weekly | Cuenta Horas',
      path: '/hourly-to-salary-calculator',
    };
    expect(JSON.parse(jsonLdOf(route, 'en', text, ORIGIN, parent))).toMatchObject({
      '@graph': [
        { '@type': 'Article' },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Cuenta Horas',
              item: 'https://cuentahoras.com/',
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Hourly to Salary Calculator',
              item: 'https://cuentahoras.com/hourly-to-salary-calculator',
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: '$15 an hour is how much a year? $31,200',
              item: 'https://cuentahoras.com/pay/15-an-hour-is-how-much-a-year',
            },
          ],
        },
      ],
    });
  });

  it('cannot break out of its script element', () => {
    const route = { id: 'home', kind: 'home', en: '/', es: '/es' } as const;
    const text = jsonLdOf(route, 'en', { title: '</script>', description: '' }, 'https://x.test');
    expect(text).not.toContain('</script>');
  });
});
