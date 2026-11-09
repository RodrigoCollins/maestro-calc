import {
  dateOfRule,
  daysFrom,
  isLeapYear,
  nextOccurrence,
  restDayPayOf,
  type CivilDate,
  type DateRule,
} from '@maestro-calc/pay-core/calendar';
import type { LongTailSection, LongTailSource } from '../long-tail/sections.ts';
import { nearestOf } from '../long-tail/nearest.ts';
import { titleOf } from '../seo/meta.ts';
import { dataOfRule } from './live.ts';
import {
  COUNTDOWNS,
  countdownPathOf,
  DAYS_BETWEEN_PATH,
  type CountdownJob,
  type CountdownSlug,
} from './routes.ts';
import {
  countOf,
  DAYS_BETWEEN_NAME,
  longDateOf,
  monthName,
  pesosOf,
  shortDateOf,
  weekdayName,
  weeksTextOf,
} from './words.ts';

/*
 * The page of one dated day people count down to, "cuántos días faltan para Navidad" (Spanish
 * only): a live count from the visitor's own date (`client/countdown.ts`), then what never depends
 * on the day it was built: the date and weekday of each year, the days from the 1st of each month
 * of a fixed year, whether Mexico's federal labor law makes it a mandatory rest day and what working
 * it pays, whether it is a national holiday in Spain, and the day's own story. Every figure comes
 * from the calendar engine; `CountdownPage.astro` renders it.
 */

/** The primary sources of the countdown pages. */
export const DATE_SOURCES = {
  lft: {
    label: 'Ley Federal del Trabajo (México), arts. 74 y 75, Cámara de Diputados',
    href: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/LFT.pdf',
  },
  rd2001: {
    label: 'Real Decreto 2001/1983, art. 45: fiestas laborales (España), BOE',
    href: 'https://www.boe.es/buscar/act.php?id=BOE-A-1983-20366',
  },
  estatuto: {
    label: 'Estatuto de los Trabajadores (España), art. 37, BOE',
    href: 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430',
  },
} as const satisfies Readonly<Record<string, LongTailSource>>;

/** The years of the table of dates, and of Semana Santa, whose dates move. */
const YEARS = [2026, 2027, 2028, 2029, 2030, 2031, 2032];
const EASTER_YEARS = [...YEARS, 2033, 2034, 2035];
/** The fixed year of the table of days from the 1st of each month. */
const CYCLE = 2027;
/** The example daily wages, in pesos, of the table of what working a rest day pays. */
const WAGES = [300, 400, 500, 800];

/** How a day stands in Spain: a national holiday, set by each region, or a working day. */
type SpainStatus = 'national' | 'regional' | 'none';

interface Countdown {
  readonly rule: DateRule;
  /** The day as a sentence names it: `Navidad`, `el Día de Reyes`. */
  readonly name: string;
  /** When it falls, as a sentence says it: `el 25 de diciembre`. */
  readonly when: string;
  readonly description: string;
  readonly lead: string;
  /** Whether Mexico's federal labor law (art. 74) makes it a mandatory rest day. */
  readonly mandatory: boolean;
  /** The day or days the Mexican rest-day sentence speaks of. */
  readonly mxSubject: string;
  readonly spain: SpainStatus;
  readonly spainText: string;
  readonly story: { readonly heading: string; readonly paragraphs: readonly string[] };
}

const fixed = (m: number, d: number): DateRule => ({ kind: 'fixed', m, d });

/** The rule of Domingo de Ramos and of the days of Semana Santa, from Easter Sunday. */
const PALM_SUNDAY: DateRule = { kind: 'easter', offset: -7 };
const HOLY_WEEK = [
  { label: 'Domingo de Ramos', offset: -7 },
  { label: 'Jueves Santo', offset: -3 },
  { label: 'Viernes Santo', offset: -2 },
  { label: 'Domingo de Resurrección', offset: 0 },
] as const;
/** Mother's Day in Spain: the first Sunday of May (weekday 6 is Sunday). */
const SPAIN_MOTHERS: DateRule = { kind: 'nth-weekday', m: 5, weekday: 6, n: 1 };

