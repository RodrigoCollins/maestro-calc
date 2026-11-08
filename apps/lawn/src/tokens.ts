/**
 * The colour tokens of the "mowing stripes" design (plans/lawn/PLAN.md section 5): the layout
 * writes them as custom properties, light on `:root` and dark under `prefers-color-scheme`, and
 * `tokens.test.ts` measures every text pair against 4.5:1.
 */
export interface Tokens {
  /** Page ground. */
  readonly ground: string;
  /** Text on the ground and on cards. */
  readonly ink: string;
  /** Tool surfaces: the form card, the math block's panels. */
  readonly card: string;
  /** Links on the ground and on cards. */
  readonly link: string;
  /** The hero stripes, the two greens. */
  readonly stripeA: string;
  readonly stripeB: string;
  /** Text on the stripes. */
  readonly onStripe: string;
  /** The seed-bag yellow: the tag, the N-P-K digits; dark text sits on it. */
  readonly yellow: string;
  /** Text on the yellow. */
  readonly onYellow: string;
  /** The dark green of the N-P-K tiles and the math block. */
  readonly deep: string;
  /** Text on the deep green, and the yellow digits. */
  readonly onDeep: string;
  /** Muted text on the ground and on cards. */
  readonly muted: string;
  /** The over-the-limit warning text and rule. */
  readonly warn: string;
  /** Hairlines. */
  readonly line: string;
}

export const LIGHT: Tokens = {
  ground: '#F6F1E4',
  ink: '#1D3B22',
  card: '#FFFFFF',
  link: '#1F6B2A',
  stripeA: '#2E6B34',
  stripeB: '#367A3C',
  onStripe: '#F6F1E4',
  yellow: '#F2D14B',
  onYellow: '#1D3B22',
  deep: '#1D3B22',
  onDeep: '#F2D14B',
  muted: '#4A5E4D',
  warn: '#9B2C1D',
  line: '#D8D2BF',
};

export const DARK: Tokens = {
  ground: '#101B12',
  ink: '#EDE8D6',
  card: '#1A2A1D',
  link: '#8FD39A',
  stripeA: '#1F4A25',
  stripeB: '#255A2C',
  onStripe: '#F6F1E4',
  yellow: '#F2D14B',
  onYellow: '#1D3B22',
  deep: '#0A120B',
  onDeep: '#F2D14B',
  muted: '#B5BFAF',
  warn: '#FF9C8A',
  line: '#33463A',
};

const channel = (hex: string, at: number): number => {
  const value = parseInt(hex.slice(at, at + 2), 16) / 255;
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
};

const luminance = (hex: string): number =>
  0.2126 * channel(hex, 1) + 0.7152 * channel(hex, 3) + 0.0722 * channel(hex, 5);

/** The WCAG 2.x contrast ratio of two `#RRGGBB` colours, 1 to 21. */
export const contrast = (a: string, b: string): number => {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (light + 0.05) / (dark + 0.05);
};

/** The `--lawn-*` custom properties of a token set, one declaration per line. */
export const declarationsOf = (tokens: Tokens): string =>
  (Object.entries(tokens) as [string, string][])
    .map(
      ([name, value]) =>
        `--${name.replace(/[A-Z]/g, (letter: string) => `-${letter.toLowerCase()}`)}: ${value};`,
    )
    .join(' ');
