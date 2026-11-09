import { encode, Rational } from '@maestro-calc/core';
import {
  catAge,
  careStageOf,
  cornellHumanYearsOf,
  humanYearsOf,
  stageOf,
} from '@maestro-calc/pets-core/cat-age';
import { articleOf } from './calc/dog-age.ts';
import { CARE_STAGE_NAMES, CAT_STAGE_NAMES, VISITS_TEXT } from './calc/cat-age.ts';
import { AGES as DOG_AGES, humanAt } from './dog-years.ts';
import { amountText } from './format.ts';
import type { GuideQuestion, GuideSection, PageSource } from './guides.ts';
import { hrefOf } from './routes.ts';

/** The day the cat age figures were last checked against their sources. */
export const CAT_YEARS_CHECKED = '2026-11-09';

/** The sources of the cat age pages, each read on `CAT_YEARS_CHECKED`. */
export const CAT_AGE_SOURCES = {
  aafp2021: {
    name: '2021 AAHA/AAFP Feline Life Stage Guidelines (Quimby et al., JAAHA 2021;57:51–72 and JFMS 2021;23:211–233), Tables 1, 2 and 4',
    url: 'https://www.aaha.org/globalassets/02-guidelines/feline-life-stage-2021/2021-aaha-aafp-feline-life-stage-guidelines.pdf',
  },
  aafp2021Doi: {
    name: 'The same 2021 guidelines in the Journal of Feline Medicine and Surgery (doi 10.1177/1098612X21993657)',
    url: 'https://doi.org/10.1177/1098612X21993657',
  },
  aafp2010: {
    name: '2010 AAFP-AAHA Feline Life Stage Guidelines (Vogt et al., JAAHA 2010;46:70–85), life stages and human equivalents',
    url: 'https://aaha.org/wp-content/uploads/globalassets/02-guidelines/feline-life-stage/felinelifestageguidelines.pdf',
  },
  icatcare: {
    name: 'International Cat Care, How to tell your cat’s age in human years',
    url: 'https://icatcare.org/articles/how-to-tell-your-cats-age-in-human-years',
  },
  cornellSenior: {
    name: 'Cornell Feline Health Center, The Special Needs of the Senior Cat (updated December 2016)',
    url: 'https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/special-needs-senior-cat',
  },
  cornellOlder: {
    name: 'Cornell Feline Health Center, Loving Care for Older Cats',
    url: 'https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/loving-care-older-cats',
  },
} as const satisfies Record<string, PageSource>;

const ALL_SOURCES: readonly PageSource[] = Object.values(CAT_AGE_SOURCES);

/** The figures of the calculator for a cat of `age` years, by output key. */
const figureAt = (age: Rational, key: string): Rational => {
  const ran = catAge.run({ from: 'cat', age: age.toNumber().toString() });
  if (!ran.ok) throw new Error(`the cat age ${age.toString()} did not run`);
  const value = ran.value.outputs.find((output) => output.key === key)?.value;
  if (!(value instanceof Rational)) throw new Error(`no output ${key}`);
  return value;
};

/** A figure of years as a page writes it: whole when it is whole, else to the tenth. */
const yearsText = (value: Rational): string => amountText(value, value.isInteger() ? 0 : 1);

/** The human age of a cat of `age` years on the table of the 2010 guidelines. */
export const catHumanAt = (age: number): Rational => figureAt(Rational.of(age), 'answer');

/** The human age of a cat of `age` years by Cornell's figures. */
export const cornellAt = (age: number): Rational => figureAt(Rational.of(age), 'cornell');

/** The calculator's address with a cat of `age` years filled in, as the calculator encodes it. */
export const catCalculatorHrefOf = (age: number): string => {
  const validated = catAge.validate({ from: 'cat', age: String(age) });
  if (!validated.ok) throw new Error(`the cat age ${String(age)} does not validate`);
  const query = encode(catAge, validated.value);
  return query === 'v=1' ? hrefOf('cat-age') : `${hrefOf('cat-age')}?${query}`;
};

/** `text` with its first letter in capitals. */
const capitalized = (text: string): string => text.replace(/^./, (first) => first.toUpperCase());

/** A cat of `age` years, with its article: `a 3-year-old`, `an 8-year-old`. */
const yearOld = (age: number): string => `${articleOf(String(age))} ${String(age)}-year-old`;

/** `1 birthday`, `2 birthdays`. */
const birthdays = (count: number): string =>
  `${String(count)} more birthday${count === 1 ? '' : 's'}`;

