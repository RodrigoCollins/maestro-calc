import { encode, Rational } from '@maestro-calc/core';
import { dogChocolate } from '@maestro-calc/pets-core/dog-chocolate';
import { CHOCOLATE_GUIDE } from '../chocolate-guide.ts';
import type { Guide } from '../guides.ts';
import { hrefOf } from '../routes.ts';
import { SOURCES_FR, SOURCES_FR_CHECKED } from './foods/sources.ts';
import { amountFr } from './format.ts';

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
    label: 'Un cookie avec 15 g de pépites de chocolat noir',
    type: 'dark',
    grams: '15',
  },
  {
    id: 'dark',
    label: '25 g de chocolat noir (un quart de tablette)',
    type: 'dark',
    grams: '25',
  },
  { id: 'milk', label: '50 g de chocolat au lait (une demi-tablette)', type: 'milk', grams: '50' },
  { id: 'cocoa', label: '10 g de cacao en poudre non sucré', type: 'cocoa-powder', grams: '10' },
];

/** The dog weights every case is worked at, in kilograms. */
const KILOS = [5, 10, 20] as const;

/** The weight the guide's calculator links open at. */
const LINK_KILOS = 10;

/** What Merck lists at each band, with the call that every result carries. */
const BAND_CELLS = [
  'Moins de 20 mg/kg, où Merck situe les premiers signes. Ce n’est pas rassurant : appelez.',
  'Signes légers possibles (dès 20 mg/kg). Appelez maintenant.',
  'Effets sur le cœur possibles (dès 40 mg/kg). Appelez maintenant : c’est l’affaire du vétérinaire.',
  'Convulsions possibles (dès 60 mg/kg). Une urgence : appelez maintenant.',
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

/** A dose as the page writes it: whole from 10 mg/kg, to the tenth below, French style. */
const doseFr = (dose: Rational): string =>
  amountFr(dose, dose.compare(Rational.of(10)) === -1 ? 1 : 0).replace(/,0$/, '');

/** Each case worked by the engine: its milligrams, and the dose and band at each weight. */
export const CASES_FR = CASE_INPUTS.map((input) => ({
  id: input.id,
  label: input.label,
  totalMg: amountFr(outputOf(rawOf(input, LINK_KILOS), 'totalMg'), 0),
  rows: KILOS.map((kilos) => ({
    kilos,
    dose: doseFr(outputOf(rawOf(input, kilos), 'dose')),
    band: Number(outputOf(rawOf(input, kilos), 'band').num),
  })),
  link: {
    href: caseHref(input, LINK_KILOS),
    label: `${input.label}, chien de ${String(LINK_KILOS)} kg (calculateur en anglais)`,
  },
}));

const caseOf = (id: CaseInput['id']) => {
  const found = CASES_FR.find((candidate) => candidate.id === id);
  if (found === undefined) throw new Error(`no chocolate case ${id}`);
  return found;
};
const doseOf = (id: CaseInput['id'], kilos: number): string =>
  caseOf(id).rows.find((row) => row.kilos === kilos)?.dose ?? '';

/** The French chocolate guide: the same facts as `/my-dog-ate-chocolate`, for a French reader. */
export const CHOCOLAT_GUIDE: Guide = {
  path: hrefOf('chocolate-guide', 'fr'),
  title: 'Mon chien a mangé du chocolat : que faire ? | Bowl Figures',
  description:
    'Votre chien a mangé du chocolat ? Appelez votre vétérinaire maintenant. La dose en mg/kg, des exemples de cookies et de tablettes, et les signes.',
  h1: 'Mon chien a mangé du chocolat : ce qu’il faut faire maintenant',
  lead: 'Appelez maintenant votre vétérinaire ou un vétérinaire de garde, même si votre chien semble tout à fait normal. Lisez ensuite la suite : cette page explique la dose sur laquelle on vous interrogera au téléphone.',
  checked: SOURCES_FR_CHECKED,
  callNow: true,
  sections: [
    {
      id: 'maintenant',
      heading: 'Ce que vous faites dans les prochaines minutes',
      paragraphs: [
        'D’abord appeler, ensuite lire. En France, le Centre national d’informations toxicologiques vétérinaires (CNITV, VetAgro Sup) répond aux vétérinaires comme aux particuliers 7 jours sur 7, de 8 h 30 à minuit, au 04 78 87 10 40 ; la nuit, appelez un vétérinaire de garde ou une clinique d’urgence. En Suisse, Tox Info Suisse renseigne aussi sur les animaux au 145. En Belgique, le Centre Antipoisons répond sur les animaux au 070 245 245 en semaine de 8 h à 16 h et le week-end de 10 h à 16 h, mais donne la priorité aux appels concernant des personnes et vous renvoie d’abord à votre vétérinaire.',
        'Gardez trois choses sous la main : le poids de votre chien, le type de chocolat (l’emballage aide) et la quantité qui manque. Ces trois chiffres donnent la dose.',
        'Le temps compte. Le Merck Veterinary Manual, un ouvrage de référence pour les vétérinaires, écrit que chez un chien qui semble encore normal, on peut envisager de le faire vomir si le chocolat a été mangé peu avant, dans les 2 heures environ ; le Centre Antipoisons belge donne le même délai de moins de 2 heures aux vétérinaires. C’est au vétérinaire d’en décider : le Centre Antipoisons demande de ne pas essayer de faire vomir l’animal soi-même et de ne rien lui faire prendre sans avoir consulté.',
      ],
    },
    {
      id: 'dose',
      heading: 'Quelle quantité de chocolat est dangereuse',
      paragraphs: [
        'Le chocolat est nocif pour le chien par ses méthylxanthines, la théobromine et la caféine. La dose, ce sont les milligrammes que le chien a avalés, divisés par son poids en kilogrammes (mg/kg).',
        'Merck donne les paliers : des signes légers comme des vomissements, de la diarrhée et une soif intense dès 20 mg/kg, des effets sur le cœur dès 40 à 50 mg/kg et des convulsions dès 60 mg/kg. Le Centre Antipoisons belge donne les mêmes trois paliers (20, 40 et 60 mg/kg) et situe la plus faible dose mortelle connue à 80 mg/kg.',
        'Plus le chocolat est noir, plus il en contient. Merck compte 2,3 mg par gramme de chocolat au lait, 5,3 à 5,6 mg pour le chocolat mi-amer et noir (ce calculateur prend 5,6), 15,5 mg pour le chocolat pâtissier non sucré et 28,5 mg pour le cacao en poudre. Le Centre Antipoisons belge donne des fourchettes plus larges : 1 à 2,1 mg par gramme pour le chocolat au lait, 4,5 à 8,8 mg pour le chocolat noir et 0,009 mg pour le chocolat blanc. L’ASPCA cite le chocolat pâtissier et le cacao en poudre comme les plus dangereux et le chocolat blanc comme le moins dangereux.',
        'Une dose de moins de 20 mg/kg n’est pas une limite sûre. Merck n’y place que les premiers signes, les chiffres sont des estimations à partir de vos réponses, et ils ne valent pas pour un chien atteint d’une maladie cardiaque ou sous d’autres médicaments. C’est pourquoi chaque cas ci-dessous se termine par un appel.',
      ],
    },
    {
      id: 'signes',
      heading: 'Les signes, et quand ils apparaissent',
      paragraphs: [
        'Merck : les signes apparaissent le plus souvent 6 à 12 heures après l’ingestion, d’abord une soif intense, des vomissements, de la diarrhée, un ventre gonflé et de l’agitation ; ensuite peuvent venir une surexcitation, des urines abondantes, une démarche chancelante, de la raideur, des tremblements et des convulsions.',
        'Le Centre Antipoisons belge les situe plus tôt, après 2 à 4 heures : agitation, vomissements, pertes d’urine, diarrhée, cœur rapide, température élevée et respiration rapide, puis troubles du rythme cardiaque, raideur musculaire, démarche ébrieuse, convulsions et coma. Les sources divergent ici ; pour vous, la conclusion est la même : n’attendez pas les signes.',
        'L’ASPCA cite pour le chocolat, le café et la caféine des vomissements et de la diarrhée, un halètement, une soif et une envie d’uriner intenses, une surexcitation, des troubles du rythme cardiaque, des tremblements, des convulsions et même la mort.',
      ],
    },
    {
      id: 'semble-normal',
      heading: 'Pourquoi « il a l’air normal » ne veut pas dire « sans danger »',
      paragraphs: [
        'Un chien qui a mangé du chocolat il y a une heure et qui semble normal se comporte exactement comme le déroulé décrit par Merck le laisse prévoir. Qu’il ait l’air normal au début ne dit rien de la dose.',
        'Les substances restent en outre longtemps dans l’organisme. Merck donne une demi-vie de la théobromine de 17,5 heures chez le chien, et selon Merck, les signes peuvent durer jusqu’à 72 heures dans les cas graves.',
        'Le bon moment pour appeler est donc avant les signes, tant que votre vétérinaire a le plus de possibilités.',
      ],
    },
  ],
  table: {
    after: 'semble-normal',
    id: 'cas',
    heading: 'Exemples : des cas courants pour trois poids',
    paragraphs: [
      `Chaque ligne est le résultat du calculateur de chocolat pour la quantité indiquée, un exemple pour comparer et non la teneur d’un produit. Une recette ou une tablette peut en contenir plus ou moins : pesez ou lisez l’emballage. Les milligrammes de méthylxanthines sont ${caseOf('cookie').totalMg} pour le cookie, ${caseOf('dark').totalMg} pour le chocolat noir, ${caseOf('milk').totalMg} pour le chocolat au lait et ${caseOf('cocoa').totalMg} pour le cacao.`,
      `La même quantité donne une tout autre dose selon le type et le chien. 10 g de cacao en poudre font ${doseOf('cocoa', 5)} mg/kg pour un chien de 5 kg, au-dessus du palier où Merck cite des effets sur le cœur ; une demi-tablette de chocolat au lait fait ${doseOf('milk', 5)} mg/kg pour le même chien. Deux cookies ou deux demi-tablettes doublent la dose.`,
    ],
    columns: ['Ce que le chien a mangé', 'Poids', 'Dose (mg/kg)', 'Ce que Merck cite à cette dose'],
    rows: CASES_FR.flatMap(({ label, rows }) =>
      rows.map(({ kilos, dose, band }) => [
        label,
        `${String(kilos)} kg`,
        dose,
        BAND_CELLS[band] ?? BAND_CELLS[3],
      ]),
    ),
    linksHeading:
      'Ouvrez le calculateur avec un cas (la page est en anglais, mais calcule en kilogrammes et en grammes) et remplacez-le par ce que votre chien a mangé :',
    links: CASES_FR.map(({ link }) => link),
  },
  questions: [
    {
      question: 'Mon chien a mangé du chocolat mais semble normal. Dois-je quand même appeler ?',
      answer:
        'Oui. Selon Merck, les signes n’arrivent souvent que 6 à 12 heures plus tard : un chien peut donc sembler normal pendant des heures. Appelez maintenant en donnant le poids, le type et la quantité.',
    },
    {
      question: 'Combien de temps dois-je surveiller mon chien ?',
      answer:
        'Surveiller ne remplace pas l’appel. Selon Merck, les signes peuvent durer jusqu’à 72 heures dans les cas graves, et la demi-vie de la théobromine est de 17,5 heures chez le chien. Combien de temps votre chien doit être surveillé, votre vétérinaire vous le dira après l’appel.',
    },
    {
      question: 'Mon chien n’a mangé qu’un petit morceau. Est-ce grave ?',
      answer: `Cela dépend du type et du chien. 25 g de chocolat noir font ${doseOf('dark', 5)} mg/kg pour un chien de 5 kg et ${doseOf('dark', 20)} mg/kg pour un chien de 20 kg. Aucun de ces chiffres n’est rassurant : appelez et laissez votre vétérinaire décider.`,
    },
    {
      question: 'Mon chien a mangé le chocolat il y a 24 heures. Est-il trop tard ?',
      answer:
        'Non. Selon Merck, les signes peuvent durer jusqu’à 72 heures dans les cas graves. Appelez et dites quand c’est arrivé.',
    },
    {
      question: 'Que dire au téléphone si c’était un cookie au chocolat ?',
      answer: `Le nombre de cookies, si les pépites étaient au lait ou noires, et le poids de votre chien. Un cookie avec 15 g de pépites noires fait ${doseOf('cookie', 5)} mg/kg pour un chien de 5 kg. Les cookies aux raisins secs, aux noix ou au xylitol sortent de ce que couvre le calculateur : dites-le au téléphone.`,
    },
  ],
  calculators: [hrefOf('chocolate')],
  sources: [
    ...CHOCOLATE_GUIDE.sources,
    SOURCES_FR.cnitv,
    SOURCES_FR.antipoisonsChocolate,
    SOURCES_FR.antipoisonsAnimals,
    SOURCES_FR.toxinfoAnimals,
  ],
  card: {
    title: 'Mon chien a mangé du chocolat',
    summary: 'Que faire maintenant, les paliers de dose, des exemples et les signes.',
  },
};

/** The day the English sources of the guide were read. */
export const CHOCOLAT_ENGLISH_CHECKED = CHOCOLATE_GUIDE.checked;
