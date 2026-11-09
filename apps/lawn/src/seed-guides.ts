import { seedRateOf, type SeedSource, type SeedSpecies } from '@maestro-calc/lawn-core/grass-seed';
import { CALENDAR_STATES, seedStatePathOf, ZONE_INDEX_PATH } from './calendar-paths.ts';
import { fieldText } from './format.ts';
import type { Guide } from './guide.ts';
import {
  AGRILIFE,
  ARKANSAS,
  BEST_SEED_LINK,
  GROWING_LINK,
  NC_STATE,
  NOAA,
  PURDUE_FINE_FESCUE,
  PURDUE_SEED,
  READ,
  SEED_CALCULATOR,
  ST_AUGUSTINE,
  TENNESSEE,
  TURFFILES,
  UK_LINK,
  VIRGINIA,
} from './seed-sources.ts';
import { viewOf } from './view.ts';

/** A seeding rate of the calculator data as a page prints it: `4 to 6 lb per 1,000 sq ft`. */
export const seedRateText = (species: SeedSpecies, source: SeedSource): string => {
  const [low, high] = seedRateOf(species, source);
  return `${fieldText(low)} to ${fieldText(high)} lb per 1,000 sq ft`;
};

/** The pounds the grass seed calculator gives a lawn of `area` sq ft: `10.0 to 15.0 lb`. */
export const seedPoundsText = (species: SeedSpecies, source: SeedSource, area: number): string => {
  const pounds = viewOf('grass-seed', { area: String(area), species, source })?.values['pounds'];
  if (pounds === undefined) throw new Error(`no seed figure for ${species} on ${String(area)}`);
  return `${pounds.replace('–', ' to ')} lb`;
};

/** A guide to the seed of one grass: the calculator species whose rates it prints. */
export interface SpeciesGuide extends Guide {
  readonly species: readonly SeedSpecies[];
}

/** The lawn the pages work their pounds for. */
const LAWN = 5000;

