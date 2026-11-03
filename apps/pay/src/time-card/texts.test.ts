import { describe, expect, it } from 'vitest';
import { TIME_CARD_TEXTS } from './texts.ts';

describe('time card texts', () => {
  it('names the seven days in order in both languages', () => {
    expect(TIME_CARD_TEXTS.en.days.map(({ key }) => key)).toEqual([
      'mon',
      'tue',
      'wed',
      'thu',
      'fri',
      'sat',
      'sun',
    ]);
    expect(TIME_CARD_TEXTS.es.days.map(({ long }) => long)).toEqual([
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
      'Domingo',
    ]);
  });

  it('keeps titles under 70 characters and descriptions under 160', () => {
    for (const texts of Object.values(TIME_CARD_TEXTS)) {
      expect(texts.title.length).toBeLessThanOrEqual(70);
      expect(texts.description.length).toBeLessThanOrEqual(160);
    }
  });
});
