import { Rational } from '@maestro-calc/core';
import { catFood } from '@maestro-calc/pets-core/cat-food';
import { CAT_STATUSES, type CatStatus } from '@maestro-calc/pets-core/energy';
import type { FeedingPage } from '../calc/dog.ts';
import { checkedText } from '../editorial.ts';
import type { CalcArticle, GuideTable, PageSource } from '../guides.ts';
import { ACCESSED, METHOD_SECTIONS } from '../methodology.ts';
import { hrefOf } from '../routes.ts';
import { amountEs } from './format.ts';

/**
 * The day the Spanish cat food page was written against its sources. It cites the English sources
 * of the English cat food calculator only (read on `ACCESSED`, the methodology's day): no
 * Spanish-language source of the formula or the factors was read.
 */
export const COMIDA_GATO_CHECKED = '2026-11-16';

/** The dry food the Spanish page assumes, as an example only: 3800 kcal a kilogram. */
export const CAT_KCAL_KG = 3800;

/** The wet food the Spanish page assumes, as an example only: 80 kcal a can or pouch. */
export const CAT_KCAL_CAN = 80;

/** The weight the Spanish calculator opens at, and its article works through, in kilograms. */
export const CAT_START_KG = 4;

/** Each status of a cat as the Spanish page names it, in the engine order. */
export const CAT_STATUS_ES: Readonly<Record<CatStatus, string>> = {
  neutered: 'Adulto castrado o esterilizado',
  intact: 'Adulto sin castrar',
  inactive: 'Poco activo o con tendencia a engordar',
  'weight-loss': 'Con un plan para adelgazar (usa el peso ideal)',
  kitten: 'Gatito en crecimiento',
};

/** The factor of each status, as the Spanish page writes it (the engine holds the figure). */
const FACTOR_ES: Readonly<Record<CatStatus, string>> = {
  neutered: '1,2',
  intact: '1,4',
  inactive: '1,0',
  'weight-loss': '0,8',
  kitten: '2,5',
};

/** The sources of the English cat food calculator: its section of the methodology. */
const ENGLISH_SOURCES: readonly PageSource[] =
  METHOD_SECTIONS.find(({ id }) => id === 'cat-food')?.sources ?? [];

/**
 * The figure `key` of the cat food engine for a cat of `kg` kilograms and `status`, on a dry label
 * of `kcal` per kilogram and dry food only.
 */
export const catFigureKg = (
  kg: number,
  key: string,
  { status = 'neutered', kcal = CAT_KCAL_KG }: { status?: CatStatus; kcal?: number } = {},
): Rational => {
  const ran = catFood.run({
    weight: String(kg),
    unit: 'kg',
    status,
    dryBasis: 'kg',
    dryKcal: String(kcal),
    wetKcal: String(CAT_KCAL_CAN),
    wetShare: '0',
  });
  if (!ran.ok) throw new Error(`the cat food ${String(kg)} kg did not run`);
  const value = ran.value.outputs.find((output) => output.key === key)?.value;
  if (!(value instanceof Rational)) throw new Error(`no output ${key}`);
  return value;
};

const whole = (value: Rational): string => amountEs(value, 0);
const KCAL_KG = amountEs(Rational.of(CAT_KCAL_KG));

const VET =
  'Es un punto de partida, no una prescripción: según el Merck Veterinary Manual, un gato puede necesitar hasta un 30 % más o menos. Consulta la cantidad con tu veterinario y pesa a tu gato cada pocas semanas.';
const TREATS =
  'El alimento completo y equilibrado debe ser al menos el 90 % de las calorías del día, y los premios, como mucho, el 10 % (AAHA, 2021). Un día con premios, da el 90 % de cada cantidad.';
const LABEL = `Busca en la etiqueta del alimento seco las kilocalorías por kilo (kcal/kg); si tu bolsa las da por 100 g, multiplica la cifra por 10. La calculadora parte de ${KCAL_KG} kcal por kilo solo como ejemplo: escribe la cifra de tu bolsa, porque cambia mucho de un alimento a otro.`;

