import type { Rational } from '@maestro-calc/core';
import { ptoAccrual } from '@maestro-calc/pay-core/pto-accrual';
import { decimalHoursText, hoursText, rateText } from '../format.ts';
import { PTO_PATHS } from '../pto/texts.ts';
import type { Lang } from '../time-card/receipt.ts';
import { PAY_STUB_GUIDE_PATHS, UNPAID_WAGES_GUIDE_PATHS } from './paths.ts';
import type { GuideSource, GuideTexts } from './texts.ts';

export { PTO_GUIDE_PATHS } from './paths.ts';

/** The figures of one worked policy, each written as the PTO calculator writes it. */
export interface PtoFigures {
  readonly annualHours: string;
  readonly biweekly: string;
  readonly weekly: string;
  readonly semimonthly: string;
  readonly monthly: string;
  readonly perHourWorked: string;
  readonly hoursPerPtoHour: string;
}

interface PtoPolicy {
  readonly id: 'ten-days' | 'fifteen-days' | 'part-time';
  readonly ptoDays: number;
  readonly hoursPerDay: number;
  readonly hoursPerWeek: number;
}

const POLICIES: readonly PtoPolicy[] = [
  { id: 'ten-days', ptoDays: 10, hoursPerDay: 8, hoursPerWeek: 40 },
  { id: 'fifteen-days', ptoDays: 15, hoursPerDay: 8, hoursPerWeek: 40 },
  { id: 'part-time', ptoDays: 10, hoursPerDay: 5, hoursPerWeek: 25 },
];

const figuresOf = (policy: PtoPolicy): PtoFigures => {
  const ran = ptoAccrual.run({
    ptoDays: String(policy.ptoDays),
    hoursPerDay: String(policy.hoursPerDay),
    hoursPerWeek: String(policy.hoursPerWeek),
  });
  if (!ran.ok) throw new Error(`the PTO policy ${policy.id} must run`);
  const out = new Map(ran.value.outputs.map(({ key, value }) => [key, value]));
  const value = (key: Parameters<typeof out.get>[0]): Rational => {
    const found = out.get(key);
    if (found === undefined) throw new Error(`no PTO output ${key}`);
    return found;
  };
  return {
    annualHours: hoursText(value('annualHours')),
    biweekly: decimalHoursText(value('biweekly')),
    weekly: decimalHoursText(value('weekly')),
    semimonthly: decimalHoursText(value('semimonthly')),
    monthly: decimalHoursText(value('monthly')),
    perHourWorked: rateText(value('perHourWorked')),
    hoursPerPtoHour: hoursText(value('hoursPerPtoHour')),
  };
};

/** The policies the guide works out, every figure from the PTO calculator at build time. */
export const PTO_GUIDE_EXAMPLES: readonly (PtoPolicy & { readonly figures: PtoFigures })[] =
  POLICIES.map((policy) => ({ ...policy, figures: figuresOf(policy) }));

const exampleOf = (id: PtoPolicy['id']): PtoPolicy & { readonly figures: PtoFigures } => {
  const found = PTO_GUIDE_EXAMPLES.find((each) => each.id === id);
  if (found === undefined) throw new Error(`no PTO example ${id}`);
  return found;
};

const LABELS: Readonly<Record<Lang, Readonly<Record<PtoPolicy['id'], string>>>> = {
  en: {
    'ten-days': 'Full time, 10 days',
    'fifteen-days': 'Full time, 15 days',
    'part-time': 'Part time',
  },
  es: {
    'ten-days': 'Tiempo completo, 10 días',
    'fifteen-days': 'Tiempo completo, 15 días',
    'part-time': 'Medio tiempo',
  },
};

