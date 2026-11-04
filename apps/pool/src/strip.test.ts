import { describe, expect, it } from 'vitest';
import { padOf, STRIP } from './strip.ts';

/** The WCAG relative luminance of a `#RRGGBB` colour. */
const luminance = (hex: string): number => {
  const [r = 0, g = 0, b = 0] = [1, 3, 5].map((at) => {
    const channel = Number.parseInt(hex.slice(at, at + 2), 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

describe('STRIP', () => {
  it('offers the free chlorine steps common test strips print', () => {
    expect(STRIP.pads.map(({ ppm }) => ppm)).toEqual(['0', '0.5', '1', '3', '5', '10']);
  });

  it('darkens from one pad to the next, so the pads differ in lightness, not hue alone', () => {
    const shades = STRIP.pads.map(({ color }) => luminance(color));
    for (const [index, shade] of shades.entries()) {
      if (index > 0) expect(shade).toBeLessThan(shades[index - 1] ?? 0);
    }
  });

  it('says the colours are a guide, never a brand’s chart', () => {
    expect(STRIP.note).toMatch(/not .*chart/i);
    expect(STRIP.legend).toMatch(/ppm/);
  });
});

describe('padOf', () => {
  const ppms = STRIP.pads.map(({ ppm }) => ppm);

  it('finds the pad of a reading, however it is typed', () => {
    expect(padOf('1', ppms)).toBe(2);
    expect(padOf(' 1.0 ', ppms)).toBe(2);
    expect(padOf('.5', ppms)).toBe(1);
    expect(padOf('10', ppms)).toBe(5);
  });

  it('finds none for a reading between pads, an empty field or a word', () => {
    expect(padOf('2', ppms)).toBe(-1);
    expect(padOf('', ppms)).toBe(-1);
    expect(padOf('  ', ppms)).toBe(-1);
    expect(padOf('one', ppms)).toBe(-1);
  });
});
