import { encode, Rational } from '@maestro-calc/core';
import { dogChocolate } from '@maestro-calc/pets-core/dog-chocolate';
import { CHOCOLATE_GUIDE } from '../chocolate-guide.ts';
import type { Guide } from '../guides.ts';
import { hrefOf } from '../routes.ts';
import { SOURCES_ES, SOURCES_ES_CHECKED } from './foods/sources.ts';
import { amountEs } from './format.ts';

/** A common case: what the dog ate, in grams (an example to compare with, not a product). */
interface CaseInput {
  readonly id: 'cookie' | 'dark' | 'milk' | 'cocoa';
  readonly label: string;
  readonly type: 'dark' | 'milk' | 'cocoa-powder';
  readonly grams: string;
}

const CASE_INPUTS: readonly CaseInput[] = [
  {
    id: 'cookie',
    label: 'Una galleta con 15 g de chispas de chocolate amargo',
    type: 'dark',
    grams: '15',
  },
  {
    id: 'dark',
    label: '25 g de chocolate amargo (un cuarto de tableta)',
    type: 'dark',
    grams: '25',
  },
  { id: 'milk', label: '50 g de chocolate con leche (media tableta)', type: 'milk', grams: '50' },
  { id: 'cocoa', label: '10 g de cacao en polvo sin azúcar', type: 'cocoa-powder', grams: '10' },
];

/** The dog weights every case is worked at, in kilograms. */
const KILOS = [5, 10, 20] as const;

/** The weight the guide's calculator links open at. */
const LINK_KILOS = 10;

/** What Merck lists at each band, with the call that every result carries. */
const BAND_CELLS = [
  'Menos de 20 mg/kg, donde Merck sitúa los primeros signos. No es para quedarse tranquilo: llama.',
  'Posibles signos leves (desde 20 mg/kg). Llama ya.',
  'Posibles efectos en el corazón (desde 40 mg/kg). Llama ya: es cosa del veterinario.',
  'Posibles convulsiones (desde 60 mg/kg). Una urgencia: llama ya.',
] as const;

const rawOf = (input: CaseInput, kilos: number): Record<string, string> => ({
  weight: String(kilos),
  weightUnit: 'kg',
  type: input.type,
  amount: input.grams,
  amountUnit: 'g',
});

const outputOf = (raw: Readonly<Record<string, string>>, key: string): Rational => {
  const ran = dogChocolate.run(raw);
  if (!ran.ok) throw new Error('a chocolate case did not run');
  const value = ran.value.outputs.find((output) => output.key === key)?.value;
  if (!(value instanceof Rational)) throw new Error(`no output ${key}`);
  return value;
};

/** The English calculator with case `input` at `kilos` filled in, in kilograms and grams. */
const caseHref = (input: CaseInput, kilos: number): string => {
  const validated = dogChocolate.validate(rawOf(input, kilos));
  if (!validated.ok) throw new Error(`the chocolate case ${input.id} does not validate`);
  return `${hrefOf('chocolate')}?${encode(dogChocolate, validated.value)}`;
};

/** A dose as the page writes it: whole from 10 mg/kg, to the tenth below, with a decimal comma. */
const doseEs = (dose: Rational): string =>
  amountEs(dose, dose.compare(Rational.of(10)) === -1 ? 1 : 0).replace(/,0$/, '');

/** Each case worked by the engine: its milligrams, and the dose and band at each weight. */
export const CASES_ES = CASE_INPUTS.map((input) => ({
  id: input.id,
  label: input.label,
  totalMg: amountEs(outputOf(rawOf(input, LINK_KILOS), 'totalMg'), 0),
  rows: KILOS.map((kilos) => ({
    kilos,
    dose: doseEs(outputOf(rawOf(input, kilos), 'dose')),
    band: Number(outputOf(rawOf(input, kilos), 'band').num),
  })),
  link: {
    href: caseHref(input, LINK_KILOS),
    label: `${input.label}, perro de ${String(LINK_KILOS)} kg (calculadora en inglés)`,
  },
}));

const caseOf = (id: CaseInput['id']) => {
  const found = CASES_ES.find((candidate) => candidate.id === id);
  if (found === undefined) throw new Error(`no chocolate case ${id}`);
  return found;
};
const doseOf = (id: CaseInput['id'], kilos: number): string =>
  caseOf(id).rows.find((row) => row.kilos === kilos)?.dose ?? '';

