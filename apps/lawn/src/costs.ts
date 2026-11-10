import type { Guide, GuideSection, GuideSource, GuideTable } from './guide.ts';
import { hrefOf } from './routes.ts';
import { viewOf } from './view.ts';

/*
 * The lawn cost guides: what lawn care costs (the hub), then mowing, sod and artificial grass.
 * Every price is a published figure of a named source, with the date the source carries and the
 * day it was read; the figures worked out here (a rate times an area, a per-visit price times the
 * weeks of a season, the pallets and pounds of the calculators) say so where they appear. United
 * States prices: the site is English only.
 */

/** The day every price below was read at its source, as the byline gives it. */
const CHECKED = '2026-11-10';

const read = (name: string, url: string): GuideSource => ({
  name: `${name}, accessed ${CHECKED}`,
  url,
});

/** Every source the cost guides cite, its own date and the day it was read in its name. */
const SOURCES = {
  lsCare: read(
    'LawnStarter, “How Much Does Lawn Care Cost in 2026?”, Jane Purnell (updated October 5, 2026)',
    'https://www.lawnstarter.com/blog/cost/lawn-care-price/',
  ),
  lsMowing: read(
    'LawnStarter, “How Much Does Lawn Mowing Cost in 2026?”, Maria Isabela Reis (updated November 4, 2026)',
    'https://www.lawnstarter.com/blog/cost/lawn-mowing-price/',
  ),
  lsSod: read(
    'LawnStarter, “How Much Does Sod Cost in 2026?”, Luminita Toma (updated October 5, 2026)',
    'https://www.lawnstarter.com/blog/cost/sod-price/',
  ),
  lsArtificial: read(
    'LawnStarter, “How Much Does Artificial Grass Cost in 2026?”, Janine Caayao (updated October 5, 2026)',
    'https://www.lawnstarter.com/blog/cost/artificial-grass-price/',
  ),
  tohCare: read(
    'This Old House, “How Much Does Lawn Care Cost? (2026)” (updated May 28, 2026)',
    'https://www.thisoldhouse.com/lawns/average-lawn-care-cost',
  ),
  tohArtificial: read(
    'This Old House, “How To Install Artificial Grass” (updated June 9, 2026)',
    'https://www.thisoldhouse.com/lawns/install-artificial-grass',
  ),
  vilaMowing: read(
    'Bob Vila, “What Is the Average Lawn Mowing Cost?” (updated April 13, 2023)',
    'https://www.bobvila.com/articles/average-lawn-mowing-cost/',
  ),
  vilaSod: read(
    'Bob Vila, “Sod Prices: How Much You Can Expect to Pay” (updated June 4, 2023)',
    'https://www.bobvila.com/articles/sod-prices/',
  ),
  vilaArtificial: read(
    'Bob Vila, “How Much Does Artificial Grass Cost?” (updated June 29, 2023)',
    'https://www.bobvila.com/articles/artificial-grass-cost/',
  ),
  grassOutlet: read(
    'The Grass Outlet (Austin and San Antonio, Texas), “How Much is a Pallet of Sod Near Me?” (April 16, 2024)',
    'https://thegrassoutlet.com/how-much-is-a-pallet-of-sod-near-me/',
  ),
} as const satisfies Record<string, GuideSource>;

type SourceKey = keyof typeof SOURCES;

const pick = (...keys: SourceKey[]): Readonly<Record<string, GuideSource>> =>
  Object.fromEntries(keys.map((key) => [key, SOURCES[key]]));

/** A sum of dollars, rounded to the dollar and grouped: `3267` is `$3,267`. */
export const usd = (dollars: number): string => `$${Math.round(dollars).toLocaleString('en-US')}`;

const span = (low: number, high: number): string => `${usd(low)} to ${usd(high)}`;

/** A sum per square foot to the cent: `0.456` is `$0.46`. */
const cents = (dollars: number): string => `$${dollars.toFixed(2)}`;

/** Square feet in an acre. */
const ACRE = 43_560;

/** The lawns the cost tables run: three common areas, then the eighth, quarter, half and acre. */
export const LAWN_SIZES: readonly { readonly label: string; readonly area: number }[] = [
  ...[1000, 2500, 5000].map((area) => ({ label: `${area.toLocaleString('en-US')} sq ft`, area })),
  ...(
    [
      ['1/8', 8],
      ['1/4', 4],
      ['1/2', 2],
      ['1', 1],
    ] as const
  ).map(([fraction, parts]) => {
    const area = ACRE / parts;
    return { label: `${fraction} acre (${area.toLocaleString('en-US')} sq ft)`, area };
  }),
];

/**
 * LawnStarter's price of one mowing by lawn size (updated November 4, 2026): the largest area of
 * each bracket in square feet, then the low and the high price.
 */
const MOWING_BRACKETS = [
  [ACRE / 4, 41, 61],
  [ACRE / 2, 49, 69],
  [ACRE, 59, 114],
] as const;

