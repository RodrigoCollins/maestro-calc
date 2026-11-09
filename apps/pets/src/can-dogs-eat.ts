import { Rational } from '@maestro-calc/core';
import { dogEnergy, kilogramsOf } from '@maestro-calc/pets-core/energy';
import {
  doseGramsOf,
  FOOD_POUNDS,
  gramsForKcal,
  treatKcalOf,
  unitsOf,
  type Verdict,
} from '@maestro-calc/pets-core/food-safety';
import { POISON_LINE } from './calc/chocolate.ts';
import { FRUIT } from './foods/fruit.ts';
import { PANTRY } from './foods/pantry.ts';
import { PROTEIN } from './foods/protein.ts';
import { FOODS_CHECKED, S, usdaSource } from './foods/sources.ts';
import type { Food, Piece, Threshold } from './foods/types.ts';
import { VEGETABLES } from './foods/vegetables.ts';
import { amountText } from './format.ts';
import type { GuideQuestion, GuideSection, PageSource } from './guides.ts';
import { hrefOf } from './routes.ts';

/** Every food of the "can dogs eat" pages: fruit, vegetables, dairy and meat, then the pantry. */
export const FOODS: readonly Food[] = [...FRUIT, ...VEGETABLES, ...PROTEIN, ...PANTRY];

/** How the pages and the hub word each verdict. */
export const VERDICT_COPY: Readonly<
  Record<Verdict, { readonly word: string; readonly heading: string; readonly intro: string }>
> = {
  toxic: {
    word: 'No',
    heading: 'Toxic: never give',
    intro:
      'Poisonous to dogs by the sources below. If your dog ate one, call your veterinarian or the poison line now.',
  },
  avoid: {
    word: 'Best not',
    heading: 'Not poisonous, but best avoided',
    intro:
      'Salt, fat, pits or bones make these a poor treat, though a scrap is rarely an emergency.',
  },
  moderation: {
    word: 'Yes, a little',
    heading: 'Fine in small amounts',
    intro:
      'Safe plain and in small pieces, with a caveat: sugar, fat, lactose or a part to remove.',
  },
  safe: {
    word: 'Yes',
    heading: 'Safe as a plain treat',
    intro: 'Safe for most dogs, plain and prepared as the page says, inside the treat budget.',
  },
};

/** The note on every toxic page: call first, and this page does not replace the veterinarian. */
export const FOOD_CALL = `Call your veterinarian or the ${POISON_LINE.name} at ${POISON_LINE.phone} now, even if your dog seems fine. The line answers 24 hours a day, and a consultation fee may apply. This page is not a substitute for your veterinarian.`;

/** The address of the page of food `id`. */
export const foodPathOf = (id: string): string => `/can-dogs-eat-${id}`;

const capitalized = (text: string): string => text.replace(/^./, (first) => first.toUpperCase());

const SMALL_WORDS = new Set([
  'a',
  'an',
  'and',
  'as',
  'at',
  'for',
  'in',
  'of',
  'on',
  'or',
  'the',
  'to',
]);

/** `text` in title case, the short words lower case: `Grapes Are Toxic to Dogs`. */
const titleCase = (text: string): string =>
  text
    .split(' ')
    .map((word, index) =>
      index > 0 && SMALL_WORDS.has(word)
        ? word
        : word.replace(/^./, (first) => first.toUpperCase()),
    )
    .join(' ');

/** A decimal figure of the data (`4.9`, `28.35`) as the exact fraction it is written as. */
const exact = (value: number): Rational => {
  const [whole = '', fraction = ''] = String(value).split('.');
  if (!/^\d+$/.test(whole) || !/^\d*$/.test(fraction))
    throw new Error(`not a decimal: ${String(value)}`);
  return Rational.of(BigInt(`${whole}${fraction}`), 10n ** BigInt(fraction.length));
};

/** A figure as a page writes it: to the tenth below 10 (without a trailing `.0`), whole above. */
const countText = (count: Rational): string =>
  count.compare(Rational.of(10)) === -1
    ? amountText(count, 1).replace(/\.0$/, '')
    : amountText(count, 0);

/** Grams as a page writes them: `4.9 g`, `9 g`, `109 g`. */
const gramsText = (grams: Rational): string => `${countText(grams)} g`;

/** A count with its noun: `1 grape`, `2.5 grapes`. */
const counted = (count: Rational, one: string, many: string): string => {
  const text = countText(count);
  return `${text} ${text === '1' ? one : many}`;
};

