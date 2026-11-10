/*
 * The week the time card keeps in the visitor's browser, so it is there when they come back. It is
 * the card's own URL query (`encode` of `@maestro-calc/core`), kept in `localStorage` on this
 * device only: never sent anywhere. Every call is wrapped, because storage can be missing, blocked
 * or full; the page then works as it does with nothing saved.
 */

/** The part of `localStorage` the card uses. */
export interface Store {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** The one key the card writes. */
export const SAVED_KEY = 'cuentahoras.time-card.week';

/** The example week's query: the clean URL, never kept. */
const EXAMPLE = 'v=1';

/** The longest query the card reads back; a week of times is far shorter. */
const MAX = 2048;

const isStore = (value: unknown): value is Store =>
  typeof value === 'object' &&
  value !== null &&
  'getItem' in value &&
  'setItem' in value &&
  'removeItem' in value;

/** The window's `localStorage` when it can write and remove a key, or `null`. */
export const storeOf = (scope: object): Store | null => {
  try {
    const store: unknown = (scope as { localStorage?: unknown }).localStorage;
    if (!isStore(store)) return null;
    store.setItem(SAVED_KEY + '?', '1');
    store.removeItem(SAVED_KEY + '?');
    return store;
  } catch {
    return null;
  }
};

/** The saved week's query, or `null`: nothing saved, no storage, or not a query the card wrote. */
export const readWeek = (store: Store | null): string | null => {
  try {
    const value = store?.getItem(SAVED_KEY) ?? null;
    return value !== null && value.length <= MAX && /^v=\d+(&[^#<>]*)?$/.test(value) ? value : null;
  } catch {
    return null;
  }
};

/** Keeps the week's query (the example week removes it); `false` when it could not. */
export const writeWeek = (store: Store | null, query: string): boolean => {
  if (store === null) return false;
  try {
    if (query === EXAMPLE) store.removeItem(SAVED_KEY);
    else store.setItem(SAVED_KEY, query);
    return true;
  } catch {
    return false;
  }
};

/** Removes the saved week; `false` when it could not. */
export const clearWeek = (store: Store | null): boolean => writeWeek(store, EXAMPLE);

/**
 * The query the card opens on: a shared link's own (it never loads the saved week over it), else
 * the saved week (`restored`), else none, the example week.
 */
export const startOf = (
  search: string,
  saved: string | null,
): { readonly query: string; readonly restored: boolean } =>
  search !== ''
    ? { query: search.slice(1), restored: false }
    : saved !== null
      ? { query: saved, restored: true }
      : { query: '', restored: false };
