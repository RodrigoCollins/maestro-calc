import { checkedText, POLICY_CHECKED, type TextPage } from './editorial.ts';

export const PRIVACY: TextPage = {
  title: 'Privacy: What Bowl Figures Collects | Bowl Figures',
  description:
    'What Bowl Figures does with information: hosting logs, Google Analytics without the values you type, and calculators that run in your browser.',
  h1: 'Privacy',
  lead: 'Short version: no accounts, no advertising, and the numbers you type stay in your browser and in the link you share.',
  sections: [
    {
      id: 'values',
      heading: 'What you enter',
      paragraphs: [
        'Nothing you type, such as your pet’s weight, food or dates, is sent to us or to Google Analytics. It is worked out in your browser, and the values are never sent to us on their own: they sit in the address of the page only so you can bookmark or share the result. Opening or sharing that address sends it like any page request, so it can appear in Cloudflare request logs. It also stays in your browser history.',
      ],
    },
    {
      id: 'hosting',
      heading: 'Hosting',
      paragraphs: [
        'Bowl Figures is hosted on Cloudflare. When you load a page, Cloudflare processes standard request logs, which can include your IP address, the page you asked for and your browser type.',
      ],
    },
    {
      id: 'analytics',
      heading: 'Analytics and cookies',
      paragraphs: [
        'Bowl Figures uses Google Analytics to count visits and one event per calculator use (which calculator, and whether you calculated or shared). It starts after the page has loaded. The site has no advertising and no accounts.',
        'Google Analytics receives the page you visit without the values you typed, your browser and device type, your screen size and an approximate location that Google derives from your IP address. Outside the European Economic Area, the United Kingdom and Switzerland, it can set first-party cookies, such as _ga, to tell one visit from another.',
        'In the European Economic Area, the United Kingdom and Switzerland, Google Analytics sets no cookie: it only receives a signal that a page was viewed. The same applies anywhere when your browser sends a Global Privacy Control signal. Advertising storage and ad personalization are off everywhere.',
      ],
    },
    {
      id: 'sharing',
      heading: 'Sharing',
      paragraphs: [
        'The WhatsApp link is plain text and an address that opens WhatsApp’s own chooser. We load no WhatsApp script.',
      ],
    },
    {
      id: 'changes',
      heading: 'Changes',
      paragraphs: ['We will update this page before we add advertising.'],
    },
  ],
  reviewed: `Last reviewed ${checkedText(POLICY_CHECKED)}.`,
};
