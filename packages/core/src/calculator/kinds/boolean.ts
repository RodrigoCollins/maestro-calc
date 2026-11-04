import { err, ok } from '../../result.ts';
import type { BooleanDescriptor, InputKind } from '../descriptors.ts';
import { builderOf } from './shared.ts';

/** A boolean, never coerced; the URL holds `1` or `0`. */
const BOOLEAN: InputKind<BooleanDescriptor> = {
  read: (_input, raw) => (typeof raw === 'boolean' ? ok(raw) : err({ code: 'MALFORMED' })),
  urlText: (_input, value) => (typeof value === 'boolean' ? (value ? '1' : '0') : undefined),
  fromUrl: (_input, text) => (text === '1' ? true : text === '0' ? false : undefined),
};

/** A yes-or-no input. */
export const booleanInput = /* @__PURE__ */ builderOf<BooleanDescriptor>('boolean', BOOLEAN);
