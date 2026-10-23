import type { ReleasedField } from '../url/released-harness.ts';

/**
 * The public URL contract (url-state-codec › Key stability rules, rule 8): one ordered tuple per
 * input of every released calculator. A tuple is never modified or removed and a released
 * calculator never disappears; appending fields and calculators is allowed. It is test support
 * that two suites read: `url/released.contract.test.ts` compares it with the calculators of core,
 * and the web registry test (`apps/web/src/lib/released.contract.test.ts`) proves that every
 * calculator the site lists has its tuples here, so a calculator cannot ship without its snapshot.
 */
export const RELEASED: readonly ReleasedField[] = [
  {
    calculatorId: 'rectangle-area',
    key: 'length',
    urlKey: 'l',
    kind: 'length',
    default: '120',
  },
  {
    calculatorId: 'rectangle-area',
    key: 'width',
    urlKey: 'w',
    kind: 'length',
    default: '120',
  },
];
