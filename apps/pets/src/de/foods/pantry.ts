import { SOURCES_DE } from './sources.ts';
import type { FoodDe } from './types.ts';

/** The pantry foods of the German pages, in the order of the route table. */
export const PANTRY_DE: readonly FoodDe[] = [
  {
    id: 'chocolate',
    name: 'Schokolade',
    answer: 'Schokolade ist für Hunde giftig',
    short: 'Nein, giftig',
    summary:
      'Schokolade enthält Theobromin und Koffein, die Hunde nur langsam abbauen; je dunkler sie ist, desto weniger reicht.',
    why: [
      'Merck nennt die Giftstoffe: Theobromin und Koffein, die Methylxanthine des Kakaos. Die ASPCA schreibt, sie könnten Erbrechen und Durchfall, Hecheln, Durst, Herzrasen, Zittern, Krampfanfälle und sogar den Tod auslösen.',
      'Wie viel gefährlich ist, hängt von Sorte, Menge und Hund ab. Merck rechnet mit etwa 2,3 mg Methylxanthinen pro Gramm Milchschokolade, 5,6 mg für Halbbitter- und Zartbitterschokolade und 15,5 mg für ungesüßte Backschokolade, und nennt leichte Anzeichen ab 20 mg pro kg Körpergewicht, Herzwirkungen ab 40 bis 50 mg/kg und Krampfanfälle ab 60 mg/kg. CliniTox, die Giftdatenbank der Universität Zürich, nennt dieselben drei Stufen: ab 20, 40 und 60 mg Theobromin pro kg.',
    ],
    serve: [
      'Rufen Sie jetzt Ihre Tierarztpraxis oder den tierärztlichen Notdienst an, auch wenn Ihr Hund unauffällig wirkt. CliniTox hält ab 20 mg/kg eine Entgiftung durch die Tierärztin oder den Tierarzt für notwendig.',
      'Halten Sie die Verpackung bereit, die fehlende Menge und das Gewicht Ihres Hundes: Das sind die drei Zahlen, aus denen sich die Dosis ergibt. Die Seite „Hund hat Schokolade gefressen“ rechnet häufige Fälle für Sie durch.',
    ],
    never: [
      'Jede Sorte Schokolade, Kakaopulver und Kakaonibs, und Brownies, Kuchen und Kekse damit.',
      'Schokolade mit Rosinen, Macadamianüssen oder Xylit bringt ein zweites Gift mit.',
    ],
    signs: [
      'Merck: Anzeichen kommen meist 6 bis 12 Stunden nach dem Fressen, zuerst Durst, Erbrechen, Durchfall, ein aufgeblähter Bauch und Unruhe, später Übererregung, Zittern und Krampfanfälle. In schweren Fällen dauern sie bis zu 72 Stunden.',
    ],
    disagree: [
      'Bei der Zeit: Merck nennt 6 bis 12 Stunden bis zu den ersten Anzeichen, CliniTox schreibt, sie könnten schon nach 45 bis 60 Minuten auftreten, verzögert bis zu 4 Stunden. Rufen Sie deshalb sofort an und warten Sie nicht auf Anzeichen.',
      'Beim Gehalt: CliniTox gibt Spannen statt einzelner Werte an, etwa 0,5 bis 2,3 mg Theobromin pro Gramm Milchschokolade und 5 bis 8,8 mg für 55-prozentige Zartbitterschokolade. Diese Seite rechnet mit den Werten von Merck.',
    ],
    piece: {
      a: 'eine Tafel (100 g)',
      one: 'Tafel',
      many: 'Tafeln',
      grams: 100,
      basis: '1 Tafel = 100 g',
    },
    thresholds: [
      {
        label: 'Milchschokolade bis 20 mg/kg',
        lead: 'die erste Stufe von Merck (20 mg/kg) in Milchschokolade',
      },
      {
        label: 'Zartbitter oder Halbbitter bis 20 mg/kg',
        lead: 'die erste Stufe von Merck (20 mg/kg) in Zartbitterschokolade',
      },
      {
        label: 'Backschokolade bis 20 mg/kg',
        lead: 'die erste Stufe von Merck (20 mg/kg) in Backschokolade',
      },
    ],
    thresholdNote:
      'Die Menge jeder Sorte, die 20 mg/kg erreicht, wo Merck die ersten leichten Anzeichen nennt, aus dem Gehalt pro Gramm von Merck für vier Gewichte ausgerechnet. Weniger ist keine Entwarnung: Der Anruf kommt zuerst.',
    questions: [
      {
        question: 'Ist weiße Schokolade für Hunde giftig?',
        answer:
          'Sie enthält sehr wenig Theobromin: Die ASPCA nennt weiße Schokolade die am wenigsten gefährliche Sorte, und CliniTox gibt 0,01 mg pro Gramm an. Rufen Sie trotzdem mit Menge und Verpackung bei Ihrer Tierarztpraxis an, um sicherzugehen.',
      },
      {
        question: 'Ab wie viel Gramm Schokolade wird es für meinen Hund gefährlich?',
        answer:
          'Das hängt von der Sorte und vom Gewicht ab: Die Tabelle oben zeigt die Menge, die 20 mg/kg erreicht, für Hunde von 5 bis 35 kg. Für Backschokolade ist es ein Bruchteil der Menge an Milchschokolade.',
      },
    ],
    sources: [
      SOURCES_DE.clinitoxMethylxanthine,
      SOURCES_DE.vetmeduniHolidays,
      SOURCES_DE.btkPoisonings,
    ],
  },
];
