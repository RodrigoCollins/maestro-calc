import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import astro from 'eslint-plugin-astro';
import { createNodeResolver, importX } from 'eslint-plugin-import-x';
import tseslint from 'typescript-eslint';
import { testGlobs as testSupportGlobs } from './tooling/test-globs.js';
import { packageGlobs, workspaceDirs } from './tooling/workspaces.js';

/** Restricted globals grouped by the reason they are banned in packages/core. */
const restrictedGlobalGroups = [
  {
    names: [
      'window',
      'document',
      'location',
      'history',
      'navigator',
      'localStorage',
      'sessionStorage',
    ],
    reason: 'is a browser API; packages/core must stay host-independent.',
  },
  {
    names: [
      'fetch',
      'process',
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
    ],
    reason: 'is a host API; packages/core must stay host-independent.',
  },
  {
    names: ['globalThis', 'self', 'global'],
    reason: 'exposes every host global indirectly; packages/core must not touch the global object.',
  },
  {
    names: ['Date', 'performance'],
    reason: 'is nondeterministic; packages/core must be a pure function of its inputs.',
  },
  { names: ['parseFloat'], reason: 'leaks inexact floating point values; use parseDecimal.' },
];

const restrictedGlobals = restrictedGlobalGroups.flatMap(({ names, reason }) =>
  names.map((name) => ({ name, message: `\`${name}\` ${reason}` })),
);

const floatFormatters = '/^(toFixed|toPrecision|toExponential|toLocaleString)$/';

const ambientSyntax = [
  'VariableDeclaration[declare=true]',
  'TSDeclareFunction[declare=true]',
  'ClassDeclaration[declare=true]',
  'TSEnumDeclaration[declare=true]',
  // Covers `declare namespace`, `declare module 'x'` and `declare global`.
  'TSModuleDeclaration[declare=true]',
  'TSModuleDeclaration[global=true]',
];

const ambientRestrictions = ambientSyntax.map((selector) => ({
  selector,
  message: 'Ambient declarations are not allowed in package sources; use a .d.ts file.',
}));

/** @param {typeof ambientRestrictions} syntax extra restricted syntax (the ambient ban) */
const corePurity = (syntax) => ({
  'no-restricted-globals': ['error', ...restrictedGlobals],
  'no-restricted-properties': [
    'error',
    { object: 'Math', property: 'random', message: 'Nondeterministic; not allowed in core.' },
    // MW10 anchor: kept next to the `Date` global ban so `Date.now()` names its own rule.
    { object: 'Date', property: 'now', message: 'Nondeterministic; not allowed in core.' },
    {
      object: 'Number',
      property: 'parseFloat',
      message: 'Float parsing leaks inexact values; use parseDecimal.',
    },
  ],
  'no-restricted-syntax': [
    'error',
    {
      selector: `CallExpression[callee.property.name=${floatFormatters}]`,
      message: 'Number formatting leaks floating point; format through exact Rational helpers.',
    },
    {
      selector: `CallExpression[callee.property.value=${floatFormatters}]`,
      message: 'Number formatting leaks floating point; format through exact Rational helpers.',
    },
    ...syntax,
  ],
});

/** Coverage pragmas are banned everywhere in core, tests and test support included. */
const coverageHonesty = {
  'no-warning-comments': [
    'error',
    { terms: ['v8 ignore', 'c8 ignore', 'istanbul ignore'], location: 'anywhere' },
  ],
};

const deepImport = {
  group: ['@maestro-calc/*/src', '@maestro-calc/*/src/**'],
  message:
    'Import workspace packages through their public entry point, never their internal paths.',
};

/** @param {string[]} group @param {string} why */
const banned = (group, why) => ({ group, message: why });

/** @param {...{ group: string[]; message: string }} patterns */
const importsFor = (...patterns) => ({
  'no-restricted-imports': ['error', { patterns: [...patterns, deepImport] }],
});