/** When to plant grass seed: the windows and temperatures of the extension sources, and your frost dates. */
export const PLANTING_GUIDE: Guide = {
  id: 'planting-guide',
  path: '/when-to-plant-grass-seed',
  title: 'When to Plant Grass Seed: Fall or Spring? | Lawn Figures',
  description:
    'Cool-season grass seed in late summer to early fall, warm-season seed in late spring to early summer, with the temperatures five extension services give.',
  h1: 'When to plant grass seed',
  lead: 'Plant cool-season grass seed (tall fescue, Kentucky bluegrass, ryegrass) in late summer to early fall, and warm-season seed (bermudagrass, zoysiagrass) in late spring to early summer, once the soil is warm. That is what every extension publication cited below says; the exact weeks depend on where you live.',
  checked: READ,
  sections: [
    {
      id: 'cool-season',
      heading: 'Cool-season grasses: late summer to early fall',
      paragraphs: [
        'Purdue Extension calls late summer to early fall the best time to seed a cool-season turfgrass. In the northern half of Indiana and Illinois its optimum is August 15 to September 15, and in the southern half September 1 to September 30. It adds that waiting one week to seed may mean the stand takes 2 to 4 more weeks to mature.',
        'Virginia Cooperative Extension says the same and gives the reason: early spring seedings are prone to crabgrass invasions and summer drought. NC State Extension gives mid August to early October for North Carolina, depending on location.',
      ],
      items: [
        'Northern Virginia Piedmont, Blue Ridge and west: August 15 to September 15, or March to early April.',
        'Southern Virginia Piedmont and Eastern Virginia: September 1 to October 15, or February and March.',
        'Dormant seeding in Indiana and Illinois (Purdue): as early as Thanksgiving and as late as March.',
      ],
    },
    {
      id: 'warm-season',
      heading: 'Warm-season grasses: late spring to early summer',
      paragraphs: [
        'Texas A&M AgriLife Extension says warm-season grass seed germinates best at 70°F to 95°F, so late spring to early summer is the best time to seed bermudagrass. Virginia Cooperative Extension puts the warm-season window at May to July, and does not recommend seeding bermudagrass in the northern Piedmont and the mountains at all.',
        'Zoysiagrass wants the soil itself warm: the University of Arkansas seeds it when the soil surface first reaches 68°F to 72°F, which in Arkansas is late May, and gives May 15 to July 1 as the window there.',
      ],
    },
    {
      id: 'temperatures',
      heading: 'The temperatures behind the dates',
      paragraphs: [
        'The calendar windows stand in for temperature. These are the figures the sources print, and whether each is air or soil:',
      ],
      items: [
        'Cool-season seed: air cycling between about 59°F and 82°F favors rapid germination (University of Tennessee).',
        'Tall fescue: 68°F to 77°F air and soil temperature above 60°F (NC State TurfFiles).',
        'Warm-season seed: air from 68°F to 95°F (University of Tennessee); 70°F to 95°F (Texas A&M AgriLife).',
        'Zoysiagrass: soil surface at 68°F to 72°F (University of Arkansas).',
      ],
    },
    {
      id: 'your-frost-dates',
      heading: 'Placing the windows on your frost dates',
      paragraphs: [
        'None of the extension publications read for this page ties new-lawn seeding to a number of weeks before the first fall frost, so this page gives no such rule. The one frost-based rule found is for overseeding a warm-season lawn with ryegrass for winter color: Texas A&M AgriLife says that is typically done about 5 to 8 weeks before the expected first frost date.',
        'What the frost dates do tell you is how your place compares with the regions the sources describe. A first fall freeze in early October gives a short fall for cool-season seed to establish; a last spring freeze in April leaves May to July warm enough for bermudagrass and zoysiagrass. Our frost pages give the NOAA 1991-2020 dates of every station, and the ZIP lookup finds the nearest one.',
      ],
      links: [
        { href: '/frost-dates', label: 'Frost dates by ZIP code and state' },
        { href: '/frost-dates/illinois', label: 'Illinois frost dates (Chicago)' },
        { href: '/frost-dates/washington', label: 'Washington frost dates (Seattle)' },
        { href: '/frost-dates/north-carolina', label: 'North Carolina frost dates (Raleigh)' },
        { href: '/frost-dates/texas', label: 'Texas frost dates' },
      ],
    },
    {
      id: 'states',
      heading: 'By state and by zone',
      paragraphs: [
        'For the 20 states below, a page gives what the state’s own extension service says and the latest seeding dates worked out zone by zone from its NOAA stations. The planting zone pages do the same for each USDA half zone.',
      ],
      links: [
        ...CALENDAR_STATES.map(({ slug, name }) => ({
          href: seedStatePathOf(slug),
          label: `When to plant grass seed in ${name}`,
        })),
        { href: ZONE_INDEX_PATH, label: 'USDA planting zones' },
      ],
    },
    {
      id: 'uk-and-germination',
      heading: 'In the UK, and how long the seed takes',
      paragraphs: [
        'The windows above are for the United States. For a UK lawn, sown by the gram per square metre, the UK page gives the RHS windows, the soil temperature to wait for, the rates of a UK seed supplier and the Met Office months. How long the seed takes to come up, grass by grass, and when to mow it first have a page of their own.',
      ],
      links: [UK_LINK, GROWING_LINK],
    },
    {
      id: 'st-augustine',
      heading: 'St. Augustinegrass is not grown from seed',
      paragraphs: [
        'Texas A&M AgriLife Extension says St. Augustinegrass is established vegetatively using sod, sprigs and plugs, and that seed is currently not available. NC State Extension says the same. Plan a St. Augustine lawn by the square foot of sod instead of the pound of seed.',
      ],
      links: [
        { href: '/st-augustine-grass-seed', label: 'St. Augustine grass: sod and plugs' },
        { href: '/sod-calculator', label: 'Sod calculator' },
      ],
    },
    {
      id: 'how-much',
      heading: 'How much seed to buy',
      paragraphs: [
        'The grass seed calculator gives the pounds for your lawn at the rates of Virginia Cooperative Extension and the University of Tennessee, half sown in each direction. The species pages give each rate and what sets that grass apart.',
      ],
      links: [
        SEED_CALCULATOR,
        { href: '/bermuda-grass-seed', label: 'Bermuda grass seed' },
        { href: '/zoysia-grass-seed', label: 'Zoysia grass seed' },
        { href: '/tall-fescue-grass-seed', label: 'Tall fescue grass seed' },
        { href: '/perennial-ryegrass-seed', label: 'Perennial ryegrass seed' },
        { href: '/kentucky-bluegrass-seed', label: 'Kentucky bluegrass seed' },
        { href: '/fescue-grass-seed', label: 'Fescue grass seed: fine or tall' },
        { href: '/centipede-grass-seed', label: 'Centipede grass seed' },
        { href: '/buffalo-grass-seed', label: 'Buffalo grass seed' },
        BEST_SEED_LINK,
      ],
    },
  ],
  questions: [
    {
      question: 'What is the best month to plant grass seed?',
      answer:
        'For cool-season grasses, late August through September in most of the North and the Mid-Atlantic (Purdue, Virginia Cooperative Extension), into early October in North Carolina (NC State). For warm-season grasses, May to July (Virginia Cooperative Extension).',
    },
    {
      question: 'Can I plant grass seed in the spring?',
      answer:
        'Cool-season seed can go down in early spring, but Virginia Cooperative Extension says spring seedings are prone to crabgrass and summer drought, so late summer is better. Spring into early summer is the right time for warm-season seed.',
    },
    {
      question: 'How warm does the soil need to be?',
      answer:
        'NC State TurfFiles gives soil above 60°F for tall fescue, and the University of Arkansas gives a soil surface of 68°F to 72°F for zoysiagrass. The other sources give air temperatures.',
    },
  ],
  sources: {
    purdue: PURDUE_SEED,
    virginia: VIRGINIA,
    ncState: NC_STATE,
    turffiles: TURFFILES,
    tennessee: TENNESSEE,
    agrilife: AGRILIFE,
    arkansas: ARKANSAS,
    stAugustine: ST_AUGUSTINE,
    noaa: NOAA,
  },
  calculators: ['/grass-seed-calculator'],
  card: {
    title: 'When to plant grass seed',
    summary:
      'Fall for cool-season grasses, late spring for warm-season ones, with the temperatures of five extension services.',
  },
};

