import {
  daysBetween,
  daysInMonth,
  parseIsoDate,
  type CivilDate,
} from '@maestro-calc/pay-core/calendar';
import { HOURS_PATHS } from '../hours/texts.ts';
import type { LongTailSection } from '../long-tail/sections.ts';
import { titleOf } from '../seo/meta.ts';
import { countdownLinks } from './countdowns.ts';
import { DAYS_BETWEEN_PATH } from './routes.ts';
import {
  betweenOf,
  countOf,
  DAYS_BETWEEN_NAME,
  monthName,
  shortDateOf,
  weeksTextOf,
  type BetweenKey,
} from './words.ts';

/*
 * The calculator of the days between two dates (Spanish only): its head, the result the build
 * works out for the default pair so the page answers with no script, and its sections, every
 * figure from the calendar engine. `DaysBetweenPage.astro` renders it; `client/days-between.ts`
 * redoes the result on every edit.
 */

/** The pair the calculator opens on, and works out without a script: the whole of 2026. */
export const DEFAULT_START = '2026-01-01';
export const DEFAULT_END = '2026-12-31';

const dateOf = (iso: string): CivilDate => {
  const date = parseIsoDate(iso);
  if (date === null) throw new Error(`not a date: ${iso}`);
  return date;
};

const LABELS: Readonly<Record<BetweenKey, string>> = {
  weeks: 'Semanas y días',
  business: 'Días hábiles, de lunes a viernes',
};

/** The worked example of counting by hand: across months, end minus start. */
const BY_HAND = { start: dateOf('2026-03-15'), end: dateOf('2026-06-10') };

const byHandSteps = (): string[] => {
  const { start, end } = BY_HAND;
  const rest = daysInMonth(start.y, start.m) - start.d;
  const middle = Array.from({ length: end.m - start.m - 1 }, (_, i) => start.m + 1 + i);
  const parts = [rest, ...middle.map((m) => daysInMonth(start.y, m)), end.d];
  const total = daysBetween(start, end, false).days;
  if (parts.reduce((sum, each) => sum + each, 0) !== total)
    throw new Error('the count by hand must match the engine');
  return [
    `Cuenta los días que quedan del mes de inicio después de la primera fecha: del ${shortDateOf(start)} al fin de ${monthName(start.m)} quedan ${String(rest)} días.`,
    `Suma los días de cada mes completo de en medio: ${middle.map((m) => `${monthName(m)} tiene ${String(daysInMonth(start.y, m))}`).join(' y ')}.`,
    `Suma el número del día de la fecha final: ${String(end.d)}.`,
    `Del ${shortDateOf(start)} al ${shortDateOf(end)} de ${String(start.y)}: ${parts.map(String).join(' + ')} = ${String(total)} días. Si cuentas también el día de inicio, suma 1.`,
  ];
};

/** Common spans, worked out by the engine: label, start, end. */
const SPANS: readonly (readonly [string, string, string])[] = [
  ['', '2026-01-01', '2026-12-31'],
  [' (bisiesto)', '2028-01-01', '2028-12-31'],
  [', el primer trimestre', '2026-01-01', '2026-03-31'],
  [', el primer semestre', '2026-01-01', '2026-06-30'],
  [', febrero', '2027-02-01', '2027-02-28'],
  [', febrero de un año bisiesto', '2028-02-01', '2028-02-29'],
  [', el segundo semestre', '2026-07-01', '2026-12-31'],
];

const spanRows = (): string[][] =>
  SPANS.map(([suffix, from, to]) => {
    const start = dateOf(from);
    const end = dateOf(to);
    const plain = daysBetween(start, end, false);
    const both = daysBetween(start, end, true);
    return [
      `Del ${shortDateOf(start)} al ${shortDateOf(end)} de ${String(end.y)}${suffix}`,
      String(plain.days),
      String(both.days),
      weeksTextOf(plain.days),
      String(plain.businessDays),
    ];
  });

