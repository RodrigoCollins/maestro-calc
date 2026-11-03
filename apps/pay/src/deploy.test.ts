import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

// second-site-foundation: Cuenta Horas deploys like Maestro Calc, static assets on Workers Builds,
// from `apps/pay/wrangler.jsonc` (the Workers Builds deploy command points at it).
const text = readFileSync(resolve(import.meta.dirname, '../wrangler.jsonc'), 'utf8');
const parsed: { config?: unknown; error?: ts.Diagnostic } = ts.parseConfigFileTextToJson(
  'wrangler.jsonc',
  text,
);

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
});
