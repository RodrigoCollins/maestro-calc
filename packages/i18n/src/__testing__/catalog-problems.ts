import { hasStrayBraces, placeholdersOf } from '../translate.ts';

type Module = Readonly<Record<string, string>>;

// segment ( "." segment )+ where a segment is [A-Za-z0-9_-]+ (the spec grammar lists no `_`, but
// its own `errors.<CODE>` keys carry one: BELOW_MIN)
const KEY_GRAMMAR = /^[A-Za-z0-9_-]+(\.[A-Za-z0-9_-]+)+$/;

/** What is wrong with the pair (i18n-catalog › Catalog completeness and hygiene), one line each. */
export const catalogProblems = (en: Module, es: Module): string[] => [
  ...Object.keys(es)
    .filter((key) => !Object.hasOwn(en, key))
    .map((key) => `${key}: only in es`),
  ...Object.entries(en).flatMap(([key, message]) => {
    const translated = es[key];
    if (translated === undefined) return [`${key}: missing in es`];
    return [
      ...(KEY_GRAMMAR.test(key) ? [] : [`${key}: not a valid key`]),
      ...[
        ['en', message],
        ['es', translated],
      ].flatMap(([locale, text]) => [
        ...(text === undefined || text === '' ? [`${key}: empty in ${String(locale)}`] : []),
        ...(text !== text?.trim() ? [`${key}: surrounding whitespace in ${String(locale)}`] : []),
        ...(hasStrayBraces(text ?? '') ? [`${key}: stray brace in ${String(locale)}`] : []),
      ]),
      ...(placeholdersOf(message).join() === placeholdersOf(translated).join()
        ? []
        : [`${key}: placeholders differ`]),
    ];
  }),
];
