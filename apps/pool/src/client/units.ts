import type { Units } from '@maestro-calc/pool-core/units';

/*
 * The units choice of the calculator pages, shared by the dose pages and the volume page: the
 * visitor picks US or metric (never the location), and the choice is kept in this browser so the
 * next calculator opens on it. A blocked storage only forgets it.
 */

const UNITS_KEY = 'pool-figures-units';

/** The visitor's last choice, or `us` when there is none or the storage is blocked. */
export const storedUnits = (): Units => {
  try {
    return localStorage.getItem(UNITS_KEY) === 'metric' ? 'metric' : 'us';
  } catch {
    return 'us';
  }
};

export const storeUnits = (units: string): void => {
  try {
    localStorage.setItem(UNITS_KEY, units);
  } catch {
    // a blocked storage only forgets the choice
  }
};

/** Writes every `[data-metric]` text in the units chosen: its own text is the US one. */
export const showUnits = (units: Units): void => {
  for (const node of document.querySelectorAll<HTMLElement>('[data-metric]')) {
    node.dataset['us'] ??= node.textContent;
    node.textContent = (units === 'metric' ? node.dataset['metric'] : node.dataset['us']) ?? '';
  }
};

/** The units a select names: only `metric` is metric. */
export const unitsOf = (value: string | undefined): Units => (value === 'metric' ? 'metric' : 'us');
