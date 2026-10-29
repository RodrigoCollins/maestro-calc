# Content draft: gravel calculator (for the owner's review)

Status: **draft, not on the site.** This file holds the page copy of the second PR, so the owner can review the numbers, the Spanish and the tone before any page exists (PLAN §5.2). Once approved, it moves into `apps/web/src/content/calculators/{en,es}/gravel.md` with `ownerReview: approved`.

Source for both languages: Cetin, Bulduk, Likos and Edil, _Weight-Volume Relationships and Conversion Factors for Soils and Aggregates of Wisconsin_, WisDOT WHRP G22-05, December 2023, Table E2 (https://wisconsindot.gov/documents2/research/0092-22-05-final-report.pdf).

Worked example (both languages, hand-verified): 20 ft by 10 ft, 4 in deep, compacted, 5 % extra. Placed volume 66.67 ft³ (2.47 yd³). With the extra: 70.00 ft³ (2.59 yd³). Weight: 4.74 tons (4.30 metric tonnes). Order: 3.68 cubic yards of loose gravel. At $45 a ton: $213.50.

---

## English

**Answer under the H1:** A 20 ft by 10 ft driveway, 4 in deep and compacted, needs about 4.74 tons of gravel.

### How to use the gravel calculator

1. Measure the length and width of the area in feet, and the depth in inches. You can type 20 ft, 12 ft 6 in or 5 ft 3 1/2 in.
2. Choose how the gravel will be placed. **Compacted** is for driveways, parking pads and the base under pavers or a shed. **Loose** is for landscaping beds, paths and drainage.
3. Keep the 5 % extra, or change it for uneven ground or spillage.
4. To see the cost, type the price per ton your yard charges.

The result shows the tons to order, the same weight in metric tonnes, and the loose volume in cubic yards for yards that sell by volume.

### Formula and worked example

- Volume in place = length × width × depth.
- Total volume = volume in place × (1 + extra ÷ 100).
- Weight = total volume × the weight of a cubic yard of gravel placed that way.
- Volume to order = weight ÷ the weight of a cubic yard of loose gravel.

The calculator uses about 1.83 tons per cubic yard for compacted gravel and about 1.29 tons per cubic yard for loose gravel. Both come from a 2023 Wisconsin DOT study of dense-graded ¾-inch base. Compacted gravel is denser, so the same space takes more tons.

Worked example: a driveway 20 ft long, 10 ft wide and 4 in deep, compacted.

- 4 in is 1/3 ft, so the volume in place is 20 × 10 × 1/3 = 66.67 cubic feet.
- With 5 % extra, that is 70.00 cubic feet, or 2.59 cubic yards (70 ÷ 27).
- At 1.83 tons per cubic yard: 2.59 × 1.83 = 4.74 tons.
- The yard loads it loose, at 1.29 tons per cubic yard: 4.74 ÷ 1.29 = 3.68 cubic yards.

### Tips and common mistakes

- Order by weight when you can. A cubic yard of gravel weighs different amounts loose and compacted, and a ton is a ton.
- A gravel driveway is usually built in layers: a coarse base and a finer top. Run the calculator once per layer.
- Gravel compacts. If you order the compacted volume as loose yards, you come up short by about a third.
- Wet gravel weighs more. If the pile was rained on, the same tons cover a little less.
- These are estimates. Confirm the weight per yard with your supplier; it changes with the stone and its size.

### FAQ

- **How much does a yard of gravel weigh?** About 1.3 tons loose and about 1.8 tons compacted, depending on the stone.
- **How many tons of gravel do I need for a driveway?** Multiply length × width × depth to get cubic yards, then multiply by about 1.83 for a compacted driveway. A 20 × 10 ft driveway 4 in deep needs about 4.74 tons.
- **How deep should driveway gravel be?** Many driveways use 4 to 8 inches in total, in two or three layers. Follow your local practice and the soil.

---

## Español

**Respuesta bajo el H1:** Una entrada de autos de 20 ft por 10 ft, con 4 in de profundidad y compactada, necesita unas 4.74 toneladas de grava.

### Cómo usar la calculadora de grava

1. Mide el largo y el ancho del área en pies, y la profundidad en pulgadas. Puedes escribir 20 ft, 12 ft 6 in o 5 ft 3 1/2 in.
2. Elige cómo se coloca la grava. **Compactada** es para entradas de autos, estacionamientos y la base bajo adoquines o un cobertizo. **Suelta** es para jardines, caminos y drenaje.
3. Deja el 5 % de extra, o cámbialo si el terreno es disparejo o si se pierde material al descargar.
4. Para ver el costo, escribe el precio por tonelada que cobra tu proveedor.

El resultado muestra las toneladas a pedir, el mismo peso en toneladas métricas y el volumen suelto en yardas cúbicas, para los proveedores que venden por volumen.

### Fórmula y ejemplo resuelto

- Volumen colocado = largo × ancho × profundidad.
- Volumen total = volumen colocado × (1 + extra ÷ 100).
- Peso = volumen total × lo que pesa una yarda cúbica de grava colocada de esa forma.
- Volumen a pedir = peso ÷ lo que pesa una yarda cúbica de grava suelta.

La calculadora usa aproximadamente 1.83 toneladas por yarda cúbica para la grava compactada y aproximadamente 1.29 para la grava suelta. Los dos valores vienen de un estudio de 2023 del Departamento de Transporte de Wisconsin sobre base de grava de ¾ de pulgada. La grava compactada es más densa, así que el mismo espacio lleva más toneladas.

Ejemplo resuelto: una entrada de autos de 20 ft de largo, 10 ft de ancho y 4 in de profundidad, compactada.

- 4 in son 1/3 ft, así que el volumen colocado es 20 × 10 × 1/3 = 66.67 pies cúbicos.
- Con 5 % de extra son 70.00 pies cúbicos, o 2.59 yardas cúbicas (70 ÷ 27).
- A 1.83 toneladas por yarda cúbica: 2.59 × 1.83 = 4.74 toneladas.
- El proveedor la carga suelta, a 1.29 toneladas por yarda cúbica: 4.74 ÷ 1.29 = 3.68 yardas cúbicas.

### Consejos de obra y errores comunes

- Pide por peso cuando puedas. Una yarda cúbica de grava pesa distinto suelta que compactada, y una tonelada es una tonelada.
- Una entrada de grava suele llevar capas: una base gruesa y una capa fina arriba. Usa la calculadora una vez por capa.
- La grava se compacta. Si pides el volumen compactado como yardas sueltas, te falta cerca de un tercio.
- La grava mojada pesa más. Si llovió sobre la pila, las mismas toneladas rinden un poco menos.
- Son estimaciones. Confirma con tu proveedor cuánto pesa la yarda; cambia según la piedra y su tamaño.

### Preguntas frecuentes

- **¿Cuánto pesa una yarda de grava?** Cerca de 1.3 toneladas suelta y cerca de 1.8 compactada, según la piedra.
- **¿Cuántas toneladas de grava necesito para una entrada de autos?** Multiplica largo × ancho × profundidad para sacar las yardas cúbicas, y multiplica por aproximadamente 1.83 si la vas a compactar. Una entrada de 20 × 10 ft con 4 in de profundidad lleva unas 4.74 toneladas.
- **¿Qué profundidad lleva la grava de una entrada de autos?** Muchas entradas usan de 4 a 8 pulgadas en total, en dos o tres capas. Sigue la práctica de tu zona y el tipo de suelo.
