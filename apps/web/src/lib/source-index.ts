/** A published source a calculator entry cites: its name and its address. */
export interface Source {
  readonly name: string;
  readonly url: string;
}

/**
 * Every source the calculator entries of one locale cite, once each by address, in the order
 * first met (editorial policy). The name is the one of the first entry that cites it.
 */
export const sourceIndex = (
  entries: readonly { readonly sources: readonly Source[] }[],
): Source[] => {
  const byUrl = new Map<string, Source>();
  for (const { sources } of entries) {
    for (const { name, url } of sources) if (!byUrl.has(url)) byUrl.set(url, { name, url });
  }
  return [...byUrl.values()];
};
