import { describe, expect, it } from 'vitest';
import { dateText, titleCase } from './frost-text.ts';

describe('dateText', () => {
  // the normals use a 365-day calendar: day 134 is 31 + 28 + 31 + 30 = 120, plus 14 (May 14)
  it('turns a day number of the 365-day calendar into a month and a day', () => {
    expect(dateText(1)).toBe('Jan 1');
    expect(dateText(59)).toBe('Feb 28');
    expect(dateText(60)).toBe('Mar 1');
    expect(dateText(134)).toBe('May 14');
    expect(dateText(267)).toBe('Sep 24');
    expect(dateText(365)).toBe('Dec 31');
  });

  it('writes a missing value as a dash', () => {
    expect(dateText(null)).toBe('–');
  });
});

describe('titleCase', () => {
  it('writes a station name in title case', () => {
    expect(titleCase('FT COLLINS')).toBe('Ft Collins');
    expect(titleCase('LAFAYETTE PURDUE UNIV AP')).toBe('Lafayette Purdue Univ AP');
    expect(titleCase('NEW YORK CENTRAL PARK')).toBe('New York Central Park');
    // the one station NOAA names with a state abbreviation
    expect(titleCase('NY AVE V BROOKLYN')).toBe('NY Ave V Brooklyn');
  });

  it('keeps compass points, digits and capitals after a punctuation mark', () => {
    expect(titleCase('BEDFORD 5 WNW')).toBe('Bedford 5 WNW');
    expect(titleCase('ST. JOHN-WEST')).toBe('St. John-West');
    expect(titleCase("O'NEILL")).toBe("O'Neill");
  });
});
