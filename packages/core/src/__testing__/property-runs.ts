import * as fc from 'fast-check';

/** Cases per property: 1000 normally, 50 under Stryker to keep the mutation job affordable. */
export const numRuns = __STRYKER__ ? 50 : 1000;

/** Fixed seed under Stryker so the gate sees the same inputs for the same content hash. */
export const STRYKER_SEED = 20260101;

if (__STRYKER__) fc.configureGlobal({ seed: STRYKER_SEED, numRuns });
