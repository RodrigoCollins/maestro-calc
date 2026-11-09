import { Rational } from '@maestro-calc/core';
import type { SeedSpecies } from '@maestro-calc/lawn-core/grass-seed';
import { amountText, fieldText } from './format.ts';
import type { Guide } from './guide.ts';
import { seedPoundsText, seedRateText } from './seed-guides.ts';
import {
  AGRILIFE,
  ALABAMA_CENTIPEDE,
  ARKANSAS,
  BEST_SEED_LINK,
  COLORADO_BUFFALO,
  NC_STATE,
  NC_STATE_CENTIPEDE,
  NEBRASKA_BUFFALO,
  GROWING_LINK,
  PLANTING_LINK,
  PURDUE_SEED,
  READ,
  SEED_CALCULATOR,
  ST_AUGUSTINE,
  TENNESSEE,
  UK_LINK,
  VIRGINIA,
} from './seed-sources.ts';
import { viewOf } from './view.ts';

/** A seeding rate a source prints for a grass the calculator leaves out: pounds per 1,000 sq ft. */
export interface CitedRate {
  readonly low: Rational;
  readonly high: Rational;
}

const THOUSAND = Rational.of(1000);

/** A cited rate as a page prints it: `0.25 to 0.5 lb per 1,000 sq ft`. */
export const citedRateText = ({ low, high }: CitedRate): string =>
  `${fieldText(low)} to ${fieldText(high)} lb per 1,000 sq ft`;

/** The pounds a cited rate gives a lawn of `area` sq ft: the rate × the area ÷ 1,000. */
export const lawnPoundsText = ({ low, high }: CitedRate, area: number): string => {
  const of = (rate: Rational) => fieldText(rate.mul(Rational.of(area)).div(THOUSAND));
  return `${of(low)} to ${of(high)} lb`;
};

/** The plugs of a lawn of `area` sq ft planted on centers `spacing` feet apart: one per square. */
export const plugsText = (area: number, spacing: Rational): string =>
  `${amountText(Rational.of(area).div(spacing.mul(spacing)))} plugs`;

/** The lawn the pages work their figures for. */
const LAWN = 5000;

/** Centipedegrass, Alabama Cooperative Extension and NC State: 1/4 to 1/2 lb per 1,000 sq ft. */
const CENTIPEDE_RATE: CitedRate = { low: Rational.of(1, 4), high: Rational.of(1, 2) };
/** Centipedegrass, Texas A&M AgriLife B-6239, Table 2: 1/2 to 1 pound per 1,000 sq ft. */
const CENTIPEDE_TEXAS: CitedRate = { low: Rational.of(1, 2), high: Rational.of(1) };
/** Buffalograss, Nebraska G1946: the recommended 1 to 2 lb of burs per 1,000 sq ft. */
const BUFFALO_NEBRASKA: CitedRate = { low: Rational.of(1), high: Rational.of(2) };
/** Buffalograss, Colorado State: three to five pounds of seed per 1,000 sq ft. */
const BUFFALO_COLORADO: CitedRate = { low: Rational.of(3), high: Rational.of(5) };
/** Buffalograss, Texas A&M AgriLife B-6239, Table 2: 2 to 3 pounds per 1,000 sq ft. */
const BUFFALO_TEXAS: CitedRate = { low: Rational.of(2), high: Rational.of(3) };

/** Texas A&M AgriLife B-6239: 2-inch St. Augustine plugs on 12-inch centers, cut from 30 sq ft of sod per 1,000. */
const PLUG_SOD_PER_THOUSAND = Rational.of(30);
const plugSod = amountText(PLUG_SOD_PER_THOUSAND.mul(Rational.of(LAWN)).div(THOUSAND));
/** The sod calculator on the same lawn, no waste, pallets of 450 sq ft (its default). */
const sodLawn = viewOf('sod', { area: String(LAWN) });
const sodPallets = `${sodLawn?.values['pallets'] ?? ''} ${sodLawn?.values['palletsUnit'] ?? ''}`;

