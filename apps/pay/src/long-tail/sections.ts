/*
 * The sections a long-tail page adds under its answer (AdSense low value audit, 2026-11-08): the
 * figures worked out step by step, tables and rules that are the page's own, computed by the engine
 * or taken from a cited primary source, then the sources. `LongTailPage.astro` renders them in order.
 */

/** A primary source of a section: a government page or a regulation. */
export interface LongTailSource {
  readonly label: string;
  readonly href: string;
}

/** A table of a section: a caption, the column heads, and rows whose first cell names the row. */
export interface LongTailTable {
  readonly caption: string;
  readonly head: readonly string[];
  readonly rows: readonly (readonly string[])[];
}

export interface LongTailSection {
  /** The id of the heading, unique on the page. */
  readonly id: string;
  readonly heading: string;
  readonly paragraphs: readonly string[];
  /** Numbered steps, after the paragraphs. */
  readonly steps?: readonly string[];
  /** A table, after the steps. */
  readonly table?: LongTailTable;
  /** Paragraphs after the table. */
  readonly after?: readonly string[];
  /** Pages of the site the section points to, listed after its paragraphs. */
  readonly links?: readonly { readonly href: string; readonly label: string }[];
}

/** The heading of the sources list of a long-tail page, in the words the content audit reads. */
export const SOURCES_HEADING = { en: 'Sources', es: 'Fuentes' } as const;

/** The U.S. Department of Labor and eCFR pages the long-tail sections cite. */
export const SOURCES = {
  factSheet23: {
    label: 'U.S. Department of Labor, Fact Sheet #23: Overtime Pay Requirements of the FLSA',
    href: 'https://www.dol.gov/agencies/whd/fact-sheets/23-flsa-overtime-pay',
  },
  factSheet17a: {
    label:
      'U.S. Department of Labor, Fact Sheet #17A: Exemption for Executive, Administrative, Professional, Computer & Outside Sales Employees Under the FLSA',
    href: 'https://www.dol.gov/agencies/whd/fact-sheets/17a-overtime',
  },
  ecfr778113: {
    label: '29 CFR 778.113, Salaried employees: general (eCFR)',
    href: 'https://www.ecfr.gov/current/title-29/section-778.113',
  },
  ecfr778207: {
    label: '29 CFR 778.207, Other types of contract premium pay distinguished (eCFR)',
    href: 'https://www.ecfr.gov/current/title-29/subtitle-B/chapter-V/subchapter-B/part-778/subpart-C/section-778.207',
  },
  ecfr778115: {
    label: '29 CFR 778.115, Employees working at two or more rates (eCFR)',
    href: 'https://www.ecfr.gov/current/title-29/subtitle-B/chapter-V/subchapter-B/part-778/subpart-C/section-778.115',
  },
  factSheet15: {
    label: 'U.S. Department of Labor, Fact Sheet #15: Tipped Employees Under the FLSA',
    href: 'https://www.dol.gov/agencies/whd/fact-sheets/15-tipped-employees-flsa',
  },
  vacation: {
    label: 'U.S. Department of Labor, Vacation Leave',
    href: 'https://www.dol.gov/general/topic/workhours/vacation_leave',
  },
  breaks: {
    label: 'U.S. Department of Labor, Breaks and Meal Periods',
    href: 'https://www.dol.gov/general/topic/workhours/breaks',
  },
  ecfr18: {
    label: '29 CFR 785.18, Rest (eCFR)',
    href: 'https://www.ecfr.gov/current/title-29/subtitle-B/chapter-V/subchapter-B/part-785/subpart-C/subject-group-ECFR3d1222debcd8ec6/section-785.18',
  },
  ecfr19: {
    label: '29 CFR 785.19, Meal (eCFR)',
    href: 'https://www.ecfr.gov/current/title-29/subtitle-B/chapter-V/subchapter-B/part-785/subpart-C/subject-group-ECFR3d1222debcd8ec6/section-785.19',
  },
  ecfr48: {
    label: '29 CFR 785.48, Use of time clocks (eCFR)',
    href: 'https://www.ecfr.gov/current/title-29/subtitle-B/chapter-V/subchapter-B/part-785/subpart-D/section-785.48',
  },
  irsFullTime: {
    label: 'IRS, Identifying full-time employees (Affordable Care Act)',
    href: 'https://www.irs.gov/affordable-care-act/employers/identifying-full-time-employees',
  },
  blsCps: {
    label: 'U.S. Bureau of Labor Statistics, Current Population Survey: concepts and definitions',
    href: 'https://www.bls.gov/cps/definitions.htm',
  },
  mealTable: {
    label:
      'U.S. Department of Labor, Minimum Length of Meal Period Required under State Law for Adult Employees in Private Sector (January 1, 2023)',
    href: 'https://www.dol.gov/agencies/whd/state/meal-breaks',
  },
} as const satisfies Readonly<Record<string, LongTailSource>>;
