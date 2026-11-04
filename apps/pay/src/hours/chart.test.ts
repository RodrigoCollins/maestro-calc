import { describe, expect, it } from 'vitest';
import { CHART_ROWS, chartOf } from './chart.ts';

// Hand-verified: minutes / 60 to two places, to the nearest: 1 is 0.0166.. so 0.02, 20 is 0.33,
// 45 is 0.75, 59 is 0.983.. so 0.98.
describe('the minutes to decimal hours chart', () => {
  const chart = chartOf();

  it('has every minute from 0 to 59, once, in order', () => {
    expect(chart.map(({ minutes }) => minutes)).toEqual(Array.from({ length: 60 }, (_, m) => m));
  });

  it.each([
    [0, '0.00'],
    [1, '0.02'],
    [5, '0.08'],
    [15, '0.25'],
    [20, '0.33'],
    [30, '0.50'],
    [45, '0.75'],
    [59, '0.98'],
  ])('writes %i minutes as %s hours', (minutes, decimal) => {
    expect(chart[minutes]).toEqual({ minutes, decimal });
  });

  it('lays the chart out as rows of three columns: 0, 20 and 40 minutes on the first', () => {
    expect(CHART_ROWS).toHaveLength(20);
    expect(CHART_ROWS[0]?.map(({ minutes }) => minutes)).toEqual([0, 20, 40]);
    expect(CHART_ROWS[19]?.map(({ minutes }) => minutes)).toEqual([19, 39, 59]);
  });
});
