---
id: methodology
locale: es
updated: 2026-10-28
ownerReview: approved
---

# Cómo calculamos

Maestro Calc crea calculadoras de obra. Esta página describe las reglas que sigue cada calculadora, y lista las fórmulas, las constantes y los casos de prueba de cada calculadora que publicamos. Cada calculadora que publiquemos cumplirá estas reglas.

## Cálculos exactos

Los cálculos usan números exactos, escritos como fracciones, desde el primer dato hasta el último paso. Nada se redondea por el camino. El resultado se redondea una sola vez, cuando te lo mostramos, y la calculadora te dice cómo lo redondeó.

## Fórmulas probadas

Cada fórmula tiene pruebas automáticas. Cada prueba usa un caso resuelto a mano, así que una fórmula incorrecta falla una prueba antes de llegar a ti.

## Fuentes y fechas de revisión

Cada página de calculadora cita sus fuentes y muestra la fecha de la última revisión. Cuando una fuente cambia, revisamos la calculadora otra vez.

<!-- Un elemento h2 en bruto mantiene estable el ancla de la sección si cambia el título. -->

<h2 id="concreto">Calculadora de concreto</h2>

La [calculadora de concreto](/es/calculadora-de-concreto) estima el concreto para una losa, una zapata, una columna o unos escalones, y las bolsas de mezcla que debes comprar. Cada medida se conserva como un número exacto, y el resultado se redondea solo cuando te lo mostramos.

Cada forma parte de un volumen:

- Losa: largo × ancho × espesor.
- Zapata: largo × ancho × profundidad × piezas.
- Columna, un cilindro: π × (diámetro / 2)² × altura × piezas.
- Escalones: ancho de los escalones × profundidad (run) × altura (rise) × N(N+1)/2, donde N es la cantidad de escalones. Cada escalón es un bloque macizo desde el suelo hasta su propia huella.

El extra por desperdicio se suma al volumen antes de contar las bolsas: volumen total = volumen × (1 + extra / 100). La cantidad de bolsas es el volumen total dividido entre el volumen que rinde una bolsa, redondeado hacia arriba a una bolsa entera. El 10 por ciento de extra con el que empezamos es una regla general que puedes cambiar, no una norma.

Una bolsa rinde aproximadamente 0.30 pies cúbicos (40 lb), 0.45 pies cúbicos (60 lb) o 0.60 pies cúbicos (80 lb). Estos rendimientos vienen de la ficha técnica del fabricante: QUIKRETE Concrete Mix No. 1101 data sheet (product nos. 1101-40, 1101-60, 1101-80), revised October 2022, `https://www.quikrete.com/PDFs/DATA_SHEET-Concrete%20Mix%201101.pdf`, consultada el 2026-10-25. Los rendimientos reales varían según el producto y la mezcla, así que toma la cantidad de bolsas como una estimación.

La columna usa π = 3.14159265358979323846264338327950288. Es una aproximación, y su error es menor que 10⁻³⁵.

Casos verificados a mano. Las pruebas automáticas ejecutan estos casos en la calculadora y comparan cada cifra de abajo con el resultado. Los volúmenes están en pies cúbicos, y las bolsas son de 80 lb.

| Caso                                                                                                       | Volumen sin extra | Volumen con 10% de extra | Yardas cúbicas | Bolsas |
| ---------------------------------------------------------------------------------------------------------- | ----------------- | ------------------------ | -------------- | ------ |
| Losa, 12 ft × 10 ft × 4 in (valores iniciales)                                                             | 40.00             | 44.00                    | 1.63           | 74     |
| Zapata, 18 ft × 16 in × 8 in, 3 piezas (`?v=1&sh=footing&l=216&n=3`)                                       | 48.00             | 52.80                    | 1.96           | 88     |
| Columna, 12 in de diámetro × 8 ft, 1 pieza (`?v=1&sh=column`)                                              | 6.28              | 6.91                     | 0.26           | 12     |
| Escalones, 3 escalones, 4 ft de ancho, 7 in de altura (rise), 11 in de profundidad (run) (`?v=1&sh=steps`) | 12.83             | 14.12                    | 0.52           | 24     |

<h2 id="pies-cuadrados">Calculadora de pies cuadrados</h2>

La [calculadora de pies cuadrados](/es/calculadora-de-pies-cuadrados) calcula el área de un rectángulo, como un cuarto, un piso o una losa, a partir de su largo y su ancho. Cada medida se conserva como un número exacto, y el resultado se redondea solo cuando te lo mostramos.

