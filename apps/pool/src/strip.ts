/*
 * The test strip picker of the chlorine page (plans/pool/PLAN.md §5, design v2.1): one pad per
 * free chlorine step that common pool test strips print, each labelled with its ppm, so a tap sets
 * the reading. The shades run from white to a deep violet, the way a free chlorine pad darkens; they
 * are a guide drawn here, not any brand's chart, and every pad carries its number, so no reading
 * depends on telling colours apart.
 */

/** One pad: the reading it sets, as the field takes it, and its shade. */
export interface Pad {
  readonly ppm: string;
  readonly color: string;
}

export const STRIP = {
  legend: 'Or tap your strip’s reading (ppm)',
  note: 'A guide, not any brand’s chart: match your strip to the chart on its own bottle.',
  pads: [
    { ppm: '0', color: '#FFFFFF' },
    { ppm: '0.5', color: '#F4E8F6' },
    { ppm: '1', color: '#E8CFEE' },
    { ppm: '3', color: '#CFA2DD' },
    { ppm: '5', color: '#B077C8' },
    { ppm: '10', color: '#8447A6' },
  ],
} as const satisfies {
  readonly legend: string;
  readonly note: string;
  readonly pads: readonly Pad[];
};

/** The index of the pad whose reading equals the typed `text` (`1.0` is pad `1`), or -1. */
export const padOf = (text: string, ppms: readonly string[]): number => {
  const value = text.trim() === '' ? Number.NaN : Number(text);
  return ppms.findIndex((ppm) => Number(ppm) === value);
};
