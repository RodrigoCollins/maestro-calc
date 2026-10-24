import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';
import { fromRoot } from './root.ts';

const agents = readFileSync(fromRoot('AGENTS.md'), 'utf8');
const configText = readFileSync(fromRoot('openspec/config.yaml'), 'utf8');
const config = parse(configText) as {
  testing: {
    layers: { e2e: { available: boolean; tool: string | null } };
    lighthouse: { available: boolean; command: string };
  };
};

describe('docs reflect the site scripts (monorepo-workspace › [MWW5])', () => {
  it.each(['check:site', 'test:e2e', 'lighthouse'])(
    'mentions %s in AGENTS.md and openspec/config.yaml',
    (script) => {
      expect(agents).toContain(script);
      expect(configText).toContain(script);
    },
  );

  it('lists the browser tests as available in the testing layers', () => {
    expect(config.testing.layers.e2e).toMatchObject({ available: true, tool: 'playwright' });
  });

  it('documents the byte budgets and the Lighthouse audit (site-quality › [SQ6], [SQ9])', () => {
    expect(config.testing.lighthouse).toMatchObject({
      available: true,
      command: 'npm run lighthouse',
    });
    for (const text of [agents, configText]) {
      expect(text).toContain('40,960');
      expect(text).toContain('163,840');
    }
    expect(agents).toContain('npm run lighthouse');
  });

  it('lists the root scripts as bullets, one per script, and names the one pinned count', () => {
    const bullets = agents.split('\n').filter((line) => line.startsWith('- `npm'));
    for (const script of ['dev', 'build', 'check:site', 'test:e2e', 'lighthouse', 'verify']) {
      expect(bullets.filter((line) => line.startsWith(`- \`npm run ${script}\``))).toHaveLength(1);
    }
    expect(agents).toContain('end-state.contract.test.ts');
    expect(agents).toMatch(/only pinned count/);
  });

  it('tells a newcomer how to install the browser tooling and why it is outside the workspaces', () => {
    expect(agents).toContain('npm ci --prefix tooling/site-browser');
    expect(agents).toContain('playwright install');
    expect(agents).toContain('tooling/site-browser');
  });
});
