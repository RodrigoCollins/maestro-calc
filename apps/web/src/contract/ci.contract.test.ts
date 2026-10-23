import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';
import { fromRoot, importFromRoot } from './root.ts';

interface Step {
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
  strategy?: { 'fail-fast'?: boolean; matrix?: { shard?: string[] } };
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
      'npm run check:dist',
    ]);
    for (const job of Object.values(workflow.jobs)) {
      expect(job['continue-on-error']).toBeUndefined();
      for (const step of job.steps) {
        expect(step['continue-on-error']).toBeUndefined();
      }
    }
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
    expect(mutation?.strategy?.matrix?.shard).toEqual(shardNames);
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
  it('computes one cache key from a superset of the mutation inputs', () => {
    expect(keyStep?.run).toContain('${RUNNER_OS}');
    // one key (and one report) per shard: the shards never overwrite each other's cache
    expect(keyStep?.run).toContain('${{ matrix.shard }}');
    for (const input of [
      'packages/core/src/**',
      'packages/core/*.json',
      'packages/core/stryker.config.mjs',
      'packages/core/vitest.config.ts',
      'packages/data/src/**',
      'packages/data/*.json',
      'packages/data/stryker.config.mjs',
      'packages/data/vitest.config.ts',
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
  it('updates both npm and GitHub Actions', () => {
    expect(config.updates.map((update) => update['package-ecosystem'])).toEqual([
      'npm',
      'github-actions',
    ]);
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
