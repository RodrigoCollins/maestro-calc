import type { Lang, TradeId } from '../routes.ts';

/** The copy of one trade's quote page in one language. */
export interface TradeText {
  /** The chip, and the name of the page in links. */
  readonly name: string;
  readonly title: string;
  readonly description: string;
  readonly h1: string;
  readonly lead: string;
  /** The label of the materials line of the receipt. */
  readonly materials: string;
  /** `{n} gallons`: the units of the main material, one and many; none for a trade with no quantity. */
  readonly unitOne: string;
  readonly unitMany: string;
  /** The label of each field of the trade (the labor fields are in the common copy). */
  readonly fields: Readonly<Record<string, string>>;
  readonly options: Readonly<Record<string, Readonly<Record<string, string>>>>;
  /** How the engine works out the materials, one short paragraph. */
  readonly how: string;
  readonly faq: readonly { readonly q: string; readonly a: string }[];
}

const FAQ_BASIS = {
  es: {
    q: '¿Cobro por hora o por pie cuadrado?',
    a: 'Las dos formas sirven. Por hora es más simple cuando no sabes cuánto vas a tardar; por pie cuadrado es más fácil de explicar al cliente. La calculadora acepta las dos y tú escribes tu propio precio, porque solo tú conoces tus costos y tu mercado.',
  },
  en: {
    q: 'Should I charge by the hour or by the square foot?',
    a: 'Both work. By the hour is simpler when you do not know how long it will take; by the square foot is easier to explain to the client. The calculator takes either, and you type your own price, because only you know your costs and your market.',
  },
} as const;

const FAQ_MARKUP = {
  es: {
    q: '¿Qué porcentaje de costos generales y de ganancia pongo?',
    a: 'El que tu negocio necesita. Súmale a la mano de obra y al material lo que gastas en vehículo, seguro, herramientas y tiempo de oficina, y lo que quieres ganar. No hay un porcentaje correcto para todos, así que la calculadora no lo inventa: los números de arranque son solo un ejemplo.',
  },
  en: {
    q: 'What overhead and profit percentages should I use?',
    a: 'The ones your business needs. Add to the labor and the material what you spend on vehicle, insurance, tools and office time, and what you want to earn. There is no percentage that is right for everyone, so the calculator does not make one up: the starting numbers are only an example.',
  },
} as const;