/** A share in percent: `64%`, and to the tenth below 10: `2.2%`. */
const percentText = (share: Rational): string => `${countText(share.mul(Rational.of(100)))}%`;

const poundsOf = (pounds: number): Rational => Rational.of(pounds);
const weightLabel = (pounds: number): string => `${String(pounds)} lb`;

/** The pounds a lead works its figure at: a medium dog. */
const LEAD_POUNDS = 25;

const kcalOfPiece = (food: Food, piece: Piece): Rational => {
  if (food.usda === undefined) throw new Error(`${food.id} has no USDA record`);
  return exact(piece.grams).mul(exact(food.usda.kcalPer100g)).div(Rational.of(100));
};

const pieceOf = (food: Food): Piece => {
  if (food.piece === undefined) throw new Error(`${food.id} has no piece`);
  return food.piece;
};

/** What a threshold reaches for a dog of `pounds`, in the words of the table. */
const thresholdCell = (food: Food, threshold: Threshold, pounds: number): string => {
  if (threshold.piecesPer10Lb !== undefined) {
    const count = threshold.piecesPer10Lb.mul(Rational.of(pounds, 10));
    if (threshold.unit !== undefined)
      return counted(count, threshold.unit.one, threshold.unit.many);
    const piece = pieceOf(food);
    return `${counted(count, piece.one, piece.many)} (${gramsText(count.mul(exact(piece.grams)))})`;
  }
  if (threshold.gramsPerKg === undefined) throw new Error(`${food.id}: a threshold without a dose`);
  const grams = doseGramsOf(poundsOf(pounds), threshold.gramsPerKg);
  const piece = pieceOf(food);
  if (food.compound !== undefined) {
    const [most, least] = food.compound.perPiece;
    return `${gramsText(grams)} of ${food.compound.name}: ${countText(unitsOf(grams, most))} to ${countText(unitsOf(grams, least))} ${piece.many}`;
  }
  return `${gramsText(grams)}, about ${counted(unitsOf(grams, exact(piece.grams)), piece.one, piece.many)}`;
};

/** The table a food page shows after its first section, computed at the four weights. */
export interface FoodTable {
  readonly id: string;
  readonly heading: string;
  readonly paragraphs: readonly string[];
  readonly columns: readonly string[];
  readonly rows: readonly (readonly string[])[];
}

const BUDGET_NOTE =
  'The budget is 10% of the day’s calories, the most VCA and AKC allow for every treat together, for a neutered adult at Merck’s maintenance need (1.6 × 70 × kg^0.75). A puppy, a working dog or a dog on a diet has its own figure: the dog food calculator works it out.';

const thresholdTable = (food: Food, thresholds: readonly Threshold[]): FoodTable => ({
  id: 'amounts',
  heading:
    food.verdict === 'toxic'
      ? `The amounts of ${food.name} the sources call dangerous, by weight`
      : `The most the sources allow, by weight`,
  paragraphs: food.thresholdNote === undefined ? [] : [food.thresholdNote],
  columns: ['Dog’s weight', ...thresholds.map(({ label }) => label)],
  rows: FOOD_POUNDS.map((pounds) => [
    weightLabel(pounds),
    ...thresholds.map((threshold) => thresholdCell(food, threshold, pounds)),
  ]),
});

const pieceLine = (food: Food, piece: Piece): string => {
  const kcal = kcalOfPiece(food, piece);
  const share = (pounds: number) => percentText(kcal.div(treatKcalOf(poundsOf(pounds))));
  return `One ${piece.one} (${gramsText(exact(piece.grams))}; ${piece.basis}) has ${amountText(kcal, 0)} kcal: ${share(10)} of a 10 lb dog’s treat budget and ${share(80)} of an 80 lb dog’s.`;
};

const budgetTable = (food: Food): FoodTable => {
  const usda = food.usda;
  if (usda === undefined) throw new Error(`${food.id} has no USDA record`);
  const piece = pieceOf(food);
  const per100 = exact(usda.kcalPer100g);
  const ceiling = food.ceiling;
  return {
    id: 'amounts',
    heading: `${capitalized(food.name)} in a day’s treat budget, by weight`,
    paragraphs: [
      `USDA gives ${food.name} (${usda.description}) ${String(usda.kcalPer100g)} kcal per 100 g. ${pieceLine(food, piece)}`,
      BUDGET_NOTE,
    ],
    columns: [
      'Dog’s weight',
      'Treat budget (kcal a day)',
      `${capitalized(food.name)} for the whole budget`,
      `In ${piece.many}`,
      ...(ceiling === undefined ? [] : [ceiling.label]),
    ],
    rows: FOOD_POUNDS.map((pounds) => {
      const budget = treatKcalOf(poundsOf(pounds));
      const grams = gramsForKcal(budget, per100);
      return [
        weightLabel(pounds),
        amountText(budget, 0),
        gramsText(grams),
        countText(unitsOf(grams, exact(piece.grams))),
        ...(ceiling === undefined
          ? []
          : [
              gramsText(
                gramsForKcal(
                  dogEnergy('neutered', kilogramsOf(poundsOf(pounds), 'lb')).mer.mul(ceiling.share),
                  per100,
                ),
              ),
            ]),
      ];
    }),
  };
};

