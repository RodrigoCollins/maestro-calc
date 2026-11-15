import type { Rational } from '@maestro-calc/core';
import { SENIOR_AT, SIZES, type Size } from '@maestro-calc/pets-core/dog-age';
import type { DogAgePage } from '../calc/dog-age.ts';
import { AGES, DOG_AGE_SOURCES, DOG_YEARS_CHECKED, humanAt, wangAt } from '../dog-years.ts';
import type { CalcArticle, GuideTable } from '../guides.ts';
import { hrefOf } from '../routes.ts';
import { SIZE_ES } from './edad-perro-view.ts';
import { amountEs } from './format.ts';

/**
 * The day the Spanish page was written against its sources. It cites the English sources of the
 * dog age pages only: no Spanish-language source of the DNA clock or the charts was read.
 */
const EDAD_ES_CHECKED = '2026-11-15';

/** Years as the page writes them: whole when whole, else to the tenth, with a decimal comma. */
const yearsEs = (value: Rational): string => amountEs(value, value.isInteger() ? 0 : 1);

/** The human age of a dog of `age` years and `size` on the charts, as the page writes it. */
const humanEs = (age: number, size: Size): string => yearsEs(humanAt(age, size));

/** The DNA clock at `age`, to the whole year. */
const wangEs = (age: number): string => amountEs(wangAt(age), 0);

/** `1 año`, `2 años`. */
const yearsLabel = (age: number): string => `${String(age)} ${age === 1 ? 'año' : 'años'}`;

/**
 * The Spanish dog age calculator page, at the measured searches (`edad de perros`, `calculadora
 * edad perro`, `edad de perro en años humanos`): the same engine, inputs and figures as
 * `/dog-age-calculator`.
 */
export const EDAD_PERRO_PAGE: DogAgePage = {
  path: hrefOf('dog-age', 'es'),
  title: 'Edad de perro en años humanos: calculadora y tabla | Bowl Figures',
  description:
    '¿Cuántos años humanos tiene tu perro? Calculadora y tabla de edad de perros por tamaño, según la AVMA y el Merck, con el reloj del ADN. No es por siete.',
  kicker: 'Perros · Edad · Gratis',
  h1: 'Calculadora de edad de perros: su edad en años humanos, con tabla',
  lead: 'Escribe la edad y el tamaño de tu perro. Obtienes su edad en años humanos según las tablas veterinarias, el reloj del ADN de un estudio de 2020 para comparar y su etapa de vida según la AAHA.',
  fields: {
    from: {
      label: '¿Qué edad conoces?',
      options: {
        dog: 'La edad de mi perro (en años)',
        human: 'Una edad humana (en años)',
      },
    },
    age: { label: 'Edad en años' },
    size: {
      label: 'Tamaño de tu perro',
      options: {
        small: `${SIZE_ES.small.name} (${SIZE_ES.small.weight})`,
        medium: `${SIZE_ES.medium.name} (${SIZE_ES.medium.weight})`,
        large: `${SIZE_ES.large.name} (${SIZE_ES.large.weight})`,
        giant: `${SIZE_ES.giant.name} (${SIZE_ES.giant.weight})`,
      },
    },
  },
  initial: { from: 'dog', age: '3', size: 'medium' },
  notes: [
    '¿Cuántos años humanos equivalen a un año de perro? No son siete. El primer año de un perro equivale a unos 15 años humanos y el segundo a unos 9 más: la American Veterinary Medical Association (AVMA) y el Merck Veterinary Manual coinciden en 15 años al año de edad y 24 a los dos años. Después, cada año suma unos 4 años humanos en un perro pequeño, de 4 a 5 en uno mediano, de 5 a 6 en uno grande y de 7 a 8 en uno gigante (PetMD). La calculadora sigue la tabla de la AVMA para los perros medianos y toma el punto medio de cada rango para los demás tamaños.',
    'Las fuentes no coinciden, y la página lo muestra. El reloj del ADN de Wang y sus colegas (2020), calculado solo con labradores, envejece mucho a los perros jóvenes: 31 años humanos al año de edad en lugar de los 15 de las tablas. Las pautas de la AAHA no convierten la edad; ubican al perro en una etapa de vida, que aparece debajo del resultado.',
    'Cada cifra es una estimación. La AVMA recuerda que muchos factores, entre ellos el peso y la raza, influyen en cómo envejece un perro: pregúntale a tu veterinario en qué etapa está el tuyo.',
  ],
  outside:
    'Esta edad queda fuera de los 6 meses a 20 años que cubren las tablas; la calculadora prolonga la última fila. Toma la cifra como un orden de magnitud.',
  wangOutside:
    'El reloj del ADN se calculó con perros de 16 años como máximo; aquí su cifra sale de sus propios datos.',
};

