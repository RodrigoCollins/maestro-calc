/*
 * The construction glossary (PLAN §5.2): one Spanish term per concept, used across the catalogs
 * and the Markdown copy, and the variants the site avoids. Concepts that look alike but differ
 * (roof pitch and slope, drywall level of finish and paint sheen) are separate entries. An avoided
 * variant is a word with no other meaning on the site; the contract test rejects it in every
 * Spanish message and entry, whole word, any case, singular or plural. The public glossary page
 * lists every entry by trade, with a one-sentence definition in each language.
 */

export interface GlossaryEntry {
  /** The English term, unique in the glossary. */
  readonly en: string;
  /** The Spanish term the site uses. */
  readonly es: string;
  /** Spanish variants the site does not use for this concept. */
  readonly avoid: readonly string[];
  /** Why the term was chosen, or where it must not be confused. */
  readonly note?: string;
  /** The trade the public glossary lists it under. */
  readonly group: GlossaryGroup;
  /** One sentence for the public glossary, in each language. */
  readonly define: { readonly en: string; readonly es: string };
}

/** The sections of the public glossary, in page order. */
export const GLOSSARY_GROUPS = [
  'concrete',
  'landscaping',
  'drywall',
  'roofing',
  'paint',
  'measuring',
  'business',
] as const;

export type GlossaryGroup = (typeof GLOSSARY_GROUPS)[number];

