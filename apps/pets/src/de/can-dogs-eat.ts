import { Rational } from '@maestro-calc/core';
import { dogEnergy, kilogramsOf } from '@maestro-calc/pets-core/energy';
import {
  gramsForKcal,
  TREAT_SHARE,
  unitsOf,
  type Verdict,
} from '@maestro-calc/pets-core/food-safety';
import { FOODS, foodPathOf } from '../can-dogs-eat.ts';
import { FOODS_CHECKED, S, usdaSource } from '../foods/sources.ts';
import type { Food, Threshold } from '../foods/types.ts';
import type { GuideQuestion, GuideSection, PageSource } from '../guides.ts';
import { hrefOf } from '../routes.ts';
import { FRUIT_DE } from './foods/fruit.ts';
import { PANTRY_DE } from './foods/pantry.ts';
import { PROTEIN_DE } from './foods/protein.ts';
import { DE, SOURCES_DE_CHECKED } from './foods/sources.ts';
import type { FoodDe } from './foods/types.ts';
import { VEGETABLES_DE } from './foods/vegetables.ts';
import { amountDe, countDe, gramsDe, kgDe, percentDe } from './format.ts';
import { CALL_DE } from './texts.ts';

/** Every German food, in the order of the English route table. */
export const FOODS_DE: readonly FoodDe[] = [
  ...FRUIT_DE,
  ...VEGETABLES_DE,
  ...PROTEIN_DE,
  ...PANTRY_DE,
];

/** The dog weights every German page works its figures at, in kilograms: small to large. */
export const KILOS = [5, 10, 20, 35] as const;

/** The weight the lead works its figure at: a medium dog. */
const LEAD_KILOS = 10;

/** How the German pages and the hub word each verdict. */
export const VERDICT_DE: Readonly<
  Record<Verdict, { readonly word: string; readonly heading: string; readonly intro: string }>
