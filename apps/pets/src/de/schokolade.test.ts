import { describe, expect, it } from 'vitest';
import { CHOCOLATE_GUIDE } from '../chocolate-guide.ts';
import { CASES_DE, SCHOKOLADE_GUIDE } from './schokolade.ts';

describe('the German chocolate guide', () => {
  it('lives at its German address and fits a search result', () => {
    expect(SCHOKOLADE_GUIDE.path).toBe('/de/hund-hat-schokolade-gefressen');
    expect(SCHOKOLADE_GUIDE.title.length).toBeLessThanOrEqual(65);
    expect(SCHOKOLADE_GUIDE.description.length).toBeGreaterThanOrEqual(50);
    expect(SCHOKOLADE_GUIDE.description.length).toBeLessThanOrEqual(160);
    expect(SCHOKOLADE_GUIDE.callNow).toBe(true);
  });

  it('works each case through the chocolate engine in grams and kilograms', () => {
    // 25 g of dark chocolate at Merck's 5.6 mg/g is 140 mg: 28 mg/kg for 5 kg, 14 for 10, 7 for 20
    const dark = CASES_DE.find(({ id }) => id === 'dark');
    expect(dark?.totalMg).toBe('140');
    expect(dark?.rows.map(({ dose, band }) => [dose, band])).toEqual([
      ['28', 1],
      ['14', 0],
      ['7', 0],
    ]);
    // 10 g of cocoa powder at 28.5 mg/g is 285 mg: 57 mg/kg for a 5 kg dog, the heart band
    const cocoa = CASES_DE.find(({ id }) => id === 'cocoa');
    expect(cocoa?.rows[0]).toMatchObject({ dose: '57', band: 2 });
  });

  it('opens the calculator with each case filled in, in kilograms and grams', () => {
    for (const { link } of CASES_DE) {
      expect(link.href).toMatch(/^\/dog-chocolate-toxicity-calculator\?/);
      expect(link.href).toContain('wu=kg');
      expect(link.href).toContain('au=g');
    }
  });

  it('cites every source of the English guide and the German-language ones beside them', () => {
    const urls = SCHOKOLADE_GUIDE.sources.map(({ url }) => url);
    for (const { url } of CHOCOLATE_GUIDE.sources) expect(urls, url).toContain(url);
    expect(urls).toContain('https://www.vetpharm.uzh.ch/CLINITOX/TOXDB/KLT_063.htm');
    expect(urls).toContain('https://www.toxinfo.ch/tiervergiftung');
  });
});
