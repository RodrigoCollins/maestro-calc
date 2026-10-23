import { describe, expect, it } from 'vitest';
import { renderComponent } from '../__testing__/render-component.ts';
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

  it('lists no header or footer links while only the home page exists', async () => {
    const { document } = await render('en');
    expect(document.querySelectorAll('header ul, footer ul')).toHaveLength(0);
  });

  // spec: site-shell › [SS13] contact text
  it('shows the configured contact address in the footer', async () => {
    const { document } = await render('es');
    expect(document.querySelector('footer')?.text).toContain('Escríbenos a hello@maestrocalc.com');
  });
});
