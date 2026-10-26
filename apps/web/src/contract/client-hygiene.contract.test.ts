import { readFileSync } from 'node:fs';
import { globSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { fromRoot } from './root.ts';

const CLIENT = fromRoot('apps/web/src/client');

/** What client code must not use: HTML strings, dynamic code, storage and network (design C11, C13). */
const BANNED = [
  'innerHTML',
  'outerHTML',
  'insertAdjacentHTML',
  'document.write',
  'eval(',
  'new Function',
  'localStorage',
  'sessionStorage',
  'fetch(',
  'XMLHttpRequest',
  'sendBeacon',
  'caches.',
  'cookieStore',
  'EventSource',
  'WebSocket',
  'navigator.storage',
];

const files = globSync('**/*.ts', { cwd: CLIENT }).sort();

const found = (text: string): string[] => BANNED.filter((word) => text.includes(word));

describe('client sources (calculator-page › Client script contract; design C11, C13)', () => {
  it('holds the entry and the mount', () => {
    expect(files).toEqual(['concrete-mount.ts', 'entries/concrete.ts']);
  });

  // spec: calculator-page › the DOM is written with textContent, value, attributes and hidden only
  it('uses no HTML string, dynamic code, storage or network API', () => {
    for (const file of files) {
      expect(found(readFileSync(`${CLIENT}/${file}`, 'utf8')), file).toEqual([]);
    }
  });

  it('flags each banned name in a seeded source', () => {
    for (const word of BANNED) expect(found(`const x = ${word};`), word).toEqual([word]);
  });
});
