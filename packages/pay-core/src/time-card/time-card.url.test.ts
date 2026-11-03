import { describe, expect, it } from 'vitest';
import { timeCard } from './time-card.ts';

// The URL keys are a public contract: a shared time card link must reopen the same week forever.
describe('time card URL keys and defaults', () => {
  it('keys the rate, the rule and each day by its two-letter stem', () => {
    const stems = ['mo', 'tu', 'we', 'th', 'fr', 'sa', 'su'];
    expect(timeCard.inputs.map(({ urlKey }) => urlKey)).toEqual([
      'r',
      'ru',
      ...stems.flatMap((stem) => [`${stem}i`, `${stem}o`, `${stem}b`]),
    ]);
  });

  it('breaks 30 min on the long weekdays and none on Saturday or the day off', () => {
    const breaks = Object.fromEntries(
      timeCard.inputs
        .filter(({ key }) => key.endsWith('Break'))
        .map((input) => [input.key, input.default]),
    );
    expect(breaks).toEqual({
      monBreak: 30,
      tueBreak: 30,
      wedBreak: 30,
      thuBreak: 30,
      friBreak: 30,
      satBreak: 0,
      sunBreak: 0,
    });
  });
});