const firstLeapFrom = (y: number): number => (isLeapYear(y) ? y : firstLeapFrom(y + 1));
const at = (y: number, m: number, d: number): CivilDate => ({ y, m, d });

const COUNTDOWN_DATA: Readonly<Record<CountdownSlug, Countdown>> = {
  'cuantos-dias-faltan-para-ano-nuevo': {
    rule: fixed(1, 1),
    name: 'Año Nuevo',
    when: 'el 1 de enero',
    description:
      'Cuenta regresiva en vivo hasta Año Nuevo, el 1 de enero: días y semanas desde tu fecha, el día de la semana de cada año y qué paga trabajarlo en México.',
    lead: 'Los días que faltan para Año Nuevo, contados desde la fecha de tu dispositivo, con las semanas y el día de la semana en que cae. El 1 de enero es día de descanso obligatorio en México y fiesta nacional en España.',
    mandatory: true,
    mxSubject: 'el 1 de enero',
    spain: 'national',
    spainText:
      'Año Nuevo es fiesta nacional en toda España: el Real Decreto 2001/1983 la incluye entre las fiestas de ámbito nacional, y no la puede cambiar ninguna comunidad autónoma.',
    story: {
      heading: 'Año Nuevo, la Nochevieja y las doce uvas',
      paragraphs: [
        'El Año Nuevo se celebra el 1 de enero, el primer día del calendario gregoriano, que España adoptó en 1582 y con ella sus territorios en América. La noche anterior, el 31 de diciembre, es la Nochevieja: en España se comen doce uvas con las doce campanadas de la medianoche, una costumbre que se hizo popular a principios del siglo XX y que también siguen muchas familias en México y en América Latina.',
        'En México se cena en familia, se escriben los propósitos del año y hay quien sale a la calle con una maleta para pedir viajes en el año que empieza. Como el 1 de enero llega siete días después de Navidad, cae siempre en el mismo día de la semana que el 25 de diciembre anterior.',
      ],
    },
  },
  'cuantos-dias-faltan-para-el-dia-de-reyes': {
    rule: fixed(1, 6),
    name: 'el Día de Reyes',
    when: 'el 6 de enero',
    description:
      '¿Cuánto falta para el Día de Reyes, el 6 de enero? Cuenta regresiva desde tu fecha, la rosca, el día de la semana de cada año y si es festivo.',
    lead: 'Los días que faltan para el Día de Reyes, contados desde la fecha de tu dispositivo. El 6 de enero es fiesta nacional en España; en México no es día de descanso obligatorio, aunque se celebra en casi todas las casas.',
    mandatory: false,
    mxSubject: 'el 6 de enero',
    spain: 'national',
    spainText:
      'La Epifanía del Señor, el 6 de enero, es fiesta nacional en España: está entre las fiestas que fija el Real Decreto 2001/1983, y la mañana del 6 los niños abren los regalos de los Reyes Magos.',
    story: {
      heading: 'Los Reyes Magos y la rosca',
      paragraphs: [
        'El Día de Reyes es la Epifanía: la tradición cristiana recuerda la llegada a Belén de los Reyes Magos, Melchor, Gaspar y Baltasar. En la noche del 5 al 6 de enero los niños dejan sus zapatos junto a la puerta o el árbol para encontrar los regalos por la mañana, y en España la tarde del 5 salen por las calles las cabalgatas de Reyes, que reparten caramelos.',
        'Ese día se comparte la rosca de Reyes, en España el roscón: un pan dulce en forma de anillo, con fruta cristalizada, que esconde una o varias figuras del Niño Dios.',
      ],
    },
  },
  'cuantos-dias-faltan-para-el-14-de-febrero': {
    rule: fixed(2, 14),
    name: 'el 14 de febrero',
    when: 'el 14 de febrero',
    description:
      '¿Cuántos días faltan para el 14 de febrero, Día del Amor y la Amistad? Cuenta regresiva en vivo desde tu fecha y el día de la semana de cada año.',
    lead: 'Los días que faltan para el 14 de febrero, San Valentín o Día del Amor y la Amistad, contados desde la fecha de tu dispositivo. No es día de descanso en México ni festivo en España: es un día de trabajo normal.',
    mandatory: false,
    mxSubject: 'el 14 de febrero',
    spain: 'none',
    spainText:
      'San Valentín no es festivo en España: no está entre las fiestas del Real Decreto 2001/1983 ni la declara fiesta ninguna comunidad autónoma, así que el 14 de febrero se trabaja con normalidad si cae entre semana.',
    story: {
      heading: 'San Valentín, el Día del Amor y la Amistad',
      paragraphs: [
        'El 14 de febrero es el Día de San Valentín, que en México se llama también Día del Amor y la Amistad: además de las parejas se celebra a los amigos, y en escuelas y oficinas se intercambian cartas, globos, dulces y flores. En España se le conoce como San Valentín o el día de los enamorados, y las floristerías tienen su semana más fuerte del invierno.',
        'La fecha recuerda a Valentín, un mártir romano del siglo III; su unión con el amor viene de la literatura inglesa y francesa de la Edad Media, que la ligaba con el momento en que se emparejaban las aves.',
      ],
    },
  },
  'cuantos-dias-faltan-para-semana-santa': {
    rule: PALM_SUNDAY,
    name: 'Semana Santa',
    when: 'el Domingo de Ramos',
    description:
      'Cuántos días faltan para Semana Santa desde tu fecha, hasta el Domingo de Ramos, con el Jueves y el Viernes Santo de 2026 a 2035 y por qué cambia.',
    lead: 'Los días que faltan para que empiece la Semana Santa, el Domingo de Ramos, contados desde la fecha de tu dispositivo. Su fecha cambia cada año porque sigue a la Luna; la tabla da cada día de la semana mayor hasta 2035.',
    mandatory: false,
    mxSubject: 'ni el Jueves ni el Viernes Santo',
    spain: 'regional',
    spainText:
      'En España el Viernes Santo es fiesta nacional en todo el país. El Jueves Santo lo fija cada comunidad autónoma en su calendario laboral, y el Lunes de Pascua es festivo solo en algunas, como Cataluña o la Comunidad Valenciana.',
    story: {
      heading: 'Por qué la Semana Santa cambia de fecha',
      paragraphs: [
        'La Semana Santa empieza el Domingo de Ramos y termina el Domingo de Resurrección, o de Pascua: la cuenta de esta página llega al Domingo de Ramos, el primer día. El Jueves y el Viernes Santo recuerdan la Última Cena y la crucifixión, y en México y en España son días de procesiones; en México la SEP da a las escuelas vacaciones alrededor de ella.',
        'Su fecha sigue a la Luna. El Domingo de Pascua es el primer domingo después de la luna llena eclesiástica que cae el 21 de marzo o después, una regla que se atribuye al Concilio de Nicea, del año 325, y que la reforma gregoriana de 1582 dejó con sus tablas actuales. Por eso Pascua cae entre el 22 de marzo y el 25 de abril, y esta página calcula cada año con el algoritmo de ese cómputo, sin copiar fechas de una lista.',
      ],
    },
  },
  'cuantos-dias-faltan-para-el-dia-de-las-madres': {
    rule: fixed(5, 10),
    name: 'el Día de las Madres',
    when: 'el 10 de mayo',
    description:
      'Cuenta regresiva al Día de las Madres desde tu fecha: el 10 de mayo de México y el primer domingo de mayo de España, año por año.',
    lead: 'Los días que faltan para el Día de las Madres de México, el 10 de mayo, contados desde la fecha de tu dispositivo. En España el Día de la Madre es otro, el primer domingo de mayo: la tabla da los dos.',
    mandatory: false,
    mxSubject: 'el 10 de mayo',
    spain: 'none',
    spainText:
      'En España el Día de la Madre no es festivo porque cae siempre en domingo, el primero de mayo; el 1 de mayo, Fiesta del Trabajo, sí es fiesta nacional, y algunos años es el mismo día.',
    story: {
      heading: 'El 10 de mayo en México y el primer domingo en España',
      paragraphs: [
        'En México el Día de las Madres es siempre el 10 de mayo, caiga en el día de la semana que caiga; se celebra desde 1922, cuando el periódico Excélsior promovió la fecha. Las escuelas preparan festivales, se llevan serenatas con mariachi la noche del 9 o la mañana del 10, y es uno de los días con más reservas en los restaurantes.',
        'En España el Día de la Madre se celebra el primer domingo de mayo, así que cambia de fecha cada año, y muchos países de América, como Estados Unidos, lo celebran el segundo domingo de mayo. En México muchas empresas organizan un convivio o dan la tarde libre a las trabajadoras que son madres, aunque la ley no lo exige.',
      ],
    },
  },
  'cuantos-dias-faltan-para-el-16-de-septiembre': {
    rule: fixed(9, 16),
    name: 'el 16 de septiembre',
    when: 'el 16 de septiembre',
    description:
      '¿Cuántos días faltan para el 16 de septiembre, Día de la Independencia? Cuenta regresiva desde tu fecha y el pago triple si lo trabajas (LFT).',
    lead: 'Los días que faltan para el 16 de septiembre, Día de la Independencia de México, contados desde la fecha de tu dispositivo. Es día de descanso obligatorio: si lo trabajas, la ley te paga el triple.',
    mandatory: true,
    mxSubject: 'el 16 de septiembre',
    spain: 'none',
    spainText:
      'El 16 de septiembre no es festivo en España: es una fiesta patria de México, y ninguna de las fiestas nacionales del Real Decreto 2001/1983 cae en septiembre.',
    story: {
      heading: 'El Grito de Dolores y las fiestas patrias',
      paragraphs: [
        'El 16 de septiembre es el Día de la Independencia de México: recuerda la madrugada de 1810 en que el cura Miguel Hidalgo llamó a la rebelión en Dolores, Guanajuato, el llamado Grito de Dolores. La noche del 15 el presidente repite el Grito desde el balcón de Palacio Nacional, y gobernadores y presidentes municipales lo dan en sus plazas; el 16 hay desfile militar en la Ciudad de México.',
        'La guerra de Independencia duró once años y terminó en 1821. Las fiestas patrias llenan septiembre de banderas, pozole y chiles en nogada, y por eso se le llama el mes de la patria.',
      ],
    },
  },
  'cuantos-dias-faltan-para-el-dia-de-muertos': {
    rule: fixed(11, 2),
    name: 'el Día de Muertos',
    when: 'el 2 de noviembre',
    description:
      'Cuenta regresiva al Día de Muertos, el 2 de noviembre, desde tu fecha: días, semanas, el día de la semana de cada año y si se descansa en México.',
    lead: 'Los días que faltan para el Día de Muertos, el 2 de noviembre, contados desde la fecha de tu dispositivo. No es día de descanso obligatorio en México, aunque muchas escuelas y oficinas públicas cierran.',
    mandatory: false,
    mxSubject: 'ni el 1 ni el 2 de noviembre',
    spain: 'none',
    spainText:
      'En España el 2 de noviembre no es festivo; el día anterior, el 1 de noviembre, Todos los Santos, sí es fiesta nacional según el Real Decreto 2001/1983, y muchas familias visitan entonces los cementerios.',
    story: {
      heading: 'Ofrendas, cempasúchil y pan de muerto',
      paragraphs: [
        'El Día de Muertos se celebra el 1 y el 2 de noviembre: según la tradición, el 1 llegan las almas de los niños, los angelitos, y el 2 las de los adultos. Las familias arman ofrendas con fotos, velas, flores de cempasúchil, papel picado, pan de muerto, calaveritas de azúcar y la comida favorita de sus difuntos, y visitan y adornan las tumbas en los panteones.',
        'La UNESCO proclamó las fiestas indígenas dedicadas a los muertos obra maestra del patrimonio oral e inmaterial en 2003 y las inscribió en su lista en 2008. Esta página cuenta hasta el 2 de noviembre, el día principal.',
      ],
    },
  },
  'cuantos-dias-faltan-para-navidad': {
    rule: fixed(12, 25),
    name: 'Navidad',
    when: 'el 25 de diciembre',
    description:
      '¿Cuántos días faltan para Navidad? Cuenta regresiva en vivo hasta el 25 de diciembre desde tu fecha, con semanas, el día de cada año y el pago si trabajas.',
    lead: 'Los días que faltan para Navidad, contados desde la fecha de tu dispositivo, con las semanas y el día de la semana en que cae. El 25 de diciembre es día de descanso obligatorio en México y fiesta nacional en España.',
    mandatory: true,
    mxSubject: 'el 25 de diciembre',
    spain: 'national',
    spainText:
      'Navidad es fiesta nacional en toda España: el Real Decreto 2001/1983 la fija como fiesta de ámbito nacional que ninguna comunidad autónoma puede sustituir, y el 24, Nochebuena, es día laborable.',
    story: {
      heading: 'Las posadas, la Nochebuena y El Gordo',
      paragraphs: [
        'La Navidad recuerda el nacimiento de Jesús. En México la temporada empieza con las posadas, del 16 al 24 de diciembre: nueve noches de procesiones, villancicos, ponche y piñatas que recuerdan el camino de José y María a Belén. La cena principal es la Nochebuena, la noche del 24.',
        'En España la lotería de Navidad, El Gordo, se sortea el 22 de diciembre, y la temporada sigue hasta el Día de Reyes: los regalos llegan el 25 con Papá Noel o el 6 de enero con los Reyes Magos, según la familia.',
      ],
    },
  },
};

