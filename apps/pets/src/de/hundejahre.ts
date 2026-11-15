import type { Rational } from '@maestro-calc/core';
import { SENIOR_AT, SIZES, type Size } from '@maestro-calc/pets-core/dog-age';
import type { DogAgePage } from '../calc/dog-age.ts';
import { AGES, DOG_AGE_SOURCES, DOG_YEARS_CHECKED, humanAt, wangAt } from '../dog-years.ts';
import type { CalcArticle, GuideTable, PageSource } from '../guides.ts';
import { hrefOf } from '../routes.ts';
import { amountDe } from './format.ts';
import { SIZE_DE } from './hundejahre-view.ts';

/** The day the German-language source of the page was read (the others: `DOG_YEARS_CHECKED`). */
const ORF_CHECKED = '2026-11-10';

const ORF: PageSource = {
  name: 'science.ORF.at, Erbgutanalyse: Faustregel zu Hundealter falsch (6. Juli 2020), über die Studie von Wang et al.',
  url: 'https://science.orf.at/stories/3201106/',
};

/** Years as the page writes them: whole when whole, else to the tenth, German style. */
const yearsDe = (value: Rational): string => amountDe(value, value.isInteger() ? 0 : 1);

/** The human age of a dog of `age` years and `size` on the charts, as the page writes it. */
const humanDe = (age: number, size: Size): string => yearsDe(humanAt(age, size));

/** The DNA clock at `age`, to the whole year. */
const wangDe = (age: number): string => amountDe(wangAt(age), 0);

/** `1 Jahr`, `2 Jahre`. */
const yearsLabel = (age: number): string => `${String(age)} ${age === 1 ? 'Jahr' : 'Jahre'}`;

/** The German dog age calculator page: the same engine, inputs and figures as `/dog-age-calculator`. */
export const HUNDEJAHRE_PAGE: DogAgePage = {
  path: hrefOf('dog-age', 'de'),
  title: 'Hundejahre in Menschenjahre: Rechner und Tabelle | Bowl Figures',
  description:
    'Wie alt ist Ihr Hund in Menschenjahren? Rechner und Tabelle nach Größe, nach den Tabellen von AVMA und Merck, mit DNA-Uhr und Lebensphase. Nicht mal sieben.',
  kicker: 'Hunde · Alter · kostenlos',
  h1: 'Hundejahre in Menschenjahre: Rechner und Tabelle',
  lead: 'Geben Sie ein Alter und die Größe Ihres Hundes ein. Sie erhalten das Alter auf der anderen Seite nach den tierärztlichen Tabellen, zum Vergleich die DNA-Uhr einer Studie von 2020 und die Lebensphase nach AAHA.',
  fields: {
    from: {
      label: 'Welches Alter kennen Sie?',
      options: {
        dog: 'Das Alter meines Hundes (in Jahren)',
        human: 'Ein Menschenalter (in Jahren)',
      },
    },
    age: { label: 'Alter in Jahren' },
    size: {
      label: 'Größe Ihres Hundes',
      options: {
        small: `${SIZE_DE.small.name} (${SIZE_DE.small.weight})`,
        medium: `${SIZE_DE.medium.name} (${SIZE_DE.medium.weight})`,
        large: `${SIZE_DE.large.name} (${SIZE_DE.large.weight})`,
        giant: `${SIZE_DE.giant.name} (${SIZE_DE.giant.weight})`,
      },
    },
  },
  initial: { from: 'dog', age: '3', size: 'medium' },
  notes: [
    'Wie viele Menschenjahre ist ein Hundejahr? Nicht sieben. Das erste Hundejahr entspricht etwa 15 Menschenjahren, das zweite etwa 9 weiteren: Die American Veterinary Medical Association (AVMA) und das Merck Veterinary Manual stimmen bei 15 mit einem und 24 mit zwei Jahren überein. Danach kommen pro Jahr etwa 4 Menschenjahre für kleine Hunde dazu, 4 bis 5 für mittelgroße, 5 bis 6 für große und 7 bis 8 für sehr große (PetMD). Der Rechner folgt für mittelgroße Hunde der Tabelle der AVMA und nimmt für die anderen Größen die Mitte jeder Spanne.',
    'Die Quellen sind sich nicht einig, und die Seite zeigt das. Die DNA-Uhr von Wang und Kollegen (2020), nur an Labrador Retrievern ermittelt, macht junge Hunde viel älter: 31 Menschenjahre mit einem Jahr statt 15 nach den Tabellen. Die AAHA-Leitlinien rechnen gar nicht um; sie ordnen einen Hund einer Lebensphase zu, und die steht unter dem Ergebnis.',
    'Jede Zahl ist eine Schätzung. Die AVMA weist darauf hin, dass viele Faktoren, darunter Gewicht und Rasse, das Altern eines Hundes beeinflussen: Fragen Sie Ihre Tierarztpraxis, wo Ihr Hund steht.',
  ],
  outside:
    'Dieses Alter liegt außerhalb der 6 Monate bis 20 Jahre, die die Tabellen abdecken; der Rechner führt die letzte Linie der Tabelle weiter. Lesen Sie die Zahl als grobe Orientierung.',
  wangOutside:
    'Die DNA-Uhr wurde an Hunden bis 16 Jahre ermittelt; ihre Zahl liegt hier außerhalb ihrer eigenen Daten.',
};

