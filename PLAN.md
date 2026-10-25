# Plan — herramientas de obra bilingües para EE.UU.

Estado: **plan cerrado (2026-10-22)**. Cada punto se decidió con Rodrigo. Doc: ver punto 12.
Investigación base: `~/reports/Nichos sitio de calculadoras EEUU.md`.

| # | Punto | Estado |
|---|---|---|
| 1 | Visión y propuesta de valor | Cerrado |
| 2 | Público y validación | Cerrado |
| 3 | Marca y dominio | Cerrado |
| 4 | Producto: catálogo, diferenciales, MVP | Cerrado |
| 5 | Contenido y proceso editorial | Cerrado |
| 6 | Arquitectura técnica escalable | Cerrado |
| 7 | SEO | Cerrado |
| 8 | Monetización por etapas | Cerrado |
| 9 | Legal, cobros e impuestos | Cerrado |
| 10 | Distribución fuera de Google | Cerrado |
| 11 | Métricas, hitos y puntos de decisión | Cerrado |
| 12 | Roadmap de ejecución (SDD) | Cerrado |

---

## 1. Visión y propuesta de valor — CERRADO

**Las herramientas de obra que le dicen al contratista y al dueño de casa exactamente qué comprar,
cuánto cuesta y si lo está haciendo bien — en español y en inglés.**

- **Usuario principal:** contratista latino en EE.UU. Trabaja en español, mide en pies/pulgadas/yardas,
  compra en Home Depot/Lowe's, cotiza a clientes angloparlantes.
- **Usuario secundario:** dueño de casa haciendo un proyecto DIY (inglés).
- **Por qué somos superiores:** los demás dan un número. Nosotros damos lista de compras en unidades
  reales, dibujo en vivo, chequeo de código (IRC), costo editable y link para compartir.
- **Qué no somos:** un sitio de miles de calculadoras genéricas ni contenido generado en masa con IA.

**Modelo de negocio:** primero anuncios (+ afiliados). Herramientas pro o producto para contratistas
se evalúan después, con tráfico real. La arquitectura no construye cuentas ni pagos ahora, pero no
debe impedirlos (estado de proyecto serializable, cálculo separado de la UI).

**Tensión a vigilar:** el contratista latino es el foco de producto, pero el tráfico en español paga
menos por anuncio que el inglés. Por eso cada herramienta sale en los dos idiomas: diseñada para el
pro, rinde anuncios con el volumen DIY en inglés.

---

## 2. Público y validación — CERRADO

Investigación: `~/research_notes/Contratista latino en EEUU/` (workforce, búsqueda en español, herramientas
de presupuesto, cómo llegar a contratistas).

- **Mercado:** 35,4% de la construcción en EE.UU. es latina (~4,3M; BLS 2025). Oficios: drywall 68%,
  techos 65%, concreto 63%, pintura 58%, piso/cerámica 55%, paisajismo 47%, carpintería 43% (verificar contra
  la tabla BLS antes de publicar). ~840K empresas de construcción de dueños latinos, 770K unipersonales (2021).
- **Búsqueda en español:** existe pero es chica (concreto ~6-8K/mes en EE.UU. vs 550K en inglés). El video es
  enorme (canales de 159K-672K suscriptores). Latinos: WhatsApp 56% vs 26% general, TikTok 53% vs 31%.
- **Competencia en español con unidades US:** solo concreto, sitios chicos. Techos, drywall, madera y
  presupuestos: nada. Home Depot y Lowe's no tienen calculadoras en español en EE.UU.
- **Presupuestos bilingües:** ya existen QuoteCrew, QuoteClaro, FieldSub, Jobkore (chicos, sin funding conocido).
- **Implicancias:** el tráfico pago por anuncios vendrá del inglés; al contratista latino se llega por
  WhatsApp, YouTube y TikTok (punto 10).

**Decisión: sin entrevistas al principio.** Se valida con datos de uso reales tras el lanzamiento.
Entrevistas (incluso pagas, ~USD 1.000-1.500 por 8) quedan como requisito antes de construir cualquier
producto pago. Opcional: observar grupos de Facebook de contratistas latinos y NAHICA para vocabulario.

---

