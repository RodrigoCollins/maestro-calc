import { encode, Rational } from '@maestro-calc/core';
import { dogAge, SENIOR_AT, SIZES, stageOf, type Size } from '@maestro-calc/pets-core/dog-age';
import { articleOf, SIZE_COPY, STAGE_NAMES } from './calc/dog-age.ts';
import { amountText } from './format.ts';
import type { GuideQuestion, GuideSection, PageSource } from './guides.ts';
import { hrefOf } from './routes.ts';

/** The day the dog age figures were last checked against their sources. */
export const DOG_YEARS_CHECKED = '2026-11-08';

/** The sources of the dog age pages, each read on `DOG_YEARS_CHECKED`. */
export const DOG_AGE_SOURCES = {
  avma: {
    name: 'AVMA, Pets age faster than people (chart for a medium-sized dog of 21 to 50 lb)',
    url: 'https://ebusiness.avma.org/files/productdownloads/PetsAgeFaster.pdf',
  },
  merck: {
    name: 'Merck Veterinary Manual, Description of Dogs (Antinoff, reviewed October 2026), Dog years versus human years',
    url: 'https://www.merckvetmanual.com/dog-owners/introduction-to-dogs/description-of-dogs',
  },
  petmd: {
    name: 'PetMD, How Old Is My Dog in Human Years? (Coates, DVM, December 2024)',
    url: 'https://www.petmd.com/dog/general-health/how-old-is-my-dog-in-human-years',
  },
  wang: {
    name: 'Wang T, et al. Quantitative Translation of Dog-to-Human Aging by Conserved Remodeling of the DNA Methylome. Cell Systems 2020;11(2):176–185',
    url: 'https://doi.org/10.1016/j.cels.2020.06.006',
  },
  wangPmc: {
    name: 'The same study, free full text on PubMed Central (PMC7484147)',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7484147/',
  },
  aaha: {
    name: '2019 AAHA Canine Life Stage Guidelines (Creevy et al., JAAHA 2019;55:267–290), Table 1',
    url: 'https://www.aaha.org/wp-content/uploads/globalassets/02-guidelines/canine-life-stage-2019/2019-aaha-canine-life-stage-guidelines-final.pdf',
  },
  vca: {
    name: 'VCA Animal Hospitals, How Old is Old? Comparing Dog Age to Human Age (Weir, Llera, Buzhardt)',
    url: 'https://vcahospitals.com/know-your-pet/how-old-is-old-comparing-dog-age-to-human-age',
  },
} as const satisfies Record<string, PageSource>;

const ALL_SOURCES: readonly PageSource[] = Object.values(DOG_AGE_SOURCES);

/** The figures of the calculator for a dog of `age` years and `size`, by output key. */
const figuresOf = (age: number, size: Size): ReadonlyMap<string, Rational> => {
  const ran = dogAge.run({ from: 'dog', age: String(age), size });
  if (!ran.ok) throw new Error(`the dog age ${String(age)} did not run`);
  return new Map(
    ran.value.outputs.flatMap(({ key, value }) =>
      value instanceof Rational ? [[key, value] as const] : [],
    ),
  );
};

const figureAt = (age: number, size: Size, key: string): Rational => {
  const value = figuresOf(age, size).get(key);
  if (value === undefined) throw new Error(`no output ${key}`);
  return value;
};

/** A figure of years as a page writes it: whole when it is whole, else to the tenth. */
export const yearsText = (value: Rational): string => amountText(value, value.isInteger() ? 0 : 1);

/** The human age of a dog of `age` years and `size` on the charts. */
export const humanAt = (age: number, size: Size): Rational => figureAt(age, size, 'answer');

/** The human age of a dog of `age` years on the DNA clock of Wang et al. */
export const wangAt = (age: number): Rational => figureAt(age, 'medium', 'wang');

/** The calculator's address with a dog of `age` years filled in, as the calculator encodes it. */
export const calculatorHrefOf = (age: number): string => {
  const validated = dogAge.validate({ from: 'dog', age: String(age), size: 'medium' });
  if (!validated.ok) throw new Error(`the dog age ${String(age)} does not validate`);
  const query = encode(dogAge, validated.value);
  return query === 'v=1' ? hrefOf('dog-age') : `${hrefOf('dog-age')}?${query}`;
};

/** The names of `sizes`, lower case, joined in a sentence: `small, medium and large`. */
const sizesText = (sizes: readonly Size[], joiner = 'and'): string => {
  const names = sizes.map((size) => SIZE_COPY[size].name.toLowerCase());
  return names.length <= 1
    ? (names[0] ?? '')
    : `${names.slice(0, -1).join(', ')} ${joiner} ${names.at(-1) ?? ''}`;
};

