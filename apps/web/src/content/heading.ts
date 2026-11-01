/** The text of the first level-one (`# `) heading of a Markdown body: a guide's title as written. */
export const headingOf = (body: string): string => {
  const line = body.split('\n').find((text) => text.startsWith('# '));
  if (line === undefined) throw new Error('the body has no level-one heading');
  return line.slice(2).trim();
};
