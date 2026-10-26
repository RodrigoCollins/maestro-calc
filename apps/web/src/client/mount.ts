import { concretePage } from '../calculator/concrete/page.ts';
import {
  controllerOf,
  copyAddress,
  copyOutcome,
  type Environment,
  type Output as ControllerOutput,
  type State as ControllerState,
  type UiEvent as ControllerEvent,
  type View as ControllerView,
} from '../calculator/controller.ts';
import { errorId, helpId, hintId } from '../calculator/ids.ts';
import type { TextKey as KeyOf } from '../calculator/page-module.ts';
import { textKeysOf } from '../calculator/texts.ts';

type Concrete = typeof concretePage.calculator;
type TextKey = KeyOf<Concrete>;
type Output = ControllerOutput<Concrete>;
type State = ControllerState<Concrete>;
type UiEvent = ControllerEvent<Concrete>;
type View = ControllerView<Concrete>;

/*
 * The thin DOM glue of the concrete page (design C11, C13): it collects the elements the server
 * rendered, feeds the controller what the person does and writes what it returns, with
 * `textContent`, `value`, attributes and `hidden` only. No HTML is built from a string. The unit
 * tests cover the controller; this file is covered by the browser tests.
 */

const find = (root: ParentNode, selector: string): Element => {
  const found = root.querySelector(selector);
  if (found === null) throw new Error(`the page lacks ${selector}`);
  return found;
};

/** The element for `selector`, which must be an instance of `type`. */
const findAs = <T extends Element>(
  root: ParentNode,
  selector: string,
  type: abstract new () => T,
): T => {
  const found = find(root, selector);
  if (!(found instanceof type)) throw new Error(`${selector} is not a ${type.name}`);
  return found;
};

const findAll = (root: ParentNode, selector: string): Element[] =>
  Array.from(root.querySelectorAll(selector));

const setText = (element: Element, text: string): void => {
  if (element.textContent !== text) element.textContent = text;
};

const setAttribute = (element: Element, name: string, value: string | undefined): void => {
  if (value === undefined) element.removeAttribute(name);
  else element.setAttribute(name, value);
};

/** The inert messages: the entries of the page's one template, by id. */
const messagesOf = (root: ParentNode): Record<string, string> => {
  const template = findAs(root, 'template[data-messages]', HTMLTemplateElement);
  return Object.fromEntries(
    Array.from(template.content.children, (entry) => [entry.id, entry.textContent]),
  );
};

const controller = controllerOf(concretePage);
const TEXT_KEYS = textKeysOf(concretePage.calculator);

/** The elements of the page the script reads and writes, collected once. */
interface Ui {
  readonly form: HTMLFormElement;
  readonly inputs: ReadonlyMap<TextKey, HTMLInputElement>;
  readonly answer: Element;
  readonly note: HTMLElement;
  readonly noticeArea: Element;
  readonly switchLink: Element;
  readonly primary: {
    readonly figure: Element;
    readonly before: Element | null;
    readonly after: Element;
  };
  readonly shopping: { readonly qty: Element; readonly bagLb: Element; readonly yield: Element };
  readonly copyButton: HTMLElement;
  readonly copyStatus: Element;
  readonly copyArea: Element;
}

const collect = (root: Document): Ui => ({
  form: findAs(root, 'form.calc-form', HTMLFormElement),
  inputs: new Map(
    TEXT_KEYS.map((key) => [key, findAs(root, `input[name="${key}"]`, HTMLInputElement)]),
  ),
  answer: find(root, '[data-answer]'),
  note: findAs(root, '[data-not-running]', HTMLElement),
  noticeArea: find(root, '[data-reserved="notice"]'),
  switchLink: find(root, 'header a[hreflang]'),
  primary: {
    figure: find(root, '[data-primary]'),
    before: root.querySelector('[data-primary-before]'),
    after: find(root, '[data-primary-after]'),
  },
  shopping: {
    qty: find(root, '[data-shopping]'),
    bagLb: find(root, '[data-fill="bagLb"]'),
    yield: find(root, '[data-fill="yield"]'),
  },
  copyButton: findAs(root, '[data-copy]', HTMLElement),
  copyStatus: find(root, '[data-copy-status]'),
  copyArea: find(root, '[data-reserved="copy"]'),
});