const exampleText = (lang: Lang, id: PtoPolicy['id']): string => {
  const { ptoDays, hoursPerDay, hoursPerWeek, figures: f } = exampleOf(id);
  const label = LABELS[lang][id];
  return lang === 'en'
    ? `${label}: ${String(ptoDays)} days off of ${String(hoursPerDay)} hours and a ${String(hoursPerWeek)}-hour week are ${f.annualHours} PTO hours a year. That is ${f.biweekly} hours every two weeks, ${f.weekly} a week, ${f.semimonthly} twice a month and ${f.monthly} a month, or ${f.perHourWorked} hours per hour worked: 1 hour off for every ${f.hoursPerPtoHour} hours worked.`
    : `${label}: ${String(ptoDays)} días libres de ${String(hoursPerDay)} horas y una semana de ${String(hoursPerWeek)} horas son ${f.annualHours} horas de PTO al año. Son ${f.biweekly} horas cada dos semanas, ${f.weekly} por semana, ${f.semimonthly} dos veces al mes y ${f.monthly} al mes, o ${f.perHourWorked} horas por hora trabajada: 1 hora libre por cada ${f.hoursPerPtoHour} horas trabajadas.`;
};

const DOL_VACATION: GuideSource = {
  label: 'U.S. Department of Labor, Vacation Leave',
  href: 'https://www.dol.gov/general/topic/workhours/vacation_leave',
};
const HANDY_GUIDE: GuideSource = {
  label: 'U.S. Department of Labor, Handy Reference Guide to the FLSA',
  href: 'https://www.dol.gov/agencies/whd/compliance-assistance/handy-reference-guide-flsa',
};
const DLSE_VACATION: GuideSource = {
  label: 'California Labor Commissioner (DLSE), Vacation FAQ',
  href: 'https://www.dir.ca.gov/dlse/faq_vacation.htm',
};
const COLORADO_INFO_3E: GuideSource = {
  label:
    'Colorado Division of Labor Standards and Statistics, INFO #3E: Payment of Earned Vacation upon Separation of Employment',
  href: 'https://cdle.colorado.gov/sites/cdle/files/INFO%20%233E%20Payment%20of%20Earned%20Vacation%20upon%20Separation%20of%20Employment%205.29.2024%20%5Baccessible%5D.pdf',
};
const WASHINGTON_PAID: GuideSource = {
  label: 'Washington State Department of Labor & Industries, Getting Paid',
  href: 'https://www.lni.wa.gov/workers-rights/wages/getting-paid/',
};

