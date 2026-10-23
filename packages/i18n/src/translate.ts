/** One flat catalog module: dotted message keys to message strings. */
export type Catalog = Readonly<Record<string, string>>;

/**
 * The shape an `es` module must have, given its `en` source of truth: the same keys, each a
 * string. Declared as `as const satisfies CatalogOf<typeof en>`, a missing or an extra key is a
 * compile error that names the key (i18n-catalog › Locales and catalog modules).
 */
export type CatalogOf<C extends Catalog> = { readonly [K in keyof C]: string };

// The text between `{` and `}`, for every placeholder of the message.
type NamesIn<S extends string> = S extends `${string}{${infer Name}}${infer Rest}`
  ? Name | NamesIn<Rest>
  : never;

/** The params a message needs: one entry per `{name}` placeholder, shown as text or a number. */
export type ParamsOf<S extends string> = Readonly<Record<NamesIn<S>, string | number>>;

type TranslateArgs<S extends string> = [NamesIn<S>] extends [never] ? [] : [params: ParamsOf<S>];

/** The function `createTranslator` returns: the key is checked against the catalog. */
export type Translator<C extends Catalog> = <K extends keyof C & string>(
  key: K,
  ...params: TranslateArgs<C[K]>
) => string;

/** Programming errors of the translator (design: there is no runtime fallback). */
export const I18N_ERROR_CODES = ['MISSING_MESSAGE', 'MISSING_PARAM'] as const;
export type I18nErrorCode = (typeof I18N_ERROR_CODES)[number];

export class I18nError extends Error {
  readonly code: I18nErrorCode;

  constructor(code: I18nErrorCode, detail: string) {
    super(`${code}: ${detail}`);
    this.name = 'I18nError';
    this.code = code;
  }
}

// `[A-Za-z][A-Za-z0-9]*` between braces (i18n-catalog › Message resolution).
const PLACEHOLDER = /\{([A-Za-z][A-Za-z0-9]*)\}/g;

/** The distinct placeholder names of a message, sorted. */
export const placeholdersOf = (message: string): string[] =>
  [...new Set(message.match(PLACEHOLDER)?.map((placeholder) => placeholder.slice(1, -1)))].sort();

/** True when the message has a `{` or `}` that is not part of a placeholder (a hygiene error). */
export const hasStrayBraces = (message: string): boolean =>
  /[{}]/.test(message.replaceAll(PLACEHOLDER, ''));

type Params = Readonly<Record<string, string | number>>;

/**
 * Returns `t(key, params?)` over `catalog`, typically the spread of the `common` module and one
 * calculator module of a locale. A key absent from the catalog (reachable only by casting past the
 * types) throws `MISSING_MESSAGE` and no other locale is consulted. Every `{name}` is replaced by
 * the text of the param of that name; a missing param throws `MISSING_PARAM`, extra params are
 * ignored, and a replaced value is inserted as it is, never scanned for placeholders again.
 */
export const createTranslator = <const C extends Catalog>(catalog: C): Translator<C> => {
  const translate = (key: string, params?: Params): string => {
    if (!Object.hasOwn(catalog, key)) throw new I18nError('MISSING_MESSAGE', key);
    return String(catalog[key]).replace(PLACEHOLDER, (_placeholder, name: string) => {
      const value = params !== undefined && Object.hasOwn(params, name) ? params[name] : undefined;
      if (value === undefined) throw new I18nError('MISSING_PARAM', `${key} needs {${name}}`);
      return String(value);
    });
  };
  return translate;
};
