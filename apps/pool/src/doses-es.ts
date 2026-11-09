import type { DosePage } from './doses.ts';
import { STRIP } from './strip.ts';

/*
 * The Spanish dose pages (plans/pool/SPANISH.md, slice 3): the same engines, fields and figures
 * as the English pages of `doses.ts`, in neutral Spanish (tú: Ingresa, Usa, Elige), US units or
 * litres and kilos (the units choice, for Spain and Mexico) and the product names of the US labels. `doses-es.test.ts` holds each one to its English twin: the
 * same keys, and every figure of its method, note and warnings.
 */

const gallons = { label: 'Volumen de la piscina (galones)' };
/** The volume of a calculator with the units choice: litres in metric. */
const volume = { ...gallons, metric: 'Volumen de la piscina (litros)' };
const units = {
  label: 'Unidades',
  options: { us: 'EE. UU.: galones, libras', metric: 'Métrico: litros, kilos' },
};
const target = { label: 'Nivel deseado (ppm)' };

/** The hand-worked cases of each calculator, in its section of the Spanish methodology. */
const methodLink = (id: string) => ({
  href: `/es/metodologia#${id}`,
  label: 'Cómo lo calculamos, con casos resueltos a mano',
});

export const SALT_ES: DosePage = {
  path: '/es/calculadora-de-sal-para-piscina',
  title: 'Calculadora de sal para piscina: ¿cuántas bolsas? | Pool Figures',
  description:
    'Cuántas libras y bolsas de 40 lb, o kilos y sacos de 20 kg, de sal suben tu piscina de su lectura al nivel que buscas, en galones o litros.',
  kicker: 'Piscinas de agua salada · gratis',
  h1: 'Calculadora de sal para piscina',
  lead: 'Elige unidades de EE. UU. o métricas e ingresa el volumen de tu piscina o alberca, la lectura de sal de hoy y el nivel que pide tu clorador. Obtienes las libras o los kilos, y las bolsas.',
  fields: { gallons: volume, current: { label: 'Sal actual (ppm)' }, target, units },
  results: [
    { key: 'pounds', label: 'Sal que debes agregar', unit: 'LB', metricUnit: 'KG' },
    { key: 'kilograms', label: 'Kilogramos', unit: 'kg', metricUnit: 'lb', metricLabel: 'Libras' },
    {
      key: 'firstAddition',
      label: 'Agrega esto primero y mide después de 24 horas',
      unit: 'lb',
      metricUnit: 'kg',
    },
  ],
  bags: 'bolsas de 40 lb',
  metricBags: 'sacos de 20 kg',
  warnings: {
    drainToLower:
      'Tu sal está por encima del nivel deseado. La sal no se gasta: la única forma de bajarla es vaciar parte del agua y volver a llenar.',
  },
  method:
    'Libras = galones × (nivel deseado − lectura) × 8.34 ÷ 1,000,000, porque un galón de agua pesa unas 8.34 lb. El manual de AquaRite de Hayward da de 2,700 a 3,400 ppm, y 3,200 como el mejor nivel. En métrico, 1 ppm es 1 mg por litro: kilos = litros × (nivel deseado − lectura) ÷ 1,000,000, los 4 kg por cada 1,000 L a 4,000 ppm del manual VX de AstralPool, cuyos cloradores y el TRi-XO de Zodiac trabajan a 4,000 ppm.',
  note: 'Usa sal para piscina con más de 99% de cloruro de sodio. Espera de 10 a 14 días antes de agregar sal a un acabado nuevo de yeso (plaster). Donde el saco es de 25 kg, como en España, divide los kilos entre 25.',
  methodLink: methodLink('salt'),
};

