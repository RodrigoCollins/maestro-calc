import { Rational } from '@maestro-calc/core';
import { poolSalt } from '@maestro-calc/pool-core/pool-salt';
import { CHEMISTRY_CHART } from './chemistry.ts';
import { DOSING_CHART, doseOf } from './dosing.ts';
import { CHLORINE, PH, SALT } from './doses.ts';
import { SALT_ES } from './doses-es.ts';
import { amountText } from './format.ts';
import { gallonsOf } from './gallons.ts';
import type { GuideSource } from './guide.ts';
import { JOB_PAGES } from './jobs.ts';
import type { Lang } from './routes.ts';
import { VOLUME_TEXTS } from './volume/texts.ts';

/*
 * What the main calculator pages carry under the tool: a table of the dose (or the gallons) by pool
 * size, worked out by the page's own engine when the site is built, and the questions a reader asks
 * after the dose, each answered from a label, a manual or the CDC. No figure here is typed by hand.
 */

/** The day every source below was read again and every answer checked against it. */
export const EXTRAS_CHECKED = '2026-11-10';

export interface ExtrasRow {
  readonly label: string;
  readonly cells: readonly string[];
  /** The page of this size of its own, where the site has one. */
  readonly href?: string;
}

export interface ExtrasTable {
  readonly id: string;
  readonly caption: string;
  /** The head of the first column, then of each figure column. */
  readonly head: readonly string[];
  readonly rows: readonly ExtrasRow[];
  readonly note: string;
}

export interface FaqItem {
  readonly question: string;
  readonly answer: string;
  /** The keys of `sources` the answer rests on. */
  readonly sources: readonly string[];
  /** The page of this site that answers it for every product. */
  readonly link?: { readonly href: string; readonly label: string };
}

export interface CalculatorExtras {
  readonly path: string;
  readonly lang: Lang;
  readonly checked: string;
  readonly tablesHeading: string;
  readonly tables: readonly ExtrasTable[];
  readonly faqHeading: string;
  readonly faq: readonly FaqItem[];
  readonly sources: Readonly<Record<string, GuideSource>>;
}

const JOB_PATHS = new Set(JOB_PAGES.map(({ path }) => path));

/** `path` when the site has that page, so a row links its size's own page and nothing else. */
const pageOf = (path: string): { href?: string } => (JOB_PATHS.has(path) ? { href: path } : {});

/** The pool sizes of the dose tables: each 5,000 gallons from 5,000 to 40,000. */
const GALLONS = [5000, 10_000, 15_000, 20_000, 25_000, 30_000, 35_000, 40_000] as const;

const sizeText = (gallons: number): string => amountText(Rational.of(gallons));

/** One row per pool size: its cells, and its own page by `slug` where there is one. */
const rowsOf = (
  cells: (gallons: string) => readonly string[],
  slug: (gallons: number) => string,
): ExtrasRow[] =>
  GALLONS.map((gallons) => ({
    label: sizeText(gallons),
    cells: cells(String(gallons)),
    ...pageOf(slug(gallons)),
  }));

const SOURCES = {
  taylor: DOSING_CHART.sources.taylor,
  hasa: DOSING_CHART.sources.hasa,
  phUp: {
    name: 'pH Up (sodium carbonate 100%) label, manufactured for Alliance Trading, Inc. (label 01616483, REV050824)',
    url: 'https://www.propools.com/Manuals/66872_20248714245.pdf',
  },
  phDown: {
    name: 'pH Down (sodium bisulfate 93.2%) label, manufactured for Alliance Trading, Inc. (label 01616484, REV052024)',
    url: 'https://www.propools.com/Manuals/66868_202487132317.pdf',
  },
  liquid: {
    name: 'B’s Pool Supply Sodium Hypochlorite Solution (12.5%) label, EPA Reg. No. 55487-20001 (accepted November 16, 2017)',
    url: 'https://www3.epa.gov/pesticides/chem_search/ppls/055487-20001-20171116.pdf',
  },
  calHypo: DOSING_CHART.sources.calHypo,
  cdc: CHEMISTRY_CHART.sources.cdc,
  mahc: CHEMISTRY_CHART.sources.mahc,
  pubchem: {
    name: 'PubChem (National Library of Medicine): molecular weights of cyanuric acid (CID 7956), 129.07; chlorine (CID 24526), 70.90; calcium carbonate (CID 10112), 100.09',
    url: 'https://pubchem.ncbi.nlm.nih.gov/compound/7956',
  },
  hayward: {
    name: 'Hayward AquaRite owner’s manual, 092538 Rev D: Ideal salt level, Type of Salt to Use, How to Add or Remove Salt',
    url: 'https://hayward.com/media/akeneo_connector/asset_files/0/9/092538_RevD_b778.pdf',
  },
} as const satisfies Record<string, GuideSource>;

