import { describe, expect, it } from 'vitest';
import { calendarSvg, RULER_END, rulerPercent } from './strips.ts';

describe('the band ruler', () => {
  it('runs from 0 to 80 mg/kg, so the bands 20, 40 and 60 sit at a quarter, a half and three quarters', () => {
    expect(RULER_END).toBe(80);
    expect(rulerPercent(0)).toBe(0);
    expect(rulerPercent(20)).toBe(25);
    expect(rulerPercent(40)).toBe(50);
    expect(rulerPercent(60)).toBe(75);
    expect(rulerPercent(80)).toBe(100);
  });

  it('puts the marker of a dose past the end at the end, and of a dose below 0 at 0', () => {
    expect(rulerPercent(500)).toBe(100);
    expect(rulerPercent(-3)).toBe(0);
    expect(rulerPercent(7.1875)).toBeCloseTo(8.984, 3);
  });
});

describe('the calendar strip', () => {
  const svg = calendarSvg(58, 72);

  it('is a decorative strip of 11 weeks, one tick a day', () => {
    expect(svg.startsWith('<svg ')).toBe(true);
    expect(svg).toContain('aria-hidden="true"');
    expect([...svg.matchAll(/<rect class="day/g)]).toHaveLength(77);
    expect([...svg.matchAll(/<text /g)]).toHaveLength(11);
  });

  it('shades the days of the window, 58 to 72 inclusive: 15 days', () => {
    expect([...svg.matchAll(/<rect class="day window"/g)]).toHaveLength(15);
    expect([...calendarSvg(64, 66).matchAll(/<rect class="day window"/g)]).toHaveLength(3);
    expect([...calendarSvg(56, 58).matchAll(/<rect class="day window"/g)]).toHaveLength(3);
  });

  it('puts the first window tick under the day it starts, 10 pixels a day', () => {
    expect(svg).toContain('<rect class="day window" x="580"');
    expect(calendarSvg(56, 58)).toContain('<rect class="day window" x="560"');
  });

  it('marks the start of the count', () => {
    expect(svg).toContain('<rect class="day start" x="0"');
  });

  it('labels each week from 1 to 11', () => {
    expect(svg).toContain('>wk 1<');
    expect(svg).toContain('>wk 11<');
  });
});
