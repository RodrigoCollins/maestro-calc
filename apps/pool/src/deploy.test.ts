import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

// Pool Figures deploys like Maestro Calc and Cuenta Horas: static assets on Workers Builds, from
// `apps/pool/wrangler.jsonc` (the Workers Builds deploy command points at it).
const jsonc = (path: string): { config?: unknown; error?: ts.Diagnostic } =>
  ts.parseConfigFileTextToJson(path, readFileSync(resolve(import.meta.dirname, path), 'utf8'));
const parsed = jsonc('../wrangler.jsonc');
// The browser tests serve the built dist through their own copy, without the build command.
const e2e = jsonc('../../../tooling/site-browser/wrangler.pool.e2e.jsonc');

describe('apps/pool/wrangler.jsonc', () => {
  it('parses and names the Worker pool-figures', () => {
    expect(parsed.error).toBeUndefined();
    expect(parsed.config).toMatchObject({ name: 'pool-figures' });
  });

  it('builds this workspace and serves its dist as assets only, with the Maestro Calc rules', () => {
    expect(parsed.config).toMatchObject({
      build: { command: 'npm run build -w @maestro-calc/pool' },
      previews: {},
      assets: {
        directory: './dist',
        html_handling: 'drop-trailing-slash',
        not_found_handling: '404-page',
      },
    });
    expect(parsed.config).not.toHaveProperty('main');
  });

  it('is served to the browser tests with the same name and asset rules', () => {
    expect(e2e.error).toBeUndefined();
    const { assets, name } = parsed.config as { assets: Record<string, string>; name: string };
    expect(e2e.config).toMatchObject({
      name,
      assets: { ...assets, directory: '../../apps/pool/dist' },
    });
    expect(e2e.config).not.toHaveProperty('build');
  });

  it('serves the site headers: nosniff, no framing and same-origin scripts only', () => {
    const headers = readFileSync(resolve(import.meta.dirname, '../public/_headers'), 'utf8');
    const csp = /Content-Security-Policy: (.+)/.exec(headers)?.[1] ?? '';
    expect(headers).toContain('X-Content-Type-Options: nosniff');
    expect(csp).toContain("script-src 'self';");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).not.toMatch(/unsafe-eval|script-src[^;]*unsafe-inline/);
  });

  it('lets robots crawl and points them to the sitemap', () => {
    const robots = readFileSync(resolve(import.meta.dirname, '../public/robots.txt'), 'utf8');
    expect(robots).toBe(
      'User-agent: *\nAllow: /\n\nSitemap: https://poolfigures.com/sitemap.xml\n',
    );
  });
});
