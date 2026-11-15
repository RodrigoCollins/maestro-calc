import { humanAt } from '../dog-years.ts';
import { hrefOf } from '../routes.ts';
import { FOOD_PAGES_DE } from './can-dogs-eat.ts';
import { amountDe } from './format.ts';

const medium = (age: number): string => amountDe(humanAt(age, 'medium'), 0);

/** The German home: the three questions the German pages answer, then every food page. */
export const HOME_DE = {
  title: 'Bowl Figures: Was Hunde essen dürfen, und Hundejahre',
  description:
    'Was dürfen Hunde essen, wie alt ist Ihr Hund in Menschenjahren, und was tun bei Schokolade? Antworten mit Zahlen aus tierärztlichen Quellen, in kg.',
  h1: 'Was Hunde essen dürfen, wie alt sie sind, und was bei Schokolade zu tun ist',
  lead: 'Bowl Figures beantwortet Fragen von Hundehaltern mit Zahlen, die eine Quelle haben: dem Merck Veterinary Manual, den Leitlinien der AAHA, CliniTox an der Universität Zürich und weiteren tierärztlichen Werken. Jede Seite nennt sie, mit dem Tag, an dem die Redaktion sie gelesen hat.',
  cards: [
    {
      href: hrefOf('foods', 'de'),
      title: 'Was dürfen Hunde essen?',
      summary: `${String(FOOD_PAGES_DE.length)} Lebensmittel von Weintrauben bis Gurke, jedes mit Urteil, Mengen für Hunde von 5 bis 35 kg und dem, was nie in den Napf gehört.`,
    },
    {
      href: hrefOf('dog-age', 'de'),
      title: 'Hundejahre in Menschenjahre',
      summary: `Nicht mal sieben: Ein mittelgroßer Hund ist mit 3 Jahren ${medium(3)} und mit 10 Jahren ${medium(10)} Menschenjahre alt. Rechner und Tabelle nach Größe.`,
    },
    {
      href: hrefOf('chocolate-guide', 'de'),
      title: 'Hund hat Schokolade gefressen',
      summary:
        'Was Sie in den nächsten Minuten tun, ab welcher Dosis es gefährlich wird und welche Anzeichen wann kommen.',
    },
  ],
  approach: [
    'Die Seiten rechnen, statt zu schätzen. Ein Lebensmittel wird für Hunde von 5, 10, 20 und 35 kg durchgerechnet, mit dem Leckerli-Budget von 10 % der Tageskalorien; bei Schokolade ergibt sich die Dosis aus Sorte, Menge und Gewicht. Wo die Quellen auseinanderliegen, etwa bei der giftigen Menge Weintrauben, stehen beide Werte da.',
    'Bei allem, was giftig ist, steht der Anruf an erster Stelle: bei Ihrer Tierarztpraxis oder dem tierärztlichen Notdienst, in der Schweiz auch bei Tox Info Suisse unter 145.',
  ],
  foodsHeading: 'Alle Lebensmittel auf Deutsch',
  trust: {
    text: 'Wer diese Seiten schreibt und prüft, und was die Website erhebt:',
    links: [
      { href: hrefOf('about', 'de'), label: 'Über uns' },
      { href: hrefOf('editorial', 'de'), label: 'Redaktionelle Grundsätze' },
      { href: hrefOf('privacy', 'de'), label: 'Datenschutz' },
    ],
  },
  english: {
    text: 'Mehr Rechner, etwa für die Futtermenge von Hunden und Katzen, gibt es auf Englisch:',
    href: hrefOf('home'),
    label: 'Bowl Figures auf Englisch',
  },
  foods: FOOD_PAGES_DE.map(({ path, h1 }) => ({ href: path, label: h1 })),
} as const;
