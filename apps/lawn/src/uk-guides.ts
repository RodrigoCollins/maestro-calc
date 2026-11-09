import { Rational } from '@maestro-calc/core';
import { fieldText, amountText } from './format.ts';
import type { Guide } from './guide.ts';
import {
  BEST_SEED_LINK,
  GROWING_LINK,
  PLANTING_LINK,
  PURDUE_SEED,
  SEED_CALCULATOR,
  TENNESSEE,
  UK_LINK,
  VIRGINIA,
} from './seed-sources.ts';
import { G_PER_LB } from './units.ts';
import { viewOf } from './view.ts';

/** The day the UK and germination sources below were read. */
const READ_UK = '2026-11-09';
const read = (name: string): string => `${name}, accessed ${READ_UK}`;

const RHS_SEED = {
  name: read('Royal Horticultural Society (RHS), “Starting a Lawn from Seed”'),
  url: 'https://www.rhs.org.uk/lawns/lawns-from-seed',
};
const RHS_REPAIR = {
  name: read('Royal Horticultural Society (RHS), “Repairing Lawns: Reseeding and Returfing”'),
  url: 'https://www.rhs.org.uk/lawns/repairing',
};
const JOHNSONS_FAQ = {
  name: read('Johnsons Lawn Seed (DLF Seeds), “Frequently Asked Questions”'),
  url: 'https://www.johnsonslawnseed.com/faq',
};
const JOHNSONS_SOWING = {
  name: read('Johnsons Lawn Seed (DLF Seeds), “How to sow a new lawn”'),
  url: 'https://www.johnsonslawnseed.com/help/lawn/sowing',
};
const JOHNSONS_OVERSEEDING = {
  name: read('Johnsons Lawn Seed (DLF Seeds), “How to Overseed/Reseed an Existing Lawn”'),
  url: 'https://www.johnsonslawnseed.com/help/lawn/overseeding',
};
const JOHNSONS_REPAIR = {
  name: read('Johnsons Lawn Seed (DLF Seeds), “How to Repair A Dead Patch Of Grass”'),
  url: 'https://www.johnsonslawnseed.com/help/lawn/repair',
};
const GARDENERS_WORLD = {
  name: read('BBC Gardeners’ World Magazine, “How Long Does Grass Seed Take to Grow?” (2019)'),
  url: 'https://www.gardenersworld.com/how-to/grow-plants/how-long-does-grass-seed-take-to-grow/',
};
const AMENITY = {
  name: read('Amenity Choice (Agrovista UK), “How To Germinate and Establish Grass Seed” (2023)'),
  url: 'https://www.amenity.co.uk/blogs/news/a-guide-to-germination-and-establishment-of-grass-seed',
};
const MET_OFFICE = {
  name: read('Met Office, location-specific long-term averages, UK 1991-2020'),
  url: 'https://www.metoffice.gov.uk/research/climate/maps-and-data/location-specific-long-term-averages/index.html',
};
const MARYLAND = {
  name: read('University of Maryland Extension, “Starting a New Lawn” (updated March 16, 2026)'),
  url: 'https://extension.umd.edu/resource/starting-new-lawn',
};

/** A Celsius figure in Fahrenheit, to the nearest degree: `46°F`. */
export const fahrenheitText = (celsius: number): string =>
  `${String(Math.round((celsius * 9) / 5 + 32))}°F`;

/** Grams in an ounce (1/16 lb) and square metres in a square yard (0.9144² m), exact. */
const G_PER_OZ = G_PER_LB.div(Rational.of(16));
const M2_PER_SQ_YD = Rational.of(9144 * 9144, 100_000_000);

const ounces = (gramsPerM2: number): string =>
  amountText(Rational.of(gramsPerM2).mul(M2_PER_SQ_YD).div(G_PER_OZ), 1);

/** A rate in g/m² in ounces per square yard, to one decimal: `1.0 oz`. */
export const ouncesText = (gramsPerM2: number): string => `${ounces(gramsPerM2)} oz`;