La fórmula y sus dos conversiones:

- Área en pies cuadrados = largo × ancho, con los dos lados en pies.
- Área en yardas cuadradas = área en pies cuadrados ÷ 9, porque un pie cuadrado es exactamente 1/9 de yarda cuadrada.
- Área en metros cuadrados = área en pies cuadrados × 0.09290304, porque un pie cuadrado es exactamente 0.09290304 metros cuadrados.

Las dos constantes son exactas. El pie internacional mide exactamente 0.3048 metros (NIST SP 811, apéndice B), así que un pie cuadrado son 0.3048 × 0.3048 = 0.09290304 metros cuadrados, y una yarda mide 3 pies, así que una yarda cuadrada son 9 pies cuadrados. Las conversiones usan estos valores exactos, y las cifras se redondean a dos decimales solo cuando te las mostramos.

Casos verificados a mano. Las pruebas automáticas ejecutan estos casos en la calculadora y comparan cada cifra de abajo con el resultado.

| Caso                               | Pies cuadrados | Yardas cuadradas | Metros cuadrados |
| ---------------------------------- | -------------- | ---------------- | ---------------- |
| 12 ft × 10 ft (`?v=1&l=144`)       | 120.00         | 13.33            | 11.15            |
| 10 ft × 10 ft (valores iniciales)  | 100.00         | 11.11            | 9.29             |
| 12 ft 6 in × 10 ft (`?v=1&l=150`)  | 125.00         | 13.89            | 11.61            |
| 20 ft × 15 ft (`?v=1&l=240&w=180`) | 300.00         | 33.33            | 27.87            |

<h2 id="grava">Calculadora de grava</h2>

La [calculadora de grava](/es/calculadora-de-grava) calcula el peso de grava a pedir para un rectángulo con cierta profundidad, compactada o suelta, y el volumen suelto que el proveedor carga para eso. Cada medida se conserva como un número exacto, y el resultado se redondea solo cuando te lo mostramos.

Las fórmulas:

- Volumen colocado = largo × ancho × profundidad.
- Volumen total = volumen colocado × (1 + extra ÷ 100).
- Peso = volumen total × toneladas por yarda cúbica según se coloca.
- Volumen a pedir = peso ÷ toneladas por yarda cúbica suelta.

Los pesos por yarda cúbica son aproximados. La grava compactada usa aproximadamente 1.83 toneladas por yarda cúbica, el punto medio del rango de 1.80 a 1.86 para base de grava de ¾ de pulgada en WisDOT WHRP G22-05, tabla E2 (diciembre de 2023). La grava suelta usa aproximadamente 1.29 toneladas por yarda cúbica, el mismo peso repartido según el esponjamiento de compactada a suelta de esa tabla (36 a 47 por ciento, punto medio 41.5). Una tonelada es una tonelada corta de 2,000 lb, y una tonelada métrica es exactamente 0.90718474 toneladas cortas (NIST SP 811, apéndice B). Las cifras se redondean a dos decimales solo cuando te las mostramos.

Casos verificados a mano. Las pruebas automáticas ejecutan estos casos en la calculadora y comparan cada cifra de abajo con el resultado.

| Caso                                                               | Toneladas | Toneladas métricas | Yardas cúbicas a pedir |
| ------------------------------------------------------------------ | --------- | ------------------ | ---------------------- |
| 20 ft × 10 ft × 4 in, compactada, 5 % de extra (valores iniciales) | 4.74      | 4.30               | 3.68                   |
| Igual, sin extra (`?v=1&ws=0`)                                     | 4.52      | 4.10               | 3.50                   |
| 30 ft × 12 ft × 6 in, compactada (`?v=1&l=360&w=144&d=6`)          | 12.81     | 11.62              | 9.93                   |
| 10 ft × 10 ft × 3 in, suelta (`?v=1&l=120&w=120&d=3&pl=loose`)     | 1.25      | 1.14               | 0.97                   |

<h2 id="mulch">Calculadora de mulch</h2>

La [calculadora de mulch](/es/calculadora-de-mulch) calcula el volumen de mulch para un área rectangular con cierta profundidad, en yardas cúbicas para pedir a granel y en bolsas enteras para comprar en la tienda. Cada medida se conserva como un número exacto, y el resultado se redondea solo cuando te lo mostramos.

