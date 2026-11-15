import { SOURCES_DE } from '../../de/foods/sources.ts';
import { SOURCES_ES } from './sources.ts';
import type { FoodEs } from './types.ts';

/** The vegetables of the Spanish pages, in the order of the route table. */
export const VEGETABLES_ES: readonly FoodEs[] = [
  {
    id: 'tomatoes',
    name: 'Tomate',
    food: 'tomate',
    answer: 'solo la pulpa roja y bien madura',
    short: 'Sí, solo maduro',
    summary:
      'La pulpa del tomate maduro no es tóxica; las partes verdes de la planta y los tomates verdes, sí.',
    why: [
      'La ASPCA clasifica la planta del tomate como tóxica para perros, gatos y caballos por su solanina, y aclara que el fruto maduro no lo es. El AKC escribe que un perro puede comer tomate maduro, pero solo en pequeñas cantidades.',
      'Como sustancias tóxicas, el AKC nombra la solanina y la tomatina, emparentada con ella, presentes sobre todo en las partes verdes de la planta; PetMD señala la tomatina de los tallos, las hojas y los tomates verdes sin madurar.',
      'El tomate maduro aporta fibra, vitamina C, potasio y antioxidantes como el licopeno (AKC, PetMD).',
    ],
    serve: [
      'Solo tomates bien rojos y maduros. El AKC aconseja retirar todas las partes verdes y cortar la pulpa en cubitos.',
      'Lávalo, retira el tallo y las hojas, y dáselo solo o mezclado con su comida (PetMD).',
    ],
    never: [
      'Las hojas, los tallos y los zarcillos de la planta, y los tomates verdes sin madurar (ASPCA, AKC, PetMD). Mantén a tu perro lejos de la huerta.',
      'La salsa de tomate, la sopa de tomate, la cátsup (kétchup) y las salsas tipo pico de gallo, que a menudo llevan ajo y cebolla (AKC, PetMD).',
    ],
    signs: [
      'Para la planta, la ASPCA nombra salivación excesiva, pérdida del apetito, fuertes molestias digestivas, decaimiento, debilidad, pupilas dilatadas y un ritmo cardíaco lento. El AKC añade falta de coordinación, temblores y un ritmo cardíaco irregular.',
      'El AKC: si tu perro comió muchos tomates o partes de la planta, llama a tu veterinario.',
    ],
    usdaName: 'de tomates rojos maduros',
    piece: {
      a: 'un tomate cherry',
      one: 'tomate cherry',
      many: 'tomates cherry',
      basis: 'USDA: 1 tomate cherry = 17 g',
    },
    questions: [
      {
        question: 'Mi perro comió hojas de tomate en el jardín. ¿Es grave?',
        answer:
          'Las hojas y los tallos son las partes tóxicas (ASPCA). Llama a tu veterinario y dile cuánto comió y cuánto pesa tu perro; el AKC aconseja llamar si comió muchos tomates o partes de la planta.',
      },
      {
        question: '¿Los perros pueden comer tomate cocido o salsa de tomate?',
        answer:
          'La pulpa madura cocida, sin nada más, sigue siendo el mismo alimento. Pero las salsas, las sopas y la cátsup suelen llevar cebolla y ajo (AKC, PetMD), y los dos son tóxicos para los perros.',
      },
    ],
    sources: [],
  },
  {
    id: 'avocado',
    name: 'Aguacate (palta)',
    food: 'aguacate',
    answer: 'el hueso y la grasa son el verdadero riesgo',
    short: 'Mejor evitarlo',
    summary:
      'El perro resiste la persina mejor que aves o caballos, pero el hueso, la grasa y el guacamole hacen del aguacate un mal premio.',
    why: [
      'Para otros animales, el aguacate es mucho más peligroso. La lista de plantas de la ASPCA lo clasifica como tóxico para los caballos, y su página de alimentos lo presenta sobre todo como un problema para aves, conejos, burros, caballos y rumiantes. El Manual de veterinaria de MSD (la edición en español del Merck) escribe que las aves enjauladas parecen ser más sensibles a sus efectos y que los perros parecen ser relativamente resistentes en comparación con otras especies; el Merck cita un solo reporte de dos perros con el corazón dañado tras comer aguacate. CliniTox, la base de datos de tóxicos de la facultad Vetsuisse de Zúrich, escribe que dosis altas de persina pueden dañar el músculo cardíaco en los mamíferos distintos del perro y el gato, y en las aves.',
      'Para un perro, los riesgos están en otra parte. Según el Merck, un hueso tragado puede obstruir el intestino. PetMD, en un artículo de un veterinario, escribe que su grasa puede causar una inflamación del páncreas (pancreatitis) y concluye que los riesgos superan a los beneficios; CliniTox nombra los mismos dos peligros, la pancreatitis por la grasa y la obstrucción intestinal por el hueso. Las hojas, la cáscara y el hueso son lo que más persina tiene (AKC, con el Dr. Michael Hyder).',
    ],
    serve: [
      'Si tu perro comió un poco de pulpa, vigila si vomita, tiene diarrea o está decaído, y llama a tu veterinario si ves alguno de esos signos (AKC).',
      'Si se tragó el hueso o parece atragantarse, PetMD aconseja ir cuanto antes a una clínica veterinaria de urgencias.',
      'El AKC y PetMD fijan los dos un tope para una simple probada de pulpa sola: como máximo una cucharadita por cada 10 libras (4,5 kg) de peso corporal, calculado abajo. Si tu perro tiende a la pancreatitis o tiene sobrepeso, ni siquiera eso (AKC).',
    ],
    never: [
      'El hueso, la cáscara y las hojas (PetMD, AKC).',
      'El guacamole: lleva cebolla, ajo y sal (PetMD).',
    ],
    signs: [
      'Vómitos, diarrea y dolor de barriga (PetMD), decaimiento (AKC) y los signos de una pancreatitis causada por la grasa.',
    ],
    disagree: [
      'Muchas listas dicen que el aguacate es tóxico para los perros. Las fuentes primarias de esta página no lo dicen: la ficha de la ASPCA solo nombra a los caballos, MSD considera a los perros relativamente resistentes y CliniTox excluye expresamente al perro y al gato del daño cardíaco. El AKC y PetMD permiten una pequeña cantidad de pulpa, y aun así PetMD la desaconseja.',
    ],
    thresholds: [
      {
        label: 'AKC y PetMD: como máximo, en cucharaditas de pulpa sola',
        lead: 'el tope que el AKC y PetMD fijan en una cucharadita por cada 10 libras (4,5 kg)',
        unit: { one: 'cucharadita', many: 'cucharaditas' },
      },
    ],
    thresholdNote:
      'El tope que el AKC y PetMD dan para una probada de pulpa de aguacate sola, una cucharadita por cada 10 libras (4,5 kg) de peso corporal, calculado para cuatro pesos. Es un máximo, no una porción que las fuentes recomienden.',
    questions: [
      {
        question: 'Mi perro comió guacamole. ¿Qué hago?',
        answer:
          'Llama a tu veterinario. El aguacate es lo de menos: el guacamole casi siempre lleva cebolla y ajo, y los dos son tóxicos para los perros (PetMD).',
      },
      {
        question: '¿El aguacate es tóxico para los perros?',
        answer:
          'No en sentido estricto, según las fuentes de esta página: MSD escribe que los perros parecen ser relativamente resistentes en comparación con otras especies, y CliniTox excluye al perro y al gato del daño cardíaco. Lo peligroso para un perro es el hueso, que puede obstruir el intestino, y la grasa, que puede causar una pancreatitis.',
      },
      {
        question: '¿Cuánto aguacate puede comer un perro?',
        answer:
          'Como máximo una cucharadita de pulpa sola por cada 10 libras (4,5 kg) de peso corporal, el tope del AKC y PetMD; la tabla de arriba lo calcula para cuatro pesos. Es un tope para una probada, no una porción recomendada, y PetMD desaconseja dárselo.',
      },
    ],
    sources: [SOURCES_DE.clinitoxAvocado, SOURCES_ES.msdAvocado],
  },
  {
    id: 'onions',
    name: 'Cebolla',
    food: 'cebolla',
    answer: 'la cebolla es tóxica para los perros',
    short: 'No, en ninguna forma',
    summary:
      'En cualquier forma, la cebolla daña los glóbulos rojos del perro, y los signos suelen tardar varios días en verse.',
    why: [
      'La ASPCA clasifica la cebolla como tóxica para perros, gatos y caballos; su sustancia tóxica es el disulfuro de n-propilo. El Merck escribe que los oxidantes azufrados de los Allium destruyen los glóbulos rojos (hemólisis), lo que puede llevar a una anemia. El Manual de veterinaria de MSD (la edición en español del Merck) añade que los gatos son las especies más sensibles, seguidas de los perros.',
      'Cocinarla no cambia nada. El AKC: cruda o cocida, frita o en polvo, la cebolla y los demás Allium le hacen daño al perro, y MSD nombra como tóxicas las cebollas o ajos crudos, cocidos, deshidratados o granulados. PetMD también nombra la cebolla de verdeo (cebollín), el cebollino y el poro (puerro).',
      'PetMD nombra a los perros con más riesgo: las razas japonesas como el akita y el shiba inu, que CliniTox, la base de datos de tóxicos de la facultad Vetsuisse de Zúrich, también considera especialmente sensibles, y los perros diabéticos, con una enfermedad del hígado o anemia, o que toman ciertos medicamentos.',
    ],
    serve: [
      'Llama ya a tu veterinario o a una clínica veterinaria de urgencias, aunque tu perro parezca estar bien: el daño ocurre antes de que se note.',
      'Di cuánta cebolla comió y en qué forma; la cebolla en polvo, las sopas instantáneas y las salsas están concentradas.',
      'No esperes a ver signos y no lo trates por tu cuenta: no le provoques el vómito en casa sin que te lo indique un veterinario.',
    ],
    never: [
      'La cebolla cruda, cocida, frita o en polvo, ni la cebolla de verdeo, el cebollino o el poro (AKC, PetMD).',
      'Las sobras preparadas con ella: rellenos, salsas, sopas, pizzas, hamburguesas y papillas para bebé con cebolla en polvo.',
    ],
    signs: [
      'El Merck: los signos no se ven en general hasta que se destruyen muchos glóbulos rojos, casi siempre unos días después de comerla; MSD escribe que la hemólisis suele producirse 3-5 días después de la exposición. PetMD escribe que pueden aparecer en un día o más tarde, y CliniTox nombra de uno a varios días según la cantidad.',
      'Vigila debilidad, encías pálidas, orina roja o marrón, corazón y respiración acelerados, decaimiento, pérdida del apetito y colapso (ASPCA, Merck, AKC); CliniTox nombra además ictericia. VCA escribe que cualquier cantidad puede caer mal al estómago, que cantidades mayores dañan los glóbulos rojos y que puede seguir un daño en los riñones.',
    ],
    disagree: [
      'Las fuentes no ponen el límite en el mismo punto. PetMD escribe que la intoxicación se ve con regularidad en perros que comen más del 0,5 % de su peso en cebolla, y los 100 g para un perro de 20 kg del AKC son la misma cifra; CliniTox también nombra más del 0,5 % del peso de una vez. MSD escribe que la ingestión de 15-30 g/kg de cebolla cruda ha provocado signos clínicos, de tres a seis veces más, y CliniTox da esos mismos 15 a 30 g por kg como dosis tóxica en el perro. La tabla muestra los dos límites.',
    ],
    usdaName: 'de cebolla cruda',
    piece: {
      a: 'una cebolla mediana',
      one: 'cebolla mediana',
      many: 'cebollas medianas',
      basis: 'USDA: 1 cebolla mediana (6,4 cm de diámetro) = 110 g',
    },
    thresholds: [
      {
        label: 'PetMD y AKC: 0,5 % del peso corporal',
        lead: 'el límite del 0,5 % del peso corporal, a partir del cual PetMD ve intoxicaciones con regularidad,',
      },
      {
        label: 'MSD: signos desde 15 g/kg',
        lead: 'la dosis más baja con la que MSD describe signos, 15 g/kg,',
      },
    ],
    thresholdNote:
      'Los gramos de cebolla con los que un perro llega al límite de cada fuente, para cuatro pesos, y lo mismo en cebollas medianas de 110 g según el USDA. Ahí las fuentes ven daño; por debajo no hay una cantidad segura: el daño de la cebolla se suma, y algunos perros reaccionan con menos.',
    questions: [
      {
        question: 'Mi perro comió comida con cebolla. ¿Un poco de cebolla es grave?',
        answer:
          'No hay una cantidad recomendada. Llama a tu veterinario o a una clínica veterinaria de urgencias y di qué plato era y cuánto comió tu perro; la cebolla en polvo y la deshidratada tienen mucha más cebolla por cucharada que la fresca.',
      },
      {
        question: '¿Cuánto tardan en aparecer los signos?',
        answer:
          'A menudo varios días: MSD escribe que la hemólisis suele producirse 3-5 días después de la exposición, y el Merck que los signos no se ven en general hasta que se destruyen bastantes glóbulos rojos. Por eso llamas antes de que aparezcan.',
      },
    ],
    sources: [SOURCES_DE.clinitoxAllium, SOURCES_ES.msdAllium],
  },
  {
    id: 'garlic',
    name: 'Ajo',
    food: 'ajo',
    answer: 'el ajo es tóxico para los perros',
    short: 'No, es tóxico',
    summary:
      'En cualquier forma, el ajo es varias veces más tóxico que la cebolla para el perro, y el ajo en polvo es el más concentrado.',
    why: [
      'La ASPCA clasifica el ajo como tóxico para perros, gatos y caballos, por el mismo disulfuro de n-propilo que la cebolla. El Merck escribe que el ajo es de 3 a 5 veces más tóxico que la cebolla; el AKC y PetMD dicen cinco veces.',
      'PetMD: el ajo es tóxico para el perro en cualquier forma, fresco, seco o en polvo, y el Manual de veterinaria de MSD (la edición en español del Merck) nombra como tóxicos los ajos crudos, cocidos, deshidratados o granulados. VCA escribe que una cucharadita de ajo en polvo equivale a ocho dientes frescos.',
      'El AKC escribe, con el Dr. Michael Hyder, que un perro no debería comer ajo ni siquiera como ingrediente, por ejemplo en una masa de pizza, y desaconseja los productos antipulgas y antigarrapatas a base de ajo. El akita y el shiba inu son más sensibles (AKC), y CliniTox, la base de datos de tóxicos de la facultad Vetsuisse de Zúrich, también nombra estas razas como especialmente sensibles.',
    ],
    serve: [
      'Llama ya a tu veterinario o a una clínica veterinaria de urgencias. El AKC aconseja llamar incluso por una cantidad pequeña, porque un tratamiento temprano marca la diferencia.',
      'Di en qué forma lo comió: un diente, pan de ajo o ajo en polvo, el más concentrado. No le provoques el vómito en casa sin que te lo indique un veterinario.',
    ],
    never: [
      'El ajo fresco, el ajo en polvo, la sal de ajo, el pan de ajo y los platos cocinados con ajo.',
      'Los suplementos de ajo y los antipulgas de ajo (AKC).',
    ],
    signs: [
      'PetMD: los signos aparecen casi siempre en las primeras 24 horas, pero pueden tardar hasta una semana. El AKC: vómitos y diarrea en pocas horas; encías pálidas, debilidad, orina oscura y anemia a los dos a cinco días.',
      'También decaimiento, salivación excesiva, respiración rápida y marcha tambaleante (PetMD, AKC).',
    ],
    disagree: [
      'PetMD escribe que 2 g de ajo por libra de peso corporal (unos 4,4 g por kg) ya pueden causar molestias digestivas y vómitos, y que un perro de 25 libras (11 kg) necesita tratamiento a partir de 50 g, unos 10 dientes según su cálculo de 5 g por diente. El USDA pesa un diente en 3 g: esos mismos 50 g son unos 17 dientes USDA. El Merck no da una dosis para el ajo, solo que es de 3 a 5 veces más tóxico que la cebolla.',
      'CliniTox da como dosis tóxica para el perro 5 g de ajo entero por kg de peso corporal, dados a lo largo de 7 días (en extracto, 1,25 ml por kg): una cantidad repartida en una semana, no una sola comida.',
    ],
    usdaName: 'de ajo crudo',
    piece: {
      a: 'un diente de ajo',
      one: 'diente de ajo',
      many: 'dientes de ajo',
      basis: 'USDA: 1 diente = 3 g',
    },
    thresholds: [
      {
        label: 'PetMD: molestias digestivas desde 2 g por libra',
        lead: 'la cantidad de 2 g por libra a partir de la cual, según PetMD, pueden empezar las molestias digestivas y los vómitos,',
      },
    ],
    thresholdNote:
      'La cifra de PetMD, 2 g de ajo por libra de peso corporal (unos 4,4 g por kg), calculada para cuatro pesos, en gramos y en dientes USDA de 3 g. Ahí empiezan las molestias digestivas según PetMD; el daño a los glóbulos rojos llega con más. Llama por cualquier cantidad de ajo.',
    questions: [
      {
        question: '¿Un poco de ajo es bueno para los perros?',
        answer:
          'No. Todas las fuentes veterinarias de esta página dicen que el ajo es tóxico para el perro en cualquier forma, y el veterinario del AKC desaconseja los productos antipulgas con ajo.',
      },
      {
        question: 'Mi perro comió un trozo de pan de ajo. ¿Qué hago?',
        answer:
          'Llama a tu veterinario. El AKC aconseja llamar incluso por una cantidad pequeña, porque un tratamiento temprano marca la diferencia; di cuánto pan comió y si tenía ajo en polvo, el más concentrado.',
      },
    ],
    sources: [SOURCES_DE.clinitoxAllium, SOURCES_ES.msdAllium],
  },
  {
    id: 'carrots',
    name: 'Zanahoria',
    food: 'zanahoria',
    answer: 'la zanahoria es un premio seguro y bajo en calorías',
    short: 'Sí, en trozos pequeños',
    summary:
      'Cruda o cocida, sola, la zanahoria es buena para los perros; córtala en trozos pequeños para que no se atragante.',
    why: [
      'El AKC escribe que un perro puede comer zanahoria como bocadillo sano y bajo en calorías, y PetMD la considera segura para la mayoría de los perros.',
      'Aporta betacaroteno, que el cuerpo convierte en vitamina A, además de fibra y potasio, y masticarla es bueno para los dientes (AKC, PetMD). Con 35 kcal por 100 g de zanahorias baby (USDA), está entre los premios más ligeros de este sitio.',
    ],
    serve: [
      'Lávala o pélala para quitar la tierra y los pesticidas (AKC).',
      'Cruda o cocida, siempre sola (AKC, PetMD). Corta las zanahorias enteras, y también los bastones, en bocados para que tu perro no se atragante (AKC); PetMD propone rodajas de unos 6 mm de grosor.',
    ],
    never: [
      'Zanahorias enteras a un perro que traga sin masticar: los trozos grandes pueden atragantarlo u obstruir el intestino (AKC, PetMD).',
      'Las zanahorias con mantequilla, sal, cebolla o ajo, y el pastel de zanahoria.',
    ],
    usdaName: 'de zanahorias baby crudas',
    piece: {
      a: 'una zanahoria baby',
      one: 'zanahoria baby',
      many: 'zanahorias baby',
      basis: 'USDA: 1 zanahoria baby mediana = 10 g',
    },
    disagree: [
      'El AKC propone zanahorias frías o congeladas para los cachorros a los que les salen los dientes; PetMD ve en las zanahorias congeladas un riesgo para los dientes. PetMD también señala su azúcar natural en perros diabéticos o con sobrepeso.',
    ],
    questions: [
      {
        question: '¿Los perros pueden comer zanahoria todos los días?',
        answer:
          'Las fuentes tratan la zanahoria como un premio, así que vale la regla del 10 %. Todo el presupuesto de premios de la tabla de arriba ya son muchas zanahorias baby: la zanahoria no debería ser el único premio del día.',
      },
      {
        question: '¿Un cachorro al que le salen los dientes puede morder zanahorias congeladas?',
        answer:
          'Aquí las fuentes se contradicen: el AKC propone zanahorias frías o congeladas para los cachorros a los que les salen los dientes, y PetMD ve en ellas un riesgo para los dientes. En la duda, pregúntale a tu veterinario.',
      },
    ],
    sources: [],
  },
  {
    id: 'broccoli',
    name: 'Brócoli',
    food: 'brócoli',
    answer: 'solo y en trozos pequeños',
    short: 'Sí, pero poco',
    summary:
      'El brócoli sin condimentos es seguro en pequeñas cantidades, pero el AKC lo considera tóxico por encima de un cuarto de la comida del día.',
    why: [
      'El AKC escribe, con la revisión de su veterinario jefe, el Dr. Jerry Klein, que un perro puede comer brócoli cocido o crudo, sin condimentos ni aceite. Es rico en fibra y vitamina C, y bajo en grasa (AKC).',
      'El límite viene de los isotiocianatos de los floretes, que pueden irritar el estómago (AKC, PetMD). El AKC: el brócoli se considera seguro mientras sea menos del 10 % de la alimentación del día, y tóxico por encima del 25 %. PetMD cita a la veterinaria especialista en comportamiento Dra. Leslie Sinn, que pone el límite tóxico por encima del 20 al 25 % de la alimentación del día.',
    ],
    serve: [
      'Cocido al vapor, hervido o en el microondas, cortado en trozos pequeños, frío y solo (PetMD); el AKC también lo permite crudo.',
      'Córtalo en bocados y empieza con muy poco (AKC).',
    ],
    never: [
      'Trozos grandes de tallo: según el AKC, pueden atorarse en el esófago, sobre todo en perros pequeños, y PetMD dice que los tallos crudos son peligrosos por atragantamiento y obstrucción intestinal.',
      'El brócoli con mantequilla, aceite, salsa de queso o ajo.',
    ],
    signs: [
      'Un estómago irritado: vómitos, gases o diarrea. PetMD aconseja una clínica veterinaria de urgencias si hay atragantamiento, vómitos o diarrea que duran más de 24 horas, un abdomen duro o hinchado, o decaimiento.',
    ],
    usdaName: 'de brócoli crudo',
    piece: {
      a: 'un florete de brócoli con su tallo',
      one: 'florete con su tallo',
      many: 'floretes con su tallo',
      basis: 'USDA: 1 florete con su tallo (unos 13 cm de largo) = 31 g',
    },
    ceiling: 'AKC: tóxico desde el 25 % del día',
    sizeGuide: {
      note: 'Las cantidades de PetMD, de una a tres veces por semana, con las categorías de peso pasadas de libras a kilogramos.',
      rows: [
        ['Muy pequeño (1 a 5 kg)', '½ a 1 cucharadita'],
        ['Pequeño (5 a 9 kg)', '1 a 2 cucharaditas'],
        ['Mediano (10 a 23 kg)', '1 a 2 cucharadas'],
        ['Grande (23 a 41 kg)', '2 a 3 cucharadas'],
        ['Muy grande (desde 41 kg)', '3 a 4 cucharadas'],
      ],
    },
    disagree: [
      'El AKC pone el límite tóxico por encima del 25 % de la alimentación del día, la fuente de PetMD por encima del 20 al 25 %. Ninguna dice si la parte se cuenta en calorías o en peso; la tabla la lee en calorías, con la misma necesidad de mantenimiento que el presupuesto de premios.',
    ],
    questions: [
      {
        question: '¿Los perros pueden comer tallos de brócoli?',
        answer:
          'Sí, cortados pequeños y cocidos; no, enteros o en trozos grandes. El AKC advierte que los tallos pueden atorarse en el esófago, sobre todo en perros pequeños.',
      },
      {
        question: '¿Cuánto brócoli es demasiado para un perro?',
        answer:
          'Según el AKC, el brócoli es seguro mientras quede por debajo del 10 % de la alimentación del día, y tóxico por encima del 25 %. La columna de la derecha de la tabla de arriba pasa ese 25 % a gramos para cuatro pesos.',
      },
    ],
    sources: [],
  },
  {
    id: 'cucumber',
    name: 'Pepino',
    food: 'pepino',
    answer: 'el pepino es un premio ligero y seguro',
    short: 'Sí, en rodajas',
    summary:
      'Las rodajas de pepino solo son buenas para los perros y casi pura agua; los pepinillos encurtidos son otra cosa.',
    why: [
      'PetMD considera el pepino seguro y sano para los perros, y el AKC seguro y bajo en calorías si se da bien.',
      'Es alrededor de un 96 % agua (AKC, PetMD), sin grasa y muy bajo en sodio (AKC), y aporta vitamina K, potasio y magnesio (PetMD). Con 15 kcal por 100 g según el USDA, es el alimento más ligero de toda la lista de este sitio.',
    ],
    serve: [
      'Lava el pepino y córtalo en rodajas del tamaño adecuado para tu perro, nunca un pepino entero (AKC). PetMD propone rodajas de 2,5 cm de diámetro como máximo y unos 6 mm de grosor.',
      'Crudo como premio o sobre su comida, o congelado dentro de un juguete con frutas aptas para perros (PetMD).',
    ],
    never: [
      'Un pepino entero o trozos grandes, que pueden atragantar sobre todo a los perros pequeños u obstruir el intestino (PetMD, AKC).',
      'Los pepinillos encurtidos y los pepinos en vinagre: según PetMD, tienen mucha sal y especias como el ajo y la cebolla.',
    ],
    usdaName: 'de pepino crudo con cáscara',
    piece: {
      a: 'media taza de rodajas de pepino',
      one: 'media taza de rodajas',
      many: 'medias tazas de rodajas',
      basis: 'USDA: ½ taza (cup) de rodajas = 52 g',
    },
    sizeGuide: {
      note: 'La tabla de porciones de PetMD en rodajas, con las categorías de peso pasadas a kilogramos.',
      rows: [
        ['Muy pequeño (1 a 9 kg)', '1 a 2 rodajas'],
        ['Pequeño (10 a 14 kg)', '2 a 3 rodajas'],
        ['Mediano (14 a 23 kg)', '5 a 6 rodajas'],
        ['Grande (23 a 41 kg)', 'Un puñado de rodajas'],
        ['Muy grande (desde 41 kg)', 'Un buen puñado'],
      ],
    },
    questions: [
      {
        question: '¿Los perros pueden comer la cáscara del pepino?',
        answer:
          'Sí: las fuentes dan el pepino lavado, con cáscara, en rodajas. El AKC cuenta unas 8 calorías por media taza de rodajas.',
      },
      {
        question: '¿El pepino es un buen premio para un perro que debe bajar de peso?',
        answer:
          'Entre los alimentos de este sitio, es el que menos calorías tiene, y el AKC lo considera bajo en calorías. Aun así, el plan para bajar de peso se decide con tu veterinario: el pepino también cuenta en el presupuesto de premios.',
      },
    ],
    sources: [],
  },
  {
    id: 'bell-peppers',
    name: 'Pimiento morrón',
    food: 'pimiento',
    answer: 'el pimiento morrón sin condimentos es seguro',
    short: 'Sí, sin semillas',
    summary:
      'El pimiento morrón de cualquier color es bueno para los perros, sin semillas y solo; los chiles picantes, no.',
    why: [
      'La Dra. Carly Fox, veterinaria citada por el AKC: el pimiento morrón no es tóxico y es un bocadillo sano para compartir con tu perro. PetMD considera seguro el pimiento morrón sin condimentos, con moderación.',
      'Todos los colores sirven, y el rojo es el que más vitaminas y antioxidantes tiene (AKC). Aporta vitaminas A, C, E y B6, betacaroteno y luteína (AKC), además de fibra (PetMD).',
    ],
    serve: [
      'Retira las semillas y el tallo, lo que evita molestias digestivas según el AKC.',
      'Crudo y cortado pequeño, cocido al vapor o en puré, siempre solo: sin ajo, cebolla, sal, aceite ni mantequilla (PetMD, AKC). Crudo, su piel cuesta de masticar (AKC).',
    ],
    never: [
      'Los chiles picantes (guindillas, ajíes): PetMD aconseja no darle nunca a un perro chile ni platos picantes con capsaicina, como el chile en polvo; el AKC nombra los jalapeños.',
      'Los pimientos rellenos y los platos de pimiento con cebolla o ajo.',
    ],
    signs: ['Demasiado pimiento puede causar vómitos o diarrea (AKC) y gases (PetMD).'],
    usdaName: 'de pimiento morrón rojo crudo',
    piece: {
      a: 'un aro de pimiento',
      one: 'aro de pimiento',
      many: 'aros de pimiento',
      basis: 'USDA: 1 aro (7,5 cm de diámetro, 6 mm de grosor) = 10 g',
    },
    sizeGuide: {
      note: 'Las cantidades de PetMD por semana, con las categorías de peso pasadas a kilogramos. El AKC da en cambio un límite por porción: menos de un cuarto de pimiento a la vez para un perro pequeño, menos de medio para uno grande.',
      rows: [
        ['Muy pequeño (1 a 5 kg)', '1 a 2 trocitos'],
        ['Pequeño (5 a 9 kg)', 'Menos de ¼ de pimiento, picado'],
        ['Mediano (10 a 23 kg)', '¼ de pimiento, picado'],
        ['Grande (23 a 41 kg)', '½ pimiento, picado'],
        ['Muy grande (desde 41 kg)', '¾ de pimiento, picado'],
      ],
    },
    disagree: [
      'Los límites del AKC son por porción, los de PetMD por semana. Para un perro grande, el AKC permite casi medio pimiento de una vez, PetMD medio pimiento en toda la semana.',
    ],
    questions: [
      {
        question: '¿Los perros pueden comer pimiento verde?',
        answer:
          'Sí. Según el AKC, todos los colores son seguros; el rojo solo es el más maduro, con más vitaminas y antioxidantes.',
      },
      {
        question: '¿Y el pimentón (paprika) en polvo?',
        answer:
          'Las fuentes hablan del pimiento fresco y dulce. Según PetMD, un perro nunca debe recibir especias con capsaicina como el chile en polvo, y los platos condimentados suelen llevar cebolla o ajo.',
      },
    ],
    sources: [],
  },
  {
    id: 'zucchini',
    name: 'Calabacín (calabacita)',
    food: 'calabacín',
    answer: 'el calabacín sin condimentos es seguro',
    short: 'Sí, solo',
    summary:
      'Crudo o cocido y sin condimentos, el calabacín es bueno para los perros; el pan de calabacín y el calabacín frito, no.',
    why: [
      'El AKC: el calabacín es totalmente seguro para los perros. PetMD: crudo o cocido, el calabacín sin condimentos es seguro y sano para los perros con moderación.',
      'Es bajo en grasa y aporta fibra, vitaminas A, C y B6, potasio y luteína (PetMD). El AKC cuenta unas 20 calorías por taza (cup), crudo.',
    ],
    serve: [
      'Lávalo, quítale el tallo y córtalo en cubitos (PetMD); en trozos pequeños o al vapor, para que tu perro no se atragante (AKC).',
      'Aparta una porción sola antes de condimentar el plato de la familia (AKC).',
    ],
    never: [
      'El pan o pastel de calabacín y otros productos horneados, que pueden llevar xilitol (AKC), y el calabacín frito (PetMD).',
      'El calabacín con aceite, sal, ajo o cebolla (AKC).',
    ],
    usdaName: 'de calabacín crudo con cáscara',
    piece: {
      a: 'una rodaja de calabacín',
      one: 'rodaja de calabacín',
      many: 'rodajas de calabacín',
      basis: 'USDA: 1 rodaja = 9,9 g',
    },
    sizeGuide: {
      note: 'Las cantidades por día de PetMD, con las categorías de peso pasadas de libras a kilogramos.',
      rows: [
        ['Muy pequeño (1 a 5 kg)', '1 cucharadita'],
        ['Pequeño (5 a 9 kg)', '2 cucharaditas'],
        ['Mediano (10 a 23 kg)', '3 cucharaditas'],
        ['Grande (23 a 41 kg)', '2 cucharadas'],
        ['Muy grande (desde 41 kg)', '3 cucharadas'],
      ],
    },
    questions: [
      {
        question: '¿Los perros pueden comer calabacín crudo?',
        answer:
          'Sí, en trozos pequeños: el AKC dice que el calabacín sin condimentos es seguro crudo, al vapor o cocido, y cortado pequeño tu perro no se atraganta.',
      },
      {
        question: '¿Y el pan de calabacín?',
        answer:
          'No: como otros productos horneados, puede llevar xilitol, y el AKC lo pone entre lo que no hay que dar. Dale el calabacín sin nada más.',
      },
    ],
    sources: [],
  },
  {
    id: 'potatoes',
    name: 'Papa (patata)',
    food: 'papa',
    answer: 'cocida y sola, nunca verde',
    short: 'Sí, pero cocida',
    summary:
      'Cocidas y solas, las papas son seguras con moderación; crudas, verdes o con brotes, tienen solanina.',
    why: [
      'El AKC y PetMD consideran las dos que las papas cocidas y solas son seguras con moderación. El AKC cita a la Dra. Patricia Kennedy: las papas cocidas están bien, pero no con mucha mantequilla, que puede causar una inflamación del páncreas (pancreatitis).',
      'El peligro es la solanina, una sustancia tóxica de las solanáceas. El AKC escribe que las papas verdes son tóxicas por esa razón, y PetMD que las partes verdes y los brotes tienen solanina, que puede causar vómitos, diarrea, debilidad e incluso problemas nerviosos.',
    ],
    serve: [
      'Hervidas, al horno o en puré, sin mantequilla, sal ni especias (PetMD, AKC).',
      'Cocínalas hasta que estén blandas; la cáscara cocida está bien mientras no esté verde (AKC).',
    ],
    never: [
      'Las papas crudas, las papas verdes, la cáscara verde y los brotes (AKC, PetMD).',
      'Las papas fritas, las papas de bolsa y el puré con mantequilla, crema, ajo o cebolla.',
    ],
    signs: [
      'Por la solanina: vómitos, diarrea, debilidad y problemas nerviosos (PetMD). Llama a tu veterinario si tu perro comió papas crudas o verdes y muestra alguno de estos signos.',
    ],
    usdaName: 'de papas al horno con cáscara, sin sal,',
    piece: {
      a: 'una papa mediana al horno',
      one: 'papa mediana',
      many: 'papas medianas',
      basis: 'USDA: 1 papa mediana = 173 g',
    },
    questions: [
      {
        question: '¿Los perros pueden comer puré de papa?',
        answer:
          'Puré solo, sí, en poca cantidad (AKC). El puré con mantequilla, crema, ajo o cebolla no es para perros: la grasa puede causar una pancreatitis, y el ajo y la cebolla son tóxicos.',
      },
      {
        question: '¿Los perros pueden comer papa cruda?',
        answer:
          'No. El AKC y PetMD solo dan la papa cocida; las partes verdes y los brotes tienen solanina, que puede causar vómitos, diarrea y debilidad (PetMD).',
      },
    ],
    sources: [],
  },
  {
    id: 'sweet-potatoes',
    name: 'Camote (batata)',
    food: 'camote',
    answer: 'el camote cocido es seguro',
    short: 'Sí, cocido',
    summary:
      'Bien cocido y solo, el camote es bueno para los perros con moderación, pero nunca crudo.',
    why: [
      'PetMD escribe que el camote es seguro si está bien cocido, solo y se da con moderación; el AKC dice que sí, con precaución.',
      'Aporta fibra, betacaroteno, vitaminas A, B6 y C, potasio y calcio (AKC, PetMD). El AKC cita a la Dra. Rachel Barrack: demasiado camote puede, por exceso de vitamina A, debilitar los huesos y los músculos.',
    ],
    serve: [
      'Lávalo y pélalo, luego cocínalo al vapor, hervido, al horno o en el microondas hasta que esté blando, y hazlo puré o córtalo en trozos pequeños (PetMD).',
      'Dáselo solo, sin mantequilla, azúcar ni malvaviscos.',
    ],
    never: [
      'El camote crudo: cuesta masticarlo y digerirlo, y puede atragantar (PetMD, AKC).',
      'La cáscara, que según PetMD no es tóxica, pero cuesta digerirla y puede obstruir el intestino.',
    ],
    usdaName: 'de camote al horno con cáscara, sin sal',
    piece: {
      a: 'una cucharada de camote',
      one: 'cucharada',
      many: 'cucharadas',
      basis: '1/16 de la taza (cup) USDA de 200 g',
    },
    sizeGuide: {
      note: 'Las cantidades de PetMD, de dos a tres veces por semana, con las categorías de peso pasadas de libras a kilogramos.',
      rows: [
        ['Muy pequeño (1 a 5 kg)', '1 cucharada'],
        ['Pequeño (5 a 9 kg)', '1 a 2 cucharadas'],
        ['Mediano (10 a 23 kg)', '2 a 3 cucharadas'],
        ['Grande (23 a 41 kg)', '3 cucharadas'],
        ['Muy grande (desde 41 kg)', '4 cucharadas'],
      ],
    },
    disagree: [
      'El veterinario del AKC escribe que el camote tiene un índice glucémico alto y pide precaución en perros diabéticos; PetMD considera su índice glucémico relativamente bajo. Si tu perro es diabético, pregúntale a tu veterinario.',
    ],
    questions: [
      {
        question: '¿El camote es mejor que la papa para los perros?',
        answer:
          'Los dos son seguros cocidos y solos. La verdadera diferencia está en lo que nunca va al plato: las papas verdes o crudas tienen solanina (AKC, PetMD), y el camote crudo puede atragantar.',
      },
      {
        question: '¿Los perros pueden comer camote con cáscara?',
        answer:
          'Mejor pelarlo: PetMD dice que la cáscara no es tóxica, pero cuesta digerirla y puede obstruir el intestino.',
      },
    ],
    sources: [],
  },
  {
    id: 'pumpkin',
    name: 'Calabaza',
    food: 'calabaza',
    answer: 'la calabaza sin nada añadido es segura',
    short: 'Sí, sola',
    summary:
      'La calabaza cocida sola o el puré de calabaza enlatado al 100 % son buenos para los perros; el relleno de pay, no.',
    why: [
      'PetMD escribe que un perro puede comer sin peligro calabaza cocida sola y calabaza enlatada (100 % calabaza, sin añadidos), y el AKC considera la calabaza enlatada sola la opción más sana.',
      'Es rica en fibra, y su fibra soluble actúa como prebiótico según el AKC. Para una diarrea leve, el AKC propone de 1 a 4 cucharadas de calabaza por comida, empezando con poco.',
    ],
    serve: [
      'Calabaza enlatada sin sal, especias ni azúcar (AKC), o calabaza cocida sola (PetMD).',
      'Mezcla una cucharada con su comida en lugar de darle un tazón entero.',
    ],
    never: [
      'El relleno de pay (tarta) de calabaza o las preparaciones listas: según PetMD, pueden llevar azúcar, nuez moscada y clavo de olor, peligrosos para los perros, y a veces xilitol.',
      'La calabaza cruda, la cáscara y el tallo, difíciles de digerir (PetMD).',
    ],
    signs: [
      'La calabaza es para una diarrea leve y sin gravedad (AKC). El AKC aconseja llamar enseguida a tu veterinario si hay decaimiento, fiebre, vómitos o debilidad, o una diarrea con sangre o que no se va, sobre todo en un cachorro.',
    ],
    usdaName: 'de calabaza enlatada sin sal',
    piece: {
      a: 'una cucharada de puré de calabaza',
      one: 'cucharada',
      many: 'cucharadas',
      basis: '1/16 de la taza (cup) USDA de 245 g',
    },
    questions: [
      {
        question: '¿El relleno de pay de calabaza es lo mismo que la calabaza enlatada?',
        answer:
          'No. La lata debe decir 100 % calabaza. El relleno de pay está endulzado y condimentado, y según PetMD puede llevar nuez moscada, clavo de olor y xilitol.',
      },
      {
        question: '¿La calabaza sirve para la diarrea del perro?',
        answer:
          'Para una diarrea leve, el AKC propone de 1 a 4 cucharadas de calabaza por comida, empezando con poco. Si hay decaimiento, fiebre, vómitos, debilidad o una diarrea con sangre o que no se va, llama enseguida a tu veterinario (AKC).',
      },
    ],
    sources: [],
  },
];
