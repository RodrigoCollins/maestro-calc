import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PAGES } from '../lib/pages.ts';
import { CALCULATOR_PAGES } from '../routing/templates.ts';
import { stripComments } from './__testing__/source-text.ts';
import { fromRoot } from './root.ts';

/*
 * The browser record of a page declares its `drawing` group exactly when the page module declares
 * the drawing slot (site-quality › [SQ42]). `tooling/site-browser` resolves only the i18n package
 * and cannot see `PAGES`, so no type can carry this: the record is read as text, as the styles
 * contract reads `layout.spec.ts`.
 */

/** Whether the text of a record declares a `drawing:` group (a member of the spec object). */
const declaresGroup = (record: string): boolean => /^\s+drawing:\s*\{/m.test(stripComments(record));

/** The mismatch between the slot of a page module and the group of its record, naming the id. */
const drawingProblems = (id: string, slot: boolean, record: string): string[] => {
  const group = declaresGroup(record);
  if (slot === group) return [];
  return [
    slot
      ? `${id}: the page module declares the drawing slot and its browser record has no drawing group`
      : `${id}: the browser record has a drawing group and the page module declares no drawing slot`,
  ];
};

const recordOf = (id: string): string =>
  readFileSync(fromRoot(`tooling/site-browser/e2e/${id}-pages.ts`), 'utf8');

describe.each(CALCULATOR_PAGES)(
  '%s browser record and drawing slot (site-quality › [SQ42])',
  (id) => {
    // spec: site-quality › [SQ42] the group is declared exactly when the slot is
    it('declares the drawing group exactly when the page module declares the drawing slot', () => {
      expect(drawingProblems(id, PAGES[id].module.drawing !== undefined, recordOf(id))).toEqual([]);
    });
  },
);

describe('the drawing record check finds what it forbids (seeded)', () => {
  const withGroup =
    'export const X = {\n  ready: "length",\n  drawing: {\n    labels: [],\n  },\n};';
  const without = 'export const X = {\n  ready: "length",\n  // drawing: { is a comment\n};';

  it.each([
    ['a slot with no group', true, without, 'the page module declares the drawing slot'],
    ['a group with no slot', false, withGroup, 'the page module declares no drawing slot'],
  ])('names the id for %s', (_what, slot, record, problem) => {
    const [found = ''] = drawingProblems('seeded-id', slot, record);
    expect(found).toContain('seeded-id');
    expect(found).toContain(problem);
  });

  it('accepts a slot with its group and neither', () => {
    expect(drawingProblems('seeded-id', true, withGroup)).toEqual([]);
    expect(drawingProblems('seeded-id', false, without)).toEqual([]);
  });
});
