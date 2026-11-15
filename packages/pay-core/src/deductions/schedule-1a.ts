import { Rational, scaleMoney, usd, type Money } from '@maestro-calc/core';

/**
 * Schedule 1-A (Form 1040) amounts, tax years 2025 to 2028 (One Big Beautiful Bill Act), the same
 * on the final 2025 form and on the 2026 draft created June 16, 2026 (checked 2026-11-15):
 * https://www.irs.gov/pub/irs-pdf/f1040s1a.pdf, https://www.irs.gov/pub/irs-dft/f1040s1a--dft.pdf
 */
export const FILINGS = ['single', 'joint'] as const;
export type Filing = (typeof FILINGS)[number];

/** MAGI over which the deductions phase out (2026 draft lines 11 and 23; 9 and 17 in 2025). */
export const THRESHOLD: Readonly<Record<Filing, Money>> = {
  single: usd(150_000),
  joint: usd(300_000),
};

/** The federal income tax brackets, in percent; the filer picks theirs for the estimate. */
export const BRACKETS = ['10', '12', '22', '24', '32', '35', '37'] as const;

/** About what a deduction saves: the deduction times the filer's bracket. */
export const savingsOf = (deduction: Money, bracket: string): Money =>
  scaleMoney(deduction, Rational.of(Number(bracket), 100));
