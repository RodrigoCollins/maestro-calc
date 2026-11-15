import { SOURCES_ES } from '../foods/sources.ts';
import type { PlantEs } from './types.ts';

/** The Spanish words of the houseplants (`src/plants/houseplants.ts`), in the same order. */
export const HOUSEPLANTS_ES: readonly PlantEs[] = [
  {
    id: 'pothos',
    slug: 'potus',
    subject: 'el potus',
    gender: 'm',
    plural: false,
    name: 'Potus (pothos)',
    names:
      'poto (España), pothos o potus (México), potus (Argentina, Chile y Colombia); su nombre botánico es Epipremnum aureum',
    answer: 'sus cristales de oxalato queman la boca',
    short: 'quema la boca',
    summary:
      'El potus figura como tóxico para perros y gatos en la lista de la ASPCA: al masticar una hoja se liberan cristales que queman la boca.',
    parts:
      'Las hojas y los tallos, lo que un perro o un gato mordisquea de una planta colgante. Las fichas de la ASPCA no señalan ninguna parte como más segura que otra.',
    why: [
      'La ASPCA tiene tres fichas para este grupo (potus dorado, devil’s ivy y potus satinado) y en las tres da como principio tóxico los oxalatos de calcio insolubles. Pet Poison Helpline explica que son cristales microscópicos dentro de la planta, que se liberan cuando la mascota la mastica e irritan y lastiman los labios, la boca y la garganta.',
      'La planta que se vende como potus satinado (Scindapsus pictus) es de otro género que el potus dorado (Epipremnum aureum), pero su ficha de la ASPCA da los mismos cristales y los mismos signos.',
      'El Manual de veterinaria de MSD, en su edición en español, cuenta el poto entre las aráceas con cristales de oxalato de calcio, junto a la difenbaquia y la monstera.',
    ],
    signs: [
      'La ASPCA enumera irritación oral, ardor e irritación intensos de la boca, la lengua y los labios, babeo excesivo, vómitos y dificultad para tragar. Aparecen con el primer mordisco, porque los cristales actúan donde tocan.',
      'Pet Poison Helpline dice que el babeo, las arcadas y los vómitos son frecuentes y que, en casos raros, la garganta se hincha tanto que cuesta respirar.',
    ],
    act: [
      'Retira las hojas y busca trozos dentro de la boca. Una mascota que se pasa la pata por la cara y babea después de mordisquear el potus muestra el ardor que describe la ASPCA.',
      'Llama a tu veterinario si sigue babeando, no puede tragar o respira con ruido: la rara hinchazón de garganta de la que avisa Pet Poison Helpline es la razón para no esperar a que pase.',
    ],
    questions: [
      {
        question: '¿La «hiedra del diablo» es la misma planta que el potus?',
        answer:
          'Sí. La ASPCA archiva el potus dorado y el devil’s ivy («hiedra del diablo» en inglés) con el mismo nombre científico, Epipremnum aureum, y da los dos como tóxicos para perros y gatos; la ficha del devil’s ivy añade los caballos.',
      },
      {
        question: '¿Hay una planta colgante segura en su lugar?',
        answer:
          'La planta del dinero (Plectranthus australis), que en inglés se llama Swedish ivy o creeping Charlie, figura en la lista de la ASPCA como no tóxica para perros, gatos y caballos, y cuelga como el potus.',
      },
    ],
    sources: [SOURCES_ES.msdPlants],
  },
  {
    id: 'snake-plants',
    slug: 'sansevieria',
    subject: 'la sansevieria',
    gender: 'f',
    plural: false,
    name: 'Sansevieria (lengua de suegra)',
    names:
      'lengua de suegra (México, España, Argentina y Chile), espada de San Jorge (Colombia); su nombre botánico es Sansevieria trifasciata',
    word: 'Poco',
    answer: 'causa náuseas, vómitos y diarrea',
    short: 'da náuseas',
    summary:
      'La ASPCA incluye la sansevieria, o lengua de suegra, entre las plantas tóxicas para perros y gatos, y solo nombra signos de malestar de estómago.',
    parts:
      'Las hojas largas, lo único que una mascota alcanza. La ficha de la ASPCA no dice que una parte sea peor que otra.',
    why: [
      'El principio tóxico que da la ASPCA para Sansevieria trifasciata son las saponinas, compuestos parecidos al jabón que irritan el estómago y el intestino. La ficha no nombra cristales ni daños en el corazón, los riñones o el hígado.',
      'La ASPCA la archiva también con los nombres golden bird’s nest, mother-in-law’s tongue (lengua de suegra) y good luck plant, así que una maceta con cualquiera de esas etiquetas es la misma planta.',
    ],
    signs: [
      'La ASPCA nombra solo tres signos: náuseas, vómitos y diarrea. En una mascota, las náuseas se notan como babeo, lamerse los labios y rechazar la comida.',
    ],
    act: [
      'Aleja la maceta y fíjate cuánta hoja falta. Como la ficha de la ASPCA solo nombra malestar de estómago, lo que importa a tu veterinario es cuánto comió tu mascota y qué tamaño tiene.',
      'Llama a tu veterinario si los vómitos o la diarrea de la sansevieria siguen, o si ves sangre en ellos.',
    ],
    questions: [
      {
        question: '¿La lengua de suegra es lo mismo que la sansevieria?',
        answer:
          'Sí. La ASPCA da mother-in-law’s tongue (lengua de suegra), golden bird’s nest y good luck plant como otros nombres de la sansevieria, Sansevieria trifasciata.',
      },
      {
        question: '¿Qué planta erguida es segura en su lugar?',
        answer:
          'La aspidistra (Aspidistra elatior) y la pata de elefante (Beaucarnea recurvata) figuran en la lista de la ASPCA como no tóxicas para perros, gatos y caballos, y las dos aguantan poca luz, como la sansevieria.',
      },
    ],
    sources: [],
  },
  {
    id: 'monstera',
    slug: 'monstera',
    subject: 'la monstera',
    gender: 'f',
    plural: false,
    name: 'Monstera (costilla de Adán)',
    names:
      'costilla de Adán (México, España, Argentina, Colombia y Chile), cerimán, y a veces se vende como filodendro de hoja partida; su nombre botánico es Monstera deliciosa',
    answer: 'la ASPCA la da como tóxica para perros y gatos',
    short: 'quema la boca',
    summary:
      'La monstera o costilla de Adán es tóxica para perros y gatos según la ASPCA: sus hojas tienen cristales de oxalato que queman la boca.',
    parts:
      'Las grandes hojas recortadas y los tallos. La ficha de la ASPCA no separa las partes, y el fruto que da nombre a Monstera deliciosa no aparece en ella.',
    why: [
      'La ASPCA archiva Monstera deliciosa como swiss cheese plant, con los otros nombres cutleaf philodendron, hurricane plant, ceriman y Mexican breadfruit, y da los oxalatos de calcio insolubles como su principio tóxico.',
      'La monstera se vende a menudo como «filodendro de hoja partida». La ASPCA tiene una ficha aparte para el split leaf philodendron (Philodendron bipennifolium), con el mismo veredicto y los mismos cristales, así que cualquiera de las dos etiquetas pide la misma precaución.',
      'El Manual de veterinaria de MSD, en su edición en español, nombra la monstera entre las aráceas con cristales de oxalato de calcio y describe un dolor intenso inmediato, con ardor e inflamación de la boca y la garganta.',
    ],
    signs: [
      'La ficha de la monstera enumera irritación de la boca, ardor intenso de la boca, la lengua y los labios, babeo excesivo, vómitos y dificultad para tragar.',
    ],
    act: [
      'Limpia la savia y los trozos de hoja de la boca y la cara, y ofrécele agua si quiere beber.',
      'Llama a tu veterinario si el babeo no se calma, si tu mascota no quiere comer o si su respiración suena áspera.',
    ],
    questions: [
      {
        question: '¿La Monstera adansonii también es tóxica?',
        answer:
          'Las fichas de la ASPCA solo nombran Monstera deliciosa. Pregunta a tu veterinario por una Monstera adansonii y mantenla fuera del alcance de tu mascota hasta saberlo.',
      },
      {
        question: '¿Qué planta de hojas grandes es segura en su lugar?',
        answer:
          'La palma areca (Dypsis lutescens) y la calathea figuran en la lista de la ASPCA como no tóxicas para perros, gatos y caballos.',
      },
    ],
    sources: [SOURCES_ES.msdPlants],
  },
  {
    id: 'aloe-vera',
    slug: 'aloe-vera',
    subject: 'el aloe vera',
    gender: 'm',
    plural: false,
    name: 'Aloe vera (sábila)',
    names:
      'sábila (México, Colombia y Venezuela), áloe (España), aloe (Argentina y Chile); su nombre botánico es Aloe vera',
    answer: 'la planta lo es, aunque la ASPCA considera comestible el gel',
    short: 'no el gel',
    summary:
      'La ASPCA da el aloe vera como tóxico para perros y gatos por sus saponinas y antraquinonas, y añade que su gel se considera comestible.',
    parts:
      'La piel verde de la hoja y el jugo amarillo que hay debajo, que llevan los purgantes. El gel transparente del interior es la parte que, según la ASPCA, se considera comestible.',
    why: [
      'La ASPCA da las saponinas y las antraquinonas como principios tóxicos del aloe. Pet Poison Helpline llama purgantes a los glucósidos de antraquinona: hacen que el intestino se mueva y causan los vómitos y la diarrea.',
      'Por eso un gel para quemaduras, hecho con el interior de la hoja, no es la misma pregunta que una mascota que mastica la hoja entera de la planta.',
      'El Manual de veterinaria de MSD, en su edición en español, sitúa esos glucósidos de antraquinona (la barbaloína y la emodina) en el látex de la hoja, y nombra como efectos la diarrea intensa o la hipoglucemia.',
    ],
    signs: [
      'La ASPCA enumera vómitos, letargo y diarrea en perros y gatos, y anota que los caballos no vomitan. Pet Poison Helpline describe malestar de estómago e intestino con vómitos y diarrea.',
    ],
    act: [
      'Busca puntas de hoja mordidas y jugo amarillo en la cara o las patas, y calcula cuánta hoja de aloe falta.',
      'Llama a tu veterinario si tu mascota está decaída, vomita más de una vez o tiene diarrea: un animal pequeño pierde agua deprisa.',
    ],
    disagree: [
      'La ASPCA da la planta como tóxica y, en la misma ficha, dice que el gel se considera comestible. Pet Poison Helpline nombra los purgantes sin separar el gel de la hoja, así que la lectura prudente es esta: mantén la planta lejos y pregunta antes de darle algo que lleve aloe.',
    ],
    questions: [
      {
        question: '¿El gel de aloe vera es seguro para la piel de mi perro?',
        answer:
          'La ASPCA dice que el gel se considera comestible; los principios tóxicos están en la planta. Pregunta a tu veterinario antes de ponerle cualquier producto en la piel, porque tu mascota lo lamerá.',
      },
      {
        question: '¿Qué suculenta es segura en su lugar?',
        answer:
          'La haworthia, que se parece mucho a un aloe pequeño, figura en la lista de la ASPCA como no tóxica para perros y gatos.',
      },
    ],
    sources: [SOURCES_ES.msdPlants],
  },
  {
    id: 'peace-lilies',
    slug: 'espatifilo',
    subject: 'el espatifilo',
    gender: 'm',
    plural: false,
    name: 'Espatifilo (cuna de Moisés)',
    names:
      'cuna de Moisés (México, Argentina, Chile y Colombia), espatifilo o lirio de la paz (España); su nombre botánico es Spathiphyllum',
    answer: 'quema la boca, pero no es un lirio verdadero',
    short: 'no es un lirio',
    summary:
      'El espatifilo es tóxico para perros y gatos según la ASPCA por sus cristales de oxalato, pero no es un lirio de los que dañan el riñón del gato.',
    parts:
      'Las hojas, los tallos y la espata blanca de la flor tienen los cristales. El polen de la flor no es el peligro que sí es en un lirio verdadero.',
    why: [
      'La ASPCA da los oxalatos de calcio insolubles como principio tóxico de Spathiphyllum, que considera tóxico para perros y gatos. Pet Poison Helpline cuenta el espatifilo entre las plantas cuyos cristales irritan los labios, la boca y la garganta al masticarlas.',
      'La FDA y ASPCApro separan el espatifilo de los lirios verdaderos: irrita la boca y no causa el daño en los riñones que causan Lilium y Hemerocallis.',
    ],
    signs: [
      'La ASPCA enumera irritación oral, un ardor intenso en la boca, la lengua y los labios, babeo excesivo, vómitos y dificultad para tragar, signos que empiezan con el primer mordisco al espatifilo.',
    ],
    act: [
      'Asegúrate de qué planta es: el espatifilo tiene hojas anchas y oscuras y una capucha blanca alrededor de una espiga. Si pudiera ser un lirio de Pascua, atigrado, asiático o de día, trátalo como una urgencia para un gato y llama enseguida a tu veterinario.',
      'Si es un espatifilo, enjuaga la zona de la boca, ofrécele agua y llama a tu veterinario si el babeo, las arcadas o la dificultad para tragar continúan.',
    ],
    disagree: [
      'El nombre confunde en los dos sentidos. Hay quien se asusta por un espatifilo, que las fuentes describen como irritante, y no ve el peligro de un ramo de lirios asiáticos, que puede matar a un gato.',
    ],
    questions: [
      {
        question: '¿Un espatifilo puede causar insuficiencia renal en los gatos?',
        answer:
          'La FDA y ASPCApro dicen que no: la insuficiencia renal la causan los lirios verdaderos (Lilium) y los lirios de día (Hemerocallis). El espatifilo irrita la boca.',
      },
      {
        question: '¿El espatifilo Mauna Loa es la misma planta?',
        answer: 'Sí. La ASPCA da Mauna Loa peace lily como otro nombre de su ficha del espatifilo.',
      },
    ],
    sources: [],
  },
  {
    id: 'jade-plants',
    slug: 'arbol-de-jade',
    subject: 'el árbol de jade',
    gender: 'm',
    plural: false,
    name: 'Árbol de jade',
    names: 'planta de jade, jade o crásula; su nombre botánico es Crassula argentea',
    answer: 'la ASPCA nombra vómitos y falta de coordinación',
    short: 'da vómitos',
    summary:
      'La ASPCA da el árbol de jade como tóxico para perros, gatos y caballos; no conoce su principio tóxico y nombra vómitos, decaimiento y torpeza.',
    parts:
      'Las hojas gruesas y los tallos. Como la ASPCA no sabe qué compuesto es el culpable, no señala ninguna parte más segura.',
    why: [
      'Para Crassula argentea, la ASPCA da el principio tóxico como desconocido. El veredicto sale de lo que su centro de toxicología ve en las mascotas que la comieron, no de un veneno conocido.',
      'La ASPCA la archiva con los otros nombres baby jade, dwarf rubber plant, jade tree, Chinese rubber plant y Japanese rubber plant, fáciles de confundir con la peperomia (Peperomia obtusifolia), que es segura y en inglés se llama American rubber plant.',
    ],
    signs: [
      'La ASPCA enumera vómitos, depresión y falta de coordinación. La falta de coordinación se ve como un andar tambaleante; la depresión, como una mascota apagada que no quiere jugar.',
    ],
    act: [
      'Un andar tambaleante después de mordisquear una suculenta es motivo para llamar ya a tu veterinario, no para esperar a que pase.',
      'Lleva la maceta o una foto del árbol de jade: varias suculentas se venden con nombres que se parecen.',
    ],
    questions: [
      {
        question: '¿La «baby rubber plant» es lo mismo que el árbol de jade?',
        answer:
          'No. La ASPCA da baby rubber plant como otro nombre de la peperomia (Peperomia obtusifolia), que considera no tóxica; en cambio, archiva baby jade bajo el árbol de jade, que es tóxico.',
      },
    ],
    sources: [],
  },
  {
    id: 'philodendrons',
    slug: 'filodendro',
    subject: 'el filodendro',
    gender: 'm',
    plural: false,
    name: 'Filodendro',
    names:
      'filodendro trepador o de hoja acorazonada, y filodendro de hoja partida; su nombre botánico es Philodendron hederaceum',
    answer: 'sus cristales irritan la boca',
    short: 'irrita la boca',
    summary:
      'La ASPCA da como tóxicos para perros y gatos el filodendro de hoja acorazonada y el de hoja partida, por los cristales de oxalato de sus hojas.',
    parts:
      'Las hojas en forma de corazón o recortadas y las guías. Un filodendro trepador en una maceta colgante es el que alcanzan los gatos.',
    why: [
      'La ASPCA da los oxalatos de calcio insolubles tanto para Philodendron hederaceum (de hoja acorazonada, también cordatum o sweetheart plant) como para Philodendron bipennifolium (de hoja partida, también horsehead philodendron y fiddle-leaf). La ficha del de hoja acorazonada añade los caballos.',
      'Pet Poison Helpline cuenta el filodendro entre las plantas cuyos cristales lastiman los labios, la boca y la garganta cuando una mascota las mastica. El Manual de veterinaria de MSD, en su edición en español, lo pone en el mismo grupo de aráceas con cristales de oxalato de calcio que la difenbaquia.',
    ],
    signs: [
      'La ficha del filodendro de hoja acorazonada enumera irritación oral, dolor e hinchazón de la boca, la lengua y los labios, babeo excesivo, vómitos (no en caballos) y dificultad para tragar; la del de hoja partida da lo mismo, con ardor intenso.',
    ],
    act: [
      'Retira la guía, revisa la boca y ofrécele agua. Que se hinchen los labios y la lengua es lo esperado; que le cueste respirar no lo es, y exige llamar ya a tu veterinario.',
    ],
    questions: [
      {
        question: '¿El filodendro «fiddle-leaf» es lo mismo que el ficus lira?',
        answer:
          'No. La ASPCA da fiddle-leaf como otro nombre del filodendro de hoja partida. El ficus lira (Ficus lyrata), que en inglés se llama fiddle-leaf fig, es otra planta, y la lista de la ASPCA no lo nombra.',
      },
    ],
    sources: [SOURCES_ES.msdPlants],
  },
  {
    id: 'dieffenbachia',
    slug: 'difenbaquia',
    subject: 'la difenbaquia',
    gender: 'f',
    plural: false,
    name: 'Difenbaquia (galatea)',
    names:
      'galatea (Argentina), lotería (Colombia y Venezuela), caña muda o dieffenbachia (España); su nombre botánico es Dieffenbachia',
    answer: 'quema la boca y la lengua',
    short: 'quema la boca',
    summary:
      'La difenbaquia, o caña muda, es tóxica para perros y gatos según la ASPCA, por sus cristales de oxalato y una enzima que digiere proteínas.',
    parts:
      'El tallo grueso (la caña) y las hojas. La ficha de la ASPCA no dice que una parte sea peor que la otra.',
    why: [
      'La ASPCA da dos principios tóxicos: los oxalatos de calcio insolubles y una enzima proteolítica, es decir, que descompone las proteínas. Es la única planta del grupo de los oxalatos cuya ficha añade esa enzima.',
      'Pet Poison Helpline incluye la difenbaquia y la caña muda (dumbcane) entre las plantas cuyos cristales se liberan al masticarlas. El Manual de veterinaria de MSD, en su edición en español, la pone a la cabeza de las aráceas con cristales de oxalato de calcio.',
    ],
    signs: [
      'La ficha de la difenbaquia enumera irritación oral, ardor e irritación intensos de la boca, la lengua y los labios, babeo excesivo, vómitos y dificultad para tragar. El Manual de MSD describe un dolor intenso inmediato, con ardor e inflamación de la boca y la garganta.',
    ],
    act: [
      'Retira la caña, enjuaga la zona de la boca y vigila la lengua y la garganta. El Manual de MSD añade que los lácteos con calcio ayudan a limpiar la boca. Llama a tu veterinario si la hinchazón crece o a tu mascota le cuesta tragar o respirar.',
    ],
    questions: [
      {
        question: '¿La caña muda es la misma planta que la difenbaquia?',
        answer:
          'Sí. La ASPCA da dumbcane, giant dumb cane, spotted dumb cane, tropic snow y exotica entre los otros nombres de su ficha de la difenbaquia.',
      },
    ],
    sources: [SOURCES_ES.msdPlants],
  },
  {
    id: 'dracaena',
    slug: 'dracena',
    subject: 'la dracena',
    gender: 'f',
    plural: false,
    name: 'Dracena (palo de Brasil)',
    names:
      'palo de Brasil o tronco de Brasil (México, España y Argentina), palo de agua (Colombia), drago o árbol del dragón; su nombre botánico es Dracaena',
    answer: 'sus saponinas causan vómitos, y pupilas dilatadas en los gatos',
    short: 'da vómitos',
    summary:
      'La dracena, o palo de Brasil, es tóxica para perros y gatos según la ASPCA: sus saponinas causan vómitos y, en los gatos, pupilas dilatadas.',
    parts: 'Las hojas en forma de cinta. La ASPCA no nombra ninguna parte peor de la dracena.',
    why: [
      'La ASPCA da las saponinas como principio tóxico de Dracaena spp., del palo de Brasil (Dracaena fragrans, corn plant en inglés) y de la ribbon plant. La ficha del palo de Brasil incluye también los caballos.',
    ],
    signs: [
      'La ASPCA enumera vómitos (a veces con sangre), depresión, anorexia, hipersalivación y, en los gatos, pupilas dilatadas. Aquí anorexia quiere decir que no come; hipersalivación, que babea.',
      'Las pupilas dilatadas se nombran solo para los gatos, así que un gato con las pupilas muy abiertas después de mordisquear una hoja de dracena encaja con la ficha.',
    ],
    act: [
      'Llama a tu veterinario si el vómito tiene sangre o si las pupilas de tu gato siguen muy abiertas. Mira el nombre en la etiqueta de la maceta: las dracenas se venden con muchos nombres.',
    ],
    disagree: [
      'La ASPCA da «ribbon plant» como otro nombre tanto de una dracena (tóxica) como de la cinta o malamadre (no tóxica), así que una etiqueta que solo diga ribbon plant no resuelve la duda.',
    ],
    questions: [
      {
        question: '¿El palo de Brasil es lo mismo que la dracena?',
        answer:
          'Sí: el palo de Brasil es Dracaena fragrans, y la ASPCA lo da como tóxico para perros, gatos y caballos.',
      },
    ],
    sources: [],
  },
  {
    id: 'english-ivy',
    slug: 'hiedra',
    subject: 'la hiedra',
    gender: 'f',
    plural: false,
    name: 'Hiedra',
    names: 'hiedra común, yedra o hiedra inglesa; su nombre botánico es Hedera helix',
    answer: 'las hojas son más tóxicas que las bayas',
    short: 'más en las hojas',
    summary:
      'La ASPCA incluye la hiedra común entre las plantas tóxicas para gatos, perros y caballos, y su ficha dice que las hojas son más tóxicas que las bayas.',
    parts:
      'Primero las hojas: la ficha de la ASPCA dice que el follaje es más tóxico que las bayas. Las dos están en la planta, dentro de casa y en los muros de fuera.',
    why: [
      'La ASPCA da como principio tóxico de Hedera helix las saponinas triterpénicas (hederagenina). Las saponinas irritan el intestino, y eso son los signos que recoge la ficha.',
      'La ASPCA archiva en la misma ficha las hiedras branching, glacier, needlepoint, sweetheart y California: son variedades de la misma planta.',
    ],
    signs: ['La ASPCA enumera vómitos, dolor abdominal, hipersalivación y diarrea.'],
    act: [
      'Retira las hojas de hiedra, dentro de casa o a lo largo de una cerca, y anota cuánto comió. Llama a tu veterinario si los vómitos o el dolor continúan.',
    ],
    questions: [
      {
        question: '¿La «Swedish ivy» es tóxica como la hiedra?',
        answer:
          'No. La Swedish ivy (Plectranthus australis), que en español se vende como planta del dinero, no es una hiedra; la ASPCA la da como no tóxica para perros, gatos y caballos.',
      },
    ],
    sources: [],
  },
  {
    id: 'kalanchoe',
    slug: 'kalanchoe',
    subject: 'el kalanchoe',
    gender: 'm',
    plural: false,
    name: 'Kalanchoe',
    names:
      'calanchoe o escarlata (España), madre de miles o aranto (para Kalanchoe daigremontiana); su nombre botánico es Kalanchoe',
    answer: 'casi siempre malestar de estómago; rara vez, el corazón',
    short: 'da vómitos',
    summary:
      'El kalanchoe es tóxico para perros y gatos según la ASPCA: tiene toxinas cardiacas, aunque lo habitual es el malestar de estómago.',
    parts:
      'Toda la planta. Pet Poison Helpline no nombra ninguna parte peor; el peligro crece con la cantidad que se come.',
    grade: 'Pet Poison Helpline la califica de leve a moderada.',
    why: [
      'La ASPCA da los bufodienólidos como principio tóxico; Pet Poison Helpline los llama toxinas cardiacas (bufadienólidos), la misma familia de compuestos que actúa sobre el corazón. El Manual de veterinaria de MSD, en su edición en español, cuenta las campanas de catedral (Kalanchoe) entre las plantas con glucósidos cardiacos.',
      'Pet Poison Helpline dice que comerlo suele causar irritación o malestar de estómago, y que las cantidades grandes pueden afectar al corazón.',
    ],
    signs: [
      'La ASPCA enumera vómitos, diarrea y ritmo cardiaco anormal (raro). Pet Poison Helpline añade debilidad y colapso tras una cantidad grande.',
    ],
    act: [
      'Calcula cuánto kalanchoe falta: una hoja mordisqueada y una planta pelada son llamadas distintas. La debilidad o el colapso significan ir ya a tu veterinario o a una clínica veterinaria de urgencias.',
    ],
    questions: [
      {
        question: '¿La madre de miles es un kalanchoe?',
        answer:
          'Sí: la ASPCA da mother of millions (madre de miles), mother-in-law plant, devil’s backbone y chandelier plant como otros nombres de su ficha del kalanchoe.',
      },
    ],
    sources: [SOURCES_ES.msdPlants],
  },
  {
    id: 'begonias',
    slug: 'begonias',
    subject: 'las begonias',
    gender: 'f',
    plural: true,
    name: 'Begonias',
    names:
      'begonia de flor, begonia rex o begonia tuberosa, según la variedad; su nombre botánico es Begonia',
    answer: 'la parte bajo tierra es la más tóxica',
    short: 'peor la raíz',
    summary:
      'La ASPCA da las begonias como tóxicas para gatos, perros y caballos; la parte más tóxica está bajo tierra, algo que importa con un perro que escarba.',
    parts:
      'Los tubérculos y las raíces: la ficha de la ASPCA dice que la parte más tóxica está bajo tierra. Las hojas y las flores preocupan menos.',
    why: [
      'La ASPCA da como principio tóxico los oxalatos de calcio solubles, mientras que las fichas del potus y del filodendro dan los insolubles. La ficha de la begonia nombra la insuficiencia renal en los animales de pastoreo, algo que las fichas de oxalatos insolubles no nombran.',
      'La ficha abarca más de mil especies y diez mil híbridos de Begonia.',
    ],
    signs: [
      'En perros y gatos, la ASPCA nombra vómitos y salivación; la insuficiencia renal la nombra para los animales de pastoreo, que comen mucho más.',
    ],
    act: [
      'Mira si el tubérculo fue desenterrado o mordido: es la parte que la ASPCA llama más tóxica. Llama a tu veterinario y dile qué parte de la begonia comió y cuánto.',
    ],
    questions: [
      {
        question: '¿Las begonias pueden causar insuficiencia renal en un perro?',
        answer:
          'La ASPCA nombra la insuficiencia renal en los animales de pastoreo, y vómitos y salivación en perros y gatos.',
      },
    ],
    sources: [],
  },
  {
    id: 'cyclamen',
    slug: 'ciclamen',
    subject: 'el ciclamen',
    gender: 'm',
    plural: false,
    name: 'Ciclamen (violeta persa)',
    names:
      'violeta persa o violeta de los Alpes, ciclamino, pan de puerco; su nombre botánico es Cyclamen',
    answer: 'sus tubérculos pueden afectar al corazón',
    short: 'peor el tubérculo',
    summary:
      'La ASPCA da el ciclamen como tóxico para gatos, perros y caballos; comer mucho tubérculo puede alterar el ritmo del corazón y causar convulsiones.',
    parts:
      'El tubérculo, la raíz redonda de la base: la ASPCA reserva sus signos graves para cuando se comen muchos tubérculos. Las hojas y las flores causan los más leves.',
    why: [
      'La ASPCA da las saponinas terpenoides como principio tóxico de Cyclamen spp., que también llama sowbread («pan de puerco»).',
    ],
    signs: [
      'La ASPCA enumera salivación, vómitos y diarrea y, cuando se comen muchos tubérculos, alteraciones del ritmo cardiaco, convulsiones y muerte.',
    ],
    act: [
      'Si la maceta está volcada y el tubérculo mordido, llama ya a tu veterinario. Si solo mordisqueó una flor, llama igualmente y descríbela: tu veterinario te dirá si basta con vigilarlo en casa.',
    ],
    questions: [
      {
        question: '¿El ciclamen es una planta de invierno segura para un gato?',
        answer:
          'No. La ASPCA lo da como tóxico para los gatos; el cactus de Navidad y la violeta africana figuran en su lista de no tóxicas.',
      },
    ],
    sources: [],
  },
];
