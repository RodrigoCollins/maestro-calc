import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';
import { ROUTES } from '../routing/routes.ts';
import { CALCULATOR_PAGES } from '../routing/templates.ts';
import { fromRoot, importFromRoot } from './root.ts';

interface Lighthouserc {
  ci: {
    collect: {
      url: string[];
      numberOfRuns: number;
      startServerCommand: string;
      startServerReadyPattern: string;
      settings?: { chromeFlags?: string };
    };
    assert: { assertions: Record<string, unknown> };
    upload: { target: string };
  };
}

interface Step {
  uses?: string;
  run?: string;
  if?: string;
  with?: Record<string, unknown>;
}

const read = (path: string): string => readFileSync(fromRoot(path), 'utf8');
const rc = JSON.parse(read('tooling/site-browser/lighthouserc.json')) as Lighthouserc;
const workflow = parse(read('.github/workflows/ci.yml')) as {
  jobs: Record<string, { steps: Step[]; 'timeout-minutes'?: number }>;
};
const steps = workflow.jobs['site-browser']?.steps ?? [];

describe('Lighthouse CI configuration (site-quality › [SQ9])', () => {
  it('audits the six pages, once each, in both locales', () => {
    expect(rc.ci.collect.url.map((url) => new URL(url).pathname)).toEqual([
      '/',
      '/es',
      '/methodology',
      '/es/metodologia',
      '/concrete-calculator',
      '/es/calculadora-de-concreto',
    ]);
    expect(rc.ci.collect.numberOfRuns).toBe(1);
  });

  it('serves the build with the e2e Wrangler config and no telemetry, on the audited origin', () => {
    const { startServerCommand, url } = rc.ci.collect;
    expect(startServerCommand).toContain('wrangler dev --config wrangler.e2e.jsonc');
    expect(startServerCommand).toContain('WRANGLER_SEND_METRICS=false');
    for (const page of url) expect(new URL(page).origin).toBe('http://127.0.0.1:8787');
    expect(startServerCommand).toContain('--port 8787 --ip 127.0.0.1');
  });

  it('blocks on accessibility, SEO and best practices at 0.95 and on layout shift at 0.01', () => {
    const { assertions } = rc.ci.assert;
    for (const category of ['accessibility', 'seo', 'best-practices']) {
      expect(assertions[`categories:${category}`]).toEqual(['error', { minScore: 0.95 }]);
    }
    expect(assertions['cumulative-layout-shift']).toEqual(['error', { maxNumericValue: 0.01 }]);
  });

  it('only warns on performance (the CI runner is noisy)', () => {
    expect(rc.ci.assert.assertions['categories:performance']).toEqual(['warn', { minScore: 0.95 }]);
    expect(Object.keys(rc.ci.assert.assertions).sort()).toEqual([
      'categories:accessibility',
      'categories:best-practices',
      'categories:performance',
      'categories:seo',
      'cumulative-layout-shift',
    ]);
  });

  it('keeps the reports on disk', () => {
    expect(rc.ci.upload.target).toBe('filesystem');
  });

  it('pins the Lighthouse CI CLI exactly, in the tooling package only', () => {
    const tooling = JSON.parse(read('tooling/site-browser/package.json')) as {
      devDependencies: Record<string, string>;
      scripts: Record<string, string>;
    };
    expect(tooling.devDependencies['@lhci/cli']).toMatch(/^\d+\.\d+\.\d+$/);
    expect(tooling.scripts['lighthouse']).toBe('lhci autorun');
    expect(read('package-lock.json')).not.toContain('@lhci/cli');
  });

  it('has a root script that runs it in the tooling package', () => {
    const root = JSON.parse(read('package.json')) as { scripts: Record<string, string> };
    expect(root.scripts['lighthouse']).toBe('npm run lighthouse --prefix tooling/site-browser');
  });

  it('keeps its output out of git', () => {
    expect(read('.gitignore').split('\n')).toContain('.lighthouseci');
  });
});

/** What is wrong with the representative calculator page against the audited URLs, one line each. */
const representativeProblems = (
  id: string,
  urls: readonly string[],
  pages: readonly string[] = CALCULATOR_PAGES,
  routes: Readonly<Record<string, { en: string; es: string }>> = ROUTES,
): string[] => {
  const paths = urls.map((url) => new URL(url).pathname);
  const entry = routes[id];
  return [
    ...(pages.includes(id) ? [] : [`${id} is not a calculator page of the table`]),
    ...(entry === undefined
      ? []
      : [entry.en, entry.es]
          .filter((path) => !paths.includes(path))
          .map((path) => `${path} is not audited`)),
  ];
};

describe('Lighthouse representative calculator page (site-quality › [SQ25])', () => {
  // spec: site-quality › [SQ25] one representative page per template, named once, in two locales
  it('audits both paths of the representative calculator page named in the browser tooling', async () => {
    const { REPRESENTATIVE } = await importFromRoot<{ REPRESENTATIVE: string }>(
      'tooling/site-browser/e2e/representative.ts',
    );
    expect(REPRESENTATIVE).toBe('concrete');
    expect(representativeProblems(REPRESENTATIVE, rc.ci.collect.url)).toEqual([]);
  });

  it('names the page that is not a calculator page of the table', () => {
    expect(representativeProblems('about', rc.ci.collect.url)).toEqual([
      'about is not a calculator page of the table',
      '/about is not audited',
      '/es/sobre-nosotros is not audited',
    ]);
  });

  it('names a representative path that Lighthouse does not audit', () => {
    const urls = rc.ci.collect.url.filter((url) => !url.endsWith('/es/calculadora-de-concreto'));
    expect(representativeProblems('concrete', urls)).toEqual([
      '/es/calculadora-de-concreto is not audited',
    ]);
  });
});

describe('CI Lighthouse step (site-quality › [SQ15])', () => {
  const runs = steps.flatMap((step) => (step.run === undefined ? [] : [step.run]));

  it('runs after the Playwright step, on the runner Chrome, with no browser download of its own', () => {
    expect(runs).toContain('npm run lighthouse');
    expect(runs.indexOf('npm run lighthouse')).toBeGreaterThan(runs.indexOf('npm run test:e2e'));
    expect(runs.filter((run) => run.includes('install') && /chrom/i.test(run))).toEqual([
      'npx --prefix tooling/site-browser playwright install --with-deps --only-shell chromium',
    ]);
  });

  it('uploads the reports only when the job fails', () => {
    const uploads = steps.filter((step) => step.uses?.startsWith('actions/upload-artifact@'));
    const reports = uploads.filter((step) => String(step.with?.['path']).includes('.lighthouseci'));
    expect(reports).toHaveLength(1);
    expect(reports[0]?.if).toBe('failure()');
  });

  it('stays inside the fifteen-minute limit of the job', () => {
    expect(workflow.jobs['site-browser']?.['timeout-minutes']).toBeLessThanOrEqual(15);
  });
});