/** The line of the methodology the page cites under its notes. */
export const EDAD_PERRO_METHOD =
  'La edad humana sigue la tabla de la AVMA para los perros medianos y, para los demás tamaños, 15 años al primer año y 24 a los dos (Merck), y luego 4, 5,5 o 7,5 años humanos por año (el punto medio de los rangos de PetMD). El reloj del ADN es 16 × ln(edad del perro) + 31 (Wang y colegas, 2020).';

const sizeOrder: readonly Size[] = SIZES;

/** The table under the first section: the human age of each size and the DNA clock, 1 to 16 years. */
export const EDAD_PERRO_TABLE: GuideTable = {
  after: 'regla-del-siete',
  id: 'tabla',
  heading: 'Tabla de edad de perros en años humanos, por tamaño',
  paragraphs: [
    'Cada fila es el resultado de la calculadora para un perro de esa edad. La columna «Mediano» reproduce la tabla de la AVMA para los perros de 10 a 23 kg; los demás tamaños siguen, a partir del segundo año, el punto medio de los rangos de PetMD. La última columna es el reloj del ADN de Wang y sus colegas, que no tiene en cuenta el tamaño.',
  ],
  columns: [
    'Edad del perro',
    ...sizeOrder.map((size) => `${SIZE_ES[size].name} (${SIZE_ES[size].weight})`),
    'Reloj del ADN',
  ],
  rows: AGES.map((age) => [
    yearsLabel(age),
    ...sizeOrder.map((size) => humanEs(age, size)),
    wangEs(age),
  ]),
  linksHeading: 'En inglés, cada edad de 1 a 16 años tiene su propia página, por ejemplo:',
  links: [1, 7, 10, 12].map((age) => ({
    href: hrefOf(`dog-years-${String(age)}`),
    label: `${String(age)} ${age === 1 ? 'year' : 'years'} in dog years (en inglés)`,
  })),
};

/** `los perros grandes desde los 8 años`: the start of the senior years of a size (VCA). */
const seniorText = (size: Size): string =>
  `los perros ${SIZE_ES[size].plural} desde los ${String(SENIOR_AT[size])} años`;

