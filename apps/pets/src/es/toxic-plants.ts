import type { GuideQuestion, GuideSection, PageSource } from '../guides.ts';
import {
  aspcaOf,
  aspcaSourceOf,
  aspcaUrlOf,
  ASPCA_RECORDS,
  listingOf,
  PLANTS_CHECKED,
  type AspcaRecord,
  type Listing,
  type Species,
} from '../plants/aspca.ts';
import { P } from '../plants/sources.ts';
import type { Plant } from '../plants/types.ts';
import { hrefOf } from '../routes.ts';
import {
  CATS_HUB,
  DOGS_HUB,
  PLANTS,
  plantPathOf,
  SAFE_HUB,
  verdictOf,
  type PlantVerdict,
} from '../toxic-plants.ts';
import { SOURCES_ES, SOURCES_ES_CHECKED } from './foods/sources.ts';
import { FLOWERS_ES } from './plants/flowers.ts';
import { GARDEN_ES } from './plants/garden.ts';
import { HOUSEPLANTS_ES } from './plants/houseplants.ts';
import { entryNameEsOf } from './plants/names.ts';
import { SAFE_ES } from './plants/safe.ts';
import type { PlantEs } from './plants/types.ts';

/** Every Spanish plant, in the order of the English plants. */
export const PLANTS_ES: readonly PlantEs[] = [
  ...HOUSEPLANTS_ES,
  ...FLOWERS_ES,
  ...GARDEN_ES,
  ...SAFE_ES,
];

/**
 * The note on every Spanish page that cites a toxic entry. The ASPCA and Pet Poison Helpline lines
 * of the English pages are American numbers, and no national poison line of Mexico, Spain or
 * Argentina was confirmed to take calls about animals (`SOURCES_ES`): the call goes to the
 * veterinarian first, or to an emergency veterinary clinic, wherever the reader is.
 */
export const PLANT_CALL_ES =
  'Si tu perro o tu gato comió parte de una planta tóxica, llama ya a tu veterinario o a una clínica veterinaria de urgencias, aunque parezca estar bien. Ten a mano el nombre de la planta, o una foto, y el peso de tu mascota. Esta página no sustituye a tu veterinario.';

const englishOf = (id: string): Plant => {
  const plant = PLANTS.find((candidate) => candidate.id === id);
  if (plant === undefined) throw new Error(`no English plant ${id}`);
  return plant;
};

const capitalized = (text: string): string => text.replace(/^./, (first) => first.toUpperCase());

/** `tóxica`, `tóxicos`: the adjective as `es` agrees with it. */
const toxicOf = (es: PlantEs): string =>
  `tóxic${es.gender === 'm' ? 'o' : 'a'}${es.plural ? 's' : ''}`;

/** `de` and the subject, contracted as Spanish writes it: `del potus`, `de la hiedra`. */
const ofSubject = (es: PlantEs): string =>
  es.subject.startsWith('el ') ? `del ${es.subject.slice(3)}` : `de ${es.subject}`;

const verbOf = (es: PlantEs): string => (es.plural ? 'son' : 'es');

/** The Spanish address of `es`: `/es/nochebuena-es-toxica-para-perros-y-gatos`. */
export const plantPathEsOf = (es: PlantEs): string =>
  `/es/${es.slug}-${verbOf(es)}-${toxicOf(es).replace('ó', 'o')}-para-perros-y-gatos`;

/** The question as the searches word it: `¿La flor de Nochebuena es tóxica para perros y gatos?` */
const questionOf = (es: PlantEs, species = 'perros y gatos'): string =>
  `¿${capitalized(es.subject)} ${verbOf(es)} ${toxicOf(es)} para ${species}?`;

const VERDICT_WORDS_ES: Readonly<Record<PlantVerdict, string>> = {
  both: 'Sí',
  cats: 'Para gatos, sí',
  dogs: 'Para perros, sí',
  neither: 'No',
};

const wordOf = (es: PlantEs, verdict: PlantVerdict): string => es.word ?? VERDICT_WORDS_ES[verdict];

