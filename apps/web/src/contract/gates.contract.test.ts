import { readFileSync } from 'node:fs';
import { ESLint } from 'eslint';
import * as prettier from 'prettier';
import tseslint from 'typescript-eslint';
import { describe, expect, it } from 'vitest';
import { fromRoot, repoRoot } from './root.ts';

// Virtual file paths are not known to the type-aware project service, so the probes run the
// repository config with type information switched off. The rules under test are not type-aware;
// the full type-aware run is covered by `npm run lint` over the real tree.
const eslint = new ESLint({
  cwd: repoRoot,
  overrideConfig: [tseslint.configs.disableTypeChecked],
});

interface Outcome {
  ruleIds: (string | null)[];
  messages: string[];
  errorCount: number;
  warningCount: number;
}

const lint = async (code: string, relativePath: string): Promise<Outcome> => {
  const [result] = await eslint.lintText(code, { filePath: fromRoot(relativePath) });
  if (result === undefined) throw new Error('ESLint returned no result');
  return {
    ruleIds: result.messages.map((message) => message.ruleId),
    messages: result.messages.map((message) => message.message),
    errorCount: result.errorCount,
    warningCount: result.warningCount,
  };
};

// Type-aware probes lint the candidate text in place of an existing on-disk file, which the
// project service knows (R6 fallback in the tasks list).
const typedEslint = new ESLint({ cwd: repoRoot });

const CORE = 'packages/core/src/x.ts';
const PAGE = 'apps/web/src/pages/x.astro';

/** Asserts that linting `code` as the file at `path` reports `rule`. */
const rejects = async (code: string, path: string, rule: string): Promise<void> => {
  expect((await lint(code, path)).ruleIds, `${path}: ${code}`).toContain(rule);
};

const exportOf = (expression: string): string => `export const v = ${expression};\n`;

