import { encode, Rational } from '@maestro-calc/core';
import { dogChocolate } from '@maestro-calc/pets-core/dog-chocolate';
import { CHOCOLATE_GUIDE } from '../chocolate-guide.ts';
import type { Guide } from '../guides.ts';
import { hrefOf } from '../routes.ts';
import { SOURCES_DE, SOURCES_DE_CHECKED } from './foods/sources.ts';
import { amountDe } from './format.ts';

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
    label: 'Ein Keks mit 15 g Zartbitter-Schokostückchen',
    type: 'dark',
    grams: '15',
  },
  {
    id: 'dark',
    label: '25 g Zartbitterschokolade (eine Viertel-Tafel)',
    type: 'dark',
    grams: '25',
  },
  { id: 'milk', label: '50 g Vollmilchschokolade (eine halbe Tafel)', type: 'milk', grams: '50' },
  { id: 'cocoa', label: '10 g Backkakao (reines Kakaopulver)', type: 'cocoa-powder', grams: '10' },
];

/** The dog weights every case is worked at, in kilograms. */
const KILOS = [5, 10, 20] as const;

/** The weight the guide's calculator links open at. */
const LINK_KILOS = 10;

/** What Merck lists at each band, with the call that every result carries. */
const BAND_CELLS = [
  'Unter 20 mg/kg, wo Merck die ersten Anzeichen nennt. Keine Entwarnung: anrufen.',
  'Leichte Anzeichen möglich (ab 20 mg/kg). Jetzt anrufen.',
  'Wirkung aufs Herz möglich (ab 40 mg/kg). Jetzt anrufen: Das gehört in tierärztliche Hände.',
  'Krampfanfälle möglich (ab 60 mg/kg). Ein Notfall: jetzt anrufen.',
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

/** A dose as the page writes it: whole from 10 mg/kg, to the tenth below, German style. */
const doseDe = (dose: Rational): string =>
  amountDe(dose, dose.compare(Rational.of(10)) === -1 ? 1 : 0).replace(/,0$/, '');

/** Each case worked by the engine: its milligrams, and the dose and band at each weight. */
export const CASES_DE = CASE_INPUTS.map((input) => ({
  id: input.id,
  label: input.label,
  totalMg: amountDe(outputOf(rawOf(input, LINK_KILOS), 'totalMg'), 0),
  rows: KILOS.map((kilos) => ({
    kilos,
    dose: doseDe(outputOf(rawOf(input, kilos), 'dose')),
    band: Number(outputOf(rawOf(input, kilos), 'band').num),
  })),
  link: {
    href: caseHref(input, LINK_KILOS),
    label: `${input.label}, Hund von ${String(LINK_KILOS)} kg (Rechner auf Englisch)`,
  },
}));

const caseOf = (id: CaseInput['id']) => {
  const found = CASES_DE.find((candidate) => candidate.id === id);
  if (found === undefined) throw new Error(`no chocolate case ${id}`);
  return found;
};
const doseOf = (id: CaseInput['id'], kilos: number): string =>
  caseOf(id).rows.find((row) => row.kilos === kilos)?.dose ?? '';

/** The German chocolate guide: the same facts as `/my-dog-ate-chocolate`, for a German reader. */
export const SCHOKOLADE_GUIDE: Guide = {
  path: hrefOf('chocolate-guide', 'de'),
  title: 'Hund hat Schokolade gefressen: Was jetzt tun? | Bowl Figures',
  description:
    'Ihr Hund hat Schokolade gefressen? Rufen Sie jetzt die Tierarztpraxis an. Die Dosis in mg/kg, Beispiele für Kekse und Tafeln, die Anzeichen und wann sie kommen.',
  h1: 'Hund hat Schokolade gefressen: Was Sie jetzt tun',
  lead: 'Rufen Sie jetzt Ihre Tierarztpraxis oder den tierärztlichen Notdienst an, auch wenn Ihr Hund ganz normal wirkt. Lesen Sie danach weiter: Diese Seite erklärt die Dosis, nach der man Sie am Telefon fragen wird.',
  checked: SOURCES_DE_CHECKED,
  callNow: true,
  sections: [
    {
      id: 'jetzt',
      heading: 'Was Sie in den nächsten Minuten tun',
      paragraphs: [
        'Erst anrufen, dann lesen. Bei Verdacht auf eine Vergiftung soll man sich nach dem Bundesinstitut für Risikobewertung (BfR) umgehend an eine Tierärztin oder einen Tierarzt wenden; nachts und am Wochenende ist das der tierärztliche Notdienst oder eine Tierklinik. In der Schweiz gibt Tox Info Suisse unter der Nummer 145 auch zu Tieren Auskunft. Die Giftinformationszentren in Deutschland sind für Menschen zuständig und beraten nach dem BfR nur je nach Kapazität auch bei Tieren.',
        'Halten Sie drei Dinge bereit: das Gewicht Ihres Hundes, die Sorte Schokolade (die Verpackung hilft) und wie viel fehlt. Aus diesen drei Zahlen ergibt sich die Dosis.',
        'Die Zeit zählt. Das Merck Veterinary Manual, ein Nachschlagewerk für Tierärzte, schreibt, bei Hunden, die noch normal wirken, sei das Auslösen von Erbrechen zu erwägen, wenn die Schokolade erst kurz zuvor gefressen wurde, etwa innerhalb von 2 Stunden. CliniTox, die Giftdatenbank der Universität Zürich, hält ab 20 mg pro kg eine Entgiftung für notwendig. Beides entscheidet die Tierärztin oder der Tierarzt: Geben Sie Ihrem Hund zu Hause nichts, ohne vorher zu fragen.',
      ],
    },
    {
      id: 'dosis',
      heading: 'Wie viel Schokolade gefährlich ist',
      paragraphs: [
        'Schokolade schadet Hunden durch ihre Methylxanthine, Theobromin und Koffein. Die Dosis sind die Milligramm davon, die der Hund gefressen hat, geteilt durch sein Gewicht in Kilogramm (mg/kg).',
        'Merck nennt die Stufen: leichte Anzeichen wie Erbrechen, Durchfall und starker Durst ab 20 mg/kg, Wirkungen auf das Herz ab 40 bis 50 mg/kg und Krampfanfälle ab 60 mg/kg. CliniTox nennt dieselben drei Stufen und dazu schwere Verläufe ab 80 bis 90 mg/kg und tödliche ab 100 mg/kg.',
        'Je dunkler die Schokolade, desto mehr enthält sie. Merck rechnet mit 2,3 mg pro Gramm Milchschokolade, 5,3 bis 5,6 mg für Halbbitter- und Zartbitterschokolade (dieser Rechner nimmt 5,6), 15,5 mg für ungesüßte Backschokolade und 28,5 mg für Kakaopulver. Die ASPCA nennt Backschokolade und Kakaopulver die gefährlichsten Sorten und weiße Schokolade die harmloseste.',
        'Eine Dosis unter 20 mg/kg ist keine sichere Grenze. Dort nennt Merck nur die ersten Anzeichen, die Zahlen sind Schätzungen aus Ihren Angaben, und für einen Hund mit Herzkrankheit oder anderen Medikamenten gelten sie nicht. Jeder Fall unten endet deshalb mit einem Anruf.',
      ],
    },
    {
      id: 'anzeichen',
      heading: 'Die Anzeichen, und wann sie kommen',
      paragraphs: [
        'Merck: Die Anzeichen treten meist 6 bis 12 Stunden nach dem Fressen auf, zuerst starker Durst, Erbrechen, Durchfall, ein aufgeblähter Bauch und Unruhe; später können Übererregung, vermehrter Harnabsatz, ein schwankender Gang, Steifheit, Zittern und Krampfanfälle folgen.',
        'CliniTox ist schneller: Die ersten Anzeichen könnten schon nach 45 bis 60 Minuten auftreten, verzögert bis zu 4 Stunden. Die Quellen widersprechen sich hier; für Sie folgt daraus dasselbe: nicht auf Anzeichen warten.',
        'Die ASPCA nennt für Schokolade, Kaffee und Koffein Erbrechen und Durchfall, Hecheln, starken Durst und Harndrang, Übererregung, Herzrhythmusstörungen, Zittern, Krampfanfälle und sogar den Tod.',
      ],
    },
    {
      id: 'unauffaellig',
      heading: 'Warum „er wirkt ganz normal“ nicht sicher heißt',
      paragraphs: [
        'Ein Hund, der vor einer Stunde Schokolade gefressen hat und normal wirkt, verhält sich genau so, wie es der zeitliche Verlauf nach Merck erwarten lässt. Dass er anfangs normal wirkt, sagt nichts über die Dosis.',
        'Die Stoffe bleiben außerdem lange im Körper. Merck und CliniTox geben die Halbwertszeit von Theobromin beim Hund mit 17,5 Stunden an, und nach Merck können die Anzeichen in schweren Fällen bis zu 72 Stunden anhalten.',
        'Der richtige Moment für den Anruf ist also vor den Anzeichen, solange Ihre Tierarztpraxis die meisten Möglichkeiten hat.',
      ],
    },
  ],
  table: {
    after: 'unauffaellig',
    id: 'faelle',
    heading: 'Beispiele: häufige Fälle bei drei Körpergewichten',
    paragraphs: [
      `Jede Zeile ist das Ergebnis des Schokoladenrechners für die genannte Menge, ein Beispiel zum Vergleichen und nicht die Angabe eines Produkts. Ein Rezept oder eine Tafel kann mehr oder weniger enthalten: Wiegen Sie nach oder lesen Sie die Verpackung. Die Milligramm Methylxanthine sind ${caseOf('cookie').totalMg} für den Keks, ${caseOf('dark').totalMg} für die Zartbitterschokolade, ${caseOf('milk').totalMg} für die Vollmilchschokolade und ${caseOf('cocoa').totalMg} für den Kakao.`,
      `Dieselbe Menge ist je nach Sorte und Hund eine ganz andere Dosis. 10 g Backkakao sind für einen Hund von 5 kg ${doseOf('cocoa', 5)} mg/kg, über der Stufe, ab der Merck Wirkungen auf das Herz nennt; eine halbe Tafel Vollmilchschokolade sind für denselben Hund ${doseOf('milk', 5)} mg/kg. Zwei Kekse oder zwei halbe Tafeln verdoppeln die Dosis.`,
    ],
    columns: [
      'Was der Hund gefressen hat',
      'Gewicht',
      'Dosis (mg/kg)',
      'Was Merck bei dieser Dosis nennt',
    ],
    rows: CASES_DE.flatMap(({ label, rows }) =>
      rows.map(({ kilos, dose, band }) => [
        label,
        `${String(kilos)} kg`,
        dose,
        BAND_CELLS[band] ?? BAND_CELLS[3],
      ]),
    ),
    linksHeading:
      'Öffnen Sie den Rechner mit einem Fall (die Seite ist auf Englisch, rechnet aber in Kilogramm und Gramm) und ändern Sie ihn auf das, was Ihr Hund gefressen hat:',
    links: CASES_DE.map(({ link }) => link),
  },
  questions: [
    {
      question: 'Mein Hund hat Schokolade gefressen, wirkt aber normal. Soll ich trotzdem anrufen?',
      answer:
        'Ja. Nach Merck kommen die Anzeichen meist erst 6 bis 12 Stunden später, ein Hund kann also stundenlang normal wirken. Rufen Sie jetzt an und nennen Sie Gewicht, Sorte und Menge.',
    },
    {
      question: 'Wie lange muss ich meinen Hund beobachten?',
      answer:
        'Beobachten ersetzt den Anruf nicht. Nach Merck können die Anzeichen in schweren Fällen bis zu 72 Stunden anhalten, und die Halbwertszeit von Theobromin beträgt beim Hund 17,5 Stunden. Wie lange Ihr Hund überwacht werden muss, sagt Ihnen die Tierarztpraxis nach dem Anruf.',
    },
    {
      question: 'Mein Hund hat nur ein kleines Stück gefressen. Ist das schlimm?',
      answer: `Das hängt von der Sorte und vom Hund ab. 25 g Zartbitterschokolade sind für einen Hund von 5 kg ${doseOf('dark', 5)} mg/kg und für einen von 20 kg ${doseOf('dark', 20)} mg/kg. Keine der beiden Zahlen ist eine Entwarnung: Rufen Sie an und lassen Sie die Tierärztin oder den Tierarzt entscheiden.`,
    },
    {
      question: 'Mein Hund hat die Schokolade vor 24 Stunden gefressen. Ist es zu spät?',
      answer:
        'Nein. Nach Merck können die Anzeichen in schweren Fällen bis zu 72 Stunden anhalten. Rufen Sie an und sagen Sie, wann es passiert ist.',
    },
    {
      question: 'Was sage ich am Telefon, wenn es ein Schokoladenkeks war?',
      answer: `Die Zahl der Kekse, ob die Stückchen Vollmilch oder Zartbitter waren, und das Gewicht Ihres Hundes. Ein Keks mit 15 g Zartbitter-Stückchen sind für einen Hund von 5 kg ${doseOf('cookie', 5)} mg/kg. Kekse mit Rosinen, Nüssen oder Xylit liegen außerhalb dessen, was der Rechner abdeckt: Sagen Sie das am Telefon.`,
    },
  ],
  calculators: [hrefOf('chocolate')],
  sources: [
    ...CHOCOLATE_GUIDE.sources,
    SOURCES_DE.clinitoxMethylxanthine,
    SOURCES_DE.bfrPets,
    SOURCES_DE.toxinfoAnimals,
    SOURCES_DE.vetmeduniHolidays,
  ],
  card: {
    title: 'Hund hat Schokolade gefressen',
    summary: 'Was jetzt zu tun ist, die Dosis-Stufen, Beispiele und die Anzeichen.',
  },
};

/** The day the English sources of the guide were read. */
export const SCHOKOLADE_ENGLISH_CHECKED = CHOCOLATE_GUIDE.checked;