const SPECIES_ES: Readonly<Record<Species, string>> = {
  dogs: 'perros',
  cats: 'gatos',
  horses: 'caballos',
};

const SPECIES_ORDER: readonly Species[] = ['dogs', 'cats', 'horses'];

const listed = (words: readonly string[], and = 'y'): string =>
  words.length < 2
    ? (words[0] ?? '')
    : `${words.slice(0, -1).join(', ')} ${and} ${words.at(-1) ?? ''}`;

/** An ASPCA entry as a Spanish sentence names it: `la flor de Nochebuena`, `el lirio`. */
export const entryEsOf = (record: AspcaRecord): string => {
  const { article, name } = entryNameEsOf(record.slug);
  // the other name in parentheses stays in the tables: a sentence gives the scientific one after it
  return `${article} ${name.replace(/ \([^)]*\)$/, '')}`;
};

/** What the ASPCA lists for `record`, species by species, as one Spanish sentence. */
const aspcaSentenceEs = (record: AspcaRecord): string => {
  const of = (listing: Listing) =>
    SPECIES_ORDER.filter((species) => listingOf(record, species) === listing).map(
      (species) => SPECIES_ES[species],
    );
  const toxic = of('toxic');
  const safe = of('non-toxic');
  const missing = of('not-listed');
  const parts = [
    ...(toxic.length > 0 ? [`entre las plantas tóxicas para ${listed(toxic)}`] : []),
    ...(safe.length > 0 ? [`entre las no tóxicas para ${listed(safe)}`] : []),
  ];
  const as = parts.length === 2 ? `${parts[0] ?? ''}, y ${parts[1] ?? ''}` : (parts[0] ?? '');
  const tail =
    missing.length > 0 ? `; su ficha no dice nada de los ${listed(missing, 'ni de los')}` : '';
  return `El ASPCA Animal Poison Control Center incluye ${entryEsOf(record)} (${record.scientific}) ${as}${tail}.`;
};

const CELLS_ES: Readonly<Record<Listing, string>> = {
  toxic: 'Tóxica',
  'non-toxic': 'No tóxica',
  'not-listed': 'No figura',
};

const cellOf = (record: AspcaRecord, species: Species): string =>
  CELLS_ES[listingOf(record, species)];

/** The ASPCA answer to "¿es tóxica para los gatos?" for the plant's own entry. */
const answerFor = (record: AspcaRecord, species: 'cats' | 'dogs'): string => {
  const name = `${entryEsOf(record)} (${record.scientific})`;
  const listing = listingOf(record, species);
  const animals = SPECIES_ES[species];
  if (listing === 'toxic')
    return `Sí. El ASPCA Animal Poison Control Center incluye ${name} entre las plantas tóxicas para los ${animals}.`;
  if (listing === 'non-toxic')
    return `No. El ASPCA Animal Poison Control Center incluye ${name} entre las plantas no tóxicas para los ${animals}.`;
  const other = species === 'cats' ? 'dogs' : 'cats';
  const named =
    listingOf(record, other) === 'not-listed'
      ? 'ninguna de las dos especies'
      : `los ${SPECIES_ES[other]}`;
  return `La ficha del ASPCA Animal Poison Control Center sobre ${name} no dice nada de los ${animals}: solo habla de ${named}. Pregunta a tu veterinario antes de dejar esta planta al alcance de un ${species === 'dogs' ? 'perro' : 'gato'}.`;
};

/** A table of a Spanish plant page or hub. */
export interface PlantTableEs {
  readonly heading: string;
  readonly paragraphs: readonly string[];
  readonly columns: readonly string[];
  readonly rows: readonly (readonly string[])[];
}

/** A link of a page. */
export interface PlantLinkEs {
  readonly href: string;
  readonly label: string;
}

