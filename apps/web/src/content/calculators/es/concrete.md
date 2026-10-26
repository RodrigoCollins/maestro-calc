---
id: concrete
locale: es
updated: 2026-10-25
ownerReview: pending
sources:
  - name: QUIKRETE Concrete Mix No. 1101 data sheet (product nos. 1101-40, 1101-60, 1101-80), revised October 2022
    url: https://www.quikrete.com/PDFs/DATA_SHEET-Concrete%20Mix%201101.pdf
    retrieved: 2026-10-25
  - name: NIST SP 811, Appendix B (factores de conversión)
    url: https://www.nist.gov/pml/special-publication-811
    retrieved: 2026-10-25
workedExample:
  netFt3: '40.00'
  totalFt3: '44.00'
  yd3: '1.63'
  bags: 74
  bagLb: 80
---

<h2 id="como-usar">Cómo usar la calculadora de concreto</h2>

La calculadora convierte las medidas de tu vaciado en el concreto que necesitas y las bolsas que debes comprar. El resultado se actualiza mientras escribes, así que no hay nada que enviar.

1. Elige la forma del vaciado: una losa, una zapata, una columna o unos escalones. Solo ves los campos de esa forma.
2. Ingresa las medidas como las lees en la cinta: 12 ft, 12 ft 6 in o 5 ft 3 1/2 in. Un número solo se lee en la unidad que muestra el campo: pies para las medidas largas y pulgadas para el espesor, la profundidad y la altura del escalón. Cambia a métrico para escribir metros y centímetros.
3. Ajusta el extra por desperdicio. La calculadora empieza en 10 por ciento y lo puedes cambiar en el campo o con los dos botones.
4. Elige el tamaño de bolsa que vas a comprar: 40, 60 u 80 lb.
5. Si quieres ver costos, escribe el precio de una bolsa o el precio del premezclado por yarda cúbica. Un precio vacío cuenta como cero y su fila de costo queda oculta.

El resultado muestra el concreto en yardas cúbicas, pies cúbicos y metros cúbicos, el volumen antes del extra y la cantidad de bolsas enteras. Usa Copiar enlace para enviar tus números exactos a un socio o a un proveedor, y el enlace English para abrir los mismos números en inglés.

<h2 id="formulas">Fórmulas y ejemplo resuelto</h2>

Cada forma parte de un volumen, y el volumen es una fórmula geométrica sencilla:

- Losa: largo × ancho × espesor.
- Zapata: largo × ancho de la zapata × profundidad de la zapata × cantidad de piezas.
- Columna, un cilindro: π × (diámetro ÷ 2)² × altura × cantidad de piezas.
- Escalones: cada escalón es un bloque macizo desde el suelo hasta su propia huella, así que el escalón 1 tiene una altura de escalón (rise), el escalón 2 tiene dos, y así sucesivamente. Con N escalones, el volumen es ancho de los escalones × profundidad (run) × altura (rise) × N × (N + 1) ÷ 2.

El extra por desperdicio se suma al volumen: volumen total = volumen × (1 + extra ÷ 100). La cantidad de bolsas es el volumen total dividido entre el volumen que rinde una bolsa, redondeado hacia arriba a una bolsa entera. Tres conversiones hacen el resto: 1 yarda cúbica son 27 pies cúbicos (3 ft × 3 ft × 3 ft), 1 pie cúbico son 1,728 pulgadas cúbicas y 1 pie cúbico son 0.028316846592 metros cúbicos.

Ejemplo resuelto: una losa de 12 ft de largo, 10 ft de ancho y 4 in de espesor.

- 4 in son 1/3 ft, así que el volumen es 12 × 10 × 1/3 = 40.00 pies cúbicos.
- Con 10 por ciento de extra, el total es 40 × 1.10 = 44.00 pies cúbicos.
- En yardas cúbicas, 44 ÷ 27 = 1.63 yardas cúbicas.
- Una bolsa de 80 lb rinde aproximadamente 0.60 pies cúbicos, así que 44 ÷ 0.60 = 73.3 y compras 74 bolsas de 80 lb.

La misma losa necesita 98 bolsas de 60 lb (aproximadamente 0.45 pies cúbicos cada una) o 147 bolsas de 40 lb (aproximadamente 0.30 pies cúbicos cada una). Los rendimientos son las cifras aproximadas del fabricante para una mezcla. Otro producto puede rendir un poco más o un poco menos, así que revisa la etiqueta de la bolsa que compres.

