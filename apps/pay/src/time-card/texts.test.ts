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

  // the searches the page answers: "time card calculator with overtime", "time clock calculator"
  it('names the overtime it computes from punched times in its heading and its snippet', () => {
    expect(TIME_CARD_TEXTS.en.h1).toBe('Time card calculator with overtime');
    expect(TIME_CARD_TEXTS.en.description).toMatch(/^Time clock calculator with overtime:/);
    expect(TIME_CARD_TEXTS.en.lead).toContain('overtime');
    expect(TIME_CARD_TEXTS.es.h1).toBe('Calculadora de horas trabajadas y horas extra');
    expect(TIME_CARD_TEXTS.es.description).toContain('horas extra');
  });
});