describe('lint gate (quality-gates, monorepo-workspace)', () => {
  // spec: quality-gates › Lint gate › `any` in core [QG2]; design: Style — named exports only
  it.each([
    ['export const a: any = 1;\n', '@typescript-eslint/no-explicit-any'],
    ['export default 1;\n', 'import-x/no-default-export'],
  ])('rejects %s in package sources', (code, rule) => rejects(code, CORE, rule));

  // spec: monorepo-workspace › Core purity › DOM reference rejected by lint [MW9]
  it.each(['window', 'document', 'fetch', 'process', 'performance', 'location', 'navigator'])(
    'rejects the host global %s in core',
    (name) => rejects(exportOf(name), CORE, 'no-restricted-globals'),
  );

  // design: Purity (core) — ambient host redeclarations cannot reintroduce a banned global
  it.each([
    'declare const process: { env: Record<string, string | undefined> };\nexport const v = process.env["A"];\n',
    'declare function fetch(url: string): void;\nexport const v = fetch;\n',
    'declare global { const process: { env: Record<string, string> }; }\nexport const v = 1;\n',
  ])('rejects the ambient declaration in package sources: %s', async (code) => {
    for (const dir of ['core', 'data', 'i18n']) {
      await rejects(code, `packages/${dir}/src/x.ts`, 'no-restricted-syntax');
    }
  });

  it('allows ambient declarations in .d.ts files', async () => {
    const outcome = await lint('declare const __BUILD__: string;\n', 'packages/core/src/env.d.ts');
    expect(outcome.ruleIds).not.toContain('no-restricted-syntax');
  });

  // design: Purity (core) — host globals beyond the browser set
  it.each([
    'console',
    'setTimeout',
    'setInterval',
    'clearTimeout',
    'clearInterval',
    'queueMicrotask',
    'structuredClone',
    'crypto',
    'TextEncoder',
    'TextDecoder',
    'URLSearchParams',
    'URL',
  ])('rejects the host global %s in core', (name) =>
    rejects(exportOf(name), CORE, 'no-restricted-globals'),
  );

  // design: test support stays out of shipped code
  it.each(['core', 'data', 'i18n'])(
    'rejects importing __testing__ code from packages/%s sources',
    (dir) =>
      rejects(
        "import { fixture } from './__testing__/fixture.ts';\nexport const v = fixture;\n",
        `packages/${dir}/src/x.ts`,
        'no-restricted-imports',
      ),
  );

  // design: Purity (core) — the global object cannot be used to reach restricted globals
  it.each(['globalThis', 'self', 'global'])('rejects the global object alias %s in core', (name) =>
    rejects(exportOf(name), CORE, 'no-restricted-globals'),
  );

  // spec: monorepo-workspace › Core purity › Nondeterminism rejected [MW10]
  it.each([
    ['Math.random()', 'no-restricted-properties'],
    ['Date.now()', 'no-restricted-properties'],
    ['new Date()', 'no-restricted-globals'],
  ])('rejects %s in core', (expression, rule) => rejects(exportOf(expression), CORE, rule));

  // design: only package-root config files are exempt from purity, never a source named *.config.ts
  it('applies purity to a *.config.ts file inside core sources', () =>
    rejects(
      exportOf('Math.random()'),
      'packages/core/src/x.config.ts',
      'no-restricted-properties',
    ));

  it('exempts a package-root config file from purity', async () => {
    const outcome = await lint(exportOf('Math.random()'), 'packages/core/vitest.config.ts');
    expect(outcome.ruleIds).not.toContain('no-restricted-properties');
  });

  // design: float leakage is a lint error in core
  it.each([
    ['(x: number) => x.toFixed(2)', 'no-restricted-syntax'],
    ['(x: number) => x.toPrecision(2)', 'no-restricted-syntax'],
    ['(x: number) => x.toExponential(2)', 'no-restricted-syntax'],
    ['(x: number) => x.toLocaleString()', 'no-restricted-syntax'],
    ["(x: number) => x['toFixed'](2)", 'no-restricted-syntax'],
    ["(x: number) => x['toLocaleString']()", 'no-restricted-syntax'],
    ["parseFloat('1')", 'no-restricted-globals'],
    ["Number.parseFloat('1')", 'no-restricted-properties'],
  ])('rejects %s in core', (expression, rule) => rejects(exportOf(expression), CORE, rule));

  // spec: quality-gates › Lint gate — widening type assertions are errors in core
  it.each(['core', 'data', 'i18n'])(
    'rejects a widening type assertion in packages/%s sources',
    async (dir) => {
      const path = fromRoot(`packages/${dir}/src/index.ts`);
      const code = 'export const v = JSON.parse("1") as unknown as string;\n';
      const [result] = await typedEslint.lintText(code, { filePath: path });
      expect(result?.messages.map((message) => message.ruleId)).toContain(
        '@typescript-eslint/no-unsafe-type-assertion',
      );
    },
  );

  // spec: quality-gates › Ignore pragma forbidden [QG9]
  it.each(['v8 ignore next', 'c8 ignore next', 'istanbul ignore next'])(
    'rejects the coverage pragma "%s" in core, tests and test support included',
    async (pragma) => {
      const code = `/* ${pragma} */\nexport const a = 1;\n`;
      for (const path of [CORE, 'packages/core/src/x.test.ts']) {
        await rejects(code, path, 'no-warning-comments');
      }
    },
  );

  // design: Purity (core) — reference directives cannot bypass tsconfig.src.json
  it.each([
    '/// <reference types="node" />\nexport const v = globalThis.process.env;\n',
    '/// <reference lib="dom" />\nexport const v = HTMLElement;\n',
    '/// <reference path="./other.d.ts" />\nexport const v = 1;\n',
  ])('rejects the triple-slash reference in package sources: %s', async (code) => {
    for (const dir of ['core', 'data', 'i18n']) {
      await rejects(code, `packages/${dir}/src/x.ts`, '@typescript-eslint/triple-slash-reference');
    }
  });

  // design: Purity (core) — rules cover every script extension, but not test support code
  it.each(['mts', 'cts', 'tsx', 'js', 'mjs'])('applies the core rules to .%s files', (extension) =>
    rejects(exportOf('window'), `packages/core/src/x.${extension}`, 'no-restricted-globals'),
  );

  it('lets core test support code use host globals', async () => {
    const outcome = await lint(exportOf('process.env'), 'packages/core/src/__testing__/env.ts');
    expect(outcome.ruleIds).not.toContain('no-restricted-globals');
  });

  // spec: monorepo-workspace › Forbidden edge fails lint [MW5]
  it('rejects core importing another workspace, naming the import', async () => {
    const outcome = await lint(
      "import { locales } from '@maestro-calc/i18n';\nexport const v = locales;\n",
      CORE,
    );
    expect(outcome.ruleIds).toContain('no-restricted-imports');
    expect(outcome.messages.join('\n')).toContain('@maestro-calc/i18n');
  });

  // spec: monorepo-workspace › Forbidden edge fails lint [MW5]
  it.each([
    ['packages/i18n/src/x.ts', "import '@maestro-calc/core';\n"],
    ['packages/data/src/x.ts', "import '@maestro-calc/i18n';\n"],
    [CORE, "import 'node:fs';\n"],
    [CORE, "import 'astro/config';\n"],
  ])('rejects the forbidden import in %s: %s', (path, code) =>
    rejects(code, path, 'no-restricted-imports'),
  );

  // spec: monorepo-workspace › Deep import rejected [MW7]
  it.each([
    [
      'apps/web/src/lib/x.ts',
      "import { x } from '@maestro-calc/core/src/rational';\nexport const y = x;\n",
    ],
    [
      PAGE,
      "---\nimport { x } from '@maestro-calc/core/src/rational';\nconsole.info(x);\n---\n<p />\n",
    ],
  ])('rejects deep imports into another workspace in %s', (path, code) =>
    rejects(code, path, 'no-restricted-imports'),
  );

  // design: Dependency direction — each package may import only its own declared dependencies
  it.each([
    [CORE, "import { parse } from 'yaml';\nexport const v = parse;\n"],
    [PAGE, "---\nimport { parse } from 'yaml';\nparse('');\n---\n<p />\n"],
  ])('rejects an undeclared dependency in %s', (path, code) =>
    rejects(code, path, 'import-x/no-extraneous-dependencies'),
  );

  // design: Dependency direction — every script extension is covered, not only .ts and .astro
  it.each(['mts', 'cts', 'tsx', 'js', 'mjs', 'cjs'])(
    'rejects an undeclared dependency in a .%s package source',
    (extension) =>
      rejects(
        "import { parse } from 'yaml';\nexport const v = parse;\n",
        `packages/core/src/x.${extension}`,
        'import-x/no-extraneous-dependencies',
      ),
  );

  // spec: quality-gates › Clean tree [QG3]
  it('accepts a clean file with no errors and no warnings', async () => {
    const outcome = await lint('export const answer = 42;\n', CORE);
    expect(outcome).toMatchObject({ errorCount: 0, warningCount: 0 });
    expect(outcome.ruleIds).toEqual([]);
  });

  // spec: quality-gates › Warning fails the gate [QG1]
  it('runs with zero tolerated warnings and no rule configured at warning level', async () => {
    const pkg = JSON.parse(readFileSync(fromRoot('package.json'), 'utf8')) as {
      scripts: Record<string, string>;
    };
    // The gate never reads a cache, so local, CI and verify runs agree; lint:fast is local only.
    expect(pkg.scripts['lint']).toContain('--max-warnings=0');
    expect(pkg.scripts['lint']).not.toContain('--cache');
    expect(pkg.scripts['lint:fast']).toContain('--cache');

    const config = (await eslint.calculateConfigForFile(fromRoot(CORE))) as {
      rules: Record<string, unknown>;
    };
    const warned = Object.entries(config.rules).filter(([, setting]) => {
      const level: unknown = Array.isArray(setting) ? setting[0] : setting;
      return level === 1 || level === 'warn';
    });
    expect(warned).toEqual([]);
  });
});

describe('format gate (quality-gates)', () => {
  const check = async (source: string, relativePath: string): Promise<boolean> => {
    const filepath = fromRoot(relativePath);
    const options = await prettier.resolveConfig(filepath);
    return prettier.check(source, { ...options, filepath });
  };

  // spec: quality-gates › Unformatted file [QG4]
  it('flags unformatted TypeScript and accepts the formatted form', async () => {
    expect(await check('const a   =  1\n', 'packages/i18n/src/y.ts')).toBe(false);
    expect(await check('const a = 1;\n', 'packages/i18n/src/y.ts')).toBe(true);
  });

  // spec: quality-gates › Format gate — Astro plugin
  it('formats Astro files through the Astro plugin', async () => {
    expect(await check('---\nconst a   =  1\n---\n<p>{a}</p>\n', PAGE)).toBe(false);
    expect(await check('---\nconst a = 1;\n---\n\n<p>{a}</p>\n', PAGE)).toBe(true);
  });
});
