/*
 * Usage events for analytics (analytics-events): what a person did on a calculator page, never
 * the values. Shipped in the calculator bundles of every site, so it is small and DOM-free: the
 * `scope` is the page's `window`. Each site's `public/analytics.js` creates its queue on the
 * production host only, so tests, previews and other hosts send nothing, and its Consent Mode
 * defaults (ad signals denied; analytics denied in the EEA, the UK and Switzerland) apply.
 */

/** What a person did: changed an input, copied the link, opened the share link, printed. */
export type CalcAction = 'calculate' | 'copy' | 'share' | 'print';

/** The one event name, with its two parameters. */
export const CALC_EVENT = 'calc_action';

export interface CalcEvent {
  readonly calc_action: CalcAction;
  readonly calc_id: string;
}

/** Hands one event to the site's analytics queue. */
export type Send = (event: CalcEvent) => void;

/**
 * A function that records one action of the calculator `id` through `send`.
 * `calculate` is recorded once per page load: the first edit is the signal, the rest is typing.
 */
export const trackerOf = (send: Send, id: string): ((action: CalcAction) => void) => {
  let calculated = false;
  return (action) => {
    if (action === 'calculate') {
      if (calculated) return;
      calculated = true;
    }
    send({ calc_action: action, calc_id: id });
  };
};

/** Tag Manager (Maestro Calc): a plain object on `scope.dataLayer`, when it exists. */
export const viaDataLayer =
  (scope: object): Send =>
  (event) => {
    const layer = 'dataLayer' in scope ? scope.dataLayer : undefined;
    if (Array.isArray(layer)) layer.push({ event: CALC_EVENT, ...event });
  };

type Gtag = (command: 'event', name: typeof CALC_EVENT, params: CalcEvent) => void;
const isGtag = (value: unknown): value is Gtag => typeof value === 'function';

/** gtag.js (Cuenta Horas, Pool Figures): `scope.gtag('event', …)`, when the loader defined it. */
export const viaGtag =
  (scope: object): Send =>
  (event) => {
    const gtag = 'gtag' in scope ? scope.gtag : undefined;
    if (isGtag(gtag)) gtag('event', CALC_EVENT, event);
  };

/** What `watchUsage` listens on: a form and the page's `document`. */
export interface Listenable {
  addEventListener(type: string, listener: (event: { readonly target: unknown }) => void): void;
}

/** Whether a click landed inside an element that `selector` names (a duck-typed `Element`). */
interface Closest {
  closest(selector: string): unknown;
}
const isClosest = (value: unknown): value is Closest =>
  typeof value === 'object' &&
  value !== null &&
  'closest' in value &&
  typeof value.closest === 'function';
const within = (target: unknown, selector: string): boolean =>
  isClosest(target) && target.closest(selector) !== null;

/** The actions a click can record. */
const CLICKS = ['copy', 'share', 'print'] as const;

/**
 * Records the usage of the calculator `id` through `scope.gtag`: `calculate` on the first edit of
 * `form`, and each action of `clicks` when a click on `page` lands inside the element its
 * selector names (`{ share: 'a[data-share]' }`).
 */
export const watchUsage = (
  scope: object,
  id: string,
  form: Listenable,
  page: Listenable,
  clicks: Readonly<Partial<Record<(typeof CLICKS)[number], string>>> = {},
): void => {
  const track = trackerOf(viaGtag(scope), id);
  form.addEventListener('input', () => {
    track('calculate');
  });
  const watched = CLICKS.flatMap((action) => {
    const selector = clicks[action];
    return selector === undefined ? [] : [[action, selector] as const];
  });
  if (watched.length === 0) return;
  page.addEventListener('click', ({ target }) => {
    for (const [action, selector] of watched) if (within(target, selector)) track(action);
  });
};
