import { SOURCES_DE } from '../../de/foods/sources.ts';
import { SOURCES_ES } from './sources.ts';
import type { FoodEs } from './types.ts';

/** The fruit of the Spanish pages, in the order of the route table. */
export const FRUIT_ES: readonly FoodEs[] = [
  {
    id: 'strawberries',
    name: 'Fresas (frutillas)',
    food: 'fresas',
    answer: 'las fresas frescas son un premio seguro',
    short: 'Sí, con moderación',
    summary:
      'La mayoría de los perros toleran bien unas pocas fresas frescas y naturales; la ASPCA clasifica la planta como no tóxica.',
    why: [
      'En la lista de plantas de la ASPCA, la planta de la fresa (Fragaria) figura como no tóxica para los perros. El American Kennel Club (AKC) responde «sí, con moderación», y PetMD escribe que la mayoría de los perros pueden comerlas sin peligro si están bien preparadas.',
      'Las fresas aportan fibra y vitamina C y, según PetMD, vitaminas del grupo B, vitamina K, magnesio y potasio. También tienen azúcar: para un perro diabético, con sobrepeso o sensible al azúcar no son un buen premio, según PetMD.',
    ],
    serve: [
      'Lava bien las fresas y quítales el tallo y las hojas (AKC, PetMD).',
      'Córtalas en rebanadas de unos 6 mm, como aconseja PetMD para evitar que se atragante; el AKC recomienda trozos pequeños y, en verano, fresas congeladas.',
      'Nada de fresas en lata ni en almíbar: según el AKC tienen demasiado azúcar, y algunas pueden contener xilitol.',
    ],
    never: [
      'Las hojas verdes: no son tóxicas, pero según el AKC pueden caerle mal al estómago y, según PetMD, son un riesgo de atragantamiento.',
      'Los postres de fresa, la mermelada y los productos de fresa sin azúcar, que pueden llevar xilitol.',
    ],
    usdaName: 'de fresas crudas',
    piece: {
      a: 'una fresa mediana',
      one: 'fresa mediana',
      many: 'fresas medianas',
      basis: 'USDA: 1 fresa mediana (3 cm de diámetro) = 12 g',
    },
    sizeGuide: {
      note: 'La tabla de porciones de PetMD, en rebanadas, con las categorías de peso pasadas de libras a kilogramos. El AKC considera de una a tres fresas al día un punto de partida razonable para la mayoría de los perros.',
      rows: [
        ['Muy pequeño (1 a 9 kg)', '1 a 2 rebanadas'],
        ['Pequeño (10 a 14 kg)', '2 a 3 rebanadas'],
        ['Mediano (14 a 23 kg)', '5 a 6 rebanadas'],
        ['Grande (23 a 41 kg)', 'Un puñado de rebanadas'],
        ['Muy grande (más de 41 kg)', 'Un buen puñado de rebanadas'],
      ],
    },
    questions: [
      {
        question: '¿Cuántas fresas puede comer un perro al día?',
        answer:
          'El presupuesto de premios de la tabla de arriba es el tope para todos los premios del día juntos. Las cantidades de PetMD y del AKC quedan muy por debajo: de una a tres fresas o unas pocas rebanadas, según el tamaño.',
      },
      {
        question: '¿Los perros pueden comer fresas congeladas?',
        answer:
          'Sí: el AKC propone trozos de fresa congelada como premio de verano. Que sean fresas naturales, lavadas y sin el tallo, nunca en almíbar ni con azúcar.',
      },
      {
        question: '¿Un cachorro puede comer fresas?',
        answer:
          'Las fuentes no dan una regla propia para cachorros. El AKC aconseja consultar a tu veterinario antes de darle fresas por primera vez, sobre todo si tiene diabetes, problemas de peso o un estómago sensible. Con un cachorro vale la misma prudencia: una rebanada pequeña y luego observa.',
      },
    ],
    sources: [],
  },
  {
    id: 'bananas',
    name: 'Plátano (banana)',
    food: 'plátano',
    answer: 'pelado y solo de vez en cuando',
    short: 'Sí, pero poco',
    summary:
      'El plátano pelado en trozos pequeños es seguro, pero según PetMD tiene más azúcar que muchos premios para perros.',
    why: [
      'La ASPCA clasifica la planta del plátano como no tóxica para los perros. PetMD escribe que los perros pueden comer plátano sin peligro con moderación; el AKC lo recomienda como un extra ocasional, no como un bocadillo de todos los días.',
      'El problema es el azúcar. Según PetMD, el plátano tiene más azúcar que muchos premios para perros y, según el AKC, en exceso suma calorías y puede caerle mal al estómago. Un perro con sobrepeso o diabetes solo debería comerlo si su veterinario está de acuerdo (PetMD).',
      'A cambio aporta potasio, vitamina B6, vitamina C, fibra y magnesio (AKC), además de biotina (PetMD).',
    ],
    serve: [
      'Pélalo por completo y córtalo en rodajas de unos 6 mm (PetMD) o en bocados (AKC).',
      'Dáselo fresco, machacado en su comida o congelado dentro de un juguete rellenable (AKC, PetMD).',
    ],
    never: [
      'La cáscara. Según el AKC no es tóxica, pero es difícil de digerir y puede obstruir el intestino; PetMD dice lo mismo.',
    ],
    usdaName: 'de plátanos crudos',
    piece: {
      a: 'un plátano mediano',
      one: 'plátano mediano',
      many: 'plátanos medianos',
      basis: 'USDA: 1 plátano mediano (18 a 20 cm de largo) = 118 g',
    },
    sizeGuide: {
      note: 'Las cantidades diarias de PetMD según el tamaño, con las categorías de peso pasadas a kilogramos.',
      rows: [
        ['Muy pequeño (1 a 5 kg)', '1 a 2 rodajas'],
        ['Pequeño (5 a 9 kg)', '2 a 3 rodajas'],
        ['Mediano (10 a 23 kg)', '3 a 6 rodajas'],
        ['Grande (23 a 41 kg)', 'Un puñado de rodajas'],
        ['Muy grande (más de 41 kg)', 'Hasta medio plátano'],
      ],
    },
    questions: [
      {
        question: '¿Los perros pueden comer plátano todos los días?',
        answer:
          'La tabla de PetMD da cantidades diarias, desde una o dos rodajas para los perros más pequeños hasta medio plátano para los más grandes. Por el azúcar, el AKC prefiere el plátano como un extra ocasional más que como un bocadillo diario.',
      },
      {
        question: '¿El plátano sirve para la diarrea del perro?',
        answer:
          'Ninguna de las fuentes de esta página recomienda el plátano contra la diarrea. Al contrario, el AKC advierte que demasiado plátano puede caerle mal al estómago. Un perro con diarrea necesita a su veterinario, no el frutero.',
      },
    ],
    sources: [],
  },
  {
    id: 'grapes',
    name: 'Uvas',
    food: 'uvas',
    answer: 'las uvas son tóxicas para los perros',
    short: 'No, son tóxicas',
    summary:
      'Las uvas de cualquier color pueden causar insuficiencia renal en los perros, y ninguna fuente da una cantidad segura.',
    why: [
      'El Manual de veterinaria de MSD (la edición en español del Merck) relaciona las uvas, las pasas y las pasas de Corinto con insuficiencia renal en los perros. CliniTox, la base de datos toxicológica de la facultad Vetsuisse de Zúrich, describe la misma insuficiencia renal aguda, mortal sin tratamiento; la clínica de pequeños animales de la Universidad de Berna escribe que cerca del 55 % de los perros afectados sobreviven a la intoxicación.',
      'La sustancia responsable no está confirmada. La ASPCA y MSD señalan el ácido tartárico, abundante en la fruta y que los perros eliminan peor que otros animales: MSD lo llama «un principio tóxico propuesto». En 2022, Wegenast y sus colegas describieron seis perros con daño renal tras comer crémor tártaro o tamarindo, ambos ricos en ácido tartárico. El AKC, en cambio, cita a la veterinaria de urgencias Jessica Dowling: la sustancia exacta seguiría sin conocerse.',
      'Según VCA, el riesgo es el mismo para uvas con o sin semillas, rojas o verdes, orgánicas o no. El jugo de uva, el vino y el extracto de semilla de uva no parecen causar, según VCA, la misma intoxicación.',
    ],
    serve: [
      'Llama ya a tu veterinario o a una clínica veterinaria de urgencias, aunque haya comido una sola uva y aunque parezca estar bien (PetMD, VCA).',
      'No lo hagas vomitar en casa, por ejemplo con agua oxigenada (AKC). Para un perro que todavía se ve bien, MSD describe una descontaminación rápida por parte del veterinario y después al menos 48 horas de suero intravenoso.',
      'Cuenta cuántas faltan y anota la hora: por teléfono te preguntarán primero cuántas uvas, cuánto pesa tu perro y hace cuánto tiempo.',
    ],
    never: [
      'Las uvas frescas de cualquier variedad y sus formas secas: pasas, sultanas y pasas de Corinto.',
      'Los pasteles, panes dulces, cereales y mezclas de frutos secos que las contengan. La Universidad de Medicina Veterinaria de Viena menciona expresamente las uvas y las pasas entre los peligros de las fiestas para los perros.',
    ],
    signs: [
      'MSD y el AKC: vómitos o diarrea en las 6 a 12 horas siguientes y, en las 24 a 72 horas, una insuficiencia renal en la que el perro orina muy poco o nada. CliniTox menciona vómitos, diarrea, decaimiento y falta de apetito en las primeras 24 horas, y la insuficiencia renal en las 24 a 72 horas.',
      'Vigila también la debilidad, el dolor abdominal, una sed intensa y los temblores (MSD, AKC, PetMD).',
    ],
    disagree: [
      'Sobre la cantidad, las fuentes están muy lejos unas de otras. MSD pone el límite en más de una uva o pasa por cada 4,5 kg de peso corporal. CliniTox da una dosis tóxica de 10 a 30 g de uva por kg, la Universidad de Berna describe insuficiencia renal desde 20 g de uva fresca por kg, y ambas subrayan grandes diferencias entre un perro y otro. VCA dice que no hay una dosis tóxica establecida, y PetMD, que no hay un número seguro.',
      'Sobre el tiempo, los primeros signos aparecen en pocas horas según PetMD, a las 6 a 12 horas según MSD y el AKC, a las 12 a 24 horas según VCA y dentro de las primeras 24 horas según CliniTox.',
    ],
    usdaName: 'de uvas crudas',
    piece: {
      a: 'una uva',
      one: 'uva',
      many: 'uvas',
      basis: 'USDA: 10 uvas = 49 g',
    },
    thresholds: [
      {
        label: 'MSD: por encima, puede dañar los riñones',
        lead: 'el límite que MSD fija en una uva por cada 4,5 kg',
      },
    ],
    thresholdNote:
      'La cifra de abajo es el límite de MSD, una uva por cada 4,5 kg de peso, calculado para cuatro pesos. Es el valor más bajo de las fuentes, no una cantidad segura: según VCA, algunos perros reaccionan con menos, y el contenido de ácido tartárico de las uvas varía (MSD). Llama sea cual sea la cantidad.',
    questions: [
      {
        question: 'Mi perro se comió una uva, ¿qué hago?',
        answer:
          'Llama a tu veterinario. PetMD lo aconseja incluso por una sola uva, porque no se conoce un número seguro, y un perro pequeño ya está cerca del límite de MSD con una sola uva.',
      },
      {
        question: '¿Las uvas verdes son menos peligrosas que las rojas?',
        answer:
          'No. Según VCA, el riesgo es el mismo para uvas verdes o rojas, con o sin semillas, compradas o de tu jardín, orgánicas o no.',
      },
    ],
    sources: [
      SOURCES_ES.msdGrapes,
      SOURCES_DE.clinitoxVitis,
      SOURCES_DE.bernGrapes,
      SOURCES_DE.vetmeduniHolidays,
    ],
  },
  {
    id: 'raisins',
    name: 'Pasas',
    food: 'pasas',
    answer: 'las pasas son tóxicas para los perros',
    short: 'No, ni siquiera pocas',
    summary:
      'Las pasas, las sultanas y las pasas de Corinto pueden causar insuficiencia renal en los perros, incluso en poca cantidad.',
    why: [
      'Las pasas son uvas secas. El Manual de veterinaria de MSD (la edición en español del Merck) menciona juntas las pasas, las uvas y las pasas de Corinto como las frutas relacionadas con insuficiencia renal en los perros; la ASPCA sospecha del ácido tartárico. CliniTox, la base de datos toxicológica de la facultad Vetsuisse de Zúrich, describe una insuficiencia renal aguda, mortal sin tratamiento.',
      'El secado concentra la fruta. PetMD escribe que las pasas son, en rigor, más peligrosas que las uvas, porque la sustancia tóxica está más concentrada; el AKC las considera igual de peligrosas. Una pasa pesa cerca de una décima parte de una uva: un puñadito ya son muchas pasas.',
      'La organización benéfica veterinaria británica PDSA escribe que la cantidad tóxica varía de un perro a otro y que, en algunos casos, puede ser muy pequeña.',
    ],
    serve: [
      'Llama ya a tu veterinario o a una clínica veterinaria de urgencias. PDSA: contacta al veterinario de inmediato, sin esperar a ver si aparecen signos.',
      'Ten el empaque a mano: la cantidad que comió, en gramos o en número, y el peso de tu perro son lo que el veterinario necesita saber.',
      'No lo hagas vomitar en casa, salvo que el veterinario te lo indique.',
    ],
    never: [
      'Las pasas, las sultanas y las pasas de Corinto, solas, en mezclas de frutos secos o en el cereal.',
      'El pan de frutas, los panes y bollos con pasas, las galletas y el chocolate con pasas (PDSA). La Universidad de Medicina Veterinaria de Viena menciona expresamente las pasas entre los peligros de las fiestas para los perros.',
    ],
    signs: [
      'PDSA: los signos pueden empezar pocas horas después de comerlas, con vómitos, diarrea, dolor abdominal, decaimiento y falta de apetito; puede seguir una insuficiencia renal en uno a tres días.',
      'MSD indica de 6 a 12 horas para los vómitos o la diarrea y de 24 a 72 horas para la insuficiencia renal, con la sed, la deshidratación y los temblores entre los signos. CliniTox describe vómitos, diarrea, decaimiento y falta de apetito en las primeras 24 horas, y la insuficiencia renal en las 24 a 72 horas.',
    ],
    disagree: [
      'MSD pone el límite en más de una pasa por cada 4,5 kg de peso corporal. CliniTox da una dosis tóxica de unos 3 g de pasas por kg de peso, y la clínica de pequeños animales de la Universidad de Berna describe insuficiencia renal desde 3 g de pasas por kg; ambas subrayan grandes diferencias entre un perro y otro. VCA dice que no hay una dosis tóxica establecida, y PDSA, que puede ser muy pequeña.',
      'Sobre las pasas de Corinto, MSD y VCA descartan las verdaderas grosellas y la grosella negra (género Ribes) y advierten contra las pasas de Corinto secas; PDSA menciona los «currants» sin hacer esa distinción.',
    ],
    usdaName: 'de pasas negras sin semillas',
    piece: {
      a: 'una pasa',
      one: 'pasa',
      many: 'pasas',
      basis: 'USDA: 50 pasas = 26 g',
    },
    thresholds: [
      {
        label: 'MSD: por encima, puede dañar los riñones',
        lead: 'el límite que MSD fija en una pasa por cada 4,5 kg',
      },
    ],
    thresholdNote:
      'El límite de MSD, una pasa por cada 4,5 kg de peso, calculado para cuatro pesos. Una cajita mini de pasas del USDA tiene 14 g, unas 27 pasas: más que el límite para todos los perros de la tabla. Este límite no es una cantidad segura: llama sea cual sea la cantidad de pasas.',
    questions: [
      {
        question: 'Mi perro se comió una galleta con pasas, ¿es una urgencia?',
        answer:
          'Trátalo como una urgencia y llama a tu veterinario o a una clínica veterinaria de urgencias: PDSA menciona las galletas, los pasteles y los bollos entre los alimentos que llevan pasas, y para un perro pequeño unas pocas pasas ya superan el límite de MSD.',
      },
      {
        question: '¿Los perros pueden comer sultanas?',
        answer:
          'No. Las sultanas son uvas secas, y PDSA clasifica las uvas, las pasas, las pasas de Corinto y las sultanas como potencialmente tóxicas para los perros.',
      },
      {
        question: '¿Los perros pueden comer pasas de Corinto?',
        answer:
          'No. Las pasas de Corinto son uvas pequeñas secas, y MSD y VCA las consideran tan peligrosas como las pasas. Las verdaderas grosellas y la grosella negra (género Ribes) no se han relacionado con daño renal según MSD y VCA. PDSA no hace la distinción: trata cualquier pasa de Corinto seca como una pasa.',
      },
    ],
    sources: [
      SOURCES_ES.msdGrapes,
      SOURCES_DE.clinitoxVitis,
      SOURCES_DE.bernGrapes,
      SOURCES_DE.vetmeduniHolidays,
    ],
  },
  {
    id: 'blueberries',
    name: 'Arándanos',
    food: 'arándanos',
    answer: 'los arándanos son un premio pequeño y seguro',
    short: 'Sí, unos pocos',
    summary:
      'La mayoría de los perros toleran unos pocos arándanos frescos o congelados, naturales; nada de muffins ni bayas endulzadas.',
    why: [
      'El American Kennel Club (AKC) escribe que los perros pueden comer arándanos con moderación, y PetMD, que la mayoría de los perros los toleran bien al natural.',
      'Son ricos en antioxidantes y compuestos vegetales, con fibra y vitamina C (PetMD, AKC). Y están entre las frutas más pequeñas que puede recibir un perro: cerca de 1,4 g por baya según los pesos del USDA.',
    ],
    serve: [
      'Lava las bayas con agua fría y quítales los tallos (PetMD).',
      'Dáselos frescos o congelados (AKC). Para un perro muy pequeño, pártelos por la mitad o aplástalos para que no se atragante (AKC, PetMD).',
      'Solo al natural: PetMD desaconseja los arándanos en lata, endulzados, en almíbar o saborizados.',
    ],
    never: ['Los muffins, pasteles y mermeladas de arándanos (PetMD).'],
    usdaName: 'de arándanos crudos',
    piece: {
      a: 'un arándano',
      one: 'arándano',
      many: 'arándanos',
      basis: 'USDA: 50 arándanos = 68 g',
    },
    sizeGuide: {
      note: 'Las cantidades diarias de PetMD, en arándanos, con las categorías de peso pasadas a kilogramos. El AKC indica dos o tres para un perro pequeño y algunos más para uno más grande.',
      rows: [
        ['Muy pequeño (1 a 5 kg)', '1 a 2 arándanos'],
        ['Pequeño (5 a 9 kg)', '2 a 3 arándanos'],
        ['Mediano (10 a 23 kg)', '3 a 5 arándanos'],
        ['Grande (23 a 41 kg)', '5 a 6 arándanos'],
        ['Muy grande (más de 41 kg)', '6 a 10 arándanos'],
      ],
    },
    questions: [
      {
        question:
          '¿Por qué las tablas dan tan pocos arándanos si el presupuesto de calorías permite más?',
        answer:
          'El presupuesto de premios es un tope para todos los premios juntos, no una meta para una sola fruta. Las cantidades de PetMD dejan sitio para los demás premios del día y para un estómago que no está acostumbrado a la fruta.',
      },
      {
        question: '¿Los perros pueden comer arándanos congelados?',
        answer:
          'Sí: el AKC los acepta frescos o congelados. Para un perro muy pequeño, pártelos o aplástalos para que no se atragante (AKC, PetMD).',
      },
    ],
    sources: [],
  },
  {
    id: 'apples',
    name: 'Manzana',
    food: 'manzana',
    answer: 'en trozos sí, pero sin el corazón',
    short: 'Sí, sin semillas',
    summary:
      'La manzana en trozos, sin corazón ni semillas, es un premio seguro; las semillas, el corazón y el tallo no van al plato.',
    why: [
      'El American Kennel Club (AKC) califica la manzana como un premio seguro y nutritivo con moderación, y PetMD escribe que los perros pueden comerla sin peligro una vez retirados las semillas, el corazón y el tallo.',
      'En la lista de plantas de la ASPCA, el manzano figura como tóxico para los perros, y explica por qué: los tallos, las hojas y las semillas contienen glucósidos cianogénicos, que liberan cianuro. La pulpa es la parte que comen las personas y los perros.',
      'La pulpa aporta vitamina C, vitamina A, potasio y fibra (AKC) y tiene poca grasa (PetMD).',
    ],
    serve: [
      'Lava la manzana y quítale el corazón, las semillas y el tallo (AKC, PetMD).',
      'Córtala en gajos o en cubos; PetMD propone trozos de unos 2,5 cm de ancho y 6 mm de grosor. Pelada le cae mejor a un estómago sensible (AKC, PetMD).',
      'Según el AKC, con uno o dos gajos de manzana un perro queda contento.',
    ],
    never: [
      'Las semillas, que contienen un poco de cianuro (AKC, PetMD), el corazón, que puede atragantar a un perro u obstruirle el intestino, y el tallo.',
      'El pay o tarta de manzana, el puré de manzana endulzado y los productos de manzana con xilitol.',
    ],
    signs: [
      'Demasiada manzana puede caerle mal al estómago (AKC, PetMD). Para el cianuro de las semillas, los tallos y las hojas, la ASPCA menciona encías de color rojo ladrillo, pupilas dilatadas, dificultad para respirar, jadeo y choque: si ves algo de esto, llama ya a tu veterinario.',
    ],
    usdaName: 'de manzanas crudas con cáscara',
    piece: {
      a: 'una taza de rebanadas de manzana',
      one: 'taza de rebanadas de manzana',
      many: 'tazas de rebanadas de manzana',
      basis: 'USDA: 1 taza (cup) de rebanadas = 109 g',
    },
    sizeGuide: {
      note: 'Las cantidades diarias de PetMD, en trozos de unos 2,5 cm por 6 mm, con las categorías de peso pasadas a kilogramos.',
      rows: [
        ['Muy pequeño (1 a 5 kg)', '1 a 2 trozos'],
        ['Pequeño (5 a 9 kg)', '2 a 3 trozos'],
        ['Mediano (10 a 23 kg)', '3 a 4 trozos'],
        ['Grande (23 a 41 kg)', '4 a 5 trozos'],
        ['Muy grande (más de 41 kg)', '5 a 6 trozos'],
      ],
    },
    questions: [
      {
        question: 'Mi perro se comió el corazón de una manzana, ¿es peligroso?',
        answer:
          'El corazón es sobre todo un riesgo de atragantamiento y de obstrucción intestinal (AKC, PetMD); sus pocas semillas contienen solo un poco de cianuro, que según el AKC hace daño en grandes cantidades. Vigila si vomita, si tiene la barriga dura o si deja de comer, y en ese caso llama a tu veterinario.',
      },
      {
        question: '¿Los perros pueden comer manzana con cáscara?',
        answer:
          'Sí, la cáscara no es el problema: las fuentes solo piden quitar el corazón, las semillas y el tallo. Pelarla ayuda a un perro con el estómago sensible (AKC, PetMD).',
      },
      {
        question: '¿Los perros pueden comer puré de manzana?',
        answer:
          'Las fuentes hablan de la pulpa fresca. El puré endulzado suma azúcar, y los productos con xilitol son tóxicos para los perros: lee la lista de ingredientes.',
      },
    ],
    sources: [],
  },
  {
    id: 'watermelon',
    name: 'Sandía',
    food: 'sandía',
    answer: 'la pulpa sin semillas es segura',
    short: 'Sí, sin la cáscara',
    summary:
      'La sandía sin cáscara ni semillas es segura y casi toda agua; la cáscara puede obstruir el intestino.',
    why: [
      'PetMD escribe que la mayoría de los perros pueden comer sandía natural y bien preparada sin peligro; el American Kennel Club (AKC) la considera un premio refrescante que hidrata, si se da de forma segura y con moderación.',
      'Tiene cerca de un 92 % de agua (AKC), con vitaminas A, B6 y C y potasio, y según las cifras del USDA es una de las frutas más ligeras de esta lista: 30 kcal por cada 100 g.',
    ],
    serve: [
      'Lava la sandía, separa toda la pulpa de la cáscara y quítale las semillas (AKC, PetMD).',
      'PetMD propone trozos de unos 2,5 × 2,5 cm y 6 mm de grosor; el AKC, unos pocos bocados como premio ocasional.',
      'Unos cubos congelados, o un puré con yogur natural sin xilitol, son un premio de verano (AKC).',
    ],
    never: [
      'La cáscara (la corteza verde): según PetMD, un perro puede atragantarse con ella o puede obstruirle el intestino; el AKC añade vómitos, diarrea y malestar de estómago.',
      'Las semillas: un riesgo de atragantamiento y de obstrucción intestinal (AKC); PetMD menciona trazas de cianuro, aunque considera muy improbable una intoxicación.',
    ],
    usdaName: 'de sandía cruda',
    piece: {
      a: 'una taza de sandía en cubos',
      one: 'taza de sandía en cubos',
      many: 'tazas de sandía en cubos',
      basis: 'USDA: 1 taza (cup) en cubos = 152 g',
    },
    sizeGuide: {
      note: 'Las cantidades de PetMD, dos o tres veces por semana, en trozos de unos 2,5 × 2,5 cm y 6 mm de grosor, con las categorías de peso pasadas a kilogramos.',
      rows: [
        ['Muy pequeño (1 a 5 kg)', '2 a 3 trozos'],
        ['Pequeño (5 a 9 kg)', '3 a 4 trozos'],
        ['Mediano (10 a 23 kg)', '3 a 4 trozos'],
        ['Grande (23 a 41 kg)', '4 a 5 trozos'],
        ['Muy grande (más de 41 kg)', '5 a 6 trozos'],
      ],
    },
    disagree: [
      'El AKC calcula unas 50 calorías por taza de sandía; con las cifras del USDA, una taza en cubos aporta unas 46 kcal (152 g a 30 kcal por cada 100 g). Esta página calcula con el USDA.',
    ],
    questions: [
      {
        question: '¿La sandía es buena para un perro con diabetes?',
        answer:
          'PetMD aconseja no dársela a perros diabéticos o con sobrepeso. Pregúntale primero a tu veterinario.',
      },
      {
        question: 'Mi perro se comió la cáscara de la sandía, ¿qué hago?',
        answer:
          'La cáscara no es tóxica, pero es difícil de digerir y puede obstruir el intestino (PetMD, AKC). Vigila a tu perro: si vomita, le duele la barriga o deja de comer, llama a tu veterinario.',
      },
    ],
    sources: [],
  },
  {
    id: 'cherries',
    name: 'Cerezas',
    food: 'cerezas',
    answer: 'los huesos liberan cianuro',
    short: 'Mejor no',
    summary:
      'El hueso, el tallo y las hojas de la cereza liberan cianuro, y el hueso puede obstruir el intestino.',
    why: [
      'El American Kennel Club (AKC) no recomienda las cerezas: un poco de pulpa no es un problema, pero el hueso (la semilla), los tallos y las hojas contienen cianuro, y el hueso puede obstruir el tubo digestivo.',
      'En la lista de plantas de la ASPCA, el cerezo (Prunus) figura como tóxico para los perros por la misma razón: los tallos, las hojas y las semillas contienen glucósidos cianogénicos. PetMD nombra la sustancia: la amigdalina, que el organismo convierte en cianuro.',
      'Las cerezas en almíbar para cócteles (marrasquino) no son mejores: el AKC y PetMD señalan su azúcar añadido y sus conservantes.',
    ],
    serve: [
      'Si tu perro se comió una o dos cerezas con hueso, vigílalo y llama a tu veterinario si comió varias o muestra cualquier signo (AKC). El veterinario puede decidir hacerlo vomitar.',
      'Llama de inmediato si mordió huesos, tallos u hojas o si muestra signos de intoxicación (PetMD); fuera del horario de tu veterinario, a una clínica veterinaria de urgencias.',
    ],
    never: [
      'Los huesos, los tallos y las hojas de cualquier cereza, y las cerezas enteras que un perro pueda tragarse con el hueso.',
      'Las cerezas al marrasquino y los postres de cereza.',
    ],
    signs: [
      'El cianuro: dificultad para respirar, encías rojo brillante y pupilas dilatadas (AKC), jadeo, babeo, vómitos, temblores, convulsiones y colapso (PetMD). Según PetMD, cuántos huesos hacen falta depende del tamaño del perro y de si los mordió o no.',
      'Un intestino obstruido: vómitos, un perro que deja de comer, estreñimiento o pocas heces (AKC).',
    ],
    disagree: [
      'PetMD escribe que los perros pueden comer cerezas frescas sin hueso, sin tallo y sin hojas, y da una tabla que va de una cereza para un perro de 1 a 5 kg a cinco para un perro de más de 41 kg, dos o tres veces por semana. El AKC no las recomienda y sugiere frutas más seguras. Esta página sigue al AKC y a la ASPCA; todas las fuentes coinciden en que el hueso, los tallos y las hojas son el peligro.',
    ],
    usdaName: 'de cerezas dulces crudas',
    piece: {
      a: 'una cereza',
      one: 'cereza',
      many: 'cerezas',
      basis: 'USDA: 1 cereza = 8,2 g',
    },
    questions: [
      {
        question: 'Mi perro se tragó un hueso de cereza, ¿qué hago?',
        answer:
          'Un solo hueso tragado es sobre todo un riesgo de obstrucción intestinal, mayor para un perro pequeño que para uno grande. Vigila si vomita, si está estreñido o si deja de comer, y llama a tu veterinario si comió varias cerezas o mordió los huesos (AKC, PetMD).',
      },
      {
        question: '¿Los perros pueden comer cerezas sin hueso?',
        answer:
          'Según el AKC, un poco de pulpa sin hueso, sin tallo y sin hojas no es un problema, y PetMD la permite dos o tres veces por semana. Aun así, el AKC aconseja frutas más seguras.',
      },
    ],
    sources: [],
  },
  {
    id: 'mango',
    name: 'Mango',
    food: 'mango',
    answer: 'pelado y sin el hueso',
    short: 'Sí, sin el hueso',
    summary:
      'El mango maduro, pelado y sin hueso es seguro en trozos pequeños, pero tiene mucho azúcar y el hueso es peligroso.',
    why: [
      'El American Kennel Club (AKC) escribe que los perros pueden comer mango si está bien preparado; PetMD permite pequeñas cantidades de pulpa madura como premio ocasional.',
      'El mango aporta fibra y vitaminas A, B6, C y E (AKC). Dos cosas piden prudencia: su azúcar y su fibra, que pueden caerle mal al estómago; según PetMD, un perro diabético no debería comerlo.',
    ],
    serve: [
      'Lava y pela el mango, y separa la pulpa del hueso (AKC, PetMD).',
      'Córtalo en bocados pequeños y empieza con poco (PetMD).',
    ],
    never: [
      'El hueso (la semilla grande): para el AKC, un riesgo serio de atragantamiento, con pequeñas cantidades de cianuro; PetMD añade el riesgo de obstrucción intestinal.',
      'La cáscara, difícil de digerir según las dos fuentes.',
    ],
    signs: [
      'Demasiada fruta puede dar dolor de barriga y diarrea (AKC). Si tu perro se tragó el hueso, fíjate en cómo come y llama a tu veterinario al primer cambio (AKC).',
    ],
    usdaName: 'de mango crudo',
    piece: {
      a: 'una taza de trozos de mango',
      one: 'taza de trozos de mango',
      many: 'tazas de trozos de mango',
      basis: 'USDA: 1 taza (cup) de trozos = 165 g',
    },
    sizeGuide: {
      note: 'Las cantidades de PetMD, en cubitos, con las categorías de peso pasadas a kilogramos; una taza (cup) son 165 g. Compáralas con el presupuesto de premios de arriba: para los perros más grandes, una taza de mango es casi todos los premios del día.',
      rows: [
        ['Muy pequeño (1 a 5 kg)', '⅛ de taza, en cubitos'],
        ['Pequeño (5 a 9 kg)', '⅓ de taza, en cubitos'],
        ['Mediano (10 a 23 kg)', '½ taza, en cubitos'],
        ['Grande (23 a 41 kg)', '¾ de taza, en cubitos'],
        ['Muy grande (más de 41 kg)', '1 taza, en cubitos'],
      ],
    },
    questions: [
      {
        question: '¿Los perros pueden comer mango deshidratado?',
        answer:
          'Las fuentes solo hablan de mango fresco y maduro. Una fruta deshidratada concentra en cada trozo el azúcar de mucha más fruta, así que gasta el presupuesto de premios mucho más rápido.',
      },
      {
        question: 'Mi perro se tragó el hueso de un mango, ¿es una urgencia?',
        answer:
          'El hueso es grande y duro; el AKC lo ve como un riesgo serio de atragantamiento, y PetMD, como un riesgo de obstrucción intestinal. Llama a tu veterinario y descríbele el tamaño del hueso y el de tu perro.',
      },
    ],
    sources: [],
  },
  {
    id: 'oranges',
    name: 'Naranja',
    food: 'naranja',
    answer: 'uno o dos gajos pelados',
    short: 'Sí, unos gajos',
    summary:
      'Unos gajos de naranja pelados son seguros en poca cantidad; la cáscara, las semillas y la acidez son el problema.',
    why: [
      'El American Kennel Club (AKC) escribe que los perros solo pueden comer naranja en cantidad limitada, porque su azúcar natural y su acidez pueden caerle mal al estómago. PetMD dice que sí, con moderación y solo la pulpa; un perro diabético o con sobrepeso no debería comerla.',
      'En la lista de plantas de la ASPCA, el naranjo figura como tóxico para los perros por sus aceites esenciales y sus psoralenos, con la aclaración de que la fruta es comestible y que los problemas vienen de la cáscara y de las partes de la planta. Según su nota sobre los cítricos, la cáscara, las semillas y las hojas contienen ácido cítrico y aceites que pueden irritar en cantidades importantes.',
    ],
    serve: [
      'Pela la naranja por completo y quítale las semillas (AKC, PetMD).',
      'Dale un gajo, cortado en trozos pequeños (AKC).',
    ],
    never: [
      'La cáscara: según PetMD, es difícil de digerir, puede obstruir el intestino y sus aceites pueden irritar el estómago.',
      'Las semillas, con las que un perro puede atragantarse (AKC), y las hojas y tallos del árbol (ASPCA).',
    ],
    signs: [
      'Diarrea y malestar de estómago por demasiada fruta (AKC, PetMD). Por las partes de la planta, la ASPCA menciona vómitos, diarrea, decaimiento e irritación de la piel.',
    ],
    usdaName: 'de naranjas crudas',
    piece: {
      a: 'una naranja entera',
      one: 'naranja entera',
      many: 'naranjas enteras',
      basis: 'USDA: 1 fruta (6,7 cm de diámetro) = 131 g',
    },
    sizeGuide: {
      note: 'Las cantidades de PetMD, una o dos veces por semana, con las categorías de peso pasadas de libras a kilogramos. El AKC considera que en general bastan uno o dos gajos pequeños al día, según el tamaño.',
      rows: [
        ['Muy pequeño (1 a 5 kg)', '½ gajo'],
        ['Pequeño (5 a 9 kg)', '1 gajo'],
        ['Mediano (10 a 23 kg)', '1 gajo y medio'],
        ['Grande (23 a 41 kg)', '2 gajos'],
        ['Muy grande (más de 41 kg)', '2 gajos y medio'],
      ],
    },
    disagree: [
      'Sobre la frecuencia: el AKC permite uno o dos gajos al día; PetMD los limita a una o dos veces por semana.',
    ],
    questions: [
      {
        question: '¿Los perros pueden comer mandarina?',
        answer:
          'Las fuentes de esta página hablan de la naranja. Aun así, la nota de la ASPCA sobre los cítricos vale para todos ellos: la cáscara, las semillas y las hojas son las partes problemáticas. Por prudencia, se aplica la misma regla: pelada, sin semillas y en poca cantidad.',
      },
      {
        question: '¿Los perros pueden comer naranja todos los días?',
        answer:
          'Las fuentes no coinciden: el AKC considera suficientes uno o dos gajos pequeños al día, y PetMD solo da naranja una o dos veces por semana. Según PetMD, un perro diabético o con sobrepeso no debería comerla.',
      },
    ],
    sources: [],
  },
  {
    id: 'pineapple',
    name: 'Piña (ananá)',
    food: 'piña',
    answer: 'la piña fresca es segura',
    short: 'Sí, fresca',
    summary:
      'La piña cruda, pelada y sin el corazón duro es un premio seguro; la piña en lata con almíbar, no.',
    why: [
      'PetMD escribe que los perros pueden comer piña sin peligro con moderación si está bien preparada, y el American Kennel Club (AKC), que unos pocos trozos de piña cruda bastan para la mayoría de los perros.',
      'Aporta vitamina C, vitaminas del grupo B, manganeso, cobre y potasio (AKC), y mucha agua. Su azúcar, su fibra y su acidez pueden caerle mal a un estómago sensible (PetMD).',
    ],
    serve: [
      'Pélala, quítale el corazón y corta la pulpa en bocados (AKC).',
      'Unos trozos de piña fresca congelados son un premio de verano (AKC).',
      'Solo fresca: según el AKC, el almíbar de la fruta en lata tiene demasiado azúcar, y según PetMD la piña deshidratada puede llevar azúcar añadido y conservantes.',
    ],
    never: [
      'El corazón, la cáscara, el tallo y las hojas: según PetMD, son difíciles de digerir, un perro puede atragantarse con ellos o pueden obstruirle el intestino.',
    ],
    signs: [
      'Diarrea o malestar de estómago después de comerla; en ese caso, el AKC aconseja llamar a tu veterinario.',
    ],
    usdaName: 'de piña cruda',
    piece: {
      a: 'una taza de trozos de piña',
      one: 'taza de trozos de piña',
      many: 'tazas de trozos de piña',
      basis: 'USDA: 1 taza (cup) de trozos = 165 g',
    },
    sizeGuide: {
      note: 'La tabla de porciones de PetMD, en bocados, con las categorías de peso pasadas a kilogramos.',
      rows: [
        ['Muy pequeño (1 a 9 kg)', '1 a 2 trozos'],
        ['Pequeño (10 a 14 kg)', '2 a 3 trozos'],
        ['Mediano (14 a 23 kg)', '5 a 6 trozos'],
        ['Grande (23 a 41 kg)', 'Un puñado de trozos'],
        ['Muy grande (más de 41 kg)', 'Un buen puñado de trozos'],
      ],
    },
    questions: [
      {
        question: '¿La piña sirve para que el perro deje de comer heces?',
        answer:
          'Ninguna de las fuentes veterinarias de esta página lo afirma. Todas tratan la piña solo como un premio ocasional.',
      },
      {
        question: '¿Los perros pueden comer piña en lata?',
        answer:
          'Mejor no: el AKC considera que el almíbar de la fruta en lata tiene demasiado azúcar. Si le das piña, que sea fresca.',
      },
    ],
    sources: [],
  },
];
