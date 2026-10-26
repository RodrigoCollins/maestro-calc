# Design: Calculator Core — Generic Web Layer for Every Calculator Page

This design implements `proposal.md` (D1–D13 are binding) against the delta specs in `specs/` (`calculator-web-core` CWC1–37, `calculator-page` CP54–58, `site-quality` SQ29–32). **The specs are the behavioural contract** and win over any value written here. Revision round 1 applies `design-review.md` (M-1 to M-6, m-1 to m-11); the spec deltas carry the R1–R7 fixes listed at the end.

## Answer first

- A typed, language-free **page module** per calculator (`apps/web/src/calculator/<id>/page.ts`, built with `definePage`) holds only data and optional **slots**. Each slot's code lives in its own file under `calculator/slots/`, so a module that does not declare a slot imports none of its code.
- One generic **controller** (`controllerOf(module)`), one generic **mount** (`mount(module)`) and one server-only **page-view builder** (`pageViewOf`) replace the concrete copies. Concrete becomes module #1; rectangle-area is the headless module #2.
- **Generic code is written once over `AnyPageModule`** and exports one precise overload in `C`, the pattern of `encode`/`decode` (`packages/core/src/url/codec.ts:74-83`, `:219-226`). No type assertion anywhere.
- **Rename first, then generalise in place.** 18 slices in 3 groups (G1 6, G2 8, G3 4), about **4,400 changed lines** measured with `git diff --shortstat` (rename detection on). Every slice is at most 400 lines and leaves `main` green.
- **The D13 proof is unit level** (orchestrator decision): the rectangle-area view rendered through the real components with the Astro container, and its proof entry walked by the entry-graph contract. No proof build, artifact or CI edit.
- **No change to `packages/core`, `packages/data` or `packages/i18n`.** No mutation shard, `RELEASED`, URL key or catalog key changes.

## Technical approach

1. **Rename, then generalise.** Git detects a rename when the two ends of the measured range are at least 50 % similar (`diff.renames` is unset, so detection is on; `git show --shortstat 4f20847` shows four renames at 31+/31−). So a rename lands in its own slice, where the file changes by less than half (the move plus import fixes). The generalising edits follow in later slices, in place. A rename never shares a slice with the edits that generalise the renamed file; it may share a slice with new files.
2. **Tests move with their code.** `concrete-controller.test.ts`, `concrete-present.test.ts`, `concrete-shapes.test.ts` and `lib/concrete-page.test.ts` are renamed with their sources and become module #1's tests. Their assertions do not change; only accessors and imports are re-pointed. That is the slice-by-slice proof that the behaviour is preserved.
3. **Generic first, from the definition.** The generic core takes these from the core descriptors and `DisplayHint`: texts per input kind, select options, input modes, hints and placeholders, bounds, the result rows, money formatting and the URL codec. Slots carry only what the definition cannot say: the fields shown per select option, the stepper step, the shopping lines, the cost-to-price pairs, the answer values and the primary output per unit system.

## Architecture decisions

