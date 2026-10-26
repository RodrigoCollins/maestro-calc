import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';
import { fromRoot, importFromRoot } from './root.ts';

interface Step {
  id?: string;
  name?: string;
  uses?: string;
  run?: string;
  if?: string;
  with?: Record<string, unknown>;
  env?: Record<string, string>;
  'continue-on-error'?: unknown;
}

interface Job {
  steps: Step[];
  needs?: string | string[];
  if?: string;
  paths?: unknown;
  'paths-ignore'?: unknown;
  permissions?: unknown;
  'timeout-minutes'?: number;
  id?: string;
  name?: string;
  strategy?: { 'fail-fast'?: boolean; matrix?: { include?: { shard: string; inputs: string }[] } };
  'continue-on-error'?: unknown;
}

interface Workflow {
  on: { pull_request?: unknown; push?: { branches?: string[] } };
  permissions: unknown;
  concurrency: { group: string; 'cancel-in-progress': boolean | string };
  jobs: Record<string, Job>;
}

const readYaml = (relativePath: string): unknown =>
  parse(readFileSync(fromRoot(relativePath), 'utf8'));

const workflow = readYaml('.github/workflows/ci.yml') as Workflow;
const verify = workflow.jobs['verify'];

const commands = (verify?.steps ?? []).flatMap((step) =>
  step.run === undefined ? [] : [step.run],
);

