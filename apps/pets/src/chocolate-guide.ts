import { encode, Rational } from '@maestro-calc/core';
import { dogChocolate } from '@maestro-calc/pets-core/dog-chocolate';
import { POISON_LINE } from './calc/chocolate.ts';
import { amountText } from './format.ts';
import type { Guide, PageSource } from './guides.ts';
import { hrefOf } from './routes.ts';

const MERCK_CHOCOLATE: PageSource = {
  name: 'Merck Veterinary Manual, Chocolate Toxicosis in Animals (full review September 2024, updated February 2026)',
  url: 'https://www.merckvetmanual.com/toxicology/food-hazards/chocolate-toxicosis-in-animals',
};
const ASPCA_LINE: PageSource = { name: POISON_LINE.name, url: POISON_LINE.source };
const ASPCA_FOODS: PageSource = {
  name: 'ASPCA, People Foods to Avoid Feeding Your Pets',
  url: 'https://www.aspca.org/pet-care/animal-poison-control/people-foods-avoid-feeding-your-pets',
};

/** A common case: what the dog ate, as the calculator's inputs (the amount is an example, not a product). */
interface CaseInput {
  readonly id: 'cookie' | 'dark' | 'milk' | 'baking';
  readonly label: string;
  readonly type: string;
  readonly amount: string;
  readonly amountUnit: 'oz' | 'g';
}

const CASE_INPUTS: readonly CaseInput[] = [
  {
    id: 'cookie',
    label: 'A chocolate chip cookie with 15 g of semisweet chips',
    type: 'dark',
    amount: '15',
    amountUnit: 'g',
  },
  {
    id: 'dark',
    label: 'A small piece of dark chocolate, 1 oz',
    type: 'dark',
    amount: '1',
    amountUnit: 'oz',
  },
  {
    id: 'milk',
    label: 'A 1.5 oz milk chocolate bar',
    type: 'milk',
    amount: '1.5',
    amountUnit: 'oz',
  },
  {
    id: 'baking',
    label: 'A 1 oz square of unsweetened baking chocolate',
    type: 'baking',
    amount: '1',
    amountUnit: 'oz',
  },
];

/** The dog weights every case is worked at, in pounds. */
const POUNDS = [10, 20, 50] as const;

/** The weight the guide's calculator links open at. */
const LINK_POUNDS = 20;

/** What Merck lists at each band, with the call that every result carries. */
const BAND_CELLS = [
  'Below 20 mg/kg, where Merck lists the first signs. Not an all clear: call.',
  'Mild signs possible (20 mg/kg and up). Call now.',
  'Heart effects possible (40 mg/kg and up). Call now: this needs a veterinarian.',
  'Seizures possible (60 mg/kg and up). An emergency: call now.',
] as const;

const rawOf = (input: CaseInput, pounds: number): Record<string, string> => ({
  weight: String(pounds),
  weightUnit: 'lb',
  type: input.type,
  amount: input.amount,
  amountUnit: input.amountUnit,
});

const outputOf = (raw: Readonly<Record<string, string>>, key: string): Rational => {
  const ran = dogChocolate.run(raw);
  if (!ran.ok) throw new Error('a chocolate case did not run');
  const value = ran.value.outputs.find((output) => output.key === key)?.value;
  if (!(value instanceof Rational)) throw new Error(`no output ${key}`);
  return value;
};

const inputOf = (id: CaseInput['id']): CaseInput => {
  const input = CASE_INPUTS.find((candidate) => candidate.id === id);
  if (input === undefined) throw new Error(`no chocolate case ${id}`);
  return input;
};

/** The calculator's address with case `id` at `pounds` filled in, as the calculator encodes it. */
export const chocolateCaseHref = (id: CaseInput['id'], pounds: number): string => {
  const validated = dogChocolate.validate(rawOf(inputOf(id), pounds));
  if (!validated.ok) throw new Error(`the chocolate case ${id} does not validate`);
  return `${hrefOf('chocolate')}?${encode(dogChocolate, validated.value)}`;
};

/** A case worked by the engine: its milligrams, and the dose and band at each weight. */
export interface ChocolateCase {
  readonly id: CaseInput['id'];
  readonly label: string;
  readonly totalMg: string;
  readonly rows: readonly {
    readonly pounds: number;
    readonly dose: string;
    readonly band: number;
  }[];
  readonly link: { readonly href: string; readonly label: string };
}

