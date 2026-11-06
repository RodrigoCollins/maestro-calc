import {
  ALKALINITY,
  CALCIUM,
  CHLORINE,
  FILL_TIME,
  HEATER,
  PH,
  PUMP,
  SALT,
  STABILIZER,
} from './doses.ts';
import {
  ALKALINITY_ES,
  CALCIUM_ES,
  CHLORINE_ES,
  FILL_TIME_ES,
  HEATER_ES,
  PH_ES,
  PUMP_ES,
  SALT_ES,
  STABILIZER_ES,
} from './doses-es.ts';
import { routeOf, type Lang } from './routes.ts';
import { VOLUME_TEXTS, VOLUME_TEXTS_ES } from './volume/texts.ts';

/** The public-pool limits of the alkalinity and stabilizer pages: MAHC 5.7.4.4.1 and 5.7.3.1.3.2. */
const MAHC = {
  name: 'CDC, 2024 Model Aquatic Health Code, 5th Edition: total alkalinity 60 to 180 ppm (5.7.4.4.1), CYA at or below 90 ppm (5.7.3.1.3.2)',
  url: 'https://www.cdc.gov/model-aquatic-health-code/media/pdfs/2024/11/5th-Ed-MAHC-Code-508.pdf',
};

/** A source of a section: its name as it is cited, and a link when there is a public one. */
export interface MethodSource {
  readonly name: string;
  readonly url?: string;
}

/** A hand-verified case: the inputs, the working, and the figure the engine must give. */
export interface MethodCase {
  readonly text: string;
  readonly raw: Readonly<Record<string, string>>;
  readonly key: string;
  readonly result: string;
  readonly unit: string;
}

export interface MethodSection {
  readonly id: string;
  readonly title: string;
  readonly href: string;
  readonly method: string;
  readonly note: string;
  readonly sources: readonly MethodSource[];
  readonly cases: readonly MethodCase[];
}

