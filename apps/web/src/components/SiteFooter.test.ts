import { describe, expect, it } from 'vitest';
import { renderComponent } from '../__testing__/render-component.ts';
import SiteFooter from './SiteFooter.astro';

const props = {
  homeHref: '/',
  tagline: 'Jobsite calculators that estimate what to buy',
  contactLabel: 'Contact us at',
  email: 'contacto@maestrocalc.com',
  hubsLabel: 'Calculators by trade',
  hubs: [
    { href: '/concrete', label: 'Concrete' },
    { href: '/roofing', label: 'Roofing' },
  ],
  linksLabel: 'Resources',
  links: [
    { href: '/privacy', label: 'Privacy' },
    { href: '/terms', label: 'Terms' },
  ],
  note: 'Every figure is an estimate.',
};

describe('SiteFooter (site-shell › Footer)', () => {
  it('shows the contact address as visible text, with a mailto link of the same address', async () => {
    const footer = await renderComponent(SiteFooter, props);
    expect(footer.querySelectorAll('footer')).toHaveLength(1);
    expect(footer.text).toContain('Contact us at contacto@maestrocalc.com');
    expect(footer.querySelector('a[href^="mailto:"]')?.getAttribute('href')).toBe(
      'mailto:contacto@maestrocalc.com',
    );
  });

  it('lists the hubs, then the site links, each group under its label, with no nav landmark', async () => {
    const footer = await renderComponent(SiteFooter, props);
    expect(
      footer.querySelectorAll('li a').map((a) => [a.getAttribute('href'), a.text.trim()]),
    ).toEqual([
      ['/concrete', 'Concrete'],
      ['/roofing', 'Roofing'],
      ['/privacy', 'Privacy'],
      ['/terms', 'Terms'],
    ]);
    const labels = footer
      .querySelectorAll('ul[aria-labelledby]')
      .map((list) =>
        footer.querySelector(`#${list.getAttribute('aria-labelledby') ?? ''}`)?.text.trim(),
      );
    expect(labels).toEqual(['Calculators by trade', 'Resources']);
    expect(footer.querySelectorAll('nav')).toHaveLength(0);
  });

  it('links the wordmark home and shows the tagline and the estimate note', async () => {
    const footer = await renderComponent(SiteFooter, props);
    expect(footer.querySelector('a.site-footer-home')?.getAttribute('href')).toBe('/');
    expect(footer.text).toContain('Jobsite calculators that estimate what to buy');
    expect(footer.querySelector('.site-footer-note')?.text.trim()).toBe(
      'Every figure is an estimate.',
    );
  });

  it('renders no list without links and still the address', async () => {
    const footer = await renderComponent(SiteFooter, {
      ...props,
      email: 'a@b.test',
      hubs: [],
      links: [],
    });
    expect(footer.querySelectorAll('ul')).toHaveLength(0);
    expect(footer.text).toContain('a@b.test');
  });
});
