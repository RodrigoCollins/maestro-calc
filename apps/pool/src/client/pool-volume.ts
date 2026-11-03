import { decode, encode, ft3, gal, isQuantityOf, liter } from '@maestro-calc/core';
import { poolVolume } from '@maestro-calc/pool-core/pool-volume';
import { lengthFieldText, volumeText } from '../format.ts';

const form = document.querySelector<HTMLFormElement>('form[data-calculator="pool-volume"]');
const UNITS = { gallons: [gal, 0], liters: [liter, 0], cubicFeet: [ft3, 1] } as const;

if (form !== null) {
  const fieldOf = (name: string): HTMLInputElement | HTMLSelectElement | null =>
    form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | null;
  const rawOf = (): Record<string, string | undefined> =>
    Object.fromEntries(poolVolume.inputs.map(({ key }) => [key, fieldOf(key)?.value]));
  const encoded = (raw: Readonly<Record<string, unknown>>): string | null => {
    const validated = poolVolume.validate(raw);
    return validated.ok ? encode(poolVolume, validated.value) : null;
  };
  const start = encoded({});

  // a shared link reopens its numbers: the URL state fills the fields before the first run
  if (location.search !== '') {
    const values: Readonly<Record<string, unknown>> = decode(
      poolVolume,
      location.search.slice(1),
    ).state;
    for (const { key } of poolVolume.inputs) {
      const field = fieldOf(key);
      const value = values[key];
      if (field === null) continue;
      if (isQuantityOf(value, 'length')) field.value = lengthFieldText(value);
      else if (typeof value === 'string') field.value = value;
    }
  }

  const render = (): void => {
    const raw = rawOf();
    const ran = poolVolume.run(raw);
    for (const { key } of poolVolume.inputs) fieldOf(key)?.removeAttribute('aria-invalid');
    if (!ran.ok) {
      for (const { field } of ran.errors) fieldOf(field)?.setAttribute('aria-invalid', 'true');
      return;
    }
    for (const { key, value } of ran.value.outputs) {
      if (!isQuantityOf(value, 'volume') || !(key in UNITS)) continue;
      const [unit, places] = UNITS[key];
      for (const node of document.querySelectorAll(`[data-out="${key}"]`)) {
        node.textContent = volumeText(value, unit, places);
      }
    }
    const query = encoded(raw);
    if (query !== null) {
      history.replaceState(null, '', query === start ? location.pathname : `?${query}`);
    }
  };

  render();
  form.addEventListener('input', render);
}
