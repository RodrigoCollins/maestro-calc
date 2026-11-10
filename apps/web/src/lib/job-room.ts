import { ft, ft2, gal, liter, m, Rational, valueIn } from '@maestro-calc/core';
import type { MaterialSource } from '@maestro-calc/data';
import { PAINT_COVERAGE } from '@maestro-calc/data/yields/paint';
import type { Locale } from '@maestro-calc/i18n';
import { decimalText } from '../calculator/present.ts';
import { JOBS, type JobCase, type JobId } from '../routing/jobs.ts';
import { drywall } from './drywall.ts';
import { sentence, type ExtraFact, type ExtraSection } from './job-extra.ts';
import { paint } from './paint.ts';
import { siteText, type SiteText } from './site-text.ts';

/*
 * The room pages of paint and drywall (AdSense audit 2026-11-08: the thinnest pages of the site):
 * a room page also works its own room out surface by surface. Paint: each wall, the ceiling, one
 * coat, the high end of the data sheet, walls and ceiling together and the edges cut in by brush.
 * Drywall: the walls and the ceiling apart, the screws at the handbook's maximum spacing, the
 * compound and the tape. The walls are the engine's; the ceiling is length × width.
 */

/** Sherwin-Williams Quali-Kote: 350 to 400 sq ft per gallon, dry and recoat times, priming. */
export const QUALI_KOTE_PDS: Required<MaterialSource> = {
  name: 'Sherwin-Williams Quali-Kote Interior Latex, Product Data Sheet',
  url: 'https://www.sherwin-williams.com/document/PDS/en/035777853146/',
  retrieved: '2026-11-09',
};

/** CGC (USG) Gypsum Construction Handbook, chapter 3: fastener spacing and panel orientation. */
export const CGC_CLADDING: Required<MaterialSource> = {
  name: 'CGC (USG) Gypsum Construction Handbook, Chapter 3, Cladding',
  url: 'https://www.usg.com/content/dam/USG_Marketing_Communications/canada/product_promotional_materials/finished_assets/cgc-construction-handbook-ch03-cladding-can-en.pdf',
  retrieved: '2026-11-09',
};

/** The high end of the data sheet's coverage, sq ft per gallon; the calculator uses the low end. */
const HIGH_COVERAGE = Rational.of(400);

/**
 * Screws per 4 × 8 ft panel hung across framing 16 in apart (7 members): 4 on each at the 16 in
 * of a wall, 5 at the 12 in of a ceiling, the handbook's maximum spacing for single-layer screws.
 */
const WALL_SCREWS = Rational.of(28, 32);
const CEILING_SCREWS = Rational.of(35, 32);

/** The 10% extra for cuts, the drywall calculator's default, and the two panel sizes. */
const EXTRA = Rational.of(11, 10);
const PANELS = [Rational.of(32), Rational.of(48)] as const;

const whole = (value: Rational): string => decimalText(value, 0, true);
const two = (value: Rational): string => decimalText(value, 2, true);
/** A figure with no trailing zeros: 292.25, 157.5. */
const exact = (value: Rational): string => two(value).replace(/\.?0+$/, '');
/** `=` when the figure shown to two places is exact, `≈` when it is rounded. */
const sign = (value: Rational): string => (value.mul(Rational.of(100)).isInteger() ? '=' : '≈');

/** NIST SP 811: 1 ft = 0.3048 m exactly, so 1 ft² = 0.09290304 m². */
const METERS_PER_FOOT = Rational.of(3048, 10_000);
const SQUARE_METERS_PER_SQUARE_FOOT = METERS_PER_FOOT.mul(METERS_PER_FOOT);

/** NIST SP 811: 1 gal (US) = 3.785411784 L exactly. */
const LITRES_PER_GALLON = Rational.of(3_785_411_784, 1_000_000_000);

/** Gallons as whole gallon cans and the quart cans (a quarter gallon) that make up the rest. */
const quartsOf = (gallons: Rational): string => {
  const cans = gallons.floor();
  const quarts = gallons.sub(Rational.of(cans)).mul(Rational.of(4)).ceil();
  if (quarts === 0n) return `${String(cans)} gal`;
  if (quarts === 4n) return `${String(cans + 1n)} gal`;
  return `${String(cans)} gal + ${String(quarts)} qt`;
};