const BERMUDA: SpeciesGuide = {
  id: 'bermuda-seed',
  path: '/bermuda-grass-seed',
  species: ['bermudagrass-hulled', 'bermudagrass-unhulled'],
  title: 'Bermuda Grass Seed: Rate and When to Plant | Lawn Figures',
  description:
    'How much bermudagrass seed per 1,000 sq ft, hulled or unhulled, when to sow it and how long it takes to come up, from three extension services.',
  h1: 'Bermuda grass seed: how much and when',
  lead: `Sow hulled bermudagrass seed at ${seedRateText('bermudagrass-hulled', 'virginia-tech')} (Virginia Cooperative Extension) or ${seedRateText('bermudagrass-hulled', 'tennessee')} (University of Tennessee), in late spring to early summer once it is warm. Unhulled seed needs a much heavier rate and comes up more slowly.`,
  checked: READ,
  sections: [
    {
      id: 'rate',
      heading: 'Seeding rate: hulled or unhulled',
      paragraphs: [
        'Bermudagrass seed is sold hulled (the husk removed, so it takes up water fast) or unhulled. The two extension tables disagree on the hulled rate by half, so the calculator lets you pick the source.',
      ],
      items: [
        `Hulled, Virginia Cooperative Extension: ${seedRateText('bermudagrass-hulled', 'virginia-tech')}.`,
        `Hulled, University of Tennessee: ${seedRateText('bermudagrass-hulled', 'tennessee')}; Texas A&M AgriLife prints the same.`,
        `Unhulled, Virginia Cooperative Extension: ${seedRateText('bermudagrass-unhulled', 'virginia-tech')}.`,
        `Unhulled, University of Tennessee: double the hulled rate, ${seedRateText('bermudagrass-unhulled', 'tennessee')}.`,
      ],
      links: [SEED_CALCULATOR],
    },
    {
      id: 'when',
      heading: 'When to sow it',
      paragraphs: [
        'Texas A&M AgriLife says warm-season seed germinates best between 70°F and 95°F, which makes late spring to early summer the time for bermudagrass. Virginia Cooperative Extension gives late May to July 15 for hulled seed in the southern Piedmont and Eastern Virginia, and late fall or winter before the growing season for unhulled seed, which waits in the soil until it warms. It does not recommend seeding bermudagrass in the northern Piedmont, the Blue Ridge or west of it.',
      ],
    },
    {
      id: 'germination',
      heading: 'How long it takes to come up',
      paragraphs: [
        'The University of Tennessee gives 10 to 20 days for hulled common bermudagrass, and says unhulled seed often needs 14 to 21 days or longer. Keep the surface moist through that whole stretch.',
      ],
    },
    {
      id: 'site',
      heading: 'Where it does well',
      paragraphs: [
        'NC State Extension says bermudagrass establishes quickly and withstands wear and traffic, but does not tolerate shade. Under trees, a shade-tolerant grass is the better choice; Texas A&M AgriLife calls St. Augustinegrass the most shade-tolerant warm-season grass, but it still needs 4 to 6 hours of light a day and is planted as sod, sprigs or plugs, not seed.',
      ],
    },
  ],
  questions: [
    {
      question: 'How much bermuda grass seed do I need for 1,000 square feet?',
      answer: `For hulled seed, ${seedRateText('bermudagrass-hulled', 'virginia-tech')} by Virginia Cooperative Extension, or ${seedRateText('bermudagrass-hulled', 'tennessee')} by the University of Tennessee. Unhulled seed takes more: ${seedRateText('bermudagrass-unhulled', 'virginia-tech')} by Virginia.`,
    },
    {
      question: 'Can I plant bermuda seed in the fall?',
      answer:
        'Hulled seed, no: it needs warm weather to germinate. Virginia Cooperative Extension sows unhulled seed in late fall or winter so it is in place when the soil warms.',
    },
  ],
  sources: {
    virginia: VIRGINIA,
    tennessee: TENNESSEE,
    agrilife: AGRILIFE,
    ncState: NC_STATE,
    stAugustine: ST_AUGUSTINE,
  },
  calculators: ['/grass-seed-calculator'],
  card: {
    title: 'Bermuda grass seed',
    summary: 'Hulled and unhulled rates, the warm window to sow it and days to germinate.',
  },
};

