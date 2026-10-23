/**
 * Spanish copy is neutral tú (docs/design/direction.md): no formal usted imperatives and no voseo.
 * The forms are the ones the catalog and Markdown contract tests reject, whole word and case
 * insensitive. Lookarounds replace `\b`, which treats accented letters as non-word characters.
 */
const FORMAL_IMPERATIVES = [
  'Ingrese',
  'Elija',
  'Utilice',
  'Consulte',
  'Contáctenos',
  'Póngase',
  'Verifique',
] as const;

const VOSEO = [
  'verificá',
  'calculá',
  'consultá',
  'elegí',
  'tenés',
  'podés',
  'querés',
  'sabés',
] as const;

const FORBIDDEN = new RegExp(
  `(?<![\\p{L}\\p{N}])(?:${[...FORMAL_IMPERATIVES, ...VOSEO].join('|')})(?![\\p{L}\\p{N}])`,
  'giu',
);

/** The forbidden forms in `text`, as written, in reading order. */
export const registerProblems = (text: string): string[] =>
  Array.from(text.matchAll(FORBIDDEN), (match) => match[0]);

/** One `key: form` line per forbidden form in the messages of a catalog module. */
export const catalogRegisterProblems = (module: Readonly<Record<string, string>>): string[] =>
  Object.entries(module).flatMap(([key, message]) =>
    registerProblems(message).map((form) => `${key}: ${form}`),
  );