const sqFt = (value: Rational): string => `${whole(value)} sq ft`;
const metersOf = (area: Rational): string => `${two(area.mul(SQUARE_METERS_PER_SQUARE_FOOT))} m²`;

const feetOf = (value: string | undefined): Rational => {
  const match = /^(\d+)ft$/.exec(value ?? '');
  if (match?.[1] === undefined) throw new Error(`a room case gives whole feet: ${String(value)}`);
  return Rational.of(Number(match[1]));
};

interface Room {
  readonly length: Rational;
  readonly width: Rational;
  readonly height: Rational;
}

const roomOf = (raw: JobCase): Room => ({
  length: feetOf(raw['length']),
  width: feetOf(raw['width']),
  height: feetOf(raw['height']),
});

const valid = <T>(result: { ok: true; value: T } | { ok: false }, raw: JobCase): T => {
  if (!result.ok) throw new Error(`invalid room case: ${JSON.stringify(raw)}`);
  return result.value;
};

/** The walls the paint calculator paints, doors and windows left out, in sq ft. */
const paintWalls = (raw: JobCase): Rational => {
  const { outputs } = paint.compute(valid(paint.validate({ ...raw, coats: '1' }), raw));
  return valueIn(outputs.paintArea, ft2);
};

/** The walls the drywall calculator covers, and its sheets of each size. */
const drywallWalls = (raw: JobCase) => {
  const of = (sheet: '4x8' | '4x12') => {
    const input = { ...raw, surfaces: 'walls', sheet };
    const result = drywall.compute(valid(drywall.validate(input), input));
    const sheets = result.shopping.find(({ materialId }) => materialId === 'drywall')?.qty;
    if (sheets === undefined) throw new Error('the drywall engine buys no sheets');
    return { area: valueIn(result.outputs.areaFt2, ft2), sheets };
  };
  const small = of('4x8');
  return { area: small.area, sheets: [small.sheets, of('4x12').sheets] as const };
};

/** The finishing of walls and ceiling, as the drywall calculator works it out. */
const drywallFinishing = (raw: JobCase) => {
  const { outputs } = drywall.compute(valid(drywall.validate(raw), raw));
  return {
    compound: valueIn(outputs.compound, gal),
    litres: valueIn(outputs.compound, liter),
    tape: valueIn(outputs.tape, ft),
    metres: valueIn(outputs.tape, m),
  };
};

const wallFact = (label: string, side: Rational, height: Rational): ExtraFact => {
  const area = side.mul(height);
  return {
    label,
    value: `${whole(side)} ft × ${whole(height)} ft = ${sqFt(area)} (${metersOf(area)})`,
  };
};

const paintSection = (id: JobId, text: SiteText): ExtraSection => {
  const cases = JOBS[id].cases;
  const [raw] = cases;
  const { length, width, height } = roomOf(raw);
  const [long, short] = length.compare(width) === -1 ? [width, length] : [length, width];
  const ceiling = length.mul(width);
  const walls = paintWalls(raw);
  const coverage = valueIn(PAINT_COVERAGE.perGallon, ft2);
  const oneCoat = walls.div(coverage);
  const twoHigh = walls.mul(Rational.of(2)).div(HIGH_COVERAGE);
  const together = walls.add(ceiling);
  const both = together.mul(Rational.of(2)).div(coverage);
  const around = length.add(width).mul(Rational.of(2));
  const cutIn = around.mul(Rational.of(2)).add(height.mul(Rational.of(4)));
  const cutInMetres = cutIn.mul(METERS_PER_FOOT);
  return {
    heading: text('site.job.room.paint.heading'),
    paragraphs: [text('site.job.room.paint.lead'), text('site.job.room.paint.sheet')],
    facts: [
      wallFact(text('site.job.room.paint.long'), long, height),
      wallFact(text('site.job.room.paint.short'), short, height),
      {
        label: text('site.job.room.paint.ceiling'),
        value: `${whole(length)} ft × ${whole(width)} ft = ${sqFt(ceiling)} (${metersOf(ceiling)})`,
      },
      {
        label: text('site.job.room.paint.oneCoat'),
        value: `${sqFt(walls)} ÷ ${whole(coverage)} ${sign(oneCoat)} ${two(oneCoat)} gal`,
      },
      {
        label: text('site.job.room.paint.high'),
        value: `${sqFt(walls.mul(Rational.of(2)))} ÷ ${whole(HIGH_COVERAGE)} ${sign(twoHigh)} ${two(twoHigh)} gal`,
      },
      {
        label: text('site.job.room.paint.together'),
        value: `${sqFt(together)} × 2 ÷ ${whole(coverage)} ${sign(both)} ${two(both)} gal, ${String(both.ceil())} ${text('site.job.room.paint.cans')}`,
      },
      { label: text('site.job.room.paint.quarts'), value: quartsOf(both) },
      {
        label: text('site.job.room.paint.cutIn'),
        value: `${whole(around)} ft + ${whole(around)} ft + 4 × ${whole(height)} ft = ${whole(cutIn)} ft (${two(cutInMetres)} m)`,
      },
    ],
    table: {
      columns: [
        text('site.job.room.height'),
        text('site.job.room.paint.areaColumn'),
        text('site.job.room.metricColumn'),
        text('site.job.room.paint.gallonsColumn'),
        text('site.job.room.paint.litresColumn'),
        text('site.job.room.paint.cansColumn'),
      ],
      rows: cases.map((each) => {
        const area = paintWalls(each).add(ceiling);
        const gallons = area.mul(Rational.of(2)).div(coverage);
        return {
          label: `${whole(roomOf(each).height)} ft`,
          cells: [
            whole(area),
            two(area.mul(SQUARE_METERS_PER_SQUARE_FOOT)),
            two(gallons),
            two(gallons.mul(LITRES_PER_GALLON)),
            String(gallons.ceil()),
          ],
        };
      }),
    },
    sources: [QUALI_KOTE_PDS],
  };
};

