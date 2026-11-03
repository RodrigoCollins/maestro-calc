import { describe, expect, it } from 'vitest';
import { timeCard } from './time-card.ts';

describe('time card outputs', () => {
  it('leads with the pay, then the week figures, then the hours of each day', () => {
    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    expect(timeCard.outputs.map(({ key, role }) => [key, role])).toEqual([
      ['pay', 'primary'],
      ...[
        'totalHours',
        'regularHours',
        'overtimeHours',
        'doubleHours',
        'regularPay',
        'overtimePay',
        'doublePay',
      ].map((key) => [key, 'secondary']),
      ...days.map((day) => [`${day}Hours`, 'intermediate']),
    ]);
  });
});
