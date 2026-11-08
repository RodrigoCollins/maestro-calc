import { FIGURES, GALLONS_GUIDE, OLYMPIC_GUIDE } from './gallons.ts';
import type { GuideStep, StepGuide } from './guide.ts';
import { hrefOf, routeOf } from './routes.ts';

/*
 * The Spanish gallons guides: the same steps, sources and figures as `gallons.ts`, in neutral
 * Spanish (tú) and US units. `guide-es.test.ts` holds each one to its English twin.
 */

/** A link to the page of route `id` in Spanish, marked while that page is still English. */
const linkTo = (id: string, label: string): NonNullable<GuideStep['link']> => {
  const href = hrefOf(id, 'es');
  return { href, label: href === routeOf(href)?.en ? `${label} (en inglés)` : label };
};

const {
  cubicFoot,
  round,
  backyard,
  backyardLiters,
  round24,
  round24CubicFeet,
  oval,
  sixInches,
  roundSizes,
  olympic,
  olympicLiters,
  olympicCubicFeet,
  olympicOld,
  olympicOldLiters,
  olympicDeep,
  olympicDeepLiters,
  temporary,
  tenCentimeters,
  backyards,
} = FIGURES;
const roundList = roundSizes
  .map(({ feet, gallons }) => `${String(feet)} ft, ${gallons}`)
  .join('; ');

const GALLONS_STEPS: readonly GuideStep[] = [
  {
    title: 'Mide por dentro de las paredes',
    text: 'Pasa la cinta sobre el agua, de pared a pared: el largo y el ancho de una piscina rectangular u ovalada, la distancia de lado a lado por el centro de una redonda. Luego mide la profundidad del agua en la parte baja y en la parte honda. La profundidad promedio es la suma de las dos dividida entre dos: una piscina de 3 ft 6 in a 8 ft de profundidad promedia 5 ft 9 in, o 5.75 ft.',
    link: linkTo('volume', 'Calcula tu propia piscina'),
  },
  {
    title: 'Convierte pies cúbicos en galones',
    text: `Un galón de EE. UU. es 231 pulgadas cúbicas y un pie cúbico es 1,728, así que cada pie cúbico de agua son ${cubicFoot} galones. Cada fórmula de abajo es la superficie de la piscina, en pies cuadrados, por su profundidad promedio, por ${cubicFoot}.`,
    sources: ['nist'],
  },
  {
    title: 'Rectangular: largo × ancho × profundidad',
    text: `Una piscina de 16 ft por 32 ft, de 3 ft 6 in a 8 ft de profundidad: 16 × 32 = 512 pies cuadrados, × 5.75 ft = 2,944 pies cúbicos, × 1,728 ÷ 231 = ${backyard} galones. La misma piscina con 4 ft parejos tiene menos: su profundidad promedio es menor.`,
    link: linkTo('volume', 'Calcula una piscina rectangular'),
  },
  {
    title: 'Redonda: diámetro × diámetro × profundidad × 5.9',
    text: `La superficie de un círculo es π × diámetro² ÷ 4, así que una piscina redonda tiene diámetro × diámetro × profundidad promedio × ${round} galones. Una piscina redonda de 24 ft con 4 ft de agua: π × 24 × 24 ÷ 4 = 452.4 pies cuadrados, × 4 ft = ${round24CubicFeet} pies cúbicos, × 1,728 ÷ 231 = ${round24} galones.`,
    link: linkTo('volume', 'Calcula una piscina redonda'),
  },
  {
    title: 'Ovalada: largo × ancho × profundidad × 5.9',
    text: `Una ovalada se calcula como una elipse, π × largo × ancho ÷ 4, así que tiene largo × ancho × profundidad promedio × ${round}. Una ovalada de 15 ft por 30 ft con 4 ft de agua tiene ${oval} galones. Una ovalada de lados rectos entre dos medios círculos tiene un poco más que la elipse: calcúlala como una rectangular más una redonda.`,
    link: linkTo('volume', 'Calcula una piscina ovalada'),
  },
  {
    title: 'Piscinas elevadas: el agua, no la pared',
    text: `Una piscina elevada (sobre el suelo) se llena por debajo del borde de su pared, así que mide la profundidad del agua, no la altura de la pared. Con 4 ft de agua, los tamaños redondos tienen, en galones: ${roundList}. Cada 6 pulgadas más en una redonda de 24 ft suman ${sixInches} galones, así que un error en la profundidad mueve cada dosis que sigue.`,
    link: linkTo('volume-chart', 'Mira cada tamaño común en la tabla de volumen'),
  },
  {
    title: 'Litros, para una etiqueta métrica',
    text: `Un galón de EE. UU. es 3.785 litros, así que la piscina de 16 por 32 ft tiene ${backyardLiters} litros. Si mides en metros, largo × ancho × profundidad promedio da metros cúbicos, y cada metro cúbico es 1,000 litros.`,
    link: linkTo('volume', 'Calcúlalo en metros'),
  },
  {
    title: 'Piscinas en forma de riñón y libres',
    text: 'Ninguna fórmula sola sirve para una piscina en forma de riñón o de forma libre. Divide el contorno en rectángulos y medios círculos, calcula cada uno con su propia profundidad promedio y súmalos. La suma es una estimación; el plano de quien construyó la piscina, o los galones de los papeles originales, se acercan más.',
  },
  {
    title: 'Una piscina olímpica, para comparar',
    text: `Una piscina olímpica de 50 m por 25 m con la profundidad mínima de 2.5 m de World Aquatics tiene ${olympic} galones, unas ${backyards} veces la piscina de 16 por 32 ft de arriba.`,
    link: linkTo('olympic-guide', 'Cuántos galones tiene una piscina olímpica'),
  },
];