/** A Spanish "¿… es tóxica para perros y gatos?" page, answered first from the ASPCA entry. */
export interface PlantPageEs {
  readonly id: string;
  readonly path: string;
  /** The English page of the same plant: the hreflang twin. */
  readonly twin: string;
  readonly verdict: PlantVerdict;
  readonly title: string;
  readonly description: string;
  readonly h1: string;
  readonly lead: string;
  /** The day the Spanish page was reviewed: the byline's day. */
  readonly checked: string;
  /** The sentence over the sources: when each was read. */
  readonly readOn: string;
  readonly callNow: boolean;
  readonly table: PlantTableEs;
  readonly sections: readonly GuideSection[];
  readonly alternatives: readonly PlantLinkEs[];
  readonly questions: readonly GuideQuestion[];
  readonly related: readonly PlantLinkEs[];
  readonly links: readonly PlantLinkEs[];
  readonly sources: readonly PageSource[];
}

const uniqueByUrl = (sources: readonly PageSource[]): PageSource[] =>
  sources.filter((source, index) => sources.findIndex(({ url }) => url === source.url) === index);

const SPANISH_URL = 'https://www.msdvetmanual.com/es/';

/** When the sources of a page were read: the English ones, and the Spanish ones it cites. */
const readOnOf = (sources: readonly PageSource[]): string =>
  sources.some(({ url }) => url.startsWith(SPANISH_URL))
    ? `El equipo editorial leyó las fuentes en inglés el ${dayOf(PLANTS_CHECKED)} y las fuentes en español el ${dayOf(SOURCES_ES_CHECKED)}.`
    : `El equipo editorial leyó todas las fuentes el ${dayOf(PLANTS_CHECKED)}.`;

const MONTHS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
] as const;

const dayOf = (iso: string): string => {
  const [year = 0, month = 0, day = 0] = iso.split('-').map(Number);
  return `${String(day)} de ${MONTHS[month - 1] ?? ''} de ${String(year)}`;
};

const titleOf = (es: PlantEs, word: string): string => {
  const question = questionOf(es);
  const answers = [es.answer, ...(es.short === undefined ? [] : [es.short])];
  const candidates = [
    ...answers.flatMap((answer) => [
      `${question} ${word}: ${answer} | Bowl Figures`,
      `${question} ${word}: ${answer}`,
    ]),
    `${question} ${word}`,
  ];
  return candidates.find((candidate) => candidate.length <= 65) ?? question;
};

const DESCRIPTION_TAILS: Readonly<Record<PlantVerdict, string>> = {
  both: 'Partes, signos y qué hacer, según la ASPCA.',
  cats: 'Gatos y perros por separado, signos y qué hacer.',
  dogs: 'Perros y gatos por separado, signos y qué hacer.',
  neither: 'La ficha de la ASPCA y otras plantas seguras.',
};

const descriptionOf = (es: PlantEs, verdict: PlantVerdict): string => {
  const full = `${es.summary} ${DESCRIPTION_TAILS[verdict]}`;
  return full.length <= 160 ? full : es.summary;
};

const CATS_LINK_ES: PlantLinkEs = {
  href: hrefOf('plants-cats', 'es'),
  label: 'Plantas tóxicas para gatos: la lista completa',
};
const DOGS_LINK_ES: PlantLinkEs = {
  href: hrefOf('plants-dogs', 'es'),
  label: 'Plantas tóxicas para perros: la lista completa',
};
const SAFE_LINK_ES: PlantLinkEs = {
  href: hrefOf('plants-safe', 'es'),
  label: 'Plantas seguras para perros y gatos según la ASPCA',
};
const FOODS_LINK_ES: PlantLinkEs = {
  href: hrefOf('foods', 'es'),
  label: '¿Qué pueden comer los perros? Los alimentos, de tóxico a seguro',
};

/** The hubs every Spanish plant page links. */
export const HUB_LINKS_ES: readonly PlantLinkEs[] = [DOGS_LINK_ES, CATS_LINK_ES, SAFE_LINK_ES];

/** How many plants of the same verdict a page links. */
const RELATED = 8;

const isToxicEntry = (slug: string): boolean =>
  (['cats', 'dogs'] as const).some((species) => listingOf(aspcaOf(slug), species) === 'toxic');

