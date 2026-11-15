import {
  addBusinessDays,
  daysBetween,
  daysInMonth,
  parseIsoDate,
  shiftDate,
  type CivilDate,
} from '@maestro-calc/pay-core/calendar';
import { HOURS_PATHS } from '../hours/texts.ts';
import type { LongTailSection } from '../long-tail/sections.ts';
import { AGUINALDO_PATH, VACACIONES_PATH } from '../mexico/routes.ts';
import { AGUINALDO_NAME, VACACIONES_NAME } from '../mexico/words.ts';
import { titleOf } from '../seo/meta.ts';
import { countdownLinks } from './countdowns.ts';
import { DAYS_BETWEEN_PATH } from './routes.ts';
import {
  betweenOf,
  countOf,
  DAYS_BETWEEN_NAME,
  longDateOf,
  monthName,
  SHIFT_MAX,
  shiftTextOf,
  shortDateOf,
  weeksTextOf,
  type BetweenKey,
  type ShiftKey,
} from './words.ts';

/*
 * The date calculator (Spanish only): the days between two dates, and a date plus or minus some
 * days. Its head, the results the build works out for the default values so the page answers
 * with no script, and its sections, every figure from the calendar engine. The build never writes
 * today's date: the «Hoy» buttons, shown by the script, put the visitor's own date in a field.
 * `DaysBetweenPage.astro` renders it; `client/days-between.ts` redoes both results on every edit.
 */

/** The pair the calculator opens on, and works out without a script: the whole of 2026. */
export const DEFAULT_START = '2026-01-01';
export const DEFAULT_END = '2026-12-31';

/** What the add-or-subtract form opens on, and works out without a script: 90 days after. */
export const DEFAULT_SHIFT = { from: '2026-01-01', amount: '90' } as const;

const dateOf = (iso: string): CivilDate => {
  const date = parseIsoDate(iso);
  if (date === null) throw new Error(`not a date: ${iso}`);
  return date;
};

const LABELS: Readonly<Record<BetweenKey, string>> = {
  weeks: 'Semanas y días',
  business: 'Días hábiles, de lunes a viernes',
};

const SHIFT_LABELS: Readonly<Record<ShiftKey, string>> = {
  calendar: 'Días naturales de una fecha a la otra',
  weeks: 'En semanas y días',
  business: 'Días hábiles entre las dos, de lunes a viernes',
};

/** The date `amount` days from `from` (negative: before), as the page writes it. */
const shiftedText = (from: string, amount: number, business: boolean): string => {
  const shifted = shiftDate(dateOf(from), amount, business);
  if (shifted === null) throw new Error(`out of the calendar: ${from} ${String(amount)}`);
  return longDateOf(shifted.date);
};

/** The days of the table of dates after 1 January 2026. */
const OFFSETS = [7, 10, 15, 30, 45, 60, 90, 120, 180, 365] as const;

/** The worked example of weekdays by hand: from Friday 13 November 2026. */
const WEEKDAYS_FROM = '2026-11-13';

const weekdayStepsOf = (): string[] => {
  const start = dateOf(WEEKDAYS_FROM);
  const at = (n: number): CivilDate => addBusinessDays(start, n);
  return [
    `Parte del ${longDateOf(start)}. Ese día no se cuenta: el día hábil 1 es el ${longDateOf(at(1))}.`,
    `Cuenta de lunes a viernes: el día hábil 5 es el ${longDateOf(at(5))}.`,
    `Salta el sábado y el domingo: el día hábil 6 es el ${longDateOf(at(6))}, y el día hábil 10, el ${longDateOf(at(10))}.`,
    'Si la fecha de partida cae en sábado o domingo, el día hábil 1 es el lunes siguiente. Al restar, se cuenta hacia atrás igual: el día hábil anterior a un lunes es el viernes.',
  ];
};

