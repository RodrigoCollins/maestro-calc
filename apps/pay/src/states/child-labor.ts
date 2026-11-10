import type { Lang } from '../time-card/receipt.ts';

/*
 * The U.S. Department of Labor "Table of Selected State Child Labor Standards for Children Under 18
 * in Non-farm Employment" (revised July 15, 2025, https://www.dol.gov/agencies/whd/state/child-labor,
 * read November 10, 2026; `SOURCES.childLaborTable`), one row per state and DC: the maximum daily
 * and weekly hours and days a week, and the night work it bars, for minors under 16 and for 16-
 * and 17-year-olds. A cell keeps the table's words in English: the lines of a cell are joined by a
 * semicolon (the word after it in lower case), the table's footnote c is written out ("combined
 * hours of work and school"), and its typing slips are mended ("9 p/m/" in Indiana's row,
 * "day/-week:" in California's, the stray spaces of "9 - 23-6", "6- 40" and "12a.m.-5a.m."). A cell
 * the table leaves empty (or, for Nevada's night work, fills with a dash) is left out. The Spanish
 * is the same text translated.
 */

type Cell = Readonly<Record<Lang, string>>;

export interface Limits {
  /** Maximum hours a day, hours a week and days a week, in the table's notation. */
  readonly hours?: Cell;
  /** The hours of the night the table bars, or the hours it allows. */
  readonly night?: Cell;
}

export interface ChildLabor {
  /** The state's name in English, as the state tables give it. */
  readonly state: string;
  readonly under16: Limits;
  readonly teens: Limits;
}

/** The cells many states share, word for word. */
const STANDARD: Cell = {
  en: '8-40 non-school day/week; 3-18 school day/week',
  es: '8-40 en días y semanas sin clases; 3-18 en días y semanas de clases',
};
const STANDARD_6: Cell = {
  en: '8-40-6 non-school day/week; 3-18-6 school day/week',
  es: '8-40-6 en días y semanas sin clases; 3-18-6 en días y semanas de clases',
};
const SUMMER_NIGHT: Cell = {
  en: '7 p.m. (9 p.m. June 1 through Labor Day) to 7 a.m.',
  es: '7 p.m. (9 p.m. del 1 de junio al Día del Trabajo) a 7 a.m.',
};
const VACATION_NIGHT: Cell = {
  en: '7 p.m. (9 p.m. during summer vacation) to 7 a.m.',
  es: '7 p.m. (9 p.m. en las vacaciones de verano) a 7 a.m.',
};
const COMBINED_12: Cell = {
  en: '12 (combined hours of work and school)',
  es: '12 (horas de trabajo y de escuela sumadas)',
};

const cell = (en: string, es: string): Cell => ({ en, es });
const row = (state: string, under16: Limits, teens: Limits = {}): ChildLabor => ({
  state,
  under16,
  teens,
});