/** How each calculator works it out: the page's own formula and note, its sources and its cases. */
export const METHOD_SECTIONS: readonly MethodSection[] = [
  {
    id: 'volume',
    title: 'Pool volume',
    href: VOLUME_TEXTS.path,
    method: VOLUME_TEXTS.method,
    note: VOLUME_TEXTS.note,
    sources: [
      {
        name: 'NIST Handbook 44, Appendix C: one US gallon is 231 cubic inches',
        url: 'https://www.nist.gov/pml/owm/nist-handbook-44-current-edition',
      },
    ],
    cases: [
      {
        text: 'A 32 × 16 ft rectangle, 3 ft 6 in and 8 ft deep: 512 ft² × 5.75 ft = 2,944 ft³, and 2,944 × 1,728 ÷ 231 =',
        raw: { length: '32 ft', width: '16 ft', shallow: '3 ft 6 in', deep: '8 ft' },
        key: 'gallons',
        result: '22,023',
        unit: 'gallons',
      },
      {
        text: 'A round pool 24 ft across, 4 ft deep: π × 24² ÷ 4 = 452.4 ft², × 4 ft = 1,809.6 ft³, and × 1,728 ÷ 231 =',
        raw: { shape: 'round', length: '24 ft', shallow: '4 ft', deep: '4 ft' },
        key: 'gallons',
        result: '13,536',
        unit: 'gallons',
      },
    ],
  },
  {
    id: 'salt',
    title: 'Pool salt',
    href: SALT.path,
    method: SALT.method,
    note: SALT.note,
    sources: [{ name: 'Hayward AquaRite owner’s manual, 092538 Rev D' }],
    cases: [
      {
        text: '20,000 gallons from 2,400 to 3,200 ppm: 20,000 × 800 × 8.34 ÷ 1,000,000 =',
        raw: { gallons: '20000', current: '2400', target: '3200' },
        key: 'pounds',
        result: '133.4',
        unit: 'lb',
      },
    ],
  },
  {
    id: 'chlorine',
    title: 'Chlorine',
    href: CHLORINE.path,
    method: CHLORINE.method,
    note: CHLORINE.note,
    sources: [
      { name: 'Calcium hypochlorite label, EPA Reg. No. 1258-1232' },
      { name: 'Dichlor label, EPA Reg. No. 7124-31' },
    ],
    cases: [
      {
        text: '20,000 gallons from 1 to 3 ppm with 12.5% liquid: 10.24 fl oz × 2 ppm × 2 =',
        raw: { gallons: '20000', current: '1', target: '3', product: 'liquid-12-5' },
        key: 'liquid',
        result: '41.0',
        unit: 'fl oz',
      },
    ],
  },
  {
    id: 'pump',
    title: 'Pump size',
    href: PUMP.path,
    method: PUMP.method,
    note: PUMP.note,
    sources: [
      {
        name: 'ICC CodeNotes: 2021 ISPSC circulation and velocity (ANSI/APSP/ICC-15)',
        url: 'https://www.iccsafe.org/wp-content/uploads/24-23329_CodeNotes_2021_ISPSC_Velocity_FINAL_MIDRES.pdf',
      },
    ],
    cases: [
      {
        text: '20,000 gallons turned over in 6 hours: 20,000 ÷ 360 =',
        raw: { gallons: '20000' },
        key: 'flow',
        result: '55.6',
        unit: 'gpm',
      },
    ],
  },
  {
    id: 'ph',
    title: 'pH',
    href: PH.path,
    method: PH.method,
    note: PH.note,
    sources: [
      {
        name: 'Taylor Technologies, K-1003 test kit instructions (Instr. #5816), pH dosage charts: 9.16 fl oz of muriatic acid (31.45% HCl) a drop of acid demand reagent R-0015, and 5.13 oz of soda ash (sodium carbonate, 100%) a drop of base demand reagent R-0016, per 10,000 gallons, for 1 to 3 drops',
        url: 'https://www.novatech-usa.com/pdf/Taylor%20K-1003%20Instruction%20Manual.pdf',
      },
      {
        name: 'Taylor Technologies, K-1004 test kit instructions (Instr. #5817): the same muriatic acid chart',
        url: 'https://waterlinetechnologies.com/content/Taylor/K-1004%20Instrustions.pdf',
      },
      {
        name: 'HASA Muriatic Acid (31.45% hydrochloric acid), product page, directions for use: one quart per 20,000 gallons of pool water per 24 hours, repeated at 24-hour intervals as necessary',
        url: 'https://hasa.com/hubfs/Product%20Assets/Muriatic%20Acid/Muriatic%20Acid%20-%20Product%20Page.pdf',
      },
      {
        name: 'pH Up (sodium carbonate 100%) label, manufactured for Alliance Trading, Inc. (label 01616483, REV050824): a maximum of 1 pound per 10,000 gallons, recirculated 2 to 3 hours before the pH is rechecked and the treatment repeated',
        url: 'https://www.propools.com/Manuals/66872_20248714245.pdf',
      },
    ],
    cases: [
      {
        text: '10,000 gallons, 2 drops of acid demand reagent: 10,000 ÷ 10,000 × 2 × 9.16 fl oz =',
        raw: { gallons: '10000', product: 'muriatic-31-45', drops: '2' },
        key: 'liquid',
        result: '18.3',
        unit: 'fl oz',
      },
      {
        text: '20,000 gallons, 2 drops of base demand reagent: 20,000 ÷ 10,000 × 2 × 5.13 oz =',
        raw: { gallons: '20000', product: 'soda-ash', drops: '2' },
        key: 'dry',
        result: '20.5',
        unit: 'oz',
      },
      {
        text: '20,000 gallons, 2 drops of acid demand reagent: 20,000 ÷ 10,000 × 2 × 9.16 fl oz =',
        raw: { gallons: '20000', product: 'muriatic-31-45', drops: '2' },
        key: 'liquid',
        result: '36.6',
        unit: 'fl oz',
      },
      {
        text: 'HASA’s label adds at most one quart per 20,000 gallons a day: 20,000 × 32 ÷ 20,000 =',
        raw: { gallons: '20000', product: 'muriatic-31-45', drops: '2' },
        key: 'liquidPerDay',
        result: '32.0',
        unit: 'fl oz a day',
      },
      {
        text: 'So the 36.64 fl oz go in over 36.64 ÷ 32 = 1.145 days, rounded up:',
        raw: { gallons: '20000', product: 'muriatic-31-45', drops: '2' },
        key: 'days',
        result: '2',
        unit: 'days',
      },
      {
        text: 'The pH Up label adds at most 1 lb of soda ash per 10,000 gallons at a time: 20,000 ÷ 10,000 × 16 oz =',
        raw: { gallons: '20000', product: 'soda-ash', drops: '2' },
        key: 'dryPerAddition',
        result: '32.0',
        unit: 'oz',
      },
      {
        text: 'So the 20.52 oz go in 20.52 ÷ 32 = 0.64 additions, rounded up:',
        raw: { gallons: '20000', product: 'soda-ash', drops: '2' },
        key: 'additions',
        result: '1',
        unit: 'addition',
      },
    ],
  },
  {
    id: 'alkalinity',
    title: 'Alkalinity',
    href: ALKALINITY.path,
    method: ALKALINITY.method,
    note: ALKALINITY.note,
    sources: [MAHC],
    cases: [
      {
        text: '10,000 gallons from 80 to 90 ppm: 37,854.1 L × 10 × 1.6788 mg = 635.5 g, and 635.5 ÷ 453.6 =',
        raw: { gallons: '10000', current: '80', target: '90' },
        key: 'pounds',
        result: '1.4',
        unit: 'lb',
      },
      {
        text: '20,000 gallons from 70 to 100 ppm: 75,708.2 L × 30 × 1.6788 mg = 3,813.0 g, and 3,813.0 ÷ 28.35 =',
        raw: { gallons: '20000', current: '70', target: '100' },
        key: 'ounces',
        result: '134.5',
        unit: 'oz',
      },
    ],
  },
  {
    id: 'stabilizer',
    title: 'Stabilizer',
    href: STABILIZER.path,
    method: STABILIZER.method,
    note: STABILIZER.note,
    sources: [MAHC],
    cases: [
      {
        text: '10,000 gallons from 20 to 30 ppm: 37,854.1 L × 10 mg = 378.5 g, and 378.5 ÷ 28.35 =',
        raw: { gallons: '10000', current: '20', target: '30' },
        key: 'ounces',
        result: '13.4',
        unit: 'oz',
      },
      {
        text: '20,000 gallons from 0 to 30 ppm: 75,708.2 L × 30 mg = 2,271.2 g, and 2,271.2 ÷ 453.6 =',
        raw: { gallons: '20000', current: '0', target: '30' },
        key: 'pounds',
        result: '5.0',
        unit: 'lb',
      },
    ],
  },
  {
    id: 'calcium',
    title: 'Calcium hardness',
    href: CALCIUM.path,
    method: CALCIUM.method,
    note: CALCIUM.note,
    sources: [
      {
        name: 'ClearView Calcium Increaser, Critical Usage Information (Oreq Corporation): calcium chloride, 2 oz per 1,000 gallons raises calcium hardness 10 ppm; over 3 lb per 10,000 gallons, separate doses at least 12 hours apart',
        url: 'https://cdn.shopify.com/s/files/1/0100/9998/2432/files/Calcium_Increaser.pdf',
      },
      {
        name: 'ClearView Calcium Increaser safety data sheet (Oreq Corporation): calcium chloride flake, 74 to 100% by weight',
        url: 'https://cdn.shopify.com/s/files/1/0100/9998/2432/files/SDS_Calcium_Increaser.pdf',
      },
      {
        name: 'Hayward AquaRite owner’s manual, 092538 Rev D: Water Chemistry, calcium hardness 200 to 400 ppm',
        url: 'https://hayward.com/media/akeneo_connector/asset_files/0/9/092538_RevD_b778.pdf',
      },
      {
        name: 'CDC, 2024 Model Aquatic Health Code, 5th Edition: calcium hardness at most 2,500 ppm in a public pool',
        url: 'https://www.cdc.gov/model-aquatic-health-code/media/pdfs/2024/11/5th-Ed-MAHC-Code-508.pdf',
      },
    ],
    cases: [
      {
        text: '10,000 gallons from 200 to 210 ppm: 10,000 ÷ 1,000 × 2 oz =',
        raw: { gallons: '10000', current: '200', target: '210' },
        key: 'ounces',
        result: '20.0',
        unit: 'oz',
      },
      {
        text: '20,000 gallons from 150 to 250 ppm: 20,000 × 100 ÷ 80,000 =',
        raw: { gallons: '20000', current: '150', target: '250' },
        key: 'pounds',
        result: '25.0',
        unit: 'lb',
      },
      {
        text: 'That is over 3 lb per 10,000 gallons, so the first addition is 20,000 ÷ 10,000 × 3 lb =',
        raw: { gallons: '20000', current: '150', target: '250' },
        key: 'firstAddition',
        result: '6.0',
        unit: 'lb',
      },
    ],
  },
  {
    id: 'heater',
    title: 'Heater size',
    href: HEATER.path,
    method: HEATER.method,
    note: HEATER.note,
    sources: [
      {
        name: 'USGS Water Science School: water weighs 62.366 lb per cubic foot at 60 °F, and 62.366 × 231 ÷ 1,728 = 8.34 lb per gallon',
        url: 'https://www.usgs.gov/special-topics/water-science-school/science/water-density',
      },
      {
        name: 'U.S. Department of Energy, Energy Saver: Gas Pool Heaters (pool area × temperature rise × 12; archived copy of May 1, 2026)',
        url: 'https://web.archive.org/web/20260501012216/https://www.energy.gov/energysaver/gas-pool-heaters',
      },
    ],
    cases: [
      {
        text: '20,000 gallons warmed 10 °F in 24 hours: 20,000 × 8.34 × 10 = 1,668,000 BTU, and 1,668,000 ÷ 24 =',
        raw: { gallons: '20000', rise: '10', hours: '24' },
        key: 'btuPerHour',
        result: '69,500',
        unit: 'BTU per hour',
      },
      {
        text: '15,000 gallons warmed 8 °F: 15,000 × 8.34 × 8 =',
        raw: { gallons: '15000', rise: '8', hours: '12' },
        key: 'btu',
        result: '1,000,800',
        unit: 'BTU',
      },
    ],
  },
  {
    id: 'fill-time',
    title: 'Fill time',
    href: FILL_TIME.path,
    method: FILL_TIME.method,
    note: FILL_TIME.note,
    sources: [
      {
        name: 'NIST SP 811, Table 6: 1 h = 60 min and 1 min = 60 s, so a 5-gallon bucket filled in S seconds is 5 × 60 ÷ S = 300 ÷ S gallons a minute',
        url: 'https://www.nist.gov/pml/special-publication-811/nist-guide-si-chapter-5-units-outside-si',
      },
    ],
    cases: [
      {
        text: '20,000 gallons at 10 gallons a minute: 20,000 ÷ 10 = 2,000 minutes, and 2,000 ÷ 60 =',
        raw: { gallons: '20000', flow: '10' },
        key: 'time',
        result: '33 h 20 min',
        unit: 'to fill',
      },
      {
        text: '15,000 gallons at 12 gallons a minute: 15,000 ÷ 12 =',
        raw: { gallons: '15000', flow: '12' },
        key: 'minutes',
        result: '1,250',
        unit: 'minutes',
      },
    ],
  },
];