/**
 * The Spanish cat food calculator, at the searches `calculadora de comida para gatos` and
 * `cuántos gramos de comida debe comer un gato`: the engine of `/cat-food-calculator`, opened in
 * kilograms and grams, the units a Spanish label uses.
 */
export const COMIDA_GATO_PAGE: FeedingPage = {
  path: hrefOf('cat', 'es'),
  title: 'Calculadora de comida para gatos: gramos al día | Bowl Figures',
  description:
    '¿Cuánta comida necesita tu gato al día? Calorías, gramos de alimento seco y latas de húmedo según su peso y la etiqueta, con las fórmulas del Merck y la AAHA.',
  kicker: 'Gatos · Ración · Gratis',
  h1: 'Calculadora de comida para gatos: cuántos gramos al día',
  lead: 'Escribe el peso de tu gato y las calorías de la etiqueta de su alimento. Elige seco, húmedo o una mezcla: obtienes las calorías del día, los gramos de alimento seco y las latas o sobres de húmedo.',
  fields: {
    weight: { label: 'Peso de tu gato' },
    unit: { label: 'Unidad', options: { lb: 'libras', kg: 'kilos' } },
    status: { label: 'Etapa de vida y estado', options: CAT_STATUS_ES },
    dryKcal: { label: 'Alimento seco: calorías de la etiqueta (kcal)' },
    wetKcal: { label: 'Comida húmeda: calorías por lata o sobre' },
    wetShare: { label: 'Parte de las calorías en comida húmeda (%)' },
    dryBasis: {
      label: 'La etiqueta del seco da las calorías por',
      options: { cup: 'taza', kg: 'kilo' },
    },
  },
  initial: {
    weight: String(CAT_START_KG),
    unit: 'kg',
    status: 'neutered',
    dryKcal: String(CAT_KCAL_KG),
    wetKcal: String(CAT_KCAL_CAN),
    wetShare: '0',
    dryBasis: 'kg',
  },
  notes: [LABEL, VET, TREATS],
};

/** The line of the methodology the page cites under its notes. */
export const COMIDA_GATO_METHOD =
  'Las calorías del día son 70 × (peso en kg)^0,75 × un factor de etapa de vida, según el Merck Veterinary Manual y las pautas de 2021 de la AAHA; los gramos de seco y las latas de húmedo reparten esas calorías según la parte que elijas y las dividen por las calorías de cada etiqueta.';

/** The life stages of a 4 kg cat: the factor, the calories and the grams of each. */
export const COMIDA_GATO_STAGES: GuideTable = {
  after: 'factores',
  id: 'tabla-etapas',
  heading: `Calorías y gramos al día de un gato de ${String(CAT_START_KG)} kg, por etapa de vida`,
  paragraphs: [
    `Cada fila es el resultado de la calculadora para un gato de ${String(CAT_START_KG)} kg que solo come alimento seco de ${KCAL_KG} kcal por kilo, una cifra de ejemplo. En un gatito, el peso es el de hoy; en un plan para adelgazar, el peso ideal que fija tu veterinario.`,
  ],
  columns: [
    `Gato de ${String(CAT_START_KG)} kg`,
    'Factor',
    'Calorías al día',
    `Gramos al día a ${KCAL_KG} kcal/kg`,
  ],
  rows: CAT_STATUSES.map((status) => [
    CAT_STATUS_ES[status],
    FACTOR_ES[status],
    whole(catFigureKg(CAT_START_KG, 'mer', { status })),
    whole(catFigureKg(CAT_START_KG, 'grams', { status })),
  ]),
  linksHeading: 'Para otros pesos, de 4 a 20 libras:',
  links: [{ href: hrefOf('cat-chart'), label: 'Cat feeding chart by weight (en inglés)' }],
};

const rer = catFigureKg(CAT_START_KG, 'rer');
const mer = catFigureKg(CAT_START_KG, 'mer');
const grams = catFigureKg(CAT_START_KG, 'grams');

