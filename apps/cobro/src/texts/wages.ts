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
  readonly yearStat: string;
  readonly yearH2: string;
  readonly yearBody: string;
  readonly gapAbove: string;
  readonly gapBelow: string;
  readonly gapSame: string;
  readonly nationAbove: string;
  readonly nationBelow: string;
  readonly nationSame: string;
  readonly regionH2: string;
  readonly regionTop: string;
  readonly regionTopTied: string;
  readonly regionBottom: string;
  readonly regionBottomTied: string;
  readonly regionMiddle: string;
  readonly regionCaption: string;
  readonly versus: string;
  readonly tradesBody: string;
  readonly tradeColumn: string;
  readonly minimumH2: string;
  readonly minimumState: string;
  readonly minimumFederal: string;
  readonly minimumTimes: string;
  readonly minimumPercent: string;
  readonly minimumUpstate: string;
  readonly quoteBody: string;
  readonly quoteLink: string;
  readonly sourcesH2: string;
  readonly sourceNames: {
    readonly technical: string;
    readonly dol: string;
    readonly fl: string;
    readonly census: string;
  };
  /** Joins the last two names of a list: `y`, `and`. */
  readonly and: string;
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
  readonly hubSpreadH2: string;
  readonly hubSpread: string;
  readonly hubReadingH2: string;
  readonly hubReading: readonly string[];
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
    othersH2: 'Este oficio y los demás en {state}',
    yearStat: 'Promedio al año (2,080 h)',
    yearH2: 'Por hora, por semana y por año en {state}',
    yearBody:
      'Con una semana de 40 horas, el promedio de {mean} por hora da {week} por semana. Con el año de 2,080 horas que usa el BLS para sus cifras anuales, da {year} al año, y la mediana de {median} da {yearMedian} al año.',
    gapAbove:
      'En {state}, el promedio está {gap} por encima de la mediana ({percent} %): un grupo menor de salarios más altos sube el promedio, y la mitad de {plural} gana {median} por hora o menos.',
    gapBelow:
      'En {state}, el promedio está {gap} por debajo de la mediana ({percent} %): un grupo de salarios más bajos baja el promedio, y la mitad de {plural} gana {median} por hora o más.',
    gapSame: 'En {state}, el promedio y la mediana de {plural} coinciden: {median} por hora.',
    nationAbove:
      'El promedio de {state} está {diff} por encima del promedio nacional de {national} ({percent} % más), unos {yearDiff} más al año con 2,080 horas.',
    nationBelow:
      'El promedio de {state} está {diff} por debajo del promedio nacional de {national} ({percent} % menos), unos {yearDiff} menos al año con 2,080 horas.',
    nationSame: 'El promedio de {state} es el mismo que el nacional: {national} por hora.',
    regionH2: '{state} y su división del Censo, {division}',
    regionTop:
      'De los {count} estados de la división con datos para este oficio, {state} paga el promedio más alto, {mean}; le sigue {next} con {nextMean}.',
    regionTopTied:
      '{state} comparte el promedio más alto de la división, {mean}, con {others}, entre los {count} estados con datos para este oficio.',
    regionBottom:
      'De los {count} estados de la división con datos para este oficio, {state} paga el promedio más bajo, {mean}; el siguiente es {next} con {nextMean}.',
    regionBottomTied:
      '{state} comparte el promedio más bajo de la división, {mean}, con {others}, entre los {count} estados con datos para este oficio.',
    regionMiddle:
      'Por salario promedio, {state} está en el lugar {place} de los {count} estados de la división con datos para este oficio: el más alto es {highest}, {highMean}, y el más bajo {lowest}, {lowMean}.',
    regionCaption: 'Salario por hora de {plural} en la división {division}',
    versus: 'Frente a {state}',
    tradesBody:
      'De los {count} oficios que presupuesta este sitio, {plural} están en el lugar {place} de {count} por salario promedio en {state}. Entre ellos, el promedio va de {lowMean} ({lowTrade}) a {highMean} ({highTrade}).',
    tradeColumn: 'Oficio',
    minimumH2: 'Frente al salario mínimo de {state}',
    minimumState:
      'El salario mínimo de {state} es {minimum} por hora para la mayoría de los empleadores. La mediana de {plural}, {median}, está {diff} por encima: {comparison}. Con 2,080 horas, el mínimo da {yearMinimum} al año.',
    minimumFederal:
      'En {state} la mayoría de los empleadores paga el salario mínimo federal, $7.25 por hora. La mediana de {plural}, {median}, está {diff} por encima: {comparison}. Con 2,080 horas, el mínimo da {yearMinimum} al año.',
    minimumTimes: '{ratio} veces el mínimo',
    minimumPercent: '{percent} % más que el mínimo',
    minimumUpstate:
      'Esa es la tarifa de la Ciudad de Nueva York, Long Island y Westchester; en el resto del estado es {upstate}.',
    quoteBody:
      'Si le pagas a un ayudante la mediana de {state}, {median} por hora, las {hours} horas del trabajo de arranque de la calculadora de {trade} cuestan {labor} de salario. Con sus {materials} de materiales, {overhead} % de gastos generales y {profit} % de ganancia, el presupuesto llega a {total}; con la mediana nacional, {nationalMedian}, el mismo trabajo llega a {nationalTotal}. El salario es solo el piso: tu propia tarifa también paga tus impuestos, tus horas sin cobrar y tu negocio.',
    quoteLink: 'Abre la calculadora de {trade} con {median} por hora',
    sourcesH2: 'Fuentes',
    sourceNames: {
      technical:
        'BLS, notas técnicas de las estimaciones OEWS de mayo de 2025 (el año de 2,080 horas)',
      dol: 'Departamento de Trabajo de EE. UU., State Minimum Wage Laws (actualizada el 1 de julio de 2026), leída el {checked}',
      fl: 'Constitución de Florida, artículo X, sección 24 ($15.00 desde el 30 de septiembre de 2026), leída el {checked}',
      census: 'Oficina del Censo de EE. UU., Census Regions and Divisions of the United States',
    },
    and: 'y',
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
    hubSpreadH2: 'Dónde paga más y dónde paga menos cada oficio',
    hubSpread:
      '{trade}: el promedio nacional es {national} por hora. {top} paga el más alto, {topMean}, y {bottom} el más bajo, {bottomMean}: el más alto es {ratio} veces el más bajo.',
    hubReadingH2: 'Cómo leer estas cifras',
    hubReading: [
      'El promedio es el total de los salarios dividido entre los trabajadores; la mediana es el salario del medio, con la mitad de los trabajadores por encima y la mitad por debajo. Cuando unos pocos salarios altos suben el promedio, la mediana describe mejor lo que gana un trabajador típico.',
      'El BLS convierte cada salario por hora en un salario anual con un año típico de 2,080 horas, 40 horas durante 52 semanas. Las páginas de cada estado usan ese mismo año, así que sus cifras anuales se pueden comparar con las del BLS.',
      'Cada página de un estado compara su cifra con la nacional, con los estados de su división del Censo, con los demás oficios del estado y con su salario mínimo, y calcula con nuestra calculadora cuánto cuesta un trabajo pagado a la mediana. Son salarios de empleados: tu tarifa como contratista tiene que ser más alta.',
    ],
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
    othersH2: 'This trade and the others in {state}',
    yearStat: 'Average per year (2,080 h)',
    yearH2: 'By the hour, the week and the year in {state}',
    yearBody:
      'At 40 hours a week, the average of {mean} an hour comes to {week} a week. Over the 2,080-hour year the BLS uses for its annual figures, it comes to {year} a year, and the median of {median} to {yearMedian} a year.',
    gapAbove:
      'In {state}, the average is {gap} above the median ({percent}%): a smaller group of higher wages pulls the average up, and half of {plural} earn {median} an hour or less.',
    gapBelow:
      'In {state}, the average is {gap} below the median ({percent}%): a group of lower wages pulls the average down, and half of {plural} earn {median} an hour or more.',
    gapSame: 'In {state}, the average and the median of {plural} are the same: {median} an hour.',
    nationAbove:
      'The average in {state} is {diff} above the national average of {national} ({percent}% more), about {yearDiff} more a year at 2,080 hours.',
    nationBelow:
      'The average in {state} is {diff} below the national average of {national} ({percent}% less), about {yearDiff} less a year at 2,080 hours.',
    nationSame: 'The average in {state} is the national average: {national} an hour.',
    regionH2: '{state} and its Census division, {division}',
    regionTop:
      'Of the {count} states of the division with data for this trade, {state} pays the highest average, {mean}; next comes {next} with {nextMean}.',
    regionTopTied:
      '{state} shares the highest average of the division, {mean}, with {others}, among the {count} states with data for this trade.',
    regionBottom:
      'Of the {count} states of the division with data for this trade, {state} pays the lowest average, {mean}; the next is {next} with {nextMean}.',
    regionBottomTied:
      '{state} shares the lowest average of the division, {mean}, with {others}, among the {count} states with data for this trade.',
    regionMiddle:
      'By average wage, {state} ranks {place} of the {count} states of the division with data for this trade: the highest is {highest}, {highMean}, and the lowest {lowest}, {lowMean}.',
    regionCaption: 'Hourly wage of {plural} in the {division} division',
    versus: 'Against {state}',
    tradesBody:
      'Of the {count} trades this site prices, {plural} rank {place} of the {count} by average wage in {state}. Among them, the average runs from {lowMean} ({lowTrade}) to {highMean} ({highTrade}).',
    tradeColumn: 'Trade',
    minimumH2: 'Against the minimum wage in {state}',
    minimumState:
      'The minimum wage in {state} is {minimum} an hour for most employers. The median of {plural}, {median}, is {diff} above it, {comparison}. Over 2,080 hours the minimum comes to {yearMinimum} a year.',
    minimumFederal:
      'In {state} most employers pay the federal minimum wage, $7.25 an hour. The median of {plural}, {median}, is {diff} above it, {comparison}. Over 2,080 hours the minimum comes to {yearMinimum} a year.',
    minimumTimes: '{ratio} times the minimum',
    minimumPercent: '{percent}% more than the minimum',
    minimumUpstate:
      'That is the rate of New York City, Long Island and Westchester; the rest of the state pays {upstate}.',
    quoteBody:
      'If you pay a helper the median wage in {state}, {median} an hour, the {hours} hours of the starting job of the {trade} calculator cost {labor} in wages. With its {materials} of materials, {overhead}% overhead and {profit}% profit, the quote comes to {total}; at the national median, {nationalMedian}, the same job comes to {nationalTotal}. A wage is only the floor: your own rate also pays your taxes, your unbilled hours and your business.',
    quoteLink: 'Open the {trade} calculator at {median} an hour',
    sourcesH2: 'Sources',
    sourceNames: {
      technical: 'BLS, Technical Notes for May 2025 OEWS Estimates (the 2,080-hour year)',
      dol: 'U.S. Department of Labor, State Minimum Wage Laws (updated July 1, 2026), read {checked}',
      fl: 'Florida Constitution, Article X, Section 24 ($15.00 from September 30, 2026), read {checked}',
      census: 'U.S. Census Bureau, Census Regions and Divisions of the United States',
    },
    and: 'and',
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
    hubSpreadH2: 'Where each trade pays the most and the least',
    hubSpread:
      '{trade}: the national average is {national} an hour. {top} pays the highest, {topMean}, and {bottom} the lowest, {bottomMean}: the first pays {ratio} times as much.',
    hubReadingH2: 'How to read these figures',
    hubReading: [
      'The average is the total of the wages divided by the workers; the median is the middle wage, with half of the workers above it and half below. When a few high wages pull the average up, the median says more about what a typical worker earns.',
      'The BLS turns each hourly wage into an annual one with a typical work year of 2,080 hours, 40 hours over 52 weeks. The state pages use the same year, so their annual figures compare with the BLS figures.',
      'Each state page compares its figure with the nation, with the states of its Census division, with the other trades of the state and with its minimum wage, and works out with our calculator what a job costs paid at the median. These are wages of employees: your rate as a contractor has to be higher.',
    ],
  },
};