const layerPatterns = {
  core: [
    banned(['@maestro-calc/*'], 'core depends on no other workspace.'),
    banned(['astro', 'astro/*', 'astro:*'], 'core must not depend on Astro.'),
    banned(['node:*'], 'core must not depend on Node builtins.'),
  ],
  i18n: [
    banned(['@maestro-calc/*'], 'i18n depends on no other workspace.'),
    banned(['node:*'], 'i18n must not depend on Node builtins.'),
  ],
  data: [
    banned(['@maestro-calc/i18n', '@maestro-calc/web'], 'data may depend only on core.'),
    banned(['node:*'], 'data must not depend on Node builtins.'),
  ],
};

const layerImports = Object.fromEntries(
  Object.entries(layerPatterns).map(([layer, patterns]) => [layer, importsFor(...patterns)]),
);

const testSupportImport = banned(
  ['**/__testing__', '**/__testing__/**'],
  'Test support code must not be imported by shipped sources.',
);

/** The `testing/*` subpaths of a package are test support: no shipped source may import them. */
const packageTestingImport = banned(
  ['@maestro-calc/*/testing', '@maestro-calc/*/testing/**'],
  'Test support of a package must not be imported by shipped code.',
);

const coreFiles = 'packages/core/**/*.{ts,mts,cts,tsx,js,mjs,cjs}';

const scriptExtensions = 'ts,mts,cts,tsx,js,mjs,cjs';
/** @param {string} tail */
const inPackages = (tail) => packageGlobs(import.meta.dirname, tail);

/** Config files are exempt only at a workspace root, never inside `src`. */
const configFile = '*.config.{js,ts,mjs}';

/** Relative to one workspace root (dependency blocks prefix it with the workspace directory). */
const relativeTestGlobs = [...testSupportGlobs, configFile];

/** Relative to the repository root. */
const testGlobs = [
  ...testSupportGlobs,
  configFile,
  'packages/*/' + configFile,
  'apps/*/' + configFile,
];

/** @param {{ packageDir: string[]; devDependencies: boolean }} options */
const extraneous = (options) => ({ 'import-x/no-extraneous-dependencies': ['error', options] });

/**
 * Per-package dependency declarations: sources use only their own manifest, tests may also use
 * root devDependencies.
 * @param {string} dir
 */
const dependencyBlocks = (dir) => [
  {
    files: [`${dir}/src/**/*.{${scriptExtensions},astro}`],
    ignores: testGlobs,
    rules: extraneous({ packageDir: [dir], devDependencies: false }),
  },
  {
    files: relativeTestGlobs.map((glob) => `${dir}/${glob}`),
    rules: extraneous({ packageDir: ['.', dir], devDependencies: true }),
  },
];

