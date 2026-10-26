import type { Locale } from '@maestro-calc/i18n';
import type { HTMLElement } from 'node-html-parser';
import type { RouteTable } from '../routing/routes.ts';
import { templateOf } from '../routing/templates.ts';

/** One failed rule: the built file (relative to `dist`), the rule name and what is wrong. */
export interface Problem {
  readonly file: string;
  readonly rule: string;
  readonly message: string;
}

/** The text of every built file by posix path relative to `dist` (binary files hold ''). */
export type Dist = ReadonlyMap<string, string>;

/** What `Dist` cannot hold: the byte size of every built file and the bytes of every font. */
export interface BuildBytes {
  readonly sizes: ReadonlyMap<string, number>;
  readonly fonts: ReadonlyMap<string, Uint8Array>;
}

/** What the checks compare the build against: the route table, the site settings and the catalogs. */
export interface Site {
  readonly routes: RouteTable;
  readonly config: { readonly name: string; readonly url: string; readonly contactEmail: string };
  readonly catalogs: Readonly<Record<Locale, Readonly<Record<string, string>>>>;
  /** The `updated` date of each content entry, keyed `<locale>/<id>` (`en/about`). */
  readonly updates: Readonly<Record<string, string>>;
  /** The route ids rendered with the calculator template (`CALCULATOR_PAGES`); empty when none. */
  readonly calculatorPages: readonly string[];
  /** The outbound `https` links each calculator page may carry (its `sources[].url`), by page id. */
  readonly externalLinks: Readonly<Record<string, readonly string[]>>;
}

/**
 * What every rule group reads: the parsed pages, the text of the build, the site it is compared
 * with and the byte size of every file. One value, built once by `checkSite`, so a rule never
 * needs a defaulted argument.
 */
export interface CheckContext {
  readonly pages: readonly Page[];
  readonly dist: Dist;
  readonly site: Site;
  readonly sizes: BuildBytes['sizes'];
}

/** A built HTML page, parsed once, with the id and locale the route table gives its file. */
export interface Page {
  readonly file: string;
  /** A route id, or `notFound`. */
  readonly id: string;
  readonly locale: Locale;
  readonly routable: boolean;
  /** The source text, kept so rules can read what the parser drops (comments). */
  readonly html: string;
  readonly root: HTMLElement;
}

export const problem = (file: string, rule: string, message: string): Problem => ({
  file,
  rule,
  message,
});

/** Whether the route table's calculator list gives this page the calculator template. */
export const isCalculatorPage = (
  page: Page,
  { calculatorPages }: Pick<Site, 'calculatorPages'>,
): boolean => templateOf(page.id, calculatorPages) === 'calculator';