export const TRADE_TEXTS: Readonly<Record<Lang, Readonly<Record<TradeId, TradeText>>>> = {
  es: {
    cleaning: {
      name: 'Limpieza',
      title: 'Cuánto cobrar por limpiar una casa: presupuesto en minutos',
      description:
        'Arma el presupuesto de una limpieza con tus horas, tu tarifa y tus productos. Envíalo por WhatsApp o imprímelo.',
      h1: 'Cuánto cobrar por limpiar una casa',
      lead: 'Pon las horas, cuántas personas van y tu tarifa. El presupuesto sale detallado, listo para mandarlo al cliente por WhatsApp.',
      materials: 'Productos',
      unitOne: '',
      unitMany: '',
      fields: {
        area: 'Tamaño de la casa (pies cuadrados)',
        supplies: 'Productos y suministros (US$)',
      },
      options: {},
      how: 'No se calcula ninguna cantidad de material: en una limpieza los productos son el gasto que tú escribes. El tamaño de la casa solo se usa si cobras por pie cuadrado.',
      faq: [
        FAQ_BASIS.es,
        {
          q: '¿Cuántas horas debo poner para una casa?',
          a: 'Depende de la casa, de cuántas personas van y de qué tan rápido trabajas. Usa tu propia experiencia; si apenas empiezas, mide el tiempo de las primeras limpiezas y ajusta el siguiente presupuesto.',
        },
        FAQ_MARKUP.es,
      ],
    },
    painting: {
      name: 'Pintura',
      title: 'Cuánto cobrar por pintar una casa: presupuesto con pintura',
      description:
        'Mide el cuarto y la calculadora saca los galones; tú pones tu tarifa y tu precio. El presupuesto sale listo para WhatsApp.',
      h1: 'Cuánto cobrar por pintar una casa',
      lead: 'Escribe las medidas del cuarto, las manos de pintura y tu tarifa. Calculamos los galones y armamos el presupuesto con la mano de obra.',
      materials: 'Pintura',
      unitOne: '{n} galón',
      unitMany: '{n} galones',
      fields: {
        length: 'Largo del cuarto (pies)',
        width: 'Ancho del cuarto (pies)',
        height: 'Alto de las paredes (pies)',
        coats: 'Manos de pintura',
        gallonPrice: 'Precio por galón (US$)',
      },
      options: {},
      how: 'Los galones salen del calculador de pintura de Maestro Calc: las paredes del cuarto menos puertas y ventanas, 350 pies cuadrados por galón y por mano, y latas enteras. Tú pones el precio del galón.',
      faq: [
        FAQ_BASIS.es,
        {
          q: '¿Cómo se calcula la pintura?',
          a: 'Se miden las cuatro paredes, se restan las puertas (20 pies²) y las ventanas (15 pies²), y se divide entre 350 pies² por galón, que es el extremo bajo del rango de 350 a 400 de la hoja técnica de un fabricante. Se multiplica por las manos y se redondea hacia arriba a latas de un galón.',
        },
        FAQ_MARKUP.es,
      ],
    },
    drywall: {
      name: 'Drywall',
      title: 'Cuánto cobrar por instalar drywall: presupuesto con hojas',
      description:
        'Pon las medidas del cuarto y calculamos las hojas de drywall; tú pones tu tarifa y tu precio. Presupuesto listo para WhatsApp.',
      h1: 'Cuánto cobrar por instalar drywall',
      lead: 'Escribe las medidas del cuarto y si llevan techo. Calculamos las hojas y armamos el presupuesto con tu mano de obra, por hora o por pie cuadrado.',
      materials: 'Hojas de drywall',
      unitOne: '{n} hoja',
      unitMany: '{n} hojas',
      fields: {
        length: 'Largo del cuarto (pies)',
        width: 'Ancho del cuarto (pies)',
        height: 'Alto de las paredes (pies)',
        surfaces: 'Qué cubrir',
        sheet: 'Tamaño de la hoja',
        waste: 'Desperdicio (%)',
        sheetPrice: 'Precio por hoja (US$)',
      },
      options: {
        surfaces: { 'walls-ceiling': 'Paredes y techo', walls: 'Solo paredes' },
        sheet: { '4x8': '4 × 8 pies', '4x12': '4 × 12 pies' },
      },
      how: 'Las hojas salen del calculador de drywall de Maestro Calc: el área de las paredes (y del techo si lo incluyes) menos puertas y ventanas, el desperdicio que tú escribes y hojas enteras. La masilla y la cinta no entran en este presupuesto: súmalas en otro renglón si las cobras.',
      faq: [
        FAQ_BASIS.es,
        {
          q: '¿Cuánto desperdicio debo poner?',
          a: 'El desperdicio es el material que se pierde en los cortes. El 10 % con el que arrancamos es una regla práctica que tú puedes cambiar, no una norma.',
        },
        FAQ_MARKUP.es,
      ],
    },
    concrete: {
      name: 'Concreto',
      title: 'Cuánto cobrar por pie cuadrado de concreto: presupuesto',
      description:
        'Mide la losa y calculamos las bolsas de mezcla; tú pones tu precio por pie cuadrado o por hora. Presupuesto listo para WhatsApp.',
      h1: 'Cuánto cobrar por pie cuadrado de concreto',
      lead: 'Escribe el largo, el ancho y el grosor de la losa. Calculamos las bolsas y armamos el presupuesto con tu mano de obra, por hora o por pie cuadrado.',
      materials: 'Mezcla de concreto',
      unitOne: '{n} bolsa',
      unitMany: '{n} bolsas',
      fields: {
        length: 'Largo de la losa (pies)',
        width: 'Ancho de la losa (pies)',
        thickness: 'Grosor (pulgadas)',
        waste: 'Desperdicio (%)',
        bag: 'Tamaño de la bolsa',
        bagPrice: 'Precio por bolsa (US$)',
      },
      options: { bag: { '40': '40 libras', '60': '60 libras', '80': '80 libras' } },
      how: 'Las bolsas salen del calculador de concreto de Maestro Calc: largo × ancho × grosor, más el desperdicio que escribes, dividido entre lo que rinde una bolsa (0.30, 0.45 o 0.60 pies³ según su tamaño) y redondeado hacia arriba. Para zapatas, columnas o escalones usa ese calculador.',
      faq: [
        FAQ_BASIS.es,
        {
          q: '¿De dónde sale lo que rinde una bolsa?',
          a: 'De la hoja técnica de un fabricante (QUIKRETE, mezcla No. 1101): 0.30 pies³ la bolsa de 40 libras, 0.45 la de 60 y 0.60 la de 80. El rendimiento real varía con el producto y la mezcla, así que el número de bolsas es una estimación.',
        },
        FAQ_MARKUP.es,
      ],
    },
    landscaping: {
      name: 'Jardín',
      title: 'Cuánto cobrar por jardinería: presupuesto con mantillo',
      description:
        'Mide el área y calculamos las bolsas de mantillo; tú pones tu tarifa y tu precio. El presupuesto sale listo para WhatsApp.',
      h1: 'Cuánto cobrar por jardinería',
      lead: 'Escribe el largo, el ancho y la profundidad del mantillo. Calculamos las bolsas y armamos el presupuesto con tu mano de obra.',
      materials: 'Mantillo (mulch)',
      unitOne: '{n} bolsa',
      unitMany: '{n} bolsas',
      fields: {
        length: 'Largo del área (pies)',
        width: 'Ancho del área (pies)',
        depth: 'Profundidad del mantillo (pulgadas)',
        waste: 'Desperdicio (%)',
        bag: 'Tamaño de la bolsa',
        bagPrice: 'Precio por bolsa (US$)',
      },
      options: { bag: { '1-5': '1.5 pies³', '2': '2 pies³', '3': '3 pies³' } },
      how: 'Las bolsas salen del calculador de mantillo de Maestro Calc: largo × ancho × profundidad, más el desperdicio que escribes, dividido entre el volumen impreso en la bolsa y redondeado hacia arriba.',
      faq: [
        FAQ_BASIS.es,
        {
          q: '¿Y si el trabajo es solo cortar el césped?',
          a: 'Pon las bolsas en cero (precio de la bolsa en 0) y cobra solo la mano de obra, por hora o por pie cuadrado. El presupuesto sigue saliendo detallado.',
        },
        FAQ_MARKUP.es,
      ],
    },
  },
  en: {
    cleaning: {
      name: 'Cleaning',
      title: 'How much to charge to clean a house: a quote in minutes',
      description:
        'Build a cleaning quote from your hours, your rate and your supplies. Send it on WhatsApp or print it.',
      h1: 'How much to charge to clean a house',
      lead: 'Enter the hours, how many people go and your rate. The quote comes out itemized, ready to send to the client on WhatsApp.',
      materials: 'Supplies',
      unitOne: '',
      unitMany: '',
      fields: {
        area: 'Size of the house (square feet)',
        supplies: 'Products and supplies (US$)',
      },
      options: {},
      how: 'No quantity of material is worked out: in a cleaning the supplies are the expense you type. The size of the house is used only if you charge by the square foot.',
      faq: [
        FAQ_BASIS.en,
        {
          q: 'How many hours should I enter for a house?',
          a: 'It depends on the house, how many people go and how fast you work. Use your own experience; if you are starting out, time your first cleanings and adjust the next quote.',
        },
        FAQ_MARKUP.en,
      ],
    },
    painting: {
      name: 'Painting',
      title: 'How much to charge to paint a house: a quote with paint',
      description:
        'Measure the room and the calculator works out the gallons; you enter your rate and price. The quote is ready for WhatsApp.',
      h1: 'How much to charge to paint a house',
      lead: 'Enter the room measurements, the coats and your rate. We work out the gallons and build the quote with the labor.',
      materials: 'Paint',
      unitOne: '{n} gallon',
      unitMany: '{n} gallons',
      fields: {
        length: 'Room length (feet)',
        width: 'Room width (feet)',
        height: 'Wall height (feet)',
        coats: 'Coats of paint',
        gallonPrice: 'Price per gallon (US$)',
      },
      options: {},
      how: 'The gallons come from the Maestro Calc paint calculator: the room’s walls less doors and windows, 350 square feet per gallon per coat, and whole cans. You enter the price of the gallon.',
      faq: [
        FAQ_BASIS.en,
        {
          q: 'How is the paint worked out?',
          a: 'The four walls are measured, the doors (20 sq ft) and windows (15 sq ft) are subtracted, and the rest is divided by 350 sq ft per gallon, the low end of the 350 to 400 range in a manufacturer’s data sheet. That is multiplied by the coats and rounded up to whole gallon cans.',
        },
        FAQ_MARKUP.en,
      ],
    },
    drywall: {
      name: 'Drywall',
      title: 'How much to charge to install drywall: a quote with sheets',
      description:
        'Enter the room measurements and we work out the drywall sheets; you enter your rate and price. Quote ready for WhatsApp.',
      h1: 'How much to charge to install drywall',
      lead: 'Enter the room measurements and whether it has a ceiling. We work out the sheets and build the quote with your labor, by the hour or by the square foot.',
      materials: 'Drywall sheets',
      unitOne: '{n} sheet',
      unitMany: '{n} sheets',
      fields: {
        length: 'Room length (feet)',
        width: 'Room width (feet)',
        height: 'Wall height (feet)',
        surfaces: 'What to cover',
        sheet: 'Sheet size',
        waste: 'Waste (%)',
        sheetPrice: 'Price per sheet (US$)',
      },
      options: {
        surfaces: { 'walls-ceiling': 'Walls and ceiling', walls: 'Walls only' },
        sheet: { '4x8': '4 × 8 feet', '4x12': '4 × 12 feet' },
      },
      how: 'The sheets come from the Maestro Calc drywall calculator: the area of the walls (and the ceiling if you include it) less doors and windows, the waste you enter and whole sheets. Joint compound and tape are not in this quote: add them as another line if you charge for them.',
      faq: [
        FAQ_BASIS.en,
        {
          q: 'How much waste should I enter?',
          a: 'Waste is the material lost in the cuts. The 10 percent we start with is a rule of thumb that you can change, not a standard.',
        },
        FAQ_MARKUP.en,
      ],
    },
    concrete: {
      name: 'Concrete',
      title: 'How much to charge for concrete per square foot: a quote',
      description:
        'Measure the slab and we work out the bags of mix; you enter your price per square foot or per hour. Quote ready for WhatsApp.',
      h1: 'How much to charge for concrete per square foot',
      lead: 'Enter the length, width and thickness of the slab. We work out the bags and build the quote with your labor, by the hour or by the square foot.',
      materials: 'Concrete mix',
      unitOne: '{n} bag',
      unitMany: '{n} bags',
      fields: {
        length: 'Slab length (feet)',
        width: 'Slab width (feet)',
        thickness: 'Thickness (inches)',
        waste: 'Waste (%)',
        bag: 'Bag size',
        bagPrice: 'Price per bag (US$)',
      },
      options: { bag: { '40': '40 lb', '60': '60 lb', '80': '80 lb' } },
      how: 'The bags come from the Maestro Calc concrete calculator: length × width × thickness, plus the waste you enter, divided by what one bag makes (0.30, 0.45 or 0.60 cu ft by size) and rounded up. For footings, columns or steps use that calculator.',
      faq: [
        FAQ_BASIS.en,
        {
          q: 'Where does what a bag makes come from?',
          a: 'From a manufacturer’s data sheet (QUIKRETE Concrete Mix No. 1101): 0.30 cu ft for the 40 lb bag, 0.45 for 60 lb and 0.60 for 80 lb. Real yields vary with the product and the mix, so the bag count is an estimate.',
        },
        FAQ_MARKUP.en,
      ],
    },
    landscaping: {
      name: 'Landscaping',
      title: 'How much to charge for landscaping: a quote with mulch',
      description:
        'Measure the area and we work out the bags of mulch; you enter your rate and price. The quote is ready for WhatsApp.',
      h1: 'How much to charge for landscaping',
      lead: 'Enter the length, width and depth of the mulch. We work out the bags and build the quote with your labor.',
      materials: 'Mulch',
      unitOne: '{n} bag',
      unitMany: '{n} bags',
      fields: {
        length: 'Area length (feet)',
        width: 'Area width (feet)',
        depth: 'Mulch depth (inches)',
        waste: 'Waste (%)',
        bag: 'Bag size',
        bagPrice: 'Price per bag (US$)',
      },
      options: { bag: { '1-5': '1.5 cu ft', '2': '2 cu ft', '3': '3 cu ft' } },
      how: 'The bags come from the Maestro Calc mulch calculator: length × width × depth, plus the waste you enter, divided by the volume printed on the bag and rounded up.',
      faq: [
        FAQ_BASIS.en,
        {
          q: 'What if the job is only mowing?',
          a: 'Set the price per bag to 0 and charge only the labor, by the hour or by the square foot. The quote still comes out itemized.',
        },
        FAQ_MARKUP.en,
      ],
    },
  },
};