export const GALLONS_GUIDE_ES = {
  path: '/es/cuantos-galones-tiene-mi-piscina',
  checked: GALLONS_GUIDE.checked,
  kicker: 'Guía · volumen de la piscina',
  card: {
    title: 'Cuántos galones tiene mi piscina',
    summary: 'La fórmula para una piscina rectangular, redonda y ovalada, con ejemplos.',
  },
  title: '¿Cuántos galones tiene mi piscina? La fórmula | Pool Figures',
  description:
    'Cómo calcular los galones de tu piscina: largo × ancho × profundidad promedio × 7.48 si es rectangular, × 5.9 si es redonda u ovalada, con tamaños comunes.',
  h1: '¿Cuántos galones tiene mi piscina? Cómo calcularlo',
  lead: `Multiplica la superficie de la piscina por su profundidad promedio, en pies, y por ${cubicFoot}: una rectangular es largo × ancho × profundidad promedio × ${cubicFoot}, una redonda u ovalada diámetro × diámetro (o largo × ancho) × profundidad promedio × ${round}. Una piscina de 16 x 32 ft de 3 ft 6 in a 8 ft de profundidad tiene ${backyard} galones, y una piscina elevada redonda de 24 ft con 4 ft de agua tiene ${round24} galones.`,
  note: 'Cada cifra es una estimación para una piscina con una pendiente recta entre sus extremos, medida por dentro de las paredes. Si una dosis depende de ella, redondea tus galones hacia arriba, nunca hacia abajo.',
  sources: GALLONS_GUIDE.sources,
  steps: GALLONS_STEPS,
} as const satisfies StepGuide;

