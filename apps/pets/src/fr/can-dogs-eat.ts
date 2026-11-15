import { Rational } from '@maestro-calc/core';
import { dogEnergy, kilogramsOf } from '@maestro-calc/pets-core/energy';
import {
  gramsForKcal,
  TREAT_SHARE,
  unitsOf,
  type Verdict,
} from '@maestro-calc/pets-core/food-safety';
import { FOODS, foodPathOf } from '../can-dogs-eat.ts';
import { SOURCES_DE, SOURCES_DE_CHECKED } from '../de/foods/sources.ts';
import { FOODS_CHECKED, S, usdaSource } from '../foods/sources.ts';
import type { Food, Threshold } from '../foods/types.ts';
import type { GuideQuestion, GuideSection, PageSource } from '../guides.ts';
import { hrefOf } from '../routes.ts';
import { FRUIT_FR } from './foods/fruit.ts';
import { PANTRY_FR } from './foods/pantry.ts';
import { PROTEIN_FR } from './foods/protein.ts';
import { FR, SOURCES_FR_CHECKED } from './foods/sources.ts';
import type { FoodFr } from './foods/types.ts';
import { VEGETABLES_FR } from './foods/vegetables.ts';
import { amountFr, countFr, gramsFr, kgFr, percentFr } from './format.ts';
import { CALL_FR } from './texts.ts';

/** Every French food, in the order of the English route table. */
export const FOODS_FR: readonly FoodFr[] = [
  ...FRUIT_FR,
  ...VEGETABLES_FR,
  ...PROTEIN_FR,
  ...PANTRY_FR,
];

/** The dog weights every French page works its figures at, in kilograms: small to large. */
export const KILOS = [5, 10, 20, 35] as const;

/** The weight the lead works its figure at: a medium dog. */
const LEAD_KILOS = 10;

/** How the French pages and the hub word each verdict. */
export const VERDICT_FR: Readonly<
  Record<Verdict, { readonly word: string; readonly heading: string; readonly intro: string }>
> = {
  toxic: {
    word: 'Non',
    heading: 'Toxique : à ne jamais donner',
    intro:
      'Toxique pour les chiens selon les sources citées. Si votre chien en a mangé, appelez tout de suite votre vétérinaire ou un vétérinaire de garde.',
  },
  avoid: {
    word: 'Mieux vaut éviter',
    heading: 'Pas toxique, mais à éviter',
    intro:
      'Le sel, le gras, les noyaux ou les os en font une mauvaise friandise, même si une bouchée est rarement une urgence.',
  },
  moderation: {
    word: 'Oui, en petite quantité',
    heading: 'Acceptable en petite quantité',
    intro:
      'Sans risque nature et en petits morceaux, avec une réserve : le sucre, le gras, le lactose ou une partie à retirer.',
  },
  safe: {
    word: 'Oui',
    heading: 'Une bonne friandise nature',
    intro:
      'Sans risque pour la plupart des chiens, nature et préparé comme la page l’explique, dans la limite du budget friandises.',
  },
};

const englishOf = (id: string): Food => {
  const food = FOODS.find((candidate) => candidate.id === id);
  if (food === undefined) throw new Error(`no English food ${id}`);
  return food;
};

/** A decimal figure of the data (`4.9`) as the exact fraction it is written as. */
const exact = (value: number): Rational => {
  const [whole = '', fraction = ''] = String(value).split('.');
  return Rational.of(BigInt(`${whole}${fraction}`), 10n ** BigInt(fraction.length));
};

/**
 * The partitive of a food as it follows an amount: `des fraises` → `de fraises`, `du raisin` →
 * `de raisin`, `de la banane` → `de banane`, `de l’ananas` and `des œufs` → `d’ananas`, `d’œufs`.
 */
export const ofSome = (some: string): string => {
  const noun = some.replace(/^(des |du |de la |de l’)/, '');
  return /^[aeiouyhâéèêîôœ]/i.test(noun) ? `d’${noun}` : `de ${noun}`;
};

