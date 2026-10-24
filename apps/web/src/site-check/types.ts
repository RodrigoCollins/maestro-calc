import type { Locale } from '@maestro-calc/i18n';
import type { HTMLElement } from 'node-html-parser';
import type { RouteTable } from '../routing/routes.ts';

/** One failed rule: the built file (relative to `dist`), the rule name and what is wrong. */
export interface Problem {
  readonly file: string;
  readonly rule: string;
  readonly message: string;
}

/** The text of every built file by posix path relative to `dist` (binary files hold ''). */
export type Dist = ReadonlyMap<string, string>;

/** What the checks compare the build against: the route table, the site settings and the catalogs. */
export interface Site {
  readonly routes: RouteTable;
  readonly config: { readonly name: string; readonly url: string; readonly contactEmail: string };
  readonly catalogs: Readonly<Record<Locale, Readonly<Record<string, string>>>>;
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