## 3. Marca y dominio — CERRADO

- **Marca: Maestro Calc** — dominio `maestrocalc.com` (+ `maestrocalc.net` defensivo).
- "Maestro" funciona en los dos idiomas: maestro de obra (ES) / experto (EN).
- Bajadas: EN "Jobsite calculators that estimate what to buy" (suavizada el 2026-10-25: todo resultado es una estimación) · ES "Calcula tu obra y sabe qué comprar".
- Trademarkia: sin marcas "Maestro Calc"/"MaestroCalc". Riesgo: **Maestro ERP** (Maestro Technologies / JDM,
  software de estimación para contratistas en Norteamérica). Reglas:
  1. Usar siempre "Maestro Calc", nunca "Maestro" solo.
  2. Un futuro producto pago de presupuestos lleva nombre propio + búsqueda legal previa (USPTO clases 9 y 42).
- Redes: YouTube, X y GitHub libres; Instagram, TikTok y Facebook a verificar a mano.

**Tareas de Rodrigo:** verificar/reservar Instagram y TikTok · comprar maestrocalc.com (+ .net) en Cloudflare
Registrar · búsqueda en tmsearch.uspto.gov antes de registrar la marca.

---

## 4. Producto — CERRADO

### 4.1 Catálogo MVP (10 calculadoras)

Criterio: volumen en inglés (paga los anuncios) × % de latinos en el oficio (usuario principal).

| # | Calculadora | EN vol/mes | ES vol EE.UU./mes | % latinos oficio |
|---|---|---|---|---|
| 1 | Concrete (losa, zapata, columna, escalones, bolsas 40/60/80 lb) | 550K | ~6-8K | 63% |
| 2 | Square footage (+ m² ↔ ft²) | 246K | ~2,4K+ | todos |
| 3 | Feet-inch-fraction calculator (estilo Construction Master) | a validar | a validar | todos |
| 4 | Roof pitch | 22,2K · CPC $11 | bajo | 65% |
| 5 | Roofing (squares, bundles, underlayment, costo) | 9,9K · CPC $13 | bajo · CPC $10 | 65% |
| 6 | Drywall (placas, tornillos, masilla, cinta) | 14,8K | bajo | 68% |
| 7 | Paint (galones, primer, por habitación) | 49,5K | bajo | 58% |
| 8 | Gravel (yd³ + toneladas) | 49,5K | bajo | 47% |
| 9 | Mulch | 49,5K | bajo | 47% |
| 10 | Topsoil | 12,1K | bajo | 47% |

**v2:** tile, flooring, stairs (con dibujo + IRC), block/brick, fence, deck, retaining wall, pavers.

### 4.2 Funciones

| Función | MVP | v2 |
|---|---|---|
| Resultado en unidades US + métricas | ✅ | |
| Lista de compras en unidades reales de compra | ✅ | |
| % de desperdicio editable con explicación | ✅ | |
| Costo estimado con precios editables por el usuario | ✅ | |
| Link compartible (estado en la URL), botón WhatsApp | ✅ | |
| Bilingüe ES/EN con un botón | ✅ | |
| PWA: instalable y offline | ✅ | |
| Imprimir | ✅ | |
| Calculadora embebible para otros sitios (link de marca) | ✅ | |
| Dibujo en vivo | concreto, techo | resto |
| Chequeos de código IRC | techo | escalera y resto |
| PDF con logo del contratista | | ✅ |
| Historial local de cálculos | | ✅ |
| Planificador de proyecto completo | | ✅ |
| Optimizador de cortes | | ✅ |
| Precios regionales / profundidad de helada por estado | | ✅ |

### 4.3 Experiencia

- Mobile-first, botones grandes, teclado numérico, usable con una mano.
- Resultado instantáneo sin botón "calcular"; carga < 1 s.
- Anuncios nunca entre el formulario y el resultado.
- **Idioma: español neutro**, con los términos de obra en inglés donde así se usan en EE.UU.
  (drywall, pitch, yardas, bolsas de 80 lb). Validar vocabulario con canales de YouTube de obra en español.

---

## 5. Contenido y proceso editorial — CERRADO

### 5.1 Anatomía de cada página (EN y ES)

