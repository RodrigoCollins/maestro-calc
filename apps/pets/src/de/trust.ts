import { checkedText, POLICY_CHECKED, PRIMARY_SOURCES, type TextPage } from '../editorial.ts';
import { hrefOf } from '../routes.ts';
import { SOURCES_DE } from './foods/sources.ts';

/** The day the German policy pages were written and checked against the English ones. */
const POLICY_DE_CHECKED = '2026-11-10';

const reviewed = `Zuletzt geprüft am ${checkedText(POLICY_DE_CHECKED, 'de')} (die englische Fassung am ${checkedText(POLICY_CHECKED, 'de')}).`;

export const ABOUT_DE: TextPage = {
  title: 'Über Bowl Figures: Rechner und Ratgeber für Hunde | Bowl Figures',
  description:
    'Bowl Figures beantwortet Fragen von Hundehaltern mit Zahlen aus tierärztlichen Quellen: was Hunde essen dürfen, Hundejahre und was tun bei Schokolade.',
  h1: 'Über Bowl Figures',
  lead: 'Bowl Figures beantwortet die Fragen, die Hundehalter in eine Suchmaschine tippen: Darf mein Hund das essen? Wie alt ist er in Menschenjahren? Was tun, wenn er Schokolade gefressen hat?',
  sections: [
    {
      id: 'was',
      heading: 'Was es ist',
      paragraphs: [
        'Eine kostenlose Website mit Rechnern und Ratgebern für Hunde- und Katzenhalter, ohne Anmeldung und mit höchstens einem kleinen Skript pro Rechner. Die deutschen Seiten rechnen in Kilogramm und Gramm; die englischen Seiten, die es schon länger gibt, rechnen in amerikanischen Einheiten.',
        'Auf Deutsch gibt es bisher den Hundejahre-Rechner, den Ratgeber für den Fall, dass Ihr Hund Schokolade gefressen hat, und die Seiten zur Frage, welche Lebensmittel Hunde essen dürfen. Die übrigen Rechner, etwa für die Futtermenge, sind auf Englisch.',
      ],
    },
    {
      id: 'wie',
      heading: 'Wie es funktioniert',
      paragraphs: [
        'Jede Zahl nennt ihre Quelle. Die Formeln und Grenzwerte stammen aus tierärztlichen Werken wie dem Merck Veterinary Manual und den Leitlinien der AAHA; wo eine deutschsprachige tierärztliche Einrichtung wie CliniTox an der Universität Zürich dasselbe Thema behandelt, steht sie daneben, und wo die Quellen sich widersprechen, zeigt die Seite beide Werte.',
        'Nichts hier ersetzt Ihre Tierärztin oder Ihren Tierarzt.',
      ],
      link: { href: hrefOf('methodology'), label: 'Die Methodik mit allen Formeln (auf Englisch)' },
    },
    {
      id: 'wer',
      heading: 'Wer dahintersteht',
      paragraphs: [
        'Die Redaktion Bowl Figures, nach öffentlichen Grundsätzen für Quellen und Korrekturen. Sie arbeitet mit Hilfe von KI-Werkzeugen beim Schreiben und Rechnen; jede Zahl wird gegen ihre Quelle geprüft und jede Formel mit von Hand gerechneten Fällen getestet.',
      ],
      link: { href: hrefOf('editorial', 'de'), label: 'Redaktionelle Grundsätze' },
    },
  ],
  reviewed,
};

export const EDITORIAL_DE: TextPage = {
  title: 'Redaktionelle Grundsätze: Woher die Zahlen kommen | Bowl Figures',
  description:
    'Wer Bowl Figures schreibt, aus welchen Quellen eine Zahl stammen darf, wie Seiten geprüft und datiert werden und wie Sie einen Fehler melden.',
  h1: 'Redaktionelle Grundsätze',
  lead: 'Zahlen zu Futter und Giften betreffen ein lebendes Tier. Darum stammt jede Zahl hier aus einer genannten tierärztlichen Quelle, und die Seite sagt, aus welcher.',
  sections: [
    {
      id: 'autoren',
      heading: 'Wer schreibt',
      paragraphs: [
        'Jede Seite schreibt und veröffentlicht die Redaktion Bowl Figures, eine Organisation und keine Einzelperson. Die Redaktion arbeitet mit veröffentlichten Quellen und gibt keine tierärztliche Beratung.',
      ],
    },
    {
      id: 'quellen',
      heading: 'Woher die Zahlen kommen',
      paragraphs: [
        'Eine Formel, ein Faktor, ein Grenzwert oder ein Datenwert wird nur verwendet, wenn er in einer tierärztlichen oder behördlichen Primärquelle steht, die die Redaktion gelesen hat: dem Merck Veterinary Manual, den Leitlinien der AAHA oder der AAFCO. Für die deutschen Seiten kommen deutschsprachige Einrichtungen hinzu, etwa CliniTox an der Vetsuisse-Fakultät Zürich, die Kleintierklinik der Universität Bern, die Veterinärmedizinische Universität Wien und das Bundesinstitut für Risikobewertung.',
        'Lässt sich eine Zahl nicht belegen, fehlt sie, und die Seite sagt warum. Die Redaktion erfindet keine Zahl und füllt keine Lücke mit einer Faustregel aus einem Blog.',
      ],
      sources: [...PRIMARY_SOURCES, SOURCES_DE.clinitoxMethylxanthine, SOURCES_DE.bfrPets],
      link: {
        href: hrefOf('methodology'),
        label: 'Die Methodik und ihre Rechenbeispiele (auf Englisch)',
      },
    },
    {
      id: 'sprache',
      heading: 'Deutsche Seiten',
      paragraphs: [
        'Die deutschen Seiten sind keine Wort-für-Wort-Übersetzungen. Sie beantworten dieselbe Frage mit denselben Fakten wie die englische Seite, rechnen aber in Kilogramm und Gramm und nennen die Ansprechpartner im deutschsprachigen Raum. Wo eine deutschsprachige Quelle von einer englischen abweicht, nennt die Seite beide.',
      ],
    },
    {
      id: 'gesundheit',
      heading: 'Keine tierärztliche Beratung',
      paragraphs: [
        'Jedes Ergebnis ist ein Anhaltspunkt, den Sie mit Ihrer Tierarztpraxis besprechen. Wo die Quellen auseinandergehen, zeigt die Seite die Spanne. Jede Seite zu Schokolade und zu giftigen Lebensmitteln fordert Sie auf, die Tierarztpraxis anzurufen, so niedrig die Zahl auch ist.',
      ],
    },
    {
      id: 'pruefung',
      heading: 'Prüfdaten',
      paragraphs: [
        'Ein Ratgeber zeigt den Tag, an dem seine Zahlen zuletzt gegen die Quellen geprüft wurden. Ändert sich eine Quelle, liest die Redaktion sie neu, korrigiert die Seite und datiert sie neu.',
      ],
    },
    {
      id: 'korrekturen',
      heading: 'Korrekturen',
      paragraphs: [
        'Finden Sie eine Zahl, die einer Quelle widerspricht, nennen Sie uns die Seite und die Quelle. Ein bestätigter Fehler wird auf der Seite korrigiert, und ihr Prüfdatum ändert sich.',
      ],
    },
  ],
  reviewed,
};