/** `text` with its first letter in capitals. */
const capitalized = (text: string): string => text.replace(/^./, (first) => first.toUpperCase());

/** A dog of `age` years, with its article: `a 3-year-old`, `an 8-year-old`. */
export const yearOld = (age: number): string => `${articleOf(String(age))} ${String(age)}-year-old`;

/** The ages of the exact-question pages: 1 to 16, the years of the AVMA chart. */
export const AGES = Array.from({ length: 16 }, (_, index) => index + 1);

/** The address of the page of `age`: `/1-year-in-dog-years`, `/2-years-in-dog-years`. */
export const agePathOf = (age: number): string =>
  `/${String(age)}-${age === 1 ? 'year' : 'years'}-in-dog-years`;

/** A section written for one age only: what is true of a dog at that age, with its source. */
interface AgeNote {
  readonly heading: string;
  readonly paragraphs: readonly string[];
}

/**
 * What each age has that the others do not, from the sources of the page: the AAHA stage and the
 * visits it suggests, the size that turns senior (VCA), the rows of Merck's table and the study of
 * Wang et al. Every figure in these notes is held to the engine by a test.
 */
const NOTES: Readonly<Record<number, AgeNote>> = {
  1: {
    heading: 'The first year is the fastest',
    paragraphs: [
      'How many dog years is one human year? At the start, about 15: AVMA’s chart and Merck’s table both put a dog of 1 at 15 human years. Merck’s table gives 10 to 15 human years for 6 to 12 months.',
      'AAHA ends the puppy stage when rapid growth stops, at about 6 to 9 months, and says that point varies with breed and size. Most 1-year-olds are young adults by that definition.',
      'This is where the sources disagree the most. The DNA clock of Wang et al. puts a 1-year-old at 31: the study found the methylome of puppies changing much faster than that of children, and it matched a puppy of about 8 weeks with a baby of about 9 months, the age both grow their first teeth.',
    ],
  },
  2: {
    heading: 'The second birthday',
    paragraphs: [
      'AVMA’s chart adds 9 human years in the second year, from 15 to 24, and Merck’s table ends its second row at 24 too. That is where every size of the chart meets before the sizes part ways.',
      'Not every veterinary source agrees on the first two years. VCA counts each of them as about 10.5 human years, which makes a 2-year-old about 21 rather than 24.',
      'A 2-year-old is a young adult for AAHA, still finishing its physical and social maturation. AAHA suggests a consultation and physical exam for young adults every six months to a year.',
    ],
  },
  3: {
    heading: 'The end of growing up',
    paragraphs: [
      'AAHA places the end of the young adult stage at the completion of physical and social maturation, which happens in most dogs by 3 to 4 years of age. A 3-year-old is near that line.',
      'From here the sizes part. PetMD gives about 4 human years a year after 2 for a small dog, 5 to 6 for a large dog and 7 to 8 for a giant dog, so the third year already puts a giant dog three and a half human years ahead of a small one on this page’s chart.',
    ],
  },
  4: {
    heading: 'A mature adult',
    paragraphs: [
      'For AAHA a dog is a mature adult from the end of maturation, 3 to 4 years in most dogs, until the last 25% of its expected life. The guidelines suggest an exam every six months to a year at this stage, with an annual minimum database: the baseline tests a veterinarian compares later results with.',
      'Merck’s table lists 4 dog years as 32 human years, the same as AVMA’s chart for a medium dog. The DNA clock, at about 53, is more than 20 years older here, the widest gap between the clock and the medium chart.',
    ],
  },
  5: {
    heading: 'A spread of ten years by size',
    paragraphs: [
      'At 5, the chart of this page runs from 36 human years for a small dog to 46.5 for a giant one: the same birthday, more than ten human years apart. AVMA warns that many factors, weight and breed among them, change how a dog ages.',
      'The medium chart is about to take its biggest step: from 36 at 5 to 42 at 6, six human years in one, the largest yearly jump after the second year.',
    ],
  },
  6: {
    heading: 'The year the seven-year rule is right',
    paragraphs: [
      'Seven times 6 is 42, and AVMA’s chart gives a 6-year-old medium dog exactly 42 human years: the one age where the old rule and the medium chart agree. Merck’s table, which adds 4 human years a year after 2, lists 6 dog years as 40.',
      'Every size is still a mature adult at 6. AAHA gives no age range for the mature adult and senior stages, because variation increases toward the latter years; it asks the veterinary team to estimate each dog’s life span instead, generally from its breed.',
    ],
  },
  7: {
    heading: 'Giant dogs turn senior',
    paragraphs: [
      'VCA counts giant breeds as seniors from about 7, the earliest of the four sizes. For AAHA a senior is in the last 25% of its expected life span, and it suggests exams at least every six months with a minimum database of tests.',
      'Seven times 7 is 49, two human years more than the 47 of AVMA’s chart for a medium dog: the rule overshoots by little here, and by more every year after.',
    ],
  },
  8: {
    heading: 'Large dogs turn senior',
    paragraphs: [
      'VCA counts large dogs as seniors from 8. Small and medium dogs are still mature adults, so two dogs born on the same day can be at different life stages from this birthday on.',
      'Merck’s table lists 8 dog years as 48 human years. The chart of this page now puts a giant dog above the DNA clock for the first time: the clock ages a dog fast while it is young and slowly later, and the giant line keeps a steep 7.5 human years a year.',
    ],
  },
  9: {
    heading: 'The last year before medium dogs turn senior',
    paragraphs: [
      'At 9 the sizes are about 25 human years apart, from 52 for a small dog to 76.5 for a giant one. A large or giant dog is already a senior by VCA’s ages, a small or medium one is not.',
      'The DNA clock of Wang et al. now adds less than two human years a year: it reads 66.2, above the large-dog chart’s 62.5 and below the giant-dog chart’s 76.5.',
    ],
  },
  10: {
    heading: 'Medium dogs turn senior',
    paragraphs: [
      'VCA counts medium dogs as seniors from 10. AVMA’s chart gives a 10-year-old medium dog 60 human years, and Merck’s table lists 10 to 12 dog years as 56 to 64.',
      'This is the year the large-dog chart passes the DNA clock: 68 human years against 67.8. Only the small and medium lines are still below it.',
    ],
  },
  11: {
    heading: 'Every size is a senior',
    paragraphs: [
      'VCA puts small dogs among the seniors at 11 to 12, the last of the four sizes; this page counts them from 11. From this birthday on, every size is a senior.',
      'AAHA’s senior stage is not an age but the last 25% of a dog’s expected life span, which the veterinary team estimates, generally from the breed.',
    ],
  },
  12: {
    heading: 'The average life span of a Labrador',
    paragraphs: [
      'Wang et al. studied Labrador retrievers only, and their formula translates the expected life span of a Labrador, 12 years, to about 70 human years, the worldwide life expectancy of people. The clock reads 70.8 at 12; AVMA’s medium chart gives 69.',
      'The authors note that breeds with very different life spans could age along different curves, which is why this page keeps the size charts first and the clock as a comparison.',
    ],
  },
  13: {
    heading: 'The medium chart passes the DNA clock',
    paragraphs: [
      'Merck’s table lists 13 to 14 dog years as 68 to 72 human years. AVMA’s chart gives a 13-year-old medium dog 74, and the DNA clock 72.0: from this year on, the medium chart reads older than the clock.',
      'The giant line is now past 100 human years. Few giant dogs reach 13, and the figure shows how fast a giant dog ages more than an age a person reaches.',
    ],
  },
  14: {
    heading: 'The last year the clock reads older than a small dog',
    paragraphs: [
      'At 14 the DNA clock gives 73.2 human years, still above the 72 of the small-dog chart and of Merck’s table, which lists 13 to 14 dog years as 68 to 72. Next year the small chart passes it too.',
      'AVMA’s chart gives a 14-year-old medium dog 78. Seven times 14 is 98, twenty human years more than the medium chart.',
    ],
  },
  15: {
    heading: 'Every chart is above the DNA clock',
    paragraphs: [
      'Merck’s last row lists 15 to 20 dog years as 76 to 96 human years, four a year. A small dog of 15 is 76 on this page’s chart, now above the clock’s 74.3; every size reads older than the clock from here.',
      'The clock adds about one human year a year at this age, against four to seven and a half on the size charts: the two approaches agree least about old dogs and young puppies.',
    ],
  },
  16: {
    heading: 'The end of the AVMA chart',
    paragraphs: [
      'AVMA’s chart stops at 16, at 87 human years for a medium dog, and the oldest dogs in the study of Wang et al. were 16 too. Past this page, the calculator carries the charts on to 20 years, the end of Merck’s table.',
      'Seven times 16 is 112, 25 human years more than AVMA’s chart: the old rule ends up furthest from the chart for the oldest dogs, the other way round from where it began.',
    ],
  },
};

