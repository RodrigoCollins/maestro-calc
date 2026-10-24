import { globSync, readFileSync } from 'node:fs';
import { basename, dirname } from 'node:path';
import { pageSchema } from '../content/schema.ts';
import { registerProblems } from './register.ts';

/** One Markdown entry as the contract tests read it: path, raw frontmatter fields and body. */
export interface Entry {
  /** `<locale>/<id>.md`, relative to the pages directory. */
  readonly path: string;
  readonly fields: Readonly<Record<string, string>>;
  readonly body: string;
}

/** Splits `---` frontmatter (flat `key: value` lines) from the Markdown body. */
export const parseEntry = (path: string, text: string): Entry => {
  const match = /^---\n(.*?)\n---\n(.*)$/s.exec(text);
  const [, header = '', body = text] = match ?? [];
  const fields = Object.fromEntries(
    header
      .split('\n')
      .filter((line) => line.includes(':'))
      .map((line) => {
        const [key = '', ...value] = line.split(':');
        return [key.trim(), value.join(':').trim()];
      }),
  );
  return { path, fields, body };
};

/** Every `<locale>/<id>.md` under `directory`, sorted by path. */
export const readEntries = (directory: string): Entry[] =>
  globSync('*/*.md', { cwd: directory })
    .sort()
    .map((file) => parseEntry(file, readFileSync(`${directory}/${file}`, 'utf8')));

const idOf = (entry: Entry): string => basename(entry.path, '.md');
const localeOf = (entry: Entry): string => dirname(entry.path);

/** `id/locale` pairs that the entries lack or add against the expected set, one line each. */
export const setProblems = (
  entries: readonly Entry[],
  ids: readonly string[],
  locales: readonly string[],
): string[] => {
  const have = new Set(entries.map((entry) => `${idOf(entry)}/${localeOf(entry)}`));
  const want = ids.flatMap((id) => locales.map((locale) => `${id}/${locale}`));
  return [
    ...want.filter((pair) => !have.has(pair)).map((pair) => `missing entry ${pair}`),
    ...[...have].filter((pair) => !want.includes(pair)).map((pair) => `unexpected entry ${pair}`),
  ];
};

/** Frontmatter problems of one entry: schema violations and an id or locale that differs from its path. */
export const frontmatterProblems = (entry: Entry): string[] => {
  const parsed = pageSchema.safeParse(entry.fields);
  const schema = parsed.success
    ? []
    : parsed.error.issues.map(
        (issue) => `${entry.path}: ${issue.path.join('.')}: ${issue.message}`,
      );
  return [
    ...schema,
    ...(entry.fields['id'] === idOf(entry) ? [] : [`${entry.path}: id differs from the path`]),
    ...(entry.fields['locale'] === localeOf(entry)
      ? []
      : [`${entry.path}: locale differs from the path`]),
  ];
};

/** Lines that open a level-2 heading, as `##` Markdown or a raw `<h2>` element. */
export const h2Count = (body: string): number => (body.match(/^(?:## |<h2[\s>])/gm) ?? []).length;

/** Lines that open a level-1 heading. */
export const h1Count = (body: string): number => (body.match(/^# /gm) ?? []).length;

/** The ids of raw `<h2 id="…">` headings, in order. */
export const h2Ids = (body: string): string[] =>
  Array.from(body.matchAll(/<h2 id="([^"]+)"/g), (match) => match[1] ?? '');

/** The text of the section that starts at the heading carrying `id`, up to the next `<h2`. */
export const sectionOf = (body: string, id: string): string => {
  const start = body.indexOf(`<h2 id="${id}"`);
  if (start === -1) return '';
  const next = body.indexOf('<h2', start + 1);
  return body.slice(start, next === -1 ? undefined : next);
};

/** Every e-mail address written in `text`. */
export const emailsIn = (text: string): string[] =>
  Array.from(text.matchAll(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g), (match) => match[0]);

/** Register problems of an entry, as `path: form` lines (Spanish entries only). */
export const entryRegisterProblems = (entry: Entry): string[] =>
  localeOf(entry) === 'es'
    ? registerProblems(entry.body).map((form) => `${entry.path}: ${form}`)
    : [];

/** The `terms` that occur in `text`, ignoring case. */
export const present = (text: string, terms: readonly string[]): string[] =>
  terms.filter((term) => text.toLowerCase().includes(term.toLowerCase()));