const sodiumOf = (food: Food, piece: Piece): Rational | undefined =>
  food.usda?.sodiumPer100g === undefined
    ? undefined
    : exact(piece.grams).mul(exact(food.usda.sodiumPer100g)).div(Rational.of(100));

const pieceTable = (food: Food): FoodTable => {
  const piece = pieceOf(food);
  const kcal = kcalOfPiece(food, piece);
  const sodium = sodiumOf(food, piece);
  return {
    id: 'amounts',
    heading: `What one ${piece.one} is to a dog’s treat budget`,
    paragraphs: [
      `${pieceLine(food, piece)}${sodium === undefined ? '' : ` It also holds ${amountText(sodium, 0)} mg of sodium (USDA, ${food.usda?.description ?? ''}).`}`,
      BUDGET_NOTE,
    ],
    columns: [
      'Dog’s weight',
      'Treat budget (kcal a day)',
      `One ${piece.one} (${amountText(kcal, 0)} kcal) is`,
    ],
    rows: FOOD_POUNDS.map((pounds) => {
      const budget = treatKcalOf(poundsOf(pounds));
      return [weightLabel(pounds), amountText(budget, 0), `${percentText(kcal.div(budget))} of it`];
    }),
  };
};

const tableOf = (food: Food): FoodTable | undefined => {
  if (food.thresholds !== undefined) return thresholdTable(food, food.thresholds);
  if (food.usda === undefined) return undefined;
  return food.verdict === 'avoid' ? pieceTable(food) : budgetTable(food);
};

const leadFigure = (food: Food): string => {
  const first = food.thresholds?.[0];
  if (first !== undefined)
    return `For a ${weightLabel(LEAD_POUNDS)} dog, ${first.lead} is ${thresholdCell(food, first, LEAD_POUNDS)}.`;
  if (food.usda === undefined) return '';
  const piece = pieceOf(food);
  if (food.verdict === 'avoid') {
    const kcal = kcalOfPiece(food, piece);
    const sodium = sodiumOf(food, piece);
    return `One ${piece.one} has ${amountText(kcal, 0)} kcal, ${percentText(kcal.div(treatKcalOf(poundsOf(LEAD_POUNDS))))} of a ${weightLabel(LEAD_POUNDS)} dog’s daily treat budget${sodium === undefined ? '' : `, and ${amountText(sodium, 0)} mg of sodium`}.`;
  }
  const budget = treatKcalOf(poundsOf(LEAD_POUNDS));
  const grams = gramsForKcal(budget, exact(food.usda.kcalPer100g));
  return `For a ${weightLabel(LEAD_POUNDS)} dog, the whole day’s treat budget (${amountText(budget, 0)} kcal) is about ${gramsText(grams)} of ${food.name}, ${counted(unitsOf(grams, exact(piece.grams)), piece.one, piece.many)}, with no other treat that day.`;
};

const SERVE_HEADINGS: Readonly<Record<Verdict, (name: string) => string>> = {
  safe: (name) => `How to give ${name} to a dog`,
  moderation: (name) => `How to give ${name} safely`,
  avoid: (name) => `If your dog ate ${name}`,
  toxic: (name) => `If your dog ate ${name}: what to do now`,
};

const WHY_HEADINGS: Readonly<Record<Verdict, string>> = {
  safe: 'Why it is safe',
  moderation: 'Why only a little',
  avoid: 'Why it is best avoided',
  toxic: 'Why it is toxic to dogs',
};

