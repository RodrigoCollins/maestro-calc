/**
 * The bowl of the result (plans/pets/PLAN.md, section 5): the top view of a bowl, a coral ring,
 * cream inside split into morning and evening by a dashed line, and kibble. The number of pieces
 * only tells the size of the day at a glance (one piece for every 40 kilocalories); it is not a
 * count to feed, and the drawing is hidden from assistive technology.
 */
const KCAL_PER_PIECE = 40;
const LEAST = 6;
const MOST = 60;

/** Pieces of kibble for a day of `kcal` kilocalories, at least 6 and at most 60. */
export const kibbleCount = (kcal: number): number =>
  Math.min(MOST, Math.max(LEAST, Math.round(kcal / KCAL_PER_PIECE)));

/** Three kibble tones, in the order the pieces take them. */
const TONES = ['#c98b4b', '#e5a55d', '#a56b34'] as const;

/** The golden angle in radians: pieces placed by it spread evenly with no two in a row. */
const GOLDEN = 2.399_963_229_728_653;

const CENTER = 100;
const INSIDE = 62;

const piece = (index: number, count: number): string => {
  const radius = INSIDE * Math.sqrt((index + 0.5) / count);
  const angle = index * GOLDEN;
  const x = (CENTER + radius * Math.cos(angle)).toFixed(1);
  const y = (CENTER + radius * Math.sin(angle)).toFixed(1);
  return `<circle class="kibble" cx="${x}" cy="${y}" r="5" fill="${TONES[index % TONES.length] ?? TONES[0]}"/>`;
};

/** The bowl as SVG markup for `pieces` pieces of kibble. */
export const bowlSvg = (pieces: number): string =>
  [
    '<svg viewBox="0 0 200 200" width="200" height="200" aria-hidden="true" focusable="false">',
    '<circle cx="100" cy="100" r="96" fill="#ff7a59"/>',
    '<circle cx="100" cy="100" r="76" fill="#fff4e0"/>',
    '<path d="M100 28v144" stroke="#2a1f3d" stroke-opacity=".35" stroke-width="2" stroke-dasharray="5 6"/>',
    ...Array.from({ length: pieces }, (_, index) => piece(index, pieces)),
    '</svg>',
  ].join('');
