import { POISON_LINE } from './calc/chocolate.ts';
import type { GuideQuestion, GuideSection, PageSource } from './guides.ts';
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
} from './plants/aspca.ts';
import { FLOWERS } from './plants/flowers.ts';
import { GARDEN } from './plants/garden.ts';
import { HOUSEPLANTS } from './plants/houseplants.ts';
import { SAFE } from './plants/safe.ts';
import { HELPLINE, P } from './plants/sources.ts';
import type { Plant } from './plants/types.ts';

/** Every plant of the "toxic to cats and dogs" pages: houseplants, cut flowers, the garden, the safe ones. */
export const PLANTS: readonly Plant[] = [...HOUSEPLANTS, ...FLOWERS, ...GARDEN, ...SAFE];

/** Which of the two species the ASPCA lists a plant as toxic to. */
export type PlantVerdict = 'both' | 'cats' | 'dogs' | 'neither';

/** The verdict of `plant`, read from its own ASPCA entry (the first it names), never written by hand. */
export const verdictOf = (plant: Plant): PlantVerdict => {
  const record = aspcaOf(plant.entries[0] ?? '');
  const cats = listingOf(record, 'cats') === 'toxic';
  const dogs = listingOf(record, 'dogs') === 'toxic';
  if (cats && dogs) return 'both';
  if (cats) return 'cats';
  if (dogs) return 'dogs';
  return 'neither';
};

const VERDICT_WORDS: Readonly<Record<PlantVerdict, string>> = {
  both: 'Yes',
  cats: 'To cats, yes',
  dogs: 'To dogs, yes',
  neither: 'No',
};

/** The note on every page that cites a toxic entry: both poison lines, and the veterinarian first. */
export const PLANT_CALL = `If your cat or dog ate part of a toxic plant, call your veterinarian, the ${POISON_LINE.name} at ${POISON_LINE.phone} or the ${HELPLINE.name} at ${HELPLINE.phone} now, even if your pet seems fine. Both lines answer 24 hours a day, and a fee may apply. Have the plant’s name, or a photo of it, and your pet’s weight ready. This page is not a substitute for your veterinarian.`;

/** The address of the page of `plant`: `/are-tulips-toxic-to-cats-and-dogs`. */
export const plantPathOf = (plant: Plant): string =>
  `/${plant.verb}-${plant.id}-toxic-to-cats-and-dogs`;

const capitalized = (text: string): string => text.replace(/^./, (first) => first.toUpperCase());

const SMALL_WORDS = new Set([
  'a',
  'an',
  'and',
  'as',
  'at',
  'for',
  'in',
  'of',
  'on',
  'or',
  'the',
  'to',
]);

const titleCase = (text: string): string =>
  text
    .split(' ')
    .map((word, index) =>
      index > 0 && SMALL_WORDS.has(word)
        ? word
        : word.replace(/^./, (first) => first.toUpperCase()),
    )
    .join(' ');

/** The words of an ASPCA name that stay capitalized inside a sentence. */
const PROPER = new Set([
  'African',
  'American',
  'Boston',
  'Christmas',
  'Easter',
  'English',
  'Gerber',
  'Indian',
  'Japanese',
  'Peruvian',
  'Swedish',
  'Swiss',
]);

/** An ASPCA name as a sentence writes it: `the tulip`, `the English ivy`, `the American mistletoe`. */
export const entryNameOf = (record: AspcaRecord): string => {
  if (record.slug === 'mistletoe-american') return 'American mistletoe';
  return record.name
    .split(' ')
    .map((word) => (PROPER.has(word) ? word : word.toLowerCase()))
    .join(' ');
};

const SPECIES_ORDER: readonly Species[] = ['dogs', 'cats', 'horses'];

const listed = (words: readonly string[]): string =>
  words.length < 2
    ? (words[0] ?? '')
    : `${words.slice(0, -1).join(', ')} and ${words.at(-1) ?? ''}`;