/** A range of rates in g/m² in ounces per square yard: `1.0 to 1.5 oz per sq yd`. */
const ouncesRange = (low: number, high: number): string =>
  `${low === high ? '' : `${ounces(low)} to `}${ouncesText(high)} per sq yd`;

/**
 * The seed a lawn of `area` m² takes at `low` to `high` g/m², in kilograms with the pounds:
 * `1.75 to 2.5 kg (3.9 to 5.5 lb)`, or one figure when the two rates are the same.
 */
export const kilogramsText = (low: number, high: number, area: number): string => {
  const kilos = (rate: number) => Rational.of(rate * area, 1000);
  const kg = (rate: number) => fieldText(kilos(rate));
  const lb = (rate: number) => amountText(Rational.of(rate * area).div(G_PER_LB), 1);
  return low === high
    ? `${kg(low)} kg (${lb(low)} lb)`
    : `${kg(low)} to ${kg(high)} kg (${lb(low)} to ${lb(high)} lb)`;
};

/** The rate the grass seed calculator gives a grass in metric, from its data: `14.6–24.4 g/m²`. */
const calculatorRate = (species: string, source = 'virginia-tech'): string => {
  const rate = viewOf('grass-seed', { species, source }, 'metric')?.values['rate'];
  if (rate === undefined) throw new Error(`no metric rate for ${species}`);
  return `${rate} g/m²`;
};

/** The UK averages of the Met Office, 1991-2020: maximum and minimum air °C and days of air frost. */
const MET_MONTHS = [
  { month: 'March', max: 9.22, min: 2.19, frost: 7.84 },
  { month: 'April', max: 12.03, min: 3.76, frost: 4.03 },
  { month: 'May', max: 15.13, min: 6.26, frost: 1.2 },
  { month: 'September', max: 16.85, min: 9.05, frost: 0.12 },
  { month: 'October', max: 13.08, min: 6.42, frost: 1.64 },
  { month: 'November', max: 9.41, min: 3.56, frost: 5.51 },
] as const;

const celsius = (value: number): string => `${value.toFixed(1)}°C (${fahrenheitText(value)})`;
const metItem = ({ month, max, min, frost }: (typeof MET_MONTHS)[number]): string =>
  `${month}: average maximum ${celsius(max)}, minimum ${celsius(min)}, ${frost.toFixed(1)} days of air frost.`;

/** The lawn the UK page works its kilograms for, in square metres. */
const UK_LAWN = 50;

