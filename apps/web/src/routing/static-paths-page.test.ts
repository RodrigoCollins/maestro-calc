import { describe, expect, it } from 'vitest';
import { renderComponent } from '../__testing__/render-component.ts';
import { staticPaths } from './routes.ts';

interface CatchAll {
  getStaticPaths: () => { params: unknown; props: { id: string } }[];
}

const catchAll = async (): Promise<CatchAll> =>
  (await import('../pages/[...path].astro')) as unknown as CatchAll;

describe('catch-all page (site-routing-i18n › Route table drives the pages)', () => {
  // spec: site-routing-i18n › [SR23] the catch-all builds every path but the two homes
  it('builds the static paths of the route table minus the two home entries', async () => {
    const built = (await catchAll()).getStaticPaths();
    const homes = staticPaths().filter(({ props }) => props.id === 'home');
    expect(homes).toHaveLength(2);
    expect(built).toEqual(staticPaths().filter(({ props }) => props.id !== 'home'));
  });

  // spec: site-routing-i18n › [SR23] the union with `/` and `/es` is the route table, none twice
  it('has the two home route files plus the catch-all cover the route table exactly once', async () => {
    const built = (await catchAll()).getStaticPaths();
    const key = ({ params }: { params: unknown }): string => JSON.stringify(params);
    const covered = [...built, ...staticPaths().filter(({ props }) => props.id === 'home')].map(
      key,
    );
    expect(new Set(covered).size).toBe(covered.length);
    expect([...covered].sort()).toEqual(staticPaths().map(key).sort());
  });
});

describe('home route files (site-routing-i18n › [SR23])', () => {
  // spec: site-routing-i18n › [SR23] index.astro and es.astro render the home of their locale
  it.each([
    [
      'pages/index.astro',
      'en-US',
      'Maestro Calc: jobsite calculators',
      '/',
      () => import('../pages/index.astro'),
    ],
    [
      'pages/es.astro',
      'es-US',
      'Maestro Calc: calculadoras para tu obra',
      '/es',
      () => import('../pages/es.astro'),
    ],
  ] as const)('%s renders the home with lang %s', async (_file, tag, title, path, load) => {
    const page = await load();
    const document = await renderComponent(page.default, {}, { partial: false });
    expect(document.querySelector('html')?.getAttribute('lang')).toBe(tag);
    expect(document.querySelector('title')?.text).toBe(title);
    expect(document.querySelectorAll('main h1')).toHaveLength(1);
    expect(document.querySelector('link[rel=canonical]')?.getAttribute('href')).toBe(
      `https://maestrocalc.com${path}`,
    );
  });
});