export const GLOSSARY: readonly GlossaryEntry[] = [
  {
    en: 'concrete',
    group: 'concrete',
    define: {
      en: 'A mix of cement, sand, gravel and water that hardens like stone.',
      es: 'Mezcla de cemento, arena, grava y agua que se endurece como piedra.',
    },
    es: 'concreto',
    avoid: ['hormigón'],
  },
  {
    en: 'pour',
    group: 'concrete',
    define: {
      en: 'Placing fresh concrete in its forms, and the job itself.',
      es: 'Colocar el concreto fresco en su cimbra, y también el trabajo en sí.',
    },
    es: 'colado',
    avoid: ['vaciado'],
    note: 'The placed concrete and the job.',
  },
  {
    en: 'ready-mix concrete',
    group: 'concrete',
    define: {
      en: 'Concrete mixed at a plant and delivered by truck, sold by the cubic yard.',
      es: 'Concreto mezclado en una planta y entregado en camión, que se vende por yarda cúbica.',
    },
    es: 'concreto premezclado',
    avoid: [],
  },
  {
    en: 'ready-mix plant',
    group: 'concrete',
    define: {
      en: 'The supplier that mixes and delivers ready-mix concrete.',
      es: 'El proveedor que mezcla y entrega el concreto premezclado.',
    },
    es: 'planta',
    avoid: [],
  },
  {
    en: 'short load',
    group: 'concrete',
    define: {
      en: "A ready-mix delivery below the plant's minimum order, often charged extra.",
      es: 'Una entrega de premezclado por debajo del pedido mínimo de la planta, que muchas veces se cobra aparte.',
    },
    es: 'carga chica',
    avoid: [],
  },
  {
    en: 'concrete mixer',
    group: 'concrete',
    define: {
      en: 'A rotating drum that mixes bagged concrete on site.',
      es: 'Un tambor giratorio que mezcla el concreto de bolsa en la obra.',
    },
    es: 'revolvedora',
    avoid: ['mezcladora'],
  },
  {
    en: 'slab',
    group: 'concrete',
    define: {
      en: 'A flat layer of concrete, such as a patio, a floor or a driveway.',
      es: 'Una capa plana de concreto, como un patio, un piso o una entrada de autos.',
    },
    es: 'losa',
    avoid: [],
  },
  {
    en: 'footing',
    group: 'concrete',
    define: {
      en: 'The concrete base under a wall or a post that spreads its weight over the soil.',
      es: 'La base de concreto bajo un muro o un poste, que reparte su peso sobre el suelo.',
    },
    es: 'zapata',
    avoid: [],
  },
  {
    en: 'column',
    group: 'concrete',
    define: {
      en: 'A vertical concrete post, poured in a round or square form.',
      es: 'Un poste vertical de concreto, colado en una cimbra redonda o cuadrada.',
    },
    es: 'columna',
    avoid: [],
  },
  {
    en: 'step',
    group: 'concrete',
    define: {
      en: 'One stair of a concrete stairway: the surface you step on and its front.',
      es: 'Cada escalón de una escalera de concreto: la superficie que pisas y su frente.',
    },
    es: 'escalón',
    avoid: [],
  },
  {
    en: 'formwork',
    group: 'concrete',
    define: {
      en: 'The boards or panels that hold fresh concrete in shape until it hardens.',
      es: 'Las tablas o paneles que dan forma al concreto fresco hasta que endurece.',
    },
    es: 'cimbra',
    avoid: ['encofrado', 'formaleta'],
  },
  {
    en: 'rebar',
    group: 'concrete',
    define: {
      en: 'Steel bar set inside concrete to make it stronger.',
      es: 'Barra de acero que va dentro del concreto para hacerlo más resistente.',
    },
    es: 'varilla',
    avoid: ['cabilla'],
  },
  {
    en: 'wire mesh',
    group: 'concrete',
    define: {
      en: 'A welded grid of steel wire laid in a slab as reinforcement.',
      es: 'Una malla de alambre de acero soldado que se pone en una losa como refuerzo.',
    },
    es: 'malla electrosoldada',
    avoid: [],
  },
  {
    en: 'bag',
    group: 'concrete',
    define: {
      en: 'Premixed concrete sold in 40, 60 or 80 lb bags; you add the water.',
      es: 'Concreto premezclado en seco que se vende en bolsas de 40, 60 u 80 lb; tú le agregas el agua.',
    },
    es: 'bolsa',
    avoid: ['saco de', 'sacos de'],
    note: '"Saco" is also a verb.',
  },
  {
    en: 'gravel',
    group: 'landscaping',
    define: {
      en: 'Small loose stones for paths, driveways and bases, sold by the ton or the cubic yard.',
      es: 'Piedras chicas sueltas para senderos, entradas y bases, que se venden por tonelada o por yarda cúbica.',
    },
    es: 'grava',
    avoid: [],
  },
  {
    en: 'base',
    group: 'landscaping',
    define: {
      en: 'The compacted layer of gravel under a slab or a path.',
      es: 'La capa de grava compactada bajo una losa o un sendero.',
    },
    es: 'base',
    avoid: [],
    note: 'The gravel under a slab or a path.',
  },
  {
    en: 'crown',
    group: 'landscaping',
    define: {
      en: 'The rise of a driveway or a road at its center, so water runs off to the sides.',
      es: 'La subida de una entrada o un camino en su centro, para que el agua corra hacia los lados.',
    },
    es: 'bombeo',
    avoid: [],
  },
  {
    en: 'mulch',
    group: 'landscaping',
    define: {
      en: 'Shredded bark or wood spread over beds to keep moisture in and weeds down.',
      es: 'Corteza o madera triturada que se esparce sobre los canteros para guardar la humedad y frenar la maleza.',
    },
    es: 'mulch',
    avoid: ['mantillo', 'acolchado'],
  },
  {
    en: 'topsoil',
    group: 'landscaping',
    define: {
      en: 'The top layer of soil, rich in organic matter, used to fill and level beds and lawns.',
      es: 'La capa de arriba del suelo, rica en materia orgánica, para rellenar y nivelar canteros y césped.',
    },
    es: 'tierra para jardín',
    avoid: [],
  },
  {
    en: 'drywall',
    group: 'drywall',
    define: {
      en: 'Panels of gypsum between paper faces, screwed to the framing to make walls and ceilings.',
      es: 'Paneles de yeso entre dos caras de papel que se atornillan a la estructura para hacer paredes y techos.',
    },
    es: 'drywall',
    avoid: ['tablaroca', 'tabla roca', 'panel de yeso'],
  },
  {
    en: 'drywall sheet',
    group: 'drywall',
    define: {
      en: 'One drywall panel, usually 4 × 8 or 4 × 12 ft.',
      es: 'Un panel de drywall, por lo general de 4 × 8 o 4 × 12 ft.',
    },
    es: 'placa',
    avoid: ['lámina'],
  },
  {
    en: 'joint compound',
    group: 'drywall',
    define: {
      en: 'The paste spread over the joints and the screws to hide them before paint.',
      es: 'La pasta que se pone sobre las juntas y los tornillos para esconderlos antes de pintar.',
    },
    es: 'compuesto para juntas',
    avoid: ['pasta para juntas', 'mezcla para juntas'],
  },
  {
    en: 'joint tape',
    group: 'drywall',
    define: {
      en: 'Paper tape set in compound over the joints between sheets.',
      es: 'Cinta de papel que se pega con compuesto sobre las juntas entre placas.',
    },
    es: 'cinta para juntas',
    avoid: [],
  },
  {
    en: 'pail',
    group: 'drywall',
    define: {
      en: 'A plastic bucket, the way joint compound and paint are sold in larger amounts.',
      es: 'Un recipiente de plástico; así se venden el compuesto para juntas y la pintura en cantidades grandes.',
    },
    es: 'cubeta',
    avoid: ['balde'],
    note: 'The word of the stores most of our readers buy in (a "cubeta" of joint compound).',
  },
  {
    en: 'corner bead',
    group: 'drywall',
    define: {
      en: 'A metal or plastic strip that protects and straightens an outside corner.',
      es: 'Una tira de metal o de plástico que protege y endereza una esquina exterior.',
    },
    es: 'esquinero',
    avoid: ['cantonera'],
  },
  {
    en: 'screw',
    group: 'drywall',
    define: {
      en: 'The fastener that holds drywall to the framing.',
      es: 'La pieza que sujeta el drywall a la estructura.',
    },
    es: 'tornillo',
    avoid: [],
  },
  {
    en: 'level of finish',
    group: 'drywall',
    define: {
      en: "How smooth drywall is finished, from 0 to 5 in the Gypsum Association's GA-214.",
      es: 'Qué tan liso queda el drywall, de 0 a 5 según la norma GA-214 de la Gypsum Association.',
    },
    es: 'nivel de terminación',
    avoid: [],
    note: 'Drywall (GA-214); a paint finish is an "acabado".',
  },
  {
    en: 'roof',
    group: 'roofing',
    define: { en: 'The top covering of a building.', es: 'La cubierta de arriba de un edificio.' },
    es: 'techo',
    avoid: ['tejado'],
  },
  {
    en: 'ceiling',
    group: 'drywall',
    define: {
      en: 'The overhead surface inside a room. In Spanish it shares the word techo with the roof.',
      es: 'La superficie de arriba dentro de un cuarto. En español comparte la palabra techo con la cubierta.',
    },
    es: 'techo',
    avoid: [],
    note: 'Same word as the roof; "cielorraso" only where "techo" would read as the roof.',
  },
  {
    en: 'asphalt shingle',
    group: 'roofing',
    define: {
      en: 'The most common roof covering in the US: overlapping tabs of asphalt and granules.',
      es: 'La cubierta de techo más común en EE.UU.: piezas superpuestas de asfalto con gránulos.',
    },
    es: 'teja asfáltica',
    avoid: [],
  },
  {
    en: 'bundle',
    group: 'roofing',
    define: {
      en: 'A package of shingles; several bundles cover one square.',
      es: 'Un paquete de tejas; varios paquetes cubren un square.',
    },
    es: 'paquete',
    avoid: ['bulto'],
  },
  {
    en: 'roofing square',
    group: 'roofing',
    define: {
      en: '100 square feet of roof, the unit roofers order and price in.',
      es: '100 pies cuadrados de techo, la unidad en que se piden y cotizan los techos.',
    },
    es: 'square',
    avoid: [],
    note: '100 square feet of roof.',
  },
  {
    en: 'underlayment',
    group: 'roofing',
    define: {
      en: 'The felt or synthetic layer laid on the roof deck under the shingles.',
      es: 'La capa de fieltro o sintética que va sobre la base del techo, debajo de las tejas.',
    },
    es: 'fieltro',
    avoid: [],
  },
  {
    en: 'roof pitch',
    group: 'roofing',
    define: {
      en: 'How steep a roof is, written as its rise in 12 of run, such as 6/12.',
      es: 'Qué tan empinado es un techo, escrito como la subida en 12 de recorrido, por ejemplo 6/12.',
    },
    es: 'pendiente',
    avoid: [],
    note: 'Written as rise in 12.',
  },
  {
    en: 'slope',
    group: 'roofing',
    define: {
      en: 'Rise divided by run as a plain ratio: a 6/12 pitch is a slope of 1/2.',
      es: 'La subida dividida por el recorrido, como una razón: una pendiente de 6/12 es una inclinación de 1/2.',
    },
    es: 'inclinación',
    avoid: [],
    note: 'Rise ÷ run, a plain ratio.',
  },
  {
    en: 'rise',
    group: 'roofing',
    define: {
      en: 'How much a roof goes up, measured vertically.',
      es: 'Cuánto sube un techo, medido en vertical.',
    },
    es: 'subida',
    avoid: [],
  },
  {
    en: 'run',
    group: 'roofing',
    define: {
      en: 'The horizontal distance over which a roof rises.',
      es: 'La distancia horizontal en la que sube un techo.',
    },
    es: 'recorrido',
    avoid: [],
  },
  {
    en: 'rafter',
    group: 'roofing',
    define: {
      en: 'One of the sloped beams that carry the roof from the wall to the ridge.',
      es: 'Cada una de las vigas inclinadas que llevan el techo desde la pared hasta la cumbrera.',
    },
    es: 'cabio',
    avoid: ['vigueta'],
  },
  {
    en: 'overhang',
    group: 'roofing',
    define: {
      en: 'The part of the roof that sticks out past the wall.',
      es: 'La parte del techo que sobresale de la pared.',
    },
    es: 'alero',
    avoid: [],
  },
  {
    en: 'ridge',
    group: 'roofing',
    define: {
      en: 'The top line of a roof, where two slopes meet.',
      es: 'La línea más alta de un techo, donde se juntan dos aguas.',
    },
    es: 'cumbrera',
    avoid: ['caballete'],
  },
  {
    en: 'coat',
    group: 'paint',
    define: {
      en: 'Paint applied once over the whole surface; a new color usually takes two.',
      es: 'La pintura aplicada una vez sobre toda la superficie; un color nuevo suele llevar dos.',
    },
    es: 'mano',
    avoid: ['capa de pintura', 'capa de primer'],
  },
  {
    en: 'gallon can',
    group: 'paint',
    define: {
      en: 'The standard can of paint in the US, 1 gallon or about 3.79 liters.',
      es: 'La lata de pintura común en EE.UU., de 1 galón o unos 3.79 litros.',
    },
    es: 'lata de un galón',
    avoid: [],
  },
  {
    en: 'primer',
    group: 'paint',
    define: {
      en: 'A first coat that seals the surface so the paint covers evenly.',
      es: 'Una primera mano que sella la superficie para que la pintura cubra parejo.',
    },
    es: 'primer',
    avoid: ['imprimador', 'imprimante'],
  },
  {
    en: 'caulk',
    group: 'paint',
    define: {
      en: 'A flexible paste that fills the gaps between the trim and the wall.',
      es: 'Una pasta flexible que rellena las juntas entre la moldura y la pared.',
    },
    es: 'sellador',
    avoid: ['calafateo'],
  },
  {
    en: 'spackle',
    group: 'paint',
    define: {
      en: 'A paste for filling small holes and cracks before paint.',
      es: 'Una pasta para rellenar agujeros y grietas chicas antes de pintar.',
    },
    es: 'masilla',
    avoid: [],
  },
  {
    en: 'trim',
    group: 'paint',
    define: {
      en: 'The moldings around doors, windows, floors and ceilings.',
      es: 'Las piezas que rodean puertas, ventanas, pisos y techos.',
    },
    es: 'moldura',
    avoid: [],
  },
  {
    en: 'sheen',
    group: 'paint',
    define: {
      en: 'How glossy a paint dries: flat, eggshell, satin or semi-gloss.',
      es: 'Qué tanto brilla la pintura al secar: mate, cáscara de huevo, satinado o semibrillante.',
    },
    es: 'acabado',
    avoid: [],
  },
  {
    en: 'tape measure',
    group: 'measuring',
    define: {
      en: 'The tape for measuring on site, marked in feet, inches and fractions of an inch.',
      es: 'La cinta para medir en la obra, marcada en pies, pulgadas y fracciones de pulgada.',
    },
    es: 'cinta métrica',
    avoid: ['flexómetro'],
  },
  {
    en: 'room',
    group: 'measuring',
    define: {
      en: 'A space with walls, measured by its length, width and height.',
      es: 'Un espacio con paredes, que se mide por su largo, su ancho y su altura.',
    },
    es: 'cuarto',
    avoid: ['habitación', 'recámara'],
  },
  {
    en: 'bedroom',
    group: 'measuring',
    define: {
      en: 'A room for sleeping; the usual example in our calculators.',
      es: 'Un cuarto para dormir; el ejemplo de siempre en nuestras calculadoras.',
    },
    es: 'dormitorio',
    avoid: [],
  },
  {
    en: 'cubic yard',
    group: 'measuring',
    define: {
      en: 'A cube 3 ft on each side, 27 cubic feet: the unit of concrete, gravel and soil.',
      es: 'Un cubo de 3 ft de lado, 27 pies cúbicos: la unidad del concreto, la grava y la tierra.',
    },
    es: 'yarda cúbica',
    avoid: [],
  },
  {
    en: 'square foot',
    group: 'measuring',
    define: {
      en: 'A square 1 ft on each side, 144 square inches: the unit of walls, floors and roofs.',
      es: 'Un cuadrado de 1 ft de lado, 144 pulgadas cuadradas: la unidad de paredes, pisos y techos.',
    },
    es: 'pie cuadrado',
    avoid: [],
  },
  {
    en: 'inch',
    group: 'measuring',
    define: {
      en: 'One twelfth of a foot, exactly 2.54 centimeters.',
      es: 'Un doceavo de pie, exactamente 2.54 centímetros.',
    },
    es: 'pulgada',
    avoid: [],
  },
  {
    en: 'scaffolding',
    group: 'measuring',
    define: {
      en: 'A temporary platform for working up high.',
      es: 'Una plataforma temporal para trabajar en altura.',
    },
    es: 'andamio',
    avoid: [],
  },
  {
    en: 'quote',
    group: 'measuring',
    define: {
      en: 'The price you give a client for a job, with what it includes.',
      es: 'El precio que le das a un cliente por un trabajo, con lo que incluye.',
    },
    es: 'cotización',
    avoid: ['presupuesto'],
  },
  {
    en: 'estimate',
    group: 'measuring',
    define: {
      en: 'A calculated quantity or cost that is close, not exact.',
      es: 'Una cantidad o un costo calculado que se acerca, pero no es exacto.',
    },
    es: 'estimación',
    avoid: [],
  },
  {
    en: 'contractor',
    group: 'business',
    define: {
      en: 'A person or company hired to do construction work.',
      es: 'Una persona o empresa que se contrata para hacer un trabajo de construcción.',
    },
    es: 'contratista',
    avoid: [],
  },
  {
    en: 'license',
    group: 'business',
    define: {
      en: 'The permission a state gives to do certain construction work for pay.',
      es: 'El permiso que da un estado para hacer ciertos trabajos de construcción a cambio de pago.',
    },
    es: 'licencia',
    avoid: [],
  },
  {
    en: 'bond',
    group: 'business',
    define: {
      en: 'A guarantee a contractor files with the state to protect clients and workers.',
      es: 'Una garantía que el contratista deposita ante el estado para proteger a clientes y trabajadores.',
    },
    es: 'fianza',
    avoid: ['bono'],
    note: '"Bono" is a false friend.',
  },
  {
    en: 'building permit',
    group: 'business',
    define: {
      en: 'The approval of the city or the county to build or change a structure.',
      es: 'La aprobación de la ciudad o el condado para construir o cambiar una estructura.',
    },
    es: 'permiso de construcción',
    avoid: [],
  },
  {
    en: 'foreman',
    group: 'business',
    define: {
      en: 'The person who runs a crew on site.',
      es: 'La persona que dirige una cuadrilla en la obra.',
    },
    es: 'capataz',
    avoid: [],
  },
  {
    en: 'journeyman',
    group: 'business',
    define: {
      en: 'A worker who has learned a trade and works in it without supervision.',
      es: 'Un trabajador que aprendió un oficio y lo ejerce sin supervisión.',
    },
    es: 'oficial',
    avoid: [],
  },
];

/** One avoided variant found in a text: as written, and the term to use instead. */
export interface GlossaryProblem {
  readonly variant: string;
  readonly use: string;
}

const escape = (text: string): string => text.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Lookarounds replace `\b`, which treats accented letters as non-word characters.
const PATTERNS = GLOSSARY.flatMap(({ es, avoid }) =>
  avoid.map((variant) => ({
    use: es,
    pattern: new RegExp(`(?<![\\p{L}\\p{N}])${escape(variant)}(?:s|es)?(?![\\p{L}\\p{N}])`, 'giu'),
  })),
);

/** The avoided variants in `text`, in reading order. */
export const glossaryProblems = (text: string): GlossaryProblem[] =>
  PATTERNS.flatMap(({ use, pattern }) =>
    Array.from(text.matchAll(pattern), (match) => ({ at: match.index, variant: match[0], use })),
  )
    .sort((a, b) => a.at - b.at)
    .map(({ variant, use }) => ({ variant, use }));
