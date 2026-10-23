import { describe, expect, it } from 'vitest';
import { contrast } from './contrast.ts';

describe('WCAG contrast ratio', () => {
  it('is 21 for black on white, in either order', () => {
    expect(contrast('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(contrast('#FFFFFF', '#000000')).toBeCloseTo(21, 5);
  });

  it('is 1 for a colour on itself', () => {
    expect(contrast('#0E2240', '#0e2240')).toBeCloseTo(1, 5);
  });

  // #767676 on white is the textbook minimum for AA body text
  it('is 4.54 for #767676 on white', () => {
    expect(contrast('#767676', '#FFFFFF')).toBeCloseTo(4.54, 2);
  });
});
