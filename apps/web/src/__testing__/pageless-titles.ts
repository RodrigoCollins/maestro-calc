import type { Locale } from '@maestro-calc/i18n';
import { importFromRoot } from '../contract/root.ts';
import { PAGELESS } from '../routing/templates.ts';

const LOCALES = ['en', 'es'] as const satisfies readonly Locale[];

const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
  typeof value === 'object' && value !== null;

/**
 * `calc.<id>.title` of a calculator in `locale`, read from its own catalog module
 * (`packages/i18n/src/catalogs/<locale>/<id>.ts`). Throws naming the key and the locale when the
 * module or the key is missing, so a renamed catalog fails loudly instead of checking nothing.
 */
export const calculatorTitle = async (id: string, locale: Locale): Promise<string> => {
  const key = `calc.${id}.title`;
  const path = `packages/i18n/src/catalogs/${locale}/${id}.ts`;
  let module: unknown;
  try {
    module = await importFromRoot<unknown>(path);
  } catch {
    throw new Error(`${key}: no ${locale} catalog module at ${path}`);
  }
  const catalogs = isRecord(module) ? Object.values(module).filter(isRecord) : [];
  const title = catalogs
    .map((catalog) => catalog[key])
    .find((value): value is string => typeof value === 'string');
  if (title === undefined)
    throw new Error(`${key} is missing in the ${locale} catalog module ${path}`);
  return title;
};

/**
 * The titles of `ids` (every `PAGELESS` calculator by default) in both locales. Empty when no
 * calculator is pageless, so a check over them holds vacuously once every calculator has a page.
 */
export const pagelessTitles = async (ids: readonly string[] = PAGELESS): Promise<string[]> =>
  Promise.all(ids.flatMap((id) => LOCALES.map((locale) => calculatorTitle(id, locale))));