/** One row of the table of a page: a size and its figures at that age. */
const sizeRow = (age: number, size: Size): string[] => [
  `${SIZE_COPY[size].name} (${SIZE_COPY[size].weight})`,
  yearsText(humanAt(age, size)),
  STAGE_NAMES[stageOf(Rational.of(age), size)] ?? '',
  `${String(SENIOR_AT[size])} years`,
];

/** The sizes whose chart reads at least the DNA clock at `age`. */
const sizesAboveClock = (age: number): Size[] =>
  SIZES.filter((size) => humanAt(age, size).compare(wangAt(age)) !== -1);

const clockSection = (age: number): GuideSection => {
  const wang = wangAt(age);
  const medium = humanAt(age, 'medium');
  const gap = wang.sub(medium);
  const above = sizesAboveClock(age);
  const below = SIZES.filter((size) => !above.includes(size));
  return {
    id: 'clock',
    heading: `What the DNA clock says about ${yearOld(age)} dog`,
    paragraphs: [
      `Wang et al. (Cell Systems, 2020) matched the DNA methylation of 104 Labrador retrievers with that of people and fitted human age = 16 × ln(dog age) + 31. For ${String(age)} ${age === 1 ? 'year' : 'years'} that is ${amountText(wang, 1)} human years, ${amountText(gap.abs(), 1)} ${gap.sign() === -1 ? 'fewer' : 'more'} than the ${yearsText(medium)} of AVMA’s chart for a medium dog.`,
      above.length === 0
        ? `At ${String(age)}, the clock reads older than the chart of every size: it ages young dogs much faster than the charts do.`
        : below.length === 0
          ? `At ${String(age)}, the chart of every size reads at least the clock: the clock slows down in later life, while the charts keep adding several human years a year.`
          : `At ${String(age)}, the chart reads older than the clock for ${sizesText(above)} dogs and younger for ${sizesText(below)} dogs: the clock slows down with age while the bigger sizes keep a steep line.`,
    ],
  };
};