1. H1 + respuesta corta · 2. Herramienta arriba de todo · 3. Resultado + lista de compras + costo + dibujo ·
4. Cómo usarla (3-5 pasos) · 5. Fórmula + ejemplo resuelto · 6. Consejos de obra y errores comunes ·
7. Qué dice el código (IRC) si aplica · 8. FAQ (preguntas reales de Google) · 9. Relacionadas ·
10. Autoría editorial, fecha de actualización y fuentes (fichas técnicas de fabricantes, IRC).
Extensión: 800-1.500 palabras.

### 5.2 Proceso por calculadora

Brief (Claude) → fórmulas con fuente oficial (Claude) → tests con casos verificados a mano (Claude) →
texto EN (Claude) → adaptación ES con glosario (Claude) → **revisión de Rodrigo** (números con sentido,
español, que no suene a IA) → publicación e indexación.
Glosario ES/EN único de obra para todo el sitio. Política de IA publicada: "asistido por IA, verificado
por personas, fórmulas testeadas, fuentes citadas".

### 5.3 Autoría y confianza

- **Sin revisor técnico y sin autor con nombre real.** Autoría: "Equipo editorial de Maestro Calc".
- Riesgo asumido: E-E-A-T más débil que Inch Calculator/Omni. Mitigaciones obligatorias:
  - Página de **metodología**: fórmulas, supuestos, rendimientos y fuentes de cada calculadora.
  - Fuentes citadas en cada página (fabricantes, IRC), con fecha de revisión.
  - **Política de correcciones** y canal de contacto visible ("¿Encontraste un error?") + registro de cambios.
  - Tests automáticos de cada fórmula; casos de prueba publicados en la metodología.
  - Revisar la decisión del revisor técnico si el tráfico se estanca o al pasar a un producto pago.
- Revisión de español: Rodrigo, con el glosario.

### 5.4 Guías en el MVP

7 guías, cada una en EN y ES, enlazadas con su calculadora:

| # | Guía | Potencia |
|---|---|---|
| 1 | Cómo cotizar un trabajo de concreto | Concrete |
| 2 | Bolsas vs. camión de concreto | Concrete |
| 3 | Cómo medir un techo y entender el pitch | Roof pitch, Roofing |
| 4 | Cómo calcular y cotizar un trabajo de drywall | Drywall |
| 5 | Cómo leer la cinta métrica y sumar fracciones | Feet-inch-fraction |
| 6 | Cómo calcular pies cuadrados (y m² → ft²) | Square footage |
| 7 | Cómo sacar la licencia de contratista en EE.UU. (guía general) | Negocio |

Nada de páginas casi idénticas por estado. Versiones por estado (TX, CA, FL, NY) solo más adelante y
con contenido realmente distinto.

---

## 6. Arquitectura técnica escalable — CERRADO

### 6.1 Monorepo con paquetes separados desde el día uno

```
maestro-calc/
├── packages/
│   ├── core/   fórmulas, unidades, motor de cálculo — TS puro, sin UI ni idioma, 100% testeado
│   ├── data/   materiales con fuente (bolsas, placas, coberturas), reglas IRC, precios base
│   └── i18n/   textos de interfaz EN/ES + glosario de obra
└── apps/
    └── web/    sitio Astro: páginas, diseño, contenido MDX, SEO
```
Separación: qué se calcula (core) · con qué datos (data) · en qué idioma (i18n) · cómo se muestra (web).
El core se reutiliza en futura app móvil, PDF pago, API u otros nichos.

### 6.2 Stack

- Astro (estático) + TypeScript estricto · Cloudflare Pages · GitHub privado con deploy automático.
- PWA con service worker (offline en la obra).
- Contenido en MDX por idioma con frontmatter validado (sin CMS por ahora).
- Funciones pro a futuro: Cloudflare Workers + D1 o Supabase, sin migración.

### 6.3 Calidad automática (CI en GitHub Actions)

- Tests unitarios de cada fórmula con casos verificados a mano (vitest).
- Tests e2e en celular simulado, EN y ES (Playwright).
- Presupuesto de performance (Lighthouse ≥ 95, peso máximo por página).
- Chequeos SEO automáticos (title, description, hreflang, JSON-LD presentes).
- Preview deploy por cada cambio.