/** Pure live seed of the Texas A&M AgriLife label example: 85% germination × 98% purity. */
const PURE_LIVE = Rational.of(85 * 98, 100 * 100);
const pureLivePercent = amountText(PURE_LIVE.mul(Rational.of(100)));
/** Bulk seed for 1 lb of pure live seed at that label: 1 ÷ 0.833. */
const bulkForOnePound = fieldText(Rational.of(1).div(PURE_LIVE));

const CENTIPEDE: Guide = {
  id: 'centipede-seed',
  path: '/centipede-grass-seed',
  title: 'Centipede Grass Seed: How Much and When to Plant | Lawn Figures',
  description:
    'Centipedegrass seed at 1/4 to 1/2 lb per 1,000 sq ft, sown April to July, mixed with sand, and slow: weeks to sprout and years to fill in.',
  h1: 'Centipede grass seed: a little seed and a lot of patience',
  lead: `Sow centipedegrass at ${citedRateText(CENTIPEDE_RATE)} (Alabama Cooperative Extension and NC State), from April to July (Alabama) or once daytime temperatures stay above 60°F (NC State), mixed with sand so the tiny seed spreads evenly. It is slow: 10 days to 4 weeks to sprout and, by NC State, two to three years to fill in a lawn from seed.`,
  checked: READ,
  sections: [
    {
      id: 'rate',
      heading: 'Seeding rate',
      paragraphs: [
        `Centipedegrass seed is extremely small, so the rate is a fraction of a pound. Centipede is not in the grass seed calculator, which reads only the Virginia and Tennessee tables; these are the cited rates and what they give a ${amountText(Rational.of(LAWN))} sq ft lawn:`,
      ],
      items: [
        `Alabama Cooperative Extension and the NC State calendar: ${citedRateText(CENTIPEDE_RATE)}, or ${lawnPoundsText(CENTIPEDE_RATE, LAWN)} for 5,000 sq ft.`,
        `Texas A&M AgriLife Extension: ${citedRateText(CENTIPEDE_TEXAS)}, or ${lawnPoundsText(CENTIPEDE_TEXAS, LAWN)} for 5,000 sq ft.`,
        'Seed quality, by Alabama: purity of 90 percent or better and germination of at least 85 percent.',
      ],
    },
    {
      id: 'spread',
      heading: 'How to spread so little seed',
      paragraphs: [
        'Alabama Cooperative Extension mixes 20 pounds of dry sand with each pound of seed and spreads half the mix in one direction and half at right angles to it. The NC State calendar uses 2 gallons of fine sand per 1,000 sq ft. Mulch or another cover keeps the slow seed from washing away while it waits to sprout.',
      ],
    },
    {
      id: 'when',
      heading: 'When to sow it',
      paragraphs: [
        'Alabama gives April to July, which leaves a full growing season for the seedlings to establish before cold weather. The NC State calendar replants bare areas in May, or once daytime temperatures stay above 60°F.',
      ],
      links: [PLANTING_LINK],
    },
    {
      id: 'germination',
      heading: 'Germination and filling in',
      paragraphs: [
        'The three sources give different waits: 10 to 20 days in the University of Tennessee table, 2 to 3 weeks by Alabama, and 28 days in the NC State calendar, which keeps the seedbed moist with light watering several times a day for those 28 days. NC State Extension says a seeded centipede lawn may take two to three years to establish.',
      ],
    },
    {
      id: 'site',
      heading: 'Where it does well, and where it does not',
      paragraphs: [
        'Centipedegrass is a low-maintenance grass: NC State says it has the lowest nitrogen needs of the common lawn grasses and is grown mostly east of Interstate 95 in North Carolina. Alabama says it takes full sun or partial shade but needs 6 or more hours of direct sun, tolerates acid soil (pH 5.0 to 6.0) better than other grasses and performs well at 6.0 to 6.5, and is mowed at 1 to 1.5 inches.',
        'It does not tolerate traffic, high soil pH or heavy shade, and has poor cold tolerance (Alabama). The cultivar TifBlair is more cold tolerant and may do better in the transition zone of northern Alabama.',
      ],
      links: [BEST_SEED_LINK],
    },
  ],
  questions: [
    {
      question: 'How much centipede seed per 1,000 square feet?',
      answer: `${citedRateText(CENTIPEDE_RATE)} by Alabama Cooperative Extension and NC State, ${citedRateText(CENTIPEDE_TEXAS)} by Texas A&M AgriLife. For a 5,000 sq ft lawn that is ${lawnPoundsText(CENTIPEDE_RATE, LAWN)}.`,
    },
    {
      question: 'How long does centipede seed take to germinate?',
      answer:
        '10 to 20 days by the University of Tennessee, 2 to 3 weeks by Alabama, 28 days by the NC State calendar. Filling in a lawn takes two to three years.',
    },
    {
      question: 'Can I plant centipede seed in the fall?',
      answer:
        'The cited sources sow it from April to July so the seedlings have a whole growing season before cold weather; none of them recommends fall seeding.',
    },
  ],
  sources: {
    alabama: ALABAMA_CENTIPEDE,
    ncCalendar: NC_STATE_CENTIPEDE,
    ncState: NC_STATE,
    tennessee: TENNESSEE,
    agrilife: AGRILIFE,
  },
  calculators: [],
  card: {
    title: 'Centipede grass seed',
    summary: 'A fraction of a pound per 1,000 sq ft, mixed with sand, and years to fill in.',
  },
};

