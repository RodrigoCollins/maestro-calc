export interface HeaderRule {
  readonly pattern: string;
  readonly headers: Readonly<Record<string, string>>;
  /** Every header line in file order (a name may repeat). */
  readonly lines: readonly (readonly [string, string])[];
}

/** Parses a Cloudflare `_headers` file: a path line, then indented `Name: value` lines. */
export const parseHeaders = (text: string): HeaderRule[] => {
  const rules: { pattern: string; lines: [string, string][] }[] = [];
  for (const raw of text.split('\n')) {
    if (raw.trim() === '' || raw.trimStart().startsWith('#')) continue;
    const current = rules.at(-1);
    if (/^\s/.test(raw) && current !== undefined) {
      const [name = '', ...value] = raw.trim().split(':');
      current.lines.push([name.trim(), value.join(':').trim()]);
    } else {
      rules.push({ pattern: raw.trim(), lines: [] });
    }
  }
  return rules.map(({ pattern, lines }) => ({
    pattern,
    lines,
    headers: Object.fromEntries(lines.map(([name, value]) => [name.toLowerCase(), value])),
  }));
};

/** Whether a `_headers` path pattern applies to `path`: `*` is a splat that crosses slashes. */
export const appliesTo = (pattern: string, path: string): boolean =>
  new RegExp(`^${pattern.split('*').map(escapeRegExp).join('.*')}$`).test(path);

const escapeRegExp = (text: string): string =>
  text.replaceAll(/[.+?^${}()|[\]\\]/g, String.raw`\$&`);
