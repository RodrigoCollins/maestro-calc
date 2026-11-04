import { padOf } from '../strip.ts';

/**
 * Wires the test strip picker of a dose page: a tap on a pad writes its reading into the field the
 * strip names and fires the form's `input`, so the page works the dose out again; every edit marks
 * the pad whose reading the field holds (`aria-pressed`), or none.
 */
export const wireStrip = (): void => {
  const strip = document.querySelector<HTMLElement>('[data-strip]');
  const form = strip?.parentElement?.querySelector('form[data-calculator]');
  if (strip === null || form === null || form === undefined) return;
  const field = form.querySelector<HTMLInputElement>(`[name="${strip.dataset['strip'] ?? ''}"]`);
  if (field === null) return;
  const pads = [...strip.querySelectorAll<HTMLButtonElement>('[data-pad]')];
  const ppms = pads.map(({ dataset }) => dataset['pad'] ?? '');
  const mark = (): void => {
    const at = padOf(field.value, ppms);
    for (const [index, pad] of pads.entries())
      pad.setAttribute('aria-pressed', String(index === at));
  };
  for (const [index, pad] of pads.entries()) {
    pad.addEventListener('click', () => {
      field.value = ppms[index] ?? '';
      field.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }
  form.addEventListener('input', mark);
  mark();
};