const listedOr = (words: readonly string[]): string =>
  words.length < 2 ? (words[0] ?? '') : `${words.slice(0, -1).join(', ')} or ${words.at(-1) ?? ''}`;

/** What the ASPCA lists for `record`, species by species, as one sentence. */
const aspcaSentenceOf = (record: AspcaRecord): string => {
  const of = (listing: Listing) =>
    SPECIES_ORDER.filter((species) => listingOf(record, species) === listing);
  const toxic = of('toxic');
  const safe = of('non-toxic');
  const missing = of('not-listed');
  const parts = [
    ...(toxic.length > 0 ? [`toxic to ${listed(toxic)}`] : []),
    ...(safe.length > 0 ? [`non-toxic to ${listed(safe)}`] : []),
  ];
  const as = parts.length === 2 ? `${parts[0] ?? ''}, and ${parts[1] ?? ''}` : (parts[0] ?? '');
  const tail = missing.length > 0 ? `; its entry does not name ${listedOr(missing)}` : '';
  return `The ASPCA Animal Poison Control Center lists the ${entryNameOf(record)} (${record.scientific}) as ${as}${tail}.`;
};

const CELLS: Readonly<Record<Listing, string>> = {
  toxic: 'Toxic',
  'non-toxic': 'Non-toxic',
  'not-listed': 'Not listed',
};

/** The cell of a table for what an entry says of `species`. */
const cellOf = (record: AspcaRecord, species: Species): string => CELLS[listingOf(record, species)];

/** The ASPCA answer to "is it toxic to `species`?" for the plant's own entry. */
const answerFor = (plant: Plant, record: AspcaRecord, species: 'cats' | 'dogs'): string => {
  const name = `the ${entryNameOf(record)} (${record.scientific})`;
  const listing = listingOf(record, species);
  if (listing === 'toxic')
    return `Yes. The ASPCA lists ${name} as toxic to ${species}.${record.signs === undefined ? '' : ` The signs its entry names: ${record.signs}`}`;
  if (listing === 'non-toxic') return `No. The ASPCA lists ${name} as non-toxic to ${species}.`;
  const other = species === 'cats' ? 'dogs' : 'cats';
  return `The ASPCA does not list ${name} for ${species} either way: its entry names ${listingOf(record, other) === 'not-listed' ? 'neither species' : other} only. Ask your veterinarian before you count ${plant.name} as safe for a ${species === 'dogs' ? 'dog' : 'cat'}.`;
};

/** The table of a plant page: every ASPCA entry it cites, word for word. */
export interface PlantTable {
  readonly heading: string;
  readonly paragraphs: readonly string[];
  readonly columns: readonly string[];
  readonly rows: readonly (readonly string[])[];
}

/** A link of a page. */
export interface PlantLink {
  readonly href: string;
  readonly label: string;
}

/** A "toxic to cats and dogs" page, answered first from the ASPCA entry. */
export interface PlantPage {
  readonly id: string;
  readonly path: string;
  readonly verdict: PlantVerdict;
  readonly title: string;
  readonly description: string;
  readonly h1: string;
  readonly lead: string;
  readonly checked: string;
  readonly callNow: boolean;
  readonly table: PlantTable;
  /** The sections after the table, in page order. */
  readonly sections: readonly GuideSection[];
  /** Plants the ASPCA lists as non-toxic to cats and dogs, linked to their page or their entry. */
  readonly alternatives: readonly PlantLink[];
  readonly questions: readonly GuideQuestion[];
  /** Other plants of the same verdict. */
  readonly related: readonly PlantLink[];
  /** The hubs. */
  readonly links: readonly PlantLink[];
  readonly sources: readonly PageSource[];
}

const uniqueByUrl = (sources: readonly PageSource[]): PageSource[] =>
  sources.filter((source, index) => sources.findIndex(({ url }) => url === source.url) === index);

