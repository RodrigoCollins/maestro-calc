import { OVERTIME_PATHS } from '../overtime/texts.ts';
import { TIME_CARD_PATHS } from '../long-tail/jobs.ts';
import type { Lang } from '../time-card/receipt.ts';
import { OVERTIME_GUIDE_PATHS } from './overtime.ts';
import { PAY_STUB_GUIDE_PATHS } from './paths.ts';
import type { GuideSource, GuideTexts } from './texts.ts';

export { UNPAID_WAGES_GUIDE_PATHS } from './paths.ts';

/** The Wage and Hour Division's toll-free number, as its complaint and contact pages print it. */
export const WHD_PHONE = '1-866-487-9243';
/** The Labor Commissioner's number for retaliation complaints, as its filing page prints it. */
export const DLSE_RETALIATION_PHONE = '833-526-4636';

const FACT_SHEET_21: GuideSource = {
  label: 'U.S. Department of Labor, Fact Sheet #21: Recordkeeping Requirements under the FLSA',
  href: 'https://www.dol.gov/agencies/whd/fact-sheets/21-flsa-recordkeeping',
};
const FACT_SHEET_23: GuideSource = {
  label: 'U.S. Department of Labor, Fact Sheet #23: Overtime Pay Requirements of the FLSA',
  href: 'https://www.dol.gov/agencies/whd/fact-sheets/23-flsa-overtime-pay',
};
const WHD_COMPLAINTS: GuideSource = {
  label: 'Wage and Hour Division, How to file a complaint',
  href: 'https://www.dol.gov/agencies/whd/contact/complaints',
};
const WHD_CONTACT: GuideSource = {
  label: 'Wage and Hour Division, Contact us',
  href: 'https://www.dol.gov/agencies/whd/contact',
};
const HANDY_GUIDE: GuideSource = {
  label: 'U.S. Department of Labor, Handy Reference Guide to the FLSA',
  href: 'https://www.dol.gov/agencies/whd/compliance-assistance/handy-reference-guide-flsa',
};
const WHD_RETALIATION: GuideSource = {
  label: 'Wage and Hour Division, Retaliation',
  href: 'https://www.dol.gov/agencies/whd/retaliation',
};
const FACT_SHEET_77A: GuideSource = {
  label: 'U.S. Department of Labor, Fact Sheet #77A: Prohibiting Retaliation Under the FLSA',
  href: 'https://www.dol.gov/agencies/whd/fact-sheets/77a-flsa-prohibiting-retaliation',
};
const DLSE_WAGE_CLAIM: GuideSource = {
  label: 'California Labor Commissioner (DLSE), How to file a wage claim',
  href: 'https://www.dir.ca.gov/dlse/howtofilewageclaim.htm',
};
const DLSE_RETALIATION: GuideSource = {
  label: 'California Labor Commissioner (DLSE), How to file a retaliation complaint',
  href: 'https://www.dir.ca.gov/dlse/HowToFileRetaliationComplaint.htm',
};

