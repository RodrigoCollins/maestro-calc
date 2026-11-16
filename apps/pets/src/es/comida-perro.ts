import { Rational } from '@maestro-calc/core';
import { dogFood } from '@maestro-calc/pets-core/dog-food';
import { DOG_STATUSES, type DogStatus } from '@maestro-calc/pets-core/energy';
import type { FeedingPage } from '../calc/dog.ts';
import { FEED_CHECKED, FEED_SOURCES } from '../feed-by-weight.ts';
import type { CalcArticle, GuideTable } from '../guides.ts';
import { hrefOf } from '../routes.ts';
import { amountEs } from './format.ts';

/**
 * The day the Spanish feeding pages were written against their sources. They cite the English
 * sources of the feeding pages only (read on `FEED_CHECKED`): no Spanish-language source of the
 * formula or the factors was read.
 */
export const COMIDA_ES_CHECKED = '2026-11-15';

/** The day the English sources of the Spanish feeding pages were read. */
export const COMIDA_ENGLISH_CHECKED = FEED_CHECKED;

/** The dry food the Spanish pages assume, as an example only: 3600 kcal a kilogram. */
export const FOOD_KCAL_KG = 3600;

/** The weight the Spanish calculator opens at, and its article works through, in kilograms. */
export const START_KG = 20;

/** Each status of a dog as the Spanish pages name it, in the engine order. */
export const STATUS_ES: Readonly<Record<DogStatus, string>> = {
  neutered: 'Adulto castrado o esterilizado',
  intact: 'Adulto sin castrar',
  inactive: 'Poco activo o con tendencia a engordar',
  'weight-loss': 'Con un plan para adelgazar (usa el peso ideal)',
  'puppy-young': 'Cachorro de menos de 4 meses',
  'puppy-older': 'Cachorro de 4 meses o más',
};

/** Merck's factor of each status, as the Spanish pages write it (the engine holds the figure). */
const FACTOR_ES: Readonly<Record<DogStatus, string>> = {
  neutered: '1,6',
  intact: '1,8',
  inactive: '1,4',
  'weight-loss': '1,0',
  'puppy-young': '3,0',
  'puppy-older': '2,0',
};

/**
 * The figure `key` of the dog food engine for a dog of `kg` kilograms and `status`, on a label of
 * `kcal` per kilogram unless `basis` says otherwise.
 */
export const dogFigureKg = (
  kg: number,
  key: string,
  {
    status = 'neutered',
    basis = 'kg',
    kcal = FOOD_KCAL_KG,
  }: { status?: DogStatus; basis?: 'cup' | 'kg' | 'can'; kcal?: number } = {},
): Rational => {
  const ran = dogFood.run({
    weight: String(kg),
    unit: 'kg',
    status,
    basis,
    kcal: String(kcal),
  });
  if (!ran.ok) throw new Error(`the dog food ${String(kg)} kg did not run`);
  const value = ran.value.outputs.find((output) => output.key === key)?.value;
  if (!(value instanceof Rational)) throw new Error(`no output ${key}`);
  return value;
};

/** Kilocalories to the whole number, Spanish style. */
export const kcalEs = (value: Rational): string => amountEs(value, 0);

const VET =
  'Es un punto de partida, no una prescripción: según el Merck Veterinary Manual, un perro puede necesitar hasta un 30 % más o menos. Consulta la cantidad con tu veterinario y pesa a tu perro cada pocas semanas.';
const TREATS =
  'El alimento completo y equilibrado debe ser al menos el 90 % de las calorías del día, y los premios, como mucho, el 10 % (AAHA, 2021). Un día con premios, da el 90 % de la cantidad.';
const LABEL = `Busca en la etiqueta las kilocalorías por kilo (kcal/kg); si tu bolsa las da por 100 g, multiplica la cifra por 10. La calculadora parte de ${amountEs(Rational.of(FOOD_KCAL_KG))} kcal por kilo solo como ejemplo: escribe la cifra de tu alimento.`;

/**
 * The Spanish dog food calculator, at the searches `calculadora de comida para perros` and
 * `cuántos gramos de comida debe comer un perro`: the engine of `/dog-food-calculator`, opened
 * in kilograms and grams, the units a Spanish label uses.
 */
export const COMIDA_PERRO_PAGE: FeedingPage = {
  path: hrefOf('dog', 'es'),
  title: 'Calculadora de comida para perros: gramos al día | Bowl Figures',
  description:
    '¿Cuánta comida necesita tu perro al día? Calorías y gramos según su peso y la etiqueta de su alimento, con las fórmulas del Merck y de la AAHA.',
  kicker: 'Perros · Ración · Gratis',
  h1: 'Calculadora de comida para perros: cuántos gramos al día',
  lead: 'Escribe el peso de tu perro y las calorías que indica la etiqueta de su alimento. Obtienes las calorías del día y los gramos, tazas o latas que las aportan.',
  fields: {
    weight: { label: 'Peso de tu perro' },
    unit: { label: 'Unidad', options: { lb: 'libras', kg: 'kilos' } },
    status: { label: 'Etapa de vida y estado', options: STATUS_ES },
    basis: {
      label: 'La etiqueta da las calorías por',
      options: { cup: 'taza', kg: 'kilo', can: 'lata' },
    },
    kcal: { label: 'Calorías de la etiqueta (kcal)' },
  },
  initial: {
    weight: String(START_KG),
    unit: 'kg',
    status: 'neutered',
    basis: 'kg',
    kcal: String(FOOD_KCAL_KG),
  },
  notes: [LABEL, VET, TREATS],
};

