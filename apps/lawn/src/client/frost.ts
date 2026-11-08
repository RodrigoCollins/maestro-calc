import { lookupZip, shardOf, type Shard } from '@maestro-calc/lawn-data/frost/zip';
import { watchUsage } from '@maestro-calc/site-kit/track';
import { dateText, titleCase } from '../frost-text.ts';
import { zipResultOf, type StateData } from '../zip-result.ts';

const getJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: ${String(response.status)}`);
  return (await response.json()) as T;
};

/**
 * The ZIP lookup of the frost pages: fetches the static shard of ZIP codes that start with the
 * same digit and the dates of the station's state, then writes the nearest station and its dates
 * under the form. Nothing typed leaves the browser except these two static file requests.
 */
const form = document.querySelector<HTMLFormElement>('form[data-zip]');
const out = document.querySelector<HTMLElement>('[data-zip-result]');
if (form !== null && out !== null) {
  const field = form.elements.namedItem('zip') as HTMLInputElement;
  const say = (text: string): void => {
    out.replaceChildren(text);
  };
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const zip = field.value.trim();
    const shardName = shardOf(zip);
    if (shardName === undefined) {
      say(out.dataset['invalid'] ?? '');
      return;
    }
    void (async () => {
      try {
        const match = lookupZip(await getJson<Shard>(`/data/frost/${shardName}`), zip);
        if (match === undefined) {
          say(out.dataset['unknown'] ?? '');
          return;
        }
        const data = await getJson<StateData>(`/data/frost/${match.stationState}.json`);
        const result = zipResultOf(zip, match, data, { dateText, titleCase });
        if (result === undefined) {
          say(out.dataset['unknown'] ?? '');
          return;
        }
        const link = document.createElement('a');
        link.href = result.href;
        link.textContent = result.linkLabel;
        out.replaceChildren(result.text, ' ', link);
      } catch {
        say(out.dataset['failed'] ?? '');
      }
    })();
  });
  watchUsage(window, 'frost-zip', form, document, { share: 'a[data-share]' });
}
