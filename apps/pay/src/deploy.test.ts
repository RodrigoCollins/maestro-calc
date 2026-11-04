import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { SITE } from './site.config.ts';

// second-site-foundation: Cuenta Horas deploys like Maestro Calc, static assets on Workers Builds,
// from `apps/pay/wrangler.jsonc` (the Workers Builds deploy command points at it).
const jsonc = (path: string): { config?: unknown; error?: ts.Diagnostic } =>
  ts.parseConfigFileTextToJson(path, readFileSync(resolve(import.meta.dirname, path), 'utf8'));
const parsed = jsonc('../wrangler.jsonc');
// The browser tests serve the built dist through their own copy, without the build command.
const e2e = jsonc('../../../tooling/site-browser/wrangler.pay.e2e.jsonc');

describe('apps/pay/wrangler.jsonc', () => {
  it('parses and names the Worker cuenta-horas', () => {
    expect(parsed.error).toBeUndefined();
    expect(parsed.config).toMatchObject({ name: 'cuenta-horas' });
  });

  it('builds this workspace and serves its dist as assets only, with the Maestro Calc rules', () => {
    expect(parsed.config).toMatchObject({
      build: { command: 'npm run build -w @maestro-calc/pay' },
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
      assets: { ...assets, directory: '../../apps/pay/dist' },
    });
  });

  it('serves the site headers: nosniff, no framing, scripts from the site and the Google tag only', () => {
    const headers = readFileSync(resolve(import.meta.dirname, '../public/_headers'), 'utf8');
    const csp = /Content-Security-Policy: (.+)/.exec(headers)?.[1] ?? '';
    expect(headers).toContain('X-Content-Type-Options: nosniff');
    expect(csp).toContain("script-src 'self' https://www.googletagmanager.com;");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).not.toMatch(/unsafe-eval|script-src[^;]*unsafe-inline/);
  });

  it('lets robots crawl and points them at the sitemap', () => {
    const robots = readFileSync(resolve(import.meta.dirname, '../public/robots.txt'), 'utf8');
    expect(robots).toBe('User-agent: *\nAllow: /\nSitemap: https://cuentahoras.com/sitemap.xml\n');
  });

  it('authorizes the same AdSense publisher as Maestro Calc in ads.txt', () => {
    const ads = readFileSync(resolve(import.meta.dirname, '../public/ads.txt'), 'utf8');
    expect(ads).toBe('google.com, pub-3954387285316164, DIRECT, f08c47fec0942fa0\n');
  });
  it('serves the IndexNow key at /<key>.txt, as the deploy job checks before it notifies', () => {
    expect(SITE.indexNowKey).toMatch(/^[0-9a-f]{32}$/);
    const body = readFileSync(
      resolve(import.meta.dirname, `../public/${SITE.indexNowKey}.txt`),
      'utf8',
    );
    expect(body).toBe(SITE.indexNowKey);
  });
});
