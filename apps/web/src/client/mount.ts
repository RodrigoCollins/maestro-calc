import {
  controllerOf,
  copyAddress,
  copyOutcome,
  type Environment,
  type Output as ControllerOutput,
  type State as ControllerState,
  type UiEvent as ControllerEvent,
} from '../calculator/controller.ts';
import { errorId, helpId, hintId, inputId } from '../calculator/ids.ts';
import type { AnyCalculator, AnyPageModule } from '../calculator/page-module.ts';
import { textKeysOf } from '../calculator/texts.ts';

/** The controller types of any calculator: keys are plain strings here, the module decides which exist. */
type Output = ControllerOutput<AnyCalculator>;
type State = ControllerState<AnyCalculator>;
type UiEvent = ControllerEvent<AnyCalculator>;

/*
 * The thin DOM glue of a calculator page (design C11, C13): it collects the elements the server
 * rendered, feeds the controller what the person does and writes what it returns, with
 * `textContent`, `value`, attributes and `hidden` only. No HTML is built from a string. The unit
 * tests cover the controller; this file is covered by the browser tests. It names no calculator:
 * the page module it is given decides which fields, choices and lines exist, and the slot elements
 * (choices, steppers, shopping lines, cost rows) are looked up as lists that may be empty, so a
 * page without a slot runs the same code over nothing (K12).
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

/** One shopping line of the page and the elements the script rewrites in it. */
interface Line {
  readonly qty: readonly Element[];
  /** The fills of the label and of the note, each named by `data-fill`. */
  readonly fills: readonly Element[];
}

/** One group of pressed buttons: the unit toggle or a choice group, with the buttons it holds. */
interface Group {
  /** The select key of a choice group (`data-choice`); the unit toggle has none. */
  readonly key: string;
  readonly buttons: readonly Element[];
}

/** The elements of the page the script reads and writes, collected once. */
interface Ui {
  readonly form: HTMLFormElement;
  readonly inputs: ReadonlyMap<string, HTMLInputElement>;
  readonly units: readonly Element[];
  /** The choice groups of the page: an empty list for a page that declares no choice slot. */
  readonly choices: readonly Group[];
  /** Absent for a page with no answer slot. */
  readonly answer: Element | null;
  readonly note: HTMLElement;
  readonly noticeArea: Element;
  readonly switchLink: Element;
  readonly primary: {
    readonly figure: Element;
    readonly before: Element | null;
    readonly after: Element;
  };
  /** The slot elements: empty lists for a page that declares no such slot. */
  readonly lines: readonly Line[];
  readonly figures: readonly Element[];
  readonly costRows: readonly Element[];
  readonly hintRows: readonly Element[];
  readonly copyButton: HTMLElement;
  readonly copyStatus: Element;
  readonly copyArea: Element;
}