/** The low and high price of one mowing of a lawn of `area` sq ft, an acre at most. */
export const mowingVisitOf = (area: number): readonly [number, number] => {
  const bracket = MOWING_BRACKETS.find(([largest]) => area <= largest);
  if (bracket === undefined) throw new Error(`no mowing bracket for ${String(area)} sq ft`);
  return [bracket[1], bracket[2]];
};

/** The shortest and the longest mowing season of LawnStarter's regional table, in weeks. */
const SHORT_SEASON = 24;
const LONG_SEASON = 46;

// the paths of the cost guides, written out: each guide links the others
const HUB_PATH = '/how-much-does-lawn-care-cost';
const MOWING_PATH = '/lawn-mowing-cost';
const SOD_PATH = '/sod-cost';
const ARTIFICIAL_PATH = '/artificial-grass-cost';

const SOD_CALCULATOR = '/sod-calculator';
const SEED_CALCULATOR = '/grass-seed-calculator';
const FERTILIZER_CALCULATOR = '/lawn-fertilizer-calculator';

const hubLink = { href: HUB_PATH, label: 'Every lawn care cost, side by side' } as const;
const frostLink = { href: hrefOf('frost-index'), label: 'Frost dates by state' } as const;
const zoneLink = { href: hrefOf('zone-index'), label: 'Planting zones' } as const;

const NOTE =
  'These are the published ranges of each source on the day shown, not a quote: prices vary by region, season and company. Ask for written quotes that list the same work before you compare them.';

/** The note every cost guide ends its prices with, as a section of its own. */
const quotesSection = (paragraph: string): GuideSection => ({
  id: 'quotes',
  heading: 'Before you compare quotes',
  paragraphs: [NOTE, paragraph],
});

const sizeTable = (
  caption: string,
  head: readonly string[],
  row: (area: number) => readonly string[],
): GuideTable => ({
  caption,
  head: ['Lawn', ...head],
  rows: LAWN_SIZES.map(({ label, area }) => [label, ...row(area)]),
});

// --- How much does lawn mowing cost ---

const MOWING_REGIONS = [
  ['Northeast', '~24 weeks', '$48–$75', '$1,152–$1,800'],
  ['Southeast', '~45 weeks', '$44–$68', '$1,980–$3,060'],
  ['Midwest', '~26 weeks', '$47–$67', '$1,222–$1,742'],
  ['Southwest', '~46 weeks', '$41–$62', '$1,886–$2,852'],
  ['West/Northwest', '~34 weeks', '$43–$69', '$1,462–$2,346'],
] as const;

/** The mowings a mower of `price` pays for at the average visit of `visit`. */
const mowingsFor = (price: number, visit: number): number => Math.ceil(price / visit);

