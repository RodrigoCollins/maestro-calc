import { SOURCES_DE } from '../../de/foods/sources.ts';
import { SOURCES_ES } from './sources.ts';
import type { FoodEs } from './types.ts';

/** The pantry foods of the Spanish pages, in the order of the route table. */
export const PANTRY_ES: readonly FoodEs[] = [
  {
    id: 'peanut-butter',
    name: 'Crema de cacahuate (mantequilla de maní)',
    food: 'crema de cacahuate',
    answer: 'la crema de cacahuate está permitida si no contiene xilitol',
    short: 'Sí, sin xilitol',
    summary:
      'Una crema de cacahuate simple va bien en poca cantidad si la etiqueta no menciona xilitol, un endulzante tóxico para perros.',
    why: [
      'PetMD y el AKC dicen que los perros pueden comer crema de cacahuate con moderación. El AKC le reconoce proteínas, grasas saludables, vitaminas B y E y niacina; PetMD advierte que tiene mucha grasa y muchas calorías.',
      'El verdadero peligro es un endulzante. La FDA advierte que algunas cremas de cacahuate y de frutos secos contienen xilitol, que también se vende como azúcar de abedul o azúcar de madera, y que puede hacer que el páncreas del perro libere insulina y que su glucosa baje en 10 a 60 minutos. La ASPCA añade un posible daño en el hígado, y la Universidad de Medicina Veterinaria de Viena califica el xilitol de tóxico para los perros y el azúcar de abedul de muy peligroso.',
    ],
    serve: [
      'Lee primero la etiqueta y asegúrate de que no tenga xilitol (FDA). Lo mejor es una crema de cacahuate sin sal ni azúcar añadido (AKC).',
      'Un poco para lamer, en un juguete o en una cuchara, como premio ocasional dentro del 10 % (PetMD, AKC).',
    ],
    never: [
      'Cualquier crema de cacahuate, crema de frutos secos o producto para untar con xilitol o azúcar de abedul (FDA, PetMD).',
      'Los bombones de crema de cacahuate, las galletas y otros dulces con chocolate o sin azúcar.',
    ],
    signs: [
      'Si el frasco tenía xilitol: vómitos, y luego debilidad, tambaleo, colapso y convulsiones a medida que baja la glucosa (FDA). Según la FDA, los signos pueden aparecer en 10 a 60 minutos, pero también tardar de 12 a 24 horas; llama de inmediato a tu veterinario o a una clínica veterinaria de urgencias.',
    ],
    usdaName: 'de crema de cacahuate cremosa sin sal',
    piece: {
      a: 'una cucharada de crema de cacahuate',
      one: 'cucharada',
      many: 'cucharadas',
      basis: 'la mitad de las 2 cucharadas del USDA = 32 g',
    },
    sizeGuide: {
      note: 'Las cantidades de PetMD, con las categorías de peso convertidas de libras a kilogramos. El AKC no da una tabla y aconseja que todos los premios queden dentro del 10 % del día.',
      rows: [
        ['Muy pequeño (1 a 5 kg)', '½ cucharadita, una vez al día'],
        ['Pequeño (5 a 9 kg)', '½ cucharadita, dos veces al día'],
        ['Mediano (10 a 23 kg)', '1 cucharadita, una vez al día'],
        ['Grande (23 a 41 kg)', '1 cucharadita, dos veces al día'],
        ['Muy grande (desde 41 kg)', '1 cucharada, una vez al día'],
      ],
    },
    questions: [
      {
        question: '¿Cómo sé si mi crema de cacahuate tiene xilitol?',
        answer:
          'Lee la lista de ingredientes. Según la FDA, el xilitol también puede aparecer como azúcar de abedul o azúcar de madera; si está cualquiera de esos tres nombres, ese frasco no es para tu perro.',
      },
      {
        question: '¿El azúcar de abedul es lo mismo que el xilitol?',
        answer:
          'Sí. La FDA cita el azúcar de abedul y el azúcar de madera como otros nombres del xilitol, y la Universidad de Medicina Veterinaria de Viena califica el azúcar de abedul de muy peligroso para los perros.',
      },
    ],
    sources: [SOURCES_DE.vetmeduniHolidays],
  },
  {
    id: 'honey',
    name: 'Miel',
    food: 'miel',
    answer: 'un poco de miel está permitido, pero no para cachorros',
    short: 'Sí, muy poca',
    summary:
      'Un poco de miel va bien para la mayoría de los perros adultos, pero es casi puro azúcar, y la miel cruda no es para cachorros.',
    why: [
      'El AKC dice que la miel es segura para los perros en pequeñas cantidades. PetMD escribe que pueden tomarla con moderación, como premio ocasional.',
      'Es sobre todo azúcar, y según PetMD el exceso de azúcar puede alterar el estómago del perro y contribuir al sobrepeso y a la diabetes; el AKC menciona también las caries. Con los valores del USDA, una cucharada aporta unas 64 kcal, una gran parte del presupuesto de premios de un perro pequeño.',
      'La miel cruda puede contener esporas de Clostridium botulinum (PetMD); por eso las fuentes la mantienen lejos de los cachorros y de los perros con las defensas bajas.',
    ],
    serve: [
      'Una cantidad pequeña, una o dos veces por semana como máximo (PetMD); cuanto menos, mejor, sobre todo en razas pequeñas (AKC).',
      'El AKC aconseja cepillarle los dientes a tu perro después.',
    ],
    never: [
      'La miel cruda para un cachorro de menos de un año o un perro con las defensas bajas, por ejemplo durante una quimioterapia (PetMD, AKC).',
      'La miel para un perro con diabetes (AKC, PetMD).',
    ],
    disagree: [
      'PetMD incluye a los perros con sobrepeso entre los que no deberían tomar miel cruda; el AKC menciona a los cachorros, a los perros con las defensas bajas y a los perros con diabetes, pero no a los perros con sobrepeso. El AKC habla de posibles beneficios para el dolor de garganta y las alergias, y escribe que las afirmaciones sobre las alergias carecen de pruebas sólidas.',
    ],
    usdaName: 'de miel',
    piece: {
      a: 'una cucharadita de miel',
      one: 'cucharadita',
      many: 'cucharaditas',
      basis: 'un tercio de la cucharada del USDA de 21 g',
    },
    sizeGuide: {
      note: 'Las cantidades de PetMD, una o dos veces por semana como máximo, con las categorías de peso convertidas de libras a kilogramos.',
      rows: [
        ['Muy pequeño (1 a 5 kg)', '⅛ de cucharadita'],
        ['Pequeño (5 a 9 kg)', '¼ de cucharadita'],
        ['Mediano (10 a 23 kg)', '½ a 1 cucharadita'],
        ['Grande (23 a 41 kg)', '2 cucharaditas'],
        ['Muy grande (desde 41 kg)', '1 cucharada'],
      ],
    },
    questions: [
      {
        question: '¿La miel ayuda con las alergias de mi perro?',
        answer:
          'El AKC escribe que la idea de que la miel local alivia las alergias carece de pruebas sólidas. Pregúntale mejor a tu veterinario cómo tratar la alergia.',
      },
      {
        question: '¿Los cachorros pueden comer miel?',
        answer:
          'Miel cruda no: puede contener esporas de Clostridium botulinum (PetMD), y tanto PetMD como el AKC la mantienen lejos de los cachorros de menos de un año.',
      },
    ],
    sources: [],
  },
  {
    id: 'chocolate',
    name: 'Chocolate',
    food: 'chocolate',
    answer: 'el chocolate es tóxico para los perros',
    short: 'No, es tóxico',
    summary:
      'El chocolate contiene teobromina y cafeína, que el perro elimina despacio; cuanto más oscuro, menos cantidad hace falta.',
    why: [
      'El Manual de veterinaria de MSD (la edición en español del Merck) nombra las sustancias tóxicas: la teobromina y la cafeína, las metilxantinas del cacao, y da a la teobromina una vida media de 17,5 horas en el perro. La ASPCA escribe que pueden causar vómitos y diarrea, jadeo, sed, ritmo cardíaco acelerado, temblores, convulsiones e incluso la muerte.',
      'La cantidad peligrosa depende del tipo de chocolate, de cuánto comió y del perro. MSD cuenta unos 2,3 mg de metilxantinas por gramo de chocolate con leche, 5,6 mg en el chocolate amargo y el semidulce y 15,5 mg en el chocolate sin azúcar para repostería, y cita signos leves a partir de 20 mg por kg de peso corporal, efectos en el corazón con 40 a 50 mg/kg y convulsiones desde 60 mg/kg. CliniTox, la base de datos toxicológica de la Universidad de Zúrich, cita los mismos tres umbrales: 20, 40 y 60 mg de teobromina por kg.',
    ],
    serve: [
      'Llama ya a tu veterinario o a una clínica veterinaria de urgencias, aunque tu perro parezca estar bien. CliniTox considera necesaria una descontaminación por el veterinario a partir de 20 mg/kg.',
      'No le provoques el vómito en casa si el veterinario no te lo indica: MSD contempla inducirlo en un perro todavía sin signos en las 2 horas siguientes a la ingestión, y esa decisión es del veterinario.',
      'Ten a mano el envoltorio, la cantidad que falta y el peso de tu perro: son las tres cifras de las que sale la dosis. La página sobre qué pasa si un perro come chocolate calcula por ti los casos frecuentes.',
    ],
    never: [
      'Ningún chocolate, ni el cacao en polvo ni los nibs de cacao, ni los brownies, pasteles y galletas que los contienen.',
      'El chocolate con pasas, con nueces de macadamia o con xilitol suma un segundo veneno.',
    ],
    signs: [
      'MSD: los signos suelen aparecer en las primeras 6 a 12 horas, primero sed, vómitos, diarrea, abdomen hinchado e inquietud, y luego hiperactividad, temblores y convulsiones. En los casos graves pueden durar hasta 72 horas.',
    ],
    disagree: [
      'Sobre el plazo: MSD cita de 6 a 12 horas antes de los primeros signos; CliniTox escribe que pueden aparecer a partir de 45 a 60 minutos, con un retraso posible de hasta 4 horas. Por eso, llama de inmediato, sin esperar los signos.',
      'Sobre el contenido: CliniTox da rangos en lugar de valores únicos, unos 0,5 a 2,3 mg de teobromina por gramo de chocolate con leche y 5 a 8,8 mg en un chocolate amargo al 55 %. Esta página calcula con los valores de MSD.',
    ],
    piece: {
      a: 'una tableta (100 g)',
      one: 'tableta',
      many: 'tabletas',
      grams: 100,
      basis: '1 tableta = 100 g',
    },
    thresholds: [
      {
        label: 'Chocolate con leche hasta 20 mg/kg',
        lead: 'el primer umbral de MSD (20 mg/kg) en chocolate con leche',
      },
      {
        label: 'Amargo o semidulce hasta 20 mg/kg',
        lead: 'el primer umbral de MSD (20 mg/kg) en chocolate amargo',
      },
      {
        label: 'Chocolate para repostería hasta 20 mg/kg',
        lead: 'el primer umbral de MSD (20 mg/kg) en chocolate para repostería',
      },
    ],
    thresholdNote:
      'La cantidad de cada tipo que llega a 20 mg/kg, donde MSD cita los primeros signos leves, calculada para cuatro pesos con el contenido por gramo de MSD. Menos no es motivo para quedarse tranquilo: la llamada va primero.',
    questions: [
      {
        question: '¿El chocolate blanco es tóxico para los perros?',
        answer:
          'Contiene muy poca teobromina: la ASPCA considera el chocolate blanco el tipo menos peligroso, CliniTox cita 0,01 mg por gramo y MSD 0,04 mg. Aun así, llama a tu veterinario con la cantidad y el envoltorio para estar seguro.',
      },
      {
        question: '¿Cuántos gramos de chocolate son peligrosos para un perro?',
        answer:
          'Depende del tipo de chocolate y del peso: la tabla de arriba da la cantidad que llega a 20 mg/kg en perros de 5 a 35 kg. En el chocolate para repostería es una fracción de la cantidad de chocolate con leche.',
      },
    ],
    sources: [
      SOURCES_ES.msdChocolate,
      SOURCES_DE.clinitoxMethylxanthine,
      SOURCES_DE.vetmeduniHolidays,
      SOURCES_DE.btkPoisonings,
    ],
  },
  {
    id: 'rice',
    name: 'Arroz',
    food: 'arroz',
    answer: 'el arroz cocido solo en agua es seguro',
    short: 'Sí, cocido y simple',
    summary:
      'El arroz blanco o integral, cocido solo en agua, es seguro y una comida suave habitual para un estómago revuelto.',
    why: [
      'El AKC escribe que los perros pueden comer arroz sin peligro si está cocido solo en agua, y PetMD considera seguro con moderación el arroz blanco o integral cocido sin nada más.',
      'Es suave y fácil de digerir. El AKC cita al Dr. Steve Weinberg: el arroz ayuda a dar consistencia a las heces cuando hay diarrea. Para un estómago revuelto conviene el arroz blanco, porque tiene menos fibra (AKC).',
    ],
    serve: [
      'Cuécelo en agua, sin sal, mantequilla ni especias (AKC), y déjalo enfriar.',
      'Para un estómago revuelto, PetMD lo mezcla dos partes a una con pollo o pavo cocido, sin huesos ni piel.',
    ],
    never: ['El arroz frito y el arroz con ajo o cebolla (PetMD).'],
    usdaName: 'de arroz blanco cocido',
    piece: {
      a: 'una cucharada de arroz cocido',
      one: 'cucharada',
      many: 'cucharadas',
      basis: 'un dieciseisavo de la taza del USDA de 158 g',
    },
    sizeGuide: {
      note: 'Las cantidades de PetMD como premio, dos o tres veces por semana, cocido, con las categorías de peso convertidas de libras a kilogramos.',
      rows: [
        ['Muy pequeño (1 a 5 kg)', '1 a 2 cucharadas'],
        ['Pequeño (5 a 9 kg)', '2 a 3 cucharadas'],
        ['Mediano (10 a 23 kg)', '¼ de taza'],
        ['Grande (23 a 41 kg)', '½ taza'],
        ['Muy grande (desde 41 kg)', '⅔ de taza'],
      ],
    },
    questions: [
      {
        question: '¿Un perro con diabetes puede comer arroz?',
        answer:
          'El AKC escribe que los perros con diabetes deberían evitar el arroz blanco común por su índice glucémico más alto, y PetMD aconseja preguntarle antes a tu veterinario.',
      },
      {
        question: '¿El arroz ayuda a un perro con diarrea?',
        answer:
          'El AKC cita al Dr. Steve Weinberg: el arroz ayuda a dar consistencia a las heces cuando hay diarrea, y el blanco sirve mejor que el integral porque tiene menos fibra. Si la diarrea no se va, tu perro debe ver a un veterinario.',
      },
    ],
    sources: [],
  },
  {
    id: 'popcorn',
    name: 'Palomitas de maíz',
    food: 'palomitas',
    answer: 'solo palomitas naturales, infladas con aire caliente',
    short: 'Sí, naturales',
    summary:
      'Unas pocas palomitas naturales, infladas con aire, van bien; la mantequilla, la sal y los granos sin reventar, no.',
    why: [
      'El AKC dice que las palomitas naturales infladas con aire caliente suelen ser seguras para los perros en pequeñas cantidades. PetMD precisa: totalmente naturales, infladas con aire caliente, sin aceite, mantequilla, sal ni azúcar.',
      'Las palomitas del cine y las de microondas son otro alimento: según PetMD, la mantequilla puede alterar el estómago y llevar a una pancreatitis, y la sal a una intoxicación por sal.',
    ],
    serve: [
      'Infladas con aire caliente y naturales, como premio ocasional (AKC).',
      'Solo las que reventaron por completo (AKC, PetMD).',
    ],
    never: [
      'Los granos sin reventar o a medio reventar: se quedan entre los dientes y pueden atragantar a un perro u obstruirle el intestino (AKC, PetMD).',
      'Las palomitas con mantequilla, saladas, acarameladas o con sabores (AKC, PetMD).',
    ],
    signs: [
      'Unas pocas palomitas caídas al suelo probablemente no le hagan daño, pero si hay vómitos, diarrea o decaimiento, el AKC aconseja llamar a tu veterinario.',
    ],
    usdaName: 'de palomitas de maíz infladas con aire caliente',
    piece: {
      a: 'una taza de palomitas',
      one: 'taza de palomitas',
      many: 'tazas de palomitas',
      basis: 'USDA: 1 taza = 8 g',
    },
    sizeGuide: {
      note: 'La tabla de porciones de PetMD en palomitas, con las categorías de peso convertidas de libras a kilogramos.',
      rows: [
        ['Muy pequeño (1 a 9 kg)', '1 a 2 palomitas'],
        ['Pequeño (10 a 14 kg)', '2 a 3 palomitas'],
        ['Mediano (14 a 23 kg)', '5 a 6 palomitas'],
        ['Grande (23 a 41 kg)', 'Un puñado pequeño'],
        ['Muy grande (desde 41 kg)', 'Un puñado'],
      ],
    },
    questions: [
      {
        question: '¿Los perros pueden comer palomitas de microondas?',
        answer:
          'No tal como se venden: se preparan con aceite, saborizante de mantequilla y sal. El AKC y PetMD solo aceptan palomitas naturales infladas con aire caliente.',
      },
      {
        question: '¿Un perro puede comer palomitas dulces del cine?',
        answer:
          'No. El AKC y PetMD descartan las palomitas con mantequilla, saladas, acarameladas o con sabores, y según PetMD las del cine son otro alimento distinto de las palomitas naturales.',
      },
    ],
    sources: [],
  },
  {
    id: 'bread',
    name: 'Pan',
    food: 'pan',
    answer: 'el pan simple está permitido, la masa cruda con levadura nunca',
    short: 'Sí, pero no la masa cruda',
    summary:
      'El pan blanco o integral simple es seguro en trozos pequeños; la masa cruda con levadura, en cambio, es una urgencia.',
    why: [
      'El AKC escribe que el pan blanco y el de trigo simples suelen ser seguros para los perros con moderación, y lo considera básicamente un relleno. PetMD escribe que aporta pocos nutrientes.',
      'El peligro es la masa cruda con levadura. La ASPCA escribe que puede crecer e hinchar el estómago, y el Merck Veterinary Manual explica que la levadura produce además etanol, que pasa a la sangre y causa embriaguez y acidosis. PetMD la considera una urgencia médica, con riesgo de dilatación y torsión del estómago. La Universidad de Medicina Veterinaria de Viena advierte también que la masa de pan fermentada puede hincharse rápido con el calor del estómago.',
    ],
    serve: [
      'Pan simple, un trozo pequeño cada vez (AKC).',
      'Si tu perro comió masa cruda, llama de inmediato a tu veterinario o a una clínica veterinaria de urgencias (PetMD).',
    ],
    never: [
      'La masa cruda de pan o de pizza (ASPCA, Merck).',
      'El pan con pasas, chocolate, xilitol, ajo, cebolla, nuez moscada o frutos secos, como el pan de ajo, el pan de plátano o el pan con pasas (PetMD, AKC).',
    ],
    signs: [
      'Masa cruda: primero arcadas sin expulsar nada, abdomen hinchado y decaimiento (Merck), y luego tambaleo, desorientación, debilidad, glucosa baja y, en los casos graves, convulsiones o coma.',
    ],
    usdaName: 'de pan blanco comercial',
    piece: {
      a: 'una rebanada de pan blanco',
      one: 'rebanada',
      many: 'rebanadas',
      basis: 'USDA: 1 rebanada = 29 g',
    },
    questions: [
      {
        question: 'Mi perro comió masa de pizza cruda. ¿Qué hago?',
        answer:
          'Llama ya a tu veterinario o a una clínica veterinaria de urgencias. La masa sigue creciendo con el calor del estómago y produce alcohol al fermentar (ASPCA, Merck); PetMD la trata como una urgencia.',
      },
      {
        question: '¿Los perros pueden comer pan con pasas?',
        answer:
          'No. PetMD y el AKC descartan el pan con pasas, y las pasas son tóxicas para los perros. Si tu perro lo comió, llama a tu veterinario.',
      },
    ],
    sources: [SOURCES_DE.vetmeduniHolidays],
  },
  {
    id: 'almonds',
    name: 'Almendras',
    food: 'almendras',
    answer: 'las almendras tienen demasiada grasa y pueden quedarse atascadas',
    short: 'Mejor no',
    summary:
      'Las almendras no son tóxicas como las macadamias, pero tienen mucha grasa, suelen venir saladas y pueden atragantar.',
    why: [
      'El AKC responde que no. Como la mayoría de los frutos secos, las almendras tienen mucha grasa, lo que puede provocar una pancreatitis (AKC, PetMD), y las almendras envasadas suelen llevar mucha sal (PetMD). La ASPCA escribe que los aceites y las grasas de los frutos secos pueden causar vómitos y diarrea; la Universidad de Medicina Veterinaria de Viena incluye los frutos secos entre los alimentos que pueden provocar vómitos, diarrea o una pancreatitis que pone en riesgo la vida.',
      'El otro problema es el tamaño y la forma: según el AKC, una almendra puede obstruir el esófago, el intestino o la tráquea de un perro, sobre todo en razas pequeñas.',
    ],
    serve: [
      'Una o dos almendras: vigila de cerca a tu perro. Más que unas pocas: llama a tu veterinario o a una clínica veterinaria de urgencias (AKC).',
      'Para una raza pequeña o una cantidad mayor, PetMD aconseja llamar de inmediato; en unos 30 minutos, el veterinario puede decidir provocarle el vómito.',
    ],
    never: [
      'Las almendras enteras, con o sin cáscara, y las almendras saladas o con sabores (AKC, PetMD).',
      'La crema de almendras con sal, azúcar o xilitol (PetMD).',
    ],
    signs: [
      'Vómitos, diarrea, gases, falta de apetito y decaimiento; arcadas, abdomen hinchado o atragantamiento si una almendra se quedó atascada (AKC, PetMD).',
    ],
    usdaName: 'de almendras',
    piece: {
      a: 'una almendra',
      one: 'almendra',
      many: 'almendras',
      basis: 'USDA: 1 almendra = 1,2 g',
    },
    questions: [
      {
        question: '¿Las almendras son tóxicas para los perros?',
        answer:
          'No como las nueces de macadamia. Las fuentes las desaconsejan por la grasa, la sal y el riesgo de obstrucción intestinal (AKC, PetMD).',
      },
      {
        question: 'Mi perro se comió una almendra. ¿Qué hago?',
        answer:
          'Con una o dos, vigílalo de cerca; con más de unas pocas, llama a tu veterinario o a una clínica veterinaria de urgencias (AKC). PetMD aconseja llamar de inmediato si es una raza pequeña.',
      },
    ],
    sources: [SOURCES_DE.vetmeduniHolidays],
  },
  {
    id: 'cashews',
    name: 'Nueces de la India (anacardos)',
    food: 'nueces de la India',
    answer: 'no más de una o dos nueces de la India naturales',
    short: 'Sí, una o dos',
    summary:
      'Una o dos nueces de la India sin sal no son tóxicas, pero tienen mucha grasa, y una mezcla puede esconder macadamias.',
    why: [
      'PetMD escribe que las nueces de la India no son tóxicas para los perros, y el AKC las considera en general seguras. Los dos se quedan en unas pocas: tienen mucha grasa, lo que según el AKC puede llevar a una pancreatitis, una enfermedad que puede poner en riesgo la vida.',
      'El AKC no ve ninguna razón para darle frutos secos a un perro; PetMD señala que las nueces de la India son más blandas que la mayoría de los frutos secos, así que el perro tiene menos riesgo de atragantarse.',
    ],
    serve: [
      'Solo nueces de la India naturales y sin sal, como premio poco frecuente (AKC). Pícalas o muélelas y espolvoréalas sobre la comida para que no se atragante (PetMD).',
    ],
    never: [
      'Las nueces de la India saladas: según el AKC, la sal puede causar vómitos, debilidad, diarrea, temblores y convulsiones.',
      'Las mezclas y surtidos de frutos secos, que pueden contener nueces de macadamia (AKC, PetMD).',
    ],
    signs: ['Vómitos o diarrea; rara vez una alergia, con hinchazón, picazón y ronchas (PetMD).'],
    usdaName: 'de nueces de la India tostadas en aceite, sin sal',
    piece: {
      a: 'una nuez de la India',
      one: 'nuez de la India',
      many: 'nueces de la India',
      basis: 'USDA: 1 onza (18 nueces) = 28,35 g',
    },
    sizeGuide: {
      note: 'Las cantidades de PetMD en nueces de la India enteras, con las categorías de peso convertidas de libras a kilogramos. El AKC no da cantidades y desaconseja los frutos secos.',
      rows: [
        ['Muy pequeño (1 a 9 kg)', '1 o 2 nueces'],
        ['Pequeño (10 a 14 kg)', '2 a 3 nueces'],
        ['Mediano (14 a 23 kg)', '5 a 6 nueces'],
        ['Grande (23 a 41 kg)', '10 a 12 nueces'],
        ['Muy grande (desde 41 kg)', '12 a 18 nueces'],
      ],
    },
    questions: [
      {
        question: '¿Los perros pueden comer frutos secos mezclados?',
        answer:
          'No: una mezcla puede contener nueces de macadamia, que son tóxicas para los perros, y casi siempre viene salada (AKC, PetMD).',
      },
      {
        question: '¿Las nueces de la India son tóxicas para los perros?',
        answer:
          'No, PetMD dice que no son tóxicas. Pero tienen mucha grasa, y el AKC advierte del riesgo de pancreatitis; no más de unas pocas, naturales y sin sal.',
      },
    ],
    sources: [],
  },
  {
    id: 'macadamia-nuts',
    name: 'Nueces de macadamia',
    food: 'nueces de macadamia',
    answer: 'las nueces de macadamia son tóxicas para los perros',
    short: 'No, son tóxicas',
    summary:
      'Las nueces de macadamia causan en el perro debilidad, temblores y fiebre en menos de 12 horas; no se sabe por qué.',
    why: [
      'La ASPCA dice que las nueces de macadamia pueden causar en el perro debilidad, falta de coordinación, decaimiento, vómitos, temblores y aumento de la temperatura (hipertermia). El Manual de veterinaria de MSD (la edición en español del Merck) describe la intoxicación en el perro; no se sabe cómo la provoca la nuez (MSD, VCA).',
      'MSD indica que los perros muestran signos tras comer 2,4 g de nueces por kg de peso corporal, apenas unas pocas nueces para un perro pequeño. VCA escribe que bastan unas pocas nueces para enfermar a un perro.',
    ],
    serve: [
      'Llama ya a tu veterinario o a una clínica veterinaria de urgencias. Si tu perro las comió hace poco, según MSD los veterinarios le provocan el vómito a partir de 1 a 2 g por kg; no lo hagas en casa si el veterinario no te lo indica.',
      'Ve de inmediato a una clínica veterinaria de urgencias si tu perro ya no puede pararse ni caminar, o si tiembla mucho (ASPCA).',
    ],
    never: [
      'Las nueces de macadamia, las mezclas de frutos secos y las galletas, brownies y bombones que las contienen. La Universidad de Medicina Veterinaria de Viena aconseja guardar los frutos secos fuera del alcance de los animales.',
    ],
    signs: [
      'MSD: en menos de 12 horas, debilidad (sobre todo de las patas traseras), decaimiento, vómitos, tambaleo, temblores o fiebre. Los signos suelen desaparecer en 12 a 48 horas; VCA espera, con tratamiento, una recuperación completa en 24 a 48 horas.',
      'CliniTox, la base de datos toxicológica de la facultad Vetsuisse de Zúrich, describe el mismo cuadro: debilidad sobre todo del tren trasero y fiebre de hasta 40,5 °C, casi siempre menos de 12 horas después de comerlas, y una recuperación completa espontánea en 24 a 48 horas.',
      'Las nueces de macadamia cubiertas de chocolate suman a la nuez una intoxicación por chocolate.',
    ],
    disagree: [
      'Sobre cuánto preocuparse: MSD describe signos casi siempre leves que desaparecen solos, y la ASPCA escribe que la mayoría de los casos se tratan en casa con la guía de un veterinario. VCA y el AKC aconsejan llamar al veterinario de inmediato. En cualquier caso, esa guía solo la obtienes llamando.',
      'Sobre la cantidad: MSD indica signos desde 2,4 g por kg, y CliniTox cita en perros cantidades de 0,7 a 62,4 g por kg de peso corporal, a veces mucho menos. Esta página calcula con el valor de MSD.',
    ],
    usdaName: 'de nueces de macadamia crudas',
    piece: {
      a: 'una nuez de macadamia',
      one: 'nuez de macadamia',
      many: 'nueces de macadamia',
      basis: 'USDA: 1 onza (10 a 12 nueces) = 28,35 g, calculado con 11 nueces',
    },
    thresholds: [
      {
        label: 'MSD: signos con 2,4 g/kg',
        lead: 'la cantidad de 2,4 g/kg con la que MSD describe signos',
      },
    ],
    thresholdNote:
      'Los gramos de nueces de macadamia que llegan a los 2,4 g/kg con los que MSD describe signos en el perro, calculados para cuatro pesos, y la misma cantidad en nueces de unos 2,6 g (la onza del USDA de 10 a 12 nueces). Es un caso descrito, no un límite seguro.',
    questions: [
      {
        question: '¿Cuántas nueces de macadamia le hacen daño a un perro?',
        answer:
          'MSD indica signos a partir de 2,4 g por kg de peso corporal. Para un perro pequeño es un puñado de nueces, para uno grande más, como muestra la tabla; VCA escribe que bastan unas pocas nueces para enfermar a un perro.',
      },
      {
        question: '¿Cuánto dura una intoxicación por nueces de macadamia?',
        answer:
          'Los signos suelen aparecer en menos de 12 horas y, según MSD, por lo general se resuelven en 12 a 48 horas; VCA y CliniTox citan una recuperación completa en 24 a 48 horas. Aun así, llama sin esperar.',
      },
    ],
    sources: [SOURCES_ES.msdMacadamia, SOURCES_DE.clinitoxMacadamia, SOURCES_DE.vetmeduniHolidays],
  },
  {
    id: 'xylitol-gum',
    name: 'Chicle con xilitol',
    food: 'chicle',
    answer: 'el xilitol del chicle es tóxico para los perros',
    short: 'No, el xilitol es tóxico',
    summary:
      'El xilitol de chicles sin azúcar, caramelos y algunas cremas de cacahuate baja rápido la glucosa del perro y daña su hígado.',
    why: [
      'La FDA advierte que el xilitol puede provocar en el perro una fuerte liberación de insulina por el páncreas y una caída rápida y profunda de la glucosa. El Manual de veterinaria de MSD (la edición en español del Merck), VCA y la ASPCA describen la misma intoxicación, y las dosis más altas causan insuficiencia hepática. La Universidad de Medicina Veterinaria de Viena califica el azúcar de abedul, otro nombre del xilitol, de muy peligroso para los perros.',
      'MSD da las dosis: hipoglucemia con más de unos 100 mg por kg de peso corporal, e insuficiencia hepática con más de 500 mg por kg. CliniTox, la base de datos toxicológica de la facultad Vetsuisse de Zúrich, cita los mismos dos umbrales. Un chicle o una pastilla de menta contiene de 0,22 a 1,0 g de xilitol, según la toxicóloga veterinaria Dra. Ahna Brutlag en dvm360.',
    ],
    serve: [
      'Llama ya a tu veterinario o a una clínica veterinaria de urgencias, o ve directamente (FDA). Lleva el paquete: la marca y el número de chicles son lo que el veterinario necesita.',
      'No le provoques el vómito a tu perro por tu cuenta, salvo que el veterinario te lo indique (VCA).',
    ],
    never: [
      'Los chicles, las pastillas de menta y los dulces sin azúcar, y todo lo endulzado con xilitol, azúcar de abedul o azúcar de madera.',
      'La FDA menciona también algunas cremas de cacahuate y de frutos secos, productos horneados, la pasta de dientes y el enjuague bucal, las vitaminas masticables, los jarabes para la tos y los suplementos.',
    ],
    signs: [
      'Hipoglucemia en 10 a 60 minutos (FDA) o en unos 30 minutos (MSD), aunque puede retrasarse hasta 12 a 18 horas cuando el xilitol va en algo que frena su absorción, como algunos chicles (MSD): vómitos, debilidad, tambaleo, colapso y convulsiones.',
      'La insuficiencia hepática puede no notarse hasta pasadas 24 a 48 horas o más (MSD). Según MSD, el 62,5 % de los perros con signos de daño en el hígado murieron o fueron sacrificados.',
    ],
    disagree: [
      'Sobre el plazo: 10 a 15 minutos según dvm360, 10 a 60 minutos según la FDA y CliniTox (casi siempre primero con vómitos), unos 30 minutos según MSD y de 30 minutos a dos horas según VCA. La FDA y VCA aconsejan llamar de inmediato, sin esperar los signos.',
      'Para la insuficiencia hepática, CliniTox cita un plazo de 8 a 12 horas, en algunos casos hasta 72 horas; MSD escribe 24 a 48 horas o más.',
      'Sobre la dosis: CliniTox recomienda una descontaminación y un control de la glucosa desde 50 mg de xilitol por kg, la mitad del umbral que MSD fija para la hipoglucemia. La tabla calcula con los umbrales de MSD.',
    ],
    usdaName: 'de chicle sin azúcar',
    piece: {
      a: 'un chicle',
      one: 'chicle',
      many: 'chicles',
      basis: 'USDA: 1 pieza = 2 g',
    },
    compound: 'xilitol',
    thresholds: [
      {
        label: 'MSD: hipoglucemia por encima de 0,1 g/kg',
        lead: 'la cantidad de 0,1 g de xilitol por kg a partir de la cual, según MSD, baja la glucosa,',
      },
      {
        label: 'MSD: insuficiencia hepática por encima de 0,5 g/kg',
        lead: 'la cantidad de 0,5 g por kg que MSD asocia con la insuficiencia hepática',
      },
    ],
    thresholdNote:
      'El xilitol que llega a cada umbral de MSD, para cuatro pesos, y el número de chicles que lo contienen: de un chicle fuerte con 1 g por pieza a uno suave con 0,22 g (dvm360). Lee el paquete: la cifra exacta depende de la marca, y la llamada va primero.',
    questions: [
      {
        question: 'Mi perro se comió un chicle sin azúcar. ¿Ya es peligroso?',
        answer:
          'Puede serlo. Un chicle fuerte con 1 g de xilitol por pieza supera el umbral de MSD para la hipoglucemia en cualquier perro de menos de unos 10 kg, como muestra la tabla. Llama de inmediato y ten el paquete a mano.',
      },
      {
        question: '¿Los perros pueden comer azúcar de abedul?',
        answer:
          'No. El azúcar de abedul es otro nombre del xilitol (FDA), y VCA cita también el azúcar de madera y el extracto de corteza de abedul: el mismo endulzante y el mismo peligro. La Universidad de Medicina Veterinaria de Viena califica el azúcar de abedul de muy peligroso para los perros.',
      },
      {
        question: '¿La pasta de dientes para personas es peligrosa para los perros?',
        answer:
          'Puede serlo: la FDA incluye la pasta de dientes y el enjuague bucal entre los productos que pueden contener xilitol. Lee la lista de ingredientes y llama a tu veterinario si tu perro comió pasta de dientes con xilitol.',
      },
    ],
    sources: [SOURCES_ES.msdXylitol, SOURCES_DE.clinitoxXylitol, SOURCES_DE.vetmeduniHolidays],
  },
];
