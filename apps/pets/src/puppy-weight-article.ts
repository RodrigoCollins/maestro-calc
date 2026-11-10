import { Rational } from '@maestro-calc/core';
import {
  PUPPY_SIZES,
  puppyWeight,
  SHARES,
  shareAt,
  type PuppySize,
} from '@maestro-calc/pets-core/puppy-weight';
import { DOG_AGE_SOURCES } from './dog-years.ts';
import { amountText } from './format.ts';
import type { CalcArticle, PageSource } from './guides.ts';
import { hrefOf } from './routes.ts';

/** The day every source of the puppy weight page was read. */
const CHECKED = '2026-11-10';

/** The sources of the puppy weight page, each read on `CHECKED` but AAHA (read 2026-11-08). */
export const PUPPY_WEIGHT_SOURCES = {
  waltham: {
    name: 'WALTHAM pocket book of puppy nutrition and care (WALTHAM Centre for Pet Nutrition), Growth rates, Table 1: Recommendations for growth rates of various sizes of dogs, adapted from NRC (2006)',
    url: 'https://www.waltham.com/s3media/2020-05/walthampocketbookofpuppynutritionandcare.pdf',
  },
  salt: {
    name: 'Salt C, Morris PJ, German AJ, Wilson D, Lund EM, Cole TJ, Butterwick RF. Growth standard charts for monitoring bodyweight in dogs of different sizes. PLoS One 2017;12(9):e0182064',
    url: 'https://doi.org/10.1371/journal.pone.0182064',
  },
  andersson: {
    name: 'Andersson L, Emanuelson U, Ringmark S, Bjørnvad CR, Hedhammar Å, Höglund K. Exploration of body weight in 115 000 young adult dogs of 72 breeds. Sci Rep 2023;13:443 (PubMed Central)',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9829868/',
  },
} as const satisfies Record<string, PageSource>;

const MERCK: PageSource = {
  name: 'Merck Veterinary Manual, Nutritional Requirements of Small Animals',
  url: 'https://www.merckvetmanual.com/management-and-nutrition/nutrition-small-animals/nutritional-requirements-and-related-diseases-of-small-animals',
};

/** A run of the engine, as numbers by output key. */
const run = (raw: Readonly<Record<string, string>>): ReadonlyMap<string, Rational> => {
  const ran = puppyWeight.run(raw);
  if (!ran.ok) throw new Error(`puppy-weight did not run on ${JSON.stringify(raw)}`);
  return new Map(
    ran.value.outputs.flatMap(({ key, value }) =>
      value instanceof Rational ? [[key, value] as const] : [],
    ),
  );
};

const at = (figures: ReadonlyMap<string, Rational>, key: string): Rational => {
  const value = figures.get(key);
  if (value === undefined) throw new Error(`no output ${key}`);
  return value;
};

/** To the tenth, without a trailing `.0`. */
const tenth = (value: Rational): string => amountText(value, 1).replace(/\.0$/, '');

const DEFAULT = run({ weight: '21', unit: 'lb', age: '13', size: 'large' });
const SIXTEEN_SMALL = shareAt(Rational.of(16).mul(Rational.of(12, 52)), 'small');

/** The ages, in weeks, of the table by week. */
export const WEEK_ROWS = [8, 10, 12, 14, 16, 18, 20, 22, 26, 30, 35, 39, 44, 52, 65, 78] as const;

/** One cell of the table by week: the share to the whole percent and the multiplier to the tenth. */
const weekCell = (weeks: number, size: PuppySize): string => {
  const share = shareAt(Rational.of(weeks).mul(Rational.of(12, 52)), size);
  if (share.equals(Rational.ONE)) return 'grown';
  return `${amountText(share.mul(Rational.of(100)), 0)}% (× ${tenth(share.inv())})`;
};

/** How much a 4-month weight is multiplied by, per size class: 1 ÷ the share at 4 months. */
const doubling = (size: PuppySize): string => tenth(shareAt(Rational.of(4), size).inv());

const COLUMNS = [
  'Small and medium (adult up to 25 kg, about 55 lb)',
  'Large (25 to 45 kg, about 55 to 99 lb)',
  'Giant (over 45 kg, about 99 lb)',
] as const;

