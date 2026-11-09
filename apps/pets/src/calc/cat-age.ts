import { Rational } from '@maestro-calc/core';
import { amountText } from '../format.ts';
import { articleOf } from './dog-age.ts';
import type { FeedingPage } from './dog.ts';
import { figureOf, type Patch, type View } from './view.ts';

/** The four age stages of the 2021 AAHA/AAFP Feline Life Stage Guidelines, by the engine's number. */
export const CAT_STAGE_NAMES = ['Kitten', 'Young adult', 'Mature adult', 'Senior'] as const;

/** The six stages of International Cat Care, by the engine's number. */
export const CARE_STAGE_NAMES = [
  'Kitten',
  'Junior',
  'Adult',
  'Mature',
  'Senior',
  'Super senior',
] as const;

/** The veterinary visits of the 2021 guidelines, by the engine's visits a year. */
export const VISITS_TEXT: Readonly<Record<number, string>> = {
  1: 'at least once a year',
  2: 'at least every 6 months',
};

/** The copy of the cat age calculator page, with the notes for an age outside the sources. */
export interface CatAgePage extends FeedingPage {
  readonly outside: string;
  readonly cornellOutside: string;
}

export const CAT_AGE_PAGE: CatAgePage = {
  path: '/cat-age-calculator',
  title: 'Cat Age Calculator: Cat Years to Human Years | Bowl Figures',
  description:
    'Your cat’s age in human years, or a human age in cat years, on the AAFP-AAHA table, beside Cornell’s figures, with the 2021 life stage. Not the 7× rule.',
  kicker: 'Cats · age · free',
  h1: 'Cat age calculator: cat years to human years',
  lead: 'Enter an age. You get the age on the other side by the veterinary table, Cornell’s figures for comparison, the life stage of the 2021 AAHA/AAFP guidelines and how often a cat of that age should see a veterinarian.',
  fields: {
    from: {
      label: 'The age you know',
      options: { cat: 'My cat’s age (in years)', human: 'A human age (in years)' },
    },
    age: { label: 'Age in years' },
  },
  initial: { from: 'cat', age: '5' },
  notes: [
    'How many cat years is one human year? Not seven. A cat’s first year is about 15 human years and its second about 9 more, to 24; after that each year adds about 4 (the table of the 2010 AAFP-AAHA Feline Life Stage Guidelines, which International Cat Care prints too). For a kitten, enter months as a fraction of a year: 3 months is 0.25, 6 months 0.5.',
    'The sources disagree a little, and the page shows it. The Cornell Feline Health Center puts a 1-year-old at 16 and a 2-year-old at 21, then adds about 4 a year, so its figure stays 1 to 3 human years from the table. The 2021 AAHA/AAFP guidelines print no human ages at all: they place a cat in a life stage (kitten, young adult, mature adult, senior, and end of life at any age) and ask for an exam at least once a year, at least every 6 months for a senior.',
    'Indoors or out? The 2021 guidelines say an indoor-only life may lower the risks of injury, predators, poisoning and infection but raise those of obesity, illness and behavior problems without enrichment, and Cornell counts living indoors among the reasons cats live longer today. No source here gives an indoor cat its own age chart. Ages are estimates: ask your veterinarian where your cat is.',
  ],
  outside:
    'This age is past the 25 years the table covers, so the figure carries its 4 human years a year on: read it as a rough guide.',
  cornellOutside:
    'Cornell gives no figure under 1 year, so its chip draws a straight line from birth to its 16 at 1: read it as a rough guide.',
};

/** A figure of years as the result writes it: whole when it is whole, else to the tenth. */
const yearsText = (value: Rational): string => amountText(value, value.isInteger() ? 0 : 1);

/** A figure with its unit, `year` when the figure reads 1: `1 cat year`, `9.3 cat years`. */
const withUnit = (value: Rational, unit: 'human' | 'cat'): string => {
  const figure = yearsText(value);
  return `${figure} ${unit} ${figure === '1' ? 'year' : 'years'}`;
};

const ageText = (value: number): string => String(Math.round(value * 100) / 100);

/** The result of the cat age calculator: the age on the other side, and the comparison chips. */
export const catAgeView: View = (figures, raw, warnings): Patch => {
  const fromCat = raw['from'] !== 'human';
  const age = ageText(Number(raw['age'] ?? ''));
  const unit = fromCat ? 'human' : 'cat';
  const answer = figureOf(figures, 'answer');
  const stage = Number(figureOf(figures, 'stage').num);
  const kitten = stage === 0;
  const months = figureOf(figures, 'catAge').mul(Rational.of(12));
  const exact = !fromCat
    ? `for ${age} human years`
    : kitten && months.isInteger() && !months.isZero()
      ? `for a ${amountText(months)}-month-old kitten`
      : `for ${articleOf(age)} ${age}-year-old ${kitten ? 'kitten' : 'cat'}`;
  return {
    text: {
      figure: yearsText(answer),
      unit: `${unit} years`,
      exact,
      cornell: withUnit(figureOf(figures, 'cornell'), unit),
      seven: withUnit(figureOf(figures, 'seven'), unit),
      stage: CAT_STAGE_NAMES[stage] ?? '',
      care: CARE_STAGE_NAMES[Number(figureOf(figures, 'careStage').num)] ?? '',
      visits: VISITS_TEXT[Number(figureOf(figures, 'visits').num)] ?? '',
    },
    html: {},
    show: { outside: warnings.has('outside'), cornellOutside: warnings.has('cornellOutside') },
    vars: {},
    flags: {},
  };
};
