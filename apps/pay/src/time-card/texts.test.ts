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

  // the saved week and the copy and share button (`saved.ts`, `share/send.ts`)
  it('names the saved week, its clear button and the copy and share button in both languages', () => {
    expect(TIME_CARD_TEXTS.en.clear).toBe('Clear my week');
    expect(TIME_CARD_TEXTS.es.clear).toBe('Borrar mi semana');
    expect(TIME_CARD_TEXTS.en.copy).toBe('Copy result');
    expect(TIME_CARD_TEXTS.en.share).toBe('Share result');
    expect(TIME_CARD_TEXTS.es.copy).toBe('Copiar resultado');
    expect(TIME_CARD_TEXTS.es.share).toBe('Compartir resultado');
    for (const texts of Object.values(TIME_CARD_TEXTS)) {
      for (const key of [
        'savedNote',
        'restored',
        'cleared',
        'copied',
        'shared',
        'notCopied',
      ] as const) {
        expect(texts[key].length).toBeGreaterThan(0);
      }
    }
    // the one line under the tool: it stays on this device and is never sent
    expect(TIME_CARD_TEXTS.en.savedNote).toMatch(/this device/);
    expect(TIME_CARD_TEXTS.en.savedNote).toMatch(/never sent/);
    expect(TIME_CARD_TEXTS.es.savedNote).toMatch(/este dispositivo/);
    expect(TIME_CARD_TEXTS.es.savedNote).toMatch(/nunca se envía/);
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
