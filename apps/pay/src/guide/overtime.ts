import { only, type WorkedWeek } from '../methodology/examples.ts';
import type { Lang } from '../time-card/receipt.ts';
import { TIME_CARD_PATHS } from '../long-tail/jobs.ts';
import type { GuideSource, GuideTexts } from './texts.ts';

/** The two overtime guides of plans/pago-del-trabajador/PLAN.md (MVP guides 1 and 2). */
export type OvertimeGuide = 'federal' | 'california';

export const OVERTIME_GUIDE_PATHS: Readonly<Record<OvertimeGuide, Readonly<Record<Lang, string>>>> =
  {
    federal: { en: '/guides/how-to-calculate-overtime', es: '/es/guias/como-calcular-horas-extra' },
    california: { en: '/guides/california-overtime', es: '/es/guias/horas-extra-en-california' },
  };

/** The calculator each guide sends the reader to: the time card works out both rules. */
const CALCULATOR = TIME_CARD_PATHS;

const MON_TO_THU = ['mon', 'tue', 'wed', 'thu'];
const MON_TO_FRI = [...MON_TO_THU, 'fri'];
const MON_TO_SAT = [...MON_TO_FRI, 'sat'];

/**
 * The weeks each guide works out, as raw time card fields at the default $22 an hour. The page
 * prints what the engine returns for them and `overtime.test.ts` pins the hand-verified figures.
 */
export const OVERTIME_GUIDE_WEEKS: Readonly<Record<OvertimeGuide, readonly WorkedWeek[]>> = {
  federal: [
    // the time card's default week: Mon-Fri 9 h, Sat 4.5 h
    { id: 'federal-week', inputs: {} },
    // four 10-hour days: 40 hours, so no federal overtime
    { id: 'federal-four-tens', inputs: only(MON_TO_THU, '8:00 am', '6:00 pm') },
    // the same four days under California's daily rule
    {
      id: 'california-four-tens',
      inputs: { rule: 'california', ...only(MON_TO_THU, '8:00 am', '6:00 pm') },
    },
  ],
  california: [
    // the three weeks of DLSE opinion letter 2000.01.19
    {
      id: 'california-ten-hour-days',
      inputs: { rule: 'california', ...only(MON_TO_FRI, '8:00 am', '6:00 pm') },
    },
    {
      id: 'california-nine-and-four',
      inputs: {
        rule: 'california',
        ...only(MON_TO_THU, '8:00 am', '5:00 pm'),
        fri: '8:00 am',
        friOut: '12:00 pm',
        friBreak: '0',
      },
    },
    {
      id: 'california-six-sevens',
      inputs: { rule: 'california', ...only(MON_TO_SAT, '8:00 am', '3:00 pm') },
    },
    // one 13-hour day: 8 regular, 4 at time and a half, 1 at double time
    {
      id: 'california-long-day',
      inputs: { rule: 'california', ...only(['mon'], '6:00 am', '7:00 pm') },
    },
    // seven days in a row, the seventh (Sunday) of 10 hours
    {
      id: 'california-seventh-day',
      inputs: {
        rule: 'california',
        ...only(MON_TO_SAT, '8:00 am', '4:00 pm'),
        sun: '8:00 am',
        sunOut: '6:00 pm',
        sunBreak: '0',
      },
    },
  ],
};