/** The treat budget of a neutered adult of `kilos`: a tenth of Merck's 1.6 × 70 × kg^0.75. */
const treatKcalAt = (kilos: number): Rational =>
  dogEnergy('neutered', Rational.of(kilos)).mer.mul(TREAT_SHARE);

const TEN_POUNDS = kilogramsOf(Rational.of(10), 'lb');

/** A count with its noun: French takes the singular below 2 (`1,5 fraise`), the plural from 2. */
const counted = (count: Rational, one: string, many: string): string =>
  `${countFr(count)} ${count.compare(Rational.of(2)) === -1 ? one : many}`;

interface Words {
  readonly food: Food;
  readonly fr: FoodFr;
}

const pieceOf = ({ food, fr }: Words) => {
  if (food.piece === undefined || fr.piece === undefined)
    throw new Error(`${food.id} has no piece`);
  return { ...fr.piece, grams: exact(fr.piece.grams ?? food.piece.grams) };
};

/** `text` with its first letter in capitals. */
const capitalized = (text: string): string => text.replace(/^./, (first) => first.toUpperCase());

const kcalOfPiece = (words: Words): Rational => {
  const usda = words.food.usda;
  if (usda === undefined) throw new Error(`${words.food.id} has no USDA record`);
  return pieceOf(words).grams.mul(exact(usda.kcalPer100g)).div(Rational.of(100));
};

/** What a threshold reaches for a dog of `kilos`, in the words of the table. */
const thresholdCell = (words: Words, threshold: Threshold, kilos: number): string => {
  if (threshold.piecesPer10Lb !== undefined) {
    const count = threshold.piecesPer10Lb.mul(Rational.of(kilos)).div(TEN_POUNDS);
    // a threshold in its own unit (teaspoons of avocado) needs no piece
    if (threshold.unit !== undefined) {
      const index = words.food.thresholds?.indexOf(threshold) ?? -1;
      const unit = words.fr.thresholds?.[index]?.unit;
      if (unit === undefined) throw new Error(`${words.food.id}: no French unit`);
      return counted(count, unit.one, unit.many);
    }
    const piece = pieceOf(words);
    return `${counted(count, piece.one, piece.many)} (${gramsFr(count.mul(piece.grams))})`;
  }
  if (threshold.gramsPerKg === undefined) throw new Error(`${words.food.id}: no dose`);
  const grams = threshold.gramsPerKg.mul(Rational.of(kilos));
  const piece = pieceOf(words);
  const compound = words.food.compound;
  if (compound !== undefined) {
    const [most, least] = compound.perPiece;
    return `${gramsFr(grams)} ${ofSome(`du ${words.fr.compound ?? ''}`)} : ${countFr(unitsOf(grams, most))} à ${countFr(unitsOf(grams, least))} ${piece.many}`;
  }
  return `${gramsFr(grams)}, soit environ ${counted(unitsOf(grams, piece.grams), piece.one, piece.many)}`;
};

/** The table a French food page shows after its first section, worked at the four weights. */
export interface FoodTableFr {
  readonly id: string;
  readonly heading: string;
  readonly paragraphs: readonly string[];
  readonly columns: readonly string[];
  readonly rows: readonly (readonly string[])[];
}

const BUDGET_NOTE =
  'Le budget correspond à 10 % des calories de la journée, le maximum que VCA et l’AKC admettent pour toutes les friandises réunies, pour un chien adulte stérilisé dont le besoin d’entretien suit le Merck Veterinary Manual (1,6 × 70 × kg^0,75). Les chiots, les chiens de travail et les chiens au régime ont d’autres besoins : parlez-en avec votre vétérinaire.';

const thresholdTable = (words: Words, thresholds: readonly Threshold[]): FoodTableFr => ({
  id: 'quantites',
  heading:
    words.food.verdict === 'toxic'
      ? 'À partir de quelle quantité c’est dangereux, selon le poids'
      : 'Les quantités maximales des sources, selon le poids',
  paragraphs: words.fr.thresholdNote === undefined ? [] : [words.fr.thresholdNote],
  columns: [
    'Poids du chien',
    ...thresholds.map((_, index) => words.fr.thresholds?.[index]?.label ?? ''),
  ],
  rows: KILOS.map((kilos) => [
    kgFr(kilos),
    ...thresholds.map((threshold) => thresholdCell(words, threshold, kilos)),
  ]),
});

