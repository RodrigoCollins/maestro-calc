/** The copy of the English pool volume page. */
export const VOLUME_TEXTS = {
  path: '/pool-volume-calculator',
  title: 'Pool Volume Calculator: How Many Gallons? | Pool Figures',
  description:
    'Work out how many gallons or litres your pool holds from its length, width and the depth at each end, in feet or metres. Rectangle, round and oval.',
  kicker: 'Pool volume · free',
  h1: 'Pool volume calculator',
  lead: 'Choose feet or metres and type the size of your pool the way you read the tape. You get the gallons or litres it holds, for salt, chlorine and the pump.',
  fields: {
    shape: { label: 'Shape', options: { rectangle: 'Rectangle', round: 'Round', oval: 'Oval' } },
    length: { label: 'Length (the diameter of a round pool)' },
    width: { label: 'Width' },
    shallow: { label: 'Depth at the shallow end' },
    deep: { label: 'Depth at the deep end' },
  },
  drawing: 'Not to scale. The drawing follows what you type.',
  figureLabel: 'Your pool holds',
  unit: 'GALLONS',
  rows: { liters: 'Liters', cubicFeet: 'Cubic feet' },
  /** The units choice, a field of the page (core's `u=m`), not of the engine. */
  units: { label: 'Units', options: { us: 'US: feet, gallons', metric: 'Metric: metres, litres' } },
  /** In metric the large figure is litres, and its rows gallons and cubic metres. */
  metric: { unit: 'LITRES', rows: { liters: 'Gallons', cubicFeet: 'Cubic metres' } },
  method:
    'Gallons = the surface of the shape × the average of the two depths, at 231 cubic inches a gallon. A round pool is π × diameter² / 4, an oval π × length × width / 4.',
  note: 'An estimate for a pool with a straight slope between the ends. Measure inside the walls.',
} as const;

type Widen<T> = T extends string ? string : { readonly [K in keyof T]: Widen<T[K]> };

/** The copy of a pool volume page, in either language. */
export type VolumeTexts = Widen<typeof VOLUME_TEXTS> & {
  /** The section of the methodology with its hand-worked cases (the Spanish page links it). */
  readonly methodLink?: { readonly href: string; readonly label: string };
};

/** The copy of the Spanish pool volume page: the same fields and figures, US units. */
export const VOLUME_TEXTS_ES = {
  path: '/es/calculadora-de-volumen-de-piscina',
  title: 'Calculadora de volumen de piscina: litros, galones | Pool Figures',
  description:
    'Calcula cuántos litros o galones tiene tu piscina con su largo, su ancho y la profundidad de cada extremo, en metros o pies. Rectangular, redonda u ovalada.',
  kicker: 'Volumen de la piscina · gratis',
  h1: 'Calculadora de volumen de piscina',
  lead: 'Elige metros o pies e ingresa las medidas de tu piscina o alberca como las lees en la cinta. Obtienes los litros o galones que tiene, para la sal, el cloro y la bomba.',
  fields: {
    shape: {
      label: 'Forma',
      options: { rectangle: 'Rectangular', round: 'Redonda', oval: 'Ovalada' },
    },
    length: { label: 'Largo (el diámetro de una piscina redonda)' },
    width: { label: 'Ancho' },
    shallow: { label: 'Profundidad en la parte baja' },
    deep: { label: 'Profundidad en la parte honda' },
  },
  drawing: 'No está a escala. El dibujo sigue lo que escribes.',
  figureLabel: 'Tu piscina tiene',
  unit: 'GALONES',
  rows: { liters: 'Litros', cubicFeet: 'Pies cúbicos' },
  units: {
    label: 'Unidades',
    options: { us: 'EE. UU.: pies, galones', metric: 'Métrico: metros, litros' },
  },
  metric: { unit: 'LITROS', rows: { liters: 'Galones', cubicFeet: 'Metros cúbicos' } },
  method:
    'Galones = la superficie de la forma × el promedio de las dos profundidades, a 231 pulgadas cúbicas por galón. Una piscina redonda es π × diámetro² / 4, una ovalada π × largo × ancho / 4.',
  note: 'Una estimación para una piscina con una pendiente recta entre los extremos. Mide por dentro de las paredes.',
  methodLink: {
    href: '/es/metodologia#volume',
    label: 'Cómo lo calculamos, con casos resueltos a mano',
  },
} as const satisfies VolumeTexts;
