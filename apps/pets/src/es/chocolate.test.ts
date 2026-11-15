import { describe, expect, it } from 'vitest';
import { CHOCOLATE_GUIDE } from '../chocolate-guide.ts';
import { CASES_ES, CHOCOLATE_GUIDE_ES } from './chocolate.ts';
import { SOURCES_ES } from './foods/sources.ts';

describe('the Spanish chocolate guide', () => {
  it('lives at the measured search and answers it first', () => {
    expect(CHOCOLATE_GUIDE_ES.path).toBe('/es/que-pasa-si-un-perro-come-chocolate');
    expect(CHOCOLATE_GUIDE_ES.title).toMatch(/^¿Qué pasa si un perro come chocolate\?/);
    expect(CHOCOLATE_GUIDE_ES.title.length).toBeLessThanOrEqual(65);
    expect(CHOCOLATE_GUIDE_ES.description.length).toBeGreaterThanOrEqual(50);
    expect(CHOCOLATE_GUIDE_ES.description.length).toBeLessThanOrEqual(160);
    expect(CHOCOLATE_GUIDE_ES.lead).toMatch(/^Puede intoxicarse/);
    expect(CHOCOLATE_GUIDE_ES.callNow).toBe(true);
  });

  it('works each case through the chocolate engine in grams and kilograms', () => {
    // 25 g of dark chocolate at Merck's 5.6 mg/g is 140 mg: 28 mg/kg for 5 kg, 14 for 10, 7 for 20
    const dark = CASES_ES.find(({ id }) => id === 'dark');
    expect(dark?.totalMg).toBe('140');
    expect(dark?.rows.map(({ dose, band }) => [dose, band])).toEqual([
      ['28', 1],
      ['14', 0],
      ['7', 0],
    ]);
    // 10 g of cocoa powder at 28.5 mg/g is 285 mg: 57 mg/kg for a 5 kg dog, the heart band
    const cocoa = CASES_ES.find(({ id }) => id === 'cocoa');
    expect(cocoa?.rows[0]).toMatchObject({ dose: '57', band: 2 });
    // 50 g of milk chocolate at 2.3 mg/g is 115 mg: 23 mg/kg for 5 kg
    expect(CASES_ES.find(({ id }) => id === 'milk')?.rows[0]).toMatchObject({ dose: '23' });
  });

  it('opens the calculator with each case filled in, in kilograms and grams', () => {
    for (const { link } of CASES_ES) {
      expect(link.href).toMatch(/^\/dog-chocolate-toxicity-calculator\?/);
      expect(link.href).toContain('wu=kg');
      expect(link.href).toContain('au=g');
    }
  });

  it('cites every source of the English guide and the Spanish edition of the MSD manual', () => {
    const urls = CHOCOLATE_GUIDE_ES.sources.map(({ url }) => url);
    for (const { url } of CHOCOLATE_GUIDE.sources) expect(urls, url).toContain(url);
    expect(urls).toContain(SOURCES_ES.msdChocolate.url);
    expect(urls).toContain(SOURCES_ES.cituc.url);
  });
});
