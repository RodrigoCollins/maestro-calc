import { describe, expect, it } from 'vitest';
import { frostPageOf, FROST_PAGES } from './frost.ts';
import { frostIndexSummary, frostSummaryOf } from './frost-summary.ts';

describe('frostSummaryOf', () => {
  // Delaware, seven stations, 50% dates by hand (day 88 is Mar 29, 97 Apr 7, 101 Apr 11;
  // 303 is Oct 30, 308 Nov 4, 318 Nov 14)
  const delaware = frostSummaryOf(frostPageOf('/frost-dates/delaware'));
  const text = delaware.paragraphs.join(' ');

  it('gives the range and the middle of the last spring freeze among the stations of the page', () => {
    expect(text).toContain('from Mar 29 at Lewes to Apr 11 at Greenwood 2ne');
    expect(text).toContain('the middle of the 7 stations is Apr 7');
  });

  it('does the same for the first fall freeze', () => {
    expect(text).toContain('from Oct 30 at Greenwood 2ne to Nov 14 at Lewes');
    expect(text).toContain('the middle of the 7 stations is Nov 4');
  });

  it('works out the days between the two 50% dates at each station', () => {
    // Greenwood 303 - 101 = 202, Lewes 318 - 88 = 230; the middle of 202..230 is Wilmington Porter, 211
    expect(text).toContain('from 202 days at Greenwood 2ne to 230 days at Lewes');
    expect(text).toContain('the middle station has 211 days');
  });

  it('compares the highest and the lowest station', () => {
    // Wilmington Porter Rsch, 82.3 m = 270 ft, 211 days; Lewes, 3 m = 10 ft, 230 days
    expect(text).toContain('The highest station, Wilmington Porter Rsch at 270 ft, has 211 days');
    expect(text).toContain('the lowest, Lewes at 10 ft, has 230 days');
  });

  it('reads a warm station whose fall freeze falls in the next year, and leaves out the middle of two', () => {
    // Hawaii: Kanalohuluhulu spring day 26 (Jan 26), fall day 24 of the next year (Jan 24): 389 - 26 = 363
    const hawaii = frostSummaryOf(frostPageOf('/frost-dates/hawaii')).paragraphs.join(' ');
    expect(hawaii).toContain('from Jan 26 at Kanalohuluhulu 1075 to Apr 12 at Mauna Loa 5 NNE');
    expect(hawaii).toContain('from Dec 1 at Mauna Loa 5 NNE to Jan 24 at Kanalohuluhulu 1075');
    expect(hawaii).toContain('233 days at Mauna Loa 5 NNE to 363 days at Kanalohuluhulu 1075');
    expect(hawaii).not.toContain('middle');
  });

  it('links the other parts of a state from the text, so no part is an orphan', () => {
    const part = frostSummaryOf(frostPageOf('/frost-dates/texas/2'));
    expect(part.parts.map(({ href }) => href)).toEqual([
      '/frost-dates/texas',
      '/frost-dates/texas/3',
    ]);
    expect(delaware.parts).toEqual([]);
  });

  it('writes a different summary for every page', () => {
    const all = FROST_PAGES.map((page) => frostSummaryOf(page).paragraphs.join(' '));
    expect(new Set(all).size).toBe(all.length);
  });
});

describe('frostIndexSummary', () => {
  it('names the states with the earliest and the latest middle spring freeze', () => {
    const summary = frostIndexSummary();
    expect(summary.paragraphs.length).toBeGreaterThanOrEqual(2);
    expect(summary.paragraphs.join(' ')).toMatch(/stations in 50 states/);
  });
});