export const CHLORINE_ES: DosePage = {
  path: '/es/calculadora-de-cloro-para-piscina',
  title: 'Calculadora de cloro para piscina: cuánto agregar | Pool Figures',
  description:
    'Cuánto cloro líquido, hipoclorito de calcio (cal-hypo) o dicloro sube el cloro libre de tu piscina de su lectura al nivel que buscas.',
  kicker: 'Cloro · gratis',
  h1: 'Calculadora de cloro para piscina',
  lead: 'Ingresa el volumen de tu piscina, en galones o litros, el cloro libre de hoy y el nivel que quieres. Obtienes la dosis del producto que tienes.',
  fields: {
    gallons: volume,
    current: { label: 'Cloro libre actual (ppm)' },
    target,
    product: {
      label: 'Producto',
      options: {
        'liquid-12-5': 'Cloro líquido, 12.5%',
        'liquid-10': 'Cloro líquido, 10%',
        'cal-hypo-65': 'Hipoclorito de calcio (cal-hypo), 65%',
        'dichlor-56': 'Dicloro, 56%',
      },
    },
    units,
  },
  results: [
    {
      key: 'liquid',
      label: 'Cloro líquido que debes agregar',
      unit: 'FL OZ',
      metricUnit: 'LITROS',
      forms: ['liquid-12-5', 'liquid-10'],
    },
    {
      key: 'dry',
      label: 'Producto granulado que debes agregar',
      unit: 'OZ DE PESO',
      metricUnit: 'GRAMOS',
      forms: ['cal-hypo-65', 'dichlor-56'],
    },
  ],
  strip: {
    field: 'current',
    legend: 'O toca la lectura de tu tira (ppm)',
    note: 'Es una guía, no la tabla de ninguna marca: compara tu tira con la tabla de su propio frasco.',
    pads: STRIP.pads,
  },
  method:
    '1 ppm es 1 mg por litro. Los gramos de cloro disponible = galones × 3.785 × (nivel deseado − lectura) ÷ 1,000, divididos entre la concentración de la etiqueta: 10.24 fl oz de cloro líquido al 12.5% por ppm por cada 10,000 galones. En métrico los litros entran tal cual: 8 mL de cloro líquido al 12.5% por ppm por cada 1,000 L.',
  note: 'Concentraciones de las etiquetas: hipoclorito de calcio de al menos 65% y dicloro de 56% de cloro disponible (etiquetas registradas ante la EPA). Sigue la etiqueta de tu producto.',
  methodLink: methodLink('chlorine'),
};

export const PH_ES: DosePage = {
  path: '/es/calculadora-de-ph-para-piscina',
  title: 'Calculadora de pH de piscina: ácido muriático | Pool Figures',
  description:
    'Cuánto ácido muriático baja el pH de tu piscina, o cuánto carbonato de sodio lo sube, según las gotas de la prueba de demanda de un kit Taylor.',
  kicker: 'pH · gratis',
  h1: 'Calculadora de pH para piscina',
  lead: 'Para bajar el pH, haz la prueba de demanda de ácido de tu kit; para subirlo, la prueba de demanda de base, y cuenta las gotas que necesita. Ingresa el volumen de tu piscina, en galones o litros, y esas gotas. Obtienes el ácido muriático o el carbonato de sodio que debes agregar.',
  fields: {
    gallons: volume,
    product: {
      label: 'Lo que necesitas',
      options: {
        'muriatic-31-45': 'Bajar el pH: ácido muriático, 31.45%',
        'soda-ash': 'Subir el pH: carbonato de sodio (soda ash)',
      },
    },
    drops: { label: 'Gotas de reactivo de demanda' },
    units,
  },
  results: [
    {
      key: 'liquid',
      label: 'Ácido muriático que debes agregar',
      unit: 'FL OZ',
      metricUnit: 'LITROS',
      forms: ['muriatic-31-45'],
    },
    {
      key: 'dry',
      label: 'Carbonato de sodio que debes agregar',
      unit: 'OZ DE PESO',
      metricUnit: 'GRAMOS',
      forms: ['soda-ash'],
    },
    {
      key: 'liquidPerDay',
      label: 'Lo más que puedes agregar en 24 horas',
      unit: 'fl oz',
      metricUnit: 'L',
      forms: ['muriatic-31-45'],
      detail: true,
    },
    { key: 'days', label: 'Días que toma', unit: '', forms: ['muriatic-31-45'], detail: true },
    {
      key: 'dryPerAddition',
      label: 'Lo más que puedes agregar de una vez',
      unit: 'oz',
      metricUnit: 'g',
      forms: ['soda-ash'],
      detail: true,
    },
    {
      key: 'additions',
      label: 'Veces que lo agregas, con 2 a 3 horas entre una y otra',
      unit: '',
      forms: ['soda-ash'],
      detail: true,
    },
  ],
  warnings: {
    pastChart:
      'La tabla de Taylor llega hasta 3 gotas. No agregues más que la dosis de 3 gotas de una vez, deja la bomba funcionando y mide otra vez antes de agregar el resto.',
    splitDays:
      'Es más de lo que la etiqueta agrega en un día, así que divídelo: agrega como máximo la cantidad de arriba, deja la bomba funcionando, mide el pH otra vez después de 24 horas y agrega el resto de la misma forma.',
    splitAdditions:
      'Es más de lo que la etiqueta agrega de una vez, así que divídelo: agrega como máximo la cantidad de arriba, deja circular el agua de 2 a 3 horas, mide el pH otra vez y agrega el resto de la misma forma.',
  },
  method:
    'Según la tabla de dosis de pH de Taylor Technologies: cada gota de reactivo de demanda de ácido equivale a 9.16 fl oz de ácido muriático por cada 10,000 galones, y cada gota de reactivo de demanda de base, a 5.13 oz de carbonato de sodio. Dosis = galones ÷ 10,000 × gotas × esa cantidad. La prueba se hace con tu propia agua, así que su alcalinidad ya está en la cuenta. El resultado es aproximado. La etiqueta de ácido muriático de HASA agrega como máximo un cuarto de galón por cada 20,000 galones en 24 horas, galones × 32 ÷ 20,000 fl oz al día, y lo repite cada 24 horas; la etiqueta de pH Up de carbonato de sodio agrega como máximo 1 lb por cada 10,000 galones de una vez y luego deja circular el agua de 2 a 3 horas. Días o veces = la dosis ÷ ese máximo, redondeado hacia arriba. En métrico los litros se leen como galones, de 3.785 L cada uno, porque la tabla y las etiquetas están escritas por galón.',
  note: 'La dosis de ácido es para ácido muriático al 31.45% (20° Baumé); para otra concentración, sigue la etiqueta de tu producto. Agrega el ácido al agua, nunca el agua al ácido: viértelo despacio en la parte honda con la bomba funcionando, con guantes y protección para los ojos, y nunca lo mezcles con cloro. Mide el pH otra vez después del tiempo de espera de la etiqueta.',
  methodLink: methodLink('ph'),
};

