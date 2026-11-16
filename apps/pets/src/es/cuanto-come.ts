import { encode, Rational } from '@maestro-calc/core';
import { dogFood } from '@maestro-calc/pets-core/dog-food';
import { FEED_SOURCES, WSAVA_ROWS } from '../feed-by-weight.ts';
import { cupsText, quarterCups } from '../format.ts';
import type { GuideQuestion, GuideSection, PageSource } from '../guides.ts';
import { hrefOf } from '../routes.ts';
import {
  COMIDA_ES_CHECKED,
  COMIDA_PERRO_PAGE,
  dogFigureKg,
  FOOD_KCAL_KG,
  kcalEs,
  START_KG,
} from './comida-perro.ts';
import { amountEs } from './format.ts';

/** The weights of the table, in kilograms. */
export const CUANTO_KILOS = [2, 5, 10, 15, 20, 25, 30, 35, 40, 50] as const;

/** The cup the table also counts in, for a reader who measures with one: 360 kcal, as the English charts. */
const CUP_KCAL = 360;

/** The Spanish calculator's address with `kg` kilograms filled in, the rest at the page's start. */
export const comidaHrefOf = (kg: number): string => {
  const encodedOf = (raw: Readonly<Record<string, string>>): string => {
    const validated = dogFood.validate(raw);
    if (!validated.ok) throw new Error(`the dog food ${String(kg)} kg does not validate`);
    return encode(dogFood, validated.value);
  };
  const query = encodedOf({ ...COMIDA_PERRO_PAGE.initial, weight: String(kg) });
  return query === encodedOf(COMIDA_PERRO_PAGE.initial)
    ? COMIDA_PERRO_PAGE.path
    : `${COMIDA_PERRO_PAGE.path}?${query}`;
};

const merKg = (kg: number): Rational => dogFigureKg(kg, 'mer');
const gramsKg = (kg: number): string => amountEs(dogFigureKg(kg, 'portion'), 0);
const cupsKg = (kg: number): string =>
  cupsText(quarterCups(dogFigureKg(kg, 'portion', { basis: 'cup', kcal: CUP_KCAL }).toNumber()));

/** The WSAVA row of `kg` kilograms, as printed. */
const wsavaOf = (kg: number): { readonly low: number; readonly high: number } => {
  const row = WSAVA_ROWS.find((candidate) => candidate.kg === kg);
  if (row === undefined) throw new Error(`no WSAVA row for ${String(kg)} kg`);
  return row;
};

/** `de 280 a 351 kcal` at 5 kg, and where Merck's figure for a neutered adult falls: `por encima`. */
const wsavaAt = (
  kg: number,
): { readonly range: string; readonly merck: string; readonly place: string } => {
  const { low, high } = wsavaOf(kg);
  const mer = merKg(kg);
  const place =
    mer.compare(Rational.of(high)) === 1
      ? 'por encima'
      : mer.compare(Rational.of(low)) === -1
        ? 'por debajo'
        : 'dentro';
  return {
    range: `de ${amountEs(Rational.of(low))} a ${amountEs(Rational.of(high))} kcal`,
    merck: kcalEs(mer),
    place,
  };
};

const W5 = wsavaAt(5);
const W18 = wsavaAt(18);
const W45 = wsavaAt(45);

const food = amountEs(Rational.of(FOOD_KCAL_KG));
const start = merKg(START_KG);

