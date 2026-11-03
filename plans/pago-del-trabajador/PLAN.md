# Plan — Pago del trabajador (nicho 2)

Estado: **borrador (2026-11-02)**. Las decisiones técnicas están tomadas; las marcadas **[Rodrigo]**
son suyas (marca, dominio, gastos, cuentas). Mismo método que `PLAN.md` de Maestro Calc, con lo aprendido
(punto 13). Mockups aprobados: https://claude.ai/artifact/LbMnUv4U4m3sog8FNQGh5Z.
Investigación: `~/research_notes/Nichos sitio de calculadoras EEUU/` y la memoria `niche-portfolio-strategy`.

| # | Punto | Estado |
|---|---|---|
| 1 | Visión y propuesta de valor | Propuesto |
| 2 | Público y validación | Falta validar keywords **[Rodrigo: 1 mes de Ahrefs o Semrush]** |
| 3 | Marca y dominio | Decidido: Cuenta Horas (compra **[Rodrigo]**) |
| 4 | Producto: catálogo, funciones, MVP | Propuesto |
| 5 | Contenido y proceso editorial | Propuesto |
| 6 | Arquitectura (reuso del monorepo) | Decidido |
| 7 | SEO | Propuesto |
| 8 | Monetización | Propuesto |
| 9 | Legal, impuestos, cuentas | Propuesto |
| 10 | Distribución | Propuesto |
| 11 | Métricas, hitos y corte | Propuesto |
| 12 | Roadmap con fechas | Propuesto |
| 13 | Lo aprendido con Maestro Calc | Decidido |

---

## 1. Visión y propuesta de valor

**Las herramientas para que quien cobra por hora sepa cuánto trabajó, cuánto le tienen que pagar y cuánto
se ahorra en impuestos, en español y en inglés, listo para mandar por WhatsApp.**

- **Usuario principal:** trabajador latino por hora en EE.UU. (obra, paisajismo, limpieza, restaurantes,
  bodegas). Anota horas en papel o en el celular y quiere revisar su cheque.
- **Usuario secundario:** cualquier trabajador por hora en inglés (paga los anuncios) y el pequeño patrón que
  arma la planilla de su gente.
- **Por qué somos superiores:** los demás suman horas. Nosotros damos la semana como tarjeta, el pago con las
  extra desglosadas, la regla que aplica (federal y del estado), el recibo listo para WhatsApp y la cuenta de
  las deducciones nuevas, con la fuente oficial de cada número.
- **Qué no somos:** una calculadora de sueldo neto con impuestos de 50 estados (dominada por ADP, SmartAsset y
  PaycheckCity, y con mantenimiento anual pesado), ni asesoría fiscal.

**Tensión a vigilar:** las deducciones de propinas y horas extra valen solo para los años 2025-2028. Son el
gancho de temporada, no la base: la base son las horas y el pago, que no vencen.

---

## 2. Público y validación

Volúmenes de EE.UU. por mes (Google Ads vía seodata.dev, 2026; buckets que agrupan variantes, no se suman):

| Búsqueda | Vol. | CPC |
|---|---|---|
| time card calculator (= hours worked / work hours calculator) | 201K | $4.80 |
| hourly to salary calculator | 60.5K | $1.92 |
| salary to hourly calculator | 49.5K | $3.51 |
| calculator for overtime / overtime calculator | 27.1K / 22.2K | $2.54 / $8.77 |
| no tax on tips (informativa) | 74K | $1.53 |
| no tax on overtime calculator · overtime tax calculator | 6.6K · 6.6K | $3.08 · $14.08 |

- **Competencia en inglés:** fuerte (calculator.net, Clockify, Hubstaff, CalculatorSoup, dqydj). La entrada
  es por calidad, por el recibo y por las cuentas de las deducciones.
- **Español (corregido el 2026-11-02):** no está vacío. Para horas trabajadas y horas extra ya aparecen
  Clockify, Harvest (decenas de páginas programáticas), Omni, ClickUp, MiniWebtool, Everhour y Turnozo, casi
  todas traducciones de SaaS genéricas o pensadas para España. **El Cheque Claro** (chequeclaro.com, registrado
  el 2026-08-22, solo español, 65 páginas) apunta al mismo público con sueldo neto por estado (51 páginas
  programáticas), ganancias de apps (Uber, DoorDash), W-4, 1099 y propinas sin impuesto. La diferencia
  posible: inglés + español, la tarjeta semanal con el recibo, FLSA y California bien explicados, y calidad
  en vez de páginas por estado. Hay que medirla con Ahrefs antes de comprar el dominio.
