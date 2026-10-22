# Maestro Calc — Competitive UI/UX Audit

- **Date:** 2026-10-22
- **Scope:** concrete, roofing, drywall, square footage, and feet-inch-fraction calculators
- **Inputs:** PLAN.md §1 (value proposition), §4 (product), §5.1 (page anatomy), §8.1 (ad rules)
- **Primary user:** Latino contractor on a US jobsite. They use a phone, often one-handed, in direct sun, sometimes with gloves, on slow 4G.
- **Secondary user:** English-speaking DIY homeowner.

---

## 0. TL;DR

Every competitor answers "how many cubic yards?". None of them answers "what do I buy, what will it
cost, and can I send it to my client or crew in Spanish?". The market looks like 2008: dense forms, a
`Calculate` button, a full QWERTY keyboard for numbers, tiny unit dropdowns on every field, static
diagrams, and no WhatsApp anywhere. None of the English leaders has a Spanish version for the US. The
only big Spanish version (Omni) is metric, sized for Spain and Latin America, with 25 kg bags.

The opportunity is clear. Look like a jobsite tool, not a math worksheet. Put the shopping list first.
Draw the shape live. Make the whole experience a shareable bilingual link.

---

## 1. Method and evidence

I fetched each page on 2026-10-22 with WebFetch and with `curl` using an iPhone Safari user agent.
I then inspected the raw HTML for input types, `inputmode`, submit buttons, ad-network scripts,
`hreflang`, web manifests and any WhatsApp mention. I did not take screenshots on a real device, so
above-the-fold claims come from DOM order and structure. Home Depot and Lowe's returned HTTP 403 to
automated fetches, so their sections rely on search results and product-page references, and are
marked as lower confidence.

### Raw HTML measurements (concrete calculator page, mobile UA)

| Site | HTML size | `<script>` tags | Ad network detected | Number inputs | `inputmode` | Calculate button | WhatsApp | `hreflang` |
|---|---|---|---|---|---|---|---|---|
| inchcalculator.com | 167 KB | 12 | **AdThrive/Raptive** (11 refs) + GPT | 28 `type=number`, 9 text | none | yes (`value="Calculate"` + 3 submits) | no | none |
| calculator.net | **17 KB** | 2 | none detected in HTML | 0 number, **23 `type=text`** | none | **yes, 5 buttons** | no | none |
| calculatorsoup.com | 80 KB | 20 | GPT + **Prebid** | 5 text | **`decimal` ×4, `numeric` ×1** | yes | no | none |
| omnicalculator.com | **1.24 MB** | 2 (large bundles) | **Playwire** + GPT | client-rendered (no inputs in SSR HTML) | n/a | no (live) | no | none |
| gigacalculator.com | 106 KB | 14 | AdSense | 17 `type=number` | none | yes | no | none |
| concretenetwork.com | 73 KB | 15 | AdSense (8 refs) + GPT | 13 number, 3 text | none | yes (×4) | no | none |

What this shows:

- **None of the six offers WhatsApp sharing or declares an alternate language with `hreflang`.**
- **Only CalculatorSoup sets `inputmode`.** calculator.net uses plain `type=text` with no `inputmode`, so phones open a full QWERTY keyboard for numeric fields.
- **Five of the six still use a `Calculate` button.** Omni is the only one with live results, and it ships 1.24 MB of HTML before any assets.
- **Header bidding (Prebid, Raptive, Playwire) costs speed.** The sites that monetize best run heavy ad stacks. The light ones, calculator.net and concretenetwork, look dated.

---

## 2. Competitor-by-competitor audit

### 2.1 Inch Calculator (inchcalculator.com) — the closest competitor

**Above the fold (mobile):** a header with logo, search and a dark/light toggle. Then the H1 "Concrete
Calculator" and one line of copy: *"Calculate the amount of concrete you need to pour a slab, patio,
footing, or column using the calculator below."* Next come project-type tabs: *Slab (Rectangle), Slab
(Circle), Footing, Column/Pier, Wall, Curb & Gutter, Steps*. A labeled technical diagram sits above
the inputs.

**Input UX:** each field (Length, Width, Thickness) has its own unit dropdown: `in ft yd cm mm`. You
cannot type mixed feet and inches like `12' 6"`, and fractions are not supported in the concrete tool.
The page uses 28 `type=number` inputs with no `inputmode`, so iOS shows a numeric keyboard without a
fraction or foot/inch key.

