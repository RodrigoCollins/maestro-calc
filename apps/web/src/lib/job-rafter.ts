import type { Locale } from '@maestro-calc/i18n';
import { isPitchJob, PITCH_RISES, type JobId } from '../routing/jobs.ts';
import { sentence, type ExtraSection } from './job-extra.ts';
import { siteText } from './site-text.ts';

/*
 * The exact pitch pages (AdSense audit 2026-11-08): a pitch also gives the lines of the rafter
 * table stamped on a framing square, worked out from its rise alone. A common rafter runs 12 in
 * for each foot of run; a hip or a valley runs √(12² + 12²) ≈ 16.97 in under the same foot, which
 * is why the square is set at 17 for a hip. Pure geometry: no data sheet is involved.
 */

/** The run the jack rafters are listed for, in feet: half of a 24 ft span. */
const RUN = 12;

/** `value` to two places, with a dot in both languages as the rest of the page prints it. */
const two = (value: number): string => value.toFixed(2);

/** `value` inches to the nearest sixteenth: `15 5/8 in`, `17 in`. */
export const sixteenths = (value: number): string => {
  const total = Math.round(value * 16);
  const inches = Math.floor(total / 16);
  let part = total % 16;
  let over = 16;
  while (part !== 0 && part % 2 === 0) {
    part /= 2;
    over /= 2;
  }
  return part === 0
    ? `${String(inches)} in`
    : `${String(inches)} ${String(part)}/${String(over)} in`;
};

const degrees = (rise: number, run: number): string =>
  `${two((Math.atan(rise / run) * 180) / Math.PI)}°`;

/** The six lines of the rafter table for a rise of `rise` in 12, in inches. */
export const rafterTable = (rise: number) => {
  const common = Math.sqrt(144 + rise * rise);
  const hip = Math.sqrt(288 + rise * rise);
  return {
    common,
    hip,
    jack16: (16 * common) / 12,
    jack24: 2 * common,
    jackSide: 144 / common,
    hipSide: (12 * Math.sqrt(288)) / hip,
  };
};

/** What the exact pitch page `id` adds after its OSHA section, or `undefined` for any other job. */
export const jobRafter = (id: JobId, locale: Locale): ExtraSection | undefined => {
  if (!isPitchJob(id)) return undefined;
  const text = siteText(locale);
  const rise = PITCH_RISES[id];
  const r = String(rise);
  const lines = rafterTable(rise);
  const row = (key: Parameters<typeof text>[0], value: number) => ({
    label: text(key),
    cells: [two(value), sixteenths(value)],
  });
  return {
    heading: text('site.job.rafter.heading'),
    paragraphs: [
      text('site.job.rafter.lead'),
      // a 12 ft run: each per-foot line in inches is the length in feet
      sentence(text, 'site.job.rafter.summary', [
        `${r}/12`,
        two(lines.common),
        two(lines.hip),
        sixteenths(lines.jack16),
        sixteenths(lines.jack24),
      ]),
      text('site.job.rafter.after'),
    ],
    facts: [
      {
        label: text('site.job.rafter.commonSet'),
        value: `12 ${text('site.job.rafter.body')}, ${r} ${text('site.job.rafter.tongue')}`,
      },
      {
        label: text('site.job.rafter.commonAngle'),
        value: `atan(${r}/12) = ${degrees(rise, 12)}`,
      },
      {
        label: text('site.job.rafter.hipSet'),
        value: `17 ${text('site.job.rafter.body')}, ${r} ${text('site.job.rafter.tongue')}`,
      },
      {
        label: text('site.job.rafter.hipAngle'),
        value: `atan(${r}/16.97) = ${degrees(rise, Math.sqrt(288))}`,
      },
    ],
    table: {
      columns: [
        text('site.job.rafter.line'),
        text('site.job.rafter.inches'),
        text('site.job.rafter.sixteenth'),
      ],
      rows: [
        row('site.job.rafter.common', lines.common),
        row('site.job.rafter.hip', lines.hip),
        row('site.job.rafter.jack16', lines.jack16),
        row('site.job.rafter.jack24', lines.jack24),
        row('site.job.rafter.jackSide', lines.jackSide),
        row('site.job.rafter.hipSide', lines.hipSide),
      ],
    },
    more: {
      lead: text('site.job.rafter.jacksLead'),
      label: text('site.job.rafter.jacksLabel'),
      table: {
        columns: [
          text('site.job.rafter.jack'),
          text('site.job.rafter.jacks16'),
          text('site.job.rafter.jacks24'),
        ],
        rows: Array.from({ length: Math.floor((RUN * 12 - 1) / 16) }, (_, index) => {
          const n = index + 1;
          const common = RUN * lines.common;
          return {
            label: String(n),
            cells: [
              sixteenths(common - n * lines.jack16),
              n * 24 < RUN * 12 ? sixteenths(common - n * lines.jack24) : '–',
            ],
          };
        }),
      },
    },
    sources: [],
  };
};