const ZOYSIA: SpeciesGuide = {
  id: 'zoysia-seed',
  path: '/zoysia-grass-seed',
  species: ['zoysiagrass'],
  title: 'Zoysia Grass Seed: Rate, Soil Temperature, Timing | Lawn Figures',
  description:
    'Zoysiagrass seed at 1 to 2 lb of pure live seed per 1,000 sq ft, sown on soil at 68°F to 72°F, not buried: the University of Arkansas guide.',
  h1: 'Zoysia grass seed: rate, timing and depth',
  lead: `Sow zoysiagrass seed at ${seedRateText('zoysiagrass', 'tennessee')} of pure live seed for a quick cover, once the soil surface reaches 68°F to 72°F (late May in Arkansas), and barely cover it: it needs light to germinate. That is the University of Arkansas publication MP476.`,
  checked: READ,
  sections: [
    {
      id: 'rate',
      heading: 'Seeding rate in pure live seed',
      paragraphs: [
        `The University of Arkansas recommends ${seedRateText('zoysiagrass', 'tennessee')} of pure live seed (PLS) for rapid establishment, and 0.5 lb PLS per 1,000 sq ft to reduce cost where quick coverage is not needed. Pure live seed is the share of the bag that is seed of that grass and alive: the purity times the germination on the label.`,
      ],
      links: [SEED_CALCULATOR],
    },
    {
      id: 'when',
      heading: 'When to sow it',
      paragraphs: [
        'Seed when the soil surface first reaches 68°F to 72°F. In Arkansas that window runs May 15 to July 1, and the publication says dormant seedings in February and March have been largely unsuccessful, so do not sow zoysia ahead of the warm-up as you can with unhulled bermudagrass.',
      ],
    },
    {
      id: 'depth',
      heading: 'Depth, germination and first mowing',
      paragraphs: [
        'Zoysiagrass seed requires light to germinate, so it should not be buried deeper than about 1/4 inch. Germination typically occurs 10 or more days after seeding, and may take as little as 7. The University of Tennessee table gives 10 to 14 days for Zoysia japonica. Begin mowing at 0.5 to 0.75 inch.',
        'Texas A&M AgriLife warns that few types of seeded zoysiagrass are readily available and that it grows much more slowly from seed than bermudagrass does. The University of Arkansas adds that the seeded zoysiagrasses are very cold hardy.',
      ],
    },
    {
      id: 'site',
      heading: 'Where it does well',
      paragraphs: [
        'NC State Extension describes zoysiagrass as a very dense, wear-tolerant lawn that grows well in full sun and light shade.',
      ],
    },
  ],
  questions: [
    {
      question: 'How much zoysia seed per 1,000 square feet?',
      answer: `${seedRateText('zoysiagrass', 'tennessee')} of pure live seed for rapid establishment, or 0.5 lb to cut cost where fast cover does not matter (University of Arkansas MP476).`,
    },
    {
      question: 'How long does zoysia seed take to germinate?',
      answer:
        'Usually 10 days or more after seeding, as little as 7, by the University of Arkansas; 10 to 14 days by the University of Tennessee.',
    },
  ],
  sources: { arkansas: ARKANSAS, tennessee: TENNESSEE, agrilife: AGRILIFE, ncState: NC_STATE },
  calculators: ['/grass-seed-calculator'],
  card: {
    title: 'Zoysia grass seed',
    summary: 'Pure live seed rate, the soil temperature to sow at, and why not to bury it.',
  },
};

