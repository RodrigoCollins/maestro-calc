import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SITE } from '../site.config.ts';
import { fromRoot } from './root.ts';

// Written in two parts so this file does not contain the retired address itself.
const RETIRED_ADDRESS = 'hello' + '@maestrocalc.com';

const filesUnder = (dir: string): string[] =>
  readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => join(entry.parentPath, entry.name));

describe('site config (site-shell › contact address, trust-pages › [TP18] source side)', () => {
  it('uses the contacto@ address', () => {
    expect(SITE.contactEmail).toBe('contacto@maestrocalc.com');
  });

  it('carries no placeholder tagline or unused locale', () => {
    expect('tagline' in SITE).toBe(false);
    expect('locale' in SITE).toBe(false);
    // @ts-expect-error the tagline lives in the site catalog, not in the config
    expect(SITE.tagline).toBeUndefined();
  });

  it.each(['apps/web/src', 'apps/web/public'])(
    'has the retired address nowhere under %s',
    (dir) => {
      const files = filesUnder(fromRoot(dir));
      expect(files.length).toBeGreaterThan(0);
      const offenders = files.filter((file) =>
        readFileSync(file, 'latin1').includes(RETIRED_ADDRESS),
      );
      expect(offenders).toEqual([]);
    },
  );
});
