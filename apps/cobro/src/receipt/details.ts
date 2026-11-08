import { Rational, type Money } from '@maestro-calc/core';
import { moneyText, numberText } from '../format.ts';

/**
 * The words that fill the detail of a receipt line, with `{name}` holes. The page writes them as
 * data attributes of the receipt (`data-t-<name>`), so the script that keeps the receipt current
 * carries no text of its own.
 */
export interface DetailTexts {
  /** `{hours} h × {rate}/h` */
  readonly hour: string;
  /** `{hours} h × {crew} × {rate}/h` */
  readonly hourCrew: string;
  /** `{area} sq ft × {areaRate}/sq ft` */
  readonly area: string;
  /** `{n} gallon` */
  readonly one: string;
  /** `{n} gallons` */
  readonly many: string;
  /** `Overhead ({pct}%)` */
  readonly overhead: string;
  /** `Profit ({pct}%)` */
  readonly profit: string;
}

/** What the details are written from: the labor fields, the units, the area and the two percents. */
export interface DetailValues {
  readonly laborBy: string;
  readonly hours: Rational;
  readonly crew: number;
  readonly rate: Money;
  readonly areaRate: Money;
  /** Square feet of the job. */
  readonly area: Rational;
  /** Whole purchase units of the main material. */
  readonly units: Rational;
  readonly overhead: Rational;
  readonly profit: Rational;
}

/** A template with each `{name}` replaced by its value; an unknown hole stays as it is. */
export const fill = (template: string, values: Readonly<Record<string, string>>): string =>
  template.replace(/\{(\w+)\}/g, (hole, name: string) => values[name] ?? hole);

export interface Details {
  readonly labor: string;
  readonly materials: string;
  readonly overhead: string;
  readonly profit: string;
}

/** The detail of each line of the receipt that has one, in the words of `texts`. */
export const detailsOf = (texts: DetailTexts, values: DetailValues): Details => {
  const labor =
    values.laborBy === 'area'
      ? fill(texts.area, {
          area: numberText(values.area, 0),
          areaRate: moneyText(values.areaRate),
        })
      : fill(values.crew > 1 ? texts.hourCrew : texts.hour, {
          hours: numberText(values.hours),
          crew: String(values.crew),
          rate: moneyText(values.rate),
        });
  const n = numberText(values.units, 0);
  return {
    labor,
    materials: values.units.isZero()
      ? ''
      : fill(values.units.equals(Rational.ONE) ? texts.one : texts.many, { n }),
    overhead: fill(texts.overhead, { pct: numberText(values.overhead) }),
    profit: fill(texts.profit, { pct: numberText(values.profit) }),
  };
};
