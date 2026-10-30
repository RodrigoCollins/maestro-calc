---
id: roof-pitch
locale: es
updated: 2026-10-30
ownerReview: approved
sources:
  - name: 2021 International Residential Code, Chapter 9, Section R905 (minimum roof slopes)
    url: https://codes.iccsafe.org/content/IRC2021P2/chapter-9-roof-assemblies
    retrieved: 2026-10-30
  - name: NIST SP 811, Appendix B (conversion factors)
    url: https://www.nist.gov/pml/special-publication-811
    retrieved: 2026-10-30
workedExample:
  query: v=1
  pitch: '6.00'
  angle: '26.57'
  rafterFt: '14.53'
  rafterM: '4.43'
---

<h2 id="como-usar">Cómo usar la calculadora de pendiente de techo</h2>

La calculadora convierte una subida y un recorrido en la pendiente de un techo, su ángulo y el largo de un cabio, y compara la pendiente con el mínimo que fija el International Residential Code para la cubierta que vas a usar. El resultado se actualiza mientras escribes, así que no hay nada que enviar.

1. Mide la subida y el recorrido. Lo común es apoyar un nivel en el techo, marcar 12 pulgadas sobre el nivel y medir en vertical hasta el techo: esa es la subida en un recorrido de 12 pulgadas. También puedes usar cualquier subida y recorrido que conozcas, como la altura de la cumbrera sobre la mitad del ancho de la casa. Un número solo se lee en pulgadas.
2. Escribe el recorrido del cabio: la distancia horizontal que cubre el cabio, por lo general la mitad del claro de la casa. Un número solo se lee en pies.
3. Escribe el alero, medido a nivel desde la pared hasta la punta del cabio. Un número solo se lee en pulgadas.
4. Elige la cubierta del techo, para que la calculadora compare la pendiente con su mínimo.

El resultado empieza por la pendiente en pulgadas de subida por cada 12 pulgadas de recorrido, como la dicen los techeros. También muestra el ángulo en grados y el largo del cabio en pies y en metros. La respuesta dice si la pendiente cumple el mínimo para la cubierta, si pide dos capas de fieltro o si es demasiado baja.

Para trabajar en métrico, toca Métrico (m, cm). Las medidas se leen entonces en centímetros y metros, y el resultado empieza por el ángulo en grados. Cambiar de unidades nunca cambia tus números, solo cómo se escriben. Usa Copiar enlace para mandar tus números exactos a un socio, un cliente o el inspector, y el enlace English para abrir los mismos números en inglés.

<h2 id="formulas">Fórmulas y ejemplo resuelto</h2>

La calculadora va de la subida y el recorrido al ángulo y al cabio:

- Inclinación = subida ÷ recorrido.
- Pendiente en 12 = inclinación × 12.
- Ángulo = arcotangente de la inclinación, en grados.
- Largo del cabio = (recorrido del cabio + alero) × √(1 + inclinación²).

El ángulo y la raíz cuadrada no son fracciones exactas. La calculadora conserva la raíz con veinte decimales y el ángulo dentro de una cien trillonésima de grado, mucho más fino que cualquier cifra que muestra.

Ejemplo resuelto: un techo que sube 6 in por cada 12 in de recorrido, con 12 ft de recorrido del cabio, 12 in de alero y tejas asfálticas.

- La inclinación es 6 ÷ 12 = 1/2, así que la pendiente es 6.00 en 12.
- El ángulo es la arcotangente de 1/2, que es 26.57 grados.
- El cabio cubre 12 ft más 12 in, o 13 ft de recorrido. √(1 + 1/4) = 1.1180, así que el cabio mide 13 × 1.1180 = 14.53 ft, o 4.43 m.
- Las tejas asfálticas piden al menos 2 en 12, y dos capas de fieltro debajo de 4 en 12, así que 6 en 12 cumple el código con una capa.

