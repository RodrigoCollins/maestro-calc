import type { PageSource } from '../../guides.ts';

/** The day the German-language sources were read (the English ones: `FOODS_CHECKED`). */
export const SOURCES_DE_CHECKED = '2026-11-10';

const clinitox = (topic: string, url: string): PageSource => ({
  name: `CliniTox, Institut für Veterinärpharmakologie und -toxikologie, Vetsuisse-Fakultät der Universität Zürich: ${topic}`,
  url,
});

/** The German-language veterinary sources of the German pages, each read on `SOURCES_DE_CHECKED`. */
export const SOURCES_DE = {
  clinitoxMethylxanthine: clinitox(
    'Methylxanthine (Theobromin, Koffein)',
    'https://www.vetpharm.uzh.ch/CLINITOX/TOXDB/KLT_063.htm',
  ),
  clinitoxVitis: clinitox(
    'Vitis vinifera (Weintrauben, Rosinen)',
    'https://www.vetpharm.uzh.ch/giftdb/pflanzen/0054_tox.htm',
  ),
  clinitoxXylitol: clinitox('Xylitol', 'https://www.vetpharm.uzh.ch/CLINITOX/TOXDB/KLT_086.htm'),
  clinitoxAllium: clinitox(
    'Allium (Zwiebel, Knoblauch)',
    'https://www.vetpharm.uzh.ch/giftdb/pflanzen/0049_tox.htm',
  ),
  clinitoxMacadamia: clinitox(
    'Macadamia',
    'https://www.vetpharm.uzh.ch/giftdb/pflanzen/0218_tox.htm',
  ),
  clinitoxAvocado: clinitox(
    'Persea americana (Avocado)',
    'https://www.vetpharm.uzh.ch/giftdb/pflanzen/0186_tox.htm',
  ),
  bernGrapes: {
    name: 'Vetsuisse-Fakultät der Universität Bern, Kleintierklinik (A. Schweighauser, T. Francey): Trauben und Rosinen, eine Delikatesse für uns, aber höchstgefährlich für unsere Hunde',
    url: 'https://www.kleintierklinik.unibe.ch/e18883/e577296/e577300/pane577303/e577305/Traubenvergiftung_ger.pdf',
  },
  vetmeduniHolidays: {
    name: 'Veterinärmedizinische Universität Wien, Tierspital: Feiertagstipps der Vetmeduni Vienna',
    url: 'https://www.vetmeduni.ac.at/fileadmin/v/tierspital/Tipps_vom_Tierarzt_Giftpflanzen_und_Weihnachten.pdf',
  },
  btkPoisonings: {
    name: 'Bundestierärztekammer, Deutsches Tierärzteblatt 3/2015 (McFarland, Begemann, Greiner, BfR): Tiervergiftungen in Deutschland',
    url: 'https://www.bundestieraerztekammer.de/btk/dtbl/archiv/2015/artikel/DTBl_03_2015_BfR-Tiervergiftungen.pdf',
  },
  bfrPets: {
    name: 'Bundesinstitut für Risikobewertung, Mitteilung 012/2026 vom 25. Februar 2026: Wie gefährlich sind Gifte für Hunde und Katzen?',
    url: 'https://www.bfr.bund.de/mitteilung/wie-gefaehrlich-sind-gifte-fuer-hunde-und-katzen/',
  },
  toxinfoAnimals: {
    name: 'Tox Info Suisse: Vergiftungen bei Tieren (Notfallnummer 145)',
    url: 'https://www.toxinfo.ch/tiervergiftung',
  },
} as const satisfies Record<string, PageSource>;

/** The sources of the German hub: who to call, and which foods the German-language sources name. */
export const DE = {
  hub: [
    SOURCES_DE.bfrPets,
    SOURCES_DE.btkPoisonings,
    SOURCES_DE.vetmeduniHolidays,
    SOURCES_DE.toxinfoAnimals,
  ],
} as const;
