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
import { FRUIT_ES } from './foods/fruit.ts';
import { PANTRY_ES } from './foods/pantry.ts';
import { PROTEIN_ES } from './foods/protein.ts';
import { ES, SOURCES_ES_CHECKED } from './foods/sources.ts';
import type { FoodEs } from './foods/types.ts';
import { VEGETABLES_ES } from './foods/vegetables.ts';
import { amountEs, countEs, gramsEs, kgEs, percentEs } from './format.ts';
import { CALL_ES } from './texts.ts';

/** Every Spanish food, in the order of the English route table. */
export const FOODS_ES: readonly FoodEs[] = [
  ...FRUIT_ES,
  ...VEGETABLES_ES,
  ...PROTEIN_ES,
  ...PANTRY_ES,
];

/** The dog weights every Spanish page works its figures at, in kilograms: small to large. */
export const KILOS = [5, 10, 20, 35] as const;

/** The weight the lead works its figure at: a medium dog. */
const LEAD_KILOS = 10;

/** How the Spanish pages and the hub word each verdict. */
export const VERDICT_ES: Readonly<
  Record<Verdict, { readonly word: string; readonly heading: string; readonly intro: string }>
> = {
  toxic: {
    word: 'No',
    heading: 'Tóxicos: nunca se los des',
    intro:
      'Tóxicos para los perros según las fuentes citadas. Si tu perro comió alguno, llama ya a tu veterinario o a una clínica veterinaria de urgencias.',
  },
  avoid: {
    word: 'Mejor evitarlo',
    heading: 'No son tóxicos, pero mejor evitarlos',
    intro:
      'La sal, la grasa, los huesos o las semillas los vuelven un mal premio, aunque un bocado rara vez sea una urgencia.',
  },
  moderation: {
    word: 'Sí, con moderación',
    heading: 'Sí, en poca cantidad',
    intro:
      'Seguros al natural y en trozos pequeños, con una reserva: el azúcar, la grasa, la lactosa o una parte que hay que quitar.',
  },
  safe: {
    word: 'Sí',
    heading: 'Un buen premio al natural',
    intro:
      'Seguros para la mayoría de los perros, al natural y preparados como explica la página, dentro del presupuesto de premios.',
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

/**
 * A count with its noun as the page writes it: Spanish takes the singular for exactly one (`1
 * fresa`) and the plural for every other figure, decimals included (`1,1 fresas`).
 */
const counted = (count: Rational, one: string, many: string): string => {
  const text = countEs(count);
  return `${text} ${text === '1' ? one : many}`;
};

interface Words {
  readonly food: Food;
  readonly es: FoodEs;
}

const pieceOf = ({ food, es }: Words) => {
  if (food.piece === undefined || es.piece === undefined)
    throw new Error(`${food.id} has no piece`);
  return { ...es.piece, grams: exact(es.piece.grams ?? food.piece.grams) };
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
      const unit = words.es.thresholds?.[index]?.unit;
      if (unit === undefined) throw new Error(`${words.food.id}: no Spanish unit`);
      return counted(count, unit.one, unit.many);
    }
    const piece = pieceOf(words);
    return `${counted(count, piece.one, piece.many)} (${gramsEs(count.mul(piece.grams))})`;
  }
  if (threshold.gramsPerKg === undefined) throw new Error(`${words.food.id}: no dose`);
  const grams = threshold.gramsPerKg.mul(Rational.of(kilos));
  const piece = pieceOf(words);
  const compound = words.food.compound;
  if (compound !== undefined) {
    const [most, least] = compound.perPiece;
    return `${gramsEs(grams)} de ${words.es.compound ?? ''}: de ${countEs(unitsOf(grams, most))} a ${countEs(unitsOf(grams, least))} ${piece.many}`;
  }
  return `${gramsEs(grams)}, unos ${counted(unitsOf(grams, piece.grams), piece.one, piece.many)}`;
};

/** The table a Spanish food page shows after its first section, worked at the four weights. */
export interface FoodTableEs {
  readonly id: string;
  readonly heading: string;
  readonly paragraphs: readonly string[];
  readonly columns: readonly string[];
  readonly rows: readonly (readonly string[])[];
}

const BUDGET_NOTE =
  'El presupuesto es el 10 % de las calorías del día, lo máximo que VCA y el AKC admiten para todos los premios juntos, para un perro adulto esterilizado cuyas necesidades de mantenimiento siguen el Merck Veterinary Manual (1,6 × 70 × kg^0,75). Los cachorros, los perros de trabajo y los perros a dieta tienen otras necesidades: coméntalo con tu veterinario.';

