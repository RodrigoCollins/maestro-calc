import type { Rational } from '@maestro-calc/core';
import { amountText } from '../format.ts';
import type { FeedingPage } from './dog.ts';
import { figureOf, type Patch, type View } from './view.ts';

/** The copy of the puppy weight calculator, with the notes for a young, grown or off-class puppy. */
export interface PuppyWeightPage extends FeedingPage {
  readonly early: string;
  readonly grown: string;
  readonly outsideClass: string;
}

export const PUPPY_WEIGHT_PAGE: PuppyWeightPage = {
  path: '/puppy-weight-calculator',
  title: 'How Big Will My Puppy Get? Puppy Weight Calculator | Bowl Figures',
  description:
    'Estimate your puppy’s adult weight from its weight, age in weeks and size class, on the WALTHAM growth table adapted from NRC. A range, not a promise.',
  kicker: 'Puppies · growth · free',
  h1: 'How big will my puppy get?',
  lead: 'Enter your puppy’s weight, its age in weeks and the size you expect. The calculator divides the weight by the share of adult weight a puppy of that size has reached at that age, from the WALTHAM growth table, and gives the range of the sizes either side.',
  fields: {
    weight: { label: 'Your puppy’s weight now' },
    unit: { label: 'Unit', options: { lb: 'pounds', kg: 'kilograms' } },
    age: { label: 'Age in weeks' },
    size: {
      label: 'Expected adult size',
      options: {
        small: 'Small or medium (adult up to 25 kg, about 55 lb)',
        large: 'Large (adult 25 to 45 kg, about 55 to 99 lb)',
        giant: 'Giant (adult over 45 kg, about 99 lb)',
      },
    },
  },
  initial: { weight: '21', unit: 'lb', age: '13', size: 'large' },
  notes: [
    'This is an estimate from an average growth curve, not a prediction for your dog. Two puppies of the same weight and age can end up pounds apart: breed, sex, neutering and food all play a part, and a mixed breed may grow like either parent. That is why the result comes with a range: the same weight read on the size class below and above the one you chose.',
    'Weigh your puppy every week or two and run it again: the estimate gets steadier as the puppy grows, because a small error on the scale is divided by a smaller share. Your veterinarian can tell growth from fat with a body condition score, and is the one to ask whether your puppy is on track.',
  ],
  early:
    'Under 12 weeks a puppy has reached only a small share of its adult weight, so each pound on the scale becomes several pounds in the estimate: read it as a rough guide and weigh again in a few weeks.',
  grown:
    'At this age the table counts a dog of this size as grown, so its weight now is its adult weight. Ask your veterinarian whether it is the right weight for its frame.',
  outsideClass:
    'This estimate falls outside the adult weights of the size you chose. Try the size class it points to, or ask your veterinarian which size your puppy is likely to be.',
};

/** Pounds to the whole pound; kilograms to the tenth, without a trailing `.0`. */
const weightText = (value: Rational, unit: string): string =>
  unit === 'kg' ? amountText(value, 1).replace(/\.0$/, '') : amountText(value, 0);

const plainText = (value: number): string => String(Math.round(value * 100) / 100);

/** The result of the puppy weight calculator: the adult weight, its range, and where the puppy is now. */
export const puppyWeightView: View = (figures, raw, warnings): Patch => {
  const unit = raw['unit'] === 'kg' ? 'kg' : 'lb';
  const other = unit === 'kg' ? 'lb' : 'kg';
  const months = figureOf(figures, 'months');
  const monthsText = amountText(months, months.isInteger() ? 0 : 1);
  return {
    text: {
      figure: weightText(figureOf(figures, 'adult'), unit),
      unit: `${unit} as an adult`,
      exact: `about ${weightText(figureOf(figures, 'adultOther'), other)} ${other}, for a ${plainText(
        Number(raw['weight'] ?? ''),
      )} ${unit} puppy at ${plainText(Number(raw['age'] ?? ''))} weeks`,
      range: `${weightText(figureOf(figures, 'low'), unit)} to ${weightText(
        figureOf(figures, 'high'),
        unit,
      )} ${unit}`,
      share: `${amountText(figureOf(figures, 'share'), 0)}%`,
      months: `${monthsText} ${monthsText === '1' ? 'month' : 'months'}`,
      grownBy: `${amountText(figureOf(figures, 'grownBy'), 0)} months`,
    },
    html: {},
    show: {
      early: warnings.has('early'),
      grown: warnings.has('grown'),
      outsideClass: warnings.has('outsideClass'),
    },
    vars: {},
    flags: {},
  };
};
