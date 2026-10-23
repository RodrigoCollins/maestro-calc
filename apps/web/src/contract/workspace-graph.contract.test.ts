import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { fromRoot } from './root.ts';

interface Manifest {
  name: string;
  workspaces?: string[];
  engines?: { node?: string };
  scripts?: Record<string, string>;
  exports?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
}

const DEPENDENCY_FIELDS = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies',
] as const;

const readJson = (relativePath: string): unknown =>
  JSON.parse(readFileSync(fromRoot(relativePath), 'utf8'));
const readManifest = (dir: string): Manifest => readJson(`${dir}/package.json`) as Manifest;

/** A tsconfig file parsed as JSONC (comments allowed), the way `tsc` reads it. */
const readTsconfig = (relativePath: string): { extends?: string | string[] } => {
  const result = ts.readConfigFile(fromRoot(relativePath), (path) => ts.sys.readFile(path));
  expect(result.error, relativePath).toBeUndefined();
  return result.config as { extends?: string | string[] };
};

const rootManifest = readManifest('.');

/** Resolves a `packages/*`-style workspace glob to the directories that hold a manifest. */
const dirsOfGlob = (glob: string): string[] => {
  const parent = glob.replace(/\/\*$/, '');
  return readdirSync(fromRoot(parent), { withFileTypes: true })
    .filter(
      (entry) => entry.isDirectory() && existsSync(fromRoot(parent, entry.name, 'package.json')),
    )
    .map((entry) => `${parent}/${entry.name}`);
};

const workspaceDirs = (rootManifest.workspaces ?? []).flatMap(dirsOfGlob);
const workspaceNames = workspaceDirs.map((dir) => readManifest(dir).name);

const dependencyNames = (manifest: Manifest): string[] =>
  DEPENDENCY_FIELDS.flatMap((field) => Object.keys(manifest[field] ?? {}));

/** True when the `extends` chain of `config` (relative paths only) reaches `tsconfig.base.json`. */
const extendsBase = (config: string): boolean =>
  [readTsconfig(config).extends ?? []].flat().some((parent) => {
    if (!parent.startsWith('.')) return false;
    const target = resolve(dirname(fromRoot(config)), parent);
    return target === fromRoot('tsconfig.base.json') || extendsBase(relative(fromRoot(), target));
  });

describe('workspace layout (monorepo-workspace › Workspace layout)', () => {
  // spec: Workspace enumeration [MW2]
  it('resolves the workspace globs to exactly the four packages', () => {
    expect(rootManifest.workspaces).toEqual(['packages/*', 'apps/*']);
    expect([...workspaceNames].sort()).toEqual([
      '@maestro-calc/core',
      '@maestro-calc/data',
      '@maestro-calc/i18n',
      '@maestro-calc/web',
    ]);
  });
});

describe('dependency direction (monorepo-workspace › Dependency direction)', () => {
  // spec: Dependency direction — exactly the allowed edges [MW5b, MD5]
  it('has only the edges data to core, web to core, web to data and web to i18n', () => {
    const edges = workspaceDirs.flatMap((dir) => {
      const manifest = readManifest(dir);
      return dependencyNames(manifest)
        .filter((dependency) => workspaceNames.includes(dependency))
        .map((dependency) => `${manifest.name} -> ${dependency}`);
    });
    expect(edges.sort()).toEqual([
      '@maestro-calc/data -> @maestro-calc/core',
      '@maestro-calc/web -> @maestro-calc/core',
      '@maestro-calc/web -> @maestro-calc/data',
      '@maestro-calc/web -> @maestro-calc/i18n',
    ]);
  });

  // spec: Core has no runtime dependencies [MW6]; calculator-contract: no schema library [CC26]
  it('keeps core free of runtime dependencies and of any schema or fraction library', () => {
    const core = readManifest('packages/core');
    expect(Object.keys(core.dependencies ?? {})).toEqual([]);
    expect(
      dependencyNames(core).filter((name) =>
        /zod|valibot|yup|ajv|joi|arktype|superstruct|fraction|decimal|big\.?js|bignumber|mathjs/i.test(
          name,
        ),
      ),
    ).toEqual([]);
  });
});

