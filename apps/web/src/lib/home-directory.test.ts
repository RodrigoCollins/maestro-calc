import { describe, expect, it } from 'vitest';
import { ROUTES } from '../routing/routes.ts';
import type { RouteTable } from '../routing/routes.ts';
import { CALCULATOR_PAGES } from '../routing/templates.ts';
import { directoryOrder, exampleOf, homeCards } from './home-directory.ts';

// the key order is b, privacy, a: neither the page list nor the alphabet gives that order
const routes: RouteTable = {
  b: { en: '/b-calculator', es: '/es/calculadora-b' },
  privacy: { en: '/privacy', es: '/es/privacidad' },
  a: { en: '/a-calculator', es: '/es/calculadora-a' },
};
const pages = ['a', 'b'];

describe('directoryOrder (trust-pages › [TP30])', () => {
  // spec: trust-pages › [TP30] the order is the route table's, not the page list's or the alphabet's
  it('lists the calculator ids in route table order and omits the trust ids', () => {
    expect(directoryOrder(routes, pages)).toEqual(['b', 'a']);
    expect(directoryOrder(routes, ['a'])).toEqual(['a']);
    expect(directoryOrder(routes, [])).toEqual([]);
  });

  it('gives the real calculator pages', () => {
    expect(directoryOrder(ROUTES, CALCULATOR_PAGES)).toEqual(['concrete']);
  });
});

describe('exampleOf (trust-pages › [TP30])', () => {
  it('reads calc.<id>.page.example', () => {
    expect(exampleOf({ 'calc.x.page.example': 'Example X' }, 'x', 'en')).toBe('Example X');
  });

  it('throws naming the key and the locale when it is missing', () => {
    expect(() => exampleOf({}, 'x', 'es')).toThrow('calc.x.page.example');
    expect(() => exampleOf({}, 'x', 'es')).toThrow('es');
    expect(() => exampleOf({ 'calc.x.page.example': '' }, 'x', 'en')).not.toThrow();
  });
});

describe('homeCards (trust-pages › [TP30], [TP28])', () => {
  const read = (_locale: string, id: string) => ({
    title: `T ${id}`,
    summary: `S ${id}`,
    example: `E ${id}`,
  });

  // spec: trust-pages › [TP30] cards follow the table order, each href is the route path of its locale
  it.each([
    ['en', ['/b-calculator', '/a-calculator']],
    ['es', ['/es/calculadora-b', '/es/calculadora-a']],
  ] as const)('orders the cards by the table and links the %s paths', (locale, hrefs) => {
    const cards = homeCards(locale, routes, pages, read);
    expect(cards.map((card) => card.id)).toEqual(['b', 'a']);
    expect(cards.map((card) => card.href)).toEqual(hrefs);
    expect(cards[0]).toEqual({
      id: 'b',
      href: hrefs[0],
      title: 'T b',
      summary: 'S b',
      example: 'E b',
    });
  });

  it('throws for a page id that is not a calculator page when it reads the real catalogs', () => {
    expect(() => homeCards('en', routes, pages)).toThrow('b');
  });

  // spec: trust-pages › [TP30] the real tables give exactly the concrete card, with the real copy
  it.each([
    [
      'en',
      {
        id: 'concrete',
        href: '/concrete-calculator',
        title: 'Concrete calculator',
        summary: 'Cubic yards and bags for a slab, footing, column or steps.',
        example: 'Example: a 12 ft by 10 ft slab, 4 in thick.',
      },
    ],
    [
      'es',
      {
        id: 'concrete',
        href: '/es/calculadora-de-concreto',
        title: 'Calculadora de concreto',
        summary: 'Yardas cúbicas y bolsas para una losa, zapata, columna o escalones.',
        example: 'Ejemplo: una losa de 12 ft por 10 ft, de 4 in de espesor.',
      },
    ],
  ] as const)('gives the real %s card', (locale, card) => {
    expect(homeCards(locale)).toEqual([card]);
  });
});
