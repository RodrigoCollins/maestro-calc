import { CHLORINE, PUMP, SALT } from './doses.ts';
import { VOLUME_TEXTS } from './volume/texts.ts';

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
];
