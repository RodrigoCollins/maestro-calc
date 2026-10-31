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
  jobs: Record<string, { steps: Step[]; permissions?: unknown; 'timeout-minutes'?: number }>;
}

const workflow = parse(readFileSync(fromRoot('.github/workflows/deploy.yml'), 'utf8')) as Workflow;
const steps = Object.values(workflow.jobs).flatMap((job) => job.steps);
const ids = steps.flatMap((step) => (step.id === undefined ? [] : [step.id]));

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
    expect(['build', 'smoke', 'changed'].map((id) => step(id)?.if)).toEqual([
      undefined,
      undefined,
      undefined,
    ]);
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
});