### 6.4 Idiomas y URLs

- EN en la raíz: `/concrete-calculator` · ES en `/es/` con slug traducido: `/es/calculadora-de-concreto`.
- hreflang entre versiones; selector de idioma conserva la calculadora y los datos cargados.

### 6.5 Medición — costo cero

- Google Analytics 4 (versión estándar, gratis; requerido por Mediavine/Raptive).
- Cloudflare Web Analytics (gratis).
- Eventos: calculó, copió lista, compartió por WhatsApp, cambió idioma, instaló la app.

### 6.6 Forma de trabajo

SDD con gentle-ai (spec → diseño → tareas → implementación → verificación) + Engram para memoria.
**Pendiente Rodrigo:** `gentle-ai install --agents claude-code` antes del punto 12.
Rodrigo tiene cuentas de GitHub y Cloudflare. Carpeta renombrada a `~/maestro-calc`.

---

## 7. SEO — CERRADO

### 7.1 Estructura

- Calculadoras con URL plana: `/concrete-calculator`, `/es/calculadora-de-concreto`.
- Hubs por oficio: `/concrete`, `/roofing`, `/drywall`, `/paint`, `/landscaping`, `/measurement` (+ `/es/...`).
- Guías: `/guides/<slug>` y `/es/guias/<slug>`.

### 7.2 On-page

- Title con la keyword real de cada idioma ("Calculadora de Concreto en Yardas y Bolsas | Maestro Calc").
- Un H1, meta description manual, JSON-LD: WebApplication, BreadcrumbList, Organization, FAQPage.
- Una keyword principal por página; sin canibalización.

### 7.3 Enlazado interno

Hub ↔ calculadoras ↔ guías del mismo oficio; relacionadas por calculadora; CTA de guía a calculadora;
breadcrumbs en todo el sitio.

### 7.4 Técnico

Sitemap por idioma, robots.txt, canonical y hreflang automáticos (validados en CI). URLs con estado
(`?param=`) canonicalizan a la URL limpia. 404 útil, redirecciones gestionadas.

### 7.5 Indexación y seguimiento — sin costo

Google Search Console, Bing Webmaster Tools, IndexNow (Bing alimenta a ChatGPT). Posiciones desde GSC.
Ahrefs solo el mes de validación.

### 7.6 Autoridad (links legítimos)

- **Calculadora embebible — en el MVP** (link de marca, nofollow/branded).
- Recurso gratis para asociaciones (NAHICA, Latin Builders) y medios de obra en español.
- Nunca comprar links.

### 7.7 Buscadores con IA

Respuesta clara arriba, fórmulas explícitas, datos citados, buena presencia en Bing.

### 7.8 Idioma/región

Español apuntado a EE.UU. (`hreflang="es-US"`), sin bloquear Latinoamérica (botón métrico disponible).
Inglés `en-US`, `x-default` → inglés.

---

## 8. Monetización por etapas — CERRADO

### 8.1 Anuncios

| Etapa | Disparador | Red | RPM estimado |
|---|---|---|---|
| 0 | Lanzamiento | AdSense | EN ~$3-6 · ES ~$1-3 |
| 1 | 1.000 sesiones US / 30 días | Mediavine Journey | EN ~$8-15 |
| 2 | 25K PV/mes o $5K/año en ads | Raptive o Mediavine completo | EN ~$15-30 |

Reglas: nunca anuncios entre formulario y resultado ni sobre la calculadora · in-content después del
resultado y entre secciones · anchor en mobile · espacio reservado (CLS 0) · ubicaciones manuales.

### 8.2 Afiliados y lead-gen

- DIY (EN): leads de contratistas (Modernize y similares, $5-12/lead) en techos, roofing, concreto.
- DIY (EN/ES): Amazon (4%) en la lista de compras.
- Contratista (ES/EN): seguro de responsabilidad civil, cursos de examen de licencia, software de
  presupuestos/facturación. Pagos a verificar.
- Pendiente (punto 9): qué programas aceptan residentes en Argentina y cómo pagan.

### 8.3 Herramientas pro — disparador

