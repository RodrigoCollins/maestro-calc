import { describe, expect, it } from 'vitest';
import { ROUTES } from '../routing/routes.ts';
import { calculatorJsonLd, homeJsonLd, serializeJsonLd } from './json-ld.ts';

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

describe('calculator structured data (site-seo › [SE19], [SE20] builder side)', () => {
  const routes = {
    ...ROUTES,
    concrete: { en: '/concrete-calculator', es: '/es/calculadora-de-concreto' },
  } as const;
  const faq = [1, 2, 3, 4].map((n) => ({
    question: `Question ${String(n)}?`,
    answer: `Answer ${String(n)}.`,
  }));
  const entry = { id: 'concrete', name: 'Concrete Calculator' };

  // spec: site-seo › [SE19] the three types, with the values of the spec
  it('describes the English page: the application, its breadcrumb and its FAQ', () => {
    expect(calculatorJsonLd(entry, 'en', faq, routes)).toEqual({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebApplication',
          name: 'Concrete Calculator',
          url: 'https://maestrocalc.com/concrete-calculator',
          inLanguage: 'en-US',
          applicationCategory: 'UtilitiesApplication',
          operatingSystem: 'Any',
          isAccessibleForFree: true,
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://maestrocalc.com/' },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Concrete Calculator',
              item: 'https://maestrocalc.com/concrete-calculator',
            },
          ],
        },
        {
          '@type': 'FAQPage',
          mainEntity: faq.map(({ question, answer }) => ({
            '@type': 'Question',
            name: question,
            acceptedAnswer: { '@type': 'Answer', text: answer },
          })),
        },
      ],
    });
  });

  it('describes the Spanish page with es-US, Inicio and the Spanish URLs', () => {
    const [app, list, questions] = calculatorJsonLd(
      { id: 'concrete', name: 'Calculadora de Concreto' },
      'es',
      faq,
      routes,
    )['@graph'];
    expect(app).toMatchObject({
      name: 'Calculadora de Concreto',
      url: 'https://maestrocalc.com/es/calculadora-de-concreto',
      inLanguage: 'es-US',
    });
    expect(list).toMatchObject({
      itemListElement: [
        { position: 1, name: 'Inicio', item: 'https://maestrocalc.com/es' },
        { position: 2, item: 'https://maestrocalc.com/es/calculadora-de-concreto' },
      ],
    });
    expect(questions).toMatchObject({ mainEntity: [{ name: 'Question 1?' }, {}, {}, {}] });
  });

  // spec: site-seo › [SE19] never an offer, a rating, a review or an image
  it('holds none of the forbidden properties or types', () => {
    const text = JSON.stringify(calculatorJsonLd(entry, 'en', faq, routes));
    for (const forbidden of [
      'offers',
      'aggregateRating',
      'review',
      'ratingValue',
      'image',
      'Product',
      'Person',
    ]) {
      expect(text, forbidden).not.toContain(forbidden);
    }
  });

  it('serializes without a script-closing sequence', () => {
    const text = serializeJsonLd(
      calculatorJsonLd(entry, 'en', [{ question: 'A </script> B?', answer: 'x & y' }], routes),
    );
    expect(text).not.toContain('</script>');
    expect(text).toContain('\\u003c/script\\u003e');
  });
});
