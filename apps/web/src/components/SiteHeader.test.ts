import { describe, expect, it } from 'vitest';
import { renderComponent } from '../__testing__/render-component.ts';
import SiteHeader from './SiteHeader.astro';

const base = {
  homeHref: '/',
  navLabel: 'Main navigation',
  language: { href: '/es', lang: 'es', hreflang: 'es-US', label: 'Español' },
};

describe('SiteHeader (site-shell › Header)', () => {
  it('renders the wordmark, a labelled nav with its links, then the language switch', async () => {
    const header = await renderComponent(SiteHeader, {
      ...base,
      links: [
        { href: '/methodology', label: 'Methodology' },
        { href: '/about', label: 'About' },
      ],
    });
    expect(header.querySelectorAll('header')).toHaveLength(1);
    expect(header.querySelector('a.wordmark')?.getAttribute('href')).toBe('/');
    expect(header.querySelectorAll('nav')).toHaveLength(1);
    expect(header.querySelector('nav')?.getAttribute('aria-label')).toBe('Main navigation');
    expect(
      header.querySelectorAll('nav li a').map((a) => [a.getAttribute('href'), a.text]),
    ).toEqual([
      ['/methodology', 'Methodology'],
      ['/about', 'About'],
    ]);
    expect(header.querySelectorAll('a').map((a) => a.getAttribute('href'))).toEqual([
      '/',
      '/methodology',
      '/about',
      '/es',
    ]);
  });

  it('renders no list when there are no links, and still the nav with the switch', async () => {
    const header = await renderComponent(SiteHeader, { ...base, links: [] });
    expect(header.querySelectorAll('ul')).toHaveLength(0);
    expect(header.querySelectorAll('nav')).toHaveLength(1);
    expect(header.querySelector('nav a.lang-switch')?.getAttribute('href')).toBe('/es');
  });
});