const SECTIONS: readonly GuideSection[] = [
  {
    id: 'pasos',
    heading: 'Calcúlalo en cinco pasos',
    paragraphs: [
      '1. Pesa a tu perro y fíjate en su condición corporal. Si tiene que adelgazar, tu veterinario fija un peso ideal y usas ese.',
      '2. Calcula su energía en reposo: 70 × (peso en kg)^0,75 kcal al día, la fórmula del Merck Veterinary Manual y de las pautas de 2021 de la AAHA.',
      '3. Multiplícala por el factor de su etapa de vida y su actividad (abajo) para obtener las calorías del día.',
      `4. Divide por las calorías de la etiqueta de su alimento. Si la etiqueta da kcal por kilo, divide y multiplica por 1000 para obtener los gramos. La tabla supone ${food} kcal por kilo; tu alimento puede ser muy distinto.`,
      '5. Deja los premios por debajo del 10 % del día (AAHA). Luego pesa a tu perro cada pocas semanas y ajusta.',
    ],
  },
  {
    id: 'factores',
    heading: 'Los factores de etapa de vida y de actividad',
    paragraphs: [
      'La tabla del Merck multiplica la energía en reposo por 1,6 en un adulto castrado, 1,8 en uno sin castrar, 1,4 en un perro con tendencia a engordar, 3 en un cachorro de menos de 4 meses y 2 en uno mayor. La AAHA da rangos: de 1,4 a 1,6 castrado, de 1,6 a 1,8 sin castrar, de 1,0 a 1,2 poco activo o con tendencia a la obesidad, y 1,0 sobre el peso ideal para adelgazar.',
      'La AAHA añade factores para perros de trabajo que esta tabla no usa: trabajo ligero de 1,6 a 2,0, moderado de 2,0 a 5,0 y pesado de 5,0 a 11,0. Son pautas generales, y la AAHA advierte que los perros sedentarios o que viven dentro de casa pueden necesitar menos.',
    ],
  },
  {
    id: 'wsava',
    heading: 'Una segunda fuente: los rangos de la WSAVA',
    paragraphs: [
      `La tabla de calorías de la WSAVA para un perro adulto sano con una condición corporal ideal da ${W5.range} al día a 5 kg; la fórmula del Merck, ${W5.merck} kcal para un adulto castrado, queda ${W5.place} de ese rango. A 18 kg la WSAVA da ${W18.range} (Merck: ${W18.merck}, ${W18.place}) y a 45 kg, ${W45.range} (Merck: ${W45.merck}, ${W45.place}).`,
      'La WSAVA indica que su tabla se basa en las ecuaciones de mantenimiento del NRC de 2006, mientras que el Merck y la AAHA multiplican la energía en reposo por un factor; por eso las dos fuentes casi nunca coinciden a la caloría, y la WSAVA dice que su tabla es solo orientativa.',
    ],
  },
  {
    id: 'etiqueta',
    heading: 'Por qué importa más la etiqueta que la raza',
    paragraphs: [
      'Las calorías por kilo cambian de un alimento a otro, así que el mismo puñado es otra comida con otro alimento. La línea de calorías de la etiqueta (kcal por kilo, por taza o por lata) es la única cifra de la bolsa que necesita la cuenta; si tu bolsa las da por 100 g, multiplica por 10.',
      'La raza no forma parte de la fórmula del Merck ni de la de la AAHA: dos perros del mismo peso y la misma etapa de vida parten de la misma cifra, sea cual sea su raza.',
    ],
  },
  {
    id: 'comprobar',
    heading: 'Comprueba la cantidad en tu perro',
    paragraphs: [
      'Según el Merck, un perro puede necesitar hasta un 30 % más o menos que cualquier fórmula. El cuerpo de tu perro es la última comprobación.',
      'En la escala de condición corporal de 9 puntos de la WSAVA, lo ideal es de 4 a 5: las costillas se palpan sin exceso de grasa, la cintura se ve detrás de las costillas desde arriba y el abdomen sube visto de lado. En un estudio con 48 labradores, los perros que comieron un 25 % menos que su pareja vivieron más (mediana de vida) y mostraron más tarde signos de enfermedades crónicas (Kealy y colegas, 2002): vale la pena mantenerlo delgado.',
    ],
  },
  {
    id: 'veterinario',
    heading: 'Cuándo preguntar primero a tu veterinario',
    paragraphs: [
      'Una perra preñada o lactante necesita mucho más que un perro en reposo: el factor de la AAHA es 3,0 en los últimos 21 días de gestación y de 3,0 a 6,0 o más en la lactancia, según la camada. Un plan para adelgazar, un cachorro de raza grande, un perro mayor que pierde peso y un perro con cualquier enfermedad o dieta especial necesitan una cantidad fijada por un veterinario.',
      'Cada cifra de esta página es un punto de partida tomado de fórmulas veterinarias publicadas, no un consejo veterinario para tu perro.',
    ],
  },
];

