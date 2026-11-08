/**
 * The five occupations of the wage pages, one per trade of the quote calculators: its id, its
 * Standard Occupational Classification code as BLS writes it (`47-2141`) and as its series ids do
 * (`472141`). The titles are BLS's own, in `texts.ts`.
 */
export const OCCUPATIONS = [
  { id: 'cleaning', code: '37-2012', soc: '372012' },
  { id: 'painting', code: '47-2141', soc: '472141' },
  { id: 'drywall', code: '47-2081', soc: '472081' },
  { id: 'concrete', code: '47-2051', soc: '472051' },
  { id: 'landscaping', code: '37-3011', soc: '373011' },
] as const;

export type TradeId = (typeof OCCUPATIONS)[number]['id'];

/** The occupation of a trade. */
export const occupationOf = (trade: TradeId): (typeof OCCUPATIONS)[number] => {
  const found = OCCUPATIONS.find(({ id }) => id === trade);
  if (found === undefined) throw new Error(`no occupation for ${trade}`);
  return found;
};