/** How much lawn mowing costs: LawnStarter and Bob Vila, by lawn size and by season. */
export const MOWING_COST: Guide = {
  id: 'mowing-cost',
  path: MOWING_PATH,
  title: 'How Much Does Lawn Mowing Cost? By Lawn Size | Lawn Figures',
  description:
    'Lawn mowing costs $44 to $71 a visit, $57 on average: prices by lawn size up to an acre, the weekly season by region, per hour, and DIY against a service.',
  h1: 'How much does lawn mowing cost?',
  lead: 'Lawn mowing costs $44 to $71 per visit for most homeowners, $57 on average, LawnStarter’s November 2026 guide says, or $32 to $68 per hour. A lawn up to a quarter acre runs $41 to $61 a mowing and a full acre $59 to $114; a weekly season comes to $1,152 to $3,060 a year depending on how many weeks your grass grows.',
  checked: CHECKED,
  sections: [
    {
      id: 'sizes',
      heading: 'Lawn mowing cost by lawn size',
      paragraphs: [
        `LawnStarter prices one mowing by the size of the lawn: $41–$61 up to 1/4 acre, $49–$69 from 1/4 to 1/2 acre, $59–$114 from 1/2 to 1 acre, $99–$264 from 1 to 2 acres and $278–$449 over 2 acres. The table puts each common lawn in its bracket and multiplies the price by a weekly season of ${String(SHORT_SEASON)} weeks, the shortest in LawnStarter’s regional table (the Northeast), and of ${String(LONG_SEASON)} weeks, the longest (the Southwest). The seasons are our arithmetic, not LawnStarter’s.`,
        'An acre is 43,560 square feet, so a quarter acre is 10,890 and an eighth 5,445. LawnStarter’s lawn care guide puts the average lawn at 8,712 square feet, between the two.',
      ],
      table: sizeTable(
        `Lawn mowing cost per visit by lawn size (LawnStarter, November 2026), and a weekly season of ${String(SHORT_SEASON)} and ${String(LONG_SEASON)} weeks (our arithmetic)`,
        ['Per visit', `${String(SHORT_SEASON)}-week season`, `${String(LONG_SEASON)}-week season`],
        (area) => {
          const [low, high] = mowingVisitOf(area);
          return [
            span(low, high),
            span(low * SHORT_SEASON, high * SHORT_SEASON),
            span(low * LONG_SEASON, high * LONG_SEASON),
          ];
        },
      ),
      links: [
        { href: SOD_CALCULATOR, label: 'Measure your lawn in the sod calculator' },
        { href: FERTILIZER_CALCULATOR, label: 'Fertilizer for the same lawn' },
      ],
    },
    {
      id: 'season',
      heading: 'Per visit or per season',
      paragraphs: [
        'A service bills by the visit, but what you pay in a year is the visit times the weeks your grass grows. LawnStarter’s regional table counts about 24 weekly mowings in the Northeast and 26 in the Midwest, against 45 in the Southeast and 46 in the Southwest, so a cheaper visit in the South can still cost more in a year.',
        'Your own season runs roughly from the last spring freeze to the first fall freeze of your area: count the weeks between the two dates of your nearest weather station to see which row is closer to yours.',
      ],
      table: {
        caption: 'Weekly mowing by region (LawnStarter, November 2026)',
        head: ['Region', 'Season', 'Per week', 'Per year'],
        rows: MOWING_REGIONS,
      },
      links: [frostLink],
    },
    {
      id: 'drivers',
      heading: 'What raises the price of a mowing',
      paragraphs: [
        'Size comes first, then the work inside it. Areas that are uneven, steep or have to be worked around, like trees, shrubs or landscaping features, take longer to mow and cost more, LawnStarter says, and labor costs more in urban and suburban areas than in rural ones. This Old House adds that a hilly lawn brings extra cost to the monthly price.',
        'Letting the grass go costs extra too: most companies charge a long grass fee if the grass is over 6 to 12 inches, LawnStarter says. A visit usually takes 30 to 60 minutes.',
      ],
      items: [
        'By the hour: $32 to $68 per hour (LawnStarter, 2026); Bob Vila’s 2023 guide gave $25 to $60 per hour.',
        'By the square foot: $0.01 to $0.06 per square foot, both sources; Bob Vila says that rate is for smaller yards.',
        'By the acre: Bob Vila’s 2023 guide put 1 acre at $150 to $200 a mowing, against $59 to $114 in LawnStarter’s 2026 table.',
        'Across all sizes: Bob Vila’s 2023 guide gave $48 to $206 a visit, $124 on average, a range that runs up to lawns of several acres.',
      ],
    },
    {
      id: 'diy',
      heading: 'Mowing it yourself',
      paragraphs: [
        `LawnStarter puts the upfront cost of mowing your own lawn at about $325 for a walk-behind mower, plus gas, oil and maintenance. At its $57 average visit, that mower costs about ${String(mowingsFor(325, 57))} mowings by a service (our arithmetic: $325 ÷ $57 is 5.7), so it pays for itself within one season.`,
        'Bob Vila’s 2023 guide priced a gas-powered mower at about $300, a battery or electric model at about $200, a rider mower at $1,500 to $5,000, and a weed eater and a leaf blower at $80 and $200.',
        `On a half acre to an acre, where LawnStarter’s mowing runs $59 to $114 a visit, a $1,500 rider costs about ${String(mowingsFor(1500, 114))} to ${String(mowingsFor(1500, 59))} mowings by a service (our arithmetic), a season or less of weekly visits in most regions.`,
      ],
      links: [
        { href: hrefOf('timing-guide'), label: 'When to fertilize and seed your lawn' },
        zoneLink,
      ],
    },
    {
      id: 'more',
      heading: 'What a mowing does not include',
      paragraphs: [
        'Bob Vila’s 2023 guide lists the services sold beside a mowing: aeration $80 to $200, fertilization $80 to $380, leaf removal $200 to $500 and weeding $40 to $120. The hub sets them beside one another with the 2026 prices of LawnStarter and This Old House.',
      ],
      links: [hubLink, { href: hrefOf('aeration-guide'), label: 'When to aerate your lawn' }],
    },
    quotesSection(
      'Ask whether the price covers trimming and edging, blowing the clippings off the paths and bagging them, and whether a missed week is billed as a long grass mowing.',
    ),
  ],
  questions: [
    {
      question: 'How much does it cost to have a lawn mowed?',
      answer:
        'LawnStarter puts it at $44 to $71 per visit for most homeowners, $57 on average (updated November 4, 2026), or $32 to $68 per hour.',
    },
    {
      question: 'How much does it cost to mow an acre?',
      answer:
        'LawnStarter’s 2026 table gives $59 to $114 for a lawn of 1/2 to 1 acre and $99 to $264 for 1 to 2 acres. Bob Vila’s 2023 guide put 1 acre at $150 to $200.',
    },
    {
      question: 'How much does weekly mowing cost for a year?',
      answer:
        'LawnStarter’s regional table runs from $1,152 to $1,800 in the Northeast, about 24 weeks, to $1,980 to $3,060 in the Southeast, about 45 weeks.',
    },
    {
      question: 'Is it cheaper to mow your own lawn?',
      answer:
        'Over a season, yes: LawnStarter puts a walk-behind mower at about $325 plus gas, oil and maintenance, about 6 mowings at its $57 average.',
    },
  ],
  sources: pick('lsMowing', 'vilaMowing', 'tohCare', 'lsCare'),
  calculators: [],
  card: {
    title: 'Lawn mowing cost',
    summary: 'Per visit by lawn size, per weekly season by region, and DIY against a service.',
  },
};