export const ALKALINITY_ES: DosePage = {
  path: '/es/calculadora-de-alcalinidad-para-piscina',
  title: 'Alcalinidad de la piscina: ¿cuánto bicarbonato? | Pool Figures',
  description:
    'Cuántas libras de bicarbonato de sodio suben la alcalinidad total de tu piscina de su lectura al nivel que buscas, 100 ppm si no cambias nada.',
  kicker: 'Alcalinidad · gratis',
  h1: 'Calculadora de alcalinidad para piscina',
  lead: 'Ingresa el volumen de tu piscina, en galones o litros, la alcalinidad total de hoy y el nivel que quieres. Obtienes las libras o los kilos de bicarbonato de sodio que debes agregar.',
  fields: { gallons: volume, current: { label: 'Alcalinidad actual (ppm)' }, target, units },
  results: [
    {
      key: 'pounds',
      label: 'Bicarbonato de sodio que debes agregar',
      unit: 'LB',
      metricUnit: 'KG',
    },
    { key: 'ounces', label: 'Onzas', unit: 'oz', metricUnit: 'g', metricLabel: 'Gramos' },
  ],
  warnings: {
    acidToLower:
      'Tu alcalinidad está por encima del nivel deseado. El bicarbonato solo la sube: bajar la alcalinidad requiere ácido, y esta calculadora no lo dosifica.',
  },
  method:
    'La alcalinidad total se mide como carbonato de calcio, así que 1 ppm requiere 84.007 ÷ 50.04 = 1.6788 mg por litro de bicarbonato de sodio. Miligramos = galones × 3.785 × (nivel deseado − lectura) × 1.6788: 1.4 lb por cada 10 ppm por cada 10,000 galones, o 16.8 g por cada 10 ppm por cada 1,000 L en métrico.',
  note: 'Usa bicarbonato de sodio puro (baking soda): revisa que la etiqueta del aumentador de alcalinidad lo diga. Para piscinas públicas, el Model Aquatic Health Code de los CDC mantiene la alcalinidad total entre 60 y 180 ppm.',
  methodLink: methodLink('alkalinity'),
};

/** The CDC's Model Aquatic Health Code, the one source of the public-pool limits these pages cite. */
const CODE = 'el Model Aquatic Health Code de los CDC';

