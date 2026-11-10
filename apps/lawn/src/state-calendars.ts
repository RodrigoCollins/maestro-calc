import type { CalendarStateCode } from './calendar-paths.ts';
import type { GuideSource } from './guide.ts';
import { READ, VIRGINIA } from './seed-sources.ts';

/*
 * What the land-grant extension service of each calendar state says about its lawns: the grasses
 * grown there, when to seed them and when to feed them. Every sentence restates a passage of the
 * publication it names, read on `READ`; nothing here is worked out. The frost figures of each
 * page are computed from the NOAA stations instead (`state-guides.ts`).
 */

const read = (name: string, url: string): GuideSource => ({
  name: `${name}, accessed ${READ}`,
  url,
});

/** The grass kinds a state's extension service says its lawns are grown with. */
export type GrassKind = 'cool' | 'warm';

/** One claim of a state calendar: its sentences and the publication they restate. */
export interface Claim {
  readonly text: readonly string[];
  readonly source: GuideSource;
}

export interface StateCalendar {
  readonly kinds: readonly GrassKind[];
  readonly grasses: Claim;
  readonly seed: readonly Claim[];
  readonly feed: readonly Claim[];
}

const UC_SEASONS = read(
  'UC IPM, UC Guide to Healthy Lawns, “Seasonal growth pattern of grasses”',
  'https://ipm.ucanr.edu/TOOLS/TURF/ESTABLISH/seasongrth.html',
);
const UC_FEED_COOL = read(
  'UC IPM, UC Guide to Healthy Lawns, “Zone 1 – Cool-season grasses” fertilization',
  'https://ipm.ucanr.edu/TOOLS/TURF/MAINTAIN/fertcool1.html',
);
const UC_FEED_WARM = read(
  'UC IPM, UC Guide to Healthy Lawns, “Zone 4 – Warm-season grasses” fertilization',
  'https://ipm.ucanr.edu/TOOLS/TURF/MAINTAIN/fertwarm4.html',
);
export const TX_FEED = read(
  'Texas A&M AgriLife Extension E-436, “Fertilizing Texas Lawns: 10-Point Checklist for Warm-Season Grasses”',
  'https://agrilifeextension.tamu.edu/wp-content/uploads/2025/06/Fertilizing-Texas-Lawns.pdf',
);
const TX_ZOYSIA = read(
  'Texas A&M AgriLife Extension SCSC-PU-279, “Zoysiagrass Lawn Management Guide” (2025)',
  'https://cdn-de.agrilife.org/extension/departments/scsc/scsc-pu-279/publications/files/zoysiagrass-lawn-management-guide.pdf',
);
const FL_ST_AUGUSTINE = read(
  'UF/IFAS EDIS ENH5, “St. Augustinegrass for Florida Lawns” (2024)',
  'https://edis.ifas.ufl.edu/publication/LH010/pdf',
);
const FL_ESTABLISH = read(
  'UF/IFAS EDIS ENH-03, “Establishing Your Florida Lawn” (2025)',
  'https://edis.ifas.ufl.edu/publication/LH013/pdf',
);
export const FL_FEED = read(
  'UF/IFAS EDIS SL21, “General Recommendations for Fertilization of Turfgrasses on Florida Soils” (2023)',
  'https://edis.ifas.ufl.edu/publication/LH014/pdf',
);
const CORNELL_SEED = read(
  'Cornell Turfgrass Program, “Choose Seed”',
  'https://turf.cals.cornell.edu/lawn/lawn-care-the-easiest-steps-to-an-attractive-environmental-asset/starting-fresh/choose-seed/',
);
const CORNELL_PLAN = read(
  'Cornell Turfgrass Program, “Plan Ahead”',
  'https://turf.cals.cornell.edu/lawn/lawn-care-the-easiest-steps-to-an-attractive-environmental-asset/starting-fresh/plan-ahead/',
);
export const CORNELL_FEED = read(
  'Cornell Turfgrass Program, “Feeding”',
  'https://turf.cals.cornell.edu/lawn/lawn-care-the-easiest-steps-to-an-attractive-environmental-asset/advanced-care/feeding/',
);
const CORNELL_LAW = read(
  'Cornell IPM, “Fertilizing Your Lawn”',
  'https://cals.cornell.edu/integrated-pest-management/eco-resilience/our-land-our-water/fertilizing-your-lawn',
);
const PSU_ESTABLISH = read(
  'Penn State Extension, “Lawn Establishment”',
  'https://extension.psu.edu/lawn-establishment',
);
const PSU_SEASONS = read(
  'Penn State Extension, “Lawn Management through the Seasons”',
  'https://extension.psu.edu/lawn-management-through-the-seasons',
);
export const IL_FALL = read(
  'Illinois Extension, “Five fall tips for cool-season lawn care” (2024)',
  'https://extension.illinois.edu/news-releases/five-fall-tips-cool-season-lawn-care',
);
const IL_SEED = read(
  'Illinois Extension, Over the Garden Fence, “Time to Seed” (2019)',
  'https://extension.illinois.edu/blogs/over-garden-fence/2019-08-09-time-seed',
);
const OHIO = read(
  'Ohio State University Extension HYG-5812, “Efficient Lawn Care Practices to Help Protect Ohio’s Waterways” (2022)',
  'https://ohioline.osu.edu/factsheet/hyg-5812',
);
export const UGA_CALENDAR = read(
  'UGA Cooperative Extension Circular 802, “Professional Grounds Management Calendar”',
  'https://fieldreport.caes.uga.edu/wp-content/uploads/2022/08/C802-Reviewed-2026.pdf',
);
export const UGA_SPRING = read(
  'UGA CAES Field Report, “Spring fertilization of lawns should be guided by soil testing, temperatures” (2012)',
  'https://fieldreport.caes.uga.edu/news/spring-fertilization-of-lawns-should-be-guided-by-soil-testing-temperatures/',
);
export const NC_HANDBOOK = read(
  'NC State Extension Gardener Handbook, chapter 9, “Lawns”',
  'https://content.ces.ncsu.edu/extension-gardener-handbook/9-lawns',
);
const MSU_SEED = read(
  'Michigan State University Extension E2910, “Establishing a New Lawn Using Seed” (2004, archive copy)',
  'https://archive.lib.msu.edu/DMC/extension_publications/e2910/E2910-2004.PDF',
);
const MSU_FEED = read(
  'Michigan State University, “Go Green Lawncare Tips” (2012)',
  'https://homesoiltest.msu.edu/sites/default/files/pdf/go-green-lawncare-tip-sheet-2012.pdf',
);
const RUTGERS_SEED = read(
  'Rutgers Cooperative Extension FS584, “Seeding Your Lawn” (2004)',
  'https://extension.rutgers.edu/fs584',
);
export const RUTGERS_FEED = read(
  'Rutgers Cooperative Extension FS102, “Your Lawn and Its Care” (2023)',
  'https://extension.rutgers.edu/fs102',
);
const RUTGERS_LAW = read(
  'Rutgers NJAES News, “NJ fertilizer law restrictions on home lawn applications now in effect” (2013)',
  'https://sebsnjaesnews.rutgers.edu/2013/11/nj-fertilizer-law-restrictions-on-home-lawn-applications-now-in-effect/',
);
export const VA_FEED = read(
  'Virginia Cooperative Extension 430-011, “Lawn Fertilization in Virginia” (2021)',
  'https://ext.vt.edu/content/dam/pubs_ext_vt_edu/430/430-011/SPES-334%20(1).pdf',
);
export const WSU = read(
  'Washington State University Extension EB0482E, “Home Lawns” (2015)',
  'https://wpcdn.web.wsu.edu/wp-ecommerce/uploads/sites/2/product-3730-sku-EB0482E.pdf',
);
export const ARIZONA = read(
  'University of Arizona Cooperative Extension AZ1817, “A Turfgrass Maintenance Guide for Residential and Commercial Lawns in the Low Elevation Arizona Desert” (2020)',
  'https://extension.arizona.edu/publication/turfgrass-maintenance-guide-residential-and-commercial-lawns-low-elevation-arizona',
);
const UT_CHAPTER = read(
  'UT Extension Master Gardener, “Chapter 10 – Turfgrass Management in Tennessee”',
  'https://mastergardener.tennessee.edu/chapter-10-turfgrass-management-in-tennessee/',
);
export const UT_FEED = read(
  'University of Tennessee W161-C, “Developing a Turf Fertilization Plan” (2008)',
  'https://uthort.tennessee.edu/wp-content/uploads/sites/228/2023/11/W161-C.pdf',
);
export const PURDUE_FEED = read(
  'Purdue Extension AY-22-W, “Fertilizing Established Cool-season Lawns” (2013)',
  'https://www.extension.purdue.edu/extmedia/ay/ay-22-w.pdf',
);
const PURDUE_SEED = read(
  'Purdue Extension AY-3-W, “Establishing Turfgrass Areas From Seed”',
  'https://www.extension.purdue.edu/extmedia/ay/ay-3-w.pdf',
);
const UMD = read(
  'University of Maryland Extension, “Lawn Maintenance Calendar” (2026)',
  'https://extension.umd.edu/resource/lawn-maintenance-calendar',
);
export const MIZZOU = read(
  'University of Missouri IPM, “Seeding & Fertilizing Missouri Lawns: One Size Does Not Fit All” (2014)',
  'https://ipm.missouri.edu/meg/2014/5/Seeding-and-Fertilizing-Missouri-Lawns',
);
const UW_SEED = read(
  'University of Wisconsin-Extension A3434, “Lawn Establishment and Renovation”',
  'https://barron.extension.wisc.edu/files/2023/02/Lawn-Establishment-and-Renovation.pdf',
);
const CSU_CHOOSE = read(
  'Colorado State University Extension, PlantTalk 1521, “Choosing a Lawn Grass in Colorado”',
  'https://planttalk.colostate.edu/topics/lawns/1521-choosing-lawn-grass-colorado/',
);
const CSU_SEED = read(
  'Colorado State University Extension, PlantTalk 1516, “Seeding a Lawn”',
  'https://planttalk.colostate.edu/topics/lawns/1516-seeding-lawn/',
);
export const CSU_FEED = read(
  'Colorado State University Extension, “Lawn Care Basics” (fact sheet 7.202)',
  'https://extension.colostate.edu/resource/lawn-care-basics/',
);
const CSU_FALL = read(
  'Colorado State University Extension, PlantTalk 1535, “Fall Lawn Fertilization: During Drought”',
  'https://planttalk.colostate.edu/topics/lawns/1535-fall-lawn-fertilization-drought/',
);
export const UW_FEED = read(
  'Wisconsin Horticulture, Division of Extension, “Optimum Time for Fertilizing Lawns”',
  'https://hort.extension.wisc.edu/optimum-time-for-fertilizing-lawns/',
);