/** The public-pool limits of the alkalinity and stabilizer pages, as the Spanish sections cite them. */
const MAHC_ES =
  'CDC, Model Aquatic Health Code de 2024, 5.ª edición: alcalinidad total de 60 a 180 ppm (5.7.4.4.1), CYA de 90 ppm o menos (5.7.3.1.3.2)';
/** The Spanish text of a section, by id: its title, its sources and the text and unit of each case. */
interface SpanishSection {
  readonly title: string;
  readonly sources: readonly string[];
  readonly cases: readonly (readonly [text: string, unit: string])[];
}

/*
 * The Spanish methodology (plans/pool/SPANISH.md, slice 5): the same sections, sources (by their
 * links) and cases as the English one, each case's inputs and figure taken from it, so the engine
 * run that checks the English figure checks the Spanish one. `methodology.test.ts` holds every
 * figure of each Spanish case and source to its English twin.
 */
const SPANISH: Readonly<Record<string, SpanishSection>> = {
  volume: {
    title: 'Volumen de la piscina',
    sources: ['NIST Handbook 44, apéndice C: un galón de EE. UU. tiene 231 pulgadas cúbicas'],
    cases: [
      [
        'Un rectángulo de 32 × 16 ft, de 3 ft 6 in y 8 ft de profundidad: 512 ft² × 5.75 ft = 2,944 ft³, y 2,944 × 1,728 ÷ 231 =',
        'galones',
      ],
      [
        'Una piscina redonda de 24 ft de diámetro y 4 ft de profundidad: π × 24² ÷ 4 = 452.4 ft², × 4 ft = 1,809.6 ft³, y × 1,728 ÷ 231 =',
        'galones',
      ],
    ],
  },
  salt: {
    title: 'Sal',
    sources: ['Manual del usuario de Hayward AquaRite, 092538 Rev D'],
    cases: [['20,000 galones de 2,400 a 3,200 ppm: 20,000 × 800 × 8.34 ÷ 1,000,000 =', 'lb']],
  },
  chlorine: {
    title: 'Cloro',
    sources: [
      'Etiqueta de hipoclorito de calcio, EPA Reg. No. 1258-1232',
      'Etiqueta de dicloro, EPA Reg. No. 7124-31',
    ],
    cases: [
      [
        '20,000 galones de 1 a 3 ppm con cloro líquido al 12.5%: 10.24 fl oz × 2 ppm × 2 =',
        'fl oz',
      ],
    ],
  },
  pump: {
    title: 'Tamaño de bomba',
    sources: ['ICC CodeNotes: circulación y velocidad del ISPSC de 2021 (ANSI/APSP/ICC-15)'],
    cases: [['20,000 galones filtrados en 6 horas: 20,000 ÷ 360 =', 'gpm']],
  },
  ph: {
    title: 'pH',
    sources: [
      'Taylor Technologies, instrucciones del kit K-1003 (Instr. #5816), tablas de dosis de pH: 9.16 fl oz de ácido muriático (31.45% de HCl) por gota de reactivo de demanda de ácido R-0015, y 5.13 oz de carbonato de sodio (100%) por gota de reactivo de demanda de base R-0016, por cada 10,000 galones, de 1 a 3 gotas',
      'Taylor Technologies, instrucciones del kit K-1004 (Instr. #5817): la misma tabla de ácido muriático',
      'HASA Muriatic Acid (31.45% de ácido clorhídrico), ficha del producto, modo de uso: un cuarto de galón por cada 20,000 galones de agua de piscina cada 24 horas, repetido cada 24 horas si hace falta',
      'Etiqueta de pH Up (carbonato de sodio 100%), fabricado para Alliance Trading, Inc. (etiqueta 01616483, REV050824): como máximo 1 libra por cada 10,000 galones, con 2 a 3 horas de recirculación antes de medir otra vez el pH y repetir',
    ],
    cases: [
      [
        '10,000 galones, 2 gotas de reactivo de demanda de ácido: 10,000 ÷ 10,000 × 2 × 9.16 fl oz =',
        'fl oz',
      ],
      [
        '20,000 galones, 2 gotas de reactivo de demanda de base: 20,000 ÷ 10,000 × 2 × 5.13 oz =',
        'oz',
      ],
      [
        '20,000 galones, 2 gotas de reactivo de demanda de ácido: 20,000 ÷ 10,000 × 2 × 9.16 fl oz =',
        'fl oz',
      ],
      [
        'La etiqueta de HASA agrega como máximo un cuarto de galón por cada 20,000 galones al día: 20,000 × 32 ÷ 20,000 =',
        'fl oz al día',
      ],
      [
        'Así que las 36.64 fl oz se agregan en 36.64 ÷ 32 = 1.145 días, redondeado hacia arriba:',
        'días',
      ],
      [
        'La etiqueta de pH Up agrega como máximo 1 lb de carbonato de sodio por cada 10,000 galones de una vez: 20,000 ÷ 10,000 × 16 oz =',
        'oz',
      ],
      [
        'Así que las 20.52 oz se agregan en 20.52 ÷ 32 = 0.64 veces, redondeado hacia arriba:',
        'vez',
      ],
    ],
  },
  alkalinity: {
    title: 'Alcalinidad',
    sources: [MAHC_ES],
    cases: [
      [
        '10,000 galones de 80 a 90 ppm: 37,854.1 L × 10 × 1.6788 mg = 635.5 g, y 635.5 ÷ 453.6 =',
        'lb',
      ],
      [
        '20,000 galones de 70 a 100 ppm: 75,708.2 L × 30 × 1.6788 mg = 3,813.0 g, y 3,813.0 ÷ 28.35 =',
        'oz',
      ],
    ],
  },
  stabilizer: {
    title: 'Estabilizador',
    sources: [MAHC_ES],
    cases: [
      ['10,000 galones de 20 a 30 ppm: 37,854.1 L × 10 mg = 378.5 g, y 378.5 ÷ 28.35 =', 'oz'],
      ['20,000 galones de 0 a 30 ppm: 75,708.2 L × 30 mg = 2,271.2 g, y 2,271.2 ÷ 453.6 =', 'lb'],
    ],
  },
  calcium: {
    title: 'Dureza de calcio',
    sources: [
      'ClearView Calcium Increaser, información crítica de uso (Oreq Corporation): cloruro de calcio, 2 oz por cada 1,000 galones suben la dureza de calcio 10 ppm; por encima de 3 lb por cada 10,000 galones, dosis separadas por al menos 12 horas',
      'Hoja de datos de seguridad de ClearView Calcium Increaser (Oreq Corporation): cloruro de calcio en escamas, de 74 a 100% en peso',
      'Manual del usuario de Hayward AquaRite, 092538 Rev D: química del agua, dureza de calcio de 200 a 400 ppm',
      'CDC, Model Aquatic Health Code de 2024, 5.ª edición: dureza de calcio de 2,500 ppm como máximo en una piscina pública',
    ],
    cases: [
      ['10,000 galones de 200 a 210 ppm: 10,000 ÷ 1,000 × 2 oz =', 'oz'],
      ['20,000 galones de 150 a 250 ppm: 20,000 × 100 ÷ 80,000 =', 'lb'],
      [
        'Es más de 3 lb por cada 10,000 galones, así que la primera vez se agregan 20,000 ÷ 10,000 × 3 lb =',
        'lb',
      ],
    ],
  },
  heater: {
    title: 'Tamaño de calentador',
    sources: [
      'USGS Water Science School: el agua pesa 62.366 lb por pie cúbico a 60 °F, y 62.366 × 231 ÷ 1,728 = 8.34 lb por galón',
      'Departamento de Energía de EE. UU., Energy Saver: Gas Pool Heaters (superficie de la piscina × aumento de temperatura × 12; copia archivada del 1 de mayo de 2026)',
    ],
    cases: [
      [
        '20,000 galones calentados 10 °F en 24 horas: 20,000 × 8.34 × 10 = 1,668,000 BTU, y 1,668,000 ÷ 24 =',
        'BTU por hora',
      ],
      ['15,000 galones calentados 8 °F: 15,000 × 8.34 × 8 =', 'BTU'],
    ],
  },
  'fill-time': {
    title: 'Tiempo de llenado',
    sources: [
      'NIST SP 811, tabla 6: 1 h = 60 min y 1 min = 60 s, así que una cubeta de 5 galones que se llena en S segundos da 5 × 60 ÷ S = 300 ÷ S galones por minuto',
    ],
    cases: [
      [
        '20,000 galones a 10 galones por minuto: 20,000 ÷ 10 = 2,000 minutos, y 2,000 ÷ 60 =',
        'para llenarse',
      ],
      ['15,000 galones a 12 galones por minuto: 15,000 ÷ 12 =', 'minutos'],
    ],
  },
};

