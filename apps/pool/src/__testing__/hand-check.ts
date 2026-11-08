/*
 * The check a reader makes by hand: every sum a worked step writes before `=` or `≈` is worked
 * again from the figures it shows, in order of operations, and must round to the result it gives
 * at the places it gives it. Words between the figures are units ("gallons", "mg per liter") and
 * are skipped; a colon, a comma, a semicolon or two figures with no operator between them end the
 * sum. A sum that starts with an operator continues an earlier one and is not checked.
 */

type Token =
  | { readonly kind: 'number'; readonly value: number }
  | { readonly kind: 'op' | '(' | ')'; readonly op: string };

const NUMBER = /^-?\d[\d,]*(?:\.\d+)?$/;

const numberOf = (text: string): number => Number(text.replaceAll(',', ''));

/** The tokens of the sum that ends right before `end` in `words`, in reading order. */
const sumBefore = (words: readonly string[], end: number): Token[] | undefined => {
  const tokens: Token[] = [];
  for (let index = end - 1; index >= 0; index -= 1) {
    const raw = words[index] ?? '';
    const stops = /[:;,]$/.test(raw);
    if (stops && tokens.length > 0) break;
    const word = raw.replace(/[:;,]$/, '');
    const parts: Token[] = [];
    let core = word;
    const closes = /\)+$/.exec(core)?.[0].length ?? 0;
    core = core.slice(0, core.length - closes);
    const opens = /^\(+/.exec(core)?.[0].length ?? 0;
    core = core.slice(opens);
    for (let i = 0; i < opens; i += 1) parts.push({ kind: '(', op: '(' });
    const squared = core.endsWith('²');
    const bare = squared ? core.slice(0, -1) : core;
    if (bare === 'π') parts.push({ kind: 'number', value: Math.PI });
    else if (NUMBER.test(bare)) {
      const value = numberOf(bare);
      parts.push({ kind: 'number', value: squared ? value * value : value });
    } else if (['×', '÷', '+', '−'].includes(bare)) parts.push({ kind: 'op', op: bare });
    else if (opens === 0 && closes === 0) {
      if (stops) break;
      continue;
    }
    for (let i = 0; i < closes; i += 1) parts.push({ kind: ')', op: ')' });
    const first = parts.find((part) => part.kind !== '(' && part.kind !== ')');
    const head = tokens.find((part) => part.kind !== '(' && part.kind !== ')');
    // two figures with no operator between them: the sum started after this one
    if (first?.kind === 'number' && head?.kind === 'number') break;
    tokens.unshift(...parts);
    if (stops) break;
  }
  const opens = tokens.filter(({ kind }) => kind === '(').length;
  const closes = tokens.filter(({ kind }) => kind === ')').length;
  while (tokens[0]?.kind === ')' || (tokens[0]?.kind === '(' && opens > closes)) tokens.shift();
  if (tokens.length < 3 || tokens[0]?.kind === 'op') return undefined;
  return tokens;
};

const PRECEDENCE: Readonly<Record<string, number>> = { '+': 1, '−': 1, '×': 2, '÷': 2 };

const apply = (op: string, a: number, b: number): number =>
  op === '+' ? a + b : op === '−' ? a - b : op === '×' ? a * b : a / b;

/** The value of the tokens, in order of operations. */
const evaluate = (tokens: readonly Token[]): number => {
  const values: number[] = [];
  const ops: string[] = [];
  const reduce = (): void => {
    const op = ops.pop() ?? '+';
    const b = values.pop() ?? 0;
    const a = values.pop() ?? 0;
    values.push(apply(op, a, b));
  };
  for (const token of tokens) {
    if (token.kind === 'number') values.push(token.value);
    else if (token.kind === '(') ops.push('(');
    else if (token.kind === ')') {
      while (ops.length > 0 && ops.at(-1) !== '(') reduce();
      ops.pop();
    } else {
      while (
        ops.length > 0 &&
        ops.at(-1) !== '(' &&
        (PRECEDENCE[ops.at(-1) ?? ''] ?? 0) >= (PRECEDENCE[token.op] ?? 0)
      )
        reduce();
      ops.push(token.op);
    }
  }
  while (ops.length > 0) reduce();
  return values[0] ?? Number.NaN;
};

/** The sums of `sentence` whose result a reader working by hand would not get. */
export const handProblems = (sentence: string): string[] => {
  const words = sentence.split(/\s+/);
  const problems: string[] = [];
  words.forEach((word, index) => {
    if (word !== '=' && word !== '≈') return;
    const result = (words[index + 1] ?? '').replace(/[.,;:]+$/, '');
    if (!NUMBER.test(result)) return;
    const tokens = sumBefore(words, index);
    if (tokens === undefined) return;
    const places = result.split('.')[1]?.length ?? 0;
    const worked = evaluate(tokens);
    const given = numberOf(result);
    if (Math.abs(worked - given) > 0.5 * 10 ** -places + 1e-9)
      problems.push(`${sentence}: by hand ${String(worked)}, not ${result}`);
  });
  return problems;
};