const offsetRows = (): string[][] =>
  OFFSETS.map((days) => [
    countOf(days, 'día', 'días'),
    shiftedText(DEFAULT_SHIFT.from, days, false),
    shiftedText(DEFAULT_SHIFT.from, days, true),
  ]);

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
  const sinceExample = daysBetween(dateOf('2026-01-01'), dateOf('2026-11-15'), false).days;
  const leapYear = daysBetween(dateOf('2028-01-01'), dateOf('2028-12-31'), true).days;
  const in90 = shiftedText(DEFAULT_SHIFT.from, 90, false);
  const in90Weekdays = shiftedText(DEFAULT_SHIFT.from, 90, true);
  const ago30 = shiftedText('2026-11-15', -30, false);
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
      id: 'today',
      heading: 'Desde hoy o hasta hoy',
      paragraphs: [
        `Para saber cuántos días han pasado desde una fecha, ponla como fecha de inicio y usa «Hoy» en la fecha final. Por ejemplo, si hoy fuera el 15 de noviembre de 2026, desde el 1 de enero de 2026 habrían pasado ${countOf(sinceExample, 'día', 'días')}.`,
        'Para saber cuántos días faltan para una fecha, usa «Hoy» en la fecha de inicio y pon la fecha que esperas como fecha final. La cuenta no incluye el día de hoy: de hoy a mañana falta 1 día.',
        'La fecha de hoy la toma tu dispositivo en el momento en que usas la calculadora, con su reloj y su zona horaria; la página no guarda ninguna fecha de hoy. Sin JavaScript, el botón «Hoy» no aparece: escribe la fecha a mano.',
      ],
    },
    {
      id: 'add-subtract',
      heading: 'Cómo sumar o restar días a una fecha',
      paragraphs: [
        'Para saber qué fecha será dentro de unos días, o qué fecha fue hace unos días, usa «Sumar o restar días a una fecha»: elige la fecha de partida (o «Hoy»), escribe los días y elige sumar o restar. El día de partida no se cuenta: 1 día después del 1 de enero es el 2 de enero.',
        'En días naturales cuentan todos los días del calendario. Marca «Solo días hábiles» para contar de lunes a viernes, como un plazo de entrega o de pago; los feriados no se saltan, porque cambian según el país y el año. A mano, los días hábiles se cuentan así:',
      ],
      steps: weekdayStepsOf(),
      table: {
        caption: 'La fecha al sumar días al 1 de enero de 2026',
        head: ['Días sumados', 'En días naturales', 'En días hábiles, de lunes a viernes'],
        rows: offsetRows(),
      },
      after: [
        'Al cruzar un fin de mes, la cuenta sigue con los días que tiene cada mes, y el 29 de febrero solo existe en los años bisiestos, como 2028: por eso sumar 365 días no siempre llega a la misma fecha del año siguiente.',
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
      id: 'mexico',
      heading: 'Los días trabajados del aguinaldo y las vacaciones',
      paragraphs: [
        'En México, el aguinaldo proporcional se calcula con los días trabajados del año, del día de ingreso al 31 de diciembre con los dos extremos incluidos: marca «Contar también el día de inicio». Las vacaciones dependen de los años de servicio cumplidos a la fecha del cálculo.',
      ],
      links: [
        { href: AGUINALDO_PATH, label: AGUINALDO_NAME },
        { href: VACACIONES_PATH, label: VACACIONES_NAME },
      ],
    },
    {
      id: 'related',
      heading: 'Horas en lugar de días',
      paragraphs: [
        'Para contar las horas y los minutos entre dos horas del mismo día, o de un turno que cruza la medianoche, usa la calculadora de horas. Todas las calculadoras de Cuenta Horas en español están en la página de inicio.',
      ],
      links: [
        { href: HOURS_PATHS.es, label: 'Calculadora de horas y minutos' },
        { href: '/es', label: 'Todas las calculadoras de Cuenta Horas' },
      ],
    },
    {
      id: 'faq',
      heading: 'Preguntas frecuentes',
      paragraphs: [],
      questions: [
        {
          question: '¿Cuántos días han pasado desde una fecha?',
          answer: `Pon esa fecha como fecha de inicio y usa «Hoy» en la fecha final: la calculadora resta las dos fechas, sin contar el día de inicio. Del 1 de enero al 15 de noviembre de 2026 pasan ${countOf(sinceExample, 'día', 'días')}.`,
        },
        {
          question: '¿Cuántos días faltan para una fecha?',
          answer:
            'Usa «Hoy» en la fecha de inicio y pon la fecha que esperas como fecha final. Para Navidad, Año Nuevo, el Día de Muertos y otras fechas del año hay cuentas regresivas listas, que se ponen al día solas.',
        },
        {
          question: '¿Qué fecha será dentro de 90 días?',
          answer: `Depende del día de partida: en «Sumar o restar días a una fecha» usa «Hoy», escribe 90 y elige sumar. Desde el 1 de enero de 2026, 90 días después es el ${in90}; contando solo días hábiles, el ${in90Weekdays}.`,
        },
        {
          question: '¿Qué fecha fue hace 30 días?',
          answer: `En «Sumar o restar días a una fecha» usa «Hoy», escribe 30 y elige restar. Si hoy fuera el domingo 15 de noviembre de 2026, hace 30 días habría sido el ${ago30}.`,
        },
        {
          question: '¿Se cuenta el día de hoy?',
          answer:
            'No, salvo que lo pidas: la cuenta es la resta de las fechas, y de hoy a mañana hay 1 día. Marca «Contar también el día de inicio» si los dos extremos cuentan, como en un permiso del 1 al 5 de un mes, que son 5 días.',
        },
        {
          question: '¿Cuántos días tiene un año?',
          answer: `Un año tiene 365 días y uno bisiesto, como 2028, ${String(leapYear)}. Del 1 de enero al 31 de diciembre de 2026 la calculadora cuenta ${countOf(year.days, 'día', 'días')}, porque no cuenta el día de inicio; con la casilla marcada, ${countOf(year.days + 1, 'día', 'días')}.`,
        },
      ],
    },
  ];
};