/** The formula and note of each Spanish section, its calculator page's own, by section id. */
const SPANISH_PAGES: Readonly<Record<string, { readonly method: string; readonly note: string }>> =
  {
    volume: VOLUME_TEXTS_ES,
    salt: SALT_ES,
    chlorine: CHLORINE_ES,
    pump: PUMP_ES,
    ph: PH_ES,
    alkalinity: ALKALINITY_ES,
    stabilizer: STABILIZER_ES,
    calcium: CALCIUM_ES,
    heater: HEATER_ES,
    'fill-time': FILL_TIME_ES,
  };

const METHOD_SECTIONS_ES: readonly MethodSection[] = METHOD_SECTIONS.map((section) => {
  const texts = SPANISH[section.id];
  const page = SPANISH_PAGES[section.id];
  const href = routeOf(section.href)?.es;
  if (texts === undefined || page === undefined || href === undefined)
    throw new Error(`no Spanish methodology for ${section.id}`);
  return {
    id: section.id,
    title: texts.title,
    href,
    method: page.method,
    note: page.note,
    sources: section.sources.map(({ url }, index) => ({
      name: texts.sources[index] ?? '',
      ...(url === undefined ? {} : { url }),
    })),
    cases: section.cases.map((worked, index) => {
      const [text, unit] = texts.cases[index] ?? ['', ''];
      return { ...worked, text, unit };
    }),
  };
});