const pieceLine = (words: Words): string => {
  const piece = pieceOf(words);
  const kcal = kcalOfPiece(words);
  const share = (kilos: number) => percentFr(kcal.div(treatKcalAt(kilos)));
  return `${capitalized(piece.a)} (${gramsFr(piece.grams)} ; ${piece.basis}) apporte ${amountFr(kcal, 0)} kcal : ${share(5)} du budget friandises d’un chien de 5 kg et ${share(35)} de celui d’un chien de 35 kg.`;
};

const usdaLine = ({ food, fr }: Words): string => {
  if (food.usda === undefined) throw new Error(`${food.id} has no USDA record`);
  const kcal = exact(food.usda.kcalPer100g);
  return `Selon l’USDA, 100 g ${fr.usdaName ?? ofSome(fr.some)} apportent ${amountFr(kcal, kcal.isInteger() ? 0 : 1)} kcal.`;
};

const budgetTable = (words: Words): FoodTableFr => {
  const { food, fr } = words;
  const usda = food.usda;
  if (usda === undefined) throw new Error(`${food.id} has no USDA record`);
  const piece = pieceOf(words);
  const per100 = exact(usda.kcalPer100g);
  const ceiling = food.ceiling;
  return {
    id: 'quantites',
    heading: `${fr.name} dans le budget friandises d’une journée, selon le poids`,
    paragraphs: [`${usdaLine(words)} ${pieceLine(words)}`, BUDGET_NOTE],
    columns: [
      'Poids du chien',
      'Budget friandises (kcal par jour)',
      `${fr.name} pour tout le budget`,
      `Nombre : ${piece.many}`,
      ...(ceiling === undefined ? [] : [fr.ceiling ?? '']),
    ],
    rows: KILOS.map((kilos) => {
      const budget = treatKcalAt(kilos);
      const grams = gramsForKcal(budget, per100);
      return [
        kgFr(kilos),
        amountFr(budget, 0),
        gramsFr(grams),
        countFr(unitsOf(grams, piece.grams)),
        ...(ceiling === undefined
          ? []
          : [
              gramsFr(
                gramsForKcal(
                  dogEnergy('neutered', Rational.of(kilos)).mer.mul(ceiling.share),
                  per100,
                ),
              ),
            ]),
      ];
    }),
  };
};

const sodiumOf = ({ food }: Words, grams: Rational): Rational | undefined =>
  food.usda?.sodiumPer100g === undefined
    ? undefined
    : grams.mul(exact(food.usda.sodiumPer100g)).div(Rational.of(100));

const pieceTable = (words: Words): FoodTableFr => {
  const piece = pieceOf(words);
  const kcal = kcalOfPiece(words);
  const sodium = sodiumOf(words, piece.grams);
  return {
    id: 'quantites',
    heading: `Ce que représente ${piece.a} dans le budget friandises`,
    paragraphs: [
      `${pieceLine(words)}${sodium === undefined ? '' : ` S’y ajoutent ${amountFr(sodium, 0)} mg de sodium (USDA).`}`,
      BUDGET_NOTE,
    ],
    columns: [
      'Poids du chien',
      'Budget friandises (kcal par jour)',
      `${capitalized(piece.a)} (${amountFr(kcal, 0)} kcal) représente`,
    ],
    rows: KILOS.map((kilos) => {
      const budget = treatKcalAt(kilos);
      return [kgFr(kilos), amountFr(budget, 0), `${percentFr(kcal.div(budget))} du budget`];
    }),
  };
};

const tableOf = (words: Words): FoodTableFr | undefined => {
  const { food } = words;
  if (food.thresholds !== undefined) return thresholdTable(words, food.thresholds);
  if (food.usda === undefined) return undefined;
  return food.verdict === 'avoid' ? pieceTable(words) : budgetTable(words);
};

