import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';
import { fromRoot } from './root.ts';

interface Step {
  id?: string;
  uses?: string;
  run?: string;
  if?: string;
  with?: Record<string, unknown>;
}

interface Workflow {
  on: { push?: { branches?: string[] }; pull_request?: unknown };
  permissions: unknown;
  jobs: Record<
    string,
    {
      steps: Step[];
      permissions?: unknown;
      'timeout-minutes'?: number;
      strategy?: { 'fail-fast'?: boolean; matrix?: { include?: Record<string, string>[] } };
    }
  >;
}

const workflow = parse(readFileSync(fromRoot('.github/workflows/deploy.yml'), 'utf8')) as Workflow;
const steps = Object.values(workflow.jobs).flatMap((job) => job.steps);
/** The steps of one job, by id. */
const idsOf = (job: string): string[] =>
  (workflow.jobs[job]?.steps ?? []).flatMap((step) => (step.id === undefined ? [] : [step.id]));
const ids = idsOf('production');

describe('deploy workflow (site-seo › Post-deploy check and notification)', () => {
  it('runs on pushes to main only', () => {
    expect(workflow.on.push?.branches).toEqual(['main']);
    expect(workflow.on.pull_request).toBeUndefined();
  });

  // spec: site-seo › [IN3]
  it('waits for the build, then smokes, then notifies only when the site changed', () => {
    expect(ids).toEqual(['build', 'smoke', 'changed', 'indexnow']);
    const step = (id: string): Step | undefined => steps.find((each) => each.id === id);
    expect(step('build')?.run).toContain('Workers%20Builds:%20maestro-calc');
    expect(step('smoke')?.run).toBe('node apps/web/scripts/production.ts smoke');
    expect(step('indexnow')?.run).toBe('node apps/web/scripts/production.ts indexnow');
    expect(step('indexnow')?.if).toBe("steps.changed.outputs.site == 'true'");
    expect(step('smoke')?.if).toBe("steps.build.outputs.superseded != 'true'");
    expect(['build', 'changed'].map((id) => step(id)?.if)).toEqual([undefined, undefined]);
  });

  // Three merges within minutes (2026-11-05): Cloudflare built only the newest commit, so the
  // middle push waited 20 minutes for a build that never came and failed. A push that main has
  // moved past and that has no build of its own is superseded: the newer run smokes the site,
  // and this run still notifies its own changes, which the newer run's compare does not see.
  it('treats a push with no build of its own as superseded once main has moved past it', () => {
    const waits = Object.values(workflow.jobs).flatMap((job) =>
      job.steps.filter((step) => step.id === 'build'),
    );
    expect(waits).toHaveLength(2);
    for (const wait of waits) {
      expect(wait.run).toContain('head=$(gh api "repos/$REPO/commits/main" --jq .sha)');
      expect(wait.run).toMatch(
        /if \[ -z "\$run" \] && \[ -n "\$head" \] && \[ "\$head" != "\$SHA" \]; then[\s\S]*?echo "superseded=true" >> "\$GITHUB_OUTPUT"; exit 0/,
      );
    }
  });

  // A 502 from the GitHub API once failed a deploy under `bash -e` (2026-11-04): a failed poll is
  // a "not yet", so the 20-minute loop keeps waiting instead of stopping on the first error.
  it('keeps polling the build when one GitHub API call fails', () => {
    const waits = Object.values(workflow.jobs).flatMap((job) =>
      job.steps.filter((step) => step.id === 'build'),
    );
    expect(waits).toHaveLength(2);
    for (const wait of waits) {
      expect(wait.run).toMatch(/run=\$\(gh api [\s\S]*?\) \|\| run=''/);
    }
  });

  // spec: site-seo › [IN4]
  it('holds read-only contents and checks, pins every action and keeps no token', () => {
    expect(workflow.permissions).toEqual({ contents: 'read', checks: 'read' });
    for (const job of Object.values(workflow.jobs)) {
      expect(job.permissions).toBeUndefined();
      expect(job['timeout-minutes']).toBeLessThanOrEqual(30);
    }
    const uses = steps.flatMap((step) => (step.uses === undefined ? [] : [step]));
    expect(uses.length).toBeGreaterThan(0);
    for (const step of uses) expect(step.uses).toMatch(/^[\w.-]+\/[\w.-]+@[0-9a-f]{40}$/);
    const checkout = uses.find((step) => step.uses?.startsWith('actions/checkout@'));
    expect(checkout?.with).toMatchObject({ 'persist-credentials': false });
  });

  // plans/growth/PLAN.md › G3: every niche site pings IndexNow from its live sitemap after its build
  it('notifies IndexNow for each niche site once its own build is green and it changed', () => {
    const job = workflow.jobs['niche-sites'];
    expect(job?.strategy?.['fail-fast']).toBe(false);
    expect(job?.strategy?.matrix?.include).toEqual([
      { app: 'pay', worker: 'cuenta-horas' },
      { app: 'pool', worker: 'pool-figures' },
      { app: 'lawn', worker: 'lawn-figures' },
    ]);
    expect(idsOf('niche-sites')).toEqual(['build', 'changed', 'indexnow']);
    const step = (id: string) => job?.steps.find((candidate) => candidate.id === id);
    expect(step('build')?.run).toContain('Workers%20Builds:%20${{ matrix.worker }}');
    expect(step('changed')?.run).toContain('^(apps/${{ matrix.app }}|packages)/');
    expect(step('indexnow')?.run).toBe('node apps/${{ matrix.app }}/scripts/indexnow.ts');
    expect(step('indexnow')?.if).toBe("steps.changed.outputs.site == 'true'");
  });
});
