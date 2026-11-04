import { ALKALINITY, CHLORINE, PUMP, SALT, STABILIZER } from './doses.ts';
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
];
