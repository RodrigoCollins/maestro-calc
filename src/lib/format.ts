import { DEFAULT_DISPLAY, fromBase, unitShort, type Dim } from './units';
import type { ResultItem } from './types';

export function fmt(n: number, decimals = 2): string {
  if (!Number.isFinite(n)) return '—';
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: decimals, minimumFractionDigits: 0 }).format(n);
}

export function money(n: number): string {
  if (!Number.isFinite(n)) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: n >= 100 ? 0 : 2 }).format(n);
}

/** Format a base-unit value in each of its display units: ["3.7 cu yd", "100 cu ft", "2.83 m³"]. */
export function formatResult(r: ResultItem): string[] {
  if (r.dim === 'money') return [money(r.value)];
  if (r.dim === 'percent') return [`${fmt(r.value, r.decimals ?? 1)}%`];
  if (r.dim === 'angle') return [`${fmt(r.value, r.decimals ?? 1)}°`];
  if (r.dim === 'count' || r.dim === 'number') return [fmt(r.value, r.decimals ?? 0)];
  const units = r.units ?? DEFAULT_DISPLAY[r.dim as Dim] ?? [];
  return units.map((u) => `${fmt(fromBase(r.dim, r.value, u), r.decimals ?? 2)} ${unitShort(r.dim, u)}`);
}

/** Feet → 5' 3-1/2" style, rounded to the nearest 1/16". */
export function feetInches(ft: number): string {
  if (!Number.isFinite(ft)) return '—';
  const sixteenths = Math.round(ft * 12 * 16);
  const feet = Math.floor(sixteenths / (12 * 16));
  let rem = sixteenths - feet * 12 * 16;
  const inches = Math.floor(rem / 16);
  rem -= inches * 16;
  let frac = '';
  if (rem) {
    let num = rem;
    let den = 16;
    while (num % 2 === 0) {
      num /= 2;
      den /= 2;
    }
    frac = `-${num}/${den}`;
  }
  return feet ? `${feet}' ${inches}${frac}"` : `${inches}${frac}"`;
}

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}