/** `1 human year`, `3 human years`. */
const humanYears = (value: Rational): string =>
  `${yearsText(value)} human ${yearsText(value) === '1' ? 'year' : 'years'}`;

/** The ages of the exact-question pages: 1 to 20. */
export const CAT_AGES = Array.from({ length: 20 }, (_, index) => index + 1);

/** The address of the page of `age`: `/1-year-in-cat-years`, `/2-years-in-cat-years`. */
export const catYearsPathOf = (age: number): string =>
  `/${String(age)}-${age === 1 ? 'year' : 'years'}-in-cat-years`;

const stageAt = (age: number): number => stageOf(Rational.of(age));
const careAt = (age: number): number => careStageOf(Rational.of(age));
const stageName = (age: number): string => CAT_STAGE_NAMES[stageAt(age)] ?? '';
const careName = (age: number): string => CARE_STAGE_NAMES[careAt(age)] ?? '';
const visitsAt = (age: number): string =>
  VISITS_TEXT[figureAt(Rational.of(age), 'visits').toNumber()] ?? '';

/** The article and the lower-case name of a stage: `a young adult`, `a senior`. */
const aStage = (name: string): string => `${name === 'Adult' ? 'an' : 'a'} ${name.toLowerCase()}`;

/**
 * What the 2021 guidelines ask the veterinary team to look at in each age stage (Table 2), and the
 * tests of Table 4: how strongly and how often.
 */
const STAGE_CARE = [
  {
    range: 'birth up to 1 year',
    focus: '',
    tests:
      'none of the routine blood tests; retroviral testing and a fecal exam are strongly recommended',
    often: 'A single baseline, then as needed',
  },
  {
    range: '1 to 6 years',
    focus:
      'The guidelines name obesity prevention as the example of what matters at this stage, and ask the veterinary team to look in the mouth for periodontal disease and tooth resorption, and to ask about vomiting, hairballs, diarrhea and grooming.',
    tests:
      'a blood count, a chemistry panel, a urinalysis, T4 and blood pressure are tests to consider',
    often: 'A single baseline, then as needed',
  },
  {
    range: '7 to 10 years',
    focus:
      'The guidelines ask the veterinary team to feel the thyroid gland and the kidneys, to assess pain, and to ask about appetite, drinking and urinating, night-time activity and vocalizing, mobility, vision and lumps.',
    tests: 'a blood count, a chemistry panel, a urinalysis, T4 and blood pressure are recommended',
    often: 'Every 1 to 2 years',
  },
  {
    range: 'over 10 years',
    focus:
      'The guidelines ask for an easy-to-reach litter box, a warm soft bed and a footstool, for a watch on oral tumors and painful teeth, and for owners to hear that subtle changes in behavior are not just old age.',
    tests:
      'a blood count, a chemistry panel, a urinalysis, T4 and blood pressure are strongly recommended',
    often: 'At least yearly, every 6 months recommended',
  },
] as const;

const careOf = (age: number): (typeof STAGE_CARE)[number] => {
  const care = STAGE_CARE[stageAt(age)];
  if (care === undefined) throw new Error(`no stage at ${String(age)}`);
  return care;
};

/** The first birthday of each 2021 age stage after the kitten's: young adult 1, mature adult 7, senior 11. */
const STAGE_STARTS = [1, 7, 11] as const;

/** A section written for one age only: what is true of a cat at that age, with its source. */
interface AgeNote {
  readonly heading: string;
  readonly paragraphs: readonly string[];
}

/**
 * What each age has that the others do not, from the sources of the page: the 2021 and 2010
 * guidelines, International Cat Care and the Cornell Feline Health Center. Every figure in these
 * notes is held to the engine by a test.
 */
