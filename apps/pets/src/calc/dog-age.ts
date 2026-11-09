import type { Size } from '@maestro-calc/pets-core/dog-age';
import { amountText } from '../format.ts';
import type { FeedingPage } from './dog.ts';
import { figureOf, type Patch, type View } from './view.ts';

/** Each size as the pages name it, with its weight. AVMA sets medium at 21 to 50 lb. */
export const SIZE_COPY: Readonly<Record<Size, { readonly name: string; readonly weight: string }>> =
  {
    small: { name: 'Small', weight: '20 lb or less' },
    medium: { name: 'Medium', weight: '21 to 50 lb' },
    large: { name: 'Large', weight: '51 to 100 lb' },
    giant: { name: 'Giant', weight: 'over 100 lb' },
  };

/** The life stages of the 2019 AAHA Canine Life Stage Guidelines, by the engine's stage number. */
export const STAGE_NAMES = ['Puppy', 'Young adult', 'Mature adult', 'Senior'] as const;

/** The copy of the dog age calculator page, with the notes for an age outside the sources. */
export interface DogAgePage extends FeedingPage {
  readonly outside: string;
  readonly wangOutside: string;
}

export const DOG_AGE_PAGE: DogAgePage = {
  path: '/dog-age-calculator',
  title: 'Dog Age Calculator: Dog Years to Human Years | Bowl Figures',
  description:
    'Your dog’s age in human years by size, or a human age in dog years, from the AVMA and Merck charts, beside the DNA clock of Wang et al. Not the 7× rule.',
  kicker: 'Dogs · age · free',
  h1: 'Dog age calculator: dog years to human years',
  lead: 'Enter an age and your dog’s size. You get the age on the other side by the veterinary charts, the DNA clock of a 2020 study for comparison, and the AAHA life stage.',
  fields: {
    from: {
      label: 'The age you know',
      options: { dog: 'My dog’s age (in years)', human: 'A human age (in years)' },
    },
    age: { label: 'Age in years' },
    size: {
      label: 'Your dog’s size',
      options: {
        small: 'Small (20 lb or less)',
        medium: 'Medium (21 to 50 lb)',
        large: 'Large (51 to 100 lb)',
        giant: 'Giant (over 100 lb)',
      },
    },
  },
  initial: { from: 'dog', age: '3', size: 'medium' },
  notes: [
    'How many dog years is one human year? Not seven. A dog’s first year is about 15 human years and its second about 9 more (AVMA and the Merck Veterinary Manual agree on 15 at 1 and 24 at 2). After that each year adds about 4 human years for a small dog, 4 to 5 for a medium one, 5 to 6 for a large one and 7 to 8 for a giant one (PetMD). The calculator uses the AVMA chart for a medium dog and the middle of each range for the other sizes.',
    'The sources disagree, and the page shows it. The DNA clock of Wang et al. (2020), fitted on Labrador retrievers only, makes a young dog much older: 31 human years at 1, against 15 on the charts. The AAHA guidelines do not convert ages at all; they place a dog in a life stage, which is the line this page gives under the figure.',
    'Ages are estimates. AVMA notes that many factors, weight and breed among them, change how a dog ages: ask your veterinarian where your dog is.',
  ],
  outside:
    'This age is outside the 6 months to 20 years the charts cover, so the figure carries the chart’s last line on: read it as a rough guide.',
  wangOutside:
    'The DNA clock was fitted on dogs up to 16 years old, so its figure here is past its own data.',
};

/** The article before an age said aloud: `an` for 8, 11, 18 and 80-something, else `a`. */
export const articleOf = (age: string): 'a' | 'an' => (/^(8|1[18](\.|$))/.test(age) ? 'an' : 'a');

const ageText = (value: number): string => String(Math.round(value * 100) / 100);

/** The result of the dog age calculator: the age on the other side, and the comparison chips. */
export const dogAgeView: View = (figures, raw, warnings): Patch => {
  const fromDog = raw['from'] !== 'human';
  const size = (raw['size'] ?? 'medium') as Size;
  const { name, weight } = SIZE_COPY[size];
  const age = ageText(Number(raw['age'] ?? ''));
  const unit = fromDog ? 'human years' : 'dog years';
  const places = fromDog ? 0 : 1;
  const stage = Number(figureOf(figures, 'stage').num);
  const answer = figureOf(figures, 'answer');
  return {
    text: {
      // a human age is whole on the charts but for the halves of the large and giant lines
      figure: amountText(answer, fromDog && answer.isInteger() ? 0 : 1),
      unit,
      exact: fromDog
        ? `for ${articleOf(age)} ${age}-year-old ${name.toLowerCase()} dog (${weight})`
        : `for ${age} human years, a ${name.toLowerCase()} dog (${weight})`,
      wang: `${amountText(figureOf(figures, 'wang'), 1)} ${unit}`,
      seven: `${amountText(figureOf(figures, 'seven'), places)} ${unit}`,
      stage: STAGE_NAMES[stage] ?? '',
      seniorAt: `${amountText(figureOf(figures, 'seniorAt'), 0)} years`,
    },
    html: {},
    show: { outside: warnings.has('outside'), wangOutside: warnings.has('wangOutside') },
    vars: {},
    flags: {},
  };
};