/** The line of the methodology the page cites under its notes. */
export const HUNDEJAHRE_METHOD =
  'Das Menschenalter folgt für mittelgroße Hunde der Tabelle der AVMA und für die anderen Größen 15 mit einem und 24 mit zwei Jahren (Merck), danach 4, 5,5 oder 7,5 Menschenjahre pro Jahr (die Mitte der Spannen von PetMD). Die DNA-Uhr ist 16 × ln(Hundealter) + 31 (Wang et al., 2020).';

const sizeOrder: readonly Size[] = SIZES;

/** The table under the first section: the human age of each size and the DNA clock, 1 to 16 years. */
export const HUNDEJAHRE_TABLE: GuideTable = {
  after: 'siebener-regel',
  id: 'tabelle',
  heading: 'Tabelle: Hundejahre in Menschenjahre nach Größe',
  paragraphs: [
    'Jede Zeile ist das Ergebnis des Rechners für einen Hund dieses Alters. Die Spalte „Mittel“ ist die Tabelle der AVMA für Hunde von 10 bis 23 kg; die anderen Größen folgen nach dem zweiten Jahr der Mitte der Spannen von PetMD. Die letzte Spalte ist die DNA-Uhr von Wang und Kollegen, die die Größe nicht kennt.',
  ],
  columns: [
    'Alter des Hundes',
    ...sizeOrder.map((size) => `${SIZE_DE[size].name} (${SIZE_DE[size].weight})`),
    'DNA-Uhr',
  ],
  rows: AGES.map((age) => [
    yearsLabel(age),
    ...sizeOrder.map((size) => humanDe(age, size)),
    wangDe(age),
  ]),
  linksHeading: 'Auf Englisch gibt es zu jedem Alter von 1 bis 16 eine eigene Seite, zum Beispiel:',
  links: [1, 7, 10, 12].map((age) => ({
    href: hrefOf(`dog-years-${String(age)}`),
    label: `${String(age)} ${age === 1 ? 'year' : 'years'} in dog years (Englisch)`,
  })),
};

const PLURAL: Readonly<Record<Size, string>> = {
  small: 'kleine',
  medium: 'mittelgroße',
  large: 'große',
  giant: 'sehr große',
};

/** `große Hunde ab 8`: the start of the senior years of a size (VCA), the sentence ends it. */
const seniorText = (size: Size): string => `${PLURAL[size]} Hunde ab ${String(SENIOR_AT[size])}`;