const thresholdTable = (words: Words, thresholds: readonly Threshold[]): FoodTableEs => ({
  id: 'cantidades',
  heading:
    words.food.verdict === 'toxic'
      ? 'A partir de qué cantidad es peligroso, según el peso'
      : 'Las cantidades máximas de las fuentes, según el peso',
  paragraphs: words.es.thresholdNote === undefined ? [] : [words.es.thresholdNote],
  columns: [
    'Peso del perro',
    ...thresholds.map((_, index) => words.es.thresholds?.[index]?.label ?? ''),
  ],
  rows: KILOS.map((kilos) => [
    kgEs(kilos),
    ...thresholds.map((threshold) => thresholdCell(words, threshold, kilos)),
  ]),
});

const pieceLine = (words: Words): string => {
  const piece = pieceOf(words);
  const kcal = kcalOfPiece(words);
  const share = (kilos: number) => percentEs(kcal.div(treatKcalAt(kilos)));
  return `${capitalized(piece.a)} (${gramsEs(piece.grams)}; ${piece.basis}) aporta ${amountEs(kcal, 0)} kcal: el ${share(5)} del presupuesto de premios de un perro de 5 kg y el ${share(35)} del de un perro de 35 kg.`;
};

const usdaLine = ({ food, es }: Words): string => {
  if (food.usda === undefined) throw new Error(`${food.id} has no USDA record`);
  const kcal = exact(food.usda.kcalPer100g);
  return `Según el USDA, 100 g ${es.usdaName ?? `de ${es.food}`} aportan ${amountEs(kcal, kcal.isInteger() ? 0 : 1)} kcal.`;
};

