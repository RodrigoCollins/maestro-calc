import { encode } from '@maestro-calc/core';
import { poolSalt } from '@maestro-calc/pool-core/pool-salt';
import { SALT } from './doses.ts';
import { outputText } from './format.ts';
import type { GuideSource, GuideStep, GuideTable, StepGuide } from './guide.ts';
import { VOLUME_TEXTS } from './volume/texts.ts';

/*
 * How much salt for a pool, in kilograms by litres (Ahrefs 2026-11-08, "Sites abroad": Australia's
 * "pool salt", "how much salt to add to pool"). Every figure is the salt calculator's own metric
 * run, at the levels the chlorinator manuals give: AstralPool's VX (4,000 ppm), Zodiac's TRi-XO
 * (4,000, within the 4,000 to 7,000 of the Australian Standard it quotes) and Hayward's AquaRite
 * (3,200). The US guide to salt cells is `SALT_VS_CHLORINE_GUIDE` in `guide.ts`; this one is the
 * metric amount.
 */

type Raw = Readonly<Record<string, string>>;

/** The salt calculator's run on `raw`; a run that fails is a build error. */
const ran = (raw: Raw) => {
  const result = poolSalt.run(raw);
  if (!result.ok) throw new Error(`pool-salt did not run on ${JSON.stringify(raw)}`);
  return result.value;
};

/** Kilograms and 20 kg bags for `litres` from `current` to `target` ppm, as the calculator gives. */
const metricCell = (litres: number, current: number, target: number): string => {
  const { outputs, shopping } = ran({
    gallons: String(litres),
    current: String(current),
    target: String(target),
    units: 'metric',
  });
  const kg = outputText('pounds', outputs[0]?.value, 'metric');
  return `${kg} kg (${String(shopping[0]?.qty ?? 0n)} bags)`;
};

const litresText = (litres: number): string => `${litres.toLocaleString('en-US')} L`;

/** The salt calculator opened on `raw`, through its own URL state. */
const calculatorAt = (raw: Raw): string => {
  const validated = poolSalt.validate(raw);
  if (!validated.ok) throw new Error(`pool-salt rejects ${JSON.stringify(raw)}`);
  return `${SALT.path}?${encode(poolSalt, validated.value)}`;
};

const FILL_SIZES = [20_000, 30_000, 40_000, 50_000, 60_000, 80_000] as const;
const TOP_UP_SIZES = [40_000, 50_000, 60_000, 80_000] as const;

const SOURCES = {
  astral: {
    name: 'AstralPool VX 3 Series salt chlorinator, installation and operating instructions (Inst.245 V07.20): pool preparation and salt level, read 8 November 2026',
    url: 'https://cdn.shopify.com/s/files/1/1218/7656/files/Astral_VX_manual_4aad10ba-6ac8-43b4-a410-8a760a492e4f.pdf',
  },
  zodiac: {
    name: 'Zodiac Australia, TRi-XO CrossOver chlorinator manual: correct settings for your pool and messages, read 8 November 2026',
    url: 'https://cdn.shopify.com/s/files/1/1218/7656/files/Zodiac_TRi-XO_Manual.pdf',
  },
  haywardAu: {
    name: 'Hayward Australia: Electronic chlorinators FAQ, read 8 November 2026',
    url: 'https://au.hayward.com/knowledge-base/electronic-chlorinators/',
  },
  hayward: {
    name: 'Hayward AquaRite owner’s manual, 092538 Rev D',
    url: 'https://hayward.com/media/akeneo_connector/asset_files/0/9/092538_RevD_b778.pdf',
  },
} as const satisfies Record<string, GuideSource>;

const FILL: GuideTable = {
  caption:
    'Salt to add to fresh water (0 ppm), in kilograms and 20 kg bags (ppm is parts per million, mg per litre)',
  region: 'Salt for each pool size from fresh water',
  head: ['Pool', '3,200 ppm (Hayward AquaRite)', '4,000 ppm (AstralPool, Zodiac)', '6,000 ppm'],
  rows: FILL_SIZES.map((litres) => [
    litresText(litres),
    metricCell(litres, 0, 3200),
    metricCell(litres, 0, 4000),
    metricCell(litres, 0, 6000),
  ]),
  sources: ['astral', 'zodiac', 'haywardAu'],
};

const TOP_UP: GuideTable = {
  caption: 'Salt to bring a pool back to 4,000 ppm, in kilograms and 20 kg bags',
  region: 'Salt to top each pool size up to 4,000 ppm',
  head: ['Pool', 'From 3,000 ppm', 'From 3,500 ppm'],
  rows: TOP_UP_SIZES.map((litres) => [
    litresText(litres),
    metricCell(litres, 3000, 4000),
    metricCell(litres, 3500, 4000),
  ]),
  sources: ['astral'],
};

const fill50 = metricCell(50_000, 0, 4000);
const top50 = metricCell(50_000, 3000, 4000);
const us = outputText(
  'pounds',
  ran({ gallons: '20000', current: '0', target: '3200' }).outputs[0]?.value,
);
const metricLink = calculatorAt({
  gallons: '50000',
  current: '3000',
  target: '4000',
  units: 'metric',
});

/** What the Spanish twin writes too (`salt-amount-es.ts`): the figures, the tables, the links. */
export const SALT_AMOUNT_SHARED = {
  fill50,
  top50,
  us,
  metricLink,
  fill: FILL,
  topUp: TOP_UP,
  sources: SOURCES,
} as const;