/** A paragraph the script adds under `parent` (an error message, the link notice), made once. */
const paragraph = (parent: Element, id: string, className: string): HTMLElement => {
  const existing = parent.ownerDocument.getElementById(id);
  if (existing !== null) return existing;
  const created = parent.ownerDocument.createElement('p');
  created.id = id;
  if (className !== '') created.className = className;
  parent.append(created);
  return created;
};

const renderField = (ui: Ui, key: TextKey, view: View): void => {
  const input = ui.inputs.get(key);
  if (input === undefined) return;
  const field = view.fields[key];
  const box = input.closest('.calc-field');
  if (input.value !== field.text) input.value = field.text;
  setAttribute(input, 'aria-invalid', field.invalid ? 'true' : undefined);
  setAttribute(input, 'aria-describedby', field.describedBy === '' ? undefined : field.describedBy);
  if (field.hint !== undefined) {
    const hint = input.ownerDocument.getElementById(hintId(key));
    if (hint !== null) setText(hint, field.hint);
  }
  if (box === null) return;
  if (field.invalid) {
    setText(paragraph(box, errorId(key), 'calc-error'), field.message);
  } else {
    input.ownerDocument.getElementById(errorId(key))?.remove();
  }
  box.toggleAttribute('hidden', field.hidden);
};

const renderPanel = (ui: Ui, view: View): void => {
  const { panel } = view;
  const root = ui.form.ownerDocument;
  setText(ui.primary.figure, panel.primary.value);
  ui.primary.figure.setAttribute('data-primary', panel.primary.key);
  setText(ui.primary.after, panel.primary.after);
  if (ui.primary.before !== null) setText(ui.primary.before, panel.primary.before);
  for (const [key, text] of Object.entries(panel.figures)) {
    const output = find(root, `[data-output="${key}"]`);
    setText(output, text);
    output.closest('.calc-row')?.toggleAttribute('hidden', key === panel.primary.key);
  }
  for (const [key, visible] of Object.entries(panel.costs)) {
    find(root, `[data-cost-row="${key}"]`).toggleAttribute('hidden', !visible);
    find(root, `[data-hint-row="${key}"]`).toggleAttribute('hidden', visible);
  }
  const [line] = panel.shopping;
  setText(ui.shopping.qty, line?.qty ?? '');
  ui.shopping.qty.setAttribute('data-shopping', line?.unit ?? '');
  setText(ui.shopping.bagLb, line?.fills['bagLb'] ?? '');
  setText(ui.shopping.yield, line?.fills['yield'] ?? '');
};

const renderChoices = (ui: Ui, view: View): void => {
  const groups: [string, string, string][] = [
    ['[data-unit]', 'data-unit', view.system],
    ['[data-choice="shape"]', 'data-value', view.choices.shape],
    ['[data-choice="bag"]', 'data-value', view.choices.bag],
  ];
  for (const [selector, attribute, chosen] of groups) {
    for (const button of findAll(ui.form, selector)) {
      button.setAttribute(
        'aria-pressed',
        button.getAttribute(attribute) === chosen ? 'true' : 'false',
      );
    }
  }
};

const render = (ui: Ui, { view }: Output): void => {
  for (const key of TEXT_KEYS) renderField(ui, key, view);
  setText(ui.answer, view.answer ?? '');
  const notice = paragraph(ui.noticeArea, 'calc-notice', '');
  setText(notice, view.notice);
  notice.hidden = view.notice === '';
  renderPanel(ui, view);
  renderChoices(ui, view);
  ui.switchLink.setAttribute('href', view.switchHref);
};