const TALL_FESCUE: SpeciesGuide = {
  id: 'tall-fescue-seed',
  path: '/tall-fescue-grass-seed',
  species: ['tall-fescue'],
  title: 'Tall Fescue Grass Seed: Rate and Fall Timing | Lawn Figures',
  description:
    'Tall fescue seed at 4 to 8 lb per 1,000 sq ft, sown in late summer to early fall on soil above 60°F, from Virginia, Tennessee and NC State.',
  h1: 'Tall fescue grass seed: how much and when',
  lead: `Sow tall fescue at ${seedRateText('tall-fescue', 'virginia-tech')} (Virginia Cooperative Extension) or ${seedRateText('tall-fescue', 'tennessee')} (University of Tennessee) in late summer to early fall, when the soil is above 60°F, and get it down by mid-October in North Carolina.`,
  checked: READ,
  sections: [
    {
      id: 'rate',
      heading: 'Seeding rate',
      paragraphs: [
        'Tall fescue takes more seed per square foot than the other grasses on this site. The extension sources agree within a few pounds:',
      ],
      items: [
        `Virginia Cooperative Extension: ${seedRateText('tall-fescue', 'virginia-tech')}.`,
        `University of Tennessee: ${seedRateText('tall-fescue', 'tennessee')}.`,
        'NC State TurfFiles: 5 to 6 pounds per 1,000 sq ft; Texas A&M AgriLife: 6 to 8 pounds, sown September to November.',
      ],
      links: [SEED_CALCULATOR],
    },
    {
      id: 'when',
      heading: 'When to sow it',
      paragraphs: [
        'NC State TurfFiles says tall fescue germinates best at air temperatures of 68°F to 77°F and soil above 60°F, and advises getting the seed out by mid-October. Purdue Extension gives August 15 to September 15 in the northern half of Indiana and Illinois and September 1 to 30 in the southern half, and warns that a week of delay can cost 2 to 4 weeks of growth before winter.',
      ],
    },
    {
      id: 'germination',
      heading: 'Germination and mowing',
      paragraphs: [
        'The University of Tennessee gives 6 to 12 days to germinate. Purdue Extension mows tall fescue at 2.5 to 4.0 inches, higher than bluegrass, ryegrass or fine fescue.',
      ],
    },
    {
      id: 'site',
      heading: 'Where it does well',
      paragraphs: [
        'NC State Extension says tall fescue is best adapted to the North Carolina mountains and Piedmont and thrives in sun or medium shade.',
      ],
    },
  ],
  questions: [
    {
      question: 'How much tall fescue seed per 1,000 square feet?',
      answer: `${seedRateText('tall-fescue', 'virginia-tech')} by Virginia Cooperative Extension, ${seedRateText('tall-fescue', 'tennessee')} by the University of Tennessee.`,
    },
    {
      question: 'When is it too late to plant tall fescue?',
      answer:
        'NC State TurfFiles advises getting the seed out by mid-October in North Carolina; farther north, Purdue puts the end of the optimum window at September 30.',
    },
  ],
  sources: {
    virginia: VIRGINIA,
    tennessee: TENNESSEE,
    turffiles: TURFFILES,
    purdue: PURDUE_SEED,
    agrilife: AGRILIFE,
    ncState: NC_STATE,
  },
  calculators: ['/grass-seed-calculator'],
  card: {
    title: 'Tall fescue grass seed',
    summary: 'Rates of four extension services, the fall window and the soil temperature.',
  },
};