/** In the order of the table (DC, which the table puts last, among the states by its name). */
export const CHILD_LABOR: readonly ChildLabor[] = [
  row(
    'Alabama',
    {
      hours: STANDARD_6,
      night: VACATION_NIGHT,
    },
    {
      night: cell(
        '10 p.m. before school day to 5 a.m., if enrolled in school (to age 19); for 16/17 year-olds, exemptions may be granted when the individual circumstances are found to be in the best interests of the minor.',
        '10 p.m. antes de un día de clases a 5 a.m., si está inscrito en la escuela (hasta los 19 años); a quien tiene 16 o 17 años se le pueden dar excepciones cuando sus circunstancias particulares convienen al menor.',
      ),
    },
  ),
  row(
    'Alaska',
    {
      hours: cell(
        '9-23-6 (combined hours of work and school)',
        '9-23-6 (horas de trabajo y de escuela sumadas)',
      ),
      night: cell('9 p.m. to 5 a.m.', '9 p.m. a 5 a.m.'),
    },
    { hours: cell('6-day week', 'semana de 6 días') },
  ),
  row('Arizona', {
    hours: STANDARD,
    night: cell(
      '9:30 p.m. (11 p.m. before non-school day) to 6 a.m.; 7 p.m. to 6 a.m. in door-to-door sales or deliveries',
      '9:30 p.m. (11 p.m. antes de un día sin clases) a 6 a.m.; 7 p.m. a 6 a.m. en ventas o entregas puerta a puerta',
    ),
  }),
  row(
    'Arkansas',
    {
      hours: cell('8-48-6', '8-48-6'),
      night: cell(
        '7 p.m. (9 p.m. before non-school day) to 6 a.m.',
        '7 p.m. (9 p.m. antes de un día sin clases) a 6 a.m.',
      ),
    },
    {
      hours: cell(
        '16-year-old children cannot work more than 10 hours consecutive or more than 10 hours in a 24 hours period.',
        'Quien tiene 16 años no puede trabajar más de 10 horas seguidas ni más de 10 horas en un periodo de 24 horas.',
      ),
      night: cell(
        '11 p.m. to 6 a.m. before school day (for 16 year-olds only; no requirements for 17 year-olds)',
        '11 p.m. a 6 a.m. antes de un día de clases (solo para quien tiene 16 años; nada para quien tiene 17)',
      ),
    },
  ),
  row(
    'California',
    { hours: STANDARD, night: SUMMER_NIGHT },
    {
      hours: cell(
        '8-48 non-school day/week; 3-18 school day/week',
        '8-48 en días y semanas sin clases; 3-18 en días y semanas de clases',
      ),
      night: cell(
        '10 p.m. (12:30 a.m. before non-school day) to 5 a.m.',
        '10 p.m. (12:30 a.m. antes de un día sin clases) a 5 a.m.',
      ),
    },
  ),
  row(
    'Colorado',
    {
      hours: cell(
        '8-40 non-school day/week; 6-40 school day/week',
        '8-40 en días y semanas sin clases; 6-40 en días y semanas de clases',
      ),
      night: cell(
        '9:30 p.m. to 5 a.m. before school day',
        '9:30 p.m. a 5 a.m. antes de un día de clases',
      ),
    },
    { hours: cell('8-40', '8-40') },
  ),
  row(
    'Connecticut',
    {
      hours: cell(
        '8-40 during periods of school vacation of 5 days or more',
        '8-40 en periodos de vacaciones escolares de 5 días o más',
      ),
      night: cell(
        '7 p.m. (9 p.m. July 1 to the first Monday in September) to 7 a.m.',
        '7 p.m. (9 p.m. del 1 de julio al primer lunes de septiembre) a 7 a.m.',
      ),
    },
    {
      hours: cell(
        'Enrolled in and not graduated from a secondary institution. 8-48-6, non-school days/weeks; 6-32 school day/week, in restaurant, recreational, amusement, theater, manufacturing, mechanical, retail, hairdressing, bowling alley, pool hall, or photography gallery establishments. Not enrolled in and not graduated from a secondary institution. 8-48-6 in retail/mercantile establishments; 9-48-6 in restaurant, manufacturing, mechanical, recreation, amusement and theater establishments',
        'Inscrito en una escuela secundaria y sin graduarse. 8-48-6 en días y semanas sin clases; 6-32 en días y semanas de clases, en restaurantes, recreación, diversiones, teatros, manufactura, talleres mecánicos, comercio minorista, peluquerías, boleras, salones de billar o estudios de fotografía. Sin inscribirse y sin graduarse. 8-48-6 en comercios minoristas; 9-48-6 en restaurantes, manufactura, talleres mecánicos, recreación, diversiones y teatros',
      ),
      night: cell(
        '11 p.m. (midnight if school vacation, not prior to a school day, or not attending school) to 6 a.m. in restaurants, recreational, amusement and theater establishments; 10 p.m. (11 p.m. if school vacation, not prior to a school day, or not attending school; midnight in a supermarket of 3,500 square feet or more when no school the next day) to 6 a.m. in manufacturing, mechanical and retail establishments; 10 p.m. to 6 a.m. in hairdressing, bowling alley, pool hall, or photography gallery establishments.',
        '11 p.m. (medianoche en vacaciones escolares, si no sigue un día de clases o si no va a la escuela) a 6 a.m. en restaurantes, recreación, diversiones y teatros; 10 p.m. (11 p.m. en vacaciones escolares, si no sigue un día de clases o si no va a la escuela; medianoche en un supermercado de 3,500 pies cuadrados o más cuando no hay clases al día siguiente) a 6 a.m. en manufactura, talleres mecánicos y comercio minorista; 10 p.m. a 6 a.m. en peluquerías, boleras, salones de billar o estudios de fotografía.',
      ),
    },
  ),
  row(
    'Delaware',
    {
      hours: cell(
        '8-40-6 non-school day/week; 4-18-6 school day/week',
        '8-40-6 en días y semanas sin clases; 4-18-6 en días y semanas de clases',
      ),
      night: SUMMER_NIGHT,
    },
    {
      hours: COMBINED_12,
      night: cell(
        '8 consecutive hours of non-work, non-school time required in each 24-hour day.',
        'Se exigen 8 horas seguidas sin trabajo ni escuela en cada día de 24 horas.',
      ),
    },
  ),
  row(
    'District of Columbia',
    { hours: cell('8-48-6', '8-48-6'), night: SUMMER_NIGHT },
    { hours: cell('8-48-6', '8-48-6'), night: cell('10 p.m. to 6 a.m.', '10 p.m. a 6 a.m.') },
  ),
  row(
    'Florida',
    {
      hours: cell(
        '8-40-6 non-school day/week; 3-15-6 school day/week; minors under 16 may work 8-40 during non-school day or week.',
        '8-40-6 en días y semanas sin clases; 3-15-6 en días y semanas de clases; quien tiene menos de 16 años puede trabajar 8-40 en un día o una semana sin clases.',
      ),
      night: cell(
        '7 p.m. before school day to 7 a.m. on school day (9 p.m. during holidays and summer vacations to 7 a.m.)',
        '7 p.m. antes de un día de clases a 7 a.m. del día de clases (9 p.m. a 7 a.m. en feriados y vacaciones de verano)',
      ),
    },
    {
      hours: cell('8-30-6 school day/week', '8-30-6 en días y semanas de clases'),
      night: cell(
        '11 p.m. to 6:30 a.m., before school day.',
        '11 p.m. a 6:30 a.m., antes de un día de clases.',
      ),
    },
  ),
  row('Georgia', {
    hours: cell(
      '8-40 non-school day/week; 4-40 school day/week',
      '8-40 en días y semanas sin clases; 4-40 en días y semanas de clases',
    ),
    night: cell('9 p.m. to 6 a.m.', '9 p.m. a 6 a.m.'),
  }),
  row('Hawaii', {
    hours: STANDARD_6,
    night: cell(
      '7 p.m. to 7 a.m. (9 p.m. to 6 a.m. during authorized school breaks).',
      '7 p.m. a 7 a.m. (9 p.m. a 6 a.m. en los recesos escolares autorizados).',
    ),
  }),
  row('Idaho', { hours: cell('9-54', '9-54'), night: cell('9 p.m. to 6 a.m.', '9 p.m. a 6 a.m.') }),
  row('Illinois', { hours: STANDARD, night: SUMMER_NIGHT }),
  row('Indiana', { hours: STANDARD, night: SUMMER_NIGHT }),
  row('Iowa', {
    hours: cell(
      '8-40 non-school day/week; 6-28 school day/week',
      '8-40 en días y semanas sin clases; 6-28 en días y semanas de clases',
    ),
    night: cell(
      '9 p.m. (11 p.m. June 1 through Labor Day) to 7 a.m.',
      '9 p.m. (11 p.m. del 1 de junio al Día del Trabajo) a 7 a.m.',
    ),
  }),
  row('Kansas', {
    hours: cell('8-40', '8-40'),
    night: cell(
      '10 p.m. before school day to 7 a.m.',
      '10 p.m. antes de un día de clases a 7 a.m.',
    ),
  }),
  row(
    'Kentucky',
    { hours: STANDARD, night: SUMMER_NIGHT },
    {
      hours: cell(
        '6-30 school day/week (6-40 school day/week with parental permission and at least a 2.0 school grade point average)',
        '6-30 en días y semanas de clases (6-40 con permiso de los padres y un promedio escolar de al menos 2.0)',
      ),
      night: cell(
        '11 p.m. (1 a.m. Friday and Saturday) to 6 a.m. when school in session.',
        '11 p.m. (1 a.m. viernes y sábado) a 6 a.m. durante el periodo escolar.',
      ),
    },
  ),
  row(
    'Louisiana',
    {
      hours: STANDARD_6,
      night: cell(
        '7 p.m. (9 p.m. June 1 through Labor Day) to 7 a.m.; non-graduate (7 p.m.-7 a.m. on any school day, 9 p.m.-7 a.m. on any non-school day)',
        '7 p.m. (9 p.m. del 1 de junio al Día del Trabajo) a 7 a.m.; sin graduarse (7 p.m. a 7 a.m. en cualquier día de clases, 9 p.m. a 7 a.m. en cualquier día sin clases)',
      ),
    },
    {
      night: cell(
        'Non-graduate 16 year old (11 p.m. - 5 a.m. prior to start of school day); non-graduate 17 year old (12 a.m.-5 a.m.) prior to start of any school day.',
        'Quien tiene 16 años y no se ha graduado (11 p.m. a 5 a.m. antes del inicio de un día de clases); quien tiene 17 años y no se ha graduado (12 a.m. a 5 a.m.) antes del inicio de cualquier día de clases.',
      ),
    },
  ),
  row(
    'Maine',
    { hours: STANDARD_6, night: VACATION_NIGHT },
    {
      hours: cell(
        'If enrolled in school: 10-50-6 non-school day/week; 6 (except 8 on last scheduled day of school week)-24-6 school day/week',
        'Si está inscrito en la escuela: 10-50-6 en días y semanas sin clases; 6 (salvo 8 el último día de clases programado de la semana)-24-6 en días y semanas de clases',
      ),
      night: cell(
        'If enrolled in school: 10:15 p.m. (12 a.m. before non-school day) to 7 a.m. on day the minor’s school is in session, and to 5 a.m. otherwise.',
        'Si está inscrito en la escuela: 10:15 p.m. (12 a.m. antes de un día sin clases) a 7 a.m. el día en que hay clases, y a 5 a.m. los demás días.',
      ),
    },
  ),
  row(
    'Maryland',
    {
      hours: cell(
        '8-40 non-school day/week; 4-23 school day/week',
        '8-40 en días y semanas sin clases; 4-23 en días y semanas de clases',
      ),
      night: cell(
        '8 p.m. (9 p.m. Memorial Day through Labor Day) to 7 a.m.',
        '8 p.m. (9 p.m. del Día de los Caídos al Día del Trabajo) a 7 a.m.',
      ),
    },
    {
      hours: COMBINED_12,
      night: cell(
        '8 consecutive hours of non-work, non-school day time required in each 24-hour day.',
        'Se exigen 8 horas seguidas sin trabajo ni escuela en cada día de 24 horas.',
      ),
    },
  ),
  row(
    'Massachusetts',
    {
      hours: cell('8-48-6', '8-48-6'),
      night: cell(
        'Only between 6:30 a.m. and 7 p.m. during the school year; only between 6:30 a.m. and 9 p.m. during the summer (from July 1 through Labor Day).',
        'Solo entre las 6:30 a.m. y las 7 p.m. durante el año escolar; solo entre las 6:30 a.m. y las 9 p.m. en verano (del 1 de julio al Día del Trabajo).',
      ),
    },
    {
      hours: cell('9-48-6', '9-48-6'),
      night: cell(
        'Only between 6 a.m. and 10 p.m. (on nights preceding a regularly scheduled school day) - if the establishment stops serving clients or customers at 10:00 p.m., the minor may be employed until 10:15 p.m.; only between 6 a.m. and 11:30 p.m. (on nights not preceding a regularly scheduled school day); exception for restaurants and racetracks: only between 6 a.m. and 12:00 midnight (on nights not preceding a regularly scheduled school day).',
        'Solo entre las 6 a.m. y las 10 p.m. (las noches antes de un día de clases regular); si el local deja de atender a sus clientes a las 10:00 p.m., el menor puede trabajar hasta las 10:15 p.m.; solo entre las 6 a.m. y las 11:30 p.m. (las noches que no preceden a un día de clases regular); excepción para restaurantes e hipódromos: solo entre las 6 a.m. y la medianoche (las noches que no preceden a un día de clases regular).',
      ),
    },
  ),
  row(
    'Michigan',
    {
      hours: cell(
        '40 non-school day/week; 3-18 school day/week',
        '40 en días y semanas sin clases; 3-18 en días y semanas de clases',
      ),
      night: cell(
        '7 p.m. (9 p.m. June 1 to Labor Day) to 7 a.m.',
        '7 p.m. (9 p.m. del 1 de junio al Día del Trabajo) a 7 a.m.',
      ),
    },
    {
      hours: cell(
        '10-48 non-school day/week; 10/24 school day/week',
        '10-48 en días y semanas sin clases; 10/24 en días y semanas de clases',
      ),
      night: cell(
        '10:30 p.m. (11:30 p.m. on Fridays, Saturdays and during school vacations) to 6:30 a.m., if attending school. 11:30 p.m. to 6 a.m., if not attending school.',
        '10:30 p.m. (11:30 p.m. los viernes, los sábados y en vacaciones escolares) a 6:30 a.m., si va a la escuela. 11:30 p.m. a 6 a.m., si no va a la escuela.',
      ),
    },
  ),
  row(
    'Minnesota',
    { hours: cell('8-40', '8-40'), night: cell('9 p.m. to 7 a.m.', '9 p.m. a 7 a.m.') },
    {
      night: cell(
        '11 p.m. to 5 a.m. before school day (11:30 p.m. to 4:30 a.m. with written parental permission).',
        '11 p.m. a 5 a.m. antes de un día de clases (11:30 p.m. a 4:30 a.m. con permiso escrito de los padres).',
      ),
    },
  ),
  row('Mississippi', {
    hours: cell(
      '8-44 in factory, mill, cannery, workshop, or manufacturing establishment.',
      '8-44 en fábricas, molinos, enlatadoras, talleres o plantas de manufactura.',
    ),
    night: cell(
      '7 p.m. to 6 a.m. in factory, mill, cannery, workshop, or manufacturing establishment.',
      '7 p.m. a 6 a.m. en fábricas, molinos, enlatadoras, talleres o plantas de manufactura.',
    ),
  }),
  row('Missouri', {
    hours: cell(
      '8-40-6 non-school day/week; 3-40-6 school day/week',
      '8-40-6 en días y semanas sin clases; 3-40-6 en días y semanas de clases',
    ),
    night: cell(
      '7 p.m. (9 p.m. June 1 through Labor Day) (10:30 p.m. at regional Fairs or expositions where entity is not covered by FLSA) to 7 a.m.',
      '7 p.m. (9 p.m. del 1 de junio al Día del Trabajo) (10:30 p.m. en ferias o exposiciones regionales donde la entidad no está cubierta por la FLSA) a 7 a.m.',
    ),
  }),
  row('Montana', {
    hours: STANDARD,
    night: cell(
      '7 p.m. (9 p.m. during periods outside the school year (June 1 through Labor Day, depending on local standards)) to 7 a.m.',
      '7 p.m. (9 p.m. fuera del año escolar (del 1 de junio al Día del Trabajo, según las normas locales)) a 7 a.m.',
    ),
  }),
  row('Nebraska', {
    hours: cell('8-48', '8-48'),
    night: cell(
      '8 p.m. to 6 a.m., under 14. 10 p.m. (beyond 10 p.m. before non-school day with special permit) to 6 a.m., 14 and 15.',
      '8 p.m. a 6 a.m., para menores de 14. 10 p.m. (después de las 10 p.m. antes de un día sin clases con permiso especial) a 6 a.m., para quienes tienen 14 y 15.',
    ),
  }),
  row('Nevada', { hours: cell('8-48', '8-48') }),
  row(
    'New Hampshire',
    {
      hours: cell(
        '8-48 non-school days/week; 3-23 school days/week',
        '8-48 en días y semanas sin clases; 3-23 en días y semanas de clases',
      ),
      night: cell('9 p.m. to 7 a.m.', '9 p.m. a 7 a.m.'),
    },
    {
      hours: cell(
        'A 48-hour work week, with work up to 6-days per week, is permitted during vacation, if enrolled in school. A 30-hour work week, with work up to 6-days per week, is permitted if enrolled in school.',
        'Si está inscrito en la escuela, se permite una semana de 48 horas, de hasta 6 días, en vacaciones, y una semana de 30 horas, de hasta 6 días, durante las clases.',
      ),
    },
  ),
  row(
    'New Jersey',
    {
      hours: STANDARD_6,
      night: cell(
        '7 p.m. (9 p.m. from last day of school through Labor Day in non-school weeks with written permission) to 7 a.m.',
        '7 p.m. (9 p.m. del último día de clases al Día del Trabajo, en semanas sin clases y con permiso escrito) a 7 a.m.',
      ),
    },
    {
      hours: cell(
        '8-40-6 - Workers 16 and up may work up to 50 hours in one week and up to 10 hours a day only between the last day of school and Labor Day.',
        '8-40-6; desde los 16 años se puede trabajar hasta 50 horas en una semana y hasta 10 horas al día solo entre el último día de clases y el Día del Trabajo.',
      ),
      night: cell(
        '11 p.m. to 6 a.m. during school term, with specified variations',
        '11 p.m. a 6 a.m. durante el periodo escolar, con variaciones especificadas',
      ),
    },
  ),
  row('New Mexico', {
    hours: STANDARD,
    night: cell(
      '7 p.m. (9 p.m. outside of the calendar school year) to 7 a.m.',
      '7 p.m. (9 p.m. fuera del año escolar) a 7 a.m.',
    ),
  }),
  row(
    'New York',
    {
      hours: STANDARD_6,
      night: cell(
        '7 p.m. (9 p.m. June 21 through Labor Day) to 7 a.m.',
        '7 p.m. (9 p.m. del 21 de junio al Día del Trabajo) a 7 a.m.',
      ),
    },
    {
      hours: cell(
        '8-48-6 school day/week: 4 before school day, 8 Friday, Saturday, Sunday or holiday-28, if enrolled in school.',
        '8-48-6; en días y semanas de clases, si está inscrito en la escuela: 4 antes de un día de clases, 8 el viernes, el sábado, el domingo o un feriado, y 28 a la semana.',
      ),
      night: cell(
        '10 p.m. (midnight before school days with written permission from both parent and school and before non-school day with written parental consent) to 6 a.m., while school is in session. Midnight to 6 a.m. while school is not in session.',
        '10 p.m. (medianoche antes de días de clases con permiso escrito de los padres y de la escuela, y antes de un día sin clases con consentimiento escrito de los padres) a 6 a.m., durante el periodo escolar. Medianoche a 6 a.m. fuera del periodo escolar.',
      ),
    },
  ),
  row(
    'North Carolina',
    { hours: STANDARD, night: VACATION_NIGHT },
    {
      night: cell(
        '11 p.m. to 5 a.m. before school day while school is in session; not applicable with written permission from both parent and school.',
        '11 p.m. a 5 a.m. antes de un día de clases durante el periodo escolar; no se aplica con permiso escrito de los padres y de la escuela.',
      ),
    },
  ),
  row('North Dakota', { hours: STANDARD, night: SUMMER_NIGHT }),
  row(
    'Ohio',
    {
      hours: STANDARD,
      night: cell(
        '7 p.m. (9 p.m. June 1 to Sept. 1 and during school holidays of 5 school days or more) to 7 a.m., 7 p.m. to 7 a.m. in door-to-door sales.',
        '7 p.m. (9 p.m. del 1 de junio al 1 de septiembre y en recesos escolares de 5 días de clases o más) a 7 a.m.; 7 p.m. a 7 a.m. en ventas puerta a puerta.',
      ),
    },
    {
      night: cell(
        '11 p.m. before school day to 7 a.m. on school day (6 a.m. if not employed after 8 p.m. previous night) if required to attend school. 8 p.m. to 7 a.m. in door-to-door sales.',
        '11 p.m. antes de un día de clases a 7 a.m. del día de clases (6 a.m. si no trabajó después de las 8 p.m. la noche anterior), si debe ir a la escuela. 8 p.m. a 7 a.m. en ventas puerta a puerta.',
      ),
    },
  ),
  row('Oklahoma', {
    hours: cell(
      '8-40 non-school day/week; 3-18 school day/week (if employer is not covered by FLSA, may work 8 hours on a school day which precedes a non-school day and 40 hours in a week when school is in session if attendance is not compulsory)',
      '8-40 en días y semanas sin clases; 3-18 en días y semanas de clases (si el empleador no está cubierto por la FLSA, se pueden trabajar 8 horas en un día de clases que precede a un día sin clases y 40 horas en una semana de clases si la asistencia no es obligatoria)',
    ),
    night: cell(
      '7 p.m. (9 p.m. June 1 through Labor Day) to 7 a.m. (if employer is not covered by FLSA, may work 7 a.m. to 9 p.m. on a day followed by a non-school day)',
      '7 p.m. (9 p.m. del 1 de junio al Día del Trabajo) a 7 a.m. (si el empleador no está cubierto por la FLSA, se puede trabajar de 7 a.m. a 9 p.m. un día seguido de un día sin clases)',
    ),
  }),
  row(
    'Oregon',
    { hours: STANDARD_6, night: SUMMER_NIGHT },
    { hours: cell('44-hour week', 'semana de 44 horas') },
  ),
  row(
    'Pennsylvania',
    {
      hours: cell(
        '8-40-6 non-school day/week; 3-18 school day/week',
        '8-40-6 en días y semanas sin clases; 3-18 en días y semanas de clases',
      ),
      night: cell(
        '7 p.m. (9 p.m. during vacation from June to Labor Day) to 7 a.m.',
        '7 p.m. (9 p.m. en vacaciones, de junio al Día del Trabajo) a 7 a.m.',
      ),
    },
    {
      hours: cell(
        '10-48-6 non-school day/week; 8-28-6 school day/week',
        '10-48-6 en días y semanas sin clases; 8-28-6 en días y semanas de clases',
      ),
      night: cell(
        '12 a.m. (1 a.m. before non-school day) to 6 a.m., if enrolled in regular day school.',
        '12 a.m. (1 a.m. antes de un día sin clases) a 6 a.m., si está inscrito en una escuela diurna regular.',
      ),
    },
  ),
  row(
    'Rhode Island',
    {
      hours: cell('8-40', '8-40'),
      night: cell(
        '7 p.m. (9 p.m. during school vacation) to 6 a.m.',
        '7 p.m. (9 p.m. en vacaciones escolares) a 6 a.m.',
      ),
    },
    {
      hours: cell('9-48', '9-48'),
      night: cell(
        '11:30 p.m. (1:30 a.m. before non-school day) to 6 a.m., if regularly attending school.',
        '11:30 p.m. (1:30 a.m. antes de un día sin clases) a 6 a.m., si va a la escuela con regularidad.',
      ),
    },
  ),
  row('South Carolina', {
    hours: STANDARD,
    night: cell(
      '7 p.m. (9 p.m. during summer break of the school district in which the minor resides) to 7 a.m.',
      '7 p.m. (9 p.m. en las vacaciones de verano del distrito escolar donde vive el menor) a 7 a.m.',
    ),
  }),
  row('South Dakota', {
    hours: cell(
      '8-40 non-school day/week; 4-20 school day/week',
      '8-40 en días y semanas sin clases; 4-20 en días y semanas de clases',
    ),
    night: cell(
      'After 10 p.m. before school day',
      'Después de las 10 p.m. antes de un día de clases',
    ),
  }),
  row(
    'Tennessee',
    {
      hours: STANDARD,
      night: cell(
        '7 p.m. to 7 a.m. (9 p.m. to 6 a.m. before non-school days)',
        '7 p.m. a 7 a.m. (9 p.m. a 6 a.m. antes de días sin clases)',
      ),
    },
    {
      night: cell(
        '10 p.m. to 6 a.m. (Sunday - Thursday before school days) (midnight with parental permission up to 3 nights a week)',
        '10 p.m. a 6 a.m. (de domingo a jueves antes de días de clases) (medianoche con permiso de los padres hasta 3 noches a la semana)',
      ),
    },
  ),
  row('Texas', {
    hours: cell('8-48', '8-48'),
    night: cell(
      '10 p.m. (midnight before non-school day or in summer if not enrolled in summer school) to 5 a.m.',
      '10 p.m. (medianoche antes de un día sin clases, o en verano si no está inscrito en la escuela de verano) a 5 a.m.',
    ),
  }),
  row('Utah', { hours: STANDARD, night: SUMMER_NIGHT }),
  row('Vermont', { hours: STANDARD_6, night: SUMMER_NIGHT }),
  row('Virginia', { hours: STANDARD, night: SUMMER_NIGHT }),
  row(
    'Washington',
    {
      hours: cell(
        '8-40-6 non-school day/week; 3 (8 Saturday and Sunday) 16-6 school day/week',
        '8-40-6 en días y semanas sin clases; 3 (8 el sábado y el domingo) 16-6 en días y semanas de clases',
      ),
      night: cell(
        '7 p.m. (9 p.m. from June 1st to Labor Day) to 7 a.m.; an adult must supervise minors working after 8 p.m. in service occupations, such as restaurants and retail businesses.',
        '7 p.m. (9 p.m. del 1 de junio al Día del Trabajo) a 7 a.m.; un adulto debe supervisar a los menores que trabajan después de las 8 p.m. en servicios como restaurantes y comercios.',
      ),
    },
    {
      hours: cell(
        '8-48-6 non-school day/week; 4-20-6 school day/week',
        '8-48-6 en días y semanas sin clases; 4-20-6 en días y semanas de clases',
      ),
      night: cell(
        '10 p.m. Sunday - Thursday (midnight Friday and Saturday and when school is not in session) to 7 a.m. (5 a.m. when school is not in session). 9 p.m. to 7 a.m. in door-to-door sales; an adult must supervise minors working after 8 p.m. in service occupations, such as restaurants and retail businesses.',
        '10 p.m. de domingo a jueves (medianoche el viernes, el sábado y fuera del periodo escolar) a 7 a.m. (5 a.m. fuera del periodo escolar). 9 p.m. a 7 a.m. en ventas puerta a puerta; un adulto debe supervisar a los menores que trabajan después de las 8 p.m. en servicios como restaurantes y comercios.',
      ),
    },
  ),
  row('West Virginia', {
    hours: STANDARD,
    night: cell(
      '7 p.m. (9 p.m. June 1 through Labor Day) to 7 a.m.; supervision permit may be issued allowing 14 and 15 year old minors to work until 11:00 p.m. when school is not in session.',
      '7 p.m. (9 p.m. del 1 de junio al Día del Trabajo) a 7 a.m.; se puede dar un permiso de supervisión para que quienes tienen 14 y 15 años trabajen hasta las 11:00 p.m. fuera del periodo escolar.',
    ),
  }),
  row('Wisconsin', { hours: STANDARD_6, night: SUMMER_NIGHT }),
  row('Wyoming', {
    hours: cell(
      'May not work more than 8 hours during any 12 hour period',
      'No puede trabajar más de 8 horas en ningún periodo de 12 horas',
    ),
    night: cell(
      '10 p.m. (midnight before non-school day and for minors not enrolled in school) to 5 a.m.',
      '10 p.m. (medianoche antes de un día sin clases y para menores que no están inscritos en la escuela) a 5 a.m.',
    ),
  }),
];

/** The child labor row of the state named `name` in English. */
export const childLaborOf = (name: string): ChildLabor => {
  const found = CHILD_LABOR.find(({ state }) => state === name);
  if (found === undefined) throw new Error(`no child labor row for ${name}`);
  return found;
};