Las fórmulas:

- Volumen = largo × ancho × profundidad.
- Volumen total = volumen × (1 + extra ÷ 100).
- Yardas cúbicas = volumen total ÷ 27, con el volumen en pies cúbicos.
- Bolsas = volumen total ÷ tamaño de la bolsa, redondeado hacia arriba a una bolsa entera.

No interviene ninguna constante del material: una bolsa contiene el volumen impreso en ella, 2 o 3 pies cúbicos, y una yarda cúbica es exactamente 27 pies cúbicos. Las cifras métricas usan un pie como exactamente 0.3048 metros (NIST SP 811, apéndice B). La cantidad de bolsas es la única cifra que se redondea en el cálculo, siempre hacia arriba. Los volúmenes se redondean a dos decimales solo cuando te los mostramos.

Casos verificados a mano. Las pruebas automáticas ejecutan estos casos en la calculadora y comparan cada cifra de abajo con el resultado.

| Caso                                                                     | Yardas cúbicas | Metros cúbicos | Bolsas |
| ------------------------------------------------------------------------ | -------------- | -------------- | ------ |
| 20 ft × 4 ft × 3 in, 5 % de extra, bolsas de 2 cu ft (valores iniciales) | 0.78           | 0.59           | 11     |
| Igual, bolsas de 3 cu ft (`?v=1&bg=3`)                                   | 0.78           | 0.59           | 7      |
| Igual, sin extra (`?v=1&ws=0`)                                           | 0.74           | 0.57           | 10     |
| 10 ft × 10 ft × 4 in (`?v=1&l=120&w=120&d=4`)                            | 1.30           | 0.99           | 18     |
| 30 ft × 3 ft × 2 in (`?v=1&l=360&w=36&d=2`)                              | 0.58           | 0.45           | 8      |

<h2 id="tierra-para-jardin">Calculadora de tierra para jardín</h2>

La [calculadora de tierra para jardín](/es/calculadora-de-tierra-para-jardin) calcula el volumen de tierra para un área rectangular con cierta profundidad, en yardas cúbicas para pedir a granel y en bolsas enteras para comprar en la tienda. Cada medida se conserva como un número exacto, y el resultado se redondea solo cuando te lo mostramos.

Las fórmulas:

- Volumen = largo × ancho × profundidad.
- Volumen total = volumen × (1 + extra ÷ 100).
- Yardas cúbicas = volumen total ÷ 27, con el volumen en pies cúbicos.
- Bolsas = volumen total ÷ tamaño de la bolsa, redondeado hacia arriba a una bolsa entera.

No interviene ninguna constante del material: una bolsa contiene el volumen impreso en ella, 0.75, 1 o 1.5 pies cúbicos, y una yarda cúbica es exactamente 27 pies cúbicos. El 10 por ciento de extra es una regla general para el asentamiento, no una cifra medida, y puedes cambiarlo. Las cifras métricas usan un pie como exactamente 0.3048 metros (NIST SP 811, apéndice B). La cantidad de bolsas es la única cifra que se redondea en el cálculo, siempre hacia arriba. Los volúmenes se redondean a dos decimales solo cuando te los mostramos.

Casos verificados a mano. Las pruebas automáticas ejecutan estos casos en la calculadora y comparan cada cifra de abajo con el resultado.

| Caso                                                                          | Yardas cúbicas | Metros cúbicos | Bolsas |
| ----------------------------------------------------------------------------- | -------------- | -------------- | ------ |
| 10 ft × 10 ft × 4 in, 10 % de extra, bolsas de 0.75 cu ft (valores iniciales) | 1.36           | 1.04           | 49     |
| Igual, bolsas de 1.5 cu ft (`?v=1&bg=1-5`)                                    | 1.36           | 1.04           | 25     |
| Igual, sin extra (`?v=1&ws=0`)                                                | 1.23           | 0.94           | 45     |
| 20 ft × 10 ft × 6 in (`?v=1&l=240&w=120&d=6`)                                 | 4.07           | 3.11           | 147    |
| 50 ft × 40 ft × 1 in (`?v=1&l=600&w=480&d=1`)                                 | 6.79           | 5.19           | 245    |

## Correcciones

Si encuentras un error, avísanos. La [sección de correcciones de la página sobre nosotros](/es/sobre-nosotros#correcciones) explica cómo reportarlo y cómo registramos la corrección.
