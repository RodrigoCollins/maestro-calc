/** The copy of the English pool volume page. */
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
  drawing: 'Not to scale. The drawing follows what you type.',
  figureLabel: 'Your pool holds',
  unit: 'GALLONS',
  rows: { liters: 'Liters', cubicFeet: 'Cubic feet' },
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
  title: 'Calculadora de volumen de piscina en galones | Pool Figures',
  description:
    'Calcula cuántos galones tiene tu piscina con su largo, su ancho y la profundidad de cada extremo. Piscinas rectangulares, redondas y ovaladas.',
  kicker: 'Volumen de la piscina · gratis',
  h1: 'Calculadora de volumen de piscina',
  lead: 'Ingresa las medidas de tu piscina o alberca como las lees en la cinta. Obtienes los galones que tiene, para la sal, el cloro y la bomba.',
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
  method:
    'Galones = la superficie de la forma × el promedio de las dos profundidades, a 231 pulgadas cúbicas por galón. Una piscina redonda es π × diámetro² / 4, una ovalada π × largo × ancho / 4.',
  note: 'Una estimación para una piscina con una pendiente recta entre los extremos. Mide por dentro de las paredes.',
  methodLink: {
    href: '/methodology#volume',
    label: 'Cómo lo calculamos, con casos resueltos a mano (en inglés)',
  },
} as const satisfies VolumeTexts;
