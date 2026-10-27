/** The source with its comments removed; the quotes are tracked so `https://` in a string stays. */
export const stripComments = (source: string): string => {
  let out = '';
  let quote = '';
  for (let at = 0; at < source.length; at += 1) {
    const char = source.charAt(at);
    const next = source.charAt(at + 1);
    if (quote !== '') {
      out += char;
      if (char === '\\') {
        out += next;
        at += 1;
      } else if (char === quote) quote = '';
    } else if (char === '/' && next === '/') {
      while (at < source.length && source.charAt(at) !== '\n') at += 1;
      out += '\n';
    } else if (char === '/' && next === '*') {
      at = source.indexOf('*/', at + 2) + 1;
    } else {
      if (char === "'" || char === '"' || char === '`') quote = char;
      out += char;
    }
  }
  return out;
};

/** The text of every string literal of a source without comments. */
export const stringsIn = (code: string): string[] =>
  Array.from(
    code.matchAll(/'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g),
    (found) => found[1] ?? found[2] ?? found[3] ?? '',
  );