type SourceKey = keyof typeof SOURCES;

/** The sources of one page, by their keys, in the order it cites them. */
const pick = (...keys: readonly SourceKey[]): Readonly<Record<string, GuideSource>> =>
  Object.fromEntries(keys.map((key): [string, GuideSource] => [key, SOURCES[key]]));

/** The swim guide: the reentry level or the wait of every product, label by label. */
const SWIM = {
  href: '/how-long-after-adding-chemicals-can-you-swim',
  label: 'How long after adding chemicals you can swim',
};

// ---- pH ----

const ph = (product: string, key: string) => (gallons: string) =>
  ['1', '2', '3'].map((drops) => doseOf(PH.path, { gallons, product, drops }, key));

const acidPage = (gallons: number) =>
  `/how-much-muriatic-acid-for-a-${String(gallons)}-gallon-pool`;

const DROPS = ['Pool gallons', '1 drop', '2 drops', '3 drops'];

const phAt = (gallons: string, product: string, key: string, drops = '1'): string =>
  doseOf(PH.path, { gallons, product, drops }, key);

const PH_EXTRAS: CalculatorExtras = {
  path: PH.path,
  lang: 'en',
  checked: EXTRAS_CHECKED,
  tablesHeading: 'pH dose by pool size',
  tables: [
    {
      id: 'muriatic',
      caption: 'Muriatic acid (31.45%) to lower pH, in fl oz',
      head: DROPS,
      rows: rowsOf(ph('muriatic-31-45', 'liquid'), acidPage),
      note: 'By the drops of acid demand reagent your test kit counts. A quart is 32 fl oz and a gallon 128.',
    },
    {
      id: 'dry-acid',
      caption: 'Dry acid (sodium bisulfate, 93.2%) to lower pH, in oz by weight',
      head: DROPS,
      rows: rowsOf(ph('dry-acid', 'dry'), () => ''),
      note: 'By the same drops of acid demand reagent. A pound is 16 oz.',
    },
    {
      id: 'soda-ash',
      caption: 'Soda ash (sodium carbonate) to raise pH, in oz by weight',
      head: DROPS,
      rows: rowsOf(ph('soda-ash', 'dry'), () => ''),
      note: 'By the drops of base demand reagent your test kit counts.',
    },
  ],
  faqHeading: 'Frequently asked questions',
  faq: [
    {
      question: 'Why does the calculator ask for drops and not my pH reading?',
      answer:
        'Two pools at the same pH can need very different amounts of acid, because the alkalinity of the water resists the change. The acid demand and base demand tests of a Taylor kit add reagent to a sample of your own water until it reaches the pH you want, so the drops already count your alkalinity. Taylor’s pH dosage chart turns each drop into an amount per 10,000 gallons, and the calculator scales that to your pool. A calculator that takes only the pH has to guess the alkalinity.',
      sources: ['taylor'],
    },
    {
      question: 'How much muriatic acid can I add at once?',
      answer: `HASA’s label adds at most one quart per 20,000 gallons of pool water per 24 hours, and repeats it at 24-hour intervals as needed. That is ${phAt('10000', 'muriatic-31-45', 'liquidPerDay')} fl oz a day in 10,000 gallons and ${phAt('20000', 'muriatic-31-45', 'liquidPerDay')} fl oz in 20,000; the calculator splits a larger dose into days. Pour it slowly at the deep end, at least a foot from the wall, with the pump and filter running.`,
      sources: ['hasa'],
    },
    {
      question: 'How much soda ash or dry acid can I add at a time?',
      answer: `The pH Up label adds at most 1 pound of soda ash per 10,000 gallons at a time, ${phAt('20000', 'soda-ash', 'dryPerAddition')} oz in 20,000 gallons. The pH Down label adds at most 1.5 pounds of dry acid per 10,000 gallons at any one time, ${phAt('20000', 'dry-acid', 'dryPerAddition')} oz in 20,000 gallons. Past that, the calculator counts the additions.`,
      sources: ['phUp', 'phDown'],
    },
    {
      question: 'When should I retest the pH after adding a product?',
      answer:
        'After muriatic acid, the HASA label runs the pump and the filter for at least one hour after the addition; the next part of a split dose waits 24 hours, so test before each one. After soda ash, the pH Up label lets the water recirculate two to three hours and then rechecks the pH. After dry acid, the pH Down label lets it recirculate two hours and retests.',
      sources: ['hasa', 'phUp', 'phDown'],
    },
    {
      question: 'How long after adding pH chemicals can I swim?',
      answer:
        'None of these labels gives a time in hours. Wait out the circulation each one asks for, test, and swim when the pH reads in range: the labels keep it at 7.2 to 7.6, and the CDC recommends 7.0 to 7.8 for a home pool. Chlorine has its own reentry levels; the swim guide lists every label.',
      sources: ['hasa', 'phUp', 'cdc'],
      link: SWIM,
    },
    {
      question: 'Can I add acid and chlorine at the same time?',
      answer:
        'No. The liquid chlorine label warns that mixing it with chemicals such as acids releases hazardous gases. Add them separately, each into the pool water with the pump running, never mixed with each other.',
      sources: ['liquid'],
    },
  ],
  sources: pick('taylor', 'hasa', 'phUp', 'phDown', 'cdc', 'liquid'),
};