const FACT_SHEET_23: GuideSource = {
  label: 'U.S. Department of Labor, Fact Sheet #23: Overtime Pay Requirements of the FLSA',
  href: 'https://www.dol.gov/agencies/whd/fact-sheets/23-flsa-overtime-pay',
};
const HANDY_GUIDE: GuideSource = {
  label: 'U.S. Department of Labor, Handy Reference Guide to the FLSA',
  href: 'https://www.dol.gov/agencies/whd/compliance-assistance/handy-reference-guide-flsa',
};
const PART_778: GuideSource = {
  label: '29 CFR Part 778, Subpart B: The Overtime Pay Requirements',
  href: 'https://www.ecfr.gov/current/title-29/part-778/subpart-B',
};
const OVERTIME_PAY: GuideSource = {
  label: 'U.S. Department of Labor, Overtime Pay',
  href: 'https://www.dol.gov/general/topic/wages/overtimepay',
};
const FACT_SHEET_7: GuideSource = {
  label: 'U.S. Department of Labor, Fact Sheet #7: State and Local Governments Under the FLSA',
  href: 'https://www.dol.gov/agencies/whd/fact-sheets/7-flsa-state-local-government',
};
const FOH_32: GuideSource = {
  label: 'Wage and Hour Division, Field Operations Handbook, Chapter 32 (32d03d)',
  href: 'https://www.dol.gov/agencies/whd/field-operations-handbook/Chapter-32',
};
const DLSE_FAQ: GuideSource = {
  label: 'California Labor Commissioner (DLSE), Overtime FAQ',
  href: 'https://www.dir.ca.gov/dlse/faq_overtime.htm',
};
const DLSE_LETTER: GuideSource = {
  label: 'DLSE opinion letter 2000.01.19, No Pyramiding of Overtime Hours',
  href: 'https://www.dir.ca.gov/dlse/opinions/2000-01-19.pdf',
};

const EN_COLUMNS = {
  regular: 'Regular h',
  overtime: 'Overtime h',
  double: 'Double h',
  pay: 'Gross pay',
};
const ES_COLUMNS = {
  regular: 'Horas normales',
  overtime: 'Horas extra',
  double: 'Horas dobles',
  pay: 'Pago bruto',
};

