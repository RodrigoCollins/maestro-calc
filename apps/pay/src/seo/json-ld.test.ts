import { describe, expect, it } from 'vitest';
import { jsonLdOf } from './json-ld.ts';

const page = { title: 'Time Card Calculator | Cuenta Horas', description: 'Add up your hours.' };

describe('jsonLdOf', () => {
  it('describes a calculator as a free web application in its language', () => {
    const route = {
      id: 'time-card',
      kind: 'calculator',
      en: '/time-card-calculator',
      es: '/es/x',
    } as const;
    expect(JSON.parse(jsonLdOf(route, 'es', page, 'https://cuentahoras.com'))).toEqual({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Time Card Calculator',
      description: 'Add up your hours.',
      url: 'https://cuentahoras.com/es/x',
      inLanguage: 'es-US',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Any',
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    });
  });

  it('describes the home as the web site', () => {
    const route = { id: 'home', kind: 'home', en: '/', es: '/es' } as const;
    expect(JSON.parse(jsonLdOf(route, 'en', page, 'https://cuentahoras.com'))).toEqual({
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
    expect(JSON.parse(jsonLdOf(route, 'en', page, 'https://cuentahoras.com'))).toMatchObject({
      '@type': 'Article',
      headline: 'Time Card Calculator',
      url: 'https://cuentahoras.com/methodology',
    });
  });

  it('cannot break out of its script element', () => {
    const route = { id: 'home', kind: 'home', en: '/', es: '/es' } as const;
    const text = jsonLdOf(route, 'en', { title: '</script>', description: '' }, 'https://x.test');
    expect(text).not.toContain('</script>');
  });
});