// ---- chlorine ----

const chlorineAt = (gallons: string, current: string, target: string, product: string) =>
  doseOf(
    CHLORINE.path,
    { gallons, current, target, product },
    product.startsWith('liquid') ? 'liquid' : 'dry',
  );

const CHLORINE_EXTRAS: CalculatorExtras = {
  path: CHLORINE.path,
  lang: 'en',
  checked: EXTRAS_CHECKED,
  tablesHeading: 'Chlorine dose by pool size',
  tables: [
    {
      id: 'raise',
      caption: 'Raise free chlorine by 1 ppm',
      head: [
        'Pool gallons',
        '12.5% liquid, fl oz',
        '10% liquid, fl oz',
        '65% cal-hypo, oz',
        '56% dichlor, oz',
      ],
      rows: rowsOf(
        (gallons) =>
          ['liquid-12-5', 'liquid-10', 'cal-hypo-65', 'dichlor-56'].map((product) =>
            chlorineAt(gallons, '0', '1', product),
          ),
        (gallons) => `/how-much-chlorine-for-a-${String(gallons)}-gallon-pool`,
      ),
      note: 'For 2 ppm, double the figure; for 3 ppm, triple it. Granular products are weighed, not measured by volume.',
    },
    {
      id: 'shock',
      caption: 'Shock from 0 to 10 ppm',
      head: ['Pool gallons', '12.5% liquid, fl oz', '65% cal-hypo, oz', '56% dichlor, oz'],
      rows: rowsOf(
        (gallons) =>
          ['liquid-12-5', 'cal-hypo-65', 'dichlor-56'].map((product) =>
            chlorineAt(gallons, '0', '10', product),
          ),
        (gallons) => `/how-much-shock-for-a-${String(gallons)}-gallon-pool`,
      ),
      note: '10 ppm is the top of the 5 to 10 ppm the liquid chlorine and cal-hypo labels shock to. Every 10 ppm from dichlor also adds about 9 ppm of stabilizer.',
    },
  ],
  faqHeading: 'Frequently asked questions',
  faq: [
    {
      question: 'How long after adding chlorine can I swim?',
      answer:
        'Until a test reads the label’s reentry level, not for a set time. The 12.5% liquid chlorine label says: do not enter treated pool above 4 ppm chlorine level due to risk of bodily harm, and the cal-hypo label prohibits reentry above 4 ppm as well. Test until it reads that level; the swim guide lists the level of every product.',
      sources: ['liquid', 'calHypo'],
      link: SWIM,
    },
    {
      question: 'How much chlorine do I need to shock a pool?',
      answer: `The liquid chlorine label super-chlorinates with 52 to 104 fl oz per 10,000 gallons to yield 5 to 10 ppm. The calculator gives ${chlorineAt('10000', '0', '10', 'liquid-12-5')} fl oz of 12.5% liquid or ${chlorineAt('10000', '0', '10', 'cal-hypo-65')} oz of 65% cal-hypo to take 10,000 gallons from 0 to 10 ppm. Start from your own reading: the chlorine already in the water counts.`,
      sources: ['liquid', 'calHypo'],
    },
    {
      question: 'How much liquid chlorine should I add at a time?',
      answer: `For upkeep, the liquid chlorine label adds 11 fl oz per 10,000 gallons to yield 0.6 to 1.0 ppm, and asks a stabilized pool to hold 1.0 to 1.5 ppm. The CDC keeps a home pool at 1 ppm or more, and 2 ppm or more with stabilizer. Raising 20,000 gallons from 1 to 3 ppm takes ${chlorineAt('20000', '1', '3', 'liquid-12-5')} fl oz of 12.5% liquid.`,
      sources: ['liquid', 'cdc'],
    },
    {
      question: 'When should I test the chlorine again?',
      answer:
        'The CDC tests chlorine and pH at least twice a day, and more often when many people swim. After a dose, run the pump to mix it, then test before anyone gets in: the reading, not the clock, says the water is ready.',
      sources: ['cdc'],
    },
    {
      question: 'Does dichlor or cal-hypo change my other levels?',
      answer:
        'Yes. Each molecule of dichlor releases two parts of chlorine and one of cyanuric acid: by the molar masses, every 1 ppm of chlorine from dichlor adds 0.91 ppm of stabilizer (CYA). Cal-hypo adds about 0.71 ppm of calcium hardness a ppm. The calculator shows both for the product you pick. Stabilizer does not wear off; the CDC’s code caps a public pool at 90 ppm.',
      sources: ['pubchem', 'mahc'],
    },
    {
      question: 'What free chlorine level should a pool have?',
      answer:
        'The CDC recommends at least 1 ppm of free chlorine in a pool, and at least 2 ppm when the water holds stabilizer (cyanuric acid), with the pH at 7.0 to 7.8. A shock goes far higher for a short time; swim again only at the label’s reentry level.',
      sources: ['cdc'],
    },
  ],
  sources: pick('liquid', 'calHypo', 'cdc', 'mahc', 'pubchem'),
};

