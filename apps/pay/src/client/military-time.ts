import { readTime } from '@maestro-calc/pay-core/military-time';
import { watchUsage } from '@maestro-calc/site-kit/track';
import { resultOf } from '../military/words.ts';
import { refreshShare } from './share.ts';

/**
 * The military time converter: on every edit, reads the time either way (`1500`, `3:00 pm`) and
 * writes its figure and each form into its `[data-mil]` node. A time it cannot read is marked and
 * the figures wait for a fix.
 */
const run = (form: HTMLFormElement | null): void => {
  if (form === null) return;
  const field = form.elements.namedItem('time') as HTMLInputElement | null;
  const invalid = document.querySelector<HTMLElement>('[data-military-invalid]');
  const lang = document.documentElement.lang === 'es' ? 'es' : 'en';
  const render = (): void => {
    const time = readTime(field?.value ?? '');
    if (invalid !== null) invalid.hidden = time !== null;
    if (time === null) {
      field?.setAttribute('aria-invalid', 'true');
      return;
    }
    field?.removeAttribute('aria-invalid');
    const { figure, values } = resultOf(time, lang);
    const texts: Readonly<Record<string, string>> = { figure, ...values };
    for (const node of document.querySelectorAll<HTMLElement>('[data-mil]')) {
      const text = texts[node.dataset['mil'] ?? ''];
      if (text !== undefined) node.textContent = text;
    }
    refreshShare();
  };
  render();
  form.addEventListener('input', render);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
  });
  // usage events for analytics: the action and the calculator, never a value (analytics-events)
  watchUsage(window, 'military-time', form, document, { share: 'a[data-share]' });
};

run(document.querySelector<HTMLFormElement>('form[data-military-time]'));
