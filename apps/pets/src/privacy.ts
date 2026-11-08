import { checkedText, POLICY_CHECKED, type TextPage } from './editorial.ts';

export const PRIVACY: TextPage = {
  title: 'Privacy: What Bowl Figures Collects | Bowl Figures',
  description:
    'Bowl Figures has no accounts and sets no cookies of its own. Once analytics is on, it counts visits and calculator use, never the values you enter.',
  h1: 'Privacy',
  lead: 'Short version: no accounts, no cookies of ours, and the numbers you type stay in your browser and in the link you share.',
  sections: [
    {
      id: 'values',
      heading: 'What you enter',
      paragraphs: [
        'Your pet’s weight, food and dates are worked out in your browser. They are never sent to us. They sit in the address of the page only so you can bookmark or share the result.',
      ],
    },
    {
      id: 'analytics',
      heading: 'Analytics',
      paragraphs: [
        'Once the site has a Google Analytics 4 measurement id, it loads Google’s tag after the page and counts visits and one event per calculator use (which calculator, and whether you calculated or shared), never the values entered. Until then no analytics runs.',
        'Consent Mode defaults apply: ad storage is denied, and analytics storage is denied in the EEA, the United Kingdom and Switzerland, and when your browser sends a Global Privacy Control signal.',
      ],
    },
    {
      id: 'sharing',
      heading: 'Sharing',
      paragraphs: [
        'The WhatsApp link is plain text and an address that opens WhatsApp’s own chooser. We load no WhatsApp script.',
      ],
    },
  ],
  reviewed: `Last reviewed ${checkedText(POLICY_CHECKED)}.`,
};
