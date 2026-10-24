import type { HTMLElement } from 'node-html-parser';

/** An attribute of an element, or an empty string when it has none. */
export const attr = (element: HTMLElement, name: string): string =>
  element.getAttribute(name) ?? '';

/** One attribute of every element matching `selector`, in document order. */
export const attrsOf = (root: HTMLElement, selector: string, name: string): string[] =>
  root.querySelectorAll(selector).map((element) => attr(element, name));

/** The `hreflang href` pairs a head lists as alternates, sorted. */
export const alternatesIn = (root: HTMLElement): string[] =>
  root
    .querySelectorAll('link[rel=alternate][hreflang]')
    .map((link) => `${attr(link, 'hreflang')} ${attr(link, 'href')}`)
    .sort();
