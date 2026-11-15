import { SOURCES_ES } from '../foods/sources.ts';
import type { PlantEs } from './types.ts';

/** The Spanish words of the garden plants and herbs (`src/plants/garden.ts`), in the same order. */
export const GARDEN_ES: readonly PlantEs[] = [
  {
    id: 'sago-palms',
    slug: 'palma-sago',
    subject: 'la palma sago',
    gender: 'f',
    plural: false,
    name: 'Palma sago (cica)',
    names:
      'cica (España, Argentina y Chile), palma de sagú (México), sagú reina o palma bola; su nombre botánico es Cycas revoluta',
    answer: 'sus semillas pueden causar una insuficiencia hepática mortal',
    short: 'la semilla mata',
    summary:
      'Tóxica para perros, gatos y caballos según la ASPCA, la palma sago es de las peores para un perro: la cicasina de sus semillas destruye el hígado.',
    parts:
      'Toda la planta, y la semilla (o nuez) más que nada, según Pet Poison Helpline. El Merck Veterinary Manual sitúa la cicasina en las semillas, las raíces y las hojas, y el Manual de veterinaria de MSD, en su edición en español, coincide en que las semillas son la parte más tóxica.',
    why: [
      'La ASPCA da la cicasina como principio tóxico de Cycas revoluta y de las zamias, que en inglés también se llaman coontie o cardboard palm. La palma sago es una cícada, no una palmera verdadera.',
      'El Merck Veterinary Manual explica que las bacterias del intestino convierten la cicasina en metilazoximetanol, el metabolito tóxico, que daña el hígado. El Manual de MSD añade que los perros son extremadamente sensibles a las cícadas y que muchas de las muertes se deben a la necrosis del hígado.',
    ],
    signs: [
      'La ASPCA enumera vómitos, melena (heces negras), ictericia (encías y ojos amarillos), más sed, gastroenteritis hemorrágica, moretones, coagulopatía (la sangre coagula mal), daño hepático, insuficiencia hepática y muerte.',
      'Según el Merck Veterinary Manual, los perros atendidos en las primeras 24 horas casi siempre vomitan, y después muestran diarrea, poco apetito, decaimiento, babeo, más sed, signos neurológicos (andar tambaleante, desorientación, apoyar la cabeza contra la pared, rara vez convulsiones), sangrado en el intestino y temblores.',
      'El Manual de MSD sitúa los primeros signos en las 4 horas siguientes a comerla, y la insuficiencia hepática entre 48 y 72 horas después.',
    ],
    act: [
      'Trata cualquier mordisco a una palma sago, y sobre todo a una semilla, como una urgencia: llama ya a tu veterinario o ve a una clínica veterinaria de urgencias, aunque tu perro parezca estar bien.',
      'El Merck Veterinary Manual cita estudios en los que sobrevivió entre la mitad y unos dos tercios de los perros con una intoxicación confirmada. El Manual de MSD da un pronóstico de regular a bueno con una intervención rápida y cuidados intensivos, y de reservado a malo si se retrasa. Por eso se aconseja arrancar la planta del jardín que usa un perro.',
    ],
    questions: [
      {
        question: '¿La palma sago es una palmera de verdad?',
        answer:
          'No: es una cícada. La ASPCA la agrupa con las zamias y otras cícadas, todas tóxicas.',
      },
      {
        question: '¿Qué palmera es segura para los perros?',
        answer:
          'La palma areca, la palmera de salón y la pata de elefante (nolina) figuran en la lista de la ASPCA como no tóxicas para perros y gatos.',
      },
    ],
    sources: [SOURCES_ES.msdPlants],
  },
  {
    id: 'oleander',
    slug: 'adelfa',
    subject: 'la adelfa',
    gender: 'f',
    plural: false,
    name: 'Adelfa (laurel rosa)',
    names:
      'laurel rosa (México, Argentina, Chile y buena parte de Sudamérica), rosa laurel (México) y baladre (algunas zonas de España); su nombre botánico es Nerium oleander',
    answer: 'su toxina cardiaca recorre toda la planta',
    short: 'ataca el corazón',
    summary:
      'La adelfa es tóxica para perros, gatos y caballos según la ASPCA: la oleandrina, un glucósido cardiaco presente en toda la planta, puede ser mortal.',
    parts:
      'Todo el arbusto: Pet Poison Helpline dice que la oleandrina está en toda la planta, en las hojas, las flores y los tallos por igual.',
    why: [
      'La ASPCA da los glucósidos cardiacos como principio tóxico de Nerium oleander, que también llama rose-bay. Pet Poison Helpline identifica el glucósido como oleandrina.',
      'El Manual de veterinaria de MSD, en su edición en español, la cuenta entre las más tóxicas de las plantas con glucósidos cardiacos.',
    ],
    signs: [
      'La ASPCA enumera babeo, dolor abdominal, diarrea, cólico, decaimiento y muerte.',
      'Pet Poison Helpline agrupa los signos en tres: el estómago (vómitos, falta de apetito), el corazón (frecuencia y ritmo irregulares) y los nervios (debilidad, colapso). El Manual de MSD añade la bradicardia o la taquicardia, las arritmias y la hiperpotasemia, el potasio alto en la sangre.',
    ],
    act: [
      'Llama ya y lleva a tu mascota al veterinario: una toxina cardiaca no se vigila en casa. Lleva una ramita del arbusto para que la identifiquen. El Manual de MSD advierte que ha habido muertes incluso con tratamiento intensivo.',
      'Los restos de poda son una fuente escondida: rastríllalos en lugar de dejarlos donde juega un perro.',
    ],
    questions: [
      {
        question: '¿Las hojas secas de adelfa pueden seguir envenenando a un perro?',
        answer:
          'Las fuentes de esta página no dicen que la toxina desaparezca al secarse la hoja, así que trata los restos de poda como tratas el arbusto.',
      },
    ],
    sources: [SOURCES_ES.msdPlants],
  },
  {
    id: 'foxglove',
    slug: 'dedalera',
    subject: 'la dedalera',
    gender: 'f',
    plural: false,
    name: 'Dedalera',
    names:
      'digital o digitalis, en casi todos los países; su nombre botánico es Digitalis purpurea',
    answer: 'sus glucósidos cardiacos pueden parar el corazón',
    short: 'daña el corazón',
    summary:
      'La dedalera es tóxica para perros, gatos y caballos según la ASPCA: sus glucósidos cardiacos pueden causar arritmias, fallo cardiaco y muerte.',
    parts:
      'Toda la planta: Pet Poison Helpline dice que la planta entera es tóxica, y el Manual de veterinaria de MSD, en su edición en español, sitúa los glucósidos cardiacos en todas sus partes.',
    why: [
      'La ASPCA da los glucósidos cardiacos como principio tóxico de Digitalis purpurea. Pet Poison Helpline explica que actúan directamente sobre el corazón.',
    ],
    signs: [
      'La ASPCA enumera arritmias cardiacas, vómitos, diarrea, debilidad, insuficiencia cardiaca y muerte.',
      'El Manual de MSD describe dolor abdominal agudo, vómitos, diarrea con sangre, orinar con frecuencia y un pulso lento e irregular.',
    ],
    act: [
      'Llama ya y ve al veterinario aunque tu mascota parezca estar bien: con una toxina que actúa sobre el corazón no se espera en casa. Lleva una vara con flores de la dedalera.',
    ],
    questions: [
      {
        question: '¿La dedalera es tóxica para los perros además de para los gatos?',
        answer:
          'Sí: la ASPCA incluye Digitalis purpurea entre las plantas tóxicas para perros, gatos y caballos, y Pet Poison Helpline dice que comerla puede ser mortal para un perro.',
      },
    ],
    sources: [SOURCES_ES.msdPlants],
  },
  {
    id: 'lily-of-the-valley',
    slug: 'lirio-de-los-valles',
    subject: 'el lirio de los valles',
    gender: 'm',
    plural: false,
    name: 'Lirio de los valles',
    names:
      'muguete (Argentina y Chile), muguet o convalaria (España); su nombre botánico es Convallaria majalis',
    answer: 'es una toxina cardiaca, no un lirio verdadero',
    short: 'el corazón',
    summary:
      'El lirio de los valles es tóxico para perros, gatos y caballos según la ASPCA: sus cardenólidos atacan el corazón, no los riñones como los lirios.',
    parts:
      'Toda la planta: Pet Poison Helpline nombra los cardenólidos sin señalar una parte concreta.',
    why: [
      'La ASPCA da los cardenólidos (la convalarina y otros) como principio tóxico de Convallaria majalis. Pet Poison Helpline los llama toxinas cardiacas, y el Manual de veterinaria de MSD, en su edición en español, los cuenta entre los glucósidos cardiacos.',
      'La FDA y ASPCApro lo separan de los lirios verdaderos: actúa sobre el ritmo del corazón, no sobre los riñones.',
    ],
    signs: [
      'La ASPCA enumera vómitos, latido irregular, presión arterial baja, desorientación, coma y convulsiones.',
      'Pet Poison Helpline dice que perros y gatos suelen vomitar y perder el apetito, y que pueden seguir cambios en la frecuencia y el ritmo del corazón, debilidad y convulsiones. El Manual de MSD añade temblores, dolor abdominal y diarrea, y alteraciones del corazón que avanzan hasta el latido irregular o el bloqueo auriculoventricular.',
    ],
    act: [
      'Llama ya. A diferencia de los lirios verdaderos, también daña a los perros, así que cuenta igual el perro que escarbó en el macizo de sombra.',
    ],
    questions: [
      {
        question: '¿El lirio de los valles es un lirio verdadero?',
        answer:
          'No. La FDA dice que altera el ritmo del corazón, a diferencia del daño renal de los lirios verdaderos, y la ASPCA lo incluye también entre las tóxicas para los perros.',
      },
    ],
    sources: [SOURCES_ES.msdPlants],
  },
  {
    id: 'azaleas',
    slug: 'azaleas',
    subject: 'las azaleas',
    gender: 'f',
    plural: true,
    name: 'Azaleas',
    names:
      'rododendro, el nombre del mismo género en todos los países; su nombre botánico es Rhododendron',
    answer: 'afectan al estómago y al corazón',
    short: 'el corazón',
    summary:
      'Azaleas y rododendros son tóxicos para perros, gatos y caballos según la ASPCA; su grayanotoxina puede causar debilidad e insuficiencia cardiaca.',
    parts: 'Todas las partes de la planta, según Pet Poison Helpline.',
    why: [
      'La ASPCA da la grayanotoxina (que su ficha escribe grayantoxin) como principio tóxico de Rhododendron spp., ficha que también nombra rosebay y rododendro. El Manual de veterinaria de MSD, en su edición en español, nombra las mismas grayanotoxinas.',
    ],
    signs: [
      'La ASPCA enumera vómitos (no en los caballos), diarrea, debilidad e insuficiencia cardiaca. Pet Poison Helpline describe malestar de estómago y alteraciones cardiovasculares.',
      'El Manual de MSD sitúa los signos a las pocas horas, entre 1 y 4: salivación, lagrimeo, vómitos, diarrea, dificultad para respirar, debilidad muscular, y hasta convulsiones, coma y muerte.',
    ],
    act: [
      'Si tu mascota está débil después de mordisquear una azalea, ve ya al veterinario. Lleva un esqueje para que en la clínica sepan que es un rododendro.',
    ],
    questions: [
      {
        question: '¿Los rododendros son lo mismo que las azaleas?',
        answer:
          'Para la ASPCA, sí: su ficha de la azalea es Rhododendron spp., con rododendro como otro nombre.',
      },
    ],
    sources: [SOURCES_ES.msdPlants],
  },
  {
    id: 'hydrangeas',
    slug: 'hortensias',
    subject: 'las hortensias',
    gender: 'f',
    plural: true,
    name: 'Hortensias',
    names:
      'hidrangea, como se venden a veces en los viveros; su nombre botánico es Hydrangea arborescens',
    answer: 'sobre todo un malestar de estómago, rara vez cianuro',
    short: 'el estómago',
    summary:
      'Las hortensias son tóxicas para perros, gatos y caballos según la ASPCA; tienen un glucósido cianogénico, pero lo habitual es un malestar de estómago.',
    parts: 'Las hojas, los brotes y las flores. La ficha de la ASPCA no los distingue.',
    why: [
      'La ASPCA da un glucósido cianogénico como principio tóxico de Hydrangea arborescens, que también llama hortensia, hills of snow y seven bark.',
    ],
    signs: [
      'La ASPCA enumera vómitos, decaimiento y diarrea, y dice que la intoxicación por cianuro es rara: la planta suele causar sobre todo un trastorno digestivo.',
    ],
    act: [
      'Llama a tu veterinario y cuéntale cuánto comió; como lo habitual son los signos de estómago, te dirá si basta con vigilarlo en casa.',
    ],
    questions: [
      {
        question: '¿Una hortensia puede intoxicar a un perro con cianuro?',
        answer:
          'La ficha de la ASPCA dice que la intoxicación por cianuro es rara; la planta suele afectar al estómago.',
      },
    ],
    sources: [],
  },
  {
    id: 'geraniums',
    slug: 'geranios',
    subject: 'los geranios',
    gender: 'm',
    plural: true,
    name: 'Geranios (malvones)',
    names:
      'malvón (Argentina y Uruguay), geranio (México, España, Colombia y Chile); su nombre botánico es Pelargonium',
    answer: 'sus aceites irritan el estómago y la piel',
    short: 'estómago, piel',
    summary:
      'Los geranios (Pelargonium) son tóxicos para perros, gatos y caballos según la ASPCA, por el geraniol y el linalol de sus hojas aromáticas.',
    parts: 'Las hojas aromáticas y las flores. La ficha de la ASPCA no las distingue.',
    why: [
      'La ASPCA da el geraniol y el linalol como principios tóxicos de las especies de Pelargonium, los muchos cultivares que se venden como geranios.',
    ],
    signs: ['La ASPCA enumera vómitos, falta de apetito, decaimiento y dermatitis.'],
    act: [
      'Lávale la cara y las patas, vigila si le sale un sarpullido y llama a tu veterinario si deja de comer o sigue vomitando.',
    ],
    questions: [
      {
        question: '¿Los geranios aromáticos también son tóxicos?',
        answer:
          'La ficha de la ASPCA abarca las especies de Pelargonium y sus muchos cultivares, también los aromáticos.',
      },
    ],
    sources: [],
  },
  {
    id: 'lavender',
    slug: 'lavanda',
    subject: 'la lavanda',
    gender: 'f',
    plural: false,
    name: 'Lavanda',
    names:
      'espliego (España) y alhucema (algunas zonas de España y de América); su nombre botánico es Lavandula angustifolia',
    word: 'Poco',
    answer: 'provoca náuseas y vómitos',
    short: 'náuseas, vómitos',
    summary:
      'La lavanda es tóxica para perros, gatos y caballos según la ASPCA por el linalol y el acetato de linalilo; nombra náuseas, vómitos y falta de apetito.',
    parts: 'Las flores y las hojas, que guardan el aceite. La ASPCA no las distingue.',
    why: [
      'La ASPCA da el linalol y el acetato de linalilo (que su ficha escribe linlool) como principios tóxicos de la lavanda común o inglesa.',
    ],
    signs: ['La ASPCA enumera náuseas, vómitos (no en los caballos) y falta de apetito.'],
    act: [
      'Una ramita arrancada de un borde suele quedarse en esos signos de estómago. Llama a tu veterinario si no se pasan.',
      'El aceite de lavanda no es la planta: pregunta a tu veterinario antes de usar cualquier aceite esencial cerca de una mascota.',
    ],
    questions: [
      {
        question: '¿Es tóxica la lavanda seca de un saquito?',
        answer:
          'La ficha de la ASPCA trata la planta y no dice que secarla la cambie. Guarda los saquitos fuera de su alcance.',
      },
    ],
    sources: [],
  },
  {
    id: 'mint',
    slug: 'menta',
    subject: 'la menta',
    gender: 'f',
    plural: false,
    name: 'Menta',
    names:
      'hierbabuena o yerbabuena (México, Colombia y buena parte de Latinoamérica para varias mentas del huerto); su nombre botánico es Mentha',
    answer: 'en grandes cantidades, por sus aceites',
    short: 'si come mucha',
    summary:
      'La menta del huerto es tóxica para perros, gatos y caballos según la ASPCA, que nombra vómitos y diarrea cuando se come en grandes cantidades.',
    parts: 'Las hojas y los tallos, que guardan los aceites.',
    why: ['La ASPCA da los aceites esenciales como principio tóxico de las especies de Mentha.'],
    signs: ['La ASPCA enumera vómitos y diarrea cuando se come mucha.'],
    act: [
      'Una o dos hojas no son la gran cantidad que describe la ficha; una maceta pelada, sí. Llama a tu veterinario si tu mascota sigue vomitando.',
    ],
    questions: [
      {
        question: '¿La hierba gatera es una menta?',
        answer:
          'La hierba gatera tiene su propia ficha en la ASPCA, Nepeta cataria, como tóxica para los gatos; la ficha de la menta es Mentha.',
      },
    ],
    sources: [],
  },
  {
    id: 'eucalyptus',
    slug: 'eucalipto',
    subject: 'el eucalipto',
    gender: 'm',
    plural: false,
    name: 'Eucalipto',
    names:
      'ninguno distinto según el país, aunque el nombre abarca muchas especies; su nombre botánico es Eucalyptus',
    answer: 'su aceite causa babeo y vómitos',
    short: 'babeo y vómitos',
    summary:
      'El eucalipto es tóxico para perros, gatos y caballos según la ASPCA: el eucaliptol, su aceite esencial, causa salivación, vómitos y debilidad.',
    parts: 'Las hojas, que guardan el aceite, tanto en un ramo seco como en una planta viva.',
    why: ['La ASPCA da como principio tóxico sus aceites esenciales, el eucaliptol.'],
    signs: ['La ASPCA enumera salivación, vómitos, diarrea, decaimiento y debilidad.'],
    act: [
      'Saca el ramo de la ducha o del florero, y llama a tu veterinario si tu mascota está débil o sigue vomitando.',
    ],
    questions: [
      {
        question: '¿Es peligroso para un gato un ramo de eucalipto colgado en la ducha?',
        answer:
          'La ASPCA incluye el eucalipto entre las tóxicas para los gatos, así que cuelga el ramo donde tu gato no pueda mordisquearlo.',
      },
    ],
    sources: [],
  },
  {
    id: 'catnip',
    slug: 'hierba-gatera',
    subject: 'la hierba gatera',
    gender: 'f',
    plural: false,
    name: 'Hierba gatera',
    names:
      'nébeda (España), menta de gato o menta gatuna, y catnip, como se vende en México, Argentina y Chile; su nombre botánico es Nepeta cataria',
    answer: 'puede causar vómitos y diarrea',
    short: 'vómitos y diarrea',
    summary:
      'La ASPCA incluye la hierba gatera entre las tóxicas para gatos: muchos la adoran, pero puede causar vómitos y diarrea. Su ficha no habla de perros.',
    parts:
      'Las hojas y las flores, frescas o secas. La ficha de la ASPCA no señala una parte peor.',
    why: [
      'La ASPCA da la nepetalactona como principio tóxico de Nepeta cataria, que también llama catswort y catmint. Dice que a algunos gatos los adormece y a otros los excita.',
    ],
    signs: [
      'La ASPCA dice que puede causar vómitos y diarrea, y que deja a unos gatos sedados y a otros estimulados.',
    ],
    act: [
      'Retira el resto de la hierba gatera y deja que tu gato se calme. Llama a tu veterinario si los vómitos o la diarrea siguen.',
    ],
    disagree: [
      'El veredicto sorprende porque la hierba gatera se vende para gatos. La ficha de la ASPCA la incluye entre las tóxicas por sus efectos en el estómago y, en la misma línea, dice que muchos gatos la adoran. No da ninguna cantidad, así que fíjate en cómo reacciona tu propio gato.',
      'La ficha no menciona a los perros, así que esta página no puede dar un veredicto para ellos.',
    ],
    questions: [
      {
        question: '¿Cuánta hierba gatera es demasiada?',
        answer:
          'La ficha de la ASPCA no da ninguna cantidad. Si tu gato vomita o tiene diarrea después de la hierba gatera, dale menos y pregunta a tu veterinario.',
      },
    ],
    sources: [],
  },
  {
    id: 'tomato-plants',
    slug: 'tomatera',
    subject: 'la planta de tomate',
    gender: 'f',
    plural: false,
    name: 'Planta de tomate (tomatera)',
    names:
      'tomatera (España), mata de tomate (Colombia y Venezuela), planta de jitomate (México); su nombre botánico es Lycopersicon',
    answer: 'la planta verde lo es, el fruto maduro no',
    short: 'el fruto maduro no',
    summary:
      'La planta de tomate es tóxica para perros, gatos y caballos según la ASPCA por su solanina; la misma ficha dice que el fruto maduro no es tóxico.',
    parts:
      'Las hojas, los tallos y los tomates verdes. La ficha de la ASPCA dice que el fruto maduro no es tóxico.',
    why: ['La ASPCA da la solanina como principio tóxico de Lycopersicon spp.'],
    signs: [
      'La ASPCA enumera salivación excesiva, falta de apetito, un trastorno digestivo intenso, decaimiento, debilidad, pupilas dilatadas y frecuencia cardiaca lenta.',
    ],
    act: [
      'Cerca el huerto. Si tu mascota mordisqueó la planta o tomates verdes, llama a tu veterinario; un tomate maduro es la parte no tóxica de la ficha.',
    ],
    questions: [
      {
        question: '¿Los perros pueden comer tomates maduros?',
        answer:
          'La ficha de la ASPCA dice que el fruto maduro no es tóxico. La página sobre si los perros pueden comer tomate trata las cantidades.',
      },
    ],
    sources: [],
  },
];