/** A sentence of a day's own figures, worked out by the engine, added to its story. */
const extraOf = (slug: CountdownSlug): string | null => {
  if (slug === 'cuantos-dias-faltan-para-el-dia-de-reyes') {
    const candlemas = daysFrom(at(CYCLE, 1, 6), at(CYCLE, 2, 2));
    return `En México quien encuentra el muñeco invita los tamales del 2 de febrero, Día de la Candelaria, que llega ${countOf(candlemas, 'día', 'días')} después de Reyes.`;
  }
  if (slug === 'cuantos-dias-faltan-para-el-14-de-febrero') {
    const leap = firstLeapFrom(CYCLE);
    return `En un año bisiesto, como ${String(leap)}, febrero tiene 29 días, pero el 14 no se mueve: en ${String(leap)} cae en ${weekdayName(at(leap, 2, 14))}.`;
  }
  if (slug === 'cuantos-dias-faltan-para-navidad') {
    const posadas = daysFrom(at(CYCLE, 12, 16), at(CYCLE, 12, 25));
    return `La primera posada, el 16, queda ${countOf(posadas, 'día', 'días')} antes de Navidad.`;
  }
  return null;
};

/** The date and weekday of the day in each year, the days of Semana Santa when it is that page. */
const yearsSectionOf = (slug: CountdownSlug, day: Countdown): LongTailSection => {
  const heading = `¿Cuándo es ${day.name}? Fechas de ${String(YEARS[0])} a ${String(YEARS.at(-1))}`;
  if (slug === 'cuantos-dias-faltan-para-semana-santa') {
    return {
      id: 'years',
      heading: `Fechas de Semana Santa de ${String(EASTER_YEARS[0])} a ${String(EASTER_YEARS.at(-1))}`,
      paragraphs: [
        'Cada fecha sale del cómputo de Pascua de esta página: el Jueves Santo es tres días antes del Domingo de Resurrección, el Viernes Santo dos, y el Domingo de Ramos una semana.',
      ],
      table: {
        caption: 'Los días de Semana Santa de cada año',
        head: ['Año', ...HOLY_WEEK.map(({ label }) => label)],
        rows: EASTER_YEARS.map((y) => [
          String(y),
          ...HOLY_WEEK.map(({ offset }) =>
            shortDateOf(dateOfRule({ kind: 'easter', offset }, y)),
          ),
        ]),
      },
    };
  }
  if (slug === 'cuantos-dias-faltan-para-el-dia-de-las-madres') {
    return {
      id: 'years',
      heading,
      paragraphs: [
        'México lo celebra siempre el 10 de mayo; España, el primer domingo de mayo, que cambia de fecha cada año.',
      ],
      table: {
        caption: 'El Día de las Madres de México y el Día de la Madre de España, por año',
        head: ['Año', 'México: 10 de mayo', 'España: primer domingo de mayo'],
        rows: YEARS.map((y) => [
          String(y),
          weekdayName(dateOfRule(day.rule, y)),
          shortDateOf(dateOfRule(SPAIN_MOTHERS, y)),
        ]),
      },
    };
  }
  return {
    id: 'years',
    heading,
    paragraphs: [
      `${capitalOf(day.name)} cae siempre ${day.when}; lo que cambia de un año a otro es el día de la semana.`,
    ],
    table: {
      caption: `${capitalOf(day.name)} en cada año`,
      head: ['Año', 'Fecha', 'Día de la semana'],
      rows: YEARS.map((y) => {
        const date = dateOfRule(day.rule, y);
        return [String(y), shortDateOf(date), weekdayName(date)];
      }),
    },
  };
};

