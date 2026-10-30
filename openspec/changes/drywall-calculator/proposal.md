# Proposal: drywall-calculator

## Intent

Add the Drywall calculator, #6 of the MVP catalogue (PLAN §4.1: 14.8K searches a month; 68 % of the trade is Latino): how many sheets, how much joint compound and tape for a room, and what the sheets cost.

Chosen by the orchestrator on 2026-10-30 in the owner's autonomous run ("avanza todo lo que mas puedas hacer"). By searches Roof pitch (22.2K) comes first, but it needs an angle measure, a square root and an arctangent with bounded error in core, and their display in the web layer: a core design change that goes through design before code. Drywall fits the current core, so it goes first; Roof pitch is next once its design is decided.

The page content is approved in advance under the owner's rule of 2026-10-29: "Después seguí con calculadoras nuevas del catálogo de PLAN §4.1, en orden de búsquedas: núcleo → página → publicación, un PR por calculadora, con la misma regla de contenido aprobado por adelantado." The numbers below are the orchestrator's decisions, recorded for the owner.

## The numbers (orchestrator decisions)

| Number | Value | Source |
|---|---|---|
| Joint compound | approximately 9 gallons per 1,000 ft² (two 4.5-gallon pails) | USG FAQ on Sheetrock UltraLightweight All Purpose Joint Compound |
| Joint tape | approximately 370 ft per 1,000 ft² | USG Sheetrock Brand Heavy Joint Tape, Submittal Sheet J1393 (rev. 10-15) |
| Door / window | 20 ft² / 15 ft² each | Same allowances as the paint calculator |
| Extra | 10 % (0–50), sheets only | Rule of thumb for cuts and breakage |

Screws are left out: no primary source was found for a screw count, and the count depends on framing spacing and code. The page says so.

## Approach

Area = walls (2 × (length + width) × height, less openings, never below zero) plus the ceiling when chosen; sheets = area × (1 + extra) ÷ 32 or 48 ft², rounded up; compound and tape from the area, in 4.5-gallon pails and 500 ft rolls, rounded up; cost = sheets × price per sheet. Outputs: area in ft² (primary, US) and m² (primary, metric), compound gallons, tape feet, cost; three shopping lines. The large figure is written `478.00 ft²` / `44.41 m²`: with the words, a four-digit area wrapped at 768 px in Spanish and moved the panel (found by the drawing spec).
