import { describe, expect, it } from 'vitest';
import { renderComponent } from '../__testing__/render-component.ts';
import EnglishPage from '../pages/404.astro';
import SpanishPage from '../pages/es/404.astro';
import NotFoundView from './NotFoundView.astro';

const render = (locale: 'en' | 'es') =>
  renderComponent(NotFoundView, { locale }, { partial: false });

describe('NotFoundView (site-routing-i18n › Not found)', () => {
  it.each([
    ['en', 'en-US', 'Page not found | Maestro Calc'],
    ['es', 'es-US', 'Página no encontrada | Maestro Calc'],
  ] as const)('renders the %s page as a whole document', async (locale, tag, title) => {
    const document = await render(locale);
    expect(document.querySelector('html')?.getAttribute('lang')).toBe(tag);
    // spec: site-seo › [SE2] for notFound
    expect(document.querySelector('title')?.text).toBe(title);
  });

  // spec: site-routing-i18n › [SR14]
  it.each(['en', 'es'] as const)('keeps the %s page out of the index', async (locale) => {
    const document = await render(locale);
    expect(document.querySelector('meta[name=robots]')?.getAttribute('content')).toBe('noindex');
    expect(document.querySelectorAll('link[rel=canonical]')).toHaveLength(0);
    expect(document.querySelectorAll('link[hreflang]')).toHaveLength(0);
  });

  it.each([
    ['en', 'Page not found', 'Go to the home page', '/'],
    ['es', 'Página no encontrada', 'Ir a la página de inicio', '/es'],
  ] as const)('shows one %s heading and a way home', async (locale, heading, label, home) => {
    const document = await render(locale);
    expect(document.querySelectorAll('h1')).toHaveLength(1);
    expect(document.querySelector('main h1')?.text).toBe(heading);
    const link = document.querySelector('main a.home-link');
    expect(link?.text.trim()).toBe(label);
    expect(link?.getAttribute('href')).toBe(home);
  });

  it.each([
    ['en', 'The page you are looking for does not exist or has moved.'],
    ['es', 'La página que buscas no existe o cambió de lugar.'],
  ] as const)('explains the %s error in one paragraph', async (locale, body) => {
    expect((await render(locale)).querySelector('main p')?.text).toBe(body);
  });

  // spec: site-routing-i18n › [SR6]
  it.each([
    ['en', '/es'],
    ['es', '/'],
  ] as const)('switches the %s page to the other home page', async (locale, href) => {
    expect((await render(locale)).querySelector('a.lang-switch')?.getAttribute('href')).toBe(href);
  });
});

describe('404 pages (site-routing-i18n › Not found files)', () => {
  it.each([
    [EnglishPage, 'en-US', 'Page not found'],
    [SpanishPage, 'es-US', 'Página no encontrada'],
  ] as const)('renders the not-found view of its own language', async (page, tag, heading) => {
    const document = await renderComponent(page, {}, { partial: false });
    expect(document.querySelector('html')?.getAttribute('lang')).toBe(tag);
    expect(document.querySelector('main h1')?.text).toBe(heading);
  });
});
