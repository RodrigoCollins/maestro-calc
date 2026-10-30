import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { fromRoot } from './root.ts';

// open-graph: the one image every indexable page names is a 1200 x 630 PNG, as its meta tags say
describe('the Open Graph image (open-graph)', () => {
  it('is a PNG of 1200 by 630 pixels, under 100 KB', () => {
    const png = readFileSync(fromRoot('apps/web/public/og.png'));
    expect(png.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
    // the IHDR chunk follows the signature: width and height are big-endian at bytes 16 and 20
    expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1200, 630]);
    expect(png.length).toBeLessThan(100 * 1024);
  });
});