// --- How much does sod cost ---

/** The installed and the material price of LawnStarter by grass, per square foot. */
const SOD_TYPES = [
  ['Bahia', '$0.20–$0.33', '$0.77–$1.26'],
  ['Ryegrass', '$0.28–$0.58', '$0.85–$1.51'],
  ['Kentucky Bluegrass', '$0.29–$0.43', '$0.86–$1.36'],
  ['Fescue', '$0.32–$0.67', '$0.89–$1.60'],
  ['St. Augustine', '$0.41–$0.86', '$0.98–$1.79'],
  ['Bermudagrass', '$0.44–$0.83', '$1.01–$1.76'],
  ['Zoysia', '$0.47–$0.72', '$1.04–$1.65'],
  ['Bentgrass', '$0.53–$0.66', '$1.10–$1.59'],
  ['Centipede', '$0.78–$0.85', '$1.35–$1.78'],
] as const;

/** The Grass Outlet's pallets of 450 sq ft: the grass, the pre-order and the same-day price. */
const OUTLET_PALLETS = [
  ['Raleigh St. Augustine', 205, 320],
  ['Texas Native St. Augustine', 230, undefined],
  ['Palmetto St. Augustine', 240, undefined],
  ['419 Tifway Bermuda', 220, 270],
  ['Celebration Bermuda', 225, undefined],
  ['Palisades Zoysia', 315, 390],
  ['Zeon Zoysia', 325, undefined],
  ['Density Buffalo', 315, undefined],
] as const;

const PALLET = 450;

/** LawnStarter's average price of sod alone and installed, in cents per square foot. */
const SOD_ALONE_CENTS = 60;
const SOD_INSTALLED_CENTS = 165;

const sodOf = (area: number) => {
  const values = viewOf('sod', { area: String(area), pallet: String(PALLET) })?.values;
  if (values === undefined) throw new Error(`the sod calculator must run at ${String(area)} sq ft`);
  return values;
};