export const STABILIZER_ES: DosePage = {
  path: '/es/calculadora-de-estabilizador-para-piscina',
  title: 'Calculadora de estabilizador: ácido cianúrico | Pool Figures',
  description:
    'Cuántas libras y onzas de ácido cianúrico (estabilizador o acondicionador) suben el CYA de tu piscina de su lectura al nivel que buscas.',
  kicker: 'Estabilizador · gratis',
  h1: 'Calculadora de estabilizador para piscina',
  lead: 'Ingresa el volumen de tu piscina, en galones o litros, la lectura de ácido cianúrico (CYA) de hoy y el nivel que quieres. Obtienes las libras de ácido cianúrico (estabilizador) que debes agregar.',
  fields: { gallons: volume, current: { label: 'CYA actual (ppm)' }, target, units },
  results: [
    { key: 'pounds', label: 'Estabilizador que debes agregar', unit: 'LB', metricUnit: 'KG' },
    { key: 'ounces', label: 'Onzas', unit: 'oz', metricUnit: 'g', metricLabel: 'Gramos' },
  ],
  warnings: {
    drainToLower:
      'Tu CYA está por encima del nivel deseado. El ácido cianúrico no se gasta: la única forma de bajarlo es vaciar parte del agua y volver a llenar.',
    overCodeLimit: `Tu nivel deseado pasa de 90 ppm, lo más que permite ${CODE} en una piscina pública.`,
  },
  method: `1 ppm es 1 mg por litro, así que los gramos de ácido cianúrico = galones × 3.785 × (nivel deseado − lectura) ÷ 1,000: 13.35 oz por cada 10 ppm por cada 10,000 galones, o 10 g por cada 10 ppm por cada 1,000 L en métrico. Para piscinas públicas, ${CODE} mantiene el CYA en 90 ppm o menos.`,
  note: 'La dosis es para un producto de 100% ácido cianúrico. Lee la etiqueta del tuyo: para un estabilizador líquido o mezclado, divide la dosis entre su porcentaje y multiplica por 100. El dicloro y el tricloro también suben el CYA.',
  methodLink: methodLink('stabilizer'),
};

export const CALCIUM_ES: DosePage = {
  path: '/es/calculadora-de-dureza-de-calcio-para-piscina',
  title: 'Dureza de calcio: ¿cuánto cloruro de calcio? | Pool Figures',
  description:
    'Cuántas libras de cloruro de calcio suben la dureza de calcio de tu piscina de su lectura al nivel que buscas, con la dosis de la etiqueta.',
  kicker: 'Dureza de calcio · gratis',
  h1: 'Calculadora de dureza de calcio para piscina',
  lead: 'Ingresa el volumen de tu piscina, en galones o litros, la dureza de calcio de hoy y el nivel que quieres. Obtienes las libras de cloruro de calcio que debes agregar, y cuánto agregar primero.',
  fields: {
    gallons: volume,
    current: { label: 'Dureza de calcio actual (ppm)' },
    target,
    units,
  },
  results: [
    { key: 'pounds', label: 'Cloruro de calcio que debes agregar', unit: 'LB', metricUnit: 'KG' },
    { key: 'ounces', label: 'Onzas', unit: 'oz', metricUnit: 'g', metricLabel: 'Gramos' },
    {
      key: 'firstAddition',
      label: 'Agrega esto primero y espera 12 horas',
      unit: 'lb',
      metricUnit: 'kg',
    },
  ],
  warnings: {
    dilutionToLower:
      'Tu dureza de calcio está por encima del nivel deseado. El calcio no se gasta y ningún producto lo quita: la única forma de bajarla es vaciar parte del agua y volver a llenar con agua más blanda.',
    splitDose:
      'Es más de 3 lb por cada 10,000 galones, así que la etiqueta lo divide: agrega la primera cantidad, deja la bomba funcionando al menos 12 horas, mide otra vez y agrega el resto de la misma forma.',
  },
  method:
    'Según la etiqueta de un aumentador de dureza de calcio (ClearView, Oreq Corporation): 2 oz de cloruro de calcio en escamas por cada 1,000 galones suben la dureza de calcio 10 ppm, es decir, 1.25 lb por cada 10 ppm por cada 10,000 galones. Libras = galones × (nivel deseado − lectura) ÷ 80,000; en métrico los litros se leen como galones, de 3.785 L cada uno, porque la etiqueta está escrita por galón. Comprobado con la química: 10 ppm como carbonato de calcio en 10,000 galones requieren 0.925 lb de cloruro de calcio puro, 1.25 lb de escamas al 74%.',
  note: `El manual de AquaRite de Hayward mantiene la dureza de calcio entre 200 y 400 ppm; para piscinas públicas, ${CODE} la limita a 2,500 ppm. La dosis es para cloruro de calcio en escamas, el aumentador de dureza de calcio más común; un producto anhidro (94% o más) es más fuerte, así que sigue la etiqueta del tuyo. Disuélvelo primero, más o menos ½ lb por galón de agua, y viértelo en la parte honda con la bomba funcionando.`,
  methodLink: methodLink('calcium'),
};

