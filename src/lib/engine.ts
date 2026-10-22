// Client-side runtime: reads the form rendered by Calculator.astro, runs the spec's compute(),
// renders results / shopping list / warnings / diagram, and keeps the state in the URL.
import { toBase, type Dim } from './units';
import { escapeHtml, fmt, formatResult, money } from './format';
import type { CalcSpec, Field, Output, Values } from './types';

const UNIT_SUFFIX = '__unit';

export function mount(spec: CalcSpec, root: HTMLElement | null = document.querySelector(`[data-calc="${spec.slug}"]`)) {
  if (!root) return;
  const form = root.querySelector('form')!;
  const out = {
    results: root.querySelector<HTMLElement>('[data-results]')!,
    materials: root.querySelector<HTMLElement>('[data-materials]')!,
    warnings: root.querySelector<HTMLElement>('[data-warnings]')!,
    diagram: root.querySelector<HTMLElement>('[data-diagram]')!,
  };
  let last: Output | null = null;

  restoreFromUrl(form);

  const run = () => {
    toggleVisibility(spec.fields, form);
    const values = read(spec.fields, form);
    try {
      last = spec.compute(values);
      render(last, out);
    } catch (err) {
      console.error(err);
      out.results.innerHTML = `<p class="calc-error">Check the values above — something doesn't add up.</p>`;
    }
    saveToUrl(spec.fields, form);
  };

  form.addEventListener('input', run);
  form.addEventListener('change', run);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    run();
  });
  form.addEventListener('reset', () => setTimeout(run, 0));

  root.querySelector('[data-action="copy-list"]')?.addEventListener('click', (e) => {
    if (last) copy(shoppingListText(last), e.currentTarget as HTMLButtonElement);
  });
  root.querySelector('[data-action="copy-link"]')?.addEventListener('click', (e) => {
    copy(location.href, e.currentTarget as HTMLButtonElement);
  });
  root.querySelector('[data-action="print"]')?.addEventListener('click', () => window.print());

  run();
}

function read(fields: Field[], form: HTMLFormElement): Values {
  const v: Values = {};
  for (const f of fields) {
    const el = form.elements.namedItem(f.id) as HTMLInputElement | HTMLSelectElement | null;
    if (!el) continue;
    if (f.type === 'select') {
      v[f.id] = el.value;
    } else {
      const raw = parseFloat(el.value);
      const num = Number.isFinite(raw) ? raw : 0;
      const unitEl = form.elements.namedItem(f.id + UNIT_SUFFIX) as HTMLSelectElement | null;
      v[f.id] = toBase(f.dim as Dim, num, unitEl?.value ?? f.unit);
    }
  }
  return v;
}

function toggleVisibility(fields: Field[], form: HTMLFormElement) {
  for (const f of fields) {
    if (!f.showIf) continue;
    const ctrl = form.elements.namedItem(f.showIf.field) as HTMLSelectElement | null;
    const wrap = form.querySelector<HTMLElement>(`[data-field="${f.id}"]`);
    if (ctrl && wrap) wrap.hidden = !f.showIf.in.includes(ctrl.value);
  }
}

function render(o: Output, out: Record<string, HTMLElement>) {
  out.results.innerHTML = o.results
    .map((r) => {
      const [main, ...alts] = formatResult(r);
      return `<div class="result${r.primary ? ' result--primary' : ''}">
        <div class="result__label">${escapeHtml(r.label)}</div>
        <div class="result__value">${escapeHtml(main)}</div>
        ${alts.length ? `<div class="result__alt">${alts.map(escapeHtml).join(' · ')}</div>` : ''}
        ${r.note ? `<div class="result__note">${escapeHtml(r.note)}</div>` : ''}
      </div>`;
    })
    .join('');

  const mats = o.materials ?? [];
  out.materials.closest<HTMLElement>('[data-materials-wrap]')!.hidden = mats.length === 0;
  if (mats.length) {
    const total = mats.reduce((s, m) => s + (m.cost ?? 0), 0);
    out.materials.innerHTML = `<table class="shopping">
      <thead><tr><th>Item</th><th class="num">Qty</th><th class="num">Est. cost</th></tr></thead>
      <tbody>${mats
        .map(
          (m) => `<tr><td>${escapeHtml(m.item)}${m.note ? `<small>${escapeHtml(m.note)}</small>` : ''}</td>
          <td class="num">${fmt(m.qty, 2)} ${escapeHtml(m.unit)}</td>
          <td class="num">${m.cost != null ? money(m.cost) : '—'}</td></tr>`,
        )
        .join('')}</tbody>
      ${total ? `<tfoot><tr><th colspan="2">Estimated total</th><th class="num">${money(total)}</th></tr></tfoot>` : ''}
    </table>`;
  }

  const warns = o.warnings ?? [];
  out.warnings.innerHTML = warns
    .map((w) => `<div class="notice notice--${w.level}" role="status">${escapeHtml(w.text)}</div>`)
    .join('');

  out.diagram.hidden = !o.diagram;
  if (o.diagram) out.diagram.innerHTML = o.diagram;
}

export function shoppingListText(o: Output): string {
  const lines = (o.materials ?? []).map(
    (m) => `- ${m.item}: ${fmt(m.qty, 2)} ${m.unit}${m.cost != null ? ` (~${money(m.cost)})` : ''}`,
  );
  const total = (o.materials ?? []).reduce((s, m) => s + (m.cost ?? 0), 0);
  if (total) lines.push(`Estimated total: ${money(total)}`);
  lines.push('', location.href);
  return `Shopping list — ${document.title}\n${lines.join('\n')}`;
}

async function copy(text: string, btn: HTMLButtonElement) {
  const original = btn.textContent;
  try {
    await navigator.clipboard.writeText(text);
    btn.textContent = 'Copied!';
  } catch {
    btn.textContent = 'Copy failed';
  }
  setTimeout(() => (btn.textContent = original), 1600);
}

function saveToUrl(fields: Field[], form: HTMLFormElement) {
  const params = new URLSearchParams();
  for (const f of fields) {
    const el = form.elements.namedItem(f.id) as HTMLInputElement | HTMLSelectElement | null;
    if (!el) continue;
    if (el.value !== String(f.default)) params.set(f.id, el.value);
    if (f.type === 'number') {
      const u = form.elements.namedItem(f.id + UNIT_SUFFIX) as HTMLSelectElement | null;
      if (u && f.unit && u.value !== f.unit) params.set(f.id + UNIT_SUFFIX, u.value);
    }
  }
  const qs = params.toString();
  history.replaceState(null, '', qs ? `?${qs}` : location.pathname);
}

function restoreFromUrl(form: HTMLFormElement) {
  for (const [k, val] of new URLSearchParams(location.search)) {
    const el = form.elements.namedItem(k) as HTMLInputElement | HTMLSelectElement | null;
    if (!el) continue;
    if (el instanceof HTMLSelectElement && ![...el.options].some((o) => o.value === val)) continue;
    el.value = val;
  }
}