/** The Spanish page of the English plant `id`, when it has one. */
const esOfId = (id: string): PlantEs | undefined => PLANTS_ES.find((es) => es.id === id);

const pageOf = (es: PlantEs): PlantPageEs => {
  const plant = englishOf(es.id);
  const verdict = verdictOf(plant);
  const word = wordOf(es, verdict);
  const records = plant.entries.map(aspcaOf);
  const main = records[0];
  if (main === undefined) throw new Error(`${plant.id} names no ASPCA entry`);
  const toxic = verdict !== 'neither';
  const callNow = plant.entries.some(isToxicEntry);
  const subject = es.subject;
  const of = ofSubject(es);
  const sections: GuideSection[] = [
    {
      id: 'partes',
      heading: toxic ? `Qué partes ${of} son tóxicas` : `¿Alguna parte ${of} da problemas?`,
      paragraphs: [es.parts, ...(es.grade === undefined ? [] : [es.grade])],
    },
    {
      id: 'por-que',
      heading: toxic
        ? `Por qué ${subject} ${verbOf(es)} ${toxicOf(es)}`
        : `Por qué ${subject} ${es.plural ? 'figuran' : 'figura'} en la lista de plantas seguras`,
      paragraphs: es.why,
    },
    {
      id: 'signos',
      heading: toxic
        ? `Los signos si tu mascota come ${subject}, y cuándo aparecen`
        : `Qué puedes notar si tu mascota mordisquea ${subject}`,
      paragraphs: es.signs,
    },
    {
      id: 'que-hacer',
      heading: toxic
        ? `Si tu perro o tu gato comió ${subject}`
        : `Si tu mascota mordisqueó ${subject}`,
      paragraphs: es.act,
    },
    ...(es.disagree === undefined
      ? []
      : [
          {
            id: 'fuentes-discrepan',
            heading: 'Donde las fuentes no coinciden, o los nombres confunden',
            paragraphs: es.disagree,
          },
        ]),
  ];
  // the eight plants of the same verdict that follow this one, so each page links a different set
  const same = PLANTS_ES.filter((other) => verdictOf(englishOf(other.id)) === verdict);
  const at = same.indexOf(es);
  const related = [...same.slice(at + 1), ...same.slice(0, at)]
    .slice(0, RELATED)
    .map((other) => ({ href: plantPathEsOf(other), label: other.name }));
  const sources = uniqueByUrl([
    ...records.map(aspcaSourceOf),
    ...plant.sources,
    ...(callNow ? [P.aspcaLine, P.helpline] : []),
    P.aspcaList,
    ...es.sources,
  ]);
  return {
    id: es.id,
    path: plantPathEsOf(es),
    twin: plantPathOf(plant),
    verdict,
    title: titleOf(es, word),
    description: descriptionOf(es, verdict),
    h1: `${questionOf(es)} ${word}: ${es.answer}`,
    lead: `${word}: ${es.answer}. ${es.summary} ${aspcaSentenceEs(main)} Otros nombres: ${es.names}.`,
    checked: SOURCES_ES_CHECKED,
    readOn: readOnOf(sources),
    callNow,
    table: {
      heading:
        records.length > 1
          ? `Lo que dice la ASPCA ${of} y de las plantas que se venden con nombres parecidos`
          : `Lo que dice la ficha de la ASPCA sobre ${subject}`,
      paragraphs: [
        `Cada fila resume ${records.length > 1 ? `una de las ${String(records.length)} fichas` : 'la ficha'} de la lista de plantas tóxicas y no tóxicas de la ASPCA, que está en inglés; la segunda columna da su título original. «No figura» quiere decir que la ficha no dice nada de esa especie.`,
      ],
      columns: ['Planta', 'Ficha de la ASPCA', 'Nombre científico', 'Gatos', 'Perros', 'Caballos'],
      rows: records.map((record) => [
        capitalized(entryNameEsOf(record.slug).name),
        record.name,
        record.scientific,
        cellOf(record, 'cats'),
        cellOf(record, 'dogs'),
        cellOf(record, 'horses'),
      ]),
    },
    sections,
    alternatives: plant.alternatives.map((slug) => {
      const own = PLANTS.find((other) => other.entries[0] === slug);
      const ownEs = own === undefined ? undefined : esOfId(own.id);
      return {
        href: ownEs === undefined ? aspcaUrlOf(slug) : plantPathEsOf(ownEs),
        label: capitalized(entryNameEsOf(slug).name),
      };
    }),
    questions: [
      { question: questionOf(es, 'los gatos'), answer: answerFor(main, 'cats') },
      { question: questionOf(es, 'los perros'), answer: answerFor(main, 'dogs') },
      ...es.questions,
    ],
    related,
    links: [...HUB_LINKS_ES, FOODS_LINK_ES],
    sources,
  };
};

