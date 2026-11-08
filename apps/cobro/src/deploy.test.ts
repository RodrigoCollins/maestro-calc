import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { embedHeaderProblems } from '@maestro-calc/site-kit/embed';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { SITE } from './site.config.ts';

// Cuánto Le Cobro deploys like Maestro Calc, Cuenta Horas and Pool Figures: static assets on Workers
// Builds, from `apps/cobro/wrangler.jsonc` (the Workers Builds deploy command points at it).
const jsonc = (path: string): { config?: unknown; error?: ts.Diagnostic } =>
  ts.parseConfigFileTextToJson(path, readFileSync(resolve(import.meta.dirname, path), 'utf8'));
const parsed = jsonc('../wrangler.jsonc');
// The browser tests serve the built dist through their own copy, without the build command.
const e2e = jsonc('../../../tooling/site-browser/wrangler.cobro.e2e.jsonc');
const file = (path: string): string => readFileSync(resolve(import.meta.dirname, path), 'utf8');

describe('apps/cobro/wrangler.jsonc', () => {
  it('parses and names the Worker cuanto-le-cobro', () => {
    expect(parsed.error).toBeUndefined();
    expect(parsed.config).toMatchObject({ name: 'cuanto-le-cobro' });
  });

  it('builds this workspace and serves its dist as assets only, with the Maestro Calc rules', () => {
    expect(parsed.config).toMatchObject({
      build: { command: 'npm run build -w @maestro-calc/cobro' },
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
      assets: { ...assets, directory: '../../apps/cobro/dist' },
    });
    expect(e2e.config).not.toHaveProperty('build');
  });

  it('serves the site headers: nosniff, no framing, scripts from the site and the Google tag only', () => {
    const headers = file('../public/_headers');
    const csp = /Content-Security-Policy: (.+)/.exec(headers)?.[1] ?? '';
    expect(headers).toContain('X-Content-Type-Options: nosniff');
    expect(csp).toContain("script-src 'self' https://www.googletagmanager.com;");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).not.toMatch(/unsafe-eval|script-src[^;]*unsafe-inline/);
  });

  // the Google Analytics loader of Cuenta Horas, byte for byte: one consent and privacy rule for all
  it('loads Google Analytics with the same loader as Cuenta Horas and Pool Figures', () => {
    const loader = (app: string) => file(`../../${app}/public/analytics.js`);
    expect(loader('cobro')).toBe(loader('pay'));
    expect(loader('cobro')).toBe(loader('pool'));
  });

  // growth lever 2: the embeds are the one thing other sites may frame (`@maestro-calc/site-kit/embed`)
  it('lets other sites frame the embeds only, with the site policy and no analytics host', () => {
    expect(embedHeaderProblems(file('../public/_headers'))).toEqual([]);
  });

  it('lets robots crawl and points them to the sitemap', () => {
    expect(file('../public/robots.txt')).toBe(
      'User-agent: *\nAllow: /\n\nSitemap: https://cuantolecobro.com/sitemap.xml\n',
    );
  });

  it('authorizes the same AdSense publisher as Maestro Calc in ads.txt', () => {
    expect(file('../public/ads.txt')).toBe(
      'google.com, pub-3954387285316164, DIRECT, f08c47fec0942fa0\n',
    );
  });

  it('serves the IndexNow key at /<key>.txt, as the deploy job checks before it notifies', () => {
    expect(SITE.indexNowKey).toMatch(/^[0-9a-f]{32}$/);
    expect(file(`../public/${SITE.indexNowKey}.txt`)).toBe(SITE.indexNowKey);
  });
});