export const CHOCOLATE_CASES: readonly ChocolateCase[] = CASE_INPUTS.map((input) => ({
  id: input.id,
  label: input.label,
  totalMg: amountText(outputOf(rawOf(input, LINK_POUNDS), 'totalMg'), 0),
  rows: POUNDS.map((pounds) => ({
    pounds,
    dose: amountText(outputOf(rawOf(input, pounds), 'dose'), 1),
    band: Number(outputOf(rawOf(input, pounds), 'band').num),
  })),
  link: {
    href: chocolateCaseHref(input.id, LINK_POUNDS),
    label: `${input.label}, ${String(LINK_POUNDS)} lb dog`,
  },
}));

const caseOf = (id: CaseInput['id']): ChocolateCase => {
  const found = CHOCOLATE_CASES.find((candidate) => candidate.id === id);
  if (found === undefined) throw new Error(`no chocolate case ${id}`);
  return found;
};
const doseOf = (id: CaseInput['id'], pounds: number): string =>
  caseOf(id).rows.find((row) => row.pounds === pounds)?.dose ?? '';

export const CHOCOLATE_GUIDE: Guide = {
  path: '/my-dog-ate-chocolate',
  title: 'My Dog Ate Chocolate: What to Do Now | Bowl Figures',
  description:
    'Your dog ate chocolate? Call your vet or the ASPCA poison line now. Merck’s dose bands, worked cases for cookies and bars, the signs and when they start.',
  h1: 'My dog ate chocolate: what to do now',
  lead: `Call your veterinarian or the ${POISON_LINE.name} at ${POISON_LINE.phone} now, even if your dog is acting fine. Then use this page to understand the dose they will ask about.`,
  checked: '2026-11-08',
  callNow: true,
  sections: [
    {
      id: 'now',
      heading: 'What to do in the next few minutes',
      paragraphs: [
        `Call first, then read. The ${POISON_LINE.name} answers at ${POISON_LINE.phone} 24 hours a day, 365 days a year, and a consultation fee may apply. Your own veterinarian or an emergency clinic can also take the call.`,
        'Have three things ready: your dog’s weight, the kind of chocolate (the wrapper helps) and how much is missing. Those are the three numbers that set the dose.',
        'Time matters. The Merck Veterinary Manual, written for veterinarians, says that in dogs that still look normal, making them vomit “should be considered with recent exposures (eg, within 2 hours of chocolate ingestion).” That is the veterinarian’s decision: ask before you give your dog anything at home.',
      ],
    },
    {
      id: 'dose',
      heading: 'How much chocolate is a problem',
      paragraphs: [
        'Chocolate harms dogs through its methylxanthines, theobromine and caffeine. The dose is the milligrams of them the dog ate divided by its weight in kilograms (mg/kg).',
        'Merck gives the bands: “mild clinical signs (vomiting, diarrhea, polydipsia) may occur in dogs ingesting 20 mg/kg; cardiotoxic effects occur after ingesting 40–50 mg/kg, and seizures occur after ingesting doses ≥ 60 mg/kg.” Polydipsia is excessive thirst.',
        'The darker the chocolate, the more it holds. Merck lists 2.3 mg per gram for milk chocolate, 5.3 to 5.6 for semisweet and dark (the calculator uses 5.6) and 15.5 for unsweetened baking chocolate. The ASPCA names baking chocolate and cocoa powder as the most dangerous and white chocolate as the least.',
        'A dose under 20 mg/kg is not a safe line. It is only where Merck lists the first signs, the figures are estimates from what you entered, and a dog with heart disease or on other medicines is not covered by them. Every case below still ends with a call.',
      ],
    },
    {
      id: 'signs',
      heading: 'The signs, and when they start',
      paragraphs: [
        'Merck: “Clinical signs of chocolate toxicosis usually occur within 6–12 hours after ingestion. Initial clinical signs may include polydipsia, vomiting, diarrhea, abdominal distention, and restlessness.” And then: “Clinical signs may progress to hyperactivity, polyuria, ataxia, rigidity, tremors, and seizures.” Polyuria is passing a lot of urine; ataxia is a wobbly, uncoordinated walk.',
        'The ASPCA lists, for chocolate, coffee and caffeine: “vomiting and diarrhea, panting, excessive thirst and urination, hyperactivity, abnormal heart rhythm, tremors, seizures and even death.”',
      ],
    },
    {
      id: 'acting-fine',
      heading: 'Why “acting fine” does not mean safe',
      paragraphs: [
        'A dog that ate chocolate an hour ago and looks normal is what the timing predicts: Merck says signs usually appear 6–12 hours after the dog ate it. Looking fine at first tells you nothing about the dose.',
        'The chemicals also stay in the body a long time. Merck gives the half-life of theobromine in dogs as 17.5 hours (caffeine 4.5 hours), and says signs “may persist for up to 72 hours in severe cases.”',
        'So the time to call is before the signs, while your veterinarian still has the most options.',
      ],
    },
  ],
  table: {
    after: 'acting-fine',
    id: 'cases',
    heading: 'Worked examples: common cases at three dog weights',
    paragraphs: [
      `Each row is the calculator’s own result for the amount shown, which is an example to compare with, not a product’s label. A recipe or a bar can hold more or less: weigh or read the wrapper of what your dog ate. Chocolate chips in cookies are usually semisweet, so the cookie uses the dark and semisweet figure. The milligrams are ${caseOf('cookie').totalMg} for the cookie, ${caseOf('dark').totalMg} for the dark piece, ${caseOf('milk').totalMg} for the milk bar and ${caseOf('baking').totalMg} for the baking square.`,
      `The same ounce of chocolate is a very different dose by kind and by dog. For a 20 lb dog, 1 oz of baking chocolate is ${doseOf('baking', 20)} mg/kg, past where Merck lists heart effects; 1 oz of dark chocolate is ${doseOf('dark', 20)} mg/kg. For a 10 lb dog, that ounce of dark chocolate is ${doseOf('dark', 10)} mg/kg, past the first band. Two cookies, or two bars, double the dose.`,
    ],
    columns: ['What the dog ate', 'Dog’s weight', 'Dose (mg/kg)', 'What Merck lists at this dose'],
    rows: CHOCOLATE_CASES.flatMap(({ label, rows }) =>
      rows.map(({ pounds, dose, band }) => [
        label,
        `${String(pounds)} lb`,
        dose,
        BAND_CELLS[band] ?? BAND_CELLS[3],
      ]),
    ),
    linksHeading: 'Open the calculator with a case filled in, then change it to what your dog ate:',
    links: CHOCOLATE_CASES.map(({ link }) => link),
  },
  questions: [
    {
      question: 'My dog ate chocolate but is acting fine. Do I still call?',
      answer:
        'Yes. Merck says signs usually start 6–12 hours after the dog ate the chocolate, so a dog can look normal for hours before they do. Call your veterinarian or the poison line now and tell them the weight, the kind and the amount.',
    },
    {
      question: 'My dog ate a small piece of chocolate. Is that enough to matter?',
      answer: `It depends on the kind and the dog. A 1 oz piece of dark chocolate is ${doseOf('dark', 10)} mg/kg for a 10 lb dog and ${doseOf('dark', 50)} mg/kg for a 50 lb dog. Neither figure is an all clear: call, and let the veterinarian decide.`,
    },
    {
      question: 'My dog ate chocolate 24 hours ago. Is it too late to call?',
      answer:
        'No. Merck says signs may persist for up to 72 hours in severe cases, and the half-life of theobromine in dogs is 17.5 hours. Call your veterinarian or the poison line and say when it happened.',
    },
    {
      question: 'My dog ate a chocolate chip cookie. What do I tell the vet?',
      answer: `The number of cookies, whether the chips were milk or semisweet, and your dog’s weight. One cookie with 15 g of semisweet chips is ${doseOf('cookie', 10)} mg/kg for a 10 lb dog; cookies with raisins, nuts or xylitol are outside what the calculator covers, so say so on the call.`,
    },
  ],
  calculators: [hrefOf('chocolate')],
  sources: [MERCK_CHOCOLATE, ASPCA_LINE, ASPCA_FOODS],
  card: {
    title: 'My dog ate chocolate',
    summary: 'What to do now, the dose bands, worked cases and the signs.',
  },
};