/** Screws at the maximum spacing for `area` sq ft, and how the figure was reached. */
const screws = (
  area: Rational,
  perSqFt: Rational,
  per: number,
): { count: bigint; math: string } => {
  const raw = area.mul(perSqFt);
  const count = raw.ceil();
  const tail = raw.isInteger() ? `= ${String(count)}` : `= ${exact(raw)} → ${String(count)}`;
  return { count, math: `${sqFt(area)} × ${String(per)} ÷ 32 ${tail}` };
};

/** The way the handbook hangs a wall of `height` feet: across the studs up to 8 ft 1 in, and so on. */
const hangingKey = (height: Rational) => {
  if (height.compare(Rational.of(97, 12)) !== 1) return 'site.job.room.drywall.across48' as const;
  if (height.compare(Rational.of(109, 12)) !== 1) return 'site.job.room.drywall.across54' as const;
  return 'site.job.room.drywall.along' as const;
};

const drywallSection = (id: JobId, text: SiteText): ExtraSection => {
  const cases = JOBS[id].cases;
  const [raw] = cases;
  const { length, width } = roomOf(raw);
  const ceiling = length.mul(width);
  const walls = drywallWalls(raw);
  const ceilingSheets = PANELS.map((panel) => ceiling.mul(EXTRA).div(panel).ceil());
  const finishing = drywallFinishing(raw);
  const sheetsText = (area: Rational, [small, large]: readonly bigint[]) =>
    `${sqFt(area)}: ${String(small)} ${text('site.job.room.drywall.sheets8')} ${String(large)} ${text('site.job.room.drywall.sheets12')}`;
  return {
    heading: text('site.job.room.drywall.heading'),
    paragraphs: [text('site.job.room.drywall.lead'), text('site.job.room.drywall.screws')],
    facts: [
      { label: text('site.job.room.drywall.walls'), value: sheetsText(walls.area, walls.sheets) },
      { label: text('site.job.room.drywall.ceiling'), value: sheetsText(ceiling, ceilingSheets) },
      {
        label: text('site.job.room.drywall.wallScrews'),
        value: screws(walls.area, WALL_SCREWS, 28).math,
      },
      {
        label: text('site.job.room.drywall.ceilingScrews'),
        value: screws(ceiling, CEILING_SCREWS, 35).math,
      },
      {
        label: text('site.job.room.drywall.compound'),
        value: `${two(finishing.compound)} gal (${two(finishing.litres)} L)`,
      },
      {
        label: text('site.job.room.drywall.tape'),
        value: `${two(finishing.tape)} ft (${two(finishing.metres)} m)`,
      },
    ],
    table: {
      columns: [
        text('site.job.room.height'),
        text('site.job.room.drywall.areaColumn'),
        text('site.job.room.metricColumn'),
        text('site.job.room.drywall.compoundColumn'),
        text('site.job.room.drywall.screwsColumn'),
        text('site.job.room.drywall.hangColumn'),
      ],
      rows: cases.map((each) => {
        const { height } = roomOf(each);
        const count =
          screws(drywallWalls(each).area, WALL_SCREWS, 28).count +
          screws(ceiling, CEILING_SCREWS, 35).count;
        const area = drywallWalls(each).area.add(ceiling);
        return {
          label: `${whole(height)} ft`,
          cells: [
            whole(area),
            two(area.mul(SQUARE_METERS_PER_SQUARE_FOOT)),
            two(drywallFinishing(each).compound),
            String(count),
            text(hangingKey(height)),
          ],
        };
      }),
    },
    sources: [CGC_CLADDING],
  };
};