/** One Spanish page per plant, in the order of the English plants. */
export const PLANT_PAGES_ES: readonly PlantPageEs[] = PLANTS_ES.map(pageOf);

/** The Spanish plant page at `path`. */
export const plantPageEsOf = (path: string): PlantPageEs => {
  const found = PLANT_PAGES_ES.find((candidate) => candidate.path === path);
  if (found === undefined) throw new Error(`no Spanish plant page ${path}`);
  return found;
};

/** A row of a hub's list: the page, the name and a line about it. */
export interface HubRowEs {
  readonly href: string;
  readonly name: string;
  readonly note: string;
}

/** A group of a Spanish hub: the plants of one verdict for the hub's species. */
export interface HubGroupEs {
  readonly id: 'toxicas' | 'solo-gatos' | 'seguras';
  readonly heading: string;
  readonly intro: string;
  readonly rows: readonly HubRowEs[];
}

/** A Spanish species hub: every plant page, grouped by the ASPCA verdict for that species. */
export interface SpeciesHubEs {
  readonly path: string;
  readonly twin: string;
  readonly title: string;
  readonly description: string;
  readonly h1: string;
  readonly lead: string;
  readonly checked: string;
  readonly readOn: string;
  readonly groups: readonly HubGroupEs[];
  readonly table: PlantTableEs;
  readonly sections: readonly GuideSection[];
  readonly links: readonly PlantLinkEs[];
  readonly sources: readonly PageSource[];
}

const byName = (a: HubRowEs, b: HubRowEs): number => a.name.localeCompare(b.name, 'es');

const mainOf = (es: PlantEs): AspcaRecord => aspcaOf(englishOf(es.id).entries[0] ?? '');

const verdictEsOf = (es: PlantEs): PlantVerdict => verdictOf(englishOf(es.id));

const rowsOf = (keep: (verdict: PlantVerdict) => boolean, note: (es: PlantEs) => string) =>
  PLANTS_ES.filter((es) => keep(verdictEsOf(es)))
    .map((es) => ({ href: plantPathEsOf(es), name: es.name, note: note(es) }))
    .sort(byName);

const count = (keep: (verdict: PlantVerdict) => boolean): number =>
  PLANTS_ES.filter((es) => keep(verdictEsOf(es))).length;

const toCats = (verdict: PlantVerdict) => verdict === 'both' || verdict === 'cats';
const toDogs = (verdict: PlantVerdict) => verdict === 'both' || verdict === 'dogs';

const noteOf = (es: PlantEs): string =>
  `${wordOf(es, verdictEsOf(es)).toLowerCase()}, ${es.answer}`;

const hubTable = (heading: string, keep: (verdict: PlantVerdict) => boolean): PlantTableEs => ({
  heading,
  paragraphs: [
    'Las columnas de gatos y perros resumen la ficha de la ASPCA de cada planta; las partes salen de las fuentes que cita la página de cada planta.',
  ],
  columns: ['Planta', 'Nombre científico', 'Gatos', 'Perros', 'Qué partes'],
  rows: PLANTS_ES.filter((es) => keep(verdictEsOf(es))).map((es) => {
    const record = mainOf(es);
    return [es.name, record.scientific, cellOf(record, 'cats'), cellOf(record, 'dogs'), es.parts];
  }),
});

const HUB_SOURCES_ES = [SOURCES_ES.msdPlants];

