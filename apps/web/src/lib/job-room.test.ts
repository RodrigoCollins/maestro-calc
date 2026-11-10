import { describe, expect, it } from 'vitest';
import { isQuestionJob, JOB_IDS, JOBS } from '../routing/jobs.ts';
import { LOCALES } from '../routing/routes.ts';
import { CGC_CLADDING, jobRoom, QUALI_KOTE_PDS } from './job-room.ts';
import { jobView } from './job-view.ts';
import { jobWorked } from './job-worked.ts';

// a cost page (a question page) prices its rooms instead: it has no room section of its own
const ROOMS = JOB_IDS.filter(
  (id) => ['paint', 'drywall'].includes(JOBS[id].calculator) && !isQuestionJob(id),
);
const PAIRS = ROOMS.flatMap((id) => LOCALES.map((locale) => [id, locale] as const));

const valuesOf = (id: (typeof ROOMS)[number]) => jobRoom(id, 'en')?.facts.map(({ value }) => value);

// The paint of a room surface by surface: the walls of the paint calculator (one door of 20 sq ft
// and two windows of 15 sq ft left out), the ceiling apart, at the 350 sq ft per gallon the
// calculator uses and the 400 of the high end of the Quali-Kote data sheet.
describe('jobRoom (paint: the room surface by surface)', () => {
  // hand-verified, 12 × 12 ft, 8 ft high: each wall 12 × 8 = 96 sq ft = 8.92 m² (× 0.09290304);
  // ceiling 144 sq ft = 13.38 m²; walls 384 − 50 = 334 sq ft; one coat 334 ÷ 350 = 0.954 gal; two
  // coats at 400 sq ft per gallon 668 ÷ 400 = 1.67; walls and ceiling 478 × 2 ÷ 350 = 2.731 gal, 3
  // cans; cut-in 48 ft at the ceiling + 48 ft at the floor + 4 corners × 8 ft = 128 ft = 39.01 m
  it('works the walls, the ceiling, the coats and the cut-in of a 12 × 12 ft room out', () => {
    expect(valuesOf('paint-room-12x12')).toEqual([
      '12 ft × 8 ft = 96 sq ft (8.92 m²)',
      '12 ft × 8 ft = 96 sq ft (8.92 m²)',
      '12 ft × 12 ft = 144 sq ft (13.38 m²)',
      '334 sq ft ÷ 350 ≈ 0.95 gal',
      '668 sq ft ÷ 400 = 1.67 gal',
      '478 sq ft × 2 ÷ 350 ≈ 2.73 gal, 3 cans',
      '2 gal + 3 qt',
      '48 ft + 48 ft + 4 × 8 ft = 128 ft (39.01 m)',
    ]);
  });

  // hand-verified, 10 × 12 ft: long walls 12 × 8 = 96, short walls 10 × 8 = 80 sq ft = 7.43 m²;
  // walls 352 − 50 = 302; 302 ÷ 350 = 0.863; 604 ÷ 400 = 1.51; with the 120 sq ft ceiling 422 × 2 ÷
  // 350 = 2.411, 3 cans; cut-in 44 + 44 + 32 = 120 ft = 36.58 m
  it('tells the long walls from the short ones in a 10 × 12 ft room', () => {
    expect(valuesOf('paint-room-10x12')).toEqual([
      '12 ft × 8 ft = 96 sq ft (8.92 m²)',
      '10 ft × 8 ft = 80 sq ft (7.43 m²)',
      '10 ft × 12 ft = 120 sq ft (11.15 m²)',
      '302 sq ft ÷ 350 ≈ 0.86 gal',
      '604 sq ft ÷ 400 = 1.51 gal',
      '422 sq ft × 2 ÷ 350 ≈ 2.41 gal, 3 cans',
      '2 gal + 2 qt',
      '44 ft + 44 ft + 4 × 8 ft = 120 ft (36.58 m)',
    ]);
  });

  // hand-verified, 12 × 12 ft: walls 2 × 24 × h − 50 plus the 144 sq ft ceiling, two coats at 350:
  // 8 ft 478 → 2.73 gal, 3 cans; 9 ft 526 → 3.01, 4; 10 ft 574 → 3.28, 4; in m² × 0.09290304: 44.41,
  // 48.87, 53.33; in liters × 3.785411784: 10.34, 11.38, 12.42. In gallons and quarts: 2.73 is 2 gal
  // and 0.73 × 4 = 2.9 → 3 qt; 2.41 is 2 gal and 1.6 → 2 qt
  it('paints walls and ceiling at every height of the table', () => {
    expect(jobRoom('paint-room-12x12', 'en')?.table?.rows).toEqual([
      { label: '8 ft', cells: ['478', '44.41', '2.73', '10.34', '3'] },
      { label: '9 ft', cells: ['526', '48.87', '3.01', '11.38', '4'] },
      { label: '10 ft', cells: ['574', '53.33', '3.28', '12.42', '4'] },
    ]);
  });
});