const leadFigure = (words: Words): string => {
  const { food, fr } = words;
  const first = food.thresholds?.[0];
  if (first !== undefined)
    return `Pour un chien de ${kgFr(LEAD_KILOS)}, ${fr.thresholds?.[0]?.lead ?? ''} se situe à ${thresholdCell(words, first, LEAD_KILOS)}.`;
  if (food.usda === undefined) return '';
  const piece = pieceOf(words);
  if (food.verdict === 'avoid') {
    const kcal = kcalOfPiece(words);
    return `${capitalized(piece.a)} apporte ${amountFr(kcal, 0)} kcal, soit ${percentFr(kcal.div(treatKcalAt(LEAD_KILOS)))} du budget friandises quotidien d’un chien de ${kgFr(LEAD_KILOS)}.`;
  }
  const budget = treatKcalAt(LEAD_KILOS);
  const grams = gramsForKcal(budget, exact(food.usda.kcalPer100g));
  return `Pour un chien de ${kgFr(LEAD_KILOS)}, tout le budget friandises d’une journée (${amountFr(budget, 0)} kcal) correspond à environ ${gramsFr(grams)} ${ofSome(fr.some)}, soit ${counted(unitsOf(grams, piece.grams), piece.one, piece.many)}, sans aucune autre friandise ce jour-là.`;
};

const SERVE_HEADINGS: Readonly<Record<Verdict, (some: string) => string>> = {
  safe: (some) => `Comment donner ${some} à votre chien`,
  moderation: (some) => `Donner ${some} sans risque`,
  avoid: (some) => `Si votre chien a mangé ${some}`,
  toxic: (some) => `Votre chien a mangé ${some} : que faire maintenant`,
};

const WHY_HEADINGS: Readonly<Record<Verdict, string>> = {
  safe: 'Pourquoi c’est sans risque',
  moderation: 'Pourquoi seulement un peu',
  avoid: 'Pourquoi mieux vaut éviter',
  toxic: 'Pourquoi c’est toxique pour les chiens',
};

/** A French "Mon chien peut-il manger … ?" page, answered first and worked at four weights in kg. */
export interface FoodPageFr {
  readonly id: string;
  readonly path: string;
  /** The English page of the same food: the hreflang twin. */
  readonly twin: string;
  readonly verdict: Verdict;
  readonly title: string;
  readonly description: string;
  readonly h1: string;
  readonly lead: string;
  /** The day the French-language sources were read: the byline's review day. */
  readonly checked: string;
  /** The day the English-language sources were read. */
  readonly checkedEnglish: string;
  /** The day the German-language sources were read, when the page cites one. */
  readonly checkedGerman?: string;
  readonly callNow: boolean;
  readonly sections: readonly GuideSection[];
  readonly table?: FoodTableFr;
  readonly sizeGuide?: {
    readonly heading: string;
    readonly note: string;
    readonly columns: readonly string[];
    readonly rows: readonly (readonly string[])[];
  };
  readonly questions: readonly GuideQuestion[];
  readonly related: readonly { readonly href: string; readonly label: string }[];
  readonly links: readonly { readonly href: string; readonly label: string }[];
  readonly sources: readonly PageSource[];
}

/** The French address of food `id`, from the route table. */
const pathFrOf = (id: string): string => hrefOf(`food-${id}`, 'fr');

const uniqueByUrl = (sources: readonly PageSource[]): PageSource[] =>
  sources.filter((source, index) => sources.findIndex(({ url }) => url === source.url) === index);

const GERMAN_URLS: ReadonlySet<string> = new Set(Object.values(SOURCES_DE).map(({ url }) => url));

const titleOf = ({ fr }: Words): string => {
  const base = `Mon chien peut-il manger ${fr.some} ? ${fr.short}`;
  const branded = `${base} | Bowl Figures`;
  return branded.length <= 65 ? branded : base;
};