const collect = (root: Document, keys: readonly string[]): Ui => ({
  form: findAs(root, 'form.calc-form', HTMLFormElement),
  inputs: new Map(
    keys.map((key) => [key, findAs(root, `#${inputId(key)}`, HTMLInputElement)] as const),
  ),
  units: findAll(root, '[data-unit]'),
  choices: findAll(root, '[data-choice]').map((group) => ({
    key: group.getAttribute('data-choice') ?? '',
    buttons: findAll(group, 'button'),
  })),
  answer: root.querySelector('[data-answer]'),
  note: findAs(root, '[data-not-running]', HTMLElement),
  noticeArea: find(root, '[data-reserved="notice"]'),
  switchLink: find(root, 'header a[hreflang]'),
  primary: {
    figure: find(root, '[data-primary]'),
    before: root.querySelector('[data-primary-before]'),
    after: find(root, '[data-primary-after]'),
  },
  lines: findAll(root, '[data-line]').map((row) => ({
    qty: findAll(row, '[data-shopping]'),
    fills: [
      ...findAll(row, '[data-fill]'),
      ...findAll(root, `[data-line-note="${row.getAttribute('data-line') ?? ''}"] [data-fill]`),
    ],
  })),
  figures: findAll(root, '[data-output]'),
  costRows: findAll(root, '[data-cost-row]'),
  hintRows: findAll(root, '[data-hint-row]'),
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

type View = Output['view'];

const renderField = (ui: Ui, key: string, view: View): void => {
  const input = ui.inputs.get(key);
  const field = view.fields[key];
  if (input === undefined || field === undefined) return;
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
  setText(ui.primary.figure, panel.primary.value);
  ui.primary.figure.setAttribute('data-primary', panel.primary.key);
  setText(ui.primary.after, panel.primary.after);
  if (ui.primary.before !== null) setText(ui.primary.before, panel.primary.before);
  for (const output of ui.figures) {
    const key = output.getAttribute('data-output') ?? '';
    const figure = panel.figures[key];
    if (figure === undefined) continue;
    setText(output, figure);
    output.closest('.calc-row')?.toggleAttribute('hidden', key === panel.primary.key);
  }
  for (const row of ui.costRows) {
    row.toggleAttribute('hidden', panel.costs[row.getAttribute('data-cost-row') ?? ''] !== true);
  }
  for (const row of ui.hintRows) {
    row.toggleAttribute('hidden', panel.costs[row.getAttribute('data-hint-row') ?? ''] === true);
  }
  for (const [index, row] of ui.lines.entries()) {
    const line = panel.shopping[index];
    for (const qty of row.qty) {
      setText(qty, line?.qty ?? '');
      qty.setAttribute('data-shopping', line?.unit ?? '');
    }
    for (const fill of row.fills) {
      setText(fill, line?.fills[fill.getAttribute('data-fill') ?? ''] ?? '');
    }
  }
};

const renderChoices = (ui: Ui, view: View): void => {
  for (const button of ui.units) {
    setPressed(button, button.getAttribute('data-unit') === view.system);
  }
  for (const { key, buttons } of ui.choices) {
    const chosen = view.choices[key];
    for (const button of buttons) {
      setPressed(button, button.getAttribute('value') === chosen);
    }
  }
};

const setPressed = (button: Element, pressed: boolean): void => {
  button.setAttribute('aria-pressed', pressed ? 'true' : 'false');
};

const render = (ui: Ui, keys: readonly string[], { view }: Output): void => {
  for (const key of keys) renderField(ui, key, view);
  if (ui.answer !== null) setText(ui.answer, view.answer ?? '');
  const notice = paragraph(ui.noticeArea, 'calc-notice', '');
  setText(notice, view.notice);
  notice.hidden = view.notice === '';
  renderPanel(ui, view);
  renderChoices(ui, view);
  ui.switchLink.setAttribute('href', view.switchHref);
};

/** The value of `hook` on the nearest group around `button`, `undefined` outside one. */
const groupKeyOf = (button: Element, hook: string): string | undefined =>
  button.closest(`[${hook}]`)?.getAttribute(hook) ?? undefined;

/**
 * The event a click on `button` stands for, when it is one of the form's controls: a unit button
 * names its system; a choice or stepper button carries its option as its value and the group
 * around it (`data-choice`, `data-step`) names the key.
 */
const eventOf = (button: Element): UiEvent | undefined => {
  const unit = button.getAttribute('data-unit');
  if (unit === 'imperial' || unit === 'metric') return { type: 'units', system: unit };
  const option = button.getAttribute('value');
  if (option === null) return undefined;
  const select = groupKeyOf(button, 'data-choice');
  if (select !== undefined) return { type: 'choice', select, option };
  const step = groupKeyOf(button, 'data-step');
  if (step !== undefined && (option === 'less' || option === 'more')) {
    return { type: 'step', key: step, direction: option };
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

/**
 * Turns the server-rendered form of `module` into the live calculator. A failure before the end
 * leaves the static page.
 */
export const mount = (module: AnyPageModule): void => {
  const controller = controllerOf(module);
  const keys = textKeysOf(module.calculator);
  const ui = collect(document, keys);
  const env: Environment = {
    messages: messagesOf(document),
    origin: location.origin,
    path: location.pathname,
    switchPath: ui.switchLink.getAttribute('href') ?? '',
    helps: new Set(keys.filter((key) => document.getElementById(helpId(key)) !== null)),
  };
  let current: State;
  const show = (output: Output): void => {
    current = output.state;
    render(ui, keys, output);
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
    if (input instanceof HTMLInputElement && keys.includes(input.name)) {
      dispatch({ type: 'text', key: input.name, text: input.value });
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
  for (const control of findAll(ui.form, '[data-copy][hidden], [data-step] [hidden]')) {
    if (control instanceof HTMLElement) control.hidden = false;
  }
  ui.note.hidden = true;
};
