---
id: fence
locale: es
updated: 2026-11-10
ownerReview: approved
sources:
  - name: Quikrete, Setting Posts project sheet
    url: https://www.quikrete.com/PDFs/Projects/SettingPosts.pdf
    retrieved: 2026-11-10
  - name: QUIKRETE Concrete Mix No. 1101 data sheet, revised October 2022
    url: https://www.quikrete.com/PDFs/DATA_SHEET-Concrete%20Mix%201101.pdf
    retrieved: 2026-11-10
  - name: Viance, Treated Wood, Building a Fence
    url: https://treatedwood.com/projects/building-a-fence
    retrieved: 2026-11-10
  - name: The Home Depot, Wood Fencing guide
    url: https://images.homedepot-static.com/catalog/pdfImages/66/665f47cf-0ce3-4613-b7ca-88426b6f6e03.pdf
    retrieved: 2026-11-10
  - name: America's Fence Store, picket fence guide
    url: https://pros.americasfencestore.com/pages/how-to-building-a-picket-wood-fence
    retrieved: 2026-11-10
  - name: Alta Forest Products, cedar fence installation
    url: https://pdf.lowes.com/productdocuments/1bf53922-7486-4be3-bb5e-0ff3f42a5799/40459176.pdf
    retrieved: 2026-11-10
  - name: This Old House, How to Choose and Put Up a Fence, June 3, 2026
    url: https://www.thisoldhouse.com/fences/21014933/fencing-lessons
    retrieved: 2026-11-10
  - name: DOC PS 20-20, American Softwood Lumber Standard
    url: https://www.nist.gov/document/doc-ps-20-20-american-softwood-lumber-standard
    retrieved: 2026-11-10
  - name: NIST SP 811, Appendix B
    url: https://www.nist.gov/pml/special-publication-811
    retrieved: 2026-11-10
workedExample:
  query: v=1
  posts: 14
  rails: 39
  boards: 253
  bags: 37
  concreteFt3: '21.68'
  gravelFt3: '4.21'
---

<h2 id="como-usar">Cómo usar la calculadora de cercas</h2>

La calculadora cuenta lo que lleva un tramo recto de cerca de madera: los postes, los travesaños, las tablas o estacas y las bolsas de concreto que fijan los postes. El resultado se actualiza mientras escribes, así que no hay nada que enviar.

1. Mide el largo del tramo y escríbelo como lo lees en la cinta: 100 ft, 62 ft 6 in. Un número solo se lee en pies. Para una cerca con esquinas, calcula cada tramo recto por separado.
2. Escribe la altura de la cerca sobre el suelo y la distancia entre postes. This Old House marca los hoyos cada 6 a 8 ft; la calculadora empieza en 8 ft.
3. Elige el estilo. Una cerca de privacidad tabla sobre tabla lleva dos filas de tablas, una de estacas lleva una fila con espacios, y una de travesaños no lleva tablas. Cada estilo muestra los campos de tablas que usa.
4. Deja o cambia los travesaños por tramo, los portones y el ancho del poste.
5. Para ver el costo, escribe el precio de un poste, de un travesaño, de una tabla y de una bolsa de concreto.

El resultado empieza por los postes, sigue con el poste, el hoyo, el concreto y la grava, y termina con la lista de compras.

Para trabajar en el sistema métrico, toca Métrico (m, cm). Las medidas se leen entonces en metros y centímetros. Cambiar de unidades nunca cambia tus números, solo cómo se escriben. Usa Copiar enlace para mandar tus números exactos a un socio, a un cliente o al proveedor, y el enlace English para abrir los mismos números en inglés.

<h2 id="formulas">Fórmulas y ejemplo resuelto</h2>

La calculadora va del tramo a lo que compras:

- Tramos = largo ÷ distancia entre postes, redondeado hacia arriba. Postes = tramos + 1, más 1 por cada portón, porque una abertura necesita un poste de cada lado.
- Travesaños = tramos × travesaños por tramo.
- Tablas, tabla sobre tabla = 2 × largo ÷ (ancho de la tabla + espacio entre tablas de una fila), redondeado hacia arriba: cada fila deja un espacio que la otra cubre.
- Estacas = largo ÷ (ancho de la estaca + espacio), redondeado hacia arriba.
- Ancho del hoyo = 3 × ancho del poste. Un tercio del poste va bajo tierra, que es la mitad de la altura sobre el suelo; el hoyo tiene esa profundidad más 6 in de grava.
- Concreto = (área del hoyo − área del poste) × profundidad enterrada × postes; bolsas = concreto ÷ rendimiento de una bolsa, redondeado hacia arriba.
- Grava = área del hoyo × 6 in × postes.

Las reglas del hoyo vienen de las instrucciones de Quikrete para fijar postes: un hoyo 3 veces más ancho que el poste, un tercio del poste bajo tierra y 6 in de grava en el fondo. El concreto llena el hoyo sobre la grava hasta el nivel del suelo, con pendiente para que escurra el agua, como lo indican la guía de Viance para construir una cerca y la hoja técnica de Quikrete Concrete Mix. Los rendimientos de las bolsas son los de la calculadora de concreto, de la misma hoja técnica: unos 0.60 pies cúbicos para la bolsa de 80 lb que cuenta la calculadora. Para bolsas de 40 o 60 lb, divide el concreto entre 0.30 o 0.45.

Ejemplo resuelto: una cerca de privacidad de 100 ft de largo y 6 ft de alto, con postes de 4x4 cada 8 ft, tres travesaños por tramo, sin portón, y tablas de 5 1/2 in de ancho, tabla sobre tabla, con 4 in entre las tablas de una fila.

