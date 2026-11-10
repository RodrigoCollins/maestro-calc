import type { Lang } from '../time-card/receipt.ts';

/*
 * The U.S. Department of Labor "Table of State Payday Requirements" (January 1, 2023,
 * https://www.dol.gov/agencies/whd/state/payday, read November 10, 2026; `SOURCES.paydayTable`),
 * one row per state and DC. A frequency is listed where the table marks its column with an X; a
 * state whose row marks none is listed with none. `note` is the table's footnote for the state,
 * word for word in English (the state's name that opens a shared footnote left out) and in Spanish
 * the same text translated.
 */

export type Frequency = 'weekly' | 'biweekly' | 'semimonthly' | 'monthly';

/** The four columns of the table, in its order. */
export const FREQUENCIES: readonly Frequency[] = ['weekly', 'biweekly', 'semimonthly', 'monthly'];

export interface Payday {
  /** The state's name in English, as the state tables give it. */
  readonly state: string;
  /** The columns the table marks for the state, in the table's order. */
  readonly marked: readonly Frequency[];
  /** The footnotes the row carries, in their number order. */
  readonly notes: readonly Readonly<Record<Lang, string>>[];
}

type Note = Readonly<Record<Lang, string>>;

/** The footnotes of the table, by number; a footnote shared by states drops their names. */
const NOTE = {
  1: { en: 'No regulations or not specified.', es: 'Sin reglas o sin especificar.' },
  2: {
    en: 'Monthly payday requirements for Executive, Administrative, and Professional personnel.',
    es: 'El pago mensual corresponde al personal ejecutivo, administrativo y profesional.',
  },
  3: {
    en: 'Payday two or more days in a month, not more than 16 days apart.',
    es: 'Dos o más días de pago al mes, con no más de 16 días entre uno y otro.',
  },
  4: {
    en: 'Longer intervals (up to monthly) are permitted if approved by the labor commissioner.',
    es: 'Se permiten intervalos más largos (hasta mensuales) si los aprueba el comisionado de trabajo.',
  },
  5: {
    en: 'Employees may choose to be paid on a monthly basis under special election procedure. Director of labor and industrial relations also may grant exceptions to the general semi-monthly payday requirement. The payday requirement applies only to private sector employment.',
    es: 'Quien trabaja puede elegir que le paguen cada mes mediante un procedimiento especial. El director de trabajo y relaciones industriales también puede dar excepciones a la regla general de pagar dos veces al mes. La regla solo se aplica al empleo en el sector privado.',
  },
  6: {
    en: 'Employers are required to pay most employees via a regular payday at least biweekly, semimonthly or monthly. Any predictable and reliable pay schedule is permitted as long as employees get paid at least monthly and no later than 12 days (excluding Sundays and legal holidays) from the end of the period when the wages were earned. This can be waived by written agreement; employees on commission have different requirements.',
    es: 'Los empleadores deben pagar a la mayoría en un día de pago regular, al menos cada dos semanas, dos veces al mes o cada mes. Se permite cualquier calendario de pago previsible y confiable, siempre que se pague al menos una vez al mes y no más de 12 días (sin contar domingos ni feriados legales) después del fin del periodo en que se ganó el salario. Esto se puede dispensar por acuerdo escrito; quien cobra comisiones tiene otras reglas.',
  },
  7: {
    en: 'Applicable to entities employing 10 or more employees that are engaged in manufacturing, mining, or boring for oil, and to every public service corporation. Payment is required no less than twice during each calendar month.',
    es: 'Se aplica a las entidades con 10 o más empleados que se dedican a la manufactura, la minería o la perforación de pozos de petróleo, y a toda empresa de servicio público. El pago debe hacerse al menos dos veces en cada mes calendario.',
  },
  8: {
    en: 'Payment is due at regular intervals not to exceed 16 days.',
    es: 'El pago se debe a intervalos regulares de no más de 16 días.',
  },
  9: {
    en: 'Hourly employees must be paid either weekly or biweekly. Employers may pay salaried employees semi-monthly. Note: Salaried employees can also be paid monthly if an employee voluntarily agrees.',
    es: 'A quien cobra por hora se le debe pagar cada semana o cada dos semanas. Los empleadores pueden pagar a quien tiene sueldo dos veces al mes. Nota: a quien tiene sueldo también se le puede pagar cada mes si lo acepta de forma voluntaria.',
  },
  10: {
    en: 'The frequency of payday depends on the occupation.',
    es: 'La frecuencia del día de pago depende de la ocupación.',
  },
  11: {
    en: 'Under Minnesota statute, employers are required to pay their employees for all wages including salary, earnings and gratuities at least once every 31 days, and all commissions earned by an employee at least once every three months on a regular payday. Employees engaged in transitory employment must be paid at intervals of not more than 15 days. Employees of “public service corporations doing business within this state” are required to be paid at least semimonthly the wages earned by them within 15 days of the date of such payment, unless prevented by inevitable casualty.',
    es: 'Según la ley de Minnesota, los empleadores deben pagar todo el salario, incluidos el sueldo, las ganancias y las propinas, al menos una vez cada 31 días, y todas las comisiones al menos una vez cada tres meses en un día de pago regular. A quien tiene un empleo transitorio se le debe pagar a intervalos de no más de 15 días. A quien trabaja en “empresas de servicio público que operan en este estado” se le debe pagar al menos dos veces al mes lo ganado dentro de los 15 días previos a ese pago, salvo un caso fortuito inevitable.',
  },
  12: {
    en: 'Applicable to every entity engaged in manufacturing of any kind in the State employing 50 or more employees and employing public labor, and to every public service corporation doing business in the State. Payment is required once every two weeks or twice during each calendar month.',
    es: 'Se aplica a toda entidad que se dedica a cualquier tipo de manufactura en el estado con 50 o más empleados y que contrata mano de obra pública, y a toda empresa de servicio público que opera en el estado. El pago debe hacerse una vez cada dos semanas o dos veces en cada mes calendario.',
  },
  13: {
    en: 'If there is not an established time period or time when wages are due and payable, the pay period is presumed to be semimonthly in length.',
    es: 'Si no hay un periodo o una fecha establecidos en que se deba el salario, se presume que el periodo de pago es de medio mes.',
  },
  14: { en: 'Payday designated by the employer.', es: 'El empleador fija el día de pago.' },
  15: {
    en: 'Weekly or Bi-weekly payment of wages is required. Semi-monthly or monthly payments of wages are available upon written permission of the NHDOL.',
    es: 'Se exige pagar el salario cada semana o cada dos semanas. El pago dos veces al mes o cada mes es posible con permiso escrito del Departamento de Trabajo de New Hampshire (NHDOL).',
  },
  16: {
    en: 'Employers may pay bona fide executive, supervisory and other special classifications of employees once per month.',
    es: 'Los empleadores pueden pagar una vez al mes al personal ejecutivo y de supervisión genuino y a otras categorías especiales.',
  },
  17: {
    en: 'Weekly payday for manual workers. Semi-monthly payday upon approval for manual workers and for clerical and other workers.',
    es: 'Pago semanal para trabajadores manuales. Pago dos veces al mes, con aprobación, para trabajadores manuales, y para personal de oficina y otros trabajadores.',
  },
  18: {
    en: 'None specified, pay periods may be daily, weekly, bi-weekly, semi-monthly or monthly.',
    es: 'No se especifica; los periodos de pago pueden ser diarios, semanales, cada dos semanas, dos veces al mes o mensuales.',
  },
  19: {
    en: 'Most Rhode Island employers are required to pay employees weekly. Childcare providers shall have the option to be paid every two weeks. Effective January 1, 2014, employers that meet certain requirements outlined in Rhode Island General Law Section 28-14-2.2 may petition the Rhode Island Department of Labor and Training for permission to pay employees less frequently than weekly but must pay wages at least twice a month.',
    es: 'La mayoría de los empleadores de Rhode Island deben pagar cada semana. Quienes cuidan niños pueden optar por cobrar cada dos semanas. Desde el 1 de enero de 2014, los empleadores que cumplen ciertos requisitos de la sección 28-14-2.2 de las Leyes Generales de Rhode Island pueden pedir al Departamento de Trabajo y Capacitación de Rhode Island permiso para pagar con menos frecuencia que cada semana, pero deben pagar al menos dos veces al mes.',
  },
  20: {
    en: 'Employers with 5 or more employees are required to give written notice at the time of hiring to all employees advising them of their wages agreed upon, and the time and place of payment along with their expected hours of work. The employer must pay on the normal time and at the place of payment established by the employer.',
    es: 'Los empleadores con 5 o más empleados deben avisar por escrito al contratar a cada persona el salario acordado, el día y el lugar de pago y las horas de trabajo previstas. El empleador debe pagar en la fecha habitual y en el lugar de pago que fijó.',
  },
  21: {
    en: 'Each employee who is exempt from the overtime provisions of the federal Fair Labor Standards Act (FLSA) must be paid at least once a month; others must be paid at least twice a month. Semi-monthly pay periods must contain as nearly as possible an equal number of days. Within those limitations, an employer may designate any paydays he or she chooses.',
    es: 'A quien está exento de las horas extra de la Ley de Normas Justas de Trabajo (FLSA) federal se le debe pagar al menos una vez al mes; a los demás, al menos dos veces al mes. Los periodos de medio mes deben tener, en lo posible, el mismo número de días. Dentro de esos límites, el empleador puede fijar los días de pago que quiera.',
  },
  22: {
    en: 'Employees on a yearly salary can be paid on a monthly basis.',
    es: 'A quien tiene un sueldo anual se le puede pagar cada mes.',
  },
  23: {
    en: 'Employers may implement bi-weekly and semi-monthly paydays with written notice.',
    es: 'Los empleadores pueden pagar cada dos semanas o dos veces al mes con aviso por escrito.',
  },
  24: {
    en: 'Employees whose weekly wages total more than 150 percent of the average weekly wage of the Commonwealth may be paid monthly, upon agreement of each affected employee.',
    es: 'A quien gana a la semana más del 150 % del salario semanal promedio del estado se le puede pagar cada mes, si cada persona afectada lo acepta.',
  },
  25: {
    en: 'Most employers must pay workers all wages earned at least monthly, with no longer than 31 days between pay periods. The only employees exempted from this requirement are employees engaged in logging (must be paid at least quarterly), those engaged in farm labor (must be paid at least quarterly), unclassified employees of the UW system (left to the system), part-time firefighters and part-time emergency medical technicians (must be paid at regular intervals, at least annually), school employees who voluntarily request payment over 12 months, and employees covered under a valid collective bargaining agreement establishing a different frequency for wage payments.',
    es: 'La mayoría de los empleadores deben pagar todo el salario ganado al menos una vez al mes, con no más de 31 días entre periodos de pago. Las únicas excepciones son quienes trabajan en la tala de árboles (al menos cada trimestre), en el campo (al menos cada trimestre), el personal no clasificado del sistema de la Universidad de Wisconsin (según el sistema), los bomberos y técnicos de emergencias médicas a tiempo parcial (a intervalos regulares, al menos una vez al año), el personal escolar que pide de forma voluntaria cobrar en 12 meses y quien está cubierto por un convenio colectivo válido que fija otra frecuencia de pago.',
  },
} as const satisfies Readonly<Record<number, Note>>;

