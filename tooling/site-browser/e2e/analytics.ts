/**
 * The analytics loader every page carries (analytics-gtm): a same-origin file that loads Google Tag
 * Manager on the production host only, so the local server sees the loader and nothing else.
 */
export const ANALYTICS_PATH = '/analytics.js';

/** The host on which the loader runs, as its tag's `data-host` names it. */
const PRODUCTION_HOST = 'maestrocalc.com';

/** The hosts Tag Manager and GA4 reach, the ones the CSP allows. */
const GOOGLE_HOSTS = [
  /^www\.googletagmanager\.com$/,
  /\.google-analytics\.com$/,
  /(^|\.)google\.com$/,
];

/** The request for the loader itself. */
export const isAnalyticsLoader = (url: string): boolean => new URL(url).pathname === ANALYTICS_PATH;

/** A request to Google that the loader causes: expected only when the pages come from production. */
export const isAnalyticsTraffic = (url: string, origin: string): boolean =>
  new URL(origin).hostname === PRODUCTION_HOST &&
  GOOGLE_HOSTS.some((host) => host.test(new URL(url).hostname));
