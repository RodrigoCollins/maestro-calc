import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { SITE } from './site.config.ts';

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

  it('serves the site headers: nosniff, no framing, scripts from the site and the Google tag only', () => {
    const headers = readFileSync(resolve(import.meta.dirname, '../public/_headers'), 'utf8');
    const csp = /Content-Security-Policy: (.+)/.exec(headers)?.[1] ?? '';
    expect(headers).toContain('X-Content-Type-Options: nosniff');
    expect(csp).toContain("script-src 'self' https://www.googletagmanager.com;");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).not.toMatch(/unsafe-eval|script-src[^;]*unsafe-inline/);
  });

  // the Google Analytics loader of Cuenta Horas, byte for byte: one consent and privacy rule for both
  it('loads Google Analytics with the same loader as Cuenta Horas', () => {
    const loader = (app: string) =>
      readFileSync(resolve(import.meta.dirname, `../../${app}/public/analytics.js`), 'utf8');
    expect(loader('pool')).toBe(loader('pay'));
  });

  it('lets robots crawl and points them to the sitemap', () => {
    const robots = readFileSync(resolve(import.meta.dirname, '../public/robots.txt'), 'utf8');
    expect(robots).toBe(
      'User-agent: *\nAllow: /\n\nSitemap: https://poolfigures.com/sitemap.xml\n',
    );
  });
  it('serves the IndexNow key at /<key>.txt, as the deploy job checks before it notifies', () => {
    expect(SITE.indexNowKey).toMatch(/^[0-9a-f]{32}$/);
    const body = readFileSync(
      resolve(import.meta.dirname, `../public/${SITE.indexNowKey}.txt`),
      'utf8',
    );
    expect(body).toBe(SITE.indexNowKey);
  });
  it('serves the Bing Webmaster Tools ownership file at /BingSiteAuth.xml', () => {
    const body = readFileSync(resolve(import.meta.dirname, '../public/BingSiteAuth.xml'), 'utf8');
    expect(body).toBe(
      '<?xml version="1.0"?>\n<users>\n\t<user>4AD8C29368765B41A0003ABF9C79C523</user>\n</users>\n',
    );
  });
});