/** The calculator page: its head, its no-script result for the default pair, its sections. */
export const daysBetweenPageOf = () => {
  const result = betweenOf(daysBetween(dateOf(DEFAULT_START), dateOf(DEFAULT_END), false));
  const shifted = shiftTextOf({ ...DEFAULT_SHIFT, back: false, business: false });
  if (shifted === null) throw new Error('the default shift must work out');
  return {
    title: titleOf(DAYS_BETWEEN_NAME),
    description:
      'Calculadora de fechas gratis: cuenta los días entre dos fechas, desde o hasta hoy, en semanas y días hábiles, y suma o resta días a una fecha.',
    kicker: 'Calculadora de fechas · gratis',
    h1: DAYS_BETWEEN_NAME,
    lead: 'Elige dos fechas y ve al instante cuántos días hay entre ellas, en semanas y en días hábiles de lunes a viernes. Para saber cuántos días han pasado desde una fecha, ponla como fecha de inicio y usa «Hoy» en la fecha final; para saber cuántos faltan, usa «Hoy» en la de inicio. Más abajo, suma o resta días a una fecha.',
    today: {
      label: 'Hoy',
      start: 'Hoy en la fecha de inicio',
      end: 'Hoy en la fecha final',
      from: 'Hoy en la fecha de partida',
    },
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
    shift: {
      heading: 'Sumar o restar días a una fecha',
      from: 'Fecha de partida',
      amount: 'Número de días',
      max: SHIFT_MAX,
      direction: 'Operación',
      add: 'Sumar días (una fecha después)',
      subtract: 'Restar días (una fecha antes)',
      business: 'Solo días hábiles, de lunes a viernes',
      invalid: `Elige la fecha de partida y escribe un número entero de días, de 0 a ${SHIFT_MAX.toLocaleString('es-MX')}.`,
      figureLabel: 'La fecha que resulta',
      breakdown: 'De una fecha a la otra',
      note: 'El día de partida no se cuenta: 1 día después del 1 de enero es el 2 de enero. Los feriados no se saltan.',
      result: {
        figure: shifted.figure,
        rows: (Object.keys(SHIFT_LABELS) as ShiftKey[]).map((key) => ({
          key,
          label: SHIFT_LABELS[key],
          value: shifted.values[key],
        })),
      },
    },
    sections: sectionsOf(),
  };
};
