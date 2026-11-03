import { describe, expect, it } from 'vitest';
import { hoursText, moneyText } from '../format.ts';
import { EXAMPLES, figuresOf } from './examples.ts';

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
