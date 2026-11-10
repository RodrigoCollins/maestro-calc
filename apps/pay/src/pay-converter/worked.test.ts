import { describe, expect, it } from 'vitest';
import { workedOf } from './worked.ts';

const textOf = (section: ReturnType<typeof workedOf>): string => section.paragraphs.join(' ');

describe('workedOf: how a pay converter page works its starting figures out', () => {
  it('works the $22.00 hour out to the week, the year and each paycheck', () => {
    const section = workedOf('hourly', 'en');
    expect(section.heading).toBe('How the figures are worked out');
    const text = textOf(section);
    // $22 x 40 = $880 a week; x 52 = $45,760; / 12 = $3,813.33; / 24 = $1,906.67; 2 weeks $1,760
    for (const figure of ['$880.00', '$45,760.00', '$3,813.33', '$1,906.67', '$1,760.00'])
      expect(text).toContain(figure);
    // 50 paid weeks: $22 x 40 x 50 = $44,000, $3,666.67 a month
    expect(text).toContain('$44,000.00');
    expect(text).toContain('$3,666.67');
    // 30 hours: $22 x 30 = $660 a week, x 52 = $34,320
    expect(text).toContain('$660.00');
    expect(text).toContain('$34,320.00');
  });

  it('works the $60,000 year out to the hour, and the hour at longer weeks', () => {
    const text = textOf(workedOf('salary', 'en'));
    // $60,000 / 2,080 = $28.846 -> $28.85; / 52 = $1,153.85; / 26 = $2,307.69; / 24 = $2,500
    for (const figure of ['$28.85', '$1,153.85', '$2,307.69', '$2,500.00', '$5,000.00'])
      expect(text).toContain(figure);
    // 45 hours: / 2,340 = $25.641 -> $25.64; 50 hours: / 2,600 = $23.077 -> $23.08
    expect(text).toContain('$25.64');
    expect(text).toContain('$23.08');
  });

  it('says the same in Spanish, under a heading the audit reads as worked', () => {
    const hourly = workedOf('hourly', 'es');
    expect(hourly.heading).toBe('Cómo se calculan las cifras');
    expect(textOf(hourly)).toContain('$45,760.00');
    expect(textOf(hourly)).toContain('$44,000.00');
    expect(textOf(workedOf('salary', 'es'))).toContain('$25.64');
  });
});