const NOTES: Readonly<Record<number, AgeNote>> = {
  1: {
    heading: 'The end of kittenhood',
    paragraphs: [
      'The 2021 AAHA/AAFP guidelines end the kitten stage at 1 year: from the first birthday a cat is a young adult. The 2010 table runs fastest here, from 10 human years at 6 months and 12 at 7 months to 15 at 12 months.',
      'This is the one age where Cornell reads older than the table, 16 against 15. From the second birthday on, Cornell reads 3 human years younger.',
      'Neutering is a risk factor for obesity, especially in males, and the 2021 guidelines say obesity prevention starts with kittens. They also ask for the core vaccines again 12 months after the last dose of the kitten series, then at intervals set by the cat’s risk.',
    ],
  },
  2: {
    heading: 'The second birthday',
    paragraphs: [
      'The table adds 9 human years in the second year, from 15 to 24, the last big step before a steady 4 a year. Cornell adds only 5, from 16 to 21, so at 2 the sources are 3 human years apart, the gap they keep from here on.',
      'International Cat Care still calls a 2-year-old a junior, a stage that runs from 7 months to 2 years. The 2021 guidelines folded it into the young adult stage, which runs from 1 to 6 years.',
    ],
  },
  3: {
    heading: 'The prime of life',
    paragraphs: [
      'International Cat Care starts its adult stage at 3, the stage the 2010 guidelines called prime, from 3 to 6 years. On their table a 3-year-old is 28.',
      'Weight is the thing to watch. The 2021 guidelines ask the veterinary team to monitor a young adult for weight gain, talk through the risks of obesity, and give ongoing advice on enrichment, play and exercise.',
    ],
  },
  4: {
    heading: 'A look at the teeth',
    paragraphs: [
      'The 2021 guidelines ask for a closer look in the mouth of a young adult, for periodontal disease and tooth resorption, and for a dental diet when it is clinically indicated.',
      'Their advice on oral health holds at every age: a detailed dental exam, preventive care, and the importance of home care such as brushing or wiping the teeth.',
    ],
  },
  5: {
    heading: 'The year the seven-year rule comes closest',
    paragraphs: [
      'Seven times 5 is 35, one human year short of the 36 of the table: the nearest the old rule ever comes. It is 8 too low at 1 and 44 too high at 20.',
      'A 5-year-old is in the middle of the young adult stage. The 2021 guidelines ask the veterinary team to talk about how relations with other cats in the home may decline, and how relations with people may change with maturity or after stressful events.',
    ],
  },
  6: {
    heading: 'The last young adult year',
    paragraphs: [
      'Six is the last year of the young adult stage in the 2021 guidelines, and the last of International Cat Care’s adult stage: both systems move a cat on at 7.',
      'The table puts a 6-year-old at 40 human years. Seven times 6 is 42, so the old rule is close here too, and from now on it runs ahead of the table by 3 human years more every year.',
    ],
  },
  7: {
    heading: 'A mature adult',
    paragraphs: [
      'The 2021 guidelines count a cat as a mature adult from 7 to 10 years, and Cornell notes that many cats begin to show age-related physical changes between seven and ten.',
      'The guidelines’ Table 4 now moves the blood count, the chemistry panel, the urinalysis, the thyroid test and the blood pressure from tests to consider to tests recommended, every 1 to 2 years.',
    ],
  },
  8: {
    heading: 'Once counted as a senior',
    paragraphs: [
      'Cornell recalls that not long ago cats were considered seniors at eight. Today, it says, cats live longer and are considered older at 12 to 14; the 2021 guidelines make a cat senior once it is over 10.',
      'At this stage the guidelines ask about drinking and urinating more, changes in appetite and hydration, and vomiting and diarrhea: signs the guidelines note are often hard to detect in a stoic cat.',
    ],
  },
  9: {
    heading: 'Thyroid and kidneys',
    paragraphs: [
      'The 2021 guidelines call for increased vigilance for early kidney disease in mature adult and senior cats, and recommend that veterinarians strongly consider a T4 test, the thyroid test, in the apparently healthy mature adult cat.',
      'They name the signs a series of results can show before a cat looks ill: a rising creatinine, SDMA, T4 or blood pressure, and a falling urine specific gravity.',
    ],
  },
  10: {
    heading: 'The last mature adult year',
    paragraphs: [
      'Ten is the last year of the mature adult stage: the 2021 guidelines count a cat as senior once it is over 10. They add that some senior cats stay in excellent condition and may be treated as mature adults, at the veterinarian’s discretion.',
      'Cornell compares a 10-year-old cat with a 53-year-old person, 3 human years younger than the 56 of the table.',
    ],
  },
  11: {
    heading: 'A senior, seen twice a year',
    paragraphs: [
      'From 11 a cat is a senior by the 2021 guidelines, which ask that seniors be seen at least every 6 months, and more often with a chronic condition. International Cat Care’s senior stage starts at 11 too and runs to 14.',
      'Energy needs change direction. The guidelines put a mature adult’s daily energy near its resting energy, but a senior’s 10 to 20% above it, in some cases 25%.',
    ],
  },
  12: {
    heading: 'Most cats show their age',
    paragraphs: [
      'Cornell says many cats begin to show age-related changes between seven and ten, and most do so by the time they are 12. It compares a 12-year-old cat with a 61-year-old person; the table says 64.',
      'International Cat Care gives cats an average life of around 12 to 14 years, so a 12-year-old has reached the start of that range.',
    ],
  },
  13: {
    heading: 'Weight going the other way',
    paragraphs: [
      'The 2021 guidelines say being underweight is a common problem in senior cats, who may digest their food less well; a young adult was watched for weight gain, a senior is watched for weight loss.',
      'They ask the veterinary team to discuss the diseases that change appetite and weight, and the use of therapeutic diets.',
    ],
  },
  14: {
    heading: 'The end of the average life span',
    paragraphs: [
      'Fourteen is the top of International Cat Care’s average life span of 12 to 14 years and the last year of its senior stage. Cornell considers cats older at 12 to 14.',
      'The table puts a 14-year-old at 72 human years and Cornell at 69, the last age before International Cat Care’s super senior stage.',
    ],
  },
  15: {
    heading: 'A super senior',
    paragraphs: [
      'International Cat Care calls a cat of 15 and over a super senior, the stage the 2010 guidelines called geriatric. The 2021 guidelines dropped that split: a senior is any cat over 10.',
      'Cornell compares a 15-year-old cat with a person of 73; the table says 76.',
    ],
  },
  16: {
    heading: 'Jumping, climbing and the litter box',
    paragraphs: [
      'The 2021 guidelines say joint disease and muscle weakness may first show as a change in jumping or climbing in senior cats, and Cornell lists arthritis among the common conditions of older cats.',
      'They ask owners to place litter boxes where a painful cat need not climb stairs, to adjust the size and height of the box, and to offer a warm soft bed and a footstool.',
    ],
  },
  17: {
    heading: 'Not just old age',
    paragraphs: [
      'The 2021 guidelines ask the veterinary team to teach owners that subtle changes in behavior are not just old age, and to monitor cognitive function in senior cats.',
      'Cornell lists the signs of cognitive problems in older cats: wandering, excessive meowing, apparent disorientation and avoiding social contact. Each is a reason for a visit, not something to wait out.',
    ],
  },
  18: {
    heading: 'Hearing and vaccines',
    paragraphs: [
      'Cornell notes that hearing loss is common in cats of advanced age. The 2021 guidelines ask that the risk and benefit of vaccinating a senior cat be weighed against its overall health.',
      'On the table an 18-year-old is 88 human years, and Cornell puts it at 85.',
    ],
  },
  19: {
    heading: 'Several conditions at once',
    paragraphs: [
      'The 2021 guidelines say other diseases alongside the main one are extremely common in senior cats and shape how each is diagnosed and treated. Cornell names kidney disease, hyperthyroidism, high blood pressure, diabetes, arthritis, dental disease and cancer among the conditions of older cats.',
      'With a chronic condition the guidelines ask for visits more often than every 6 months.',
    ],
  },
  20: {
    heading: 'Twenty and beyond',
    paragraphs: [
      'International Cat Care says it is not unusual for cats to reach their late teens or early twenties, and Cornell that veterinarians now see feline patients in their twenties. The table runs on to 116 at 25.',
      'The 2021 guidelines add a fifth stage, end of life, which can come at any age, and ask that quality of life be assessed and discussed when it becomes relevant.',
    ],
  },
};