> = {
  toxic: {
    word: 'Nein',
    heading: 'Giftig: nie geben',
    intro:
      'Nach den unten genannten Quellen giftig für Hunde. Hat Ihr Hund davon gefressen, rufen Sie sofort Ihre Tierarztpraxis oder den tierärztlichen Notdienst an.',
  },
  avoid: {
    word: 'Besser nicht',
    heading: 'Nicht giftig, aber besser meiden',
    intro:
      'Salz, Fett, Kerne oder Knochen machen diese Lebensmittel zu einem schlechten Leckerli, auch wenn ein Bissen selten ein Notfall ist.',
  },
  moderation: {
    word: 'Ja, in kleinen Mengen',
    heading: 'In kleinen Mengen in Ordnung',
    intro:
      'Pur und in kleinen Stücken unbedenklich, mit einem Haken: Zucker, Fett, Laktose oder ein Teil, der weg muss.',
  },
  safe: {
    word: 'Ja',
    heading: 'Als pures Leckerli geeignet',
    intro:
      'Für die meisten Hunde unbedenklich, pur und so zubereitet, wie die Seite es beschreibt, im Rahmen des Leckerli-Budgets.',
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

/** The treat budget of a neutered adult of `kilos`: a tenth of Merck's 1.6 × 70 × kg^0.75. */
const treatKcalAt = (kilos: number): Rational =>
  dogEnergy('neutered', Rational.of(kilos)).mer.mul(TREAT_SHARE);

const TEN_POUNDS = kilogramsOf(Rational.of(10), 'lb');

const counted = (count: Rational, one: string, many: string): string => {
  const text = countDe(count);
  return `${text} ${text === '1' ? one : many}`;
};

interface Words {
  readonly food: Food;
  readonly de: FoodDe;
}

const pieceOf = ({ food, de }: Words) => {
  if (food.piece === undefined || de.piece === undefined)
    throw new Error(`${food.id} has no piece`);
  return { ...de.piece, grams: exact(de.piece.grams ?? food.piece.grams) };
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
  const piece = pieceOf(words);
  if (threshold.piecesPer10Lb !== undefined) {
    const count = threshold.piecesPer10Lb.mul(Rational.of(kilos)).div(TEN_POUNDS);
    if (threshold.unit !== undefined) {
      const index = words.food.thresholds?.indexOf(threshold) ?? -1;
      const unit = words.de.thresholds?.[index]?.unit;
      if (unit === undefined) throw new Error(`${words.food.id}: no German unit`);
      return counted(count, unit.one, unit.many);
    }
    return `${counted(count, piece.one, piece.many)} (${gramsDe(count.mul(piece.grams))})`;
  }
  if (threshold.gramsPerKg === undefined) throw new Error(`${words.food.id}: no dose`);
  const grams = threshold.gramsPerKg.mul(Rational.of(kilos));
  const compound = words.food.compound;
  if (compound !== undefined) {
    const [most, least] = compound.perPiece;
    return `${gramsDe(grams)} ${words.de.compound ?? ''}: ${countDe(unitsOf(grams, most))} bis ${countDe(unitsOf(grams, least))} ${piece.many}`;
  }
  return `${gramsDe(grams)}, etwa ${counted(unitsOf(grams, piece.grams), piece.one, piece.many)}`;
};

/** The table a German food page shows after its first section, worked at the four weights. */
export interface FoodTableDe {
  readonly id: string;
  readonly heading: string;
  readonly paragraphs: readonly string[];
  readonly columns: readonly string[];
  readonly rows: readonly (readonly string[])[];
}

const BUDGET_NOTE =
  'Das Budget sind 10 % der Tageskalorien, das Höchste, was VCA und AKC für alle Leckerlis zusammen zulassen, für einen kastrierten erwachsenen Hund mit dem Erhaltungsbedarf nach dem Merck Veterinary Manual (1,6 × 70 × kg^0,75). Welpen, Arbeitshunde und Hunde auf Diät haben einen anderen Bedarf: Besprechen Sie ihn mit Ihrer Tierarztpraxis.';

const thresholdTable = (words: Words, thresholds: readonly Threshold[]): FoodTableDe => ({
  id: 'mengen',
  heading:
    words.food.verdict === 'toxic'
      ? 'Ab welcher Menge es gefährlich wird, nach Körpergewicht'
      : 'Die Höchstmengen der Quellen, nach Körpergewicht',
  paragraphs: words.de.thresholdNote === undefined ? [] : [words.de.thresholdNote],
  columns: [
    'Gewicht des Hundes',
    ...thresholds.map((_, index) => words.de.thresholds?.[index]?.label ?? ''),
  ],
  rows: KILOS.map((kilos) => [
    kgDe(kilos),
    ...thresholds.map((threshold) => thresholdCell(words, threshold, kilos)),
  ]),
});

const pieceLine = (words: Words): string => {
  const piece = pieceOf(words);
  const kcal = kcalOfPiece(words);
  const share = (kilos: number) => percentDe(kcal.div(treatKcalAt(kilos)));
  return `${capitalized(piece.a)} (${gramsDe(piece.grams)}; ${piece.basis}) hat ${amountDe(kcal, 0)} kcal: ${share(5)} des Leckerli-Budgets eines 5-kg-Hundes und ${share(35)} eines 35-kg-Hundes.`;
};

const usdaLine = ({ food, de }: Words): string => {
  if (food.usda === undefined) throw new Error(`${food.id} has no USDA record`);
  const kcal = exact(food.usda.kcalPer100g);
  return `100 g ${de.usdaName ?? de.name} liefern laut USDA ${amountDe(kcal, kcal.isInteger() ? 0 : 1)} kcal.`;
};

const budgetTable = (words: Words): FoodTableDe => {
  const { food, de } = words;
  const usda = food.usda;
  if (usda === undefined) throw new Error(`${food.id} has no USDA record`);
  const piece = pieceOf(words);
  const per100 = exact(usda.kcalPer100g);
  const ceiling = food.ceiling;
  return {
    id: 'mengen',
    heading: `${de.name} im Leckerli-Budget eines Tages, nach Körpergewicht`,
    paragraphs: [`${usdaLine(words)} ${pieceLine(words)}`, BUDGET_NOTE],
    columns: [
      'Gewicht des Hundes',
      'Leckerli-Budget (kcal am Tag)',
      `${de.name} für das ganze Budget`,
      `Anzahl: ${piece.many}`,
      ...(ceiling === undefined ? [] : [de.ceiling ?? '']),
    ],
    rows: KILOS.map((kilos) => {
      const budget = treatKcalAt(kilos);
      const grams = gramsForKcal(budget, per100);
      return [
        kgDe(kilos),
        amountDe(budget, 0),
        gramsDe(grams),
        countDe(unitsOf(grams, piece.grams)),
        ...(ceiling === undefined
          ? []
          : [
              gramsDe(
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

const pieceTable = (words: Words): FoodTableDe => {
  const piece = pieceOf(words);
  const kcal = kcalOfPiece(words);
  const sodium = sodiumOf(words, piece.grams);
  return {
    id: 'mengen',
    heading: `Was ${piece.a} für das Leckerli-Budget bedeutet`,
    paragraphs: [
      `${pieceLine(words)}${sodium === undefined ? '' : ` Dazu kommen ${amountDe(sodium, 0)} mg Natrium (USDA).`}`,
      BUDGET_NOTE,
    ],
    columns: [
      'Gewicht des Hundes',
      'Leckerli-Budget (kcal am Tag)',
      `${capitalized(piece.a)} (${amountDe(kcal, 0)} kcal) sind`,
    ],
    rows: KILOS.map((kilos) => {
      const budget = treatKcalAt(kilos);
      return [kgDe(kilos), amountDe(budget, 0), `${percentDe(kcal.div(budget))} davon`];
    }),
  };
};

const tableOf = (words: Words): FoodTableDe | undefined => {
  const { food } = words;
  if (food.thresholds !== undefined) return thresholdTable(words, food.thresholds);
  if (food.usda === undefined) return undefined;
  return food.verdict === 'avoid' ? pieceTable(words) : budgetTable(words);
};

const leadFigure = (words: Words): string => {
  const { food, de } = words;
  const first = food.thresholds?.[0];
  if (first !== undefined)
    return `Für einen Hund von ${kgDe(LEAD_KILOS)} liegt ${de.thresholds?.[0]?.lead ?? ''} bei ${thresholdCell(words, first, LEAD_KILOS)}.`;
  if (food.usda === undefined) return '';
  const piece = pieceOf(words);
  if (food.verdict === 'avoid') {
    const kcal = kcalOfPiece(words);
    return `${capitalized(piece.a)} hat ${amountDe(kcal, 0)} kcal, ${percentDe(kcal.div(treatKcalAt(LEAD_KILOS)))} des täglichen Leckerli-Budgets eines Hundes von ${kgDe(LEAD_KILOS)}.`;
  }
  const budget = treatKcalAt(LEAD_KILOS);
  const grams = gramsForKcal(budget, exact(food.usda.kcalPer100g));
  return `Für einen Hund von ${kgDe(LEAD_KILOS)} entspricht das ganze Leckerli-Budget eines Tages (${amountDe(budget, 0)} kcal) etwa ${gramsDe(grams)} ${de.name}, ${counted(unitsOf(grams, piece.grams), piece.one, piece.many)}, ohne jedes andere Leckerli an diesem Tag.`;
};

const SERVE_HEADINGS: Readonly<Record<Verdict, (name: string) => string>> = {
  safe: (name) => `So geben Sie Ihrem Hund ${name}`,
  moderation: (name) => `So geben Sie ${name} ohne Risiko`,
  avoid: (name) => `Wenn Ihr Hund ${name} gefressen hat`,
  toxic: (name) => `Ihr Hund hat ${name} gefressen: Was jetzt zu tun ist`,
};

const WHY_HEADINGS: Readonly<Record<Verdict, string>> = {
  safe: 'Warum es unbedenklich ist',
  moderation: 'Warum nur wenig',
  avoid: 'Warum besser meiden',
  toxic: 'Warum es für Hunde giftig ist',
};

/** A German "Dürfen Hunde … essen?" page, answered first and worked at four weights in kg. */
export interface FoodPageDe {
  readonly id: string;
  readonly path: string;
  /** The English page of the same food: the hreflang twin. */
  readonly twin: string;
  readonly verdict: Verdict;
  readonly title: string;
  readonly description: string;
  readonly h1: string;
  readonly lead: string;
  /** The day the German-language sources were read: the byline's review day. */
  readonly checked: string;
  /** The day the English-language sources were read. */
  readonly checkedEnglish: string;
  readonly callNow: boolean;
  readonly sections: readonly GuideSection[];
  readonly table?: FoodTableDe;
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

/** The German address of food `id`, from the route table. */
const pathDeOf = (id: string): string => hrefOf(`food-${id}`, 'de');

const uniqueByUrl = (sources: readonly PageSource[]): PageSource[] =>
  sources.filter((source, index) => sources.findIndex(({ url }) => url === source.url) === index);

const titleOf = ({ de }: Words): string => {
  const base = `Dürfen Hunde ${de.name} essen? ${de.short}`;
  const branded = `${base} | Bowl Figures`;
  return branded.length <= 65 ? branded : base;
};

const DESCRIPTION_TAILS: Readonly<Record<Verdict, string>> = {
  safe: 'Mengen nach Gewicht, mit Quellen.',
  moderation: 'Mengen nach Gewicht, und was tabu ist.',
  avoid: 'Warum, und was tun, wenn er davon gefressen hat.',
  toxic: 'Was jetzt zu tun ist.',
};

const descriptionOf = ({ food, de }: Words): string => {
  const full = `${de.summary} ${DESCRIPTION_TAILS[food.verdict]}`;
  return full.length <= 160 ? full : de.summary;
};

const pageOf = (de: FoodDe): FoodPageDe => {
  const food = englishOf(de.id);
  const words: Words = { food, de };
  const copy = VERDICT_DE[food.verdict];
  const table = tableOf(words);
  const sections: GuideSection[] = [
    { id: 'warum', heading: WHY_HEADINGS[food.verdict], paragraphs: de.why },
    { id: 'geben', heading: SERVE_HEADINGS[food.verdict](de.name), paragraphs: de.serve },
    {
      id: 'nie',
      heading: food.verdict === 'toxic' ? 'Jede Form, die tabu ist' : 'Was Sie nie geben sollten',
      paragraphs: de.never,
    },
    ...(de.signs === undefined
      ? []
      : [{ id: 'anzeichen', heading: 'Anzeichen, und wann sie auftreten', paragraphs: de.signs }]),
    ...(de.disagree === undefined
      ? []
      : [
          {
            id: 'quellen-uneins',
            heading: 'Wo die Quellen sich widersprechen',
            paragraphs: de.disagree,
          },
        ]),
  ];
  const related = FOODS_DE.filter(
    (other) => other.id !== de.id && englishOf(other.id).verdict === food.verdict,
  ).map((other) => ({ href: pathDeOf(other.id), label: other.name }));
  return {
    id: de.id,
    path: pathDeOf(de.id),
    twin: foodPathOf(food.id),
    verdict: food.verdict,
    title: titleOf(words),
    description: descriptionOf(words),
    h1: `Dürfen Hunde ${de.name} essen? ${copy.word} – ${de.answer}`,
    lead: [`${copy.word} – ${de.answer}.`, de.summary, leadFigure(words)]
      .filter((part) => part !== '')
      .join(' '),
    checked: SOURCES_DE_CHECKED,
    checkedEnglish: FOODS_CHECKED,
    callNow: food.verdict === 'toxic',
    sections,
    ...(table === undefined ? {} : { table }),
    ...(food.sizeGuide === undefined || de.sizeGuide === undefined
      ? {}
      : {
          sizeGuide: {
            heading: `Die Portionstabelle von ${food.sizeGuide.by} nach Größe`,
            note: de.sizeGuide.note,
            columns: ['Größe des Hundes', 'Menge'],
            rows: de.sizeGuide.rows,
          },
        }),
    questions: de.questions,
    related,
    links: [
      ...(de.id === 'chocolate'
        ? [
            {
              href: hrefOf('chocolate-guide', 'de'),
              label: 'Hund hat Schokolade gefressen: die Dosis und was jetzt zu tun ist',
            },
          ]
        : []),
      {
        href: hrefOf('foods', 'de'),
        label: 'Was dürfen Hunde essen? Alle Lebensmittel auf einer Seite',
      },
    ],
    sources: uniqueByUrl([
      ...food.sources,
      ...(food.usda === undefined ? [] : [usdaSource(food.usda.fdc, food.usda.description)]),
      ...(food.usda === undefined || food.thresholds !== undefined
        ? []
        : [S.vcaTreats, S.akcTreats, S.merckEnergy]),
      ...(food.verdict === 'toxic' ? [S.aspcaLine] : []),
      ...de.sources,
    ]),
  };
};

/** The German food pages, in the order of the route table. */
export const FOOD_PAGES_DE: readonly FoodPageDe[] = FOODS_DE.map(pageOf);

/** The German food page at `path`. */
export const foodPageDeOf = (path: string): FoodPageDe => {
  const found = FOOD_PAGES_DE.find((candidate) => candidate.path === path);
  if (found === undefined) throw new Error(`no German food page ${path}`);
  return found;
};

const HUB_ORDER: readonly Verdict[] = ['toxic', 'avoid', 'moderation', 'safe'];

/** The German hub: every German food, grouped by verdict, worst first. */
export const FOOD_HUB_DE = {
  path: hrefOf('foods', 'de'),
  twin: hrefOf('foods'),
  title: 'Was dürfen Hunde essen? Von giftig bis sicher | Bowl Figures',
  description: `Was dürfen Hunde essen und was nicht? ${String(FOODS_DE.length)} Lebensmittel mit Urteil aus tierärztlichen Quellen, Mengen nach Körpergewicht und wann Sie anrufen müssen.`,
  h1: 'Was dürfen Hunde essen? Lebensmittel von giftig bis unbedenklich',
  lead: `${String(FOODS_DE.length)} Lebensmittel, nach denen Hundehalter fragen, jedes mit einem Urteil aus tierärztlichen Quellen und einer Seite, die die Mengen für Hunde von 5, 10, 20 und 35 kg ausrechnet.`,
  checked: SOURCES_DE_CHECKED,
  checkedEnglish: FOODS_CHECKED,
  callNote: CALL_DE,
  sections: [
    {
      id: 'urteile',
      heading: 'Wie die Urteile zustande kommen',
      paragraphs: [
        'Giftig heißt: Eine tierärztliche Quelle nennt das Lebensmittel giftig für Hunde. Besser meiden heißt: nicht giftig, aber die Quellen raten wegen Salz, Fett, Kernen oder Knochen davon ab. In kleinen Mengen heißt: pur unbedenklich, mit einem Haken, den die Seite nennt. Unbedenklich heißt: für die meisten Hunde in Ordnung, pur und so zubereitet, wie es die Seite beschreibt.',
        'Jedes Urteil nennt seine Quellen mit dem Tag, an dem die Redaktion sie gelesen hat, und sagt, wo sie sich widersprechen. Die Quellen sind überwiegend amerikanische tierärztliche Werke (das Merck Veterinary Manual, das ASPCA Animal Poison Control Center, AKC, PetMD, VCA); wo eine deutschsprachige tierärztliche Einrichtung dasselbe sagt, steht sie daneben. Kein Urteil ersetzt Ihre Tierärztin oder Ihren Tierarzt, die Ihren Hund und seine Medikamente kennen.',
      ],
    },
    {
      id: 'budget',
      heading: 'Das 10-%-Leckerli-Budget',
      paragraphs: [
        'Auch ein unbedenkliches Lebensmittel ist ein Leckerli. VCA schreibt mit der Canadian Academy of Veterinary Nutrition, dass 90 % der Kalorien eines Hundes aus seinem Allein- oder Vollfutter kommen sollten und höchstens 10 % aus Leckerlis und Snacks; AKC nennt dieselbe Regel. Die Tabelle rechnet diese 10 % für einen kastrierten erwachsenen Hund mit dem Erhaltungsbedarf nach Merck aus, und jede Lebensmittelseite macht daraus Gramm und Stück.',
      ],
    },
  ] satisfies readonly GuideSection[],
  budgetColumns: ['Gewicht des Hundes', 'Kalorien am Tag (kcal)', 'Leckerli-Budget (kcal)'],
  budget: KILOS.map((kilos) => [
    kgDe(kilos),
    amountDe(dogEnergy('neutered', Rational.of(kilos)).mer, 0),
    amountDe(treatKcalAt(kilos), 0),
  ]),
  groups: HUB_ORDER.map((verdict) => ({
    verdict,
    heading: VERDICT_DE[verdict].heading,
    intro: VERDICT_DE[verdict].intro,
    rows: FOODS_DE.filter((de) => englishOf(de.id).verdict === verdict)
      .map((de) => ({ href: pathDeOf(de.id), name: de.name, summary: de.summary }))
      .sort((a, b) => a.name.localeCompare(b.name, 'de')),
  })).filter(({ rows }) => rows.length > 0),
  sources: [S.aspcaFoods, S.vcaTreats, S.akcTreats, S.merckEnergy, ...DE.hub],
};
