import type { LongTailSource } from './sections.ts';

/*
 * The minimum school year of each state and DC, copied from the National Center for Education
 * Statistics, State Education Practices, Table 1.1 (2020, the newest version of the table: the older
 * Table 5.14 of 2018 links to it), read first-hand at
 * https://nces.ed.gov/programs/statereform/tab1_1-2020.asp on 2026-11-15. NCES compiled it from the
 * Education Commission of the States, 50 State Comparison: Instructional Time Policies, retrieved
 * November 19, 2020. The hours are condensed from the table's wording ("Kindergarten-grade 3=740
 * Grades 4-12=900" is `K-3: 740; 4-12: 900`); nothing is added to them.
 */

export const SCHOOL_YEAR_SOURCE: LongTailSource = {
  label:
    'National Center for Education Statistics, State Education Practices, Table 1.1: Minimum number of instructional days and hours in the school year, minimum number of hours per school day, and school start/finish dates, by state: 2020',
  href: 'https://nces.ed.gov/programs/statereform/tab1_1-2020.asp',
};

/** The year of the NCES table. */
export const SCHOOL_YEAR_TABLE_YEAR = 2020;

export interface SchoolYearState {
  readonly name: string;
  /** The minimum days of the main grades, when the state sets a day count. */
  readonly days?: number;
  /** The days as the table gives them: `180`, `186 (grade 12: 181)`, `None`, `Set by ...`. */
  readonly daysText: string;
  /** The minimum hours a year as the table gives them, by grade; `None` when the state sets none. */
  readonly hours: string;
  /** The minimum hours of a school day, when the table gives one figure for grades 1-12. */
  readonly perDay?: number;
  /** Footnote 1: a district may meet either the hours or the days. */
  readonly either?: true;
}

const NONE = 'None';

