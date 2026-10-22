import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';
import { fromRoot } from './root.ts';

interface Step {
  name?: string;
  uses?: string;
  run?: string;
  with?: Record<string, unknown>;
  'continue-on-error'?: unknown;
}

interface Job {
  steps: Step[];
  permissions?: unknown;
  'timeout-minutes'?: number;
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