const thisYearSection = (age: number): GuideSection => {
  const changes = [
    stageAt(age) === stageAt(age - 1)
      ? undefined
      : `from ${stageName(age - 1).toLowerCase()} to ${stageName(age).toLowerCase()} in the 2021 guidelines`,
    careAt(age) === careAt(age - 1)
      ? undefined
      : `from ${careName(age - 1).toLowerCase()} to ${careName(age).toLowerCase()} for International Cat Care`,
  ].filter((change) => change !== undefined);
  const stageLine =
    changes.length === 0
      ? `No stage changes at ${String(age)}.`
      : `This birthday moves a cat ${changes.join(', and ')}.`;
  if (age === 1)
    return {
      id: 'this-year',
      heading: 'What changes in the first year',
      paragraphs: [
        'A kitten goes from birth to 15 human years on the table, and to 16 on Cornell’s figures. On the first birthday it leaves the kitten stage of the 2021 guidelines; International Cat Care already counts it a junior from 7 months.',
      ],
    };
  const table = catHumanAt(age).sub(catHumanAt(age - 1));
  const cornell = cornellAt(age).sub(cornellAt(age - 1));
  return {
    id: 'this-year',
    heading: `What changes from ${String(age - 1)} to ${String(age)}`,
    paragraphs: [
      `The ${String(age)}${age === 2 ? 'nd' : age === 3 ? 'rd' : 'th'} birthday adds ${humanYears(table)} on the table and ${yearsText(cornell)} on Cornell’s figures. ${stageLine}`,
    ],
  };
};

