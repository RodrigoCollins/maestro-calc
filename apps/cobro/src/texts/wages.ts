import type { Lang, TradeId } from '../routes.ts';

/** How one occupation is named in each language. */
export interface OccupationText {
  /** `un pintor`, `a painter`: after "Cuánto gana" / "How much does … make". */
  readonly noun: string;
  /** `pintores`, `painters`: the group, for the lead sentence. */
  readonly plural: string;
  /** The title BLS gives the occupation. */
  readonly bls: string;
  /** The trade page's short name, for links. */
  readonly trade: string;
}

export const OCCUPATION_TEXTS: Readonly<Record<Lang, Readonly<Record<TradeId, OccupationText>>>> = {
  es: {
    cleaning: {
      noun: 'un trabajador de limpieza',
      plural: 'los empleados de limpieza y amas de llaves',
      bls: 'Maids and Housekeeping Cleaners',
      trade: 'Limpieza',
    },
    painting: {
      noun: 'un pintor',
      plural: 'los pintores de construcción y mantenimiento',
      bls: 'Painters, Construction and Maintenance',
      trade: 'Pintura',
    },
    drywall: {
      noun: 'un instalador de drywall',
      plural: 'los instaladores de drywall y de losetas de techo',
      bls: 'Drywall and Ceiling Tile Installers',
      trade: 'Drywall',
    },
    concrete: {
      noun: 'un albañil de concreto',
      plural: 'los albañiles de cemento y acabadores de concreto',
      bls: 'Cement Masons and Concrete Finishers',
      trade: 'Concreto',
    },
    landscaping: {
      noun: 'un jardinero',
      plural: 'los trabajadores de jardinería y mantenimiento de terrenos',
      bls: 'Landscaping and Groundskeeping Workers',
      trade: 'Jardín',
    },
  },
  en: {
    cleaning: {
      noun: 'a house cleaner',
      plural: 'maids and housekeeping cleaners',
      bls: 'Maids and Housekeeping Cleaners',
      trade: 'Cleaning',
    },
    painting: {
      noun: 'a painter',
      plural: 'painters in construction and maintenance',
      bls: 'Painters, Construction and Maintenance',
      trade: 'Painting',
    },
    drywall: {
      noun: 'a drywall installer',
      plural: 'drywall and ceiling tile installers',
      bls: 'Drywall and Ceiling Tile Installers',
      trade: 'Drywall',
    },
    concrete: {
      noun: 'a concrete finisher',
      plural: 'cement masons and concrete finishers',
      bls: 'Cement Masons and Concrete Finishers',
      trade: 'Concrete',
    },
    landscaping: {
      noun: 'a landscaper',
      plural: 'landscaping and groundskeeping workers',
      bls: 'Landscaping and Groundskeeping Workers',
      trade: 'Landscaping',
    },
  },
};

/** The words of the wage pages, with `{name}` holes the view fills. */
export interface WageText {
  readonly stateTitle: string;
  readonly stateDescription: string;
  readonly stateLead: string;
  readonly stats: {
    readonly mean: string;
    readonly median: string;
    readonly national: string;
    readonly versus: string;
  };
  readonly above: string;
  readonly below: string;
  readonly same: string;
  readonly rankH2: string;
  readonly rank: string;
  readonly rateH2: string;
  readonly rateBody: string;
  readonly calculator: string;
  readonly guide: string;
  readonly othersH2: string;
  readonly source: string;
  readonly table: { readonly state: string; readonly mean: string; readonly median: string };
  readonly indexTitle: string;
  readonly indexDescription: string;
  readonly indexLead: string;
  readonly nationalLine: string;
  readonly hubTitle: string;
  readonly hubDescription: string;
  readonly hubH1: string;
  readonly hubLead: string;
  readonly hubCard: string;
  readonly crumb: string;
  readonly hubSource: string;
}