/** The sections of the methodology in `lang`. */
export const methodSectionsOf = (lang: Lang): readonly MethodSection[] =>
  lang === 'en' ? METHOD_SECTIONS : METHOD_SECTIONS_ES;

/** The words of the methodology page around its sections, in each language. */
export const METHOD_PAGE = {
  en: {
    title: 'How we work it out | Pool Figures',
    description:
      'The formulas, sources and worked examples behind every Pool Figures calculator, from volume, salt and chlorine to pH, calcium hardness, pump and heater size.',
    h1: 'How we work it out',
    lead: 'Every calculator does exact arithmetic and rounds only the figure you read. Each section gives the formula, where its numbers come from and a case worked out by hand, which the calculator must match to the last digit.',
    sectionsLabel: 'Sections',
    example: 'Worked example',
    examples: 'Worked examples',
    source: 'Source',
    sources: 'Sources',
    open: (title: string) => `Open the ${title.toLowerCase()} calculator`,
  },
  es: {
    title: 'Cómo lo calculamos: fórmulas y fuentes | Pool Figures',
    description:
      'Las fórmulas, fuentes y casos resueltos de cada calculadora de Pool Figures: volumen, sal, cloro, pH, dureza de calcio, bomba y calentador.',
    h1: 'Cómo lo calculamos',
    lead: 'Cada calculadora hace aritmética exacta y solo redondea la cifra que lees. Cada sección da la fórmula, de dónde salen sus números y un caso resuelto a mano, que la calculadora debe dar hasta el último dígito.',
    sectionsLabel: 'Secciones',
    example: 'Caso resuelto',
    examples: 'Casos resueltos',
    source: 'Fuente',
    sources: 'Fuentes',
    open: (title: string) => `Abre la calculadora: ${title.toLowerCase()}`,
  },
} as const satisfies Record<
  Lang,
  {
    readonly title: string;
    readonly description: string;
    readonly h1: string;
    readonly lead: string;
    readonly sectionsLabel: string;
    readonly example: string;
    readonly examples: string;
    readonly source: string;
    readonly sources: string;
    readonly open: (title: string) => string;
  }
>;