const BUFFALO: Guide = {
  id: 'buffalo-seed',
  path: '/buffalo-grass-seed',
  title: 'Buffalo Grass Seed: Rate and Soil Temperature | Lawn Figures',
  description:
    'Buffalograss seed at 1 to 2 lb of burs (Nebraska) or 3 to 5 lb (Colorado State) per 1,000 sq ft, sown in late spring once the soil reaches 60°F.',
  h1: 'Buffalo grass seed: the dry-country lawn',
  lead: `Sow buffalograss at ${citedRateText(BUFFALO_NEBRASKA)} of burs (University of Nebraska) or ${citedRateText(BUFFALO_COLORADO)} (Colorado State), in late spring: Nebraska says it will not germinate until the soil reaches 60°F. It is a native grass of the Great Plains that needs little water once established, but as much as a bluegrass lawn while it starts.`,
  checked: READ,
  sections: [
    {
      id: 'rate',
      heading: 'Seeding rate',
      paragraphs: [
        'Buffalograss seed is sold in burs, each holding one or more seeds. The sources differ by more than double, and buffalo is not in the grass seed calculator, so here are all three and what each gives a 5,000 sq ft lawn:',
      ],
      items: [
        `University of Nebraska–Lincoln: ${citedRateText(BUFFALO_NEBRASKA)} of burs, or ${lawnPoundsText(BUFFALO_NEBRASKA, LAWN)}. Its trials at 1 to 3 lb, seeded in early June, gave full cover by mid-September.`,
        `Colorado State University: ${citedRateText(BUFFALO_COLORADO)}, or ${lawnPoundsText(BUFFALO_COLORADO, LAWN)}.`,
        `Texas A&M AgriLife Extension: ${citedRateText(BUFFALO_TEXAS)}, or ${lawnPoundsText(BUFFALO_TEXAS, LAWN)}, sown in spring.`,
      ],
    },
    {
      id: 'when',
      heading: 'When to sow it',
      paragraphs: [
        'Nebraska calls late spring the optimum. Its soil reaches 60°F usually after May 15 in the east of the state and May 31 in the west, June 1 is a good target for a full stand by September, and it advises not seeding after August 15 in the east or August 1 in the west. Colorado State sows any time in spring until late July, and says seed sown early waits until the soil warms above 55°F.',
        'The two disagree on dormant seeding: Colorado State says seed sown from October to December germinates the next spring, while Nebraska says dormant seeding rarely succeeds and should be avoided.',
      ],
      links: [PLANTING_LINK],
    },
    {
      id: 'planting',
      heading: 'Depth, water and germination',
      paragraphs: [
        'Plant the burs no deeper than 3/4 inch (Nebraska); Colorado State plants at 1/2 inch, or covers broadcast seed with 1/4 to 1/2 inch of soil. Keep the surface damp: Nebraska says treated seed starts to emerge in 5 to 10 days, Colorado State 7 to 21 days with warm soil and steady watering. Colorado State warns that starting buffalograss takes as much water as starting bluegrass or tall fescue, sometimes more.',
        'Buffalograss cannot be overseeded into a growing Kentucky bluegrass lawn: Nebraska says the cool-season grass outcompetes it, so remove or kill the old turf first.',
      ],
    },
    {
      id: 'site',
      heading: 'Where it does well, and where it does not',
      paragraphs: [
        'Nebraska says buffalograss roots to three feet or more against eight inches for bluegrass, and in Nebraska grows only from mid-May to mid-October, so it is brown longer than a cool-season lawn. Colorado State says the newer turf types stay green on 50 to 75 percent less water than Kentucky bluegrass once established.',
      ],
      items: [
        'Not for more than half a day of heavy shade (Colorado State).',
        'Not for saline soils, or above about 6,500 feet (Colorado State).',
        'Not for small lawns with concentrated, constant foot traffic (Colorado State).',
      ],
      links: [BEST_SEED_LINK],
    },
  ],
  questions: [
    {
      question: 'How much buffalo grass seed per 1,000 square feet?',
      answer: `${citedRateText(BUFFALO_NEBRASKA)} of burs by the University of Nebraska, ${citedRateText(BUFFALO_COLORADO)} by Colorado State, ${citedRateText(BUFFALO_TEXAS)} by Texas A&M AgriLife.`,
    },
    {
      question: 'What soil temperature does buffalo grass need?',
      answer:
        'At least 60°F by Nebraska Extension, above 55°F by Colorado State. In Nebraska the soil gets there usually after May 15 in the east and May 31 in the west.',
    },
    {
      question: 'Does buffalo grass need watering?',
      answer:
        'To get started, yes, as much as a bluegrass lawn (Colorado State). Once established it survives without irrigation but goes dormant in most summers; 1 to 2 inches of rain or water every two to four weeks keeps it green.',
    },
  ],
  sources: {
    nebraska: NEBRASKA_BUFFALO,
    colorado: COLORADO_BUFFALO,
    agrilife: AGRILIFE,
  },
  calculators: [],
  card: {
    title: 'Buffalo grass seed',
    summary: 'Burs per 1,000 sq ft by three sources, the 60°F soil it waits for, and its limits.',
  },
};

