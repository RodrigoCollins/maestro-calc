import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { fromRoot, importFromRoot } from './root.ts';

const workspaces = ['.', 'packages/core', 'packages/data', 'packages/i18n', 'apps/web'];
const packages = ['packages/core', 'packages/data', 'packages/i18n'];

/** Resolves a tsconfig the way `tsc` does (extends chain included); throws on any config diagnostic. */
const parseTsconfig = (relativePath: string): ts.ParsedCommandLine => {
  const parsed = ts.getParsedCommandLineOfConfigFile(
    fromRoot(relativePath),
    {},
    {
      ...ts.sys,
      onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
        throw new Error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
      },
    },
  );
  if (parsed === undefined) throw new Error(`Could not parse ${relativePath}`);
  return parsed;
};

/** Canonical `package.json` key order for every manifest in the repository. */
const canonicalKeyOrder = [
  'name',
  'private',
  'type',
  'version',
  'engines',
  'packageManager',
  'workspaces',
  'sideEffects',
  'exports',
  'scripts',
  'dependencies',
  'devDependencies',
];

describe('workspace manifests', () => {
  // design: Package Layout — one canonical manifest key order
  it.each(workspaces)('%s package.json keys follow the canonical order', (dir) => {
    const manifest = JSON.parse(readFileSync(fromRoot(dir, 'package.json'), 'utf8')) as Record<
      string,
      unknown
    >;
    const keys = Object.keys(manifest);
    expect(keys.filter((key) => !canonicalKeyOrder.includes(key))).toEqual([]);
    expect(keys).toEqual(canonicalKeyOrder.filter((key) => keys.includes(key)));
  });
});

describe('tsconfig layout (monorepo-workspace › Toolchain pins)', () => {
  const leaves = (dir: string, names: string[]): string[] => names.map((name) => `${dir}/${name}`);
  const layout: Record<string, string[]> = {
    ...Object.fromEntries(
      packages.map((dir) => [dir, leaves(dir, ['tsconfig.src.json', 'tsconfig.test.json'])]),
    ),
    'apps/web': leaves('apps/web', ['tsconfig.app.json', 'tsconfig.test.json']),
  };
  // spec: monorepo-workspace › Toolchain pins › Compiler options inherited [MW13]
  it.each(Object.values(layout).flat())('%s resolves every strict flag to true', (config) => {
    expect(parseTsconfig(config).options).toMatchObject({
      strict: true,
      noUncheckedIndexedAccess: true,
      exactOptionalPropertyTypes: true,
      verbatimModuleSyntax: true,
      noImplicitOverride: true,
    });
  });

  // design: tsconfig layout — solution config per workspace
  it.each(Object.entries(layout))(
    '%s/tsconfig.json is a solution config referencing its program configs',
    (dir, configs) => {
      const solution = parseTsconfig(`${dir}/tsconfig.json`);
      expect(solution.fileNames).toEqual([]);
      expect(solution.projectReferences?.map((ref) => ref.path)).toEqual(
        configs.map((config) => fromRoot(config)),
      );
    },
  );
});

describe('package source type environment', () => {
  // spec: monorepo-workspace › Core purity › DOM reference rejected by the type checker [MW8]
  it.each(packages)('%s source program has no DOM or Node typings', (dir) => {
    const { options, fileNames } = parseTsconfig(`${dir}/tsconfig.src.json`);
    expect(options.types).toEqual([]);
    expect(options.lib?.some((lib) => lib.toLowerCase().includes('dom'))).toBe(false);
    expect(fileNames.filter((file) => /\.(test|test-d)\.ts$|__testing__/.test(file))).toEqual([]);
  });

  it.each(['console.log(1)', 'process.env', 'new URLSearchParams()'])(
    'a source file using `%s` fails to type-check',
    (expression) => {
      const { options, fileNames } = parseTsconfig('packages/core/tsconfig.src.json');
      const probe = fromRoot('packages/core/src/probe.ts');
      const host = ts.createCompilerHost(options);
      const getSourceFile = host.getSourceFile.bind(host);
      host.getSourceFile = (name, ...rest) =>
        name === probe
          ? ts.createSourceFile(
              name,
              `export const v = ${expression};`,
              options.target ?? ts.ScriptTarget.ES2022,
            )
          : getSourceFile(name, ...rest);
      const program = ts.createProgram([...fileNames, probe], options, host);
      const messages = ts
        .getPreEmitDiagnostics(program)
        .map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
      expect(messages.join('\n')).toMatch(/Cannot find name/);
    },
  );

  // design: tsconfig layout — test globs defined once in tooling/test-globs.js
  it.each(packages)('%s source program excludes exactly the shared test globs', async (dir) => {
    const { testGlobs } = await importFromRoot<{ testGlobs: string[] }>('tooling/test-globs.js');
    const { raw } = parseTsconfig(`${dir}/tsconfig.src.json`) as { raw: { exclude: string[] } };
    expect(raw.exclude).toEqual(testGlobs.map((glob) => glob.replace(/^\*\*\//, 'src/**/')));
  });

  // design: tsconfig layout — Node typings only where tests need them
  it.each([
    ...packages.map((dir) => [`${dir}/tsconfig.test.json`, ['node']] as const),
    ['apps/web/tsconfig.app.json', ['astro/client']] as const,
    ['apps/web/tsconfig.test.json', ['node']] as const,
  ])('%s declares only its own ambient typings: %j', (config, types) => {
    expect(parseTsconfig(config).options.types).toEqual(types);
  });
});