/** The article under the calculator: why not seven, the DNA clock, the life stages, and a FAQ. */
export const EDAD_PERRO_ARTICLE: CalcArticle = {
  checked: EDAD_ES_CHECKED,
  sections: [
    {
      id: 'regla-del-siete',
      heading: 'Por qué la regla de «multiplicar por siete» no funciona',
      paragraphs: [
        'La vieja regla de «un año de perro equivale a siete años humanos» es demasiado simple. Según la AVMA y el Merck Veterinary Manual, un perro de un año ya tiene unos 15 años humanos y uno de dos años, unos 24. Al principio un perro envejece mucho más rápido que siete veces, y después más despacio.',
        `A partir del tercer año los tamaños se separan. A los diez años, según la calculadora, un perro pequeño tiene ${humanEs(10, 'small')} años humanos, uno mediano ${humanEs(10, 'medium')}, uno grande ${humanEs(10, 'large')} y uno gigante ${humanEs(10, 'giant')}. La regla del siete daría 70 para todos.`,
        'No todas las fuentes veterinarias cuentan igual los dos primeros años: VCA cuenta cada uno como unos 10,5 años humanos, lo que daría 21 en lugar de 24 a los dos años.',
      ],
    },
    {
      id: 'reloj-del-adn',
      heading: 'El reloj del ADN: 16 × ln(edad del perro) + 31',
      paragraphs: [
        'En 2020, en la revista Cell Systems, Wang y sus colegas compararon la metilación del ADN de 104 labradores con la de personas. De ahí sacaron la fórmula edad humana = 16 × ln(edad del perro) + 31.',
        `La fórmula envejece bastante a los perros jóvenes frente a las tablas: ${wangEs(1)} años humanos al año de edad y ${wangEs(9)} a los nueve. El estudio vio que el metiloma de los cachorros cambia mucho más rápido que el de los niños, e hizo corresponder un cachorro de unas 8 semanas con un bebé de unos 9 meses, la edad en que a ambos les salen los primeros dientes.`,
        'Como se calculó con una sola raza y con perros de 16 años como máximo, la calculadora lo muestra para comparar y no como cifra principal.',
      ],
    },
    {
      id: 'etapas-de-vida',
      heading: 'Etapas de vida en lugar de una conversión',
      paragraphs: [
        'Las pautas de 2019 de la American Animal Hospital Association (AAHA) no convierten la edad: dividen la vida del perro en etapas. Cachorro hasta el final del crecimiento rápido, hacia los 6 a 9 meses; adulto joven hasta el final de la madurez física y social, hacia los 3 o 4 años en la mayoría de los perros; adulto maduro hasta el último cuarto de su esperanza de vida; y luego senior.',
        `Cuándo empieza ese último cuarto depende del tamaño. VCA cita ${seniorText('small')} (hasta los 12), ${seniorText('medium')}, ${seniorText('large')} y ${seniorText('giant')}; para los perros pequeños, la calculadora toma el inicio del rango.`,
        'Para los adultos jóvenes y maduros, la AAHA recomienda una revisión veterinaria cada seis a doce meses.',
      ],
    },
  ],
  tables: [EDAD_PERRO_TABLE],
  questions: [
    {
      question: '¿Cuántos años humanos equivalen a un año de perro?',
      answer:
        'El primer año de un perro equivale a unos 15 años humanos y el segundo a unos 9 más (AVMA, Merck). Después, según el tamaño, son unos 4 a 8 años humanos por año (PetMD), no siete para todos.',
    },
    {
      question: '¿Cuántos años humanos tiene un perro de 7 años?',
      answer: `Según la calculadora, ${humanEs(7, 'small')} años si es pequeño, ${humanEs(7, 'medium')} si es mediano, ${humanEs(7, 'large')} si es grande y ${humanEs(7, 'giant')} si es gigante. El reloj del ADN dice ${wangEs(7)}.`,
    },
    {
      question: '¿Cuántos años humanos tiene un perro de 12 años?',
      answer: `${humanEs(12, 'small')} años si es pequeño, ${humanEs(12, 'medium')} si es mediano, ${humanEs(12, 'large')} si es grande y ${humanEs(12, 'giant')} si es gigante. Sea cual sea su tamaño, un perro de doce años es senior según VCA.`,
    },
    {
      question: '¿Cómo se pasa una edad humana a años de perro?',
      answer:
        'Elige «Una edad humana» arriba y escribe los años: la calculadora lee la misma tabla al revés. 50 años humanos equivalen a unos 7,8 años en un perro mediano.',
    },
    {
      question: '¿A qué edad un perro es senior?',
      answer: `Según VCA, ${seniorText('small')} (hasta los 12), ${seniorText('medium')}, ${seniorText('large')} y ${seniorText('giant')}. La AAHA considera senior el último cuarto de la esperanza de vida.`,
    },
  ],
  sources: [...Object.values(DOG_AGE_SOURCES)],
};

/** The day the English sources of the page were read. */
export const EDAD_PERRO_ENGLISH_CHECKED = DOG_YEARS_CHECKED;
