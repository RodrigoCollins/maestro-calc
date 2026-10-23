import { err } from '../result.ts';

/** The failure `scan` and `parseLength` return: one error, carrying an `offset` only when given. */
export const failure = (code: string, offset?: number): unknown =>
  err(offset === undefined ? { code } : { code, offset });