/** The line of the methodology the page cites under its notes. */
export const COMIDA_PERRO_METHOD =
  'Las calorías del día son 70 × (peso en kg)^0,75 × un factor de etapa de vida, según el Merck Veterinary Manual y las pautas de 2021 de la AAHA; la cantidad son esas calorías divididas por las calorías por taza, lata o kilo de tu alimento.';

/** The life stages of a 20 kg dog: the factor, the calories and the grams of each. */
export const COMIDA_PERRO_STAGES: GuideTable = {
  after: 'factores',
  id: 'tabla-etapas',
  heading: `Calorías y gramos al día de un perro de ${String(START_KG)} kg, por etapa de vida`,
  paragraphs: [
    `Cada fila es el resultado de la calculadora para un perro de ${String(START_KG)} kg con un alimento de ${amountEs(Rational.of(FOOD_KCAL_KG))} kcal por kilo. En un cachorro, el peso es el de hoy; en un plan para adelgazar, el peso ideal que fija tu veterinario.`,
  ],
  columns: [
    `Perro de ${String(START_KG)} kg`,
    'Factor (Merck)',
    'Calorías al día',
    `Gramos al día a ${amountEs(Rational.of(FOOD_KCAL_KG))} kcal/kg`,
  ],
  rows: DOG_STATUSES.map((status) => [
    STATUS_ES[status],
    FACTOR_ES[status],
    kcalEs(dogFigureKg(START_KG, 'mer', { status })),
    amountEs(dogFigureKg(START_KG, 'portion', { status }), 0),
  ]),
  linksHeading: 'Para otros pesos, de 2 a 50 kg:',
  links: [
    {
      href: hrefOf('feed', 'es'),
      label: '¿Cuánto debe comer un perro según su peso? La tabla en gramos',
    },
  ],
};

const rer = dogFigureKg(START_KG, 'rer');
const mer = dogFigureKg(START_KG, 'mer');
const grams = dogFigureKg(START_KG, 'portion');

/** The article under the calculator: the formula worked through, the factors, and a FAQ. */
export const COMIDA_PERRO_ARTICLE: CalcArticle = {
  checked: COMIDA_ES_CHECKED,
  sections: [
    {
      id: 'como-se-calcula',
      heading: 'Cómo se calcula la ración, paso a paso',
      paragraphs: [
        `Primero, la energía en reposo (RER, por sus siglas en inglés): 70 × (peso en kg)^0,75, la fórmula del Merck Veterinary Manual y de las pautas de 2021 de la AAHA. Para un perro de ${String(START_KG)} kg, ${String(START_KG)} elevado a 0,75 es ${amountEs(rer.div(Rational.of(70)), 3)}, y 70 × ${amountEs(rer.div(Rational.of(70)), 3)} = ${amountEs(rer, 1)} kcal al día.`,
        `Después, el factor de su etapa de vida: 1,6 para un adulto castrado, según el Merck. ${amountEs(rer, 1)} × 1,6 = ${kcalEs(mer)} kcal al día. Con un alimento de ${amountEs(Rational.of(FOOD_KCAL_KG))} kcal por kilo, son ${kcalEs(mer)} ÷ ${amountEs(Rational.of(FOOD_KCAL_KG))} × 1000 = ${amountEs(grams, 0)} g al día, que puedes repartir en dos comidas.`,
      ],
    },
    {
      id: 'factores',
      heading: 'El factor de cada etapa de vida',
      paragraphs: [
        'La tabla del Merck multiplica la energía en reposo por 1,6 en un adulto castrado, 1,8 en uno sin castrar, 1,4 en un perro con tendencia a engordar, 3 en un cachorro de menos de 4 meses y 2 en uno mayor. La AAHA da rangos: de 1,4 a 1,6 castrado, de 1,6 a 1,8 sin castrar, de 1,0 a 1,2 poco activo o con tendencia a la obesidad, y 1,0 sobre el peso ideal para adelgazar. El «rango» bajo el resultado va de la cifra más baja a la más alta de las dos fuentes.',
      ],
    },
  ],
  tables: [COMIDA_PERRO_STAGES],
  questions: [
    {
      question: '¿Cuántos gramos de comida debe comer un perro al día?',
      answer: `Depende de su peso y de las calorías de su alimento. Un perro adulto castrado de ${String(START_KG)} kg necesita unas ${kcalEs(mer)} kcal al día (Merck): ${amountEs(grams, 0)} g de un alimento de ${amountEs(Rational.of(FOOD_KCAL_KG))} kcal por kilo. Divide sus calorías por las de tu etiqueta y multiplica por 1000.`,
    },
    {
      question: '¿Y si la etiqueta da las calorías por taza o por lata?',
      answer:
        'Elige «taza» o «lata» en la calculadora y escribe la cifra de la etiqueta: obtienes las tazas o las latas al día, a la cuarta parte más cercana. Si mezclas seco y húmedo, reparte las mismas calorías entre los dos.',
    },
    {
      question: '¿Cuánto debe comer un cachorro?',
      answer: `Según el Merck y la AAHA, 3 veces su energía en reposo antes de los 4 meses y 2 veces desde entonces, sobre su peso de hoy. Un cachorro que hoy pesa 5 kg necesita unas ${kcalEs(dogFigureKg(5, 'mer', { status: 'puppy-young' }))} kcal al día antes de los 4 meses. Pésalo cada una o dos semanas y pregunta a tu veterinario.`,
    },
  ],
  sources: [FEED_SOURCES.merck, FEED_SOURCES.merckTable, FEED_SOURCES.aaha],
};
