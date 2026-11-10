import { describe, expect, it } from 'vitest';
import { workedOf } from './worked.ts';

const textOf = (section: ReturnType<typeof workedOf>): string => section.paragraphs.join(' ');

describe('workedOf: how a no-tax page works its deduction out', () => {
  it('works the overtime deduction out at the start, past the income limit and at the cap', () => {
    const section = workedOf('overtime', 'en');
    expect(section.heading).toBe('How the figures are worked out');
    const text = textOf(section);
    // 300 hours at $22: the half is $11 x 300 = $3,300; 12% of it is $396
    expect(text).toContain('$11.00 × 300 = $3,300.00');
    expect(text).toContain('$396.00');
    // MAGI $165,500 is $15,500 over $150,000: 15 x $100 = $1,500 off, $1,800 left; 24% = $432
    expect(text).toContain('$1,500.00');
    expect(text).toContain('$1,800.00');
    expect(text).toContain('$432.00');
    // 700 hours at $40: $20 x 700 = $14,000, capped at $12,500 single, all $14,000 joint
    expect(text).toContain('$14,000.00');
    expect(text).toContain('$12,500.00');
  });

  it('works the tips deduction out the same three ways', () => {
    const text = textOf(workedOf('tips', 'en'));
    // $8,000 of tips at 12%: $960
    expect(text).toContain('$8,000.00');
    expect(text).toContain('$960.00');
    // MAGI $172,300: 22 x $100 = $2,200 off, $5,800 left; 24% = $1,392
    expect(text).toContain('$2,200.00');
    expect(text).toContain('$5,800.00');
    expect(text).toContain('$1,392.00');
    // $30,000 of tips: capped at $25,000, on a joint return too
    expect(text).toContain('$25,000.00');
  });

  it('says the same in Spanish', () => {
    const overtime = workedOf('overtime', 'es');
    expect(overtime.heading).toBe('Cómo se calculan las cifras');
    expect(textOf(overtime)).toContain('$1,800.00');
    expect(textOf(workedOf('tips', 'es'))).toContain('$5,800.00');
  });
});