const ST_AUGUSTINE_GUIDE: Guide = {
  id: 'st-augustine-seed',
  path: '/st-augustine-grass-seed',
  title: 'St. Augustine Grass Seed: Why There Is None | Lawn Figures',
  description:
    'St. Augustinegrass seed is not available: the grass is planted as sod, plugs or sprigs. How much sod and how many plugs a lawn takes.',
  h1: 'St. Augustine grass seed: plant sod or plugs instead',
  lead: 'St. Augustinegrass seed is not available: Texas A&M AgriLife Extension says the grass is established with sod, sprigs and plugs because seed is currently not available, and NC State Extension says the same. So a St. Augustine lawn is measured in square feet of sod or a count of plugs, not in pounds of seed.',
  checked: READ,
  sections: [
    {
      id: 'no-seed',
      heading: 'Why there is no seed',
      paragraphs: [
        'Texas A&M AgriLife lists St. Augustinegrass as not available as seed in Texas, and says many improved warm-season varieties do not produce viable seed at all and are sold only as sod, plugs or sprigs. NC State Extension: “Seed is unavailable, so cultivars must be vegetatively planted.” A grass seed calculator has no rate for it, which is why ours does not offer it.',
      ],
    },
    {
      id: 'sod',
      heading: 'Solid sod: the area of the lawn',
      paragraphs: [
        `Sod covers the same square feet as the lawn (Texas A&M AgriLife), which it adds is 111 square yards per 1,000 sq ft. For a 5,000 sq ft lawn the sod calculator gives 5,000 sq ft, or ${sodPallets} of 450 sq ft; add the waste your sod farm advises for curves and beds. Texas A&M AgriLife says sod should not sit on the pallet longer than 36 hours, less in hot weather.`,
      ],
      links: [{ href: '/sod-calculator', label: 'Sod calculator' }],
    },
    {
      id: 'plugs',
      heading: 'Plugs: fewer square feet of sod, a slower cover',
      paragraphs: ['Texas A&M AgriLife gives two plug plans. Counted for a 5,000 sq ft lawn:'],
      items: [
        `2-inch plugs on 12-inch centers, cut from 30 sq ft of sod per 1,000 sq ft: ${plugsText(LAWN, Rational.of(1))} from ${plugSod} sq ft of sod.`,
        `4-inch plugs on 2-foot centers, which should cover in about 3 months if watered and fertilized: ${plugsText(LAWN, Rational.of(2))}.`,
        'Plugs go in during spring and early summer; press them firmly into the soil and roll the area smooth.',
      ],
    },
    {
      id: 'when',
      heading: 'When to plant it',
      paragraphs: [
        'Texas A&M AgriLife EHT-144 plants St. Augustinegrass in late spring and early summer, when it is growing and rain is likelier, and says to give the roots as long as possible before the fall frosts, since it can be killed by winter in parts of Texas. It grows best at 80 to 95°F.',
      ],
      links: [{ href: '/frost-dates', label: 'Frost dates by ZIP code and state' }],
    },
    {
      id: 'site',
      heading: 'Where it does well, and the seeded alternatives',
      paragraphs: [
        'St. Augustinegrass is the most shade-tolerant warm-season grass, but still needs at least 4 to 6 hours of light a day (EHT-144). NC State Extension says it is best adapted to the coastal plain, is very shade and salt tolerant, and is the least cold tolerant lawn grass; Raleigh is the most cold-tolerant cultivar. Mow it at 2 to 4 inches (EHT-144).',
        'If you want to start a warm-season lawn from seed, the seeded grasses are bermudagrass (full sun only), zoysiagrass (full sun to light shade) and centipedegrass (partial shade, 6 or more hours of sun).',
      ],
      links: [
        { href: '/bermuda-grass-seed', label: 'Bermuda grass seed' },
        { href: '/zoysia-grass-seed', label: 'Zoysia grass seed' },
        { href: '/centipede-grass-seed', label: 'Centipede grass seed' },
        BEST_SEED_LINK,
      ],
    },
  ],
  questions: [
    {
      question: 'Can you buy St. Augustine grass seed?',
      answer:
        'No. Texas A&M AgriLife and NC State Extension both say seed is not available; the grass is planted as sod, plugs or sprigs.',
    },
    {
      question: 'How many St. Augustine plugs do I need?',
      answer: `On 12-inch centers, one plug per square foot: ${plugsText(1000, Rational.of(1))} per 1,000 sq ft. On 2-foot centers, one per 4 sq ft: ${plugsText(1000, Rational.of(2))} per 1,000 sq ft (Texas A&M AgriLife spacings).`,
    },
    {
      question: 'How fast do St. Augustine plugs spread?',
      answer:
        '4-inch plugs on 2-foot centers should cover completely in about 3 months if watered and fertilized (Texas A&M AgriLife).',
    },
  ],
  sources: { stAugustine: ST_AUGUSTINE, agrilife: AGRILIFE, ncState: NC_STATE },
  calculators: ['/sod-calculator'],
  card: {
    title: 'St. Augustine grass seed',
    summary: 'Why there is no seed, and the sod and plugs a lawn takes instead.',
  },
};

