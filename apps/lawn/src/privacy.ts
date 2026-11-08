/** The address readers write to, on the site's own domain (to be forwarded to the team's inbox). */
export const CONTACT_EMAIL = 'hello@lawnfigures.com';

/** What Lawn Figures does with information (the privacy page, as Pool Figures' `/privacy`). */
export const PRIVACY = {
  title: 'Privacy | Lawn Figures',
  description:
    'What Lawn Figures does with information: hosting logs, Google Analytics without the values you type, and calculators that run in your browser.',
  h1: 'Privacy',
  lead: 'This page describes what Lawn Figures does with information. It covers only what the site does now.',
  sections: [
    {
      id: 'hosting',
      heading: 'Hosting',
      paragraphs: [
        'Lawn Figures is hosted on Cloudflare. When you load a page, Cloudflare processes standard request logs, which can include your IP address, the page you asked for and your browser type.',
      ],
    },
    {
      id: 'analytics',
      heading: 'Analytics and cookies',
      paragraphs: [
        'Lawn Figures uses Google Analytics to count visits and see which pages people use. It starts after the page has loaded. The site has no advertising and no accounts.',
        'Google Analytics receives the page you visit without the values you typed, your browser and device type, your screen size and an approximate location that Google derives from your IP address. Outside the European Economic Area, the United Kingdom and Switzerland, it can set first-party cookies, such as _ga, to tell one visit from another.',
        'In the European Economic Area, the United Kingdom and Switzerland, Google Analytics sets no cookie: it only receives a signal that a page was viewed. The same applies anywhere when your browser sends a Global Privacy Control signal. Advertising storage and ad personalization are off everywhere.',
        "You can also block cookies in your browser or install Google's opt-out add-on for Google Analytics.",
      ],
    },
    {
      id: 'calculators',
      heading: 'Calculators and ZIP lookups',
      paragraphs: [
        'Calculators run in your browser. Nothing you type, such as the size of your lawn or the numbers on your bag, is sent to us or to Google Analytics. The values you enter sit in the page address, so you can copy the link and share it. Opening or sharing that address sends it like any page request, so it can appear in Cloudflare request logs. The address with your values also stays in your browser history, like any page you visit.',
        'The ZIP lookup on the frost date pages also runs in your browser: it downloads a static file of ZIP codes that start with your first digit, and looks yours up there. The ZIP you type is never sent to us.',
      ],
    },
    {
      id: 'email',
      heading: 'Email',
      paragraphs: [
        `If you write to ${CONTACT_EMAIL}, we use your message and your address only to reply to you. The same team runs Lawn Figures, Pool Figures, Cuenta Horas and Maestro Calc.`,
      ],
    },
    {
      id: 'changes',
      heading: 'Changes',
      paragraphs: ['We will update this page before we add advertising.'],
    },
  ],
  reviewed: 'Last updated November 7, 2026.',
} as const;
