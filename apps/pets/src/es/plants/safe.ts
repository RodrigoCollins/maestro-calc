import type { PlantEs } from './types.ts';

/** The Spanish words of the plants the ASPCA lists as safe (`src/plants/safe.ts`), in the same order. */
export const SAFE_ES: readonly PlantEs[] = [
  {
    id: 'spider-plants',
    slug: 'cinta',
    subject: 'la cinta',
    gender: 'f',
    plural: false,
    name: 'Cinta (malamadre)',
    names:
      'malamadre o mala madre (España, Argentina), lazo de amor (México), clorofito o planta araña; su nombre botánico es Chlorophytum comosum',
    answer: 'la ASPCA la incluye entre las no tóxicas para perros y gatos',
    short: 'es segura',
    summary:
      'La cinta (Chlorophytum comosum) figura como no tóxica para perros y gatos según la ASPCA: una de las plantas colgantes más seguras con mascotas.',
    parts:
      'Ninguna: la ficha de la ASPCA no da principio tóxico ni signos clínicos. Aun así, un gato que mastica sus hojas largas y arqueadas puede vomitar, como con cualquier planta.',
    why: [
      'La ASPCA incluye Chlorophytum comosum entre las plantas no tóxicas para perros y para gatos, y le da como otros nombres ribbon plant, anthericum y spider ivy. Su ficha no dice nada de los caballos.',
    ],
    signs: [
      'Como con cualquier planta de su lista, la ASPCA advierte que masticar las hojas de la cinta puede causar vómitos y malestar de estómago a un perro o a un gato, aunque no se espera que ponga su vida en peligro.',
    ],
    act: [
      'No hay urgencia. Cambia la maceta de sitio si tu gato la mastica tanto que vomita, y llama a tu veterinario si los vómitos no paran: eso no se explica solo por la planta.',
    ],
    disagree: [
      'La ASPCA usa el nombre inglés «ribbon plant» tanto para la cinta como para una dracena, que sí es tóxica. Busca en la etiqueta el nombre científico Chlorophytum comosum.',
    ],
    questions: [
      {
        question: '¿Por qué a mi gato le encanta masticar la cinta?',
        answer:
          'Las fuentes de la ASPCA que cita esta página no lo explican. Solo dicen que no es tóxica y que masticar cualquier planta puede hacer vomitar a un gato.',
      },
    ],
    sources: [],
  },
  {
    id: 'christmas-cactus',
    slug: 'cactus-de-navidad',
    subject: 'el cactus de Navidad',
    gender: 'm',
    plural: false,
    name: 'Cactus de Navidad',
    names:
      'Santa Teresita (Argentina), cactus navideño o schlumbergera; su nombre botánico es Schlumbergera bridgesii',
    answer: 'figura en la lista de plantas no tóxicas de la ASPCA',
    short: 'seguro',
    summary:
      'El cactus de Navidad (Schlumbergera) es no tóxico para gatos, perros y caballos según la ASPCA: un buen cambio por una Nochebuena o una amarilis.',
    parts: 'Ninguna: la ficha de la ASPCA no da ningún principio tóxico para el cactus de Navidad.',
    why: [
      'La ASPCA incluye Schlumbergera bridgesii entre las plantas no tóxicas para perros, gatos y caballos, y archiva el cactus de Pascua en la misma ficha.',
    ],
    signs: [
      'La ASPCA recuerda que comer cualquier planta puede dar vómitos y malestar de estómago; de un cactus de Navidad mordisqueado no espera nada que ponga en peligro la vida de tu mascota.',
    ],
    act: [
      'Espera y observa: unos pocos vómitos pueden seguir a mordisquear sus tallos, como pasa con cualquier planta. Llama a tu veterinario si no se le pasan.',
    ],
    questions: [
      {
        question: '¿El cactus de Pascua también es seguro?',
        answer:
          'La ASPCA da el cactus de Pascua como otro nombre de la ficha del cactus de Navidad, no tóxico para perros, gatos y caballos.',
      },
      {
        question: '¿Qué plantas de Navidad son tóxicas, entonces?',
        answer:
          'La flor de Nochebuena, el acebo, el muérdago americano y la amarilis están todos en la lista de plantas tóxicas de la ASPCA.',
      },
    ],
    sources: [],
  },
  {
    id: 'money-trees',
    slug: 'pachira',
    subject: 'la pachira',
    gender: 'f',
    plural: false,
    name: 'Pachira (árbol del dinero)',
    names:
      'árbol del dinero, zapote bobo (México), castaño de Guayana; su nombre botánico es Pachira aquatica',
    answer: 'es segura, aunque puede revolver el estómago',
    short: 'es segura',
    summary:
      'La pachira (Pachira aquatica) es no tóxica para gatos, perros y caballos según la ASPCA, aunque su ficha nombra náuseas, vómitos y heces blandas.',
    parts:
      'Ninguna parte tóxica: la ASPCA da como principio tóxico «ninguno». Lo que una mascota mastica es su tronco trenzado y sus hojas.',
    why: [
      'La ASPCA incluye Pachira aquatica entre las plantas no tóxicas para perros, gatos y caballos, le da money plant como otro nombre en inglés y escribe «None» como principio tóxico.',
    ],
    signs: [
      'La ficha de la ASPCA de la pachira nombra, aun así, náuseas, vómitos y heces blandas.',
    ],
    act: [
      'Lo más que cabe esperar son esas molestias de estómago. Llama a tu veterinario si duran más de un día o si tu mascota deja de comer.',
    ],
    disagree: [
      'La ficha dice no tóxica y a la vez da signos. En la lista de la ASPCA, no tóxica quiere decir que no se espera que ponga en peligro la vida, no que tu mascota no vaya a notar nada.',
      '«Árbol del dinero» y «planta del dinero» son nombres que las tiendas ponen también a otras plantas: busca Pachira aquatica en la etiqueta.',
    ],
    questions: [
      {
        question: '¿Por qué la ASPCA da signos para una planta no tóxica?',
        answer:
          'Porque una planta no tóxica también puede revolver el estómago; la ASPCA lo dice de todas las plantas de su lista.',
      },
    ],
    sources: [],
  },
  {
    id: 'roses',
    slug: 'rosas',
    subject: 'las rosas',
    gender: 'f',
    plural: true,
    name: 'Rosas',
    names: 'rosal (la planta entera); su nombre botánico es Rosa',
    answer: 'la ASPCA incluye las rosas entre las no tóxicas',
    short: 'son seguras',
    summary:
      'Las rosas son no tóxicas para gatos, perros y caballos en la lista de la ASPCA, y la opción segura para un ramo en una casa con gato.',
    parts: 'Ninguna parte tóxica en la ficha de la ASPCA, que abarca las especies del género Rosa.',
    why: [
      'La ASPCA incluye las especies de Rosa entre las plantas no tóxicas para perros, gatos y caballos, y en el principio tóxico de su ficha escribe «no tóxica».',
    ],
    signs: [
      'Un perro o un gato que se come unos pétalos de rosa puede vomitar o tener el estómago revuelto, como con cualquier planta según la ASPCA, sin que se espere un peligro para su vida.',
    ],
    act: [
      'Revisa el resto del ramo: la rosa es segura, pero los lirios, los claveles o la gypsophila que se venden con ella tienen sus propias fichas.',
      'Una espina clavada en la boca o en una pata es una herida, no una intoxicación; llévalo a tu veterinario si no sale.',
    ],
    questions: [
      {
        question: '¿Un ramo variado con rosas es seguro para un gato?',
        answer:
          'Solo si lo es cada flor del ramo. Las rosas están en la lista de no tóxicas de la ASPCA; los lirios del mismo ramo pueden matar a un gato.',
      },
    ],
    sources: [],
  },
  {
    id: 'sunflowers',
    slug: 'girasoles',
    subject: 'los girasoles',
    gender: 'm',
    plural: true,
    name: 'Girasoles',
    names:
      'girasol de pantano, la especie de la ficha de la ASPCA; su nombre botánico es Helianthus angustifolius',
    answer: 'la ASPCA incluye el girasol entre las no tóxicas',
    short: 'seguros',
    summary:
      'La ASPCA da el girasol como no tóxico para gatos, perros y caballos; su ficha es la del girasol de pantano, Helianthus angustifolius.',
    parts: 'Ninguna parte tóxica en la ficha del girasol de la ASPCA.',
    why: [
      'La ASPCA incluye Helianthus angustifolius, el girasol de pantano, entre las plantas no tóxicas para perros, gatos y caballos.',
    ],
    signs: [
      'La ASPCA no espera más que vómitos o malestar de estómago de un girasol mordisqueado, lo mismo que dice de cualquier planta que una mascota se coma.',
    ],
    act: [
      'Un girasol de pantano en un arriate está en la lista de seguras. Un girasol en un ramo variado es tan seguro como las flores que lo rodean: búscalas por su nombre.',
    ],
    disagree: [
      'La ficha nombra el girasol de pantano, no el girasol común de jardín (Helianthus annuus), que la lista no menciona. Pregunta a tu veterinario por un girasol que no esté en ella.',
    ],
    questions: [
      {
        question: '¿Los perros pueden comer pipas de girasol?',
        answer:
          'La ficha de la ASPCA habla de la planta, no de las semillas como alimento. Pregunta a tu veterinario si quieres darlas como premio.',
      },
    ],
    sources: [],
  },
  {
    id: 'orchids',
    slug: 'orquideas',
    subject: 'las orquídeas',
    gender: 'f',
    plural: true,
    name: 'Orquídeas',
    names: 'orquídea mariposa, falenopsis o phalaenopsis; su nombre botánico es Phalaenopsis',
    answer: 'la orquídea mariposa está en la lista de no tóxicas',
    short: 'la mariposa no',
    summary:
      'La ASPCA incluye la phalaenopsis, u orquídea mariposa, entre las no tóxicas para gatos, perros y caballos: la de casi todos los supermercados.',
    parts: 'Ninguna parte tóxica en la ficha de la ASPCA de la orquídea mariposa.',
    why: [
      'La ASPCA incluye Phalaenopsis sp., la orquídea mariposa o de luna, entre las plantas no tóxicas para perros, gatos y caballos.',
    ],
    signs: [
      'Si tu gato muerde una hoja o una flor de phalaenopsis, la ASPCA no espera más que lo que puede causar cualquier planta: algún vómito o un estómago revuelto, sin peligro para su vida.',
    ],
    act: [
      'No hay urgencia. La corteza del sustrato y el abono son otra cuestión, aparte de la planta: pregunta a tu veterinario si tu mascota se los comió.',
    ],
    disagree: [
      'La ficha es solo para Phalaenopsis. Las demás orquídeas tienen otras fichas, o ninguna: revisa la etiqueta.',
    ],
    questions: [
      {
        question: '¿Todas las orquídeas son seguras para los gatos?',
        answer:
          'La ficha de la ASPCA que usa esta página abarca la orquídea phalaenopsis (mariposa). Busca cualquier otra orquídea por su nombre científico.',
      },
    ],
    sources: [],
  },
  {
    id: 'basil',
    slug: 'albahaca',
    subject: 'la albahaca',
    gender: 'f',
    plural: false,
    name: 'Albahaca',
    names:
      'alfábega o alhábega (algunas zonas de España), basílico; su nombre botánico es Ocimum basilicum',
    answer: 'la ASPCA la incluye entre las no tóxicas para gatos y perros',
    short: 'es segura',
    summary:
      'La albahaca (Ocimum basilicum) es no tóxica para gatos y perros en la lista de la ASPCA: una hierba que puedes cultivar al alcance de tus mascotas.',
    parts: 'Ninguna parte tóxica en la ficha de la ASPCA de la albahaca.',
    why: [
      'La ASPCA reúne la albahaca dulce, la albahaca tailandesa y la Saint Joseph’s wort bajo Ocimum basilicum, no tóxica para perros y gatos. Su ficha no dice nada de los caballos.',
    ],
    signs: [
      'Unas hojas de albahaca comidas de la maceta pueden, como cualquier planta según la ASPCA, dar algún vómito o malestar de estómago, pero no se espera que pongan en peligro a tu perro o a tu gato.',
    ],
    act: [
      'No hay urgencia. El pesto y las salsas son otra cosa: a menudo llevan ajo, que es tóxico para los perros.',
    ],
    questions: [
      {
        question: '¿Qué hierbas de cocina son tóxicas, entonces?',
        answer:
          'De las hierbas de estas páginas, la ASPCA incluye la menta y la lavanda entre las tóxicas para perros y gatos, y la hierba gatera entre las tóxicas para gatos.',
      },
    ],
    sources: [],
  },
  {
    id: 'rosemary',
    slug: 'romero',
    subject: 'el romero',
    gender: 'm',
    plural: false,
    name: 'Romero',
    names: 'romero común; su nombre botánico es Rosmarinus officinalis',
    answer: 'la ASPCA lo incluye entre las no tóxicas',
    short: 'es seguro',
    summary:
      'El romero es no tóxico para gatos, perros y caballos en la lista de la ASPCA: una hierba segura para una maceta o un borde del jardín.',
    parts: 'Ninguna parte tóxica en la ficha de la ASPCA del romero.',
    why: [
      'La ASPCA incluye Rosmarinus officinalis, también llamado anthos, entre las plantas no tóxicas para perros, gatos y caballos.',
    ],
    signs: [
      'Del romero, la ASPCA solo espera lo que dice de toda planta comida: quizá vómitos o un estómago revuelto, nada que amenace la vida de un perro o de un gato.',
    ],
    act: [
      'Un gato que mordisquea un romero en maceta junto a la ventana está en el lado seguro de la lista. Si la planta se fumigó o se abonó, pregunta a tu veterinario por el producto, no por la hierba.',
    ],
    questions: [
      {
        question: '¿El aceite de romero es lo mismo que la planta?',
        answer:
          'No. La ficha de la ASPCA es de la planta. Pregunta a tu veterinario antes de usar cualquier aceite esencial cerca de una mascota.',
      },
    ],
    sources: [],
  },
  {
    id: 'bamboo',
    slug: 'bambu',
    subject: 'el bambú',
    gender: 'm',
    plural: false,
    name: 'Bambú',
    names:
      'bambú dorado; no es el bambú sagrado (nandina) ni el bambú de la suerte; su nombre botánico es Phyllostachys aurea',
    answer: 'el bambú verdadero no, pero el bambú sagrado sí',
    short: 'el verdadero no',
    summary:
      'El bambú verdadero y la palmera bambú son no tóxicos para gatos y perros según la ASPCA; el bambú sagrado, un arbusto distinto, es tóxico.',
    parts:
      'Ninguna parte tóxica en el bambú dorado (Phyllostachys aurea). En el bambú sagrado (Nandina domestica), la ASPCA nombra glucósidos cianogénicos.',
    why: [
      'La ASPCA incluye Phyllostachys aurea, el bambú dorado, entre las plantas no tóxicas para perros, gatos y caballos. La palmera bambú (Chamaedorea elegans) también es no tóxica.',
      'El bambú sagrado, o nandina, no es un bambú. La ASPCA lo incluye entre las tóxicas para perros, gatos y caballos por sus glucósidos cianogénicos.',
    ],
    signs: [
      'Del bambú verdadero, la ficha no da ninguno. Del bambú sagrado, la ASPCA nombra debilidad, falta de coordinación, convulsiones, coma, insuficiencia respiratoria y muerte, que dice que son raros en mascotas.',
    ],
    act: [
      'Averigua qué planta es. Una mascota que masticó bayas u hojas de nandina y se ve débil o tambaleante necesita un veterinario ya; el bambú verdadero no es urgente.',
    ],
    disagree: [
      'Tres plantas comparten el nombre. El «bambú de la suerte» que se vende en agua es una dracena (Dracaena sanderiana), no un bambú, y la ASPCA incluye Dracaena spp. entre las tóxicas para perros y gatos.',
    ],
    questions: [
      {
        question: '¿El bambú de la suerte es tóxico para los gatos?',
        answer:
          'El bambú de la suerte es una dracena, y la ASPCA incluye Dracaena spp. entre las tóxicas para perros y gatos, con pupilas dilatadas en los gatos entre los signos.',
      },
      {
        question: '¿El bambú sagrado es tóxico para los perros?',
        answer:
          'Sí: la ASPCA incluye Nandina domestica entre las plantas tóxicas para perros, gatos y caballos.',
      },
    ],
    sources: [],
  },
  {
    id: 'calathea',
    slug: 'calathea',
    subject: 'la calathea',
    gender: 'f',
    plural: false,
    name: 'Calathea',
    names:
      'calatea, maranta o planta de la oración (la de la otra ficha de la ASPCA); su nombre botánico es Calathea',
    answer: 'las calatheas y la planta de la oración están en la lista de no tóxicas',
    short: 'es segura',
    summary:
      'Las calatheas y la planta de la oración son no tóxicas para gatos, perros y caballos según la ASPCA: hojas con dibujos seguras con mascotas.',
    parts: 'Ninguna parte tóxica en ninguna de las dos fichas de la ASPCA.',
    why: [
      'La ASPCA incluye Calathea spp. entre las plantas no tóxicas para perros, gatos y caballos. Su ficha de la planta de la oración (Calathea insignis) también es no tóxica, y da como otros nombres en inglés maranta, peacock plant, rattlesnake plant y zebra plant.',
    ],
    signs: [
      'Una hoja de calathea masticada puede, según lo que la ASPCA dice de todas las plantas, causar vómitos o malestar de estómago, pero no se espera que ponga en peligro a la mascota.',
    ],
    act: [
      'Una hoja mordida de calathea o de planta de la oración está en el lado seguro de la lista. Cambia la maceta de sitio si tu gato la sigue mordiendo y vomita a menudo.',
    ],
    questions: [
      {
        question: '¿La maranta es segura para los gatos?',
        answer:
          'La ASPCA da maranta como otro nombre de su ficha de la planta de la oración, que incluye entre las no tóxicas.',
      },
    ],
    sources: [],
  },
  {
    id: 'babys-breath',
    slug: 'gypsophila',
    subject: 'la gypsophila',
    gender: 'f',
    plural: false,
    name: 'Gypsophila (nube)',
    names:
      'nube (México), paniculata (España), velo de novia o gipsófila; su nombre botánico es Gypsophila elegans',
    answer: 'como mucho, un leve malestar de estómago',
    short: 'malestar leve',
    summary:
      'La gypsophila es no tóxica para gatos, perros y caballos en la lista de la ASPCA, que aun así nombra vómitos y diarrea leves si se come.',
    parts:
      'Las florecitas y los tallos que rellenan un ramo; la ASPCA no nombra ninguna parte tóxica.',
    why: [
      'La ASPCA incluye Gypsophila elegans, también llamada maiden’s breath en inglés, entre las plantas no tóxicas para perros, gatos y caballos.',
    ],
    signs: [
      'La ASPCA dice que, si se come, puede dar un malestar digestivo leve, como vómitos y diarrea.',
    ],
    act: [
      'Revisa el resto del ramo; la gypsophila suele ser el relleno alrededor de lirios o claveles, que tienen sus propias fichas.',
    ],
    questions: [
      {
        question: '¿La gypsophila es tóxica para los gatos?',
        answer:
          'No según la lista de la ASPCA, que la da como no tóxica pero dice que puede causar vómitos y diarrea leves.',
      },
    ],
    sources: [],
  },
  {
    id: 'african-violets',
    slug: 'violetas-africanas',
    subject: 'las violetas africanas',
    gender: 'f',
    plural: true,
    name: 'Violetas africanas',
    names: 'saintpaulia; su nombre botánico es Saintpaulia',
    answer: 'la ASPCA las incluye entre las no tóxicas',
    short: 'seguras',
    summary:
      'Las violetas africanas (Saintpaulia) son no tóxicas para gatos, perros y caballos según la ASPCA: una flor segura para la ventana del gato.',
    parts: 'Ninguna parte tóxica en la ficha de la ASPCA de la violeta africana.',
    why: [
      'La ASPCA incluye Saintpaulia spp. entre las plantas no tóxicas para perros, gatos y caballos.',
    ],
    signs: [
      'Las hojas peludas de una violeta africana no son tóxicas, pero comerlas puede dar, como con cualquier planta según la ASPCA, algún vómito o malestar de estómago sin peligro para la vida.',
    ],
    act: [
      'Una violeta tirada de la repisa y mordisqueada está en el lado seguro de la lista. Si el agua llevaba abono para plantas, pregunta a tu veterinario por el abono.',
    ],
    questions: [
      {
        question: '¿Qué plantas de maceta con flor son tóxicas, entonces?',
        answer:
          'De las de estas páginas: el kalanchoe, el ciclamen, las begonias, los crisantemos y la amarilis están todos en la lista de plantas tóxicas de la ASPCA.',
      },
    ],
    sources: [],
  },
  {
    id: 'boston-ferns',
    slug: 'helecho-de-boston',
    subject: 'el helecho de Boston',
    gender: 'm',
    plural: false,
    name: 'Helecho de Boston',
    names: 'helecho espada, nefrolepis; su nombre botánico es Nephrolepis exaltata',
    answer: 'la ASPCA lo incluye entre las no tóxicas para gatos y perros',
    short: 'seguro',
    summary:
      'El helecho de Boston es no tóxico para gatos y perros en la lista de la ASPCA: una planta colgante segura aunque quede al alcance de tu mascota.',
    parts: 'Ninguna parte tóxica en la ficha de la ASPCA del helecho de Boston.',
    why: [
      'La ASPCA incluye Nephrolepis exalta bostoniensis entre las plantas no tóxicas para perros y gatos. Su ficha no dice nada de los caballos.',
    ],
    signs: [
      'Un gato que juega con las frondas y se come algún trozo puede vomitar o tener el estómago revuelto, como advierte la ASPCA de cualquier planta, sin que se espere un riesgo para su vida.',
    ],
    act: [
      'Un helecho colgado al alcance de un gato es una planta que la ASPCA da como segura. Lo único que hay que recoger son las hojitas caídas en el suelo.',
    ],
    questions: [
      {
        question: '¿Todos los helechos son seguros para los gatos?',
        answer:
          'La ficha de la ASPCA que usa esta página es la del helecho de Boston. Busca cualquier otro helecho por su propia ficha.',
      },
    ],
    sources: [],
  },
  {
    id: 'hibiscus',
    slug: 'hibisco',
    subject: 'el hibisco',
    gender: 'm',
    plural: false,
    name: 'Hibisco',
    names: 'rosa de Siria, hibisco de Siria o altea; su nombre botánico es Hibiscus syriacus',
    answer: 'la rosa de Siria está en la lista de no tóxicas',
    short: 'es seguro',
    summary:
      'La ASPCA incluye el hibisco (Hibiscus syriacus, la rosa de Siria) entre las plantas no tóxicas para gatos, perros y caballos.',
    parts: 'Ninguna parte tóxica en la ficha de la ASPCA del hibisco.',
    why: [
      'La ASPCA incluye Hibiscus syriacus, también llamado rose of Sharon y rose of China en inglés, entre las plantas no tóxicas para perros, gatos y caballos.',
    ],
    signs: [
      'Un perro que se come las flores caídas del hibisco puede vomitar o tener el estómago revuelto, lo que la ASPCA dice de cualquier planta, sin que se espere un peligro para su vida.',
    ],
    act: [
      'Las flores de rosa de Siria caídas sobre el césped están en el lado seguro de la lista. Pregunta a tu veterinario por cualquier producto con que se haya fumigado el arbusto.',
    ],
    disagree: [
      'La ficha nombra Hibiscus syriacus. Las demás especies de hibisco no aparecen en ella; revisa la etiqueta de uno tropical.',
    ],
    questions: [
      {
        question: '¿Un seto de hibisco es seguro para un perro?',
        answer:
          'Un seto de Hibiscus syriacus, la rosa de Siria, está en la lista de plantas no tóxicas de la ASPCA.',
      },
    ],
    sources: [],
  },
];
