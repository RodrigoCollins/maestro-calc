import { describe, expect, it } from 'vitest';
import { hoursText, moneyText } from '../format.ts';
import { EXAMPLES, figuresOf, OVERTIME_EXAMPLES, overtimeFiguresOf } from './examples.ts';

// The worked examples the methodology page publishes, verified by hand at $22 an hour
// (overtime $33, double time $44). The page renders what the engine returns; this pins it.
const HAND = {
  'federal-week': { regular: '40', overtime: '9.5', double: '0', pay: '$1,193.50' },
  'california-long-day': { regular: '40', overtime: '12.5', double: '1', pay: '$1,336.50' },
  'california-ten-hour-days': { regular: '40', overtime: '10', double: '0', pay: '$1,210.00' },
  'california-seventh-day': { regular: '40', overtime: '22', double: '1', pay: '$1,650.00' },
} as const;

describe('methodology examples', () => {
  it('publishes exactly the hand-verified cases, in order', () => {
    expect(EXAMPLES.map(({ id }) => id)).toEqual(Object.keys(HAND));
  });

  it.each(EXAMPLES)('$id: the engine gives the hand-verified figures', (example) => {
    const figures = figuresOf(example);
    expect({
      regular: hoursText(figures.regularHours),
      overtime: hoursText(figures.overtimeHours),
      double: hoursText(figures.doubleHours),
      pay: moneyText(figures.pay),
    }).toEqual(HAND[example.id]);
  });
});

// The overtime calculator's examples, hours worked each day at $22 an hour, verified by hand:
// four 10 h days are 40 h, no federal overtime ($880); California pays 2 h a day past 8
// (32 x 22 + 8 x 33 = $968); a 13 h Monday and four 8 h days in California are 8 + 4 + 1 and
// 32 regular (40 x 22 + 4 x 33 + 1 x 44 = $1,056).
const OVERTIME_HAND = {
  'four-tens-federal': { regular: '40', overtime: '0', double: '0', pay: '$880.00' },
  'four-tens-california': { regular: '32', overtime: '8', double: '0', pay: '$968.00' },
  'long-day-california': { regular: '40', overtime: '4', double: '1', pay: '$1,056.00' },
} as const;

describe('overtime calculator examples', () => {
  it('publishes exactly the hand-verified cases, in order', () => {
    expect(OVERTIME_EXAMPLES.map(({ id }) => id)).toEqual(Object.keys(OVERTIME_HAND));
  });

  it.each(OVERTIME_EXAMPLES)('$id: the engine gives the hand-verified figures', (example) => {
    const figures = overtimeFiguresOf(example);
    expect({
      regular: hoursText(figures.regularHours),
      overtime: hoursText(figures.overtimeHours),
      double: hoursText(figures.doubleHours),
      pay: moneyText(figures.pay),
    }).toEqual(OVERTIME_HAND[example.id]);
  });
});