/** The grasses of the site the seed calculator leaves out, each with its own page. */
export const GRASS_GUIDES: readonly Guide[] = [CENTIPEDE, BUFFALO, ST_AUGUSTINE_GUIDE];

/** The calculator grasses in the order of the comparison, with what the cited sources add. */
const COMPARED: readonly {
  readonly species: SeedSpecies;
  readonly name: string;
  readonly note: string;
}[] = [
  {
    species: 'kentucky-bluegrass',
    name: 'Kentucky bluegrass',
    note: '14 to 21 days to germinate; late summer to early fall',
  },
  { species: 'tall-fescue', name: 'Tall fescue', note: '6 to 12 days; late summer to early fall' },
  { species: 'fine-fescue', name: 'Fine fescue', note: '6 to 14 days; late summer to early fall' },
  {
    species: 'perennial-ryegrass',
    name: 'Perennial ryegrass',
    note: '3 to 7 days, the fastest; late summer to early fall',
  },
  {
    species: 'bermudagrass-hulled',
    name: 'Bermudagrass, hulled',
    note: '10 to 20 days; late spring to early summer',
  },
  {
    species: 'bermudagrass-unhulled',
    name: 'Bermudagrass, unhulled',
    note: '14 to 21 days or longer; late fall or winter, ahead of the warm-up',
  },
  {
    species: 'zoysiagrass',
    name: 'Zoysiagrass (pure live seed, Arkansas)',
    note: '10 to 14 days; once the soil surface reaches 68°F to 72°F',
  },
];