const capitalOf = (text: string): string => `${text.charAt(0).toUpperCase()}${text.slice(1)}`;

/** The days from the 1st of each month of the fixed year to the next date of the day. */
const monthsSectionOf = (day: Countdown): LongTailSection => ({
  id: 'months',
  heading: `Días que faltan desde el 1 de cada mes de ${String(CYCLE)}`,
  paragraphs: [
    `Si quieres saber cuánto faltaba o faltará desde otra fecha, esta tabla cuenta desde el 1 de cada mes de ${String(CYCLE)} hasta ${day.when} siguiente. Para cualquier otro par de fechas usa la calculadora de días entre fechas.`,
  ],
  table: {
    caption: `Del 1 de cada mes de ${String(CYCLE)} a ${day.name}`,
    head: ['Desde', 'Hasta', 'Días', 'Semanas y días'],
    rows: Array.from({ length: 12 }, (_, i) => {
      const from = at(CYCLE, i + 1, 1);
      const { date, days } = nextOccurrence(day.rule, from);
      return [`1 de ${monthName(i + 1)}`, longDateOf(date), String(days), weeksTextOf(days)];
    }),
  },
});

const LFT_DAYS =
  'La Ley Federal del Trabajo (art. 74) fija los días de descanso obligatorio: el 1 de enero, el primer lunes de febrero, el tercer lunes de marzo, el 1 de mayo, el 16 de septiembre, el tercer lunes de noviembre, el 1 de octubre de cada seis años con el cambio del Poder Ejecutivo Federal, el 25 de diciembre y el día de las elecciones ordinarias.';