La calculadora conserva fracciones exactas desde el primer dato hasta el último paso. Redondea hacia arriba la cantidad de bolsas y redondea las cifras solo cuando te las muestra. La página [Cómo calculamos](/es/metodologia#concreto) detalla las fórmulas, los rendimientos y las pruebas.

<h2 id="consejos">Consejos de obra y errores comunes</h2>

El extra es una regla general, no una norma. Diez por ciento es un punto de partida común para derrames, terreno disparejo y una zanja excavada de más. Usa más cuando el terreno está irregular o los moldes no están a escuadra, y menos cuando la base está plana y los moldes están ajustados. Tú decides, y la calculadora te sigue.

Revisa la unidad de cada número antes de leer la respuesta. El error más común es escribir pulgadas donde se esperan pies, o al revés. Escribe tú mismo la unidad, por ejemplo 4 in o 12 ft, y la calculadora lee exactamente lo que escribiste.

Redondea las bolsas hacia arriba, nunca hacia abajo. Una losa que se queda sin concreto a la mitad deja una junta fría, así que sale más barato cargar una bolsa de sobra que quedarse corto por una.

Para varias zapatas o columnas iguales, ingresa una pieza y ajusta la cantidad de piezas. Para piezas de distinto tamaño, usa la calculadora una vez por cada tamaño y suma los resultados.

Las bolsas y el premezclado son dos formas de comprar el mismo volumen. Mezclar decenas de bolsas a mano es trabajo lento, así que escribe los dos precios y compara los dos costos. El premezclado se pide por yarda cúbica, y tu proveedor define el pedido mínimo y los incrementos. Esta calculadora no redondea a los tamaños del camión, así que pregunta al proveedor cuál es la entrega más pequeña y si una carga corta cuesta extra.

Una losa de 4 in es un espesor común para banquetas y patios, y las entradas de vehículos suelen ser más gruesas. Mide el espesor real que piensas vaciar, porque un cambio pequeño de espesor cambia rápido el volumen de una losa grande.

Son estimaciones. Confirma las cantidades con tu proveedor y con el código de construcción local antes de hacer el pedido.

<h2 id="preguntas-frecuentes">Preguntas frecuentes</h2>

### ¿Cuántas bolsas de 80 lb de concreto necesito para una losa de 12 ft por 10 ft y 4 in de espesor?

Aproximadamente 74 bolsas con 10 por ciento de extra. La losa tiene 40 pies cúbicos, 44 pies cúbicos con el extra, y una bolsa de 80 lb rinde aproximadamente 0.60 pies cúbicos. Sin extra necesitas 67 bolsas.

### ¿Cuántas yardas cúbicas de concreto lleva una losa de 4 in?

Multiplica el largo por el ancho en pies, multiplica por 1/3 para 4 pulgadas y divide entre 27. Una losa de 12 ft por 10 ft tiene 40 pies cúbicos, es decir 1.48 yardas cúbicas antes del extra y 1.63 yardas cúbicas con 10 por ciento de extra.

### ¿Cuánto concreto rinde una bolsa de mezcla?

Según la ficha técnica del fabricante, una bolsa de 80 lb rinde aproximadamente 0.60 pies cúbicos, una de 60 lb aproximadamente 0.45 y una de 40 lb aproximadamente 0.30. Revisa la etiqueta de tu producto, porque el rendimiento cambia entre productos.

### ¿Cuánto extra de concreto debo pedir?

Diez por ciento es una regla general común y es donde empieza la calculadora. Súbelo si el terreno está disparejo o las zanjas se cavaron a mano, y bájalo si la base está plana y los moldes están ajustados. El campo y los dos botones aceptan cualquier valor de 0 a 50 por ciento.

### ¿Me conviene comprar bolsas o premezclado?

Escribe el precio de una bolsa y el precio del premezclado por yarda cúbica, y la calculadora te muestra los dos costos. Los proveedores de premezclado fijan un pedido mínimo y ciertos incrementos, y la calculadora no los aplica, así que pregunta a tu proveedor antes de decidir.

### ¿Cómo calculo el concreto de una columna redonda?

Usa el área del círculo por la altura. Con los valores iniciales de 12 in de diámetro y 8 ft de altura, una columna son aproximadamente 6.28 pies cúbicos. Con 10 por ciento de extra son aproximadamente 6.91 pies cúbicos, es decir 12 bolsas de 80 lb.

### ¿Cómo calculo el concreto de unos escalones?

Elige Escalones y escribe el ancho, la altura (rise), la profundidad (run) y la cantidad de escalones. Cada escalón es un bloque desde el suelo, así que el volumen crece con cada uno. Los tres escalones iniciales son aproximadamente 12.83 pies cúbicos antes del extra. Con 10 por ciento de extra, son 24 bolsas de 80 lb.

### ¿Puedo usar metros y centímetros?

Sí. Presiona Métrico y escribe metros para las medidas largas y centímetros para el espesor, la profundidad y la altura del escalón. Cambiar de unidad nunca cambia tus números, solo cómo se escriben. Las bolsas se quedan en libras, porque así se venden.

<h2 id="fuentes">Fuentes y fecha de revisión</h2>

Los rendimientos de las bolsas vienen de la ficha técnica de QUIKRETE para Concrete Mix No. 1101. Las conversiones de unidades vienen de NIST SP 811, Appendix B. Cada fuente de abajo muestra la fecha en que la consultamos, y después aparece la fecha de revisión.

Los resultados son estimaciones. Si encuentras un error, avísanos: la [sección de correcciones de la página sobre nosotros](/es/sobre-nosotros#correcciones) explica cómo.