export const PRIVACY_DE: TextPage = {
  title: 'Datenschutz: Was Bowl Figures erhebt | Bowl Figures',
  description:
    'Was Bowl Figures mit Daten macht: Server-Protokolle bei Cloudflare, Google Analytics ohne Ihre Eingaben, und Rechner, die in Ihrem Browser laufen.',
  h1: 'Datenschutz',
  lead: 'Kurz gesagt: keine Konten, keine Werbung, und die Zahlen, die Sie eingeben, bleiben in Ihrem Browser und in dem Link, den Sie teilen.',
  sections: [
    {
      id: 'eingaben',
      heading: 'Was Sie eingeben',
      paragraphs: [
        'Nichts, was Sie eingeben, etwa das Alter oder das Gewicht Ihres Hundes, wird an uns oder an Google Analytics gesendet. Es wird in Ihrem Browser berechnet. Die Werte stehen nur in der Adresse der Seite, damit Sie das Ergebnis speichern oder teilen können. Wer diese Adresse öffnet oder teilt, sendet sie wie jeden Seitenaufruf, sodass sie in den Protokollen von Cloudflare erscheinen kann; außerdem bleibt sie im Verlauf Ihres Browsers.',
      ],
    },
    {
      id: 'hosting',
      heading: 'Hosting',
      paragraphs: [
        'Bowl Figures liegt bei Cloudflare. Beim Laden einer Seite verarbeitet Cloudflare übliche Server-Protokolle, die Ihre IP-Adresse, die aufgerufene Seite und Ihren Browsertyp enthalten können.',
      ],
    },
    {
      id: 'analyse',
      heading: 'Analyse und Cookies',
      paragraphs: [
        'Bowl Figures zählt Besuche mit Google Analytics und pro Nutzung eines Rechners ein Ereignis (welcher Rechner, und ob Sie gerechnet oder geteilt haben). Das Skript startet erst, wenn die Seite geladen ist. Die Website hat keine Werbung und keine Konten.',
        'Google Analytics erhält die besuchte Seite ohne Ihre Eingaben, Browser- und Gerätetyp, Bildschirmgröße und einen ungefähren Standort, den Google aus Ihrer IP-Adresse ableitet.',
        'Im Europäischen Wirtschaftsraum, im Vereinigten Königreich und in der Schweiz setzt Google Analytics kein Cookie: Es erhält nur das Signal, dass eine Seite aufgerufen wurde. Dasselbe gilt überall, wenn Ihr Browser ein Global-Privacy-Control-Signal sendet. Werbespeicher und personalisierte Werbung sind überall ausgeschaltet.',
      ],
    },
    {
      id: 'teilen',
      heading: 'Teilen',
      paragraphs: [
        'Der WhatsApp-Link ist reiner Text mit einer Adresse, die die Auswahl von WhatsApp selbst öffnet. Wir laden kein Skript von WhatsApp.',
      ],
    },
    {
      id: 'rechte',
      heading: 'Ihre Rechte',
      paragraphs: [
        'Nach der Datenschutz-Grundverordnung haben Sie das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung Ihrer Daten, auf Widerspruch und auf Beschwerde bei einer Datenschutz-Aufsichtsbehörde. Da Bowl Figures selbst keine Daten über Sie speichert, betrifft das vor allem die Protokolle bei Cloudflare und die Daten bei Google Analytics.',
      ],
    },
    {
      id: 'aenderungen',
      heading: 'Änderungen',
      paragraphs: ['Wir aktualisieren diese Seite, bevor wir Werbung einbinden.'],
    },
  ],
  reviewed,
};