/** When to sow grass seed in the UK: the RHS windows, the soil temperature and the rates in g/m². */
export const UK_GUIDE: Guide = {
  id: 'uk-sowing-guide',
  path: '/when-to-sow-grass-seed-uk',
  title: 'When to Sow Grass Seed in the UK: Autumn or Spring | Lawn Figures',
  description:
    'Sow grass seed in the UK in early autumn or mid-spring, on soil of 8–10°C or more, at 35–50 g/m² for a new lawn: RHS, Johnsons and Met Office figures.',
  h1: 'When to sow grass seed in the UK',
  lead: `Sow grass seed in early autumn (September) or mid-spring (March to April), when the soil is at least 8–10°C (46–50°F) and moist. The RHS prefers early autumn, so the seedlings establish before the first hard frosts. Sow a new lawn at 35–50 g/m² (${ouncesRange(35, 50)}) and overseed at 25 g/m² (${ouncesRange(25, 25)}), as Johnsons Lawn Seed advises; the seed comes up in 7 to 14 days.`,
  checked: READ_UK,
  sections: [
    {
      id: 'windows',
      heading: 'The two sowing windows: early autumn and mid-spring',
      paragraphs: [
        'The RHS gives the timing of a lawn from seed as autumn (September to November) or mid-spring (March to April), and says lawn seeds germinate best in early autumn and mid-spring, when the soil is warm, there is plenty of moisture and the weather is neither too cold nor too hot. Given the choice, it calls early autumn the better option, because the seedlings can get established before the first hard frosts.',
        'Spring and autumn are also the RHS times to repair a lawn, when the weather is damp and cool. Johnsons Lawn Seed, the DLF Seeds brand, says winter is not an ideal time to sow, because winter conditions in the UK usually prevent reliable establishment.',
        'BBC Gardeners’ World recommends mid to late spring and early autumn, and adds that seed sown in the south of the UK germinates sooner than seed sown in the north of Scotland.',
      ],
    },
    {
      id: 'soil-temperature',
      heading: 'The soil temperature to wait for',
      paragraphs: [
        `Johnsons says grass seed generally needs a soil temperature of around 8–10°C (${fahrenheitText(8)} to ${fahrenheitText(10)}) or higher to germinate, with steady moisture and no frost. Gardeners’ World gives at least 8°C (${fahrenheitText(8)}). Each grass of a UK mix has its own best range; Amenity Choice, a UK seed supplier, gives these optimum germination temperatures:`,
      ],
      items: [
        `Perennial ryegrass: 7–25°C (${fahrenheitText(7)} to ${fahrenheitText(25)}).`,
        `Red fescue: 15–25°C (${fahrenheitText(15)} to ${fahrenheitText(25)}).`,
        `Browntop bent: 12–21°C (${fahrenheitText(12)} to ${fahrenheitText(21)}).`,
      ],
    },
    {
      id: 'months',
      heading: 'What the Met Office averages say about each month',
      paragraphs: [
        'The Met Office publishes UK averages for 1991-2020 of the air, not of the soil, so they cannot tell you the day the soil passes 8°C. They do show why the windows fall where they do: April still has about four days of air frost and nights near 4°C, while September is milder, with days near 17°C and almost no frost. The UK figures:',
      ],
      items: MET_MONTHS.map(metItem),
    },
    {
      id: 'species',
      heading: 'How long the grasses of a UK mix take to come up',
      paragraphs: [
        'The RHS says germination should take seven to ten days, and Johnsons says 7 to 14 days, depending on the grass and the temperature. A UK mix comes up in stages, because its grasses differ: Gardeners’ World says hard-wearing mixes, usually of ryegrass and red fescue, come up after just four days. No UK source read for this page gives days grass by grass, so the figures below are from the University of Tennessee table, a US source, for the same species:',
      ],
      items: [
        'Perennial ryegrass: 3 to 7 days.',
        'Chewings fescue and red fescue: 6 to 14 days (the table groups them with sheep fescue).',
        'Smooth-stalked meadow-grass (Poa pratensis, the Kentucky bluegrass of US tables): 14 to 21 days.',
        'Browntop and other bent grasses: not in the table; Gardeners’ World says bent and meadow grasses can take up to two weeks.',
      ],
    },
    {
      id: 'rates',
      heading: 'How much grass seed per square metre',
      paragraphs: [
        `For a new lawn, Johnsons gives the sowing rate as typically 35–50 g/m² (${ouncesRange(35, 50)}). To overseed an existing lawn it sows 25 g/m² (${ouncesRange(25, 25)}) unless the box says otherwise. To repair a bare patch, the RHS says to use the rate on the packet, usually about 15–25 g/m² (½ to ¾ oz per sq yd). Weigh the seed for your area, divide it in two and sow half up and down the lawn and half across it, as the RHS does.`,
        `On a ${String(UK_LAWN)} m² lawn (about 540 sq ft), that is ${kilogramsText(35, 50, UK_LAWN)} of seed for a new lawn and ${kilogramsText(25, 25, UK_LAWN)} to overseed. Where birds take the seed, the RHS suggests covering it with fleece, or increasing the sowing rate by 50 per cent to make up for the losses.`,
        `The grass seed calculator works in square metres and kilograms too, but at the rates of two US extension services for a single grass, which are lower than a UK mix: ${calculatorRate('perennial-ryegrass')} for perennial ryegrass and ${calculatorRate('kentucky-bluegrass')} for Kentucky bluegrass at the Virginia rate. For a mix from a UK supplier, use the rate on its box.`,
      ],
      links: [SEED_CALCULATOR],
    },
    {
      id: 'first-mow',
      heading: 'The first mow',
      paragraphs: [
        'The RHS waits until the seedlings are 5–7.5 cm (2–3 in) tall, lightly firms the soil, and cuts two or three days later, taking off only about a third of the height. For an autumn-sown lawn, it says, no further mowing is usually needed until the next spring, and the lawn should be used as little as possible for about eight months.',
        'Johnsons makes the first cut when the grass is 5–8 cm (2–3 in) high, then lowers the blades very gradually to 25 mm (1 in) for ryegrass mixtures or 13 mm (½ in) for mixtures without ryegrass. It says that is typically 3 to 6 weeks after sowing.',
      ],
      links: [GROWING_LINK],
    },
    {
      id: 'more',
      heading: 'The US guides and the grasses in detail',
      paragraphs: [
        'The US pages give the extension windows for cool-season and warm-season grasses, and each grass its rates and germination days.',
      ],
      links: [
        PLANTING_LINK,
        { href: '/perennial-ryegrass-seed', label: 'Perennial ryegrass seed' },
        { href: '/fescue-grass-seed', label: 'Fescue grass seed: fine or tall' },
        { href: '/kentucky-bluegrass-seed', label: 'Kentucky bluegrass seed' },
        BEST_SEED_LINK,
      ],
    },
  ],
  questions: [
    {
      question: 'What is the best month to sow grass seed in the UK?',
      answer:
        'September, in early autumn: the RHS calls it the better of the two windows because the seedlings establish before the first hard frosts. Mid-spring, March to April, is the other window.',
    },
    {
      question: 'How much grass seed do I need per m²?',
      answer: `About 35–50 g/m² (${ouncesRange(35, 50)}) for a new lawn and 25 g/m² to overseed (Johnsons Lawn Seed), and about 15–25 g/m² to repair a patch (RHS). The rate on the box of your mix comes first.`,
    },
    {
      question: 'Is it too cold to sow grass seed?',
      answer: `It is while the soil is below about 8–10°C (${fahrenheitText(8)} to ${fahrenheitText(10)}), the temperature Johnsons says grass seed generally needs to germinate. That is why it does not advise sowing in winter.`,
    },
    {
      question: 'How long does grass seed take to grow in the UK?',
      answer:
        'It germinates in seven to ten days by the RHS, 7 to 14 days by Johnsons, and is ready for its first cut 3 to 6 weeks after sowing (Johnsons), once it is 5–7.5 cm (2–3 in) tall (RHS).',
    },
  ],
  sources: {
    rhs: RHS_SEED,
    rhsRepair: RHS_REPAIR,
    johnsons: JOHNSONS_FAQ,
    johnsonsSowing: JOHNSONS_SOWING,
    johnsonsOverseeding: JOHNSONS_OVERSEEDING,
    johnsonsRepair: JOHNSONS_REPAIR,
    gardenersWorld: GARDENERS_WORLD,
    amenity: AMENITY,
    metOffice: MET_OFFICE,
    tennessee: TENNESSEE,
  },
  calculators: ['/grass-seed-calculator'],
  card: {
    title: 'When to sow grass seed in the UK',
    summary: 'Early autumn or mid-spring, the soil temperature and the grams per square metre.',
  },
};

