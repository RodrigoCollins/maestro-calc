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
import { VOLUME_TEXTS } from './volume/texts.ts';

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
