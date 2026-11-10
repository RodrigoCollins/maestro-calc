---
id: board-feet
locale: es
updated: 2026-11-10
ownerReview: approved
sources:
  - name: DOC PS 20-20, American Softwood Lumber Standard (2.2 Board measure; tabla 3, medidas nominales y cepilladas)
    url: https://www.nist.gov/document/doc-ps-20-20-american-softwood-lumber-standard
    retrieved: 2026-11-10
  - name: NIST SP 811, Appendix B (factores de conversión)
    url: https://www.nist.gov/pml/special-publication-811
    retrieved: 2026-10-27
workedExample:
  query: v=1&n=10&pp=3/2
  boardFeet: '53.33'
  each: '5.33'
  ft3: '4.44'
  m3: '0.126'
  cost: '$80.00'
---

<h2 id="como-usar">Cómo usar la calculadora de pies tablares</h2>

El pie tablar (también llamado pie tabla o board foot) es la unidad en que se vende la madera: una pieza de 1 pulgada de grosor, 12 pulgadas de ancho y 1 pie de largo. La calculadora da los pies tablares de cualquier pieza de madera con su grosor, su ancho y su largo, los multiplica por el número de piezas y calcula el costo del lote cuando sabes el precio por pie tablar. El resultado cambia mientras escribes.

1. Ingresa el grosor y el ancho en pulgadas. Para madera de construcción, escribe la medida de su nombre: un 2x4 es 2 in por 4 in. Un número solo se lee en pulgadas, y también puedes usar fracciones, como 1 1/2.
2. Ingresa el largo en pies, como lo vende la maderería: 8 ft, 10 ft, 12 ft o 16 ft. Un número solo se lee en pies; 30 in también funciona.
3. Ingresa el número de piezas y, si tienes una cotización, el precio por pie tablar. El costo aparece en cuanto escribes un precio.
4. Lee los pies tablares. La cifra grande es el total de todas las piezas; el panel también muestra los pies tablares de una pieza, el volumen en pies cúbicos y en metros cúbicos, y el costo.

Para trabajar en métrico, toca Métrico (m, cm). El grosor y el ancho se leen entonces en centímetros y el largo en metros, y el resultado sigue en pies tablares, la unidad en que se cotiza la madera. Usa Copiar enlace para mandar la cuenta exacta a un proveedor o a un cliente, y el enlace English para abrir los mismos números en inglés.

<h2 id="formulas">Fórmulas y ejemplo resuelto</h2>

Los pies tablares de una pieza son su grosor en pulgadas, por su ancho en pulgadas, por su largo en pies, entre 12:

- Pies tablares de una pieza = grosor (in) × ancho (in) × largo (ft) ÷ 12.
- Pies tablares del lote = pies tablares de una pieza × el número de piezas.
- Pies cúbicos = pies tablares ÷ 12, porque un pie tablar es 1 in × 12 in × 12 in, exactamente 144 pulgadas cúbicas, la doceava parte de un pie cúbico.
- Costo = pies tablares × precio por pie tablar.

La norma estadounidense de madera blanda (DOC PS 20-20, American Softwood Lumber Standard, sección 2.2) define la medida en pies tablares como el grosor nominal en pulgadas, por el ancho nominal en pies, por el largo en pies. El ancho en pies es el ancho en pulgadas entre 12, y de ahí sale el ÷ 12 de la fórmula.

Ejemplo resuelto: diez barrotes 2x4 de 8 ft, a $1.50 el pie tablar.

- Una pieza es 2 in × 4 in × 8 ft ÷ 12 = 64 ÷ 12 = 5.33 pies tablares.
- Diez piezas son 10 × 64 ÷ 12 = 640 ÷ 12 = 53.33 pies tablares.
- En pies cúbicos, 53.33 ÷ 12 = 4.44 pies cúbicos, que son 0.126 metros cúbicos.
- A $1.50 el pie tablar, el lote cuesta 640 ÷ 12 × 1.50 = $80.00.