const sectionsOf = (): LongTailSection[] => {
  const january = { start: dateOf('2026-01-01'), end: dateOf('2026-01-31') };
  const plain = daysBetween(january.start, january.end, false).days;
  const both = daysBetween(january.start, january.end, true).days;
  const year = daysBetween(dateOf(DEFAULT_START), dateOf(DEFAULT_END), false);
  return [
    {
      id: 'how-to-count',
      heading: 'Cómo contar los días entre dos fechas',
      paragraphs: [
        'La calculadora resta las dos fechas en días naturales: cuenta todos los días del calendario, también los sábados, los domingos y los feriados. A mano se hace mes por mes.',
      ],
      steps: byHandSteps(),
    },
    {
      id: 'inclusive',
      heading: 'Con o sin el día de inicio',
      paragraphs: [
        `Sin marcar la casilla, la cuenta es la resta de las fechas: del 1 al 31 de enero de 2026 hay ${countOf(plain, 'día', 'días')}, porque el día de inicio no se cuenta. Es lo que se usa para saber cuánto falta o cuánto ha pasado: de hoy a mañana hay 1 día.`,
        `Marca «Contar también el día de inicio» cuando los dos extremos cuentan, como en un permiso, una incapacidad o un contrato del 1 al 31 de enero: son ${countOf(both, 'día', 'días')}. Los plazos legales se cuentan según la ley de cada país, que puede excluir el primer día o los días inhábiles; revisa la regla del trámite.`,
      ],
    },
    {
      id: 'business',
      heading: 'Días hábiles de lunes a viernes',
      paragraphs: [
        `Los días hábiles de la calculadora son los lunes a viernes entre las dos fechas: en 2026, del 1 de enero al 31 de diciembre, hay ${countOf(year.businessDays, 'día', 'días')} de lunes a viernes. Los feriados no se descuentan, porque cambian según el país, la región y el año: resta tú los de tu calendario.`,
        'Si trabajas de lunes a sábado, cuenta también los sábados: son los días naturales menos los domingos.',
      ],
    },
    {
      id: 'spans',
      heading: 'Días de periodos comunes',
      paragraphs: [
        'Cada fila la calcula el mismo motor de la calculadora; un año bisiesto tiene un día más, el 29 de febrero.',
      ],
      table: {
        caption: 'Días entre fechas de periodos comunes',
        head: ['Periodo', 'Días', 'Con el día de inicio', 'Semanas y días', 'Días hábiles'],
        rows: spanRows(),
      },
    },
    {
      id: 'countdowns',
      heading: 'Cuántos días faltan para las fechas del año',
      paragraphs: [
        'Cada cuenta regresiva cuenta desde la fecha de tu dispositivo y trae la fecha de cada año, si es día de descanso en México y si es festivo en España.',
      ],
      links: countdownLinks(),
    },
    {
      id: 'related',
      heading: 'Horas en lugar de días',
      paragraphs: [
        'Para contar las horas y los minutos entre dos horas del mismo día, o de un turno que cruza la medianoche, usa la calculadora de horas.',
      ],
      links: [{ href: HOURS_PATHS.es, label: 'Calculadora de horas y minutos' }],
    },
  ];
};

/** The calculator page: its head, its no-script result for the default pair, its sections. */
export const daysBetweenPageOf = () => {
  const result = betweenOf(daysBetween(dateOf(DEFAULT_START), dateOf(DEFAULT_END), false));
  return {
    title: titleOf(DAYS_BETWEEN_NAME),
    description:
      'Calcula cuántos días hay entre dos fechas: días naturales, semanas y días hábiles de lunes a viernes, con o sin el día de inicio. Gratis y sin registro.',
    kicker: 'Calculadora de fechas · gratis',
    h1: DAYS_BETWEEN_NAME,
    lead: 'Elige dos fechas y ve cuántos días hay entre ellas, cuántas semanas son y cuántos días hábiles caen de lunes a viernes. Marca la casilla si el día de inicio también cuenta.',
    start: 'Fecha de inicio',
    end: 'Fecha final',
    inclusive: 'Contar también el día de inicio',
    invalid: 'Elige las dos fechas.',
    reversed: 'La fecha final es anterior a la de inicio: se cuentan los días entre las dos igual.',
    note: 'Los días hábiles cuentan de lunes a viernes; los feriados no se descuentan.',
    figureLabel: 'Días entre las dos fechas',
    breakdown: 'Los días, en semanas y en días hábiles',
    paths: { es: DAYS_BETWEEN_PATH },
    result: {
      figure: result.figure,
      rows: (Object.keys(LABELS) as BetweenKey[]).map((key) => ({
        key,
        label: LABELS[key],
        value: result.values[key],
      })),
    },
    sections: sectionsOf(),
  };
};
