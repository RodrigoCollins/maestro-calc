import type { Lang } from '../routes.ts';

/** A source a page cites: its name, its address when it has one, and the day we read it. */
export interface Source {
  readonly name: string;
  readonly url?: string;
  readonly accessed: string;
}

/** What a block draws besides its text: a table the code works out, so it cannot drift from the formulas. */
export type Generated = 'cases' | 'markup-table' | 'margin-table' | 'rate-example';

export interface Block {
  readonly h2: string;
  readonly id?: string;
  readonly paragraphs?: readonly string[];
  readonly list?: readonly string[];
  readonly generated?: Generated;
  readonly after?: readonly string[];
}

export interface Article {
  readonly title: string;
  readonly description: string;
  readonly h1: string;
  readonly lead: string;
  /** The day the page was last reviewed (`YYYY-MM-DD`). */
  readonly checked: string;
  readonly sources: readonly Source[];
  readonly blocks: readonly Block[];
}

export type ArticleId =
  | 'quote-guide'
  | 'markup-guide'
  | 'rate-guide'
  | 'methodology'
  | 'about'
  | 'editorial'
  | 'privacy';

const CHECKED = '2026-11-08';
export const CONTACT_EMAIL = 'hola@cuantolecobro.com';

const BLS: Source = {
  name: 'U.S. Bureau of Labor Statistics, Occupational Employment and Wage Statistics (OEWS), May 2025 state estimates',
  url: 'https://www.bls.gov/oes/',
  accessed: CHECKED,
};
const BLS_API: Source = {
  name: 'U.S. Bureau of Labor Statistics, Public Data API, version 1 (OEWS series)',
  url: 'https://www.bls.gov/developers/',
  accessed: CHECKED,
};
const IRS: Source = {
  name: 'IRS, Topic no. 554, Self-employment tax',
  url: 'https://www.irs.gov/taxtopics/tc554',
  accessed: CHECKED,
};
const PAINT_SOURCE: Source = {
  name: 'Sherwin-Williams, Quali-Kote Interior Latex, Product Data Sheet (July 2020), coverage 350 to 400 sq ft per gallon',
  url: 'https://www.sherwin-williams.com/document/PDS/en/035777853146/',
  accessed: '2026-10-30',
};
const USG_COMPOUND: Source = {
  name: 'USG, Sheetrock UltraLightweight All Purpose Joint Compound coverage (FAQ)',
  url: 'https://assemblies-tools.usg.com/content/usgcom/en/resource-center/faqs/1977.html',
  accessed: '2026-10-30',
};
const QUIKRETE: Source = {
  name: 'QUIKRETE, Concrete Mix No. 1101 data sheet, revised October 2022',
  url: 'https://www.quikrete.com/PDFs/DATA_SHEET-Concrete%20Mix%201101.pdf',
  accessed: '2026-10-25',
};
const NIST: Source = {
  name: 'NIST Special Publication 811, Appendix B (conversion factors)',
  url: 'https://www.nist.gov/pml/special-publication-811',
  accessed: '2026-10-30',
};