/** How much sod costs: LawnStarter, Bob Vila and a sod farm's price list, worked out by size. */
export const SOD_COST: Guide = {
  id: 'sod-cost',
  path: SOD_PATH,
  title: 'How Much Does Sod Cost? Per Pallet and Sq Ft | Lawn Figures',
  description:
    'Sod costs about $0.60 a square foot, $1.65 installed, and $150 to $450 a pallet: the pallets and price for lawns up to an acre, by grass, and DIY against a pro.',
  h1: 'How much does sod cost?',
  lead: 'Sod costs about $0.60 per square foot for the grass alone and about $1.65 per square foot installed, LawnStarter’s October 2026 guide says, and a pallet of 450 to 500 square feet costs $150 to $450. A 1,000 sq ft lawn takes 3 pallets of 450 sq ft: about $600 of sod, or $1,650 laid by a crew.',
  checked: CHECKED,
  sections: [
    {
      id: 'sizes',
      heading: 'Sod cost by lawn size',
      paragraphs: [
        `The pallets and slabs are the sod calculator’s, at pallets of ${String(PALLET)} sq ft and slabs of 16 × 24 in with no waste added; the prices are LawnStarter’s average rates times the area, our arithmetic. LawnStarter’s own example: a 2,000 sq ft yard comes to about $3,300 installed against $1,200 for the sod alone.`,
        'Order a little more than the area for cuts along beds and curves: the calculator adds the waste you set.',
      ],
      table: sizeTable(
        `Sod by lawn size: pallets of ${String(PALLET)} sq ft and 16 × 24 in slabs (sod calculator), sod alone at $0.60 and installed at $1.65 per square foot (LawnStarter, October 2026)`,
        ['Pallets', 'Slabs', 'Sod alone', 'Installed'],
        (area) => {
          const sod = sodOf(area);
          return [
            sod['pallets'] ?? '',
            sod['slabs'] ?? '',
            usd((area * SOD_ALONE_CENTS) / 100),
            usd((area * SOD_INSTALLED_CENTS) / 100),
          ];
        },
      ),
      links: [{ href: SOD_CALCULATOR, label: 'Work out your pallets and slabs' }],
    },
    {
      id: 'pallets',
      heading: 'What a pallet costs',
      paragraphs: [
        'A pallet of sod will cost you between $150 to $450, covering about 450 to 500 square feet, LawnStarter says, and each sod roll costs $4 to $7.50 without delivery. Bob Vila’s 2023 guide gave the same $150 to $450 per pallet, with an average of $300, and rolls of about 10 square feet at $3 to $8.',
        'A sod farm’s own list shows where those ranges come from. The Grass Outlet, which sells in Austin and San Antonio, Texas, prices a full pallet of 160 pieces covering about 450 square feet; its April 2024 list is below, with the price per square foot worked out on 450 (our arithmetic). Prices change: ask your farm for today’s.',
      ],
      table: {
        caption:
          'Sod per pallet of 450 sq ft, a Texas sod farm (The Grass Outlet, April 2024; the price per square foot is our arithmetic on the pre-order price)',
        head: ['Grass', 'Pre-order', 'Same day', 'Per sq ft'],
        rows: OUTLET_PALLETS.map(([grass, preorder, sameDay]) => [
          grass,
          usd(preorder),
          sameDay === undefined ? 'Pre-order only' : usd(sameDay),
          cents(preorder / PALLET),
        ]),
      },
      links: [
        { href: hrefOf('st-augustine-seed'), label: 'St. Augustine grass: sod, plugs or seed' },
        { href: hrefOf('zoysia-seed'), label: 'Zoysia grass seed' },
      ],
    },
    {
      id: 'grass',
      heading: 'Sod cost by grass type',
      paragraphs: [
        'The grass changes the price more than anything but the area. In LawnStarter’s table Bahia is the cheapest and centipede the dearest; the warm-season grasses of the South, St. Augustine, Bermuda and zoysia, sit near the top.',
      ],
      table: {
        caption: 'Sod per square foot by grass, alone and installed (LawnStarter, October 2026)',
        head: ['Grass', 'Sod alone', 'Installed'],
        rows: SOD_TYPES,
      },
      links: [
        { href: hrefOf('bermuda-seed'), label: 'Bermuda grass seed' },
        { href: SEED_CALCULATOR, label: 'Seeding instead: the grass seed calculator' },
        zoneLink,
      ],
    },
    {
      id: 'install',
      heading: 'Labor, delivery and the ground under it',
      paragraphs: [
        'The labor fees for sod installation typically range from $37.50 to $77.50 per hour, or $0.55 to $1 per square foot, LawnStarter says; Bob Vila’s 2023 guide gave $0.15 to $0.60 per square foot. Delivery adds $65 to $230 by LawnStarter, $90 and $350 by Bob Vila.',
        'Complex terrain raises the final price by approximately 15% to 20%, LawnStarter says. The ground has to be ready before the sod arrives, and that work is priced apart:',
      ],
      items: [
        'Removing weeds and old grass: $0.88 to $1.84 per square foot.',
        'Tilling and grading: $0.90 to $2 per square foot.',
        'Soil testing: $12 to $30 per sample.',
        'Topsoil: $12 to $50 per cubic yard.',
        'A sprinkler system: $0.29 to $0.48 per square foot.',
      ],
      links: [
        { href: hrefOf('lawn-lime'), label: 'Lime from your soil test' },
        { href: FERTILIZER_CALCULATOR, label: 'Starter fertilizer in pounds' },
      ],
    },
    {
      id: 'diy',
      heading: 'Laying sod yourself',
      paragraphs: [
        'For 1,000 square feet, installing sod yourself costs from $732 to $1,354 (or $0.70 to $1.30 per square foot), LawnStarter says, against between $1,000 and $2,200 for a pro. Tool rental adds $75 to $150 per day.',
        'Bob Vila’s 2023 guide adds fertilizer at around $10 per 1,000 square feet and a sod roller at $15 to $25 a day.',
      ],
      links: [hubLink],
    },
    {
      id: 'when',
      heading: 'When to lay it',
      paragraphs: [
        'The best weeks to lay sod depend on your grass and your climate. The planting guide gives the extension windows to establish warm-season and cool-season lawns, and your frost dates place them on your own calendar.',
      ],
      links: [frostLink, { href: hrefOf('planting-guide'), label: 'When to plant grass seed' }],
    },
    quotesSection(
      'Ask whether the quote includes removing the old lawn, grading, delivery and the first watering, and how many square feet of sod it orders for your area.',
    ),
  ],
  questions: [
    {
      question: 'How much does a pallet of sod cost?',
      answer:
        'LawnStarter puts a pallet of 450 to 500 square feet at $150 to $450 (October 2026). A Texas sod farm, The Grass Outlet, listed pallets of 450 square feet from $205 to $325 pre-ordered in April 2024.',
    },
    {
      question: 'How much does sod cost per square foot?',
      answer:
        'About $0.60 per square foot for the sod alone and about $1.65 per square foot installed, LawnStarter says.',
    },
    {
      question: 'How many pallets of sod do I need for a quarter acre?',
      answer:
        'A quarter acre is 10,890 square feet: 25 pallets of 450 square feet with no waste added, by the sod calculator, about $6,534 of sod at $0.60 per square foot.',
    },
    {
      question: 'Is it cheaper to lay sod yourself?',
      answer:
        'For 1,000 square feet LawnStarter puts DIY at $732 to $1,354 against $1,000 to $2,200 for a pro, plus $75 to $150 a day for tools.',
    },
  ],
  sources: pick('lsSod', 'vilaSod', 'grassOutlet'),
  calculators: [SOD_CALCULATOR],
  card: {
    title: 'Sod cost',
    summary: 'Pallets and price by lawn size, a sod farm’s list, by grass, and DIY against a pro.',
  },
};

