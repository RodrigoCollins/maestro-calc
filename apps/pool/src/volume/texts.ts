/** The copy of the pool volume page (English only, like the site). */
export const VOLUME_TEXTS = {
  path: '/pool-volume-calculator',
  title: 'Pool Volume Calculator: How Many Gallons? | Pool Figures',
  description:
    'Work out how many gallons your pool holds from its length, width and the depth at each end. Rectangle, round and oval pools.',
  kicker: 'Pool volume · free',
  h1: 'Pool volume calculator',
  lead: 'Type the size of your pool the way you read the tape. You get the gallons it holds, for salt, chlorine and the pump.',
  fields: {
    shape: { label: 'Shape', options: { rectangle: 'Rectangle', round: 'Round', oval: 'Oval' } },
    length: { label: 'Length (the diameter of a round pool)' },
    width: { label: 'Width' },
    shallow: { label: 'Depth at the shallow end' },
    deep: { label: 'Depth at the deep end' },
  },
  figureLabel: 'Your pool holds',
  unit: 'GALLONS',
  rows: { liters: 'Liters', cubicFeet: 'Cubic feet' },
  method:
    'Gallons = the surface of the shape × the average of the two depths, at 231 cubic inches a gallon. A round pool is π × diameter² / 4, an oval π × length × width / 4.',
  note: 'An estimate for a pool with a straight slope between the ends. Measure inside the walls.',
} as const;
