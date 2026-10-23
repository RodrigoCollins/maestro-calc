import { describe, expect, it } from 'vitest';
import { renderComponent } from '../__testing__/render-component.ts';
import SiteFooter from './SiteFooter.astro';

const props = {
  contactLabel: 'Contact us at',
  email: 'contacto@maestrocalc.com',
  links: [
    { href: '/privacy', label: 'Privacy' },
    { href: '/terms', label: 'Terms' },
  ],
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

  it('lists the links it is given and nothing else', async () => {
    const footer = await renderComponent(SiteFooter, props);
    expect(footer.querySelectorAll('li a').map((a) => [a.getAttribute('href'), a.text])).toEqual([
      ['/privacy', 'Privacy'],
      ['/terms', 'Terms'],
    ]);
    expect(footer.querySelectorAll('a').map((a) => a.getAttribute('href'))).toEqual([
      'mailto:contacto@maestrocalc.com',
      '/privacy',
      '/terms',
    ]);
    expect(footer.querySelectorAll('nav')).toHaveLength(0);
  });

  it('renders no list without links and still the address', async () => {
    const footer = await renderComponent(SiteFooter, { ...props, email: 'a@b.test', links: [] });
    expect(footer.querySelectorAll('ul')).toHaveLength(0);
    expect(footer.text).toContain('a@b.test');
  });
});