export const ARTICLES: Readonly<Record<Lang, Readonly<Record<ArticleId, Article>>>> = {
  es: {
    'quote-guide': {
      title: 'Cómo armar un presupuesto: mano de obra, materiales y ganancia',
      description:
        'Las cuatro partes de un presupuesto, con un ejemplo con números y la fórmula, para cobrar sin adivinar.',
      h1: 'Cómo armar un presupuesto',
      lead: 'Un presupuesto claro tiene cuatro partes. Cuando las separas, cobrar deja de ser adivinar y el cliente entiende por qué.',
      checked: CHECKED,
      sources: [],
      blocks: [
        {
          h2: 'Las cuatro partes',
          paragraphs: [
            'Mano de obra: las horas de cada trabajador por el número de trabajadores por tu tarifa por hora. Si prefieres cobrar por pie cuadrado, es el área del trabajo por tu precio por pie cuadrado.',
            'Materiales: lo que compras para el trabajo (pintura, hojas de drywall, bolsas de concreto, mantillo, productos de limpieza), a tu precio de compra.',
            'Costos generales: lo que cuesta mantener tu negocio y no es mano de obra ni material, como el vehículo, el seguro, las herramientas y el tiempo que gastas en cotizar. Se calcula como un porcentaje de la mano de obra más los materiales.',
            'Ganancia: lo que quieres ganar sobre todo el costo anterior. Se calcula como un porcentaje del subtotal más los costos generales.',
          ],
        },
        {
          h2: 'Un ejemplo con números',
          paragraphs: [
            'Estas cifras son de ejemplo, para mostrar la cuenta; cámbialas por las tuyas. Un cuarto de 12 × 12 pies con paredes de 8 pies, una puerta, dos ventanas y dos manos de pintura necesita 334 pies cuadrados de pared por mano; con 350 pies cuadrados por galón salen 1.91 galones, o sea 2 latas de un galón.',
          ],
          list: [
            'Mano de obra: 8 horas × 1 persona × $25.00 por hora = $200.00.',
            'Materiales: 2 galones × $40.00 = $80.00.',
            'Subtotal: $200.00 + $80.00 = $280.00.',
            'Costos generales al 10 %: $280.00 × 0.10 = $28.00.',
            'Ganancia al 15 %: ($280.00 + $28.00) × 0.15 = $46.20.',
            'Total: $280.00 + $28.00 + $46.20 = $354.20.',
          ],
          after: [
            'Cada línea se redondea al centavo y el total es la suma de las líneas redondeadas, así que el presupuesto impreso siempre cuadra.',
          ],
        },
        {
          h2: 'Por hora, por pie cuadrado o precio fijo',
          paragraphs: [
            'Por hora protege tu tiempo cuando no sabes cuánto va a tardar el trabajo. Por pie cuadrado es fácil de explicar y de comparar, pero solo funciona si conoces tu propio ritmo. Un precio fijo es lo que el cliente suele querer oír; el truco es llegar a ese número con la cuenta de arriba y no al revés.',
            'La calculadora acepta hora y pie cuadrado. En los dos casos el precio es el tuyo: no publicamos tarifas de mercado porque cambian por ciudad, por cliente y por temporada, y una cifra inventada te haría cobrar mal.',
          ],
        },
        {
          h2: 'Qué poner en el presupuesto escrito',
          list: [
            'Qué trabajo incluye y qué no incluye.',
            'La mano de obra y los materiales por separado, con las cantidades.',
            'El total y cómo y cuándo se paga.',
            'Hasta cuándo vale el precio y cuándo empiezas.',
          ],
          after: [
            'Con el botón verde de la calculadora mandas todo esto por WhatsApp, y con el botón de imprimir sacas una hoja o un PDF.',
          ],
        },
        {
          h2: 'Lo que la calculadora no hace',
          paragraphs: [
            'No suma impuestos de venta, permisos ni licencias: cambian por estado y por oficio, y un renglón equivocado es peor que ninguno. Si los cobras, agrégalos aparte antes de mandar el presupuesto.',
          ],
        },
      ],
    },
    'markup-guide': {
      title: 'Recargo o margen: por qué 20 % no es lo mismo en los dos',
      description:
        'El recargo se calcula sobre el costo y el margen sobre el precio. Fórmulas, tablas y un ejemplo para no ganar menos de lo que crees.',
      h1: 'Recargo o margen',
      lead: 'Sumar 20 % al costo no deja 20 % de ganancia en el precio. Son dos porcentajes distintos y confundirlos te hace ganar menos de lo que crees.',
      checked: CHECKED,
      sources: [],
      blocks: [
        {
          h2: 'Las dos definiciones',
          list: [
            'Recargo (markup): la ganancia como porcentaje del costo. Precio = costo × (1 + recargo).',
            'Margen: la ganancia como porcentaje del precio. Precio = costo ÷ (1 − margen).',
          ],
          after: [
            'Un ejemplo: con un costo de $1,000 y un recargo de 25 %, el precio es $1,250 y la ganancia es $250, que es 20 % del precio. Es un recargo de 25 % y un margen de 20 %.',
            'Si solo le sumas 20 % al costo, el precio es $1,200 y la ganancia $200, que es 16.67 % del precio. Querías 20 % y te quedaste con 16.67 %.',
          ],
        },
        {
          h2: 'De recargo a margen',
          paragraphs: ['Margen = recargo ÷ (1 + recargo).'],
          generated: 'markup-table',
        },
        {
          h2: 'De margen a recargo',
          paragraphs: ['Recargo = margen ÷ (1 − margen).'],
          generated: 'margin-table',
        },
        {
          h2: 'Qué usa la calculadora',
          paragraphs: [
            'El campo Ganancia (%) de las calculadoras es un recargo: se calcula sobre el subtotal más los costos generales. Si piensas en margen, usa la segunda tabla para encontrar el recargo que lo da. Los porcentajes son los que tú escribes; no hay uno correcto para todos.',
          ],
        },
      ],
    },
    'rate-guide': {
      title: 'Cómo fijar tu tarifa por hora: la cuenta paso a paso',
      description:
        'Cuánto necesitas ganar, cuántas horas puedes cobrar de verdad y qué parte se va en impuestos y costos: la fórmula de tu tarifa.',
      h1: 'Cómo fijar tu tarifa por hora',
      lead: 'Tu tarifa no es lo que gana un empleado: tiene que pagar tus costos, tus impuestos y las horas en que no cobras. Esta es la cuenta.',
      checked: CHECKED,
      sources: [IRS, BLS],
      blocks: [
        {
          h2: 'La fórmula',
          paragraphs: [
            'Tarifa por hora = (lo que quieres ganar al año + los costos de tu negocio al año) ÷ las horas que de verdad puedes cobrar al año.',
            'Las horas que cobras son menos que las que trabajas: manejar, cotizar, comprar material y esperar no se cobran. Cuéntalas con tus propios números, por ejemplo las semanas que trabajas al año por las horas cobrables de cada semana.',
          ],
        },
        {
          h2: 'Un ejemplo con números inventados',
          paragraphs: [
            'Estos números no son una recomendación; solo muestran la cuenta. Cámbialos por los tuyos.',
          ],
          generated: 'rate-example',
        },
        {
          h2: 'Los impuestos de quien trabaja por su cuenta',
          paragraphs: [
            'Quien trabaja por su cuenta paga el impuesto de trabajo por cuenta propia: 12.4 % para el Seguro Social más 2.9 % para Medicare, 15.3 % en total. Normalmente se debe pagar si las ganancias netas del trabajo por cuenta propia son de $400 o más (IRS, Tema 554).',
            'Cuando calcules cuánto necesitas ganar, piensa en lo que te queda después de impuestos y deja ese margen en la cuenta. Para saber cuánto pagar, habla con un contador.',
          ],
        },
        {
          h2: 'Compara con lo que pagan los empleadores',
          paragraphs: [
            'El Departamento de Trabajo de EE. UU. publica el salario por hora que los empleadores pagan en cada oficio y estado. Es un punto de referencia, no un precio: tu tarifa también cubre los costos generales y la ganancia.',
          ],
        },
      ],
    },
    methodology: {
      title: 'Metodología: fórmulas, fuentes y casos verificados',
      description:
        'Cómo se calcula cada presupuesto, de dónde sale cada número, y los casos verificados a mano que las pruebas corren en la calculadora.',
      h1: 'Metodología',
      lead: 'Aquí está cada fórmula, cada fuente con su dirección y la fecha en que la leímos, y los casos verificados a mano. Nada de lo que ves en un presupuesto es un precio de mercado: son tus números.',
      checked: CHECKED,
      sources: [BLS, BLS_API, PAINT_SOURCE, USG_COMPOUND, QUIKRETE, NIST],
      blocks: [
        {
          h2: 'El presupuesto',
          id: 'presupuesto',
          list: [
            'Mano de obra por hora = horas × trabajadores × tarifa por hora.',
            'Mano de obra por pie cuadrado = área del trabajo × tu precio por pie cuadrado.',
            'Materiales = unidades enteras (latas, hojas, bolsas) × tu precio por unidad.',
            'Subtotal = mano de obra + materiales.',
            'Costos generales = subtotal × porcentaje.',
            'Ganancia = (subtotal + costos generales) × porcentaje.',
            'Total = subtotal + costos generales + ganancia.',
          ],
          after: [
            'La mano de obra, los materiales, los costos generales y la ganancia se redondean al centavo (media centavo hacia arriba) y el total es la suma de las líneas redondeadas. Las cantidades de material se redondean siempre hacia arriba a unidades enteras.',
            'Las cifras con las que arrancan los campos (8 horas, $25 por hora, 10 % y 15 %, los precios de la pintura, las hojas y las bolsas) son un ejemplo para que el primer presupuesto se lea; no son precios ni recomendaciones.',
          ],
        },
        {
          h2: 'Los materiales',
          id: 'materiales',
          paragraphs: [
            'Las cantidades salen de las calculadoras de Maestro Calc, que explica su metodología en maestrocalc.com/methodology. Las repetimos aquí con sus fuentes.',
          ],
          list: [
            'Pintura: las cuatro paredes menos 20 pies² por puerta y 15 pies² por ventana, a 350 pies² por galón y por mano, el extremo bajo de los 350 a 400 de la hoja técnica de Sherwin-Williams (julio de 2020). Latas de un galón, hacia arriba.',
            'Drywall: el área de paredes (y techo si lo incluyes) menos puertas y ventanas, con el desperdicio que escribes, entre 32 pies² (hoja de 4 × 8) o 48 pies² (4 × 12), hacia arriba.',
            'Concreto: largo × ancho × grosor más el desperdicio, entre lo que rinde una bolsa: 0.30, 0.45 o 0.60 pies³ para 40, 60 y 80 libras, de la hoja técnica de QUIKRETE No. 1101 (octubre de 2022). Hacia arriba.',
            'Jardín: largo × ancho × profundidad más el desperdicio, entre el volumen impreso en la bolsa (1.5, 2 o 3 pies³), hacia arriba. Un pie cúbico se calcula con las conversiones exactas del NIST SP 811.',
            'Limpieza: no se calcula ninguna cantidad; los productos son tu cifra.',
          ],
        },
        {
          h2: 'Los salarios por estado',
          id: 'salarios',
          paragraphs: [
            'Las páginas de salarios usan el salario por hora medio y mediano de las estimaciones estatales de mayo de 2025 de la Encuesta de Estadísticas de Empleo y Salarios por Ocupación (OEWS) del Departamento de Trabajo de EE. UU. (BLS). Las ocupaciones son: 37-2012 empleados de limpieza y amas de llaves, 47-2141 pintores de construcción y mantenimiento, 47-2081 instaladores de drywall y de losetas de techo, 47-2051 albañiles de cemento y acabadores de concreto, y 37-3011 trabajadores de jardinería y mantenimiento de terrenos.',
            'Los números se bajan con el script apps/cobro/scripts/fetch-wages.ts de la API pública de BLS (versión 1, series OEUS…03 para el salario medio por hora y OEUS…08 para la mediana) y se guardan sin texto. Si BLS no publica una de las dos cifras para un estado y una ocupación, esa página no existe.',
            'Un salario es lo que un empleador paga a un empleado. No es lo que cobra un contratista: la tarifa también cubre los costos generales y la ganancia.',
          ],
        },
        {
          h2: 'Casos verificados a mano',
          id: 'casos',
          paragraphs: [
            'Cada caso se calculó a mano con las fórmulas de arriba. Las pruebas automáticas corren los mismos casos en la calculadora y comparan cada cifra, así que esta tabla no puede quedar distinta de lo que ves en el sitio.',
          ],
          generated: 'cases',
        },
        {
          h2: 'Fuentes y fechas',
          id: 'fuentes',
          paragraphs: [
            'Las fuentes de abajo muestran la fecha en que las leímos. La revisión de esta página es del 8 de noviembre de 2026.',
          ],
        },
      ],
    },
    about: {
      title: 'Acerca de Cuánto Le Cobro',
      description:
        'Quiénes somos, para quién es este sitio y por qué no publicamos precios de mercado: tú pones tus números y la cuenta es exacta.',
      h1: 'Acerca de Cuánto Le Cobro',
      lead: 'Cuánto Le Cobro es un sitio de calculadoras de presupuestos para quienes trabajan en limpieza, pintura, drywall, concreto y jardinería en Estados Unidos.',
      checked: CHECKED,
      sources: [],
      blocks: [
        {
          h2: 'Qué hacemos',
          paragraphs: [
            'Armamos presupuestos detallados con tus horas, tu tarifa, tus materiales y tus porcentajes, y te dejamos mandarlos por WhatsApp o imprimirlos. Las cantidades de material salen de las calculadoras de Maestro Calc, y los salarios de referencia, de las estadísticas del Departamento de Trabajo de EE. UU.',
          ],
        },
        {
          h2: 'Lo que no hacemos',
          paragraphs: [
            'No publicamos precios de mercado. Lo que se cobra por limpiar una casa o por pintar un cuarto cambia por ciudad, por cliente y por temporada, y no existe una fuente pública neutral. Preferimos que el único número que no sea tuyo sea uno que podamos citar.',
          ],
        },
        {
          h2: 'Quién escribe',
          paragraphs: [
            'Las páginas las escribe y las revisa el equipo editorial de Cuánto Le Cobro. Cada guía muestra la fecha de su última revisión. Más en la política editorial.',
            `¿Encontraste un error? Escríbenos a ${CONTACT_EMAIL}.`,
          ],
        },
        {
          h2: 'Sitios hermanos',
          paragraphs: [
            'Cuenta Horas (cuentahoras.com) calcula horas, horas extra y sueldos; es útil si tienes ayudantes. Maestro Calc (maestrocalc.com) calcula materiales de construcción con más detalle.',
          ],
        },
      ],
    },
    editorial: {
      title: 'Política editorial de Cuánto Le Cobro',
      description:
        'Cómo trabajamos: de dónde salen los números, cómo se revisan las páginas, cómo corregimos errores y qué decimos de anuncios y enlaces.',
      h1: 'Política editorial',
      lead: 'Estas son las reglas con las que escribe el equipo editorial de Cuánto Le Cobro.',
      checked: CHECKED,
      sources: [],
      blocks: [
        {
          h2: 'De dónde salen los números',
          list: [
            'Los presupuestos usan los números que escribe quien usa la calculadora.',
            'Todo número que no es de quien usa la calculadora (un rendimiento, un salario, una tasa) viene de una fuente primaria que se cita con su dirección y la fecha en que la leímos.',
            'Si no hay una fuente primaria, el número se deja fuera y la página lo dice.',
          ],
        },
        {
          h2: 'Autoría y revisión',
          paragraphs: [
            'Las páginas las firma el equipo editorial, no una persona. Cada guía y cada página de datos muestra la fecha de su última revisión y enlaza a sus fuentes. Revisamos de nuevo una página cuando cambia una de sus fuentes y cada vez que BLS publica una nueva edición de sus estimaciones de salarios.',
          ],
        },
        {
          h2: 'Correcciones',
          paragraphs: [
            `Si algo está mal, corregimos la página y cambiamos su fecha de revisión. Escríbenos a ${CONTACT_EMAIL}.`,
          ],
        },
        {
          h2: 'Anuncios y enlaces comerciales',
          paragraphs: [
            'Hoy el sitio no muestra anuncios ni enlaces de afiliados. Si algún día los agregamos, estarán marcados como tales y no cambiarán ningún cálculo.',
          ],
        },
      ],
    },
    privacy: {
      title: 'Privacidad en Cuánto Le Cobro',
      description:
        'Qué datos usamos: las cifras que escribes se quedan en tu navegador, y solo medimos qué botones se usan, nunca los valores.',
      h1: 'Privacidad',
      lead: 'Las cifras que escribes en las calculadoras no salen de tu teléfono. Esto es lo único que medimos y por qué.',
      checked: CHECKED,
      sources: [],
      blocks: [
        {
          h2: 'Lo que escribes',
          paragraphs: [
            'Las horas, las tarifas, los precios y los porcentajes se calculan en tu navegador. No tenemos cuentas ni los guardamos en un servidor. Para que puedas guardar o compartir un presupuesto, los números van en la dirección de la página (después del signo ?); si mandas esa dirección, quien la reciba verá los mismos números.',
          ],
        },
        {
          h2: 'WhatsApp e imprimir',
          paragraphs: [
            'El botón de WhatsApp abre WhatsApp con el texto del presupuesto ya escrito; tú eliges a quién se lo mandas y WhatsApp aplica su propia política. El botón de imprimir usa la impresión de tu navegador; no usamos ningún servicio de PDF.',
          ],
        },
        {
          h2: 'Medición',
          paragraphs: [
            'Cuando el sitio esté en línea con Google Analytics, medirá qué acciones se hacen (calcular, compartir, imprimir) y en qué calculadora, nunca los valores que escribes. Se carga con el modo de consentimiento de Google: las señales de publicidad están negadas y la analítica está negada por omisión en el Espacio Económico Europeo, el Reino Unido y Suiza, y para quien envía la señal Global Privacy Control.',
          ],
        },
        {
          h2: 'Contacto',
          paragraphs: [`Para preguntas de privacidad escribe a ${CONTACT_EMAIL}.`],
        },
      ],
    },
  },
  en: {
    'quote-guide': {
      title: 'How to write a quote: labor, materials and profit',
      description:
        'The four parts of a quote, with a worked example and the formula, so you charge without guessing.',
      h1: 'How to write a quote',
      lead: 'A clear quote has four parts. Once you separate them, pricing stops being a guess and the client sees why.',
      checked: CHECKED,
      sources: [],
      blocks: [
        {
          h2: 'The four parts',
          paragraphs: [
            'Labor: the hours of each worker times the number of workers times your hourly rate. If you prefer to charge by the square foot, it is the area of the job times your price per square foot.',
            'Materials: what you buy for the job (paint, drywall sheets, bags of concrete, mulch, cleaning products), at your purchase price.',
            'Overhead: what it costs to keep your business running that is not labor or material, such as the vehicle, insurance, tools and the time you spend quoting. It is worked out as a percentage of the labor plus the materials.',
            'Profit: what you want to earn on top of all that cost. It is worked out as a percentage of the subtotal plus the overhead.',
          ],
        },
        {
          h2: 'A worked example',
          paragraphs: [
            'These numbers are an example to show the arithmetic; replace them with yours. A 12 × 12 ft room with 8 ft walls, one door, two windows and two coats of paint needs 334 square feet of wall per coat; at 350 square feet per gallon that is 1.91 gallons, so 2 one-gallon cans.',
          ],
          list: [
            'Labor: 8 hours × 1 person × $25.00 an hour = $200.00.',
            'Materials: 2 gallons × $40.00 = $80.00.',
            'Subtotal: $200.00 + $80.00 = $280.00.',
            'Overhead at 10%: $280.00 × 0.10 = $28.00.',
            'Profit at 15%: ($280.00 + $28.00) × 0.15 = $46.20.',
            'Total: $280.00 + $28.00 + $46.20 = $354.20.',
          ],
          after: [
            'Each line is rounded to the cent and the total is the sum of the rounded lines, so the printed quote always adds up.',
          ],
        },
        {
          h2: 'By the hour, by the square foot or a flat price',
          paragraphs: [
            'By the hour protects your time when you do not know how long the job will take. By the square foot is easy to explain and to compare, but it only works if you know your own pace. A flat price is what clients usually want to hear; the trick is to reach that number with the arithmetic above and not the other way around.',
            'The calculator takes hours and square feet. Either way the price is yours: we do not publish market rates because they change by city, client and season, and a made-up figure would make you price wrong.',
          ],
        },
        {
          h2: 'What to put in the written quote',
          list: [
            'What work it includes and what it does not.',
            'The labor and the materials separately, with the quantities.',
            'The total, and how and when it is paid.',
            'How long the price holds and when you start.',
          ],
          after: [
            'The green button of the calculator sends all of this on WhatsApp, and the print button gives you a sheet or a PDF.',
          ],
        },
        {
          h2: 'What the calculator does not do',
          paragraphs: [
            'It does not add sales tax, permits or licenses: they change by state and trade, and a wrong line is worse than none. If you charge them, add them separately before you send the quote.',
          ],
        },
      ],
    },
    'markup-guide': {
      title: 'Markup vs margin: why 20% is not the same in both',
      description:
        'Markup is on the cost and margin is on the price. Formulas, tables and an example so you do not earn less than you think.',
      h1: 'Markup vs margin',
      lead: 'Adding 20% to the cost does not leave 20% profit in the price. They are two different percentages, and mixing them up makes you earn less than you think.',
      checked: CHECKED,
      sources: [],
      blocks: [
        {
          h2: 'The two definitions',
          list: [
            'Markup: the profit as a percentage of the cost. Price = cost × (1 + markup).',
            'Margin: the profit as a percentage of the price. Price = cost ÷ (1 − margin).',
          ],
          after: [
            'An example: with a cost of $1,000 and a markup of 25%, the price is $1,250 and the profit is $250, which is 20% of the price. That is a 25% markup and a 20% margin.',
            'If you only add 20% to the cost, the price is $1,200 and the profit $200, which is 16.67% of the price. You wanted 20% and you got 16.67%.',
          ],
        },
        {
          h2: 'From markup to margin',
          paragraphs: ['Margin = markup ÷ (1 + markup).'],
          generated: 'markup-table',
        },
        {
          h2: 'From margin to markup',
          paragraphs: ['Markup = margin ÷ (1 − margin).'],
          generated: 'margin-table',
        },
        {
          h2: 'What the calculator uses',
          paragraphs: [
            'The Profit (%) field of the calculators is a markup: it is worked out on the subtotal plus the overhead. If you think in margin, use the second table to find the markup that gives it. The percentages are the ones you type; there is no single right one.',
          ],
        },
      ],
    },
    'rate-guide': {
      title: 'How to set your hourly rate: the arithmetic step by step',
      description:
        'What you need to earn, how many hours you can really bill and what goes to taxes and costs: the formula for your rate.',
      h1: 'How to set your hourly rate',
      lead: 'Your rate is not what an employee earns: it has to pay your costs, your taxes and the hours you cannot bill. Here is the arithmetic.',
      checked: CHECKED,
      sources: [IRS, BLS],
      blocks: [
        {
          h2: 'The formula',
          paragraphs: [
            'Hourly rate = (what you want to earn in a year + your business costs in a year) ÷ the hours you can really bill in a year.',
            'The hours you bill are fewer than the hours you work: driving, quoting, buying material and waiting are not billed. Count them with your own numbers, for example the weeks you work in a year times the billable hours of each week.',
          ],
        },
        {
          h2: 'An example with made-up numbers',
          paragraphs: [
            'These numbers are not a recommendation; they only show the arithmetic. Replace them with yours.',
          ],
          generated: 'rate-example',
        },
        {
          h2: 'Taxes for people who work for themselves',
          paragraphs: [
            'People who work for themselves pay self-employment tax: 12.4% for Social Security plus 2.9% for Medicare, 15.3% in all. You usually must pay it if your net earnings from self-employment are $400 or more (IRS, Topic no. 554).',
            'When you work out what you need to earn, think about what is left after taxes and leave that room in the arithmetic. To know how much to pay, talk to an accountant.',
          ],
        },
        {
          h2: 'Compare with what employers pay',
          paragraphs: [
            'The U.S. Department of Labor publishes the hourly wage employers pay in each trade and state. It is a reference point, not a price: your rate also covers overhead and profit.',
          ],
        },
      ],
    },
    methodology: {
      title: 'Methodology: formulas, sources and verified cases',
      description:
        'How each quote is worked out, where every number comes from, and the hand-verified cases that the tests run through the calculator.',
      h1: 'Methodology',
      lead: 'Here is every formula, every source with its address and the day we read it, and the hand-verified cases. Nothing you see in a quote is a market price: they are your numbers.',
      checked: CHECKED,
      sources: [BLS, BLS_API, PAINT_SOURCE, USG_COMPOUND, QUIKRETE, NIST],
      blocks: [
        {
          h2: 'The quote',
          id: 'quote',
          list: [
            'Labor by the hour = hours × workers × hourly rate.',
            'Labor by the square foot = area of the job × your price per square foot.',
            'Materials = whole units (cans, sheets, bags) × your price per unit.',
            'Subtotal = labor + materials.',
            'Overhead = subtotal × percentage.',
            'Profit = (subtotal + overhead) × percentage.',
            'Total = subtotal + overhead + profit.',
          ],
          after: [
            'Labor, materials, overhead and profit are rounded to the cent (half a cent up) and the total is the sum of the rounded lines. Material quantities are always rounded up to whole units.',
            'The numbers the fields start with (8 hours, $25 an hour, 10% and 15%, the prices of paint, sheets and bags) are an example so the first quote reads; they are not prices or recommendations.',
          ],
        },
        {
          h2: 'Materials',
          id: 'materials',
          paragraphs: [
            'The quantities come from the Maestro Calc calculators, which explain their methodology at maestrocalc.com/methodology. We repeat them here with their sources.',
          ],
          list: [
            'Paint: the four walls less 20 sq ft per door and 15 sq ft per window, at 350 sq ft per gallon per coat, the low end of the 350 to 400 in the Sherwin-Williams data sheet (July 2020). One-gallon cans, rounded up.',
            'Drywall: the area of the walls (and the ceiling if included) less doors and windows, with the waste you enter, over 32 sq ft (4 × 8 sheet) or 48 sq ft (4 × 12), rounded up.',
            'Concrete: length × width × thickness plus the waste, over what one bag makes: 0.30, 0.45 or 0.60 cu ft for 40, 60 and 80 lb, from the QUIKRETE No. 1101 data sheet (October 2022). Rounded up.',
            'Landscaping: length × width × depth plus the waste, over the volume printed on the bag (1.5, 2 or 3 cu ft), rounded up. Conversions use the exact factors of NIST SP 811.',
            'Cleaning: no quantity is worked out; the supplies are your figure.',
          ],
        },
        {
          h2: 'Wages by state',
          id: 'wages',
          paragraphs: [
            'The wage pages use the hourly mean and median wage of the May 2025 state estimates of the Occupational Employment and Wage Statistics (OEWS) survey of the U.S. Bureau of Labor Statistics (BLS). The occupations are 37-2012 maids and housekeeping cleaners, 47-2141 painters (construction and maintenance), 47-2081 drywall and ceiling tile installers, 47-2051 cement masons and concrete finishers, and 37-3011 landscaping and groundskeeping workers.',
            'The numbers are fetched with the script apps/cobro/scripts/fetch-wages.ts from the BLS public API (version 1, series OEUS…03 for the hourly mean wage and OEUS…08 for the median) and stored without text. If BLS does not publish one of the two figures for a state and an occupation, that page does not exist.',
            'A wage is what an employer pays an employee. It is not what a contractor bills: the rate also covers overhead and profit.',
          ],
        },
        {
          h2: 'Hand-verified cases',
          id: 'cases',
          paragraphs: [
            'Each case was worked out by hand with the formulas above. The automated tests run the same cases through the calculator and compare every figure, so this table cannot differ from what you see on the site.',
          ],
          generated: 'cases',
        },
        {
          h2: 'Sources and dates',
          id: 'sources',
          paragraphs: [
            'The sources below show the day we read them. This page was reviewed on November 8, 2026.',
          ],
        },
      ],
    },
    about: {
      title: 'About Cuánto Le Cobro',
      description:
        'Who we are, who this site is for and why we do not publish market prices: you enter your numbers and the arithmetic is exact.',
      h1: 'About Cuánto Le Cobro',
      lead: 'Cuánto Le Cobro is a site of quote calculators for people who work in cleaning, painting, drywall, concrete and landscaping in the United States.',
      checked: CHECKED,
      sources: [],
      blocks: [
        {
          h2: 'What we do',
          paragraphs: [
            'We build itemized quotes from your hours, your rate, your materials and your percentages, and let you send them on WhatsApp or print them. The material quantities come from the Maestro Calc calculators, and the reference wages from the U.S. Department of Labor statistics.',
          ],
        },
        {
          h2: 'What we do not do',
          paragraphs: [
            'We do not publish market prices. What is charged to clean a house or paint a room changes by city, client and season, and there is no neutral public source. We prefer that the only number that is not yours is one we can cite.',
          ],
        },
        {
          h2: 'Who writes it',
          paragraphs: [
            'The pages are written and reviewed by the Cuánto Le Cobro editorial team. Each guide shows the date of its last review. More in the editorial policy.',
            `Found a mistake? Write to ${CONTACT_EMAIL}.`,
          ],
        },
        {
          h2: 'Sister sites',
          paragraphs: [
            'Cuenta Horas (cuentahoras.com) works out hours, overtime and pay; it helps if you have helpers. Maestro Calc (maestrocalc.com) works out building materials in more detail.',
          ],
        },
      ],
    },
    editorial: {
      title: 'Cuánto Le Cobro editorial policy',
      description:
        'How we work: where the numbers come from, how pages are reviewed, how we fix mistakes and what we say about ads and links.',
      h1: 'Editorial policy',
      lead: 'These are the rules the Cuánto Le Cobro editorial team writes by.',
      checked: CHECKED,
      sources: [],
      blocks: [
        {
          h2: 'Where the numbers come from',
          list: [
            'Quotes use the numbers typed by whoever uses the calculator.',
            'Every number that is not the user’s (a yield, a wage, a rate) comes from a primary source cited with its address and the day we read it.',
            'If there is no primary source, the number is left out and the page says so.',
          ],
        },
        {
          h2: 'Authorship and review',
          paragraphs: [
            'Pages are signed by the editorial team, not a person. Each guide and each data page shows the date of its last review and links to its sources. We review a page again when one of its sources changes and each time BLS publishes a new edition of its wage estimates.',
          ],
        },
        {
          h2: 'Corrections',
          paragraphs: [
            `If something is wrong we fix the page and change its review date. Write to ${CONTACT_EMAIL}.`,
          ],
        },
        {
          h2: 'Ads and commercial links',
          paragraphs: [
            'Today the site shows no ads and no affiliate links. If we add them one day, they will be labeled as such and will not change any calculation.',
          ],
        },
      ],
    },
    privacy: {
      title: 'Privacy at Cuánto Le Cobro',
      description:
        'What data we use: the figures you type stay in your browser, and we only measure which buttons are used, never the values.',
      h1: 'Privacy',
      lead: 'The figures you type in the calculators do not leave your phone. This is the only thing we measure and why.',
      checked: CHECKED,
      sources: [],
      blocks: [
        {
          h2: 'What you type',
          paragraphs: [
            'Hours, rates, prices and percentages are worked out in your browser. We have no accounts and we do not store them on a server. So that you can save or share a quote, the numbers go in the page address (after the ? sign); if you send that address, whoever receives it sees the same numbers.',
          ],
        },
        {
          h2: 'WhatsApp and printing',
          paragraphs: [
            'The WhatsApp button opens WhatsApp with the text of the quote already written; you choose who gets it and WhatsApp applies its own policy. The print button uses your browser’s printing; we use no PDF service.',
          ],
        },
        {
          h2: 'Measurement',
          paragraphs: [
            'Once the site is online with Google Analytics, it will measure which actions are taken (calculate, share, print) and on which calculator, never the values you type. It loads with Google’s Consent Mode: advertising signals are denied, and analytics is denied by default in the European Economic Area, the United Kingdom and Switzerland, and for anyone who sends the Global Privacy Control signal.',
          ],
        },
        {
          h2: 'Contact',
          paragraphs: [`For privacy questions write to ${CONTACT_EMAIL}.`],
        },
      ],
    },
  },
};