/** A "can dogs eat" page, answered first and worked at four dog weights. */
export interface FoodPage {
  readonly id: string;
  readonly path: string;
  readonly verdict: Verdict;
  readonly title: string;
  readonly description: string;
  readonly h1: string;
  readonly lead: string;
  readonly checked: string;
  readonly callNow: boolean;
  /** The sections in page order; the table follows the first. */
  readonly sections: readonly GuideSection[];
  readonly table?: FoodTable;
  readonly sizeGuide?: {
    readonly heading: string;
    readonly note: string;
    readonly columns: readonly string[];
    readonly rows: readonly (readonly string[])[];
  };
  readonly questions: readonly GuideQuestion[];
  /** Other foods of the same verdict. */
  readonly related: readonly { readonly href: string; readonly label: string }[];
  /** The hub, calculators and kin pages. */
  readonly links: readonly { readonly href: string; readonly label: string }[];
  readonly sources: readonly PageSource[];
}

const LINK_LABELS: Readonly<Record<string, string>> = {
  dog: 'Dog food calculator: your dog’s own calories a day',
  chocolate: 'Dog chocolate toxicity calculator',
  'chocolate-guide': 'My dog ate chocolate: what to do now',
  'chocolate-chart': 'Chocolate toxicity chart',
};

const foodById = (id: string): Food => {
  const food = FOODS.find((candidate) => candidate.id === id);
  if (food === undefined) throw new Error(`no food ${id}`);
  return food;
};

const linkOf = (id: string): { href: string; label: string } => {
  if (id.startsWith('food-')) {
    const food = foodById(id.slice('food-'.length));
    return { href: foodPathOf(food.id), label: `Can dogs eat ${food.name}?` };
  }
  const label = LINK_LABELS[id];
  if (label === undefined) throw new Error(`no label for ${id}`);
  return { href: hrefOf(id), label };
};

const uniqueByUrl = (sources: readonly PageSource[]): PageSource[] =>
  sources.filter((source, index) => sources.findIndex(({ url }) => url === source.url) === index);

const titleOf = (food: Food): string => {
  const base = `Can Dogs Eat ${titleCase(food.name)}? ${VERDICT_COPY[food.verdict].word}: ${titleCase(food.answer)}`;
  const branded = `${base} | Bowl Figures`;
  return branded.length <= 65 ? branded : base;
};

const DESCRIPTION_TAILS: Readonly<Record<Verdict, string>> = {
  safe: 'Amounts by weight, from veterinary sources.',
  moderation: 'Amounts by weight and what to avoid.',
  avoid: 'Why, and what to do if your dog ate some.',
  toxic: 'What to do now, and when to call.',
};

const descriptionOf = (food: Food): string => {
  const full = `${food.summary} ${DESCRIPTION_TAILS[food.verdict]}`;
  return full.length <= 160 ? full : food.summary;
};

const pageOf = (food: Food): FoodPage => {
  const copy = VERDICT_COPY[food.verdict];
  const table = tableOf(food);
  const sections: GuideSection[] = [
    { id: 'why', heading: WHY_HEADINGS[food.verdict], paragraphs: food.why },
    { id: 'serve', heading: SERVE_HEADINGS[food.verdict](food.name), paragraphs: food.serve },
    {
      id: 'never',
      heading: food.verdict === 'toxic' ? 'Every form to keep away' : 'What never to give',
      paragraphs: food.never,
    },
    ...(food.signs === undefined
      ? []
      : [{ id: 'signs', heading: 'Signs to watch for, and when', paragraphs: food.signs }]),
    ...(food.disagree === undefined
      ? []
      : [{ id: 'disagree', heading: 'Where the sources disagree', paragraphs: food.disagree }]),
  ];
  const related = FOODS.filter(
    (other) => other.verdict === food.verdict && other.id !== food.id,
  ).map((other) => ({ href: foodPathOf(other.id), label: capitalized(other.name) }));
  const links = [
    ...(food.links ?? []).map(linkOf),
    ...(food.usda !== undefined && food.verdict !== 'toxic' ? [linkOf('dog')] : []),
    { href: hrefOf('foods'), label: 'Can dogs eat it? Every food on one page' },
  ];
  return {
    id: food.id,
    path: foodPathOf(food.id),
    verdict: food.verdict,
    title: titleOf(food),
    description: descriptionOf(food),
    h1: `Can dogs eat ${food.name}? ${copy.word}: ${food.answer}`,
    lead: [`${copy.word}: ${food.answer}.`, food.summary, leadFigure(food)]
      .filter((part) => part !== '')
      .join(' '),
    checked: FOODS_CHECKED,
    callNow: food.verdict === 'toxic',
    sections,
    ...(table === undefined ? {} : { table }),
    ...(food.sizeGuide === undefined
      ? {}
      : {
          sizeGuide: {
            heading: `${food.sizeGuide.by}’s serving guide by dog size`,
            note: food.sizeGuide.note,
            columns: ['Dog size', 'Amount'],
            rows: food.sizeGuide.rows,
          },
        }),
    questions: [
      ...food.alternates.map(({ name, answer }) => ({
        question: `Can dogs eat ${name}?`,
        answer,
      })),
      ...food.questions,
    ],
    related,
    links,
    sources: uniqueByUrl([
      ...food.sources,
      ...(food.usda === undefined ? [] : [usdaSource(food.usda.fdc, food.usda.description)]),
      // the treat budget's own sources, where the page works the budget
      ...(food.usda === undefined || food.thresholds !== undefined
        ? []
        : [S.vcaTreats, S.akcTreats, S.merckEnergy]),
      ...(food.verdict === 'toxic' ? [S.aspcaLine] : []),
    ]),
  };
};

