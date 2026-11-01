# Proposal: print-button

## Intent

PLAN §4.2 lists "Imprimir" as an MVP function. The print sheet exists (calculator.css `@media print`, [CP87]-[CP88]) but no page offers a button for it. Add one to every calculator page.

## Decisions

1. **In the copy area, on the copy button's row.** `<button type="button" data-print hidden disabled>` right after the copy button; a small inline gap keeps both on one row at 320 px in both languages, so the reserved height of the copy area (9rem) does not change. Without the script it stays hidden, like the copy button: printing from the browser menu still works and uses the same print sheet.
2. **The mount finds it as a list** (`prints: findAll(root, '[data-print]')`), reveals and enables it with the copy button, and calls the browser's `print()` on click. No other module changes; the generic controller is untouched. Cost: about 125 B on the largest calculator entry (47,215 of 49,152 B).
3. **One catalog key**, `site.calculator.print` ("Print" / "Imprimir"): the pinned calculator-page UI keys go from seventeen to eighteen ([ICW17]).
4. **Browser records:** `[data-print]` joins every `tabOrder` between `[data-copy]` and `[data-share]`.
