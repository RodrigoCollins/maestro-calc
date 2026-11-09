import {
  decode,
  encode,
  ft3,
  gal,
  inch,
  isQuantityOf,
  liter,
  m3,
  valueIn,
  type Quantity,
  type UnitSystem,
} from '@maestro-calc/core';
import { poolVolume } from '@maestro-calc/pool-core/pool-volume';
import { watchUsage } from '@maestro-calc/site-kit/track';
import { lengthFieldText, volumeText } from '../format.ts';
import { sideViewOf, type SideView } from '../volume/side-view.ts';
import { showUnits, storedUnits, storeUnits, unitsOf } from './units.ts';

const form = document.querySelector<HTMLFormElement>('form[data-calculator="pool-volume"]');
// each figure in the units of the page: in metric the large figure is litres, its rows gallons and
// cubic metres (the labels change with them, `[data-metric]`)
const UNITS = {
  us: { gallons: [gal, 0], liters: [liter, 0], cubicFeet: [ft3, 1] },
  metric: { gallons: [liter, 0], liters: [gal, 0], cubicFeet: [m3, 1] },
} as const;
const side = document.querySelector('svg[data-side]');
// the page names its drawing in its own language
const lang = document.documentElement.lang === 'es' ? 'es' : 'en';

/** Redraws the server's side view: the same nodes, new attributes and texts. */
const drawSide = (view: SideView): void => {
  if (side === null) return;
  const set = (part: string, attrs: Readonly<Record<string, string>>, text?: string): void => {
    const node = side.querySelector(`[data-side="${part}"]`);
    if (node === null) return;
    for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value);
    if (text !== undefined) node.textContent = text;
  };
  set('water', { d: view.water });
  set('wall', { d: view.wall });
  set('length', {}, view.length);
  for (const [index, { x, width, center, text }] of view.markers.entries()) {
    set(`box${String(index)}`, { x: String(x), width: String(width) });
    set(`mark${String(index)}`, { x: String(center) }, text);
  }
  side.setAttribute('aria-label', view.name);
};

const inches = (length: Quantity<'length'>): number => valueIn(length, inch).toNumber();

if (form !== null) {
  const fieldOf = (name: string): HTMLInputElement | HTMLSelectElement | null =>
    form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | null;
  const rawOf = (): Record<string, string | undefined> =>
    Object.fromEntries(poolVolume.inputs.map(({ key }) => [key, fieldOf(key)?.value]));
  const unitsField = fieldOf('units');
  // core's unit system: a bare number is metres in metric, and the URL says so with u=m
  const systemOf = (): UnitSystem => (unitsField?.value === 'metric' ? 'metric' : 'imperial');
  const encoded = (raw: Readonly<Record<string, unknown>>): string | null => {
    const unitSystem = systemOf();
    const validated = poolVolume.validate(raw, { unitSystem });
    return validated.ok ? encode(poolVolume, validated.value, { unitSystem }) : null;
  };
  // read while the select still shows the page's US default: the clean URL
  const start = encoded({});
  /** Writes every length field again in `units`, from what it reads in the units it was in. */
  const rewrite = (from: UnitSystem): void => {
    const validated = poolVolume.validate(rawOf(), { unitSystem: from });
    if (!validated.ok) return;
    for (const input of poolVolume.inputs) {
      const field = fieldOf(input.key);
      const values: Readonly<Record<string, unknown>> = validated.value;
      const value = values[input.key];
      if (field !== null && isQuantityOf(value, 'length'))
        field.value = lengthFieldText(value, unitsOf(unitsField?.value));
    }
  };

  // a shared link reopens its numbers: the URL state fills the fields before the first run
  if (location.search !== '') {
    const decoded = decode(poolVolume, location.search.slice(1));
    const values: Readonly<Record<string, unknown>> = decoded.state;
    const units = decoded.unitSystem === 'metric' ? 'metric' : 'us';
    if (unitsField !== null) unitsField.value = units;
    for (const { key } of poolVolume.inputs) {
      const field = fieldOf(key);
      const value = values[key];
      if (field === null) continue;
      if (isQuantityOf(value, 'length')) field.value = lengthFieldText(value, units);
      else if (typeof value === 'string') field.value = value;
    }
  } else if (unitsField !== null && storedUnits() === 'metric') {
    unitsField.value = 'metric';
    rewrite('imperial');
  }

  unitsField?.addEventListener('input', () => {
    rewrite(unitsField.value === 'metric' ? 'imperial' : 'metric');
    storeUnits(unitsField.value);
  });

  const render = (): void => {
    const raw = rawOf();
    const unitSystem = systemOf();
    const units = unitsOf(unitsField?.value);
    showUnits(units);
    const ran = poolVolume.run(raw, { unitSystem });
    for (const { key } of poolVolume.inputs) fieldOf(key)?.removeAttribute('aria-invalid');
    if (!ran.ok) {
      for (const { field } of ran.errors) fieldOf(field)?.setAttribute('aria-invalid', 'true');
      return;
    }
    for (const { key, value } of ran.value.outputs) {
      if (!isQuantityOf(value, 'volume') || !(key in UNITS.us)) continue;
      const [unit, places] = UNITS[units][key];
      for (const node of document.querySelectorAll(`[data-out="${key}"]`)) {
        node.textContent = volumeText(value, unit, places);
      }
    }
    const validated = poolVolume.validate(raw, { unitSystem });
    if (validated.ok) {
      const { length, shallow, deep } = validated.value;
      drawSide(
        sideViewOf(
          { length: inches(length), shallow: inches(shallow), deep: inches(deep) },
          lang,
          units,
        ),
      );
    }
    const query = encoded(raw);
    if (query !== null) {
      history.replaceState(null, '', query === start ? location.pathname : `?${query}`);
    }
  };

  render();
  form.addEventListener('input', render);
  // usage events for analytics: the action and the calculator, never a value (analytics-events)
  watchUsage(window, poolVolume.id, form, document);
}