const STEPS: readonly GuideStep[] = [
  {
    title: 'Find the level your chlorinator asks for',
    text: 'The salt level is the chlorinator’s, not the pool’s. AstralPool’s VX manual says the chlorinator requires a minimum 3000ppm of salt, but the recommended level is 4000ppm, and it should never be allowed to fall below 3,000. Zodiac’s TRi-XO manual gives 4,000 to 7,000 ppm as the Australian Standard range and 4,000 ppm at 27 °C as the ideal. Hayward’s AquaRite works best at about 3,200 ppm and runs anywhere from 2,700 to 3,400 ppm, Hayward Australia says. Read the label on your own cell or its manual before you buy any salt.',
    sources: ['astral', 'zodiac', 'haywardAu'],
  },
  {
    title: 'Know your litres',
    text: 'Every kilogram depends on how much water the pool holds. Work it out once from the length, the width and the depth at each end in metres, and keep the number: a pool 10 m by 4 m, 1 m deep at one end and 2 m at the other, holds 60,000 L.',
    link: { href: VOLUME_TEXTS.path, label: 'Work out your litres' },
  },
  {
    title: 'Test the salt before you add any',
    text: 'A pool that has run a chlorinator before already holds most of its salt, and an old reading wastes bags. Zodiac’s manual sends a check salt message to the pool shop for a water test, and says that if the water is below 21 °C it is imperative to check the salinity before adding extra salt, since low water temperatures can affect the reading. AstralPool says to check a low salt light again after 24 hours before you add any.',
    sources: ['zodiac', 'astral'],
  },
  {
    title: 'Work out the kilograms: 4 kg per 1,000 L at 4,000 ppm',
    text: `1 ppm is 1 mg in each litre, so kilograms = litres × (target − reading) ÷ 1,000,000. From fresh water, 50,000 L to 4,000 ppm take ${fill50}, the 200 kg AstralPool’s manual gives for a typical 50,000 L pool. From a reading of 3,000 ppm the same pool needs ${top50}, the 50 kg per 50,000 L its low salt warning asks for. The calculator does the sum for your own litres and reading, in 20 kg bags.`,
    link: {
      href: metricLink,
      label: 'Work out your salt in kilograms',
    },
    sources: ['astral'],
  },
  {
    title: 'Add it at the shallow end with the pump running',
    text: 'AstralPool says salt should always be added at the shallow end of the pool and allowed to dissolve, and running the pump mixes the water and speeds the dissolving. Hayward’s AquaRite manual adds about three quarters of the salt, runs the pump for 24 hours, tests, and then adds the rest, so the calculator gives that first amount too.',
    link: { href: SALT.path, label: 'Pool salt calculator' },
    sources: ['astral', 'hayward'],
  },
  {
    title: 'Too much salt only comes out with the water',
    text: 'Salt does not wear off or evaporate. Zodiac’s table lowers it the only way there is: partially drain and refill the pool, and the calculator says so when a reading is already over the target. Rain and topping up with fresh water dilute it the same way.',
    sources: ['zodiac'],
  },
  {
    title: 'Mineral and magnesium salt',
    text: 'Zodiac’s TRi-XO lets you select between normal pool salt and mineral salt blends at start-up, so set the chlorinator to the salt you bought: a blend with magnesium chloride is dosed by its own bag and the chlorinator’s setting, not by the sodium chloride table above.',
    sources: ['zodiac'],
  },
  {
    title: 'In US gallons',
    text: `The calculator keeps US gallons and 40 lb bags too: from fresh water, 20,000 gallons take ${us} lb of salt to reach the 3,200 ppm Hayward’s AquaRite manual calls the best, at about 8.34 lb a gallon of water. Pick US or metric at the top of the calculator; it remembers your choice.`,
    link: { href: SALT.path, label: 'Pool salt calculator' },
    sources: ['hayward'],
  },
];

/** How much salt for a pool: the kilograms for each size and level, then the steps to add them. */
export const SALT_AMOUNT_GUIDE = {
  path: '/how-much-salt-for-a-pool',
  checked: '2026-11-08',
  kicker: 'Guide · salt',
  card: {
    title: 'How much salt for a pool',
    summary: 'Kilograms and 20 kg bags by litres, at the level your chlorinator asks for.',
  },
  title: 'How Much Salt for a Pool: Kilograms by Litres | Pool Figures',
  description:
    'How much salt a pool needs in kilograms: 4 kg per 1,000 L at 4,000 ppm, tables for 20,000 to 80,000 L, the levels AstralPool, Zodiac and Hayward give.',
  h1: 'How much salt for a pool',
  lead: `A salt chlorinator needs the level its manual names, and 1 ppm is 1 mg in each litre: AstralPool and Zodiac cells run at 4,000 ppm, which is 4 kg of salt in every 1,000 litres, and Hayward’s AquaRite at 3,200 ppm. From fresh water a 50,000 L pool takes ${fill50} to reach 4,000 ppm; in US units, 20,000 gallons take ${us} lb for 3,200 ppm. Test first: a pool that already holds salt needs only the difference.`,
  note: 'Follow the manual of your own chlorinator where it differs from this guide: the salt level, the salt type and the start-up all vary by maker. Use pool salt over 99% sodium chloride.',
  table: FILL,
  moreTables: [TOP_UP],
  sources: SOURCES,
  steps: STEPS,
} as const satisfies StepGuide;