const isToxicEntry = (slug: string): boolean =>
  (['cats', 'dogs'] as const).some((species) => listingOf(aspcaOf(slug), species) === 'toxic');

const questionOf = (plant: Plant): string =>
  `${capitalized(plant.verb)} ${plant.name} toxic to cats and dogs?`;

const titleOf = (plant: Plant, word: string): string => {
  const question = titleCase(questionOf(plant));
  const candidates = [
    `${question} ${word}: ${titleCase(plant.answer)} | Bowl Figures`,
    `${question} ${word}: ${titleCase(plant.answer)}`,
    ...(plant.short === undefined
      ? []
      : [
          `${question} ${word}: ${titleCase(plant.short)} | Bowl Figures`,
          `${question} ${word}: ${titleCase(plant.short)}`,
        ]),
    `${question} ${word}`,
  ];
  return candidates.find((candidate) => candidate.length <= 65) ?? question;
};

const DESCRIPTION_TAILS: Readonly<Record<PlantVerdict, string>> = {
  both: 'Parts, signs and what to do, from the ASPCA list.',
  cats: 'Cats and dogs apart, the signs and what to do now.',
  dogs: 'Dogs and cats apart, the signs and what to do now.',
  neither: 'The ASPCA entry and other safe plants.',
};

const descriptionOf = (plant: Plant, verdict: PlantVerdict): string => {
  const full = `${plant.summary} ${DESCRIPTION_TAILS[verdict]}`;
  return full.length <= 160 ? full : plant.summary;
};

const CATS_LINK: PlantLink = {
  href: '/plants-toxic-to-cats',
  label: 'Plants toxic to cats: the full list',
};
const DOGS_LINK: PlantLink = {
  href: '/plants-toxic-to-dogs',
  label: 'Plants toxic to dogs: the full list',
};
const SAFE_LINK: PlantLink = {
  href: '/pet-safe-houseplants',
  label: 'Pet-safe houseplants on the ASPCA list',
};
const FOODS_LINK: PlantLink = {
  href: '/can-dogs-eat',
  label: 'Can dogs eat it? Human foods by verdict',
};

/** The hubs every plant page links. */
export const HUB_LINKS: readonly PlantLink[] = [CATS_LINK, DOGS_LINK, SAFE_LINK];

/** How many plants of the same verdict a page links. */
const RELATED = 8;

