import { err, ok } from '../../result.ts';
import { findOption } from '../constraints.ts';
import type { InputKind, SelectDescriptor } from '../descriptors.ts';
import { builderOf } from './shared.ts';

/**
 * An exact, case-sensitive option id, in a form and in the URL; anything else, a non-string
 * included, is `UNKNOWN_OPTION`.
 */
const SELECT: InputKind<SelectDescriptor> = {
  read: (input, raw) => {
    const option = findOption(input, raw);
    return option === undefined ? err({ code: 'UNKNOWN_OPTION' }) : ok(option);
  },
  urlText: findOption,
  fromUrl: findOption,
};

/** A choice among a non-empty list of unique option ids. */
export const selectInput = /* @__PURE__ */ builderOf<SelectDescriptor>('select', SELECT);
