/*
 * The construction glossary (PLAN §5.2): one Spanish term per concept, used across the catalogs
 * and the Markdown copy, and the variants the site avoids. Concepts that look alike but differ
 * (roof pitch and slope, drywall level of finish and paint sheen) are separate entries. An avoided
 * variant is a word with no other meaning on the site; the contract test rejects it in every
 * Spanish message and entry, whole word, any case, singular or plural.
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
}

export const GLOSSARY: readonly GlossaryEntry[] = [
  // Concrete
  { en: 'concrete', es: 'concreto', avoid: ['hormigón'] },
  { en: 'pour', es: 'colado', avoid: ['vaciado'], note: 'The placed concrete and the job.' },
  { en: 'ready-mix concrete', es: 'concreto premezclado', avoid: [] },
  { en: 'ready-mix plant', es: 'planta', avoid: [] },
  { en: 'short load', es: 'carga chica', avoid: [] },
  { en: 'concrete mixer', es: 'revolvedora', avoid: ['mezcladora'] },
  { en: 'slab', es: 'losa', avoid: [] },
  { en: 'footing', es: 'zapata', avoid: [] },
  { en: 'column', es: 'columna', avoid: [] },
  { en: 'step', es: 'escalón', avoid: [] },
  { en: 'formwork', es: 'cimbra', avoid: ['encofrado', 'formaleta'] },
  { en: 'rebar', es: 'varilla', avoid: ['cabilla'] },
  { en: 'wire mesh', es: 'malla electrosoldada', avoid: [] },
  { en: 'bag', es: 'bolsa', avoid: ['saco de', 'sacos de'], note: '"Saco" is also a verb.' },
  // Landscaping
  { en: 'gravel', es: 'grava', avoid: [] },
  { en: 'base', es: 'base', avoid: [], note: 'The gravel under a slab or a path.' },
  { en: 'mulch', es: 'mulch', avoid: ['mantillo', 'acolchado'] },
  { en: 'topsoil', es: 'tierra para jardín', avoid: [] },
  // Drywall
  { en: 'drywall', es: 'drywall', avoid: ['tablaroca', 'tabla roca', 'panel de yeso'] },
  { en: 'drywall sheet', es: 'placa', avoid: ['lámina'] },
  {
    en: 'joint compound',
    es: 'compuesto para juntas',
    avoid: ['pasta para juntas', 'mezcla para juntas'],
  },
  { en: 'joint tape', es: 'cinta para juntas', avoid: [] },
  {
    en: 'pail',
    es: 'cubeta',
    avoid: ['balde'],
    note: 'The word of the stores most of our readers buy in (a "cubeta" of joint compound).',
  },
  { en: 'corner bead', es: 'esquinero', avoid: ['cantonera'] },
  { en: 'screw', es: 'tornillo', avoid: [] },
  {
    en: 'level of finish',
    es: 'nivel de terminación',
    avoid: [],
    note: 'Drywall (GA-214); a paint finish is an "acabado".',
  },
  // Roofing
  { en: 'roof', es: 'techo', avoid: ['tejado'] },
  {
    en: 'ceiling',
    es: 'techo',
    avoid: [],
    note: 'Same word as the roof; "cielorraso" only where "techo" would read as the roof.',
  },
  { en: 'asphalt shingle', es: 'teja asfáltica', avoid: [] },
  { en: 'bundle', es: 'paquete', avoid: ['bulto'] },
  { en: 'roofing square', es: 'square', avoid: [], note: '100 square feet of roof.' },
  { en: 'underlayment', es: 'fieltro', avoid: [] },
  { en: 'roof pitch', es: 'pendiente', avoid: [], note: 'Written as rise in 12.' },
  { en: 'slope', es: 'inclinación', avoid: [], note: 'Rise ÷ run, a plain ratio.' },
  { en: 'rise', es: 'subida', avoid: [] },
  { en: 'run', es: 'recorrido', avoid: [] },
  { en: 'rafter', es: 'cabio', avoid: ['vigueta'] },
  { en: 'overhang', es: 'alero', avoid: [] },
  { en: 'ridge', es: 'cumbrera', avoid: ['caballete'] },
  // Paint
  { en: 'coat', es: 'mano', avoid: ['capa de pintura', 'capa de primer'] },
  { en: 'gallon can', es: 'lata de un galón', avoid: [] },
  { en: 'primer', es: 'primer', avoid: ['imprimador', 'imprimante'] },
  { en: 'caulk', es: 'sellador', avoid: ['calafateo'] },
  { en: 'spackle', es: 'masilla', avoid: [] },
  { en: 'trim', es: 'moldura', avoid: [] },
  { en: 'sheen', es: 'acabado', avoid: [] },
  // Measuring and the job
  { en: 'tape measure', es: 'cinta métrica', avoid: ['flexómetro'] },
  { en: 'room', es: 'cuarto', avoid: ['habitación', 'recámara'] },
  { en: 'bedroom', es: 'dormitorio', avoid: [] },
  { en: 'cubic yard', es: 'yarda cúbica', avoid: [] },
  { en: 'square foot', es: 'pie cuadrado', avoid: [] },
  { en: 'inch', es: 'pulgada', avoid: [] },
  { en: 'scaffolding', es: 'andamio', avoid: [] },
  { en: 'quote', es: 'cotización', avoid: ['presupuesto'] },
  { en: 'estimate', es: 'estimación', avoid: [] },
  // The business
  { en: 'contractor', es: 'contratista', avoid: [] },
  { en: 'license', es: 'licencia', avoid: [] },
  { en: 'bond', es: 'fianza', avoid: ['bono'], note: '"Bono" is a false friend.' },
  { en: 'building permit', es: 'permiso de construcción', avoid: [] },
  { en: 'foreman', es: 'capataz', avoid: [] },
  { en: 'journeyman', es: 'oficial', avoid: [] },
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
