import { viewOf, type CalculatorId } from './view.ts';

/** The lawn sizes the table of each calculator page runs, in square feet. */
export const SIZE_AREAS = [1000, 2500, 5000, 10_000, 20_000] as const;

/** The figures of each calculator the table shows: a column label and the `data-v` hook it reads. */
const COLUMNS: Readonly<
  Record<CalculatorId, readonly { readonly label: string; readonly v: string }[]>
> = {
  'lawn-fertilizer': [
    { label: 'Fertilizer (lb)', v: 'pounds' },
    { label: 'Bags of {bagPounds} lb', v: 'bags' },
    { label: 'Nitrogen (lb)', v: 'nitrogenPounds' },
  ],
  'grass-seed': [
    { label: 'Seed (lb)', v: 'pounds' },
    { label: 'Bags of {bagPounds} lb', v: 'bags' },
  ],
  sod: [
    { label: 'To order (sq ft)', v: 'order' },
    { label: 'Pallets of {palletSize} sq ft', v: 'pallets' },
    { label: 'Slabs of 16 × 24 in', v: 'slabs' },
  ],
  'lawn-lime': [
    { label: 'Lime (lb)', v: 'pounds' },
    { label: 'Bags of {bagPounds} lb', v: 'bags' },
  ],
};

export interface SizeTable {
  readonly columns: readonly string[];
  readonly rows: readonly (readonly string[])[];
}

/** The calculator at its starting values, with only the lawn area changed: one row per size. */
export const sizeTableOf = (id: CalculatorId): SizeTable => {
  const views = SIZE_AREAS.map((area) => {
    const view = viewOf(id, { area: String(area) });
    if (view === undefined) throw new Error(`${id} must run at ${String(area)} sq ft`);
    return { area, values: view.values };
  });
  // the bag and pallet sizes are the form's starting values, the same in every row
  const fill = (label: string): string =>
    label.replace(/\{(\w+)\}/g, (_, key: string) => views[0]?.values[key] ?? '');
  return {
    columns: ['Lawn area (sq ft)', ...COLUMNS[id].map(({ label }) => fill(label))],
    rows: views.map(({ area, values }) => [
      area.toLocaleString('en-US'),
      ...COLUMNS[id].map(({ v }) => values[v] ?? ''),
    ]),
  };
};