export const WAGE_TEXTS: Readonly<Record<Lang, WageText>> = {
  es: {
    stateTitle: 'Cuánto gana {noun} en {state}',
    stateDescription:
      '{Plural} ganan en promedio {mean} por hora en {state} (mediana {median}). BLS, mayo de 2025.',
    stateLead:
      'En {state}, {plural} ganaban en promedio {mean} por hora en mayo de 2025, y la mediana era {median} por hora, según las estadísticas del Departamento de Trabajo de EE. UU. (BLS).',
    stats: {
      mean: 'Promedio por hora',
      median: 'Mediana por hora',
      national: 'Promedio nacional',
      versus: 'Frente al promedio nacional',
    },
    above: '{diff} más por hora',
    below: '{diff} menos por hora',
    same: 'Igual',
    rankH2: '¿Cómo se compara {state}?',
    rank: 'Por salario promedio, {state} está en el lugar {rank} de {total} entre los estados y DC con datos para este oficio (1 es el que más paga). La mediana nacional es {nationalMedian} por hora.',
    rateH2: 'De salario a tarifa',
    rateBody:
      'Un salario es lo que un empleador paga a un empleado, no lo que cobra un contratista. Tu tarifa también tiene que cubrir tus costos generales (vehículo, seguro, herramientas) y tu ganancia, y las horas que no puedes cobrar.',
    calculator: 'Arma un presupuesto con tu tarifa',
    guide: 'Cómo fijar tu tarifa por hora',
    othersH2: 'Otros oficios en {state}',
    source:
      'Fuente: BLS, Encuesta de Estadísticas de Empleo y Salarios por Ocupación (OEWS), estimaciones estatales de mayo de 2025, código {code}, leída el {accessed}.',
    table: { state: 'Estado', mean: 'Promedio por hora', median: 'Mediana por hora' },
    indexTitle: 'Cuánto gana {noun} por estado',
    indexDescription:
      'Salario por hora promedio y mediano de {plural} en cada estado de EE. UU., según el BLS, mayo de 2025.',
    indexLead:
      'Salario por hora promedio y mediano de {plural} en cada estado y DC, según el BLS (mayo de 2025). A nivel nacional el promedio era {mean} y la mediana {median}.',
    nationalLine: 'Nacional',
    hubTitle: 'Salarios por oficio y estado: lo que pagan los empleadores',
    hubDescription:
      'Cuánto gana por hora un pintor, un jardinero, un albañil y otros oficios en cada estado, según el BLS, mayo de 2025.',
    hubH1: 'Salarios por oficio y estado',
    hubLead:
      'Elige tu oficio para ver el salario por hora en cada estado. Son los datos de mayo de 2025 del Departamento de Trabajo de EE. UU.; sirven para comparar tu tarifa, no para fijarla.',
    hubCard: 'Promedio nacional: {mean} por hora · mediana {median}',
    crumb: 'Salarios',
    hubSource:
      'Fuente: BLS, Encuesta de Estadísticas de Empleo y Salarios por Ocupación (OEWS), estimaciones estatales de mayo de 2025, leída el {accessed}.',
  },
  en: {
    stateTitle: 'How much does {noun} make in {state}?',
    stateDescription:
      '{Plural} earn an average of {mean} an hour in {state} (median {median}), per the BLS, May 2025.',
    stateLead:
      'In {state}, {plural} earned an average of {mean} an hour in May 2025, and the median was {median} an hour, per the U.S. Bureau of Labor Statistics (BLS).',
    stats: {
      mean: 'Average per hour',
      median: 'Median per hour',
      national: 'National average',
      versus: 'Against the national average',
    },
    above: '{diff} more an hour',
    below: '{diff} less an hour',
    same: 'The same',
    rankH2: 'How does {state} compare?',
    rank: 'By average wage, {state} ranks {rank} of {total} states and DC with data for this trade (1 pays the most). The national median is {nationalMedian} an hour.',
    rateH2: 'From wage to rate',
    rateBody:
      'This is what an employer pays an employee, not what a contractor bills. Your rate also has to cover your overhead (vehicle, insurance, tools), your profit, and the hours you cannot bill.',
    calculator: 'Build a quote with your rate',
    guide: 'How to set your hourly rate',
    othersH2: 'Other trades in {state}',
    source:
      'Source: BLS, Occupational Employment and Wage Statistics (OEWS), May 2025 state estimates, code {code}, read {accessed}.',
    table: { state: 'State', mean: 'Average per hour', median: 'Median per hour' },
    indexTitle: 'How much does {noun} make by state?',
    indexDescription:
      'Average and median hourly wage of {plural} in every U.S. state, per the BLS, May 2025.',
    indexLead:
      'Average and median hourly wage of {plural} in every state and DC, per the BLS (May 2025). Nationally the average was {mean} and the median {median}.',
    nationalLine: 'National',
    hubTitle: 'Wages by trade and state: what employers pay',
    hubDescription:
      'What a painter, a landscaper, a concrete finisher and other trades earn an hour in each state, per the BLS, May 2025.',
    hubH1: 'Wages by trade and state',
    hubLead:
      'Pick your trade to see the hourly wage in every state. This is the May 2025 data of the U.S. Department of Labor; it helps you compare your rate, not set it.',
    hubCard: 'National average: {mean} an hour · median {median}',
    crumb: 'Wages',
    hubSource:
      'Source: BLS, Occupational Employment and Wage Statistics (OEWS), May 2025 state estimates, read {accessed}.',
  },
};