const RYEGRASS: SpeciesGuide = {
  id: 'ryegrass-seed',
  path: '/perennial-ryegrass-seed',
  species: ['perennial-ryegrass'],
  title: 'Perennial Ryegrass Seed: Rate and Timing | Lawn Figures',
  description:
    'Perennial ryegrass seed per 1,000 sq ft, when to sow it and how fast it comes up, plus ryegrass for overseeding a warm-season lawn in winter.',
  h1: 'Perennial ryegrass seed: how much and when',
  lead: `Sow perennial ryegrass at ${seedRateText('perennial-ryegrass', 'virginia-tech')} (Virginia Cooperative Extension) or ${seedRateText('perennial-ryegrass', 'tennessee')} (University of Tennessee) in late summer to early fall. It is the fastest of the lawn grasses to come up, in 3 to 7 days.`,
  checked: READ,
  sections: [
    {
      id: 'rate',
      heading: 'Seeding rate',
      paragraphs: ['For a new lawn of perennial ryegrass, the two extension tables give:'],
      items: [
        `Virginia Cooperative Extension: ${seedRateText('perennial-ryegrass', 'virginia-tech')}.`,
        `University of Tennessee: ${seedRateText('perennial-ryegrass', 'tennessee')}.`,
      ],
      links: [SEED_CALCULATOR],
    },
    {
      id: 'when',
      heading: 'When to sow it',
      paragraphs: [
        'As a cool-season grass, ryegrass follows the late summer to early fall window: Purdue Extension gives August 15 to September 15 in the northern half of Indiana and Illinois. The University of Tennessee table gives 3 to 7 days to germinate, about half the time of tall fescue, which is why ryegrass is often mixed in to cover bare soil quickly.',
      ],
    },
    {
      id: 'overseeding',
      heading: 'Ryegrass over a warm-season lawn',
      paragraphs: [
        'In the South, ryegrass is also sown into dormant bermudagrass for winter color. Texas A&M AgriLife says that overseeding is typically done in the fall about 5 to 8 weeks before the expected first frost date. Find the first fall freeze of your nearest station on the frost pages and count back.',
      ],
      links: [{ href: '/frost-dates', label: 'Frost dates by ZIP code and state' }],
    },
    {
      id: 'site',
      heading: 'Where it does well',
      paragraphs: [
        'NC State Extension says perennial ryegrass is only adapted to the North Carolina mountains as a permanent lawn. Purdue Extension mows it at 2.0 to 3.5 inches.',
      ],
    },
  ],
  questions: [
    {
      question: 'How much perennial ryegrass seed per 1,000 square feet?',
      answer: `${seedRateText('perennial-ryegrass', 'virginia-tech')} by Virginia Cooperative Extension, ${seedRateText('perennial-ryegrass', 'tennessee')} by the University of Tennessee, for a new lawn.`,
    },
    {
      question: 'When should I overseed bermuda with ryegrass?',
      answer:
        'Texas A&M AgriLife says about 5 to 8 weeks before the expected first frost date, in the fall.',
    },
  ],
  sources: {
    virginia: VIRGINIA,
    tennessee: TENNESSEE,
    purdue: PURDUE_SEED,
    agrilife: AGRILIFE,
    ncState: NC_STATE,
  },
  calculators: ['/grass-seed-calculator'],
  card: {
    title: 'Perennial ryegrass seed',
    summary: 'New-lawn rates, the 3 to 7 day germination and winter overseeding by frost date.',
  },
};

const BLUEGRASS: SpeciesGuide = {
  id: 'bluegrass-seed',
  path: '/kentucky-bluegrass-seed',
  species: ['kentucky-bluegrass'],
  title: 'Kentucky Bluegrass Seed: Rate, Mixes and Timing | Lawn Figures',
  description:
    'Kentucky bluegrass seed per 1,000 sq ft alone or mixed with ryegrass or fine fescue, the late summer window and its 14 to 21 days to germinate.',
  h1: 'Kentucky bluegrass seed: how much, which mix, and when',
  lead: `Sow Kentucky bluegrass at ${seedRateText('kentucky-bluegrass', 'virginia-tech')} (Virginia Cooperative Extension) or ${seedRateText('kentucky-bluegrass', 'tennessee')} (University of Tennessee) in late summer to early fall. It is the slowest of the cool-season grasses to come up, 14 to 21 days, which is why it is often mixed with perennial ryegrass or fine fescue.`,
  checked: READ,
  sections: [
    {
      id: 'rate',
      heading: 'Seeding rate',
      paragraphs: [
        'Bluegrass seed is small, so it takes fewer pounds per square foot than tall fescue or ryegrass. The University of Tennessee warns that too much seed gives a dense stand of weak, disease-prone seedlings, and NC State Extension says the same of bluegrass.',
      ],
      items: [
        `Virginia Cooperative Extension: ${seedRateText('kentucky-bluegrass', 'virginia-tech')}.`,
        `University of Tennessee: ${seedRateText('kentucky-bluegrass', 'tennessee')}; Texas A&M AgriLife prints the same, sown September to November.`,
        'NC State Extension: 1 to 2 pounds per 1,000 sq ft.',
        `On a 5,000 sq ft lawn the grass seed calculator gives ${seedPoundsText('kentucky-bluegrass', 'virginia-tech', LAWN)} at the Virginia rate and ${seedPoundsText('kentucky-bluegrass', 'tennessee', LAWN)} at the Tennessee rate, half sown in each direction.`,
      ],
      links: [SEED_CALCULATOR],
    },
    {
      id: 'mixes',
      heading: 'Bluegrass alone or in a mix',
      paragraphs: [
        'A mix is sown at the rate of the mix, not of the bluegrass alone, because the other seed is larger. Purdue Extension prints these rates for lawns in Indiana and Illinois:',
      ],
      items: [
        '100% Kentucky bluegrass: 1.5 to 2.0 lb per 1,000 sq ft.',
        '85 to 90% Kentucky bluegrass with 10 to 15% perennial ryegrass: 3.0 to 4.0 lb.',
        '50 to 70% Kentucky bluegrass with 30 to 50% fine fescue: 4.0 to 5.0 lb.',
        'NC State Extension, for its mountains: a bluegrass and perennial ryegrass mix at 2.5 lb, 60% bluegrass by weight.',
      ],
    },
    {
      id: 'when',
      heading: 'When to sow it',
      paragraphs: [
        'Purdue Extension gives August 15 to September 15 in the northern half of Indiana and Illinois and September 1 to 30 in the southern half, and says to seed as early as possible in the window. NC State Extension seeds cool-season grasses in early fall and gets only fair results from early spring seedings, mid-February to late March in the North Carolina piedmont.',
      ],
    },
    {
      id: 'germination',
      heading: 'Germination and first mowing',
      paragraphs: [
        'The University of Tennessee table gives 14 to 21 days to germinate, against 3 to 7 days for perennial ryegrass and 6 to 12 for tall fescue, so keep the seedbed moist for three weeks. Purdue Extension mows a new bluegrass lawn first at 1.5 inches and then at a permanent 2.0 to 3.5 inches.',
      ],
    },
    {
      id: 'site',
      heading: 'Where it does well',
      paragraphs: [
        'NC State Extension says Kentucky bluegrass is well suited to the North Carolina mountains, can be grown with tall fescue in the piedmont, and is not suitable for the coastal plain. It prefers fertile, limed, well-drained soil in sun or light shade, grows better than tall fescue in moderate shade, and spreads by rhizomes, which lets it fill in damaged spots. In a summer drought it may turn brown for two to four weeks and recover without watering.',
      ],
      links: [BEST_SEED_LINK],
    },
  ],
  questions: [
    {
      question: 'How much Kentucky bluegrass seed per 1,000 square feet?',
      answer: `${seedRateText('kentucky-bluegrass', 'virginia-tech')} by Virginia Cooperative Extension, ${seedRateText('kentucky-bluegrass', 'tennessee')} by the University of Tennessee and Purdue. A mix with ryegrass or fine fescue takes more pounds: 3.0 to 5.0 lb by Purdue.`,
    },
    {
      question: 'How long does Kentucky bluegrass take to germinate?',
      answer: 'About 14 to 21 days, by the University of Tennessee table.',
    },
    {
      question: 'Kentucky bluegrass or tall fescue?',
      answer:
        'NC State Extension mixes them in the piedmont: tall fescue adds drought and heat tolerance, bluegrass adds finer texture and the ability to recover. Bluegrass alone suits the cooler mountains.',
    },
  ],
  sources: {
    virginia: VIRGINIA,
    tennessee: TENNESSEE,
    purdue: PURDUE_SEED,
    ncState: NC_STATE,
    agrilife: AGRILIFE,
  },
  calculators: ['/grass-seed-calculator'],
  card: {
    title: 'Kentucky bluegrass seed',
    summary: 'Rates alone and in a mix, the fall window and its slow 14 to 21 day start.',
  },
};