- **Validación pendiente (fase A, no se hizo en Maestro Calc y se nota):** dificultad de cada keyword, SERP
  real y volumen en español. **[Rodrigo]** aprueba el mes de Ahrefs o Semrush (~USD 130); sirve también para
  Maestro Calc.
- Sin entrevistas al principio: se valida con uso real (punto 11).

---

## 3. Marca y dominio — decidido (2026-11-02)

- **Marca: Cuenta Horas** — dominio `cuentahoras.com` (solo el .com; Rodrigo descartó el .net defensivo el 2026-11-02).
- Descartadas: "Cheque Claro" (`chequeclaro.com` es un competidor en uso) y "Cheque OK" (choca con CHECKOK,
  marca vigente reg. 3122113 de ESL Federal Credit Union, clase 36, servicios financieros).
- Sin marcas "Cuenta Horas" en la búsqueda de USPTO del 2026-11-02. YouTube `@cuentahoras` libre; TikTok,
  Instagram y X a verificar a mano.
- En inglés el nombre no dice nada; no importa, porque al sitio en inglés se llega por la búsqueda.

**Tareas de Rodrigo:** comprar `cuentahoras.com` en Cloudflare Registrar ($11.17/año) · reservar `@cuentahoras`
en YouTube, TikTok e Instagram.

---|---|---|
| Hora y Pago | horaypago.com | Clara en ES; en EN no dice nada |
| Cuenta Horas | cuentahoras.com | ES directa ("cuenta horas" = suma horas) |
| Cheque OK | chequeok.com | Funciona en los dos ("check OK") |
| Pago por Hora | pagoporhora.com | Es la keyword en ES; poco marca |

Recomendación: **Cheque OK**, porque se entiende en los dos idiomas como "Maestro". Antes de comprar: Trademarkia
y tmsearch.uspto.gov, y redes libres (YouTube, TikTok, Instagram). Compra en Cloudflare Registrar (.com al costo).

---

## 4. Producto

### 4.1 Catálogo MVP (6 calculadoras, EN + ES)

| # | Calculadora | Fuente de la regla |
|---|---|---|
| 1 | Horas trabajadas (tarjeta semanal: entrada, salida, comida, total y pago) | Aritmética |
| 2 | Horas extra (1.5× después de 40 h; modo California por día) | DOL/FLSA; California DIR |
| 3 | Por hora → sueldo anual (semana, quincena, mes, año) | Aritmética |
| 4 | Sueldo anual → por hora | Aritmética |
| 5 | Horas extra sin impuesto (parte extra, tope, reducción por ingresos) | IRS |
| 6 | Propinas sin impuesto (tope, reducción, ocupaciones) | IRS |

**v2 (después del hito L+90):** quincena y pay period, días de vacaciones (PTO), diferencial nocturno, propinas
compartidas, planilla para el patrón (varias personas), horas extra por estado más allá de California.
**Fuera:** sueldo neto con impuestos estatales (punto 1).

### 4.2 Funciones

| Función | MVP | v2 |
|---|---|---|
| Tarjeta semanal con hora a.m./p.m. y 24 h | ✅ | |
| Resultado al instante, sin botón "calcular" | ✅ | |
| Desglose: normales + extra, con la regla que aplica | ✅ | |
| Recibo para WhatsApp (link con el estado en la URL) | ✅ | |
| Imprimir la tarjeta | ✅ | |
| ES/EN con un botón, conserva los datos | ✅ | |
| PWA instalable y offline | ✅ | |
| Fuente oficial y año fiscal en cada cifra de impuestos | ✅ | |
| Historial local de semanas | | ✅ |
| Planilla de varias personas (patrón) | | ✅ |
| Exportar CSV o PDF | | ✅ |

### 4.3 Experiencia

Mobile-first, una mano, teclado numérico, botones de 44 px o más. Anuncios nunca entre el formulario y el
resultado. Español neutro con tú (Ingresa, Anota), con "overtime", "pay stub" y "taxes" donde así se dicen.
**Privacidad:** el link del recibo lleva horas y tarifa en la URL; la página lo dice antes de compartir y no
se guarda nada en un servidor.

---

## 5. Contenido y proceso editorial

### 5.1 Anatomía de cada página

La de Maestro Calc: H1 + respuesta corta · herramienta arriba · resultado + recibo · cómo usarla · fórmula y
ejemplo resuelto · qué dice la ley (FLSA, estado, IRS) · errores comunes · FAQ · relacionadas · autoría,
fecha y fuentes. Las páginas de impuestos agregan "lo que esta cuenta no hace" y el año fiscal.