Entrevistas para producto pago cuando haya **> 20.000 sesiones/mes** y **> 20% de usuarios recurrentes**
en calculadoras pro. Candidatos: PDF con logo, proyectos guardados, presupuesto bilingüe (nombre propio
+ chequeo legal).

### 8.4 Escenarios ilustrativos (80% tráfico EN, si el SEO funciona)

| Momento | PV/mes | Anuncios/mes | Afiliados/mes |
|---|---|---|---|
| Mes 6 | 5K | $15-30 | $0-30 |
| Mes 12 | 30K | $250-600 | $50-200 |
| Mes 18 | 80K | $900-2.000 | $150-500 |

---

## 9. Legal, cobros e impuestos — CERRADO

Investigación: `~/research_notes/Contratista latino en EEUU/affiliates_argentina.md`.
Doc para el contador: https://claude.ai/artifact/WBLY9QmxA3jjdos13FqR4c

### 9.1 Cobros

- AdSense → cuenta en USD en banco argentino (obligatorio: banco del país de la dirección de pago).
- Redes premium y afiliados → cuenta en EE.UU.; si no la aceptan: Impact (acepta cuentas bancarias
  argentinas), PayPal o Payoneer.
- W-8BEN como persona física en cada pagador de EE.UU. Sin LLC por ahora.

### 9.2 Afiliados — prioridad

1. Del lado del contratista: Jobber (20% por 12 meses según términos oficiales), Housecall Pro (hasta $250
   por cliente, PartnerStack), NEXT Insurance (vía Impact).
2. Complemento: Amazon (3% hogar/herramientas), leads DIY (Modernize, Porch), Home Depot/Lowe's (1-3%).
3. Cursos de licencia: sin programas públicos → posible acuerdo directo con CSLS (atiende en español).
Red principal: Impact. Aplicar a cada programa cuando el sitio tenga tráfico.

### 9.3 Páginas legales (EN y ES)

Privacidad (GA4, Cloudflare, cookies, anuncios, leyes estatales de EE.UU.) · Términos + descargo
("estimaciones; verificá con un profesional y el código local") · Divulgación de afiliados y publicidad (FTC)
· Política editorial, de IA y de correcciones · Contacto.
Aviso de cookies: CMP gratuito de Google (EEE/UK/CH) + opciones de privacidad de estados de EE.UU.

### 9.4 Pendientes de Rodrigo

- Consulta con contador antes del primer cobro (con el doc).
- Búsqueda en tmsearch.uspto.gov ("maestro", clases 9 y 42).

---

## 10. Distribución fuera de Google — CERRADO

### 10.1 Canales

| Canal | Público | Acción |
|---|---|---|
| WhatsApp | Contratista ES | Botón "Enviar por WhatsApp" con resultado + lista de compras formateados (dentro del producto) |
| YouTube Shorts, TikTok, Reels, Facebook | Contratista ES | Videos de 30-60 s resolviendo un problema real con la calculadora, sin cara |
| Pinterest | DIY EN | Pines verticales por calculadora y guía |
| Grupos de Facebook | Contratista ES | Aportar respuestas reales; nunca spam |
| Reddit (r/DIY, r/Concrete, r/Roofing) | DIY EN | Aportar, no vender |
| Asociaciones (NAHICA, Latin Builders) | Contratista ES | Calculadoras gratis + embebible como recurso para miembros |
| Creadores en español | Contratista ES | Patrocinio cuando haya ingresos |

### 10.2 Sistema de video

Guion (Claude) → grabación de pantalla del celular + **voz de IA en español neutro** (ElevenLabs o similar,
USD 5-22/mes; declarar contenido IA donde la plataforma lo pida) → edición en CapCut con plantilla fija →
publicación en las 4 plataformas.

### 10.3 Cadencia (compromiso de Rodrigo: 5-7 h/semana)

- Pre-lanzamiento: reservar cuentas, 10-15 videos y ~30 pines listos.
- Post-lanzamiento: 3 videos/semana, 10 pines/semana, 30 min/día en grupos y Reddit.
- Mes 2: contacto con asociaciones. Con ingresos: prueba de patrocinio con un creador.

---

## 11. Métricas, hitos y puntos de decisión — CERRADO

