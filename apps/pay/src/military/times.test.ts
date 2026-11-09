import { describe, expect, it } from 'vitest';
import { DESCRIPTION, TITLE_MAX } from '../seo/meta.ts';
import {
  MILITARY_CHART_PATHS,
  MILITARY_CONVERTER_PATHS,
  MILITARY_TIMES,
  type MilitaryTimeJob,
} from './routes.ts';
import { militaryTimePageOf } from './times.ts';

const jobAt = (slug: string): MilitaryTimeJob => {
  const job = MILITARY_TIMES.find((each) => each.slug === slug);
  if (job === undefined) throw new Error(`no military time ${slug}`);
  return job;
};
const page = (slug: string) => militaryTimePageOf(jobAt(slug));
const section = (slug: string, id: string) => {
  const found = page(slug).sections.find((each) => each.id === id);
  if (found === undefined) throw new Error(`no section ${id} on ${slug}`);
  return found;
};
const rowOf = (slug: string, id: string, label: string) =>
  section(slug, id).table?.rows.find(([first]) => first === label);

/** The six-word shingles of a text, as the content audit counts shared text. */
const shingles = (text: string): Set<string> => {
  const words = text.toLowerCase().match(/[\p{L}\p{N}'’.,/×-]+/gu) ?? [];
  return new Set(words.slice(0, -5).map((_, index) => words.slice(index, index + 6).join(' ')));
};

/** Everything a page shows in its main content, in reading order. */
const prose = (job: MilitaryTimeJob): string => {
  const view = militaryTimePageOf(job);
  return [
    view.kicker,
    view.h1,
    view.lead,
    view.figureLabel,
    view.figure,
    ...view.rows.flatMap(({ label, value }) => [label, value]),
    view.calculator.label,
    view.note,
    ...view.sections.flatMap((each) => [
      each.heading,
      ...each.paragraphs,
      ...(each.steps ?? []),
      ...(each.table === undefined
        ? []
        : [each.table.caption, ...each.table.head, ...each.table.rows.flat()]),
      ...(each.after ?? []),
      ...(each.links ?? []).map(({ label }) => label),
    ]),
    ...view.sources.map(({ label }) => label),
    view.others.heading,
    ...view.others.links.map(({ label }) => label),
  ].join(' ');
};

describe('the military time pages', () => {
  it('answer first: 1500 in military time is 3:00 PM, said fifteen hundred hours', () => {
    const fifteen = page('1500');
    expect(fifteen.title).toBe('1500 in military time is 3:00 PM | Cuenta Horas');
    expect(fifteen.h1).toBe('1500 in military time is 3:00 PM');
    expect(fifteen.lead).toMatch(/^1500 is 3:00 PM\. .*15 − 12 = 3/);
    expect(fifteen.lead).toContain('fifteen hundred hours');
    expect(fifteen.figure).toBe('3:00 PM');
    expect(fifteen.paths).toEqual({ en: '/military-time/1500' });
    expect(page('0000').h1).toBe('0000 in military time is 12:00 AM');
    expect(page('0000').lead).toContain('2400');
    expect(page('1200').h1).toBe('1200 in military time is 12:00 PM');
    expect(page('0930').lead).toMatch(/^0930 is 9:30 AM\./);
  });

  it('gives every page a title and a description a result shows whole, each its own', () => {
    const titles = new Set<string>();
    const descriptions = new Set<string>();
    for (const job of MILITARY_TIMES) {
      const { title, description } = militaryTimePageOf(job);
      expect(title.length, job.slug).toBeLessThanOrEqual(TITLE_MAX);
      expect(description.length, job.slug).toBeGreaterThanOrEqual(DESCRIPTION.min);
      expect(description.length, job.slug).toBeLessThanOrEqual(DESCRIPTION.max);
      expect(title, job.slug).toContain(job.slug);
      expect(description, job.slug).toContain(job.slug);
      titles.add(title);
      descriptions.add(description);
    }
    expect(titles.size).toBe(48);
    expect(descriptions.size).toBe(48);
  });

  it('works the conversion by hand for the hour it is', () => {
    expect(section('1500', 'worked').steps?.join(' ')).toContain('15 − 12 = 3');
    expect(section('0930', 'worked').steps?.join(' ')).toContain('drop the leading 0');
    expect(section('0030', 'worked').steps?.join(' ')).toContain('hour 00');
    expect(section('1230', 'worked').steps?.join(' ')).toContain('12 stays 12');
    expect(section('1500', 'worked').steps?.join(' ')).toContain('3 + 12 = 15');
  });

  it('writes the time in every other format, from the engine', () => {
    expect(rowOf('1530', 'formats', '24-hour clock')).toEqual(['24-hour clock', '15:30']);
    expect(rowOf('1530', 'formats', 'ISO 8601, extended')).toEqual([
      'ISO 8601, extended',
      '15:30:00',
    ]);
    expect(rowOf('1530', 'formats', 'Decimal hours after midnight')).toEqual([
      'Decimal hours after midnight',
      '15.50',
    ]);
    expect(rowOf('1530', 'formats', 'Minutes after midnight')).toEqual([
      'Minutes after midnight',
      '930',
    ]);
    expect(rowOf('1530', 'formats', 'Share of the day gone')).toEqual([
      'Share of the day gone',
      '64.58%',
    ]);
  });

  it('says how it is said, and when in the day it falls', () => {
    expect(section('1330', 'said').paragraphs.join(' ')).toContain('thirteen thirty');
    expect(section('0800', 'said').paragraphs.join(' ')).toContain('oh eight hundred');
    expect(section('1500', 'said').paragraphs.join(' ')).toContain('in the afternoon');
    expect(section('2130', 'said').paragraphs.join(' ')).toContain('half past nine at night');
  });

  it('counts the hours to and from midnight and noon', () => {
    expect(rowOf('1500', 'midnight-noon', 'Since midnight, 0000')).toEqual([
      'Since midnight, 0000',
      '15 h 0 min',
      '15.00',
    ]);
    expect(rowOf('1500', 'midnight-noon', 'Until midnight, 2400')).toEqual([
      'Until midnight, 2400',
      '9 h 0 min',
      '9.00',
    ]);
    expect(rowOf('1500', 'midnight-noon', 'Since noon, 1200')?.[1]).toBe('3 h 0 min');
    expect(rowOf('0930', 'midnight-noon', 'Until noon, 1200')?.[1]).toBe('2 h 30 min');
  });

  it('gives the time in every US zone from Eastern, in winter and in summer', () => {
    expect(rowOf('1500', 'zones', 'Central Time (CT)')).toEqual([
      'Central Time (CT)',
      '1400 · 2:00 PM',
      '1400 · 2:00 PM',
    ]);
    expect(rowOf('1500', 'zones', 'Hawaii Time (HT)')).toEqual([
      'Hawaii Time (HT)',
      '1000 · 10:00 AM',
      '0900 · 9:00 AM',
    ]);
    expect(rowOf('0100', 'zones', 'Mountain Time (MT)')?.[1]).toBe('2300 · 11:00 PM, day before');
    const zones = section('1500', 'zones');
    expect(zones.paragraphs.join(' ')).toContain('Eastern Time (ET)');
    expect(zones.after?.join(' ')).toContain('2000Z');
    expect(zones.after?.join(' ')).toContain('1900Z');
  });

  it('pays a shift that starts or ends then, through the hours engine', () => {
    const shifts = section('1500', 'shifts');
    const text = shifts.paragraphs.join(' ');
    expect(text).toContain('starts at 1500 ends at 2330 (11:30 PM)');
    expect(text).toContain('8 h 0 min');
    expect(text).toContain('$160.00');
    expect(text).toContain('started at 0630 (6:30 AM)');
    expect(section('2000', 'shifts').paragraphs.join(' ')).toContain('0430 (4:30 AM) the next day');
    const links = (shifts.links ?? []).map(({ href }) => href);
    expect(links).toContain('/pay/how-many-hours-is-7am-to-3pm');
    expect(links).toContain('/pay/how-many-hours-is-3pm-to-11pm');
    expect(links).toContain('/pay/how-long-until-3-00-pm');
  });

  it('links its six nearest times, the chart and the converter', () => {
    const fifteen = page('1500');
    expect(fifteen.others.links.map(({ href }) => href)).toEqual([
      '/military-time/1330',
      '/military-time/1400',
      '/military-time/1430',
      '/military-time/1530',
      '/military-time/1600',
      '/military-time/1630',
      MILITARY_CHART_PATHS.en,
    ]);
    expect(fifteen.calculator.href).toBe(MILITARY_CONVERTER_PATHS.en);
  });

  // the content audit flags two pages whose six-word shingles overlap by half or more
  it('are no near-duplicates of one another', () => {
    const sets = MILITARY_TIMES.map((job) => shingles(prose(job)));
    let most = 0;
    for (const [i, a] of sets.entries())
      for (const [j, b] of sets.entries()) {
        if (j <= i) continue;
        const both = [...a].filter((each) => b.has(each)).length;
        const similarity = both / new Set([...a, ...b]).size;
        most = Math.max(most, similarity);
        expect(similarity, `${String(i)} and ${String(j)}`).toBeLessThan(0.35);
      }
    console.log(`military time pages: most similar pair ${most.toFixed(3)}`);
  });
});