const mexicoSectionOf = (day: Countdown): LongTailSection => ({
  id: 'mexico',
  heading: `¿Se descansa ${day.when} en México?`,
  paragraphs: [
    LFT_DAYS,
    day.mandatory
      ? `${capitalOf(day.mxSubject)} es uno de ellos: ese día descansas con tu salario completo, y tu patrón solo puede pedirte que trabajes si lo acuerdan.`
      : `${capitalOf(day.mxSubject)} ${day.mxSubject.startsWith('ni ') ? 'están en esa lista: son días laborales normales' : 'no está en esa lista: es un día laboral normal'}, salvo que tu empresa, tu contrato individual o el contrato colectivo te lo den libre.`,
  ],
});

const spainSectionOf = (day: Countdown): LongTailSection => ({
  id: 'spain',
  heading: `¿Es festivo ${day.when} en España?`,
  paragraphs: [
    day.spainText,
    'Las fiestas de cada año salen en el calendario laboral que publica el BOE: el Estatuto de los Trabajadores (art. 37) permite hasta catorce al año, dos de ellas locales, y cada comunidad autónoma puede cambiar algunas nacionales por las suyas.',
  ],
});

const paySectionOf = (day: Countdown): LongTailSection => {
  if (!day.mandatory)
    return {
      id: 'pay',
      heading: `Si trabajas ${day.when} en México`,
      paragraphs: [
        `Como ${day.mxSubject.startsWith('ni ') ? `${day.mxSubject.replace(/^ni /, '').replace(' ni ', ' y ')} no son días` : `${day.mxSubject} no es día`} de descanso obligatorio, trabajarlo se paga como un día laboral normal. Si cae en domingo, la ley (art. 71) da a quien trabaja en domingo una prima de al menos el 25 % de su salario del día.`,
      ],
    };
  return {
    id: 'pay',
    heading: `Cuánto te pagan si trabajas ${day.when} en México`,
    paragraphs: [
      'Si trabajas un día de descanso obligatorio, el art. 75 de la Ley Federal del Trabajo te da, además del salario de ese día, que se te debe aunque descanses, un salario doble por el servicio: en total, el triple de un día normal. Estos son ejemplos con salarios diarios comunes, en pesos.',
    ],
    table: {
      caption: `El pago por trabajar ${day.when}, según el salario diario`,
      head: ['Salario diario', 'Salario del día', 'Salario doble', 'Total'],
      rows: WAGES.map((pesos) => {
        const pay = restDayPayOf(pesos * 100);
        return [pesosOf(pesos * 100), pesosOf(pay.wage), pesosOf(pay.double), pesosOf(pay.total)];
      }),
    },
  };
};

