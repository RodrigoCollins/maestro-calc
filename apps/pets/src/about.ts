import { checkedText, POLICY_CHECKED, type TextPage } from './editorial.ts';
import { hrefOf } from './routes.ts';

export const ABOUT: TextPage = {
  title: 'About Bowl Figures: Pet Feeding Calculators | Bowl Figures',
  description:
    'Bowl Figures is a free set of pet calculators: calories and cups for dogs and cats, chocolate toxicity, a dog due date, dog and cat age, every formula shown.',
  h1: 'About Bowl Figures',
  lead: 'Bowl Figures answers the questions pet owners type into a search box: how much to feed, how much chocolate is too much, when the puppies are due.',
  sections: [
    {
      id: 'what',
      heading: 'What it is',
      paragraphs: [
        'Free calculators for dogs and cats in US units, with cups and cans worked from the calorie line on your own food’s label. No sign-up, and one small script per calculator.',
      ],
    },
    {
      id: 'how',
      heading: 'How it works',
      paragraphs: [
        'Each result shows its formula. The energy factors are from the Merck Veterinary Manual and the AAHA guidelines; where they differ, the page shows the range. Nothing here replaces your veterinarian.',
      ],
      link: { href: hrefOf('methodology'), label: 'How we work it out' },
    },
    {
      id: 'who',
      heading: 'Who runs it',
      paragraphs: [
        'The Bowl Figures editorial team, under a public policy for sources and corrections.',
      ],
      link: { href: hrefOf('editorial'), label: 'Editorial policy' },
    },
  ],
  reviewed: `Last reviewed ${checkedText(POLICY_CHECKED)}.`,
};