const pageOf = (plant: Plant): PlantPage => {
  const verdict = verdictOf(plant);
  const word = VERDICT_WORDS[verdict];
  const records = plant.entries.map(aspcaOf);
  const main = records[0];
  if (main === undefined) throw new Error(`${plant.id} names no ASPCA entry`);
  const toxic = verdict !== 'neither';
  const callNow = plant.entries.some(isToxicEntry);
  const is = plant.verb;
  const sections: GuideSection[] = [
    {
      id: 'parts',
      heading: toxic
        ? `Which parts of ${plant.name} are toxic`
        : `Is any part of ${plant.name} a problem?`,
      paragraphs: [
        plant.parts,
        ...(plant.grade === undefined
          ? []
          : [`${plant.grade.by} grades it: ${plant.grade.level}.`]),
      ],
    },
    {
      id: 'why',
      heading: toxic ? `Why ${plant.name} ${is} toxic` : `Why ${plant.name} ${is} on the safe list`,
      paragraphs: plant.why,
    },
    {
      id: 'signs',
      heading: toxic
        ? `Signs after a pet eats ${plant.name}, and when`
        : `What a pet that chewed ${plant.name} may show`,
      paragraphs: plant.signs,
    },
    {
      id: 'act',
      heading: toxic ? `If your cat or dog ate ${plant.name}` : `If your pet chewed ${plant.name}`,
      paragraphs: plant.act,
    },
    ...(plant.disagree === undefined
      ? []
      : [
          {
            id: 'disagree',
            heading: 'Where the sources differ, or the names mix up',
            paragraphs: plant.disagree,
          },
        ]),
  ];
  // the eight plants of the same verdict that follow this one, so each page links a different set
  const same = PLANTS.filter((other) => verdictOf(other) === verdict);
  const at = same.indexOf(plant);
  const related = [...same.slice(at + 1), ...same.slice(0, at)]
    .slice(0, RELATED)
    .map((other) => ({ href: plantPathOf(other), label: capitalized(other.name) }));
  return {
    id: plant.id,
    path: plantPathOf(plant),
    verdict,
    title: titleOf(plant, word),
    description: descriptionOf(plant, verdict),
    h1: `${questionOf(plant)} ${word}: ${plant.answer}`,
    lead: `${word}: ${plant.answer}. ${plant.summary} ${aspcaSentenceOf(main)}`,
    checked: PLANTS_CHECKED,
    callNow,
    table: {
      heading:
        records.length > 1
          ? `What the ASPCA lists for ${plant.name} and the plants sold under the same names`
          : `What the ASPCA entry for ${plant.name} says`,
      paragraphs: [
        `Copied word for word from ${records.length > 1 ? `the ${String(records.length)} ASPCA entries` : 'the ASPCA entry'}, read on the day under the title. “Not listed” means the entry names that species neither way.`,
      ],
      columns: [
        'Plant',
        'Scientific name',
        'Cats',
        'Dogs',
        'Horses',
        'Toxic principle',
        'Clinical signs (ASPCA)',
      ],
      rows: records.map((record) => [
        record.name,
        record.scientific,
        cellOf(record, 'cats'),
        cellOf(record, 'dogs'),
        cellOf(record, 'horses'),
        record.principles ?? 'Not given',
        record.signs ?? 'Not given',
      ]),
    },
    sections,
    alternatives: plant.alternatives.map((slug) => {
      const own = PLANTS.find((other) => other.entries[0] === slug);
      return {
        href: own === undefined ? aspcaUrlOf(slug) : plantPathOf(own),
        label: aspcaOf(slug).name,
      };
    }),
    questions: [
      {
        question: `${capitalized(is)} ${plant.name} toxic to cats?`,
        answer: answerFor(plant, main, 'cats'),
      },
      {
        question: `${capitalized(is)} ${plant.name} toxic to dogs?`,
        answer: answerFor(plant, main, 'dogs'),
      },
      ...plant.questions,
    ],
    related,
    links: [...HUB_LINKS, FOODS_LINK],
    sources: uniqueByUrl([
      ...records.map(aspcaSourceOf),
      ...plant.sources,
      ...(callNow ? [P.aspcaLine, P.helpline] : []),
      P.aspcaList,
    ]),
  };
};

/** One page per plant. */
export const PLANT_PAGES: readonly PlantPage[] = PLANTS.map(pageOf);

/** The plant page at `path`. */
export const plantPageOf = (path: string): PlantPage => {
  const found = PLANT_PAGES.find((candidate) => candidate.path === path);
  if (found === undefined) throw new Error(`no plant page ${path}`);
  return found;
};

/** A row of a hub's list: the page, the name and a line about it. */
export interface HubRow {
  readonly href: string;
  readonly name: string;
  readonly note: string;
}

/** A group of a hub: the plants of one verdict for the hub's species. */
export interface HubGroup {
  readonly id: 'toxic' | 'cats-only' | 'dogs-only' | 'safe';
  readonly heading: string;
  readonly intro: string;
  readonly rows: readonly HubRow[];
}

/** A species hub: every plant page, grouped by the ASPCA verdict for that species. */
export interface SpeciesHub {
  readonly path: string;
  readonly title: string;
  readonly description: string;
  readonly h1: string;
  readonly lead: string;
  readonly checked: string;
  readonly groups: readonly HubGroup[];
  readonly table: PlantTable;
  readonly sections: readonly GuideSection[];
  readonly links: readonly PlantLink[];
  readonly sources: readonly PageSource[];
}

