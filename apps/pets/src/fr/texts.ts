import { checkedText } from '../editorial.ts';

/**
 * Who a French-speaking reader calls when a dog ate something toxic. The ASPCA line of the English
 * pages is an American number: here the call goes to the veterinarian first. In France the CNITV
 * (VetAgro Sup, Lyon) answers owners and veterinarians 7 days a week from 8:30 to midnight; in
 * Switzerland Tox Info Suisse answers about animals at 145. The Belgian Centre Antipoisons answers
 * about animals only within set hours and puts human calls first, so the call line leaves it to
 * the pages that cite it.
 */
export const CALL_FR =
  'Appelez maintenant votre vétérinaire ou un vétérinaire de garde, même si votre chien semble aller bien. En France, le Centre national d’informations toxicologiques vétérinaires (CNITV) répond au 04 78 87 10 40, 7 jours sur 7 de 8 h 30 à minuit ; en Suisse, Tox Info Suisse renseigne aussi sur les animaux au 145. Cette page ne remplace pas votre vétérinaire.';

/**
 * The sentence over the sources: when the English, the French and, when the page cites one, the
 * German-language sources were read.
 */
export const readOnFr = (english: string, french: string, german?: string): string => {
  const days = [
    `les sources en anglais le ${checkedText(english, 'fr')}`,
    `les sources en français le ${checkedText(french, 'fr')}`,
    ...(german === undefined ? [] : [`les sources en allemand le ${checkedText(german, 'fr')}`]),
  ];
  const listed =
    days.length === 2
      ? `${days[0] ?? ''} et ${days[1] ?? ''}`
      : `${days[0] ?? ''}, ${days[1] ?? ''} et ${days[2] ?? ''}`;
  return `La rédaction a lu ${listed}.`;
};

/** The headings the French pages share. */
export const HEADINGS_FR = {
  faq: 'Questions fréquentes',
  sameAnswer: 'D’autres aliments avec la même réponse',
  scrolls: 'défile horizontalement sur un écran étroit',
} as const;
