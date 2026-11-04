import { describe, expect, it } from 'vitest';
import { jobsOf } from '../routing/jobs.ts';
import { LOCALES, pathOf } from '../routing/routes.ts';
import { pitchDegreesView } from './pitch-degrees.ts';

describe('roof pitch to degrees table (growth plan › lever 1: figures from the engine)', () => {
  // hand-verified: atan(rise / 12) in degrees, to two places
  it('works the angle of every pitch from 1/12 to 12/12 out', () => {
    const { rows } = pitchDegreesView('en');
    expect(rows.map(({ pitch, angle }) => [pitch, angle])).toEqual([
      ['1/12', '4.76°'],
      ['2/12', '9.46°'],
      ['3/12', '14.04°'],
      ['4/12', '18.43°'],
      ['5/12', '22.62°'],
      ['6/12', '26.57°'],
      ['7/12', '30.26°'],
      ['8/12', '33.69°'],
      ['9/12', '36.87°'],
      ['10/12', '39.81°'],
      ['11/12', '42.51°'],
      ['12/12', '45.00°'],
    ]);
  });

  it.each(LOCALES)('links every pitch that has a job page, and no other, in %s', (locale) => {
    const { rows } = pitchDegreesView(locale);
    const linked = rows.flatMap(({ href }) => (href === undefined ? [] : [href]));
    expect(linked).toEqual(jobsOf('roof-pitch').map((id) => pathOf(id, locale)));
  });

  it.each(LOCALES)('names the table and its columns in %s', (locale) => {
    const view = pitchDegreesView(locale);
    expect(view.heading).toMatch(/\S/);
    expect(view.columns).toHaveLength(2);
  });

  it('names the columns from the roof pitch catalog', () => {
    expect(pitchDegreesView('en').heading).toBe('Roof pitch to degrees');
    expect(pitchDegreesView('es').heading).toBe('Pendiente de techo en grados');
  });
});
