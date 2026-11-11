import { checkedText } from '../editorial.ts';

/**
 * Who a German reader calls when a dog ate something toxic. The ASPCA line of the English pages is
 * an American number: here the call goes to the veterinarian first (BfR, Mitteilung 012/2026), and
 * in Switzerland Tox Info Suisse answers about animals at 145. The German poison centres
 * (Giftnotruf) are for people and advise on animals only as capacity allows (BfR), so the page does
 * not send a reader to them.
 */
export const CALL_DE =
  'Rufen Sie jetzt Ihre Tierarztpraxis oder den tierärztlichen Notdienst an, auch wenn Ihr Hund noch unauffällig wirkt. In der Schweiz gibt Tox Info Suisse unter der Nummer 145 auch Auskunft zu Vergiftungen bei Tieren. Diese Seite ersetzt keine Tierärztin und keinen Tierarzt.';

/** The Swiss poison line, as the call above names it. */
export const TOX_INFO_SUISSE = { phone: '145', href: 'tel:145' } as const;

/** The sentence over the sources: when the English and the German sources were read. */
export const readOnDe = (english: string, german: string): string =>
  english === german
    ? `Die Redaktion hat jede Quelle unten am ${checkedText(english, 'de')} gelesen.`
    : `Die Redaktion hat die englischsprachigen Quellen unten am ${checkedText(english, 'de')} gelesen, die deutschsprachigen am ${checkedText(german, 'de')}.`;

/** The headings the German pages share. */
export const HEADINGS_DE = {
  faq: 'Häufige Fragen',
  sameAnswer: 'Weitere Lebensmittel mit derselben Antwort',
  scrolls: 'lässt sich auf schmalen Bildschirmen seitlich scrollen',
} as const;
