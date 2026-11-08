import { describe, expect, it } from 'vitest';
import { areaText } from './measure.ts';

describe('areaText', () => {
  it('multiplies a length and a width in feet', () => {
    expect(areaText('50', '24')).toBe('1,200');
    expect(areaText(' 12.5 ', '10')).toBe('125');
    expect(areaText('33.3', '10.1')).toBe('336.33');
  });

  it('is zero while a side is empty, unreadable or negative', () => {
    expect(areaText('', '10')).toBe('0');
    expect(areaText('50', 'x')).toBe('0');
    expect(areaText('-5', '10')).toBe('0');
  });
});
