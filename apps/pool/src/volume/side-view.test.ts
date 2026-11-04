import { describe, expect, it } from 'vitest';
import { depthText, sideViewOf, SIDE_VIEW } from './side-view.ts';

describe('depthText', () => {
  it('reads a depth the way a pool depth marker does', () => {
    expect(depthText(96)).toBe('8 FT');
    expect(depthText(42)).toBe('3½ FT');
    expect(depthText(43)).toBe('3 FT 7 IN');
    expect(depthText(6)).toBe('½ FT');
    expect(depthText(9)).toBe('9 IN');
    expect(depthText(0)).toBe('0 FT');
    expect(depthText(384)).toBe('32 FT');
  });

  it('rounds to the nearest inch and carries a full foot', () => {
    expect(depthText(47.6)).toBe('4 FT');
    expect(depthText(42.4)).toBe('3½ FT');
  });
});

describe('sideViewOf', () => {
  it('fixes the frame the page reserves', () => {
    expect(SIDE_VIEW).toEqual({ width: 330, height: 170 });
  });

  it('draws the default pool: the deep end at full depth, the shallow end in proportion', () => {
    // 32 ft long, 3½ ft and 8 ft: the deep end is the 116 units under the waterline at 34, so
    // the floor is at 150; the shallow end is 42 / 96 x 116 = 50.75, the floor at 84.75 -> 84.8
    const view = sideViewOf({ length: 384, shallow: 42, deep: 96 });
    expect(view.water).toBe('M8 34V84.8H190L250 150H322V34Z');
    expect(view.wall).toBe('M8 26V84.8H190L250 150H322V26');
    expect(view.length).toBe('32 FT');
    // 5 characters: 10 + 7 x 5 = 45 wide at the left wall (x 14), its text centred at 36.5;
    // 4 characters: 38 wide, ending 6 before the right wall (x 316 - 38 = 278), text at 297
    expect(view.markers).toEqual([
      { x: 14, width: 45, center: 36.5, text: '3½ FT' },
      { x: 278, width: 38, center: 297, text: '8 FT' },
    ]);
    expect(view.name).toBe(
      'Side view of the pool, not to scale: 32 ft long, 3½ ft deep at the shallow end and 8 ft at the deep end',
    );
  });

  it('scales to whichever end is deeper', () => {
    // 4 ft over 6 ft: the left end is the full 116 (floor 150), the right 4 / 6 x 116 = 77.33 -> 111.3
    const view = sideViewOf({ length: 240, shallow: 72, deep: 48 });
    expect(view.water).toBe('M8 34V150H190L250 111.3H322V34Z');
  });

  it('draws a flat floor when both ends are the same depth', () => {
    const view = sideViewOf({ length: 240, shallow: 48, deep: 48 });
    expect(view.water).toBe('M8 34V150H190L250 150H322V34Z');
  });

  it('keeps room for the marker under a very shallow end, and for an empty pool', () => {
    // 1 ft of 10 ft would be 11.6 units: the floor stays 30 under the waterline, at 64
    expect(sideViewOf({ length: 240, shallow: 12, deep: 120 }).water).toBe(
      'M8 34V64H190L250 150H322V34Z',
    );
    expect(sideViewOf({ length: 0, shallow: 0, deep: 0 }).water).toBe(
      'M8 34V64H190L250 64H322V34Z',
    );
  });
});
