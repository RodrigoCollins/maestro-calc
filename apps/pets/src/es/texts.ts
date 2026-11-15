import { checkedText } from '../editorial.ts';

/**
 * Who a Spanish-speaking reader calls when a dog ate something toxic. The ASPCA line of the English
 * pages is an American number, and no national poison line of Mexico, Spain or Argentina was
 * confirmed to take calls about animals (`SOURCES_ES`): the call goes to the veterinarian first, or
 * to an emergency veterinary clinic, wherever the reader is.
 */
export const CALL_ES =
  'Llama ya a tu veterinario o a una clínica veterinaria de urgencias, aunque tu perro parezca estar bien. Ten a mano su peso, qué comió, cuánto y a qué hora. Esta página no sustituye a tu veterinario.';

/**
 * The sentence over the sources: when the English, the Spanish and, when the page cites one, the
 * German-language sources were read.
 */
export const readOnEs = (english: string, spanish: string, german?: string): string => {
  const days = [
    `las fuentes en inglés el ${checkedText(english, 'es')}`,
    `las fuentes en español el ${checkedText(spanish, 'es')}`,
    ...(german === undefined ? [] : [`las fuentes en alemán el ${checkedText(german, 'es')}`]),
  ];
  const listed =
    days.length === 2
      ? `${days[0] ?? ''} y ${days[1] ?? ''}`
      : `${days[0] ?? ''}, ${days[1] ?? ''} y ${days[2] ?? ''}`;
  return `El equipo editorial leyó ${listed}.`;
};

/** The headings the Spanish pages share. */
export const HEADINGS_ES = {
  faq: 'Preguntas frecuentes',
  sameAnswer: 'Otros alimentos con la misma respuesta',
  scrolls: 'se desplaza horizontalmente en una pantalla estrecha',
} as const;