export const PUMP_ES: DosePage = {
  path: '/es/calculadora-de-bomba-para-piscina',
  title: 'Calculadora de bomba para piscina: caudal en GPM | Pool Figures',
  description:
    'El caudal de bomba que necesita tu piscina para filtrar toda su agua en 6 horas, como pide la norma de piscinas residenciales, y en 8.',
  kicker: 'Tamaño de bomba · gratis',
  h1: 'Calculadora de tamaño de bomba para piscina',
  lead: 'Ingresa los galones de tu piscina. Obtienes el caudal, en galones por minuto, que filtra toda el agua en 6 horas.',
  fields: { gallons },
  results: [
    { key: 'flow', label: 'Caudal de bomba para filtrar todo en 6 horas', unit: 'GPM' },
    { key: 'eightHour', label: 'Más suave, en 8 horas', unit: 'gpm' },
  ],
  method:
    'Caudal = galones ÷ 360 minutos, nunca menos de 36 gpm: la tasa de filtración residencial de ANSI/APSP/ICC-15, a la que remite el ISPSC de 2021.',
  note: 'Dimensiona también la tubería para ese caudal: la norma mantiene el agua por debajo de 8 pies por segundo en el retorno y de 6 en la succión.',
  methodLink: methodLink('pump'),
};

export const HEATER_ES: DosePage = {
  path: '/es/calculadora-de-calentador-para-piscina',
  title: 'Calentador para piscina: ¿cuántos BTU por hora? | Pool Figures',
  description:
    'Los BTU por hora que debe dar un calentador para subir tu piscina los grados que quieres en las horas que le das, según el peso del agua.',
  kicker: 'Tamaño de calentador · gratis',
  h1: 'Calculadora de calentador para piscina',
  lead: 'Ingresa los galones de tu piscina, cuántos grados quieres subirla y en cuántas horas. Obtienes los BTU por hora que debe dar un calentador.',
  fields: {
    gallons,
    rise: { label: 'Aumento de temperatura (°F)' },
    hours: { label: 'Horas para calentar' },
  },
  results: [
    { key: 'btuPerHour', label: 'Potencia del calentador', unit: 'BTU/H' },
    { key: 'btu', label: 'Calor para calentar el agua', unit: 'BTU' },
  ],
  method:
    'Un BTU calienta 1 lb de agua 1 °F, y un galón de agua pesa unas 8.34 lb. BTU = galones × 8.34 × aumento, y BTU por hora = ese calor ÷ las horas: 20,000 galones calentados 10 °F requieren 1,668,000 BTU, 69,500 por hora en 24 horas.',
  note: 'Es el calor que guarda el agua, sin pérdidas. El viento, la evaporación y las noches frescas se llevan calor mientras se calienta, así que un calentador real se elige más grande, y una cubierta guarda más calor. El Departamento de Energía de EE. UU. dimensiona un calentador de gas por la superficie: pies cuadrados × (temperatura de la piscina − temperatura media del aire del mes más frío) × 12 BTU por hora, para subir de 1 a 1¼ °F por hora con un viento de 3½ mph.',
  methodLink: methodLink('heater'),
};

export const FILL_TIME_ES: DosePage = {
  path: '/es/calculadora-de-tiempo-de-llenado-de-piscina',
  title: '¿Cuánto tarda en llenarse tu piscina? Calculadora | Pool Figures',
  description:
    'Cuántas horas y minutos tarda una manguera en llenar tu piscina, según sus galones y el caudal en galones por minuto.',
  kicker: 'Tiempo de llenado · gratis',
  h1: 'Calculadora de tiempo de llenado de piscina',
  lead: 'Ingresa los galones de tu piscina y el caudal de tu manguera en galones por minuto. Obtienes las horas y los minutos que tarda en llenarse.',
  fields: { gallons, flow: { label: 'Caudal (galones por minuto)' } },
  results: [
    { key: 'time', label: 'Tiempo de llenado', unit: 'HORAS Y MINUTOS' },
    { key: 'minutes', label: 'En minutos', unit: 'min' },
  ],
  method:
    'Minutos = galones ÷ galones por minuto, y horas = minutos ÷ 60: 20,000 galones a 10 galones por minuto tardan 2,000 minutos, 33 h 20 min.',
  note: 'Mide tu propio caudal: cronometra en segundos cuánto tarda en llenarse una cubeta de 5 galones con la manguera; galones por minuto = 300 ÷ esos segundos (30 segundos son 10 galones por minuto). Los 10 galones por minuto que ya aparecen son solo una cifra de partida.',
  methodLink: methodLink('fill-time'),
};