export default defineConfig(
  globalIgnores([
    '**/dist/**',
    '**/.astro/**',
    '**/coverage/**',
    '**/reports/**',
    '**/.stryker-tmp/**',
    '**/node_modules/**',
  ]),
  { linterOptions: { reportUnusedDisableDirectives: 'error' } },
  {
    files: ['**/*.{ts,mts,cts,tsx,js,mjs,cjs}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    plugins: { 'import-x': importX },
    settings: {
      'import-x/resolver-next': [
        createNodeResolver({ extensions: ['.ts', '.mjs', '.js', '.json'] }),
      ],
    },
    rules: {
      // An invisible character in a string, template or comment reads like a plain space in review;
      // write it as an escape (`\u2003`) so that the text shows what it is.
      'no-irregular-whitespace': [
        'error',
        { skipStrings: false, skipTemplates: false, skipComments: false, skipRegExps: false },
      ],
      'import-x/no-relative-packages': 'error',
      'import-x/no-cycle': ['error', { maxDepth: 10, ignoreExternal: true }],
    },
  },
  {
    files: ['**/src/**/*.{ts,mts,cts,tsx}'],
    ignores: ['**/*.d.ts'],
    rules: { 'import-x/no-default-export': 'error' },
  },
  { files: [coreFiles], rules: coverageHonesty },
  // The package-root config files run in Node (the Stryker config hashes files), never in core.
  { files: [coreFiles], ignores: ['packages/core/' + configFile], rules: layerImports.core },
  {
    // Core sources get the same selectors through corePurity. Ambient declarations could redeclare a banned host global and silence both the type
    // checker and the globals rule.
    files: inPackages('src/**/*.{ts,mts,cts,tsx}'),
    ignores: [...testGlobs, '**/*.d.ts'],
    rules: {
      'no-restricted-syntax': ['error', ...ambientRestrictions],
    },
  },
  {
    files: [coreFiles],
    ignores: [...testGlobs, '**/*.d.ts'],
    rules: corePurity(ambientRestrictions),
  },
  // Declaration files are exempt from the ambient ban only: they must still obey every other
  // purity rule.
  { files: ['packages/core/**/*.d.ts'], ignores: testGlobs, rules: corePurity([]) },
  {
    files: inPackages('src/**/*.{ts,mts,cts,tsx}'),
    rules: {
      // Typings bypass: a reference directive pulls DOM or Node typings past tsconfig.src.json.
      '@typescript-eslint/triple-slash-reference': [
        'error',
        { lib: 'never', path: 'never', types: 'never' },
      ],
    },
  },
  {
    // Widening assertions defeat the type checker (spec: quality-gates, Lint gate).
    files: inPackages('src/**/*.{ts,mts,cts,tsx}'),
    ignores: testGlobs,
    rules: { '@typescript-eslint/no-unsafe-type-assertion': 'error' },
  },
  { files: ['packages/i18n/**/*.{ts,mts,cts,tsx}'], rules: layerImports.i18n },
  { files: ['packages/data/**/*.{ts,mts,cts,tsx}'], rules: layerImports.data },
  ...Object.entries(layerPatterns).map(([layer, patterns]) => ({
    files: [`packages/${layer}/src/**/*.{${scriptExtensions}}`],
    ignores: testGlobs,
    rules: importsFor(...patterns, testSupportImport, packageTestingImport),
  })),
  { files: ['apps/web/**/*.{ts,astro}'], rules: importsFor() },
  {
    // The `testing/*` subpaths of core and i18n and the `src/contract` helpers exist for the contract
    // tests of the web app only.
    files: ['apps/web/**/*.{ts,astro}'],
    ignores: [...testGlobs, 'apps/web/src/contract/**'],
    rules: importsFor(
      packageTestingImport,
      testSupportImport,
      banned(
        ['**/contract', '**/contract/**'],
        'Contract-test helpers (src/contract) must not be imported by shipped web code.',
      ),
    ),
  },
  {
    // Presentational components receive plain props: they read no catalog, route table or content.
    files: ['apps/web/src/components/**/*.{ts,astro}'],
    ignores: testGlobs,
    rules: importsFor(
      packageTestingImport,
      testSupportImport,
      banned(['**/contract', '**/contract/**'], 'Contract-test helpers must not be shipped.'),
      banned(
        ['@maestro-calc/i18n', '@maestro-calc/i18n/**'],
        'Components receive text as props; only layouts and views read the catalogs.',
      ),
      banned(
        ['**/routing', '**/routing/**'],
        'Components receive paths as props; only layouts and views read the route table.',
      ),
      banned(['astro:content'], 'Components receive content as props; only views query it.'),
    ),
  },
  { files: ['**/*.astro'], plugins: { 'import-x': importX } },
  ...workspaceDirs(import.meta.dirname).flatMap(dependencyBlocks),
  ...astro.configs['flat/recommended'],
  { files: ['**/*.astro'], extends: [tseslint.configs.disableTypeChecked] },
  {
    // The Stryker configs share `tooling/stryker.mjs` by relative path: the repository root is not
    // a package they could import by name.
    files: ['packages/*/stryker.config.mjs'],
    rules: { 'import-x/no-relative-packages': 'off' },
  },
  // Plain JS config outside every tsconfig program: parsed and linted without type information.
  {
    files: ['packages/*/stryker.config.mjs', 'scripts/*.mjs', 'tooling/*.mjs'],
    extends: [tseslint.configs.disableTypeChecked],
  },
  prettier,
);
