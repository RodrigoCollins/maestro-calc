import { describe, expect, it } from 'vitest';
import { pathOf } from '../routing/routes.ts';
import { bylineOf, calculatorSourcesHref } from './byline.ts';
import { calendarDay } from './calendar-day.ts';

describe('byline (editorial policy, E-E-A-T)', () => {
  it.each([
    ['en', 'the Maestro Calc editorial team', 'Reviewed', 'Sources'],
    ['es', 'el equipo editorial de Maestro Calc', 'Revisado el', 'Fuentes'],
  ] as const)(
    'signs as the editorial team and links its policy in %s',
    (locale, team, reviewed, sources) => {
      const byline = bylineOf(locale, '2026-11-03', '#here');
      expect(byline.team).toBe(team);
      expect(byline.teamHref).toBe(pathOf('editorial-policy', locale));
      expect(byline.reviewed).toBe(reviewed);
      expect(byline.updated).toBe('2026-11-03');
      expect(byline.shown).toBe(calendarDay('2026-11-03', locale));
      expect(byline.sources).toEqual({ label: sources, href: '#here' });
    },
  );

  it('leaves the sources out when the page has none to point at', () => {
    expect(bylineOf('en', '2026-11-03', undefined).sources).toBeUndefined();
  });

  it.each([
    ['en', '/concrete-calculator#sources'],
    ['es', `${pathOf('concrete', 'es')}#fuentes`],
  ] as const)('points at the sources section of a calculator page in %s', (locale, href) => {
    expect(calculatorSourcesHref('concrete', locale)).toBe(
      locale === 'en' ? `${pathOf('concrete', 'en')}#sources` : href,
    );
  });
});
