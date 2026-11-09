import { SALT_ES } from './doses-es.ts';
import type { GuideStep, GuideTable, StepGuide } from './guide.ts';
import { SALT_AMOUNT_GUIDE, SALT_AMOUNT_SHARED } from './salt-amount.ts';
import { VOLUME_TEXTS_ES } from './volume/texts.ts';

/*
 * The Spanish twin of `salt-amount.ts`: the same kilograms by litres, for Spain and Mexico as well
 * as US Hispanics, in neutral Spanish (tú). The figures and the tables are the English module's,
 * worked out once by the salt calculator; only the words change ("sacos" for the bags).
 */

const { fill50, top50, us, fill, topUp, sources, metricLink } = SALT_AMOUNT_SHARED;

/** A cell of the English tables in Spanish: `200.0 kg (10 bags)` is `200.0 kg (10 sacos)`. */
const sacos = (cell: string): string => cell.replace(' bags)', ' sacos)');

const tableOf = (
  table: GuideTable,
  caption: string,
  region: string,
  head: string[],
): GuideTable => ({
  caption,
  region,
  head,
  rows: table.rows.map(([pool = '', ...cells]) => [pool, ...cells.map(sacos)]),
  sources: table.sources,
});

const FILL_ES = tableOf(
  fill,
  'Sal que debes agregar a agua nueva (0 ppm), en kilos y sacos de 20 kg (ppm son partes por millón, mg por litro)',
  'Sal para cada tamaño de piscina desde agua nueva',
  ['Piscina', '3,200 ppm (Hayward AquaRite)', '4,000 ppm (AstralPool, Zodiac)', '6,000 ppm'],
);

const TOP_UP_ES = tableOf(
  topUp,
  'Sal para volver a 4,000 ppm, en kilos y sacos de 20 kg',
  'Sal para subir cada tamaño de piscina a 4,000 ppm',
  ['Piscina', 'Desde 3,000 ppm', 'Desde 3,500 ppm'],
);

const [find, litres, test, work, add, drain, mineral, gallons] = SALT_AMOUNT_GUIDE.steps;

/** The sources of the English step, kept on its twin (none when the step cites none). */
const sourcesOf = (step: GuideStep | undefined): Pick<GuideStep, 'sources'> =>
  step?.sources === undefined ? {} : { sources: step.sources };