const OLYMPIC_STEPS: readonly GuideStep[] = [
  {
    title: 'El largo: 50 metros',
    text: 'World Aquatics fija el recorrido en 50.000 metros entre las placas de contacto del cronometraje (Facilities Rules, Part 2, 15.1.1.1), con una tolerancia de +0.010 y -0.000 metros. Con placas en los dos extremos, la distancia de pared a pared es de 50.020 a 50.030 metros (15.2.1.2); esta guía calcula los 50 metros del recorrido.',
    sources: ['worldAquatics'],
  },
  {
    title: 'El ancho: 25 metros',
    text: 'En los Juegos Olímpicos y los Campeonatos Mundiales de World Aquatics, una piscina permanente mide al menos 25.000 metros de ancho y una temporal al menos 26.000 metros (15.3.1). Ocho carriles de 2.5 metros, con un espacio de 2.5 metros por fuera del primer carril y del último, dan los 25 metros.',
    sources: ['worldAquatics'],
  },
  {
    title: 'La profundidad: al menos 2.5 metros',
    text: 'En los Juegos Olímpicos y los Campeonatos Mundiales de World Aquatics, la piscina tiene al menos 2.5 metros de profundidad (15.4.1). Para los Campeonatos Mundiales de piscina corta (25m) el mínimo es 2.0 metros, con 2.5 metros recomendados (15.4.2); en otros eventos, 1.0 metro, y 1.35 metros frente a los bloques de salida (15.4.3).',
    sources: ['worldAquatics'],
  },
  {
    title: 'Haz la cuenta',
    text: `50 m × 25 m × 2.5 m = 3,125 metros cúbicos, y un metro cúbico es 1,000 litros, así que la piscina tiene ${olympicLiters} litros. Un galón de EE. UU. es 3.785411784 litros: ${olympicLiters} ÷ 3.785411784 = ${olympic} galones de EE. UU., o ${olympicCubicFeet} pies cúbicos.`,
    link: linkTo('volume', 'Calcúlalo con la calculadora'),
  },
  {
    title: 'Por qué lees 660,000 galones',
    text: `Las reglas de la FINA de 2017 a 2021 fijaban la profundidad de una piscina olímpica en 2 metros como mínimo, 3 metros recomendados (FR 3.3). Con 2 m la misma piscina tiene ${olympicOldLiters} litros, ${olympicOld} galones, la cifra que se cita a menudo; con 3 m, ${olympicDeepLiters} litros, ${olympicDeep} galones. Cada 10 cm de profundidad son ${tenCentimeters} galones.`,
    sources: ['fina'],
  },
  {
    title: 'Un mínimo, no una sola medida',
    text: `Las reglas fijan mínimos, así que una piscina olímpica real puede ser más honda, y una temporal, de al menos 26 m de ancho, tiene al menos ${temporary} galones con 2.5 m. Una piscina que también se usa para natación artística, para la que las reglas anteriores recomendaban 3 m, tiene más: la profundidad es el dato que hay que preguntar.`,
    sources: ['worldAquatics'],
  },
  {
    title: 'Junto a una piscina de casa',
    text: `Una piscina de casa de 16 por 32 ft, de 3 ft 6 in a 8 ft de profundidad, tiene ${backyard} galones, así que una piscina olímpica con 2.5 m equivale a unas ${backyards} de ellas.`,
    link: linkTo('gallons-guide', 'Cuántos galones tiene mi piscina'),
  },
];

export const OLYMPIC_GUIDE_ES = {
  path: '/es/cuantos-galones-tiene-una-piscina-olimpica',
  checked: OLYMPIC_GUIDE.checked,
  kicker: 'Guía · volumen de la piscina',
  card: {
    title: 'Galones de una piscina olímpica',
    summary: 'Al menos 825,000 galones: 50 por 25 m y 2.5 m de profundidad, según World Aquatics.',
  },
  title: '¿Cuántos galones tiene una piscina olímpica? | Pool Figures',
  description: `Una piscina olímpica tiene al menos ${olympicLiters} litros, unos ${olympic} galones: 50 por 25 m y 2.5 m de profundidad según World Aquatics, y por qué se citan 660,000.`,
  h1: '¿Cuántos galones tiene una piscina olímpica?',
  lead: `Una piscina olímpica tiene al menos ${olympicLiters} litros, unos ${olympic} galones de EE. UU. World Aquatics la fija en 50 m de largo, 25 m de ancho y al menos 2.5 m de profundidad para los Juegos Olímpicos y los Campeonatos Mundiales, y 50 × 25 × 2.5 son 3,125 metros cúbicos. Los 660,000 galones que se citan a menudo son la misma piscina con 2 m, el mínimo de las reglas anteriores de la FINA; las piscinas más hondas tienen más.`,
  note: 'Cada cifra es el volumen de una piscina con una sola profundidad pareja, según los mínimos de las reglas. Una piscina real tiene lo que da su propia profundidad: pide a quien la opera su volumen de diseño.',
  sources: OLYMPIC_GUIDE.sources,
  steps: OLYMPIC_STEPS,
} as const satisfies StepGuide;