- 100 ft ÷ 8 ft = 12.5, así que son 13 tramos y 14 postes. 13 × 3 = 39 travesaños.
- Dos tablas cubren 5.5 + 4 = 9.5 in, así que 2 × 1,200 in ÷ 9.5 in = 252.6: 253 tablas.
- Un 4x4 mide 3 1/2 in de ancho, así que el hoyo mide 10 1/2 in. La mitad de 6 ft son 36 in bajo tierra, más 6 in de grava: el hoyo tiene 42 in de profundidad, y cada poste mide 9 ft.
- Cada hoyo lleva π × 5.25 × 5.25 × 36 − 3.5 × 3.5 × 36 = 2,676 pulgadas cúbicas de concreto; 14 hoyos llevan 21.68 pies cúbicos. 21.68 ÷ 0.60 = 36.1, así que compras 37 bolsas de 80 lb.
- La grava es π × 5.25 × 5.25 × 6 pulgadas cúbicas por hoyo: 4.21 pies cúbicos para los 14 hoyos.
- A $20 el poste, $8 el travesaño, $3 la tabla y $6 la bolsa, los materiales cuestan $280, $312, $759 y $222.

La calculadora conserva fracciones exactas desde el primer dato hasta el último paso. Las cantidades se redondean hacia arriba, y las demás cifras se redondean solo al mostrarlas. La página [Cómo calculamos](/es/metodologia#cercas) muestra las fórmulas y los casos que probamos.

<h2 id="consejos">Consejos de obra y errores comunes</h2>

Compra postes que alcancen para la altura y la profundidad: una cerca de 6 ft lleva postes de 9 ft, así que compra el siguiente largo que venda tu maderería y córtalo.

Ajusta los travesaños a la altura. La guía de cercas de Home Depot usa tres travesaños en cercas de 6 ft de alto o más y dos en las más bajas, y la guía de Viance sugiere tres para estacas de 60 in o más.

Separa las tablas según el estilo. America's Fence Store deja unas 2 1/2 in entre las estacas de una cerca de estacas, y Alta Forest Products separa 4 in las tablas de cada fila de una cerca tabla sobre tabla cuando son tablas de 6 in. Si tu cerca rodea una piscina, revisa en el código local la abertura máxima que permite.

Espera antes de cargar los postes. La hoja técnica de Quikrete para su Concrete Mix normal indica esperar 24 horas antes de que el poste reciba cualquier esfuerzo.

La calculadora no cuenta clavos, tornillos, bisagras ni pasadores.

Revisa el límite del terreno, el código local, la profundidad de congelamiento y las reglas de la asociación de propietarios antes de excavar, y llama al 811 para que marquen las líneas de servicios enterradas. Son estimaciones; confirma las cantidades con tu proveedor antes de pedir.

<h2 id="preguntas-frecuentes">Preguntas frecuentes</h2>

### ¿Cuántos postes necesito para una cerca?

Divide el largo entre la distancia entre postes, redondea hacia arriba y suma uno, y luego suma uno por cada portón. Una cerca de 100 ft con postes cada 8 ft necesita 14 postes.

### ¿A qué distancia van los postes de una cerca?

This Old House marca los hoyos cada 6 a 8 ft. Con postes cada 6 ft se necesitan más postes y travesaños: la cerca del ejemplo lleva 18 postes y 51 travesaños en lugar de 14 y 39.

### ¿Qué tan profundo va un poste de cerca?

Un tercio del largo del poste, que es la mitad de la altura sobre el suelo, más 6 in para la grava, según las instrucciones de Quikrete. Una cerca de 6 ft necesita hoyos de 42 in, y más hondos donde la línea de congelamiento o el código local lo pidan.

### ¿Cuánto concreto lleva un poste de cerca?

Un poste de 4x4 enterrado 36 in en un hoyo de 10 1/2 in lleva unos 1.55 pies cúbicos de concreto, unas 2.6 bolsas de 80 lb. La calculadora suma todos los hoyos y redondea las bolsas hacia arriba para toda la cerca.

### ¿Cuántas tablas necesito para una cerca de privacidad?

Tabla sobre tabla, con tablas de 5 1/2 in de ancho y 4 in entre ellas en cada fila, dos tablas cubren 9 1/2 in de cerca: 253 tablas para 100 ft.

### ¿Cuántas estacas necesito?

Divide el largo entre el ancho de una estaca más el espacio. Estacas de 5 1/2 in con espacios de 2 1/2 in cubren 8 in cada una: 150 estacas para 100 ft.

### ¿Qué largo deben tener los postes?

La altura sobre el suelo más la parte enterrada. Con un tercio del poste bajo tierra, son 1 1/2 veces la altura: un poste de 9 ft para una cerca de 6 ft y uno de 6 ft para una cerca de 4 ft.

### ¿Puedo usar metros?

Sí. Presiona Métrico (m, cm) y escribe el largo, la altura y la distancia en metros, y los anchos de la tabla y del poste en centímetros. Cambiar de unidades nunca cambia tus números, solo cómo se escriben.

<h2 id="fuentes">Fuentes y fecha de revisión</h2>

Las reglas del hoyo y la grava vienen de Quikrete (hoja Setting Posts) y de la guía de Viance; los rendimientos de las bolsas y la espera de 24 horas, de la hoja técnica de Quikrete Concrete Mix No. 1101. Los valores iniciales vienen de The Home Depot (travesaños), America's Fence Store (estacas), Alta Forest Products (tabla sobre tabla), This Old House (distancia entre postes) y la norma DOC PS 20-20 (medidas cepilladas); los factores métricos, del NIST SP 811. Las fuentes de abajo muestran la fecha en que las consultamos, y la fecha de revisión va después.

Los resultados son estimaciones. Si encuentras un error, avísanos: la [sección de correcciones de la página sobre nosotros](/es/sobre-nosotros#correcciones) explica cómo.
