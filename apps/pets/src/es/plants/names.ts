/**
 * The Spanish name of every ASPCA entry the plant pages cite, with the article a sentence gives it:
 * the name most used from Mexico to Spain and Argentina, and a second one in parentheses where the
 * countries differ. The ASPCA entry itself (its English title, its scientific name, what it lists
 * for each species) is read from `src/plants/aspca.ts`, never written here.
 */
export interface EntryNameEs {
  /** Lower case, as a sentence names it: `potus (pothos)`, `lirio de Pascua`. */
  readonly name: string;
  readonly article: 'el' | 'la' | 'los' | 'las';
}

const m = (name: string): EntryNameEs => ({ name, article: 'el' });
const f = (name: string): EntryNameEs => ({ name, article: 'la' });

/** Each ASPCA entry by its slug. */
export const ENTRY_NAMES_ES: Readonly<Record<string, EntryNameEs>> = {
  'african-violet': f('violeta africana'),
  aloe: m('aloe vera (sábila)'),
  amaryllis: f('amarilis'),
  'american-rubber-plant': f('peperomia (planta de goma americana)'),
  'areca-palm': f('palma areca'),
  azalea: f('azalea'),
  'babys-breath': f('gypsophila (nube, velo de novia)'),
  bamboo: m('bambú dorado'),
  'bamboo-palm': f('palmera bambú (camedor)'),
  basil: f('albahaca'),
  begonia: f('begonia'),
  'boston-fern': m('helecho de Boston (helecho espada)'),
  calathea: f('calathea'),
  'calla-lily': m('alcatraz (cala)'),
  carnation: m('clavel'),
  'cast-iron-plant': f('aspidistra (pilistra)'),
  catnip: f('hierba gatera (nébeda)'),
  'christmas-cactus': m('cactus de Navidad'),
  chrysanthemum: m('crisantemo'),
  'corn-plant': m('palo de Brasil (tronco de Brasil)'),
  cyclamen: m('ciclamen (violeta persa)'),
  daffodil: m('narciso'),
  daisy: f('margarita'),
  'day-lilies-many-varieties': m('lirio de día (hemerocallis)'),
  'devils-ivy': m('potus (pothos)'),
  dieffenbachia: f('difenbaquia (galatea)'),
  dracaena: f('dracena'),
  'easter-lily': m('lirio de Pascua (azucena)'),
  'english-ivy': f('hiedra común'),
  eucalyptus: m('eucalipto'),
  foxglove: f('dedalera (digital)'),
  geranium: m('geranio (malvón)'),
  'gerber-daisy': f('gerbera'),
  'gloriosa-lily': f('gloriosa (lirio llama)'),
  'golden-pothos': m('potus dorado'),
  haworthia: f('haworthia'),
  'heartleaf-philodendron': m('filodendro de hoja acorazonada'),
  'heavenly-bamboo': m('bambú sagrado (nandina)'),
  hibiscus: m('hibisco de Siria (rosa de Siria)'),
  holly: m('acebo americano'),
  hyacinth: m('jacinto'),
  hydrangea: f('hortensia'),
  'indian-rubber-plant': m('ficus benjamina'),
  'jade-plant': m('árbol de jade'),
  'japanese-show-lily': m('lirio japonés'),
  kalanchoe: m('kalanchoe'),
  lavender: f('lavanda'),
  lily: m('lirio (azucena)'),
  'lily-palace': m('hippeastrum (amarilis)'),
  'lily-valley': m('lirio de los valles (muguete)'),
  marijuana: f('marihuana'),
  mint: f('menta'),
  'mistletoe-american': m('muérdago americano'),
  'money-tree': f('pachira (árbol del dinero)'),
  oleander: f('adelfa (laurel rosa)'),
  'parlor-palm': f('palmera de salón'),
  'peace-lily': m('espatifilo (cuna de Moisés)'),
  peony: f('peonía'),
  'peruvian-lily': f('alstroemeria (lirio del Perú)'),
  'phalaenopsis-orchid': f('orquídea phalaenopsis'),
  poinsettia: f('flor de Nochebuena (flor de Pascua)'),
  'pony-tail': f('pata de elefante (nolina)'),
  'prayer-plant': f('calathea lancifolia'),
  'ribbon-plant': f('dracena sanderiana (bambú de la suerte)'),
  rose: f('rosa'),
  rosemary: m('romero'),
  'rubrum-lily': m('lirio rubrum'),
  'sago-palm': f('palma sago (cica)'),
  'satin-pothos': m('potus satinado (scindapsus)'),
  'snake-plant': f('sansevieria (lengua de suegra)'),
  'spider-plant': f('cinta (malamadre)'),
  'split-leaf-philodendron': m('filodendro de hoja partida'),
  'stargazer-lily': m('lirio stargazer'),
  sunflower: m('girasol'),
  'swedish-ivy': f('planta del dinero (plectranthus)'),
  'swiss-cheese-plant': f('monstera (costilla de Adán)'),
  thyme: m('tomillo'),
  'tiger-lily': m('lirio tigre'),
  'tomato-plant': f('tomatera (planta de tomate)'),
  tulip: m('tulipán'),
  'weeping-fig': m('ficus'),
};

/** The Spanish name of entry `slug`, or an error naming the entry with no name. */
export const entryNameEsOf = (slug: string): EntryNameEs => {
  const found = ENTRY_NAMES_ES[slug];
  if (found === undefined) throw new Error(`no Spanish name for the ASPCA entry ${slug}`);
  return found;
};