/** The article under the calculator: the formula worked through, the factors, and a FAQ. */
export const COMIDA_GATO_ARTICLE: CalcArticle = {
  checked: COMIDA_GATO_CHECKED,
  sections: [
    {
      id: 'como-se-calcula',
      heading: 'Cómo se calcula la ración, paso a paso',
      paragraphs: [
        `Primero, la energía en reposo (RER, por sus siglas en inglés): 70 × (peso en kg)^0,75, la fórmula del Merck Veterinary Manual y de las pautas de 2021 de la AAHA. Para un gato de ${String(CAT_START_KG)} kg, ${String(CAT_START_KG)} elevado a 0,75 es ${amountEs(rer.div(Rational.of(70)), 3)}, y 70 × ${amountEs(rer.div(Rational.of(70)), 3)} = ${amountEs(rer, 1)} kcal al día.`,
        `Después, el factor de su etapa de vida: 1,2 para un adulto castrado, según el Merck. ${amountEs(rer, 1)} × 1,2 = ${whole(mer)} kcal al día. Con un alimento seco de ${KCAL_KG} kcal por kilo, son ${whole(mer)} ÷ ${KCAL_KG} × 1000 = ${whole(grams)} g al día, que puedes repartir en varias comidas pequeñas. Las ${KCAL_KG} kcal por kilo son solo un ejemplo: con la cifra de tu bolsa, la cantidad cambia.`,
      ],
    },
    {
      id: 'factores',
      heading: 'El factor de cada etapa de vida',
      paragraphs: [
        'La tabla del Merck multiplica la energía en reposo por 1,2 en un gato adulto castrado, 1,4 en uno sin castrar, 1,0 en un gato poco activo o con tendencia a engordar y 2,5 en un gatito. La AAHA da rangos: de 1,2 a 1,4 castrado y de 1,4 a 1,6 sin castrar, y 0,8 sobre el peso ideal para adelgazar, una cifra que el Merck no da. El «rango» bajo el resultado va de la cifra más baja a la más alta de las dos fuentes.',
        `Las fuentes son las de la calculadora en inglés, leídas en inglés por el equipo editorial el ${checkedText(ACCESSED, 'es')}; esta página en español se escribió el ${checkedText(COMIDA_GATO_CHECKED, 'es')}.`,
      ],
    },
  ],
  tables: [COMIDA_GATO_STAGES],
  questions: [
    {
      question: '¿Cuántos gramos de comida debe comer un gato al día?',
      answer: `Depende de su peso y de las calorías de su alimento. Un gato adulto castrado de ${String(CAT_START_KG)} kg necesita unas ${whole(mer)} kcal al día (Merck): ${whole(grams)} g de un alimento seco de ${KCAL_KG} kcal por kilo. Divide sus calorías por las de tu etiqueta y multiplica por 1000.`,
    },
    {
      question: '¿Y si la etiqueta da las calorías por 100 g?',
      answer:
        'Multiplica la cifra por 10 para tenerla por kilo: 380 kcal por 100 g son 3800 kcal/kg. En la comida húmeda, multiplica las kcal por 100 g por los gramos de la lata o el sobre y divide por 100: un sobre de 85 g a 90 kcal por 100 g aporta unas 77 kcal.',
    },
    {
      question: '¿Cómo combino comida seca y húmeda?',
      answer:
        'Elige qué parte de las calorías del día viene de la comida húmeda, por ejemplo el 50 %. La calculadora reparte las mismas calorías: la mitad en gramos de seco y la mitad en latas o sobres de húmedo. No sumes una ración completa de cada uno.',
    },
    {
      question: '¿Cuánto debe comer un gatito?',
      answer: `Según el Merck y la AAHA, 2,5 veces su energía en reposo, sobre su peso de hoy. Un gatito que hoy pesa 2 kg necesita unas ${whole(catFigureKg(2, 'mer', { status: 'kitten' }))} kcal al día: ${whole(catFigureKg(2, 'grams', { status: 'kitten' }))} g de un alimento seco de ${KCAL_KG} kcal por kilo. El Merck añade que a los gatitos también se les puede dejar la comida a libre disposición; pregunta a tu veterinario y pésalo cada una o dos semanas.`,
    },
  ],
  sources: ENGLISH_SOURCES,
};
