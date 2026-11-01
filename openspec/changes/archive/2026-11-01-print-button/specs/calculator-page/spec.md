# calculator-page

## ADDED Requirements

### Requirement: Print button

A calculator page MUST hold, right after the copy button, a `<button type="button" data-print>` labelled with `site.calculator.print`, hidden and disabled in the static markup, revealed and enabled with the copy button when the script runs, that opens the browser's print dialog. It MUST sit on the copy button's row, so the copy area keeps its reserved height.

#### Scenario: [CP89] Print from the concrete page
- GIVEN `/es/calculadora-de-concreto` with its script running
- THEN after "Copiar enlace" an enabled "Imprimir" button is visible, it is the next control in the tab order, and pressing it opens the print dialog