/**
 * The Spanish dog hub, at the address of the measured search (`plantas tóxicas para perros`): the
 * plants that can kill a dog first, then every plant by its ASPCA verdict for dogs.
 */
export const DOGS_HUB_ES: SpeciesHubEs = {
  path: hrefOf('plants-dogs', 'es'),
  twin: DOGS_HUB.path,
  title: `Plantas tóxicas para perros: ${String(count(toDogs))} de la lista de la ASPCA`,
  description: `Qué plantas son tóxicas para los perros: la palma sago, los bulbos, la adelfa y ${String(count(toDogs) - 3)} más de la lista de la ASPCA, con las partes, los signos y qué hacer.`,
  h1: 'Plantas tóxicas para perros: la palma sago, los bulbos y el jardín primero',
  lead: `De las ${String(PLANTS_ES.length)} plantas por las que más se pregunta, el ASPCA Animal Poison Control Center incluye ${String(count(toDogs))} entre las tóxicas para los perros. Un perro escarba y mordisquea al aire libre, así que el jardín importa tanto como la maceta de la sala: la palma sago, un bulbo desenterrado y un seto de adelfa son las que pueden matarlo.`,
  checked: SOURCES_ES_CHECKED,
  readOn: readOnOf(HUB_SOURCES_ES),
  groups: [
    {
      id: 'toxicas',
      heading: 'Tóxicas para los perros',
      intro:
        'La ficha de la ASPCA de cada una la incluye entre las plantas tóxicas para los perros. La página de cada planta dice qué partes, qué signos y qué hacer.',
      rows: rowsOf(toDogs, (es) => es.summary),
    },
    {
      id: 'solo-gatos',
      heading: 'Tóxicas para los gatos, pero no para los perros',
      intro:
        'La ASPCA las incluye entre las tóxicas solo para los gatos. Si en casa también hay un gato, mantenlas fuera de su alcance igualmente.',
      rows: rowsOf(
        (verdict) => verdict === 'cats',
        (es) => es.summary,
      ),
    },
    {
      id: 'seguras',
      heading: 'No tóxicas para los perros',
      intro: 'La ASPCA las incluye entre las plantas no tóxicas para perros y gatos.',
      rows: rowsOf(
        (verdict) => verdict === 'neither',
        (es) => mainOf(es).scientific,
      ),
    },
  ],
  table: hubTable('Las plantas tóxicas para los perros, y qué partes', toDogs),
  sections: [
    {
      id: 'palma-sago',
      heading: 'La palma sago es la que hay que sacar del jardín',
      paragraphs: [
        'Pet Poison Helpline dice que cualquier parte de una palma sago (Cycas revoluta, la cica) puede envenenar a un perro, sobre todo la semilla, y que su cicasina puede causar insuficiencia hepática y la muerte. El Manual de veterinaria de MSD, en su edición en español, escribe que los perros son extremadamente sensibles a la toxicidad de las cícadas, que las semillas son la parte más tóxica y que muchas muertes se deben a la necrosis del hígado.',
        'El Merck Veterinary Manual cita estudios en los que solo sobrevivió entre la mitad y unos dos tercios de los perros con una intoxicación confirmada por cícadas. Con una atención rápida e intensiva, el Manual de MSD da un pronóstico de regular a bueno: no esperes a ver signos.',
      ],
    },
    {
      id: 'bulbos',
      heading: 'Los bulbos y el jardín',
      paragraphs: [
        'Las fichas de la ASPCA del tulipán y del narciso dicen que el bulbo concentra la mayor parte de la toxina, y por eso corre más riesgo un perro que desentierra un macizo que uno que mordisquea una flor cortada. La adelfa (laurel rosa), la dedalera y el lirio de los valles llevan en toda la planta glucósidos que actúan sobre el corazón.',
      ],
    },
  ],
  links: [CATS_LINK_ES, SAFE_LINK_ES, FOODS_LINK_ES],
  sources: uniqueByUrl([...DOGS_HUB.sources, ...HUB_SOURCES_ES]),
};