export interface CountdownPage {
  readonly title: string;
  readonly description: string;
  readonly kicker: string;
  readonly h1: string;
  readonly lead: string;
  readonly figureLabel: string;
  /** What the page shows with no script: the date, never a count from the build date. */
  readonly fallback: { readonly days: string; readonly weeks: string; readonly date: string };
  readonly labels: { readonly weeks: string; readonly date: string };
  /** The rule of the live count, as the `data-*` attributes of the script carry it. */
  readonly data: Readonly<Record<string, string>>;
  readonly note: string;
  readonly calculator: { readonly href: string; readonly label: string; readonly title: string };
  readonly paths: { readonly es: string };
  readonly sections: readonly LongTailSection[];
  readonly sources: readonly LongTailSource[];
  readonly others: {
    readonly heading: string;
    readonly links: readonly { readonly href: string; readonly label: string }[];
  };
}

/** The question a countdown answers, its `h1` and the label of the links to it. */
export const countdownQuestionOf = (job: CountdownJob): string =>
  `¿Cuántos días faltan para ${COUNTDOWN_DATA[job.slug].name}?`;

/** The links to every countdown, in the order of the year. */
export const countdownLinks = (): readonly { readonly href: string; readonly label: string }[] =>
  COUNTDOWNS.map((job) => ({ href: countdownPathOf(job), label: countdownQuestionOf(job) }));