const FESCUE: SpeciesGuide = {
  id: 'fescue-seed',
  path: '/fescue-grass-seed',
  species: ['fine-fescue', 'tall-fescue'],
  title: 'Fescue Grass Seed: Fine Fescue or Tall Fescue? | Lawn Figures',
  description:
    'Fine fescues (creeping red, Chewings, hard, sheep) or tall fescue: the seeding rate of each, when to sow, and which one suits shade.',
  h1: 'Fescue grass seed: fine fescue or tall fescue',
  lead: `“Fescue” seed is one of two kinds. Fine fescues (creeping red, Chewings, hard and sheep fescue) have needle-thin leaves, take shade and little care, and are sown at ${seedRateText('fine-fescue', 'virginia-tech')}. Tall fescue is a coarser, tougher grass for sun to medium shade, sown heavier, at ${seedRateText('tall-fescue', 'virginia-tech')} (Virginia Cooperative Extension). Both go down in late summer to early fall.`,
  checked: READ,
  sections: [
    {
      id: 'kinds',
      heading: 'Two kinds of fescue',
      paragraphs: [
        'Purdue Extension groups five grasses as fine fescues: strong creeping red, slender creeping red, Chewings, hard and sheep fescue. NC State Extension says their leaves are almost as fine as pine needles, and that they are noted for tolerating shade, drought and poor soil better than the other cool-season grasses. Most are bunch-type and do not spread, the creeping reds excepted, which have rhizomes.',
        'Tall fescue is a different species with wider leaves. NC State Extension calls it the best grass to plant for a green lawn year-round in the North Carolina mountains and piedmont, with good disease, drought and cold tolerance. It is also bunch-type, so bare spots need reseeding.',
      ],
    },
    {
      id: 'fine-rate',
      heading: 'Fine fescue seeding rate',
      paragraphs: [
        'Virginia Cooperative Extension and the University of Tennessee give fine fescue the same rate; Purdue Extension gives each kind its own, because their seeds differ in size:',
      ],
      items: [
        `Virginia Cooperative Extension and University of Tennessee: ${seedRateText('fine-fescue', 'tennessee')}.`,
        'Purdue Extension: strong and slender creeping red fescue 4 to 6 lb, Chewings fescue 3.5 to 6 lb, hard and sheep fescue 3 to 6 lb per 1,000 sq ft.',
        'NC State Extension, mixed with tall fescue or Kentucky bluegrass: 1.5 lb of fine fescue per 1,000 sq ft.',
        `On a 5,000 sq ft lawn the grass seed calculator gives ${seedPoundsText('fine-fescue', 'tennessee', LAWN)} of fine fescue.`,
      ],
      links: [SEED_CALCULATOR],
    },
    {
      id: 'tall-rate',
      heading: 'Tall fescue seeding rate',
      paragraphs: [
        `Tall fescue takes ${seedRateText('tall-fescue', 'virginia-tech')} by Virginia Cooperative Extension and ${seedRateText('tall-fescue', 'tennessee')} by the University of Tennessee: ${seedPoundsText('tall-fescue', 'virginia-tech', LAWN)} for a 5,000 sq ft lawn at the Virginia rate. Its own page has the soil temperature and the fall deadline.`,
      ],
      links: [{ href: '/tall-fescue-grass-seed', label: 'Tall fescue grass seed' }],
    },
    {
      id: 'when',
      heading: 'When to sow fine fescue',
      paragraphs: [
        'Purdue Extension found the best time to seed fine fescues in Indiana is late July to late September (to early September for hard and sheep fescue), and the second best mid-March to mid-April. Seeding in late spring or summer exposes the seedlings to heat, drought and summer weeds.',
      ],
    },
    {
      id: 'germination',
      heading: 'Germination',
      paragraphs: [
        'Purdue Extension gives 5 to 12 days for the creeping reds and Chewings fescue and 7 to 14 days for hard and sheep fescue, at 59 to 77°F. The University of Tennessee gives 6 to 14 days for fine fescues and 6 to 12 for tall fescue. Fine fescues establish faster than Kentucky bluegrass and slower than perennial ryegrass.',
      ],
    },
    {
      id: 'choose',
      heading: 'Which fescue for which lawn',
      paragraphs: [
        'For shade and low upkeep, fine fescue, usually mixed with tall fescue or Kentucky bluegrass, which is how NC State Extension uses it. NC State says fine fescues are best adapted to the mountains, can be grown in the piedmont, should not be used in the coastal plain, and may not persist in hot sun, wet or humid soil, or under heavy traffic.',
        'For sun, wear and a year-round green lawn in the transition zone, tall fescue, which NC State says thrives in sun or medium shade in the mountains and piedmont but does poorly in full sun on sandy coastal plain soil.',
      ],
      links: [BEST_SEED_LINK],
    },
  ],
  questions: [
    {
      question: 'What is the difference between fine fescue and tall fescue?',
      answer:
        'Fine fescues are a group of grasses with needle-thin leaves that take shade, drought and poor soil but not heavy traffic. Tall fescue is one coarser, tougher grass for sun to medium shade that NC State Extension calls the best for a year-round green lawn in its mountains and piedmont.',
    },
    {
      question: 'Which fescue grows in shade?',
      answer:
        'Fine fescue tolerates shade better than the other cool-season grasses (NC State Extension). Tall fescue takes medium shade; improved cultivars are more shade tolerant than Kentucky 31.',
    },
    {
      question: 'How much fescue seed per 1,000 square feet?',
      answer: `Fine fescue ${seedRateText('fine-fescue', 'virginia-tech')}; tall fescue ${seedRateText('tall-fescue', 'virginia-tech')} by Virginia Cooperative Extension or ${seedRateText('tall-fescue', 'tennessee')} by the University of Tennessee.`,
    },
  ],
  sources: {
    virginia: VIRGINIA,
    tennessee: TENNESSEE,
    purdueFine: PURDUE_FINE_FESCUE,
    ncState: NC_STATE,
  },
  calculators: ['/grass-seed-calculator'],
  card: {
    title: 'Fescue grass seed: fine or tall',
    summary: 'The two kinds of fescue, the rate of each, and which one takes shade.',
  },
};

/** The species pages: one per grass with seeding rates in the calculator data. */
export const SPECIES_GUIDES: readonly SpeciesGuide[] = [
  BERMUDA,
  ZOYSIA,
  TALL_FESCUE,
  RYEGRASS,
  BLUEGRASS,
  FESCUE,
];
