import type { Dim } from './units';

interface FieldBase {
  id: string;
  label: string;
  help?: string;
  /** Only show this field when another field has one of these values. */
  showIf?: { field: string; in: string[] };
}

export interface NumberField extends FieldBase {
  type: 'number';
  dim: Dim;
  default: number;
  /** Unit the default is expressed in, and the unit preselected in the dropdown. */
  unit?: string;
  /** Units offered in the dropdown (defaults to every unit of the dimension). */
  units?: string[];
  min?: number;
  max?: number;
  step?: number;
}

export interface SelectField extends FieldBase {
  type: 'select';
  default: string;
  options: { value: string; label: string }[];
}

export type Field = NumberField | SelectField;

/** Values handed to compute(): numbers already converted to base units, selects as strings. */
export type Values = Record<string, number | string>;

export interface ResultItem {
  label: string;
  value: number;
  dim: Dim;
  /** Display units, first is the main one. Defaults per dimension. */
  units?: string[];
  decimals?: number;
  primary?: boolean;
  note?: string;
}

export interface MaterialLine {
  item: string;
  qty: number;
  /** Purchasable unit, e.g. "bags", "boards", "cu yd". */
  unit: string;
  /** Estimated cost in USD, if a price is known. */
  cost?: number;
  note?: string;
}

export interface Warning {
  level: 'info' | 'warn' | 'danger';
  text: string;
}

export interface Output {
  results: ResultItem[];
  materials?: MaterialLine[];
  warnings?: Warning[];
  /** Inline SVG markup for the live diagram. */
  diagram?: string;
}

export interface CalcSpec {
  slug: string;
  fields: Field[];
  compute(v: Values): Output;
}

/** Page-level metadata, kept separate so listing pages don't bundle compute code. */
export interface CalcMeta {
  slug: string;
  title: string;
  h1: string;
  description: string;
  category: CategoryId;
  keywords: string[];
  related: string[];
  updated: string;
}

export type CategoryId = 'concrete' | 'landscaping' | 'roofing' | 'carpentry' | 'interior' | 'measurement';