// ---- salt ----

const saltAt = (raw: Readonly<Record<string, string>>, system: 'us' | 'metric' = 'us'): string =>
  doseOf(SALT.path, raw, 'pounds', system);

/** The bags the salt calculator counts for `raw`: 40 lb in US units, 20 kg in metric. */
const bagsOf = (raw: Readonly<Record<string, string>>): string => {
  const ran = poolSalt.run(raw);
  if (!ran.ok) throw new Error(`pool-salt did not run on ${JSON.stringify(raw)}`);
  return String(ran.value.shopping[0]?.qty ?? 0n);
};

const SALT_EXTRAS: CalculatorExtras = {
  path: SALT.path,
  lang: 'en',
  checked: EXTRAS_CHECKED,
  tablesHeading: 'Salt by pool size',
  tables: [
    {
      id: 'salt',
      caption: 'Pounds of salt by pool size',
      head: [
        'Pool gallons',
        '+500 ppm, lb',
        '+1,000 ppm, lb',
        '0 to 3,200 ppm, lb',
        '40 lb bags, 0 to 3,200',
      ],
      rows: rowsOf(
        (gallons) => [
          saltAt({ gallons, current: '2700', target: '3200' }),
          saltAt({ gallons, current: '2200', target: '3200' }),
          saltAt({ gallons, current: '0', target: '3200' }),
          bagsOf({ gallons, current: '0', target: '3200' }),
        ],
        (gallons) => `/how-much-salt-for-a-${String(gallons)}-gallon-pool`,
      ),
      note: '3,200 ppm is the level Hayward’s AquaRite manual calls optimal; +500 ppm takes a pool at 2,700 ppm, the bottom of its range, up to it. Follow the level your own cell asks for.',
    },
  ],
  faqHeading: 'Frequently asked questions',
  faq: [
    {
      question: 'How long after adding salt can I swim?',
      answer:
        'The Hayward AquaRite manual gives no time before swimming. It adds the salt with the pump on, brushes it around so it does not pile up on the bottom, and runs the filter pump for 24 hours to spread it. Once it has dissolved and the chlorine and pH read in range, the water is ready.',
      sources: ['hayward'],
      link: SWIM,
    },
    {
      question: 'How much salt should I add at a time?',
      answer: `The calculator splits the dose: 20,000 gallons of fresh water take ${saltAt({ gallons: '20000', current: '0', target: '3200' })} lb to reach 3,200 ppm, and it gives ${doseOf(SALT.path, { gallons: '20000', current: '0', target: '3200' }, 'firstAddition')} lb, three quarters, to add first. Add it with the pump on and brush it around, the Hayward manual says, so it does not pile up on the bottom; test after the pump has run 24 hours, then add the rest.`,
      sources: ['hayward'],
    },
    {
      question: 'When should I test the salt again?',
      answer:
        'After the filter pump has run for 24 hours. The Hayward manual says the salt display may take 24 hours to respond to the change in salt concentration, so a reading taken sooner can call for salt that is already in the water.',
      sources: ['hayward'],
    },
    {
      question: 'What salt level does a salt water pool need?',
      answer:
        'The level your cell names. The Hayward AquaRite manual gives 2,700 to 3,400 ppm, with 3,200 ppm optimal, and says salt begins to be tasted at about 3,500 to 4,000 ppm. A low level cuts the chlorine the cell makes; a high one can shut it down.',
      sources: ['hayward'],
    },
    {
      question: 'What kind of salt can I use in a pool?',
      answer:
        'Sodium chloride over 99% pure, the manual says: food quality or water softener salt, often sold in 40 to 80 lb bags as coarse solar salt. Pellets work but dissolve more slowly. It rules out rock salt, salt with yellow prussiate of soda, salt with anti-caking additives and iodized salt.',
      sources: ['hayward'],
    },
    {
      question: 'How do I lower the salt in my pool?',
      answer:
        'By draining part of the water and refilling with fresh water: the manual calls it the only way. Salt does not evaporate; it leaves with splash-out, backwashing and rain overflow, so the level falls only slowly on its own.',
      sources: ['hayward'],
    },
  ],
  sources: pick('hayward'),
};