const stageSection = (age: number): GuideSection => {
  const groups = STAGE_NAMES.map((name, stage) => ({
    name,
    sizes: SIZES.filter((size) => stageOf(Rational.of(age), size) === stage),
  })).filter(({ sizes }) => sizes.length > 0);
  const turning = SIZES.filter((size) => SENIOR_AT[size] === age);
  return {
    id: 'stage',
    heading: `Life stage at ${String(age)}`,
    paragraphs: [
      capitalized(
        `${groups
          .map(
            ({ name, sizes }) =>
              `${sizes.length === SIZES.length ? 'dogs of every size' : `${sizesText(sizes)} dogs`} are ${name === 'Senior' ? 'seniors' : `${name.toLowerCase()}s`}`,
          )
          .join(
            '; ',
          )} at ${String(age)}, by the stages of the 2019 AAHA guidelines and the senior ages of VCA (small 11, medium 10, large 8, giant 7).`,
      ),
      turning.length === 0
        ? `No size turns senior at exactly ${String(age)}.`
        : capitalized(`${sizesText(turning)} dogs turn senior at ${String(age)}.`),
    ],
  };
};

const yearSection = (age: number): GuideSection => {
  if (age === 1)
    return {
      id: 'this-year',
      heading: 'What changes in the first year',
      paragraphs: [
        'A dog goes from birth to about 15 human years on the charts, whatever its size: the charts only part ways after the second birthday. The DNA clock puts the end of the first year at 31.',
      ],
    };
  const added = SIZES.map(
    (size) => `${yearsText(humanAt(age, size).sub(humanAt(age - 1, size)))} for a ${size} dog`,
  );
  return {
    id: 'this-year',
    heading: `What changes from ${String(age - 1)} to ${String(age)}`,
    paragraphs: [
      `This birthday adds ${added.slice(0, -1).join(', ')} and ${added.at(-1) ?? ''} in human years on the chart. The DNA clock adds ${amountText(wangAt(age).sub(wangAt(age - 1)), 1)}.`,
    ],
  };
};

const sevenSection = (age: number): GuideSection => {
  const seven = Rational.of(age * 7);
  const small = humanAt(age, 'small');
  const giant = humanAt(age, 'giant');
  const medium = humanAt(age, 'medium');
  const off = seven.sub(medium);
  return {
    id: 'seven',
    heading: 'The seven-year rule at this age',
    paragraphs: [
      `Seven times ${String(age)} is ${String(age * 7)}. The chart puts ${yearOld(age)} dog between ${yearsText(small)} and ${yearsText(giant)} human years by size, and the medium dog at ${yearsText(medium)}, so the rule is ${off.isZero() ? 'exactly right for a medium dog at this age' : `${yearsText(off.abs())} human years ${off.sign() === 1 ? 'too high' : 'too low'} for a medium dog`}. No veterinary source on this page uses it.`,
    ],
  };
};