export const PTO_GUIDE: Readonly<Record<Lang, GuideTexts>> = {
  en: {
    title: 'Paid Time Off (PTO): Accrual and the Law | Cuenta Horas',
    description:
      'How PTO accrues per paycheck and per hour worked, worked examples, and what federal law, California and other states say about vacation pay.',
    kicker: 'Paid time off · guide',
    h1: 'Paid time off (PTO): how accrual works and what the law says',
    lead: 'PTO is the paid time off your employer gives you, often earned a little with each paycheck. This guide shows how accrual is worked out, with examples, and what federal law and some state labor agencies say about vacation pay, caps and payout when a job ends.',
    sections: [
      {
        id: 'what-pto-is',
        heading: 'What PTO is',
        paragraphs: [
          'Paid time off is time away from work that your employer pays. Some employers give separate vacation and sick days; others put them into one bank of PTO hours that you can use for any purpose.',
          'The employer’s policy sets the terms. As Colorado’s labor agency lists them, the employer may set the amount of paid vacation, how it is earned (for example, by hours, weeks or years of work) and whether there is a cap on how much you can save up. Read your written policy or handbook first.',
        ],
        sources: [COLORADO_INFO_3E],
      },
      {
        id: 'how-accrual-works',
        heading: 'How accrual works',
        paragraphs: [
          'Most accrual policies spread a yearly amount over the year. The days off a year times the hours of a day off are the PTO hours a year. Divided by your paychecks (52 weekly, 26 every two weeks, 24 twice a month, 12 monthly), that is what each paycheck adds. Divided by the hours you work a year (your hours a week times 52), it is the PTO you earn per hour worked.',
          'The California Labor Commissioner gives the same arithmetic: 10 work days a year × 8 hours a day = 80 hours, and 80 hours ÷ 52 weeks = 1.538 hours of vacation earned per week. Your payroll may round to two places or to a different period.',
        ],
        sources: [DLSE_VACATION],
      },
      {
        id: 'worked-examples',
        heading: 'Worked examples',
        paragraphs: [
          exampleText('en', 'ten-days'),
          exampleText('en', 'fifteen-days'),
          exampleText('en', 'part-time'),
          'The part-time worker earns at the same rate per hour worked as the full-time worker with 10 days: the policy is proportional to the hours. These figures come from the PTO accrual calculator; change the days or the hours there to see your own.',
        ],
        sources: [DLSE_VACATION],
      },
      {
        id: 'federal-law',
        heading: 'Federal law does not require paid vacation',
        paragraphs: [
          'The U.S. Department of Labor says the Fair Labor Standards Act (FLSA) does not require payment for time not worked, such as vacations, sick leave or federal or other holidays. These benefits are matters of agreement between an employer and an employee (or the employee’s representative).',
          'The FLSA also does not require vacation, holiday, severance or sick pay, or immediate payment of final wages to terminated employees. Whether unused PTO is paid when a job ends is decided by state law and by your employer’s policy.',
        ],
        sources: [DOL_VACATION, HANDY_GUIDE],
      },
      {
        id: 'california',
        heading: 'California: vacation is wages',
        paragraphs: [
          'There is no legal requirement in California that an employer provide paid or unpaid vacation. But once there is a policy, practice or agreement to provide it, earned vacation is wages: it is earned, or vests, as you work. In the Labor Commissioner’s example, a worker entitled to 10 work days a year has earned 5 days after six months.',
          'A “use it or lose it” policy, which takes away vacation not used by a date, is illegal under California law. A reasonable cap is allowed: once the balance reaches the cap, no more vacation accrues until it falls below it. An employer may also set a period at the start of the job, even the whole first year, when no vacation is earned, as long as it is not a subterfuge.',
          'A PTO plan that combines vacation and sick leave follows the same rules: it is earned day by day, it cannot be forfeited, it can be capped and what is unused is paid when the job ends.',
          'When the job ends for any reason, unless a collective bargaining agreement says otherwise, all earned and unused vacation must be paid at the final rate of pay (Labor Code section 227.3), in the final paycheck. In the Labor Commissioner’s example, a worker with 15 days a year (120 hours) quits on the 219th day of the year with no vacation taken: 219 ÷ 365 = 60%, 60% of 120 hours = 72 hours, and 72 hours × $13.00 = $936.00.',
        ],
        sources: [DLSE_VACATION],
      },
      {
        id: 'other-states',
        heading: 'Other states: the rules differ',
        paragraphs: [
          'Colorado: employers are not required to offer paid vacation, but when they do, vacation pay is wages under the Colorado Wage Act. Unused vacation must be paid when the job ends, whether you are fired or resign, and no policy can forfeit vacation already earned. Paid leave usable for any purpose, whatever its name (“personal days,” “PTO”), counts as vacation pay.',
          'Washington: the Department of Labor & Industries calls vacation time a voluntary benefit that employers can choose to pay out on a final paycheck. If you believe you are owed an agreed-upon benefit, it points you to an attorney or small claims court. Paid sick leave has separate requirements.',
          'Other states have their own rules. Check your state’s labor department and your employer’s written policy before you count on a payout.',
        ],
        sources: [COLORADO_INFO_3E, WASHINGTON_PAID],
      },
    ],
    sourcesLabel: 'Sources',
    disclaimer:
      'A guide to what these agencies publish, not legal advice. For your own case, check your state’s labor department and your employer’s written policy.',
    reviewed:
      'Checked against Department of Labor, California, Colorado and Washington agency pages on November 5, 2026.',
    ctas: [
      { label: 'Open the PTO accrual calculator', href: PTO_PATHS.en },
      { label: 'If your final pay is short', href: UNPAID_WAGES_GUIDE_PATHS.en },
      { label: 'How to read your pay stub', href: PAY_STUB_GUIDE_PATHS.en },
    ],
    linkLabel: 'How PTO accrues and what the law says',
  },
  es: {
    title: 'Vacaciones pagadas: cómo se acumulan y la ley | Cuenta Horas',
    description:
      'Cómo se acumula el PTO por cheque y por hora trabajada, ejemplos resueltos y qué dicen la ley federal, California y otros estados de las vacaciones pagadas.',
    kicker: 'Vacaciones pagadas · guía',
    h1: 'Vacaciones pagadas: cómo se acumulan y qué dice la ley',
    lead: 'El PTO (paid time off) es el tiempo libre pagado que te da tu empleador, muchas veces ganado de a poco en cada cheque. Esta guía muestra cómo se calcula la acumulación, con ejemplos, y qué dicen la ley federal y algunas agencias laborales estatales sobre el pago de vacaciones, los topes y el pago cuando termina el trabajo.',
    sections: [
      {
        id: 'que-es-el-pto',
        heading: 'Qué es el PTO',
        paragraphs: [
          'El tiempo libre pagado es tiempo fuera del trabajo que tu empleador te paga. Algunos empleadores dan días de vacaciones y de enfermedad por separado; otros los juntan en una sola bolsa de horas de PTO que puedes usar para lo que quieras.',
          'La política del empleador fija las condiciones. Según la agencia laboral de Colorado, el empleador puede fijar cuántas vacaciones pagadas da, cómo se ganan (por ejemplo, por horas, semanas o años de trabajo) y si hay un tope de lo que puedes ahorrar. Lee primero tu política escrita o tu manual.',
        ],
        sources: [COLORADO_INFO_3E],
      },
      {
        id: 'como-se-acumula',
        heading: 'Cómo se acumula',
        paragraphs: [
          'La mayoría de las políticas reparten un monto anual a lo largo del año. Los días libres al año por las horas de un día libre son las horas de PTO al año. Divididas por tus cheques (52 semanales, 26 cada dos semanas, 24 quincenales, 12 mensuales), es lo que suma cada cheque. Divididas por las horas que trabajas al año (tus horas por semana por 52), es el PTO que ganas por hora trabajada.',
          'El Comisionado Laboral de California hace la misma cuenta: 10 días de trabajo al año × 8 horas al día = 80 horas, y 80 horas ÷ 52 semanas = 1.538 horas de vacaciones ganadas por semana. Tu nómina puede redondear a dos decimales o a otro período.',
        ],
        sources: [DLSE_VACATION],
      },
      {
        id: 'ejemplos-resueltos',
        heading: 'Ejemplos resueltos',
        paragraphs: [
          exampleText('es', 'ten-days'),
          exampleText('es', 'fifteen-days'),
          exampleText('es', 'part-time'),
          'Quien trabaja medio tiempo gana a la misma tasa por hora trabajada que quien trabaja tiempo completo con 10 días: la política es proporcional a las horas. Estas cifras salen de la calculadora de vacaciones pagadas; cambia ahí los días o las horas para ver las tuyas.',
        ],
        sources: [DLSE_VACATION],
      },
      {
        id: 'ley-federal',
        heading: 'La ley federal no exige vacaciones pagadas',
        paragraphs: [
          'El Departamento de Trabajo de EE. UU. dice que la Ley de Normas Justas de Trabajo (FLSA) no exige pagar el tiempo no trabajado, como las vacaciones, la licencia por enfermedad o los feriados federales u otros. Estos beneficios son un acuerdo entre el empleador y el empleado (o su representante).',
          'La FLSA tampoco exige pago de vacaciones, feriados, indemnización por despido ni licencia por enfermedad, ni el pago inmediato del salario final a quien despiden. Si el PTO no usado se paga al terminar el trabajo lo deciden la ley de tu estado y la política de tu empleador.',
        ],
        sources: [DOL_VACATION, HANDY_GUIDE],
      },
      {
        id: 'california',
        heading: 'California: las vacaciones son salario',
        paragraphs: [
          'En California no hay obligación legal de que el empleador dé vacaciones pagadas ni sin pago. Pero cuando hay una política, una práctica o un acuerdo de darlas, las vacaciones ganadas son salario: se ganan, o se consolidan, a medida que trabajas. En el ejemplo del Comisionado Laboral, quien tiene derecho a 10 días de trabajo al año ya ganó 5 días a los seis meses.',
          'Una política de “úsalas o piérdelas” (use it or lose it), que quita las vacaciones no usadas antes de una fecha, es ilegal según la ley de California. Se permite un tope razonable: cuando el saldo llega al tope, no se acumulan más vacaciones hasta que baje. El empleador también puede fijar un período al inicio del trabajo, incluso todo el primer año, en el que no se ganan vacaciones, siempre que no sea un subterfugio.',
          'Un plan de PTO que junta vacaciones y licencia por enfermedad sigue las mismas reglas: se gana día a día, no se puede perder, puede tener tope y lo que no usaste se paga cuando termina el trabajo.',
          'Cuando el trabajo termina por cualquier motivo, salvo que un convenio colectivo diga otra cosa, todas las vacaciones ganadas y no usadas se deben pagar a la tarifa final (sección 227.3 del Código Laboral), en el último cheque. En el ejemplo del Comisionado Laboral, alguien con 15 días al año (120 horas) renuncia el día 219 del año sin haber tomado vacaciones: 219 ÷ 365 = 60%, el 60% de 120 horas = 72 horas, y 72 horas × $13.00 = $936.00.',
        ],
        sources: [DLSE_VACATION],
      },
      {
        id: 'otros-estados',
        heading: 'Otros estados: las reglas cambian',
        paragraphs: [
          'Colorado: el empleador no está obligado a dar vacaciones pagadas, pero si las da, el pago de vacaciones es salario según la Ley de Salarios de Colorado (Colorado Wage Act). Las vacaciones no usadas se deben pagar cuando termina el trabajo, te despidan o renuncies, y ninguna política puede quitarte vacaciones ya ganadas. La licencia pagada que puedes usar para lo que quieras, se llame como se llame (“días personales”, “PTO”), cuenta como pago de vacaciones.',
          'Washington: el Departamento de Trabajo e Industrias dice que las vacaciones son un beneficio voluntario que el empleador puede elegir pagar en el último cheque. Si crees que te deben un beneficio acordado, te remite a un abogado o al tribunal de reclamos menores. La licencia por enfermedad pagada tiene requisitos aparte.',
          'Otros estados tienen sus propias reglas. Consulta al departamento de trabajo de tu estado y la política escrita de tu empleador antes de contar con un pago.',
        ],
        sources: [COLORADO_INFO_3E, WASHINGTON_PAID],
      },
    ],
    sourcesLabel: 'Fuentes',
    disclaimer:
      'Una guía de lo que publican estas agencias, no asesoría legal. Para tu caso, consulta al departamento de trabajo de tu estado y la política escrita de tu empleador.',
    reviewed:
      'Revisada con páginas del Departamento de Trabajo y de las agencias de California, Colorado y Washington el 5 de noviembre de 2026.',
    ctas: [
      { label: 'Abrir la calculadora de vacaciones pagadas', href: PTO_PATHS.es },
      { label: 'Si tu último pago llega corto', href: UNPAID_WAGES_GUIDE_PATHS.es },
      { label: 'Cómo leer tu talón de pago', href: PAY_STUB_GUIDE_PATHS.es },
    ],
    linkLabel: 'Cómo se acumulan las vacaciones pagadas y qué dice la ley',
  },
};
