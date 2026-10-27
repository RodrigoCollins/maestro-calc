import { existsSync, globSync, readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';
import { fromRoot } from './root.ts';

const agents = readFileSync(fromRoot('AGENTS.md'), 'utf8');
const configText = readFileSync(fromRoot('openspec/config.yaml'), 'utf8');
const config = parse(configText) as {
  testing: {
    layers: { e2e: { available: boolean; tool: string | null } };
    lighthouse: { available: boolean; command: string };
  };
};

describe('docs reflect the site scripts (monorepo-workspace › [MWW5])', () => {
  it.each(['check:site', 'test:e2e', 'lighthouse'])(
    'mentions %s in AGENTS.md and openspec/config.yaml',
    (script) => {
      expect(agents).toContain(script);
      expect(configText).toContain(script);
    },
  );

  it('lists the browser tests as available in the testing layers', () => {
    expect(config.testing.layers.e2e).toMatchObject({ available: true, tool: 'playwright' });
  });

  it('documents the byte budgets and the Lighthouse audit (site-quality › [SQ6], [SQ9])', () => {
    expect(config.testing.lighthouse).toMatchObject({
      available: true,
      command: 'npm run lighthouse',
    });
    for (const text of [agents, configText]) {
      expect(text).toContain('40,960');
      expect(text).toContain('163,840');
    }
    expect(agents).toContain('npm run lighthouse');
  });

  it('lists the root scripts as bullets, one per script, and names the one pinned count', () => {
    const bullets = agents.split('\n').filter((line) => line.startsWith('- `npm'));
    for (const script of ['dev', 'build', 'check:site', 'test:e2e', 'lighthouse', 'verify']) {
      expect(bullets.filter((line) => line.startsWith(`- \`npm run ${script}\``))).toHaveLength(1);
    }
    expect(agents).toContain('end-state.contract.test.ts');
    expect(agents).toMatch(/only pinned count/);
  });

  it('tells a newcomer how to install the browser tooling and why it is outside the workspaces', () => {
    expect(agents).toContain('npm ci --prefix tooling/site-browser');
    expect(agents).toContain('playwright install');
    expect(agents).toContain('tooling/site-browser');
  });
});

/** The text of the "Adding a calculator" section of AGENTS.md: from its heading to the next one. */
const recipeOf = (text: string): string => {
  const start = text.indexOf('## Adding a calculator');
  const rest = text.slice(start);
  const next = rest.indexOf('\n## ', 4);
  return rest.slice(0, next === -1 ? undefined : next);
};

/** The numbered steps of the recipe: each from its number to the next one. */
const stepsOf = (recipe: string): string[] =>
  recipe.split('\n').filter((line) => /^\d+\. /.test(line));

/** The repository paths a text names in backticks, with `<id>` and `{en,es}` filled in for concrete. */
const pathsIn = (text: string): string[] =>
  Array.from(text.matchAll(/`([\w@./{},<>*-]+)`/g), ([, token = '']) => token)
    .filter((token) => /^(?:apps|packages|tooling|openspec|\.github)\//.test(token))
    .flatMap((token) => {
      const filled = token
        .replaceAll('<id>', 'concrete')
        .replaceAll('<Id>', 'Concrete')
        .replaceAll('<material>', 'concrete-mix');
      return filled.includes('{en,es}')
        ? [filled.replace('{en,es}', 'en'), filled.replace('{en,es}', 'es')]
        : [filled];
    });

const exists = (path: string): boolean =>
  path.includes('*')
    ? globSync(path, { cwd: fromRoot('.') }).length > 0
    : existsSync(fromRoot(path));

describe('the "Adding a calculator" recipe (monorepo-workspace › AGENTS.md)', () => {
  const recipe = recipeOf(agents);
  const steps = stepsOf(recipe);

  // concrete is the example of a calculator that needs injected data: the factory pattern
  it('numbers its steps from 1 without a gap and covers the factory calculator', () => {
    expect(steps.map((step) => Number(/^(\d+)\./.exec(step)?.[1]))).toEqual(
      steps.map((_, index) => index + 1),
    );
    expect(steps.length).toBeGreaterThanOrEqual(10);
  });

  it.each([
    ['the core directory', 'packages/core/src/calculators/<id>/'],
    ['the released tuples', 'RELEASED'],
    ['the registry row', 'REGISTRY'],
    ['the catalogs', 'packages/i18n/src/catalogs/{en,es}/<id>.ts'],
    ['the web list', 'apps/web/src/lib/calculators.ts'],
    ['the English key union', 'apps/web/src/lib/i18n-contract.test-d.ts'],
    ['the page templates', 'apps/web/src/routing/templates.ts'],
    ['the factory for injected data', 'create<Id>'],
    ['the yields-only data subpath', 'packages/data/package.json'],
    ['the composition root', 'apps/web/src/lib/<id>.ts'],
    ['the test-support subpath', 'packages/core/package.json'],
    ['the explicit subpath list', 'apps/web/src/contract/manifest.contract.test.ts'],
    ['the content entries', 'apps/web/src/content/calculators/{en,es}/<id>.md'],
    ['the client entry', 'apps/web/src/client/entries/<id>.ts'],
    ['the script island', 'apps/web/src/islands/<Id>Script.astro'],
    ['the methodology section', 'apps/web/src/content/pages/{en,es}/methodology.md'],
    ['the route', 'apps/web/src/routing/routes.ts'],
    ['the route metadata', 'packages/i18n/src/catalogs/{en,es}/site.ts'],
    ['the script row', 'apps/web/src/views/CalculatorView.astro'],
    ['the home link', 'apps/web/src/views/HomeView.astro'],
    ['the pinned counts', 'apps/web/src/contract/end-state.contract.test.ts'],
    ['the Lighthouse representative', 'tooling/site-browser/e2e/representative.ts'],
    ['the page builder', 'apps/web/src/lib/page-view.ts'],
    ['the per-id page table', 'apps/web/src/lib/pages.ts'],
    ['the page module', 'apps/web/src/calculator/<id>/page.ts'],
    ['the slots', 'apps/web/src/calculator/slots/'],
    ['the page module test', 'apps/web/src/calculator/<id>/controller.test.ts'],
    ['the controller', 'apps/web/src/calculator/controller.ts'],
    ['the mount', 'apps/web/src/client/mount.ts'],
    ['the browser record of a calculator', 'tooling/site-browser/e2e/<id>-pages.ts'],
    ['the browser record table', 'tooling/site-browser/e2e/calculator-pages.ts'],
  ])('names %s in a step', (_what, token) => {
    expect(
      steps.some((step) => step.includes(token)),
      token,
    ).toBe(true);
  });

  it('names only paths that exist in the repository', () => {
    const missing = pathsIn(recipe).filter((path) => !exists(path));
    expect(missing).toEqual([]);
  });

  // spec: calculator-web-core › [CWC35] the recipe no longer says that CalculatorView renders concrete for every id
  it('does not claim that CalculatorView renders the concrete view for every id', () => {
    expect(recipe).not.toContain('concreteView');
  });

  // spec: calculator-web-core › [CWC35] no "generalise first" paragraph; a language-free page-module step and a typed browser-record step
  it('has no "generalise" paragraph, a language-free page-module step and an E2eSpec step', () => {
    expect(recipe).not.toContain('generalise');
    const step = (number: number): string =>
      steps.find((line) => line.startsWith(`${String(number)}. `)) ?? '';
    expect(step(11)).toContain('language-free');
    expect(step(14)).toContain('E2eSpec');
  });

  it('names the three tables that are a Record over the page ids', () => {
    for (const table of ['PAGES', 'SCRIPTS', 'E2E'])
      expect(recipe, table).toContain(`\`${table}\``);
  });

  it('lists what is still kept by hand instead of claiming that nothing is', () => {
    expect(recipe).not.toContain('Nothing else is kept by hand');
    expect(recipe).toContain('Kept by hand');
  });

  it('flags a path that does not exist', () => {
    expect(
      pathsIn('see `apps/web/src/nope/<id>.ts` and `AGENTS.md`').filter((p) => !exists(p)),
    ).toEqual(['apps/web/src/nope/concrete.ts']);
  });
});
