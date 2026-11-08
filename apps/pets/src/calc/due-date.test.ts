import { dogDueDate } from '@maestro-calc/pets-core/dog-due-date';
import { describe, expect, it } from 'vitest';
import { DUE_DATE_PAGE, dueDateView } from './due-date.ts';
import { patchOf } from './view.ts';

const patch = (raw: Readonly<Record<string, string>>) => {
  const result = patchOf(dogDueDate, dueDateView, { ...DUE_DATE_PAGE.initial, ...raw });
  if (result === undefined) throw new Error('did not run');
  return result;
};

describe('the due date page', () => {
  it('is at the address the routes pin, and starts from the engine defaults', () => {
    expect(DUE_DATE_PAGE.path).toBe('/dog-pregnancy-calculator');
    expect(dogDueDate.validate(DUE_DATE_PAGE.initial).ok).toBe(true);
    expect(dogDueDate.validate({}).ok).toBe(true);
  });

  it('labels every input and every option of its choices', () => {
    for (const input of dogDueDate.inputs) {
      const copy = DUE_DATE_PAGE.fields[input.key];
      expect(copy, input.key).toBeDefined();
    }
    expect(Object.keys(DUE_DATE_PAGE.fields['method']?.options ?? {})).toEqual([
      'breeding',
      'lh',
      'diestrus',
    ]);
    expect(Object.keys(DUE_DATE_PAGE.fields['month']?.options ?? {})).toHaveLength(12);
  });

  it('keeps title and description where a result shows them whole', () => {
    expect(DUE_DATE_PAGE.title.length).toBeLessThanOrEqual(65);
    expect(DUE_DATE_PAGE.description.length).toBeGreaterThanOrEqual(50);
    expect(DUE_DATE_PAGE.description.length).toBeLessThanOrEqual(160);
  });
});

describe('the due date result', () => {
  it('writes the default as the window 28 Apr to 12 May 2026, 58 to 72 days from 1 Mar', () => {
    const { text, show, html } = patch({});
    expect(text).toEqual({
      earliest: 'Apr 28, 2026',
      latest: 'May 12, 2026',
      from: 'Mar 1, 2026',
      window: '58 to 72 days',
    });
    expect(show).toEqual({ dayMovedBack: false });
    expect(html['strip']?.match(/day window/g)).toHaveLength(15);
  });

  it('writes the LH window of 64 to 66 days', () => {
    const { text } = patch({ method: 'lh' });
    expect([text['earliest'], text['latest'], text['window']]).toEqual([
      'May 4, 2026',
      'May 6, 2026',
      '64 to 66 days',
    ]);
  });

  it('says so when the day is past the end of the month', () => {
    const { show, text } = patch({ month: '2', day: '31' });
    expect(show).toEqual({ dayMovedBack: true });
    expect(text['from']).toBe('Feb 28, 2026');
  });
});
