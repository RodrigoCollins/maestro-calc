import { describe, expect, it } from 'vitest';
import { bowlSvg, kibbleCount } from './bowl.ts';

describe('kibbleCount', () => {
  it('is one piece for every 40 kilocalories of the day, 6 to 60', () => {
    expect(kibbleCount(400)).toBe(10);
    expect(kibbleCount(984.6)).toBe(25);
    expect(kibbleCount(1000)).toBe(25);
  });

  it('keeps a small meal visible and a large one inside the bowl', () => {
    expect(kibbleCount(0)).toBe(6);
    expect(kibbleCount(100)).toBe(6);
    expect(kibbleCount(240)).toBe(6);
    expect(kibbleCount(280)).toBe(7);
    expect(kibbleCount(2400)).toBe(60);
    expect(kibbleCount(100_000)).toBe(60);
  });
});

describe('bowlSvg', () => {
  const svg = bowlSvg(25);

  it('is a decorative top view: a coral ring, a cream inside and the dashed meal line', () => {
    expect(svg.startsWith('<svg ')).toBe(true);
    expect(svg).toContain('aria-hidden="true"');
    expect(svg).toContain('fill="#ff7a59"');
    expect(svg).toContain('fill="#fff4e0"');
    expect(svg).toContain('stroke-dasharray');
  });

  it('draws as many pieces as asked, each inside the cream', () => {
    const pieces = [...svg.matchAll(/<circle class="kibble" cx="([\d.]+)" cy="([\d.]+)"/g)];
    expect(pieces).toHaveLength(25);
    for (const [, x, y] of pieces) {
      const distance = Math.hypot(Number(x) - 100, Number(y) - 100);
      expect(distance).toBeLessThanOrEqual(66);
    }
  });

  it('draws the same bowl for the same amount', () => {
    expect(bowlSvg(25)).toBe(svg);
    expect(bowlSvg(26)).not.toBe(svg);
  });

  it('shades the pieces in three kibble tones', () => {
    for (const tone of ['#c98b4b', '#e5a55d', '#a56b34']) expect(svg).toContain(tone);
  });
});