const stageSection = (age: number): GuideSection => {
  const stage = stageAt(age);
  const next = STAGE_STARTS.find((start) => start > age);
  const care = careOf(age);
  const first = STAGE_STARTS.includes(age as (typeof STAGE_STARTS)[number]);
  return {
    id: 'stage',
    heading: `Life stage at ${String(age)}`,
    paragraphs: [
      `${capitalized(yearOld(age))} cat is ${aStage(stageName(age))} (2021 guidelines: ${care.range}) and ${aStage(careName(age))} for International Cat Care. ${
        next === undefined
          ? `Senior is the last age stage, and ${String(age - 10)} ${age === 11 ? 'year' : 'years'} past the line of 10 that opens it; end of life, the fifth stage, can come at any age.`
          : `It has ${birthdays(next - age)} before it is ${aStage(CAT_STAGE_NAMES[stage + 1] ?? '')} at ${String(next)}.`
      }`,
      ...(first ? [care.focus] : []),
    ],
  };
};

const careSection = (age: number): GuideSection => {
  const care = careOf(age);
  return {
    id: 'care',
    heading: `Veterinary care at ${String(age)}`,
    paragraphs: [
      `An exam ${visitsAt(age)}; ${care.tests} (${care.often.toLowerCase()}), by Table 4 of the 2021 guidelines.`,
    ],
  };
};

const cornellSection = (age: number): GuideSection => {
  const cornell = cornellAt(age);
  const table = catHumanAt(age);
  const gap = cornell.sub(table);
  return {
    id: 'cornell',
    heading: `What Cornell says about ${yearOld(age)} cat`,
    paragraphs: [
      `By Cornell’s figures ${yearOld(age)} cat is ${humanYears(cornell)}, ${yearsText(gap.abs())} ${gap.sign() === 1 ? 'more' : 'fewer'} than the ${yearsText(table)} of the table.`,
    ],
  };
};

const sevenSection = (age: number): GuideSection => {
  const seven = Rational.of(age * 7);
  const off = seven.sub(catHumanAt(age));
  return {
    id: 'seven',
    heading: 'The seven-year rule at this age',
    paragraphs: [
      `Seven times ${String(age)} is ${String(age * 7)}: ${humanYears(off.abs())} ${off.sign() === 1 ? 'too high' : 'too low'} against the table at ${String(age)}.`,
    ],
  };
};

/** The dogs of the same age on the dog charts of the site, which run to 16 years. */
const dogSection = (age: number): GuideSection => {
  const table = catHumanAt(age);
  if (age > DOG_AGES.length) {
    const last = DOG_AGES.length;
    return {
      id: 'dog',
      heading: 'And a dog of the same age?',
      paragraphs: [
        `The dog charts of this site stop at ${String(last)}, where a medium dog is ${yearsText(humanAt(last, 'medium'))} and a giant dog ${yearsText(humanAt(last, 'giant'))}. A cat of ${String(age)} is ${String(age - last)} ${age - last === 1 ? 'year' : 'years'} older than that and ${yearsText(table)} on its own table.`,
      ],
    };
  }
  const medium = humanAt(age, 'medium');
  const gap = table.sub(medium);
  return {
    id: 'dog',
    heading: 'And a dog of the same age?',
    paragraphs: [
      `${capitalized(yearOld(age))} dog is ${yearsText(humanAt(age, 'small'))} if small, ${yearsText(medium)} if medium-sized and ${yearsText(humanAt(age, 'giant'))} if giant on the dog charts of this site. The cat ${
        gap.isZero()
          ? 'is the same age as the medium dog'
          : `is ${humanYears(gap.abs())} ${gap.sign() === 1 ? 'older' : 'younger'} than the medium dog`
      }.`,
    ],
  };
};

