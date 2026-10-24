import { HTMLElement, NodeType } from 'node-html-parser';
import type { Node } from 'node-html-parser';

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

const HIDDEN_BODIES = new Set(['SCRIPT', 'STYLE']);

const textOf = (node: Node): string => {
  if (node.nodeType === NodeType.COMMENT_NODE) return ` ${node.rawText} `;
  if (!(node instanceof HTMLElement)) return node.text;
  return HIDDEN_BODIES.has(node.tagName) ? '' : ` ${node.childNodes.map(textOf).join('')} `;
};

/** What a reader sees of a page, plus its comments, with a space at every element boundary; script and style bodies and attributes are left out. */
export const visibleText = (root: HTMLElement): string => textOf(root);

const escapeRegExp = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Whether `word` (one or more words) occurs in `text` between non-letters and non-digits, ignoring case. */
export const hasWord = (text: string, word: string): boolean =>
  new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegExp(word)}(?![\\p{L}\\p{N}])`, 'iu').test(text);

const CSS_URL = /url\(\s*["']?([^"')]*)["']?\s*\)/g;

/** Every `url(...)` target in a piece of CSS, in order. */
export const urlsIn = (css: string): string[] =>
  Array.from(css.matchAll(CSS_URL), ([, url = '']) => url);