/** The name of an `<input>` when it is one of the text fields of the form. */
const textKeyOf = (name: string): TextKey | undefined => TEXT_KEYS.find((key) => key === name);

/** The event a click on `button` stands for, when it is one of the form's controls. */
const eventOf = (button: Element): UiEvent | undefined => {
  const unit = button.getAttribute('data-unit');
  if (unit === 'imperial' || unit === 'metric') return { type: 'units', system: unit };
  const option = button.getAttribute('data-value');
  const select = button.getAttribute('data-choice');
  if (option !== null && (select === 'shape' || select === 'bag')) {
    return { type: 'choice', select, option };
  }
  const direction = button.getAttribute('data-direction');
  if (
    button.getAttribute('data-step') === 'waste' &&
    (direction === 'less' || direction === 'more')
  ) {
    return { type: 'step', key: 'waste', direction };
  }
  return undefined;
};

const showCopy = (ui: Ui, env: Environment, address: string, copied: boolean): void => {
  const outcome = copyOutcome(env, copied, address);
  setText(ui.copyStatus, outcome.message);
  const existing = ui.copyArea.ownerDocument.getElementById('calc-fallback');
  if (outcome.address === undefined) {
    existing?.remove();
    return;
  }
  const field = existing ?? ui.copyArea.ownerDocument.createElement('input');
  if (!(field instanceof HTMLInputElement)) return;
  field.id = 'calc-fallback';
  field.className = 'calc-fallback';
  field.readOnly = true;
  field.value = outcome.address;
  field.setAttribute('aria-label', outcome.message);
  ui.copyArea.append(field);
  field.focus();
  field.select();
};

/** Turns the server-rendered form into the live calculator. A failure before the end leaves the static page. */
export const mount = (): void => {
  const ui = collect(document);
  const env: Environment = {
    messages: messagesOf(document),
    origin: location.origin,
    path: location.pathname,
    switchPath: ui.switchLink.getAttribute('href') ?? '',
    helps: new Set(TEXT_KEYS.filter((key) => document.getElementById(helpId(key)) !== null)),
  };
  let current: State;
  const show = (output: Output): void => {
    current = output.state;
    render(ui, output);
    if (output.write !== undefined) {
      history.replaceState(history.state, '', `${location.pathname}${output.write}`);
    }
  };
  const dispatch = (event: UiEvent): void => {
    show(controller.applyEvent(env, current, event));
  };

  show(controller.start(env, location.search));
  ui.form.addEventListener('input', (event) => {
    const input = event.target;
    const key = input instanceof HTMLInputElement ? textKeyOf(input.name) : undefined;
    if (input instanceof HTMLInputElement && key !== undefined) {
      dispatch({ type: 'text', key, text: input.value });
    }
  });
  ui.form.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target.closest('button') : null;
    if (target === null) return;
    if (target === ui.copyButton) {
      const address = copyAddress(env, current);
      Promise.resolve()
        .then(() => navigator.clipboard.writeText(address))
        .then(
          () => {
            showCopy(ui, env, address, true);
          },
          () => {
            showCopy(ui, env, address, false);
          },
        );
      return;
    }
    const action = eventOf(target);
    if (action !== undefined) dispatch(action);
  });
  ui.form.addEventListener('submit', (event) => {
    event.preventDefault();
  });
  // Enter in a field would submit the form; on a button it is the press itself, so it stays
  ui.form.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && event.target instanceof HTMLInputElement) event.preventDefault();
  });

  for (const control of findAll(ui.form, ':disabled')) {
    if (control instanceof HTMLInputElement || control instanceof HTMLButtonElement) {
      control.disabled = false;
    }
  }
  for (const control of findAll(ui.form, '[data-copy][hidden], [data-step][hidden]')) {
    if (control instanceof HTMLElement) control.hidden = false;
  }
  ui.note.hidden = true;
};