/** An exact-question page: "N years in cat years", answered first and worked by the engine. */
export interface CatYearsPage {
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

const seniorAnswer = (age: number): string => {
  const stage = stageAt(age);
  if (stage === 3)
    return `Yes: over 10 is senior in the 2021 AAHA/AAFP guidelines, and at ${String(age)} International Cat Care says ${careName(age).toLowerCase()}. ${capitalized(visitsAt(age))} is the visit schedule for a senior.`;
  if (age === 10)
    return 'Not yet: the 2021 AAHA/AAFP guidelines count a cat as senior once it is over 10, so a 10-year-old is in its last mature adult year. Some veterinarians treat a fit senior as a mature adult, and the other way round.';
  return `No: ${yearOld(age)} cat is ${aStage(stageName(age))} by the 2021 AAHA/AAFP guidelines, ${String(11 - age)} birthdays short of the senior stage.`;
};

const pageOf = (age: number): CatYearsPage => {
  const note = NOTES[age];
  if (note === undefined) throw new Error(`no note for ${String(age)}`);
  const human = yearsText(catHumanAt(age));
  const cornell = yearsText(cornellAt(age));
  const years = age === 1 ? 'year' : 'years';
  const care = careOf(age);
  return {
    age,
    path: catYearsPathOf(age),
    title: `${String(age)} ${age === 1 ? 'Year' : 'Years'} in Cat Years: About ${human} Human Years | Bowl Figures`,
    description: `${capitalized(yearOld(age))} cat is about ${human} in human years on the AAFP-AAHA table, ${cornell} by Cornell. Life stage, vet visits, tests and the 7× rule.`,
    h1: `${String(age)} ${years} in cat years is about ${human} human years`,
    lead: `${capitalized(yearOld(age))} cat is about ${human} in human years on the AAFP-AAHA table (2010), and ${cornell} by Cornell’s figures. It is ${aStage(stageName(age))} (AAHA/AAFP 2021) and should see a veterinarian ${visitsAt(age)}.`,
    checked: CAT_YEARS_CHECKED,
    columns: ['Measure', `At ${String(age)} ${years}`],
    rows: [
      ['Human age, AAFP-AAHA table (2010)', human],
      ['Human age, Cornell Feline Health Center', cornell],
      ['Human age, 7× rule', String(age * 7)],
      ['Life stage, AAHA/AAFP (2021)', stageName(age)],
      ['Life stage, International Cat Care', careName(age)],
      ['Veterinary exam (2021)', capitalized(visitsAt(age))],
      ['Blood, urine, T4 and blood pressure (2021)', care.often],
    ],
    sections: [
      { id: 'note', ...note },
      thisYearSection(age),
      stageSection(age),
      careSection(age),
      cornellSection(age),
      sevenSection(age),
      dogSection(age),
    ],
    questions: [
      {
        question: `How old is ${yearOld(age)} cat in human years?`,
        answer: `About ${human} on the AAFP-AAHA table, or ${cornell} by Cornell’s figures.`,
      },
      { question: `Is ${yearOld(age)} cat a senior?`, answer: seniorAnswer(age) },
    ],
    calculator: {
      href: catCalculatorHrefOf(age),
      label: `Cat age calculator, with ${String(age)} ${years} filled in`,
    },
    sources: ALL_SOURCES,
  };
};

/** The twenty exact-question pages, 1 to 20 years. */
export const CAT_YEARS_PAGES: readonly CatYearsPage[] = CAT_AGES.map(pageOf);

/** The page of the cat age at `path`. */
export const catYearsPageOf = (path: string): CatYearsPage => {
  const page = CAT_YEARS_PAGES.find((candidate) => candidate.path === path);
  if (page === undefined) throw new Error(`no cat age page ${path}`);
  return page;
};

/** The rows of the cat age chart: the kitten months of the table, then every year to 25. */
const CHART_AGES: readonly (readonly [string, Rational])[] = [
  ...[1, 2, 3, 4, 6, 7].map(
    (count) => [`${String(count)} month${count === 1 ? '' : 's'}`, Rational.of(count, 12)] as const,
  ),
  ['1 year', Rational.ONE],
  ['18 months', Rational.of(3, 2)],
  ...Array.from(
    { length: 24 },
    (_, index) => [`${String(index + 2)} years`, Rational.of(index + 2)] as const,
  ),
];

/** The chart: the table, Cornell (none under 1 year), the 7× rule and the two sets of stages. */
export const CAT_AGE_CHART_ROWS: readonly (readonly string[])[] = CHART_AGES.map(([label, age]) => [
  label,
  yearsText(humanYearsOf(age)),
  age.compare(Rational.ONE) === -1 ? '–' : yearsText(cornellHumanYearsOf(age)),
  yearsText(age.mul(Rational.of(7))),
  CAT_STAGE_NAMES[stageOf(age)] ?? '',
  CARE_STAGE_NAMES[careStageOf(age)] ?? '',
]);