const STEPS_ES: readonly GuideStep[] = [
  {
    title: 'Busca el nivel que pide tu clorador',
    text: 'El nivel de sal es del clorador, no de la piscina. El manual VX de AstralPool dice que el clorador requiere un mínimo de 3000 ppm de sal, pero que el nivel recomendado es de 4000 ppm, y que nunca debe bajar de 3,000. El manual del TRi-XO de Zodiac da de 4,000 a 7,000 ppm como el rango de la norma australiana y 4,000 ppm a 27 °C como el ideal. El AquaRite de Hayward funciona mejor con unas 3,200 ppm y trabaja con cualquier nivel de 2,700 a 3,400 ppm, según Hayward Australia. Lee la etiqueta de tu celda o su manual antes de comprar sal.',
    ...sourcesOf(find),
  },
  {
    title: 'Conoce tus litros',
    text: 'Cada kilo depende de cuánta agua tiene la piscina. Calcúlala una vez con el largo, el ancho y la profundidad de cada extremo en metros, y guarda el número: una piscina de 10 m por 4 m, de 1 m de profundidad en un extremo y 2 m en el otro, tiene 60,000 L.',
    link: { href: VOLUME_TEXTS_ES.path, label: 'Calcula tus litros' },
    ...sourcesOf(litres),
  },
  {
    title: 'Mide la sal antes de agregar',
    text: 'Una piscina que ya tuvo clorador guarda casi toda su sal, y una lectura vieja hace gastar sacos. El manual de Zodiac manda a la tienda de piscinas a medir el agua cuando ve el aviso de revisar la sal, y dice que si el agua está por debajo de 21 °C es indispensable revisar la salinidad antes de agregar más sal, porque el agua fría puede cambiar la lectura. AstralPool dice que revises otra vez el aviso de sal baja después de 24 horas antes de agregar.',
    ...sourcesOf(test),
  },
  {
    title: 'Calcula los kilos: 4 kg por cada 1,000 L a 4,000 ppm',
    text: `1 ppm es 1 mg en cada litro, así que kilos = litros × (nivel deseado − lectura) ÷ 1,000,000. Desde agua nueva, 50,000 L a 4,000 ppm llevan ${sacos(fill50)}, los 200 kg que da el manual de AstralPool para una piscina típica de 50,000 L. Desde una lectura de 3,000 ppm la misma piscina necesita ${sacos(top50)}, los 50 kg por cada 50,000 L que pide su aviso de sal baja. La calculadora hace la cuenta con tus litros y tu lectura, en sacos de 20 kg.`,
    link: {
      href: `${SALT_ES.path}?${metricLink.split('?')[1] ?? ''}`,
      label: 'Calcula tu sal en kilos',
    },
    ...sourcesOf(work),
  },
  {
    title: 'Agrégala en la parte baja con la bomba funcionando',
    text: 'AstralPool dice que la sal siempre se agrega en la parte baja de la piscina y se deja disolver, y que la bomba funcionando mezcla el agua y la disuelve más rápido. El manual de AquaRite de Hayward agrega más o menos tres cuartas partes de la sal, deja la bomba funcionando 24 horas, mide y luego agrega el resto, así que la calculadora también da esa primera cantidad.',
    link: { href: SALT_ES.path, label: 'Calculadora de sal para piscina' },
    ...sourcesOf(add),
  },
  {
    title: 'La sal de más solo sale con el agua',
    text: 'La sal no se gasta ni se evapora. La tabla de Zodiac la baja de la única forma que hay: vaciar parte del agua y volver a llenar la piscina, y la calculadora te lo dice cuando una lectura ya pasa del nivel deseado. La lluvia y el agua nueva con que rellenas la diluyen de la misma forma.',
    ...sourcesOf(drain),
  },
  {
    title: 'Sal mineral y de magnesio',
    text: 'El TRi-XO de Zodiac te deja elegir entre sal normal para piscina y mezclas de sal mineral al encenderlo, así que pon el clorador en la sal que compraste: una mezcla con cloruro de magnesio se dosifica con su propio saco y el ajuste del clorador, no con la tabla de cloruro de sodio de arriba.',
    ...sourcesOf(mineral),
  },
  {
    title: 'En galones de EE. UU.',
    text: `La calculadora también trabaja en galones de EE. UU. y bolsas de 40 lb: desde agua nueva, 20,000 galones llevan ${us} lb de sal para llegar a las 3,200 ppm que el manual de AquaRite de Hayward llama el mejor nivel, a unas 8.34 lb por galón de agua. Elige unidades de EE. UU. o métricas arriba de la calculadora; recuerda lo que elegiste.`,
    link: { href: SALT_ES.path, label: 'Calculadora de sal para piscina' },
    ...sourcesOf(gallons),
  },
];

/** The Spanish twin of the salt amount guide. */
export const SALT_AMOUNT_GUIDE_ES = {
  path: '/es/cuanta-sal-necesita-una-piscina',
  checked: SALT_AMOUNT_GUIDE.checked,
  kicker: 'Guía · sal',
  card: {
    title: 'Cuánta sal necesita una piscina',
    summary: 'Kilos y sacos de 20 kg por litros, al nivel que pide tu clorador.',
  },
  title: 'Cuánta sal necesita una piscina: kilos por litros | Pool Figures',
  description:
    'Cuántos kilos de sal necesita una piscina: 4 kg por cada 1,000 L a 4,000 ppm, tablas de 20,000 a 80,000 L y los niveles de AstralPool, Zodiac y Hayward.',
  h1: 'Cuánta sal necesita una piscina',
  lead: `Un clorador salino necesita el nivel que da su manual, y 1 ppm es 1 mg en cada litro: las celdas de AstralPool y Zodiac trabajan a 4,000 ppm, que son 4 kg de sal por cada 1,000 litros, y el AquaRite de Hayward a 3,200 ppm. Desde agua nueva, una piscina de 50,000 L lleva ${sacos(fill50)} para llegar a 4,000 ppm; en unidades de EE. UU., 20,000 galones llevan ${us} lb para 3,200 ppm. Mide primero: una piscina que ya tiene sal solo necesita la diferencia.`,
  note: 'Sigue el manual de tu propio clorador donde sea distinto de esta guía: el nivel de sal, el tipo de sal y el arranque cambian según la marca. Usa sal para piscina con más de 99% de cloruro de sodio.',
  table: FILL_ES,
  moreTables: [TOP_UP_ES],
  sources,
  steps: STEPS_ES,
} as const satisfies StepGuide;