const DESCRIPTION_TAILS: Readonly<Record<Verdict, string>> = {
  safe: 'Quantités selon le poids, avec les sources.',
  moderation: 'Quantités selon le poids, et ce qui est interdit.',
  avoid: 'Pourquoi, et que faire s’il en a mangé.',
  toxic: 'Que faire maintenant.',
};

const descriptionOf = ({ food, fr }: Words): string => {
  const full = `${fr.summary} ${DESCRIPTION_TAILS[food.verdict]}`;
  return full.length <= 160 ? full : fr.summary;
};

const pageOf = (fr: FoodFr): FoodPageFr => {
  const food = englishOf(fr.id);
  const words: Words = { food, fr };
  const copy = VERDICT_FR[food.verdict];
  const table = tableOf(words);
  const sections: GuideSection[] = [
    { id: 'pourquoi', heading: WHY_HEADINGS[food.verdict], paragraphs: fr.why },
    { id: 'donner', heading: SERVE_HEADINGS[food.verdict](fr.some), paragraphs: fr.serve },
    {
      id: 'jamais',
      heading:
        food.verdict === 'toxic'
          ? 'Toutes les formes à proscrire'
          : 'Ce qu’il ne faut jamais donner',
      paragraphs: fr.never,
    },
    ...(fr.signs === undefined
      ? []
      : [{ id: 'signes', heading: 'Les signes, et quand ils apparaissent', paragraphs: fr.signs }]),
    ...(fr.disagree === undefined
      ? []
      : [
          {
            id: 'sources-divergent',
            heading: 'Là où les sources divergent',
            paragraphs: fr.disagree,
          },
        ]),
  ];
  const related = FOODS_FR.filter(
    (other) => other.id !== fr.id && englishOf(other.id).verdict === food.verdict,
  ).map((other) => ({ href: pathFrOf(other.id), label: other.name }));
  const sources = uniqueByUrl([
    ...food.sources,
    ...(food.usda === undefined ? [] : [usdaSource(food.usda.fdc, food.usda.description)]),
    ...(food.usda === undefined || food.thresholds !== undefined
      ? []
      : [S.vcaTreats, S.akcTreats, S.merckEnergy]),
    ...(food.verdict === 'toxic' ? [S.aspcaLine] : []),
    ...fr.sources,
  ]);
  return {
    id: fr.id,
    path: pathFrOf(fr.id),
    twin: foodPathOf(food.id),
    verdict: food.verdict,
    title: titleOf(words),
    description: descriptionOf(words),
    h1: `Mon chien peut-il manger ${fr.some} ? ${copy.word} – ${fr.answer}`,
    lead: [`${copy.word} – ${fr.answer}.`, fr.summary, leadFigure(words)]
      .filter((part) => part !== '')
      .join(' '),
    checked: SOURCES_FR_CHECKED,
    checkedEnglish: FOODS_CHECKED,
    ...(sources.some(({ url }) => GERMAN_URLS.has(url))
      ? { checkedGerman: SOURCES_DE_CHECKED }
      : {}),
    callNow: food.verdict === 'toxic',
    sections,
    ...(table === undefined ? {} : { table }),
    ...(food.sizeGuide === undefined || fr.sizeGuide === undefined
      ? {}
      : {
          sizeGuide: {
            heading: `Le tableau des portions de ${food.sizeGuide.by} selon la taille`,
            note: fr.sizeGuide.note,
            columns: ['Taille du chien', 'Quantité'],
            rows: fr.sizeGuide.rows,
          },
        }),
    questions: fr.questions,
    related,
    links: [
      ...(fr.id === 'chocolate'
        ? [
            {
              href: hrefOf('chocolate-guide', 'fr'),
              label: 'Mon chien a mangé du chocolat : la dose et que faire maintenant',
            },
          ]
        : []),
      {
        href: hrefOf('foods', 'fr'),
        label: 'Que peut manger un chien ? Tous les aliments sur une page',
      },
    ],
    sources,
  };
};

/** The French food pages, in the order of the route table. */
export const FOOD_PAGES_FR: readonly FoodPageFr[] = FOODS_FR.map(pageOf);