/** The calendar of every state with a seed and a fertilizer page, by its postal code. */
export const STATE_CALENDARS: Readonly<Record<CalendarStateCode, StateCalendar>> = {
  CA: {
    kinds: ['cool', 'warm'],
    grasses: {
      text: [
        'The University of California says warm-season grasses (bermudagrass, buffalograss, kikuyugrass, seashore paspalum, St. Augustinegrass, zoysiagrass) perform best where summers are hot and winters mild, and cool-season grasses (Kentucky bluegrass, tall fescue, the ryegrasses and fine fescues) do best in northern and coastal climates where summers are mild.',
      ],
      source: UC_SEASONS,
    },
    seed: [
      {
        text: [
          'UC IPM: establish grasses in their period of most active growth, late spring or early summer for warm-season grasses and fall or spring for cool-season grasses.',
        ],
        source: UC_SEASONS,
      },
    ],
    feed: [
      {
        text: [
          'UC IPM: cool-season lawns grow in spring and fall and should get most of their fertilizer then, with little in the hot summer months; its cool-season schedule marks March, May, September and October.',
        ],
        source: UC_FEED_COOL,
      },
      {
        text: [
          'UC IPM: warm-season lawns are fed for the first time once fully green in spring, then through summer into fall; its warm-season schedule marks May, June, September and October.',
        ],
        source: UC_FEED_WARM,
      },
    ],
  },
  TX: {
    kinds: ['warm'],
    grasses: {
      text: [
        'Texas A&M AgriLife lists the warm-season lawn grasses of Texas: bermudagrass, buffalograss, centipedegrass, St. Augustinegrass and zoysiagrass.',
      ],
      source: TX_FEED,
    },
    seed: [
      {
        text: [
          'Texas A&M AgriLife: plant warm-season grasses in late spring or early summer, when air temperatures run between 80°F and 95°F; seed, too, does best sown then.',
        ],
        source: TX_ZOYSIA,
      },
    ],
    feed: [
      {
        text: [
          'Texas A&M AgriLife: make the first application after the second mowing of the grass (not the weeds), usually about 6 weeks after the average last spring frost date, and space later nitrogen at least 45 to 60 days apart. Its table of last fall dates runs from September 15 in Amarillo to November 1 for Abilene, Dallas and El Paso.',
        ],
        source: TX_FEED,
      },
    ],
  },
  FL: {
    kinds: ['warm'],
    grasses: {
      text: [
        'UF/IFAS calls St. Augustinegrass the most commonly used lawn grass in Florida; its establishment guide also covers bahiagrass, bermudagrass, carpetgrass, centipedegrass and zoysiagrass, all warm-season grasses.',
      ],
      source: FL_ST_AUGUSTINE,
    },
    seed: [
      {
        text: [
          'UF/IFAS: year-round planting is common in most of Florida, but the best time to seed warm-season grass is spring and summer, when it grows fastest. In north Florida, seedlings planted too late in fall may be killed by winter.',
        ],
        source: FL_ESTABLISH,
      },
    ],
    feed: [
      {
        text: [
          'UF/IFAS gives the months by grass and by part of the state, north (above Ocala), central and south (below Tampa and Vero Beach). Its basic St. Augustinegrass program feeds in April and September in north Florida and in March and September in central Florida.',
        ],
        source: FL_FEED,
      },
    ],
  },
  NY: {
    kinds: ['cool'],
    grasses: {
      text: [
        'Cornell names the common cool-season lawn grasses: Kentucky bluegrass, perennial ryegrass, tall fescue and fine fescue, and says most cool-season sod is Kentucky bluegrass.',
      ],
      source: CORNELL_SEED,
    },
    seed: [
      {
        text: [
          'Cornell: establish a lawn in late summer; the middle of August through September is most favorable, with cooler weather, enough moisture and fewer weeds.',
        ],
        source: CORNELL_PLAN,
      },
    ],
    feed: [
      {
        text: [
          'Cornell: September is the best time to apply nitrogen at every level of care; better lawns can take more in May, and the highest-quality lawns in May, June or October.',
        ],
        source: CORNELL_FEED,
      },
      {
        text: [
          'Cornell IPM: New York State law allows lawn fertilizer only between April 1 and December 1.',
        ],
        source: CORNELL_LAW,
      },
    ],
  },
  PA: {
    kinds: ['cool'],
    grasses: {
      text: [
        'Penn State says Kentucky bluegrass is the most common cool-season grass for sod in Pennsylvania, with tall fescue and fine fescues used at times, and gives cool-season mixtures for each kind of site.',
      ],
      source: PSU_ESTABLISH,
    },
    seed: [
      {
        text: [
          'Penn State: the best times to seed in Pennsylvania are mid to late spring and late summer to early fall; cool-season seed can go down from mid-spring to early fall, but late summer is the optimum in most of the state.',
        ],
        source: PSU_ESTABLISH,
      },
    ],
    feed: [
      {
        text: [
          'Penn State: most lawns are served by fertilizer with some slow-release nitrogen in mid to late spring and/or late summer to early fall.',
        ],
        source: PSU_SEASONS,
      },
    ],
  },
  IL: {
    kinds: ['cool'],
    grasses: {
      text: [
        'Illinois Extension says cool-season lawns are mainly Kentucky bluegrass, tall fescue, perennial ryegrass and fine fescue, and that most Illinois home lawns are likely of that type.',
      ],
      source: IL_FALL,
    },
    seed: [
      {
        text: [
          'Illinois Extension (a northern Illinois educator): the best window for a stand that survives the winter is August 15 through the first week of September.',
        ],
        source: IL_SEED,
      },
    ],
    feed: [
      {
        text: [
          'Illinois Extension: a lawn fed once a year should be fed before fall, August 15 to September 15 in central Illinois, early August in the northern counties and September in the southern ones; a late-season winterizer can follow one week after the last mowing.',
        ],
        source: IL_FALL,
      },
    ],
  },
  OH: {
    kinds: ['cool'],
    grasses: {
      text: [
        'Ohio State calls turf-type tall fescue a good choice for Ohio, since it performs well in full sun and moderate shade.',
      ],
      source: OHIO,
    },
    seed: [
      {
        text: [
          'Ohio State: seeding or overseeding a home lawn should ideally be finished in late August or September; spring seedings compete with too many weeds to succeed without herbicides.',
        ],
        source: OHIO,
      },
    ],
    feed: [
      {
        text: [
          'Ohio State: Ohio lawns can generally be fed in April and May, and again in September and October when needed; feeding in the summer heat makes several turf diseases worse.',
        ],
        source: OHIO,
      },
    ],
  },
  GA: {
    kinds: ['cool', 'warm'],
    grasses: {
      text: [
        'UGA gives nitrogen rates for the turfgrasses of Georgia: bermudagrass, centipedegrass, St. Augustinegrass and zoysiagrass, the warm-season grasses, and tall fescue, the cool-season one.',
      ],
      source: UGA_CALENDAR,
    },
    seed: [
      {
        text: [
          'UGA: plant cool-season grasses in the fall at least four to six weeks before the normal first fall 32°F date, and establish warm-season grasses once the soil is warm enough to start spring growth.',
        ],
        source: UGA_CALENDAR,
      },
    ],
    feed: [
      {
        text: [
          'UGA: feed tall fescue in fall and late winter, not in late spring and summer, and feed bermudagrass, St. Augustinegrass, zoysiagrass and centipedegrass once the soil 4 inches down is at or above 65°F.',
        ],
        source: UGA_SPRING,
      },
    ],
  },
  NC: {
    kinds: ['cool', 'warm'],
    grasses: {
      text: [
        'NC State says both kinds are grown in North Carolina: tall fescue, Kentucky bluegrass, fine fescues and perennial ryegrass mostly in the mountains and piedmont, and bermudagrass, zoysiagrass, centipedegrass and St. Augustinegrass in the piedmont and coastal plain.',
      ],
      source: NC_HANDBOOK,
    },
    seed: [
      {
        text: [
          'NC State: seed cool-season grasses from mid August to early October, depending on location; failing that, mid-February to early March in the piedmont, two weeks earlier on the coastal plain and two weeks later in the mountains. Warm-season grasses can be seeded between March 1 and July 1, by species and location.',
        ],
        source: NC_HANDBOOK,
      },
    ],
    feed: [
      {
        text: [
          'NC State: in the central piedmont, give cool-season grasses such as tall fescue no nitrogen after the February feeding until September, and give warm-season grasses no nitrogen in fall or winter, to limit winter injury.',
        ],
        source: NC_HANDBOOK,
      },
    ],
  },
  MI: {
    kinds: ['cool'],
    grasses: {
      text: [
        'Michigan State names Kentucky bluegrass, perennial ryegrass, tall fescue and fine fescue as the cool-season grasses commonly used in Michigan, Kentucky bluegrass the most popular.',
      ],
      source: MSU_SEED,
    },
    seed: [
      {
        text: [
          'Michigan State (a 2004 bulletin, kept as an archive copy): the best time to seed is August 15 to September 15; the second best starts in late spring or early summer, no later than June 15.',
        ],
        source: MSU_SEED,
      },
    ],
    feed: [
      {
        text: [
          'Michigan State: fall is the best time to fertilize; in spring, wait until May; never fertilize frozen or waterlogged ground.',
        ],
        source: MSU_FEED,
      },
    ],
  },
  NJ: {
    kinds: ['cool'],
    grasses: {
      text: [
        'Rutgers calls Kentucky bluegrass a popular lawn grass in New Jersey, and its seeding guide also covers tall fescue, fine fescues and perennial ryegrass.',
      ],
      source: RUTGERS_SEED,
    },
    seed: [
      {
        text: [
          'Rutgers: the primary window is late summer to early fall, the earlier dates best: August 20 to October 10 in southern New Jersey (Trenton and south), August 15 to October 5 in northern New Jersey; early spring is the second window everywhere.',
        ],
        source: RUTGERS_SEED,
      },
    ],
    feed: [
      {
        text: [
          'Rutgers: a lawn in full sun can take about 1 lb of N per 1,000 sq ft in late summer to early fall, and again in late fall if the soil test shows a need; after a late-season feeding, delay spring fertilizer until late spring.',
        ],
        source: RUTGERS_FEED,
      },
      {
        text: [
          'Rutgers: New Jersey home owners may not apply nitrogen or phosphorus fertilizer after November 15 and before March 1.',
        ],
        source: RUTGERS_LAW,
      },
    ],
  },
  VA: {
    kinds: ['cool', 'warm'],
    grasses: {
      text: [
        'Virginia Cooperative Extension says Virginia lies in the transition zone, where the climate can be hostile to both cool-season grasses (Kentucky bluegrass, tall fescue) and warm-season ones (bermudagrass, zoysiagrass).',
      ],
      source: VIRGINIA,
    },
    seed: [
      {
        text: [
          'Virginia Cooperative Extension: seed cool-season grasses August 15 to September 15 (or March to early April) in the northern Piedmont and in and west of the Blue Ridge, and September 1 to October 15 (or February and March) in the southern Piedmont and eastern Virginia. Warm-season grasses go in from May to July; hulled bermudagrass seed is not recommended in the north and west.',
        ],
        source: VIRGINIA,
      },
    ],
    feed: [
      {
        text: [
          'Virginia Cooperative Extension: the best time to fertilize cool-season grasses in Virginia is mid-August through early November, and warm-season grasses do best fed between April 1 and August 15.',
        ],
        source: VA_FEED,
      },
    ],
  },
  WA: {
    kinds: ['cool'],
    grasses: {
      text: [
        'WSU gives seed mixes for western Washington (perennial ryegrass, fine fescues, colonial bentgrass, tall fescue) and eastern Washington (Kentucky bluegrass, fine fescues, tall fescue, buffalograss), and says zoysia, bermuda, centipede and St. Augustine are not adapted to Washington.',
      ],
      source: WSU,
    },
    seed: [
      {
        text: [
          'WSU: the best seeding times in eastern Washington are April and May, then August and September; April and May are best in western Washington, where fall seedings as late as October 15 also do.',
        ],
        source: WSU,
      },
    ],
    feed: [
      {
        text: [
          'WSU suggests November 15 to December 7, April 15, June 15 and September 1 in western Washington, and November 1 to 15, May 1, June 15 and September 1 in eastern Washington; after fall nitrogen, wait until April 1 in spring.',
        ],
        source: WSU,
      },
    ],
  },
  AZ: {
    kinds: ['warm'],
    grasses: {
      text: [
        'The University of Arizona says bermudagrass is the best adapted lawn grass for the heat and water of the low desert around Phoenix, Tucson, Casa Grande and Yuma. Its guide covers the low desert only.',
      ],
      source: ARIZONA,
    },
    seed: [
      {
        text: [
          'University of Arizona: the summer months are ideal to plant a bermudagrass lawn. Ryegrass to overseed it for winter goes down September 25 to October 5 in higher Tucson and October 10 to November 10 in Phoenix, Casa Grande and Yuma.',
        ],
        source: ARIZONA,
      },
    ],
    feed: [
      {
        text: [
          'University of Arizona: in April, once the soil holds at 60°F, bermudagrass resumes growth and light feeding can begin; continue with ½ lb of N per 1,000 sq ft each month through October.',
        ],
        source: ARIZONA,
      },
    ],
  },
  TN: {
    kinds: ['cool', 'warm'],
    grasses: {
      text: [
        'UT Extension says bermudagrass and zoysiagrass are the main warm-season lawn grasses of Tennessee, centipedegrass gaining in the west, and tall fescue, fine fescues and Kentucky bluegrass the main cool-season ones.',
      ],
      source: UT_CHAPTER,
    },
    seed: [
      {
        text: [
          'UT Extension: plant Kentucky bluegrass, tall fescue and fine fescue seed in late summer or early fall, no later than mid-October; plant bermudagrass, centipedegrass or zoysiagrass between May 1 and June 30, so the plants mature before the fall frost.',
        ],
        source: UT_CHAPTER,
      },
    ],
    feed: [
      {
        text: [
          'The University of Tennessee’s example plans feed tall fescue in early March, early April, early September, mid-October and mid-November, and hybrid bermudagrass in mid-April, early June, mid-July and early September.',
        ],
        source: UT_FEED,
      },
    ],
  },
  IN: {
    kinds: ['cool'],
    grasses: {
      text: [
        'Purdue says most Midwest lawns are cool-season grasses (Kentucky bluegrass, perennial ryegrass, tall fescue, fine fescue); warm-season zoysiagrass and bermudagrass are less common, except near the Ohio River valley.',
      ],
      source: PURDUE_FEED,
    },
    seed: [
      {
        text: [
          'Purdue: August 15 to September 15 is the optimum in the northern half of Indiana, and September 1 to September 30 in the southern half.',
        ],
        source: PURDUE_SEED,
      },
    ],
    feed: [
      {
        text: [
          'Purdue: from late August through early November, up to 1 lb of N per 1,000 sq ft each month builds density; from early October to early December, mostly water-soluble N at 0.5 to 0.75 lb about every three weeks.',
        ],
        source: PURDUE_FEED,
      },
    ],
  },
  MD: {
    kinds: ['cool', 'warm'],
    grasses: {
      text: [
        'University of Maryland Extension says most Maryland lawns are tall fescue or zoysia, with fine fescue and bermudagrass grown too.',
      ],
      source: UMD,
    },
    seed: [
      {
        text: [
          'University of Maryland: late summer into early autumn is the prime season to start tall fescue, with seed or sod down no later than mid-October; zoysia is best planted in late May in central Maryland.',
        ],
        source: UMD,
      },
    ],
    feed: [
      {
        text: [
          'University of Maryland: feed tall fescue from mid-August to mid-October as the soil test shows, once more before the state’s November 15 fertilizer cutoff, and in spring from April to about mid-May; feed zoysia after it greens up, a second time no later than mid-August, and not in autumn.',
        ],
        source: UMD,
      },
    ],
  },
  MO: {
    kinds: ['cool', 'warm'],
    grasses: {
      text: [
        'The University of Missouri calls tall fescue by far the most appropriate and popular lawn grass in Missouri, Kentucky bluegrass alone suited only to the north, and Meyer zoysiagrass the most popular warm-season lawn.',
      ],
      source: MIZZOU,
    },
    seed: [
      {
        text: [
          'University of Missouri: seed cool-season grass around mid-September, so the seedlings have a full fall and spring; sprig, sod or seed warm-season grasses from mid-May to early June.',
        ],
        source: MIZZOU,
      },
    ],
    feed: [
      {
        text: [
          'University of Missouri: feed tall fescue early to mid-April, then 1 lb of N per 1,000 sq ft in mid-September and again in mid-October; feed warm-season lawns from late May or early June in two or three feedings until mid-August, and not into September.',
        ],
        source: MIZZOU,
      },
    ],
  },
  WI: {
    kinds: ['cool'],
    grasses: {
      text: [
        'The University of Wisconsin calls Kentucky bluegrass the most popular lawn grass in Wisconsin, with fine fescues, perennial ryegrass and tall fescue in its mixes.',
      ],
      source: UW_SEED,
    },
    seed: [
      {
        text: [
          'University of Wisconsin: the best time to seed is late summer through early autumn, mid-August to mid-September; early spring is the next best, April better than May.',
        ],
        source: UW_SEED,
      },
    ],
    feed: [
      {
        text: [
          'Wisconsin Horticulture: Labor Day is the optimum time to fertilize Wisconsin lawns, and every lawn benefits from an early fall nitrogen feeding.',
        ],
        source: UW_FEED,
      },
    ],
  },
  CO: {
    kinds: ['cool', 'warm'],
    grasses: {
      text: [
        'Colorado State calls Kentucky bluegrass the most widely used lawn grass in Colorado, and says buffalograss, blue grama, turf-type tall fescue, the fine fescues, perennial ryegrass and crested wheatgrass also work well.',
      ],
      source: CSU_CHOOSE,
    },
    seed: [
      {
        text: [
          'Colorado State: a lawn can be started from seed any time in the growing season, but cool-season grasses such as Kentucky bluegrass establish more easily in late summer; warm-season grasses such as buffalograss are usually seeded in May or June. A bluegrass blend is best sown in late August to early September.',
        ],
        source: CSU_SEED,
      },
    ],
    feed: [
      {
        text: [
          'Colorado State’s schedule feeds bluegrass, ryegrass and tall fescue from mid-March to April 1, in May to mid-June, from mid-August to mid-September and from early October to early November, with no nitrogen required in July and early August; buffalograss, blue grama and bermudagrass get nitrogen only from May to early August.',
          'It makes the last fall feeding while the grass is still green and at least two to three weeks before the ground freezes, and none after late September on very sandy soils.',
        ],
        source: CSU_FEED,
      },
      {
        text: [
          'Colorado State: buffalograss, blue grama, zoysiagrass and bermudagrass should get no nitrogen after September 1.',
        ],
        source: CSU_FALL,
      },
    ],
  },
};
