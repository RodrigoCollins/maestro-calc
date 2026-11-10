import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  alternatesOf,
  LOCALE_TAGS,
  LOCALES,
  localeOfPath,
  NOT_FOUND_ID,
  notFoundPathOf,
  pathOf,
  ROUTES,
  routeProblems,
  staticPaths,
  urlOf,
} from './routes.ts';

const fixture = {
  about: { en: '/about', es: '/es/sobre-nosotros' },
  methodology: { en: '/methodology', es: '/es/metodologia' },
} as const;

describe('locale of a path (site-routing-i18n › [SR11], [SR12])', () => {
  it.each([
    ['/', 'en'],
    ['/about', 'en'],
    ['/essay', 'en'],
    ['/does-not-exist', 'en'],
    ['/es', 'es'],
    ['/es/', 'es'],
    ['/es/metodologia', 'es'],
    ['/es/a/b/c', 'es'],
  ] as const)('%s belongs to %s', (path, locale) => {
    expect(localeOfPath(path)).toBe(locale);
  });
});

describe('route table (site-routing-i18n › Route table)', () => {
  it('lists the locales once, in tag order, and names the not-found page', () => {
    expect(LOCALES).toEqual(['en', 'es']);
    expect(LOCALES).toEqual(Object.keys(LOCALE_TAGS));
    expect(NOT_FOUND_ID).toBe('notFound');
    expect(Object.hasOwn(ROUTES, NOT_FOUND_ID)).toBe(false);
  });

  it('puts each locale not-found page next to its home, outside the table', () => {
    expect(notFoundPathOf('en')).toBe('/404');
    expect(notFoundPathOf('es')).toBe('/es/404');
    expect(
      routeProblems({ [NOT_FOUND_ID]: { en: notFoundPathOf('en'), es: notFoundPathOf('es') } }),
    ).toEqual([]);
  });

  it('tags the locales with their BCP 47 region', () => {
    expect(LOCALE_TAGS).toEqual({ en: 'en-US', es: 'es-US' });
  });

  it('places the home page at / and /es', () => {
    expect(ROUTES.home).toEqual({ en: '/', es: '/es' });
  });

  // spec: site-routing-i18n › Route table (methodology and about enter with their pages)
  it('lists the trust pages with translated Spanish slugs', () => {
    expect(ROUTES.methodology).toEqual({ en: '/methodology', es: '/es/metodologia' });
    expect(ROUTES.about).toEqual({ en: '/about', es: '/es/sobre-nosotros' });
    expect(ROUTES['editorial-policy']).toEqual({
      en: '/editorial-policy',
      es: '/es/politica-editorial',
    });
    expect(ROUTES.privacy).toEqual({ en: '/privacy', es: '/es/privacidad' });
    expect(ROUTES.terms).toEqual({ en: '/terms', es: '/es/terminos' });
    expect(ROUTES.contact).toEqual({ en: '/contact', es: '/es/contacto' });
    expect(ROUTES.glossary).toEqual({
      en: '/construction-glossary',
      es: '/es/glosario-de-construccion',
    });
    expect(ROUTES.guides).toEqual({ en: '/guides', es: '/es/guias' });
    expect(ROUTES.charts).toEqual({ en: '/charts', es: '/es/tablas' });
    expect(ROUTES['embed-calculators']).toEqual({
      en: '/embed-calculators',
      es: '/es/calculadoras-para-tu-sitio',
    });
    expect(ROUTES['guide-concrete-bags-or-truck']).toEqual({
      en: '/guides/concrete-bags-or-truck',
      es: '/es/guias/concreto-en-bolsas-o-camion',
    });
    expect(ROUTES['guide-tape-measure-fractions']).toEqual({
      en: '/guides/read-a-tape-measure-and-add-fractions',
      es: '/es/guias/leer-la-cinta-metrica-y-sumar-fracciones',
    });
    expect(ROUTES['guide-square-footage']).toEqual({
      en: '/guides/how-to-calculate-square-footage',
      es: '/es/guias/como-calcular-pies-cuadrados',
    });
    expect(ROUTES['guide-drywall-estimate']).toEqual({
      en: '/guides/how-to-estimate-a-drywall-job',
      es: '/es/guias/como-calcular-y-cotizar-un-trabajo-de-drywall',
    });
    expect(ROUTES['guide-roof-pitch']).toEqual({
      en: '/guides/how-to-measure-roof-pitch',
      es: '/es/guias/como-medir-la-pendiente-de-un-techo',
    });
    expect(ROUTES['guide-concrete-quote']).toEqual({
      en: '/guides/how-to-quote-a-concrete-job',
      es: '/es/guias/como-cotizar-un-trabajo-de-concreto',
    });
    expect(ROUTES['guide-contractor-license']).toEqual({
      en: '/guides/how-to-get-a-contractor-license',
      es: '/es/guias/como-sacar-la-licencia-de-contratista',
    });
    expect(ROUTES['guide-paint-quote']).toEqual({
      en: '/guides/how-to-quote-a-painting-job',
      es: '/es/guias/como-cotizar-un-trabajo-de-pintura',
    });
    expect(ROUTES['guide-gravel-driveway']).toEqual({
      en: '/guides/how-much-gravel-for-a-driveway',
      es: '/es/guias/cuanta-grava-para-una-entrada-de-autos',
    });
    expect(ROUTES['guide-raised-bed-soil']).toEqual({
      en: '/guides/how-much-soil-for-a-raised-bed',
      es: '/es/guias/cuanta-tierra-para-una-cama-elevada',
    });
    expect(ROUTES['guide-roofing-quote']).toEqual({
      en: '/guides/how-to-quote-a-roofing-job',
      es: '/es/guias/como-cotizar-un-trabajo-de-techo',
    });
    expect(ROUTES['guide-fence-post-concrete']).toEqual({
      en: '/guides/how-much-concrete-for-a-fence-post',
      es: '/es/guias/cuanto-concreto-para-un-poste-de-cerca',
    });
    expect(ROUTES['guide-mulch']).toEqual({
      en: '/guides/how-much-mulch-do-i-need',
      es: '/es/guias/cuanto-mulch-necesito',
    });
    expect(ROUTES['guide-cubic-yards']).toEqual({
      en: '/guides/how-to-calculate-cubic-yards',
      es: '/es/guias/como-calcular-yardas-cubicas',
    });
    expect(ROUTES['guide-concrete-bag-coverage']).toEqual({
      en: '/guides/how-much-does-a-bag-of-concrete-cover',
      es: '/es/guias/cuanto-cubre-una-bolsa-de-concreto',
    });
    expect(ROUTES['guide-paint-coverage']).toEqual({
      en: '/guides/how-much-does-a-gallon-of-paint-cover',
      es: '/es/guias/cuanto-cubre-un-galon-de-pintura',
    });
    expect(ROUTES['guide-gravel-coverage']).toEqual({
      en: '/guides/how-much-does-a-ton-of-gravel-cover',
      es: '/es/guias/cuanto-cubre-una-tonelada-de-grava',
    });
    expect(ROUTES['hub-paint']).toEqual({ en: '/painting', es: '/es/pintura' });
    expect(ROUTES['concrete-slab-10x10']).toEqual({
      en: '/concrete/10x10-slab',
      es: '/es/concreto/losa-de-10x10',
    });
    expect(ROUTES['concrete-slab-12x12']).toEqual({
      en: '/concrete/12x12-slab',
      es: '/es/concreto/losa-de-12x12',
    });
    expect(ROUTES['concrete-slab-10x12']).toEqual({
      en: '/concrete/10x12-slab',
      es: '/es/concreto/losa-de-10x12',
    });
    expect(ROUTES['concrete-slab-20x20']).toEqual({
      en: '/concrete/20x20-slab',
      es: '/es/concreto/losa-de-20x20',
    });
    expect(ROUTES['concrete-slab-24x24']).toEqual({
      en: '/concrete/24x24-slab',
      es: '/es/concreto/losa-de-24x24',
    });
    expect(ROUTES['concrete-slab-500-sq-ft']).toEqual({
      en: '/concrete/500-sq-ft-slab',
      es: '/es/concreto/losa-de-500-pies-cuadrados',
    });
    expect(ROUTES['concrete-slab-650-sq-ft']).toEqual({
      en: '/concrete/650-sq-ft-slab',
      es: '/es/concreto/losa-de-650-pies-cuadrados',
    });
    expect(ROUTES['concrete-slab-1000-sq-ft']).toEqual({
      en: '/concrete/1000-sq-ft-slab',
      es: '/es/concreto/losa-de-1000-pies-cuadrados',
    });
    expect(ROUTES['concrete-slab-chart']).toEqual({
      en: '/concrete/slab-chart',
      es: '/es/concreto/tabla-de-losas',
    });
    expect(ROUTES['cubic-yard-weight-chart']).toEqual({
      en: '/landscaping/cubic-yard-weight-chart',
      es: '/es/jardineria/tabla-de-peso-por-yarda-cubica',
    });
    expect(ROUTES['square-feet-to-square-meters-chart']).toEqual({
      en: '/measurement/square-feet-to-square-meters-chart',
      es: '/es/medidas/tabla-de-pies-cuadrados-a-metros-cuadrados',
    });
    expect(ROUTES['decimal-feet-chart']).toEqual({
      en: '/measurement/decimal-feet-to-feet-and-inches-chart',
      es: '/es/medidas/tabla-de-pies-decimales-a-pies-y-pulgadas',
    });
    expect(ROUTES['roof-pitch-chart']).toEqual({
      en: '/roofing/roof-pitch-chart',
      es: '/es/techos/tabla-de-pendientes-de-techo',
    });
    expect(ROUTES['concrete-pad-4x4']).toEqual({
      en: '/concrete/4x4-pad',
      es: '/es/concreto/base-de-4x4',
    });
    expect(ROUTES['concrete-tube-8']).toEqual({
      en: '/concrete/8-inch-sonotube',
      es: '/es/concreto/sonotubo-de-8-pulgadas',
    });
    expect(ROUTES['concrete-tube-10']).toEqual({
      en: '/concrete/10-inch-sonotube',
      es: '/es/concreto/sonotubo-de-10-pulgadas',
    });
    expect(ROUTES['concrete-tube-12']).toEqual({
      en: '/concrete/12-inch-sonotube',
      es: '/es/concreto/sonotubo-de-12-pulgadas',
    });
    expect(ROUTES['concrete-slab-10x20']).toEqual({
      en: '/concrete/10x20-slab',
      es: '/es/concreto/losa-de-10x20',
    });
    expect(ROUTES['concrete-slab-12x20']).toEqual({
      en: '/concrete/12x20-slab',
      es: '/es/concreto/losa-de-12x20',
    });
    expect(ROUTES['concrete-slab-12x24']).toEqual({
      en: '/concrete/12x24-slab',
      es: '/es/concreto/losa-de-12x24',
    });
    expect(ROUTES['concrete-footing-16x8']).toEqual({
      en: '/concrete/16x8-footing',
      es: '/es/concreto/zapata-de-16x8',
    });
    expect(ROUTES['concrete-footing-20x10']).toEqual({
      en: '/concrete/20x10-footing',
      es: '/es/concreto/zapata-de-20x10',
    });
    expect(ROUTES['roof-pitch-4-12']).toEqual({
      en: '/roofing/4-12-roof-pitch',
      es: '/es/techos/pendiente-de-techo-4-12',
    });
    expect(ROUTES['roof-pitch-6-12']).toEqual({
      en: '/roofing/6-12-roof-pitch',
      es: '/es/techos/pendiente-de-techo-6-12',
    });
    expect(ROUTES['roof-pitch-8-12']).toEqual({
      en: '/roofing/8-12-roof-pitch',
      es: '/es/techos/pendiente-de-techo-8-12',
    });
    expect(ROUTES['roof-pitch-12-12']).toEqual({
      en: '/roofing/12-12-roof-pitch',
      es: '/es/techos/pendiente-de-techo-12-12',
    });
    expect(ROUTES['roof-pitch-3-12']).toEqual({
      en: '/roofing/3-12-roof-pitch',
      es: '/es/techos/pendiente-de-techo-3-12',
    });
    expect(ROUTES['roof-pitch-5-12']).toEqual({
      en: '/roofing/5-12-roof-pitch',
      es: '/es/techos/pendiente-de-techo-5-12',
    });
    expect(ROUTES['roof-pitch-7-12']).toEqual({
      en: '/roofing/7-12-roof-pitch',
      es: '/es/techos/pendiente-de-techo-7-12',
    });
    expect(ROUTES['roof-pitch-7-5-12']).toEqual({
      en: '/roofing/7-5-12-roof-pitch',
      es: '/es/techos/pendiente-de-techo-7-5-12',
    });
    expect(ROUTES['roof-pitch-9-12']).toEqual({
      en: '/roofing/9-12-roof-pitch',
      es: '/es/techos/pendiente-de-techo-9-12',
    });
    expect(ROUTES['roof-pitch-10-12']).toEqual({
      en: '/roofing/10-12-roof-pitch',
      es: '/es/techos/pendiente-de-techo-10-12',
    });
    expect(ROUTES['roof-pitch-2-12']).toEqual({
      en: '/roofing/2-12-roof-pitch',
      es: '/es/techos/pendiente-de-techo-2-12',
    });
    expect(ROUTES['roof-pitch-11-12']).toEqual({
      en: '/roofing/11-12-roof-pitch',
      es: '/es/techos/pendiente-de-techo-11-12',
    });
    expect(ROUTES['square-feet-5x5']).toEqual({
      en: '/measurement/5x5-square-feet',
      es: '/es/medidas/5x5-pies-cuadrados',
    });
    expect(ROUTES['square-feet-5x10']).toEqual({
      en: '/measurement/5x10-square-feet',
      es: '/es/medidas/5x10-pies-cuadrados',
    });
    expect(ROUTES['square-feet-7x12']).toEqual({
      en: '/measurement/7x12-square-feet',
      es: '/es/medidas/7x12-pies-cuadrados',
    });
    expect(ROUTES['square-feet-10x10']).toEqual({
      en: '/measurement/10x10-square-feet',
      es: '/es/medidas/10x10-pies-cuadrados',
    });
    expect(ROUTES['square-feet-10x12']).toEqual({
      en: '/measurement/10x12-square-feet',
      es: '/es/medidas/10x12-pies-cuadrados',
    });
    expect(ROUTES['square-feet-11x14']).toEqual({
      en: '/measurement/11x14-square-feet',
      es: '/es/medidas/11x14-pies-cuadrados',
    });
    expect(ROUTES['square-feet-11x16']).toEqual({
      en: '/measurement/11x16-square-feet',
      es: '/es/medidas/11x16-pies-cuadrados',
    });
    expect(ROUTES['square-feet-12x12']).toEqual({
      en: '/measurement/12x12-square-feet',
      es: '/es/medidas/12x12-pies-cuadrados',
    });
    expect(ROUTES['square-feet-12x14']).toEqual({
      en: '/measurement/12x14-square-feet',
      es: '/es/medidas/12x14-pies-cuadrados',
    });
    expect(ROUTES['square-feet-12x30']).toEqual({
      en: '/measurement/12x30-square-feet',
      es: '/es/medidas/12x30-pies-cuadrados',
    });
    expect(ROUTES['square-feet-20x20']).toEqual({
      en: '/measurement/20x20-square-feet',
      es: '/es/medidas/20x20-pies-cuadrados',
    });
    expect(ROUTES['square-feet-in-an-acre']).toEqual({
      en: '/measurement/square-feet-in-an-acre',
      es: '/es/medidas/pies-cuadrados-en-un-acre',
    });
    expect(ROUTES['square-feet-in-a-half-acre']).toEqual({
      en: '/measurement/square-feet-in-a-half-acre',
      es: '/es/medidas/pies-cuadrados-en-medio-acre',
    });
    expect(ROUTES['square-feet-in-a-quarter-acre']).toEqual({
      en: '/measurement/square-feet-in-a-quarter-acre',
      es: '/es/medidas/pies-cuadrados-en-un-cuarto-de-acre',
    });
    expect(ROUTES['concrete-cubic-yard-weight']).toEqual({
      en: '/concrete/how-much-does-a-cubic-yard-of-concrete-weigh',
      es: '/es/concreto/cuanto-pesa-una-yarda-cubica-de-concreto',
    });
    expect(ROUTES['concrete-slab-cost']).toEqual({
      en: '/concrete/how-much-does-a-concrete-slab-cost',
      es: '/es/concreto/cuanto-cuesta-una-losa-de-concreto',
    });
    expect(ROUTES['square-feet-1-car-garage']).toEqual({
      en: '/measurement/1-car-garage-square-feet',
      es: '/es/medidas/pies-cuadrados-de-un-garaje-de-1-auto',
    });
    expect(ROUTES['square-feet-2-car-garage']).toEqual({
      en: '/measurement/2-car-garage-square-feet',
      es: '/es/medidas/pies-cuadrados-de-un-garaje-de-2-autos',
    });
    expect(ROUTES['cubic-yards-to-tons']).toEqual({
      en: '/landscaping/cubic-yards-to-tons',
      es: '/es/jardineria/yardas-cubicas-a-toneladas',
    });
    expect(ROUTES['cubic-yards-in-a-ton-of-gravel']).toEqual({
      en: '/landscaping/cubic-yards-in-a-ton-of-gravel',
      es: '/es/jardineria/yardas-cubicas-en-una-tonelada-de-grava',
    });
    expect(ROUTES['cubic-feet-in-a-cubic-yard']).toEqual({
      en: '/landscaping/cubic-feet-in-a-cubic-yard',
      es: '/es/jardineria/pies-cubicos-en-una-yarda-cubica',
    });
    expect(ROUTES['cubic-feet-to-gallons']).toEqual({
      en: '/landscaping/cubic-feet-to-gallons',
      es: '/es/jardineria/pies-cubicos-a-galones',
    });
    expect(ROUTES['cubic-yards-in-a-ton-of-dirt']).toEqual({
      en: '/landscaping/cubic-yards-in-a-ton-of-dirt',
      es: '/es/jardineria/yardas-cubicas-en-una-tonelada-de-tierra',
    });
    expect(ROUTES['mulch-bags-per-yard']).toEqual({
      en: '/landscaping/bags-of-mulch-per-yard',
      es: '/es/jardineria/bolsas-de-mulch-por-yarda',
    });
    expect(ROUTES['gravel-driveway-10x20']).toEqual({
      en: '/landscaping/gravel-for-10x20-driveway',
      es: '/es/jardineria/grava-para-entrada-de-10x20',
    });
    expect(ROUTES['gravel-driveway-12x50']).toEqual({
      en: '/landscaping/gravel-for-12x50-driveway',
      es: '/es/jardineria/grava-para-entrada-de-12x50',
    });
    expect(ROUTES['paint-room-10x10']).toEqual({
      en: '/painting/paint-for-10x10-room',
      es: '/es/pintura/pintura-para-cuarto-de-10x10',
    });
    expect(ROUTES['paint-room-10x12']).toEqual({
      en: '/painting/paint-for-10x12-room',
      es: '/es/pintura/pintura-para-cuarto-de-10x12',
    });
    expect(ROUTES['paint-room-12x12']).toEqual({
      en: '/painting/paint-for-12x12-room',
      es: '/es/pintura/pintura-para-cuarto-de-12x12',
    });
    expect(ROUTES['drywall-room-10x10']).toEqual({
      en: '/drywall/drywall-for-10x10-room',
      es: '/es/drywall/drywall-para-cuarto-de-10x10',
    });
    expect(ROUTES['drywall-room-10x12']).toEqual({
      en: '/drywall/drywall-for-10x12-room',
      es: '/es/drywall/drywall-para-cuarto-de-10x12',
    });
    expect(ROUTES['drywall-room-12x12']).toEqual({
      en: '/drywall/drywall-for-12x12-room',
      es: '/es/drywall/drywall-para-cuarto-de-12x12',
    });
    expect(ROUTES['gravel-driveway-12x100']).toEqual({
      en: '/landscaping/gravel-for-12x100-driveway',
      es: '/es/jardineria/grava-para-entrada-de-12x100',
    });
    expect(ROUTES['paint-room-12x14']).toEqual({
      en: '/painting/paint-for-12x14-room',
      es: '/es/pintura/pintura-para-cuarto-de-12x14',
    });
    expect(ROUTES['paint-room-12x16']).toEqual({
      en: '/painting/paint-for-12x16-room',
      es: '/es/pintura/pintura-para-cuarto-de-12x16',
    });
    expect(ROUTES['drywall-room-12x14']).toEqual({
      en: '/drywall/drywall-for-12x14-room',
      es: '/es/drywall/drywall-para-cuarto-de-12x14',
    });
    expect(ROUTES['drywall-room-12x16']).toEqual({
      en: '/drywall/drywall-for-12x16-room',
      es: '/es/drywall/drywall-para-cuarto-de-12x16',
    });
    expect(ROUTES['topsoil-raised-bed-4x4']).toEqual({
      en: '/landscaping/soil-for-4x4-raised-bed',
      es: '/es/jardineria/tierra-para-cama-elevada-de-4x4',
    });
    expect(ROUTES['topsoil-raised-bed-4x8']).toEqual({
      en: '/landscaping/soil-for-4x8-raised-bed',
      es: '/es/jardineria/tierra-para-cama-elevada-de-4x8',
    });
    expect(ROUTES['topsoil-10x10']).toEqual({
      en: '/landscaping/topsoil-for-10x10-area',
      es: '/es/jardineria/tierra-para-area-de-10x10',
    });
    expect(ROUTES['topsoil-20x20']).toEqual({
      en: '/landscaping/topsoil-for-20x20-area',
      es: '/es/jardineria/tierra-para-area-de-20x20',
    });
    expect(ROUTES['roofing-12x16']).toEqual({
      en: '/roofing/shingles-for-12x16-roof',
      es: '/es/techos/tejas-para-techo-de-12x16',
    });
    expect(ROUTES['roofing-24x24']).toEqual({
      en: '/roofing/shingles-for-24x24-roof',
      es: '/es/techos/tejas-para-techo-de-24x24',
    });
    expect(ROUTES['roofing-30x40']).toEqual({
      en: '/roofing/shingles-for-30x40-roof',
      es: '/es/techos/tejas-para-techo-de-30x40',
    });
    expect(ROUTES['roofing-30x50']).toEqual({
      en: '/roofing/shingles-for-30x50-roof',
      es: '/es/techos/tejas-para-techo-de-30x50',
    });
    expect(ROUTES['divide-29-1-4-in-by-2']).toEqual({
      en: '/measurement/29-1-4-inches-divided-by-2',
      es: '/es/medidas/29-1-4-pulgadas-entre-2',
    });
    expect(ROUTES['divide-23-5-8-in-by-2']).toEqual({
      en: '/measurement/23-5-8-inches-divided-by-2',
      es: '/es/medidas/23-5-8-pulgadas-entre-2',
    });
    expect(ROUTES['divide-35-5-in-by-2']).toEqual({
      en: '/measurement/35-5-inches-divided-by-2',
      es: '/es/medidas/35-5-pulgadas-entre-2',
    });
    expect(ROUTES['divide-22-in-by-10']).toEqual({
      en: '/measurement/22-inches-divided-by-10',
      es: '/es/medidas/22-pulgadas-entre-10',
    });
    expect(ROUTES['divide-9-ft-6-in-by-2']).toEqual({
      en: '/measurement/9-feet-6-inches-divided-by-2',
      es: '/es/medidas/9-pies-6-pulgadas-entre-2',
    });
    expect(ROUTES['divide-3-ft-9-in-by-2']).toEqual({
      en: '/measurement/3-feet-9-inches-divided-by-2',
      es: '/es/medidas/3-pies-9-pulgadas-entre-2',
    });
    expect(ROUTES['hub-concrete']).toEqual({ en: '/concrete', es: '/es/concreto' });
    expect(ROUTES['hub-roofing']).toEqual({ en: '/roofing', es: '/es/techos' });
    expect(ROUTES['hub-drywall']).toEqual({ en: '/drywall', es: '/es/drywall' });
    expect(ROUTES['hub-landscaping']).toEqual({ en: '/landscaping', es: '/es/jardineria' });
    expect(ROUTES['hub-measurement']).toEqual({ en: '/measurement', es: '/es/medidas' });
    expect(ROUTES.concrete).toEqual({
      en: '/concrete-calculator',
      es: '/es/calculadora-de-concreto',
    });
  });

  // spec: site-routing-i18n › [SR24] the square footage row comes right after concrete (its title and
  // description keys are required by routes.test-d.ts, its URL keys by the released contract)
  it('lists square footage after concrete', () => {
    expect(ROUTES['rectangle-area']).toEqual({
      en: '/square-footage-calculator',
      es: '/es/calculadora-de-pies-cuadrados',
    });
    const ids = Object.keys(ROUTES);
    expect(ids.indexOf('rectangle-area')).toBe(ids.indexOf('concrete') + 1);
  });

  // spec: site-routing-i18n › the gravel row, published 2026-10-29: its two URLs are a public contract
  it('lists gravel after square footage, at its published URLs', () => {
    expect(ROUTES.gravel).toEqual({ en: '/gravel-calculator', es: '/es/calculadora-de-grava' });
    const ids = Object.keys(ROUTES);
    expect(ids.indexOf('gravel')).toBe(ids.indexOf('rectangle-area') + 1);
  });

  // spec: site-routing-i18n › the mulch row, published 2026-10-29: its two URLs are a public contract
  it('lists mulch after gravel, at its published URLs', () => {
    expect(ROUTES.mulch).toEqual({ en: '/mulch-calculator', es: '/es/calculadora-de-mulch' });
    const ids = Object.keys(ROUTES);
    expect(ids.indexOf('mulch')).toBe(ids.indexOf('gravel') + 1);
  });

  // spec: site-routing-i18n › the topsoil row, published 2026-10-29: its two URLs are a public contract
  it('lists topsoil after mulch, at its published URLs', () => {
    expect(ROUTES.topsoil).toEqual({
      en: '/topsoil-calculator',
      es: '/es/calculadora-de-tierra-para-jardin',
    });
    const ids = Object.keys(ROUTES);
    expect(ids.indexOf('topsoil')).toBe(ids.indexOf('mulch') + 1);
  });

  // spec: site-routing-i18n › the paint row, published 2026-10-30: its two URLs are a public contract
  it('lists paint after topsoil, at its published URLs', () => {
    expect(ROUTES.paint).toEqual({ en: '/paint-calculator', es: '/es/calculadora-de-pintura' });
    const ids = Object.keys(ROUTES);
    expect(ids.indexOf('paint')).toBe(ids.indexOf('topsoil') + 1);
  });

  // spec: site-routing-i18n › the drywall row, published 2026-10-30: its two URLs are a public contract
  it('lists drywall after paint, at its published URLs', () => {
    expect(ROUTES.drywall).toEqual({ en: '/drywall-calculator', es: '/es/calculadora-de-drywall' });
    const ids = Object.keys(ROUTES);
    expect(ids.indexOf('drywall')).toBe(ids.indexOf('paint') + 1);
  });

  // spec: site-routing-i18n › the feet and inches row, published 2026-10-30: its two URLs are a public contract
  it('lists feet and inches after roofing, at its published URLs', () => {
    expect(ROUTES['feet-inches']).toEqual({
      en: '/feet-and-inches-calculator',
      es: '/es/calculadora-de-pies-y-pulgadas',
    });
    const ids = Object.keys(ROUTES);
    expect(ids.indexOf('feet-inches')).toBe(ids.indexOf('roofing') + 1);
  });

  // spec: site-routing-i18n › the roofing row, published 2026-10-30: its two URLs are a public contract
  it('lists roofing after roof pitch, at its published URLs', () => {
    expect(ROUTES.roofing).toEqual({
      en: '/roofing-calculator',
      es: '/es/calculadora-de-tejas',
    });
    const ids = Object.keys(ROUTES);
    expect(ids.indexOf('roofing')).toBe(ids.indexOf('roof-pitch') + 1);
  });

  // spec: site-routing-i18n › the roof pitch row, published 2026-10-30: its two URLs are a public contract
  it('lists roof pitch after drywall, at its published URLs', () => {
    expect(ROUTES['roof-pitch']).toEqual({
      en: '/roof-pitch-calculator',
      es: '/es/calculadora-de-pendiente-de-techo',
    });
    const ids = Object.keys(ROUTES);
    expect(ids.indexOf('roof-pitch')).toBe(ids.indexOf('drywall') + 1);
  });

  // spec: site-routing-i18n › Table invariants hold
  it('accepts the real table and the fixture', () => {
    expect(routeProblems(ROUTES)).toEqual([]);
    expect(routeProblems(fixture)).toEqual([]);
  });

  it.each([
    [
      'duplicate path',
      { a: { en: '/x', es: '/es/x' }, b: { en: '/x', es: '/es/y' } },
      ['b.en: duplicate path /x'],
    ],
    ['uppercase', { a: { en: '/About', es: '/es/a' } }, ['a.en: invalid path /About']],
    ['trailing slash', { a: { en: '/x/', es: '/es/x' } }, ['a.en: invalid path /x/']],
    [
      'non-ASCII',
      { a: { en: '/a', es: '/es/metodología' } },
      ['a.es: invalid path /es/metodología'],
    ],
    ['English under /es', { a: { en: '/es/a', es: '/es/b' } }, ['a.en: English path under /es']],
    ['Spanish outside /es', { a: { en: '/a', es: '/b' } }, ['a.es: Spanish path outside /es']],
  ] as const)('rejects a %s', (_name, table, problems) => {
    expect(routeProblems(table)).toEqual(problems);
  });

  it('treats /essay as English and /es as Spanish', () => {
    expect(routeProblems({ a: { en: '/essay', es: '/es' } })).toEqual([]);
    expect(routeProblems({ a: { en: '/a', es: '/esx' } })).toEqual([
      'a.es: Spanish path outside /es',
    ]);
  });
});

