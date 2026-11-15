/** What a Mexico labor result writes: the figure, its rows by key, and the legal floor flag. */
export interface MexicoResultText {
  readonly figure: string;
  readonly values: Readonly<Record<string, string>>;
  readonly belowMinimum: boolean;
}

/** The value of the field `name` of `form`, or an empty text. */
export const fieldValue = (form: HTMLFormElement, name: string): string =>
  (form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | null)?.value ?? '';

/**
 * Writes a Mexico labor result into the page: the figure and each row into their `[data-mx]`
 * nodes and the warning under the legal floor; `null` (a field it cannot read) shows the invalid
 * notice and leaves the last figures in place.
 */
export const writeMexicoResult = (text: MexicoResultText | null): void => {
  const invalid = document.querySelector<HTMLElement>('[data-mx-invalid]');
  const below = document.querySelector<HTMLElement>('[data-mx-below]');
  if (invalid !== null) invalid.hidden = text !== null;
  if (text === null) return;
  if (below !== null) below.hidden = !text.belowMinimum;
  const texts: Readonly<Record<string, string>> = { figure: text.figure, ...text.values };
  for (const node of document.querySelectorAll<HTMLElement>('[data-mx]')) {
    const each = texts[node.dataset['mx'] ?? ''];
    if (each !== undefined) node.textContent = each;
  }
};