### 5.2 Guías del MVP (EN + ES)

| # | Guía | Potencia |
|---|---|---|
| 1 | Cómo calcular las horas extra (FLSA, 40 h, tiempo y medio) | Horas extra |
| 2 | Horas extra en California: por día y por semana | Horas extra |
| 3 | Cómo revisar tu cheque (pay stub) línea por línea | Horas trabajadas |
| 4 | Cómo deducir las horas extra en tu declaración | Horas extra sin impuesto |
| 5 | Propinas sin impuesto: quién califica y cuánto | Propinas sin impuesto |
| 6 | Qué hacer si no te pagan las horas extra (Wage and Hour Division) | Horas extra |

### 5.3 Confianza (tema de plata = más exigencia de Google)

Sin autor con nombre real, como Maestro Calc, con las mismas mitigaciones: metodología con casos verificados a
mano, fuentes oficiales con fecha (DOL, IRS, departamentos de trabajo estatales), política de correcciones y
contacto. Además: **descargo visible** ("no es asesoría fiscal ni legal") y **revisión anual obligatoria** de
cada cifra de impuestos (topes por año, fin en 2028), con test que falla si el año fiscal vigente no tiene datos.
Las fuentes se leen de PDF o páginas oficiales; si un sitio bloquea la lectura automática, no se fuerza (se
anota y se busca la publicación oficial equivalente).

---

## 6. Arquitectura — decidido

**Mismo monorepo, segunda app.** El motor ya es genérico (calculator-core); copiarlo a otro repo duplica
arreglos. Google no ve el repo; ve dominios, diseño y contenido distintos.

```
maestro-calc/                 (se puede renombrar el repo más adelante)
├── packages/
│   ├── core/        motor compartido + unidad nueva: hora del día y duración
│   ├── site-kit/    NUEVO: lo que hoy es genérico en apps/web (head SEO, rutas, site-check, presupuestos, PWA)
│   ├── data/        Maestro Calc
│   ├── pay-data/    NUEVO: reglas FLSA y estatales, topes del IRS por año fiscal, cada uno con fuente y fecha
│   └── i18n/        maquinaria compartida; catálogos por sitio
└── apps/
    ├── web/         Maestro Calc
    └── pay/         NUEVO: el sitio del nicho (Astro)
```

- **Primera spec:** extraer `site-kit` **sin cambiar ni un byte del `dist` de Maestro Calc** (test que compara
  el build antes y después). Es la condición para no romper lo que ya está en producción.
- **Segunda spec:** unidad de hora del día y duración en `core` (12 h y 24 h, cruce de medianoche), con tests
  de propiedades, y el slot "semana" para el formulario.
- Deploy: un proyecto de Workers Builds por app, cada uno con su dominio. CI con filtros por ruta para que un
  cambio en una app no corra todo lo de la otra.
- Presupuestos desde el día uno: los mismos de Maestro Calc (HTML 48 KB, CSS 20 KB, cero JS fuera de las
  calculadoras, una module script por calculadora ≤ 48 KB).

---

## 7. SEO

- EN en la raíz, ES en `/es/` con slug traducido: `/time-card-calculator` ↔ `/es/calculadora-de-horas-trabajadas`,
  `/overtime-calculator` ↔ `/es/calculadora-de-horas-extra`, `/no-tax-on-overtime-calculator` ↔
  `/es/calculadora-horas-extra-sin-impuesto`.
- Hubs: horas, sueldo, impuestos. Guías en `/guides/` y `/es/guias/`.
- Lo mismo de Maestro Calc en lo técnico: JSON-LD, hreflang `en-US` / `es-US` / `x-default`, sitemap,
  canonical sin `?param=`, IndexNow, GSC y Bing desde el primer deploy.
- Las páginas de impuestos se actualizan cada año con la fecha visible; nunca una página por año.

---

## 8. Monetización

- **Anuncios:** se suma el sitio a la misma cuenta de AdSense (pub-3954…). Mismas reglas de ubicación.
  Mediavine Journey al llegar a 1.000 sesiones de EE.UU. en 30 días.
- **Afiliados a investigar (no confirmados):** preparación de impuestos (TurboTax, H&R Block, Jackson Hewitt),
  apps de control de horas para patrones (Connecteam, Homebase), cuentas bancarias y adelantos de sueldo.
  Se aplica cuando haya tráfico; nada de préstamos de día de pago.
- **Escenario:** ingresos de anuncios desde el mes 3-6; las páginas de impuestos rinden sobre todo de enero a
  abril.

