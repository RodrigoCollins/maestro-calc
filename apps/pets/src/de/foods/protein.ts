import type { FoodDe } from './types.ts';

/** The dairy and meat of the German pages, in the order of the route table. */
export const PROTEIN_DE: readonly FoodDe[] = [
  {
    id: 'cheese',
    name: 'Käse',
    answer: 'ein kleiner Würfel milder Käse',
    short: 'Ja, ein Würfel',
    summary:
      'Ein kleiner Würfel milder, fettärmerer Käse ist für die meisten Hunde in Ordnung, aber viele vertragen keine Laktose, und Käse ist fettreich.',
    why: [
      'PetMD schreibt, Hunde dürften Käse in Maßen fressen, obwohl die meisten laktoseintolerant sind; AKC erlaubt ihn als gelegentliches Leckerli. Die ASPCA erklärt die Grenze: Haustieren fehlt genug Laktase, das Enzym, das Milchzucker spaltet, und so können Milchprodukte Durchfall und andere Verdauungsbeschwerden auslösen.',
      'Käse ist außerdem fett und salzig (PetMD). Cheddar hat nach der USDA 403 kcal pro 100 g, ein wenig davon verbraucht das Leckerli-Budget also schnell. Nach einer Bauchspeicheldrüsenentzündung (Pankreatitis) soll ein Hund laut PetMD keinen Käse bekommen.',
    ],
    serve: [
      'Ein kleiner Würfel oder ein paar Raspel reichen fürs Training oder als Belohnung meist aus (AKC).',
      'Wählen Sie fettärmere, laktosearme Sorten wie Mozzarella, Hüttenkäse oder milden Ziegenfrischkäse (AKC, PetMD).',
    ],
    never: [
      'Blauschimmelkäse, den PetMD für Hunde giftig nennt (er enthält Roquefortin).',
      'Käse mit Knoblauch, Zwiebeln oder Schnittlauch (AKC).',
    ],
    signs: ['Erbrechen, Durchfall, ein aufgeblähter Bauch oder Blähungen (PetMD).'],
    usdaName: 'Cheddar',
    piece: {
      a: 'ein Würfel von 2,5 cm Kantenlänge',
      one: 'Würfel von 2,5 cm',
      many: 'Würfel von 2,5 cm',
      basis: 'USDA: 1 Kubikzoll (2,5-cm-Würfel) Cheddar = 17 g',
    },
    sizeGuide: {
      note: 'Die Mengen von PetMD, einige Male pro Woche, die Gewichtsklassen in Kilogramm umgerechnet.',
      rows: [
        ['Sehr klein (1 bis 5 kg)', '1 bis 2 erbsengroße Stücke'],
        ['Klein (5 bis 9 kg)', '1 bis 2 Würfel von 6 mm'],
        ['Mittel (10 bis 23 kg)', '3 bis 4 Würfel'],
        ['Groß (23 bis 41 kg)', '5 bis 6 Würfel'],
        ['Sehr groß (ab 41 kg)', '7 bis 8 Würfel'],
      ],
    },
    questions: [
      {
        question: 'Dürfen Hunde Hüttenkäse fressen?',
        answer:
          'Ja, in kleinen Mengen: AKC zählt Hüttenkäse zu den besseren Sorten, weil er weniger Fett und Natrium enthält.',
      },
      {
        question: 'Eignet sich Käse als Belohnung im Training?',
        answer:
          'In kleinen Stücken ja: AKC schreibt, ein kleiner Würfel oder ein paar Raspel genügten meist. Bei vielen Wiederholungen am Tag zählt jedes Stück zum Leckerli-Budget, und Cheddar ist kalorienreich: Ein Würfel von 2,5 cm hat nach der USDA schon 69 kcal.',
      },
    ],
    sources: [],
  },
];