export const UNPAID_WAGES_GUIDE: Readonly<Record<Lang, GuideTexts>> = {
  en: {
    title: 'Unpaid Overtime or Wages: What to Do | Cuenta Horas',
    description:
      'Keep your own time records, check the math, ask in writing, then file with the Wage and Hour Division or a California wage claim. Time limits and retaliation.',
    kicker: 'Your rights · guide',
    h1: 'What to do if your overtime or wages were not paid',
    lead: 'If a paycheck is short, keep your own record, check the math, ask your employer, and if that does not fix it, file a complaint: under federal law you generally have 2 years to recover back wages, 3 when the violation was willful. This guide covers the federal Wage and Hour Division, the California Labor Commissioner, the time limits and the protection against retaliation.',
    sections: [
      {
        id: 'keep-records',
        heading: '1. Keep your own record of your hours',
        paragraphs: [
          'Write down the time you begin and end work every day, when you take meal and rest breaks, and the total hours you work. Keep all your pay stubs and any contract about your pay.',
          'Your employer has to keep records too. For each nonexempt worker, federal law requires the hours worked each day and each workweek, the regular hourly rate, the overtime earnings of the workweek, every addition to or deduction from the wages and the total wages of each pay period. Payroll records must be kept for at least three years, and time cards and wage computations for two.',
        ],
        sources: [DLSE_WAGE_CLAIM, FACT_SHEET_21],
      },
      {
        id: 'check-the-math',
        heading: '2. Check the math',
        paragraphs: [
          'Enter the hours of each day in the time card or the overtime calculator and compare the result with your pay stub, line by line. Under the FLSA, a covered nonexempt employee is owed at least one and a half times the regular rate for every hour over 40 in the workweek; California also counts overtime by the day.',
          'Look first at the hours and the rates on the stub: a missing day, overtime paid at the regular rate, or a long week averaged with a short one, which the FLSA does not allow, since each workweek stands alone.',
        ],
        sources: [FACT_SHEET_23],
      },
      {
        id: 'ask-in-writing',
        heading: '3. Ask your employer in writing',
        paragraphs: [
          'Putting it in writing gives you and your employer the same facts. Write to your employer or payroll: the pay period, the hours you worked, what you were paid and what you think is missing. Keep a copy and the date you sent it.',
          'Asking about your pay is protected. The Wage and Hour Division lists inquiring about your pay or hours of work among the activities your employer cannot retaliate against, and the FLSA protects complaints whether they are made orally or in writing; most courts have ruled that complaints made to the employer are protected too.',
        ],
        sources: [WHD_RETALIATION, FACT_SHEET_77A],
      },
      {
        id: 'federal-complaint',
        heading: '4. File a complaint with the Wage and Hour Division',
        paragraphs: [
          `Many investigations of the U.S. Department of Labor’s Wage and Hour Division (WHD) start from a worker’s complaint. To file a complaint, call ${WHD_PHONE} (1-866-4-USWAGE), Monday to Friday from 8:00 a.m. to 4:30 p.m. local time, and you will be directed to the nearest WHD office. You can also send a question online or visit a local office.`,
          'Complaints are confidential: the name of the person who complained, the nature of the complaint and whether a complaint exists may not be disclosed.',
          'Under the FLSA, the Department of Labor or the employee can recover the back wages and an equal amount in liquidated damages. An employee can also file a private lawsuit for the back wages, the same amount in liquidated damages, attorney’s fees and court costs.',
        ],
        sources: [WHD_COMPLAINTS, WHD_CONTACT, HANDY_GUIDE],
      },
      {
        id: 'california-wage-claim',
        heading: '5. In California: a wage claim with the Labor Commissioner',
        paragraphs: [
          'A California worker can file a wage claim with the Labor Commissioner’s Office (DLSE) online, or by email, by mail or in person at one of its offices. Have the name and address of the company or person you work for, your record of hours, your pay stubs and any contract.',
          'After the claim is filed, a settlement conference between you and your employer is scheduled. If the claim is not resolved there, a hearing is scheduled so a hearing officer can review the evidence.',
          'California’s labor laws protect all workers, regardless of immigration status.',
        ],
        sources: [DLSE_WAGE_CLAIM],
      },
      {
        id: 'time-limits',
        heading: 'Time limits: do not wait',
        paragraphs: [
          'Federal law: generally, a two-year statute of limitations applies to recovering back wages and liquidated damages under the FLSA, and three years when the violation was willful.',
          'California: a wage claim must be filed within three years for minimum wage, overtime, unpaid meal and rest breaks, sick leave, illegal deductions from pay or unpaid reimbursements; within four years for a written contract; within two years for an oral promise to pay more than the minimum wage; and within one year for penalties for a bounced check or for not giving access to, or a copy of, payroll or personnel records.',
        ],
        sources: [HANDY_GUIDE, DLSE_WAGE_CLAIM],
      },
      {
        id: 'retaliation',
        heading: 'If your employer retaliates',
        paragraphs: [
          'Under the FLSA, an employer cannot fire you or take any other adverse action against you for asking about your pay, asserting your rights, filing a complaint or cooperating with a WHD investigation. The protection reaches all employees of an employer, and the remedies can include reinstatement, lost wages and an equal amount as liquidated damages. You can complain to the WHD or file a private lawsuit.',
          `In California, a retaliation complaint to the Labor Commissioner must generally be filed within one year of the retaliatory act. You can file it online or in person at a district office; the Labor Commissioner’s number for retaliation complaints is ${DLSE_RETALIATION_PHONE}. Filing does not require proof of immigration status, a Social Security number or a photo ID.`,
        ],
        sources: [WHD_RETALIATION, FACT_SHEET_77A, DLSE_RETALIATION],
      },
    ],
    sourcesLabel: 'Sources',
    disclaimer:
      'A guide to the federal and California complaint processes, not legal advice. For your own case, ask the agency or a lawyer.',
    checked: '2026-11-04',
    ctas: [
      { label: 'Open the overtime calculator', href: OVERTIME_PATHS.en },
      { label: 'Check your hours with the time card', href: TIME_CARD_PATHS.en },
      { label: 'How to read your pay stub', href: PAY_STUB_GUIDE_PATHS.en },
      { label: 'How federal overtime is calculated', href: OVERTIME_GUIDE_PATHS.federal.en },
    ],
    linkLabel: 'What to do if your overtime was not paid',
  },
  es: {
    title: 'Si No Te Pagan las Horas Extra: Qué Hacer | Cuenta Horas',
    description:
      'Lleva tu propio registro, revisa la cuenta, pide por escrito y presenta una queja ante la División de Horas y Salarios o un reclamo en California.',
    kicker: 'Tus derechos · guía',
    h1: 'Qué hacer si no te pagan las horas extra o el salario',
    lead: 'Si un cheque llega corto, lleva tu propio registro, revisa la cuenta, pregúntale a tu empleador y, si eso no lo arregla, presenta una queja: según la ley federal, en general tienes 2 años para recuperar los salarios atrasados, 3 si la infracción fue intencional. Esta guía explica la División de Horas y Salarios federal, el Comisionado Laboral de California, los plazos y la protección contra represalias.',
    sections: [
      {
        id: 'lleva-tu-registro',
        heading: '1. Lleva tu propio registro de horas',
        paragraphs: [
          'Anota la hora en que empiezas y terminas de trabajar cada día, cuándo tomas los descansos para comer y descansar, y el total de horas que trabajas. Guarda todos tus talones de pago y cualquier contrato sobre tu pago.',
          'Tu empleador también tiene que llevar registros. Por cada trabajador no exento, la ley federal exige las horas trabajadas cada día y cada semana laboral, la tarifa regular por hora, las ganancias de horas extra de la semana laboral, cada suma o descuento al salario y el salario total de cada período de pago. Los registros de nómina se deben guardar al menos tres años, y las tarjetas de horas y los cálculos de salario, dos.',
        ],
        sources: [DLSE_WAGE_CLAIM, FACT_SHEET_21],
      },
      {
        id: 'revisa-la-cuenta',
        heading: '2. Revisa la cuenta',
        paragraphs: [
          'Ingresa las horas de cada día en la tarjeta de horas o en la calculadora de horas extra y compara el resultado con tu talón de pago, línea por línea. Según la FLSA, a un empleado cubierto no exento se le debe al menos una vez y media su tarifa regular por cada hora sobre 40 en la semana laboral; California también cuenta horas extra por día.',
          'Mira primero las horas y las tarifas del talón: un día que falta, horas extra pagadas a la tarifa regular, o una semana larga promediada con una corta, algo que la FLSA no permite, porque cada semana laboral se cuenta sola.',
        ],
        sources: [FACT_SHEET_23],
      },
      {
        id: 'pide-por-escrito',
        heading: '3. Pregúntale a tu empleador por escrito',
        paragraphs: [
          'Ponerlo por escrito les da a ti y a tu empleador los mismos datos. Escríbele a tu empleador o a nómina: el período de pago, las horas que trabajaste, lo que te pagaron y lo que crees que falta. Guarda una copia y la fecha en que lo enviaste.',
          'Preguntar por tu pago está protegido. La División de Horas y Salarios incluye preguntar por tu pago o tus horas de trabajo entre las actividades por las que tu empleador no puede tomar represalias, y la FLSA protege las quejas tanto orales como por escrito; la mayoría de los tribunales ha resuelto que las quejas hechas al empleador también están protegidas.',
        ],
        sources: [WHD_RETALIATION, FACT_SHEET_77A],
      },
      {
        id: 'queja-federal',
        heading: '4. Presenta una queja ante la División de Horas y Salarios',
        paragraphs: [
          `Muchas investigaciones de la División de Horas y Salarios (Wage and Hour Division, WHD) del Departamento de Trabajo de EE. UU. empiezan con la queja de un trabajador. Para presentar una queja, llama al ${WHD_PHONE} (1-866-4-USWAGE), de lunes a viernes de 8:00 a. m. a 4:30 p. m. hora local, y te comunicarán con la oficina de la WHD más cercana. También puedes enviar una consulta en línea o ir a una oficina local.`,
          'Las quejas son confidenciales: no se puede revelar el nombre de quien se quejó, el tipo de queja ni si existe una queja.',
          'Según la FLSA, el Departamento de Trabajo o el empleado pueden recuperar los salarios atrasados y un monto igual como daños liquidados. El empleado también puede presentar una demanda privada por los salarios atrasados, el mismo monto en daños liquidados, los honorarios de abogado y las costas judiciales.',
        ],
        sources: [WHD_COMPLAINTS, WHD_CONTACT, HANDY_GUIDE],
      },
      {
        id: 'reclamo-en-california',
        heading: '5. En California: un reclamo de salarios ante el Comisionado Laboral',
        paragraphs: [
          'Un trabajador de California puede presentar un reclamo de salarios (wage claim) ante la Oficina del Comisionado Laboral (DLSE) en línea, o por correo electrónico, por correo o en persona en una de sus oficinas. Ten a mano el nombre y la dirección de la empresa o persona para la que trabajas, tu registro de horas, tus talones de pago y cualquier contrato.',
          'Después de presentar el reclamo, se programa una conferencia de conciliación entre tú y tu empleador. Si el reclamo no se resuelve ahí, se programa una audiencia para que un oficial de audiencias revise las pruebas.',
          'Las leyes laborales de California protegen a todos los trabajadores, sin importar su situación migratoria.',
        ],
        sources: [DLSE_WAGE_CLAIM],
      },
      {
        id: 'plazos',
        heading: 'Plazos: no esperes',
        paragraphs: [
          'Ley federal: por lo general, hay un plazo de prescripción de dos años para recuperar salarios atrasados y daños liquidados según la FLSA, y de tres años cuando la infracción fue intencional.',
          'California: un reclamo de salarios se debe presentar dentro de tres años por salario mínimo, horas extra, descansos para comer y descansar no pagados, licencia por enfermedad, descuentos ilegales del pago o reembolsos no pagados; dentro de cuatro años por un contrato escrito; dentro de dos años por una promesa oral de pagar más que el salario mínimo; y dentro de un año por las multas por un cheque sin fondos o por no dar acceso a los registros de nómina o de personal, o una copia de ellos.',
        ],
        sources: [HANDY_GUIDE, DLSE_WAGE_CLAIM],
      },
      {
        id: 'represalias',
        heading: 'Si tu empleador toma represalias',
        paragraphs: [
          'Según la FLSA, un empleador no puede despedirte ni tomar ninguna otra medida en tu contra por preguntar por tu pago, hacer valer tus derechos, presentar una queja o cooperar con una investigación de la WHD. La protección alcanza a todos los empleados de un empleador, y los remedios pueden incluir la reincorporación, los salarios perdidos y un monto igual como daños liquidados. Puedes quejarte ante la WHD o presentar una demanda privada.',
          `En California, una queja por represalias ante el Comisionado Laboral se debe presentar, por lo general, dentro de un año del acto de represalia. Puedes presentarla en línea o en persona en una oficina de distrito; el número del Comisionado Laboral para quejas por represalias es el ${DLSE_RETALIATION_PHONE}. Para presentarla no se exige prueba de situación migratoria, número de Seguro Social ni identificación con foto.`,
        ],
        sources: [WHD_RETALIATION, FACT_SHEET_77A, DLSE_RETALIATION],
      },
    ],
    sourcesLabel: 'Fuentes',
    disclaimer:
      'Una guía de los procesos de queja federal y de California, no asesoría legal. Para tu caso, consulta a la agencia o a un abogado.',
    checked: '2026-11-04',
    ctas: [
      { label: 'Abrir la calculadora de horas extra', href: OVERTIME_PATHS.es },
      { label: 'Revisa tus horas con la tarjeta de horas', href: TIME_CARD_PATHS.es },
      { label: 'Cómo leer tu talón de pago', href: PAY_STUB_GUIDE_PATHS.es },
      {
        label: 'Cómo se calculan las horas extra federales',
        href: OVERTIME_GUIDE_PATHS.federal.es,
      },
    ],
    linkLabel: 'Qué hacer si no te pagaron las horas extra',
  },
};