const byName = (a: HubRow, b: HubRow): number => a.name.localeCompare(b.name);

const mainOf = (plant: Plant): AspcaRecord => aspcaOf(plant.entries[0] ?? '');

const rowsOf = (keep: (verdict: PlantVerdict) => boolean, note: (plant: Plant) => string) =>
  PLANTS.filter((plant) => keep(verdictOf(plant)))
    .map((plant) => ({
      href: plantPathOf(plant),
      name: capitalized(plant.name),
      note: note(plant),
    }))
    .sort(byName);

const count = (keep: (verdict: PlantVerdict) => boolean): number =>
  PLANTS.filter((plant) => keep(verdictOf(plant))).length;

const toCats = (verdict: PlantVerdict) => verdict === 'both' || verdict === 'cats';
const toDogs = (verdict: PlantVerdict) => verdict === 'both' || verdict === 'dogs';

/** The cat hub: every plant by its verdict for cats, and the whole sourced table. */
export const CATS_HUB: SpeciesHub = {
  path: '/plants-toxic-to-cats',
  title: `Plants Toxic to Cats: ${String(count(toCats))} on the ASPCA List | Bowl Figures`,
  description: `Which plants are toxic to cats: ${String(PLANTS.length)} houseplants and flowers checked against the ASPCA list, lilies first, with the parts and the signs.`,
  h1: 'Plants toxic to cats: lilies first, then the houseplants',
  lead: `Of the ${String(PLANTS.length)} plants people ask about most, the ASPCA Animal Poison Control Center lists ${String(count(toCats))} as toxic to cats. True lilies and daylilies come first: a few pollen grains licked from the fur can cause fatal kidney failure in a cat, and a dog is not harmed by them at all.`,
  checked: PLANTS_CHECKED,
  groups: [
    {
      id: 'toxic',
      heading: 'Toxic to cats',
      intro: 'The ASPCA entry of each plant lists it as toxic to cats.',
      rows: rowsOf(
        toCats,
        (plant) => `${VERDICT_WORDS[verdictOf(plant)].toLowerCase()}, ${plant.answer}`,
      ),
    },
    {
      id: 'safe',
      heading: 'Not toxic to cats',
      intro: 'The ASPCA entry lists each as non-toxic to cats.',
      rows: rowsOf(
        (verdict) => !toCats(verdict),
        (plant) => `${VERDICT_WORDS[verdictOf(plant)].toLowerCase()}, ${plant.answer}`,
      ),
    },
  ],
  table: {
    heading: 'Every plant, what the ASPCA lists, and which parts',
    paragraphs: [
      'The cat and dog columns are copied from the ASPCA entry of each plant, read on the day under the title; the parts come from the sources each plant page cites.',
    ],
    columns: [
      'Plant',
      'ASPCA entry',
      'Scientific name',
      'Cats',
      'Dogs',
      'Toxic principle',
      'Which parts',
    ],
    rows: PLANTS.map((plant) => {
      const record = mainOf(plant);
      return [
        capitalized(plant.name),
        record.name,
        record.scientific,
        cellOf(record, 'cats'),
        cellOf(record, 'dogs'),
        record.principles ?? 'Not given',
        plant.parts,
      ];
    }),
  },
  sections: [
    {
      id: 'lilies',
      heading: 'Why lilies are the emergency for cats',
      paragraphs: [
        'The FDA says the whole true lily (Lilium) and daylily (Hemerocallis) plant is toxic to cats: the stem, leaves, flowers, pollen and even the water in the vase. Eating a small piece of a leaf or petal, licking pollen off the fur, or drinking the vase water can cause fatal kidney failure in less than three days.',
        'The FDA adds that if treatment is delayed by 18 hours or more, the cat will generally have irreversible kidney failure, and ASPCApro tells veterinarians that any cat exposed to a true lily should be on IV fluids for 48 hours. Peace lilies and calla lilies are not true lilies: they irritate the mouth instead.',
      ],
    },
    {
      id: 'mild',
      heading: 'Toxic is not always an emergency',
      paragraphs: [
        'The list mixes plants of very different danger. A poinsettia, or the oxalate crystals of a pothos leaf, mostly irritate the mouth and stomach; lilies, sago palms, oleander, foxglove and lily of the valley can kill. Each plant page names the parts and the signs its sources give, so read the one for your plant, and call either way when in doubt.',
      ],
    },
  ],
  links: [DOGS_LINK, SAFE_LINK],
  sources: [P.aspcaCats, P.aspcaList, P.fdaLilies, P.aspcaProLilies, P.aspcaLine, P.helpline],
};