**Results:** volume in *cu yds* and *cu m*, then *"50-lb Bags, 60-lb Bags, 80-lb Bags"* each with a
count, then *"Estimated Cost"* with the note *"Average price is $125 - $165 per yd"*. This is the
strongest result block in the category, but it lists all bag sizes side by side instead of a single
shopping decision.

**Roofing:** pitch comes from a 24-item dropdown (0/12 to 24/12). Results show bundles (3 per square),
rolls of 15 lb felt (~400 sq ft each) and material cost (*"about $100 per square"* for 3-tab). There is
no live drawing, and the only code reference is *"local permits and inspections may be required"*.
There is no IRC check.

**Trust:** strong. Author *Joe Sexton* (*"over 20 years of experience in engineering and
construction"*), reviewer *Sarabeth Asaff South*, both with photos and "Full bio" links, plus footnoted
references. The page shows no visible updated date.

**Sharing:** Facebook, X, Pinterest, LinkedIn, *"Link to Results"* and *"Cite This Page"*. No WhatsApp,
no SMS, no print-optimized view surfaced.

**Ads:** a Raptive/AdThrive stack (11 references), and a mid-content lead-gen box *"Are You Looking For
a Contractor? Get Free Estimates"*. Raptive typically injects in-content units plus a sticky footer.

**Language:** English only.

- **What it does well:**
  - The best mix of trust signals and bag counts.
  - Diagrams for each shape.
  - Dark mode.
  - "Link to Results".
- **What it does badly:**
  - A unit dropdown on every field.
  - No feet + inches + fractions in the material tools.
  - Bag sizes are a wall of numbers rather than a decision.
  - No Spanish.
  - Ad-heavy.
  - Sharing goes to desktop-era social networks.

### 2.2 Omni Calculator (omnicalculator.com)

**Layout:** calculator-first. The widget heading *"Concrete Calculator"* has a dropdown *"Choose a
concrete form"* (Slab, Wall, Footer, Column, Curb/Gutter Barrier, Stairs). Inputs are grouped into
cards: Dimensions → Pre-mixed concrete (Density, Weight, *Bag size*, *Waste*) → Costs (*Cost per bag,
Cost per slab, Cost per unit area, Cost per unit volume, Total cost*).

**Input UX:** live results with no button. The unit model is unusual: *"All dimensions are given in
feet by default. You can change them to any other unit by simply unlocking the field (the padlock
button)."* That is clever for power users and confusing for everyone else. Every field, outputs
included, looks like an editable input, so the answer does not stand out from the questions.

**Results:** the numbers sit inside the same input-styled boxes. There is no hero result.

**Visuals:** stock photos (*"Pouring concrete slabs"*), not a diagram of the user's own slab.

**Trust:** named creators (*Filip Derma*, *Wojciech Sas, PhD*), reviewer *Bogna Szyk*, an ACI
reference, and a social-proof line: *"243 people find this calculator helpful"* with *"Did we solve your
problem today?"*.

**Sharing:** *"Share result"*, *"Reload calculator"*, *"Clear all changes"*.

**Speed:** 1.24 MB of HTML, client-rendered inputs and a Playwire ad stack. This is the heaviest page
in the audit, which matters on jobsite 4G.

**Spanish:** `/es/construccion/calculadora-concreto` exists but targets Spain and Latin America. It is
metric only (*"metros cúbicos"*, *"25 kg"* bags, *"2400 kg/m³"*), uses the term *hormigón*, and never
mentions pounds, feet, yards or 80 lb bags. A US Latino contractor buying Quikrete at Home Depot gets
the wrong units. This is the single most important gap in the market.

- **What it does well:** live results, waste and cost built into the flow, polish, social proof.
- **What it does badly:**
  - Outputs look like inputs.
  - The padlock unit model.
  - A heavy page.
  - Spanish is localized to the wrong country.

### 2.3 Calculator.net

**Layout:** the breadcrumb *"home / other / concrete calculator"*, then the H1, then **five stacked
calculators on one page**: Slabs/Square Footings/Walls, Hole/Column/Round Footings, Circular
Slab/Tube, Curb and Gutter Barrier, Stairs. Each has its own diagram and `Calculate` button.

**Input UX:** 23 `type=text` inputs with no `inputmode`, so phones show a full alphabetic keyboard for
numbers. Each field has a unit dropdown (feet, inches, yards, meters, centimeters). The square-footage
tool asks you to *"modify the values and click the calculate button"*.

**Results:** they appear only after you tap `Calculate`, and the page reloads. Output is volume plus
bag counts.

**Speed:** the fastest and lightest page (17 KB of HTML, 2 scripts). It feels instant but looks like a
2005 form.

**Ads:** none detected in the static HTML. Ads load later or are light.

**Language:** English only. No sharing.

- **What it does well:** speed, clarity, honest diagrams.
- **What it does badly:**
  - A wall of five forms.
  - The wrong keyboard.
  - A `Calculate` button and page reload.
  - No shopping list, cost, sharing or Spanish.

### 2.4 CalculatorSoup (calculatorsoup.com)

**Layout:** good accessibility basics, including skip links (*"skip to calculator answer"*, *"skip to
calculator start"*). Tabs for 9 shapes.

**Input UX:** the **only** site with correct mobile keyboards (`inputmode="decimal"` ×4). Unit
dropdowns read `in ft cm m`. There is an optional quantity multiplier.

**Results:** text lines such as *"Cubic Yards = 9.88 yd³ / Cubic Feet = 266.67 ft³ / Cubic Meters = 7.55
m³"*. They are functional but not visual.

**Cost:** optional, with a currency picker (`$ € £ ₹ 元 ¥ R ¤`) and price per ft³/yd³/m³. The picker is
generic and global rather than tuned for the US.

**Sharing:** *"Share this Calculation"* and *"Get this Calculator for Your Website"* (embed).

**Trust:** a citation block (*"Furey, Edward… CalculatorSoup"*) with a date.

**Ads:** GPT plus Prebid (header bidding).

- **What it does well:** keyboards, accessibility, embed widget, share link.
- **What it does badly:**
  - Results are plain text.
  - No bags-first shopping list.
  - Generic global currency UI.
  - No Spanish.

### 2.5 GigaCalculator (gigacalculator.com)

- **Layout and inputs:**
  - Breadcrumb, then a *US units / Metric units* toggle, which is a good global switch.
  - Form types are Rectangular Slab, Wall, Footing, Rectangular Column, Round, Steps, Curb/Gutter.
- **Results:** shown after `Calculate`. They include volume (yd³, ft³), weight (tons, lb), and *"Concrete needed (bags)"* for 80/60/40 lb.
- **Material and cost:** an optional "Material" section takes bag size, yield, density and price per bag.
- **Sharing and trust:**
  - Facebook, Twitter, LinkedIn, email and embed.
  - Author photo, sources and an **updated date** (*Jun 12, 2026*).
- **Ads:** AdSense.

**What it does well:** a global unit-system toggle, weight output, an updated date.

**What it does badly:** a `Calculate` button, a generic look, no Spanish, no WhatsApp.

### 2.6 Concrete Network (concretenetwork.com)

- **Calculators:** Slab, Footing, Column and **Rebar**. The rebar tool covers bar size #3–#8, spacing, edge clearance and tie points.
- **Units:** fixed per field (thickness in inches, length in feet). There is no dropdown clutter, and this is the right default for US concrete.
- **Results:** shown after `Calculate`. They give yd³ plus *"40#, 60#, 80#"* bags.
- **Notable copy:** *"save it to your phone's home screen for one-tap access, just like an app."* They know their users are on phones but do not ship a real PWA (no manifest found).
- **Monetization:** AdSense plus heavy contractor lead-gen (*"Get Job Leads"*, city directories).

**What it does well:** fixed US units, a rebar companion, awareness of phone use.

**What it does badly:** a dated look, a `Calculate` button, ads, no offline mode, no Spanish.

### 2.7 Home Depot and Lowe's (lower confidence — automated fetch blocked with 403)

- **Home Depot:** product pages for Quikrete 60/80 lb mixes reference a *"Concrete Calculator"* and a *"Complete Your Concrete Project"* calculator placed below **Add to Cart**. The calculator turns measurements into a product bundle for that retailer.
- **Lowe's:** sells the Calculated Industries *Home ProjectCalc* handheld, marketed for *"how many 80 lb bags"*. Its on-site calculators are retailer-funnel tools.
- **Pattern:** these tools are SKU-locked. They tell you to buy *their* product and give no editable price, no comparison, no crew sharing and no independent code check.
- **Strength:** real purchase units and implied real prices. That is exactly the "exact shopping list" Maestro Calc promises, without the retailer lock-in.

### 2.8 Quikrete (quikrete.com/calculator)

- **Inputs:** a single area field, *"Enter Number of Square Feet Desired"*, with separate calculators per product (Concrete Mix 4"/6", Mortar, Fast-Setting for posts, Stucco, etc.).
- **Output:** bags in 40/50/60/80 lb, *"rounded up to the next highest whole bag"*.
- **Disclaimer:** *"All yields are approximate and do not allow for uneven substrate, waste, etc."* The tool has no waste control.
- **Language:** English only.
- **Lesson:** manufacturers think in product-specific yields. Maestro Calc should let users choose the actual mix (standard vs. fast-setting) because yields differ.

### 2.9 Construction Master Pro (Calculated Industries app) — the pro benchmark for feet-inch-fraction

- **Rating and model:** 4.8 stars (40K+ ratings). Free, then **$4.99/month or $39.99/year**.
- **Features:** dimensional math in feet, inches, fractions and metric, right-angle and rafter calculations, a materials mode, an *"Ask CMPro"* AI helper, and Bosch GLM laser integration.
- **Positive review:** *"looks and works just like the handheld version"*. Pros value keypad familiarity.
- **Negative reviews:** *"The subscription price of this app is nearly equivalent to buying a new calculator EVERY YEAR!"* and *"There is no way in good conscience that I can recommend this to any young man starting out in the trades"*.
- **Lesson:** a free web feet-inch-fraction calculator with a familiar dedicated keypad (`ft`, `in`, `/`, `16ths`) has a ready audience that resents subscriptions.

### 2.10 Other feet-inch tools and apps

- **ArchToolbox:**
  - On-screen keypad with `C`, `CE`, `⌫`, unit keys and `frac (/)`.
  - Entry sequence: *"6 <feet> 3 <space> 1 <frac /> 2 <inch> enters 6′-3½″"*. It is a correct model, but too many steps for gloves.
  - Also accepts typed `'` and `"`.
- **Inch Calculator inch-fraction tool:**
  - Shows one value in many formats (*"Inches (fraction) 5/8 · Inches (decimal) 0.625 · mm 15.875"*).
  - Includes a tape-measure image explaining tick marks. Good teaching, static visual.
- **xNeat Construction Calculator (iOS):** has *"no ads within the app"*. Ad-free is a selling point in reviews.

### 2.11 Spanish-language calculators targeting the US

- **Omni ES:** metric, Spain and Latin America (see 2.2).
- **everycalculators.com:**
  - Pages such as *"calculadora de concreto en pies cuadrados"* blocked fetches (403).
  - The search snippets read as templated SEO content.
- **calculover.com/es:** uses US facts (*"una bolsa de 80 libras rinde 0,6 pies cúbicos"*, *"~45 bolsas de 80 lb"* per yd³).
- **Overall:** Spanish SERPs for these queries are full of low-quality spam/scraper domains (checklist.atameken.kz, sparc.arl.org mirrors).
- **Conclusion:** no credible, well-designed Spanish calculator uses US units, US bag sizes and US code. The space is effectively empty.

---

## 3. Cross-cutting patterns

| Dimension | Category norm | Best seen | Maestro Calc target |
|---|---|---|---|
| Above the fold | H1 + tabs + diagram + first inputs | Inch Calculator | H1 + one-line answer + inputs + **live result peeking** at the fold |
| Units | Dropdown per field | Giga global toggle; Concrete Network fixed US defaults | Fixed jobsite defaults (ft, in) + one global US/metric switch + mixed `12' 6 1/2"` parsing |
| Fractions | Not supported in material tools | ArchToolbox keypad | Fraction chips (`¼ ½ ¾`, `1/8`, `1/16`) next to the inch field |
| Keyboard | QWERTY or plain number pad | Soup `inputmode=decimal` | `inputmode="decimal"` everywhere + custom chips for feet/inches/fractions |
| Compute trigger | `Calculate` button | Omni live | Live, no button |
| Result | Plain text or input-styled | Inch Calculator bag rows | Hero answer + **shopping list cards** in buyable units |
| Cost | Optional, generic | Omni cost card | Default US prices, editable inline, remembered per device |
| Visuals | Static diagram or stock photo | Labeled diagrams | **Live drawing with the user's dimensions** |
| Sharing | FB/X/Pinterest/LinkedIn/embed | "Link to Results" | **WhatsApp first**, SMS, copy link, print |
| Language | English only, or metric Spanish | — | ES/EN toggle with US units in both |
| Trust | Author bio + citation | Inch Calculator, Giga date | Author + reviewer + updated date + manufacturer data sheets + IRC section numbers |
| Offline | None (Concrete Network says "add to home screen") | — | Real PWA, works offline |
| Ads | Raptive/Prebid/Playwire, mid-content | — | After the result only, reserved space, CLS 0 |

---

## 4. The biggest visual and UX gaps to exploit (11)

1. **No Spanish tool with US units.** Omni ES uses 25 kg bags and m³. Nobody speaks to a contractor who buys 80 lb Quikrete at Home Depot in Spanish. An ES/EN toggle in the header that keeps `ft`, `yd³` and `80 lb` is a first-glance differentiator.
2. **Results are numbers, not a shopping list.** Inch Calculator and Giga show three bag sizes in parallel. A list like "**34 × 80 lb bags** — or 0.9 yd³ ready-mix" with a single recommended pick is something no one ships, even though Home Depot proves the demand for this.
3. **No live drawing of *my* slab.** Every competitor uses a generic labeled diagram or a stock photo. A drawing that redraws to scale as you type, with dimension callouts in ft-in, makes the tool feel alive and lets users catch typos ("that's not 40 feet").
4. **The `Calculate` button is still the norm** (5 of 6 sites). An instant result that updates as you type, with a sticky result bar, is visibly more modern.
5. **The wrong keyboards and unit dropdowns on every field.** calculator.net opens QWERTY, and the others use a number pad with no way to type a fraction. Fixed jobsite defaults, `inputmode="decimal"` and **fraction chips** remove most taps, which matters with gloves.
6. **No feet + inches + fraction entry in material calculators.** Contractors measure "12 ft 6½ in". Competitors force decimal feet or a unit switch. Parsing `12' 6 1/2"`, or using two side-by-side fields (ft | in + fraction chip), is a clear upgrade.
7. **Sharing is aimed at social feeds, not crews.** Nobody offers WhatsApp, the default messaging app for the primary user. "Send to WhatsApp" with a pre-written bilingual summary and a stateful link is a first-glance feature and a growth loop.
8. **Cost is buried or generic.** Soup offers eight currencies. Omni shows five cost outputs styled as inputs. One bold total with tappable unit prices ("$6.48 / bag ✎") is cleaner and quote-ready.
9. **No code confidence.** Roofing pages say only "permits may be required". Green, amber or red IRC check chips ("4/12 min. for asphalt shingles — IRC R905.2.2 ✓") are a visible, pro-grade trust signal no competitor shows.
10. **They are slow and look dated at the same time.** The modern-looking site (Omni) ships 1.24 MB with heavy ads. The fast one (calculator.net, 17 KB) looks like 2005. Being both fast (<1 s) and polished is an open position.
11. **No real offline or installable experience.** Concrete Network tells users to add it to the home screen but ships no manifest. A real PWA with an "Install — works without signal" prompt shown *after* a successful result fits basements and rural lots.
12. *(Bonus)* **No sunlight-grade design.** Every competitor uses light grays, thin type and blue links. A high-contrast, large-type outdoor mode is distinctive at a glance.

---

## 5. Three visual direction options

Contrast ratios below are WCAG 2.x relative-luminance values computed for this audit. For sunlight
use, aim for **≥7:1 (AAA) on all primary text and numbers**. Never put white text on mid-saturation
brand colors.

### Option A — "Cinta" (Tape Measure / Safety Yellow)

- **Mood:** jobsite-native, confident, tool-like. It evokes a tape measure and safety signage.
- **Palette:**

| Role | Hex | Contrast note |
|---|---|---|
| Ink (text) | `#111111` | 18.9:1 on white |
| Paper | `#FFFFFF` / warm surface `#F7F5F0` | ink on surface 16.0:1 |
| Signal Yellow (brand, result band) | `#FFC20E` | **only with ink text: 11.7:1**; white on yellow fails |
| Steel (secondary text) | `#475467` | 7.1:1 on `#F7F5F0` (AAA) |
| Blueprint (links, focus) | `#1D4ED8` | 6.7:1 on white |
| Pass / Warn / Fail | `#0F5132` / `#9A3412` / `#B42318` | 9.4 / 7.3 / ~6.5:1 on white |
| WhatsApp button | `#25D366` with **ink text** | 9.5:1 (white on `#25D366` is ~2:1 and fails) |

- **Type:**
  - **Archivo** (wide/condensed widths, 700–800) for H1 and the hero number.
  - **Inter** for UI.
  - **JetBrains Mono** or Inter tabular numbers for measurements.
  - All are on Google Fonts. Archivo supports Spanish diacritics.
- **Component feel:**
  - Chunky 56 px touch targets.
  - A 2 px ink border on inputs, square-ish 8 px radius.
  - A yellow result band with ruler tick marks as a decorative edge.
  - Shopping list items that look like store shelf tags.
- **Rationale:** reads instantly as "made for the trade" and survives sunlight because yellow + black is the highest-salience pair humans recognize, as in OSHA signage.

### Option B — "Plano" (Blueprint Precision)

- **Mood:** calm, engineered, trustworthy. Think architect's drawing set.
- **Palette:**

| Role | Hex | Contrast note |
|---|---|---|
| Ink | `#0F172A` | 17.1:1 on `#FAFAF7` |
| Paper | `#FAFAF7` | — |
| Blueprint Navy (brand, header, drawing lines) | `#0B3D91` | 10.0:1 with white text |
| Accent Orange (CTA, result highlight) | `#E85D04` | **use ink text (5.1:1)**; white on orange is 3.5:1 and fails for body text |
| Grid line (drawing background) | `#DCE3EE` | decorative only |
| Muted text | `#4B5563` | 7.6:1 on white |

- **Type:**
  - **IBM Plex Sans** (UI) + **IBM Plex Mono** (dimensions, drawing labels).
  - Alternative: **Space Grotesk** headings.
- **Component feel:**
  - Thin precise rules.
  - The live drawing is the hero, on a light blueprint grid with dimension lines and arrowheads.
  - Cards with 1 px borders and small caps labels.
- **Rationale:** maximizes trust for DIY homeowners and makes the live drawing feel professional. The risk is that it feels "office", and navy on mid-gray can wash out in sun.

### Option C — "Obra Nocturna" (High-Contrast Dark, Outdoor Mode)

- **Mood:** rugged, modern, device-native. It feels like a premium app on a pro's phone.
- **Palette:**

| Role | Hex | Contrast note |
|---|---|---|
| Background | `#14181F` | — |
| Text | `#F4F1EA` | 15.8:1 |
| Amber (brand, numbers) | `#FFB020` | 9.7:1 on background |
| Surface | `#1E242D` | — |
| Pass / Fail | `#34D399` / `#F87171` | both ≥7:1 on background |

- **Type:** **Barlow Condensed** (headlines, hero numbers; gives Spanish strings room) + **Barlow** (UI).
- **Component feel:**
  - Glowing amber numerics.
  - Large segmented controls.
  - Glove-friendly steppers (`−` / `+`).
- **Rationale:** dark UIs save battery and look premium, **but dark themes lose to glare in direct sunlight**, where reflected light washes out dark screens. Light, high-luminance backgrounds read better outdoors. This makes it a good secondary theme, not the default.

### Recommendation: **A — "Cinta"**, borrowing B's drawing language and offering C as dark mode

- **Why Cinta wins:**
  - It is the only direction that looks like nothing else in the category at first sight.
  - Its core pair (ink on yellow, 11.7:1; ink on white, 18.9:1) is the most robust in sunlight.
  - It signals "for contractors" in either language without words.
- **What to take from B:** draw the live slab or roof in B's blueprint style (navy `#0B3D91` lines on a faint grid, Plex Mono or tabular dimension labels) inside the Cinta frame. Precision in the drawing, boldness in the chrome.
- **What to take from C:** ship it as `prefers-color-scheme: dark` and a manual toggle, keeping amber `#FFB020` as the dark-mode equivalent of signal yellow.
- **Guardrails:**
  - Yellow is a **surface** color, never text on white (fails at ~1.6:1).
  - All numbers in the result use tabular figures.
  - Hero number ≥ 40 px; body ≥ 17 px; inputs ≥ 20 px font so iOS does not zoom.

---

## 6. Wireframe — ideal mobile Concrete (Slab) page

Target viewport 390×844. **Bold** marks the above-the-fold zone. Ads never appear between form and
result, and every ad slot reserves its height (CLS 0).

```
┌──────────────────────────────────────────┐
│ ▣ Maestro Calc        [ES | EN]   [⋮]    │  56px sticky header; ES/EN segmented, thumb-reachable
├──────────────────────────────────────────┤
│ Concrete Slab Calculator                  │  H1 (Archivo 800, 28px)
│ A 10×10 ft slab, 4" thick needs           │  Short answer (40–60 words max,
│ 1.23 yd³ ≈ 56 bags of 80 lb.              │  rewrites itself with user values)
├──────────────────────────────────────────┤
│ [ Slab ][ Footing ][ Column ][ Steps ]   │  Shape tabs (scrollable chips, 44px)
│                                           │
│ Length                                    │
│ ┌────────┐ ft ┌────────┐ in  [½][¼][¾]   │  ft | in fields, inputmode=decimal,
│ │   10   │    │   0    │                  │  fraction chips beside inches
│ └────────┘    └────────┘                  │
│ Width                                     │
│ ┌────────┐ ft ┌────────┐ in  [½][¼][¾]   │
│ │   10   │    │   0    │                  │
│ └────────┘    └────────┘                  │
│ Thickness   [ 4" ][ 5" ][ 6" ][ other ]   │  Common-value chips, not a dropdown
│ Waste  [ 5% ][•10%•][ 15% ]  ⓘ           │  Default 10%, (i) explains why
├══════════════════════════════════════════┤  ← fold (~844px)
│ ███ YOU NEED ████████████████████████████ │  Yellow result band (ink text)
│      1.36 yd³    (36.7 ft³)               │  Hero number 44px, tabular
│      incl. 10% waste                      │
├──────────────────────────────────────────┤
│  LIVE DRAWING                             │
│  ┌──────────────────────────────┐         │  SVG to scale, navy lines on faint grid
│  │                              │ 10'-0"  │  Dimension callouts update while typing
│  │          (slab, iso)         │         │  Thickness shown as extruded edge
│  └──────────────────────────────┘         │  Tap = swap top / 3D view
│            10'-0"        4" ▮             │
├──────────────────────────────────────────┤
│  SHOPPING LIST              [80 lb ▾]     │  Bag size selector (40/60/80 lb, ready-mix)
│  ┌──────────────────────────────────────┐ │
│  │ ▢ 62 × Concrete mix 80 lb   $6.48 ✎ │ │  "Shelf tag" rows; price tappable to edit
│  │ ▢  4 × 2×4 ×8 ft (forms)    $3.98 ✎ │ │  Checkbox for in-store use
│  │ ▢  1 × Rebar / mesh (opt.)   —   ✎ │ │
│  └──────────────────────────────────────┘ │
│  ⓘ Over ~1 yd³? Ready-mix truck may be    │  Smart tip: bags vs truck threshold
│    cheaper → 1.5 yd³ order                │
├──────────────────────────────────────────┤
│  ESTIMATED COST          $417.68          │  Bold total; "Prices are yours —
│  Prices edited · Reset                    │  saved on this phone"
├──────────────────────────────────────────┤
│ [ 🟢 Send on WhatsApp ]                   │  Full-width, #25D366 + ink text, 56px
│ [ 🔗 Copy link ] [ 🖨 Print ] [ ⤓ Install ]│  Link encodes state (?l=10&w=10&t=4…)
├──────────────────────────────────────────┤
│ ┌ Ad (reserved 250px, labeled) ────────┐ │  FIRST ad slot: only after result block
│ └──────────────────────────────────────┘ │
├──────────────────────────────────────────┤
│ How to use it (3–5 steps)                 │  §5.1 content order
│ Formula + worked example                  │
│ Jobsite tips & common mistakes            │
│ ┌ Ad (in-content, reserved) ───────────┐ │
│ What the code says (IRC) — if applicable  │
│ FAQ (accordions)                          │
│ Related: Gravel · Rebar · Footing         │
│ ✎ Written by … · Reviewed by … · Updated  │  Trust block + sources
│   Oct 2026 · Sources: Quikrete data sheet │
└──────────────────────────────────────────┘
  [ 1.36 yd³ · 62 bags · $418   ⤴ Share ]     Sticky mini-result bar appears when the
                                               result band scrolls off-screen (replaces
                                               nothing; anchor ad sits below it, never over)
```

### Interaction notes

- **Instant results:** recompute on every input event. Debounce the drawing to ~16 ms with `requestAnimationFrame`. No button.
- **Result visible while typing:** on focus of the last field, auto-scroll so the result band peeks above the keyboard. Alternatively, show the sticky mini-result bar the moment any input is focused.
- **Input parsing:** accept `10' 6 1/2"`, `10.5`, `10 6`, `10-6`. Show a parsed echo ("= 10 ft 6½ in") under the field.
- **Glove mode:** every target ≥ 48×48 px (56 preferred) with ≥ 8 px gaps. Steppers on thickness and waste.
- **Language toggle:** keeps state (same URL params), swaps strings only. Units stay US.
- **WhatsApp message:** pre-filled in the active language, for example: *"Losa 10×10 pies, 4" → 1.36 yd³ · 62 bolsas de 80 lb · ~$418. Ver: maestrocalc.com/es/concreto?…"*.
- **Print:** a one-page quote-style sheet with drawing, shopping list and cost, and no ads.
- **Empty and invalid states:** never blank. Show example values greyed. An out-of-range value gives an inline amber hint ("¿40 pulgadas de espesor? Revisa").

---

## 7. Anti-patterns to avoid

1. **A `Calculate` button or page reload.** 5 of 6 competitors still do this, and it feels dated.
2. **A unit dropdown on every field.** Use jobsite defaults plus one global switch.
3. **`type=text` without `inputmode`.** It opens QWERTY (calculator.net). Avoid `type=number` spinners too, because they mangle fractions and locales.
4. **Outputs styled as inputs** (Omni). The answer must look like an answer.
5. **Parallel bag-size walls** (40/50/60/80 all at once). Pick one, then let the user switch.
6. **Stock photos instead of the user's geometry.**
7. **Ads between the form and the result, sticky ads covering the result bar, or ads without reserved space** (layout shift while typing). Also avoid Prebid- or Playwire-style heavy header-bidding stacks at launch, since they would break the <1 s target.
8. **Spanish that is metric or Spain-flavored** (*hormigón*, kg, m³) for US users, or machine-translated templated pages. Use neutral US Spanish with trade loanwords (*drywall*, *pitch*, *yardas*).
9. **White text on yellow, orange or WhatsApp green.** All fail contrast. Also avoid light-gray secondary text below 7:1, which disappears in sun.
10. **Thin or light font weights and text below 16 px.** Input font below 16 px triggers iOS zoom.
11. **Social share rows aimed at desktop networks** (Pinterest, LinkedIn) at the expense of WhatsApp and SMS.
12. **Five calculators stacked on one page** (calculator.net). Use one shape at a time via tabs, with its own URL state.
13. **Modal interstitials, newsletter popups, cookie walls covering the tool, or install prompts before a result.**
14. **A dark theme as the default** for an outdoor-first audience.
15. **Hidden assumptions.** Waste %, bag yield and price sources must be visible and editable. Quikrete's *"do not allow for… waste"* disclaimer shows the cost of hiding them.

---

## 8. Sources

- Inch Calculator — Concrete: https://www.inchcalculator.com/concrete-calculator/
- Inch Calculator — Roofing: https://www.inchcalculator.com/roofing-calculator/
- Inch Calculator — Inch fraction: https://www.inchcalculator.com/inch-fraction-calculator/
- Omni — Concrete: https://www.omnicalculator.com/construction/concrete-slab
- Omni — Drywall: https://www.omnicalculator.com/construction/drywall
- Omni ES — Concreto: https://www.omnicalculator.com/es/construccion/calculadora-concreto
- Calculator.net — Concrete: https://www.calculator.net/concrete-calculator.html
- Calculator.net — Square footage: https://www.calculator.net/square-footage-calculator.html
- CalculatorSoup — Concrete: https://www.calculatorsoup.com/calculators/construction/concrete.php
- GigaCalculator — Concrete: https://www.gigacalculator.com/calculators/concrete-calculator.php
- Concrete Network: https://www.concretenetwork.com/concrete/howmuch/calculator.htm
- Quikrete calculator: https://www.quikrete.com/calculator/main.asp
- ArchToolbox feet-inch: https://www.archtoolbox.com/calculator/
- Construction Master Pro (App Store): https://apps.apple.com/us/app/370406446
- Home Depot Quikrete 80 lb product page (calculator reference): https://www.homedepot.com/p/Quikrete-80-lb-Maximum-Yield-Concrete-Mix-110080/202524830
- Lowe's Home ProjectCalc: https://www.lowes.com/pd/Calculated-Industries-Home-Projectcalc-Do-it-Yourself-Project-Calculator/1205549
- Calculover ES: https://calculover.com/es/blog/how-to-calculate-concrete-needed/
- everycalculators ES: https://everycalculators.com/calculadora-de-concreto-en-pies-cuadrados.html
- Contractor apps roundup (xNeat no-ads mention): https://www.freshbooks.com/hub/productivity/apps-contractors