// --- How much does artificial grass cost ---

const TURF_AREAS = [250, 500, 1000, 2500, 5000] as const;

/** How much artificial grass costs: LawnStarter, This Old House and Bob Vila, by area. */
export const ARTIFICIAL_COST: Guide = {
  id: 'artificial-grass-cost',
  path: ARTIFICIAL_PATH,
  title: 'How Much Does Artificial Grass Cost? By Size | Lawn Figures',
  description:
    'Artificial grass costs $15 to $19 a square foot installed: prices from 250 sq ft to a quarter acre, materials, slopes and curves, upkeep, and sod compared.',
  h1: 'How much does artificial grass cost?',
  lead: 'Artificial grass costs $15 to $19 per square foot installed, materials and labor included, LawnStarter (October 2026) and This Old House (June 2026) both say. The average project covers about 500 square feet and costs $7,400 to $9,350 with mid-quality turf, LawnStarter says; the same 500 square feet of sod laid comes to about $825 at its average of $1.65 per square foot.',
  checked: CHECKED,
  sections: [
    {
      id: 'sizes',
      heading: 'Artificial grass cost by area',
      paragraphs: [
        'The table multiplies the installed rate of $15 to $19 per square foot, and This Old House’s material rate of $2–$8 per square foot, by each area (our arithmetic). LawnStarter’s average project is about 500 square feet, so the table starts at 250 square feet and stops at a quarter acre.',
      ],
      table: {
        caption:
          'Artificial grass by area: installed at $15 to $19 per square foot (LawnStarter, This Old House) and the turf alone at $2 to $8 (This Old House), our arithmetic',
        head: ['Area', 'Installed', 'Turf alone'],
        rows: [
          ...TURF_AREAS.map((area) => ({ label: `${area.toLocaleString('en-US')} sq ft`, area })),
          ...LAWN_SIZES.filter(({ area }) => area > 5000 && area <= ACRE / 4),
        ].map(({ label, area }) => [label, span(area * 15, area * 19), span(area * 2, area * 8)]),
      },
      links: [{ href: SOD_CALCULATOR, label: 'Measure the area in the sod calculator' }],
    },
    {
      id: 'materials',
      heading: 'The turf and the labor',
      paragraphs: [
        'The cost of artificial grass materials typically ranges from $2–$8 per square foot, This Old House says, and professional installation labor from $4–$12 per square foot. LawnStarter puts the labor at $3.45 to $12 per square foot.',
        'The fiber sets the material price. LawnStarter lists polypropylene at $2 to $6.35 per square foot, polyethylene at $2.20 to $4.10 and nylon at $5 to $6.40; Bob Vila’s 2023 guide gave nylon $5 to $6, polypropylene $2 to $6 and polyethylene $2 to $4.',
        'Under the turf goes a base: Bob Vila’s 2023 guide prices crushed rock and decomposed granite at $0.30 to $0.70 per square foot and landscaping fabric at $0.40 to $0.80.',
      ],
    },
    {
      id: 'drivers',
      heading: 'What raises the price',
      paragraphs: [
        'Installing artificial grass on a curved area can add 15% to 20% to the cost, and on a slope expect a 50% to 60% increase, LawnStarter says. The old lawn has to come out first: grass removal runs $0.88 to $1.84 per square foot, and landscape edging $2 to $11.50 per linear foot.',
        'Bob Vila’s 2023 guide, citing Angi and HomeAdvisor, gave a range of $2,961 to $7,792 per project with a national average of $5,358, and found the price higher in Boston, about $7,200 on average, than in Detroit, around $4,500.',
      ],
    },
    {
      id: 'diy',
      heading: 'Installing it yourself',
      paragraphs: [
        'LawnStarter works a DIY install out at $7.65 per square foot for polypropylene, $6.63 for polyethylene and $9.18 for nylon, materials and tools included, against the $15 to $19 of a crew.',
      ],
      links: [hubLink],
    },
    {
      id: 'sod',
      heading: 'Artificial grass or sod',
      paragraphs: [
        'On 1,000 square feet, artificial grass installed comes to $15,000 to $19,000; sod laid by a crew comes to about $1,650 at LawnStarter’s average of $1.65 per square foot. The turf then costs around $250 to $350 a year to maintain, LawnStarter says, with no watering, fertilizing or mowing, and lasts 15 to 20 years by This Old House (20 years or more by Bob Vila).',
        'A sod lawn costs less to put in and more to keep: a weekly mowing season alone runs $1,152 to $3,060 a year in LawnStarter’s regional table, before fertilizer and water.',
      ],
      links: [
        { href: SOD_PATH, label: 'What sod costs' },
        { href: MOWING_PATH, label: 'What mowing costs' },
      ],
    },
    {
      id: 'climate',
      heading: 'Where real grass is hard to keep',
      paragraphs: [
        'If you are pricing turf because grass will not grow in a spot, check first whether a grass suited to your zone and your frost dates would: the seed guides compare the warm-season and cool-season grasses and where each one does well.',
      ],
      links: [
        zoneLink,
        frostLink,
        { href: hrefOf('best-seed'), label: 'The best grass seed for your lawn' },
      ],
    },
    quotesSection(
      'Ask what the quote includes under the turf: removing the old lawn, the depth of the base, the weed barrier, the infill and the edging, and the warranty on the turf and the labor.',
    ),
  ],
  questions: [
    {
      question: 'How much does artificial grass cost per square foot?',
      answer:
        '$15 to $19 per square foot installed, materials and labor included, by LawnStarter and This Old House; the turf alone is $2 to $8 per square foot by This Old House.',
    },
    {
      question: 'How much does 1,000 square feet of artificial grass cost?',
      answer:
        'At $15 to $19 per square foot installed, $15,000 to $19,000, our arithmetic on the rates of LawnStarter and This Old House.',
    },
    {
      question: 'Does artificial grass cost more on a slope?',
      answer:
        'Yes: LawnStarter says to expect a 50% to 60% increase on a slope, and 15% to 20% more on a curved area.',
    },
  ],
  sources: pick('lsArtificial', 'tohArtificial', 'vilaArtificial', 'lsSod', 'lsMowing'),
  calculators: [],
  card: {
    title: 'Artificial grass cost',
    summary: 'Installed and material prices from 250 sq ft to a quarter acre, against sod.',
  },
};