export const SCHOOL_YEAR_STATES: readonly SchoolYearState[] = [
  { name: 'Alabama', days: 180, daysText: '180', hours: '1,080', perDay: 6, either: true },
  {
    name: 'Alaska',
    days: 180,
    daysText: '180',
    hours: 'K-3: 740; 4-12: 900',
    either: true,
  },
  {
    name: 'Arizona',
    days: 180,
    daysText: '180',
    hours: '1-3: 712; 4-8: 890; 9-12: 720',
    either: true,
  },
  { name: 'Arkansas', daysText: 'Set by the state accreditation standards', hours: NONE },
  {
    name: 'California',
    days: 180,
    daysText: '180',
    hours: 'K: 600; 1-3: 840; 4-8: 900; 9-12: 1,080',
  },
  {
    name: 'Colorado',
    days: 160,
    daysText: '160',
    hours: 'half-day K: 450; full-day K: 900; 1-5: 990; 6-12: 1,080',
  },
  {
    name: 'Connecticut',
    days: 180,
    daysText: '180',
    hours: 'half-day K: 450; full-day K: 900; 1-12: 900',
  },
  { name: 'Delaware', daysText: NONE, hours: 'K-11: 1,060; 12: 1,032' },
  { name: 'District of Columbia', days: 180, daysText: '180', hours: NONE, perDay: 5 },
  { name: 'Florida', days: 180, daysText: '180', hours: 'K-3: 720; 4-12: 900', either: true },
  { name: 'Georgia', days: 180, daysText: '180', hours: NONE },
  { name: 'Hawaii', days: 180, daysText: '180', hours: '1,080' },
  {
    name: 'Idaho',
    daysText: 'Set by each district board of trustees',
    hours: 'K: 450; 1-3: 810; 4-8: 900; 9-12: 990',
  },
  { name: 'Illinois', days: 185, daysText: '185', hours: NONE },
  { name: 'Indiana', days: 180, daysText: '180', hours: NONE },
  { name: 'Iowa', days: 180, daysText: '180', hours: '1,080', perDay: 6 },
  {
    name: 'Kansas',
    days: 186,
    daysText: '186 (grade 12: 181)',
    hours: 'K: 465; 1-11: 1,116; 12: 1,086',
    perDay: 5,
  },
  { name: 'Kentucky', days: 170, daysText: '170', hours: '1,062', perDay: 6 },
  { name: 'Louisiana', days: 177, daysText: '177', hours: '1,062', perDay: 6, either: true },
  { name: 'Maine', days: 180, daysText: '180', hours: NONE },
  {
    name: 'Maryland',
    days: 180,
    daysText: '180',
    hours: '1,080; high schools: 1,170',
    perDay: 3,
  },
  {
    name: 'Massachusetts',
    days: 180,
    daysText: '180',
    hours: 'K: 425; 1-5: 900; 6-12: 990',
  },
  { name: 'Michigan', days: 180, daysText: '180', hours: '1,098' },
  {
    name: 'Minnesota',
    days: 165,
    daysText: '165 (grades 1-11)',
    hours: 'K: 425; full-day K: 850; 1-6: 935; 7-12: 1,020',
  },
  { name: 'Mississippi', days: 180, daysText: '180', hours: NONE, perDay: 5.5 },
  { name: 'Missouri', daysText: NONE, hours: 'K: 522; 1-12: 1,044', perDay: 3 },
  {
    name: 'Montana',
    daysText: 'Set by each district board of trustees',
    hours: 'half-day K: 360; full-day K: 720; 1-3: 720; 4-12: 1,080',
  },
  { name: 'Nebraska', daysText: NONE, hours: 'K: 400; 1-8: 1,032; 9-12: 1,080' },
  { name: 'Nevada', days: 180, daysText: '180', hours: NONE },
  {
    name: 'New Hampshire',
    days: 180,
    daysText: '180',
    hours: 'K: 450; elementary: 945; middle and high: 990',
    either: true,
  },
  { name: 'New Jersey', days: 180, daysText: '180', hours: NONE },
  {
    name: 'New Mexico',
    daysText: NONE,
    hours: 'half-day K: 450; full-day K: 990; 1-6: 990; 7-12: 1,080',
  },
  {
    name: 'New York',
    days: 180,
    daysText: '180',
    hours: 'half-day K: 450; full-day K: 900; 1-6: 900; 7-12: 990',
  },
  { name: 'North Carolina', days: 185, daysText: '185', hours: '1,025', either: true },
  {
    name: 'North Dakota',
    daysText: NONE,
    hours: 'half-day K: 481; full-day K: 962; 1-5: 962; 6-12: 1,050',
  },
  {
    name: 'Ohio',
    daysText: 'Set by each local board of education',
    hours: 'half-day K: 450; full-day K: 910; 1-6: 910; 7-12: 1,001',
  },
  { name: 'Oklahoma', days: 180, daysText: '180', hours: '1,080', perDay: 6, either: true },
  {
    name: 'Oregon',
    daysText: NONE,
    hours: 'half-day K: 450; full-day K: 900; 1-8: 900; 9-11: 990; 12: 966',
  },
  {
    name: 'Pennsylvania',
    days: 180,
    daysText: '180',
    hours: 'K: 450; 1-6: 900; 7-12: 990',
    either: true,
  },
  { name: 'Rhode Island', days: 180, daysText: '180', hours: '1,080', either: true },
  { name: 'South Carolina', days: 180, daysText: '180', hours: NONE, perDay: 6 },
  {
    name: 'South Dakota',
    daysText: 'Set by each local school board',
    hours: 'K: 438; 1-5: 875; 6-12: 963',
  },
  { name: 'Tennessee', days: 180, daysText: '180', hours: NONE },
  { name: 'Texas', daysText: NONE, hours: '1,260', perDay: 7 },
  { name: 'Utah', days: 180, daysText: '180', hours: '990' },
  { name: 'Vermont', days: 175, daysText: '175', hours: NONE },
  {
    name: 'Virginia',
    days: 180,
    daysText: '180',
    hours: 'K: 540; 1-12: 990',
    either: true,
  },
  {
    name: 'Washington',
    days: 180,
    daysText: '180',
    hours: 'K: 450; 1-8: 1,000; 9-12: 1,080',
  },
  { name: 'West Virginia', days: 180, daysText: '180', hours: NONE },
  { name: 'Wisconsin', daysText: NONE, hours: 'K: 437; 1-6: 1,050; 7-12: 1,137' },
  {
    name: 'Wyoming',
    days: 175,
    daysText: '175',
    hours: 'K: 450; 1-5: 900; 6-8: 1,050; 9-12: 1,100',
  },
];

/**
 * The hours-based rows: a state, or a band of grades, with a yearly hours minimum and a minimum day
 * the table gives for the same grades, so the two divide into a day count. Texas, New Mexico and
 * North Dakota set no day count at all.
 */
export const HOURS_BASED: readonly {
  readonly label: string;
  readonly hours: number;
  readonly perDay: number;
}[] = [
  { label: 'Texas', hours: 1260, perDay: 7 },
  { label: 'New Mexico, grades 1-6', hours: 990, perDay: 5.5 },
  { label: 'New Mexico, grades 7-12', hours: 1080, perDay: 6 },
  { label: 'North Dakota, elementary', hours: 962, perDay: 5.5 },
  { label: 'North Dakota, high school', hours: 1050, perDay: 6 },
];
