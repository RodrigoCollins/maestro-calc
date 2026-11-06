import type { DosePage } from './doses.ts';
import { STRIP } from './strip.ts';

/*
 * The Spanish dose pages (plans/pool/SPANISH.md, slice 3): the same engines, fields and figures
 * as the English pages of `doses.ts`, in neutral Spanish (tú: Ingresa, Usa, Elige), US units and
 * the product names of the US labels. `doses-es.test.ts` holds each one to its English twin: the
 * same keys, and every figure of its method, note and warnings.
 */

const gallons = { label: 'Volumen de la piscina (galones)' };
const target = { label: 'Nivel deseado (ppm)' };

/** The hand-worked cases of each calculator are on the methodology page (English for now). */
const methodLink = (id: string) => ({
  href: `/methodology#${id}`,
  label: 'Cómo lo calculamos, con casos resueltos a mano (en inglés)',
});

export const SALT_ES: DosePage = {
  path: '/es/calculadora-de-sal-para-piscina',
  title: 'Calculadora de sal para piscina: ¿cuántas bolsas? | Pool Figures',
  description:
    'Cuántas libras y bolsas de sal de 40 lb suben tu piscina de su lectura actual al nivel que buscas, 3,200 ppm si no cambias nada.',
  kicker: 'Piscinas de agua salada · gratis',
  h1: 'Calculadora de sal para piscina',
  lead: 'Ingresa los galones de tu piscina o alberca, la lectura de sal de hoy y el nivel que pide tu celda. Obtienes las libras y las bolsas.',
  fields: { gallons, current: { label: 'Sal actual (ppm)' }, target },
  results: [
    { key: 'pounds', label: 'Sal que debes agregar', unit: 'LB' },
    { key: 'kilograms', label: 'Kilogramos', unit: 'kg' },
    { key: 'firstAddition', label: 'Agrega esto primero y mide después de 24 horas', unit: 'lb' },
  ],
  bags: 'bolsas de 40 lb',
  warnings: {
    drainToLower:
      'Tu sal está por encima del nivel deseado. La sal no se gasta: la única forma de bajarla es vaciar parte del agua y volver a llenar.',
  },
  method:
    'Libras = galones × (nivel deseado − lectura) × 8.34 ÷ 1,000,000, porque un galón de agua pesa unas 8.34 lb. El manual de AquaRite de Hayward da de 2,700 a 3,400 ppm, y 3,200 como el mejor nivel.',
  note: 'Usa sal para piscina con más de 99% de cloruro de sodio. Espera de 10 a 14 días antes de agregar sal a un acabado nuevo de yeso (plaster).',
  methodLink: methodLink('salt'),
};

export const CHLORINE_ES: DosePage = {
  path: '/es/calculadora-de-cloro-para-piscina',
  title: 'Calculadora de cloro para piscina: cuánto agregar | Pool Figures',
  description:
    'Cuánto cloro líquido, hipoclorito de calcio (cal-hypo) o dicloro sube el cloro libre de tu piscina de su lectura al nivel que buscas.',
  kicker: 'Cloro · gratis',
  h1: 'Calculadora de cloro para piscina',
  lead: 'Ingresa los galones de tu piscina, el cloro libre de hoy y el nivel que quieres. Obtienes la dosis del producto que tienes.',
  fields: {
    gallons,
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
  },
  results: [
    {
      key: 'liquid',
      label: 'Cloro líquido que debes agregar',
      unit: 'FL OZ',
      forms: ['liquid-12-5', 'liquid-10'],
    },
    {
      key: 'dry',
      label: 'Producto granulado que debes agregar',
      unit: 'OZ DE PESO',
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
    '1 ppm es 1 mg por litro. Los gramos de cloro disponible = galones × 3.785 × (nivel deseado − lectura) ÷ 1,000, divididos entre la concentración de la etiqueta: 10.24 fl oz de cloro líquido al 12.5% por ppm por cada 10,000 galones.',
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
  lead: 'Para bajar el pH, haz la prueba de demanda de ácido de tu kit; para subirlo, la prueba de demanda de base, y cuenta las gotas que necesita. Ingresa los galones de tu piscina y esas gotas. Obtienes el ácido muriático o el carbonato de sodio que debes agregar.',
  fields: {
    gallons,
    product: {
      label: 'Lo que necesitas',
      options: {
        'muriatic-31-45': 'Bajar el pH: ácido muriático, 31.45%',
        'soda-ash': 'Subir el pH: carbonato de sodio (soda ash)',
      },
    },
    drops: { label: 'Gotas de reactivo de demanda' },
  },
  results: [
    {
      key: 'liquid',
      label: 'Ácido muriático que debes agregar',
      unit: 'FL OZ',
      forms: ['muriatic-31-45'],
    },
    {
      key: 'dry',
      label: 'Carbonato de sodio que debes agregar',
      unit: 'OZ DE PESO',
      forms: ['soda-ash'],
    },
    {
      key: 'liquidPerDay',
      label: 'Lo más que puedes agregar en 24 horas',
      unit: 'fl oz',
      forms: ['muriatic-31-45'],
      detail: true,
    },
    { key: 'days', label: 'Días que toma', unit: '', forms: ['muriatic-31-45'], detail: true },
    {
      key: 'dryPerAddition',
      label: 'Lo más que puedes agregar de una vez',
      unit: 'oz',
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
    'Según la tabla de dosis de pH de Taylor Technologies: cada gota de reactivo de demanda de ácido equivale a 9.16 fl oz de ácido muriático por cada 10,000 galones, y cada gota de reactivo de demanda de base, a 5.13 oz de carbonato de sodio. Dosis = galones ÷ 10,000 × gotas × esa cantidad. La prueba se hace con tu propia agua, así que su alcalinidad ya está en la cuenta. El resultado es aproximado. La etiqueta de ácido muriático de HASA agrega como máximo un cuarto de galón por cada 20,000 galones en 24 horas, galones × 32 ÷ 20,000 fl oz al día, y lo repite cada 24 horas; la etiqueta de pH Up de carbonato de sodio agrega como máximo 1 lb por cada 10,000 galones de una vez y luego deja circular el agua de 2 a 3 horas. Días o veces = la dosis ÷ ese máximo, redondeado hacia arriba.',
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
  lead: 'Ingresa los galones de tu piscina, la alcalinidad total de hoy y el nivel que quieres. Obtienes las libras de bicarbonato de sodio que debes agregar.',
  fields: { gallons, current: { label: 'Alcalinidad actual (ppm)' }, target },
  results: [
    { key: 'pounds', label: 'Bicarbonato de sodio que debes agregar', unit: 'LB' },
    { key: 'ounces', label: 'Onzas', unit: 'oz' },
  ],
  warnings: {
    acidToLower:
      'Tu alcalinidad está por encima del nivel deseado. El bicarbonato solo la sube: bajar la alcalinidad requiere ácido, y esta calculadora no lo dosifica.',
  },
  method:
    'La alcalinidad total se mide como carbonato de calcio, así que 1 ppm requiere 84.007 ÷ 50.04 = 1.6788 mg por litro de bicarbonato de sodio. Miligramos = galones × 3.785 × (nivel deseado − lectura) × 1.6788: 1.4 lb por cada 10 ppm por cada 10,000 galones.',
  note: 'Usa bicarbonato de sodio puro (baking soda): revisa que la etiqueta del aumentador de alcalinidad lo diga. Para piscinas públicas, el Model Aquatic Health Code de los CDC mantiene la alcalinidad total entre 60 y 180 ppm.',
  methodLink: methodLink('alkalinity'),
};