// --- How much does lawn care cost (the hub) ---

const SERVICES = [
  ['Mowing', '$42–$68 per visit'],
  ['Weeding', '$50–$210'],
  ['Fertilization', '$67–$405'],
  ['Aeration', '$107–$202'],
  ['Dethatching', '$65–$165'],
  ['Leaf removal', '$107–$435'],
  ['Seeding', '$427–$1,514'],
  ['Hydroseeding', '$0.07–$0.21 per sq ft'],
  ['Sod installation', '$2,028–$3,394'],
] as const;

/** Bob Vila's DIY fertilizer, in dollars per 1,000 sq ft. */
const DIY_FEED = 10;

const calculatorOf = (id: 'lawn-fertilizer' | 'grass-seed', area: number): string => {
  const values = viewOf(id, { area: String(area) })?.values;
  if (values === undefined) throw new Error(`${id} must run at ${String(area)} sq ft`);
  return `${values['pounds'] ?? ''} lb`;
};

/** A Midwest quarter acre: LawnStarter's weekly season, This Old House's plan and aeration. */
const MIDWEST = [1222, 1742] as const;
const PLAN = 395;
const AERATION = 175;

/** How much lawn care costs: the services side by side, by lawn size and by year. */
export const COST_HUB: Guide = {
  id: 'lawn-care-cost',
  path: HUB_PATH,
  title: 'How Much Does Lawn Care Cost? Prices by Service | Lawn Figures',
  description:
    'Lawn care costs $100 to $410 a month, mowing $42 to $68 a visit: every service priced, by lawn size, per visit and per year, with what you can do yourself.',
  h1: 'How much does lawn care cost?',
  lead: 'Regular lawn care costs $100 to $410 per month, LawnStarter’s October 2026 guide says, from mowing at $42–$68 per visit to sod installation at $2,028–$3,394. This Old House puts a lawn care service at around $300 on average, most from $100 to $500, and an annual fertilizer and weed plan at $395.',
  checked: CHECKED,
  sections: [
    {
      id: 'services',
      heading: 'Lawn care cost by service',
      paragraphs: [
        'Each service is priced for an average lawn, which LawnStarter puts at 8,712 square feet. Mowing is billed by the visit; the rest are a visit or two a year.',
      ],
      table: {
        caption: 'Lawn care cost by service (LawnStarter, October 2026)',
        head: ['Service', 'Cost'],
        rows: SERVICES,
      },
      links: [
        { href: MOWING_PATH, label: 'What lawn mowing costs' },
        { href: SOD_PATH, label: 'What sod costs' },
        { href: ARTIFICIAL_PATH, label: 'What artificial grass costs' },
      ],
    },
    {
      id: 'sizes',
      heading: 'By lawn size',
      paragraphs: [
        'The mowing price is LawnStarter’s bracket for each size. The fertilizer is the fertilizer calculator at its starting values, a 24-0-0 product at 1 lb of nitrogen per 1,000 sq ft for one feeding, priced at the $10 per 1,000 square feet of Bob Vila’s 2023 guide; the seed is the grass seed calculator’s Kentucky bluegrass at Virginia Tech’s 2 to 3 lb per 1,000 sq ft for a new lawn.',
      ],
      table: sizeTable(
        'Lawn care by lawn size: one mowing (LawnStarter, November 2026), one feeding in pounds (fertilizer calculator) and its cost at $10 per 1,000 sq ft (Bob Vila, 2023), and seed for a new lawn (grass seed calculator)',
        ['Mowing, per visit', 'Fertilizer, one feeding', 'Fertilizer cost, DIY', 'Seed, new lawn'],
        (area) => {
          const [low, high] = mowingVisitOf(area);
          return [
            span(low, high),
            calculatorOf('lawn-fertilizer', area),
            usd((area * DIY_FEED) / 1000),
            calculatorOf('grass-seed', area),
          ];
        },
      ),
      links: [
        { href: FERTILIZER_CALCULATOR, label: 'Fertilizer from the numbers on your bag' },
        { href: SEED_CALCULATOR, label: 'Seed for your grass and lawn' },
        { href: SOD_CALCULATOR, label: 'Sod pallets for your lawn' },
      ],
    },
    {
      id: 'year',
      heading: 'Per visit, per month or per year',
      paragraphs: [
        'Companies sell lawn care three ways: by the visit, by the month and as an annual plan. This Old House requested quotes for 20 annual plans from Weed Man, TruGreen, Sunday Lawn Care and Lawnbright and found an average of $395; TruGreen’s plans ran $558 to $890 per year, Sunday’s mail-order plans $200 to $250 and Lawnbright’s around $200, and a one-time aeration averaged $175.',
        `A year of care for a quarter-acre lawn in the Midwest, worked out on those figures: weekly mowing at LawnStarter’s $1,222 to $1,742 for about 26 weeks, the $395 plan and one $175 aeration, ${span(MIDWEST[0] + PLAN + AERATION, MIDWEST[1] + PLAN + AERATION)} in all (our arithmetic). A longer southern season adds mowings: the Southeast runs about 45 weeks.`,
        'LawnStarter likens a recurring package plan to buying lawn care in bulk, instead of paying for each service separately.',
      ],
      links: [frostLink],
    },
    {
      id: 'drivers',
      heading: 'What drives the price',
      paragraphs: [
        'LawnStarter names the lawn’s size, obstacles such as stumps and roots, the lawn’s condition (a neglected lawn needs costlier treatments) and the provider’s experience. This Old House adds trees, fences and rocks to work around, steep hills, and travel time. LawnStarter’s city figures run from $44–$3,086 in Dothan, Alabama to $59–$3,964 in New York.',
      ],
      items: [
        'Region: the length of the growing season sets how many mowings a year you pay for.',
        'Frequency: weekly mowing keeps the grass short; a lawn left over 6 to 12 inches gets a long grass fee.',
        'Slope and access: hills and tight gates take longer and other machines.',
        'Extras: edging, bagging, leaf removal and weeding are priced apart.',
      ],
    },
    {
      id: 'diy',
      heading: 'What you can do yourself',
      paragraphs: [
        'Mowing, feeding and seeding are the jobs most owners do themselves. Bob Vila’s 2023 guide puts DIY fertilizer at around $10 per 1,000 square feet a feeding, against $67 to $405 for a fertilization visit in LawnStarter’s table; the calculators turn the numbers on the bag into the pounds for your spreader.',
        'Aeration, dethatching and sod call for machines most owners rent: LawnStarter puts sod tool rental at $75 to $150 a day. Time each job to your grass and your frost dates so you pay for it once.',
      ],
      links: [
        { href: hrefOf('aeration-guide'), label: 'When to aerate your lawn' },
        { href: hrefOf('pre-emergent-guide'), label: 'When to apply pre-emergent' },
        { href: hrefOf('timing-guide'), label: 'When to fertilize and seed your lawn' },
        zoneLink,
      ],
    },
    quotesSection(
      'Compare plans by what each visit does, how many visits a year it buys and whether it includes the products, then set the price beside doing the same work yourself.',
    ),
  ],
  questions: [
    {
      question: 'How much does lawn care cost per month?',
      answer: 'LawnStarter puts regular lawn maintenance at $100 to $410 per month (October 2026).',
    },
    {
      question: 'How much does a lawn care plan cost per year?',
      answer:
        'This Old House found an average of $395 across 20 annual plans of Weed Man, TruGreen, Sunday Lawn Care and Lawnbright; TruGreen’s ran $558 to $890 per year.',
    },
    {
      question: 'What is the most expensive lawn care service?',
      answer:
        'In LawnStarter’s table, sod installation at $2,028 to $3,394, then seeding at $427 to $1,514. Artificial grass costs more still: $15 to $19 per square foot installed.',
    },
  ],
  sources: pick('lsCare', 'tohCare', 'lsMowing', 'vilaSod', 'lsSod', 'lsArtificial'),
  calculators: [FERTILIZER_CALCULATOR, SEED_CALCULATOR, SOD_CALCULATOR],
  card: {
    title: 'How much lawn care costs',
    summary: 'Every service priced, by lawn size and per year, with mowing, sod and turf.',
  },
};

/** The cost guides, the hub first. */
export const COST_GUIDES: readonly Guide[] = [COST_HUB, MOWING_COST, SOD_COST, ARTIFICIAL_COST];
