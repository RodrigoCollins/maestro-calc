import type { Rational } from '@maestro-calc/core';
import { SENIOR_AT, SIZES, type Size } from '@maestro-calc/pets-core/dog-age';
import type { DogAgePage } from '../calc/dog-age.ts';
import { AGES, DOG_AGE_SOURCES, DOG_YEARS_CHECKED, humanAt, wangAt } from '../dog-years.ts';
import type { CalcArticle, GuideTable } from '../guides.ts';
import { hrefOf } from '../routes.ts';
import { SIZE_FR } from './age-chien-view.ts';
import { amountFr } from './format.ts';

/**
 * The day the French page was written against its sources. It cites the English sources of the
 * dog age pages only: no French-language source of the DNA clock or the charts was read.
 */
const AGE_FR_CHECKED = '2026-11-15';

/** Years as the page writes them: whole when whole, else to the tenth, French style. */
const yearsFr = (value: Rational): string => amountFr(value, value.isInteger() ? 0 : 1);

/** The human age of a dog of `age` years and `size` on the charts, as the page writes it. */
const humanFr = (age: number, size: Size): string => yearsFr(humanAt(age, size));

/** The DNA clock at `age`, to the whole year. */
const wangFr = (age: number): string => amountFr(wangAt(age), 0);

/** `1 an`, `2 ans`. */
const yearsLabel = (age: number): string => `${String(age)} ${age === 1 ? 'an' : 'ans'}`;

/** The French dog age calculator page: the same engine, inputs and figures as `/dog-age-calculator`. */
export const AGE_CHIEN_PAGE: DogAgePage = {
  path: hrefOf('dog-age', 'fr'),
  title: 'Âge du chien en âge humain : calculateur, tableau | Bowl Figures',
  description:
    'Quel âge a votre chien en âge humain ? Calculateur et tableau selon la taille, d’après l’AVMA et le Merck, avec l’horloge ADN et le stade de vie. Pas fois sept.',
  kicker: 'Chiens · Âge · Gratuit',
  h1: 'Âge du chien en âge humain : calculateur et tableau',
  lead: 'Saisissez un âge et la taille de votre chien. Vous obtenez l’âge correspondant selon les tableaux vétérinaires, l’horloge ADN d’une étude de 2020 pour comparer, et le stade de vie selon l’AAHA.',
  fields: {
    from: {
      label: 'Quel âge connaissez-vous ?',
      options: {
        dog: 'L’âge de mon chien (en années)',
        human: 'Un âge humain (en années)',
      },
    },
    age: { label: 'Âge en années' },
    size: {
      label: 'Taille de votre chien',
      options: {
        small: `${SIZE_FR.small.name} (${SIZE_FR.small.weight})`,
        medium: `${SIZE_FR.medium.name} (${SIZE_FR.medium.weight})`,
        large: `${SIZE_FR.large.name} (${SIZE_FR.large.weight})`,
        giant: `${SIZE_FR.giant.name} (${SIZE_FR.giant.weight})`,
      },
    },
  },
  initial: { from: 'dog', age: '3', size: 'medium' },
  notes: [
    'Combien d’années humaines vaut une année de chien ? Pas sept. La première année d’un chien correspond à environ 15 ans humains, la deuxième à environ 9 de plus : l’American Veterinary Medical Association (AVMA) et le Merck Veterinary Manual s’accordent sur 15 ans à un an et 24 ans à deux ans. Ensuite, chaque année ajoute environ 4 ans humains pour un petit chien, 4 à 5 pour un moyen, 5 à 6 pour un grand et 7 à 8 pour un très grand (PetMD). Le calculateur suit le tableau de l’AVMA pour les chiens moyens et prend le milieu de chaque fourchette pour les autres tailles.',
    'Les sources ne sont pas d’accord, et la page le montre. L’horloge ADN de Wang et ses collègues (2020), établie sur des labradors seulement, vieillit beaucoup les jeunes chiens : 31 ans humains à un an au lieu de 15 selon les tableaux. Les recommandations de l’AAHA ne convertissent pas du tout ; elles placent un chien dans un stade de vie, affiché sous le résultat.',
    'Chaque chiffre est une estimation. L’AVMA rappelle que de nombreux facteurs, dont le poids et la race, influent sur le vieillissement d’un chien : demandez à votre vétérinaire où en est le vôtre.',
  ],
  outside:
    'Cet âge sort des 6 mois à 20 ans que couvrent les tableaux ; le calculateur prolonge la dernière ligne du tableau. Lisez ce chiffre comme un ordre de grandeur.',
  wangOutside:
    'L’horloge ADN a été établie sur des chiens de 16 ans au plus ; son chiffre sort ici de ses propres données.',
};