/** California's own sentence under footnote 10, which the table adds after the shared one. */
const CALIFORNIA: Note = {
  en: 'In California, wages, with some exceptions, must be paid at least twice during each calendar month on the days designated in advance as regular paydays.',
  es: 'En California, el salario, con algunas excepciones, se debe pagar al menos dos veces en cada mes calendario, en los días fijados de antemano como días de pago regulares.',
};

const W = 'weekly';
const B = 'biweekly';
const S = 'semimonthly';
const M = 'monthly';

const row = (state: string, marked: readonly Frequency[], ...notes: readonly Note[]): Payday => ({
  state,
  marked,
  notes,
});

/** In the order of the table, Alabama and Florida (footnote 1, not rows of it) in theirs. */
export const PAYDAYS: readonly Payday[] = [
  row('Alabama', [], NOTE[1]),
  row('Alaska', [S, M]),
  row('Arizona', [S], NOTE[3]),
  row('Arkansas', [S]),
  row('California', [W, B, S, M], NOTE[10], CALIFORNIA),
  row('Colorado', [M]),
  row('Connecticut', [W], NOTE[4]),
  row('Delaware', [M]),
  row('District of Columbia', [S]),
  row('Florida', [], NOTE[1]),
  row('Georgia', [S]),
  row('Hawaii', [S, M], NOTE[5]),
  row('Idaho', [M]),
  row('Illinois', [S, M], NOTE[2]),
  row('Indiana', [B, S]),
  row('Iowa', [W, B, S, M], NOTE[6]),
  row('Kansas', [M]),
  row('Kentucky', [S]),
  row('Louisiana', [B, S], NOTE[7]),
  row('Maine', [S], NOTE[8]),
  row('Maryland', [B, S]),
  row('Massachusetts', [W, B], NOTE[9]),
  row('Michigan', [W, B, S, M], NOTE[10]),
  row('Minnesota', [S, M], NOTE[11]),
  row('Mississippi', [B, S], NOTE[12]),
  row('Missouri', [S]),
  row('Montana', [], NOTE[13]),
  row('Nebraska', [], NOTE[14]),
  row('Nevada', [S, M], NOTE[2]),
  row('New Hampshire', [W, B, S, M], NOTE[15]),
  row('New Jersey', [S, M], NOTE[16]),
  row('New Mexico', [S, M], NOTE[2]),
  row('New York', [W, S], NOTE[17]),
  row('North Carolina', [], NOTE[18]),
  row('North Dakota', [M]),
  row('Ohio', [S]),
  row('Oklahoma', [S]),
  row('Oregon', [M]),
  row('Pennsylvania', []),
  row('Rhode Island', [W, B, S], NOTE[19]),
  row('South Carolina', [], NOTE[20]),
  row('South Dakota', [M]),
  row('Tennessee', [S]),
  row('Texas', [B, S, M], NOTE[21]),
  row('Utah', [S, M], NOTE[22]),
  row('Vermont', [W, B, S], NOTE[23]),
  row('Virginia', [W, B, S, M], NOTE[2], NOTE[24]),
  row('Washington', [M]),
  row('West Virginia', [B]),
  row('Wisconsin', [M], NOTE[25]),
  row('Wyoming', [S]),
];

/** The payday row of the state named `name` in English. */
export const paydayOf = (name: string): Payday => {
  const found = PAYDAYS.find(({ state }) => state === name);
  if (found === undefined) throw new Error(`no payday row for ${name}`);
  return found;
};
