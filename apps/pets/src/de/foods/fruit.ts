import { SOURCES_DE } from './sources.ts';
import type { FoodDe } from './types.ts';

/** The fruit of the German pages, in the order of the route table. */
export const FRUIT_DE: readonly FoodDe[] = [
  {
    id: 'strawberries',
    name: 'Erdbeeren',
    answer: 'frische Erdbeeren sind ein unbedenkliches Leckerli',
    short: 'Ja, in Maßen',
    summary:
      'Frische, pure Erdbeeren vertragen die meisten Hunde in kleinen Mengen gut; die ASPCA stuft die Pflanze als ungiftig ein.',
    why: [
      'Auf der Pflanzenliste der ASPCA gelten Erdbeeren (Fragaria) für Hunde als ungiftig. Der American Kennel Club (AKC) antwortet mit „ja, in Maßen“, und PetMD schreibt, dass die meisten Hunde sie gefahrlos fressen können, wenn sie richtig vorbereitet sind.',
      'Erdbeeren liefern Ballaststoffe und Vitamin C, laut PetMD außerdem B-Vitamine, Vitamin K, Magnesium und Kalium. Sie enthalten aber auch Zucker: Für Hunde mit Diabetes, Übergewicht oder Zuckerempfindlichkeit sind sie nach PetMD kein gutes Leckerli.',
    ],
    serve: [
      'Waschen Sie die Beeren gründlich und entfernen Sie Stiel und Blätter (AKC, PetMD).',
      'Schneiden Sie sie in Scheiben von etwa 6 mm, wie PetMD es gegen Verschlucken empfiehlt; AKC rät zu kleinen Stücken und im Sommer zu gefrorenen.',
      'Keine Erdbeeren aus der Dose und keine in Sirup: Laut AKC enthalten sie zu viel Zucker, manche auch Xylit (Birkenzucker).',
    ],
    never: [
      'Das grüne Kraut: nicht giftig, aber nach AKC schlecht für den Magen und nach PetMD eine Gefahr zum Verschlucken.',
      'Erdbeerdesserts, Marmelade und zuckerfreie Erdbeerprodukte, in denen Xylit stecken kann.',
    ],
    usdaName: 'rohe Erdbeeren',
    piece: {
      a: 'eine mittelgroße Erdbeere',
      one: 'mittelgroße Erdbeere',
      many: 'mittelgroße Erdbeeren',
      basis: 'USDA: 1 mittelgroße Erdbeere (3 cm Durchmesser) = 12 g',
    },
    sizeGuide: {
      note: 'Die Portionstabelle von PetMD in Scheiben, die Gewichtsklassen von Pfund in Kilogramm umgerechnet. AKC nennt ein bis drei Erdbeeren am Tag als vernünftigen Anfang für die meisten Hunde.',
      rows: [
        ['Sehr klein (1 bis 9 kg)', '1 bis 2 Scheiben'],
        ['Klein (10 bis 14 kg)', '2 bis 3 Scheiben'],
        ['Mittel (14 bis 23 kg)', '5 bis 6 Scheiben'],
        ['Groß (23 bis 41 kg)', 'Eine Handvoll Scheiben'],
        ['Sehr groß (ab 41 kg)', 'Eine große Handvoll Scheiben'],
      ],
    },
    questions: [
      {
        question: 'Dürfen Welpen Erdbeeren essen?',
        answer:
          'Für Welpen nennen die Quellen keine eigene Regel. AKC rät, vor den ersten Erdbeeren mit der Tierarztpraxis zu sprechen, vor allem bei Diabetes, Gewichtsproblemen oder empfindlichem Magen. Bei einem Welpen passt dieselbe Vorsicht: eine kleine Scheibe, dann abwarten.',
      },
      {
        question: 'Wie viele Erdbeeren darf mein Hund am Tag fressen?',
        answer:
          'Das Leckerli-Budget in der Tabelle oben ist die Obergrenze für alle Leckerlis zusammen. Die Mengen von PetMD und AKC liegen weit darunter: ein bis drei Beeren oder einige Scheiben, je nach Größe.',
      },
    ],
    sources: [],
  },
  {
    id: 'bananas',
    name: 'Bananen',
    answer: 'geschält und nur ab und zu',
    short: 'Ja, aber wenig',
    summary:
      'Geschälte Banane in kleinen Stücken ist unbedenklich, enthält laut PetMD aber mehr Zucker als viele Hundeleckerlis.',
    why: [
      'Die ASPCA stuft die Bananenpflanze für Hunde als ungiftig ein. PetMD schreibt, Hunde könnten Bananen in Maßen gefahrlos fressen; AKC empfiehlt sie als gelegentliche Beigabe und nicht als täglichen Snack.',
      'Der Haken ist der Zucker. Bananen enthalten laut PetMD mehr Zucker als viele Hundeleckerlis, und zu viel davon bringt nach AKC zusätzliche Kalorien und kann den Magen verstimmen. Hunde mit Übergewicht oder Diabetes sollten sie nur bekommen, wenn die Tierarztpraxis zustimmt (PetMD).',
      'Dafür liefern sie Kalium, Vitamin B6, Vitamin C, Ballaststoffe und Magnesium (AKC) sowie Biotin (PetMD).',
    ],
    serve: [
      'Schälen Sie die Banane vollständig und schneiden Sie Scheiben von etwa 6 mm (PetMD) oder mundgerechte Stücke (AKC).',
      'Frisch, zerdrückt unter dem Futter oder gefroren in einem Futterspielzeug (AKC, PetMD).',
    ],
    never: [
      'Die Schale. Nach AKC ist sie nicht giftig, aber schwer verdaulich und kann den Darm verstopfen; PetMD sieht es genauso.',
    ],
    usdaName: 'rohe Bananen',
    piece: {
      a: 'eine mittelgroße Banane',
      one: 'mittelgroße Banane',
      many: 'mittelgroße Bananen',
      basis: 'USDA: 1 mittelgroße Banane (18 bis 20 cm lang) = 118 g',
    },
    sizeGuide: {
      note: 'Die Tagesmengen von PetMD nach Größe, die Gewichtsklassen in Kilogramm umgerechnet.',
      rows: [
        ['Sehr klein (1 bis 5 kg)', '1 bis 2 Scheiben'],
        ['Klein (5 bis 9 kg)', '2 bis 3 Scheiben'],
        ['Mittel (10 bis 23 kg)', '3 bis 6 Scheiben'],
        ['Groß (23 bis 41 kg)', 'Eine Handvoll Scheiben'],
        ['Sehr groß (ab 41 kg)', 'Bis zu einer halben Banane'],
      ],
    },
    questions: [
      {
        question: 'Darf mein Hund jeden Tag Banane fressen?',
        answer:
          'Die Tabelle von PetMD nennt Tagesmengen, von ein, zwei Scheiben für die kleinsten Hunde bis zu einer halben Banane für die größten. AKC sieht Banane wegen des Zuckers lieber als gelegentliche Beigabe denn als täglichen Snack.',
      },
      {
        question: 'Hilft Banane bei Durchfall?',
        answer:
          'Keine der Quellen dieser Seite empfiehlt Banane als Mittel gegen Durchfall. AKC warnt im Gegenteil, dass zu viel Banane den Magen verstimmen kann. Bei Durchfall gehört der Hund zur Tierarztpraxis, nicht an den Obstkorb.',
      },
    ],
    sources: [],
  },
  {
    id: 'grapes',
    name: 'Weintrauben',
    answer: 'Weintrauben sind für Hunde giftig',
    short: 'Nein, giftig',
    summary:
      'Weintrauben jeder Farbe können bei Hunden ein Nierenversagen auslösen, und keine Quelle nennt eine sichere Menge.',
    why: [
      'Das Merck Veterinary Manual bringt Weintrauben, Rosinen und Korinthen mit Nierenversagen bei Hunden in Verbindung. CliniTox, die Giftdatenbank der Vetsuisse-Fakultät Zürich, beschreibt dasselbe akute Nierenversagen, das unbehandelt zum Tod führt; die Kleintierklinik der Universität Bern schreibt, dass rund 55 % der betroffenen Hunde die Vergiftung überleben.',
      'Welcher Stoff dahintersteckt, ist nicht abschließend geklärt. Die ASPCA und Merck vermuten die Weinsäure, die in den Früchten reichlich vorkommt und die Hunde schlechter ausscheiden als andere Tiere. 2022 beschrieben Wegenast und Kollegen sechs Hunde mit Nierenschaden nach Weinstein oder Tamarinde, beide reich an Weinsäure. AKC zitiert dagegen die Notfalltierärztin Dr. Jessica Dowling: Der genaue Stoff sei noch unbekannt.',
      'Laut VCA gilt das Risiko für kernlose und kernhaltige, rote und grüne Trauben, aus Bio-Anbau oder nicht. Traubensaft, Wein und Traubenkernextrakt scheinen nach VCA nicht dieselbe Vergiftung auszulösen.',
    ],
    serve: [
      'Rufen Sie sofort Ihre Tierarztpraxis oder den tierärztlichen Notdienst an, auch nach einer einzigen Traube und auch wenn Ihr Hund unauffällig wirkt (PetMD, VCA).',
      'Lösen Sie kein Erbrechen zu Hause aus, etwa mit Wasserstoffperoxid (AKC). Merck beschreibt für Hunde, die noch gesund wirken, eine rasche Entgiftung durch die Tierärztin oder den Tierarzt und danach mindestens 48 Stunden Infusionen.',
      'Zählen Sie, was fehlt, und notieren Sie die Uhrzeit: Am Telefon wird zuerst gefragt, wie viele Trauben, wie schwer der Hund ist und wie lange es her ist.',
    ],
    never: [
      'Frische Weintrauben jeder Sorte und ihre getrockneten Formen: Rosinen, Sultaninen und Korinthen.',
      'Kuchen, Stollen, Müsli und Studentenfutter, die sie enthalten. Die Vetmeduni Wien nennt Weintrauben und Rosinen ausdrücklich unter den Festtagsgefahren für Hunde.',
    ],
    signs: [
      'Merck und AKC: Erbrechen oder Durchfall innerhalb von 6 bis 12 Stunden, danach innerhalb von 24 bis 72 Stunden ein Nierenversagen, bei dem der Hund kaum oder keinen Urin mehr absetzt. CliniTox nennt Erbrechen, Durchfall, Mattigkeit und Appetitlosigkeit innerhalb von 24 Stunden und das Nierenversagen innerhalb von 24 bis 72 Stunden.',
      'Achten Sie außerdem auf Schwäche, Bauchschmerzen, starken Durst und Zittern (Merck, AKC, PetMD).',
    ],
    disagree: [
      'Bei der Menge liegen die Quellen weit auseinander. Merck zieht die Linie bei mehr als einer Traube oder Rosine pro 10 Pfund (4,5 kg) Körpergewicht. CliniTox gibt als toxische Dosis 10 bis 30 g Weintrauben pro kg an, die Universität Bern beschreibt Nierenversagen ab 20 g frischen Trauben pro kg, und beide betonen große Unterschiede zwischen einzelnen Hunden. VCA sagt, es gebe keine gesicherte giftige Dosis, und PetMD, es gebe keine sichere Anzahl.',
      'Bei der Zeit kommen die ersten Anzeichen nach PetMD innerhalb weniger Stunden, nach Merck und AKC nach 6 bis 12 Stunden, nach VCA nach 12 bis 24 Stunden und nach CliniTox innerhalb von 24 Stunden.',
    ],
    usdaName: 'rohe Weintrauben',
    piece: {
      a: 'eine Weintraube',
      one: 'Weintraube',
      many: 'Weintrauben',
      basis: 'USDA: 10 Weintrauben = 49 g',
    },
    thresholds: [
      {
        label: 'Merck: mehr als das kann die Nieren schädigen',
        lead: 'die Linie, die Merck bei einer Weintraube pro 10 Pfund (4,5 kg) zieht,',
      },
    ],
    thresholdNote:
      'Die Anzahl unten ist die Linie von Merck, eine Traube pro 10 Pfund (4,5 kg) Körpergewicht, für vier Gewichte ausgerechnet. Sie ist die niedrigste Angabe der Quellen und keine sichere Menge: Nach VCA reagieren manche Hunde schon auf weniger, und der Weinsäuregehalt der Trauben schwankt (Merck). Rufen Sie bei jeder Menge an.',
    questions: [
      {
        question: 'Mein Hund hat eine Weintraube gefressen. Was soll ich tun?',
        answer:
          'Rufen Sie Ihre Tierarztpraxis an. PetMD rät dazu auch bei einer einzigen Traube, weil es keine bekannte sichere Anzahl gibt, und ein kleiner Hund liegt mit einer Traube schon nahe an der Linie von Merck.',
      },
      {
        question: 'Sind grüne Trauben weniger gefährlich als rote?',
        answer:
          'Nein. Laut VCA ist das Risiko bei roten und grünen, kernlosen und kernhaltigen, gekauften und selbst geernteten Trauben gleich.',
      },
    ],
    sources: [
      SOURCES_DE.clinitoxVitis,
      SOURCES_DE.bernGrapes,
      SOURCES_DE.vetmeduniHolidays,
      SOURCES_DE.btkPoisonings,
    ],
  },
  {
    id: 'blueberries',
    name: 'Blaubeeren',
    answer: 'Blaubeeren sind ein unbedenkliches kleines Leckerli',
    short: 'Ja, ein paar',
    summary:
      'Frische oder gefrorene pure Blaubeeren (Heidelbeeren) vertragen die meisten Hunde, ein paar auf einmal; Muffins und gezuckerte Beeren nicht.',
    why: [
      'AKC schreibt, Hunde dürften Blaubeeren in Maßen fressen, und PetMD, die meisten Hunde vertrügen sie pur.',
      'Sie stecken voller Antioxidantien und sekundärer Pflanzenstoffe, dazu Ballaststoffe und Vitamin C (PetMD, AKC). Und sie gehören zu den kleinsten Früchten, die ein Hund bekommen kann: rund 1,4 g pro Beere nach den Gewichten der USDA.',
    ],
    serve: [
      'Waschen Sie die Beeren unter kaltem Wasser und entfernen Sie Stiele (PetMD).',
      'Frisch oder gefroren (AKC). Sehr kleinen Hunden halbieren oder zerdrücken Sie sie, damit sie sich nicht verschlucken (AKC, PetMD).',
      'Nur pur: PetMD rät von Beeren aus der Dose, gezuckerten, in Sirup eingelegten oder aromatisierten ab.',
    ],
    never: ['Blaubeermuffins, Kuchen und Marmelade (PetMD).'],
    usdaName: 'rohe Blaubeeren',
    piece: {
      a: 'eine Blaubeere',
      one: 'Blaubeere',
      many: 'Blaubeeren',
      basis: 'USDA: 50 Beeren = 68 g',
    },
    sizeGuide: {
      note: 'Die Tagesmengen von PetMD in Beeren, die Gewichtsklassen in Kilogramm umgerechnet. AKC nennt zwei bis drei für einen kleinen Hund und einige mehr für einen größeren.',
      rows: [
        ['Sehr klein (1 bis 5 kg)', '1 bis 2 Blaubeeren'],
        ['Klein (5 bis 9 kg)', '2 bis 3 Blaubeeren'],
        ['Mittel (10 bis 23 kg)', '3 bis 5 Blaubeeren'],
        ['Groß (23 bis 41 kg)', '5 bis 6 Blaubeeren'],
        ['Sehr groß (ab 41 kg)', '6 bis 10 Blaubeeren'],
      ],
    },
    questions: [
      {
        question:
          'Warum nennen die Tabellen so wenige Beeren, wenn das Kalorienbudget mehr erlaubt?',
        answer:
          'Das Leckerli-Budget ist eine Obergrenze für alle Leckerlis zusammen, kein Ziel für eine einzige Frucht. Die Mengen von PetMD lassen Platz für die übrigen Leckerlis des Tages und für einen Magen, der kein Obst gewohnt ist.',
      },
      {
        question: 'Sind Heidelbeeren und Blaubeeren dasselbe?',
        answer:
          'Im Handel ja: Die meisten Blaubeeren im Supermarkt sind Kulturheidelbeeren. Die Quellen dieser Seite sprechen von „blueberries“, frisch oder gefroren und pur.',
      },
    ],
    sources: [],
  },
  {
    id: 'apples',
    name: 'Äpfel',
    answer: 'Apfelstücke ja, aber ohne Kerngehäuse',
    short: 'Ja, ohne Kerne',
    summary:
      'Entkernte Apfelstücke sind ein unbedenkliches Leckerli; Kerne, Kerngehäuse und Stiel gehören nicht in den Napf.',
    why: [
      'AKC nennt Äpfel ein sicheres, gesundes Leckerli in Maßen, und PetMD schreibt, Hunde könnten sie gefahrlos fressen, wenn Kerne, Kerngehäuse und Stiel entfernt sind.',
      'Auf der Pflanzenliste der ASPCA steht der Apfelbaum als giftig für Hunde, mit Begründung: Stiele, Blätter und Kerne enthalten cyanogene Glykoside, die Blausäure freisetzen. Das Fruchtfleisch ist der Teil, den Menschen und Hunde essen.',
      'Es liefert Vitamin C, Vitamin A, Kalium und Ballaststoffe (AKC) und ist fettarm (PetMD).',
    ],
    serve: [
      'Waschen Sie den Apfel und entfernen Sie Kerngehäuse, Kerne und Stiel (AKC, PetMD).',
      'Schneiden Sie Spalten oder Würfel; PetMD schlägt Stücke von etwa 2,5 cm Breite und 6 mm Dicke vor. Geschält ist er für einen empfindlichen Magen leichter (AKC, PetMD).',
      'Nach AKC genügen ein, zwei Apfelspalten, um einen Hund zufriedenzustellen.',
    ],
    never: [
      'Die Kerne, die etwas Blausäure enthalten (AKC, PetMD), das Kerngehäuse, an dem ein Hund ersticken oder das den Darm verlegen kann, und den Stiel.',
      'Apfelkuchen, gesüßtes Apfelmus und Apfelprodukte mit Xylit.',
    ],
    signs: [
      'Zu viel Apfel kann den Magen verstimmen (AKC, PetMD). Für Blausäure aus Kernen, Stielen und Blättern nennt die ASPCA ziegelrotes Zahnfleisch, weite Pupillen, Atemnot, Hecheln und Schock: Rufen Sie sofort die Tierarztpraxis an, wenn Sie das sehen.',
    ],
    usdaName: 'rohe Äpfel mit Schale',
    piece: {
      a: 'eine Tasse Apfelscheiben',
      one: 'Tasse Apfelscheiben',
      many: 'Tassen Apfelscheiben',
      basis: 'USDA: 1 Tasse (cup) Scheiben = 109 g',
    },
    sizeGuide: {
      note: 'Die Tagesmengen von PetMD in Stücken von etwa 2,5 cm mal 6 mm, die Gewichtsklassen in Kilogramm umgerechnet.',
      rows: [
        ['Sehr klein (1 bis 5 kg)', '1 bis 2 Stücke'],
        ['Klein (5 bis 9 kg)', '2 bis 3 Stücke'],
        ['Mittel (10 bis 23 kg)', '3 bis 4 Stücke'],
        ['Groß (23 bis 41 kg)', '4 bis 5 Stücke'],
        ['Sehr groß (ab 41 kg)', '5 bis 6 Stücke'],
      ],
    },
    questions: [
      {
        question: 'Mein Hund hat ein Kerngehäuse gefressen. Ist das gefährlich?',
        answer:
          'Ein Kerngehäuse ist vor allem eine Gefahr zum Verschlucken und für einen Darmverschluss (AKC, PetMD); seine wenigen Kerne enthalten nur wenig Blausäure, die nach AKC erst in großen Mengen schadet. Achten Sie auf Erbrechen, einen harten Bauch oder einen Hund, der nicht mehr frisst, und rufen Sie dann die Tierarztpraxis an.',
      },
      {
        question: 'Dürfen Hunde Apfelmus fressen?',
        answer:
          'Die Quellen sprechen von frischem Fruchtfleisch. Gesüßtes Apfelmus bringt zusätzlichen Zucker, und Produkte mit Xylit sind für Hunde giftig: Lesen Sie die Zutatenliste.',
      },
    ],
    sources: [],
  },
  {
    id: 'watermelon',
    name: 'Wassermelone',
    answer: 'kernloses Fruchtfleisch ist unbedenklich',
    short: 'Ja, ohne Schale',
    summary:
      'Wassermelone ohne Schale und Kerne ist unbedenklich und besteht fast nur aus Wasser; die Schale kann den Darm verlegen.',
    why: [
      'PetMD schreibt, die meisten Hunde könnten Wassermelone pur und richtig vorbereitet gefahrlos fressen; AKC nennt sie ein erfrischendes Leckerli, das Flüssigkeit liefert, wenn es sicher und in Maßen gegeben wird.',
      'Sie besteht zu etwa 92 % aus Wasser (AKC), mit den Vitaminen A, B6 und C und Kalium, und ist nach den Zahlen der USDA eine der leichtesten Früchte auf dieser Liste: 30 kcal pro 100 g.',
    ],
    serve: [
      'Waschen Sie die Melone, schneiden Sie das Fruchtfleisch vollständig von der Schale und entfernen Sie die Kerne (AKC, PetMD).',
      'PetMD schlägt Stücke von etwa 2,5 × 2,5 cm und 6 mm Dicke vor; AKC einige mundgerechte Stücke als gelegentliches Leckerli.',
      'Gefrorene Würfel oder ein Püree mit Naturjoghurt ohne Xylit sind ein Sommerleckerli (AKC).',
    ],
    never: [
      'Die Schale: An ihr kann ein Hund nach PetMD ersticken, oder sie verlegt den Darm; AKC nennt zusätzlich Erbrechen, Durchfall und Magenverstimmung.',
      'Die Kerne: eine Gefahr zum Verschlucken und für einen Darmverschluss (AKC); PetMD erwähnt Spuren von Blausäure, hält eine Vergiftung aber für sehr unwahrscheinlich.',
    ],
    usdaName: 'rohe Wassermelone',
    piece: {
      a: 'eine Tasse Melonenwürfel',
      one: 'Tasse Melonenwürfel',
      many: 'Tassen Melonenwürfel',
      basis: 'USDA: 1 Tasse (cup) Würfel = 152 g',
    },
    sizeGuide: {
      note: 'Die Mengen von PetMD, zwei- bis dreimal pro Woche, in Stücken von etwa 2,5 × 2,5 cm und 6 mm Dicke; die Gewichtsklassen in Kilogramm umgerechnet.',
      rows: [
        ['Sehr klein (1 bis 5 kg)', '2 bis 3 Stücke'],
        ['Klein (5 bis 9 kg)', '3 bis 4 Stücke'],
        ['Mittel (10 bis 23 kg)', '3 bis 4 Stücke'],
        ['Groß (23 bis 41 kg)', '4 bis 5 Stücke'],
        ['Sehr groß (ab 41 kg)', '5 bis 6 Stücke'],
      ],
    },
    disagree: [
      'AKC rechnet mit rund 50 Kalorien pro Tasse Wassermelone; nach den Zahlen der USDA sind es etwa 46 kcal für eine Tasse Würfel (152 g bei 30 kcal pro 100 g). Diese Seite rechnet mit der USDA.',
    ],
    questions: [
      {
        question: 'Ist Wassermelone gut für einen Hund mit Diabetes?',
        answer:
          'PetMD rät, sie Hunden mit Diabetes oder Übergewicht nicht zu geben. Fragen Sie zuerst Ihre Tierarztpraxis.',
      },
      {
        question: 'Mein Hund hat ein Stück Melonenschale gefressen. Was nun?',
        answer:
          'Die Schale ist nicht giftig, aber schwer verdaulich und kann den Darm verlegen (PetMD, AKC). Beobachten Sie Ihren Hund: Bei Erbrechen, Bauchschmerzen oder wenn er nicht mehr frisst, rufen Sie die Tierarztpraxis an.',
      },
    ],
    sources: [],
  },
  {
    id: 'mango',
    name: 'Mango',
    answer: 'geschält und ohne Kern',
    short: 'Ja, ohne Kern',
    summary:
      'Reife, geschälte Mango ohne Kern ist in kleinen Stücken unbedenklich, aber zuckerreich, und der Kern ist gefährlich.',
    why: [
      'AKC schreibt, Hunde dürften Mango fressen, wenn sie richtig vorbereitet ist; PetMD erlaubt kleine Mengen des reifen Fruchtfleischs als gelegentliches Leckerli.',
      'Mango liefert Ballaststoffe und die Vitamine A, B6, C und E (AKC). Vorsicht verlangen ihr Zucker und ihre Ballaststoffe, die den Magen verstimmen können; Hunde mit Diabetes sollten nach PetMD darauf verzichten.',
    ],
    serve: [
      'Waschen und schälen Sie die Mango und schneiden Sie das Fruchtfleisch vom Kern (AKC, PetMD).',
      'Kleine, mundgerechte Stücke, und zu Beginn nur wenig (PetMD).',
    ],
    never: [
      'Den Kern: Für AKC eine ernste Erstickungsgefahr mit kleinen Mengen Blausäure; PetMD nennt zusätzlich die Gefahr eines Darmverschlusses.',
      'Die Schale, die nach beiden Quellen schwer verdaulich ist.',
    ],
    signs: [
      'Zu viel Obst kann Bauchweh und Durchfall bringen (AKC). Hat Ihr Hund einen Kern verschluckt, achten Sie darauf, wie er frisst, und rufen Sie bei der ersten Veränderung die Tierarztpraxis an (AKC).',
    ],
    usdaName: 'rohe Mango',
    piece: {
      a: 'eine Tasse Mangostücke',
      one: 'Tasse Mangostücke',
      many: 'Tassen Mangostücke',
      basis: 'USDA: 1 Tasse (cup) Stücke = 165 g',
    },
    sizeGuide: {
      note: 'Die Mengen von PetMD, gewürfelt, die Gewichtsklassen in Kilogramm umgerechnet; eine Tasse (cup) sind 165 g. Vergleichen Sie sie mit dem Leckerli-Budget oben: Für die größten Hunde ist eine Tasse Mango der größte Teil der Leckerlis eines Tages.',
      rows: [
        ['Sehr klein (1 bis 5 kg)', '⅛ Tasse, gewürfelt'],
        ['Klein (5 bis 9 kg)', '⅓ Tasse, gewürfelt'],
        ['Mittel (10 bis 23 kg)', '½ Tasse, gewürfelt'],
        ['Groß (23 bis 41 kg)', '¾ Tasse, gewürfelt'],
        ['Sehr groß (ab 41 kg)', '1 Tasse, gewürfelt'],
      ],
    },
    questions: [
      {
        question: 'Dürfen Hunde getrocknete Mango fressen?',
        answer:
          'Die Quellen sprechen nur von frischer, reifer Mango. Trockenobst bündelt den Zucker von viel mehr Frucht in jedem Stück und verbraucht das Leckerli-Budget deshalb viel schneller.',
      },
      {
        question: 'Mein Hund hat einen Mangokern verschluckt. Ist das ein Notfall?',
        answer:
          'Der Kern ist groß und hart; AKC nennt ihn eine ernste Erstickungsgefahr, PetMD die Gefahr eines Darmverschlusses. Rufen Sie die Tierarztpraxis an und beschreiben Sie, wie groß der Kern und wie groß Ihr Hund ist.',
      },
    ],
    sources: [],
  },
  {
    id: 'pineapple',
    name: 'Ananas',
    answer: 'frische Ananas ist unbedenklich',
    short: 'Ja, frisch',
    summary:
      'Rohe, geschälte Ananas ohne den harten Strunk ist ein unbedenkliches Leckerli; Ananas aus der Dose in Sirup nicht.',
    why: [
      'PetMD schreibt, Hunde könnten Ananas in Maßen gefahrlos fressen, wenn sie richtig vorbereitet ist, und AKC, dass ein paar Stücke roher Ananas für die meisten Hunde genügen.',
      'Sie liefert Vitamin C, B-Vitamine, Mangan, Kupfer und Kalium (AKC) und viel Wasser. Ihr Zucker, ihre Ballaststoffe und ihre Säure können einen empfindlichen Magen verstimmen (PetMD).',
    ],
    serve: [
      'Schälen Sie sie, schneiden Sie den Strunk heraus und das Fruchtfleisch in mundgerechte Stücke (AKC).',
      'Gefrorene Stücke frischer Ananas sind ein Sommerleckerli (AKC).',
      'Nur frisch: Der Sirup von Dosenobst ist nach AKC zu süß, und getrocknete Ananas kann nach PetMD Zucker und Konservierungsstoffe enthalten.',
    ],
    never: [
      'Strunk, Schale, Stiel und Blätter: Nach PetMD sind sie schwer verdaulich, ein Hund kann daran ersticken, oder sie verlegen den Darm.',
    ],
    signs: [
      'Durchfall oder Magenverstimmung nach dem Fressen; AKC rät, dann die Tierarztpraxis anzurufen.',
    ],
    usdaName: 'rohe Ananas',
    piece: {
      a: 'eine Tasse Ananasstücke',
      one: 'Tasse Ananasstücke',
      many: 'Tassen Ananasstücke',
      basis: 'USDA: 1 Tasse (cup) Stücke = 165 g',
    },
    sizeGuide: {
      note: 'Die Portionstabelle von PetMD in mundgerechten Stücken, die Gewichtsklassen in Kilogramm umgerechnet.',
      rows: [
        ['Sehr klein (1 bis 9 kg)', '1 bis 2 Stücke'],
        ['Klein (10 bis 14 kg)', '2 bis 3 Stücke'],
        ['Mittel (14 bis 23 kg)', '5 bis 6 Stücke'],
        ['Groß (23 bis 41 kg)', 'Eine Handvoll Stücke'],
        ['Sehr groß (ab 41 kg)', 'Eine große Handvoll Stücke'],
      ],
    },
    questions: [
      {
        question: 'Hält Ananas Hunde davon ab, Kot zu fressen?',
        answer:
          'Keine der tierärztlichen Quellen dieser Seite behauptet das. Sie behandeln Ananas nur als gelegentliches Leckerli.',
      },
      {
        question: 'Dürfen Hunde Ananas aus der Dose fressen?',
        answer:
          'Besser nicht: AKC hält den Sirup von Dosenobst für zu süß. Wenn überhaupt, dann frische Ananas.',
      },
    ],
    sources: [],
  },
];
