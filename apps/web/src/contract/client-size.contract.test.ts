import { describe, expect, it } from 'vitest';
import { buildClient } from './__testing__/client-build.ts';
import { fromRoot } from './root.ts';

/** The most the engine surface may weigh minified: 48 KiB less 8 KiB for the page code. */
const ENGINE_BUDGET = 40_960;

/** What the client entry of the concrete page will re-export from the engine (design C17). */
const ENGINE_ENTRY = `
export { concrete } from '${fromRoot('apps/web/src/lib/concrete.ts')}';
export { decode, encode, formatFeetInches, toCents, toDecimalParts } from '@maestro-calc/core';
`;

describe('client engine size (site-quality › [SQ27], design C17)', () => {
  // spec: site-quality › [SQ27]: the minified engine surface leaves room for the page code
  it('fits the engine surface in 40,960 bytes minified and prints the size', async () => {
    const { size } = await buildClient(ENGINE_ENTRY);
    console.info(
      `client engine surface: ${size.toLocaleString('en-US')} B (limit ${ENGINE_BUDGET.toLocaleString('en-US')} B)`,
    );
    expect(size).toBeGreaterThan(1_000);
    expect(size).toBeLessThanOrEqual(ENGINE_BUDGET);
  });

  // spec: site-quality › [SQ27]: the bundle carries no source text and no foreign origin
  it('carries no source name, no source link and no absolute url', async () => {
    const { code } = await buildClient(ENGINE_ENTRY);
    expect(code).not.toMatch(/quikrete/i);
    expect(code).not.toContain('http://');
    expect(code).not.toContain('https://');
  });

  // C17 mitigation step 1 (seeded): the material record must stay off the client path
  it('fails the source-text check when the entry pulls in the material record', async () => {
    const { code } = await buildClient(`
      ${ENGINE_ENTRY}
      export { concreteMix } from '@maestro-calc/data';
    `);
    expect(code).toMatch(/quikrete/i);
    expect(code).toContain('https://');
  });
});