// ---- the Spanish salt page: kilos by litres, as a reader abroad measures the pool ----

const LITRES = [10_000, 20_000, 30_000, 40_000, 50_000, 60_000, 75_000, 100_000] as const;

const SALT_ES_EXTRAS: CalculatorExtras = {
  path: SALT_ES.path,
  lang: 'es',
  checked: EXTRAS_CHECKED,
  tablesHeading: 'Sal según el tamaño de la piscina',
  tables: [
    {
      id: 'sal',
      caption: 'Kilos de sal según los litros de la piscina, con agua dulce',
      head: [
        'Litros (m³)',
        'Hasta 3,200 ppm, kg',
        'Hasta 4,000 ppm, kg',
        'Sacos de 20 kg, 4,000 ppm',
      ],
      rows: LITRES.map((litres) => {
        const gallons = String(litres);
        return {
          label: amountText(Rational.of(litres)),
          cells: [
            saltAt({ gallons, current: '0', target: '3200', units: 'metric' }, 'metric'),
            saltAt({ gallons, current: '0', target: '4000', units: 'metric' }, 'metric'),
            bagsOf({ gallons, current: '0', target: '4000', units: 'metric' }),
          ],
        };
      }),
      note: '1 ppm es 1 mg por litro, así que 4,000 ppm son 4 kg de sal por cada 1,000 litros (1 m³). Hayward AquaRite trabaja a 3,200 ppm y otras celdas piden 4,000: usa el nivel del manual de la tuya. Si tu sal viene en sacos de 25 kg, divide los kilos entre 25.',
    },
  ],
  faqHeading: 'Preguntas frecuentes',
  faq: [
    {
      question: '¿Cuánto tiempo después de echar sal puedo nadar?',
      answer:
        'El manual de Hayward AquaRite no da un tiempo antes de nadar. Agrega la sal con la bomba encendida, la cepilla para que no se acumule en el fondo y deja la bomba del filtro funcionando 24 horas para repartirla. Cuando se disolvió y el cloro y el pH están en rango, el agua está lista.',
      sources: ['hayward'],
      link: {
        href: '/es/cuanto-esperar-para-nadar-despues-de-agregar-quimicos',
        label: 'Cuánto esperar para nadar después de agregar químicos',
      },
    },
    {
      question: '¿Cuánta sal echo de una vez?',
      answer:
        'La calculadora divide la dosis: te da primero tres cuartas partes, y el resto va después de medir. Échala con la bomba encendida y cepíllala, dice el manual de Hayward, para que no se acumule en el fondo; mide después de 24 horas de bomba y agrega lo que falta.',
      sources: ['hayward'],
    },
    {
      question: '¿Cuándo vuelvo a medir la sal?',
      answer:
        'Después de 24 horas de bomba. El manual de Hayward dice que la lectura de sal del equipo puede tardar 24 horas en responder al cambio, así que una medición antes de tiempo puede pedirte sal que ya está en el agua.',
      sources: ['hayward'],
    },
    {
      question: '¿Qué nivel de sal necesita una piscina de agua salada?',
      answer:
        'El que pide tu clorador. El manual de Hayward AquaRite da de 2,700 a 3,400 ppm, con 3,200 ppm como óptimo, y dice que la sal se empieza a notar en el sabor a unos 3,500 a 4,000 ppm. Con poca sal la celda produce menos cloro; con demasiada se puede apagar.',
      sources: ['hayward'],
    },
    {
      question: '¿Qué sal puedo usar en la piscina?',
      answer:
        'Cloruro de sodio de más de 99% de pureza, dice el manual: sal de calidad alimentaria o para descalcificador. Las pastillas sirven, pero tardan más en disolverse. Descarta la sal de roca, la sal con ferrocianuro (prusiato amarillo de sodio), la sal con antiaglomerantes y la sal yodada.',
      sources: ['hayward'],
    },
    {
      question: '¿Cómo bajo la sal de la piscina?',
      answer:
        'Vaciando parte del agua y rellenando con agua dulce: el manual dice que es la única forma. La sal no se evapora; sale con las salpicaduras, los contralavados y el agua de lluvia que desborda, así que baja muy despacio sola.',
      sources: ['hayward'],
    },
  ],
  sources: {
    hayward: {
      name: 'Manual del usuario de Hayward AquaRite, 092538 Rev D: nivel ideal de sal, tipo de sal y cómo agregar o quitar sal',
      url: SOURCES.hayward.url,
    },
  },
};

