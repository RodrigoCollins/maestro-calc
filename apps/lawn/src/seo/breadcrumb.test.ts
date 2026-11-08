import { describe, expect, it } from 'vitest';
import { frostTrailOf, pageTrailOf } from './breadcrumb.ts';

const page = { path: '/frost-dates/indiana', title: 'Frost Dates in Indiana | Lawn Figures' };

describe('breadcrumbs', () => {
  it('leads a frost page from the home through the index, named without the site', () => {
    expect(frostTrailOf(page)).toEqual([
      { name: 'Lawn Figures', path: '/' },
      { name: 'Frost dates', path: '/frost-dates' },
      { name: 'Frost Dates in Indiana', path: '/frost-dates/indiana' },
    ]);
  });

  it('leads any other page from the home to itself', () => {
    expect(
      pageTrailOf({ path: '/sod-calculator', title: 'Sod Calculator | Lawn Figures' }),
    ).toEqual([
      { name: 'Lawn Figures', path: '/' },
      { name: 'Sod Calculator', path: '/sod-calculator' },
    ]);
  });
});