/** An exact-question page: "N years in dog years", answered first and worked by the engine. */
export interface AgePage {
  readonly age: number;
  readonly path: string;
  readonly title: string;
  readonly description: string;
  readonly h1: string;
  readonly lead: string;
  readonly checked: string;
  readonly columns: readonly string[];
  readonly rows: readonly (readonly string[])[];
  readonly sections: readonly GuideSection[];
  readonly questions: readonly GuideQuestion[];
  readonly calculator: { readonly href: string; readonly label: string };
  readonly sources: readonly PageSource[];
}

const pageOf = (age: number): AgePage => {
  const note = NOTES[age];
  if (note === undefined) throw new Error(`no note for ${String(age)}`);
  const [small, medium, large, giant] = SIZES.map((size) => yearsText(humanAt(age, size)));
  const years = age === 1 ? 'year' : 'years';
  const seniors = SIZES.filter((size) => stageOf(Rational.of(age), size) === 3);
  return {
    age,
    path: agePathOf(age),
    title: `${String(age)} ${age === 1 ? 'Year' : 'Years'} in Dog Years: About ${medium ?? ''} Human Years | Bowl Figures`,
    description: `${capitalized(yearOld(age))} dog is about ${medium ?? ''} human years if medium-sized (AVMA), ${small ?? ''} if small and ${giant ?? ''} if giant. Life stage, the DNA clock and the 7× rule.`,
    h1: `${String(age)} ${years} in dog years is about ${medium ?? ''} human years`,
    lead: `${capitalized(yearOld(age))} dog is about ${medium ?? ''} in human years if it is medium-sized (21 to 50 lb), on AVMA’s chart. A small dog of the same age is about ${small ?? ''}, a large one ${large ?? ''} and a giant one ${giant ?? ''}. The DNA clock of a 2020 study gives ${amountText(wangAt(age), 1)}.`,
    checked: DOG_YEARS_CHECKED,
    columns: ['Size', 'Human years', 'Life stage (AAHA)', 'Senior from (VCA)'],
    rows: SIZES.map((size) => sizeRow(age, size)),
    sections: [
      { id: 'note', ...note },
      yearSection(age),
      stageSection(age),
      clockSection(age),
      sevenSection(age),
    ],
    questions: [
      {
        question: `How old is ${yearOld(age)} dog in human years?`,
        answer: `About ${small ?? ''} for a small dog (20 lb or less), ${medium ?? ''} for a medium dog (21 to 50 lb), ${large ?? ''} for a large dog (51 to 100 lb) and ${giant ?? ''} for a giant dog (over 100 lb), on the charts of AVMA, Merck and PetMD. Your veterinarian can tell you where your own dog is.`,
      },
      {
        question: `Is ${yearOld(age)} dog a senior?`,
        answer:
          seniors.length === 0
            ? `Not by size alone: VCA counts dogs as seniors from 7 (giant) to 11 or 12 (small), so ${yearOld(age)} of any size is not there yet. AAHA defines a senior as a dog in the last 25% of its expected life.`
            : seniors.length === SIZES.length
              ? `Yes, whatever its size: VCA counts dogs as seniors from 7 (giant) to 11 or 12 (small). AAHA defines a senior as a dog in the last 25% of its expected life and suggests exams at least every six months.`
              : `It depends on its size: at ${String(age)}, a ${sizesText(seniors, 'or')} dog is a senior by VCA’s ages, a ${sizesText(
                  SIZES.filter((size) => !seniors.includes(size)),
                  'or',
                )} dog not yet. AAHA defines a senior as a dog in the last 25% of its expected life.`,
      },
    ],
    calculator: {
      href: calculatorHrefOf(age),
      label: `Dog age calculator, with ${String(age)} ${years} filled in`,
    },
    sources: ALL_SOURCES,
  };
};

/** The sixteen exact-question pages, 1 to 16 years. */
export const AGE_PAGES: readonly AgePage[] = AGES.map(pageOf);

/** The page of the dog age at `path`. */
export const agePageOf = (path: string): AgePage => {
  const page = AGE_PAGES.find((candidate) => candidate.path === path);
  if (page === undefined) throw new Error(`no dog age page ${path}`);
  return page;
};

/** The chart of human ages by size for 1 to 16 dog years, with the clock and the 7× rule. */
export const DOG_AGE_CHART_ROWS: readonly (readonly string[])[] = AGES.map((age) => [
  String(age),
  ...SIZES.map((size) => yearsText(humanAt(age, size))),
  amountText(wangAt(age), 1),
  String(age * 7),
]);