### 11.1 Métrica principal

**Cálculos útiles por semana:** sesiones que calculan Y copian la lista, comparten, imprimen o vuelven.

### 11.2 Tablero (Looker Studio + GA4 + Search Console, costo 0)

Tráfico (impresiones, clics, posición por página e idioma; Bing; redes) · Uso (% que calcula, % que
comparte, instalaciones PWA, % recurrentes) · Plata (RPM por idioma, ingresos, afiliados) · Salud
(indexación, Core Web Vitals, errores reportados) · Redes (vistas, seguidores, visitas) · Costos.

### 11.3 Hitos (L = lanzamiento)

| Cuándo | Meta | Si se cumple | Si no |
|---|---|---|---|
| L+30 | 80% de páginas indexadas | seguir | revisión técnica/calidad antes de sumar |
| L+30 | AdSense aprobado | activar anuncios | corregir y reaplicar |
| L+90 | impresiones crecientes, ≥10K/mes; ≥1 video >10K vistas | +5-10 calculadoras/mes | revisar calidad/keywords/formatos; no escalar |
| cuando se dé | 1.000 sesiones US / 30 días | Mediavine Journey | — |
| L+6m | ~5K PV/mes | seguir | criterio de corte |
| L+12m | ~30K PV/mes | Raptive | reevaluar nicho |
| cuando se dé | >20K sesiones/mes y >20% recurrentes | entrevistas para producto pago | — |

### 11.4 Criterio de corte

L+6 meses con < 1.000 sesiones orgánicas/mes y redes sin traer tráfico → se deja de sumar contenido y se
decide: pivotar de nicho reutilizando el motor (plan B: autos), reenfocar en el canal que funcione, o cerrar.

### 11.5 Ritmo

Revisión semanal de 30 min del tablero · retrospectiva mensual con decisiones (Engram + este plan).

---

## 12. Roadmap de ejecución — CERRADO

Cada pieza de código sigue SDD (gentle-ai/openspec): spec → diseño → tareas → implementación → verificación,
con aprobación de Rodrigo en la spec.

| Fase | Semanas | Qué | Quién |
|---|---|---|---|
| A. Preparación | 1 | Dominio, Cloudflare, GitHub privado, GSC, Bing, GA4, instalar gentle-ai | Rodrigo (guiado) |
| | 1-2 | Validación de keywords EN/ES (1 mes de Ahrefs o Semrush) → ajusta orden y títulos | Claude |
| B. Base técnica | 1-3 | Monorepo, motor (unidades, fracciones), data, i18n, tests, CI | Claude |
| | 2-3 | Diseño mobile-first: sistema visual, página de calculadora y de guía — **aprobación de Rodrigo** | Claude propone |
| | 2-3 | Layout, SEO técnico, PWA, analítica con eventos, páginas legales y de confianza | Claude |
| C. Calculadoras MVP | 3-7 | 1 Concrete (dibujo) · 2 Feet-inch-fraction · 3 Square footage · 4-6 Gravel/Mulch/Topsoil · 7 Paint · 8 Drywall · 9 Roof pitch (dibujo + IRC) · 10 Roofing | Claude; revisión de Rodrigo |
| D. Guías + embebible | 6-8 | 7 guías EN/ES + calculadora embebible | Claude; revisión de Rodrigo |
| E. Prelanzamiento | 8 | QA, performance, legales, cuentas en redes, 10-15 videos, ~30 pines | Ambos |
| Lanzamiento | ~9 | **Apenas esté listo** (estimado fines de dic-2026): sitemaps, indexación, AdSense | Ambos |
| F. Operación | 9+ | Cadencia de redes, revisión semanal, hitos del punto 11, backlog v2 | Ambos |

Horas de Rodrigo: semanas 1-2 ~4-6 h · semanas 3-8 ~5-8 h (revisión de 34 páginas, cuello de botella) ·
desde semana 8 ~5-7 h (redes + revisión semanal).

**Primer paso:** Rodrigo corre `gentle-ai install --agents claude-code` y reinicia la sesión. Después Claude
pasa este plan a openspec y redacta la primera spec (monorepo + motor de cálculo) para aprobación.