/** The 41 food pages. */
export const FOOD_PAGES: readonly FoodPage[] = FOODS.map(pageOf);

/** The food page at `path`. */
export const foodPageOf = (path: string): FoodPage => {
  const found = FOOD_PAGES.find((candidate) => candidate.path === path);
  if (found === undefined) throw new Error(`no food page ${path}`);
  return found;
};

const HUB_ORDER: readonly Verdict[] = ['toxic', 'avoid', 'moderation', 'safe'];

/** The hub: every food, grouped by verdict, worst first. */
export const FOOD_HUB = {
  path: '/can-dogs-eat',
  title: `Can Dogs Eat It? ${String(FOODS.length)} Foods by Verdict | Bowl Figures`,
  description: `Which human foods dogs can eat: ${String(FOODS.length)} foods from grapes to rice, each with a sourced verdict, amounts by dog weight and when to call the vet.`,
  h1: 'Can dogs eat it? Human foods, from toxic to safe',
  lead: `${String(FOODS.length)} foods people ask about, each with a verdict from veterinary sources (the ASPCA Animal Poison Control Center, the Merck Veterinary Manual, AKC, PetMD and VCA) and a page that works the amounts at four dog weights.`,
  checked: FOODS_CHECKED,
  sections: [
    {
      id: 'verdicts',
      heading: 'How the verdicts are set',
      paragraphs: [
        'Toxic means a veterinary source calls the food poisonous to dogs. Best avoided means it is not poisonous, but the sources advise against it for its salt, fat, pits or bones. Fine in small amounts means safe plain, with a caveat the page names; safe means safe for most dogs when plain and prepared as the page says.',
        'Every verdict cites its sources, read on the day under the title, and says where they disagree. No verdict replaces your veterinarian, who knows your dog’s health and medicines.',
      ],
    },
    {
      id: 'budget',
      heading: 'The 10% treat budget',
      paragraphs: [
        'Even a safe food is a treat. VCA, with the Canadian Academy of Veterinary Nutrition, says 90% of a dog’s calories should come from its complete and balanced food and 10% can come from treats and snacks; AKC gives the same rule. The table works that 10% for a neutered adult at Merck’s maintenance need, and each food page turns it into grams and pieces of that food.',
      ],
    },
  ] satisfies readonly GuideSection[],
  budgetColumns: ['Dog’s weight', 'Calories a day (kcal)', 'Treat budget (kcal)'],
  budget: FOOD_POUNDS.map((pounds) => {
    const day = dogEnergy('neutered', kilogramsOf(poundsOf(pounds), 'lb')).mer;
    return [weightLabel(pounds), amountText(day, 0), amountText(treatKcalOf(poundsOf(pounds)), 0)];
  }),
  groups: HUB_ORDER.map((verdict) => ({
    verdict,
    heading: VERDICT_COPY[verdict].heading,
    intro: VERDICT_COPY[verdict].intro,
    rows: FOODS.filter((food) => food.verdict === verdict)
      .map((food) => ({
        href: foodPathOf(food.id),
        name: capitalized(food.name),
        also: food.alternates.map(({ name }) => name),
        summary: food.summary,
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  })),
  /** The plant hub: the other half of what a dog finds in a house and a yard. */
  plants: {
    href: '/plants-toxic-to-dogs',
    label:
      'Plants toxic to dogs: sago palms, bulbs, oleander and the houseplants on the ASPCA list',
  },
  sources: [S.aspcaFoods, S.aspcaLine, S.vcaTreats, S.akcTreats, S.merckEnergy],
};