/** The line of the methodology the page cites under its notes. */
export const AGE_CHIEN_METHOD =
  'L’âge humain suit le tableau de l’AVMA pour les chiens moyens et, pour les autres tailles, 15 ans à un an et 24 ans à deux ans (Merck), puis 4, 5,5 ou 7,5 ans humains par an (le milieu des fourchettes de PetMD). L’horloge ADN est 16 × ln(âge du chien) + 31 (Wang et al., 2020).';

const sizeOrder: readonly Size[] = SIZES;

/** The table under the first section: the human age of each size and the DNA clock, 1 to 16 years. */
export const AGE_CHIEN_TABLE: GuideTable = {
  after: 'regle-de-sept',
  id: 'tableau',
  heading: 'Tableau : âge du chien en âge humain selon la taille',
  paragraphs: [
    'Chaque ligne est le résultat du calculateur pour un chien de cet âge. La colonne « Moyen » reprend le tableau de l’AVMA pour les chiens de 10 à 23 kg ; les autres tailles suivent, après la deuxième année, le milieu des fourchettes de PetMD. La dernière colonne est l’horloge ADN de Wang et ses collègues, qui ignore la taille.',
  ],
  columns: [
    'Âge du chien',
    ...sizeOrder.map((size) => `${SIZE_FR[size].name} (${SIZE_FR[size].weight})`),
    'Horloge ADN',
  ],
  rows: AGES.map((age) => [
    yearsLabel(age),
    ...sizeOrder.map((size) => humanFr(age, size)),
    wangFr(age),
  ]),
  linksHeading: 'En anglais, chaque âge de 1 à 16 ans a sa propre page, par exemple :',
  links: [1, 7, 10, 12].map((age) => ({
    href: hrefOf(`dog-years-${String(age)}`),
    label: `${String(age)} ${age === 1 ? 'year' : 'years'} in dog years (en anglais)`,
  })),
};

/** `les grands chiens dès 8 ans`: the start of the senior years of a size (VCA). */
const seniorText = (size: Size): string =>
  `les ${SIZE_FR[size].plural} chiens dès ${String(SENIOR_AT[size])} ans`;