describe('CI workflow (quality-gates › Continuous integration workflow)', () => {
  // spec: quality-gates › Continuous integration workflow — triggers
  it('runs on pull requests and on pushes to main', () => {
    expect(workflow.on.pull_request).toBeDefined();
    expect(workflow.on.push?.branches).toEqual(['main']);
  });

  // spec: Least privilege [QG16]
  it('grants read-only contents permission at the top level and overrides nowhere', () => {
    expect(workflow.permissions).toEqual({ contents: 'read' });
    for (const job of Object.values(workflow.jobs)) {
      expect(job.permissions).toBeUndefined();
    }
  });

  // spec: quality-gates › Continuous integration workflow — concurrency group per ref
  it('cancels superseded pull request runs of the same ref, never runs on main', () => {
    expect(workflow.concurrency['cancel-in-progress']).toBe(
      "${{ github.event_name == 'pull_request' }}",
    );
    expect(workflow.concurrency.group).toContain('github.ref');
  });

  // spec: quality-gates › Least privilege [QG16]
  it('does not persist the checkout token into the workspace', () => {
    const checkout = verify?.steps.find((step) => step.uses?.startsWith('actions/checkout@'));
    expect(checkout?.with).toMatchObject({ 'persist-credentials': false });
  });

  // spec: quality-gates › Continuous integration workflow — Node from .nvmrc, npm cache, bounded time
  it('sets up Node from .nvmrc with the npm cache and bounds the job time', () => {
    expect(verify).toBeDefined();
    const setup = verify?.steps.find((step) => step.uses?.startsWith('actions/setup-node@'));
    expect(setup?.with).toMatchObject({ 'node-version-file': '.nvmrc', cache: 'npm' });
    expect(verify?.['timeout-minutes']).toBeGreaterThan(0);
  });

  // spec: Gate failure blocks [QG14]
  it('runs the gates cheapest-first with no continue-on-error', () => {
    expect(commands).toEqual([
      'npm ci',
      'npm run format:check',
      'npm run sync',
      'npm run lint',
      'npm run typecheck',
      'npm run test:coverage',
      'npm run build',
      'npm run check:site',
      'npm run check:dist',
    ]);
    for (const job of Object.values(workflow.jobs)) {
      expect(job['continue-on-error']).toBeUndefined();
      for (const step of job.steps) {
        expect(step['continue-on-error']).toBeUndefined();
      }
    }
  });

  // spec: quality-gates › [QGW5] site gate order
  it('runs check:site immediately after the build and check:dist last', () => {
    const build = commands.indexOf('npm run build');
    expect(build).toBeGreaterThan(0);
    expect(commands[build + 1]).toBe('npm run check:site');
    expect(commands.at(-1)).toBe('npm run check:dist');
  });

  // spec: quality-gates › [QGW7] the mutation job never waits for the browser job
  it('keeps site-browser out of the mutation needs', () => {
    expect([workflow.jobs['mutation']?.needs].flat()).toEqual(['verify']);
  });

  // spec: quality-gates › Continuous integration workflow — local `verify` mirrors CI
  it('keeps the local verify script identical to the CI steps after the install', () => {
    const pkg = JSON.parse(readFileSync(fromRoot('package.json'), 'utf8')) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts['verify']?.split(' && ')).toEqual(commands.slice(1));
  });

  // spec: quality-gates › Continuous integration workflow — actions pinned to commit SHAs
  it('pins every third-party action to a full commit SHA', () => {
    const uses = Object.values(workflow.jobs).flatMap((job) =>
      job.steps.flatMap((step) => (step.uses === undefined ? [] : [step.uses])),
    );
    expect(uses.length).toBeGreaterThan(0);
    for (const reference of uses) {
      expect(reference).toMatch(/^[\w.-]+\/[\w.-]+(\/[\w./-]+)?@[0-9a-f]{40}(\s+#.*)?$/);
    }
  });
});

const coreShards = await importFromRoot<{ shardNames: string[] }>(
  'packages/core/stryker.config.mjs',
);
const dataShards = await importFromRoot<{ shardNames: string[] }>(
  'packages/data/stryker.config.mjs',
);
// the shards of every package that has a Stryker config, core first
const shardNames = [...coreShards.shardNames, ...dataShards.shardNames];

describe('CI mutation job (quality-gates › Continuous integration workflow, Mutation gate)', () => {
  const mutation = workflow.jobs['mutation'];
  const steps = mutation?.steps ?? [];
  const step = (prefix: string): Step | undefined =>
    steps.find((candidate) => candidate.uses?.startsWith(prefix));

  // spec: Mutation job always runs incrementally [QG15]
  it('runs after verify, on every run, with nothing that can skip it', () => {
    expect(mutation).toBeDefined();
    expect(mutation?.needs).toBe('verify');
    expect(mutation?.if).toBeUndefined();
    expect(mutation?.paths).toBeUndefined();
    expect(mutation?.['paths-ignore']).toBeUndefined();
  });

  // design 3.19b: one runner per shard; the matrix must list exactly the shards of the Stryker
  // config, so a shard added there cannot go unrun in CI. One failing shard must not hide the
  // scores of the others.
  it('runs one matrix entry per Stryker shard without failing fast', () => {
    expect(mutation?.strategy?.matrix?.include?.map(({ shard }) => shard)).toEqual(shardNames);
    // the check name is the shard, not the whole matrix entry (its `inputs` run to many lines)
    expect(mutation?.name).toBe('mutation (${{ matrix.shard }})');
    expect(mutation?.strategy?.['fail-fast']).toBe(false);
    expect(mutation?.['timeout-minutes']).toBe(30);
  });

  const KEY_EXPRESSION = '${{ env.STRYKER_CACHE_KEY }}';
  const keyStep = steps.find((candidate) => candidate.run?.includes('STRYKER_CACHE_KEY=') ?? false);

  // spec: Mutation job always runs incrementally [QG15]
  it('runs npm run mutation after a clean install, with no continue-on-error', () => {
    const commands = steps.flatMap((candidate) =>
      candidate.run === undefined || candidate === keyStep ? [] : [candidate.run],
    );
    expect(commands).toEqual(['npm ci', 'npm run mutation -- --shard ${{ matrix.shard }}']);
    expect(mutation?.['timeout-minutes']).toBeGreaterThan(0);
    expect(mutation?.['continue-on-error']).toBeUndefined();
    expect(step('actions/checkout@')?.with).toMatchObject({ 'persist-credentials': false });
    expect(step('actions/setup-node@')?.with).toMatchObject({
      'node-version-file': '.nvmrc',
      cache: 'npm',
    });
  });

  // design: one documented cache key, a superset of every input the Stryker config hashes. GitHub
  // exposes neither `runner` nor `hashFiles` to a job-level `env`, so one step defines the key
  // for the later restore and save steps.
  it('computes one cache key per shard from the shard inputs and the root files', () => {
    expect(keyStep?.run).toContain('${RUNNER_OS}');
    // one key (and one report) per shard: the shards never overwrite each other's cache
    expect(keyStep?.run).toContain('${{ matrix.shard }}');
    // the shard's own inputs; the globs of the root files are pinned, per shard, by
    // mutation-identity.contract.test.ts against `identityFilesFor`
    expect(keyStep?.run).toContain('hashFiles(matrix.inputs,');
    for (const input of [
      'vitest.config.ts',
      'tooling/stryker.mjs',
      'tsconfig.base.json',
      '.nvmrc',
      'package-lock.json',
    ]) {
      expect(keyStep?.run, input).toContain(`'${input}'`);
    }
  });

  // spec: Mutation job always runs incrementally [QG15]
  it('restores the incremental report by that key and saves it on main only', () => {
    const restore = step('actions/cache/restore@');
    const save = step('actions/cache/save@');
    // The command runner reports no per-test files, so Stryker cannot tell that a test changed:
    // only an exact content-hash hit is sound, and a restore-keys fallback is deliberately absent.
    expect(restore?.with?.['key']).toBe(KEY_EXPRESSION);
    expect(save?.with?.['key']).toBe(KEY_EXPRESSION);
    expect(restore?.with?.['restore-keys']).toBeUndefined();
    expect(save?.with?.['restore-keys']).toBeUndefined();
    expect(restore?.with?.['path']).toBe(
      'packages/*/reports/stryker-incremental-*-${{ matrix.shard }}.json',
    );
    expect(save?.with?.['path']).toBe(restore?.with?.['path']);
    expect(save?.if).toContain("github.ref == 'refs/heads/main'");
    const run = steps.findIndex((s) => s.run === 'npm run mutation -- --shard ${{ matrix.shard }}');
    expect(steps.indexOf(keyStep ?? {})).toBeLessThan(steps.indexOf(restore ?? {}));
    expect(steps.indexOf(restore ?? {})).toBeLessThan(run);
    expect(run).toBeLessThan(steps.indexOf(save ?? {}));
  });

  // design: a failing gate must leave its report behind to diagnose the surviving mutants. A job
  // that times out is cancelled, not failed, and `failure()` is false then, so the upload runs on
  // `always()`.
  it('uploads the mutation report even when the job fails or times out', () => {
    const upload = step('actions/upload-artifact@');
    expect(upload?.if).toBe('always()');
    expect(upload?.with).toMatchObject({
      name: 'mutation-report-${{ matrix.shard }}',
      path: 'packages/*/reports/mutation',
    });
  });
});

// design D10: branch protection requires `mutation-gate`, the single name that stays stable when a
// shard is added or removed; it fails unless every shard of the matrix succeeded.
describe('CI mutation aggregate (quality-gates › Mutation gate on core)', () => {
  const gate = workflow.jobs['mutation-gate'];

  it('waits for every shard and runs even when one of them failed or was skipped', () => {
    expect(gate?.needs).toBe('mutation');
    expect(gate?.if).toBe('always()');
    expect(gate?.['continue-on-error']).toBeUndefined();
  });

  it('succeeds only when the whole mutation job result is success', () => {
    expect(gate?.steps).toHaveLength(1);
    expect(gate?.steps[0]).toMatchObject({
      env: { MUTATION_RESULT: '${{ needs.mutation.result }}' },
      run: 'test "$MUTATION_RESULT" = success',
    });
  });
});

describe('Dependency-bot configuration (quality-gates › Dependency-bot major pinning)', () => {
  interface Update {
    'package-ecosystem': string;
    directory: string;
    cooldown?: { 'default-days': number };
    'open-pull-requests-limit'?: number;
    groups?: Record<string, { patterns: string[] }>;
    ignore?: { 'dependency-name': string; 'update-types': string[] }[];
  }
  const config = readYaml('.github/dependabot.yml') as { updates: Update[] };
  const npm = config.updates.find((update) => update['package-ecosystem'] === 'npm');

  // spec: Bot configuration [QG17]
  it.each(['typescript', '@types/node'])('ignores semver-major %s updates', (name) => {
    expect(npm?.ignore).toContainEqual({
      'dependency-name': name,
      'update-types': ['version-update:semver-major'],
    });
  });

  // spec: quality-gates › Dependency-bot major pinning — both ecosystems covered
  it('updates npm (the workspaces, then the browser tooling package) and GitHub Actions', () => {
    expect(config.updates.map((update) => [update['package-ecosystem'], update.directory])).toEqual(
      [
        ['npm', '/'],
        ['npm', '/tooling/site-browser'],
        ['github-actions', '/'],
      ],
    );
  });

  // design: dependency updates are throttled and batched
  it('waits for a cooldown and limits open pull requests on every ecosystem', () => {
    for (const update of config.updates) {
      expect(update.cooldown?.['default-days']).toBeGreaterThanOrEqual(5);
      expect(update['open-pull-requests-limit']).toBeGreaterThan(0);
    }
  });

  // design: dependency updates are throttled and batched
  it('groups the lockstep toolchains so they update together', () => {
    expect(npm?.groups).toMatchObject({
      vitest: { patterns: ['vitest', '@vitest/*'] },
      prettier: { patterns: ['prettier', 'prettier-plugin-*'] },
      eslint: {
        patterns: [
          'eslint',
          '@eslint/*',
          'typescript-eslint',
          'eslint-plugin-*',
          'eslint-config-*',
        ],
      },
    });
  });
});

describe('CI site-browser job (quality-gates › [QGW7], site-quality › [SQ15], [SQ16])', () => {
  const job = workflow.jobs['site-browser'];
  const steps = job?.steps ?? [];
  const step = (prefix: string): Step | undefined =>
    steps.find((candidate) => candidate.uses?.startsWith(prefix));
  const runs = steps.flatMap((candidate) => (candidate.run === undefined ? [] : [candidate.run]));

  it('runs after verify only, on every run, with nothing that can skip it', () => {
    expect(job?.needs).toBe('verify');
    expect(job?.if).toBeUndefined();
    expect(job?.paths).toBeUndefined();
    expect(job?.['paths-ignore']).toBeUndefined();
    expect(job?.permissions).toBeUndefined();
    expect(job?.['continue-on-error']).toBeUndefined();
  });

  it('is bounded to ten minutes and sends no telemetry', () => {
    expect(job?.['timeout-minutes']).toBeLessThanOrEqual(10);
    expect(job?.['timeout-minutes']).toBeGreaterThan(0);
    expect((job as { env?: Record<string, string> } | undefined)?.env).toEqual({
      WRANGLER_SEND_METRICS: 'false',
    });
  });

  it('runs the same dist that verify built, without rebuilding it', () => {
    expect(step('actions/download-artifact@')?.with).toMatchObject({ path: 'apps/web/dist' });
    expect(runs.filter((run) => run.includes('npm run build'))).toEqual([]);
  });

  it('installs Node from .nvmrc and only the tooling package', () => {
    expect(step('actions/setup-node@')?.with).toMatchObject({
      'node-version-file': '.nvmrc',
      cache: 'npm',
      'cache-dependency-path': 'tooling/site-browser/package-lock.json',
    });
    expect(runs).toContain('npm ci --prefix tooling/site-browser');
    expect(runs).not.toContain('npm ci');
  });

  it('caches the browser by the tooling lockfile and installs Chromium only', () => {
    const cache = step('actions/cache@');
    expect(cache?.with?.['path']).toBe('~/.cache/ms-playwright');
    expect(String(cache?.with?.['key'])).toContain(
      "hashFiles('tooling/site-browser/package-lock.json')",
    );
    const install = runs.filter((run) => run.includes('playwright install'));
    expect(install).toHaveLength(1);
    expect(install[0]).toContain('chromium');
    expect(install[0]).not.toMatch(/firefox|webkit/);
  });

  // The cached browser needs the OS packages of the runner image it was installed on: a new image
  // version must miss the cache and reinstall them, not restore a browser that cannot start.
  it('keys the browser cache by the runner image identity too', () => {
    const key = String(step('actions/cache@')?.with?.['key']);
    expect(key).toContain('${{ env.ImageOS }}');
    expect(key).toContain('${{ env.ImageVersion }}');
  });

  // The traces and screenshots of a failed test live in test-results, which the failure upload keeps.
  it('keeps the traces and screenshots of failed tests and uploads them', () => {
    const config = readFileSync(fromRoot('tooling/site-browser/playwright.config.ts'), 'utf8');
    expect(config).toContain("trace: 'retain-on-failure'");
    expect(config).toContain("screenshot: 'only-on-failure'");
    const upload = steps.find(
      (candidate) => candidate.with?.['path'] === 'tooling/site-browser/test-results',
    );
    expect(upload?.if).toBe('failure()');
  });

  // The install with OS packages took 4m18s (apt) on every run. The browser is cached by the
  // lockfile, so the install, with its packages, runs on a cache miss only; a hit restores the
  // headless shell and the runner image already carries the libraries Chrome needs.
  it('installs Chromium and its OS packages only when the browser cache missed', () => {
    const cache = step('actions/cache@');
    const id = cache?.id ?? '';
    expect(id).not.toBe('');
    const install = steps.find((candidate) => candidate.run?.includes('playwright install'));
    expect(install?.if).toBe(`steps.${id}.outputs.cache-hit != 'true'`);
    expect(install?.run).toContain('--with-deps');
    expect(steps.indexOf(install ?? {})).toBeGreaterThan(steps.indexOf(cache ?? {}));
  });

  it('typechecks the tooling package before it runs the browser tests', () => {
    const typecheck = runs.indexOf('npm run typecheck --prefix tooling/site-browser');
    expect(typecheck).toBeGreaterThan(runs.indexOf('npm ci --prefix tooling/site-browser'));
    expect(typecheck).toBeLessThan(runs.indexOf('npm run test:e2e'));
  });

  it('runs the browser tests and uploads reports only on failure', () => {
    expect(runs).toContain('npm run test:e2e');
    const uploads = steps.filter((candidate) =>
      candidate.uses?.startsWith('actions/upload-artifact@'),
    );
    expect(uploads.length).toBeGreaterThan(0);
    for (const upload of uploads) expect(upload.if).toBe('failure()');
  });

  it('runs beside the mutation matrix, never behind it', () => {
    expect([workflow.jobs['mutation']?.needs].flat()).not.toContain('site-browser');
    expect([job?.needs].flat()).not.toContain('mutation');
  });

  it('has verify hand its dist over after the last gate', () => {
    const verifySteps = verify?.steps ?? [];
    const last = verifySteps.at(-1);
    expect(last?.uses?.startsWith('actions/upload-artifact@')).toBe(true);
    expect(last?.with).toMatchObject({ path: 'apps/web/dist' });
    expect(verifySteps.findLast((candidate) => candidate.run !== undefined)?.run).toBe(
      'npm run check:dist',
    );
  });

  it('starts the Wrangler server without telemetry in the Playwright config', () => {
    expect(readFileSync(fromRoot('tooling/site-browser/playwright.config.ts'), 'utf8')).toContain(
      "WRANGLER_SEND_METRICS: 'false'",
    );
  });
});