/** The Spanish cat hub: lilies first, then every plant by its ASPCA verdict for cats. */
export const CATS_HUB_ES: SpeciesHubEs = {
  path: hrefOf('plants-cats', 'es'),
  twin: CATS_HUB.path,
  title: `Plantas tóxicas para gatos: ${String(count(toCats))} de la lista de la ASPCA`,
  description: `Qué plantas son tóxicas para los gatos: ${String(PLANTS_ES.length)} plantas de interior y flores comparadas con la lista de la ASPCA, los lirios primero, con las partes y los signos.`,
  h1: 'Plantas tóxicas para gatos: los lirios primero, después las de interior',
  lead: `De las ${String(PLANTS_ES.length)} plantas por las que más se pregunta, el ASPCA Animal Poison Control Center incluye ${String(count(toCats))} entre las tóxicas para los gatos. Los lirios verdaderos y los lirios de día van primero: unos granos de polen lamidos del pelo pueden causarle a un gato una insuficiencia renal mortal, y a un perro no le hacen ese daño.`,
  checked: SOURCES_ES_CHECKED,
  readOn: readOnOf(HUB_SOURCES_ES),
  groups: [
    {
      id: 'toxicas',
      heading: 'Tóxicas para los gatos',
      intro:
        'La ficha de la ASPCA de cada una la incluye entre las plantas tóxicas para los gatos.',
      rows: rowsOf(toCats, noteOf),
    },
    {
      id: 'seguras',
      heading: 'No tóxicas para los gatos',
      intro:
        'La ficha de la ASPCA de cada una la incluye entre las plantas no tóxicas para los gatos.',
      rows: rowsOf((verdict) => !toCats(verdict), noteOf),
    },
  ],
  table: {
    heading: 'Cada planta, gato, perro y caballo, según su ficha de la ASPCA',
    paragraphs: [
      'Las tres columnas resumen la ficha de la ASPCA de cada planta, que está en inglés; «No figura» quiere decir que la ficha no dice nada de esa especie. Las partes y los signos están en la página de cada planta.',
    ],
    columns: ['Planta', 'Nombre científico', 'Gatos', 'Perros', 'Caballos'],
    rows: PLANTS_ES.map((es) => {
      const record = mainOf(es);
      return [
        es.name,
        record.scientific,
        cellOf(record, 'cats'),
        cellOf(record, 'dogs'),
        cellOf(record, 'horses'),
      ];
    }),
  },
  sections: [
    {
      id: 'lirios',
      heading: 'Por qué los lirios son la urgencia de los gatos',
      paragraphs: [
        'La FDA dice que toda la planta del lirio verdadero (Lilium) y del lirio de día (Hemerocallis) es tóxica para los gatos: el tallo, las hojas, las flores, el polen y hasta el agua del florero. Comer un trocito de hoja o de pétalo, lamer el polen del pelo o beber el agua del florero puede causar una insuficiencia renal mortal en menos de tres días.',
        'El Manual de veterinaria de MSD, en su edición en español, describe los signos entre 1 y 3 horas después de comerlo, signos de daño renal en las 12 a 30 horas siguientes y la muerte en un plazo de 3 a 7 días sin tratamiento. La FDA añade que, si el tratamiento se retrasa 18 horas o más, el daño renal suele ser irreversible. El espatifilo y el alcatraz no son lirios verdaderos: irritan la boca.',
      ],
    },
    {
      id: 'leves',
      heading: 'Tóxica no siempre quiere decir urgencia',
      paragraphs: [
        'La lista mezcla plantas de peligro muy distinto. La flor de Nochebuena, o los cristales de oxalato de una hoja de potus, sobre todo irritan la boca y el estómago; los lirios, la palma sago, la adelfa, la dedalera y el lirio de los valles pueden matar. Cada página nombra las partes y los signos que dan sus fuentes: lee la de tu planta y, si dudas, llama igualmente a tu veterinario.',
      ],
    },
  ],
  links: [DOGS_LINK_ES, SAFE_LINK_ES],
  sources: uniqueByUrl([...CATS_HUB.sources, ...HUB_SOURCES_ES]),
};

