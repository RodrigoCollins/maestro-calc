import { bdft, Rational, valueIn } from '@maestro-calc/core';
import { boardFeet } from '@maestro-calc/core/calculators/board-feet';
import type { Locale } from '@maestro-calc/i18n';
import { decimalText, groupedInteger } from '../calculator/present.ts';
import { JOBS, type JobCase, type JobId } from '../routing/jobs.ts';
import { sentence, type ExtraSection } from './job-extra.ts';
import { dressedCase, inchText, nominalOf } from './job-view.ts';
import { dressedOf, PS_20 } from './lumber-sizes.ts';
import { siteText } from './site-text.ts';

/*
 * The board feet job pages: one size of lumber also says what it is by the piece, by the linear
 * foot and by the thousand board feet (the unit PS 20-20 abbreviates MBM), at its nominal size and
 * at its dry dressed size (PS 20-20, Table 3), worked out by the board feet engine.
 */

/** Whether job `id` is a board feet page. */
export const isLumberJob = (id: JobId): boolean => JOBS[id].calculator === 'board-feet';

/** The lots of the table: pieces of this size bought together. */
const LOTS = [10, 25, 50, 100] as const;

const two = (value: Rational): string => decimalText(value, 2, true);

/** The board feet of `raw` times `pieces`, exact, by the engine. */
const boardFeetOf = (raw: JobCase, pieces = 1): Rational => {
  const input = { ...raw, pieces: String(pieces) };
  const valid = boardFeet.validate(input);
  if (!valid.ok) throw new Error(`invalid lumber: ${JSON.stringify(input)}`);
  return valueIn(boardFeet.compute(valid.value).outputs.boardFeet, bdft);
};

/** What the board feet page `id` adds to its table, or `undefined` for any other job. */
export const jobLumber = (id: JobId, locale: Locale): ExtraSection | undefined => {
  if (!isLumberJob(id)) return undefined;
  const text = siteText(locale);
  const [raw] = JOBS[id].cases;
  const thickness = nominalOf(raw['thickness']);
  const width = nominalOf(raw['width']);
  const length = (raw['length'] ?? '').replace(/ft$/, '');
  const size = dressedOf(thickness, width);
  const dressedRaw = dressedCase(raw);
  const piece = boardFeetOf(raw);
  const dressed = boardFeetOf(dressedRaw);
  const perFoot = Rational.of(thickness * width, 12);
  const name = `${String(thickness)}x${String(width)}`;
  return {
    heading: text('site.job.lumber.heading'),
    paragraphs: [
      text('site.job.lumber.lead'),
      sentence(text, 'site.job.lumber.summary', [
        name,
        length,
        two(piece),
        two(perFoot),
        two(Rational.ONE.div(perFoot)),
        two(Rational.of(100).div(piece)),
        two(Rational.of(1000).div(piece)),
      ]),
      sentence(text, 'site.job.lumber.dressed', [
        `${inchText(size.thickness)} × ${inchText(size.width)}`,
        two(dressed),
        decimalText(dressed.div(piece).mul(Rational.of(100)), 1, false),
      ]),
    ],
    facts: [
      {
        label: text('site.job.lumber.perFoot'),
        value: `${String(thickness)} × ${String(width)} ÷ 12 = ${two(perFoot)}`,
      },
      {
        label: text('site.job.lumber.linear'),
        value: `12 ÷ (${String(thickness)} × ${String(width)}) = ${two(Rational.ONE.div(perFoot))}`,
      },
      {
        label: text('site.job.lumber.hundred'),
        value: `100 ÷ ${two(piece)} = ${two(Rational.of(100).div(piece))}`,
      },
      {
        label: text('site.job.lumber.thousand'),
        value: `1,000 ÷ ${two(piece)} = ${two(Rational.of(1000).div(piece))}`,
      },
    ],
    table: {
      columns: [
        text('site.job.lumber.pieces'),
        text('site.job.board-feet.nominal'),
        text('site.job.board-feet.dressed'),
      ],
      rows: LOTS.map((pieces) => ({
        label: groupedInteger(BigInt(pieces)),
        cells: [two(boardFeetOf(raw, pieces)), two(boardFeetOf(dressedRaw, pieces))],
      })),
    },
    sources: [PS_20],
  };
};
