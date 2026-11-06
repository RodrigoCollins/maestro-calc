import { describe, expect, it } from 'vitest';
import { GUIDES } from './guide.ts';
import { HOME_TOOLS } from './home.ts';
import { footerLinksOf, LAYOUT_TEXTS, navOf, switchOf } from './layout.ts';
import { hrefOf, routeOf } from './routes.ts';

describe('the footer', () => {
  it('links the same pages in both languages, each a route, in the same order', () => {
    const ids = (lang: 'en' | 'es') => LAYOUT_TEXTS[lang].footer.map(({ id }) => id);
    expect(ids('es')).toEqual(ids('en'));
    for (const { id } of LAYOUT_TEXTS.en.footer) expect(() => hrefOf(id, 'en'), id).not.toThrow();
  });

  it('keeps the English footer as it was', () => {
    expect(footerLinksOf('en')).toEqual([
      { href: '/methodology', label: 'How we work it out' },
      { href: '/opening-your-pool', label: 'Opening your pool' },
      { href: '/closing-your-pool', label: 'Closing your pool' },
      { href: '/pool-water-chemistry-chart', label: 'Water chemistry chart' },
      { href: '/pool-chemical-dosing-chart', label: 'Chemical dosing chart' },
      { href: '/pool-volume-chart', label: 'Pool volume chart' },
      { href: '/charts', label: 'Data and charts' },
      { href: '/how-long-to-run-pool-pump', label: 'How long to run your pump' },
      { href: '/salt-water-pool-vs-chlorine-pool', label: 'Salt water vs chlorine' },
      { href: '/how-to-shock-a-pool', label: 'How to shock a pool' },
      { href: '/how-to-lower-ph-in-a-pool', label: 'How to lower pool pH' },
      { href: '/how-to-raise-calcium-hardness-in-a-pool', label: 'How to raise calcium hardness' },
      {
        href: '/how-long-after-adding-chemicals-can-you-swim',
        label: 'When to swim after chemicals',
      },
      { href: '/privacy', label: 'Privacy' },
      { href: '/about', label: 'About' },
      { href: '/embed-calculators', label: 'Embed our calculators' },
    ]);
  });

  // the link rules of the site check want every guide in the footer of every page
  it('links every guide in both languages, the Spanish twin once it is built', () => {
    for (const lang of ['en', 'es'] as const) {
      const hrefs = footerLinksOf(lang).map(({ href }) => href);
      for (const { path } of GUIDES) {
        const id = routeOf(path)?.id ?? path;
        expect(hrefs, `${lang} ${path}`).toContain(hrefOf(id, lang));
      }
    }
    expect(footerLinksOf('es').map(({ href }) => href)).toContain('/es/privacidad');
  });

  it('warns that every figure is an estimate in each language', () => {
    expect(LAYOUT_TEXTS.en.warning).toBe(
      'Every figure is an estimate. Read the label of your product before you add it.',
    );
    expect(LAYOUT_TEXTS.es.warning).toContain('estimación');
    expect(LAYOUT_TEXTS.es.warning).toContain('etiqueta');
  });
});

describe('the header', () => {
  it('keeps the first four calculators and a link to all of them, in each language', () => {
    expect(navOf('en')).toEqual([
      ...HOME_TOOLS.slice(0, 4).map(({ href, title }) => ({ href, title })),
      { href: '/#pool-tools', title: 'All calculators' },
    ]);
    expect(navOf('es').map(({ title }) => title)).toEqual([
      'Volumen',
      'Sal',
      'Cloro',
      'Tamaño de bomba',
      'Todas las calculadoras',
    ]);
    expect(navOf('es').at(-1)?.href).toBe('/es#pool-tools');
  });

  // the switch leads to the twin only: never to a page that does not exist
  it('switches language only on a page that has its twin', () => {
    expect(switchOf('/about')).toEqual({ href: '/es/acerca', lang: 'es', label: 'Español' });
    expect(switchOf('/es/acerca')).toEqual({ href: '/about', lang: 'en', label: 'English' });
    expect(switchOf('/es')).toEqual({ href: '/', lang: 'en', label: 'English' });
    expect(switchOf('/how-much-salt-for-a-15000-gallon-pool')).toBeUndefined();
    expect(switchOf('/404')).toBeUndefined();
  });
});
