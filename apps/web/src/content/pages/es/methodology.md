---
id: methodology
locale: es
updated: 2026-10-26
ownerReview: pending
---

# Cómo calculamos

Maestro Calc crea calculadoras de obra. Esta página describe las reglas que sigue cada calculadora, y lista las fórmulas, los rendimientos y los casos de prueba de la calculadora que publicamos hoy, la calculadora de concreto. Cada calculadora que publiquemos cumplirá estas reglas.

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

## Correcciones

Si encuentras un error, avísanos. La [sección de correcciones de la página sobre nosotros](/es/sobre-nosotros#correcciones) explica cómo reportarlo y cómo registramos la corrección.