const QUESTIONS: readonly GuideQuestion[] = [
  {
    question: '¿Cuánto debe comer un perro de 10 kg?',
    answer: `Unas ${kcalEs(merKg(10))} kcal al día si es un adulto castrado (Merck): ${gramsKg(10)} g de un alimento de ${food} kcal por kilo. Sin castrar, unas ${kcalEs(dogFigureKg(10, 'mer', { status: 'intact' }))} kcal.`,
  },
  {
    question: '¿Cuánto debe comer un perro de 30 kg?',
    answer: `Unas ${kcalEs(merKg(30))} kcal al día si es un adulto castrado: ${gramsKg(30)} g de un alimento de ${food} kcal por kilo, o unas ${cupsKg(30)} tazas de un alimento de ${String(CUP_KCAL)} kcal por taza.`,
  },
  {
    question: '¿Cuántas veces al día debe comer un perro?',
    answer:
      'Las cifras de esta página son la ración de todo el día. Puedes repartirla en dos comidas, por la mañana y por la noche; un cachorro suele comer más veces. Pregunta a tu veterinario cuántas comidas le convienen al tuyo.',
  },
  {
    question: '¿Está bien la guía de la bolsa?',
    answer:
      'Es el punto de partida del fabricante para su propio alimento. El Merck y la AAHA tratan cualquier cifra igual: se parte de la fórmula y se ajusta observando el peso y la condición corporal del perro.',
  },
];

const SOURCES: readonly PageSource[] = [
  FEED_SOURCES.merck,
  FEED_SOURCES.merckTable,
  FEED_SOURCES.aaha,
  FEED_SOURCES.wsava,
  FEED_SOURCES.wsavaBcs,
  FEED_SOURCES.kealy,
];

/**
 * The Spanish "cuánto debe comer un perro según su peso": the answer first, a table from 2 to
 * 50 kg worked by the dog food engine, and the steps, factors and checks of the English hub.
 */
export const CUANTO_COME = {
  path: hrefOf('feed', 'es'),
  title: 'Cuánto debe comer un perro según su peso: tabla | Bowl Figures',
  description:
    'Cuánta comida necesita tu perro al día según su peso: calorías y gramos de 2 a 50 kg, con las fórmulas del Merck y de la AAHA, y cómo leer la etiqueta.',
  h1: '¿Cuánto debe comer un perro según su peso? Tabla en gramos',
  lead: `Un perro adulto castrado de ${String(START_KG)} kg necesita unas ${kcalEs(start)} kcal al día según la fórmula del Merck Veterinary Manual: unos ${gramsKg(START_KG)} g al día de un alimento seco de ${food} kcal por kilo. Esa cifra del alimento es una suposición: lee las calorías de tu bolsa y divide por ellas, o usa la calculadora. Busca el peso de tu perro en la tabla y comprueba luego la cantidad en tu perro.`,
  checked: COMIDA_ES_CHECKED,
  tableHeading: 'Cuánto debe comer un perro, según su peso',
  columns: [
    'Peso',
    'Calorías al día (adulto castrado)',
    `Gramos al día a ${food} kcal/kg`,
    `Tazas al día a ${String(CUP_KCAL)} kcal`,
  ],
  rows: CUANTO_KILOS.map((kg) => ({
    href: comidaHrefOf(kg),
    cells: [`${String(kg)} kg`, kcalEs(merKg(kg)), gramsKg(kg), cupsKg(kg)],
  })),
  sections: SECTIONS,
  questions: QUESTIONS,
  sources: SOURCES,
} as const;
