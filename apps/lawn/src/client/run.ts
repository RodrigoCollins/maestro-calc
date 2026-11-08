import { decode, encode, Rational } from '@maestro-calc/core';
import { watchUsage } from '@maestro-calc/site-kit/track';
import { fieldText } from '../format.ts';
import { areaText } from '../measure.ts';
import { refreshShare } from './share.ts';
import { ENGINES, viewOf, type CalculatorId, type Engine } from '../view.ts';

/**
 * Runs a calculator on every edit of its form: writes each figure into its `[data-v]` hook, shows
 * the `[data-warning]` notes the run raises, marks the fields it cannot read and keeps the numbers
 * in the URL (the defaults are the clean URL). The "measure the lawn" helper writes the area field.
 */
export const run = (id: CalculatorId): void => {
  const engine: Engine = ENGINES[id];
  const form = document.querySelector<HTMLFormElement>(`form[data-calculator="${id}"]`);
  if (form === null) return;
  const fieldOf = (name: string): HTMLInputElement | HTMLSelectElement | null =>
    form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | null;
  const rawOf = (): Record<string, string | undefined> =>
    Object.fromEntries(engine.inputs.map(({ key }) => [key, fieldOf(key)?.value]));
  const encoded = (raw: Readonly<Record<string, unknown>>): string | null => {
    const validated = engine.validate(raw);
    return validated.ok ? encode(engine, validated.value) : null;
  };
  const start = encoded({});

  if (location.search !== '') {
    const values: Readonly<Record<string, unknown>> = decode(
      engine,
      location.search.slice(1),
    ).state;
    for (const { key } of engine.inputs) {
      const field = fieldOf(key);
      const value = values[key];
      if (field === null) continue;
      if (value instanceof Rational) field.value = fieldText(value);
      else if (typeof value === 'string') field.value = value;
    }
  }

  const render = (): void => {
    const raw = rawOf();
    for (const { key } of engine.inputs) fieldOf(key)?.removeAttribute('aria-invalid');
    const view = viewOf(id, raw);
    if (view === undefined) {
      const validated = engine.validate(raw);
      if (!validated.ok)
        for (const { field } of validated.errors)
          fieldOf(field)?.setAttribute('aria-invalid', 'true');
      return;
    }
    for (const node of document.querySelectorAll<HTMLElement>('[data-v]'))
      node.textContent = view.values[node.dataset['v'] ?? ''] ?? '';
    for (const node of document.querySelectorAll<HTMLElement>('[data-warning]'))
      node.hidden = !view.warnings.includes(node.dataset['warning'] ?? '');
    const query = encoded(raw);
    if (query !== null)
      history.replaceState(null, '', query === start ? location.pathname : `?${query}`);
    refreshShare();
  };

  // the measuring helper: length x width in feet fills the area field
  const length = document.querySelector<HTMLInputElement>('[data-measure="length"]');
  const width = document.querySelector<HTMLInputElement>('[data-measure="width"]');
  const out = document.querySelector<HTMLElement>('[data-measure-out]');
  const use = document.querySelector<HTMLButtonElement>('[data-measure-use]');
  const measure = (): string => areaText(length?.value ?? '', width?.value ?? '');
  const area = fieldOf('area');
  for (const input of [length, width])
    input?.addEventListener('input', () => {
      if (out !== null) out.textContent = measure();
    });
  use?.addEventListener('click', () => {
    if (area === null) return;
    area.value = measure().replaceAll(',', '');
    area.dispatchEvent(new Event('input', { bubbles: true }));
  });

  render();
  form.addEventListener('input', render);
  // usage events for analytics: the action and the calculator, never a value (analytics-events)
  watchUsage(window, id, form, document, { share: 'a[data-share]' });
};
