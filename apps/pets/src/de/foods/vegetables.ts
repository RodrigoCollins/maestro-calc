import type { FoodDe } from './types.ts';

/** The vegetables of the German pages, in the order of the route table. */
export const VEGETABLES_DE: readonly FoodDe[] = [
  {
    id: 'tomatoes',
    name: 'Tomaten',
    answer: 'nur das reife rote Fruchtfleisch',
    short: 'Nur reif und rot',
    summary:
      'Reifes Tomatenfleisch ist nicht giftig, die grünen Teile der Pflanze und unreife Tomaten dagegen schon.',
    why: [
      'Die ASPCA führt die Tomatenpflanze wegen ihres Solanins als giftig für Hunde, Katzen und Pferde und fügt hinzu, dass die reife Frucht ungiftig ist. AKC schreibt, Hunde dürften reife Tomaten fressen, aber nur in kleinen Mengen.',
      'Als Giftstoffe nennt AKC Solanin und das verwandte Tomatin, die vor allem in den grünen Teilen der Pflanze sitzen; PetMD verweist auf das Tomatin in Stielen, Blättern und unreifen grünen Tomaten.',
      'Reife Tomaten liefern Ballaststoffe, Vitamin C, Kalium und Antioxidantien wie Lycopin (AKC, PetMD).',
    ],
    serve: [
      'Nur ganz rote, reife Tomaten. AKC: alle grünen Teile entfernen und das Fruchtfleisch würfeln.',
      'Waschen, Stielansatz und Blätter entfernen, dann pur oder unter das Futter gemischt geben (PetMD).',
    ],
    never: [
      'Blätter, Stiele und Ranken der Pflanze sowie grüne, unreife Tomaten (ASPCA, AKC, PetMD). Halten Sie Ihren Hund vom Gemüsebeet fern.',
      'Tomatensoße, Tomatensuppe, Ketchup und Salsa, die oft Knoblauch und Zwiebeln enthalten (AKC, PetMD).',
    ],
    signs: [
      'Für die Pflanze nennt die ASPCA Speicheln, Appetitlosigkeit, starke Magen-Darm-Beschwerden, Teilnahmslosigkeit, Schwäche, weite Pupillen und einen langsamen Herzschlag. AKC ergänzt Koordinationsstörungen, Zittern und einen unregelmäßigen Herzschlag.',
      'AKC: Hat Ihr Hund viele Tomaten oder Teile der Pflanze gefressen, rufen Sie die Tierarztpraxis an.',
    ],
    usdaName: 'reife rote Tomaten',
    piece: {
      a: 'eine Kirschtomate',
      one: 'Kirschtomate',
      many: 'Kirschtomaten',
      basis: 'USDA: 1 Kirschtomate = 17 g',
    },
    questions: [
      {
        question: 'Mein Hund hat Tomatenblätter im Garten gefressen. Ist das ernst?',
        answer:
          'Blätter und Stiele sind die giftigen Teile (ASPCA). Rufen Sie Ihre Tierarztpraxis an und sagen Sie, wie viel Ihr Hund gefressen hat und wie groß er ist; AKC rät bei vielen Tomaten oder bei Teilen der Pflanze zum Anruf.',
      },
      {
        question: 'Dürfen Hunde gekochte Tomaten oder Tomatensoße fressen?',
        answer:
          'Gekochtes reifes Fruchtfleisch ohne Zusätze ist dasselbe Lebensmittel. Soßen, Suppen und Ketchup enthalten aber oft Zwiebeln und Knoblauch (AKC, PetMD), und beide sind für Hunde giftig.',
      },
    ],
    sources: [],
  },
  {
    id: 'cucumber',
    name: 'Gurken',
    answer: 'Gurke ist ein unbedenkliches, leichtes Leckerli',
    short: 'Ja, in Scheiben',
    summary:
      'Pure Gurkenscheiben sind für Hunde unbedenklich und fast nur Wasser; Essiggurken sind ein anderes Lebensmittel.',
    why: [
      'PetMD nennt Gurken für Hunde sicher und gesund, und AKC sicher und kalorienarm, wenn sie richtig gegeben werden.',
      'Sie bestehen zu etwa 96 % aus Wasser (AKC, PetMD), sind fettfrei und sehr natriumarm (AKC) und liefern Vitamin K, Kalium und Magnesium (PetMD). Mit 15 kcal pro 100 g nach der USDA ist die Gurke das leichteste aller Lebensmittel auf der Liste dieser Seite.',
    ],
    serve: [
      'Waschen Sie die Gurke und schneiden Sie Scheiben passend zur Größe Ihres Hundes, nie eine ganze Gurke (AKC). PetMD schlägt Scheiben von höchstens 2,5 cm Durchmesser und etwa 6 mm Dicke vor.',
      'Roh als Leckerli oder über dem Futter, oder gefroren in einem Spielzeug mit hundegeeignetem Obst (PetMD).',
    ],
    never: [
      'Eine ganze Gurke oder große Stücke, an denen vor allem kleine Hunde ersticken können oder die den Darm verlegen (PetMD, AKC).',
      'Essiggurken und Gewürzgurken: Sie enthalten nach PetMD viel Salz und Gewürze wie Knoblauch und Zwiebeln.',
    ],
    usdaName: 'rohe Gurke mit Schale',
    piece: {
      a: 'eine halbe Tasse Gurkenscheiben',
      one: 'halbe Tasse Gurkenscheiben',
      many: 'halbe Tassen Gurkenscheiben',
      basis: 'USDA: ½ Tasse (cup) Scheiben = 52 g',
    },
    sizeGuide: {
      note: 'Die Portionstabelle von PetMD in Scheiben, die Gewichtsklassen in Kilogramm umgerechnet.',
      rows: [
        ['Sehr klein (1 bis 9 kg)', '1 bis 2 Scheiben'],
        ['Klein (10 bis 14 kg)', '2 bis 3 Scheiben'],
        ['Mittel (14 bis 23 kg)', '5 bis 6 Scheiben'],
        ['Groß (23 bis 41 kg)', 'Eine Handvoll Scheiben'],
        ['Sehr groß (ab 41 kg)', 'Eine große Handvoll'],
      ],
    },
    questions: [
      {
        question: 'Dürfen Hunde Gurkenschale fressen?',
        answer:
          'Ja: Die Quellen geben Gurke gewaschen und mit Schale in Scheiben. AKC rechnet mit etwa 8 Kalorien pro halber Tasse Scheiben.',
      },
      {
        question: 'Ist Gurke ein gutes Leckerli für einen Hund, der abnehmen soll?',
        answer:
          'Unter den Lebensmitteln dieser Seite hat sie die wenigsten Kalorien, und AKC nennt sie kalorienarm. Den Plan zum Abnehmen besprechen Sie trotzdem mit Ihrer Tierarztpraxis: Auch Gurke zählt zum Leckerli-Budget.',
      },
    ],
    sources: [],
  },
  {
    id: 'bell-peppers',
    name: 'Paprika',
    answer: 'pure Paprika ist unbedenklich',
    short: 'Ja, ohne Kerne',
    summary:
      'Paprika jeder Farbe ist für Hunde unbedenklich, entkernt und pur; scharfe Chilischoten sind es nicht.',
    why: [
      'Dr. Carly Fox, eine von AKC zitierte Tierärztin: Paprika ist nicht giftig und ein gesunder Snack, den Sie mit Ihrem Hund teilen können. PetMD nennt pure Paprika in Maßen unbedenklich.',
      'Jede Farbe ist in Ordnung, und rote Paprika hat die meisten Vitamine und Antioxidantien (AKC). Sie liefert die Vitamine A, C, E und B6, Beta-Carotin und Lutein (AKC) sowie Ballaststoffe (PetMD).',
    ],
    serve: [
      'Entfernen Sie Kerne und Stiel, was nach AKC Verdauungsbeschwerden vorbeugt.',
      'Roh und klein geschnitten, gedünstet oder püriert geben, immer pur: kein Knoblauch, keine Zwiebeln, kein Salz, kein Öl und keine Butter (PetMD, AKC). Roh ist die Haut schwer zu kauen (AKC).',
    ],
    never: [
      'Scharfe Schoten: PetMD rät, Hunden nie scharfe Paprika oder mit Capsaicin gewürztes Essen wie Chilipulver zu geben; AKC nennt Jalapeños.',
      'Gefüllte Paprika und Paprikagerichte mit Zwiebeln oder Knoblauch.',
    ],
    signs: ['Zu viel Paprika kann Erbrechen oder Durchfall (AKC) und Blähungen (PetMD) auslösen.'],
    usdaName: 'rohe rote Paprika',
    piece: {
      a: 'ein Paprikaring',
      one: 'Paprikaring',
      many: 'Paprikaringe',
      basis: 'USDA: 1 Ring (7,5 cm Durchmesser, 6 mm dick) = 10 g',
    },
    sizeGuide: {
      note: 'Die Mengen von PetMD pro Woche, die Gewichtsklassen in Kilogramm umgerechnet. AKC gibt stattdessen eine Grenze pro Portion an: weniger als ein Viertel Schote auf einmal für einen kleinen Hund, weniger als eine halbe für einen großen.',
      rows: [
        ['Sehr klein (1 bis 5 kg)', '1 bis 2 kleine Stücke'],
        ['Klein (5 bis 9 kg)', 'Weniger als ¼ Schote, klein geschnitten'],
        ['Mittel (10 bis 23 kg)', '¼ Schote, klein geschnitten'],
        ['Groß (23 bis 41 kg)', '½ Schote, klein geschnitten'],
        ['Sehr groß (ab 41 kg)', '¾ Schote, klein geschnitten'],
      ],
    },
    disagree: [
      'Die Grenzen von AKC gelten pro Portion, die von PetMD pro Woche. Für einen großen Hund erlaubt AKC also fast eine halbe Schote auf einmal, PetMD eine halbe Schote in der Woche.',
    ],
    questions: [
      {
        question: 'Dürfen Hunde grüne Paprika fressen?',
        answer:
          'Ja. Nach AKC ist jede Farbe unbedenklich; rote Paprika ist nur die reifste, mit den meisten Vitaminen und Antioxidantien.',
      },
      {
        question: 'Und Paprikapulver?',
        answer:
          'Die Quellen sprechen von der frischen, milden Schote. Gewürze mit Capsaicin wie Chilipulver soll ein Hund nach PetMD nie bekommen, und gewürzte Gerichte enthalten oft Zwiebeln oder Knoblauch.',
      },
    ],
    sources: [],
  },
];
