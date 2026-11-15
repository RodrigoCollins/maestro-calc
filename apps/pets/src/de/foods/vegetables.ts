import { SOURCES_DE } from './sources.ts';
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
    id: 'avocado',
    name: 'Avocado',
    answer: 'Kern und Fett sind das Risiko',
    short: 'Besser nicht',
    summary:
      'Hunde vertragen das Persin der Avocado besser als Vögel oder Pferde, aber Kern, Fett und Guacamole machen sie zu einem schlechten Leckerli.',
    why: [
      'Für andere Tiere ist Avocado weit gefährlicher. Die Pflanzenliste der ASPCA stuft sie als giftig für Pferde ein, und ihre Lebensmittelseite nennt Avocado vor allem ein Problem für Vögel, Kaninchen, Esel, Pferde und Wiederkäuer. Merck schreibt, Hunde seien offenbar relativ unempfindlich, mit einem einzigen Bericht über zwei Hunde, deren Herz nach Avocado geschädigt war. CliniTox, die Giftdatenbank der Vetsuisse-Fakultät Zürich, schreibt, hohe Persin-Dosen könnten bei Säugetieren außer Hund und Katze sowie bei Vögeln den Herzmuskel schädigen.',
      'Die Risiken für einen Hund liegen woanders. Nach Merck kann ein verschluckter Kern den Darm verlegen. PetMD, von einem Tierarzt geschrieben, sagt, ihr Fett könne eine Bauchspeicheldrüsenentzündung (Pankreatitis) auslösen, und kommt zu dem Schluss, dass die Risiken den Nutzen überwiegen; CliniTox nennt dieselben beiden Gefahren, die Pankreatitis durch das Fett und einen Darmverschluss durch den Kern. Blätter, Schale und Kern enthalten das meiste Persin (AKC, mit Dr. Michael Hyder).',
    ],
    serve: [
      'Hat Ihr Hund etwas Fruchtfleisch gefressen, achten Sie auf Erbrechen, Durchfall oder Mattigkeit und rufen Sie die Tierarztpraxis an, wenn Sie sie sehen (AKC).',
      'Hat er den Kern gefressen oder scheint er zu ersticken, fahren Sie nach PetMD so schnell wie möglich zum tierärztlichen Notdienst.',
      'AKC und PetMD setzen beide eine Obergrenze für eine Kostprobe des puren Fruchtfleischs: höchstens einen Teelöffel pro 10 Pfund (4,5 kg) Körpergewicht, unten ausgerechnet. Bei einem Hund mit Neigung zu Pankreatitis oder mit Übergewicht verzichten Sie auch darauf (AKC).',
    ],
    never: [
      'Kern, Schale und Blätter (PetMD, AKC).',
      'Guacamole: Sie enthält Zwiebeln, Knoblauch und Salz (PetMD).',
    ],
    signs: [
      'Erbrechen, Durchfall und Bauchbeschwerden (PetMD), Mattigkeit (AKC) und die Anzeichen einer Pankreatitis durch das Fett.',
    ],
    disagree: [
      'Viele Listen nennen Avocado giftig für Hunde. Die Primärquellen dieser Seite tun es nicht: Der Eintrag der ASPCA nennt nur Pferde, Merck hält Hunde für relativ unempfindlich, und CliniTox nimmt Hund und Katze bei der Herzschädigung ausdrücklich aus. AKC und PetMD erlauben eine kleine Menge Fruchtfleisch, und PetMD rät trotzdem davon ab.',
    ],
    thresholds: [
      {
        label: 'AKC und PetMD: höchstens, in Teelöffeln purem Fruchtfleisch',
        lead: 'die Obergrenze, die AKC und PetMD mit einem Teelöffel pro 10 Pfund (4,5 kg) setzen,',
        unit: { one: 'Teelöffel', many: 'Teelöffel' },
      },
    ],
    thresholdNote:
      'Die Obergrenze, die AKC und PetMD für eine Kostprobe puren Avocado-Fruchtfleischs nennen, ein Teelöffel pro 10 Pfund (4,5 kg) Körpergewicht, für vier Gewichte ausgerechnet. Sie ist ein Höchstwert, keine Portion, die die Quellen empfehlen.',
    questions: [
      {
        question: 'Mein Hund hat Guacamole gefressen. Was soll ich tun?',
        answer:
          'Rufen Sie Ihre Tierarztpraxis an. Die Avocado ist die kleinere Sorge: Guacamole enthält meist Zwiebeln und Knoblauch, und beide sind für Hunde giftig (PetMD).',
      },
      {
        question: 'Ist Avocado für Hunde giftig?',
        answer:
          'Nach den Quellen dieser Seite nicht im engeren Sinn: Merck hält Hunde für relativ unempfindlich gegen Persin, und CliniTox nimmt Hund und Katze von der Herzschädigung aus. Gefährlich sind für einen Hund der Kern, der den Darm verlegen kann, und das Fett, das eine Pankreatitis auslösen kann.',
      },
    ],
    sources: [SOURCES_DE.clinitoxAvocado],
  },
  {
    id: 'onions',
    name: 'Zwiebeln',
    answer: 'Zwiebeln sind für Hunde giftig',
    short: 'Nein, in jeder Form',
    summary:
      'Zwiebeln schädigen in jeder Form die roten Blutkörperchen eines Hundes, und die Anzeichen zeigen sich oft erst Tage später.',
    why: [
      'Die ASPCA stuft die Zwiebel als giftig für Hunde, Katzen und Pferde ein; ihr Giftstoff ist N-Propyldisulfid. Merck schreibt, die schwefelhaltigen Oxidantien der Zwiebelgewächse zerstören rote Blutkörperchen (Hämolyse), was zu einer Blutarmut (Anämie) führen kann.',
      'Kochen hilft nicht. AKC: Ob roh oder gekocht, gebraten oder als Pulver, Zwiebeln und die übrigen Lauchgewächse schaden Hunden. PetMD nennt außerdem Frühlingszwiebeln, Schnittlauch und Lauch.',
      'PetMD nennt die Hunde mit dem größten Risiko: japanische Rassen wie Akita und Shiba Inu, die auch CliniTox, die Giftdatenbank der Vetsuisse-Fakultät Zürich, als besonders empfindlich führt, sowie Hunde mit Diabetes, Lebererkrankungen oder Anämie oder unter bestimmten Medikamenten.',
    ],
    serve: [
      'Rufen Sie sofort Ihre Tierarztpraxis oder den tierärztlichen Notdienst an, auch wenn Ihr Hund unauffällig wirkt: Der Schaden entsteht, bevor er sich zeigt.',
      'Sagen Sie, wie viel Zwiebel er gefressen hat und in welcher Form; Zwiebelpulver, Fertigsuppen und Soßen sind konzentriert.',
      'Warten Sie nicht auf Anzeichen und behandeln Sie ihn nicht selbst.',
    ],
    never: [
      'Zwiebeln roh, gekocht, gebraten oder als Pulver, dazu Frühlingszwiebeln, Schnittlauch und Lauch (AKC, PetMD).',
      'Reste, die damit zubereitet sind: Füllungen, Soßen, Suppen, Pizza, Burger und Babynahrung mit Zwiebelpulver.',
    ],
    signs: [
      'Merck: Anzeichen sind meist erst zu sehen, wenn schon viele rote Blutkörperchen zerstört sind, in der Regel einige Tage nach dem Fressen. PetMD schreibt, sie könnten sich innerhalb eines Tages oder später entwickeln, und CliniTox nennt je nach Menge einen bis mehrere Tage.',
      'Achten Sie auf Schwäche, blasses Zahnfleisch, roten oder braunen Urin, schnellen Herzschlag und schnelle Atmung, Mattigkeit, Appetitlosigkeit und Zusammenbruch (ASPCA, Merck, AKC); CliniTox nennt außerdem eine Gelbsucht. VCA schreibt, jede Menge könne den Magen verstimmen, größere Mengen schädigen die roten Blutkörperchen, und ein Nierenschaden kann folgen.',
    ],
    disagree: [
      'Die Quellen ziehen die Linie an verschiedenen Stellen. PetMD schreibt, eine Zwiebelvergiftung zeige sich regelmäßig bei Hunden, die mehr als 0,5 % ihres Körpergewichts an Zwiebeln fressen, und die 100 g pro 20 kg Hund von AKC sind dieselbe Zahl; CliniTox nennt ebenfalls mehr als 0,5 % des Körpergewichts auf einmal. Merck berichtet von Anzeichen nach 15 bis 30 g roher Zwiebel pro kg, drei- bis sechsmal so viel, und CliniTox gibt für Hunde dieselben 15 bis 30 g pro kg als toxische Dosis an. Die Tabelle zeigt beide Linien.',
    ],
    usdaName: 'rohe Zwiebeln',
    piece: {
      a: 'eine mittelgroße Zwiebel',
      one: 'mittelgroße Zwiebel',
      many: 'mittelgroße Zwiebeln',
      basis: 'USDA: 1 mittelgroße Zwiebel (6,4 cm Durchmesser) = 110 g',
    },
    thresholds: [
      {
        label: 'PetMD und AKC: 0,5 % des Körpergewichts',
        lead: 'die Grenze von 0,5 % des Körpergewichts, ab der PetMD regelmäßig Vergiftungen sieht,',
      },
      {
        label: 'Merck: Anzeichen ab 15 g/kg',
        lead: 'die niedrigste Dosis, bei der Merck Anzeichen beschreibt, 15 g/kg,',
      },
    ],
    thresholdNote:
      'Die Gramm Zwiebel, mit denen ein Hund die Linie der jeweiligen Quelle erreicht, für vier Gewichte, und dasselbe in mittelgroßen Zwiebeln der USDA von 110 g. Dort sehen die Quellen einen Schaden, darunter liegt keine sichere Menge: Der Schaden durch Zwiebeln summiert sich, und manche Hunde reagieren schon auf weniger.',
    questions: [
      {
        question:
          'Mein Hund hat Essen mit Zwiebeln gefressen. Ist ein bisschen Zwiebel in Ordnung?',
        answer:
          'Keine Menge wird empfohlen. Rufen Sie Ihre Tierarztpraxis oder den tierärztlichen Notdienst an und sagen Sie, welches Gericht es war und wie viel Ihr Hund gefressen hat; Zwiebelpulver und getrocknete Zwiebeln enthalten pro Löffel weit mehr als frische Zwiebeln.',
      },
      {
        question: 'Wie lange nach dem Fressen zeigen sich die Anzeichen?',
        answer:
          'Oft erst nach Tagen: Merck schreibt, die Anzeichen zeigten sich meist erst einige Tage nach dem Fressen, wenn genug rote Blutkörperchen zerstört sind. Deshalb rufen Sie an, bevor Anzeichen da sind.',
      },
    ],
    sources: [SOURCES_DE.clinitoxAllium],
  },
  {
    id: 'garlic',
    name: 'Knoblauch',
    answer: 'Knoblauch ist für Hunde giftig',
    short: 'Nein, giftig',
    summary:
      'Knoblauch ist für Hunde in jeder Form um ein Mehrfaches giftiger als Zwiebeln, und Knoblauchpulver ist am stärksten konzentriert.',
    why: [
      'Die ASPCA stuft Knoblauch als giftig für Hunde, Katzen und Pferde ein, wegen desselben N-Propyldisulfids wie bei der Zwiebel. Merck schreibt, Knoblauch sei 3- bis 5-mal giftiger als Zwiebeln; AKC und PetMD sagen fünfmal.',
      'PetMD: Knoblauch ist für Hunde in jeder Form giftig, frisch, getrocknet oder als Pulver. VCA schreibt, ein Teelöffel Knoblauchpulver entspreche acht frischen Zehen.',
      'AKC schreibt mit Dr. Michael Hyder, Hunde sollten Knoblauch auch nicht als Zutat fressen, etwa im Pizzateig, und rät von Floh- und Zeckenmitteln auf Knoblauchbasis ab. Akitas und Shiba Inus sind empfindlicher (AKC), und auch CliniTox, die Giftdatenbank der Vetsuisse-Fakultät Zürich, nennt diese Rassen besonders empfindlich.',
    ],
    serve: [
      'Rufen Sie Ihre Tierarztpraxis oder den tierärztlichen Notdienst an. AKC rät, auch bei kleinen Mengen anzurufen, weil eine frühe Behandlung den Unterschied macht.',
      'Sagen Sie, in welcher Form es war: eine Zehe, ein Knoblauchbrot oder Pulver, das am stärksten konzentriert ist.',
    ],
    never: [
      'Frischer Knoblauch, Knoblauchpulver, Knoblauchsalz, Knoblauchbrot und Gerichte, die mit Knoblauch gekocht sind.',
      'Knoblauchpräparate und Flohmittel mit Knoblauch (AKC).',
    ],
    signs: [
      'PetMD: Die Anzeichen zeigen sich meist innerhalb von 24 Stunden, können aber bis zu einer Woche dauern. AKC: Erbrechen und Durchfall innerhalb von Stunden; blasses Zahnfleisch, Schwäche, dunkler Urin und Anämie nach zwei bis fünf Tagen.',
      'Außerdem Mattigkeit, Speicheln, schnelle Atmung und ein wackeliger Gang (PetMD, AKC).',
    ],
    disagree: [
      'PetMD schreibt, schon 2 g Knoblauch pro Pfund Körpergewicht (etwa 4,4 g pro kg) könnten Magenverstimmung und Erbrechen auslösen, und ein Hund von 25 Pfund (11 kg) brauche ab 50 g eine Behandlung, nach seiner Rechnung von 5 g pro Zehe etwa 10 Zehen. Die USDA wiegt eine Zehe mit 3 g, dieselben 50 g sind also etwa 17 Zehen der USDA. Merck nennt keine Dosis für Knoblauch, nur dass er 3- bis 5-mal so giftig ist wie Zwiebeln.',
      'CliniTox gibt als toxische Dosis für Hunde 5 g ganzen Knoblauch pro kg Körpergewicht an, über 7 Tage gegeben (als Extrakt 1,25 ml pro kg): eine Menge, die über eine Woche verteilt ist, nicht eine einzige Mahlzeit.',
    ],
    usdaName: 'roher Knoblauch',
    piece: {
      a: 'eine Knoblauchzehe',
      one: 'Knoblauchzehe',
      many: 'Knoblauchzehen',
      basis: 'USDA: 1 Zehe = 3 g',
    },
    thresholds: [
      {
        label: 'PetMD: Magenverstimmung ab 2 g pro Pfund',
        lead: 'die Menge von 2 g pro Pfund, ab der laut PetMD Magenverstimmung und Erbrechen beginnen können,',
      },
    ],
    thresholdNote:
      'Die Angabe von PetMD, 2 g Knoblauch pro Pfund Körpergewicht (etwa 4,4 g pro kg), für vier Gewichte ausgerechnet, in Gramm und in Zehen der USDA von 3 g. Ab dort beginnt nach PetMD die Magenverstimmung; der Schaden an den roten Blutkörperchen kommt mit mehr. Rufen Sie bei jeder Menge Knoblauch an.',
    questions: [
      {
        question: 'Ist ein bisschen Knoblauch gut für Hunde?',
        answer:
          'Nein. Jede tierärztliche Quelle dieser Seite nennt Knoblauch in jeder Form giftig für Hunde, und der Tierarzt von AKC rät von Knoblauchprodukten gegen Flöhe ab.',
      },
      {
        question: 'Mein Hund hat ein Stück Knoblauchbrot gefressen. Was nun?',
        answer:
          'Rufen Sie Ihre Tierarztpraxis an. AKC rät auch bei kleinen Mengen zum Anruf, weil eine frühe Behandlung den Unterschied macht; sagen Sie, wie viel Brot es war und ob Knoblauchpulver darin war, das am stärksten konzentriert ist.',
      },
    ],
    sources: [SOURCES_DE.clinitoxAllium],
  },
  {
    id: 'carrots',
    name: 'Karotten',
    answer: 'Karotten sind ein unbedenkliches, kalorienarmes Leckerli',
    short: 'Ja, klein geschnitten',
    summary:
      'Rohe oder gekochte pure Karotten sind für Hunde unbedenklich; schneiden Sie sie klein, damit sich Ihr Hund nicht verschluckt.',
    why: [
      'AKC schreibt, Hunde dürften Karotten als gesunden, kalorienarmen Snack fressen, und PetMD nennt sie für die meisten Hunde unbedenklich.',
      'Sie liefern Beta-Carotin, aus dem der Körper Vitamin A macht, dazu Ballaststoffe und Kalium, und das Kauen tut den Zähnen gut (AKC, PetMD). Mit 35 kcal pro 100 g für Babykarotten (USDA) gehören sie zu den leichtesten Leckerlis dieser Seite.',
    ],
    serve: [
      'Waschen oder schälen Sie sie, um Erde und Pflanzenschutzmittel zu entfernen (AKC).',
      'Roh oder gekocht, immer pur (AKC, PetMD). Schneiden Sie ganze Karotten und auch Karottensticks in mundgerechte Stücke, damit Ihr Hund nicht erstickt (AKC); PetMD schlägt Scheiben von etwa 6 mm Dicke vor.',
    ],
    never: [
      'Ganze Karotten für einen Hund, der schlingt: Große Stücke können zum Ersticken führen oder den Darm verlegen (AKC, PetMD).',
      'Karotten mit Butter, Salz, Zwiebeln oder Knoblauch, und Karottenkuchen.',
    ],
    usdaName: 'rohe Babykarotten',
    piece: {
      a: 'eine Babykarotte',
      one: 'Babykarotte',
      many: 'Babykarotten',
      basis: 'USDA: 1 mittelgroße Babykarotte = 10 g',
    },
    disagree: [
      'AKC schlägt kalte oder gefrorene Karotten für zahnende Welpen vor; PetMD sieht in gefrorenen Karotten ein Risiko für die Zähne. PetMD weist außerdem auf ihren natürlichen Zucker bei Hunden mit Diabetes oder Übergewicht hin.',
    ],
    questions: [
      {
        question: 'Dürfen Hunde jeden Tag Karotten fressen?',
        answer:
          'Die Quellen behandeln Karotten als Leckerli, also gilt die 10-%-Regel. Das ganze Leckerli-Budget in der Tabelle oben sind schon viele Babykarotten, und deshalb sollten Karotten nicht das einzige Leckerli des Tages sein.',
      },
      {
        question: 'Dürfen zahnende Welpen gefrorene Karotten kauen?',
        answer:
          'Hier widersprechen sich die Quellen: AKC schlägt kalte oder gefrorene Karotten für zahnende Welpen vor, PetMD sieht in gefrorenen Karotten ein Risiko für die Zähne. Fragen Sie im Zweifel Ihre Tierarztpraxis.',
      },
    ],
    sources: [],
  },
  {
    id: 'broccoli',
    name: 'Brokkoli',
    answer: 'pur und in kleinen Stücken',
    short: 'Ja, aber wenig',
    summary:
      'Purer Brokkoli ist in kleinen Mengen unbedenklich, aber AKC nennt mehr als ein Viertel der Tagesration giftig.',
    why: [
      'AKC schreibt, geprüft von seinem leitenden Tierarzt Dr. Jerry Klein, Hunde dürften Brokkoli gekocht oder roh fressen, ohne Gewürze und Öl. Er ist reich an Ballaststoffen und Vitamin C und fettarm (AKC).',
      'Die Grenze kommt von den Isothiocyanaten in den Röschen, die den Magen reizen können (AKC, PetMD). AKC: Brokkoli gilt als unbedenklich, solange er weniger als 10 % der täglichen Nahrung ausmacht, und mehr als 25 % gelten als giftig. PetMD zitiert die Verhaltensmedizinerin Dr. Leslie Sinn, die die giftige Grenze bei mehr als 20 bis 25 % der täglichen Nahrung sieht.',
    ],
    serve: [
      'Dämpfen, kochen oder in der Mikrowelle garen, klein schneiden, abkühlen lassen und pur geben (PetMD); AKC erlaubt ihn auch roh.',
      'Schneiden Sie ihn in mundgerechte Stücke und fangen Sie mit wenig an (AKC).',
    ],
    never: [
      'Große Stücke vom Strunk: Nach AKC können sie die Speiseröhre verlegen, vor allem bei kleinen Hunden, und PetMD nennt rohe Stiele eine Gefahr zum Ersticken und für einen Darmverschluss.',
      'Brokkoli mit Butter, Öl, Käsesoße oder Knoblauch.',
    ],
    signs: [
      'Ein gereizter Magen: Erbrechen, Blähungen oder Durchfall. PetMD rät zum tierärztlichen Notdienst bei Ersticken, bei Erbrechen oder Durchfall, die länger als 24 Stunden anhalten, bei einem harten oder aufgeblähten Bauch und bei Mattigkeit.',
    ],
    usdaName: 'roher Brokkoli',
    piece: {
      a: 'ein Brokkoliröschen mit Stiel',
      one: 'Röschen mit Stiel',
      many: 'Röschen mit Stiel',
      basis: 'USDA: 1 Röschen mit Stiel (etwa 13 cm lang) = 31 g',
    },
    ceiling: 'AKC: giftig ab 25 % des Tages',
    sizeGuide: {
      note: 'Die Mengen von PetMD, ein- bis dreimal pro Woche, die Gewichtsklassen von Pfund in Kilogramm umgerechnet.',
      rows: [
        ['Sehr klein (1 bis 5 kg)', '½ bis 1 Teelöffel'],
        ['Klein (5 bis 9 kg)', '1 bis 2 Teelöffel'],
        ['Mittel (10 bis 23 kg)', '1 bis 2 Esslöffel'],
        ['Groß (23 bis 41 kg)', '2 bis 3 Esslöffel'],
        ['Sehr groß (ab 41 kg)', '3 bis 4 Esslöffel'],
      ],
    },
    disagree: [
      'AKC setzt die giftige Grenze bei mehr als 25 % der täglichen Nahrung, die Quelle von PetMD bei mehr als 20 bis 25 %. Keine sagt, ob der Anteil sich auf Kalorien oder auf Gewicht bezieht; die Tabelle liest ihn als Kalorien, mit demselben Erhaltungsbedarf wie beim Leckerli-Budget.',
    ],
    questions: [
      {
        question: 'Dürfen Hunde Brokkolistiele fressen?',
        answer:
          'Klein geschnitten und gekocht ja, ganz oder in großen Stücken nein. AKC warnt, dass die Stiele die Speiseröhre verlegen können, vor allem bei kleinen Hunden.',
      },
      {
        question: 'Wie viel Brokkoli ist zu viel?',
        answer:
          'Nach AKC gilt Brokkoli als unbedenklich, solange er unter 10 % der täglichen Nahrung bleibt, und ab mehr als 25 % als giftig. Die Spalte ganz rechts in der Tabelle oben rechnet diese 25 % in Gramm für vier Gewichte aus.',
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
  {
    id: 'zucchini',
    name: 'Zucchini',
    answer: 'pure Zucchini ist unbedenklich',
    short: 'Ja, pur',
    summary:
      'Pure Zucchini, roh oder gekocht, ist für Hunde unbedenklich; Zucchinikuchen und frittierte Zucchini sind es nicht.',
    why: [
      'AKC: Zucchini ist für Hunde völlig unbedenklich. PetMD: Pure Zucchini, roh oder gekocht, ist für Hunde in Maßen sicher und gesund.',
      'Sie ist fettarm und liefert Ballaststoffe, die Vitamine A, C und B6, Kalium und Lutein (PetMD). AKC rechnet mit etwa 20 Kalorien pro Tasse (cup), roh.',
    ],
    serve: [
      'Waschen Sie sie, entfernen Sie den Stiel und würfeln Sie sie (PetMD); klein geschnitten oder gedämpft, damit Ihr Hund nicht daran erstickt (AKC).',
      'Legen Sie eine pure Portion beiseite, bevor Sie das Gericht der Familie würzen (AKC).',
    ],
    never: [
      'Zucchinikuchen und anderes Gebäck, das Xylit enthalten kann (AKC), und frittierte Zucchini (PetMD).',
      'Zucchini mit Öl, Salz, Knoblauch oder Zwiebeln (AKC).',
    ],
    usdaName: 'rohe Zucchini mit Schale',
    piece: {
      a: 'eine Zucchinischeibe',
      one: 'Zucchinischeibe',
      many: 'Zucchinischeiben',
      basis: 'USDA: 1 Scheibe = 9,9 g',
    },
    sizeGuide: {
      note: 'Die Tagesmengen von PetMD, die Gewichtsklassen von Pfund in Kilogramm umgerechnet.',
      rows: [
        ['Sehr klein (1 bis 5 kg)', '1 Teelöffel'],
        ['Klein (5 bis 9 kg)', '2 Teelöffel'],
        ['Mittel (10 bis 23 kg)', '3 Teelöffel'],
        ['Groß (23 bis 41 kg)', '2 Esslöffel'],
        ['Sehr groß (ab 41 kg)', '3 Esslöffel'],
      ],
    },
    questions: [
      {
        question: 'Dürfen Hunde rohe Zucchini fressen?',
        answer:
          'Ja, in kleinen Stücken: AKC nennt pure Zucchini roh, gedämpft oder gekocht unbedenklich, und klein geschnitten verschluckt sich Ihr Hund nicht daran.',
      },
      {
        question: 'Dürfen Hunde Courgette essen?',
        answer:
          'Ja: Courgette ist der britische Name für Zucchini, und pure Courgette, roh oder gekocht, ist für Hunde in Maßen unbedenklich (AKC, PetMD).',
      },
    ],
    sources: [],
  },
  {
    id: 'potatoes',
    name: 'Kartoffeln',
    answer: 'gekocht und pur, nie grün',
    short: 'Ja, aber gekocht',
    summary:
      'Pure gekochte Kartoffeln sind in Maßen unbedenklich; rohe, grüne oder keimende Kartoffeln enthalten Solanin.',
    why: [
      'AKC und PetMD nennen pure gekochte Kartoffeln beide in Maßen unbedenklich. AKC zitiert Dr. Patricia Kennedy: Gekochte Kartoffeln sind in Ordnung, aber nicht mit viel Butter, die eine Bauchspeicheldrüsenentzündung (Pankreatitis) auslösen kann.',
      'Die Gefahr ist Solanin, ein Giftstoff der Nachtschattengewächse. AKC schreibt, grüne Kartoffeln seien deshalb giftig, und PetMD, die grünen Stellen und Keime enthielten Solanin, das Erbrechen, Durchfall, Schwäche und sogar Störungen des Nervensystems auslösen kann.',
    ],
    serve: [
      'Gekocht, gebacken oder zerdrückt, ohne Butter, Salz oder Gewürze (PetMD, AKC).',
      'Garen Sie sie durch, bis sie weich ist; gekochte Schale ist in Ordnung, solange sie nicht grün ist (AKC).',
    ],
    never: [
      'Rohe Kartoffeln, grüne Kartoffeln, grüne Schale und Keime (AKC, PetMD).',
      'Pommes frites, Chips und Kartoffelpüree mit Butter, Sahne, Knoblauch oder Zwiebeln.',
    ],
    signs: [
      'Durch Solanin: Erbrechen, Durchfall, Schwäche und Störungen des Nervensystems (PetMD). Rufen Sie die Tierarztpraxis an, wenn Ihr Hund rohe oder grüne Kartoffeln gefressen hat und eines davon zeigt.',
    ],
    usdaName: 'gebackene Kartoffeln mit Schale, ohne Salz,',
    piece: {
      a: 'eine mittelgroße Ofenkartoffel',
      one: 'mittelgroße Ofenkartoffel',
      many: 'mittelgroße Ofenkartoffeln',
      basis: 'USDA: 1 mittelgroße Kartoffel = 173 g',
    },
    questions: [
      {
        question: 'Dürfen Hunde Kartoffelpüree fressen?',
        answer:
          'Pures Kartoffelpüree ja, in kleinen Mengen (AKC). Püree mit Butter, Sahne, Knoblauch oder Zwiebeln ist kein Hundefutter: Das Fett kann eine Pankreatitis auslösen, und Knoblauch und Zwiebeln sind giftig.',
      },
      {
        question: 'Dürfen Hunde rohe Kartoffeln fressen?',
        answer:
          'Nein. AKC und PetMD geben Kartoffeln nur gekocht; grüne Stellen und Keime enthalten Solanin, das Erbrechen, Durchfall und Schwäche auslösen kann (PetMD).',
      },
    ],
    sources: [],
  },
  {
    id: 'sweet-potatoes',
    name: 'Süßkartoffeln',
    answer: 'gekochte Süßkartoffel ist unbedenklich',
    short: 'Ja, gekocht',
    summary:
      'Durchgegarte, pure Süßkartoffel ist für Hunde in Maßen unbedenklich, roh dagegen nie.',
    why: [
      'PetMD schreibt, Süßkartoffeln seien unbedenklich, wenn sie ganz durchgegart, pur und in Maßen gefüttert werden; AKC sagt ja, mit Vorsicht.',
      'Sie liefern Ballaststoffe, Beta-Carotin, die Vitamine A, B6 und C, Kalium und Calcium (AKC, PetMD). AKC zitiert Dr. Rachel Barrack: Zu viel kann durch überschüssiges Vitamin A zu Knochen- und Muskelschwäche führen.',
    ],
    serve: [
      'Waschen und schälen Sie sie, dann dämpfen, kochen, backen oder in der Mikrowelle garen, bis sie weich ist, und zerdrücken oder in kleine Stücke schneiden (PetMD).',
      'Geben Sie sie pur, ohne Butter, Zucker oder Marshmallows.',
    ],
    never: [
      'Rohe Süßkartoffel: schwer zu kauen und zu verdauen, und eine Gefahr zum Ersticken (PetMD, AKC).',
      'Die Schale, die nach PetMD nicht giftig ist, aber schwer verdaulich und den Darm verlegen kann.',
    ],
    usdaName: 'in der Schale gebackene Süßkartoffel ohne Salz',
    piece: {
      a: 'ein Esslöffel Süßkartoffel',
      one: 'Esslöffel',
      many: 'Esslöffel',
      basis: 'ein Sechzehntel der USDA-Tasse (cup) von 200 g',
    },
    sizeGuide: {
      note: 'Die Mengen von PetMD, zwei- bis dreimal pro Woche, die Gewichtsklassen von Pfund in Kilogramm umgerechnet.',
      rows: [
        ['Sehr klein (1 bis 5 kg)', '1 Esslöffel'],
        ['Klein (5 bis 9 kg)', '1 bis 2 Esslöffel'],
        ['Mittel (10 bis 23 kg)', '2 bis 3 Esslöffel'],
        ['Groß (23 bis 41 kg)', '3 Esslöffel'],
        ['Sehr groß (ab 41 kg)', '4 Esslöffel'],
      ],
    },
    disagree: [
      'Der Tierarzt von AKC schreibt, Süßkartoffeln hätten einen hohen glykämischen Index, und mahnt bei Hunden mit Diabetes zur Vorsicht; PetMD nennt ihren glykämischen Index relativ niedrig. Fragen Sie bei einem Hund mit Diabetes Ihre Tierarztpraxis.',
    ],
    questions: [
      {
        question: 'Sind Süßkartoffeln besser für Hunde als Kartoffeln?',
        answer:
          'Beide sind gekocht und pur unbedenklich. Der wichtige Unterschied liegt darin, was nie in den Napf gehört: Grüne oder rohe Kartoffeln enthalten Solanin (AKC, PetMD), und rohe Süßkartoffel ist eine Gefahr zum Ersticken.',
      },
      {
        question: 'Dürfen Hunde Süßkartoffel mit Schale fressen?',
        answer:
          'Besser geschält: PetMD nennt die Schale nicht giftig, aber schwer verdaulich, und sie kann den Darm verlegen.',
      },
    ],
    sources: [],
  },
  {
    id: 'pumpkin',
    name: 'Kürbis',
    answer: 'purer Kürbis ist unbedenklich',
    short: 'Ja, pur',
    summary:
      'Purer gekochter Kürbis oder Kürbispüree aus der Dose ohne Zusätze ist für Hunde unbedenklich; Kürbiskuchenfüllung nicht.',
    why: [
      'PetMD schreibt, Hunde dürften puren gekochten Kürbis und Kürbis aus der Dose (100 % Kürbis, ohne Zusätze) gefahrlos fressen, und AKC nennt puren Kürbis aus der Dose die gesündeste Wahl.',
      'Er ist reich an Ballaststoffen, und seine löslichen Ballaststoffe wirken nach AKC als Präbiotikum. AKC schlägt bei leichtem Durchfall 1 bis 4 Esslöffel Kürbis zur Mahlzeit vor, mit wenig angefangen.',
    ],
    serve: [
      'Kürbis aus der Dose ohne Salz, Gewürze oder Zucker (AKC) oder purer gekochter Kürbis (PetMD).',
      'Mischen Sie einen Löffel unter die Mahlzeit, statt eine ganze Schüssel davon zu geben.',
    ],
    never: [
      'Kürbiskuchenfüllung oder Fertigmischungen für Kürbiskuchen: Nach PetMD können sie Zucker, Muskatnuss und Nelken enthalten, die für Hunde gefährlich sein können, und manchmal Xylit.',
      'Roher Kürbis, die Schale und der Stiel, die schwer verdaulich sind (PetMD).',
    ],
    signs: [
      'Kürbis ist für leichten, harmlosen Durchfall gedacht (AKC). AKC rät, sofort die Tierarztpraxis anzurufen bei Mattigkeit, Fieber, Erbrechen oder Schwäche oder bei blutigem oder anhaltendem Durchfall, vor allem bei einem Welpen.',
    ],
    usdaName: 'Kürbis aus der Dose ohne Salz',
    piece: {
      a: 'ein Esslöffel Kürbispüree',
      one: 'Esslöffel',
      many: 'Esslöffel',
      basis: 'ein Sechzehntel der USDA-Tasse (cup) von 245 g',
    },
    questions: [
      {
        question: 'Ist Kürbiskuchenfüllung dasselbe wie Kürbis aus der Dose?',
        answer:
          'Nein. Auf der Dose sollte 100 % Kürbis stehen. Kuchenfüllung ist gesüßt und gewürzt, und nach PetMD kann sie Muskatnuss, Nelken und Xylit enthalten.',
      },
      {
        question: 'Hilft Kürbis bei Durchfall?',
        answer:
          'Bei leichtem Durchfall schlägt AKC 1 bis 4 Esslöffel Kürbis zur Mahlzeit vor, mit wenig angefangen. Bei Mattigkeit, Fieber, Erbrechen, Schwäche oder blutigem oder anhaltendem Durchfall rufen Sie sofort die Tierarztpraxis an (AKC).',
      },
    ],
    sources: [],
  },
];