/** The dog hub: every plant by its verdict for dogs, outdoor dangers first. */
export const DOGS_HUB: SpeciesHub = {
  path: '/plants-toxic-to-dogs',
  title: `Plants Toxic to Dogs: ${String(count(toDogs))} on the ASPCA List | Bowl Figures`,
  description: `Which plants are toxic to dogs: sago palm, bulbs, oleander and ${String(count(toDogs) - 3)} more on the ASPCA list, the plants only cats react to, and the safe ones.`,
  h1: 'Plants toxic to dogs: sago palms, bulbs and the yard first',
  lead: `Of the ${String(PLANTS.length)} plants on these pages, the ASPCA Animal Poison Control Center lists ${String(count(toDogs))} as toxic to dogs. Dogs dig and chew outdoors, so the garden matters as much as the windowsill: the sago palm, a dug-up bulb and an oleander hedge are the ones that can be deadly.`,
  checked: PLANTS_CHECKED,
  groups: [
    {
      id: 'toxic',
      heading: 'Toxic to dogs',
      intro:
        'The ASPCA entry of each plant lists it as toxic to dogs; the line gives its toxic principle.',
      rows: rowsOf(
        toDogs,
        (plant) => `toxic principle: ${mainOf(plant).principles ?? 'not given by the ASPCA'}`,
      ),
    },
    {
      id: 'cats-only',
      heading: 'Toxic to cats, but not listed as toxic to dogs',
      intro:
        'The ASPCA lists these as toxic to cats only. Keep them away from a cat in the same house all the same.',
      rows: rowsOf(
        (verdict) => verdict === 'cats',
        (plant) => `dogs: ${cellOf(mainOf(plant), 'dogs').toLowerCase()} on the ASPCA entry`,
      ),
    },
    {
      id: 'safe',
      heading: 'Non-toxic to dogs',
      intro: 'The ASPCA lists each as non-toxic to dogs and cats.',
      rows: rowsOf(
        (verdict) => verdict === 'neither',
        (plant) => mainOf(plant).scientific,
      ),
    },
  ],
  table: {
    heading: 'The signs the ASPCA names in dogs, plant by plant',
    paragraphs: [
      'The clinical signs of each ASPCA entry that lists the plant as toxic to dogs, copied word for word.',
    ],
    columns: ['Plant', 'ASPCA entry', 'Dogs', 'Clinical signs (ASPCA)'],
    rows: PLANTS.filter((plant) => toDogs(verdictOf(plant))).map((plant) => {
      const record = mainOf(plant);
      return [
        capitalized(plant.name),
        record.name,
        cellOf(record, 'dogs'),
        record.signs ?? 'Not given',
      ];
    }),
  },
  sections: [
    {
      id: 'sago',
      heading: 'The sago palm is the one to dig out',
      paragraphs: [
        'Pet Poison Helpline says any part of a sago palm can poison a dog, the seed (or nut) above all, and that its cycasin can cause liver failure and death. The Merck Veterinary Manual cites studies in which only half to about two thirds of dogs with confirmed cycad poisoning survived.',
      ],
    },
    {
      id: 'bulbs',
      heading: 'Bulbs and the yard',
      paragraphs: [
        'The ASPCA entries for tulips and daffodils both say the bulb holds the most toxin, which is why a dog that digs up a bed is at more risk than one that nibbles a cut flower. Oleander, foxglove and lily of the valley carry heart toxins in the whole plant.',
      ],
    },
  ],
  links: [CATS_LINK, SAFE_LINK, FOODS_LINK],
  sources: [P.aspcaDogs, P.aspcaList, P.pphSago, P.merckCycad, P.aspcaLine, P.helpline],
};