export const OVERTIME_GUIDES: Readonly<Record<OvertimeGuide, Readonly<Record<Lang, GuideTexts>>>> =
  {
    federal: {
      en: {
        title: 'How to Calculate Overtime Under Federal Law (FLSA) | Cuenta Horas',
        description:
          'Who gets overtime under the FLSA, the 40-hour workweek, time and a half of the regular rate, comp time, and worked examples run through the time card.',
        kicker: 'Federal law · guide',
        h1: 'How to calculate overtime under federal law',
        lead: 'Under the Fair Labor Standards Act (FLSA), a covered employee who is not exempt earns overtime for every hour over 40 in a workweek, at no less than one and a half times the regular rate. This guide covers who that includes, how the workweek is counted and what goes into the regular rate.',
        sections: [
          {
            id: 'who-gets-overtime',
            heading: 'Who gets overtime',
            paragraphs: [
              'Most workers are covered. The FLSA reaches the employees of businesses with at least $500,000 a year in sales or business done, of hospitals, care facilities and schools, and of public agencies. A worker of a smaller business is still covered when their own job is engaged in interstate commerce or in producing goods for it.',
              'Some employees are exempt from overtime. The best known exemptions are for executive, administrative and professional employees, outside sales employees and some computer jobs, each as the Department of Labor defines it. Unless an exemption applies, a covered employee must be paid overtime.',
            ],
            sources: [HANDY_GUIDE, FACT_SHEET_23],
          },
          {
            id: 'the-rule',
            heading: 'The rule: hours over 40 in a workweek',
            paragraphs: [
              'A covered employee who is not exempt must be paid at least one and a half times the regular rate for every hour worked over 40 in a workweek. At $22 an hour, each overtime hour pays at least $33.',
              'There is no daily overtime under the FLSA: a 10-hour day is not overtime by itself, and the law does not require extra pay for Saturdays, Sundays, holidays or regular days of rest as such. It also does not limit how many hours a day or days a week an employee 16 or older can be scheduled.',
              'A state law or a contract can require more. California, for example, also pays overtime by the day, and the FLSA does not relieve an employer of that duty.',
            ],
            sources: [FACT_SHEET_23, HANDY_GUIDE, PART_778],
          },
          {
            id: 'the-workweek',
            heading: 'How the workweek is counted',
            paragraphs: [
              'A workweek is a fixed and regularly recurring period of 168 hours: seven consecutive 24-hour periods. It does not have to match the calendar week and can start on any day and at any hour. Once set, it stays fixed; it can be changed only if the change is meant to be permanent and is not designed to avoid overtime.',
              'Each workweek stands alone, and hours are never averaged over two or more weeks. If you work 30 hours one week and 50 the next, the 10 hours over 40 in the second week are overtime, even though the two weeks average 40.',
              'All the hours you work for the same employer in the workweek are added up, even if they come from two unrelated jobs for that employer.',
            ],
            sources: [PART_778, FACT_SHEET_23],
          },
          {
            id: 'the-regular-rate',
            heading: 'What goes into the regular rate',
            paragraphs: [
              'The regular rate is an hourly rate, but you do not have to be paid by the hour. It is your total pay for the workweek, minus the payments the law leaves out, divided by the hours you actually worked that week. It can never be less than the minimum wage.',
              'It includes all pay for the work except what the law excludes: reimbursed expenses, overtime premiums, true premiums for work on Saturdays, Sundays and holidays, discretionary bonuses, gifts on special occasions, and pay for occasional periods when no work is done. With some exceptions, bonus payments count.',
            ],
            sources: [PART_778, FACT_SHEET_23, OVERTIME_PAY],
          },
          {
            id: 'payday-and-comp-time',
            heading: 'When it is paid, and comp time',
            paragraphs: [
              'Overtime earned in a workweek is generally due on the regular payday for the period in which that workweek ends.',
              'Comp time, paid time off instead of overtime pay, is a rule the FLSA writes for state and local government agencies, under set conditions. For other employers, the Wage and Hour Division holds that extra paid vacation in place of the overtime owed does not meet the law: the overtime has to be paid with the wages at the end of the regular pay period.',
            ],
            sources: [PART_778, FACT_SHEET_7, FOH_32],
          },
        ],
        examples: {
          heading: 'Worked examples',
          lead: 'Each week, Monday to Sunday, is run through the time card at $22 an hour, under the federal rule unless it says California.',
          columns: EN_COLUMNS,
          labels: {
            'federal-week': 'Federal: Mon-Fri 9 h, Sat 4.5 h (49.5 h)',
            'federal-four-tens': 'Federal: four 10 h days, Mon-Thu (40 h)',
            'california-four-tens': 'California: the same four 10 h days',
          },
        },
        sourcesLabel: 'Sources',
        disclaimer:
          'A guide to the federal rules, not legal advice. Your state law, your contract or an exemption can change what you are owed.',
        reviewed: 'Checked against U.S. Department of Labor sources on November 4, 2026.',
        ctas: [
          { label: 'Open the time card', href: CALCULATOR.en },
          {
            label: 'California overtime by day and week',
            href: OVERTIME_GUIDE_PATHS.california.en,
          },
        ],
        linkLabel: 'How federal overtime is calculated',
      },
      es: {
        title: 'Cómo Calcular las Horas Extra según la Ley Federal | Cuenta Horas',
        description:
          'Quién cobra horas extra según la FLSA, la semana de 40 horas, el tiempo y medio de la tarifa regular, el tiempo compensatorio y ejemplos resueltos.',
        kicker: 'Ley federal · guía',
        h1: 'Cómo calcular las horas extra según la ley federal',
        lead: 'Según la Ley de Normas Justas de Trabajo (FLSA), un empleado cubierto que no está exento cobra horas extra por cada hora sobre 40 en una semana laboral, a no menos de una vez y media su tarifa regular. Esta guía explica a quién incluye, cómo se cuenta la semana laboral y qué entra en la tarifa regular.',
        sections: [
          {
            id: 'quien-cobra',
            heading: 'Quién cobra horas extra',
            paragraphs: [
              'La mayoría de los trabajadores están cubiertos. La FLSA alcanza a los empleados de empresas con al menos $500,000 al año en ventas o negocios, de hospitales, centros de cuidado y escuelas, y de agencias públicas. El trabajador de una empresa más pequeña también está cubierto cuando su propio trabajo participa en el comercio interestatal o en producir bienes para él.',
              'Algunos empleados están exentos de las horas extra. Las exenciones más conocidas son las de empleados ejecutivos, administrativos y profesionales, vendedores externos y algunos trabajos de computación, cada una como la define el Departamento de Trabajo. Si no aplica una exención, a un empleado cubierto se le deben pagar las horas extra.',
            ],
            sources: [HANDY_GUIDE, FACT_SHEET_23],
          },
          {
            id: 'la-regla',
            heading: 'La regla: las horas sobre 40 en la semana laboral',
            paragraphs: [
              'A un empleado cubierto que no está exento se le debe pagar al menos una vez y media su tarifa regular por cada hora trabajada sobre 40 en una semana laboral. A $22 la hora, cada hora extra paga al menos $33.',
              'La FLSA no tiene horas extra por día: un día de 10 horas no es horas extra por sí solo, y la ley no exige pago adicional por trabajar sábados, domingos, feriados o días de descanso como tales. Tampoco limita cuántas horas al día o días a la semana se puede programar a un empleado de 16 años o más.',
              'Una ley estatal o un contrato pueden exigir más. California, por ejemplo, también paga horas extra por día, y la FLSA no libera al empleador de esa obligación.',
            ],
            sources: [FACT_SHEET_23, HANDY_GUIDE, PART_778],
          },
          {
            id: 'la-semana-laboral',
            heading: 'Cómo se cuenta la semana laboral',
            paragraphs: [
              'Una semana laboral es un período fijo y que se repite con regularidad de 168 horas: siete períodos seguidos de 24 horas. No tiene que coincidir con la semana del calendario y puede empezar cualquier día y a cualquier hora. Una vez fijada, no cambia; solo se puede cambiar si el cambio es permanente y no busca evitar las horas extra.',
              'Cada semana laboral se cuenta sola, y las horas nunca se promedian entre dos o más semanas. Si trabajas 30 horas una semana y 50 la siguiente, las 10 horas sobre 40 de la segunda semana son horas extra, aunque el promedio de las dos sea 40.',
              'Todas las horas que trabajas para el mismo empleador en la semana laboral se suman, aunque vengan de dos trabajos distintos para ese empleador.',
            ],
            sources: [PART_778, FACT_SHEET_23],
          },
          {
            id: 'la-tarifa-regular',
            heading: 'Qué entra en la tarifa regular',
            paragraphs: [
              'La tarifa regular es una tarifa por hora, aunque no te paguen por hora. Es tu pago total de la semana laboral, sin los pagos que la ley deja fuera, dividido por las horas que de verdad trabajaste esa semana. Nunca puede ser menor que el salario mínimo.',
              'Incluye todo el pago por el trabajo salvo lo que la ley excluye: los gastos reembolsados, los recargos por horas extra, los recargos reales por trabajar sábados, domingos y feriados, los bonos discrecionales, los regalos en ocasiones especiales y el pago por períodos ocasionales en que no se trabaja. Salvo algunas excepciones, los bonos cuentan.',
            ],
            sources: [PART_778, FACT_SHEET_23, OVERTIME_PAY],
          },
          {
            id: 'pago-y-tiempo-compensatorio',
            heading: 'Cuándo se pagan, y el tiempo compensatorio',
            paragraphs: [
              'Las horas extra ganadas en una semana laboral se deben, por lo general, el día de pago normal del período en que termina esa semana.',
              'El tiempo compensatorio (comp time), tiempo libre pagado en lugar del pago de horas extra, es una regla que la FLSA escribe para las agencias de gobiernos estatales y locales, con condiciones fijas. Para los demás empleadores, la División de Horas y Salarios sostiene que dar vacaciones pagadas adicionales en lugar de las horas extra debidas no cumple la ley: las horas extra se tienen que pagar con el salario al final del período de pago normal.',
            ],
            sources: [PART_778, FACT_SHEET_7, FOH_32],
          },
        ],
        examples: {
          heading: 'Ejemplos resueltos',
          lead: 'Cada semana, de lunes a domingo, pasa por la tarjeta de horas a $22 la hora, con la regla federal salvo que diga California.',
          columns: ES_COLUMNS,
          labels: {
            'federal-week': 'Federal: lun-vie 9 h, sáb 4.5 h (49.5 h)',
            'federal-four-tens': 'Federal: cuatro días de 10 h, lun-jue (40 h)',
            'california-four-tens': 'California: los mismos cuatro días de 10 h',
          },
        },
        sourcesLabel: 'Fuentes',
        disclaimer:
          'Una guía de las reglas federales, no asesoría legal. La ley de tu estado, tu contrato o una exención pueden cambiar lo que te deben.',
        reviewed: 'Revisada con fuentes del Departamento de Trabajo el 4 de noviembre de 2026.',
        ctas: [
          { label: 'Abrir la tarjeta de horas', href: CALCULATOR.es },
          {
            label: 'Horas extra en California por día y por semana',
            href: OVERTIME_GUIDE_PATHS.california.es,
          },
        ],
        linkLabel: 'Cómo se calculan las horas extra federales',
      },
    },
    california: {
      en: {
        title: 'California Overtime: Daily and Weekly Rules | Cuenta Horas',
        description:
          'California overtime after 8 hours a day and 40 a week, double time after 12, the seventh-day rule and why an hour is overtime only once, with examples.',
        kicker: 'California · guide',
        h1: 'California overtime by the day and by the week',
        lead: 'California pays overtime by the day as well as by the week. This guide covers the general rule of the Labor Commissioner, the seventh consecutive day, why the same hour is never paid twice as overtime, and weeks run through the time card.',
        sections: [
          {
            id: 'the-rule',
            heading: 'The general rule',
            paragraphs: [
              'A nonexempt employee 18 or older, or a 16 or 17 year old who is not required by law to attend school, is owed one and a half times the regular rate for every hour over 8 in a workday, up to and including 12, and for every hour over 40 in the workweek.',
              'Double the regular rate is owed for every hour over 12 in a workday.',
              'Overtime is owed whether or not the employer authorized it, for work the employer knew or should have known about. It is based on hours actually worked: a paid sick day or a paid holiday you did not work does not count toward overtime. An agreement to work for less does not waive it.',
            ],
            sources: [DLSE_FAQ],
          },
          {
            id: 'seventh-day',
            heading: 'The seventh consecutive day',
            paragraphs: [
              'On the seventh consecutive day of work in a workweek, the first 8 hours are paid at one and a half times the regular rate and every hour after 8 at double the regular rate.',
              'An employer can generally require overtime, but it cannot discipline an employee for refusing to work the seventh day of a workweek.',
            ],
            sources: [DLSE_FAQ],
          },
          {
            id: 'no-pyramiding',
            heading: 'An hour is overtime only once',
            paragraphs: [
              'Daily and weekly overtime do not stack on the same hours. In its opinion letter of January 19, 2000, the legal section of the Labor Commissioner works the case of 10 hours a day for five days: 50 hours in the week, of which 10 are overtime at one and a half times the rate, 2 on each day. Those daily overtime hours are not counted again for weekly overtime.',
              'The same letter shows the rule both ways. 9 hours Monday to Thursday and 4 on Friday is a 40-hour week, yet 4 hours of daily overtime are due. 7 hours a day for six days has no daily overtime, but the week is 42 hours, so 2 hours of weekly overtime are due.',
            ],
            sources: [DLSE_LETTER],
          },
          {
            id: 'exceptions',
            heading: 'Exemptions, exceptions and alternative schedules',
            paragraphs: [
              'Some classifications of employees are exempt from the overtime law, and others have an exception: a special rule that pays overtime on a different basis, as agricultural workers have. A salaried employee is owed overtime unless they meet the tests for exempt status or a specific exemption applies.',
              'Most Industrial Welfare Commission wage orders also allow an alternative workweek schedule, such as four 10-hour days or three 12-hour days, with its own way of scheduling and computing overtime. This guide and the time card follow the general rule.',
              'Federal law does not relieve an employer of a state law that pays premium rates past a daily standard, so a California employee covered by the FLSA is still owed daily overtime.',
            ],
            sources: [DLSE_FAQ, PART_778],
          },
          {
            id: 'regular-rate-and-payday',
            heading: 'The regular rate and the payday',
            paragraphs: [
              'The regular rate includes hourly pay, salary, piecework and commissions, and an hourly rate includes any shift differential. It can never be less than the minimum wage. For a monthly salary, multiply it by 12, divide by 52 and divide by 40.',
              'A nondiscretionary bonus, paid for hours worked, production or proficiency, or as an incentive to stay, is part of the regular rate. A discretionary bonus or a gift for a holiday is not.',
              'Overtime must be paid no later than the payday for the next regular payroll period after it was earned (Labor Code section 204).',
            ],
            sources: [DLSE_FAQ],
          },
        ],
        examples: {
          heading: 'Worked examples',
          lead: 'Each week, Monday to Sunday, is run through the time card under the California rule at $22 an hour: $33 at time and a half, $44 at double time.',
          columns: EN_COLUMNS,
          labels: {
            'california-ten-hour-days': '10 h a day, Mon-Fri (DLSE letter)',
            'california-nine-and-four': '9 h Mon-Thu, 4 h Fri (DLSE letter)',
            'california-six-sevens': '7 h a day, Mon-Sat (DLSE letter)',
            'california-long-day': 'One 13 h day',
            'california-seventh-day': '8 h Mon-Sat, then 10 h on Sunday, the seventh day',
          },
        },
        sourcesLabel: 'Sources',
        disclaimer:
          'A guide to the general California rule, not legal advice. Your wage order, an exemption or an alternative workweek schedule can change what you are owed.',
        reviewed: 'Checked against California Labor Commissioner sources on November 4, 2026.',
        ctas: [
          { label: 'Open the time card', href: CALCULATOR.en },
          { label: 'Federal overtime under the FLSA', href: OVERTIME_GUIDE_PATHS.federal.en },
        ],
        linkLabel: 'California overtime by day and week',
      },
      es: {
        title: 'Horas Extra en California: por Día y por Semana | Cuenta Horas',
        description:
          'Horas extra en California después de 8 horas al día y 40 a la semana, doble después de 12, el séptimo día y por qué una hora es extra una sola vez.',
        kicker: 'California · guía',
        h1: 'Horas extra en California por día y por semana',
        lead: 'California paga horas extra por día además de por semana. Esta guía explica la regla general del Comisionado Laboral, el séptimo día seguido, por qué la misma hora nunca se paga dos veces como extra, y semanas resueltas con la tarjeta de horas.',
        sections: [
          {
            id: 'la-regla',
            heading: 'La regla general',
            paragraphs: [
              'A un empleado no exento de 18 años o más, o de 16 o 17 años que la ley no obliga a ir a la escuela, se le debe una vez y media su tarifa regular por cada hora sobre 8 en una jornada, hasta 12 inclusive, y por cada hora sobre 40 en la semana laboral.',
              'Se le debe el doble de la tarifa regular por cada hora sobre 12 en una jornada.',
              'Las horas extra se deben aunque el empleador no las haya autorizado, por el trabajo que el empleador conocía o debía conocer. Se basan en las horas trabajadas de verdad: un día de enfermedad o un feriado pagado que no trabajaste no cuenta para las horas extra. Un acuerdo para trabajar por menos no las anula.',
            ],
            sources: [DLSE_FAQ],
          },
          {
            id: 'septimo-dia',
            heading: 'El séptimo día seguido',
            paragraphs: [
              'El séptimo día seguido de trabajo en una semana laboral, las primeras 8 horas se pagan a una vez y media la tarifa regular y cada hora después de 8 al doble de la tarifa regular.',
              'Por lo general, el empleador puede exigir horas extra, pero no puede sancionar a un empleado por negarse a trabajar el séptimo día de una semana laboral.',
            ],
            sources: [DLSE_FAQ],
          },
          {
            id: 'sin-piramide',
            heading: 'Una hora es extra una sola vez',
            paragraphs: [
              'Las horas extra diarias y las semanales no se suman sobre las mismas horas. En su carta de opinión del 19 de enero de 2000, la sección legal del Comisionado Laboral resuelve el caso de 10 horas al día durante cinco días: 50 horas en la semana, de las que 10 son extra a una vez y media la tarifa, 2 por día. Esas horas extra diarias no se vuelven a contar para las horas extra semanales.',
              'La misma carta muestra la regla en los dos sentidos. 9 horas de lunes a jueves y 4 el viernes es una semana de 40 horas, pero se deben 4 horas extra diarias. 7 horas al día durante seis días no tiene horas extra diarias, pero la semana suma 42 horas, así que se deben 2 horas extra semanales.',
            ],
            sources: [DLSE_LETTER],
          },
          {
            id: 'excepciones',
            heading: 'Exenciones, excepciones y horarios alternativos',
            paragraphs: [
              'Algunas clasificaciones de empleados están exentas de la ley de horas extra, y otras tienen una excepción: una regla especial que paga las horas extra de otra forma, como la de los trabajadores agrícolas. A un empleado con sueldo fijo se le deben horas extra salvo que cumpla las pruebas de empleado exento o que aplique una exención específica.',
              'La mayoría de las órdenes salariales de la Comisión de Bienestar Industrial (IWC) también permiten un horario de semana laboral alternativa, como cuatro días de 10 horas o tres de 12, con su propia forma de programar y calcular las horas extra. Esta guía y la tarjeta de horas siguen la regla general.',
              'La ley federal no libera al empleador de una ley estatal que paga recargos después de un límite diario, así que a un empleado de California cubierto por la FLSA se le siguen debiendo las horas extra diarias.',
            ],
            sources: [DLSE_FAQ, PART_778],
          },
          {
            id: 'tarifa-regular-y-pago',
            heading: 'La tarifa regular y el día de pago',
            paragraphs: [
              'La tarifa regular incluye el pago por hora, el sueldo, el pago a destajo y las comisiones, y una tarifa por hora incluye cualquier diferencial por turno. Nunca puede ser menor que el salario mínimo. Para un sueldo mensual, multiplícalo por 12, divídelo por 52 y divídelo por 40.',
              'Un bono no discrecional, pagado por horas trabajadas, producción o desempeño, o como incentivo para quedarte, es parte de la tarifa regular. Un bono discrecional o un regalo por un feriado no lo es.',
              'Las horas extra se deben pagar a más tardar el día de pago del siguiente período de nómina normal después de ganarlas (sección 204 del Código Laboral).',
            ],
            sources: [DLSE_FAQ],
          },
        ],
        examples: {
          heading: 'Ejemplos resueltos',
          lead: 'Cada semana, de lunes a domingo, pasa por la tarjeta de horas con la regla de California a $22 la hora: $33 a tiempo y medio, $44 al doble.',
          columns: ES_COLUMNS,
          labels: {
            'california-ten-hour-days': '10 h al día, lun-vie (carta de la DLSE)',
            'california-nine-and-four': '9 h lun-jue, 4 h vie (carta de la DLSE)',
            'california-six-sevens': '7 h al día, lun-sáb (carta de la DLSE)',
            'california-long-day': 'Un día de 13 h',
            'california-seventh-day': '8 h lun-sáb, luego 10 h el domingo, el séptimo día',
          },
        },
        sourcesLabel: 'Fuentes',
        disclaimer:
          'Una guía de la regla general de California, no asesoría legal. Tu orden salarial, una exención o un horario de semana laboral alternativa pueden cambiar lo que te deben.',
        reviewed:
          'Revisada con fuentes del Comisionado Laboral de California el 4 de noviembre de 2026.',
        ctas: [
          { label: 'Abrir la tarjeta de horas', href: CALCULATOR.es },
          {
            label: 'Horas extra federales según la FLSA',
            href: OVERTIME_GUIDE_PATHS.federal.es,
          },
        ],
        linkLabel: 'Horas extra en California por día y por semana',
      },
    },
  };