/** The article of `/puppy-weight-calculator`, under the calculator. */
export const PUPPY_WEIGHT_ARTICLE: CalcArticle = {
  checked: CHECKED,
  sections: [
    {
      id: 'worked',
      heading: 'How the figures are worked out',
      paragraphs: [
        'The calculator uses one rule: adult weight = weight now ÷ the share of adult weight a puppy of its size has reached at its age. The shares come from Table 1 of the WALTHAM pocket book of puppy nutrition and care, which adapts them from the National Research Council’s Nutrient Requirements of Dogs and Cats (2006).',
        `Take the starting example, a large-breed puppy of 21 lb at 13 weeks. Its age in months is 13 × 12 ÷ 52 = 3 months. The table puts a large breed at 35% of its adult weight at 3 months, so 21 ÷ 0.35 = ${tenth(at(DEFAULT, 'adult'))} lb, about ${tenth(at(DEFAULT, 'adultOther'))} kg. Read on the small and medium curve (37% at 3 months) the same weight gives ${amountText(at(DEFAULT, 'low'), 0)} lb, and on the giant curve (26%) ${amountText(at(DEFAULT, 'high'), 0)} lb: the range shown is ${amountText(at(DEFAULT, 'low'), 0)} to ${amountText(at(DEFAULT, 'high'), 0)} lb.`,
        `Between two rows of the table the share runs in a straight line. At 16 weeks (3.7 months) a small or medium puppy is 9/13 of the way from 37% at 3 months to 52% at 4 months: 37 + (9/13) × 15 = ${tenth(SIXTEEN_SMALL.mul(Rational.of(100)))}%. A 10 lb puppy of that size and age is on course for 10 ÷ ${amountText(SIXTEEN_SMALL, 3)} ≈ ${amountText(Rational.of(10).div(SIXTEEN_SMALL), 0)} lb.`,
      ],
    },
    {
      id: 'range',
      heading: 'Why the answer is a range',
      paragraphs: [
        'A growth table is an average, and puppies are not. In growth standard charts built from the clinic records of young dogs at Banfield Pet Hospitals in the USA, Salt and colleagues (WALTHAM, 2017) found the dog-to-dog variability large, and found that growth could be described by size category rather than breed by breed, which makes such charts usable for mixed-breed dogs too.',
        'The hard part is the size class. For a purebred, the breed standard or the parents’ weights tell you which class to pick. For a mixed breed or a rescue of unknown parents, the class is itself a guess, so the calculator also reads the same weight on the class below and above yours. If the estimate lands outside the adult weights of the class you picked, it says so: try the class it points to.',
      ],
    },
    {
      id: 'sex',
      heading: 'Breed, sex and neutering',
      paragraphs: [
        'The table has one line per size for males and females together. In a study of the weights of about 115,000 young adult dogs of 72 breeds, weighed at 12 to 24 months of age in most breeds, males were heavier than females in every breed, significantly so in 54 of 72 breeds (Andersson and colleagues, 2023); German Shepherd males averaged 35.7 kg against 29.3 kg for females. Expect a male to finish toward the top of the range and a female toward the bottom.',
        'Salt and colleagues drew separate charts for males and females and looked at neutering: neutering before 37 weeks was linked with a slight upward shift in the growth curve, and after 37 weeks with a slight downward one, both small next to the differences between individual dogs.',
      ],
    },
    {
      id: 'stop',
      heading: 'When do puppies stop growing?',
      paragraphs: [
        'Smaller dogs finish sooner. WALTHAM writes that a toy breed is fully grown in less than a year while a giant breed can take almost two years, and Salt and colleagues describe very small dogs reaching maturity at 8 to 12 months and larger breeds needing up to 24 months to reach adult body weight. In the table, small and medium breeds are at 95% at 12 months and adult by 15; large breeds reach 100% at 18 months, and giant breeds are at 80% at 12 months.',
        'The 2019 AAHA Canine Life Stage Guidelines end the puppy stage when rapid growth stops, at about 6 to 9 months, a point that varies with breed and size. A dog keeps maturing after that: WALTHAM notes that further physiological development continues for some time after a puppy reaches its adult weight.',
      ],
    },
    {
      id: 'healthy',
      heading: 'Healthy growth, not the fastest growth',
      paragraphs: [
        'WALTHAM is clear that puppies should grow at a healthy rather than a maximal rate: puppies that grow too quickly are more likely to develop skeletal disorders such as hip dysplasia and to become prone to obesity, and large and giant breeds in particular should grow more slowly than small ones. An estimate is not a target to feed toward.',
        'The share of adult weight also tells you how a puppy’s appetite will change. WALTHAM gives a newly weaned puppy about twice the energy per kilogram of an adult dog, falling to 1.6 times at 50% of adult weight and 1.2 times at 80%, so the amount in the bowl can stay much the same for months while the puppy keeps gaining. The Merck Veterinary Manual’s puppy factors (3 times resting energy under 4 months, 2 times from 4 months) run the puppy feeding calculator.',
      ],
    },
    {
      id: 'vet',
      heading: 'When to ask your veterinarian',
      paragraphs: [
        'Weigh your puppy on the same scale every week or two and bring the numbers to each visit. A puppy that stops gaining, loses weight, or climbs much faster than its size class should be seen, and so should any puppy you think is too thin or too round. Salt and colleagues built their charts for exactly this use: an objective way for veterinary teams to monitor growth.',
        'Every figure on this page is a starting point from published growth data, not veterinary advice for your puppy.',
      ],
    },
  ],
  tables: [
    {
      after: 'worked',
      id: 'share-by-month',
      heading: 'Percentage of adult weight by age (WALTHAM, adapted from NRC 2006)',
      paragraphs: [
        'Table 1 of the WALTHAM pocket book as published, by age in months. “Adult” is the table’s own word for a dog of that size that has finished growing.',
      ],
      columns: ['Age (months)', ...COLUMNS],
      rows: SHARES.months.map((month, row) => [
        String(month),
        ...PUPPY_SIZES.map((size) => {
          const share = SHARES[size][row] ?? 100;
          return size === 'small' && share === 100 ? 'Adult' : `${String(share)}%`;
        }),
      ]),
      linksHeading: 'Turn a share into calories and cups for the weight your puppy is now:',
      links: [
        { href: hrefOf('puppy'), label: 'Puppy feeding calculator' },
        { href: hrefOf('puppy-chart'), label: 'Puppy feeding chart by weight' },
      ],
    },
    {
      after: 'range',
      id: 'share-by-week',
      heading: 'The same shares by week, with the multiplier to the adult weight',
      paragraphs: [
        'The monthly rows read by week, a straight line between them (a month is 52 ÷ 12 weeks). Multiply your puppy’s weight by the number in brackets for its estimated adult weight: a 6 lb small-breed puppy at 8 weeks is on course for about 6 × 5 = 30 lb.',
      ],
      columns: ['Age (weeks)', ...COLUMNS],
      rows: WEEK_ROWS.map((weeks) => [
        String(weeks),
        ...PUPPY_SIZES.map((size) => weekCell(weeks, size)),
      ]),
      linksHeading: 'Feed for the weight your puppy is now, not the one it is heading for:',
      links: [
        { href: hrefOf('puppy'), label: 'Puppy feeding calculator' },
        { href: hrefOf('dog-chart'), label: 'Dog feeding chart for when it is grown' },
      ],
    },
  ],
  questions: [
    {
      question: 'How big will my puppy get?',
      answer: `Divide its weight by the share of adult weight its size has reached at its age. A large-breed puppy of 21 lb at 13 weeks (3 months, 35%) is on course for about ${tenth(at(DEFAULT, 'adult'))} lb, within roughly ${amountText(at(DEFAULT, 'low'), 0)} to ${amountText(at(DEFAULT, 'high'), 0)} lb if it grows like a smaller or a bigger dog.`,
    },
    {
      question: 'Does a puppy double its weight from 4 months?',
      answer: `Close to it for small and medium breeds, not for the biggest. At 4 months the table puts small and medium breeds at 52%, large breeds at 48% and giant breeds at 38% of adult weight, so the 4-month weight is multiplied by about ${doubling('small')}, ${doubling('large')} and ${doubling('giant')} respectively.`,
    },
    {
      question: 'At what age is a puppy half its adult weight?',
      answer:
        'On the table, a small or medium puppy passes 50% between 3 and 4 months (37% and 52%), a large-breed puppy between 4 and 5 months (48% and 57%), and a giant-breed puppy at about 5 months (49%).',
    },
    {
      question: 'How accurate is a puppy weight calculator?',
      answer:
        'As accurate as the size class you choose and the average curve behind it. Individual dogs vary widely around any growth curve, males run heavier than females, and the earlier the weighing the more a small error is multiplied. Re-run the estimate every few weeks and ask your veterinarian.',
    },
    {
      question: 'Which size should I pick for a mixed breed?',
      answer:
        'The class of the adult weight you expect from the parents, if you know them. If you do not, start with your best guess and read the range: it shows the same weight on the class below and above. Salt and colleagues found that size categories describe growth well enough to be used for mixed-breed dogs.',
    },
  ],
  sources: [
    PUPPY_WEIGHT_SOURCES.waltham,
    PUPPY_WEIGHT_SOURCES.salt,
    PUPPY_WEIGHT_SOURCES.andersson,
    DOG_AGE_SOURCES.aaha,
    MERCK,
  ],
};