// ---- volume: the common sizes, each linking its own page ----

const ROUND = [12, 15, 18, 21, 24, 27, 30, 33] as const;
const RECTANGLE = [
  [12, 24],
  [14, 28],
  [16, 32],
  [18, 36],
  [20, 40],
] as const;

const ft = (feet: number): string => `${String(feet)} ft`;

const VOLUME_EXTRAS: CalculatorExtras = {
  path: VOLUME_TEXTS.path,
  lang: 'en',
  checked: EXTRAS_CHECKED,
  tablesHeading: 'Gallons of common pool sizes',
  tables: [
    {
      id: 'round',
      caption: 'Round pools, by the depth of the water',
      head: ['Size', '4 ft deep', '4 ft 6 in deep'],
      rows: ROUND.map((across) => ({
        label: `${String(across)} ft round`,
        cells: ['4 ft', '4 ft 6 in'].map((depth) =>
          gallonsOf({ shape: 'round', length: ft(across), shallow: depth, deep: depth }),
        ),
        ...pageOf(`/${String(across)}-ft-round-pool-gallons`),
      })),
      note: 'Measured across the inside of the wall. A 48 in wall holds water about 4 ft deep and a 54 in wall about 4 ft 6 in, a few inches under the top.',
    },
    {
      id: 'rectangle',
      caption: 'Rectangle pools, shallow end to deep end',
      head: ['Size', '3 ft to 6 ft', '3 ft 6 in to 8 ft'],
      rows: RECTANGLE.map(([width, length]) => ({
        label: `${String(width)} x ${String(length)} ft`,
        cells: [
          ['3 ft', '6 ft'],
          ['3 ft 6 in', '8 ft'],
        ].map(([shallow = '', deep = '']) =>
          gallonsOf({ shape: 'rectangle', length: ft(length), width: ft(width), shallow, deep }),
        ),
        ...pageOf(`/${String(width)}x${String(length)}-pool-gallons`),
      })),
      note: 'Worked out at the average of the two ends. The page of each size has more depths, and the pool volume chart has oval pools and sizes in metres.',
    },
  ],
  faqHeading: 'Frequently asked questions',
  faq: [],
  sources: {},
};

/** The extras of every main calculator page, in the order of the site. */
export const CALCULATOR_EXTRAS: readonly CalculatorExtras[] = [
  PH_EXTRAS,
  CHLORINE_EXTRAS,
  SALT_EXTRAS,
  VOLUME_EXTRAS,
  SALT_ES_EXTRAS,
];

/** The extras of the calculator page at `path`, or none for a page that has none. */
export const extrasOf = (path: string): CalculatorExtras | undefined =>
  CALCULATOR_EXTRAS.find((extras) => extras.path === path);
