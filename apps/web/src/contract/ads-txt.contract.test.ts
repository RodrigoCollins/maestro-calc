import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SITE } from '../site.config.ts';
import { fromRoot } from './root.ts';

// adsense-verify: /ads.txt authorizes the one AdSense publisher of the site, the id of the config
describe('ads.txt (adsense-verify)', () => {
  it('holds exactly the Google line of the configured publisher, DIRECT, with the Google TAG id', () => {
    const text = readFileSync(fromRoot('apps/web/public/ads.txt'), 'utf8');
    const publisher = SITE.adsenseClient.replace(/^ca-/, '');
    expect(text).toBe(`google.com, ${publisher}, DIRECT, f08c47fec0942fa0\n`);
  });
});
