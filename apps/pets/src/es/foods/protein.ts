import type { FoodEs } from './types.ts';

/** The dairy and meat of the Spanish pages, in the order of the route table. */
export const PROTEIN_ES: readonly FoodEs[] = [
  {
    id: 'cheese',
    name: 'Queso',
    food: 'queso',
    answer: 'un cubito de queso suave',
    short: 'Sí, un cubito',
    summary:
      'Un cubito de queso suave y bajo en grasa le sienta bien a la mayoría de los perros, pero muchos digieren mal la lactosa y el queso es graso.',
    why: [
      'PetMD indica que los perros pueden comer queso con moderación, aunque la mayoría son intolerantes a la lactosa; el AKC lo acepta como premio ocasional. La ASPCA explica el límite: las mascotas no tienen suficiente lactasa, la enzima que descompone el azúcar de la leche, así que los lácteos pueden causar diarrea y otras molestias digestivas.',
      'El queso también es graso y salado (PetMD). Según el USDA, el cheddar aporta 403 kcal por cada 100 g, de modo que un poco de queso agota rápido el presupuesto de premios. Si tu perro ya tuvo una inflamación del páncreas (pancreatitis), PetMD recomienda no darle queso.',
    ],
    serve: [
      'Un cubito o un poco de queso rallado suele bastar para el adiestramiento o como recompensa (AKC).',
      'Elige quesos con menos grasa y poca lactosa, como la mozzarella, el queso cottage o un queso de cabra fresco y suave (AKC, PetMD).',
    ],
    never: [
      'Los quesos azules, que PetMD considera tóxicos para los perros (contienen roquefortina).',
      'Los quesos con ajo, cebolla o cebollino (AKC).',
    ],
    signs: ['Vómitos, diarrea, vientre hinchado o gases (PetMD).'],
    usdaName: 'de queso cheddar',
    piece: {
      a: 'un cubo de 2,5 cm de lado',
      one: 'cubo de 2,5 cm',
      many: 'cubos de 2,5 cm',
      basis: 'USDA: 1 pulgada cúbica (cubo de 2,5 cm) de cheddar = 17 g',
    },
    sizeGuide: {
      note: 'Las cantidades de PetMD, unas cuantas veces por semana, con las categorías de peso convertidas a kilogramos.',
      rows: [
        ['Muy pequeño (1 a 5 kg)', '1 a 2 trocitos del tamaño de un chícharo (guisante)'],
        ['Pequeño (5 a 9 kg)', '1 a 2 cubitos de 6 mm'],
        ['Mediano (10 a 23 kg)', '3 a 4 cubitos'],
        ['Grande (23 a 41 kg)', '5 a 6 cubitos'],
        ['Muy grande (41 kg o más)', '7 a 8 cubitos'],
      ],
    },
    questions: [
      {
        question: '¿Los perros pueden comer queso cottage?',
        answer:
          'Sí, en poca cantidad: el AKC lo cuenta entre las mejores opciones, porque tiene menos grasa y menos sodio.',
      },
      {
        question: '¿El queso sirve como premio para el adiestramiento?',
        answer:
          'En trocitos, sí: el AKC indica que un cubito o un poco de queso rallado suele bastar. Con muchas repeticiones al día, cada trozo cuenta en el presupuesto de premios, y el cheddar es calórico: según el USDA, un cubo de 2,5 cm ya aporta 69 kcal.',
      },
    ],
    sources: [],
  },
  {
    id: 'eggs',
    name: 'Huevo',
    food: 'huevo',
    answer: 'el huevo cocido no representa ningún problema',
    short: 'Sí, cocido',
    summary:
      'El huevo bien cocido y sin nada más le sienta bien a un perro unas cuantas veces por semana; el huevo crudo puede transmitir salmonela.',
    why: [
      'PetMD (artículo del Dr. Hector Joy, veterinario) indica que los perros pueden comer huevo cocido sin peligro y con moderación; el AKC lo considera seguro y nutritivo siempre que esté bien cocido y se dé solo de vez en cuando.',
      'El huevo aporta proteína de gran calidad y fácil de digerir, con vitaminas A, D y E, vitaminas del grupo B, hierro, zinc y selenio (PetMD). También es rico en grasa, algo que importa en un perro propenso a la inflamación del páncreas (pancreatitis) (PetMD).',
    ],
    serve: [
      'Hiérvelo, revuélvelo o escálfalo, sin sal, mantequilla ni aceite (PetMD).',
      'Si es un huevo duro, cuécelo hasta que la clara y la yema estén firmes, déjalo enfriar y córtalo en trocitos (PetMD).',
    ],
    never: [
      'El huevo crudo: la ASPCA advierte de la salmonela y de E. coli, y PetMD y el AKC mencionan además la avidina, que se une a la biotina, una vitamina del grupo B.',
      'El huevo preparado con mantequilla, sal, cebolla o salsa de queso.',
    ],
    signs: [
      'Una alergia al huevo puede manifestarse con picazón, otitis, vómitos o diarrea (PetMD); el AKC menciona también ronchas e hinchazón, y aconseja introducir el huevo poco a poco.',
    ],
    disagree: [
      'Sobre el cascarón: el AKC advierte que sus bordes filosos pueden atragantar a un perro; PetMD acepta el cascarón horneado o hervido y molido hasta un polvo fino, como suplemento de calcio y con la orientación del veterinario.',
    ],
    usdaName: 'de huevo duro',
    piece: {
      a: 'un huevo grande',
      one: 'huevo grande',
      many: 'huevos grandes',
      basis: 'USDA: 1 huevo grande = 50 g',
    },
    sizeGuide: {
      note: 'Las cantidades de PetMD, una o dos veces por semana, con las categorías de peso convertidas a kilogramos.',
      rows: [
        ['Muy pequeño (1 a 5 kg)', '¼ de huevo'],
        ['Pequeño (5 a 9 kg)', '½ huevo'],
        ['Mediano (10 a 23 kg)', '1 huevo'],
        ['Grande (23 a 41 kg)', '1 huevo y medio'],
        ['Muy grande (41 kg o más)', '2 huevos'],
      ],
    },
    questions: [
      {
        question: '¿Los perros pueden comer huevo crudo?',
        answer:
          'Las fuentes dicen que no: el huevo crudo puede transmitir salmonela y E. coli (ASPCA), y la clara cruda contiene avidina, que bloquea la biotina (AKC, PetMD). Cuécelo por completo.',
      },
      {
        question: '¿Los perros pueden comer cascarón de huevo?',
        answer:
          'Las fuentes no coinciden. El AKC advierte de los bordes filosos; PetMD solo acepta el cascarón horneado o hervido y molido fino, como suplemento de calcio y con la orientación de tu veterinario.',
      },
    ],
    sources: [],
  },
  {
    id: 'yogurt',
    name: 'Yogur',
    food: 'yogur',
    answer: 'el yogur natural está permitido si no contiene xilitol',
    short: 'Sí, natural',
    summary:
      'Un yogur natural sin azúcar está bien en poca cantidad; revisa antes que no contenga xilitol.',
    why: [
      'PetMD (artículo de la Dra. Brittany Kleszynski, veterinaria) indica que el yogur griego natural sin azúcar suele ser la mejor opción para un perro, con más proteína y menos azúcar y lactosa que un yogur común. El AKC indica que la mayoría de los perros pueden comer yogur, pero que no siempre es recomendable por la lactosa.',
      'La ASPCA: los lácteos pueden causar diarrea y otras molestias digestivas, porque las mascotas no tienen suficiente lactasa. El AKC añade que su grasa puede favorecer una pancreatitis y que hay mejores fuentes de probióticos.',
    ],
    serve: [
      'Un yogur natural sin azúcar, con cultivos vivos; el yogur griego tiene menos lactosa (AKC, PetMD).',
      'Empieza con una cucharadita y observa cómo le cae a tu perro (AKC).',
    ],
    never: [
      'Los yogures azucarados o de sabores, y cualquier yogur con xilitol: según PetMD, el xilitol puede causar daño grave al hígado, una baja peligrosa del azúcar en la sangre y la muerte.',
    ],
    signs: ['Gases, diarrea o vómitos por la lactosa (AKC).'],
    usdaName: 'de yogur natural de leche descremada',
    piece: {
      a: 'una cucharada de yogur',
      one: 'cucharada',
      many: 'cucharadas',
      basis: 'un dieciseisavo de la taza (cup) de 245 g del USDA',
    },
    sizeGuide: {
      note: 'Las cantidades de PetMD, como máximo una vez al día, con las categorías de peso convertidas a kilogramos.',
      rows: [
        ['Muy pequeño (1 a 5 kg)', '½ cucharadita'],
        ['Pequeño (5 a 9 kg)', '1 cucharadita'],
        ['Mediano (10 a 23 kg)', '1 cucharada'],
        ['Grande (23 a 41 kg)', '2 cucharadas'],
        ['Muy grande (41 kg o más)', '3 cucharadas'],
      ],
    },
    questions: [
      {
        question: '¿Los perros pueden comer yogur griego?',
        answer:
          'El yogur griego natural sin azúcar es el que PetMD prefiere: más proteína, menos azúcar y menos lactosa que un yogur común.',
      },
      {
        question: '¿Los perros pueden comer yogurt?',
        answer:
          'Sí, yogurt es solo otra forma de escribir yogur: natural y sin azúcar, en poca cantidad, y nunca endulzado con xilitol (PetMD, AKC).',
      },
    ],
    sources: [],
  },
  {
    id: 'shrimp',
    name: 'Camarones (gambas)',
    food: 'camarones',
    answer: 'los camarones cocidos y pelados no representan ningún problema',
    short: 'Sí, pelados',
    summary:
      'Los camarones bien cocidos, pelados y sin nada más están bien en poca cantidad; los crudos y las cáscaras, no.',
    why: [
      'PetMD indica que los perros pueden comer sin peligro camarones bien preparados, y el AKC los acepta con moderación como premio ocasional.',
      'Los camarones aportan vitamina B12, niacina, fósforo y antioxidantes, y tienen poca grasa (AKC, PetMD). Contienen mucho colesterol: por eso el AKC los reserva para ocasiones especiales.',
    ],
    serve: [
      'Cuécelos por completo: hervidos, al vapor, a la parrilla o al horno (PetMD); el AKC considera que al vapor es la mejor opción.',
      'Retira la cáscara, la cola y la vena, y corta el camarón en trocitos (PetMD).',
      'Sin mantequilla, aceite, especias, ajo ni cebolla, y nada empanizado (empanado) ni frito (PetMD, AKC).',
    ],
    never: [
      'Los camarones crudos, que según el AKC portan patógenos peligrosos.',
      'Las cáscaras y las colas, que pueden atragantar a un perro, sobre todo a uno pequeño (AKC).',
    ],
    signs: [
      'Vómitos o diarrea si no los tolera (PetMD), y náuseas y dolor abdominal después de comer camarones crudos (PetMD).',
    ],
    usdaName: 'de camarones cocidos',
    piece: {
      a: 'una porción',
      one: 'porción de 100 g',
      many: 'porciones de 100 g',
      grams: 100,
      basis: 'la cantidad de referencia de las tablas nutricionales',
    },
    sizeGuide: {
      note: 'La tabla de porciones de PetMD, con las categorías de peso convertidas a kilogramos. El AKC habla de uno o dos camarones para la mayoría de los perros, y de un trozo de uno solo para un perro pequeño.',
      rows: [
        ['Muy pequeño (1 a 9 kg)', '½ camarón mediano'],
        ['Pequeño (10 a 14 kg)', '1 camarón mediano'],
        ['Mediano (14 a 23 kg)', '2 camarones medianos'],
        ['Grande (23 a 41 kg)', '3 camarones medianos'],
        ['Muy grande (41 kg o más)', 'Hasta 4 camarones medianos'],
      ],
    },
    questions: [
      {
        question: '¿Los perros pueden comer colas de camarón?',
        answer:
          'No. PetMD aconseja retirar la cáscara, la cola y la vena; el AKC indica que un perro puede atragantarse con las cáscaras.',
      },
      {
        question: '¿Los perros pueden comer camarones empanizados o fritos?',
        answer:
          'No: los camarones se dan bien cocidos, pelados y solos, sin nada empanizado (empanado) ni frito, y sin mantequilla, aceite, ajo ni cebolla (PetMD, AKC).',
      },
    ],
    sources: [],
  },
  {
    id: 'salmon',
    name: 'Salmón',
    food: 'salmón',
    answer: 'el salmón cocido y sin espinas no representa ningún problema',
    short: 'Sí, sin espinas',
    summary:
      'El salmón cocido y sin espinas está bien para los perros; el crudo puede transmitir una enfermedad que, sin tratamiento, suele ser mortal.',
    why: [
      'PetMD indica que el salmón cocido es apto para los perros, y el AKC (revisado por la Dra. Ashly Smith) indica que los perros pueden comerlo sin peligro y con moderación. Aporta ácidos grasos omega-3, proteína y vitamina B12 (PetMD).',
      'El peligro está en el pescado crudo o poco cocido. El Merck Veterinary Manual explica que los perros contraen la enfermedad por intoxicación del salmón (salmon poisoning disease) al comer truchas, salmones o salamandras gigantes del Pacífico crudos o poco cocidos que portan un gusano plano (trematodo) infectado a su vez por la bacteria Neorickettsia helminthoeca. La enfermedad se presenta en las zonas costeras del noroeste del Pacífico de Norteamérica, del norte de California a Alaska (Merck).',
    ],
    serve: [
      'Fresco, cocido y sin espinas (PetMD). El AKC: cocerlo hasta 60 °C en el centro.',
      'Solo, sin especias, aceite ni salsa (AKC). Enjuaga el salmón en lata para quitarle la sal y el aceite (PetMD), o elige una versión baja en sodio (AKC).',
    ],
    never: [
      'El salmón o la trucha crudos o poco cocidos (Merck, PetMD, AKC) y el salmón ahumado (AKC).',
      'Las espinas: según el AKC, las espinas pequeñas y quebradizas pueden perforar el intestino.',
    ],
    signs: [
      'Merck: los signos de la enfermedad aparecen unos 5 a 7 días después de que el perro come el pescado infectado, a veces hasta 33 días después. Fiebre alta, debilidad, falta de apetito, vómitos, diarrea con sangre, deshidratación y ganglios inflamados.',
      'Sin tratamiento, hasta el 90 % de los perros afectados mueren en un plazo de 7 a 10 días (Merck). El tratamiento se basa en antibióticos intravenosos administrados a tiempo y cuidados de apoyo: por eso, dile a tu veterinario si tu perro comió pescado crudo en las semanas anteriores.',
    ],
    disagree: [
      'Sobre la piel del salmón: PetMD considera segura la piel cocida e indica que incluso contiene más omega-3 que la carne; el AKC desaconseja el pescado ahumado o crudo, pero no dice nada de la piel cocida.',
    ],
    usdaName: 'de salmón del Atlántico de cultivo cocido',
    piece: {
      a: 'una porción',
      one: 'porción de 100 g',
      many: 'porciones de 100 g',
      grams: 100,
      basis: 'la cantidad de referencia de las tablas nutricionales',
    },
    sizeGuide: {
      note: 'Las cantidades de PetMD por semana, cocido, convertidas de onzas a gramos y de libras a kilogramos.',
      rows: [
        ['Muy pequeño (1 a 9 kg)', 'Unos 30 a 55 g'],
        ['Pequeño (10 a 14 kg)', 'Unos 55 a 85 g'],
        ['Mediano (14 a 23 kg)', 'Unos 85 a 115 g'],
        ['Grande (23 a 41 kg)', 'Unos 115 a 170 g'],
        ['Muy grande (41 kg o más)', 'Unos 170 a 225 g'],
      ],
    },
    questions: [
      {
        question: 'Mi perro comió salmón crudo, ¿qué hago?',
        answer:
          'Llama a tu veterinario, sobre todo en el noroeste del Pacífico de Norteamérica, donde vive el gusano infectado según Merck. Los signos suelen aparecer de 5 a 7 días después, y los antibióticos dados a tiempo funcionan; sin tratamiento, hasta el 90 % de los perros afectados mueren.',
      },
      {
        question: '¿Los perros pueden comer salmón ahumado?',
        answer:
          'No: el AKC desaconseja el salmón ahumado, igual que el pescado crudo. Dale el salmón solo cocido, sin condimentos y sin espinas.',
      },
    ],
    sources: [],
  },
  {
    id: 'pork',
    name: 'Cerdo',
    food: 'cerdo',
    answer: 'el cerdo solo magro, sin condimentos y bien cocido',
    short: 'Sí, bien cocido',
    summary:
      'El cerdo magro, bien cocido, sin condimentos y sin hueso está bien en poca cantidad; el tocino, el jamón y la carne cruda, no.',
    why: [
      'PetMD indica que los perros pueden comer cerdo con moderación si está bien cocido, sin condimentos, magro y sin hueso; el AKC considera seguro el cerdo cocido sin condimentos, con moderación, pero peligrosos muchos productos de cerdo.',
      'El problema es la grasa. Según PetMD, los cortes grasos pueden provocar una pancreatitis, y el AKC indica que la grasa de cerdo es difícil de digerir. El cerdo crudo puede transmitir el parásito Trichinella spiralis (triquina) y salmonela (PetMD, AKC).',
    ],
    serve: [
      'Cuécelo por completo: 71 °C en el centro para la carne molida, 63 °C para las chuletas, los filetes y los asados (PetMD).',
      'Cortes magros como el lomo, sin la grasa, en trocitos y sin condimentar (PetMD). El AKC: nada de cebolla ni ajo en polvo, nada de nuez moscada ni de salsa barbecue.',
    ],
    never: [
      'El cerdo crudo (PetMD, AKC).',
      'Los huesos: cocidos se vuelven quebradizos y se astillan (AKC), y según la ASPCA un hueso puede obstruir el intestino y hacer necesaria una cirugía.',
      'El tocino, el jamón y las salchichas (AKC, PetMD).',
    ],
    signs: [
      'Triquinosis después de comer cerdo crudo: molestias digestivas, vómitos, diarrea, fiebre, decaimiento y dolores musculares (AKC).',
    ],
    usdaName: 'de lomo de cerdo magro asado',
    piece: {
      a: 'una porción',
      one: 'porción de 100 g',
      many: 'porciones de 100 g',
      grams: 100,
      basis: 'la cantidad de referencia de las tablas nutricionales',
    },
    sizeGuide: {
      note: 'Las cantidades de PetMD, en trozos de unos 1,3 cm de largo y 1,3 cm de grosor, con las categorías de peso convertidas a kilogramos.',
      rows: [
        ['Muy pequeño (1 a 5 kg)', '1 trozo'],
        ['Pequeño (5 a 9 kg)', '1 a 2 trozos'],
        ['Mediano (10 a 23 kg)', '2 a 3 trozos'],
        ['Grande (23 a 41 kg)', '3 a 4 trozos'],
        ['Muy grande (41 kg o más)', '4 a 5 trozos'],
      ],
    },
    questions: [
      {
        question: '¿Los perros pueden comer huesos de cerdo?',
        answer:
          'No. El AKC indica que los huesos cocidos se vuelven frágiles y quebradizos y pueden astillarse, y según la ASPCA un hueso tragado puede lesionar u obstruir el intestino, a veces hasta requerir cirugía.',
      },
      {
        question: '¿Los perros pueden comer cerdo crudo?',
        answer:
          'No. El cerdo crudo puede transmitir la triquina (Trichinella spiralis) y salmonela (PetMD, AKC). Cuécelo por completo.',
      },
    ],
    sources: [],
  },
  {
    id: 'ham',
    name: 'Jamón',
    food: 'jamón',
    answer: 'el jamón es demasiado salado y graso',
    short: 'Mejor evitarlo',
    summary:
      'El jamón no es tóxico, pero es salado y graso: PetMD y el AKC desaconsejan darlo como premio.',
    why: [
      'PetMD indica que el jamón no es tóxico para los perros, pero que no es un premio adecuado; el AKC lo desaconseja y prefiere premios más saludables.',
      'Las razones son la sal y la grasa. Según el AKC, el exceso de sal puede ser tóxico para los perros, y los nitratos y nitritos del jamón curado añaden todavía más sodio. El jamón en rebanadas del USDA contiene 814 mg de sodio por cada 100 g. Su grasa, además, aumenta el riesgo de pancreatitis (AKC, PetMD).',
    ],
    serve: [
      'Si se comió un trocito que cayó al suelo, según PetMD tu perro debería estar perfectamente bien.',
      'Llama a tu veterinario si comió mucho o si muestra alguno de los signos de abajo (PetMD).',
    ],
    never: [
      'Los huesos de jamón: cocidos se astillan con facilidad, según PetMD, y pueden atragantar a un perro u obstruir su intestino.',
      'El jamón glaseado o con miel, por el azúcar (PetMD).',
    ],
    signs: [
      'Decaimiento, falta de apetito, babeo, dolor abdominal, vómitos y diarrea (PetMD). Demasiada sal: sed, orina abundante, vómitos y diarrea, y en los casos graves daño renal, convulsiones y coma (AKC).',
    ],
    usdaName: 'de jamón en rebanadas (aproximadamente 11 % de grasa)',
    piece: {
      a: 'una rebanada de jamón',
      one: 'rebanada',
      many: 'rebanadas',
      basis: 'USDA: 1 rebanada = 28 g',
    },
    questions: [
      {
        question: '¿Los perros pueden comer jamón de Navidad?',
        answer:
          'No como premio: el jamón glaseado suma azúcar a la sal y la grasa (PetMD), y el hueso se astilla. Un trocito sobrante no es una urgencia; si se comió un hueso o mucho jamón, llama a tu veterinario.',
      },
    ],
    sources: [],
  },
  {
    id: 'bacon',
    name: 'Tocino (beicon)',
    food: 'tocino',
    answer: 'el tocino es demasiado graso y salado',
    short: 'Mejor evitarlo',
    summary:
      'El tocino es graso y muy salado, un riesgo de pancreatitis y de intoxicación por sal; las fuentes veterinarias lo desaconsejan.',
    why: [
      'La guía de Chewy, revisada por veterinarios, indica que los perros no deberían comer tocino, y el AKC cuenta el tocino y el jamón entre los productos de cerdo que no se les deben dar a los perros.',
      'Las razones son la grasa y la sal. Merck cuenta la ingestión de grandes cantidades de sobras de comida u otros alimentos inadecuados entre los factores de riesgo frecuentes de la pancreatitis, y FirstVet califica la pancreatitis de urgencia potencialmente mortal. El tocino horneado del USDA contiene 2193 mg de sodio por cada 100 g. Chewy añade que los nitritos que se usan para conservarlo pueden dañar a los perros.',
    ],
    serve: [
      'Una sola tira robada no suele ser una urgencia, pero vigila los signos de abajo.',
      'Chewy aconseja llamar de inmediato a tu veterinario si tu perro vomita, tiene diarrea, está decaído o deja de comer; según FirstVet, el dolor abdominal requiere atención de urgencia.',
    ],
    never: [
      'El tocino, la grasa que suelta al cocinarlo y los recortes de grasa.',
      'El tocino crudo, que tiene los riesgos del cerdo crudo (PetMD, ASPCA).',
    ],
    signs: [
      'Diarrea, vómitos y malestar poco después (Chewy). Pancreatitis: falta de apetito, vómitos, debilidad, dolor abdominal, deshidratación y diarrea (Merck). Demasiada sal: temblores, fiebre alta y convulsiones (Chewy).',
    ],
    disagree: [
      'FirstVet indica que la mayoría de los perros toleran cantidades controladas de premios de tocino; Chewy y el AKC dicen: nada de tocino. PetMD y el AKC no tienen una página dedicada solo al tocino.',
    ],
    usdaName: 'de tocino horneado',
    piece: {
      a: 'una tira de tocino',
      one: 'tira',
      many: 'tiras',
      basis: 'USDA: 1 tira cocida = 8,1 g',
    },
    questions: [
      {
        question: 'Mi perro comió grasa de tocino, ¿qué hago?',
        answer:
          'La grasa que suelta el tocino es casi grasa pura, justo lo que aumenta el riesgo de pancreatitis. Llama a tu veterinario, con más razón si es un perro pequeño o una gran cantidad, y vigila los vómitos, el dolor abdominal y que deje de comer (Merck, FirstVet).',
      },
    ],
    sources: [],
  },
];
