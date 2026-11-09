import { describe, expect, it } from 'vitest';
import { ACCESSED, caseText, FACTOR_TABLE, LEFT_OUT, METHOD_SECTIONS } from './methodology.ts';
import { ROUTES } from './routes.ts';

describe('the methodology cases', () => {
  const cases = METHOD_SECTIONS.flatMap(({ id, cases: list }) =>
    list.map((c) => [id, c.text, c] as const),
  );

  it('has cases for every calculator', () => {
    expect(METHOD_SECTIONS.map(({ id }) => id)).toEqual([
      'dog-food',
      'cat-food',
      'dog-chocolate',
      'dog-due-date',
      'dog-age',
      'cat-age',
    ]);
    for (const { cases: list, id } of METHOD_SECTIONS) expect(list.length, id).toBeGreaterThan(2);
  });

  it.each(cases)('%s: %s', (_id, _text, c) => {
    expect(caseText(c)).toBe(c.result);
  });

  it('runs the cases of the AAHA example and the Merck check', () => {
    const results = cases.map(([, , c]) => `${c.key}=${c.result}`);
    expect(results).toContain('rer=216');
    expect(results).toContain('dose=11.5');
  });

  it('refuses a case with no text for its output', () => {
    const [first] = METHOD_SECTIONS[0]?.cases ?? [];
    if (first === undefined) throw new Error('no case');
    expect(() => caseText({ ...first, key: 'nothing' })).toThrow('no text for nothing');
  });

  it('refuses a case the engine cannot run', () => {
    const [first] = METHOD_SECTIONS[0]?.cases ?? [];
    if (first === undefined) throw new Error('no case');
    expect(() => caseText({ ...first, raw: { weight: 'x' } })).toThrow('did not run');
  });
});

describe('the methodology sections', () => {
  it('link a calculator route each, and cite every source with an address', () => {
    const paths = ROUTES.map(({ path }) => path);
    for (const { href, sources } of METHOD_SECTIONS) {
      expect(paths).toContain(href);
      expect(sources.length).toBeGreaterThan(0);
      for (const { url } of sources) expect(url).toMatch(/^https:\/\//);
    }
  });

  it('read every source on the same day, but the age sections, which say their own day', () => {
    expect(ACCESSED).toBe('2026-11-07');
    const days = METHOD_SECTIONS.map(({ id, accessed }) => [id, accessed ?? ACCESSED]);
    expect(Object.fromEntries(days)).toEqual({
      'dog-food': '2026-11-07',
      'cat-food': '2026-11-07',
      'dog-chocolate': '2026-11-07',
      'dog-due-date': '2026-11-07',
      'dog-age': '2026-11-08',
      'cat-age': '2026-11-09',
    });
  });

  it('work a cat age through the table, back from a human age, and by Cornell', () => {
    const cat = METHOD_SECTIONS.find(({ id }) => id === 'cat-age');
    expect(cat?.cases.map(({ key, result }) => `${key}=${result}`)).toEqual([
      'answer=36',
      'answer=13.2',
      'answer=8.5',
      'cornell=53',
    ]);
    expect(cat?.note).toContain('disagree');
  });

  it('tell the chocolate reader to call, and keep the factor table to Merck and AAHA', () => {
    const chocolate = METHOD_SECTIONS.find(({ id }) => id === 'dog-chocolate');
    expect(chocolate?.note).toContain('call a veterinarian');
    expect(FACTOR_TABLE).toHaveLength(7);
    expect(FACTOR_TABLE[0]).toEqual({
      status: 'Neutered adult (dog / cat)',
      merck: '1.6 / 1.2',
      aaha: '1.4 to 1.6 / 1.2 to 1.4',
    });
  });

  it('say why each thing is left out', () => {
    expect(LEFT_OUT.length).toBeGreaterThanOrEqual(7);
    for (const { what, why } of LEFT_OUT) {
      expect(what.length).toBeGreaterThan(0);
      expect(why.length).toBeGreaterThan(20);
    }
  });
});