/** The French food page at `path`. */
export const foodPageFrOf = (path: string): FoodPageFr => {
  const found = FOOD_PAGES_FR.find((candidate) => candidate.path === path);
  if (found === undefined) throw new Error(`no French food page ${path}`);
  return found;
};

const HUB_ORDER: readonly Verdict[] = ['toxic', 'avoid', 'moderation', 'safe'];

/** The French hub: every French food, grouped by verdict, worst first. */
export const FOOD_HUB_FR = {
  path: hrefOf('foods', 'fr'),
  twin: hrefOf('foods'),
  title: 'Que peut manger un chien ? Toxique ou sans risque | Bowl Figures',
  description: `Que peut manger un chien, et que lui interdire ? ${String(FOODS_FR.length)} aliments jugés d’après des sources vétérinaires, avec les quantités selon le poids et quand appeler.`,
  h1: 'Que peut manger un chien ? Les aliments, du toxique au sans risque',
  lead: `${String(FOODS_FR.length)} aliments sur lesquels les propriétaires de chiens s’interrogent, chacun avec un verdict tiré de sources vétérinaires et une page qui calcule les quantités pour des chiens de 5, 10, 20 et 35 kg.`,
  checked: SOURCES_FR_CHECKED,
  checkedEnglish: FOODS_CHECKED,
  callNote: CALL_FR,
  sections: [
    {
      id: 'verdicts',
      heading: 'Comment les verdicts sont établis',
      paragraphs: [
        'Toxique veut dire : une source vétérinaire qualifie l’aliment de toxique pour les chiens. À éviter veut dire : pas toxique, mais les sources le déconseillent à cause du sel, du gras, des noyaux ou des os. En petite quantité veut dire : sans risque nature, avec une réserve que la page précise. Sans risque veut dire : convient à la plupart des chiens, nature et préparé comme la page l’explique.',
        'Chaque verdict cite ses sources avec la date à laquelle la rédaction les a lues, et dit où elles divergent. Ce sont surtout des ouvrages vétérinaires américains (le Merck Veterinary Manual, l’ASPCA Animal Poison Control Center, l’AKC, PetMD, VCA) ; quand un centre antipoison francophone dit la même chose, il est cité à côté. Aucun verdict ne remplace votre vétérinaire, qui connaît votre chien et ses médicaments.',
      ],
    },
    {
      id: 'budget',
      heading: 'Le budget friandises de 10 %',
      paragraphs: [
        'Même un aliment sans risque reste une friandise. VCA écrit, avec la Canadian Academy of Veterinary Nutrition, que 90 % des calories d’un chien devraient venir de son aliment complet et au plus 10 % des friandises et en-cas ; l’AKC donne la même règle. Le tableau calcule ces 10 % pour un chien adulte stérilisé dont le besoin d’entretien suit le Merck Veterinary Manual, et chaque page d’aliment les traduit en grammes et en morceaux.',
      ],
    },
  ] satisfies readonly GuideSection[],
  budgetColumns: ['Poids du chien', 'Calories par jour (kcal)', 'Budget friandises (kcal)'],
  budget: KILOS.map((kilos) => [
    kgFr(kilos),
    amountFr(dogEnergy('neutered', Rational.of(kilos)).mer, 0),
    amountFr(treatKcalAt(kilos), 0),
  ]),
  groups: HUB_ORDER.map((verdict) => ({
    verdict,
    heading: VERDICT_FR[verdict].heading,
    intro: VERDICT_FR[verdict].intro,
    rows: FOODS_FR.filter((fr) => englishOf(fr.id).verdict === verdict)
      .map((fr) => ({ href: pathFrOf(fr.id), name: fr.name, summary: fr.summary }))
      .sort((a, b) => a.name.localeCompare(b.name, 'fr')),
  })).filter(({ rows }) => rows.length > 0),
  sources: [S.aspcaFoods, S.vcaTreats, S.akcTreats, S.merckEnergy, ...FR.hub],
};