/** A row of the safe hub: one ASPCA entry non-toxic to cats and dogs. */
export interface SafeRow {
  readonly slug: string;
  readonly name: string;
  readonly scientific: string;
  readonly otherNames: string;
  readonly href: string;
}

const safeForBoth = (record: AspcaRecord): boolean =>
  listingOf(record, 'cats') === 'non-toxic' && listingOf(record, 'dogs') === 'non-toxic';

/** The ASPCA entries non-toxic to both, linked to their page where they have one. */
const SAFE_ROWS: readonly SafeRow[] = ASPCA_RECORDS.filter(safeForBoth).map((record) => {
  const own = PLANTS.find((plant) => plant.entries[0] === record.slug);
  return {
    slug: record.slug,
    name: record.name,
    scientific: record.scientific,
    otherNames: record.otherNames ?? '',
    href: own === undefined ? aspcaUrlOf(record.slug) : plantPathOf(own),
  };
});

/** The houseplants people buy that are on the toxic list, for the safe hub's warning list. */
const POPULAR_TOXIC: readonly string[] = [
  'pothos',
  'monstera',
  'snake-plants',
  'peace-lilies',
  'philodendrons',
  'aloe-vera',
  'jade-plants',
  'dracaena',
];

/** The safe hub: the ASPCA's non-toxic plants, and the popular ones that are not. */
export const SAFE_HUB = {
  path: '/pet-safe-houseplants',
  title: `Pet-Safe Houseplants: ${String(SAFE_ROWS.length)} Non-Toxic to Cats and Dogs`,
  description: `${String(SAFE_ROWS.length)} houseplants the ASPCA lists as non-toxic to both cats and dogs, from spider plants to orchids, and the popular ones that are not safe.`,
  h1: 'Pet-safe houseplants: non-toxic to cats and dogs on the ASPCA list',
  lead: `Every plant below has an ASPCA Animal Poison Control Center entry that lists it as non-toxic to dogs and to cats. The ASPCA adds that eating any plant can still make a dog or a cat vomit, so non-toxic means not expected to be life-threatening, not a food.`,
  checked: PLANTS_CHECKED,
  rows: SAFE_ROWS,
  avoid: POPULAR_TOXIC.map((id) => {
    const plant = PLANTS.find((each) => each.id === id);
    if (plant === undefined) throw new Error(`no plant ${id}`);
    return { href: plantPathOf(plant), name: capitalized(plant.name), note: plant.summary };
  }),
  sections: [
    {
      id: 'what-safe-means',
      heading: 'What non-toxic means on the ASPCA list',
      paragraphs: [
        'The ASPCA list is not meant to be all-inclusive: it compiles the plants it is asked about most. It warns that eating any plant material may cause vomiting and stomach upset in dogs and cats, and that plants listed as non-toxic are not expected to be life-threatening.',
        'Names mislead. A bamboo palm is safe, while heavenly bamboo is toxic; Easter and tiger lilies endanger cats, while the Peruvian lily is on the safe list. Check the scientific name on the label against the entry.',
      ],
    },
  ] satisfies readonly GuideSection[],
  links: [CATS_LINK, DOGS_LINK],
  sources: [P.aspcaList, P.aspcaCats, P.aspcaDogs],
};
