import { CoreError } from '../errors.ts';

/** The `CoreError` code thrown by `action`, or undefined when nothing is thrown. */
export const thrownCode = (action: () => unknown): string | undefined => {
  try {
    action();
  } catch (error) {
    if (error instanceof CoreError) return error.code;
    throw error;
  }
  return undefined;
};