/** The sheets of each size the drywall calculator buys for walls and ceiling of `raw`. */
const drywallSheets = (raw: JobCase): readonly [bigint, bigint] => {
  const of = (sheet: '4x8' | '4x12') => {
    const input = { ...raw, sheet };
    const result = drywall.compute(valid(drywall.validate(input), input));
    const sheets = result.shopping.find(({ materialId }) => materialId === 'drywall')?.qty;
    if (sheets === undefined) throw new Error('the drywall engine buys no sheets');
    return sheets;
  };
  return [of('4x8'), of('4x12')];
};

type Tips = readonly [string, string, string, string];

const drywallTips = (id: JobId, text: SiteText): Tips => {
  const [raw] = JOBS[id].cases;
  const { length, width } = roomOf(raw);
  const ceiling = length.mul(width);
  const walls = drywallWalls(raw);
  const [ceilingSheets] = PANELS.map((panel) => ceiling.mul(EXTRA).div(panel).ceil());
  const [small, large] = drywallSheets(raw);
  const area = walls.area.add(ceiling);
  const finishing = drywallFinishing(raw);
  return [
    sentence(text, 'site.job.guide.drywall.tip1', [String(ceilingSheets), String(walls.sheets[0])]),
    sentence(text, 'site.job.guide.drywall.tip2', [String(large), String(small)]),
    sentence(text, 'site.job.guide.drywall.tip3', [two(finishing.compound), two(finishing.tape)]),
    sentence(text, 'site.job.guide.drywall.tip4', [
      whole(area),
      exact(area.mul(EXTRA.sub(Rational.of(1)))),
    ]),
  ];
};

const paintTips = (id: JobId, text: SiteText): Tips => {
  const [raw] = JOBS[id].cases;
  const { length, width, height } = roomOf(raw);
  const ceiling = length.mul(width);
  const gross = length.add(width).mul(Rational.of(2)).mul(height);
  const coverage = valueIn(PAINT_COVERAGE.perGallon, ft2);
  const { outputs } = paint.compute(valid(paint.validate(raw), raw));
  const cans = valueIn(outputs.gallons, gal).ceil();
  return [
    sentence(text, 'site.job.guide.paint.tip1', [
      whole(length),
      whole(width),
      whole(height),
      whole(gross),
      whole(ceiling),
    ]),
    text('site.job.guide.paint.tip2'),
    sentence(text, 'site.job.guide.paint.tip3', [String(cans)]),
    sentence(text, 'site.job.guide.paint.tip4', [
      whole(ceiling),
      two(ceiling.mul(Rational.of(2)).div(coverage)),
      whole(coverage),
    ]),
  ];
};

/**
 * The four tips of the paint or drywall page of a room (content audit 2026-11-10: the same four on
 * every room page), with the room's own figures; `undefined` for any other job.
 */
export const roomTips = (id: JobId, text: SiteText): Tips | undefined => {
  const { calculator } = JOBS[id];
  if (calculator === 'paint') return paintTips(id, text);
  if (calculator === 'drywall') return drywallTips(id, text);
  return undefined;
};

/** What the paint or drywall page of a room adds to its table, or `undefined` for any other job. */
export const jobRoom = (id: JobId, locale: Locale): ExtraSection | undefined => {
  const { calculator } = JOBS[id];
  if (calculator === 'paint') return paintSection(id, siteText(locale));
  if (calculator === 'drywall') return drywallSection(id, siteText(locale));
  return undefined;
};