const budgetTable = (words: Words): FoodTableEs => {
  const { food, es } = words;
  const usda = food.usda;
  if (usda === undefined) throw new Error(`${food.id} has no USDA record`);
  const piece = pieceOf(words);
  const per100 = exact(usda.kcalPer100g);
  const ceiling = food.ceiling;
  return {
    id: 'cantidades',
    heading: `El presupuesto de premios del día en ${es.food}, según el peso`,
    paragraphs: [`${usdaLine(words)} ${pieceLine(words)}`, BUDGET_NOTE],
    columns: [
      'Peso del perro',
      'Presupuesto de premios (kcal al día)',
      `${es.name}: todo el presupuesto`,
      `Cantidad: ${piece.many}`,
      ...(ceiling === undefined ? [] : [es.ceiling ?? '']),
    ],
    rows: KILOS.map((kilos) => {
      const budget = treatKcalAt(kilos);
      const grams = gramsForKcal(budget, per100);
      return [
        kgEs(kilos),
        amountEs(budget, 0),
        gramsEs(grams),
        countEs(unitsOf(grams, piece.grams)),
        ...(ceiling === undefined
          ? []
          : [
              gramsEs(
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

const pieceTable = (words: Words): FoodTableEs => {
  const piece = pieceOf(words);
  const kcal = kcalOfPiece(words);
  const sodium = sodiumOf(words, piece.grams);
  return {
    id: 'cantidades',
    heading: `Lo que supone ${piece.a} en el presupuesto de premios`,
    paragraphs: [
      `${pieceLine(words)}${sodium === undefined ? '' : ` A eso se suman ${amountEs(sodium, 0)} mg de sodio (USDA).`}`,
      BUDGET_NOTE,
    ],
    columns: [
      'Peso del perro',
      'Presupuesto de premios (kcal al día)',
      `${capitalized(piece.a)} (${amountEs(kcal, 0)} kcal) supone`,
    ],
    rows: KILOS.map((kilos) => {
      const budget = treatKcalAt(kilos);
      return [
        kgEs(kilos),
        amountEs(budget, 0),
        `el ${percentEs(kcal.div(budget))} del presupuesto`,
      ];
    }),
  };
};

const tableOf = (words: Words): FoodTableEs | undefined => {
  const { food } = words;
  if (food.thresholds !== undefined) return thresholdTable(words, food.thresholds);
  if (food.usda === undefined) return undefined;
  return food.verdict === 'avoid' ? pieceTable(words) : budgetTable(words);
};

const leadFigure = (words: Words): string => {
  const { food, es } = words;
  const first = food.thresholds?.[0];
  if (first !== undefined)
    return `Para un perro de ${kgEs(LEAD_KILOS)}, ${es.thresholds?.[0]?.lead ?? ''} está en ${thresholdCell(words, first, LEAD_KILOS)}.`;
  if (food.usda === undefined) return '';
  const piece = pieceOf(words);
  if (food.verdict === 'avoid') {
    const kcal = kcalOfPiece(words);
    return `${capitalized(piece.a)} aporta ${amountEs(kcal, 0)} kcal, el ${percentEs(kcal.div(treatKcalAt(LEAD_KILOS)))} del presupuesto diario de premios de un perro de ${kgEs(LEAD_KILOS)}.`;
  }
  const budget = treatKcalAt(LEAD_KILOS);
  const grams = gramsForKcal(budget, exact(food.usda.kcalPer100g));
  return `Para un perro de ${kgEs(LEAD_KILOS)}, todo el presupuesto de premios del día (${amountEs(budget, 0)} kcal) equivale a unos ${gramsEs(grams)} de ${es.food}, es decir ${counted(unitsOf(grams, piece.grams), piece.one, piece.many)}, sin ningún otro premio ese día.`;
};

const SERVE_HEADINGS: Readonly<Record<Verdict, (food: string) => string>> = {
  safe: (food) => `Cómo darle ${food} a tu perro`,
  moderation: (food) => `Cómo darle ${food} sin riesgo`,
  avoid: (food) => `Si tu perro comió ${food}`,
  toxic: (food) => `Tu perro comió ${food}: qué hacer ahora`,
};

const WHY_HEADINGS: Readonly<Record<Verdict, string>> = {
  safe: 'Por qué no le hace daño',
  moderation: 'Por qué solo un poco',
  avoid: 'Por qué mejor no',
  toxic: 'Por qué los perros se intoxican',
};

/** A Spanish "¿Los perros pueden comer …?" page, answered first and worked at four weights in kg. */
export interface FoodPageEs {
  readonly id: string;
  readonly path: string;
  /** The English page of the same food: the hreflang twin. */
  readonly twin: string;
  readonly verdict: Verdict;
  readonly title: string;
  readonly description: string;
  readonly h1: string;
  readonly lead: string;
  /** The day the Spanish-language sources were read: the byline's review day. */
  readonly checked: string;
  /** The day the English-language sources were read. */
  readonly checkedEnglish: string;
  /** The day the German-language sources were read, when the page cites one. */
  readonly checkedGerman?: string;
  readonly callNow: boolean;
  readonly sections: readonly GuideSection[];
  readonly table?: FoodTableEs;
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

/** The Spanish address of food `id`, from the route table. */
const pathEsOf = (id: string): string => hrefOf(`food-${id}`, 'es');

const uniqueByUrl = (sources: readonly PageSource[]): PageSource[] =>
  sources.filter((source, index) => sources.findIndex(({ url }) => url === source.url) === index);

const GERMAN_URLS: ReadonlySet<string> = new Set(Object.values(SOURCES_DE).map(({ url }) => url));

/** The question as the searches word it (`los perros pueden comer fresas`), answered at once. */
const questionOf = ({ es }: Words): string => `¿Los perros pueden comer ${es.food}?`;

const titleOf = (words: Words): string => {
  const base = `${questionOf(words)} ${words.es.short}`;
  const branded = `${base} | Bowl Figures`;
  return branded.length <= 65 ? branded : base;
};

const DESCRIPTION_TAILS: Readonly<Record<Verdict, string>> = {
  safe: 'Cantidades según el peso, con las fuentes.',
  moderation: 'Cantidades según el peso, y lo que nunca debe comer.',
  avoid: 'Por qué, y qué hacer si ya lo comió.',
  toxic: 'Qué hacer ahora.',
};

const descriptionOf = ({ food, es }: Words): string => {
  const full = `${es.summary} ${DESCRIPTION_TAILS[food.verdict]}`;
  return full.length <= 160 ? full : es.summary;
};

const pageOf = (es: FoodEs): FoodPageEs => {
  const food = englishOf(es.id);
  const words: Words = { food, es };
  const copy = VERDICT_ES[food.verdict];
  const table = tableOf(words);
  const sections: GuideSection[] = [
    { id: 'por-que', heading: WHY_HEADINGS[food.verdict], paragraphs: es.why },
    { id: 'como-darlo', heading: SERVE_HEADINGS[food.verdict](es.food), paragraphs: es.serve },
    {
      id: 'nunca',
      heading:
        food.verdict === 'toxic' ? 'Todas las formas que debes evitar' : 'Lo que nunca debes darle',
      paragraphs: es.never,
    },
    ...(es.signs === undefined
      ? []
      : [{ id: 'signos', heading: 'Los signos, y cuándo aparecen', paragraphs: es.signs }]),
    ...(es.disagree === undefined
      ? []
      : [
          {
            id: 'fuentes-discrepan',
            heading: 'Donde las fuentes no coinciden',
            paragraphs: es.disagree,
          },
        ]),
  ];
  const related = FOODS_ES.filter(
    (other) => other.id !== es.id && englishOf(other.id).verdict === food.verdict,
  ).map((other) => ({ href: pathEsOf(other.id), label: other.name }));
  const sources = uniqueByUrl([
    ...food.sources,
    ...(food.usda === undefined ? [] : [usdaSource(food.usda.fdc, food.usda.description)]),
    ...(food.usda === undefined || food.thresholds !== undefined
      ? []
      : [S.vcaTreats, S.akcTreats, S.merckEnergy]),
    ...(food.verdict === 'toxic' ? [S.aspcaLine] : []),
    ...es.sources,
  ]);
  return {
    id: es.id,
    path: pathEsOf(es.id),
    twin: foodPathOf(food.id),
    verdict: food.verdict,
    title: titleOf(words),
    description: descriptionOf(words),
    h1: `${questionOf(words)} ${copy.word} – ${es.answer}`,
    lead: [`${copy.word} – ${es.answer}.`, es.summary, leadFigure(words)]
      .filter((part) => part !== '')
      .join(' '),
    checked: SOURCES_ES_CHECKED,
    checkedEnglish: FOODS_CHECKED,
    ...(sources.some(({ url }) => GERMAN_URLS.has(url))
      ? { checkedGerman: SOURCES_DE_CHECKED }
      : {}),
    callNow: food.verdict === 'toxic',
    sections,
    ...(table === undefined ? {} : { table }),
    ...(food.sizeGuide === undefined || es.sizeGuide === undefined
      ? {}
      : {
          sizeGuide: {
            heading: `La tabla de porciones de ${food.sizeGuide.by} según el tamaño`,
            note: es.sizeGuide.note,
            columns: ['Tamaño del perro', 'Cantidad'],
            rows: es.sizeGuide.rows,
          },
        }),
    questions: es.questions,
    related,
    links: [
      ...(es.id === 'chocolate'
        ? [
            {
              href: hrefOf('chocolate-guide', 'es'),
              label: '¿Qué pasa si un perro come chocolate? La dosis y qué hacer ahora',
            },
          ]
        : []),
      {
        href: hrefOf('foods', 'es'),
        label: '¿Qué frutas pueden comer los perros? Todos los alimentos en una página',
      },
    ],
    sources,
  };
};

/** The Spanish food pages, in the order of the route table. */
export const FOOD_PAGES_ES: readonly FoodPageEs[] = FOODS_ES.map(pageOf);

/** The Spanish food page at `path`. */
export const foodPageEsOf = (path: string): FoodPageEs => {
  const found = FOOD_PAGES_ES.find((candidate) => candidate.path === path);
  if (found === undefined) throw new Error(`no Spanish food page ${path}`);
  return found;
};

const HUB_ORDER: readonly Verdict[] = ['toxic', 'avoid', 'moderation', 'safe'];

/**
 * The foods the hub answers the fruit question with: the fruit of the route table and the avocado,
 * which a Spanish-speaking reader buys as a fruit.
 */
const FRUIT_IDS: ReadonlySet<string> = new Set([...FRUIT_ES.map(({ id }) => id), 'avocado']);

const hubRowOf = (es: FoodEs) => ({
  href: pathEsOf(es.id),
  name: es.name,
  verdict: englishOf(es.id).verdict,
  word: VERDICT_ES[englishOf(es.id).verdict].word,
  summary: es.summary,
});

const byName = (a: { readonly name: string }, b: { readonly name: string }): number =>
  a.name.localeCompare(b.name, 'es');

const FRUITS_ES = FOODS_ES.filter(({ id }) => FRUIT_IDS.has(id));
const toxicFruits = FRUITS_ES.filter(({ id }) => englishOf(id).verdict === 'toxic').map(
  ({ name }) => name.toLowerCase(),
);

/**
 * The Spanish hub, at the address of the measured search (`qué frutas pueden comer los perros`):
 * every fruit with its answer first, then every other food, grouped by verdict, worst first.
 */
export const FOOD_HUB_ES = {
  path: hrefOf('foods', 'es'),
  twin: hrefOf('foods'),
  title: '¿Qué frutas pueden comer los perros? Seguras y tóxicas',
  description: `Qué frutas pueden comer los perros y cuáles no: ${String(FRUITS_ES.length)} frutas y ${String(FOODS_ES.length - FRUITS_ES.length)} alimentos más, con fuentes veterinarias y cantidades según el peso.`,
  h1: '¿Qué frutas pueden comer los perros? Y el resto de alimentos, de tóxico a seguro',
  lead: `Casi todas las frutas son un buen premio en poca cantidad; las ${toxicFruits.join(' y las ')} no, son tóxicas. Aquí están ${String(FRUITS_ES.length)} frutas y ${String(FOODS_ES.length - FRUITS_ES.length)} alimentos más, cada uno con un veredicto sacado de fuentes veterinarias y una página que calcula las cantidades para perros de 5, 10, 20 y 35 kg.`,
  checked: SOURCES_ES_CHECKED,
  checkedEnglish: FOODS_CHECKED,
  callNote: CALL_ES,
  fruits: {
    heading: 'Las frutas, una por una',
    intro:
      'Lavadas, sin hueso, sin semillas ni cáscara dura y en trozos pequeños, la mayoría de las frutas caben en el presupuesto de premios. Cada fila lleva a su página, con la cantidad para el peso de tu perro.',
    rows: FRUITS_ES.map(hubRowOf).sort(byName),
  },
  sections: [
    {
      id: 'veredictos',
      heading: 'Cómo se decide cada veredicto',
      paragraphs: [
        'Tóxico quiere decir que una fuente veterinaria califica el alimento de tóxico para los perros. Mejor evitarlo quiere decir que no es tóxico, pero las fuentes lo desaconsejan por la sal, la grasa, los huesos o las semillas. Con moderación quiere decir que es seguro al natural, con una reserva que la página explica. Sí quiere decir que le sienta bien a la mayoría de los perros, al natural y preparado como explica la página.',
        'Cada veredicto cita sus fuentes con la fecha en que el equipo editorial las leyó, y dice dónde no coinciden. Son sobre todo obras veterinarias de Estados Unidos (el Merck Veterinary Manual, el ASPCA Animal Poison Control Center, el AKC, PetMD y VCA); en los alimentos tóxicos se cita también la edición en español del manual, el Manual de veterinaria de MSD. Ningún veredicto sustituye a tu veterinario, que conoce a tu perro y sus medicamentos.',
      ],
    },
    {
      id: 'presupuesto',
      heading: 'El presupuesto de premios del 10 %',
      paragraphs: [
        'Hasta un alimento seguro sigue siendo un premio. VCA escribe, con la Canadian Academy of Veterinary Nutrition, que el 90 % de las calorías de un perro debería venir de su alimento completo y como mucho el 10 % de premios y botanas; el AKC da la misma regla. La tabla calcula ese 10 % para un perro adulto esterilizado cuyas necesidades de mantenimiento siguen el Merck Veterinary Manual, y cada página de alimento lo traduce a gramos y piezas.',
      ],
    },
  ] satisfies readonly GuideSection[],
  budgetColumns: ['Peso del perro', 'Calorías al día (kcal)', 'Presupuesto de premios (kcal)'],
  budget: KILOS.map((kilos) => [
    kgEs(kilos),
    amountEs(dogEnergy('neutered', Rational.of(kilos)).mer, 0),
    amountEs(treatKcalAt(kilos), 0),
  ]),
  othersHeading: 'Verduras, carnes, lácteos y despensa',
  groups: HUB_ORDER.map((verdict) => ({
    verdict,
    heading: VERDICT_ES[verdict].heading,
    intro: VERDICT_ES[verdict].intro,
    rows: FOODS_ES.filter((es) => !FRUIT_IDS.has(es.id) && englishOf(es.id).verdict === verdict)
      .map(hubRowOf)
      .sort(byName),
  })).filter(({ rows }) => rows.length > 0),
  sources: [S.aspcaFoods, S.vcaTreats, S.akcTreats, S.merckEnergy, ...ES.hub],
};