export const countdownPageOf = (job: CountdownJob): CountdownPage => {
  const day = COUNTDOWN_DATA[job.slug];
  const h1 = countdownQuestionOf(job);
  const extra = extraOf(job.slug);
  return {
    title: titleOf(h1),
    description: day.description,
    kicker: 'Cuenta regresiva · fechas',
    h1,
    lead: day.lead,
    figureLabel: `Días que faltan para ${day.name}`,
    fallback: {
      days: capitalOf(day.when),
      weeks: 'Se cuentan con la fecha de tu dispositivo',
      date: `${capitalOf(day.when)} de cada año`,
    },
    labels: { weeks: 'Semanas y días', date: 'Fecha' },
    data: dataOfRule(day.rule),
    note: 'La cuenta usa la fecha de tu dispositivo y cambia a la medianoche de tu zona horaria.',
    calculator: {
      href: DAYS_BETWEEN_PATH,
      label: 'Cuenta los días entre otras dos fechas',
      title: DAYS_BETWEEN_NAME,
    },
    paths: { es: countdownPathOf(job) },
    sections: [
      {
        id: 'story',
        heading: day.story.heading,
        paragraphs: extra === null ? day.story.paragraphs : [...day.story.paragraphs, extra],
      },
      yearsSectionOf(job.slug, day),
      monthsSectionOf(day),
      mexicoSectionOf(day),
      paySectionOf(day),
      spainSectionOf(day),
    ],
    sources: Object.values(DATE_SOURCES),
    others: {
      heading: 'Otras cuentas regresivas',
      links: [
        ...nearestOf(COUNTDOWNS, job).map((other) => ({
          href: countdownPathOf(other),
          label: countdownQuestionOf(other),
        })),
        { href: DAYS_BETWEEN_PATH, label: DAYS_BETWEEN_NAME },
      ],
    },
  };
};
