/**
 * Thrown for programming errors and invariant violations. The message is the flat `UPPER_CASE`
 * code; prose never lives in core.
 */
export class CoreError extends Error {
  // `declare` emits no field, so an absent reason stays absent (exactOptionalPropertyTypes).
  declare readonly reason?: string;
  readonly code: string;

  constructor(code: string, reason?: string, options?: ErrorOptions) {
    super(code, options);
    this.name = 'CoreError';
    this.code = code;
    if (reason !== undefined) this.reason = reason;
  }
}