const comparedItem = ({ species, name, note }: (typeof COMPARED)[number]): string =>
  `${name}: ${seedRateText(species, 'virginia-tech')}, ${seedPoundsText(species, 'virginia-tech', LAWN)} for 5,000 sq ft; ${note}.`;

/** The best grass seed: the grass adapted to your region and your site, and every grass page. */
export const BEST_SEED_GUIDE: Guide = {
  id: 'best-seed',
  path: '/best-grass-seed',
  title: 'Best Grass Seed by Region: 9 Lawn Grasses Compared | Lawn Figures',
  description:
    'Which grass seed suits the North, the transition zone, the South and the Great Plains, with the rate, pounds and germination days of each.',
  h1: 'The best grass seed for your region and your yard',
  lead: 'The best grass seed is the grass adapted to where you live. In the North, a cool-season grass: Kentucky bluegrass, tall fescue, fine fescue or perennial ryegrass, sown in late summer. In the transition zone, where both kinds struggle, tall fescue is the year-round choice. In the South, a warm-season grass sown in late spring: bermudagrass, zoysiagrass or centipedegrass. On the dry Great Plains, the native buffalograss.',
  checked: READ,
  sections: [
    {
      id: 'regions',
      heading: 'By region',
      paragraphs: [
        'The extension services cited here describe the same pattern from their own states:',
      ],
      items: [
        'North (Purdue, for Indiana and Illinois): cool-season grasses, Kentucky bluegrass alone or mixed with perennial ryegrass or fine fescue, or tall fescue, seeded August 15 to September 30.',
        'Transition zone (Virginia Cooperative Extension says Virginia lies in it, where the climate can be hostile to both kinds): NC State Extension calls tall fescue the best grass for a green lawn year-round in the North Carolina mountains and piedmont; bermudagrass and zoysiagrass are the warm-season choices.',
        'South (Texas A&M AgriLife, Alabama, the NC State coastal plain): warm-season grasses, which go dormant and brown after the first heavy frost. Bermudagrass and zoysiagrass for sun, centipedegrass for low upkeep, St. Augustinegrass for shade, as sod.',
        'Great Plains (Nebraska, Colorado State): buffalograss, a native grass that stays green on far less water once established, for sunny lawns with light traffic.',
      ],
    },
    {
      id: 'compare',
      heading: 'Every calculator grass, compared',
      paragraphs: [
        'The seeding rate of Virginia Cooperative Extension (zoysiagrass from the University of Arkansas), the pounds the grass seed calculator gives a 5,000 sq ft lawn at that rate, and the days to germinate of the University of Tennessee table:',
      ],
      items: [
        ...COMPARED.map(comparedItem),
        `Centipedegrass (not in the calculator): ${citedRateText(CENTIPEDE_RATE)} by Alabama, ${lawnPoundsText(CENTIPEDE_RATE, LAWN)} for 5,000 sq ft; 10 to 20 days in Tennessee, 28 days by NC State; April to July.`,
        `Buffalograss (not in the calculator): ${citedRateText(BUFFALO_NEBRASKA)} of burs by Nebraska, ${lawnPoundsText(BUFFALO_NEBRASKA, LAWN)} for 5,000 sq ft; 5 to 10 days for treated seed; late spring, at 60°F soil.`,
        'St. Augustinegrass: no seed is available; plant sod or plugs.',
      ],
      links: [SEED_CALCULATOR],
    },
    {
      id: 'site',
      heading: 'By yard: shade, traffic and upkeep',
      paragraphs: ['Within a region, the yard decides between the grasses that suit it:'],
      items: [
        'Shade, cool-season: fine fescue tolerates it best (NC State); Kentucky bluegrass grows better than tall fescue in moderate shade.',
        'Shade, warm-season: St. Augustinegrass is the most shade tolerant but still needs 4 to 6 hours of light (Texas A&M AgriLife); zoysiagrass takes light shade; centipedegrass needs 6 hours of sun; bermudagrass does not tolerate shade; buffalograss not more than half a day of heavy shade (Colorado State).',
        'Traffic: bermudagrass withstands wear and recovers fast, and zoysiagrass makes a dense, wear-tolerant lawn (NC State); centipedegrass and fine fescue do not hold up to heavy traffic.',
        'Low upkeep: centipedegrass has the lowest nitrogen needs of the common lawn grasses (NC State); buffalograss stays green on 50 to 75 percent less water than Kentucky bluegrass once established (Colorado State).',
        'Quick cover: perennial ryegrass comes up in 3 to 7 days (University of Tennessee).',
      ],
    },
    {
      id: 'label',
      heading: 'Reading the bag',
      paragraphs: [
        `Texas A&M AgriLife says the label gives the seed test date, which should be within 1 year of purchase, and the percent germination and purity. Multiply the two for the pure live seed: 85% germination × 98% purity is ${pureLivePercent}% pure live seed. A rate in pure live seed, as Arkansas gives for zoysiagrass, then takes more bulk seed: at ${pureLivePercent}%, 1 lb of pure live seed is ${bulkForOnePound} lb from the bag. Buying certified seed ensures the variety on the label is the one in the bag.`,
        'For cool-season grasses, NC State Extension recommends a blend of two or three cultivars rather than one; warm-season grasses are usually sown as a single variety.',
      ],
    },
    {
      id: 'pages',
      heading: 'Every grass, in detail',
      paragraphs: [
        'Each page gives the rates of its sources, when to sow, how long the seed takes and where the grass does well.',
      ],
      links: [
        { href: '/kentucky-bluegrass-seed', label: 'Kentucky bluegrass seed' },
        { href: '/tall-fescue-grass-seed', label: 'Tall fescue grass seed' },
        { href: '/fescue-grass-seed', label: 'Fescue grass seed: fine or tall' },
        { href: '/perennial-ryegrass-seed', label: 'Perennial ryegrass seed' },
        { href: '/bermuda-grass-seed', label: 'Bermuda grass seed' },
        { href: '/zoysia-grass-seed', label: 'Zoysia grass seed' },
        { href: '/centipede-grass-seed', label: 'Centipede grass seed' },
        { href: '/buffalo-grass-seed', label: 'Buffalo grass seed' },
        { href: '/st-augustine-grass-seed', label: 'St. Augustine grass: sod and plugs' },
        PLANTING_LINK,
        GROWING_LINK,
        UK_LINK,
      ],
    },
  ],
  questions: [
    {
      question: 'What is the best grass seed?',
      answer:
        'The one adapted to your region and yard: a cool-season grass such as Kentucky bluegrass or tall fescue in the North, tall fescue in the transition zone, a warm-season grass such as bermudagrass, zoysiagrass or centipedegrass in the South, and buffalograss on the dry Great Plains.',
    },
    {
      question: 'What grass seed grows best in shade?',
      answer:
        'Fine fescue among cool-season grasses (NC State Extension). Among warm-season grasses St. Augustinegrass takes the most shade but comes only as sod or plugs; zoysiagrass is the seeded choice for light shade.',
    },
    {
      question: 'What is the fastest growing grass seed?',
      answer:
        'Perennial ryegrass, 3 to 7 days to germinate by the University of Tennessee, against 14 to 21 days for Kentucky bluegrass.',
    },
  ],
  sources: {
    virginia: VIRGINIA,
    tennessee: TENNESSEE,
    purdue: PURDUE_SEED,
    ncState: NC_STATE,
    agrilife: AGRILIFE,
    arkansas: ARKANSAS,
    alabama: ALABAMA_CENTIPEDE,
    ncCalendar: NC_STATE_CENTIPEDE,
    nebraska: NEBRASKA_BUFFALO,
    colorado: COLORADO_BUFFALO,
    stAugustine: ST_AUGUSTINE,
  },
  calculators: ['/grass-seed-calculator'],
  card: {
    title: 'Best grass seed by region',
    summary: 'Nine lawn grasses compared by region, shade, traffic and the pounds a lawn takes.',
  },
};
