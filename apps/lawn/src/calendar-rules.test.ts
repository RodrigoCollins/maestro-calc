import { describe, expect, it } from 'vitest';
import {
  coolSeedBy,
  monthsBefore,
  vegetablesOf,
  warmFeedFirst,
  warmFeedLast,
  warmPlugBy,
} from './calendar-rules.ts';

// day numbers of the 365-day calendar: Apr 7 is 97, Oct 31 is 304, Nov 5 is 309
describe('monthsBefore', () => {
  it('goes back whole months, to the last day of a shorter month', () => {
    expect(monthsBefore(309, 2)).toBe(248); // Nov 5 to Sep 5
    expect(monthsBefore(30, 2)).toBe(334); // Jan 30 to Nov 30
    expect(monthsBefore(120, 2)).toBe(59); // Apr 30 to Feb 28
  });
});

describe('the frost rules of the extension sources', () => {
  it('times cool-season seed before the first fall freeze', () => {
    // Illinois: at least 45 days; UGA: at least four to six weeks
    expect(coolSeedBy(304)).toEqual({ days45: 259, weeks6: 262, weeks4: 276 });
  });

  it('times warm-season sprigs and plugs two months before the first fall freeze', () => {
    expect(warmPlugBy(309)).toBe(248);
  });

  it('times warm-season feeding from the last spring and to the first fall freeze', () => {
    expect(warmFeedFirst(97)).toBe(139); // about 6 weeks after: May 19
    expect(warmFeedLast(309)).toEqual({ weeks6: 267, weeks4: 281 });
  });

  it('places the vegetables of the UNH table around the last spring freeze', () => {
    const vegetables = vegetablesOf(97);
    expect(vegetables.map(({ crop }) => crop)).toEqual([
      'Cabbage transplants',
      'Lettuce transplants',
      'Radish seed',
      'Seed potatoes',
      'Bean seed',
      'Tomato transplants',
      'Pepper transplants',
      'Summer squash transplants',
    ]);
    expect(vegetables[0]).toEqual({ crop: 'Cabbage transplants', from: 69, to: 69 });
    expect(vegetables[1]).toEqual({ crop: 'Lettuce transplants', from: 69, to: 76 });
    expect(vegetables[4]).toEqual({ crop: 'Bean seed', from: 97, to: 97 });
    expect(vegetables[5]).toEqual({ crop: 'Tomato transplants', from: 104, to: 111 });
  });
});
