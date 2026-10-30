import { describe, expect, it } from 'vitest';
import { renderComponent } from '../__testing__/render-component.ts';
import { SITE } from '../site.config.ts';
import BaseLayout from './BaseLayout.astro';

const head = {
  title: 'Title',
  description: 'Description',
  canonical: 'https://maestrocalc.com/',
  alternates: [],
};

const render = async (locale: 'en' | 'es') => {
  const document = await renderComponent(
    BaseLayout,
    { locale, id: 'home', head },
    { partial: false, slots: { default: '<h1>Body</h1>' } },
  );
  return { html: document.toString(), document };
};

describe('BaseLayout (site-shell › Base layout)', () => {
  it('starts with the HTML5 doctype', async () => {
    expect((await render('en')).html.trimStart().toLowerCase().startsWith('<!doctype html>')).toBe(
      true,
    );
  });

  // spec: site-routing-i18n › [SR4] lang per locale
  it.each([
    ['en', 'en-US'],
    ['es', 'es-US'],
  ] as const)('sets <html lang> for %s to %s', async (locale, tag) => {
    expect((await render(locale)).document.querySelector('html')?.getAttribute('lang')).toBe(tag);
  });

  // spec: site-shell › [SS3] skip link first, one main
  it('puts the localized skip link first and one main#main after it', async () => {
    const english = (await render('en')).document;
    const firstFocusable = english
      .querySelector('body')
      ?.querySelector('a, button, input, select, textarea, [tabindex]');
    expect(firstFocusable?.getAttribute('href')).toBe('#main');
    expect(firstFocusable?.text).toBe('Skip to main content');
    expect(english.querySelectorAll('main')).toHaveLength(1);
    expect(english.querySelector('main')?.getAttribute('id')).toBe('main');
    expect(english.querySelector('main h1')?.text).toBe('Body');
    expect((await render('es')).document.querySelector('a')?.text).toBe(
      'Saltar al contenido principal',
    );
  });

  // review REL-2: a preload must match a real @font-face of the family and weight it claims
  it('preloads Barlow 400 and Barlow Condensed 700, each tied to its @font-face', async () => {
    const { document } = await render('en');
    const faces = document
      .querySelectorAll('style')
      .flatMap((style) => style.text.match(/@font-face\s*\{[^}]*\}/g) ?? [])
      .map((face) => ({
        family: /font-family:\s*"?([^";]+?)(?:-[0-9a-f]{16})?"?;/.exec(face)?.[1],
        weight: /font-weight:\s*(\d+)/.exec(face)?.[1],
        url: /url\("([^"]+)"\)/.exec(face)?.[1],
      }));
    const preloads = document
      .querySelectorAll('link[rel=preload][as=font]')
      .map((link) => link.getAttribute('href'));
    expect(preloads).toHaveLength(2);
    const faceOf = (href: string | undefined) => faces.find((face) => face.url === href);
    expect(faceOf(preloads[0])).toMatchObject({ family: 'Barlow', weight: '400' });
    expect(faceOf(preloads[1])).toMatchObject({ family: 'Barlow Condensed', weight: '700' });
  });

  it('renders the head data through SeoHead', async () => {
    const { document } = await render('en');
    expect(document.querySelector('title')?.text).toBe('Title');
    expect(document.querySelector('link[rel=canonical]')?.getAttribute('href')).toBe(
      'https://maestrocalc.com/',
    );
  });

  // spec: site-shell › [SS1] landmarks
  it('has exactly one header, one labelled nav, one main and one footer', async () => {
    const { document } = await render('en');
    expect(document.querySelectorAll('header')).toHaveLength(1);
    expect(document.querySelectorAll('nav[aria-label]')).toHaveLength(1);
    expect(document.querySelectorAll('nav')).toHaveLength(1);
    expect(document.querySelectorAll('main#main')).toHaveLength(1);
    expect(document.querySelectorAll('footer')).toHaveLength(1);
  });

  // spec: site-shell › [SS12] wiring, site-routing-i18n › [SR5] wiring
  it.each([
    ['en', '/', '/es', 'Español', 'Main navigation'],
    ['es', '/es', '/', 'English', 'Navegación principal'],
  ] as const)(
    'wires the wordmark, switch and nav label for %s',
    async (locale, home, other, label, nav) => {
      const { document } = await render(locale);
      expect(document.querySelector('header a.wordmark')?.getAttribute('href')).toBe(home);
      expect(document.querySelector('header a.lang-switch')?.getAttribute('href')).toBe(other);
      expect(document.querySelector('header a.lang-switch')?.text).toBe(label);
      expect(document.querySelector('nav')?.getAttribute('aria-label')).toBe(nav);
    },
  );

  // spec: site-shell › [SS12] header links
  it.each([
    ['en', ['/methodology', '/about'], ['Methodology', 'About']],
    ['es', ['/es/metodologia', '/es/sobre-nosotros'], ['Metodología', 'Sobre nosotros']],
  ] as const)('lists the header links of the table in %s', async (locale, hrefs, labels) => {
    const { document } = await render(locale);
    const links = document.querySelectorAll('header nav li a');
    expect(links.map((link) => link.getAttribute('href'))).toEqual(hrefs);
    expect(links.map((link) => link.text.trim())).toEqual(labels);
  });

  // spec: site-shell › [SS13] footer links from the real table
  it.each([
    ['en', ['/privacy', '/terms', '/contact'], ['Privacy', 'Terms', 'Contact']],
    [
      'es',
      ['/es/privacidad', '/es/terminos', '/es/contacto'],
      ['Privacidad', 'Términos', 'Contacto'],
    ],
  ] as const)('lists the footer links of the table in %s', async (locale, hrefs, labels) => {
    const { document } = await render(locale);
    const links = document.querySelectorAll('footer li a');
    expect(links.map((link) => link.getAttribute('href'))).toEqual(hrefs);
    expect(links.map((link) => link.text.trim())).toEqual(labels);
    expect(document.querySelector('footer')?.text).toContain('contacto@maestrocalc.com');
  });

  // spec: calculator-page › [CP65], site-shell › [SS32] a page style is one <style> in the head, never in the body
  it('renders the style prop as one <style> in the head and none in the body', async () => {
    const style = '.calculator{--answer-lines:5}';
    const plain = await render('en');
    const styled = await renderComponent(
      BaseLayout,
      { locale: 'en', id: 'home', head, style },
      { partial: false, slots: { default: '<h1>Body</h1>' } },
    );
    const inHead = (document: typeof styled) =>
      document.querySelectorAll('head style').map((element) => element.text);
    expect(inHead(styled)).toHaveLength(inHead(plain.document).length + 1);
    expect(inHead(styled).filter((text) => text === style)).toHaveLength(1);
    expect(styled.querySelectorAll('body style')).toHaveLength(0);
    // the page style is the last style; only the analytics tag follows it
    expect(styled.querySelectorAll('head style').at(-1)?.text).toBe(style);
  });

  // adsense-verify: the site ownership meta tag of AdSense names the publisher id, in the head
  it('names the AdSense publisher in one meta tag of the head', async () => {
    const { document } = await render('en');
    const tags = document.querySelectorAll('meta[name="google-adsense-account"]');
    expect(tags).toHaveLength(1);
    expect(tags[0]?.getAttribute('content')).toBe(SITE.adsenseClient);
    expect(tags[0]?.parentNode?.tagName).toBe('HEAD');
    expect(SITE.adsenseClient).toMatch(/^ca-pub-\d{16}$/);
  });

  // analytics-gtm: one deferred same-origin tag ends the head on every page, with the container id
  // and the production host as data; it has no body (the CSP allows no inline script)
  it('ends the head with the one analytics tag', async () => {
    const { document } = await render('en');
    const tags = document.querySelectorAll('script[src="/analytics.js"]');
    expect(tags).toHaveLength(1);
    expect(tags[0]?.attributes).toEqual({
      src: '/analytics.js',
      'data-gtm': SITE.gtmId,
      'data-host': 'maestrocalc.com',
      defer: '',
    });
    expect(tags[0]?.text).toBe('');
    expect(tags[0]?.parentNode?.tagName).toBe('HEAD');
    expect(document.querySelector('head')?.lastChild).toBe(tags[0]);
    expect(SITE.gtmId).toMatch(/^GTM-[A-Z0-9]+$/);
  });

  // spec: calculator-page › [CP65] without the prop the document is what it was
  it('is byte-equal without the style prop, and one style element longer with it', async () => {
    const { html } = await render('en');
    const explicit = await renderComponent(
      BaseLayout,
      { locale: 'en', id: 'home', head, style: undefined },
      { partial: false, slots: { default: '<h1>Body</h1>' } },
    );
    expect(explicit.toString()).toBe(html);
    const styled = await renderComponent(
      BaseLayout,
      { locale: 'en', id: 'home', head, style: 'a{b:c}' },
      { partial: false, slots: { default: '<h1>Body</h1>' } },
    );
    expect(styled.toString().replace('<style>a{b:c}</style>', '')).toBe(html);
  });

  // spec: site-shell › [SS13] contact text
  it('shows the configured contact address in the footer', async () => {
    const { document } = await render('es');
    expect(document.querySelector('footer')?.text).toContain(
      'Escríbenos a contacto@maestrocalc.com',
    );
  });
});