La página [Cómo calculamos](/es/metodologia#pendiente-de-techo) lista las fórmulas, las secciones del código y los casos que probamos.

<h2 id="consejos">Consejos de obra y errores comunes</h2>

Mide el recorrido a nivel, no sobre el techo. Una cinta apoyada sobre la superficie del techo mide el cabio, no el recorrido, y da una pendiente demasiado baja.

El largo del cabio es el largo sobre el canto de arriba, desde la línea a plomo en la cumbrera hasta la punta del alero, antes de cualquier corte. Resta la mitad del espesor de la tabla de cumbrera y suma lo que pidan tus cortes antes de pedir la madera.

Las pendientes bajas piden cuidado. Debajo de 4 en 12, las tejas asfálticas y la teja de barro o concreto llevan dos capas de fieltro según el código, y cada cubierta tiene un mínimo que no puede bajar. Si la respuesta dice que la pendiente es demasiado baja, elige otra cubierta o pregunta a tu proveedor por un sistema para pendiente baja.

Los códigos locales pueden modificar el IRC, y los fabricantes pueden pedir más que el código. Revisa los dos antes de empezar.

La calculadora no dimensiona cabios. Las tablas de claros dependen de la especie, el grado, la separación y las cargas de tu zona.

Son estimaciones. Confírmalas con tus planos y con el departamento de construcción de tu zona.

<h2 id="preguntas-frecuentes">Preguntas frecuentes</h2>

### ¿Cómo saco la pendiente de un techo?

Apoya un nivel en el techo, marca 12 pulgadas sobre el nivel y mide en vertical hasta la superficie del techo. Esa medida es la subida en 12. Una subida de 6 pulgadas es una pendiente de 6 en 12, unos 26.57 grados.

### ¿Cómo paso la pendiente a grados?

Divide la subida por el recorrido y saca la arcotangente. Una pendiente de 4 en 12 son unos 18.43 grados, 6 en 12 son unos 26.57 grados y 12 en 12 son 45 grados.

### ¿Cuál es la pendiente mínima para tejas asfálticas?

El International Residential Code de 2021, sección R905.2.2, permite tejas asfálticas desde 2 en 12, y pide dos capas de fieltro desde 2 en 12 hasta 4 en 12.

### ¿Cuál es la pendiente mínima para metal, teja y pizarra?

Según el IRC de 2021, las tejas metálicas piden al menos 3 en 12, la teja de barro o concreto al menos 2 1/2 en 12, la pizarra al menos 4 en 12, las tejas y tablillas de madera al menos 3 en 12, y el rollo asfáltico al menos 1 en 12.

### ¿Cuánto mide un cabio para un techo de 6 en 12?

Multiplica el recorrido por unos 1.118. Un cabio sobre 12 ft de recorrido con 12 in de alero mide unos 14.53 ft antes de los cortes.

### ¿Qué es una pendiente de 12 en 12?

Un techo que sube 12 pulgadas por cada 12 pulgadas de recorrido, un ángulo de 45 grados. Sus cabios miden unas 1.414 veces su recorrido.

### ¿La calculadora dimensiona los cabios?

No. La sección del cabio depende de la especie, el grado, la separación y las cargas de tu zona. Usa las tablas de claros de tu código o consulta a un ingeniero.

### ¿Puedo usar centímetros?

Sí. Toca Métrico (m, cm) y escribe la subida, el recorrido y el alero en centímetros y el recorrido del cabio en metros. El resultado empieza por el ángulo en grados. Cambiar de unidades nunca cambia tus números, solo cómo se escriben.

<h2 id="fuentes">Fuentes y fecha de revisión</h2>

Las pendientes mínimas vienen del International Residential Code de 2021, capítulo 9, sección R905: R905.2.2 tejas asfálticas, R905.3.2 teja de barro y concreto, R905.4.2 tejas metálicas, R905.5.2 rollo asfáltico con superficie mineral, R905.6.2 pizarra, y R905.7.2 y R905.8.2 tejas y tablillas de madera. El factor de pulgadas a metros viene de NIST Special Publication 811, apéndice B. Las fuentes de abajo muestran la fecha en que las consultamos, y luego sigue la fecha de revisión.

Los resultados son estimaciones. Si encuentras un error, avísanos: la [sección de correcciones de la página sobre nosotros](/es/sobre-nosotros#correcciones) explica cómo.