/** The article under the calculator: why not seven, the DNA clock, the life stages, and a FAQ. */
export const HUNDEJAHRE_ARTICLE: CalcArticle = {
  checked: ORF_CHECKED,
  sections: [
    {
      id: 'siebener-regel',
      heading: 'Warum die 7er-Regel nicht stimmt',
      paragraphs: [
        `Die alte Faustregel „ein Hundejahr sind sieben Menschenjahre“ ist zu einfach. Nach der AVMA und dem Merck Veterinary Manual ist ein einjähriger Hund schon etwa 15 Menschenjahre alt, ein zweijähriger etwa 24. Am Anfang altert ein Hund also viel schneller als siebenmal so schnell, später langsamer.`,
        `Ab dem dritten Jahr trennen sich die Größen. Ein kleiner Hund ist mit zehn Jahren nach dem Rechner ${humanDe(10, 'small')} Menschenjahre alt, ein mittelgroßer ${humanDe(10, 'medium')}, ein großer ${humanDe(10, 'large')} und ein sehr großer ${humanDe(10, 'giant')}. Die 7er-Regel ergäbe für alle 70.`,
        'Nicht jede tierärztliche Quelle rechnet die ersten beiden Jahre gleich: VCA zählt jedes davon als etwa 10,5 Menschenjahre, womit ein Zweijähriger eher 21 als 24 wäre.',
      ],
    },
    {
      id: 'dna-uhr',
      heading: 'Die DNA-Uhr: 16 × ln(Hundealter) + 31',
      paragraphs: [
        'Wang und Kollegen verglichen 2020 in der Zeitschrift Cell Systems die Methylierung des Erbguts von 104 Labrador Retrievern mit der von Menschen. Daraus entstand die Formel Menschenalter = 16 × ln(Hundealter) + 31; das österreichische Wissenschaftsportal science.ORF.at hat die Studie auf Deutsch vorgestellt.',
        `Die Formel macht junge Hunde deutlich älter als die Tabellen: ${wangDe(1)} Menschenjahre mit einem Jahr und ${wangDe(9)} mit neun. Die Studie fand, dass sich das Methylom von Welpen viel schneller verändert als das von Kindern, und setzte einen Welpen von etwa 8 Wochen mit einem Baby von etwa 9 Monaten gleich, dem Alter, in dem beide die ersten Zähne bekommen.`,
        'Weil sie nur an einer Rasse ermittelt wurde und Hunde bis 16 Jahre umfasst, zeigt der Rechner sie zum Vergleich und nicht als Hauptzahl.',
      ],
    },
    {
      id: 'lebensphasen',
      heading: 'Lebensphasen statt Umrechnung',
      paragraphs: [
        'Die Leitlinien der American Animal Hospital Association (AAHA) von 2019 rechnen kein Alter um, sondern teilen das Hundeleben in Phasen: Welpe bis zum Ende des schnellen Wachstums, etwa mit 6 bis 9 Monaten; junger Erwachsener bis zum Abschluss der körperlichen und sozialen Reife, bei den meisten Hunden mit 3 bis 4 Jahren; reifer Erwachsener bis zum letzten Viertel der erwarteten Lebenszeit; danach Senior.',
        `Wann dieses letzte Viertel beginnt, hängt von der Größe ab. VCA nennt ${seniorText('small')} bis 12 Jahren, ${seniorText('medium')}, ${seniorText('large')} und ${seniorText('giant')} Jahren; der Rechner nimmt bei kleinen Hunden den Anfang der Spanne.`,
        'Für junge und reife Erwachsene empfiehlt die AAHA eine tierärztliche Untersuchung alle sechs bis zwölf Monate.',
      ],
    },
  ],
  tables: [HUNDEJAHRE_TABLE],
  questions: [
    {
      question: 'Wie viele Menschenjahre ist ein Hundejahr?',
      answer:
        'Das erste Hundejahr entspricht etwa 15 Menschenjahren, das zweite etwa 9 weiteren (AVMA, Merck). Danach sind es je nach Größe etwa 4 bis 8 Menschenjahre pro Jahr (PetMD), nicht pauschal sieben.',
    },
    {
      question: 'Wie alt ist ein 7 Jahre alter Hund in Menschenjahren?',
      answer: `Nach dem Rechner ${humanDe(7, 'small')} bei einem kleinen, ${humanDe(7, 'medium')} bei einem mittelgroßen, ${humanDe(7, 'large')} bei einem großen und ${humanDe(7, 'giant')} bei einem sehr großen Hund. Die DNA-Uhr sagt ${wangDe(7)}.`,
    },
    {
      question: 'Wie alt ist ein 12 Jahre alter Hund in Menschenjahren?',
      answer: `${humanDe(12, 'small')} bei einem kleinen, ${humanDe(12, 'medium')} bei einem mittelgroßen, ${humanDe(12, 'large')} bei einem großen und ${humanDe(12, 'giant')} bei einem sehr großen Hund. In jeder Größe ist ein Zwölfjähriger nach VCA ein Senior.`,
    },
    {
      question: 'Wie rechne ich Menschenjahre in Hundejahre um?',
      answer:
        'Wählen Sie oben „Ein Menschenalter“ und geben Sie die Jahre ein: Der Rechner liest dieselbe Tabelle rückwärts. 50 Menschenjahre sind bei einem mittelgroßen Hund etwa 7,8 Hundejahre.',
    },
    {
      question: 'Ab wann ist ein Hund ein Senior?',
      answer: `Nach VCA ${seniorText('small')} bis 12 Jahren, ${seniorText('medium')}, ${seniorText('large')} und ${seniorText('giant')} Jahren. Die AAHA zählt das letzte Viertel der erwarteten Lebenszeit als Seniorenphase.`,
    },
  ],
  sources: [...Object.values(DOG_AGE_SOURCES), ORF],
};

/** The day the English sources of the page were read. */
export const HUNDEJAHRE_ENGLISH_CHECKED = DOG_YEARS_CHECKED;
