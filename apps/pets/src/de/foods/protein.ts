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
  {
    id: 'eggs',
    name: 'Eier',
    answer: 'gekochte Eier sind unbedenklich',
    short: 'Ja, gekocht',
    summary:
      'Durchgegarte Eier ohne Zutaten sind für Hunde einige Male pro Woche unbedenklich; rohe Eier können Salmonellen übertragen.',
    why: [
      'PetMD (verfasst von Dr. Hector Joy, Tierarzt) schreibt, Hunde könnten gekochte Eier in Maßen gefahrlos fressen; AKC nennt sie sicher und nahrhaft, wenn sie durchgegart sind und nur ab und zu gegeben werden.',
      'Eier liefern hochwertiges, leicht verdauliches Eiweiß mit den Vitaminen A, D und E, B-Vitaminen, Eisen, Zink und Selen (PetMD). Sie sind aber auch fettreich, und das zählt bei einem Hund, der zu einer Bauchspeicheldrüsenentzündung (Pankreatitis) neigt (PetMD).',
    ],
    serve: [
      'Kochen, rühren oder pochieren Sie sie ohne Salz, Butter oder Öl (PetMD).',
      'Hart gekochte Eier so lange kochen, bis Eiweiß und Eigelb fest sind, abkühlen lassen und in mundgerechte Stücke schneiden (PetMD).',
    ],
    never: [
      'Rohe Eier: Die ASPCA warnt vor Salmonellen und E. coli, und PetMD und AKC nennen außerdem Avidin, das Biotin bindet, ein B-Vitamin.',
      'Eier, die mit Butter, Salz, Zwiebeln oder Käsesoße zubereitet sind.',
    ],
    signs: [
      'Eine Eierallergie kann sich durch juckende Haut, Ohrentzündungen, Erbrechen oder Durchfall zeigen (PetMD); AKC nennt außerdem Quaddeln und Schwellungen und rät, Eier nach und nach einzuführen.',
    ],
    disagree: [
      'Bei der Eierschale: AKC warnt, an ihren scharfen Kanten könne ein Hund sich verschlucken; PetMD erlaubt Schalen, gebacken oder gekocht und zu feinem Pulver gemahlen, als Kalziumergänzung nach Anleitung der Tierärztin oder des Tierarztes.',
    ],
    usdaName: 'hart gekochte Eier',
    piece: {
      a: 'ein großes Ei',
      one: 'großes Ei',
      many: 'große Eier',
      basis: 'USDA: 1 großes Ei = 50 g',
    },
    sizeGuide: {
      note: 'Die Mengen von PetMD, ein- bis zweimal pro Woche, die Gewichtsklassen in Kilogramm umgerechnet.',
      rows: [
        ['Sehr klein (1 bis 5 kg)', '¼ Ei'],
        ['Klein (5 bis 9 kg)', '½ Ei'],
        ['Mittel (10 bis 23 kg)', '1 Ei'],
        ['Groß (23 bis 41 kg)', '1½ Eier'],
        ['Sehr groß (ab 41 kg)', '2 Eier'],
      ],
    },
    questions: [
      {
        question: 'Dürfen Hunde rohe Eier fressen?',
        answer:
          'Die Quellen sagen nein: Rohe Eier können Salmonellen und E. coli übertragen (ASPCA), und rohes Eiweiß enthält Avidin, das Biotin blockiert (AKC, PetMD). Garen Sie sie vollständig durch.',
      },
      {
        question: 'Dürfen Hunde Eierschalen fressen?',
        answer:
          'Darüber sind sich die Quellen nicht einig. AKC warnt vor den scharfen Kanten; PetMD erlaubt die Schale nur gebacken oder gekocht und fein gemahlen, als Kalziumergänzung nach Anleitung der Tierarztpraxis.',
      },
    ],
    sources: [],
  },
  {
    id: 'yogurt',
    name: 'Joghurt',
    answer: 'Naturjoghurt ist erlaubt, wenn er kein Xylit enthält',
    short: 'Ja, natur',
    summary:
      'Ungesüßter Naturjoghurt ist in kleinen Mengen in Ordnung; prüfen Sie vorher, dass er kein Xylit enthält.',
    why: [
      'PetMD (verfasst von Dr. Brittany Kleszynski, Tierärztin) schreibt, ungesüßter griechischer Naturjoghurt sei für Hunde meist die beste Wahl, mit mehr Eiweiß und weniger Zucker und Laktose als gewöhnlicher Joghurt. AKC schreibt, die meisten Hunde dürften Joghurt fressen, ratsam sei er wegen der Laktose aber nicht immer.',
      'Die ASPCA: Milchprodukte können Durchfall und andere Verdauungsbeschwerden auslösen, weil Haustieren genug Laktase fehlt. AKC ergänzt, sein Fett könne eine Pankreatitis begünstigen, und es gebe bessere Quellen für Probiotika.',
    ],
    serve: [
      'Ungesüßter Naturjoghurt mit lebenden Kulturen; griechischer Joghurt enthält weniger Laktose (AKC, PetMD).',
      'Beginnen Sie mit einem Löffel und beobachten Sie, wie Ihr Hund ihn verträgt (AKC).',
    ],
    never: [
      'Gesüßter oder aromatisierter Joghurt und jeder Joghurt mit Xylit (Birkenzucker): Laut PetMD kann Xylit schwere Leberschäden, gefährlich niedrigen Blutzucker und den Tod verursachen.',
    ],
    signs: ['Blähungen, Durchfall oder Erbrechen durch die Laktose (AKC).'],
    usdaName: 'Naturjoghurt aus Magermilch',
    piece: {
      a: 'ein Esslöffel Joghurt',
      one: 'Esslöffel',
      many: 'Esslöffel',
      basis: 'ein Sechzehntel der Tasse (cup) der USDA von 245 g',
    },
    sizeGuide: {
      note: 'Die Mengen von PetMD, höchstens einmal am Tag, die Gewichtsklassen in Kilogramm umgerechnet.',
      rows: [
        ['Sehr klein (1 bis 5 kg)', '½ Teelöffel'],
        ['Klein (5 bis 9 kg)', '1 Teelöffel'],
        ['Mittel (10 bis 23 kg)', '1 Esslöffel'],
        ['Groß (23 bis 41 kg)', '2 Esslöffel'],
        ['Sehr groß (ab 41 kg)', '3 Esslöffel'],
      ],
    },
    questions: [
      {
        question: 'Dürfen Hunde griechischen Joghurt fressen?',
        answer:
          'Ungesüßter griechischer Naturjoghurt ist die Sorte, die PetMD bevorzugt: mehr Eiweiß, weniger Zucker und weniger Laktose als gewöhnlicher Joghurt.',
      },
      {
        question: 'Dürfen Hunde Jogurt essen?',
        answer:
          'Ja, Jogurt ist nur eine andere Schreibweise von Joghurt: natur und ungesüßt, in kleinen Mengen, und nie mit Xylit gesüßt (PetMD, AKC).',
      },
    ],
    sources: [],
  },
  {
    id: 'shrimp',
    name: 'Garnelen',
    answer: 'gekochte, geschälte Garnelen sind unbedenklich',
    short: 'Ja, geschält',
    summary:
      'Durchgegarte, geschälte Garnelen ohne Zutaten sind in kleinen Mengen unbedenklich; rohe Garnelen und Schalen sind es nicht.',
    why: [
      'PetMD schreibt, Hunde könnten richtig zubereitete Garnelen gefahrlos fressen, und AKC erlaubt sie in Maßen als gelegentliches Leckerli.',
      'Garnelen liefern Vitamin B12, Niacin, Phosphor und Antioxidantien und sind fettarm (AKC, PetMD). Sie enthalten viel Cholesterin, deshalb bleiben sie bei AKC eine Ausnahme.',
    ],
    serve: [
      'Garen Sie sie vollständig: kochen, dämpfen, grillen oder backen (PetMD); AKC hält Dämpfen für am besten.',
      'Entfernen Sie Schale, Schwanz und Darm und schneiden Sie die Garnele in kleine Stücke (PetMD).',
      'Ohne Butter, Öl, Gewürze, Knoblauch oder Zwiebeln, und nichts Paniertes oder Frittiertes (PetMD, AKC).',
    ],
    never: [
      'Rohe Garnelen, die laut AKC gefährliche Krankheitserreger tragen.',
      'Schalen und Schwänze, an denen ein Hund ersticken kann, besonders ein kleiner (AKC).',
    ],
    signs: [
      'Erbrechen oder Durchfall bei einer Unverträglichkeit (PetMD), Übelkeit und Bauchschmerzen nach rohen Garnelen (PetMD).',
    ],
    usdaName: 'gekochte Garnelen',
    piece: {
      a: 'eine Portion',
      one: 'Portion von 100 g',
      many: 'Portionen von 100 g',
      grams: 100,
      basis: 'die Bezugsmenge der Nährwerttabellen',
    },
    sizeGuide: {
      note: 'Die Portionstabelle von PetMD, die Gewichtsklassen in Kilogramm umgerechnet. AKC nennt für die meisten Hunde ein oder zwei Stück und für einen kleinen Hund einen Teil von einem.',
      rows: [
        ['Sehr klein (1 bis 9 kg)', '½ mittelgroße Garnele'],
        ['Klein (10 bis 14 kg)', '1 mittelgroße Garnele'],
        ['Mittel (14 bis 23 kg)', '2 mittelgroße Garnelen'],
        ['Groß (23 bis 41 kg)', '3 mittelgroße Garnelen'],
        ['Sehr groß (ab 41 kg)', 'Bis zu 4 mittelgroße Garnelen'],
      ],
    },
    questions: [
      {
        question: 'Dürfen Hunde Garnelenschwänze fressen?',
        answer:
          'Nein. PetMD rät, Schale, Schwanz und Darm zu entfernen; AKC schreibt, an Schalen könne ein Hund ersticken.',
      },
      {
        question: 'Dürfen Hunde Shrimps essen?',
        answer:
          'Ja, Shrimps sind Garnelen unter anderem Namen: vollständig gegart, geschält, ohne Schwanz und Darm und ohne Zutaten sind sie in kleinen Mengen unbedenklich (PetMD, AKC).',
      },
    ],
    sources: [],
  },
  {
    id: 'salmon',
    name: 'Lachs',
    answer: 'gekochter Lachs ohne Gräten ist unbedenklich',
    short: 'Ja, ohne Gräten',
    summary:
      'Gekochter Lachs ohne Gräten ist für Hunde unbedenklich; roher Lachs kann die Lachsvergiftung übertragen, die unbehandelt oft tödlich endet.',
    why: [
      'PetMD schreibt, gekochter Lachs sei für Hunde unbedenklich, und AKC (fachlich geprüft von Dr. Ashly Smith) schreibt, Hunde dürften ihn in Maßen gefahrlos fressen. Er liefert Omega-3-Fettsäuren, Eiweiß und Vitamin B12 (PetMD).',
      'Gefährlich ist roher oder nicht durchgegarter Fisch. Merck erklärt, dass Hunde sich die Lachsvergiftung (Salmon Poisoning Disease) über rohe oder nicht durchgegarte Forellen, Lachse oder Pazifische Riesensalamander holen, die einen Saugwurm tragen; dieser ist mit dem Bakterium Neorickettsia helminthoeca infiziert. Die Krankheit kommt in den Küstengebieten im pazifischen Nordwesten Nordamerikas vor, von Nordkalifornien bis Alaska (Merck).',
    ],
    serve: [
      'Frisch, gekocht und ohne Gräten (PetMD). AKC: im Inneren auf 60 °C garen.',
      'Pur, ohne Gewürze, Öl oder Soße (AKC). Lachs aus der Dose spülen Sie ab, um Salz und Öl zu entfernen (PetMD), oder Sie wählen eine natriumarme Sorte (AKC).',
    ],
    never: [
      'Roher oder nicht durchgegarter Lachs oder Forelle (Merck, PetMD, AKC) und Räucherlachs (AKC).',
      'Die Gräten: Laut AKC können die kleinen, spröden Gräten den Darm durchbohren.',
    ],
    signs: [
      'Merck: Die Anzeichen der Lachsvergiftung beginnen etwa 5 bis 7 Tage, nachdem ein Hund infizierten Fisch gefressen hat, manchmal aber erst nach bis zu 33 Tagen. Hohes Fieber, Schwäche, Appetitlosigkeit, Erbrechen, blutiger Durchfall, Austrocknung und geschwollene Lymphknoten.',
      'Ohne Behandlung sterben bis zu 90 % der betroffenen Hunde innerhalb von 7 bis 10 Tagen (Merck). Behandelt wird früh mit Antibiotika über die Vene und unterstützender Therapie; sagen Sie Ihrer Tierärztin oder Ihrem Tierarzt deshalb, wenn Ihr Hund in den Wochen davor rohen Fisch gefressen hat.',
    ],
    disagree: [
      'Bei der Lachshaut: PetMD nennt gekochte Haut unbedenklich und schreibt, sie enthalte sogar mehr Omega-3 als das Fleisch; AKC rät von geräuchertem oder rohem Fisch ab, sagt zu gekochter Haut aber nichts Eigenes.',
    ],
    usdaName: 'gegarter Atlantischer Zuchtlachs',
    piece: {
      a: 'eine Portion',
      one: 'Portion von 100 g',
      many: 'Portionen von 100 g',
      grams: 100,
      basis: 'die Bezugsmenge der Nährwerttabellen',
    },
    sizeGuide: {
      note: 'Die Mengen von PetMD pro Woche, gekocht, von Unzen in Gramm und die Gewichtsklassen von Pfund in Kilogramm umgerechnet.',
      rows: [
        ['Sehr klein (1 bis 9 kg)', 'Etwa 30 bis 55 g'],
        ['Klein (10 bis 14 kg)', 'Etwa 55 bis 85 g'],
        ['Mittel (14 bis 23 kg)', 'Etwa 85 bis 115 g'],
        ['Groß (23 bis 41 kg)', 'Etwa 115 bis 170 g'],
        ['Sehr groß (ab 41 kg)', 'Etwa 170 bis 225 g'],
      ],
    },
    questions: [
      {
        question: 'Mein Hund hat rohen Lachs gefressen. Was soll ich tun?',
        answer:
          'Rufen Sie Ihre Tierarztpraxis an, vor allem im pazifischen Nordwesten Nordamerikas, wo laut Merck der infizierte Saugwurm lebt. Die Anzeichen beginnen meist 5 bis 7 Tage später, und frühe Antibiotika wirken; unbehandelt sterben bis zu 90 % der betroffenen Hunde.',
      },
      {
        question: 'Dürfen Hunde Räucherlachs fressen?',
        answer:
          'Nein: AKC rät von Räucherlachs ab, ebenso wie von rohem Fisch. Geben Sie Lachs nur gekocht, pur und ohne Gräten.',
      },
    ],
    sources: [],
  },
  {
    id: 'pork',
    name: 'Schweinefleisch',
    answer: 'Schweinefleisch nur mager, pur und durchgegart',
    short: 'Ja, durchgegart',
    summary:
      'Mageres Schweinefleisch, durchgegart, pur und ohne Knochen, ist in kleinen Mengen in Ordnung; Speck, Schinken und rohes Fleisch nicht.',
    why: [
      'PetMD schreibt, Hunde dürften Schweinefleisch in Maßen fressen, wenn es durchgegart, pur, mager und ohne Knochen ist; AKC nennt pures gekochtes Schweinefleisch in Maßen unbedenklich, viele Produkte daraus aber gefährlich.',
      'Der Haken ist das Fett. Fette Stücke können laut PetMD eine Pankreatitis auslösen, und AKC schreibt, Schweinefett sei schwer verdaulich. Rohes Schweinefleisch kann den Parasiten Trichinella spiralis (Trichinen) und Salmonellen übertragen (PetMD, AKC).',
    ],
    serve: [
      'Garen Sie es vollständig durch: Hackfleisch auf 71 °C, Koteletts, Steaks und Braten auf 63 °C im Inneren (PetMD).',
      'Magere Stücke wie Filet, das Fett abgeschnitten, in mundgerechten Stücken und ungewürzt (PetMD). AKC: kein Zwiebel- oder Knoblauchpulver, keine Muskatnuss und keine Barbecuesoße.',
    ],
    never: [
      'Rohes Schweinefleisch (PetMD, AKC).',
      'Knochen: Gekochte Knochen werden spröde und splittern (AKC), und laut ASPCA können Knochen den Darm verlegen und eine Operation nötig machen.',
      'Speck, Schinken und Wurst (AKC, PetMD).',
    ],
    signs: [
      'Trichinose nach rohem Schweinefleisch: Magenverstimmung, Erbrechen, Durchfall, Fieber, Mattigkeit und Muskelschmerzen (AKC).',
    ],
    usdaName: 'magerer Schweinerücken, gebraten,',
    piece: {
      a: 'eine Portion',
      one: 'Portion von 100 g',
      many: 'Portionen von 100 g',
      grams: 100,
      basis: 'die Bezugsmenge der Nährwerttabellen',
    },
    sizeGuide: {
      note: 'Die Mengen von PetMD, in Stücken von etwa 1,3 cm Länge und 1,3 cm Dicke, die Gewichtsklassen in Kilogramm umgerechnet.',
      rows: [
        ['Sehr klein (1 bis 5 kg)', '1 Stück'],
        ['Klein (5 bis 9 kg)', '1 bis 2 Stücke'],
        ['Mittel (10 bis 23 kg)', '2 bis 3 Stücke'],
        ['Groß (23 bis 41 kg)', '3 bis 4 Stücke'],
        ['Sehr groß (ab 41 kg)', '4 bis 5 Stücke'],
      ],
    },
    questions: [
      {
        question: 'Dürfen Hunde Schweineknochen fressen?',
        answer:
          'Nein. AKC schreibt, gekochte Knochen würden brüchig und spröde und könnten splittern, und laut ASPCA kann ein verschluckter Knochen den Darm verletzen oder verlegen, manchmal bis zur Operation.',
      },
      {
        question: 'Dürfen Hunde rohes Schweinefleisch fressen?',
        answer:
          'Nein. Rohes Schweinefleisch kann Trichinen (Trichinella spiralis) und Salmonellen übertragen (PetMD, AKC). Garen Sie es vollständig durch.',
      },
    ],
    sources: [],
  },
  {
    id: 'ham',
    name: 'Schinken',
    answer: 'Schinken ist zu salzig und zu fett',
    short: 'Besser nicht',
    summary:
      'Schinken ist nicht giftig, aber salzig und fett; PetMD und AKC raten deshalb beide davon ab, ihn als Leckerli zu geben.',
    why: [
      'PetMD schreibt, Schinken sei für Hunde nicht giftig, aber kein geeignetes Leckerli; AKC hält ihn für nicht ratsam und gesündere Leckerlis für besser.',
      'Die Gründe sind Salz und Fett. Laut AKC kann zu viel Salz für Hunde giftig sein, und die Nitrate und Nitrite von gepökeltem Schinken bringen zusätzliches Natrium. Der Schinken in Scheiben der USDA hat 814 mg Natrium pro 100 g. Sein Fett erhöht außerdem das Risiko einer Pankreatitis (AKC, PetMD).',
    ],
    serve: [
      'Ein kleines Stück, das auf den Boden gefallen ist: Laut PetMD sollte Ihr Hund dann völlig in Ordnung sein.',
      'Rufen Sie Ihre Tierarztpraxis an, wenn er viel gefressen hat oder eines der Anzeichen unten zeigt (PetMD).',
    ],
    never: [
      'Schinkenknochen: Gekochte Schinkenknochen splittern laut PetMD leicht und können einen Hund ersticken lassen oder seinen Darm verlegen.',
      'Glasierter Schinken oder Honigschinken, wegen des Zuckers (PetMD).',
    ],
    signs: [
      'Mattigkeit, Appetitlosigkeit, Sabbern, Bauchschmerzen, Erbrechen und Durchfall (PetMD). Zu viel Salz: Durst, viel Urin, Erbrechen und Durchfall, in schweren Fällen Nierenschäden, Krampfanfälle und Koma (AKC).',
    ],
    usdaName: 'Schinken in Scheiben (etwa 11 % Fett)',
    piece: {
      a: 'eine Scheibe Schinken',
      one: 'Scheibe',
      many: 'Scheiben',
      basis: 'USDA: 1 Scheibe = 28 g',
    },
    questions: [
      {
        question: 'Darf mein Hund vom Weihnachtsschinken etwas abbekommen?',
        answer:
          'Nicht als Leckerli: Glasierter Schinken bringt zu Salz und Fett noch Zucker mit (PetMD), und der Knochen splittert. Ein kleiner Rest ist kein Notfall; bei einem Knochen oder viel Schinken rufen Sie Ihre Tierarztpraxis an.',
      },
    ],
    sources: [],
  },
  {
    id: 'bacon',
    name: 'Speck',
    answer: 'Speck ist zu fett und zu salzig',
    short: 'Besser nicht',
    summary:
      'Speck (Bacon) ist fett und sehr salzig, ein Risiko für Pankreatitis und Salzvergiftung; tierärztliche Quellen raten davon ab.',
    why: [
      'Der tierärztlich geprüfte Ratgeber von Chewy sagt, Hunde sollten keinen Speck fressen, und AKC zählt Speck und Schinken zu den Produkten aus Schweinefleisch, die Hunde nicht bekommen sollten.',
      'Die Gründe sind Fett und Salz. Merck zählt das Fressen großer Mengen Tischreste oder anderer ungeeigneter Nahrung zu den häufigen Risikofaktoren einer Pankreatitis, und FirstVet nennt die Pankreatitis einen möglicherweise tödlichen Notfall. Der gebackene Frühstücksspeck der USDA enthält 2.193 mg Natrium pro 100 g. Chewy ergänzt, dass die Nitrite, mit denen er haltbar gemacht wird, Hunden schaden können.',
    ],
    serve: [
      'Ein einzelner stibitzter Streifen ist meist kein Notfall, aber achten Sie auf die Anzeichen unten.',
      'Chewy rät, sofort die Tierarztpraxis anzurufen, wenn Ihr Hund erbricht, Durchfall hat, matt ist oder nicht mehr frisst; laut FirstVet brauchen Bauchschmerzen eine Notfallbehandlung.',
    ],
    never: [
      'Speck, Speckfett und Fettreste.',
      'Roher Speck, der die Risiken von rohem Schweinefleisch mitbringt (PetMD, ASPCA).',
    ],
    signs: [
      'Durchfall, Erbrechen und Unwohlsein bald danach (Chewy). Pankreatitis: Appetitlosigkeit, Erbrechen, Schwäche, Bauchschmerzen, Austrocknung und Durchfall (Merck). Zu viel Salz: Zittern, hohes Fieber und Krampfanfälle (Chewy).',
    ],
    disagree: [
      'FirstVet schreibt, die meisten Hunde vertrügen kontrollierte Mengen von Speck-Leckerlis; Chewy und AKC sagen: gar keinen Speck. PetMD und AKC haben keine eigene Seite nur zu Speck.',
    ],
    usdaName: 'gebackener Frühstücksspeck',
    piece: {
      a: 'eine Scheibe Speck',
      one: 'Scheibe',
      many: 'Scheiben',
      basis: 'USDA: 1 gebratene Scheibe = 8,1 g',
    },
    questions: [
      {
        question: 'Mein Hund hat Speckfett gefressen. Was jetzt?',
        answer:
          'Bratfett vom Speck ist fast reines Fett, also genau der Teil, der das Risiko einer Pankreatitis erhöht. Rufen Sie Ihre Tierarztpraxis an, erst recht bei einem kleinen Hund oder einer großen Menge, und achten Sie auf Erbrechen, Bauchschmerzen und einen Hund, der nicht mehr frisst (Merck, FirstVet).',
      },
    ],
    sources: [],
  },
];
