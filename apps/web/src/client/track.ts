/*
 * Usage events for analytics (analytics-events): what a person did on a calculator page, never
 * the values. The loader in `public/analytics.js` creates `dataLayer` on the production host only,
 * so tests, previews and other hosts push nothing; Tag Manager forwards each event to GA4. The
 * event and its debounce are shared with the other sites (`@maestro-calc/site-kit/track`).
 */
import {
  trackerOf as kitTrackerOf,
  viaDataLayer,
  type CalcAction,
} from '@maestro-calc/site-kit/track';

export type { CalcAction };

/**
 * A function that records one action of the calculator `id` in `scope.dataLayer` (the page's
 * `window`), when it exists.
 * `calculate` is recorded once per page load: the first edit is the signal, the rest is typing.
 */
export const trackerOf = (scope: object, id: string): ((action: CalcAction) => void) =>
  kitTrackerOf(viaDataLayer(scope), id);
