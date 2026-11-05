import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { renderComponent } from '../__testing__/render-component.ts';
import { fromRoot } from '../contract/root.ts';
import { staticPaths } from './routes.ts';
import { isCalculatorPage } from './templates.ts';

interface RouteFile {
  getStaticPaths: () => { params: Record<string, string | undefined>; props: { id: string } }[];
}

const catchAll = async (): Promise<RouteFile> =>
  (await import('../pages/[...path].astro')) as unknown as RouteFile;

/** The calculator route files: one per locale, so no other template's scoped CSS reaches them. */
const CALCULATOR_FILES = [
  ['pages/[calculator].astro', 'en', '', () => import('../pages/[calculator].astro')],
  ['pages/es/[calculator].astro', 'es', '/es', () => import('../pages/es/[calculator].astro')],
] as const;

const calculatorFile = async (load: () => Promise<unknown>): Promise<RouteFile> =>
  (await load()) as RouteFile;

/** The URL path a route file builds from its folder and its params. */
const pathOfBuilt = (folder: string, params: Record<string, string | undefined>): string =>
  `${folder}/${Object.values(params).filter(Boolean).join('/')}`.replace(/\/$/, '') || '/';

const key = (path: { params: { path: string | undefined } }): string =>
  `/${path.params.path ?? ''}`;

describe('catch-all page (site-routing-i18n › Route table drives the pages)', () => {
  // spec: site-routing-i18n › [SR23] the catch-all builds every path but the homes and the calculators
  it('builds the static paths of the route table minus the homes and the calculator pages', async () => {
    const built = (await catchAll()).getStaticPaths();
    const homes = staticPaths().filter(({ props }) => props.id === 'home');
    expect(homes).toHaveLength(2);
    expect(built).toEqual(
      staticPaths().filter(({ props }) => props.id !== 'home' && !isCalculatorPage(props.id)),
    );
  });

  // spec: site-routing-i18n › [SR23] the union of the route files is the route table, none twice
  it('has the home files, the calculator files and the catch-all cover the route table exactly once', async () => {
    const catchAllPaths = (await catchAll())
      .getStaticPaths()
      .map(({ params }) => pathOfBuilt('', params));
    const calculatorPaths = (
      await Promise.all(
        CALCULATOR_FILES.map(async ([, , folder, load]) =>
          (await calculatorFile(load))
            .getStaticPaths()
            .map(({ params }) => pathOfBuilt(folder, params)),
        ),
      )
    ).flat();
    const covered = [...catchAllPaths, ...calculatorPaths, '/', '/es'];
    expect(new Set(covered).size).toBe(covered.length);
    expect([...covered].sort()).toEqual(staticPaths().map(key).sort());
  });
});

describe('calculator route files (site-routing-i18n › [SR23])', () => {
  // spec: site-routing-i18n › [SR23] each calculator file builds the calculator pages of its locale
  it.each(CALCULATOR_FILES)(
    '%s builds the calculator pages of %s',
    async (_file, locale, _folder, load) => {
      const built = (await calculatorFile(load)).getStaticPaths();
      expect(built.map(({ props }) => props)).toEqual(
        staticPaths()
          .filter(({ props }) => props.locale === locale && isCalculatorPage(props.id))
          .map(({ props }) => props),
      );
    },
  );

  // The split is what keeps the scoped CSS of the trust, job, glossary and guide templates off the
  // calculator pages: Astro bundles the styles of every component a route file imports.
  it.each(CALCULATOR_FILES)('%s imports no Astro component but the calculator view', (file) => {
    const source = readFileSync(fromRoot(`apps/web/src/${file}`), 'utf8');
    const components = [...source.matchAll(/from '([^']+\.astro)'/g)].map((match) => match[1]);
    expect(components.map((path) => path?.split('/').at(-1))).toEqual(['CalculatorView.astro']);
  });

  it.each(CALCULATOR_FILES)(
    '%s renders the calculator template',
    async (_file, locale, _folder, load) => {
      const page = await load();
      const document = await renderComponent(
        page.default,
        { id: 'concrete', locale },
        { partial: false },
      );
      expect(document.querySelector('.calculator')).not.toBeNull();
      expect(document.querySelectorAll('main h1')).toHaveLength(1);
    },
  );
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