// The drywall of a room panel by panel: the walls of the drywall calculator and the ceiling apart,
// each with its 10% extra; the screws at the maximum spacing of the CGC (USG) handbook, 16 in on a
// wall and 12 in on a ceiling over framing 16 in apart: a 4 × 8 ft panel across 7 studs takes 4
// screws on each on a wall (28) and 5 on a ceiling (35).
describe('jobRoom (drywall: the room panel by panel)', () => {
  // hand-verified, 12 × 12 ft, 8 ft high: walls 334 sq ft × 1.10 = 367.4 ÷ 32 = 11.5 → 12 sheets
  // of 4 × 8, ÷ 48 = 7.7 → 8 of 4 × 12; ceiling 144 × 1.10 = 158.4 ÷ 32 = 4.95 → 5, ÷ 48 = 3.3 → 4;
  // screws 334 × 28 ÷ 32 = 292.25 → 293 and 144 × 35 ÷ 32 = 157.5 → 158; compound 478 × 9 ÷ 1,000
  // = 4.30 gal = 16.28 L (× 3.785411784); tape 478 × 0.37 = 176.86 ft = 53.91 m
  it('counts the walls, the ceiling, the screws, the compound and the tape of a 12 × 12 ft room', () => {
    expect(valuesOf('drywall-room-12x12')).toEqual([
      '334 sq ft: 12 sheets of 4 × 8 ft or 8 of 4 × 12 ft',
      '144 sq ft: 5 sheets of 4 × 8 ft or 4 of 4 × 12 ft',
      '334 sq ft × 28 ÷ 32 = 292.25 → 293',
      '144 sq ft × 35 ÷ 32 = 157.5 → 158',
      '4.30 gal (16.28 L)',
      '176.86 ft (53.91 m)',
    ]);
  });

  // hand-verified, 12 × 12 ft: walls 2 × 24 × h − 50, screws walls × 28 ÷ 32 + 144 × 35 ÷ 32 each
  // rounded up: 8 ft 293 + 158 = 451; 9 ft 382 → 334.25 → 335, 493; 10 ft 430 → 376.25 → 377, 535;
  // compound 9 gal per 1,000 sq ft: 478 → 4.30, 526 → 4.734, 574 → 5.166
  it('gives the screws and the way to hang the panels at every height', () => {
    const rows = jobRoom('drywall-room-12x12', 'en')?.table?.rows;
    expect(rows?.map(({ label, cells }) => [label, ...cells.slice(0, 4)])).toEqual([
      ['8 ft', '478', '44.41', '4.30', '451'],
      ['9 ft', '526', '48.87', '4.73', '493'],
      ['10 ft', '574', '53.33', '5.17', '535'],
    ]);
    const ways = rows?.map(({ cells }) => cells[4]);
    expect(new Set(ways).size).toBe(3);
  });
});

describe('jobRoom (every room page)', () => {
  it.each(PAIRS)('cites the data sheet of %s in %s', (id, locale) => {
    const room = jobRoom(id, locale);
    const source = JOBS[id].calculator === 'paint' ? QUALI_KOTE_PDS : CGC_CLADDING;
    expect(room?.sources).toEqual([source]);
    expect(room?.facts.length).toBeGreaterThanOrEqual(6);
    expect(room?.paragraphs.join(' ').length).toBeGreaterThan(100);
  });

  it('gives each room figures no other room has', () => {
    const facts = ROOMS.map((id) => JSON.stringify(jobRoom(id, 'en')?.facts.map((f) => f.value)));
    expect(new Set(facts).size).toBe(ROOMS.length);
  });

  it('is only for the room pages', () => {
    expect(jobRoom('square-feet-12x12', 'en')).toBeUndefined();
    expect(jobRoom('concrete-slab-10x10', 'es')).toBeUndefined();
    for (const id of [
      'cost-to-paint-a-house',
      'cost-to-paint-a-room',
      'drywall-installation-cost',
    ] as const)
      expect(jobRoom(id, 'en'), id).toBeUndefined();
    for (const source of [QUALI_KOTE_PDS, CGC_CLADDING])
      expect(source.retrieved).toBe('2026-11-09');
  });
});

// content audit 2026-11-10: the note under the table and the lead of the room section both
// restated the door, the windows and the extra that the worked steps already show with the room's
// own figures, words every room page shared with its siblings
describe('room pages say the openings and the extra once, in the worked steps', () => {
  it.each(PAIRS)('keeps them out of the note and the lead of %s in %s', (id, locale) => {
    const note = jobView(id, locale).note;
    const [lead] = jobRoom(id, locale)?.paragraphs ?? [];
    for (const said of [note, lead]) {
      expect(said).not.toMatch(/\b20 (sq ft|pies cuadrados)\b/);
      expect(said).not.toMatch(/(one door|una puerta)/);
    }
    expect(note).toMatch(/\S/);
    expect(lead?.length).toBeGreaterThan(60);
    // the worked steps still say them, with the figures
    const steps = jobWorked(id, locale)?.steps.map(({ label, math }) => `${label} ${math}`);
    expect(steps?.join(' ')).toMatch(/20 sq ft/);
    expect(steps?.join(' ')).toMatch(JOBS[id].calculator === 'drywall' ? /10%/ : /350/);
  });
});
