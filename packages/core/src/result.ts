/** Outcome of parsing untrusted input: a value, or a non-empty list of error objects. */
export type Result<T, E> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly errors: readonly [E, ...E[]] };

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });

/** A failure with exactly one error, as returned by every single-value parser. */
export const err = <E>(error: E): Result<never, E> => ({ ok: false, errors: [error] });
