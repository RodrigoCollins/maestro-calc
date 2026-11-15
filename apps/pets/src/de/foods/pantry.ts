import { SOURCES_DE } from './sources.ts';
import type { FoodDe } from './types.ts';

/** The pantry foods of the German pages, in the order of the route table. */
export const PANTRY_DE: readonly FoodDe[] = [
  {
    id: 'peanut-butter',
    name: 'Erdnussbutter',
    answer: 'Erdnussbutter ist erlaubt, wenn sie kein Xylit enthält',
    short: 'Ja, ohne Xylit',
    summary:
      'Reine Erdnussbutter ist in kleinen Mengen in Ordnung, wenn auf dem Etikett kein Xylit (Birkenzucker) steht, das für Hunde giftig ist.',
    why: [
      'PetMD und AKC schreiben beide, Hunde dürften Erdnussbutter in Maßen fressen. AKC schreibt ihr Eiweiß, gesunde Fette, die Vitamine B und E und Niacin zu; PetMD warnt, sie enthalte viel Fett und viele Kalorien.',
      'Die eigentliche Gefahr ist ein Süßungsmittel. Die FDA warnt, dass manche Erdnuss- und Nussbutter Xylit enthält, auch als Birkenzucker oder Holzzucker verkauft, das die Bauchspeicheldrüse eines Hundes Insulin ausschütten und seinen Blutzucker innerhalb von 10 bis 60 Minuten fallen lassen kann. Die ASPCA nennt außerdem mögliche Leberschäden, und die Vetmeduni Wien nennt den Zuckerersatz Xylit für Hunde giftig und Birkenzucker sehr gefährlich.',
    ],
    serve: [
      'Lesen Sie zuerst das Etikett und stellen Sie sicher, dass kein Xylit enthalten ist (FDA). Am besten ist ungesalzene Erdnussbutter ohne Zuckerzusatz (AKC).',
      'Ein wenig zum Ablecken, in einem Spielzeug oder auf einem Löffel, als gelegentliches Leckerli innerhalb der 10-%-Regel (PetMD, AKC).',
    ],
    never: [
      'Jede Erdnussbutter, Nussbutter oder Creme mit Xylit oder Birkenzucker (FDA, PetMD).',
      'Erdnussbutter-Pralinen, Kekse und andere Süßigkeiten mit Schokolade oder ohne Zucker.',
    ],
    signs: [
      'Wenn das Glas Xylit enthielt: Erbrechen, dann Schwäche, Taumeln, Zusammenbruch und Krampfanfälle, während der Blutzucker fällt (FDA). Laut FDA können die Anzeichen nach 10 bis 60 Minuten beginnen, aber auch erst nach 12 bis 24 Stunden; rufen Sie sofort Ihre Tierarztpraxis oder den tierärztlichen Notdienst an.',
    ],
    usdaName: 'ungesalzene cremige Erdnussbutter',
    piece: {
      a: 'ein Esslöffel Erdnussbutter',
      one: 'Esslöffel',
      many: 'Esslöffel',
      basis: 'die Hälfte der 2 Esslöffel der USDA = 32 g',
    },
    sizeGuide: {
      note: 'Die Mengen von PetMD, die Gewichtsklassen in Kilogramm umgerechnet. AKC nennt keine Tabelle und rät, alle Leckerlis zusammen innerhalb von 10 % des Tages zu halten.',
      rows: [
        ['Sehr klein (1 bis 5 kg)', '½ Teelöffel, einmal am Tag'],
        ['Klein (5 bis 9 kg)', '½ Teelöffel, zweimal am Tag'],
        ['Mittel (10 bis 23 kg)', '1 Teelöffel, einmal am Tag'],
        ['Groß (23 bis 41 kg)', '1 Teelöffel, zweimal am Tag'],
        ['Sehr groß (ab 41 kg)', '1 Esslöffel, einmal am Tag'],
      ],
    },
    questions: [
      {
        question: 'Woran erkenne ich, ob meine Erdnussbutter Xylit enthält?',
        answer:
          'Lesen Sie die Zutatenliste. Laut FDA kann Xylit auch als Birkenzucker oder Holzzucker angegeben sein; steht einer der drei Namen darauf, ist sie nichts für Ihren Hund.',
      },
      {
        question: 'Ist Birkenzucker dasselbe wie Xylit?',
        answer:
          'Ja. Die FDA nennt Birkenzucker und Holzzucker als andere Namen für Xylit, und die Vetmeduni Wien nennt Birkenzucker für Hunde sehr gefährlich.',
      },
    ],
    sources: [SOURCES_DE.vetmeduniHolidays],
  },
  {
    id: 'honey',
    name: 'Honig',
    answer: 'ein wenig Honig ist erlaubt, aber nicht für Welpen',
    short: 'Ja, sehr wenig',
    summary:
      'Ein wenig Honig ist für die meisten erwachsenen Hunde unbedenklich, aber er ist fast reiner Zucker, und roher Honig ist nichts für Welpen.',
    why: [
      'AKC: Honig ist für Hunde in kleinen Mengen unbedenklich. PetMD schreibt, Hunde dürften ihn in Maßen als gelegentliches Leckerli bekommen.',
      'Er besteht größtenteils aus Zucker, und zu viel Zucker kann laut PetMD den Magen eines Hundes verstimmen und zu Übergewicht und Diabetes beitragen; AKC nennt außerdem Karies. Nach den Werten der USDA hat ein Esslöffel etwa 64 kcal, ein großer Teil des Leckerli-Budgets eines kleinen Hundes.',
      'Roher Honig kann Sporen von Clostridium botulinum enthalten (PetMD); deshalb halten die Quellen ihn von Welpen und Hunden mit geschwächtem Immunsystem fern.',
    ],
    serve: [
      'Eine kleine Menge, höchstens ein- bis zweimal pro Woche (PetMD); weniger ist mehr, besonders bei kleinen Rassen (AKC).',
      'AKC rät, Ihrem Hund danach die Zähne zu putzen.',
    ],
    never: [
      'Roher Honig für Welpen unter einem Jahr oder für Hunde mit geschwächtem Immunsystem, etwa während einer Chemotherapie (PetMD, AKC).',
      'Honig für einen Hund mit Diabetes (AKC, PetMD).',
    ],
    disagree: [
      'PetMD zählt übergewichtige Hunde zu denen, die keinen rohen Honig bekommen sollten; AKC nennt Welpen, Hunde mit geschwächtem Immunsystem und Hunde mit Diabetes, aber keine übergewichtigen. AKC erwähnt mögliche Vorteile bei Halsschmerzen und Allergien und schreibt, für die Allergie-Versprechen fehlten schlüssige Belege.',
    ],
    usdaName: 'Honig',
    piece: {
      a: 'ein Teelöffel Honig',
      one: 'Teelöffel',
      many: 'Teelöffel',
      basis: 'ein Drittel des Esslöffels der USDA von 21 g',
    },
    sizeGuide: {
      note: 'Die Mengen von PetMD, höchstens ein- bis zweimal pro Woche, die Gewichtsklassen in Kilogramm umgerechnet.',
      rows: [
        ['Sehr klein (1 bis 5 kg)', '⅛ Teelöffel'],
        ['Klein (5 bis 9 kg)', '¼ Teelöffel'],
        ['Mittel (10 bis 23 kg)', '½ bis 1 Teelöffel'],
        ['Groß (23 bis 41 kg)', '2 Teelöffel'],
        ['Sehr groß (ab 41 kg)', '1 Esslöffel'],
      ],
    },
    questions: [
      {
        question: 'Hilft Honig bei Allergien meines Hundes?',
        answer:
          'AKC schreibt, für die Behauptung, Honig aus der Region lindere Allergien, fehlten schlüssige Belege. Fragen Sie Ihre Tierarztpraxis nach einer Behandlung der Allergie.',
      },
      {
        question: 'Dürfen Welpen Honig essen?',
        answer:
          'Rohen Honig nicht: Er kann Sporen von Clostridium botulinum enthalten (PetMD), und PetMD und AKC halten ihn von Welpen unter einem Jahr fern.',
      },
    ],
    sources: [],
  },
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
  {
    id: 'rice',
    name: 'Reis',
    answer: 'pur gekochter Reis ist unbedenklich',
    short: 'Ja, pur gekocht',
    summary:
      'Weißer oder brauner Reis, nur in Wasser gekocht, ist für Hunde unbedenklich und eine verbreitete Schonkost bei Magenverstimmung.',
    why: [
      'AKC schreibt, Hunde könnten Reis gefahrlos fressen, wenn er nur in Wasser gekocht ist, und PetMD nennt pur gekochten weißen oder braunen Reis in Maßen unbedenklich.',
      'Er ist mild und leicht verdaulich. AKC zitiert Dr. Steve Weinberg: Reis hilft, bei Durchfall den Kot zu festigen. Für einen verstimmten Magen ist weißer Reis der richtige, weil er weniger Ballaststoffe hat (AKC).',
    ],
    serve: [
      'Kochen Sie ihn in Wasser, ohne Salz, Butter oder Gewürze (AKC), und lassen Sie ihn abkühlen.',
      'Bei einer Magenverstimmung mischt PetMD ihn zwei zu eins mit gekochtem Hähnchen oder Truthahn ohne Knochen und Haut.',
    ],
    never: ['Gebratener Reis und Reis mit Knoblauch oder Zwiebeln (PetMD).'],
    usdaName: 'gekochter weißer Reis',
    piece: {
      a: 'ein Esslöffel gekochter Reis',
      one: 'Esslöffel',
      many: 'Esslöffel',
      basis: 'ein Sechzehntel der Tasse (cup) der USDA von 158 g',
    },
    sizeGuide: {
      note: 'Die Mengen von PetMD als Leckerli, zwei- bis dreimal pro Woche, gekocht, die Gewichtsklassen in Kilogramm umgerechnet.',
      rows: [
        ['Sehr klein (1 bis 5 kg)', '1 bis 2 Esslöffel'],
        ['Klein (5 bis 9 kg)', '2 bis 3 Esslöffel'],
        ['Mittel (10 bis 23 kg)', '¼ Tasse (cup)'],
        ['Groß (23 bis 41 kg)', '½ Tasse (cup)'],
        ['Sehr groß (ab 41 kg)', '⅔ Tasse (cup)'],
      ],
    },
    questions: [
      {
        question: 'Ist Reis gut für einen Hund mit Diabetes?',
        answer:
          'AKC schreibt, Hunde mit Diabetes sollten gewöhnlichen weißen Reis wegen seines höheren glykämischen Index meiden, und PetMD rät, zuerst die Tierarztpraxis zu fragen.',
      },
      {
        question: 'Hilft Reis bei Durchfall?',
        answer:
          'AKC zitiert Dr. Steve Weinberg: Reis hilft, bei Durchfall den Kot zu festigen, und weißer Reis eignet sich dafür besser als brauner, weil er weniger Ballaststoffe hat. Hält der Durchfall an, gehört der Hund zur Tierarztpraxis.',
      },
    ],
    sources: [],
  },
  {
    id: 'popcorn',
    name: 'Popcorn',
    answer: 'nur pures, mit Heißluft gepopptes Popcorn',
    short: 'Ja, nur pur',
    summary:
      'Ein paar Stücke pures, mit Heißluft gepopptes Popcorn sind in Ordnung; Butter, Salz und ungepoppte Körner sind das Problem.',
    why: [
      'AKC: Pures, mit Heißluft gepopptes Popcorn ist für Hunde in kleinen Mengen meist unbedenklich. PetMD sagt: ganz pur, mit Heißluft gepoppt, ohne Öl, Butter, Salz oder Zucker.',
      'Kino- und Mikrowellenpopcorn ist ein anderes Lebensmittel: Butter kann laut PetMD den Magen verstimmen und zu einer Pankreatitis führen, und Salz zu einer Salzvergiftung.',
    ],
    serve: [
      'Mit Heißluft gepoppt und pur, als gelegentliches Leckerli (AKC).',
      'Nur ganz aufgepoppte Stücke (AKC, PetMD).',
    ],
    never: [
      'Ungepoppte und halb gepoppte Körner: Sie setzen sich zwischen den Zähnen fest und können einen Hund ersticken lassen oder seinen Darm verlegen (AKC, PetMD).',
      'Popcorn mit Butter, Salz, Karamell oder Aroma (AKC, PetMD).',
    ],
    signs: [
      'Ein paar heruntergefallene Stücke schaden wahrscheinlich nicht, aber bei Erbrechen, Durchfall oder Mattigkeit rät AKC, die Tierarztpraxis anzurufen.',
    ],
    usdaName: 'mit Heißluft gepopptes Popcorn',
    piece: {
      a: 'eine Tasse Popcorn',
      one: 'Tasse Popcorn',
      many: 'Tassen Popcorn',
      basis: 'USDA: 1 Tasse (cup) = 8 g',
    },
    sizeGuide: {
      note: 'Die Portionstabelle von PetMD in Stücken, die Gewichtsklassen in Kilogramm umgerechnet.',
      rows: [
        ['Sehr klein (1 bis 9 kg)', '1 bis 2 Stücke'],
        ['Klein (10 bis 14 kg)', '2 bis 3 Stücke'],
        ['Mittel (14 bis 23 kg)', '5 bis 6 Stücke'],
        ['Groß (23 bis 41 kg)', 'Eine kleine Handvoll'],
        ['Sehr groß (ab 41 kg)', 'Eine Handvoll'],
      ],
    },
    questions: [
      {
        question: 'Dürfen Hunde Mikrowellenpopcorn fressen?',
        answer:
          'Nicht so, wie es verkauft wird: Es wird mit Öl, Butteraroma und Salz hergestellt. AKC und PetMD erlauben nur pures, mit Heißluft gepopptes Popcorn.',
      },
      {
        question: 'Dürfen Hunde süßes Popcorn aus dem Kino essen?',
        answer:
          'Nein. AKC und PetMD schließen Popcorn mit Butter, Salz, Karamell oder Aroma aus, und Kinopopcorn ist laut PetMD ein anderes Lebensmittel als pures Popcorn.',
      },
    ],
    sources: [],
  },
  {
    id: 'bread',
    name: 'Brot',
    answer: 'pures Brot ist erlaubt, roher Hefeteig nie',
    short: 'Ja, aber kein Teig',
    summary:
      'Pures Weiß- oder Weizenbrot ist in kleinen Stücken unbedenklich, roher Hefeteig dagegen ein Notfall.',
    why: [
      'AKC schreibt, pures Weiß- und Weizenbrot sei für Hunde in Maßen meist unbedenklich, und nennt Brot im Grunde einen Füller. PetMD schreibt, es biete wenig Nährstoffe.',
      'Gefährlich ist roher Hefeteig. Die ASPCA schreibt, er könne aufgehen und den Magen aufblähen, und Merck erklärt, dass die Hefe außerdem Ethanol bildet, das ins Blut übergeht und Trunkenheit und eine Übersäuerung (Azidose) verursacht. PetMD nennt ihn einen medizinischen Notfall, mit dem Risiko einer Magenaufblähung und Magendrehung. Auch die Vetmeduni Wien warnt, dass sich hefehaltiger Brotteig in der warmen Umgebung des Magens rasch ausdehnen kann.',
    ],
    serve: [
      'Pures Brot, jeweils ein kleines Stück (AKC).',
      'Hat Ihr Hund rohen Teig gefressen, rufen Sie sofort Ihre Tierarztpraxis oder den tierärztlichen Notdienst an (PetMD).',
    ],
    never: [
      'Roher Brot- oder Pizzateig (ASPCA, Merck).',
      'Brot mit Rosinen, Schokolade, Xylit, Knoblauch, Zwiebeln, Muskatnuss oder Nüssen, etwa Knoblauchbrot, Bananenbrot oder Rosinenbrot (PetMD, AKC).',
    ],
    signs: [
      'Roher Teig: zuerst Würgen, ohne dass etwas herauskommt, ein aufgeblähter Bauch und Mattigkeit (Merck), dann ein schwankender Gang, Desorientierung, Schwäche, niedriger Blutzucker und in schweren Fällen Krampfanfälle oder Koma.',
    ],
    usdaName: 'Weißbrot aus dem Handel',
    piece: {
      a: 'eine Scheibe Weißbrot',
      one: 'Scheibe',
      many: 'Scheiben',
      basis: 'USDA: 1 Scheibe = 29 g',
    },
    questions: [
      {
        question: 'Mein Hund hat rohen Pizzateig gefressen. Was soll ich tun?',
        answer:
          'Rufen Sie jetzt Ihre Tierarztpraxis oder den tierärztlichen Notdienst an. Der Teig geht im warmen Magen weiter auf und bildet beim Gären Alkohol (ASPCA, Merck); PetMD behandelt ihn als Notfall.',
      },
      {
        question: 'Dürfen Hunde Rosinenbrot essen?',
        answer:
          'Nein. PetMD und AKC schließen Brot mit Rosinen aus, und Rosinen sind für Hunde giftig. Hat Ihr Hund davon gefressen, rufen Sie Ihre Tierarztpraxis an.',
      },
    ],
    sources: [SOURCES_DE.vetmeduniHolidays],
  },
  {
    id: 'almonds',
    name: 'Mandeln',
    answer: 'Mandeln sind zu fett und können stecken bleiben',
    short: 'Besser nicht',
    summary:
      'Mandeln sind nicht giftig wie Macadamianüsse, aber fett, oft gesalzen, und ein Hund kann sich an ihnen verschlucken.',
    why: [
      'AKC antwortet mit Nein. Mandeln sind wie die meisten Nüsse sehr fettreich, was eine Pankreatitis auslösen kann (AKC, PetMD), und abgepackte Mandeln sind oft stark gesalzen (PetMD). Die ASPCA schreibt, die Öle und Fette von Nüssen könnten Erbrechen und Durchfall verursachen; die Vetmeduni Wien nennt Nüsse unter den Lebensmitteln, die Erbrechen, Durchfall oder eine lebensbedrohliche Pankreatitis auslösen können.',
      'Das andere Problem sind Größe und Form: Laut AKC kann eine Mandel die Speiseröhre, den Darm oder die Luftröhre eines Hundes verlegen, besonders bei kleinen Rassen.',
    ],
    serve: [
      'Ein oder zwei Mandeln: Beobachten Sie Ihren Hund genau. Mehr als ein paar: Rufen Sie Ihre Tierarztpraxis oder den tierärztlichen Notdienst an (AKC).',
      'Bei einer kleinen Rasse oder einer größeren Menge rät PetMD, sofort anzurufen; innerhalb von etwa 30 Minuten kann die Tierärztin oder der Tierarzt entscheiden, den Hund erbrechen zu lassen.',
    ],
    never: [
      'Ganze Mandeln, mit oder ohne Schale, und gesalzene oder aromatisierte Mandeln (AKC, PetMD).',
      'Mandelmus mit Salz, Zucker oder Xylit (PetMD).',
    ],
    signs: [
      'Erbrechen, Durchfall, Blähungen, Appetitlosigkeit und Mattigkeit; Würgen, ein aufgeblähter Bauch oder Ersticken, wenn eine Mandel stecken geblieben ist (AKC, PetMD).',
    ],
    usdaName: 'Mandeln',
    piece: {
      a: 'eine Mandel',
      one: 'Mandel',
      many: 'Mandeln',
      basis: 'USDA: 1 Mandel = 1,2 g',
    },
    questions: [
      {
        question: 'Sind Mandeln für Hunde giftig?',
        answer:
          'Nicht so wie Macadamianüsse. Die Quellen raten wegen des Fetts, des Salzes und der Gefahr eines Darmverschlusses davon ab (AKC, PetMD).',
      },
    ],
    sources: [SOURCES_DE.vetmeduniHolidays],
  },
  {
    id: 'cashews',
    name: 'Cashewkerne',
    answer: 'mehr als ein, zwei pure Cashewkerne sollten es nicht sein',
    short: 'Ja, ein, zwei',
    summary:
      'Ein oder zwei pure, ungesalzene Cashewkerne sind nicht giftig, aber sie sind fett, und in Nussmischungen können Macadamianüsse stecken.',
    why: [
      'PetMD schreibt, Cashewkerne seien für Hunde nicht giftig, und AKC nennt sie meist unbedenklich. Beide bleiben bei ein paar Stück: Cashews sind fettreich, und das kann laut AKC zu einer Pankreatitis führen, einer möglicherweise lebensbedrohlichen Erkrankung.',
      'AKC sieht überhaupt keinen Grund, einem Hund Nüsse zu geben; PetMD merkt an, dass Cashews weicher sind als die meisten Nüsse und ein Hund sich deshalb weniger leicht an ihnen verschluckt.',
    ],
    serve: [
      'Nur pure, ungesalzene Cashewkerne, als seltenes Leckerli (AKC). Hacken oder mahlen Sie sie und streuen Sie sie über das Futter, damit er sich nicht verschluckt (PetMD).',
    ],
    never: [
      'Gesalzene Cashews: Laut AKC kann das Salz Erbrechen, Schwäche, Durchfall, Zittern und Krampfanfälle auslösen.',
      'Nussmischungen und gemischte Packungen, in denen Macadamianüsse stecken können (AKC, PetMD).',
    ],
    signs: [
      'Erbrechen oder Durchfall; selten eine Allergie mit Schwellungen, Juckreiz und Quaddeln (PetMD).',
    ],
    usdaName: 'in Öl geröstete Cashewkerne ohne Salz',
    piece: {
      a: 'ein Cashewkern',
      one: 'Cashewkern',
      many: 'Cashewkerne',
      basis: 'USDA: 1 Unze (18 Kerne) = 28,35 g',
    },
    sizeGuide: {
      note: 'Die Mengen von PetMD in ganzen Cashewkernen, die Gewichtsklassen in Kilogramm umgerechnet. AKC nennt keine Menge und rät von Nüssen ab.',
      rows: [
        ['Sehr klein (1 bis 9 kg)', '1 oder 2 Cashewkerne'],
        ['Klein (10 bis 14 kg)', '2 bis 3 Cashewkerne'],
        ['Mittel (14 bis 23 kg)', '5 bis 6 Cashewkerne'],
        ['Groß (23 bis 41 kg)', '10 bis 12 Cashewkerne'],
        ['Sehr groß (ab 41 kg)', '12 bis 18 Cashewkerne'],
      ],
    },
    questions: [
      {
        question: 'Dürfen Hunde Nussmischungen fressen?',
        answer:
          'Nein: Eine Mischung kann Macadamianüsse enthalten, die für Hunde giftig sind, und ist meist gesalzen (AKC, PetMD).',
      },
      {
        question: 'Sind Cashews für Hunde giftig?',
        answer:
          'Nein, PetMD nennt sie nicht giftig. Sie sind aber fettreich, und AKC warnt vor einer Pankreatitis; mehr als ein paar pure, ungesalzene Kerne sollten es nicht sein.',
      },
    ],
    sources: [],
  },
  {
    id: 'macadamia-nuts',
    name: 'Macadamianüsse',
    answer: 'Macadamianüsse sind für Hunde giftig',
    short: 'Nein, giftig',
    summary:
      'Macadamianüsse lösen bei Hunden innerhalb von 12 Stunden Schwäche, Zittern und Fieber aus; warum, ist unbekannt.',
    why: [
      'Die ASPCA: Macadamianüsse können bei Hunden Schwäche, Koordinationsstörungen, Niedergeschlagenheit, Erbrechen, Zittern und Überhitzung (Hyperthermie) auslösen. Merck beschreibt die Vergiftung beim Hund; wie die Nuss sie auslöst, ist nicht bekannt (Merck, VCA).',
      'Merck berichtet von Anzeichen bei Hunden, die 2,4 g pro kg Körpergewicht gefressen hatten, für einen kleinen Hund nur ein paar Nüsse. VCA schreibt, schon wenige Nüsse könnten einen Hund krank machen.',
    ],
    serve: [
      'Rufen Sie Ihre Tierarztpraxis oder den tierärztlichen Notdienst an. Hat Ihr Hund sie vor Kurzem gefressen, lösen Tierärztinnen und Tierärzte laut Merck ab 1 bis 2 g pro kg Erbrechen aus.',
      'Fahren Sie sofort zum tierärztlichen Notdienst, wenn Ihr Hund nicht stehen oder gehen kann oder stark zittert (ASPCA).',
    ],
    never: [
      'Macadamianüsse, Nussmischungen und Kekse, Brownies und Pralinen damit. Die Vetmeduni Wien rät, Nüsse außerhalb der Reichweite von Haustieren aufzubewahren.',
    ],
    signs: [
      'Merck: innerhalb von 12 Stunden Schwäche (meist in den Hinterbeinen), Niedergeschlagenheit, Erbrechen, ein schwankender Gang, Zittern oder Fieber. Die Anzeichen gehen meist innerhalb von 12 bis 48 Stunden zurück; VCA erwartet mit Behandlung eine vollständige Erholung innerhalb von 24 bis 48 Stunden.',
      'CliniTox, die Giftdatenbank der Vetsuisse-Fakultät Zürich, beschreibt dasselbe Bild: Schwäche vor allem der Hinterhand und Fieber bis 40,5 °C, meist weniger als 12 Stunden nach dem Fressen, und eine vollständige Erholung von selbst innerhalb von 24 bis 48 Stunden.',
      'Mit Schokolade überzogene Macadamianüsse bringen zur Nuss noch eine Schokoladenvergiftung mit.',
    ],
    disagree: [
      'Bei der Sorge: Merck nennt die Anzeichen meist mild und von selbst abklingend, und die ASPCA schreibt, die meisten Fälle ließen sich unter tierärztlicher Anleitung zu Hause behandeln. VCA und AKC raten, sofort in der Tierarztpraxis anzurufen. Die tierärztliche Anleitung bekommen Sie so oder so nur durch den Anruf.',
      'Bei der Menge: Merck berichtet Anzeichen ab 2,4 g pro kg, CliniTox nennt für Hunde Mengen von 0,7 bis 62,4 g pro kg Körpergewicht, also teils deutlich weniger. Diese Seite rechnet mit dem Wert von Merck.',
    ],
    usdaName: 'rohe Macadamianüsse',
    piece: {
      a: 'eine Macadamianuss',
      one: 'Macadamianuss',
      many: 'Macadamianüsse',
      basis: 'USDA: 1 Unze (10 bis 12 Kerne) = 28,35 g, gerechnet mit 11 Kernen',
    },
    thresholds: [
      {
        label: 'Merck: Anzeichen bei 2,4 g/kg',
        lead: 'die Menge von 2,4 g/kg, bei der Merck Anzeichen beschreibt,',
      },
    ],
    thresholdNote:
      'Die Gramm Macadamianüsse, die die 2,4 g/kg erreichen, bei denen Merck Anzeichen bei Hunden beschreibt, für vier Gewichte ausgerechnet, und dieselbe Menge in Nüssen von etwa 2,6 g (die Unze der USDA mit 10 bis 12 Kernen). Es ist ein beschriebener Fall, keine sichere Grenze.',
    questions: [
      {
        question: 'Wie viele Macadamianüsse können einem Hund schaden?',
        answer:
          'Merck berichtet Anzeichen ab 2,4 g pro kg Körpergewicht. Für einen kleinen Hund ist das eine Handvoll Nüsse, für einen großen mehr, wie die Tabelle zeigt; VCA schreibt, schon wenige Nüsse könnten einen Hund krank machen.',
      },
      {
        question: 'Wie lange dauert eine Macadamia-Vergiftung?',
        answer:
          'Die Anzeichen kommen meist innerhalb von 12 Stunden und gehen nach Merck meist innerhalb von 12 bis 48 Stunden zurück; VCA und CliniTox nennen eine vollständige Erholung innerhalb von 24 bis 48 Stunden. Rufen Sie trotzdem gleich an.',
      },
    ],
    sources: [SOURCES_DE.clinitoxMacadamia, SOURCES_DE.vetmeduniHolidays],
  },
  {
    id: 'xylitol-gum',
    name: 'Kaugummi mit Xylit',
    answer: 'Xylit im Kaugummi ist für Hunde giftig',
    short: 'Nein, giftig',
    summary:
      'Xylit (Birkenzucker) in zuckerfreiem Kaugummi, Bonbons und mancher Nussbutter senkt den Blutzucker von Hunden schnell und kann die Leber zerstören.',
    why: [
      'Die FDA warnt, dass Xylit bei Hunden eine starke Insulinausschüttung aus der Bauchspeicheldrüse und einen schnellen, tiefen Abfall des Blutzuckers auslösen kann. Merck, VCA und die ASPCA beschreiben dieselbe Vergiftung, und höhere Dosen verursachen ein Leberversagen. Im deutschen Alltag heißt Xylit meist Birkenzucker; die Vetmeduni Wien nennt ihn für Hunde sehr gefährlich.',
      'Merck nennt die Dosen: Unterzuckerung ab etwa 100 mg pro kg Körpergewicht, Leberversagen ab 500 mg pro kg. CliniTox, die Giftdatenbank der Vetsuisse-Fakultät Zürich, nennt dieselben beiden Grenzen. Ein Kaugummi oder ein Pfefferminzbonbon enthält 0,22 bis 1,0 g Xylit, schreibt die Veterinärtoxikologin Dr. Ahna Brutlag in dvm360.',
    ],
    serve: [
      'Rufen Sie sofort Ihre Tierarztpraxis oder den tierärztlichen Notdienst an, oder fahren Sie direkt hin (FDA). Nehmen Sie die Packung mit: Marke und Anzahl der Kaugummis sind das, was die Tierärztin oder der Tierarzt braucht.',
      'Bringen Sie Ihren Hund nicht selbst zum Erbrechen, außer die Tierarztpraxis sagt es Ihnen (VCA).',
    ],
    never: [
      'Zuckerfreie Kaugummis, Pfefferminzbonbons und Süßigkeiten, und alles, was mit Xylit, Birkenzucker oder Holzzucker gesüßt ist.',
      'Die FDA nennt außerdem manche Erdnuss- und Nussbutter, Backwaren, Zahnpasta und Mundwasser, Kautabletten mit Vitaminen, Hustensaft und Nahrungsergänzungsmittel.',
    ],
    signs: [
      'Unterzuckerung innerhalb von 10 bis 60 Minuten (FDA) oder etwa 30 Minuten (Merck), manchmal aber erst nach 12 bis 18 Stunden (Merck), und Kaugummi kann sie verzögern (Ratgeber von Merck für Tierhalter): Erbrechen, Schwäche, Taumeln, Zusammenbruch und Krampfanfälle.',
      'Ein Leberversagen zeigt sich unter Umständen erst nach 24 bis 48 Stunden oder später (Merck). Von Hunden mit schwerem Leberschaden starben laut Merck trotz intensiver Behandlung 62,5 % oder wurden eingeschläfert.',
    ],
    disagree: [
      'Bei der Zeit: 10 bis 15 Minuten nach dvm360, 10 bis 60 Minuten nach der FDA und nach CliniTox (meist zuerst Erbrechen), etwa 30 Minuten nach Merck und 30 Minuten bis zwei Stunden nach VCA. Die FDA und VCA raten beide, sofort anzurufen und nicht auf Anzeichen zu warten.',
      'Beim Leberversagen nennt CliniTox eine Latenz von 8 bis 12 Stunden, in Einzelfällen bis 72 Stunden; Merck schreibt 24 bis 48 Stunden oder mehr.',
      'Bei der Dosis: CliniTox empfiehlt eine Entgiftung und Kontrolle des Blutzuckers schon ab 50 mg Xylit pro kg, der Hälfte der Linie, die Merck für die Unterzuckerung zieht. Die Tabelle rechnet mit den Linien von Merck.',
    ],
    usdaName: 'zuckerfreier Kaugummi',
    piece: {
      a: 'ein Kaugummi',
      one: 'Kaugummi',
      many: 'Kaugummis',
      basis: 'USDA: 1 Stück = 2 g',
    },
    compound: 'Xylit',
    thresholds: [
      {
        label: 'Merck: Unterzuckerung über 0,1 g/kg',
        lead: 'die Menge von 0,1 g Xylit pro kg, ab der laut Merck der Blutzucker fällt,',
      },
      {
        label: 'Merck: Leberversagen über 0,5 g/kg',
        lead: 'die Menge von 0,5 g pro kg, die Merck mit Leberversagen verbindet,',
      },
    ],
    thresholdNote:
      'Das Xylit, das jede Linie von Merck erreicht, für vier Gewichte, und wie viele Kaugummis es enthalten: von einem starken Kaugummi mit 1 g pro Stück bis zu einem schwachen mit 0,22 g (dvm360). Lesen Sie die Packung: Die genaue Zahl hängt von der Marke ab, und der Anruf kommt zuerst.',
    questions: [
      {
        question: 'Mein Hund hat einen zuckerfreien Kaugummi gefressen. Ist das schon gefährlich?',
        answer:
          'Das kann es sein. Ein starker Kaugummi mit 1 g Xylit pro Stück überschreitet bei jedem Hund unter etwa 10 kg die Linie von Merck für die Unterzuckerung, wie die Tabelle zeigt. Rufen Sie sofort an und halten Sie die Packung bereit.',
      },
      {
        question: 'Dürfen Hunde Birkenzucker essen?',
        answer:
          'Nein. Birkenzucker ist ein anderer Name für Xylit (FDA), und VCA nennt außerdem Holzzucker und Birkenrindenextrakt: derselbe Süßstoff und dieselbe Gefahr. Die Vetmeduni Wien nennt Birkenzucker für Hunde sehr gefährlich.',
      },
      {
        question: 'Ist Zahnpasta für Menschen gefährlich für Hunde?',
        answer:
          'Sie kann es sein: Die FDA nennt Zahnpasta und Mundwasser unter den Produkten, die Xylit enthalten können. Lesen Sie die Zutatenliste und rufen Sie Ihre Tierarztpraxis an, wenn Ihr Hund Zahnpasta mit Xylit gefressen hat.',
      },
    ],
    sources: [SOURCES_DE.clinitoxXylitol, SOURCES_DE.vetmeduniHolidays],
  },
];