/** How long grass seed takes to grow: days to germinate by grass and temperature, and the first mow. */
export const GROWING_GUIDE: Guide = {
  id: 'growing-guide',
  path: '/how-long-does-grass-seed-take-to-grow',
  title: 'How Long Does Grass Seed Take to Grow? | Lawn Figures',
  description:
    'Grass seed comes up in 3 to 21 days by grass and soil temperature, and is first mown 3 to 6 weeks after sowing: US extension and UK sources.',
  h1: 'How long does grass seed take to grow?',
  lead: 'Most grass seed comes up in one to three weeks: perennial ryegrass in 3 to 7 days, the fescues in 6 to 14 and Kentucky bluegrass in 14 to 21 (University of Tennessee). The first mow comes 3 to 6 weeks after sowing (Johnsons Lawn Seed, UK) or 4 to 6 weeks (University of Maryland Extension, US), once the grass is about a third taller than its mowing height.',
  checked: READ_UK,
  sections: [
    {
      id: 'germination',
      heading: 'Days to germinate, grass by grass',
      paragraphs: [
        'The University of Tennessee table gives the approximate days each grass takes to germinate:',
      ],
      items: [
        'Perennial and annual ryegrass: 3 to 7 days.',
        'Tall fescue: 6 to 12 days.',
        'Chewings, red and sheep fescue: 6 to 14 days.',
        'Kentucky bluegrass (smooth-stalked meadow-grass in the UK): 14 to 21 days.',
        'Hulled bermudagrass and centipedegrass: 10 to 20 days; unhulled bermudagrass often 14 to 21 days or longer.',
        'Zoysiagrass (Zoysia japonica): 10 to 14 days.',
        'Bent grasses: up to two weeks, by BBC Gardeners’ World.',
      ],
      links: [
        { href: '/perennial-ryegrass-seed', label: 'Perennial ryegrass seed' },
        { href: '/tall-fescue-grass-seed', label: 'Tall fescue grass seed' },
        { href: '/kentucky-bluegrass-seed', label: 'Kentucky bluegrass seed' },
        { href: '/bermuda-grass-seed', label: 'Bermuda grass seed' },
        { href: '/zoysia-grass-seed', label: 'Zoysia grass seed' },
      ],
    },
    {
      id: 'mixes',
      heading: 'A mix comes up in stages',
      paragraphs: [
        'A bag of mixed seed does not come up all at once: the ryegrass shows first and the bluegrass or meadow-grass last. That is why the general figures are wide. The University of Maryland Extension says it takes about 2 weeks for seed to germinate; the RHS says seven to ten days; Johnsons Lawn Seed says 7 to 14 days, depending on the grass and the temperature; Gardeners’ World says five to 10 days, and just four for hard-wearing mixes of ryegrass and red fescue.',
      ],
    },
    {
      id: 'temperature',
      heading: 'Soil temperature sets the pace',
      paragraphs: [
        `The University of Maryland Extension gives the optimum soil temperature for grass seed germination as 50 to 70°F (10 to 21°C), measured at about 1 inch deep. In the UK, Johnsons says grass seed generally needs soil of around 8–10°C (${fahrenheitText(8)} to ${fahrenheitText(10)}) or higher, and Gardeners’ World says at least 8°C. For cool-season seed, the University of Tennessee adds that air cycling between about 59 and 82°F (15 to 28°C) favors rapid germination.`,
        'Below those figures, seed waits: Gardeners’ World says cold air and soil temperatures prevent germination, and a cold spring can delay it by up to a few weeks. None of the sources read for this page gives a number of days for each degree of soil temperature, so this page does not either.',
      ],
      items: [
        `Perennial ryegrass germinates best at 7–25°C (${fahrenheitText(7)} to ${fahrenheitText(25)}), red fescue at 15–25°C (${fahrenheitText(15)} to ${fahrenheitText(25)}) and browntop bent at 12–21°C (${fahrenheitText(12)} to ${fahrenheitText(21)}), by Amenity Choice, a UK seed supplier.`,
        'Warm-season seed (bermudagrass, zoysiagrass) wants air of 68 to 95°F (20 to 35°C), by the University of Tennessee, which is why it is sown in late spring.',
      ],
      links: [PLANTING_LINK, UK_LINK],
    },
    {
      id: 'first-mow',
      heading: 'When to mow it for the first time',
      paragraphs: [
        'Height decides the first mow, not the calendar. The US sources cut once the grass is a third taller than the height it will be kept at; the UK sources cut at 5 to 8 cm (2 to 3 in), taking off no more than a third:',
      ],
      items: [
        'University of Maryland Extension: mowing typically begins 4 to 6 weeks after seeding, when the grass is one-third higher than its recommended mowing height.',
        'Virginia Cooperative Extension: begin mowing when the grass is one-third taller than the intended mowing height.',
        'University of Tennessee: mow bunch-type grasses (chewings and hard fescue, perennial ryegrass, tall fescue) at a 2-inch (5.1 cm) height once they average 3 inches (7.6 cm).',
        'Purdue Extension: most people wait too long, so mow early and often, at first at 1.5 inches (3.8 cm) for Kentucky bluegrass, perennial ryegrass and fine fescue and 2.0 inches (5.1 cm) for tall fescue.',
        'RHS: cut when the seedlings are 5–7.5 cm (2–3 in) tall, taking off only about a third of the height.',
        'Johnsons Lawn Seed: first cut at 5–8 cm (2–3 in), typically 3 to 6 weeks after sowing, then lower the blades gradually to 25 mm (1 in) for ryegrass mixtures or 13 mm (½ in) for others.',
      ],
    },
    {
      id: 'use',
      heading: 'When you can walk on it',
      paragraphs: [
        'The University of Maryland Extension says to keep people and pets off newly planted areas for at least a month after the seed has germinated, or until the new lawn has been mown at least twice. The RHS is stricter: use the lawn as little as possible for about eight months, and for an autumn-sown lawn expect no further mowing until the spring.',
      ],
    },
    {
      id: 'timeline',
      heading: 'A new lawn from seed, week by week',
      paragraphs: ['Put together, the sources give this timeline for a lawn sown in season:'],
      items: [
        'Days 3 to 21: the seedlings come up, the ryegrass first and the bluegrass last. Keep the surface moist the whole time.',
        'Weeks 3 to 6: the first mow, once the grass is a third taller than its mowing height.',
        'The first month after germination: keep people and pets off it, or until it has been mown twice (University of Maryland Extension).',
        'About eight months: use it as little as possible (RHS).',
      ],
      links: [SEED_CALCULATOR, BEST_SEED_LINK],
    },
  ],
  questions: [
    {
      question: 'How long does grass seed take to germinate?',
      answer:
        'From 3 to 7 days for perennial ryegrass to 14 to 21 days for Kentucky bluegrass (University of Tennessee); most mixes come up in 7 to 14 days (Johnsons Lawn Seed).',
    },
    {
      question: 'What is the fastest grass seed to grow?',
      answer:
        'Perennial ryegrass, which germinates in 3 to 7 days by the University of Tennessee table. Gardeners’ World says hard-wearing mixes of ryegrass and red fescue can come up after just four days.',
    },
    {
      question: 'How soon can I mow new grass?',
      answer:
        'Once it is about a third taller than its mowing height, usually 3 to 6 weeks after sowing (Johnsons) or 4 to 6 weeks (University of Maryland Extension). The RHS cuts at 5–7.5 cm (2–3 in), taking off a third.',
    },
    {
      question: 'Why has my grass seed not come up?',
      answer:
        'Often the soil is too cold or too dry: Maryland gives 50 to 70°F (10 to 21°C) as the optimum soil temperature, Johnsons 8–10°C (46–50°F) as the minimum, and every source says to keep the seedbed moist. Kentucky bluegrass can also take three weeks.',
    },
  ],
  sources: {
    tennessee: TENNESSEE,
    maryland: MARYLAND,
    virginia: VIRGINIA,
    purdue: PURDUE_SEED,
    rhs: RHS_SEED,
    johnsons: JOHNSONS_FAQ,
    johnsonsSowing: JOHNSONS_SOWING,
    gardenersWorld: GARDENERS_WORLD,
    amenity: AMENITY,
  },
  calculators: ['/grass-seed-calculator'],
  card: {
    title: 'How long grass seed takes to grow',
    summary: 'Days to germinate by grass and soil temperature, and when to mow it first.',
  },
};
