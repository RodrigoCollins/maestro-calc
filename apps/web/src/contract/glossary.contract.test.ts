import { globSync } from 'node:fs';
import { GLOSSARY, glossaryProblems } from '@maestro-calc/i18n/glossary';
import { describe, expect, it } from 'vitest';
import { parseEntry, readEntries } from './content.ts';
import type { Entry } from './content.ts';
import { registerProblems } from './register.ts';
import { fromRoot, importFromRoot } from './root.ts';

/** One `where: variant → use` line per avoided variant in `text`. */
const linesOf = (where: string, text: string): string[] =>
  glossaryProblems(text).map(({ variant, use }) => `${where}: ${variant} → ${use}`);

const entryProblems = (entry: Entry): string[] =>
  entry.path.startsWith('es/') ? linesOf(entry.path, entry.body) : [];

const spanishEntries = [
  ...readEntries(fromRoot('apps/web/src/content/pages')),
  ...readEntries(fromRoot('apps/web/src/content/calculators')),
];

// spec: i18n-catalog › [ICW23]
describe('construction glossary over the Spanish copy (i18n-catalog › Construction glossary)', () => {
  it('finds no avoided variant in any Spanish Markdown entry', () => {
    expect(spanishEntries.flatMap(entryProblems)).toEqual([]);
  });

  it('finds no avoided variant in any Spanish catalog message', async () => {
    const files = globSync('packages/i18n/src/catalogs/es/*.ts', { cwd: fromRoot() }).sort();
    expect(files.length).toBeGreaterThan(0);
    const problems: string[] = [];
    for (const file of files) {
      const module = await importFromRoot<Record<string, Readonly<Record<string, string>>>>(file);
      for (const catalog of Object.values(module)) {
        for (const [key, message] of Object.entries(catalog)) {
          problems.push(...linesOf(`${file} ${key}`, message));
        }
      }
    }
    expect(problems).toEqual([]);
  });

  // spec: i18n-catalog › [ICW24] the public definitions keep the neutral tú register
  it('writes the Spanish definitions in the neutral tú register', () => {
    expect(
      GLOSSARY.flatMap(({ en, define }) =>
        registerProblems(define.es).map((form) => `${en}: ${form}`),
      ),
    ).toEqual([]);
  });

  it('names the entry, the variant and the term to use', () => {
    const seeded = parseEntry(
      'es/concrete.md',
      '---\nid: concrete\n---\n# Concreto\n\nElige la forma del vaciado.\n',
    );
    expect(entryProblems(seeded)).toEqual(['es/concrete.md: vaciado → colado']);
  });

  it('leaves the English copy alone', () => {
    expect(entryProblems(parseEntry('en/concrete.md', '# Concrete\n\nvaciado'))).toEqual([]);
  });
});