describe('route helpers (site-routing-i18n › Paths, URLs and alternates)', () => {
  it('resolves the path of a page per locale', () => {
    expect(pathOf('home', 'es')).toBe('/es');
    expect(pathOf('home', 'en')).toBe('/');
    expect(pathOf('methodology', 'es', fixture)).toBe('/es/metodologia');
    expect(() => pathOf('nope', 'en', fixture)).toThrow('unknown page id: nope');
  });

  it('builds absolute URLs on the site origin', () => {
    expect(urlOf('/')).toBe('https://maestrocalc.com/');
    expect(urlOf('/es')).toBe('https://maestrocalc.com/es');
    expect(urlOf('/es/metodologia')).toBe('https://maestrocalc.com/es/metodologia');
  });

  // spec: site-routing-i18n › [SR8, SR9] unit side
  it('lists the two locales and x-default (English) as alternates', () => {
    expect(alternatesOf('home')).toEqual([
      { hreflang: 'en-US', href: 'https://maestrocalc.com/' },
      { hreflang: 'es-US', href: 'https://maestrocalc.com/es' },
      { hreflang: 'x-default', href: 'https://maestrocalc.com/' },
    ]);
    expect(alternatesOf('about', fixture)).toEqual([
      { hreflang: 'en-US', href: 'https://maestrocalc.com/about' },
      { hreflang: 'es-US', href: 'https://maestrocalc.com/es/sobre-nosotros' },
      { hreflang: 'x-default', href: 'https://maestrocalc.com/about' },
    ]);
  });

  it('maps a table to static paths, the root with an undefined segment', () => {
    expect(staticPaths({ home: { en: '/', es: '/es' }, ...fixture })).toEqual([
      { params: { path: undefined }, props: { id: 'home', locale: 'en' } },
      { params: { path: 'es' }, props: { id: 'home', locale: 'es' } },
      { params: { path: 'about' }, props: { id: 'about', locale: 'en' } },
      { params: { path: 'es/sobre-nosotros' }, props: { id: 'about', locale: 'es' } },
      { params: { path: 'methodology' }, props: { id: 'methodology', locale: 'en' } },
      { params: { path: 'es/metodologia' }, props: { id: 'methodology', locale: 'es' } },
    ]);
  });

  // spec: site-routing-i18n › [SR23] derived: one static path per id and locale of the real table, in
  // table order, each the path of its row without the leading slash (the URLs are pinned above)
  it('maps every row of the route table to its two static paths', () => {
    expect(staticPaths()).toEqual(
      Object.entries(ROUTES).flatMap(([id, paths]) =>
        LOCALES.map((locale) => ({
          params: { path: id === 'home' && locale === 'en' ? undefined : paths[locale].slice(1) },
          props: { id, locale },
        })),
      ),
    );
    expect(staticPaths()).toHaveLength(2 * Object.keys(ROUTES).length);
  });

  it('imports the i18n package for types only, so Node can strip the file', () => {
    const source = readFileSync(new URL('./routes.ts', import.meta.url), 'utf8');
    const imports = source.split('\n').filter((line) => /^import\b/.test(line));
    expect(imports.length).toBeGreaterThan(0);
    for (const line of imports.filter((entry) => entry.includes('@maestro-calc/i18n'))) {
      expect(line).toMatch(/^import type /);
    }
  });
});
