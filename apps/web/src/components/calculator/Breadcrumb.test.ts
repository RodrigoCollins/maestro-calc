import { describe, expect, it } from 'vitest';
import { renderComponent } from '../../__testing__/render-component.ts';
import Breadcrumb from './Breadcrumb.astro';

const breadcrumb = {
  label: 'Breadcrumb',
  homeLabel: 'Home',
  homeHref: '/',
  current: 'Concrete Calculator',
};

describe('Breadcrumb (calculator-page › Page anatomy and content collection, [CP5])', () => {
  // spec: calculator-page › [CP5] a labelled list, not a second nav
  it('is an ordered list with the label, a link home and the current page', async () => {
    const root = await renderComponent(Breadcrumb, { breadcrumb });
    const list = root.querySelector('ol');
    expect(list?.getAttribute('aria-label')).toBe('Breadcrumb');
    expect(root.querySelectorAll('nav')).toHaveLength(0);
    expect(root.querySelectorAll('li').map((item) => item.text.trim())).toEqual([
      'Home',
      'Concrete Calculator',
    ]);
    expect(root.querySelector('li a')?.getAttribute('href')).toBe('/');
    expect(root.querySelectorAll('li')[1]?.getAttribute('aria-current')).toBe('page');
  });

  it('writes the Spanish texts and path it is given', async () => {
    const root = await renderComponent(Breadcrumb, {
      breadcrumb: {
        ...breadcrumb,
        label: 'Ruta de navegación',
        homeLabel: 'Inicio',
        homeHref: '/es',
      },
    });
    expect(root.querySelector('ol')?.getAttribute('aria-label')).toBe('Ruta de navegación');
    expect(root.querySelector('li a')?.text).toBe('Inicio');
    expect(root.querySelector('li a')?.getAttribute('href')).toBe('/es');
  });

  // spec: growth › job pages: a job page shows its trail, home → hub → calculator → job
  it('links each page of a trail between the home and the current page', async () => {
    const root = await renderComponent(Breadcrumb, {
      breadcrumb: {
        ...breadcrumb,
        trail: [
          { href: '/concrete', label: 'Concrete' },
          { href: '/concrete-calculator', label: 'Concrete Calculator' },
        ],
        current: 'Concrete for a 10 × 10 slab',
      },
    });
    const items = root.querySelectorAll('li');
    expect(items.map((item) => item.text.trim())).toEqual([
      'Home',
      'Concrete',
      'Concrete Calculator',
      'Concrete for a 10 × 10 slab',
    ]);
    expect(root.querySelectorAll('li a').map((link) => link.getAttribute('href'))).toEqual([
      '/',
      '/concrete',
      '/concrete-calculator',
    ]);
    expect(items.map((item) => item.getAttribute('aria-current') ?? null)).toEqual([
      null,
      null,
      null,
      'page',
    ]);
  });
});