/** A row of the Spanish safe hub: one ASPCA entry non-toxic to cats and dogs. */
export interface SafeRowEs {
  readonly slug: string;
  readonly name: string;
  readonly entry: string;
  readonly scientific: string;
  readonly href: string;
}

const safeForBoth = (record: AspcaRecord): boolean =>
  listingOf(record, 'cats') === 'non-toxic' && listingOf(record, 'dogs') === 'non-toxic';

const SAFE_ROWS_ES: readonly SafeRowEs[] = ASPCA_RECORDS.filter(safeForBoth)
  .map((record) => {
    const own = PLANTS.find((plant) => plant.entries[0] === record.slug);
    const ownEs = own === undefined ? undefined : esOfId(own.id);
    return {
      slug: record.slug,
      name: capitalized(entryNameEsOf(record.slug).name),
      entry: record.name,
      scientific: record.scientific,
      href: ownEs === undefined ? aspcaUrlOf(record.slug) : plantPathEsOf(ownEs),
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name, 'es'));

/** The popular houseplants on the toxic list, from the English safe hub's warning list. */
const POPULAR_TOXIC_ES = SAFE_HUB.avoid.map(({ href }) => {
  const plant = PLANTS.find((each) => plantPathOf(each) === href);
  const es = plant === undefined ? undefined : esOfId(plant.id);
  if (es === undefined) throw new Error(`no Spanish plant for ${href}`);
  return { href: plantPathEsOf(es), name: es.name, note: es.summary };
});

/** The Spanish safe hub: the ASPCA's non-toxic plants, and the popular ones that are not. */
export const SAFE_HUB_ES = {
  path: hrefOf('plants-safe', 'es'),
  twin: SAFE_HUB.path,
  title: `Plantas seguras para perros y gatos: ${String(SAFE_ROWS_ES.length)} no tóxicas (ASPCA)`,
  description: `${String(SAFE_ROWS_ES.length)} plantas de interior que la ASPCA incluye entre las no tóxicas para perros y gatos, de la cinta a la orquídea, y las populares que no lo son.`,
  h1: 'Plantas seguras para perros y gatos: las no tóxicas de la lista de la ASPCA',
  lead: 'Cada planta de la tabla tiene una ficha del ASPCA Animal Poison Control Center que la incluye entre las no tóxicas para perros y para gatos. La ASPCA añade que comer cualquier planta puede hacer vomitar a un perro o a un gato: no tóxica quiere decir que no se espera que ponga su vida en peligro, no que sea un alimento.',
  checked: SOURCES_ES_CHECKED,
  readOn: readOnOf([]),
  rows: SAFE_ROWS_ES,
  avoid: POPULAR_TOXIC_ES,
  sections: [
    {
      id: 'que-quiere-decir',
      heading: 'Qué quiere decir no tóxica en la lista de la ASPCA',
      paragraphs: [
        'La lista de la ASPCA no pretende ser completa: reúne las plantas por las que más le preguntan. Advierte que comer cualquier materia vegetal puede causar vómitos y malestar de estómago en perros y gatos, y que de las plantas no tóxicas no se esperan efectos que pongan en peligro la vida.',
        'Los nombres engañan. La palmera bambú es segura y el bambú sagrado (nandina) es tóxico; el lirio de Pascua y el lirio tigre ponen en peligro a un gato y la alstroemeria, el lirio del Perú, está en la lista de seguras. Compara el nombre científico de la etiqueta con el de la ficha.',
      ],
    },
  ] satisfies readonly GuideSection[],
  links: [DOGS_LINK_ES, CATS_LINK_ES],
  sources: SAFE_HUB.sources,
};

/** Every Spanish plant page path, the hubs first, for the home and llms.txt. */
export const PLANT_PATHS_ES: readonly string[] = [
  DOGS_HUB_ES.path,
  CATS_HUB_ES.path,
  SAFE_HUB_ES.path,
  ...PLANT_PAGES_ES.map(({ path }) => path),
];