describe('toolchain pins (monorepo-workspace › Toolchain pins)', () => {
  // spec: Compiler options inherited [MW13]: the base enables the strict family
  it('enables the strict compiler options in the shared base', () => {
    const base = readJson('tsconfig.base.json') as { compilerOptions: Record<string, unknown> };
    const options = base.compilerOptions;
    expect(options).toMatchObject({
      strict: true,
      noUncheckedIndexedAccess: true,
      exactOptionalPropertyTypes: true,
      verbatimModuleSyntax: true,
      noImplicitOverride: true,
    });
    expect(String(options['moduleResolution']).toLowerCase()).toBe('bundler');
    const parsed = ts.convertCompilerOptionsFromJson(options, fromRoot()).options;
    expect(parsed.target).toBeGreaterThanOrEqual(ts.ScriptTarget.ES2022);
  });

  // spec: Compiler options inherited [MW13]: every program config reaches the base through extends
  it.each(['packages/core', 'packages/data', 'packages/i18n'])(
    '%s program configs extend tsconfig.base.json',
    (dir) => {
      for (const file of ['tsconfig.src.json', 'tsconfig.test.json']) {
        expect(extendsBase(`${dir}/${file}`), `${dir}/${file}`).toBe(true);
      }
    },
  );

  it.each(['apps/web/tsconfig.app.json', 'apps/web/tsconfig.test.json'])(
    '%s extends tsconfig.base.json',
    (config) => {
      expect(extendsBase(config), config).toBe(true);
    },
  );

  // spec: Single TypeScript version [MW14]: declared once at the root, in the ~6.0 range
  it('declares typescript only at the root, in the ~6.0 range', () => {
    expect(rootManifest.devDependencies?.['typescript']).toMatch(/^~6\.0(\.\d+)?$/);
    const others = workspaceDirs.filter((dir) =>
      dependencyNames(readManifest(dir)).includes('typescript'),
    );
    expect(others).toEqual([]);
  });

  it('resolves one installed typescript of the 6.0 line', () => {
    const installed = createRequire(import.meta.url)('typescript/package.json') as {
      version: string;
    };
    expect(installed.version).toMatch(/^6\.0\./);
  });

  // spec: Toolchain pins — `.nvmrc` is 24 and engines.node is >=22.23.4
  it('pins the Node version', () => {
    expect(readFileSync(fromRoot('.nvmrc'), 'utf8').trim()).toBe('24');
    expect(rootManifest.engines?.node).toBe('>=22.23.4');
  });
});

describe('developer entry points (monorepo-workspace › Developer entry points)', () => {
  // spec: Developer entry points [MW15b]
  it('declares the ten root scripts and keeps check as an alias of typecheck', () => {
    const scripts = rootManifest.scripts ?? {};
    for (const name of [
      'dev',
      'build',
      'lint',
      'format',
      'format:check',
      'typecheck',
      'check',
      'test',
      'test:coverage',
      'mutation',
    ]) {
      expect(scripts[name], name).toBeTypeOf('string');
    }
    expect(scripts['check']).toBe('npm run typecheck');
  });
});

describe('internal packages ship TypeScript source (monorepo-workspace › Internal packages)', () => {
  const packageDirs = ['packages/core', 'packages/data', 'packages/i18n'];

  // spec: Web build consumes workspace source [MW11b]: exports point at .ts source
  it.each(packageDirs)('%s exports only TypeScript source files', (dir) => {
    const targets = Object.values(readManifest(dir).exports ?? {});
    expect(targets.length).toBeGreaterThan(0);
    for (const target of targets) expect(target, `${dir} ${target}`).toMatch(/\.ts$/);
  });

  // spec: Web build consumes workspace source [MW11b]. A `dist` is gitignored and can only appear
  // after a build, so the check runs as a post-build step (`check:dist`, in `verify` and in CI)
  // and this test pins the script itself against a temporary workspace.
  describe('check:dist (the post-build assertion)', () => {
    const script = rootManifest.scripts?.['check:dist'] ?? '';
    const runIn = (dist: string | undefined): number | null => {
      const root = mkdtempSync(join(tmpdir(), 'check-dist-'));
      try {
        mkdirSync(join(root, 'packages', 'core', 'src'), { recursive: true });
        if (dist !== undefined) mkdirSync(join(root, dist), { recursive: true });
        return spawnSync(script, { cwd: root, shell: true, encoding: 'utf8' }).status;
      } finally {
        rmSync(root, { recursive: true });
      }
    };

    it('passes when no package has a dist directory', () => {
      expect(script).not.toBe('');
      expect(runIn(undefined)).toBe(0);
    });

    it.each(['packages/core/dist', 'packages/data/dist'])('fails when %s exists', (dist) => {
      expect(runIn(dist)).toBe(1);
    });
  });
});
