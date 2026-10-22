import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import astro from 'eslint-plugin-astro';
import { createNodeResolver, importX } from 'eslint-plugin-import-x';
import tseslint from 'typescript-eslint';
import { testGlobs as testSupportGlobs } from './tooling/test-globs.js';

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
    names: ['fetch', 'process'],
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

const corePurity = {
  'no-restricted-globals': ['error', ...restrictedGlobals],
  'no-restricted-properties': [
    'error',
    { object: 'Math', property: 'random', message: 'Nondeterministic; not allowed in core.' },
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
      selector: "CallExpression[callee.property.name='toFixed']",
      message: 'toFixed leaks floating point; format through exact Rational helpers.',
    },
  ],
};

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

const layerImports = {
  core: importsFor(
    banned(['@maestro-calc/*'], 'core depends on no other workspace.'),
    banned(['astro', 'astro/*', 'astro:*'], 'core must not depend on Astro.'),
    banned(['node:*'], 'core must not depend on Node builtins.'),
  ),
  i18n: importsFor(
    banned(['@maestro-calc/*'], 'i18n depends on no other workspace.'),
    banned(['node:*'], 'i18n must not depend on Node builtins.'),
  ),
  data: importsFor(
    banned(['@maestro-calc/i18n', '@maestro-calc/web'], 'data may depend only on core.'),
    banned(['node:*'], 'data must not depend on Node builtins.'),
  ),
};

const coreFiles = 'packages/core/**/*.{ts,mts,cts,tsx,js,mjs,cjs}';

const testGlobs = [...testSupportGlobs, '**/*.config.{js,ts,mjs}'];

/** @param {{ packageDir: string[]; devDependencies: boolean }} options */
const extraneous = (options) => ({ 'import-x/no-extraneous-dependencies': ['error', options] });

/**
 * Per-package dependency declarations: sources use only their own manifest, tests may also use
 * root devDependencies.
 * @param {string} dir
 */
const dependencyBlocks = (dir) => [
  {
    files: [`${dir}/src/**/*.{ts,astro}`],
    ignores: testGlobs,
    rules: extraneous({ packageDir: [dir], devDependencies: false }),
  },
  {
    files: testGlobs.map((glob) => `${dir}/${glob}`),
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
      'import-x/no-relative-packages': 'error',
      'import-x/no-cycle': ['error', { maxDepth: 10, ignoreExternal: true }],
    },
  },
  {
    files: ['**/src/**/*.{ts,mts,cts,tsx}'],
    ignores: ['**/*.d.ts'],
    rules: { 'import-x/no-default-export': 'error' },
  },
  { files: [coreFiles], rules: { ...coverageHonesty, ...layerImports.core } },
  { files: [coreFiles], ignores: testGlobs, rules: corePurity },
  {
    files: ['packages/{core,data,i18n}/src/**/*.{ts,mts,cts,tsx}'],
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
    files: ['packages/{core,data,i18n}/src/**/*.{ts,mts,cts,tsx}'],
    ignores: testGlobs,
    rules: { '@typescript-eslint/no-unsafe-type-assertion': 'error' },
  },
  { files: ['packages/i18n/**/*.{ts,mts,cts,tsx}'], rules: layerImports.i18n },
  { files: ['packages/data/**/*.{ts,mts,cts,tsx}'], rules: layerImports.data },
  { files: ['apps/web/**/*.{ts,astro}'], rules: importsFor() },
  { files: ['**/*.astro'], plugins: { 'import-x': importX } },
  ...['packages/core', 'packages/data', 'packages/i18n', 'apps/web'].flatMap(dependencyBlocks),
  ...astro.configs['flat/recommended'],
  { files: ['**/*.astro'], extends: [tseslint.configs.disableTypeChecked] },
  prettier,
);
