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
      expect(text).toContain('49,152');
      expect(text).toContain('172,032');
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
  const step = (number: number): string =>
    steps.find((line) => line.startsWith(`${String(number)}. `)) ?? '';

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
    ['the worked-example table', 'WORKED_EXAMPLES'],
    ['the schema module', 'apps/web/src/content/schema.ts'],
    ['the content rows', 'CONTENT_ROWS'],
    ['the content rows module', 'apps/web/src/contract/__testing__/calculator-rows.ts'],
    ['the methodology contract', 'apps/web/src/contract/methodology.contract.test.ts'],
    ['the methodology rows', 'METHODOLOGY_ROWS'],
    ['the methodology rows module', 'apps/web/src/contract/__testing__/methodology-rows.ts'],
    ['the route', 'apps/web/src/routing/routes.ts'],
    ['the route metadata', 'packages/i18n/src/catalogs/{en,es}/site.ts'],
    ['the script row', 'apps/web/src/views/scripts.ts'],
    ['the page reserve', 'PAGES.reserve'],
    ['the reserve builder', 'apps/web/src/lib/reserve.ts'],
    ['the reserve values beside the page module', '`reserve.ts`'],
    ['the layout widths', 'tooling/site-browser/e2e/layout.spec.ts'],
    ['the home card keys', 'page.home.cards.<id>'],
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
    ['the slot-free record fixture', 'tooling/site-browser/e2e/calculator-pages.test-d.ts'],
    ['the proof contract', 'apps/web/src/contract/slot-free-proof.contract.test.ts'],
    ['the proof entry', 'apps/web/src/contract/__testing__/slot-free-entry.ts'],
    ['the entry import contract', 'apps/web/src/contract/entry-graph.contract.test.ts'],
    ['the entry budget contract', 'apps/web/src/contract/client-entry.contract.test.ts'],
    ['the drawing geometry', 'apps/web/src/calculator/slots/drawing.ts'],
    ['the drawing writer', 'apps/web/src/client/draw.ts'],
    ['the drawing record contract', 'apps/web/src/contract/drawing-record.contract.test.ts'],
    ['the injected writer', 'mount(page, { draw })'],
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
    expect(step(11)).toContain('language-free');
    expect(step(14)).toContain('E2eSpec');
  });

  // review G3 R3-agents-proof-overclaim, R2-recipe-omits-proof-retirement, R2-recipe-misdescribes-record
  it('says what the proof contract proves and what the record holds', () => {
    expect(step(12)).toContain('not executed by any test');
    expect(step(12)).not.toContain('proves it on the unrouted');
    expect(step(14)).toContain('`minimal`');
    expect(step(14)).not.toContain('default answer per locale');
    for (const group of ['`answer`', '`choices`', '`steppers`', '`shopping`', '`prices`']) {
      expect(step(14), group).toContain(group);
    }
  });

  // spec: calculator-web-core › [CWC40] after the go-live the slot-free files are test support, and no
  // step still waits for rectangle-area to go live
  it('names the slot-free files as test support and no longer waits for the rectangle-area go-live', () => {
    expect(step(12)).toContain('test support');
    expect(step(12)).toContain('No routed page is slot-free');
    expect(step(12)).not.toContain('covered by its browser record alone');
    expect(step(14)).not.toContain('steps 12 and 14');
    expect(step(14)).not.toContain('When the calculator that goes live is `rectangle-area`');
  });

  it('names the three tables that are a Record over the page ids', () => {
    for (const table of ['PAGES', 'SCRIPTS', 'E2E'])
      expect(recipe, table).toContain(`\`${table}\``);
  });

  it('lists what is still kept by hand instead of claiming that nothing is', () => {
    expect(recipe).not.toContain('Nothing else is kept by hand');
    expect(recipe).toContain('Kept by hand');
  });

  // K13: the per-id tables are named where they are edited, and the renamed contract is not
  it('names each per-id table in the step that edits it and in the list kept by hand', () => {
    expect(step(11)).toContain('`WORKED_EXAMPLES`');
    expect(step(11)).toContain('`CONTENT_ROWS`');
    expect(step(13)).toContain('`METHODOLOGY_ROWS`');
    expect(step(14)).toContain('`SCRIPTS`');
    const kept = recipe.slice(recipe.indexOf('Kept by hand'));
    for (const table of ['WORKED_EXAMPLES', 'CONTENT_ROWS', 'METHODOLOGY_ROWS'])
      expect(kept, table).toContain(`\`${table}\``);
    expect(kept).toContain('apps/web/src/views/scripts.ts');
    expect(recipe).not.toContain('methodology-concrete');
    expect(recipe).not.toContain('views/CalculatorView.astro');
  });

  it('flags a path that does not exist', () => {
    expect(
      pathsIn('see `apps/web/src/nope/<id>.ts` and `AGENTS.md`').filter((p) => !exists(p)),
    ).toEqual(['apps/web/src/nope/concrete.ts']);
  });
});