| # | Decision | Rejected | Rationale |
|---|---|---|---|
| K1 | Rename-first sequence (approach 1). Each rename is its own slice; generalising edits follow in place | Strangler (create generic files, shrink the old ones); rename plus rewrite in one slice | The strangler pays moves twice (delete plus add into `texts.ts`, `views.ts`, `client/dom.ts`) and leaves dual models (`Panel` next to `PanelView`). A rewrite in the rename slice drops similarity below 50 %, so it counts as delete plus add. Matches the proposal ("Move code before rewriting it") |
| K2 | `definePage({ calculator, primary?, choices?, steppers?, shopping?, costs?, answer? })`; `id` is `calculator.id`, typed `C['id']`, the id of a registry calculator | A class per calculator; declarative JSON; `id: CalculatorPageId` | Plain data plus slot objects tree-shake. Rectangle-area is `PAGELESS`, so the page-id type belongs to the tables (`PAGES`, `SCRIPTS`, `E2E`), not to the module (R1) |
| K3 | Slot code lives in `calculator/slots/{choices,steppers,shopping,costs,answer}.ts`. The controller and the mount only call `module.<slot>?.method(...)` and never import a slot file | Slot logic in the controller behind flags | CWC4: the rectangle-area proof entry reaches no `calculator/slots/` file. The entry-graph test checks this by path |
| K4 | Every `select` input is a choice group, taken from the definition (buttons, `aria-pressed`, the `choice` event). The `choices` slot only adds the fields each option shows (concrete: `shape`; `bag` needs no entry) | A slot for every select | Gravel's material select needs no slot code (R2). **Extension path (m-7):** every select renders as a button group; a long material list may later want another presentation, added without changing the hook contract |
| K5 | Rows come from `DisplayHint`: `outputText(descriptor, value)`. A decimal hint formats in its unit (`findUnit`) at `places`, grouped; money uses `moneyText`. Rows are the outputs that have a display hint, in declaration order. Money outputs show only through the cost slot | A `figures` function per module | Concrete's 2-place volume text and rectangle-area's areas come from core data |
| K6 | Primary output: `module.primary?.[system]`, else the output with `role: 'primary'`. Its template has the message name `<measure>.<display.unit>` (`volume.yd3`) and the catalog key `calc.<id>.page.<outputKey>`. Without that key the sentence is the bare value | A unit-system tag in core (D3) | Template names in the HTML stay byte-identical; no catalog key is added |
| K7 | Help text is optional, under `calc.<id>.page.<key>Help`. The controller learns which fields have help from `Environment.helps`, which the mount fills from the `#calc-<key>-help` elements | `key === 'waste'`; a help list in the module | Generic; the client stays free of message text |
| K8 | `stepperSlot(calculator, { waste: Rational.of(5) })` accepts percent inputs only, throws when the descriptor lacks `min` or `max`, and clamps at them (D5) | Core defaults copied; count steppers | `boundsOf` is not exported (D3). **Extension path (m-7):** a count stepper (Paint coats) widens `next` to `number` |
| K9 | Reserved height (D12): `choiceSlot` sets `rows` to its largest visibility set. The area renders `<div class="calc-choice-area" data-reserved="<select>" style="--calc-rows:4">` (attributes in that order). CSS: `min-height: calc(var(--calc-rows, 1) * 6rem + (var(--calc-rows, 1) - 1) * var(--space-3))`, pinned by `styles.contract.test.ts` (m-6) | A CSS constant checked by a test; `data-rows` rules | Any row count works. The fallback keeps a missing attribute from collapsing the area. CSP allows inline styles (`_headers:10`). Same pixels as `4 * 6rem + 3 * gap` |
| K10 | **No type assertion in generic code.** Erased implementation over `AnyPageModule` plus one typed overload in `C` (M-1). Values are narrowed by descriptor kind (`switch (input.kind)`, `isQuantity`, `instanceof Rational`). Keys are `string` inside implementations, so no key guard and no `records.ts` | `as Record<K, V>`; a `keyed` guard at every engine call; typing over the parts `Calculator<string, I, O, W>` | `StateOf<C>` cannot be produced inside `f<C>` (`TS2322`: the engine returns the constraint's state), and `no-unsafe-type-assertion` covers `apps/web/src/**`. The judge's probe of this shape compiled with `tsc` exit 0. Runtime checks stay only where a record comes from data: slot factories (options, kinds, bounds), the shopping match, the builder's catalog keys |
| K11 | `AnyCalculator` is a web-local alias in `calculator/page-module.ts`, built from exported core types | Export core's alias (`descriptors.ts:205`) | Core's `calculator/index.ts` does not export it; exporting is a core change (D3, mutation identity). **Assignability holds:** `PageModule<typeof concrete>` and `PageModule<typeof rectangleArea>` assign to `AnyPageModule` (judge's probe); `page-module.test-d.ts` keeps that proof |
| K12 | The generic mount carries small data-driven DOM loops (choices, steppers, shopping lines, costs) that run zero times over an absent slot. Throwing lookups (`find`, `findAs`) are used only for page-level hooks every module has; slot elements are looked up as lists (`findAll`). Slot *logic* stays in `calculator/slots/` | A table of DOM slots per entry | Under 1 KB and no second wiring list. CWC33 checks the lookup rule against the slot-free markup. **Client bytes (m-4):** the page-copy key suffixes (`shoppingLine`, `priceHint`, `readyMixNote`) sit in the client-importable module although only the server reads them; tens of bytes and no message text, so intentional |
| K13 | A slice that deletes or renames a path or symbol named in the AGENTS.md recipe also rewrites that sentence and the matching `docs.contract.test.ts` row (S1, S8, S12, S13, S15). S18 rewrites the whole recipe | Fix the docs only at the end | `docs.contract` fails on recipe paths that do not exist, and a stale sentence on `main` misleads the next author |
| K14 | Per-calculator web code lives in `apps/web/src/calculator/<id>/` (`page.ts`; for concrete also `shapes.ts`, `present.ts` and the tests), mirroring `packages/core/src/calculators/<id>/`. Generic code is `calculator/*.ts` and `calculator/slots/*.ts` (M-5) | Flat `calculator/<id>-page.ts` beside the generic files | Scales past 100 calculators; "generic" is a path rule (everything under `calculator/` except `calculator/<registry id>/`), so CWC9, CWC34 and the client graph need no name list; no two files share a name |
| K15 | Shopping lines are declared by `material` and matched to the engine's lines by `materialId`, never by position. A mismatch throws `PageModuleError('SHOPPING_LINES')` at controller creation (default run) and on any later run (M-4) | Match by index; let the engine's count drive the markup | The server markup holds a fixed number of lines, so the line count must be static for CLS (CP44). The engine may order lines its own way (calculators 6–10) |
| K16 | D13 at unit level (orchestrator decision, M-2): container render of the rectangle-area view plus the entry-graph proof; see "Astro side" | A proof build in the browser job; a `build:proof` script and a `web-proof` artifact | The browser job installs only `tooling/site-browser` (`ci.yml:286-323`), so Astro is not there; a proof build would need an extra Astro build in `verify` shipped as a CI artifact, for a page that is never routed. The live Square footage page of the next change is the real-browser proof at no extra cost |

## Module map

### Before → after

R marks a pure rename (import fixes only) in its own slice; the generalising edits follow in the slices listed.

| Before | After | Slices |
|---|---|---|
| `calculator/concrete-controller.ts` (529) | R `calculator/controller.ts` | R S1; generalised S4, S5 |
| `calculator/concrete-controller.test.ts` (577) | R `calculator/concrete/controller.test.ts` | R S1; accessors S4, S5 |
| `calculator/concrete-shapes.ts` + test | R `calculator/concrete/shapes.ts` + test | R S1 |
| `calculator/concrete-present.ts` + test | R `calculator/concrete/present.ts` + test: `bagFills`, `answerValues` | R S1; edited S3; `figuresOf` removed S10 |
| `calculator/concrete-layout.ts` (25) + test (63) | id helpers → `calculator/ids.ts` (S1); rows → `slots/choices.ts`; file deleted | S1, S4 |
| `calculator/present.ts` | adds `DASH`, `priceText` (moved), `outputText` | S4 |
| — | `calculator/page-module.ts`, `slots/*.ts`, `calculator/concrete/page.ts` | S2, S3 |
| — | `calculator/texts.ts` | S4 |
| — | `calculator/rectangle-area/page.ts` + `controller.test.ts`; `contract/generic-code.contract.test.ts` | S6 |
| — | `calculator/form-layout.ts` (server-only, imported by `lib/page-view.ts` alone) | S8 |
| `lib/concrete-page.ts` (219) + test | R `lib/page-view.ts` + test | R S8; generic S9–S12 |
| — | `lib/pages.ts` (`PAGES`) | S12 |
| `components/calculator/model.ts` (`Concrete*` types) | generic `FormView`, `ResultView`, `CalculatorPageView` | S9–S11 |
| `views/CalculatorView.astro` calls `concreteView` | `pageView(id, locale)` + `SCRIPTS` | S12 |
| `client/concrete-mount.ts` (295) | R `client/mount.ts` | R S13; generic S14 |
| `client/entries/concrete.ts` | `mount(concretePage)` | S14 |
| `tooling/site-browser/e2e/concrete-pages.ts` (`CONCRETE_PAGES`) | concrete's `E2eSpec`; table in `e2e/calculator-pages.ts` | S15 |
| `contract/__testing__/client-graph.ts` (`concrete` fixed) | `graphViolations(modules, ownId)` | S17 |
| — | `contract/__testing__/rectangle-area-entry.ts`, `contract/rectangle-area-proof.contract.test.ts` | S17 |

### Rules for the client bundle

- **CP42:** the client imports nothing from `lib/` except `lib/<id>.ts` (the composition root), and no catalog.
- **CP48:** entries import their page module and `client/mount.ts` only. The client graph of entry `<own>` also forbids `/apps/web/src/calculator/(?!<own>\/|slots\/)[^/]+\//`, that is another calculator's web folder (M-5).
- **Server only:** `lib/page-view.ts`, `lib/pages.ts` and `calculator/form-layout.ts`. `lib/page-view.ts` joins the 100 % coverage gate by its own entry in the root `vitest.config.ts` (m-3; it stays in `lib/`, as D11 says).

## Interfaces / contracts

```ts
// calculator/page-module.ts
import type { Calculator, InputDescriptor, InputsOf, OutputDescriptor, Rational, RunResult,
  ShoppingLine, UnitSystem } from '@maestro-calc/core';

/** Core declares the same alias without exporting it (descriptors.ts:205); D3 keeps core as is. */
export type AnyCalculator = Calculator<string, readonly InputDescriptor[],
  readonly OutputDescriptor[], readonly string[]>;

type Input<C extends AnyCalculator> = C['inputs'][number];
export type SelectKey<C extends AnyCalculator> = Extract<Input<C>, { readonly kind: 'select' }>['key'];
export type TextKey<C extends AnyCalculator> =
  Extract<Input<C>, { readonly kind: 'length' | 'count' | 'percent' | 'money' }>['key'];
export type PercentKey<C extends AnyCalculator> = Extract<Input<C>, { readonly kind: 'percent' }>['key'];
export type MoneyKey<C extends AnyCalculator> = Extract<Input<C>, { readonly kind: 'money' }>['key'];
export type OutputKey<C extends AnyCalculator> = C['outputs'][number]['key'];
export type StateOf<C extends AnyCalculator> = InputsOf<C['inputs']>;
export type ResultOf<C extends AnyCalculator> = RunResult<C['outputs'], C['warnings'][number]>;

/** What every slot is given. `choices` may be ahead of `valid` while a field is invalid. */
export interface Moment<C extends AnyCalculator> {
  readonly system: UnitSystem;
  readonly choices: Readonly<Record<SelectKey<C>, string>>;
  readonly valid: StateOf<C>;
  readonly result: ResultOf<C> | undefined;
}
export type Ready<C extends AnyCalculator> = Moment<C> & { readonly result: ResultOf<C> };

// Slot members are methods: PageModule<typeof concrete> assigns to AnyPageModule (K11).
export interface ChoiceGroup<C extends AnyCalculator> {
  readonly select: SelectKey<C>;
  readonly driven: readonly TextKey<C>[];   // definition order
  readonly rows: number;                     // largest visibility set (D12)
  shown(option: string): readonly TextKey<C>[];
}
export interface ChoiceSlot<C extends AnyCalculator> { readonly groups: readonly ChoiceGroup<C>[] }
export interface StepperSlot<C extends AnyCalculator> {
  readonly keys: readonly PercentKey<C>[];
  next(key: PercentKey<C>, current: Rational, direction: 'less' | 'more'): Rational;
}
export interface ShoppingLineSpec<C extends AnyCalculator> {
  readonly material: string;                 // the engine line's `materialId` (M-4)
  readonly label: string; readonly fill: string;               // page-key suffix, placeholder
  readonly note?: { readonly key: string; readonly fill: string };
  parts(moment: Moment<C>): { readonly unit: string; readonly fills: Readonly<Record<string, string>> };
}
export interface ShoppingLineView {
  readonly material: string; readonly unit: string;           // `data-shopping` value
  readonly qty: string;                                        // groupedInteger(line.qty), or DASH
  readonly fills: Readonly<Record<string, string>>;
}
export interface ShoppingSlot<C extends AnyCalculator> {
  readonly lines: readonly ShoppingLineSpec<C>[];
  view(moment: Moment<C>): readonly ShoppingLineView[];        // declared order, always lines.length
}
export interface CostSlot<C extends AnyCalculator> {
  readonly rows: readonly { readonly output: OutputKey<C>; readonly price: MoneyKey<C> }[];
  readonly hint: string; readonly note?: string;               // page-key suffixes
  visible(valid: StateOf<C>): Readonly<Record<OutputKey<C>, boolean>>;
}
export interface AnswerSlot<C extends AnyCalculator> {
  readonly templates: readonly string[];     // `answer.<option>` per option of `by`, else `answer`
  template(valid: StateOf<C>): string;
  values(moment: Ready<C>, primary: string): Readonly<Record<string, string>>;
}
export interface PageModule<C extends AnyCalculator> {
  readonly id: C['id'];                      // a registry calculator id, from the definition
  readonly calculator: C;
  readonly primary?: Readonly<Record<UnitSystem, OutputKey<C>>>;
  readonly choices?: ChoiceSlot<C>; readonly steppers?: StepperSlot<C>;
  readonly shopping?: ShoppingSlot<C>; readonly costs?: CostSlot<C>; readonly answer?: AnswerSlot<C>;
}
export type PageSpec<C extends AnyCalculator> = Omit<PageModule<C>, 'id'>;
export type AnyPageModule = PageModule<AnyCalculator>;

export type PageModuleCode = 'CHOICE_OPTIONS' | 'STEPPER_BOUNDS' | 'COST_KINDS'
  | 'SHOPPING_LINES' | 'FORM_ORDER' | 'PAGE_KEY';
export class PageModuleError extends Error {   // name 'PageModuleError'; cause { id, ... }
  constructor(readonly code: PageModuleCode, options: { readonly cause: object });
}

export function definePage<C extends AnyCalculator>(spec: PageSpec<C>): PageModule<C>;
export function definePage(spec: PageSpec<AnyCalculator>): AnyPageModule { /* freeze, id */ }

/**
 * The engine lines in declared order. Throws SHOPPING_LINES unless the engine has exactly one
 * line per declared material (any order, no extra, no duplicate) and, when `units` is given,
 * each line's `purchaseUnit` equals the declared unit. Lives here, not in slots/, because the
 * controller runs it for a module with no shopping slot too (declared = []).
 */
export const shoppingLinesOf: (id: string, declared: readonly string[],
  engine: readonly ShoppingLine[], units?: readonly string[]) => readonly ShoppingLine[];
```

**The overload rule (M-1, K10).** Every generic export that returns something typed in `C` has exactly one public overload in `C` and one implementation over `AnyCalculator`/`AnyPageModule`. Exports that return nothing typed in `C` take `AnyPageModule` directly (assignability, K11).

```ts
// calculator/controller.ts
export function controllerOf<C extends AnyCalculator>(module: PageModule<C>): Controller<C>;
export function controllerOf(module: AnyPageModule): Controller<AnyCalculator> {
  // creation: run the defaults once and call shoppingLinesOf (K15), so a mismatch fails at start
}
// calculator/slots/choices.ts (steppers, shopping, costs, answer follow the same shape)
export function choiceSlot<C extends AnyCalculator>(
  calculator: C, groups: readonly { readonly select: SelectKey<C>;
    readonly shows: Readonly<Record<string, readonly TextKey<C>[]>> }[]): ChoiceSlot<C>;
export function choiceSlot(calculator: AnyCalculator, groups: readonly { readonly select: string;
  readonly shows: Readonly<Record<string, readonly string[]>> }[]): ChoiceSlot<AnyCalculator> { … }
// client/mount.ts and lib/page-view.ts: no C in the result, no overload
export const mount: (module: AnyPageModule) => void;
export const pageViewOf: (module: AnyPageModule, locale: Locale, catalog: Messages) => CalculatorPageView;
```

Every slot factory takes the calculator first, so `C` is inferred from it.

### Signatures by file

| File | Exports |
|---|---|
| `calculator/ids.ts` | `inputId`, `hintId`, `helpId`, `errorId`, `labelId`: `(key: string) => string` (`calc-<key>`, `-hint`, `-help`, `-error`, `-label`) |
| `calculator/present.ts` (added) | `DASH`; `priceText(money: Money): string`; `outputText(output: OutputDescriptor, value: Money \| Quantity<DimensionName>): string` |
| `calculator/texts.ts` | overloaded `textKeysOf<C>(c: C): readonly TextKey<C>[]` and `textsOf<C>(c: C, state: StateOf<C>, system): Readonly<Record<TextKey<C>, string>>`; `textOf(input: InputDescriptor, value: unknown, system): string` (length → `fieldText`, count → `String`, percent → `percentText`, money → `priceText`; select or boolean throws); `rawTextOf(input, text): string \| undefined` (empty money → `undefined`); `baseOf(c: AnyCalculator, valid): Record<string, unknown>` (percents as text); `keptText(input, text, system): string` |
| `calculator/slots/choices.ts` | `choiceSlot` (above). Throws `CHOICE_OPTIONS` when an option lacks an entry or a key is not a text input |
| `calculator/slots/steppers.ts` | `stepperSlot<C>(c: C, steps: Readonly<Partial<Record<PercentKey<C>, Rational>>>): StepperSlot<C>`; throws `STEPPER_BOUNDS` |
| `calculator/slots/shopping.ts` | `shoppingSlot<C>(c: C, lines: readonly ShoppingLineSpec<C>[]): ShoppingSlot<C>`. `view` calls `shoppingLinesOf` with the declared units from `parts`, writes `qty` as `groupedInteger(line.qty)` (`concrete-present.ts:108` today), or `DASH` without a result |
| `calculator/slots/costs.ts` | `costSlot<C>(c: C, rows: CostSlot<C>['rows'], copy: { hint: string; note?: string }): CostSlot<C>`; throws `COST_KINDS` when an output or price is not money |
| `calculator/slots/answer.ts` | `answerSlot<C>(c: C, spec: { by?: SelectKey<C>; values: AnswerSlot<C>['values'] }): AnswerSlot<C>` |
| `calculator/controller.ts` | `Messages`; `Environment { messages; origin; path; switchPath; helps: ReadonlySet<string> }`; `UiEvent<C>`, `FieldView` (adds `hidden`), `PanelView`, `State<C>`, `View<C>`, `Output<C>`, `Controller<C> { start(env, search): Output<C>; applyEvent(env, state, event): Output<C> }`; `controllerOf` (above); `copyAddress`, `copyOutcome`, `required`, `mustBeOk` (unchanged) |
| `calculator/form-layout.ts` | `FormItem = { kind: 'choice'; select: string; area?: { fields: readonly string[]; rows: number } } \| { kind: 'field'; key: string; stepper: boolean }`; `formOf(m: AnyPageModule): readonly FormItem[]`. Throws `FORM_ORDER` when driven fields do not directly follow their select, or on a boolean input |
| `calculator/concrete/page.ts` | `concretePage: PageModule<typeof concrete>` |
| `calculator/rectangle-area/page.ts` | `rectangleAreaPage = definePage({ calculator: rectangleArea })` |
| `client/mount.ts` | `mount` (above) |
| `lib/page-view.ts` (server) | `pageViewOf` (above); throws `PAGE_KEY` naming the key when a required page key or hint is missing |
| `lib/pages.ts` (server) | `PageEntry { module: AnyPageModule; catalogs: Readonly<Record<Locale, Messages>> }`; `PAGES` (`satisfies Record<CalculatorPageId, PageEntry>`); `pageView(id: CalculatorPageId, locale): CalculatorPageView` |

`View<C>` holds `{ system, choices: Record<SelectKey<C>, string>, visible: readonly TextKey<C>[], fields: Record<TextKey<C>, FieldView>, answer: string | undefined, panel: PanelView, notice, switchHref }`. `PanelView` holds `{ primary: { key, before, value, after }, figures: Record<string, string>, costs: Record<string, boolean>, shopping: readonly ShoppingLineView[] }`. `UiEvent<C>` is `text` (`key: TextKey<C>`), `choice`, `step` or `units`; a choice or step event the module does not support returns the state unchanged.

### Concrete module #1

```ts
export const concretePage = definePage({
  calculator: concrete,
  primary: { imperial: 'volumeYd3', metric: 'volumeM3' },
  choices: choiceSlot(concrete, [{ select: 'shape', shows: SHAPE_FIELDS }]),
  steppers: stepperSlot(concrete, { waste: Rational.of(5) }),
  shopping: shoppingSlot(concrete, [{
    material: 'concrete-mix', label: 'shoppingLine', fill: 'bagLb',
    note: { key: 'bagYield', fill: 'yield' },
    parts: (m) => ({ unit: `bag-${m.choices.bag}`, fills: bagFills(m, CONCRETE_MIX_YIELDS) }),
  }]),
  costs: costSlot(concrete, [{ output: 'bagCost', price: 'bagPrice' },
    { output: 'readyMixCost', price: 'readyMixPrice' }], { hint: 'priceHint', note: 'readyMixNote' }),
  answer: answerSlot(concrete, { by: 'shape', values: answerValues }),  // keeps its switch per shape
});
```

`'concrete-mix'` is the `materialId` core's concrete returns (`concrete.ts:229`); rectangle-area returns `shopping: []` and declares no line, so `shoppingLinesOf` passes for both.

### Page-copy key convention (server builder)

Every concrete key below already exists, so no catalog changes.

| Use | Key | Needed when |
|---|---|---|
| Primary sentence | `calc.<id>.page.<outputKey>` | optional (bare value otherwise) |
| Answer | `calc.<id>.page.answer.<option>` or `calc.<id>.page.answer` | answer slot |
| Help | `calc.<id>.page.<key>Help` | optional |
| Stepper buttons | `calc.<id>.page.<key>Less` / `<key>More` | stepper slot (throws if missing) |
| Shopping label / note | `calc.<id>.page.<label>` / `<note.key>` | shopping slot |
| Cost hint / note | `calc.<id>.page.<hint>` / `<note>` | cost slot |
| No-JS example | `calc.<id>.page.example` | optional; with it the note is `<noscript> <example>`, without it the bare note with no trailing space (R7, m-10) |
| Unit hints (m-2) | `site.calculator.hint<Unit>` (`hintFt`) | one message per distinct `defaultUnit` of the length inputs in input order, then per distinct `metricDefaultUnit` in input order; concrete gives `ft, in, m, cm`, the bytes of today. A missing key throws `PAGE_KEY` naming the unit (`yd` and `mm` have none) |

The builder (not the controller) also derives the input modes and the money placeholder (m-10).

## Generic controller

| Concern | Rule |
|---|---|
| Texts | `textsOf`: one loop over `calculator.inputs` by kind, replacing the three hand lists (`concrete-controller.ts:189-208`, `:311-327`, `:456-472`) |
| Raw record | `{ ...baseOf(valid), ...visibleTexts, ...choices }`. Visible texts go through `rawTextOf`, so an empty money field is an explicit `undefined` key (DR-11). A hidden field is read from `valid`; a hidden percent is passed as text |
| Visible | `visibleOf`: the fields each choice group shows for its option, plus all undriven fields. `FieldView.hidden` is set for driven fields only |
| Evaluation | `validate`, then `run` (no second formula). Every result goes through `shoppingLinesOf` (K15) |
| URL writes | `encode` only on a valid state; replace-only. A valid write clears the link notice. `start` decodes and never writes |
| Unit toggle | each text is parsed in the old system with `parsedWith`, re-written with `textOf`, or kept with `keptText` |
| Stepper | current value: the typed one when valid, else the last valid. `steppers.next` clamps at the descriptor bounds; an equal value returns the state unchanged with no write |
| Primary | `primary[system]`, else the `role: 'primary'` output; its row is hidden |

**Identical for concrete:** texts, raw record keys, write and query order, notices, dashes while invalid (`bagLb` follows the pressed choice; `yield` and the quantity show `—`), answer sentences, `aria-describedby` (error while invalid, else hint, else help), copy address and outcome. `calculator/concrete/controller.test.ts` proves it with unchanged assertions; only accessors move (`panel.volumes.x` → `panel.figures.x`, `panel.bags` → `panel.shopping[0]?.qty`, `view.shape` → `view.choices.shape`, the event helpers).

## DOM contract (D4, D10)

| Today | After |
|---|---|
| `data-shape-button="<v>"` | `data-choice="shape" data-value="<v>"` |
| `data-bag="<v>"` | `data-choice="bag" data-value="<v>"` |
| `data-waste-step="<d>"` | `data-step="waste" data-direction="<d>"` |
| `data-bag-lb` | `data-fill="bagLb"` |
| `data-yield` | `data-fill="yield"` |
| `data-bag-yield` | `data-line-note="0"` |
| `class="calc-shape-area"` | `class="calc-choice-area"` plus `style="--calc-rows:4"` after `data-reserved` |
| (none) | `data-line="0"` on `p.calc-shopping` |

**Unchanged hooks:** `data-unit`, `data-copy`, `data-copy-status`, `data-output`, `data-primary` (with `data-primary-before`, `data-primary-after`), `data-shopping`, `data-cost-row`, `data-hint-row`, `data-price-hint`, `data-reserved` (the choice area keeps `data-reserved="shape"`), `data-answer`, `data-not-running`, `data-messages`, `data-calculator`; the ids `calc-<key>`, `-hint`, `-help`, `-error`, `calc-<select>-label`; `aria-pressed`. `ResultPanel` maps the shopping lines with no wrapper element, so one line's markup is today's plus `data-line`.

**The 57 references in 11 files** (verified with `rg`): `e2e/calculator.spec.ts` 22, `e2e/a11y.spec.ts` 3, `e2e/csp.spec.ts` 1, `CalculatorForm.test.ts` 5, `ShoppingLine.test.ts` 3, `CalculatorBody.test.ts` 3, `styles.contract.test.ts` 3, `concrete-mount.ts` 8, `CalculatorForm.astro` 5, `ShoppingLine.astro` 3, `calculator.css` 1. **Rule:** the rename, every selector edit and the CSS change ship in one slice (S7); assertions do not change (SQ31).

## Astro side

- **`model.ts`.** Kept: `Choice`, `Field`, `Split`, `Row`, `CostRow`, `BreadcrumbView`, `SourceView`, `CalculatorContent`. New: `AreaField` (was `ShapeField`); `ChoiceGroupView { key; label; choices; area?: { rows; fields: AreaField[] } }`; `FieldItemView { field; stepper?: { key; less; more } }`; `FormView { unitsLabel; units; items: (choice | field)[]; copyLabel }`; `FillSplit = Split & { name }`; `ShoppingLineView { unit; qty; label: FillSplit; note?: FillSplit }`; `ResultView { heading; primary; rows; shopping: ShoppingLineView[]; costs; costsNote?; estimateNote; termsLabel; termsHref }`; `CalculatorPageView { id; title; breadcrumb; answer?; notRunning; form; result; messages: readonly (readonly [name, text])[] }`.
- **Components.** `CalculatorForm` walks `form.items` in definition order (units first, copy last), today's order. `ResultPanel` maps `shopping` and renders the optional `costsNote`. `ShoppingLine` renders one line with `data-line`, `data-fill` and `data-line-note`. `CalculatorBody` renders `view.messages` in order and `[data-answer]` only when `answer` is set.
- **`CalculatorView.astro`** uses `pageView(id, locale)` and `SCRIPTS[id]`, both `Record<CalculatorPageId, …>`.
- **Rectangle-area DOM proof (D13, unit level, K16).**
  - **Markup (CWC24, CP56, CWC33).** `contract/rectangle-area-proof.contract.test.ts` builds `pageViewOf(rectangleAreaPage, 'en', enRectangleArea)` and renders it through the real `CalculatorBody` with the Astro container (`__testing__/render-component.ts`, as `CalculatorBody.test.ts` does). It asserts: no `data-choice`, `data-step`, `data-shopping`, `data-line`, `data-fill`, `data-line-note`, `data-cost-row`, `data-hint-row` or `data-price-hint`; present `#calc-length`, `#calc-width`, two `data-unit` buttons, `data-copy`, `data-copy-status`, `data-primary` and three `data-output` values `100.00`, `11.11`, `9.29`.
  - **Mount lookups (the browser-only gap, made a unit check).** The same test reads `client/mount.ts` and extracts the string-literal selector of every throwing lookup (`find(`, `findAs(`). Each must match the rectangle-area markup, except the names in the test's layout list (today `header a[hreflang]`, rendered by `BaseLayout` on every page). Per-key lookups go through `ids.ts` and are checked for each text key of the module. A slot selector inside a throwing lookup fails the test.
  - **Graph (CWC4).** `contract/__testing__/rectangle-area-entry.ts` (`mount(rectangleAreaPage)`) is walked by `entry-graph.contract.test.ts` through `buildClient` (module ids before tree shaking, so an import-graph proof): no `calculator/slots/` file, no `calculator/concrete/` file, smaller than concrete's graph.
  - **Excluded from production (CWC32).** No page, island, route, sitemap row or catalog key is added; the test asserts `ROUTES` and the built `dist` hold no rectangle-area path.
  - **Not proven here:** a real browser running the mount over slot-free markup. The lookup check above and code review cover it; the live Square footage page (next change) runs the whole browser suite over a slot-free page.

## Byte budgets

| Item | Today | Forecast | How it is checked |
|---|---|---|---|
| Concrete entry graph | 36,450 B | 37,000–38,500 B | `client-entry.contract` prints the size each slice; recorded at S5 (library build) and S14 (real build, `check:site`). Target ≤ 38,500 B; gate 49,152 |
| Rectangle-area proof entry | — | about 29,500–31,000 B | S17 asserts it is smaller than concrete and reaches no `slots/` file |
| Calculator HTML | 39,268 / 39,517 B | +about 200 B (S7); margin about 1,500 / 1,250 B | `CalculatorBody.budget.test` in S7; budget 40,960 |
| Page weight and CSS | — | unchanged | `check:site` |

Grows: `definePage` and `shoppingLinesOf` (about 0.4 KB), the slot files (about 1.5 KB), the indirection (about 0.5 KB). Shrinks: the hand lists (about 1.1 KB), the duplicated waste bounds, concrete's volume formatting, `TEXT_KEYS` and `DIMENSION_ORDER` in the mount.

## Testing strategy

**Coverage.** 100 % on `apps/web/src/calculator/**` and on `apps/web/src/lib/page-view.ts` (m-3). Concrete covers every present slot; rectangle-area and synthetic fixtures cover every absent branch.

| Layer | What | How |
|---|---|---|
| Unit, renamed | `concrete/controller.test.ts` (re-pointed S4, S5), `concrete/present.test.ts` (`answerValues` S3, `figuresOf` block removed S10), `concrete/shapes.test.ts` (unchanged) | module #1's tests |
| Unit, removed | `concrete-layout.test.ts`: ids → `ids.test.ts` (S1), rows → `slots/choices.test.ts` (S4) | — |
| Unit, new | `ids`, `texts` (synthetic count, money, boolean fixtures), `page-module` (`definePage`, `shoppingLinesOf`: order, extra, missing, duplicate, unit), `slots/*` (CWC3 with a two-line fixture in reversed engine order, CWC28, CWC29, CP57, each `PageModuleError` code), `rectangle-area/controller.test.ts` (CWC1, 7, 13, 16, 31), `form-layout`, `present` | vitest node |
| Types | `page-module.test-d.ts`: `TextKey<typeof concrete>` is the 15 keys; both modules assign to `AnyPageModule`; `controllerOf(rectangleAreaPage)` view `fields.waste` is `@ts-expect-error`. `lib/pages.test-d.ts`: `keyof typeof PAGES` equals `CalculatorPageId`; an `@ts-expect-error` table with a missing row (CWC26) | `expectTypeOf` |
| Render | concrete form, panel, shopping, body from `pageView('concrete', …)`; `--calc-rows:4`; CP54 hook counts; rectangle-area markup and mount lookups (CWC24, CP56, CWC33) | Astro container |
| Contract | `entry-graph`, `client-entry` per `CALCULATOR_PAGES` entry plus the proof entry (CWC4, CWC37); `client-graph` from `ownId` (also the web folder); `client-hygiene` list from the page ids; `templates` pins from `ROUTES` and the registry; `generic-code.contract.test.ts` (below) | `src/contract/*` |
| E2E | the typed record and the generic suites | Playwright |

**`generic-code.contract.test.ts` (CWC9, CWC34, m-5).** Generic files are every non-test source under `apps/web/src/calculator/` outside `calculator/<registry id>/`, plus (as each is generalised) `client/mount.ts`, `components/calculator/*.astro`, `lib/page-view.ts` and the generic e2e suites. Test files (`*.test.ts`, `*.test-d.ts`) are excluded. CWC9 matches `document`, `window`, `navigator` and catalog imports. CWC34 matches a registry id only inside a string literal or a path segment, with comments stripped first (today's comments in `model.ts:1-7` and `present.ts` name concrete).

### Browser record (SQ29–32)

```ts
// tooling/site-browser/e2e/calculator-pages.ts
import type { CalculatorPageId } from '../../../apps/web/src/routing/templates.ts';  // relative, as urls.ts:2; type only (m-11)
export interface E2eLocale { readonly locale: 'en' | 'es'; readonly catalog: Readonly<Record<string, string>>;
  readonly site: Readonly<Record<string, string>>; readonly common: Readonly<Record<string, string>>;
  readonly answer?: string; readonly typedAnswer?: string; readonly metricAnswer?: string }
export interface E2eSpec {
  readonly locales: Readonly<Record<'en' | 'es', E2eLocale>>;
  readonly ready: string; readonly inputs: number; readonly numeric: readonly string[];
  readonly figures: readonly string[];           // `data-output` keys, then `shopping:<i>`
  readonly defaults: readonly string[]; readonly typed: { key; text; query; figures };
  readonly states: readonly { name; query; figures }[]; readonly metric: { texts; query; primary; hints };
  readonly tabOrder: readonly string[]; readonly bounds: readonly { key; text; code; bound }[];
  readonly layoutQueries: readonly string[];
  readonly choices?: readonly { key; options: Readonly<Record<string, readonly string[]>>; starts? }[];
  readonly steppers?: readonly { key; min; max; up: { from; to; figures } }[];
  readonly shopping?: readonly { values; note }[]; readonly prices?: readonly { input; text; output; value }[];
}
export const E2E = { concrete: CONCRETE } as const satisfies Record<CalculatorPageId, E2eSpec>;
export interface E2ePage extends E2eLocale { readonly id: CalculatorPageId; readonly path: string;
  readonly other: string; readonly spec: E2eSpec }
export const calculatorPages: readonly E2ePage[];   // paths from ROUTES, both locales
```

The record has no runtime import from `@maestro-calc/*` (the browser job has no root install); it reaches `apps/web` only by relative path, as `urls.ts:2` does, and imports `CalculatorPageId` as a type. Concrete's `CONCRETE` stays in `e2e/concrete-pages.ts` with today's strings, `STATES` and `SHAPE_FIELDS`.

| Suite | Record data it uses |
|---|---|
| `calculator.spec.ts` | once per page: enable, abort, labels, touch, Enter, copy and fallback, hint, requests, language switch, notices, invalid field, default query; `choices`, `steppers`, `shopping`, `prices` only when declared |
| `a11y.spec.ts` | one axe state per option of each choice group |
| `layout.spec.ts` | `layoutQueries` |
| `csp.spec.ts` | `calculatorPages`; no path in the suite |

`smoke` and `no-js` already derive their pages from the route table. **Mutation:** no core or data change, so no shard, CI key or identity file changes.

## Review units

Lines are `git diff --shortstat` of the slice's commit with rename detection (git's default). Groups are stacked to `main`, one PR per group (owner rule). GitHub may show a heavily rewritten file of a group PR as delete plus add; the review unit is the slice commit.

| Slice | Commit subject | Files | Forecast | Group |
|---|---|---|---|---|
| S1 | `refactor(calculator): move the concrete web files into calculator/concrete` | R `concrete-controller.ts` → `controller.ts`; R controller test, `shapes`, `present` (+ tests) → `calculator/concrete/`; ids from `concrete-layout.ts` → `ids.ts` + `ids.test.ts`; import fixes in `concrete-mount.ts`, `lib/concrete-page.ts`, tests; AGENTS step 12 path + `docs.contract` row | ~80 | G1 |
| S2 | `feat(calculator): add the page-module contract and the choice slot` | `page-module.ts` (`AnyCalculator`, `definePage`, `PageModuleError`, `shoppingLinesOf`), `slots/choices.ts`, `concrete/page.ts` (primary, choices), tests, `page-module.test-d.ts` | ~330 | G1 |
| S3 | `feat(calculator): add the stepper, shopping, cost and answer slots` | `slots/{steppers,shopping,costs,answer}.ts` + tests; `concrete/page.ts` complete; `concrete/present.ts` (`bagFills`, `answerValues(m, primary)`) | ~370 ⚠ | G1 |
| S4 | `refactor(calculator): derive the field texts and figures from the definition` | `texts.ts` + tests; in `controller.ts`: raw record, field views, `Environment.helps`; `present.ts` (`outputText`, `priceText`); delete `concrete-layout.ts` + test; mount uses `textKeysOf` | ~330 | G1 |
| S5 | `refactor(calculator): drive the controller from the page module` | `controller.ts`: `controllerOf` overload, choice and step events through the slots, `PanelView`, answer, shopping check; controller test and mount accessors | ~380 ⚠ | G1 |
| S6 | `test(calculator): prove rectangle-area through the generic controller` | `rectangle-area/page.ts`, `rectangle-area/controller.test.ts` (CWC1, 7, 13, 16, 31); `contract/generic-code.contract.test.ts` (CWC9, CWC34 over `calculator/`) | ~280 | G1 |
| S7 | `refactor(web): rename the calculator DOM hooks to the generic scheme` | the 57 references in 11 files; `--calc-rows` style and CSS (m-6); styles contract; HTML budget measured | ~130 | G2 |
| S8 | `refactor(web): rename the concrete page builder and add the form layout` | R `lib/concrete-page.ts` (+ test) → `lib/page-view.ts`; importers; new `calculator/form-layout.ts` + test; AGENTS step 11 sentence + `docs.contract` row | ~150 | G2 |
| S9 | `refactor(web): render the calculator form from a generic form view` | `page-view.ts` form part, `model.ts` form types, `CalculatorForm.astro`, form tests | ~330 | G2 |
| S10 | `refactor(web): render the result panel from a generic result view` | `ResultPanel.astro`, `ShoppingLine.astro`, model result types, `figuresOf` removed (+ its tests), tests | ~320 | G2 |
| S11 | `refactor(web): write the page messages from the generic view` | messages list (hint rule m-2), `CalculatorBody.astro`, tests | ~220 | G2 |
| S12 | `feat(web): choose the page module by id in CalculatorView` | `lib/pages.ts` + `pages.test-d.ts`; `CalculatorView.astro`; `concreteView(` callers (about 8 files); `page-view.ts` rest; coverage entry for `lib/page-view.ts`; CWC24 and CP56 render tests; AGENTS step 14 sentence + `docs.contract` row; CWC34 scan adds the components and the builder | ~270 | G2 |
| S13 | `refactor(client): rename the concrete mount to the generic mount` | R `client/concrete-mount.ts` → `client/mount.ts`; entry import; AGENTS step 12 path + `docs.contract` row | ~30 | G2 |
| S14 | `refactor(client): mount every calculator page through the generic mount` | `mount.ts` generalised in place (no `dom.ts` split); `entries/concrete.ts` → `mount(concretePage)`; hygiene list; CWC34 scan adds the mount | ~300 | G2 |
| S15 | `test(site-browser): drive the calculator suite from a typed per-id record` | `e2e/calculator-pages.ts`, concrete's `E2eSpec` in `e2e/concrete-pages.ts`, generic `calculator.spec.ts`; AGENTS sentence on `CONCRETE_PAGES` + row | ~350 ⚠ | G3 |
| S16 | `test(site-browser): run the axe, layout and CSP suites for every calculator` | `a11y`, `layout`, `csp` over the record; CWC34 scan adds the suites | ~160 | G3 |
| S17 | `test(web): run the entry contracts per page and prove the slot-free markup` | entry contracts per id; `contract/__testing__/rectangle-area-entry.ts`; `client-graph` from `ownId` (and the web folder); templates pins; `contract/rectangle-area-proof.contract.test.ts` (CWC32, CWC33) | ~250 | G3 |
| S18 | `docs(agents): rewrite the adding-a-calculator recipe for the generic core` | AGENTS.md recipe + `docs.contract` tokens (CWC35) | ~140 | G3 |

**Totals:** G1 ~1,770 · G2 ~1,750 · G3 ~900 · overall ~4,420 lines in 18 slices (was ~5,600 in 20).

**Where the unit-level D13 proof lands.** CWC24 and CP56 in S12, the first slice where `pageViewOf` can build any module; CWC4, CWC32 and CWC33 in S17, the first slice where the generic mount and the per-id entry contracts exist. Not S6 (no generic view yet) and not S18 (docs only).

### Split contingencies (⚠ slices)

| Slice | If it goes over 400 |
|---|---|
| S3 | the answer slot becomes its own slice S3b (~90), between S3 and S4 |
| S5 | `PanelView` and the answer (~120) move into S5b after the events and `controllerOf` |
| S15 | the record type and concrete's record (S15a) split from the suite rewrite (S15b) |
| S1, S8, S13 | if `--shortstat` shows a rename as delete plus add, drop the edits that lowered similarity into the next slice |

### Forecast guard lines

- Decision needed before apply: No
- Chained PRs recommended: Yes (3 group PRs, each above 400, as the owner accepts)
- 400-line budget risk: Medium (S3, S5 and S15 at 350–380, each with the split above)

### Gates

**Every slice, before its commit:** `npm run format:check`; `npm run sync && npm run lint`; `npm run typecheck` (plus `npm run typecheck --prefix tooling/site-browser` when the tooling changes); `npm run test:coverage` (100 % on `calculator/**` and `lib/page-view.ts`); `git diff --shortstat HEAD~1` recorded (≤ 400, renames shown as renames).

**Also `npm run build && npm run test:e2e`:** S1–S5 (client-reachable controller), S7–S14 (markup and mount), S15, S16 (suites). S6, S17, S18 change no shipped code or suite.

**Group tip (G1, G2, G3):** `npm run verify`; `npm run build && npm run check:site && npm run test:e2e && npm run lighthouse`; entry sizes in `apply-progress.md`; and the **dist diff** (M-6):

1. **Baseline,** once before S1: build `main`, copy `apps/web/dist` to `<scratch>/dist-main`.
2. **Normalise both trees** (HTML files only): `sd '/_astro/[A-Za-z0-9_.-]+\.(js|css)' '/_astro/ASSET.$1'`.
3. **Compare** `diff -r -x '*.js' <scratch>/dist-main apps/web/dist`. Excluding `*.js` is exact because `check:site` proves the only JavaScript is under `/_astro/`; G1 rewrites the controller and the mount, so the chunk content changes. JavaScript is guarded by the `client-entry` size print and the e2e.
4. **G1 tip:** the diff is empty.
5. **G2 tip:** first apply the hook mapping to a copy of the baseline HTML, in this order (each `sd` on the calculator pages only):
   - `'data-shape-button="([a-z]+)"'` → `'data-choice="shape" data-value="$1"'`
   - `'data-bag="([0-9]+)"'` → `'data-choice="bag" data-value="$1"'`
   - `'data-waste-step="([a-z]+)"'` → `'data-step="waste" data-direction="$1"'`
   - `'data-bag-yield'` → `'data-line-note="0"'` (before the next two)
   - `'data-bag-lb'` → `'data-fill="bagLb"'`
   - `'data-yield'` → `'data-fill="yield"'`
   - `'class="calc-shape-area" data-reserved="shape"'` → `'class="calc-choice-area" data-reserved="shape" style="--calc-rows:4"'`
   - `'<p class="calc-shopping">'` → `'<p class="calc-shopping" data-line="0">'`
   - in the inline `<style>`: the rule `\.calc-shape-area\{[^}]*\}` is replaced by the rule `\.calc-choice-area\{[^}]*\}` read from the G2 build, and the test asserts that rule's `min-height` is the m-6 expression.
   Each mapping must match at least once per calculator page (a zero count fails the gate). Then steps 2–3; the diff is empty (CWC23).
6. **G3 tip:** the diff against the G2 tip build is empty.

## Risks

| Risk | Mitigation |
|---|---|
| About 4,400 lines over 18 slices strain reviewers | One work unit per slice; S1, S7, S8, S13 are mechanical; the renamed tests keep their assertions, which is the behaviour proof |
| A rename slice loses rename detection (similarity < 50 %) | Measured with `--shortstat` before each rename commit; the contingency moves the extra edits on |
| A slot is called with the state of another calculator | Impossible by construction: each module carries its own calculator, and the overloads type each slot from it; `pages.test-d.ts` proves the per-id rows |
| A declared shopping line and the engine disagree | `shoppingLinesOf` throws `SHOPPING_LINES` at controller creation and on any run; each module's controller test starts it |
| The mount's tolerance of absent slot elements is not run in a browser in this change | CWC33's lookup check plus the K12 rule; the next change's live slot-free page runs the full browser suite |
| JS grows from the indirection | measured each slice; target ≤ 38,500 B; gate 49,152 unchanged |
| HTML grows by about 200 B (ES margin about 1,250 B) | measured in S7 by the full-length budget proof |
| An intermediate commit breaks `docs.contract` or leaves a stale recipe sentence | K13 |

## AGENTS.md recipe text (S18)

Steps 2–10 keep their text. Step 1 gains one sentence (m-8): "Declare a select's driven fields directly after the select (`formOf` throws otherwise)." Replace steps 11, 12 and 14 and the "Kept by hand" list with:

> 11. The page: `apps/web/src/content/calculators/{en,es}/<id>.md` (frontmatter with the sources, the review date and the worked example, then the five sections in order; run `npm run build` to see the strict schema reject a bad entry), and the page module `apps/web/src/calculator/<id>/page.ts`: `definePage({ calculator, ...slots })`, language-free (no catalog, no DOM), with any helper it needs in the same folder. Declare only the slots the page needs, each from `apps/web/src/calculator/slots/`: `choiceSlot` (the fields each option of a select shows; the reserved height follows), `stepperSlot` (the step; the descriptor must declare `min` and `max`), `shoppingSlot` (one line per material the engine returns, matched by `materialId`), `costSlot`, `answerSlot`, and `primary` per unit system (default: the `role: 'primary'` output). A slot you do not declare is not in the page's bundle. Page copy uses the `calc.<id>.page.*` keys of the convention in `apps/web/src/lib/page-view.ts`. Add the row to `PAGES` in `apps/web/src/lib/pages.ts` (module and catalogs). Test the module through `controllerOf` with the hand-verified cases, as `apps/web/src/calculator/<id>/controller.test.ts` does for concrete.
> 12. The script: `apps/web/src/client/entries/<id>.ts` calls `mount` from `apps/web/src/client/mount.ts` with the page module (never `lib/calculators.ts` or the data root), and the island `apps/web/src/islands/<Id>Script.astro` holds one processed `<script>`. The entry contracts walk and weigh every entry of `CALCULATOR_PAGES` (49,152 B for the entry and its static graph) without a test edit.
> 14. Go live, all in one merge (a partial go-live is never merged): the `ROUTES` row in `apps/web/src/routing/routes.ts` with `page.<id>.title` and `page.<id>.description` in `packages/i18n/src/catalogs/{en,es}/site.ts`, the id moved from `PAGELESS` to `CALCULATOR_PAGES` in `apps/web/src/routing/templates.ts`, the `SCRIPTS` row in `apps/web/src/views/CalculatorView.astro`, the home link in `apps/web/src/views/HomeView.astro` with its `page.home.links.<id>` key, and the browser record: `tooling/site-browser/e2e/<id>-pages.ts` exports the `E2eSpec` (the default answer per locale, the hand-verified states, and the groups the page has) and its row goes in `E2E` of `tooling/site-browser/e2e/calculator-pages.ts`; the generic suites pick it up. Then update the pinned counts in `apps/web/src/contract/end-state.contract.test.ts`. The Lighthouse representative in `tooling/site-browser/e2e/representative.ts` stays the one calculator page it names unless you change it on purpose.
>
> Kept by hand: the tables `PAGES` (`apps/web/src/lib/pages.ts`), `SCRIPTS` (`apps/web/src/views/CalculatorView.astro`) and `E2E` (`tooling/site-browser/e2e/calculator-pages.ts`), each a `Record<CalculatorPageId, …>`, so a missing row is a type error; plus the existing items (the `EnglishKeys` and page-key unions, the `./testing/<id>-yields` subpath and its list, `RELEASED` and `REGISTRY`, the mutation `deps`, `apps/web/src/lib/calculators.ts`).

**`docs.contract.test.ts` changes (S18):** rows `concreteView` and `e2e/concrete-pages.ts` (as left by S12 and S15) replaced; rows added for `apps/web/src/calculator/<id>/page.ts`, `apps/web/src/lib/pages.ts`, `apps/web/src/client/mount.ts`, `tooling/site-browser/e2e/<id>-pages.ts`, `tooling/site-browser/e2e/calculator-pages.ts`; assertion added: the recipe contains neither "generalise" nor `concreteView` (CWC35). `pathsIn` fills `<id>` with `concrete`, so every new path resolves (`calculator/concrete/page.ts`, `calculator/concrete/controller.test.ts`, `e2e/concrete-pages.ts`).

## Threat matrix

N/A. No shell, subprocess, VCS or PR automation, executable-file classification or process integration. The client boundary is unchanged: query values enter only through `decode`; the DOM is written only through `textContent`, `value`, attributes and `hidden`; the CSP and `client-hygiene` still apply.

## Migration / rollout

No data, URL, content or catalog migration. Each group is the revert of one merge commit, **newest first** (G3, then G2, then G1): the groups are stacked, so G1 cannot be reverted alone after G2 has merged (m-9). After G1 the HTML is byte-identical; after G2 it differs only by the mapped attributes and CSS; G3 changes only tests and docs.

## Open questions

None blocking.

## Reconciliation with the specs (applied in the spec deltas, round 1)

| # | Spec | Applied |
|---|---|---|
| R1 | CWC "Page-module contract" | `id` is the registry calculator id of the definition; the tables `PAGES`, `SCRIPTS`, `E2E` enforce `CalculatorPageId`; the module lives at `calculator/<id>/page.ts` |
| R2 | slot table; CWC2 | rows from the output display hints (no module code); every select is a choice group, the slot adds fields per option; shopping lines declared by material; answer values also receive the primary text (m-10) |
| R3 | CP "Public DOM hooks" | the table lists every hook the suites and the mount read, including `data-direction`, `data-line`, `data-fill`, `data-line-note` and the unchanged ones |
| R4 | CWC "Rectangle-area headless proof", CWC4, CWC32, CWC33 | unit level: container render plus entry-graph proof; "Chromium" removed; the MAY-drop clause replaced by the decision and its reason |
| R5 | CWC23 | consistent (no edit) |
| R6 | CWC "Generic mount" | consistent (no edit) |
| R7 | CWC "Page-view builder" | `calc.<id>.page.example` when the catalog has it, no trailing space without it; hint rule (m-2); input modes and placeholder belong here (m-10) |