La calculadora guarda fracciones exactas hasta que muestra las cifras, así que el costo sale de 640/12 pies tablares, no del 53.33 redondeado. La página [Cómo calculamos](/es/metodologia#pies-tablares) da las fórmulas y los casos que probamos.

<h2 id="consejos">Medida nominal y medida real, y errores comunes</h2>

Un 2x4 no mide 2 pulgadas por 4 pulgadas. El nombre es su medida nominal; una vez seca y cepillada, la tabla 3 de PS 20-20 fija su medida mínima en 1 1/2 in por 3 1/2 in. La misma tabla da un 2x6 seco de 1 1/2 por 5 1/2 in, un 2x8 de 1 1/2 por 7 1/4 in, un 2x10 de 1 1/2 por 9 1/4 in, un 2x12 de 1 1/2 por 11 1/4 in, un 4x4 de 3 1/2 por 3 1/2 in y una tabla 1x6 de 3/4 por 5 1/2 in.

Los pies tablares de la madera blanda se cuentan con la medida nominal: la regla de la norma toma el grosor nominal y el ancho nominal. Escribe 2 y 4 para un 2x4 cuando revises la cuenta de una maderería o una factura. Escribe la medida real cuando necesites la madera que de verdad tiene la pieza, para un peso o para comparar proveedores: un 2x4x8 tiene 5.33 pies tablares por su nombre, y 3.50 pies tablares de madera con su medida cepillada.

El largo no se reduce: un barrote de 8 ft se vende y se cuenta como de 8 ft. La madera viene en largos de pies pares, así que una lista de cortes de piezas de 7 ft se compra, y se cuenta, en piezas de 8 ft.

La madera dura se vende muchas veces en bruto, con el grosor escrito en cuartos de pulgada: 4/4 es 1 in, 5/4 es 1 1/4 in y 8/4 es 2 in. Pregunta al vendedor si la cuenta usa la medida en bruto o la cepillada, y escribe la medida con que se cotiza el precio.

El error más común es mezclar unidades. El grosor y el ancho van en pulgadas y el largo en pies: un 2x6 de 10 ft es 2 × 6 × 10 ÷ 12 = 10 pies tablares, mientras que 2 × 6 × 120 ÷ 12 daría doce veces más. Si tu largo está en pulgadas, escríbelo con su unidad, como 120 in, y la calculadora lo convierte.

Los pies tablares miden volumen, no el costo por sí solos. Los precios por pie tablar cambian con la especie, el grado y la humedad, así que compara cotizaciones de la misma especie y el mismo grado, y confirma la cuenta con tu proveedor antes de pedir.

<h2 id="preguntas-frecuentes">Preguntas frecuentes</h2>

### ¿Cómo se calculan los pies tablares?

Multiplica el grosor en pulgadas por el ancho en pulgadas y por el largo en pies, y divide entre 12. Un 2x6 de 10 ft es 2 × 6 × 10 ÷ 12 = 10 pies tablares. Para varias piezas de la misma medida, multiplica por el número de piezas.

### ¿Cuántos pies tablares tiene un 2x4x8?

5.33 pies tablares por su medida nominal: 2 × 4 × 8 ÷ 12 = 64 ÷ 12. Con su medida cepillada seca, 1 1/2 por 3 1/2 in, la madera de la pieza son 3.50 pies tablares. Las madererías cuentan la madera blanda de construcción por la medida nominal.

### ¿Un pie tablar es lo mismo que un pie cuadrado?

No. Un pie cuadrado es un área; un pie tablar es un volumen, un pie cuadrado de superficie de 1 pulgada de grosor. Una tabla de 1 in cubre un pie cuadrado por pie tablar, y un tablón de 2 in cubre medio pie cuadrado por pie tablar.

### ¿Cuántos pies tablares tiene un pie cúbico?

Doce. Un pie cúbico es 12 in × 12 in × 12 in, y un pie tablar es 12 in × 12 in × 1 in, así que doce pies tablares apilados forman un pie cúbico. Un metro cúbico tiene unos 423.78 pies tablares.

### ¿Uso la medida nominal o la real?

Usa la medida nominal para revisar la cuenta de madera blanda o un precio por pie tablar, porque la norma estadounidense cuenta los pies tablares con las medidas nominales. Usa la medida real cuando necesites el volumen de madera de verdad, por ejemplo para estimar un peso.

### ¿Cómo calculo el precio de la madera que se vende por pie tablar?

Saca los pies tablares de todo el pedido y multiplícalos por el precio por pie tablar. Diez 2x4x8 a $1.50 el pie tablar son 53.33 pies tablares y cuestan $80.00. Escribe el precio en la calculadora y hace los dos pasos.

### ¿Cuántos pies tablares tiene un 4x4x8?

10.67 pies tablares: 4 × 4 × 8 ÷ 12 = 128 ÷ 12. Un 4x4 tiene el doble de pies tablares que un 2x4 del mismo largo.

### ¿Puedo usar centímetros y metros?

Sí. Toca Métrico (m, cm) y escribe el grosor y el ancho en centímetros y el largo en metros. El resultado sigue en pies tablares, con el volumen en metros cúbicos al lado.

<h2 id="fuentes">Fuentes y fecha de revisión</h2>

La regla de los pies tablares y las medidas nominales y cepilladas vienen de DOC PS 20-20, la norma estadounidense de madera blanda (American Softwood Lumber Standard), publicada por el Instituto Nacional de Estándares y Tecnología (NIST). El factor de pulgadas a metros viene de la publicación especial 811 de NIST. Las fuentes de abajo muestran la fecha en que las consultamos, y después va la fecha de revisión.

Los resultados son estimaciones. Si encuentras un error, avísanos: la [sección de correcciones de la página sobre nosotros](/es/sobre-nosotros#correcciones) explica cómo.
