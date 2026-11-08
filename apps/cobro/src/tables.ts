import { Rational } from '@maestro-calc/core';
import { numberText } from './format.ts';

const HUNDRED = Rational.of(100);

const percent = (value: Rational): string => `${numberText(value.mul(HUNDRED), 2)} %`;
const percentEn = (value: Rational): string => `${numberText(value.mul(HUNDRED), 2)}%`;

/** The markups the guide lists, in percent. */
export const MARKUPS = [10, 15, 20, 25, 30, 50, 100] as const;
/** The margins the guide lists, in percent. */
export const MARGINS = [10, 20, 25, 30, 40, 50] as const;

/** Margin = markup ÷ (1 + markup), for each listed markup: `[markup, margin]` as fractions. */
export const marginOfMarkup = (markupPercent: number): Rational => {
  const markup = Rational.of(markupPercent).div(HUNDRED);
  return markup.div(Rational.ONE.add(markup));
};

/** Markup = margin ÷ (1 − margin), for each listed margin. */
export const markupOfMargin = (marginPercent: number): Rational => {
  const margin = Rational.of(marginPercent).div(HUNDRED);
  return margin.div(Rational.ONE.sub(margin));
};

/** The rows of the markup table: the markup and the margin it leaves, in the language's percent style. */
export const markupRows = (lang: 'es' | 'en'): string[][] =>
  MARKUPS.map((each) => [
    (lang === 'es' ? percent : percentEn)(Rational.of(each).div(HUNDRED)),
    (lang === 'es' ? percent : percentEn)(marginOfMarkup(each)),
  ]);

/** The rows of the margin table: the margin and the markup that gives it. */
export const marginRows = (lang: 'es' | 'en'): string[][] =>
  MARGINS.map((each) => [
    (lang === 'es' ? percent : percentEn)(Rational.of(each).div(HUNDRED)),
    (lang === 'es' ? percent : percentEn)(markupOfMargin(each)),
  ]);

/** The made-up inputs of the hourly-rate example: income, yearly costs, weeks worked, billable hours a week. */
export const RATE_EXAMPLE = { income: 60_000, costs: 12_000, weeks: 46, hoursPerWeek: 30 } as const;

/** Rate = (income + costs) ÷ (weeks × billable hours a week), exactly. */
export const rateOfExample = (): Rational =>
  Rational.of(RATE_EXAMPLE.income + RATE_EXAMPLE.costs).div(
    Rational.of(RATE_EXAMPLE.weeks * RATE_EXAMPLE.hoursPerWeek),
  );