---

## 9. Legal, impuestos y cuentas

- Cobros y W-8BEN: igual que Maestro Calc (misma cuenta de AdSense, mismo banco).
- Páginas legales EN/ES: privacidad (incluye que el link del recibo lleva los datos en la URL), términos con el
  descargo fiscal y legal, divulgación de afiliados y publicidad, política editorial y de correcciones.
- Cuentas nuevas **[Rodrigo]**: dominio, Search Console, Bing, GA4 (propiedad nueva), propiedad en Tag
  Manager, redes con el nombre elegido. Claude prepara cada paso y lo hace en Chrome cuando él inicia sesión.

---

## 10. Distribución

| Canal | Acción |
|---|---|
| WhatsApp | El recibo es el producto: cada uso puede traer a otro trabajador |
| YouTube Shorts y TikTok | Videos sin cara grabados de producción ("¿Te pagaron bien las extra?"), mismo sistema que Maestro Calc |
| Pinterest | Poco público acá; solo pines de las guías de impuestos |
| Facebook | No (decisión de Rodrigo para Maestro Calc; se mantiene) |
| Organizaciones de trabajadores y centros de trabajadores | Recurso gratis para sus miembros; nunca spam |

Pico de contenido: diciembre y enero, antes de la temporada de impuestos.

---

## 11. Métricas, hitos y corte

- **Métrica principal:** cálculos útiles por semana (calcula y comparte, imprime o vuelve).
- **L+30:** 80 % de páginas indexadas, AdSense aprobado para el sitio.
- **Temporada 2027 (enero a abril):** impresiones de las páginas de impuestos; si no hay, se revisa la estrategia
  de impuestos antes de 2028.
- **L+90:** impresiones crecientes y al menos 3K/mes → v2. Si no, revisar keywords y formatos; no escalar.
- **L+6 meses:** menos de 1.000 sesiones orgánicas/mes → se deja de sumar contenido y se decide.

---

## 12. Roadmap con fechas

La fecha que manda: **las calculadoras de impuestos indexadas a principios de enero de 2027.** Para eso el sitio
sale alrededor del 1 de diciembre de 2026. Es ajustado; si algo se atrasa, primero salen horas y horas extra
(lo que no vence) y las de impuestos llegan antes de febrero.

| Semana | Qué | Quién |
|---|---|---|
| 3-9 nov | Marca y dominio, Ahrefs, cuentas; spec 1 (`site-kit` sin cambios en Maestro Calc) | Rodrigo · Claude |
| 10-16 nov | Spec 2 (hora y duración en core); estilos del sitio; **horas trabajadas en producción en el dominio** | Claude |
| 17-23 nov | Horas extra (con California), por hora ↔ anual, metodología y legales | Claude |
| 24-30 nov | Horas extra sin impuesto y propinas sin impuesto (cifras del IRS verificadas); QA; GSC, Bing, AdSense | Claude · Rodrigo |
| 1 dic | Lanzamiento | Ambos |
| dic | Guías 1-6, videos y pines de temporada | Claude |

Cada pieza sigue SDD con TDD estricto, como Maestro Calc, y una PR por grupo de piezas.

---

## 13. Lo aprendido con Maestro Calc

1. **El motor genérico va primero.** El refactor calculator-core llegó tarde; acá se reusa desde el día uno.
2. **Lo visible primero.** Una calculadora completa en producción en la semana 2, antes que las demás.
3. **La firma del diseño no se posterga.** El dibujo y WhatsApp se postergaron y se olvidaron; acá la tarjeta
   y el recibo de WhatsApp van en la primera calculadora, y todo lo postergado se anota en el roadmap.
4. **Presupuestos y CLS desde el inicio.** La fuente de reserva con métricas igualadas (el CLS inestable de CI
   venía de `local(Arial)`, que no existe en Linux ni Android).
5. **Validar keywords antes de escribir.** En Maestro Calc no se hizo; acá es la fase A.
6. **Fuentes que bloquean la lectura automática no se fuerzan.** Se usa la publicación oficial equivalente.
7. **CI y merges:** una PR por grupo de piezas para ahorrar CI y deploys; nada se mergea sin todo en verde.
8. **Conteos fijados en un solo contrato** y todo lo demás derivado de la tabla de rutas.
9. **Distribución desde el lanzamiento,** programada y no en ráfagas; los Shorts se graban de producción.
10. **Las cuentas son de Rodrigo;** Claude decide lo técnico y prepara cada paso de cuentas.
11. **Disco:** borrar los resultados de e2e locales después de cada corrida.