/** The article under the calculator: why not seven, the DNA clock, the life stages, and a FAQ. */
export const AGE_CHIEN_ARTICLE: CalcArticle = {
  checked: AGE_FR_CHECKED,
  sections: [
    {
      id: 'regle-de-sept',
      heading: 'Pourquoi la règle du « fois sept » est fausse',
      paragraphs: [
        'La vieille règle « une année de chien vaut sept années humaines » est trop simple. Selon l’AVMA et le Merck Veterinary Manual, un chien d’un an a déjà environ 15 ans en âge humain, un chien de deux ans environ 24. Au début, un chien vieillit donc bien plus vite que sept fois plus vite, et ensuite plus lentement.',
        `À partir de la troisième année, les tailles se séparent. À dix ans, selon le calculateur, un petit chien a ${humanFr(10, 'small')} ans en âge humain, un moyen ${humanFr(10, 'medium')}, un grand ${humanFr(10, 'large')} et un très grand ${humanFr(10, 'giant')}. La règle du fois sept donnerait 70 pour tous.`,
        'Toutes les sources vétérinaires ne comptent pas les deux premières années de la même façon : VCA compte chacune comme environ 10,5 ans humains, ce qui donnerait plutôt 21 que 24 à deux ans.',
      ],
    },
    {
      id: 'horloge-adn',
      heading: 'L’horloge ADN : 16 × ln(âge du chien) + 31',
      paragraphs: [
        'En 2020, dans la revue Cell Systems, Wang et ses collègues ont comparé la méthylation de l’ADN de 104 labradors à celle d’humains. Ils en ont tiré la formule âge humain = 16 × ln(âge du chien) + 31.',
        `La formule vieillit nettement les jeunes chiens par rapport aux tableaux : ${wangFr(1)} ans humains à un an et ${wangFr(9)} à neuf ans. L’étude a constaté que le méthylome des chiots change bien plus vite que celui des enfants, et a fait correspondre un chiot d’environ 8 semaines à un bébé d’environ 9 mois, l’âge où les deux font leurs premières dents.`,
        'Comme elle n’a été établie que sur une race, avec des chiens de 16 ans au plus, le calculateur la montre pour comparer et non comme chiffre principal.',
      ],
    },
    {
      id: 'stades-de-vie',
      heading: 'Des stades de vie plutôt qu’une conversion',
      paragraphs: [
        'Les recommandations de 2019 de l’American Animal Hospital Association (AAHA) ne convertissent pas l’âge : elles divisent la vie du chien en stades. Chiot jusqu’à la fin de la croissance rapide, vers 6 à 9 mois ; jeune adulte jusqu’à la fin de la maturité physique et sociale, vers 3 ou 4 ans chez la plupart des chiens ; adulte mûr jusqu’au dernier quart de l’espérance de vie ; puis senior.',
        `Le début de ce dernier quart dépend de la taille. VCA cite ${seniorText('small')} (jusqu’à 12 ans), ${seniorText('medium')}, ${seniorText('large')} et ${seniorText('giant')} ; pour les petits chiens, le calculateur prend le début de la fourchette.`,
        'Pour les jeunes adultes et les adultes mûrs, l’AAHA recommande un examen vétérinaire tous les six à douze mois.',
      ],
    },
  ],
  tables: [AGE_CHIEN_TABLE],
  questions: [
    {
      question: 'Combien d’années humaines vaut une année de chien ?',
      answer:
        'La première année d’un chien correspond à environ 15 ans humains, la deuxième à environ 9 de plus (AVMA, Merck). Ensuite, selon la taille, c’est environ 4 à 8 ans humains par an (PetMD), et non sept pour tous.',
    },
    {
      question: 'Quel âge humain a un chien de 7 ans ?',
      answer: `Selon le calculateur, ${humanFr(7, 'small')} ans pour un petit chien, ${humanFr(7, 'medium')} pour un moyen, ${humanFr(7, 'large')} pour un grand et ${humanFr(7, 'giant')} pour un très grand. L’horloge ADN dit ${wangFr(7)}.`,
    },
    {
      question: 'Quel âge humain a un chien de 12 ans ?',
      answer: `${humanFr(12, 'small')} ans pour un petit chien, ${humanFr(12, 'medium')} pour un moyen, ${humanFr(12, 'large')} pour un grand et ${humanFr(12, 'giant')} pour un très grand. Quelle que soit sa taille, un chien de douze ans est un senior selon VCA.`,
    },
    {
      question: 'Comment convertir un âge humain en âge de chien ?',
      answer:
        'Choisissez « Un âge humain » plus haut et saisissez les années : le calculateur lit le même tableau à l’envers. 50 ans humains correspondent à environ 7,8 ans pour un chien moyen.',
    },
    {
      question: 'À partir de quel âge un chien est-il senior ?',
      answer: `Selon VCA, ${seniorText('small')} (jusqu’à 12 ans), ${seniorText('medium')}, ${seniorText('large')} et ${seniorText('giant')}. L’AAHA compte le dernier quart de l’espérance de vie comme le stade senior.`,
    },
  ],
  sources: [...Object.values(DOG_AGE_SOURCES)],
};

/** The day the English sources of the page were read. */
export const AGE_CHIEN_ENGLISH_CHECKED = DOG_YEARS_CHECKED;