/**
 * The Spanish chocolate guide, at the measured search (`qué pasa si un perro come chocolate`): the
 * same facts as `/my-dog-ate-chocolate`, checked against the Spanish edition of the MSD manual.
 */
export const CHOCOLATE_GUIDE_ES: Guide = {
  path: hrefOf('chocolate-guide', 'es'),
  title: '¿Qué pasa si un perro come chocolate? Qué hacer ya | Bowl Figures',
  description:
    '¿Tu perro comió chocolate? Llama ya a tu veterinario. Qué le pasa según la dosis en mg/kg, ejemplos de galletas y tabletas, y los signos hora por hora.',
  h1: '¿Qué pasa si un perro come chocolate? Qué hacer ahora',
  lead: 'Puede intoxicarse: el chocolate tiene teobromina y cafeína, que en dosis suficientes causan vómitos, alteraciones del corazón y convulsiones. Llama ya a tu veterinario o a una clínica veterinaria de urgencias, aunque tu perro parezca estar perfectamente, y después sigue leyendo: esta página explica la dosis por la que te van a preguntar.',
  checked: SOURCES_ES_CHECKED,
  callNow: true,
  sections: [
    {
      id: 'ahora',
      heading: 'Lo que haces en los próximos minutos',
      paragraphs: [
        'Primero llamar, después leer. Llama a tu veterinario y, si es de noche o no contesta, a una clínica veterinaria de urgencias. En Chile, el CITUC, el centro de información toxicológica de la Pontificia Universidad Católica, atiende por teléfono las 24 horas todos los días (+56 2 2635 3800), y entre quienes lo llaman nombra a las clínicas veterinarias: tu veterinario puede consultarlo.',
        'Ten a mano tres datos: el peso de tu perro, el tipo de chocolate (el envoltorio ayuda) y la cantidad que falta. Con esos tres números se calcula la dosis.',
        'El tiempo cuenta. El Manual de veterinaria de MSD, la edición en español del Merck Veterinary Manual que usan los veterinarios, indica que en un perro que sigue normal tras una exposición reciente, por ejemplo en las 2 horas siguientes, debe considerarse provocar el vómito. Eso lo decide el veterinario: no intentes hacerlo vomitar en casa por tu cuenta.',
      ],
    },
    {
      id: 'dosis',
      heading: 'Cuánto chocolate es peligroso',
      paragraphs: [
        'El chocolate le hace daño al perro por sus metilxantinas, la teobromina y la cafeína. La dosis son los miligramos que tragó el perro divididos entre su peso en kilos (mg/kg).',
        'MSD da los escalones: signos leves como vómito, diarrea y mucha sed desde 20 mg/kg, efectos en el corazón con 40 a 50 mg/kg y convulsiones con 60 mg/kg o más.',
        'Cuanto más amargo es el chocolate, más contiene. MSD cuenta 2,3 mg por gramo de chocolate con leche, de 5,3 a 5,6 mg en el chocolate semiamargo y amargo (esta calculadora toma 5,6), 15,5 mg en el chocolate sin azúcar para repostería, 28,5 mg en el cacao en polvo y 0,04 mg en el chocolate blanco. La ASPCA señala el chocolate para repostería y el cacao en polvo como los más peligrosos y el chocolate blanco como el menos.',
        'Una dosis de menos de 20 mg/kg no es un límite seguro. Merck solo sitúa ahí los primeros signos, las cifras son estimaciones a partir de tus respuestas y no valen para un perro con una enfermedad del corazón o que toma otros medicamentos. Por eso cada caso de abajo termina en una llamada.',
      ],
    },
    {
      id: 'signos',
      heading: 'Los signos, y cuándo aparecen',
      paragraphs: [
        'Según MSD, los signos suelen aparecer en las primeras 6 a 12 horas tras comerlo. Merck describe primero mucha sed, vómitos, diarrea, el vientre hinchado e inquietud; después pueden llegar la sobreexcitación, orinar mucho, una marcha tambaleante, rigidez, temblores y convulsiones.',
        'La ASPCA cita para el chocolate, el café y la cafeína vómitos y diarrea, jadeo, mucha sed y ganas de orinar, sobreexcitación, alteraciones del ritmo del corazón, temblores, convulsiones e incluso la muerte.',
      ],
    },
    {
      id: 'parece-normal',
      heading: 'Por qué «se ve normal» no quiere decir «está a salvo»',
      paragraphs: [
        'Un perro que comió chocolate hace una hora y se ve normal se comporta justo como lo que describe MSD: los signos llegan horas después. Que al principio parezca normal no dice nada de la dosis.',
        'Además, las sustancias duran mucho en el cuerpo. MSD da una vida media de la teobromina de 17,5 horas en el perro, y en los casos graves los signos pueden durar hasta 72 horas.',
        'Por eso el momento de llamar es antes de los signos, cuando tu veterinario tiene más opciones.',
      ],
    },
  ],
  table: {
    after: 'parece-normal',
    id: 'casos',
    heading: 'Ejemplos: casos comunes para tres pesos',
    paragraphs: [
      `Cada fila es el resultado de la calculadora de chocolate para esa cantidad, un ejemplo para comparar y no el contenido de un producto. Una receta o una tableta puede tener más o menos: pésala o lee el envoltorio. Los miligramos de metilxantinas son ${caseOf('cookie').totalMg} en la galleta, ${caseOf('dark').totalMg} en el chocolate amargo, ${caseOf('milk').totalMg} en el chocolate con leche y ${caseOf('cocoa').totalMg} en el cacao.`,
      `La misma cantidad da una dosis muy distinta según el tipo y el perro. 10 g de cacao en polvo son ${doseOf('cocoa', 5)} mg/kg para un perro de 5 kg, por encima del escalón en que Merck cita efectos en el corazón; media tableta de chocolate con leche son ${doseOf('milk', 5)} mg/kg para el mismo perro. Dos galletas o dos medias tabletas duplican la dosis.`,
    ],
    columns: ['Lo que comió el perro', 'Peso', 'Dosis (mg/kg)', 'Lo que cita Merck con esa dosis'],
    rows: CASES_ES.flatMap(({ label, rows }) =>
      rows.map(({ kilos, dose, band }) => [
        label,
        `${String(kilos)} kg`,
        dose,
        BAND_CELLS[band] ?? BAND_CELLS[3],
      ]),
    ),
    linksHeading:
      'Abre la calculadora con un caso (la página está en inglés, pero calcula en kilos y gramos) y cámbialo por lo que comió tu perro:',
    links: CASES_ES.map(({ link }) => link),
  },
  questions: [
    {
      question: 'Mi perro comió chocolate pero se ve bien. ¿Tengo que llamar igual?',
      answer:
        'Sí. Según MSD, los signos suelen aparecer entre 6 y 12 horas después, así que un perro puede verse normal durante horas. Llama ya y di el peso, el tipo y la cantidad.',
    },
    {
      question: '¿Cuánto tiempo tengo que vigilar a mi perro?',
      answer:
        'Vigilar no sustituye a la llamada. Según MSD, en los casos graves los signos pueden durar hasta 72 horas, y la vida media de la teobromina en el perro es de 17,5 horas. Cuánto tiempo hay que vigilarlo te lo dirá tu veterinario después de la llamada.',
    },
    {
      question: 'Mi perro solo comió un pedacito. ¿Es grave?',
      answer: `Depende del tipo y del perro. 25 g de chocolate amargo son ${doseOf('dark', 5)} mg/kg para un perro de 5 kg y ${doseOf('dark', 20)} mg/kg para uno de 20 kg. Ninguna de esas cifras es para quedarse tranquilo: llama y deja que decida tu veterinario.`,
    },
    {
      question: 'Mi perro comió chocolate hace 24 horas. ¿Es demasiado tarde?',
      answer:
        'No. Según MSD, en los casos graves los signos pueden durar hasta 72 horas. Llama y di cuándo pasó.',
    },
    {
      question: '¿Qué digo por teléfono si fue una galleta con chispas de chocolate?',
      answer: `Cuántas galletas, si las chispas eran de chocolate con leche o amargo, y el peso de tu perro. Una galleta con 15 g de chispas amargas son ${doseOf('cookie', 5)} mg/kg para un perro de 5 kg. Las galletas con pasas, nueces o xilitol quedan fuera de lo que cubre la calculadora: dilo por teléfono.`,
    },
  ],
  calculators: [hrefOf('chocolate')],
  sources: [...CHOCOLATE_GUIDE.sources, SOURCES_ES.msdChocolate, SOURCES_ES.cituc],
  card: {
    title: '¿Qué pasa si un perro come chocolate?',
    summary: 'Qué hacer ahora, los escalones de dosis, ejemplos y los signos.',
  },
};

/** The day the English sources of the guide were read. */
export const CHOCOLATE_ES_ENGLISH_CHECKED = CHOCOLATE_GUIDE.checked;
